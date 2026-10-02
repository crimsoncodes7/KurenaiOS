/* Kurenai OS — deep content: AQA 7517 §4.4 Theory of Computation (Part 1) */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.4.3.1"] = {
  notes: [
    { h: "Backus-Naur Form (BNF)" },
    { callout: { t: "info", body: "BNF is a formal notation for expressing the syntax of a programming language. It is more powerful than regular expressions because it supports **recursion**, which allows it to describe nested structures like matching brackets." } },
    { callout: { t: "def", h: "BNF Key Concepts", body: [
      { kv: [
        ["Terminal", "An actual symbol in the language — cannot be broken down further (e.g., `0`, `IF`, `;`)."],
        ["Non-Terminal", "A named placeholder defined by production rules (written `<name>`)."],
        ["::=", "Read as 'is defined as' — separates the left side from its definition."],
        ["|", "Read as 'OR' — separates alternative productions."]
      ]}
    ]}},
    { callout: { t: "memorise", h: "BNF Quick Reference", body: "`<name> ::= option1 | option2 | option3`\n\nRecursion: `<integer> ::= <digit> | <digit><integer>` — an integer is either one digit, or a digit followed by another integer." }},
    { callout: { t: "tip", h: "Why BNF Over Regex?", body: "Regular expressions cannot express **context-free** grammars — they have no memory of what came before. BNF (and its parse trees) can track matching pairs like `()`, `{}`, and `begin...end` blocks." }},
    { callout: { t: "info", h: "Syntax Diagrams", body: "A visual alternative to BNF. Terminals are drawn in **ovals/circles**; non-terminals in **rectangles**. Arrows show the valid paths through the grammar. Both represent the same information." }},
    { code: { lang: "pseudo", cap: "Recursive BNF grammar for unsigned integers.", src: "<digit> ::= \"0\" | \"1\" | \"2\" | \"3\" | \"4\" | \"5\" | \"6\" | \"7\" | \"8\" | \"9\"\n<integer> ::= <digit> | <digit> <integer>\n\n# This means an integer is:\n# - A single digit (base case), OR\n# - A digit followed by another integer (recursive case)\n# So: 123 = <digit>1 followed by <integer>(23 = <digit>2 followed by <integer>(3))" }},
    { callout: { t: "miscon", h: "Non-Terminals Are Not Variables", body: "BNF non-terminals (e.g. `<digit>`) are NOT variables that store values — they are named placeholders that MUST be expanded by applying production rules. Also: BNF is NOT a regular expression; BNF supports recursion and context-free grammars, while regular expressions cannot." }}
  ],
  flashcards: [
    ["What does BNF stand for?", "Backus-Naur Form."],
    ["What is a non-terminal?", "A placeholder in BNF that must be further expanded."],
    ["What is a terminal?", "An actual value or symbol in the language grammar."],
    ["Why is BNF better than RegEx for nested brackets?", "BNF supports recursion, which allows it to track depth."],
    ["What does `::=` mean?", "Is defined as."],
    ["What does the `|` symbol mean in BNF?", "OR — it separates alternative productions for a non-terminal."],
    ["Write a recursive BNF rule for an unsigned integer.", "<integer> ::= <digit> | <digit> <integer> — one digit, or a digit followed by another integer."],
    ["What kind of grammar can BNF express that RegEx cannot?", "Context-free grammars — those needing memory of nesting/matching, e.g. balanced brackets."],
    ["How are terminals and non-terminals drawn in syntax diagrams?", "Terminals in ovals/circles; non-terminals in rectangles, with arrows for valid paths."]
  ],
  quiz: [
    { q: "In the rule `<bit> ::= '0' | '1'`, what is `<bit>`?", opts: ["Terminal", "Non-terminal", "Variable", "Loop"], ans: 1, why: "It is a placeholder defined by other symbols." },
    { q: "Which feature of BNF allows for infinite sequences?", opts: ["Iteration", "Recursion", "Selection", "Assignment"], ans: 1, why: "A rule calling itself allows for arbitrary length." },
    { q: "Terminal symbols in syntax diagrams are...", opts: ["Rectangles", "Ovals/Circles", "Triangles", "Diamonds"], ans: 1, why: "Standard convention for terminal symbols." },
    { q: "Which cannot represent a context-free grammar?", opts: ["BNF", "Regular Expressions", "Syntax Diagrams", "Compilers"], ans: 1, why: "RegEx can only represent regular languages, not context-free ones (no recursion)." },
    { q: "In `<num> ::= <digit> | <digit><num>`, the rule is recursive because...", opts: ["it uses a terminal", "<num> is defined in terms of itself", "it has an OR", "it uses digits"], ans: 1, why: "<num> refers to <num> on the right-hand side, allowing arbitrary length." }
  ],
  exam: [
    { q: "Explain why Backus-Naur Form is required to define the syntax of a high-level programming language, rather than just using regular expressions.", marks: 2, ms: ["High-level languages often have nested structures (like matching parentheses) (1)", "Regular expressions cannot handle recursion/counting, whereas BNF can (1)"] },
    { q: "Define the terms 'terminal' and 'non-terminal' in BNF, and explain the role of the symbols `::=` and `|`.", marks: 4, ms: ["Terminal: an actual symbol of the language that cannot be expanded further (1)", "Non-terminal: a named placeholder, written <name>, defined by production rules (1)", "::= means 'is defined as' (1)", "| separates alternative productions ('OR') (1)"] },
    { q: "Using the grammar `<digit> ::= \"0\"|...|\"9\"` and `<integer> ::= <digit> | <digit><integer>`, explain how it defines the string \"42\" and discuss why recursion makes BNF more powerful than regular expressions.", marks: 6, ms: ["<integer> expands to <digit><integer> with <digit> = 4 (1)", "the inner <integer> expands to <digit> = 2 (base case) (1)", "giving the sequence 4 then 2 = \"42\" (1)", "Recursion lets a non-terminal refer to itself, generating arbitrarily long/nested structures (1-2)", "Regular expressions describe only regular languages and cannot count/match nesting (e.g. balanced brackets), which BNF (context-free) can (1)"] }
  ]
};

})(window.KOS_CONTENT);
