/* Kurenai OS — js/data/exam-essentials.js
   EXAM ESSENTIALS, a paper at a time (the Exams & Papers rework §5, the
   Revise guide's first chapter; read beside js/data/exam-playbook.js, which
   holds each board's command words, habits, conventions and level grids).

   Sources, checked 18 November 2026:
   - OCR F201: the Cambridge Advanced Nationals in IT: Data Analytics
     specification (Version 5, June 2026), F201's "Assessment guidance",
     and the SAM (v3.0, November 2024).
   - Edexcel 9MA0: the Mathematical Formulae and Statistical Tables booklet
     (Issue 1, July 2017), pages 3 and 5–7 — what it GIVES for Pure, so
     what is not in it must be learned.
   - AQA 7517: the specification's assessment overview.
   Written by KurenaiOS; nothing is copied from a board document.

   Shape: KOS_EXAMS.essentials[preset] =
     {glance: [[label, value]], objectives: [{code, what, spot}], structure:
      [{marks, how: [steps]}], notExaminable: [..], booklet: {given: [..],
      learn: [..]}, templates: [{w, frame, eg}], routine: [..], night: [..]}
   A preset with no entry of its own reads its board's (`board:<name>`). */
(function () {
  "use strict";
  var X = window.KOS_EXAMS = window.KOS_EXAMS || {};
  var E = X.essentials = X.essentials || {};

  /* ---------------- OCR F201 ---------------- */
  E["ocr-f201"] = {
    glance: [
      ["Time", "1 h 30 min"], ["Marks", "60, every question compulsory"], ["Pace", "1.5 minutes a mark"],
      ["Scenario", "One short scenario that develops through the whole paper — every answer is about that organisation"],
      ["Question types", "Choosing from options, short closed answers, points-marked explanations, and levels-marked extended answers"],
      ["Extended answers", "One 6-mark and one 9-mark, marked by level"],
      ["Coverage", "At least one question or part from every topic area (1–5)"],
      ["Materials", "None; no calculator needed"]
    ],
    objectives: [
      { code: "PO1", what: "Show knowledge and understanding: recall it in general terms.",
        spot: "State, Identify, Describe the purpose of … — usually 1–2 marks, and the answer would be the same for any organisation." },
      { code: "PO2", what: "Apply knowledge and understanding: use it for THIS scenario.",
        spot: "Explain one benefit / limitation to the [organisation] … — the second mark is only for applying the point to them." },
      { code: "PO3", what: "Analyse and evaluate, in relation to the scenario.",
        spot: "Analyse … (6) and Discuss … (9) — marked by level; a 9-marker needs a supported recommendation." }
    ],
    structure: [
      { marks: 2, how: ["Make the point (1).", "Expand it FOR THE ORGANISATION: \"… so the retailer can …\" (1)."] },
      { marks: 4, how: ["Benefit: point (1) + applied expansion (1).", "Limitation: point (1) + applied expansion (1).", "Label them \"Benefit\" and \"Limitation\" exactly as the paper's answer space does."] },
      { marks: 6, how: ["Analyse: two or three points, each developed into a consequence for the organisation.", "Use the specification's terms (UK GDPR principles, data subjects' rights, the 6Vs…).", "Link causes to effects (\"this means… which leads to…\"); a list of points stays in Level 1."] },
      { marks: 9, how: ["Discuss: developed benefits AND developed limitations, all about the scenario.", "Weigh them, then give a recommendation and the reasons for it — no conclusion caps the answer below Level 3.", "Follow the bullet points under the question: each is something the marker looks for."] }
    ],
    notExaminable: [
      "Technical detail of how a tool works inside (say what is done and why, not how the software does it).",
      "Brand names of data lakes, warehouses or cloud providers — describe characteristics instead.",
      "Anything outside the F201 topic areas: F200's content is assumed knowledge, not re-examined as itself."
    ],
    templates: [
      { w: "Identify / State", frame: "Name it — one word or a short phrase. No explanation is credited.", eg: "Velocity." },
      { w: "Describe", frame: "Say what it is / what happens, with enough detail for each mark.", eg: "Data wrangling transforms raw data from several sources into one usable format so it can be analysed." },
      { w: "Explain (2)", frame: "[Point] (1) so / because / which means [effect for the organisation] (1).", eg: "Stock levels can be tracked (1) so the retailer reorders popular items before they sell out (1)." },
      { w: "Explain one benefit and one limitation (4)", frame: "Benefit: [point] (1) so [effect for them] (1). Limitation: [point] (1) so [effect for them] (1).", eg: "Benefit: storms are forecast earlier (1) so turbines can be protected (1). Limitation: the sensors and processing are costly (1) which adds to the company's costs (1)." },
      { w: "Analyse (6)", frame: "Two or three points, each: what → why it matters → the consequence for the organisation; then a sentence that links them.", eg: "Collecting half-hourly readings shows when a home is empty, so … which means customers may …" },
      { w: "Discuss (9)", frame: "Benefits developed for the scenario → limitations developed for the scenario → \"I would / would not recommend … because …\" weighing both.", eg: "On balance the retailer should use cluster analysis because …, provided it …" }
    ],
    routine: [
      "Read the scenario at the start of the paper twice; underline what the organisation does and who its data is about.",
      "1.5 minutes a mark: a 9-marker is about 13 minutes, a 6-marker about 9.",
      "For every 2-mark Explain, check the second half names the organisation or its customers.",
      "Do the 6- and 9-markers with time to plan three lines first; leave none blank.",
      "Last five minutes: every extended answer ends with a conclusion or a judgement."
    ],
    night: [
      "The 6Vs and the six steps for analysing big data, in order.",
      "The eight data cleaning techniques — and an example error each one fixes.",
      "The four data mining techniques and the data analytic techniques.",
      "UK GDPR: its purpose, the principles and the rights of data subjects; marketing consent.",
      "The Data Ethics Framework (transparency, accountability, fairness) and inclusive data principles.",
      "Decision tree, random forest and K-means: one sentence each on how it works.",
      "Write one Explain answer in the point (1) + so-for-them (1) form without looking."
    ]
  };

  /* ---------------- Edexcel Pure (9MA0) ---------------- */
  var PURE_BOOKLET = {
    given: [
      "Mensuration: surface area of a sphere $4\\pi r^2$; curved surface of a cone $\\pi r \\times$ slant height.",
      "Arithmetic series sum $S_n = \\frac12 n(a + l) = \\frac12 n[2a + (n - 1)d]$.",
      "Geometric series sum $S_n$ and sum to infinity $S_\\infty = \\frac{a}{1 - r}$ for $|r| < 1$.",
      "Binomial expansion for a positive integer $n$, and $(1 + x)^n$ for any rational $n$, $|x| < 1$.",
      "Logs: change of base $\\log_a x = \\frac{\\log_b x}{\\log_b a}$, and $e^{x \\ln a} = a^x$.",
      "Compound angles $\\sin(A \\pm B)$, $\\cos(A \\pm B)$, $\\tan(A \\pm B)$, and the sum-to-product formulae.",
      "Small-angle approximations $\\sin\\theta \\approx \\theta$, $\\cos\\theta \\approx 1 - \\frac{\\theta^2}{2}$, $\\tan\\theta \\approx \\theta$ (radians).",
      "Differentiation from first principles; the derivatives of $\\tan kx$, $\\sec kx$, $\\cot kx$, $\\csc kx$; the quotient rule.",
      "Integrals of $\\sec^2 kx$, $\\tan kx$, $\\cot kx$, $\\csc kx$, $\\sec kx$; integration by parts.",
      "The trapezium rule and Newton–Raphson."
    ],
    learn: [
      "The quadratic formula, completing the square and the discriminant $b^2 - 4ac$ (and what $>0$, $=0$, $<0$ mean).",
      "Laws of indices and of logarithms (only change of base is given).",
      "Straight lines: $y - y_1 = m(x - x_1)$, perpendicular gradients $m_1 m_2 = -1$; the circle $(x - a)^2 + (y - b)^2 = r^2$.",
      "The sine rule, cosine rule and area $\\frac12 ab\\sin C$.",
      "$\\sin^2\\theta + \\cos^2\\theta = 1$, $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$, $1 + \\tan^2\\theta = \\sec^2\\theta$, $1 + \\cot^2\\theta = \\csc^2\\theta$.",
      "The double-angle formulae (not printed — derive them from $A = B$ if you must).",
      "$R\\cos(\\theta \\pm \\alpha)$ and $R\\sin(\\theta \\pm \\alpha)$: $R = \\sqrt{a^2 + b^2}$, $\\tan\\alpha = \\frac{b}{a}$.",
      "Radians: arc length $r\\theta$, sector area $\\frac12 r^2\\theta$.",
      "nth terms: arithmetic $a + (n - 1)d$, geometric $ar^{n-1}$ (only the sums are given).",
      "Derivatives of $x^n$, $e^{kx}$, $\\ln x$, $\\sin kx$, $\\cos kx$, $a^x$; the chain and product rules.",
      "Integrals of $x^n$, $e^{kx}$, $\\frac1x$, $\\sin kx$, $\\cos kx$; area between curves.",
      "Vectors: magnitude $\\sqrt{x^2 + y^2 + z^2}$, distance between points, a unit vector.",
      "The factor theorem; modulus and inverse functions (domain and range swap)."
    ]
  };
  E["board:Edexcel"] = {
    glance: [
      ["Time", "2 h for each Pure paper"], ["Marks", "100"], ["Pace", "1.2 minutes a mark"],
      ["Calculator", "Allowed — set it up before the start (the playbook's FX-991CW notes)"],
      ["Booklet", "The formulae booklet: know what it gives and what it does not"],
      ["Questions", "Short to long, ending with multi-part questions; \"Show that\" and \"Hence\" link parts"]
    ],
    booklet: PURE_BOOKLET,
    templates: [
      { w: "Show that", frame: "Every step written, the given answer reached exactly, no step skipped (it is marked A1* — cso).", eg: "… $= 16 - 4k^2 + 12k > 0 \\Rightarrow k^2 - 3k - 4 < 0$" },
      { w: "Hence", frame: "Use the previous part's result — another method scores nothing.", eg: "Hence, using (a), …" },
      { w: "Prove", frame: "State what you assume, argue in steps, end with a concluding sentence.", eg: "… which is a contradiction, so $\\sqrt2$ is irrational." },
      { w: "Find / Solve", frame: "The method first (M marks survive a slip), then every solution in the interval.", eg: "$\\theta = 30°, 150°, 210°, 330°$" },
      { w: "Exact", frame: "Surds, $\\pi$ or $\\ln$ left in — no decimal.", eg: "$6\\ln\\frac{17}{16} - \\frac{45}{136}$" }
    ],
    routine: [
      "First minute: read the last question; write down anything from the learn list you are afraid of forgetting.",
      "1.2 minutes a mark; move on after two minutes stuck and come back.",
      "Give answers to 3 significant figures unless the question says otherwise.",
      "Check the interval and the units (degrees or radians) before solving any trig equation.",
      "Last five minutes: every \"Show that\" ends on the exact given answer."
    ],
    night: [
      "Write the learn list from memory, then check it against this page.",
      "One trig equation in radians and one in degrees, with every solution in the interval.",
      "One partial fractions + binomial expansion with its validity.",
      "Set the calculator: degrees or radians, fractions mode, statistics cleared."
    ]
  };
  E["edexcel-9ma0-pure-mock"] = Object.assign({}, E["board:Edexcel"], {
    glance: E["board:Edexcel"].glance.concat([["This mock", "Pure only: all of AS Pure, and the A2 chapters on algebraic methods, sequences and series, functions and graphs, radians, trigonometric functions, further trigonometry and 3D vectors"]])
  });

  /* ---------------- AQA Computer Science (7517) ---------------- */
  E["board:AQA"] = {
    glance: [
      ["Paper 1", "2 h 30, 100 marks, on screen, with the Skeleton Program"],
      ["Paper 2", "2 h 30, 100 marks, written"],
      ["Pace", "1.5 minutes a mark"], ["Calculator", "Not allowed"],
      ["Code", "Answers may be written in the programming language you studied or in pseudo-code"]
    ],
    templates: [
      { w: "State / Define", frame: "One factual line using the AQA term — no justification is credited.", eg: "A floating gate transistor stores a charge." },
      { w: "Describe", frame: "The steps or features in order, one mark a distinct step.", eg: "The reader emits radio waves; the tag's antenna … ; the data is sent back …" },
      { w: "Explain", frame: "Point + because/so + effect: each mark a linked reason.", eg: "No moving parts, so it is not damaged when the laptop is dropped." },
      { w: "Compare", frame: "\"Whereas X …, Y …\" for each feature — describing each separately is not a comparison.", eg: "Whereas a stack removes the most recent item, a queue removes the oldest." },
      { w: "Trace", frame: "Fill the table a row per change, in order; write a value only when it changes.", eg: "R0: 13, 6, 3, 1, 0" },
      { w: "Write an algorithm / program", frame: "Correct structure first (loop, condition, return), then names; marks are for the steps, so a slip costs one.", eg: "IF Top = -1 THEN OUTPUT \"Empty\" ELSE …" },
      { w: "Discuss (9)", frame: "Developed points on several sides (moral, ethical, legal, cultural), weighed, with a conclusion.", eg: "On balance, the benefits to … outweigh … provided …" }
    ],
    routine: [
      "1.5 minutes a mark; long-answer questions last.",
      "Show every step of a binary, Boolean or calculation answer — working is credited.",
      "Use the exact AQA noun (two's complement, CSMA/CA, floating gate transistor).",
      "Never write \"faster\" or \"cheaper\" alone: what, and why."
    ],
    night: [
      "Stack and queue operations with their pointers; a circular queue's isFull and isEmpty.",
      "Tree traversals (pre, in, post) and breadth- and depth-first order on one graph.",
      "Bubble sort passes and a binary search trace; the Big-O of each.",
      "The AQA assembly instructions and immediate vs direct addressing.",
      "Normalisation to 3NF and one SQL query with a join and ORDER BY.",
      "Boolean identities and De Morgan's laws; a half adder."
    ]
  };
  E["aqa-7517-ppe"] = Object.assign({}, E["board:AQA"], {
    glance: [["This mock", "2 h 30, 100 marks, written — your school's topic list from both papers"],
      ["Topics", "Logic gates and Boolean algebra, hardware, OOP, stacks, queues, recursion, graphs, trees, assembly language, consequences of computing, databases, sorting and searching"],
      ["Pace", "1.5 minutes a mark"], ["Calculator", "Not allowed"],
      ["Code", "Answers in your programming language or pseudo-code"]]
  });

  /* the entry for an assessment: its preset's, else its board's */
  X.essentialsFor = function (preset, board) {
    return (preset && E[preset]) || (board && E["board:" + board]) || null;
  };
})();
