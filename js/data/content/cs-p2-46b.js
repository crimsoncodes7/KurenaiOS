/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.6.4.1
   (logic gates, circuits, half and full adders, the edge-triggered
   D-type flip-flop) and 4.6.5.1 (Boolean identities and De Morgan's laws)
   at full A-level depth. Each topic REPLACES the short entry the older
   file carried; every way AQA has examined it (7516/2 June 2016–2025,
   7517/2 June 2017–2025) is explained, worked and answered in the mark
   scheme's own format. Every simplification and truth table here was
   checked exhaustively by program. Circuits are drawn with ANSI/IEEE
   91-1984 distinctive-shape symbols, as the specification requires.
   Past-paper banks stay in bank-cs-46.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---- logic-gate drawing (pixel coordinates) ----
   gate(type, x, y, n) draws a gate whose body starts at x and whose
   centre line is y; it returns its items, input points and output point. */
function bez(p0, p1, p2, n) {
  var pts = [];
  for (var i = 0; i <= n; i++) {
    var t = i / n, a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t;
    pts.push([a * p0[0] + b * p1[0] + c * p2[0], a * p0[1] + b * p1[1] + c * p2[1]]);
  }
  return pts;
}
function gate(type, x, y, n) {
  n = n || (type === "NOT" ? 1 : 2);
  var it = [], ins = [], out, k = 12, ink = { c: "text2", w: 1.8, fill: "accent", alpha: 0.08 };
  var offs = n === 1 ? [0] : n === 2 ? [-10, 10] : [-13, 0, 13];
  function bodyItem(pts) { return { poly: pts, c: ink.c, w: ink.w, fill: ink.fill, alpha: ink.alpha }; }
  if (type === "NOT") {
    it.push(bodyItem([[x, y - 15], [x + 30, y], [x, y + 15]]));
    it.push({ circle: [x + 34, y, 4], c: ink.c, w: 1.6 });
    return { it: it, ins: [[x, y]], out: [x + 38, y] };
  }
  if (type === "AND" || type === "NAND") {
    var pts = [[x, y - 20], [x + 25, y - 20]];
    for (var a = -80; a <= 80; a += 10) { var r = a * Math.PI / 180; pts.push([x + 25 + 20 * Math.cos(r), y + 20 * Math.sin(r)]); }
    pts.push([x + 25, y + 20], [x, y + 20]);
    it.push(bodyItem(pts));
    offs.forEach(function (d) { ins.push([x, y + d]); });
    out = [x + 45, y];
    if (type === "NAND") { it.push({ circle: [x + 49, y, 4], c: ink.c, w: 1.6 }); out = [x + 53, y]; }
    return { it: it, ins: ins, out: out };
  }
  /* OR / NOR / XOR */
  var s = type === "XOR" ? 8 : 0, X0 = x + s;
  var body = bez([X0, y - 20], [X0 + 32, y - 20], [X0 + 50, y], 12)
    .concat(bez([X0 + 50, y], [X0 + 32, y + 20], [X0, y + 20], 12).slice(1))
    .concat(bez([X0, y + 20], [X0 + k, y], [X0, y - 20], 12).slice(1));
  it.push(bodyItem(body));
  if (s) it.push({ poly: bez([x, y + 20], [x + k, y], [x, y - 20], 12), close: false, c: ink.c, w: ink.w });
  offs.forEach(function (d) { var t = (d + 20) / 40; ins.push([x + 2 * t * (1 - t) * k, y + d]); });
  out = [X0 + 50, y];
  if (type === "NOR") { it.push({ circle: [X0 + 54, y, 4], c: ink.c, w: 1.6 }); out = [X0 + 58, y]; }
  return { it: it, ins: ins, out: out };
}
function wire(pts) { return { poly: pts, close: false, c: "text2", w: 1.6 }; }
function dot(x, y) { return { pt: [x, y], r: 3.2, c: "text2" }; }
function lab(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, b: o.b !== false, size: o.size || 12.5, c: o.c || "text", pos: o.pos || "c", off: o.off }; }
/* build a figure: fn(add) places gates; add(g) appends a gate's items */
function circuit(w, h, fn, cap) {
  var it = [];
  function add(g) { g.it.forEach(function (x) { it.push(x); }); return g; }
  fn(add, it);
  return { w: w, h: h, items: it, cap: cap };
}
/* a digital waveform: [[x, level], …] up to xEnd, between yHigh and yLow */
function wave(ch, xEnd, yH, yL, c) {
  var pts = [], lv = ch[0][1];
  pts.push([ch[0][0], lv ? yH : yL]);
  for (var i = 1; i < ch.length; i++) {
    pts.push([ch[i][0], lv ? yH : yL]);
    lv = ch[i][1];
    pts.push([ch[i][0], lv ? yH : yL]);
  }
  pts.push([xEnd, lv ? yH : yL]);
  return { poly: pts, close: false, c: c || "accent", w: 2 };
}

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA mark scheme", body: [
  "Each creditworthy point ends in a semicolon (**;**) and earns one mark. **MAX n** caps the total.",
  "**A.** accept · **R.** reject · **NE.** not enough · **I.** ignore · **TO.** \"talked out\" — a right point cancelled by a wrong one beside it.",
  "Circuit marks are for **design points** (\"A and B into an AND gate\"); **MAX 2/3 if the circuit is not fully correct**. Truth tables are marked **by column**, with follow-through (A. FT) from an earlier wrong column."
] } };

/* =====================================================================
   4.6.4.1  Logic gates
   ===================================================================== */
C["compsci:4.6.4.1"] = {
  notes: [
    { h: "Logic gates — the whole topic on one page" },
    "Spec 4.6.4.1: construct truth tables for **NOT, AND, OR, XOR, NAND, NOR**; draw and interpret logic circuit diagrams; complete a truth table for a circuit; write a Boolean expression for a circuit; draw a circuit for a Boolean expression; recognise and trace the **half-adder** and **full-adder**, construct a half-adder; be familiar with the **edge-triggered D-type flip-flop** as a memory unit. Use the ANSI/IEEE distinctive-shape symbols; the internal operation of the flip-flop is not required.",
    "Logic gates are on every Paper 2 since 2016 — 45 sub-questions in the packs:",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Name the gate from a symbol / truth table", "State / What is the name", "1", "AS 2016 Q05.1, 2017 Q05.1, 2018 Q09.1, 2019 Q06.1, 2022 Q07.1–07.2, 2024 Q06.1"],
      ["Complete a gate's truth table", "Complete", "1", "AS 2020 Q05.1, A-level 2019 Q08.1"],
      ["Complete a circuit's truth table", "Complete", "2–4", "AS 2023 Q07.1, 2024 Q06.2, A-level 2018 Q03.1, 2020 Q06.2, 2021 Q04.2"],
      ["Write the expression for a circuit", "Write", "1–3", "AS 2023 Q07.2, 2024 Q06.3, A-level 2018 Q03.2, 2021 Q04.1"],
      ["Draw a circuit from an expression or scenario", "Draw", "2–4", "AS 2018 Q09.3, 2019 Q06.2, 2020 Q05.2, 2022 Q07.3, 2025 Q08.2, A-level 2017 Q04.1, 2019 Q08.2, 2024 Q06.1"],
      ["Purpose of a circuit (adder, decoder, letter test)", "Explain / Describe", "1–2", "A-level 2018 Q03.3, 2021 Q04.3, 2023 Q09.2, 2025 Q09.2"],
      ["Half adder with exactly two gates", "Draw", "3", "A-level 2023 Q09.1"],
      ["D-type flip-flop: purpose, inputs, clock", "Explain / State", "1–2", "A-level 2017 Q04.4–04.5, 2024 Q06.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The six gates** — symbols, truth tables, notation.", "**Circuit → table and expression**.", "**Expression or scenario → circuit**.", "**Decoders and other circuits with a purpose**.", "**Half and full adders**.", "**The D-type flip-flop**.", "**Exam toolkit**."] },
    { diagram: "logic-gates" },

    { page: "The six gates" },
    { fig: circuit(560, 220, function (add, it) {
      [["NOT", 40, 55], ["AND", 230, 55], ["OR", 420, 55], ["XOR", 40, 160], ["NAND", 230, 160], ["NOR", 420, 160]].forEach(function (g) {
        var G = add(gate(g[0], g[1], g[2]));
        G.ins.forEach(function (p) { it.push(wire([[g[1] - 24, p[1]], p])); });
        it.push(wire([G.out, [G.out[0] + 22, G.out[1]]]));
        it.push(lab(g[1] + 28, g[2] - 36, g[0]));
      });
    }, "ANSI/IEEE distinctive shapes. A small circle (bubble) means NOT: NAND = AND + bubble, NOR = OR + bubble; XOR has a second curved line at its back.") },
    { table: { head: ["A", "B", "NOT A", "A AND B", "A OR B", "A XOR B", "A NAND B", "A NOR B"], rows: [
      ["0", "0", "1", "0", "0", "0", "1", "1"],
      ["0", "1", "1", "0", "1", "1", "1", "0"],
      ["1", "0", "0", "0", "1", "1", "1", "0"],
      ["1", "1", "0", "1", "1", "0", "0", "0"]
    ] } },
    { table: { head: ["Gate", "AQA notation", "Output is 1 when…"], rows: [
      ["NOT", "$\\overline{A}$", "the input is 0 (it inverts)"],
      ["AND", "$A \\cdot B$", "**both / all** inputs are 1"],
      ["OR", "$A + B$", "**at least one** input is 1"],
      ["XOR", "$A \\oplus B$", "the inputs are **different** (exactly one is 1)"],
      ["NAND", "$\\overline{A \\cdot B}$", "**not** all inputs are 1 — only 1 1 gives 0"],
      ["NOR", "$\\overline{A + B}$", "**no** input is 1 — only 0 0 gives 1"]
    ] } },
    { callout: { t: "memorise", h: "Read a truth table by its odd row out", body: ["One **1** at the bottom (1 1) → **AND**; one **0** at the bottom → **NAND**.", "One **0** at the top (0 0) → **OR**; one **1** at the top → **NOR**.", "**0 1 1 0** → **XOR**."] } },
    { callout: { t: "miscon", h: "\"NOT AND\" for NAND", body: "AS 2022 Q07.2: **R. NOT AND** — the gate is called **NAND**. (AS 2017 accepted \"NOT AND\"; do not rely on it.) XOR: accept XOR // EOR // EXOR // Exclusive OR." } },
    { worked: { tag: "exam", title: "Name the gate (0 1 1 0)", src: "AS June 2016 · P2 Q05.1 · 1 mark",
      q: "Figure 5 shows a gate with inputs X, Y and output Z, and its truth table: 0 0 → 0, 0 1 → 1, 1 0 → 1, 1 1 → 0. What is the name of the logic gate?",
      steps: [{ m: "XOR // EOR // Exclusive OR;", mk: "1 mark" }], result: "XOR" } },
    { worked: { tag: "exam", title: "Name the gate (1 1 1 0)", src: "AS June 2017 · P2 Q05.1 · 1 mark",
      q: "A gate's truth table is 0 0 → 1, 0 1 → 1, 1 0 → 1, 1 1 → 0, and its symbol is an AND shape with a circle on its output. What is the name of the logic gate?",
      steps: [{ m: "NAND;", mk: "1 mark" }], result: "NAND" } },
    { worked: { tag: "exam", title: "Name the gate (1 0 0 0)", src: "AS June 2019 · P2 Q06.1 · 1 mark",
      q: "State the name of the logic gate represented by the truth table 0 0 → 1, 0 1 → 0, 1 0 → 0, 1 1 → 0.",
      steps: [{ m: "NOR;", mk: "1 mark" }], result: "NOR" } },
    { worked: { tag: "exam", title: "Complete A NAND B", src: "AS June 2020 · P2 Q05.1 · 1 mark",
      q: "Complete the truth table for A NAND B (rows A B = 00, 01, 10, 11).",
      steps: [{ m: "1, 1, 1, 0", mk: "1 mark" }], result: "1 1 1 0" } },
    { worked: { tag: "exam", title: "Two gates by symbol and table", src: "AS June 2022 · P2 Q07.1–07.2 · 2 marks",
      q: "(a) State which logic gate has the truth table 0 0 → 1, 0 1 → 0, 1 0 → 0, 1 1 → 0. (b) State the logic gate whose symbol is an AND shape with a bubble on the output.",
      steps: [{ m: "(a) NOR;", mk: "1 mark" }, { m: "(b) NAND;", mk: "1 mark", n: "R. NOT AND." }], result: "NOR; NAND" } },
    { worked: { tag: "exam", title: "OR and NAND tables", src: "A-level June 2019 · P2 Q08.1 · 1 mark",
      q: "Complete the truth tables for the OR and NAND gates.",
      steps: [{ m: "OR: 0, 1, 1, 1 · NAND: 1, 1, 1, 0", mk: "1 mark", n: "All values in both output columns must be correct." }], result: "0111 and 1110" } },
    { worked: { tag: "exam", title: "XOR and its operation (the parity circuit)", src: "AS June 2025 · P2 Q07.1 · 2 marks",
      q: "A logic circuit computes a parity bit for a 4-bit message using three logic gates all of the same type; for the message 1001 it outputs 0. State the name of the type of gate used and explain its operation.",
      steps: [
        { h: "Name (AO1 knowledge)", m: "XOR // EX-OR // Exclusive OR;", mk: "1 mark" },
        { h: "Operation (AO1 understanding)", m: "An XOR gate outputs 1 when its inputs are different // when there is a 1 on one input and a 0 on the other;", mk: "1 mark" }
      ], result: "XOR — 1 when inputs differ" } },
    { worked: { tag: "exam", title: "Which parity, and how Alice and Bob use it", src: "AS June 2025 · P2 Q07.2–07.3 · 5 marks",
      q: "(a) State the type of parity computed by the circuit (1001 → 0) and give a reason. (b) Alice wants to send a 4-bit message to Bob with a parity bit. Describe how Alice can send the message and how Bob can determine if an error has occurred, stating when each uses a copy of the circuit.",
      steps: [
        { m: "(a) Even (parity);", mk: "1 mark" },
        { m: "the circuit outputs 0 when the number of 1s in the input is even (and 1 when it is odd) — 1001 has two 1s → 0;", mk: "1 mark" },
        { m: "(b) Alice feeds the 4-bit message into her copy of the circuit to produce the parity bit;", mk: "1 mark" },
        { m: "the parity bit is appended / prepended to the message and the 5 bits are transmitted;", mk: "1 mark" },
        { m: "Bob separates the 4 message bits, feeds them into his copy of the circuit and compares its output with the parity bit received — a mismatch means a (single-bit) error.", mk: "1 mark" }
      ], result: "Even parity; Alice computes, Bob recomputes and compares" } },

    { page: "Circuit → table and expression" },
    { callout: { t: "formula", h: "Method: trace a circuit", body: [
      "1. **Label** every gate output that is not already labelled (the paper often gives L, M, N…).",
      "2. Write **2ⁿ rows** for n inputs, counting in binary: 000, 001, 010 … 111.",
      "3. Work **left to right**, one column per gate, each column from the columns that feed it.",
      "4. For the expression, write each gate's output **in terms of its inputs**, then substitute back until only inputs remain. **Bracket** every gate's expression before using it in the next gate."
    ] } },
    { fig: circuit(470, 200, function (add, it) {
      var x1 = add(gate("XOR", 120, 90)), x2 = add(gate("XOR", 240, 50)), a1 = add(gate("AND", 120, 170)), a2 = add(gate("AND", 240, 130)), o = add(gate("OR", 360, 150));
      it.push(lab(12, 40, "A"), lab(12, 80, "B"), lab(12, 100, "C"));
      it.push(wire([[22, 40], x2.ins[0]]), wire([[22, 80], x1.ins[0]]), wire([[22, 100], x1.ins[1]]));
      it.push(dot(60, 80), wire([[60, 80], [60, 160], a1.ins[0]]), dot(80, 100), wire([[80, 100], [80, 180], a1.ins[1]]));
      it.push(dot(225, 40), wire([[225, 40], [225, 120], a2.ins[0]]));
      it.push(wire([x1.out, [210, 90]]), dot(210, 90), wire([[210, 90], [210, 60], x2.ins[1]]), wire([[210, 90], [210, 140], a2.ins[1]]));
      it.push(wire([a2.out, [320, 130], [320, 140], o.ins[0]]), wire([a1.out, [330, 170], [330, 160], o.ins[1]]));
      it.push(wire([x2.out, [440, 50]]), wire([o.out, [440, 150]]));
      it.push(lab(186, 80, "D", { size: 11.5 }), lab(176, 160, "E", { size: 11.5 }), lab(296, 120, "F", { size: 11.5 }), lab(452, 50, "H"), lab(452, 150, "G"));
    }, "A-level 2018 Figure 5, redrawn: D = B ⊕ C, E = B·C, F = A·D, G = E + F, H = A ⊕ D. Wires that cross without a dot are not connected.") },
    { worked: { tag: "exam", title: "Trace Figure 5 and write G", src: "A-level June 2018 · P2 Q03.1–03.2 · 6 marks",
      q: "For the circuit above (inputs A, B, C; intermediate points D, E, F; outputs G, H): (a) complete the truth table; (b) write a Boolean expression to show how the output G is calculated from the inputs A, B and C.",
      steps: [
        { h: "(a) D, E, F", m: "D = B⊕C: 0,1,1,0,0,1,1,0 · E = B·C: 0,0,0,1,0,0,0,1 · F = A·D: 0,0,0,0,0,1,1,0", mk: "1 mark", n: "Rows ABC = 000 … 111. 1 mark for column D or E or F correct." },
        { h: "(a) G", m: "G = E + F: 0,0,0,1,0,1,1,1", mk: "1 mark" },
        { h: "(a) H", m: "H = A⊕D: 0,1,1,0,1,0,0,1", mk: "1 mark", n: "MAX 2 if any incorrect values." },
        { h: "(b)", m: "$G = B \\cdot C + A \\cdot (B \\oplus C)$", mk: "3 marks", n: "1: B·C or B⊕C somewhere; 1: A ANDed with B⊕C; 1: fully correct. A. $(\\overline{B} \\cdot C) + (B \\cdot \\overline{C})$ for B⊕C. Do not then simplify — a wrong simplification is ignored, but it wastes time." }
      ], result: "G = B·C + A·(B ⊕ C)" } },
    { worked: { tag: "exam", title: "Complete the table; write Y (AS)", src: "AS June 2023 · P2 Q07.1–07.2 · 5 marks",
      q: "Figure 3: L = A XOR B; X = L XOR C; M = L AND C; N = A AND B; Y = M OR N. Columns M and X are given. Complete columns L, N and Y, then write a Boolean expression for Y in terms of A, B and C.",
      steps: [
        { m: "L: 0, 0, 1, 1, 1, 1, 0, 0", mk: "1 mark" },
        { m: "N: 0, 0, 0, 0, 0, 0, 1, 1", mk: "1 mark" },
        { m: "Y: 0, 0, 0, 1, 0, 1, 1, 1", mk: "1 mark", n: "A. follow-through for Y from a wrong N." },
        { m: "$Y = (A \\oplus B) \\cdot C + A \\cdot B$", mk: "2 marks", n: "Also accepted: $((A \\cdot \\overline{B}) + (\\overline{A} \\cdot B)) \\cdot C + A \\cdot B$ or $(\\overline{A} \\cdot B \\cdot C) + (A \\cdot (B + C))$. 1 mark for (A⊕B)·C or A·B somewhere. (X and Y are the sum and carry of a full adder.)" }
      ], result: "Y = (A ⊕ B)·C + A·B" } },
    { worked: { tag: "exam", title: "Complete L, M and Z", src: "AS June 2024 · P2 Q06.2 · 2 marks",
      q: "Figure 3: L = A AND B; M = A AND C; Z = L OR M. Complete the truth table for rows ABC = 000 … 111.",
      steps: [
        { m: "L: 0,0,0,0,0,0,1,1 · M: 0,0,0,0,0,1,0,1", mk: "1 mark" },
        { m: "Z: 0,0,0,0,0,1,1,1", mk: "1 mark", n: "A. FT from L and M. R. a column with more than one value in a cell." }
      ], result: "Z = A·(B + C)" } },
    { fig: circuit(420, 190, function (add, it) {
      var n1 = add(gate("NOT", 50, 50)), a1 = add(gate("AND", 150, 60)), o1 = add(gate("OR", 150, 150)), a2 = add(gate("AND", 260, 105)), n2 = add(gate("NOT", 330, 105));
      it.push(lab(12, 50, "A"), lab(12, 70, "B"), lab(12, 140, "C"), lab(12, 160, "D"));
      it.push(wire([[22, 50], n1.ins[0]]), wire([n1.out, a1.ins[0]]), wire([[22, 70], a1.ins[1]]));
      it.push(wire([[22, 140], o1.ins[0]]), wire([[22, 160], o1.ins[1]]));
      it.push(wire([a1.out, [230, 60], [230, 95], a2.ins[0]]), wire([o1.out, [240, 150], [240, 115], a2.ins[1]]));
      it.push(wire([a2.out, n2.ins[0]]), wire([n2.out, [400, 105]]), lab(410, 105, "Q"));
    }, "AS 2024 Figure 4, redrawn.") },
    { worked: { tag: "exam", title: "Write the expression for Q", src: "AS June 2024 · P2 Q06.3 · 3 marks",
      q: "Using the circuit above (A → NOT, then AND with B; C OR D; the two results ANDed, then NOT), write a Boolean expression for Q.",
      steps: [
        { m: "$\\overline{A} \\cdot B$ from the first AND;", mk: "1 mark" },
        { m: "$C + D$ from the OR;", mk: "1 mark" },
        { m: "combined with AND and inverted: $Q = \\overline{\\overline{A} \\cdot B \\cdot (C + D)}$", mk: "1 mark", n: "Full marks for equivalent expressions." }
      ], result: "Q = NOT(Ā·B·(C + D))" } },

    { page: "Expression or scenario → circuit" },
    { callout: { t: "formula", h: "Method: draw a circuit", body: [
      "1. Precedence: **brackets, then NOT, then AND, then OR** (like ×-before-+).",
      "2. Draw the **innermost** sub-expressions first, nearest the inputs; one gate per operator.",
      "3. A bar over a **whole** sub-expression is one NOT on that sub-expression's output — or the bubble version: $\\overline{X \\cdot Y}$ is a NAND, $\\overline{X + Y}$ a NOR.",
      "4. An input used twice is **branched** with a dot; never draw two separate input points for the same variable unless the paper gives them.",
      "5. Follow any restriction: \"only AND, OR and NOT\", \"exactly two gates\", \"do not simplify\"."
    ] } },
    { callout: { t: "formula", h: "Method: scenario → expression", body: "Underline the words: **and / both** → AND · **or / either** → OR · **no / not** → NOT · \"either … or … but not both\" → XOR. Each sensor becomes an input; a condition with two parts joined by \"and\" becomes the final AND." } },
    { fig: circuit(420, 190, function (add, it) {
      var a1 = add(gate("AND", 100, 50)), nA = add(gate("NOT", 60, 110)), o = add(gate("OR", 200, 80)), nD = add(gate("NOT", 200, 160)), a2 = add(gate("AND", 300, 120));
      it.push(lab(12, 40, "B"), lab(12, 60, "C"), lab(12, 110, "A"), lab(12, 160, "D"));
      it.push(wire([[22, 40], a1.ins[0]]), wire([[22, 60], a1.ins[1]]), wire([[22, 110], nA.ins[0]]), wire([[22, 160], nD.ins[0]]));
      it.push(wire([a1.out, [170, 50], [170, 70], o.ins[0]]), wire([nA.out, [180, 110], [180, 90], o.ins[1]]));
      it.push(wire([o.out, [275, 80], [275, 110], a2.ins[0]]), wire([nD.out, [285, 160], [285, 130], a2.ins[1]]));
      it.push(wire([a2.out, [380, 120]]), lab(392, 120, "Q"));
    }, "The conveyor belt: Q = (B·C + Ā)·D̄.") },
    { worked: { tag: "exam", title: "The bottle-filling conveyor", src: "AS June 2019 · P2 Q06.2 · 3 marks",
      q: "Q moves a conveyor belt on. A is true if a bottle is present, B if it is full, C if it is correctly positioned, D if the next section has a bottle in it. The belt can move if both are true: a bottle is full and correctly positioned or there is no bottle present; there is no bottle in the next section. Draw a logic circuit for the machine.",
      steps: [
        { h: "Expression", m: "$Q = (B \\cdot C + \\overline{A}) \\cdot \\overline{D}$" },
        { m: "B and C into an AND gate;", mk: "1 mark" },
        { m: "the result of B·C as one input and NOT A as the other input to an OR gate;", mk: "1 mark", n: "I. an incorrect gate for B·C." },
        { m: "D into a NOT gate, whose output goes to an AND gate with the OR result as its other input; that AND outputs Q.", mk: "1 mark", n: "MAX 2 if not fully correct." }
      ], result: "Q = (B·C + Ā)·D̄" } },
    { worked: { tag: "exam", title: "Process X: circuit and expression", src: "A-level June 2017 · P2 Q04.1–04.2 · 5 marks",
      q: "Process X can only start once processes A and B have finished and either communication channel C or D or both is available (A, B true when finished; C, D true when available). (a) Draw a logic circuit with inputs A, B, C, D and output X. (b) Write a Boolean expression for X.",
      steps: [
        { m: "(a) A and B into an AND gate;", mk: "1 mark" },
        { m: "C and D into an OR gate;", mk: "1 mark" },
        { m: "the output of a (second) AND gate — fed by those two — connected to X;", mk: "1 mark", n: "MAX 2 if any error." },
        { m: "(b) $X = A \\cdot B \\cdot (C + D)$", mk: "2 marks", n: "1 mark: A·B or C+D in an otherwise wrong expression. A. equivalent expressions." }
      ], result: "X = A·B·(C + D)" } },
    { worked: { tag: "exam", title: "Draw $\\overline{A} + \\overline{B} \\cdot C$", src: "AS June 2018 · P2 Q09.3 · 3 marks",
      q: "Represent the Boolean equation $\\overline{A} + \\overline{B} \\cdot C$ as a logic circuit.",
      steps: [
        { m: "A and B each connected to a (different) NOT gate;", mk: "1 mark" },
        { m: "an AND gate connected to C and to the output of the NOT B gate;", mk: "1 mark", n: "Precedence: AND before OR, so $\\overline{B} \\cdot C$ is one gate." },
        { m: "an OR gate fed by NOT A and (NOT B AND C), outputting Q.", mk: "1 mark", n: "MAX 2 if not fully correct." }
      ], result: "Two NOTs, one AND, one OR" } },
    { fig: circuit(380, 190, function (add, it) {
      var nA = add(gate("NOT", 100, 120)), nB = add(gate("NOT", 100, 80)), a1 = add(gate("AND", 200, 50)), a2 = add(gate("AND", 200, 150)), o = add(gate("OR", 290, 100));
      it.push(lab(10, 40, "A"), lab(10, 160, "B"));
      it.push(wire([[20, 40], a1.ins[0]]), wire([[20, 160], a2.ins[1]]));
      it.push(dot(40, 40), wire([[40, 40], [40, 120], nA.ins[0]]), wire([nA.out, [180, 120], [180, 140], a2.ins[0]]));
      it.push(dot(60, 160), wire([[60, 160], [60, 80], nB.ins[0]]), wire([nB.out, [170, 80], [170, 60], a1.ins[1]]));
      it.push(wire([a1.out, [270, 50], [270, 90], o.ins[0]]), wire([a2.out, [270, 150], [270, 110], o.ins[1]]));
      it.push(wire([o.out, [360, 100]]), lab(370, 100, "Q"));
    }, "XOR from AND, OR and NOT: Q = A·B̄ + Ā·B. The B branch crosses the Ā wire — no dot, so they are not joined.") },
    { worked: { tag: "exam", title: "XOR without an XOR gate", src: "AS June 2020 · P2 Q05.2 · 3 marks",
      q: "A XOR B can be implemented as a logic circuit without using an XOR gate. Using only AND, OR and NOT gates draw a circuit that will produce an output Q which is logically equivalent to A XOR B.",
      steps: [
        { h: "Part 1", m: "$A \\cdot \\overline{B}$: B through a NOT gate, ANDed with A;", mk: "1 mark" },
        { h: "Part 2", m: "$\\overline{A} \\cdot B$: A through a NOT gate, ANDed with B;", mk: "1 mark" },
        { h: "Part 3", m: "the two AND outputs into an OR gate giving Q.", mk: "1 mark", n: "Alternatives scored the same way: $(A + B) \\cdot \\overline{A \\cdot B}$ (OR, AND→NOT, AND). MAX 2 if not fully correct." }
      ], result: "Q = A·B̄ + Ā·B" } },
    { fig: circuit(360, 180, function (add, it) {
      var a1 = add(gate("AND", 150, 50)), nB = add(gate("NOT", 80, 130)), a2 = add(gate("AND", 150, 140)), q = add(gate("NOR", 250, 95));
      it.push(lab(12, 40, "A"), lab(12, 60, "B"), lab(12, 150, "C"));
      it.push(wire([[22, 40], a1.ins[0]]), wire([[22, 60], a1.ins[1]]), dot(60, 60), wire([[60, 60], [60, 130], nB.ins[0]]), wire([nB.out, a2.ins[0]]), wire([[22, 150], a2.ins[1]]));
      it.push(wire([a1.out, [225, 50], [225, 85], q.ins[0]]), wire([a2.out, [225, 140], [225, 105], q.ins[1]]));
      it.push(wire([q.out, [340, 95]]), lab(350, 95, "Q"));
    }, "Q = NOT(A·B + C·B̄): the final OR-then-NOT is one NOR gate.") },
    { worked: { tag: "exam", title: "Draw $Q = \\overline{A \\cdot B + C \\cdot \\overline{B}}$", src: "A-level June 2019 · P2 Q08.2 · 4 marks",
      q: "Draw a logic circuit for the Boolean expression $Q = \\overline{A \\cdot B + C \\cdot \\overline{B}}$.",
      steps: [
        { m: "A and B as the inputs to an AND gate;", mk: "1 mark" },
        { m: "B as the input to a NOT gate;", mk: "1 mark", n: "A. a NOT drawn as a triangle without its circle, as BOD." },
        { m: "the output of the NOT gate and C as the inputs to an AND gate;", mk: "1 mark" },
        { m: "the two AND outputs into a NOR gate whose output is Q;", mk: "1 mark", n: "A. OR followed by NOT. MAX 3 if the logic is not fully correct. Draw the expression GIVEN, not a simplified equivalent." }
      ], result: "AND, NOT→AND, NOR" } },
    { worked: { tag: "exam", title: "Draw $Q = \\overline{\\overline{A \\cdot B} + C}$", src: "AS June 2022 · P2 Q07.3 · 2 marks",
      q: "Draw the logic circuit for the Boolean expression $Q = \\overline{\\overline{A \\cdot B} + C}$.",
      steps: [
        { m: "A and B into an AND gate followed by a NOT gate // A and B into a NAND gate;", mk: "1 mark" },
        { m: "the final two gates are an OR followed by a NOT // the final gate is a NOR (inputs: the NAND output and C);", mk: "1 mark", n: "A. 2 marks for a correctly simplified expression drawn correctly. MAX 1 if the circuit does not reflect the expression." }
      ], result: "NAND into NOR with C" } },
    { worked: { tag: "exam", title: "Draw without simplifying", src: "A-level June 2024 · P2 Q06.1 · 4 marks",
      q: "Draw a logic circuit for $Q = \\overline{\\overline{A} \\cdot B + B + C \\cdot D}$. Do not simplify the expression.",
      steps: [
        { m: "A into a NOT gate; its output and B into an AND gate;", mk: "1 mark" },
        { m: "C and D into an AND gate;", mk: "1 mark", n: "A. C OR B then AND D (a precedence misunderstanding) for this point." },
        { m: "B and the output of the C·D AND gate (with $\\overline{A} \\cdot B$) into a NOR gate;", mk: "1 mark" },
        { m: "the NOR gate connected to output Q;", mk: "1 mark", n: "A. OR then NOT for NOR. MAX 3 if not fully correct. A three-input NOR, or two ORs then a NOT, both work." }
      ], result: "NOT·AND, AND, 3-input NOR" } },
    { worked: { tag: "exam", title: "Only AND, OR and NOT", src: "AS June 2025 · P2 Q08.2 · 3 marks",
      q: "Draw a logic circuit for $Q = \\overline{X + Y} + \\overline{(Z \\cdot Y) + X}$ using only AND, OR and NOT gates.",
      steps: [
        { m: "$\\overline{X + Y}$: X and Y into an OR gate, then a NOT gate;", mk: "1 mark" },
        { m: "$\\overline{(Z \\cdot Y) + X}$: Z and Y into an AND, its output and X into an OR, then a NOT;", mk: "1 mark" },
        { m: "the two NOT outputs into an OR gate giving Q.", mk: "1 mark", n: "DPT (one dependent penalty) for any NOR/NAND/XOR gate — the question forbids them. MAX 2 if not fully correct." }
      ], result: "OR→NOT, AND→OR→NOT, then OR" } },

    { page: "Decoders and circuits with a purpose" },
    { callout: { t: "formula", h: "Method: \"explain the purpose\"", body: "Complete the truth table first, then read it **as data**: what do the outputs *mean* for the inputs? A sum and carry → an adder. Exactly one output on for each input number → a decoder. A 1 for some characters only → a classifier (letter, capital)." } },
    { worked: { tag: "exam", title: "The 7-segment segment", src: "A-level June 2020 · P2 Q06.2–06.3 · 5 marks",
      q: "Inputs X3 X2 X1 X0 are a decimal digit 0–9 in binary. Intermediate points: A = NOT X2; B = A AND X1; C = X1 NAND X0; D = X2 AND C; E = B OR D; Q = X3 OR E. (a) Complete the trace table for the digits 0–9. (b) Which segment does Q control?",
      steps: [
        { m: "A: 1,1,1,1,0,0,0,0,1,1 · C: 1,1,1,0,1,1,1,0,1,1", mk: "1 mark", n: "Digits 0–9 in order." },
        { m: "B: 0,0,1,1,0,0,0,0,0,0 · D: 0,0,0,0,1,1,1,0,0,0", mk: "1 mark" },
        { m: "E: 0,0,1,1,1,1,1,0,0,0", mk: "1 mark" },
        { m: "Q: 0,0,1,1,1,1,1,0,1,1", mk: "1 mark", n: "MAX 3 if any value is wrong." },
        { h: "(b)", m: "Q is off only for 0, 1 and 7 — the digits without a **middle bar**: Q controls the middle segment (labelled b in that paper's figure).", mk: "1 mark" }
      ], result: "The middle segment" } },
    { worked: { tag: "exam", title: "A 3-to-8 decoder", src: "A-level June 2021 · P2 Q04.1–04.4 · 7 marks",
      q: "A circuit has inputs X2 X1 X0 and outputs Q0–Q7; each Qn is an AND of the three inputs, each inverted or not. (a) Write an expression for Q1. (b) Complete the truth table. (c) Explain the purpose of the circuit. (d) A second circuit ORs X0 and X1, ORs the result with X2, then inverts it giving S. Which output is S equivalent to?",
      steps: [
        { h: "(a)", m: "$Q1 = \\overline{X2} \\cdot \\overline{X1} \\cdot X0$", mk: "1 mark", n: "A. logically equivalent." },
        { h: "(b)", m: "Each row has exactly one 1: input 000 → Q0, 001 → Q1, … 111 → Q7.", mk: "3 marks", n: "1 row correct 1 mark; 4 rows 2 marks; all 8 rows 3 marks." },
        { h: "(c)", m: "Output Qn is 1 when the binary input pattern has the value n // it is a (3-bit) binary decoder;", mk: "2 marks", n: "1 mark only for \"one different output is on for each input pattern\" // \"converts binary to decimal\"." },
        { h: "(d)", m: "$S = \\overline{X0 + X1 + X2} = \\overline{X0} \\cdot \\overline{X1} \\cdot \\overline{X2}$ (De Morgan) → **Q0**;", mk: "1 mark", n: "NE. \"0\"." }
      ], result: "Q1 = X̄2·X̄1·X0; a binary decoder; S = Q0" } },
    { worked: { tag: "exam", title: "The ASCII letter circuit", src: "A-level June 2025 · P2 Q09.2–09.3 · 3 marks",
      q: "A circuit takes the 7-bit ASCII code B6…B0 of a character. Its completed truth table gives Q1 = 1 for 'F', 'W' and 'f' and Q1 = 0 for '*', '@' and the backslash; Q2 = 1 for 'F' and 'W' only. (a) Describe the purpose of Q1 and Q2. (b) Which equation represents Q1? A: … · $\\overline{B5}$ · B: $B6 \\cdot (\\overline{B4} \\cdot \\overline{B3} + \\overline{B2} \\cdot \\overline{B1} \\cdot \\overline{B0}) \\cdot (B4 + B3 + B2 + B1 + B0)$ · C: $B6 \\cdot (\\overline{B4 \\cdot B3} + \\overline{B2} \\cdot \\overline{B1 \\cdot B0}) \\cdot (B4 + B3 + B2 + B1 + B0)$ · D: C without its outer brackets · E: an OR-based expression.",
      steps: [
        { h: "(a) Q1", m: "Q1 indicates whether the character is a letter — 1 indicates a letter;", mk: "1 mark", n: "R. 0 indicates a letter." },
        { h: "(a) Q2", m: "Q2 indicates whether it is a capital / uppercase letter — 1 indicates a capital;", mk: "1 mark", n: "NE. \"indicates not a lowercase letter\"." },
        { h: "(b) why C", m: "A letter has B6 = 1 and its low five bits in 1…26 (00001…11010). Not zero: $B4 + B3 + B2 + B1 + B0$. At most 26: either $B4 \\cdot B3$ is false, or the low three bits are at most 010, i.e. $\\overline{B2} \\cdot \\overline{B1 \\cdot B0}$. Option A wrongly excludes lower-case (B5 = 1)." },
        { m: "**C**", mk: "1 mark" }
      ], result: "Letter; capital; C" } },
    { callout: { t: "tip", h: "Case is one bit", body: "In ASCII, 'A' = 1000001 and 'a' = 1100001: they differ only in **B5**. So \"is a capital\" = letter AND $\\overline{B5}$ — the same trick as 4.5.5.2." } },

    { page: "Half and full adders" },
    { fig: circuit(360, 180, function (add, it) {
      var x = add(gate("XOR", 150, 60)), a = add(gate("AND", 150, 140));
      it.push(lab(16, 50, "A"), lab(16, 70, "B"));
      it.push(wire([[26, 50], x.ins[0]]), wire([[26, 70], x.ins[1]]));
      it.push(dot(80, 50), wire([[80, 50], [80, 130], a.ins[0]]), dot(100, 70), wire([[100, 70], [100, 150], a.ins[1]]));
      it.push(wire([x.out, [270, 60]]), wire([a.out, [270, 140]]), lab(300, 60, "S (sum)"), lab(305, 140, "C (carry)"));
    }, "Half adder: S = A ⊕ B, C = A · B. Exactly two gates.") },
    { table: { head: ["A", "B", "C (carry)", "S (sum)", "A + B in binary"], rows: [
      ["0", "0", "0", "0", "00"], ["0", "1", "0", "1", "01"], ["1", "0", "0", "1", "01"], ["1", "1", "1", "0", "10"]
    ] } },
    { kv: [
      ["Half adder", "adds **two bits**; outputs a sum and a carry; **cannot accept a carry in**"],
      ["Full adder", "adds **three bits** — two bits and a **carry in** from the previous column; outputs a sum and a carry out"],
      ["Full adder from half adders", "two half adders and an OR gate: half-add A and B, half-add that sum with Cin; Cout = the OR of the two carries"]
    ] },
    { table: { head: ["A", "B", "Cin", "Cout", "S"], rows: [
      ["0", "0", "0", "0", "0"], ["0", "0", "1", "0", "1"], ["0", "1", "0", "0", "1"], ["0", "1", "1", "1", "0"],
      ["1", "0", "0", "0", "1"], ["1", "0", "1", "1", "0"], ["1", "1", "0", "1", "0"], ["1", "1", "1", "1", "1"]
    ] } },
    { callout: { t: "formula", h: "Full adder equations", body: "$S = A \\oplus B \\oplus C_{in}$ · $C_{out} = A \\cdot B + C_{in} \\cdot (A \\oplus B)$ — the A-level 2018 Figure 5 circuit is exactly this, with H the sum and G the carry. Cout is 1 when **at least two** inputs are 1; S is 1 when an **odd number** are." } },
    { table: { head: ["", "Half adder", "Full adder"], rows: [
      ["Inputs", "2 (A, B)", "3 (A, B, carry in)"],
      ["Outputs", "sum, carry", "sum, carry out"],
      ["Gates", "XOR + AND (2)", "2 XOR, 2 AND, 1 OR (5) — or 2 half adders + OR"],
      ["Use", "the least significant column only", "every other column of a multi-bit adder"]
    ] } },
    { callout: { t: "tip", h: "Concatenating full adders", body: "An n-bit adder chains n full adders: the **carry out of each column is the carry in of the next** (a ripple-carry adder). This is the ALU's adder (4.7.3.1) and does exactly the column addition of 4.5.4.3 — carry out of the top column is the overflow/carry flag." } },
    { callout: { t: "miscon", h: "\"A half adder adds half a number\"", body: "It adds two single bits. It is \"half\" because it handles only half the job of a column — it has no carry **in**. Calling a full adder circuit \"an adder\" or \"a half adder\" is **NE.** (A-level 2018 Q03.3)." } },
    { worked: { tag: "exam", title: "Purpose of Figure 5", src: "A-level June 2018 · P2 Q03.3 · 1 mark",
      q: "Explain the purpose of the circuit in Figure 5 (outputs G and H above).",
      steps: [{ m: "It adds together its (three) inputs // it is a **full adder** circuit;", mk: "1 mark", n: "NE. half-adder, adder." }], result: "Full adder" } },
    { worked: { tag: "exam", title: "Exactly two gates", src: "A-level June 2023 · P2 Q09.1–09.2 · 4 marks",
      q: "Table 4: inputs A B → outputs C D: 00 → 0 0, 01 → 0 1, 10 → 0 1, 11 → 1 0. (a) Draw a logic circuit that produces these outputs using exactly two gates. (b) Explain the purpose of the circuit.",
      steps: [
        { m: "(a) C = A·B: A and B into an AND gate whose output is C;", mk: "1 mark" },
        { m: "D = A ⊕ B: A and B into an XOR gate whose output is D;", mk: "1 mark" },
        { m: "circuit fully correct with exactly two gates;", mk: "1 mark", n: "Building XOR from AND/OR/NOT is correct but uses too many gates: 2 marks." },
        { m: "(b) It adds two bits together // it is a **half adder**;", mk: "1 mark", n: "A. \"an adder\" as BOD. R. full adder." }
      ], result: "AND + XOR: a half adder" } },

    { page: "The D-type flip-flop" },
    { fig: { w: 560, h: 196, items: (function () {
      var it = [];
      it.push({ poly: [[40, 40], [130, 40], [130, 130], [40, 130]], c: "text2", w: 1.8, fill: "accent", alpha: 0.08 });
      it.push(wire([[10, 62], [40, 62]]), wire([[10, 108], [40, 108]]), wire([[130, 62], [160, 62]]));
      it.push({ poly: [[40, 100], [52, 108], [40, 116]], close: false, c: "text2", w: 1.6 });
      it.push(lab(52, 62, "D", { size: 12, pos: "e", off: 0 }), lab(56, 108, "Clock", { size: 11, b: false, pos: "e", off: 0 }), lab(118, 62, "Q", { size: 12, pos: "w", off: 0 }));
      it.push(lab(85, 156, "edge-triggered", { size: 10.5, b: false, c: "muted" }), lab(85, 170, "D-type flip-flop", { size: 10.5, b: false, c: "muted" }));
      [250, 290, 330, 370, 410, 450, 490, 530].forEach(function (x) { it.push({ line: [[x, 22], [x, 182]], c: "muted", w: 1, dash: "3 4" }); });
      it.push(lab(212, 40, "Clock", { size: 11 }), lab(212, 100, "D", { size: 11 }), lab(212, 160, "Q", { size: 11 }));
      var ck = [[230, 0]];
      [250, 290, 330, 370, 410, 450, 490, 530].forEach(function (x) { ck.push([x, 1], [x + 20, 0]); });
      it.push(wave(ck.filter(function (p) { return p[0] <= 550; }), 550, 30, 50, "text2"));
      it.push(wave([[230, 0], [265, 1], [315, 0], [340, 1], [360, 0], [390, 1], [480, 0]], 550, 90, 110, "accent2"));
      it.push(wave([[230, 0], [290, 1], [330, 0], [410, 1], [490, 0]], 550, 150, 170, "accent"));
      it.push(lab(355, 130, "ignored: D changed and changed back between edges", { size: 10, b: false, c: "muted" }));
      return it;
    })(), cap: "Q takes the value of D only at each rising clock edge (dashed lines) and holds it until the next edge — the brief pulse on D between edges never reaches Q." } },
    { kv: [
      ["Purpose", "a **memory unit**: it **stores one bit** (the state of its data input)"],
      ["Inputs", "**D** (data) and **Clock** — the clock tells it when to store"],
      ["Edge-triggered", "Q changes only on the **rising edge** of the clock: at that instant Q becomes the value of D"],
      ["Between edges", "Q is held (remembered) whatever D does"],
      ["Clock's role", "**synchronises** a group of flip-flops so they all update together"]
    ] },
    { ul: [
      "A **register** is a row of D-type flip-flops sharing one clock — an 8-bit register stores a byte (4.7.3.1).",
      "Flip-flops are **volatile**: a stored bit is lost when the power is removed.",
      "Gates are **combinational** (outputs depend only on the current inputs); a flip-flop is **sequential** (its output depends on what was stored)."
    ] },
    { callout: { t: "miscon", h: "\"A flip-flop keeps its value when the power is off\"", body: "**R.** — it is volatile. And its second input is the **clock**, **not** set/reset (**R.** set/reset; that is the SR latch, not on the spec)." } },
    { worked: { tag: "exam", title: "Purpose of a D-type flip-flop", src: "A-level June 2017 · P2 Q04.4 · 1 mark",
      q: "Explain the general purpose of a D-type flip-flop.",
      steps: [{ m: "Used to store state (of the data input) // used as a memory unit;", mk: "1 mark", n: "R. if stated that it keeps its state when the power is turned off." }], result: "Stores one bit" } },
    { worked: { tag: "exam", title: "The other input", src: "A-level June 2017 · P2 Q04.5 · 2 marks",
      q: "One input to a D-type flip-flop is a data signal. State what the other input is and what it is used for.",
      steps: [
        { m: "Input: clock / trigger / enable;", mk: "1 mark", n: "R. set / reset." },
        { m: "Used for: the state of the data input is stored // the output is updated to reflect the current state of the input;", mk: "1 mark", n: "A. synchronising a group of flip-flops. R. \"changes the state of the flip-flop\"." }
      ], result: "Clock — when to store D" } },
    { worked: { tag: "exam", title: "A pulse on the clock", src: "A-level June 2024 · P2 Q06.2 · 1 mark",
      q: "Figure 3 shows an edge-triggered D-type flip-flop. Explain how the output Q will be affected when a pulse is received on the Clock input.",
      steps: [{ m: "Output Q will change to (reflect the current value of) D // if D = 1, Q is set to 1 and if D = 0, Q is set to 0;", mk: "1 mark", n: "NE. \"Q will update\"." }], result: "Q takes the value of D" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["State the gate", "The name — NAND, not \"NOT AND\"."],
      ["Complete the truth table", "Every cell; 2ⁿ rows in binary order; one column per gate; marks are per column."],
      ["Write a Boolean expression", "Build from the inputs; bracket each gate's output; do not simplify unless asked."],
      ["Draw a circuit", "Distinctive shapes, one gate per operator, branch dots, the restriction obeyed (only AND/OR/NOT; exactly two gates)."],
      ["Explain the purpose", "Read the completed table: adder, decoder, letter test…"],
      ["Explain (flip-flop)", "Stores one bit; clock input; Q takes D on the clock edge."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Never Annoy Old Xylophone Nerds Nightly\"", body: "The six gates: **N**OT, **A**ND, **O**R, **X**OR, **N**AND, **N**OR. Precedence \"**B**ig **N**ew **A**ir **O**rgan\": Brackets, NOT, AND, OR. Half adder = \"**S**ee **X**, **C**ount **A**ces\": Sum = XOR, Carry = AND." } },
    { callout: { t: "warn", h: "Specific errors", body: ["NAND written as \"NOT AND\" (R. in 2022).", "Missing branch dots, or drawing an input twice.", "Ignoring precedence: A + B·C is A OR (B AND C).", "Calling a full adder \"a half adder\" or just \"an adder\" (NE.).", "Set/reset as the flip-flop's other input (R.); \"keeps data when powered off\" (R.).", "Using a NOR/NAND when the question says only AND, OR and NOT."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.6.5.1 Boolean algebra simplifies these circuits; 4.5.4.3 binary addition is what the adder does; 4.5.5.3 parity bits from XOR; 4.7.3.1 the ALU and registers (adders and flip-flops); 4.5.5.2 ASCII and the case bit; 4.7.3.5 the AQA instructions AND, ORR, EOR, MVN apply these gates bitwise." } }
  ],
  flashcards: [
    ["Truth table of XOR?", "0 1 1 0 — 1 when the inputs differ."],
    ["Truth table of NAND?", "1 1 1 0."],
    ["Truth table of NOR?", "1 0 0 0."],
    ["How do you recognise AND, OR from a table?", "AND: only 1 1 gives 1. OR: only 0 0 gives 0."],
    ["What does the bubble mean on a gate symbol?", "NOT — invert."],
    ["Precedence in Boolean expressions?", "Brackets, NOT, AND, OR."],
    ["Half adder outputs?", "S = A ⊕ B, C = A · B."],
    ["Full adder outputs?", "S = A ⊕ B ⊕ Cin; Cout = A·B + Cin·(A ⊕ B)."],
    ["Half vs full adder?", "Full adder also takes a carry in (three inputs)."],
    ["How is an n-bit adder built?", "n full adders chained: each carry out feeds the next carry in."],
    ["Purpose of a D-type flip-flop?", "A memory unit storing one bit."],
    ["Inputs of a D-type flip-flop?", "Data (D) and clock."],
    ["When does Q change on an edge-triggered D-type?", "Only on the (rising) clock edge — Q becomes D."],
    ["Purpose of a 3-to-8 decoder?", "Output Qn is 1 when the binary input has the value n."],
    ["Wires crossing without a dot?", "Not connected."]
  ],
  quiz: [
    { q: "Which gate outputs 1 only when both inputs are 0?", opts: ["NOR", "NAND", "XOR", "AND"], ans: 0, why: "1 0 0 0." },
    { q: "A half adder's carry output is", opts: ["A AND B", "A XOR B", "A OR B", "A NAND B"], ans: 0, why: "Carry only on 1 + 1." },
    { q: "A + B·C means", opts: ["A OR (B AND C)", "(A OR B) AND C", "A AND B AND C", "(A AND B) OR C"], ans: 0, why: "AND before OR." },
    { q: "An edge-triggered D-type flip-flop's output changes", opts: ["on the clock edge, to the value of D", "whenever D changes", "when power is removed", "on set/reset"], ans: 0, why: "Clocked." },
    { q: "Truth table 0 1 1 0 is", opts: ["XOR", "OR", "NAND", "XNOR"], ans: 0, why: "Inputs differ." },
    { q: "A full adder has how many inputs?", opts: ["3", "2", "4", "1"], ans: 0, why: "A, B, carry in." }
  ]
};

/* =====================================================================
   4.6.5.1  Using Boolean algebra
   ===================================================================== */
C["compsci:4.6.5.1"] = {
  notes: [
    { h: "Using Boolean algebra — the whole topic on one page" },
    "Spec 4.6.5.1: be familiar with the use of **Boolean identities** and **De Morgan's laws** to manipulate and simplify Boolean expressions.",
    "A 4-mark simplification is on almost every Paper 2 — 26 sub-questions in the packs:",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Simplify, showing working", "Using the rules of Boolean algebra, simplify", "4", "AS 2016 Q03, 2017 Q05.3, 2018 Q09.4, 2019 Q06.4, 2020 Q05.3, 2022 Q07.5, 2023 Q07.3, 2024 Q06.4; A-level 2017 Q04.3, 2019 Q08.4, 2020 Q06.4, 2022 Q03.3, 2023 Q09.3, 2024 Q06.3, 2025 Q13"],
      ["Show that X = Y", "Using the laws, show that", "4", "A-level 2018 Q10"],
      ["One-step simplification", "Simplify", "1", "AS 2016 Q05.2–05.3"],
      ["Prove an equivalence with a truth table; name the law", "Complete / State", "1–3", "AS 2017 Q05.2, 2022 Q07.4; A-level 2022 Q03.1–03.2"],
      ["Apply De Morgan; the single replacement gate", "Apply / What single gate", "1", "AS 2019 Q06.3, 2025 Q08.1"],
      ["Explain why an identity holds", "Explain (without a truth table)", "2", "A-level 2019 Q08.3"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Identities** — the toolkit, each explained.", "**De Morgan's laws**.", "**How simplifications are marked**, and a method.", "**Simplifications: AS**.", "**Simplifications: A-level**.", "**Exam toolkit**."] },

    { page: "Identities" },
    { table: { head: ["Law", "AND form", "OR form"], rows: [
      ["Identity (with 0/1)", "$X \\cdot 1 = X$", "$X + 0 = X$"],
      ["Annulment (null)", "$X \\cdot 0 = 0$", "$X + 1 = 1$"],
      ["Idempotent", "$X \\cdot X = X$", "$X + X = X$"],
      ["Complement", "$X \\cdot \\overline{X} = 0$", "$X + \\overline{X} = 1$"],
      ["Double negation", "$\\overline{\\overline{X}} = X$", ""],
      ["Commutative", "$X \\cdot Y = Y \\cdot X$", "$X + Y = Y + X$"],
      ["Associative", "$(X \\cdot Y) \\cdot Z = X \\cdot (Y \\cdot Z)$", "$(X + Y) + Z = X + (Y + Z)$"],
      ["Distributive", "$X \\cdot (Y + Z) = X \\cdot Y + X \\cdot Z$", "$X + Y \\cdot Z = (X + Y) \\cdot (X + Z)$"],
      ["Absorption (redundancy)", "$X \\cdot (X + Y) = X$", "$X + X \\cdot Y = X$"],
      ["(derived)", "", "$X + \\overline{X} \\cdot Y = X + Y$"],
      ["XOR", "$X \\oplus 1 = \\overline{X}$, $X \\oplus 0 = X$", "$X \\oplus Y = X \\cdot \\overline{Y} + \\overline{X} \\cdot Y$"]
    ] } },
    { callout: { t: "def", h: "Why absorption works", body: "$X + X \\cdot Y$: if X = 1 the whole OR is 1 = X; if X = 0 then $X \\cdot Y = 0$ too, giving 0 = X. Either way the result is X — Y never matters. Factorised: $X \\cdot (1 + Y) = X \\cdot 1 = X$." } },
    { callout: { t: "miscon", h: "Boolean + is not arithmetic +", body: "$1 + 1 = 1$ in Boolean algebra (OR), not 2; $X + X = X$, not 2X. And the second distributive law, $X + Y \\cdot Z = (X + Y) \\cdot (X + Z)$, has **no** counterpart in ordinary arithmetic." } },
    { worked: { tag: "exam", title: "Why $A \\cdot \\overline{A} = 0$", src: "A-level June 2019 · P2 Q08.3 · 2 marks",
      q: "Identities are often applied to help simplify Boolean expressions. One such identity is $A \\cdot \\overline{A} = 0$. Without using a truth table, explain why this identity is true.",
      steps: [
        { m: "If A is 0 then NOT A is 1, and if A is 1 then NOT A is 0 // the inputs to the AND can only be 0,1 or 1,0 — one is always 0;", mk: "1 mark", n: "NE. only one way round. NE. \"NOT A is always the opposite\" unless the values are clarified as 0/1." },
        { m: "An AND gate only outputs 1 if both inputs are 1 // always outputs 0 if one input is 0;", mk: "1 mark" }
      ], result: "One input is always 0, so AND gives 0" } },
    { worked: { tag: "exam", title: "Two one-mark simplifications", src: "AS June 2016 · P2 Q05.2–05.3 · 2 marks",
      q: "In a circuit inside a processor, the value at M is $1 \\cdot \\overline{C}$ and the output T is $1 \\oplus \\overline{C}$. Simplify each expression.",
      steps: [
        { m: "$1 \\cdot \\overline{C} = \\overline{C}$ (identity $X \\cdot 1 = X$);", mk: "1 mark" },
        { m: "$1 \\oplus \\overline{C} = C$ (XOR with 1 inverts: $1 \\oplus X = \\overline{X}$, so the two NOTs cancel);", mk: "1 mark", n: "The circuit inverts every input bit then adds 1 with half adders — it negates a two's complement number (4.5.4.6)." }
      ], result: "C̄; C" } },

    { page: "De Morgan's laws" },
    { callout: { t: "formula", h: "De Morgan's laws", body: "$\\overline{A \\cdot B} = \\overline{A} + \\overline{B}$ and $\\overline{A + B} = \\overline{A} \\cdot \\overline{B}$ — they extend to any number of terms: $\\overline{A + B + C} = \\overline{A} \\cdot \\overline{B} \\cdot \\overline{C}$." } },
    { callout: { t: "mnemonic", h: "\"Break the line, change the sign\"", body: "Cut the long bar into a bar over each part, and swap the operator underneath (· ↔ +). Reverse it to join bars: \"join the line, change the sign\". Brackets: keep each former operand together — $\\overline{A \\cdot B + C} = \\overline{A \\cdot B} \\cdot \\overline{C}$, not $\\overline{A} + \\overline{B} + \\overline{C}$." } },
    { fig: circuit(500, 110, function (add, it) {
      var n = add(gate("NAND", 40, 55));
      n.ins.forEach(function (p, i) { it.push(wire([[16, p[1]], p]), lab(8, p[1], i ? "B" : "A", { size: 11 })); });
      it.push(wire([n.out, [120, 55]]));
      it.push(lab(160, 55, "≡", { size: 22 }));
      var o = add(gate("OR", 240, 55));
      o.ins.forEach(function (p, i) { it.push({ circle: [p[0] - 4, p[1], 4], c: "text2", w: 1.6 }, wire([[212, p[1]], [p[0] - 8, p[1]]]), lab(204, p[1], i ? "B" : "A", { size: 11 })); });
      it.push(wire([o.out, [320, 55]]));
      it.push(lab(410, 40, "NOT(A·B)", { size: 11.5 }), lab(410, 60, "= Ā + B̄", { size: 11.5 }), lab(410, 82, "a NAND is an OR with", { size: 10.5, b: false, c: "muted" }), lab(410, 96, "inverted inputs", { size: 10.5, b: false, c: "muted" }));
    }, "De Morgan as circuits: bubbles move across a gate and swap AND ↔ OR. Likewise a NOR is an AND with inverted inputs.") },
    { worked: { tag: "exam", title: "Prove an equivalence with a truth table", src: "AS June 2017 · P2 Q05.2 · 3 marks",
      q: "Complete the truth table to prove that $A + \\overline{B}$ is equivalent to $\\overline{\\overline{A} \\cdot B}$ (rows AB = 00, 01, 10, 11).",
      steps: [
        { m: "$\\overline{B}$: 1, 0, 1, 0 and $\\overline{A}$: 1, 1, 0, 0", mk: "1 mark" },
        { m: "$\\overline{A} \\cdot B$: 0, 1, 0, 0", mk: "1 mark" },
        { m: "$A + \\overline{B}$: 1, 0, 1, 1 and $\\overline{\\overline{A} \\cdot B}$: 1, 0, 1, 1 — identical columns prove the equivalence.", mk: "1 mark", n: "I. order of columns." }
      ], result: "Both columns 1 0 1 1" } },
    { worked: { tag: "exam", title: "Complete the table; name the law", src: "A-level June 2022 · P2 Q03.1–03.2 · 2 marks",
      q: "Complete the truth table with columns A + B, $\\overline{A}$, $\\overline{B}$, $\\overline{A} \\cdot \\overline{B}$, $\\overline{\\overline{A} \\cdot \\overline{B}}$, then state the name of the law it demonstrates.",
      steps: [
        { m: "A + B: 0,1,1,1 · $\\overline{A}$: 1,1,0,0 · $\\overline{B}$: 1,0,1,0 · $\\overline{A} \\cdot \\overline{B}$: 1,0,0,0 · $\\overline{\\overline{A} \\cdot \\overline{B}}$: 0,1,1,1", mk: "1 mark" },
        { m: "De Morgan's (law);", mk: "1 mark" }
      ], result: "De Morgan's law" } },
    { worked: { tag: "exam", title: "The single replacement gate", src: "AS June 2019 · P2 Q06.3 · 1 mark",
      q: "De Morgan's laws can be applied to enable a combination of gates to be replaced by a single gate. What single gate could replace the combination in $\\overline{\\overline{A} \\cdot \\overline{B}}$?",
      steps: [{ m: "$\\overline{\\overline{A} \\cdot \\overline{B}} = \\overline{\\overline{A}} + \\overline{\\overline{B}} = A + B$ → **OR**;", mk: "1 mark", n: "A. A + B." }], result: "OR" } },
    { worked: { tag: "exam", title: "Apply De Morgan", src: "AS June 2025 · P2 Q08.1 · 1 mark",
      q: "Apply De Morgan's law to $\\overline{A \\cdot B}$.",
      steps: [{ m: "$\\overline{A} + \\overline{B}$", mk: "1 mark" }], result: "Ā + B̄" } },
    { worked: { tag: "exam", title: "Simplify using a truth table", src: "AS June 2022 · P2 Q07.4 · 3 marks",
      q: "Complete the truth table with columns $\\overline{B}$, $(A + \\overline{B})$, $(A + \\overline{B}) \\cdot B$, then use the final column to give a simplified expression for $(A + \\overline{B}) \\cdot B$.",
      steps: [
        { m: "$A + \\overline{B}$: 1, 0, 1, 1 (with $\\overline{B}$: 1, 0, 1, 0)", mk: "1 mark" },
        { m: "$(A + \\overline{B}) \\cdot B$: 0, 0, 0, 1", mk: "1 mark" },
        { m: "Only row 11 gives 1 → $A \\cdot B$", mk: "1 mark", n: "Algebra agrees: $A \\cdot B + \\overline{B} \\cdot B = A \\cdot B + 0$." }
      ], result: "A·B" } },
    { callout: { t: "tip", h: "Side by side: two meanings of \"normalisation\"", body: "Simplifying a Boolean expression is often loosely called *reducing* or *normalising* it — not to be confused with **normalising a floating-point number** (4.5.4.8: shift so the mantissa starts 01 or 10, for maximum precision) or **normalising a database** (4.10.4: remove redundancy to third normal form). All three remove waste; none is the same operation." } },

    { page: "How simplifications are marked" },
    { kv: [
      ["1 mark", "the **final answer** (fully simplified)"],
      ["MAX 3", "for working — one mark per **application of a technique** that gives a *simpler* expression: De Morgan (with any NOT-cancelling), an identity other than cancelling NOTs, expanding brackets / factorising"],
      ["Simpler", "logically equivalent **and uses fewer logical operators**"],
      ["Stop rule", "marks are awarded **until the first incorrect step**; MAX 3 if the answer is right but working is wrong or missing"],
      ["Brackets", "a De Morgan or expansion that needs brackets must **show** them to earn the mark"]
    ] },
    { callout: { t: "formula", h: "A reliable order of attack", body: [
      "1. **Constants first**: $X \\cdot 1$, $X + 0$, $X + 1$, $X \\cdot 0$, $X + \\overline{X}$, $X \\cdot \\overline{X}$, $D + \\overline{D}$ — they are free marks.",
      "2. **Break long bars** with De Morgan, from the **outside in**, one bar per line; cancel double NOTs.",
      "3. **Expand** brackets, then tidy with $X \\cdot X = X$, $X + X = X$, $X \\cdot \\overline{X} = 0$.",
      "4. **Factorise** common terms; look for $X + \\overline{X} = 1$ inside the bracket.",
      "5. **Absorb**: $X + X \\cdot Y = X$; $X + \\overline{X} \\cdot Y = X + Y$.",
      "6. Check with **one row** of a truth table, then write the law beside every line."
    ] } },
    { callout: { t: "warn", h: "The precedence trap (A-level 2025 incorrect example)", body: "Applying De Morgan to $\\overline{A \\cdot B + \\overline{A} \\cdot C}$ as $\\overline{A} + \\overline{B} \\cdot A + \\overline{C}$ **loses the precedence** — no marks if that is the first step. Correct: $\\overline{A \\cdot B} \\cdot \\overline{\\overline{A} \\cdot C} = (\\overline{A} + \\overline{B}) \\cdot (A + \\overline{C})$, brackets kept." } },

    { page: "Simplifications: AS" },
    { worked: { tag: "exam", title: "Simplify $(\\overline{A} + B) \\cdot \\overline{A + \\overline{B + A}}$", src: "AS June 2016 · P2 Q03 · 4 marks",
      q: "Using the rules of Boolean algebra, simplify $(\\overline{A} + B) \\cdot \\overline{A + \\overline{B + A}}$. You must show your working.",
      steps: [
        { h: "De Morgan", m: "$(\\overline{A} + B) \\cdot (\\overline{A} \\cdot (B + A))$", mk: "1 mark" },
        { h: "Expand", m: "$(\\overline{A} + B) \\cdot (\\overline{A} \\cdot B + \\overline{A} \\cdot A)$", mk: "1 mark" },
        { h: "$X \\cdot \\overline{X} = 0$, $X + 0 = X$", m: "$(\\overline{A} + B) \\cdot \\overline{A} \\cdot B$", mk: "1 mark" },
        { h: "Expand; $X \\cdot X = X$ twice", m: "$\\overline{A} \\cdot \\overline{A} \\cdot B + B \\cdot \\overline{A} \\cdot B = \\overline{A} \\cdot B + \\overline{A} \\cdot B$" },
        { h: "$X + X = X$", m: "$\\overline{A} \\cdot B$", mk: "1 mark" }
      ], result: "Ā·B" } },
    { worked: { tag: "exam", title: "Simplify $(X + Y) \\cdot (X + \\overline{Y})$", src: "AS June 2017 · P2 Q05.3 · 4 marks",
      q: "Using the laws of Boolean algebra, simplify $(X + Y) \\cdot (X + \\overline{Y})$. You must show your working.",
      steps: [
        { h: "Expand", m: "$X \\cdot X + X \\cdot \\overline{Y} + Y \\cdot X + Y \\cdot \\overline{Y}$", mk: "1 mark" },
        { h: "$X \\cdot X = X$, $Y \\cdot \\overline{Y} = 0$", m: "$X + X \\cdot \\overline{Y} + X \\cdot Y + 0$", mk: "1 mark" },
        { h: "Factorise", m: "$X \\cdot (1 + \\overline{Y} + Y)$", mk: "1 mark" },
        { h: "$1 + \\ldots = 1$", m: "$X$", mk: "1 mark", n: "Faster: the second distributive law gives $X + Y \\cdot \\overline{Y} = X + 0 = X$ in two lines." }
      ], result: "X" } },
    { worked: { tag: "exam", title: "Simplify $\\overline{\\overline{A \\cdot (\\overline{B} + 0)} \\cdot \\overline{\\overline{A} \\cdot (B + B)}}$", src: "AS June 2018 · P2 Q09.4 · 4 marks",
      q: "Using the rules of Boolean algebra, simplify $\\overline{\\overline{A \\cdot (\\overline{B} + 0)} \\cdot \\overline{\\overline{A} \\cdot (B + B)}}$. You must show your working.",
      steps: [
        { h: "$X + 0 = X$", m: "$\\overline{\\overline{A \\cdot \\overline{B}} \\cdot \\overline{\\overline{A} \\cdot (B + B)}}$", mk: "1 mark" },
        { h: "$X + X = X$", m: "$\\overline{\\overline{A \\cdot \\overline{B}} \\cdot \\overline{\\overline{A} \\cdot B}}$", mk: "1 mark" },
        { h: "De Morgan (and cancel NOTs)", m: "$A \\cdot \\overline{B} + \\overline{A} \\cdot B$", mk: "1 mark" },
        { m: "Final answer $A \\cdot \\overline{B} + \\overline{A} \\cdot B$ (= $A \\oplus B$)", mk: "1 mark" }
      ], result: "A·B̄ + Ā·B" } },
    { worked: { tag: "exam", title: "Simplify $A \\cdot (A + C) \\cdot \\overline{A} + \\overline{\\overline{A} \\cdot \\overline{A \\cdot B}}$", src: "AS June 2019 · P2 Q06.4 · 4 marks",
      q: "Using the rules and identities of Boolean algebra, simplify $A \\cdot (A + C) \\cdot \\overline{A} + \\overline{\\overline{A} \\cdot \\overline{A \\cdot B}}$.",
      steps: [
        { h: "Absorption", m: "$A \\cdot (A + C) = A$, so the first term is $A \\cdot \\overline{A}$", mk: "1 mark" },
        { h: "Complement", m: "$A \\cdot \\overline{A} = 0$", mk: "1 mark" },
        { h: "De Morgan", m: "$\\overline{\\overline{A} \\cdot \\overline{A \\cdot B}} = A + A \\cdot B$", mk: "1 mark" },
        { h: "Absorption; $0 + X = X$", m: "$0 + A = A$", mk: "1 mark" }
      ], result: "A" } },
    { worked: { tag: "exam", title: "Simplify $\\overline{\\overline{A + B \\cdot \\overline{B}} + C \\cdot A}$", src: "AS June 2020 · P2 Q05.3 · 4 marks",
      q: "Using the rules and identities of Boolean algebra, simplify $\\overline{\\overline{A + B \\cdot \\overline{B}} + C \\cdot A}$. You must show your working.",
      steps: [
        { h: "$B \\cdot \\overline{B} = 0$", m: "$\\overline{\\overline{A + 0} + C \\cdot A}$", mk: "1 mark" },
        { h: "De Morgan", m: "$(A + 0) \\cdot \\overline{C \\cdot A}$" },
        { h: "De Morgan", m: "$(A + 0) \\cdot (\\overline{C} + \\overline{A})$", mk: "1 mark" },
        { h: "$A + 0 = A$", m: "$A \\cdot (\\overline{C} + \\overline{A})$", mk: "1 mark" },
        { h: "Expand; $A \\cdot \\overline{A} = 0$", m: "$A \\cdot \\overline{C} + 0 = A \\cdot \\overline{C}$", mk: "1 mark" }
      ], result: "A·C̄" } },
    { worked: { tag: "exam", title: "Simplify $(A + \\overline{B}) \\cdot \\overline{\\overline{A} + B}$", src: "AS June 2022 · P2 Q07.5 · 4 marks",
      q: "Using the rules and identities of Boolean algebra, simplify $(A + \\overline{B}) \\cdot \\overline{\\overline{A} + B}$.",
      steps: [
        { h: "De Morgan", m: "$(A + \\overline{B}) \\cdot (A \\cdot \\overline{B})$", mk: "1 mark" },
        { h: "Multiply out", m: "$A \\cdot A \\cdot \\overline{B} + \\overline{B} \\cdot A \\cdot \\overline{B}$", mk: "1 mark" },
        { h: "$X \\cdot X = X$", m: "$A \\cdot \\overline{B} + A \\cdot \\overline{B}$", mk: "1 mark" },
        { h: "$X + X = X$", m: "$A \\cdot \\overline{B}$", mk: "1 mark", n: "Or absorption: $(A + \\overline{B}) \\cdot A \\cdot \\overline{B}$ — the bracket is absorbed by A." }
      ], result: "A·B̄" } },
    { worked: { tag: "exam", title: "Simplify $\\overline{\\overline{A} + \\overline{B}} + B \\cdot \\overline{A} \\cdot (\\overline{C} + C)$", src: "AS June 2023 · P2 Q07.3 · 4 marks",
      q: "Using the rules of Boolean algebra, simplify $\\overline{\\overline{A} + \\overline{B}} + B \\cdot \\overline{A} \\cdot (\\overline{C} + C)$. You must show your working.",
      steps: [
        { h: "$\\overline{C} + C = 1$, $X \\cdot 1 = X$", m: "$\\overline{\\overline{A} + \\overline{B}} + B \\cdot \\overline{A}$", mk: "1 mark" },
        { h: "De Morgan", m: "$A \\cdot B + B \\cdot \\overline{A}$", mk: "1 mark" },
        { h: "Factorise", m: "$B \\cdot (A + \\overline{A}) = B \\cdot 1$", mk: "1 mark" },
        { h: "$X \\cdot 1 = X$", m: "$B$", mk: "1 mark" }
      ], result: "B" } },
    { worked: { tag: "exam", title: "Simplify a four-variable expression", src: "AS June 2024 · P2 Q06.4 · 4 marks",
      q: "Using the rules of Boolean algebra, simplify $\\overline{W} \\cdot X \\cdot Z + W \\cdot Z + X \\cdot Y \\cdot \\overline{Z} + \\overline{W} \\cdot X \\cdot Y \\cdot 1$.",
      steps: [
        { h: "$X \\cdot 1 = X$", m: "$\\overline{W} \\cdot X \\cdot Z + W \\cdot Z + X \\cdot Y \\cdot \\overline{Z} + \\overline{W} \\cdot X \\cdot Y$", mk: "1 mark" },
        { h: "Factorise; $\\overline{W} \\cdot X + W = X + W$", m: "$Z \\cdot (X + W) + X \\cdot Y \\cdot \\overline{Z} + \\overline{W} \\cdot X \\cdot Y \\to X \\cdot Z + W \\cdot Z + X \\cdot Y \\cdot \\overline{Z} + \\overline{W} \\cdot X \\cdot Y$", mk: "1 mark" },
        { h: "Factorise X; $Z + Y \\cdot \\overline{Z} = Z + Y$", m: "$X \\cdot (Z + Y) + W \\cdot Z + \\overline{W} \\cdot X \\cdot Y \\to X \\cdot Z + X \\cdot Y + W \\cdot Z + \\overline{W} \\cdot X \\cdot Y$", mk: "1 mark", n: "At most 1 of the 3 working marks is for the distributive law." },
        { h: "$X \\cdot Y \\cdot (1 + \\overline{W}) = X \\cdot Y$", m: "$X \\cdot Z + X \\cdot Y + W \\cdot Z$ (or $X \\cdot (Z + Y) + W \\cdot Z$)", mk: "1 mark" }
      ], result: "X·Z + X·Y + W·Z" } },

    { page: "Simplifications: A-level" },
    { worked: { tag: "exam", title: "Simplify $\\overline{\\overline{\\overline{A} + A \\cdot (A + B)} + \\overline{B} \\cdot \\overline{C}}$", src: "A-level June 2017 · P2 Q04.3 · 4 marks",
      q: "Using the rules of Boolean algebra, simplify $\\overline{\\overline{\\overline{A} + A \\cdot (A + B)} + \\overline{B} \\cdot \\overline{C}}$. You must show your working.",
      steps: [
        { h: "De Morgan", m: "$(\\overline{A} + A \\cdot (A + B)) \\cdot \\overline{\\overline{B} \\cdot \\overline{C}}$", mk: "1 mark" },
        { h: "De Morgan", m: "$(\\overline{A} + A \\cdot (A + B)) \\cdot (B + C)$", mk: "1 mark" },
        { h: "Absorption $A \\cdot (A + B) = A$", m: "$(\\overline{A} + A) \\cdot (B + C)$", mk: "1 mark" },
        { h: "$\\overline{A} + A = 1$, $1 \\cdot X = X$", m: "$B + C$", mk: "1 mark" }
      ], result: "B + C" } },
    { worked: { tag: "exam", title: "Show that $(A + B) \\cdot (B + C \\cdot (D + \\overline{D})) = A \\cdot C + B$", src: "A-level June 2018 · P2 Q10 · 4 marks",
      q: "Using the laws of Boolean algebra, show that $(A + B) \\cdot (B + C \\cdot (D + \\overline{D})) = A \\cdot C + B$. You must show your working.",
      steps: [
        { h: "$X + \\overline{X} = 1$", m: "$(A + B) \\cdot (B + C \\cdot 1)$", mk: "1 mark" },
        { h: "$X \\cdot 1 = X$", m: "$(A + B) \\cdot (B + C)$", mk: "1 mark" },
        { h: "Distribution", m: "$A \\cdot B + A \\cdot C + B \\cdot B + B \\cdot C$", mk: "1 mark", n: "Only one mark for the distributive law however often it is used." },
        { h: "$X \\cdot X = X$; absorption twice", m: "$A \\cdot B + A \\cdot C + B + B \\cdot C = A \\cdot C + B$", mk: "1 mark", n: "MAX 3 if the working does not END at $A \\cdot C + B$ — in a show-that, the target is the final line. Shortcut: $(B + A) \\cdot (B + C) = B + A \\cdot C$ by the second distributive law (worth 2)." }
      ], result: "= A·C + B" } },
    { worked: { tag: "exam", title: "Simplify $\\overline{\\overline{\\overline{B} \\cdot A} \\cdot \\overline{B}} + A \\cdot B$", src: "A-level June 2019 · P2 Q08.4 · 4 marks",
      q: "Using the rules of Boolean algebra, simplify $\\overline{\\overline{\\overline{B} \\cdot A} \\cdot \\overline{B}} + A \\cdot B$. You must show your working.",
      steps: [
        { h: "De Morgan", m: "$\\overline{(B + \\overline{A}) \\cdot \\overline{B}} + A \\cdot B$", mk: "1 mark" },
        { h: "Expand", m: "$\\overline{B \\cdot \\overline{B} + \\overline{A} \\cdot \\overline{B}} + A \\cdot B$", mk: "1 mark" },
        { h: "$X \\cdot \\overline{X} = 0$, $X + 0 = X$", m: "$\\overline{\\overline{A} \\cdot \\overline{B}} + A \\cdot B$", mk: "1 mark" },
        { h: "De Morgan; absorption", m: "$A + B + A \\cdot B = A + B$", mk: "1 mark" }
      ], result: "A + B" } },
    { worked: { tag: "exam", title: "Simplify $\\overline{\\overline{A \\cdot (A + 1)} \\cdot \\overline{B}} \\cdot \\overline{\\overline{A} + \\overline{B} + 0}$", src: "A-level June 2020 · P2 Q06.4 · 4 marks",
      q: "Using the rules of Boolean algebra, simplify $\\overline{\\overline{A \\cdot (A + 1)} \\cdot \\overline{B}} \\cdot \\overline{\\overline{A} + \\overline{B} + 0}$. You must show your working.",
      steps: [
        { h: "$X + 1 = 1$", m: "$\\overline{\\overline{A \\cdot 1} \\cdot \\overline{B}} \\cdot \\overline{\\overline{A} + \\overline{B} + 0}$", mk: "1 mark" },
        { h: "$X \\cdot 1 = X$; $X + 0 = X$", m: "$\\overline{\\overline{A} \\cdot \\overline{B}} \\cdot \\overline{\\overline{A} + \\overline{B}}$", mk: "1 mark" },
        { h: "De Morgan (both)", m: "$(A + B) \\cdot (A \\cdot B)$", mk: "1 mark" },
        { h: "Expand; $X \\cdot X = X$; $X + X = X$", m: "$A \\cdot A \\cdot B + B \\cdot A \\cdot B = A \\cdot B$", mk: "1 mark" }
      ], result: "A·B" } },
    { worked: { tag: "exam", title: "Simplify $\\overline{\\overline{A} + B \\cdot C + B \\cdot \\overline{C}} + C \\cdot (A + \\overline{A} \\cdot (B + 1))$", src: "A-level June 2022 · P2 Q03.3 · 4 marks",
      q: "Using the rules of Boolean algebra, simplify $\\overline{\\overline{A} + B \\cdot C + B \\cdot \\overline{C}} + C \\cdot (A + \\overline{A} \\cdot (B + 1))$. You must show your working.",
      steps: [
        { h: "$X + 1 = 1$; $X \\cdot 1 = X$", m: "$C \\cdot (A + \\overline{A} \\cdot 1) = C \\cdot (A + \\overline{A})$", mk: "1 mark" },
        { h: "$X + \\overline{X} = 1$; $X \\cdot 1 = X$", m: "the second part is $C$", mk: "1 mark", n: "The two sub-expressions are marked independently." },
        { h: "Factorise; $C + \\overline{C} = 1$", m: "$\\overline{\\overline{A} + B \\cdot (C + \\overline{C})} = \\overline{\\overline{A} + B}$", mk: "1 mark" },
        { h: "De Morgan", m: "$A \\cdot \\overline{B} + C$", mk: "1 mark" }
      ], result: "A·B̄ + C" } },
    { worked: { tag: "exam", title: "Simplify $A \\cdot \\overline{B} + B \\cdot \\overline{\\overline{A} + (\\overline{B} \\cdot C)}$", src: "A-level June 2023 · P2 Q09.3 · 4 marks",
      q: "Using the rules of Boolean algebra, simplify $A \\cdot \\overline{B} + B \\cdot \\overline{\\overline{A} + (\\overline{B} \\cdot C)}$. You must show your working.",
      steps: [
        { h: "De Morgan", m: "$A \\cdot \\overline{B} + B \\cdot A \\cdot \\overline{\\overline{B} \\cdot C}$", mk: "1 mark" },
        { h: "De Morgan", m: "$A \\cdot \\overline{B} + B \\cdot A \\cdot (B + \\overline{C})$", mk: "1 mark", n: "2 marks if both are applied at once. MAX 2 for working without a successful De Morgan." },
        { h: "Expand; $X \\cdot X = X$", m: "$A \\cdot \\overline{B} + A \\cdot B + A \\cdot B \\cdot \\overline{C}$", mk: "1 mark" },
        { h: "Factorise; $X + \\overline{X} = 1$; absorption", m: "$A \\cdot (\\overline{B} + B) + A \\cdot B \\cdot \\overline{C} = A + A \\cdot B \\cdot \\overline{C} = A$", mk: "1 mark" }
      ], result: "A" } },
    { worked: { tag: "exam", title: "Simplify to an XOR", src: "A-level June 2024 · P2 Q06.3 · 4 marks",
      q: "Using the rules of Boolean algebra, simplify $\\overline{A} \\cdot (B \\cdot C \\cdot D + B \\cdot C \\cdot \\overline{D} + B) + \\overline{\\overline{A} + B}$. You must show your working.",
      steps: [
        { h: "Factorise", m: "$\\overline{A} \\cdot (B \\cdot C \\cdot (D + \\overline{D}) + B) + \\overline{\\overline{A} + B}$", mk: "1 mark" },
        { h: "$X + \\overline{X} = 1$; $X \\cdot 1 = X$", m: "$\\overline{A} \\cdot (B \\cdot C + B) + \\overline{\\overline{A} + B}$", mk: "1 mark" },
        { h: "Absorption $X + X \\cdot Y = X$", m: "$\\overline{A} \\cdot B + \\overline{\\overline{A} + B}$", mk: "1 mark" },
        { h: "De Morgan", m: "$\\overline{A} \\cdot B + A \\cdot \\overline{B} = A \\oplus B$", mk: "1 mark", n: "A. XOR; A. $\\overline{A} \\cdot B + A \\cdot \\overline{B}$. MAX 2 for working without De Morgan." }
      ], result: "A ⊕ B" } },
    { worked: { tag: "exam", title: "Simplify $\\overline{A \\cdot B + \\overline{A} \\cdot C + B \\cdot C + \\overline{B} \\cdot A}$", src: "A-level June 2025 · P2 Q13 · 4 marks",
      q: "Using the rules of Boolean algebra, simplify $\\overline{A \\cdot B + \\overline{A} \\cdot C + B \\cdot C + \\overline{B} \\cdot A}$. You must show your working.",
      steps: [
        { h: "Factorise", m: "$\\overline{A \\cdot (B + \\overline{B}) + \\overline{A} \\cdot C + B \\cdot C}$", mk: "1 mark" },
        { h: "$X + \\overline{X} = 1$; $X \\cdot 1 = X$", m: "$\\overline{A + \\overline{A} \\cdot C + B \\cdot C}$", mk: "1 mark" },
        { h: "$X + \\overline{X} \\cdot Y = X + Y$", m: "$\\overline{A + C + B \\cdot C}$", mk: "1 mark" },
        { h: "Absorption", m: "$\\overline{A + C}$", mk: "1 mark", n: "R. $\\overline{A} \\cdot \\overline{C}$ as the final answer — equivalent, but it uses three operators to $\\overline{A + C}$'s two. Leave the bar unbroken. Do NOT start with De Morgan across all four terms: it is long, and done wrongly it loses precedence and every mark." }
      ], result: "NOT(A + C)" } },
    { callout: { t: "miscon", h: "\"Simplest\" is counted in operators", body: "AQA's \"simpler\" means **fewer logical operators** (each NOT, AND, OR counts). $\\overline{A + C}$ has two; $\\overline{A} \\cdot \\overline{C}$ has three — which is why 2025 rejected it. Do not apply De Morgan as a last step unless it reduces the count." } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Simplify, show working", "One law per line, named; 3 working marks + 1 for the final answer."],
      ["Show that", "End on the exact target expression (else MAX 3)."],
      ["Complete the truth table to prove", "Every intermediate column; the two compared columns identical."],
      ["Apply De Morgan", "Break the line, change the sign — keep brackets."],
      ["Explain why (without a truth table)", "Argue both values of the variable, then the gate's rule."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Constants, Bars, Brackets, Absorb\"", body: "The order of attack: clear **C**onstants and complements, break **B**ars (De Morgan, outside in), expand or factor **B**rackets, then **A**bsorb ($X + X \\cdot Y = X$). And for De Morgan: \"break the line, change the sign\"." } },
    { callout: { t: "warn", h: "Specific errors", body: ["De Morgan applied without brackets, so AND/OR precedence changes.", "$X + X = 2X$ or $1 + 1 = 0$ — Boolean OR gives 1.", "Breaking a long bar into pieces without swapping the operator.", "Stopping one step early (not fully simplified) or overshooting into more operators ($\\overline{A} \\cdot \\overline{C}$ for $\\overline{A + C}$).", "Several changes in one line with one wrong — marks stop at the first error."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.6.4.1 every simplification is a cheaper circuit (fewer gates); 4.1.1 Boolean operators in programming — `!(a && b) == (!a || !b)` in C#; 4.5.4.6 the AS 2016 negation circuit; 4.10.4 normalisation and 4.5.4.8 floating-point normalisation are different ideas; 4.10.2 SQL WHERE conditions obey De Morgan too." } }
  ],
  flashcards: [
    ["De Morgan's laws?", "NOT(A·B) = Ā + B̄; NOT(A + B) = Ā·B̄."],
    ["Mnemonic for De Morgan?", "Break the line, change the sign."],
    ["X + X·Y = ?", "X (absorption)."],
    ["X·(X + Y) = ?", "X (absorption)."],
    ["X + X̄·Y = ?", "X + Y."],
    ["X·X̄ = ? and X + X̄ = ?", "0 and 1."],
    ["X + 1 = ? and X·0 = ?", "1 and 0."],
    ["1 ⊕ X = ?", "X̄ (XOR with 1 inverts)."],
    ["X + Y·Z = ?", "(X + Y)·(X + Z) — the second distributive law."],
    ["How are 4-mark simplifications marked?", "MAX 3 for working (one per technique that simplifies), 1 for the final answer; stop at the first error."],
    ["What counts as \"simpler\"?", "Logically equivalent with fewer logical operators."],
    ["NOT(Ā·B̄) can be replaced by which single gate?", "OR."],
    ["Why is A·Ā = 0?", "One input to the AND is always 0, and AND outputs 1 only if both inputs are 1."]
  ],
  quiz: [
    { q: "$\\overline{A + B}$ equals", opts: ["$\\overline{A} \\cdot \\overline{B}$", "$\\overline{A} + \\overline{B}$", "$A \\cdot B$", "$\\overline{A \\cdot B}$"], ans: 0, why: "Break the line, change the sign." },
    { q: "$A + A \\cdot B$ simplifies to", opts: ["A", "B", "A·B", "A + B"], ans: 0, why: "Absorption." },
    { q: "$(X + Y) \\cdot (X + \\overline{Y})$ simplifies to", opts: ["X", "Y", "1", "X·Y"], ans: 0, why: "X + Y·Ȳ = X." },
    { q: "$A + \\overline{A} \\cdot C$ simplifies to", opts: ["A + C", "A·C", "C", "A"], ans: 0, why: "X + X̄Y = X + Y." },
    { q: "$\\overline{\\overline{A} \\cdot \\overline{B}}$ is a single", opts: ["OR gate", "AND gate", "NOR gate", "XOR gate"], ans: 0, why: "= A + B." },
    { q: "In a 4-mark simplification the final answer earns", opts: ["1 mark", "4 marks", "2 marks", "nothing without working"], ans: 0, why: "3 for working + 1." }
  ]
};

/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
