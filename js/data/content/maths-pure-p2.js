/* Kurenai OS — deep content: Pure Mathematics, section P2 (Algebra and
   functions) at full A-level depth. Same contract as maths-pure-p4.js:
   every Edexcel question shape explained then worked with M1/A1/B1 marks;
   diagrams through the {fig} block; short lines, not walls of text. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* =====================================================================
   2.1  Laws of indices
   ===================================================================== */
C["maths:2.1"] = {
  notes: [
    { h: "Indices — the whole topic on one page" },
    "Indices are a language, not a topic: every later chapter (surds, quadratics in disguise, differentiation of $x^n$, exponentials and logs) is written in it.",
    { ul: [
      "The **laws** let you combine powers of the same base.",
      "The **conventions** ($x^0$, $x^{-n}$, $x^{1/n}$, $x^{m/n}$) let you rewrite roots and reciprocals as powers — which is what differentiation and integration need.",
      "Exam questions test whether you can move between the forms without a calculator: \"show all stages of your working\" appears on almost every one."
    ] },
    { table: { head: ["Where it appears", "What it looks like", "Marks"], rows: [
      ["AS Paper 1, Q1–Q5", "solve $4^{3x-2} = \\frac{1}{2\\sqrt2}$; express $y$ in terms of $x$ from $\\frac{9^{x-1}}{3^{y+2}} = 81$; write $\\frac{x^5 - 12\\sqrt{x}}{4x}$ as $ax^p + bx^q$", "3–6"],
      ["A-level Paper 1/2, early", "$2^x \\times 4^y = \\frac{1}{2\\sqrt2}$, express $y$ as a function of $x$; $3^x = 7^y$, exact value of $\\frac{x}{y}$", "2–3"],
      ["Inside other topics", "geometric sequences with terms $3^{4k-5}, 9^{7-2k}, \\ldots$; differentiating $\\frac{3}{\\sqrt{x}}$; exponential models", "—"]
    ] } },

    { page: "The laws and the conventions" },
    { h: "The three laws" },
    { callout: { t: "memorise", h: "Laws of indices — same base only", body: [
      "$$a^m \\times a^n = a^{m+n} \\qquad a^m \\div a^n = a^{m-n} \\qquad (a^m)^n = a^{mn}$$",
      "Also useful: $(ab)^n = a^n b^n$ and $\\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n}$.",
      "**Same base** is the whole condition. $2^3 \\times 3^2$ cannot be combined; $2^3 \\times 4^2 = 2^3 \\times 2^4 = 2^7$ can, once $4$ is written as $2^2$."
    ] } },
    { h: "The four conventions" },
    { kv: [
      ["$a^0 = 1$", "From $a^m \\div a^m = a^0$ and $a^m \\div a^m = 1$. (For $a \\neq 0$.)"],
      ["$a^{-n} = \\frac{1}{a^n}$", "From $a^0 \\div a^n = a^{-n}$. So $x^{-1} = \\frac1x$, $\; 2^{-3} = \\frac18$, $\; \\left(\\frac{2}{3}\\right)^{-2} = \\left(\\frac{3}{2}\\right)^2 = \\frac94$ — a negative power **flips** the fraction."],
      ["$a^{1/n} = \\sqrt[n]{a}$", "Because $\\left(a^{1/n}\\right)^n = a^1$. So $x^{1/2} = \\sqrt{x}$, $\; 8^{1/3} = 2$, $\; 16^{1/4} = 2$."],
      ["$a^{m/n} = \\left(\\sqrt[n]{a}\\right)^m = \\sqrt[n]{a^m}$", "Root first, then power — the numbers stay small. $8^{2/3} = (\\sqrt[3]{8})^2 = 2^2 = 4$; $\; 27^{-2/3} = \\frac{1}{(\\sqrt[3]{27})^2} = \\frac19$; $\; 16^{3/4} = 2^3 = 8$."]
    ] },
    { callout: { t: "tip", h: "Why root first?", body: "$8^{2/3}$ as $\\sqrt[3]{8^2} = \\sqrt[3]{64} = 4$ works but needs you to know $\\sqrt[3]{64}$. As $(\\sqrt[3]{8})^2 = 2^2$ it needs only $\\sqrt[3]{8}$. Same answer; the second is the one you can do under pressure." } },
    { h: "Powers of $x$ in calculus form" },
    "Differentiation and integration only work on $ax^n$. Anything with a root or a fraction has to be rewritten first:",
    { table: { head: ["Written as", "Index form", "Then"], rows: [
      ["$\\sqrt{x}$", "$x^{1/2}$", "$\\frac{d}{dx} = \\frac12 x^{-1/2}$"],
      ["$\\frac{3}{x^2}$", "$3x^{-2}$", "$\\frac{d}{dx} = -6x^{-3}$"],
      ["$\\frac{4}{\\sqrt{x}}$", "$4x^{-1/2}$", "$\\int = 8x^{1/2} + c$"],
      ["$x\\sqrt{x}$", "$x^{3/2}$", "$\\frac{d}{dx} = \\frac32 x^{1/2}$"],
      ["$\\frac{x^2 + 1}{\\sqrt{x}}$", "$x^{3/2} + x^{-1/2}$", "split the fraction, one term at a time"],
      ["$\\sqrt[3]{x^2}$", "$x^{2/3}$", ""]
    ] } },
    { worked: { tag: "exam", title: "Write $f(x) = \\frac{x^5 - 12x^{1/2}}{4x}$ in the form $ax^p + bx^q$, then integrate", src: "AS June 2025 · P1 Q5 · 6 marks",
      q: "$f(x) = \\frac{x^5 - 12x^{\\frac12}}{4x}$. **(a)** Write $f(x)$ in the form $ax^p + bx^q$ where $a$, $b$, $p$ and $q$ are simplified constants. **(b)** Hence find $\\displaystyle\\int f(x)\\,\\mathrm{d}x$, giving your answer in simplest form.",
      steps: [
        { h: "(a) Split the fraction — one term per numerator term", m: "$f(x) = \\dfrac{x^5}{4x} - \\dfrac{12x^{\\frac12}}{4x}$", mk: "M1", n: "Dividing by $4x$ means dividing **each** term by $4x$. Students who only divide the first term lose everything." },
        { h: "Subtract the indices", m: "$= \\dfrac14 x^{5-1} - 3x^{\\frac12 - 1} = \\dfrac14 x^4 - 3x^{-\\frac12}$", mk: "A1 A1", n: "$\\frac12 - 1 = -\\frac12$. A1 for each term; $a = \\frac14, p = 4, b = -3, q = -\\frac12$." },
        { h: "(b) Integrate term by term: raise the power, divide by the new power", m: "$\\displaystyle\\int \\left(\\dfrac14 x^4 - 3x^{-\\frac12}\\right)\\mathrm{d}x = \\dfrac14 \\cdot \\dfrac{x^5}{5} - 3 \\cdot \\dfrac{x^{\\frac12}}{\\frac12} + c$", mk: "M1", n: "$-\\frac12 + 1 = \\frac12$; dividing by $\\frac12$ is multiplying by 2." },
        { m: "$= \\dfrac{x^5}{20} - 6x^{\\frac12} + c$", mk: "A1 A1", n: "\"Simplest form\": $\\frac{1}{20}x^5$ not $\\frac{1}{4} \\cdot \\frac{x^5}{5}$; $-6\\sqrt{x}$ is equally fine. The $+ c$ is required for the last A1." }
      ], result: "(a) $\\dfrac14 x^4 - 3x^{-\\frac12}$ (b) $\\dfrac{x^5}{20} - 6x^{\\frac12} + c$" } },

    { page: "Equations with indices" },
    { h: "Method: make the bases the same, then equate the powers" },
    { ol: [
      "Write every number as a power of one **prime** base: $4 = 2^2$, $8 = 2^3$, $\\frac{1}{2\\sqrt2} = 2^{-3/2}$, $9 = 3^2$, $81 = 3^4$, $\\frac13 = 3^{-1}$.",
      "Use $(a^m)^n = a^{mn}$ to bring the powers down: $4^{3x-2} = 2^{2(3x-2)} = 2^{6x-4}$.",
      "Combine with the laws so each side is a single power of the base.",
      "Equate the indices — because $a^p = a^q \\Rightarrow p = q$ for a base $a > 0$, $a \\neq 1$ — and solve the resulting **linear** equation."
    ] },
    { callout: { t: "warn", h: "Why you may equate the indices", body: "$2^p = 2^q$ forces $p = q$ because $2^t$ is a one-to-one function: it is strictly increasing, so two different inputs never give the same output. The same is true for any base $a > 0$, $a \\neq 1$. It is **not** true for $a = 1$ ($1^p = 1^q$ always) — which never appears in a question, but is why the rule is stated with that condition." } },
    { worked: { tag: "exam", title: "Solve $4^{3x-2} = \\frac{1}{2\\sqrt2}$", src: "AS June 2020 · P1 Q3(ii) · 3 marks",
      q: "Solve the equation $4^{3x-2} = \\frac{1}{2\\sqrt2}$. (Solutions relying on calculator technology are not acceptable.)",
      steps: [
        { h: "Left side as a power of 2", m: "$4^{3x-2} = \\left(2^2\\right)^{3x-2} = 2^{6x-4}$", mk: "M1", n: "The M is for writing **both** sides as powers of the same base with the index laws applied." },
        { h: "Right side as a power of 2", m: "$2\\sqrt2 = 2^1 \\times 2^{\\frac12} = 2^{\\frac32}$, so $\\dfrac{1}{2\\sqrt2} = 2^{-\\frac32}$", n: "$\\sqrt2 = 2^{1/2}$; the reciprocal makes the index negative." },
        { h: "Equate the indices", m: "$6x - 4 = -\\dfrac32 \;\\Rightarrow\; 6x = \\dfrac52 \;\\Rightarrow\; x = \\dfrac{5}{12}$", mk: "M1 A1", n: "A linear equation. Leave the answer as an exact fraction." }
      ], result: "$x = \\dfrac{5}{12}$" } },
    { worked: { tag: "exam", title: "Express $y$ in terms of $x$: $\\frac{9^{x-1}}{3^{y+2}} = 81$", src: "AS Nov 2021 · P1 Q2 · 3 marks",
      q: "Given $\\frac{9^{x-1}}{3^{y+2}} = 81$, express $y$ in terms of $x$, writing your answer in simplest form.",
      steps: [
        { h: "Everything as a power of 3", m: "$9^{x-1} = 3^{2(x-1)} = 3^{2x-2}, \\qquad 81 = 3^4$", mk: "M1" },
        { h: "Combine the quotient with $a^m \\div a^n = a^{m-n}$", m: "$3^{(2x-2) - (y+2)} = 3^4 \;\\Rightarrow\; 3^{2x - y - 4} = 3^4$", mk: "M1", n: "Subtract the **whole** index $(y + 2)$ — the bracket is where the sign error lives." },
        { h: "Equate and rearrange", m: "$2x - y - 4 = 4 \;\\Rightarrow\; y = 2x - 8$", mk: "A1" }
      ], result: "$y = 2x - 8$" } },
    { worked: { tag: "exam", title: "Two bases in the same equation: $2^x \\times 4^y = \\frac{1}{2\\sqrt2}$", src: "A-level June 2019 · P2 Q1 · 3 marks",
      q: "Given $2^x \\times 4^y = \\frac{1}{2\\sqrt2}$, express $y$ as a function of $x$.",
      steps: [
        { m: "$2^x \\times 2^{2y} = 2^{-\\frac32} \;\\Rightarrow\; 2^{x + 2y} = 2^{-\\frac32}$", mk: "M1 M1", n: "First M for $4^y = 2^{2y}$ (or $\\frac{1}{2\\sqrt2} = 2^{-3/2}$); second for combining into one power." },
        { m: "$x + 2y = -\\dfrac32 \;\\Rightarrow\; y = -\\dfrac{x}{2} - \\dfrac34$", mk: "A1", n: "\"As a function of $x$\": $y = \\ldots$ with $x$ on the right, simplified." }
      ], result: "$y = -\\dfrac{1}{2}x - \\dfrac{3}{4}$" } },
    { worked: { tag: "exam", title: "Different bases that cannot be matched: $3^x = 7^y$", src: "A-level June 2025 · P2 Q3 · 2 marks",
      q: "Given that $3^x = 7^y$, find the exact value of $\\frac{x}{y}$.",
      steps: [
        { h: "No common base — take logs of both sides", m: "$\\ln(3^x) = \\ln(7^y) \;\\Rightarrow\; x\\ln3 = y\\ln7$", mk: "M1", n: "When the bases are different primes, indices cannot be equated. Logs turn the powers into multipliers (topic 6.4)." },
        { m: "$\\dfrac{x}{y} = \\dfrac{\\ln7}{\\ln3} \;\\left(= \\log_3 7\\right)$", mk: "A1", n: "\"Exact\" means leave it in logs. $1.77$ scores nothing." }
      ], result: "$\\dfrac{x}{y} = \\dfrac{\\ln 7}{\\ln 3} = \\log_3 7$" } },
    { worked: { tag: "exam", title: "Indices inside a geometric sequence", src: "A-level June 2024 · P1 Q9 · 6 marks",
      q: "The first 3 terms of a geometric sequence are $3^{4k-5}, \\quad 9^{7-2k}, \\quad 3^{2(k-1)}$ where $k$ is a constant. **(a)** Using algebra and making your reasoning clear, prove that $k = \\frac52$. **(b)** Hence find the sum to infinity of the geometric sequence.",
      steps: [
        { h: "(a) Geometric ⇒ common ratio ⇒ $(\\text{term }2)^2 = \\text{term }1 \\times \\text{term }3$", m: "$\\left(9^{7-2k}\\right)^2 = 3^{4k-5} \\times 3^{2k-2}$", mk: "M1", n: "State the property you are using — \"making your reasoning clear\" is the examiner telling you the equation alone is not enough." },
        { h: "Same base", m: "$3^{4(7-2k)} = 3^{6k-7} \;\\Rightarrow\; 28 - 8k = 6k - 7$", mk: "M1", n: "$9^{7-2k} = 3^{2(7-2k)}$, squared gives $3^{4(7-2k)} = 3^{28 - 8k}$." },
        { m: "$35 = 14k \;\\Rightarrow\; k = \\dfrac52$", mk: "A1*" },
        { h: "(b) Evaluate the terms with $k = \\frac52$", m: "$3^{5} = 243, \\quad 9^{2} = 81, \\quad 3^{3} = 27 \;\\Rightarrow\; r = \\dfrac{81}{243} = \\dfrac13$", mk: "M1", n: "$|r| < 1$, so the sum to infinity exists — say so." },
        { m: "$S_\\infty = \\dfrac{a}{1 - r} = \\dfrac{243}{1 - \\frac13} = \\dfrac{243 \\times 3}{2} = \\dfrac{729}{2}$", mk: "M1 A1" }
      ], result: "(a) $k = \\dfrac52$ (b) $S_\\infty = 364.5$" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Simplify** / **write in the form $ax^p$**", "one term, one power, fraction coefficients simplified: $\\frac{3}{2}x^{-\\frac12}$, not $\\frac{3}{2\\sqrt x}$"],
      ["**Solve … show all stages of your working**", "the same-base rewriting on the page, the index equation, the solution. A calculator answer with no working scores 0."],
      ["**Express $y$ in terms of $x$**", "$y = $ an expression in $x$ only, simplified"],
      ["**Find the exact value**", "fractions, surds or logs — never a decimal"],
      ["**Evaluate**", "a number: $27^{-2/3} = \\frac19$, not $\\frac{1}{27^{2/3}}$"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Adding indices when multiplying different bases**: $2^3 \\times 3^2 \\neq 6^5$.",
      "**$(a^m)^n$ vs $a^m \\times a^n$**: $(2^3)^2 = 2^6$ but $2^3 \\times 2^2 = 2^5$.",
      "**Negative index = reciprocal, not negative number**: $2^{-3} = \\frac18$, not $-8$.",
      "**Dividing only the first term** of a numerator by the denominator.",
      "**Subtracting a bracketed index without the bracket**: $2x - 2 - y + 2$ instead of $2x - 2 - (y + 2)$.",
      "**Stopping at $x^{5-1}$** — the A mark wants $x^4$."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Fractional powers", "Use the $x^{\\square}$ key with a fraction template inside: $27$, $x^\\square$, then the fraction key, $-2$ over $3$, EXE gives $\\frac19$. Use this to *check* an evaluation, not to replace the working the question demands."],
      ["Checking an index equation", "Substitute your $x$ back: $4^{3 \\times 5/12 - 2}$ should return $0.3535\\ldots = \\frac{1}{2\\sqrt2}$. Two seconds, and it catches a sign slip in the index."]
    ] },
    { h: "Memory aids" },
    { callout: { t: "mnemonic", h: "\"Multiply — add. Divide — subtract. Power of a power — multiply.\"", body: "Say the three in that order every time. The pairing (multiply→add, power→multiply) is where the mix-ups happen; the rhythm keeps them apart." } },
    { callout: { t: "mnemonic", h: "\"Flower power\": $x^{m/n}$ — the root is the flower's base, the power is on top", body: "Denominator = root (do it first, it is at the bottom); numerator = power (on top, do it after). $8^{2/3}$: cube root then square." } }
  ],
  flashcards: [
    ["$a^m \\times a^n$, $a^m \\div a^n$, $(a^m)^n$?", "$a^{m+n}$, $a^{m-n}$, $a^{mn}$ — same base only."],
    ["$a^0$, $a^{-n}$, $a^{1/n}$, $a^{m/n}$?", "$1$; $\\frac{1}{a^n}$; $\\sqrt[n]{a}$; $(\\sqrt[n]{a})^m$."],
    ["Evaluate $27^{-2/3}$.", "$\\frac{1}{(\\sqrt[3]{27})^2} = \\frac19$."],
    ["Evaluate $\\left(\\frac{4}{9}\\right)^{-3/2}$.", "Flip then root then cube: $\\left(\\frac{3}{2}\\right)^3 = \\frac{27}{8}$."],
    ["Write $\\frac{4}{\\sqrt{x}}$ and $x\\sqrt{x}$ in index form.", "$4x^{-1/2}$ and $x^{3/2}$."],
    ["Solve $4^{3x-2} = \\frac{1}{2\\sqrt2}$.", "$2^{6x-4} = 2^{-3/2} \\Rightarrow x = \\frac{5}{12}$."],
    ["$\\frac{9^{x-1}}{3^{y+2}} = 81$: $y$ in terms of $x$?", "$3^{2x-2-y-2} = 3^4 \\Rightarrow y = 2x - 8$."],
    ["$2^x \\times 4^y = \\frac{1}{2\\sqrt2}$: $y$ as a function of $x$?", "$x + 2y = -\\frac32 \\Rightarrow y = -\\frac{x}{2} - \\frac34$."],
    ["$3^x = 7^y$: exact $\\frac{x}{y}$?", "$\\frac{\\ln 7}{\\ln 3}$ — different primes need logs."],
    ["Why can you equate indices in $2^p = 2^q$?", "$2^t$ is one-to-one (strictly increasing), so equal outputs need equal inputs."],
    ["Write $\\frac{x^5 - 12\\sqrt{x}}{4x}$ as $ax^p + bx^q$.", "$\\frac14 x^4 - 3x^{-1/2}$."],
    ["$\\frac{1}{2\\sqrt2}$ as a power of 2?", "$2^{-3/2}$."]
  ],
  quiz: [
    { q: "$8^{2/3} =$", opts: ["4", "$\\tfrac{16}{3}$", "16", "$\\tfrac{1}{4}$"], ans: 0, why: "$(\\sqrt[3]{8})^2 = 4$." },
    { q: "$2^{-3} =$", opts: ["$-8$", "$\\tfrac18$", "$-\\tfrac18$", "$\\tfrac16$"], ans: 1, why: "Negative index means reciprocal." },
    { q: "$(x^3)^2 \\times x^4 =$", opts: ["$x^9$", "$x^{10}$", "$x^{24}$", "$x^{14}$"], ans: 1, why: "$x^6 \\times x^4 = x^{10}$." },
    { q: "$\\frac{6}{\\sqrt{x}}$ in index form:", opts: ["$6x^{-2}$", "$6x^{1/2}$", "$6x^{-1/2}$", "$\\tfrac16 x^{1/2}$"], ans: 2, why: "$\\sqrt{x} = x^{1/2}$, reciprocal gives $x^{-1/2}$." },
    { q: "$4^{x} = 8$ gives $x =$", opts: ["2", "$\\tfrac32$", "$\\tfrac23$", "3"], ans: 1, why: "$2^{2x} = 2^3$." },
    { q: "$\\left(\\frac{1}{16}\\right)^{-3/4} =$", opts: ["8", "$\\tfrac18$", "$-8$", "$\\tfrac{1}{64}$"], ans: 0, why: "Flip: $16^{3/4} = 2^3 = 8$." },
    { q: "$2^3 \\times 3^2 =$", opts: ["$6^5$", "$6^6$", "72", "$5^6$"], ans: 2, why: "Different bases — just multiply the numbers: $8 \\times 9$." },
    { q: "$x\\sqrt{x} \\div x^{-1} =$", opts: ["$x^{1/2}$", "$x^{5/2}$", "$x^{3/2}$", "$x^{-3/2}$"], ans: 1, why: "$x^{3/2 - (-1)} = x^{5/2}$." }
  ]
};

/* =====================================================================
   2.2  Surds
   ===================================================================== */
C["maths:2.2"] = {
  notes: [
    { h: "Surds — the whole topic on one page" },
    "A surd is a root that cannot be written as a fraction — $\\sqrt2$, $\\sqrt{18}$, $\\sqrt[3]{5}$. The exam wants three skills, always without a calculator:",
    { ul: [
      "**Simplify** a surd by pulling out square factors: $\\sqrt{18} = 3\\sqrt2$.",
      "**Rationalise** a denominator so that no surd is underneath: $\\frac{1}{3 - \\sqrt2} = \\frac{3 + \\sqrt2}{7}$.",
      "**Solve** an equation whose coefficients are surds, giving the answer \"as a surd in simplest form\": $x\\sqrt2 - \\sqrt{18} = x$."
    ] },
    "Surds appear again inside geometry (exact lengths, $\\sqrt{29}$ radius), trigonometry (exact values), integration (exact areas) and the quadratic formula. Simplest form is a habit, not a chapter.",

    { page: "Simplifying and rationalising" },
    { h: "The three rules" },
    { callout: { t: "memorise", h: "Surd rules (spec 2.2)", body: [
      "$$(\\sqrt{x})^2 = x \\qquad \\sqrt{xy} = \\sqrt{x}\\sqrt{y} \\qquad (\\sqrt{x} + \\sqrt{y})(\\sqrt{x} - \\sqrt{y}) = x - y$$",
      "There is **no** rule for $\\sqrt{x + y}$: $\\sqrt{9 + 16} = 5$, but $\\sqrt9 + \\sqrt{16} = 7$."
    ] } },
    { h: "Simplest form" },
    { ol: [
      "Find the **largest square factor**: $72 = 36 \\times 2$, so $\\sqrt{72} = 6\\sqrt2$. ($72 = 4 \\times 18$ also works but needs a second pass: $2\\sqrt{18} = 2 \\times 3\\sqrt2$.)",
      "Collect like surds as you would like terms: $3\\sqrt2 + \\sqrt{18} = 3\\sqrt2 + 3\\sqrt2 = 6\\sqrt2$.",
      "Multiply surds by multiplying under one root, then simplify: $\\sqrt6 \\times \\sqrt{10} = \\sqrt{60} = 2\\sqrt{15}$.",
      "Expand brackets normally; remember $(\\sqrt3)^2 = 3$: $(2 + \\sqrt3)^2 = 4 + 4\\sqrt3 + 3 = 7 + 4\\sqrt3$."
    ] },
    { table: { head: ["Surd", "Square factor", "Simplest form"], rows: [
      ["$\\sqrt{12}$", "$4 \\times 3$", "$2\\sqrt3$"], ["$\\sqrt{18}$", "$9 \\times 2$", "$3\\sqrt2$"], ["$\\sqrt{45}$", "$9 \\times 5$", "$3\\sqrt5$"],
      ["$\\sqrt{50}$", "$25 \\times 2$", "$5\\sqrt2$"], ["$\\sqrt{75}$", "$25 \\times 3$", "$5\\sqrt3$"], ["$\\sqrt{200}$", "$100 \\times 2$", "$10\\sqrt2$"]
    ] } },
    { h: "Rationalising the denominator" },
    "A fraction is not in simplest form while a surd sits underneath. Multiply top and bottom by something that makes the denominator rational:",
    { kv: [
      ["Denominator $\\sqrt{a}$", "multiply by $\\frac{\\sqrt a}{\\sqrt a}$: $\\quad \\frac{6}{\\sqrt3} = \\frac{6\\sqrt3}{3} = 2\\sqrt3$"],
      ["Denominator $a + \\sqrt b$", "multiply by the **conjugate** $\\frac{a - \\sqrt b}{a - \\sqrt b}$ — the difference of two squares kills the surd: $\\quad \\frac{1}{3 + \\sqrt2} = \\frac{3 - \\sqrt2}{9 - 2} = \\frac{3 - \\sqrt2}{7}$"],
      ["Denominator $\\sqrt a - \\sqrt b$", "conjugate $\\sqrt a + \\sqrt b$: $\\quad \\frac{4}{\\sqrt5 - \\sqrt3} = \\frac{4(\\sqrt5 + \\sqrt3)}{5 - 3} = 2\\sqrt5 + 2\\sqrt3$"]
    ] },
    { callout: { t: "tip", h: "Why the conjugate works", body: "$(a + \\sqrt b)(a - \\sqrt b) = a^2 - (\\sqrt b)^2 = a^2 - b$. The cross terms $-a\\sqrt b + a\\sqrt b$ cancel exactly — that is the third surd rule doing its job. The **same sign** would give $a^2 + 2a\\sqrt b + b$ and leave a surd behind." } },
    { worked: { tag: "example", title: "Rationalise $\\frac{5 + 2\\sqrt3}{3 - \\sqrt3}$ — a surd on top as well", src: "standard", 
      q: "Write $\\frac{5 + 2\\sqrt3}{3 - \\sqrt3}$ in the form $a + b\\sqrt3$ where $a$ and $b$ are rational.",
      steps: [
        { h: "Multiply top and bottom by the conjugate $3 + \\sqrt3$", m: "$\\dfrac{(5 + 2\\sqrt3)(3 + \\sqrt3)}{(3 - \\sqrt3)(3 + \\sqrt3)}$", mk: "M1" },
        { h: "Expand the numerator (four products)", m: "$15 + 5\\sqrt3 + 6\\sqrt3 + 2 \\times 3 = 21 + 11\\sqrt3$", mk: "A1", n: "$2\\sqrt3 \\times \\sqrt3 = 2 \\times 3 = 6$ — the term students drop." },
        { h: "Denominator", m: "$9 - 3 = 6$", mk: "A1" },
        { m: "$\\dfrac{21 + 11\\sqrt3}{6} = \\dfrac{7}{2} + \\dfrac{11}{6}\\sqrt3$", mk: "A1", n: "Both forms are accepted unless the question fixes $a$ and $b$ as integers — here it says rational." }
      ], result: "$\\dfrac72 + \\dfrac{11}{6}\\sqrt3$" } },

    { page: "Equations and exact answers" },
    { worked: { tag: "exam", title: "Solve $x\\sqrt2 - \\sqrt{18} = x$, answer as a surd in simplest form", src: "AS June 2020 · P1 Q3(i) · 3 marks",
      q: "Solve the equation $x\\sqrt2 - \\sqrt{18} = x$, writing the answer as a surd in simplest form. (Solutions relying on calculator technology are not acceptable.)",
      steps: [
        { h: "Simplify the surd and collect the $x$ terms", m: "$\\sqrt{18} = 3\\sqrt2$, so $x\\sqrt2 - x = 3\\sqrt2 \;\\Rightarrow\; x(\\sqrt2 - 1) = 3\\sqrt2$", mk: "M1", n: "Treat $\\sqrt2$ as a coefficient — it is just a number. Factorising the $x$ is the method mark." },
        { h: "Divide, then rationalise", m: "$x = \\dfrac{3\\sqrt2}{\\sqrt2 - 1} = \\dfrac{3\\sqrt2(\\sqrt2 + 1)}{(\\sqrt2 - 1)(\\sqrt2 + 1)} = \\dfrac{6 + 3\\sqrt2}{2 - 1}$", mk: "M1", n: "$3\\sqrt2 \\times \\sqrt2 = 3 \\times 2 = 6$." },
        { m: "$x = 6 + 3\\sqrt2$", mk: "A1", n: "\"Simplest form\" = rationalised, like surds collected, no brackets left." }
      ], result: "$x = 6 + 3\\sqrt2$" } },
    { worked: { tag: "exam", title: "$16a^2 = 2\\sqrt a$ — an equation mixing a power and a root", src: "AS June 2019 · P1 Q2(i) · 4 marks",
      q: "Find, using algebra, all real solutions to the equation $16a^2 = 2\\sqrt a$.",
      steps: [
        { h: "Write the root as a power and collect", m: "$16a^2 = 2a^{\\frac12} \;\\Rightarrow\; 16a^2 - 2a^{\\frac12} = 0 \;\\Rightarrow\; 2a^{\\frac12}\\left(8a^{\\frac32} - 1\\right) = 0$", mk: "M1 A1", n: "Do **not** divide both sides by $\\sqrt a$: that throws away the solution $a = 0$, and \"all real solutions\" is a hint that there is more than one." },
        { h: "Two factors, two solutions", m: "$a^{\\frac12} = 0 \;\\Rightarrow\; a = 0 \\qquad \\text{or} \\qquad a^{\\frac32} = \\dfrac18 \;\\Rightarrow\; a = \\left(\\dfrac18\\right)^{\\frac23} = \\dfrac14$", mk: "M1 A1", n: "$(\\frac18)^{2/3} = (\\sqrt[3]{1/8})^2 = (\\frac12)^2$. Alternative: square both sides first — $256a^4 = 4a$ — and factorise the quartic; squaring can create false roots, so check them." }
      ], result: "$a = 0$ or $a = \\dfrac14$" } },
    { worked: { tag: "exam", title: "A surd equation with the variable under the root", src: "AS June 2023 · P1 Q2 · 4 marks",
      q: "Using the substitution $u = \\sqrt x$ or otherwise, solve $6x - 7\\sqrt x - 20 = 0$.",
      steps: [
        { h: "Substitute $u = \\sqrt x$, so $x = u^2$", m: "$6u^2 - 7u - 20 = 0$", mk: "M1", n: "A quadratic in disguise (2.3). The substitution turns the surd into an ordinary variable." },
        { h: "Factorise", m: "$(3u + 4)(2u - 5) = 0 \;\\Rightarrow\; u = -\\dfrac43 \\text{ or } u = \\dfrac52$", mk: "M1 A1" },
        { h: "Reject and convert back", m: "$u = \\sqrt x \\ge 0$, so $u = -\\frac43$ is impossible. $\\sqrt x = \\dfrac52 \;\\Rightarrow\; x = \\dfrac{25}{4}$", mk: "A1", n: "The final A1 needs the rejection stated **and** the square. Giving $x = \\frac52$ is the classic loss." }
      ], result: "$x = \\dfrac{25}{4}$" } },
    { h: "Surds elsewhere in the paper" },
    { ul: [
      "**Quadratic formula**: $x = \\frac{4 \\pm \\sqrt{20}}{2} = 2 \\pm \\sqrt5$ — simplify $\\sqrt{20} = 2\\sqrt5$ *before* dividing.",
      "**Circles / distances**: radius $\\sqrt{(-5)^2 + 2^2 - 1} = \\sqrt{28} = 2\\sqrt7$ (AS 2025 Q4 asks for the *exact* radius).",
      "**Trig exact values**: $\\sin 60° = \\frac{\\sqrt3}{2}$, $\\tan 30° = \\frac{1}{\\sqrt3} = \\frac{\\sqrt3}{3}$.",
      "**Geometric sequences**: a ratio of $\\sqrt2$ or $\\frac{1}{\\sqrt2}$; sums to infinity that need rationalising."
    ] },

    { page: "Exam toolkit" },
    { h: "Where the marks go" },
    { ul: [
      "**$\\sqrt{a + b} \\neq \\sqrt a + \\sqrt b$.** The commonest surd error in the country.",
      "**Not simplifying**: $\\frac{6}{\\sqrt3}$ left as it is; $\\sqrt{18}$ left as it is; $2 + \\sqrt{20}$ not written $2 + 2\\sqrt5$.",
      "**Conjugate with the wrong sign**: multiplying $3 - \\sqrt2$ by $3 - \\sqrt2$.",
      "**Dropping $(\\sqrt b)^2 = b$** in an expansion — it is the term with no root, so it looks unimportant.",
      "**Dividing by the variable** and losing $x = 0$.",
      "**Forgetting to square back** after a $u = \\sqrt x$ substitution, or forgetting $\\sqrt x \\ge 0$."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Exact surd display", "In MathI/MathO the calculator returns $\\sqrt{72}$ as $6\\sqrt2$ and $\\frac{1}{3 - \\sqrt2}$ as $\\frac{3 + \\sqrt2}{7}$. Use it to **check** a hand answer; the question will say the working must be shown."],
      ["Checking a surd equation", "Store your answer: $6 + 3\\sqrt2$ → STO → $x$. Then type $x\\sqrt2 - \\sqrt{18} - x$ and EXE: it should return 0."]
    ] },
    { callout: { t: "mnemonic", h: "\"Largest square out, conjugate below\"", body: "Two moves cover the topic: pull the largest square factor out of every root; multiply by the conjugate under every fraction." } }
  ],
  flashcards: [
    ["Three surd rules?", "$(\\sqrt x)^2 = x$; $\\sqrt{xy} = \\sqrt x\\sqrt y$; $(\\sqrt x + \\sqrt y)(\\sqrt x - \\sqrt y) = x - y$."],
    ["Simplify $\\sqrt{72}$.", "$\\sqrt{36 \\times 2} = 6\\sqrt2$."],
    ["Simplify $\\sqrt{50} - \\sqrt{18}$.", "$5\\sqrt2 - 3\\sqrt2 = 2\\sqrt2$."],
    ["Rationalise $\\frac{6}{\\sqrt3}$.", "$\\frac{6\\sqrt3}{3} = 2\\sqrt3$."],
    ["Rationalise $\\frac{1}{3 + \\sqrt2}$.", "$\\frac{3 - \\sqrt2}{7}$."],
    ["Expand $(2 + \\sqrt3)^2$.", "$7 + 4\\sqrt3$."],
    ["Solve $x\\sqrt2 - \\sqrt{18} = x$.", "$x(\\sqrt2 - 1) = 3\\sqrt2 \\Rightarrow x = 6 + 3\\sqrt2$."],
    ["Solve $6x - 7\\sqrt x - 20 = 0$.", "$u = \\sqrt x$: $(3u + 4)(2u - 5) = 0$; $u = \\frac52$ only; $x = \\frac{25}{4}$."],
    ["Why does multiplying by the conjugate remove the surd?", "$(a + \\sqrt b)(a - \\sqrt b) = a^2 - b$: the cross terms cancel."],
    ["Is $\\sqrt{9 + 16} = \\sqrt9 + \\sqrt{16}$?", "No: $5 \\neq 7$. There is no rule for the root of a sum."],
    ["$\\frac{4}{\\sqrt5 - \\sqrt3}$ simplified?", "$\\frac{4(\\sqrt5 + \\sqrt3)}{2} = 2\\sqrt5 + 2\\sqrt3$."]
  ],
  quiz: [
    { q: "$\\sqrt{48} =$", opts: ["$4\\sqrt3$", "$2\\sqrt{12}$", "$16\\sqrt3$", "$3\\sqrt4$"], ans: 0, why: "$48 = 16 \\times 3$." },
    { q: "$\\frac{10}{\\sqrt5} =$", opts: ["$2\\sqrt5$", "$5\\sqrt2$", "$\\sqrt5$", "$\\tfrac{\\sqrt5}{2}$"], ans: 0, why: "$\\frac{10\\sqrt5}{5}$." },
    { q: "$(3 - \\sqrt2)(3 + \\sqrt2) =$", opts: ["7", "11", "$9 - 2\\sqrt2$", "$9 + 6\\sqrt2 - 2$"], ans: 0, why: "$9 - 2$." },
    { q: "$(1 + \\sqrt5)^2 =$", opts: ["6", "$6 + 2\\sqrt5$", "$1 + 5$", "$6 + \\sqrt5$"], ans: 1, why: "$1 + 2\\sqrt5 + 5$." },
    { q: "To rationalise $\\frac{1}{2 - \\sqrt3}$ multiply top and bottom by", opts: ["$2 - \\sqrt3$", "$2 + \\sqrt3$", "$\\sqrt3$", "$-\\sqrt3$"], ans: 1, why: "The conjugate." },
    { q: "$\\sqrt{12} \\times \\sqrt{27} =$", opts: ["$\\sqrt{39}$", "18", "$6\\sqrt{3}$", "$9\\sqrt2$"], ans: 1, why: "$\\sqrt{324} = 18$, or $2\\sqrt3 \\times 3\\sqrt3 = 6 \\times 3$." },
    { q: "The solutions of $x^2 - 4x - 1 = 0$ in simplest surd form:", opts: ["$2 \\pm \\sqrt{20}$", "$2 \\pm \\sqrt5$", "$4 \\pm 2\\sqrt5$", "$2 \\pm 2\\sqrt5$"], ans: 1, why: "$\\frac{4 \\pm \\sqrt{20}}{2} = 2 \\pm \\sqrt5$." }
  ]
};

/* =====================================================================
   2.3  Quadratic functions and the discriminant
   ===================================================================== */
C["maths:2.3"] = {
  notes: [
    { h: "Quadratics — the whole topic on one page" },
    "The quadratic is the most-examined function on the paper, because it hides inside everything else: circles, trig equations, logs, kinematics, the discriminant test for tangency.",
    { ul: [
      "**Solve** by factorising, the formula, or completing the square — and recognise a quadratic *in disguise* ($x^4$, $\\sqrt x$, $2^x$, $\\sin x$).",
      "**Complete the square** to read off the vertex, the range, and the transformation from $y = x^2$.",
      "**Discriminant** $b^2 - 4ac$: how many real roots; \"two distinct points\" / \"tangent\" / \"no real solutions\" questions all reduce to it.",
      "**Sketch**: roots, $y$-intercept, vertex, shape.",
      "**Model**: profit, trajectories, tunnels — completed-square form with a maximum, and limitations."
    ] },
    { fig: { x: [-1.5, 6.5], y: [-5, 8], axes: { xt: [1, 2, 3, 4, 5, 6], yt: [-4, -2, 2, 4, 6, 8] }, items: [
      { fn: "(x-1)*(x-5)", c: "accent", label: "y = (x − 1)(x − 5)", at: 5.6, pos: "e" },
      { pt: [1, 0], label: "(1, 0)", pos: "nw" }, { pt: [5, 0], label: "(5, 0)", pos: "ne" },
      { pt: [0, 5], label: "(0, 5)", pos: "e" }, { pt: [3, -4], label: "vertex (3, −4)", pos: "s" },
      { vline: 3, label: "x = 3", c: "muted" }
    ], cap: "Everything a sketch needs: roots from the factorised form, $y$-intercept from $c$, vertex from the completed square $(x - 3)^2 - 4$, and the line of symmetry midway between the roots." } },

    { page: "Solving and the three forms" },
    { h: "Three ways to solve $ax^2 + bx + c = 0$" },
    { kv: [
      ["Factorise", "When it factorises. $6u^2 - 7u - 20 = (3u + 4)(2u - 5)$: find two numbers with product $ac = -120$ and sum $b = -7$, i.e. $-15$ and $8$, then split the middle term. Each bracket $= 0$."],
      ["Formula", "$$x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$ Always works; simplify the surd ($\\sqrt{20} = 2\\sqrt5$) before dividing. In the booklet? **No** — memorise it."],
      ["Complete the square", "$x^2 - 4x - 1 = (x - 2)^2 - 5 = 0 \\Rightarrow x = 2 \\pm \\sqrt5$. Best when the question also wants the vertex."]
    ] },
    { h: "Completing the square" },
    { callout: { t: "memorise", h: "The completed-square form", body: [
      "$$ax^2 + bx + c = a\\left(x + \\dfrac{b}{2a}\\right)^2 + \\left(c - \\dfrac{b^2}{4a}\\right)$$",
      "In practice: **halve** the $x$ coefficient into the bracket, **subtract its square**. With $a \\neq 1$, take $a$ out of the $x$ terms first.",
      "$$2x^2 + 4x + 9 = 2(x^2 + 2x) + 9 = 2\\left[(x + 1)^2 - 1\\right] + 9 = 2(x + 1)^2 + 7$$",
      "The form $a(x + b)^2 + c$ tells you the vertex $(-b, c)$, the minimum/maximum value $c$, and the line of symmetry $x = -b$ — instantly."
    ] } },
    { worked: { tag: "exam", title: "Complete the square, sketch, describe the transformation, find a range", src: "A-level June 2019 · P1 Q5 · 10 marks",
      q: "$f(x) = 2x^2 + 4x + 9$, $x \\in \\mathbb{R}$. **(a)** Write $f(x)$ in the form $a(x + b)^2 + c$ where $a$, $b$, $c$ are integers. **(b)** Sketch $y = f(x)$, showing any intersections with the axes and the coordinates of the turning point. **(c)(i)** Describe fully the transformation that maps $y = f(x)$ onto $y = g(x)$ where $g(x) = 2(x - 2)^2 + 4x - 3$. **(ii)** Find the range of the function $h(x) = \\frac{21}{2x^2 + 4x + 9}$, $x \\in \\mathbb{R}$.",
      steps: [
        { h: "(a) Take the 2 out of the $x$ terms, halve, subtract the square", m: "$2(x^2 + 2x) + 9 = 2\\left[(x + 1)^2 - 1\\right] + 9 = 2(x + 1)^2 + 7$", mk: "M1 A1 A1", n: "$a = 2, b = 1, c = 7$. M1 for $2(x + 1)^2 + \\ldots$; the $-1$ inside the bracket is multiplied by 2 — the usual slip is $+8$." },
        { h: "(b) Read the sketch off the form", m: "Vertex $(-1, 7)$, a minimum ($a > 0$). $y$-intercept $(0, 9)$. Minimum is above the axis, so **no** $x$-intercepts.", mk: "B1 B1 B1", fig: { x: [-4, 2.5], y: [-1, 20], axes: { xt: [-3, -2, -1, 1, 2], yt: [5, 10, 15, 20] }, items: [ { fn: "2*x*x+4*x+9", label: "y = f(x)", at: 1.6, pos: "w" }, { pt: [-1, 7], label: "(−1, 7)", pos: "s" }, { pt: [0, 9], label: "(0, 9)", pos: "e" } ], cap: "U-shape, vertex (−1, 7), crosses the y-axis at 9, never meets the x-axis." }, n: "Marks: shape and position, turning point labelled, $y$-intercept labelled. State \"does not cross the $x$-axis\" if the sketch might look ambiguous." },
        { h: "(c)(i) Put $g$ into the same form", m: "$g(x) = 2(x^2 - 4x + 4) + 4x - 3 = 2x^2 - 4x + 5 = 2(x - 1)^2 + 3$", mk: "M1 A1", n: "Expand first — the given form is a trap; $2(x - 2)^2 + 4x - 3$ is *not* already completed." },
        { m: "Vertex moves from $(-1, 7)$ to $(1, 3)$: a **translation** by $\\begin{pmatrix} 2 \\\\ -4 \\end{pmatrix}$.", mk: "A1", n: "\"Describe fully\" = the word *translation* **and** the vector. \"Shift\" or \"move\" is not accepted." },
        { h: "(ii) The denominator is $f(x)$, whose minimum you know", m: "$h(x) = \\dfrac{21}{2(x + 1)^2 + 7}$. The denominator is at least $7$ (at $x = -1$) and grows without bound.", mk: "M1", n: "Largest $h$ when the denominator is smallest: $\\frac{21}{7} = 3$. As the denominator $\\to \\infty$, $h \\to 0$ but never reaches it." },
        { m: "Range: $0 < h(x) \\le 3$", mk: "A1", n: "Both ends matter: $\\le 3$ (attained) and $> 0$ (never attained)." }
      ], result: "(a) $2(x + 1)^2 + 7$ (c)(i) translation $\\begin{pmatrix} 2 \\\\ -4 \\end{pmatrix}$ (ii) $0 < h(x) \\le 3$" } },
    { worked: { tag: "exam", title: "Completed square → intercept and minimum point", src: "A-level Oct 2021 · P1 Q2 · 4 marks",
      q: "$f(x) = x^2 - 4x + 5$. **(a)** Express $f(x)$ in the form $(x + a)^2 + b$ where $a$, $b$ are integers. The curve $y = f(x)$ meets the $y$-axis at $P$ and has a minimum turning point at $Q$. **(b)** Write down the coordinates of $P$ and of $Q$.",
      steps: [
        { m: "$(x - 2)^2 - 4 + 5 = (x - 2)^2 + 1$, so $a = -2$, $b = 1$", mk: "M1 A1" },
        { m: "$P = (0, 5)$ (put $x = 0$); $\; Q = (2, 1)$ (the bracket is zero at $x = 2$, leaving $1$)", mk: "B1 B1", n: "Sign of $a$: the bracket $(x - 2)$ means $a = -2$, and the vertex is at $x = +2$. Students give $Q = (-2, 1)$." }
      ], result: "$(x - 2)^2 + 1$; $P(0, 5)$, $Q(2, 1)$" } },
    { h: "Quadratics in disguise" },
    "Spec 2.3 says the unknown may be a *function* of $x$: powers, roots, trig, exponentials, logs. Substitute a letter for the repeated piece, solve the quadratic, then undo the substitution — **and reject impossible values**.",
    { table: { head: ["Equation", "Substitute", "Quadratic", "Then"], rows: [
      ["$b^4 + 7b^2 - 18 = 0$", "$u = b^2$", "$(u + 9)(u - 2) = 0$", "$b^2 = 2 \\Rightarrow b = \\pm\\sqrt2$; $b^2 = -9$ impossible"],
      ["$6x - 7\\sqrt x - 20 = 0$", "$u = \\sqrt x$", "$(3u + 4)(2u - 5) = 0$", "$u \\ge 0$: $\\sqrt x = \\frac52 \\Rightarrow x = \\frac{25}{4}$"],
      ["$3 \\times 2^x = 15 - 2^{x+1}$", "$u = 2^x$", "$3u = 15 - 2u \\Rightarrow u = 3$", "$2^x = 3 \\Rightarrow x = \\log_2 3$"],
      ["$2\\sin^2\\theta + \\sin\\theta - 1 = 0$", "$u = \\sin\\theta$", "$(2u - 1)(u + 1) = 0$", "$\\sin\\theta = \\frac12$ or $-1$, then the CAST diagram"],
      ["$3(y - 2)^6 - 17(y - 2)^4 - 6(y - 2)^2 = 0$", "$x = (y - 2)^2$", "$3x^3 - 17x^2 - 6x = 0$", "$x = 0, 6, -\\frac13$; only $x \\ge 0$ gives $y$"]
    ] } },
    { worked: { tag: "exam", title: "Solve a cubic, then a disguised version of it", src: "AS Nov 2021 · P1 Q6 · 6 marks",
      q: "**(a)** Using algebra, find all solutions of $3x^3 - 17x^2 - 6x = 0$. **(b)** Hence find all real solutions of $3(y - 2)^6 - 17(y - 2)^4 - 6(y - 2)^2 = 0$.",
      steps: [
        { h: "(a) Common factor first, then the quadratic", m: "$x(3x^2 - 17x - 6) = 0 \;\\Rightarrow\; x(3x + 1)(x - 6) = 0$", mk: "M1 A1", n: "Product $3 \\times (-6) = -18$, sum $-17$: numbers $-18$ and $1$. Never divide by $x$ — that loses $x = 0$." },
        { m: "$x = 0, \\quad x = -\\dfrac13, \\quad x = 6$", mk: "A1" },
        { h: "(b) The new equation is (a) with $x = (y - 2)^2$", m: "$(y - 2)^2 = 0 \\Rightarrow y = 2; \\qquad (y - 2)^2 = 6 \\Rightarrow y = 2 \\pm \\sqrt6; \\qquad (y - 2)^2 = -\\dfrac13$ has no real solutions", mk: "M1 A1 A1", n: "\"Hence\" means reuse (a). The A marks need the $\\pm$ **and** the rejection of the negative value. Five solutions in total is wrong; three is right." }
      ], result: "(a) $x = -\\frac13, 0, 6$ (b) $y = 2$, $y = 2 + \\sqrt6$, $y = 2 - \\sqrt6$" } },

    { page: "The discriminant" },
    { callout: { t: "memorise", h: "$b^2 - 4ac$ and the number of real roots", body: [
      "$$b^2 - 4ac > 0 \;\\text{two distinct real roots} \\qquad b^2 - 4ac = 0 \;\\text{one repeated root} \\qquad b^2 - 4ac < 0 \;\\text{no real roots}$$",
      "Why: the formula has $\\sqrt{b^2 - 4ac}$ in it. Positive → two values ($\\pm$), zero → the $\\pm$ collapses, negative → no real square root.",
      "\"Real roots\" (allowing repeated) is $b^2 - 4ac \\ge 0$. Read the wording: *distinct* excludes the equals sign."
    ] } },
    { fig: { x: [-4, 4], y: [-3, 5], axes: { xt: [-3, -2, -1, 1, 2, 3], yt: [-2, 2, 4] }, items: [
      { fn: "x*x-3", c: "accent", label: "b² − 4ac > 0", at: 2.4, pos: "e" },
      { fn: "(x+1.5)^2", c: "accent3", label: "= 0", at: -3.4, pos: "w" },
      { fn: "0.6*x*x+2", c: "danger", label: "< 0", at: 1.9, pos: "e" },
      { pt: [-1.5, 0], c: "accent3" }, { pt: [Math.sqrt(3), 0], c: "accent" }, { pt: [-Math.sqrt(3), 0], c: "accent" }
    ], cap: "Two crossings, one touch, or none — the discriminant is the sign of the vertex's height (for $a > 0$)." } },
    { h: "The three question shapes" },
    { ol: [
      "**\"Show that $f(x) > 0$ for all real $x$\"** — complete the square (positive square plus a positive constant) *or* show $b^2 - 4ac < 0$ with $a > 0$.",
      "**\"Line meets curve at two distinct points / is a tangent / does not meet\"** — substitute the line into the curve, collect into $Ax^2 + Bx + C = 0$, apply $>0$, $=0$ or $<0$ to $B^2 - 4AC$. The unknown ($k$) is inside $B$ or $C$, so you get an inequality in $k$.",
      "**\"Has equal roots, show that…\"** — set $b^2 - 4ac = 0$ and rearrange to the printed statement."
    ] },
    { worked: { tag: "exam", title: "Show a quadratic is positive; judge a claim", src: "AS June 2018 · P1 Q2 · 5 marks",
      q: "**(i)** Show that $x^2 - 8x + 17 > 0$ for all real values of $x$. **(ii)** \"If I add 3 to a number and square the sum, the result is greater than the square of the original number.\" State, giving a reason, if the statement is always true, sometimes true or never true.",
      steps: [
        { h: "(i) Complete the square", m: "$x^2 - 8x + 17 = (x - 4)^2 - 16 + 17 = (x - 4)^2 + 1$", mk: "M1 A1" },
        { m: "$(x - 4)^2 \\ge 0$ for all real $x$, so $(x - 4)^2 + 1 \\ge 1 > 0$.", mk: "A1", n: "The conclusion sentence is the last mark. \"A square is never negative, plus 1 makes it positive\" — write it." },
        { h: "(ii) Translate and test", m: "$(x + 3)^2 > x^2 \\iff 6x + 9 > 0 \\iff x > -\\dfrac32$. True for $x = 0$ ($9 > 0$), false for $x = -5$ ($4 > 25$ is false). **Sometimes true.**", mk: "B1 B1", n: "B1 for \"sometimes\", B1 for a reason with a counter-example (or the inequality $x > -1.5$)." }
      ], result: "(i) $(x - 4)^2 + 1 \\ge 1$ (ii) sometimes true, e.g. false when $x = -5$" } },
    { worked: { tag: "exam", title: "Line meets curve at two distinct points — range of $k$", src: "A-level Specimen · P2 Q5 · 5 marks",
      q: "The line $l$ has equation $3x - 2y = k$ where $k$ is a real constant. Given that $l$ intersects the curve $y = 2x^2 - 5$ at two distinct points, find the range of possible values for $k$.",
      steps: [
        { h: "Substitute the curve into the line", m: "$3x - 2(2x^2 - 5) = k \;\\Rightarrow\; 4x^2 - 3x + (k - 10) = 0$", mk: "M1 A1", n: "Collect into $Ax^2 + Bx + C = 0$ **with the $k$ inside $C$** before you touch the discriminant." },
        { h: "Two distinct points ⇒ discriminant $> 0$", m: "$(-3)^2 - 4(4)(k - 10) > 0 \;\\Rightarrow\; 9 - 16k + 160 > 0$", mk: "M1", n: "$B = -3$, $A = 4$, $C = k - 10$. Brackets round $C$ — the sign of $-4AC$ depends on it." },
        { m: "$169 > 16k \;\\Rightarrow\; k < \\dfrac{169}{16}$", mk: "A1 A1", n: "Strict inequality (distinct). $k = \\frac{169}{16}$ would be the tangent." }
      ], result: "$k < \\dfrac{169}{16}$" } },
    { worked: { tag: "exam", title: "Equal roots — show a relation between two constants", src: "AS June 2025 · P1 Q9 · 3 marks",
      q: "An equation $x^2 - 3px + 5q + 4 = 0$, where $p$ and $q$ are constants, has equal roots. Show that $q = \\frac{1}{20}(3p + 4)(3p - 4)$.",
      steps: [
        { h: "Equal roots ⇒ $b^2 - 4ac = 0$", m: "$(-3p)^2 - 4(1)(5q + 4) = 0 \;\\Rightarrow\; 9p^2 - 20q - 16 = 0$", mk: "M1 A1", n: "$c$ is the **whole** constant $5q + 4$. Squaring $-3p$ gives $9p^2$, not $-9p^2$." },
        { m: "$20q = 9p^2 - 16 = (3p + 4)(3p - 4) \;\\Rightarrow\; q = \\dfrac{1}{20}(3p + 4)(3p - 4)$", mk: "A1*", n: "Difference of two squares gives the printed factorised form. Show the factorising — it is what the * mark is watching for." }
      ], result: "shown" } },
    { worked: { tag: "exam", title: "Tangent to a curve via the discriminant", src: "AS June 2019 · P1 Q7(b)(c) · 5 marks",
      q: "The curve $C$ has equation $y = \\frac{k^2}{x} + 1$, $x \\neq 0$, and the line $l$ has equation $y = -2x + 5$. **(b)** Show that the $x$-coordinate of any point of intersection of $l$ with $C$ satisfies $2x^2 - 4x + k^2 = 0$. **(c)** Hence find the exact values of $k$ for which $l$ is a tangent to $C$.",
      steps: [
        { h: "(b) Equate and clear the fraction", m: "$\\dfrac{k^2}{x} + 1 = -2x + 5 \;\\Rightarrow\; k^2 + x = -2x^2 + 5x \;\\Rightarrow\; 2x^2 - 4x + k^2 = 0$", mk: "M1 A1*", n: "Multiply every term by $x$ (allowed since $x \\neq 0$)." },
        { h: "(c) Tangent ⇒ one repeated root ⇒ $b^2 - 4ac = 0$", m: "$16 - 8k^2 = 0 \;\\Rightarrow\; k^2 = 2 \;\\Rightarrow\; k = \\pm\\sqrt2$", mk: "M1 A1 A1", n: "\"Exact values\" plural: both signs. \"Hence\" = use the quadratic from (b)." }
      ], result: "$k = \\pm\\sqrt2$" } },

    { page: "Quadratic models" },
    "Edexcel's favourite modelling questions are quadratics in completed-square form: a profit $P = 100 - 6.25(x - 9)^2$, a tin mine $T = 1200 - 3(n - 20)^2$, a ball $H = a - b(x - 9)^2$. The marks are for **reading the form**, **fitting the constants** from given points, **interpreting**, and **stating limitations**.",
    { callout: { t: "memorise", h: "Reading $y = a - b(x - h)^2$, $b > 0$", body: [
      "Maximum value $a$, reached at $x = h$ (the bracket is zero there).",
      "Symmetric about $x = h$: the two roots are $h \\pm \\sqrt{a/b}$.",
      "To fit the model: substitute each known point to get one equation per point; the vertex gives $h$ (and $a$) directly."
    ] } },
    { worked: { tag: "exam", title: "Fit a trajectory model from the vertex and two points", src: "A-level June 2024 · P2 Q9 · 7 marks",
      q: "A ball is thrown from $A(0, 2)$ and caught at $B(20, 0.8)$; $H$ metres is its height and $x$ metres its horizontal distance. The ball reaches its maximum height when $x = 9$. A quadratic function linking $H$ with $x$ models the path. **(a)** Find $H$ in terms of $x$. **(b)** Give one limitation of the model. Chandra is standing directly under the path of the ball, $16$ m horizontally from $O$, and can catch the ball if it is less than $2.5$ m above the ground. **(c)** Determine whether Chandra can catch the ball.",
      steps: [
        { h: "(a) Symmetry about $x = 9$ ⇒ completed-square form", m: "$H = a - b(x - 9)^2$", mk: "M1", n: "The maximum at $x = 9$ is the vertex, so the bracket is $(x - 9)$. Starting from $H = px^2 + qx + r$ works too but needs three equations." },
        { h: "Substitute $A(0, 2)$ and $B(20, 0.8)$", m: "$2 = a - 81b \\qquad 0.8 = a - 121b$", mk: "M1 A1" },
        { h: "Subtract", m: "$1.2 = 40b \;\\Rightarrow\; b = 0.03; \\qquad a = 2 + 81(0.03) = 4.43$", mk: "M1 A1", n: "$H = 4.43 - 0.03(x - 9)^2$." },
        { h: "(b) Limitation", m: "Any one of: air resistance ignored; the ball is treated as a particle; wind/spin ignored; the path may not be exactly parabolic.", mk: "B1", n: "A limitation must be about the **model**, in context — not \"the answer is rounded\"." },
        { h: "(c) Height at $x = 16$", m: "$H = 4.43 - 0.03(16 - 9)^2 = 4.43 - 0.03 \\times 49 = 4.43 - 1.47 = 2.96$ m\n$2.96 > 2.5$, so Chandra **cannot** catch the ball.", mk: "M1 A1", n: "Substitute into *your* model, compare with 2.5, and write the conclusion in words." }
      ], result: "(a) $H = 4.43 - 0.03(x - 9)^2$ (c) $H(16) = 2.96 > 2.5$: cannot catch it" } },
    { worked: { tag: "exam", title: "Profit model in completed-square form", src: "AS June 2018 · P1 Q6 · 7 marks",
      q: "A company's annual profit (thousands of pounds) is modelled by $P = 100 - 6.25(x - 9)^2$, where $x$ is the selling price of a toy in pounds. **(a)** Explain why £15 is not a sensible selling price. **(b)** Given that the profit was more than £80 000, find the least possible selling price. **(c)** State the maximum possible annual profit and the selling price that gives it.",
      steps: [
        { h: "(a) Evaluate at $x = 15$", m: "$P = 100 - 6.25 \\times 36 = 100 - 225 = -125$: a **loss** of £125 000, so not sensible.", mk: "M1 A1", n: "Show the number. \"Because it's too expensive\" scores nothing." },
        { h: "(b) Set up the inequality", m: "$100 - 6.25(x - 9)^2 > 80 \;\\Rightarrow\; (x - 9)^2 < 3.2 \;\\Rightarrow\; -\\sqrt{3.2} < x - 9 < \\sqrt{3.2}$", mk: "M1 A1", n: "Solving a quadratic inequality by isolating the square. Both bounds." },
        { m: "$x > 9 - \\sqrt{3.2} = 7.21\\ldots$, so the least possible price is **£7.22**", mk: "A1", n: "Least price → the lower bound; round *up* so the profit is still above £80 000." },
        { h: "(c) Read the vertex", m: "Maximum profit £100 000, at $x = 9$: a selling price of **£9**", mk: "B1 B1" }
      ], result: "(a) $P < 0$ at £15 (b) £7.22 (c) £100 000 at £9" } },
    { worked: { tag: "exam", title: "Tunnel modelled by a parabola — does the coach fit?", src: "A-level Specimen · P1 Q6 · 6 marks",
      q: "A road tunnel entrance is modelled by a quadratic curve through $A(-3, 0)$, $B(3, 0)$ with maximum height $5$ m at $C(0, 5)$ (units metres; the ground is $y = 0$). **(a)** Find an equation for the curve. **(b)** A coach is $4.1$ m high and $2.4$ m wide. Determine whether it can enter the tunnel. **(c)** Suggest a reason why the model may not be suitable.",
      steps: [
        { h: "(a) Roots at $\\pm3$, vertex at $(0, 5)$", m: "$y = k(x + 3)(x - 3) = k(x^2 - 9)$; at $(0, 5)$: $5 = -9k \\Rightarrow k = -\\dfrac59$\n$y = 5 - \\dfrac59 x^2$", mk: "M1 M1 A1", fig: { x: [-4, 4], y: [-0.5, 6], aspect: "equal", axes: { xt: [-3, -2, -1, 1, 2, 3], yt: [1, 2, 3, 4, 5] }, items: [ { shade: { fn: "5-5/9*x*x", from: -3, to: 3 }, c: "accent", alpha: 0.08 }, { fn: "5-5/9*x*x", from: -3, to: 3, label: "y = 5 − 5x²/9", at: 2.2, pos: "e" }, { poly: [[-1.2, 0], [1.2, 0], [1.2, 4.1], [-1.2, 4.1]], c: "danger", fill: "danger", alpha: 0.12 }, { text: [0, 2], t: "coach 2.4 × 4.1", c: "danger", size: 11 }, { pt: [1.2, 4.2], label: "(1.2, 4.2)", pos: "ne", c: "accent3" } ], cap: "The coach's top corners are at $x = \\pm1.2$; the tunnel is $4.2$ m high there." }, n: "Factorised form uses both roots at once; the vertex fixes $k$." },
        { h: "(b) Height of the tunnel at the coach's edge, $x = 1.2$", m: "$y = 5 - \\dfrac59(1.44) = 5 - 0.8 = 4.2 > 4.1$, so the coach **can** enter (with 10 cm to spare).", mk: "M1 A1", n: "Test at the **half-width**, not at the centre. The centre clearance (5 m) tells you nothing about the corners." },
        { h: "(c)", m: "The real tunnel may not be parabolic; the model ignores road camber / the coach not being central; 0.1 m is a small margin for measurement error.", mk: "B1" }
      ], result: "(a) $y = 5 - \\frac59 x^2$ (b) yes, $4.2 > 4.1$" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Write in the form $a(x + b)^2 + c$**", "completed square with the constants identified; check by expanding"],
      ["**Sketch**", "shape, intercepts with both axes (coordinates), turning point (coordinates); \"does not cross\" stated if so"],
      ["**Find the range of values of $k$ for which … two distinct points / tangent / no real roots**", "substitute, collect into $Ax^2 + Bx + C = 0$, discriminant $>0 / =0 / <0$, solve the inequality in $k$"],
      ["**Show that $f(x) > 0$ for all $x$**", "completed square with a written conclusion, or $b^2 - 4ac < 0$ and $a > 0$"],
      ["**Find all real solutions**", "every root, impossible ones rejected in writing, no root lost by dividing"],
      ["**Interpret / explain in context**", "a number from the model plus a sentence about what it means for the profit / ball / tunnel"],
      ["**State a limitation**", "an assumption of the model that may be false in reality, in context"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**$2(x + 1)^2 - 1 + 9$** — forgetting to multiply the subtracted square by $a$.",
      "**Vertex sign**: $(x - 2)^2 + 1$ has its vertex at $x = +2$.",
      "**Discriminant with $C$ unbracketed**: $-4 \\times 4 \\times k - 10$ instead of $-16(k - 10)$.",
      "**Wrong inequality direction** for \"distinct\" ($>$), \"real\" ($\\ge$), \"no\" ($<$).",
      "**Dividing by $x$** and losing the root $x = 0$.",
      "**Forgetting $\\pm$** when square-rooting a bracket, or keeping a negative $\\sqrt x$ / $2^x$ / $b^2$.",
      "**Testing the centre, not the edge** in tunnel/bridge questions.",
      "**A limitation that is not about the model** (\"I rounded\") or not in context."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Solving a quadratic", "**HOME → Equation → Polynomial → degree 2**, enter $a, b, c$, EXE for each root. It also reports the minimum/maximum point. Use it to *check* — most of these questions say \"using algebra\" and the calculator alone scores 0."],
      ["Discriminant check", "Type $b^2 - 4ac$ with your values directly; the sign is the answer. With an unknown $k$ this is no help — the algebra is the question."],
      ["Sketch check", "**Table** app with $f(x) = $ your quadratic, step 1 around the vertex: the $y$ values should be symmetric either side of $x = h$."]
    ] },
    { h: "Memory aids" },
    { callout: { t: "mnemonic", h: "\"Halve it, square it, take it away\"", body: "Completing the square in one breath: halve the $x$ coefficient into the bracket, square that number, subtract it outside. $x^2 - 8x$: halve $\\to -4$, square $\\to 16$, so $(x - 4)^2 - 16$." } },
    { callout: { t: "mnemonic", h: "\"Bigger than zero — two; zero — one; less — none\"", body: "The discriminant rule as a chant. And *distinct* means strictly bigger." } },
    { callout: { t: "mnemonic", h: "The formula: \"minus $b$, plus or minus root, $b$ squared minus four $a$ $c$, all over two $a$\"", body: "Not in the booklet. Say it, write it, every time — and remember the whole numerator is divided by $2a$." } }
  ],
  flashcards: [
    ["Quadratic formula?", "$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ (not in the booklet)."],
    ["Discriminant conditions for two distinct / repeated / no real roots?", "$b^2 - 4ac > 0$ / $= 0$ / $< 0$."],
    ["Complete the square: $2x^2 + 4x + 9$.", "$2(x + 1)^2 + 7$."],
    ["Complete the square: $-3x^2 + 12x + 8$.", "$-3(x - 2)^2 + 20$; maximum 20 at $x = 2$."],
    ["Vertex and line of symmetry of $y = a(x + b)^2 + c$?", "Vertex $(-b, c)$; symmetry $x = -b$; min if $a > 0$, max if $a < 0$."],
    ["How do you show a line is a tangent to a curve algebraically?", "Substitute, collect into a quadratic, show $b^2 - 4ac = 0$."],
    ["Solve $b^4 + 7b^2 - 18 = 0$.", "$u = b^2$: $(u + 9)(u - 2) = 0$; $b^2 = 2 \\Rightarrow b = \\pm\\sqrt2$ (reject $b^2 = -9$)."],
    ["Solve $3 \\times 2^x = 15 - 2^{x+1}$ exactly.", "$u = 2^x$: $3u = 15 - 2u \\Rightarrow u = 3 \\Rightarrow x = \\log_2 3$."],
    ["$3x - 2y = k$ meets $y = 2x^2 - 5$ twice: range of $k$?", "$4x^2 - 3x + k - 10 = 0$, $9 - 16(k - 10) > 0 \\Rightarrow k < \\frac{169}{16}$."],
    ["Range of $h(x) = \\frac{21}{2x^2 + 4x + 9}$?", "Denominator $= 2(x+1)^2 + 7 \\ge 7$, so $0 < h(x) \\le 3$."],
    ["Fit $H = a - b(x - 9)^2$ through $(0, 2)$ and $(20, 0.8)$.", "$2 = a - 81b$, $0.8 = a - 121b \\Rightarrow b = 0.03$, $a = 4.43$."],
    ["Show $x^2 - 8x + 17 > 0$ for all $x$.", "$(x - 4)^2 + 1 \\ge 1 > 0$ since a square is never negative."],
    ["What must a stated \"limitation\" be?", "An assumption of the model that may fail in reality, phrased in the context of the question."],
    ["Tunnel $y = 5 - \\frac59 x^2$; coach 2.4 wide, 4.1 high — where do you test?", "At $x = \\pm1.2$ (the half-width): $y = 4.2 > 4.1$, it fits."]
  ],
  quiz: [
    { q: "$x^2 - 6x + 2$ in completed-square form:", opts: ["$(x - 3)^2 - 7$", "$(x - 3)^2 + 2$", "$(x - 6)^2 - 34$", "$(x + 3)^2 - 7$"], ans: 0, why: "$(x - 3)^2 - 9 + 2$." },
    { q: "$2x^2 - 12x + 1$ has minimum value", opts: ["$-17$", "$1$", "$-35$", "$-5$"], ans: 0, why: "$2(x - 3)^2 - 18 + 1$." },
    { q: "$x^2 + kx + 9 = 0$ has equal roots when $k =$", opts: ["$\\pm3$", "$\\pm6$", "$9$", "$\\pm9$"], ans: 1, why: "$k^2 - 36 = 0$." },
    { q: "$y = x + c$ is a tangent to $y = x^2$ when", opts: ["$c = 0$", "$c = -\\tfrac14$", "$c = \\tfrac14$", "$c = 1$"], ans: 1, why: "$x^2 - x - c = 0$, $1 + 4c = 0$." },
    { q: "\"Meets at two distinct points\" needs", opts: ["$b^2 - 4ac \\ge 0$", "$b^2 - 4ac > 0$", "$b^2 - 4ac = 0$", "$b^2 - 4ac < 0$"], ans: 1, why: "Distinct: strictly positive." },
    { q: "The number of real solutions of $x^4 - 5x^2 + 4 = 0$:", opts: ["2", "4", "1", "0"], ans: 1, why: "$x^2 = 1$ or $4$: $x = \\pm1, \\pm2$." },
    { q: "Vertex of $y = 4 - 3(x + 2)^2$:", opts: ["$(2, 4)$ max", "$(-2, 4)$ max", "$(-2, 4)$ min", "$(2, -4)$ max"], ans: 1, why: "Bracket zero at $x = -2$; negative coefficient means maximum." },
    { q: "$P = 100 - 6.25(x - 9)^2 > 80$ gives", opts: ["$x < 7.21$", "$7.21 < x < 10.79$", "$x > 10.79$", "$x = 9$"], ans: 1, why: "$(x - 9)^2 < 3.2$." },
    { q: "A limitation of a projectile model $H = a - b(x - 9)^2$:", opts: ["it uses decimals", "air resistance is ignored", "$x$ is in metres", "$b$ is positive"], ans: 1, why: "A modelling assumption that may not hold." }
  ]
};

/* =====================================================================
   2.4  Simultaneous equations
   ===================================================================== */
C["maths:2.4"] = {
  notes: [
    { h: "Simultaneous equations — the whole topic on one page" },
    "Two equations, two unknowns. At A-level the interesting case is **one linear, one non-linear**: a line meeting a parabola, a circle, a reciprocal curve or a cubic. The algebra is always the same move — *substitute the linear into the other* — and the answer is a quadratic (or a cubic with one root given to you).",
    { ul: [
      "**Elimination** for two linear equations (add or subtract to kill a variable).",
      "**Substitution** for linear + quadratic: make $y$ (or $x$) the subject of the line, substitute, solve, back-substitute for the other coordinate.",
      "**Graphically** the solutions are the intersection points — which is why the discriminant of the resulting quadratic tells you *how many* intersections (2.3).",
      "**Verify then divide**: \"verify the curves intersect at $x = 1$; find the exact $x$-coordinate of the other point\" — a cubic with one root handed to you, so factor it out (2.6)."
    ] },

    { page: "Linear with non-linear" },
    { callout: { t: "memorise", h: "The substitution method", body: [
      "1. Rearrange the **linear** equation to $y = \\ldots$ (or $x = \\ldots$ if that is simpler).",
      "2. Substitute into the non-linear equation. Expand carefully — a squared bracket needs three terms.",
      "3. Collect into $ax^2 + bx + c = 0$ and solve (factorise / formula).",
      "4. Substitute **each** $x$ back into the *linear* equation for its $y$.",
      "5. Present as coordinate pairs — $(x_1, y_1)$ and $(x_2, y_2)$ — never as two lists."
    ] } },
    { worked: { tag: "example", title: "Line and circle", src: "spec example: $2x - 3y = 6$, $x^2 - y^2 + 3x = 50$",
      q: "Solve the simultaneous equations $2x - 3y = 6$ and $x^2 - y^2 + 3x = 50$.",
      steps: [
        { h: "Make $x$ the subject (it has the smaller coefficient)", m: "$x = \\dfrac{6 + 3y}{2}$", mk: "M1", n: "Making $y$ the subject gives fractions with 3 — either works, but pick the tidier one." },
        { h: "Substitute", m: "$\\left(\\dfrac{6 + 3y}{2}\\right)^2 - y^2 + 3\\left(\\dfrac{6 + 3y}{2}\\right) = 50$\n$\\dfrac{36 + 36y + 9y^2}{4} - y^2 + \\dfrac{18 + 9y}{2} = 50$", mk: "M1", n: "$(6 + 3y)^2 = 36 + 36y + 9y^2$ — three terms." },
        { h: "Clear fractions (×4) and collect", m: "$36 + 36y + 9y^2 - 4y^2 + 36 + 18y = 200 \;\\Rightarrow\; 5y^2 + 54y - 128 = 0$", mk: "A1" },
        { h: "Solve", m: "$(5y + 64)(y - 2) = 0 \;\\Rightarrow\; y = 2 \\text{ or } y = -\\dfrac{64}{5}$", mk: "M1 A1", n: "Product $-640$, sum $54$: $64$ and $-10$." },
        { h: "Back into the linear equation", m: "$y = 2: x = 6; \\qquad y = -\\dfrac{64}{5}: x = \\dfrac{6 - \\frac{192}{5}}{2} = -\\dfrac{81}{5}$", mk: "A1", n: "Use the **linear** equation for $y$ — substituting into the quadratic one can produce extra false pairs." }
      ], result: "$(6, 2)$ and $\\left(-\\dfrac{81}{5}, -\\dfrac{64}{5}\\right)$" } },
    { worked: { tag: "exam", title: "A curve with a surd meets a line", src: "AS Specimen · P1 Q12(a) · 5 marks",
      q: "The curve $C$ has equation $y = 3x - 2\\sqrt x$, $x \\ge 0$, and the line $l$ has equation $y = 8x - 16$. The line cuts the curve at the point $A$. Using algebra, find the $x$-coordinate of $A$.",
      steps: [
        { h: "Equate", m: "$3x - 2\\sqrt x = 8x - 16 \;\\Rightarrow\; 5x + 2\\sqrt x - 16 = 0$", mk: "M1" },
        { h: "A quadratic in $\\sqrt x$", m: "Let $u = \\sqrt x$: $\; 5u^2 + 2u - 16 = 0 \;\\Rightarrow\; (5u - 8)(u + 2) = 0$", mk: "M1 A1", n: "Product $-80$, sum $2$: $10$ and $-8$." },
        { m: "$u = \\dfrac85$ (reject $u = -2$ since $\\sqrt x \\ge 0$), so $x = \\dfrac{64}{25}$", mk: "M1 A1", n: "Square to get $x$; state the rejection." }
      ], result: "$x = \\dfrac{64}{25}$" } },
    { fig: { x: [-0.5, 5], y: [-4, 12], axes: { xt: [1, 2, 3, 4], yt: [-4, 4, 8, 12] }, items: [
      { fn: "3*x-2*sqrt(x)", from: 0, to: 5, label: "C: y = 3x − 2√x", at: 4.2, pos: "nw" },
      { fn: "8*x-16", c: "accent3", label: "l: y = 8x − 16", at: 3.2, pos: "se" },
      { pt: [2.56, 4.48], label: "A (2.56, 4.48)", pos: "nw" }
    ], cap: "The line cuts the curve once for $x \\ge 0$; the algebra found exactly that point, $x = \\frac{64}{25} = 2.56$." } },

    { page: "Verify one root, find the others" },
    "Two curves meeting produces a **cubic**. Edexcel hands you one intersection (\"verify that the curves intersect at $x = 1$\") so that you can divide it out and solve the remaining quadratic exactly. Three moves:",
    { ol: [
      "**Verify**: substitute the given $x$ into *both* equations and show the $y$ values agree. Both — showing one is not a verification.",
      "**Equate and collect** into a cubic $= 0$.",
      "**Factor out** $(x - a)$ by inspection or division (2.6), then solve the quadratic factor with the formula, keeping the surd exact. Apply any condition given ($x > 0$, $k < 0$)."
    ] },
    { worked: { tag: "exam", title: "Two curves — verify $x = \\frac12$, then the exact other point", src: "A-level June 2022 · P1 Q11 · 7 marks",
      q: "$C_1$: $y = 2x^3 + 10$, $x > 0$ and $C_2$: $y = 42x - 15x^2 - 7$, $x > 0$. **(a)** Verify that the curves intersect at $x = \\frac12$. **(b)** The curves intersect again at $P$. Using algebra and showing all stages of working, find the exact $x$-coordinate of $P$.",
      steps: [
        { h: "(a) Both curves at $x = \\frac12$", m: "$C_1: 2 \\times \\dfrac18 + 10 = 10.25 \\qquad C_2: 21 - \\dfrac{15}{4} - 7 = 10.25$ — equal, so they intersect there.", mk: "M1 A1" },
        { h: "(b) Equate and collect", m: "$2x^3 + 10 = 42x - 15x^2 - 7 \;\\Rightarrow\; 2x^3 + 15x^2 - 42x + 17 = 0$", mk: "M1" },
        { h: "$x = \\frac12$ is a root, so $(2x - 1)$ is a factor", m: "$2x^3 + 15x^2 - 42x + 17 = (2x - 1)(x^2 + 8x - 17)$", mk: "M1 A1", n: "Inspection: $2x \\cdot x^2$ gives $2x^3$; $(-1)(-17) = 17$; the middle term $8x^2$ is fixed by $15x^2 = 16x^2 - x^2$. Check the $x$ term: $-34x - 8x = -42x$ ✓" },
        { h: "Quadratic factor by the formula", m: "$x = \\dfrac{-8 \\pm \\sqrt{64 + 68}}{2} = \\dfrac{-8 \\pm \\sqrt{132}}{2} = -4 \\pm \\sqrt{33}$", mk: "M1" },
        { m: "$x > 0$, so $x = \\sqrt{33} - 4$", mk: "A1", n: "$\\sqrt{132} = 2\\sqrt{33}$ simplified *before* halving. Reject $-4 - \\sqrt{33}$ using the domain." }
      ], result: "$x_P = \\sqrt{33} - 4$" } },
    { worked: { tag: "exam", title: "Rational curve meets a line", src: "A-level June 2025 · P1 Q12 · 8 marks",
      q: "$C$: $y = \\frac{15x}{(2x + 3)(x - 3)}$, $x \\neq -\\frac32$, $x \\neq 3$, and $l$: $y = 2x - 10$. **(a)** Verify that $C$ and $l$ intersect where $x = 6$. **(b)** Show that the $x$-coordinate of the other intersection $Q$ satisfies $4x^3 - 26x^2 - 3x + 90 = 0$. **(c)** Find the exact $x$-coordinate of $Q$.",
      steps: [
        { h: "(a)", m: "$C: \\dfrac{90}{15 \\times 3} = 2 \\qquad l: 12 - 10 = 2$ ✓", mk: "M1 A1" },
        { h: "(b) Clear the denominator", m: "$15x = (2x - 10)(2x + 3)(x - 3) = (2x - 10)(2x^2 - 3x - 9)$\n$= 4x^3 - 6x^2 - 18x - 20x^2 + 30x + 90 = 4x^3 - 26x^2 + 12x + 90$", mk: "M1" },
        { m: "$4x^3 - 26x^2 + 12x + 90 - 15x = 0 \;\\Rightarrow\; 4x^3 - 26x^2 - 3x + 90 = 0$", mk: "A1*" },
        { h: "(c) Divide out $(x - 6)$", m: "$4x^3 - 26x^2 - 3x + 90 = (x - 6)(4x^2 - 2x - 15)$", mk: "M1 A1", n: "$4x^2$ to match the cube, $-15$ to match $+90$; middle: $-24x^2 - 2x^2 = -26x^2$ ✓; $x$: $12x - 15x = -3x$ ✓" },
        { m: "$x = \\dfrac{2 \\pm \\sqrt{4 + 240}}{8} = \\dfrac{2 \\pm 2\\sqrt{61}}{8} = \\dfrac{1 \\pm \\sqrt{61}}{4}$; $Q$ has $x < 0$, so $x_Q = \\dfrac{1 - \\sqrt{61}}{4}$", mk: "M1 A1", n: "The sketch shows $Q$ in the third quadrant — that is the information that picks the sign." }
      ], result: "$x_Q = \\dfrac{1 - \\sqrt{61}}{4}$" } },
    { worked: { tag: "exam", title: "Cubic and quadratic curves; the root $k < 0$", src: "AS June 2023 · P1 Q15 · 7 marks",
      q: "$C_1$: $y = 8 - 10x + 6x^2 - x^3$ and $C_2$: $y = x^2 - 12x + 14$. **(a)** Verify that when $x = 1$ the curves intersect. **(b)** The curves also intersect when $x = k$, $k < 0$. Use algebra to find the exact value of $k$.",
      steps: [
        { h: "(a)", m: "$C_1(1) = 8 - 10 + 6 - 1 = 3, \\qquad C_2(1) = 1 - 12 + 14 = 3$ ✓", mk: "M1 A1" },
        { h: "(b) Equate", m: "$8 - 10x + 6x^2 - x^3 = x^2 - 12x + 14 \;\\Rightarrow\; x^3 - 5x^2 - 2x + 6 = 0$", mk: "M1 A1", n: "Move everything to the side that makes $x^3$ positive — fewer sign errors in the division." },
        { m: "$(x - 1)(x^2 - 4x - 6) = 0 \;\\Rightarrow\; x = \\dfrac{4 \\pm \\sqrt{16 + 24}}{2} = 2 \\pm \\sqrt{10}$", mk: "M1 A1" },
        { m: "$k < 0 \\Rightarrow k = 2 - \\sqrt{10}$", mk: "A1" }
      ], result: "$k = 2 - \\sqrt{10}$" } },
    { worked: { tag: "exam", title: "Reciprocal curve meets a quadratic — sketch, show the cubic, solve", src: "AS June 2024 · P1 Q5 · 9 marks",
      q: "$C_1$: $y = \\frac{6}{x} + 3$. **(a)(i)** Sketch $C_1$, stating the coordinates of any points where it cuts the axes. **(ii)** State the equations of any asymptotes to $C_1$. $C_2$: $y = 3x^2 - 4x - 10$. **(b)** Show that $C_1$ and $C_2$ intersect when $3x^3 - 4x^2 - 13x - 6 = 0$. **(c)** Given that the $x$-coordinate of one of the points of intersection is $-\\frac23$, use algebra to find the $x$-coordinates of the other points of intersection.",
      steps: [
        { h: "(a) Translate $y = \\frac6x$ up by 3", m: "Cuts the $x$-axis where $\\dfrac6x = -3$: $x = -2$, i.e. $(-2, 0)$. Never cuts the $y$-axis. Asymptotes $x = 0$ and $y = 3$.", mk: "B1 B1 B1", fig: { x: [-6, 6], y: [-6, 12], axes: { xt: [-4, -2, 2, 4], yt: [-4, 4, 8, 12] }, items: [ { fn: "6/x+3", from: -6, to: -0.3, label: "y = 6/x + 3", at: -5.5, pos: "s" }, { fn: "6/x+3", from: 0.3, to: 6 }, { hline: 3, label: "y = 3" }, { pt: [-2, 0], label: "(−2, 0)", pos: "sw" } ], cap: "Both branches, the horizontal asymptote $y = 3$ drawn and labelled, the $y$-axis as the vertical asymptote." }, n: "Two branches in the right quadrants, the asymptote **drawn as a dashed line and labelled**." },
        { h: "(b) Equate and multiply by $x$", m: "$\\dfrac6x + 3 = 3x^2 - 4x - 10 \;\\Rightarrow\; 6 + 3x = 3x^3 - 4x^2 - 10x \;\\Rightarrow\; 3x^3 - 4x^2 - 13x - 6 = 0$", mk: "M1 A1*" },
        { h: "(c) $x = -\\frac23$ is a root, so $(3x + 2)$ is a factor", m: "$3x^3 - 4x^2 - 13x - 6 = (3x + 2)(x^2 - 2x - 3)$", mk: "M1 A1", n: "$3x \\cdot x^2 = 3x^3$ and $2 \\times (-3) = -6$ fix the ends; check the middle: $x^2$: $-6x^2 + 2x^2 = -4x^2$ ✓, $x$: $-9x - 4x = -13x$ ✓." },
        { m: "$x^2 - 2x - 3 = (x - 3)(x + 1) = 0 \;\\Rightarrow\; x = 3 \\text{ or } x = -1$", mk: "M1 A1", n: "A root of $-\\frac{2}{3}$ means the factor is $(3x + 2)$, not $(x + \\frac23)$ — keeping integer coefficients makes the division clean." }
      ], result: "(a) $(-2, 0)$; asymptotes $x = 0$, $y = 3$ (c) $x = 3$ and $x = -1$" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Solve the simultaneous equations**", "every solution as a coordinate pair; both unknowns for each root"],
      ["**Verify that the curves intersect at $x = a$**", "both $y$ values computed and shown equal (or $f(a) = 0$ for the collected equation)"],
      ["**Show that the $x$-coordinate satisfies …**", "equate, clear any fraction, collect to the printed form — every line visible"],
      ["**Use algebra … exact**", "factor out the known root, quadratic formula, surd simplified, wrong root rejected with a reason (the domain or the sketch)"],
      ["**Find the range of $k$ for two distinct points**", "substitute, discriminant $> 0$ (topic 2.3)"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Squaring a bracket with two terms**: $(6 + 3y)^2 = 36 + 9y^2$ is missing the $36y$.",
      "**Back-substituting into the quadratic equation** and producing four \"solutions\" from two.",
      "**Verifying with one curve only.**",
      "**Dividing by the wrong factor**: a root $x = \\frac12$ gives the factor $(2x - 1)$; a root $-\\frac23$ gives $(3x + 2)$.",
      "**Not simplifying the surd** ($\\frac{-8 \\pm \\sqrt{132}}{2}$ left as it is) or **not rejecting** the root outside the domain.",
      "**Multiplying through by $x$ when $x$ could be 0** — allowed here only because the domain excludes it; say so."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Check a pair", "Store $x$ and $y$ (STO), then evaluate each equation's left side minus right side: both should give 0."],
      ["Check a cubic's roots", "**Equation → Polynomial → degree 3** returns all three roots; compare with your exact answer as a decimal ($\\sqrt{33} - 4 = 1.744\\ldots$). The working is still required."]
    ] },
    { callout: { t: "mnemonic", h: "\"Linear in, quadratic out, linear back\"", body: "Substitute the linear equation *in*; solve the quadratic that comes *out*; put each root *back* into the linear equation." } }
  ],
  flashcards: [
    ["Method for a linear and a non-linear pair?", "Rearrange the linear to $y = \\ldots$, substitute, solve the quadratic, back-substitute into the **linear** equation, give coordinate pairs."],
    ["How do you verify that two curves intersect at $x = a$?", "Evaluate **both** curves at $x = a$ and show the $y$-values are equal."],
    ["Root $x = \\frac12$ of a cubic → which factor?", "$(2x - 1)$."],
    ["$2x^3 + 15x^2 - 42x + 17 = 0$ with root $\\frac12$: other roots?", "$(2x-1)(x^2 + 8x - 17)$: $x = -4 \\pm \\sqrt{33}$."],
    ["$x^3 - 5x^2 - 2x + 6 = 0$ with root 1: exact negative root?", "$(x-1)(x^2 - 4x - 6)$: $x = 2 - \\sqrt{10}$."],
    ["$3x - 2\\sqrt x = 8x - 16$: $x$?", "$u = \\sqrt x$: $5u^2 + 2u - 16 = 0$, $u = \\frac85$, $x = \\frac{64}{25}$."],
    ["$\\frac6x + 3 = 3x^2 - 4x - 10$ as a cubic?", "$3x^3 - 4x^2 - 13x - 6 = 0$."],
    ["Why substitute back into the linear equation, not the quadratic one?", "The quadratic equation can pair each $x$ with two $y$ values, creating false solutions; the line gives exactly one."],
    ["How many intersections does a line have with a parabola?", "0, 1 or 2 — the sign of the discriminant of the substituted quadratic."]
  ],
  quiz: [
    { q: "Solving $y = x + 1$, $y = x^2 - 5$ gives the quadratic", opts: ["$x^2 - x - 6 = 0$", "$x^2 + x - 4 = 0$", "$x^2 - x - 4 = 0$", "$x^2 - 6 = 0$"], ans: 0, why: "$x^2 - 5 = x + 1$." },
    { q: "The solutions of that pair are", opts: ["$(3, 4)$ and $(-2, -1)$", "$(3, 4)$ only", "$x = 3, -2$", "$(3, -2)$"], ans: 0, why: "Roots $3$ and $-2$, then $y = x + 1$." },
    { q: "A root $x = -\\frac23$ of a cubic means the factor", opts: ["$(x - \\tfrac23)$", "$(3x + 2)$", "$(3x - 2)$", "$(2x + 3)$"], ans: 1, why: "$3x + 2 = 0 \\Rightarrow x = -\\frac23$." },
    { q: "To verify curves meet at $x = 1$ you must", opts: ["show one curve gives $y = 3$", "show both curves give the same $y$", "differentiate both", "sketch both"], ans: 1, why: "Equal $y$ at the same $x$." },
    { q: "$\\sqrt{132}$ simplified:", opts: ["$2\\sqrt{33}$", "$4\\sqrt{33}$", "$11\\sqrt{12}$", "$6\\sqrt{22}$"], ans: 0, why: "$132 = 4 \\times 33$." },
    { q: "$2x - 3y = 6$ and $x^2 - y^2 + 3x = 50$ — best first step:", opts: ["$x = \\frac{6 + 3y}{2}$", "square the first equation", "add the equations", "$y = x^2$"], ans: 0, why: "Make the linear one the subject and substitute." }
  ]
};

/* =====================================================================
   2.5  Linear and quadratic inequalities
   ===================================================================== */
C["maths:2.5"] = {
  notes: [
    { h: "Inequalities — the whole topic on one page" },
    { ul: [
      "**Linear**: solve like an equation, but **reverse the sign** when multiplying or dividing by a negative.",
      "**Quadratic**: find the critical values (the roots), sketch the parabola, read off where it is above or below zero. Never \"solve\" $x^2 > 4$ as $x > \\pm2$.",
      "**With fractions** ($\\frac{a}{x} < b$): multiply by $x^2$ (always positive), or sketch — do not multiply by $x$ without knowing its sign.",
      "**Set notation**: $\\{x : x < -4\\} \\cup \\{x : x > 5\\}$ for an \"or\"; $\\{x : 2 < x < 7\\}$ for an \"and\".",
      "**Regions**: a shaded region between a line and a curve is described by two (or three) inequalities in $x$ and $y$ — solid line for $\\le$, dotted for $<$."
    ] },

    { page: "Solving inequalities" },
    { h: "Linear" },
    { worked: { tag: "example", title: "$3(2 - x) \\ge 5x - 10$", src: "routine",
      steps: [
        { m: "$6 - 3x \\ge 5x - 10 \;\\Rightarrow\; 16 \\ge 8x \;\\Rightarrow\; x \\le 2$", n: "Moving the $x$ terms to the side where they stay positive avoids ever dividing by a negative. If you do divide by a negative — flip the sign." }
      ], result: "$x \\le 2$" } },
    { h: "Quadratic — the sketch method" },
    { callout: { t: "memorise", h: "Quadratic inequality in four moves", body: [
      "1. Get everything on one side: $x^2 - x - 20 > 0$.",
      "2. Find the **critical values** (roots): $(x - 5)(x + 4) = 0 \\Rightarrow x = 5, -4$.",
      "3. Sketch the parabola (U if $a > 0$) through them.",
      "4. Read off: $> 0$ is where the curve is **above** the axis — the two outer regions, $x < -4$ **or** $x > 5$. $< 0$ would be **between**: $-4 < x < 5$."
    ] } },
    { fig: { x: [-7, 8], y: [-25, 20], axes: { xt: [-4, 5], yt: [-20, 10, 20] }, items: [
      { shade: { fn: "x*x-x-20", from: -7, to: -4 }, c: "accent3", alpha: 0.2 }, { shade: { fn: "x*x-x-20", from: 5, to: 8 }, c: "accent3", alpha: 0.2 },
      { fn: "x*x-x-20", label: "y = x² − x − 20", at: 6.9, pos: "w" },
      { pt: [-4, 0], open: true, label: "−4", pos: "n" }, { pt: [5, 0], open: true, label: "5", pos: "n" },
      { text: [0.5, -14], t: "below: x² − x − 20 < 0", c: "muted", size: 11 }
    ], cap: "$x^2 - x - 20 > 0$ where the curve is above the axis: $x < -4$ or $x > 5$. Open circles because the inequality is strict." } },
    { worked: { tag: "exam", title: "$x^2 - x > 20$ in set notation", src: "AS Nov 2021 · P1 Q1 · 3 marks",
      q: "Using algebra, solve the inequality $x^2 - x > 20$, writing your answer in set notation.",
      steps: [
        { m: "$x^2 - x - 20 > 0 \;\\Rightarrow\; (x - 5)(x + 4) > 0$; critical values $x = 5$, $x = -4$", mk: "M1 A1", n: "\"Using algebra\": factorise on the page." },
        { m: "U-shaped parabola, positive outside the roots: $\\{x : x < -4\\} \\cup \\{x : x > 5\\}$", mk: "A1", n: "Two separate sets joined by $\\cup$. Writing $\\{x : -4 > x > 5\\}$ is meaningless and scores 0; \"$x < -4$ or $x > 5$\" is right but not in set notation as asked." }
      ], result: "$\\{x : x < -4\\} \\cup \\{x : x > 5\\}$" } },
    { worked: { tag: "exam", title: "Sketch $y = \\frac{k}{x}$, then solve $\\frac{16}{x} \\le 2$", src: "AS June 2023 · P1 Q4 · 5 marks",
      q: "**(a)** Sketch the curve with equation $y = \\frac{k}{x}$, $x \\neq 0$, where $k$ is a positive constant. **(b)** Hence or otherwise, solve $\\frac{16}{x} \\le 2$.",
      steps: [
        { h: "(a)", m: "Two branches in the first and third quadrants; both axes are asymptotes.", mk: "B1 B1", fig: { x: [-12, 12], y: [-10, 10], axes: { grid: false, xt: [-8, -4, 4, 8], yt: [-8, -4, 4, 8] }, items: [ { fn: "16/x", from: -12, to: -1.2, label: "y = 16/x", at: -10, pos: "s" }, { fn: "16/x", from: 1.2, to: 12 }, { hline: 2, c: "accent3", label: "y = 2" }, { pt: [8, 2], c: "accent3", label: "(8, 2)", pos: "ne" }, { shade: { fn: "2", fn2: "16/x", from: 8, to: 12 }, c: "accent3", alpha: 0.2 } ], cap: "The branch in the first quadrant is below $y = 2$ to the right of the crossing; the whole third-quadrant branch is below it." }, n: "Draw the axes as asymptotes (dashed is not needed — they *are* the axes) and get the quadrants right for positive $k$." },
        { h: "(b) Critical value where the curve meets $y = 2$", m: "$\\dfrac{16}{x} = 2 \;\\Rightarrow\; x = 8$", mk: "M1" },
        { h: "Read off from the sketch", m: "$\\dfrac{16}{x} \\le 2$ where the curve is on or below the line: the whole negative branch, and the positive branch from $x = 8$ onwards.\n$x < 0 \;\\text{ or }\; x \\ge 8$", mk: "A1 A1", n: "The commonest error is $x \\ge 8$ alone — multiplying by $x$ as if $x > 0$. Negative $x$ makes $\\frac{16}{x}$ negative, which is certainly $\\le 2$. Note $x = 0$ is excluded and $x = 8$ included." }
      ], result: "$x < 0$ or $x \\ge 8$" } },
    { callout: { t: "warn", h: "Inequalities with the variable in a denominator", body: [
      "Never multiply by $x$ unless you know its sign. Two safe routes:",
      "**Sketch** (as above) — the spec's intended method: \"interpret inequalities graphically\".",
      "**Multiply by $x^2$**, which is positive: $\\frac{16}{x} \\le 2 \\Rightarrow 16x \\le 2x^2 \\Rightarrow 2x^2 - 16x \\ge 0 \\Rightarrow 2x(x - 8) \\ge 0 \\Rightarrow x \\le 0$ or $x \\ge 8$ — then remove $x = 0$ because it was never allowed."
    ] } },

    { page: "Regions" },
    "A shaded region $R$ bounded by a line and a curve is defined by inequalities. Each boundary contributes one inequality; the direction is decided by a test point or by \"above/below\".",
    { callout: { t: "memorise", h: "Describing a region", body: [
      "$y \\le mx + c$: on or **below** the line. $\; y \\ge f(x)$: on or **above** the curve.",
      "Solid boundary ⇒ $\\le$ / $\\ge$ (included). Dotted boundary ⇒ $<$ / $>$ (excluded). When the figure does not say, use $\\le$/$\\ge$ and be consistent.",
      "A region that stops at the $y$-axis needs $x \\ge 0$ (or $x \\le 0$) as a third inequality. If the region is bounded by an axis, say so.",
      "You will usually have to **find the equations first** — that is where most of the marks are."
    ] } },
    { worked: { tag: "exam", title: "Region between a quadratic and a line — equations not given", src: "AS June 2023 · P1 Q8 · 5 marks",
      q: "Figure 3 shows a curve $C$ and a straight line $l$. $C$ has equation $y = f(x)$ where $f(x)$ is a quadratic; $C$ cuts the $x$-axis at $0$ and $6$; $l$ cuts the $y$-axis at $60$ and intersects $C$ at $(10, 80)$. Use inequalities to define the region $R$ shaded between $l$ (above), $C$ (below) and the $y$-axis.",
      steps: [
        { h: "The curve from its roots and a point", m: "$y = ax(x - 6)$; at $(10, 80)$: $80 = 40a \\Rightarrow a = 2$\n$y = 2x(x - 6) = 2x^2 - 12x$", mk: "M1 A1", n: "Roots at 0 and 6 mean the factors $x$ and $(x - 6)$; the third point fixes the stretch $a$." },
        { h: "The line from two points", m: "gradient $= \\dfrac{80 - 60}{10 - 0} = 2$, so $y = 2x + 60$", mk: "B1" },
        { h: "The inequalities", m: "$y \\le 2x + 60, \\qquad y \\ge 2x^2 - 12x, \\qquad x \\ge 0$", mk: "M1 A1", fig: { x: [-3, 12], y: [-25, 100], axes: { xt: [6, 10], yt: [60, 80] }, items: [ { shade: { fn: "2*x+60", fn2: "2*x*x-12*x", from: 0, to: 10 }, c: "accent", alpha: 0.18 }, { fn: "2*x*x-12*x", label: "C", at: 11, pos: "w" }, { fn: "2*x+60", c: "accent3", label: "l", at: -2, pos: "n" }, { pt: [10, 80], label: "(10, 80)", pos: "se" }, { pt: [0, 60], label: "60", pos: "w" } ], cap: "$R$: below $l$, above $C$, to the right of the $y$-axis." }, n: "Three boundaries, three inequalities. Missing $x \\ge 0$ loses the last mark — without it the region would extend left of the axis." }
      ], result: "$y \\le 2x + 60$, $\; y \\ge 2x^2 - 12x$, $\; x \\ge 0$" } },
    { worked: { tag: "exam", title: "Region between a line through two points and a given parabola", src: "AS June 2025 · P1 Q2 · 5 marks",
      q: "The line $l$ passes through $A(-3, 0)$ and $B\\left(\\frac52, 22\\right)$. **(a)** Find the equation of $l$ in the form $y = mx + c$. $C$ has equation $y = 2x^2 + 5x - 3$, and $l$ and $C$ intersect at $A$ and $B$; the region $R$ is bounded by $l$ and $C$. **(b)** Use inequalities to define $R$.",
      steps: [
        { h: "(a)", m: "$m = \\dfrac{22 - 0}{\\frac52 + 3} = \\dfrac{22}{5.5} = 4; \\qquad y = 4(x + 3) = 4x + 12$", mk: "M1 M1 A1" },
        { h: "(b) $R$ lies below the line and above the curve", m: "$y \\le 4x + 12, \\qquad y \\ge 2x^2 + 5x - 3$", mk: "B1 B1", n: "The intersections at $A$ and $B$ already bound $R$ left and right, so no $x$ inequality is needed. (Check: $2x^2 + 5x - 3 = 4x + 12 \\Rightarrow (2x - 5)(x + 3) = 0$ ✓.)" }
      ], result: "(a) $y = 4x + 12$ (b) $y \\le 4x + 12$, $y \\ge 2x^2 + 5x - 3$" } },
    { worked: { tag: "exam", title: "Quadratic from its minimum point; region with a chord", src: "A-level Oct 2020 · P1 Q7 · 5 marks",
      q: "A curve $C$, $y = f(x)$, meets a line $l$ at $(-2, 13)$ and $(0, 25)$. $f$ is quadratic and $(-2, 13)$ is its minimum turning point. The region $R$ is bounded by $C$ and $l$. Use inequalities to define $R$.",
      steps: [
        { h: "Completed-square form from the vertex", m: "$y = a(x + 2)^2 + 13$; at $(0, 25)$: $4a + 13 = 25 \\Rightarrow a = 3$\n$y = 3(x + 2)^2 + 13 = 3x^2 + 12x + 25$", mk: "M1 A1", n: "A minimum at $(-2, 13)$ *is* the completed square: bracket $(x + 2)$, constant 13." },
        { h: "The line through the two points", m: "gradient $\\dfrac{25 - 13}{0 - (-2)} = 6$, so $y = 6x + 25$", mk: "B1" },
        { h: "Region", m: "$y \\le 6x + 25, \\qquad y \\ge 3x^2 + 12x + 25$", mk: "M1 A1", n: "Between the two intersection points the line is above the curve, so $R$ is under the line and over the parabola." }
      ], result: "$y \\le 6x + 25$, $\; y \\ge 3x^2 + 12x + 25$" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Solve … in set notation**", "$\\{x : \\ldots\\}$, with $\\cup$ for \"or\" and either $\\cap$ or a double inequality for \"and\""],
      ["**Find the values of $x$ which satisfy**", "an inequality (or two), with the critical values found algebraically"],
      ["**Use inequalities to define the region $R$**", "one inequality per boundary, equations found first if not given, $x \\ge 0$ if the axis bounds it"],
      ["**Hence or otherwise**", "you may use the sketch you just drew — and it is the intended method"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**$x^2 > 25 \\Rightarrow x > \\pm5$** — meaningless. Critical values $\\pm5$, then *outside*: $x < -5$ or $x > 5$.",
      "**Inside/outside swapped**: $>0$ is outside for a U-shape; $<0$ is between.",
      "**\"and\" written for \"or\"**: $-4 > x > 5$ describes nothing.",
      "**Multiplying by $x$** in $\\frac{16}{x} \\le 2$ and losing the negative branch.",
      "**Dividing by a negative without flipping**.",
      "**Forgetting the axis boundary** ($x \\ge 0$) of a region, or using the wrong direction because the region was judged \"above the line\" instead of tested with a point.",
      "**Strict vs non-strict**: matching $<$ to an open circle / dotted line and $\\le$ to a closed one."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Inequality app", "**HOME → Inequality** solves $ax^2 + bx + c > 0$ etc. and prints the solution set. Use it to check; the paper says \"using algebra\"."],
      ["Test a point", "For a region, pick a point clearly inside $R$, e.g. $(5, 30)$, and evaluate each boundary expression: the inequality must hold for the point you chose. This catches a flipped direction in ten seconds."]
    ] },
    { callout: { t: "mnemonic", h: "\"Roots, sketch, shade\"", body: "Every quadratic inequality: find the roots, sketch the parabola, shade the side asked for. Reading the answer off a sketch never confuses inside with outside; algebra alone often does." } }
  ],
  flashcards: [
    ["Solve $x^2 - x > 20$ in set notation.", "$\\{x : x < -4\\} \\cup \\{x : x > 5\\}$."],
    ["Solve $x^2 \\le 9$.", "$-3 \\le x \\le 3$ (between the roots)."],
    ["Solve $\\frac{16}{x} \\le 2$.", "$x < 0$ or $x \\ge 8$ — sketch $y = 16/x$ against $y = 2$."],
    ["Why not multiply $\\frac{16}{x} \\le 2$ by $x$?", "The sign of $x$ is unknown; multiply by $x^2$ or use a sketch."],
    ["When does an inequality sign flip?", "Multiplying or dividing both sides by a negative number."],
    ["Set notation for $2 < x < 7$?", "$\\{x : 2 < x < 7\\}$ or $\\{x : x > 2\\} \\cap \\{x : x < 7\\}$."],
    ["Region under $y = 2x + 60$, above $y = 2x^2 - 12x$, right of the $y$-axis?", "$y \\le 2x + 60$, $y \\ge 2x^2 - 12x$, $x \\ge 0$."],
    ["Quadratic with roots 0 and 6 through $(10, 80)$?", "$y = ax(x - 6)$, $80 = 40a$, $y = 2x^2 - 12x$."],
    ["Quadratic with minimum $(-2, 13)$ through $(0, 25)$?", "$y = 3(x + 2)^2 + 13$."],
    ["Solid vs dotted boundary?", "Solid: $\\le$ or $\\ge$ (included); dotted: $<$ or $>$ (excluded)."],
    ["Solve $3(2 - x) \\ge 5x - 10$.", "$x \\le 2$."]
  ],
  quiz: [
    { q: "$x^2 - 5x + 6 < 0$ gives", opts: ["$2 < x < 3$", "$x < 2$ or $x > 3$", "$x < 2$", "$x > 3$"], ans: 0, why: "Roots 2 and 3; negative between." },
    { q: "$x^2 \\ge 16$ gives", opts: ["$x \\ge 4$", "$x \\ge \\pm4$", "$x \\le -4$ or $x \\ge 4$", "$-4 \\le x \\le 4$"], ans: 2, why: "Outside the roots." },
    { q: "$-2x > 8$ gives", opts: ["$x > -4$", "$x < -4$", "$x > 4$", "$x < 4$"], ans: 1, why: "Divide by $-2$ and flip." },
    { q: "$\\{x : x < 1\\} \\cup \\{x : x > 3\\}$ means", opts: ["$1 < x < 3$", "$x < 1$ or $x > 3$", "$x < 1$ and $x > 3$", "$x = 1, 3$"], ans: 1, why: "Union = or." },
    { q: "Region below $y = x + 2$ and above $y = x^2$:", opts: ["$y \\le x + 2$, $y \\ge x^2$", "$y \\ge x + 2$, $y \\le x^2$", "$y < x^2$", "$y \\le x + 2$ only"], ans: 0, why: "Under the line, over the curve." },
    { q: "$\\frac{4}{x} > 1$ is true for", opts: ["$x < 4$", "$0 < x < 4$", "$x > 4$", "$x < 0$"], ans: 1, why: "Positive branch above $y = 1$ up to $x = 4$; negative $x$ gives negative values." },
    { q: "Dotted boundary line means", opts: ["$\\le$", "$<$ or $>$", "$=$", "$\\ge$"], ans: 1, why: "Strict inequality." }
  ]
};

/* =====================================================================
   2.6  Polynomials and the factor theorem
   ===================================================================== */
C["maths:2.6"] = {
  notes: [
    { h: "Polynomials and the factor theorem — the whole topic on one page" },
    "Nineteen questions in eight years: this is the most frequently set algebra topic after quadratics, and it opens Paper 1 more often than any other (Q1 in 2019, 2021, 2024).",
    { ul: [
      "**Factor theorem**: $(x - a)$ is a factor of $f(x)$ $\\iff$ $f(a) = 0$. Used to *find an unknown constant*, to *show* something is a factor, and to *start* a factorisation.",
      "**Division**: write a cubic as $(x - a)(\\text{quadratic})$ — by inspection, comparing coefficients, or long division.",
      "**Factorise completely** — then sketch, solve, count real roots (discriminant of the quadratic factor), or deduce roots of a *transformed* equation $f(x - 5) = 0$, $f(2x) = 0$.",
      "**Rational expressions**: cancel common factors; write $\\frac{x^3 + 3x^2 - 4x - 12}{x^3 + 5x^2 + 6x}$ as $1 - \\frac2x$.",
      "Combined with **differentiation** (gradient conditions fix constants; no stationary points ⇔ $f'$ has no real roots) and with **integration** (area under a factorised cubic)."
    ] },

    { page: "Factor theorem and division" },
    { callout: { t: "memorise", h: "The factor theorem", body: [
      "$$\\text{If } f(a) = 0 \\text{ then } (x - a) \\text{ is a factor of } f(x). \\qquad \\text{If } f\\left(\\tfrac{b}{a}\\right) = 0 \\text{ then } (ax - b) \\text{ is a factor.}$$",
      "Read it both ways: a factor $(x + 3)$ means $f(-3) = 0$ — the **opposite** sign. A factor $(2x - 5)$ means $f\\left(\\frac52\\right) = 0$.",
      "\"Use the factor theorem to show $(x + 2)$ is a factor\": evaluate $f(-2)$, show it is $0$, **and write the conclusion** \"so $(x + 2)$ is a factor\". Dividing instead scores nothing for that part."
    ] } },
    { callout: { t: "tip", h: "Why does $f(a) = 0$ make $(x - a)$ a factor?", body: "Divide $f(x)$ by $(x - a)$: $f(x) = (x - a)Q(x) + R$ where the remainder $R$ is a constant (degree less than the divisor). Put $x = a$: $f(a) = 0 \\cdot Q(a) + R = R$. So the remainder *is* $f(a)$ — and a zero remainder is exactly what \"factor\" means." } },
    { h: "Three ways to divide" },
    { kv: [
      ["Inspection (fastest for a cubic)", "$2x^3 + 3x^2 - 16x + 16 = (x + 4)(2x^2 + px + 4)$: the first and last terms of the quadratic are forced ($2x \\cdot x^2$, $4 \\times 4$). Then match the $x^2$ term: $8x^2 + px^2 = 3x^2 \\Rightarrow p = -5$. **Check** the $x$ term: $4p \\cdot x + 4x = -20x + 4x = -16x$ ✓."],
      ["Comparing coefficients", "Write $f(x) \\equiv (x + 4)(ax^2 + bx + c)$, expand, equate each power. Same idea, fully written — what \"show all stages\" wants."],
      ["Long division", "Works for any divisor and gives the remainder. Divide the leading terms, multiply back, subtract, bring down, repeat."]
    ] },
    { worked: { tag: "exam", title: "Find a constant from a given factor", src: "A-level June 2019 · P1 Q1 · 3 marks",
      q: "$f(x) = 3x^3 + 2ax^2 - 4x + 5a$. Given that $(x + 3)$ is a factor of $f(x)$, find the value of the constant $a$.",
      steps: [
        { h: "Factor $(x + 3)$ ⇒ $f(-3) = 0$", m: "$3(-27) + 2a(9) - 4(-3) + 5a = 0$", mk: "M1", n: "Substitute $-3$, not $+3$." },
        { m: "$-81 + 18a + 12 + 5a = 0 \;\\Rightarrow\; 23a = 69 \;\\Rightarrow\; a = 3$", mk: "A1 A1" }
      ], result: "$a = 3$" } },
    { worked: { tag: "exam", title: "A product form with a constant subtracted", src: "A-level June 2022 · P1 Q2 · 3 marks",
      q: "$f(x) = (x - 4)(x^2 - 3x + k) - 42$ where $k$ is a constant. Given that $(x + 2)$ is a factor of $f(x)$, find the value of $k$.",
      steps: [
        { m: "$f(-2) = (-6)(4 + 6 + k) - 42 = 0$", mk: "M1", n: "No need to expand: substitute straight into the given form." },
        { m: "$-6(10 + k) = 42 \;\\Rightarrow\; 10 + k = -7 \;\\Rightarrow\; k = -17$", mk: "M1 A1" }
      ], result: "$k = -17$" } },
    { worked: { tag: "exam", title: "Two factors, two unknowns — then a transformed equation", src: "AS June 2024 · P1 Q2 · 8 marks",
      q: "$f(x) = 2x^3 - 3ax^2 + bx + 8a$. **(a)** Given $(x - 4)$ is a factor, use the factor theorem to show that $10a = 32 + b$. **(b)** Given also that $(x - 2)$ is a factor, express $f(x)$ in the form $(2x + k)(x - 4)(x - 2)$. **(c)** Hence **(i)** state the number of real roots of $f(x) = 0$; **(ii)** write down the largest root of $f\\left(\\frac13 x\\right) = 0$.",
      steps: [
        { h: "(a)", m: "$f(4) = 128 - 48a + 4b + 8a = 0 \;\\Rightarrow\; 40a - 4b = 128 \;\\Rightarrow\; 10a = 32 + b$", mk: "M1 A1*" },
        { h: "(b) Second factor gives a second equation", m: "$f(2) = 16 - 12a + 2b + 8a = 0 \;\\Rightarrow\; b = 2a - 8$\nWith (a): $10a = 32 + 2a - 8 \\Rightarrow a = 3, \; b = -2$", mk: "M1 A1", n: "So $f(x) = 2x^3 - 9x^2 - 2x + 24$." },
        { m: "$(2x + k)(x - 4)(x - 2)$: the constant term is $k \\times (-4)(-2) = 8k = 24 \\Rightarrow k = 3$\n$f(x) = (2x + 3)(x - 4)(x - 2)$", mk: "M1 A1", n: "Check the $x^2$ term: $(2x+3)(x^2 - 6x + 8) \\to -12x^2 + 3x^2 = -9x^2$ ✓" },
        { h: "(c)(i)", m: "Three distinct real roots: $-\\dfrac32, \; 2, \; 4$", mk: "B1" },
        { h: "(ii) $f\\left(\\frac13 x\\right) = 0$ when $\\frac13 x$ is a root of $f$", m: "$\\dfrac13 x = 4 \;\\Rightarrow\; x = 12$", mk: "B1", n: "Replacing $x$ by $\\frac13 x$ stretches the roots by 3: $-\\frac92, 6, 12$. Largest is 12." }
      ], result: "(a) shown (b) $(2x + 3)(x - 4)(x - 2)$ (c)(i) 3 (ii) 12" } },
    { worked: { tag: "exam", title: "Factor theorem plus a gradient condition", src: "AS June 2025 · P1 Q6 · 7 marks",
      q: "$f(x) = ax^3 + bx^2 + 18x + 9$. **(a)** Given $(x + 3)$ is a factor of $f(x)$, show that $-3a + b = 5$. **(b)** Given also that $f'(2) = 14$, find the value of $a$ and the value of $b$.",
      steps: [
        { h: "(a)", m: "$f(-3) = -27a + 9b - 54 + 9 = 0 \;\\Rightarrow\; -27a + 9b = 45 \;\\Rightarrow\; -3a + b = 5$", mk: "M1 A1*", n: "Divide through by 9 to reach the printed form." },
        { h: "(b) Differentiate, then use $x = 2$", m: "$f'(x) = 3ax^2 + 2bx + 18; \\quad f'(2) = 12a + 4b + 18 = 14 \;\\Rightarrow\; 3a + b = -1$", mk: "M1 A1" },
        { h: "Solve with (a)", m: "Add: $2b = 4 \\Rightarrow b = 2$; then $-3a + 2 = 5 \\Rightarrow a = -1$", mk: "M1 A1 A1" }
      ], result: "$a = -1$, $b = 2$" } },
    { worked: { tag: "exam", title: "Reconstruct $f$ from $f'$, an intercept and a factor", src: "A-level Oct 2020 · P2 Q8 · 6 marks",
      q: "A curve $C$ has equation $y = f(x)$. Given that $f'(x) = 6x^2 + ax - 23$, where $a$ is a constant; the $y$-intercept of $C$ is $-12$; and $(x + 4)$ is a factor of $f(x)$ — find, in simplest form, $f(x)$.",
      steps: [
        { h: "Integrate $f'$", m: "$f(x) = 2x^3 + \\dfrac{a}{2}x^2 - 23x + c$", mk: "M1 A1" },
        { h: "$y$-intercept gives $c$", m: "$f(0) = -12 \\Rightarrow c = -12$", mk: "B1" },
        { h: "Factor gives $a$", m: "$f(-4) = -128 + 8a + 92 - 12 = 0 \;\\Rightarrow\; 8a = 48 \;\\Rightarrow\; a = 6$", mk: "M1 A1" },
        { m: "$f(x) = 2x^3 + 3x^2 - 23x - 12$", mk: "A1", n: "Three pieces of information, three unknowns ($a$, $c$ and the integration itself). Use each once." }
      ], result: "$f(x) = 2x^3 + 3x^2 - 23x - 12$" } },

    { page: "Factorising cubics and what follows" },
    { h: "From one factor to the full factorisation" },
    { ol: [
      "Find one linear factor with the factor theorem (try $\\pm1, \\pm2, \\pm3, \\ldots$, factors of the constant term).",
      "Divide out to get the quadratic factor.",
      "Factorise the quadratic if it factorises — or use its **discriminant** to say it has no real roots / a repeated root.",
      "A cubic $= 0$ then has 1, 2 or 3 distinct real roots depending on that quadratic."
    ] },
    { fig: { x: [-4, 5.5], y: [-40, 40], axes: { xt: [-2, 4], yt: [-20, 20] }, items: [
      { fn: "(x+2)*(x-4)^2/2", label: "y = (x + 2)(x − 4)²", at: 4.9, pos: "w" },
      { fn: "-(x-2)*(3*x*x-2*x+5)/4", c: "accent3", label: "y = −(x − 2)(3x² − 2x + 5)", at: -2.3, pos: "e" },
      { pt: [-2, 0], label: "−2", pos: "s" }, { pt: [4, 0], label: "4 (touch)", pos: "s" }, { pt: [2, 0], c: "accent3", label: "2", pos: "ne" }
    ], cap: "A repeated factor makes the curve **touch** the axis; a quadratic factor with negative discriminant contributes **no** crossing. Counting roots is counting crossings and touches." } },
    { worked: { tag: "exam", title: "Factorise fully; a repeated factor; deduce inequalities from the sketch", src: "AS June 2018 · P1 Q9 · 9 marks",
      q: "$g(x) = 4x^3 - 12x^2 - 15x + 50$. **(a)** Use the factor theorem to show that $(x + 2)$ is a factor of $g(x)$. **(b)** Hence show that $g(x)$ can be written as $(x + 2)(ax + b)^2$, where $a$ and $b$ are integers. Figure 2 shows a sketch of $y = g(x)$. **(c)** Use your answer to part (b), and the sketch, to deduce the values of $x$ for which **(i)** $g(x) \\le 0$; **(ii)** $g(2x) = 0$.",
      steps: [
        { h: "(a)", m: "$g(-2) = -32 - 48 + 30 + 50 = 0$, so $(x + 2)$ is a factor.", mk: "M1 A1", n: "The A1 is for the zero **and** the conclusion in words." },
        { h: "(b) Divide", m: "$g(x) = (x + 2)(4x^2 - 20x + 25)$", mk: "M1 A1", n: "$4x^2$ and $25$ forced; middle: $8x^2 + px^2 = -12x^2 \\Rightarrow p = -20$; check $x$: $2(-20) + 25 = -15$ ✓" },
        { m: "$4x^2 - 20x + 25 = (2x - 5)^2$, so $g(x) = (x + 2)(2x - 5)^2$: $a = 2$, $b = -5$", mk: "M1 A1", n: "Recognise the perfect square: $(2x)^2 - 2 \\cdot 2x \\cdot 5 + 5^2$." },
        { h: "(c)(i) Where is the curve on or below the axis?", m: "Root at $x = -2$ (crossing) and $x = \\frac52$ (touching, from the square). $g(x) \\le 0$ for $x \\le -2$, and also at the single point $x = \\dfrac52$.", mk: "B1 B1", fig: { x: [-4, 5], y: [-30, 80], axes: { xt: [-2, 2.5], yt: [40, 80] }, items: [ { fn: "4*x^3-12*x^2-15*x+50", label: "y = g(x)", at: 4.2, pos: "w" }, { pt: [-2, 0], label: "−2", pos: "ne" }, { pt: [2.5, 0], label: "5/2", pos: "s" }, { shade: { fn: "4*x^3-12*x^2-15*x+50", from: -4, to: -2 }, c: "danger", alpha: 0.18 } ], cap: "Below the axis only for $x \\le -2$; the touch at $x = \\frac52$ gives $g = 0$ without going negative." }, n: "The touching root is the whole point of writing it as a square: $(2x - 5)^2 \\ge 0$ always, so the sign of $g$ is the sign of $(x + 2)$ — except at $x = \\frac52$ where $g = 0$. Omitting that point loses the mark." },
        { h: "(ii) $g(2x) = 0$", m: "$2x = -2$ or $2x = \\dfrac52$, so $x = -1$ or $x = \\dfrac54$", mk: "B1", n: "Halve the roots — $g(2x)$ is a horizontal stretch by $\\frac12$." }
      ], result: "(b) $(x + 2)(2x - 5)^2$ (c)(i) $x \\le -2$ or $x = \\frac52$ (ii) $x = -1, \\frac54$" } },
    { worked: { tag: "exam", title: "Show only one real root; root of $f(x - 5) = 0$", src: "AS June 2022 · P1 Q2 · 7 marks",
      q: "$f(x) = 2x^3 + 5x^2 + 2x + 15$. **(a)** Use the factor theorem to show $(x + 3)$ is a factor. **(b)** Find constants $a$, $b$, $c$ such that $f(x) = (x + 3)(ax^2 + bx + c)$. **(c)** Hence show that $f(x) = 0$ has only one real root. **(d)** Write down the real root of $f(x - 5) = 0$.",
      steps: [
        { h: "(a)", m: "$f(-3) = -54 + 45 - 6 + 15 = 0$ ⇒ $(x + 3)$ is a factor.", mk: "M1 A1" },
        { h: "(b)", m: "$f(x) = (x + 3)(2x^2 - x + 5)$: $a = 2, b = -1, c = 5$", mk: "M1 A1", n: "$x^2$: $6x^2 + bx^2 = 5x^2 \\Rightarrow b = -1$; check $x$: $3(-1) + 5 = 2$ ✓" },
        { h: "(c) Discriminant of the quadratic factor", m: "$b^2 - 4ac = (-1)^2 - 4(2)(5) = 1 - 40 = -39 < 0$, so $2x^2 - x + 5 = 0$ has no real roots and the only real root of $f(x) = 0$ is $x = -3$.", mk: "M1 A1", n: "Write the discriminant, its sign, and the conclusion. \"It doesn't factorise\" is not a proof." },
        { h: "(d) Translate the root", m: "$f(x - 5) = 0 \\iff x - 5 = -3 \\iff x = 2$", mk: "B1", n: "$f(x - 5)$ is $f$ shifted 5 to the **right**, so the root moves from $-3$ to $2$." }
      ], result: "(b) $a = 2, b = -1, c = 5$ (c) discriminant $-39 < 0$ (d) $x = 2$" } },
    { worked: { tag: "exam", title: "Prove $-4$ is the only real root", src: "A-level June 2025 · P1 Q4 · 5 marks",
      q: "$f(x) = 2x^3 + 3x^2 - 16x + 16$ and $f(-4) = 0$. **(a)** Write $f(x)$ in the form $(x + a)Q(x)$ where $Q(x)$ is a quadratic. **(b)** Hence prove that $-4$ is the only real root of $f(x) = 0$.",
      steps: [
        { h: "(a)", m: "$f(x) = (x + 4)(2x^2 - 5x + 4)$", mk: "M1 A1 A1", n: "$x^2$: $8 + p = 3 \\Rightarrow p = -5$; $x$: $4(-5) + 4 = -16$ ✓" },
        { h: "(b)", m: "$Q(x) = 2x^2 - 5x + 4$: discriminant $25 - 32 = -7 < 0$, so $Q(x) = 0$ has no real solutions. Hence $x = -4$ is the only real root.", mk: "M1 A1" }
      ], result: "$(x + 4)(2x^2 - 5x + 4)$; discriminant $-7$" } },
    { worked: { tag: "exam", title: "A cubic that decides a sextic and a trig equation", src: "A-level June 2018 · P2 Q6 · 6 marks",
      q: "$f(x) = -3x^3 + 8x^2 - 9x + 10$. **(a)(i)** Calculate $f(2)$. **(ii)** Write $f(x)$ as a product of two algebraic factors. **(b)** Using (a)(ii), prove that there are exactly two real solutions to $-3y^6 + 8y^4 - 9y^2 + 10 = 0$. **(c)** Deduce the number of real solutions, for $7\\pi \\le \\theta < 10\\pi$, to $3\\tan^3\\theta - 8\\tan^2\\theta + 9\\tan\\theta - 10 = 0$.",
      steps: [
        { h: "(a)", m: "$f(2) = -24 + 32 - 18 + 10 = 0$, so $f(x) = (x - 2)(-3x^2 + 2x - 5)$", mk: "B1 M1 A1", n: "Leading $-3x^2$ to make $-3x^3$; $-5$ to make $+10$; middle: $6x^2 + px^2 = 8x^2 \\Rightarrow p = 2$." },
        { h: "(b) Put $x = y^2$", m: "$(y^2 - 2)(-3y^4 + 2y^2 - 5) = 0$. The quadratic in $y^2$ has discriminant $4 - 60 < 0$, so no real $y^2$; hence $y^2 = 2$ only: $y = \\pm\\sqrt2$ — exactly two real solutions.", mk: "M1 A1" },
        { h: "(c) Put $x = \\tan\\theta$; the equation is $-f(\\tan\\theta) = 0$", m: "$\\tan\\theta = 2$ only. $\\tan$ has period $\\pi$, and $7\\pi \\le \\theta < 10\\pi$ is three periods long: **3** solutions.", mk: "B1", n: "One solution per period of $\\tan$ — no need to find them." }
      ], result: "(a) $f(2) = 0$; $(x - 2)(-3x^2 + 2x - 5)$ (b) $y = \\pm\\sqrt2$ (c) 3" } },
    { worked: { tag: "exam", title: "Unknown root $a$ appears in the equation itself", src: "A-level June 2023 · P1 Q2 · 6 marks",
      q: "$f(x) = 4x^3 + 5x^2 - 10x + 4a$, where $a$ is a positive constant. Given $(x - a)$ is a factor of $f(x)$, **(a)** show that $a(4a^2 + 5a - 6) = 0$. **(b)** Hence **(i)** find the value of $a$; **(ii)** use algebra to find the exact solutions of $f(x) = 3$.",
      steps: [
        { h: "(a) $f(a) = 0$", m: "$4a^3 + 5a^2 - 10a + 4a = 0 \;\\Rightarrow\; 4a^3 + 5a^2 - 6a = 0 \;\\Rightarrow\; a(4a^2 + 5a - 6) = 0$", mk: "M1 A1*" },
        { h: "(b)(i)", m: "$4a^2 + 5a - 6 = (4a - 3)(a + 2) = 0$; $a > 0$ so $a = \\dfrac34$", mk: "M1 A1", n: "Reject $a = 0$ and $a = -2$ using \"positive\"." },
        { h: "(ii) $f(x) = 3$ with $4a = 3$", m: "$4x^3 + 5x^2 - 10x + 3 = 3 \;\\Rightarrow\; x(4x^2 + 5x - 10) = 0$", mk: "M1" },
        { m: "$x = 0 \;\\text{ or }\; x = \\dfrac{-5 \\pm \\sqrt{25 + 160}}{8} = \\dfrac{-5 \\pm \\sqrt{185}}{8}$", mk: "A1", n: "Three exact solutions. Do not divide by $x$." }
      ], result: "$a = \\frac34$; $x = 0, \; \\dfrac{-5 \\pm \\sqrt{185}}{8}$" } },
    { worked: { tag: "exam", title: "Factorise, sketch, and count intersections with $y = k$", src: "AS June 2022 · P1 Q7 · 7 marks",
      q: "**(a)** Factorise completely $9x - x^3$. The curve $C$ has equation $y = 9x - x^3$. **(b)** Sketch $C$ showing the coordinates of the points where it cuts the $x$-axis. The line $l$ has equation $y = k$. Given that $C$ and $l$ intersect at 3 distinct points, **(c)** find the range of values for $k$, in set notation.",
      steps: [
        { h: "(a)", m: "$9x - x^3 = x(9 - x^2) = x(3 - x)(3 + x)$", mk: "M1 A1", n: "\"Completely\": the difference of two squares must be split." },
        { h: "(b)", m: "Roots $-3, 0, 3$; negative $x^3$ coefficient so the curve falls to the right.", mk: "B1 B1", fig: { x: [-4.5, 4.5], y: [-14, 14], axes: { xt: [-3, 3], yt: [-10, 10] }, items: [ { fn: "9*x-x^3", label: "y = 9x − x³", at: -3.9, pos: "e" }, { pt: [-3, 0], label: "(−3, 0)", pos: "sw" }, { pt: [0, 0] }, { pt: [3, 0], label: "(3, 0)", pos: "ne" }, { pt: [Math.sqrt(3), 6 * Math.sqrt(3)], c: "accent3", label: "(√3, 6√3)", pos: "e" }, { pt: [-Math.sqrt(3), -6 * Math.sqrt(3)], c: "accent3", label: "(−√3, −6√3)", pos: "w" }, { hline: 6 * Math.sqrt(3), c: "muted", label: "y = 6√3" }, { hline: -6 * Math.sqrt(3), c: "muted" } ], cap: "A horizontal line meets the curve three times only when it sits strictly between the two turning values." }, n: "Shape and the three labelled intercepts." },
        { h: "(c) Turning points bound the useful $k$", m: "$\\dfrac{dy}{dx} = 9 - 3x^2 = 0 \\Rightarrow x = \\pm\\sqrt3$; $y = 9\\sqrt3 - 3\\sqrt3 = 6\\sqrt3$ and $-6\\sqrt3$", mk: "M1 A1" },
        { m: "$\\{k : -6\\sqrt3 < k < 6\\sqrt3\\}$", mk: "A1", n: "Strict: at $k = \\pm6\\sqrt3$ the line is tangent at a turning point and meets only twice." }
      ], result: "(a) $x(3 - x)(3 + x)$ (c) $\\{k : -6\\sqrt3 < k < 6\\sqrt3\\}$" } },
    { worked: { tag: "exam", title: "Cubic from a point and a gradient; no stationary points; $f(0.2x)$", src: "AS Nov 2021 · P1 Q16 · 11 marks",
      q: "$f(x) = ax^3 + 15x^2 - 39x + b$. The point $(2, 10)$ lies on $C: y = f(x)$ and the gradient there is $-3$. **(a)(i)** Show that $a = -2$. **(ii)** Find $b$. **(b)** Hence show that $C$ has no stationary points. **(c)** Write $f(x) = (x - 4)Q(x)$. **(d)** Hence deduce the coordinates of the points where $y = f(0.2x)$ meets the coordinate axes.",
      steps: [
        { h: "(a)(i) Gradient condition", m: "$f'(x) = 3ax^2 + 30x - 39; \\quad f'(2) = 12a + 60 - 39 = -3 \\Rightarrow 12a = -24 \\Rightarrow a = -2$", mk: "M1 A1*" },
        { h: "(ii) Point condition", m: "$f(2) = -16 + 60 - 78 + b = 10 \\Rightarrow b = 44$", mk: "M1 A1" },
        { h: "(b) $f'(x) = 0$ has no real solutions", m: "$-6x^2 + 30x - 39 = 0$: discriminant $900 - 4(-6)(-39) = 900 - 936 = -36 < 0$. No real roots, so no stationary points.", mk: "M1 A1 A1" },
        { h: "(c)", m: "$f(x) = -2x^3 + 15x^2 - 39x + 44 = (x - 4)(-2x^2 + 7x - 11)$", mk: "M1 A1", n: "$x^2$: $8 + p = 15 \\Rightarrow p = 7$; check $x$: $-28 - 11 = -39$ ✓" },
        { h: "(d) $y = f(0.2x)$", m: "Meets the $y$-axis at $f(0) = 44$: $(0, 44)$. Meets the $x$-axis where $0.2x = 4$ (the quadratic has discriminant $49 - 88 < 0$): $x = 20$, i.e. $(20, 0)$.", mk: "B1 B1", n: "$f(0.2x)$ stretches horizontally by factor 5; the $y$-intercept is untouched." }
      ], result: "$a = -2$, $b = 44$; $(x - 4)(-2x^2 + 7x - 11)$; $(0, 44)$ and $(20, 0)$" } },

    { page: "Rational expressions and area" },
    { worked: { tag: "exam", title: "Simplify an algebraic fraction to $A + \\frac{B}{x}$", src: "AS Specimen · P1 Q5 · 8 marks",
      q: "$f(x) = x^3 + 3x^2 - 4x - 12$. **(a)** Using the factor theorem, explain why $f(x)$ is divisible by $(x + 3)$. **(b)** Hence fully factorise $f(x)$. **(c)** Show that $\\frac{x^3 + 3x^2 - 4x - 12}{x^3 + 5x^2 + 6x}$ can be written in the form $A + \\frac{B}{x}$ where $A$ and $B$ are integers.",
      steps: [
        { h: "(a)", m: "$f(-3) = -27 + 27 + 12 - 12 = 0$, so $(x + 3)$ is a factor.", mk: "M1 A1" },
        { h: "(b)", m: "$f(x) = (x + 3)(x^2 - 4) = (x + 3)(x - 2)(x + 2)$", mk: "M1 A1 A1", n: "Grouping also works: $x^2(x + 3) - 4(x + 3)$." },
        { h: "(c) Factorise the denominator and cancel", m: "$x^3 + 5x^2 + 6x = x(x^2 + 5x + 6) = x(x + 2)(x + 3)$\n$\\dfrac{(x + 3)(x - 2)(x + 2)}{x(x + 2)(x + 3)} = \\dfrac{x - 2}{x} = 1 - \\dfrac2x$", mk: "M1 A1 A1", n: "$A = 1$, $B = -2$. Cancel only **factors** — never terms." }
      ], result: "$1 - \\dfrac{2}{x}$" } },
    { worked: { tag: "exam", title: "Three linear factors, then the area below the axis", src: "AS June 2020 · P1 Q10 · 10 marks",
      q: "$g(x) = 2x^3 + x^2 - 41x - 70$. **(a)** Use the factor theorem to show $g(x)$ is divisible by $(x - 5)$. **(b)** Hence write $g(x)$ as a product of three linear factors. The finite region $R$ is bounded by $y = g(x)$ and the $x$-axis and lies below the $x$-axis. **(c)** Find, using algebraic integration, the exact area of $R$.",
      steps: [
        { h: "(a)", m: "$g(5) = 250 + 25 - 205 - 70 = 0$ ✓", mk: "M1 A1" },
        { h: "(b)", m: "$g(x) = (x - 5)(2x^2 + 11x + 14) = (x - 5)(2x + 7)(x + 2)$", mk: "M1 A1 M1 A1", n: "Roots $-\\frac72, -2, 5$." },
        { h: "(c) Which region is below the axis?", m: "Positive cubic: below the axis between the middle and largest roots, $-2 \\le x \\le 5$.", mk: "B1", fig: { x: [-5, 7], y: [-140, 60], axes: { xt: [-3.5, -2, 5], yt: [-100, -50, 50] }, items: [ { shade: { fn: "2*x^3+x^2-41*x-70", from: -2, to: 5 }, c: "danger", alpha: 0.18 }, { fn: "2*x^3+x^2-41*x-70", label: "y = g(x)", at: 6.2, pos: "w" }, { pt: [-3.5, 0], label: "−7/2", pos: "n" }, { pt: [-2, 0], label: "−2", pos: "ne" }, { pt: [5, 0], label: "5", pos: "n" } ], cap: "$R$ is the region between $x = -2$ and $x = 5$; the integral there is negative and the area is its modulus." } },
        { m: "$\\displaystyle\\int_{-2}^{5} \\left(2x^3 + x^2 - 41x - 70\\right)\\mathrm{d}x = \\left[\\dfrac{x^4}{2} + \\dfrac{x^3}{3} - \\dfrac{41x^2}{2} - 70x\\right]_{-2}^{5}$", mk: "M1 A1" },
        { m: "$= \\left(\\dfrac{625}{2} + \\dfrac{125}{3} - \\dfrac{1025}{2} - 350\\right) - \\left(8 - \\dfrac83 - 82 + 140\\right) = -\\dfrac{1715}{3}$\nArea $= \\dfrac{1715}{3}$", mk: "M1 A1", n: "A negative integral for a region below the axis is expected; the **area** is stated positive." }
      ], result: "(b) $(x - 5)(2x + 7)(x + 2)$ (c) $\\dfrac{1715}{3}$" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Use the factor theorem to show $(x + 2)$ is a factor**", "$f(-2)$ evaluated to 0 with the substitution visible, then the sentence \"so $(x + 2)$ is a factor\""],
      ["**Hence factorise fully / write as a product of three linear factors**", "divide by the known factor, then factorise the quadratic; every factor linear"],
      ["**Express in the form $(x + a)Q(x)$**", "the division only — $Q$ may not factorise"],
      ["**Show that $f(x) = 0$ has exactly one real root**", "discriminant of the quadratic factor, its sign, conclusion"],
      ["**Write down** the root of $f(x - 5) = 0$ / $f(2x) = 0$", "transform the known roots (shift / scale); no working expected"],
      ["**Factorise completely**", "common factor out first, difference of two squares split"],
      ["**You must make your method clear**", "the factor-theorem equation written before the answer; a calculator solve alone scores 0"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Wrong sign in $f(a)$**: $(x + 3)$ means $f(-3)$.",
      "**Dividing to \"show\" a factor** when the factor theorem was demanded.",
      "**Not checking the middle term** after inspection — one coefficient is unforced and must be verified.",
      "**\"Does not factorise\" as a proof of no real roots** — only the discriminant is a proof.",
      "**Repeated root treated as a crossing** in an inequality — $(2x - 5)^2 \\ge 0$ never changes sign.",
      "**Transforming roots the wrong way**: $f(x - 5)$ moves roots **right** by 5; $f(2x)$ **halves** them; $f\\left(\\frac13 x\\right)$ triples them.",
      "**Cancelling terms** rather than factors in a rational expression.",
      "**Sign of an area** — a region below the axis has a negative integral; state the area as positive."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Roots of a cubic", "**Equation → Polynomial → 3**. Confirms your roots — and a complex pair from the calculator confirms \"only one real root\". Never the working."],
      ["Testing a factor", "Store $-3$ in $x$, type the polynomial, EXE: $0$ means factor. Faster than long division for choosing which value to try."]
    ] },
    { callout: { t: "mnemonic", h: "\"Factor $(x - a)$, plug in $a$; factor $(ax - b)$, plug in $b$ over $a$\"", body: "The sign flips and the fraction inverts. $(3x + 2) \\to f\\left(-\\frac23\\right)$." } },
    { callout: { t: "mnemonic", h: "\"Ends first, middle checks\"", body: "Inspection: the outer terms of the quadratic factor are forced by the cubic's leading and constant terms; the middle is found from one coefficient and **checked** with the other." } }
  ],
  flashcards: [
    ["Factor theorem?", "$(x - a)$ is a factor of $f(x)$ $\\iff$ $f(a) = 0$; $(ax - b)$ is a factor $\\iff$ $f(\\frac{b}{a}) = 0$."],
    ["$(x + 3)$ is a factor of $3x^3 + 2ax^2 - 4x + 5a$: $a$?", "$f(-3) = 0 \\Rightarrow 23a = 69 \\Rightarrow a = 3$."],
    ["Divide $2x^3 + 3x^2 - 16x + 16$ by $(x + 4)$.", "$2x^2 - 5x + 4$ (discriminant $-7$: no further real factors)."],
    ["How do you prove a cubic has exactly one real root?", "Factor out the known linear factor; show the quadratic factor has $b^2 - 4ac < 0$."],
    ["Roots of $f(x) = 0$ are $-3, 2, 4$. Roots of $f(x - 5) = 0$? Of $f(2x) = 0$?", "$2, 7, 9$ (shift right 5); $-\\frac32, 1, 2$ (halve)."],
    ["Why does a repeated factor $(2x - 5)^2$ make the curve touch the axis?", "The factor is a square, so it is $\\ge 0$ on both sides of $x = \\frac52$ — the sign of $f$ does not change there."],
    ["Factorise completely $9x - x^3$.", "$x(3 - x)(3 + x)$."],
    ["$\\frac{(x+3)(x-2)(x+2)}{x(x+2)(x+3)}$ simplified?", "$\\frac{x - 2}{x} = 1 - \\frac2x$."],
    ["$g(x) = (x + 2)(2x - 5)^2$: solve $g(x) \\le 0$.", "$x \\le -2$, or $x = \\frac52$."],
    ["Why is the remainder on dividing by $(x - a)$ equal to $f(a)$?", "$f(x) = (x - a)Q(x) + R$; put $x = a$ to get $f(a) = R$."],
    ["$4x^3 + 5x^2 - 10x + 4a$ has factor $(x - a)$: what equation in $a$?", "$f(a) = 0 \\Rightarrow a(4a^2 + 5a - 6) = 0$."],
    ["Number of solutions of $\\tan\\theta = 2$ for $7\\pi \\le \\theta < 10\\pi$?", "3 — one per period of $\\tan$, and the interval is $3\\pi$ long."]
  ],
  quiz: [
    { q: "$(x - 2)$ is a factor of $f(x)$ means", opts: ["$f(2) = 0$", "$f(-2) = 0$", "$f(0) = 2$", "$f'(2) = 0$"], ans: 0, why: "Factor theorem." },
    { q: "$(2x + 1)$ is a factor means", opts: ["$f(\\tfrac12) = 0$", "$f(-\\tfrac12) = 0$", "$f(-2) = 0$", "$f(2) = 0$"], ans: 1, why: "$2x + 1 = 0 \\Rightarrow x = -\\frac12$." },
    { q: "$x^3 - 7x + 6$ divided by $(x - 1)$ is", opts: ["$x^2 + x - 6$", "$x^2 - x - 6$", "$x^2 + x + 6$", "$x^2 - 6$"], ans: 0, why: "$(x-1)(x^2 + x - 6)$: check $x$ term $-6 - 1 = -7$." },
    { q: "$f(x) = (x + 1)(x^2 + x + 1)$ has how many real roots?", opts: ["3", "2", "1", "0"], ans: 2, why: "Discriminant $1 - 4 < 0$." },
    { q: "Roots of $f$ are $1, 3, 5$. Roots of $f(x + 2) = 0$:", opts: ["$3, 5, 7$", "$-1, 1, 3$", "$2, 6, 10$", "$1, 3, 5$"], ans: 1, why: "$x + 2 = 1, 3, 5$." },
    { q: "$y = (x - 1)^2(x + 3)$ meets the $x$-axis", opts: ["crossing at 1, crossing at −3", "touching at 1, crossing at −3", "touching at both", "crossing at 1 only"], ans: 1, why: "Squared factor touches." },
    { q: "$\\frac{x^2 - 9}{x^2 + 3x} =$", opts: ["$\\frac{x - 3}{x}$", "$\\frac{-9}{3x}$", "$x - 3$", "$\\frac{x + 3}{x}$"], ans: 0, why: "$\\frac{(x-3)(x+3)}{x(x+3)}$." },
    { q: "\"Show $(x + 2)$ is a factor using the factor theorem\" — acceptable evidence:", opts: ["long division with zero remainder", "$f(-2) = 0$ shown, conclusion stated", "the calculator's root list", "$f(2) = 0$"], ans: 1, why: "The named method must be used." }
  ]
};

/* =====================================================================
   2.7  Graphs of functions, the modulus of a linear function, proportion
   ===================================================================== */
C["maths:2.7"] = {
  notes: [
    { h: "Graphs of functions — the whole topic on one page" },
    "Spec 2.7 is the sketching toolkit: cubics and quartics from their factors, the reciprocal curves $y = \\frac{a}{x}$ and $y = \\frac{a}{x^2}$ with their asymptotes, the modulus of a linear function, reading solutions of equations and inequalities off intersections, and proportion. Every sketch question is marked on the same things: **shape, intercepts, turning points, asymptotes — labelled**.",
    { ul: [
      "**Polynomial sketches**: roots from factors, a repeated factor touches, the sign of the leading coefficient fixes the ends.",
      "**Reciprocal graphs**: two branches, both axes as asymptotes; translations move the asymptotes.",
      "**Modulus** $y = |ax + b|$: a V with vertex on the $x$-axis; $y = a|x - h| + k$ has vertex $(h, k)$. Equations and inequalities are solved branch by branch — or by a sketch.",
      "**Intersections solve equations**: $y = k$ meets a cubic three times only for $k$ between the turning values.",
      "**Proportion**: $y \\propto x$ is a straight line through the origin; $y \\propto \\frac1x$ is a reciprocal curve."
    ] },

    { page: "Cubics, quartics and reciprocals" },
    { h: "Sketching a factorised polynomial" },
    { callout: { t: "memorise", h: "Four things fix a polynomial sketch", body: [
      "1. **Roots** — each linear factor $(x - a)$ gives a crossing at $a$; a squared factor $(x - a)^2$ gives a **touch**; a cubed factor gives a flat crossing.",
      "2. **$y$-intercept** — put $x = 0$.",
      "3. **Ends** — positive leading coefficient: a cubic goes down-left, up-right; a quartic goes up at both ends. Negative flips both.",
      "4. **Turning points** — between consecutive roots there is at least one; find them by differentiating only if the question asks."
    ] } },
    { fig: { x: [-3, 7], y: [-90, 30], axes: { xt: [-1, 2, 5], yt: [-75, -50, -25] }, items: [
      { fn: "-3*(x+1)^2*(x-5)^2", label: "y = −3(x + 1)²(x − 5)²", at: 6.3, pos: "w" },
      { pt: [-1, 0], label: "(−1, 0)", pos: "n" }, { pt: [5, 0], label: "(5, 0)", pos: "n" }, { pt: [0, -75], label: "(0, −75)", pos: "e" }, { pt: [2, -81], label: "min at x = 2", pos: "s" }
    ], cap: "A negative quartic with two double roots: it touches the axis at $-1$ and $5$ from below, and the ends go down." } },
    { worked: { tag: "exam", title: "Read a cubic from its sketch: where $f' < 0$, when $y = k$ meets once, and its equation", src: "A-level June 2022 · P1 Q6 · 6 marks",
      q: "A cubic curve $C$, $y = f(x)$, passes through the origin, has a maximum turning point at $(2, 8)$ and a minimum turning point at $(6, 0)$. **(a)** Write down the set of values of $x$ for which $f'(x) < 0$. **(b)** The line $y = k$ intersects $C$ at only one point. Find the set of values of $k$, in set notation. **(c)** Find the equation of $C$ (factorised form allowed).",
      steps: [
        { h: "(a) Decreasing between the maximum and the minimum", m: "$\\{x : 2 < x < 6\\}$", mk: "B1", n: "$f' < 0$ where the curve goes downhill — strictly between the turning points." },
        { h: "(b) A horizontal line meets a cubic once when it is above the max or below the min", m: "$\\{k : k < 0\\} \\cup \\{k : k > 8\\}$", mk: "M1 A1", n: "At $k = 0$ it meets twice (touch at 6, cross at 0); at $k = 8$ twice too. Strict inequalities." },
        { h: "(c) Root at 0, double root at 6", m: "$y = ax(x - 6)^2$; through $(2, 8)$: $8 = 2a \\times 16 \\Rightarrow a = \\dfrac14$", mk: "M1 A1 A1", fig: { x: [-1.5, 8], y: [-4, 14], axes: { xt: [2, 6], yt: [4, 8, 12] }, items: [ { fn: "0.25*x*(x-6)^2", label: "y = ¼x(x − 6)²", at: 7.3, pos: "w" }, { pt: [2, 8], label: "(2, 8)", pos: "n" }, { pt: [6, 0], label: "(6, 0)", pos: "s" }, { hline: 8, c: "muted" }, { shade: { fn: "0", fn2: "-4", from: -1.5, to: 8 }, c: "danger", alpha: 0.07 } ], cap: "A minimum *on* the axis is a repeated root, hence the $(x - 6)^2$." }, n: "$y = \\frac14 x(x - 6)^2$. The minimum touching the axis is the giveaway for the squared factor." }
      ], result: "(a) $2 < x < 6$ (b) $\\{k : k < 0\\} \\cup \\{k : k > 8\\}$ (c) $y = \\frac14 x(x - 6)^2$" } },
    { worked: { tag: "exam", title: "Quartic from its sketch — where $f'(x) \\ge 0$", src: "A-level June 2025 · P1 Q7 · 7 marks",
      q: "A quartic curve $C$, $y = f(x)$, has maximum turning points at $(-1, 0)$ and $(5, 0)$, crosses the $y$-axis at $(0, -75)$ and has a minimum turning point at $x = 2$. **(a)** Find the set of values of $x$ for which $f'(x) \\ge 0$, in set notation. **(b)** Find an equation for $C$.",
      steps: [
        { h: "(a) Uphill or flat: up to the first max, and from the min to the second max", m: "$\\{x : x \\le -1\\} \\cup \\{x : 2 \\le x \\le 5\\}$", mk: "M1 A1", n: "Include the turning points themselves ($f' = 0$ there) because the inequality is $\\ge$." },
        { h: "(b) Maxima on the axis are double roots", m: "$y = a(x + 1)^2(x - 5)^2$; at $(0, -75)$: $25a = -75 \\Rightarrow a = -3$\n$y = -3(x + 1)^2(x - 5)^2$", mk: "M1 A1 M1 A1", n: "Negative $a$ because the curve is below the axis (the $y$-intercept is negative and the ends point down). Symmetry about $x = 2$ confirms the minimum's position." }
      ], result: "(a) $\\{x : x \\le -1\\} \\cup \\{x : 2 \\le x \\le 5\\}$ (b) $y = -3(x + 1)^2(x - 5)^2$" } },
    { h: "Reciprocal graphs" },
    { fig: { x: [-5, 5], y: [-5, 5], axes: { grid: false, xt: [-3, 3], yt: [-3, 3] }, items: [
      { fn: "2/x", from: -5, to: -0.4, label: "y = 2/x", at: -4.5, pos: "s" }, { fn: "2/x", from: 0.4, to: 5 },
      { fn: "2/(x*x)", from: -5, to: -0.63, c: "accent3", label: "y = 2/x²", at: 1.2, pos: "e" }, { fn: "2/(x*x)", from: 0.63, to: 5, c: "accent3" }
    ], cap: "$y = \\frac{a}{x}$ ($a > 0$): quadrants 1 and 3, odd symmetry. $y = \\frac{a}{x^2}$: both branches above the axis, even symmetry. Both have the axes as asymptotes." } },
    { kv: [
      ["Asymptotes of $y = \\frac{a}{x + b} + c$", "Vertical $x = -b$ (where the denominator is zero); horizontal $y = c$ (what is left as $x \\to \\pm\\infty$). Draw them **dashed and labelled** — they carry marks."],
      ["Intercepts", "$y$-axis: $x = 0$ if allowed. $x$-axis: solve $\\frac{a}{x + b} + c = 0$."],
      ["Which quadrants", "Sign of $a$: positive → first/third relative to the asymptotes; negative → second/fourth."],
      ["Inequalities such as $\\frac{16}{x} \\le 2$", "Sketch $y = \\frac{16}{x}$ and $y = 2$, find the crossing ($x = 8$), read off: $x < 0$ or $x \\ge 8$ (topic 2.5)."]
    ] },

    { page: "The modulus function" },
    { callout: { t: "memorise", h: "$|x|$ and the graph of $y = |ax + b|$", body: [
      "$|x| = x$ for $x \\ge 0$ and $|x| = -x$ for $x < 0$: the distance from zero, never negative.",
      "$y = |ax + b|$: draw $y = ax + b$, then **reflect the part below the axis** upward. A V with vertex at $\\left(-\\frac{b}{a}, 0\\right)$, arms of gradient $\\pm a$.",
      "$y = a|x - h| + k$: vertex $(h, k)$, arms of gradient $\\pm a$ — opens up if $a > 0$, down if $a < 0$."
    ] } },
    { fig: { x: [-3, 6], y: [-1, 8], axes: { xt: [-2, 2.5, 4], yt: [2, 5, 7] }, items: [
      { fn: "abs(2*x-5)", label: "y = |2x − 5|", at: 5.5, pos: "w" }, { pt: [2.5, 0], label: "(5/2, 0)", pos: "s" }, { pt: [0, 5], label: "(0, 5)", pos: "w" },
      { hline: 7, c: "accent3" }, { text: [2.5, 7], t: "y = 7", c: "accent3", pos: "n", size: 11.5 }, { pt: [-1, 7], c: "accent3", label: "(−1, 7)", pos: "n" }, { pt: [6, 7], c: "accent3", label: "(6, 7)", pos: "s" }
    ], cap: "$|2x - 5| > 7$ is where the V is above the line $y = 7$: $x < -1$ or $x > 6$. The V's vertex is where the inside is zero." } },
    { h: "Solving with a modulus" },
    { ol: [
      "**Sketch** both sides — it tells you how many solutions to expect and which branch each lives on.",
      "**Branch 1** (inside $\\ge 0$): drop the bars. **Branch 2** (inside $< 0$): replace $|u|$ by $-u$.",
      "**Check** each solution belongs to its branch (or substitute back). Discard the ones that do not.",
      "For $|u| = |v|$, square both sides or use $u = \\pm v$. For $|u| > k$: $u > k$ or $u < -k$; for $|u| < k$: $-k < u < k$."
    ] },
    { worked: { tag: "exam", title: "Sketch $y = |2x - 5|$; solve two inequalities", src: "A-level Specimen · P2 Q4 · 6 marks",
      q: "**(a)** Sketch $y = |2x - 5|$, stating the coordinates of any points where it cuts or meets the axes. **(b)** Find the values of $x$ which satisfy $|2x - 5| > 7$. **(c)** Find the values of $x$ which satisfy $|2x - 5| > x - \\frac52$, in set notation.",
      steps: [
        { h: "(a)", m: "V with vertex $\\left(\\dfrac52, 0\\right)$, $y$-intercept $(0, 5)$.", mk: "B1 B1" },
        { h: "(b) Two branches", m: "$2x - 5 > 7 \\Rightarrow x > 6; \\qquad 2x - 5 < -7 \\Rightarrow x < -1$", mk: "M1 A1", n: "Or: critical values from $2x - 5 = \\pm7$, then outside." },
        { h: "(c) Compare the line $y = x - \\frac52$ with the V", m: "The line has gradient 1 and passes through the vertex $\\left(\\frac52, 0\\right)$ — it is **half** of the right-hand arm. So the V is above it everywhere except at the vertex itself, where they are equal.", mk: "M1", n: "Sketching first is what makes this 2-mark part trivial; algebra alone is confusing." },
        { m: "$\\{x : x < \\tfrac52\\} \\cup \\{x : x > \\tfrac52\\}$", mk: "A1", n: "All real $x$ except $\\frac52$, because at $x = \\frac52$ the inequality is $0 > 0$, which is false." }
      ], result: "(b) $x < -1$ or $x > 6$ (c) $\\{x : x < \\frac52\\} \\cup \\{x : x > \\frac52\\}$" } },
    { worked: { tag: "exam", title: "$|3 - 2x| = 7 + x$ — both branches, both valid", src: "A-level June 2022 · P2 Q1 · 4 marks",
      q: "Solve $|3 - 2x| = 7 + x$. (Solutions relying entirely on calculator technology are not acceptable.)",
      steps: [
        { h: "Branch 1: $3 - 2x = 7 + x$", m: "$-4 = 3x \\Rightarrow x = -\\dfrac43$", mk: "M1 A1", n: "Check: $|3 + \\frac83| = \\frac{17}{3}$ and $7 - \\frac43 = \\frac{17}{3}$ ✓" },
        { h: "Branch 2: $-(3 - 2x) = 7 + x$", m: "$2x - 3 = 7 + x \\Rightarrow x = 10$", mk: "M1 A1", n: "Check: $|3 - 20| = 17$ and $7 + 10 = 17$ ✓. Both branches are genuine here; a sketch (V with vertex at $\\frac32$, line of gradient 1 through $(0, 7)$) shows two crossings." }
      ], result: "$x = -\\dfrac43$ or $x = 10$" } },
    { worked: { tag: "exam", title: "Vertex, an equation, and the gradients for which a line through the origin meets the graph", src: "A-level Oct 2020 · P2 Q11 · 7 marks",
      q: "The graph $y = 2|x + 4| - 5$ has vertex $P$. **(a)** Find the coordinates of $P$. **(b)** Solve $3x + 40 = 2|x + 4| - 5$. **(c)** The line $y = ax$ intersects $y = 2|x + 4| - 5$ at least once. Find the range of possible values of $a$, in set notation.",
      steps: [
        { h: "(a)", m: "Inside zero at $x = -4$: $P = (-4, -5)$", mk: "B1 B1" },
        { h: "(b) Try each branch", m: "$x \\ge -4$: $3x + 40 = 2x + 8 - 5 \\Rightarrow x = -37$ — **not** $\\ge -4$, reject.\n$x < -4$: $3x + 40 = -2x - 8 - 5 \\Rightarrow 5x = -53 \\Rightarrow x = -\\dfrac{53}{5}$ ✓", mk: "M1 A1", n: "One branch gives a phantom solution. Always test against the branch condition." },
        { h: "(c) Lines through the origin against the two arms", m: "Right arm $y = 2x + 3$ (gradient 2, above the origin): $y = ax$ meets it only if $a > 2$.\nLeft arm $y = -2x - 13$ for $x < -4$: $ax = -2x - 13 \\Rightarrow x = -\\dfrac{13}{a + 2}$; this is $< -4$ when $a \\le \\dfrac54$ (equality is the line through $P$).", mk: "M1 A1", fig: { x: [-14, 6], y: [-8, 12], axes: { xt: [-10, -4, 4], yt: [-5, 5, 10] }, items: [ { fn: "2*abs(x+4)-5", label: "y = 2|x + 4| − 5", at: 4, pos: "w" }, { fn: "1.25*x", c: "accent3", dash: true, label: "a = 5/4", at: -10, pos: "s" }, { fn: "2*x", c: "danger", dash: true, label: "a = 2", at: 3, pos: "e" }, { pt: [-4, -5], label: "P", pos: "s" } ], cap: "Between the dashed lines ($\\frac54 < a \\le 2$) a line through $O$ misses both arms." } },
        { m: "$\\{a : a \\le \\tfrac54\\} \\cup \\{a : a > 2\\}$", mk: "A1", n: "$a = 2$ is excluded — parallel to the right arm and missing the left one." }
      ], result: "(a) $(-4, -5)$ (b) $x = -\\frac{53}{5}$ (c) $\\{a : a \\le \\frac54\\} \\cup \\{a : a > 2\\}$" } },
    { worked: { tag: "exam", title: "Line with a fixed intercept meeting a V at two points", src: "A-level June 2024 · P1 Q6 · 6 marks",
      q: "$y = 3|x - 2| + 5$ has vertex $P$. **(a)** Find $P$. **(b)** Solve $16 - 4x = 3|x - 2| + 5$. **(c)** The line $y = kx + 4$ intersects $y = 3|x - 2| + 5$ at two distinct points. Find the range of values of $k$.",
      steps: [
        { h: "(a)", m: "$P = (2, 5)$", mk: "B1 B1" },
        { h: "(b)", m: "$x \\ge 2$: $16 - 4x = 3x - 6 + 5 \\Rightarrow 7x = 17 \\Rightarrow x = \\dfrac{17}{7}$ ✓ ($\\ge 2$)\n$x < 2$: $16 - 4x = -3x + 6 + 5 \\Rightarrow x = 5$ ✗", mk: "M1 A1" },
        { h: "(c) The line pivots about $(0, 4)$, which is below $P$", m: "Through $P$: $k = \\dfrac{5 - 4}{2} = \\dfrac12$. Parallel to the right arm: $k = 3$.\nTwo intersections for $\\dfrac12 < k < 3$.", mk: "M1 A1", n: "For $k \\le \\frac12$ the line is too flat to reach the right arm twice (at $k = \\frac12$ it passes through the vertex — one point); at $k = 3$ it is parallel to the right arm; for $k > 3$ it crosses only the left arm." }
      ], result: "(a) $(2, 5)$ (b) $x = \\frac{17}{7}$ (c) $\\frac12 < k < 3$" } },
    { worked: { tag: "exam", title: "Modulus inside a composite; no solutions of $f(x) = kx$", src: "A-level June 2025 · P2 Q12 · 8 marks",
      q: "$f(x) = 4|x - 3| - 5$, $x \\in \\mathbb{R}$. **(a)** Given $|a| = 1$, find the possible values of $f(a)$. $g(x) = 2x + 17$. **(b)** Find the range of $gf(x)$. **(c)** Find the range of values of $k$ for which $f(x) = kx$ has no solutions.",
      steps: [
        { h: "(a) $a = \\pm1$", m: "$f(1) = 4(2) - 5 = 3, \\qquad f(-1) = 4(4) - 5 = 11$", mk: "M1 A1" },
        { h: "(b) $gf(x) = 2f(x) + 17$ and $f(x) \\ge -5$", m: "$gf(x) \\ge 2(-5) + 17 = 7$", mk: "M1 A1", n: "The minimum of $f$ is at its vertex $(3, -5)$; $g$ is increasing, so the minimum of $gf$ is $g(-5)$." },
        { h: "(c) Lines through the origin that miss both arms", m: "Vertex $(3, -5)$; right arm $y = 4x - 17$, left arm $y = -4x + 7$ (for $x < 3$).\nThrough the vertex: $k = -\\dfrac53$. Parallel to the left arm: $k = -4$.\nNo solutions for $-4 \\le k < -\\dfrac53$.", mk: "M1 A1 A1", n: "$k = -4$ included (parallel to the left arm, and the right arm is not reached); $k = -\\frac53$ excluded (one solution at the vertex). Sketch it — the gap is the wedge between the vertex line and the left arm's direction." }
      ], result: "(a) $3$ or $11$ (b) $gf(x) \\ge 7$ (c) $-4 \\le k < -\\frac53$" } },
    { worked: { tag: "exam", title: "A modulus model: two subscriber counts", src: "modelled on A-level June 2023 · P2 Q12",
      q: "Two streaming companies are monitored from $t = 0$ years. Company A: $N_A = |t - 3| + 4$ (thousands); company B: $N_B = 8 - |2t - 6|$. **(a)** Find the values of $t$ at which the two companies have the same number of subscribers. **(b)** Find the maximum number of subscribers company B has, and when. **(c)** Give one limitation of the models.",
      steps: [
        { h: "(a) Equate, branch by branch", m: "For $t > 3$: $t - 3 + 4 = 8 - (2t - 6) \\Rightarrow t + 1 = 14 - 2t \\Rightarrow t = \\dfrac{13}{3}$\nFor $t < 3$: $3 - t + 4 = 8 + (2t - 6) \\Rightarrow 7 - t = 2t + 2 \\Rightarrow t = \\dfrac53$", mk: "M1 A1 A1", n: "Both V's have their vertex at $t = 3$ (A's minimum 4, B's maximum 8), so the graphs cross once on each side." },
        { h: "(b)", m: "$N_B$ is largest when $|2t - 6| = 0$: $t = 3$, $N_B = 8$ thousand.", mk: "B1" },
        { h: "(c)", m: "Subscriber numbers change in steps, not continuously; B's model reaches 0 at $t = 7$ and goes negative after — not sensible; the models ignore market events.", mk: "B1" }
      ], result: "(a) $t = \\frac53$ and $t = \\frac{13}{3}$ (b) 8000 at $t = 3$" } },

    { page: "Proportion" },
    { kv: [
      ["Direct proportion $y \\propto x$", "$y = kx$: a straight line through the origin with gradient $k$. Doubling $x$ doubles $y$."],
      ["Inverse proportion $y \\propto \\frac1x$", "$y = \\frac{k}{x}$: a reciprocal curve; $xy = k$ is constant. Doubling $x$ halves $y$."],
      ["Other powers", "$y \\propto x^2$ (parabola through $O$), $y \\propto \\sqrt x$, $y \\propto \\frac{1}{x^2}$ (e.g. light intensity with distance)."],
      ["Finding $k$", "Substitute one known pair. \"The circumference of a semicircle is proportional to its diameter\": $C = kd$; with $C = \\frac{\\pi d}{2} + d$, $k = \\frac{\\pi}{2} + 1$."],
      ["In models (2.11)", "Pressure and volume of a gas at fixed temperature: $p \\propto \\frac1V$; the graph of $p$ against $\\frac1V$ is a straight line through $O$ — a way to test the model from data."]
    ] },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Sketch … stating the coordinates of any points where the curve cuts or meets the axes**", "correct shape; every intercept with coordinates; a touch shown as a touch"],
      ["**State the equations of any asymptotes**", "\"$x = \\ldots$\" and \"$y = \\ldots$\" as equations, not \"the $y$-axis\""],
      ["**Find the coordinates of the vertex**", "where the inside of the modulus is zero, and the value there"],
      ["**Solve** an equation with a modulus", "both branches, each answer checked against its branch"],
      ["**Find the range of values of $k$ for which … intersects at …**", "the critical gradients: through the vertex, and parallel to an arm; then which side of each"],
      ["**Write down the set of values for which $f'(x) < 0$**", "the $x$-intervals where the sketch is going downhill"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Phantom solutions** from a modulus branch not checked against its condition.",
      "**Vertex with the wrong sign**: $|x + 4|$ has its vertex at $x = -4$.",
      "**Asymptotes not drawn or not labelled**; a branch drawn crossing an asymptote.",
      "**A double root drawn as a crossing**.",
      "**Non-strict vs strict** in \"meets at one point\": the boundary values are usually excluded.",
      "**Using the wrong set notation**: $\\cup$ for two separate intervals."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Modulus key", "**Abs** is in CATALOG → Numeric (also as a template). Checking a solution: type $\\text{Abs}(3 - 2 \\times 10) - (7 + 10)$ and expect 0."],
      ["Table for a sketch", "Table app with $f(x) = 2\\text{Abs}(x + 4) - 5$ from $-10$ to $2$ step $1$ shows the V and its vertex row."]
    ] },
    { callout: { t: "mnemonic", h: "\"Inside zero, that's the vertex; drop the bars, then flip the bars\"", body: "Vertex where the inside is zero; branch 1 drops the modulus bars, branch 2 negates what was inside." } }
  ],
  flashcards: [
    ["Effect of a squared factor $(x - a)^2$ on a sketch?", "The curve touches the axis at $x = a$ without crossing."],
    ["Asymptotes of $y = \\frac{2}{x + 3} - 1$?", "$x = -3$ and $y = -1$."],
    ["Vertex of $y = 2|x + 4| - 5$?", "$(-4, -5)$."],
    ["Solve $|2x - 5| > 7$.", "$x > 6$ or $x < -1$."],
    ["Solve $|3 - 2x| = 7 + x$.", "$x = -\\frac43$ or $x = 10$ (both check)."],
    ["Cubic through $O$ with max $(2, 8)$ and min $(6, 0)$?", "$y = \\frac14 x(x - 6)^2$."],
    ["Quartic with maxima $(-1, 0)$, $(5, 0)$ and $y$-intercept $-75$?", "$y = -3(x + 1)^2(x - 5)^2$."],
    ["$y = 3|x - 2| + 5$ and $y = kx + 4$ meet twice for…", "$\\frac12 < k < 3$: between the vertex line and the arm's gradient."],
    ["How do you test a modulus branch solution?", "Check it satisfies the branch condition (inside $\\ge 0$ or $< 0$), or substitute back."],
    ["$y \\propto \\frac1x$ — what graph, and what is constant?", "A reciprocal curve; $xy = k$."],
    ["Where is a cubic $f'(x) < 0$?", "Strictly between its maximum and minimum turning points."],
    ["Range of $gf(x)$ where $f(x) = 4|x - 3| - 5$, $g(x) = 2x + 17$?", "$f \\ge -5$ so $gf \\ge 7$."]
  ],
  quiz: [
    { q: "$y = (x + 2)(x - 1)^2$ meets the $x$-axis", opts: ["crossing at both", "crossing at −2, touching at 1", "touching at −2, crossing at 1", "touching at both"], ans: 1, why: "Squared factor touches." },
    { q: "Vertical asymptote of $y = \\frac{3}{x - 5} + 2$:", opts: ["$x = 5$", "$x = -5$", "$y = 2$", "$x = 2$"], ans: 0, why: "Denominator zero." },
    { q: "Vertex of $y = |3x - 6| + 1$:", opts: ["$(2, 1)$", "$(-2, 1)$", "$(6, 1)$", "$(2, 0)$"], ans: 0, why: "Inside zero at $x = 2$." },
    { q: "$|x - 1| < 4$ gives", opts: ["$x < 5$", "$-3 < x < 5$", "$x < -3$ or $x > 5$", "$-4 < x < 4$"], ans: 1, why: "$-4 < x - 1 < 4$." },
    { q: "A positive cubic with roots $-2, 1, 3$ is negative for", opts: ["$x < -2$ and $1 < x < 3$", "$-2 < x < 1$", "$x > 3$", "all $x$"], ans: 0, why: "Starts negative, alternates at each simple root." },
    { q: "$y = |2x - 5|$ cuts the $y$-axis at", opts: ["$(0, -5)$", "$(0, 5)$", "$(0, 2.5)$", "$(0, 0)$"], ans: 1, why: "$|{-5}| = 5$." },
    { q: "$y = k$ meets a cubic with max value 8 and min value 0 exactly once when", opts: ["$0 < k < 8$", "$k < 0$ or $k > 8$", "$k = 0$", "$k = 8$"], ans: 1, why: "Outside the turning values." },
    { q: "If $y \\propto \\frac{1}{x^2}$ and $x$ doubles, $y$ is", opts: ["halved", "doubled", "quartered", "quadrupled"], ans: 2, why: "$\\frac{1}{(2x)^2} = \\frac14 \\cdot \\frac{1}{x^2}$." }
  ]
};

/* =====================================================================
   2.8  Composite and inverse functions
   ===================================================================== */
C["maths:2.8"] = {
  notes: [
    { h: "Functions — the whole topic on one page" },
    "A function is a rule that sends every input in its **domain** to exactly one output; the set of outputs is the **range**. The exam tests four things, usually together in one 8–13 mark question:",
    { ul: [
      "**Evaluate** a composite: $fg(2)$ means *do $g$ first*, then $f$.",
      "**Find the range** — from a sketch, from the completed square, or from the behaviour of a rational function.",
      "**Find an inverse** $f^{-1}$, with its domain (= the range of $f$), by swapping and rearranging.",
      "**Explain** why a function has no inverse (many-to-one), or **use** $f^{-1}(x) = y \\iff f(y) = x$ to solve an equation without finding the inverse."
    ] },
    { table: { head: ["Notation", "Meaning"], rows: [
      ["$f : x \\mapsto 3x - 5$, $x \\in \\mathbb{R}$", "$f(x) = 3x - 5$ with domain all real numbers"],
      ["$fg(x)$", "$f(g(x))$: apply $g$, then $f$"],
      ["$f^{-1}(x)$", "the inverse function; $ff^{-1}(x) = f^{-1}f(x) = x$"],
      ["one-to-one", "every output comes from exactly one input — a horizontal line meets the graph at most once; only these have inverses"],
      ["many-to-one", "two inputs share an output (e.g. $x^2$); no inverse unless the domain is restricted"],
      ["domain of $f^{-1}$", "= range of $f$; and range of $f^{-1}$ = domain of $f$"]
    ] } },

    { page: "Composites and ranges" },
    { worked: { tag: "exam", title: "$gg(5)$, the range, and the inverse with its domain", src: "A-level June 2018 · P2 Q1 · 6 marks",
      q: "$g(x) = \\frac{2x + 5}{x - 3}$, $x \\ge 5$. **(a)** Find $gg(5)$. **(b)** State the range of $g$. **(c)** Find $g^{-1}(x)$, stating its domain.",
      steps: [
        { h: "(a) Inside first", m: "$g(5) = \\dfrac{15}{2}; \\qquad g\\left(\\dfrac{15}{2}\\right) = \\dfrac{15 + 5}{\\frac{15}{2} - 3} = \\dfrac{20}{\\frac92} = \\dfrac{40}{9}$", mk: "M1 A1" },
        { h: "(b) Behaviour on $x \\ge 5$", m: "$g(x) = 2 + \\dfrac{11}{x - 3}$ is decreasing, from $g(5) = \\dfrac{15}{2}$ towards $2$ (never reached).\nRange: $2 < g(x) \\le \\dfrac{15}{2}$", mk: "B1", n: "Writing $\\frac{2x + 5}{x - 3}$ as $2 + \\frac{11}{x - 3}$ (division) shows the horizontal asymptote $y = 2$ at once." },
        { h: "(c) Swap and rearrange", m: "$y = \\dfrac{2x + 5}{x - 3} \\Rightarrow y(x - 3) = 2x + 5 \\Rightarrow xy - 2x = 3y + 5 \\Rightarrow x = \\dfrac{3y + 5}{y - 2}$\n$g^{-1}(x) = \\dfrac{3x + 5}{x - 2}$, domain $2 < x \\le \\dfrac{15}{2}$", mk: "M1 A1 B1", n: "Collect the $x$ terms on one side, factorise $x$ out, divide. The domain of $g^{-1}$ is the range of $g$ — the B1 is for stating it." }
      ], result: "(a) $\\frac{40}{9}$ (b) $2 < g(x) \\le \\frac{15}{2}$ (c) $g^{-1}(x) = \\frac{3x + 5}{x - 2}$, $2 < x \\le \\frac{15}{2}$" } },
    { worked: { tag: "exam", title: "Range of a quadratic on a restricted domain; why no inverse", src: "A-level Specimen · P1 Q10(c)(d)(e) · 6 marks",
      q: "$f : x \\mapsto \\frac{3x - 5}{x + 1}$, $x \\neq -1$, and $g : x \\mapsto x^2 - 3x$, $0 \\le x \\le 5$. **(c)** Find $fg(2)$. **(d)** Find the range of $g$. **(e)** Explain why $g$ does not have an inverse.",
      steps: [
        { h: "(c)", m: "$g(2) = 4 - 6 = -2; \\qquad f(-2) = \\dfrac{-6 - 5}{-1} = 11$", mk: "M1 A1" },
        { h: "(d) Complete the square, then check the ends of the domain", m: "$g(x) = \\left(x - \\dfrac32\\right)^2 - \\dfrac94$: minimum $-\\dfrac94$ at $x = \\dfrac32$ (inside the domain). Ends: $g(0) = 0$, $g(5) = 10$.\nRange: $-\\dfrac94 \\le g(x) \\le 10$", mk: "M1 A1 A1", fig: { x: [-1, 6], y: [-4, 12], axes: { xt: [1.5, 5], yt: [-2.25, 5, 10] }, items: [ { fn: "x*x-3*x", from: 0, to: 5, label: "y = g(x)", at: 4.6, pos: "w" }, { pt: [0, 0], label: "(0, 0)", pos: "nw" }, { pt: [5, 10], label: "(5, 10)", pos: "w" }, { pt: [1.5, -2.25], label: "(3/2, −9/4)", pos: "s" }, { hline: 0, c: "accent3", dash: true }, { pt: [3, 0], c: "accent3", label: "(3, 0)", pos: "ne" } ], cap: "The horizontal line $y = 0$ meets the curve twice — so $g$ is many-to-one." }, n: "Range = from the minimum to the higher end. Forgetting the vertex (just evaluating the ends) gives $0 \\le g \\le 10$ and loses two marks." },
        { h: "(e)", m: "$g$ is many-to-one: e.g. $g(0) = g(3) = 0$, so a single output would need two inputs and $g^{-1}$ is not a function.", mk: "B1", n: "Give a concrete pair or refer to the sketch." }
      ], result: "(c) 11 (d) $-\\frac94 \\le g(x) \\le 10$ (e) many-to-one" } },
    { worked: { tag: "exam", title: "A piecewise function: $gg(0)$, $g(x) > 28$, and which piece has an inverse", src: "A-level June 2019 · P2 Q6 · 10 marks",
      q: "$g(x) = (x - 2)^2 + 1$ for $x \\le 2$ and $g(x) = 4x - 7$ for $x > 2$. **(a)** Find $gg(0)$. **(b)** Find all values of $x$ for which $g(x) > 28$. $h(x) = (x - 2)^2 + 1$, $x \\le 2$. **(c)** Explain why $h$ has an inverse but $g$ does not. **(d)** Solve $h^{-1}(x) = -\\frac12$.",
      steps: [
        { h: "(a) Which piece? $0 \\le 2$, then $5 > 2$", m: "$g(0) = 4 + 1 = 5; \\qquad g(5) = 20 - 7 = 13$", mk: "M1 A1" },
        { h: "(b) Each piece separately", m: "Left: $(x - 2)^2 + 1 > 28 \\Rightarrow (x - 2)^2 > 27 \\Rightarrow x - 2 < -\\sqrt{27}$ (since $x \\le 2$) $\\Rightarrow x < 2 - 3\\sqrt3$\nRight: $4x - 7 > 28 \\Rightarrow x > \\dfrac{35}{4}$", mk: "M1 A1 M1 A1", n: "On the left piece only the negative square root is compatible with $x \\le 2$." },
        { h: "(c)", m: "$h$ is one-to-one (the left half of a parabola, decreasing throughout), so it has an inverse. $g$ is many-to-one — e.g. $g(1) = 2$ and $g\\left(\\frac94\\right) = 2$ — so it has none.", mk: "B1" },
        { h: "(d) Use $h^{-1}(x) = -\\frac12 \\iff h\\left(-\\frac12\\right) = x$", m: "$x = \\left(-\\dfrac12 - 2\\right)^2 + 1 = \\dfrac{25}{4} + 1 = \\dfrac{29}{4}$", mk: "M1 A1", n: "No need to find $h^{-1}$: an inverse equation is the original equation read backwards." }
      ], result: "(a) 13 (b) $x < 2 - 3\\sqrt3$ or $x > \\frac{35}{4}$ (d) $x = \\frac{29}{4}$" } },

    { page: "Inverses and compositions of rational functions" },
    { callout: { t: "memorise", h: "Finding $f^{-1}$", body: [
      "1. Write $y = f(x)$. 2. Rearrange to make $x$ the subject. 3. Swap the letters: $f^{-1}(x) = \\ldots$ 4. State the domain of $f^{-1}$ = the range of $f$.",
      "For $y = \\frac{ax + b}{cx + d}$: multiply out, collect $x$ terms, factorise, divide: $x = \\frac{dy - b}{a - cy}$.",
      "Graphically $y = f^{-1}(x)$ is the reflection of $y = f(x)$ in $y = x$ — so their intersections lie on $y = x$ (usually), and asymptotes swap: $x = 3$ becomes $y = 3$."
    ] } },
    { fig: { x: [-2, 8], y: [-2, 8], aspect: "equal", axes: { xt: [2, 4, 6], yt: [2, 4, 6] }, items: [
      { fn: "3+sqrt(x-2)", from: 2, to: 8, label: "y = f(x)", at: 7, pos: "s" },
      { fn: "(x-3)^2+2", from: 3, to: 5.45, c: "accent3", label: "y = f⁻¹(x)", at: 5.3, pos: "w" },
      { fn: "x", c: "muted", dash: true, label: "y = x", at: 7.5, pos: "se" },
      { pt: [2, 3], label: "(2, 3)", pos: "nw" }, { pt: [3, 2], c: "accent3", label: "(3, 2)", pos: "se" }
    ], cap: "$f(x) = 3 + \\sqrt{x - 2}$ and its inverse $f^{-1}(x) = (x - 3)^2 + 2$, $x > 3$: mirror images in $y = x$. The domain restriction on $f^{-1}$ is the half of the parabola that is actually a reflection." } },
    { worked: { tag: "exam", title: "$f^{-1}(7)$ without finding $f^{-1}$; show $ff(x)$ has a given form", src: "A-level Oct 2020 · P1 Q4 · 5 marks",
      q: "$f(x) = \\frac{3x - 7}{x - 2}$, $x \\neq 2$. **(a)** Find $f^{-1}(7)$. **(b)** Show that $ff(x) = \\frac{ax + b}{x - 3}$ where $a$ and $b$ are integers.",
      steps: [
        { h: "(a) Solve $f(x) = 7$", m: "$\\dfrac{3x - 7}{x - 2} = 7 \\Rightarrow 3x - 7 = 7x - 14 \\Rightarrow x = \\dfrac74$", mk: "M1 A1", n: "$f^{-1}(7)$ is the input that gives 7. Faster and safer than deriving $f^{-1}$." },
        { h: "(b) Substitute $f$ into itself and clear the inner fraction", m: "$ff(x) = \\dfrac{3f(x) - 7}{f(x) - 2} = \\dfrac{3(3x - 7) - 7(x - 2)}{(3x - 7) - 2(x - 2)}$", mk: "M1", n: "Multiply top and bottom by $(x - 2)$ to remove the nested fraction — write that step." },
        { m: "$= \\dfrac{9x - 21 - 7x + 14}{3x - 7 - 2x + 4} = \\dfrac{2x - 7}{x - 3}$; $\; a = 2$, $b = -7$", mk: "A1 A1" }
      ], result: "(a) $\\frac74$ (b) $ff(x) = \\frac{2x - 7}{x - 3}$" } },
    { worked: { tag: "exam", title: "$f^{-1}$ of a value; $A + \\frac{B}{2x + 3}$ form; range of $g^{-1}$; range of $fg^{-1}$", src: "A-level June 2022 · P2 Q10 · 8 marks",
      q: "$f(x) = \\frac{8x + 5}{2x + 3}$, $x > -\\frac32$. **(a)** Find $f^{-1}\\left(\\frac32\\right)$. **(b)** Show that $f(x) = A + \\frac{B}{2x + 3}$. $g(x) = 16 - x^2$, $0 \\le x \\le 4$. **(c)** State the range of $g^{-1}$. **(d)** Find the range of $fg^{-1}$.",
      steps: [
        { h: "(a)", m: "$\\dfrac{8x + 5}{2x + 3} = \\dfrac32 \\Rightarrow 16x + 10 = 6x + 9 \\Rightarrow x = -\\dfrac{1}{10}$", mk: "M1 A1" },
        { h: "(b) Divide", m: "$\\dfrac{8x + 5}{2x + 3} = \\dfrac{4(2x + 3) - 7}{2x + 3} = 4 - \\dfrac{7}{2x + 3}$: $A = 4$, $B = -7$", mk: "M1 A1", n: "Write the numerator as a multiple of the denominator plus a remainder." },
        { h: "(c) Range of $g^{-1}$ = domain of $g$", m: "$0 \\le g^{-1}(x) \\le 4$", mk: "B1" },
        { h: "(d) $fg^{-1}$ takes the outputs of $g^{-1}$ — the numbers from 0 to 4 — into $f$", m: "From (b), $f$ is **increasing** ($B < 0$, so $-\\frac{7}{2x + 3}$ rises as $x$ rises). So $fg^{-1}$ runs from $f(0) = \\dfrac53$ to $f(4) = \\dfrac{37}{11}$.\nRange: $\\dfrac53 \\le fg^{-1}(x) \\le \\dfrac{37}{11}$", mk: "M1 A1 A1", n: "Two-step reasoning: the range of the inner function becomes the domain of the outer; then use the outer's shape (monotonic here) to find the outputs." }
      ], result: "(a) $-\\frac{1}{10}$ (b) $4 - \\frac{7}{2x + 3}$ (c) $[0, 4]$ (d) $\\frac53 \\le fg^{-1}(x) \\le \\frac{37}{11}$" } },
    { worked: { tag: "exam", title: "A root function: range, inverse, $gf(6)$, and an equation $f(a^2 + 2) = g(a)$", src: "A-level June 2023 · P1 Q7 · 8 marks",
      q: "$f(x) = 3 + \\sqrt{x - 2}$, $x > 2$. **(a)** State the range of $f$. **(b)** Find $f^{-1}$. $g(x) = \\frac{15}{x - 3}$, $x \\neq 3$. **(c)** Find $gf(6)$. **(d)** Find the exact value of the constant $a$ for which $f(a^2 + 2) = g(a)$.",
      steps: [
        { h: "(a)", m: "$\\sqrt{x - 2} > 0$ for $x > 2$, so $f(x) > 3$", mk: "B1" },
        { h: "(b)", m: "$y = 3 + \\sqrt{x - 2} \\Rightarrow (y - 3)^2 = x - 2 \\Rightarrow x = (y - 3)^2 + 2$\n$f^{-1}(x) = (x - 3)^2 + 2$, $x > 3$", mk: "M1 A1 B1", n: "The domain $x > 3$ is not optional — without it $f^{-1}$ would be a full parabola, which is not the reflection of $f$." },
        { h: "(c)", m: "$f(6) = 3 + 2 = 5; \\qquad g(5) = \\dfrac{15}{2}$", mk: "M1 A1" },
        { h: "(d) $f(a^2 + 2) = 3 + \\sqrt{a^2} = 3 + |a|$", m: "$3 + |a| = \\dfrac{15}{a - 3}$. For $a < 0$ the right side is negative and the left positive — impossible. So $a > 0$ and $|a| = a$:\n$(3 + a)(a - 3) = 15 \\Rightarrow a^2 - 9 = 15 \\Rightarrow a = \\sqrt{24} = 2\\sqrt6$", mk: "M1 A1", n: "$\\sqrt{a^2}$ is $|a|$, not $a$ — the sign discussion is what earns the M. ($a = -2\\sqrt6$ fails: it makes the right side negative.)" }
      ], result: "(a) $f(x) > 3$ (b) $(x - 3)^2 + 2$, $x > 3$ (c) $\\frac{15}{2}$ (d) $a = 2\\sqrt6$" } },
    { worked: { tag: "exam", title: "$fg(2)$, $g^{-1}$, $gf(x)$ simplified with its range, and no real solutions", src: "A-level June 2024 · P1 Q8 · 11 marks",
      q: "$f(x) = 4 - 3x^2$, $x \\in \\mathbb{R}$; $g(x) = \\frac{5}{2x - 9}$, $x \\neq \\frac92$. **(a)** Find $fg(2)$. **(b)** Find $g^{-1}$. **(c)(i)** Find $gf(x)$ as a simplified fraction. **(ii)** Deduce the range of $gf(x)$. $h(x) = 2x^2 - 6x + k$. **(d)** Find the range of values of $k$ for which $f(x) = h(x)$ has no real solutions.",
      steps: [
        { h: "(a)", m: "$g(2) = \\dfrac{5}{-5} = -1; \\qquad f(-1) = 4 - 3 = 1$", mk: "M1 A1" },
        { h: "(b)", m: "$y(2x - 9) = 5 \\Rightarrow x = \\dfrac{5 + 9y}{2y}$, so $g^{-1}(x) = \\dfrac{9x + 5}{2x}$, $x \\neq 0$", mk: "M1 A1 A1" },
        { h: "(c)(i)", m: "$gf(x) = \\dfrac{5}{2(4 - 3x^2) - 9} = \\dfrac{5}{-1 - 6x^2} = -\\dfrac{5}{1 + 6x^2}$", mk: "M1 A1" },
        { h: "(ii) $1 + 6x^2 \\ge 1$", m: "$-5 \\le gf(x) < 0$", mk: "A1", n: "Largest magnitude at $x = 0$ ($-5$); tends to 0 from below as $|x| \\to \\infty$." },
        { h: "(d) Discriminant", m: "$4 - 3x^2 = 2x^2 - 6x + k \\Rightarrow 5x^2 - 6x + (k - 4) = 0$\nNo real solutions: $36 - 20(k - 4) < 0 \\Rightarrow 116 < 20k \\Rightarrow k > \\dfrac{29}{5}$", mk: "M1 A1 A1" }
      ], result: "(a) 1 (b) $\\frac{9x + 5}{2x}$ (c) $-\\frac{5}{1 + 6x^2}$, $-5 \\le gf(x) < 0$ (d) $k > \\frac{29}{5}$" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Find $fg(2)$**", "$g(2)$ first, then $f$ of that — one number"],
      ["**State the range**", "an inequality in $f(x)$ (or $y$), with strict/non-strict correct at each end"],
      ["**Find $f^{-1}(x)$, stating its domain**", "the rearranged formula and \"$x \\ldots$\" = range of $f$"],
      ["**Find $f^{-1}(7)$**", "solve $f(x) = 7$ — do not derive $f^{-1}$"],
      ["**Show that $ff(x) = \\ldots$**", "substitute, clear the nested fraction, simplify — every line"],
      ["**Explain why $g$ has no inverse**", "\"many-to-one\" with an example pair or a horizontal-line argument"],
      ["**Deduce the range of $gf$**", "range of $f$ → feed into $g$ → use $g$'s shape"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Order of composition**: $fg$ means $g$ first.",
      "**Range from the endpoints only**, missing a vertex inside the domain.",
      "**Omitting the domain of $f^{-1}$**, or giving the domain of $f$ instead.",
      "**$\\sqrt{a^2} = a$** — it is $|a|$.",
      "**Not clearing the nested fraction** in $ff(x)$, leaving a fraction over a fraction.",
      "**Strict vs non-strict** at asymptotic ends: $\\frac{2x+5}{x-3} \\to 2$ but never equals 2."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Composite values", "Compute the inner value, STO to $x$, then type the outer expression. For $gg(5)$ two rounds."],
      ["Check an inverse", "Pick a number, apply $f$ then your $f^{-1}$; you must get the number back."],
      ["Range by Table", "Table app with $f(x)$ over the domain, small step: the min/max in the column, plus the end behaviour, gives the range."]
    ] },
    { callout: { t: "mnemonic", h: "\"Inside out, swap and solve, domain from range\"", body: "Composites: inside first. Inverse: swap $x$ and $y$, solve for $y$. The inverse's domain is the original's range." } }
  ],
  flashcards: [
    ["$fg(x)$ means…", "$f(g(x))$: apply $g$ first."],
    ["Domain of $f^{-1}$ equals…", "the range of $f$."],
    ["$g(x) = \\frac{2x + 5}{x - 3}$, $x \\ge 5$: range?", "$2 < g(x) \\le \\frac{15}{2}$ (decreasing towards the asymptote $y = 2$)."],
    ["Inverse of $y = \\frac{ax + b}{cx + d}$?", "$x = \\frac{dy - b}{a - cy}$."],
    ["$f(x) = 3 + \\sqrt{x - 2}$, $x > 2$: $f^{-1}$?", "$(x - 3)^2 + 2$ with domain $x > 3$."],
    ["Why has $g(x) = x^2 - 3x$ on $[0, 5]$ no inverse?", "Many-to-one: $g(0) = g(3) = 0$."],
    ["Quick way to find $f^{-1}(7)$?", "Solve $f(x) = 7$."],
    ["Range of $g(x) = x^2 - 3x$, $0 \\le x \\le 5$?", "$-\\frac94 \\le g \\le 10$ (vertex at $\\frac32$ is inside the domain)."],
    ["Range of $-\\frac{5}{1 + 6x^2}$?", "$-5 \\le y < 0$."],
    ["$ff(x)$ for $f(x) = \\frac{3x - 7}{x - 2}$?", "$\\frac{2x - 7}{x - 3}$ — multiply top and bottom by $(x - 2)$."],
    ["Graph of $y = f^{-1}(x)$ is the graph of $y = f(x)$…", "reflected in the line $y = x$."],
    ["$\\sqrt{a^2} = $?", "$|a|$, not $a$."]
  ],
  quiz: [
    { q: "$f(x) = 2x + 1$, $g(x) = x^2$. $fg(3) =$", opts: ["19", "49", "7", "10"], ans: 0, why: "$g(3) = 9$, $f(9) = 19$." },
    { q: "$gf(3)$ with the same functions:", opts: ["19", "49", "7", "10"], ans: 1, why: "$f(3) = 7$, $g(7) = 49$." },
    { q: "Inverse of $f(x) = \\frac{x - 1}{2}$:", opts: ["$2x + 1$", "$\\frac{2}{x - 1}$", "$2x - 1$", "$\\frac{x + 1}{2}$"], ans: 0, why: "$x = 2y + 1$." },
    { q: "A function has an inverse only if it is", opts: ["many-to-one", "one-to-one", "quadratic", "defined on $\\mathbb{R}$"], ans: 1, why: "Each output from one input." },
    { q: "Range of $f(x) = \\sqrt{x} + 1$, $x \\ge 0$:", opts: ["$f \\ge 0$", "$f \\ge 1$", "$f > 1$", "all reals"], ans: 1, why: "$\\sqrt x \\ge 0$, so $f \\ge 1$ (equality at 0)." },
    { q: "$f^{-1}(5) = 2$ tells you", opts: ["$f(5) = 2$", "$f(2) = 5$", "$f(2) = \\tfrac15$", "$f(5) = \\tfrac12$"], ans: 1, why: "Inverse reverses input and output." },
    { q: "The graph of $y = f^{-1}(x)$ is obtained from $y = f(x)$ by reflection in", opts: ["the $x$-axis", "the $y$-axis", "$y = x$", "$y = -x$"], ans: 2, why: "Swapping coordinates." }
  ]
};

/* =====================================================================
   2.9  Graph transformations
   ===================================================================== */
C["maths:2.9"] = {
  notes: [
    { h: "Transformations — the whole topic on one page" },
    "Four moves, applied to any graph on the specification. Questions come in two flavours: **\"find the image of the point $P$\"** (4 marks, every A-level paper 2022–2025) and **\"sketch the transformed curve\"** with its key points and asymptotes.",
    { callout: { t: "memorise", h: "The four transformations of $y = f(x)$", body: [
      "$$y = f(x) + a \;\\text{ translation } \\begin{pmatrix} 0 \\\\ a \\end{pmatrix} \\qquad y = f(x + a) \;\\text{ translation } \\begin{pmatrix} -a \\\\ 0 \\end{pmatrix}$$",
      "$$y = af(x) \;\\text{ stretch, scale factor } a, \\text{ parallel to the } y\\text{-axis} \\qquad y = f(ax) \;\\text{ stretch, scale factor } \\tfrac1a, \\text{ parallel to the } x\\text{-axis}$$",
      "$y = -f(x)$: reflection in the $x$-axis. $\; y = f(-x)$: reflection in the $y$-axis.",
      "**Inside the bracket → acts on $x$, and does the opposite of what it says.** Outside → acts on $y$, and does what it says."
    ] } },

    { page: "Images of points and combinations" },
    { h: "Why \"inside is opposite\"" },
    "$y = f(x + 2)$ at $x = 1$ uses the value $f(3)$ — the height the *original* had at 3 now appears at 1. Every point has moved 2 to the **left**. Likewise $y = f(2x)$ at $x = 1$ uses $f(2)$: the original's height at 2 now sits at 1, so the graph is squashed by factor $\\frac12$ towards the $y$-axis.",
    { fig: { x: [-4, 6], y: [-2, 6], axes: { xt: [-2, 2, 4], yt: [2, 4] }, items: [
      { fn: "4*exp(-(x-2)^2)", c: "muted", dash: true, label: "y = f(x)", at: 2.9, pos: "e" },
      { fn: "4*exp(-(x)^2)", c: "accent", label: "y = f(x + 2)", at: 0.9, pos: "e" },
      { fn: "4*exp(-(2*x-2)^2)", c: "accent3", label: "y = f(2x)", at: 1.35, pos: "w" },
      { pt: [2, 4], c: "muted", label: "(2, 4)", pos: "n" }, { pt: [0, 4], c: "accent", label: "(0, 4)", pos: "nw" }, { pt: [1, 4], c: "accent3", label: "(1, 4)", pos: "n" }
    ], cap: "The peak at $(2, 4)$ moves to $(0, 4)$ under $f(x + 2)$ and to $(1, 4)$ under $f(2x)$ — left, and halved." } },
    { h: "Tracking a point" },
    { table: { head: ["Curve", "$(x, y) \\to$", "Example: $P(3, -2)$"], rows: [
      ["$y = f(x) + a$", "$(x, y + a)$", "$f(x) + 5$: $(3, 3)$"],
      ["$y = f(x + a)$", "$(x - a, y)$", "$f(x - 2)$: $(5, -2)$"],
      ["$y = af(x)$", "$(x, ay)$", "$3f(x)$: $(3, -6)$"],
      ["$y = f(ax)$", "$\\left(\\frac{x}{a}, y\\right)$", "$f(2x)$: $\\left(\\frac32, -2\\right)$"],
      ["$y = -f(x)$", "$(x, -y)$", "$(3, 2)$"],
      ["$y = f(-x)$", "$(-x, y)$", "$(-3, -2)$"],
      ["$y = |f(x)|$", "$(x, |y|)$", "$(3, 2)$"],
      ["$y = f^{-1}(x)$", "$(y, x)$", "$(-2, 3)$"]
    ] } },
    { callout: { t: "warn", h: "Combinations: the order matters for the $y$-moves", body: [
      "$y = 3f(x - 2) + 5$ from $P(3, -2)$: shift right 2 → $(5, -2)$; stretch $\\times3$ in $y$ → $(5, -6)$; up 5 → $(5, -1)$.",
      "The stretch must come **before** the $+5$, because $3f(x - 2) + 5$ multiplies $f$ by 3 and *then* adds 5. Doing the $+5$ first gives $(5, 9)$ — wrong.",
      "For $y = 3f(-x) + 5$ from $(3, -2)$: reflect → $(-3, -2)$, stretch → $(-3, -6)$, up → $(-3, -1)$."
    ] } },
    { worked: { tag: "exam", title: "Image of $P(-2, -5)$ under three transformations", src: "A-level June 2022 · P1 Q1 · 4 marks",
      q: "The point $P(-2, -5)$ lies on $y = f(x)$. Find the point to which $P$ is mapped when the curve is transformed to **(a)** $y = f(x) + 2$; **(b)** $y = |f(x)|$; **(c)** $y = 3f(x - 2) + 2$.",
      steps: [
        { h: "(a)", m: "$(-2, -3)$", mk: "B1" },
        { h: "(b) Negative $y$ becomes positive", m: "$(-2, 5)$", mk: "B1" },
        { h: "(c) Right 2, then $\\times3$, then up 2", m: "$(-2, -5) \\to (0, -5) \\to (0, -15) \\to (0, -13)$", mk: "M1 A1", n: "Two of the three steps right earns the M." }
      ], result: "(a) $(-2, -3)$ (b) $(-2, 5)$ (c) $(0, -13)$" } },
    { worked: { tag: "exam", title: "Image of $P(3, -2)$ including a reflection", src: "A-level June 2024 · P2 Q3 · 4 marks",
      q: "$P(3, -2)$ lies on $y = f(x)$. Find the image of $P$ under **(i)** $y = f(x - 2)$; **(ii)** $y = f(2x)$; **(iii)** $y = 3f(-x) + 5$.",
      steps: [
        { h: "(i)", m: "$(5, -2)$", mk: "B1" },
        { h: "(ii)", m: "$\\left(\\dfrac32, -2\\right)$", mk: "B1" },
        { h: "(iii)", m: "$(3, -2) \\to (-3, -2) \\to (-3, -6) \\to (-3, -1)$", mk: "M1 A1" }
      ], result: "(i) $(5, -2)$ (ii) $(\\frac32, -2)$ (iii) $(-3, -1)$" } },
    { worked: { tag: "exam", title: "Image under $f^{-1}$ and under $2|f(x)| - 3$", src: "A-level June 2025 · P1 Q1 · 4 marks",
      q: "$P(6, -4)$ lies on $y = f(x)$. Find the image of $P$ under **(a)** $y = f(x + 2)$; **(b)** $y = f^{-1}(x)$; **(c)** $y = 2|f(x)| - 3$.",
      steps: [
        { h: "(a)", m: "$(4, -4)$", mk: "B1" },
        { h: "(b) Reflection in $y = x$ swaps the coordinates", m: "$(-4, 6)$", mk: "B1" },
        { h: "(c) Modulus, then $\\times2$, then down 3", m: "$(6, -4) \\to (6, 4) \\to (6, 8) \\to (6, 5)$", mk: "M1 A1" }
      ], result: "(a) $(4, -4)$ (b) $(-4, 6)$ (c) $(6, 5)$" } },

    { page: "Sketching transformed curves" },
    { worked: { tag: "exam", title: "Sketch $y = f(x + 2)$ and $y = -f(x)$ from a curve with an asymptote", src: "AS June 2025 · P1 Q1 · 6 marks",
      q: "A curve $y = f(x)$ passes through $A(-1, 0)$, has a maximum turning point at $B(2, 7)$ and a horizontal asymptote $y = 3$. On separate diagrams sketch **(i)** $y = f(x + 2)$; **(ii)** $y = -f(x)$, in each case showing the images of $A$ and $B$ and the equation of the asymptote.",
      steps: [
        { h: "(i) Everything moves 2 to the left; the horizontal asymptote is unchanged", m: "$A \\to (-3, 0)$, $\; B \\to (0, 7)$, asymptote still $y = 3$", mk: "B1 B1 B1", fig: { x: [-5, 8], y: [-2, 9], axes: { xt: [-3, 2], yt: [3, 7] }, items: [ { fn: "3+4*exp(-((x-2)/2.2)^2)-3*exp(-((x+1)*1.8)^2)", from: -1.6, to: 8, c: "muted", dash: true, label: "f(x)", at: 6.5, pos: "n" }, { fn: "3+4*exp(-((x)/2.2)^2)-3*exp(-((x+3)*1.8)^2)", from: -3.6, to: 8, label: "f(x + 2)", at: 4.5, pos: "n" }, { hline: 3, c: "accent3", label: "y = 3" }, { pt: [-3, 0], label: "(−3, 0)", pos: "s" }, { pt: [0, 7], label: "(0, 7)", pos: "ne" } ], cap: "A translation parallel to the $x$-axis leaves a horizontal asymptote where it is." }, n: "The asymptote's equation must be written on the sketch." },
        { h: "(ii) Reflect in the $x$-axis: signs of $y$ flip, including the asymptote", m: "$A \\to (-1, 0)$ (unchanged), $\; B \\to (2, -7)$ now a minimum, asymptote $y = -3$", mk: "B1 B1 B1", n: "The asymptote moves to $y = -3$ — the most-missed mark." }
      ], result: "(i) $(-3, 0)$, $(0, 7)$, $y = 3$ (ii) $(-1, 0)$, $(2, -7)$, $y = -3$" } },
    { worked: { tag: "exam", title: "Read transformations off a given sketch", src: "AS Specimen · P1 Q4 · 4 marks",
      q: "$y = g(x)$ has a single minimum turning point $M(4, -1.5)$, crosses the $x$-axis at $P(2, 0)$ and $Q(7, 0)$, and the $y$-axis at $R(0, 5)$. **(a)** State the turning point of $y = 2g(x)$. **(b)** State the largest root of $g(x + 1) = 0$. **(c)** State the smallest root of $g(2x) = 0$. **(d)** State the range of values of $x$ for which $g'(x) < 0$.",
      steps: [
        { h: "(a) $y$-stretch $\\times2$", m: "$(4, -3)$", mk: "B1" },
        { h: "(b) Roots move left by 1", m: "Roots $1$ and $6$; largest $6$", mk: "B1" },
        { h: "(c) Roots halve", m: "Roots $1$ and $3.5$; smallest $1$", mk: "B1" },
        { h: "(d) Decreasing up to the minimum", m: "$x < 4$", mk: "B1" }
      ], result: "(a) $(4, -3)$ (b) 6 (c) 1 (d) $x < 4$" } },
    { h: "Describing a transformation in words — the accepted vocabulary" },
    { kv: [
      ["Translation", "\"Translation by the vector $\\begin{pmatrix} 2 \\\\ -4 \\end{pmatrix}$\". Not \"shift\", \"move\", \"slide\". Give the vector."],
      ["Stretch", "\"Stretch, scale factor 3, parallel to the $y$-axis\" (or \"in the $y$-direction\"). Factor **and** direction. \"Squash\" and \"enlarge\" are not accepted; a factor $\\frac12$ is still a stretch."],
      ["Reflection", "\"Reflection in the $x$-axis\" / \"in the $y$-axis\" / \"in the line $y = x$\"."],
      ["Recognising one from equations", "$2x^2 + 4x + 9 = 2(x + 1)^2 + 7$ onto $2(x - 1)^2 + 3$: the vertex $(-1, 7) \\to (1, 3)$ — translation $\\begin{pmatrix} 2 \\\\ -4 \\end{pmatrix}$ (A-level 2019 Q5)."]
    ] },

    { page: "Exam toolkit" },
    { h: "Where the marks go" },
    { ul: [
      "**Inside-the-bracket direction**: $f(x + 2)$ is **left**; $f(2x)$ **halves** $x$.",
      "**Order of operations in $y$**: stretch, then translate, for $af(x) + b$.",
      "**Asymptotes**: horizontal ones move under $y$-transformations ($-f$, $f + a$, $af$), not under $x$-transformations — and vice versa for vertical ones.",
      "**Wrong vocabulary** for a described transformation (\"shift\", \"squash\", \"flip\").",
      "**$|f(x)|$ vs $f(|x|)$**: $|f(x)|$ reflects the parts below the axis; $f(|x|)$ copies the right half onto the left."
    ] },
    { callout: { t: "mnemonic", h: "\"Inside: $x$, opposite. Outside: $y$, as written.\"", body: "The whole topic in eight words. $f(x - 3)$: inside, so it is about $x$, and opposite → right 3. $2f(x)$: outside, so $y$, as written → $y$ doubled." } },
    { callout: { t: "mnemonic", h: "\"Stretch before you shift\"", body: "For $af(x) + b$, multiply first, add second — the same order as in the expression." } }
  ],
  flashcards: [
    ["$y = f(x + a)$ is what transformation?", "Translation by $\\begin{pmatrix} -a \\\\ 0 \\end{pmatrix}$ — left by $a$."],
    ["$y = f(ax)$?", "Stretch scale factor $\\frac1a$ parallel to the $x$-axis."],
    ["$y = af(x)$?", "Stretch scale factor $a$ parallel to the $y$-axis."],
    ["$y = -f(x)$ and $y = f(-x)$?", "Reflection in the $x$-axis; reflection in the $y$-axis."],
    ["$P(3, -2)$ under $y = 3f(-x) + 5$?", "$(-3, -2) \\to (-3, -6) \\to (-3, -1)$."],
    ["$P(6, -4)$ under $y = f^{-1}(x)$?", "$(-4, 6)$."],
    ["$P(-2, -5)$ under $y = 3f(x - 2) + 2$?", "$(0, -5) \\to (0, -15) \\to (0, -13)$."],
    ["Asymptote $y = 3$ under $y = -f(x)$? Under $y = f(x + 2)$?", "$y = -3$; unchanged."],
    ["How must a translation be described?", "\"Translation\" plus a column vector."],
    ["Roots of $g(x) = 0$ are 2 and 7. Roots of $g(2x) = 0$?", "1 and 3.5."],
    ["$|f(x)|$ vs $f(|x|)$?", "$|f(x)|$ reflects negative parts up; $f(|x|)$ mirrors the right half to the left."]
  ],
  quiz: [
    { q: "$y = f(x - 3)$ moves the graph", opts: ["left 3", "right 3", "up 3", "down 3"], ans: 1, why: "Inside, opposite." },
    { q: "$(2, 6)$ under $y = f(2x)$ becomes", opts: ["$(4, 6)$", "$(1, 6)$", "$(2, 12)$", "$(2, 3)$"], ans: 1, why: "$x$ halves." },
    { q: "$(2, 6)$ under $y = 2f(x) - 1$ becomes", opts: ["$(2, 11)$", "$(2, 10)$", "$(2, 13)$", "$(4, 5)$"], ans: 0, why: "Stretch then shift: $12 - 1$." },
    { q: "$y = f(-x)$ is a reflection in", opts: ["the $x$-axis", "the $y$-axis", "$y = x$", "the origin"], ans: 1, why: "Sign of $x$ flips." },
    { q: "Vertical asymptote $x = 1$ under $y = f(x + 4)$ becomes", opts: ["$x = 5$", "$x = -3$", "$x = 1$", "$y = 1$"], ans: 1, why: "Left 4." },
    { q: "$2(x+1)^2 + 7 \\to 2(x-1)^2 + 3$ is a translation by", opts: ["$\\begin{pmatrix} 2 \\\\ -4 \\end{pmatrix}$", "$\\begin{pmatrix} -2 \\\\ 4 \\end{pmatrix}$", "$\\begin{pmatrix} 2 \\\\ 4 \\end{pmatrix}$", "$\\begin{pmatrix} -2 \\\\ -4 \\end{pmatrix}$"], ans: 0, why: "Vertex $(-1, 7) \\to (1, 3)$." },
    { q: "Acceptable description of $y = 3f(x)$:", opts: ["enlargement 3", "stretch, scale factor 3, parallel to the $y$-axis", "stretched by 3", "$y$ times 3"], ans: 1, why: "Factor and direction." }
  ]
};

/* =====================================================================
   2.10  Partial fractions
   ===================================================================== */
C["maths:2.10"] = {
  notes: [
    { h: "Partial fractions — the whole topic on one page" },
    "Splitting one algebraic fraction into a sum of simpler ones. On its own it is a 3–4 mark question; its real job is as the **first step** of three other topics — integrating to logs (8.6), binomial expansion of a rational function (4.1), and proving a function is decreasing (7.3).",
    { table: { head: ["Denominator", "Form to write", "How to find the constants"], rows: [
      ["two distinct linear factors $(x + a)(x + b)$", "$\\frac{A}{x + a} + \\frac{B}{x + b}$", "substitute $x = -a$ and $x = -b$ (cover-up)"],
      ["three distinct linear factors", "$\\frac{A}{\\ldots} + \\frac{B}{\\ldots} + \\frac{C}{\\ldots}$", "three substitutions"],
      ["a repeated factor $(x + a)^2(x + b)$", "$\\frac{A}{x + a} + \\frac{B}{(x + a)^2} + \\frac{C}{x + b}$", "substitutions give $B$ and $C$; $A$ from comparing a coefficient or another substitution"],
      ["improper (top degree $\\ge$ bottom degree)", "polynomial $+$ proper fractions, e.g. $Ax + B + \\frac{C}{x + 1} + \\frac{D}{x + 3}$", "compare the highest powers for the polynomial part (or divide first), then substitute"]
    ] } },
    "The spec limits denominators to at most three factors, at most one of them squared, with numerators constant or linear.",

    { page: "The three forms" },
    { callout: { t: "memorise", h: "Method", body: [
      "1. **Check the degrees.** If the numerator's degree is not less than the denominator's, divide first (or include a polynomial part).",
      "2. **Write the form** with unknown constants — one term per factor, and one extra term for each power of a repeated factor.",
      "3. **Multiply through** by the denominator to get an identity of polynomials.",
      "4. **Substitute the roots** of the denominator: each kills all but one term.",
      "5. **Anything left** (the $A$ over a repeated factor's single power; the polynomial part) — compare coefficients of the highest power, or substitute $x = 0$.",
      "6. **Check** one value not yet used, or the $x^2$ coefficient."
    ] } },
    { worked: { tag: "example", title: "Two distinct linear factors", src: "routine",
      q: "Express $\\frac{5x + 7}{(x + 1)(x + 3)}$ in partial fractions.",
      steps: [
        { m: "$\\dfrac{5x + 7}{(x + 1)(x + 3)} \\equiv \\dfrac{A}{x + 1} + \\dfrac{B}{x + 3} \;\\Rightarrow\; 5x + 7 \\equiv A(x + 3) + B(x + 1)$", mk: "M1" },
        { m: "$x = -1$: $2 = 2A \\Rightarrow A = 1$; $\\qquad x = -3$: $-8 = -2B \\Rightarrow B = 4$", mk: "A1 A1", n: "Cover-up rule: to find $A$, cover $(x + 1)$ in the original and evaluate the rest at $x = -1$: $\\frac{-5 + 7}{2} = 1$." }
      ], result: "$\\dfrac{1}{x + 1} + \\dfrac{4}{x + 3}$" } },
    { worked: { tag: "exam", title: "An improper fraction with a constant part; then prove $f$ is decreasing", src: "A-level June 2018 · P2 Q11 · 7 marks",
      q: "$\\frac{1 + 11x - 6x^2}{(x - 3)(1 - 2x)} \\equiv A + \\frac{B}{x - 3} + \\frac{C}{1 - 2x}$. **(a)** Find the values of $A$, $B$ and $C$. $f(x) = \\frac{1 + 11x - 6x^2}{(x - 3)(1 - 2x)}$, $x > 3$. **(b)** Prove that $f(x)$ is a decreasing function.",
      steps: [
        { h: "(a) Degree 2 over degree 2 — hence the constant $A$", m: "$1 + 11x - 6x^2 \\equiv A(x - 3)(1 - 2x) + B(1 - 2x) + C(x - 3)$", mk: "M1" },
        { m: "$x = 3$: $1 + 33 - 54 = -20 = B(1 - 6) \\Rightarrow B = 4$\n$x = \\dfrac12$: $1 + \\dfrac{11}{2} - \\dfrac32 = 5 = C\\left(-\\dfrac52\\right) \\Rightarrow C = -2$", mk: "A1 A1" },
        { m: "$x^2$ coefficients: $-6 = -2A \\Rightarrow A = 3$", mk: "A1", n: "Check with $x = 0$: $3(-3)(1) + 4(1) + (-2)(-3) = -9 + 4 + 6 = 1$ ✓" },
        { h: "(b) Differentiate the partial-fraction form", m: "$f(x) = 3 + 4(x - 3)^{-1} - 2(1 - 2x)^{-1}$\n$f'(x) = -4(x - 3)^{-2} - 2 \\cdot (-1)(1 - 2x)^{-2} \\cdot (-2) = -\\dfrac{4}{(x - 3)^2} - \\dfrac{4}{(1 - 2x)^2}$", mk: "M1 A1", n: "Chain rule on $(1 - 2x)^{-1}$: the inner derivative $-2$ and the outer $-1$ multiply. The partial fractions are what make this differentiation two lines instead of a quotient rule." },
        { m: "Both squares are positive for $x > 3$, so $f'(x) < 0$ for all $x > 3$: $f$ is decreasing.", mk: "A1", n: "The proof is the sign argument written in words, not the derivative alone." }
      ], result: "(a) $A = 3$, $B = 4$, $C = -2$ (b) $f'(x) = -\\frac{4}{(x-3)^2} - \\frac{4}{(1-2x)^2} < 0$" } },
    { worked: { tag: "exam", title: "Improper: $Ax + B + \\frac{C}{x + 2}$, then an exact integral", src: "A-level Oct 2020 · P2 Q6 · 7 marks",
      q: "**(a)** Given $\\frac{x^2 + 8x - 3}{x + 2} \\equiv Ax + B + \\frac{C}{x + 2}$, find $A$, $B$ and $C$. **(b)** Hence, using algebraic integration, find the exact value of $\\displaystyle\\int_0^6 \\frac{x^2 + 8x - 3}{x + 2}\\,\\mathrm{d}x$, in the form $a + b\\ln2$.",
      steps: [
        { h: "(a)", m: "$x^2 + 8x - 3 \\equiv (Ax + B)(x + 2) + C$\n$x^2$: $A = 1$; $\; x = -2$: $4 - 16 - 3 = -15 = C$; $\; x$: $8 = 2A + B \\Rightarrow B = 6$", mk: "M1 A1 A1", n: "Or divide: $(x^2 + 8x - 3) \\div (x + 2) = x + 6$ remainder $-15$." },
        { h: "(b)", m: "$\\displaystyle\\int_0^6 \\left(x + 6 - \\dfrac{15}{x + 2}\\right)\\mathrm{d}x = \\left[\\dfrac{x^2}{2} + 6x - 15\\ln(x + 2)\\right]_0^6$", mk: "M1 A1" },
        { m: "$= (18 + 36 - 15\\ln8) - (0 - 15\\ln2) = 54 - 45\\ln2 + 15\\ln2 = 54 - 30\\ln2$", mk: "M1 A1", n: "$\\ln 8 = 3\\ln2$ — the log law that gets it into the required form." }
      ], result: "(a) $A = 1$, $B = 6$, $C = -15$ (b) $54 - 30\\ln2$" } },
    { worked: { tag: "exam", title: "Partial fractions in terms of a constant $k$; solve for $k$ from an integral", src: "A-level June 2023 · P2 Q10 · 7 marks",
      q: "$f(x) = \\frac{3kx - 18}{(x + 4)(x - 2)}$, $k > 0$. **(a)** Express $f(x)$ in partial fractions in terms of $k$. **(b)** Hence find the exact value of $k$ for which $\\displaystyle\\int_{-3}^{1} f(x)\\,\\mathrm{d}x = 21$.",
      steps: [
        { h: "(a)", m: "$3kx - 18 \\equiv A(x - 2) + B(x + 4)$\n$x = -4$: $-12k - 18 = -6A \\Rightarrow A = 2k + 3$; $\\quad x = 2$: $6k - 18 = 6B \\Rightarrow B = k - 3$", mk: "M1 A1 A1", n: "The constants are expressions in $k$; the method is unchanged." },
        { h: "(b)", m: "$\\displaystyle\\int_{-3}^{1}\\left(\\dfrac{2k + 3}{x + 4} + \\dfrac{k - 3}{x - 2}\\right)\\mathrm{d}x = \\Big[(2k + 3)\\ln|x + 4| + (k - 3)\\ln|x - 2|\\Big]_{-3}^{1}$", mk: "M1" },
        { m: "$= (2k + 3)(\\ln5 - \\ln1) + (k - 3)(\\ln1 - \\ln5) = (2k + 3 - k + 3)\\ln5 = (k + 6)\\ln5$", mk: "A1", n: "Modulus signs matter: $\\ln|{-3} - 2| = \\ln5$ and $\\ln|1 - 2| = \\ln1 = 0$." },
        { m: "$(k + 6)\\ln5 = 21 \;\\Rightarrow\; k = \\dfrac{21}{\\ln5} - 6$", mk: "M1 A1" }
      ], result: "(a) $\\dfrac{2k + 3}{x + 4} + \\dfrac{k - 3}{x - 2}$ (b) $k = \\dfrac{21}{\\ln5} - 6$" } },
    { worked: { tag: "exam", title: "A cubic over a quadratic: $Ax + B + \\frac{C}{x + 1} + \\frac{D}{x - 3}$", src: "A-level June 2025 · P2 Q7 · 4 marks",
      q: "Given $\\frac{3x^3 - 8x^2 - 6x - 11}{(x + 1)(x - 3)} \\equiv Ax + B + \\frac{C}{x + 1} + \\frac{D}{x - 3}$, find the values of $A$, $B$, $C$ and $D$.",
      steps: [
        { m: "$3x^3 - 8x^2 - 6x - 11 \\equiv (Ax + B)(x + 1)(x - 3) + C(x - 3) + D(x + 1)$, with $(x + 1)(x - 3) = x^2 - 2x - 3$", mk: "M1" },
        { h: "Highest powers first", m: "$x^3$: $A = 3$. $\\quad x^2$: $-8 = -2A + B \\Rightarrow B = -2$", mk: "A1", n: "$(Ax + B)(x^2 - 2x - 3)$ has $x^2$ coefficient $-2A + B$." },
        { h: "Then the roots", m: "$x = -1$: $-3 - 8 + 6 - 11 = -16 = -4C \\Rightarrow C = 4$\n$x = 3$: $81 - 72 - 18 - 11 = -20 = 4D \\Rightarrow D = -5$", mk: "M1 A1", n: "Check $x = 0$: $(-2)(-3) + 4(-3) + (-5)(1) = 6 - 12 - 5 = -11$ ✓" }
      ], result: "$A = 3$, $B = -2$, $C = 4$, $D = -5$" } },
    { worked: { tag: "exam", title: "Repeated factor and a \"show that $A = 0$\"", src: "A-level Oct 2021 · P1 Q9(a) · 4 marks",
      q: "$\\frac{50x^2 + 38x + 9}{(5x + 2)^2(1 - 2x)} \\equiv \\frac{A}{5x + 2} + \\frac{B}{(5x + 2)^2} + \\frac{C}{1 - 2x}$. **(i)** Find $B$ and $C$. **(ii)** Show that $A = 0$.",
      steps: [
        { m: "$50x^2 + 38x + 9 \\equiv A(5x + 2)(1 - 2x) + B(1 - 2x) + C(5x + 2)^2$", mk: "M1" },
        { m: "$x = \\dfrac12$: $\\dfrac{81}{2} = \\dfrac{81}{4}C \\Rightarrow C = 2$; $\\quad x = -\\dfrac25$: $\\dfrac95 = \\dfrac95 B \\Rightarrow B = 1$", mk: "A1" },
        { h: "(ii) A third equation", m: "$x = 0$: $9 = 2A + B + 4C = 2A + 9 \\Rightarrow A = 0$", mk: "M1 A1*", n: "Or compare $x^2$: $50 = -10A + 25C$. Three constants written with no working scores M1 A1 M0 A0 — the proof must be visible. (The binomial expansion that follows is under 4.1.)" }
      ], result: "$B = 1$, $C = 2$, $A = 0$" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Express in partial fractions**", "the form written, the identity, each constant found — and the final answer assembled"],
      ["**Find the values of the constants**", "the same; the form is given"],
      ["**Show that $A = 0$**", "a separate equation (another substitution or a coefficient comparison), not an assertion"],
      ["**Hence …** (integrate / expand / differentiate)", "use the partial fractions you just found — that is the point of them"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Missing the constant / polynomial part** of an improper fraction — count the degrees first.",
      "**Repeated factor with one term only**: $(x + a)^2$ needs both $\\frac{A}{x + a}$ and $\\frac{B}{(x + a)^2}$.",
      "**Substituting into the wrong side** (the original fraction rather than the cleared identity).",
      "**Sign of the root**: $(1 - 2x)$ vanishes at $x = +\\frac12$; $(5x + 2)$ at $x = -\\frac25$.",
      "**Forgetting the modulus** in $\\ln|x - 2|$ across negative values.",
      "**Not simplifying $\\ln8 = 3\\ln2$** when a form $a + b\\ln2$ is demanded."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Check the decomposition", "Pick $x = 1$ (or any non-root): evaluate the original fraction and your partial fractions separately; they must agree."],
      ["Check an integral", "**Integral template** ($\\int$ key) with the original integrand and the limits gives a decimal; compare with your exact answer as a decimal ($54 - 30\\ln2 = 33.2$)."]
    ] },
    { callout: { t: "mnemonic", h: "\"Degrees, form, clear, roots, rest, check\"", body: "Compare the degrees; write the form; clear the denominator; substitute the roots; find the rest by coefficients; check with a spare value." } }
  ],
  flashcards: [
    ["Form for $\\frac{px + q}{(x + a)(x + b)^2}$?", "$\\frac{A}{x + a} + \\frac{B}{x + b} + \\frac{C}{(x + b)^2}$."],
    ["When do you need a polynomial part?", "When the numerator's degree is at least the denominator's (improper)."],
    ["How do you find the $A$ over the single power of a repeated factor?", "Compare a coefficient (e.g. $x^2$) or substitute a spare value like $x = 0$."],
    ["$\\frac{5x + 7}{(x+1)(x+3)}$ in partial fractions?", "$\\frac{1}{x + 1} + \\frac{4}{x + 3}$."],
    ["$\\frac{x^2 + 8x - 3}{x + 2}$ as $Ax + B + \\frac{C}{x + 2}$?", "$x + 6 - \\frac{15}{x + 2}$."],
    ["$\\frac{1 + 11x - 6x^2}{(x-3)(1-2x)}$ as $A + \\frac{B}{x-3} + \\frac{C}{1-2x}$?", "$3 + \\frac{4}{x - 3} - \\frac{2}{1 - 2x}$."],
    ["Why decompose before integrating $\\frac{x^2 + 8x - 3}{x + 2}$?", "Each piece integrates directly: polynomial terms and $\\ln|x + 2|$."],
    ["$\\int \\frac{A}{x + a}\\,dx = $?", "$A\\ln|x + a| + c$."],
    ["Cover-up rule?", "To find the constant over $(x - a)$, cover that factor in the original fraction and evaluate the rest at $x = a$ — valid for distinct linear factors and the highest power of a repeated one."],
    ["$\\frac{3x^3 - 8x^2 - 6x - 11}{(x+1)(x-3)}$: $A, B, C, D$?", "$3, -2, 4, -5$."]
  ],
  quiz: [
    { q: "$\\frac{x + 5}{(x+1)(x+3)} = \\frac{A}{x+1} + \\frac{B}{x+3}$: $A =$", opts: ["2", "1", "$-1$", "4"], ans: 0, why: "$x = -1$: $4 = 2A$." },
    { q: "Form for $\\frac{3x}{(x-1)^2(x+2)}$:", opts: ["$\\frac{A}{x-1} + \\frac{B}{x+2}$", "$\\frac{A}{x-1} + \\frac{B}{(x-1)^2} + \\frac{C}{x+2}$", "$\\frac{A}{(x-1)^2} + \\frac{B}{x+2}$", "$\\frac{Ax+B}{(x-1)^2}$"], ans: 1, why: "One term per power of the repeated factor." },
    { q: "$\\frac{x^2}{x - 1}$ needs", opts: ["a constant part only", "a linear part $Ax + B$", "no polynomial part", "a quadratic part"], ans: 1, why: "Degree 2 over degree 1: quotient is linear." },
    { q: "$\\int_0^1 \\frac{2}{x + 1}\\,dx =$", opts: ["$2\\ln2$", "$\\ln2$", "$2$", "$\\ln3$"], ans: 0, why: "$2[\\ln(x+1)]_0^1$." },
    { q: "To find $A$ in $\\frac{A}{x+2} + \\frac{B}{(x+2)^2}$ you cannot substitute $x = -2$ because", opts: ["it finds $B$, not $A$", "the identity is false there", "$A = 0$ always", "you must use $x = 2$"], ans: 0, why: "$x = -2$ kills the $A$ term." },
    { q: "$\\ln 8 - \\ln 2 =$", opts: ["$\\ln 6$", "$2\\ln2$", "$\\ln 2$", "$3\\ln2$"], ans: 1, why: "$\\ln\\frac82 = \\ln4 = 2\\ln2$." }
  ]
};

/* =====================================================================
   2.11  Functions in modelling
   ===================================================================== */
C["maths:2.11"] = {
  notes: [
    { h: "Functions in modelling — the whole topic on one page" },
    "Spec 2.11 is not a new technique: it is the set of *questions the examiner asks about a model*, whichever function the model uses. Quadratics (2.3), exponentials (6.7), trig (5.9), reciprocals — the algebra lives elsewhere; the **interpretation** lives here.",
    { table: { head: ["Function", "Typical model", "Parameter meaning"], rows: [
      ["Quadratic $H = a - b(x - h)^2$", "trajectories, profit, tunnel arches", "$a$ max value, $h$ where it occurs"],
      ["Linear $y = mx + c$", "cost = fixed + rate × quantity", "$c$ fixed cost, $m$ cost per item"],
      ["Exponential $N = Ae^{kt}$", "population, decay, temperature", "$A$ initial value, $k$ growth/decay rate"],
      ["Reciprocal $p = \\frac{k}{V}$", "pressure–volume, inverse proportion", "$k$ constant of proportionality"],
      ["Modulus $N = |t - 3| + 4$", "quantities that fall then rise linearly", "vertex = turning moment"],
      ["Trig $H = A\\sin(bt + \\alpha) + c$", "tides, daylight, Ferris wheels", "$A$ amplitude, $\\frac{360}{b}$ period, $c$ mean level"]
    ] } },

    { page: "The questions a model attracts" },
    { kv: [
      ["\"Find a complete equation for the model\"", "Use the given facts one at a time — a maximum fixes the vertex/amplitude, a starting value fixes a constant, a period fixes $b$. Each fact is one equation; state which fact gives which."],
      ["\"Interpret the value of … in the model\"", "Name the quantity **with units and context**: \"0.84 is the cost, in pounds, of making one extra bar of soap\"; \"$428$ is the fixed daily cost in £\". A number without context scores nothing."],
      ["\"Explain why … is not a sensible …\"", "Evaluate the model there and say what goes wrong: a negative profit, a height below the ground, a time before the start."],
      ["\"State a limitation\" / \"give a reason why the model may not be appropriate\"", "An assumption that is false in reality: air resistance ignored, discrete things treated as continuous, growth continuing for ever, the model giving negative values, only valid for the range of data used."],
      ["\"Suggest a refinement\"", "Change the model to fix the limitation you named: add a term, restrict the domain, use a different function (e.g. a modulus model that stops at zero)."],
      ["\"Use the model to predict … comment on the reliability\"", "Compute, then say whether the prediction is an extrapolation (outside the data) and how far — the further, the less reliable."]
    ] },
    { worked: { tag: "exam", title: "A linear cost model built from two days' figures", src: "A-level June 2019 · P2 Q7 · 7 marks",
      q: "A factory's daily cost £$y$ of making $x$ bars of soap is the sum of a fixed cost and a cost proportional to $x$. **(a)** Write down a general equation linking $y$ with $x$. Bars sell for £2 each. On a day when 800 bars are made and sold the profit is £500; when 300 are made and sold there is a loss of £80. **(b)** Show that $y = 0.84x + 428$. **(c)** Interpret the significance of 0.84. **(d)** Find the least number of bars that must be made on a day for the factory to make a profit.",
      steps: [
        { h: "(a)", m: "$y = ax + b$ (or $y = mx + c$)", mk: "B1" },
        { h: "(b) Profit = income − cost", m: "$1600 - y_{800} = 500 \\Rightarrow y_{800} = 1100; \\qquad 600 - y_{300} = -80 \\Rightarrow y_{300} = 680$", mk: "M1", n: "Translate each sentence into a cost value first." },
        { m: "$800a + b = 1100, \\quad 300a + b = 680 \;\\Rightarrow\; 500a = 420 \\Rightarrow a = 0.84, \; b = 428$", mk: "M1 A1*" },
        { h: "(c)", m: "0.84 is the cost, in pounds, of making each additional bar of soap (the variable cost per bar).", mk: "B1", n: "Context and units. \"The gradient\" is not an interpretation." },
        { h: "(d) Profit $> 0$", m: "$2x - (0.84x + 428) > 0 \\Rightarrow 1.16x > 428 \\Rightarrow x > 368.9\\ldots$, so **369** bars", mk: "M1 A1", n: "Round **up** — 368 bars still makes a loss." }
      ], result: "(b) shown (c) cost per extra bar (d) 369" } },
    { worked: { tag: "exam", title: "Choosing between a quadratic and a trig model", src: "A-level June 2023 · P1 Q13 · 7 marks",
      q: "On a roller coaster the maximum height of a carriage is 60 m, a circuit starts at 2 m above the ground, and the height $H$ m after $t$ seconds is modelled by $H = a - b(t - 20)^2$ with $a, b > 0$. **(a)** Find a complete equation for the model. **(b)** Use it to find the height when $t = 40$. An alternative model is $H = 29\\cos(9t + \\alpha)° + \\beta$, $0 \\le \\alpha < 360$. **(c)** Find a complete equation for the alternative model. **(d)** Given the carriage moves continuously for 2 minutes, give a reason why the alternative model is more appropriate.",
      steps: [
        { h: "(a) Max 60 at $t = 20$; $H = 2$ at $t = 0$", m: "$a = 60$; $\\quad 2 = 60 - 400b \\Rightarrow b = 0.145$\n$H = 60 - 0.145(t - 20)^2$", mk: "B1 M1 A1" },
        { h: "(b)", m: "$H = 60 - 0.145(400) = 2$ m", mk: "B1", n: "By symmetry the carriage is back at 2 m — one circuit takes 40 s in this model." },
        { h: "(c) Amplitude 29, so mean level $\\beta = 60 - 29 = 31$; minimum $2$ at $t = 0$", m: "$2 = 29\\cos\\alpha + 31 \\Rightarrow \\cos\\alpha = -1 \\Rightarrow \\alpha = 180$\n$H = 29\\cos(9t + 180)° + 31$", mk: "M1 A1", n: "Period $\\frac{360}{9} = 40$ s, matching (a)." },
        { h: "(d)", m: "The cosine model is periodic, so it repeats every 40 s and describes **multiple circuits** over the 2 minutes; the quadratic only describes one circuit (it goes below 2 m — eventually below the ground — after $t = 40$).", mk: "B1" }
      ], result: "(a) $H = 60 - 0.145(t - 20)^2$ (b) 2 m (c) $H = 29\\cos(9t + 180)° + 31$" } },
    { worked: { tag: "exam", title: "Interpret and refine a quadratic profit model", src: "AS June 2025 · P1 Q7 · 10 marks",
      q: "A company's annual profit (thousands of £) from chairs is $P = -x^2 + 260x - 16\\,450$, where £$x$ is the selling price. **(a)** Explain why £175 is not a sensible selling price. **(b)** Given the profit was more than £200 000, find the highest possible selling price. **(c)** Show that $P = a + b(x + c)^2$ with $a$, $b$, $c$ to be found. **(d)** Hence state the maximum profit and the price that gives it.",
      steps: [
        { h: "(a)", m: "$P(175) = -30\\,625 + 45\\,500 - 16\\,450 = -1575$: a loss of £1 575 000, so not sensible.", mk: "M1 A1" },
        { h: "(b)", m: "$-x^2 + 260x - 16\\,450 > 200 \\Rightarrow x^2 - 260x + 16\\,650 < 0$\nRoots: $x = \\dfrac{260 \\pm \\sqrt{67\\,600 - 66\\,600}}{2} = 130 \\pm \\dfrac{\\sqrt{1000}}{2} = 130 \\pm 15.81$", mk: "M1 A1" },
        { m: "$114.19 < x < 145.81$, so the highest price is **£145.81** (to the nearest penny, staying under the root)", mk: "A1", n: "Highest → upper root, rounded **down**." },
        { h: "(c)", m: "$P = -(x^2 - 260x) - 16\\,450 = -\\left[(x - 130)^2 - 16\\,900\\right] - 16\\,450 = 450 - (x - 130)^2$\n$a = 450$, $b = -1$, $c = -130$", mk: "M1 A1 A1" },
        { h: "(d)", m: "Maximum profit £450 000 at a selling price of £130.", mk: "B1 B1" }
      ], result: "(a) loss at £175 (b) £145.81 (c) $450 - (x - 130)^2$ (d) £450 000 at £130" } },
    { h: "Limitations and refinements — a bank of acceptable answers" },
    { table: { head: ["Model", "Limitation (assumption that fails)", "Refinement"], rows: [
      ["Projectile $H = a - b(x - h)^2$", "air resistance / spin / wind ignored; ball treated as a particle", "add a drag term; restrict to $0 \\le x \\le$ landing point"],
      ["Exponential growth $N = Ae^{kt}$", "growth cannot continue for ever (food, space); $N$ must be an integer", "logistic model with a ceiling; round $N$"],
      ["Linear cost $y = 0.84x + 428$", "bulk discounts change the per-item cost; capacity limits $x$", "piecewise rates; a domain $0 \\le x \\le$ capacity"],
      ["Trig tide/daylight model", "real periods drift; extreme values vary day to day", "fit $A$, $c$ from more data; add a slow trend term"],
      ["Reciprocal $p = \\frac{k}{V}$", "only at constant temperature; breaks at very small $V$", "include temperature; restrict the domain"],
      ["Modulus $N = 8 - |2t - 6|$", "goes negative after $t = 7$ — impossible for a count", "define $N = 0$ beyond that point"]
    ] } },

    { page: "Exam toolkit" },
    { h: "Where the marks go" },
    { ul: [
      "**Interpretations without context or units** — \"the gradient\", \"the $y$-intercept\".",
      "**Limitations about the maths rather than the model** — \"rounding\", \"it's only an estimate\".",
      "**Refinement that does not address the limitation named.**",
      "**Rounding the wrong way** for \"least\"/\"highest\" answers in context.",
      "**Using a fact twice and another not at all** when building the model — count facts against unknowns."
    ] },
    { callout: { t: "mnemonic", h: "\"Number, meaning, units, context\"", body: "Every interpretation sentence has all four. \"0.84: the cost (meaning) in £ (units) of each extra bar of soap (context).\"" } }
  ],
  flashcards: [
    ["What makes an answer an \"interpretation\" of a constant?", "The quantity it represents, in context, with units."],
    ["Acceptable limitation of a projectile model?", "Air resistance / spin / wind ignored; the ball is treated as a particle."],
    ["Why can $N = Ae^{kt}$ not model a population for ever?", "Unbounded growth is impossible — resources limit it; refine with a model that levels off."],
    ["Linear cost model: meaning of $m$ and $c$ in $y = mx + c$?", "$m$ = cost per extra item; $c$ = fixed cost."],
    ["Soap factory: profit at 800 bars is £500 with £2 each — cost that day?", "$1600 - 500 = £1100$."],
    ["Roller coaster $H = 60 - 0.145(t - 20)^2$: why is a cosine model better for 2 minutes?", "It repeats every 40 s — multiple circuits; the quadratic only describes one and then goes below ground."],
    ["Chair profit $P = 450 - (x - 130)^2$: max profit and price?", "£450 000 at £130."],
    ["\"Least number of bars for a profit\" — how do you round?", "Up: the first whole number that satisfies the inequality."]
  ],
  quiz: [
    { q: "In $y = 0.84x + 428$ for daily cost, 428 represents", opts: ["cost per bar", "fixed daily cost in £", "number of bars", "profit"], ans: 1, why: "Cost when $x = 0$." },
    { q: "A valid limitation of $H = a - b(x - 9)^2$ for a thrown ball:", opts: ["it uses decimals", "it ignores air resistance", "$x$ is in metres", "it has a maximum"], ans: 1, why: "An assumption that may fail." },
    { q: "Period of $H = 29\\cos(9t + 180)° + 31$:", opts: ["9 s", "40 s", "360 s", "29 s"], ans: 1, why: "$360 \\div 9$." },
    { q: "A model gives a negative number of subscribers after $t = 7$. The refinement:", opts: ["use fewer decimals", "define $N = 0$ for $t > 7$", "increase the gradient", "ignore it"], ans: 1, why: "Fix the impossible values." },
    { q: "Profit $> £200\\,000$ holds for $114.19 < x < 145.81$. Highest sensible price:", opts: ["£145.82", "£145.81", "£146", "£114.19"], ans: 1, why: "Round down to stay inside." }
  ]
};


/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
