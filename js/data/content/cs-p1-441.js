/* Kurenai OS — deep content: AQA Computer Science Paper 1, spec 4.4.1.1–
   4.4.1.11 (problem-solving; following and writing algorithms; abstraction;
   information hiding; procedural, functional and data abstraction; problem
   abstraction/reduction; decomposition; composition; automation) at full
   A-level depth, with every program in C#. Each topic REPLACES the entry
   cs-theory-computation.js carried. Every way AQA has examined them
   (7516/1 and 7517/1, June 2016–2025) is worked in the mark scheme's own
   format — the syllogisms, the mislabelled boxes, the six-statement puzzle,
   the prime and binary traces and algorithm purposes, representational
   abstraction and generalisation, information hiding in a class, the
   puzzle-as-graph reduction, decomposition, composition and the 2018 term
   match. Procedural and functional abstraction have never been examined
   on their own; their worked cards are variations. Every C# listing and
   trace was compiled and run under .NET 10. */
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
function arrow(x1, y1, x2, y2, label, o) {
  o = o || {};
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: true, c: o.c || "accent2", w: o.w || 1.6, dash: o.dash }];
  if (label) it.push(txt((x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0), label, { size: 10.5, c: o.c || "accent2" }));
  return it;
}
function seg(x1, y1, x2, y2, col) { return { line: [[x1, y1], [x2, y2]], c: col || "text2", w: 1.5 }; }
function spec(ref, lines) { return { callout: { t: "info", h: "What the specification asks (" + ref + ")", body: lines } }; }

/* =====================================================================
   4.4.1.1  Problem-solving
   ===================================================================== */
C["compsci:4.4.1.1"] = {
  notes: [
    { h: "Problem-solving — the whole topic on one page" },
    spec("4.4.1.1", ["Be able to develop solutions to simple logic problems.", "Be able to check solutions to simple logic problems."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Which conclusion follows from two statements", "Give answer A–D", "1 each", "AS 2016 Q01.1–2"],
      ["Mislabelled boxes", "Describe how", "2", "A-level 2018 Q01.1"],
      ["Self-referential statements", "Explain / which", "1–2", "A-level 2022 Q03"],
      ["What each person learns from \"No\"", "What does … know", "1 each", "A-level 2023 Q02"],
      ["Complete a logic grid", "Complete", "1", "A-level 2019 Q03.1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Techniques**.", "**Worked puzzles**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Techniques" },
    { table: { head: ["Technique", "Use when", "How"], rows: [
      ["Draw it (Venn / grid)", "statements about groups (all, some, none)", "draw the sets the statements describe; a conclusion follows only if EVERY drawing consistent with the statements makes it true"],
      ["Case analysis", "a few possibilities", "try each case; eliminate any that contradict a given fact"],
      ["Proof by contradiction", "\"which statement is true?\"", "assume a statement is true and follow the consequences; a contradiction rules it out"],
      ["Information from silence", "people answering \"no\"", "ask: in which cases WOULD they have known? Those cases are now eliminated for everyone"],
      ["Choose the most informative test", "one action allowed", "pick the action whose outcome distinguishes the most possibilities"]
    ] } },
    { callout: { t: "warn", h: "Checking a solution", body: "A solution is checked by testing it against EVERY rule in the question — not just the ones used to find it. One broken rule and it is wrong." } },

    { page: "Worked puzzles" },
    { worked: { tag: "variation", title: "Who knows what?", q: "Five coloured shapes are on a table: a pink triangle, a pink circle, a blue triangle, a blue square and a yellow circle. Walter is told the colour, Lionel the shape. Asked twice whether they know the shape, both say No both times; asked a third time, both say Yes. Which shape was chosen? (A version of A-level 2023 Q02; the paper's own figure is not reproduced.)",
      steps: [
        { m: "Round 1: Walter would know if the colour were YELLOW (only one yellow shape) → it is not yellow. Lionel would know if the shape were a SQUARE (only one square) → it is not the blue square.", mk: "1" },
        { m: "Left: pink triangle, pink circle, blue triangle. Round 2: Lionel would now know a CIRCLE (the yellow circle is gone) → not a circle. Walter would now know BLUE (the blue square is gone) → not blue.", mk: "1" },
        { m: "Only the pink triangle survives — so both can say Yes in round 3.", mk: "1" }
      ], result: "Pink triangle" } },
    { worked: { tag: "variation", title: "Knights and knaves", q: "On an island knights always tell the truth and knaves always lie. A says: \"We are both knaves.\" What are A and B?",
      steps: [
        { m: "If A were a knight, the statement would be true — but then A would be a knave. Contradiction, so A is a knave.", mk: "1" },
        { m: "A lies, so \"we are both knaves\" is false — they are not both knaves.", mk: "1" },
        { m: "A is a knave, so B must be a knight.", mk: "1" }
      ], result: "A knave, B knight" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Programmers at night", src: "AS June 2016 · P1 Q01.1 · 1 mark",
      q: "Assume both statements are true. All programmers work at night. Nobody who works at night earns lots of money. Conclusion 1: All programmers earn lots of money. Conclusion 2: Some night workers are programmers. Answer A if only Conclusion 1 follows, B if only Conclusion 2 follows, C if neither follows, D if both follow.",
      steps: [{ m: "B;", mk: "1", n: "Programmers ⊂ night workers, and night workers earn little, so Conclusion 1 is false. Every programmer is a night worker, so some night workers are programmers." }],
      result: "B" } },
    { worked: { tag: "exam", title: "Aardvarks and Java", src: "AS June 2016 · P1 Q01.2 · 1 mark",
      q: "Assume both statements are true. Some aardvarks are computing professors. All computing professors love Java. Conclusion 1: All aardvarks love Java. Conclusion 2: All computing professors are aardvarks. Answer A if only Conclusion 1 follows, B if only Conclusion 2, C if neither, D if both.",
      steps: [{ m: "C;", mk: "1", n: "Only SOME aardvarks are professors, so the others need not love Java; and nothing says every professor is an aardvark." }],
      result: "C" } },
    { worked: { tag: "exam", title: "The mislabelled boxes", src: "A-level June 2018 · P1 Q01.1 · 2 marks",
      q: "Three boxes contain onions, carrots, and onions and carrots, labelled \"onions\", \"carrots\" and \"onions and carrots\" — all three labels are wrong. Describe how you can work out what each box actually contains by taking just one vegetable out of one box, without looking inside any of the boxes.",
      steps: [
        { m: "Take a vegetable from the box labelled \"onions and carrots\";", mk: "1", n: "It is mislabelled, so it holds only ONE kind — the vegetable tells you which." },
        { m: "If it is an onion, the box labelled \"onions\" contains carrots and the box labelled \"carrots\" contains onions and carrots. If it is a carrot, the box labelled \"carrots\" contains onions and the box labelled \"onions\" contains onions and carrots;", mk: "1" }
      ], result: "Sample the \"onions and carrots\" box" } },
    { worked: { tag: "exam", title: "Why Statement 1 fails", src: "A-level June 2022 · P1 Q03.1 · 1 mark",
      q: "Which one of these six statements is correct? 1: All of the statements below are correct. 2: None of the statements below are correct. 3: All of the statements above are correct. 4: Exactly one of the statements above is correct. 5: None of the statements above are correct. 6: None of the statements above are correct. Explain why Statement 1 is not correct.",
      steps: [{ m: "If Statement 1 were correct, Statement 5 (or 6) would be correct, which would mean Statement 1 is false // it would make Statement 2 correct, so all the others would have to be both correct and incorrect // only one statement is correct, so Statement 1 cannot be;", mk: "1" }],
      result: "It contradicts itself through 5 and 6" } },
    { worked: { tag: "exam", title: "Which statement is correct?", src: "A-level June 2022 · P1 Q03.2 · 1 mark",
      q: "For the same six statements, which one is correct?",
      steps: [{ m: "(Statement) 5;", mk: "1", n: "1–4 are all false (see 03.3), so \"none of the statements above are correct\" is true. 6 then says 1–5 are all incorrect — false, because 5 is correct." }],
      result: "Statement 5" } },
    { worked: { tag: "exam", title: "Rule out two more", src: "A-level June 2022 · P1 Q03.3 · 2 marks",
      q: "For two statements other than Statement 1 and your answer to 03.2, explain why those statements are not correct.",
      steps: [
        { m: "Statement 3 cannot be correct because Statement 1 is false;", mk: "1" },
        { m: "Statements 1, 2 and 3 are all false, so Statement 4 (\"exactly one above is correct\") is false;", mk: "1", n: "Also: if 6 were true, 5 would be false, so one of 1–4 would be true — but they are all false; and 2 leads to a contradiction with 4. Max 2." }
      ], result: "3 and 4 (or 2, 6) ruled out" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Syllogisms**: draw the sets; a conclusion follows only if it is true in EVERY drawing.",
      "**Self-reference**: assume, follow the consequences, look for a contradiction.",
      "**\"No\" answers**: list the cases where they WOULD have known — all eliminated.",
      "**Explain** answers: name the statement/case and the contradiction it causes."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Some A are B\" does NOT mean \"some A are not B\" — it only guarantees at least one A that is B.",
      "Using real-world knowledge instead of the given statements: assume ONLY what is stated.",
      "Stopping once one rule is satisfied — a solution must satisfy every rule."
    ] } },
    { callout: { t: "mnemonic", h: "\"Draw, assume, eliminate\"", body: "**Draw** the sets or the grid; **assume** a case and chase it to a contradiction; **eliminate** what silence and contradictions rule out." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.1.8 reducing a puzzle to a known problem; 4.1.1.5 Boolean logic; 4.6.2 logic gates and Boolean algebra; 4.4.4.5 heuristics for harder searches; 4.2.4.1 a puzzle as a graph (2019 Q03)." } }
  ],
  flashcards: [
    ["How to test a syllogism?", "Draw every arrangement consistent with the statements; a conclusion follows only if true in all of them."],
    ["Mislabelled boxes: which box to sample?", "The one labelled \"onions and carrots\" — it must hold only one kind.", 3],
    ["What does an answer of \"No\" tell others?", "Every case in which the person would have known is eliminated.", 5],
    ["Checking a solution?", "Test it against every rule, not only those used to find it.", 6],
    ["Proof by contradiction?", "Assume the claim and derive something impossible, so the claim is false.", 7]
  ],
  quiz: [
    { q: "All A are B; no B are C. Which follows?", opts: ["No A are C", "All C are A", "Some C are A", "All B are A"], ans: 0, why: "A sits inside B, which shares nothing with C." },
    { q: "In the boxes puzzle you take from the box labelled", opts: ["onions and carrots", "onions", "carrots", "any box"], ans: 0, why: "It can only hold one kind." },
    { q: "In 2022's puzzle, Statement 4 is false because", opts: ["1, 2 and 3 are all false", "5 is false", "6 is true", "2 is true"], ans: 0, why: "Exactly one of 1–3 would have to be true." },
    { q: "A says \"I am a knave\". This is", opts: ["impossible for either a knight or a knave", "said by a knight", "said by a knave", "true"], ans: 0, why: "A knight can't say it; a knave would be telling the truth." }
  ]
};

/* =====================================================================
   4.4.1.2  Following and writing algorithms
   ===================================================================== */
C["compsci:4.4.1.2"] = {
  notes: [
    { h: "Following and writing algorithms — the whole topic on one page" },
    spec("4.4.1.2", ["Understand the term algorithm: a sequence of steps that can be followed to complete a task and that always terminates.", "Express a solution as an algorithm in pseudo-code using sequence, assignment, selection and iteration.", "Hand-trace algorithms.", "Convert pseudo-code into high-level program code.", "Argue for a program's correctness and efficiency using logical reasoning, test data and user feedback."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Define algorithm", "Define", "2", "AS 2023 Q04"],
      ["Hand-trace pseudo-code", "Complete the table", "3–5", "every AS Paper 1 Section A (AS 2018 Q02 here)"],
      ["State the purpose of an algorithm", "What is the purpose / explain", "1", "AS 2016 Q04.2, AS 2019 Q03.3, AS 2020 Q03.3"],
      ["Spot an inefficiency", "State one reason", "1", "AS 2025 Q03.3"],
      ["Write the program", "Write", "6–11", "every AS Section A (worked in 4.1.1)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**What an algorithm is**.", "**Tracing**.", "**Purpose, correctness and efficiency**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "What an algorithm is" },
    { callout: { t: "def", h: "Algorithm", body: "A **sequence of steps** that can be followed to complete a task and that **always terminates**." } },
    { kv: [
      ["Sequence", "steps carried out in order"],
      ["Assignment", "giving a variable a value: Total ← Total + X"],
      ["Selection", "choosing a path: IF … THEN … ELSE"],
      ["Iteration", "repeating: FOR (definite), WHILE / REPEAT (indefinite)"],
      ["Terminates", "it must finish for every valid input — a process that may run for ever is not an algorithm"]
    ] },

    { page: "Tracing" },
    { steps: [
      "One column per variable (and one for output); a new row each time a value changes.",
      "Evaluate conditions exactly — < vs ≤, AND vs OR — and write the Boolean when a column asks for it.",
      "MOD gives the remainder, DIV the whole-number quotient.",
      "Stop exactly where the algorithm stops: re-check the loop condition after every pass."
    ] },
    { code: { lang: "csharp", src: "// AS 2018 Q02's prime test in C#\nstatic string PrimeTest(int number)\n{\n    int root = 1;\n    while (root * root < number) root++;          // smallest root with root² ≥ number\n    int d = 2;\n    bool factorFound = false;\n    while (!factorFound && d <= root)\n    {\n        int r = number % d;\n        if (r == 0) factorFound = true;\n        d++;\n    }\n    return factorFound ? \"Not prime\" : \"Prime\";\n}\n// 5 → Root 3; d 2 (r 1), d 3 (r 2) → Prime\n// 25 → Root 5; d 2, 3, 4 (r 1), d 5 (r 0) → Not prime", cap: "Checked by running both traces." } },

    { page: "Purpose, correctness and efficiency" },
    { table: { head: ["Argue for…", "Using"], rows: [
      ["Correctness", "logical reasoning (why each step moves towards the goal, why the loop ends); test data — normal, boundary and erroneous (4.13.1.4)"],
      ["Efficiency", "counting steps as n grows (4.4.4); avoiding unnecessary work — stop when the answer is known, don't repeat comparisons"],
      ["Fitness for users", "user feedback: does it do what they need, in a usable way?"]
    ] } },
    { worked: { tag: "variation", title: "Make the palindrome check efficient", q: "AS 2025's palindrome check compares S[i] with S[Max − i] for EVERY i from 0 to Max. Rewrite the loop in C# so it does the least work.",
      steps: [
        { m: "Only half the string needs checking: pairs (0, Max), (1, Max − 1)… meet in the middle — loop i < s.Length / 2.", mk: "1" },
        { m: "Stop as soon as a mismatch is found: return false inside the loop.", mk: "1" },
        { m: "static bool IsPalindrome(string s) { for (int i = 0; i < s.Length / 2; i++) if (s[i] != s[s.Length - 1 - i]) return false; return true; }", mk: "code", n: "madam: 2 comparisons instead of 5; adam: stops after 1." }
      ], result: "Half the comparisons, early exit" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Define algorithm", src: "AS June 2023 · P1 Q04 · 2 marks",
      q: "Define the term algorithm.",
      steps: [{ m: "A sequence of steps (to complete a task);", mk: "1", n: "R. \"set\" of steps — order matters." }, { m: "That always terminates // runs in finite time;", mk: "1" }],
      result: "Sequence of steps that always terminates" } },
    { worked: { tag: "exam", title: "Trace the prime test with 5", src: "AS June 2018 · P1 Q02.1 · 3 marks",
      q: "INPUT Number; Root ← 1; WHILE (Root * Root) < Number: Root ← Root + 1; ENDWHILE; d ← 2; FactorFound ← FALSE; WHILE (FactorFound = FALSE) AND (d <= Root): r ← Number MOD d; IF r = 0 THEN FactorFound ← TRUE; d ← d + 1; ENDWHILE; IF FactorFound = FALSE THEN OUTPUT \"Prime\" ELSE OUTPUT \"Not prime\". Hand-trace with columns Number, Root, d, FactorFound, r, Output, using 5 as the input.",
      steps: [
        { m: "Root: 1, 2, 3; d: 2, 3, 4;", mk: "1" },
        { m: "r: 1, 2;", mk: "1" },
        { m: "FactorFound FALSE throughout; Output Prime;", mk: "1", n: "Max 2 if any incorrect values. Checked in C#." }
      ], result: "Root 3, r 1 then 2 → Prime" } },
    { worked: { tag: "exam", title: "Trace the prime test with 25", src: "AS June 2018 · P1 Q02.2 · 3 marks",
      q: "Hand-trace the same algorithm with 25 as the input.",
      steps: [
        { m: "Root: 1, 2, 3, 4, 5; d: 2, 3, 4, 5, 6;", mk: "1" },
        { m: "r: 1, 1, 1, 0;", mk: "1" },
        { m: "FactorFound FALSE then TRUE; Output Not prime;", mk: "1", n: "The loop stops because FactorFound is TRUE, even though d (6) has passed Root." }
      ], result: "r 0 at d = 5 → Not prime" } },
    { worked: { tag: "exam", title: "Purpose of the de-duplicator", src: "AS June 2016 · P1 Q04.2 · 1 mark",
      q: "An algorithm copies Items[0] into NewItems, then for each later item checks whether it is already in NewItems and copies it across only if it is not. For Items = 12, 25, 12, 53 it gives NewItems = 12, 25, 53. Explain the purpose of the algorithm.",
      steps: [{ m: "To remove duplicate items from the list // NewItems contains the unique items from Items;", mk: "1" }],
      result: "Removes duplicates" } },
    { worked: { tag: "exam", title: "Purpose of the MOD/DIV loop", src: "AS June 2019 · P1 Q03.3 · 1 mark",
      q: "NumberOut ← 0; Count ← 0; WHILE NumberIn > 0: Count ← Count + 1; PartValue ← NumberIn MOD 2; NumberIn ← NumberIn DIV 2; FOR i ← 1 TO Count − 1: PartValue ← PartValue * 10; ENDFOR; NumberOut ← NumberOut + PartValue; ENDWHILE; OUTPUT NumberOut. What is the purpose of this algorithm?",
      steps: [{ m: "Converts a (positive) decimal/denary number to binary;", mk: "1", n: "22 → 10110, 29 → 11101 (checked in 4.1.1.3)." }],
      result: "Denary → binary" } },
    { worked: { tag: "exam", title: "What the valid inputs share", src: "AS June 2020 · P1 Q03.3 · 1 mark",
      q: "An algorithm multiplies Product by 1, 2, 3, … until Product ≥ X; if X = Product it outputs 1 to Factor, otherwise \"No result\". What is true for all valid inputs for X that output a list of numbers, which is not true for inputs that output No result?",
      steps: [{ m: "X is a factorial number (greater than 1) // X is the product of consecutive whole numbers starting at 1;", mk: "1", n: "720 = 6! → 1 2 3 4 5 6; 600 → No result." }],
      result: "X is a factorial" } },
    { worked: { tag: "exam", title: "Why the palindrome check is inefficient", src: "AS June 2025 · P1 Q03.3 · 1 mark",
      q: "A palindrome check sets Matched ← True, then FOR i ← 0 TO Max: IF S[i] ≠ S[Max − i] THEN Matched ← False. State one reason why the algorithm is not efficient.",
      steps: [{ m: "It makes unnecessary comparisons — the first and last letters are compared twice // the loop continues after a mismatch has been found // it keeps iterating after Matched has been set to False;", mk: "1" }],
      result: "Repeats comparisons; doesn't stop early" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Algorithm** = sequence of steps + always terminates.",
      "**Traces**: one column per variable; new row on change; recheck loop conditions; MOD/DIV exactly.",
      "**Purpose** questions: say what the OUTPUT means (\"converts denary to binary\"), not what the code does line by line.",
      "**Efficiency**: unnecessary repeats, no early exit, work that grows faster than it needs to."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"An algorithm is a program.\" — a program is an algorithm expressed in a programming language; the algorithm is language-independent.",
      "\"A set of steps\" — R.: an algorithm is a SEQUENCE; order matters.",
      "Describing a purpose line by line (\"it loops and does MOD 2…\") instead of the overall effect."
    ] } },
    { callout: { t: "mnemonic", h: "\"SASI, then stop\"", body: "**S**equence · **A**ssignment · **S**election · **I**teration — and an algorithm must always **stop**." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1.2 the three combining principles; 4.1.1 every Section A program; 4.13.1.4 test data; 4.4.4 efficiency and Big-O; 4.4.4.6–4.4.4.7 problems with no algorithm." } }
  ],
  flashcards: [
    ["Four standard constructs?", "Sequence, assignment, selection, iteration.", 1],
    ["Prime test with 25: when is the factor found?", "d = 5, r = 0 → Not prime.", 2],
    ["Prime test with 5: Root?", "3.", 3],
    ["Three ways to argue for a program?", "Logical reasoning, test data, user feedback.", 7]
  ],
  quiz: [
    { q: "Which is NOT part of AQA's definition of an algorithm?", opts: ["written in a programming language", "a sequence of steps", "completes a task", "always terminates"], ans: 0, why: "Algorithms are language-independent." },
    { q: "Prime test with 25: Root ends as", opts: ["5", "4", "6", "25"], ans: 0, why: "5 × 5 is not < 25." },
    { q: "\"Explain the purpose\" wants", opts: ["the overall effect", "a line-by-line description", "a trace table", "the code"], ans: 0, why: "E.g. \"removes duplicates\"." },
    { q: "Checking only i < Length / 2 in a palindrome test", opts: ["halves the comparisons", "misses the middle pair", "is incorrect for even lengths", "doubles the work"], ans: 0, why: "Pairs meet in the middle." }
  ]
};

/* =====================================================================
   4.4.1.3  Abstraction
   ===================================================================== */
function abstractionFig() {
  var it = [];
  it.push(txt(160, 16, "Representational abstraction", { b: true, size: 11.5, c: "text" }));
  it.push({ poly: [[30, 40], [80, 60], [120, 50], [170, 90], [230, 80], [280, 120]], close: false, c: "line", w: 3 });
  it.push({ poly: [[40, 140], [90, 120], [150, 150], [200, 130], [280, 150]], close: false, c: "line", w: 3 });
  it.push(txt(155, 172, "real streets: every bend and building", { size: 10.5 }));
  it = it.concat(arrow(300, 95, 340, 95, null, { c: "text2" }));
  [[360, 60], [430, 60], [500, 60], [570, 60]].forEach(function (p, i) { it.push({ circle: [p[0], p[1], 9], fill: "accent2", alpha: 0.8, c: "accent2", w: 1.4 }); if (i) it.push(seg(p[0] - 61, 60, p[0] - 9, 60, "accent2")); });
  [[360, 130], [465, 130], [570, 130]].forEach(function (p, i) { it.push({ circle: [p[0], p[1], 9], fill: "good", alpha: 0.8, c: "good", w: 1.4 }); if (i) it.push(seg(p[0] - 96, 130, p[0] - 9, 130, "good")); });
  it.push(seg(430, 69, 465, 121, "text2"));
  it.push(txt(465, 172, "schematic map: stations and links only", { size: 10.5 }));
  return { fig: { w: 640, h: 185, items: it, cap: "Representational abstraction: the map keeps only what the task needs (which stops connect) and removes distance, bends and buildings." } };
}
function generalFig() {
  var it = [].concat(boxAt(240, 10, 160, 34, "Vehicle", "accent2"), boxAt(60, 90, 140, 34, "Car", "accent"), boxAt(250, 90, 140, 34, "Lorry", "accent"), boxAt(440, 90, 140, 34, "Bicycle", "accent"));
  it.push(seg(320, 44, 130, 90), seg(320, 44, 320, 90), seg(320, 44, 510, 90));
  it.push(txt(320, 148, "each is a kind of vehicle — grouped by what they have in common", { size: 10.5, c: "text2" }));
  return { fig: { w: 640, h: 160, items: it, cap: "Abstraction by generalisation / categorisation: a hierarchy of the \"is a kind of\" type — the idea behind inheritance (4.1.2.3)." } };
}
/* =====================================================================
   4.4.1.8  Problem abstraction / reduction
   ===================================================================== */
function reductionFig() {
  var it = [];
  for (var r = 0; r < 2; r++) for (var c = 0; c < 2; c++) {
    it.push({ poly: [[30 + c * 50, 30 + r * 50], [80 + c * 50, 30 + r * 50], [80 + c * 50, 80 + r * 50], [30 + c * 50, 80 + r * 50]], fill: "accent", alpha: 0.12, c: "accent", w: 1.3 });
  }
  it.push(txt(55, 55, "A", { b: true, size: 12, c: "text" }), txt(105, 105, "B", { b: true, size: 12, c: "text" }));
  it.push(txt(80, 150, "cells that clash", { size: 10.5 }));
  it = it.concat(arrow(160, 80, 220, 80, "reduce", { c: "text2" }));
  var P = [[290, 40], [370, 40], [290, 120], [370, 120]];
  [[0, 1], [0, 2], [1, 3], [2, 3], [0, 3], [1, 2]].forEach(function (e) { it.push(seg(P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1], "line")); });
  P.forEach(function (p, i) { it.push({ circle: [p[0], p[1], 14], fill: ["accent2", "good", "danger", "accent"][i], alpha: 0.5, c: "text2", w: 1.3 }); it.push(txt(p[0], p[1], String(i), { b: true, size: 11, c: "text" })); });
  it.push(txt(330, 150, "graph colouring", { size: 10.5 }));
  it.push(txt(440, 60, "already solved problem:", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(440, 80, "colour the graph so no edge", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(440, 100, "joins two nodes of one colour", { size: 10.5, c: "text2", pos: "e" }));
  it.push(txt(440, 120, "colours = letters", { size: 10.5, c: "good", pos: "e" }));
  return { fig: { w: 640, h: 165, items: it, cap: "Problem reduction: A-level 2019's letter puzzle becomes graph colouring — each cell a node, an edge between cells that may not share a letter. Any graph-colouring algorithm now solves the puzzle." } };
}
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
