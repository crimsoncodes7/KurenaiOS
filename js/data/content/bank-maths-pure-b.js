/* Kurenai OS — past-paper bank: Edexcel 9MA0/8MA0 Pure, topics 4–6
   (sequences and series, trigonometry, exponentials and logarithms).
   Modelled on Pure Papers 1 & 2 and AS Paper 1, June 2018–2025 plus the
   Specimen. Edexcel M1/A1/B1 mark conventions. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (X) {

X("maths:4.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Binomial expansion — positive integer $n$ (AS) and rational $n$ (A-level)" },
    "**AS**: expand $(2 - x)^9$ or $(2 + \\tfrac34 x)^5$ to the first three or four terms in ascending powers — **take out the 2** correctly or use $\\binom{n}{r}a^{n-r}b^r$ with the powers of 2; find a **constant** from a given coefficient (\"the coefficient of $x^3$ is three times the coefficient of $x$\"); find the coefficient of $x^2$ in a **product** $(a + bx)(\\ldots)$ — two cross terms; use $x = 0.01$ to **estimate** $1.92^5$. **A-level**: $(1 + 8x)^{1/2}$, $(9 - x)^{1/2}$, $(4 + 5x)^{1/2}$, $(1 + 9x)^{-2}$ — **take out the constant** to get $(1 + \\ldots)^n$, expand to $x^2$ or $x^3$, state the **validity** $|x| < \\tfrac{a}{b}$, then **substitute a small $x$** to approximate $\\sqrt 2$, $\\sqrt 5$ or $\\sqrt 6$, and say why a proposed $x$ is **invalid** (outside the range) or whether the estimate is an **over/under-estimate** (sign of the first omitted term).",
    { callout: { t: "memorise", body: "$(1 + x)^n = 1 + nx + \\dfrac{n(n-1)}{2!}x^2 + \\dfrac{n(n-1)(n-2)}{3!}x^3 + \\ldots$, valid for $|x| < 1$. For $(a + bx)^n$ write $a^n\\left(1 + \\dfrac{b}{a}x\\right)^n$, valid for $|x| < \\left|\\dfrac ab\\right|$." }}
  ],
  flashcards: [
    ["Expand $(2 - x)^9$ up to the $x^2$ term.", "$512 - 9 \\cdot 256 x + 36 \\cdot 128 x^2 = 512 - 2304x + 4608x^2$."],
    ["Coefficient of $x^3$ in $(1 + kx)^{10}$?", "$\\binom{10}{3}k^3 = 120k^3$."],
    ["$(1 + kx)^{10}$: the $x^3$ coefficient is three times the $x$ coefficient. Find $k$.", "$120k^3 = 30k \\Rightarrow k^2 = \\tfrac14 \\Rightarrow k = \\pm\\tfrac12$ ($k \\ne 0$)."],
    ["Expand $(1 + 8x)^{1/2}$ to the $x^2$ term and state the validity.", "$1 + 4x - 8x^2 + \\ldots$, valid for $|x| < \\tfrac18$."],
    ["Expand $(9 - x)^{1/2}$ to the $x^2$ term.", "$3\\left(1 - \\dfrac{x}{9}\\right)^{1/2} = 3 - \\dfrac{x}{6} - \\dfrac{x^2}{216} + \\ldots$, $|x| < 9$."],
    ["Using $(9 - x)^{1/2}$ with $x = 1$, estimate $\\sqrt 8$ and say whether it is an over- or under-estimate.", "$3 - \\tfrac16 - \\tfrac{1}{216} \\approx 2.8287$; the next term is negative so it is an overestimate ($\\sqrt8 = 2.8284$)."],
    ["Expand $(1 + 9x)^{-2}$ to the $x^2$ term; why is $x = 0.2$ invalid?", "$1 - 18x + 243x^2 + \\ldots$; valid only for $|x| < \\tfrac19$, and $0.2 > \\tfrac19$."],
    ["Coefficient of $x^2$ in $(3 + 2x)(1 - 4x + 10x^2)$?", "$3 \\times 10 + 2 \\times(-4) = 22$."],
    ["Why substitute $x = 0.01$ into $(2 + \\tfrac34 x)^5$ to estimate $2.0075^5$… what value estimates $1.92^5$?", "$x$ with $2 + \\tfrac34 x = 1.92 \\Rightarrow x = -\\tfrac{8}{75} \\approx -0.107$; small enough for the truncated series to be accurate."],
    ["$(4 + 5x)^{1/2}$ to the $x^2$ term?", "$2\\left(1 + \\tfrac54 x\\right)^{1/2} = 2 + \\tfrac54 x - \\tfrac{25}{64}x^2$, valid $|x| < \\tfrac45$."]
  ],
  quiz: [
    { q: "$\\binom{9}{2} =$", opts: ["18", "36", "72", "81"], ans: 1, why: "$\\dfrac{9 \\times 8}{2}$." },
    { q: "The $x^2$ term of $(1 + 2x)^{1/2}$ is:", opts: ["$-\\tfrac12 x^2$", "$\\tfrac12 x^2$", "$-2x^2$", "$x^2$"], ans: 0, why: "$\\dfrac{\\frac12 \\cdot(-\\frac12)}{2}(2x)^2 = -\\tfrac18 \\cdot 4x^2$." },
    { q: "$(1 + 3x)^{-1}$ is valid for:", opts: ["$|x| < 3$", "$|x| < \\tfrac13$", "all $x$", "$x > 0$"], ans: 1, why: "$|3x| < 1$." },
    { q: "$(8 + x)^{1/3}$ starts with the constant:", opts: ["8", "2", "$\\tfrac13$", "1"], ans: 1, why: "$8^{1/3}(1 + \\tfrac x8)^{1/3}$." },
    { q: "Coefficient of $x$ in $(2 + x)^5$:", opts: ["5", "80", "16", "10"], ans: 1, why: "$5 \\times 2^4$." },
    { q: "If the first omitted term is positive, the truncated series gives:", opts: ["an overestimate", "an underestimate", "the exact value", "no information"], ans: 1, why: "Missing positive contribution." },
    { q: "Coefficient of $x^2$ in $(1 + x)(1 + 4x + 6x^2)$:", opts: ["6", "10", "4", "24"], ans: 1, why: "$6 + 4$." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2020 P1 Q6", ctx: "$f(x) = (1 + kx)^{10}$, where $k$ is a non-zero constant.",
      parts: [
        { q: "Find the first four terms, in ascending powers of $x$, of the binomial expansion of $f(x)$, giving each term in its simplest form in terms of $k$.", marks: 3, ms: ["M1: uses $\\binom{10}{r}$ with $(kx)^r$", "A1: $1 + 10kx + 45k^2x^2$", "A1: $+ 120k^3x^3$"] },
        { q: "Given that the coefficient of $x^3$ is three times the coefficient of $x$, find the possible values of $k$.", marks: 3, ms: ["M1: $120k^3 = 3 \\times 10k$", "A1: $k^2 = \\tfrac14$", "A1: $k = \\pm\\tfrac12$"] }
      ] },
    { src: "Edexcel 2024 P1 Q2", ctx: "$f(x) = (1 + 9x)^{-2}$, $|x| < \\tfrac19$.",
      parts: [
        { q: "Find the first four terms, in ascending powers of $x$, of the binomial expansion of $f(x)$.", marks: 3, ms: ["M1: $1 + (-2)(9x) + \\dfrac{(-2)(-3)}{2}(9x)^2 + \\dfrac{(-2)(-3)(-4)}{6}(9x)^3$", "A1: $1 - 18x + 243x^2$", "A1: $- 2916x^3$"] },
        { q: "A student substitutes $x = 0.2$ into the expansion to estimate $f(0.2)$. Explain why this is not valid.", marks: 1, ms: ["B1: the expansion is only valid for $|x| < \\tfrac19$ and $0.2 > \\tfrac19$"] }
      ] },
    { src: "Edexcel 2022 P1 Q7", ctx: "$g(x) = (9 - x)^{1/2}$.",
      parts: [
        { q: "Find the first three terms, in ascending powers of $x$, of the binomial expansion of $g(x)$, giving each coefficient in its simplest form.", marks: 4, ms: ["M1: $3\\left(1 - \\dfrac x9\\right)^{1/2}$", "M1: $1 + \\tfrac12\\left(-\\dfrac x9\\right) + \\dfrac{\\frac12 \\cdot(-\\frac12)}{2}\\left(-\\dfrac x9\\right)^2$", "A1: $3 - \\dfrac{x}{6}$", "A1: $- \\dfrac{x^2}{216}$"] },
        { q: "Use $x = 1$ in your expansion to find an approximation for $\\sqrt 8$, and state with a reason whether it is an overestimate or an underestimate.", marks: 2, ms: ["M1: $3 - \\tfrac16 - \\tfrac{1}{216} = 2.8287$ (4 d.p.)", "A1: overestimate, because the next term, $-\\dfrac{x^3}{3888}$, is negative"] }
      ] },
    { level: "AS", src: "Edexcel AS 2019 P1 Q8", ctx: "$\\left(2 + \\dfrac{3x}{4}\\right)^5$.",
      parts: [
        { q: "Find the first three terms, in ascending powers of $x$, of the binomial expansion, giving each term in its simplest form.", marks: 3, ms: ["M1: $2^5 + 5 \\cdot 2^4 \\cdot \\dfrac{3x}{4} + 10 \\cdot 2^3 \\cdot \\left(\\dfrac{3x}{4}\\right)^2$", "A1: $32 + 60x$", "A1: $+ 45x^2$"] },
        { q: "Use your expansion, with a suitable value of $x$, to estimate $1.94^5$ to 3 decimal places.", marks: 2, ms: ["M1: $2 + \\tfrac34 x = 1.94 \\Rightarrow x = -0.08$", "A1: $32 - 4.8 + 0.288 = 27.488$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2022 P1 Q6", ctx: "$\\left(2 - \\dfrac{x}{9}\\right)^8$.",
      parts: [
        { q: "Find the first four terms, in ascending powers of $x$, of the binomial expansion, giving each term in its simplest form.", marks: 4, ms: ["M1: correct use of $\\binom8r$ and powers of 2", "A1: $256 - \\dfrac{1024}{9}x$", "A1: $+ \\dfrac{1792}{81}x^2$", "A1: $- \\dfrac{1792}{729}x^3$"] },
        { q: "Hence find the coefficient of $x^2$ in the expansion of $(3 + 9x)\\left(2 - \\dfrac{x}{9}\\right)^8$.", marks: 2, ms: ["M1: $3 \\times \\dfrac{1792}{81} + 9 \\times \\left(-\\dfrac{1024}{9}\\right)$", "A1: $\\dfrac{1792}{27} - 1024 = -\\dfrac{25856}{27}$"] }
      ] }
  ]
});

X("maths:4.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Periodic recurrence sequences — 4 to 7 marks on every A-level paper" },
    "$a_{n+1} = \\dfrac{k a_n + 2}{a_n}$, $u_{n+1} = k - \\dfrac{2}{u_n}$, $a_{n+1} = 8 - a_n$, $a_{n+1} = \\dfrac{a_n - 3}{a_n - 2}$, sequences with a $\\cos\\left(\\dfrac{n\\pi}{2}\\right)$ factor: **write out the first few terms** until they repeat, state the **order** of the periodic sequence, then evaluate $\\displaystyle\\sum_{n=1}^{100} a_n$ by **counting complete cycles plus the remainder**. A second style gives a condition ($a_3 = a_1$, or $u_2 = u_1$) and asks for $k$ — this produces a **quadratic in $k$**.",
    { callout: { t: "warn", body: "$\\sum_{n=1}^{50}$ of a period-3 sequence: $50 = 16 \\times 3 + 2$ — sixteen full cycles **plus $a_1 + a_2$**. Show the split explicitly." }}
  ],
  flashcards: [
    ["$a_1 = 3$, $a_{n+1} = 8 - a_n$. Find $a_2, a_3$ and the order.", "$a_2 = 5$, $a_3 = 3$: periodic with order 2."],
    ["For that sequence, find $\\displaystyle\\sum_{n=1}^{40} a_n$.", "20 cycles of $(3 + 5)$: $160$."],
    ["$a_1 = 2$, $a_{n+1} = \\dfrac{a_n - 3}{a_n - 2}$. Find $a_2, a_3, a_4$.", "$a_2 = \\dfrac{-1}{0}$ — undefined; start instead with $a_1 = 4$: $a_2 = \\tfrac12$, $a_3 = \\dfrac{-2.5}{-1.5} = \\tfrac53$, $a_4 = \\dfrac{-4/3}{-1/3} = 4$: order 3."],
    ["$u_{n+1} = k - \\dfrac{2}{u_n}$ with $u_1 = 1$ and $u_3 = u_1$. Find $k$.", "$u_2 = k - 2$, $u_3 = k - \\dfrac{2}{k-2} = 1 \\Rightarrow (k-1)(k-2) = 2 \\Rightarrow k^2 - 3k = 0 \\Rightarrow k = 3$ ($k \\ne 0$)."],
    ["What is an increasing sequence?", "One with $u_{n+1} > u_n$ for all $n$."],
    ["What is a periodic sequence of order $p$?", "One with $u_{n+p} = u_n$ for all $n$ — the terms repeat every $p$ terms."],
    ["$a_n = 5 + 3\\cos\\left(\\dfrac{n\\pi}{2}\\right)$: first four terms and order?", "$5, 2, 5, 8$; order 4."],
    ["Is $u_n = \\dfrac{n}{n + 1}$ increasing, decreasing or periodic?", "Increasing (towards 1)."],
    ["$a_{n+1} = \\dfrac{k a_n + 2}{a_n}$, $a_1 = 1$, order 3 with $a_2 = k + 2$… what equation gives $k$?", "$a_3 = \\dfrac{k(k+2) + 2}{k + 2}$; setting $a_4 = a_1 = 1$ leads to a quadratic in $k$ — solve and reject any $k$ that makes a term undefined."],
    ["Difference between a sequence defined by $u_n = 2n + 1$ and by $u_{n+1} = u_n + 2$, $u_1 = 3$?", "Same sequence; the first is an $n$th-term formula, the second a recurrence relation needing a first term."]
  ],
  quiz: [
    { q: "$a_1 = 1$, $a_{n+1} = 4 - a_n$. $a_5 =$", opts: ["1", "3", "4", "0"], ans: 0, why: "1, 3, 1, 3, 1." },
    { q: "A sequence has order 3 with terms 2, 5, 3 repeating. $\\sum_{n=1}^{30} a_n =$", opts: ["100", "90", "30", "300"], ans: 0, why: "10 cycles × 10." },
    { q: "$\\sum_{n=1}^{50}$ of a period-3 sequence with cycle sum 10 and $a_1 = 2$, $a_2 = 5$:", opts: ["160", "167", "170", "165"], ans: 1, why: "$16 \\times 10 + 2 + 5$." },
    { q: "$u_{n+1} = 3u_n - 2$, $u_1 = 2$ is:", opts: ["periodic", "constant", "increasing", "decreasing"], ans: 2, why: "2, 4, 10, 28…" },
    { q: "$\\cos\\left(\\dfrac{n\\pi}{2}\\right)$ for $n = 1, 2, 3, 4$ gives:", opts: ["$0, -1, 0, 1$", "$1, 0, -1, 0$", "$0, 1, 0, -1$", "$-1, 0, 1, 0$"], ans: 0, why: "Quarter turns." },
    { q: "A sequence with $u_{n+2} = u_n$ for all $n$ has order:", opts: ["1", "2", "4", "infinite"], ans: 1, why: "Repeats every two terms." }
  ],
  exam: [
    { src: "Edexcel 2023 P1 Q2", ctx: "A sequence is defined by $a_1 = 4$ and $a_{n+1} = a_n + 3\\cos\\left(\\dfrac{n\\pi}{2}\\right)$ for $n \\ge 1$.",
      parts: [
        { q: "Find $a_2$, $a_3$, $a_4$ and $a_5$.", marks: 3, ms: ["M1: evaluates $\\cos\\frac{\\pi}{2} = 0$, $\\cos\\pi = -1$, $\\cos\\frac{3\\pi}{2} = 0$, $\\cos 2\\pi = 1$", "A1: $a_2 = 4$, $a_3 = 1$", "A1: $a_4 = 1$, $a_5 = 4$"] },
        { q: "State the order of the sequence.", marks: 1, ms: ["B1: 4"] },
        { q: "Find $\\displaystyle\\sum_{n=1}^{102} a_n$.", marks: 2, ms: ["M1: $25 \\times (4 + 4 + 1 + 1) + a_1 + a_2$", "A1: $250 + 8 = 258$"] }
      ] },
    { src: "Edexcel 2024 P2 Q4", q: "A sequence is defined by $u_1 = 2$ and $u_{n+1} = \\dfrac{k u_n + 5}{u_n + 6}$, where $k$ is a constant. Given that $u_2 = u_1$, find the value of $k$.", marks: 4,
      ms: ["M1: $u_2 = \\dfrac{2k + 5}{8}$", "M1: sets equal to 2: $2k + 5 = 16$", "A1: $k = \\tfrac{11}{2}$", "B1: checks the sequence is then constant (every term 2)"] },
    { src: "Edexcel Specimen P2 Q3", ctx: "A sequence is defined by $a_1 = 4$ and $a_{n+1} = \\dfrac{a_n - 3}{a_n - 2}$.",
      parts: [
        { q: "Find $a_2$ and $a_3$ and hence show that the sequence is periodic, stating its order.", marks: 3, ms: ["A1: $a_2 = \\tfrac12$", "A1: $a_3 = \\dfrac{-5/2}{-3/2} = \\tfrac53$, $a_4 = \\dfrac{-4/3}{-1/3} = 4 = a_1$", "B1: periodic with order 3"] },
        { q: "Find $\\displaystyle\\sum_{n=1}^{50} a_n$, giving your answer as an exact fraction.", marks: 3, ms: ["M1: cycle sum $4 + \\tfrac12 + \\tfrac53 = \\tfrac{37}{6}$", "M1: $16 \\times \\tfrac{37}{6} + a_1 + a_2$", "A1: $\\tfrac{296}{3} + \\tfrac92 = \\tfrac{619}{6}$"] }
      ] },
    { src: "Edexcel Oct 2021 P2 Q3", q: "A sequence is given by $u_1 = 1$ and $u_{n+1} = k - \\dfrac{2}{u_n}$, $k > 0$. Given that $u_3 = u_1$, show that $k$ satisfies a quadratic equation and find $k$.", marks: 6,
      ms: ["M1: $u_2 = k - 2$", "M1: $u_3 = k - \\dfrac{2}{k - 2}$", "M1: $k - \\dfrac{2}{k-2} = 1 \\Rightarrow (k-1)(k-2) = 2$", "A1: $k^2 - 3k = 0$", "A1: $k = 3$ (rejecting $k = 0$)", "B1: verifies $u_2 = 1$ so the sequence is constant — order 1 (accept a comment)"] }
  ]
});

X("maths:4.3", {
  flashcards: [
    ["Evaluate $\\displaystyle\\sum_{r=1}^{4} (2r + 1)$.", "$3 + 5 + 7 + 9 = 24$."],
    ["Write $5 + 8 + 11 + \\ldots + 32$ in sigma notation.", "$\\displaystyle\\sum_{r=1}^{10} (3r + 2)$."],
    ["Evaluate $\\displaystyle\\sum_{r=1}^{20} (4r - 3)$.", "Arithmetic: $a = 1$, $l = 77$, $n = 20$: $\\tfrac{20}{2}(1 + 77) = 780$."],
    ["Evaluate $\\displaystyle\\sum_{r=1}^{\\infty} 6\\left(\\tfrac13\\right)^{r-1}$.", "Geometric $a = 6$, $r = \\tfrac13$: $\\dfrac{6}{1 - 1/3} = 9$."],
    ["Evaluate $\\displaystyle\\sum_{r=1}^{12} 3$.", "36 (twelve copies of 3)."],
    ["Evaluate $\\displaystyle\\sum_{r=5}^{10} (2r)$.", "$\\sum_{1}^{10} 2r - \\sum_{1}^{4} 2r = 110 - 20 = 90$."],
    ["Simplify $\\displaystyle\\sum_{r=1}^{n} (\\log_2 r - \\log_2(r+1))$… telescoping.", "$\\log_2 1 - \\log_2(n+1) = -\\log_2(n + 1)$."],
    ["Evaluate $\\displaystyle\\sum_{n=1}^{\\infty} 5\\left(\\tfrac25\\right)^n \\cos(180n)°$.", "$\\cos(180n)° = (-1)^n$: geometric with $a = -2$, $r = -\\tfrac25$: $\\dfrac{-2}{1 + 2/5} = -\\tfrac{10}{7}$."]
  ],
  quiz: [
    { q: "$\\sum_{r=1}^{5} r^2 =$", opts: ["15", "55", "25", "30"], ans: 1, why: "$1 + 4 + 9 + 16 + 25$." },
    { q: "$\\sum_{r=3}^{7} 2$ has how many terms?", opts: ["7", "5", "4", "2"], ans: 1, why: "$r = 3, 4, 5, 6, 7$." },
    { q: "$\\sum_{r=1}^{n} (2r - 1) =$", opts: ["$n^2$", "$n(n+1)$", "$2n$", "$n^2 - 1$"], ans: 0, why: "Sum of the first $n$ odd numbers." },
    { q: "$\\sum_{r=0}^{\\infty} \\left(\\tfrac12\\right)^r =$", opts: ["1", "2", "$\\tfrac12$", "diverges"], ans: 1, why: "$\\dfrac{1}{1 - 1/2}$." },
    { q: "$\\sum_{r=1}^{100} (-1)^r =$", opts: ["0", "100", "$-1$", "1"], ans: 0, why: "Pairs cancel." },
    { q: "$\\sum_{r=1}^{n} \\left(\\ln(r+1) - \\ln r\\right) =$", opts: ["$\\ln n$", "$\\ln(n + 1)$", "$0$", "$n\\ln 2$"], ans: 1, why: "Telescopes to $\\ln(n+1) - \\ln 1$." }
  ],
  exam: [
    { src: "Edexcel 2018 P2 Q4", ctx: "A sequence is defined by $a_1 = 5$ and $a_{n+1} = 12 - a_n$ for $n \\ge 1$.",
      parts: [
        { q: "Evaluate $\\displaystyle\\sum_{r=1}^{10} (3r + 2)$.", marks: 2, ms: ["M1: arithmetic series $a = 5$, $l = 32$, $n = 10$", "A1: 185"] },
        { q: "Find $\\displaystyle\\sum_{n=1}^{75} a_n$.", marks: 3, ms: ["M1: $a_2 = 7$, $a_3 = 5$ — periodic order 2", "M1: $37 \\times (5 + 7) + a_{75}$ where $a_{75} = a_1 = 5$", "A1: $444 + 5 = 449$"] }
      ] },
    { src: "Edexcel 2019 P2 Q8", parts: [
      { q: "Find $\\displaystyle\\sum_{r=1}^{\\infty} 8\\left(\\tfrac34\\right)^{r}$.", marks: 2, ms: ["M1: first term $6$, ratio $\\tfrac34$", "A1: $\\dfrac{6}{1 - 3/4} = 24$"] },
      { q: "Show that $\\displaystyle\\sum_{r=1}^{n} \\log_3\\left(\\dfrac{r+1}{r}\\right) = \\log_3(n+1)$.", marks: 3, ms: ["M1: writes each term as $\\log_3(r+1) - \\log_3 r$", "M1: sum telescopes: $(\\log_3 2 - \\log_3 1) + (\\log_3 3 - \\log_3 2) + \\ldots + (\\log_3(n+1) - \\log_3 n)$", "A1: $= \\log_3(n+1) - \\log_3 1 = \\log_3(n + 1)$"] }
    ] },
    { src: "Edexcel Oct 2021 P1 Q9", q: "Evaluate $\\displaystyle\\sum_{n=1}^{\\infty} 8\\left(\\tfrac{3}{5}\\right)^n \\cos(180n)°$, giving your answer as an exact fraction.", marks: 3,
      ms: ["M1: recognises $\\cos(180n)° = (-1)^n$ so the series is geometric with ratio $-\\tfrac35$", "M1: first term $-\\tfrac{24}{5}$, sum $\\dfrac{-24/5}{1 + 3/5}$", "A1: $-3$"] }
  ]
});

X("maths:4.4", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Arithmetic series — proofs and money problems" },
    "**Prove the sum formula** (2022 — 3 marks): write $S_n$ forwards and backwards, add to get $2S_n = n(2a + (n-1)d)$. **Money / savings / loan repayments** (2022, 2024): the repayments form an arithmetic sequence, the total to be repaid gives $\\dfrac N2(2a + (N-1)d) = \\text{total}$, a **quadratic in $N$**; reject the non-integer or negative root and **state the number of months**. Terms given in $k$ (2025, Specimen): use $2 \\times \\text{middle} = \\text{first} + \\text{third}$ to find $k$, then show the sum is a **square number** or find a specific term.",
    { callout: { t: "memorise", body: "$u_n = a + (n-1)d$ · $S_n = \\dfrac n2(2a + (n-1)d) = \\dfrac n2(a + l)$ · three consecutive terms $p, q, r$ satisfy $2q = p + r$." }}
  ],
  flashcards: [
    ["Prove $S_n = \\dfrac n2(2a + (n-1)d)$.", "$S_n = a + (a+d) + \\ldots + (a + (n-1)d)$; reversed $S_n = (a+(n-1)d) + \\ldots + a$; adding: $2S_n = n(2a + (n-1)d)$."],
    ["Arithmetic series: $u_5 = 17$, $u_{12} = 38$. Find $a$ and $d$.", "$7d = 21 \\Rightarrow d = 3$, $a = 5$."],
    ["Sum of the first 500 terms with $a = 4$, $d = 3$?", "$\\tfrac{500}{2}(8 + 499 \\times 3) = 250 \\times 1505 = 376\\,250$."],
    ["Terms $2k + 1$, $4k - 2$, $5k + 3$ are consecutive terms of an arithmetic sequence. Find $k$.", "$2(4k - 2) = 2k + 1 + 5k + 3 \\Rightarrow 8k - 4 = 7k + 4 \\Rightarrow k = 8$."],
    ["Repayments of £100, £110, £120, … total £2550. How many payments?", "$\\dfrac N2(200 + 10(N-1)) = 2550 \\Rightarrow N^2 + 19N - 510 = 0 \\Rightarrow (N + 34)(N - 15) = 0 \\Rightarrow N = 15$."],
    ["Show the sum of the first $n$ odd numbers is a square.", "$a = 1, d = 2$: $S_n = \\tfrac n2(2 + 2(n-1)) = n^2$."],
    ["How many terms of $3 + 7 + 11 + \\ldots$ are needed for the sum to exceed 1000?", "$\\tfrac n2(6 + 4(n-1)) > 1000 \\Rightarrow 2n^2 + n - 1000 > 0 \\Rightarrow n \\ge 23$ ($n = 22$ gives 990)."],
    ["$S_n = 3n^2 + 2n$. Find $u_n$.", "$u_n = S_n - S_{n-1} = 6n - 1$."]
  ],
  quiz: [
    { q: "The 20th term of $5, 9, 13, \\ldots$:", opts: ["81", "85", "80", "77"], ans: 0, why: "$5 + 19 \\times 4$." },
    { q: "$S_{10}$ of $2 + 5 + 8 + \\ldots$:", opts: ["155", "145", "290", "135"], ans: 0, why: "$5(4 + 27)$." },
    { q: "$3, x, 15$ are consecutive arithmetic terms. $x =$", opts: ["6", "9", "12", "45"], ans: 1, why: "Mean of neighbours." },
    { q: "$S_n = \\dfrac n2(a + l)$ requires knowing:", opts: ["$d$", "the first and last terms", "$n^2$", "the ratio"], ans: 1, why: "Alternative sum formula." },
    { q: "A loan repaid with monthly payments increasing by £5 each month forms:", opts: ["a geometric sequence", "an arithmetic sequence", "a periodic sequence", "a constant sequence"], ans: 1, why: "Constant difference." },
    { q: "If $u_n = 7n - 3$, then $d =$", opts: ["3", "7", "4", "$-3$"], ans: 1, why: "Coefficient of $n$." }
  ],
  exam: [
    { src: "Edexcel 2022 P2 Q13", parts: [
      { q: "Prove that the sum of the first $n$ terms of an arithmetic series with first term $a$ and common difference $d$ is $S_n = \\dfrac n2\\left[2a + (n-1)d\\right]$.", marks: 3, ms: ["M1: writes $S_n$ as $a + (a + d) + \\ldots + (a + (n-1)d)$ and in reverse order", "M1: adds the two expressions term by term to obtain $2S_n = n[2a + (n-1)d]$", "A1: divides by 2 with a clear statement of the result"] },
      { q: "Kim saves money each month. She saves £80 in the first month and increases the amount by £6 each month. After $N$ months her total savings are £2740. Show that $3N^2 + 77N - 2740 = 0$, and hence find $N$.", marks: 4, ms: ["M1: $\\dfrac N2[160 + 6(N-1)] = 2740$", "A1: $N(154 + 6N) = 5480 \\Rightarrow 6N^2 + 154N - 5480 = 0 \\Rightarrow 3N^2 + 77N - 2740 = 0$ (cso)", "M1: factorises $(3N + 137)(N - 20) = 0$ or uses the formula", "A1: $N = 20$ (rejecting the negative root)"] }
    ] },
    { src: "Edexcel Specimen P1 Q11", ctx: "The first three terms of an arithmetic sequence are $2k - 1$, $3k + 2$ and $5k - 1$, where $k$ is a constant.",
      parts: [
        { q: "Show that $k = 6$.", marks: 2, ms: ["M1: $2(3k + 2) = (2k - 1) + (5k - 1)$", "A1: $6k + 4 = 7k - 2 \\Rightarrow k = 6$"] },
        { q: "Hence find the sum of the first 20 terms.", marks: 2, ms: ["M1: $a = 11$, $d = 9$: $S_{20} = \\tfrac{20}{2}(22 + 19 \\times 9)$", "A1: $1930$"] }
      ] },
    { src: "Edexcel Oct 2021 P1 Q1", q: "The third term of an arithmetic series is 13 and the tenth term is 41. Find the common difference and the sum of the first 500 terms.", marks: 4,
      ms: ["M1: $a + 2d = 13$, $a + 9d = 41$", "A1: $d = 4$, $a = 5$", "M1: $S_{500} = \\tfrac{500}{2}(10 + 499 \\times 4)$", "A1: $501\\,500$"] }
  ]
});

X("maths:4.5", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Geometric series — proof, models and $k$" },
    "**Prove $S_n = \\dfrac{a(1 - r^n)}{1 - r}$** (Oct 2020): write $S_n$, multiply by $r$, subtract. **Models**: race times increasing 5% per km (2019), profit up 8% a year (Oct 2021), wheat harvest up 1.2% (Specimen), car gears (Oct 2020) — find the **first year the term exceeds a value** (logs: $n > \\dfrac{\\ln(\\ldots)}{\\ln r}$, round **up** to the next integer), and the **total over $N$ years** ($S_N$). **Terms in $k$** (2023, 2024): consecutive terms $p, q, r$ satisfy $q^2 = pr$ — a quadratic in $k$; then **convergence** needs $|r| < 1$ so pick the valid $k$, and $S_\\infty = \\dfrac{a}{1 - r}$. A **trig ratio** (2022, Oct 2021) gives $|r| < 1$ automatically or a hidden sign.",
    { callout: { t: "warn", body: "$S_{10} = 4S_5$ (Oct 2020): $\\dfrac{1 - r^{10}}{1 - r} = 4\\dfrac{1 - r^5}{1 - r} \\Rightarrow 1 + r^5 = 4 \\Rightarrow r = 3^{1/5}$ — factorise $1 - r^{10} = (1 - r^5)(1 + r^5)$ rather than expanding." }}
  ],
  flashcards: [
    ["Prove $S_n = \\dfrac{a(1 - r^n)}{1 - r}$.", "$S_n = a + ar + \\ldots + ar^{n-1}$; $rS_n = ar + \\ldots + ar^n$; subtract: $S_n(1 - r) = a - ar^n$."],
    ["Condition for a geometric series to converge, and $S_\\infty$?", "$|r| < 1$; $S_\\infty = \\dfrac{a}{1 - r}$."],
    ["$k + 4$, $2k$, $3k - 4$… find $k$ if these are consecutive geometric terms.", "$(2k)^2 = (k+4)(3k-4) \\Rightarrow 4k^2 = 3k^2 + 8k - 16 \\Rightarrow k^2 - 8k + 16 = 0 \\Rightarrow k = 4$ (terms 8, 8, 8)."],
    ["A profit grows 8% a year from £40 000. First year it exceeds £65 000?", "$40000 \\times 1.08^{n-1} > 65000 \\Rightarrow n - 1 > \\dfrac{\\ln 1.625}{\\ln 1.08} = 6.31 \\Rightarrow n = 8$."],
    ["Total profit over 20 years for that model?", "$S_{20} = \\dfrac{40000(1.08^{20} - 1)}{0.08} \\approx £1\\,830\\,000$."],
    ["$S_{10} = 4S_5$. Find $r$.", "$1 + r^5 = 4 \\Rightarrow r = 3^{1/5} \\approx 1.246$."],
    ["Runner: each km takes 5% longer than the previous; first km 4 minutes. Time for the 10th km and total for 10 km?", "$4 \\times 1.05^9 = 6.21$ min; total $\\dfrac{4(1.05^{10} - 1)}{0.05} = 50.3$ min."],
    ["Geometric series with $a = 12$, $S_\\infty = 16$. Find $r$.", "$\\dfrac{12}{1 - r} = 16 \\Rightarrow r = \\tfrac14$."],
    ["Sum of $3 + 6 + 12 + \\ldots$ to 10 terms?", "$\\dfrac{3(2^{10} - 1)}{1} = 3069$."],
    ["Why does a series with ratio $\\sin\\theta$ ($0 < \\theta < \\tfrac\\pi2$) always converge?", "$0 < \\sin\\theta < 1$ so $|r| < 1$."]
  ],
  quiz: [
    { q: "The 6th term of $2, 6, 18, \\ldots$:", opts: ["486", "162", "1458", "54"], ans: 0, why: "$2 \\times 3^5$." },
    { q: "$S_\\infty$ of $8 + 4 + 2 + \\ldots$:", opts: ["14", "16", "32", "diverges"], ans: 1, why: "$\\dfrac{8}{1 - 1/2}$." },
    { q: "A geometric series with $r = -1.5$:", opts: ["converges", "diverges", "sums to 0", "is arithmetic"], ans: 1, why: "$|r| > 1$." },
    { q: "Growth of 5% per year corresponds to ratio:", opts: ["0.05", "1.05", "5", "0.95"], ans: 1, why: "Multiply by 1.05." },
    { q: "$3, x, 27$ consecutive geometric terms; $x =$", opts: ["15", "$\\pm 9$", "9 only", "81"], ans: 1, why: "$x^2 = 81$." },
    { q: "The number of years $n$ for $1.06^n > 2$ is at least:", opts: ["11", "12", "16", "17"], ans: 1, why: "$n > \\ln 2 / \\ln 1.06 = 11.9$." },
    { q: "$S_n = \\dfrac{a(r^n - 1)}{r - 1}$ is the same formula as $\\dfrac{a(1-r^n)}{1-r}$:", opts: ["true", "false"], ans: 0, why: "Multiply top and bottom by $-1$." }
  ],
  exam: [
    { src: "Edexcel Oct 2020 P1 Q15", parts: [
      { q: "Prove that the sum of the first $n$ terms of a geometric series with first term $a$ and common ratio $r$ ($r \\ne 1$) is $S_n = \\dfrac{a(1 - r^n)}{1 - r}$.", marks: 3, ms: ["M1: writes $S_n = a + ar + \\ldots + ar^{n-1}$ and $rS_n = ar + \\ldots + ar^n$", "M1: subtracts to get $S_n - rS_n = a - ar^n$", "A1: factorises and divides: $S_n = \\dfrac{a(1 - r^n)}{1 - r}$"] },
      { q: "A geometric series has $S_{10} = 4S_5$ and $r > 0$, $r \\ne 1$. Find the exact value of $r$.", marks: 4, ms: ["M1: $\\dfrac{a(1 - r^{10})}{1 - r} = \\dfrac{4a(1 - r^5)}{1 - r}$", "M1: $1 - r^{10} = (1 - r^5)(1 + r^5)$ so $1 + r^5 = 4$", "A1: $r^5 = 3$", "A1: $r = 3^{1/5}$"] }
    ] },
    { src: "Edexcel 2023 P2 Q9", ctx: "The first three terms of a geometric sequence are $k + 6$, $k$ and $2k - 9$, where $k$ is a constant.",
      parts: [
        { q: "Show that $k$ satisfies $k^2 + 3k - 54 = 0$.", marks: 3, ms: ["M1: $k^2 = (k + 6)(2k - 9)$", "A1: $k^2 = 2k^2 + 3k - 54$", "A1: $k^2 + 3k - 54 = 0$ — i.e. $(k + 9)(k - 6) = 0$ (cso; accept the equivalent form)"] },
        { q: "Given that the series converges, find the value of $k$ and the sum to infinity.", marks: 4, ms: ["M1: $k = 6$ or $k = -9$", "M1: $k = 6$ gives terms $12, 6, 3$ with $r = \\tfrac12$ (converges); $k = -9$ gives $-3, -9, -27$ with $r = 3$ (diverges)", "A1: $k = 6$", "A1: $S_\\infty = \\dfrac{12}{1 - 1/2} = 24$"] }
      ] },
    { src: "Edexcel 2019 P1 Q11", ctx: "In a cross-country race, a runner takes 4 minutes for the first kilometre. Each subsequent kilometre takes 5% longer than the previous one.",
      parts: [
        { q: "Find the time taken for the 8th kilometre, to the nearest second.", marks: 2, ms: ["M1: $4 \\times 1.05^7$", "A1: 5.63 min = 5 min 38 s"] },
        { q: "The race is 15 km. Find the runner's total time, to the nearest minute.", marks: 3, ms: ["M1: $S_{15} = \\dfrac{4(1.05^{15} - 1)}{0.05}$", "A1: $= 86.3$", "A1: 86 minutes"] },
        { q: "Explain why the model is unlikely to be valid for a very long race.", marks: 1, ms: ["B1: the time per km would grow without limit / the runner would eventually stop, so a geometric increase cannot continue indefinitely"] }
      ] },
    { src: "Edexcel Oct 2021 P2 Q5", ctx: "A company's profit in its first year was £40 000. The profit increases by 8% each year.",
      parts: [
        { q: "Find the first year in which the profit exceeds £65 000.", marks: 3, ms: ["M1: $40000 \\times 1.08^{n-1} > 65000$", "M1: $n - 1 > \\dfrac{\\ln 1.625}{\\ln 1.08} = 6.31$", "A1: year 8"] },
        { q: "Find the total profit over the first 20 years, to the nearest £1000.", marks: 2, ms: ["M1: $\\dfrac{40000(1.08^{20} - 1)}{0.08}$", "A1: £1 831 000"] }
      ] }
  ]
});

X("maths:4.6", {
  flashcards: [
    ["A car's gear speeds 10, 15, 20, 25 mph then 30, 45, 67.5… — which sequence is which?", "Arithmetic ($d = 5$) for the first four, geometric ($r = 1.5$) after."],
    ["Wheat harvest 12 000 tonnes rising 1.2% a year. Total over 10 years?", "$\\dfrac{12000(1.012^{10} - 1)}{0.012} \\approx 126\\,800$ tonnes."],
    ["Loan: repayments start at £200 and rise by £15 a month. Total after $N$ months?", "$\\dfrac N2(400 + 15(N-1))$."],
    ["A drug dose halves in the body every 6 hours from 80 mg. Amount after 24 hours?", "$80 \\times 0.5^4 = 5$ mg."],
    ["Why round *up* when finding the first year a geometric model exceeds a target?", "$n$ must be a whole number of years and the inequality is first satisfied at the next integer above the solution."],
    ["State a limitation of a geometric growth model for a population.", "Real growth slows as resources run out; the model predicts unbounded growth."],
    ["A savings account pays 3% compound interest on £5000. Value after $n$ years?", "$5000 \\times 1.03^n$."],
    ["Depreciation of 20% a year on £12 000: value after 5 years?", "$12000 \\times 0.8^5 = £3932$."]
  ],
  quiz: [
    { q: "A model 'increases by £50 each year' is:", opts: ["geometric", "arithmetic", "exponential", "periodic"], ans: 1, why: "Constant difference." },
    { q: "'Increases by 4% each year' is:", opts: ["arithmetic", "geometric with $r = 1.04$", "geometric with $r = 0.04$", "linear"], ans: 1, why: "Constant ratio." },
    { q: "Total distance run over 10 days increasing 2 km daily from 3 km:", opts: ["120", "30", "210", "100"], ans: 0, why: "$5(6 + 18)$." },
    { q: "A geometric model with $r = 0.85$ describes:", opts: ["growth", "decay by 15% per period", "constant value", "periodic change"], ans: 1, why: "Multiplying by 0.85." },
    { q: "$S_\\infty$ exists for a decay model because:", opts: ["$r > 1$", "$|r| < 1$", "$a > 0$", "$n$ is finite"], ans: 1, why: "Convergence condition." },
    { q: "First $n$ for which $2000 \\times 1.1^n > 5000$:", opts: ["9", "10", "11", "8"], ans: 1, why: "$n > \\ln 2.5 / \\ln 1.1 = 9.6$." }
  ],
  exam: [
    { src: "Edexcel Oct 2020 P1 Q5", ctx: "A car has six gears. The maximum speed in first gear is 20 mph and the maximum speeds in the first four gears form an arithmetic sequence with common difference 12 mph. The maximum speeds in the fourth, fifth and sixth gears form a geometric sequence.",
      parts: [
        { q: "Find the maximum speed in the fourth gear.", marks: 2, ms: ["M1: $20 + 3 \\times 12$", "A1: 56 mph"] },
        { q: "Given the maximum speed in sixth gear is 87.5 mph, find the common ratio of the geometric sequence and the maximum speed in fifth gear.", marks: 4, ms: ["M1: $56r^2 = 87.5$", "A1: $r^2 = 1.5625 \\Rightarrow r = 1.25$", "M1: $56 \\times 1.25$", "A1: 70 mph"] }
      ] },
    { src: "Edexcel Specimen P2 Q8", ctx: "A farmer harvests 10 000 tonnes of wheat in year 1. The harvest increases by 1.2% each year.",
      parts: [
        { q: "Find the harvest in year 10, to the nearest tonne.", marks: 2, ms: ["M1: $10000 \\times 1.012^9$", "A1: 11 134 tonnes"] },
        { q: "Find the total harvest over the first 20 years, to 3 significant figures.", marks: 2, ms: ["M1: $\\dfrac{10000(1.012^{20} - 1)}{0.012}$", "A1: 224 000 tonnes"] },
        { q: "The farmer sells the wheat for £150 per tonne in year 1, and the price rises by £5 each year. Find the income in year 10.", marks: 2, ms: ["M1: price $150 + 9 \\times 5 = 195$; income $11134 \\times 195$", "A1: £2 171 000 (3 s.f.)"] }
      ] }
  ]
});

X("maths:5.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Sectors, triangles and the design problems" },
    "Radians questions come as **composite shapes**: a logo of sectors with radii $r$ and $2r$ (Oct 2021), a stage of triangles plus a sector (2023), a badge of a semicircle and an arc (2024), a triangle plus sector (2025) — you need **arc length $r\\theta$**, **sector area $\\tfrac12 r^2\\theta$**, **triangle area $\\tfrac12 ab\\sin C$** and the **cosine rule**, and the answer is exact in the form $a\\sqrt3 + b\\pi$. The **error-spotting** question (2019) had a student use a degree angle in $\\tfrac12 r^2\\theta$. AS: **sine rule for a missing side** with an ambiguous case, **area 15 gives two possible $\\cos\\theta$** (AS 2018), bearings of masts (AS 2023).",
    { callout: { t: "memorise", body: "Sine rule $\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B}$ · cosine rule $a^2 = b^2 + c^2 - 2bc\\cos A$ · area $\\tfrac12 ab\\sin C$ · arc $s = r\\theta$ · sector $A = \\tfrac12 r^2\\theta$ · segment $= \\tfrac12 r^2(\\theta - \\sin\\theta)$ · **$\\theta$ in radians**." }}
  ],
  flashcards: [
    ["Arc length and sector area for $r = 6$, $\\theta = \\tfrac{2\\pi}{3}$?", "$s = 4\\pi$, $A = 12\\pi$."],
    ["A sector has area 11 and perimeter equal to 4 times the arc length. Find $r$.", "$2r + r\\theta = 4r\\theta \\Rightarrow \\theta = \\tfrac23$; $\\tfrac12 r^2 \\cdot \\tfrac23 = 11 \\Rightarrow r^2 = 33 \\Rightarrow r = \\sqrt{33}$."],
    ["Triangle with sides 5, 7 and included angle $60°$: third side?", "$\\sqrt{25 + 49 - 35} = \\sqrt{39}$."],
    ["Triangle area 15 with sides 6 and 10: possible values of $\\cos\\theta$?", "$\\tfrac12 \\cdot 60\\sin\\theta = 15 \\Rightarrow \\sin\\theta = \\tfrac12 \\Rightarrow \\theta = 30°$ or $150°$: $\\cos\\theta = \\pm\\dfrac{\\sqrt3}{2}$."],
    ["Segment area for $r = 4$, $\\theta = \\tfrac\\pi3$?", "$\\tfrac12 \\cdot 16(\\tfrac\\pi3 - \\tfrac{\\sqrt3}{2}) = \\tfrac{8\\pi}{3} - 4\\sqrt3$."],
    ["Convert $150°$ to radians and $\\tfrac{3\\pi}{4}$ to degrees.", "$\\tfrac{5\\pi}{6}$; $135°$."],
    ["What error does a student make computing $\\tfrac12 \\cdot 8^2 \\cdot 40$ for a sector with a $40°$ angle?", "The angle must be in radians: $40° = \\tfrac{2\\pi}{9}$, area $= 32 \\cdot \\tfrac{2\\pi}{9} = \\tfrac{64\\pi}{9}$."],
    ["Sine rule ambiguous case: when does a second triangle exist?", "When the given angle is opposite the shorter of two given sides — $\\sin B$ has two solutions $B$ and $180° - B$, both valid if they leave a positive third angle."],
    ["Perimeter of a sector with $r = 5$ and $\\theta = 1.2$ rad?", "$2r + r\\theta = 10 + 6 = 16$."],
    ["Three masts: B is 8 km from A on a bearing of $050°$, C is 6 km from A on $110°$. Distance BC?", "Angle BAC $= 60°$: $BC^2 = 64 + 36 - 96\\cos 60° = 52$, $BC = 2\\sqrt{13}$ km."]
  ],
  quiz: [
    { q: "$\\tfrac{5\\pi}{6}$ radians in degrees:", opts: ["150", "120", "210", "300"], ans: 0, why: "$\\pi = 180°$." },
    { q: "Sector area with $r = 3$, $\\theta = 2$ rad:", opts: ["6", "9", "3", "18"], ans: 1, why: "$\\tfrac12 \\cdot 9 \\cdot 2$." },
    { q: "Arc length with $r = 10$, $\\theta = 0.4$:", opts: ["4", "2", "40", "0.04"], ans: 0, why: "$r\\theta$." },
    { q: "Area of a triangle with sides 4, 5 and included angle $30°$:", opts: ["5", "10", "20", "$5\\sqrt3$"], ans: 0, why: "$\\tfrac12 \\cdot 20 \\cdot \\tfrac12$." },
    { q: "In the cosine rule $a^2 = b^2 + c^2 - 2bc\\cos A$, $A$ is:", opts: ["any angle", "the angle opposite side $a$", "the largest angle", "$90°$"], ans: 1, why: "Opposite the side being found." },
    { q: "Perimeter of a sector includes:", opts: ["the arc only", "two radii and the arc", "the chord", "the diameter"], ans: 1, why: "$2r + r\\theta$." },
    { q: "Using $\\tfrac12 r^2\\theta$ with $\\theta = 60$ (degrees) is wrong because:", opts: ["the formula needs $\\theta$ in radians", "60 is too large", "$r$ should be squared later", "it is correct"], ans: 0, why: "2019 error-spotting question." }
  ],
  exam: [
    { src: "Edexcel 2018 P1 Q3", q: "A sector of a circle of radius $r$ cm has area 11 cm². The perimeter of the sector is 4 times the length of its arc. Find the exact value of $r$.", marks: 4,
      ms: ["M1: $2r + r\\theta = 4r\\theta$", "A1: $\\theta = \\tfrac23$", "M1: $\\tfrac12 r^2 \\times \\tfrac23 = 11$", "A1: $r = \\sqrt{33}$"] },
    { src: "Edexcel 2024 P1 Q11", ctx: "A badge is made from three pieces sharing a common centre $O$: a semicircle of radius 6 cm, a sector of radius 6 cm with angle $\\tfrac\\pi3$, and a triangle $OAB$ with $OA = OB = 6$ cm and angle $AOB = \\tfrac\\pi3$.",
      parts: [
        { q: "Find the exact area of the triangle $OAB$.", marks: 2, ms: ["M1: $\\tfrac12 \\cdot 6 \\cdot 6 \\sin\\tfrac\\pi3$", "A1: $9\\sqrt3$"] },
        { q: "Hence find the total area of the semicircle, the sector and the triangle in the form $a\\sqrt3 + b\\pi$.", marks: 2, ms: ["M1: semicircle $18\\pi$, sector $\\tfrac12 \\cdot 36 \\cdot \\tfrac\\pi3 = 6\\pi$", "A1: $9\\sqrt3 + 24\\pi$"] }
      ] },
    { src: "Edexcel 2019 P1 Q3", ctx: "A student finds the area of a sector with radius 8 cm and angle $40°$ by writing: area $= \\tfrac12 \\times 8^2 \\times 40 = 1280$ cm².",
      parts: [
        { q: "Identify the error the student has made.", marks: 1, ms: ["B1: the angle must be in radians when using $\\tfrac12 r^2\\theta$"] },
        { q: "Find the correct area, giving your answer in terms of $\\pi$.", marks: 2, ms: ["M1: $40° = \\tfrac{2\\pi}{9}$ radians", "A1: $\\tfrac12 \\times 64 \\times \\tfrac{2\\pi}{9} = \\tfrac{64\\pi}{9}$ cm²"] }
      ] },
    { level: "AS", src: "Edexcel AS 2018 P1 Q7", ctx: "Triangle $ABC$ has $AB = 6$ cm, $AC = 10$ cm and area 15 cm². Angle $BAC = \\theta$.",
      parts: [
        { q: "Find the two possible values of $\\cos\\theta$.", marks: 3, ms: ["M1: $\\tfrac12 \\times 6 \\times 10 \\times \\sin\\theta = 15$", "A1: $\\sin\\theta = \\tfrac12$, so $\\theta = 30°$ or $150°$", "A1: $\\cos\\theta = \\pm\\dfrac{\\sqrt3}{2}$"] },
        { q: "Given that $\\theta$ is obtuse, find the exact length of $BC$.", marks: 3, ms: ["M1: $BC^2 = 36 + 100 - 120\\cos 150°$", "A1: $= 136 + 60\\sqrt3$", "A1: $BC = \\sqrt{136 + 60\\sqrt3}$ cm (accept $2\\sqrt{34 + 15\\sqrt3}$)"] }
      ] },
    { level: "AS", src: "Edexcel AS 2023 P1 Q3", q: "Three radio masts $A$, $B$ and $C$ are on horizontal ground. $B$ is 8 km from $A$ on a bearing of $050°$, and $C$ is 6 km from $A$ on a bearing of $110°$. Find the distance $BC$, giving your answer as a simplified surd.", marks: 4,
      ms: ["M1: angle $BAC = 110° - 50° = 60°$", "M1: $BC^2 = 8^2 + 6^2 - 2 \\times 8 \\times 6\\cos 60°$", "A1: $BC^2 = 52$", "A1: $BC = 2\\sqrt{13}$ km"] }
  ]
});

X("maths:5.2", {
  flashcards: [
    ["State the small-angle approximations.", "$\\sin\\theta \\approx \\theta$, $\\cos\\theta \\approx 1 - \\dfrac{\\theta^2}{2}$, $\\tan\\theta \\approx \\theta$, for small $\\theta$ in radians."],
    ["Approximate $\\dfrac{\\sin 2\\theta}{\\theta\\cos\\theta}$ for small $\\theta$.", "$\\dfrac{2\\theta}{\\theta(1 - \\theta^2/2)} \\approx 2$ (to first order; $\\approx 2 + \\theta^2$ with the next term)."],
    ["Approximate $4\\sin\\tfrac\\theta2 + 3\\cos 2\\theta$.", "$2\\theta + 3(1 - 2\\theta^2) = 3 + 2\\theta - 6\\theta^2$."],
    ["Approximate $\\dfrac{\\theta\\tan 2\\theta}{1 - \\cos 3\\theta}$.", "$\\dfrac{\\theta \\cdot 2\\theta}{9\\theta^2/2} = \\dfrac{4}{9}$."],
    ["Use small angles to estimate the root of $\\cos x = 2x + 0.5$… set-up?", "$1 - \\dfrac{x^2}{2} = 2x + 0.5 \\Rightarrow x^2 + 4x - 1 = 0 \\Rightarrow x = -2 + \\sqrt5 \\approx 0.236$."],
    ["Why must $\\theta$ be in radians?", "The approximations come from the series $\\sin\\theta = \\theta - \\theta^3/6 + \\ldots$, which holds only in radians."],
    ["Approximate $\\cos\\theta - 1 + \\theta\\sin\\theta$.", "$-\\dfrac{\\theta^2}{2} + \\theta^2 = \\dfrac{\\theta^2}{2}$."],
    ["Estimate $\\sin 0.1$ and $\\cos 0.1$.", "$0.1$ and $0.995$."]
  ],
  quiz: [
    { q: "For small $\\theta$, $\\cos\\theta \\approx$", opts: ["$\\theta$", "$1 - \\theta^2/2$", "$1 - \\theta$", "$\\theta^2$"], ans: 1, why: "Second-order term." },
    { q: "$\\sin 3\\theta \\approx$", opts: ["$3\\theta$", "$\\theta$", "$3$", "$1 - 4.5\\theta^2$"], ans: 0, why: "Replace $\\theta$ by $3\\theta$." },
    { q: "$1 - \\cos 2\\theta \\approx$", opts: ["$2\\theta$", "$2\\theta^2$", "$\\theta^2$", "$4\\theta$"], ans: 1, why: "$(2\\theta)^2/2$." },
    { q: "$\\dfrac{\\tan\\theta}{\\sin 2\\theta} \\approx$", opts: ["$\\tfrac12$", "$2$", "$\\theta$", "$1$"], ans: 0, why: "$\\theta / 2\\theta$." },
    { q: "Small-angle approximations are valid when $\\theta$ is:", opts: ["in degrees", "small and in radians", "any size", "negative"], ans: 1, why: "Series validity." },
    { q: "$\\cos 0.2 \\approx$", opts: ["0.8", "0.98", "0.96", "1.02"], ans: 1, why: "$1 - 0.02$." }
  ],
  exam: [
    { src: "Edexcel 2024 P1 Q5", q: "For small values of $\\theta$, show that $\\dfrac{\\theta\\tan 2\\theta}{1 - \\cos 3\\theta} \\approx k$, where $k$ is a constant to be found.", marks: 3,
      ms: ["M1: $\\tan 2\\theta \\approx 2\\theta$", "M1: $1 - \\cos 3\\theta \\approx \\dfrac{9\\theta^2}{2}$", "A1: $\\dfrac{2\\theta^2}{9\\theta^2/2} = \\dfrac49$"] },
    { src: "Edexcel 2019 P1 Q2", ctx: "The equation $\\cos x = 2x + 0.5$ has exactly one real root $\\alpha$.",
      parts: [
        { q: "Show that $\\alpha$ lies between 0.2 and 0.3.", marks: 2, ms: ["M1: $f(x) = \\cos x - 2x - 0.5$: $f(0.2) = 0.080$, $f(0.3) = -0.145$", "A1: change of sign and $f$ continuous, so a root lies in $(0.2, 0.3)$"] },
        { q: "Use small-angle approximations to find an estimate for $\\alpha$, to 3 decimal places.", marks: 3, ms: ["M1: $1 - \\dfrac{x^2}{2} = 2x + 0.5$", "M1: $x^2 + 4x - 1 = 0 \\Rightarrow x = -2 \\pm \\sqrt5$", "A1: $\\alpha \\approx 0.236$"] }
      ] },
    { src: "Edexcel Oct 2021 P1 Q4", q: "Find, in terms of $\\theta$, an approximation for $4\\sin\\left(\\dfrac\\theta2\\right) + 3\\cos 2\\theta$ when $\\theta$ is small, giving your answer in the form $a + b\\theta + c\\theta^2$.", marks: 3,
      ms: ["M1: $\\sin\\tfrac\\theta2 \\approx \\tfrac\\theta2$", "M1: $\\cos 2\\theta \\approx 1 - 2\\theta^2$", "A1: $3 + 2\\theta - 6\\theta^2$"] }
  ]
});

X("maths:5.3", {
  flashcards: [
    ["Exact values: $\\sin 30°$, $\\cos 30°$, $\\tan 30°$?", "$\\tfrac12$, $\\dfrac{\\sqrt3}{2}$, $\\dfrac{1}{\\sqrt3}$."],
    ["Exact values: $\\sin\\tfrac\\pi4$, $\\cos\\tfrac\\pi3$, $\\tan\\tfrac\\pi3$?", "$\\dfrac{\\sqrt2}{2}$, $\\tfrac12$, $\\sqrt3$."],
    ["Period of $\\sin x$, $\\cos x$, $\\tan x$?", "$360°$ ($2\\pi$), $360°$, $180°$ ($\\pi$)."],
    ["$\\sin(180° - \\theta)$, $\\cos(360° - \\theta)$, $\\tan(180° + \\theta)$ in terms of $\\theta$?", "$\\sin\\theta$, $\\cos\\theta$, $\\tan\\theta$."],
    ["$y = 3\\cos x$ minimum point in $0 \\le x \\le 360°$?", "$(180°, -3)$."],
    ["Describe $y = \\sin(x - 30°)$ compared with $y = \\sin x$.", "Translation by $30°$ to the right."],
    ["$\\sin(nx) = k$ ($0 < k < 1$) has 6 solutions in $0 \\le x < 360°$. Find $n$.", "$\\sin$ gives 2 solutions per cycle; $n = 3$."],
    ["How many solutions does $\\sin^2(3x) = k^2$ have in $0 \\le x < 360°$ for $0 < k < 1$?", "$\\sin 3x = \\pm k$: 6 + 6 = 12."],
    ["Asymptotes of $y = \\tan x$?", "$x = 90° + 180°n$."],
    ["$\\cos\\theta = -\\dfrac{\\sqrt3}{2}$, $0 \\le \\theta \\le 360°$: solutions?", "$150°, 210°$."]
  ],
  quiz: [
    { q: "$\\sin 150° =$", opts: ["$\\tfrac12$", "$-\\tfrac12$", "$\\dfrac{\\sqrt3}{2}$", "$-\\dfrac{\\sqrt3}{2}$"], ans: 0, why: "$\\sin(180° - 30°)$." },
    { q: "$\\cos 240° =$", opts: ["$\\tfrac12$", "$-\\tfrac12$", "$\\dfrac{\\sqrt3}{2}$", "$-\\dfrac{\\sqrt3}{2}$"], ans: 1, why: "Third quadrant, reference $60°$." },
    { q: "$\\tan\\tfrac{3\\pi}{4} =$", opts: ["1", "$-1$", "$\\sqrt3$", "0"], ans: 1, why: "Second quadrant." },
    { q: "Period of $y = \\cos 3x$ in degrees:", opts: ["360", "120", "180", "90"], ans: 1, why: "$360/3$." },
    { q: "$y = \\sin x$ has maximum value:", opts: ["1 at $x = 90°$", "1 at $x = 0$", "0", "$\\infty$"], ans: 0, why: "Peak." },
    { q: "Number of solutions of $\\cos 2x = 0.3$ in $0 \\le x < 360°$:", opts: ["2", "4", "1", "8"], ans: 1, why: "Two cycles, two each." },
    { q: "$\\sin\\theta = \\sin(180° - \\theta)$ shows sine is symmetric about:", opts: ["$\\theta = 0$", "$\\theta = 90°$", "$\\theta = 180°$", "the origin"], ans: 1, why: "Reflection line." }
  ],
  exam: [
    { src: "Edexcel 2025 P1 Q13", ctx: "The equation $\\sin(nx) = k$, where $n$ is a positive integer and $0 < k < 1$, has exactly 6 solutions in the interval $0 \\le x < 360°$.",
      parts: [
        { q: "Deduce the value of $n$.", marks: 1, ms: ["B1: $n = 3$"] },
        { q: "Hence state the number of solutions of $\\sin^2(nx) = k^2$ in the same interval.", marks: 2, ms: ["M1: $\\sin 3x = k$ or $\\sin 3x = -k$", "A1: 12"] }
      ] },
    { level: "AS", src: "Edexcel AS 2020 P1 Q9", ctx: "The curve $y = 3\\cos x$, $0 \\le x \\le 360°$.",
      parts: [
        { q: "State the coordinates of the minimum point of the curve.", marks: 1, ms: ["B1: $(180°, -3)$"] },
        { q: "Describe fully the transformation that maps $y = \\cos x$ onto $y = 3\\cos x$.", marks: 1, ms: ["B1: stretch parallel to the $y$-axis, scale factor 3"] },
        { q: "Solve $3\\cos\\theta = 8\\tan\\theta$ for $0 \\le \\theta \\le 360°$, giving your answers to 1 decimal place.", marks: 6, ms: ["M1: $3\\cos\\theta = \\dfrac{8\\sin\\theta}{\\cos\\theta}$, so $3\\cos^2\\theta = 8\\sin\\theta$", "M1: $3(1 - \\sin^2\\theta) = 8\\sin\\theta$", "A1: $3\\sin^2\\theta + 8\\sin\\theta - 3 = 0 \\Rightarrow (3\\sin\\theta - 1)(\\sin\\theta + 3) = 0$", "A1: $\\sin\\theta = \\tfrac13$ (rejecting $-3$)", "A1: $\\theta = 19.5°$", "A1: $\\theta = 160.5°$"] }
      ] }
  ]
});

X("maths:5.4", {
  flashcards: [
    ["Define $\\sec\\theta$, $\\csc\\theta$, $\\cot\\theta$.", "$\\dfrac{1}{\\cos\\theta}$, $\\dfrac{1}{\\sin\\theta}$, $\\dfrac{1}{\\tan\\theta} = \\dfrac{\\cos\\theta}{\\sin\\theta}$."],
    ["Domain and range of $\\arcsin x$?", "Domain $-1 \\le x \\le 1$, range $-\\tfrac\\pi2 \\le y \\le \\tfrac\\pi2$."],
    ["Domain and range of $\\arccos x$?", "Domain $-1 \\le x \\le 1$, range $0 \\le y \\le \\pi$."],
    ["Range of $\\arctan x$?", "$-\\tfrac\\pi2 < y < \\tfrac\\pi2$, with horizontal asymptotes $y = \\pm\\tfrac\\pi2$."],
    ["Exact value of $\\sec 60°$ and $\\csc 30°$?", "2 and 2."],
    ["Exact value of $\\cot\\tfrac{\\pi}{6}$?", "$\\sqrt3$."],
    ["Asymptotes of $y = \\sec x$?", "Where $\\cos x = 0$: $x = \\pm 90°, \\pm 270°, \\ldots$"],
    ["Solve $\\sec\\theta = 2$, $0 \\le \\theta \\le 360°$.", "$\\cos\\theta = \\tfrac12$: $60°, 300°$."],
    ["Value of $\\arccos(-\\tfrac12)$?", "$\\tfrac{2\\pi}{3}$."],
    ["Range of $y = \\csc x$?", "$y \\le -1$ or $y \\ge 1$."]
  ],
  quiz: [
    { q: "$\\sec\\theta =$", opts: ["$\\dfrac{1}{\\sin\\theta}$", "$\\dfrac{1}{\\cos\\theta}$", "$\\dfrac{1}{\\tan\\theta}$", "$\\cos^{-1}\\theta$"], ans: 1, why: "Reciprocal of cosine." },
    { q: "$\\arcsin\\left(\\dfrac{\\sqrt3}{2}\\right) =$", opts: ["$\\tfrac\\pi6$", "$\\tfrac\\pi3$", "$\\tfrac{2\\pi}{3}$", "$\\tfrac\\pi4$"], ans: 1, why: "Principal value." },
    { q: "$\\arccos x$ has range:", opts: ["$[-\\tfrac\\pi2, \\tfrac\\pi2]$", "$[0, \\pi]$", "$(-\\tfrac\\pi2, \\tfrac\\pi2)$", "$[0, 2\\pi]$"], ans: 1, why: "Definition." },
    { q: "$\\csc 210° =$", opts: ["$-2$", "$2$", "$-\\tfrac12$", "$\\dfrac{2}{\\sqrt3}$"], ans: 0, why: "$\\sin 210° = -\\tfrac12$." },
    { q: "$\\cot x$ is undefined when:", opts: ["$\\cos x = 0$", "$\\sin x = 0$", "$\\tan x = 1$", "never"], ans: 1, why: "Division by $\\sin x$." },
    { q: "The graph of $y = \\arctan x$ approaches:", opts: ["$y = \\pm\\pi$", "$y = \\pm\\tfrac\\pi2$", "$x = \\pm\\tfrac\\pi2$", "$y = 0$"], ans: 1, why: "Horizontal asymptotes." }
  ],
  exam: [
    { src: "Edexcel 2021 P2 Q2", parts: [
      { q: "Sketch the graph of $y = \\sec x$ for $-180° \\le x \\le 180°$, stating the equations of the asymptotes.", marks: 3, ms: ["B1: U-shape with minimum $(0, 1)$", "B1: two downward branches with maxima $(\\pm 180°, -1)$", "B1: asymptotes $x = \\pm 90°$"] },
      { q: "Solve $\\sec x = -2$ for $-180° \\le x \\le 180°$.", marks: 2, ms: ["M1: $\\cos x = -\\tfrac12$", "A1: $x = \\pm 120°$"] }
    ] },
    { src: "Edexcel 2020 P1 Q3", q: "Find the exact value of $\\arcsin\\left(\\sin\\dfrac{5\\pi}{6}\\right)$, explaining why it is not $\\dfrac{5\\pi}{6}$.", marks: 2,
      ms: ["M1: $\\sin\\dfrac{5\\pi}{6} = \\tfrac12$ so $\\arcsin\\tfrac12 = \\tfrac\\pi6$", "A1: $\\arcsin$ returns the principal value in $[-\\tfrac\\pi2, \\tfrac\\pi2]$, and $\\tfrac{5\\pi}{6}$ lies outside it"] }
  ]
});

X("maths:5.5", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Identities — 'show that … hence solve'" },
    "Every A-level paper has a **prove-then-solve** pair: $\\dfrac{1 - \\cos 2\\theta}{\\sin 2\\theta} \\equiv \\tan\\theta$, $\\csc\\theta - \\sin\\theta \\equiv \\cos\\theta\\cot\\theta$, $\\cos 3A \\equiv 4\\cos^3 A - 3\\cos A$, $\\csc 2x + \\cot 2x \\equiv \\cot x$, $\\dfrac{1}{\\cos\\theta} + \\tan\\theta \\equiv \\dfrac{\\cos\\theta}{1 - \\sin\\theta}$. Proof marks: **start from one side**, use the identities, **reach the other side** with every step shown. Then \"hence solve …\" replaces the awkward expression by the simple one and gives a standard equation.",
    { callout: { t: "memorise", body: "$\\sin^2 + \\cos^2 = 1$ · $1 + \\tan^2 = \\sec^2$ · $1 + \\cot^2 = \\csc^2$ · $\\tan = \\dfrac{\\sin}{\\cos}$. **Convert everything to $\\sin$ and $\\cos$** when stuck; multiply by a conjugate ($1 + \\sin\\theta$) to clear a denominator." }}
  ],
  flashcards: [
    ["Prove $\\dfrac{1}{\\cos\\theta} + \\tan\\theta \\equiv \\dfrac{\\cos\\theta}{1 - \\sin\\theta}$.", "LHS $= \\dfrac{1 + \\sin\\theta}{\\cos\\theta} = \\dfrac{(1+\\sin\\theta)(1-\\sin\\theta)}{\\cos\\theta(1 - \\sin\\theta)} = \\dfrac{\\cos^2\\theta}{\\cos\\theta(1-\\sin\\theta)} = \\dfrac{\\cos\\theta}{1 - \\sin\\theta}$."],
    ["Prove $\\csc\\theta - \\sin\\theta \\equiv \\cos\\theta\\cot\\theta$.", "$\\dfrac{1}{\\sin\\theta} - \\sin\\theta = \\dfrac{1 - \\sin^2\\theta}{\\sin\\theta} = \\dfrac{\\cos^2\\theta}{\\sin\\theta} = \\cos\\theta\\cdot\\dfrac{\\cos\\theta}{\\sin\\theta}$."],
    ["Simplify $\\dfrac{\\sin^2\\theta}{1 - \\cos\\theta}$.", "$\\dfrac{(1-\\cos\\theta)(1+\\cos\\theta)}{1 - \\cos\\theta} = 1 + \\cos\\theta$."],
    ["Write $\\tan^2\\theta$ in terms of $\\sec\\theta$.", "$\\sec^2\\theta - 1$."],
    ["Show $\\dfrac{\\cos\\theta}{1 + \\sin\\theta} + \\dfrac{\\cos\\theta}{1 - \\sin\\theta} \\equiv 2\\sec\\theta$.", "Common denominator $1 - \\sin^2\\theta = \\cos^2\\theta$: numerator $2\\cos\\theta$, so $\\dfrac{2\\cos\\theta}{\\cos^2\\theta} = 2\\sec\\theta$."],
    ["Rewrite $4\\cos\\theta - 1 = 2\\sin\\theta\\tan\\theta$ as a quadratic in $\\cos\\theta$.", "$4\\cos^2\\theta - \\cos\\theta = 2\\sin^2\\theta = 2 - 2\\cos^2\\theta \\Rightarrow 6\\cos^2\\theta - \\cos\\theta - 2 = 0$."],
    ["Prove $(\\sin\\theta + \\cos\\theta)^2 \\equiv 1 + \\sin 2\\theta$.", "$\\sin^2 + 2\\sin\\cos + \\cos^2 = 1 + \\sin 2\\theta$."],
    ["Simplify $\\sec^2\\theta\\cos^2\\theta + \\cot^2\\theta\\sin^2\\theta$.", "$1 + \\cos^2\\theta$."]
  ],
  quiz: [
    { q: "$1 + \\tan^2\\theta \\equiv$", opts: ["$\\csc^2\\theta$", "$\\sec^2\\theta$", "$\\cot^2\\theta$", "$1$"], ans: 1, why: "Divide $\\sin^2 + \\cos^2 = 1$ by $\\cos^2$." },
    { q: "$\\dfrac{\\sin\\theta}{\\cos\\theta} \\cdot \\dfrac{\\cos\\theta}{\\sin\\theta} =$", opts: ["$\\tan^2\\theta$", "1", "$\\sin\\theta\\cos\\theta$", "0"], ans: 1, why: "$\\tan \\cdot \\cot$." },
    { q: "$\\csc^2\\theta - \\cot^2\\theta =$", opts: ["1", "$-1$", "$\\sin^2\\theta$", "$\\tan^2\\theta$"], ans: 0, why: "Pythagorean identity." },
    { q: "$(1 - \\sin\\theta)(1 + \\sin\\theta) =$", opts: ["$\\sin^2\\theta$", "$\\cos^2\\theta$", "$1$", "$\\cos 2\\theta$"], ans: 1, why: "$1 - \\sin^2$." },
    { q: "To prove an identity you should:", opts: ["assume it and simplify both sides to 0 = 0", "start from one side and transform it into the other", "substitute a value", "square both sides"], ans: 1, why: "Valid proof structure." },
    { q: "$\\sec\\theta\\cot\\theta =$", opts: ["$\\csc\\theta$", "$\\sin\\theta$", "$\\tan\\theta$", "$\\cos\\theta$"], ans: 0, why: "$\\dfrac{1}{\\cos}\\cdot\\dfrac{\\cos}{\\sin}$." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2022 P1 Q13", parts: [
      { q: "Show that $\\dfrac{1}{\\cos\\theta} + \\tan\\theta \\equiv \\dfrac{\\cos\\theta}{1 - \\sin\\theta}$, $\\cos\\theta \\ne 0$.", marks: 3, ms: ["M1: LHS $= \\dfrac{1 + \\sin\\theta}{\\cos\\theta}$", "M1: multiplies numerator and denominator by $1 - \\sin\\theta$ and uses $1 - \\sin^2\\theta = \\cos^2\\theta$", "A1: $\\dfrac{\\cos^2\\theta}{\\cos\\theta(1 - \\sin\\theta)} = \\dfrac{\\cos\\theta}{1 - \\sin\\theta}$ (cso)"] },
      { q: "Hence solve $\\dfrac{1}{\\cos\\theta} + \\tan\\theta = 4\\cos\\theta$ for $0 \\le \\theta < 360°$.", marks: 5, ms: ["M1: $\\dfrac{\\cos\\theta}{1 - \\sin\\theta} = 4\\cos\\theta$", "A1: $\\cos\\theta = 0$ or $1 - \\sin\\theta = \\tfrac14$", "A1: $\\theta = 90°, 270°$ from $\\cos\\theta = 0$ — reject as $\\cos\\theta \\ne 0$ makes the original undefined", "M1: $\\sin\\theta = \\tfrac34$", "A1: $\\theta = 48.6°, 131.4°$"] }
    ] },
    { src: "Edexcel Oct 2020 P1 Q12", parts: [
      { q: "Show that $\\csc\\theta - \\sin\\theta \\equiv \\cos\\theta\\cot\\theta$.", marks: 3, ms: ["M1: $\\dfrac{1}{\\sin\\theta} - \\sin\\theta = \\dfrac{1 - \\sin^2\\theta}{\\sin\\theta}$", "M1: $= \\dfrac{\\cos^2\\theta}{\\sin\\theta}$", "A1: $= \\cos\\theta \\cdot \\dfrac{\\cos\\theta}{\\sin\\theta} = \\cos\\theta\\cot\\theta$"] },
      { q: "Hence solve $\\csc\\theta - \\sin\\theta = \\cos\\theta$ for $0 < \\theta < 360°$.", marks: 5, ms: ["M1: $\\cos\\theta\\cot\\theta = \\cos\\theta \\Rightarrow \\cos\\theta(\\cot\\theta - 1) = 0$", "A1: $\\cos\\theta = 0$: $90°, 270°$", "A1: $\\tan\\theta = 1$: $45°$", "A1: $225°$", "B1: all four solutions and no extras (checks $\\sin\\theta \\ne 0$)"] }
    ] },
    { level: "AS", src: "Edexcel AS 2018 P1 Q12", q: "Show that $4\\cos\\theta - 1 = 2\\sin\\theta\\tan\\theta$ can be written as $6\\cos^2\\theta - \\cos\\theta - 2 = 0$, and hence solve $4\\cos 3x - 1 = 2\\sin 3x\\tan 3x$ for $0 \\le x < 120°$.", marks: 7,
      ms: ["M1: $\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$ and multiply through by $\\cos\\theta$: $4\\cos^2\\theta - \\cos\\theta = 2\\sin^2\\theta$", "M1: $\\sin^2\\theta = 1 - \\cos^2\\theta$", "A1: $6\\cos^2\\theta - \\cos\\theta - 2 = 0$ (cso)", "M1: $(3\\cos\\theta - 2)(2\\cos\\theta + 1) = 0$", "A1: $\\cos 3x = \\tfrac23$ or $-\\tfrac12$", "A1: $3x = 48.2°, 311.8°, 120°, 240°$", "A1: $x = 16.1°, 40°, 80°, 103.9°$"] }
  ]
});

X("maths:5.6", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "$R\\cos(\\theta \\pm \\alpha)$ — the modelling question (7–11 marks)" },
    "Express $a\\cos\\theta + b\\sin\\theta$ (or with a minus) in the form $R\\cos(\\theta - \\alpha)$: $R = \\sqrt{a^2 + b^2}$, $\\tan\\alpha = \\dfrac ba$ (check the sign pattern by expanding). Then the **model**: temperature $T = 12 + \\sin t + 2\\cos t$, water depth $D = 5 + 2\\sin\\ldots$, a water wheel, a rabbit population $140\\cos\\theta - 480\\sin\\theta$ — **maximum value** is $R$ (or $c + R$) **when the cosine is 1**, so $\\theta = \\alpha$ (solve for $t$ within the domain); **minimum** $c - R$; **first time the value reaches** a target: set the expression equal, solve the cosine equation, choose the smallest valid $t$. **Double-angle** forms: $\\cos 2A = 2\\cos^2 A - 1 = 1 - 2\\sin^2 A$; $\\sin 2A = 2\\sin A\\cos A$; $\\tan 2A = \\dfrac{2\\tan A}{1 - \\tan^2 A}$. **Addition formulae** produce $\\cos 3A \\equiv 4\\cos^3 A - 3\\cos A$ (Oct 2020) and the 2022/2025 \"show that $\\tan x = \\ldots$\" items.",
    { callout: { t: "warn", body: "Give $\\alpha$ to **at least 3 decimal places in radians** (or 2 d.p. in degrees) and carry the unrounded value; the final answer is usually asked to 1 d.p. State the maximum **and the value of $\\theta$/$t$ at which it occurs** — both marks." }}
  ],
  flashcards: [
    ["Express $\\sin x + 2\\cos x$ as $R\\sin(x + \\alpha)$.", "$R = \\sqrt5$, $\\tan\\alpha = 2$, $\\alpha = 1.107$: $\\sqrt5\\sin(x + 1.107)$."],
    ["Express $2\\cos\\theta + 8\\sin\\theta$ as $R\\cos(\\theta - \\alpha)$.", "$R = \\sqrt{68} = 2\\sqrt{17}$, $\\tan\\alpha = 4$, $\\alpha = 1.326$."],
    ["Maximum of $12 + \\sqrt5\\sin(t + 1.107)$ and when?", "$12 + \\sqrt5$ when $t + 1.107 = \\tfrac\\pi2$, i.e. $t = 0.464$."],
    ["$\\cos 2A$ — three forms?", "$\\cos^2 A - \\sin^2 A = 2\\cos^2 A - 1 = 1 - 2\\sin^2 A$."],
    ["Show $\\cos 3A \\equiv 4\\cos^3 A - 3\\cos A$.", "$\\cos(2A + A) = \\cos 2A\\cos A - \\sin 2A\\sin A = (2\\cos^2 A - 1)\\cos A - 2\\sin^2 A\\cos A = 2\\cos^3 A - \\cos A - 2(1 - \\cos^2 A)\\cos A$."],
    ["Expand $\\sin(x + 30°)$.", "$\\sin x\\cos 30° + \\cos x\\sin 30° = \\dfrac{\\sqrt3}{2}\\sin x + \\tfrac12\\cos x$."],
    ["Show $\\sin(x + 30°) + \\sqrt3\\cos(x + 30°) \\equiv 2\\cos x$.", "$\\dfrac{\\sqrt3}{2}\\sin x + \\tfrac12\\cos x + \\sqrt3\\left(\\dfrac{\\sqrt3}{2}\\cos x - \\tfrac12\\sin x\\right) = \\tfrac12\\cos x + \\tfrac32\\cos x = 2\\cos x$."],
    ["Solve $5\\sin x - 5\\cos x = 2$ for $0 \\le x < 360°$.", "$5\\sqrt2\\sin(x - 45°) = 2 \\Rightarrow \\sin(x - 45°) = 0.2828 \\Rightarrow x = 61.4°, 208.6°$."],
    ["$\\tan 2A$ in terms of $\\tan A$?", "$\\dfrac{2\\tan A}{1 - \\tan^2 A}$."],
    ["Minimum of $140\\cos\\theta - 480\\sin\\theta$?", "$R = 500$; minimum $-500$ when $\\cos(\\theta + \\alpha) = -1$."]
  ],
  quiz: [
    { q: "$R$ for $3\\cos\\theta + 4\\sin\\theta$:", opts: ["7", "5", "25", "1"], ans: 1, why: "$\\sqrt{9 + 16}$." },
    { q: "$\\sin 2A =$", opts: ["$2\\sin A$", "$2\\sin A\\cos A$", "$\\sin^2 A$", "$1 - 2\\sin^2 A$"], ans: 1, why: "Double angle." },
    { q: "$\\cos(A - B) =$", opts: ["$\\cos A\\cos B - \\sin A\\sin B$", "$\\cos A\\cos B + \\sin A\\sin B$", "$\\sin A\\cos B - \\cos A\\sin B$", "$\\cos A - \\cos B$"], ans: 1, why: "Addition formula." },
    { q: "Maximum of $7 + 5\\cos(t - 0.9)$:", opts: ["7", "12", "5", "2"], ans: 1, why: "When the cosine is 1." },
    { q: "$\\cos 2A = 1 - 2\\sin^2 A$ rearranged gives $\\sin^2 A =$", opts: ["$\\dfrac{1 - \\cos 2A}{2}$", "$\\dfrac{1 + \\cos 2A}{2}$", "$1 - \\cos 2A$", "$2\\cos 2A$"], ans: 0, why: "Used for integrating $\\sin^2$." },
    { q: "$\\tan 45° = 1$ so $\\tan(x + 45°) =$", opts: ["$\\dfrac{\\tan x + 1}{1 - \\tan x}$", "$\\tan x + 1$", "$\\dfrac{1 - \\tan x}{1 + \\tan x}$", "$\\tan x$"], ans: 0, why: "Addition formula for tan." },
    { q: "$a\\cos\\theta - b\\sin\\theta$ is written as:", opts: ["$R\\cos(\\theta - \\alpha)$", "$R\\cos(\\theta + \\alpha)$", "$R\\sin(\\theta + \\alpha)$", "$R\\tan\\theta$"], ans: 1, why: "Expanding $R\\cos(\\theta + \\alpha)$ gives $-R\\sin\\alpha\\sin\\theta$." }
  ],
  exam: [
    { src: "Edexcel Oct 2020 P2 Q6", ctx: "The temperature $T$ °C in a greenhouse $t$ hours after 9 am is modelled by $T = 20 + \\sin\\left(\\dfrac{\\pi t}{12}\\right) + 2\\cos\\left(\\dfrac{\\pi t}{12}\\right)$, $0 \\le t \\le 24$.",
      parts: [
        { q: "Express $\\sin x + 2\\cos x$ in the form $R\\sin(x + \\alpha)$, where $R > 0$ and $0 < \\alpha < \\tfrac\\pi2$, giving $\\alpha$ to 3 decimal places.", marks: 3, ms: ["B1: $R = \\sqrt5$", "M1: $\\tan\\alpha = 2$", "A1: $\\alpha = 1.107$"] },
        { q: "Find the maximum temperature and the time at which it occurs.", marks: 4, ms: ["B1: $20 + \\sqrt5 = 22.2$ °C", "M1: $\\dfrac{\\pi t}{12} + 1.107 = \\dfrac\\pi2$", "A1: $t = 1.77$", "A1: at about 10:46 am"] }
      ] },
    { src: "Edexcel 2024 P2 Q12", ctx: "The number of rabbits $N$ in a field $t$ months after observations began is modelled by $N = 900 + 140\\cos\\left(\\dfrac{\\pi t}{6}\\right) - 480\\sin\\left(\\dfrac{\\pi t}{6}\\right)$.",
      parts: [
        { q: "Express $140\\cos\\theta - 480\\sin\\theta$ in the form $K\\cos(\\theta + \\alpha)$, $K > 0$, $0 < \\alpha < \\tfrac\\pi2$.", marks: 3, ms: ["B1: $K = 500$", "M1: $\\tan\\alpha = \\dfrac{480}{140}$", "A1: $\\alpha = 1.287$"] },
        { q: "Find the maximum and minimum numbers of rabbits predicted by the model.", marks: 2, ms: ["B1: 1400", "B1: 400"] },
        { q: "Find the first time, to the nearest day, at which the model predicts 1200 rabbits.", marks: 4, ms: ["M1: $500\\cos\\left(\\dfrac{\\pi t}{6} + 1.287\\right) = 300$", "M1: $\\dfrac{\\pi t}{6} + 1.287 = \\arccos 0.6 = 0.927$ or $2\\pi - 0.927 = 5.356$", "A1: first positive solution from $5.356$: $t = 7.77$ months", "A1: approximately 236 days (accept 7.8 months)"] }
      ] },
    { src: "Edexcel 2025 P1 Q14", parts: [
      { q: "Show that $\\sin(x + 30°) + \\sqrt3\\cos(x + 30°) \\equiv 2\\cos x$.", marks: 4, ms: ["M1: expands $\\sin(x + 30°) = \\dfrac{\\sqrt3}{2}\\sin x + \\tfrac12\\cos x$", "M1: expands $\\cos(x + 30°) = \\dfrac{\\sqrt3}{2}\\cos x - \\tfrac12\\sin x$", "A1: $\\dfrac{\\sqrt3}{2}\\sin x + \\tfrac12\\cos x + \\tfrac32\\cos x - \\dfrac{\\sqrt3}{2}\\sin x$", "A1: $= 2\\cos x$ (cso)"] },
      { q: "Hence solve $\\sin(x + 30°) + \\sqrt3\\cos(x + 30°) = \\sqrt2$ for $0 \\le x < 360°$.", marks: 3, ms: ["M1: $2\\cos x = \\sqrt2 \\Rightarrow \\cos x = \\dfrac{\\sqrt2}{2}$", "A1: $x = 45°$", "A1: $x = 315°$"] }
    ] },
    { src: "Edexcel Oct 2020 P1 Q10", parts: [
      { q: "Show that $\\cos 3A \\equiv 4\\cos^3 A - 3\\cos A$.", marks: 4, ms: ["M1: $\\cos(2A + A) = \\cos 2A\\cos A - \\sin 2A\\sin A$", "M1: substitutes $\\cos 2A = 2\\cos^2 A - 1$ and $\\sin 2A = 2\\sin A\\cos A$", "M1: $\\sin^2 A = 1 - \\cos^2 A$", "A1: $2\\cos^3 A - \\cos A - 2\\cos A + 2\\cos^3 A = 4\\cos^3 A - 3\\cos A$"] },
      { q: "Hence solve $1 - \\cos 3x = \\sin^2 x$ for $0 \\le x \\le \\pi$.", marks: 4, ms: ["M1: $1 - 4\\cos^3 x + 3\\cos x = 1 - \\cos^2 x$", "M1: $\\cos x(4\\cos^2 x - \\cos x - 3) = 0 \\Rightarrow \\cos x(4\\cos x + 3)(\\cos x - 1) = 0$", "A1: $\\cos x = 0, 1, -\\tfrac34$", "A1: $x = \\tfrac\\pi2, 0, 2.42$"] }
    ] }
  ]
});

X("maths:5.7", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Trig equations — the 7 to 9 mark question every paper" },
    "Forms: **quadratic in one ratio** (use $\\sin^2 = 1 - \\cos^2$ or $\\tan = \\sin/\\cos$ then factorise), **multiple angle** ($\\sin(2\\theta + 10°) = -0.6$ — adjust the interval for $2\\theta + 10°$ first, list every solution, then transform back), **$\\sin^2 3x = 4\\cos^2 3x$** → $\\tan 3x = \\pm 2$, and **identify the errors** in a given attempt (AS Nov 2021, Specimen: dividing by $\\sin\\theta$ loses solutions; forgetting the second quadrant; rounding early). \"Hence\" after an identity means **use the simplified form**.",
    { callout: { t: "warn", body: "**Never divide by $\\cos\\theta$ or $\\sin\\theta$** — factorise so $\\cos\\theta = 0$ solutions survive. For $\\cos 3x = k$ with $0 \\le x < 120°$, the range of $3x$ is $0 \\le 3x < 360°$; for $0 \\le x < 360°$ it is three full turns." }}
  ],
  flashcards: [
    ["Solve $2\\sin^2\\theta - \\sin\\theta - 1 = 0$, $0 \\le \\theta < 360°$.", "$(2\\sin\\theta + 1)(\\sin\\theta - 1) = 0$: $\\sin\\theta = -\\tfrac12 \\Rightarrow 210°, 330°$; $\\sin\\theta = 1 \\Rightarrow 90°$."],
    ["Solve $\\sin^2 3x = 4\\cos^2 3x$, $0 \\le x < 180°$.", "$\\tan 3x = \\pm 2$: $3x = 63.4°, 116.6°, 243.4°, 296.6°, 423.4°, 476.6°$ → $x = 21.1°, 38.9°, 81.1°, 98.9°, 141.1°, 158.9°$."],
    ["Solve $\\sin(2\\theta + 10°) = -0.6$, $0 \\le \\theta < 180°$.", "$2\\theta + 10° \\in [10°, 370°)$: $216.9°, 323.1°$ → $\\theta = 103.4°, 156.5°$."],
    ["Solve $5\\cos^2\\theta = 6\\sin\\theta$, $0 \\le \\theta < 360°$.", "$5 - 5\\sin^2 = 6\\sin \\Rightarrow 5\\sin^2 + 6\\sin - 5 = 0 \\Rightarrow \\sin\\theta = \\dfrac{-6 + \\sqrt{136}}{10} = 0.566$: $34.5°, 145.5°$."],
    ["Error: 'dividing $\\sin\\theta\\cos\\theta = \\sin\\theta$ by $\\sin\\theta$ gives $\\cos\\theta = 1$'. What is lost?", "The solutions from $\\sin\\theta = 0$ ($0°, 180°, 360°$); factorise instead: $\\sin\\theta(\\cos\\theta - 1) = 0$."],
    ["Solve $\\tan(\\theta - 30°) = \\sqrt3$, $0 \\le \\theta < 360°$.", "$\\theta - 30° = 60°, 240°$ → $90°, 270°$."],
    ["Solve $3\\tan^2\\theta - 4\\tan\\theta - 4 = 0$.", "$(3\\tan\\theta + 2)(\\tan\\theta - 2) = 0$: $\\tan\\theta = 2$ or $-\\tfrac23$."],
    ["Solve $4\\tan x = 5\\cos x$ as a quadratic in $\\sin x$.", "$4\\sin x = 5\\cos^2 x = 5 - 5\\sin^2 x \\Rightarrow 5\\sin^2 x + 4\\sin x - 5 = 0$."],
    ["How many solutions does $\\cos 3x = 0.2$ have in $0 \\le x < 360°$?", "6."],
    ["Solve $2\\sin 2\\theta = \\cos(2\\theta + 30°)$… first step?", "Expand the right-hand side, collect $\\sin 2\\theta$ and $\\cos 2\\theta$, divide by $\\cos 2\\theta$ to get $\\tan 2\\theta = \\dfrac{\\sqrt3}{5}$."]
  ],
  quiz: [
    { q: "$\\sin\\theta = -\\tfrac12$ in $0 \\le \\theta < 360°$:", opts: ["$30°, 150°$", "$210°, 330°$", "$150°, 210°$", "$30°, 330°$"], ans: 1, why: "Third and fourth quadrants." },
    { q: "$\\cos 2x = 0.5$ for $0 \\le x < 360°$ has:", opts: ["2 solutions", "4 solutions", "1 solution", "8 solutions"], ans: 1, why: "$2x \\in [0, 720°)$." },
    { q: "Solving $\\sin\\theta\\cos\\theta = \\cos\\theta$ by dividing by $\\cos\\theta$:", opts: ["is correct", "loses the $\\cos\\theta = 0$ solutions", "gains solutions", "changes the interval"], ans: 1, why: "Factorise instead." },
    { q: "$\\tan\\theta = 2$ has how many solutions in $0 \\le \\theta < 360°$?", opts: ["1", "2", "4", "0"], ans: 1, why: "Period $180°$." },
    { q: "$2\\cos^2\\theta + 3\\sin\\theta = 3$ becomes:", opts: ["$2\\sin^2\\theta - 3\\sin\\theta + 1 = 0$", "$2\\sin^2\\theta + 3\\sin\\theta - 1 = 0$", "$2\\cos^2\\theta + 3\\cos\\theta = 3$", "$\\tan\\theta = 1$"], ans: 0, why: "$2 - 2\\sin^2 + 3\\sin - 3 = 0$." },
    { q: "For $\\sin(2\\theta + 10°) = k$ with $0 \\le \\theta < 180°$, the interval for $2\\theta + 10°$ is:", opts: ["$[0, 180°)$", "$[10°, 370°)$", "$[10°, 190°)$", "$[0, 360°)$"], ans: 1, why: "Transform the interval first." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2023 P1 Q12", parts: [
      { q: "Show that the equation $4\\tan x = 5\\cos x$ can be written as $5\\sin^2 x + 4\\sin x - 5 = 0$.", marks: 3, ms: ["M1: $\\tan x = \\dfrac{\\sin x}{\\cos x}$ and multiplies by $\\cos x$: $4\\sin x = 5\\cos^2 x$", "M1: $\\cos^2 x = 1 - \\sin^2 x$", "A1: $5\\sin^2 x + 4\\sin x - 5 = 0$ (cso)"] },
      { q: "Hence solve $4\\tan x = 5\\cos x$ for $0 \\le x < 360°$, giving your answers to 1 decimal place.", marks: 4, ms: ["M1: $\\sin x = \\dfrac{-4 \\pm \\sqrt{16 + 100}}{10}$", "A1: $\\sin x = 0.677$ (rejecting $-1.477$)", "A1: $x = 42.6°$", "A1: $x = 137.4°$"] },
      { q: "State the number of solutions of $4\\tan 3x = 5\\cos 3x$ in $0 \\le x < 360°$.", marks: 1, ms: ["B1: 6"] }
    ] },
    { level: "AS", src: "Edexcel AS Nov 2021 P1 Q12", ctx: "A student attempts to solve $5\\cos^2\\theta = 6\\sin\\theta$ for $0 \\le \\theta < 360°$ and writes: \"$5\\cos\\theta = 6\\tan\\theta$ … $\\cos\\theta = \\tfrac65\\tan\\theta$ … using a calculator, $\\theta = 34.5°$\".",
      parts: [
        { q: "Identify two errors in the student's method.", marks: 2, ms: ["B1: dividing by $\\cos\\theta$ is invalid / the first line does not follow ($\\dfrac{\\sin\\theta}{\\cos\\theta}$ is not obtained by dividing $\\sin\\theta$ by $\\cos^2\\theta$ correctly)", "B1: only one solution has been given — the second-quadrant solution has been omitted"] },
        { q: "Solve the equation correctly.", marks: 5, ms: ["M1: $5(1 - \\sin^2\\theta) = 6\\sin\\theta$", "A1: $5\\sin^2\\theta + 6\\sin\\theta - 5 = 0$", "M1: $\\sin\\theta = \\dfrac{-6 + \\sqrt{136}}{10}$", "A1: $\\sin\\theta = 0.566$", "A1: $\\theta = 34.5°, 145.5°$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2025 P1 Q8", q: "Solve $\\sin^2 3x = 4\\cos^2 3x$ for $0 \\le x < 90°$, giving your answers to 1 decimal place.", marks: 5,
      ms: ["M1: $\\tan^2 3x = 4$", "A1: $\\tan 3x = \\pm 2$", "M1: $3x = 63.4°, 116.6°, 243.4°$ (within $0 \\le 3x < 270°$)", "A1: $x = 21.1°, 38.9°$", "A1: $x = 81.1°$"] },
    { src: "Edexcel 2022 P1 Q14", parts: [
      { q: "Given that $2\\sin(x - 60°) = \\cos(x - 30°)$, show that $\\tan x = 3\\sqrt3$.", marks: 4, ms: ["M1: expands both sides: $2(\\sin x\\cos 60° - \\cos x\\sin 60°) = \\cos x\\cos 30° + \\sin x\\sin 30°$", "A1: $\\sin x - \\sqrt3\\cos x = \\dfrac{\\sqrt3}{2}\\cos x + \\tfrac12\\sin x$", "M1: collects: $\\tfrac12\\sin x = \\dfrac{3\\sqrt3}{2}\\cos x$", "A1: $\\tan x = 3\\sqrt3$"] },
      { q: "Hence solve $2\\sin(2\\theta - 60°) = \\cos(2\\theta - 30°)$ for $0 \\le \\theta < 180°$.", marks: 3, ms: ["M1: $\\tan 2\\theta = 3\\sqrt3$", "A1: $2\\theta = 79.1°, 259.1°$", "A1: $\\theta = 39.6°, 129.6°$"] }
    ] }
  ]
});

X("maths:5.8", {
  flashcards: [
    ["Prove $\\dfrac{1 - \\cos 2\\theta}{\\sin 2\\theta} \\equiv \\tan\\theta$.", "$\\dfrac{2\\sin^2\\theta}{2\\sin\\theta\\cos\\theta} = \\dfrac{\\sin\\theta}{\\cos\\theta}$."],
    ["Prove $\\csc 2x + \\cot 2x \\equiv \\cot x$.", "$\\dfrac{1 + \\cos 2x}{\\sin 2x} = \\dfrac{2\\cos^2 x}{2\\sin x\\cos x} = \\cot x$."],
    ["Prove $\\dfrac{\\cos 3\\theta}{\\sin\\theta} + \\dfrac{\\sin 3\\theta}{\\cos\\theta} \\equiv 2\\cot 2\\theta$.", "Common denominator: $\\dfrac{\\cos 3\\theta\\cos\\theta + \\sin 3\\theta\\sin\\theta}{\\sin\\theta\\cos\\theta} = \\dfrac{\\cos 2\\theta}{\\tfrac12\\sin 2\\theta} = 2\\cot 2\\theta$."],
    ["Prove $\\dfrac{1 - \\cos 2t + \\sin 2t}{1 + \\cos 2t + \\sin 2t} \\equiv \\tan t$.", "Numerator $2\\sin^2 t + 2\\sin t\\cos t = 2\\sin t(\\sin t + \\cos t)$; denominator $2\\cos^2 t + 2\\sin t\\cos t = 2\\cos t(\\cos t + \\sin t)$; ratio $\\tan t$."],
    ["Prove $\\sin x - \\cos x \\ge 1$ for obtuse $x$ — by contradiction, the key step?", "Assume $\\sin x - \\cos x < 1$; for $90° < x < 180°$, $\\sin x > 0$ and $-\\cos x > 0$; squaring the (positive) expression: $1 - \\sin 2x < 1 \\Rightarrow \\sin 2x > 0$, but $180° < 2x < 360°$ gives $\\sin 2x < 0$ — contradiction."],
    ["Prove $\\tan\\theta + \\cot\\theta \\equiv 2\\csc 2\\theta$.", "$\\dfrac{\\sin^2\\theta + \\cos^2\\theta}{\\sin\\theta\\cos\\theta} = \\dfrac{1}{\\tfrac12\\sin 2\\theta}$."],
    ["Prove $\\dfrac{\\sin 2\\theta}{1 + \\cos 2\\theta} \\equiv \\tan\\theta$.", "$\\dfrac{2\\sin\\theta\\cos\\theta}{2\\cos^2\\theta}$."],
    ["What structure earns full marks in a trig proof?", "Start from one side, cite each identity used, and finish with the other side exactly — no working backwards from the result."]
  ],
  quiz: [
    { q: "$1 - \\cos 2\\theta \\equiv$", opts: ["$2\\cos^2\\theta$", "$2\\sin^2\\theta$", "$\\sin^2\\theta$", "$1 - \\cos^2\\theta$"], ans: 1, why: "From $\\cos 2\\theta = 1 - 2\\sin^2\\theta$." },
    { q: "$1 + \\cos 2\\theta \\equiv$", opts: ["$2\\sin^2\\theta$", "$2\\cos^2\\theta$", "$\\cos^2\\theta$", "$2$"], ans: 1, why: "From $\\cos 2\\theta = 2\\cos^2\\theta - 1$." },
    { q: "$\\dfrac{\\sin 2\\theta}{2\\sin\\theta} \\equiv$", opts: ["$\\sin\\theta$", "$\\cos\\theta$", "$\\tan\\theta$", "$1$"], ans: 1, why: "$\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$." },
    { q: "$\\cos 3\\theta\\cos\\theta + \\sin 3\\theta\\sin\\theta \\equiv$", opts: ["$\\cos 4\\theta$", "$\\cos 2\\theta$", "$\\sin 2\\theta$", "$1$"], ans: 1, why: "$\\cos(3\\theta - \\theta)$." },
    { q: "In a proof, 'multiply both sides by $\\cos\\theta$' is:", opts: ["acceptable", "invalid — you may only transform one side", "always required", "a substitution"], ans: 1, why: "An identity proof manipulates one side." },
    { q: "$\\cot 2x \\equiv$", opts: ["$\\dfrac{\\cos 2x}{\\sin 2x}$", "$\\dfrac{1}{\\cos 2x}$", "$2\\cot x$", "$\\tan 2x$"], ans: 0, why: "Definition." }
  ],
  exam: [
    { src: "Edexcel 2018 P2 Q12", parts: [
      { q: "Prove that $\\dfrac{1 - \\cos 2\\theta}{\\sin 2\\theta} \\equiv \\tan\\theta$, $\\theta \\ne \\dfrac{n\\pi}{2}$.", marks: 3, ms: ["M1: $1 - \\cos 2\\theta = 2\\sin^2\\theta$", "M1: $\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$", "A1: $\\dfrac{2\\sin^2\\theta}{2\\sin\\theta\\cos\\theta} = \\tan\\theta$ (cso)"] },
      { q: "Hence solve $\\dfrac{1 - \\cos 2\\theta}{\\sin 2\\theta} = 3\\sin\\theta$ for $0 < \\theta < 180°$… for $-90° < \\theta < 90°$, $\\theta \\ne 0$.", marks: 4, ms: ["M1: $\\tan\\theta = 3\\sin\\theta \\Rightarrow \\sin\\theta = 3\\sin\\theta\\cos\\theta$", "A1: $\\sin\\theta(1 - 3\\cos\\theta) = 0$, $\\sin\\theta \\ne 0$ so $\\cos\\theta = \\tfrac13$", "A1: $\\theta = 70.5°$", "A1: $\\theta = -70.5°$"] }
    ] },
    { src: "Edexcel Specimen P2 Q13", parts: [
      { q: "Prove that $\\csc 2x + \\cot 2x \\equiv \\cot x$, $x \\ne \\dfrac{n\\pi}{2}$.", marks: 4, ms: ["M1: $\\dfrac{1}{\\sin 2x} + \\dfrac{\\cos 2x}{\\sin 2x} = \\dfrac{1 + \\cos 2x}{\\sin 2x}$", "M1: $1 + \\cos 2x = 2\\cos^2 x$", "M1: $\\sin 2x = 2\\sin x\\cos x$", "A1: $\\dfrac{2\\cos^2 x}{2\\sin x\\cos x} = \\cot x$"] },
      { q: "Hence solve $\\csc 2x + \\cot 2x = 3\\tan x$… for $-\\tfrac\\pi2 < x < \\tfrac\\pi2$, $x \\ne 0$.", marks: 3, ms: ["M1: $\\cot x = 3\\tan x \\Rightarrow \\tan^2 x = \\tfrac13$", "A1: $\\tan x = \\pm\\dfrac{1}{\\sqrt3}$", "A1: $x = \\pm\\tfrac\\pi6$"] }
    ] },
    { src: "Edexcel 2023 P2 Q15", q: "Prove by contradiction that if $x$ is obtuse then $\\sin x - \\cos x > 1$… complete the proof: assume $90° < x < 180°$ and $\\sin x - \\cos x \\le 1$.", marks: 3,
      ms: ["M1: since both $\\sin x$ and $-\\cos x$ are positive, squaring preserves the inequality: $\\sin^2 x - 2\\sin x\\cos x + \\cos^2 x \\le 1$, i.e. $1 - \\sin 2x \\le 1$", "A1: so $\\sin 2x \\ge 0$", "A1: but $180° < 2x < 360°$ gives $\\sin 2x < 0$ — a contradiction, so $\\sin x - \\cos x > 1$"] }
  ]
});

X("maths:5.9", {
  flashcards: [
    ["Water depth $D = 5 + 2\\sin(30t)°$ m. Earliest time ($t$ hours) the depth is 6 m?", "$\\sin(30t)° = \\tfrac12 \\Rightarrow 30t = 30 \\Rightarrow t = 1$ hour."],
    ["Ferris wheel seat height $H = 10 + 8\\sin(0.2t)$. Maximum height and first time it is reached?", "18 m when $0.2t = \\tfrac\\pi2$, $t = 2.5\\pi \\approx 7.85$ s."],
    ["A model $H = |A\\sin(bt + \\alpha)|$ for a wheel of diameter 40 m completing a turn every 30 s — why the modulus and what is $b$?", "Height is measured from the lowest point so cannot be negative; $b = \\dfrac{2\\pi}{60}$ if the sine's period is doubled by the modulus… careful: $|\\sin|$ has half the period, so $b = \\dfrac{\\pi}{30}$."],
    ["In $D = 5 + 2\\sin(30t)°$, what do 5 and 2 represent?", "5 m is the mean depth; 2 m is the amplitude (half the range of the tide)."],
    ["A boat needs 6.5 m. In $D = 5 + 2\\sin(30t)°$, for how long each cycle is the depth sufficient?", "$\\sin(30t)° \\ge 0.75$: $30t \\in [48.6°, 131.4°]$, i.e. $t \\in [1.62, 4.38]$ — about 2.76 hours."],
    ["Vectors and trig: angle between $\\mathbf a$ and $\\mathbf b$ from magnitudes and $|\\mathbf a - \\mathbf b|$?", "Cosine rule on the triangle formed: $|\\mathbf a - \\mathbf b|^2 = |\\mathbf a|^2 + |\\mathbf b|^2 - 2|\\mathbf a||\\mathbf b|\\cos\\theta$."],
    ["Force resolution: component of a force $F$ at $\\theta$ to the horizontal?", "Horizontal $F\\cos\\theta$, vertical $F\\sin\\theta$."],
    ["Period of $T = 20 + \\sqrt5\\sin\\left(\\dfrac{\\pi t}{12}\\right)$?", "$\\dfrac{2\\pi}{\\pi/12} = 24$ hours."]
  ],
  quiz: [
    { q: "$D = 5 + 2\\sin(30t)°$ has maximum:", opts: ["5", "7", "2", "3"], ans: 1, why: "Mean plus amplitude." },
    { q: "Period of $\\sin(30t)°$ in hours:", opts: ["30", "12", "6", "360"], ans: 1, why: "$360/30$." },
    { q: "In $H = 10 + 8\\sin(0.2t)$ the minimum height is:", opts: ["2", "10", "18", "0"], ans: 0, why: "$10 - 8$." },
    { q: "The modulus in $H = |A\\sin(bt)|$ ensures:", opts: ["periodicity", "non-negative heights", "amplitude $A$", "a phase shift"], ans: 1, why: "Height cannot be negative." },
    { q: "A tide model reaches 6 m first at $t = 1$ and next at:", opts: ["$t = 5$", "$t = 7$", "$t = 13$", "$t = 2$"], ans: 0, why: "$\\sin(30t)° = \\tfrac12$ at $30t = 150°$." },
    { q: "The amplitude of $3 + 4\\cos(2t)$ is:", opts: ["3", "4", "2", "7"], ans: 1, why: "Coefficient of the cosine." }
  ],
  exam: [
    { src: "Edexcel 2018 P1 Q8", ctx: "The depth of water in a harbour, $D$ metres, $t$ hours after midnight is modelled by $D = 5 + 2\\sin(30t)°$, $0 \\le t < 24$. A boat needs a depth of at least 6.5 m to leave the harbour.",
      parts: [
        { q: "Find the maximum depth and the first time it occurs.", marks: 2, ms: ["B1: 7 m", "B1: at $t = 3$ (3 am)"] },
        { q: "Find the earliest time after midnight at which the boat can leave.", marks: 3, ms: ["M1: $\\sin(30t)° = 0.75$", "A1: $30t = 48.6°$", "A1: $t = 1.62$ hours ≈ 01:37"] },
        { q: "State one limitation of the model.", marks: 1, ms: ["B1: e.g. real tides are not exactly sinusoidal / the period is not exactly 12 hours / weather affects depth"] }
      ] },
    { src: "Edexcel 2022 P2 Q9", ctx: "A Ferris wheel has diameter 40 m and its lowest point is 2 m above the ground. It rotates at a constant rate, completing one revolution every 4 minutes. A passenger boards at the lowest point at time $t = 0$ minutes. The height $H$ m of the passenger above the ground is modelled by $H = a - b\\cos(ct)$.",
      parts: [
        { q: "State the values of $a$ and $b$.", marks: 2, ms: ["B1: $a = 22$", "B1: $b = 20$"] },
        { q: "Find the value of $c$, giving your answer in terms of $\\pi$.", marks: 1, ms: ["B1: $c = \\dfrac{\\pi}{2}$"] },
        { q: "Find the first two times at which the passenger is 32 m above the ground.", marks: 3, ms: ["M1: $\\cos\\left(\\dfrac{\\pi t}{2}\\right) = -\\tfrac12$", "A1: $\\dfrac{\\pi t}{2} = \\dfrac{2\\pi}{3}, \\dfrac{4\\pi}{3}$", "A1: $t = \\tfrac43$ and $\\tfrac83$ minutes"] }
      ] }
  ]
});

X("maths:6.1", {
  flashcards: [
    ["Sketch $y = 2^x$: key features.", "Passes through $(0, 1)$, increasing, asymptote $y = 0$ as $x \\to -\\infty$, always positive."],
    ["Sketch $y = e^{-x}$.", "Through $(0, 1)$, decreasing, asymptote $y = 0$."],
    ["Sketch $y = e^x - 3$.", "Through $(0, -2)$, asymptote $y = -3$, crosses the $x$-axis at $x = \\ln 3$."],
    ["Solve $e^{2x} = 5$.", "$x = \\tfrac12\\ln 5$."],
    ["Why is $y = a^x$ only defined for $a > 0$?", "For negative $a$, non-integer powers are undefined in the reals."],
    ["What is $e$ (to 3 s.f.) and why is it special?", "$2.72$; $y = e^x$ is its own derivative — the gradient equals the $y$-value everywhere."],
    ["Solve $2^x = 20$ to 3 s.f.", "$x = \\dfrac{\\ln 20}{\\ln 2} = 4.32$."],
    ["Describe $y = 3e^{x}$ relative to $y = e^x$.", "Stretch parallel to the $y$-axis, scale factor 3; $y$-intercept $(0, 3)$."]
  ],
  quiz: [
    { q: "$y = 5^x$ passes through:", opts: ["$(0, 5)$", "$(0, 1)$", "$(1, 0)$", "$(0, 0)$"], ans: 1, why: "$5^0 = 1$." },
    { q: "The asymptote of $y = e^x + 2$ is:", opts: ["$y = 0$", "$y = 2$", "$x = 2$", "$y = -2$"], ans: 1, why: "Shift up 2." },
    { q: "$y = \\left(\\tfrac12\\right)^x$ is the same as:", opts: ["$y = 2^{-x}$", "$y = -2^x$", "$y = 2^x$", "$y = \\tfrac12 \\cdot 2^x$"], ans: 0, why: "$(2^{-1})^x$." },
    { q: "$e^{\\ln 7} =$", opts: ["7", "$\\ln 7$", "1", "$e^7$"], ans: 0, why: "Inverse functions." },
    { q: "Solve $e^{x} = 1$:", opts: ["$x = e$", "$x = 0$", "$x = 1$", "no solution"], ans: 1, why: "$e^0 = 1$." },
    { q: "$e^{3\\ln 2} =$", opts: ["6", "8", "$\\ln 8$", "$3\\ln 2$"], ans: 1, why: "$e^{\\ln 8}$." }
  ],
  exam: [
    { src: "Edexcel 2022 P1 Q2", parts: [
      { q: "Sketch the curve $y = 3e^{x} - 4$, showing the coordinates of any points where it meets the axes and the equation of the asymptote.", marks: 3, ms: ["B1: increasing exponential shape with asymptote $y = -4$", "B1: $y$-intercept $(0, -1)$", "B1: crosses the $x$-axis at $x = \\ln\\tfrac43$"] },
      { q: "Solve $3e^{x} - 4 = 8$, giving your answer in the form $\\ln k$.", marks: 2, ms: ["M1: $e^x = 4$", "A1: $x = \\ln 4$"] }
    ] }
  ]
});

X("maths:6.2", {
  flashcards: [
    ["$\\dfrac{d}{dx}(e^{kx}) = ?$", "$ke^{kx}$."],
    ["Why does the exponential model suit population growth?", "The rate of growth $\\dfrac{dN}{dt} = kN$ is proportional to the population itself — exactly the property of $e^{kt}$."],
    ["Gradient of $y = e^{3x}$ at $x = 0$?", "3."],
    ["$N = 200e^{0.05t}$: rate of increase at $t = 10$?", "$10e^{0.5} \\approx 16.5$ per unit time."],
    ["Differentiate $y = 4e^{-2x}$.", "$-8e^{-2x}$."],
    ["Interpret $\\dfrac{dV}{dt} = -0.25V$ for a car's value.", "The value decreases at a rate proportional to its current value — 25% per year continuous depreciation."],
    ["Tangent to $y = e^{2x}$ at $x = 0$?", "Gradient 2, point $(0, 1)$: $y = 2x + 1$."],
    ["$\\dfrac{d}{dx}(a^x) = ?$", "$a^x\\ln a$."]
  ],
  quiz: [
    { q: "$\\dfrac{d}{dx}(e^{5x}) =$", opts: ["$e^{5x}$", "$5e^{5x}$", "$5e^{4x}$", "$e^{5}$"], ans: 1, why: "Chain rule." },
    { q: "The gradient of $y = e^x$ at any point equals:", opts: ["$x$", "$y$", "1", "$e$"], ans: 1, why: "Self-derivative." },
    { q: "$\\dfrac{d}{dx}(2^x) =$", opts: ["$2^x$", "$x2^{x-1}$", "$2^x\\ln 2$", "$\\ln 2$"], ans: 2, why: "General exponential." },
    { q: "If $\\dfrac{dN}{dt} = 0.3N$ then $N =$", opts: ["$0.3t$", "$Ae^{0.3t}$", "$0.3e^{t}$", "$N^2$"], ans: 1, why: "Exponential growth." },
    { q: "Gradient of $y = e^{-x}$ at $x = 0$:", opts: ["1", "$-1$", "0", "$e$"], ans: 1, why: "$-e^0$." },
    { q: "Rate of change of $A = 0.2e^{0.3t}$ at $t = 5$ is:", opts: ["$0.06e^{1.5}$", "$0.2e^{1.5}$", "$0.3e^{5}$", "$e^{1.5}$"], ans: 0, why: "$0.2 \\times 0.3 e^{1.5}$." }
  ],
  exam: [
    { src: "Edexcel Oct 2021 P2 Q8", ctx: "The number of bacteria $N$ in a culture after $t$ hours is modelled by $N = Ae^{kt}$. Initially there are 500 bacteria and the number doubles every 5 hours.",
      parts: [
        { q: "Find the values of $A$ and $k$, giving $k$ to 3 significant figures.", marks: 3, ms: ["B1: $A = 500$", "M1: $e^{5k} = 2$", "A1: $k = \\dfrac{\\ln 2}{5} = 0.139$"] },
        { q: "Find the rate at which the number of bacteria is increasing after 8 hours.", marks: 3, ms: ["M1: $\\dfrac{dN}{dt} = 500ke^{kt}$", "M1: substitutes $t = 8$", "A1: $\\approx 210$ bacteria per hour"] },
        { q: "Explain why the model cannot be valid for large values of $t$.", marks: 1, ms: ["B1: the number of bacteria would grow without limit, but resources / space are finite"] }
      ] },
    { level: "AS", src: "Edexcel AS Specimen P1 Q13", ctx: "The area $A$ m² of a pond covered by weed after $t$ weeks is modelled by $A = 0.2e^{0.3t}$.",
      parts: [
        { q: "State the area covered at the start.", marks: 1, ms: ["B1: 0.2 m²"] },
        { q: "Find the rate at which the area is increasing after 6 weeks.", marks: 3, ms: ["M1: $\\dfrac{dA}{dt} = 0.06e^{0.3t}$", "M1: substitutes $t = 6$", "A1: $0.363$ m² per week"] },
        { q: "The pond has area 50 m². Find, to the nearest week, when the weed covers the whole pond.", marks: 3, ms: ["M1: $0.2e^{0.3t} = 50$", "M1: $t = \\dfrac{\\ln 250}{0.3}$", "A1: 18 weeks"] }
      ] }
  ]
});

X("maths:6.3", {
  flashcards: [
    ["Define $\\log_a x$.", "The power to which $a$ must be raised to give $x$: $\\log_a x = y \\iff a^y = x$."],
    ["Evaluate $\\log_2 32$, $\\log_3 \\tfrac19$, $\\log_5 1$.", "5, $-2$, 0."],
    ["Sketch $y = \\ln x$.", "Defined for $x > 0$, through $(1, 0)$, increasing, vertical asymptote $x = 0$."],
    ["Relationship between $y = \\ln x$ and $y = e^x$?", "Inverse functions — reflections in $y = x$."],
    ["Solve $\\ln(2x - 1) = 3$.", "$2x - 1 = e^3 \\Rightarrow x = \\dfrac{e^3 + 1}{2}$."],
    ["Write $4^{3/2} = 8$ in log form.", "$\\log_4 8 = \\tfrac32$."],
    ["Solve $\\log_3(12y + 5) - \\log_3(1 - 3y) = 2$.", "$\\dfrac{12y + 5}{1 - 3y} = 9 \\Rightarrow 12y + 5 = 9 - 27y \\Rightarrow y = \\tfrac{4}{39}$."],
    ["Domain of $y = \\ln(x + 4)$?", "$x > -4$."]
  ],
  quiz: [
    { q: "$\\log_4 64 =$", opts: ["16", "3", "4", "2"], ans: 1, why: "$4^3 = 64$." },
    { q: "$\\ln e^{5} =$", opts: ["5", "$e^5$", "1", "$5e$"], ans: 0, why: "Inverse." },
    { q: "$\\log_{10} 0.001 =$", opts: ["3", "$-3$", "$-0.001$", "0.001"], ans: 1, why: "$10^{-3}$." },
    { q: "$y = \\ln x$ has asymptote:", opts: ["$y = 0$", "$x = 0$", "$x = 1$", "$y = 1$"], ans: 1, why: "As $x \\to 0^+$." },
    { q: "If $\\log_a 8 = 3$ then $a =$", opts: ["2", "3", "8", "24"], ans: 0, why: "$a^3 = 8$." },
    { q: "$\\ln x = -1$ gives $x =$", opts: ["$-e$", "$\\dfrac1e$", "$e$", "0"], ans: 1, why: "$e^{-1}$." }
  ],
  exam: [
    { src: "Edexcel Oct 2021 P2 Q3", q: "Solve $\\log_3(12y + 5) - \\log_3(1 - 3y) = 2$, giving your answer as an exact fraction.", marks: 3,
      ms: ["M1: $\\log_3\\dfrac{12y + 5}{1 - 3y} = 2$", "M1: $12y + 5 = 9(1 - 3y)$", "A1: $y = \\tfrac{4}{39}$"] },
    { src: "Edexcel 2020 P2 Q1", q: "Sketch $y = \\ln(x - 2)$, stating the equation of the asymptote and the coordinates of the point where the curve crosses the $x$-axis.", marks: 3,
      ms: ["B1: log shape, increasing, defined for $x > 2$", "B1: asymptote $x = 2$", "B1: crosses at $(3, 0)$"] }
  ]
});

X("maths:6.4", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Laws of logs — solving and the extraneous root" },
    "Solve $2\\log(4 - x) = \\log(x + 8)$ (Oct 2020), $\\log(x+3) + \\log(x+10) = 2 + 2\\log x$ (2023), $2\\log_3(x + 1) = 1 + \\log_3(x + 7)$ (AS 2025), $2\\log_4(2 - x) - \\log_4(x + 5) = 1$ (AS Specimen): combine with the laws, **write the constant as a log** ($2 = \\log 100$, $1 = \\log_3 3$), equate arguments, solve the quadratic, and **reject the root that makes a log argument negative** — a mark is reserved for this. \"Express in terms of $a = \\log x$ and $b = \\log(x + 8)$\" (2023): $\\log\\left(\\dfrac{x^2}{x+8}\\right) = 2a - b$. The AS \"identify the errors in this working\" (2018): $\\log a - \\log b \\ne \\log a / \\log b$; $\\log(a + b) \\ne \\log a + \\log b$.",
    { callout: { t: "memorise", body: "$\\log xy = \\log x + \\log y$ · $\\log\\dfrac xy = \\log x - \\log y$ · $\\log x^k = k\\log x$ · $\\log_a a = 1$ · $\\log_a 1 = 0$ · $\\log_a b = \\dfrac{\\ln b}{\\ln a}$." }}
  ],
  flashcards: [
    ["Solve $2\\log(4 - x) = \\log(x + 8)$.", "$(4-x)^2 = x + 8 \\Rightarrow x^2 - 9x + 8 = 0 \\Rightarrow x = 1$ or $8$; $x = 8$ makes $\\log(4 - x)$ undefined, so $x = 1$."],
    ["Solve $\\log_2(x+3) + \\log_2(x+10) = 2 + 2\\log_2 x$… with base 10 and $2 = \\log 100$.", "$(x+3)(x+10) = 100x^2 \\Rightarrow 99x^2 - 13x - 30 = 0 \\Rightarrow x = \\dfrac{13 \\pm \\sqrt{169 + 11880}}{198}$; take the positive root $x = 0.620$."],
    ["Express $\\log\\left(\\dfrac{x^2}{x + 8}\\right)$ in terms of $a = \\log x$, $b = \\log(x + 8)$.", "$2a - b$."],
    ["Express $\\log\\sqrt{x(x+8)}$ in terms of $a$ and $b$.", "$\\tfrac12(a + b)$."],
    ["Solve $2\\log_3(x + 1) = 1 + \\log_3(x + 7)$.", "$(x+1)^2 = 3(x + 7) \\Rightarrow x^2 - x - 20 = 0 \\Rightarrow x = 5$ (reject $-4$)."],
    ["Error: '$\\log(x + 2) = \\log x + \\log 2$'. Correct it.", "There is no law for the log of a sum; $\\log x + \\log 2 = \\log 2x$."],
    ["Given $\\log a - \\log b = \\log(a - b)$, show $a = \\dfrac{b^2}{b - 1}$.", "$\\dfrac ab = a - b \\Rightarrow a = ab - b^2 \\Rightarrow a(b - 1) = b^2$; need $b > 1$ for $a > 0$."],
    ["Write $3\\log 2 - \\log 4 + \\log 5$ as a single log.", "$\\log\\dfrac{8 \\times 5}{4} = \\log 10 = 1$."],
    ["If $p = \\log 16$, express $\\log 2$ and $\\log 64$ in terms of $p$.", "$\\tfrac14 p$ and $\\tfrac32 p$."],
    ["Solve $2\\log_4(2 - x) - \\log_4(x + 5) = 1$.", "$\\dfrac{(2-x)^2}{x+5} = 4 \\Rightarrow x^2 - 8x - 16 = 0 \\Rightarrow x = 4 - 4\\sqrt2$ (reject $4 + 4\\sqrt2 > 2$)."]
  ],
  quiz: [
    { q: "$\\log 8 + \\log 5 - \\log 4 =$", opts: ["$\\log 9$", "$\\log 10$", "$\\log 1$", "$\\log 40$"], ans: 1, why: "$\\log\\dfrac{40}{4}$." },
    { q: "$3\\log_2 x =$", opts: ["$\\log_2 3x$", "$\\log_2 x^3$", "$\\log_2 (x + 3)$", "$(\\log_2 x)^3$"], ans: 1, why: "Power law." },
    { q: "In base 10, the number 2 equals:", opts: ["$\\log 2$", "$\\log 20$", "$\\log 100$", "$\\log 10$"], ans: 2, why: "$10^2$." },
    { q: "$\\log_5 x = \\dfrac{\\ln x}{?}$", opts: ["$\\ln 5$", "5", "$\\ln x$", "$\\log 5$"], ans: 0, why: "Change of base." },
    { q: "A root that makes $\\log(4 - x)$ undefined must be:", opts: ["kept", "rejected", "halved", "squared"], ans: 1, why: "Argument must be positive." },
    { q: "$\\log 100 - \\log 10 =$", opts: ["$\\log 90$", "1", "10", "$\\log 1000$"], ans: 1, why: "$\\log 10$." },
    { q: "'$\\dfrac{\\log 8}{\\log 2} = \\log 4$' is:", opts: ["correct", "wrong — it equals 3", "wrong — it equals $\\log 6$", "undefined"], ans: 1, why: "$\\log_2 8 = 3$." }
  ],
  exam: [
    { src: "Edexcel Oct 2020 P1 Q3", ctx: "$2\\log_{10}(4 - x) = \\log_{10}(x + 8)$.",
      parts: [
        { q: "Show that $x^2 - 9x + 8 = 0$.", marks: 3, ms: ["M1: $\\log(4 - x)^2 = \\log(x + 8)$", "M1: $(4 - x)^2 = x + 8$", "A1: $x^2 - 9x + 8 = 0$ (cso)"] },
        { q: "Solve the equation, explaining why one solution must be rejected.", marks: 2, ms: ["A1: $x = 1$ or $x = 8$", "B1: $x = 8$ rejected because $\\log(4 - 8)$ is undefined; solution $x = 1$"] }
      ] },
    { src: "Edexcel 2023 P1 Q6", ctx: "Given $a = \\log_{10} x$ and $b = \\log_{10}(x + 8)$, $x > 0$,",
      parts: [
        { q: "Express $\\log_{10}\\left(\\dfrac{x^2}{x + 8}\\right)$ in terms of $a$ and $b$.", marks: 2, ms: ["M1: $2\\log x - \\log(x + 8)$", "A1: $2a - b$"] },
        { q: "Express $\\log_{10}\\left(10\\sqrt{x(x+8)}\\right)$ in terms of $a$ and $b$.", marks: 3, ms: ["M1: $\\log 10 + \\tfrac12\\log\\left(x(x+8)\\right)$", "M1: $1 + \\tfrac12(\\log x + \\log(x+8))$", "A1: $1 + \\tfrac12(a + b)$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2025 P1 Q10", q: "Solve $2\\log_3(x + 1) = 1 + \\log_3(x + 7)$.", marks: 5,
      ms: ["M1: $\\log_3(x+1)^2 = \\log_3 3 + \\log_3(x + 7) = \\log_3 3(x + 7)$", "M1: $(x + 1)^2 = 3(x + 7)$", "A1: $x^2 - x - 20 = 0$", "A1: $x = 5$ or $x = -4$", "B1: $x = 5$ only, since $x = -4$ makes $\\log_3(x + 1)$ undefined"] },
    { level: "AS", src: "Edexcel AS 2018 P1 Q5", ctx: "A student's attempt to solve $\\log_2(x + 6) - \\log_2 x = 3$ reads: \"$\\dfrac{\\log_2(x + 6)}{\\log_2 x} = 3$, so $\\log_2(x + 6) = 3\\log_2 x = \\log_2 3x$, so $x + 6 = 3x$, $x = 3$.\"",
      parts: [
        { q: "Identify the two errors in the student's working.", marks: 2, ms: ["B1: $\\log a - \\log b$ is $\\log\\dfrac ab$, not $\\dfrac{\\log a}{\\log b}$", "B1: $3\\log_2 x = \\log_2 x^3$, not $\\log_2 3x$"] },
        { q: "Solve the equation correctly.", marks: 3, ms: ["M1: $\\log_2\\dfrac{x + 6}{x} = 3$", "M1: $x + 6 = 8x$", "A1: $x = \\tfrac67$"] }
      ] }
  ]
});

X("maths:6.5", {
  flashcards: [
    ["Solve $4^{3p - 1} = 52^{10}$ to 3 s.f.", "$(3p - 1)\\ln 4 = 10\\ln 52 \\Rightarrow 3p - 1 = 28.5 \\Rightarrow p = 9.83$."],
    ["Solve $3 \\times 2^x = 15$.", "$2^x = 5 \\Rightarrow x = \\log_2 5 = 2.32$."],
    ["Solve $4^x = 15 - 2^{x+1}$ exactly.", "Let $u = 2^x$: $u^2 + 2u - 15 = (u + 5)(u - 3) = 0$, so $2^x = 3$ and $x = \\log_2 3$."],
    ["Solve $5^{2x} - 6 \\cdot 5^x + 5 = 0$.", "$u = 5^x$: $(u - 1)(u - 5) = 0 \\Rightarrow x = 0, 1$."],
    ["Solve $e^{2x} - 4e^x + 3 = 0$.", "$e^x = 1, 3 \\Rightarrow x = 0, \\ln 3$."],
    ["Solve $3^{x - 2} \\times 4 = 2\\sqrt2$ exactly.", "$3^{x-2} = 2^{-1/2} \\Rightarrow x = 2 - \\dfrac{\\ln 2}{2\\ln 3}$."],
    ["Solve $7^x = 3^{x + 1}$.", "$x\\ln 7 = (x + 1)\\ln 3 \\Rightarrow x = \\dfrac{\\ln 3}{\\ln 7 - \\ln 3} = 1.30$."],
    ["Why take logs of both sides of $a^x = b$?", "The power law brings $x$ down: $x\\ln a = \\ln b$."]
  ],
  quiz: [
    { q: "$2^x = 10$ gives $x =$", opts: ["5", "$\\log_2 10$", "$\\log 2$", "$10/2$"], ans: 1, why: "$\\dfrac{\\ln 10}{\\ln 2}$." },
    { q: "$e^{2x} - 5e^x + 6 = 0$: substitute", opts: ["$u = 2x$", "$u = e^x$", "$u = e^{2x}$", "$u = \\ln x$"], ans: 1, why: "Gives $u^2 - 5u + 6 = 0$." },
    { q: "Solutions of $e^{2x} - 5e^x + 6 = 0$:", opts: ["$x = 2, 3$", "$x = \\ln 2, \\ln 3$", "$x = 0, 1$", "$x = e^2, e^3$"], ans: 1, why: "$e^x = 2, 3$." },
    { q: "$4^{x} = 8^{x-1}$ gives $x =$", opts: ["3", "2", "1", "$-1$"], ans: 0, why: "$2x = 3x - 3$." },
    { q: "$\\ln(3^x) =$", opts: ["$3\\ln x$", "$x\\ln 3$", "$\\ln 3x$", "$3x$"], ans: 1, why: "Power law." },
    { q: "$10^{2x + 1} = 500$: first step:", opts: ["divide by 10", "take logs base 10: $2x + 1 = \\log 500$", "square root", "subtract 1"], ans: 1, why: "Then $x = \\tfrac12(\\log 500 - 1)$." }
  ],
  exam: [
    { src: "Edexcel Oct 2020 P1 Q2", q: "Solve $4^{3p - 1} = 52^{10}$, giving your answer to 3 significant figures.", marks: 3,
      ms: ["M1: takes logs: $(3p - 1)\\ln 4 = 10\\ln 52$", "M1: $3p - 1 = \\dfrac{10\\ln 52}{\\ln 4} = 28.50$", "A1: $p = 9.83$"] },
    { src: "Edexcel Oct 2020 P2 Q5", q: "The curves $y = 4^{x}$ and $y = 15 - 2^{x + 1}$ meet at a single point. Find the exact $x$-coordinate of this point, giving your answer in the form $\\log_2 k$.", marks: 4,
      ms: ["M1: writes $4^x = (2^x)^2$ and $2^{x+1} = 2 \\cdot 2^x$, so with $u = 2^x$: $u^2 + 2u - 15 = 0$", "A1: $(u + 5)(u - 3) = 0$", "M1: rejects $u = -5$ since $2^x > 0$", "A1: $2^x = 3 \\Rightarrow x = \\log_2 3$"] },
    { level: "AS", src: "Edexcel AS 2020 P1 Q3", q: "Solve $3^{x - 2} \\times 4 = 2\\sqrt 2$, giving your answer in the form $x = a + \\dfrac{b\\ln 2}{\\ln 3}$ where $a$ and $b$ are rational.", marks: 4,
      ms: ["M1: $3^{x-2} = \\dfrac{2^{3/2}}{2^2} = 2^{-1/2}$", "M1: $(x - 2)\\ln 3 = -\\tfrac12\\ln 2$", "A1: $x - 2 = -\\dfrac{\\ln 2}{2\\ln 3}$", "A1: $x = 2 - \\dfrac{\\ln 2}{2\\ln 3}$ (so $a = 2$, $b = -\\tfrac12$)"] }
  ]
});

X("maths:6.6", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Reduction to linear form — 5 to 10 marks every year" },
    "Two models. **$y = ab^t$** (painting value, algae, phone value, world population, advert views): $\\log y = \\log a + t\\log b$, so **$\\log y$ against $t$ is a straight line** with gradient $\\log b$ and intercept $\\log a$. **$y = ax^n$** (braking distance, pendulum period, heart rate): $\\log y = \\log a + n\\log x$, so **$\\log y$ against $\\log x$** is linear with gradient $n$. Given the line (\"$\\log_{10} V = 0.072t + 2.379$\"), find $a = 10^{2.379}$ and $b = 10^{0.072}$, **interpret** them ($a$ is the initial value; $b = 1.18$ means an 18% increase per unit time), and **comment on reliability** (extrapolation; rounding of the line's constants).",
    { callout: { t: "warn", body: "Use the **same base** as the graph — if the axis is $\\log_{10}$, then $a = 10^{\\text{intercept}}$, not $e^{\\text{intercept}}$. And **show the derivation**: \"taking logs of both sides, $\\log y = \\log a + t\\log b$, which is of the form $Y = mt + c$\" — that sentence is the 'show' mark." }}
  ],
  flashcards: [
    ["Show that $V = pq^t$ gives a straight line when $\\log V$ is plotted against $t$.", "$\\log V = \\log p + t\\log q$ — linear in $t$ with gradient $\\log q$ and intercept $\\log p$."],
    ["Show that $T = al^b$ gives a straight line when $\\log T$ is plotted against $\\log l$.", "$\\log T = \\log a + b\\log l$ — gradient $b$, intercept $\\log a$."],
    ["$\\log_{10} V = 0.072t + 2.379$. Find $a$ and $b$ in $V = ab^t$.", "$a = 10^{2.379} = 239$, $b = 10^{0.072} = 1.18$."],
    ["Interpret $b = 1.18$ in $V = 239 \\times 1.18^t$.", "The value increases by 18% each unit of time."],
    ["A log–log graph has gradient 0.5 and intercept 0.3. Model?", "$y = 10^{0.3}x^{0.5} \\approx 2.0\\sqrt x$."],
    ["Which plot linearises $y = ab^t$ and which linearises $y = ax^n$?", "$\\log y$ vs $t$; $\\log y$ vs $\\log x$."],
    ["Why might a prediction from the linearised model be unreliable?", "It is an extrapolation beyond the data; the constants are read from a rounded line; the real process may change."],
    ["$h^2 = at + b$ for tree height — what plot gives a line?", "$h^2$ against $t$: gradient $a$, intercept $b$."]
  ],
  quiz: [
    { q: "For $y = ab^x$, plotting $\\log y$ against $x$ gives gradient:", opts: ["$\\log a$", "$\\log b$", "$b$", "$a$"], ans: 1, why: "$\\log y = \\log a + x\\log b$." },
    { q: "For $y = ax^n$ the linear plot is:", opts: ["$y$ vs $x$", "$\\log y$ vs $x$", "$\\log y$ vs $\\log x$", "$y$ vs $\\log x$"], ans: 2, why: "Power law." },
    { q: "Intercept 1.5 on a $\\log_{10} y$ axis means $a =$", opts: ["1.5", "$10^{1.5}$", "$e^{1.5}$", "$\\log 1.5$"], ans: 1, why: "Same base." },
    { q: "Gradient $-0.05$ on a $\\log_{10} V$ vs $t$ plot means $b =$", opts: ["$-0.05$", "$10^{-0.05} \\approx 0.89$", "0.95", "$e^{-0.05}$"], ans: 1, why: "11% decrease per unit." },
    { q: "In $h = pm^q$, the gradient of $\\log h$ against $\\log m$ is:", opts: ["$p$", "$q$", "$\\log p$", "$\\log q$"], ans: 1, why: "Power law exponent." },
    { q: "'The model is unreliable for $t = 50$' because:", opts: ["logs fail", "it is extrapolation far beyond the data", "$b < 1$", "the gradient is small"], ans: 1, why: "Standard evaluation point." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2020 P1 Q12", ctx: "The number of views $V$ of an online advert $t$ days after it is posted is modelled by $V = ab^t$. A plot of $\\log_{10} V$ against $t$ is a straight line with equation $\\log_{10} V = 0.072t + 2.379$.",
      parts: [
        { q: "Show that $V = ab^t$ gives a linear relationship between $\\log_{10} V$ and $t$.", marks: 2, ms: ["M1: $\\log_{10} V = \\log_{10} a + \\log_{10} b^t$", "A1: $= \\log_{10} a + t\\log_{10} b$, of the form $y = mt + c$"] },
        { q: "Find the values of $a$ and $b$, to 3 significant figures, and interpret the value of $b$.", marks: 3, ms: ["A1: $a = 10^{2.379} = 239$", "A1: $b = 10^{0.072} = 1.18$", "B1: the number of views increases by 18% per day"] },
        { q: "Use the model to estimate the number of views after 30 days, and comment on the reliability of this estimate.", marks: 2, ms: ["M1: $239 \\times 1.18^{30} \\approx 34\\,000$ (accept $10^{0.072 \\times 30 + 2.379}$)", "B1: unreliable — extrapolation far beyond the data / growth will not continue at 18% per day indefinitely"] }
      ] },
    { src: "Edexcel Oct 2021 P2 Q10", ctx: "The period $T$ seconds of a pendulum of length $l$ metres is modelled by $T = al^b$. A graph of $\\log_{10} T$ against $\\log_{10} l$ is a straight line passing through $(-1, -0.2)$ and $(0.5, 0.55)$.",
      parts: [
        { q: "Explain why the graph is a straight line.", marks: 2, ms: ["M1: $\\log T = \\log a + b\\log l$", "A1: linear in $\\log l$ with gradient $b$ and intercept $\\log a$"] },
        { q: "Find the values of $a$ and $b$, to 2 significant figures.", marks: 4, ms: ["M1: gradient $b = \\dfrac{0.55 + 0.2}{0.5 + 1} = 0.5$", "A1: $b = 0.50$", "M1: intercept: $\\log a = 0.55 - 0.5 \\times 0.5 = 0.3$", "A1: $a = 10^{0.3} = 2.0$"] }
      ] },
    { src: "Edexcel 2024 P1 Q13", ctx: "The world population $P$ billions, $t$ years after 1950, is modelled by $P = ab^t$. The values $(t, \\log_{10} P)$ for the data lie close to a line with gradient 0.0064 and intercept 0.40.",
      parts: [
        { q: "Estimate the values of $a$ and $b$ to 3 significant figures.", marks: 2, ms: ["A1: $a = 10^{0.40} = 2.51$", "A1: $b = 10^{0.0064} = 1.01$ (1.0148…)"] },
        { q: "Interpret the value of $a$.", marks: 1, ms: ["B1: the model's estimate of the world population in 1950 — about 2.5 billion"] },
        { q: "Explain why the model may not be reliable for predicting the population in 2100.", marks: 1, ms: ["B1: $t = 150$ is far beyond the data; growth rates change (e.g. falling birth rates), so exponential growth is unlikely to continue"] }
      ] }
  ]
});

X("maths:6.7", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Exponential models — the 6 to 12 mark question" },
    "Forms: $\\theta = 25 + Ae^{-0.03t}$ (cooling), $V = 15700e^{-0.25t} + 2300$ (car value), $A = 80 - 45e^{ct}$ (trees), $h = 31 - Ae^{-kt}$ (tree height, two data points → simultaneous exponential equations), $N = 5000 - 5000e^{-0.075t}$ (sales), $P = k + 1.4e^{-0.5t}$ (tyre pressure). Parts: **initial value** ($t = 0$), **long-term / limiting value** (the constant, as $e^{-kt} \\to 0$), **find $A$ or $k$** from a data point, **time to reach a value** (logs), **rate of change** (differentiate), and **why a value is never reached** (\"$\\theta = 15$ needs $e^{-t/8} < 0$\").",
    { callout: { t: "tip", body: "Two unknowns from two data points: divide one equation by the other to eliminate $A$ — $\\dfrac{31 - h_2}{31 - h_1} = e^{-k(t_2 - t_1)}$ — then take logs." }}
  ],
  flashcards: [
    ["$\\theta = 18 + 65e^{-t/8}$: temperature at $t = 0$ and the long-term temperature?", "83 °C and 18 °C."],
    ["For $\\theta = 18 + 65e^{-t/8}$, find $t$ when $\\theta = 35$.", "$e^{-t/8} = \\tfrac{17}{65} \\Rightarrow t = -8\\ln\\tfrac{17}{65} = 10.7$ min."],
    ["Why can $\\theta = 18 + 65e^{-t/8}$ never equal 15?", "$e^{-t/8} > 0$ so $\\theta > 18$ for all $t$."],
    ["$V = 15700e^{-0.25t} + 2300$: rate of decrease at $t = 2$?", "$\\dfrac{dV}{dt} = -3925e^{-0.5} = -£2381$ per year."],
    ["$A = 80 - 45e^{ct}$ with $A = 50$ at $t = 5$. Find $c$.", "$e^{5c} = \\tfrac{30}{45} \\Rightarrow c = \\tfrac15\\ln\\tfrac23 = -0.081$."],
    ["Limiting value of $N = 5000 - 5000e^{-0.075t}$ and its meaning?", "5000 — the total sales approach but never exceed 5000."],
    ["$P = k + 1.4e^{-0.5t}$ with $P \\to 2$ as $t \\to \\infty$. State $k$ and find $t$ when $P = 2.7$.", "$k = 2$; $e^{-0.5t} = 0.5 \\Rightarrow t = 2\\ln 2 = 1.39$."],
    ["$h = 31 - Ae^{-kt}$ with $h(0) = 6$, $h(5) = 16$. Find $A$ and $k$.", "$A = 25$; $e^{-5k} = \\tfrac{15}{25} \\Rightarrow k = \\tfrac15\\ln\\tfrac53 = 0.102$."],
    ["In $V = Ap^t$ with $V(0) = 20000$, $V(3) = 10240$: find $p$.", "$p^3 = 0.512 \\Rightarrow p = 0.8$."],
    ["Doubling time for $N = Ae^{0.14t}$?", "$e^{0.14t} = 2 \\Rightarrow t = \\ln 2/0.14 = 4.95$."]
  ],
  quiz: [
    { q: "In $\\theta = 25 + Ae^{-0.03t}$ the long-term temperature is:", opts: ["$A$", "25", "$25 + A$", "0"], ans: 1, why: "Exponential term → 0." },
    { q: "$V = 15700e^{-0.25t} + 2300$ at $t = 0$:", opts: ["15700", "2300", "18000", "0"], ans: 2, why: "$e^0 = 1$." },
    { q: "$\\dfrac{d}{dt}(65e^{-t/8}) =$", opts: ["$-\\tfrac{65}{8}e^{-t/8}$", "$65e^{-t/8}$", "$-8e^{-t/8}$", "$\\tfrac{65}{8}e^{-t/8}$"], ans: 0, why: "Chain rule." },
    { q: "$N = 5000(1 - e^{-0.075t})$ reaches 3000 when $e^{-0.075t} =$", opts: ["0.6", "0.4", "0.3", "1.5"], ans: 1, why: "$1 - 0.6$." },
    { q: "Time for $Ae^{-kt}$ to halve:", opts: ["$\\ln 2 / k$", "$k/\\ln 2$", "$2/k$", "$\\ln k$"], ans: 0, why: "Half-life." },
    { q: "A model $A = 80 - 45e^{ct}$ with $c < 0$ describes:", opts: ["unbounded growth", "growth towards a limit of 80", "decay to 0", "oscillation"], ans: 1, why: "Approaches 80 from below." },
    { q: "Why is $\\theta = 15$ impossible for $\\theta = 18 + 65e^{-t/8}$?", opts: ["$t$ would be negative", "$e^{-t/8}$ is always positive so $\\theta > 18$", "65 is too big", "it is possible"], ans: 1, why: "Asymptote at 18." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2020 P1 Q8", ctx: "The temperature $\\theta$ °C of a cup of tea $t$ minutes after it is made is modelled by $\\theta = 18 + 65e^{-t/8}$.",
      parts: [
        { q: "State the temperature of the tea when it is made.", marks: 1, ms: ["B1: 83 °C"] },
        { q: "Find the time taken for the tea to cool to 35 °C, to the nearest minute.", marks: 3, ms: ["M1: $e^{-t/8} = \\dfrac{17}{65}$", "M1: $t = -8\\ln\\dfrac{17}{65}$", "A1: 11 minutes"] },
        { q: "Explain why, according to the model, the tea can never reach 15 °C.", marks: 1, ms: ["B1: $e^{-t/8} > 0$ for all $t$, so $\\theta > 18$ — the temperature approaches the room temperature 18 °C but never falls below it"] },
        { q: "Find the rate at which the tea is cooling when $t = 4$.", marks: 3, ms: ["M1: $\\dfrac{d\\theta}{dt} = -\\dfrac{65}{8}e^{-t/8}$", "M1: substitutes $t = 4$", "A1: $-4.93$ °C per minute (cooling at 4.93 °C/min)"] }
      ] },
    { level: "AS", src: "Edexcel AS 2025 P1 Q13", ctx: "The height $h$ metres of a tree $t$ years after planting is modelled by $h = 31 - Ae^{-kt}$. When planted the tree was 6 m tall; after 5 years it was 16 m tall.",
      parts: [
        { q: "Find the value of $A$.", marks: 1, ms: ["B1: $A = 25$"] },
        { q: "Show that $k = \\tfrac15\\ln\\tfrac53$.", marks: 3, ms: ["M1: $16 = 31 - 25e^{-5k}$", "M1: $e^{-5k} = \\tfrac{15}{25} = \\tfrac35$", "A1: $-5k = \\ln\\tfrac35 \\Rightarrow k = \\tfrac15\\ln\\tfrac53$"] },
        { q: "Find the height of the tree after 20 years.", marks: 2, ms: ["M1: $h = 31 - 25e^{-4\\ln(5/3)} = 31 - 25\\left(\\tfrac35\\right)^4$", "A1: $27.8$ m"] },
        { q: "State the maximum height the model predicts and find the rate of growth after 10 years.", marks: 4, ms: ["B1: 31 m", "M1: $\\dfrac{dh}{dt} = 25ke^{-kt}$", "M1: substitutes $t = 10$, $k = 0.102$", "A1: $0.92$ m per year"] }
      ] },
    { src: "Edexcel 2025 P1 Q9", ctx: "The total number of cars $N$ sold by a dealer $t$ months after opening is modelled by $N = 5000 - 5000e^{-0.075t}$.",
      parts: [
        { q: "Find the number of cars sold in the first 3 months.", marks: 2, ms: ["M1: $5000(1 - e^{-0.225})$", "A1: 1008 (accept 1007–1009)"] },
        { q: "Find the value of $T$ when $N = 3000$.", marks: 3, ms: ["M1: $e^{-0.075T} = 0.4$", "M1: $T = -\\dfrac{\\ln 0.4}{0.075}$", "A1: $T = 12.2$ months"] },
        { q: "Find the rate at which cars are being sold when $t = 12$, and comment on what happens to this rate in the long term.", marks: 3, ms: ["M1: $\\dfrac{dN}{dt} = 375e^{-0.075t}$", "A1: $375e^{-0.9} = 152$ cars per month", "B1: the rate decreases towards 0 as $t$ increases — sales slow down and total sales approach 5000"] }
      ] },
    { src: "Edexcel Oct 2020 P2 Q9", ctx: "Ethanol is heated. Its temperature $\\theta$ °C after $t$ minutes is modelled by $\\theta = A - Be^{-0.07t}$. Initially the temperature is 12 °C, and after 10 minutes it is 42 °C.",
      parts: [
        { q: "Show that $A - B = 12$ and find a second equation in $A$ and $B$.", marks: 2, ms: ["B1: $t = 0$: $A - B = 12$", "B1: $A - Be^{-0.7} = 42$"] },
        { q: "Hence find the value of $A$, to the nearest degree, and interpret it.", marks: 4, ms: ["M1: subtracts: $B(1 - e^{-0.7}) = 30$", "A1: $B = 59.6$", "A1: $A = 72$", "B1: $A$ is the temperature the ethanol approaches in the long term (the heater's limiting temperature)"] }
      ] }
  ]
});

})(KOS.content.extend);
