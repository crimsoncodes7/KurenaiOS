/* Kurenai OS — deep content: Pure Mathematics, section P7 (Differentiation)
   at full A-level depth. Same contract as maths-pure-p4.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* =====================================================================
   7.1  The derivative as a gradient; first principles; second derivatives
   ===================================================================== */
C["maths:7.1"] = {
  notes: [
    { h: "The derivative — the whole topic on one page" },
    "$\\frac{dy}{dx}$ (or $f'(x)$) is the **gradient of the tangent** to $y = f(x)$ at the point $(x, y)$: the instantaneous rate of change of $y$ with respect to $x$. It is defined as a **limit** of chord gradients, and every differentiation rule in the course is a consequence of that definition.",
    { callout: { t: "def", h: "Differentiation from first principles", body: [
      "$$f'(x) = \\lim_{h \\to 0}\\dfrac{f(x + h) - f(x)}{h}$$",
      "The fraction is the gradient of the chord from $(x, f(x))$ to $(x + h, f(x + h))$. As $h \\to 0$ the second point slides towards the first and the chord becomes the tangent.",
      "On the spec for $x^2$, $x^3$ (and similar small powers), $\\sin x$ and $\\cos x$. Set on **every** A-level paper since 2018 — 3 to 5 marks, and the marks are for the *structure*."
    ] } },
    { fig: { x: [-0.5, 3.5], y: [-1, 10], axes: { xt: [1, 2, 3], yt: [2, 4, 6, 8] }, items: [
      { fn: "x*x", label: "y = x²", at: 3.1, pos: "w" },
      { line: [[1, 1], [2.5, 6.25]], c: "accent2", label: "chord, gradient (f(x+h) − f(x))/h", loff: -16, size: 11 },
      { fn: "2*x-1", from: 0, to: 3.5, c: "accent3", dash: true, label: "tangent, gradient 2", at: 3.3, pos: "s" },
      { pt: [1, 1], label: "(x, f(x))", pos: "se" }, { pt: [2.5, 6.25], c: "accent2", label: "(x + h, f(x + h))", pos: "nw" }
    ], cap: "As $h \\to 0$ the chord through $(x, f(x))$ and $(x + h, f(x + h))$ turns into the tangent. Its gradient tends to $f'(x)$." } },

    { page: "First principles: the proofs" },
    { callout: { t: "memorise", h: "The four-line structure that scores", body: [
      "1. **Write the definition** with the function substituted: $f'(x) = \\lim_{h \\to 0}\\frac{(x + h)^2 - x^2}{h}$.",
      "2. **Expand** the numerator and cancel the $f(x)$ part: $\\frac{2xh + h^2}{h}$.",
      "3. **Divide by $h$** (every remaining term has a factor $h$): $2x + h$.",
      "4. **Take the limit** and *say so*: \"as $h \\to 0$, $2x + h \\to 2x$, so $f'(x) = 2x$\".",
      "Marks are lost for: no $\\lim$ / no \"as $h \\to 0$\"; writing $= 0$ instead of $\\to$; jumping from step 1 to the answer; quoting $\\frac{d}{dx}x^2 = 2x$ (which assumes what is being proved)."
    ] } },
    { worked: { tag: "exam", title: "Prove $\\frac{d}{dx}(x^2) = 2x$ from first principles", src: "A-level June 2024 · P1 Q4 · 3 marks",
      q: "Given $y = x^2$, use differentiation from first principles to show that $\\frac{dy}{dx} = 2x$.",
      steps: [
        { m: "$\\dfrac{dy}{dx} = \\lim_{h \\to 0}\\dfrac{(x + h)^2 - x^2}{h}$", mk: "B1", n: "The definition with $f$ substituted — the limit sign present." },
        { m: "$= \\lim_{h \\to 0}\\dfrac{x^2 + 2xh + h^2 - x^2}{h} = \\lim_{h \\to 0}\\dfrac{2xh + h^2}{h} = \\lim_{h \\to 0}(2x + h)$", mk: "M1" },
        { m: "As $h \\to 0$, $2x + h \\to 2x$. So $\\dfrac{dy}{dx} = 2x$.", mk: "A1*", n: "The final A needs the limit statement in words or symbols." }
      ], result: "shown" } },
    { worked: { tag: "exam", title: "Prove $\\frac{d}{dx}(x^3) = 3x^2$; and $y = 2x^2$", src: "AS June 2018 · P1 Q10 · 4 marks; A-level June 2022 · P2 Q4 · 3 marks",
      q: "**(i)** Prove from first principles that the derivative of $x^3$ is $3x^2$. **(ii)** Given $y = 2x^2$, show from first principles that $\\frac{dy}{dx} = 4x$.",
      steps: [
        { h: "(i)", m: "$\\lim_{h \\to 0}\\dfrac{(x + h)^3 - x^3}{h} = \\lim_{h \\to 0}\\dfrac{3x^2h + 3xh^2 + h^3}{h} = \\lim_{h \\to 0}(3x^2 + 3xh + h^2) = 3x^2$", mk: "B1 M1 A1 A1*", n: "$(x + h)^3 = x^3 + 3x^2h + 3xh^2 + h^3$ — binomial expansion (4.1)." },
        { h: "(ii)", m: "$\\lim_{h \\to 0}\\dfrac{2(x + h)^2 - 2x^2}{h} = \\lim_{h \\to 0}\\dfrac{4xh + 2h^2}{h} = \\lim_{h \\to 0}(4x + 2h) = 4x$", mk: "B1 M1 A1*", n: "The constant multiplies every term; it does not change the method." }
      ], result: "shown" } },
    { worked: { tag: "exam", title: "Gradient at a point from first principles: $y = 2x^3 + 5$ at $P(1, 7)$", src: "A-level Specimen · P1 Q9 · 5 marks",
      q: "The curve $y = 2x^3 + 5$ passes through $P(1, 7)$. Use differentiation from first principles to find the gradient of the tangent at $P$.",
      steps: [
        { m: "Gradient of the chord from $P$ to $(1 + h, 2(1 + h)^3 + 5)$: $\\dfrac{2(1 + h)^3 + 5 - 7}{h} = \\dfrac{2(1 + 3h + 3h^2 + h^3) - 2}{h}$", mk: "M1 A1", n: "Either work at the general $x$ and then substitute 1, or — as here — at $x = 1$ directly." },
        { m: "$= \\dfrac{6h + 6h^2 + 2h^3}{h} = 6 + 6h + 2h^2$", mk: "M1 A1" },
        { m: "As $h \\to 0$ the gradient $\\to 6$. The tangent at $P$ has gradient 6.", mk: "A1" }
      ], result: "6" } },
    { worked: { tag: "exam", title: "Prove $\\frac{d}{dx}(\\sin x) = \\cos x$ — the addition formula and two given limits", src: "A-level June 2023 · P1 Q12 · 5 marks",
      q: "$y = \\sin x$, $x$ in radians. Use differentiation from first principles to show that $\\frac{dy}{dx} = \\cos x$. You may use $\\sin(A + B) = \\sin A\\cos B + \\cos A\\sin B$ and assume that as $h \\to 0$, $\\frac{\\sin h}{h} \\to 1$ and $\\frac{\\cos h - 1}{h} \\to 0$.",
      steps: [
        { m: "$\\dfrac{dy}{dx} = \\lim_{h \\to 0}\\dfrac{\\sin(x + h) - \\sin x}{h} = \\lim_{h \\to 0}\\dfrac{\\sin x\\cos h + \\cos x\\sin h - \\sin x}{h}$", mk: "B1 M1", n: "Expand $\\sin(x + h)$; keep $x$ fixed and $h$ the variable." },
        { h: "Group the $\\sin x$ terms and the $\\cos x$ term", m: "$= \\lim_{h \\to 0}\\left[\\sin x \\cdot \\dfrac{\\cos h - 1}{h} + \\cos x \\cdot \\dfrac{\\sin h}{h}\\right]$", mk: "M1 A1", n: "This factorisation is the whole idea: it isolates exactly the two limits you are allowed to assume." },
        { m: "As $h \\to 0$: $\\dfrac{\\cos h - 1}{h} \\to 0$ and $\\dfrac{\\sin h}{h} \\to 1$, so $\\dfrac{dy}{dx} = \\sin x \\cdot 0 + \\cos x \\cdot 1 = \\cos x$", mk: "A1*", n: "State both limits and what they multiply. For $\\cos x$ (2018 P2 Q9) the same steps give $-\\sin x$: $\\cos(x + h) - \\cos x = \\cos x(\\cos h - 1) - \\sin x\\sin h$." }
      ], result: "shown" } },
    { worked: { tag: "exam", title: "Chord gradient in terms of $h$ and its relationship to the tangent", src: "AS Nov 2021 · P1 Q5 · 6 marks",
      q: "$y = x^2 - 4x + 5$; $P(3, 2)$ and $Q(3 + h, \\ldots)$ lie on the curve. **(a)** Find the gradient of the tangent at $P$. **(b)** Show that the gradient of the chord $PQ$ is $2 + h$. **(c)** Explain the relationship between the answers to (a) and (b).",
      steps: [
        { h: "(a)", m: "$\\dfrac{dy}{dx} = 2x - 4 = 2$ at $x = 3$", mk: "M1 A1" },
        { h: "(b)", m: "$y_Q = (3 + h)^2 - 4(3 + h) + 5 = 2 + 2h + h^2$; gradient $= \\dfrac{(2 + 2h + h^2) - 2}{h} = 2 + h$", mk: "M1 A1*" },
        { h: "(c)", m: "As $h \\to 0$, $Q \\to P$ and the chord gradient $2 + h \\to 2$, the tangent gradient — the derivative is the limit of the chord gradients.", mk: "B1 B1" }
      ], result: "(a) 2 (b) $2 + h$ (c) chord → tangent as $h \\to 0$" } },

    { page: "Second derivatives, gradient graphs" },
    { callout: { t: "memorise", h: "$\\frac{d^2y}{dx^2}$: the rate of change of the gradient", body: [
      "$f''(x) > 0$: gradient increasing — the curve is **convex** (bends upwards, like $x^2$).",
      "$f''(x) < 0$: gradient decreasing — **concave** (bends downwards).",
      "At a stationary point ($f' = 0$): $f'' > 0$ ⇒ minimum; $f'' < 0$ ⇒ maximum; $f'' = 0$ ⇒ **no conclusion** — test the sign of $f'$ either side (7.3).",
      "A **point of inflection** is where $f''$ **changes sign** (convex ↔ concave). $f'' = 0$ alone is not enough: $y = x^4$ has $f''(0) = 0$ but no inflection.",
      "In kinematics $\\frac{dx}{dt}$ is velocity and $\\frac{d^2x}{dt^2}$ is acceleration."
    ] } },
    { fig: { x: [-2.5, 2.5], y: [-3, 3], axes: { xt: [-1, 1], yt: [-2, 2] }, items: [
      { fn: "x^3-3*x", label: "y = x³ − 3x", at: -2.3, pos: "e" },
      { shade: { fn: "3", fn2: "-3", from: -2.5, to: 0 }, c: "danger", alpha: 0.06 }, { shade: { fn: "3", fn2: "-3", from: 0, to: 2.5 }, c: "accent3", alpha: 0.06 },
      { pt: [0, 0], label: "inflection: f″ changes sign", pos: "e" }, { pt: [-1, 2], label: "max", pos: "n" }, { pt: [1, -2], label: "min", pos: "s" },
      { text: [-1.6, -2.5], t: "concave (f″ < 0)", c: "danger", size: 11 }, { text: [1.6, 2.5], t: "convex (f″ > 0)", c: "accent3", size: 11 }
    ], cap: "$f'' = 6x$: negative on the left (concave), positive on the right (convex), zero and changing sign at the origin — a point of inflection with a non-zero gradient." } },
    { worked: { tag: "exam", title: "Solve $f''(x) = 0$; where is $f$ concave?", src: "A-level June 2023 · P2 Q1 · 4 marks",
      q: "$f(x) = x^3 + 2x^2 - 8x + 5$. **(a)** Find $f''(x)$. **(b)(i)** Solve $f''(x) = 0$. **(ii)** Hence find the range of $x$ for which $f$ is concave.",
      steps: [
        { h: "(a)", m: "$f'(x) = 3x^2 + 4x - 8$, $\; f''(x) = 6x + 4$", mk: "M1 A1" },
        { h: "(b)", m: "(i) $x = -\\dfrac23$. (ii) Concave where $f'' < 0$: $6x + 4 < 0 \\Rightarrow x < -\\dfrac23$", mk: "A1 A1" }
      ], result: "(a) $6x + 4$ (b) $x = -\\frac23$; concave for $x < -\\frac23$" } },
    { worked: { tag: "exam", title: "A stationary point that is a point of inflection", src: "A-level Oct 2021 · P2 Q5 · 7 marks",
      q: "$y = 5x^4 - 24x^3 + 42x^2 - 32x + 11$. **(a)** Find $\\frac{dy}{dx}$ and $\\frac{d^2y}{dx^2}$. **(b)(i)** Verify that $C$ has a stationary point at $x = 1$. **(ii)** Show that this stationary point is a point of inflection, giving reasons.",
      steps: [
        { h: "(a)", m: "$\\dfrac{dy}{dx} = 20x^3 - 72x^2 + 84x - 32; \\qquad \\dfrac{d^2y}{dx^2} = 60x^2 - 144x + 84$", mk: "M1 A1 A1" },
        { h: "(b)(i)", m: "$20 - 72 + 84 - 32 = 0$ ✓", mk: "B1" },
        { h: "(ii) $f''(1) = 0$ — so test the sign of $f''$ either side", m: "$\\dfrac{d^2y}{dx^2} = 12(5x^2 - 12x + 7) = 12(5x - 7)(x - 1)$: at $x = 0.9$ it is $12(-2.5)(-0.1) > 0$, at $x = 1.1$ it is $12(-1.5)(0.1) < 0$. The second derivative changes sign at $x = 1$, so it is a point of inflection (and, with $f'(1) = 0$, a stationary point of inflection).", mk: "M1 A1 A1", n: "Or: $f'''(1) = -24 \\ne 0$. Or: $f'$ has the same sign either side of 1 (factorise $f' = 4(x - 1)^2(5x - 8)$). Any one, with the reasoning stated." }
      ], result: "shown" } },
    { worked: { tag: "exam", title: "Sketch the gradient function from a curve; pick the right $\\frac{dy}{dx}$", src: "AS June 2025 · P1 Q12 · 5 marks",
      q: "A curve has a maximum at $x = -2$, a minimum at $x = 1$, and is increasing for $x < -2$ and $x > 1$. **(a)** Sketch the graph of $\\frac{dy}{dx}$ against $x$. **(b)** Which of these could be $\\frac{dy}{dx}$: $(x + 2)(x - 1)$, $-(x + 2)(x - 1)$, $(x - 2)(x + 1)$? Explain.",
      steps: [
        { h: "(a) Read the sign of the gradient", m: "Positive for $x < -2$, zero at $-2$, negative between $-2$ and $1$, zero at $1$, positive after: a U-shaped parabola through $(-2, 0)$ and $(1, 0)$, below the axis between them.", mk: "B1 B1", fig: { x: [-4, 3], y: [-3, 4], axes: { xt: [-2, 1], yt: [-2, 2] }, items: [ { fn: "(x+2)*(x-1)", label: "dy/dx", at: 2.4, pos: "w" }, { pt: [-2, 0], label: "max of y", pos: "nw" }, { pt: [1, 0], label: "min of y", pos: "ne" } ], cap: "The gradient graph crosses the axis where the curve turns: going down through zero at a maximum, up through zero at a minimum." } },
        { h: "(b)", m: "$\\dfrac{dy}{dx} = (x + 2)(x - 1)$: zero at $-2$ and $1$ and positive outside them. $-(x + 2)(x - 1)$ has the wrong sign; $(x - 2)(x + 1)$ has the wrong roots.", mk: "M1 A1 A1" }
      ], result: "$\\dfrac{dy}{dx} = (x + 2)(x - 1)$" } },

    { page: "Exam toolkit" },
    { ul: [
      "**No limit written** — \"$\\lim_{h \\to 0}$\" at the start and \"as $h \\to 0$\" at the end are marks.",
      "**Using the answer** ($\\frac{d}{dx}x^2 = 2x$) inside a first-principles proof.",
      "**Binomial slip** in $(x + h)^3$.",
      "**For $\\sin$/$\\cos$**: forgetting to factorise into the two standard limits, or assuming $\\cos h \\to 1$ without dividing by $h$ properly.",
      "**$f'' = 0$ ⇒ inflection** — false; it must change sign.",
      "**Concave/convex swapped**: convex is $f'' > 0$ (cup shape)."
    ] },
    { callout: { t: "mnemonic", h: "\"Define, expand, cancel, divide, limit\"", body: "The first-principles proof in five verbs; write each one." } },
    { callout: { t: "mnemonic", h: "\"Con-cave: caves in\"", body: "Concave ($f'' < 0$) curves like the roof of a cave; convex ($f'' > 0$) like a cup holding water." } }
  ],
  flashcards: [
    ["Definition of $f'(x)$?", "$\\lim_{h \\to 0}\\frac{f(x+h) - f(x)}{h}$."],
    ["Prove $\\frac{d}{dx}x^2 = 2x$ from first principles.", "$\\frac{(x+h)^2 - x^2}{h} = 2x + h \\to 2x$ as $h \\to 0$."],
    ["Key step in proving $\\frac{d}{dx}\\sin x = \\cos x$?", "Expand $\\sin(x+h)$, then group as $\\sin x\\frac{\\cos h - 1}{h} + \\cos x\\frac{\\sin h}{h}$ and use the two limits."],
    ["What does $f''(x) > 0$ tell you?", "The gradient is increasing — the curve is convex."],
    ["Condition for a point of inflection?", "$f''$ changes sign there ($f'' = 0$ alone is not enough)."],
    ["$f'(a) = 0$ and $f''(a) = 0$: what next?", "Inconclusive — check the sign of $f'$ on either side."],
    ["$f = x^3 + 2x^2 - 8x + 5$: where concave?", "$f'' = 6x + 4 < 0$: $x < -\\frac23$."],
    ["Chord gradient $2 + h$ and tangent gradient 2 — relationship?", "The chord gradient tends to the tangent gradient as $h \\to 0$."]
  ],
  quiz: [
    { q: "$\\frac{(x+h)^2 - x^2}{h}$ simplifies to", opts: ["$2x + h$", "$2x$", "$x + h$", "$2xh$"], ans: 0, why: "Expand and divide by $h$." },
    { q: "In a first-principles proof the final step must", opts: ["state the limit as $h \\to 0$", "set $h = 0$ at the start", "quote the power rule", "differentiate twice"], ans: 0, why: "The limit is the definition." },
    { q: "$y = x^4$ at $x = 0$: $f' = f'' = 0$. The point is", opts: ["a minimum", "a point of inflection", "a maximum", "not stationary"], ans: 0, why: "$f'$ changes from negative to positive." },
    { q: "Convex means", opts: ["$f'' > 0$", "$f'' < 0$", "$f' > 0$", "$f' = 0$"], ans: 0, why: "Gradient increasing." },
    { q: "$\\lim_{h\\to0}\\frac{\\sin h}{h} =$", opts: ["1", "0", "$\\infty$", "$h$"], ans: 0, why: "Standard limit (radians)." },
    { q: "The graph of $\\frac{dy}{dx}$ crosses zero going downward where $y$ has", opts: ["a maximum", "a minimum", "an inflection", "an asymptote"], ans: 0, why: "Gradient goes + to −." }
  ]
};

/* =====================================================================
   7.2  Differentiating x^n, e^kx, a^kx, sin/cos/tan kx, ln x
   ===================================================================== */
C["maths:7.2"] = {
  notes: [
    { h: "Standard derivatives — the whole topic on one page" },
    { callout: { t: "memorise", h: "The table (only the trig and $a^x$ results appear in the booklet)", body: [
      "$$\\dfrac{d}{dx}x^n = nx^{n-1} \\qquad \\dfrac{d}{dx}e^{kx} = ke^{kx} \\qquad \\dfrac{d}{dx}a^{kx} = ka^{kx}\\ln a \\qquad \\dfrac{d}{dx}\\ln x = \\dfrac1x$$",
      "$$\\dfrac{d}{dx}\\sin kx = k\\cos kx \\qquad \\dfrac{d}{dx}\\cos kx = -k\\sin kx \\qquad \\dfrac{d}{dx}\\tan kx = k\\sec^2 kx$$",
      "Also (7.4): $\\sec x \\to \\sec x\\tan x$, $\\text{cosec}\\,x \\to -\\text{cosec}\\,x\\cot x$, $\\cot x \\to -\\text{cosec}^2 x$. Trig derivatives require **radians**.",
      "Sums, differences and constant multiples differentiate term by term. Products, quotients and brackets do **not** — use 7.4."
    ] } },
    "Before differentiating, **rewrite** into terms of the form $ax^n$: expand brackets, split fractions, turn roots and reciprocals into indices (2.1).",
    { table: { head: ["Expression", "Rewritten", "Derivative"], rows: [
      ["$(2x + 5)(x - 1)$", "$2x^2 + 3x - 5$", "$4x + 3$"],
      ["$\\frac{x^2 + 3x - 5}{4x^2}$", "$\\frac14 + \\frac34 x^{-1} - \\frac54 x^{-2}$", "$-\\frac34 x^{-2} + \\frac52 x^{-3}$"],
      ["$\\frac{4x^2 + x}{2\\sqrt x}$", "$2x^{3/2} + \\frac12 x^{1/2}$", "$3x^{1/2} + \\frac14 x^{-1/2}$"],
      ["$x^2 - 2x - 24\\sqrt x$", "$x^2 - 2x - 24x^{1/2}$", "$2x - 2 - 12x^{-1/2}$"],
      ["$3e^{2x} - 5\\ln x$", "—", "$6e^{2x} - \\frac5x$"],
      ["$4\\sin 3x + \\cos\\frac{x}{2}$", "—", "$12\\cos 3x - \\frac12\\sin\\frac{x}{2}$"],
      ["$2^{3x}$", "—", "$3 \\cdot 2^{3x}\\ln 2$"],
      ["$\\ln(5x)$", "$\\ln 5 + \\ln x$", "$\\frac1x$"]
    ] } },

    { page: "Worked derivatives" },
    { worked: { tag: "exam", title: "First and second derivatives with a root term; verify and classify a stationary point", src: "A-level June 2018 · P1 Q2 · 7 marks",
      q: "$y = x^2 - 2x - 24\\sqrt x$, $x > 0$. **(a)** Find (i) $\\frac{dy}{dx}$, (ii) $\\frac{d^2y}{dx^2}$. **(b)** Verify that $C$ has a stationary point at $x = 4$. **(c)** Determine its nature, giving a reason.",
      steps: [
        { h: "(a)", m: "$y = x^2 - 2x - 24x^{1/2}$: $\\dfrac{dy}{dx} = 2x - 2 - 12x^{-1/2}$; $\\dfrac{d^2y}{dx^2} = 2 + 6x^{-3/2}$", mk: "M1 A1 A1", n: "$-24 \\times \\frac12 = -12$, index $\\frac12 - 1 = -\\frac12$; then $-12 \\times (-\\frac12) = +6$, index $-\\frac32$." },
        { h: "(b)", m: "At $x = 4$: $8 - 2 - \\dfrac{12}{2} = 0$ ✓", mk: "M1 A1" },
        { h: "(c)", m: "$\\dfrac{d^2y}{dx^2} = 2 + \\dfrac{6}{8} = 2.75 > 0$, so a **minimum**.", mk: "M1 A1" }
      ], result: "(a) $2x - 2 - 12x^{-1/2}$, $2 + 6x^{-3/2}$ (c) minimum" } },
    { worked: { tag: "exam", title: "A quotient rewritten as powers; show the derivative in a given form", src: "A-level Oct 2020 · P2 Q7(a) · 4 marks",
      q: "$y = \\frac{4x^2 + x}{2\\sqrt x} - 4\\ln x$, $x > 0$. Show that $\\frac{dy}{dx} = \\frac{12x^2 + x - 16\\sqrt x}{4x\\sqrt x}$.",
      steps: [
        { h: "Split the fraction", m: "$y = 2x^{3/2} + \\dfrac12 x^{1/2} - 4\\ln x$", mk: "M1 A1", n: "$\\frac{4x^2}{2x^{1/2}} = 2x^{3/2}$ and $\\frac{x}{2x^{1/2}} = \\frac12 x^{1/2}$." },
        { m: "$\\dfrac{dy}{dx} = 3x^{1/2} + \\dfrac14 x^{-1/2} - \\dfrac4x$", mk: "A1" },
        { h: "Common denominator $4x\\sqrt x$", m: "$= \\dfrac{3x^{1/2} \\cdot 4x\\sqrt x + \\frac14 x^{-1/2} \\cdot 4x\\sqrt x - \\frac4x \\cdot 4x\\sqrt x}{4x\\sqrt x} = \\dfrac{12x^2 + x - 16\\sqrt x}{4x\\sqrt x}$", mk: "A1*", n: "$x^{1/2} \\cdot x\\sqrt x = x^2$; $x^{-1/2} \\cdot x\\sqrt x = x$; $\\frac1x \\cdot x\\sqrt x = \\sqrt x$." }
      ], result: "shown" } },
    { worked: { tag: "exam", title: "Build $f(x)$ backwards from $f'(x) = 4x + a\\sqrt x + b$", src: "AS June 2023 · P1 Q16 · 6 marks",
      q: "$y = f(x)$, $x \\ge 0$, has $f'(x) = 4x + a\\sqrt x + b$, a stationary point at $(4, 3)$, and meets the $y$-axis at $-5$. Find $f(x)$ in simplest form.",
      steps: [
        { h: "Stationary at $x = 4$", m: "$f'(4) = 16 + 2a + b = 0$", mk: "B1" },
        { h: "Integrate (8.2) with the intercept", m: "$f(x) = 2x^2 + \\dfrac{2a}{3}x^{3/2} + bx + c$; $f(0) = -5 \\Rightarrow c = -5$", mk: "M1 A1" },
        { h: "Through $(4, 3)$", m: "$32 + \\dfrac{16a}{3} + 4b - 5 = 3 \\Rightarrow 4a + 3b = -18$", mk: "M1" },
        { m: "With $b = -16 - 2a$: $4a - 48 - 6a = -18 \\Rightarrow a = -15$, $b = 14$\n$f(x) = 2x^2 - 10x^{3/2} + 14x - 5$", mk: "A1 A1" }
      ], result: "$f(x) = 2x^2 - 10x^{\\frac32} + 14x - 5$" } },
    { worked: { tag: "example", title: "Trig, exponential and log derivatives", src: "routine",
      steps: [
        { m: "$y = 3\\sin 2x - \\cos 5x$: $\\dfrac{dy}{dx} = 6\\cos 2x + 5\\sin 5x$", n: "Chain-rule constant $k$ comes out front; $\\cos$ differentiates to $-\\sin$, and the $-$ in front flips it." },
        { m: "$y = 5e^{-3x} + 2\\ln x - \\ln 7$: $\\dfrac{dy}{dx} = -15e^{-3x} + \\dfrac2x$", n: "$\\ln 7$ is a constant: derivative 0." },
        { m: "$y = 3^{2x}$: $\\dfrac{dy}{dx} = 2 \\cdot 3^{2x}\\ln 3$", n: "Because $3^{2x} = e^{2x\\ln 3}$." },
        { m: "$y = \\tan 4x$: $\\dfrac{dy}{dx} = 4\\sec^2 4x$" }
      ] } },

    { page: "Exam toolkit" },
    { ul: [
      "**Not rewriting first**: differentiating $\\frac{x^2 + 3x}{4x^2}$ term-by-term without splitting; \"differentiating\" a bracket by differentiating each factor.",
      "**Index arithmetic**: $\\frac12 - 1 = -\\frac12$; $-\\frac12 - 1 = -\\frac32$.",
      "**Sign of $\\cos$**: $\\frac{d}{dx}\\cos kx = -k\\sin kx$.",
      "**$\\ln$ of a product**: $\\ln 5x$ differentiates to $\\frac1x$, not $\\frac{1}{5x}$ (write $\\ln 5 + \\ln x$).",
      "**$a^x$ needs the $\\ln a$**.",
      "**Degrees**: trig derivatives are false in degrees — the question will be in radians."
    ] },
    { callout: { t: "mnemonic", h: "\"Rewrite, then power down\"", body: "Get everything to $ax^n$ (or a standard function) first; only then multiply by the power and drop it by one." } }
  ],
  flashcards: [
    ["$\\frac{d}{dx}x^n$, $\\frac{d}{dx}e^{kx}$, $\\frac{d}{dx}\\ln x$?", "$nx^{n-1}$; $ke^{kx}$; $\\frac1x$."],
    ["$\\frac{d}{dx}\\sin kx$, $\\cos kx$, $\\tan kx$?", "$k\\cos kx$; $-k\\sin kx$; $k\\sec^2 kx$."],
    ["$\\frac{d}{dx}a^{kx}$?", "$ka^{kx}\\ln a$."],
    ["Differentiate $\\frac{4x^2 + x}{2\\sqrt x}$.", "Rewrite $2x^{3/2} + \\frac12 x^{1/2}$: $3x^{1/2} + \\frac14 x^{-1/2}$."],
    ["Differentiate $x^2 - 2x - 24\\sqrt x$ twice.", "$2x - 2 - 12x^{-1/2}$; $2 + 6x^{-3/2}$."],
    ["$\\frac{d}{dx}\\ln(5x) = $?", "$\\frac1x$ ($\\ln 5$ is constant)."],
    ["$f' = 4x + a\\sqrt x + b$: what is $f$?", "$2x^2 + \\frac{2a}{3}x^{3/2} + bx + c$."],
    ["Why must $x$ be in radians for $\\frac{d}{dx}\\sin x = \\cos x$?", "The limit $\\frac{\\sin h}{h} \\to 1$ only holds in radians."]
  ],
  quiz: [
    { q: "$\\frac{d}{dx}(3x^{-2}) =$", opts: ["$-6x^{-3}$", "$6x^{-3}$", "$-6x^{-1}$", "$3x^{-3}$"], ans: 0, why: "$3 \\times (-2)$." },
    { q: "$\\frac{d}{dx}(\\sqrt x) =$", opts: ["$\\tfrac{1}{2\\sqrt x}$", "$\\tfrac12\\sqrt x$", "$\\tfrac{1}{\\sqrt x}$", "$2\\sqrt x$"], ans: 0, why: "$\\frac12 x^{-1/2}$." },
    { q: "$\\frac{d}{dx}(\\cos 3x) =$", opts: ["$-3\\sin 3x$", "$3\\sin 3x$", "$-\\sin 3x$", "$3\\cos 3x$"], ans: 0, why: "Chain constant, sign flip." },
    { q: "$\\frac{d}{dx}(e^{-2x}) =$", opts: ["$-2e^{-2x}$", "$2e^{-2x}$", "$e^{-2x}$", "$-2e^{-3x}$"], ans: 0, why: "$k = -2$." },
    { q: "$\\frac{d}{dx}(5^x) =$", opts: ["$5^x\\ln 5$", "$x5^{x-1}$", "$5^x$", "$\\ln 5$"], ans: 0, why: "Standard." },
    { q: "To differentiate $(2x + 5)(x - 1)$ you should first", opts: ["expand the brackets", "differentiate each bracket", "take logs", "divide by $x$"], ans: 0, why: "Or use the product rule." }
  ]
};

/* =====================================================================
   7.3  Tangents, normals, stationary points, increasing/decreasing
   ===================================================================== */
C["maths:7.3"] = {
  notes: [
    { h: "Applying the derivative — the whole topic on one page" },
    { table: { head: ["Question", "Method"], rows: [
      ["tangent at $x = a$", "gradient $m = f'(a)$; line $y - f(a) = m(x - a)$"],
      ["normal at $x = a$", "gradient $-\\frac{1}{f'(a)}$ through the same point"],
      ["stationary points", "solve $f'(x) = 0$; find $y$"],
      ["nature", "$f'' > 0$ min, $f'' < 0$ max; if $f'' = 0$, test the sign of $f'$ either side"],
      ["increasing / decreasing", "where $f'(x) > 0$ / $< 0$ — solve the inequality (2.5)"],
      ["maximise / minimise a quantity", "express it in one variable using the constraint, differentiate, set to zero, confirm with $f''$, evaluate"]
    ] } },
    "Ten of the last twenty papers have an **optimisation** question worth 9–13 marks: a container, a stage, a trough, a lorry's fuel cost. The calculus is the easy half; setting up the function from the geometry is where marks are lost.",

    { page: "Tangents and normals" },
    { worked: { tag: "exam", title: "Tangent at a point", src: "AS June 2020 · P1 Q1 · 5 marks",
      q: "Find the tangent to $y = 2x^3 - 4x + 5$ at $P(2, 13)$, in the form $y = mx + c$ with integer $m$, $c$.",
      steps: [
        { m: "$\\dfrac{dy}{dx} = 6x^2 - 4$; at $x = 2$: $m = 20$", mk: "M1 A1 A1" },
        { m: "$y - 13 = 20(x - 2) \\Rightarrow y = 20x - 27$", mk: "M1 A1", n: "Check $P$: $40 - 27 = 13$ ✓" }
      ], result: "$y = 20x - 27$" } },
    { worked: { tag: "exam", title: "Tangent to a cubic, where it meets the curve again, and the area between", src: "A-level Oct 2021 · P2 Q7 · 9 marks",
      q: "$C$: $y = x^3 - 10x^2 + 27x - 23$; $P(5, -13)$ lies on $C$ and $l$ is the tangent at $P$. **(a)** Find the equation of $l$ in the form $y = mx + c$. **(b)** Find the $x$-coordinate of the point where $l$ meets $C$ again. **(c)** Find the area of the region $R$ between $C$ and $l$.",
      steps: [
        { h: "(a)", m: "$\\dfrac{dy}{dx} = 3x^2 - 20x + 27 = 2$ at $x = 5$; $\; y + 13 = 2(x - 5) \\Rightarrow y = 2x - 23$", mk: "M1 A1 M1 A1" },
        { h: "(b) Equate; the tangent point is a double root", m: "$x^3 - 10x^2 + 27x - 23 = 2x - 23 \\Rightarrow x^3 - 10x^2 + 25x = 0 \\Rightarrow x(x - 5)^2 = 0$: meets again at $x = 0$, the point $(0, -23)$", mk: "M1 A1", n: "A tangent touches at a **repeated** root — $(x - 5)^2$ — which is the algebraic check that $l$ really is the tangent." },
        { h: "(c) Area between curve and line from 0 to 5", m: "$\\displaystyle\\int_0^5 \\left[(x^3 - 10x^2 + 27x - 23) - (2x - 23)\\right]dx = \\int_0^5 (x^3 - 10x^2 + 25x)\\,dx = \\left[\\dfrac{x^4}{4} - \\dfrac{10x^3}{3} + \\dfrac{25x^2}{2}\\right]_0^5 = \\dfrac{625}{12}$", mk: "M1 A1 A1", n: "Curve minus line (the curve is above the tangent here) — integrate the difference, not the two separately." }
      ], result: "(a) $y = 2x - 23$ (b) $(0, -23)$ (c) $\\frac{625}{12}$" } },
    { worked: { tag: "exam", title: "Normal to a curve; area bounded by the normal, the curve and two lines", src: "AS June 2018 · P1 Q15 · 10 marks",
      q: "$C$: $y = \\frac{32}{x^2} + 3x - 8$, $x > 0$; $P(4, 6)$ lies on $C$ and $l$ is the normal at $P$. The region $R$ is bounded by $l$, $C$, the line $x = 2$ and the $x$-axis. Show that the area of $R$ is 46.",
      steps: [
        { h: "Gradient at $P$ and the normal", m: "$\\dfrac{dy}{dx} = -\\dfrac{64}{x^3} + 3 = 2$ at $x = 4$; normal gradient $-\\dfrac12$: $y - 6 = -\\dfrac12(x - 4) \\Rightarrow y = -\\dfrac12 x + 8$", mk: "M1 A1 M1 A1" },
        { h: "Where the normal meets the $x$-axis", m: "$x = 16$", mk: "B1" },
        { h: "Split $R$: under the curve from 2 to 4, then the triangle under the normal from 4 to 16", m: "$\\displaystyle\\int_2^4 \\left(32x^{-2} + 3x - 8\\right)dx = \\left[-\\dfrac{32}{x} + \\dfrac{3x^2}{2} - 8x\\right]_2^4 = (-8 + 24 - 32) - (-16 + 6 - 16) = 10$\nTriangle: $\\tfrac12 \\times 12 \\times 6 = 36$", mk: "M1 A1 A1 B1", fig: { x: [0, 17], y: [-2, 12], axes: { xt: [2, 4, 16], yt: [6] }, items: [ { shade: { fn: "32/(x*x)+3*x-8", from: 2, to: 4 }, c: "accent", alpha: 0.18 }, { poly: [[4, 0], [16, 0], [4, 6]], fill: "accent3", alpha: 0.18, c: "accent3" }, { fn: "32/(x*x)+3*x-8", from: 1.5, to: 5.5, label: "C", at: 5.3, pos: "e" }, { fn: "-0.5*x+8", from: 3, to: 16, c: "accent3", label: "l", at: 10, pos: "n" }, { pt: [4, 6], label: "P(4, 6)", pos: "ne" }, { vline: 2, c: "muted", label: "x = 2" } ], cap: "$R$ = (area under $C$ from 2 to 4) + (triangle under the normal from 4 to 16)." } },
        { m: "Area $= 10 + 36 = 46$", mk: "A1*" }
      ], result: "46" } },
    { worked: { tag: "exam", title: "Two tangents and the region between them and the curve", src: "A-level June 2024 · P1 Q10 · 9 marks",
      q: "$y = 8x - x^{5/2}$, $x \\ge 0$, crosses the $x$-axis at $A$. $l_1$ is the tangent at $A$ and $l_2$ the tangent at the origin. Find the exact area of the region $R$ bounded by $l_1$, $l_2$ and the curve.",
      steps: [
        { h: "$A$ and the two gradients", m: "$8x = x^{5/2} \\Rightarrow x^{3/2} = 8 \\Rightarrow x = 4$: $A(4, 0)$. $\\dfrac{dy}{dx} = 8 - \\dfrac52 x^{3/2}$: at 0 it is 8, at 4 it is $8 - 20 = -12$", mk: "M1 A1 M1 A1" },
        { h: "The tangents and their intersection", m: "$l_2$: $y = 8x$; $l_1$: $y = -12(x - 4) = 48 - 12x$. Meet: $8x = 48 - 12x \\Rightarrow x = 2.4$, $y = 19.2$", mk: "A1 A1" },
        { h: "$R$ = triangle under the two tangents − area under the curve", m: "Triangle $O$, $(2.4, 19.2)$, $A$: $\\tfrac12 \\times 4 \\times 19.2 = 38.4 = \\dfrac{192}{5}$\n$\\displaystyle\\int_0^4 (8x - x^{5/2})dx = \\left[4x^2 - \\dfrac27 x^{7/2}\\right]_0^4 = 64 - \\dfrac{256}{7} = \\dfrac{192}{7}$", mk: "M1 A1" },
        { m: "$R = \\dfrac{192}{5} - \\dfrac{192}{7} = \\dfrac{384}{35}$", mk: "A1", n: "$4^{7/2} = 128$. Exact fractions throughout." }
      ], result: "$\\dfrac{384}{35}$" } },

    { page: "Stationary points and their nature" },
    { worked: { tag: "exam", title: "Unknown $k$ from a turning point; then the $y$-intercept by integrating", src: "A-level June 2023 · P2 Q5 · 5 marks",
      q: "$C$: $y = f(x)$ passes through $P(3, -10)$ and has a turning point at $P$; $\\frac{dy}{dx} = 2x^3 - 9x^2 + 5x + k$. **(a)** Show that $k = 12$. **(b)** Hence find where $C$ crosses the $y$-axis.",
      steps: [
        { h: "(a) $f'(3) = 0$", m: "$54 - 81 + 15 + k = 0 \\Rightarrow k = 12$", mk: "M1 A1*" },
        { h: "(b) Integrate and use $P$", m: "$y = \\dfrac{x^4}{2} - 3x^3 + \\dfrac{5x^2}{2} + 12x + c$; at $(3, -10)$: $40.5 - 81 + 22.5 + 36 + c = -10 \\Rightarrow c = -28$", mk: "M1 A1 A1", n: "$C$ crosses the $y$-axis at $(0, -28)$." }
      ], result: "(a) shown (b) $(0, -28)$" } },
    { worked: { tag: "exam", title: "A cubic from three conditions; prove the stationary point is a maximum", src: "AS June 2020 · P1 Q14 · 9 marks",
      q: "$g(x)$ is a cubic in which the coefficient of $x^3$ equals the coefficient of $x$; $y = g(x)$ passes through the origin and has a stationary point at $(2, 9)$. **(a)** Find $g(x)$. **(b)** Prove that the stationary point at $(2, 9)$ is a maximum.",
      steps: [
        { h: "(a) Translate the conditions", m: "$g(x) = ax^3 + bx^2 + ax$ (through the origin: no constant; equal coefficients)\n$g(2) = 10a + 4b = 9$; $\; g'(x) = 3ax^2 + 2bx + a \\Rightarrow g'(2) = 13a + 4b = 0$", mk: "B1 M1 A1 M1" },
        { m: "Subtract: $3a = -9 \\Rightarrow a = -3$, $b = \\dfrac{39}{4}$: $g(x) = -3x^3 + \\dfrac{39}{4}x^2 - 3x$", mk: "A1 A1 A1" },
        { h: "(b)", m: "$g''(x) = -18x + \\dfrac{39}{2}$; $g''(2) = -36 + 19.5 < 0$: maximum", mk: "M1 A1" }
      ], result: "$g(x) = -3x^3 + \\frac{39}{4}x^2 - 3x$; maximum" } },
    { worked: { tag: "exam", title: "Stationary points of $4(x^2 - 2)e^{-2x}$ exactly; ranges of transformed functions", src: "A-level Oct 2020 · P1 Q9 · 9 marks",
      q: "$f(x) = 4(x^2 - 2)e^{-2x}$. **(a)** Show that $f'(x) = 8(2 + x - x^2)e^{-2x}$. **(b)** Hence find the exact coordinates of the stationary points of $C$. $g(x) = 2f(x)$ and $h(x) = 2f(x) - 3$, $x \\ge 0$. **(c)** Find the range of $g$ and the range of $h$.",
      steps: [
        { h: "(a) Product rule", m: "$f'(x) = 8xe^{-2x} + 4(x^2 - 2)(-2e^{-2x}) = 8e^{-2x}\\left[x - (x^2 - 2)\\right] = 8(2 + x - x^2)e^{-2x}$", mk: "M1 A1 A1*" },
        { h: "(b) $e^{-2x} \\ne 0$, so $2 + x - x^2 = 0$", m: "$(2 - x)(1 + x) = 0$: $x = 2$, $y = 8e^{-4}$; $x = -1$, $y = -4e^2$", mk: "M1 A1 A1" },
        { h: "(c) From the sketch (min at $x = -1$, max at $x = 2$, $f \\to 0^+$ as $x \\to \\infty$)", m: "$g(x) = 2f(x)$ on all $x$: range $g(x) \\ge -8e^2$. $h$ on $x \\ge 0$: $f$ runs from $f(0) = -8$ up to $8e^{-4}$ then down to 0, so $2f - 3$ runs from $-19$ to $16e^{-4} - 3$: $-19 \\le h(x) \\le 16e^{-4} - 3$", mk: "B1 M1 A1", n: "The range needs the sketch's shape and the domain's endpoint $x = 0$." }
      ], result: "(b) $(2, 8e^{-4})$, $(-1, -4e^2)$ (c) $g \\ge -8e^2$; $-19 \\le h \\le 16e^{-4} - 3$" } },
    { worked: { tag: "exam", title: "Increasing/decreasing: solve $\\frac{dy}{dx} > 0$", src: "AS Specimen · P1 Q1 and AS June 2019 · P1 Q5",
      q: "**(i)** $y = 2x^3 - 2x^2 - 2x + 8$. Find the range of $x$ for which $y$ is increasing, in set notation. **(ii)** $y = 3x^2 + \\frac2x + 2$, $x > 0$. Find the exact range of $x$ for which the curve is increasing.",
      steps: [
        { h: "(i)", m: "$\\dfrac{dy}{dx} = 6x^2 - 4x - 2 = 2(3x + 1)(x - 1) > 0 \\Rightarrow \\{x : x < -\\tfrac13\\} \\cup \\{x : x > 1\\}$", mk: "M1 A1 M1 A1", n: "A quadratic inequality: roots, U-shape, outside." },
        { h: "(ii)", m: "$\\dfrac{dy}{dx} = 6x - \\dfrac{2}{x^2} > 0 \\Rightarrow 6x^3 > 2$ (multiplying by $x^2 > 0$) $\\Rightarrow x^3 > \\dfrac13 \\Rightarrow x > \\sqrt[3]{\\tfrac13}$", mk: "M1 A1 M1 A1", n: "Multiplying by $x^2$ is safe; then a cube root has one real value." }
      ], result: "(i) $x < -\\frac13$ or $x > 1$ (ii) $x > \\sqrt[3]{\\frac13}$" } },

    { page: "Optimisation" },
    { callout: { t: "memorise", h: "The routine", body: [
      "1. **Name** the variables and write the **constraint** (volume fixed, area fixed).",
      "2. Write the **quantity to optimise** (cost, surface area, perimeter) in terms of the variables.",
      "3. Use the constraint to eliminate all but one variable. This is the \"show that\" part — every line visible.",
      "4. Differentiate, set $= 0$, solve.",
      "5. **Justify** with $\\frac{d^2}{dx^2}$ (sign stated) — a mark on its own.",
      "6. Evaluate the optimum value, with units and the rounding asked for.",
      "7. Limitation if asked: negligible thickness, no lid, idealised shape."
    ] } },
    { worked: { tag: "exam", title: "Cylinder + hemisphere tank: surface area, minimise", src: "A-level June 2019 · P2 Q13 · 10 marks",
      q: "A tank is a hollow cylinder (radius $r$ m, height $h$ m) closed at one end with a hemispherical shell of radius $r$; its volume is $6$ m$^3$. **(a)** Show that the surface area is $S = \\frac{12}{r} + \\frac53\\pi r^2$. **(b)** Find the value of $r$ for which $S$ is a minimum, and the minimum surface area, justifying that it is a minimum.",
      steps: [
        { h: "(a) Constraint and area", m: "$V = \\pi r^2 h + \\dfrac23\\pi r^3 = 6 \\Rightarrow h = \\dfrac{6}{\\pi r^2} - \\dfrac{2r}{3}$\n$S = \\pi r^2 + 2\\pi rh + 2\\pi r^2$ (base disc + curved side + hemisphere)", mk: "M1 A1 M1", n: "One flat end only — the other end is the hemisphere." },
        { m: "$S = 3\\pi r^2 + 2\\pi r\\left(\\dfrac{6}{\\pi r^2} - \\dfrac{2r}{3}\\right) = 3\\pi r^2 + \\dfrac{12}{r} - \\dfrac{4\\pi r^2}{3} = \\dfrac{12}{r} + \\dfrac53\\pi r^2$", mk: "A1*" },
        { h: "(b)", m: "$\\dfrac{dS}{dr} = -\\dfrac{12}{r^2} + \\dfrac{10\\pi r}{3} = 0 \\Rightarrow r^3 = \\dfrac{36}{10\\pi} \\Rightarrow r = 1.05$ m", mk: "M1 A1 A1" },
        { m: "$\\dfrac{d^2S}{dr^2} = \\dfrac{24}{r^3} + \\dfrac{10\\pi}{3} > 0$: minimum. $S_{\\min} = \\dfrac{12}{1.046} + \\dfrac53\\pi(1.046)^2 = 17.2$ m$^2$", mk: "B1 M1 A1" }
      ], result: "$r \\approx 1.05$ m, $S_{\\min} \\approx 17.2$ m$^2$" } },
    { worked: { tag: "exam", title: "Drinks container: cost with two metals, minimise, second derivative, minimum cost", src: "AS June 2022 · P1 Q12 · 12 marks",
      q: "A closed cylinder of base radius $r$ cm and height $h$ cm holds $355$ cm$^3$. The base and curved side cost $0.04$ p/cm$^2$; the top costs $0.09$ p/cm$^2$. **(a)** Show that the total cost is $C = 0.13\\pi r^2 + \\frac{28.4}{r}$. **(b)** Find $r$ for minimum $C$, to 3 s.f. **(c)** Prove it is a minimum using $\\frac{d^2C}{dr^2}$. **(d)** Find the minimum cost to the nearest integer.",
      steps: [
        { h: "(a)", m: "$\\pi r^2 h = 355 \\Rightarrow h = \\dfrac{355}{\\pi r^2}$\n$C = 0.04(\\pi r^2 + 2\\pi rh) + 0.09\\pi r^2 = 0.13\\pi r^2 + 0.08\\pi r \\cdot \\dfrac{355}{\\pi r^2} = 0.13\\pi r^2 + \\dfrac{28.4}{r}$", mk: "B1 M1 M1 A1*" },
        { h: "(b)", m: "$\\dfrac{dC}{dr} = 0.26\\pi r - \\dfrac{28.4}{r^2} = 0 \\Rightarrow r^3 = \\dfrac{28.4}{0.26\\pi} \\Rightarrow r = 3.26$", mk: "M1 A1 M1 A1" },
        { h: "(c)", m: "$\\dfrac{d^2C}{dr^2} = 0.26\\pi + \\dfrac{56.8}{r^3} > 0$ for $r > 0$: minimum", mk: "M1 A1" },
        { h: "(d)", m: "$C = 0.13\\pi(3.264)^2 + \\dfrac{28.4}{3.264} = 13.05 \\to$ **13 pence**", mk: "M1 A1" }
      ], result: "(b) $r = 3.26$ cm (d) 13 p" } },
    { worked: { tag: "exam", title: "Lorry running cost: minimise, prove minimum, limitation", src: "AS June 2018 · P1 Q8 · 9 marks",
      q: "The cost £$C$ of a journey at steady speed $v$ km/h is $C = \\frac{1500}{v} + \\frac{2v}{11} + 60$. **(a)** Find (i) the $v$ that minimises the cost, (ii) the minimum cost. **(b)** Prove by $\\frac{d^2C}{dv^2}$ that this is a minimum. **(c)** State one limitation.",
      steps: [
        { h: "(a)", m: "$\\dfrac{dC}{dv} = -\\dfrac{1500}{v^2} + \\dfrac{2}{11} = 0 \\Rightarrow v^2 = 8250 \\Rightarrow v = 90.8$ km/h; $C = \\dfrac{1500}{90.83} + \\dfrac{181.66}{11} + 60 = £93.03$", mk: "M1 A1 M1 A1 M1 A1" },
        { h: "(b)", m: "$\\dfrac{d^2C}{dv^2} = \\dfrac{3000}{v^3} > 0$ for $v > 0$: minimum", mk: "M1 A1" },
        { h: "(c)", m: "The lorry cannot travel at a constant speed for the whole journey (traffic, hills, speed limits).", mk: "B1" }
      ], result: "(a) $v = 90.8$ km/h, £93.03 (c) speed not constant" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Find the equation of the tangent / normal at $P$**", "$f'$ evaluated at $P$; negative reciprocal for a normal; the line in the form asked"],
      ["**Verify that $C$ has a stationary point at $x = a$**", "$f'(a) = 0$ with the arithmetic shown"],
      ["**Determine the nature, giving a reason**", "$f''(a)$ with its sign and \"so minimum/maximum\"; if zero, a sign test of $f'$"],
      ["**Find the range of $x$ for which $y$ is increasing**", "solve $f'(x) > 0$; set notation if asked"],
      ["**Show that the area/cost is …**", "the constraint, the expression, the substitution, every line to the printed form"],
      ["**Use calculus to find the minimum**", "$f' = 0$ solved, $f''$ sign stated, value evaluated with units"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Normal gradient** not the negative reciprocal.",
      "**Nature without a reason** (or with the wrong sign convention).",
      "**Area between curve and line** done as two separate integrals with the wrong limits — integrate the difference between the intersection points.",
      "**Optimisation**: eliminating the wrong variable; forgetting a face (one end open?); not justifying the minimum; rounding $r$ before computing the minimum value.",
      "**Increasing/decreasing**: strict vs non-strict; forgetting the domain ($x > 0$).",
      "**Units** on the optimum value."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["$f'(a)$ numerically", "$\\frac{d}{dx}$ template evaluates the derivative at a point — a check on your gradient before you build a tangent."],
      ["Stationary points", "Table app: scan $f'(x)$ for sign changes; or Equation → Polynomial on $f'(x) = 0$."],
      ["Optimum check", "Table of $C(r)$ around your $r$: the minimum row should match."]
    ] },
    { callout: { t: "mnemonic", h: "\"Constraint, express, eliminate, differentiate, justify, evaluate\"", body: "The six steps of every optimisation question. Say them before you start writing." } }
  ],
  flashcards: [
    ["Gradient of the normal at a point where $f'(a) = 2$?", "$-\\frac12$."],
    ["How do you show a line is a tangent to a curve algebraically?", "Equating gives a repeated root at the point of contact."],
    ["Nature test when $f''(a) = 0$?", "Check the sign of $f'$ on either side of $a$."],
    ["$y = 2x^3 - 2x^2 - 2x + 8$ increasing where?", "$6x^2 - 4x - 2 > 0$: $x < -\\frac13$ or $x > 1$."],
    ["Tank: $\\pi r^2 h + \\frac23\\pi r^3 = 6$; surface area in $r$?", "$S = \\frac{12}{r} + \\frac53\\pi r^2$."],
    ["Minimise $C = \\frac{1500}{v} + \\frac{2v}{11} + 60$.", "$v^2 = 8250$, $v = 90.8$; $C'' = \\frac{3000}{v^3} > 0$."],
    ["Area between $y = x^3 - 10x^2 + 27x - 23$ and its tangent $y = 2x - 23$?", "$\\int_0^5 (x^3 - 10x^2 + 25x)dx = \\frac{625}{12}$."],
    ["Stationary points of $4(x^2 - 2)e^{-2x}$?", "$2 + x - x^2 = 0$: $(2, 8e^{-4})$, $(-1, -4e^2)$."],
    ["Two tangents to $y = 8x - x^{5/2}$ at $O$ and $A(4, 0)$ meet at…", "$(2.4, 19.2)$; region area $\\frac{384}{35}$."]
  ],
  quiz: [
    { q: "Tangent to $y = x^2$ at $(3, 9)$:", opts: ["$y = 6x - 9$", "$y = 6x + 9$", "$y = 3x$", "$y = 9x - 18$"], ans: 0, why: "$m = 6$." },
    { q: "Normal at a point with gradient $-\\frac13$ has gradient", opts: ["3", "$-3$", "$\\tfrac13$", "0"], ans: 0, why: "Negative reciprocal." },
    { q: "$f'(a) = 0$, $f''(a) = -5$: the point is", opts: ["a maximum", "a minimum", "an inflection", "unknown"], ans: 0, why: "$f'' < 0$." },
    { q: "$y = x^3 - 3x$ is decreasing for", opts: ["$-1 < x < 1$", "$x < -1$", "$x > 1$", "all $x$"], ans: 0, why: "$3x^2 - 3 < 0$." },
    { q: "An open-topped box's surface area does not include", opts: ["the top", "the base", "the sides", "any face"], ans: 0, why: "Read the shape." },
    { q: "Proving an optimum is a minimum uses", opts: ["$f'' > 0$", "$f' > 0$", "$f = 0$", "$f'' = 0$"], ans: 0, why: "Second derivative test." }
  ]
};

/* =====================================================================
   7.4  Product, quotient and chain rules; connected rates; inverse functions
   ===================================================================== */
C["maths:7.4"] = {
  notes: [
    { h: "The three rules — the whole topic on one page" },
    { callout: { t: "formula", h: "In the booklet", body: [
      "$$\\text{Quotient: } \\dfrac{d}{dx}\\left(\\dfrac{f(x)}{g(x)}\\right) = \\dfrac{f'(x)g(x) - f(x)g'(x)}{(g(x))^2}$$",
      "**Not in the booklet**: the product rule $\\frac{d}{dx}(uv) = u'v + uv'$ and the chain rule $\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}$ — i.e. differentiate the outside, keep the inside, multiply by the inside's derivative.",
      "Also in the booklet: $\\frac{d}{dx}\\tan kx = k\\sec^2 kx$, $\\sec x \\to \\sec x\\tan x$, $\\cot x \\to -\\text{cosec}^2 x$, $\\text{cosec}\\,x \\to -\\text{cosec}\\,x\\cot x$."
    ] } },
    { table: { head: ["Function", "Rule", "Derivative"], rows: [
      ["$e^{3x}\\sin x$", "product", "$3e^{3x}\\sin x + e^{3x}\\cos x$"],
      ["$x^2\\ln x$", "product", "$2x\\ln x + x$"],
      ["$\\frac{2x^4}{x}$… rewrite as $2x^3$", "—", "$6x^2$ (do not use the quotient rule when division simplifies)"],
      ["$\\frac{2x - 3}{x^2 + 4}$", "quotient", "$\\frac{2(x^2 + 4) - (2x - 3)2x}{(x^2 + 4)^2}$"],
      ["$\\cos^2 x = (\\cos x)^2$", "chain", "$-2\\cos x\\sin x$"],
      ["$\\tan^2 2x$", "chain twice", "$2\\tan 2x \\cdot 2\\sec^2 2x = 4\\tan 2x\\sec^2 2x$"],
      ["$\\ln(x^2 + 1)$", "chain", "$\\frac{2x}{x^2 + 1}$"],
      ["$\\sqrt{e^{3x} - 2}$", "chain", "$\\frac{3e^{3x}}{2\\sqrt{e^{3x} - 2}}$"],
      ["$(x - 4)(2 + \\sqrt x)^{-1}$", "product + chain (or quotient)", "see below"]
    ] } },
    { callout: { t: "tip", h: "Why the product rule has two terms", body: "If $u$ and $v$ are the sides of a rectangle of area $uv$, and both grow a little, the area grows by a strip of width $\\delta u$ along one side ($v\\,\\delta u$) **plus** a strip along the other ($u\\,\\delta v$) — plus a negligible corner $\\delta u\\,\\delta v$. Divide by $\\delta x$ and let it tend to zero: $u'v + uv'$. The quotient rule is the product rule applied to $u \\cdot v^{-1}$ with the chain rule on $v^{-1}$." } },

    { page: "Show that $\\frac{dy}{dx}$ has a given form" },
    "\"Show that $f'(x) = \\ldots$\" is a 3–5 mark part on almost every A-level paper. The printed form tells you how to tidy: a single fraction, a common factor pulled out, a squared denominator.",
    { worked: { tag: "exam", title: "Quotient rule then simplify: $\\frac{5x^2 + 10x}{(x + 1)^2}$ → $\\frac{A}{(x + 1)^n}$", src: "A-level June 2019 · P1 Q3 · 5 marks",
      q: "$y = \\frac{5x^2 + 10x}{(x + 1)^2}$, $x \\ne -1$. **(a)** Show that $\\frac{dy}{dx} = \\frac{A}{(x + 1)^n}$ with $A$, $n$ to be found. **(b)** Deduce the range of $x$ for which $\\frac{dy}{dx} < 0$.",
      steps: [
        { h: "(a) Quotient rule", m: "$\\dfrac{dy}{dx} = \\dfrac{(10x + 10)(x + 1)^2 - (5x^2 + 10x) \\cdot 2(x + 1)}{(x + 1)^4}$", mk: "M1 A1", n: "$g = (x + 1)^2$, $g' = 2(x + 1)$ by the chain rule." },
        { h: "Cancel one $(x + 1)$", m: "$= \\dfrac{(10x + 10)(x + 1) - 2(5x^2 + 10x)}{(x + 1)^3} = \\dfrac{10x^2 + 20x + 10 - 10x^2 - 20x}{(x + 1)^3} = \\dfrac{10}{(x + 1)^3}$", mk: "M1 A1", n: "$A = 10$, $n = 3$. Look for the common factor **before** expanding everything." },
        { h: "(b)", m: "$\\dfrac{10}{(x + 1)^3} < 0 \\iff (x + 1)^3 < 0 \\iff x < -1$", mk: "B1" }
      ], result: "(a) $\\frac{10}{(x + 1)^3}$ (b) $x < -1$" } },
    { worked: { tag: "exam", title: "Rational function: show $f'(x)$, then where $f$ is decreasing", src: "A-level June 2024 · P1 Q5 · 6 marks",
      q: "$f(x) = \\frac{2x - 3}{x^2 + 4}$. **(a)** Show that $f'(x) = \\frac{ax^2 + bx + c}{(x^2 + 4)^2}$. **(b)** Hence, using algebra, find the values of $x$ for which $f$ is decreasing.",
      steps: [
        { h: "(a)", m: "$f'(x) = \\dfrac{2(x^2 + 4) - (2x - 3)(2x)}{(x^2 + 4)^2} = \\dfrac{2x^2 + 8 - 4x^2 + 6x}{(x^2 + 4)^2} = \\dfrac{-2x^2 + 6x + 8}{(x^2 + 4)^2}$", mk: "M1 A1 A1", n: "$a = -2$, $b = 6$, $c = 8$." },
        { h: "(b) Denominator positive, so the sign is the numerator's", m: "$-2x^2 + 6x + 8 < 0 \\Rightarrow x^2 - 3x - 4 > 0 \\Rightarrow (x - 4)(x + 1) > 0 \\Rightarrow x < -1$ or $x > 4$", mk: "M1 A1 A1", n: "Dividing by $-2$ flips the inequality." }
      ], result: "(a) $\\frac{-2x^2 + 6x + 8}{(x^2 + 4)^2}$ (b) $x < -1$ or $x > 4$" } },
    { worked: { tag: "exam", title: "Exponential over quadratic; when is there a stationary point?", src: "A-level June 2022 · P2 Q12 · 6 marks",
      q: "$f(x) = \\frac{e^{3x}}{4x^2 + k}$, $k > 0$. **(a)** Show that $f'(x) = (12x^2 - 8x + 3k)\\,g(x)$ where $g$ is a function to be found. **(b)** Given $y = f(x)$ has at least one stationary point, find the range of $k$.",
      steps: [
        { h: "(a)", m: "$f'(x) = \\dfrac{3e^{3x}(4x^2 + k) - e^{3x} \\cdot 8x}{(4x^2 + k)^2} = \\dfrac{e^{3x}(12x^2 + 3k - 8x)}{(4x^2 + k)^2}$: $g(x) = \\dfrac{e^{3x}}{(4x^2 + k)^2}$", mk: "M1 A1 A1" },
        { h: "(b) $g(x) > 0$, so a stationary point needs a real root of $12x^2 - 8x + 3k = 0$", m: "$64 - 144k \\ge 0 \\Rightarrow k \\le \\dfrac49$; with $k > 0$: $0 < k \\le \\dfrac49$", mk: "M1 A1 A1", n: "Discriminant $\\ge 0$ — \"at least one\" includes the repeated-root case." }
      ], result: "(a) $g(x) = \\frac{e^{3x}}{(4x^2 + k)^2}$ (b) $0 < k \\le \\frac49$" } },
    { worked: { tag: "exam", title: "A surd quotient that collapses: $\\frac{x - 4}{2 + \\sqrt x}$", src: "A-level Oct 2021 · P1 Q14 · 4 marks",
      q: "$y = \\frac{x - 4}{2 + \\sqrt x}$, $x > 0$. Show that $\\frac{dy}{dx} = \\frac{1}{A\\sqrt x}$ where $A$ is a constant to be found.",
      steps: [
        { h: "Quotient rule", m: "$\\dfrac{dy}{dx} = \\dfrac{(2 + \\sqrt x) - (x - 4) \\cdot \\frac{1}{2\\sqrt x}}{(2 + \\sqrt x)^2}$", mk: "M1 A1" },
        { h: "Multiply top and bottom by $2\\sqrt x$", m: "$= \\dfrac{2\\sqrt x(2 + \\sqrt x) - (x - 4)}{2\\sqrt x(2 + \\sqrt x)^2} = \\dfrac{4\\sqrt x + 2x - x + 4}{2\\sqrt x(2 + \\sqrt x)^2} = \\dfrac{x + 4\\sqrt x + 4}{2\\sqrt x(2 + \\sqrt x)^2}$", mk: "M1" },
        { m: "$x + 4\\sqrt x + 4 = (\\sqrt x + 2)^2$, so $\\dfrac{dy}{dx} = \\dfrac{1}{2\\sqrt x}$: $A = 2$", mk: "A1", n: "Faster: $x - 4 = (\\sqrt x - 2)(\\sqrt x + 2)$, so $y = \\sqrt x - 2$ and $y' = \\frac{1}{2\\sqrt x}$ at once. Spotting the difference of two squares avoids the quotient rule entirely." }
      ], result: "$A = 2$" } },
    { worked: { tag: "exam", title: "Trig quotient: show $\\frac{dy}{d\\theta} = \\frac{A}{1 + \\sin 2\\theta}$", src: "A-level June 2018 · P1 Q5 · 5 marks",
      q: "$y = \\frac{3\\sin\\theta}{2\\sin\\theta + 2\\cos\\theta}$. Show that $\\frac{dy}{d\\theta} = \\frac{A}{1 + \\sin 2\\theta}$ where $A$ is a rational constant.",
      steps: [
        { m: "$\\dfrac{dy}{d\\theta} = \\dfrac{3\\cos\\theta(2\\sin\\theta + 2\\cos\\theta) - 3\\sin\\theta(2\\cos\\theta - 2\\sin\\theta)}{(2\\sin\\theta + 2\\cos\\theta)^2}$", mk: "M1 A1" },
        { m: "Numerator: $6\\sin\\theta\\cos\\theta + 6\\cos^2\\theta - 6\\sin\\theta\\cos\\theta + 6\\sin^2\\theta = 6$", mk: "A1", n: "$\\sin^2 + \\cos^2 = 1$ and the cross terms cancel." },
        { m: "Denominator: $4(\\sin\\theta + \\cos\\theta)^2 = 4(1 + 2\\sin\\theta\\cos\\theta) = 4(1 + \\sin 2\\theta)$\n$\\dfrac{dy}{d\\theta} = \\dfrac{6}{4(1 + \\sin 2\\theta)} = \\dfrac{3/2}{1 + \\sin 2\\theta}$: $A = \\dfrac32$", mk: "M1 A1" }
      ], result: "$A = \\frac32$" } },
    { worked: { tag: "exam", title: "$f(x) = 10e^{-0.25x}\\sin x$: turning points satisfy $\\tan x = 4$", src: "A-level June 2019 · P1 Q12(a) · 4 marks",
      q: "Show that the $x$-coordinates of the turning points of $y = 10e^{-0.25x}\\sin x$ satisfy $\\tan x = 4$.",
      steps: [
        { m: "$f'(x) = -2.5e^{-0.25x}\\sin x + 10e^{-0.25x}\\cos x = 2.5e^{-0.25x}(4\\cos x - \\sin x)$", mk: "M1 A1 A1" },
        { m: "$e^{-0.25x} \\ne 0$, so $4\\cos x = \\sin x \\Rightarrow \\tan x = 4$", mk: "A1*", n: "The exponential factor never vanishes — say so before dividing by it." }
      ], result: "shown" } },

    { page: "Connected rates and inverse functions" },
    { callout: { t: "memorise", h: "Connected rates of change", body: [
      "$$\\dfrac{dV}{dt} = \\dfrac{dV}{dr} \\cdot \\dfrac{dr}{dt}$$ — the chain rule with time. Know one rate and the geometric link; find the other.",
      "**Inverse functions**: $\\frac{dy}{dx} = \\frac{1}{dx/dy}$. For $x = \\sin y$: $\\frac{dx}{dy} = \\cos y$, so $\\frac{dy}{dx} = \\frac{1}{\\cos y} = \\frac{1}{\\sqrt{1 - x^2}}$."
    ] } },
    { worked: { tag: "exam", title: "Hemispherical bowl filling: rate of change of depth", src: "A-level Specimen · P2 Q8 · 7 marks",
      q: "Water flows into a hemispherical bowl; when the depth is $h$ cm the volume is $V = \\frac13\\pi h^2(75 - h)$, $0 \\le h \\le 24$. **(a)** Water flows in at $160\\pi$ cm$^3$/s for $0 \\le h \\le 12$. Find the rate of change of depth when $h = 10$. **(b)** For $12 < h \\le 24$ the flow is $300\\pi$ cm$^3$/s. Find the rate of change of depth when $h = 20$.",
      steps: [
        { h: "(a) $\\frac{dV}{dh}$, then the chain rule", m: "$V = 25\\pi h^2 - \\dfrac{\\pi h^3}{3} \\Rightarrow \\dfrac{dV}{dh} = 50\\pi h - \\pi h^2$\n$\\dfrac{dh}{dt} = \\dfrac{dV/dt}{dV/dh} = \\dfrac{160\\pi}{50\\pi h - \\pi h^2}$; at $h = 10$: $\\dfrac{160}{500 - 100} = 0.4$ cm/s", mk: "M1 A1 M1 M1 A1" },
        { h: "(b)", m: "$\\dfrac{300\\pi}{1000\\pi - 400\\pi} = 0.5$ cm/s", mk: "M1 A1" }
      ], result: "(a) 0.4 cm/s (b) 0.5 cm/s" } },
    { worked: { tag: "exam", title: "Inverse function: $x = 4\\sin 2y$ — gradient at the origin, and $\\frac{dy}{dx}$ in terms of $x$", src: "A-level June 2019 · P1 Q14 · 7 marks",
      q: "$C$: $x = 4\\sin 2y$, $-\\frac{\\pi}{4} < y < \\frac{\\pi}{4}$, passes through $O$. **(a)** Find $\\frac{dy}{dx}$ at the origin. **(b)(i)** Use the small angle approximation for $\\sin 2y$ to find an equation linking $x$ and $y$ near $O$. **(ii)** Explain the relationship between (a) and (b)(i). **(c)** Show that for all points on $C$, $\\frac{dy}{dx} = \\frac{1}{a\\sqrt{b - x^2}}$.",
      steps: [
        { h: "(a)", m: "$\\dfrac{dx}{dy} = 8\\cos 2y = 8$ at $y = 0$, so $\\dfrac{dy}{dx} = \\dfrac18$", mk: "M1 A1" },
        { h: "(b)", m: "(i) $x \\approx 4(2y) = 8y$, i.e. $y \\approx \\dfrac{x}{8}$. (ii) This line has gradient $\\frac18$ — it is the tangent at $O$, whose gradient is $\\frac{dy}{dx}$ there.", mk: "B1 B1" },
        { h: "(c) Write $\\cos 2y$ in terms of $x$", m: "$\\dfrac{dy}{dx} = \\dfrac{1}{8\\cos 2y} = \\dfrac{1}{8\\sqrt{1 - \\sin^2 2y}} = \\dfrac{1}{8\\sqrt{1 - x^2/16}} = \\dfrac{1}{2\\sqrt{16 - x^2}}$", mk: "M1 M1 A1", n: "$\\cos 2y > 0$ on the given range, so the positive root is right. $a = 2$, $b = 16$." }
      ], result: "(a) $\\frac18$ (c) $a = 2$, $b = 16$" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Quotient rule order**: $u'v - uv'$ — the derivative of the **top** comes first.",
      "**Chain rule missed** on the inner function ($\\ln(x^2 + 1) \\to \\frac{1}{x^2 + 1}$ without the $2x$).",
      "**Using the quotient rule when the fraction simplifies** ($\\frac{2x^4}{x}$, $\\frac{x - 4}{2 + \\sqrt x}$).",
      "**Not factorising the derivative** before setting it to zero: $e^{-2x}$, $e^{3x}$ factors are never zero.",
      "**Connected rates**: $\\frac{dV}{dt}$ vs $\\frac{dV}{dh}$ confused; units missing.",
      "**Inverse**: $\\frac{dy}{dx}$ is $1 \\div \\frac{dx}{dy}$, not $\\frac{dx}{dy}$ itself."
    ] },
    { callout: { t: "mnemonic", h: "\"Low d-high minus high d-low, over low squared\"", body: "The quotient rule in rhythm: $\\frac{v\\,u' - u\\,v'}{v^2}$." } },
    { callout: { t: "mnemonic", h: "\"Outside, keep the inside, times inside's derivative\"", body: "The chain rule as three movements: $\\frac{d}{dx}(\\ldots)^n = n(\\ldots)^{n-1} \\times (\\ldots)'$." } }
  ],
  flashcards: [
    ["Product rule?", "$(uv)' = u'v + uv'$."],
    ["Quotient rule?", "$\\left(\\frac uv\\right)' = \\frac{u'v - uv'}{v^2}$ (in the booklet)."],
    ["Chain rule?", "$\\frac{dy}{dx} = \\frac{dy}{du}\\cdot\\frac{du}{dx}$: outside derivative × inside derivative."],
    ["$\\frac{d}{dx}(\\cos^2 x) = $?", "$-2\\cos x\\sin x = -\\sin 2x$."],
    ["$\\frac{d}{dx}\\left(\\frac{5x^2 + 10x}{(x+1)^2}\\right) = $?", "$\\frac{10}{(x+1)^3}$."],
    ["$f = \\frac{2x - 3}{x^2 + 4}$: numerator of $f'$?", "$-2x^2 + 6x + 8$."],
    ["$\\frac{d}{dx}(\\sec x)$, $(\\text{cosec}\\,x)$, $(\\cot x)$?", "$\\sec x\\tan x$; $-\\text{cosec}\\,x\\cot x$; $-\\text{cosec}^2 x$."],
    ["Connected rates formula?", "$\\frac{dV}{dt} = \\frac{dV}{dr}\\cdot\\frac{dr}{dt}$."],
    ["$x = \\sin y$: $\\frac{dy}{dx}$?", "$\\frac{1}{\\cos y} = \\frac{1}{\\sqrt{1 - x^2}}$."],
    ["$y = 10e^{-0.25x}\\sin x$: turning points satisfy…", "$\\tan x = 4$."],
    ["$\\frac{x - 4}{2 + \\sqrt x}$ simplifies to…", "$\\sqrt x - 2$ (difference of two squares) — derivative $\\frac{1}{2\\sqrt x}$."]
  ],
  quiz: [
    { q: "$\\frac{d}{dx}(x e^{x}) =$", opts: ["$e^x + xe^x$", "$e^x$", "$xe^x$", "$e^x - xe^x$"], ans: 0, why: "Product rule." },
    { q: "$\\frac{d}{dx}\\left(\\frac{x}{x+1}\\right) =$", opts: ["$\\tfrac{1}{(x+1)^2}$", "$\\tfrac{-1}{(x+1)^2}$", "$\\tfrac{2x+1}{(x+1)^2}$", "$1$"], ans: 0, why: "$\\frac{(x+1) - x}{(x+1)^2}$." },
    { q: "$\\frac{d}{dx}(\\sin^3 x) =$", opts: ["$3\\sin^2 x\\cos x$", "$3\\cos^2 x$", "$\\sin^2 x\\cos x$", "$3\\sin^2 x$"], ans: 0, why: "Chain rule." },
    { q: "$\\frac{d}{dx}\\ln(3x^2 + 1) =$", opts: ["$\\tfrac{6x}{3x^2+1}$", "$\\tfrac{1}{3x^2+1}$", "$\\tfrac{6x}{3x^2}$", "$6x\\ln(3x^2+1)$"], ans: 0, why: "Inside derivative $6x$." },
    { q: "$V = \\frac43\\pi r^3$, $\\frac{dr}{dt} = 2$: $\\frac{dV}{dt} =$", opts: ["$8\\pi r^2$", "$4\\pi r^2$", "$\\tfrac83\\pi r^3$", "$2$"], ans: 0, why: "$4\\pi r^2 \\times 2$." },
    { q: "If $\\frac{dx}{dy} = 3y^2$ then $\\frac{dy}{dx} =$", opts: ["$\\tfrac{1}{3y^2}$", "$3y^2$", "$6y$", "$\\tfrac{1}{6y}$"], ans: 0, why: "Reciprocal." }
  ]
};

/* =====================================================================
   7.5  Implicit and parametric differentiation
   ===================================================================== */
C["maths:7.5"] = {
  notes: [
    { h: "Implicit and parametric differentiation — the whole topic on one page" },
    { callout: { t: "memorise", h: "Implicit: differentiate every term with respect to $x$, treating $y$ as a function of $x$", body: [
      "$\\frac{d}{dx}(y^2) = 2y\\frac{dy}{dx}$ (chain rule); $\\frac{d}{dx}(xy) = y + x\\frac{dy}{dx}$ (product rule); $\\frac{d}{dx}(\\tan y) = \\sec^2 y\\frac{dy}{dx}$; $\\frac{d}{dx}(x^2\\tan y) = 2x\\tan y + x^2\\sec^2 y\\frac{dy}{dx}$.",
      "Then **collect** the $\\frac{dy}{dx}$ terms on one side, factorise, divide. The answer is normally in terms of $x$ **and** $y$.",
      "**Parametric**: $\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}$ (7.4 / 3.3)."
    ] } },
    { table: { head: ["Ask", "Do"], rows: [
      ["tangent / normal at $(a, b)$", "find $\\frac{dy}{dx}$, substitute **both** $a$ and $b$, then the line"],
      ["tangent parallel to the $x$-axis", "numerator of $\\frac{dy}{dx}$ $= 0$, combined with the curve's equation"],
      ["tangent parallel to the $y$-axis / furthest east or west", "denominator of $\\frac{dy}{dx}$ $= 0$ (i.e. $\\frac{dx}{dy} = 0$), with the curve"],
      ["unknown constants from a given normal", "substitute the point into the curve; substitute into $\\frac{dy}{dx}$ equated to the tangent gradient; solve simultaneously"],
      ["prove the normal never meets the curve again", "substitute the line into the curve; show the resulting equation has only the known root (factor it out, discriminant)"]
    ] } },

    { page: "Implicit curves" },
    { worked: { tag: "exam", title: "Show $\\frac{dy}{dx}$; the furthest-west point of a cycle track", src: "A-level June 2018 · P1 Q9 · 10 marks",
      q: "$x^2 - 2xy + 3y^2 = 50$ models a cycle track (km). **(a)** Show that $\\frac{dy}{dx} = \\frac{y - x}{3y - x}$. **(b)** Find the exact coordinates of $P$, the point furthest west. **(c)** Explain briefly how to find the point furthest north.",
      steps: [
        { h: "(a) Differentiate term by term", m: "$2x - 2y - 2x\\dfrac{dy}{dx} + 6y\\dfrac{dy}{dx} = 0 \\Rightarrow \\dfrac{dy}{dx}(6y - 2x) = 2y - 2x \\Rightarrow \\dfrac{dy}{dx} = \\dfrac{y - x}{3y - x}$", mk: "M1 A1 M1 A1*", n: "$-2xy$ needs the product rule: $-2y - 2x\\frac{dy}{dx}$." },
        { h: "(b) Furthest west: tangent vertical, so the denominator is zero", m: "$3y - x = 0 \\Rightarrow x = 3y$. Substitute: $9y^2 - 6y^2 + 3y^2 = 50 \\Rightarrow y^2 = \\dfrac{25}{3} \\Rightarrow y = \\pm\\dfrac{5}{\\sqrt3}$", mk: "M1 A1 M1 A1" },
        { m: "West means the smaller $x$: $y = -\\dfrac{5}{\\sqrt3}$, $x = -\\dfrac{15}{\\sqrt3} = -5\\sqrt3$. $P\\left(-5\\sqrt3, -\\dfrac{5\\sqrt3}{3}\\right)$", mk: "A1" },
        { h: "(c)", m: "Set the numerator to zero ($y = x$, tangent horizontal), substitute into the curve, take the larger $y$.", mk: "B1" }
      ], result: "(b) $P(-5\\sqrt3, -\\frac{5\\sqrt3}{3})$" } },
    { worked: { tag: "exam", title: "Normal at a point on $x^3 + 2xy + 3y^2 = 47$", src: "A-level June 2023 · P2 Q7 · 7 marks",
      q: "**(a)** Find $\\frac{dy}{dx}$ in terms of $x$ and $y$ for $x^3 + 2xy + 3y^2 = 47$. **(b)** $P(-2, 5)$ lies on the curve. Find the normal at $P$ in the form $ax + by + c = 0$ with integers.",
      steps: [
        { h: "(a)", m: "$3x^2 + 2y + 2x\\dfrac{dy}{dx} + 6y\\dfrac{dy}{dx} = 0 \\Rightarrow \\dfrac{dy}{dx} = -\\dfrac{3x^2 + 2y}{2x + 6y}$", mk: "M1 A1 M1 A1" },
        { h: "(b)", m: "At $(-2, 5)$: $-\\dfrac{12 + 10}{-4 + 30} = -\\dfrac{11}{13}$; normal gradient $\\dfrac{13}{11}$: $y - 5 = \\dfrac{13}{11}(x + 2) \\Rightarrow 13x - 11y + 81 = 0$", mk: "M1 M1 A1" }
      ], result: "(a) $-\\frac{3x^2 + 2y}{2x + 6y}$ (b) $13x - 11y + 81 = 0$" } },
    { worked: { tag: "exam", title: "Unknown $p$, $q$ from a point and its normal", src: "A-level Oct 2021 · P2 Q8 · 9 marks",
      q: "$px^3 + qxy + 3y^2 = 26$. **(a)** Show that $\\frac{dy}{dx} = \\frac{apx^2 + bqy}{qx + cy}$ with integers $a$, $b$, $c$. **(b)** $P(-1, -4)$ lies on the curve and the normal at $P$ is $19x + 26y + 123 = 0$. Find $p$ and $q$.",
      steps: [
        { h: "(a)", m: "$3px^2 + qy + qx\\dfrac{dy}{dx} + 6y\\dfrac{dy}{dx} = 0 \\Rightarrow \\dfrac{dy}{dx} = \\dfrac{-3px^2 - qy}{qx + 6y}$: $a = -3$, $b = -1$, $c = 6$", mk: "M1 A1 M1 A1" },
        { h: "(b) Two equations: the point is on the curve; the gradient matches", m: "On the curve: $-p + 4q + 48 = 26 \\Rightarrow p = 4q + 22$\nNormal gradient $-\\dfrac{19}{26}$, so tangent gradient $\\dfrac{26}{19}$: $\\dfrac{-3p + 4q}{-q - 24} = \\dfrac{26}{19} \\Rightarrow 19(3p - 4q) = 26(q + 24)$", mk: "M1 A1 M1" },
        { m: "$57p - 76q = 26q + 624$; with $p = 4q + 22$: $228q + 1254 - 102q = 624 \\Rightarrow q = -5$, $p = 2$", mk: "A1 A1" }
      ], result: "$p = 2$, $q = -5$" } },
    { worked: { tag: "exam", title: "Prove the normal does not meet the curve again", src: "A-level June 2024 · P2 Q15 · 12 marks",
      q: "$(x + y)^3 = 3x^2 - 3y - 2$. **(a)** Find $\\frac{dy}{dx}$ in terms of $x$ and $y$. **(b)** Show that the normal at $P(1, 0)$ is $y = -2x + 2$. **(c)** Prove that this normal does not meet $C$ again.",
      steps: [
        { h: "(a)", m: "$3(x + y)^2\\left(1 + \\dfrac{dy}{dx}\\right) = 6x - 3\\dfrac{dy}{dx} \\Rightarrow \\dfrac{dy}{dx}\\left[3(x + y)^2 + 3\\right] = 6x - 3(x + y)^2 \\Rightarrow \\dfrac{dy}{dx} = \\dfrac{2x - (x + y)^2}{(x + y)^2 + 1}$", mk: "M1 A1 M1 A1 A1", n: "Chain rule on $(x + y)^3$: the inside differentiates to $1 + \\frac{dy}{dx}$." },
        { h: "(b)", m: "At $(1, 0)$: $\\dfrac{2 - 1}{1 + 1} = \\dfrac12$; normal gradient $-2$: $y = -2(x - 1) = -2x + 2$", mk: "M1 A1*" },
        { h: "(c) Substitute $y = 2 - 2x$ into $C$", m: "$(x + 2 - 2x)^3 = 3x^2 - 3(2 - 2x) - 2 \\Rightarrow (2 - x)^3 = 3x^2 + 6x - 8$\n$8 - 12x + 6x^2 - x^3 = 3x^2 + 6x - 8 \\Rightarrow x^3 - 3x^2 + 18x - 16 = 0$", mk: "M1 A1" },
        { m: "$x = 1$ is a root (the point $P$): $(x - 1)(x^2 - 2x + 16) = 0$. The quadratic has discriminant $4 - 64 < 0$, so no other real root — the normal meets $C$ only at $P$.", mk: "M1 A1 A1", n: "Factor out the known root, then a discriminant argument. \"Make your reasoning clear\" = write the discriminant and its sign." }
      ], result: "(a) $\\frac{2x - (x+y)^2}{(x+y)^2 + 1}$ (c) only real root $x = 1$" } },
    { worked: { tag: "exam", title: "$x^2\\tan y = 9$: show $\\frac{dy}{dx}$ in terms of $x$; prove an inflection", src: "A-level Oct 2020 · P1 Q15 · 7 marks",
      q: "$x^2\\tan y = 9$, $0 < y < \\frac{\\pi}{2}$. **(a)** Show that $\\frac{dy}{dx} = \\frac{-18x}{x^4 + 81}$. **(b)** Prove that $C$ has a point of inflection at $x = \\sqrt[4]{27}$.",
      steps: [
        { h: "(a) Implicit, then eliminate $y$", m: "$2x\\tan y + x^2\\sec^2 y\\dfrac{dy}{dx} = 0 \\Rightarrow \\dfrac{dy}{dx} = -\\dfrac{2\\tan y}{x\\sec^2 y}$\n$\\tan y = \\dfrac{9}{x^2}$ and $\\sec^2 y = 1 + \\tan^2 y = \\dfrac{x^4 + 81}{x^4}$, so $\\dfrac{dy}{dx} = -\\dfrac{2 \\cdot 9/x^2}{x(x^4 + 81)/x^4} = \\dfrac{-18x}{x^4 + 81}$", mk: "M1 A1 M1 A1*", n: "Getting rid of $y$ needs $\\sec^2 = 1 + \\tan^2$." },
        { h: "(b) Second derivative changes sign", m: "$\\dfrac{d^2y}{dx^2} = \\dfrac{-18(x^4 + 81) + 18x \\cdot 4x^3}{(x^4 + 81)^2} = \\dfrac{54(x^4 - 27)}{(x^4 + 81)^2}$", mk: "M1 A1" },
        { m: "Zero at $x^4 = 27$; negative for $x < \\sqrt[4]{27}$ and positive after (the denominator is always positive). The sign changes, so it is a point of inflection.", mk: "A1", n: "The sign change is the proof — not merely $f'' = 0$." }
      ], result: "shown" } },
    { worked: { tag: "exam", title: "$y = x^x$: take logs first", src: "A-level June 2019 · P2 Q11(a) · 5 marks",
      q: "Find, by first taking logarithms, the $x$-coordinate of the turning point of $y = x^x$, $x > 0$.",
      steps: [
        { m: "$\\ln y = x\\ln x$; differentiate implicitly: $\\dfrac1y\\dfrac{dy}{dx} = \\ln x + 1$", mk: "M1 M1 A1", n: "Product rule on $x\\ln x$; chain rule on $\\ln y$." },
        { m: "$\\dfrac{dy}{dx} = x^x(1 + \\ln x) = 0 \\Rightarrow \\ln x = -1 \\Rightarrow x = e^{-1}$", mk: "M1 A1", n: "$x^x > 0$, so only the bracket can vanish." }
      ], result: "$x = \\frac1e$" } },
    { worked: { tag: "exam", title: "Tangent parallel to the $x$-axis on $\\sin x + \\cos y = 0.5$", src: "A-level Specimen · P2 Q12 · 7 marks",
      q: "$\\sin x + \\cos y = 0.5$, $-\\frac{\\pi}{2} \\le x < \\frac{3\\pi}{2}$, $-\\pi < y < \\pi$. Find the exact coordinates of all points $P$ where the tangent is parallel to the $x$-axis.",
      steps: [
        { m: "$\\cos x - \\sin y\\dfrac{dy}{dx} = 0 \\Rightarrow \\dfrac{dy}{dx} = \\dfrac{\\cos x}{\\sin y}$; horizontal tangent: $\\cos x = 0 \\Rightarrow x = \\dfrac{\\pi}{2}$ (in range)", mk: "M1 A1 M1", n: "Also need $\\sin y \\ne 0$." },
        { m: "$x = \\dfrac{\\pi}{2}$: $1 + \\cos y = 0.5 \\Rightarrow \\cos y = -\\dfrac12 \\Rightarrow y = \\pm\\dfrac{2\\pi}{3}$", mk: "M1 A1" },
        { m: "$P\\left(\\dfrac{\\pi}{2}, \\dfrac{2\\pi}{3}\\right)$ and $P\\left(\\dfrac{\\pi}{2}, -\\dfrac{2\\pi}{3}\\right)$. ($x = -\\frac{\\pi}{2}$ gives $\\cos y = 1.5$: impossible.)", mk: "A1 A1", n: "Every candidate $x$ must be tested in the curve's equation." }
      ], result: "$\\left(\\frac{\\pi}{2}, \\pm\\frac{2\\pi}{3}\\right)$" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Forgetting $\\frac{dy}{dx}$** after differentiating a $y$ term.",
      "**Product rule on $xy$** — two terms.",
      "**Substituting only $x$** into $\\frac{dy}{dx}$ when it also contains $y$.",
      "**Vertical vs horizontal tangent**: denominator zero vs numerator zero.",
      "**Not eliminating $y$** when the question asks for $\\frac{dy}{dx}$ in terms of $x$ only.",
      "**Parametric**: dividing the wrong way ($\\frac{dx/dt}{dy/dt}$)."
    ] },
    { callout: { t: "mnemonic", h: "\"Every $y$ term earns a $\\frac{dy}{dx}$\"", body: "Differentiate as normal, then tag each $y$-derivative with $\\frac{dy}{dx}$; collect, factorise, divide." } }
  ],
  flashcards: [
    ["$\\frac{d}{dx}(y^2)$ and $\\frac{d}{dx}(xy)$?", "$2y\\frac{dy}{dx}$; $y + x\\frac{dy}{dx}$."],
    ["$x^2 - 2xy + 3y^2 = 50$: $\\frac{dy}{dx}$?", "$\\frac{y - x}{3y - x}$."],
    ["Furthest west point on an implicit curve: condition?", "$\\frac{dx}{dy} = 0$ — the denominator of $\\frac{dy}{dx}$ is zero."],
    ["Horizontal tangent: condition?", "Numerator of $\\frac{dy}{dx}$ is zero (and denominator non-zero)."],
    ["Turning point of $y = x^x$?", "$\\ln y = x\\ln x$; $y' = x^x(1 + \\ln x) = 0$; $x = e^{-1}$."],
    ["$\\frac{d}{dx}(x^2\\tan y)$?", "$2x\\tan y + x^2\\sec^2 y\\frac{dy}{dx}$."],
    ["Prove a normal meets the curve only at $P$: method?", "Substitute the line, factor out the known root, show the remaining factor has no real roots."],
    ["$\\frac{dy}{dx}$ for a parametric curve?", "$\\frac{dy/dt}{dx/dt}$."]
  ],
  quiz: [
    { q: "$\\frac{d}{dx}(3y^2) =$", opts: ["$6y\\frac{dy}{dx}$", "$6y$", "$3y\\frac{dy}{dx}$", "$6\\frac{dy}{dx}$"], ans: 0, why: "Chain rule." },
    { q: "For $x^2 + y^2 = 25$, $\\frac{dy}{dx} =$", opts: ["$-\\tfrac xy$", "$\\tfrac xy$", "$-\\tfrac yx$", "$2x + 2y$"], ans: 0, why: "$2x + 2yy' = 0$." },
    { q: "Vertical tangent on $x^2 + xy + y^2 = 7$ where", opts: ["$x + 2y = 0$", "$2x + y = 0$", "$x = 0$", "$y = 0$"], ans: 0, why: "Denominator $x + 2y$." },
    { q: "$\\ln y = x\\ln x$ differentiates to", opts: ["$\\tfrac{y'}{y} = \\ln x + 1$", "$y' = \\ln x + 1$", "$\\tfrac{y'}{y} = \\tfrac1x$", "$y' = x^{x-1}$"], ans: 0, why: "Chain and product rules." },
    { q: "Normal at $(1, 0)$ with $\\frac{dy}{dx} = \\frac12$:", opts: ["$y = -2x + 2$", "$y = \\tfrac12 x - \\tfrac12$", "$y = 2x - 2$", "$y = -\\tfrac12 x + \\tfrac12$"], ans: 0, why: "Gradient $-2$ through $(1, 0)$." }
  ]
};

/* =====================================================================
   7.6  Constructing differential equations
   ===================================================================== */
C["maths:7.6"] = {
  notes: [
    { h: "Setting up a differential equation — the whole topic on one page" },
    "A differential equation is a sentence about a **rate**. \"The rate of decrease of the radius is inversely proportional to the square of the radius\" is $\\frac{dr}{dt} = -\\frac{k}{r^2}$. The skill is translation; solving is 8.7.",
    { callout: { t: "memorise", h: "Translation table", body: [
      "\"rate of change of $N$\" → $\\frac{dN}{dt}$; \"rate of **decrease**\" → $-\\frac{dN}{dt}$ (or write $\\frac{dN}{dt} = -\\ldots$).",
      "\"proportional to $N$\" → $= kN$; \"inversely proportional to $r^2$\" → $= \\frac{k}{r^2}$; \"proportional to the difference between $\\theta$ and $20$\" → $= k(\\theta - 20)$.",
      "$k > 0$ is a positive constant; put the sign of the physics in front of it.",
      "**Geometric links**: if the story gives $\\frac{dV}{dt}$ but asks about $r$, use $\\frac{dV}{dt} = \\frac{dV}{dr}\\frac{dr}{dt}$ (7.4) to convert."
    ] } },
    { table: { head: ["Sentence", "Differential equation"], rows: [
      ["population grows at a rate proportional to its size", "$\\frac{dP}{dt} = kP$"],
      ["a body cools at a rate proportional to its excess temperature over the room ($20°$)", "$\\frac{d\\theta}{dt} = -k(\\theta - 20)$"],
      ["a mint's radius decreases at a rate inversely proportional to $r^2$", "$\\frac{dr}{dt} = -\\frac{k}{r^2}$"],
      ["the volume of a balloon decreases at a constant rate", "$\\frac{dV}{dt} = -c$, hence (with $V = \\frac43\\pi r^3$) $\\frac{dr}{dt} = -\\frac{k}{r^2}$"],
      ["the radius increases at a rate inversely proportional to $\\sqrt r$", "$\\frac{dr}{dt} = \\frac{k}{\\sqrt r}$"],
      ["demand $D$ falls at a rate proportional to the price $p$… as $p$ rises", "$\\frac{dD}{dp} = -kp$"],
      ["velocity is proportional to displacement", "$\\frac{dx}{dt} = kx$"]
    ] } },

    { page: "Building the equation from geometry" },
    { worked: { tag: "exam", title: "Deflating balloon: constant volume rate → $\\frac{dr}{dt} = -\\frac{k}{r^2}$; solve; validity", src: "A-level Oct 2020 · P1 Q14 · 10 marks",
      q: "A spherical balloon deflates; its volume decreases at a constant rate. **(a)** Show that $\\frac{dr}{dt} = -\\frac{k}{r^2}$, $k > 0$. The initial radius is 40 cm and after 5 seconds it is 20 cm; the volume keeps decreasing at the same rate until the balloon is empty. **(b)** Solve the differential equation to find $r$ in terms of $t$. **(c)** Find the limitation on $t$ for which the equation in (b) is valid.",
      steps: [
        { h: "(a) Constant volume rate, chain rule", m: "$\\dfrac{dV}{dt} = -c$ and $V = \\dfrac43\\pi r^3 \\Rightarrow \\dfrac{dV}{dt} = 4\\pi r^2\\dfrac{dr}{dt}$, so $4\\pi r^2\\dfrac{dr}{dt} = -c \\Rightarrow \\dfrac{dr}{dt} = -\\dfrac{c}{4\\pi r^2} = -\\dfrac{k}{r^2}$", mk: "B1 M1 A1*", n: "$k = \\frac{c}{4\\pi}$ — a positive constant." },
        { h: "(b) Separate and integrate (8.7)", m: "$r^2\\,dr = -k\\,dt \\Rightarrow \\dfrac{r^3}{3} = -kt + C$\n$t = 0, r = 40$: $C = \\dfrac{64\\,000}{3}$; $t = 5, r = 20$: $\\dfrac{8000}{3} = -5k + \\dfrac{64\\,000}{3} \\Rightarrow k = \\dfrac{11\\,200}{3}$", mk: "M1 A1 M1 A1" },
        { m: "$r^3 = 64\\,000 - 11\\,200t \\Rightarrow r = \\sqrt[3]{64\\,000 - 11\\,200t}$", mk: "A1" },
        { h: "(c) The balloon is empty when $r = 0$", m: "$64\\,000 - 11\\,200t \\ge 0 \\Rightarrow 0 \\le t \\le \\dfrac{40}{7} \\approx 5.71$ s", mk: "M1 A1" }
      ], result: "(b) $r = \\sqrt[3]{64000 - 11200t}$ (c) $0 \\le t \\le \\frac{40}{7}$" } },
    { worked: { tag: "exam", title: "Inflating balloon: $\\frac{dr}{dt} = \\frac{k}{\\sqrt r}$; show $r^{3/2} = 5.4t + 10$", src: "A-level June 2024 · P1 Q14 · 9 marks",
      q: "A spherical balloon is inflated so that the rate of increase of its radius is inversely proportional to the square root of the radius. **(a)** Write down a differential equation for $r$. At $t = 10$ s the radius is 16 cm and increasing at $0.9$ cm/s. **(b)** Solve the differential equation to show that $r^{3/2} = 5.4t + 10$. **(c)** Find the radius when $t = 20$, to the nearest mm. **(d)** Suggest a limitation of the model.",
      steps: [
        { h: "(a)", m: "$\\dfrac{dr}{dt} = \\dfrac{k}{\\sqrt r}$, $k > 0$", mk: "B1" },
        { h: "(b) Find $k$ from the rate condition, then separate", m: "$0.9 = \\dfrac{k}{4} \\Rightarrow k = 3.6$\n$\\sqrt r\\,dr = 3.6\\,dt \\Rightarrow \\dfrac23 r^{3/2} = 3.6t + C$; at $t = 10$, $r = 16$: $\\dfrac23 \\cdot 64 = 36 + C \\Rightarrow C = \\dfrac{20}{3}$", mk: "M1 A1 M1 A1 A1", n: "Two conditions at $t = 10$: one for $k$ (the rate), one for $C$ (the value)." },
        { m: "$r^{3/2} = \\dfrac32(3.6t + \\tfrac{20}{3}) = 5.4t + 10$", mk: "A1*" },
        { h: "(c)", m: "$r^{3/2} = 118 \\Rightarrow r = 118^{2/3} = 24.1$ cm $= 241$ mm", mk: "M1 A1" },
        { h: "(d)", m: "The balloon will burst — the radius cannot keep growing; or the balloon is not a perfect sphere.", mk: "B1" }
      ], result: "(a) $\\frac{dr}{dt} = \\frac{k}{\\sqrt r}$ (c) 241 mm" } },
    { worked: { tag: "exam", title: "From a scientist's statement to $p = ae^{kt}$", src: "A-level Specimen · P2 Q7(a) · 4 marks",
      q: "A bacterial culture has area $p$ mm$^2$ at time $t$ hours. A scientist states that the rate of increase of the area can be modelled as proportional to the area. Show that the scientist's model leads to $p = ae^{kt}$.",
      steps: [
        { m: "$\\dfrac{dp}{dt} = kp \\Rightarrow \\int\\dfrac{1}{p}\\,dp = \\int k\\,dt \\Rightarrow \\ln p = kt + c$", mk: "B1 M1 A1" },
        { m: "$p = e^{kt + c} = e^c e^{kt} = ae^{kt}$ with $a = e^c$", mk: "A1*", n: "The constant of integration becomes the multiplying constant — say $a = e^c$ explicitly." }
      ], result: "shown" } },
    { worked: { tag: "example", title: "Newton's law of cooling as a differential equation", src: "standard",
      q: "A cup of tea at $\\theta$ °C in a room at $20$ °C cools at a rate proportional to the difference between its temperature and the room's. Write a differential equation and state the sign of the constant.",
      steps: [
        { m: "$\\dfrac{d\\theta}{dt} = -k(\\theta - 20)$, $k > 0$", n: "When $\\theta > 20$ the tea is cooling, so $\\frac{d\\theta}{dt}$ must be negative — hence the minus. Solving (8.7) gives $\\theta = 20 + Ae^{-kt}$, the model of 6.7." }
      ], result: "$\\frac{d\\theta}{dt} = -k(\\theta - 20)$" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Sign of the rate**: \"decrease\" needs a minus sign somewhere (either on $\\frac{d}{dt}$ or on $k$) — and $k$ stated positive.",
      "**Proportional vs inversely proportional**: $kr^2$ vs $\\frac{k}{r^2}$.",
      "**\"Show that\" from a volume rate**: the chain rule step $\\frac{dV}{dt} = \\frac{dV}{dr}\\frac{dr}{dt}$ must appear.",
      "**Two conditions**: a *rate* at a time fixes $k$; a *value* at a time fixes $C$.",
      "**Validity**: the solution only makes sense while the quantity is physically possible ($r \\ge 0$, $t$ before bursting)."
    ] },
    { callout: { t: "mnemonic", h: "\"Rate, sign, proportional, constant\"", body: "Write $\\frac{d\\square}{dt}$; put the sign the story needs; write the proportionality; name $k > 0$." } }
  ],
  flashcards: [
    ["\"Rate of decrease of $r$ is inversely proportional to $r^2$\" as a DE?", "$\\frac{dr}{dt} = -\\frac{k}{r^2}$, $k > 0$."],
    ["\"Cools at a rate proportional to the excess over 20 °C\"?", "$\\frac{d\\theta}{dt} = -k(\\theta - 20)$."],
    ["Constant rate of volume loss for a sphere gives which DE in $r$?", "$4\\pi r^2\\frac{dr}{dt} = -c$, so $\\frac{dr}{dt} = -\\frac{k}{r^2}$."],
    ["$\\frac{dp}{dt} = kp$ solves to…", "$p = ae^{kt}$ (from $\\ln p = kt + c$)."],
    ["\"Rate of increase of $r$ inversely proportional to $\\sqrt r$\"?", "$\\frac{dr}{dt} = \\frac{k}{\\sqrt r}$."],
    ["How is $k$ found in a DE model?", "From a given rate at a known value (e.g. $\\frac{dr}{dt} = 0.9$ when $r = 16$)."],
    ["Balloon $r^3 = 64000 - 11200t$: valid for…", "$0 \\le t \\le \\frac{40}{7}$ (until $r = 0$)."]
  ],
  quiz: [
    { q: "\"$N$ grows at a rate proportional to $N$\":", opts: ["$\\tfrac{dN}{dt} = kN$", "$\\tfrac{dN}{dt} = k$", "$N = kt$", "$\\tfrac{dN}{dt} = \\tfrac kN$"], ans: 0, why: "Proportional to $N$." },
    { q: "\"Decreases at a rate inversely proportional to $r^2$\":", opts: ["$\\tfrac{dr}{dt} = -\\tfrac{k}{r^2}$", "$\\tfrac{dr}{dt} = -kr^2$", "$\\tfrac{dr}{dt} = \\tfrac{k}{r^2}$", "$\\tfrac{dr}{dt} = -\\tfrac{k}{r}$"], ans: 0, why: "Inverse square, with a minus." },
    { q: "$V = \\frac43\\pi r^3$ and $\\frac{dV}{dt} = -c$ gives $\\frac{dr}{dt} =$", opts: ["$-\\tfrac{c}{4\\pi r^2}$", "$-c$", "$-4\\pi r^2 c$", "$-\\tfrac{c}{r^3}$"], ans: 0, why: "Divide by $\\frac{dV}{dr} = 4\\pi r^2$." },
    { q: "In $\\frac{dr}{dt} = \\frac{k}{\\sqrt r}$ with $\\frac{dr}{dt} = 0.9$ at $r = 16$, $k =$", opts: ["3.6", "0.225", "14.4", "0.9"], ans: 0, why: "$0.9 \\times 4$." },
    { q: "Solving $\\frac{d\\theta}{dt} = -k(\\theta - 20)$ gives", opts: ["$\\theta = 20 + Ae^{-kt}$", "$\\theta = 20e^{-kt}$", "$\\theta = Ae^{kt} - 20$", "$\\theta = 20 - kt$"], ans: 0, why: "Decay to the room temperature." }
  ]
};


/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
