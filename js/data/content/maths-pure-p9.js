/* Kurenai OS — deep content: Pure Mathematics, section P9 (Numerical methods)
   at full A-level depth. Same contract as maths-pure-p4.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* cobweb / staircase segments for x_{n+1} = g(x_n): vertical to the curve,
   horizontal to y = x, repeat. Pure authoring helper; the figure engine
   receives plain line items. */
function iterPath(g, x0, n, c) {
  var items = [], x = x0, i, y;
  for (i = 0; i < n; i++) {
    y = g(x);
    items.push({ line: [[x, i === 0 ? 0 : x], [x, y]], c: c || "accent2", arrow: true, w: 1.4 });
    items.push({ line: [[x, y], [y, y]], c: c || "accent2", arrow: true, w: 1.4 });
    x = y;
  }
  return items;
}

/* =====================================================================
   9.1  Change of sign — locating a root
   ===================================================================== */
C["maths:9.1"] = {
  notes: [
    { h: "Numerical methods — what they are for" },
    { p: "Most equations that appear in real problems cannot be solved exactly: $x = 2\\ln(8 - x)$, $x\\ln x + x = 8$, $t = 5\\ln\\frac{75}{5 + t}$. Numerical methods give a root **to any required accuracy** — and the exam tests that you know when a method works, when it fails and how to justify an answer." },
    { table: { head: ["Method", "What it needs", "What Edexcel asks", "Section"], rows: [
      ["Change of sign", "$f(x)$ continuous on $[a, b]$", "\"show that $\\alpha$ lies in $[a, b]$\"; \"show $\\alpha = 0.341$ to 3 d.p.\"", "9.1"],
      ["Fixed-point iteration $x_{n+1} = g(x_n)$", "a rearrangement $x = g(x)$", "\"show $\\alpha$ satisfies $x = g(x)$\"; find $x_2, x_4$; find $\\alpha$ to $k$ d.p.; staircase/cobweb", "9.2"],
      ["Newton–Raphson", "$f$ and $f'$", "\"apply once to obtain a second approximation\"; \"explain why it fails with $x_1 = 0$\"", "9.3"],
      ["Trapezium rule", "a table of $y$-values", "estimate an integral; over/under-estimate; deduce related integrals; find missing values", "9.4"],
      ["In context", "a model $v(t)$, $h(t)$…", "derive the iteration from $\\frac{dv}{dt} = 0$, iterate, interpret", "9.5"]
    ] } },
    { callout: { t: "tip", h: "Marks are for method and justification, not arithmetic", body: [
      "The calculator does the iterating. The marks are for **writing the right function**, **stating the sign change**, **stating continuity**, and giving the answer to the accuracy asked.",
      "\"Show that $\\alpha = 0.341$ to 3 d.p.\" is not answered by iterating — it needs an interval and a function (page 2)."
    ] } },

    { page: "The change-of-sign test" },
    { callout: { t: "def", h: "Location of a root by change of sign", body: [
      "If $f$ is **continuous** on $[a, b]$ and $f(a)$ and $f(b)$ have **opposite signs**, then $f(x) = 0$ has at least one root $\\alpha$ with $a < \\alpha < b$.",
      "Both conditions matter. Continuity rules out an asymptote; the sign change is what the examiner wants to see written down."
    ] } },
    { fig: { x: [-0.5, 5.5], y: [-3, 3], axes: { xt: [1, 2, 3, 4, 5], yt: [-2, 2] }, items: [
      { fn: "0.8*(x-3)^2-1.5", from: 0.3, to: 5.4, label: "y = f(x)", at: 5.2, pos: "n" },
      { pt: [1, 0], label: "a", pos: "s", c: "accent2" }, { pt: [2, 0], label: "b", pos: "s", c: "accent2" },
      { line: [[1, 0], [1, 1.7]], c: "accent2", dash: true }, { line: [[2, 0], [2, -0.7]], c: "accent2", dash: true },
      { pt: [1, 1.7], label: "f(a) > 0", pos: "e", c: "good" }, { pt: [2, -0.7], label: "f(b) < 0", pos: "e", c: "danger" },
      { pt: [1.631, 0], r: 3, c: "danger", label: "α", pos: "n" }
    ], cap: "A continuous curve that is above the axis at $a$ and below it at $b$ must cross the axis in between: $f(a) > 0$, $f(b) < 0$, so a root lies in $(a, b)$." } },
    { h: "How to write the standard 2-mark answer" },
    { ol: [
      "**State the function** you are testing, as $f(x) = \\ldots = 0$ form. If the equation is $2\\ln(8 - x) = x$, write $f(x) = 2\\ln(8 - x) - x$ (either sign is fine; be consistent).",
      "**Evaluate both ends** and write the values with their signs: $f(3) = 0.219\\ldots$, $f(4) = -1.227\\ldots$ (3 s.f. is enough; more is fine).",
      "**Conclude with both reasons**: \"change of sign **and** $f$ is continuous on $[3, 4]$, so $3 < \\alpha < 4$\"."
    ] },
    { callout: { t: "warn", h: "Where the second mark goes", body: [
      "A correct pair of values with no conclusion scores M1 only. The A1 needs the words *change of sign* (or *$f(3) > 0 > f(4)$*) **and** a mention of continuity, then the statement of the root.",
      "Writing \"$f(3) = 0.22$, $f(4) = -1.23$, so there is a root\" without the reasons is the classic dropped mark."
    ] } },
    { worked: { tag: "exam", title: "Show that $3 < \\alpha < 4$", src: "A-level June 2018 · P1 Q4(a) · 2 marks",
      q: "The curve $y = 2\\ln(8 - x)$ meets the line $y = x$ at a single point $x = \\alpha$. Show that $3 < \\alpha < 4$.",
      steps: [
        { h: "Choose the function", m: "$f(x) = 2\\ln(8 - x) - x$", n: "A root of $f(x) = 0$ is where the curve meets the line. Either $2\\ln(8 - x) - x$ or $x - 2\\ln(8 - x)$." },
        { h: "Evaluate at both ends", m: "$f(3) = 2\\ln 5 - 3 = 0.219\\ldots > 0$\n$f(4) = 2\\ln 4 - 4 = -1.227\\ldots < 0$", mk: "M1", n: "Both values shown with signs. A value alone is not enough." },
        { h: "Conclude", m: "Change of sign and $f$ is continuous on $[3, 4]$, so $3 < \\alpha < 4$.", mk: "A1", n: "The conclusion must state the sign change *and* the root lies in the interval." }
      ], result: "$3 < \\alpha < 4$" } },
    { worked: { tag: "exam", title: "Show $\\alpha$ lies in $[3.6, 3.7]$ (trig function, radians)", src: "A-level June 2024 · P1 Q3(a) · 2 marks",
      q: "$f(x) = x + \\tan\\left(\\frac12 x\\right)$, $\\pi < x < \\frac{3\\pi}{2}$. Given $f(x) = 0$ has a single root $\\alpha$, show that $\\alpha$ lies in the interval $[3.6, 3.7]$.",
      steps: [
        { h: "Radians!", m: "$f(3.6) = 3.6 + \\tan 1.8 = -0.686\\ldots$\n$f(3.7) = 3.7 + \\tan 1.85 = 0.212\\ldots$", mk: "M1", n: "The domain is in radians, so the calculator must be in radian mode. In degrees you get $3.6 + \\tan 1.8° = 3.63$: no sign change, no marks." },
        { h: "Conclude", m: "Change of sign, and $f$ is continuous on $[3.6, 3.7]$ (the asymptote of $\\tan\\frac{x}{2}$ is at $x = \\pi$, outside the interval), so $\\alpha \\in [3.6, 3.7]$.", mk: "A1", n: "With a $\\tan$ the continuity remark is worth making explicitly — that is exactly the failure case the examiner has in mind." }
      ], result: "$3.6 \\le \\alpha \\le 3.7$" } },
    { worked: { tag: "exam", title: "Explain why $\\alpha$ must lie in $[4, 5]$ when the values are given", src: "A-level June 2022 · P2 Q6(b) · 1 mark",
      q: "$f(x) = 8\\sin\\left(\\frac12 x\\right) - 3x + 9$, $x > 0$. Given that $f(4) = 4.274$ and $f(5) = -1.212$, explain why $\\alpha$ must lie in $[4, 5]$.",
      steps: [
        { m: "$f(4) > 0$ and $f(5) < 0$: there is a change of sign, and $f$ is continuous (a sum of $\\sin$ and a polynomial), so $f(x) = 0$ has a root in $[4, 5]$.", mk: "B1", n: "One mark, two ingredients. \"Change of sign\" alone was not accepted without the continuity/root statement." }
      ], result: "Root in $[4, 5]$" } },

    { page: "\"Show that α = 0.341 to 3 d.p.\"" },
    { p: "This is the same test in disguise. To prove a root is $0.341$ **to 3 decimal places** you must show it lies in the interval of numbers that round to $0.341$:" },
    { callout: { t: "memorise", h: "The interval that rounds to the answer", body: [
      "$\\alpha = 0.341$ (3 d.p.) $\\iff 0.3405 \\le \\alpha < 0.3415$.",
      "So test $f(0.3405)$ and $f(0.3415)$ — half a unit in the last place either side. Then: change of sign + continuous $\\Rightarrow$ root in $(0.3405, 0.3415)$ $\\Rightarrow \\alpha = 0.341$ to 3 d.p.",
      "For 2 d.p. of $3.54$: test $3.535$ and $3.545$. For 3 s.f. of $1.45$: $1.445$ and $1.455$."
    ] } },
    { callout: { t: "warn", h: "State the function — it is in the question for a reason", body: [
      "\"Using a suitable interval and a **suitable function that should be stated**\" means the iteration formula is *not* the function to test. You need $f(x) = 0$ form: if $\\alpha$ satisfies $2x^3 - 4x^2 + 7x - 2 = 0$, test $g(x) = 2x^3 - 4x^2 + 7x - 2$.",
      "If only the rearrangement $x = g(x)$ is available, test $h(x) = x - g(x)$ — a sign change in $h$ is a sign change in $x - g(x)$, which is what you need.",
      "Iterating further and saying \"it's converging to $0.341$\" scores nothing here."
    ] } },
    { worked: { tag: "exam", title: "Show $\\alpha = 0.341$ to 3 d.p.", src: "A-level Oct 2021 · P1 Q4(c) · 2 marks",
      q: "$\\alpha$ is the single turning point of $f(x) = x^2 + \\ln(2x^2 - 4x + 5)$ and satisfies $2x^3 - 4x^2 + 7x - 2 = 0$. Using a suitable interval and a suitable function that should be stated, show that $\\alpha = 0.341$ to 3 d.p.",
      steps: [
        { h: "Function and interval", m: "$g(x) = 2x^3 - 4x^2 + 7x - 2$; test $[0.3405, 0.3415]$", mk: "M1", n: "The function is the cubic from part (a), not the iteration. The interval is $\\pm 0.0005$ around $0.341$." },
        { h: "Evaluate", m: "$g(0.3405) = -0.00131\\ldots < 0$\n$g(0.3415) = 0.00366\\ldots > 0$", n: "Small numbers — keep 3 s.f. so the signs are visible." },
        { h: "Conclude", m: "Change of sign and $g$ is continuous, so $0.3405 < \\alpha < 0.3415$, hence $\\alpha = 0.341$ to 3 d.p.", mk: "A1", n: "The last clause — \"hence $0.341$ to 3 d.p.\" — is required; the interval alone is not the statement asked for." }
      ], result: "$\\alpha = 0.341$ (3 d.p.)" } },
    { worked: { tag: "exam", title: "Show $\\alpha = 0.432$ to 3 d.p. when only $x = g(x)$ is known", src: "A-level June 2023 · P1 Q15(e) · 2 marks",
      q: "The equation $x = \\frac{2e^{3x} - 4}{e^{3x} + 4}$ has two positive roots $\\alpha < \\beta$. Using a suitable interval and a suitable function that should be stated, show that $\\alpha = 0.432$ to 3 d.p.",
      steps: [
        { h: "Move everything to one side", m: "$h(x) = x - \\dfrac{2e^{3x} - 4}{e^{3x} + 4}$", mk: "M1", n: "Equivalent: $h(x) = x(e^{3x} + 4) - 2e^{3x} + 4$. Either is \"a suitable function\"." },
        { m: "$h(0.4315) = 0.000297\\ldots > 0$\n$h(0.4325) = -0.000948\\ldots < 0$", n: "Interval $[0.4315, 0.4325]$." },
        { m: "Sign change and $h$ continuous $\\Rightarrow 0.4315 < \\alpha < 0.4325 \\Rightarrow \\alpha = 0.432$ (3 d.p.)", mk: "A1" }
      ], result: "$\\alpha = 0.432$ (3 d.p.)" } },

    { page: "When the test fails" },
    { p: "The spec says explicitly: *understand how change of sign methods can fail.* Three pictures cover every exam question on this." },
    { fig: { x: [-0.5, 5], y: [-4, 4], axes: { xt: [1, 2, 3, 4], yt: [-2, 2] }, items: [
      { fn: "1/(x-2)", from: -0.4, to: 1.75, c: "accent" }, { fn: "1/(x-2)", from: 2.25, to: 4.9, c: "accent", label: "y = 1/(x − 2)", at: 4.9, pos: "n" },
      { vline: 2, c: "danger", label: "asymptote" },
      { pt: [1.5, -2], label: "f(1.5) < 0", pos: "w", c: "danger" }, { pt: [2.5, 2], label: "f(2.5) > 0", pos: "e", c: "good" }
    ], cap: "Failure 1 — discontinuity. $f(1.5) < 0 < f(2.5)$ is a change of sign, but there is no root in $[1.5, 2.5]$: the curve jumps across an asymptote at $x = 2$. This is why you always say \"and $f$ is continuous\"." } },
    { fig: { x: [-0.5, 5], y: [-2, 4], axes: { xt: [1, 2, 3, 4], yt: [2] }, items: [
      { fn: "(x-2)*(x-3)+0.0", from: -0.3, to: 4.9, label: "y = (x − 2)(x − 3)", at: 4.5, pos: "w" },
      { pt: [1, 2], label: "f(1) > 0", pos: "n", c: "good" }, { pt: [4, 2], label: "f(4) > 0", pos: "n", c: "good" },
      { pt: [2, 0], label: "root", pos: "s", c: "danger" }, { pt: [3, 0], label: "root", pos: "s", c: "danger" }
    ], cap: "Failure 2 — an even number of roots. $f(1) > 0$ and $f(4) > 0$: no sign change, yet two roots sit in $[1, 4]$. A too-wide interval can hide roots in pairs." } },
    { fig: { x: [-0.5, 5], y: [-2, 4], axes: { xt: [1, 2, 3, 4], yt: [2] }, items: [
      { fn: "(x-2.5)^2", from: -0.3, to: 4.6, label: "y = (x − 2.5)²", at: 4.4, pos: "w" },
      { pt: [2.5, 0], label: "repeated root — f touches, never changes sign", pos: "s", c: "danger" }
    ], cap: "Failure 3 — a repeated root. The curve touches the axis: $f \\ge 0$ everywhere, so no interval ever shows a sign change even though $x = 2.5$ is a root." } },
    { kv: [
      ["Change of sign but no root", "The function is not continuous on the interval (asymptote, e.g. $\\tan$, $\\frac{1}{x - a}$, $\\ln$ near its boundary)."],
      ["A root but no change of sign", "Even number of roots in the interval, or a repeated root (curve touches the axis)."],
      ["Interval too large", "Roots may pair up and cancel their sign changes. Use small intervals — hence the \"$\\pm 0.0005$\" convention."],
      ["\"Explain why only one root\" from a graph", "Show the equation as *curve = line* and argue the line crosses the curve once (June 2019 P1 Q2 on the next page)."]
    ] },
    { worked: { tag: "exam", title: "Explain from a diagram why there is only one root, then estimate it", src: "A-level June 2019 · P1 Q2 · 5 marks",
      q: "Figure 1 shows $y = \\cos x$ ($x$ in radians). **(a)** Use the diagram to show why $\\cos x - 2x - \\frac12 = 0$ has only one real root. **(b)** Given the root $\\alpha$ is small, use the small-angle approximation for $\\cos x$ to estimate $\\alpha$ to 3 d.p.",
      steps: [
        { h: "(a) Rewrite as curve = line", m: "$\\cos x = 2x + \\tfrac12$", mk: "M1", n: "Sketch $y = 2x + \\frac12$ on the copy of the figure: gradient 2, intercept $\\frac12$.", fig: { x: [-3.5, 3.5], y: [-1.6, 1.6], axes: { pi: true, yt: [-1, 1] }, items: [
          { fn: "cos(x)", label: "y = cos x", at: 3.3, pos: "s" }, { fn: "2*x+0.5", from: -1.0, to: 0.5, c: "accent2", label: "y = 2x + ½", at: 0.45, pos: "e" },
          { pt: [0.236, 0.972], label: "α", pos: "n", c: "danger" }, { hline: 1, c: "muted" }, { hline: -1, c: "muted" }
        ] } },
        { h: "Argue once", m: "The line has $y > 1$ for $x > \\tfrac14$ and $y < -1$ for $x < -\\tfrac34$, but $-1 \\le \\cos x \\le 1$; in $[-\\tfrac34, \\tfrac14]$ the line, gradient 2, crosses the falling-then-rising cosine exactly once. So one root.", mk: "A1", n: "The reason must mention the line leaving the band $[-1, 1]$ — that is why there are no further intersections." },
        { h: "(b) Small angle", m: "$1 - \\dfrac{x^2}{2} = 2x + \\dfrac12 \\Rightarrow x^2 + 4x - 1 = 0$", mk: "M1 A1", n: "$\\cos x \\approx 1 - \\frac{x^2}{2}$ (5.5). Multiply through by 2 and tidy." },
        { m: "$x = \\dfrac{-4 \\pm \\sqrt{16 + 4}}{2} = -2 \\pm \\sqrt5$; small root $\\alpha \\approx -2 + \\sqrt5 = 0.236$", mk: "A1", n: "Reject $-2 - \\sqrt5$ (not small, and the approximation is invalid there)." }
      ], result: "One root; $\\alpha \\approx 0.236$" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command", "What they want", "Marks"], rows: [
      ["Show that $\\alpha$ lies in $[a, b]$ / $a < \\alpha < b$", "$f(a)$, $f(b)$ with signs; \"change of sign, continuous, so root\"", "M1 A1"],
      ["Show that $\\alpha = 0.341$ to 3 d.p.", "State $f$; test $0.3405$ and $0.3415$; conclude to 3 d.p.", "M1 A1"],
      ["Using a suitable function that should be stated", "Write $f(x) = \\ldots$ explicitly — the $f(x) = 0$ form, not the iteration", "part of M1"],
      ["Explain why $\\alpha$ must lie in …", "Sign change + continuity, one sentence", "B1"],
      ["Explain why the method fails / only one root", "Asymptote, even roots, or a line-crosses-curve-once argument", "B1/A1"]
    ] } },
    { kv: [
      ["Radians", "Any $\\sin$, $\\cos$, $\\tan$ in a numerical-methods question is in radians unless degrees are printed. Check the mode before the first evaluation."],
      ["fx-991CW", "Store the function once: type it with $x$, then **CALC** (or the table mode: $f(x)$ with Start $0.3405$, End $0.3415$, Step $0.001$ gives both values in one screen)."],
      ["Precision", "Quote values to 3 s.f. with the sign; for tiny values near a root ($-0.0013$) keep enough figures that the sign is unambiguous."],
      ["Both ends", "Never test one end. Never test the rounded value itself ($f(0.341)$ tells you nothing about 3 d.p.)."]
    ] },
    { callout: { t: "mnemonic", h: "\"Sign, continuous, so\"", body: "Every conclusion has the same three beats: *there is a change of sign*, *$f$ is continuous*, *so a root lies in the interval*. Say all three every time." } },
    { ul: [
      "**Misconception:** \"no sign change means no root\" — false (even number of roots).",
      "**Misconception:** \"sign change means a root\" — false without continuity.",
      "**Misconception:** to show $\\alpha = 0.341$ (3 d.p.) test $0.34$ and $0.35$ — that only shows $0.34 < \\alpha < 0.35$."
    ] }
  ],
  flashcards: [
    ["Change-of-sign test — the two conditions?", "$f$ continuous on $[a,b]$ and $f(a)$, $f(b)$ of opposite sign $\\Rightarrow$ a root in $(a,b)$."],
    ["Show $\\alpha = 2.37$ to 2 d.p. — which interval?", "$[2.365, 2.375]$: the numbers that round to $2.37$."],
    ["Change of sign but no root — why?", "Discontinuity: an asymptote between $a$ and $b$."],
    ["Root but no change of sign — why?", "An even number of roots (or a repeated root) in the interval."],
    ["\"Suitable function that should be stated\" means?", "Write $f(x) = 0$ form explicitly — not the iteration $x = g(x)$; if needed use $x - g(x)$."],
    ["Trig in a root question: mode?", "Radians."]
  ],
  quiz: [
    { q: "$f(1.2) = -0.3$, $f(1.3) = 0.4$, $f$ continuous. Conclusion?", opts: ["A root lies in $(1.2, 1.3)$", "$\\alpha = 1.25$", "There is exactly one root", "Nothing"], ans: 0, why: "Sign change + continuity gives at least one root; not its exact value nor uniqueness." },
    { q: "To show $\\alpha = 0.7$ to 1 d.p. test", opts: ["$f(0.65)$ and $f(0.75)$", "$f(0.7)$ and $f(0.8)$", "$f(0.6)$ and $f(0.7)$", "$f(0.69)$ and $f(0.71)$"], ans: 0, why: "The interval of values rounding to $0.7$." },
    { q: "$f(x) = \\frac{1}{x - 2}$: $f(1) < 0 < f(3)$ but no root in $(1, 3)$ because", opts: ["$f$ is not continuous there", "the interval is too big", "there are two roots", "$f(2) = 0$"], ans: 0, why: "Asymptote at $x = 2$." },
    { q: "$f(x) = (x - 1)^2$: $f(0) > 0$, $f(2) > 0$. The root at $x = 1$ is missed because", opts: ["the root is repeated — no sign change", "$f$ is discontinuous", "the interval is too small", "it is not a root"], ans: 0, why: "The curve touches the axis." }
  ]
};

/* =====================================================================
   9.2  Iteration x_{n+1} = g(x_n); staircase and cobweb diagrams
   ===================================================================== */
C["maths:9.2"] = {
  notes: [
    { h: "Fixed-point iteration" },
    { callout: { t: "def", h: "The idea", body: [
      "Rearrange $f(x) = 0$ into the form $x = g(x)$. A root $\\alpha$ of the original equation is a **fixed point** of $g$: $g(\\alpha) = \\alpha$.",
      "Start with a guess $x_1$ and repeat $x_{n+1} = g(x_n)$. If the sequence settles, its limit is a root.",
      "Geometrically: the root is where $y = g(x)$ meets $y = x$; the iteration bounces between the curve and the line."
    ] } },
    { h: "Doing it on the calculator (the part everyone gets right)" },
    { ol: [
      "Type $x_1$ and press **=** (or **EXE**). The value is now **Ans**.",
      "Type the formula with **Ans** in place of $x_n$: e.g. `8 ÷ (1 + ln(Ans))`.",
      "Press **=** repeatedly. Each press is one more iteration: the first press gives $x_2$, the second $x_3$, …",
      "Write down $x_2$, $x_3$, … as you go (the examiner wants to see at least the values asked for) and stop when successive values agree to the accuracy required."
    ] },
    { callout: { t: "warn", h: "Counting presses", body: [
      "\"Find $x_4$\" from $x_1$: **three** presses. \"Find $x_5$\": four. Write the subscripts as you go so you never hand in $x_3$ labelled $x_4$.",
      "Give every intermediate value to the accuracy asked (usually 4 d.p.), but keep the full value in Ans — never re-type a rounded number."
    ] } },
    { worked: { tag: "exam", title: "Find $x_5$ and the root to 2 d.p.", src: "A-level Specimen · P2 Q6(d) · 2 marks",
      q: "The $x$-coordinate of the maximum point $Q$ of $f(x) = (8 - x)\\ln x$ satisfies $x = \\frac{8}{1 + \\ln x}$. Use $x_{n+1} = \\frac{8}{1 + \\ln x_n}$ with $x_1 = 3.5$ to find **(i)** $x_5$ to 4 d.p., **(ii)** the $x$-coordinate of $Q$ to 2 d.p.",
      steps: [
        { h: "Iterate", m: "$x_2 = 3.5512$, $x_3 = 3.5285$, $x_4 = 3.5385$, $x_5 = 3.5340$", mk: "M1 A1", n: "Ans-key: `8÷(1+ln(Ans))`. Four presses from $3.5$. Values oscillate either side of the root — a cobweb (below)." },
        { h: "(ii)", m: "$x_6 = 3.5360$, $x_7 = 3.5351\\ldots$; the sequence settles at $3.54$ (2 d.p.)", n: "Iterate until two successive values round to the same 2 d.p. value." }
      ], result: "$x_5 = 3.5340$; $x_Q = 3.54$" } },

    { page: "Deriving the iteration — \"show that α satisfies x = g(x)\"" },
    { p: "The A-level version almost always starts with calculus: the root is a **turning point** of some function, so you differentiate, set the derivative to zero, and rearrange into the printed form. The printed form tells you where to aim." },
    { steps: [
      "Differentiate (product/quotient/chain rule as needed) and set $= 0$.",
      "Clear fractions and logs into a polynomial-ish equation.",
      "Isolate one $x$ to match the target: if the target is $x = \\sqrt[3]{\\ldots}$, isolate $x^3$; if it is $x = \\frac{\\ldots}{\\ldots}$, collect the $x$ terms on one side and factorise $x$ out.",
      "Every line must be reversible-looking algebra; a \"show that\" with the target written and nothing between scores 0."
    ] },
    { worked: { tag: "exam", title: "Turning point $\\to$ cubic $\\to$ iterate", src: "A-level Oct 2021 · P1 Q4 · 9 marks",
      q: "$f(x) = x^2 + \\ln(2x^2 - 4x + 5)$ has a single turning point at $x = \\alpha$. **(a)** Show that $\\alpha$ is a solution of $2x^3 - 4x^2 + 7x - 2 = 0$. **(b)** With $x_{n+1} = \\frac17\\left(2 + 4x_n^2 - 2x_n^3\\right)$ and $x_1 = 0.3$, find $x_2$ and $x_4$ to 4 d.p. **(c)** Show $\\alpha = 0.341$ to 3 d.p.",
      steps: [
        { h: "(a) Differentiate", m: "$f'(x) = 2x + \\dfrac{4x - 4}{2x^2 - 4x + 5}$", mk: "M1 A1", n: "Chain rule on $\\ln(\\ldots)$: derivative of the inside over the inside." },
        { h: "Set to zero and clear the fraction", m: "$2x(2x^2 - 4x + 5) + 4x - 4 = 0$\n$4x^3 - 8x^2 + 10x + 4x - 4 = 0$\n$4x^3 - 8x^2 + 14x - 4 = 0 \\Rightarrow 2x^3 - 4x^2 + 7x - 2 = 0$", mk: "dM1 A1*", n: "Divide by 2 at the end. The starred A1 needs every step visible." },
        { h: "(b) Iterate", m: "$x_2 = \\tfrac17(2 + 4(0.3)^2 - 2(0.3)^3) = 0.3294$\n$x_3 = 0.3375$, $x_4 = 0.3398$", mk: "M1 A1 A1", n: "Three presses of `(2+4Ans²−2Ans³)÷7`. Notice how the printed rearrangement is just the cubic solved for the $7x$ term: $7x = 2 + 4x^2 - 2x^3$." },
        { h: "(c)", m: "$g(x) = 2x^3 - 4x^2 + 7x - 2$: $g(0.3405) < 0$, $g(0.3415) > 0$, sign change, continuous $\\Rightarrow \\alpha = 0.341$", mk: "M1 A1", n: "See 9.1 — the function is the cubic, the interval is $\\pm 0.0005$." }
      ], result: "$x_2 = 0.3294$, $x_4 = 0.3398$; $\\alpha = 0.341$" } },
    { worked: { tag: "exam", title: "Quotient in surds $\\to$ a $\\frac23$-power rearrangement", src: "A-level Oct 2020 · P2 Q7 · 10 marks",
      q: "$C$: $y = \\frac{4x^2 + x}{2\\sqrt x} - 4\\ln x$, $x > 0$. **(a)** Show $\\frac{dy}{dx} = \\frac{12x^2 + x - 16\\sqrt x}{4x\\sqrt x}$. **(b)** Show the $x$-coordinate of the minimum $P$ is a solution of $x = \\left(\\frac43 - \\frac{\\sqrt x}{12}\\right)^{2/3}$. **(c)** With $x_1 = 2$, find $x_2$ to 5 d.p. and the $x$-coordinate of $P$ to 5 d.p.",
      steps: [
        { h: "(a) Split the fraction first", m: "$y = 2x^{3/2} + \\tfrac12 x^{1/2} - 4\\ln x$", mk: "M1", n: "$\\frac{4x^2}{2\\sqrt x} = 2x^{3/2}$, $\\frac{x}{2\\sqrt x} = \\frac12 x^{1/2}$. Far easier than the quotient rule." },
        { m: "$\\dfrac{dy}{dx} = 3x^{1/2} + \\tfrac14 x^{-1/2} - \\dfrac4x$", mk: "A1" },
        { h: "Common denominator $4x\\sqrt x$", m: "$= \\dfrac{3\\sqrt x \\cdot 4x\\sqrt x + \\tfrac14 x^{-1/2}\\cdot 4x\\sqrt x - \\tfrac4x \\cdot 4x\\sqrt x}{4x\\sqrt x} = \\dfrac{12x^2 + x - 16\\sqrt x}{4x\\sqrt x}$", mk: "M1 A1*", n: "Show each numerator term: $3\\sqrt x\\cdot 4x\\sqrt x = 12x^2$; $\\frac14 x^{-1/2}\\cdot 4x^{3/2} = x$; $\\frac4x\\cdot 4x\\sqrt x = 16\\sqrt x$." },
        { h: "(b) Numerator $= 0$", m: "$12x^2 + x = 16\\sqrt x$", mk: "M1", n: "At $P$, $\\frac{dy}{dx} = 0$; the denominator is positive for $x > 0$." },
        { h: "Divide by $\\sqrt x$ and isolate $x^{3/2}$", m: "$12x^{3/2} + \\sqrt x = 16 \\Rightarrow x^{3/2} = \\dfrac{16 - \\sqrt x}{12} = \\dfrac43 - \\dfrac{\\sqrt x}{12}$", mk: "M1", n: "Aim at the printed form: it has a $\\frac23$ power, so isolate $x^{3/2}$ first." },
        { m: "$x = \\left(\\dfrac43 - \\dfrac{\\sqrt x}{12}\\right)^{2/3}$", mk: "A1*", n: "Raise both sides to $\\frac23$." },
        { h: "(c)", m: "$x_2 = \\left(\\tfrac43 - \\tfrac{\\sqrt2}{12}\\right)^{2/3} = 1.13894$ (5 d.p.)\n$x_3 = 1.15693$, $x_4 = 1.15650$, $x_5 = 1.15650$, … $\\Rightarrow x_P = 1.15650$ (5 d.p.)", mk: "M1 A1 A1", n: "Fast convergence: successive values agree to 5 d.p. by $x_5$. The 5 d.p. is a hint that the sequence converges quickly." }
      ], result: "$x_2 = 1.13894$; $x_P = 1.15650$" } },
    { worked: { tag: "exam", title: "Equal gradients $\\to$ log equation $\\to$ iterate", src: "A-level June 2024 · P2 Q6 · 7 marks",
      q: "$f(x) = e^{4x^2 - 1}$, $g(x) = 8\\ln x$, $x > 0$. **(a)** Find $f'(x)$ and $g'(x)$. **(b)** Given $f'(x) = g'(x)$ at $x = \\alpha$, show $\\alpha$ satisfies $4x^2 + 2\\ln x - 1 = 0$. **(c)** Using $x_{n+1} = \\sqrt{\\frac{1 - 2\\ln x_n}{4}}$ with $x_1 = 0.6$, find $x_2$ and $\\alpha$ to 4 d.p.",
      steps: [
        { h: "(a)", m: "$f'(x) = 8x\\,e^{4x^2 - 1}$, $\\quad g'(x) = \\dfrac8x$", mk: "B1 B1", n: "Chain rule: derivative of the exponent, $8x$, times the exponential." },
        { h: "(b) Equate and tidy", m: "$8x\\,e^{4x^2 - 1} = \\dfrac8x \\Rightarrow x^2 e^{4x^2 - 1} = 1$", mk: "M1", n: "Multiply by $x$, divide by 8." },
        { h: "Take logs", m: "$\\ln(x^2) + (4x^2 - 1) = \\ln 1 = 0 \\Rightarrow 4x^2 + 2\\ln x - 1 = 0$", mk: "A1*", n: "$\\ln(x^2 e^{4x^2-1}) = 2\\ln x + 4x^2 - 1$. Logs of a product add." },
        { h: "(c)", m: "$x_2 = \\sqrt{\\dfrac{1 - 2\\ln 0.6}{4}} = 0.7109$\n$x_3 = 0.6485$, $x_4 = 0.6830$, $x_5 = 0.6638$, … oscillating in; eventually $0.6706$", mk: "M1 A1 A1", n: "This one converges **slowly** (the values alternate above and below — a cobweb with $|g'(\\alpha)|$ close to 1). Keep pressing until two consecutive values agree to 4 d.p.: $\\alpha = 0.6706$." }
      ], result: "$x_2 = 0.7109$; $\\alpha = 0.6706$" } },

    { page: "Staircase and cobweb diagrams" },
    { p: "The diagram is the geometry of the iteration. Draw the curve $y = g(x)$ and the line $y = x$. Start at $x_1$ on the $x$-axis:" },
    { ol: [
      "Go **vertically** to the curve: height $g(x_1) = x_2$.",
      "Go **horizontally** to the line $y = x$: you are now above $x = x_2$ on the axis.",
      "Repeat: vertical to the curve ($x_3$), horizontal to the line, …",
      "If $g'$ is **positive** near the root the path climbs (or descends) like stairs — a **staircase**. If $g'$ is **negative** the path spirals around the root — a **cobweb**."
    ] },
    { fig: { x: [0, 3.2], y: [0, 3.2], aspect: "equal", axes: { xt: [1, 2, 3], yt: [1, 2, 3] }, items: [
      { fn: "x", c: "muted", label: "y = x", at: 3.0, pos: "s" },
      { fn: "(2*exp(3*x)-4)/(exp(3*x)+4)", from: 0.3, to: 3.1, label: "y = g(x)", at: 2.4, pos: "n" }
    ].concat(iterPath(function (x) { return (2 * Math.exp(3 * x) - 4) / (Math.exp(3 * x) + 4); }, 1, 4, "accent2")).concat([
      { pt: [1, 0], label: "x₁ = 1", pos: "s", c: "accent2" }, { pt: [1.9676, 1.9676], label: "β", pos: "se", c: "danger" }
    ]), cap: "Staircase (June 2023 P1 Q15(c)): $g(x) = \\frac{2e^{3x} - 4}{e^{3x} + 4}$ from $x_1 = 1$. Vertical to the curve, horizontal to $y = x$, repeat — the steps climb to $\\beta \\approx 1.968$ because $g$ is increasing there." } },
    { fig: { x: [2.4, 4.6], y: [2.4, 4.6], aspect: "equal", axes: { xt: [3, 4], yt: [3, 4] }, items: [
      { fn: "x", c: "muted", label: "y = x", at: 4.5, pos: "s" },
      { fn: "2*ln(8-x)", from: 2.4, to: 4.6, label: "y = 2 ln(8 − x)", at: 4.5, pos: "n" }
    ].concat(iterPath(function (x) { return 2 * Math.log(8 - x); }, 4, 5, "accent2")).concat([
      { pt: [4, 2.4], label: "x₁ = 4", pos: "s", c: "accent2" }, { pt: [3.157, 3.157], label: "α", pos: "se", c: "danger" }
    ]), cap: "Cobweb (June 2018 P1 Q4(b)): $g(x) = 2\\ln(8 - x)$ is decreasing, so from $x_1 = 4$ the path spirals inwards around $\\alpha \\approx 3.16$: $x_2 = 2.77$, $x_3 = 3.31$, $x_4 = 3.09$… The iteration **can** be used." } },
    { callout: { t: "key", h: "Why it converges (or not) — the gradient of $g$", body: [
      "Near the root the iteration multiplies the error by roughly $g'(\\alpha)$ each step. So it converges when $|g'(\\alpha)| < 1$ and diverges when $|g'(\\alpha)| > 1$.",
      "$0 < g' < 1$: staircase in. $\\;-1 < g' < 0$: cobweb in. $\\;g' > 1$: staircase out. $\\;g' < -1$: cobweb out.",
      "The spec asks for the diagram, not this condition — but it is the fastest way to *predict* the picture and to check your sketch is plausible. For $g(x) = 2\\ln(8 - x)$: $g'(\\alpha) = -\\frac{2}{8 - \\alpha} \\approx -0.41$: a converging cobweb, as drawn."
    ] } },
    { worked: { tag: "exam", title: "Determine whether the iteration can be used", src: "A-level June 2018 · P1 Q4(b) · 2 marks",
      q: "Using the graph of $y = 2\\ln(8 - x)$ and $y = x$, and starting with $x_1 = 4$, determine whether or not $x_{n+1} = 2\\ln(8 - x_n)$ can be used to find an approximation for $\\alpha$, justifying your answer.",
      steps: [
        { h: "Draw the cobweb on the figure", m: "From $x_1 = 4$: up to the curve, across to $y = x$, down to the curve, across… the path spirals in towards the intersection.", mk: "M1", n: "At least two full \"vertical then horizontal\" moves drawn on the given diagram." },
        { h: "Conclude", m: "The cobweb converges to $\\alpha$ (values $x_2 = 2.77$, $x_3 = 3.31$, $x_4 = 3.09$ close in on $3.16$), so the iteration **can** be used.", mk: "A1", n: "A conclusion with a reason. Numerical evidence alone was also accepted if it showed the values homing in." }
      ], result: "Yes — a converging cobweb" } },
    { worked: { tag: "exam", title: "Draw a staircase to show the iteration finds $\\beta$", src: "A-level June 2023 · P1 Q15(c)(d) · 4 marks",
      q: "$x = \\frac{2e^{3x} - 4}{e^{3x} + 4}$ has positive roots $\\alpha < \\beta$. **(c)** Draw a staircase diagram to show that the iteration from $x_1 = 1$ can be used to find $\\beta$. **(d)** Find $x_2$ and $\\beta$ to 3 d.p.",
      steps: [
        { h: "(c)", m: "On Diagram 1: vertical from $x_1 = 1$ to the curve, horizontal to $y = x$, vertical to the curve, … the steps climb to the upper intersection $\\beta$.", mk: "B1", n: "It must start at $x = 1$ and clearly approach $\\beta$, not $\\alpha$ (the diagram above)." },
        { h: "(d)", m: "$x_2 = \\dfrac{2e^3 - 4}{e^3 + 4} = 1.502$\n$x_3 = 1.873$, $x_4 = 1.957$, $x_5 = 1.967$, $x_6 = 1.967(5)$, $x_7 = 1.968 \\Rightarrow \\beta = 1.968$", mk: "M1 A1 A1", n: "Three-decimal-place answers throughout; keep iterating until stable." }
      ], result: "$x_2 = 1.502$; $\\beta = 1.968$" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command", "What they want", "Marks"], rows: [
      ["Show that $\\alpha$ satisfies $x = g(x)$", "Differentiate / set to zero / rearrange to the printed form with every step", "M1 A1 (M1) A1*"],
      ["Find $x_2$ (and $x_4$) to 4 d.p.", "Ans-key iteration; values with correct subscripts", "M1 A1 A1"],
      ["Find $\\alpha$ to $k$ d.p. by repeated iteration", "Iterate until stable; state the rounded value", "A1"],
      ["Draw a staircase / cobweb", "Vertical-horizontal path on the given diagram from $x_1$, approaching the root", "B1/M1"],
      ["Determine whether the iteration can be used", "Diagram (or values) + \"converges to $\\alpha$, so yes\" (or diverges, so no)", "M1 A1"]
    ] } },
    { kv: [
      ["fx-991CW", "`x₁ =`, then formula in **Ans**, then **=** repeatedly. Each press is one iteration; count them. Do not round Ans."],
      ["Accuracy", "\"to 4 d.p.\" applies to every value you write down. The stored value is unrounded."],
      ["Which root?", "An iteration converges to at most one root; where you start decides which. The staircase in 2023 Q15 finds $\\beta$, not $\\alpha$ — $\\alpha$ needed the change-of-sign test instead."],
      ["Slow convergence", "If values alternate and creep (2024 Q6: 0.71, 0.65, 0.68, 0.66…), keep going — 20+ presses is normal. Do not stop at the first pair that looks close."]
    ] },
    { callout: { t: "mnemonic", h: "\"Up to the curve, across to the line\"", body: "Every step of a cobweb or staircase is those two moves, in that order. Positive gradient $\\to$ stairs; negative gradient $\\to$ cobweb." } },
    { ul: [
      "**Misconception:** using the rearrangement $x = g(x)$ as the function for a change-of-sign test — the test needs $x - g(x)$ or the original $f$.",
      "**Misconception:** labelling the first result $x_1$ — the first press gives $x_2$.",
      "**Misconception:** a diverging iteration means \"no root\" — the root exists; that rearrangement just does not find it."
    ] }
  ],
  flashcards: [
    ["Fixed-point iteration finds a root of $f(x) = 0$ how?", "Rearrange to $x = g(x)$; iterate $x_{n+1} = g(x_n)$; the limit satisfies $g(\\alpha) = \\alpha$."],
    ["Staircase vs cobweb?", "Staircase when $g' > 0$ near the root; cobweb (spiral) when $g' < 0$."],
    ["Converges when?", "$|g'(\\alpha)| < 1$ near the root."],
    ["Two moves of the diagram?", "Vertical to the curve $y = g(x)$, horizontal to the line $y = x$."],
    ["From $x_1$, how many calculator presses to $x_4$?", "Three."],
    ["Oct 2021 Q4: turning point of $x^2 + \\ln(2x^2 - 4x + 5)$ satisfies?", "$2x^3 - 4x^2 + 7x - 2 = 0$."]
  ],
  quiz: [
    { q: "$x_{n+1} = \\sqrt{3x_n + 1}$, $x_1 = 2$: $x_2 =$", opts: ["$\\sqrt7 \\approx 2.646$", "$7$", "$\\sqrt{10}$", "$2.5$"], ans: 0, why: "$\\sqrt{6 + 1}$." },
    { q: "A cobweb diagram arises when near the root", opts: ["$g'(x) < 0$", "$g'(x) > 0$", "$g'(x) = 0$", "$g(x) = 0$"], ans: 0, why: "Negative gradient makes the path alternate sides." },
    { q: "The iteration diverges when", opts: ["$|g'(\\alpha)| > 1$", "$|g'(\\alpha)| < 1$", "$g(\\alpha) = \\alpha$", "$x_1 < \\alpha$"], ans: 0, why: "Errors are multiplied by about $g'(\\alpha)$ each step." },
    { q: "The first move of a staircase from $x_1$ on the axis is", opts: ["vertically to $y = g(x)$", "horizontally to $y = x$", "to the root", "along the axis"], ans: 0, why: "Then across to the line." }
  ]
};

/* =====================================================================
   9.3  The Newton–Raphson method
   ===================================================================== */
C["maths:9.3"] = {
  notes: [
    { h: "Newton–Raphson" },
    { callout: { t: "memorise", h: "The formula (in the booklet — but know it)", body: [
      "$$x_{n+1} = x_n - \\dfrac{f(x_n)}{f'(x_n)}$$",
      "It is the fixed-point iteration $x = g(x)$ with $g(x) = x - \\frac{f(x)}{f'(x)}$ — chosen so that $g'(\\alpha) = 0$, which is why it converges so fast (roughly doubling the correct digits each step)."
    ] } },
    { h: "Where the formula comes from — the tangent" },
    { p: "Draw the tangent at $x_n$. It crosses the axis where the curve *would* cross if it were straight — usually much closer to the root." },
    { fig: { x: [0, 4.2], y: [-3, 7], axes: { xt: [1, 2, 3, 4], yt: [-2, 2, 4, 6] }, items: [
      { fn: "2*x^3+x^2-1", from: 0, to: 1.45, label: "y = 2x³ + x² − 1", at: 1.45, pos: "n" },
      { line: [[0.5, 8 * 0.5 - 6], [1.3, 8 * 1.3 - 6]], c: "accent2", label: "tangent at x₁ = 1", lpos: 0.85 },
      { pt: [1, 2], label: "(x₁, f(x₁))", pos: "w", c: "accent2" }, { line: [[1, 0], [1, 2]], c: "muted", dash: true },
      { pt: [1, 0], label: "x₁ = 1", pos: "s", c: "accent2" }, { pt: [0.75, 0], label: "x₂ = 0.75", pos: "s", c: "danger" },
      { pt: [0.6574, 0], r: 3, c: "good", label: "α", pos: "n" }
    ], cap: "June 2018 P2 Q5: the tangent at $x_1 = 1$ has gradient $f'(1) = 8$ and meets the axis at $x_2 = 1 - \\frac{2}{8} = 0.75$. One more step gives $0.667$; the root is $0.6574$." } },
    { steps: [
      "Tangent at $(x_n, f(x_n))$: $y - f(x_n) = f'(x_n)(x - x_n)$.",
      "It meets the $x$-axis where $y = 0$: $-f(x_n) = f'(x_n)(x - x_n)$.",
      "Solve for $x$: $x = x_n - \\frac{f(x_n)}{f'(x_n)}$. Call this $x_{n+1}$."
    ] },
    { worked: { tag: "exam", title: "Show the formula can be written as …; then iterate; then explain a failure", src: "A-level June 2018 · P2 Q5 · 6 marks",
      q: "$2x^3 + x^2 - 1 = 0$ has exactly one real root. **(a)** Show that the Newton–Raphson formula for this equation can be written $x_{n+1} = \\frac{4x_n^3 + x_n^2 + 1}{6x_n^2 + 2x_n}$. **(b)** With $x_1 = 1$ find $x_2$ and $x_3$. **(c)** Explain why the method cannot be used with $x_1 = 0$.",
      steps: [
        { h: "(a) Differentiate and substitute", m: "$f(x) = 2x^3 + x^2 - 1$, $f'(x) = 6x^2 + 2x$\n$x_{n+1} = x_n - \\dfrac{2x_n^3 + x_n^2 - 1}{6x_n^2 + 2x_n}$", mk: "B1 M1", n: "Write $f$ and $f'$ explicitly, then the booklet formula with them in." },
        { h: "Single fraction", m: "$= \\dfrac{x_n(6x_n^2 + 2x_n) - (2x_n^3 + x_n^2 - 1)}{6x_n^2 + 2x_n} = \\dfrac{6x_n^3 + 2x_n^2 - 2x_n^3 - x_n^2 + 1}{6x_n^2 + 2x_n} = \\dfrac{4x_n^3 + x_n^2 + 1}{6x_n^2 + 2x_n}$", mk: "A1*", n: "Show the expansion of the numerator; the minus sign on the whole bracket is the usual slip." },
        { h: "(b)", m: "$x_2 = \\dfrac{4 + 1 + 1}{6 + 2} = \\dfrac68 = 0.75$\n$x_3 = \\dfrac{4(0.75)^3 + (0.75)^2 + 1}{6(0.75)^2 + 2(0.75)} = \\dfrac{3.25}{4.875} = 0.667$", mk: "M1 A1", n: "Exact $x_3 = \\frac23$. Give 3 s.f. or the fraction." },
        { h: "(c)", m: "$f'(0) = 0$: the tangent at $x = 0$ is horizontal, never meets the $x$-axis, and the formula divides by zero.", mk: "B1", n: "Either the geometric reason (horizontal tangent) or the algebraic one (denominator $6x^2 + 2x = 0$). The curve has a stationary point at $x = 0$." }
      ], result: "$x_2 = 0.75$, $x_3 = 0.667$; fails at $x_1 = 0$ since $f'(0) = 0$" } },

    { page: "Applying it once — the standard 2-mark part" },
    { p: "\"Apply the Newton–Raphson method once to obtain a second approximation\" is worth M1 A1. The M1 is for a correct substitution into the formula with **your** $f$ and $f'$; the A1 is the value to the accuracy asked. Show the substituted numbers — an answer alone can score 0 if it is wrong." },
    { worked: { tag: "exam", title: "Maximum by calculus, then one NR step from $x_0 = 5$", src: "A-level June 2022 · P2 Q6 · 7 marks",
      q: "$f(x) = 8\\sin\\left(\\frac12 x\\right) - 3x + 9$, $x > 0$ (radians). $P$ is a local maximum. **(a)** Find the $x$-coordinate of $P$ to 3 s.f. **(b)** Given $f(4) = 4.274$, $f(5) = -1.212$, explain why $\\alpha \\in [4, 5]$. **(c)** Taking $x_0 = 5$, apply Newton–Raphson once to obtain a second approximation to $\\alpha$, to 3 s.f.",
      steps: [
        { h: "(a) $f'(x) = 0$", m: "$f'(x) = 4\\cos\\left(\\tfrac12 x\\right) - 3 = 0 \\Rightarrow \\cos\\tfrac{x}{2} = \\tfrac34 \\Rightarrow \\tfrac{x}{2} = 0.7227 \\Rightarrow x = 1.45$", mk: "M1 A1 M1 A1", n: "Chain rule gives the $\\frac12 \\times 8 = 4$. The first positive solution is the maximum shown; $x = 1.4454\\ldots$." },
        { h: "(b)", m: "Change of sign, $f$ continuous $\\Rightarrow$ root in $[4, 5]$", mk: "B1" },
        { h: "(c) One step", m: "$f'(5) = 4\\cos 2.5 - 3 = -6.2046$\n$x_1 = 5 - \\dfrac{f(5)}{f'(5)} = 5 - \\dfrac{-1.212}{-6.2046} = 5 - 0.1953 = 4.80$", mk: "M1 A1", n: "Use the *given* $f(5) = -1.212$. Two negatives: the correction is subtracted. $4.8046 \\to 4.80$ (3 s.f.)." }
      ], result: "$x_P = 1.45$; $x_1 = 4.80$" } },
    { worked: { tag: "exam", title: "$f'$ with $\\sec^2$, then one NR step from $3.7$", src: "A-level June 2024 · P1 Q3 · 6 marks",
      q: "$f(x) = x + \\tan\\left(\\frac12 x\\right)$, $\\pi < x < \\frac{3\\pi}{2}$, single root $\\alpha$. **(a)** Show $\\alpha \\in [3.6, 3.7]$. **(b)** Find $f'(x)$. **(c)** Using $3.7$ as a first approximation, apply Newton–Raphson once to obtain a second approximation to 3 d.p.",
      steps: [
        { h: "(a)", m: "$f(3.6) = -0.686\\ldots$, $f(3.7) = 0.212\\ldots$; sign change, continuous on the interval $\\Rightarrow \\alpha \\in [3.6, 3.7]$", mk: "M1 A1", n: "Radians." },
        { h: "(b)", m: "$f'(x) = 1 + \\tfrac12\\sec^2\\left(\\tfrac12 x\\right)$", mk: "M1 A1", n: "$\\frac{d}{dx}\\tan kx = k\\sec^2 kx$." },
        { h: "(c)", m: "$f'(3.7) = 1 + \\tfrac12\\sec^2(1.85) = 1 + \\tfrac12(1 + \\tan^2 1.85) = 7.583$\n$x_2 = 3.7 - \\dfrac{0.2119}{7.583} = 3.672$", mk: "M1 A1", n: "$\\sec^2 = 1 + \\tan^2$ avoids a $\\cos$ on the calculator; or type $1 \\div \\cos(1.85)^2$. Answer $3.6721 \\to 3.672$." }
      ], result: "$f'(x) = 1 + \\frac12\\sec^2\\frac{x}{2}$; $x_2 = 3.672$" } },

    { page: "How Newton–Raphson fails" },
    { p: "The spec: *understand its failure near points where the gradient is small.* Three cases, all pictures of the same thing — a tangent that does not head for the root." },
    { fig: { x: [-3, 3], y: [-3, 3], axes: { xt: [-2, -1, 1, 2], yt: [-2, 2] }, items: [
      { fn: "x^3-2*x", from: -1.9, to: 1.9, label: "y = f(x)", at: 1.9, pos: "n" },
      { pt: [0.8, 0.512 - 1.6], label: "x₁ near a stationary point", pos: "s", c: "accent2" },
      { line: [[-2.6, (3 * 0.64 - 2) * (-2.6 - 0.8) + (0.512 - 1.6)], [2.6, (3 * 0.64 - 2) * (2.6 - 0.8) + (0.512 - 1.6)]], c: "accent2", label: "tangent — nearly flat", lpos: 0.2 },
      { pt: [1.414, 0], label: "α", pos: "n", c: "good" }
    ], cap: "Small gradient: the tangent at $x_1 = 0.8$ is almost horizontal, so it meets the axis far away (here off to the left at $x_2 \\approx -13$) — nowhere near the root $\\alpha = \\sqrt2$. The next step can land anywhere." } },
    { kv: [
      ["$f'(x_n) = 0$", "Division by zero; the tangent is horizontal and never meets the axis. (June 2018 Q5(c): $x_1 = 0$.)"],
      ["$f'(x_n)$ small", "The tangent is nearly flat and crosses the axis a long way off — the next value may be closer to a *different* root, or the iteration may wander."],
      ["Wrong side of a turning point", "A starting value the other side of a maximum/minimum from the root sends the tangent away from it."],
      ["Start too far away", "NR is only guaranteed to converge from a start close enough to the root; a bad $x_1$ can converge to another root."]
    ] },
    { callout: { t: "key", h: "Explain-why answers that score", body: [
      "\"$f'(x_1) = 0$ so the tangent is horizontal / the formula divides by zero.\" ✓",
      "\"The gradient at $x_1$ is small so the tangent meets the axis far from $\\alpha$.\" ✓",
      "\"It does not work\" ✗ — no reason."
    ] } },

    { page: "Exam toolkit" },
    { table: { head: ["Command", "What they want", "Marks"], rows: [
      ["Show the NR formula can be written as …", "$f$, $f'$, substitute, combine into one fraction, expand numerator", "B1 M1 A1*"],
      ["Apply NR once from $x_0$ (or $x_1$)", "Substituted numbers shown; value to the stated accuracy", "M1 A1"],
      ["Find $x_2$ and $x_3$", "Two applications; each value", "M1 A1"],
      ["Explain why NR cannot be used with $x_1 = \\ldots$", "$f'(x_1) = 0$ / tangent horizontal / small gradient", "B1"]
    ] } },
    { kv: [
      ["Indexing", "Edexcel sometimes starts at $x_0$ (\"$x_0 = 5$… obtain a second approximation\") and sometimes at $x_1$. Copy the question's label."],
      ["Given values", "If $f(5)$ is printed, use it; recompute only $f'(5)$."],
      ["fx-991CW", "Store $x$ in **A**; evaluate `A − f(A)/f'(A)` and store the result back in A (or type the whole expression with **Ans**). One press per step."],
      ["Check", "$x_2$ should be *closer* to the root than $x_1$ and on the same side or just past it. A jump of the wrong sign means the $f/f'$ sign is wrong."]
    ] },
    { callout: { t: "mnemonic", h: "\"Minus $f$ over $f$-dash\"", body: "$x_{n+1} = x_n - \\frac{f}{f'}$: the correction is the height of the curve divided by its slope — how far the tangent travels to reach the axis." } },
    { ul: [
      "**Misconception:** $x_{n+1} = x_n - \\frac{f'(x_n)}{f(x_n)}$ (upside down). Height over gradient.",
      "**Misconception:** using degrees for a trig $f$. The formula needs $f'$ in the same units as $f$ — radians.",
      "**Misconception:** NR \"cannot find a root\" means the root does not exist. It only means that start point fails."
    ] }
  ],
  flashcards: [
    ["Newton–Raphson formula?", "$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$."],
    ["Geometric meaning?", "$x_{n+1}$ is where the tangent at $x_n$ crosses the $x$-axis."],
    ["When does it fail?", "$f'(x_n) = 0$ (horizontal tangent) or small (tangent shoots far away); a start on the wrong side of a turning point."],
    ["June 2018 Q5: $2x^3 + x^2 - 1 = 0$, $x_1 = 1$: $x_2$?", "$0.75$."],
    ["Why is NR fast?", "As a fixed-point iteration its $g'(\\alpha) = 0$; errors roughly square each step."]
  ],
  quiz: [
    { q: "$f(x) = x^2 - 2$, $x_1 = 1$: $x_2 =$", opts: ["$1.5$", "$1$", "$2$", "$0.5$"], ans: 0, why: "$1 - \\frac{-1}{2} = 1.5$." },
    { q: "NR fails when $f'(x_n) = 0$ because", opts: ["the tangent is horizontal and never meets the axis", "$f(x_n) = 0$", "the root is repeated", "$x_n$ is negative"], ans: 0, why: "Division by zero in the formula." },
    { q: "NR is a fixed-point iteration with $g(x) =$", opts: ["$x - f(x)/f'(x)$", "$f(x)/f'(x)$", "$f'(x)$", "$x - f'(x)$"], ans: 0, why: "Definition." },
    { q: "\"Apply NR once from $x_0 = 5$\": the answer is", opts: ["$x_1$", "$x_2$", "$x_0$", "$\\alpha$ exactly"], ans: 0, why: "One application from $x_0$ gives $x_1$." }
  ]
};

/* =====================================================================
   9.4  The trapezium rule
   ===================================================================== */
C["maths:9.4"] = {
  notes: [
    { h: "Numerical integration" },
    { callout: { t: "memorise", h: "The trapezium rule (in the booklet)", body: [
      "$$\\int_a^b y\\,dx \\approx \\dfrac12 h\\left[(y_0 + y_n) + 2(y_1 + y_2 + \\cdots + y_{n-1})\\right], \\qquad h = \\dfrac{b - a}{n}$$",
      "$n$ strips, $n + 1$ ordinates ($y$-values). **Ends once, middles twice.** $h$ is the strip width — read it straight off the table as the gap between consecutive $x$-values."
    ] } },
    { fig: { x: [0.5, 3.5], y: [0, 1.4], axes: { xt: [1, 1.5, 2, 2.5, 3], yt: [0.5, 1] }, items: [
      { shade: { fn: "x/(1+sqrt(x))", from: 1, to: 3 }, c: "accent", alpha: 0.1 },
      { poly: [[1, 0], [1.5, 0], [1.5, 0.6742], [1, 0.5]], fill: "accent2", alpha: 0.35, c: "accent2" },
      { poly: [[1.5, 0], [2, 0], [2, 0.8284], [1.5, 0.6742]], fill: "accent2", alpha: 0.25, c: "accent2" },
      { poly: [[2, 0], [2.5, 0], [2.5, 0.9686], [2, 0.8284]], fill: "accent2", alpha: 0.35, c: "accent2" },
      { poly: [[2.5, 0], [3, 0], [3, 1.0981], [2.5, 0.9686]], fill: "accent2", alpha: 0.25, c: "accent2" },
      { fn: "x/(1+sqrt(x))", from: 0.6, to: 3.4, label: "y = x/(1 + √x)", at: 3.4, pos: "n" },
      { text: [1.25, 0.2], t: "h = 0.5", c: "accent2", size: 11 }, { text: [1, 0.5], t: "y₀", pos: "nw", c: "text", size: 11 }, { text: [3, 1.1], t: "y₄", pos: "ne", c: "text", size: 11 }
    ], cap: "Specimen P1 Q1: four trapezia of width $h = 0.5$ under $y = \\frac{x}{1 + \\sqrt x}$ from 1 to 3. Each trapezium has area $\\frac12 h(y_k + y_{k+1})$; adding them counts every interior ordinate twice." } },
    { h: "Why the formula looks like that" },
    { ul: [
      "One trapezium of width $h$ with parallel sides $y_k$ and $y_{k+1}$ has area $\\frac12 h(y_k + y_{k+1})$.",
      "Add $n$ of them: $\\frac12 h(y_0 + y_1) + \\frac12 h(y_1 + y_2) + \\cdots + \\frac12 h(y_{n-1} + y_n)$.",
      "Every interior $y$ appears in two neighbouring trapezia — hence the $2(\\ldots)$; the two ends appear once."
    ] },
    { h: "Doing it without losing a mark" },
    { ol: [
      "Write $h$ (with the working $h = \\frac{b - a}{n}$ if the table is not printed).",
      "Write the bracket **with the numbers in**: $\\frac12(0.5)[0.5 + 1.0981 + 2(0.6742 + 0.8284 + 0.9686)]$. This is the M1 — an unsupported answer can score 0 if it is wrong.",
      "Evaluate: $= 0.25 \\times 6.5405 = 1.635$ (to the accuracy asked).",
      "Use the table's full values, not rounded ones; round only the final answer."
    ] },
    { worked: { tag: "exam", title: "Estimate, improve, and deduce two related integrals", src: "A-level Specimen · P1 Q1 · 6 marks",
      q: "$y = \\frac{x}{1 + \\sqrt x}$; table: $x = 1, 1.5, 2, 2.5, 3$; $y = 0.5, 0.6742, 0.8284, 0.9686, 1.0981$. **(a)** Use the trapezium rule with all the values to estimate the area of $R$ (between $x = 1$ and $x = 3$) to 3 d.p. **(b)** Explain how the rule can give a better approximation. **(c)** Using (a), deduce estimates for **(i)** $\\displaystyle\\int_1^3 \\frac{5x}{1 + \\sqrt x}\\,dx$, **(ii)** $\\displaystyle\\int_1^3\\left(6 + \\frac{x}{1 + \\sqrt x}\\right)dx$.",
      steps: [
        { h: "(a)", m: "$h = 0.5$\nArea $\\approx \\tfrac12(0.5)[0.5 + 1.0981 + 2(0.6742 + 0.8284 + 0.9686)]$\n$= 0.25[1.5981 + 4.9424] = 0.25 \\times 6.5405 = 1.635$", mk: "B1 M1 A1", n: "B1 for $h$, M1 for the correctly structured bracket, A1 for $1.635$." },
        { h: "(b)", m: "Use more strips (smaller $h$) — more $y$-values between 1 and 3.", mk: "B1", n: "\"More trapezia / increase $n$ / decrease $h$\" all accepted. \"Use more decimal places\" is not." },
        { h: "(c)(i) Constant multiple", m: "$\\displaystyle\\int_1^3 \\frac{5x}{1 + \\sqrt x}\\,dx = 5 \\times 1.635 = 8.176$", mk: "B1", n: "$5 \\times 1.63513 = 8.1756$. Using the rounded 1.635 gives 8.175 — also accepted; better to carry the unrounded value." },
        { h: "(c)(ii) Add a constant", m: "$\\displaystyle\\int_1^3 6\\,dx + \\int_1^3 \\frac{x}{1 + \\sqrt x}\\,dx = 6 \\times 2 + 1.635 = 13.635$", mk: "B1", n: "$\\int_1^3 6\\,dx = 6(3 - 1) = 12$: a rectangle. The width of the interval matters." }
      ], result: "1.635; more strips; 8.176; 13.635" } },

    { page: "Over-estimate or under-estimate?" },
    { p: "The trapezium rule replaces each arc by a chord. Where the chord sits relative to the arc decides the sign of the error — and the shape of the curve decides that." },
    { fig: { x: [0, 4], y: [0, 4.5], axes: { xt: [1, 2, 3], yt: [1, 2, 3, 4] }, items: [
      { shade: { fn: "0.25*x^2+0.5", from: 0.5, to: 3.5 }, c: "accent", alpha: 0.1 },
      { poly: [[0.5, 0], [3.5, 0], [3.5, 0.25 * 3.5 * 3.5 + 0.5], [0.5, 0.25 * 0.25 + 0.5]], fill: "danger", alpha: 0.2, c: "danger" },
      { fn: "0.25*x^2+0.5", from: 0.2, to: 3.8, label: "convex (concave up)", at: 3.8, pos: "w" },
      { text: [2, 3.2], t: "chord ABOVE the curve → over-estimate", c: "danger", size: 11 }
    ], cap: "Convex curve ($f'' > 0$, gradient increasing): every chord lies above the arc, the trapezia are too big — **over-estimate**." } },
    { fig: { x: [0, 4], y: [0, 4.5], axes: { xt: [1, 2, 3], yt: [1, 2, 3, 4] }, items: [
      { shade: { fn: "4-0.25*(x-3.5)^2", from: 0.5, to: 3.5 }, c: "accent", alpha: 0.1 },
      { poly: [[0.5, 0], [3.5, 0], [3.5, 4], [0.5, 4 - 0.25 * 9]], fill: "good", alpha: 0.25, c: "good" },
      { fn: "4-0.25*(x-3.5)^2", from: 0.2, to: 3.8, label: "concave (concave down)", at: 3.8, pos: "s" },
      { text: [2, 1.0], t: "chord BELOW the curve → under-estimate", c: "good", size: 11 }
    ], cap: "Concave curve ($f'' < 0$, gradient decreasing): chords lie below the arc — **under-estimate**. Sketch one chord on the given figure and say which side of the curve it is." } },
    { kv: [
      ["Convex / concave up / gradient increasing", "Over-estimate."],
      ["Concave / concave down / gradient decreasing", "Under-estimate."],
      ["Point of inflection inside the interval", "Cannot say without more information — errors of both signs."],
      ["How to justify in one line", "\"The curve is convex, so each chord lies above the curve: the trapezia have more area than the region — an over-estimate.\" Draw the chord on the figure if one is printed."]
    ] },
    { worked: { tag: "exam", title: "Runway length from a speed table; over or under?", src: "A-level June 2019 · P2 Q2 · 4 marks",
      q: "Speed of a jet every 5 s from turning onto the runway until take-off: $t = 0, 5, 10, 15, 20, 25$; $v = 2, 5, 10, 18, 28, 42$ (m s$^{-1}$). **(a)** Estimate the length of runway used. **(b)** Given the jet accelerated smoothly, explain whether (a) is an under- or over-estimate.",
      steps: [
        { h: "(a) Distance = area under $v$–$t$", m: "$\\approx \\tfrac12(5)[2 + 42 + 2(5 + 10 + 18 + 28)] = 2.5[44 + 122] = 415$ m", mk: "B1 M1 A1", n: "The rule applies to any $y$-values with a constant $x$-gap — here $h = 5$ s. Distance is $\\int v\\,dt$ (7.x)." },
        { h: "(b)", m: "The speed increases at an increasing rate (the gaps 3, 5, 8, 10, 14 grow), so the graph is convex; the chords lie above the curve: **over-estimate**.", mk: "B1", n: "\"Accelerated smoothly\" plus the growing differences tells you the shape. Say *convex* and *chords above*." }
      ], result: "415 m; over-estimate" } },
    { worked: { tag: "exam", title: "Estimate, deduce a scaled integral, comment on accuracy", src: "A-level Oct 2020 · P2 Q1 · 5 marks",
      q: "$y = \\sqrt{\\frac{x}{1 + x}}$; $x = 0.5, 1, 1.5, 2, 2.5$; $y = 0.5774, 0.7071, 0.7746, 0.8165, 0.8452$. **(a)** Estimate $\\displaystyle\\int_{0.5}^{2.5}\\sqrt{\\frac{x}{1 + x}}\\,dx$ to 3 s.f. **(b)** Deduce an estimate for $\\displaystyle\\int_{0.5}^{2.5}\\sqrt{\\frac{9x}{1 + x}}\\,dx$. **(c)** Given the exact value is $4.535$ (4 s.f.), comment on the accuracy of (b).",
      steps: [
        { h: "(a)", m: "$h = 0.5$: $\\tfrac12(0.5)[0.5774 + 0.8452 + 2(0.7071 + 0.7746 + 0.8165)] = 0.25 \\times 6.0190 = 1.50$", mk: "B1 M1 A1", n: "$1.50475 \\to 1.50$ (3 s.f.)." },
        { h: "(b)", m: "$\\sqrt{\\dfrac{9x}{1 + x}} = 3\\sqrt{\\dfrac{x}{1 + x}}$, so the estimate is $3 \\times 1.50475 = 4.51$", mk: "B1", n: "The 9 comes *out of the square root* as 3 — not 9. Carry the unrounded 1.50475." },
        { h: "(c)", m: "$4.51 < 4.535$: an under-estimate, about 0.5% low — accurate; consistent with the curve being concave (gradient decreasing), so chords lie below it.", mk: "B1", n: "Compare, name the direction and link it to the shape." }
      ], result: "1.50; 4.51; slight under-estimate (concave curve)" } },

    { page: "Deducing related integrals" },
    { callout: { t: "key", h: "What you may deduce from one trapezium estimate", body: [
      "Only **linear changes to the integrand over the same limits**: $\\int k\\,f = k\\int f$, $\\int (f + c) = \\int f + c(b - a)$, $\\int (kf + c)$ likewise.",
      "A change to the **limits** or to the **inside** of $f$ (e.g. $f(2x)$, $f(x) + x$) cannot be deduced from the estimate without new $y$-values — the examiner sets exactly those traps.",
      "Logs: $\\log_3(2x)^{10} = 10\\log_3 2x$ (power law) and $\\log_3 18x = \\log_3 9 + \\log_3 2x = 2 + \\log_3 2x$ (product law). Rewrite first, then it is $k\\,f$ or $f + c$."
    ] } },
    { worked: { tag: "exam", title: "Log integrand: power law and product law deductions", src: "A-level June 2022 · P2 Q5 · 6 marks",
      q: "$y = \\log_3 2x$; $x = 3, 4.5, 6, 7.5, 9$; $y = 1.63, 2, 2.26, 2.46, 2.63$. **(a)** Estimate $\\displaystyle\\int_3^9 \\log_3 2x\\,dx$. **(b)** Using (a), estimate **(i)** $\\displaystyle\\int_3^9 \\log_3(2x)^{10}\\,dx$, **(ii)** $\\displaystyle\\int_3^9 \\log_3 18x\\,dx$.",
      steps: [
        { h: "(a)", m: "$h = 1.5$: $\\tfrac12(1.5)[1.63 + 2.63 + 2(2 + 2.26 + 2.46)] = 0.75 \\times 17.7 = 13.275 \\approx 13.3$", mk: "B1 M1 A1", n: "Values are 2 d.p., so 13.3 or 13.28 is fine." },
        { h: "(b)(i)", m: "$\\log_3(2x)^{10} = 10\\log_3 2x \\Rightarrow 10 \\times 13.275 = 132.75 \\approx 133$", mk: "M1 A1", n: "Power law. The M1 is for showing the rewrite — \"making your method clear\"." },
        { h: "(b)(ii)", m: "$\\log_3 18x = \\log_3 9 + \\log_3 2x = 2 + \\log_3 2x$\n$\\displaystyle\\int_3^9 2\\,dx + 13.275 = 12 + 13.275 = 25.275 \\approx 25.3$", mk: "A1", n: "$18x = 9 \\times 2x$; $\\log_3 9 = 2$; $\\int_3^9 2\\,dx = 2 \\times 6 = 12$." }
      ], result: "13.3; 133; 25.3" } },
    { worked: { tag: "exam", title: "Estimate, then the exact area by parts — compare", src: "A-level Oct 2021 · P1 Q11 · 8 marks",
      q: "$y = (\\ln x)^2$, $x > 0$; $x = 2, 2.5, 3, 3.5, 4$; $y = 0.4805, 0.8396, 1.2069, 1.5694, 1.9218$. **(a)** Estimate the area of $R$ (between $x = 2$ and $x = 4$) to 3 s.f. **(b)** Use algebraic integration to find the exact area in the form $a(\\ln 2)^2 + b\\ln 2 + c$.",
      steps: [
        { h: "(a)", m: "$\\tfrac12(0.5)[0.4805 + 1.9218 + 2(0.8396 + 1.2069 + 1.5694)] = 0.25 \\times 9.6341 = 2.41$", mk: "B1 M1 A1" },
        { h: "(b) Parts twice (8.6)", m: "$\\displaystyle\\int (\\ln x)^2\\,dx = x(\\ln x)^2 - \\int 2\\ln x\\,dx = x(\\ln x)^2 - 2x\\ln x + 2x$", mk: "M1 A1 M1", n: "$u = (\\ln x)^2$, $dv = dx$; then $\\int \\ln x\\,dx = x\\ln x - x$." },
        { m: "$\\left[x(\\ln x)^2 - 2x\\ln x + 2x\\right]_2^4 = (4(\\ln 4)^2 - 8\\ln 4 + 8) - (2(\\ln 2)^2 - 4\\ln 2 + 4)$", mk: "M1" },
        { m: "$\\ln 4 = 2\\ln 2$: $= 16(\\ln 2)^2 - 16\\ln 2 + 8 - 2(\\ln 2)^2 + 4\\ln 2 - 4 = 14(\\ln 2)^2 - 12\\ln 2 + 4$", mk: "A1", n: "$a = 14$, $b = -12$, $c = 4$; value $2.4086$ — the estimate $2.4085$ is a hair below (the curve is concave)." }
      ], result: "2.41; $14(\\ln 2)^2 - 12\\ln 2 + 4$" } },
    { worked: { tag: "exam", title: "Unknown ordinates: build equations from the rule and the sum", src: "A-level June 2023 · P1 Q5 · 6 marks",
      q: "Continuous curve $y = f(x)$; $x = 3, 3.2, 3.4, 3.6, 3.8, 4$; $y = a, 16.8, b, 20.2, 18.7, 13.5$. The trapezium rule with all values gives area $17.59$. **(a)** Show $a + 2b = 51$. **(b)** Given the sum of all the $y$-values is $97.2$, find $a$ and $b$.",
      steps: [
        { h: "(a) Write the rule with the unknowns in", m: "$\\tfrac12(0.2)[a + 13.5 + 2(16.8 + b + 20.2 + 18.7)] = 17.59$", mk: "B1 M1", n: "$h = 0.2$. $a$ is an end (once); $b$ is interior (twice)." },
        { m: "$0.1[a + 13.5 + 2b + 111.4] = 17.59 \\Rightarrow a + 2b + 124.9 = 175.9 \\Rightarrow a + 2b = 51$", mk: "A1*" },
        { h: "(b) Second equation", m: "$a + 16.8 + b + 20.2 + 18.7 + 13.5 = 97.2 \\Rightarrow a + b = 28$", mk: "M1" },
        { m: "Subtract: $b = 23$, $a = 5$", mk: "A1 A1" }
      ], result: "$a = 5$, $b = 23$" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command", "What they want", "Marks"], rows: [
      ["Use the trapezium rule with all the values", "$h$; bracket with numbers; answer to stated accuracy", "B1 M1 A1"],
      ["Explain how to get a better approximation", "More strips / smaller $h$", "B1"],
      ["Under- or over-estimate?", "Convex → over, concave → under, with the chord reason", "B1"],
      ["Using (a), deduce/estimate …", "Rewrite integrand as $k\\,f + c$; multiply and add $c(b - a)$", "M1 A1"],
      ["Comment on the accuracy", "Compare with the exact value; say under/over and why", "B1"],
      ["Find the unknown values", "Rule with $a, b$ in; second equation from the given sum", "M1 A1 M1 A1"]
    ] } },
    { kv: [
      ["$h$ from a table", "The common gap between $x$-values. Five ordinates from 1 to 3 means four strips, $h = 0.5$."],
      ["Ends vs middles", "First and last once; everything between twice. With a missing value $a$ at the end, it appears once."],
      ["fx-991CW", "Type the whole bracket in one line and check the count of terms inside $2(\\ldots)$ equals $n - 1$."],
      ["Accuracy", "Keep the table's values exact in the working; round the answer only. \"Deduce\" parts use the unrounded (a)."]
    ] },
    { callout: { t: "mnemonic", h: "\"Half $h$, ends once, middles twice\"", body: "The whole rule in six words." } },
    { ul: [
      "**Misconception:** $h = \\frac{b - a}{\\text{number of ordinates}}$ — it is divided by the number of **strips** ($n$ = ordinates $-$ 1).",
      "**Misconception:** deducing $\\int f(x + 1)$ or $\\int_0^6 f$ from $\\int_3^9 f$ — only linear changes to the integrand over the same limits are allowed.",
      "**Misconception:** \"under-estimate because trapezia are always smaller than curves\" — it depends on concavity."
    ] }
  ],
  flashcards: [
    ["Trapezium rule?", "$\\int_a^b y\\,dx \\approx \\frac12 h[(y_0 + y_n) + 2(y_1 + \\cdots + y_{n-1})]$, $h = \\frac{b-a}{n}$."],
    ["$n$ is the number of?", "Strips. Ordinates $= n + 1$."],
    ["Convex curve gives?", "An over-estimate (chords above the arc)."],
    ["Concave curve gives?", "An under-estimate (chords below the arc)."],
    ["Better approximation how?", "More strips (smaller $h$)."],
    ["From $\\int_3^9 \\log_3 2x \\approx 13.3$, $\\int_3^9 \\log_3 18x \\approx$?", "$\\log_3 18x = 2 + \\log_3 2x$: $12 + 13.3 = 25.3$."]
  ],
  quiz: [
    { q: "Five ordinates from $x = 1$ to $x = 3$: $h =$", opts: ["0.5", "0.4", "2", "0.25"], ans: 0, why: "Four strips: $2/4$." },
    { q: "$y$-values 1, 4, 9 at $x = 0, 1, 2$: estimate $\\int_0^2 y\\,dx$", opts: ["9", "14", "7", "18"], ans: 0, why: "$\\frac12(1)[1 + 9 + 2(4)] = 9$." },
    { q: "The rule over-estimates when the curve is", opts: ["convex (concave up)", "concave (concave down)", "increasing", "decreasing"], ans: 0, why: "Chords lie above a convex arc." },
    { q: "Given $\\int_1^3 f \\approx 1.6$, which can be deduced?", opts: ["$\\int_1^3 (2f + 1)\\,dx \\approx 5.2$", "$\\int_1^3 f(2x)\\,dx$", "$\\int_0^3 f\\,dx$", "$\\int_1^3 f^2\\,dx$"], ans: 0, why: "$2(1.6) + 1(3 - 1) = 5.2$; the others change limits or the inside of $f$." }
  ]
};

/* =====================================================================
   9.5  Numerical methods in context
   ===================================================================== */
C["maths:9.5"] = {
  notes: [
    { h: "Numerical methods in a modelling question" },
    { p: "The context questions are the same three tools (change of sign, iteration, trapezium rule) wrapped in a model. The extra marks are for **reading the model** and **interpreting the numbers with units**." },
    { table: { head: ["Cue in the question", "Mathematics", "Method"], rows: [
      ["\"the car stops\", \"leaves the ground\", \"returns to\"", "$v = 0$ or $h = 0$ — solve exactly if you can", "algebra / logs"],
      ["\"maximum speed occurs when…\"", "$\\frac{dv}{dt} = 0$ then rearrange to the printed $t = g(t)$", "9.2 derivation"],
      ["\"find, by repeated iteration, the time…\"", "iterate to convergence; state to the accuracy of the context", "9.2"],
      ["a table of speeds / flow rates / heights", "area under the graph = distance / volume", "9.4"],
      ["\"explain whether the estimate is an over-estimate\"", "shape of the graph", "9.4"],
      ["\"show that $T$ lies between…\"", "change of sign in $v(t)$", "9.1"]
    ] } },
    { worked: { tag: "exam", title: "Car between two sets of lights: $T$, the maximum-speed iteration", src: "A-level June 2022 · P1 Q8 · 8 marks",
      q: "$v = (10 - 0.4t)\\ln(t + 1)$, $0 \\le t \\le T$, models the speed (m s$^{-1}$) of a car between two sets of traffic lights. **(a)** Find $T$. **(b)** Show the maximum speed occurs when $t = \\frac{26}{1 + \\ln(t + 1)} - 1$. **(c)** With $t_{n+1} = \\frac{26}{1 + \\ln(t_n + 1)} - 1$, $t_1 = 7$: **(i)** find $t_3$ to 3 d.p.; **(ii)** find, by repeated iteration, the time taken to reach maximum speed.",
      steps: [
        { h: "(a) $v = 0$ at the second lights", m: "$10 - 0.4T = 0 \\Rightarrow T = 25$ (s)", mk: "B1", n: "$\\ln(t + 1) = 0$ gives $t = 0$ — the first lights. The other factor gives $T$." },
        { h: "(b) Product rule, $\\frac{dv}{dt} = 0$", m: "$\\dfrac{dv}{dt} = -0.4\\ln(t + 1) + \\dfrac{10 - 0.4t}{t + 1} = 0$", mk: "M1 A1", n: "$u = 10 - 0.4t$, $v = \\ln(t + 1)$." },
        { h: "Rearrange towards the target", m: "$10 - 0.4t = 0.4(t + 1)\\ln(t + 1)$\n$25 - t = (t + 1)\\ln(t + 1)$\n$26 = (t + 1)\\ln(t + 1) + (t + 1) = (t + 1)(1 + \\ln(t + 1))$", mk: "dM1", n: "Divide by 0.4; add $(t + 1)$ to both sides so the left is $26$ and the right factorises." },
        { m: "$t + 1 = \\dfrac{26}{1 + \\ln(t + 1)} \\Rightarrow t = \\dfrac{26}{1 + \\ln(t + 1)} - 1$", mk: "A1*" },
        { h: "(c)(i)", m: "$t_2 = \\dfrac{26}{1 + \\ln 8} - 1 = 7.443$, $\\quad t_3 = \\dfrac{26}{1 + \\ln 8.443} - 1 = 7.298$", mk: "M1 A1", n: "Two presses. 3 d.p." },
        { h: "(c)(ii)", m: "$t_4 = 7.344$, $t_5 = 7.329$, $t_6 = 7.334$, … $\\to 7.33$ s", mk: "A1", n: "Cobweb-type convergence (values alternate). Give a sensible accuracy for a time: 7.33 s (or 7.3 s)." }
      ], result: "$T = 25$; $t_3 = 7.298$; max speed at $t \\approx 7.33$ s" } },
    { worked: { tag: "exam", title: "Racing car: $T$ by logs, iteration for the maximum", src: "A-level June 2025 · P1 Q9 · 9 marks",
      q: "$v = 15t - t\\,e^{0.2t}$, $0 \\le t \\le T$. The car starts from rest and stops at $t = T$. **(a)** Find $T$ to 1 d.p. **(b)** Show that the maximum speed occurs when $t = 5\\ln\\left(\\frac{75}{5 + t}\\right)$. **(c)** With $t_1 = 8$: **(i)** find $t_3$ to 3 d.p.; **(ii)** find, by repeated iteration, the time taken to reach maximum speed.",
      steps: [
        { h: "(a)", m: "$t(15 - e^{0.2t}) = 0 \\Rightarrow e^{0.2T} = 15 \\Rightarrow T = 5\\ln 15 = 13.5$ (s)", mk: "M1 A1", n: "Factorise out $t$; $t = 0$ is the start. $5\\ln 15 = 13.54$." },
        { h: "(b)", m: "$\\dfrac{dv}{dt} = 15 - e^{0.2t} - 0.2t\\,e^{0.2t} = 0$", mk: "M1 A1", n: "Product rule on $t\\,e^{0.2t}$." },
        { m: "$e^{0.2t}(1 + 0.2t) = 15 \\Rightarrow e^{0.2t} = \\dfrac{15}{1 + 0.2t} = \\dfrac{75}{5 + t}$", mk: "dM1", n: "Multiply top and bottom by 5 to reach the printed fraction." },
        { m: "$0.2t = \\ln\\dfrac{75}{5 + t} \\Rightarrow t = 5\\ln\\left(\\dfrac{75}{5 + t}\\right)$", mk: "A1*" },
        { h: "(c)(i)", m: "$t_2 = 5\\ln\\dfrac{75}{13} = 8.763$, $\\quad t_3 = 5\\ln\\dfrac{75}{13.763} = 8.478$", mk: "M1 A1" },
        { h: "(c)(ii)", m: "$t_4 = 8.582$, $t_5 = 8.544$, $t_6 = 8.558$, … $\\to 8.55$ s", mk: "A1", n: "State the converged value to 2 or 3 d.p.: $8.554$ s." }
      ], result: "$T = 13.5$ s; $t_3 = 8.478$; max at $t \\approx 8.55$ s" } },
    { worked: { tag: "exam", title: "Maximum of $(8 - x)\\ln x$: derive, locate, iterate", src: "A-level Specimen · P2 Q6 · 9 marks",
      q: "$f(x) = (8 - x)\\ln x$, $x > 0$, cuts the $x$-axis at $A$ and $B$ and has a maximum at $Q$. **(a)** Find the $x$-coordinates of $A$ and $B$. **(b)** Show that the $x$-coordinate of $Q$ satisfies $x = \\frac{8}{1 + \\ln x}$. **(c)** Show that it lies between 3.5 and 3.6. **(d)** Iterate from $x_1 = 3.5$ to find $x_5$ (4 d.p.) and $x_Q$ (2 d.p.).",
      steps: [
        { h: "(a)", m: "$\\ln x = 0 \\Rightarrow x = 1$; $8 - x = 0 \\Rightarrow x = 8$", mk: "B1", n: "$A(1, 0)$, $B(8, 0)$." },
        { h: "(b) Product rule", m: "$f'(x) = -\\ln x + \\dfrac{8 - x}{x} = 0 \\Rightarrow x\\ln x = 8 - x \\Rightarrow x(\\ln x + 1) = 8 \\Rightarrow x = \\dfrac{8}{1 + \\ln x}$", mk: "M1 A1 dM1 A1*", n: "Multiply by $x$, collect the $x$ terms, factorise $x$ out." },
        { h: "(c) Change of sign", m: "$g(x) = x\\ln x + x - 8$ (or $f'(x)$): $g(3.5) = -0.115 < 0$, $g(3.6) = 0.211 > 0$; sign change, continuous $\\Rightarrow 3.5 < x_Q < 3.6$", mk: "M1 A1", n: "Any correct $=0$ form works; $f'(3.5) = 0.033 > 0$, $f'(3.6) = -0.059 < 0$ equally." },
        { h: "(d)", m: "$x_2 = 3.5512$, $x_3 = 3.5285$, $x_4 = 3.5385$, $x_5 = 3.5340$; converges to $3.54$", mk: "M1 A1", n: "See 9.2." }
      ], result: "$A(1,0)$, $B(8,0)$; $x_5 = 3.5340$; $x_Q = 3.54$" } },
    { callout: { t: "key", h: "Interpreting in context — the marks people forget", body: [
      "**Units**: $T = 25$ **seconds**; distance 415 **m**; \"the car reaches its maximum speed after about 7.3 s\".",
      "**Sense-check**: a maximum-speed time must lie between 0 and $T$; a runway length must be positive and plausible.",
      "**Which root**: $v = t(15 - e^{0.2t})$ has roots $t = 0$ (start) and $t = T$ (stop) — name the one the question wants.",
      "**Accuracy**: the iteration can give 5 d.p.; a time in a model is sensibly quoted to 2 or 3 d.p. unless told otherwise. Give what is asked."
    ] } },

    { page: "Exam toolkit" },
    { table: { head: ["Command", "What they want", "Marks"], rows: [
      ["Find the value of $T$", "Solve $v = 0$ (factorise; reject $t = 0$); units", "M1 A1"],
      ["Show the maximum occurs when $t = g(t)$", "$\\frac{dv}{dt} = 0$ by product/chain rule; algebra to the printed form", "M1 A1 dM1 A1*"],
      ["Find $t_3$ to 3 d.p.", "Two iterations from $t_1$", "M1 A1"],
      ["Find, by repeated iteration, the time…", "Iterate to stability; state the value with units", "A1"],
      ["Estimate the distance / volume from a table", "Trapezium rule on the table", "B1 M1 A1"],
      ["Over/under-estimate in context", "Shape of the graph from the physics (\"accelerated smoothly\" → convex)", "B1"]
    ] } },
    { kv: [
      ["Reading the rearrangement", "The printed $t = g(t)$ tells you the target: if it has $\\ln$, you will take logs; if it has a fraction with $t$ in the denominator, you will factorise $(t + 1)$ or $(5 + t)$ out."],
      ["fx-991CW", "Iterate with **Ans**; for the derivative check, evaluate $\\frac{dv}{dt}$ at the converged $t$ with the $\\frac{d}{dx}$ key — it should be $\\approx 0$."],
      ["Modelling limitations", "If asked: the model ignores reaction time / assumes smooth acceleration / $v$ is exactly zero at $T$."]
    ] },
    { callout: { t: "mnemonic", h: "\"Stop, top, iterate\"", body: "Context questions run: where does it **stop** ($v = 0$), where is the **top** ($\\frac{dv}{dt} = 0$, rearranged), then **iterate** and interpret." } },
    { ul: [
      "**Misconception:** setting $v = 0$ to find the maximum speed. Maximum speed is $\\frac{dv}{dt} = 0$; $v = 0$ is stopping.",
      "**Misconception:** forgetting $t = 0$ is also a root of $v = t(\\ldots)$ and dividing it away without comment — fine, but say the car *starts* at $t = 0$.",
      "**Misconception:** quoting the maximum speed when the question asked for the *time* at which it occurs."
    ] }
  ],
  flashcards: [
    ["Model $v(t)$, \"the car stops at $t = T$\": equation?", "$v(T) = 0$."],
    ["\"Maximum speed occurs when…\": equation?", "$\\frac{dv}{dt} = 0$, rearranged to the printed $t = g(t)$."],
    ["June 2022 P1 Q8: $v = (10 - 0.4t)\\ln(t+1)$, $T = $?", "25 s."],
    ["June 2025 P1 Q9: $v = 15t - te^{0.2t}$, $T =$?", "$5\\ln 15 \\approx 13.5$ s."],
    ["A table of speeds at equal times: distance?", "Trapezium rule — area under the $v$–$t$ graph."]
  ],
  quiz: [
    { q: "$v = t(12 - e^{0.3t})$ stops when", opts: ["$t = \\frac{\\ln 12}{0.3}$", "$t = 12$", "$t = e^{0.3}$", "$t = 0.3\\ln 12$"], ans: 0, why: "$e^{0.3t} = 12$." },
    { q: "\"Find the time of maximum speed\" starts with", opts: ["$\\frac{dv}{dt} = 0$", "$v = 0$", "$\\int v\\,dt$", "$v = v_{max}$"], ans: 0, why: "Stationary point of $v$." },
    { q: "Speeds 0, 4, 10 m/s at 0, 2, 4 s: distance ≈", opts: ["18 m", "14 m", "28 m", "9 m"], ans: 0, why: "$\\frac12(2)[0 + 10 + 2(4)] = 18$." },
    { q: "A converged iteration gives $t = 7.3328\\ldots$ s. Best statement?", opts: ["max speed at $t \\approx 7.33$ s", "$t = 7.3328$ exactly", "$v = 7.33$", "$T = 7.33$"], ans: 0, why: "Sensible accuracy, correct quantity, units." }
  ]
};


/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
