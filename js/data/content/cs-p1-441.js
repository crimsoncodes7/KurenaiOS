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
    ["AS 2016 Q01.1 answer?", "B — only Conclusion 2 follows."],
    ["AS 2016 Q01.2 answer?", "C — neither follows."],
    ["Mislabelled boxes: which box to sample?", "The one labelled \"onions and carrots\" — it must hold only one kind."],
    ["Which of 2022's six statements is correct?", "Statement 5."],
    ["What does an answer of \"No\" tell others?", "Every case in which the person would have known is eliminated."],
    ["Checking a solution?", "Test it against every rule, not only those used to find it."],
    ["Proof by contradiction?", "Assume the claim and derive something impossible, so the claim is false."]
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
    ["Algorithm?", "A sequence of steps that can be followed to complete a task and that always terminates."],
    ["Four standard constructs?", "Sequence, assignment, selection, iteration."],
    ["Prime test with 25: when is the factor found?", "d = 5, r = 0 → Not prime."],
    ["Prime test with 5: Root?", "3."],
    ["Purpose of AS 2019's MOD 2 / DIV 2 loop?", "Converts denary to binary."],
    ["What do X values giving a list in AS 2020 Q03 share?", "They are factorial numbers."],
    ["One inefficiency in AS 2025's palindrome check?", "It compares pairs twice and doesn't stop at the first mismatch."],
    ["Three ways to argue for a program?", "Logical reasoning, test data, user feedback."]
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
C["compsci:4.4.1.3"] = {
  notes: [
    { h: "Abstraction — the whole topic on one page" },
    spec("4.4.1.3", ["Be familiar with the concept of abstraction as used in computations.", "Representational abstraction is a representation arrived at by removing unnecessary details.", "Abstraction by generalisation or categorisation is a grouping by common characteristics to arrive at a hierarchical relationship of the \"is a kind of\" type."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["What is representational abstraction?", "What is", "1", "A-level 2019 Q03.2"],
      ["What is abstraction by generalisation?", "What is", "1", "A-level 2019 Q03.3"],
      ["What detail a representation removed", "What information", "1", "A-level 2019 Q03.4 (4.4.1.8)"],
      ["Match the abstraction terms to descriptions", "Complete", "4", "AS 2018 Q01 (4.4.1.11)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Two kinds of abstraction**.", "**Abstraction across the course**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Two kinds of abstraction" },
    abstractionFig(),
    generalFig(),
    { table: { head: [" ", "Representational", "By generalisation / categorisation"], rows: [
      ["Does", "REMOVES unnecessary detail", "GROUPS things by common characteristics"],
      ["Produces", "a simpler model of one thing", "a hierarchy: \"X is a kind of Y\""],
      ["Examples", "the Tube map; a graph of a road network; a game's 2-D grid", "class hierarchies; animal → mammal → dog; shape → polygon → square"]
    ] } },

    { page: "Abstraction across the course" },
    { kv: [
      ["Programming", "subroutines hide how; classes hide data (4.4.1.4–4.4.1.7)"],
      ["Data", "ADTs — a stack is its operations, not its array (4.2.1.4)"],
      ["Hardware", "the layers from transistors to logic gates to machine code to high-level languages (4.6, 4.7)"],
      ["Networks", "protocol layers (TCP/IP stack, 4.9.3)"],
      ["Theory", "FSMs and Turing machines are abstract models of computation (4.4.2, 4.4.5)"]
    ] },
    { worked: { tag: "variation", title: "Which kind?", q: "Classify: (a) a weather app shows only temperature, rain and wind for your town; (b) Fish, Mammal and Bird are all treated as kinds of Animal; (c) a chess program stores the board as an 8 × 8 array of piece codes.",
      steps: [
        { m: "(a) Representational — unneeded weather detail (pressure isobars, satellite data) removed.", mk: "1" },
        { m: "(b) Generalisation — grouped by common characteristics into an \"is a kind of\" hierarchy.", mk: "1" },
        { m: "(c) Representational — the physical board, wood grain and piece shapes are removed; only positions remain.", mk: "1" }
      ], result: "Rep · general · rep" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Representational abstraction", src: "A-level June 2019 · P1 Q03.2 · 1 mark",
      q: "A logic puzzle on a grid of cells has been represented as a graph: each cell is a node and an edge joins two cells that cannot hold the same letter. The graph can be considered to be a representational abstraction. What is representational abstraction?",
      steps: [{ m: "Removing (unnecessary) details;", mk: "1" }], result: "Removing unnecessary detail" } },
    { worked: { tag: "exam", title: "Abstraction by generalisation", src: "A-level June 2019 · P1 Q03.3 · 1 mark",
      q: "The graph is also an abstraction by generalisation of the puzzle. What is abstraction by generalisation?",
      steps: [{ m: "Grouping by common characteristics // a hierarchical / \"kind of\" relationship;", mk: "1", n: "This puzzle is a kind of graph-colouring problem, like any other such puzzle." }],
      result: "Grouping by common characteristics" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Representational** = remove unnecessary detail.",
      "**Generalisation / categorisation** = group by common characteristics → \"is a kind of\" hierarchy.",
      "Say WHICH detail was removed or WHAT was grouped when an example is given."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Abstraction means making something vague.\" — it keeps exactly the detail the task needs, precisely.",
      "\"Generalisation removes detail.\" — it GROUPS; removing detail is representational abstraction.",
      "Too much abstraction removes something the problem needed — a route-planner without distances can't find the shortest route."
    ] } },
    { callout: { t: "mnemonic", h: "\"Remove or Group\"", body: "**R**epresentational **r**emoves detail; **g**eneralisation **g**roups by what is shared." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.1.4–4.4.1.11 the other abstractions; 4.1.2.3 inheritance hierarchies; 4.2.4.1 graphs as representations; 4.2.1.4 ADTs; 4.10.1 data models." } }
  ],
  flashcards: [
    ["Abstraction?", "Simplifying by removing unnecessary detail or grouping by common characteristics."],
    ["Representational abstraction?", "A representation arrived at by removing unnecessary details."],
    ["Abstraction by generalisation?", "Grouping by common characteristics to arrive at an \"is a kind of\" hierarchy."],
    ["Example of representational abstraction?", "The London Underground map."],
    ["Example of generalisation?", "Car, Lorry and Bicycle as kinds of Vehicle (a class hierarchy)."],
    ["2019's puzzle as a graph is…?", "Both a representational abstraction and an abstraction by generalisation."],
    ["Danger of over-abstraction?", "Removing detail the problem actually needs."],
    ["Abstraction in networking?", "Protocol layers — each hides the details of the layers below."]
  ],
  quiz: [
    { q: "A schematic metro map is an example of", opts: ["representational abstraction", "generalisation", "composition", "automation"], ans: 0, why: "Detail removed." },
    { q: "\"A square is a kind of polygon\" reflects", opts: ["generalisation", "representational abstraction", "decomposition", "information hiding"], ans: 0, why: "Is-a-kind-of hierarchy." },
    { q: "Representational abstraction is", opts: ["removing unnecessary details", "grouping by characteristics", "combining procedures", "hiding object details"], ans: 0, why: "A-level 2019 Q03.2." },
    { q: "A route-planner graph that drops road lengths can no longer", opts: ["find the shortest-distance route", "show which towns connect", "be drawn", "store towns"], ans: 0, why: "Needed detail removed." }
  ]
};

/* =====================================================================
   4.4.1.4  Information hiding
   ===================================================================== */
C["compsci:4.4.1.4"] = {
  notes: [
    { h: "Information hiding — the whole topic on one page" },
    spec("4.4.1.4", ["Be familiar with the process of hiding all details of an object that do not contribute to its essential characteristics."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["How a class uses information hiding", "Explain", "1", "A-level 2023 Q09.1"],
      ["Why a private attribute with a public method", "Explain", "2", "A-level 2017 Q08.4 (4.1.2.1)"],
      ["Name the term from a description", "Complete", "part of 4", "AS 2018 Q01 (A)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**What is hidden and why**.", "**In C#**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "What is hidden and why" },
    { fig: { w: 640, h: 170, items: [].concat(
      boxAt(30, 20, 230, 50, "Users of the object see", "accent2", "Enqueue · Dequeue · IsEmpty"),
      boxAt(30, 100, 230, 50, "Hidden inside", "line", "a List, an index, the ordering rule"),
      arrow(145, 70, 145, 100, null, { c: "text2", dash: "5 4" }),
      [txt(300, 34, "a car: steering wheel and pedals are the interface", { size: 10.5, c: "text2", pos: "e" }),
        txt(300, 54, "the engine's workings are hidden", { size: 10.5, c: "text2", pos: "e" }),
        txt(300, 114, "change the hidden part (List → array) and nothing", { size: 10.5, c: "text2", pos: "e" }),
        txt(300, 134, "that uses the object has to change", { size: 10.5, c: "good", pos: "e" })]
    ), cap: "Information hiding: only the essential characteristics (the interface) are visible; everything else is private." } },
    { kv: [
      ["Hidden", "the internal data (private attributes) and how the methods work"],
      ["Visible", "the essential characteristics — the public methods, i.e. the interface"],
      ["Why", "other parts of the program cannot misuse or depend on the internals, so they can be changed safely; fewer errors; easier to reuse and maintain"],
      ["Relationship", "information hiding is the principle; ENCAPSULATION (bundling data with methods, private fields) is how classes achieve it"]
    ] },

    { page: "In C#" },
    { code: { lang: "csharp", src: "class MoveOptionQueue\n{\n    private readonly List<string> queue = new();   // hidden: nobody outside knows it is a List\n\n    public void Add(string option) { queue.Add(option); }\n    public string Take(int position)\n    {\n        string option = queue[position];\n        queue.RemoveAt(position);\n        return option;\n    }\n    public int Count => queue.Count;               // read-only view, no direct access\n}\n\n// other code: var q = new MoveOptionQueue(); q.Add(\"ryott\"); — it cannot reach q.queue", cap: "Swapping the List for an array would change only this class." } },
    { worked: { tag: "variation", title: "Hide a bank balance", q: "Design a C# BankAccount whose balance can never go negative and cannot be set from outside.",
      steps: [
        { m: "private decimal balance; — hidden; no public setter.", mk: "1" },
        { m: "public void Deposit(decimal amount) { if (amount <= 0) throw new ArgumentException(); balance += amount; }", mk: "1" },
        { m: "public bool Withdraw(decimal amount) { if (amount > balance) return false; balance -= amount; return true; } and public decimal Balance => balance; — the rules live in one place.", mk: "1" }
      ], result: "Private state, guarded public methods" } },
    { worked: { tag: "variation", title: "Hidden or exposed?", q: "Does each design use information hiding? (a) public int[] Scores; (b) private int[] scores; with public int Highest(); (c) protected List<Tile> tiles; used only by subclasses.",
      steps: [
        { m: "(a) No — any code can read or overwrite the array, and depends on it being an array.", mk: "1" },
        { m: "(b) Yes — callers only know there is a Highest(); the storage is private and can change.", mk: "1" },
        { m: "(c) Only partly — hidden from unrelated classes but visible to every subclass (2023's scheme rejects protected).", mk: "1" }
      ], result: "No · yes · partly" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Information hiding in a class", src: "A-level June 2023 · P1 Q09.1 · 1 mark",
      q: "The MoveOptionQueue class stores the move options in a private list called Queue and provides public methods to add, remove and read options. Explain how this class uses information hiding.",
      steps: [{ m: "Other parts of the program do not know that there is a data structure called Queue // cannot access it (A. it is private; R. protected) // do not know a list is used or how the options are stored // if the representation were changed, the rest of the program would not need to be modified;", mk: "1" }],
      result: "The list is private; others use only the methods" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Define**: hiding all details of an object that do not contribute to its essential characteristics.",
      "**In a class**: private attributes + public methods; others don't know HOW data is stored.",
      "**Why**: representation can change without changing other code; prevents misuse.",
      "Protected is NOT hidden from subclasses (R. in 2023)."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Information hiding is about security/passwords.\" — it is about design: hiding implementation details from other code.",
      "\"Protected hides it.\" — subclasses can still see it; 2023's scheme rejects protected.",
      "\"Hiding means the data can't be used.\" — it is used through the public interface."
    ] } },
    { callout: { t: "mnemonic", h: "\"Show the what, hide the how\"", body: "The interface shows **what** an object does; the private parts hide **how** it does it." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.2.3 encapsulation and access specifiers; 4.4.1.7 data abstraction; 4.2.1.4 ADTs; 4.1.1.13 locals hide data inside subroutines." } }
  ],
  flashcards: [
    ["Information hiding?", "Hiding all details of an object that do not contribute to its essential characteristics."],
    ["How does a class hide information?", "Private attributes; access only through public methods."],
    ["Benefit?", "The representation can change without other code changing; prevents misuse."],
    ["Information hiding vs encapsulation?", "Hiding is the principle; encapsulation (bundling + private) is the mechanism."],
    ["2023 Q09.1 key idea?", "Other parts of the program don't know Queue exists or how options are stored."],
    ["Is protected hidden?", "Not from subclasses — R. in the 2023 mark scheme."],
    ["Real-world example?", "A car's controls are the interface; the engine is hidden."],
    ["Term for \"hiding all details that do not contribute to essential characteristics\"?", "Information hiding (AS 2018 label A)."]
  ],
  quiz: [
    { q: "Information hiding is achieved in a class by", opts: ["private attributes and public methods", "public attributes", "static methods", "global variables"], ans: 0, why: "Encapsulation." },
    { q: "Changing a hidden List to an array should require changes to", opts: ["only the class itself", "every caller", "the whole program", "the database"], ans: 0, why: "That's the point." },
    { q: "Which access specifier was rejected for information hiding in 2023?", opts: ["protected", "private", "internal", "none"], ans: 0, why: "Subclasses can access it." },
    { q: "Information hiding mainly benefits", opts: ["maintainability", "network security", "run-time speed", "file size"], ans: 0, why: "Design quality." }
  ]
};

/* =====================================================================
   4.4.1.5  Procedural abstraction
   ===================================================================== */
C["compsci:4.4.1.5"] = {
  notes: [
    { h: "Procedural abstraction — the whole topic on one page" },
    spec("4.4.1.5", ["Know that procedural abstraction represents a computational method.", "The result of abstracting away the actual values used in a particular computation is a computational pattern or method — a procedure."]),
    { callout: { t: "info", h: "How AQA examines it", body: "Procedural abstraction has not been examined on its own in 2016–2025; it appears as a term to recognise (AS 2018 Q01's term list) and underpins every question on subroutines and parameters. The cards below are variations in the exam's style." } },
    { h: "How these notes are organised" },
    { ol: ["**From a calculation to a procedure**.", "**In practice**.", "**Exam toolkit**."] },

    { page: "From a calculation to a procedure" },
    { fig: { w: 640, h: 130, items: [].concat(
      boxAt(20, 30, 170, 60, "π × 3²", "accent", "one computation"),
      boxAt(240, 30, 170, 60, "π × r²", "accent2", "values abstracted away"),
      boxAt(460, 30, 160, 60, "Area(r)", "good", "a procedure"),
      arrow(190, 60, 240, 60, null, { c: "text2" }), arrow(410, 60, 460, 60, null, { c: "text2" }),
      [txt(320, 116, "the METHOD (multiply π by the square) is kept; the particular value 3 is removed", { size: 10.5, c: "text2" })]
    ), cap: "Procedural abstraction: remove the actual values from a computation and what remains is a reusable computational method — a procedure with parameters." } },
    { code: { lang: "csharp", src: "// one particular computation\ndouble a1 = Math.PI * 3 * 3;\n\n// procedural abstraction: the values become parameters — the METHOD remains visible\nstatic double CircleArea(double r) => Math.PI * r * r;\n\nConsole.WriteLine(CircleArea(3));   // 28.27…\nConsole.WriteLine(CircleArea(5));   // 78.54…", cap: "The procedure still says HOW it computes — that is the difference from functional abstraction (4.4.1.6)." } },

    { page: "In practice" },
    { worked: { tag: "variation", title: "Abstract a calculation", q: "A program repeats VAT calculations: price1 * 1.2, price2 * 1.2, shippingCost * 1.2. Apply procedural abstraction.",
      steps: [
        { m: "Identify the computational pattern: (amount) × (1 + rate).", mk: "1" },
        { m: "Abstract away the particular values: static decimal WithVat(decimal amount, decimal rate = 0.2m) => amount * (1 + rate);", mk: "1" },
        { m: "Each use becomes WithVat(price1) etc.; a rate change is one edit.", mk: "1" }
      ], result: "A procedure WithVat(amount, rate)" } },
    { worked: { tag: "variation", title: "Name the abstraction", q: "Which abstraction is it? (a) Writing Average(list) instead of repeating (a + b + c) / 3 for many lists. (b) Calling Math.Sqrt(x) without knowing whether it uses Newton's method. (c) Representing a stack as an array with a top pointer that users never see.",
      steps: [
        { m: "(a) Procedural abstraction — the particular values are abstracted into parameters; a computational method remains.", mk: "1" },
        { m: "(b) Functional abstraction — even the method is hidden; only input → output matters.", mk: "1" },
        { m: "(c) Data abstraction — how the data is represented is hidden.", mk: "1" }
      ], result: "Procedural · functional · data" } },
    { worked: { tag: "variation", title: "Explain procedural abstraction", q: "Explain what is meant by procedural abstraction. [2 marks — exam-style]",
      steps: [
        { m: "The actual values used in a particular computation are abstracted away (they become parameters);", mk: "1" },
        { m: "leaving a computational pattern/method — a procedure that can be applied to any values;", mk: "1", n: "Contrast, if asked: the method is still visible — hiding it too is functional abstraction." }
      ], result: "Values removed → a reusable method" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Procedural abstraction** represents a computational METHOD: the particular values are abstracted away (they become parameters).",
      "**Result**: a procedure. The method of computation is still part of it.",
      "**Contrast**: functional abstraction hides the method too (4.4.1.6)."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Procedural abstraction hides how it works.\" — that is FUNCTIONAL abstraction; a procedure still embodies its method.",
      "\"It is the same as decomposition.\" — decomposition SPLITS a problem; procedural abstraction GENERALISES a computation."
    ] } },
    { callout: { t: "mnemonic", h: "\"Remove the numbers, keep the method\"", body: "Procedural abstraction strips out the **values** and keeps the **method** — that leftover pattern is a procedure." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.1.10 subroutines; 4.1.1.11 parameters; 4.4.1.6 functional abstraction; 4.4.1.10 composition of procedures; 4.12 functions as first-class objects." } }
  ],
  flashcards: [
    ["Procedural abstraction?", "Abstracting away the actual values in a computation to leave a computational method — a procedure."],
    ["Result of procedural abstraction?", "A procedure (a computational method with parameters)."],
    ["Is the method hidden in procedural abstraction?", "No — that is functional abstraction."],
    ["Example?", "CircleArea(r) = π r² instead of π × 3²."],
    ["What do the abstracted values become?", "Parameters."],
    ["Procedural vs functional abstraction?", "Procedural keeps the method; functional hides it, leaving only input → output."],
    ["Procedural abstraction vs decomposition?", "Generalising a computation vs splitting a problem into parts."],
    ["Benefit?", "One method reused for any values; changes are made once."]
  ],
  quiz: [
    { q: "The result of procedural abstraction is", opts: ["a procedure", "a function with its method hidden", "a data type", "a class hierarchy"], ans: 0, why: "Spec wording." },
    { q: "In procedural abstraction what is removed?", opts: ["the particular values", "the method", "the output", "the parameters"], ans: 0, why: "Values become parameters." },
    { q: "Calling Sqrt without knowing its method is", opts: ["functional abstraction", "procedural abstraction", "decomposition", "composition"], ans: 0, why: "Method hidden." },
    { q: "Turning repeated price * 1.2 into WithVat(price) is", opts: ["procedural abstraction", "data abstraction", "automation", "information hiding"], ans: 0, why: "Values abstracted." }
  ]
};

/* =====================================================================
   4.4.1.6  Functional abstraction
   ===================================================================== */
C["compsci:4.4.1.6"] = {
  notes: [
    { h: "Functional abstraction — the whole topic on one page" },
    spec("4.4.1.6", ["Know that for functional abstraction the particular computation method is hidden.", "The result of a procedural abstraction is a procedure, not a function; getting a function needs a further abstraction that disregards the particular computation method — this is functional abstraction."]),
    { callout: { t: "info", h: "How AQA examines it", body: "Functional abstraction has not been examined on its own in 2016–2025 (it appears in AS 2018 Q01's list of terms). Expect a definition or a \"which abstraction is this?\" item — the cards below rehearse both." } },
    { h: "How these notes are organised" },
    { ol: ["**One step beyond a procedure**.", "**In practice**.", "**Exam toolkit**."] },

    { page: "One step beyond a procedure" },
    { fig: { w: 640, h: 130, items: [].concat(
      boxAt(20, 30, 170, 60, "π × 3²", "accent", "a computation"),
      boxAt(240, 30, 170, 60, "Area(r) = π r²", "accent2", "procedure: method visible"),
      boxAt(460, 30, 160, 60, "r ↦ area", "good", "function: method hidden"),
      arrow(190, 60, 240, 60, "procedural", { c: "text2", dy: -30 }), arrow(410, 60, 460, 60, "functional", { c: "text2", dy: -30 }),
      [txt(320, 116, "a function is defined only by WHAT it maps inputs to — any correct method will do", { size: 10.5, c: "text2" })]
    ), cap: "Two abstractions in a row: values removed (procedural), then the method itself removed (functional)." } },
    { code: { lang: "csharp", src: "// two procedures with DIFFERENT methods …\nstatic int SumTo(int n) { int t = 0; for (int i = 1; i <= n; i++) t += i; return t; }   // loop\nstatic int SumToFast(int n) => n * (n + 1) / 2;                                          // formula\n\n// … are the SAME function: n ↦ 1 + 2 + … + n. A caller that only needs the mapping\n// depends on the function, not on either method:\nFunc<int, int> triangular = SumToFast;\nConsole.WriteLine(triangular(100));   // 5050", cap: "Swapping the method behind the function changes nothing for the caller." } },

    { page: "In practice" },
    { worked: { tag: "variation", title: "Same function, different methods", q: "Explain why Math.Sort-style library calls are an example of functional abstraction.",
      steps: [
        { m: "The caller needs only the mapping: an unsorted list ↦ the same items in order.", mk: "1" },
        { m: "The library may use merge sort, quicksort or introsort — the particular computation method is hidden.", mk: "1" },
        { m: "So the library can switch algorithms between versions without any calling code changing.", mk: "1" }
      ], result: "Only input → output is exposed" } },
    { worked: { tag: "variation", title: "Procedural or functional?", q: "For each, say whether the description is of procedural or functional abstraction: (a) \"Mean(list) adds the values and divides by the count\"; (b) \"Mean(list) returns the arithmetic mean of the list\".",
      steps: [
        { m: "(a) Procedural — the computational METHOD (add, then divide) is part of what is described.", mk: "1" },
        { m: "(b) Functional — only the mapping list ↦ mean; the method is not specified.", mk: "1" }
      ], result: "(a) procedural · (b) functional" } },
    { worked: { tag: "variation", title: "Explain functional abstraction", q: "Explain what is meant by functional abstraction. [2 marks — exam-style]",
      steps: [
        { m: "The particular computation method is hidden;", mk: "1" },
        { m: "only the relationship between inputs and outputs (the function/mapping) is visible // it is a further abstraction of a procedure that disregards its method;", mk: "1" }
      ], result: "Method hidden; only input ↦ output" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Functional abstraction**: the particular computation METHOD is hidden — only input ↦ output remains.",
      "It is a further abstraction ON TOP OF procedural abstraction.",
      "A procedure is a method; a function is a mapping."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Functional abstraction means writing functions (returning a value).\" — it means hiding the computation METHOD; the C# keyword isn't the point.",
      "\"Procedural and functional abstraction are the same.\" — functional goes one step further and hides the method."
    ] } },
    { callout: { t: "mnemonic", h: "\"Procedure = how; function = what\"", body: "A **procedure** still tells you **how**; a **function** tells you only **what** comes out for what goes in." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.1.5 procedural abstraction; 4.12.1.1 function type (domain → co-domain); 4.4.4.2 a function as a mapping; 4.1.2.3 program to interfaces." } }
  ],
  flashcards: [
    ["Functional abstraction?", "Abstraction in which the particular computation method is hidden."],
    ["Result of procedural abstraction — procedure or function?", "A procedure."],
    ["How do you get a function from a procedure?", "A further abstraction that disregards the computation method."],
    ["Example?", "A sort routine whose algorithm is hidden: list ↦ sorted list."],
    ["Two procedures, one function?", "SumTo by loop and by formula compute the same mapping."],
    ["Benefit?", "The method can change without callers changing."],
    ["Procedural vs functional?", "Procedural keeps the method; functional hides it."],
    ["Link to functional programming?", "A function is a mapping from a domain to a co-domain (4.12.1.1)."]
  ],
  quiz: [
    { q: "In functional abstraction what is hidden?", opts: ["the computation method", "the output", "the input", "nothing"], ans: 0, why: "Spec wording." },
    { q: "Functional abstraction builds on", opts: ["procedural abstraction", "decomposition", "automation", "data abstraction"], ans: 0, why: "A further abstraction." },
    { q: "SumTo (loop) and SumToFast (formula) are", opts: ["two procedures, one function", "two functions", "the same procedure", "unrelated"], ans: 0, why: "Same mapping." },
    { q: "\"Returns the mean of a list\" describes", opts: ["a functional abstraction", "a procedural abstraction", "a data structure", "a decomposition"], ans: 0, why: "Only the mapping." }
  ]
};

/* =====================================================================
   4.4.1.7  Data abstraction
   ===================================================================== */
C["compsci:4.4.1.7"] = {
  notes: [
    { h: "Data abstraction — the whole topic on one page" },
    spec("4.4.1.7", ["Know that details of how data are actually represented are hidden.", "This allows new kinds of data objects to be constructed from previously defined types of data objects (e.g. a stack implemented as an array and a pointer for the top of stack)."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["What data abstraction is", "Explain", "1", "AS 2025 Q05"],
      ["Implement an ADT from arrays/records", "Describe / write", "3–5", "4.2.2.1, 4.2.3.1, 4.2.6.1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Using vs constructing**.", "**In C#**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Using vs constructing" },
    { table: { head: ["Level", "Sees", "Example"], rows: [
      ["Use", "the operations: Push, Pop, Peek, IsEmpty", "an RPN evaluator calling Push and Pop"],
      ["Construction", "the representation: int[] items, int top", "how Push stores into items[++top]"],
      ["Built from", "previously defined types", "an array (built-in) + an integer → a stack (new kind of object)"]
    ] } },
    { callout: { t: "def", h: "Data abstraction", body: "A methodology that isolates **how a compound data object is used** from **the details of how it is constructed**: the representation is hidden, so new kinds of data objects can be built from existing ones." } },

    { page: "In C#" },
    { code: { lang: "csharp", src: "// A Fraction: a NEW kind of data object built from two ints\nreadonly struct Fraction\n{\n    private readonly int num, den;                // the representation — hidden\n    public Fraction(int n, int d)\n    {\n        int g = Gcd(Math.Abs(n), Math.Abs(d));\n        num = n / g; den = d / g;                   // always stored in lowest terms\n    }\n    public static Fraction operator +(Fraction a, Fraction b) =>\n        new(a.num * b.den + b.num * a.den, a.den * b.den);\n    public override string ToString() => num + \"/\" + den;\n    static int Gcd(int a, int b) => b == 0 ? a : Gcd(b, a % b);\n}\n// new Fraction(1, 2) + new Fraction(1, 3) → 5/6 — users never touch num or den", cap: "The user works with fractions; whether they are stored as two ints, a reduced pair or a decimal is hidden." } },
    { worked: { tag: "variation", title: "Build a queue from arrays", q: "Describe how a queue can be constructed from previously defined types, and what users of the queue see.",
      steps: [
        { m: "Representation: a fixed-size array, a front pointer, a rear pointer and a size counter (all integers/arrays — previously defined types).", mk: "1" },
        { m: "Operations: Enqueue, Dequeue, IsEmpty, IsFull — the only things users call.", mk: "1" },
        { m: "Users never see the array or the pointers, so it could be rebuilt as a linked list without changing their code.", mk: "1" }
      ], result: "Array + pointers hidden behind 4 operations" } },
    { worked: { tag: "variation", title: "One interface, two representations", q: "A program uses a Stack with Push, Pop and IsEmpty. Version 1 stores it in an array with a top index; version 2 in a linked list with a head pointer. What must change in the program that uses the stack when switching versions, and why?",
      steps: [
        { m: "Nothing in the calling program changes.", mk: "1" },
        { m: "It uses only the operations; the representation (array + top vs list + head) is hidden — data abstraction.", mk: "1" },
        { m: "Only the stack's own code changes; behaviour seen by callers (LIFO) is identical, though limits differ (the array version can be full).", mk: "1" }
      ], result: "Callers unchanged" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Explain data abstraction", src: "AS June 2025 · P1 Q05 · 1 mark",
      q: "Explain what is meant by data abstraction.",
      steps: [{ m: "(The detail of) how the data are actually represented is hidden // new kinds of data objects/structures can be constructed from previously defined types // by example: a stack/queue/tree implemented as an array;", mk: "1" }],
      result: "Representation hidden; new types from old" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Two ideas**: representation HIDDEN; new data objects BUILT from existing types.",
      "Give an example: stack = array + top pointer; tree = records with Left/Right pointers.",
      "Link to ADTs (4.2.1.4) and classes (4.1.2.3)."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Data abstraction means storing less data.\" — it hides HOW data is represented, not how much.",
      "\"It is the same as encryption.\" — nothing is secret from the program; the representation is hidden from other parts of the code."
    ] } },
    { callout: { t: "mnemonic", h: "\"Use it, don't open it\"", body: "Data abstraction: you **use** a stack through Push and Pop; you never **open** it to see the array inside." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.2.1.4 abstract data types; 4.2.2–4.2.3 queues and stacks built on arrays; 4.1.2.3 classes; 4.4.1.4 information hiding; 4.4.1.10 data composition." } }
  ],
  flashcards: [
    ["Data abstraction?", "Hiding how data are represented, allowing new data objects to be built from previously defined types."],
    ["Spec example?", "A stack implemented as an array and a pointer for the top."],
    ["What does data abstraction isolate?", "How a compound data object is used from how it is constructed."],
    ["Benefit?", "The representation can change without changing code that uses it."],
    ["Fraction built from…?", "Two integers (numerator and denominator)."],
    ["Link to ADTs?", "An ADT is a data abstraction: defined by operations, representation hidden."],
    ["Data vs functional abstraction?", "Data hides representation; functional hides computation method."],
    ["AS 2025 Q05 answer?", "How the data are represented is hidden / new types from previous ones."]
  ],
  quiz: [
    { q: "Data abstraction hides", opts: ["how data are represented", "how much data there is", "the data's values", "the operations"], ans: 0, why: "Spec wording." },
    { q: "A stack as an array + top pointer is an example of", opts: ["data abstraction", "functional abstraction", "decomposition", "automation"], ans: 0, why: "Spec example." },
    { q: "Users of a data abstraction see", opts: ["its operations", "its internal array", "its memory address", "its pointers"], ans: 0, why: "Interface only." },
    { q: "Data abstraction lets you build", opts: ["new data objects from existing types", "faster CPUs", "new programming languages", "compressed files"], ans: 0, why: "Construction." }
  ]
};

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
C["compsci:4.4.1.8"] = {
  notes: [
    { h: "Problem abstraction / reduction — the whole topic on one page" },
    spec("4.4.1.8", ["Know that details are removed until the problem is represented in a way that is possible to solve, because the problem reduces to one that has already been solved."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["What information a reduction removed", "What has been removed", "1", "A-level 2019 Q03.4"],
      ["Match the description to the term", "Complete", "part of 4", "AS 2018 Q01 (E)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Reducing to a solved problem**.", "**Classic reductions**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Reducing to a solved problem" },
    reductionFig(),
    { steps: [
      "Identify the essential structure of the new problem.",
      "Remove every detail that does not affect the solution (cell positions, names, colours of the real objects).",
      "Recognise the remaining structure as a problem already solved (graph colouring, shortest path, sorting, searching).",
      "Apply the known algorithm, then map its answer back to the original problem."
    ] },

    { page: "Classic reductions" },
    { table: { head: ["Original problem", "Reduces to", "Solved by"], rows: [
      ["Sudoku / A-level 2019's letter grid", "graph colouring", "backtracking colouring algorithms"],
      ["Exam timetabling (no student in two exams at once)", "graph colouring: exams are nodes, shared students are edges", "colouring with time slots as colours"],
      ["Fastest route between towns", "shortest path in a weighted graph", "Dijkstra (4.3.6.1)"],
      ["Fewest connections between two people", "shortest path in an unweighted graph", "breadth-first search (4.3.1.1)"],
      ["Finding a median", "sorting, then take the middle", "merge sort (4.3.5.2)"]
    ] } },
    { worked: { tag: "variation", title: "Reduce a timetable", q: "Five exams must be timetabled; some pairs share students and so cannot be at the same time. Reduce the problem to one already solved.",
      steps: [
        { m: "Remove the detail: student names, rooms and subjects don't matter — only which exams clash.", mk: "1" },
        { m: "Represent each exam as a node and each clash as an edge.", mk: "1" },
        { m: "The problem is now graph colouring: each colour is a time slot; the fewest colours is the fewest slots.", mk: "1" }
      ], result: "Graph colouring" } },
    { worked: { tag: "variation", title: "Reduce a maze", q: "Reduce \"find a way out of a maze\" to a problem already solved.",
      steps: [
        { m: "Remove the detail: wall textures, exact distances and shapes don't matter — only which junctions connect.", mk: "1" },
        { m: "Represent each junction/dead end as a vertex and each corridor as an edge.", mk: "1" },
        { m: "The problem is now graph traversal: depth-first search finds a path; breadth-first search finds the one with fewest corridors.", mk: "1" }
      ], result: "Graph traversal (DFS/BFS)" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "What the graph left out", src: "A-level June 2019 · P1 Q03.4 · 1 mark",
      q: "A 4 × 4 letter puzzle (each of A–D once in every row, column and 2 × 2 block) is represented as a graph: each cell is a numbered node and an edge joins two cells that cannot contain the same letter. Other than the contents of the cells, what information has been removed from the puzzle when it has been represented as a graph?",
      steps: [{ m: "Why two cells are linked — because they are in the same row / column / 2 × 2 block — is no longer represented // the nature of the link is not represented;", mk: "1", n: "A. the location of a cell is not represented." }],
      result: "The reason for each link (and cell positions)" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Definition**: remove details until the problem is represented in a way that is possible to solve, because it reduces to one already solved.",
      "Name the known problem (graph colouring, shortest path…) and say what the nodes/edges/values stand for.",
      "\"What was removed?\" — think about meaning (WHY things are connected) and position, not just values."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Reduction makes the problem smaller.\" — it makes it a DIFFERENT, already-solved problem; the size may be the same.",
      "\"Reduction is decomposition.\" — decomposition splits into sub-problems; reduction transforms into a known problem."
    ] } },
    { callout: { t: "mnemonic", h: "\"Strip it till you recognise it\"", body: "Remove detail until the problem **looks like** one you already know how to solve — then use that solution." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.1.3 abstraction; 4.2.4.1 graphs; 4.3.1.1 BFS and 4.3.6.1 Dijkstra as solved problems; 4.4.4.5 intractable problems (colouring) and heuristics." } }
  ],
  flashcards: [
    ["Problem abstraction/reduction?", "Removing details until the problem is represented in a way that is possible to solve because it reduces to one already solved."],
    ["2019's puzzle reduces to…?", "Graph colouring."],
    ["What did the 2019 graph remove?", "Why cells are linked (same row/column/block) and cell positions."],
    ["Timetabling reduces to…?", "Graph colouring (exams = nodes, clashes = edges, slots = colours)."],
    ["Fastest route reduces to…?", "Shortest path in a weighted graph — Dijkstra."],
    ["Reduction vs decomposition?", "Transform into a solved problem vs split into sub-problems."],
    ["AS 2018 Q01 label for reduction?", "E — problem abstraction."],
    ["Last step of a reduction?", "Map the known algorithm's answer back to the original problem."]
  ],
  quiz: [
    { q: "Reduction means the problem becomes", opts: ["one already solved", "smaller", "random", "decomposed"], ans: 0, why: "Spec wording." },
    { q: "In 2019's puzzle graph, an edge means", opts: ["two cells cannot share a letter", "two cells are adjacent", "a letter is placed", "a row"], ans: 0, why: "A clash." },
    { q: "Exam timetabling as graph colouring: colours are", opts: ["time slots", "students", "rooms", "subjects"], ans: 0, why: "Clashing exams need different slots." },
    { q: "Which is a reduction?", opts: ["solving a maze as a shortest-path graph problem", "splitting a program into subroutines", "making a class hierarchy", "writing a loop"], ans: 0, why: "Known problem." }
  ]
};

/* =====================================================================
   4.4.1.9  Decomposition
   ===================================================================== */
C["compsci:4.4.1.9"] = {
  notes: [
    { h: "Decomposition — the whole topic on one page" },
    spec("4.4.1.9", ["Know that procedural decomposition means breaking a problem into a number of sub-problems, so that each sub-problem accomplishes an identifiable task, which might itself be further subdivided."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Procedural decomposition", "Explain", "3", "A-level 2021 Q03"],
      ["Decomposition", "Explain / define", "2", "AS 2022 Q08, A-level 2025 Q02"],
      ["Name the term", "Complete", "part of 4", "AS 2018 Q01 (F)"],
      ["Hierarchy charts", "State / complete", "1 each", "4.1.2.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Top-down decomposition**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Top-down decomposition" },
    { fig: { w: 640, h: 170, items: [].concat(
      boxAt(240, 10, 160, 34, "Run a quiz", "accent2"),
      boxAt(40, 80, 150, 34, "Load questions", "accent"), boxAt(245, 80, 150, 34, "Ask questions", "accent"), boxAt(450, 80, 150, 34, "Show score", "accent"),
      boxAt(170, 136, 140, 30, "Read answer", "good"), boxAt(330, 136, 140, 30, "Mark answer", "good"),
      [seg(320, 44, 115, 80), seg(320, 44, 320, 80), seg(320, 44, 525, 80), seg(320, 114, 240, 136), seg(320, 114, 400, 136)]
    ), cap: "Each box is an identifiable task; \"Ask questions\" is decomposed again. Stop when each part is a single task you can code directly." } },
    { kv: [
      ["Why", "smaller problems are easier to understand, solve, test and share in a team"],
      ["Result", "a hierarchy of modules — drawn as a hierarchy chart (4.1.2.2) — each one a subroutine"],
      ["Stop when", "each sub-problem performs a single, identifiable task"]
    ] },
    { worked: { tag: "variation", title: "Decompose a game", q: "Decompose \"play noughts and crosses against the computer\" to two levels.",
      steps: [
        { m: "Level 1: set up the board · take turns until the game ends · announce the result.", mk: "1" },
        { m: "\"Take turns\" → get the player's move (read, validate) · choose the computer's move · update the board · check for a win or draw.", mk: "1" },
        { m: "Each leaf is a single task, e.g. CheckWin(board) — one subroutine each.", mk: "1" }
      ], result: "A two-level hierarchy of single tasks" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Procedural decomposition", src: "A-level June 2021 · P1 Q03 · 3 marks",
      q: "Explain what is meant by procedural decomposition.",
      steps: [
        { h: "AO1 knowledge", m: "Breaking a problem into smaller sub-problems;", mk: "1" },
        { h: "AO1 understanding", m: "Each of which solves an identifiable task;", mk: "1" },
        { m: "Each of which might be further subdivided;", mk: "1" }
      ], result: "Sub-problems → identifiable tasks → subdivided further" } },
    { worked: { tag: "exam", title: "Explain decomposition", src: "AS June 2022 · P1 Q08 · 2 marks",
      q: "Explain what is meant by decomposition.",
      steps: [
        { m: "Breaking down a problem into a number of sub-problems;", mk: "1" },
        { m: "So that each sub-problem accomplishes an identifiable task // each might be decomposed further;", mk: "1" }
      ], result: "Sub-problems, each an identifiable task" } },
    { worked: { tag: "exam", title: "Define decomposition", src: "A-level June 2025 · P1 Q02 · 2 marks",
      q: "Define the term decomposition.",
      steps: [
        { m: "Splitting a problem into smaller sub-problems;", mk: "1" },
        { m: "So that each sub-problem accomplishes an identifiable task, which might itself be further divided // repeating until each sub-problem performs a single task;", mk: "1" }
      ], result: "Split until each part is a single task" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Three phrases** (3 marks): smaller sub-problems · each an IDENTIFIABLE TASK · each may be SUBDIVIDED further.",
      "Two-mark versions want the first plus one of the others.",
      "Decomposition SPLITS; composition (4.4.1.10) COMBINES."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Decomposition is splitting the code into files.\" — it splits the PROBLEM into tasks.",
      "\"Any split will do.\" — each part must accomplish an identifiable task."
    ] } },
    { callout: { t: "mnemonic", h: "\"Split, name, repeat\"", body: "**Split** into sub-problems, give each an identifiable task (**name** it), **repeat** until each is a single task." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.1.2.2 the structured approach and hierarchy charts; 4.1.1.10 subroutines; 4.4.1.10 composition; 4.13.1.2 design; NEA.2 design documentation." } }
  ],
  flashcards: [
    ["Procedural decomposition?", "Breaking a problem into sub-problems, each accomplishing an identifiable task, which may be subdivided further."],
    ["Three mark points for decomposition?", "Smaller sub-problems; each an identifiable task; each may be subdivided."],
    ["When does decomposition stop?", "When each sub-problem performs a single task."],
    ["Diagram for decomposition?", "A hierarchy chart."],
    ["Decomposition vs composition?", "Splitting vs combining."],
    ["Benefit?", "Smaller parts are easier to solve, test and share in a team."],
    ["AS 2018 Q01 label for decomposition?", "F."],
    ["Each leaf of a decomposition becomes…?", "A subroutine (module)."]
  ],
  quiz: [
    { q: "Decomposition means", opts: ["breaking a problem into sub-problems", "combining procedures", "removing detail", "hiding data"], ans: 0, why: "Definition." },
    { q: "A 3-mark answer must include that each sub-problem", opts: ["accomplishes an identifiable task", "is the same size", "is written by one person", "is recursive"], ans: 0, why: "Mark point 2." },
    { q: "Decomposition is drawn as", opts: ["a hierarchy chart", "a class diagram", "a state diagram", "an ER diagram"], ans: 0, why: "4.1.2.2." },
    { q: "The opposite process is", opts: ["composition", "abstraction", "automation", "reduction"], ans: 0, why: "Combining." }
  ]
};

/* =====================================================================
   4.4.1.10  Composition
   ===================================================================== */
C["compsci:4.4.1.10"] = {
  notes: [
    { h: "Composition — the whole topic on one page" },
    spec("4.4.1.10", ["Know how to build a composition abstraction by combining procedures to form compound procedures.", "Know how to build data abstractions by combining data objects to form compound data, for example a tree data structure."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["What composition is + an example in the Skeleton", "Explain", "2", "AS 2024 Q11.1"],
      ["Why composition is used", "Describe two reasons", "2", "AS 2024 Q11.2"],
      ["Name the term", "Complete", "part of 4", "AS 2018 Q01 (G)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Procedural and data composition**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Procedural and data composition" },
    { code: { lang: "csharp", src: "// PROCEDURAL composition: a compound procedure built from others\nstatic void Serving(List<Till> tills, Queue<Buyer> q)\n{\n    int t = FindFreeTill(tills);\n    ServeBuyer(tills[t], q.Dequeue());\n    UpdateStats(tills);\n    // … one call now runs the whole group, wherever it is needed\n}\n\n// DATA composition: compound data built from simpler data\nrecord Buyer(int BuyerID, int WaitingTime, int ItemsInBasket);   // three values → one record\nvar buyerQ = new Queue<Buyer>();                                    // many records → one structure\n\nclass TreeNode { public int Value; public TreeNode Left, Right; }  // nodes → a tree", cap: "AS 2024's queue simulator in C#: Serving composes procedures; Q_Node (Buyer) and BuyerQ compose data." } },
    { table: { head: [" ", "Procedural composition", "Data composition"], rows: [
      ["Combines", "procedures into a compound procedure", "data objects into compound data"],
      ["Example", "Serving calls FindFreeTill, ServeBuyer, UpdateStats", "a record of three fields; an array of records; a tree of nodes"],
      ["Benefit", "call the whole group in one place or many; less code; clearer", "handle the group as one unit; address elements easily"]
    ] } },
    { worked: { tag: "variation", title: "Spot the composition", q: "Identify each composition: (a) a Date made of day, month, year; (b) MakeCoffee() calling BoilWater(), Grind(), Pour(); (c) a binary tree built from TreeNode objects.",
      steps: [
        { m: "(a) Data composition — three values combined into one compound data object.", mk: "1" },
        { m: "(b) Procedural composition — procedures combined into a compound procedure.", mk: "1" },
        { m: "(c) Data composition — nodes combined into a compound structure (the spec's own example).", mk: "1" }
      ], result: "Data · procedural · data" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Composition in a program", src: "AS June 2024 · P1 Q11.1 · 2 marks",
      q: "A queue simulation has a subroutine Serving that calls FindFreeTill, ServeBuyer, UpdateStats and CalculateServingTime, and stores each buyer as a record Q_Node of BuyerID, WaitingTime and ItemsInBasket in an array BuyerQ. Explain what is meant by composition and give an example where composition is used in the program.",
      steps: [
        { h: "Knowledge — one of", m: "Procedural composition: combining subroutines to form a compound subroutine // a subroutine that calls other subroutines; OR data composition: combining data objects to form compound data;", mk: "1" },
        { h: "Example — matching", m: "FindFreeTill, ServeBuyer, UpdateStats, CalculateServingTime… are combined into Serving // BuyerID, WaitingTime and ItemsInBasket are combined into a Q_Node, and Q_Nodes into BuyerQ;", mk: "1", n: "Two or more subroutines must be named." }
      ], result: "Combining parts into a compound whole" } },
    { worked: { tag: "exam", title: "Why composition is used", src: "AS June 2024 · P1 Q11.2 · 2 marks",
      q: "Describe two reasons why composition is used in the queue-simulation program described above.",
      steps: [
        { m: "The group of subroutines in Serving needs calling in more than one place (during the main simulation and after buyers stop arriving) // less code if only one compound subroutine is called;", mk: "1" },
        { m: "It improves understanding of the code // the grouped data items/record can be manipulated as one unit // array elements are easier to address than individual variables;", mk: "1", n: "Max 2." }
      ], result: "Reuse in several places; handle as one unit" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Procedural composition**: combine procedures into a compound procedure — name the parts AND the whole.",
      "**Data composition**: combine data objects into compound data — fields → record → array/tree.",
      "Reasons: called in several places; less code; clearer; handle the group as one unit."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "Confusing this with OOP composition (black diamond, 4.1.2.3) — related idea (building a whole from parts), but here it is about procedures and data generally.",
      "Naming only ONE subroutine as an example — the scheme needs two or more."
    ] } },
    { callout: { t: "mnemonic", h: "\"Small parts, one whole\"", body: "Composition puts **small** procedures or data items together into **one** compound procedure or structure." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.1.9 decomposition (the reverse); 4.1.1.10 subroutines; 4.2.1.3 records; 4.2.5.1 trees; 4.1.2.3 OOP composition; 4.12.1.5 function composition." } }
  ],
  flashcards: [
    ["Procedural composition?", "Combining procedures to form a compound procedure."],
    ["Data composition?", "Combining data objects to form compound data (e.g. a record, a tree)."],
    ["Spec example of data composition?", "A tree data structure."],
    ["AS 2024 compound procedure?", "Serving (FindFreeTill, ServeBuyer, UpdateStats, …)."],
    ["AS 2024 compound data?", "Q_Node (BuyerID, WaitingTime, ItemsInBasket) and BuyerQ."],
    ["Reason for procedural composition?", "The group is called in several places — less code, clearer."],
    ["Reason for data composition?", "The group can be handled as one unit; elements easy to address."],
    ["AS 2018 Q01 label for composition?", "G — combining procedures into compound procedures."]
  ],
  quiz: [
    { q: "Combining procedures into a compound procedure is", opts: ["composition", "decomposition", "reduction", "automation"], ans: 0, why: "Spec wording." },
    { q: "A tree made of nodes is", opts: ["data composition", "procedural composition", "information hiding", "functional abstraction"], ans: 0, why: "Spec example." },
    { q: "A composition example in AS 2024 must name", opts: ["two or more subroutines", "one subroutine", "a class", "a loop"], ans: 0, why: "Scheme note." },
    { q: "Composition is the opposite of", opts: ["decomposition", "abstraction", "automation", "iteration"], ans: 0, why: "Combine vs split." }
  ]
};

/* =====================================================================
   4.4.1.11  Automation
   ===================================================================== */
C["compsci:4.4.1.11"] = {
  notes: [
    { h: "Automation — the whole topic on one page" },
    spec("4.4.1.11", ["Understand that automation requires putting models (abstractions of real-world objects or phenomena) into action to solve problems.", "This is achieved by: creating algorithms; implementing the algorithms in program code (instructions); implementing the models in data structures; executing the code."]),
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Match descriptions to abstraction terms", "Complete", "4", "AS 2018 Q01"],
      ["The automation steps / what to include in a model", "Describe", "2–3", "specification; variations below"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Putting models into action**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Putting models into action" },
    { fig: { w: 640, h: 120, items: (function () {
      var it = [], st = [["Model", "abstract the world"], ["Algorithms", "actions on the model"], ["Code", "instructions"], ["Data structures", "the model in memory"], ["Execute", "solve the problem"]];
      st.forEach(function (s, i) { var x = 10 + i * 126; it = it.concat(boxAt(x, 30, 112, 54, s[0], i === 4 ? "good" : "accent", s[1])); if (i) it = it.concat(arrow(x - 14, 57, x, 57, null, { c: "text2" })); });
      it.push(txt(320, 108, "choose what to include: the minimum detail needed to solve the problem to the required accuracy", { size: 10.5, c: "text2" }));
      return it;
    })(), cap: "Automation: a clean abstract model of a messy real-world situation, put into action through algorithms, code and data structures, then executed." } },
    { worked: { tag: "variation", title: "Automate a traffic light", q: "Describe the automation steps for a pedestrian-crossing traffic light controller.",
      steps: [
        { m: "Model: states (red, amber, green, pedestrian green) and events (button press, timer) — ignore car colours, weather, etc.", mk: "1" },
        { m: "Algorithms: a state machine — on button press during green, go to amber, then red, then pedestrian green for 20 s…", mk: "1" },
        { m: "Code + data structures: an enum State and a transition table; then execute on the controller, responding to real buttons and timers.", mk: "1" }
      ], result: "Model → algorithm → code/data → execute" } },
    { worked: { tag: "variation", title: "What goes into the model?", q: "A supermarket wants to simulate its checkout queues to decide how many tills to open. Which details should the model include and which should it leave out?",
      steps: [
        { m: "Include: arrival rate of customers, items per basket, serving time per item, number of tills, queue discipline.", mk: "1" },
        { m: "Leave out: customers' names, what they buy, the colour of the tills, the shop's layout — they don't affect waiting times.", mk: "1" },
        { m: "Then automate: algorithms for arrivals and serving, a queue data structure per till, run the simulation and measure average waits (AS 2024's Skeleton did exactly this).", mk: "1" }
      ], result: "Only what affects waiting time" } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Match the terms", src: "AS June 2018 · P1 Q01 · 4 marks",
      q: "Terms: A information hiding, B procedural abstraction, C functional abstraction, D data abstraction, E problem abstraction, F decomposition, G composition, H automation. Write the label that most closely matches each description: (i) breaking a problem into a number of sub-problems; (ii) models are put into action to solve problems; (iii) combining procedures into compound procedures; (iv) details are removed until the problem is represented in a way that is possible to solve because the problem reduces to one that has already been solved.",
      steps: [
        { m: "(i) F — decomposition;", mk: "1" },
        { m: "(ii) H — automation;", mk: "1" },
        { m: "(iii) G — composition;", mk: "1" },
        { m: "(iv) E — problem abstraction;", mk: "1", n: "Each label may be used only once (if repeated, all occurrences are ignored). A. lower case." }
      ], result: "F · H · G · E" } },

    { page: "Exam toolkit" },
    { steps: [
      "**Automation** = putting models into action to solve problems.",
      "**Four steps**: create algorithms → implement them in code → implement the models in data structures → execute.",
      "Models are abstractions: include the minimum detail needed for the required accuracy."
    ] },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"Automation means robots replacing people.\" — in this spec it means putting abstract models into action with algorithms, code and data.",
      "\"Include as much detail as possible in the model.\" — more detail costs time and memory; include only what the problem needs."
    ] } },
    { callout: { t: "mnemonic", h: "\"MACDE\"", body: "**M**odel → **A**lgorithms → **C**ode → **D**ata structures → **E**xecute." } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.4.1.3 abstraction (the model); 4.4.1.2 algorithms; 4.2 data structures; 4.13 the systematic approach; 4.4.2.1 FSMs as models; NEA simulations." } }
  ],
  flashcards: [
    ["Automation?", "Putting models (abstractions of real-world objects or phenomena) into action to solve problems."],
    ["Four steps of automation?", "Create algorithms; implement them in code; implement the models in data structures; execute the code."],
    ["What should a model include?", "The minimum detail needed to solve the problem to the required accuracy."],
    ["AS 2018 Q01: \"models are put into action to solve problems\"?", "H — automation."],
    ["AS 2018 Q01: \"breaking a problem into sub-problems\"?", "F — decomposition."],
    ["AS 2018 Q01: \"combining procedures into compound procedures\"?", "G — composition."],
    ["AS 2018 Q01: \"details removed until it reduces to a solved problem\"?", "E — problem abstraction."],
    ["Mnemonic for automation?", "MACDE: Model, Algorithms, Code, Data structures, Execute."]
  ],
  quiz: [
    { q: "\"Models are put into action to solve problems\" describes", opts: ["automation", "composition", "decomposition", "information hiding"], ans: 0, why: "AS 2018 Q01 → H." },
    { q: "Which is NOT one of the automation steps?", opts: ["buying hardware", "creating algorithms", "implementing models in data structures", "executing the code"], ans: 0, why: "Spec list." },
    { q: "A model should include", opts: ["the minimum detail needed", "every possible detail", "no data", "only the user interface"], ans: 0, why: "Clean abstraction." },
    { q: "In AS 2018 Q01, a label used twice", opts: ["has all its occurrences ignored", "scores twice", "scores once", "is accepted"], ans: 0, why: "Scheme note." }
  ]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
