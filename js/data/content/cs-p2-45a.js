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
   4.5.1.1  Natural numbers
   ===================================================================== */
C["compsci:4.5.1.1"] = {
  notes: [
    { h: "Natural numbers — the whole topic on one page" },
    "Spec 4.5.1.1: be familiar with the concept of a **natural number** and the set **ℕ** of natural numbers **(including zero)**. ℕ = {0, 1, 2, 3, …}.",
    "Number systems open almost every AS Paper 2 (Question 1) and appear in A-level Paper 2 as lozenge (multiple-choice) and one-line definition questions, often tied to functional programming function types (4.12):",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Pick the natural number from a list", "Shade", "1", "AS 2016 Q01.1, AS 2023 Q01.2"],
      ["Pick the symbol for the set best for counting", "Shade", "1", "AS 2017 Q01.3, AS 2023 Q01.4"],
      ["State whether a number is natural (with other sets)", "Shade two", "2", "AS 2024 Q01.2"],
      ["Distinguish natural numbers from integers, with an example", "Explain / Describe", "1–2", "AS 2019 Q01.1, AS 2022 Q01.1"],
      ["Function type with ℕ as the domain or co-domain", "Shade / Describe", "1", "A-level 2024 Q11.1, 2025 Q11.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The set ℕ** — definition, symbol, the zero rule.", "**Natural numbers in exam questions** — every past-paper shape, answered as the mark scheme credits it.", "**Exam toolkit** — command words, misconceptions, links."] },

    { page: "The set ℕ" },
    { callout: { t: "def", h: "Natural number (AQA wording)", body: "A **natural number** is a positive whole number **including zero**, used for **counting**. The set of natural numbers is written **ℕ** = {0, 1, 2, 3, …}." } },
    { fig: setsFig("N", "ℕ is the innermost set: every natural number is also an integer, a rational number and a real number.") },
    { kv: [
      ["Symbol", "ℕ (a double-struck N)"],
      ["Includes zero?", "**Yes** — at AQA ℕ starts at 0. Some maths textbooks start at 1; in this exam 0 is natural."],
      ["Contains", "0, 1, 2, 3, … 998, 1 000 000 — no negatives, no fractions, no decimals"],
      ["Used for", "**counting** discrete objects: people in a room, items in a list, characters in a string"],
      ["Subset of", "ℤ (integers), ℚ (rationals) and ℝ (reals): ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ"]
    ] },
    { callout: { t: "miscon", h: "\"Natural numbers are positive numbers\"", body: "Two marks are lost here. A natural number is a positive **whole** number (2.5 is positive but not natural), and **0 is natural** at AQA. The mark scheme's own words: *\"Natural numbers are positive numbers (including zero)\"*." } },
    { h: "Why computer scientists care" },
    { ul: [
      "An **unsigned binary integer** (4.5.4.1) stores exactly a range of natural numbers: 8 bits give 0 to 255.",
      "Array **indexes** and **loop counters** are natural numbers; a negative index is an error in most languages.",
      "A function that counts (length of a list, number of nodes) has **ℕ as its co-domain** (4.12.1.1)."
    ] },

    { page: "Natural numbers in exam questions" },
    { worked: { tag: "exam", title: "Which value is a natural number?", src: "AS June 2016 · P2 Q01.1 · 1 mark",
      q: "Table 1 shows four values: A √2, B (−9)², C −4, D 0.5. Shade one lozenge to indicate which of the values is a natural number.",
      steps: [
        { h: "Evaluate before classifying", m: "A: √2 ≈ 1.414… (not whole). B: (−9)² = 81. C: −4 (negative). D: 0.5 (a fraction)." },
        { h: "Apply the definition", m: "Only 81 is a positive whole number: **B**", mk: "1 mark", n: "R. more than one lozenge shaded. The trap is reading (−9)² as negative: squaring removes the sign." }
      ], result: "B" } },
    { worked: { tag: "exam", title: "Natural numbers vs integers, with an example", src: "AS June 2022 · P2 Q01.1 · 2 marks",
      q: "Describe the difference between natural numbers and integers. In your answer, give one example of a number that is an integer but not a natural number.",
      steps: [
        { h: "1 mark — the description (state the difference, linking both sets)", m: "Natural numbers are positive whole numbers including zero, whereas integers also include the negative whole numbers.", mk: "1 mark", n: "The mark scheme accepts either half: \"natural numbers are positive numbers (including zero) // integers include negative numbers\"." },
        { h: "1 mark — the example", m: "−2 (any negative whole number, e.g. −999)", mk: "1 mark", n: "0 is NOT a valid example: it is both natural and an integer." }
      ], result: "Integers include negatives; e.g. −2" } },
    { worked: { tag: "exam", title: "The set for counting people", src: "AS June 2023 · P2 Q01.4 · 1 mark",
      q: "Shade in one lozenge to indicate which of the following symbols represents the set of numbers most suitable for counting the number of people in a room: A ℕ, B ℚ, C ℝ, D ℤ.",
      steps: [
        { h: "What values can the count take?", m: "0, 1, 2, … — never negative, never fractional." },
        { m: "**A (ℕ)**", mk: "1 mark", n: "ℤ is not \"most suitable\": it allows −3 people." }
      ], result: "A (ℕ)" } },
    { worked: { tag: "exam", title: "Two true statements about √25", src: "AS June 2024 · P2 Q01.2 · 2 marks",
      q: "The number 5 can be written as √25. Shade two lozenges to indicate which statements are true: A 15 and 3 are not integers; B 15 and 3 are irrational numbers; C 5 is an irrational number; D 5 is a natural number; E 5 is a rational number.",
      steps: [
        { h: "Test each statement", m: "15 and 3 are integers (A false, B false). √25 = 5 exactly, so it is not irrational (C false). 5 is a positive whole number (D true) and 5 = 5/1 (E true)." },
        { m: "**D**", mk: "1 mark" },
        { m: "**E**", mk: "1 mark", n: "R. more than two lozenges shaded — shading a third, even a wrong guess, loses both marks." }
      ], result: "D and E" } },
    { worked: { tag: "exam", title: "A function type whose domain is ℕ", src: "A-level June 2025 · P2 Q11.2 · 1 mark",
      q: "The Fibonacci function fibonacci 1 = 1; fibonacci 2 = 1; fibonacci n = fibonacci (n − 1) + fibonacci (n − 2) calculates the nth term of the sequence 1, 1, 2, 3, 5, 8, … Shade one lozenge to indicate its function type: A ℕ→ℕ; B ℚ→ℤ; C ℝ→ℤ; D ℤ→ℕ.",
      steps: [
        { h: "Domain — the argument", m: "n is a position in the sequence: a whole number, never negative → ℕ" },
        { h: "Co-domain — the results", m: "every term is a positive whole number → ℕ" },
        { m: "**A (ℕ→ℕ)**", mk: "1 mark", n: "Synoptic: function types are 4.12.1.1 — the type is written domain → co-domain." }
      ], result: "A" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark on this topic"], rows: [
      ["Shade / Identify", "The one correct lozenge — check every value (evaluate squares and roots first)."],
      ["Define", "\"a positive whole number, including zero\" — both *whole* and *including zero*."],
      ["Describe the difference", "One sentence that names both sets and links them: \"…whereas integers also include negative numbers\"."],
      ["Give an example", "A concrete value that meets the condition — not a restated definition."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Natural Zero Counts\"", body: "**N**atural numbers include **Z**ero and are for **C**ounting." } },
    { callout: { t: "warn", h: "Specific errors seen in mark schemes", body: [
      "Saying natural numbers start at 1 (AQA includes 0).",
      "Calling 0.5 or 2.5 natural because they are positive.",
      "Giving 0 as an integer that is not natural.",
      "Treating (−9)² as negative."
    ] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.4.1 unsigned binary represents natural numbers; 4.12.1.1 function types (ℕ → ℕ); 4.4.2.1 sets: ℕ is written as a set and used in set-comprehension, e.g. {x | x ∈ ℕ ∧ x ≥ 1}." } }
  ],
  flashcards: [
    ["Define a natural number.", "A positive whole number, including zero."],
    ["Symbol for the set of natural numbers?", "ℕ."],
    ["Is 0 a natural number at AQA?", "Yes."],
    ["Is 2.5 a natural number?", "No — it is not whole."],
    ["What are natural numbers used for?", "Counting."],
    ["Which binary representation stores natural numbers?", "Unsigned binary."],
    ["Give a number that is an integer but not natural.", "Any negative whole number, e.g. −2."],
    ["Function type of a function that returns the length of a list?", "Its co-domain is ℕ (e.g. [a] → ℕ)."],
    ["Is (−9)² natural?", "Yes — it equals 81."]
  ],
  quiz: [
    { q: "Which value is a natural number?", opts: ["0", "−1", "0.5", "√2"], ans: 0, why: "AQA's ℕ includes zero." },
    { q: "Which set is most suitable for counting people?", opts: ["ℕ", "ℤ", "ℚ", "ℝ"], ans: 0, why: "Counts are non-negative whole numbers." },
    { q: "ℕ is a subset of", opts: ["ℤ, ℚ and ℝ", "only ℤ", "the irrationals", "none of these"], ans: 0, why: "ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ." },
    { q: "Which is NOT a natural number?", opts: ["−4", "81", "998", "1"], ans: 0, why: "Negative." },
    { q: "The function type of a Fibonacci term function is", opts: ["ℕ → ℕ", "ℝ → ℤ", "ℤ → ℕ", "ℚ → ℤ"], ans: 0, why: "Position in, whole positive term out." }
  ]
};

/* =====================================================================
   4.5.1.2  Integer numbers
   ===================================================================== */
C["compsci:4.5.1.2"] = {
  notes: [
    { h: "Integer numbers — the whole topic on one page" },
    "Spec 4.5.1.2: be familiar with the concept of an **integer** and the set **ℤ** of integers. ℤ = {…, −3, −2, −1, 0, 1, 2, 3, …}.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Identify an integer that is not natural", "Shade", "1", "AS 2016 Q01.3"],
      ["Which two numbers belong to ℤ?", "Shade two", "2", "AS 2025 Q01.1"],
      ["A number in ℤ, ℚ, ℝ but not natural or irrational", "Shade", "1", "A-level 2020 Q07.1"],
      ["Explain the difference between ℕ and ℤ", "Explain", "1", "AS 2019 Q01.1"],
      ["Co-domain of a function on integers", "Shade", "1", "A-level 2023 Q12.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The set ℤ**.", "**Integers in exam questions**.", "**Exam toolkit**."] },

    { page: "The set ℤ" },
    { callout: { t: "def", h: "Integer", body: "An **integer** is a **whole number** — positive, negative or zero — with **no fractional part**. The set of integers is **ℤ** = {…, −2, −1, 0, 1, 2, …} (from the German *Zahlen*, numbers)." } },
    { fig: setsFig("Z", "ℤ adds the negative whole numbers to ℕ. It sits inside ℚ: every integer n can be written as n/1.") },
    { table: { head: ["", "ℕ natural", "ℤ integer"], rows: [
      ["0", "✓", "✓"], ["5", "✓", "✓"], ["−5", "✗", "✓"], ["−4.0", "✗", "✓ (it is −4)"], ["2.5", "✗", "✗"]
    ] } },
    { callout: { t: "miscon", h: "\"An integer is a positive whole number\"", body: "That is a natural number. The difference AQA credits is exactly the negatives: **\"the set of integers includes negative (whole) numbers; the set of natural numbers does not\"**." } },
    { ul: [
      "**Two's complement** (4.5.4.3) represents integers: an 8-bit pattern covers −128 to +127.",
      "An integer variable (`int` in C#) stores ℤ values within a fixed range; overflow occurs outside it.",
      "DIV and MOD (integer division and remainder) take and return integers."
    ] },

    { page: "Integers in exam questions" },
    { worked: { tag: "exam", title: "An integer but not a natural number", src: "AS June 2016 · P2 Q01.3 · 1 mark",
      q: "Table 1 shows four values: A √2, B (−9)², C −4, D 0.5. Shade one lozenge to indicate which of the values is an integer but not a natural number.",
      steps: [
        { h: "Integers in the list", m: "(−9)² = 81 and −4" },
        { h: "Remove the natural numbers", m: "81 is natural, so the answer is **C (−4)**", mk: "1 mark" }
      ], result: "C" } },
    { worked: { tag: "exam", title: "Two members of ℤ", src: "AS June 2025 · P2 Q01.1 · 2 marks",
      q: "Which two of the numbers below belong to the set of numbers represented by ℤ? Shade two lozenges. A 0; B √2; C π; D a fraction such as 3/4; E 998.",
      steps: [
        { h: "Whole numbers only", m: "√2 and π are irrational; 3/4 has a fractional part." },
        { m: "**A (0)**", mk: "1 mark", n: "0 is an integer (and a natural number)." },
        { m: "**E (998)**", mk: "1 mark", n: "R. more than two lozenges shaded." }
      ], result: "A and E" } },
    { worked: { tag: "exam", title: "In ℤ, ℚ and ℝ — but not ℕ or irrational", src: "A-level June 2020 · P2 Q07.1 · 1 mark",
      q: "One of the numbers is a member of the set of integers, the set of rational numbers and the set of real numbers, but is not a member of either the set of irrational numbers or the set of natural numbers. Shade one lozenge: A −43; B 12; C a fraction such as 87/9; D 107.834.",
      steps: [
        { h: "Integer but not natural ⇒ a negative whole number", m: "Every integer is automatically rational and real, so only the \"not natural\" condition separates the options." },
        { m: "**A (−43)**", mk: "1 mark", n: "12 is natural; a non-whole fraction and 107.834 are not integers." }
      ], result: "A" } },
    { worked: { tag: "exam", title: "Explain the difference between ℕ and ℤ", src: "AS June 2019 · P2 Q01.1 · 1 mark",
      q: "Explain the difference between the set of natural numbers and the set of integer numbers.",
      steps: [
        { m: "The set of integers includes negative whole numbers, whereas the set of natural numbers does not contain negative numbers.", mk: "1 mark", n: "MAX 1 — saying both halves does not earn a second mark, but it guarantees the one." }
      ], result: "Integers include negatives; natural numbers do not" } },
    { worked: { tag: "exam", title: "The co-domain of a function on integers", src: "A-level June 2023 · P2 Q12.2 · 1 mark",
      q: "FunctionZ [] = 0; FunctionZ (x:xs) = x + 2 * FunctionZ (xs). All of the values in lists passed to FunctionZ are members of the set of integers. Shade one lozenge to indicate the co-domain of the function: A the set of integers; B irrational numbers; C natural numbers; D rational numbers; E real numbers.",
      steps: [
        { h: "What can the result be?", m: "Sums and doubles of integers are integers — and can be negative (e.g. FunctionZ [−1] = −1), so not ℕ." },
        { m: "**A (the set of integers)**", mk: "1 mark", n: "ℤ is closed under + and ×: integer arithmetic never leaves ℤ." }
      ], result: "A" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Shade", "Whole numbers only; zero and negatives included."],
      ["Explain the difference", "Name the negative whole numbers as the difference — in a single linking sentence."],
      ["Give an example", "A negative whole number when asked for \"integer but not natural\"."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Z for Zahlen — whole, with signs\"", body: "ℤ = every whole number with its sign: negatives, zero, positives." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Forgetting that 0 is an integer.", "Saying integers are \"positive and negative numbers\" without *whole* — 2.5 is not an integer.", "Answering \"integer but not natural\" with 0."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.4.3 two's complement stores ℤ; 4.1.1.1 the integer data type; 4.12.1.1 function types such as [ℤ] → ℤ." } }
  ],
  flashcards: [
    ["Define an integer.", "A whole number — positive, negative or zero — with no fractional part."],
    ["Symbol for the integers?", "ℤ."],
    ["Difference between ℕ and ℤ?", "ℤ includes negative whole numbers; ℕ does not."],
    ["Is 0 an integer?", "Yes."],
    ["Is −4.0 an integer?", "Yes — it is −4."],
    ["Which binary representation stores integers?", "Two's complement."],
    ["Is every integer rational?", "Yes — n = n/1."],
    ["Example of an integer that is not natural?", "−2 (any negative whole number)."]
  ],
  quiz: [
    { q: "Which is an integer but not a natural number?", opts: ["−4", "0", "81", "0.5"], ans: 0, why: "Negative whole number." },
    { q: "ℤ contains", opts: ["…, −1, 0, 1, …", "0, 1, 2, … only", "all fractions", "√2"], ans: 0, why: "All whole numbers." },
    { q: "The sum of two integers is always", opts: ["an integer", "a natural number", "irrational", "positive"], ans: 0, why: "ℤ is closed under +." },
    { q: "Which is NOT an integer?", opts: ["107.834", "−43", "12", "0"], ans: 0, why: "It has a fractional part." }
  ]
};

/* =====================================================================
   4.5.1.3  Rational numbers
   ===================================================================== */
C["compsci:4.5.1.3"] = {
  notes: [
    { h: "Rational numbers — the whole topic on one page" },
    "Spec 4.5.1.3: be familiar with the concept of a **rational number** and the set **ℚ** of rational numbers, and that this set **includes the integers**.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Symbol for the set of rational numbers", "Shade", "1", "AS 2017 Q01.1, AS 2024 Q01.3"],
      ["Description matching the rationals", "Shade", "1", "AS 2018 Q01 (table)"],
      ["Explain rational vs irrational", "Explain", "1", "AS 2019 Q01.2"],
      ["Classify a fraction across all five sets", "Shade (table)", "2", "A-level 2018 Q09.1"],
      ["Is √25 rational?", "Shade two", "2", "AS 2024 Q01.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The set ℚ**.", "**Rational numbers in exam questions**.", "**Exam toolkit**."] },

    { page: "The set ℚ" },
    { callout: { t: "def", h: "Rational number (AQA wording)", body: "A **rational number** is any number that can be **expressed as a fraction** — one **integer divided by another** (non-zero) integer, p/q. The set is **ℚ** (for *quotient*). It **includes the integers**, because n = n/1." } },
    { fig: setsFig("Q", "ℚ contains ℤ (and so ℕ) plus every fraction. Terminating and recurring decimals are rational: 0.5 = 1/2, 0.333… = 1/3.") },
    { table: { head: ["Number", "As p/q", "Rational?"], rows: [
      ["0.5", "1/2", "✓"], ["−0.75", "−3/4", "✓"], ["0.333…", "1/3", "✓ (recurring)"], ["7", "7/1", "✓ (integer)"], ["√25", "5/1", "✓ (it is 5)"], ["√2", "—", "✗ irrational"]
    ] } },
    { callout: { t: "miscon", h: "\"Rational numbers are decimals\"", body: "Many decimals are rational, but the defining property is the **fraction of two integers**. A decimal that never terminates or repeats (π) is irrational; 0.142857142857… repeats, so it is 1/7 — rational." } },
    { h: "Why it matters in computing" },
    { ul: ["Binary fractions can represent exactly only rationals whose denominator is a power of 2: 3/8 = 0.011₂ exactly, but 1/10 = 0.0001100110011…₂ recurs forever (4.5.4.5 rounding errors).", "So a rational number is not always exactly representable in binary — a classic source of rounding error."] },

    { page: "Rational numbers in exam questions" },
    { worked: { tag: "exam", title: "The symbol for ℚ", src: "AS June 2024 · P2 Q01.3 · 1 mark",
      q: "Shade one lozenge to indicate which of the symbols represents the set of rational numbers: A ℂ; B ℕ; C ℚ; D ℝ; E ℤ.",
      steps: [{ m: "**C (ℚ)** — Q for quotient", mk: "1 mark", n: "ℂ (complex numbers) is not on the AQA specification." }],
      result: "C" } },
    { worked: { tag: "exam", title: "Rational vs irrational", src: "AS June 2019 · P2 Q01.2 · 1 mark",
      q: "Explain the difference between rational and irrational numbers.",
      steps: [{ m: "Rational numbers can be expressed as a fraction (one integer divided by another); irrational numbers cannot be expressed as a fraction.", mk: "1 mark", n: "MAX 1. \"Irrational numbers have infinite decimals\" is not enough — 1/3 has an infinite decimal and is rational." }],
      result: "Rationals can be written as a fraction of integers; irrationals cannot" } },
    { worked: { tag: "exam", title: "Classify 15/23 and 108 in every set", src: "A-level June 2018 · P2 Q09.1 · 2 marks",
      q: "For each number, shade every set (Natural, Integer, Rational, Irrational, Real) that contains it. The first row shows π: Irrational and Real only. Rows: 15/23 and 108.",
      steps: [
        { h: "15/23", m: "a fraction of integers that is not whole → **Rational, Real**", mk: "1 mark" },
        { h: "108", m: "a positive whole number → **Natural, Integer, Rational, Real**", mk: "1 mark", n: "R. answers in which additional lozenges are shaded — 108 is not irrational." }
      ], result: "15/23: ℚ, ℝ. 108: ℕ, ℤ, ℚ, ℝ" } },
    { worked: { tag: "exam", title: "Which description is the rationals?", src: "AS June 2018 · P2 Q01 · 1 mark",
      q: "Table 1 describes three sets: A — all possible real-world quantities; B — numbers that can be written as fractions (ratios of integers); C — numbers that cannot be written as fractions. Which describes the set of rational numbers?",
      steps: [{ m: "**B** — \"ratios of integers\" is the definition of ℚ", mk: "1 mark", n: "A is ℝ, C is the irrationals." }],
      result: "B" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Define", "\"Can be expressed as a fraction / one integer divided by another\"."],
      ["Explain the difference (rational/irrational)", "One sentence with both sides: *can* vs *cannot* be written as a fraction of integers."],
      ["Shade all sets", "Climb the chain: a natural number also ticks ℤ, ℚ, ℝ."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Q is for Quotient\"", body: "A rational is a **quotient** of two integers." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Leaving the integers out of ℚ.", "Defining rational as \"a decimal\" or \"a fraction\" without *of integers*.", "Calling recurring decimals irrational."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.4.4–4.5.4.5: binary can represent exactly only fractions with power-of-2 denominators — the root of rounding error." } }
  ],
  flashcards: [
    ["Define a rational number.", "A number that can be expressed as a fraction — one integer divided by another."],
    ["Symbol for the rationals?", "ℚ."],
    ["Does ℚ include the integers?", "Yes — n = n/1."],
    ["Is 0.333… rational?", "Yes — it is 1/3."],
    ["Is 15/23 an integer?", "No — rational and real only."],
    ["Can every rational be stored exactly in binary?", "No — only those with a power-of-2 denominator (1/10 recurs)."],
    ["Difference between rational and irrational?", "Rationals can be written as a fraction of integers; irrationals cannot."],
    ["Is √25 rational?", "Yes — it is 5."]
  ],
  quiz: [
    { q: "Which symbol is the set of rational numbers?", opts: ["ℚ", "ℝ", "ℤ", "ℕ"], ans: 0, why: "Quotient." },
    { q: "Which number is rational?", opts: ["0.75", "√2", "π", "e"], ans: 0, why: "3/4." },
    { q: "108 belongs to", opts: ["ℕ, ℤ, ℚ and ℝ", "ℚ and ℝ only", "ℤ only", "the irrationals"], ans: 0, why: "A natural number is in every enclosing set." },
    { q: "1/10 in binary is", opts: ["a recurring fraction", "0.1 exactly", "irrational", "0.0001 exactly"], ans: 0, why: "Its denominator is not a power of 2." }
  ]
};

/* =====================================================================
   4.5.1.4  Irrational numbers
   ===================================================================== */
C["compsci:4.5.1.4"] = {
  notes: [
    { h: "Irrational numbers — the whole topic on one page" },
    "Spec 4.5.1.4: be familiar with the concept of an **irrational number** — a number that **cannot be represented as a fraction** p/q of integers.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Pick the irrational value", "Shade", "1", "AS 2016 Q01.2, AS 2023 Q01.1"],
      ["Description that matches the irrationals", "Shade", "1", "AS 2018 Q01.2"],
      ["Describe irrational, with an example", "Describe", "2", "AS 2022 Q01.2"],
      ["Rational vs irrational", "Explain", "1", "AS 2019 Q01.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Irrational numbers**.", "**Irrational numbers in exam questions**.", "**Exam toolkit**."] },

    { page: "Irrational numbers" },
    { callout: { t: "def", h: "Irrational number (AQA wording)", body: "An **irrational number** is a number that **cannot be written as a fraction / ratio / quotient** with an integer numerator and an integer denominator. Its decimal expansion never terminates and never repeats. Examples: **√2, π, e**." } },
    { fig: setsFig("I", "The irrationals fill the part of ℝ outside ℚ. There is no special AQA symbol for them — they are \"ℝ but not ℚ\".") },
    { table: { head: ["Value", "Irrational?", "Why"], rows: [
      ["√2", "✓", "no fraction squares to exactly 2"],
      ["π", "✓", "non-terminating, non-repeating"],
      ["√25", "✗", "= 5"],
      ["0.333…", "✗", "= 1/3"],
      ["3.14159", "✗", "a terminating decimal is a fraction (314159/100000)"]
    ] } },
    { callout: { t: "miscon", h: "\"A value written to many decimal places is irrational\"", body: "The mark scheme rejects *\"any value expressed to a fixed number of decimal places\"* as an example: 1.41421356 is rational. Give the exact form — **√2**, **π** or **e**." } },
    { h: "Why it matters in computing" },
    "No finite number of bits can store an irrational number exactly; a computer stores the nearest representable value. So π in a `double` is a rational approximation — every calculation with it carries a rounding error (4.5.4.5–4.5.4.6).",

    { page: "Irrational numbers in exam questions" },
    { worked: { tag: "exam", title: "Pick the irrational number", src: "AS June 2023 · P2 Q01.1 · 1 mark",
      q: "Shade in one lozenge to indicate which of the following values is an irrational number: A a fraction; B √2; C 73; D −19.",
      steps: [{ m: "**B (√2)**", mk: "1 mark", n: "73 and −19 are integers; a fraction is rational by definition." }], result: "B" } },
    { worked: { tag: "exam", title: "Describe irrational, with an example", src: "AS June 2022 · P2 Q01.2 · 2 marks",
      q: "Describe what it means for a number to be irrational. In your answer, give one example of an irrational number.",
      steps: [
        { h: "1 mark — the description", m: "An irrational number cannot be written as a fraction (with an integer numerator and an integer denominator).", mk: "1 mark" },
        { h: "1 mark — the example", m: "√2 (or π, or e)", mk: "1 mark", n: "R. a value written to a fixed number of decimal places, such as 3.142." }
      ], result: "Cannot be written as a fraction of integers; e.g. √2" } },
    { worked: { tag: "exam", title: "Which description is the irrationals?", src: "AS June 2018 · P2 Q01.2 · 1 mark",
      q: "Table 1: A — all possible real-world quantities; B — numbers that can be written as fractions (ratios of integers); C — numbers that cannot be written as fractions (ratios of integers). Which describes the set of irrational numbers?",
      steps: [{ m: "**C**", mk: "1 mark" }], result: "C" } },
    { worked: { tag: "variation", title: "Is it irrational? Four quick checks", q: "Classify (a) √49, (b) √3, (c) 22/7, (d) π.",
      steps: [
        { m: "(a) √49 = 7: rational (and natural)." },
        { m: "(b) √3: irrational — 3 is not a perfect square." },
        { m: "(c) 22/7: rational — it is a fraction (only an approximation of π)." },
        { m: "(d) π: irrational." }
      ], result: "(b) and (d)" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe", "\"cannot be written as a fraction / ratio of two integers\"."],
      ["Give an example", "An exact symbol: √2, π, e — never a rounded decimal."],
      ["Shade", "Evaluate roots: a square root of a perfect square is rational."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Ir-ratio-nal: no ratio\"", body: "An **ir-ratio-nal** number has **no ratio** of integers." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Writing 3.142 as the example.", "Thinking every square root is irrational.", "Calling 22/7 irrational (it approximates π but is a fraction)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.4.5 rounding errors and 4.5.4.6 absolute/relative error: irrationals can only be approximated in binary." } }
  ],
  flashcards: [
    ["Define an irrational number.", "A number that cannot be written as a fraction of two integers."],
    ["Three examples of irrational numbers?", "√2, π, e."],
    ["Is √25 irrational?", "No — it equals 5."],
    ["Is 3.142 an acceptable example?", "No — it is a terminating decimal, so rational."],
    ["Can a computer store π exactly?", "No — only a rational approximation in a finite number of bits."],
    ["Are irrationals real numbers?", "Yes — ℝ is the rationals plus the irrationals."],
    ["Is 22/7 irrational?", "No — it is a fraction."],
    ["Decimal expansion of an irrational?", "Never terminates and never repeats."]
  ],
  quiz: [
    { q: "Which is irrational?", opts: ["√2", "√49", "0.25", "−19"], ans: 0, why: "2 is not a perfect square." },
    { q: "An acceptable example of an irrational number is", opts: ["π", "3.14159", "22/7", "1/3"], ans: 0, why: "The exact symbol." },
    { q: "Irrational numbers are", opts: ["real but not rational", "integers", "natural", "fractions"], ans: 0, why: "ℝ outside ℚ." },
    { q: "0.333… is", opts: ["rational", "irrational", "an integer", "natural"], ans: 0, why: "1/3." }
  ]
};

/* =====================================================================
   4.5.1.5  Real numbers
   ===================================================================== */
C["compsci:4.5.1.5"] = {
  notes: [
    { h: "Real numbers — the whole topic on one page" },
    "Spec 4.5.1.5: be familiar with the concept of a **real number**: a possible **real-world quantity**. The set **ℝ** is the set of all \"possible real-world quantities\".",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Define / describe the set of real numbers", "Define / Describe", "1", "AS 2023 Q01.3, AS 2024 Q01.1"],
      ["Description that matches ℝ", "Shade", "1", "AS 2018 Q01.1"],
      ["Set best for measuring (circumference, rope)", "Shade", "1", "AS 2017 Q01.3, A-level 2020 Q07.2"],
      ["Why reals suit measurement better than naturals", "Explain", "1", "AS 2025 Q01.3"],
      ["Describe the co-domain ℝ of a function", "Describe", "1", "A-level 2024 Q11.1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The set ℝ**.", "**Real numbers in exam questions**.", "**Exam toolkit**."] },

    { page: "The set ℝ" },
    { callout: { t: "def", h: "Real number (AQA wording)", body: "The **real numbers ℝ** are the set of **all possible real-world quantities**: every value along an infinite **number line**. ℝ **includes the rational and the irrational numbers** (and so the integers and natural numbers). It excludes imaginary/complex numbers." } },
    { fig: setsFig("R", "ℝ is the outermost set on the specification: ℚ together with the irrationals.") },
    { kv: [
      ["Acceptable definitions (any one)", "the set of all possible real-world quantities // all rational and irrational numbers // any value along an (infinite) number line // all numbers excluding imaginary/complex numbers"],
      ["Not enough (NE.)", "writing just the symbol ℝ"],
      ["Talk-out (TO.)", "stating \"real numbers\" and then describing a different set"]
    ] },
    { callout: { t: "miscon", h: "\"Real numbers are numbers that exist\" / \"decimals\"", body: "Too vague for the mark. Use the AQA phrase **\"all possible real-world quantities\"** or **\"the rational and irrational numbers\"**." } },
    { h: "In computing" },
    "Programming languages call their floating point types `real`, `float` or `double`. They approximate ℝ: the set is infinite and continuous, but a fixed number of bits gives only finitely many values (4.5.4.7 range and precision).",

    { page: "Real numbers in exam questions" },
    { worked: { tag: "exam", title: "Define the set of real numbers", src: "AS June 2023 · P2 Q01.3 · 1 mark",
      q: "Define the set of real numbers.",
      steps: [{ m: "The set of all possible real-world quantities // all rational and irrational numbers.", mk: "1 mark", n: "MAX 1. A. a value that represents any quantity along an infinite number line. A. all numbers excluding imaginary/complex numbers." }],
      result: "All possible real-world quantities" } },
    { worked: { tag: "exam", title: "Why reals for measurement?", src: "AS June 2025 · P2 Q01.3 · 1 mark",
      q: "Explain why real numbers are better suited to representing measurements of some quantities than natural numbers.",
      steps: [{ m: "Real-world measurements are not necessarily whole numbers — natural numbers have no fractional part to represent continuous quantities (and cannot represent negative values).", mk: "1 mark", n: "\"Explain\" needs the reason: name the property natural numbers lack." }],
      result: "Measurements need fractional (and negative) values" } },
    { worked: { tag: "exam", title: "The set for the length of a rope", src: "A-level June 2020 · P2 Q07.2 · 1 mark",
      q: "Shade one lozenge to indicate which type of number would be most appropriate to use to measure the length of an item, such as a piece of rope: A Integer; B Irrational; C Natural; D Rational; E Real.",
      steps: [{ m: "**E (Real)** — length is a continuous measurement", mk: "1 mark" }], result: "E" } },
    { worked: { tag: "exam", title: "Describe the co-domain of f: ℕ → ℝ", src: "A-level June 2024 · P2 Q11.1 · 1 mark",
      q: "A functional programming function f has the function type f: ℕ → ℝ. Describe the co-domain of the function f.",
      steps: [{ m: "The co-domain is the set of real numbers (all possible real-world quantities) — the set from which f's output values are taken.", mk: "1 mark", n: "NE. just writing ℝ. TO. stating real numbers and then describing another set." }],
      result: "The set of real numbers" } },
    { worked: { tag: "exam", title: "Counting and measuring columns", src: "AS June 2022 · P2 Q01.3 · 2 marks",
      q: "Shade one lozenge in the Counting column to indicate which set of numbers is most suitable for counting, and one in the Measuring column for measuring real-world quantities: A Integer; B Natural; C Rational; D Real.",
      steps: [{ m: "Counting: **B (Natural)**", mk: "1 mark" }, { m: "Measuring: **D (Real)**", mk: "1 mark", n: "R. more than one lozenge in a column." }], result: "B; D" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Define / Describe", "\"all possible real-world quantities\" or \"rational and irrational numbers\" — not the symbol alone."],
      ["Explain (measurement)", "Measurements can be non-whole (and negative), which ℕ cannot represent."],
      ["Describe the co-domain", "Name the set the outputs are drawn from, in words."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "The chain, innermost first: \"No Zebra Quietly Roars\"", body: "**ℕ** ⊂ **ℤ** ⊂ **ℚ** ⊂ **ℝ** — with the irrationals filling ℝ outside ℚ." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Writing \"ℝ\" as the definition (NE.).", "Choosing ℚ for measurement — lengths can be irrational (the diagonal of a unit square is √2).", "Describing the domain when the co-domain was asked."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.4.4–4.5.4.9 fixed and floating point approximate ℝ; 4.12.1.1 domain and co-domain; 4.5.1.7 counting vs measurement." } }
  ],
  flashcards: [
    ["Define the set of real numbers.", "All possible real-world quantities (all rational and irrational numbers)."],
    ["Symbol for the reals?", "ℝ."],
    ["Which set is best for measurement?", "ℝ."],
    ["Is √2 a real number?", "Yes — irrationals are real."],
    ["Why can a computer not store all of ℝ?", "ℝ is infinite and continuous; finite bits give finitely many values."],
    ["Is \"ℝ\" alone an acceptable definition?", "No — not enough."],
    ["What does ℝ exclude?", "Imaginary/complex numbers."],
    ["Co-domain of f: ℕ → ℝ?", "The set of real numbers."]
  ],
  quiz: [
    { q: "The most suitable set for measuring a rope's length is", opts: ["ℝ", "ℕ", "ℤ", "ℚ"], ans: 0, why: "Continuous measurement." },
    { q: "ℝ contains", opts: ["rationals and irrationals", "only integers", "only fractions", "only positives"], ans: 0, why: "Definition." },
    { q: "In f: ℕ → ℝ the co-domain is", opts: ["ℝ", "ℕ", "ℤ", "f"], ans: 0, why: "After the arrow." },
    { q: "Which is NOT real (at AQA)?", opts: ["an imaginary number", "π", "−7", "0.5"], ans: 0, why: "ℝ excludes imaginary numbers." }
  ]
};

/* =====================================================================
   4.5.1.6  Ordinal numbers
   ===================================================================== */
C["compsci:4.5.1.6"] = {
  notes: [
    { h: "Ordinal numbers — the whole topic on one page" },
    "Spec 4.5.1.6: be familiar with the concept of **ordinal numbers** and their use to describe the **numerical positions of objects**.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["What is meant by an ordinal number?", "Describe / What is", "1", "AS 2023 Q01.5, AS 2025 Q01.2"],
      ["Describe ordinal numbers and their use for an array", "Describe", "2", "A-level 2018 Q09.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Ordinal vs cardinal**.", "**Ordinal numbers in exam questions**.", "**Exam toolkit**."] },

    { page: "Ordinal vs cardinal" },
    { callout: { t: "def", h: "Ordinal number (AQA wording)", body: "An **ordinal number** represents / describes the **position** (index) of an object in an **ordered sequence**: 1st, 2nd, 3rd, … It answers \"which one?\", not \"how many?\"." } },
    { fig: bitsFig(["201", "17", "−4", "58", "9", "330", "41", "6"], [0, 1, 2, 3, 4, 5, 6, 7], { cw: 58, cap: "An array of eight values: the indexes 0–7 above the cells are ordinal — they give each value's position. The count, 8, is cardinal." }) },
    { table: { head: ["", "Ordinal", "Cardinal (counting)"], rows: [
      ["Answers", "Which position?", "How many?"],
      ["Example", "\"the 3rd element\", index 2", "\"8 elements\""],
      ["In code", "`arr[2]`, the loop variable as a position", "`arr.Length`, a counter"]
    ] } },
    { callout: { t: "miscon", h: "\"Ordinal numbers are numbers in order\"", body: "Not enough — 1, 2, 3 written in order are still just natural numbers. The concept is **position**: an ordinal says *where* an item is in a sequence. If you answer by example, AQA requires **at least three** (1st, 2nd, 3rd)." } },
    { h: "Zero-based positions" },
    "Most languages index arrays from 0, so the 1st element has index 0. Both are ordinal: 0 is still a position. Off-by-one errors come from mixing the two conventions.",

    { page: "Ordinal numbers in exam questions" },
    { worked: { tag: "exam", title: "What is meant by an ordinal number?", src: "AS June 2023 · P2 Q01.5 · 1 mark",
      q: "What is meant by the term ordinal number?",
      steps: [{ m: "A number used to represent the position of an object/item in an ordered sequence.", mk: "1 mark", n: "A. by example (1st, 2nd, 3rd …) as long as at least three are given." }],
      result: "A number describing a position in an ordered sequence" } },
    { worked: { tag: "exam", title: "Ordinal numbers and an array", src: "A-level June 2018 · P2 Q09.2 · 2 marks",
      q: "Figure 10 shows a list of eight numbers stored in an array with indexes [0] to [7]. Describe what an ordinal number is and what an ordinal number would be used for in the context of this array.",
      steps: [
        { h: "What is (AO1 knowledge)", m: "An ordinal number shows order / position / rank;", mk: "1 mark" },
        { h: "Use in the array (AO1 understanding)", m: "the ordinal numbers would represent the position / index of each value in the array;", mk: "1 mark", n: "The second mark must be applied to the array — \"the index [0]–[7]\"." }
      ], result: "Position; the array indexes" } },
    { worked: { tag: "variation", title: "Ordinal or cardinal?", q: "Classify the number in each: (a) the 5th character of a string; (b) a string has 12 characters; (c) `scores[3]`; (d) the loop ran 10 times.",
      steps: [{ m: "(a) ordinal (position); (b) cardinal (count); (c) ordinal (index 3); (d) cardinal (count)." }], result: "(a), (c) ordinal" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["What is meant by / Describe", "\"position in an ordered sequence\" — the word *position* (or index/rank)."],
      ["Describe … in the context of", "A second sentence applying it: \"the indexes of the array\"."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"ORDinal = ORDer position\"", body: "Ordinal → order → position. Cardinal → count." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"Numbers in order\" (NE.).", "Giving only one or two examples (needs three).", "Not applying it to the array when asked \"in the context of\"."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.1 arrays and indexes; 4.1.1.2 iteration — a FOR loop's variable as a position." } }
  ],
  flashcards: [
    ["Define an ordinal number.", "A number that describes the position of an object in an ordered sequence."],
    ["Ordinal vs cardinal?", "Ordinal = position (which); cardinal = quantity (how many)."],
    ["Examples of ordinal numbers?", "1st, 2nd, 3rd (at least three if answering by example)."],
    ["Are array indexes ordinal?", "Yes — they give each element's position."],
    ["Is the length of an array ordinal?", "No — it is a count (cardinal)."],
    ["Index of the 1st element in a zero-based array?", "0."],
    ["Is \"numbers in order\" enough?", "No — the idea of position is required."],
    ["What causes an off-by-one error?", "Mixing 0-based and 1-based positions."]
  ],
  quiz: [
    { q: "An ordinal number describes", opts: ["a position", "a quantity", "a measurement", "a fraction"], ans: 0, why: "Definition." },
    { q: "In `arr[2]` the 2 is", opts: ["ordinal", "cardinal", "irrational", "a measurement"], ans: 0, why: "An index." },
    { q: "\"There are 8 items\" uses 8 as", opts: ["a cardinal number", "an ordinal number", "an index", "a position"], ans: 0, why: "A count." },
    { q: "Answering by example needs at least", opts: ["three examples", "one", "two", "five"], ans: 0, why: "Mark scheme rule." }
  ]
};

/* =====================================================================
   4.5.1.7  Counting and measurement
   ===================================================================== */
C["compsci:4.5.1.7"] = {
  notes: [
    { h: "Counting and measurement — the whole topic on one page" },
    "Spec 4.5.1.7: be familiar with the use of **natural numbers for counting** and **real numbers for measurement**.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Most suitable set for counting / measuring", "Shade", "1–2", "AS 2022 Q01.3, AS 2023 Q01.4"],
      ["Set for measuring a circumference / rope", "Shade", "1", "AS 2017 Q01.3, A-level 2020 Q07.2"],
      ["Why reals suit measurement better", "Explain", "1", "AS 2025 Q01.3"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Discrete and continuous**.", "**Counting and measurement in exam questions**.", "**Exam toolkit**."] },

    { page: "Discrete and continuous" },
    { table: { head: ["", "Counting", "Measurement"], rows: [
      ["Kind of quantity", "**discrete** — separate, whole items", "**continuous** — any value in a range"],
      ["Set", "**ℕ** natural numbers", "**ℝ** real numbers"],
      ["Example", "people in a room, files in a folder, packets sent", "length, time, temperature, voltage"],
      ["Binary representation", "unsigned (or two's complement) integer", "fixed or floating point"],
      ["Exact?", "yes, within range", "approximate — rounding errors"]
    ] } },
    { fig: { x: [-0.3, 5.3], y: [-0.6, 1.2], w: 500, h: 150, axes: false,
      items: [
        { text: [0, 0.4], t: "0", size: 11, c: "muted" }, { text: [1, 0.4], t: "1", size: 11, c: "muted" }, { text: [2, 0.4], t: "2", size: 11, c: "muted" }, { text: [3, 0.4], t: "3", size: 11, c: "muted" }, { text: [4, 0.4], t: "4", size: 11, c: "muted" }, { text: [5, 0.4], t: "5", size: 11, c: "muted" },
        { pt: [0, 0.6], r: 5, c: "accent" }, { pt: [1, 0.6], r: 5, c: "accent" }, { pt: [2, 0.6], r: 5, c: "accent" }, { pt: [3, 0.6], r: 5, c: "accent" }, { pt: [4, 0.6], r: 5, c: "accent" }, { pt: [5, 0.6], r: 5, c: "accent" },
        { text: [2.5, 0.95], t: "counting (ℕ): separate points", c: "accent", b: true, size: 12 },
        { line: [[0, 0.15], [5, 0.15]], c: "accent2", w: 5 },
        { text: [2.5, -0.25], t: "measuring (ℝ): every value on the line", c: "accent2", b: true, size: 12 }
      ], cap: "Counting picks out separate whole values; measuring can land anywhere on the line." } },
    { callout: { t: "miscon", h: "\"Integers are best for counting\"", body: "Integers can count, but the **most suitable** set is ℕ — a count cannot be negative. Likewise ℚ is not \"most suitable\" for measuring: a measured length can be irrational (√2 m)." } },

    { page: "Counting and measurement in exam questions" },
    { worked: { tag: "exam", title: "Counting column and measuring column", src: "AS June 2022 · P2 Q01.3 · 2 marks",
      q: "Shade one lozenge in the Counting column and one in the Measuring column: A Integer; B Natural; C Rational; D Real.",
      steps: [{ m: "Counting: **B (Natural)**", mk: "1 mark" }, { m: "Measuring: **D (Real)**", mk: "1 mark" }], result: "B; D" } },
    { worked: { tag: "exam", title: "The set for the circumference of a ball", src: "AS June 2017 · P2 Q01.3 · 1 mark",
      q: "Shade in one lozenge to indicate which of the symbols represents the set of numbers that is most suitable for measuring the circumference of a ball.",
      steps: [{ m: "**ℝ** — a circumference is a continuous measurement (and involves π, which is irrational)", mk: "1 mark" }], result: "ℝ" } },
    { worked: { tag: "exam", title: "Why reals for measurement?", src: "AS June 2025 · P2 Q01.3 · 1 mark",
      q: "Explain why real numbers are better suited to representing measurements of some quantities than natural numbers.",
      steps: [{ m: "Measurements of real-world quantities are not necessarily whole (or positive): natural numbers have no fractional part, so they cannot represent continuous quantities.", mk: "1 mark" }], result: "Measurements may be non-whole" } },
    { worked: { tag: "variation", title: "Choose the set and the data type", q: "For each, give the most suitable set and a C# data type: (a) number of students in a class; (b) a student's height; (c) a temperature in °C; (d) a bank balance in pence.",
      steps: [
        { m: "(a) ℕ — `int` (or `uint`)" }, { m: "(b) ℝ — `double`" }, { m: "(c) ℝ — `double` (it can be negative and fractional)" },
        { m: "(d) ℤ — `long`/`int`: whole pence, may be negative (overdrawn) — storing money as whole pence avoids floating point rounding errors" }
      ], result: "ℕ, ℝ, ℝ, ℤ" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Shade (counting/measuring)", "Counting → ℕ; measuring → ℝ."],
      ["Explain", "Name the missing property: fractional part (and negatives) for measurement."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Count Naturally, Measure Really\"", body: "**C**ount with **ℕ**, **M**easure with **ℝ**." } },
    { callout: { t: "warn", h: "Specific errors", body: ["ℤ for counting.", "ℚ for measuring.", "Explaining with \"real numbers are more accurate\" — say *why*: fractional parts."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.6.2 analogue vs digital (continuous vs discrete) and 4.5.6.3 ADC: measurement is continuous until it is sampled." } }
  ],
  flashcards: [
    ["Set for counting?", "ℕ (natural numbers)."],
    ["Set for measuring?", "ℝ (real numbers)."],
    ["Counting quantities are…?", "Discrete."],
    ["Measured quantities are…?", "Continuous."],
    ["Why not ℤ for counting?", "A count can never be negative — ℕ is most suitable."],
    ["Why not ℚ for measuring?", "Measurements can be irrational (e.g. √2)."],
    ["Binary representation for counts?", "Unsigned binary integers."],
    ["Binary representation for measurements?", "Fixed or floating point."]
  ],
  quiz: [
    { q: "Most suitable set for the number of files in a folder", opts: ["ℕ", "ℝ", "ℚ", "ℤ"], ans: 0, why: "A count." },
    { q: "Most suitable set for a temperature reading", opts: ["ℝ", "ℕ", "ℤ", "ordinal"], ans: 0, why: "Continuous measurement." },
    { q: "Measured quantities are", opts: ["continuous", "discrete", "ordinal", "natural"], ans: 0, why: "Any value in a range." },
    { q: "Money is best stored as", opts: ["whole pence integers", "a double in pounds", "an irrational", "ordinal"], ans: 0, why: "Avoids rounding errors." }
  ]
};

/* =====================================================================
   4.5.2.1  Number base
   ===================================================================== */
C["compsci:4.5.2.1"] = {
  notes: [
    { h: "Number bases — the whole topic on one page" },
    "Spec 4.5.2.1: be familiar with the concept of a **number base**, in particular **decimal (base 10)**, **binary (base 2)** and **hexadecimal (base 16)**; convert between them; know that computers use **binary** to represent all data and instructions; explain the use of **hexadecimal as a shorthand for binary** and understand why it is used in this way.",
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
    "Replace each hex digit by its 4-bit pattern: C9₁₆ → 1100 1001₂.",
    { h: "2.3  Binary or hex → decimal" },
    "Multiply each digit by its place value and add: C57₁₆ = 12×256 + 5×16 + 7 = 3072 + 80 + 7 = **3159**.",
    { h: "2.4  Decimal → binary or hex: repeated division" },
    { steps: [
      { h: "1.", m: "Divide by the base; record the **remainder** (MOD) — it is the next digit, from the **right**." },
      { h: "2.", m: "Replace the number by the **quotient** (DIV)." },
      { h: "3.", m: "Repeat until the quotient is 0; read the remainders bottom-to-top." }
    ] },
    { table: { head: ["193 DIV 16", "remainder (MOD 16)", "digit"], rows: [["193 ÷ 16 = 12", "1", "1 (rightmost)"], ["12 ÷ 16 = 0", "12", "C"]] } },
    "So 193₁₀ = **C1₁₆**. (Or subtract place values: 193 = 128 + 64 + 1 = 1100 0001₂ = C1₁₆.)",
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
    "The key line is **Number ← Number × 16 + Value** (Horner's method): each new digit shifts the running total one hexadecimal column left, then adds the digit. Left to right, it rebuilds the place values without powers.",
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

/* =====================================================================
   4.5.3.1  Bits and bytes
   ===================================================================== */
C["compsci:4.5.3.1"] = {
  notes: [
    { h: "Bits and bytes — the whole topic on one page" },
    "Spec 4.5.3.1: know that the **bit is the fundamental unit of information**; a **byte is a group of 8 bits**; know that **2ⁿ different values can be represented with n bits**.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["How many values can n bits / bytes represent?", "How many", "1", "AS 2020 Q01.2 (two bytes), AS 2023 Q02.2 (10 bits), AS 2025 Q02.1 (one byte)"],
      ["Addressable memory from an address bus width", "What is the maximum", "1–2", "A-level 2019 Q12.1, AS 2022 Q08.5, A-level 2024 Q03.5"],
      ["Locations addressable by an operand", "How many", "1", "A-level 2020 Q09.1"],
      ["Bits needed for n colours / values (log₂)", "Calculate", "inside image questions", "A-level 2021 Q01.1, 2024 Q02.1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Bits, nibbles, bytes and 2ⁿ**.", "**2ⁿ in exam questions** — values, addresses, colours.", "**Exam toolkit**."] },

    { page: "Bits, nibbles, bytes and 2ⁿ" },
    { kv: [
      ["Bit", "a **b**inary dig**it**, 0 or 1 — the **fundamental unit of information**"],
      ["Nibble", "4 bits — one hexadecimal digit"],
      ["Byte", "**8 bits**"],
      ["Word", "the number of bits the processor handles as a unit (e.g. 32 or 64) — see 4.7.3.7"]
    ] },
    { callout: { t: "formula", h: "n bits give 2ⁿ different values", body: [
      "Each extra bit **doubles** the number of patterns: 1 bit → 2, 2 bits → 4, 3 bits → 8 … n bits → **2ⁿ**.",
      "Unsigned, those values are 0 to **2ⁿ − 1** (the count includes 0).",
      "Working backwards: to represent k different values you need **⌈log₂ k⌉** bits."
    ] } },
    { fig: { w: 520, h: 150, items: (function () {
      var it = [], pats = ["000", "001", "010", "011", "100", "101", "110", "111"];
      pats.forEach(function (p, i) { var x = 18 + i * 62; it.push({ poly: [[x, 30], [x + 54, 30], [x + 54, 66], [x, 66]], fill: "accent", alpha: 0.12 + i * 0.04, c: "line", w: 1.2 }, { text: [x + 27, 48], t: p, b: true, c: "text" }, { text: [x + 27, 84], t: String(i), c: "muted", size: 12 }); });
      it.push({ text: [260, 120], t: "3 bits → 2³ = 8 patterns, values 0 to 7", b: true, c: "accent2", size: 13 });
      return it;
    })(), cap: "Every bit pattern of length 3: eight of them, so the largest unsigned value is 2³ − 1 = 7." } },
    { table: { head: ["n", "2ⁿ", "where you meet it"], rows: [
      ["8", "256", "one byte; 8-bit colour; ASCII extended"], ["10", "1024", "1 KiB"], ["16", "65 536", "two bytes; 16-bit sound"], ["24", "16 777 216", "24-bit \"true colour\""], ["32", "4 294 967 296", "32-bit addresses (4 GiB)"]
    ] } },
    { callout: { t: "miscon", h: "\"8 bits can represent 255 values\"", body: "8 bits represent **256** different values; the **largest** unsigned value is 255 because the values start at 0. Keep \"how many values\" (2ⁿ) and \"highest value\" (2ⁿ − 1) apart." } },

    { page: "2ⁿ in exam questions" },
    { worked: { tag: "exam", title: "Values in two bytes", src: "AS June 2020 · P2 Q01.2 · 1 mark",
      q: "How many different values can be represented using two bytes?",
      steps: [{ h: "Two bytes = 16 bits", m: "2¹⁶ = **65 536**", mk: "1 mark", n: "Mark scheme: 2¹⁶ // 65 536 — either form." }], result: "65 536" } },
    { worked: { tag: "exam", title: "Values in 10 bits", src: "AS June 2023 · P2 Q02.2 · 1 mark",
      q: "How many different values can be represented using 10 bits?",
      steps: [{ m: "2¹⁰ = **1024**", mk: "1 mark" }], result: "1024" } },
    { worked: { tag: "exam", title: "Values in one byte", src: "AS June 2025 · P2 Q02.1 · 1 mark",
      q: "How many different values can be represented using one byte?",
      steps: [{ m: "2⁸ = **256**", mk: "1 mark", n: "Not 255." }], result: "256" } },
    { worked: { tag: "exam", title: "Memory addressable by a 32-bit address bus", src: "A-level June 2019 · P2 Q12.1 · 1 mark",
      q: "A computer system uses a 32-bit address bus and a 32-bit data bus. Each addressed memory location can store one byte of data. What is the maximum amount of memory, in bytes, that could be accessed?",
      steps: [{ h: "The address bus width sets the number of addresses", m: "2³² addresses × 1 byte = **4 294 967 296 bytes** (2³²)", mk: "1 mark", n: "The data bus width is a distractor — it sets how much is moved per transfer, not how many locations exist." }], result: "2³² = 4 294 967 296 bytes" } },
    { worked: { tag: "exam", title: "Doubling the addressable memory", src: "AS June 2022 · P2 Q08.5 · 2 marks",
      q: "Identify the bus that would need to be changed and state the change needed so that the maximum amount of memory addressable by the processor would be doubled.",
      steps: [{ m: "The **address bus**;", mk: "1 mark" }, { m: "its width increased by **one** line/bit (2ⁿ⁺¹ = 2 × 2ⁿ);", mk: "1 mark", n: "\"Make it bigger\" is not enough — doubling needs exactly one more bit." }], result: "Address bus, +1 line" } },
    { worked: { tag: "exam", title: "Addressable memory in gibibytes", src: "A-level June 2024 · P2 Q03.5 · 2 marks",
      q: "The computer's address bus uses 36 wires/lines and each main memory location can hold a 16-bit data value. In gibibytes, express the maximum amount of main memory that could be installed, assuming the CPU could access all of the memory using the address bus. Show your working.",
      steps: [
        { h: "Locations × bytes per location", m: "2³⁶ locations × 16 bits ÷ 8 = 2³⁶ × 2 bytes = 2³⁷ bytes" },
        { h: "To GiB (÷ 2³⁰)", m: "2³⁷ ÷ 2³⁰ = 2⁷ = **128 GiB**", mk: "2 marks", n: "1 method mark for two of: 2³⁶ used; ×16; ÷8; ÷1024; ÷1024 again." }
      ], result: "128 GiB" } },
    { worked: { tag: "variation", title: "Bits needed for a number of values", q: "How many bits are needed to give every one of 1000 students a unique ID, and to store 5 colours?",
      steps: [{ m: "2⁹ = 512 < 1000 ≤ 1024 = 2¹⁰ → **10 bits**" }, { m: "2² = 4 < 5 ≤ 8 = 2³ → **3 bits**", n: "Always round **up** to the next whole bit." }], result: "10 bits; 3 bits" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["How many values", "2ⁿ (a power of 2 or its value)."],
      ["Maximum memory", "2^(address lines) × bytes per location, in the unit asked."],
      ["Calculate bits needed", "⌈log₂ k⌉ — round up."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Each bit doubles\"", body: "1 → 2 → 4 → 8 → 16 … patterns: 2ⁿ." } },
    { callout: { t: "warn", h: "Specific errors", body: ["256 vs 255 (count vs highest value).", "Using the data bus width for addressable memory.", "Rounding bits down (5 colours in 2 bits)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.7.1.1 address bus width; 4.5.6.4 colour depth = ⌈log₂ colours⌉; 4.5.6.7 sample resolution; 4.7.3.3 opcode bits limit the instruction set to 2ⁿ instructions." } }
  ],
  flashcards: [
    ["Fundamental unit of information?", "The bit."],
    ["Bits in a byte?", "8."],
    ["Values representable with n bits?", "2ⁿ."],
    ["Largest unsigned value in n bits?", "2ⁿ − 1."],
    ["Values in two bytes?", "65 536."],
    ["Bits needed for k values?", "⌈log₂ k⌉."],
    ["What limits addressable memory?", "The width of the address bus."],
    ["How do you double addressable memory?", "Add one line to the address bus."],
    ["What is a nibble?", "4 bits (one hex digit)."]
  ],
  quiz: [
    { q: "How many values can 10 bits represent?", opts: ["1024", "1023", "100", "512"], ans: 0, why: "2¹⁰." },
    { q: "Bits needed for 300 different codes", opts: ["9", "8", "10", "300"], ans: 0, why: "256 < 300 ≤ 512." },
    { q: "A 32-bit address bus with byte locations addresses", opts: ["2³² bytes", "32 bytes", "2³² bits", "4 MB"], ans: 0, why: "2^lines." },
    { q: "The largest unsigned 8-bit value is", opts: ["255", "256", "128", "127"], ans: 0, why: "2⁸ − 1." }
  ]
};

/* =====================================================================
   4.5.3.2  Units
   ===================================================================== */
C["compsci:4.5.3.2"] = {
  notes: [
    { h: "Units of information — the whole topic on one page" },
    "Spec 4.5.3.2: know the names, symbols and corresponding powers of 2 for the **binary prefixes** kibi (Ki, 2¹⁰), mebi (Mi, 2²⁰), gibi (Gi, 2³⁰), tebi (Ti, 2⁴⁰); and the names, symbols and powers of 10 for the **decimal prefixes** kilo (k, 10³), mega (M, 10⁶), giga (G, 10⁹), tera (T, 10¹²).",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Which prefix represents 10⁶ (or 2²⁰)?", "Shade", "1", "AS 2023 Q03.1"],
      ["Order quantities in mixed units", "Place in order", "2", "AS 2018 Q02.1"],
      ["Convert between binary prefixes", "How many", "1", "A-level 2020 Q03.2 (4 GiB → KiB)"],
      ["Express a calculated size in MB / MiB / kB", "Calculate", "inside sound/image questions", "AS 2017 Q03.1, A-level 2023 Q01.1, 2024 Q02.1"],
      ["Memory in GiB from bus width", "Calculate", "2", "A-level 2024 Q03.5"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Decimal and binary prefixes**.", "**Converting and ordering**.", "**Exam toolkit**."] },

    { page: "Decimal and binary prefixes" },
    { table: { head: ["Decimal prefix", "Symbol", "Power", "Value", "Binary prefix", "Symbol", "Power", "Value"], rows: [
      ["kilo", "k", "10³", "1 000", "kibi", "Ki", "2¹⁰", "1 024"],
      ["mega", "M", "10⁶", "1 000 000", "mebi", "Mi", "2²⁰", "1 048 576"],
      ["giga", "G", "10⁹", "10⁹", "gibi", "Gi", "2³⁰", "1 073 741 824"],
      ["tera", "T", "10¹²", "10¹²", "tebi", "Ti", "2⁴⁰", "≈ 1.0995 × 10¹²"]
    ] } },
    { callout: { t: "memorise", h: "Which is which", body: [
      "**Decimal (SI) prefixes** — kilo, mega, giga, tera — are powers of **10**: 1 kB = 1000 bytes.",
      "**Binary (IEC) prefixes** — kibi, mebi, gibi, tebi (\"bi\" for binary) — are powers of **2**: 1 KiB = 1024 bytes.",
      "The gap grows: a gibibyte is 7.4% bigger than a gigabyte; a tebibyte is 10% bigger than a terabyte."
    ] } },
    { fig: { x: [0, 5], y: [0, 1.15], w: 480, h: 220, axes: { x: "", y: "ratio", xt: [{ v: 1, label: "kilo/kibi" }, { v: 2, label: "mega/mebi" }, { v: 3, label: "giga/gibi" }, { v: 4, label: "tera/tebi" }], yt: [{ v: 1, label: "1" }] },
      items: [
        { line: [[1, 0], [1, 0.9766]], c: "accent", w: 14 }, { line: [[2, 0], [2, 0.9537]], c: "accent", w: 14 }, { line: [[3, 0], [3, 0.9313]], c: "accent", w: 14 }, { line: [[4, 0], [4, 0.9095]], c: "accent", w: 14 },
        { text: [1, 1.05], t: "0.977", size: 11.5, c: "accent2" }, { text: [2, 1.05], t: "0.954", size: 11.5, c: "accent2" }, { text: [3, 1.05], t: "0.931", size: 11.5, c: "accent2" }, { text: [4, 1.05], t: "0.909", size: 11.5, c: "accent2" }
      ], cap: "Decimal unit ÷ binary unit: the decimal prefix falls further behind at each step (10³ⁿ / 2¹⁰ⁿ)." } },
    { callout: { t: "miscon", h: "\"1 kilobyte = 1024 bytes\"", body: "At AQA, **1 kilobyte = 1000 bytes**; 1024 bytes is a **kibibyte**. A question that says *megabytes* wants ÷ 1000 ÷ 1000; *mebibytes* wants ÷ 1024 ÷ 1024. Using the wrong one costs the final mark." } },

    { page: "Converting and ordering" },
    { steps: [
      { h: "Bits → bytes", m: "÷ 8" },
      { h: "Bytes → kB → MB → GB", m: "÷ 1000 each step" },
      { h: "Bytes → KiB → MiB → GiB", m: "÷ 1024 each step (or ÷ 2¹⁰)" },
      { h: "Within binary prefixes", m: "each step is ×1024: GiB → MiB → KiB" }
    ] },
    { worked: { tag: "exam", title: "Which prefix is 10⁶?", src: "AS June 2023 · P2 Q03.1 · 1 mark",
      q: "Shade in one lozenge to indicate which of the following prefixes represents 10⁶: A kibi; B mebi; C gibi; D kilo; E mega; F giga.",
      steps: [{ m: "**E (mega)** — decimal prefix, 10⁶", mk: "1 mark", n: "mebi is 2²⁰." }], result: "E" } },
    { worked: { tag: "exam", title: "Put five quantities in order", src: "AS June 2018 · P2 Q02.1 · 2 marks",
      q: "Place the quantities 3 kilobytes, 2 mebibytes, 2 bytes, 2 megabytes and 20 bits in order, 1 for the smallest and 5 for the largest.",
      steps: [
        { h: "Common unit: bytes", m: "20 bits = 2.5 bytes; 2 bytes; 3 kB = 3000 bytes; 2 MB = 2 000 000 bytes; 2 MiB = 2 097 152 bytes" },
        { h: "Order", m: "1: 2 bytes; 2: 20 bits; 3: 3 kilobytes", mk: "1 mark", n: "1 mark for bits, bytes and kilobytes in the correct positions." },
        { m: "4: 2 megabytes; 5: 2 mebibytes", mk: "1 mark", n: "The mebibyte is larger — the trap of the question." }
      ], result: "2 B, 20 bits, 3 kB, 2 MB, 2 MiB" } },
    { worked: { tag: "exam", title: "Gibibytes to kibibytes", src: "A-level June 2020 · P2 Q03.2 · 1 mark",
      q: "The computer has 4 gibibytes of memory installed. How many kibibytes is this equivalent to?",
      steps: [{ h: "GiB → MiB → KiB: × 1024 × 1024", m: "4 × 1024 × 1024 = **4 194 304 KiB** (= 4 × 2²⁰ = 2²²)", mk: "1 mark" }], result: "4 194 304 KiB" } },
    { worked: { tag: "exam", title: "A recording in mebibytes", src: "A-level June 2023 · P2 Q01.1 · 2 marks",
      q: "A sound is sampled at 48 000 samples per second for 3 minutes using a 16-bit sample resolution. Calculate the size of the digital recording in mebibytes, rounded to 2 decimal places. Show your working.",
      steps: [
        { h: "Bits", m: "48 000 × 16 × 180 = 138 240 000 bits" },
        { h: "Bytes, then MiB", m: "÷ 8 = 17 280 000 bytes; $\\;$ ÷ 1024 ÷ 1024 = 16.479…" },
        { m: "**16.48 MiB**", mk: "2 marks", n: "1 mark only for 16 or 16.5 or a truncated 16.47 — the rounding instruction is part of the answer." }
      ], result: "16.48 MiB" } },
    { worked: { tag: "variation", title: "The same file in MB and MiB", q: "A file is 5 000 000 000 bytes. Express its size in GB and in GiB.",
      steps: [{ m: "GB: ÷ 10⁹ = **5 GB**" }, { m: "GiB: ÷ 2³⁰ = 5 × 10⁹ ÷ 1 073 741 824 = **4.66 GiB**", n: "Why a \"500 GB\" drive shows as about 465 GiB in an operating system that uses binary units." }], result: "5 GB = 4.66 GiB" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Shade (prefix)", "Decimal names for powers of 10, \"-bi\" names for powers of 2."],
      ["Place in order", "Convert everything to one unit (bytes) first."],
      ["Calculate … in X", "Use X's base (1000 or 1024) and the rounding asked for."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"bi means binary\"", body: "Ki**bi**, Me**bi**, Gi**bi**, Te**bi** → 2¹⁰, 2²⁰, 2³⁰, 2⁴⁰. No \"bi\" → powers of 10." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Treating kB as 1024 bytes.", "Forgetting ÷ 8 (bits → bytes).", "Rounding when the question gives a precision (2 d.p.)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.6.4 and 4.5.6.7 file-size calculations; 4.7.1.1 address bus → memory size; 4.9.1.1 bit rate (bits per second — decimal prefixes: 1 Mbps = 10⁶ bits per second)." } }
  ],
  flashcards: [
    ["1 kilobyte (AQA)?", "1000 bytes (10³)."],
    ["1 kibibyte?", "1024 bytes (2¹⁰)."],
    ["mebi = 2 to the …?", "20."],
    ["Symbol for gibi?", "Gi (2³⁰)."],
    ["Which is larger, 2 MB or 2 MiB?", "2 MiB (2 097 152 bytes)."],
    ["4 GiB in KiB?", "4 194 304."],
    ["Prefix for 10⁶?", "mega (M)."],
    ["tebi?", "2⁴⁰ (Ti)."],
    ["Bits → bytes?", "Divide by 8."]
  ],
  quiz: [
    { q: "Which prefix represents 2³⁰?", opts: ["gibi", "giga", "mebi", "tera"], ans: 0, why: "Binary prefix." },
    { q: "1 MB in bytes (AQA) is", opts: ["1 000 000", "1 048 576", "1024", "8 000 000"], ans: 0, why: "Decimal." },
    { q: "Largest of these:", opts: ["2 MiB", "2 MB", "2000 kB", "16 000 000 bits"], ans: 0, why: "2 097 152 bytes." },
    { q: "To go from MiB to KiB", opts: ["× 1024", "× 1000", "÷ 1024", "× 8"], ans: 0, why: "One binary step." }
  ]
};

/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
