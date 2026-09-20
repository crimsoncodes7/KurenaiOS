/* Kurenai OS — deep content: Pure Mathematics, section P4 (Sequences and
   series) at full A-level depth. Each topic here REPLACES the outline entry
   the base file used to carry: every question shape Edexcel has set on the
   topic (9MA0 Papers 1 & 2, 8MA0 Paper 1, June 2018–2025, the Oct/Nov 2020–21
   series and the Specimen) is explained and then worked through with
   Edexcel M1/A1/B1 marks, in the notation of the Mathematical Formulae and
   Statistical Tables booklet. Past-paper item banks stay in bank-maths-pure-b.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* =====================================================================
   4.1  Binomial expansion — positive integer n (AS) and any rational n
   ===================================================================== */
C["maths:4.1"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Binomial expansion — the whole topic on one page" },
    "Spec 4.1 is one line long and hides two different pieces of mathematics.",
    { ul: [
      "The **positive-integer** expansion of $(a + bx)^n$ is AS material: a *finite* sum with Pascal's-triangle coefficients, exact for every $x$.",
      "The **rational-$n$** series for $(1 + x)^n$ is A-level material: an *infinite* series that is only true for $|x| < 1$.",
      "So every rational-$n$ question carries a validity condition, and most go on to use the series for an approximation, a product of two series, or a partial-fraction decomposition."
    ] },
    { table: { head: ["", "Positive integer $n$ (AS, Module 1)", "Any rational $n$ (A-level, Module 2)"], rows: [
      ["Formula", "$(a + b)^n = a^n + \\binom{n}{1}a^{n-1}b + \\binom{n}{2}a^{n-2}b^2 + \\ldots + b^n$", "$(1 + x)^n = 1 + nx + \\frac{n(n-1)}{2!}x^2 + \\frac{n(n-1)(n-2)}{3!}x^3 + \\ldots$"],
      ["Number of terms", "$n + 1$ — the sum **terminates**", "infinite — it **never terminates**"],
      ["Valid for", "every $x$", "$|x| < 1$ only; for $(a + bx)^n$, $\\left|x\\right| < \\left|\\frac{a}{b}\\right|$"],
      ["Leading term", "$a^n$ — no rearrangement needed", "the bracket **must** start with 1: write $a^n\\left(1 + \\frac{b}{a}x\\right)^n$ first"],
      ["Typical ask", "expand to 3–4 terms; one coefficient; find a constant; estimate $1.925^6$", "expand to $x^2$/$x^3$; state validity; approximate $\\sqrt{2}$; multiply two series; partial fractions first"],
      ["Marks", "4–8, AS Paper 1 and A-level Paper 1/2", "4–13, A-level Papers 1 and 2"]
    ] } },
    { callout: { t: "formula", h: "What the formulae booklet gives you (Pure Mathematics · Binomial series)", body: [
      "$$(a + b)^n = a^n + \\binom{n}{1}a^{n-1}b + \\binom{n}{2}a^{n-2}b^2 + \\ldots + \\binom{n}{r}a^{n-r}b^r + \\ldots + b^n \\quad (n \\in \\mathbb{N})$$",
      "$$\\text{where } \\binom{n}{r} = {}^nC_r = \\dfrac{n!}{r!\\,(n-r)!}$$",
      "$$(1 + x)^n = 1 + nx + \\dfrac{n(n-1)}{1 \\cdot 2}x^2 + \\ldots + \\dfrac{n(n-1)\\ldots(n-r+1)}{1 \\cdot 2 \\cdot \\ldots \\cdot r}x^r + \\ldots \\quad (|x| < 1,\\ n \\in \\mathbb{Q})$$",
      "Both formulae are printed. What is **not** printed: the rearrangement $(a + bx)^n = a^n\\left(1 + \\frac{b}{a}x\\right)^n$, the validity $|x| < \\left|\\frac{a}{b}\\right|$ that follows from it, and the judgement of which formula a question wants. Those are yours to know."
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**Positive integer $n$** — expanding $(a + bx)^n$, Pascal's triangle, $^nC_r$ and factorials, the general term for one coefficient, estimating a power, and the link to binomial probability (spec 1.1–1.6).",
      "**Rational $n$** — the infinite series, why it needs a validity condition, the $a^n$ rearrangement and the range $|x| < \\left|\\frac{a}{b}\\right|$ (2.1–2.4).",
      "**Approximation and accuracy** — choosing $x$, recovering $\\sqrt{2}$ or $\\sqrt{6}$ from an expansion, over/under-estimates, and what \"valid\" means in a question (2.5).",
      "**Products and partial fractions** — multiplying two series, and decomposing a rational function before expanding (2.6–2.7).",
      "**Exam toolkit** — command words, where the marks go, misconceptions, fx-991CW checks and memory aids."
    ] },
    "Every worked example is modelled on a real Edexcel question (the source is on its header) and every step carries the mark it earns. Read the working, cover it, redo it; a method you have only *read* is not yet yours.",

    /* ---------------------------------------------------------------- Page 1 */
    { page: "Positive integer n" },
    { h: "1.1  Expanding $(a + bx)^n$ for a positive integer $n$" },
    "Multiplying $(a + b)$ by itself $n$ times produces every product you can make by choosing $a$ or $b$ from each bracket. The term $a^{n-r}b^r$ arises once for every way of choosing which $r$ brackets contribute a $b$ — and there are $\\binom{n}{r}$ such ways. That single counting fact is the whole expansion:",
    { callout: { t: "formula", h: "Binomial theorem, positive integer $n$", body: [
      "$$(a + b)^n = a^n + \\binom{n}{1}a^{n-1}b + \\binom{n}{2}a^{n-2}b^2 + \\ldots + \\binom{n}{r}a^{n-r}b^r + \\ldots + b^n$$",
      "Powers of $a$ fall from $n$ to $0$, powers of $b$ rise from $0$ to $n$, and in every term the powers **add to $n$**. There are exactly $n + 1$ terms. With $b = $ the $x$-term of your bracket, ascending powers of $x$ come out in order."
    ] } },
    { callout: { t: "tip", h: "Why does it stop after $n + 1$ terms?", body: ["Two ways to see it.",
      { ul: [
        "**Counting:** you cannot choose $b$ from more brackets than there are, so $\\binom{n}{r} = 0$ for $r > n$.",
        "**Algebra:** written as $\\frac{n(n-1)(n-2)\\cdots(n-r+1)}{r!}$, the numerator of the coefficient of $x^{n+1}$ contains the factor $(n - n) = 0$ — and so does every coefficient after it."
      ] },
      "When $n$ is *not* a non-negative integer that factor never appears. That is exactly why the rational-$n$ series on the next page goes on for ever."] } },
    { h: "1.2  Pascal's triangle and the binomial coefficients" },
    "Row $n$ of Pascal's triangle lists $\\binom{n}{0}, \\binom{n}{1}, \\ldots, \\binom{n}{n}$ — the coefficients of $(a + b)^n$.",
    { ul: [
      "Each entry is the sum of the two above it: $\\binom{n}{r} = \\binom{n-1}{r-1} + \\binom{n-1}{r}$ (the *relation between binomial coefficients* the spec names).",
      "Every row is symmetric: $\\binom{n}{r} = \\binom{n}{n-r}$.",
      "Every row sums to $2^n$."
    ] },
    { table: { head: ["$n$", "coefficients of $(a + b)^n$", "sum"], rows: [
      ["0", "1", "1"], ["1", "1 1", "2"], ["2", "1 2 1", "4"], ["3", "1 3 3 1", "8"],
      ["4", "1 4 6 4 1", "16"], ["5", "1 5 10 10 5 1", "32"], ["6", "1 6 15 20 15 6 1", "64"],
      ["7", "1 7 21 35 35 21 7 1", "128"], ["8", "1 8 28 56 70 56 28 8 1", "256"]
    ] } },
    "Pascal is quick up to about $n = 8$. Beyond that — or when you only want one coefficient — use $^nC_r$ directly (1.3). Exam questions expect you to *evaluate* the coefficients: leaving $\\binom{9}{2}$ unsimplified in a final answer loses the accuracy mark.",
    { worked: { tag: "exam", title: "Expand $\\left(2 - \\frac{x}{16}\\right)^9$, first three terms in ascending powers of $x$", src: "AS June 2018 · P1 Q11(a) · 4 marks",
      q: "Find the first 3 terms, in ascending powers of $x$, of the binomial expansion of $\\left(2 - \\frac{x}{16}\\right)^9$, giving each term in its simplest form.",
      steps: [
        { h: "Identify $a$, $b$, $n$ — keep the sign inside $b$", m: "$a = 2$, $\\; b = -\\dfrac{x}{16}$, $\\; n = 9$.\nThe coefficients from Pascal / $^9C_r$ are $1,\\ 9,\\ 36, \\ldots$", n: "Writing $b = -\\frac{x}{16}$ (not $\\frac{x}{16}$) is what keeps every sign right later." },
        { h: "Write the terms with the powers still visible", m: "$$2^9 + \\binom{9}{1}\\,2^8\\left(-\\dfrac{x}{16}\\right) + \\binom{9}{2}\\,2^7\\left(-\\dfrac{x}{16}\\right)^2 + \\ldots$$", mk: "M1", n: "M1 for a correct binomial coefficient combined with the correct power of 2 and the correct power of $\\left(\\frac{x}{16}\\right)$ in term 2 or term 3." },
        { h: "Evaluate the constant term", m: "$2^9 = 512$", mk: "B1", n: "The first term is a stand-alone B1 — bank it even if the rest goes wrong." },
        { h: "Simplify term 2", m: "$9 \\times 256 \\times \\left(-\\dfrac{1}{16}\\right)x = -144x$", mk: "A1" },
        { h: "Simplify term 3", m: "$36 \\times 128 \\times \\dfrac{1}{256}x^2 = 18x^2$", mk: "A1", n: "$\\left(-\\frac{x}{16}\\right)^2 = +\\frac{x^2}{256}$: the square kills the sign. This is the term students most often get as $-18x^2$." }
      ], result: "$512 - 144x + 18x^2 + \\ldots$" } },
    { worked: { tag: "exam", title: "Expand $\\left(3 - \\frac{2x}{9}\\right)^8$, first four terms — a fraction in $b$", src: "AS June 2022 · P1 Q6(a) · 4 marks",
      q: "Find the first 4 terms, in ascending powers of $x$, of the binomial expansion of $\\left(3 - \\frac{2x}{9}\\right)^8$, giving each term in simplest form.",
      steps: [
        { h: "Set up with $a = 3$, $b = -\\frac{2x}{9}$, $n = 8$", m: "$$3^8 + \\binom{8}{1}3^7\\left(-\\dfrac{2x}{9}\\right) + \\binom{8}{2}3^6\\left(-\\dfrac{2x}{9}\\right)^2 + \\binom{8}{3}3^5\\left(-\\dfrac{2x}{9}\\right)^3 + \\ldots$$", mk: "M1", n: "$\\binom{8}{1} = 8$, $\\binom{8}{2} = 28$, $\\binom{8}{3} = 56$." },
        { h: "Constant term", m: "$3^8 = 6561$", mk: "B1", n: "Sight of $3^8$ or $6561$ scores this on its own." },
        { h: "Term in $x$", m: "$8 \\times 2187 \\times \\left(-\\dfrac{2}{9}\\right)x = 8 \\times (-486)x = -3888x$", n: "Cancel the 9 into $3^7 = 2187$ before multiplying: $2187 \\div 9 = 243$." },
        { h: "Term in $x^2$", m: "$28 \\times 729 \\times \\dfrac{4}{81}x^2 = 28 \\times 36\\,x^2 = 1008x^2$", mk: "A1", n: "A1 for a correct second OR fourth term with the coefficient evaluated." },
        { h: "Term in $x^3$", m: "$56 \\times 243 \\times \\left(-\\dfrac{8}{729}\\right)x^3 = 56 \\times \\left(-\\dfrac{8}{3}\\right)x^3 = -\\dfrac{448}{3}x^3$", mk: "A1", n: "\"Simplest form\" means the exact fraction $-\\frac{448}{3}$; $-149.3$ rounded loses the mark, $-149.\\dot{3}$ is allowed." }
      ], result: "$6561 - 3888x + 1008x^2 - \\dfrac{448}{3}x^3 + \\ldots$" } },
    { callout: { t: "tip", h: "Two routes, one answer — pick the one you will not slip on", body: ["You may instead take the $a$ out:",
      "$$\\left(2 - \\frac{x}{16}\\right)^9 = 2^9\\left(1 - \\frac{x}{32}\\right)^9 = 512\\left(1 - 9 \\cdot \\frac{x}{32} + 36 \\cdot \\frac{x^2}{1024} - \\ldots\\right)$$",
      "This is the same manoeuvre the rational-$n$ page *requires*, so it is worth practising here. The mark scheme accepts either route.",
      "The trap in this route: forgetting to multiply **every** term by $2^9$, not just the first."] } },
    { h: "1.3  $^nC_r$ notation, factorials and the alternatives" },
    { kv: [
      ["$n!$ (\"$n$ factorial\")", "$n! = n \\times (n-1) \\times (n-2) \\times \\ldots \\times 2 \\times 1$, and by definition $0! = 1$. So $5! = 120$, $6! = 720$, $10! = 3\\,628\\,800$."],
      ["$^nC_r$ — the number of ways of choosing $r$ objects from $n$", "$${}^nC_r = \\binom{n}{r} = \\dfrac{n!}{r!\\,(n-r)!}$$ All three spellings — $^nC_r$, $\\binom{n}{r}$ and $nCr$ on a calculator — mean the same number. Edexcel questions use whichever they like, so read them all fluently."],
      ["Values you should just know", "$\\binom{n}{0} = \\binom{n}{n} = 1$, $\\quad \\binom{n}{1} = \\binom{n}{n-1} = n$, $\\quad \\binom{n}{2} = \\frac{n(n-1)}{2}$, $\\quad \\binom{n}{r} = \\binom{n}{n-r}$."],
      ["Hand evaluation — cancel before you multiply", "$\\binom{9}{2} = \\frac{9 \\times 8}{2!} = 36$; $\\quad \\binom{8}{3} = \\frac{8 \\times 7 \\times 6}{3!} = \\frac{336}{6} = 56$; $\\quad \\binom{12}{2} = \\frac{12 \\times 11}{2} = 66$. Write $r$ falling factors on top over $r!$ below — you never need the full $n!$."],
      ["On the fx-991CW", "Type $n$, then **CATALOG → Probability → nCr**, then $r$, then **EXE**. So $9$, CATALOG, Probability, nCr, $2$, EXE gives 36. The key sequence for $x!$ is in the same Probability menu."]
    ] },
    { callout: { t: "warn", h: "The same symbol, two topics", body: ["In this topic $\\binom{n}{r}$ is a *coefficient*.",
      "In Statistics (Paper 3, binomial distribution) the same $\\binom{n}{r}$ counts the arrangements of $r$ successes in $n$ trials: $P(X = r) = \\binom{n}{r}p^r(1 - p)^{n-r}$.",
      "They are the same number for the same reason — see 1.6. But do not let a probability formula wander into a Pure expansion, or vice versa."] } },
    { h: "1.4  Finding one specific term or coefficient — the general term" },
    "When a question asks for *the coefficient of $x^5$* or *the constant term* you should not expand everything. Pick out the one term you want with the general term and evaluate only that.",
    { callout: { t: "memorise", h: "The general term (term number $r + 1$)", body: [
      "$$T_{r+1} = \\binom{n}{r}a^{n-r}b^r \\qquad \\text{the term containing } b^r$$",
      "With $b = cx$ the term in $x^r$ is $\\binom{n}{r}a^{n-r}c^r x^r$. Label which term you are finding — \"term in $x^4$: $r = 4$\" — before you touch a number. **Coefficient** means the number multiplying $x^r$; **term** means number and $x^r$ together. Give the one the question asks for."
    ] } },
    { worked: { tag: "exam", title: "Find a constant from one given coefficient", src: "A-level Oct 2020 · P2 Q4 · 3 marks",
      q: "In the binomial expansion of $(a + 2x)^7$, where $a$ is a constant, the coefficient of $x^4$ is $15\\,120$. Find the value of $a$.",
      steps: [
        { h: "Write down only the $x^4$ term", m: "$r = 4$: $\\quad \\binom{7}{4}a^{3}(2x)^4 = 35 \\times a^3 \\times 16x^4 = 560a^3x^4$", mk: "M1", n: "The power of $a$ is $n - r = 3$: the powers must add to 7. $\\binom{7}{4} = \\binom{7}{3} = 35$." },
        { h: "Equate the coefficient to the given value", m: "$560a^3 = 15\\,120 \\;\\Rightarrow\\; a^3 = 27$", mk: "M1" },
        { h: "Solve", m: "$a = 3$", mk: "A1", n: "A cube root has one real value — no $\\pm$. (For an even power you must consider both signs.)" }
      ], result: "$a = 3$" } },
    { worked: { tag: "exam", title: "A given term fixes $a$; then a constant term in a product", src: "AS Nov 2021 · P1 Q8 · 7 marks",
      q: "$g(x) = (2 + ax)^8$ where $a$ is a constant. Given that one of the terms in the binomial expansion of $g(x)$ is $3402x^5$, **(a)** find the value of $a$. Using this value of $a$, **(b)** find the constant term in the expansion of $\\left(1 + \\frac{1}{x^4}\\right)(2 + ax)^8$.",
      steps: [
        { h: "(a) Select the $x^5$ term", m: "$\\binom{8}{5}\\,2^3\\,(ax)^5 = 56 \\times 8 \\times a^5x^5 = 448a^5x^5$", mk: "M1", n: "$\\binom{8}{5} = \\binom{8}{3} = 56$. Missing brackets on $(ax)^5$ — writing $ax^5$ — is condoned for the M but will wreck the A." },
        { m: "$448a^5 = 3402 \\;\\Rightarrow\\; a^5 = \\dfrac{3402}{448} = \\dfrac{243}{32}$", mk: "A1 M1", n: "A1 for $448a^5$; M1 for setting it equal to 3402 and reaching $a^5 = k$." },
        { m: "$a = \\sqrt[5]{\\dfrac{243}{32}} = \\dfrac{3}{2}$", mk: "A1", n: "$243 = 3^5$ and $32 = 2^5$ — recognise the fifth powers; the calculator confirms $1.5$." },
        { h: "(b) Which products give a constant?", m: "$\\left(1 + \\dfrac{1}{x^4}\\right)(2 + ax)^8$: a constant comes from $1 \\times (\\text{constant term})$ and from $\\dfrac{1}{x^4} \\times (\\text{term in } x^4)$.", mk: "M1", n: "A negative power in the first bracket **shifts** which term of the expansion you need. This is the step people miss — they take only $2^8$." },
        { m: "constant term of $(2 + ax)^8$: $2^8 = 256$\nterm in $x^4$: $\\binom{8}{4}\\,2^4\\left(\\dfrac{3}{2}\\right)^4x^4 = 70 \\times 16 \\times \\dfrac{81}{16}x^4 = 5670x^4$", mk: "dM1", n: "dM1 — dependent on the previous M — for attempting the sum of both contributions." },
        { m: "constant term $= 256 + 5670 = 5926$", mk: "A1" }
      ], result: "(a) $a = \\dfrac{3}{2}$ (b) $5926$" } },
    { worked: { tag: "exam", title: "One coefficient of a product — two contributions", src: "AS June 2023 · P1 Q14 · 5 marks",
      q: "Find, in simplest form, the coefficient of $x^5$ in the expansion of $\\left(5 + 8x^2\\right)\\left(3 - \\frac{1}{2}x\\right)^6$.",
      steps: [
        { h: "Decide which terms of $\\left(3 - \\frac12 x\\right)^6$ are needed", m: "$5 \\times (\\text{term in } x^5) \\;+\\; 8x^2 \\times (\\text{term in } x^3)$", n: "$x^2 \\cdot x^3 = x^5$: the $8x^2$ pairs with the $x^3$ term. Write this line first — it is the plan the M marks reward." },
        { h: "Term in $x^5$ of $\\left(3 - \\frac12 x\\right)^6$", m: "$\\binom{6}{5}\\,3^1\\left(-\\dfrac{1}{2}x\\right)^5 = 6 \\times 3 \\times \\left(-\\dfrac{1}{32}\\right)x^5 = -\\dfrac{9}{16}x^5$", mk: "M1 A1", n: "Odd power of a negative $b$ keeps the minus sign." },
        { h: "Term in $x^3$", m: "$\\binom{6}{3}\\,3^3\\left(-\\dfrac{1}{2}x\\right)^3 = 20 \\times 27 \\times \\left(-\\dfrac{1}{8}\\right)x^3 = -\\dfrac{135}{2}x^3$", mk: "M1", n: "Either term correct earns the first M1 A1; the second M1 is for the other required term." },
        { h: "Combine", m: "$5 \\times \\left(-\\dfrac{9}{16}\\right) + 8 \\times \\left(-\\dfrac{135}{2}\\right) = -\\dfrac{45}{16} - 540 = -\\dfrac{8685}{16}$", mk: "M1 A1", n: "\"Simplest form\": one fraction, not $-\\frac{45}{16} - 540$." }
      ], result: "coefficient of $x^5$ is $-\\dfrac{8685}{16}$" } },
    { worked: { tag: "exam", title: "Unknown $k$ inside the bracket; a relation between coefficients", src: "AS June 2020 · P1 Q6 · 6 marks",
      q: "**(a)** Find the first 4 terms, in ascending powers of $x$, of the binomial expansion of $(1 + kx)^{10}$ where $k$ is a non-zero constant. Write each coefficient as simply as possible. **(b)** Given that in the expansion the coefficient of $x^3$ is 3 times the coefficient of $x$, find the possible values of $k$.",
      steps: [
        { h: "(a) Leading 1, so no rearrangement — expand with $b = kx$", m: "$$1 + \\binom{10}{1}kx + \\binom{10}{2}(kx)^2 + \\binom{10}{3}(kx)^3 + \\ldots$$", mk: "M1" },
        { m: "$= 1 + 10kx + 45k^2x^2 + 120k^3x^3 + \\ldots$", mk: "A1 A1", n: "$(kx)^3 = k^3x^3$ — the constant is cubed too. Leaving $45kx^2$ is the classic error." },
        { h: "(b) Translate the sentence into an equation", m: "$120k^3 = 3 \\times 10k$", mk: "M1", n: "\"3 times the coefficient of $x$\" — the 3 multiplies the *smaller* coefficient." },
        { m: "$120k^3 - 30k = 0 \\;\\Rightarrow\\; 30k(4k^2 - 1) = 0$\n$k \\neq 0$, so $k^2 = \\dfrac14$", mk: "A1", n: "Dividing straight through by $k$ is fine here *because the question says $k$ is non-zero* — say so." },
        { m: "$k = \\pm\\dfrac{1}{2}$", mk: "A1", n: "Both values. An even power means two roots; giving only $+\\frac12$ loses the last mark." }
      ], result: "(a) $1 + 10kx + 45k^2x^2 + 120k^3x^3$ (b) $k = \\dfrac12$ or $k = -\\dfrac12$" } },
    { worked: { tag: "exam", title: "\"Show that\" a constant, then find another, then estimate a power", src: "AS June 2024 · P1 Q6 · 6 marks",
      q: "The binomial expansion of $(1 + ax)^{12}$ up to and including the term in $x^2$ is $1 - \\frac{15}{2}x + kx^2$, where $a$ and $k$ are constants. **(a)** Show that $a = -\\frac58$. **(b)** Hence find the value of $k$. **(c)** Using the expansion and making your method clear, find an estimate for the value of $\\left(\\frac{17}{16}\\right)^{12}$, giving your answer to 4 decimal places.",
      steps: [
        { h: "(a) Match the $x$ coefficients", m: "term in $x$: $\\binom{12}{1}ax = 12ax$, so $12a = -\\dfrac{15}{2}$", mk: "M1", n: "A \"show that\" needs the equation written, not just the answer copied down." },
        { m: "$a = -\\dfrac{15}{24} = -\\dfrac{5}{8}$", mk: "A1*", n: "A1* — the starred mark needs a complete, error-free argument ending at the printed value." },
        { h: "(b) Match the $x^2$ coefficients", m: "$k = \\binom{12}{2}a^2 = 66 \\times \\dfrac{25}{64} = \\dfrac{1650}{64} = \\dfrac{825}{32}$", mk: "M1 A1", n: "$a^2$ is positive whatever the sign of $a$." },
        { h: "(c) Choose $x$ so that $1 + ax = \\frac{17}{16}$", m: "$1 - \\dfrac{5}{8}x = \\dfrac{17}{16} \\;\\Rightarrow\\; -\\dfrac58 x = \\dfrac{1}{16} \\;\\Rightarrow\\; x = -\\dfrac{1}{10}$", mk: "M1", n: "\"Making your method clear\" = show this line. Then substitute into the *expansion*, never into the original bracket (that would just be the calculator)." },
        { m: "$\\left(\\dfrac{17}{16}\\right)^{12} \\approx 1 - \\dfrac{15}{2}\\left(-\\dfrac{1}{10}\\right) + \\dfrac{825}{32}\\left(-\\dfrac{1}{10}\\right)^2 = 1 + 0.75 + 0.2578125 = 2.0078$", mk: "A1", n: "The true value is $2.0699$: a 3-term truncation of a 13-term expansion is crude when the terms do not shrink fast ($ax = \\frac{1}{16}$ but $n = 12$ is large). The mark is for the correct *method*, and you should be ready to say why the estimate is poor if asked." }
      ], result: "(a) $a = -\\dfrac58$ (b) $k = \\dfrac{825}{32}$ (c) $\\approx 2.0078$" } },
    { worked: { tag: "exam", title: "Unknown linear factor in front; equate two terms", src: "AS June 2018 · P1 Q11(b)(c) · 4 marks",
      q: "$f(x) = (a + bx)\\left(2 - \\frac{x}{16}\\right)^9$, where $a$ and $b$ are constants. Given that the first two terms, in ascending powers of $x$, in the series expansion of $f(x)$ are $128$ and $36x$, **(b)** find the value of $a$, **(c)** find the value of $b$.",
      steps: [
        { h: "Use the expansion from part (a)", m: "$f(x) = (a + bx)(512 - 144x + 18x^2 - \\ldots)$", n: "Never re-expand — \"hence\" or a lettered follow-on means reuse." },
        { h: "(b) Constant term", m: "$512a = 128 \\;\\Rightarrow\\; a = \\dfrac{1}{4}$", mk: "M1 A1" },
        { h: "(c) Coefficient of $x$: two contributions", m: "$a \\times (-144) + b \\times 512 = 36$\n$-36 + 512b = 36 \\;\\Rightarrow\\; 512b = 72 \\;\\Rightarrow\\; b = \\dfrac{9}{64}$", mk: "M1 A1", n: "The $x$ term of a product is (constant × $x$-term) + ($x$-term × constant). Forgetting the first product gives $b = \\frac{36}{512}$ and M0." }
      ], result: "$a = \\dfrac14$, $\\; b = \\dfrac{9}{64}$" } },
    { worked: { tag: "exam", title: "Negative powers of $x$ in front — the hardest AS variant", src: "AS June 2025 · P1 Q14 · 7 marks",
      q: "$f(x) = (1 + kx)^8$ where $k$ is a constant. Given that the first 3 terms, in ascending powers of $x$, of the binomial series expansion of $f(x)$ are $1 + 8kx + px^2$, **(a)** find $p$ in terms of $k$. $g(x) = \\left(a - \\frac{2}{x}\\right)f(x)$, $x \\neq 0$, where $a$ is a constant. Given that the first 3 terms of the series expansion of $g(x)$ are $-\\frac{2}{x} - 21 - 90x$, **(b)** find the possible pairs of values of $a$ and $k$.",
      steps: [
        { h: "(a)", m: "$p = \\binom{8}{2}k^2 = 28k^2$", mk: "M1 A1" },
        { h: "(b) Multiply out, collecting by power of $x$", m: "$\\left(a - \\dfrac{2}{x}\\right)\\left(1 + 8kx + 28k^2x^2 + \\ldots\\right)$\n$= -\\dfrac{2}{x} + \\big(a - 16k\\big) + \\big(8ka - 56k^2\\big)x + \\ldots$", n: "$-\\frac{2}{x} \\times 8kx = -16k$ lands in the **constant**; $-\\frac{2}{x} \\times 28k^2x^2 = -56k^2x$ lands in the $x$ term. Each power of $x$ in $g$ collects one term from each column." },
        { h: "Equate the constant and the $x$ coefficient", m: "$a - 16k = -21 \\qquad (1)$\n$8ka - 56k^2 = -90 \\qquad (2)$", mk: "M1 A1ft", n: "Two equations, no $x$'s left in them. A1ft — follow-through on your $p$ from (a)." },
        { h: "Substitute (1) into (2) and solve the quadratic", m: "$8k(16k - 21) - 56k^2 = -90$\n$128k^2 - 168k - 56k^2 + 90 = 0 \\;\\Rightarrow\\; 72k^2 - 168k + 90 = 0 \\;\\Rightarrow\\; 12k^2 - 28k + 15 = 0$\n$(2k - 3)(6k - 5) = 0 \\;\\Rightarrow\\; k = \\dfrac32 \\text{ or } k = \\dfrac56$", mk: "dM1 A1", n: "A three-term quadratic set equal to zero, solved by any valid method (calculator allowed, but write the quadratic)." },
        { h: "Pair each $k$ with its $a$", m: "$k = \\dfrac32 \\Rightarrow a = 24 - 21 = 3$\n$k = \\dfrac56 \\Rightarrow a = \\dfrac{40}{3} - 21 = -\\dfrac{23}{3}$", mk: "A1", n: "\"Possible pairs\" — the final A1 is for both pairs, correctly paired and labelled. Unpaired lists score A0." }
      ], result: "(a) $p = 28k^2$ (b) $a = 3,\\ k = \\dfrac32$ or $a = -\\dfrac{23}{3},\\ k = \\dfrac56$" } },
    { h: "1.5  Approximation using a positive-integer expansion" },
    "Because the finite expansion is *exact*, substituting any $x$ into the **whole** of it gives the exact value of $(a + bx)^n$.",
    "The approximation comes from **truncating** — keeping the first few terms. That is only good when the later terms are small, which needs $|bx|$ small compared with $a$, and in practice $|x|$ small.",
    { callout: { t: "memorise", h: "Method for \"use your expansion to estimate\"", body: [
      "1. Set the bracket equal to the number you want: $a + bx = \\text{target}$, and solve for $x$.",
      "2. Check $x$ is small (typically $|x| \\le 0.1$). If the question offers a choice, the smaller $|x|$ is the better one.",
      "3. Substitute that $x$ into the **expansion** (the polynomial), not into the bracket.",
      "4. Add up; round as asked; if asked, comment on accuracy using the size or sign of the first omitted term."
    ] } },
    { worked: { tag: "exam", title: "Estimate $1.925^6$ from $\\left(2 + \\frac{3x}{4}\\right)^6$", src: "AS June 2019 · P1 Q8 · 5 marks",
      q: "**(a)** Find the first 3 terms, in ascending powers of $x$, of the binomial expansion of $\\left(2 + \\frac{3x}{4}\\right)^6$, giving each term in its simplest form. **(b)** Explain how you could use your expansion to estimate the value of $1.925^6$. You do not need to perform the calculation.",
      steps: [
        { h: "(a) Expand", m: "$2^6 + \\binom{6}{1}2^5\\left(\\dfrac{3x}{4}\\right) + \\binom{6}{2}2^4\\left(\\dfrac{3x}{4}\\right)^2 + \\ldots$\n$= 64 + 6 \\times 32 \\times \\dfrac34 x + 15 \\times 16 \\times \\dfrac{9}{16}x^2 = 64 + 144x + 135x^2 + \\ldots$", mk: "B1 M1 A1 A1", n: "B1 for $2^6 = 64$; M1 for the structure; A1 each for $144x$ and $135x^2$." },
        { h: "(b) Solve the bracket for $x$", m: "$2 + \\dfrac{3x}{4} = 1.925 \\;\\Rightarrow\\; \\dfrac{3x}{4} = -0.075 \\;\\Rightarrow\\; x = -0.1$", mk: "B1ft", n: "The mark is for **stating** $x = -0.1$ (or $-\\frac{1}{10}$) *and* saying you substitute it into the expansion from (a). \"Substitute $x = -0.1$\" alone, without saying where, is B0." },
        { h: "If you did compute it", m: "$64 + 144(-0.1) + 135(0.01) = 64 - 14.4 + 1.35 = 50.95$", n: "True value $50.884$; the omitted $x^3$ term is $\\binom{6}{3}2^3\\left(\\frac{3}{4}\\right)^3(-0.1)^3 = -0.0675$, which accounts for most of the gap." }
      ], result: "(a) $64 + 144x + 135x^2$ (b) substitute $x = -0.1$ into the expansion" } },
    { h: "1.6  Binomial coefficients and probability — the conceptual link" },
    "Put $a = q = 1 - p$ and $b = p$ into the theorem:",
    "$$(q + p)^n = \\sum_{r=0}^{n}\\binom{n}{r}q^{n-r}p^r$$",
    { ul: [
      "Each term is exactly $P(X = r)$ for $X \\sim B(n, p)$: the number of ways of placing $r$ successes among $n$ trials, times the probability of any one such arrangement.",
      "Since $q + p = 1$, the left-hand side is $1^n = 1$ — the probabilities sum to 1 *because* of the binomial theorem.",
      "That is why the distribution is called binomial, and why the spec says the notations *link to binomial probabilities*."
    ] },
    "Nothing else from this page is needed in Paper 3 — but this is the fact that makes $\\binom{n}{r}$ feel like one idea rather than two.",

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Rational n" },
    { h: "2.1  The general binomial series for $(1 + x)^n$, any rational $n$" },
    "Replace $\\binom{n}{r}$ by the product form $\\frac{n(n-1)(n-2)\\cdots(n-r+1)}{r!}$ — which is what $\\binom{n}{r}$ *is* for a positive integer — and the theorem keeps making sense when $n$ is negative or a fraction. The price is that the series no longer stops, and it is only equal to $(1 + x)^n$ for $|x| < 1$.",
    { callout: { t: "formula", h: "Binomial series, $n \\in \\mathbb{Q}$", body: [
      "$$(1 + x)^n = 1 + nx + \\dfrac{n(n-1)}{2!}x^2 + \\dfrac{n(n-1)(n-2)}{3!}x^3 + \\ldots + \\dfrac{n(n-1)\\cdots(n-r+1)}{r!}x^r + \\ldots \\qquad |x| < 1$$",
      "The $r$th coefficient has **$r$ falling factors** on top and **$r!$** underneath. For the $x^3$ term: three factors $n(n-1)(n-2)$ over $3! = 6$. Count the factors every time — a fourth factor sneaking into the $x^3$ coefficient is the single most common slip."
    ] } },
    { callout: { t: "tip", h: "Why is there a validity condition at all — and why $|x| < 1$?", body: ["Take $n = -1$. The series is $1 - x + x^2 - x^3 + \\ldots$ — a **geometric series** with first term 1 and ratio $-x$.",
      { ul: [
        "You already know that sum is $\\frac{1}{1 + x}$ only when $|{-x}| < 1$.",
        "At $x = 2$ the terms $1, -2, 4, -8, \\ldots$ grow without limit, while $\\frac{1}{1+2} = \\frac13$ sits there quietly.",
        "Every other rational $n$ behaves the same way: the ratio of consecutive terms is $\\frac{n - r}{r + 1}x$, which tends to $-x$ as $r$ grows. So the tail is *eventually geometric* with ratio of size $|x|$ — convergent for $|x| < 1$, divergent for $|x| > 1$."
      ] },
      "The finite positive-integer expansion has no tail, which is why it has no condition."] } },
    { worked: { tag: "exam", title: "$(1 + 8x)^{\\frac12}$ — already in $(1 + \\ldots)^n$ form, four terms", src: "A-level Oct 2020 · P1 Q1(a) · 3 marks",
      q: "Find the first four terms, in ascending powers of $x$, of the binomial expansion of $(1 + 8x)^{\\frac12}$, giving each term in simplest form.",
      steps: [
        { h: "Write the series with $n = \\frac12$ and $x \\to 8x$, brackets on", m: "$$1 + \\tfrac12(8x) + \\dfrac{\\tfrac12\\left(-\\tfrac12\\right)}{2!}(8x)^2 + \\dfrac{\\tfrac12\\left(-\\tfrac12\\right)\\left(-\\tfrac32\\right)}{3!}(8x)^3 + \\ldots$$", mk: "M1", n: "M1 for the correct structure of term 3 or term 4 — correct coefficient with the correct power of $(8x)$. Keep the brackets: $(8x)^2 = 64x^2$, not $8x^2$." },
        { h: "Evaluate the coefficients", m: "$\\dfrac{\\tfrac12 \\cdot \\left(-\\tfrac12\\right)}{2} = -\\dfrac18, \\qquad \\dfrac{\\tfrac12 \\cdot \\left(-\\tfrac12\\right) \\cdot \\left(-\\tfrac32\\right)}{6} = \\dfrac{\\tfrac38}{6} = \\dfrac{1}{16}$", n: "Two negatives in the $x^3$ coefficient make it positive." },
        { h: "Simplify each term", m: "$1 + 4x - \\dfrac18 \\cdot 64x^2 + \\dfrac{1}{16} \\cdot 512x^3 = 1 + 4x - 8x^2 + 32x^3 + \\ldots$", mk: "A1 A1", n: "A1 for two correct simplified terms, A1 for all four." }
      ], result: "$1 + 4x - 8x^2 + 32x^3 + \\ldots$, valid for $|8x| < 1$, i.e. $|x| < \\dfrac18$" } },
    { worked: { tag: "exam", title: "$(1 - 9x)^{\\frac12}$ — a negative $b$: every sign has to be tracked", src: "A-level June 2024 · P1 Q2(a) · 3 marks",
      q: "Find, in ascending powers of $x$, the first four terms of the binomial expansion of $(1 - 9x)^{\\frac12}$, giving each term in simplest form.",
      steps: [
        { h: "Substitute $(-9x)$ for $x$ — in brackets", m: "$$1 + \\tfrac12(-9x) + \\dfrac{\\tfrac12\\left(-\\tfrac12\\right)}{2!}(-9x)^2 + \\dfrac{\\tfrac12\\left(-\\tfrac12\\right)\\left(-\\tfrac32\\right)}{3!}(-9x)^3 + \\ldots$$", mk: "M1" },
        { h: "Powers of $(-9x)$", m: "$(-9x)^2 = +81x^2, \\qquad (-9x)^3 = -729x^3$", n: "Even power: positive. Odd power: negative. Write them out — do not do it in your head." },
        { h: "Combine signs with the coefficients", m: "$1 - \\dfrac92 x + \\left(-\\dfrac18\\right)(81x^2) + \\left(\\dfrac{1}{16}\\right)(-729x^3)$\n$= 1 - \\dfrac92 x - \\dfrac{81}{8}x^2 - \\dfrac{729}{16}x^3 + \\ldots$", mk: "A1 A1", n: "For $(1 - cx)^{\\frac12}$ **every term after the first is negative** — a useful check. Decimal equivalents $-4.5,\\ -10.125,\\ -45.5625$ are accepted because they are exact." }
      ], result: "$1 - \\dfrac92 x - \\dfrac{81}{8}x^2 - \\dfrac{729}{16}x^3 + \\ldots$, valid for $|x| < \\dfrac19$" } },
    { worked: { tag: "check", title: "Three expansions worth recognising on sight", src: "derived from the series",
      steps: [
        { h: "$n = -1$", m: "$(1 + x)^{-1} = 1 - x + x^2 - x^3 + \\ldots \\qquad (1 - x)^{-1} = 1 + x + x^2 + x^3 + \\ldots$", n: "Geometric series. The second one is the sum to infinity formula $\\frac{a}{1 - r}$ read backwards." },
        { h: "$n = -2$", m: "$(1 + x)^{-2} = 1 - 2x + 3x^2 - 4x^3 + \\ldots$", n: "Coefficients $1, 2, 3, 4$ with alternating signs: $\\frac{(-2)(-3)}{2} = 3$, $\\frac{(-2)(-3)(-4)}{6} = -4$." },
        { h: "$n = \\frac12$", m: "$(1 + x)^{\\frac12} = 1 + \\dfrac12 x - \\dfrac18 x^2 + \\dfrac{1}{16}x^3 - \\ldots$", n: "The $-\\frac18$ and $+\\frac{1}{16}$ recur in every square-root question; knowing them lets you check the working above at a glance." }
      ] } },
    { callout: { t: "warn", h: "Bracket discipline", body: ["The series is in terms of *the thing that is added to 1*. If that thing is $-9x$ then it is $(-9x)^2$ and $(-9x)^3$ that appear — not $-9x^2$.",
      { ul: [
        "Mark schemes explicitly \"condone missing brackets\" for the M mark — and then explicitly refuse the A marks when the missing bracket changes the answer.",
        "Also refused: writing the coefficients as $\\binom{\\frac12}{2}$. That notation is not defined for a fraction on top."
      ] }] } },
    { h: "2.2  Rearranging $(a + bx)^n \\to a^n\\left(1 + \\frac{b}{a}x\\right)^n$" },
    "The series was derived for a bracket that begins with **1**. Applying it to $4 + 5x$ directly — $1 + \\frac12(4 + 5x) + \\ldots$ — is not even wrong in an interesting way: the \"1 +\" has nothing to do with $(4 + 5x)^{\\frac12}$, whose value at $x = 0$ is 2. So first take out the $a$:",
    { callout: { t: "memorise", h: "The rearrangement — and the two places its marks are lost", body: [
      "$$(a + bx)^n = \\left[a\\left(1 + \\dfrac{b}{a}x\\right)\\right]^n = a^n\\left(1 + \\dfrac{b}{a}x\\right)^n$$",
      "Then expand $\\left(1 + \\frac{b}{a}x\\right)^n$ with $X = \\frac{b}{a}x$ in the series and multiply **every** term by $a^n$.",
      { ul: [
        "Lost mark 1: **forgetting $a^n$** altogether — you get $1 + \\ldots$ where the constant should be $a^n$.",
        "Lost mark 2: **applying $a^n$ to the first term only.** The mark scheme's words: \"if the 2 outside this expansion is only partially applied then score A0\"."
      ] }
    ] } },
    { worked: { tag: "exam", title: "$(4 + 5x)^{\\frac12}$ to $x^2$ — the B1 for taking out the 4", src: "A-level Specimen · P1 Q2(a) · 4 marks",
      q: "Show that the binomial expansion of $(4 + 5x)^{\\frac12}$ in ascending powers of $x$, up to and including the term in $x^2$, is $2 + \\frac54 x + kx^2$, giving the value of the constant $k$ as a simplified fraction.",
      steps: [
        { h: "Take out $4^{\\frac12}$", m: "$(4 + 5x)^{\\frac12} = 4^{\\frac12}\\left(1 + \\dfrac{5x}{4}\\right)^{\\frac12} = 2\\left(1 + \\dfrac{5}{4}x\\right)^{\\frac12}$", mk: "B1", n: "$a^n = 4^{\\frac12} = 2$: the constant term of the final answer. If your answer does not start with 2, stop and find the missing factor." },
        { h: "Expand the bracket with $X = \\frac54 x$, $n = \\frac12$", m: "$$2\\left[1 + \\tfrac12\\left(\\dfrac{5x}{4}\\right) + \\dfrac{\\tfrac12\\left(-\\tfrac12\\right)}{2!}\\left(\\dfrac{5x}{4}\\right)^2 + \\ldots\\right]$$", mk: "M1 A1ft", n: "M1 for at least two correct terms of the inner expansion; A1ft for a fully correct unsimplified inner expansion with consistent $\\left(\\frac{5x}{4}\\right)$." },
        { h: "Multiply through by 2 and simplify", m: "$= 2\\left[1 + \\dfrac58 x - \\dfrac18 \\cdot \\dfrac{25}{16}x^2 + \\ldots\\right] = 2 + \\dfrac54 x - \\dfrac{25}{64}x^2 + \\ldots$", mk: "A1", n: "The 2 hits all three terms. The printed $\\frac54 x$ confirms your route; $k = -\\frac{25}{64}$ is what is being asked for." }
      ], result: "$k = -\\dfrac{25}{64}$; the expansion is $2 + \\dfrac54 x - \\dfrac{25}{64}x^2 + \\ldots$" } },
    { worked: { tag: "exam", title: "$\\sqrt{4 - 9x}$, four terms — negative $b$ and $a^n$ together", src: "A-level June 2022 · P2 Q7(a) · 4 marks",
      q: "Find the first four terms, in ascending powers of $x$, of the binomial expansion of $\\sqrt{4 - 9x}$, writing each term in simplest form.",
      steps: [
        { h: "Rewrite the root as a power and take out $4^{\\frac12}$", m: "$\\sqrt{4 - 9x} = (4 - 9x)^{\\frac12} = 2\\left(1 - \\dfrac{9}{4}x\\right)^{\\frac12}$", mk: "B1" },
        { h: "Expand with $X = -\\frac94 x$", m: "$$2\\left[1 + \\tfrac12\\left(-\\dfrac{9x}{4}\\right) + \\dfrac{\\tfrac12\\left(-\\tfrac12\\right)}{2!}\\left(-\\dfrac{9x}{4}\\right)^2 + \\dfrac{\\tfrac12\\left(-\\tfrac12\\right)\\left(-\\tfrac32\\right)}{3!}\\left(-\\dfrac{9x}{4}\\right)^3 + \\ldots\\right]$$", mk: "M1 A1" },
        { h: "Simplify inside", m: "$2\\left[1 - \\dfrac98 x - \\dfrac18 \\cdot \\dfrac{81}{16}x^2 + \\dfrac{1}{16}\\cdot\\left(-\\dfrac{729}{64}\\right)x^3\\right] = 2\\left[1 - \\dfrac98 x - \\dfrac{81}{128}x^2 - \\dfrac{729}{1024}x^3\\right]$" },
        { h: "Multiply every term by 2", m: "$= 2 - \\dfrac94 x - \\dfrac{81}{64}x^2 - \\dfrac{729}{512}x^3 + \\ldots$", mk: "A1", n: "All terms after the first are negative — the pattern for $(1 - X)^{\\frac12}$ — and this fact is exactly what part (b) of the real question then asks about (see the approximation page)." }
      ], result: "$2 - \\dfrac94 x - \\dfrac{81}{64}x^2 - \\dfrac{729}{512}x^3 + \\ldots$, valid for $|x| < \\dfrac49$" } },
    { worked: { tag: "exam", title: "$\\frac{1}{\\sqrt{4 - x}}$ — a negative fractional index and $a^n = 4^{-\\frac12}$", src: "A-level June 2019 · P1 Q4(a) · 4 marks",
      q: "Find the first three terms, in ascending powers of $x$, of the binomial expansion of $\\frac{1}{\\sqrt{4 - x}}$, giving each coefficient in its simplest form.",
      steps: [
        { h: "Index form, then take out the 4", m: "$\\dfrac{1}{\\sqrt{4 - x}} = (4 - x)^{-\\frac12} = 4^{-\\frac12}\\left(1 - \\dfrac{x}{4}\\right)^{-\\frac12} = \\dfrac12\\left(1 - \\dfrac{x}{4}\\right)^{-\\frac12}$", mk: "B1", n: "$4^{-\\frac12} = \\frac{1}{\\sqrt4} = \\frac12$. Index laws first; the binomial does nothing until the bracket starts with 1." },
        { h: "Expand with $n = -\\frac12$, $X = -\\frac{x}{4}$", m: "$$\\dfrac12\\left[1 + \\left(-\\tfrac12\\right)\\left(-\\dfrac{x}{4}\\right) + \\dfrac{\\left(-\\tfrac12\\right)\\left(-\\tfrac32\\right)}{2!}\\left(-\\dfrac{x}{4}\\right)^2 + \\ldots\\right]$$", mk: "M1 A1", n: "$n - 1 = -\\frac12 - 1 = -\\frac32$. Subtracting 1 from a negative fraction is where the sign errors start." },
        { h: "Simplify", m: "$\\dfrac12\\left[1 + \\dfrac{x}{8} + \\dfrac38 \\cdot \\dfrac{x^2}{16} + \\ldots\\right] = \\dfrac12 + \\dfrac{1}{16}x + \\dfrac{3}{256}x^2 + \\ldots$", mk: "A1", n: "Two negatives in term 2 make it positive; $\\frac{3}{8} \\times \\frac{1}{16} = \\frac{3}{128}$, halved is $\\frac{3}{256}$." }
      ], result: "$\\dfrac12 + \\dfrac{1}{16}x + \\dfrac{3}{256}x^2 + \\ldots$, valid for $|x| < 4$" } },
    { worked: { tag: "exam", title: "$(3 + x)^{-2}$ — a negative integer index; $a^n = \\frac19$", src: "A-level June 2023 · P2 Q13(a) · 4 marks",
      q: "Find the first three terms, in ascending powers of $x$, of the binomial expansion of $(3 + x)^{-2}$, writing each term in simplest form.",
      steps: [
        { h: "Take out $3^{-2}$", m: "$(3 + x)^{-2} = 3^{-2}\\left(1 + \\dfrac{x}{3}\\right)^{-2} = \\dfrac19\\left(1 + \\dfrac{x}{3}\\right)^{-2}$", mk: "B1", n: "A negative index still obeys $a^n$: $3^{-2} = \\frac{1}{9}$, not $-9$ and not $-\\frac19$." },
        { h: "Expand with $n = -2$", m: "$$\\dfrac19\\left[1 + (-2)\\left(\\dfrac{x}{3}\\right) + \\dfrac{(-2)(-3)}{2!}\\left(\\dfrac{x}{3}\\right)^2 + \\ldots\\right] = \\dfrac19\\left[1 - \\dfrac{2x}{3} + \\dfrac{x^2}{3} + \\ldots\\right]$$", mk: "M1 A1", n: "Because $n = -2$ is an integer the coefficients are the tidy $1, -2, 3, -4, \\ldots$ pattern from the check card above." },
        { h: "Multiply by $\\frac19$", m: "$= \\dfrac19 - \\dfrac{2}{27}x + \\dfrac{1}{27}x^2 + \\ldots$", mk: "A1" }
      ], result: "$\\dfrac19 - \\dfrac{2}{27}x + \\dfrac{1}{27}x^2 + \\ldots$, valid for $|x| < 3$" } },
    { worked: { tag: "variation", title: "A cube root: $(8 + 3x)^{\\frac13}$ to $x^2$", src: "practice variant",
      q: "Find the first three terms of the binomial expansion of $(8 + 3x)^{\\frac13}$ and state the range of $x$ for which it is valid.",
      steps: [
        { m: "$(8 + 3x)^{\\frac13} = 8^{\\frac13}\\left(1 + \\dfrac{3x}{8}\\right)^{\\frac13} = 2\\left(1 + \\dfrac{3}{8}x\\right)^{\\frac13}$", mk: "B1", n: "$8^{\\frac13} = 2$. Any $a$ that is a perfect power of the denominator of $n$ is chosen so this comes out whole." },
        { m: "$= 2\\left[1 + \\tfrac13\\left(\\dfrac{3x}{8}\\right) + \\dfrac{\\tfrac13\\left(-\\tfrac23\\right)}{2!}\\left(\\dfrac{3x}{8}\\right)^2 + \\ldots\\right] = 2\\left[1 + \\dfrac{x}{8} - \\dfrac19 \\cdot \\dfrac{9x^2}{64} + \\ldots\\right]$", mk: "M1 A1", n: "$n - 1 = \\frac13 - 1 = -\\frac23$; $\\frac{\\frac13 \\cdot \\left(-\\frac23\\right)}{2} = -\\frac19$." },
        { m: "$= 2 + \\dfrac14 x - \\dfrac{1}{32}x^2 + \\ldots$, valid for $\\left|\\dfrac{3x}{8}\\right| < 1$, i.e. $|x| < \\dfrac83$", mk: "A1 B1" }
      ], result: "$2 + \\dfrac14 x - \\dfrac{1}{32}x^2 + \\ldots$, $\; |x| < \\dfrac83$" } },
    { h: "2.3  The validity condition $\\left|\\frac{b}{a}x\\right| < 1$" },
    "The series for $(1 + X)^n$ is valid for $|X| < 1$. After the rearrangement, $X = \\frac{b}{a}x$, so",
    { callout: { t: "formula", h: "Validity of the expansion of $(a + bx)^n$", body: [
      "$$\\left|\\dfrac{b}{a}x\\right| < 1 \;\\iff\; |x| < \\left|\\dfrac{a}{b}\\right| \;\\iff\; -\\left|\\dfrac{a}{b}\\right| < x < \\left|\\dfrac{a}{b}\\right|$$",
      { ul: [
        "The sign of $b$ makes no difference — $|{-9x}| = 9|x|$ — so $(4 - 9x)^{\\frac12}$ and $(4 + 9x)^{\\frac12}$ share the range $|x| < \\frac49$.",
        "The size of $n$ makes no difference either: the range depends only on the bracket.",
        "Give it as a **strict** inequality with modulus signs. \"$x < \\frac49$\" on its own is wrong — it allows $x = -100$."
      ] }
    ] } },
    { table: { head: ["Expression", "Rearranged", "$X$", "Valid for"], rows: [
      ["$(1 + 8x)^{\\frac12}$", "—", "$8x$", "$|x| < \\frac18$"],
      ["$(1 - 9x)^{\\frac12}$", "—", "$-9x$", "$|x| < \\frac19$"],
      ["$(4 + 5x)^{\\frac12}$", "$2\\left(1 + \\frac54 x\\right)^{\\frac12}$", "$\\frac54 x$", "$|x| < \\frac45$"],
      ["$(4 - 9x)^{\\frac12}$", "$2\\left(1 - \\frac94 x\\right)^{\\frac12}$", "$-\\frac94 x$", "$|x| < \\frac49$"],
      ["$(4 - x)^{-\\frac12}$", "$\\frac12\\left(1 - \\frac{x}{4}\\right)^{-\\frac12}$", "$-\\frac{x}{4}$", "$|x| < 4$"],
      ["$(3 + x)^{-2}$", "$\\frac19\\left(1 + \\frac{x}{3}\\right)^{-2}$", "$\\frac{x}{3}$", "$|x| < 3$"],
      ["$(2 - 5x)^{-3}$", "$\\frac18\\left(1 - \\frac52 x\\right)^{-3}$", "$-\\frac52 x$", "$|x| < \\frac25$"],
      ["$(1 + x^2)^{-1}$", "—", "$x^2$", "$|x^2| < 1 \\Rightarrow |x| < 1$"]
    ] } },
    { h: "2.4  \"State the range of values of $x$ for which the expansion is valid\"" },
    "This is usually a 1-mark B1 and is lost more often than any other single mark on the topic — not from difficulty but from omission. The routine:",
    { ol: [
      "Find $X$, the thing added to 1 **after** rearranging (not the original $bx$ unless $a = 1$).",
      "Write $|X| < 1$ and solve for $|x|$: $\\left|\\frac{b}{a}x\\right| < 1 \\Rightarrow |x| < \\left|\\frac{a}{b}\\right|$.",
      "For a product of expansions (page 4) take the **most restrictive** range: the expansion is only valid where *every* factor's series is valid.",
      "If the question gives the range in its header — \"$f(x) = (1 + 9x)^{-2}, |x| < \\frac19$\" — you are being *told* it. Use it to sanity-check your $X$ (here $9x$) and expect a later part to ask why some value is not allowed."
    ] },
    { worked: { tag: "check", title: "Validity for three brackets, done in one line each", src: "routine",
      steps: [
        { m: "$(1 - 6x)^{-\\frac12}$: $\; |{-6x}| < 1 \\Rightarrow |x| < \\dfrac16$", mk: "B1" },
        { m: "$(9 - 2x)^{\\frac12} = 3\\left(1 - \\dfrac{2x}{9}\\right)^{\\frac12}$: $\; \\left|\\dfrac{2x}{9}\\right| < 1 \\Rightarrow |x| < \\dfrac92$", mk: "B1", n: "It is $\\frac{a}{b} = \\frac92$, not $\\frac{b}{a} = \\frac29$. If in doubt: the bracket must stay positive-ish, and $9 - 2x$ is fine up to $x = 4.5$." },
        { m: "$\\dfrac{1}{(2 + x)^2(1 - 3x)}$: $\; |x| < 2$ and $|x| < \\dfrac13$, so $|x| < \\dfrac13$", mk: "B1", n: "Two factors, two conditions, the tighter one wins." }
      ] } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Approximation and accuracy" },
    { h: "2.5  Using an expansion to approximate a number" },
    "A truncated series is a polynomial, and a polynomial can be evaluated by hand.",
    "So if you can find an $x$ that turns the bracket into the number you want — $\\sqrt{4.5}$, $\\sqrt{3}$, $\\frac{1}{\\sqrt{2}}$ — you have a pencil-and-paper route to a decimal or, more often on these papers, to a fraction $\\frac{p}{q}$ that approximates a surd.",
    "Three questions decide whether the route is any good:",
    { kv: [
      ["Is $x$ inside the range of validity?", "If not, the series does not converge to the function and the \"approximation\" is meaningless however many terms you take. This is the 1-mark explain-why question, and it is answered by quoting the range and the value: \"the expansion is valid for $|x| < \\frac19$, and $\\left|-\\frac29\\right| > \\frac19$\"."],
      ["Is $|x|$ small?", "Inside the range, the smaller $|x|$ is, the faster the terms shrink and the better a fixed number of terms does. Given a choice of valid values, pick the one with the **smallest** $|x|$ — that is the 2019 P1 Q4(b)(ii) answer in one line."],
      ["Does the bracket give the surd you want, up to a rational factor?", "$\\sqrt{4 + 5x}$ at $x = \\frac{1}{10}$ is $\\sqrt{4.5} = \\sqrt{\\frac92} = \\frac{3}{\\sqrt2} = \\frac{3\\sqrt2}{2}$. The series gives you $\\frac{3\\sqrt2}{2}$; a final step of algebra turns that into $\\sqrt2$. Do that step on paper, exactly, in fractions."]
    ] },
    { worked: { tag: "exam", title: "$\\sqrt2$ from $(4 + 5x)^{\\frac12}$ with $x = \\frac{1}{10}$ — and why that is valid", src: "A-level Specimen · P1 Q2(b) · 4 marks",
      q: "**(b)(i)** Use the expansion $(4 + 5x)^{\\frac12} \\approx 2 + \\frac54 x - \\frac{25}{64}x^2$, with $x = \\frac{1}{10}$, to find an approximate value for $\\sqrt2$. Give your answer in the form $\\frac{p}{q}$ where $p$ and $q$ are integers. **(ii)** Explain why substituting $x = \\frac{1}{10}$ into this binomial expansion leads to a valid approximation.",
      steps: [
        { h: "(i) What does the bracket become?", m: "$x = \\dfrac{1}{10}$: $\\quad (4 + 5x)^{\\frac12} = \\left(4 + \\dfrac12\\right)^{\\frac12} = \\sqrt{\\dfrac92} = \\dfrac{3}{\\sqrt2} = \\dfrac{3\\sqrt2}{2}$", mk: "M1", n: "Write the exact surd form *before* touching the series, so you know what to solve for at the end." },
        { h: "Evaluate the series at $x = \\frac{1}{10}$ — in fractions", m: "$2 + \\dfrac54 \\cdot \\dfrac{1}{10} - \\dfrac{25}{64} \\cdot \\dfrac{1}{100} = 2 + \\dfrac18 - \\dfrac{1}{256} = \\dfrac{512 + 32 - 1}{256} = \\dfrac{543}{256}$", mk: "M1", n: "The question wants $\\frac{p}{q}$, so decimals here would have to be converted back — stay in fractions from the start." },
        { h: "Solve for $\\sqrt2$", m: "$\\dfrac{3\\sqrt2}{2} \\approx \\dfrac{543}{256} \;\\Rightarrow\; \\sqrt2 \\approx \\dfrac{543}{256} \\times \\dfrac23 = \\dfrac{181}{128}$", mk: "A1", n: "$\\frac{181}{128} = 1.41406$; true value $1.41421$. Three terms and $x = 0.1$ already give 4 significant figures." },
        { h: "(ii) Validity", m: "The expansion is valid for $\\left|\\dfrac{5x}{4}\\right| < 1$, i.e. $|x| < \\dfrac45$, and $\\dfrac{1}{10} < \\dfrac45$, so the approximation is valid.", mk: "B1", n: "Quote the range **and** place the value inside it. Just writing \"$|x| < \\frac45$\" is not an explanation." }
      ], result: "(i) $\\sqrt2 \\approx \\dfrac{181}{128}$ (ii) $\\dfrac{1}{10}$ lies within $|x| < \\dfrac45$" } },
    { worked: { tag: "exam", title: "Choosing between offered values of $x$ — without any calculation", src: "A-level June 2019 · P1 Q4(b) · 2 marks",
      q: "The expansion of $\\frac{1}{\\sqrt{4 - x}}$ can be used to find an approximation to $\\sqrt2$. Possible values of $x$ that could be substituted are: $x = -14$ because $\\frac{1}{\\sqrt{18}} = \\frac{\\sqrt2}{6}$; $\; x = 2$ because $\\frac{1}{\\sqrt2} = \\frac{\\sqrt2}{2}$; $\; x = -\\frac12$ because $\\frac{1}{\\sqrt{9/2}} = \\frac{\\sqrt2}{3}$. Without evaluating your expansion, **(i)** state, giving a reason, which of the three values of $x$ should not be used; **(ii)** state, giving a reason, which would lead to the most accurate approximation to $\\sqrt2$.",
      steps: [
        { h: "(i) Test each value against the range", m: "The expansion of $(4 - x)^{-\\frac12}$ is valid for $|x| < 4$. $\; x = -14$ is outside this range, so $x = -14$ should not be used.", mk: "B1", n: "All three values genuinely produce $\\sqrt2$ — the question is testing whether you know that being *algebraically* right is not enough; the series has to converge there." },
        { h: "(ii) Of the valid values, the smallest $|x|$ wins", m: "$x = 2$ and $x = -\\dfrac12$ are both valid; $\\left|-\\dfrac12\\right| < |2|$, so $x = -\\dfrac12$ gives the most accurate approximation, because the terms in $x^n$ decrease fastest when $|x|$ is smallest.", mk: "B1", n: "Say *why*: smaller $|x|$ → later (omitted) terms are smaller → truncation error is smaller." }
      ], result: "(i) $x = -14$, outside $|x| < 4$ (ii) $x = -\\dfrac12$, the smallest $|x|$" } },
    { worked: { tag: "exam", title: "\"Explain how you could use $x = \\frac{1}{32}$ to approximate $\\sqrt5$\"", src: "A-level Oct 2020 · P1 Q1(b) · 2 marks",
      q: "Explain how you could use $x = \\frac{1}{32}$ in the expansion of $(1 + 8x)^{\\frac12} \\approx 1 + 4x - 8x^2 + 32x^3$ to find an approximation for $\\sqrt5$. There is no need to carry out the calculation.",
      steps: [
        { h: "Evaluate the bracket at the given $x$", m: "$x = \\dfrac{1}{32}$: $\\quad \\sqrt{1 + 8x} = \\sqrt{1 + \\dfrac14} = \\sqrt{\\dfrac54} = \\dfrac{\\sqrt5}{2}$", mk: "M1", n: "This line is the whole insight: the bracket is a rational multiple of $\\sqrt5$." },
        { h: "Say what you would do", m: "Substitute $x = \\dfrac{1}{32}$ into the expansion to get an estimate of $\\dfrac{\\sqrt5}{2}$, then **multiply the result by 2** to obtain the approximation to $\\sqrt5$.", mk: "A1", n: "The A1 needs the \"multiply by 2\". Students who stop at \"substitute $x = \\frac{1}{32}$\" score M1 A0." },
        { h: "For interest — the value", m: "$1 + \\dfrac{4}{32} - \\dfrac{8}{1024} + \\dfrac{32}{32768} = \\dfrac{1145}{1024}$, so $\\sqrt5 \\approx \\dfrac{1145}{512} = 2.23633$ (true $2.23607$).", n: "Not required by the question; shown so you can see the size of a 4-term error at $x = 0.03$." }
      ], result: "$\\sqrt{1 + 8x}$ at $x = \\dfrac{1}{32}$ is $\\dfrac{\\sqrt5}{2}$; substitute, then double" } },
    { worked: { tag: "exam", title: "Why $x = -\\frac29$ must not be used", src: "A-level June 2024 · P1 Q2(b) · 1 mark",
      q: "Give a reason why $x = -\\frac29$ should not be used in the expansion of $(1 - 9x)^{\\frac12}$ to find an approximation to $\\sqrt3$.",
      steps: [
        { m: "At $x = -\\dfrac29$ the bracket is $1 - 9\\left(-\\dfrac29\\right) = 3$, so algebraically it *would* give $\\sqrt3$ — but the expansion is only valid for $|x| < \\dfrac19$, and $\\left|-\\dfrac29\\right| = \\dfrac29 > \\dfrac19$, so the value lies outside the range of validity.", mk: "B1", n: "The mark scheme wants the range **and** the comparison. \"It is not valid\" without the range is B0." }
      ], result: "$-\\dfrac29$ is outside $|x| < \\dfrac19$" } },
    { h: "Over-estimate or under-estimate?" },
    "A truncated series differs from the true value by the terms you left out.",
    { ul: [
      "If you can see the **sign** of the first omitted term (and the terms are decreasing in size, which inside the range they eventually are), you know which side of the truth you are on.",
      "Omitted terms positive → your estimate is **too small** (an under-estimate).",
      "Omitted terms negative → **too big** (an over-estimate).",
      "No calculation is needed — and the question usually says so."
    ] },
    { worked: { tag: "exam", title: "Over- or under-estimate for $\\sqrt3$ from $\\sqrt{4 - 9x}$ at $x = \\frac19$", src: "A-level June 2022 · P2 Q7(b) · 1 mark",
      q: "A student uses the expansion $\\sqrt{4 - 9x} \\approx 2 - \\frac94 x - \\frac{81}{64}x^2 - \\frac{729}{512}x^3$ with $x = \\frac19$ to find an approximation for $\\sqrt3$. Using the answer to part (a) and without doing any calculations, state whether this approximation will be an overestimate or an underestimate of $\\sqrt3$, giving a brief reason.",
      steps: [
        { m: "Every term after the first is negative, and $x = \\dfrac19 > 0$, so every omitted term is negative. The truncated series therefore leaves out negative quantities and gives an **overestimate** of $\\sqrt3$.", mk: "B1", n: "Check with numbers only if you like: the four terms give $1.7324$; $\\sqrt3 = 1.7321$. But the mark is for the reasoning, and \"without doing any calculations\" means a numerical comparison would not be accepted on its own." }
      ], result: "an overestimate — the omitted terms are all negative" } },
    { callout: { t: "warn", h: "Sign of the omitted terms depends on the sign of $x$ too", body: ["For $(1 - 9x)^{\\frac12}$ the coefficients are all negative after the first — but at a *negative* $x$ the odd-power terms flip positive, and the omitted terms alternate in sign. The simple argument no longer applies.",
      "Always say \"since $x > 0$\" (or evaluate the sign of the first omitted term at the actual $x$) rather than reading signs off the coefficients alone."] } },
    { h: "Commenting on accuracy" },
    { ul: [
      "**More terms → more accurate**, but only inside the range. Outside it, more terms make things worse.",
      "**Smaller $|x|$ → more accurate** for the same number of terms. The error of an $n$-term truncation is about the size of the first omitted term, which is proportional to $x^n$.",
      "A **positive-integer** expansion is exact when complete; its *truncation* is a good estimate only if $\\left|\\frac{b}{a}x\\right|$ is small enough that the terms shrink quickly — with $n = 12$ and $\\frac{b}{a}x = \\frac{1}{16}$ (AS 2024) they do not, and the 3-term estimate of $\\left(\\frac{17}{16}\\right)^{12}$ was 3% low.",
      "The mark scheme phrase is *\"the approximation is valid because $x$ lies within the range of validity\"* — write those words when asked to justify, plus the numbers."
    ] },
    { worked: { tag: "exam", title: "Estimate an integral with the expansion, then compare with the exact value", src: "A-level June 2023 · P2 Q13(b)(c) · 9 marks",
      q: "Using $(3 + x)^{-2} \\approx \\frac19 - \\frac{2}{27}x + \\frac{1}{27}x^2$ and algebraic integration, **(b)** estimate the value of $\\displaystyle\\int_{0.2}^{0.4} \\frac{6x}{(3 + x)^2}\\,\\mathrm{d}x$, giving your answer to 4 significant figures. **(c)** Find, using algebraic integration, the exact value of the integral in the form $a\\ln b + c$.",
      steps: [
        { h: "(b) Multiply the expansion by $6x$", m: "$\\dfrac{6x}{(3 + x)^2} \\approx 6x\\left(\\dfrac19 - \\dfrac{2}{27}x + \\dfrac{1}{27}x^2\\right) = \\dfrac23 x - \\dfrac49 x^2 + \\dfrac29 x^3$", mk: "M1", n: "A polynomial you can integrate term by term — that is why the expansion was asked for first." },
        { h: "Integrate", m: "$\\displaystyle\\int \\left(\\dfrac23 x - \\dfrac49 x^2 + \\dfrac29 x^3\\right)\\mathrm{d}x = \\dfrac13 x^2 - \\dfrac{4}{27}x^3 + \\dfrac{1}{18}x^4$", mk: "M1 A1" },
        { h: "Apply the limits", m: "$\\left[\\dfrac13 x^2 - \\dfrac{4}{27}x^3 + \\dfrac{1}{18}x^4\\right]_{0.2}^{0.4} = 0.045274 - 0.012237 = 0.03304$ (4 s.f.)", mk: "A1", n: "Both limits inside $|x| < 3$, so the estimate is trustworthy." },
        { h: "(c) Exact: substitute $u = 3 + x$ (or split the fraction)", m: "$\\dfrac{6x}{(3 + x)^2} = \\dfrac{6(u - 3)}{u^2} = \\dfrac{6}{u} - \\dfrac{18}{u^2}$, so $\\displaystyle\\int = 6\\ln u + \\dfrac{18}{u}$", mk: "M1 A1", n: "Writing the integrand as $\\frac{6}{3 + x} - \\frac{18}{(3 + x)^2}$ is the partial-fraction view of the same step." },
        { m: "$\\left[6\\ln(3 + x) + \\dfrac{18}{3 + x}\\right]_{0.2}^{0.4} = 6\\ln\\dfrac{3.4}{3.2} + 18\\left(\\dfrac{1}{3.4} - \\dfrac{1}{3.2}\\right) = 6\\ln\\dfrac{17}{16} - \\dfrac{45}{136}$", mk: "ddM1 A1", n: "$a = 6$, $b = \\frac{17}{16}$, $c = -\\frac{45}{136}$. Value $0.03287$ — the series estimate $0.03304$ was $0.5\\%$ high. The first omitted term of the expansion, $-\\frac{4}{243}x^3$, is negative, so the truncated integrand — and therefore the estimate — is slightly too large." }
      ], result: "(b) $\\approx 0.03304$ (c) $6\\ln\\dfrac{17}{16} - \\dfrac{45}{136}$" } },

    /* ---------------------------------------------------------------- Page 4 */
    { page: "Products and partial fractions" },
    { h: "2.6  Combining two binomial expansions" },
    "A quotient or product of brackets — $\\sqrt{\\frac{1 + 4x}{1 - x}}$, $(1 + x)^{\\frac12}(2 - x)^{-1}$ — is expanded by expanding **each** factor separately to the power required and then multiplying, discarding every product whose power is higher than you need. Organise the multiplication so nothing is missed:",
    { callout: { t: "memorise", h: "Multiplying two series up to $x^2$", body: [
      "$$(1 + p_1x + p_2x^2 + \\ldots)(1 + q_1x + q_2x^2 + \\ldots) = 1 + (p_1 + q_1)x + (p_2 + p_1q_1 + q_2)x^2 + \\ldots$$",
      "The $x^2$ coefficient has **three** contributions: $x^2 \\cdot 1$, $x \\cdot x$ and $1 \\cdot x^2$. In general the coefficient of $x^k$ collects every pair of terms whose powers add to $k$. Write the two expansions one above the other and draw the pairs — or lay out a grid — rather than trusting your eye.",
      "**Validity of the product** is the *intersection* of the two ranges: the stricter condition."
    ] } },
    { worked: { tag: "exam", title: "$\\sqrt{\\frac{1 + 4x}{1 - x}}$ to $x^2$, then a value that must not be used, then $\\sqrt6$", src: "A-level June 2018 · P1 Q11 · 10 marks",
      q: "**(a)** Use binomial expansions to show that $\\sqrt{\\frac{1 + 4x}{1 - x}} \\approx 1 + \\frac52 x - \\frac58 x^2$. **(b)** A student substitutes $x = \\frac12$ into both sides in an attempt to approximate $\\sqrt6$. Give a reason why the student should not use $x = \\frac12$. **(c)** Substitute $x = \\frac{1}{11}$ into the approximation to obtain an approximation to $\\sqrt6$. Give your answer as a fraction in its simplest form.",
      steps: [
        { h: "(a) Split into two index forms", m: "$\\sqrt{\\dfrac{1 + 4x}{1 - x}} = (1 + 4x)^{\\frac12}(1 - x)^{-\\frac12}$", mk: "B1", n: "A root of a quotient is a product of a positive and a negative half-power. Both brackets already begin with 1 — no $a^n$ needed." },
        { h: "Expand the first to $x^2$", m: "$(1 + 4x)^{\\frac12} = 1 + \\tfrac12(4x) + \\dfrac{\\tfrac12\\left(-\\tfrac12\\right)}{2}(4x)^2 + \\ldots = 1 + 2x - 2x^2 + \\ldots$", mk: "M1 A1" },
        { h: "Expand the second to $x^2$", m: "$(1 - x)^{-\\frac12} = 1 + \\left(-\\tfrac12\\right)(-x) + \\dfrac{\\left(-\\tfrac12\\right)\\left(-\\tfrac32\\right)}{2}(-x)^2 + \\ldots = 1 + \\dfrac12 x + \\dfrac38 x^2 + \\ldots$", mk: "M1 A1", n: "$n = -\\frac12$, $X = -x$: two negatives in term 2, and $(-x)^2 = x^2$ in term 3 — all positive." },
        { h: "Multiply, keeping up to $x^2$", m: "$(1 + 2x - 2x^2)(1 + \\tfrac12 x + \\tfrac38 x^2)$\n$= 1 + \\left(\\tfrac12 + 2\\right)x + \\left(\\tfrac38 + 2 \\cdot \\tfrac12 - 2\\right)x^2 + \\ldots = 1 + \\dfrac52 x - \\dfrac58 x^2 + \\ldots$", mk: "M1 A1*", n: "Three pieces in the $x^2$ bracket: $\\frac38$ (from $1 \\cdot x^2$), $1$ (from $x \\cdot x$), $-2$ (from $x^2 \\cdot 1$). A1* — the printed answer, so every step must be visible." },
        { h: "(b) Validity of the product", m: "$(1 + 4x)^{\\frac12}$ needs $|x| < \\dfrac14$ and $(1 - x)^{-\\frac12}$ needs $|x| < 1$; the product is valid only for $|x| < \\dfrac14$. $\; x = \\dfrac12 > \\dfrac14$, so the expansion is not valid there.", mk: "B1", n: "It is the **tighter** range that matters. Students who quote only $|x| < 1$ conclude $\\frac12$ is fine — and lose the mark." },
        { h: "(c) Evaluate at $x = \\frac{1}{11}$ — first the exact left side", m: "$\\dfrac{1 + \\frac{4}{11}}{1 - \\frac{1}{11}} = \\dfrac{15/11}{10/11} = \\dfrac32$, so the left side is $\\sqrt{\\dfrac32} = \\dfrac{\\sqrt6}{2}$", mk: "M1", n: "Now you know the series is approximating $\\frac{\\sqrt6}{2}$: the final answer will be twice the series value." },
        { m: "$1 + \\dfrac52 \\cdot \\dfrac{1}{11} - \\dfrac58 \\cdot \\dfrac{1}{121} = \\dfrac{968 + 220 - 5}{968} = \\dfrac{1183}{968}$\n$\\sqrt6 \\approx 2 \\times \\dfrac{1183}{968} = \\dfrac{1183}{484}$", mk: "M1 A1", n: "$\\frac{1183}{484} = 2.4442$ against $\\sqrt6 = 2.4495$: two terms of $x$ and a rather large $x = 0.09$; fine for 3 s.f." }
      ], result: "(a) shown (b) $\\dfrac12$ lies outside $|x| < \\dfrac14$ (c) $\\sqrt6 \\approx \\dfrac{1183}{484}$" } },
    { worked: { tag: "exam", title: "Positive-integer expansion times a bracket with $\\frac1x$", src: "AS June 2022 · P1 Q6(b) · 2 marks",
      q: "$f(x) = \\left(\\frac{x - 1}{2x}\\right)\\left(3 - \\frac{2x}{9}\\right)^8$. Using $\\left(3 - \\frac{2x}{9}\\right)^8 = 6561 - 3888x + 1008x^2 - \\frac{448}{3}x^3 + \\ldots$, find the coefficient of $x^2$ in the series expansion of $f(x)$, giving your answer as a simplified fraction.",
      steps: [
        { h: "Rewrite the front bracket as separate powers of $x$", m: "$\\dfrac{x - 1}{2x} = \\dfrac12 - \\dfrac{1}{2x}$", n: "Only now can you see which terms of the expansion each piece will reach." },
        { h: "Pair each piece with the term that lands on $x^2$", m: "$\\dfrac12 \\times 1008x^2 \;+\; \\left(-\\dfrac{1}{2x}\\right) \\times \\left(-\\dfrac{448}{3}x^3\\right)$", mk: "M1", n: "$\\frac{1}{x} \\times x^3 = x^2$ — the $\\frac{1}{2x}$ reaches one term *further* into the expansion. This is why part (a) asked for four terms although the product only needs $x^2$." },
        { m: "$= 504 + \\dfrac{224}{3} = \\dfrac{1512 + 224}{3} = \\dfrac{1736}{3}$", mk: "A1" }
      ], result: "$\\dfrac{1736}{3}$" } },
    { worked: { tag: "exam", title: "Negative powers on the left: coefficient of $x$ in $\\left(1 + \\frac3x\\right)^2\\left(1 + \\frac{3x}{4}\\right)^6$", src: "AS Specimen · P1 Q7 · 8 marks",
      q: "**(a)** Expand $\\left(1 + \\frac3x\\right)^2$, simplifying each term. **(b)** Find the first four terms, in ascending powers of $x$, of $\\left(1 + \\frac{3x}{4}\\right)^6$. **(c)** Hence find the coefficient of $x$ in the expansion of $\\left(1 + \\frac3x\\right)^2\\left(1 + \\frac{3x}{4}\\right)^6$.",
      steps: [
        { h: "(a)", m: "$\\left(1 + \\dfrac3x\\right)^2 = 1 + \\dfrac6x + \\dfrac{9}{x^2}$", mk: "M1 A1" },
        { h: "(b)", m: "$1 + 6\\left(\\dfrac{3x}{4}\\right) + 15\\left(\\dfrac{3x}{4}\\right)^2 + 20\\left(\\dfrac{3x}{4}\\right)^3 = 1 + \\dfrac92 x + \\dfrac{135}{16}x^2 + \\dfrac{135}{16}x^3 + \\ldots$", mk: "B1 M1 A1 A1" },
        { h: "(c) Which pairs make $x^1$?", m: "$1 \\times \\dfrac92 x \;+\; \\dfrac6x \\times \\dfrac{135}{16}x^2 \;+\; \\dfrac{9}{x^2} \\times \\dfrac{135}{16}x^3$", mk: "M1", n: "$x^{-1} \\cdot x^2$ and $x^{-2} \\cdot x^3$ both give $x^1$ — three contributions, which is why (b) needed the $x^3$ term." },
        { m: "$= \\dfrac92 + \\dfrac{810}{16} + \\dfrac{1215}{16} = \\dfrac{72 + 810 + 1215}{16} = \\dfrac{2097}{16}$", mk: "A1" }
      ], result: "$\\dfrac{2097}{16}$" } },
    { h: "2.7  Partial fractions, then binomial expansion" },
    "A rational function such as $\\frac{50x^2 + 38x + 9}{(5x + 2)^2(1 - 2x)}$ *can* be expanded as a product of series — but two or three series multiplied together is slow and error-prone.",
    "**Decompose into partial fractions first.**",
    { ul: [
      "Each fraction is one bracket to a negative power, and expands in a single line.",
      "The series are then *added* rather than multiplied.",
      "The spec says this explicitly: \"may be used with the expansion of rational functions by decomposition into partial fractions\"."
    ] },
    { callout: { t: "memorise", h: "Order of operations for a combined question", body: [
      "1. **Improper?** If the numerator's degree is $\\ge$ the denominator's, divide first (or compare leading coefficients) so you have polynomial + proper fraction.",
      "2. **Decompose.** Distinct linear factors: $\\frac{A}{x + a} + \\frac{B}{x + b}$. Repeated factor: $\\frac{A}{x + a} + \\frac{B}{(x + a)^2}$. Find constants by substituting the roots; a repeated-factor $A$ or an improper-fraction leading constant needs **comparing coefficients** (or a second substitution).",
      "3. **Rearrange each fraction** to $\\text{const} \\times (1 + \\ldots)^{-k}$. $\\frac{2}{1 - 2x} = 2(1 - 2x)^{-1}$; $\\frac{1}{(5x + 2)^2} = (2 + 5x)^{-2} = \\frac14\\left(1 + \\frac52 x\\right)^{-2}$.",
      "4. **Expand each** to the power required, **add**, collect like powers.",
      "5. **Validity** = the intersection of the individual ranges."
    ] } },
    { worked: { tag: "exam", title: "Repeated factor, a \"show that $A = 0$\", expansion and validity — the full 11-marker", src: "A-level Oct 2021 · P1 Q9 · 11 marks",
      q: "$f(x) = \\frac{50x^2 + 38x + 9}{(5x + 2)^2(1 - 2x)}$, $x \\neq -\\frac25$, $x \\neq \\frac12$. Given that $f(x)$ can be expressed in the form $\\frac{A}{5x + 2} + \\frac{B}{(5x + 2)^2} + \\frac{C}{1 - 2x}$, **(a)(i)** find the value of $B$ and the value of $C$, **(ii)** show that $A = 0$. **(b)(i)** Use binomial expansions to show that, in ascending powers of $x$, $f(x) = p + qx + rx^2 + \\ldots$ where $p$, $q$ and $r$ are simplified fractions to be found. **(ii)** Find the range of values of $x$ for which this expansion is valid.",
      steps: [
        { h: "(a)(i) Clear the denominators", m: "$50x^2 + 38x + 9 \\equiv A(5x + 2)(1 - 2x) + B(1 - 2x) + C(5x + 2)^2$", mk: "M1", n: "An identity — true for every $x$ — so you may substitute any value." },
        { h: "Substitute the roots", m: "$x = \\dfrac12$: $\; \\dfrac{50}{4} + 19 + 9 = C \\cdot \\left(\\dfrac92\\right)^2 \;\\Rightarrow\; \\dfrac{81}{2} = \\dfrac{81}{4}C \;\\Rightarrow\; C = 2$\n$x = -\\dfrac25$: $\; 8 - \\dfrac{76}{5} + 9 = B\\left(1 + \\dfrac45\\right) \;\\Rightarrow\; \\dfrac95 = \\dfrac95 B \;\\Rightarrow\; B = 1$", mk: "A1", n: "$x = -\\frac25$ kills both the $A$ and the $C$ terms, isolating $B$; $x = \\frac12$ isolates $C$. This is the \"cover-up\" idea made explicit." },
        { h: "(a)(ii) A third equation for $A$ — compare a coefficient or substitute $x = 0$", m: "$x = 0$: $\; 9 = 2A + B + 4C = 2A + 1 + 8 \;\\Rightarrow\; 2A = 0 \;\\Rightarrow\; A = 0$", mk: "M1 A1*", n: "Or compare $x^2$: $50 = -10A + 25C$ gives $50 = -10A + 50$. Either way the argument must be **shown** — this is a proof, and three answers written down with no working score M1 A1 M0 A0." },
        { h: "(b)(i) Expand $\\frac{1}{(5x + 2)^2}$", m: "$(2 + 5x)^{-2} = 2^{-2}\\left(1 + \\dfrac{5x}{2}\\right)^{-2} = \\dfrac14\\left[1 + (-2)\\left(\\dfrac{5x}{2}\\right) + \\dfrac{(-2)(-3)}{2}\\left(\\dfrac{5x}{2}\\right)^2 + \\ldots\\right]$\n$= \\dfrac14\\left[1 - 5x + \\dfrac{75}{4}x^2 + \\ldots\\right] = \\dfrac14 - \\dfrac54 x + \\dfrac{75}{16}x^2 + \\ldots$", mk: "M1 M1 A1", n: "First M1 for taking out the $2^{-2}$, second for the expansion structure. Note $(5x + 2)$ must be read as $(2 + 5x)$ — the constant goes first." },
        { h: "Expand $\\frac{2}{1 - 2x}$", m: "$2(1 - 2x)^{-1} = 2\\left[1 + (-1)(-2x) + \\dfrac{(-1)(-2)}{2}(-2x)^2 + \\ldots\\right] = 2 + 4x + 8x^2 + \\ldots$", mk: "M1", n: "Or recognise the geometric series $1 + 2x + 4x^2 + \\ldots$ directly." },
        { h: "Add (the $A$ term contributes nothing)", m: "$f(x) = \\left(\\dfrac14 + 2\\right) + \\left(-\\dfrac54 + 4\\right)x + \\left(\\dfrac{75}{16} + 8\\right)x^2 + \\ldots = \\dfrac94 + \\dfrac{11}{4}x + \\dfrac{203}{16}x^2 + \\ldots$", mk: "dM1 A1", n: "Check $p$ quickly: $f(0) = \\frac{9}{4 \\cdot 1} = \\frac94$. Always test the constant term against $f(0)$ — it is free." },
        { h: "(b)(ii) Validity", m: "$\\left(1 + \\dfrac{5x}{2}\\right)^{-2}$ needs $|x| < \\dfrac25$; $(1 - 2x)^{-1}$ needs $|x| < \\dfrac12$. Both must hold, so $|x| < \\dfrac25$.", mk: "B1", n: "The two excluded values in the question header ($-\\frac25$ and $\\frac12$) are hints: the range is set by the nearer one." }
      ], result: "(a) $B = 1$, $C = 2$, $A = 0$ (b) $\\dfrac94 + \\dfrac{11}{4}x + \\dfrac{203}{16}x^2 + \\ldots$, valid for $|x| < \\dfrac25$" } },
    { worked: { tag: "variation", title: "Two distinct linear factors", src: "practice variant",
      q: "Express $f(x) = \\frac{4 + x}{(1 + x)(2 - x)}$ in partial fractions, hence find the expansion of $f(x)$ in ascending powers of $x$ up to and including the term in $x^3$, and state the range of $x$ for which it is valid.",
      steps: [
        { h: "Decompose", m: "$\\dfrac{4 + x}{(1 + x)(2 - x)} \\equiv \\dfrac{A}{1 + x} + \\dfrac{B}{2 - x} \;\\Rightarrow\; 4 + x \\equiv A(2 - x) + B(1 + x)$\n$x = -1$: $3 = 3A \\Rightarrow A = 1$; $\\quad x = 2$: $6 = 3B \\Rightarrow B = 2$", mk: "M1 A1" },
        { h: "Expand each fraction", m: "$\\dfrac{1}{1 + x} = (1 + x)^{-1} = 1 - x + x^2 - x^3 + \\ldots$\n$\\dfrac{2}{2 - x} = 2 \\cdot \\dfrac12\\left(1 - \\dfrac{x}{2}\\right)^{-1} = 1 + \\dfrac{x}{2} + \\dfrac{x^2}{4} + \\dfrac{x^3}{8} + \\ldots$", mk: "M1 A1", n: "Both are geometric series; the second needed the 2 taken out (and it cancelled the numerator's 2 — check that with $f(0) = 2$)." },
        { h: "Add", m: "$f(x) = 2 - \\dfrac12 x + \\dfrac54 x^2 - \\dfrac78 x^3 + \\ldots$", mk: "A1" },
        { h: "Validity", m: "$|x| < 1$ and $\\left|\\dfrac{x}{2}\\right| < 1$ (i.e. $|x| < 2$): so $|x| < 1$.", mk: "B1" }
      ], result: "$2 - \\dfrac12 x + \\dfrac54 x^2 - \\dfrac78 x^3 + \\ldots$, $\; |x| < 1$" } },
    { worked: { tag: "variation", title: "An improper fraction — divide before you decompose", src: "practice variant (2025 P2 Q7 shape + expansion)",
      q: "Given that $\\frac{x^2 + 3x + 3}{(1 + x)(2 + x)} \\equiv A + \\frac{B}{1 + x} + \\frac{C}{2 + x}$, find $A$, $B$ and $C$, and hence expand the expression in ascending powers of $x$ up to the term in $x^2$.",
      steps: [
        { h: "Degree of the top = degree of the bottom, so there is a constant $A$", m: "$x^2 + 3x + 3 \\equiv A(1 + x)(2 + x) + B(2 + x) + C(1 + x)$", mk: "M1", n: "Compare $x^2$: $1 = A$. (Polynomial division gives the same: $(x^2 + 3x + 3) \\div (x^2 + 3x + 2) = 1$ remainder $1$.)" },
        { m: "$x = -1$: $\; 1 = B \\cdot 1 \\Rightarrow B = 1$; $\\qquad x = -2$: $\; 1 = C \\cdot (-1) \\Rightarrow C = -1$", mk: "A1 A1", n: "Substituting the roots still works for $B$ and $C$ because the $A$ term vanishes at both." },
        { h: "Expand each piece", m: "$1 \;+\; (1 - x + x^2 - \\ldots) \;-\; \\dfrac12\\left(1 + \\dfrac{x}{2}\\right)^{-1}$\n$= 1 + 1 - x + x^2 - \\dfrac12\\left(1 - \\dfrac{x}{2} + \\dfrac{x^2}{4} - \\ldots\\right)$", mk: "M1 A1", n: "$\\frac{1}{2 + x} = \\frac12\\left(1 + \\frac x2\\right)^{-1}$: the $2^{-1}$ again." },
        { h: "Collect", m: "$= \\dfrac32 - \\dfrac34 x + \\dfrac78 x^2 + \\ldots$, valid for $|x| < 1$", mk: "A1 B1", n: "Check: at $x = 0$ the original is $\\frac{3}{2}$. The constant $A$ shifts $p$ but nothing else." }
      ], result: "$A = 1$, $B = 1$, $C = -1$; $\; \\dfrac32 - \\dfrac34 x + \\dfrac78 x^2 + \\ldots$" } },
    { callout: { t: "miscon", h: "The three combined-question errors", body: [
      "**Expanding before decomposing.** Multiplying $(2 + 5x)^{-2}$ by $(1 - 2x)^{-1}$ by the numerator polynomial is three series and a dozen cross-terms; the intended route is one line per fraction. The M marks for the expansion are only available for expansions *of the partial fractions*.",
      "**Substituting into the wrong fraction.** After finding $A$, $B$, $C$, students expand the original $f(x)$'s denominator factors and forget the constants entirely, or attach $B$ to the wrong bracket. Write each fraction with its constant in front — $2(1 - 2x)^{-1}$ — before expanding.",
      "**Taking the loosest validity.** The combined expansion is valid only where *every* series converges. $|x| < \\frac12$ was the wrong answer to Oct 2021 (b)(ii); $|x| < \\frac25$ was right."
    ] } },

    /* ---------------------------------------------------------------- Page 5 */
    { page: "Exam toolkit" },
    { h: "Command words — what each one requires" },
    { table: { head: ["The question says", "It wants", "Stop when"], rows: [
      ["**Find the binomial expansion of … in ascending powers of $x$, up to and including the term in $x^3$** / **the first four terms**", "the full expansion to that power, every coefficient evaluated and simplified, with $+ \\ldots$ at the end for a rational $n$", "you have exactly the terms asked for. Extra terms are ignored; a missing one costs an A mark"],
      ["**Find the coefficient of $x^n$ in …**", "the general term $\\binom{n}{r}a^{n-r}b^r$ (or the matching series term) for that one power; for a product, every pair of terms whose powers add to $n$", "you have a single number (or expression in the unknown). You do not need, and should not write, the whole expansion"],
      ["**Find the term in $x^n$**", "as above, **with** the $x^n$ attached", "e.g. $-\\frac{9}{16}x^5$, not $-\\frac{9}{16}$"],
      ["**State the range of values of $x$ for which the expansion is valid**", "a strict modulus inequality derived from the rearranged bracket: $|x| < \\left|\\frac{a}{b}\\right|$; for a product/sum, the tightest", "one inequality. \"State\" means no working is needed but the inequality must be exactly right"],
      ["**Hence / Use your expansion to find an approximation for …**", "the value of $x$ that turns the bracket into the target (shown), substitution into the *expansion*, the arithmetic in fractions, and a final rearrangement if the bracket gave a multiple of the surd", "you have the number in the form asked (fraction $\\frac{p}{q}$, or $n$ d.p.)"],
      ["**Explain why $x = k$ should not be used** / **leads to a valid approximation**", "the range of validity **and** the comparison of $k$ with it, in words", "you have written both"],
      ["**Without doing any calculations, state whether … is an over- or under-estimate**", "the sign of the omitted terms at that $x$, in words", "you have said which and why"],
      ["**Show that … can be written in the form $\\frac{A}{\\ldots} + \\frac{B}{\\ldots}$**", "the full partial-fraction decomposition with the identity written and the constants found, *before* any expansion", "every constant is justified, including a stand-alone argument for any \"show that $A = 0$\""],
      ["**Show that** (a printed answer)", "every algebraic step, no gaps, ending at exactly the printed form", "the printed line appears in your working as a conclusion, not a starting point"]
    ] } },
    { h: "Where the marks are — and where they go" },
    { kv: [
      ["M1 — method", "Awarded for a correct *structure*: the right binomial coefficient with the right powers of $a$ and $b$ in at least one of terms 2–4, or (rational $n$) the right coefficient $\\frac{n(n-1)}{2!}$ with the right power of $X$.\nBrackets around $X$ may be missing for this mark alone.\nIt is **not** awarded for writing the formula from the booklet with nothing substituted."],
      ["B1 — independent", "Stand-alone facts: the constant term $a^n$ (\"sight of $3^8$ or 6561\"); taking out $a^n$ in a rational-$n$ question; the validity range; a correct value of $x$ for an approximation. B marks are the cheapest on the paper — never leave one on the table."],
      ["A1 — accuracy", "A correct simplified term or terms. Requires correct brackets: $(-9x)^2 = 81x^2$. \"Simplest form\" means exact fractions; a rounded decimal is A0 unless it is exact ($-4.5$ is fine, $-149.3$ is not)."],
      ["A1* / cso", "The printed-answer mark. Requires a complete argument with no errors anywhere in the part — a slip that happens to cancel out is still A0."],
      ["dM1 / ddM1", "Dependent method marks: only available if the previous M (or the previous two) has been earned. In the product questions the dM1 is for *combining* the contributions — no combination, no mark."],
      ["ft", "Follow-through: a later mark awarded for correct work on your own earlier (wrong) answer. Part (b) of a two-part question is often ft on (a), which is why an error in (a) need not cost the whole question — but only if the method in (b) is shown."]
    ] },
    { callout: { t: "warn", h: "The eight ways the marks actually go", body: [
      "1. **No $a^n$**: expansion of $(4 + 5x)^{\\frac12}$ starts with 1. Loses B1 and every A after it.",
      "2. **$a^n$ on the first term only**: $2 + \\frac58 x - \\ldots$ instead of $2 + \\frac54 x - \\ldots$. \"Partially applied\" — A0.",
      "3. **Sign errors with negative $b$**: $(-9x)^3$ written as $-9x^3$; or the $x^2$ term of $(1 - 9x)^{\\frac12}$ made positive. A0 for the affected terms.",
      "4. **Wrong number of terms**: stopping at $x^2$ when \"first four terms\" was asked, or — in products — not expanding far enough for the $\\frac1x$ factor to reach.",
      "5. **Validity omitted or wrong**: no inequality; $x < \\frac49$ instead of $|x| < \\frac49$; $\\frac{b}{a}$ instead of $\\frac{a}{b}$; the loosest range instead of the tightest in a product.",
      "6. **Substituting into the bracket instead of the expansion** when estimating — that is just using a calculator, and scores nothing.",
      "7. **Unevaluated coefficients** in the final line: $\\binom{9}{2}$, $\\frac{\\frac12 \\cdot (-\\frac12)}{2}$, $\\frac{3402}{448}$. Simplify to the end.",
      "8. **Expanding the original rational function** in a partial-fractions question rather than the decomposed pieces — the expansion M marks are unavailable."
    ] } },
    { h: "Common misconceptions" },
    { kv: [
      ["\"The rational-$n$ series stops, like the positive-integer one\"", "It never does. For $n = \\frac12$ the coefficient of $x^r$ is $\\frac{\\frac12(-\\frac12)(-\\frac32)\\cdots}{r!}$ and no factor is ever zero. \"Up to $x^3$\" is a *truncation*, and you must write $+ \\ldots$."],
      ["\"$(a + bx)^n$ is valid for $|x| < 1$\"", "Only when $a = 1$. In general $|x| < \\left|\\frac{a}{b}\\right|$ — the range can be tiny ($\\frac19$) or huge ($4$)."],
      ["\"The range depends on $n$\"", "It does not. $(1 + 8x)^{\\frac12}$, $(1 + 8x)^{-3}$ and $(1 + 8x)^{\\frac{7}{5}}$ are all valid for $|x| < \\frac18$."],
      ["\"$\\binom{n}{r}$ is only for whole numbers, so I can write $\\binom{1/2}{2}$\"", "The $\\binom{n}{r}$ symbol is defined for a non-negative integer $n$ only. For rational $n$ use the product form $\\frac{n(n-1)}{2!}$. Mark schemes name this notation as *not allowed*."],
      ["\"An approximation is valid because it is close to the calculator value\"", "\"Valid\" in these questions means *the series converges at that $x$* — a statement about $x$ and the range, not about how close the number came out."],
      ["\"$\\binom{n}{r}$ in Pure and $\\binom{n}{r}$ in Statistics are unrelated formulae\"", "They are the same number for the same reason: $\\binom{n}{r}$ counts the arrangements. $(q + p)^n = \\sum \\binom{n}{r}q^{n-r}p^r$ *is* the list of binomial probabilities (page 1, 1.6)."],
      ["\"Multiply the two expansions completely\"", "Only pairs of terms whose powers add to at most the required power matter. Everything else is wasted ink and a source of copying errors."]
    ] },
    { h: "Calculator — fx-991CW" },
    { kv: [
      ["Evaluate a binomial coefficient", "$n$ → **CATALOG** → **Probability** → **nCr** → $r$ → **EXE**. Example: $8$, CATALOG, Probability, nCr, $3$, EXE $\\to 56$. Use it to *check* $\\binom{n}{r}$ values you have written by hand; the mark scheme still expects the evaluated number on the page."],
      ["Check a whole expansion numerically", "Pick a small $x$ inside the range, e.g. $x = 0.01$.\nOriginal expression: $(4 + 5 \\times 0.01)^{0.5} = 2.012461\\ldots$\nYour series: $2 + 1.25 \\times 0.01 - 0.390625 \\times 0.0001 = 2.012460\\ldots$\nAgreement to 5–6 s.f. at $x = 0.01$ means the first three terms are right. A discrepancy in the 3rd or 4th s.f. usually points at the $x^2$ coefficient; in the 2nd, at the $x$ coefficient."],
      ["Table mode for validity questions", "**HOME** → **Table**. Enter $f(x) = $ the original expression and $g(x) = $ your truncated series (the Table app takes two functions).\nSet the range with **TOOLS** → *Table Range*: Start $-1$, End $1$, Step $0.1$ (or a range around $\\left|\\frac{a}{b}\\right|$).\nWatch $f$ and $g$ agree near $x = 0$, separate as $|x|$ grows towards the edge of the range, and $g$ go wild beyond it — that is the whole idea of validity in one screen."],
      ["Fractions vs decimals", "Keep the calculator in **MathI/MathO** (SETTINGS → Input/Output) so $\\frac{543}{256} \\times \\frac23$ returns $\\frac{181}{128}$ exactly. **FORMAT** toggles a result between fraction and decimal when you need to compare with a surd."]
    ] },
    { h: "Memory aids" },
    { callout: { t: "mnemonic", h: "The general term: \"choose $r$, drop $r$, raise $r$\"", body: "$\\binom{n}{r}\\,a^{n-r}\\,b^{r}$ — *choose* $r$ of the $n$ brackets, so the power of $a$ *drops* by $r$ and the power of $b$ *rises* to $r$. The two powers always add to $n$, and the term you are writing is number $r + 1$." } },
    { callout: { t: "mnemonic", h: "The rational-$n$ series: \"falling factors over factorial\"", body: "The coefficient of $x^r$ is $r$ **falling** factors $n(n-1)(n-2)\\cdots$ over $r!$. Say it as you write it — \"$n$, $n$ minus one, $n$ minus two, over three factorial\" — and count the factors on your fingers. Three factors for $x^3$, never four." } },
    { callout: { t: "mnemonic", h: "The rearrangement: \"pull the $a$ out, and it comes out to the $n$\"", body: "$(a + bx)^n \\to a^n\\left(1 + \\frac{b}{a}x\\right)^n$: the $a$ leaves the bracket raised to the **same** power $n$, the $x$-term is divided by $a$. Sanity check: put $x = 0$ — both sides are $a^n$. If your answer at $x = 0$ is not $a^n$, the factor is missing." } },
    { callout: { t: "mnemonic", h: "The validity: \"whatever is added to 1 must be smaller than 1\"", body: "The series is a statement about $(1 + X)^n$ with $|X| < 1$. After rearranging, $X = \\frac{b}{a}x$, so $|x| < \\left|\\frac{a}{b}\\right|$ — the constant over the coefficient, \"$a$ over $b$, the way the bracket is written\". For a sum or product of series, the smallest range wins." } },
    { h: "Before you leave the question" },
    { ol: [
      "Does the constant term equal the original expression at $x = 0$? ($a^n$, or $f(0)$ for a rational function.)",
      "Signs: for $(1 - X)^{\\frac12}$ every term after the first is negative; for $(1 + X)^{-1}$ they alternate. Does yours?",
      "Right number of terms, each simplified, $+ \\ldots$ written for a rational $n$?",
      "Have you written the validity — even if only mentioned in a header — as $|x| < \\ldots$?",
      "For an approximation: did you substitute into the *expansion*, show the value of $x$, and convert back to the surd asked for?",
      "For a product: did every pair of terms whose powers add to the target get counted, including the ones from a $\\frac1x$ or $x^2$ in front?"
    ] }
  ],
  flashcards: [
    ["Binomial theorem for a positive integer $n$?", "$(a + b)^n = a^n + \\binom{n}{1}a^{n-1}b + \\binom{n}{2}a^{n-2}b^2 + \\ldots + b^n$; $n + 1$ terms, valid for all $x$."],
    ["Binomial series for any rational $n$?", "$(1 + x)^n = 1 + nx + \\frac{n(n-1)}{2!}x^2 + \\frac{n(n-1)(n-2)}{3!}x^3 + \\ldots$, valid for $|x| < 1$."],
    ["$\\binom{n}{r}$ in factorials?", "$\\frac{n!}{r!\\,(n-r)!}$; also written $^nC_r$. $\\binom{n}{r} = \\binom{n}{n-r}$."],
    ["The general term of $(a + b)^n$ — the term in $b^r$?", "$\\binom{n}{r}a^{n-r}b^r$, which is term number $r + 1$."],
    ["Why does the positive-integer expansion terminate?", "$\\binom{n}{r} = 0$ for $r > n$ — equivalently the factor $(n - n) = 0$ appears in every coefficient after $x^n$. For non-integer $n$ that factor never appears."],
    ["Why does $(1 + x)^n$ need $|x| < 1$ for rational $n$?", "The tail is eventually geometric with ratio of size $|x|$ (e.g. $n = -1$ gives $1 - x + x^2 - \\ldots$); it diverges for $|x| \\ge 1$."],
    ["How do you expand $(a + bx)^n$ for rational $n$?", "Take out $a^n$: $a^n\\left(1 + \\frac{b}{a}x\\right)^n$, expand the bracket with $X = \\frac{b}{a}x$, multiply **every** term by $a^n$."],
    ["Range of validity of $(a + bx)^n$, rational $n$?", "$\\left|\\frac{b}{a}x\\right| < 1 \\Rightarrow |x| < \\left|\\frac{a}{b}\\right|$. Independent of $n$ and of the sign of $b$."],
    ["Validity of a product or sum of two expansions?", "The intersection — the tighter of the two ranges."],
    ["$(1 + x)^{-1}$, $(1 - x)^{-1}$, $(1 + x)^{-2}$, $(1 + x)^{\\frac12}$ to $x^3$?", "$1 - x + x^2 - x^3$; $1 + x + x^2 + x^3$; $1 - 2x + 3x^2 - 4x^3$; $1 + \\frac12 x - \\frac18 x^2 + \\frac{1}{16}x^3$."],
    ["Expand $(1 - 9x)^{\\frac12}$ to $x^3$ and give the validity.", "$1 - \\frac92 x - \\frac{81}{8}x^2 - \\frac{729}{16}x^3 + \\ldots$, $|x| < \\frac19$."],
    ["$(4 + 5x)^{\\frac12}$ to $x^2$?", "$2\\left(1 + \\frac54 x\\right)^{\\frac12} = 2 + \\frac54 x - \\frac{25}{64}x^2 + \\ldots$, $|x| < \\frac45$."],
    ["$(3 + x)^{-2}$ to $x^2$?", "$\\frac19\\left(1 + \\frac x3\\right)^{-2} = \\frac19 - \\frac{2}{27}x + \\frac{1}{27}x^2 + \\ldots$, $|x| < 3$."],
    ["Coefficient of $x^4$ in $(a + 2x)^7$?", "$\\binom{7}{4}a^3 \\cdot 2^4 = 560a^3$."],
    ["Coefficient of $x^2$ in $(1 + p_1x + p_2x^2)(1 + q_1x + q_2x^2)$?", "$p_2 + p_1q_1 + q_2$ — three contributions."],
    ["Coefficient of $x^2$ in $\\left(\\frac12 - \\frac{1}{2x}\\right)(6561 - 3888x + 1008x^2 - \\frac{448}{3}x^3)$?", "$\\frac12(1008) + \\left(-\\frac{1}{2}\\right)\\left(-\\frac{448}{3}\\right) = \\frac{1736}{3}$ — the $\\frac1x$ reaches the $x^3$ term."],
    ["Method: \"use your expansion to estimate $1.925^6$\" from $(2 + \\frac{3x}{4})^6$?", "Solve $2 + \\frac{3x}{4} = 1.925 \\Rightarrow x = -0.1$; substitute $x = -0.1$ into the expansion $64 + 144x + 135x^2$."],
    ["$(4 + 5x)^{\\frac12}$ at $x = \\frac{1}{10}$ gives what surd, and how do you get $\\sqrt2$?", "$\\sqrt{4.5} = \\frac{3\\sqrt2}{2}$; evaluate the series ($\\frac{543}{256}$) and multiply by $\\frac23$: $\\sqrt2 \\approx \\frac{181}{128}$."],
    ["Given several valid values of $x$, which gives the best approximation?", "The one with the smallest $|x|$ — later terms shrink fastest."],
    ["How do you decide over- or under-estimate without calculating?", "Sign of the omitted terms at that $x$: negative omitted terms → overestimate; positive → underestimate."],
    ["Why must $x = -\\frac29$ not be used in $(1 - 9x)^{\\frac12}$ to find $\\sqrt3$?", "Valid only for $|x| < \\frac19$ and $\\frac29 > \\frac19$ — the series does not converge there, even though the bracket equals 3."],
    ["Order of work for a partial-fractions + binomial question?", "Divide if improper → decompose → write each fraction as const$\\times(1 + \\ldots)^{-k}$ → expand each → add → validity = tightest range."],
    ["Partial fraction form for a repeated factor $(5x + 2)^2(1 - 2x)$?", "$\\frac{A}{5x + 2} + \\frac{B}{(5x + 2)^2} + \\frac{C}{1 - 2x}$; find $B$ and $C$ by substituting roots, $A$ by comparing coefficients or $x = 0$."],
    ["fx-991CW key sequence for $\\binom{8}{3}$?", "8 → CATALOG → Probability → nCr → 3 → EXE (gives 56)."],
    ["Link between $\\binom{n}{r}$ and $B(n, p)$?", "$(q + p)^n = \\sum\\binom{n}{r}q^{n-r}p^r$: each term is $P(X = r)$, and the sum is $1^n = 1$."]
  ],
  quiz: [
    { q: "$\\binom{9}{2} =$", opts: ["18", "36", "72", "81"], ans: 1, why: "$\\frac{9 \\times 8}{2!} = 36$." },
    { q: "The number of terms in the expansion of $(2 - 3x)^{11}$ is", opts: ["10", "11", "12", "infinite"], ans: 2, why: "$n + 1 = 12$ terms for a positive integer $n$." },
    { q: "The term in $x^4$ of $(a + 2x)^7$ is", opts: ["$35a^3 \\cdot 16x^4$", "$35a^4 \\cdot 16x^4$", "$21a^3 \\cdot 8x^4$", "$7a^3 \\cdot 16x^4$"], ans: 0, why: "$\\binom{7}{4}a^{7-4}(2x)^4 = 35 \\cdot a^3 \\cdot 16x^4$." },
    { q: "The $x^2$ term of $(1 + 2x)^{\\frac12}$ is", opts: ["$-\\tfrac12 x^2$", "$\\tfrac12 x^2$", "$-2x^2$", "$x^2$"], ans: 0, why: "$\\frac{\\frac12 \\cdot (-\\frac12)}{2}(2x)^2 = -\\tfrac18 \\cdot 4x^2 = -\\tfrac12 x^2$." },
    { q: "$(1 + 3x)^{-1}$ is valid for", opts: ["$|x| < 3$", "$|x| < \\tfrac13$", "all $x$", "$x > 0$"], ans: 1, why: "$|3x| < 1 \\Rightarrow |x| < \\tfrac13$." },
    { q: "$(9 - 2x)^{\\frac12}$ is valid for", opts: ["$|x| < \\tfrac29$", "$|x| < \\tfrac92$", "$|x| < 9$", "$|x| < 2$"], ans: 1, why: "$3\\left(1 - \\tfrac{2x}{9}\\right)^{\\frac12}$ needs $\\left|\\tfrac{2x}{9}\\right| < 1$." },
    { q: "$(8 + x)^{\\frac13}$ begins with the constant", opts: ["8", "2", "$\\tfrac13$", "1"], ans: 1, why: "$8^{\\frac13}\\left(1 + \\tfrac x8\\right)^{\\frac13}$." },
    { q: "$(3 + x)^{-2}$ begins with the constant", opts: ["$-9$", "$-\\tfrac19$", "$\\tfrac19$", "$\\tfrac13$"], ans: 2, why: "$3^{-2} = \\tfrac19$." },
    { q: "Coefficient of $x$ in $(2 + x)^5$:", opts: ["5", "80", "16", "10"], ans: 1, why: "$\\binom51 \\cdot 2^4 = 80$." },
    { q: "If every omitted term is negative, the truncated series gives", opts: ["an overestimate", "an underestimate", "the exact value", "no information"], ans: 0, why: "Negative quantities were left out, so the estimate is too large." },
    { q: "Coefficient of $x^2$ in $(1 + x)(1 + 4x + 6x^2)$:", opts: ["6", "10", "4", "24"], ans: 1, why: "$1 \\cdot 6 + 1 \\cdot 4 = 10$." },
    { q: "Coefficient of $x^2$ in $(1 + 2x - 2x^2)(1 + \\tfrac12 x + \\tfrac38 x^2)$:", opts: ["$\\tfrac38$", "$-\\tfrac58$", "$\\tfrac{11}{8}$", "$-2$"], ans: 1, why: "$\\tfrac38 + 2 \\cdot \\tfrac12 - 2 = -\\tfrac58$: three contributions." },
    { q: "The product $(1 + 4x)^{\\frac12}(1 - x)^{-\\frac12}$ is valid for", opts: ["$|x| < 1$", "$|x| < 4$", "$|x| < \\tfrac14$", "$\\tfrac14 < |x| < 1$"], ans: 2, why: "The tighter of $|x| < \\tfrac14$ and $|x| < 1$." },
    { q: "To estimate $\\sqrt5$ from $(1 + 8x)^{\\frac12}$ you use $x = \\tfrac{1}{32}$ and then", opts: ["divide by 2", "multiply by 2", "square the result", "take the reciprocal"], ans: 1, why: "$\\sqrt{1 + \\tfrac14} = \\tfrac{\\sqrt5}{2}$, so double it." },
    { q: "Which value of $x$ gives the most accurate 3-term estimate from $(4 - x)^{-\\frac12}$: $x = -14$, $x = 2$ or $x = -\\tfrac12$?", opts: ["$-14$", "$2$", "$-\\tfrac12$", "all equal"], ans: 2, why: "$-14$ is outside $|x| < 4$; of the valid two, the smaller $|x|$ wins." },
    { q: "In $\\frac{50x^2 + 38x + 9}{(5x + 2)^2(1 - 2x)}$ the correct partial-fraction form is", opts: ["$\\tfrac{A}{5x+2} + \\tfrac{B}{1-2x}$", "$\\tfrac{A}{5x+2} + \\tfrac{B}{(5x+2)^2} + \\tfrac{C}{1-2x}$", "$\\tfrac{Ax + B}{(5x+2)^2} + \\tfrac{C}{1-2x}$", "$\\tfrac{A}{(5x+2)^2} + \\tfrac{B}{1-2x}$"], ans: 1, why: "A repeated linear factor needs a term for each power." },
    { q: "The notation $\\binom{1/2}{2}$ is", opts: ["equal to $-\\tfrac18$", "not defined — use $\\tfrac{\\frac12(-\\frac12)}{2!}$", "equal to $\\tfrac14$", "acceptable in a final answer"], ans: 1, why: "$\\binom{n}{r}$ is defined for non-negative integer $n$; mark schemes reject it for fractions." },
    { q: "On the fx-991CW, nCr is found under", opts: ["SHIFT ÷", "CATALOG → Probability", "SETTINGS", "FORMAT"], ans: 1, why: "CATALOG → Probability → nCr." }
  ]
};


/* =====================================================================
   4.2  Sequences and recurrence relations
   ===================================================================== */
C["maths:4.2"] = {
  notes: [
    { h: "Sequences — the whole topic on one page" },
    "A sequence is a list of numbers with a rule. Two kinds of rule appear: an **$n$th-term formula** ($u_n = 3n + 1$) and a **recurrence relation** ($u_{n+1} = f(u_n)$ with a starting value). The exam's favourite is the recurrence whose terms **repeat** — a *periodic* sequence — combined with a sigma sum over many terms (4.3), or with an unknown $k$ fixed by a condition.",
    { ul: [
      "**Increasing**: $u_{n+1} > u_n$ for all $n$. **Decreasing**: $u_{n+1} < u_n$ for all $n$. **Periodic of order $p$**: $u_{n+p} = u_n$ for all $n$ — the terms cycle every $p$ steps.",
      "**Recurrence with an unknown $k$**: write the first few terms in terms of $k$, apply the condition (e.g. $u_3 = -1$, or $a_4 = a_1$), get a quadratic in $k$, solve, and **reject** the root the question rules out — with a reason.",
      "**Sum of many terms of a periodic sequence**: count complete cycles plus the leftover terms."
    ] },

    { page: "Kinds of sequence" },
    { table: { head: ["Sequence", "Rule", "Behaviour", "Why"], rows: [
      ["$u_n = \\frac{1}{3n + 1}$", "$n$th term", "decreasing", "the denominator grows, so each term is smaller: $u_{n+1} < u_n$"],
      ["$u_n = 2^n$", "$n$th term", "increasing", "each term doubles: $u_{n+1} > u_n$"],
      ["$u_1 = 3$, $u_{n+1} = \\frac{1}{u_n}$", "recurrence", "periodic, order 2", "$3, \\frac13, 3, \\frac13, \\ldots$"],
      ["$a_1 = 3$, $a_{n+1} = 8 - a_n$", "recurrence", "periodic, order 2", "$3, 5, 3, 5, \\ldots$"],
      ["$a_1 = 3$, $a_{n+1} = \\frac{a_n - 3}{a_n - 2}$", "recurrence", "periodic, order 3", "$3, 0, \\frac32, 3, \\ldots$"],
      ["$u_n = 5 + 7\\cos\\frac{n\\pi}{2}$", "$n$th term", "periodic, order 4", "$\\cos$ of multiples of $\\frac{\\pi}{2}$ cycles $0, -1, 0, 1$"],
      ["$u_n = (-1)^n$", "$n$th term", "periodic, order 2", "alternates $-1, 1$"]
    ] } },
    { callout: { t: "tip", h: "How to show a sequence is increasing / decreasing / periodic", body: [
      "**Increasing/decreasing from a formula**: compute $u_{n+1} - u_n$ (or $\\frac{u_{n+1}}{u_n}$) and show its sign for every $n$. \"Because the denominator increases\" is acceptable for a simple reciprocal.",
      "**Periodic**: write out terms until one repeats a previous term *in the same position of the cycle* — once $u_4 = u_1$, the rule guarantees $u_5 = u_2$ and so on. State the order.",
      "A sequence can be none of these (e.g. $u_n = n^2 - 4n$ decreases then increases)."
    ] } },
    { worked: { tag: "exam", title: "Show periodic, state the order, sum 88 terms", src: "A-level June 2022 · P2 Q3 · 4 marks",
      q: "$a_1 = 3$, $a_{n+1} = 8 - a_n$. **(a)(i)** Show that this sequence is periodic. **(ii)** State the order. **(b)** Find $\\displaystyle\\sum_{n=1}^{88} a_n$.",
      steps: [
        { h: "(a) Generate terms", m: "$a_2 = 8 - 3 = 5, \\quad a_3 = 8 - 5 = 3, \\quad a_4 = 5, \\ldots$ The terms repeat $3, 5, 3, 5$: periodic of **order 2**.", mk: "M1 A1", n: "Once $a_3 = a_1$ the whole sequence repeats — say so." },
        { h: "(b) 88 terms = 44 complete cycles", m: "$\\displaystyle\\sum_{n=1}^{88} a_n = 44 \\times (3 + 5) = 352$", mk: "M1 A1" }
      ], result: "order 2; 352" } },
    { worked: { tag: "exam", title: "Order-3 recurrence with fractions; sum of 100 terms and a \"hence\"", src: "A-level Specimen · P1 Q3 · 4 marks",
      q: "$a_1 = 3$, $a_{n+1} = \\frac{a_n - 3}{a_n - 2}$. **(a)** Find $\\displaystyle\\sum_{r=1}^{100} a_r$. **(b)** Hence find $\\displaystyle\\sum_{r=1}^{100} a_r + \\sum_{r=1}^{99} a_r$.",
      steps: [
        { h: "(a) Terms", m: "$a_2 = \\dfrac{0}{1} = 0, \\quad a_3 = \\dfrac{-3}{-2} = \\dfrac32, \\quad a_4 = \\dfrac{-\\frac32}{-\\frac12} = 3$: order 3, cycle sum $3 + 0 + \\dfrac32 = \\dfrac92$", mk: "M1 A1" },
        { m: "$100 = 33 \\times 3 + 1$: $\; 33 \\times \\dfrac92 + a_1 = \\dfrac{297}{2} + 3 = \\dfrac{303}{2}$", mk: "A1", n: "The one leftover term is $a_{100} = a_1$ (position 1 of the cycle, since $100 = 99 + 1$)." },
        { h: "(b) The 99-term sum is exactly 33 cycles", m: "$\\dfrac{303}{2} + \\dfrac{297}{2} = 300$", mk: "B1" }
      ], result: "(a) $\\frac{303}{2}$ (b) $300$" } },
    { worked: { tag: "exam", title: "A trig-driven recurrence: order 4, then $\\sum_{r=1}^{25}$", src: "A-level June 2023 · P2 Q2 · 6 marks",
      q: "$u_1 = 35$, $u_{n+1} = u_n + 7\\cos\\left(\\frac{n\\pi}{2}\\right) - 5(-1)^n$. **(a)(i)** Show that $u_2 = 40$. **(ii)** Find $u_3$ and $u_4$. Given the sequence is periodic with order 4, **(b)(i)** write down $u_5$; **(ii)** find $\\displaystyle\\sum_{r=1}^{25} u_r$.",
      steps: [
        { h: "(a)(i) $n = 1$", m: "$u_2 = 35 + 7\\cos\\dfrac{\\pi}{2} - 5(-1) = 35 + 0 + 5 = 40$", mk: "B1*", n: "Radians: $\\cos\\frac{\\pi}{2} = 0$. Calculator in degrees here gives nonsense." },
        { h: "(ii)", m: "$u_3 = 40 + 7\\cos\\pi - 5(1) = 40 - 7 - 5 = 28; \\qquad u_4 = 28 + 7\\cos\\dfrac{3\\pi}{2} - 5(-1) = 33$", mk: "M1 A1" },
        { h: "(b)(i)", m: "$u_5 = u_1 = 35$", mk: "B1" },
        { h: "(ii) $25 = 6 \\times 4 + 1$", m: "$6(35 + 40 + 28 + 33) + 35 = 6 \\times 136 + 35 = 851$", mk: "M1 A1" }
      ], result: "$u_3 = 28$, $u_4 = 33$, $u_5 = 35$; sum $851$" } },

    { page: "Recurrences with an unknown constant" },
    { callout: { t: "memorise", h: "The routine", body: [
      "1. Write $u_2$ in terms of $k$, then $u_3$ (substituting $u_2$), as far as the condition needs.",
      "2. Impose the condition: $u_3 = -1$; $u_1 + 2u_2 + u_3 = 0$; $a_4 = a_1$ (periodic of order 3).",
      "3. Clear fractions → a quadratic in $k$ → solve.",
      "4. **Choose** the root: \"$k$ is an integer\", \"$k$ is positive\", or \"$k \\ne 1$ because then the sequence is constant, not order 3\". The reason is a mark."
    ] } },
    { worked: { tag: "exam", title: "$u_{n+1} = ku_n - 5$ with $u_3 = -1$", src: "A-level June 2024 · P2 Q4 · 5 marks",
      q: "$u_{n+1} = ku_n - 5$, $u_1 = 6$, $k > 0$. Given $u_3 = -1$, **(a)** show that $6k^2 - 5k - 4 = 0$. **(b)** Hence **(i)** find $k$; **(ii)** find $\\displaystyle\\sum_{r=1}^{3} u_r$.",
      steps: [
        { h: "(a)", m: "$u_2 = 6k - 5; \\qquad u_3 = k(6k - 5) - 5 = 6k^2 - 5k - 5 = -1 \;\\Rightarrow\; 6k^2 - 5k - 4 = 0$", mk: "M1 A1*" },
        { h: "(b)(i)", m: "$(3k - 4)(2k + 1) = 0$; $k > 0 \\Rightarrow k = \\dfrac43$", mk: "M1 A1" },
        { h: "(ii)", m: "$u_2 = 8 - 5 = 3$: $\; 6 + 3 + (-1) = 8$", mk: "A1" }
      ], result: "$k = \\frac43$; sum $8$" } },
    { worked: { tag: "exam", title: "$u_{n+1} = k - \\frac{24}{u_n}$ with a linear condition; $k$ an integer", src: "A-level Oct 2021 · P1 Q3 · 6 marks",
      q: "$u_{n+1} = k - \\frac{24}{u_n}$, $u_1 = 2$, $k$ an integer. Given $u_1 + 2u_2 + u_3 = 0$, **(a)** show that $3k^2 - 58k + 240 = 0$. **(b)** Find $k$, giving a reason. **(c)** Find $u_3$.",
      steps: [
        { h: "(a)", m: "$u_2 = k - 12; \\qquad u_3 = k - \\dfrac{24}{k - 12}$\n$2 + 2(k - 12) + k - \\dfrac{24}{k - 12} = 0 \\Rightarrow (3k - 22)(k - 12) = 24 \\Rightarrow 3k^2 - 58k + 240 = 0$", mk: "M1 M1 A1*", n: "Multiply through by $(k - 12)$ to clear the fraction — allowed because $u_2 \\neq 0$ (the recurrence would be undefined)." },
        { h: "(b)", m: "$(3k - 40)(k - 6) = 0 \\Rightarrow k = \\dfrac{40}{3}$ or $6$; $k$ is an integer so $k = 6$", mk: "M1 A1" },
        { h: "(c)", m: "$u_2 = -6, \\quad u_3 = 6 - \\dfrac{24}{-6} = 10$", mk: "B1" }
      ], result: "$k = 6$; $u_3 = 10$" } },
    { worked: { tag: "exam", title: "Periodic of order 3 fixes $k$; why $k \\ne 1$; sum of 80 terms", src: "A-level Oct 2020 · P1 Q13 · 7 marks",
      q: "$a_{n+1} = \\frac{k(a_n + 2)}{a_n}$, $a_1 = 2$, and the sequence is periodic of order 3. **(a)** Show that $k^2 + k - 2 = 0$. **(b)** Explain why $k \\ne 1$. **(c)** Find $\\displaystyle\\sum_{r=1}^{80} a_r$.",
      steps: [
        { h: "(a) Order 3 means $a_4 = a_1$", m: "$a_2 = \\dfrac{4k}{2} = 2k; \\qquad a_3 = \\dfrac{k(2k + 2)}{2k} = k + 1; \\qquad a_4 = \\dfrac{k(k + 3)}{k + 1}$", mk: "M1 A1" },
        { m: "$\\dfrac{k(k + 3)}{k + 1} = 2 \\Rightarrow k^2 + 3k = 2k + 2 \\Rightarrow k^2 + k - 2 = 0$", mk: "A1*" },
        { h: "(b)", m: "If $k = 1$ then $a_2 = 2$, $a_3 = 2$, … — every term is 2, so the sequence has order 1, not 3.", mk: "B1", n: "A periodic sequence's order is the *smallest* repeat length. Constant sequences are the trap." },
        { h: "(c) $k = -2$", m: "$a_1 = 2, \; a_2 = -4, \; a_3 = -1$; cycle sum $-3$. $80 = 26 \\times 3 + 2$: $\; 26(-3) + 2 + (-4) = -80$", mk: "M1 M1 A1" }
      ], result: "$k = -2$; sum $-80$" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Show that the sequence is periodic / state the order**", "enough terms to exhibit the repeat, and the cycle length"],
      ["**Show that** (a quadratic in $k$)", "the terms in $k$, the condition applied, the algebra to the printed form"],
      ["**Find $k$, giving a reason**", "both roots, the rejected one named with the reason from the question"],
      ["**Find $\\sum_{r=1}^{N} a_r$**", "cycles × cycle sum + the leftover terms, shown"],
      ["**Explain why $k \\ne 1$**", "what the sequence would be for that $k$ and why it breaks the given property"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Miscounting the leftovers**: $100 = 33 \\times 3 + 1$ — one extra term, and it is $a_1$'s value.",
      "**Calculator in degrees** for $\\cos\\frac{n\\pi}{2}$.",
      "**Order of a constant sequence** treated as 3.",
      "**Not clearing the fraction** in $u_3$ before collecting.",
      "**Keeping the rejected root** or rejecting without the reason."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Iterate a recurrence", "Type the first term, EXE. Then type the rule using **Ans** in place of $u_n$ (e.g. $8 - \\text{Ans}$) and press EXE repeatedly: each press is the next term. Count presses carefully."],
      ["Sum check", "**Spreadsheet** app: put $u_1$ in A1, the recurrence in A2 referencing A1, fill down, sum the column. Checks a cycle-count answer in a minute."]
    ] },
    { callout: { t: "mnemonic", h: "\"Terms, cycle, count, leftover\"", body: "Generate terms until they repeat; note the cycle sum; count complete cycles; add the leftover terms one by one." } }
  ],
  flashcards: [
    ["Definition of a periodic sequence of order $p$?", "$u_{n+p} = u_n$ for all $n$; $p$ is the smallest such repeat length."],
    ["Increasing sequence?", "$u_{n+1} > u_n$ for all $n$."],
    ["$a_1 = 3$, $a_{n+1} = 8 - a_n$: order and $\\sum_{n=1}^{88} a_n$?", "Order 2 ($3, 5$); $44 \\times 8 = 352$."],
    ["$a_1 = 3$, $a_{n+1} = \\frac{a_n - 3}{a_n - 2}$: first three terms and $\\sum_{r=1}^{100}$?", "$3, 0, \\frac32$; $33 \\times \\frac92 + 3 = \\frac{303}{2}$."],
    ["$u_{n+1} = ku_n - 5$, $u_1 = 6$, $u_3 = -1$: equation in $k$?", "$6k^2 - 5k - 4 = 0$, $k = \\frac43$ ($k > 0$)."],
    ["$a_{n+1} = \\frac{k(a_n + 2)}{a_n}$, $a_1 = 2$, order 3: why not $k = 1$?", "Then every term is 2 — order 1."],
    ["$u_1 = 35$, $u_{n+1} = u_n + 7\\cos\\frac{n\\pi}{2} - 5(-1)^n$: cycle?", "$35, 40, 28, 33$; $\\sum_{r=1}^{25} = 6 \\times 136 + 35 = 851$."],
    ["How many terms are left over in $\\sum_{r=1}^{80}$ of an order-3 sequence?", "$80 = 26 \\times 3 + 2$: two, namely $a_1$ and $a_2$."]
  ],
  quiz: [
    { q: "$u_n = \\frac{1}{3n + 1}$ is", opts: ["increasing", "decreasing", "periodic", "constant"], ans: 1, why: "Denominator grows." },
    { q: "$u_1 = 3$, $u_{n+1} = \\frac{1}{u_n}$ has order", opts: ["1", "2", "3", "not periodic"], ans: 1, why: "$3, \\frac13, 3, \\ldots$" },
    { q: "Sum of 50 terms of a period-3 sequence with cycle $2, 5, -1$:", opts: ["96", "102", "98", "100"], ans: 1, why: "$16 \\times 6 + 2 + 5$." },
    { q: "$u_{n+1} = u_n + 7\\cos\\frac{n\\pi}{2}$: $\\cos\\frac{n\\pi}{2}$ for $n = 1, 2, 3, 4$ is", opts: ["$1, 0, -1, 0$", "$0, -1, 0, 1$", "$0, 1, 0, -1$", "$1, -1, 1, -1$"], ans: 1, why: "Radians: $\\cos\\frac{\\pi}{2} = 0$, $\\cos\\pi = -1$, …" },
    { q: "A recurrence gives $k^2 + k - 2 = 0$ and the sequence must have order 3. $k =$", opts: ["1", "$-2$", "2", "$-1$"], ans: 1, why: "$k = 1$ makes it constant." },
    { q: "$u_n = (-1)^n n$ is", opts: ["increasing", "decreasing", "periodic", "none of these"], ans: 3, why: "$-1, 2, -3, 4, \\ldots$ alternates and grows." }
  ]
};

/* =====================================================================
   4.3  Sigma notation
   ===================================================================== */
C["maths:4.3"] = {
  notes: [
    { h: "Sigma notation — the whole topic on one page" },
    "$\\displaystyle\\sum_{r=1}^{n} u_r$ means $u_1 + u_2 + \\cdots + u_n$: the **variable** $r$ runs from the **lower limit** to the **upper limit**, and you add the terms. The spec asks for three things: reading a sum written in sigma form, writing a series in sigma form, and knowing $\\displaystyle\\sum_{r=1}^{n} 1 = n$.",
    { table: { head: ["Sigma", "Means", "Value"], rows: [
      ["$\\displaystyle\\sum_{r=1}^{n} 1$", "$1 + 1 + \\cdots + 1$ ($n$ times)", "$n$"],
      ["$\\displaystyle\\sum_{r=1}^{n} r$", "$1 + 2 + \\cdots + n$", "$\\frac{n(n + 1)}{2}$"],
      ["$\\displaystyle\\sum_{r=1}^{16} (3 + 5r)$", "arithmetic: $8 + 13 + \\cdots + 83$", "$\\frac{16}{2}(8 + 83) = 728$"],
      ["$\\displaystyle\\sum_{r=1}^{16} 2^r$", "geometric: $2 + 4 + \\cdots + 2^{16}$", "$\\frac{2(2^{16} - 1)}{1} = 131\\,070$"],
      ["$\\displaystyle\\sum_{r=4}^{\\infty} 20\\left(\\tfrac12\\right)^r$", "geometric from $r = 4$", "$\\frac{20 \\cdot (1/2)^4}{1 - 1/2} = \\frac52$"],
      ["$\\displaystyle\\sum_{n=1}^{48} \\log_5\\!\\left(\\tfrac{n+2}{n+1}\\right)$", "telescoping product inside a log", "$\\log_5\\frac{50}{2} = 2$"]
    ] } },

    { page: "Evaluating sums" },
    { callout: { t: "memorise", h: "Splitting and counting", body: [
      "$\\displaystyle\\sum (a_r + b_r) = \\sum a_r + \\sum b_r$ and $\\displaystyle\\sum k a_r = k\\sum a_r$ — split a sum into pieces you recognise (constant, arithmetic, geometric).",
      "**Number of terms** from $r = m$ to $r = n$ is $n - m + 1$. From $r = 4$ to $r = 20$ is 17 terms, not 16.",
      "A sum that starts at $r = 4$: either re-index, or compute $\\sum_1^{20} - \\sum_1^{3}$, or take the first term as the $r = 4$ term with the right count."
    ] } },
    { worked: { tag: "exam", title: "Split a mixed sum; then a period-2 recurrence sum", src: "A-level June 2018 · P2 Q4 · 7 marks",
      q: "**(i)** Show that $\\displaystyle\\sum_{r=1}^{16}(3 + 5r + 2^r) = 131\\,798$. **(ii)** $u_{n+1} = \\frac{1}{u_n}$, $u_1 = \\frac23$. Find the exact value of $\\displaystyle\\sum_{r=1}^{100} u_r$.",
      steps: [
        { h: "(i) Three sums", m: "$\\displaystyle\\sum_{r=1}^{16} 3 = 48; \\qquad \\sum_{r=1}^{16} 5r = 5 \\cdot \\dfrac{16 \\times 17}{2} = 680; \\qquad \\sum_{r=1}^{16} 2^r = \\dfrac{2(2^{16} - 1)}{2 - 1} = 131\\,070$", mk: "B1 M1 M1", n: "Constant, arithmetic, geometric. The geometric has $a = 2$, $r = 2$, 16 terms." },
        { m: "$48 + 680 + 131\\,070 = 131\\,798$", mk: "A1*" },
        { h: "(ii)", m: "$u_1 = \\dfrac23, \; u_2 = \\dfrac32, \; u_3 = \\dfrac23, \\ldots$ order 2; 100 terms = 50 cycles: $50\\left(\\dfrac23 + \\dfrac32\\right) = 50 \\times \\dfrac{13}{6} = \\dfrac{325}{3}$", mk: "M1 M1 A1" }
      ], result: "(i) shown (ii) $\\frac{325}{3}$" } },
    { worked: { tag: "exam", title: "Geometric sum from $r = 4$ to infinity; a telescoping log sum", src: "A-level June 2019 · P2 Q8 · 6 marks",
      q: "**(i)** Find the value of $\\displaystyle\\sum_{r=4}^{\\infty} 20\\left(\\frac12\\right)^r$. **(ii)** Show that $\\displaystyle\\sum_{n=1}^{48} \\log_5\\left(\\frac{n + 2}{n + 1}\\right) = 2$.",
      steps: [
        { h: "(i) First term is the $r = 4$ term", m: "$a = 20 \\cdot \\dfrac{1}{16} = \\dfrac54$, $r = \\dfrac12$: $S_\\infty = \\dfrac{5/4}{1 - 1/2} = \\dfrac52$", mk: "M1 M1 A1", n: "Or $\\sum_0^\\infty - \\sum_0^3 = 40 - 37.5$." },
        { h: "(ii) Logs of a product add", m: "$\\log_5\\dfrac32 + \\log_5\\dfrac43 + \\log_5\\dfrac54 + \\cdots + \\log_5\\dfrac{50}{49} = \\log_5\\left(\\dfrac32 \\cdot \\dfrac43 \\cdots \\dfrac{50}{49}\\right) = \\log_5\\dfrac{50}{2} = \\log_5 25 = 2$", mk: "M1 M1 A1*", n: "Every numerator cancels the next denominator — a *telescoping* product. Write the first two and last terms so the cancellation is visible." }
      ], result: "(i) $\\frac52$ (ii) shown" } },
    { worked: { tag: "exam", title: "$\\cos(180n)°$ as $(-1)^n$", src: "A-level Oct 2021 · P2 Q9 · 3 marks",
      q: "Show that $\\displaystyle\\sum_{n=2}^{\\infty} \\left(\\frac34\\right)^n \\cos(180n)° = \\frac{9}{28}$.",
      steps: [
        { m: "$\\cos(180n)° = (-1)^n$, so the series is $\\displaystyle\\sum_{n=2}^{\\infty}\\left(-\\dfrac34\\right)^n$: geometric, first term $\\dfrac{9}{16}$, ratio $-\\dfrac34$", mk: "M1 A1" },
        { m: "$S_\\infty = \\dfrac{9/16}{1 + 3/4} = \\dfrac{9/16}{7/4} = \\dfrac{9}{28}$", mk: "A1*", n: "$|r| = \\frac34 < 1$, so the sum exists — say it." }
      ], result: "shown" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Count the terms**: upper − lower + 1.",
      "**First term of a sum starting at $r = 4$** is the $r = 4$ term, not the $r = 1$ term.",
      "**$\\sum 3$ is $3n$**, not 3.",
      "**Telescoping**: write enough terms to show the cancellation; the answer is (last numerator)/(first denominator).",
      "**Sigma of a periodic sequence**: cycles and leftovers (4.2)."
    ] },
    { callout: { t: "mnemonic", h: "\"Bottom to top, add them up; upper minus lower plus one\"", body: "What sigma means, and how many terms it has." } }
  ],
  flashcards: [
    ["$\\sum_{r=1}^{n} 1 = $?", "$n$."],
    ["$\\sum_{r=1}^{n} r = $?", "$\\frac{n(n+1)}{2}$."],
    ["Number of terms in $\\sum_{r=4}^{20}$?", "17."],
    ["$\\sum_{r=1}^{16} 2^r = $?", "$2(2^{16} - 1) = 131\\,070$."],
    ["$\\sum_{r=4}^{\\infty} 20(\\frac12)^r = $?", "$\\frac{5/4}{1/2} = \\frac52$."],
    ["$\\sum_{n=1}^{48}\\log_5\\frac{n+2}{n+1} = $?", "$\\log_5\\frac{50}{2} = 2$ (telescoping)."],
    ["$\\cos(180n)°$ equals…", "$(-1)^n$."]
  ],
  quiz: [
    { q: "$\\sum_{r=1}^{5} (2r + 1) =$", opts: ["35", "30", "25", "11"], ans: 0, why: "$3 + 5 + 7 + 9 + 11$." },
    { q: "$\\sum_{r=3}^{10} 4$ equals", opts: ["32", "40", "28", "4"], ans: 0, why: "8 terms of 4." },
    { q: "$\\sum_{r=1}^{n} r$ for $n = 100$:", opts: ["5050", "5000", "10100", "4950"], ans: 0, why: "$\\frac{100 \\times 101}{2}$." },
    { q: "$\\sum_{r=1}^{\\infty} 3(\\frac{1}{4})^{r}$ =", opts: ["4", "1", "$\\tfrac34$", "12"], ans: 1, why: "$a = \\frac34$, $S = \\frac{3/4}{3/4}$." },
    { q: "$\\sum_{n=1}^{9}\\ln\\frac{n+1}{n} =$", opts: ["$\\ln 10$", "$\\ln 9$", "$9$", "$\\ln 45$"], ans: 0, why: "Telescopes to $\\ln\\frac{10}{1}$." }
  ]
};

/* =====================================================================
   4.4  Arithmetic sequences and series
   ===================================================================== */
C["maths:4.4"] = {
  notes: [
    { h: "Arithmetic sequences — the whole topic on one page" },
    "Add the same amount each time. Two formulae (in the booklet), one proof (not in the booklet — you must know it), and a family of savings/loan/gear questions that turn \"the total is …\" into a **quadratic in $n$** whose two roots need interpreting.",
    { callout: { t: "formula", h: "In the formulae booklet — arithmetic series", body: [
      "$$u_n = a + (n - 1)d \\qquad S_n = \\dfrac{n}{2}\\left[2a + (n - 1)d\\right] = \\dfrac{n}{2}(a + l)$$",
      "$a$ first term, $d$ common difference, $l$ last term. The spec also expects $\\displaystyle\\sum_{r=1}^{n} r = \\frac{n(n+1)}{2}$."
    ] } },

    { page: "Formulae and the proof" },
    { callout: { t: "memorise", h: "Proof of $S_n = \\frac{n}{2}[2a + (n - 1)d]$ — set on A-level P1 2022", body: [
      "Write the sum forwards and backwards:",
      "$$S_n = a + (a + d) + \\cdots + (a + (n - 1)d)$$",
      "$$S_n = (a + (n - 1)d) + (a + (n - 2)d) + \\cdots + a$$",
      "Add the two lines term by term: every pair is $2a + (n - 1)d$, and there are $n$ pairs:",
      "$$2S_n = n\\left[2a + (n - 1)d\\right] \;\\Rightarrow\; S_n = \\dfrac{n}{2}\\left[2a + (n - 1)d\\right]$$",
      "Three marks: the two rows (one reversed), the adding to $n$ equal pairs, the division by 2 to the printed result."
    ] } },
    { worked: { tag: "exam", title: "Common difference from two terms; sum of 500 terms", src: "A-level Oct 2021 · P2 Q1 · 4 marks",
      q: "In an arithmetic series the first term is 16 and the 21st term is 24. **(a)** Find the common difference. **(b)** Hence find the sum of the first 500 terms.",
      steps: [
        { h: "(a)", m: "$u_{21} = 16 + 20d = 24 \\Rightarrow d = 0.4$", mk: "M1 A1", n: "The 21st term has **20** differences added, not 21." },
        { h: "(b)", m: "$S_{500} = \\dfrac{500}{2}\\left[32 + 499 \\times 0.4\\right] = 250 \\times 231.6 = 57\\,900$", mk: "M1 A1" }
      ], result: "$d = 0.4$; $S_{500} = 57\\,900$" } },
    { worked: { tag: "exam", title: "Three terms in $k$ — find $k$, then $S_{50}$", src: "A-level June 2025 · P1 Q3 · 5 marks",
      q: "The first three terms of an arithmetic sequence are $6k$, $10$ and $2k$. **(a)** Find $k$. **(b)** Hence find the sum of the first 50 terms.",
      steps: [
        { h: "(a) Equal differences", m: "$10 - 6k = 2k - 10 \\Rightarrow 20 = 8k \\Rightarrow k = \\dfrac52$", mk: "M1 A1", n: "Or: the middle term is the mean of its neighbours, $6k + 2k = 20$." },
        { h: "(b)", m: "Terms $15, 10, 5$: $a = 15$, $d = -5$. $S_{50} = \\dfrac{50}{2}\\left[30 + 49(-5)\\right] = 25 \\times (-215) = -5375$", mk: "M1 M1 A1", n: "A negative sum is fine — most terms are negative." }
      ], result: "$k = \\frac52$; $S_{50} = -5375$" } },
    { worked: { tag: "exam", title: "Show the sum of $n$ terms is a square number", src: "A-level Specimen · P2 Q11 · 5 marks",
      q: "The second, third and fourth terms of an arithmetic sequence are $2k$, $5k - 10$ and $7k - 14$. Show that the sum of the first $n$ terms is a square number.",
      steps: [
        { h: "Equal differences give $k$", m: "$(5k - 10) - 2k = (7k - 14) - (5k - 10) \\Rightarrow 3k - 10 = 2k - 4 \\Rightarrow k = 6$", mk: "M1 A1" },
        { h: "Terms and first term", m: "$u_2 = 12, u_3 = 20, u_4 = 28$: $d = 8$, $a = 4$", mk: "A1" },
        { m: "$S_n = \\dfrac{n}{2}\\left[8 + 8(n - 1)\\right] = \\dfrac{n}{2} \\cdot 8n = 4n^2 = (2n)^2$, a square number for every $n$.", mk: "M1 A1", n: "The last line must say *why* it is a square: it is $(2n)^2$." }
      ], result: "$S_n = (2n)^2$" } },

    { page: "Savings, loans and \"find $n$\"" },
    { callout: { t: "memorise", h: "A total in context is $S_n$; it gives a quadratic in $n$", body: [
      "1. Identify $a$ and $d$ from the story (£10 in week 1, £9.20 in week 2: $a = 10$, $d = -0.8$).",
      "2. Set $S_n = $ the target and multiply out to $An^2 + Bn + C = 0$.",
      "3. Solve — usually two positive roots.",
      "4. **Interpret**: the smaller root is normally the answer; the larger comes after the terms have gone negative (repaying negative amounts, saving negative money) and is rejected **with that reason**."
    ] } },
    { worked: { tag: "exam", title: "James saves for a printer", src: "A-level June 2022 · P1 Q13(ii) · 4 marks",
      q: "James saves £10 in week 1, £9.20 in week 2, £8.40 in week 3, and so on (arithmetic). He takes $n$ weeks to save exactly £64. **(a)** Show that $n^2 - 26n + 160 = 0$. **(b)** Solve the equation. **(c)** Hence state the number of weeks James takes, with a brief reason.",
      steps: [
        { h: "(a) $a = 10$, $d = -0.8$", m: "$\\dfrac{n}{2}\\left[20 - 0.8(n - 1)\\right] = 64 \\Rightarrow n(20.8 - 0.8n) = 128 \\Rightarrow 0.8n^2 - 20.8n + 128 = 0 \\Rightarrow n^2 - 26n + 160 = 0$", mk: "M1 A1*" },
        { h: "(b)", m: "$(n - 10)(n - 16) = 0 \\Rightarrow n = 10$ or $16$", mk: "B1" },
        { h: "(c)", m: "**10 weeks**: by week 16 the weekly amounts have become negative (week 14 would be $10 - 0.8 \\times 13 = -0.4$), which is impossible — he reaches £64 first at week 10.", mk: "B1", n: "Both roots are genuine solutions of the equation; only one is a solution of the *problem*." }
      ], result: "$n = 10$" } },
    { worked: { tag: "exam", title: "Interest-free loan repaid in a decreasing arithmetic sequence", src: "A-level June 2024 · P2 Q2 · 5 marks",
      q: "Jamie repays an £8100 loan with £400 in month 1, £390 in month 2, £380 in month 3, … **(a)** Show that Jamie repays £290 in month 12. **(b)** After the $N$th payment the loan is fully repaid. Show that $N^2 - 81N + 1620 = 0$. **(c)** Hence find $N$.",
      steps: [
        { h: "(a)", m: "$u_{12} = 400 + 11(-10) = 290$", mk: "B1" },
        { h: "(b)", m: "$\\dfrac{N}{2}\\left[800 - 10(N - 1)\\right] = 8100 \\Rightarrow N(810 - 10N) = 16\\,200 \\Rightarrow 10N^2 - 810N + 16\\,200 = 0 \\Rightarrow N^2 - 81N + 1620 = 0$", mk: "M1 A1*" },
        { h: "(c)", m: "$(N - 36)(N - 45) = 0$; $N = 36$, because by month 45 the payments would be negative (month 41 gives $400 - 400 = 0$).", mk: "M1 A1" }
      ], result: "$N = 36$" } },
    { worked: { tag: "exam", title: "Car gears: arithmetic model, then geometric model", src: "A-level Oct 2020 · P1 Q5 · 6 marks",
      q: "A car has six gears. Its fastest speed is 28 km/h in 1st gear and 115 km/h in 6th. **(a)** Modelling the fastest speeds in successive gears as an arithmetic sequence, find the fastest speed in 3rd gear. **(b)** Modelling them instead as a geometric sequence, find the fastest speed in 5th gear.",
      steps: [
        { h: "(a) Six terms: five differences", m: "$28 + 5d = 115 \\Rightarrow d = 17.4$; $u_3 = 28 + 2(17.4) = 62.8$ km/h", mk: "M1 A1 A1" },
        { h: "(b) Five ratios", m: "$28r^5 = 115 \\Rightarrow r = \\left(\\dfrac{115}{28}\\right)^{1/5} = 1.3265\\ldots$; $u_5 = 28r^4 = 86.7$ km/h", mk: "M1 A1 A1", n: "Keep $r$ unrounded in the calculator; round only the final speed." }
      ], result: "(a) 62.8 km/h (b) 86.7 km/h" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Prove / show that $S_n = \\frac n2[2a + (n-1)d]$**", "the forward-and-backward proof with the pairing explained"],
      ["**Find the common difference**", "$u_n = a + (n - 1)d$ with the right $n - 1$"],
      ["**Show that $n^2 - 26n + 160 = 0$**", "$S_n = $ target, multiplied out, divided through — every line"],
      ["**Hence state … giving a reason**", "the root chosen and why the other is impossible in context"],
      ["**Show that the sum is a square number**", "$S_n$ simplified to $(\\ldots)^2$ and that observation written"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**$n$ vs $n - 1$**: the 21st term has 20 differences added.",
      "**$S_n$ formula with $a$ and $l$ swapped** or the $\\frac n2$ dropped.",
      "**Taking the larger root** of the \"find $n$\" quadratic, or not giving a reason for rejecting it.",
      "**Arithmetic used for a percentage model** (that is geometric — 4.5).",
      "**Proof written as a verification** (checking a formula for $n = 3$ is not a proof)."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Sum check", "The $\\sum$ template (CATALOG → Func Analysis or the $\\Sigma$ key): $\\sum_{x=1}^{500}(16 + 0.4(x - 1))$ returns 57 900."],
      ["Find $n$ check", "Table app with $f(x) = \\frac{x}{2}(20 - 0.8(x - 1))$ from 1 to 20: the row where $f = 64$ is your $n$ — and you can see the terms turning negative later."]
    ] },
    { callout: { t: "mnemonic", h: "\"Half $n$ times first plus last\"", body: "$S_n = \\frac n2(a + l)$ — the average term times the number of terms. The $[2a + (n-1)d]$ version is the same thing with $l$ written out." } }
  ],
  flashcards: [
    ["$n$th term and sum of an arithmetic series?", "$u_n = a + (n-1)d$; $S_n = \\frac n2[2a + (n-1)d] = \\frac n2(a + l)$."],
    ["Prove $S_n = \\frac n2[2a + (n-1)d]$.", "Write $S_n$ forwards and backwards, add: $n$ pairs each $2a + (n-1)d$, so $2S_n = n[2a + (n-1)d]$."],
    ["First term 16, 21st term 24: $d$?", "$16 + 20d = 24 \\Rightarrow d = 0.4$."],
    ["$6k$, $10$, $2k$ arithmetic: $k$?", "$k = \\frac52$ (middle term is the mean)."],
    ["Savings £10, £9.20, £8.40… total £64: equation in $n$?", "$n^2 - 26n + 160 = 0$; $n = 10$ (16 rejected — negative savings)."],
    ["Why reject the larger root in a repayment question?", "By then the payments would have become negative — impossible in context."],
    ["$\\sum_{r=1}^{n} r = $?", "$\\frac{n(n+1)}{2}$."],
    ["Second, third, fourth terms $2k$, $5k-10$, $7k-14$: $S_n$?", "$k = 6$, $a = 4$, $d = 8$, $S_n = 4n^2$."]
  ],
  quiz: [
    { q: "$a = 5$, $d = 3$: $u_{20} =$", opts: ["62", "65", "60", "68"], ans: 0, why: "$5 + 19 \\times 3$." },
    { q: "$S_{10}$ for $2, 5, 8, \\ldots$:", opts: ["155", "145", "165", "135"], ans: 0, why: "$5(4 + 27)$." },
    { q: "$1 + 2 + \\cdots + 50 =$", opts: ["1275", "1250", "2550", "1225"], ans: 0, why: "$\\frac{50 \\times 51}{2}$." },
    { q: "In the proof of $S_n$, adding the forward and reversed sums gives", opts: ["$n$ pairs each $a + l$", "$2n$ pairs", "$n$ pairs each $a$", "$\\frac n2$ pairs"], ans: 0, why: "Each pair sums to $a + l = 2a + (n-1)d$." },
    { q: "Repayments £400, £390, … total £8100 gives $N = 36$ or $45$. Correct $N$:", opts: ["36", "45", "both", "neither"], ans: 0, why: "Payments negative before month 45." },
    { q: "Six gears from 28 to 115 km/h, arithmetic: $d =$", opts: ["14.5", "17.4", "21.75", "29"], ans: 1, why: "$87 \\div 5$." }
  ]
};

/* =====================================================================
   4.5  Geometric sequences and series
   ===================================================================== */
C["maths:4.5"] = {
  notes: [
    { h: "Geometric sequences — the whole topic on one page" },
    "Multiply by the same ratio each time. The formulae are in the booklet; the **proof** of $S_n$ and the **convergence condition** $|r| < 1$ are not. Questions: three terms in $k$ (a quadratic), a percentage-growth model (find the first year over a target — **logs**), a total over $N$ years, a sum to infinity, and a proof of the sum formula.",
    { callout: { t: "formula", h: "In the formulae booklet — geometric series", body: [
      "$$u_n = ar^{n-1} \\qquad S_n = \\dfrac{a(1 - r^n)}{1 - r} \\qquad S_\\infty = \\dfrac{a}{1 - r} \\text{ for } |r| < 1$$"
    ] } },

    { page: "Formulae, proof, convergence" },
    { callout: { t: "memorise", h: "Proof of $S_n = \\frac{a(1 - r^n)}{1 - r}$ — set on A-level Oct 2020 P2", body: [
      "$$S_n = a + ar + ar^2 + \\cdots + ar^{n-1}$$",
      "$$rS_n = ar + ar^2 + \\cdots + ar^{n-1} + ar^n$$",
      "Subtract: every middle term cancels, leaving $S_n - rS_n = a - ar^n$, so $S_n(1 - r) = a(1 - r^n)$ and (since $r \\neq 1$) $S_n = \\frac{a(1 - r^n)}{1 - r}$.",
      "Four marks: write $S_n$, write $rS_n$ shifted, subtract showing the cancellation, factorise and divide."
    ] } },
    { callout: { t: "tip", h: "Why $|r| < 1$ for a sum to infinity", body: "In $S_n = \\frac{a(1 - r^n)}{1 - r}$ the only thing that depends on $n$ is $r^n$. If $|r| < 1$, then $r^n \\to 0$ as $n \\to \\infty$ (multiplying by a number of size less than 1 shrinks it), so $S_n \\to \\frac{a}{1 - r}$. If $|r| \\ge 1$, $r^n$ does not shrink and the sum grows without limit (or oscillates). \"Convergent\" and \"$|r| < 1$\" are the same statement — write $|r| < 1$ **with the modulus**: $r = -\\frac34$ converges too." } },
    { worked: { tag: "exam", title: "Prove the sum formula; $S_{10} = 4S_5$", src: "A-level Oct 2020 · P2 Q15 · 8 marks",
      q: "A geometric series has first term $a \\neq 0$ and common ratio $r \\neq 1$. **(a)** Prove that $S_n = \\frac{a(1 - r^n)}{1 - r}$. **(b)** Given that $S_{10}$ is four times $S_5$, find the exact value of $r$.",
      steps: [
        { h: "(a)", m: "As in the box above: $S_n - rS_n = a - ar^n \\Rightarrow S_n = \\dfrac{a(1 - r^n)}{1 - r}$", mk: "M1 M1 A1 A1*" },
        { h: "(b) Divide out the common factor", m: "$\\dfrac{a(1 - r^{10})}{1 - r} = 4 \\cdot \\dfrac{a(1 - r^5)}{1 - r} \\Rightarrow 1 - r^{10} = 4(1 - r^5)$", mk: "M1" },
        { h: "$1 - r^{10} = (1 - r^5)(1 + r^5)$", m: "$(1 - r^5)(1 + r^5) = 4(1 - r^5) \\Rightarrow 1 + r^5 = 4$ (as $r \\neq 1$) $\\Rightarrow r^5 = 3 \\Rightarrow r = \\sqrt[5]{3}$", mk: "M1 A1 A1", n: "Difference of two squares in $r^5$. Cancelling $(1 - r^5)$ needs $r^5 \\neq 1$, which the condition $r \\neq 1$ gives." }
      ], result: "$r = 3^{1/5}$" } },
    { worked: { tag: "exam", title: "Three terms in $k$; which root converges; $S_\\infty$", src: "A-level June 2023 · P1 Q9 · 7 marks",
      q: "The first three terms of a geometric sequence are $3k + 4$, $12 - 3k$, $k + 16$. **(a)** Show that $3k^2 - 62k + 40 = 0$. Given the sequence converges, **(b)(i)** find $k$, giving a reason; **(ii)** find $S_\\infty$.",
      steps: [
        { h: "(a) Equal ratios ⇒ (middle)$^2$ = (outer)(outer)", m: "$(12 - 3k)^2 = (3k + 4)(k + 16) \\Rightarrow 144 - 72k + 9k^2 = 3k^2 + 52k + 64 \\Rightarrow 6k^2 - 124k + 80 = 0 \\Rightarrow 3k^2 - 62k + 40 = 0$", mk: "M1 A1*" },
        { h: "(b)(i)", m: "$(3k - 2)(k - 20) = 0$. $k = 20$: terms $64, -48, 36$, $r = -\\dfrac34$, $|r| < 1$ ✓. $k = \\dfrac23$: terms $6, 10, \\dfrac{50}{3}$, $r = \\dfrac53 > 1$ ✗. So $k = 20$.", mk: "M1 A1 A1", n: "Test the ratio for **both** roots and say which converges — that is the \"reason\"." },
        { h: "(ii)", m: "$S_\\infty = \\dfrac{64}{1 + \\frac34} = \\dfrac{256}{7}$", mk: "M1 A1" }
      ], result: "$k = 20$; $S_\\infty = \\frac{256}{7}$" } },
    { worked: { tag: "exam", title: "Geometric series with trig terms", src: "A-level June 2022 · P2 Q15 · 10 marks",
      q: "The first three terms of a geometric series are $12\\cos\\theta$, $5 + 2\\sin\\theta$ and $6\\tan\\theta$. **(a)** Show that $4\\sin^2\\theta - 52\\sin\\theta + 25 = 0$. **(b)** Given $\\theta$ is obtuse (radians), solve to find the exact value of $\\theta$. **(c)** Show that the sum to infinity can be written as $k(1 - \\sqrt3)$, with $k$ to be found.",
      steps: [
        { h: "(a)", m: "$(5 + 2\\sin\\theta)^2 = 12\\cos\\theta \\cdot 6\\tan\\theta = 72\\sin\\theta$\n$25 + 20\\sin\\theta + 4\\sin^2\\theta = 72\\sin\\theta \\Rightarrow 4\\sin^2\\theta - 52\\sin\\theta + 25 = 0$", mk: "M1 M1 A1*", n: "$\\cos\\theta\\tan\\theta = \\sin\\theta$ is the identity that makes it work." },
        { h: "(b)", m: "$(2\\sin\\theta - 1)(2\\sin\\theta - 25) = 0 \\Rightarrow \\sin\\theta = \\dfrac12$ (the other is impossible); obtuse: $\\theta = \\dfrac{5\\pi}{6}$", mk: "M1 A1" },
        { h: "(c) First term and ratio at $\\theta = \\frac{5\\pi}{6}$", m: "$a = 12\\cos\\dfrac{5\\pi}{6} = -6\\sqrt3; \\quad r = \\dfrac{5 + 1}{-6\\sqrt3} = -\\dfrac{1}{\\sqrt3}$, and $|r| < 1$", mk: "M1 A1" },
        { m: "$S_\\infty = \\dfrac{-6\\sqrt3}{1 + \\frac{1}{\\sqrt3}} = \\dfrac{-6\\sqrt3 \\cdot \\sqrt3}{\\sqrt3 + 1} = \\dfrac{-18}{\\sqrt3 + 1} = \\dfrac{-18(\\sqrt3 - 1)}{2} = 9(1 - \\sqrt3)$: $k = 9$", mk: "M1 A1 A1", n: "Rationalise the denominator (2.2) to reach the printed form." }
      ], result: "(b) $\\theta = \\frac{5\\pi}{6}$ (c) $k = 9$" } },

    { page: "Percentage models" },
    { callout: { t: "memorise", h: "Growth of $p\\%$ a year is geometric with $r = 1 + \\frac{p}{100}$", body: [
      "Year 1 amount $a$; year $n$ amount $ar^{n-1}$; total over $N$ years $S_N = \\frac{a(r^N - 1)}{r - 1}$ (the same formula with numerator and denominator negated — nicer when $r > 1$).",
      "\"First year in which the amount exceeds $T$\": solve $ar^{n-1} > T$ with **logs**: $n - 1 > \\frac{\\ln(T/a)}{\\ln r}$, then round **up** to the next integer.",
      "Watch the count: 2017 to 2030 *inclusive* is 14 years."
    ] } },
    { worked: { tag: "exam", title: "Profit growing 8% a year", src: "A-level Oct 2021 · P1 Q5 · 6 marks",
      q: "A company made £20 000 profit in Year 1 and profit is modelled to increase by 8% each year. **(a)** Show that the profit in Year 3 is £23 328. **(b)** Find the first year in which the profit exceeds £65 000. **(c)** Find the total profit for the first 20 years, to the nearest £1000.",
      steps: [
        { h: "(a)", m: "$20\\,000 \\times 1.08^2 = 23\\,328$", mk: "B1*", n: "Year 3 is two growths after Year 1." },
        { h: "(b) Solve $20\\,000 \\times 1.08^{n-1} > 65\\,000$", m: "$1.08^{n-1} > 3.25 \\Rightarrow (n - 1)\\ln1.08 > \\ln3.25 \\Rightarrow n - 1 > 15.31\\ldots \\Rightarrow n - 1 = 16$\n**Year 17**", mk: "M1 M1 A1", n: "Show the log step — \"solutions relying on calculator technology are not acceptable\". Check: Year 16 gives $20\\,000 \\times 1.08^{15} = 63\\,443 < 65\\,000$; Year 17 gives $68\\,519$." },
        { h: "(c)", m: "$S_{20} = \\dfrac{20\\,000(1.08^{20} - 1)}{0.08} = 915\\,239 \\to$ **£915 000**", mk: "M1 A1" }
      ], result: "(a) shown (b) Year 17 (c) £915 000" } },
    { worked: { tag: "exam", title: "Wheat harvest growing 1.2% a year — total mass and total cost", src: "A-level Specimen · P1 Q8 · 5 marks",
      q: "2100 tonnes were harvested in 2017; each subsequent year's mass is 1.2% more. **(a)** Find the total mass expected from 2017 to 2030 inclusive, to 3 s.f. Each year the first 2000 tonnes cost £5.15 per tonne to harvest and any excess costs £6.45 per tonne. **(b)** Find the expected total cost of harvesting from 2017 to 2030, to the nearest £1000.",
      steps: [
        { h: "(a) 14 terms, $r = 1.012$", m: "$S_{14} = \\dfrac{2100(1.012^{14} - 1)}{0.012} = 31\\,807 \\to$ **31 800 tonnes**", mk: "M1 A1" },
        { h: "(b) Every year exceeds 2000 tonnes, so each year costs $2000 \\times 5.15$ plus $6.45$ per excess tonne", m: "Total $= 14 \\times 10\\,300 + 6.45 \\times (31\\,807 - 14 \\times 2000) = 144\\,200 + 6.45 \\times 3807 = 168\\,755 \\to$ **£169 000**", mk: "M1 M1 A1", n: "Use the unrounded total from (a). The excess over all 14 years is the total minus $14 \\times 2000$." }
      ], result: "(a) 31 800 t (b) £169 000" } },
    { worked: { tag: "exam", title: "A runner slowing by 5% per kilometre", src: "A-level June 2019 · P1 Q11 · 7 marks",
      q: "A competitor runs a 20 km race. The first 4 km take 6 minutes each; after that, each kilometre takes 5% longer than the previous one. **(a)** Show that her estimated time for the first 6 km is 36 minutes 55 seconds. **(b)** Show that the time for the $r$th kilometre, $5 \\le r \\le 20$, is $6 \\times 1.05^{r-4}$ minutes. **(c)** Estimate her total time, in minutes and seconds.",
      steps: [
        { h: "(a)", m: "$4 \\times 6 + 6(1.05) + 6(1.05)^2 = 24 + 6.3 + 6.615 = 36.915$ min $= 36$ min $54.9$ s ≈ 36 min 55 s", mk: "M1 A1*" },
        { h: "(b)", m: "The 5th km is $6 \\times 1.05^1$, the 6th $6 \\times 1.05^2$, …, so the $r$th is $6 \\times 1.05^{r-4}$.", mk: "B1*" },
        { h: "(c) 16 geometric terms from $r = 5$ to $20$, $a = 6(1.05)$", m: "$T = 24 + \\dfrac{6.3(1.05^{16} - 1)}{0.05} = 24 + 141.94 = 165.94$ min $=$ **165 min 57 s** (2 h 45 min 57 s)", mk: "M1 M1 A1 A1", n: "$0.94$ min is $57$ s, not $94$ s — convert the decimal part of a minute." }
      ], result: "165 min 57 s" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Prove that $S_n = \\frac{a(1-r^n)}{1-r}$**", "$S_n$, $rS_n$, subtraction with cancellation shown, factorising"],
      ["**Show that** (a quadratic in $k$)", "$u_2^2 = u_1 u_3$ (or equal ratios), multiplied out to the printed form"],
      ["**Given the sequence converges, find $k$ giving a reason**", "both candidates tested against $|r| < 1$"],
      ["**Find the first year in which … exceeds …**", "the inequality, logs, rounding up, the year stated"],
      ["**Find the total … to the nearest £1000**", "$S_N$ with the correct $N$ (inclusive counting), rounded as asked"],
      ["**Find the exact value of $r$**", "surd or root form, e.g. $3^{1/5}$"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**$|r| < 1$ written as $r < 1$** — a ratio of $-3$ satisfies $r < 1$ and diverges.",
      "**Off-by-one in the exponent**: year $n$ is $ar^{n-1}$; 2017–2030 inclusive is 14 terms.",
      "**Rounding $r$** before using it (gears: keep $(115/28)^{1/5}$ in the calculator).",
      "**Logs skipped** in \"first year exceeds\" when the paper forbids calculator-only solutions.",
      "**Minutes and seconds**: $0.94$ min $= 56.6$ s.",
      "**Cancelling $(1 - r^5)$ without noting $r \\neq 1$.**"
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Sum check", "$\\sum_{x=1}^{20} 20000 \\times 1.08^{x-1}$ with the $\\Sigma$ template."],
      ["First exceed", "Table app with $f(x) = 20000 \\times 1.08^{x-1}$, step 1: scroll to the first row above 65 000. Confirms the log answer."],
      ["Log step", "$\\ln 3.25 \\div \\ln 1.08 = 15.31$; write it down as the working."]
    ] },
    { callout: { t: "mnemonic", h: "\"Multiply by $r$, subtract, the middle melts\"", body: "The proof of $S_n$ in one line: shifting the series by one term and subtracting leaves only the ends." } }
  ],
  flashcards: [
    ["$n$th term, $S_n$ and $S_\\infty$ of a geometric series?", "$ar^{n-1}$; $\\frac{a(1 - r^n)}{1 - r}$; $\\frac{a}{1 - r}$ for $|r| < 1$."],
    ["Prove $S_n = \\frac{a(1-r^n)}{1-r}$.", "$S_n - rS_n = a - ar^n$ (middle terms cancel), then divide by $1 - r$."],
    ["Why does $S_\\infty$ need $|r| < 1$?", "Only then does $r^n \\to 0$, so $S_n \\to \\frac{a}{1-r}$."],
    ["Three terms geometric ⇒ which equation?", "$u_2^2 = u_1 u_3$."],
    ["$3k + 4$, $12 - 3k$, $k + 16$ geometric and convergent: $k$ and $S_\\infty$?", "$k = 20$ ($r = -\\frac34$); $S_\\infty = \\frac{256}{7}$."],
    ["Profit £20 000 growing 8%: first year over £65 000?", "$1.08^{n-1} > 3.25 \\Rightarrow n - 1 > 15.3 \\Rightarrow$ Year 17."],
    ["$S_{10} = 4S_5$: $r$?", "$1 + r^5 = 4 \\Rightarrow r = 3^{1/5}$."],
    ["2017 to 2030 inclusive is how many terms?", "14."],
    ["$S_\\infty$ of $-6\\sqrt3, 6, \\ldots$ ($r = -\\frac{1}{\\sqrt3}$)?", "$\\frac{-6\\sqrt3}{1 + 1/\\sqrt3} = 9(1 - \\sqrt3)$."],
    ["Growth of $p\\%$ per year: $r = $?", "$1 + \\frac{p}{100}$."]
  ],
  quiz: [
    { q: "$a = 3$, $r = 2$: $u_6 =$", opts: ["96", "192", "48", "64"], ans: 0, why: "$3 \\times 2^5$." },
    { q: "$S_\\infty$ of $8 + 4 + 2 + \\cdots$:", opts: ["16", "14", "15", "$\\infty$"], ans: 0, why: "$\\frac{8}{1 - 1/2}$." },
    { q: "Which ratio gives a convergent series?", opts: ["$r = 1.01$", "$r = -0.9$", "$r = -1$", "$r = 2$"], ans: 1, why: "$|r| < 1$." },
    { q: "8% growth per year for 5 years multiplies by", opts: ["$1.4$", "$1.08^5$", "$1.08 \\times 5$", "$5^{1.08}$"], ans: 1, why: "Repeated multiplication." },
    { q: "In the proof of $S_n$, subtracting $rS_n$ from $S_n$ leaves", opts: ["$a - ar^n$", "$a + ar^n$", "$ar^n$", "$a$"], ans: 0, why: "First term of one, last of the other." },
    { q: "$2 \\times 1.05^{n-1} > 10$ first holds for $n =$", opts: ["33", "34", "35", "32"], ans: 2, why: "$n - 1 > \\frac{\\ln5}{\\ln1.05} = 32.99$, so $n - 1 = 33$." }
  ]
};

/* =====================================================================
   4.6  Series in modelling
   ===================================================================== */
C["maths:4.6"] = {
  notes: [
    { h: "Series in modelling — the whole topic on one page" },
    "Spec 4.6 is where 4.4 and 4.5 meet real situations. The single decision is: **is the change the same amount (arithmetic) or the same proportion (geometric)?** After that it is the formulae, a careful count of terms, and a sentence of interpretation.",
    { table: { head: ["Story", "Model", "Reason"], rows: [
      ["saves £10, then £9.20, then £8.40…", "arithmetic, $d = -0.80$", "same amount less each week"],
      ["repays £400, £390, £380…", "arithmetic, $d = -10$", "same amount less each month"],
      ["profit rises 8% a year", "geometric, $r = 1.08$", "same proportion more each year"],
      ["harvest rises 1.2% a year", "geometric, $r = 1.012$", "proportion"],
      ["each km takes 5% longer", "geometric, $r = 1.05$", "proportion"],
      ["gear speeds 28 … 115 km/h", "either — the question tells you which to use", "compare the two models"],
      ["a ball bounces to 60% of its height", "geometric, $r = 0.6$; total distance uses $S_\\infty$ twice", "proportion"]
    ] } },

    { page: "Translating the story" },
    { callout: { t: "memorise", h: "Checklist for a series model", body: [
      "1. **Which term is which?** Week 1 / Year 1 / month 1 is $u_1$; \"after $n$ years\" may mean $u_{n+1}$. Write the first three terms out.",
      "2. **How many terms?** Inclusive counting: 2017–2030 is 14. \"First 20 years\" is 20.",
      "3. **Which quantity?** An amount in one period is a **term** ($u_n$); an accumulated total is a **sum** ($S_n$).",
      "4. **Which formula?** $u_n$, $S_n$, or $S_\\infty$ (only if $|r| < 1$ and the story really goes on for ever).",
      "5. **Interpret** the answer: reject roots that make terms negative; round \"first year\" up; give money to the pence or as asked."
    ] } },
    { worked: { tag: "example", title: "A bouncing ball — total distance with $S_\\infty$", src: "standard model",
      q: "A ball is dropped from 5 m and each bounce reaches 60% of the previous height. Find the total distance travelled before it comes to rest.",
      steps: [
        { h: "Downward distances", m: "$5 + 3 + 1.8 + \\cdots$: geometric, $a = 5$, $r = 0.6$: $S_\\infty = \\dfrac{5}{0.4} = 12.5$ m", mk: "M1 A1" },
        { h: "Upward distances (no initial drop)", m: "$3 + 1.8 + \\cdots = \\dfrac{3}{0.4} = 7.5$ m", mk: "M1" },
        { m: "Total $= 12.5 + 7.5 = 20$ m", mk: "A1", n: "The commonest error is doubling the downward sum (counting an upward 5 m that never happened)." }
      ], result: "20 m" } },
    { worked: { tag: "example", title: "A savings scheme with the same percentage increase — total paid in", src: "spec example",
      q: "Someone pays £1200 into a savings scheme in year 1, and increases the payment by 3% each year. Find (a) the payment in year 10; (b) the total paid in over the first 10 years; (c) the first year in which the payment exceeds £2000.",
      steps: [
        { h: "(a)", m: "$u_{10} = 1200 \\times 1.03^9 = £1565.72$", mk: "M1 A1" },
        { h: "(b)", m: "$S_{10} = \\dfrac{1200(1.03^{10} - 1)}{0.03} = £13\\,756.66$", mk: "M1 A1" },
        { h: "(c)", m: "$1.03^{n-1} > \\dfrac{2000}{1200} \\Rightarrow n - 1 > \\dfrac{\\ln(5/3)}{\\ln1.03} = 17.28 \\Rightarrow n = 19$: **year 19**", mk: "M1 A1" }
      ], result: "(a) £1565.72 (b) £13 756.66 (c) year 19" } },
    { worked: { tag: "example", title: "The same scheme with a fixed increase — compare", src: "spec example",
      q: "Instead the payment increases by £40 each year from £1200. Find the total over 10 years and the year the payment first exceeds £2000.",
      steps: [
        { m: "$S_{10} = \\dfrac{10}{2}\\left[2400 + 9 \\times 40\\right] = £13\\,800$", mk: "M1 A1" },
        { m: "$1200 + 40(n - 1) > 2000 \\Rightarrow n - 1 > 20 \\Rightarrow n = 22$: year 22", mk: "M1 A1", n: "Arithmetic: a linear inequality, no logs. Compare: the 3% scheme overtakes £2000 sooner (year 19) despite paying in slightly less over the first decade." }
      ], result: "£13 800; year 22" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Same amount → arithmetic; same percentage → geometric.** Decide this before touching a formula.",
      "**Term vs sum**: \"in year 10\" is $u_{10}$; \"over 10 years\" is $S_{10}$.",
      "**Count inclusively** and check year 1 = $u_1$.",
      "**Interpret roots**: a quadratic in $n$ from $S_n$ has a spurious larger root.",
      "**Logs for \"first exceeds\"** in a geometric model; round up.",
      "**$S_\\infty$ only if $|r| < 1$**, and say so."
    ] },
    { callout: { t: "mnemonic", h: "\"Add → arithmetic, times → geometric; one period → term, all periods → sum\"", body: "Two decisions and the whole model is set up." } }
  ],
  flashcards: [
    ["Same amount each period vs same percentage — which model?", "Arithmetic vs geometric."],
    ["\"Amount in year 10\" vs \"total over 10 years\"?", "$u_{10}$ vs $S_{10}$."],
    ["Bouncing ball from 5 m, 60% rebound: total distance?", "$\\frac{5}{0.4} + \\frac{3}{0.4} = 20$ m."],
    ["First year a 3%-growing payment from £1200 exceeds £2000?", "$n - 1 > \\frac{\\ln(5/3)}{\\ln 1.03} = 17.3 \\Rightarrow$ year 19."],
    ["Why can a sum-to-infinity model be unrealistic?", "It assumes the process continues for ever with the same ratio (a bounce never stops, growth never slows)."],
    ["2017 to 2030 inclusive: how many terms?", "14."]
  ],
  quiz: [
    { q: "Payments £500, £550, £600, …: model?", opts: ["arithmetic $d = 50$", "geometric $r = 1.1$", "geometric $r = 50$", "neither"], ans: 0, why: "Same amount added." },
    { q: "A population growing 4% a year from 2000: after 6 years", opts: ["$2000 \\times 1.04^6$", "$2000 \\times 1.04^5$", "$2000 + 6 \\times 80$", "$2000 \\times 1.24$"], ans: 0, why: "Six growths." },
    { q: "Total over 12 months of an arithmetic payment scheme uses", opts: ["$u_{12}$", "$S_{12}$", "$S_\\infty$", "$u_{13}$"], ans: 1, why: "A total is a sum." },
    { q: "A ball rebounding to 70% of its height, dropped from 10 m, travels in total", opts: ["$\\tfrac{10}{0.3}$", "$\\tfrac{10}{0.3} + \\tfrac{7}{0.3}$", "$2 \\times \\tfrac{10}{0.3}$", "$10 \\times 0.7$"], ans: 1, why: "Down from 10, up and down from 7 onwards." }
  ]
};


/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
