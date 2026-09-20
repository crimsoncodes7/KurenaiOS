/* Kurenai OS — deep content: Pure Mathematics, section P8 (Integration)
   at full A-level depth. Same contract as maths-pure-p4.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* =====================================================================
   8.1  The Fundamental Theorem of Calculus
   ===================================================================== */
C["maths:8.1"] = {
  notes: [
    { h: "Integration as the reverse of differentiation" },
    { callout: { t: "def", h: "The Fundamental Theorem of Calculus", body: [
      "If $F'(x) = f(x)$ then $\\displaystyle\\int f(x)\\,dx = F(x) + c$ and $\\displaystyle\\int_a^b f(x)\\,dx = F(b) - F(a)$.",
      "Two halves: **indefinite** integration undoes differentiation and needs a constant $c$ (any constant differentiates to 0, so the antiderivative is only fixed up to one); **definite** integration evaluates the antiderivative between limits and gives a number — the signed area under the curve (8.3)."
    ] } },
    { ul: [
      "**Why $+c$?** $\\frac{d}{dx}(x^2 + 7) = \\frac{d}{dx}(x^2 - 3) = 2x$; from $2x$ alone you cannot tell which. A point on the curve fixes $c$ (\"find the equation of the curve given $f'(x)$ and a point\").",
      "**Why $F(b) - F(a)$?** The definite integral is the limit of a sum of thin rectangles (8.4); the theorem says that sum is computed by evaluating any antiderivative at the ends. The $c$ cancels.",
      "**Check any integral by differentiating it.** If $\\frac{d}{dx}$ of your answer is not the integrand, it is wrong — a free check the examiner cannot see you make."
    ] },
    { worked: { tag: "exam", title: "Find $f(x)$ from $f'(x)$, an intercept and a factor", src: "A-level Oct 2020 · P2 Q8 · 6 marks",
      q: "$f'(x) = 6x^2 + ax - 23$ where $a$ is a constant; the $y$-intercept of $y = f(x)$ is $-12$; $(x + 4)$ is a factor of $f(x)$. Find $f(x)$ in simplest form.",
      steps: [
        { h: "Integrate", m: "$f(x) = 2x^3 + \\dfrac{a}{2}x^2 - 23x + c$", mk: "M1 A1", n: "Every term up a power and divided; $+c$." },
        { h: "Intercept", m: "$f(0) = -12 \\Rightarrow c = -12$", mk: "B1" },
        { h: "Factor theorem (2.6)", m: "$f(-4) = -128 + 8a + 92 - 12 = 0 \\Rightarrow a = 6$", mk: "M1 A1" },
        { m: "$f(x) = 2x^3 + 3x^2 - 23x - 12$", mk: "A1" }
      ], result: "$f(x) = 2x^3 + 3x^2 - 23x - 12$" } },
    { worked: { tag: "exam", title: "Integrate $\\frac{dy}{dx}$; a turning point fixes $k$; the point fixes $c$", src: "A-level June 2023 · P2 Q5 · 5 marks",
      q: "$C$ passes through $P(3, -10)$ and has a turning point at $P$; $\\frac{dy}{dx} = 2x^3 - 9x^2 + 5x + k$. **(a)** Show $k = 12$. **(b)** Find where $C$ crosses the $y$-axis.",
      steps: [
        { h: "(a)", m: "$54 - 81 + 15 + k = 0 \\Rightarrow k = 12$", mk: "M1 A1*" },
        { h: "(b)", m: "$y = \\dfrac{x^4}{2} - 3x^3 + \\dfrac{5x^2}{2} + 12x + c$; $(3, -10)$: $40.5 - 81 + 22.5 + 36 + c = -10 \\Rightarrow c = -28$: crosses at $(0, -28)$", mk: "M1 A1 A1" }
      ], result: "$(0, -28)$" } },
    { callout: { t: "mnemonic", h: "\"Up one, divide, plus $c$\"", body: "Power up by one, divide by the new power, add the constant — and differentiate back to check." } }
  ],
  flashcards: [
    ["Fundamental Theorem of Calculus?", "If $F' = f$: $\\int f\\,dx = F + c$ and $\\int_a^b f\\,dx = F(b) - F(a)$."],
    ["Why does an indefinite integral need $+c$?", "Any constant differentiates to zero, so the antiderivative is fixed only up to a constant."],
    ["How is $c$ found?", "From a point on the curve."],
    ["How do you check an integral?", "Differentiate the answer."],
    ["$f'(x) = 6x^2 + ax - 23$, $f(0) = -12$, $(x+4)$ a factor: $f$?", "$2x^3 + 3x^2 - 23x - 12$."]
  ],
  quiz: [
    { q: "$\\int 3x^2\\,dx =$", opts: ["$x^3 + c$", "$6x + c$", "$x^3$", "$\\tfrac{3}{2}x^3 + c$"], ans: 0, why: "Reverse of $\\frac{d}{dx}x^3$." },
    { q: "$\\int_1^2 2x\\,dx =$", opts: ["3", "4", "1", "$3 + c$"], ans: 0, why: "$[x^2]_1^2$." },
    { q: "A definite integral gives", opts: ["a number", "a function $+ c$", "a gradient", "a tangent"], ans: 0, why: "Limits evaluated." },
    { q: "If $\\frac{dy}{dx} = 4x$ and $y = 5$ at $x = 1$, then $y =$", opts: ["$2x^2 + 3$", "$2x^2 + 5$", "$4x^2 + 1$", "$2x^2$"], ans: 0, why: "$2 + c = 5$." }
  ]
};

/* =====================================================================
   8.2  Integrating standard functions
   ===================================================================== */
C["maths:8.2"] = {
  notes: [
    { h: "Standard integrals — the whole topic on one page" },
    { callout: { t: "memorise", h: "The table (mostly in the booklet, but know it)", body: [
      "$$\\int x^n\\,dx = \\dfrac{x^{n+1}}{n + 1} + c \;(n \\ne -1) \\qquad \\int \\dfrac1x\\,dx = \\ln|x| + c \\qquad \\int e^{kx}\\,dx = \\dfrac1k e^{kx} + c$$",
      "$$\\int \\sin kx\\,dx = -\\dfrac1k\\cos kx + c \\qquad \\int \\cos kx\\,dx = \\dfrac1k\\sin kx + c \\qquad \\int \\sec^2 kx\\,dx = \\dfrac1k\\tan kx + c$$",
      "In the booklet: $\\int \\tan x = \\ln|\\sec x|$, $\\int \\sec x = \\ln|\\sec x + \\tan x|$, $\\int \\cot x = \\ln|\\sin x|$, $\\int \\text{cosec}\\,x = -\\ln|\\text{cosec}\\,x + \\cot x|$, $\\int \\sec^2 x = \\tan x$, $\\int \\sec x\\tan x = \\sec x$, $\\int \\text{cosec}^2 x = -\\cot x$.",
      "**Reverse chain rule** (linear inside): $\\int f(ax + b)\\,dx = \\frac1a F(ax + b) + c$ — e.g. $\\int (2x + 5)^4 dx = \\frac{(2x + 5)^5}{10}$, $\\int \\frac{2}{3x - k}dx = \\frac23\\ln|3x - k|$, $\\int \\frac{2}{(2x - k)^2}dx = -\\frac{1}{2x - k}$."
    ] } },
    "As with differentiation: **rewrite first**. Expand, split fractions, use indices (2.1). Then integrate term by term.",
    { table: { head: ["Integrand", "Rewritten", "Integral"], rows: [
      ["$\\frac{x^{1/2}(2x - 5)}{3}$", "$\\frac23 x^{3/2} - \\frac53 x^{1/2}$", "$\\frac{4}{15}x^{5/2} - \\frac{10}{9}x^{3/2} + c$"],
      ["$x^4 - 6x^{1/2} - 3$", "—", "$\\frac{x^5}{5} - 4x^{3/2} - 3x + c$"],
      ["$\\frac{3x^4 - 4}{2x^3}$", "$\\frac32 x - 2x^{-3}$", "$\\frac34 x^2 + x^{-2} + c$"],
      ["$\\frac{2x - 3}{\\sqrt x}$", "$2x^{1/2} - 3x^{-1/2}$", "$\\frac43 x^{3/2} - 6x^{1/2} + c$"],
      ["$8x^3 - \\frac{3}{2\\sqrt x} + 5$", "$8x^3 - \\frac32 x^{-1/2} + 5$", "$2x^4 - 3x^{1/2} + 5x + c$"],
      ["$\\frac{1}{(x + 2)^2}$", "$(x + 2)^{-2}$", "$-\\frac{1}{x + 2} + c$"],
      ["$\\frac{1}{2x}$", "$\\frac12 \\cdot \\frac1x$", "$\\frac12\\ln|x| + c$"],
      ["$e^{5x} + \\sin 3x$", "—", "$\\frac15 e^{5x} - \\frac13\\cos 3x + c$"],
      ["$\\sec^2 2x$", "—", "$\\frac12\\tan 2x + c$"],
      ["$\\sin^2 x$", "$\\frac12(1 - \\cos 2x)$", "$\\frac x2 - \\frac14\\sin 2x + c$"]
    ] } },
    { callout: { t: "warn", h: "$n = -1$ is the exception", body: "$\\int x^{-1}\\,dx$ is **not** $\\frac{x^0}{0}$: it is $\\ln|x|$. Every other power follows the rule. The modulus matters when limits are negative." } },

    { page: "Worked integrals" },
    { worked: { tag: "exam", title: "$\\int \\frac{x^{1/2}(2x - 5)}{3}\\,dx$", src: "A-level June 2023 · P1 Q1 · 4 marks",
      steps: [
        { m: "$\\dfrac{x^{1/2}(2x - 5)}{3} = \\dfrac23 x^{3/2} - \\dfrac53 x^{1/2}$", mk: "M1", n: "Multiply the root through: $x^{1/2} \\cdot x = x^{3/2}$." },
        { m: "$\\int = \\dfrac23 \\cdot \\dfrac{x^{5/2}}{5/2} - \\dfrac53 \\cdot \\dfrac{x^{3/2}}{3/2} + c = \\dfrac{4}{15}x^{5/2} - \\dfrac{10}{9}x^{3/2} + c$", mk: "M1 A1 A1", n: "Dividing by $\\frac52$ is multiplying by $\\frac25$." }
      ], result: "$\\frac{4}{15}x^{5/2} - \\frac{10}{9}x^{3/2} + c$" } },
    { worked: { tag: "exam", title: "$\\int \\frac{3x^4 - 4}{2x^3}\\,dx$", src: "AS Nov 2021 · P1 Q3 · 4 marks",
      steps: [
        { m: "$\\dfrac{3x^4}{2x^3} - \\dfrac{4}{2x^3} = \\dfrac32 x - 2x^{-3}$", mk: "M1 A1" },
        { m: "$\\int = \\dfrac34 x^2 - 2 \\cdot \\dfrac{x^{-2}}{-2} + c = \\dfrac34 x^2 + x^{-2} + c$", mk: "M1 A1", n: "$-2 \\div (-2) = +1$: two negatives." }
      ], result: "$\\frac34 x^2 + \\frac{1}{x^2} + c$" } },
    { worked: { tag: "exam", title: "Definite integral in $k$; find $k$", src: "AS June 2019 · P1 Q3 · 6 marks",
      q: "**(a)** Find $\\displaystyle\\int\\left(\\frac{4}{x^3} + kx\\right)dx$. **(b)** Hence find $k$ such that $\\displaystyle\\int_{0.5}^{2}\\left(\\frac{4}{x^3} + kx\\right)dx = 8$.",
      steps: [
        { h: "(a)", m: "$\\int (4x^{-3} + kx)\\,dx = -2x^{-2} + \\dfrac{k}{2}x^2 + c$", mk: "M1 A1 A1" },
        { h: "(b)", m: "$\\left[-\\dfrac{2}{x^2} + \\dfrac{kx^2}{2}\\right]_{0.5}^{2} = \\left(-\\dfrac12 + 2k\\right) - \\left(-8 + \\dfrac{k}{8}\\right) = 7.5 + \\dfrac{15k}{8} = 8 \\Rightarrow k = \\dfrac{4}{15}$", mk: "M1 A1 A1" }
      ], result: "$k = \\frac{4}{15}$" } },
    { worked: { tag: "exam", title: "A limit giving a quadratic in $\\sqrt k$", src: "AS June 2020 · P1 Q7 · 8 marks",
      q: "$k > 0$ and $\\displaystyle\\int_1^k\\left(\\frac{5}{2\\sqrt x} + 3\\right)dx = 4$. **(a)** Show that $3k + 5\\sqrt k - 12 = 0$. **(b)** Hence, using algebra, find $k$.",
      steps: [
        { h: "(a)", m: "$\\int \\left(\\dfrac52 x^{-1/2} + 3\\right)dx = 5x^{1/2} + 3x$; $\; \\left[5\\sqrt x + 3x\\right]_1^k = 5\\sqrt k + 3k - 8 = 4$", mk: "M1 A1 M1 A1*" },
        { h: "(b) Quadratic in $u = \\sqrt k$", m: "$3u^2 + 5u - 12 = (3u - 4)(u + 3) = 0 \\Rightarrow u = \\dfrac43$ ($u > 0$) $\\Rightarrow k = \\dfrac{16}{9}$", mk: "M1 A1 M1 A1" }
      ], result: "$k = \\frac{16}{9}$" } },
    { worked: { tag: "exam", title: "Two integrals in $k$: independent of $k$; inversely proportional to $k$", src: "A-level June 2018 · P1 Q7 · 7 marks",
      q: "$k \\in \\mathbb{Z}^+$. **(a)** Show that $\\displaystyle\\int_k^{3k}\\frac{2}{3x - k}\\,dx$ is independent of $k$. **(b)** Show that $\\displaystyle\\int_k^{2k}\\frac{2}{(2x - k)^2}\\,dx$ is inversely proportional to $k$.",
      steps: [
        { h: "(a) $\\int \\frac{1}{ax + b} = \\frac1a\\ln|ax + b|$", m: "$\\left[\\dfrac23\\ln|3x - k|\\right]_k^{3k} = \\dfrac23\\left(\\ln 8k - \\ln 2k\\right) = \\dfrac23\\ln 4$ — no $k$ remains", mk: "M1 A1 M1 A1*", n: "The $k$ inside the logs cancels by the quotient law." },
        { h: "(b)", m: "$\\left[-\\dfrac{1}{2x - k}\\right]_k^{2k} = -\\dfrac{1}{3k} + \\dfrac{1}{k} = \\dfrac{2}{3k}$, a constant divided by $k$", mk: "M1 A1 A1*", n: "$\\int (2x - k)^{-2} = \\frac{(2x - k)^{-1}}{-1 \\cdot 2}$." }
      ], result: "(a) $\\frac23\\ln4$ (b) $\\frac{2}{3k}$" } },
    { worked: { tag: "exam", title: "Trig integral via an identity: $\\int \\frac{\\sin^2 2\\theta}{1 + \\cos 2\\theta}\\,d\\theta$", src: "A-level Specimen · P1 Q12 · 7 marks",
      q: "Show that $\\displaystyle\\int_0^{\\pi/3}\\frac{\\sin^2 2\\theta}{1 + \\cos 2\\theta}\\,d\\theta = \\frac{\\pi}{3} - \\frac{\\sqrt3}{2}$.",
      steps: [
        { h: "Simplify with double angles", m: "$\\sin^2 2\\theta = 4\\sin^2\\theta\\cos^2\\theta$ and $1 + \\cos 2\\theta = 2\\cos^2\\theta$, so the integrand is $2\\sin^2\\theta = 1 - \\cos 2\\theta$", mk: "M1 M1 A1", n: "Two double-angle identities turn a nasty quotient into something integrable." },
        { m: "$\\displaystyle\\int_0^{\\pi/3}(1 - \\cos 2\\theta)\\,d\\theta = \\left[\\theta - \\dfrac12\\sin 2\\theta\\right]_0^{\\pi/3} = \\dfrac{\\pi}{3} - \\dfrac12 \\cdot \\dfrac{\\sqrt3}{2} = \\dfrac{\\pi}{3} - \\dfrac{\\sqrt3}{4}$", mk: "M1 A1 M1 A1*", n: "$\\sin\\frac{2\\pi}{3} = \\frac{\\sqrt3}{2}$." }
      ], result: "$\\frac{\\pi}{3} - \\frac{\\sqrt3}{4}$" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Forgetting $+c$** in an indefinite integral — the last A mark.",
      "**Dividing by $n$ instead of $n + 1$.**",
      "**Reverse chain rule without the $\\frac1a$**: $\\int e^{5x} = \\frac15 e^{5x}$.",
      "**Sign of $\\int \\sin$**: $-\\cos$.",
      "**$\\int \\frac1x = \\ln|x|$**, not $x^0/0$; **$\\int \\frac{1}{x^2} = -\\frac1x$**.",
      "**$\\sin^2$, $\\cos^2$**: use the double-angle identities first.",
      "**Simplest form**: fractions like $\\frac{4}{15}x^{5/2}$, not $\\frac{2/3}{5/2}x^{5/2}$."
    ] },
    { callout: { t: "mnemonic", h: "\"Sine down to minus cos, cos up to sine; $e$ stays, over the $k$\"", body: "$\\int \\sin = -\\cos$, $\\int \\cos = \\sin$, $\\int e^{kx} = \\frac{e^{kx}}{k}$." } }
  ],
  flashcards: [
    ["$\\int x^n\\,dx$ and the exception?", "$\\frac{x^{n+1}}{n+1} + c$; for $n = -1$, $\\ln|x| + c$."],
    ["$\\int \\sin kx$, $\\int \\cos kx$, $\\int e^{kx}$?", "$-\\frac1k\\cos kx$; $\\frac1k\\sin kx$; $\\frac1k e^{kx}$."],
    ["$\\int \\sec^2 3x\\,dx$?", "$\\frac13\\tan 3x + c$."],
    ["$\\int \\frac{2}{3x - k}dx$?", "$\\frac23\\ln|3x - k| + c$."],
    ["$\\int (2x + 5)^4 dx$?", "$\\frac{(2x + 5)^5}{10} + c$."],
    ["$\\int \\sin^2 x\\,dx$?", "$\\frac x2 - \\frac14\\sin 2x + c$ (via $\\sin^2 x = \\frac{1 - \\cos 2x}{2}$)."],
    ["$\\int \\frac{3x^4 - 4}{2x^3}dx$?", "$\\frac34 x^2 + x^{-2} + c$."],
    ["$\\int_1^k (\\frac{5}{2\\sqrt x} + 3)dx = 4$ gives…", "$3k + 5\\sqrt k - 12 = 0$, $k = \\frac{16}{9}$."],
    ["Booklet integral of $\\tan x$?", "$\\ln|\\sec x| + c$."]
  ],
  quiz: [
    { q: "$\\int x^{-2}\\,dx =$", opts: ["$-x^{-1} + c$", "$x^{-1} + c$", "$-\\tfrac13 x^{-3} + c$", "$\\ln x + c$"], ans: 0, why: "$\\frac{x^{-1}}{-1}$." },
    { q: "$\\int \\cos 4x\\,dx =$", opts: ["$\\tfrac14\\sin 4x + c$", "$4\\sin 4x + c$", "$-\\tfrac14\\sin 4x + c$", "$\\sin 4x + c$"], ans: 0, why: "Divide by 4." },
    { q: "$\\int \\frac{1}{2x}\\,dx =$", opts: ["$\\tfrac12\\ln|x| + c$", "$\\tfrac{1}{2}x^{-2} + c$", "$-\\tfrac{1}{2x^2} + c$", "$2\\ln|x| + c$"], ans: 0, why: "$\\frac12\\int\\frac1x$." },
    { q: "$\\int e^{-3x}\\,dx =$", opts: ["$-\\tfrac13 e^{-3x} + c$", "$-3e^{-3x} + c$", "$\\tfrac13 e^{-3x} + c$", "$e^{-3x} + c$"], ans: 0, why: "Divide by $-3$." },
    { q: "$\\int_0^{\\pi/2}\\sin x\\,dx =$", opts: ["1", "0", "$-1$", "$\\tfrac{\\pi}{2}$"], ans: 0, why: "$[-\\cos x]$." },
    { q: "$\\int \\sqrt{x}\\,dx =$", opts: ["$\\tfrac23 x^{3/2} + c$", "$\\tfrac12 x^{-1/2} + c$", "$\\tfrac32 x^{3/2} + c$", "$x^{3/2} + c$"], ans: 0, why: "$\\frac{x^{3/2}}{3/2}$." }
  ]
};

/* =====================================================================
   8.3  Definite integrals and areas
   ===================================================================== */
C["maths:8.3"] = {
  notes: [
    { h: "Areas by integration — the whole topic on one page" },
    { callout: { t: "memorise", h: "Signed area", body: [
      "$\\displaystyle\\int_a^b f(x)\\,dx$ is the area between the curve and the $x$-axis from $a$ to $b$, counted **positive above** the axis and **negative below**. A region below the axis has a negative integral; its *area* is the modulus.",
      "**Between two curves** $y = f(x)$ (upper) and $y = g(x)$ (lower) between their intersections: $\\displaystyle\\int_a^b \\left[f(x) - g(x)\\right]dx$ — integrate the difference, one integral.",
      "**Regions with a line**: split into curve-part plus a triangle/trapezium if that is simpler, or integrate the difference.",
      "**Regions against the $y$-axis**: use $\\int x\\,dy$, or rectangle minus $\\int y\\,dx$."
    ] } },
    { fig: { x: [-3, 5], y: [-12, 10], axes: { xt: [-2, 4], yt: [-8, 8] }, items: [
      { shade: { fn: "x*(x+2)*(x-4)", from: -2, to: 0 }, c: "accent3", alpha: 0.25 },
      { shade: { fn: "x*(x+2)*(x-4)", from: 0, to: 2.2 }, c: "danger", alpha: 0.2 },
      { fn: "x*(x+2)*(x-4)", label: "y = x(x + 2)(x − 4)", at: 4.6, pos: "w" },
      { text: [-1, 4], t: "R₁ = +20/3", c: "accent3", size: 11 }, { text: [1.2, -4], t: "R₂: integral negative", c: "danger", size: 11 }, { vline: 2.2, c: "muted", label: "x = b" }
    ], cap: "A-level 2019 P1 Q8: $R_1$ above the axis has a positive integral; $R_2$ below has a negative one. \"Equal areas\" means equal moduli." } },

    { page: "Area under a curve" },
    { worked: { tag: "exam", title: "Region between a parabola, the $y$-axis and a horizontal line", src: "AS June 2023 · P1 Q5 · 5 marks",
      q: "$R$ is bounded by $y = 4x^2 + 3$, the $y$-axis and the line $y = 23$. Show that the area of $R$ is $k\\sqrt5$, with $k$ rational.",
      steps: [
        { h: "Where the curve meets $y = 23$", m: "$4x^2 + 3 = 23 \\Rightarrow x = \\sqrt5$", mk: "B1" },
        { h: "Rectangle minus area under the curve", m: "$23\\sqrt5 - \\displaystyle\\int_0^{\\sqrt5}(4x^2 + 3)\\,dx = 23\\sqrt5 - \\left[\\dfrac{4x^3}{3} + 3x\\right]_0^{\\sqrt5} = 23\\sqrt5 - \\dfrac{20\\sqrt5}{3} - 3\\sqrt5$", mk: "M1 A1 M1", n: "$(\\sqrt5)^3 = 5\\sqrt5$. The region is *above* the curve, below the line." },
        { m: "$= 20\\sqrt5 - \\dfrac{20\\sqrt5}{3} = \\dfrac{40\\sqrt5}{3}$: $k = \\dfrac{40}{3}$", mk: "A1", n: "Alternative: $\\int_3^{23} x\\,dy$ with $x = \\sqrt{(y - 3)/4}$." }
      ], result: "$\\frac{40}{3}\\sqrt5$" } },
    { worked: { tag: "exam", title: "Area under a cubic up to its minimum", src: "AS June 2019 · P1 Q13 · 7 marks",
      q: "$y = 2x^3 - 17x^2 + 40x$ has a minimum at $x = k$. $R$ is bounded by the curve, the $x$-axis and $x = k$. Show that the area of $R$ is $\\frac{256}{3}$.",
      steps: [
        { h: "Find $k$", m: "$\\dfrac{dy}{dx} = 6x^2 - 34x + 40 = 2(3x - 5)(x - 4) = 0$: $x = \\dfrac53$ (max) or $x = 4$ (min); $k = 4$", mk: "M1 A1 A1", n: "Check which is the minimum: $y'' = 12x - 34 > 0$ at 4." },
        { h: "Integrate from 0 to 4", m: "$\\displaystyle\\int_0^4 (2x^3 - 17x^2 + 40x)\\,dx = \\left[\\dfrac{x^4}{2} - \\dfrac{17x^3}{3} + 20x^2\\right]_0^4 = 128 - \\dfrac{1088}{3} + 320 = \\dfrac{256}{3}$", mk: "M1 A1 M1 A1*", n: "$y = x(2x^2 - 17x + 40)$ has its only other real root... the curve stays above the axis on $[0, 4]$ (the quadratic factor has discriminant $289 - 320 < 0$)." }
      ], result: "$\\frac{256}{3}$" } },
    { worked: { tag: "exam", title: "Area below the axis in the form $a\\sqrt2 + b$", src: "A-level June 2022 · P2 Q8 · 6 marks",
      q: "$y = \\frac{(x - 2)(x - 4)}{4\\sqrt x}$, $x > 0$. $R$ is bounded by the curve and the $x$-axis. Find the exact area of $R$ in the form $a\\sqrt2 + b$.",
      steps: [
        { h: "Rewrite as powers", m: "$\\dfrac{x^2 - 6x + 8}{4x^{1/2}} = \\dfrac14 x^{3/2} - \\dfrac32 x^{1/2} + 2x^{-1/2}$", mk: "M1 A1" },
        { m: "$\\displaystyle\\int_2^4 = \\left[\\dfrac{x^{5/2}}{10} - x^{3/2} + 4x^{1/2}\\right]_2^4 = (3.2 - 8 + 8) - \\left(\\dfrac{4\\sqrt2}{10} - 2\\sqrt2 + 4\\sqrt2\\right) = 3.2 - \\dfrac{12\\sqrt2}{5}$", mk: "M1 A1 A1", n: "$2^{5/2} = 4\\sqrt2$, $2^{3/2} = 2\\sqrt2$. The integral is negative (region below the axis)." },
        { m: "Area $= \\dfrac{12\\sqrt2}{5} - \\dfrac{16}{5}$: $a = \\dfrac{12}{5}$, $b = -\\dfrac{16}{5}$", mk: "A1" }
      ], result: "$\\frac{12}{5}\\sqrt2 - \\frac{16}{5}$" } },
    { worked: { tag: "exam", title: "Equal areas either side of the axis → an equation for $b$", src: "A-level June 2019 · P1 Q8 · 10 marks",
      q: "$y = x(x + 2)(x - 4)$. $R_1$ is bounded by the curve and the negative $x$-axis; $R_2$ by the curve, the positive $x$-axis and $x = b$, $0 < b < 4$. **(a)** Show that the area of $R_1$ is $\\frac{20}{3}$. **(b)** Given the areas of $R_1$ and $R_2$ are equal, show that $3b^4 - 8b^3 - 48b^2 + 80 = 0$.",
      steps: [
        { h: "(a)", m: "$y = x^3 - 2x^2 - 8x$; $\\displaystyle\\int_{-2}^{0} = \\left[\\dfrac{x^4}{4} - \\dfrac{2x^3}{3} - 4x^2\\right]_{-2}^{0} = 0 - \\left(4 + \\dfrac{16}{3} - 16\\right) = \\dfrac{20}{3}$", mk: "M1 A1 M1 A1*" },
        { h: "(b) $R_2$ is below the axis: its integral is $-\\frac{20}{3}$", m: "$\\dfrac{b^4}{4} - \\dfrac{2b^3}{3} - 4b^2 = -\\dfrac{20}{3} \\Rightarrow 3b^4 - 8b^3 - 48b^2 + 80 = 0$ (×12)", mk: "M1 A1 M1 A1*", n: "The sign is the whole question: equal *areas* means the integral over $R_2$ is the *negative* of $R_1$'s." }
      ], result: "shown" } },
    { worked: { tag: "exam", title: "Region bounded by a cubic, a maximum and the axis", src: "AS Specimen · P1 Q14 · 9 marks",
      q: "$C$: $y = (x - 2)^2(x + 3)$. $R$ is bounded by $C$, the vertical line through the maximum turning point, and the $x$-axis. Find the exact area of $R$.",
      steps: [
        { h: "The maximum", m: "$\\dfrac{dy}{dx} = 2(x - 2)(x + 3) + (x - 2)^2 = (x - 2)(3x + 4) = 0$: maximum at $x = -\\dfrac43$", mk: "M1 A1 A1", n: "Product rule; the other root $x = 2$ is the minimum (touching the axis)." },
        { h: "Expand and integrate from $-\\frac43$ to $2$", m: "$y = x^3 - x^2 - 8x + 12$; $\\displaystyle\\int_{-4/3}^{2} = \\left[\\dfrac{x^4}{4} - \\dfrac{x^3}{3} - 4x^2 + 12x\\right]_{-4/3}^{2}$\nAt $x = 2$: $4 - \\dfrac83 - 16 + 24 = \\dfrac{28}{3}$. At $x = -\\dfrac43$: $\\dfrac{64}{81} + \\dfrac{64}{81} - \\dfrac{64}{9} - 16 = -\\dfrac{1744}{81}$", mk: "M1 A1 M1 A1" },
        { m: "Area $= \\dfrac{28}{3} + \\dfrac{1744}{81} = \\dfrac{756 + 1744}{81} = \\dfrac{2500}{81}$", mk: "A1", n: "Exact fractions; the region is above the axis throughout." }
      ], result: "$\\frac{2500}{81}$" } },
    { worked: { tag: "exam", title: "$\\int_1^a\\sqrt x\\,dx = 10$: find $a$ as a power of 2; related integrals", src: "AS Specimen · P1 Q8 · 8 marks",
      q: "$R$ is bounded by $y = \\sqrt x$, $x = 1$, $x = a$ and the $x$-axis, and has area 10. **(a)** Find, in simplest form, (i) $\\displaystyle\\int_1^a\\sqrt{8x}\\,dx$, (ii) $\\displaystyle\\int_0^a\\sqrt x\\,dx$. **(b)** Find $a$ in the form $2^k$.",
      steps: [
        { h: "(a)(i) A constant multiple", m: "$\\sqrt{8x} = 2\\sqrt2\\sqrt x$, so the integral is $2\\sqrt2 \\times 10 = 20\\sqrt2$", mk: "M1 A1" },
        { h: "(b) first: solve for $a$", m: "$\\left[\\dfrac23 x^{3/2}\\right]_1^a = \\dfrac23(a^{3/2} - 1) = 10 \\Rightarrow a^{3/2} = 16 \\Rightarrow a = 16^{2/3} = 2^{8/3}$", mk: "M1 A1 M1 A1" },
        { h: "(a)(ii)", m: "$\\displaystyle\\int_0^a\\sqrt x\\,dx = \\dfrac23 a^{3/2} = \\dfrac23 \\times 16 = \\dfrac{32}{3}$", mk: "M1 A1", n: "Or: the region from 0 to 1 adds $\\frac23$ to the 10." }
      ], result: "(a)(i) $20\\sqrt2$ (ii) $\\frac{32}{3}$ (b) $a = 2^{8/3}$" } },

    { page: "Area between curves and lines" },
    { worked: { tag: "exam", title: "Tangent to a cubic, second intersection, area between", src: "AS June 2024 · P1 Q8 · 10 marks",
      q: "$C$: $y = x^3 - 14x + 23$; $l$ is the tangent to $C$ at $A(2, 3)$ and meets $C$ again at $B$. **(a)** Show that $l$ has equation $y = -2x + 7$. **(b)** Find the coordinates of $B$. **(c)** Find the area of the region $R$ between $C$ and $l$.",
      steps: [
        { h: "(a) $A(2, 3)$", m: "$\\dfrac{dy}{dx} = 3x^2 - 14 = -2$ at $x = 2$; $y - 3 = -2(x - 2) \\Rightarrow y = -2x + 7$", mk: "M1 A1 A1*" },
        { h: "(b) Double root at 2", m: "$x^3 - 14x + 23 = -2x + 7 \\Rightarrow x^3 - 12x + 16 = 0 \\Rightarrow (x - 2)^2(x + 4) = 0$: $B(-4, 15)$", mk: "M1 A1 A1" },
        { h: "(c) Curve above line between $-4$ and $2$", m: "$\\displaystyle\\int_{-4}^{2}\\left[(x^3 - 14x + 23) - (-2x + 7)\\right]dx = \\int_{-4}^{2}(x^3 - 12x + 16)\\,dx = \\left[\\dfrac{x^4}{4} - 6x^2 + 16x\\right]_{-4}^{2} = (4 - 24 + 32) - (64 - 96 - 64) = 108$", mk: "M1 A1 M1 A1", n: "The difference is $(x - 2)^2(x + 4) \\ge 0$ on the interval — no sign change to worry about." }
      ], result: "(b) $B(-4, 15)$ (c) 108" } },
    { worked: { tag: "exam", title: "Region bounded by a tangent, the axes and the curve", src: "AS June 2022 · P1 Q10 · 10 marks",
      q: "$C$: $y = \\frac13 x^2 - 2\\sqrt x + 3$, $x \\ge 0$; $P$ on $C$ has $x = 4$ and $l$ is the tangent at $P$. **(a)** Show that $l$ is $13x - 6y - 26 = 0$. **(b)** $R$ is bounded by the $y$-axis, $C$, $l$ and the $x$-axis. Find the exact area of $R$.",
      steps: [
        { h: "(a)", m: "$P(4, \\tfrac{13}{3})$; $\\dfrac{dy}{dx} = \\dfrac23 x - x^{-1/2} = \\dfrac83 - \\dfrac12 = \\dfrac{13}{6}$; $y - \\dfrac{13}{3} = \\dfrac{13}{6}(x - 4) \\Rightarrow 6y - 26 = 13x - 52 \\Rightarrow 13x - 6y - 26 = 0$", mk: "M1 A1 M1 A1*" },
        { h: "(b) Area under $C$ from 0 to 4, minus the triangle under $l$ from its $x$-intercept ($x = 2$) to 4", m: "$\\displaystyle\\int_0^4\\left(\\dfrac13 x^2 - 2x^{1/2} + 3\\right)dx = \\left[\\dfrac{x^3}{9} - \\dfrac43 x^{3/2} + 3x\\right]_0^4 = \\dfrac{64}{9} - \\dfrac{32}{3} + 12 = \\dfrac{76}{9}$\nTriangle: $\\tfrac12 \\times 2 \\times \\dfrac{13}{3} = \\dfrac{13}{3}$", mk: "M1 A1 A1 B1" },
        { m: "$R = \\dfrac{76}{9} - \\dfrac{13}{3} = \\dfrac{37}{9}$", mk: "M1 A1" }
      ], result: "$\\frac{37}{9}$" } },
    { worked: { tag: "exam", title: "Area above a curve and below the line through its maximum", src: "AS Nov 2021 · P1 Q14 · 10 marks",
      q: "$f(x) = -3x^2 + 12x + 8$. **(a)** Write $f(x)$ as $a(x + b)^2 + c$. **(b)** Find the maximum $M$. **(c)** $l$ through $M$ is parallel to the $x$-axis; $R$ is bounded by $C$, $l$ and the $y$-axis. Find the area of $R$ by integration.",
      steps: [
        { h: "(a)(b)", m: "$-3(x - 2)^2 + 20$; $M(2, 20)$", mk: "M1 A1 A1 B1 B1" },
        { h: "(c) Line minus curve from 0 to 2", m: "$\\displaystyle\\int_0^2\\left[20 - (-3x^2 + 12x + 8)\\right]dx = \\int_0^2 (3x^2 - 12x + 12)\\,dx = \\left[x^3 - 6x^2 + 12x\\right]_0^2 = 8 - 24 + 24 = 8$", mk: "M1 A1 M1 A1 A1", n: "Equivalently $\\int_0^2 3(x - 2)^2 dx = [(x - 2)^3]_0^2 = 0 - (-8) = 8$." }
      ], result: "8" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Find the exact area**", "fractions and surds; an area stated positive"],
      ["**Show that the area is …**", "the integral written with limits, the antiderivative, both substitutions, the arithmetic"],
      ["**Use calculus / algebraic integration**", "no calculator integral — the antiderivative on the page"],
      ["**Region bounded by … and the line …**", "sketch, find intersections, decide upper/lower, integrate the difference or split"],
      ["**Given the areas are equal**", "one integral is minus the other if the regions are on opposite sides of the axis"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Integrating across a sign change** and getting a smaller total than the area.",
      "**Limits from the wrong intersection** — find them algebraically first.",
      "**Line minus curve the wrong way round** (negative answer left as the area).",
      "**Rectangle minus curve** forgotten for regions against the $y$-axis or under a horizontal line.",
      "**Arithmetic with fractions and surds** at the substitution step — write each value out.",
      "**Calculator-only answers** where the question says \"using algebra\"."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Definite integral", "The $\\int_\\square^\\square$ template gives a decimal — check your exact answer converts to it ($\\frac{2500}{81} = 30.86$). Never the working itself."],
      ["Where curves meet", "Equation → Polynomial for the intersections before you set limits."]
    ] },
    { callout: { t: "mnemonic", h: "\"Sketch, cut, top minus bottom\"", body: "Sketch the region; find where the boundaries cut; integrate upper minus lower between those cuts." } }
  ],
  flashcards: [
    ["What does a negative definite integral mean?", "The region is below the $x$-axis; the area is the modulus."],
    ["Area between $f$ (upper) and $g$ (lower) from $a$ to $b$?", "$\\int_a^b [f(x) - g(x)]\\,dx$."],
    ["Region between $y = 4x^2 + 3$, the $y$-axis and $y = 23$: method?", "Rectangle $23\\sqrt5$ minus $\\int_0^{\\sqrt5}$: $\\frac{40\\sqrt5}{3}$."],
    ["$y = x(x+2)(x-4)$: area of the region from $-2$ to 0?", "$\\frac{20}{3}$."],
    ["Equal areas $R_1$ (above) and $R_2$ (below): relation of the integrals?", "$\\int_{R_2} = -\\int_{R_1}$."],
    ["Tangent to $y = x^3 - 14x + 23$ at $(2, 3)$ meets it again at…", "$(-4, 15)$: $(x-2)^2(x+4) = 0$; area between = 108."],
    ["$\\int_1^a \\sqrt x\\,dx = 10$: $a$?", "$a^{3/2} = 16$, $a = 2^{8/3}$."],
    ["Region under a curve and a tangent that cuts the axis: strategy?", "Area under curve minus (or plus) the triangle under the line."]
  ],
  quiz: [
    { q: "$\\int_0^2 (x^2 - 4)\\,dx =$", opts: ["$-\\tfrac{16}{3}$", "$\\tfrac{16}{3}$", "0", "$-4$"], ans: 0, why: "Region below the axis; area is $\\frac{16}{3}$." },
    { q: "Area between $y = x$ and $y = x^2$ from 0 to 1:", opts: ["$\\tfrac16$", "$\\tfrac13$", "$\\tfrac12$", "1"], ans: 0, why: "$\\int (x - x^2)$." },
    { q: "The area under $y = \\sqrt x$ from 1 to 4 is", opts: ["$\\tfrac{14}{3}$", "$\\tfrac{16}{3}$", "$\\tfrac{2}{3}$", "6"], ans: 0, why: "$\\frac23(8 - 1)$." },
    { q: "If a curve is below the $x$-axis on $[a, b]$, the area is", opts: ["$-\\int_a^b y\\,dx$", "$\\int_a^b y\\,dx$", "$\\int_a^b y^2\\,dx$", "0"], ans: 0, why: "Modulus of a negative integral." },
    { q: "$\\int_{-1}^{1} x^3\\,dx =$", opts: ["0", "$\\tfrac12$", "$\\tfrac14$", "$-\\tfrac12$"], ans: 0, why: "Odd function: areas cancel." }
  ]
};

/* =====================================================================
   8.4  Integration as the limit of a sum
   ===================================================================== */
C["maths:8.4"] = {
  notes: [
    { h: "Integration as the limit of a sum" },
    { callout: { t: "def", h: "The definition the theorem rests on", body: [
      "$$\\int_a^b f(x)\\,dx = \\lim_{\\delta x \\to 0}\\sum_{x = a}^{b} f(x)\\,\\delta x$$",
      "Slice the region under $y = f(x)$ into strips of width $\\delta x$; each has area $\\approx f(x)\\,\\delta x$ (a rectangle of height $f(x)$). Add them, let the strips become infinitely thin: the sum tends to the exact area, and that limit *is* the definite integral.",
      "On the paper it is a 1–3 mark recognition question: **rewrite the limit of the sum as an integral, then evaluate it.**"
    ] } },
    { fig: { x: [-0.3, 10], y: [-0.3, 3.5], axes: { xt: [4, 9], yt: [1, 2, 3] }, items: [
      { shade: { fn: "sqrt(x)", from: 4, to: 9 }, c: "accent", alpha: 0.1 },
      { poly: [[6, 0], [6.5, 0], [6.5, Math.sqrt(6.5)], [6, Math.sqrt(6.5)]], fill: "accent2", alpha: 0.5, c: "accent2" },
      { fn: "sqrt(x)", label: "y = √x", at: 9.4, pos: "s" },
      { text: [6.25, -0.2], t: "δx", c: "accent2", size: 11, pos: "s" }, { text: [7.3, 1.3], t: "height y", c: "accent2", size: 11, pos: "e" }
    ], cap: "A-level 2019 P2 Q5: one strip of width $\\delta x$ and height $\\sqrt x$. Summing from $x = 4$ to $x = 9$ and letting $\\delta x \\to 0$ gives $\\int_4^9\\sqrt x\\,dx$." } },
    { worked: { tag: "exam", title: "$\\lim_{\\delta x \\to 0}\\sum_{x=4}^{9}\\sqrt x\\,\\delta x$", src: "A-level June 2019 · P2 Q5 · 3 marks",
      steps: [
        { m: "$= \\displaystyle\\int_4^9\\sqrt x\\,dx = \\left[\\dfrac23 x^{3/2}\\right]_4^9 = \\dfrac23(27 - 8) = \\dfrac{38}{3}$", mk: "M1 M1 A1", n: "Recognition mark for writing the integral; then a routine evaluation." }
      ], result: "$\\frac{38}{3}$" } },
    { worked: { tag: "exam", title: "$\\lim\\sum\\frac{2}{x}\\delta x$ from 2.1 to 6.3 as $\\ln k$", src: "A-level June 2022 · P1 Q4 · 3 marks",
      q: "**(a)** Express $\\displaystyle\\lim_{\\delta x \\to 0}\\sum_{x = 2.1}^{6.3}\\frac2x\\,\\delta x$ as an integral. **(b)** Hence show that it equals $\\ln k$, with $k$ to be found.",
      steps: [
        { h: "(a)", m: "$\\displaystyle\\int_{2.1}^{6.3}\\dfrac2x\\,dx$", mk: "B1" },
        { h: "(b)", m: "$= 2\\left[\\ln x\\right]_{2.1}^{6.3} = 2\\ln\\dfrac{6.3}{2.1} = 2\\ln 3 = \\ln 9$: $k = 9$", mk: "M1 A1", n: "Quotient law then power law. (2025 P1 Q5: the same with $\\frac{2}{\\sqrt x}$ from 1.44 to 2.89 gives $[4\\sqrt x] = 4(1.7 - 1.2) = 2$.)" }
      ], result: "$\\ln 9$" } },
    { callout: { t: "mnemonic", h: "\"Sum of strips → integral; $\\delta x$ → $dx$; the $x$-range → the limits\"", body: "Three substitutions and the notation is converted." } }
  ],
  flashcards: [
    ["$\\int_a^b f(x)\\,dx$ as a limit?", "$\\lim_{\\delta x \\to 0}\\sum_{x=a}^{b} f(x)\\,\\delta x$."],
    ["What does $f(x)\\,\\delta x$ represent?", "The area of one thin rectangular strip of height $f(x)$ and width $\\delta x$."],
    ["$\\lim\\sum_{x=4}^{9}\\sqrt x\\,\\delta x = $?", "$\\int_4^9\\sqrt x\\,dx = \\frac{38}{3}$."],
    ["$\\lim\\sum_{2.1}^{6.3}\\frac2x\\delta x = $?", "$2\\ln 3 = \\ln 9$."]
  ],
  quiz: [
    { q: "$\\lim_{\\delta x\\to0}\\sum_{x=1}^{3} x^2\\,\\delta x =$", opts: ["$\\tfrac{26}{3}$", "9", "$\\tfrac{27}{3}$", "8"], ans: 0, why: "$\\int_1^3 x^2 = \\frac{27 - 1}{3}$." },
    { q: "In the limit of a sum, $\\delta x$ becomes", opts: ["$dx$", "0", "$x$", "the limits"], ans: 0, why: "Notation change." },
    { q: "$\\lim\\sum_{x=1}^{e}\\frac1x\\,\\delta x =$", opts: ["1", "$e$", "0", "$\\ln 2$"], ans: 0, why: "$\\ln e - \\ln 1$." }
  ]
};

/* =====================================================================
   8.5  Integration by substitution and by parts
   ===================================================================== */
C["maths:8.5"] = {
  notes: [
    { h: "Substitution and parts — the whole topic on one page" },
    "Two methods, two inverses: **substitution** undoes the chain rule, **parts** undoes the product rule. Between them they handle everything on the A-level paper that is not a standard integral or a partial fraction.",
    { callout: { t: "formula", h: "In the booklet", body: [
      "$$\\int u\\dfrac{dv}{dx}\\,dx = uv - \\int v\\dfrac{du}{dx}\\,dx$$",
      "**Not in the booklet**: the substitution procedure, the recognition $\\int\\frac{f'(x)}{f(x)}dx = \\ln|f(x)| + c$, and $\\int\\ln x\\,dx = x\\ln x - x + c$ (by parts with $u = \\ln x$, $\\frac{dv}{dx} = 1$)."
    ] } },
    { callout: { t: "memorise", h: "Substitution — the routine", body: [
      "1. Choose $u$ (the question usually gives it: $u = x + 2$, $u = 1 + \\sqrt x$, $x = a\\sin^2\\theta$, $x = 2\\sin u$).",
      "2. Find $\\frac{du}{dx}$ and rearrange to replace $dx$: $dx = \\frac{du}{du/dx}$. Everything in the integral must become $u$ — including any leftover $x$ (solve $u = \\ldots$ for $x$).",
      "3. **Change the limits** to $u$-values. (Or substitute back at the end — but not both.)",
      "4. Integrate in $u$; evaluate.",
      "Trig substitutions ($x = a\\sin\\theta$) are chosen so that $\\sqrt{a^2 - x^2} = a\\cos\\theta$ — the identity $1 - \\sin^2 = \\cos^2$ removes the root."
    ] } },
    { callout: { t: "memorise", h: "Parts — the routine", body: [
      "Choose $u$ to be the factor that gets **simpler** when differentiated: $\\ln x$ always; then polynomials ($x$, $x^2$); $e^{kx}$ and trig last (they never simplify — L-A-T-E order).",
      "$\\int x^3\\ln x$: $u = \\ln x$, $dv = x^3$. $\; \\int x^2 e^{-3x}$: $u = x^2$, $dv = e^{-3x}$, and apply parts **twice**.",
      "For definite integrals evaluate $[uv]$ at the limits as you go."
    ] } },

    { page: "Substitution — worked" },
    { worked: { tag: "exam", title: "$\\int_0^2 2x\\sqrt{x + 2}\\,dx = \\frac{32}{15}(2 + \\sqrt2)$", src: "A-level June 2018 · P1 Q13 · 7 marks",
      steps: [
        { h: "$u = x + 2$: $x = u - 2$, $dx = du$, limits $2 \\to 4$", m: "$\\displaystyle\\int_2^4 2(u - 2)u^{1/2}\\,du = \\int_2^4\\left(2u^{3/2} - 4u^{1/2}\\right)du$", mk: "M1 A1 B1", n: "Expand so every term is a power of $u$." },
        { m: "$= \\left[\\dfrac45 u^{5/2} - \\dfrac83 u^{3/2}\\right]_2^4 = \\left(\\dfrac{128}{5} - \\dfrac{64}{3}\\right) - \\left(\\dfrac{16\\sqrt2}{5} - \\dfrac{16\\sqrt2}{3}\\right)$", mk: "M1 A1", n: "$4^{5/2} = 32$, $2^{5/2} = 4\\sqrt2$, $2^{3/2} = 2\\sqrt2$." },
        { m: "$= \\dfrac{64}{15} + \\dfrac{32\\sqrt2}{15} = \\dfrac{32}{15}(2 + \\sqrt2)$", mk: "M1 A1*" }
      ], result: "shown" } },
    { worked: { tag: "exam", title: "$\\int_0^2\\frac{x}{(2x + 1)^3}dx = \\frac{2}{25}$", src: "A-level June 2025 · P1 Q13 · 5 marks",
      steps: [
        { h: "$u = 2x + 1$: $x = \\frac{u - 1}{2}$, $dx = \\frac{du}{2}$, limits $1 \\to 5$", m: "$\\displaystyle\\int_1^5\\dfrac{(u - 1)/2}{u^3} \\cdot \\dfrac{du}{2} = \\dfrac14\\int_1^5\\left(u^{-2} - u^{-3}\\right)du$", mk: "M1 A1", n: "Split $\\frac{u - 1}{u^3}$ into two powers." },
        { m: "$= \\dfrac14\\left[-\\dfrac1u + \\dfrac{1}{2u^2}\\right]_1^5 = \\dfrac14\\left[\\left(-\\dfrac15 + \\dfrac{1}{50}\\right) - \\left(-1 + \\dfrac12\\right)\\right] = \\dfrac14 \\cdot \\dfrac{16}{50} = \\dfrac{2}{25}$", mk: "M1 A1 A1*" }
      ], result: "shown" } },
    { worked: { tag: "exam", title: "$u = 1 + \\sqrt x$: transform, then evaluate as $A - B\\ln 5$", src: "A-level Oct 2021 · P2 Q12 · 7 marks",
      q: "**(a)** Use $u = 1 + \\sqrt x$ to show $\\displaystyle\\int_0^{16}\\frac{x}{1 + \\sqrt x}\\,dx = \\int_p^q\\frac{2(u - 1)^3}{u}\\,du$. **(b)** Hence show the integral equals $A - B\\ln 5$.",
      steps: [
        { h: "(a) $x = (u - 1)^2$, $dx = 2(u - 1)\\,du$", m: "$\\displaystyle\\int\\dfrac{(u - 1)^2}{u} \\cdot 2(u - 1)\\,du = \\int\\dfrac{2(u - 1)^3}{u}\\,du$; limits: $x = 0 \\Rightarrow u = 1$, $x = 16 \\Rightarrow u = 5$", mk: "M1 A1 B1", n: "Differentiate $x$ with respect to $u$, not the other way." },
        { h: "(b) Expand and divide through by $u$", m: "$\\dfrac{2(u^3 - 3u^2 + 3u - 1)}{u} = 2u^2 - 6u + 6 - \\dfrac2u$", mk: "M1 A1" },
        { m: "$\\left[\\dfrac{2u^3}{3} - 3u^2 + 6u - 2\\ln u\\right]_1^5 = \\left(\\dfrac{250}{3} - 75 + 30 - 2\\ln5\\right) - \\left(\\dfrac23 - 3 + 6\\right) = \\dfrac{104}{3} - 2\\ln 5$", mk: "M1 A1*" }
      ], result: "$\\frac{104}{3} - 2\\ln 5$" } },
    { worked: { tag: "exam", title: "Trig substitution $x = a\\sin^2\\theta$ removes a root", src: "A-level June 2024 · P1 Q13 · 8 marks",
      q: "$a > 0$. **(a)** Use $x = a\\sin^2\\theta$ to show $\\displaystyle\\int_0^a x^{1/2}\\sqrt{a - x}\\,dx = \\frac12 a^2\\int_0^{\\pi/2}\\sin^2 2\\theta\\,d\\theta$. **(b)** Hence show the integral equals $k\\pi a^2$.",
      steps: [
        { h: "(a) $dx = 2a\\sin\\theta\\cos\\theta\\,d\\theta$", m: "$x^{1/2} = \\sqrt a\\sin\\theta$, $\\sqrt{a - x} = \\sqrt{a(1 - \\sin^2\\theta)} = \\sqrt a\\cos\\theta$\nIntegrand × $dx$: $a\\sin\\theta\\cos\\theta \\cdot 2a\\sin\\theta\\cos\\theta = 2a^2\\sin^2\\theta\\cos^2\\theta = \\dfrac{a^2}{2}\\sin^2 2\\theta$", mk: "M1 A1 M1", n: "$2\\sin\\theta\\cos\\theta = \\sin 2\\theta$, squared gives the $\\frac14$ that turns $2a^2$ into $\\frac{a^2}{2}$." },
        { m: "Limits: $x = 0 \\Rightarrow \\theta = 0$; $x = a \\Rightarrow \\sin^2\\theta = 1 \\Rightarrow \\theta = \\dfrac{\\pi}{2}$", mk: "A1*" },
        { h: "(b) $\\sin^2 2\\theta = \\frac12(1 - \\cos 4\\theta)$", m: "$\\dfrac{a^2}{2}\\int_0^{\\pi/2}\\dfrac{1 - \\cos 4\\theta}{2}\\,d\\theta = \\dfrac{a^2}{4}\\left[\\theta - \\dfrac{\\sin 4\\theta}{4}\\right]_0^{\\pi/2} = \\dfrac{a^2}{4} \\cdot \\dfrac{\\pi}{2} = \\dfrac{\\pi a^2}{8}$: $k = \\dfrac18$", mk: "M1 A1 M1 A1*" }
      ], result: "$k = \\frac18$" } },
    { worked: { tag: "exam", title: "$x = 2\\sin u$ turns $\\frac{1}{x^2\\sqrt{4 - x^2}}$ into $k\\,\\text{cosec}^2 u$", src: "A-level June 2025 · P1 Q16 · 7 marks",
      q: "$y = \\frac{1}{x^2\\sqrt{4 - x^2}}$, $0 < x < 2$. $R$ is bounded by $C$, $x = 1$, $x = \\sqrt3$ and the $x$-axis. **(a)** Use $x = 2\\sin u$ to show the area of $R$ is $\\displaystyle\\int_{\\pi/6}^{\\pi/3} k\\,\\text{cosec}^2 u\\,du$. **(b)** Hence find the exact area.",
      steps: [
        { h: "(a) $dx = 2\\cos u\\,du$; $\\sqrt{4 - x^2} = 2\\cos u$", m: "$\\dfrac{2\\cos u\\,du}{4\\sin^2 u \\cdot 2\\cos u} = \\dfrac{1}{4\\sin^2 u}\\,du = \\dfrac14\\text{cosec}^2 u\\,du$; limits $x = 1 \\Rightarrow u = \\dfrac{\\pi}{6}$, $x = \\sqrt3 \\Rightarrow u = \\dfrac{\\pi}{3}$: $k = \\dfrac14$", mk: "M1 A1 A1 B1" },
        { h: "(b) $\\int\\text{cosec}^2 u = -\\cot u$ (booklet)", m: "$\\dfrac14\\left[-\\cot u\\right]_{\\pi/6}^{\\pi/3} = \\dfrac14\\left(-\\dfrac{1}{\\sqrt3} + \\sqrt3\\right) = \\dfrac14 \\cdot \\dfrac{2}{\\sqrt3} = \\dfrac{\\sqrt3}{6}$", mk: "M1 A1 A1" }
      ], result: "$\\frac{\\sqrt3}{6}$" } },
    { worked: { tag: "exam", title: "$x = u^2 + 1$, then partial fractions, to a single $\\ln$", src: "A-level Oct 2020 · P1 Q10 · 10 marks",
      q: "**(a)** Use $x = u^2 + 1$ to show $\\displaystyle\\int_5^{10}\\frac{3}{(x - 1)(3 + 2\\sqrt{x - 1})}\\,dx = \\int_p^q\\frac{6}{u(3 + 2u)}\\,du$. **(b)** Hence show the integral equals $\\ln a$, $a$ rational.",
      steps: [
        { h: "(a) $dx = 2u\\,du$, $x - 1 = u^2$, $\\sqrt{x - 1} = u$", m: "$\\displaystyle\\int\\dfrac{3 \\cdot 2u}{u^2(3 + 2u)}\\,du = \\int\\dfrac{6}{u(3 + 2u)}\\,du$; limits $x = 5 \\Rightarrow u = 2$, $x = 10 \\Rightarrow u = 3$", mk: "M1 A1 A1 B1" },
        { h: "(b) Partial fractions (2.10)", m: "$\\dfrac{6}{u(3 + 2u)} = \\dfrac{2}{u} - \\dfrac{4}{3 + 2u}$", mk: "M1 A1" },
        { m: "$\\left[2\\ln u - 2\\ln(3 + 2u)\\right]_2^3 = 2\\ln\\dfrac{3}{9} - 2\\ln\\dfrac{2}{7} = 2\\ln\\dfrac{7}{6} = \\ln\\dfrac{49}{36}$", mk: "M1 A1 A1 A1*", n: "$\\int\\frac{4}{3 + 2u} = 2\\ln(3 + 2u)$ — the $\\frac12$ from the reverse chain rule." }
      ], result: "$\\ln\\frac{49}{36}$" } },

    { page: "Parts — worked" },
    { worked: { tag: "exam", title: "$\\int_1^{e^2}x^3\\ln x\\,dx = ae^8 + b$", src: "A-level June 2022 · P1 Q12 · 5 marks",
      steps: [
        { h: "$u = \\ln x$, $\\frac{dv}{dx} = x^3$", m: "$\\displaystyle\\int x^3\\ln x\\,dx = \\dfrac{x^4}{4}\\ln x - \\int\\dfrac{x^4}{4} \\cdot \\dfrac1x\\,dx = \\dfrac{x^4}{4}\\ln x - \\dfrac{x^4}{16}$", mk: "M1 A1 A1", n: "Always $u = \\ln x$: its derivative $\\frac1x$ is what makes the second integral easy." },
        { m: "$\\left[\\dfrac{x^4}{4}\\ln x - \\dfrac{x^4}{16}\\right]_1^{e^2} = \\left(\\dfrac{2e^8}{4} - \\dfrac{e^8}{16}\\right) - \\left(0 - \\dfrac{1}{16}\\right) = \\dfrac{7e^8}{16} + \\dfrac{1}{16}$", mk: "M1 A1*", n: "$\\ln e^2 = 2$; $(e^2)^4 = e^8$." }
      ], result: "$a = \\frac{7}{16}$, $b = \\frac{1}{16}$" } },
    { worked: { tag: "exam", title: "Parts twice: $\\int_0^1 8x^2e^{-3x}\\,dx = A + Be^{-3}$", src: "A-level June 2024 · P2 Q11 · 5 marks",
      steps: [
        { h: "First: $u = 8x^2$, $\\frac{dv}{dx} = e^{-3x}$", m: "$\\displaystyle\\int 8x^2e^{-3x}dx = -\\dfrac{8x^2}{3}e^{-3x} + \\int\\dfrac{16x}{3}e^{-3x}dx$", mk: "M1 A1" },
        { h: "Second: $u = \\frac{16x}{3}$, $\\frac{dv}{dx} = e^{-3x}$", m: "$\\displaystyle\\int\\dfrac{16x}{3}e^{-3x}dx = -\\dfrac{16x}{9}e^{-3x} + \\int\\dfrac{16}{9}e^{-3x}dx = -\\dfrac{16x}{9}e^{-3x} - \\dfrac{16}{27}e^{-3x}$", mk: "M1 A1" },
        { m: "$\\left[-\\dfrac{8x^2}{3}e^{-3x} - \\dfrac{16x}{9}e^{-3x} - \\dfrac{16}{27}e^{-3x}\\right]_0^1 = \\left(-\\dfrac83 - \\dfrac{16}{9} - \\dfrac{16}{27}\\right)e^{-3} + \\dfrac{16}{27} = \\dfrac{16}{27} - \\dfrac{136}{27}e^{-3}$", mk: "A1", n: "$A = \\frac{16}{27}$, $B = -\\frac{136}{27}$. Each application of parts lowers the power of $x$ by one." }
      ], result: "$\\frac{16}{27} - \\frac{136}{27}e^{-3}$" } },
    { worked: { tag: "exam", title: "Area under $y = 2e^{2x} - xe^{2x}$ as $pe^4 + q$", src: "A-level Specimen · P1 Q7 · 5 marks",
      steps: [
        { h: "Where the curve meets the axis; then parts with $u = 2 - x$", m: "$y = (2 - x)e^{2x} = 0$ at $x = 2$. $\\displaystyle\\int_0^2(2 - x)e^{2x}dx = \\left[\\dfrac{(2 - x)e^{2x}}{2}\\right]_0^2 + \\int_0^2\\dfrac{e^{2x}}{2}dx$", mk: "B1 M1 A1", n: "$\\frac{du}{dx} = -1$, so $-\\int v\\frac{du}{dx}$ becomes $+\\int\\frac{e^{2x}}{2}$." },
        { m: "$= (0 - 1) + \\left[\\dfrac{e^{2x}}{4}\\right]_0^2 = -1 + \\dfrac{e^4}{4} - \\dfrac14 = \\dfrac14 e^4 - \\dfrac54$", mk: "M1 A1" }
      ], result: "$p = \\frac14$, $q = -\\frac54$" } },
    { worked: { tag: "exam", title: "$\\int x\\ln x$, a normal, and a region", src: "A-level June 2018 · P2 Q13 · 10 marks",
      q: "$C$: $y = x\\ln x$, $x > 0$; $l$ is the normal at $P(e, e)$; $R$ is bounded by $C$, $l$ and the $x$-axis. Show that the area of $R$ is $Ae^2 + B$, $A$ and $B$ rational.",
      steps: [
        { h: "The normal", m: "$\\dfrac{dy}{dx} = \\ln x + 1 = 2$ at $x = e$; normal gradient $-\\dfrac12$: $y - e = -\\dfrac12(x - e)$, meeting the axis at $x = 3e$", mk: "M1 A1 A1" },
        { h: "Area under $C$ from 1 to $e$ (parts) + triangle", m: "$\\displaystyle\\int_1^e x\\ln x\\,dx = \\left[\\dfrac{x^2}{2}\\ln x - \\dfrac{x^2}{4}\\right]_1^e = \\dfrac{e^2}{2} - \\dfrac{e^2}{4} + \\dfrac14 = \\dfrac{e^2}{4} + \\dfrac14$\nTriangle from $e$ to $3e$, height $e$: $\\tfrac12 \\cdot 2e \\cdot e = e^2$", mk: "M1 A1 A1 B1", n: "$C$ meets the axis at $x = 1$ ($\\ln 1 = 0$) — the lower limit." },
        { m: "$R = \\dfrac{e^2}{4} + \\dfrac14 + e^2 = \\dfrac54 e^2 + \\dfrac14$", mk: "M1 A1*" }
      ], result: "$A = \\frac54$, $B = \\frac14$" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Not replacing $dx$**: $dx = \\frac{du}{du/dx}$ every time.",
      "**Mixed variables**: an $x$ left inside a $u$-integral. Express every $x$ in $u$.",
      "**Limits not changed** (or changed and then substituted back as well).",
      "**Trig substitution without the identity**: $\\sqrt{a^2 - a^2\\sin^2\\theta} = a\\cos\\theta$ needs stating.",
      "**Wrong $u$ in parts**: $\\ln x$ must be $u$; polynomial before exponential.",
      "**Sign in $-\\int v\\frac{du}{dx}$** especially when $\\frac{du}{dx}$ is negative.",
      "**Parts applied once when twice is needed** ($x^2 e^{kx}$)."
    ] },
    { callout: { t: "mnemonic", h: "\"LATE\" for parts", body: "Choose $u$ in the order Logs, Algebraic (polynomials), Trig, Exponential — the first type present is $u$." } },
    { callout: { t: "mnemonic", h: "\"Sub, $dx$, limits, all-$u$\"", body: "Substitution checklist: choose $u$, replace $dx$, change the limits, make sure nothing but $u$ remains." } }
  ],
  flashcards: [
    ["Integration by parts formula?", "$\\int u\\frac{dv}{dx}dx = uv - \\int v\\frac{du}{dx}dx$."],
    ["$\\int \\ln x\\,dx = $?", "$x\\ln x - x + c$."],
    ["Which factor is $u$ in $\\int x^3\\ln x$?", "$u = \\ln x$ (LATE)."],
    ["$\\int_1^{e^2} x^3\\ln x\\,dx = $?", "$\\frac{7}{16}e^8 + \\frac{1}{16}$."],
    ["Substitution $u = x + 2$ in $\\int_0^2 2x\\sqrt{x+2}$: new limits and integrand?", "$2 \\to 4$; $\\int (2u^{3/2} - 4u^{1/2})du$."],
    ["Why substitute $x = a\\sin^2\\theta$ in $\\int x^{1/2}\\sqrt{a - x}$?", "$\\sqrt{a - a\\sin^2\\theta} = \\sqrt a\\cos\\theta$ removes the root."],
    ["$\\int \\frac{f'(x)}{f(x)}dx = $?", "$\\ln|f(x)| + c$."],
    ["$\\int_0^1 8x^2 e^{-3x}dx$ needs parts how many times?", "Twice; result $\\frac{16}{27} - \\frac{136}{27}e^{-3}$."],
    ["$u = 1 + \\sqrt x$: $dx = $?", "$x = (u-1)^2$, $dx = 2(u-1)\\,du$."],
    ["$\\int \\text{cosec}^2 u\\,du = $?", "$-\\cot u + c$."]
  ],
  quiz: [
    { q: "$\\int x e^x\\,dx =$", opts: ["$xe^x - e^x + c$", "$xe^x + e^x + c$", "$\\tfrac{x^2}{2}e^x + c$", "$e^x + c$"], ans: 0, why: "Parts with $u = x$." },
    { q: "With $u = x^2 + 1$, $\\int 2x(x^2 + 1)^3 dx =$", opts: ["$\\tfrac{(x^2+1)^4}{4} + c$", "$(x^2+1)^4 + c$", "$\\tfrac{(x^2+1)^4}{8} + c$", "$2(x^2+1)^4 + c$"], ans: 0, why: "$\\int u^3 du$." },
    { q: "$\\int \\frac{2x}{x^2 + 3}dx =$", opts: ["$\\ln(x^2 + 3) + c$", "$\\tfrac{1}{x^2+3} + c$", "$2\\ln(x^2+3) + c$", "$\\ln(2x) + c$"], ans: 0, why: "$\\frac{f'}{f}$." },
    { q: "For $\\int x^2\\sin x\\,dx$ choose $u =$", opts: ["$x^2$", "$\\sin x$", "$x$", "$\\cos x$"], ans: 0, why: "Algebraic before trig." },
    { q: "Substituting $x = 2\\sin u$, $\\sqrt{4 - x^2} =$", opts: ["$2\\cos u$", "$2\\sin u$", "$4\\cos^2 u$", "$\\cos u$"], ans: 0, why: "$\\sqrt{4(1 - \\sin^2 u)}$." },
    { q: "Limits $x = 0$ to $x = 16$ under $u = 1 + \\sqrt x$ become", opts: ["$1$ to $5$", "$0$ to $16$", "$1$ to $17$", "$0$ to $4$"], ans: 0, why: "$1 + 0$, $1 + 4$." }
  ]
};

/* =====================================================================
   8.6  Integration using partial fractions
   ===================================================================== */
C["maths:8.6"] = {
  notes: [
    { h: "Integrating rational functions — the whole topic on one page" },
    { callout: { t: "memorise", h: "The three shapes", body: [
      "$\\displaystyle\\int\\frac{A}{ax + b}\\,dx = \\frac{A}{a}\\ln|ax + b| + c$",
      "$\\displaystyle\\int\\frac{B}{(ax + b)^2}\\,dx = -\\frac{B}{a(ax + b)} + c$ (a power, not a log)",
      "$\\displaystyle\\int\\frac{f'(x)}{f(x)}\\,dx = \\ln|f(x)| + c$ — e.g. $\\int\\frac{2x}{x^2 + 5}dx = \\ln(x^2 + 5)$; $\\int\\frac{x}{x^2 + 5}dx = \\frac12\\ln(x^2 + 5)$.",
      "Anything else with a factorisable denominator: **partial fractions first** (2.10), then the shapes above. Improper fractions: divide first."
    ] } },
    { table: { head: ["Integrand", "Decomposed", "Integral"], rows: [
      ["$\\frac{5x + 7}{(x + 1)(x + 3)}$", "$\\frac{1}{x + 1} + \\frac{4}{x + 3}$", "$\\ln|x + 1| + 4\\ln|x + 3| + c$"],
      ["$\\frac{x^2 + 8x - 3}{x + 2}$", "$x + 6 - \\frac{15}{x + 2}$", "$\\frac{x^2}{2} + 6x - 15\\ln|x + 2| + c$"],
      ["$\\frac{3}{(2t - 1)(t + 1)}$", "$\\frac{2}{2t - 1} - \\frac{1}{t + 1}$", "$\\ln|2t - 1| - \\ln|t + 1| + c$"],
      ["$\\frac{1}{V(25 - V)}$", "$\\frac{1}{25}\\left(\\frac1V + \\frac{1}{25 - V}\\right)$", "$\\frac{1}{25}\\left(\\ln V - \\ln(25 - V)\\right) + c$"],
      ["$\\frac{2}{(2x - 1)^4}$", "—", "$-\\frac{1}{3(2x - 1)^3} + c$"]
    ] } },

    { page: "Worked" },
    { worked: { tag: "exam", title: "Rational curve with asymptotes; area as $a\\ln 2 + b\\ln 3$", src: "A-level June 2019 · P1 Q13 · 11 marks",
      q: "$y = \\frac{p - 3x}{(2x - q)(x + 3)}$ passes through $\\left(3, \\tfrac12\\right)$ and has vertical asymptotes $x = 2$ and $x = -3$. **(a)(i)** Explain why $q = 4$. **(ii)** Show $p = 15$. **(b)** $R$ is bounded by $C$, the $x$-axis and $x = 3$. Show that the area of $R$ is $a\\ln 2 + b\\ln 3$.",
      steps: [
        { h: "(a)", m: "(i) A vertical asymptote where the denominator vanishes: $2x - q = 0$ at $x = 2 \\Rightarrow q = 4$. (ii) $\\dfrac{p - 9}{(2)(6)} = \\dfrac12 \\Rightarrow p = 15$", mk: "B1 M1 A1*" },
        { h: "(b) Partial fractions", m: "$\\dfrac{15 - 3x}{(2x - 4)(x + 3)} = \\dfrac{A}{2x - 4} + \\dfrac{B}{x + 3}$: $x = 2$: $9 = 5A \\Rightarrow A = \\dfrac95$; $x = -3$: $24 = -10B \\Rightarrow B = -\\dfrac{12}{5}$", mk: "M1 A1 A1" },
        { h: "The curve crosses the axis at $x = 5$", m: "$\\displaystyle\\int_3^5\\left(\\dfrac{9/5}{2x - 4} - \\dfrac{12/5}{x + 3}\\right)dx = \\left[\\dfrac{9}{10}\\ln(2x - 4) - \\dfrac{12}{5}\\ln(x + 3)\\right]_3^5$", mk: "M1 A1", n: "$\\int\\frac{1}{2x - 4} = \\frac12\\ln(2x - 4)$." },
        { m: "$= \\dfrac{9}{10}(\\ln 6 - \\ln 2) - \\dfrac{12}{5}(\\ln 8 - \\ln 6) = \\dfrac{9}{10}\\ln 3 - \\dfrac{12}{5}\\ln\\dfrac43 = \\dfrac{9}{10}\\ln 3 - \\dfrac{24}{5}\\ln 2 + \\dfrac{12}{5}\\ln 3 = \\dfrac{33}{10}\\ln 3 - \\dfrac{24}{5}\\ln 2$", mk: "M1 A1 A1*", n: "$a = -\\frac{24}{5}$, $b = \\frac{33}{10}$. Every log reduced to $\\ln 2$ and $\\ln 3$." }
      ], result: "$-\\frac{24}{5}\\ln 2 + \\frac{33}{10}\\ln 3$" } },
    { worked: { tag: "exam", title: "Constants in $k$, then an integral equal to 21", src: "A-level June 2023 · P2 Q10 · 7 marks",
      q: "$f(x) = \\frac{3kx - 18}{(x + 4)(x - 2)}$, $k > 0$. **(a)** Express $f(x)$ in partial fractions in terms of $k$. **(b)** Find the exact $k$ for which $\\displaystyle\\int_{-3}^{1}f(x)\\,dx = 21$.",
      steps: [
        { h: "(a)", m: "$\\dfrac{2k + 3}{x + 4} + \\dfrac{k - 3}{x - 2}$", mk: "M1 A1 A1", n: "From $3kx - 18 = A(x - 2) + B(x + 4)$ at $x = -4$ and $x = 2$." },
        { h: "(b)", m: "$\\Big[(2k + 3)\\ln|x + 4| + (k - 3)\\ln|x - 2|\\Big]_{-3}^{1} = (2k + 3)(\\ln 5 - 0) + (k - 3)(0 - \\ln 5) = (k + 6)\\ln 5$", mk: "M1 A1", n: "$|1 - 2| = 1$ and $|-3 - 2| = 5$: the modulus signs do real work here." },
        { m: "$(k + 6)\\ln 5 = 21 \\Rightarrow k = \\dfrac{21}{\\ln 5} - 6$", mk: "M1 A1" }
      ], result: "$k = \\frac{21}{\\ln 5} - 6$" } },
    { worked: { tag: "exam", title: "Improper fraction: divide, integrate to $a + b\\ln 2$", src: "A-level Oct 2020 · P2 Q6 · 7 marks",
      q: "**(a)** $\\frac{x^2 + 8x - 3}{x + 2} \\equiv Ax + B + \\frac{C}{x + 2}$: find $A$, $B$, $C$. **(b)** Hence find the exact value of $\\displaystyle\\int_0^6\\frac{x^2 + 8x - 3}{x + 2}\\,dx$ in the form $a + b\\ln 2$.",
      steps: [
        { h: "(a)", m: "$A = 1$, $B = 6$, $C = -15$", mk: "M1 A1 A1" },
        { h: "(b)", m: "$\\displaystyle\\int_0^6\\left(x + 6 - \\dfrac{15}{x + 2}\\right)dx = \\left[\\dfrac{x^2}{2} + 6x - 15\\ln(x + 2)\\right]_0^6 = 54 - 15\\ln 8 + 15\\ln 2 = 54 - 30\\ln 2$", mk: "M1 A1 M1 A1" }
      ], result: "$54 - 30\\ln 2$" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Log of a squared factor**: $\\int\\frac{1}{(x + 1)^2}$ is $-\\frac{1}{x + 1}$, not $\\ln$.",
      "**Missing $\\frac1a$**: $\\int\\frac{1}{2x - 4} = \\frac12\\ln|2x - 4|$.",
      "**Modulus dropped** when a limit makes the argument negative.",
      "**Not dividing** an improper fraction first.",
      "**Log laws at the end**: combine to the form asked ($a\\ln 2 + b\\ln 3$, $\\ln\\frac{49}{36}$)."
    ] },
    { callout: { t: "mnemonic", h: "\"Linear below → log; squared below → power; top is the derivative → log of the bottom\"", body: "Decides the integral of every rational piece." } }
  ],
  flashcards: [
    ["$\\int\\frac{A}{ax + b}dx = $?", "$\\frac Aa\\ln|ax + b| + c$."],
    ["$\\int\\frac{B}{(ax + b)^2}dx = $?", "$-\\frac{B}{a(ax + b)} + c$."],
    ["$\\int\\frac{x}{x^2 + 5}dx = $?", "$\\frac12\\ln(x^2 + 5) + c$."],
    ["$\\int_0^6\\frac{x^2 + 8x - 3}{x + 2}dx = $?", "$54 - 30\\ln 2$."],
    ["$\\int_{-3}^{1}\\left(\\frac{2k+3}{x+4} + \\frac{k-3}{x-2}\\right)dx = $?", "$(k + 6)\\ln 5$."],
    ["$\\frac{15 - 3x}{(2x-4)(x+3)}$ decomposed?", "$\\frac{9/5}{2x - 4} - \\frac{12/5}{x + 3}$."],
    ["Why must you check the sign inside $\\ln|\\ldots|$ at the limits?", "The modulus can flip a negative argument: $\\ln|-3 - 2| = \\ln 5$."]
  ],
  quiz: [
    { q: "$\\int\\frac{3}{2x + 1}dx =$", opts: ["$\\tfrac32\\ln|2x+1| + c$", "$3\\ln|2x+1| + c$", "$\\tfrac{3}{2(2x+1)^2}$", "$6\\ln|2x+1|$"], ans: 0, why: "Divide by the inner coefficient." },
    { q: "$\\int\\frac{1}{(x - 3)^2}dx =$", opts: ["$-\\tfrac{1}{x - 3} + c$", "$\\ln|x-3|^2 + c$", "$\\tfrac{1}{x-3} + c$", "$2\\ln|x - 3|$"], ans: 0, why: "Power rule." },
    { q: "$\\int\\frac{2x + 1}{x^2 + x}dx =$", opts: ["$\\ln|x^2 + x| + c$", "$\\tfrac{1}{x^2+x}$", "$2\\ln|x| + c$", "$(2x+1)\\ln|x^2+x|$"], ans: 0, why: "Top is the derivative of the bottom." },
    { q: "$\\int_1^2\\frac{1}{x+1}dx =$", opts: ["$\\ln\\tfrac32$", "$\\ln 3$", "$\\ln 2$", "$\\tfrac12$"], ans: 0, why: "$\\ln 3 - \\ln 2$." },
    { q: "Before integrating $\\frac{x^2}{x - 1}$ you should", opts: ["divide", "factorise the top", "substitute $u = x^2$", "use parts"], ans: 0, why: "Improper fraction." }
  ]
};

/* =====================================================================
   8.7  Separable differential equations
   ===================================================================== */
C["maths:8.7"] = {
  notes: [
    { h: "Separable differential equations — the whole topic on one page" },
    { callout: { t: "memorise", h: "The method", body: [
      "1. Write $\\frac{dy}{dx} = f(x)\\,g(y)$ — **factorise** if needed to get an $x$-part times a $y$-part.",
      "2. **Separate**: $\\frac{1}{g(y)}\\,dy = f(x)\\,dx$. Every $y$ on the left with $dy$, every $x$ on the right with $dx$.",
      "3. **Integrate both sides**; one constant $c$ is enough.",
      "4. **Rearrange** to the form asked ($y = \\ldots$, or $V = P - Qe^{-kt}$). A $\\ln$ on the left becomes an exponential: $\\ln y = kx + c \\Rightarrow y = Ae^{kx}$ with $A = e^c$.",
      "5. **Particular solution**: substitute the given condition to find $c$ (or $A$)."
    ] } },
    { table: { head: ["Equation", "Separated", "General solution"], rows: [
      ["$\\frac{dy}{dx} = ky$", "$\\frac1y dy = k\\,dx$", "$y = Ae^{kx}$"],
      ["$\\frac{dr}{dt} = -\\frac{k}{r^2}$", "$r^2 dr = -k\\,dt$", "$\\frac{r^3}{3} = -kt + c$"],
      ["$\\frac{dh}{dt} = \\frac{\\lambda}{\\sqrt h}$", "$\\sqrt h\\,dh = \\lambda\\,dt$", "$\\frac23 h^{3/2} = \\lambda t + c$"],
      ["$\\frac{dH}{dt} = \\frac{H\\cos 0.25t}{40}$", "$\\frac1H dH = \\frac{\\cos 0.25t}{40}dt$", "$\\ln H = \\frac{\\sin 0.25t}{10} + c$"],
      ["$20\\frac{dV}{dt} = 9 - 6V$", "$\\frac{20}{9 - 6V}dV = dt$", "$-\\frac{10}{3}\\ln|9 - 6V| = t + c$"],
      ["$\\frac{dV}{dt} = \\frac{1}{10}V(25 - V)$", "$\\frac{dV}{V(25 - V)} = \\frac{dt}{10}$ (partial fractions)", "$\\ln\\frac{V}{25 - V} = 2.5t + c$"],
      ["$\\frac{dV}{dt} = \\frac{3V}{(2t - 1)(t + 1)}$", "$\\frac1V dV = \\frac{3\\,dt}{(2t - 1)(t + 1)}$", "$V = \\frac{A(2t - 1)}{t + 1}$"]
    ] } },
    { callout: { t: "tip", h: "Why separation is allowed", body: "$\\frac{dy}{dx}$ is not really a fraction, but the chain rule makes it behave like one: if $\\frac{1}{g(y)}\\frac{dy}{dx} = f(x)$ then integrating both sides with respect to $x$ gives $\\int\\frac{1}{g(y)}\\frac{dy}{dx}dx = \\int\\frac{1}{g(y)}dy$ on the left (substitution). Writing the $dy$ and $dx$ apart is shorthand for that." } },

    { page: "Worked" },
    { worked: { tag: "exam", title: "Roller coaster: $\\frac{dH}{dt} = \\frac{H\\cos 0.25t}{40}$", src: "A-level June 2018 · P1 Q10 · 8 marks",
      q: "$\\frac{dH}{dt} = \\frac{H\\cos(0.25t)}{40}$; $H = 5$ at $t = 0$. **(a)** Show that $H = 5e^{0.1\\sin(0.25t)}$. **(b)** State the maximum height. **(c)** The passenger reaches the maximum for the second time at $t = T$. Find $T$.",
      steps: [
        { h: "(a) Separate and integrate", m: "$\\displaystyle\\int\\dfrac1H\\,dH = \\int\\dfrac{\\cos 0.25t}{40}\\,dt \\Rightarrow \\ln H = \\dfrac{\\sin 0.25t}{10} + c$", mk: "M1 A1 A1", n: "$\\int\\cos 0.25t = 4\\sin 0.25t$; divided by 40 gives $\\frac{\\sin 0.25t}{10}$." },
        { m: "$t = 0$: $\\ln 5 = c$. So $H = e^{0.1\\sin 0.25t + \\ln 5} = 5e^{0.1\\sin 0.25t}$", mk: "M1 A1*" },
        { h: "(b)", m: "$\\sin = 1$: $H_{\\max} = 5e^{0.1} = 5.53$ m", mk: "B1" },
        { h: "(c) Second time $\\sin 0.25t = 1$", m: "$0.25t = \\dfrac{\\pi}{2} + 2\\pi \\Rightarrow T = 10\\pi = 31.4$ s", mk: "M1 A1" }
      ], result: "(b) $5e^{0.1}$ (c) $10\\pi$" } },
    { worked: { tag: "exam", title: "Tank with inflow and outflow: build and solve $20\\frac{dV}{dt} = 9 - 6V$", src: "A-level June 2025 · P2 Q10 · 9 marks",
      q: "Water flows into a container at $0.45$ m$^3$/h and leaves at $0.3V$ m$^3$/h. **(a)** Show that $20\\frac{dV}{dt} = 9 - 6V$. Initially $V = 0.25$. **(b)** Solve to show $V = P - Qe^{-kt}$. **(c)** The container's capacity is 2 m$^3$ and the tap stays open. Explain whether it overflows.",
      steps: [
        { h: "(a) In minus out", m: "$\\dfrac{dV}{dt} = 0.45 - 0.3V \\Rightarrow 20\\dfrac{dV}{dt} = 9 - 6V$", mk: "M1 A1*" },
        { h: "(b) Separate", m: "$\\displaystyle\\int\\dfrac{20}{9 - 6V}\\,dV = \\int dt \\Rightarrow -\\dfrac{20}{6}\\ln|9 - 6V| = t + c$", mk: "M1 A1", n: "$\\int\\frac{1}{9 - 6V} = -\\frac16\\ln|9 - 6V|$ — the minus from the $-6$." },
        { m: "$9 - 6V = Ae^{-0.3t}$; $t = 0, V = 0.25$: $A = 7.5$. So $V = 1.5 - 1.25e^{-0.3t}$: $P = 1.5$, $Q = 1.25$, $k = 0.3$", mk: "M1 A1 A1", n: "Exponentiate, absorb $\\pm e^{-c}$ into $A$, then use the condition." },
        { h: "(c)", m: "As $t \\to \\infty$, $V \\to 1.5 < 2$: the container does not overflow.", mk: "B1" }
      ], result: "(b) $V = 1.5 - 1.25e^{-0.3t}$ (c) limit 1.5 m³, no overflow" } },
    { worked: { tag: "exam", title: "Logistic growth via partial fractions: $\\frac{dV}{dt} = \\frac{1}{10}V(25 - V)$", src: "A-level June 2024 · P2 Q12 · 12 marks",
      q: "**(a)** Express $\\frac{1}{V(25 - V)}$ in partial fractions. The volume $V$ of a plant cell satisfies $\\frac{dV}{dt} = \\frac{1}{10}V(25 - V)$ with $V = 20$ initially. **(b)** Find the time, in minutes, for $V$ to reach 24. **(c)** Show that $V = \\frac{A}{e^{-kt} + B}$. **(d)** Find the upper limit $L$ of $V$, with a reason.",
      steps: [
        { h: "(a)", m: "$\\dfrac{1}{V(25 - V)} = \\dfrac{1}{25}\\left(\\dfrac1V + \\dfrac{1}{25 - V}\\right)$", mk: "M1 A1" },
        { h: "(b) Separate, integrate with (a)", m: "$\\displaystyle\\dfrac{1}{25}\\int\\left(\\dfrac1V + \\dfrac{1}{25 - V}\\right)dV = \\int\\dfrac{dt}{10} \\Rightarrow \\dfrac{1}{25}\\left(\\ln V - \\ln(25 - V)\\right) = \\dfrac{t}{10} + c$", mk: "M1 A1 A1", n: "$\\int\\frac{1}{25 - V} = -\\ln(25 - V)$." },
        { m: "$\\ln\\dfrac{V}{25 - V} = 2.5t + c'$; $t = 0, V = 20$: $c' = \\ln 4$. $V = 24$: $\\ln 24 = 2.5t + \\ln 4 \\Rightarrow t = \\dfrac{\\ln 6}{2.5} = 0.717$ h $= 43$ min", mk: "M1 A1", n: "$t$ in hours from the model; convert to minutes." },
        { h: "(c)", m: "$\\dfrac{V}{25 - V} = 4e^{2.5t} \\Rightarrow V = 100e^{2.5t} - 4e^{2.5t}V \\Rightarrow V(1 + 4e^{2.5t}) = 100e^{2.5t} \\Rightarrow V = \\dfrac{100}{e^{-2.5t} + 4}$", mk: "M1 A1 A1", n: "Divide top and bottom by $e^{2.5t}$ to reach the printed form: $A = 100$, $B = 4$, $k = 2.5$." },
        { h: "(d)", m: "As $t \\to \\infty$, $e^{-2.5t} \\to 0$, so $V \\to \\dfrac{100}{4} = 25$: $L = 25$", mk: "M1 A1" }
      ], result: "(b) 43 min (c) $V = \\frac{100}{e^{-2.5t} + 4}$ (d) $L = 25$" } },
    { worked: { tag: "exam", title: "$\\frac{dV}{dt} = \\frac{3V}{(2t - 1)(t + 1)}$ — partial fractions in $t$", src: "A-level June 2022 · P2 Q14 · 10 marks",
      q: "**(a)** Express $\\frac{3}{(2t - 1)(t + 1)}$ in partial fractions. Oxygen volume $V$ satisfies $\\frac{dV}{dt} = \\frac{3V}{(2t - 1)(t + 1)}$, $t \\ge k$; $V = 3$ when $t = 2$. **(b)** Show that $V = \\frac{3(2t - 1)}{t + 1}$. **(c)** Deduce the time delay before oxygen is produced and the limit to the volume.",
      steps: [
        { h: "(a)", m: "$\\dfrac{2}{2t - 1} - \\dfrac{1}{t + 1}$", mk: "M1 A1 A1" },
        { h: "(b)", m: "$\\displaystyle\\int\\dfrac1V dV = \\int\\left(\\dfrac{2}{2t - 1} - \\dfrac{1}{t + 1}\\right)dt \\Rightarrow \\ln V = \\ln(2t - 1) - \\ln(t + 1) + c \\Rightarrow V = \\dfrac{A(2t - 1)}{t + 1}$", mk: "M1 A1 A1", n: "Combine the logs before exponentiating; $A = e^c$." },
        { m: "$t = 2, V = 3$: $3 = \\dfrac{3A}{3} \\Rightarrow A = 3$", mk: "M1 A1*" },
        { h: "(c)", m: "$V = 0$ when $2t - 1 = 0$: production starts at $t = \\dfrac12$ h (a 30-minute delay). As $t \\to \\infty$, $V \\to \\dfrac{3 \\cdot 2t}{t} = 6$ m$^3$.", mk: "B1 B1" }
      ], result: "(b) shown (c) delay $\\frac12$ h; limit 6 m³" } },
    { worked: { tag: "exam", title: "Leaking tank: $\\frac{dH}{dt} = -0.12e^{-0.2t}$ — a direct integration", src: "A-level June 2024 · P1 Q7 · 8 marks",
      q: "A cylindrical tank of height 1.5 m is initially full; the depth $H$ satisfies $\\frac{dH}{dt} = -0.12e^{-0.2t}$. **(a)** Show that $H = Ae^{-0.2t} + B$. **(b)** Find the depth after 3 hours. **(c)** Explain why the model predicts the tank never empties, and interpret the limiting depth.",
      steps: [
        { h: "(a) No separation needed — integrate directly", m: "$H = \\dfrac{-0.12}{-0.2}e^{-0.2t} + B = 0.6e^{-0.2t} + B$; $t = 0, H = 1.5$: $B = 0.9$", mk: "M1 A1 M1 A1*" },
        { h: "(b)", m: "$H(3) = 0.6e^{-0.6} + 0.9 = 1.23$ m", mk: "M1 A1" },
        { h: "(c)", m: "$H \\to 0.9$ as $t \\to \\infty$ and never reaches 0: the leak is at $L$, $0.9$ m up the side, so water below that level cannot escape.", mk: "B1 B1" }
      ], result: "(a) $A = 0.6$, $B = 0.9$ (b) 1.23 m" } },
    { worked: { tag: "exam", title: "Tree growth with a substitution-based integral", src: "A-level June 2019 · P2 Q14 · 15 marks",
      q: "**(a)** Use $u = 4 - \\sqrt h$ to show $\\displaystyle\\int\\frac{dh}{4 - \\sqrt h} = -8\\ln|4 - \\sqrt h| - 2\\sqrt h + k$. A tree's height satisfies $\\frac{dh}{dt} = \\frac{t^{0.25}(4 - \\sqrt h)}{20}$. **(b)** Find the range of heights the model allows. **(c)** A tree is 1 m tall when planted. Find the time for it to reach 12 m, to 3 s.f.",
      steps: [
        { h: "(a) $h = (4 - u)^2$, $dh = -2(4 - u)\\,du$", m: "$\\displaystyle\\int\\dfrac{-2(4 - u)}{u}\\,du = \\int\\left(-\\dfrac8u + 2\\right)du = -8\\ln|u| + 2u + c = -8\\ln|4 - \\sqrt h| + 8 - 2\\sqrt h + c$", mk: "M1 A1 M1 A1 A1 A1*", n: "The $+8$ is absorbed into $k$." },
        { h: "(b) $\\frac{dh}{dt} > 0$ needs $4 - \\sqrt h > 0$", m: "$0 \\le h < 16$: the tree grows towards 16 m but never reaches it", mk: "M1 A1" },
        { h: "(c) Separate", m: "$\\displaystyle\\int\\dfrac{dh}{4 - \\sqrt h} = \\int\\dfrac{t^{0.25}}{20}dt \\Rightarrow -8\\ln(4 - \\sqrt h) - 2\\sqrt h = \\dfrac{t^{1.25}}{25} + c$", mk: "M1 A1" },
        { m: "$t = 0, h = 1$: $c = -8\\ln 3 - 2$. $h = 12$: $-8\\ln(4 - \\sqrt{12}) - 2\\sqrt{12} = \\dfrac{t^{1.25}}{25} - 8\\ln 3 - 2$\n$t^{1.25} = 25\\left[8\\ln 3 + 2 - 8\\ln(4 - 2\\sqrt3) - 4\\sqrt3\\right] = 221.3 \\Rightarrow t = 221.3^{0.8} = 75.2$ years", mk: "M1 M1 A1 A1 A1", n: "$\\int t^{0.25} = \\frac{t^{1.25}}{1.25}$, divided by 20 gives $\\frac{t^{1.25}}{25}$." }
      ], result: "(b) $0 \\le h < 16$ (c) 75.2 years" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Not separating fully** — an $x$ left on the $y$ side.",
      "**Integrating $\\frac{1}{a - by}$**: gives $-\\frac1b\\ln|a - by|$ — the sign.",
      "**Two constants** (one each side): only one is needed.",
      "**$e^{kx + c} = e^{kx} + e^c$** — no: it is $e^c e^{kx} = Ae^{kx}$.",
      "**Condition applied before rearranging correctly**, or to the wrong variable.",
      "**Limit / validity**: read off what the solution does as $t \\to \\infty$ and where it stops making sense."
    ] },
    { callout: { t: "mnemonic", h: "\"$y$'s left, $x$'s right, integrate, one $c$, condition\"", body: "The five beats of every separable equation." } }
  ],
  flashcards: [
    ["General solution of $\\frac{dy}{dx} = ky$?", "$y = Ae^{kx}$."],
    ["Separate $\\frac{dr}{dt} = -\\frac{k}{r^2}$.", "$r^2\\,dr = -k\\,dt \\Rightarrow \\frac{r^3}{3} = -kt + c$."],
    ["$\\int\\frac{20}{9 - 6V}dV = $?", "$-\\frac{10}{3}\\ln|9 - 6V| + c$."],
    ["$\\ln V = \\ln(2t-1) - \\ln(t+1) + c$ rearranged?", "$V = \\frac{A(2t-1)}{t+1}$."],
    ["$\\frac{dV}{dt} = \\frac{1}{10}V(25 - V)$: first step?", "Partial fractions on $\\frac{1}{V(25-V)}$, then separate."],
    ["$\\frac{dH}{dt} = \\frac{H\\cos 0.25t}{40}$, $H(0) = 5$: solution?", "$H = 5e^{0.1\\sin 0.25t}$."],
    ["Limit of $V = \\frac{100}{e^{-2.5t} + 4}$?", "25."],
    ["Why can $\\frac{dy}{dx}$ be 'split' in separation?", "It is the chain rule: $\\int\\frac{1}{g(y)}\\frac{dy}{dx}dx = \\int\\frac{1}{g(y)}dy$."]
  ],
  quiz: [
    { q: "$\\frac{dy}{dx} = xy$ separates to", opts: ["$\\tfrac1y dy = x\\,dx$", "$y\\,dy = x\\,dx$", "$dy = xy\\,dx$", "$\\tfrac1x dx = y\\,dy$"], ans: 0, why: "$y$'s left, $x$'s right." },
    { q: "$\\ln y = 2x + c$ gives", opts: ["$y = Ae^{2x}$", "$y = e^{2x} + A$", "$y = 2x + A$", "$y = Ae^{2}$"], ans: 0, why: "$A = e^c$." },
    { q: "$\\frac{dy}{dx} = \\frac{y}{x}$, $y = 3$ at $x = 1$:", opts: ["$y = 3x$", "$y = 3e^x$", "$y = x + 2$", "$y = 3x^2$"], ans: 0, why: "$\\ln y = \\ln x + c$." },
    { q: "$\\int\\frac{1}{5 - 2y}dy =$", opts: ["$-\\tfrac12\\ln|5 - 2y| + c$", "$\\tfrac12\\ln|5-2y| + c$", "$\\ln|5-2y| + c$", "$-2\\ln|5-2y|$"], ans: 0, why: "Inner derivative $-2$." },
    { q: "$\\frac{dV}{dt} = 0.45 - 0.3V$ has limiting value", opts: ["1.5", "0.45", "0.3", "$\\infty$"], ans: 0, why: "$\\frac{dV}{dt} = 0$ when $V = 1.5$." }
  ]
};

/* =====================================================================
   8.8  Interpreting the solution of a differential equation
   ===================================================================== */
C["maths:8.8"] = {
  notes: [
    { h: "Interpreting DE solutions — the whole topic on one page" },
    "Once the equation is solved, the exam asks what it *means*: the starting value, the long-term behaviour, when a target is reached, where the model stops being valid, and — in kinematics — velocity, displacement and acceleration.",
    { table: { head: ["Ask", "Do"], rows: [
      ["initial value", "$t = 0$"],
      ["limit / long-term", "$t \\to \\infty$; exponentials with negative exponent → 0; state the limiting value and \"never reached\""],
      ["time to reach a value", "solve for $t$ (logs)"],
      ["limitation on $t$ / validity", "where the solution stops being physical: $r = 0$, $h = 16$ never reached, a root becomes negative, $V$ exceeds capacity"],
      ["maximum rate of growth", "a logistic $\\frac{dN}{dt} = kN(P - N)$ is largest when $N = \\frac P2$ — differentiate the rate or complete the square"],
      ["kinematics", "$v = \\frac{dx}{dt}$, $a = \\frac{dv}{dt}$; solve $\\frac{dv}{dt} = f(v)$ or $f(t)$ by separation"]
    ] } },

    { page: "Worked" },
    { worked: { tag: "exam", title: "Mice population: show the DE, the time of fastest growth, the maximum", src: "A-level June 2018 · P2 Q14 · 10 marks",
      q: "$N = \\frac{900}{3 + 7e^{-0.25t}}$ mice after $t$ months. **(a)** Find the number at the start. **(b)** Show that $\\frac{dN}{dt} = \\frac{N(300 - N)}{1200}$. **(c)** The rate of growth is a maximum after $T$ months. Find $T$. **(d)** State the maximum number $P$ of mice.",
      steps: [
        { h: "(a)", m: "$N(0) = \\dfrac{900}{10} = 90$", mk: "B1" },
        { h: "(b) Differentiate, then rewrite in terms of $N$", m: "$\\dfrac{dN}{dt} = \\dfrac{900 \\cdot 7 \\cdot 0.25e^{-0.25t}}{(3 + 7e^{-0.25t})^2} = \\dfrac{1575e^{-0.25t}}{(3 + 7e^{-0.25t})^2}$\nAlso $300 - N = \\dfrac{300(3 + 7e^{-0.25t}) - 900}{3 + 7e^{-0.25t}} = \\dfrac{2100e^{-0.25t}}{3 + 7e^{-0.25t}}$, so $\\dfrac{N(300 - N)}{1200} = \\dfrac{900 \\cdot 2100e^{-0.25t}}{1200(3 + 7e^{-0.25t})^2} = \\dfrac{1575e^{-0.25t}}{(3 + 7e^{-0.25t})^2}$ ✓", mk: "M1 A1 M1 A1*", n: "Chain rule on $(\\ldots)^{-1}$, then express $300 - N$ over the same denominator." },
        { h: "(c) The rate $\\frac{N(300 - N)}{1200}$ is a quadratic in $N$, maximised at $N = 150$", m: "$\\dfrac{900}{3 + 7e^{-0.25T}} = 150 \\Rightarrow 3 + 7e^{-0.25T} = 6 \\Rightarrow e^{-0.25T} = \\dfrac37 \\Rightarrow T = 4\\ln\\dfrac73 = 3.39$ months", mk: "M1 A1 M1 A1", n: "Vertex of $N(300 - N)$ is halfway between the roots 0 and 300." },
        { h: "(d)", m: "As $t \\to \\infty$, $N \\to \\dfrac{900}{3} = 300$: $P = 300$", mk: "B1" }
      ], result: "(a) 90 (c) $T = 4\\ln\\frac73 \\approx 3.39$ (d) 300" } },
    { worked: { tag: "exam", title: "Dissolving mint: solve, time to dissolve, limitation", src: "A-level June 2018 · P2 Q10 · 8 marks",
      q: "A spherical mint of radius 5 mm is sucked; after 4 minutes the radius is 3 mm. The rate of decrease of the radius is inversely proportional to the square of the radius. **(a)** Find an equation linking the radius $r$ mm and the time $t$ min. **(b)** Hence find the total time for the mint to dissolve, to the nearest second. **(c)** Suggest a limitation.",
      steps: [
        { h: "(a) DE, separate, two conditions", m: "$\\dfrac{dr}{dt} = -\\dfrac{k}{r^2} \\Rightarrow r^2 dr = -k\\,dt \\Rightarrow \\dfrac{r^3}{3} = -kt + c$\n$t = 0, r = 5$: $c = \\dfrac{125}{3}$; $t = 4, r = 3$: $9 = -4k + \\dfrac{125}{3} \\Rightarrow k = \\dfrac{49}{6}$\n$r^3 = 125 - \\dfrac{49}{2}t$", mk: "B1 M1 A1 M1 A1", n: "Define the variables ($r$ in mm, $t$ in minutes) — the question asks you to." },
        { h: "(b) $r = 0$", m: "$t = \\dfrac{250}{49} = 5.10$ min $= 5$ min 6 s", mk: "M1 A1" },
        { h: "(c)", m: "The mint may not stay spherical; the sucking rate may vary; it may be crunched.", mk: "B1" }
      ], result: "(a) $r^3 = 125 - \\frac{49}{2}t$ (b) 5 min 6 s" } },
    { worked: { tag: "exam", title: "Cuboid tank filling and draining: build $1200\\frac{dh}{dt} = 24 - 5h$ and interpret", src: "A-level Oct 2021 · P2 Q14 · 12 marks",
      q: "A tank has an 8 m by 3 m base and height 5 m. Water flows in at $0.48$ m$^3$/min and out through a tap at $0.1h$ m$^3$/min, where $h$ is the depth. **(a)** Show that $1200\\frac{dh}{dt} = 24 - 5h$. **(b)** Given the tank is empty at $t = 0$, solve to find $h$ in terms of $t$. **(c)** Find the depth after 2 hours. **(d)** Explain why the tank never overflows.",
      steps: [
        { h: "(a) $V = 24h$", m: "$24\\dfrac{dh}{dt} = 0.48 - 0.1h \\Rightarrow 1200\\dfrac{dh}{dt} = 24 - 5h$ (×50)", mk: "M1 A1 A1*" },
        { h: "(b)", m: "$\\displaystyle\\int\\dfrac{1200}{24 - 5h}dh = \\int dt \\Rightarrow -240\\ln|24 - 5h| = t + c$; $h(0) = 0$: $c = -240\\ln 24$\n$\\ln\\dfrac{24 - 5h}{24} = -\\dfrac{t}{240} \\Rightarrow h = 4.8\\left(1 - e^{-t/240}\\right)$", mk: "M1 A1 M1 A1 A1" },
        { h: "(c) $t = 120$", m: "$h = 4.8(1 - e^{-0.5}) = 1.89$ m", mk: "M1 A1" },
        { h: "(d)", m: "$h \\to 4.8 < 5$ as $t \\to \\infty$ — the equilibrium depth (inflow = outflow when $0.1h = 0.48$) is below the top.", mk: "B1 B1" }
      ], result: "(b) $h = 4.8(1 - e^{-t/240})$ (c) 1.89 m (d) limit 4.8 < 5" } },
    { worked: { tag: "example", title: "Kinematics: $\\frac{dv}{dt} = -0.2v$ with $v = 10$ at $t = 0$", src: "standard link to Paper 3",
      steps: [
        { m: "$\\displaystyle\\int\\dfrac1v dv = \\int -0.2\\,dt \\Rightarrow \\ln v = -0.2t + c \\Rightarrow v = 10e^{-0.2t}$", mk: "M1 A1" },
        { m: "Displacement: $x = \\displaystyle\\int_0^t 10e^{-0.2s}ds = 50(1 - e^{-0.2t})$; the particle never travels further than 50 m.", n: "Velocity decays to zero; the total distance converges." }
      ], result: "$v = 10e^{-0.2t}$; $x \\to 50$" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Limit statements** need the direction: \"approaches 25 from below but never reaches it\".",
      "**Units**: hours vs minutes; mm vs cm; convert at the end.",
      "**Validity**: state the interval of $t$ (or $h$) for which the solution is physical, with the reason.",
      "**Maximum rate** of a logistic model is at half the limit — from the vertex of $N(P - N)$.",
      "**Limitation** in context; **refinement** that fixes it."
    ] },
    { callout: { t: "mnemonic", h: "\"Start, end, when, where it breaks\"", body: "Initial value, limit, time to a target, limits of validity — the four interpretation questions." } }
  ],
  flashcards: [
    ["Long-term value of $\\frac{900}{3 + 7e^{-0.25t}}$?", "300."],
    ["When is the growth rate $\\frac{N(300 - N)}{1200}$ greatest?", "At $N = 150$ — half the limit."],
    ["$r^3 = 125 - \\frac{49}{2}t$: when does the mint dissolve?", "$r = 0$: $t = \\frac{250}{49} \\approx 5.10$ min."],
    ["Tank: $1200\\frac{dh}{dt} = 24 - 5h$, empty at $t = 0$: $h(t)$?", "$4.8(1 - e^{-t/240})$; limit 4.8."],
    ["Why does the tank not overflow?", "The limiting depth (inflow = outflow) is below the top."],
    ["$\\frac{dv}{dt} = -0.2v$, $v(0) = 10$: $v$ and total distance?", "$v = 10e^{-0.2t}$; distance $\\to 50$."]
  ],
  quiz: [
    { q: "$N = \\frac{900}{3 + 7e^{-0.25t}}$ at $t = 0$:", opts: ["90", "300", "900", "10"], ans: 0, why: "$\\frac{900}{10}$." },
    { q: "A logistic model's growth rate is maximal when $N$ equals", opts: ["half the limit", "the limit", "zero", "the initial value"], ans: 0, why: "Vertex of $N(P - N)$." },
    { q: "$h = 4.8(1 - e^{-t/240})$ as $t \\to \\infty$:", opts: ["4.8", "0", "$\\infty$", "240"], ans: 0, why: "Exponential term vanishes." },
    { q: "$r^3 = 125 - 24.5t$ is valid for", opts: ["$0 \\le t \\le \\tfrac{250}{49}$", "all $t$", "$t \\ge 5$", "$t < 0$"], ans: 0, why: "Until $r = 0$." }
  ]
};


/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
