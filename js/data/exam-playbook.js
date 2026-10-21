/* Kurenai OS — js/data/exam-playbook.js
   The playbook (roadmap 5.8, docs/exams-plan.md §13.3, frame 29r): each
   board's rules in one place, AUTHORED and paraphrased — never a board's
   own text (invariant 125).

     commands   the command-word decoder: what the word asks, what loses
                the mark, a micro-example
     habits     the 30-second pre-flight per question type (§16.4): which
                command words call it up, then the steps
     conventions  the board's working rules
     notation   the mark-scheme vocabulary (general marking terms)
     levels     levels of response, in plain words (where the board marks
                extended answers by level)
     calculator the FX-991CW: setup and checking, from Casio's own
                user's guide for the fx-570CW/fx-991CW (checked 21 October
                2026: the SETTINGS menu's Angle Unit, Input/Output, Number
                Format and Reset; Func Analysis; the Equation, Table,
                Statistics and Distribution apps)

   The booklet against must-memorise lists, the master mnemonics and the
   blacklist's misconceptions are not here: they are ASSEMBLED from the
   notes' own callouts for the scope (formula, memorise, mnemonic, miscon)
   and from the examiner's report notes (js/data/exam-reports.js).       */
window.KOS_EXAMS = window.KOS_EXAMS || {};
window.KOS_EXAMS.playbook = {
  AQA: {
    title: "AQA Computer Science",
    commands: [
      { w: "State", also: ["give", "name", "identify"], asks: "A fact, in a few words. No explanation is needed.", loses: "Writing a paragraph that buries the fact, or giving two answers where one is wrong.", eg: "State the purpose of the MAR. → It holds the address being read or written." },
      { w: "Define", asks: "A standalone definition someone could learn from.", loses: "\"The opposite of the last one\", or an example instead of a definition.", eg: "Define abstraction. → Removing detail that is not needed to solve the problem." },
      { w: "Describe", asks: "What happens, step by step, in order. No \"why\".", loses: "Doing the task instead of describing how it is done.", eg: "Describe how binary converts to hex. → Split into nibbles from the right; each nibble is one hex digit." },
      { w: "Explain", asks: "What and why: every point needs its reason.", loses: "A point with no \"because\" — \"reduces testing\" scores nothing without why.", eg: "Explain why subroutines help testing. → Each can be tested on its own, so there is less code to test at once." },
      { w: "Compare", asks: "Similarities and differences, both things named in each point.", loses: "Describing each thing separately with no comparison.", eg: "Compare RLE and dictionary compression. → RLE suits runs of repeated pixels; a dictionary suits repeated words in text." },
      { w: "Discuss", asks: "Several sides, developed, then a judgement.", loses: "One side only, or a list of points with no development.", eg: "Discuss the ethics of collecting location data: benefits, harms, the law, then a conclusion." },
      { w: "Evaluate", asks: "Weigh strengths against weaknesses and reach a justified conclusion.", loses: "Strengths and weaknesses with no conclusion.", eg: "Evaluate a hash table for this lookup: fast on average, slower when full; worth it if the table is sized well." },
      { w: "Calculate", also: ["how many", "what is the"], asks: "A number, with the working that produced it.", loses: "A bare answer that is wrong, with no working to earn method credit.", eg: "File size = width × height × colour depth, then convert units." },
      { w: "Trace", also: ["complete the trace table", "dry run", "hand-trace"], asks: "Every change to every variable, in order, one row per change.", loses: "Values written where nothing changed, a wrong order, or no final output.", eg: "i 1, 2, 3; total −1, 1, 0; OUTPUT once, after the loop." },
      { w: "Write", also: ["write an algorithm", "write a program", "write a regular expression"], asks: "Working code or pseudocode that does exactly what is specified.", loses: "Missing the edge cases the specification names, or code that does not run.", eg: "Read the input, loop until the condition, then output in the format asked." },
      { w: "Draw", also: ["complete the diagram"], asks: "A labelled diagram in the board's notation.", loses: "Unlabelled parts, or symbols the board does not use.", eg: "Draw the circuit with AND, OR and NOT only, every input labelled." }
    ],
    habits: [
      { type: "Trace table", words: ["trace", "dry run", "hand-trace", "complete the trace table"], steps: ["Write the starting values first.", "One row per change, in the order it happens.", "Leave a cell blank where nothing changed.", "Write the output, once, where it happens."] },
      { type: "Describe or explain", words: ["describe", "explain"], steps: ["Count the marks: that is how many points.", "Explain: every point gets a \"because\".", "Use the specification's term, then say what it does."] },
      { type: "Write a program (Section B)", words: ["write a program", "write a"], steps: ["List what the specification asks for, including the invalid inputs.", "Write it, then test with the values the question gives.", "Paste the whole program and your screen captures."] },
      { type: "Calculation", words: ["calculate", "how many", "what is the"], steps: ["Write the formula in words first.", "Show each conversion of units.", "Give the unit the question asks for."] },
      { type: "Extended answer (12 marks)", words: ["discuss", "evaluate", "essay"], steps: ["Plan two minutes: a point per paragraph, both sides.", "Use the technical terms the question names.", "End with a judgement that says on what it depends."] },
      { type: "Definition", words: ["define", "what is meant by"], steps: ["Make it stand alone.", "No example in place of the definition (add one after if it helps)."] }
    ],
    conventions: [
      ["←", "assignment"],
      ["FOR i ← 1 TO n … ENDFOR", "inclusive at both ends"],
      ["IF … THEN … ELSE … ENDIF", ""],
      ["WHILE … ENDWHILE", "tests before each pass"],
      ["REPEAT … UNTIL", "tests after each pass, so runs at least once"],
      ["MOD, DIV", "remainder, whole-number division"],
      ["OUTPUT, USERINPUT", ""],
      ["arr[0]", "arrays start at 0 unless the question says otherwise"]
    ],
    conventionsNote: "Any clear pseudocode is accepted unless a question asks for AQA's own.",
    notation: [["(1)", "one mark point"], ["max", "the most a set of points can earn"], ["A", "accept"], ["R", "reject"], ["NE", "not enough for the mark"], ["I", "ignore"]],
    levels: {
      title: "Extended answers (AQA)",
      rows: [
        ["4", "top", "A thorough answer covering the parts the question names, technical terms used correctly, well reasoned, with a conclusion."],
        ["3", "upper", "Most parts covered with some development; a few gaps or a weak conclusion."],
        ["2", "lower", "Some relevant points, little developed; parts of the question missed."],
        ["1", "bottom", "A few relevant points, mostly listed."]
      ],
      read: ["The examiner reads the whole answer, then picks the level that fits best.", "Within a level, the mark depends on how well the answer fits it.", "Points that are not linked to the question's context earn little."],
      note: "Paraphrased; each question's own mark scheme sets its bands."
    }
  },
  Edexcel: {
    title: "Edexcel Mathematics",
    commands: [
      { w: "Find", also: ["calculate", "work out"], asks: "Any valid method; the working still earns method marks if the answer slips.", loses: "A bare answer from a calculator with no method written.", eg: "Find the stationary points: differentiate, set to 0, solve, substitute back." },
      { w: "Show that", asks: "The answer is given: every step from the question to it must be on the page.", loses: "Skipping the line where the given result appears, or working backwards from it.", eg: "End on exactly the printed statement, after a line that leads to it." },
      { w: "Hence", asks: "Use the result you have just found. Another route scores nothing.", loses: "Starting again from scratch.", eg: "Hence solve: use the factorised form from part (a)." },
      { w: "Hence or otherwise", asks: "Using the last result is quickest, but any correct method scores.", loses: "Choosing a longer route and running out of time.", eg: "Use part (a)'s identity unless another way is clearly shorter." },
      { w: "Prove", also: ["show by contradiction", "show by exhaustion"], asks: "A complete argument: assumption, deduction, conclusion.", loses: "A correct idea without the concluding statement.", eg: "End with \"…, so there is no greatest odd integer.\"" },
      { w: "Exact", also: ["exact value", "exact form"], asks: "Leave it as a fraction, surd, ln, e or π.", loses: "A decimal where an exact form was asked.", eg: "32/3, not 10.67." },
      { w: "Sketch", asks: "The shape with the key features labelled: intercepts, turning points, asymptotes.", loses: "An unlabelled curve, or a missing asymptote.", eg: "Label where it crosses the axes and the asymptote's equation." },
      { w: "Write down", also: ["state"], asks: "The answer with little or no working; it should follow from what is there.", loses: "Spending time deriving it.", eg: "Write down the centre of the circle (from its equation)." },
      { w: "Determine", also: ["deduce"], asks: "Reach the answer by reasoning you show; deduce means from what came before.", loses: "An answer without the reason that justifies it.", eg: "Determine the nature: the second derivative is negative, so a maximum." },
      { w: "Explain", also: ["comment", "interpret", "criticise", "evaluate the model"], asks: "Words in context: what the figure or model means here.", loses: "A general statement with no reference to the context.", eg: "\"The model predicts negative height after 10 s, so it is not valid then.\"" },
      { w: "Use algebra", also: ["solutions relying on calculator technology"], asks: "The algebra must be on the page; a calculator answer alone scores nothing.", loses: "Solving on the calculator without the working.", eg: "Form the quadratic, factorise it, then solve." }
    ],
    habits: [
      { type: "Show that", words: ["show that"], steps: ["Start from the left-hand side or the given information.", "One step per line, no leaps.", "End on the exact printed statement."] },
      { type: "Proof", words: ["prove", "contradiction", "exhaustion"], steps: ["Say which method: deduction, exhaustion or contradiction.", "State the assumption (contradiction) or the cases (exhaustion).", "Finish with a sentence that concludes."] },
      { type: "Exact answer", words: ["exact"], steps: ["Keep surds, fractions, ln and π to the end.", "Check the form asked for (a + b√2, ln k).", "Never round in the middle."] },
      { type: "Hence", words: ["hence"], steps: ["Find the result of the last part on the page.", "Write how it applies before using it."] },
      { type: "Modelling", words: ["model", "criticise", "evaluate", "comment"], steps: ["Answer in the context, with units.", "Name a limitation: where the model breaks down.", "Suggest one refinement if asked."] },
      { type: "Hypothesis test", words: ["test", "significance", "critical region"], steps: ["H₀ and H₁ in terms of the parameter (p, ρ or μ).", "The probability or the critical region, compared with the level.", "A conclusion in context, not \"reject H₀\" alone."] },
      { type: "Sketch", words: ["sketch"], steps: ["Shape first, then every intercept and turning point.", "Asymptotes as dashed lines with their equations."] }
    ],
    conventions: [
      ["3 s.f.", "inexact answers to three significant figures unless the question says otherwise"],
      ["Exact", "fractions, surds, ln and π stay exact when asked"],
      ["Radians", "calculus with trigonometric functions works in radians"],
      ["Show that", "the given result must appear, after a line that leads to it"],
      ["Follow through", "a later mark can follow an earlier wrong value used correctly"],
      ["Units", "answers in context carry their units"]
    ],
    conventionsNote: "Working that is crossed out and not replaced is still read; replace it, do not just strike it.",
    notation: [["M", "method mark"], ["A", "accuracy mark, needs its M"], ["B", "independent mark"], ["dM", "depends on the M before"], ["ft", "follow through"], ["cao", "correct answer only"], ["cso", "correct solution only"], ["awrt", "anything that rounds to"], ["oe", "or equivalent"], ["isw", "ignore subsequent working"]],
    calculator: {
      title: "FX-991CW",
      setup: [
        "Reset before a paper: SETTINGS → Reset → Settings & Data (Initialize All also clears memory).",
        "Angle Unit: Radian for calculus with trigonometric functions; Degree when the question works in degrees.",
        "Input/Output: MathI/MathO (the default) keeps fractions, roots and π exact.",
        "Number Format: Norm 1 (the default), or Fix when the question asks for decimal places."
      ],
      checks: [
        ["Definite integral", "Func Analysis → Integration (∫): check your exact answer's decimal. Set Radian for trigonometric integrands; split a long or abrupt interval."],
        ["Derivative at a point", "Func Analysis → Derivative (d/dx): check a gradient. It can be inaccurate at a turning point or a sharp change."],
        ["Polynomial", "Equation → Polynomial (degree 2 to 4): check roots you factorised; a quadratic or cubic also shows its turning points."],
        ["Simultaneous equations", "Equation → Simul Equation (2 to 4 unknowns): check your solution."],
        ["Table", "Table app, f(x) and g(x) over a range and step: check a sign change for a root, or an iteration."],
        ["Statistics", "Statistics → 1-Variable for mean and σx, 2-Variable with y = a + bx for the regression line and r."],
        ["Distributions", "Distribution → Binomial PD and CD, Normal PD and CD, Inverse Normal (left tail)."]
      ],
      note: "A calculator answer with no working can lose every method mark. Check with it; write the method.",
      source: "From Casio's user's guide for the fx-570CW/fx-991CW."
    }
  },
  OCR: {
    title: "OCR Cambridge Technicals IT",
    commands: [
      { w: "Identify", also: ["state", "give", "name"], asks: "Pick out or name it; a word or a short phrase.", loses: "A long description that never names the thing.", eg: "Identify one sensor. → A passive infrared sensor." },
      { w: "Describe", asks: "Say what it is like or what happens, with detail.", loses: "Naming it without the detail the marks need.", eg: "Describe an actuator: it turns a signal into movement, e.g. a valve opening." },
      { w: "Explain", asks: "Give the reasons: why or how, linked to the context.", loses: "A point with no reason, or a reason not tied to the scenario.", eg: "Explain why the shop uses RFID: tags are read without line of sight, so stock is counted faster." },
      { w: "Discuss", asks: "Both sides, developed, for the people in the scenario, then a judgement.", loses: "One side only, or no conclusion.", eg: "Benefits and risks for the organisation and its customers, then on balance…" },
      { w: "Evaluate", asks: "Strengths and weaknesses weighed, with a supported conclusion.", loses: "A list of pros and cons with no judgement.", eg: "Evaluate the plan: what it gains, what it risks, and whether it is worth it." },
      { w: "Justify", asks: "Give the reasons that support a choice, tied to the scenario.", loses: "A choice with no reason, or reasons that would fit any scenario.", eg: "Justify cloud storage here: staff work remotely, so files must be reachable anywhere." },
      { w: "Analyse", asks: "Break it into parts and show how they connect.", loses: "Describing the parts without the links between them.", eg: "Analyse the data flow: what is collected, where it goes, who uses it." }
    ],
    habits: [
      { type: "Extended question (levels)", words: ["discuss", "evaluate", "analyse", "justify"], steps: ["Two minutes: two benefits and two risks, for each party.", "A paragraph per point: the point, why, for whom.", "A conclusion that weighs and says on what it depends."] },
      { type: "Describe or explain", words: ["describe", "explain"], steps: ["Use the scenario's names and data.", "Explain: every point gets its reason.", "Count the marks: that is how many points."] },
      { type: "Short answer", words: ["identify", "state", "give", "name"], steps: ["Name it exactly.", "Give as many answers as asked, no more."] }
    ],
    conventions: [
      ["The scenario", "answers that use the scenario's organisation, data and people score; general ones do not"],
      ["Technical terms", "the specification's own words, used correctly"],
      ["Both parties", "where a question names two (an organisation and its customers), cover both"],
      ["Law and ethics", "name the law correctly (UK GDPR, the Data Protection Act 2018, the Computer Misuse Act 1990) and say how it applies"]
    ],
    notation: [["Level", "the band the whole answer fits"], ["(1)", "one mark point on a short question"]],
    levels: {
      title: "Levels of response (OCR)",
      rows: [
        ["3", "top band", "Detailed and accurate, both sides and both parties, a conclusion that is supported, terms used correctly."],
        ["2", "middle band", "Some explanation; one-sided, or the conclusion is missing."],
        ["1", "bottom band", "Points identified, little explained. Mostly a list."],
        ["0", "", "Nothing worth credit."]
      ],
      read: ["Examiners read the whole answer, then pick the level that fits best.", "Within the level, the mark depends on how well it fits.", "A strong conclusion cannot lift a Level 1 answer by itself."],
      climb: [["Level 1 → 2", "Explain each point: say why it is a benefit or a risk, not just name it."], ["Level 2 → 3", "Cover both sides and every party the question names."], ["Into the top of 3", "End with a judgement that weighs them and says on what it depends."]],
      check: ["Named the technology and what it does", "At least two benefits, explained", "At least two risks, explained", "Both the organisation and the people", "A legal or ethical point named correctly", "A conclusion that weighs, not repeats"],
      note: "Paraphrased general guidance; each question's own mark scheme sets its bands."
    }
  }
};
/* which board a subject's assessments sit with */
window.KOS_EXAMS.boardOf = { compsci: "AQA", maths: "Edexcel", it: "OCR" };
