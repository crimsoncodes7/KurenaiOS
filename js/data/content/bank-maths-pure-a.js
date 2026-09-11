/* Kurenai OS — past-paper bank: Edexcel 9MA0/8MA0 Pure, topics 1–3 (proof,
   algebra and functions, coordinate geometry). Modelled on Pure Papers 1 & 2
   and AS Paper 1, June 2018–2025 plus the Specimen. Mark schemes use the
   Edexcel M1 (method) / A1 (accuracy) / B1 (independent) / dM1 (dependent)
   convention; "awrt" = answers which round to; "cso" = correct solution only. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (X) {

X("maths:1.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Proof — 4 to 6 marks on every paper" },
    { table: { head: ["Type", "What the examiner marks", "Where it appeared"], rows: [
      ["Disproof by counter-example", "One specific counter-example **and** the evaluation showing the statement fails — e.g. \"$x = -4$: $x^2 = 16 > 9$ but $x < 3$\"", "AS 2022, 2023, 2025; A-level 2018, 2019"],
      ["Proof by deduction (algebraic)", "Set up generally ($n$ odd $\\Rightarrow n = 2k+1$), expand, **factorise to show the required multiple**, then a concluding sentence", "AS 2019, 2022, 2024; A-level 2022, 2023"],
      ["Proof by exhaustion", "Cover **every** case explicitly (e.g. $n = 3m, 3m+1, 3m+2$), each worked, then conclude", "A-level Oct 2020, Oct 2021, June 2025"],
      ["Proof by contradiction", "**Assume the negation** in words, derive the contradiction, **state** that the assumption is false so the statement is true", "A-level Oct 2020, 2022, 2023, 2024; Specimen ($\\sqrt 3$ irrational)"],
      ["Complete / correct a given proof", "Identify the missing case or the invalid step (e.g. \"$m^2$ even $\\Rightarrow m$ even\" needs justification)", "June 2025 (squares mod 5), Oct 2021"]
    ]}},
    { callout: { t: "warn", body: "A proof that is *all algebra and no words* loses the final A1. Every proof ends with a sentence: \"…which is a multiple of 4, so the statement is true for all odd $n$.\" A contradiction proof must begin \"Assume, for contradiction, that…\"." }},
    { callout: { t: "tip", h: "Standard set-ups", body: "Odd: $2k+1$ · consecutive integers: $n, n+1$ · consecutive even: $2k, 2k+2$ · any integer is one of $3m, 3m+1, 3m+2$ · rational: $\\frac{p}{q}$ in lowest terms · the product of two consecutive integers is even." }}
  ],
  flashcards: [
    ["Disprove: 'if $x^2 > 9$ then $x > 3$'.", "Counter-example $x = -4$: $x^2 = 16 > 9$ but $-4 < 3$, so the statement is false."],
    ["Prove $n^2 + 5n$ is even for every natural number $n$.", "$n^2 + 5n = n(n+5)$. If $n$ is even the product is even; if $n$ is odd then $n + 5$ is even, so the product is even. Hence even for all $n$."],
    ["Prove $(n+1)^3 - n^3$ is odd for all natural $n$.", "$(n+1)^3 - n^3 = 3n^2 + 3n + 1 = 3n(n+1) + 1$; $n(n+1)$ is even so $3n(n+1)$ is even, and adding 1 gives an odd number."],
    ["Outline the proof by contradiction that $\\sqrt 2$ is irrational.", "Assume $\\sqrt 2 = p/q$ in lowest terms. Then $p^2 = 2q^2$ so $p$ is even, $p = 2m$; then $q^2 = 2m^2$ so $q$ is even — contradicting lowest terms. Hence $\\sqrt 2$ is irrational."],
    ["Prove by exhaustion that the square of any integer is of the form $3k$ or $3k+1$.", "Every integer is $3m$, $3m+1$ or $3m+2$: squares are $9m^2 = 3(3m^2)$, $9m^2+6m+1 = 3(3m^2+2m)+1$, $9m^2+12m+4 = 3(3m^2+4m+1)+1$. All cases give $3k$ or $3k+1$."],
    ["Prove: if $pq$ is even then at least one of $p$, $q$ is even.", "Assume both odd: $p = 2a+1$, $q = 2b+1$, so $pq = 4ab + 2a + 2b + 1$ which is odd — contradiction. So at least one is even."],
    ["Prove $n^3 - n$ is a multiple of 4 for odd $n$.", "$n = 2k+1$: $n^3 - n = n(n-1)(n+1) = (2k+1)(2k)(2k+2) = 4k(k+1)(2k+1)$, a multiple of 4."],
    ["Why does 'try $n = 1, 2, 3$ and it works' not prove a statement for all $n$?", "Checking cases proves only those cases; a general proof needs a general argument valid for every $n$."],
    ["Prove there are no positive integers $p, q$ with $4p^2 - q^2 = 25$.", "$(2p - q)(2p + q) = 25$ with $2p + q > 2p - q > 0$ forces $2p+q = 25, 2p - q = 1$ giving $p = 6.5$ — not an integer. Contradiction."],
    ["Prove that for positive $a, b$: $a + b \\ge 2\\sqrt{ab}$.", "$(\\sqrt a - \\sqrt b)^2 \\ge 0 \\Rightarrow a - 2\\sqrt{ab} + b \\ge 0 \\Rightarrow a + b \\ge 2\\sqrt{ab}$."]
  ],
  quiz: [
    { q: "Which is a valid counter-example to 'all primes are odd'?", opts: ["9", "2", "1", "15"], ans: 1, why: "2 is prime and even." },
    { q: "To prove a statement about every odd integer, start with:", opts: ["$n = 2k$", "$n = 2k + 1$", "$n = k^2$", "$n = 3$"], ans: 1, why: "General odd form." },
    { q: "A proof by contradiction of 'P' begins by assuming:", opts: ["P", "not P", "P is sometimes true", "nothing"], ans: 1, why: "Derive a contradiction from ¬P." },
    { q: "$n(n+1)$ is always:", opts: ["odd", "even", "a multiple of 4", "prime"], ans: 1, why: "One of two consecutive integers is even." },
    { q: "Proof by exhaustion for 'squares are $3k$ or $3k+1$' needs how many cases?", opts: ["1", "2", "3", "infinitely many"], ans: 2, why: "$3m$, $3m+1$, $3m+2$." },
    { q: "'$x^2 = 4 \\Rightarrow x = 2$' is false because:", opts: ["$x$ could be $-2$", "$x^2$ is always positive", "4 is even", "it is true"], ans: 0, why: "Counter-example $x = -2$." },
    { q: "Which statement is true for all natural $n$?", opts: ["$n^2 + n + 41$ is prime", "$n^3 + 5n$ is even", "$n^2 + 2$ is divisible by 4", "$2^n + 1$ is prime"], ans: 1, why: "$n^3 + 5n = n(n^2+5)$: if $n$ even, even; if $n$ odd, $n^2 + 5$ even." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2022 P1 Q14", parts: [
      { q: "Show, by means of a counter-example, that the statement \"if $x^2 > 9$ then $x > 3$\" is false.", marks: 1, ms: ["B1: a valid counter-example with the check, e.g. $x = -4$: $16 > 9$ but $-4 < 3$"] },
      { q: "Prove that for all natural numbers $n$, $n^3 + 3n^2 + 2n$ is divisible by 6.", marks: 3, ms: ["M1: factorises $n(n+1)(n+2)$", "A1: states these are three consecutive integers so one is a multiple of 2 and one is a multiple of 3", "A1: concludes the product is divisible by $2 \\times 3 = 6$ for all natural $n$ (full reasoning)"] }
    ] },
    { src: "Edexcel 2024 P1 Q15", parts: [
      { q: "Show that $k^2 - 4k + 5$ is positive for all real values of $k$.", marks: 2, ms: ["M1: completes the square $(k-2)^2 + 1$", "A1: $(k-2)^2 \\ge 0$ so $(k-2)^2 + 1 \\ge 1 > 0$"] },
      { q: "Prove by contradiction that there are no positive integers $p$ and $q$ such that $p^2 - q^2 = 1$.", marks: 4, ms: ["B1: assumes there exist positive integers $p, q$ with $p^2 - q^2 = 1$", "M1: factorises $(p-q)(p+q) = 1$", "A1: since $p, q$ positive integers, $p + q \\ge 2$, so $(p-q)(p+q) = 1$ is impossible with integer factors (or $p - q = p + q = 1 \\Rightarrow q = 0$)", "A1: states this contradicts the assumption, so no such $p, q$ exist"] }
    ] },
    { src: "Edexcel 2025 P2 Q8", ctx: "A student attempts to prove that the square of any integer is of the form $5n$, $5n+1$ or $5n-1$, writing: \"Any integer is $5m$, $5m+1$ or $5m+2$. $(5m)^2 = 5(5m^2)$, $(5m+1)^2 = 5(5m^2+2m)+1$, $(5m+2)^2 = 5(5m^2+4m)+4 = 5(5m^2+4m+1)-1$. Hence the result.\"",
      parts: [
        { q: "Identify the error in the student's proof.", marks: 1, ms: ["B1: the cases are incomplete — integers of the form $5m+3$ and $5m+4$ (or $5m-1$, $5m-2$) have not been considered"] },
        { q: "Complete the proof.", marks: 3, ms: ["M1: $(5m+3)^2 = 25m^2 + 30m + 9 = 5(5m^2+6m+1)+4 = 5(5m^2+6m+2)-1$", "M1: $(5m+4)^2 = 25m^2 + 40m + 16 = 5(5m^2+8m+3)+1$", "A1: all five cases covered with a concluding statement that every square is $5n$, $5n+1$ or $5n-1$"] }
      ] },
    { src: "Edexcel Specimen P2 Q14", parts: [
      { q: "Prove by contradiction that $\\sqrt 3$ is irrational.", marks: 4, ms: ["B1: assumes $\\sqrt 3 = \\frac{p}{q}$ with $p, q$ integers with no common factor", "M1: $p^2 = 3q^2$ so $p^2$ is a multiple of 3, hence $p$ is a multiple of 3, $p = 3m$", "M1: $9m^2 = 3q^2 \\Rightarrow q^2 = 3m^2$, so $q$ is also a multiple of 3", "A1: $p$ and $q$ share the factor 3, contradicting the assumption; hence $\\sqrt 3$ is irrational"] },
      { q: "Determine whether the statement \"for all real $x$, $x^2 + 4 \\ge 4x$\" is true or false, justifying your answer.", marks: 2, ms: ["M1: $x^2 - 4x + 4 = (x-2)^2$", "A1: $(x-2)^2 \\ge 0$ for all real $x$, so the statement is true"] }
    ] },
    { level: "AS", src: "Edexcel AS 2023 P1 Q17", ctx: "Statement 1: for all real $x$, $x^3 > x^2$. Statement 2: the sum of the squares of any two consecutive even integers is a multiple of 4.",
      parts: [
        { q: "Show that Statement 1 is false.", marks: 1, ms: ["B1: counter-example with check, e.g. $x = \\tfrac12$: $x^3 = \\tfrac18 < \\tfrac14 = x^2$ (or $x = 0$, $x = -1$)"] },
        { q: "Prove that Statement 2 is true.", marks: 3, ms: ["M1: lets the integers be $2k$ and $2k+2$", "M1: $(2k)^2 + (2k+2)^2 = 8k^2 + 8k + 4$", "A1: $= 4(2k^2 + 2k + 1)$, a multiple of 4 for all integers $k$, with conclusion"] }
      ] }
  ]
});

X("maths:2.1", {
  flashcards: [
    ["Simplify $\\dfrac{(2x^3)^2 \\times 4x^{-1}}{8x^2}$.", "$\\dfrac{4x^6 \\cdot 4x^{-1}}{8x^2} = \\dfrac{16x^5}{8x^2} = 2x^3$."],
    ["Given $2^x \\times 4^y = 2\\sqrt 2$, express $y$ in terms of $x$.", "$2^{x + 2y} = 2^{3/2}$ so $x + 2y = \\tfrac32$, $y = \\tfrac34 - \\tfrac{x}{2}$."],
    ["Solve $9^{x-1} = 3^{y+2}$ for $y$ in terms of $x$.", "$3^{2x-2} = 3^{y+2} \\Rightarrow y = 2x - 4$."],
    ["Write $\\dfrac{3x^2 - 5}{\\sqrt x}$ as a sum of powers of $x$.", "$3x^{3/2} - 5x^{-1/2}$."],
    ["Evaluate $16^{-3/4}$.", "$(16^{1/4})^{-3} = 2^{-3} = \\tfrac18$."],
    ["Solve $3^{x-2} \\times 4 = 2\\sqrt 2$… what first step?", "Write $2\\sqrt2 = 2^{3/2}$ and $4 = 2^2$: $3^{x-2} = 2^{-1/2}$, then take logs: $x = 2 - \\dfrac{\\ln 2}{2\\ln 3}$."],
    ["Solve $16a^2 = 2\\sqrt a$.", "$a^{3/2} = \\tfrac18 \\Rightarrow a = (\\tfrac18)^{2/3} = \\tfrac14$ (and $a = 0$)."],
    ["If $3^x = 7^y$, find $\\dfrac{x}{y}$ exactly.", "$x\\ln 3 = y \\ln 7 \\Rightarrow \\dfrac{x}{y} = \\dfrac{\\ln 7}{\\ln 3} = \\log_3 7$."]
  ],
  quiz: [
    { q: "$8^{2/3} =$", opts: ["4", "16/3", "2", "64"], ans: 0, why: "$(8^{1/3})^2 = 2^2$." },
    { q: "$x^{-1/2}$ equals:", opts: ["$-\\sqrt x$", "$\\dfrac{1}{\\sqrt x}$", "$\\dfrac{1}{x^2}$", "$-\\dfrac{x}{2}$"], ans: 1, why: "Negative index = reciprocal; half = root." },
    { q: "$\\dfrac{x^5 \\cdot x^{-2}}{x^{-1}} =$", opts: ["$x^2$", "$x^4$", "$x^{-2}$", "$x^8$"], ans: 1, why: "$5 - 2 + 1 = 4$." },
    { q: "If $4^x = 8$, then $x =$", opts: ["2", "3/2", "1/2", "3"], ans: 1, why: "$2^{2x} = 2^3$." },
    { q: "$(27x^6)^{1/3} =$", opts: ["$9x^2$", "$3x^2$", "$3x^3$", "$27x^2$"], ans: 1, why: "Cube root of each factor." },
    { q: "$\\dfrac{x + 2}{\\sqrt x}$ written in index form is:", opts: ["$x^{1/2} + 2x^{-1/2}$", "$x^{-1/2} + 2$", "$x^{3/2} + 2$", "$x^{1/2} + 2x^{1/2}$"], ans: 0, why: "Divide each term by $x^{1/2}$." }
  ],
  exam: [
    { src: "Edexcel 2019 P1 Q1", q: "Given that $2^x \\times 4^y = 2\\sqrt 2$, express $y$ as a function of $x$, giving your answer in the form $y = ax + b$.", marks: 3,
      ms: ["M1: writes $4^y = 2^{2y}$ and $2\\sqrt2 = 2^{3/2}$", "M1: equates indices $x + 2y = \\tfrac32$", "A1: $y = -\\tfrac12 x + \\tfrac34$"] },
    { level: "AS", src: "Edexcel AS 2019 P1 Q2", parts: [
      { q: "Solve $16a^2 = 2\\sqrt a$, giving the non-zero solution exactly.", marks: 3, ms: ["M1: writes as $a^{3/2} = \\tfrac{1}{8}$ (or $256a^4 = 4a$)", "M1: $a = (\\tfrac18)^{2/3}$", "A1: $a = \\tfrac14$"] },
      { q: "Solve $x^4 - 5x^2 + 4 = 0$.", marks: 3, ms: ["M1: substitutes $u = x^2$: $u^2 - 5u + 4 = 0$", "A1: $u = 1$ or $u = 4$", "A1: $x = \\pm 1, \\pm 2$"] }
    ] },
    { level: "AS", src: "Edexcel AS 2025 P1 Q5", parts: [
      { q: "Write $f(x) = \\dfrac{(2x - 3)^2}{\\sqrt x}$ in the form $ax^{3/2} + bx^{1/2} + cx^{-1/2}$.", marks: 3, ms: ["M1: expands $(2x-3)^2 = 4x^2 - 12x + 9$", "M1: divides each term by $x^{1/2}$", "A1: $4x^{3/2} - 12x^{1/2} + 9x^{-1/2}$"] },
      { q: "Hence find $\\int f(x)\\,dx$.", marks: 3, ms: ["M1: raises each power by one and divides", "A1: two terms correct, e.g. $\\tfrac85 x^{5/2} - 8x^{3/2}$", "A1: $\\tfrac85 x^{5/2} - 8x^{3/2} + 18x^{1/2} + c$"] }
    ] }
  ]
});

X("maths:2.2", {
  flashcards: [
    ["Simplify $\\sqrt{75} - \\sqrt{12}$.", "$5\\sqrt3 - 2\\sqrt3 = 3\\sqrt3$."],
    ["Rationalise $\\dfrac{6}{\\sqrt 3}$.", "$\\dfrac{6\\sqrt3}{3} = 2\\sqrt 3$."],
    ["Rationalise $\\dfrac{5}{2 - \\sqrt 3}$.", "Multiply by $\\dfrac{2 + \\sqrt3}{2 + \\sqrt3}$: $\\dfrac{5(2+\\sqrt3)}{4 - 3} = 10 + 5\\sqrt3$."],
    ["Expand $(3 - \\sqrt 2)^2$.", "$9 - 6\\sqrt2 + 2 = 11 - 6\\sqrt 2$."],
    ["Write $\\dfrac{\\sqrt{50} + \\sqrt 8}{\\sqrt 2}$ as an integer.", "$\\dfrac{5\\sqrt2 + 2\\sqrt2}{\\sqrt2} = 7$."],
    ["Solve $x\\sqrt 2 = 4 - x$, giving $x$ in the form $a + b\\sqrt2$.", "$x(\\sqrt2 + 1) = 4 \\Rightarrow x = \\dfrac{4}{\\sqrt2+1} = 4(\\sqrt2 - 1) = -4 + 4\\sqrt 2$."],
    ["Why rationalise a denominator?", "To write the number in the standard exact form $a + b\\sqrt c$ with a rational denominator — required for 'exact' answers."],
    ["Simplify $\\sqrt{18} \\times \\sqrt 8$.", "$\\sqrt{144} = 12$."]
  ],
  quiz: [
    { q: "$\\sqrt{48}$ simplifies to:", opts: ["$4\\sqrt3$", "$2\\sqrt{12}$", "$16\\sqrt3$", "$3\\sqrt4$"], ans: 0, why: "$48 = 16 \\times 3$." },
    { q: "$\\dfrac{4}{\\sqrt 8}$ in simplest form is:", opts: ["$\\sqrt 2$", "$2\\sqrt2$", "$\\dfrac{\\sqrt2}{2}$", "$4\\sqrt2$"], ans: 0, why: "$\\dfrac{4}{2\\sqrt2} = \\dfrac{2}{\\sqrt2} = \\sqrt2$." },
    { q: "$(1 + \\sqrt5)(1 - \\sqrt5) =$", opts: ["$-4$", "$4$", "$1 - 5\\sqrt5$", "$6$"], ans: 0, why: "Difference of two squares: $1 - 5$." },
    { q: "To rationalise $\\dfrac{1}{3 + \\sqrt 7}$ multiply by:", opts: ["$\\dfrac{3 + \\sqrt7}{3+\\sqrt7}$", "$\\dfrac{3 - \\sqrt7}{3-\\sqrt7}$", "$\\sqrt 7$", "$\\dfrac{1}{3}$"], ans: 1, why: "Conjugate." },
    { q: "$\\dfrac{2}{3 - \\sqrt7} =$", opts: ["$3 + \\sqrt7$", "$\\dfrac{3 + \\sqrt7}{2}$", "$6 - 2\\sqrt7$", "$3 - \\sqrt7$"], ans: 0, why: "$\\dfrac{2(3+\\sqrt7)}{9 - 7}$." },
    { q: "$\\sqrt{12} + \\sqrt{27} =$", opts: ["$\\sqrt{39}$", "$5\\sqrt3$", "$6\\sqrt3$", "$3\\sqrt5$"], ans: 1, why: "$2\\sqrt3 + 3\\sqrt3$." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2020 P1 Q3", q: "Solve $\\sqrt{50} - x\\sqrt 2 = 3\\sqrt 8 + \\sqrt 2$, giving your answer as an integer.", marks: 3,
      ms: ["M1: simplifies surds: $5\\sqrt2 - x\\sqrt2 = 6\\sqrt2 + \\sqrt2$", "M1: divides through by $\\sqrt2$: $5 - x = 7$", "A1: $x = -2$"] },
    { level: "AS", src: "Edexcel AS 2018 P1 Q1", q: "Express $\\dfrac{3\\sqrt 5 + 4}{\\sqrt 5 - 2}$ in the form $a + b\\sqrt 5$, where $a$ and $b$ are integers.", marks: 4,
      ms: ["M1: multiplies numerator and denominator by $\\sqrt5 + 2$", "A1: denominator $5 - 4 = 1$", "M1: expands numerator $(3\\sqrt5 + 4)(\\sqrt5 + 2) = 15 + 6\\sqrt5 + 4\\sqrt5 + 8$", "A1: $23 + 10\\sqrt5$"] },
    { src: "Edexcel 2021 P1 Q1", q: "A rectangle has area $12 + 4\\sqrt 3$ cm² and width $2 + \\sqrt 3$ cm. Find the exact length of the rectangle in the form $a + b\\sqrt 3$.", marks: 3,
      ms: ["M1: length $= \\dfrac{12 + 4\\sqrt3}{2 + \\sqrt3}$ multiplied by $\\dfrac{2 - \\sqrt3}{2 - \\sqrt3}$", "M1: numerator $24 - 12\\sqrt3 + 8\\sqrt3 - 12 = 12 - 4\\sqrt3$, denominator $1$", "A1: $12 - 4\\sqrt3$"] }
  ]
});

X("maths:2.3", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Quadratics — modelling and the discriminant" },
    "Edexcel's favourite quadratic questions are **models in completed-square form** — profit $P = 100 - 6.25(x-9)^2$ (AS 2018), tin production $T = 1200 - 3(n-20)^2$ (AS 2019), a roller-coaster $H = a - b(t-20)^2$ (2023), a thrown ball / rugby ball / golf ball trajectory $H = k - c(x - p)^2$ through given points (2018, Oct 2021, 2024). The marks: **read the vertex** from the form, **substitute a known point** to find the remaining constant, **interpret** ($x = 9$ gives the maximum profit £100), and **evaluate limitations** (the model gives negative heights beyond the roots; the ball is not a particle).",
    { callout: { t: "memorise", h: "Discriminant conditions", body: "$b^2 - 4ac > 0$: two distinct real roots · $= 0$: equal roots (a **tangent**) · $< 0$: no real roots. \"Line meets curve at two distinct points\" → substitute, collect, **discriminant $> 0$**, solve the inequality in $k$ (Specimen, AS 2025)." }}
  ],
  flashcards: [
    ["Complete the square: $x^2 - 8x + 17$.", "$(x - 4)^2 + 1$ — minimum value 1 at $x = 4$, so $x^2 - 8x + 17 > 0$ for all $x$."],
    ["Complete the square: $2x^2 + 12x + 5$.", "$2(x+3)^2 - 13$."],
    ["The profit model $P = 100 - 6.25(x - 9)^2$: what price gives maximum profit and what is it?", "$x = 9$ gives the maximum profit $P = 100$."],
    ["Find $k$ if $x^2 + kx + 9 = 0$ has equal roots.", "$k^2 - 36 = 0 \\Rightarrow k = \\pm 6$."],
    ["Line $y = kx - 2$ meets $y = x^2 + 2$ at two distinct points. Find the range of $k$.", "$x^2 - kx + 4 = 0$; $k^2 - 16 > 0 \\Rightarrow k < -4$ or $k > 4$."],
    ["Sketch $y = -2(x-3)^2 + 8$: vertex, direction, intercepts.", "Maximum at $(3, 8)$, opens downward, $y$-intercept $-10$, roots $x = 1, 5$."],
    ["Solve $x - 3\\sqrt x + 2 = 0$.", "Let $u = \\sqrt x$: $u^2 - 3u + 2 = 0 \\Rightarrow u = 1, 2 \\Rightarrow x = 1, 4$."],
    ["A ball's path is $H = 2.5 - 0.1(x - 4)^2$… height of release and maximum?", "At $x = 0$: $H = 2.5 - 1.6 = 0.9$ m; maximum height 2.5 m at $x = 4$."],
    ["Why is $P = 100 - 6.25(x-9)^2$ unrealistic for large $x$?", "It predicts unlimited negative profit; real profit is bounded and the price would be limited by what customers pay."],
    ["Show $x^2 + 4x + 7 > 0$ for all real $x$.", "$(x+2)^2 + 3 \\ge 3 > 0$."]
  ],
  quiz: [
    { q: "$x^2 - 6x + 13$ in completed-square form:", opts: ["$(x-3)^2 + 4$", "$(x-3)^2 - 4$", "$(x+3)^2 + 4$", "$(x-6)^2 + 13$"], ans: 0, why: "$9 + 4 = 13$." },
    { q: "The minimum point of $y = (x-3)^2 + 4$ is:", opts: ["$(3, 4)$", "$(-3, 4)$", "$(3, -4)$", "$(4, 3)$"], ans: 0, why: "Vertex form." },
    { q: "$2x^2 + 3x + 5 = 0$ has:", opts: ["two real roots", "equal roots", "no real roots", "one positive root"], ans: 2, why: "$9 - 40 < 0$." },
    { q: "$y = x^2 + 2x + k$ touches the $x$-axis when $k =$", opts: ["0", "1", "2", "4"], ans: 1, why: "$4 - 4k = 0$." },
    { q: "A model $T = 1200 - 3(n-20)^2$: maximum $T$ is:", opts: ["1200 at $n = 20$", "3 at $n = 20$", "1200 at $n = 0$", "20"], ans: 0, why: "Vertex." },
    { q: "Solve $x^2 - x > 20$:", opts: ["$-4 < x < 5$", "$x < -4$ or $x > 5$", "$x > 5$ only", "$x < -4$ only"], ans: 1, why: "Roots $-4, 5$; positive outside." },
    { q: "Substituting $u = x^2$ into $x^4 - 5x^2 + 4 = 0$ gives roots for $x$:", opts: ["$\\pm1, \\pm2$", "$1, 4$", "$\\pm 4$", "$2$ only"], ans: 0, why: "$u = 1, 4$." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2018 P1 Q6", ctx: "A company sells a product at £$x$ per unit. Its weekly profit, £$P$ hundred, is modelled by $P = 100 - 6.25(x - 9)^2$ for $5 \\le x \\le 13$.",
      parts: [
        { q: "State the price that gives the maximum weekly profit and the value of that profit.", marks: 2, ms: ["B1: $x = 9$ (£9)", "B1: $P = 100$, i.e. £10 000"] },
        { q: "Find the prices at which the weekly profit is £3600.", marks: 3, ms: ["M1: $36 = 100 - 6.25(x-9)^2$", "M1: $(x-9)^2 = 10.24 \\Rightarrow x - 9 = \\pm 3.2$", "A1: $x = 5.80$ and $x = 12.20$"] },
        { q: "Give one reason why the model may not be appropriate for $x > 13$.", marks: 1, ms: ["B1: e.g. profit would become negative / customers would not buy at very high prices so demand is not captured"] }
      ] },
    { src: "Edexcel Specimen P1 Q5", q: "The line $y = 4x + c$ meets the curve $y = x^2 + 2x - 5$ at two distinct points. Find the range of possible values of $c$.", marks: 5,
      ms: ["M1: equates and collects: $x^2 - 2x - 5 - c = 0$", "M1: uses $b^2 - 4ac > 0$: $4 + 4(5 + c) > 0$", "A1: $24 + 4c > 0$", "A1: $c > -6$", "B1: answer given as an inequality / set notation $\\{c : c > -6\\}$"] },
    { src: "Edexcel 2024 P1 Q9", ctx: "A ball is thrown from a point A and lands at a point B on horizontal ground. Its height $H$ m above the ground, $x$ m horizontally from A, is modelled by a quadratic $H = a - b(x - 9)^2$. The ball is released at height 1.8 m and reaches its greatest height of 5.85 m.",
      parts: [
        { q: "Find the complete model.", marks: 3, ms: ["B1: $a = 5.85$", "M1: substitutes $(0, 1.8)$: $1.8 = 5.85 - 81b$", "A1: $b = 0.05$, so $H = 5.85 - 0.05(x-9)^2$"] },
        { q: "Find the horizontal distance from A to B.", marks: 2, ms: ["M1: $0 = 5.85 - 0.05(x-9)^2 \\Rightarrow (x-9)^2 = 117$", "A1: $x = 9 + \\sqrt{117} \\approx 19.8$ m (rejecting the negative root)"] },
        { q: "State one limitation of the model.", marks: 1, ms: ["B1: e.g. the ball is modelled as a particle / air resistance is ignored / the ground is assumed horizontal"] }
      ] },
    { level: "AS", src: "Edexcel AS 2025 P1 Q9", q: "The equation $px^2 + 4x + q = 0$, where $p$ and $q$ are non-zero constants, has equal roots. Show that $pq = 4$.", marks: 3,
      ms: ["M1: uses $b^2 - 4ac = 0$", "A1: $16 - 4pq = 0$", "A1: $pq = 4$ (cso)"] },
    { src: "Edexcel 2019 P2 Q5", ctx: "$f(x) = 2x^2 - 12x + 23$.",
      parts: [
        { q: "Express $f(x)$ in the form $a(x + b)^2 + c$.", marks: 3, ms: ["M1: takes out 2: $2(x^2 - 6x) + 23$", "A1: $2(x-3)^2 - 18 + 23$", "A1: $2(x-3)^2 + 5$"] },
        { q: "Sketch $y = f(x)$, showing the coordinates of the minimum point and the $y$-intercept.", marks: 2, ms: ["B1: U-shaped parabola with minimum at $(3, 5)$", "B1: $y$-intercept $(0, 23)$, curve entirely above the $x$-axis"] },
        { q: "Describe fully the transformation that maps $y = x^2$ onto $y = f(x)$… write the sequence.", marks: 3, ms: ["B1: translation by $\\binom{3}{0}$", "B1: stretch parallel to the $y$-axis, scale factor 2", "B1: translation by $\\binom{0}{5}$ (in a valid order)"] }
      ] }
  ]
});

X("maths:2.4", {
  flashcards: [
    ["Solve $y = 2x - 1$ and $x^2 + y^2 = 13$.", "$x^2 + (2x-1)^2 = 13 \\Rightarrow 5x^2 - 4x - 12 = 0 \\Rightarrow (5x + 6)(x - 2) = 0$: $(2, 3)$ and $(-1.2, -3.4)$."],
    ["Solve $x + y = 5$, $xy = 6$.", "$x(5-x) = 6 \\Rightarrow x^2 - 5x + 6 = 0$: $(2, 3)$ and $(3, 2)$."],
    ["Line meets curve at exactly one point means…", "The resulting quadratic has equal roots — discriminant zero — the line is a tangent."],
    ["Find where $y = 3x - 2$ meets $y = x^2 - x + 1$.", "$x^2 - 4x + 3 = 0 \\Rightarrow x = 1, 3$: points $(1, 1)$ and $(3, 7)$."],
    ["Why substitute rather than eliminate with one linear, one quadratic?", "Rearranging the linear equation and substituting produces a single quadratic in one variable."],
    ["Solve $2x - y = 4$ and $x^2 + xy = 12$.", "$y = 2x - 4$: $x^2 + 2x^2 - 4x = 12 \\Rightarrow 3x^2 - 4x - 12 = 0$; $x = \\dfrac{4 \\pm \\sqrt{160}}{6} = \\dfrac{2 \\pm 2\\sqrt{10}}{3}$."],
    ["Line $y = mx$ and circle $(x-4)^2 + y^2 = 4$: condition for two intersections?", "$(1 + m^2)x^2 - 8x + 12 = 0$, discriminant $64 - 48(1 + m^2) > 0 \\Rightarrow m^2 < \\tfrac13$."],
    ["How many solutions can a line and a parabola have?", "0, 1 or 2 — according to the discriminant sign."]
  ],
  quiz: [
    { q: "Solving $y = x + 1$ with $y = x^2 - 1$ gives $x$ values:", opts: ["$-1, 2$", "$1, 2$", "$0, 1$", "$-2, 1$"], ans: 0, why: "$x^2 - x - 2 = 0$." },
    { q: "$x + y = 7$, $x^2 + y^2 = 25$: solutions are:", opts: ["$(3, 4), (4, 3)$", "$(5, 2), (2, 5)$", "$(0, 7), (7, 0)$", "$(1, 6), (6, 1)$"], ans: 0, why: "$x^2 + (7-x)^2 = 25$." },
    { q: "A line is a tangent to a curve when the intersection quadratic has:", opts: ["two roots", "equal roots", "no roots", "three roots"], ans: 1, why: "$b^2 = 4ac$." },
    { q: "Line meets curve where $x^2 + 2x + k = 0$ has no real roots when:", opts: ["$k < 1$", "$k > 1$", "$k = 1$", "$k < 0$"], ans: 1, why: "$4 - 4k < 0$." },
    { q: "First step for $y = 2x + 3$, $x^2 + y^2 = 10$:", opts: ["add the equations", "substitute $y$ into the circle", "square both", "divide"], ans: 1, why: "Produces one quadratic." },
    { q: "$3x + 2y = 12$, $x - y = 1$: $x =$", opts: ["2", "2.8", "3", "4"], ans: 1, why: "$x = 1 + y$: $3 + 5y = 12 \\Rightarrow y = 1.8$." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2024 P1 Q5", ctx: "The curve $C$ has equation $y = \\dfrac{4}{x} + 1$ and the curve $D$ has equation $y = x^2 - 2x + 3$.",
      parts: [
        { q: "Show that the $x$-coordinates of the points of intersection of $C$ and $D$ satisfy $x^3 - 2x^2 + 2x - 4 = 0$.", marks: 2, ms: ["M1: equates $\\dfrac4x + 1 = x^2 - 2x + 3$ and multiplies through by $x$", "A1: $x^3 - 2x^2 + 2x - 4 = 0$ (cso)"] },
        { q: "Hence find the coordinates of the point of intersection.", marks: 4, ms: ["M1: factorises by grouping $x^2(x-2) + 2(x-2)$", "A1: $(x-2)(x^2+2) = 0$", "A1: $x = 2$ only, since $x^2 + 2 > 0$", "A1: $(2, 3)$"] }
      ] },
    { src: "Edexcel 2022 P1 Q11", ctx: "The curves $y = x^3 - 3x^2 + 2$ and $y = 2x^2 - 4x + 2$ intersect at three points.",
      parts: [
        { q: "Show that the $x$-coordinates of the points of intersection satisfy $x^3 - 5x^2 + 4x = 0$.", marks: 1, ms: ["B1: $x^3 - 3x^2 + 2 = 2x^2 - 4x + 2 \\Rightarrow x^3 - 5x^2 + 4x = 0$"] },
        { q: "Find the coordinates of the three points of intersection.", marks: 4, ms: ["M1: $x(x^2 - 5x + 4) = 0$", "A1: $x(x-1)(x-4) = 0$", "A1: $x = 0, 1, 4$", "A1: points $(0, 2)$, $(1, 0)$, $(4, 18)$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2019 P1 Q7", q: "The curve $C$ has equation $y = \\dfrac{k^2}{x} - 1$, where $k > 0$, and the line $l$ has equation $y = 3 - 4x$. Given that $l$ is a tangent to $C$, find the value of $k$.", marks: 5,
      ms: ["M1: equates: $\\dfrac{k^2}{x} - 1 = 3 - 4x$ and multiplies by $x$", "A1: $4x^2 - 4x + k^2 = 0$", "M1: uses $b^2 - 4ac = 0$ for a tangent: $16 - 16k^2 = 0$", "A1: $k^2 = 1$", "A1: $k = 1$ (rejecting $k = -1$ since $k > 0$)"] }
  ]
});

X("maths:2.5", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Inequalities — quadratic, modulus, and defining a region" },
    "Three recurring forms: **solve a quadratic inequality in set notation** (AS Nov 2021: $x^2 - x > 20 \\Rightarrow \\{x : x < -4\\} \\cup \\{x : x > 5\\}$); **define a shaded region $R$ with inequalities** where a line and a curve meet (Oct 2020, AS 2023, AS Specimen: e.g. $y \\le 3x + 2$, $y \\ge x^2 - 4$, $x \\ge 0$); and **modulus inequalities** from a sketch (Specimen: $|2x - 5| < 3$). The set-notation mark is separate — the answer $-4 < x < 5$ written as $\\{x : -4 < x < 5\\}$, and an 'or' answer as a **union** of two sets.",
    { callout: { t: "warn", body: "Never multiply an inequality by an expression that could be negative. For $\\dfrac{2}{x} > 1$ sketch both sides or multiply by $x^2$; for $|x - 1| < 2x$ sketch." }}
  ],
  flashcards: [
    ["Solve $x^2 - x > 20$ in set notation.", "$(x-5)(x+4) > 0$: $\\{x : x < -4\\} \\cup \\{x : x > 5\\}$."],
    ["Solve $3 - 2x \\ge 4x + 9$.", "$-6 \\ge 6x \\Rightarrow x \\le -1$."],
    ["Solve $x^2 + 3x - 10 \\le 0$.", "$(x+5)(x-2) \\le 0 \\Rightarrow -5 \\le x \\le 2$."],
    ["Region $R$ below the line $y = 2x + 1$, above the curve $y = x^2 - 2$, right of the $y$-axis. Inequalities?", "$y \\le 2x + 1$, $y \\ge x^2 - 2$, $x \\ge 0$."],
    ["Solve $|2x - 5| < 3$.", "$-3 < 2x - 5 < 3 \\Rightarrow 1 < x < 4$."],
    ["Solve $|x + 1| > 2$.", "$x + 1 > 2$ or $x + 1 < -2$: $x > 1$ or $x < -3$."],
    ["Solve $\\dfrac{3}{x} > 1$ for $x \\ne 0$.", "Sketch or cases: $0 < x < 3$ (for $x < 0$ the LHS is negative so never $> 1$)."],
    ["Solve simultaneously $x^2 - 4 < 0$ and $2x + 1 > 0$.", "$-2 < x < 2$ and $x > -\\tfrac12$: $-\\tfrac12 < x < 2$."]
  ],
  quiz: [
    { q: "$x^2 < 16$ is equivalent to:", opts: ["$x < 4$", "$-4 < x < 4$", "$x < -4$ or $x > 4$", "$x > 4$"], ans: 1, why: "Between the roots." },
    { q: "$(x - 2)(x + 3) > 0$ is satisfied by:", opts: ["$-3 < x < 2$", "$x < -3$ or $x > 2$", "$x > 2$ only", "all $x$"], ans: 1, why: "Positive outside the roots." },
    { q: "The set $\\{x : x < 1\\} \\cup \\{x : x > 5\\}$ describes:", opts: ["$1 < x < 5$", "$x < 1$ or $x > 5$", "$x = 1$ or $5$", "$1 \\le x \\le 5$"], ans: 1, why: "Union." },
    { q: "Dividing an inequality by $-2$:", opts: ["keeps the sign", "reverses the sign", "removes it", "squares it"], ans: 1, why: "Negative multiplier." },
    { q: "$|x - 3| \\le 2$ means:", opts: ["$1 \\le x \\le 5$", "$x \\le 5$", "$x \\ge 1$", "$-2 \\le x \\le 2$"], ans: 0, why: "Within 2 of 3." },
    { q: "The region above $y = x^2$ and below $y = 4$ is:", opts: ["$y \\ge x^2, y \\le 4$", "$y \\le x^2, y \\ge 4$", "$y \\ge x^2 + 4$", "$x^2 \\le 4$"], ans: 0, why: "Above means $y \\ge$." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2023 P1 Q8", ctx: "The curve $y = x^2 - 4x + 5$ and the line $y = 2x$ meet at the points $A$ and $B$. The region $R$ is bounded by the curve and the line.",
      parts: [
        { q: "Find the coordinates of $A$ and $B$.", marks: 3, ms: ["M1: $x^2 - 6x + 5 = 0$", "A1: $(x-1)(x-5) = 0$, $x = 1, 5$", "A1: $A(1, 2)$, $B(5, 10)$"] },
        { q: "Write down the inequalities that define $R$.", marks: 2, ms: ["B1: $y \\ge x^2 - 4x + 5$", "B1: $y \\le 2x$ (accept with $1 \\le x \\le 5$)"] }
      ] },
    { level: "AS", src: "Edexcel AS Nov 2021 P1 Q1", q: "Solve $x^2 - x > 20$, giving your answer in set notation.", marks: 3,
      ms: ["M1: $x^2 - x - 20 = (x - 5)(x + 4)$, critical values $-4, 5$", "A1: $x < -4$ or $x > 5$", "B1: $\\{x : x < -4\\} \\cup \\{x : x > 5\\}$"] },
    { src: "Edexcel Specimen P2 Q4", parts: [
      { q: "Sketch $y = |2x - 5|$, showing where the graph meets the axes.", marks: 2, ms: ["B1: V shape with vertex on the $x$-axis at $(2.5, 0)$", "B1: $y$-intercept $(0, 5)$"] },
      { q: "Solve $|2x - 5| < 3$, giving your answer in set notation.", marks: 2, ms: ["M1: $-3 < 2x - 5 < 3$", "A1: $\\{x : 1 < x < 4\\}$"] },
      { q: "Solve $|2x - 5| \\ge x + 1$.", marks: 2, ms: ["M1: solves $2x - 5 = x + 1$ ($x = 6$) and $-(2x - 5) = x + 1$ ($x = \\tfrac43$)", "A1: $x \\le \\tfrac43$ or $x \\ge 6$"] }
    ] },
    { level: "AS", src: "Edexcel AS 2025 P1 Q7", ctx: "A company sells chairs at £$x$ each. The weekly profit £$P$ is modelled by $P = -20x^2 + 1400x - 15000$.",
      parts: [
        { q: "Find the range of prices for which the company makes a profit of at least £6000 per week.", marks: 4, ms: ["M1: $-20x^2 + 1400x - 15000 \\ge 6000 \\Rightarrow x^2 - 70x + 1050 \\le 0$", "M1: solves $x^2 - 70x + 1050 = 0$: $x = 35 \\pm \\sqrt{175}$", "A1: $x = 21.77…$, $48.22…$", "A1: $21.8 \\le x \\le 48.2$ (to 3 s.f.)"] },
        { q: "Explain why a price of £80 is not sensible according to the model.", marks: 1, ms: ["B1: $P(80) = -128000 + 112000 - 15000 < 0$ — the model gives a loss (customers would not buy at that price)"] }
      ] }
  ]
});

X("maths:2.6", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Factor theorem — a guaranteed 3 to 10 marks" },
    "**Find the constant** (3 marks: $f(a) = 0$ set up, solved); **fully factorise** (divide by the known factor by inspection or long division, then factorise the quadratic — or show it has **no real roots** with the discriminant, so \"$x = a$ is the only real root\"); then a **follow-on**: sketch, the roots of $f(x + k) = 0$ (shift), a related equation ($f(x) = 3$), or a disguised equation in $y - 2$ or $\\tan\\theta$.",
    { callout: { t: "tip", body: "Write the remainder-theorem line explicitly: \"$(x + 3)$ is a factor so $f(-3) = 0$\". When dividing by inspection, write $f(x) = (x + 3)(ax^2 + bx + c)$ and compare **the $x^3$ and constant coefficients first**, then one middle coefficient." }}
  ],
  flashcards: [
    ["State the factor theorem.", "$(x - a)$ is a factor of the polynomial $f(x)$ if and only if $f(a) = 0$."],
    ["$(x + 3)$ is a factor of $f(x) = 2x^3 + ax^2 - 5x + 6$. Find $a$.", "$f(-3) = -54 + 9a + 15 + 6 = 0 \\Rightarrow a = \\tfrac{33}{9} = \\tfrac{11}{3}$."],
    ["Factorise $2x^3 - 24x^2 + 40x$ completely.", "$2x(x^2 - 12x + 20) = 2x(x-2)(x-10)$."],
    ["Given $f(-4) = 0$ for $f(x) = x^3 + 2x^2 - 5x + 12$, write $f(x) = (x+4)Q(x)$.", "$Q(x) = x^2 - 2x + 3$ (check: constant $12 = 4 \\times 3$, $x^2$: $-2 + 4 = 2$)."],
    ["How do you prove $x = -4$ is the only real root of $(x+4)(x^2 - 2x + 3) = 0$?", "The discriminant of $x^2 - 2x + 3$ is $4 - 12 < 0$, so it has no real roots."],
    ["Solve $3x^3 - 17x^2 - 6x = 0$, hence solve $3(y-2)^3 - 17(y-2)^2 - 6(y-2) = 0$.", "$x(3x + 1)(x - 6) = 0 \\Rightarrow x = 0, -\\tfrac13, 6$; hence $y = 2, \\tfrac53, 8$."],
    ["Remainder when $f(x) = x^3 - 2x + 1$ is divided by $(x - 2)$?", "$f(2) = 8 - 4 + 1 = 5$."],
    ["$f(x)$ has roots $1, 2, 4$. Roots of $f(x - 3) = 0$?", "$4, 5, 7$ (graph shifted right by 3)."],
    ["Divide $x^3 - 7x - 6$ by $(x + 1)$.", "$x^2 - x - 6 = (x - 3)(x + 2)$; so $x^3 - 7x - 6 = (x+1)(x+2)(x-3)$."],
    ["$(2x + k)$ is a factor of $f(x)$. Which value makes $f$ zero?", "$x = -\\tfrac{k}{2}$: $f(-\\tfrac k2) = 0$."]
  ],
  quiz: [
    { q: "$(x - 2)$ is a factor of $f(x)$ means:", opts: ["$f(2) = 0$", "$f(-2) = 0$", "$f(0) = 2$", "$f'(2) = 0$"], ans: 0, why: "Factor theorem." },
    { q: "$f(x) = x^3 - 6x^2 + 11x - 6$. Which is a factor?", opts: ["$(x + 1)$", "$(x - 1)$", "$(x - 4)$", "$(x + 2)$"], ans: 1, why: "$f(1) = 0$." },
    { q: "Remainder of $x^3 + 1$ divided by $(x + 2)$:", opts: ["$-7$", "$9$", "$7$", "$-9$"], ans: 0, why: "$(-2)^3 + 1$." },
    { q: "$(x + 3)(x^2 + 1) = 0$ has how many real roots?", opts: ["3", "2", "1", "0"], ans: 2, why: "$x^2 + 1 > 0$." },
    { q: "If $f(x) = (x - 1)(x - 5)^2$, the graph:", opts: ["crosses at 1 and 5", "crosses at 1 and touches at 5", "touches at 1 and crosses at 5", "has no roots"], ans: 1, why: "Repeated root touches." },
    { q: "Roots of $f(x + 2) = 0$ if $f$ has roots $-1, 3$:", opts: ["$1, 5$", "$-3, 1$", "$-1, 3$", "$-2, 6$"], ans: 1, why: "Shift left by 2." }
  ],
  exam: [
    { src: "Edexcel 2025 P1 Q4", ctx: "$f(x) = x^3 + 2x^2 - 5x + 12$. Given that $f(-4) = 0$,",
      parts: [
        { q: "Write $f(x)$ in the form $(x + a)Q(x)$, where $Q(x)$ is a quadratic.", marks: 3, ms: ["B1: $a = 4$", "M1: divides / compares coefficients to find $Q(x)$", "A1: $Q(x) = x^2 - 2x + 3$"] },
        { q: "Hence prove that $-4$ is the only real root of $f(x) = 0$.", marks: 2, ms: ["M1: discriminant of $Q$: $(-2)^2 - 4(1)(3) = -8$", "A1: $< 0$ so $Q(x) = 0$ has no real roots; hence $x = -4$ is the only real root"] }
      ] },
    { src: "Edexcel 2023 P1 Q2", ctx: "$f(x) = 3x^3 + ax^2 - 16x + 5$, where $a$ is a constant. Given that $(x - a)$ is a factor of $f(x) - 5$,",
      parts: [
        { q: "Show that $a(a^2 - 4) = 0$.", marks: 3, ms: ["M1: $g(x) = f(x) - 5 = 3x^3 + ax^2 - 16x$ and sets $g(a) = 0$", "A1: $3a^3 + a^3 - 16a = 0$", "A1: $4a^3 - 16a = 4a(a^2 - 4) = 0$ (cso)"] },
        { q: "Given that $a$ is a negative integer, find the value of $a$ and hence solve $f(x) = 5$.", marks: 4, ms: ["B1: $a = -2$", "M1: $f(x) - 5 = x(3x^2 - 2x - 16)$", "A1: $= x(3x - 8)(x + 2)$", "A1: $x = 0, \\tfrac83, -2$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2024 P1 Q2", ctx: "$f(x) = 2x^3 + kx^2 - 17x + 20$, where $k$ is a constant. Given that $(x - 4)$ is a factor of $f(x)$,",
      parts: [
        { q: "Show that $k = -5$.", marks: 2, ms: ["M1: $f(4) = 128 + 16k - 68 + 20 = 0$", "A1: $16k = -80 \\Rightarrow k = -5$"] },
        { q: "Hence write $f(x)$ as a product of three linear factors and state the roots of $f(x) = 0$.", marks: 3, ms: ["M1: $f(x) = (x-4)(2x^2 + 3x - 5)$ by comparing coefficients", "A1: $(x-4)(2x+5)(x-1)$", "A1: $x = 4, 1, -\\tfrac52$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2022 P1 Q2", ctx: "$f(x) = x^3 + x^2 - 10x + 8$.",
      parts: [
        { q: "Use the factor theorem to show that $(x - 2)$ is a factor of $f(x)$.", marks: 2, ms: ["M1: evaluates $f(2) = 8 + 4 - 20 + 8$", "A1: $= 0$ with the conclusion that $(x-2)$ is a factor"] },
        { q: "Factorise $f(x)$ completely.", marks: 3, ms: ["M1: $f(x) = (x-2)(x^2 + 3x - 4)$", "A1: correct quadratic", "A1: $(x-2)(x+4)(x-1)$"] },
        { q: "Hence write down the roots of $f(x - 5) = 0$.", marks: 1, ms: ["B1: $x = 7, 1, 6$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2025 P1 Q6", q: "$f(x) = 2x^3 + ax^2 + bx - 6$. Given that $(x + 3)$ is a factor of $f(x)$ and that $f'(2) = 46$, find the values of $a$ and $b$.", marks: 5,
      ms: ["M1: $f(-3) = -54 + 9a - 3b - 6 = 0 \\Rightarrow 3a - b = 20$", "M1: $f'(x) = 6x^2 + 2ax + b$, $f'(2) = 24 + 4a + b = 46 \\Rightarrow 4a + b = 22$", "M1: solves simultaneously ($7a = 42$)", "A1: $a = 6$", "A1: $b = -2$"] }
  ]
});

X("maths:2.7", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Curve sketching — cubics, reciprocals, modulus" },
    "The AS sketch questions: **factorise a cubic** ($9x - x^3 = x(3-x)(3+x)$), sketch with **all intercepts labelled**, then \"the line $y = k$ meets the curve at three points — find the range of $k$\" (needs the turning-point $y$-values, so differentiate). **Reciprocal curves** $y = \\dfrac{a}{x} + b$: asymptotes $x = 0$ and $y = b$, then solve an inequality from the sketch. **Proportion**: $y \\propto x^2$, $y \\propto \\dfrac1x$ — write $y = kx^2$, find $k$ from a data point.",
    { callout: { t: "tip", body: "A sketch scores for **shape**, **intercepts** and **asymptotes** — label each with its coordinates. For $y = (x-2)^2(x+3)$: touches at 2, crosses at $-3$, $y$-intercept 12." }}
  ],
  flashcards: [
    ["Sketch $y = x(x - 3)(x + 2)$: intercepts and shape.", "Crosses at $-2, 0, 3$; positive cubic (rises to the right); passes through the origin."],
    ["Sketch $y = (x - 2)^2(x + 3)$.", "Touches the $x$-axis at $x = 2$, crosses at $x = -3$, $y$-intercept 12, positive cubic shape."],
    ["Asymptotes of $y = \\dfrac{3}{x} - 2$?", "$x = 0$ and $y = -2$."],
    ["Factorise and sketch $y = 9x - x^3$.", "$y = x(3 - x)(3 + x)$: roots $-3, 0, 3$; negative cubic (falls to the right)."],
    ["$y = 9x - x^3$: for which $k$ does $y = k$ meet the curve at three points?", "Turning points at $x = \\pm\\sqrt3$ with $y = \\pm 6\\sqrt3$: $-6\\sqrt3 < k < 6\\sqrt3$."],
    ["$y$ is inversely proportional to $x^2$ and $y = 4$ when $x = 3$. Find $y$ when $x = 6$.", "$y = \\dfrac{36}{x^2}$, so $y = 1$."],
    ["Sketch $y = \\dfrac{1}{x^2}$.", "Both branches above the $x$-axis, asymptotes $x = 0$, $y = 0$, symmetric about the $y$-axis."],
    ["Where does $y = x^3 - 4x$ cross the axes?", "$x(x-2)(x+2)$: at $-2, 0, 2$."]
  ],
  quiz: [
    { q: "$y = (x + 1)(x - 3)^2$ touches the $x$-axis at:", opts: ["$x = -1$", "$x = 3$", "$x = 0$", "nowhere"], ans: 1, why: "Repeated factor." },
    { q: "The horizontal asymptote of $y = \\dfrac{2}{x} + 5$ is:", opts: ["$y = 2$", "$y = 5$", "$x = 5$", "$y = 0$"], ans: 1, why: "As $x \\to \\infty$, $y \\to 5$." },
    { q: "A negative cubic $y = -x^3 + \\ldots$:", opts: ["rises to the right", "falls to the right", "is a parabola", "has no roots"], ans: 1, why: "Leading coefficient negative." },
    { q: "$y \\propto \\dfrac{1}{x}$ and $y = 2$ when $x = 6$. When $x = 4$, $y =$", opts: ["3", "4/3", "12", "1.5"], ans: 0, why: "$k = 12$." },
    { q: "How many times does $y = k$ meet $y = x^3 - 3x$ when $k = 0$?", opts: ["1", "2", "3", "0"], ans: 2, why: "Roots $0, \\pm\\sqrt3$." },
    { q: "$y$-intercept of $y = (x-2)^2(x+3)$:", opts: ["$-12$", "$12$", "$6$", "$4$"], ans: 1, why: "$4 \\times 3$." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2022 P1 Q7", ctx: "The curve $C$ has equation $y = 9x - x^3$.",
      parts: [
        { q: "Factorise $9x - x^3$ completely and sketch $C$, showing the coordinates of the points where it meets the $x$-axis.", marks: 3, ms: ["B1: $x(3 - x)(3 + x)$", "B1: negative cubic shape through the origin", "B1: crosses at $(-3, 0)$, $(0, 0)$, $(3, 0)$"] },
        { q: "The line $y = k$ meets $C$ at three distinct points. Find the range of possible values of $k$.", marks: 4, ms: ["M1: $\\dfrac{dy}{dx} = 9 - 3x^2 = 0 \\Rightarrow x = \\pm\\sqrt3$", "A1: turning-point $y$-values $\\pm 6\\sqrt3$", "M1: $k$ strictly between the turning-point values", "A1: $-6\\sqrt3 < k < 6\\sqrt3$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2023 P1 Q4", parts: [
      { q: "Sketch the curve $y = \\dfrac{3}{x} + 2$, stating the equations of its asymptotes and the coordinates of any point where it meets the axes.", marks: 3, ms: ["B1: two branches of a reciprocal curve, correct quadrants", "B1: asymptotes $x = 0$ and $y = 2$", "B1: meets the $x$-axis at $(-1.5, 0)$"] },
      { q: "Hence, or otherwise, solve $\\dfrac{3}{x} + 2 > 5$.", marks: 2, ms: ["M1: $\\dfrac3x > 3$ with reference to the sketch / considers $x > 0$", "A1: $0 < x < 1$"] }
    ] },
    { level: "AS", src: "Edexcel AS Specimen P1 Q14", ctx: "The curve $C$ has equation $y = (x - 2)^2(x + 3)$.",
      parts: [
        { q: "Sketch $C$, showing the coordinates of the points where it meets the coordinate axes.", marks: 3, ms: ["B1: positive cubic shape", "B1: touches at $(2, 0)$, crosses at $(-3, 0)$", "B1: $y$-intercept $(0, 12)$"] },
        { q: "Find the exact area of the region bounded by $C$ and the $x$-axis between $x = -3$ and $x = 2$.", marks: 6, ms: ["M1: expands $(x-2)^2(x+3) = x^3 - x^2 - 8x + 12$", "M1: integrates: $\\tfrac14 x^4 - \\tfrac13 x^3 - 4x^2 + 12x$", "A1: correct integral", "M1: evaluates between $-3$ and $2$", "A1: $F(2) = \\tfrac{28}{3}$, $F(-3) = -\\tfrac{171}{4}$", "A1: area $= \\tfrac{28}{3} + \\tfrac{171}{4} = \\tfrac{625}{12}$"] }
      ] }
  ]
});

X("maths:2.8", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Functions — the 6 to 13 mark Paper 1 question" },
    "Every A-level Pure paper has one: $f(x) = \\dfrac{ax + b}{cx + d}$ or $f(x) = 3 + \\sqrt{x - 2}$ or a piecewise/modulus function. The parts recur: **range** (from the sketch or the horizontal asymptote), **inverse** (swap and rearrange; for the rational form, collect $x$ terms and factorise), **composite** $gf(1.8)$ / $ff(x)$ (work inside-out), **why $g$ has no inverse** (**not one-to-one** — a horizontal line meets the graph twice), and **solve $f(x) = g(x)$** or **find $k$ so there are no real solutions**.",
    { callout: { t: "memorise", body: "Domain of $f^{-1}$ = range of $f$; range of $f^{-1}$ = domain of $f$. $f^{-1}(7)$ is the value $x$ with $f(x) = 7$ — solve, don't invert. A function must be **one-to-one** to have an inverse; restrict the domain (e.g. $x \\ge 0$ for $x^2$) to make it so." }}
  ],
  flashcards: [
    ["$f(x) = \\dfrac{2x + 1}{x - 3}$, $x \\ne 3$. Find $f^{-1}(x)$.", "$y(x-3) = 2x + 1 \\Rightarrow x(y - 2) = 3y + 1 \\Rightarrow f^{-1}(x) = \\dfrac{3x + 1}{x - 2}$, $x \\ne 2$."],
    ["Range of $f(x) = 3 + \\sqrt{x - 2}$, $x \\ge 2$?", "$f(x) \\ge 3$."],
    ["Inverse of $f(x) = 3 + \\sqrt{x - 2}$?", "$f^{-1}(x) = (x - 3)^2 + 2$, domain $x \\ge 3$."],
    ["$f(x) = 2x - 1$, $g(x) = x^2 + 3$. Find $gf(x)$ and $fg(x)$.", "$gf(x) = (2x-1)^2 + 3 = 4x^2 - 4x + 4$; $fg(x) = 2x^2 + 5$."],
    ["Why does $g(x) = x^2 - 4$, $x \\in \\mathbb R$, have no inverse?", "It is not one-to-one — e.g. $g(2) = g(-2) = 0$ — so the inverse would not be a function."],
    ["Find $f^{-1}(7)$ for $f(x) = \\dfrac{5x - 2}{x + 1}$.", "Solve $\\dfrac{5x-2}{x+1} = 7$: $5x - 2 = 7x + 7 \\Rightarrow x = -4.5$."],
    ["Relationship between the graphs of $f$ and $f^{-1}$?", "Reflections of each other in the line $y = x$."],
    ["$f(x) = \\dfrac{4x + 3}{2x - 1}$: express in the form $A + \\dfrac{B}{2x - 1}$ and state the range.", "$2 + \\dfrac{5}{2x - 1}$; range $f(x) \\ne 2$."],
    ["$f(x) = e^{2x} + 1$. Find $f^{-1}$ and its domain.", "$f^{-1}(x) = \\tfrac12\\ln(x - 1)$, domain $x > 1$."],
    ["$f(x) = 4|x - 3| - 5$. Range?", "$f(x) \\ge -5$."]
  ],
  quiz: [
    { q: "$f(x) = 3x + 2$, $g(x) = x^2$. $fg(2) =$", opts: ["14", "64", "10", "16"], ans: 0, why: "$g(2) = 4$, $f(4) = 14$." },
    { q: "The domain of $f^{-1}$ equals:", opts: ["the domain of $f$", "the range of $f$", "$\\mathbb R$", "$x > 0$"], ans: 1, why: "Inputs of the inverse are outputs of $f$." },
    { q: "$f(x) = \\dfrac{x}{x - 1}$. $f^{-1}(x) =$", opts: ["$\\dfrac{x}{x-1}$", "$\\dfrac{x-1}{x}$", "$\\dfrac{1}{x-1}$", "$x - 1$"], ans: 0, why: "$y(x-1) = x \\Rightarrow x = \\dfrac{y}{y-1}$ — self-inverse." },
    { q: "A function has an inverse only if it is:", opts: ["increasing", "one-to-one", "continuous", "quadratic"], ans: 1, why: "Each output from one input." },
    { q: "Range of $f(x) = x^2 + 2$, $x \\in \\mathbb R$:", opts: ["$f(x) \\ge 0$", "$f(x) \\ge 2$", "$f(x) > 2$", "$\\mathbb R$"], ans: 1, why: "Minimum 2 at $x = 0$." },
    { q: "$ff(x)$ for $f(x) = 1 - x$:", opts: ["$x$", "$1 - 2x$", "$2 - x$", "$x - 1$"], ans: 0, why: "$1 - (1 - x)$." },
    { q: "The graph of $f^{-1}$ is the graph of $f$ reflected in:", opts: ["the $x$-axis", "the $y$-axis", "$y = x$", "$y = -x$"], ans: 2, why: "Swap $x$ and $y$." }
  ],
  exam: [
    { src: "Edexcel 2023 P1 Q7", ctx: "The functions $f$ and $g$ are defined by $f(x) = 3 + \\sqrt{x - 2}$, $x \\ge 2$, and $g(x) = 2x - 5$, $x \\in \\mathbb R$.",
      parts: [
        { q: "State the range of $f$.", marks: 1, ms: ["B1: $f(x) \\ge 3$"] },
        { q: "Find $f^{-1}(x)$, stating its domain.", marks: 3, ms: ["M1: $y - 3 = \\sqrt{x - 2}$ and squares", "A1: $f^{-1}(x) = (x - 3)^2 + 2$", "B1: domain $x \\ge 3$"] },
        { q: "Find $gf(6)$.", marks: 2, ms: ["M1: $f(6) = 3 + 2 = 5$", "A1: $g(5) = 5$"] },
        { q: "Find the exact value of $a$ for which $f(a^2 + 2) = g(a)$, given $a > 0$.", marks: 2, ms: ["M1: $3 + a = 2a - 5$", "A1: $a = 8$"] }
      ] },
    { src: "Edexcel 2022 P1 Q10", ctx: "$f(x) = \\dfrac{4x + 3}{2x - 1}$, $x > \\tfrac12$, and $g(x) = x^2 + 1$, $x \\in \\mathbb R$.",
      parts: [
        { q: "Find $f^{-1}(x)$.", marks: 3, ms: ["M1: $y(2x - 1) = 4x + 3$", "M1: $x(2y - 4) = y + 3$", "A1: $f^{-1}(x) = \\dfrac{x + 3}{2x - 4}$"] },
        { q: "Express $f(x)$ in the form $A + \\dfrac{B}{2x - 1}$ and hence state the range of $f$.", marks: 3, ms: ["M1: $4x + 3 = 2(2x - 1) + 5$", "A1: $f(x) = 2 + \\dfrac{5}{2x - 1}$", "A1: range $f(x) > 2$"] },
        { q: "Find $gf(x)$ and state the range of $gf$.", marks: 2, ms: ["B1: $gf(x) = \\left(\\dfrac{4x+3}{2x-1}\\right)^2 + 1$", "B1: range $gf(x) > 5$"] }
      ] },
    { src: "Edexcel 2019 P2 Q6", ctx: "$g(x) = x^2 - 4x + 1$, $x \\in \\mathbb R$, and $h(x) = x^2 - 4x + 1$, $x \\ge 2$.",
      parts: [
        { q: "Find $gg(0)$.", marks: 2, ms: ["M1: $g(0) = 1$", "A1: $g(1) = -2$"] },
        { q: "Explain why $g$ does not have an inverse but $h$ does.", marks: 2, ms: ["B1: $g$ is not one-to-one (many-to-one), e.g. $g(0) = g(4) = 1$ / a horizontal line meets the graph twice", "B1: restricting the domain to $x \\ge 2$ (from the vertex) makes $h$ one-to-one"] },
        { q: "Find $h^{-1}(x)$ and state its domain.", marks: 4, ms: ["M1: completes the square $y = (x-2)^2 - 3$", "M1: $x = 2 + \\sqrt{y + 3}$ (positive root since $x \\ge 2$)", "A1: $h^{-1}(x) = 2 + \\sqrt{x + 3}$", "B1: domain $x \\ge -3$"] }
      ] },
    { src: "Edexcel 2024 P2 Q8", ctx: "$f(x) = e^{x} - 2$, $x \\in \\mathbb R$, and $g(x) = \\ln(x + 4)$, $x > -4$.",
      parts: [
        { q: "Find $fg(x)$, giving your answer in its simplest form.", marks: 2, ms: ["M1: $e^{\\ln(x+4)} - 2$", "A1: $x + 2$"] },
        { q: "Find $f^{-1}(x)$ and state its domain.", marks: 3, ms: ["M1: $x = \\ln(y + 2)$", "A1: $f^{-1}(x) = \\ln(x + 2)$", "B1: $x > -2$"] },
        { q: "The equation $f(x) = k$ has no real solutions. State the range of values of $k$.", marks: 1, ms: ["B1: $k \\le -2$"] }
      ] }
  ]
});

X("maths:2.9", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Transformations — the image of a point (4 marks, 2022, 2024, 2025)" },
    "A point $P(a, b)$ on $y = f(x)$ is mapped under each of: $y = f(x + 2)$ → $(a - 2, b)$; $y = 2f(x)$ → $(a, 2b)$; $y = f(2x)$ → $(\\tfrac a2, b)$; $y = -f(x)$ → $(a, -b)$; $y = f(-x)$ → $(-a, b)$; $y = f(x) + 3$ → $(a, b + 3)$. **Inside the bracket acts on $x$ and goes the opposite way**; outside acts on $y$ directly. Asymptotes transform the same way as points.",
    { callout: { t: "tip", body: "For **describe the transformation** answers use the exact words: *translation by $\\binom{-2}{0}$* · *stretch parallel to the $y$-axis, scale factor 2* · *stretch parallel to the $x$-axis, scale factor $\\tfrac12$* · *reflection in the $x$-axis*. \"Move\" and \"shift\" lose the mark." }}
  ],
  flashcards: [
    ["$P(4, -3)$ lies on $y = f(x)$. Image on $y = f(x + 2)$?", "$(2, -3)$."],
    ["Image of $P(4, -3)$ on $y = 3f(x)$?", "$(4, -9)$."],
    ["Image of $P(4, -3)$ on $y = f(2x)$?", "$(2, -3)$."],
    ["Image of $P(4, -3)$ on $y = -f(x) + 1$?", "$(4, 4)$."],
    ["Describe the transformation from $y = x^2$ to $y = (x - 3)^2 + 5$.", "Translation by $\\binom{3}{5}$."],
    ["Describe $y = f(x) \\to y = f(-x)$.", "Reflection in the $y$-axis."],
    ["Asymptote $y = 2$ of $y = f(x)$: its image under $y = f(x) - 5$?", "$y = -3$."],
    ["Describe $y = \\sin x \\to y = \\sin(3x)$.", "Stretch parallel to the $x$-axis, scale factor $\\tfrac13$."],
    ["$y = f(x)$ has a maximum at $(2, 6)$. Maximum of $y = 2f(x - 1)$?", "$(3, 12)$."],
    ["Order matters: $y = 2f(x) + 1$ vs $y = 2(f(x) + 1)$ on $(a, b)$?", "$(a, 2b + 1)$ vs $(a, 2b + 2)$."]
  ],
  quiz: [
    { q: "$y = f(x - 4)$ translates the graph:", opts: ["4 left", "4 right", "4 up", "4 down"], ans: 1, why: "Opposite sign inside the bracket." },
    { q: "$y = f(3x)$ is a stretch parallel to the $x$-axis with scale factor:", opts: ["3", "$\\tfrac13$", "$-3$", "1"], ans: 1, why: "Squashes towards the $y$-axis." },
    { q: "Image of $(6, 2)$ under $y = f(x) - 3$:", opts: ["$(3, 2)$", "$(6, -1)$", "$(6, 5)$", "$(9, 2)$"], ans: 1, why: "Subtract 3 from $y$." },
    { q: "$y = -f(x)$ is a reflection in:", opts: ["the $x$-axis", "the $y$-axis", "$y = x$", "the origin"], ans: 0, why: "Negates $y$." },
    { q: "The minimum $(1, -4)$ of $y = f(x)$ under $y = f(x + 1) + 4$ becomes:", opts: ["$(2, 0)$", "$(0, 0)$", "$(0, -8)$", "$(2, -8)$"], ans: 1, why: "Left 1, up 4." },
    { q: "$y = 3\\cos x$ compared with $y = \\cos x$ has amplitude:", opts: ["1", "3", "$\\tfrac13$", "0"], ans: 1, why: "Vertical stretch ×3." }
  ],
  exam: [
    { src: "Edexcel 2024 P2 Q3", ctx: "The point $P(-3, 8)$ lies on the curve $y = f(x)$.",
      parts: [
        { q: "State the coordinates of the image of $P$ on the curve $y = f(x + 2)$.", marks: 1, ms: ["B1: $(-5, 8)$"] },
        { q: "State the coordinates of the image of $P$ on the curve $y = 3f(x)$.", marks: 1, ms: ["B1: $(-3, 24)$"] },
        { q: "State the coordinates of the image of $P$ on the curve $y = f(2x) - 1$.", marks: 2, ms: ["B1: $x$-coordinate $-1.5$", "B1: $(-1.5, 7)$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2025 P1 Q1", ctx: "The curve $y = f(x)$ has a maximum point at $(1, 4)$, crosses the $x$-axis at $(-2, 0)$ and $(3, 0)$, and has an asymptote $y = -1$.",
      parts: [
        { q: "Sketch $y = f(x + 2)$, stating the coordinates of the maximum and the intercepts on the $x$-axis and the equation of the asymptote.", marks: 3, ms: ["B1: maximum at $(-1, 4)$", "B1: $x$-intercepts $(-4, 0)$ and $(1, 0)$", "B1: asymptote $y = -1$ (unchanged)"] },
        { q: "Sketch $y = -f(x)$, stating the same features.", marks: 3, ms: ["B1: minimum at $(1, -4)$", "B1: $x$-intercepts unchanged at $(-2, 0)$, $(3, 0)$", "B1: asymptote $y = 1$"] }
      ] },
    { src: "Edexcel 2019 P2 Q5", q: "The curve $y = x^2 - 6x + 13$ is obtained from $y = x^2$ by a single translation. Describe the translation fully and state the range of $f(x) = x^2 - 6x + 13$.", marks: 3,
      ms: ["M1: completes the square $(x - 3)^2 + 4$", "A1: translation by the vector $\\binom{3}{4}$", "B1: range $f(x) \\ge 4$"] }
  ]
});

X("maths:2.10", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Partial fractions — set-up for integration and binomials" },
    "Three forms: **two distinct linear factors** $\\dfrac{A}{x+1} + \\dfrac{B}{x+3}$; a **repeated factor** $\\dfrac{A}{x-1} + \\dfrac{B}{(x-1)^2}$ (Oct 2021 — the follow-on was a binomial expansion with validity $|x| < 1$); and an **improper fraction** $Ax + B + \\dfrac{C}{x+1} + \\dfrac{D}{x+3}$ (2025 — divide first, or compare coefficients of the highest power). Substitution of the roots finds the constants over linear factors; the repeated-factor $A$ and improper-fraction $A, B$ need **coefficient comparison**.",
    { callout: { t: "tip", body: "Check your constants by substituting one further value (e.g. $x = 0$) into the identity before integrating — a wrong constant costs every later mark." }}
  ],
  flashcards: [
    ["Express $\\dfrac{5x + 7}{(x+1)(x+3)}$ in partial fractions.", "$\\dfrac{1}{x+1} + \\dfrac{4}{x+3}$ ($x = -1$: $2 = 2A$; $x = -3$: $-8 = -2B$)."],
    ["Express $\\dfrac{3x + 1}{(x - 1)^2}$ in partial fractions.", "$\\dfrac{3}{x - 1} + \\dfrac{4}{(x-1)^2}$."],
    ["Express $\\dfrac{2x^2 + 5x + 6}{(x+1)(x+2)}$ in partial fractions.", "Improper: $2 + \\dfrac{-x + 2}{(x+1)(x+2)} = 2 + \\dfrac{3}{x+1} - \\dfrac{4}{x+2}$."],
    ["Form for $\\dfrac{7}{(x - 2)(x + 1)^2}$?", "$\\dfrac{A}{x-2} + \\dfrac{B}{x+1} + \\dfrac{C}{(x+1)^2}$."],
    ["When must you divide first?", "When the numerator's degree is at least the denominator's — the fraction is improper."],
    ["How do you find $B$ in $\\dfrac{A}{x-1} + \\dfrac{B}{(x-1)^2}$?", "Substitute $x = 1$ into the identity $N(x) = A(x-1) + B$."],
    ["Express $\\dfrac{x}{(2x + 1)(x - 3)}$ in partial fractions.", "$x = 3$: $3 = 7B \\Rightarrow B = \\tfrac37$; $x = -\\tfrac12$: $-\\tfrac12 = -\\tfrac72 A \\Rightarrow A = \\tfrac17$: $\\dfrac{1}{7(2x+1)} + \\dfrac{3}{7(x-3)}$."],
    ["Why are partial fractions needed before integrating $\\dfrac{1}{(x+1)(x+3)}$?", "Each term $\\dfrac{A}{x + a}$ integrates to $A\\ln|x + a|$; the product form cannot be integrated directly."]
  ],
  quiz: [
    { q: "$\\dfrac{1}{(x+1)(x+2)} =$", opts: ["$\\dfrac{1}{x+1} - \\dfrac{1}{x+2}$", "$\\dfrac{1}{x+1} + \\dfrac{1}{x+2}$", "$\\dfrac{2}{x+1} - \\dfrac{1}{x+2}$", "$\\dfrac{1}{x+2} - \\dfrac{1}{x+1}$"], ans: 0, why: "$x = -1$: $A = 1$; $x = -2$: $B = -1$." },
    { q: "Partial-fraction form of $\\dfrac{x + 5}{(x - 1)^2(x + 2)}$:", opts: ["$\\dfrac{A}{x-1} + \\dfrac{B}{x+2}$", "$\\dfrac{A}{x-1} + \\dfrac{B}{(x-1)^2} + \\dfrac{C}{x+2}$", "$\\dfrac{A}{(x-1)^2} + \\dfrac{B}{x+2}$", "$\\dfrac{Ax + B}{(x-1)^2}$"], ans: 1, why: "Repeated factor needs both powers." },
    { q: "$\\dfrac{x^2}{x^2 - 1}$ is:", opts: ["proper", "improper — divide first", "already partial", "undefined"], ans: 1, why: "Equal degrees." },
    { q: "In $\\dfrac{5x + 7}{(x+1)(x+3)} \\equiv \\dfrac{A}{x+1} + \\dfrac{B}{x+3}$, $A =$", opts: ["1", "4", "2", "$-1$"], ans: 0, why: "$x = -1$: $2 = 2A$." },
    { q: "For $\\dfrac{2x+1}{(x-3)^2} \\equiv \\dfrac{A}{x-3} + \\dfrac{B}{(x-3)^2}$, which substitution finds $B$ directly?", opts: ["$x = 0$", "$x = 3$", "$x = -3$", "$x = 1$"], ans: 1, why: "In $2x + 1 \\equiv A(x-3) + B$, $x = 3$ removes the $A$ term: $B = 7$." },
    { q: "$\\int \\dfrac{3}{x+2}\\,dx =$", opts: ["$3\\ln|x+2| + c$", "$\\dfrac{3}{(x+2)^2}$", "$\\ln|3x + 6|$", "$\\dfrac{-3}{x+2}$"], ans: 0, why: "Standard log integral." }
  ],
  exam: [
    { src: "Edexcel 2025 P1 Q7", q: "Given that $\\dfrac{2x^3 + 9x^2 + 12x + 7}{(x + 1)(x + 3)} \\equiv Ax + B + \\dfrac{C}{x + 1} + \\dfrac{D}{x + 3}$, find the values of the constants $A$, $B$, $C$ and $D$.", marks: 4,
      ms: ["M1: multiplies out: $2x^3 + 9x^2 + 12x + 7 \\equiv (Ax + B)(x^2 + 4x + 3) + C(x + 3) + D(x + 1)$", "A1: compares $x^3$: $A = 2$; $x^2$: $4A + B = 9 \\Rightarrow B = 1$", "M1: substitutes $x = -1$: $2 \\cdot(-1) + 9 - 12 + 7 = 2C \\Rightarrow C = 1$", "A1: $x = -3$: $-54 + 81 - 36 + 7 = -2D \\Rightarrow D = 1$"] },
    { src: "Edexcel Oct 2021 P1 Q9", ctx: "$f(x) = \\dfrac{3x + 4}{(1 - x)(1 + 2x)^2}$… express in partial fractions and expand.",
      parts: [
        { q: "Express $\\dfrac{3x + 4}{(1 - x)(1 + 2x)^2}$ in the form $\\dfrac{A}{1 - x} + \\dfrac{B}{1 + 2x} + \\dfrac{C}{(1 + 2x)^2}$.", marks: 4, ms: ["M1: $3x + 4 \\equiv A(1+2x)^2 + B(1-x)(1+2x) + C(1-x)$", "A1: $x = 1$: $7 = 9A \\Rightarrow A = \\tfrac79$", "A1: $x = -\\tfrac12$: $\\tfrac52 = \\tfrac32 C \\Rightarrow C = \\tfrac53$", "A1: compares $x^2$: $0 = 4A - 2B \\Rightarrow B = \\tfrac{14}{9}$"] },
        { q: "State the range of values of $x$ for which the binomial expansion of $f(x)$ is valid.", marks: 1, ms: ["B1: $|x| < \\tfrac12$"] }
      ] },
    { src: "Edexcel 2018 P1 Q11", ctx: "$f(x) = \\dfrac{4x + 6}{(x + 2)(x + 4)}$, $x > 0$.",
      parts: [
        { q: "Express $f(x)$ in partial fractions.", marks: 3, ms: ["M1: $4x + 6 \\equiv A(x+4) + B(x+2)$", "A1: $A = -1$ (from $x = -2$)", "A1: $B = 5$ (from $x = -4$): $f(x) = \\dfrac{-1}{x+2} + \\dfrac{5}{x+4}$"] },
        { q: "Hence find $f'(x)$ and prove that $f$ is a decreasing function for $x > 0$.", marks: 4, ms: ["M1: differentiates each term: $f'(x) = \\dfrac{1}{(x+2)^2} - \\dfrac{5}{(x+4)^2}$", "M1: combines over a common denominator: $\\dfrac{(x+4)^2 - 5(x+2)^2}{(x+2)^2(x+4)^2}$", "A1: numerator $= -4x^2 - 12x - 4 = -4(x^2 + 3x + 1)$", "A1: for $x > 0$, $x^2 + 3x + 1 > 0$ so the numerator is negative while the denominator is positive; hence $f'(x) < 0$ and $f$ is decreasing"] }
      ] }
  ]
});

X("maths:2.11", {
  flashcards: [
    ["A quadratic model $H = 5.85 - 0.05(x - 9)^2$ gives $H < 0$ for $x > 19.8$. What does this say about the model?", "It is only valid for $0 \\le x \\le 19.8$ — beyond the landing point the model has no meaning."],
    ["What is meant by a limitation of a model?", "A way in which the model's assumptions or predictions differ from reality — e.g. treating an object as a particle, ignoring air resistance, predicting negative values."],
    ["What is meant by a refinement of a model?", "A change that makes it more realistic, e.g. adding an air-resistance term or restricting the domain."],
    ["Linear model for CO₂ emissions predicts a negative value in 2050. Comment.", "Extrapolation far beyond the data is unreliable; emissions cannot be negative, so the model breaks down."],
    ["A tunnel is modelled by $y = 6 - 0.15x^2$. Does a coach 4 m wide and 4.2 m tall fit?", "At $x = 2$, $y = 5.4 > 4.2$, so yes — the edges of the coach clear the tunnel."],
    ["Why give the domain of a model?", "The model is only justified where data exists or the situation makes sense (e.g. $0 \\le t \\le 20$)."],
    ["Interpret the constant 100 in $P = 100 - 6.25(x - 9)^2$.", "The maximum profit (£10 000) achieved at the optimal price $x = 9$."],
    ["Give two assumptions in modelling a thrown ball with a quadratic.", "Air resistance is negligible; the ball is a particle; the ground is horizontal; $g$ is constant."]
  ],
  quiz: [
    { q: "A model gives a negative height for a ball. This indicates:", opts: ["a calculation error", "the model is outside its valid domain", "the ball went underground", "nothing"], ans: 1, why: "Physical impossibility marks the domain limit." },
    { q: "Ignoring air resistance in a projectile model is:", opts: ["a refinement", "an assumption / limitation", "a calculation", "an error"], ans: 1, why: "Simplifying assumption." },
    { q: "Using a model well beyond the data range is called:", opts: ["interpolation", "extrapolation", "refinement", "validation"], ans: 1, why: "Less reliable." },
    { q: "A refinement of a linear cooling model might be:", opts: ["dropping the data", "an exponential model approaching room temperature", "a larger gradient", "removing units"], ans: 1, why: "More realistic behaviour." },
    { q: "The quadratic model for a tunnel $y = 6 - 0.15x^2$ has a maximum height:", opts: ["0.15 m", "6 m", "4 m", "40 m"], ans: 1, why: "At $x = 0$." },
    { q: "Stating the domain $0 \\le t \\le 20$ of a model:", opts: ["is unnecessary", "shows where the model is justified", "changes the equation", "makes it exact"], ans: 1, why: "Validity." }
  ],
  exam: [
    { src: "Edexcel Specimen P1 Q6", ctx: "The cross-section of a tunnel is modelled by the curve $y = 5.4 - 0.15x^2$, where $x$ m is the horizontal distance from the centre line and $y$ m the height, for $-6 \\le x \\le 6$.",
      parts: [
        { q: "Find the width of the tunnel at ground level.", marks: 2, ms: ["M1: $5.4 - 0.15x^2 = 0 \\Rightarrow x^2 = 36$", "A1: width $12$ m"] },
        { q: "A coach is 2.6 m wide and 4.5 m high. Determine, with a reason, whether the coach can pass through the centre of the tunnel.", marks: 3, ms: ["M1: height at the coach's edge $x = 1.3$: $y = 5.4 - 0.15(1.69)$", "A1: $y = 5.15$ m", "A1: $5.15 > 4.5$ so the coach fits (with reasoning about the edges)"] },
        { q: "State one limitation of the model.", marks: 1, ms: ["B1: e.g. a real tunnel is not exactly parabolic / the walls may be vertical near the ground / the model ignores the road surface"] }
      ] },
    { level: "AS", src: "Edexcel AS 2019 P1 Q9", ctx: "The total mass of tin, $T$ tonnes, mined from a mine after $n$ years is modelled by $T = 1200 - 3(n - 20)^2$, $0 \\le n \\le 20$.",
      parts: [
        { q: "Find the total mass of tin mined in the first 10 years.", marks: 2, ms: ["M1: $T(10) = 1200 - 300$", "A1: 900 tonnes"] },
        { q: "State, with a reason, the maximum total mass of tin the model predicts.", marks: 2, ms: ["B1: 1200 tonnes", "B1: at $n = 20$ the completed-square term is zero, so the total stops increasing"] },
        { q: "Give one reason why the model is restricted to $n \\le 20$.", marks: 1, ms: ["B1: for $n > 20$ the model would predict the total mass decreasing, which is impossible"] }
      ] }
  ]
});

X("maths:3.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Straight lines — perpendiculars and linear models" },
    "AS questions: **equation through two points** (then \"give in the form $ax + by + c = 0$ with integers\"), **perpendicular** to a given line through a point, the **area of a triangle** formed with the axes (exact, often with surds), and **linear models** from two data points — tree height, CO₂ emissions, fuel remaining, a leaking tank: find $m$ and $c$, **interpret the gradient with units** (\"the height increases by 0.35 m per year\"), **evaluate** a prediction and **comment on reliability** (extrapolation; the model predicts a negative value).",
    { callout: { t: "memorise", body: "Gradient $m = \\dfrac{y_2 - y_1}{x_2 - x_1}$ · $y - y_1 = m(x - x_1)$ · perpendicular gradient $-\\dfrac1m$ · distance $\\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$ · midpoint $\\left(\\dfrac{x_1+x_2}{2}, \\dfrac{y_1+y_2}{2}\\right)$." }}
  ],
  flashcards: [
    ["Equation of the line through $(2, -1)$ and $(6, 7)$ in the form $ax + by + c = 0$?", "$m = 2$: $y + 1 = 2(x - 2) \\Rightarrow 2x - y - 5 = 0$."],
    ["Line perpendicular to $3x + 2y = 6$ through $(4, 1)$?", "Gradient of given line $-\\tfrac32$, so perpendicular $\\tfrac23$: $y - 1 = \\tfrac23(x - 4) \\Rightarrow 2x - 3y - 5 = 0$."],
    ["Are $2x + 3y = 7$ and $3x - 2y = 1$ parallel, perpendicular or neither?", "Gradients $-\\tfrac23$ and $\\tfrac32$: product $-1$, perpendicular."],
    ["Distance between $(1, 2)$ and $(7, 10)$?", "$\\sqrt{36 + 64} = 10$."],
    ["A tree is 1.4 m tall at age 2 and 3.5 m at age 8. Linear model?", "$m = \\tfrac{2.1}{6} = 0.35$: $h = 0.35t + 0.7$; the gradient is the growth rate 0.35 m per year."],
    ["Interpret $c$ in a linear model $V = 250 - 12t$ for fuel remaining.", "250 litres was the fuel at the start ($t = 0$); fuel falls by 12 litres per unit time."],
    ["Area of the triangle formed by $2x + 3y = 12$ and the axes?", "Intercepts $(6, 0)$, $(0, 4)$: area $12$."],
    ["Where does $y = 2x + 3$ meet $y = -\\tfrac12 x + 8$?", "$2x + 3 = -\\tfrac12 x + 8 \\Rightarrow x = 2$, point $(2, 7)$."]
  ],
  quiz: [
    { q: "Gradient of the line through $(-1, 4)$ and $(3, -2)$:", opts: ["$-\\tfrac32$", "$\\tfrac32$", "$-\\tfrac23$", "$3$"], ans: 0, why: "$\\dfrac{-6}{4}$." },
    { q: "Perpendicular gradient to $\\tfrac45$:", opts: ["$-\\tfrac45$", "$\\tfrac54$", "$-\\tfrac54$", "$\\tfrac45$"], ans: 2, why: "Negative reciprocal." },
    { q: "$3x - 4y + 8 = 0$ has gradient:", opts: ["$3$", "$\\tfrac34$", "$-\\tfrac34$", "$-\\tfrac43$"], ans: 1, why: "$y = \\tfrac34 x + 2$." },
    { q: "Midpoint of $(2, 5)$ and $(-4, 1)$:", opts: ["$(-1, 3)$", "$(3, 2)$", "$(-2, 4)$", "$(1, 3)$"], ans: 0, why: "Average coordinates." },
    { q: "In $C = 40 + 0.06t$ (cost in £ against minutes), 0.06 is:", opts: ["the fixed charge", "the cost per minute", "the total cost", "the number of minutes"], ans: 1, why: "Gradient = rate." },
    { q: "A linear model predicting negative CO₂ emissions in 2060 suggests:", opts: ["emissions will be negative", "the model is not valid far outside the data", "the gradient is wrong", "nothing"], ans: 1, why: "Extrapolation limit." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2023 P1 Q10", ctx: "The line $l_1$ has equation $2x + 3y = 24$ and crosses the $x$-axis at $A$ and the $y$-axis at $B$. The line $l_2$ is perpendicular to $l_1$ and passes through $B$. $l_2$ crosses the $x$-axis at $C$.",
      parts: [
        { q: "Find the coordinates of $A$ and $B$.", marks: 2, ms: ["B1: $A(12, 0)$", "B1: $B(0, 8)$"] },
        { q: "Find an equation for $l_2$, giving your answer in the form $ax + by + c = 0$ where $a$, $b$, $c$ are integers.", marks: 3, ms: ["M1: gradient of $l_1$ is $-\\tfrac23$, so $l_2$ has gradient $\\tfrac32$", "M1: $y - 8 = \\tfrac32 x$", "A1: $3x - 2y + 16 = 0$"] },
        { q: "Find the exact area of triangle $ABC$.", marks: 3, ms: ["M1: $C$ at $y = 0$: $x = -\\tfrac{16}{3}$", "M1: base $AC = 12 + \\tfrac{16}{3} = \\tfrac{52}{3}$, height 8", "A1: area $= \\tfrac12 \\times \\tfrac{52}{3} \\times 8 = \\tfrac{208}{3}$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2023 P1 Q7", ctx: "A car's fuel tank holds $V$ litres after it has travelled $d$ km. When $d = 40$, $V = 45$; when $d = 160$, $V = 36$. A linear model $V = ad + b$ is proposed.",
      parts: [
        { q: "Find the values of $a$ and $b$.", marks: 3, ms: ["M1: $a = \\dfrac{36 - 45}{160 - 40}$", "A1: $a = -0.075$", "A1: $b = 48$"] },
        { q: "Interpret the value of $a$ in context.", marks: 1, ms: ["B1: the car uses 0.075 litres of fuel per km (fuel decreases by 0.075 litres for each km travelled)"] },
        { q: "Use the model to find the distance the car can travel before the tank is empty, and comment on the reliability of this estimate.", marks: 2, ms: ["M1: $0 = 48 - 0.075d \\Rightarrow d = 640$ km", "B1: unreliable — it is an extrapolation well beyond the data ($d \\le 160$); consumption may not stay constant"] }
      ] },
    { level: "AS", src: "Edexcel AS 2018 P1 Q4", q: "The line $l_1$ has equation $4x - 3y + 5 = 0$. The line $l_2$ passes through the points $(3, 1)$ and $(9, 9)$. Determine whether $l_1$ and $l_2$ are parallel, perpendicular or neither, showing your working.", marks: 4,
      ms: ["M1: gradient of $l_1$: $y = \\tfrac43 x + \\tfrac53$, so $\\tfrac43$", "M1: gradient of $l_2$: $\\dfrac{9 - 1}{9 - 3} = \\tfrac43$", "A1: gradients equal", "A1: parallel (and not the same line since $(3,1)$ does not satisfy $l_1$: $12 - 3 + 5 \\ne 0$)"] },
    { level: "AS", src: "Edexcel AS Specimen P1 Q3", ctx: "A tank is leaking. The volume $V$ litres of water in the tank after $t$ minutes is modelled by a linear equation. After 10 minutes there are 450 litres; after 25 minutes there are 375 litres.",
      parts: [
        { q: "Find a linear model for $V$ in terms of $t$.", marks: 3, ms: ["M1: gradient $\\dfrac{375 - 450}{25 - 10} = -5$", "M1: $V - 450 = -5(t - 10)$", "A1: $V = 500 - 5t$"] },
        { q: "State the initial volume of water and the time taken for the tank to empty.", marks: 2, ms: ["B1: 500 litres", "B1: 100 minutes"] },
        { q: "Give one reason why the model may not be accurate.", marks: 1, ms: ["B1: e.g. the leak rate may change as the water level (pressure) falls, so the relationship is unlikely to stay linear"] }
      ] }
  ]
});

X("maths:3.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Circles — every AS and A-level paper" },
    { table: { head: ["Part", "Method"], rows: [
      ["Centre and radius from $x^2 + y^2 + 2gx + 2fy + c = 0$", "Complete the square in $x$ and $y$: centre $(-g, -f)$, $r = \\sqrt{g^2 + f^2 - c}$ (radius as a simplified surd)"],
      ["Tangent at a point $P$", "Gradient of the radius $CP$, then the perpendicular gradient; equation through $P$"],
      ["Line $y = kx$ (or $y = k$, $x = k$) meets the circle at two points", "Substitute, collect a quadratic, **discriminant $> 0$**, solve for $k$"],
      ["Circle entirely in a quadrant / does not cut an axis", "Distance from the centre to the axis exceeds $r$: e.g. centre $(a, b)$ does not cut the $x$-axis when $|b| > r$"],
      ["Is a point inside the circle?", "Compare its distance from the centre with $r$"],
      ["Two circles intersect at two points", "$|r_1 - r_2| < d < r_1 + r_2$ where $d$ is the distance between centres"],
      ["Angle in a semicircle / perpendicular bisector of a chord", "Circle theorems: the perpendicular from the centre bisects a chord; the angle in a semicircle is $90°$; the tangent is perpendicular to the radius"]
    ]}}
  ],
  flashcards: [
    ["Centre and radius of $x^2 + y^2 - 6x + 4y - 12 = 0$?", "$(x-3)^2 + (y+2)^2 = 25$: centre $(3, -2)$, radius 5."],
    ["Tangent to $(x-1)^2 + (y-2)^2 = 25$ at $(4, 6)$?", "Radius gradient $\\tfrac43$, tangent gradient $-\\tfrac34$: $y - 6 = -\\tfrac34(x - 4) \\Rightarrow 3x + 4y = 36$."],
    ["Is $(0, 0)$ inside $(x-2)^2 + (y+1)^2 = 8$?", "Distance$^2$ from centre $= 4 + 1 = 5 < 8$, so inside."],
    ["Circle centre $(5, -3)$ does not cut the $x$-axis. Condition on $r$?", "$r < 3$."],
    ["Line $y = k$ cuts $x^2 + y^2 - 4x - 2y - 4 = 0$ at two points. Range of $k$?", "Centre $(2, 1)$, $r = 3$: $-2 < k < 4$."],
    ["Equation of the circle with diameter endpoints $(1, 2)$ and $(7, 10)$?", "Centre $(4, 6)$, radius 5: $(x-4)^2 + (y-6)^2 = 25$."],
    ["Shortest distance from $(7, 8)$ to the circle centre $(1, 0)$, radius 4?", "Distance to centre $10$, minus $r$: 6."],
    ["Two circles with radii 3 and $k$, centres 5 apart, intersect at two points. Range of $k$?", "$|3 - k| < 5 < 3 + k \\Rightarrow 2 < k < 8$."],
    ["Circle through $(0, 0)$ with centre $(3, 4)$: equation?", "$r = 5$: $(x-3)^2 + (y-4)^2 = 25$."],
    ["$y = mx$ is a tangent to $(x - 4)^2 + y^2 = 4$. Find $m$.", "$(1 + m^2)x^2 - 8x + 12 = 0$, discriminant zero: $64 = 48(1 + m^2) \\Rightarrow m = \\pm\\dfrac{1}{\\sqrt3}$."]
  ],
  quiz: [
    { q: "Centre of $x^2 + y^2 + 8x - 2y + 1 = 0$:", opts: ["$(4, -1)$", "$(-4, 1)$", "$(8, -2)$", "$(-8, 2)$"], ans: 1, why: "Half the coefficients, sign changed." },
    { q: "Radius of $(x+1)^2 + (y-3)^2 = 18$ as a surd:", opts: ["$9\\sqrt2$", "$3\\sqrt2$", "$2\\sqrt3$", "$18$"], ans: 1, why: "$\\sqrt{18}$." },
    { q: "The tangent at a point on a circle is:", opts: ["parallel to the radius", "perpendicular to the radius", "through the centre", "horizontal"], ans: 1, why: "Circle theorem." },
    { q: "A circle with centre $(2, 5)$ and radius 4 crosses:", opts: ["the $x$-axis only", "the $y$-axis only", "both axes", "neither axis"], ans: 1, why: "Distance to the $y$-axis is $2 < 4$ (crosses); distance to the $x$-axis is $5 > 4$ (misses)." },
    { q: "Point $(5, 5)$ relative to $(x-1)^2 + (y-2)^2 = 16$:", opts: ["inside", "on", "outside", "at the centre"], ans: 2, why: "$16 + 9 = 25 > 16$." },
    { q: "Circles of radius 2 and 3 with centres 6 apart:", opts: ["intersect twice", "touch", "do not meet", "coincide"], ans: 2, why: "$6 > 2 + 3$." }
  ],
  exam: [
    { src: "Edexcel 2025 P1 Q2", ctx: "The circle $C$ has equation $x^2 + y^2 - 10x + 6y + 14 = 0$.",
      parts: [
        { q: "Find the coordinates of the centre of $C$ and the radius, giving the radius as a simplified surd.", marks: 3, ms: ["M1: $(x-5)^2 + (y+3)^2 = 25 + 9 - 14$", "A1: centre $(5, -3)$", "A1: $r = \\sqrt{20} = 2\\sqrt5$"] },
        { q: "Determine whether the origin lies inside, on or outside $C$.", marks: 2, ms: ["M1: distance$^2$ from centre to origin $= 25 + 9 = 34$ compared with $r^2 = 20$", "A1: $34 > 20$ so the origin is outside $C$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2025 P1 Q4", ctx: "The circle $C$ has equation $x^2 + y^2 - 4x + 6y - 3 = 0$.",
      parts: [
        { q: "Find the centre and radius of $C$.", marks: 3, ms: ["M1: completes the square", "A1: centre $(2, -3)$", "A1: $r = 4$"] },
        { q: "The line $y = k$ meets $C$ at two distinct points. Find the range of possible values of $k$.", marks: 3, ms: ["M1: horizontal line within $r$ of the centre: $|k + 3| < 4$", "A1: $-7 < k$", "A1: $-7 < k < 1$"] }
      ] },
    { src: "Edexcel 2018 P2 Q6", ctx: "The circle $C$ has centre $(a, 3)$ and passes through $P(2, 5)$. The line $y = 2x + 1$ is a tangent to $C$ at $P$.",
      parts: [
        { q: "Show that $a = 6$.", marks: 3, ms: ["M1: radius $CP$ is perpendicular to the tangent, so has gradient $-\\tfrac12$", "M1: $\\dfrac{5 - 3}{2 - a} = -\\tfrac12$", "A1: $2 - a = -4 \\Rightarrow a = 6$"] },
        { q: "Find the equation of $C$.", marks: 2, ms: ["M1: $r^2 = (6-2)^2 + (3-5)^2 = 20$", "A1: $(x-6)^2 + (y-3)^2 = 20$"] },
        { q: "The line $y = 2x + k$, $k \\ne 1$, is also a tangent to $C$. Find $k$.", marks: 3, ms: ["M1: the second tangent parallel to the first touches at the diametrically opposite point $(10, 1)$", "M1: $1 = 20 + k$", "A1: $k = -19$"] }
      ] },
    { src: "Edexcel 2024 P1 Q14", ctx: "The circle $C_1$ has equation $x^2 + y^2 - 2x - 8y + 8 = 0$. The circle $C_2$ has centre $(7, 12)$ and radius $k$.",
      parts: [
        { q: "Find the centre and radius of $C_1$.", marks: 2, ms: ["B1: centre $(1, 4)$", "B1: radius 3"] },
        { q: "Given that $C_1$ and $C_2$ intersect at two distinct points, find the range of possible values of $k$.", marks: 4, ms: ["M1: distance between centres $\\sqrt{36 + 64} = 10$", "M1: two intersections when $|k - 3| < 10 < k + 3$", "A1: $k > 7$", "A1: $7 < k < 13$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2020 P1 Q11", ctx: "The circle $C$ has centre $(6, -5)$ and the point $P(3, -1)$ lies on $C$.",
      parts: [
        { q: "Find the equation of the tangent to $C$ at $P$, giving your answer in the form $ax + by + c = 0$.", marks: 4, ms: ["M1: gradient of radius $\\dfrac{-1 + 5}{3 - 6} = -\\tfrac43$", "M1: tangent gradient $\\tfrac34$", "M1: $y + 1 = \\tfrac34(x - 3)$", "A1: $3x - 4y - 13 = 0$"] },
        { q: "A second circle has centre $(6, -5)$ and radius $k$ and lies entirely in the fourth quadrant. Find the range of possible values of $k$.", marks: 2, ms: ["M1: must not reach the $y$-axis (distance 6) or the $x$-axis (distance 5)", "A1: $0 < k < 5$"] }
      ] }
  ]
});

X("maths:3.3", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Parametric equations — Cartesian conversion and calculus" },
    "**Convert to Cartesian**: eliminate $t$ by substitution ($x = t^2 - 2 \\Rightarrow t = \\ldots$), or by an identity — $x = 3 + 2\\sin t$, $y = 4 + 2\\cos 2t$ needs $\\cos 2t = 1 - 2\\sin^2 t$ giving $y = 6 - (x - 3)^2$; $x = 4\\cos(t + \\tfrac\\pi6)$, $y = 2\\sin t$ needs the addition formula; a rational pair in $t^2$ often satisfies a circle. **Gradient**: $\\dfrac{dy}{dx} = \\dfrac{dy/dt}{dx/dt}$ then the tangent or normal at the point with a given $t$. **Domain / range**: state the restriction on $x$ or $y$ that the parameter imposes (e.g. $-1 \\le \\sin t \\le 1$ gives $1 \\le x \\le 5$).",
    { callout: { t: "warn", body: "After converting, **state the domain** of the Cartesian equation from the parameter's range — it is a separate mark and the model question (\"a dam / a stage\") depends on it." }}
  ],
  flashcards: [
    ["Convert $x = 2t + 1$, $y = t^2 - 3$ to Cartesian form.", "$t = \\dfrac{x - 1}{2}$: $y = \\dfrac{(x-1)^2}{4} - 3$."],
    ["Convert $x = 3 + 2\\sin t$, $y = 4 + 2\\cos 2t$.", "$\\sin t = \\dfrac{x-3}{2}$, $\\cos 2t = 1 - 2\\sin^2 t = 1 - \\dfrac{(x-3)^2}{2}$: $y = 6 - (x-3)^2$, for $1 \\le x \\le 5$."],
    ["Convert $x = 3\\cos\\theta$, $y = 3\\sin\\theta$.", "$x^2 + y^2 = 9$."],
    ["Gradient of $x = t^2$, $y = t^3 - 3t$ at $t = 2$?", "$\\dfrac{dy}{dx} = \\dfrac{3t^2 - 3}{2t} = \\dfrac{9}{4}$."],
    ["Domain of the Cartesian curve from $x = 2\\sin t$, $y = \\cos 2t$?", "$-2 \\le x \\le 2$."],
    ["Convert $x = \\tan\\theta$, $y = \\sec^2\\theta$.", "$y = 1 + x^2$."],
    ["Point on $x = t^2 - 4$, $y = 6\\ln(t + 3)$ where $t = 1$?", "$(-3, 6\\ln 4)$."],
    ["How do you find where a parametric curve crosses the $x$-axis?", "Solve $y(t) = 0$ for $t$, then substitute into $x(t)$."],
    ["Convert $x = \\dfrac{2t}{1 + t^2}$, $y = \\dfrac{1 - t^2}{1 + t^2}$.", "$x^2 + y^2 = \\dfrac{4t^2 + 1 - 2t^2 + t^4}{(1+t^2)^2} = 1$: the unit circle."],
    ["Tangent to $x = t^2$, $y = 2t$ at $t = 3$?", "$\\dfrac{dy}{dx} = \\dfrac{2}{2t} = \\tfrac13$ at $(9, 6)$: $y - 6 = \\tfrac13(x - 9)$."]
  ],
  quiz: [
    { q: "$x = t + 1$, $y = t^2$ is the parabola:", opts: ["$y = x^2 + 1$", "$y = (x - 1)^2$", "$y = (x + 1)^2$", "$y = x^2 - 1$"], ans: 1, why: "$t = x - 1$." },
    { q: "$\\dfrac{dy}{dx}$ for a parametric curve equals:", opts: ["$\\dfrac{dx/dt}{dy/dt}$", "$\\dfrac{dy/dt}{dx/dt}$", "$\\dfrac{dy}{dt} \\cdot \\dfrac{dx}{dt}$", "$\\dfrac{dy}{dt}$"], ans: 1, why: "Chain rule." },
    { q: "$x = 2\\cos t$, $y = 3\\sin t$ describes:", opts: ["a circle", "an ellipse $\\dfrac{x^2}{4} + \\dfrac{y^2}{9} = 1$", "a parabola", "a line"], ans: 1, why: "$\\cos^2 + \\sin^2 = 1$." },
    { q: "Range of $x = 4 + 3\\cos t$:", opts: ["$-3 \\le x \\le 3$", "$1 \\le x \\le 7$", "$4 \\le x \\le 7$", "all real"], ans: 1, why: "$-1 \\le \\cos t \\le 1$." },
    { q: "To eliminate $t$ from $x = \\sin t$, $y = \\cos 2t$ use:", opts: ["$\\cos 2t = 2\\cos^2 t - 1$", "$\\cos 2t = 1 - 2\\sin^2 t$", "$\\sin 2t = 2\\sin t\\cos t$", "$\\tan t = \\sin t / \\cos t$"], ans: 1, why: "Express in $\\sin t = x$." },
    { q: "At $t = 0$ the curve $x = t^2 - 1$, $y = t^3 - t$ is at:", opts: ["$(0, 0)$", "$(-1, 0)$", "$(1, 0)$", "$(-1, -1)$"], ans: 1, why: "Substitute." }
  ],
  exam: [
    { src: "Edexcel 2018 P2 Q14", ctx: "The curve $C$ has parametric equations $x = 3 + 2\\sin t$, $y = 4 + 2\\cos 2t$, $0 \\le t < 2\\pi$.",
      parts: [
        { q: "Show that all points on $C$ satisfy $y = 6 - (x - 3)^2$.", marks: 3, ms: ["M1: $\\cos 2t = 1 - 2\\sin^2 t$", "M1: $\\sin t = \\dfrac{x-3}{2}$ substituted", "A1: $y = 4 + 2 - (x-3)^2 = 6 - (x-3)^2$ (cso)"] },
        { q: "State the domain of $x$ for which the Cartesian equation applies.", marks: 1, ms: ["B1: $1 \\le x \\le 5$"] },
        { q: "The line $y = k$ meets $C$ at exactly two points. Find the range of $k$.", marks: 2, ms: ["M1: vertex $(3, 6)$; at the ends $x = 1, 5$ the curve has $y = 2$", "A1: $2 \\le k < 6$"] }
      ] },
    { src: "Edexcel 2025 P1 Q5", ctx: "The curve $C$ has parametric equations $x = \\dfrac{4}{t + 1}$, $y = 5(t + 2)^4$, $t > -1$. The point $P$ on $C$ has $x$-coordinate 1.",
      parts: [
        { q: "Find the $y$-coordinate of $P$.", marks: 2, ms: ["M1: $\\dfrac{4}{t+1} = 1 \\Rightarrow t = 3$", "A1: $y = 5 \\times 625 = 3125$"] },
        { q: "Find a Cartesian equation of $C$ in the form $y = f(x)$.", marks: 3, ms: ["M1: $t + 1 = \\dfrac4x \\Rightarrow t + 2 = \\dfrac4x + 1 = \\dfrac{4 + x}{x}$", "A1: $y = 5\\left(\\dfrac{4 + x}{x}\\right)^4$", "B1: domain $x > 0$"] },
        { q: "Find the gradient of $C$ at $P$.", marks: 3, ms: ["M1: $\\dfrac{dx}{dt} = -\\dfrac{4}{(t+1)^2}$, $\\dfrac{dy}{dt} = 20(t+2)^3$", "M1: $\\dfrac{dy}{dx} = \\dfrac{20(t+2)^3}{-4/(t+1)^2}$ at $t = 3$", "A1: $\\dfrac{20 \\times 125}{-4/16} = -10000$"] }
      ] },
    { src: "Edexcel Oct 2021 P1 Q13", q: "The curve $C$ has parametric equations $x = \\dfrac{4(1 - t^2)}{1 + t^2}$, $y = \\dfrac{8t}{1 + t^2}$. Show that all points on $C$ satisfy $x^2 + y^2 = 16$.", marks: 3,
      ms: ["M1: $x^2 + y^2 = \\dfrac{16(1 - t^2)^2 + 64t^2}{(1+t^2)^2}$", "M1: numerator $16(1 - 2t^2 + t^4) + 64t^2 = 16(t^4 + 2t^2 + 1) = 16(1+t^2)^2$", "A1: $x^2 + y^2 = 16$ (cso)"] },
    { src: "Edexcel 2023 P1 Q9", ctx: "The curve $C$ has parametric equations $x = t^2 + 6t + 5$, $y = 6\\ln(t + 3)$, $t > -3$.",
      parts: [
        { q: "Show that a Cartesian equation of $C$ can be written as $y = A\\ln(x + B)$, where $A$ and $B$ are constants to be found, and state the domain of $x$.", marks: 4, ms: ["M1: $x = (t + 3)^2 - 4$", "M1: $t + 3 = \\sqrt{x + 4}$ (positive root since $t + 3 > 0$)", "A1: $y = 6\\ln\\sqrt{x + 4} = 3\\ln(x + 4)$, so $A = 3$, $B = 4$", "B1: $x > -4$"] },
        { q: "Find the equation of the tangent to $C$ at the point where $t = 1$, giving your answer in the form $y = mx + c$ with exact constants.", marks: 4, ms: ["M1: $\\dfrac{dx}{dt} = 2t + 6$, $\\dfrac{dy}{dt} = \\dfrac{6}{t+3}$", "A1: at $t = 1$: $\\dfrac{dy}{dx} = \\dfrac{6/4}{8} = \\tfrac{3}{16}$", "M1: point $(12, 6\\ln 4)$", "A1: $y = \\tfrac{3}{16}x - \\tfrac94 + 6\\ln 4$ (accept $12\\ln 2$)"] }
      ] }
  ]
});

X("maths:3.4", {
  flashcards: [
    ["A dam's curved wall is $x = 6\\sin t$, $y = 5\\sin 2t$, $0 \\le t \\le \\tfrac\\pi2$. Where does it meet the $x$-axis?", "$y = 0 \\Rightarrow \\sin 2t = 0 \\Rightarrow t = 0, \\tfrac\\pi2$: $x = 0$ and $x = 6$."],
    ["Why use parametric equations in a model?", "The parameter (often time) drives both coordinates; motion, curves that fail the vertical-line test, and shapes like ellipses are easier to express."],
    ["Parametric area formula?", "$\\int y\\,dx = \\int y \\dfrac{dx}{dt}\\,dt$ with $t$-limits."],
    ["A projectile has $x = 20t$, $y = 15t - 5t^2$. Find the Cartesian path.", "$t = \\dfrac{x}{20}$: $y = \\dfrac{3x}{4} - \\dfrac{x^2}{80}$."],
    ["Range of the projectile $x = 20t$, $y = 15t - 5t^2$?", "$y = 0 \\Rightarrow t = 3$: $x = 60$."],
    ["Greatest height of a parametric path $y = 15t - 5t^2$?", "$\\dfrac{dy}{dt} = 15 - 10t = 0 \\Rightarrow t = 1.5$, $y = 11.25$."],
    ["A curve $x = 4\\cos t$, $y = 3\\sin t$ models a running track. Its Cartesian form and shape?", "$\\dfrac{x^2}{16} + \\dfrac{y^2}{9} = 1$ — an ellipse."],
    ["What does $t$ often represent in a parametric model, and what limitation follows?", "Time; the model applies only for the stated interval of $t$ (e.g. until the object lands)."]
  ],
  quiz: [
    { q: "A parametric model $x = 3t$, $y = 4t - t^2$ hits the ground ($y = 0$) at $t =$", opts: ["0 only", "4", "2", "3"], ans: 1, why: "$t(4 - t) = 0$." },
    { q: "The parametric area under a curve is:", opts: ["$\\int x\\,dy$", "$\\int y \\dfrac{dx}{dt} dt$", "$\\int y\\,dt$", "$\\int \\dfrac{dy}{dt} dx$"], ans: 1, why: "Substitution $dx = \\dfrac{dx}{dt}dt$." },
    { q: "$x = 5\\cos t$, $y = 5\\sin t$, $0 \\le t \\le \\pi$ models:", opts: ["a full circle", "an upper semicircle of radius 5", "a line", "a parabola"], ans: 1, why: "$y \\ge 0$." },
    { q: "In $x = 20t$, $y = 15t - 5t^2$, the constant 20 represents:", opts: ["the height", "the horizontal speed", "the range", "time"], ans: 1, why: "$dx/dt$." },
    { q: "A parametric model of a Ferris-wheel seat uses $t$ as:", opts: ["radius", "time", "height", "angle only"], ans: 1, why: "Position depends on time." },
    { q: "Domain restriction for the dam model $x = 6\\sin t$, $0 \\le t \\le \\tfrac\\pi2$:", opts: ["$-6 \\le x \\le 6$", "$0 \\le x \\le 6$", "$x \\ge 0$", "all $x$"], ans: 1, why: "$\\sin t$ from 0 to 1." }
  ],
  exam: [
    { src: "Edexcel Oct 2020 P2 Q12", ctx: "The curved edge of a dam is modelled by the curve $C$ with parametric equations $x = 6\\sin t$, $y = 5\\sin 2t$, $0 \\le t \\le \\tfrac\\pi2$, where $x$ and $y$ are in metres. The region $R$ is bounded by $C$ and the $x$-axis.",
      parts: [
        { q: "Show that the area of $R$ is given by $\\displaystyle\\int_0^{\\pi/2} 60\\sin t\\cos^2 t\\,dt$.", marks: 3, ms: ["M1: $\\dfrac{dx}{dt} = 6\\cos t$ and area $= \\int y\\,\\dfrac{dx}{dt}dt$", "M1: $\\sin 2t = 2\\sin t\\cos t$", "A1: $\\int_0^{\\pi/2} 5 \\cdot 2\\sin t\\cos t \\cdot 6\\cos t\\,dt = \\int_0^{\\pi/2} 60\\sin t\\cos^2 t\\,dt$ (cso)"] },
        { q: "Hence find the exact area of $R$.", marks: 3, ms: ["M1: integrates to $-20\\cos^3 t$", "M1: evaluates between 0 and $\\tfrac\\pi2$", "A1: $20$ m²"] },
        { q: "Find the maximum height of the dam wall according to the model.", marks: 2, ms: ["M1: $y = 5\\sin 2t$ is greatest when $\\sin 2t = 1$", "A1: 5 m (at $x = 6\\sin\\tfrac\\pi4 = 3\\sqrt2$)"] }
      ] },
    { src: "Edexcel 2024 P2 Q10", ctx: "The path of a ball is modelled by $x = 12t$, $y = 16t - 5t^2$, $t \\ge 0$, where $x$ and $y$ are horizontal and vertical distances in metres from the point of projection and $t$ is time in seconds.",
      parts: [
        { q: "Find the greatest height reached by the ball.", marks: 3, ms: ["M1: $\\dfrac{dy}{dt} = 16 - 10t = 0$", "A1: $t = 1.6$", "A1: $y = 25.6 - 12.8 = 12.8$ m"] },
        { q: "Find the equation of the tangent to the path at the point where $t = 1$, using parametric differentiation.", marks: 3, ms: ["M1: $\\dfrac{dy}{dx} = \\dfrac{16 - 10t}{12}$", "A1: at $t = 1$: gradient $\\tfrac12$, point $(12, 11)$", "A1: $y - 11 = \\tfrac12(x - 12)$, i.e. $y = \\tfrac12 x + 5$"] },
        { q: "Find the horizontal distance travelled when the ball returns to its initial height.", marks: 2, ms: ["M1: $16t - 5t^2 = 0 \\Rightarrow t = 3.2$", "A1: $x = 38.4$ m"] }
      ] }
  ]
});

})(KOS.content.extend);
