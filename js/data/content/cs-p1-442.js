/* Kurenai OS — deep content: AQA Computer Science Paper 1, spec 4.4.2.1–
   4.4.2.4 (finite state machines with and without output; maths for
   regular expressions — sets; regular expressions; regular languages) and
   4.4.3.1 (BNF and syntax diagrams) at full A-level depth, with every
   program in C#. Each topic REPLACES the entry cs-theory.js,
   cs-theory-computation.js or cs-theory-computation-2.js carried and keeps
   its labs. Every way AQA has examined them (7516/1 and 7517/1, June
   2016–2025) is worked in the mark scheme's own format. Where a paper's
   state diagram is not reproducible, the machine is redrawn from the
   question's description so that the mark scheme's own labels and answers
   hold — every such redraw says so. Every regular expression answer was
   checked against its language by enumerating every string up to length 7
   in C#, and every C# listing was compiled and run under .NET 10. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }
function boxAt(x, y, w, h, label, col, sub) {
  var it = [{ poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill: col || "accent", alpha: 0.16, c: col || "accent", w: 1.6 }];
  if (label) it.push(txt(x + w / 2, y + (sub ? h / 2 - 8 : h / 2), label, { b: true, size: 12, c: "text" }));
  if (sub) it.push(txt(x + w / 2, y + h / 2 + 9, sub, { size: 10.5 }));
  return it;
}
function seg(x1, y1, x2, y2, col) { return { line: [[x1, y1], [x2, y2]], c: col || "text2", w: 1.5 }; }
/* a state transition diagram.
   S: { id: [x, y, label, accepting, start, colour] }
   E: [from, to, label, { off, lo, via:[[x,y]…], loop:"up"|"down" }] */
function fsm(S, E) {
  var r = 18, it = [];
  E.forEach(function (e) {
    var a = S[e[0]], b = S[e[1]], o = e[3] || {};
    if (e[0] === e[1]) {
      var up = o.loop !== "down", cy = up ? a[1] - r - 9 : a[1] + r + 9;
      it.push({ circle: [a[0], cy, 10], c: "text2", w: 1.3 });
      it.push({ line: [[a[0] + 10, cy + (up ? 3 : -3)], [a[0] + 7, a[1] + (up ? -r + 1 : r - 1)]], arrow: true, c: "text2", w: 1.3 });
      it.push(txt(a[0], up ? cy - 18 : cy + 18, e[2], { size: 10.5, b: true, c: "accent2" }));
      return;
    }
    if (o.via) {
      var pts = [[a[0], a[1] + (o.via[0][1] > a[1] ? r : -r)]].concat(o.via);
      var last = o.via[o.via.length - 1];
      it.push({ poly: pts, close: false, c: "text2", w: 1.4 });
      it.push({ line: [last, [b[0], b[1] + (last[1] > b[1] ? r : -r)]], arrow: true, c: "text2", w: 1.4 });
      var m = o.via[Math.floor(o.via.length / 2)];
      it.push(txt(m[0] + (o.lx || 0), m[1] + (o.ly || 10), e[2], { size: 10.5, b: true, c: "accent2" }));
      return;
    }
    var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.sqrt(dx * dx + dy * dy), ux = dx / d, uy = dy / d, nx = -uy, ny = ux, off = o.off || 0;
    it.push({ line: [[a[0] + ux * r + nx * off, a[1] + uy * r + ny * off], [b[0] - ux * r + nx * off, b[1] - uy * r + ny * off]], arrow: true, c: "text2", w: 1.4 });
    var lo = o.lo != null ? o.lo : 10;
    if (e[2]) it.push(txt((a[0] + b[0]) / 2 + nx * (off + lo), (a[1] + b[1]) / 2 + ny * (off + lo), e[2], { size: 10.5, b: true, c: "accent2" }));
  });
  Object.keys(S).forEach(function (k) {
    var s = S[k], col = s[5] || (s[3] ? "good" : "accent");
    it.push({ circle: [s[0], s[1], r], fill: col, alpha: 0.2, c: col, w: 1.6 });
    if (s[3]) it.push({ circle: [s[0], s[1], r - 4], c: col, w: 1.2 });
    it.push(txt(s[0], s[1], s[2] || k, { b: true, size: 10.5, c: "text" }));
    if (s[4]) it.push({ line: [[s[0] - r - 26, s[1]], [s[0] - r, s[1]]], arrow: true, c: "text2", w: 1.4 });
  });
  return it;
}
function spec(ref, lines) { return { callout: { t: "info", h: "What the specification asks (" + ref + ")", body: lines } }; }

/* =====================================================================
   4.4.2.1  Finite state machines with and without output
   ===================================================================== */
var FIG_AS16 = { fig: { w: 640, h: 200, items: fsm(
  { S1: [80, 100, "S1", false, true], S2: [230, 160, "S2"], S3: [380, 100, "S3", true], S4: [530, 160, "S4", false, false, "danger"] },
  [["S1", "S1", "1"], ["S1", "S2", "0"], ["S1", "S3", "x", { lo: 9 }], ["S2", "S3", "x"], ["S2", "S4", "0,1", { lo: -12 }], ["S3", "S4", "0,1,x"], ["S4", "S4", "0,1,x"]]
).concat([txt(380, 186, "double ring = accepting state · S4 is a dead (trap) state", { size: 10.5, c: "text2" })]),
  cap: "AS 2016's FSM, redrawn from its published answers: any number of 1s, at most one 0, then x." } };
var FIG_AS22 = { fig: { w: 640, h: 225, items: fsm(
  { I: [70, 150, "Idle", false, true, "line"], W: [200, 70, "W"], Z: [360, 70, "Z"], Y: [530, 70, "Y"], X: [360, 185, "X"] },
  [["I", "W", "A", { off: 6, lo: 8 }], ["W", "I", "C", { off: 6, lo: 8 }], ["W", "W", "B"], ["W", "Z", "E"], ["Z", "Z", "H"], ["Z", "Y", "I"], ["Z", "X", "G", { lo: 10 }], ["X", "Y", "F"], ["X", "I", "D"]]
).concat([txt(520, 205, "(Y returns to Idle when the time runs out)", { size: 10.5 })]),
  cap: "AS 2022's parking meter, redrawn so that the mark scheme's labels fit: W, X, Y, Z are states; A–I are events." } };
var FIG_AS23 = { fig: { w: 640, h: 235, items: fsm(
  { O: [70, 90, "Off", false, true, "line"], X: [220, 90, "X"], Z: [370, 90, "Z"], Y: [520, 90, "Y"] },
  [["O", "X", "A", { off: 6, lo: 8 }], ["X", "O", "C", { off: 6, lo: 8 }], ["X", "Z", "F"], ["Z", "Y", "I"], ["X", "X", "B"], ["Z", "Z", "H"], ["Y", "Y", "G"],
   ["Z", "O", "D", { via: [[370, 160], [70, 160]], lx: 150, ly: 12 }], ["Y", "O", "E", { via: [[520, 200], [60, 200]], lx: 230, ly: 12 }]]
), cap: "AS 2023's security system, redrawn from its description so that the mark scheme's labels fit: three correct-code transitions back to Off, three incorrect-code self-loops." } };
var FIG_AL21 = { fig: { w: 640, h: 270, items: fsm(
  { S0: [70, 120, "S0", false, true], S1: [200, 50, "S1", true], S3: [360, 50, "S3"], S2: [200, 190, "S2", true], S5: [360, 190, "S5"], S4: [500, 120, "S4", false, false, "danger"] },
  [["S0", "S1", "a"], ["S0", "S2", "b", { lo: -12 }], ["S1", "S3", "b", { off: 6, lo: 6 }], ["S3", "S1", "a", { off: 6, lo: 6 }], ["S2", "S5", "a", { off: 6, lo: 6 }], ["S5", "S2", "b", { off: 6, lo: 6 }],
   ["S3", "S4", "b"], ["S5", "S4", "a", { lo: -12 }], ["S2", "S4", "b", { via: [[200, 250], [500, 250]], lx: -150, ly: 10 }], ["S1", "S4", "a", { via: [[200, 14], [500, 14]], lx: -150, ly: 10 }], ["S4", "S4", "a,b", { loop: "down" }]]
), cap: "A-level 2021's FSM, redrawn: the S2 transitions are exactly those in the mark scheme; it accepts odd-length strings that alternate a and b (checked against a(ba)*|b(ab)* in C#)." } };

C["compsci:4.4.2.1"] = {
  notes: [
    { h: "Finite state machines — the whole topic on one page" },
    spec("4.4.2.1", ["Be able to draw and interpret simple state transition diagrams and state transition tables for FSMs with no output and with output (Mealy machines only)."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Accepted or not? / describe the language", "Indicate / describe", "2 + 3", "AS 2016 Q02"],
      ["Label a partial diagram from a description", "Complete the table", "4–6", "AS 2017 Q01.1, AS 2022 Q02, AS 2023 Q01"],
      ["State transition table rows", "Complete", "2", "A-level 2021 Q06.1"],
      ["Regex for the same language", "Write", "3", "A-level 2021 Q06.2 (4.4.2.3)"],
      ["Interpret states of a sorting FSM", "What does it mean", "1 each", "A-level 2017 Q02.1–3"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**States, transitions, acceptance**.", "**Tables and code**.", "**Mealy machines (with output)**.", "**Modelling a system**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "States, transitions, acceptance" },
    FIG_AS16,
    { kv: [
      ["State", "a circle; the machine is in exactly one state at a time"],
      ["Start state", "marked by an arrow coming from nowhere"],
      ["Transition", "an arrow labelled with the input symbol(s) that cause it"],
      ["Accepting (goal) state", "a double circle: a string is ACCEPTED if the machine is in an accepting state when the input ENDS"],
      ["No transition defined", "the machine stops and REJECTS the input (or goes to a dead/trap state that never leaves)"],
      ["Alphabet", "the set of symbols the machine reads (AS 2016: 0, 1 and x)"]
    ] },
    { callout: { t: "warn", h: "Passing through is not enough", body: "A string is accepted only if the machine ENDS in an accepting state. 1110x is accepted; 1110x0 passes through S3 but ends in S4 — rejected." } },

    { page: "Tables and code" },
    { table: { head: ["Current state", "Input", "New state"], rows: [
      ["S1", "1", "S1"], ["S1", "0", "S2"], ["S1", "x", "S3"], ["S2", "x", "S3"], ["S2", "0 or 1", "S4"], ["S3", "0, 1 or x", "S4"], ["S4", "0, 1 or x", "S4"]
    ] } },
    { code: { lang: "csharp", src: "// the AS 2016 machine as a transition FUNCTION: (state, input) → new state\nstatic string Run(string input)\n{\n    string state = \"S1\";\n    foreach (char c in input)\n        state = (state, c) switch\n        {\n            (\"S1\", '1') => \"S1\",\n            (\"S1\", '0') => \"S2\",\n            (\"S1\", 'x') or (\"S2\", 'x') => \"S3\",\n            _ => \"S4\"                         // every other move goes to the trap state\n        };\n    return state == \"S3\" ? \"YES\" : \"NO\";\n}\n// 111011x NO · 1110x YES · 111001x NO · x YES · 0x YES", cap: "Checked by running." } },
    { diagram: "fsm-lab" },

    { page: "Mealy machines (with output)" },
    { callout: { t: "def", h: "Mealy machine", body: "An FSM **with output**: each transition is labelled **input / output**, so the output depends on the current state AND the input. A Mealy machine has no accepting states — its job is to transform input into output." } },
    { fig: { w: 640, h: 150, items: fsm(
      { L0: [200, 80, "L0", false, true], L1: [440, 80, "L1"] },
      [["L0", "L1", "1 / 1", { off: 7, lo: 8 }], ["L1", "L0", "0 / 1", { off: 7, lo: 8 }], ["L0", "L0", "0 / 0"], ["L1", "L1", "1 / 0"]]
    ).concat([txt(320, 138, "L0 / L1 = last bit was 0 / 1 · input 0110100 → output 0101110", { size: 10.5, c: "text2" })]),
      cap: "A Mealy change detector: the state remembers the previous bit; each transition outputs 1 if the new bit differs." } },
    { code: { lang: "csharp", src: "string prev = \"0\", output = \"\";\nforeach (char ch in \"0110100\")\n{\n    output += ch.ToString() == prev ? \"0\" : \"1\";   // output depends on state AND input\n    prev = ch.ToString();                             // the new state\n}\nConsole.WriteLine(output);                            // 0101110", cap: "Checked by running." } },
    { table: { head: ["Current state", "Input", "Output", "Next state"], rows: [
      ["L0", "0", "0", "L0"], ["L0", "1", "1", "L1"], ["L1", "0", "1", "L0"], ["L1", "1", "0", "L1"]
    ] } },

    { page: "Modelling a system" },
    FIG_AS22,
    FIG_AS23,
    { steps: [
      "List the MODES the system can be in — they are the states (and which one it starts in).",
      "For each state, list the EVENTS that can happen and where each one leads — those are the transitions.",
      "An event that leaves the system where it is (wrong code, extra coin) is a SELF-LOOP.",
      "The same event from different states needs a separate arrow each — that is why AQA's tables assign several labels to one event."
    ] },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Accepted or not?", src: "AS June 2016 · P1 Q02.1 · 2 marks",
      q: "An FSM with alphabet 0, 1 and x accepts 0x and 1x. From start state S1: 1 loops back to S1, 0 goes to S2, x goes to the accepting state S3; from S2, x goes to S3 and 0 or 1 to S4; from S3 any symbol goes to S4; S4 loops on every symbol. Indicate whether each is accepted: 111011x, 1110x, 111001x.",
      steps: [
        { m: "111011x: NO — the 0 goes to S2, then 1 sends it to S4;", mk: "1" },
        { m: "1110x: YES; 111001x: NO (a second 0 from S2 goes to S4);", mk: "1", n: "1 mark for one row correct, 2 for all rows. Checked in C#." }
      ], result: "NO · YES · NO" } },
    { worked: { tag: "exam", title: "Describe the language", src: "AS June 2016 · P1 Q02.2 · 3 marks",
      q: "In words, describe the language (set of strings) that is accepted by the FSM above.",
      steps: [
        { m: "Strings that start with zero or more 1s;", mk: "1", n: "A. any number of 1s (BOD)." },
        { m: "which may or may not be followed by a 0 // at most one 0;", mk: "1" },
        { m: "and end with an x;", mk: "1", n: "\"Ending with either x or 0x\" is worth two marks. MAX 2 if not fully correct. As a regex: 1*0?x." }
      ], result: "1*, optional 0, then x" } },
    { worked: { tag: "exam", title: "Label the parking meter", src: "AS June 2022 · P1 Q02 · 6 marks",
      q: "A parking meter starts in Idle Mode. Pressing + goes to Select Hours Mode (1 hour, £1.00); each further + adds an hour; Accept goes to Payment Due Mode; Cancel cancels the operation. In Payment Due Mode each coin except the last is deducted from the amount owed; the final coin goes to Paid Mode; inserting a payment card goes to a mode for entering the PIN, from which a correct PIN goes to Paid Mode and an incorrect one to Idle Mode. Using the diagram (states W–Z, events A–I), state which label(s) represent: Card Payment Mode, Enter correct PIN, Enter incorrect PIN, Insert a coin (except final), Insert final coin, Insert payment card, Paid Mode, Payment Due Mode, Press Accept, Press Cancel, Press +, Select Hours Mode.",
      steps: [
        { m: "Card Payment Mode X; Select Hours Mode W;", mk: "1" },
        { m: "Enter correct PIN F; Enter incorrect PIN D;", mk: "1" },
        { m: "Insert a coin H; insert final coin I; insert payment card G;", mk: "1" },
        { m: "Paid Mode Y; Payment Due Mode Z;", mk: "1" },
        { m: "Press Accept E; Press Cancel C;", mk: "1" },
        { m: "Press + : A and B (Idle → Select Hours, and the self-loop);", mk: "1", n: "One mark per group; R. any label used more than once. Max 5 if any errors." }
      ], result: "W X Y Z = Select · Card · Paid · Due" } },
    { worked: { tag: "exam", title: "Label the security system", src: "AS June 2023 · P1 Q01 · 6 marks",
      q: "A security system starts off; switching it on goes to sensing mode; it can be switched off at any time by entering the correct code; movement detected in sensing mode goes to alert mode; after 10 seconds in alert mode it enters alarm-bell-ringing mode; an incorrect code, once on, leaves it in its current mode. Using the diagram (states X–Z, events A–I), state the label(s) for: Alarm bell ringing mode, Alert mode, Detect movement, Enter correct code, Enter incorrect code, Sensing mode, Switch on, 10 second delay elapsed.",
      steps: [
        { m: "Alarm bell ringing mode Y; Alert mode Z;", mk: "1" },
        { m: "Sensing mode X; Switch on A;", mk: "1" },
        { m: "Detect movement F; 10 second delay elapsed I;", mk: "1" },
        { m: "Enter correct code: C, D, E (one from each of the three \"on\" modes back to Off);", mk: "1" },
        { m: "Enter incorrect code: B, H, G (a self-loop on each of the three modes);", mk: "1" },
        { m: "…the remaining pair correct;", mk: "1", n: "1 mark per two correct labels; R. any label used more than once; R. more than three labels for either code event. Max 5 if any errors." }
      ], result: "X sensing · Z alert · Y alarm" } },
    { worked: { tag: "exam", title: "Transition table rows for S2", src: "A-level June 2021 · P1 Q06.1 · 2 marks",
      q: "An FSM (redrawn above from the mark scheme) has start state S0, accepting states S1 and S2 and transitions S0 —a→ S1, S0 —b→ S2, S1 —b→ S3, S3 —a→ S1, S2 —a→ S5, S5 —b→ S2, S2 —b→ S4 (a trap state). An FSM can also be represented as a state transition table. Complete the rows of the table (current state, input, new state) that involve state S2.",
      steps: [
        { m: "Rows with current state S2: (S2, a, S5) and (S2, b, S4);", mk: "1" },
        { m: "Rows with new state S2: (S0, b, S2) and (S5, b, S2);", mk: "1", n: "I. order of rows." }
      ], result: "S2 a→S5 · S2 b→S4 · S0 b→S2 · S5 b→S2" } },
    FIG_AL21,

    { page: "Exam toolkit" },
    { steps: [
      "**Accepted** = in an accepting (double) state when the input ENDS.",
      "**Undefined move** = reject (or a trap state).",
      "**Labelling questions**: map each MODE to a state and each EVENT to every arrow it causes; self-loops for \"stays in the same mode\"; never reuse a label.",
      "**Tables**: one row per (current state, input); include rows INTO the state if asked \"involving S2\".",
      "**Mealy**: transitions labelled input/output; no accepting states."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Reaching an accepting state means accepted.\" — only if the input has ENDED there.",
      "\"Mealy machines have accepting states.\" — they produce OUTPUT on each transition instead.",
      "Forgetting self-loops: \"an incorrect code leaves it in its current mode\" is a loop on EACH mode."
    ] } },
    { callout: { t: "mnemonic", h: "\"Circles stay, arrows move, double means done\"", body: "States are **circles**, transitions are labelled **arrows**, and a **double** circle accepts — but only when the input is finished." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.2.3 regular expressions ↔ FSMs; 4.4.2.4 regular languages; 4.4.5.1 Turing machines extend FSMs with a tape; 4.4.1.11 FSMs as automation models; 4.6 sequential circuits; NEA games and menus as state machines." } }
  ],
  flashcards: [
    ["FSM?", "A machine with a finite set of states and transitions between them caused by inputs."],
    ["Start state notation?", "An arrow from nowhere into the state."],
    ["Accepting state notation?", "A double circle."],
    ["When is a string accepted?", "When the FSM is in an accepting state at the end of the input."],
    ["Mealy machine?", "An FSM with output: each transition is labelled input/output."],
    ["State transition table columns?", "Current state, input, new state (plus output for a Mealy machine)."],
    ["Language of AS 2016's FSM?", "Zero or more 1s, optionally a 0, then x (1*0?x)."],
    ["Trap (dead) state?", "A non-accepting state with no way out — every input loops back to it."],
    ["AS 2023: event 'Enter correct code' labels?", "C, D, E."],
    ["AS 2022: Press + labels?", "A and B."]
  ],
  quiz: [
    { q: "An FSM accepts a string if", opts: ["it ends in an accepting state", "it passes through an accepting state", "it never reaches a trap state", "it reads every symbol"], ans: 0, why: "End of input." },
    { q: "1110x on AS 2016's FSM is", opts: ["accepted", "rejected", "undefined", "outputs 1"], ans: 0, why: "1s, one 0, then x." },
    { q: "A Mealy machine's transitions are labelled", opts: ["input / output", "state / output", "input only", "output only"], ans: 0, why: "Definition." },
    { q: "\"An incorrect code leaves it in its current mode\" is drawn as", opts: ["a self-loop on each mode", "one arrow to Off", "an accepting state", "a new state"], ans: 0, why: "Stays put." }
  ],
  sims: ["fsm-lab"]
};

/* =====================================================================
   4.4.2.2  Maths for regular expressions (sets)
   ===================================================================== */
C["compsci:4.4.2.2"] = {
  notes: [
    { h: "Sets — the whole topic on one page" },
    spec("4.4.2.2", ["Be familiar with the concept of a set and the notations A = {1, 2, 3, 4, 5} and set comprehension A = {x | x ∈ ℕ ∧ x ≥ 1}.", "Know the empty set {} — also written Ø.", "Be familiar with compact representation, e.g. {0ⁿ1ⁿ | n ≥ 1}.", "Be familiar with finite, infinite and countably infinite sets, the cardinality of a finite set and the Cartesian product.", "Know subset, proper subset and countable set.", "Know the set operations membership, union, intersection and difference."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Cardinality", "Explain / what is meant", "1", "A-level 2023 Q04.3, 2024 Q04.1"],
      ["What is wrong with a list of subsets", "Explain", "1", "A-level 2024 Q04.2"],
      ["Size of an intersection", "How many", "1", "A-level 2024 Q04.3"],
      ["Regex for a union / a difference of sets", "Write", "2", "A-level 2023 Q04.2, 2024 Q04.5–6 (4.4.2.3)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Notation**.", "**Kinds of set**.", "**Operations**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Notation" },
    { table: { head: ["Notation", "Meaning", "Example"], rows: [
      ["{ … }", "a set listed in full — unordered, no repeats", "{1, 2, 3} = {3, 1, 2}"],
      ["{x | x ∈ ℕ ∧ x ≥ 1}", "set comprehension: all x SUCH THAT (|) x is a natural number AND (∧) x ≥ 1", "{1, 2, 3, …}"],
      ["x ∈ A / x ∉ A", "x is / is not a member of A", "3 ∈ {1, 2, 3}"],
      ["{} or Ø", "the empty set", "{x | x ∈ ℕ ∧ x < 0} = Ø"],
      ["{0ⁿ1ⁿ | n ≥ 1}", "compact representation: n 0s then n 1s", "{01, 0011, 000111, …}"],
      ["ℕ, ℤ, ℚ, ℝ", "naturals {0, 1, 2, …} (AQA includes 0), integers, rationals, reals", "—"]
    ] } },
    { code: { lang: "csharp", src: "// set comprehension {2x | x ∈ {1, 2, 3}} with LINQ\nvar doubled = new[] { 1, 2, 3 }.Select(x => 2 * x);          // {2, 4, 6}\n\n// {0ⁿ1ⁿ | n ≥ 1}, first four members\nvar zeroOne = Enumerable.Range(1, 4).Select(n => new string('0', n) + new string('1', n));\n// 01, 0011, 000111, 00001111", cap: "Checked by running." } },

    { page: "Kinds of set" },
    { kv: [
      ["Finite", "its members can be counted off up to a last one: {a, b}"],
      ["Infinite", "no last member: ℕ, ℝ, {bb, bbbb, bbbbbb, …}"],
      ["Countably infinite", "infinite but can be listed 1st, 2nd, 3rd … (put in one-to-one correspondence with ℕ): ℕ, ℤ, all strings over {a, b}. ℝ is NOT countable"],
      ["Countable", "finite or countably infinite"],
      ["Cardinality", "the number of members of a FINITE set: |{c, d, bb, b}| = 4"],
      ["Cartesian product A × B", "every ordered pair (a, b) with a ∈ A, b ∈ B: |A × B| = |A| × |B|"]
    ] },

    { page: "Operations" },
    { fig: { w: 640, h: 170, items: [].concat(
      [{ circle: [250, 85, 70], fill: "accent", alpha: 0.12, c: "accent", w: 1.6 }, { circle: [370, 85, 70], fill: "accent2", alpha: 0.12, c: "accent2", w: 1.6 },
        txt(205, 85, "a", { b: true, size: 13, c: "text" }), txt(310, 85, "b", { b: true, size: 13, c: "text" }), txt(405, 70, "c   d", { b: true, size: 13, c: "text" }), txt(405, 100, "bb", { b: true, size: 13, c: "text" }),
        txt(210, 18, "R = {a, b}", { b: true, size: 11, c: "accent" }), txt(420, 18, "U = {c, d, bb, b}", { b: true, size: 11, c: "accent2" }),
        txt(310, 160, "R ∩ U = {b} — one member", { size: 10.5, c: "text2" }), txt(540, 85, "R ∪ U = {a, b, c, d, bb}", { size: 10.5, c: "text2" }), txt(90, 85, "R − U = {a}", { size: 10.5, c: "text2" })]
    ), cap: "A-level 2024's sets R and U: they share only b." } },
    { table: { head: ["Operation", "Symbol", "Meaning", "R = {a, b}, U = {c, d, bb, b}"], rows: [
      ["Membership", "∈", "is an element of", "b ∈ R"],
      ["Union", "∪", "in either (or both)", "{a, b, c, d, bb}"],
      ["Intersection", "∩", "in both", "{b}"],
      ["Difference", "− or \\", "in the first but not the second", "R − U = {a}"],
      ["Subset", "⊆", "every member of A is in B (A may equal B)", "{a} ⊆ R, R ⊆ R"],
      ["Proper subset", "⊂", "A ⊆ B and A ≠ B", "{a} ⊂ R, but R ⊄ R"]
    ] } },
    { code: { lang: "csharp", src: "var A = new HashSet<int> { 1, 2, 3, 4, 5 };\nvar B = new HashSet<int> { 4, 5, 6 };\nA.Union(B);                                  // 1,2,3,4,5,6\nA.Intersect(B);                              // 4,5\nA.Except(B);                                 // 1,2,3   (difference)\nnew HashSet<int> { 4, 5 }.IsSubsetOf(B);         // True\nnew HashSet<int> { 4, 5 }.IsProperSubsetOf(B);   // True\nB.IsProperSubsetOf(B);                       // False", cap: "Checked by running. HashSet ignores a repeated Add — sets have no duplicates." } },
    { worked: { tag: "variation", title: "All the subsets", q: "List every subset of R = {a, b} and say which are proper subsets. How many subsets does a set with n members have?",
      steps: [
        { m: "Subsets: Ø, {a}, {b}, {a, b} — four of them.", mk: "1" },
        { m: "Proper subsets: Ø, {a}, {b} — every subset except R itself.", mk: "1" },
        { m: "Each member is either in or out, so a set of n members has 2ⁿ subsets (2² = 4 here).", mk: "1" }
      ], result: "4 subsets; 3 proper" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Cardinality", src: "A-level June 2023 · P1 Q04.3 · 1 mark",
      q: "Explain what is meant by the cardinality of a set.",
      steps: [{ m: "The number of elements/items in a set;", mk: "1", n: "A. the size of a set." }], result: "Number of elements" } },
    { worked: { tag: "exam", title: "Cardinality again", src: "A-level June 2024 · P1 Q04.1 · 1 mark",
      q: "Sets: R = {a, b}; S = {a, abb, abbbb, abbbbbb, …}; T = {bb, bbbb, bbbbbb, …}; U = {c, d, bb, b}. What is meant by the cardinality of a set?",
      steps: [{ m: "The number of members/elements of a set;", mk: "1" }], result: "Number of members" } },
    { worked: { tag: "exam", title: "The missing subset", src: "A-level June 2024 · P1 Q04.2 · 1 mark",
      q: "Explain what is wrong with the statement: 'The only subsets of R are the sets {a}, {b} and {a, b}'.",
      steps: [{ m: "The empty set is also a subset of R // {} / Ø is also a subset of R;", mk: "1", n: "NE. \"they are not the only subsets\" — name the missing one." }], result: "Ø is missing" } },
    { worked: { tag: "exam", title: "Size of R ∩ U", src: "A-level June 2024 · P1 Q04.3 · 1 mark",
      q: "How many members are there in the set formed by the intersection of R = {a, b} and U = {c, d, bb, b}?",
      steps: [{ m: "1 // one;", mk: "1", n: "R ∩ U = {b}. bb is a different member from b." }], result: "1" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Cardinality** = number of members (finite sets).",
      "**Subsets** always include Ø and the set itself; n members → 2ⁿ subsets.",
      "**∪ either · ∩ both · − first but not second**.",
      "Read comprehension aloud: \"the set of x SUCH THAT …\"; ∧ is AND.",
      "Members are compared exactly: b ≠ bb."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "Forgetting the empty set as a subset (2024's whole question).",
      "\"A set can contain repeats.\" — {a, a, b} = {a, b}.",
      "\"Infinite means uncountable.\" — ℕ is infinite but COUNTABLY infinite; ℝ is the uncountable one."
    ] } },
    { callout: { t: "mnemonic", h: "\"Cup is union, cap is intersect\"", body: "∪ looks like a **cup** that holds everything from both; ∩ is a **cap** that only covers what they share." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.2.3 a regular expression describes a set of strings; 4.4.2.4 languages as sets; 4.10 SQL's UNION/INTERSECT; 4.12.1.1 domain and co-domain; maths: set notation." } }
  ],
  flashcards: [
    ["Set?", "An unordered collection of values in which each value occurs at most once."],
    ["Set comprehension {x | x ∈ ℕ ∧ x ≥ 1}?", "All x such that x is a natural number and x ≥ 1."],
    ["Empty set symbols?", "{} or Ø."],
    ["Cardinality?", "The number of elements in a (finite) set."],
    ["Countably infinite?", "Infinite but can be listed in order and matched one-to-one with ℕ."],
    ["Cartesian product A × B?", "All ordered pairs (a, b) with a ∈ A and b ∈ B; |A × B| = |A| × |B|."],
    ["Subset vs proper subset?", "Subset may equal the set; a proper subset must be smaller."],
    ["Subsets of {a, b}?", "Ø, {a}, {b}, {a, b}."],
    ["{a, b} ∩ {c, d, bb, b}?", "{b} — cardinality 1."],
    ["{0ⁿ1ⁿ | n ≥ 1}?", "{01, 0011, 000111, …}."]
  ],
  quiz: [
    { q: "|{c, d, bb, b}| =", opts: ["4", "5", "3", "6"], ans: 0, why: "Four members." },
    { q: "Which is a subset of every set?", opts: ["Ø", "{0}", "ℕ", "{Ø}"], ans: 0, why: "The empty set." },
    { q: "{1, 2, 3} − {2, 3, 4} =", opts: ["{1}", "{4}", "{2, 3}", "{1, 4}"], ans: 0, why: "In the first, not the second." },
    { q: "Which set is NOT countable?", opts: ["ℝ", "ℕ", "ℤ", "all strings over {a, b}"], ans: 0, why: "The reals." },
    { q: "|{a, b} × {0, 1, 2}| =", opts: ["6", "5", "8", "9"], ans: 0, why: "2 × 3." }
  ]
};

/* =====================================================================
   4.4.2.3  Regular expressions
   ===================================================================== */
C["compsci:4.4.2.3"] = {
  notes: [
    { h: "Regular expressions — the whole topic on one page" },
    spec("4.4.2.3", ["Know that a regular expression is simply a way of describing a set, and allows particular types of languages to be described in a convenient shorthand.", "Form and use simple regular expressions for string manipulation and matching.", "Describe the relationship between regular expressions and FSMs; write a regular expression for a given FSM and vice versa.", "Metacharacters: * (0 or more), + (1 or more), ? (0 or 1), | (alternation), ( ) grouping."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["What * / ? / | does", "Explain", "1 each", "A-level 2019 Q04.1–2, 2024 Q04.4"],
      ["Which strings belong to the language", "Complete (Y/N)", "3", "A-level 2019 Q04.3"],
      ["Write a regex for a described format", "Write", "4", "A-level 2017 Q02.4"],
      ["Regex for an FSM's language", "Write", "3", "A-level 2021 Q06.2"],
      ["Regex for a union / set expression", "Write", "2", "A-level 2023 Q04.2, 2024 Q04.5–6"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Metacharacters**.", "**Regex ↔ FSM**.", "**Regex in C#**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Metacharacters" },
    { table: { head: ["Metacharacter", "Meaning", "Example", "Matches"], rows: [
      ["*", "ZERO or more of the preceding element", "ab*", "a, ab, abb, …"],
      ["+", "ONE or more", "ab+", "ab, abb, … (not a)"],
      ["?", "ZERO or ONE — optional", "ab?", "a, ab"],
      ["|", "alternation — either side", "a|bc", "a, bc"],
      ["( )", "grouping — applies an operator to the whole group", "(ab)*", "ε, ab, abab, …"],
      ["(given in the question)", "e.g. \\d any digit, \\a any letter (2017)", "\\d\\d", "two digits"]
    ] } },
    { callout: { t: "warn", h: "What an operator binds to", body: "* + ? apply to the ONE element just before them: ab* is a then any number of b's; (ab)* repeats the pair. | has the LOWEST precedence: a|bc means a OR bc, not (a|b)c." } },
    { worked: { tag: "variation", title: "Read a regex", q: "List the members of the language a(a|b)* with length at most 3.",
      steps: [
        { m: "Must start with a; then any mixture of a and b.", mk: "1" },
        { m: "Length 1: a. Length 2: aa, ab. Length 3: aaa, aab, aba, abb.", mk: "1" }
      ], result: "a, aa, ab, aaa, aab, aba, abb" } },

    { page: "Regex ↔ FSM" },
    { kv: [
      ["Equivalence", "every regular expression has an FSM that accepts exactly its language, and every FSM (without output) has a regular expression — they are two ways to define a regular language"],
      ["FSM → regex", "follow the paths from the start state to each accepting state; loops become *, choices become |"],
      ["Regex → FSM", "a state per position in the pattern; * becomes a loop, ? an optional skip, | a branch"]
    ] },
    { worked: { tag: "variation", title: "Draw the FSM for 1*0?x", q: "Describe an FSM accepting 1*0?x (AS 2016's language).",
      steps: [
        { m: "Start state S1 loops on 1 (the 1*).", mk: "1" },
        { m: "0 from S1 to S2 (the optional 0); x from S1 or S2 to the accepting state S3.", mk: "1" },
        { m: "Anything else goes to a trap state — this is exactly AS 2016's machine (4.4.2.1).", mk: "1" }
      ], result: "Same machine as AS 2016" } },

    { page: "Regex in C#" },
    { code: { lang: "csharp", src: "using System.Text.RegularExpressions;\n\n// IsMatch looks for the pattern ANYWHERE — anchor with ^…$ to test the whole string\nRegex.IsMatch(\"xxabxx\", \"ab\");       // True\nRegex.IsMatch(\"xxabxx\", \"^ab$\");     // False\n\n// A-level 2017's UK postcode (spaces removed); [A-Z] for \\a and [0-9] for \\d\nstring postcode = \"^[A-Z][A-Z]?[0-9]([A-Z]|[0-9])?[0-9][A-Z][A-Z]$\";\nforeach (var p in new[] { \"IP28QY\", \"SW1A1AA\", \"M11AE\", \"ABC12DE\" })\n    Console.Write(Regex.IsMatch(p, postcode) + \" \");      // True True True False", cap: "Checked by running, with eight test postcodes." } },
    { diagram: "regex-sandbox" },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "The * metacharacter", src: "A-level June 2019 · P1 Q04.1 · 1 mark",
      q: "Explain the functionality of the * metacharacter when it is used in a regular expression.",
      steps: [{ m: "Zero or more (of the preceding element/character/value);", mk: "1", n: "A. any number of the preceding element." }], result: "Zero or more" } },
    { worked: { tag: "exam", title: "The ? metacharacter", src: "A-level June 2019 · P1 Q04.2 · 1 mark",
      q: "Explain the functionality of the ? metacharacter when it is used in a regular expression.",
      steps: [{ m: "Zero or one (of the preceding element) // the preceding element is optional;", mk: "1" }], result: "Zero or one" } },
    { worked: { tag: "exam", title: "Which strings match 1|01+?", src: "A-level June 2019 · P1 Q04.3 · 3 marks",
      q: "Show which of the strings belong to the language defined by the regular expression 1|01+: 1, 11, 01, 0111, 0101, 111, 0011.",
      steps: [
        { m: "1 Y · 11 N · 01 Y · 0111 Y;", mk: "2", n: "The language is {1} ∪ {0 followed by one or more 1s}." },
        { m: "0101 N · 111 N · 0011 N;", mk: "1", n: "1 mark for four rows, 2 for five, 3 for all seven. Checked in C#." }
      ], result: "Y N Y Y N N N" } },
    { worked: { tag: "exam", title: "A regex for a UK postcode", src: "A-level June 2017 · P1 Q02.4 · 4 marks",
      q: "A UK postcode (ignoring spaces) is 1 or 2 letters, followed by 1 digit or 2 digits or 1 digit then 1 letter, followed by 1 digit, followed by 2 letters. \\d means any digit and \\a any letter (e.g. \\d\\d\\a\\d is two digits, a letter, a digit). Write a regular expression for a valid UK postcode, using the | metacharacter only once.",
      steps: [
        { m: "Starts with one or two letters: \\a\\a? (or \\a?\\a);", mk: "1", n: "R. if more than two letters are allowed." },
        { m: "then a digit: \\d;", mk: "1" },
        { m: "then an optional letter or digit: (\\a|\\d)?;", mk: "1" },
        { m: "ending with a digit and exactly two letters: \\d\\a\\a — giving \\a\\a?\\d(\\a|\\d)?\\d\\a\\a;", mk: "1", n: "MAX 3 if not fully correct; R. any marks after a second |. A. [A-Z] / [0-9]." }
      ], result: "\\a\\a?\\d(\\a|\\d)?\\d\\a\\a" } },
    { worked: { tag: "exam", title: "Regex for an FSM", src: "A-level June 2021 · P1 Q06.2 · 3 marks",
      q: "Write a regular expression that will recognise the same set of strings as the FSM in 4.4.2.1 (start S0; S0 —a→ S1 and S0 —b→ S2, both accepting; S1 —b→ S3 —a→ S1; S2 —a→ S5 —b→ S2; anything else goes to a trap state).",
      steps: [
        { m: "Two alternatives joined by | — strings starting with a, and strings starting with b;", mk: "1" },
        { m: "(ba)* and (ab)* for the loops S1→S3→S1 and S2→S5→S2;", mk: "1", n: "R. ba* or ab*." },
        { m: "Fully correct: a(ba)*|b(ab)*;", mk: "1", n: "Also accepted: a|b|b(ab)+|a(ba)+. Max 2 if not fully correct. Checked by enumeration." }
      ], result: "a(ba)*|b(ab)*" } },
    { worked: { tag: "exam", title: "The | metacharacter", src: "A-level June 2024 · P1 Q04.4 · 1 mark",
      q: "The language defined by a regular expression can be represented as a set. Explain the functionality of the | (vertical bar) metacharacter when it is used in a regular expression.",
      steps: [{ m: "Either the element (immediately) before or the element (immediately) after // or // alternation;", mk: "1" }], result: "Alternation — or" } },
    { worked: { tag: "exam", title: "Regex for W = S ∪ T", src: "A-level June 2024 · P1 Q04.5 · 2 marks",
      q: "S = {a, abb, abbbb, abbbbbb, …} and T = {bb, bbbb, bbbbbb, …}. Set W is the union of S and T. Write a regular expression that would match all the members of W.",
      steps: [
        { m: "a(bb)* — an a followed by an even number of b's (S);", mk: "1", n: "R. bb*." },
        { m: "|(bb)+ — one or more pairs of b's (T): a(bb)*|(bb)+;", mk: "1", n: "Also: a|a?(bb)+ or (a|bb)(bb)*. Max 1 if any errors. Each checked by enumeration." }
      ], result: "a(bb)*|(bb)+" } },
    { worked: { tag: "exam", title: "Regex for X = V − W", src: "A-level June 2024 · P1 Q04.6 · 2 marks",
      q: "The members of the set V are strings that match a?b+. X is formed by the set operation V − W. Write a regular expression that would match all the members of X.",
      steps: [
        { m: "V − W removes every string with an EVEN number of b's (with or without a leading a), leaving an ODD number of b's, optionally after an a;", mk: "1", n: "Contains ab|b (or a?b)." },
        { m: "(ab|b)(bb)* // a?b(bb)*;", mk: "1", n: "R. bb*. Any expression starting with an optional a then a compulsory b gets at least one mark." }
      ], result: "a?b(bb)*" } },
    { worked: { tag: "exam", title: "A regex for a union", src: "A-level June 2023 · P1 Q04.2 · 2 marks",
      q: "Show that the language defined by the union of the sets {bⁿ | n > 0} and {a, ab} is a regular language by writing a regular expression for the language.",
      steps: [{ m: "a|ab — or ab? — for {a, ab};", mk: "1" }, { m: "b+ for {bⁿ | n > 0}: a|ab|b+ // ab?|b+;", mk: "1", n: "Max 1 if not fully correct." }],
      result: "a|ab|b+" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Meanings**: * zero or more · + one or more · ? zero or one · | or · ( ) group.",
      "**Check every listed string** against the WHOLE expression — no partial matches.",
      "**Build left to right** from the description, one mark point per part (2017: letters · digit · optional · ending).",
      "**Even counts** → (bb)*, (bb)+; **odd** → b(bb)*.",
      "**FSM ↔ regex**: loops → *, branches → |, optional transitions → ?."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"ab* repeats ab.\" — only the b repeats; write (ab)*.",
      "\"* means one or more.\" — that's +; * includes zero (the empty string).",
      "In C#, Regex.IsMatch finds substrings — forgetting ^ and $ makes almost anything \"match\"."
    ] } },
    { callout: { t: "mnemonic", h: "\"Star zero, plus one, question maybe\"", body: "**\\*** = zero or more · **+** = one or more · **?** = maybe (zero or one) · **|** = or." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.2.1 FSMs; 4.4.2.2 sets; 4.4.2.4 regular languages; 4.4.3.1 BNF for languages regexes can't describe; 4.1.1.7 string handling and validation; 4.13.1.4 input validation." } }
  ],
  flashcards: [
    ["* in a regex?", "Zero or more of the preceding element."],
    ["+ in a regex?", "One or more of the preceding element."],
    ["? in a regex?", "Zero or one — the preceding element is optional."],
    ["| in a regex?", "Alternation: the element before OR the element after."],
    ["Strings matching 1|01+ from 1, 11, 01, 0111?", "1, 01, 0111 (not 11)."],
    ["UK postcode regex (2017)?", "\\a\\a?\\d(\\a|\\d)?\\d\\a\\a."],
    ["Regex for odd-length alternating a/b strings (2021)?", "a(ba)*|b(ab)*."],
    ["Regex for {a, abb, abbbb, …} ∪ {bb, bbbb, …}?", "a(bb)*|(bb)+."],
    ["Relationship between regexes and FSMs?", "Equivalent: both define exactly the regular languages."],
    ["Why anchor a regex in C# with ^ $?", "IsMatch otherwise accepts a match anywhere in the string."]
  ],
  quiz: [
    { q: "Which string matches ab+?", opts: ["abbb", "a", "b", "ba"], ans: 0, why: "One or more b's after a." },
    { q: "(ab)* matches", opts: ["the empty string, ab, abab, …", "a, ab, abb", "ab, abb, abbb", "only ab"], ans: 0, why: "The group repeats." },
    { q: "Does 0101 belong to 1|01+?", opts: ["No", "Yes", "Only with *", "Only in C#"], ans: 0, why: "After 0 1 comes 0." },
    { q: "Which matches an odd number of b's?", opts: ["b(bb)*", "(bb)*", "bb+", "b*"], ans: 0, why: "One b plus pairs." },
    { q: "Regex for {a, ab} ∪ {bⁿ | n > 0}", opts: ["a|ab|b+", "ab*", "a|b*", "(a|b)+"], ans: 0, why: "A-level 2023 Q04.2." }
  ],
  sims: ["regex-sandbox"]
};

/* =====================================================================
   4.4.2.4  Regular language
   ===================================================================== */
C["compsci:4.4.2.4"] = {
  notes: [
    { h: "Regular languages — the whole topic on one page" },
    spec("4.4.2.4", ["Know that a language is called regular if it can be represented by a regular expression.", "Also, a regular language is any language that an FSM will accept."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["True/false statements about regular languages", "Complete", "2", "A-level 2020 Q02.1"],
      ["Which of several definitions are regular", "Complete (Y/N)", "3", "A-level 2023 Q04.1"],
      ["Show a language is regular", "Write a regex", "2", "A-level 2023 Q04.2 (4.4.2.3)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**What makes a language regular**.", "**Beyond regular**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "What makes a language regular" },
    { kv: [
      ["Language", "a set of strings over an alphabet — it may be finite or infinite"],
      ["Regular language", "one that can be described by a regular expression — equivalently, accepted by an FSM"],
      ["Finite memory", "an FSM has a fixed number of states, so it can only \"remember\" a bounded amount — e.g. odd/even, the last symbol"],
      ["Infinite is fine", "b+ is regular and infinite: regular ≠ finite"]
    ] },
    { fig: { w: 640, h: 170, items: [].concat(
      boxAt(30, 15, 580, 140, null, "accent2"),
      [txt(320, 34, "context-free languages — described by BNF", { b: true, size: 11, c: "text" })],
      boxAt(70, 55, 250, 85, "Regular languages", "good", "regex = FSM · e.g. 1*0?x, (bb)+"),
      [txt(470, 85, "aⁿbⁿ — needs counting", { size: 10.5, c: "danger" }), txt(470, 105, "balanced brackets ( ( ) )", { size: 10.5, c: "danger" }), txt(470, 125, "nested expressions", { size: 10.5, c: "danger" })]
    ), cap: "Every regular language can be written in BNF, but BNF also describes languages no regex or FSM can — those that need unbounded counting or nesting." } },

    { page: "Beyond regular" },
    { code: { lang: "csharp", src: "// { aⁿbⁿ | n ≥ 0 } needs to COUNT the a's — unbounded memory, so no FSM/regex can do it.\n// A recursive (BNF-style) rule can:   <s> ::= ε | a <s> b\nstatic bool AnBn(string s) =>\n    s == \"\" || (s.Length >= 2 && s[0] == 'a' && s[^1] == 'b' && AnBn(s[1..^1]));\n\nConsole.WriteLine(AnBn(\"aabb\") + \" \" + AnBn(\"aab\"));   // True False", cap: "Checked by running. Recursion = a stack = memory an FSM does not have." } },
    { worked: { tag: "variation", title: "Regular or not?", q: "Are these regular? (a) {aⁿb | n ≥ 1}; (b) (a|b)+ab*; (c) {aⁿbⁿ | n ≥ 1}; (d) <string> ::= <term><op><term> | ( <string> ), <op> ::= ÷ | −, <term> ::= a | b.",
      steps: [
        { m: "(a) Yes — a+b. (b) Yes — it is a regular expression.", mk: "1" },
        { m: "(c) No — equal numbers of a's and b's need unbounded counting.", mk: "1" },
        { m: "(d) No — brackets can nest to any depth and must balance, which needs counting.", mk: "1", n: "These are A-level 2023's Languages D, B and A (D and B regular, A not)." }
      ], result: "Yes · Yes · No · No" } },
    { worked: { tag: "variation", title: "Why no FSM can count", q: "Explain why no finite state machine can accept exactly {aⁿbⁿ | n ≥ 1}.",
      steps: [
        { m: "To accept aⁿbⁿ the machine must remember how many a's it has read, to check the same number of b's.", mk: "1" },
        { m: "n is unbounded, but an FSM has a fixed, finite number of states — with k states it cannot distinguish k + 1 different counts.", mk: "1" },
        { m: "So two prefixes aᵖ and aᵐ (p ≠ m) must end in the same state; then aᵖbᵖ and aᵐbᵖ are treated alike and the machine is wrong for one of them. A grammar with recursion (<s> ::= ab | a<s>b) can describe it.", mk: "1" }
      ], result: "Finite states can't hold an unbounded count" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "True or false about regular languages", src: "A-level June 2020 · P1 Q02.1 · 2 marks",
      q: "A regular language is a language that can be defined by a regular expression. Show which statements are true or false: (a) all regular languages can be represented using a finite state machine without outputs; (b) the set of strings defined by a regular language is always finite in size; (c) there are some languages which can be represented in Backus-Naur Form (BNF) that are not regular languages.",
      steps: [
        { m: "(a) True · (b) False;", mk: "1", n: "b+ is regular and infinite." },
        { m: "(c) True;", mk: "1", n: "1 mark for two rows correct; 2 for all three." }
      ], result: "True · False · True" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Regular** ⇔ a regex describes it ⇔ an FSM accepts it.",
      "Regular languages can be INFINITE.",
      "Not regular: anything needing unbounded counting or nesting (aⁿbⁿ, balanced brackets) — BNF can describe these.",
      "To SHOW a language is regular, write a regex (or an FSM) for it."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Regular languages are finite.\" — b+ is infinite and regular (2020's false statement).",
      "\"If BNF describes it, it isn't regular.\" — BNF describes all regular languages too; it just ALSO describes more."
    ] } },
    { callout: { t: "mnemonic", h: "\"Regular can't count\"", body: "A regular language never needs to **count** without limit — that's why aⁿbⁿ and balanced brackets fall outside." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.2.1 FSMs; 4.4.2.3 regular expressions; 4.4.3.1 BNF (context-free); 4.4.5.1 Turing machines (more powerful still); 4.6 compilers' lexical analysis uses regular languages." } }
  ],
  flashcards: [
    ["Regular language?", "A language that can be represented by a regular expression (equivalently, accepted by an FSM)."],
    ["Can a regular language be infinite?", "Yes — e.g. b+."],
    ["Can an FSM without output represent every regular language?", "Yes."],
    ["Example of a non-regular language?", "{aⁿbⁿ | n ≥ 1}; balanced brackets."],
    ["Why isn't aⁿbⁿ regular?", "It needs unbounded counting/memory; an FSM has finitely many states."],
    ["Can BNF describe non-regular languages?", "Yes — e.g. nested brackets."],
    ["How to show a language is regular?", "Write a regular expression (or FSM) for it."],
    ["A-level 2020 Q02.1 answers?", "True, False, True."]
  ],
  quiz: [
    { q: "Which is NOT regular?", opts: ["{aⁿbⁿ | n ≥ 1}", "a+b", "(ab)*", "1*0?x"], ans: 0, why: "Needs counting." },
    { q: "\"Regular languages are always finite\" is", opts: ["false", "true", "true only for BNF", "true for FSMs"], ans: 0, why: "b+." },
    { q: "Regular languages are exactly those accepted by", opts: ["FSMs", "Turing machines only", "BNF only", "compilers"], ans: 0, why: "Equivalence." },
    { q: "A grammar with ( <string> ) nesting is", opts: ["not regular", "regular", "finite", "a regex"], ans: 0, why: "Nesting depth unbounded." }
  ]
};

/* =====================================================================
   4.4.3.1  Backus-Naur Form / syntax diagrams
   ===================================================================== */
function syntaxFig() {
  var it = [];
  it.push(txt(20, 30, "<natural>", { b: true, size: 11.5, c: "text", pos: "e" }));
  it.push(seg(100, 30, 160, 30), seg(250, 30, 330, 30));
  it = it.concat(boxAt(160, 14, 90, 32, "<digit>", "accent"));
  it.push({ line: [[300, 30], [330, 30]], arrow: true, c: "text2", w: 1.5 });
  it.push({ poly: [[280, 30], [280, 70], [130, 70], [130, 30]], close: false, c: "text2", w: 1.5 });
  it.push({ line: [[130, 40], [130, 32]], arrow: true, c: "text2", w: 1.5 });
  it.push(txt(205, 84, "loop back: another digit", { size: 10.5, c: "text2" }));
  it.push(txt(20, 130, "BNF:", { b: true, size: 11.5, c: "text", pos: "e" }));
  it.push(txt(70, 130, "<natural> ::= <digit> | <digit><natural>", { size: 11, c: "accent2", pos: "e" }));
  it.push(txt(70, 152, "<digit> ::= 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9", { size: 11, c: "text2", pos: "e" }));
  return { fig: { w: 640, h: 170, items: it, cap: "The same rule two ways: a syntax diagram's loop becomes a recursive BNF production (A-level 2017 Q01.2)." } };
}
function parseFig() {
  var it = [].concat(boxAt(250, 8, 140, 30, "<sentence>", "accent2"), boxAt(140, 64, 110, 30, "<np>", "accent"), boxAt(400, 64, 110, 30, "<v>", "accent"),
    boxAt(80, 120, 90, 30, "<d>", "good"), boxAt(220, 120, 90, 30, "<n>", "good"));
  it.push(seg(320, 38, 195, 64), seg(320, 38, 455, 64), seg(195, 94, 125, 120), seg(195, 94, 265, 120));
  it.push(txt(125, 168, "the", { b: true, size: 12, c: "text" }), txt(265, 168, "cat", { b: true, size: 12, c: "text" }), txt(455, 168, "slept", { b: true, size: 12, c: "text" }));
  it.push(seg(125, 150, 125, 158), seg(265, 150, 265, 158), seg(455, 94, 455, 158));
  return { fig: { w: 640, h: 185, items: it, cap: "A parse tree for \"the cat slept\" using A-level 2020's rules: <sentence> → <np><v>, <np> → <d><n>." } };
}
C["compsci:4.4.3.1"] = {
  notes: [
    { h: "BNF and syntax diagrams — the whole topic on one page" },
    spec("4.4.3.1", ["Be able to check language syntax by referring to BNF or syntax diagrams and formulate simple production rules.", "Be able to explain why BNF can represent some languages that cannot be represented using regular expressions."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Valid or not, from a syntax diagram", "Write Yes/No", "3", "A-level 2017 Q01.1"],
      ["Write a BNF rule equivalent to a diagram", "Write", "2", "A-level 2017 Q01.2"],
      ["Combine two rules into one", "Write", "1", "A-level 2020 Q02.2"],
      ["Which strings are valid sentences", "Complete (Y/N)", "1", "A-level 2020 Q02.3"],
      ["Change one rule to allow a sentence", "Change", "1", "A-level 2020 Q02.4"],
      ["Count the sentences a rule defines", "State, showing working", "2 + 1", "A-level 2020 Q02.5–6"],
      ["Why BNF beats regex", "Explain", "1–2", "specification; A-level 2020 Q02.1(c)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**BNF notation**.", "**Syntax diagrams**.", "**Checking syntax in C#**.", "**Why BNF is more powerful**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "BNF notation" },
    { table: { head: ["Symbol", "Meaning", "Example"], rows: [
      ["::=", "is defined as (a production rule)", "<d> ::= a | the"],
      ["< >", "a NON-TERMINAL — replaced using another rule", "<np>, <digit>"],
      ["plain symbols", "TERMINALS — appear in the final string", "cat, 0, +"],
      ["|", "or — alternative definitions", "<digit> ::= 0 | 1 | … | 9"],
      ["recursion", "a rule that uses itself gives repetition", "<natural> ::= <digit> | <digit><natural>"]
    ] } },
    parseFig(),

    { page: "Syntax diagrams" },
    syntaxFig(),
    { kv: [
      ["Rectangle", "a non-terminal (look up its own diagram)"],
      ["Rounded box / circle", "a terminal symbol to be typed exactly"],
      ["Arrows", "the paths you may follow; a valid string is any route from entry to exit"],
      ["Loop back", "repetition — becomes recursion in BNF"]
    ] },

    { page: "Checking syntax in C#" },
    { code: { lang: "csharp", src: "// <natural> ::= <digit> | <digit><natural>  — a recursive-descent recogniser\nstatic bool Natural(string s, int i) =>\n    i < s.Length && char.IsDigit(s[i]) && (i == s.Length - 1 || Natural(s, i + 1));\n// \"407\" True · \"\" False · \"4a\" False\n\n// A-level 2020's grammar: <sentence> ::= <np><v> | <v><np>, <np> ::= <d><n>\nstring[] n = { \"human\", \"dog\", \"cat\", \"baby\" }, d = { \"a\", \"the\" },\n         v = { \"ate\", \"slept\", \"drank\", \"cuddle\" };\nbool Sentence(string s)\n{\n    var w = s.Split(' ');\n    bool NP(int i) => i + 1 < w.Length && d.Contains(w[i]) && n.Contains(w[i + 1]);\n    return w.Length == 3 && ((NP(0) && v.Contains(w[2])) || (v.Contains(w[0]) && NP(1)));\n}\n// cuddle the cat Y · drank a human Y · the cat slept Y · cat or dog N · dog slept N", cap: "Checked by running every example." } },
    { diagram: "bnf-checker" },

    { page: "Why BNF is more powerful" },
    { kv: [
      ["Regex limit", "a regular expression (an FSM) has finite memory: it cannot match unbounded NESTING or COUNTING — balanced brackets, aⁿbⁿ"],
      ["BNF's tool", "RECURSION: a rule can contain itself — <string> ::= ( <string> ) — so nesting to any depth can be described"],
      ["Consequence", "BNF describes context-free languages (programming-language syntax); regexes describe regular languages, a smaller class"]
    ] },
    { worked: { tag: "variation", title: "Write a BNF rule", q: "Write BNF for an identifier: a letter followed by any number of letters or digits.",
      steps: [
        { m: "<letter> ::= a | b | … | z and <digit> ::= 0 | 1 | … | 9.", mk: "1" },
        { m: "<char> ::= <letter> | <digit>.", mk: "1" },
        { m: "<identifier> ::= <letter> | <identifier><char> — the recursion allows any length.", mk: "1", n: "As a regex: [a-z][a-z0-9]* — this language is regular too; BNF can describe it either way." }
      ], result: "<identifier> ::= <letter> | <identifier><char>" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Valid real numbers?", src: "A-level June 2017 · P1 Q01.1 · 3 marks",
      q: "Syntax diagrams define a real number as a natural number, a decimal point, a natural number, then optionally E, a sign (+ or −) and a natural number (the paper's diagram, described in words); a natural number is one or more digits. Write Yes or No for whether each is a valid real number: 87.000, 97+12, 12.31E+12.",
      steps: [
        { m: "87.000: Yes;", mk: "1" },
        { m: "97+12: No — there is no decimal point, and + may only follow E;", mk: "1" },
        { m: "12.31E+12: Yes;", mk: "1", n: "One mark per correct row. Checked against the described syntax in C#." }
      ], result: "Yes · No · Yes" } },
    { worked: { tag: "exam", title: "BNF for a natural number", src: "A-level June 2017 · P1 Q01.2 · 2 marks",
      q: "In BNF a digit is defined as <digit> ::= 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9. Write a BNF production rule to define a natural number (one or more digits, drawn as a loop in the syntax diagram).",
      steps: [
        { m: "Non-recursive case: <natural> ::= <digit> …", mk: "1" },
        { m: "… | <digit><natural> — the recursive case;", mk: "1", n: "A. the cases swapped, or other names for <natural>. Max 1 if any errors, e.g. a missing |." }
      ], result: "<natural> ::= <digit> | <digit><natural>" } },
    { worked: { tag: "exam", title: "One rule for <sentence>", src: "A-level June 2020 · P1 Q02.2 · 1 mark",
      q: "Rules: <sentence> ::= <np><v>; <sentence> ::= <v><np>; <np> ::= <d><n>; <n> ::= human | dog | cat | baby; <d> ::= a | the; <v> ::= ate | slept | drank | cuddle; <c> ::= and | but | or. Write a single rule that could replace the two rules with <sentence> on the left-hand side, without changing what a valid sentence is.",
      steps: [{ m: "<sentence> ::= <np><v> | <v><np>;", mk: "1", n: "R. any answer of more than one rule." }], result: "<np><v> | <v><np>" } },
    { worked: { tag: "exam", title: "Which are valid sentences?", src: "A-level June 2020 · P1 Q02.3 · 1 mark",
      q: "Using those rules, which of these are valid sentences: cuddle the cat; drank a human; the cat slept; cat or dog?",
      steps: [{ m: "Y, Y, Y, N;", mk: "1", n: "cat or dog has no <d> before cat and no <v>. Checked in C#." }], result: "Y Y Y N" } },
    { worked: { tag: "exam", title: "Allow \"dog slept\"", src: "A-level June 2020 · P1 Q02.4 · 1 mark",
      q: "The sentence dog slept is not currently valid. Change the language by adding or modifying exactly one rule so that dog slept is valid. You must not use the terminals dog or slept directly.",
      steps: [{ m: "<np> ::= <d><n> | <n> // <sentence> ::= <np><v> | <n><v> // add <sentence> ::= <n><v> // add <np> ::= <n>;", mk: "1" }],
      result: "<np> ::= <d><n> | <n>" } },
    { worked: { tag: "exam", title: "Count the sentences", src: "A-level June 2020 · P1 Q02.5 · 2 marks",
      q: "To make the cat slept but the dog drank valid, the rule <sentence> ::= <np><v><c><np><v> could be added. Using only the original rules, state the number of different sentences defined by this rule, showing your working.",
      steps: [
        { m: "Number of noun phrases: 2 determiners × 4 nouns = 8;", mk: "1" },
        { m: "8 × 4 × 3 × 8 × 4 = 3072;", mk: "1", n: "Or 2×4×4×3×2×4×4. If wrong, 1 mark for 8 noun phrases or for multiplying a wrong np count correctly by 4, 3, np and 4." }
      ], result: "3072" } },
    { worked: { tag: "exam", title: "How many more?", src: "A-level June 2020 · P1 Q02.6 · 1 mark",
      q: "State how many more sentences are defined by the rule <sentence> ::= <sentence><c><sentence> than by the rule <sentence> ::= <np><v><c><np><v>.",
      steps: [{ m: "Infinitely more;", mk: "1", n: "The rule is recursive, so sentences can be joined without limit." }], result: "Infinitely more" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Read BNF**: ::= defines; < > non-terminals; | or; recursion repeats.",
      "**Check a string**: build a parse tree from the top rule down to terminals — every word must be produced.",
      "**Write a rule**: base case | recursive case. A loop in a syntax diagram = recursion in BNF.",
      "**Counting**: multiply the choices for each part; a recursive rule gives infinitely many.",
      "**BNF vs regex**: recursion lets BNF describe nesting/counting that regexes (finite memory) cannot."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"<sentence> ::= <np><v>, <v><np>\" — a comma isn't BNF; use |.",
      "\"BNF can't express repetition.\" — recursion does it.",
      "Treating a non-terminal as a word: <n> is not the text \"n\"; it stands for any of its alternatives."
    ] } },
    { callout: { t: "mnemonic", h: "\"Angle brackets expand, plain words stay\"", body: "**< >** non-terminals keep expanding; plain **terminals** are what you finally see; **|** offers choices; a rule that names itself **repeats**." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.2.3–4.4.2.4 regex and regular languages; 4.1.1.16 recursion; 4.6.3 compilers — syntax analysis uses BNF grammars; 4.3.3.1 expression syntax and RPN; 4.2.5.1 parse trees." } }
  ],
  flashcards: [
    ["::= in BNF?", "\"Is defined as\" — introduces a production rule."],
    ["Non-terminal?", "A symbol in < > that is replaced using another rule."],
    ["Terminal?", "A symbol that appears in the final string."],
    ["| in BNF?", "Or — separates alternatives."],
    ["BNF for a natural number?", "<natural> ::= <digit> | <digit><natural>."],
    ["Why can BNF describe languages regexes can't?", "Recursion allows unbounded nesting/counting; regexes (FSMs) have finite memory."],
    ["Number of sentences of <np><v><c><np><v> (2020)?", "8 × 4 × 3 × 8 × 4 = 3072."],
    ["Sentences from <sentence> ::= <sentence><c><sentence>?", "Infinitely many."],
    ["Syntax-diagram loop in BNF?", "A recursive rule."],
    ["Is 97+12 a valid real number (2017)?", "No."]
  ],
  quiz: [
    { q: "In BNF, <np> is", opts: ["a non-terminal", "a terminal", "a comment", "an operator"], ans: 0, why: "Angle brackets." },
    { q: "Which allows any number of digits?", opts: ["<natural> ::= <digit> | <digit><natural>", "<natural> ::= <digit><digit>", "<natural> ::= <digit>", "<natural> ::= 0 | 1"], ans: 0, why: "Recursion." },
    { q: "\"cat or dog\" in 2020's language is", opts: ["invalid", "valid", "valid if <c> is added", "a noun phrase"], ans: 0, why: "No determiners or verb." },
    { q: "BNF can describe balanced brackets because it has", opts: ["recursion", "the * metacharacter", "finite states", "terminals"], ans: 0, why: "Nesting." }
  ],
  sims: ["bnf-checker"]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
