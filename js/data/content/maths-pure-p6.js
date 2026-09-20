/* Kurenai OS — deep content: Pure Mathematics, section P6 (Exponentials
   and logarithms) at full A-level depth. Same contract as maths-pure-p4.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* =====================================================================
   6.1  Exponential functions and e^x
   ===================================================================== */
C["maths:6.1"] = {
  notes: [
    { h: "Exponential functions — the whole topic on one page" },
    "$y = a^x$ for a positive base $a$: the variable is in the **power**. One special base, $e = 2.71828\\ldots$, has the property that the gradient of $y = e^x$ equals its own value — which is why every growth-and-decay model in the course is written with $e$.",
    { ul: [
      "$y = a^x$ passes through $(0, 1)$, is always positive, has the $x$-axis as an asymptote; **increasing** if $a > 1$, **decreasing** if $0 < a < 1$.",
      "$y = e^{ax + b} + c$: the same shape stretched/shifted; asymptote $y = c$; $y$-intercept $e^b + c$.",
      "Equations $a^x = b$ and $e^{ax + b} = p$ are solved with logs (6.3, 6.5)."
    ] },
    { fig: { x: [-3, 3], y: [-0.5, 8], axes: { xt: [-2, -1, 1, 2], yt: [2, 4, 6, 8] }, items: [
      { fn: "exp(x)", label: "y = eˣ", at: 1.9, pos: "w" },
      { fn: "2^x", c: "accent3", label: "y = 2ˣ", at: 2.7, pos: "w" },
      { fn: "0.5^x", c: "accent2", label: "y = (½)ˣ", at: -2.7, pos: "e" },
      { pt: [0, 1], label: "(0, 1)", pos: "se" }
    ], cap: "All three pass through $(0, 1)$ and never reach the $x$-axis. Bases above 1 grow; a base between 0 and 1 decays (it is $2^{-x}$, the reflection of $2^x$ in the $y$-axis)." } },

    { page: "The graphs and $e$" },
    { callout: { t: "def", h: "The number $e$", body: "$e \\approx 2.718$ is the base for which $\\frac{d}{dx}(e^x) = e^x$: the curve's gradient at every point equals its height. More generally $\\frac{d}{dx}(e^{kx}) = ke^{kx}$ (6.2). Any exponential can be written with base $e$: $a^x = e^{x\\ln a}$, so $2^x = e^{0.693x}$." } },
    { table: { head: ["Curve", "$y$-intercept", "Asymptote", "Shape"], rows: [
      ["$y = e^x$", "$(0, 1)$", "$y = 0$", "increasing, gradient $= y$"],
      ["$y = e^{-x}$", "$(0, 1)$", "$y = 0$", "decreasing; reflection of $e^x$ in the $y$-axis"],
      ["$y = e^{2x + 1}$", "$(0, e)$", "$y = 0$", "steeper; $2x + 1 = 0$ at $x = -\\frac12$ gives $y = 1$"],
      ["$y = 3e^{-0.5x} + 2$", "$(0, 5)$", "$y = 2$", "decays from 5 towards 2"],
      ["$y = 4 - e^{x}$", "$(0, 3)$", "$y = 4$", "decreasing; crosses the $x$-axis at $x = \\ln 4$"],
      ["$y = 4^x$", "$(0, 1)$", "$y = 0$", "as $2^{2x}$: twice as fast as $2^x$"]
    ] } },
    { worked: { tag: "exam", title: "Sketch $y = 4^x$ and solve $4^x = 100$", src: "A-level June 2022 · P2 Q2 · 4 marks",
      q: "**(a)** Sketch $y = 4^x$, stating any points of intersection with the axes. **(b)** Solve $4^x = 100$ to 2 d.p.",
      steps: [
        { h: "(a)", m: "Increasing exponential through $(0, 1)$, asymptote the $x$-axis, no $x$-intercept.", mk: "B1 B1", n: "Draw it approaching the axis on the left without touching, and mark $(0, 1)$." },
        { h: "(b) Logs of both sides", m: "$x\\ln 4 = \\ln 100 \\Rightarrow x = \\dfrac{\\ln 100}{\\ln 4} = 3.32$", mk: "M1 A1", n: "Any base works: $\\frac{\\log 100}{\\log 4} = \\frac{2}{0.602}$." }
      ], result: "(b) $x = 3.32$" } },
    { worked: { tag: "example", title: "Sketching $y = e^{ax + b} + c$: read off intercept and asymptote", src: "routine",
      q: "Sketch $y = 3e^{-0.5x} + 2$ and $y = 4 - e^x$, giving the intercepts and asymptotes.",
      steps: [
        { m: "$y = 3e^{-0.5x} + 2$: at $x = 0$, $y = 5$; as $x \\to \\infty$, $e^{-0.5x} \\to 0$ so $y \\to 2$ (asymptote $y = 2$); as $x \\to -\\infty$, $y \\to \\infty$. Decreasing throughout.", fig: { x: [-3, 8], y: [-1, 10], axes: { xt: [-2, 2, 4, 6], yt: [2, 5, 8] }, items: [ { fn: "3*exp(-0.5*x)+2", label: "y = 3e^(−0.5x) + 2", at: 6, pos: "n" }, { hline: 2, c: "accent3", label: "y = 2" }, { pt: [0, 5], label: "(0, 5)", pos: "e" } ], cap: "Decay towards the asymptote $y = 2$; the $y$-intercept is $3 + 2 = 5$." } },
        { m: "$y = 4 - e^x$: at $x = 0$, $y = 3$; asymptote $y = 4$ (as $x \\to -\\infty$); crosses the $x$-axis where $e^x = 4$, $x = \\ln 4 \\approx 1.39$. Decreasing, falling steeply to the right." }
      ] } },

    { page: "Exam toolkit" },
    { ul: [
      "**Asymptote of $e^{\\ldots} + c$ is $y = c$**, and it must be drawn and labelled.",
      "**$y$-intercept**: put $x = 0$ — $e^{b} + c$, not $1 + c$ unless $b = 0$.",
      "**$e^{-x}$ never reaches 0** and is never negative: $e^{-x} = -2$ has no solution.",
      "**Base between 0 and 1 decays**; do not draw it increasing.",
      "**$a^x = b$**: logs (6.5) — not guess-and-check."
    ] },
    { callout: { t: "mnemonic", h: "\"Through one, never zero, $c$ is the floor\"", body: "$a^x$ passes through $(0, 1)$, is never zero, and adding $c$ lifts the asymptote to $y = c$." } }
  ],
  flashcards: [
    ["Key features of $y = a^x$, $a > 1$?", "Through $(0, 1)$, positive, increasing, asymptote $y = 0$."],
    ["What is special about $y = e^x$?", "Its gradient equals its value: $\\frac{d}{dx}e^x = e^x$."],
    ["Asymptote and $y$-intercept of $y = 3e^{-0.5x} + 2$?", "$y = 2$; $(0, 5)$."],
    ["Solve $4^x = 100$.", "$x = \\frac{\\ln100}{\\ln4} = 3.32$."],
    ["$y = (\\frac12)^x$ compared with $y = 2^x$?", "Reflection in the $y$-axis (since $(\\frac12)^x = 2^{-x}$); decreasing."],
    ["Write $2^x$ with base $e$.", "$e^{x\\ln 2}$."],
    ["Where does $y = 4 - e^x$ cross the $x$-axis?", "$x = \\ln 4$."]
  ],
  quiz: [
    { q: "$y = e^{x} + 3$ has asymptote", opts: ["$y = 3$", "$y = 0$", "$x = 3$", "$y = 1$"], ans: 0, why: "$e^x \\to 0$." },
    { q: "$y$-intercept of $y = 2e^{x + 1}$:", opts: ["2", "$2e$", "$e$", "3"], ans: 1, why: "$2e^1$." },
    { q: "$y = 0.7^x$ is", opts: ["increasing", "decreasing", "constant", "undefined"], ans: 1, why: "Base less than 1." },
    { q: "$e^{2x} = 5$ gives $x =$", opts: ["$\\tfrac12\\ln 5$", "$\\ln\\tfrac52$", "$2\\ln5$", "$\\ln 5$"], ans: 0, why: "$2x = \\ln 5$." },
    { q: "$y = e^{-x}$ and $y = e^x$ are related by", opts: ["reflection in the $y$-axis", "reflection in the $x$-axis", "translation", "stretch"], ans: 0, why: "$x \\to -x$." }
  ]
};

/* =====================================================================
   6.2  The gradient of e^{kx}
   ===================================================================== */
C["maths:6.2"] = {
  notes: [
    { h: "Why $e$ — the gradient of $e^{kx}$" },
    { callout: { t: "memorise", h: "The one fact", body: [
      "$$\\dfrac{d}{dx}\\left(e^{kx}\\right) = ke^{kx}$$",
      "The rate of change of $e^{kx}$ is **proportional to its value**, with constant $k$. So whenever a quantity grows or decays at a rate proportional to itself — populations, radioactivity, cooling, money at compound interest — the model is $y = Ae^{kx}$. That is the reason exponential models are everywhere, and the reason $e$ (not 2 or 10) is the natural base."
    ] } },
    { fig: { x: [-1, 3], y: [-1, 9], axes: { xt: [1, 2], yt: [2, 4, 6, 8] }, items: [
      { fn: "exp(x)", label: "y = eˣ", at: 2.1, pos: "w" },
      { fn: "exp(1)*(x-1)+exp(1)", c: "accent3", dash: true, label: "gradient e at (1, e)", at: 2.5, pos: "s" },
      { pt: [1, Math.E], label: "(1, e)", pos: "nw" }, { pt: [0, 1], label: "gradient 1 at (0, 1)", pos: "e" }
    ], cap: "At $(1, e)$ the tangent has gradient $e$; at $(0, 1)$ it has gradient 1. Height and gradient are always equal on $y = e^x$." } },
    { ul: [
      "$\\frac{d}{dx}\\left(Ae^{kx}\\right) = kAe^{kx}$: the same proportionality, constant $k$ — negative $k$ means decay.",
      "**Interpreting $k$**: in $N = 1000e^{0.139t}$, the population grows at $13.9\\%$ of its current size per hour (continuous rate). The doubling time is $\\frac{\\ln 2}{k}$.",
      "**\"Show that the rate of change can be written as $-k(V - 1500)$\"** for $V = 1500 + Ae^{-kt}$: differentiate, $\\frac{dV}{dt} = -kAe^{-kt}$, and notice $Ae^{-kt} = V - 1500$. The rate is proportional to how far $V$ is above its floor — Newton's law of cooling in disguise.",
      "Other bases: $\\frac{d}{dx}(a^x) = a^x\\ln a$, because $a^x = e^{x\\ln a}$."
    ] },
    { worked: { tag: "exam", title: "Bacteria doubling in 5 hours: find $k$, then the rate at 8 hours", src: "A-level Oct 2021 · P1 Q8(a)(b) · 6 marks",
      q: "$N = Ae^{kt}$ bacteria after $t$ hours. There were 1000 at the start and the population doubled in exactly 5 hours. **(a)** Find a complete equation for the model. **(b)** Hence find the rate of increase after exactly 8 hours, to 2 s.f.",
      steps: [
        { h: "(a) $A$ from $t = 0$; $k$ from the doubling", m: "$A = 1000$; $2000 = 1000e^{5k} \\Rightarrow e^{5k} = 2 \\Rightarrow k = \\dfrac{\\ln 2}{5} = 0.1386$\n$N = 1000e^{0.139t}$ (or $1000e^{\\frac{t\\ln2}{5}}$)", mk: "B1 M1 M1 A1", n: "Take logs to bring $k$ down: $5k = \\ln 2$." },
        { h: "(b) $\\frac{dN}{dt} = kN$", m: "$\\dfrac{dN}{dt} = 0.1386 \\times 1000e^{0.1386 \\times 8} = 0.1386 \\times 3031.4 = 420$ bacteria per hour", mk: "M1 A1", n: "Use the exact $k = \\frac{\\ln 2}{5}$ in the calculator; $e^{8\\ln2/5} = 2^{1.6}$." }
      ], result: "(a) $N = 1000e^{(\\ln 2/5)t}$ (b) $\\approx 420$ per hour" } },
    { worked: { tag: "exam", title: "Rate of change written in terms of $V$", src: "A-level June 2025 · P1 Q11(b)(c) · 4 marks",
      q: "$V = 1500 + Ae^{-kt}$ models a car's value. **(b)** Show that the rate of change of $V$ can be expressed as $-k(V - 1500)$. **(c)** State a limitation of the model.",
      steps: [
        { h: "(b)", m: "$\\dfrac{dV}{dt} = -kAe^{-kt}$, and from the model $Ae^{-kt} = V - 1500$, so $\\dfrac{dV}{dt} = -k(V - 1500)$", mk: "M1 A1 A1*", n: "Differentiate, then substitute the model back in. The value loses a fixed proportion $k$ of its *excess over £1500* each year." },
        { h: "(c)", m: "The value never falls below £1500 (never reaches it); or the depreciation rate is assumed to stay proportional for ever; or damage/mileage are ignored.", mk: "B1" }
      ], result: "shown" } }
  ],
  flashcards: [
    ["$\\frac{d}{dx}(e^{kx}) = $?", "$ke^{kx}$."],
    ["Why is $e$ the natural base for growth models?", "Because $\\frac{d}{dx}e^{kx} = ke^{kx}$: the rate is proportional to the value, which is exactly what growth/decay processes do."],
    ["Doubling time for $N = Ae^{kt}$?", "$\\frac{\\ln 2}{k}$."],
    ["$V = 1500 + Ae^{-kt}$: $\\frac{dV}{dt}$ in terms of $V$?", "$-k(V - 1500)$."],
    ["$\\frac{d}{dx}(2^x) = $?", "$2^x\\ln 2$."],
    ["Bacteria $1000 \\to 2000$ in 5 h with $N = 1000e^{kt}$: $k$?", "$\\frac{\\ln 2}{5} \\approx 0.139$."]
  ],
  quiz: [
    { q: "$\\frac{d}{dx}(e^{3x}) =$", opts: ["$3e^{3x}$", "$e^{3x}$", "$3xe^{3x}$", "$e^{3}$"], ans: 0, why: "Chain rule with $k = 3$." },
    { q: "The gradient of $y = e^x$ at $x = 2$ is", opts: ["$e^2$", "2", "$2e$", "$e$"], ans: 0, why: "Equals the value." },
    { q: "A quantity whose rate of change is proportional to itself is modelled by", opts: ["$y = Ae^{kt}$", "$y = At + k$", "$y = At^2$", "$y = A\\ln t$"], ans: 0, why: "Defining property of exponentials." },
    { q: "$\\frac{d}{dt}(5e^{-0.2t}) =$", opts: ["$-e^{-0.2t}$", "$-0.2e^{-0.2t}$", "$5e^{-0.2t}$", "$-5e^{-0.2t}$"], ans: 0, why: "$5 \\times (-0.2)$." }
  ]
};

/* =====================================================================
   6.3  Logarithms and ln x
   ===================================================================== */
C["maths:6.3"] = {
  notes: [
    { h: "Logarithms — the whole topic on one page" },
    { callout: { t: "def", h: "The definition", body: [
      "$$\\log_a x = y \\iff a^y = x \\qquad (a > 0, a \\ne 1, x > 0)$$",
      "\"$\\log_a x$ is the power you raise $a$ to, to get $x$.\" $\\log_2 8 = 3$ because $2^3 = 8$; $\\log_{10} 0.01 = -2$; $\\log_a a = 1$; $\\log_a 1 = 0$.",
      "$\\ln x = \\log_e x$, the inverse of $e^x$: $\; e^{\\ln x} = x$ and $\\ln(e^x) = x$. $\\log x$ with no base means $\\log_{10}$ on this course."
    ] } },
    { fig: { x: [-2, 7], y: [-3, 5], aspect: "equal", axes: { xt: [1, 2, 4, 6], yt: [-2, 2, 4] }, items: [
      { fn: "exp(x)", from: -2, to: 1.6, c: "accent3", label: "y = eˣ", at: 1.35, pos: "w" },
      { fn: "ln(x)", from: 0.05, to: 7, label: "y = ln x", at: 6, pos: "s" },
      { fn: "x", c: "muted", dash: true, label: "y = x", at: 4.5, pos: "se" },
      { pt: [1, 0], label: "(1, 0)", pos: "s" }, { pt: [0, 1], c: "accent3", label: "(0, 1)", pos: "w" }, { pt: [Math.E, 1], label: "(e, 1)", pos: "se" }
    ], cap: "$y = \\ln x$ is the reflection of $y = e^x$ in $y = x$: through $(1, 0)$, vertical asymptote $x = 0$ (the $y$-axis), defined only for $x > 0$, increasing slowly." } },

    { page: "Using the definition" },
    { table: { head: ["Equation", "Undo with", "Solution"], rows: [
      ["$e^{2x + 1} = 7$", "$\\ln$ both sides", "$2x + 1 = \\ln 7 \\Rightarrow x = \\frac{\\ln 7 - 1}{2}$"],
      ["$\\ln(3x - 2) = 4$", "$e$ both sides", "$3x - 2 = e^4 \\Rightarrow x = \\frac{e^4 + 2}{3}$"],
      ["$\\log_3(2x) = 4$", "definition", "$2x = 3^4 \\Rightarrow x = 40.5$"],
      ["$5 + 3e^{-0.5t} = 8$", "isolate the exponential first", "$e^{-0.5t} = 1 \\Rightarrow t = 0$"],
      ["$4^{3p - 1} = 5^{210}$", "logs of both sides", "$(3p - 1)\\ln 4 = 210\\ln 5$"],
      ["$\\ln x = \\ln 5 + 2$", "combine, then $e$", "$x = 5e^2$"]
    ] } },
    { callout: { t: "warn", h: "Isolate, then undo", body: "$3e^{2x} + 5 = 20$: subtract 5 and divide by 3 **before** taking logs ($e^{2x} = 5$, $x = \\frac12\\ln 5$). Taking $\\ln$ of a sum does nothing useful — $\\ln(3e^{2x} + 5)$ cannot be simplified. Likewise $\\log_3(2x) = 4$ is $2x = 81$, not $2x = 4^3$." } },
    { worked: { tag: "exam", title: "Solve $4^{3p - 1} = 5^{210}$ by taking logs", src: "A-level Oct 2020 · P1 Q2 · 3 marks",
      q: "By taking logarithms of both sides, solve $4^{3p - 1} = 5^{210}$, giving $p$ to one decimal place.",
      steps: [
        { m: "$(3p - 1)\\ln 4 = 210\\ln 5$", mk: "M1", n: "Power law: the exponent comes down as a multiplier. Numbers this big are why you cannot just evaluate." },
        { m: "$3p - 1 = \\dfrac{210\\ln 5}{\\ln 4} = 243.8 \\Rightarrow p = 81.6$", mk: "M1 A1" }
      ], result: "$p = 81.6$" } },
    { worked: { tag: "exam", title: "Newton cooling: complete the model, find a time, evaluate", src: "A-level Specimen · P2 Q3 · 4 marks",
      q: "The temperature of tea is $\\theta = 25 + Ae^{-0.03t}$ °C after $t$ minutes; it was $75$ °C at $t = 0$. **(a)** Find a complete equation. **(b)** Find the time to cool from $75$ °C to $60$ °C, to one decimal place. **(c)** Two hours later the tea measured $20.3$ °C. Evaluate the model.",
      steps: [
        { h: "(a)", m: "$75 = 25 + A \\Rightarrow A = 50$: $\\theta = 25 + 50e^{-0.03t}$", mk: "B1" },
        { h: "(b) Isolate, then $\\ln$", m: "$60 = 25 + 50e^{-0.03t} \\Rightarrow e^{-0.03t} = 0.7 \\Rightarrow t = -\\dfrac{\\ln 0.7}{0.03} = 11.9$ min", mk: "M1 A1" },
        { h: "(c) $t = 120$", m: "Model: $25 + 50e^{-3.6} = 26.4$ °C, but the tea was $20.3$ °C — **below** the model's floor of 25 °C. The model is not accurate (the room temperature is not 25 °C / the tea cooled below the assumed limit).", mk: "B1", n: "The comparison and the reason." }
      ], result: "(a) $\\theta = 25 + 50e^{-0.03t}$ (b) $11.9$ min (c) unreliable — measured value below the model's limit" } },
    { worked: { tag: "exam", title: "Tea at room temperature 18 °C: value at $t = 0$, time to 35 °C, why not 15 °C", src: "AS June 2020 · P1 Q8(a)(b)(c) · 5 marks",
      q: "$\\theta = 18 + 65e^{-t/8}$. **(a)** Find the temperature when the cup was placed on the table. **(b)** Find $t$, to 1 d.p., when the temperature was $35$ °C. **(c)** Explain why the temperature cannot fall to $15$ °C.",
      steps: [
        { h: "(a)", m: "$18 + 65 = 83$ °C", mk: "B1" },
        { h: "(b)", m: "$65e^{-t/8} = 17 \\Rightarrow -\\dfrac{t}{8} = \\ln\\dfrac{17}{65} \\Rightarrow t = 8\\ln\\dfrac{65}{17} = 10.7$ min", mk: "M1 M1 A1" },
        { h: "(c)", m: "$e^{-t/8} > 0$ for all $t$, so $\\theta > 18$ always; 15 is below the asymptote.", mk: "B1" }
      ], result: "(a) 83 °C (b) 10.7 (c) $\\theta > 18$" } },
    { worked: { tag: "exam", title: "Tyre pressure: state $k$, time to reach 1, rate at $t = 2$", src: "AS June 2022 · P1 Q8 · 6 marks",
      q: "$P = k + 1.4e^{-0.5t}$ kg/cm$^2$; initially $P = 2.2$. **(a)** State $k$. **(b)** Find the time for $P$ to fall to $1$, to 1 d.p. **(c)** Find the rate of decrease of pressure at $t = 2$, to 3 s.f.",
      steps: [
        { h: "(a)", m: "$2.2 = k + 1.4 \\Rightarrow k = 0.8$", mk: "B1" },
        { h: "(b)", m: "$0.8 + 1.4e^{-0.5t} = 1 \\Rightarrow e^{-0.5t} = \\dfrac17 \\Rightarrow t = 2\\ln 7 = 3.9$ min", mk: "M1 A1 A1" },
        { h: "(c)", m: "$\\dfrac{dP}{dt} = -0.7e^{-0.5t}$; at $t = 2$: $-0.7e^{-1} = -0.258$; decreasing at $0.258$ kg/cm$^2$ per minute", mk: "M1 A1", n: "\"Rate of decrease\" is stated positive: 0.258." }
      ], result: "(a) 0.8 (b) 3.9 min (c) 0.258 kg/cm² per min" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Taking logs of a sum**: isolate the exponential term first.",
      "**$\\log_a x = y$ means $a^y = x$** — get the base and the power the right way round.",
      "**$\\ln$ of a negative or zero** is undefined: reject such solutions (6.4).",
      "**Sign when dividing by a negative**: $-0.03t = \\ln 0.7$ gives $t = +11.9$.",
      "**Exact form**: leave $\\frac{\\ln 7 - 1}{2}$ when asked for exact; round only when told."
    ] },
    { callout: { t: "mnemonic", h: "\"Log is the power\"", body: "$\\log_a x$ answers the question: $a$ to what power gives $x$? Say it to yourself and $\\log_2 8 = 3$ is automatic." } }
  ],
  flashcards: [
    ["$\\log_a x = y$ means…", "$a^y = x$."],
    ["$\\ln x$ is the inverse of…", "$e^x$: $e^{\\ln x} = x$, $\\ln e^x = x$."],
    ["Graph of $y = \\ln x$: key features?", "Through $(1, 0)$, asymptote $x = 0$, only for $x > 0$, increasing."],
    ["Solve $e^{2x+1} = 7$.", "$x = \\frac{\\ln7 - 1}{2}$."],
    ["Solve $\\ln(3x - 2) = 4$.", "$x = \\frac{e^4 + 2}{3}$."],
    ["Solve $4^{3p-1} = 5^{210}$.", "$(3p-1)\\ln4 = 210\\ln5$, $p = 81.6$."],
    ["Why can $18 + 65e^{-t/8}$ never be 15?", "$e^{-t/8} > 0$ so the value always exceeds 18."],
    ["$\\log_a 1$ and $\\log_a a$?", "0 and 1."],
    ["Time for $25 + 50e^{-0.03t}$ to reach 60?", "$e^{-0.03t} = 0.7$, $t = 11.9$."]
  ],
  quiz: [
    { q: "$\\log_2 32 =$", opts: ["5", "16", "4", "6"], ans: 0, why: "$2^5$." },
    { q: "$\\ln e^3 =$", opts: ["3", "$e^3$", "$3e$", "1"], ans: 0, why: "Inverse functions." },
    { q: "$\\log_{10} 0.001 =$", opts: ["$-3$", "3", "$-1$", "0.001"], ans: 0, why: "$10^{-3}$." },
    { q: "$3e^{2x} + 5 = 20$: first step", opts: ["take ln of both sides", "$e^{2x} = 5$", "$2x = \\ln 15$", "$x = \\ln 20 - 5$"], ans: 1, why: "Isolate first." },
    { q: "$\\ln(x - 2) = 0$ gives $x =$", opts: ["3", "2", "$e$", "$e + 2$"], ans: 0, why: "$x - 2 = 1$." },
    { q: "Domain of $y = \\ln x$:", opts: ["$x > 0$", "$x \\ge 0$", "all $x$", "$x > 1$"], ans: 0, why: "Logs of positives only." }
  ]
};

/* =====================================================================
   6.4  Laws of logarithms
   ===================================================================== */
C["maths:6.4"] = {
  notes: [
    { h: "Laws of logarithms — the whole topic on one page" },
    { callout: { t: "memorise", h: "Three laws (not in the booklet)", body: [
      "$$\\log_a x + \\log_a y = \\log_a(xy) \\qquad \\log_a x - \\log_a y = \\log_a\\frac{x}{y} \\qquad k\\log_a x = \\log_a x^k$$",
      "Special cases of the power law: $\\log_a\\frac1x = -\\log_a x$ and $\\log_a\\sqrt x = \\frac12\\log_a x$. Also $\\log_a a = 1$, so a bare number $2$ can be written $2\\log_a a = \\log_a a^2$.",
      "**There is no law for $\\log(x + y)$.** $\\log a - \\log b \\ne \\log(a - b)$ (a 2019 question is built on exactly this)."
    ] } },
    { callout: { t: "tip", h: "Why the laws hold", body: "They are the index laws in disguise. If $x = a^m$ and $y = a^n$ then $xy = a^{m + n}$, so $\\log_a(xy) = m + n = \\log_a x + \\log_a y$. The quotient and power laws come from $a^m \\div a^n = a^{m - n}$ and $(a^m)^k = a^{mk}$ the same way." } },

    { page: "Solving log equations" },
    { callout: { t: "memorise", h: "Method", body: [
      "1. Move any coefficient inside as a power: $2\\log_3(x + 1) = \\log_3(x + 1)^2$.",
      "2. Write bare numbers as logs of the same base: $1 = \\log_3 3$, $2 = \\log_5 25$.",
      "3. Combine each side into a **single** log with the product/quotient laws.",
      "4. $\\log_a P = \\log_a Q \\Rightarrow P = Q$ (or $\\log_a P = c \\Rightarrow P = a^c$).",
      "5. Solve — usually a quadratic — and **reject** any root that makes a log argument zero or negative in the *original* equation."
    ] } },
    { worked: { tag: "exam", title: "$2\\log_3(x + 1) = 1 + \\log_3(x + 7)$", src: "AS June 2025 · P1 Q10 · 5 marks",
      q: "Solve $2\\log_3(x + 1) = 1 + \\log_3(x + 7)$, showing all stages of your working.",
      steps: [
        { m: "$\\log_3(x + 1)^2 = \\log_3 3 + \\log_3(x + 7) = \\log_3 3(x + 7)$", mk: "M1 M1", n: "Power law on the left; $1 = \\log_3 3$ and the product law on the right." },
        { m: "$(x + 1)^2 = 3(x + 7) \\Rightarrow x^2 - x - 20 = 0 \\Rightarrow (x - 5)(x + 4) = 0$", mk: "M1 A1" },
        { m: "$x = -4$ makes $\\log_3(x + 1) = \\log_3(-3)$, undefined — reject. $x = 5$.", mk: "A1", n: "The rejection must be **written**." }
      ], result: "$x = 5$" } },
    { worked: { tag: "exam", title: "$2\\log_4(2 - x) - \\log_4(x + 5) = 1$", src: "AS Specimen · P1 Q9 · 6 marks",
      q: "Find any real values of $x$ such that $2\\log_4(2 - x) - \\log_4(x + 5) = 1$.",
      steps: [
        { m: "$\\log_4\\dfrac{(2 - x)^2}{x + 5} = 1 \\Rightarrow \\dfrac{(2 - x)^2}{x + 5} = 4$", mk: "M1 M1 A1", n: "$\\log_4 P = 1 \\Rightarrow P = 4^1$." },
        { m: "$4 - 4x + x^2 = 4x + 20 \\Rightarrow x^2 - 8x - 16 = 0 \\Rightarrow x = 4 \\pm 4\\sqrt2$", mk: "M1 A1" },
        { m: "Need $2 - x > 0$ and $x + 5 > 0$: $x = 4 + 4\\sqrt2 \\approx 9.7$ fails the first; $x = 4 - 4\\sqrt2 \\approx -1.66$ satisfies both.", mk: "A1", n: "Check **every** log argument, not just one." }
      ], result: "$x = 4 - 4\\sqrt2$" } },
    { worked: { tag: "exam", title: "Show the quadratic, then say which root is extraneous", src: "A-level June 2023 · P2 Q3 · 5 marks",
      q: "**(a)** Given $\\log_2(x + 3) + \\log_2(x + 10) = 2 + 2\\log_2 x$, show that $3x^2 - 13x - 30 = 0$. **(b)(i)** Write down the roots of $3x^2 - 13x - 30 = 0$. **(ii)** Hence state which root is **not** a solution of the log equation, with a reason.",
      steps: [
        { h: "(a)", m: "$\\log_2(x + 3)(x + 10) = \\log_2 4 + \\log_2 x^2 = \\log_2 4x^2$\n$(x + 3)(x + 10) = 4x^2 \\Rightarrow x^2 + 13x + 30 = 4x^2 \\Rightarrow 3x^2 - 13x - 30 = 0$", mk: "M1 M1 A1*" },
        { h: "(b)", m: "(i) $(3x + 5)(x - 6) = 0$: $x = 6$, $x = -\\dfrac53$. (ii) $x = -\\dfrac53$ is not a solution: $\\log_2 x$ (and $\\log_2(x + \\ldots)$ negative arguments) is undefined for negative $x$.", mk: "B1 B1" }
      ], result: "$x = 6$; $-\\frac53$ rejected" } },
    { worked: { tag: "exam", title: "Express in terms of $a$ and $b$", src: "A-level June 2023 · P1 Q6 · 6 marks",
      q: "$a = \\log_2 x$, $b = \\log_2(x + 8)$. Express in terms of $a$ and/or $b$: **(a)** $\\log_2\\sqrt x$; **(b)** $\\log_2(x^2 + 8x)$; **(c)** $\\log_2\\left(8 + \\frac{64}{x}\\right)$ in simplest form.",
      steps: [
        { h: "(a)", m: "$\\log_2 x^{1/2} = \\dfrac12 a$", mk: "B1" },
        { h: "(b) Factorise inside first", m: "$\\log_2 x(x + 8) = \\log_2 x + \\log_2(x + 8) = a + b$", mk: "M1 A1" },
        { h: "(c) Single fraction, then split", m: "$8 + \\dfrac{64}{x} = \\dfrac{8(x + 8)}{x}$, so $\\log_2 8 + \\log_2(x + 8) - \\log_2 x = 3 + b - a$", mk: "M1 M1 A1", n: "$\\log_2 8 = 3$. The whole skill is spotting $x + 8$ inside the expression." }
      ], result: "(a) $\\frac a2$ (b) $a + b$ (c) $3 + b - a$" } },
    { worked: { tag: "exam", title: "Find the student's two errors", src: "AS June 2018 · P1 Q5 · 5 marks",
      q: "A student solves $2\\log_2 x - \\log_2\\sqrt x = 3$: \"$2\\log_2\\left(\\frac{x}{\\sqrt x}\\right) = 3$ (subtraction law); $2\\log_2(\\sqrt x) = 3$; $\\log_2 x = 3$ (power law); $x = 2^3 = 9$.\" **(a)** Identify two errors. **(b)** Write out the correct solution.",
      steps: [
        { h: "(a)", m: "**1.** The subtraction law was applied with the 2 still outside: $2\\log_2 x - \\log_2\\sqrt x$ is $\\log_2 x^2 - \\log_2\\sqrt x$, not $2\\log_2(x/\\sqrt x)$. **2.** $2^3 = 8$, not 9 (and \"$2\\log_2\\sqrt x = \\log_2 x$\" happened to be right, but by luck).", mk: "B1 B1" },
        { h: "(b)", m: "$\\log_2 x^2 - \\log_2 x^{1/2} = \\log_2 x^{3/2} = 3 \\Rightarrow x^{3/2} = 8 \\Rightarrow x = 8^{2/3} = 4$", mk: "M1 M1 A1" }
      ], result: "$x = 4$" } },
    { worked: { tag: "exam", title: "A restriction on $b$ from $\\log a - \\log b = \\log(a - b)$", src: "A-level June 2019 · P1 Q9 · 5 marks",
      q: "Given $a > b > 0$ and $\\log a - \\log b = \\log(a - b)$, **(a)** show that $a = \\frac{b^2}{b - 1}$. **(b)** Write down the full restriction on $b$, explaining the reason.",
      steps: [
        { h: "(a)", m: "$\\log\\dfrac ab = \\log(a - b) \\Rightarrow \\dfrac ab = a - b \\Rightarrow a = ab - b^2 \\Rightarrow a(b - 1) = b^2 \\Rightarrow a = \\dfrac{b^2}{b - 1}$", mk: "M1 M1 A1*" },
        { h: "(b)", m: "$b > 1$: since $a > 0$ and $b^2 > 0$, the denominator $b - 1$ must be positive.", mk: "B1 B1", n: "\"$b > 0$\" is given; the *extra* restriction is what the algebra forces." }
      ], result: "$b > 1$" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Inventing a law for $\\log(x + y)$** or $\\log a - \\log b = \\log(a - b)$.",
      "**Coefficient not moved inside** before combining.",
      "**Bare constant not converted**: $1 = \\log_3 3$.",
      "**Extraneous roots kept** — check each log argument in the original.",
      "**$\\log_a P = \\log_a Q \\Rightarrow P = Q$** needs the same base on both sides and single logs.",
      "**Rounding a surd answer** when exact was implied."
    ] },
    { callout: { t: "mnemonic", h: "\"Add → times, subtract → divide, coefficient → power\"", body: "The three laws in the direction you use them to combine. Read backwards to split." } }
  ],
  flashcards: [
    ["Three log laws?", "$\\log xy = \\log x + \\log y$; $\\log\\frac xy = \\log x - \\log y$; $\\log x^k = k\\log x$."],
    ["Is $\\log(a - b) = \\log a - \\log b$?", "No — the difference of logs is the log of the quotient."],
    ["Solve $2\\log_3(x+1) = 1 + \\log_3(x+7)$.", "$(x+1)^2 = 3(x+7)$, $x = 5$ ($-4$ rejected)."],
    ["Solve $2\\log_4(2 - x) - \\log_4(x + 5) = 1$.", "$(2-x)^2 = 4(x+5)$, $x = 4 - 4\\sqrt2$ (need $x < 2$)."],
    ["$a = \\log_2 x$, $b = \\log_2(x+8)$: $\\log_2(8 + \\frac{64}{x})$?", "$\\log_2\\frac{8(x+8)}{x} = 3 + b - a$."],
    ["How do you write the number 2 as a log base 5?", "$2 = \\log_5 25$."],
    ["Why must you check roots of a log equation?", "Log arguments must be positive; the algebra can create roots that make them negative."],
    ["$\\log a - \\log b = \\log(a - b)$ gives $a = $?", "$\\frac{b^2}{b - 1}$, requiring $b > 1$."]
  ],
  quiz: [
    { q: "$\\log_2 12 - \\log_2 3 =$", opts: ["2", "$\\log_2 9$", "4", "$\\log_2 36$"], ans: 0, why: "$\\log_2 4$." },
    { q: "$3\\log_5 2 =$", opts: ["$\\log_5 8$", "$\\log_5 6$", "$\\log_{15} 2$", "$\\log_5 5$"], ans: 0, why: "Power law." },
    { q: "$\\log_3 x = 2 + \\log_3 4$ gives $x =$", opts: ["36", "6", "8", "12"], ans: 0, why: "$x = 9 \\times 4$." },
    { q: "$\\log_2(x - 1) + \\log_2(x + 1) = 3$ gives", opts: ["$x = 3$ only", "$x = \\pm3$", "$x = 9$", "$x = 4$"], ans: 0, why: "$x^2 - 1 = 8$; reject $-3$." },
    { q: "$\\log_a\\sqrt{x} =$", opts: ["$\\tfrac12\\log_a x$", "$2\\log_a x$", "$\\sqrt{\\log_a x}$", "$\\log_a x - 2$"], ans: 0, why: "$x^{1/2}$." },
    { q: "Which is a genuine law?", opts: ["$\\log(x + y) = \\log x + \\log y$", "$\\log(xy) = \\log x + \\log y$", "$\\log x \\cdot \\log y = \\log(x + y)$", "$\\frac{\\log x}{\\log y} = \\log\\frac{x}{y}$"], ans: 1, why: "Product law." }
  ]
};

/* =====================================================================
   6.5  Solving a^x = b
   ===================================================================== */
C["maths:6.5"] = {
  notes: [
    { h: "Solving $a^x = b$ — the whole topic on one page" },
    { callout: { t: "memorise", h: "Take logs of both sides", body: [
      "$$a^x = b \;\\Rightarrow\; x\\log a = \\log b \;\\Rightarrow\; x = \\dfrac{\\log b}{\\log a} \;(= \\log_a b)$$",
      "Any base of log works ($\\ln$ or $\\log_{10}$). The **change of base** formula $\\log_a b = \\frac{\\log_c b}{\\log_c a}$ is the same fact.",
      "With an expression in the power: $2^{3x - 1} = 3 \\Rightarrow (3x - 1)\\log 2 = \\log 3 \\Rightarrow x = \\frac13\\left(\\frac{\\log 3}{\\log 2} + 1\\right)$.",
      "**Same base possible?** Then do not use logs: $4^{3x - 2} = \\frac{1}{2\\sqrt2}$ is $2^{6x - 4} = 2^{-3/2}$ (topic 2.1)."
    ] } },
    { table: { head: ["Equation", "Working", "Answer"], rows: [
      ["$3^x = 20$", "$x = \\frac{\\ln 20}{\\ln 3}$", "$2.727$"],
      ["$5^{2x + 1} = 100$", "$(2x + 1)\\ln 5 = \\ln 100$", "$x = 0.931$"],
      ["$2 \\times 3^x = 54$", "$3^x = 27$", "$x = 3$"],
      ["$e^{0.05t} = 500$", "$t = \\frac{\\ln 500}{0.05}$", "$124.3$"],
      ["$1.08^{n - 1} > 3.25$", "$n - 1 > \\frac{\\ln 3.25}{\\ln 1.08}$", "$n \\ge 17$"],
      ["$3^x = 7^y$", "$x\\ln 3 = y\\ln 7$", "$\\frac xy = \\frac{\\ln 7}{\\ln 3}$"]
    ] } },

    { page: "Hidden quadratics and inequalities" },
    { worked: { tag: "exam", title: "$3 \\times 2^x = 15 - 2^{x + 1}$ — a hidden linear equation in $2^x$", src: "A-level Oct 2020 · P2 Q5 · 4 marks",
      q: "The curve $y = 3 \\times 2^x$ meets the curve $y = 15 - 2^{x + 1}$ at $P$. Find, using algebra, the exact $x$-coordinate of $P$.",
      steps: [
        { h: "$2^{x + 1} = 2 \\times 2^x$", m: "$3 \\times 2^x = 15 - 2 \\times 2^x \\Rightarrow 5 \\times 2^x = 15 \\Rightarrow 2^x = 3$", mk: "M1 M1 A1", n: "Index law first; then it is linear in $u = 2^x$." },
        { m: "$x = \\log_2 3 = \\dfrac{\\ln 3}{\\ln 2}$", mk: "A1", n: "Exact: leave as a log." }
      ], result: "$x = \\log_2 3$" } },
    { worked: { tag: "example", title: "A quadratic in $e^x$: $e^{2x} - 5e^x + 6 = 0$", src: "routine",
      steps: [
        { m: "Let $u = e^x$: $u^2 - 5u + 6 = (u - 2)(u - 3) = 0 \\Rightarrow e^x = 2$ or $3$", mk: "M1 A1", n: "$e^{2x} = (e^x)^2$." },
        { m: "$x = \\ln 2$ or $x = \\ln 3$", mk: "A1", n: "If a root were negative ($e^x = -1$) it would be rejected: $e^x > 0$." }
      ], result: "$x = \\ln 2, \\ln 3$" } },
    { worked: { tag: "exam", title: "Bees and wasps equal: a quadratic in $e^{0.05t}$", src: "A-level June 2022 · P1 Q10(c) · 4 marks",
      q: "Bees: $N_b = 45 + 220e^{0.05t}$ (thousands); wasps: $N_w = 10 + 800e^{-0.05t}$. When $t = T$ the numbers are equal. Find $T$ to 2 d.p.",
      steps: [
        { m: "$45 + 220e^{0.05t} = 10 + 800e^{-0.05t}$; multiply by $e^{0.05t}$ and let $u = e^{0.05t}$: $220u^2 + 35u - 800 = 0$", mk: "M1 A1", n: "$e^{-0.05t} = \\frac{1}{u}$: multiplying through clears it." },
        { m: "$u = \\dfrac{-35 + \\sqrt{35^2 + 4 \\times 220 \\times 800}}{440} = 1.829$ (negative root rejected)", mk: "M1" },
        { m: "$T = \\dfrac{\\ln 1.829}{0.05} = 12.08$ years", mk: "A1" }
      ], result: "$T = 12.08$" } },
    { worked: { tag: "exam", title: "First year the value exceeds £100 000 — $Ap^t$ with two data points", src: "A-level June 2018 · P1 Q12 · 10 marks",
      q: "$V = Ap^t$ is a car's value $t$ years after 1 Jan 2001; it was £32 000 on 1 Jan 2005 and £50 000 on 1 Jan 2012. **(a)(i)** Find $p$ to 4 d.p. **(ii)** Show that $A \\approx 24\\,800$. **(b)** Interpret $A$ and $p$. **(c)** Find the year during which the value first exceeds £100 000.",
      steps: [
        { h: "(a) Divide the two equations", m: "$\\dfrac{Ap^{11}}{Ap^4} = \\dfrac{50\\,000}{32\\,000} \\Rightarrow p^7 = 1.5625 \\Rightarrow p = 1.5625^{1/7} = 1.0658$", mk: "M1 A1", n: "Dividing removes $A$; a seventh root (or $\\ln$) gives $p$." },
        { m: "$A = \\dfrac{32\\,000}{1.0658^4} = 24\\,797 \\approx 24\\,800$", mk: "M1 A1*" },
        { h: "(b)", m: "$A$: the value (£24 800) on 1 January 2001. $p$: the value multiplies by 1.0658 each year — a 6.58% annual increase.", mk: "B1 B1" },
        { h: "(c)", m: "$24\\,800 \\times 1.0658^t > 100\\,000 \\Rightarrow t > \\dfrac{\\ln(100\\,000/24\\,800)}{\\ln 1.0658} = 21.9$; $t = 21.9$ years after 1 Jan 2001 is during **2022**", mk: "M1 M1 A1 A1", n: "$t = 21$ is 1 Jan 2022; the crossing at $21.9$ falls inside 2022." }
      ], result: "(a) $p = 1.0658$, $A \\approx 24\\,800$ (c) 2022" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Logs of a sum**: isolate the exponential first.",
      "**Rounding $p$ early**: keep $1.5625^{1/7}$ in the calculator for later parts.",
      "**Negative root of the hidden quadratic** must be rejected ($e^x > 0$, $2^x > 0$).",
      "**Inequalities**: dividing by $\\ln a$ with $0 < a < 1$ (negative log) flips the sign.",
      "**Exact vs decimal**: $\\log_2 3$ is exact; $1.585$ is not."
    ] },
    { callout: { t: "mnemonic", h: "\"Isolate, log, drop, divide\"", body: "Isolate the power; take logs; drop the exponent as a multiplier; divide." } }
  ],
  flashcards: [
    ["Solve $a^x = b$.", "$x = \\frac{\\log b}{\\log a} = \\log_a b$."],
    ["Change of base formula?", "$\\log_a b = \\frac{\\log_c b}{\\log_c a}$."],
    ["$3 \\times 2^x = 15 - 2^{x+1}$: exact $x$?", "$2^x = 3$, $x = \\log_2 3$."],
    ["$e^{2x} - 5e^x + 6 = 0$?", "$e^x = 2, 3$: $x = \\ln2, \\ln3$."],
    ["$Ap^4 = 32000$, $Ap^{11} = 50000$: $p$?", "$p^7 = 1.5625$, $p = 1.0658$."],
    ["$1.08^{n-1} > 3.25$: $n$?", "$n - 1 > 15.3$, so $n \\ge 17$."],
    ["When does dividing by $\\ln a$ flip an inequality?", "When $0 < a < 1$ ($\\ln a < 0$)."]
  ],
  quiz: [
    { q: "$5^x = 40$: $x =$", opts: ["$\\tfrac{\\ln 40}{\\ln 5}$", "$\\ln 8$", "$\\tfrac{40}{5}$", "$\\ln 35$"], ans: 0, why: "Logs of both sides." },
    { q: "$2^{x+1} =$", opts: ["$2 \\times 2^x$", "$2^x + 1$", "$2^x + 2$", "$4^x$"], ans: 0, why: "Index law." },
    { q: "$e^{2x} = 4e^x$ gives $x =$", opts: ["$\\ln 4$", "$2$", "$\\ln 2$", "$4$"], ans: 0, why: "$e^x = 4$ (or $e^x = 0$ impossible)." },
    { q: "$0.5^x < 0.1$ gives", opts: ["$x > \\tfrac{\\ln 0.1}{\\ln 0.5}$", "$x < \\tfrac{\\ln 0.1}{\\ln 0.5}$", "$x > 5$", "$x < 0$"], ans: 0, why: "Dividing by negative $\\ln 0.5$ flips." },
    { q: "$\\log_2 3$ equals", opts: ["$\\tfrac{\\ln 3}{\\ln 2}$", "$\\tfrac{\\ln 2}{\\ln 3}$", "$\\ln 1.5$", "$1.5$"], ans: 0, why: "Change of base." }
  ]
};

/* =====================================================================
   6.6  Logarithmic graphs and estimating parameters
   ===================================================================== */
C["maths:6.6"] = {
  notes: [
    { h: "Reduction to linear form — the whole topic on one page" },
    "Data that follows $y = ax^n$ or $y = kb^x$ does not plot as a straight line — but its **logarithm** does. Taking logs turns a power or an exponential into a linear relationship whose gradient and intercept give the constants. Every AS paper and most A-level papers have one.",
    { callout: { t: "memorise", h: "The two reductions", body: [
      "$$y = ax^n \;\\Rightarrow\; \\log y = n\\log x + \\log a \\qquad \\text{plot } \\log y \\text{ against } \\log x: \\text{ gradient } n, \\text{ intercept } \\log a$$",
      "$$y = kb^x \;\\Rightarrow\; \\log y = x\\log b + \\log k \\qquad \\text{plot } \\log y \\text{ against } x: \\text{ gradient } \\log b, \\text{ intercept } \\log k$$",
      "**Which one?** A log–log plot ($\\log y$ vs $\\log x$) means a power law; a log–linear plot ($\\log y$ vs $x$) means an exponential. Then $a = 10^{\\text{intercept}}$ (or $e^{\\ldots}$ for $\\ln$), $n = $ gradient; or $k = 10^{\\text{intercept}}$, $b = 10^{\\text{gradient}}$."
    ] } },
    { fig: { x: [-0.5, 12], y: [-0.5, 4], axes: { x: "t", y: "log₁₀ V", xt: [2, 4, 6, 8, 10], yt: [1, 2, 3] }, items: [
      { fn: "3-0.021*x", label: "log V = −0.021t + 3", at: 6, pos: "n" },
      { pt: [0, 3], label: "(0, 3)", pos: "e" }, { pt: [10, 2.79], label: "(10, 2.79)", pos: "ne" }
    ], cap: "A-level 2023 P1 Q11: $\\log_{10}V$ against $t$ is a straight line, so $V = ab^t$ with $\\log a = 3$ (intercept) and $\\log b = -0.021$ (gradient)." } },

    { page: "Reading constants off the line" },
    { worked: { tag: "exam", title: "Phone value: $V = ab^t$ from two points on the $\\log V$ line; then reliability", src: "A-level June 2023 · P1 Q11 · 7 marks",
      q: "$V = ab^t$ models a phone's value £$V$ after $t$ months. The graph of $\\log_{10}V$ against $t$ is a straight line through $(0, 3)$ and $(10, 2.79)$. **(a)** Find the initial value of the phone. **(b)** Find a complete equation for $V$, with $a$ exact and $b$ to 3 s.f. Exactly 2 years after purchase the phone was worth £320. **(c)** Evaluate the model.",
      steps: [
        { h: "(a) Intercept", m: "$\\log_{10}a = 3 \\Rightarrow a = 1000$: initial value £1000", mk: "M1 A1" },
        { h: "(b) Gradient", m: "$\\log_{10}b = \\dfrac{2.79 - 3}{10} = -0.021 \\Rightarrow b = 10^{-0.021} = 0.953$\n$V = 1000 \\times 0.953^t$", mk: "M1 A1 A1", n: "$b < 1$: the value falls by about 4.7% a month." },
        { h: "(c) $t = 24$", m: "Model: $1000 \\times 0.953^{24} = £315$; actual £320 — very close, so the model is reliable (over this period).", mk: "B1", n: "Compute, compare, conclude — here the verdict is positive." }
      ], result: "(a) £1000 (b) $V = 1000 \\times 0.953^t$ (c) predicts £315 vs £320: reliable" } },
    { worked: { tag: "exam", title: "Pendulum: show the linear form, then $a$ and $b$ from two points", src: "A-level Oct 2021 · P2 Q10 · 6 marks",
      q: "$T = al^b$ models the time $T$ s for a pendulum of length $l$ m to swing. **(a)** Show that this can be written $\\log_{10}T = b\\log_{10}l + \\log_{10}a$. **(b)** The line of $\\log_{10}T$ against $\\log_{10}l$ passes through $(-0.7, 0)$ and $(0.21, 0.45)$. Find $a$ and $b$ to 2 s.f.",
      steps: [
        { h: "(a) Take logs, use product and power laws", m: "$\\log_{10}T = \\log_{10}a + \\log_{10}l^b = b\\log_{10}l + \\log_{10}a$", mk: "M1 A1*" },
        { h: "(b) Gradient is $b$", m: "$b = \\dfrac{0.45 - 0}{0.21 - (-0.7)} = \\dfrac{0.45}{0.91} = 0.49 \\approx 0.5$", mk: "M1 A1", n: "Physics agrees: $T \\propto \\sqrt l$." },
        { h: "Intercept from a point", m: "$\\log_{10}a = 0.45 - 0.4945 \\times 0.21 = 0.346 \\Rightarrow a = 10^{0.346} = 2.2$", mk: "M1 A1", n: "Or: at $\\log l = -0.7$, $\\log T = 0$: $0 = -0.7b + \\log a$." }
      ], result: "$b \\approx 0.49$, $a \\approx 2.2$" } },
    { worked: { tag: "exam", title: "Log–log: explain the model and read $k$ and $n$", src: "A-level June 2019 · P2 Q9(a) · 3 marks",
      q: "Braking distance $d$ m at speed $V$ km/h: the plot of $\\log_{10}d$ against $\\log_{10}V$ is a straight line with intercept $(0, -1.77)$, and the point $(30, 20)$ is on the $d$–$V$ graph. Explain how this leads to the model $d = kV^n$ with $k \\approx 0.017$.",
      steps: [
        { m: "A straight line on log–log axes means $\\log d = n\\log V + c$, i.e. $d = 10^c V^n = kV^n$: a power law.", mk: "B1" },
        { m: "Intercept $c = -1.77 \\Rightarrow k = 10^{-1.77} = 0.017$", mk: "B1" },
        { m: "Through $(30, 20)$: $20 = 0.017 \\times 30^n \\Rightarrow n = \\dfrac{\\ln(20/0.017)}{\\ln 30} \\approx 2.08 \\approx 2$ — braking distance grows with the square of speed.", mk: "B1" }
      ], result: "$d \\approx 0.017V^2$" } },
    { worked: { tag: "exam", title: "$\\log_{10}V = 0.072t + 2.379$: show $V = ab^t$, interpret $ab$, total views", src: "AS June 2020 · P1 Q12 · 7 marks",
      q: "$\\log_{10}V = 0.072t + 2.379$, $1 \\le t \\le 30$, models the total views $V$ of an advert $t$ days after going live. **(a)** Show that $V = ab^t$, giving $a$ to the nearest whole number and $b$ to 3 s.f. **(b)** Interpret $ab$. **(c)** Find the total views in the first 20 days, to 2 s.f.",
      steps: [
        { h: "(a) Undo the log", m: "$V = 10^{0.072t + 2.379} = 10^{2.379} \\times \\left(10^{0.072}\\right)^t = 239 \\times 1.18^t$", mk: "M1 M1 A1 A1", n: "$10^{p + q} = 10^p \\cdot 10^q$ and $10^{0.072t} = (10^{0.072})^t$." },
        { h: "(b)", m: "$ab = V(1) \\approx 282$: the number of views at the end of day 1.", mk: "B1" },
        { h: "(c) $V$ is already a total", m: "$V(20) = 239 \\times 1.18^{20} \\approx 6600$", mk: "M1 A1", n: "No summing — the model gives the running total." }
      ], result: "(a) $V = 239 \\times 1.18^t$ (b) views after day 1 (c) 6600" } },
    { worked: { tag: "exam", title: "Heart rate $h = pm^q$ from a log–log line; test on a 5 kg mammal", src: "AS Nov 2021 · P1 Q13 · 7 marks",
      q: "$h = pm^q$ gives resting heart rate $h$ (bpm) for mass $m$ kg. The line of $\\log_{10}h$ against $\\log_{10}m$ meets the vertical axis at 2.25 and has gradient $-0.235$. **(a)** Find $p$ and $q$ to 3 s.f. A 5 kg mammal has resting heart rate 119 bpm. **(b)** Comment on the suitability of the model for this mammal. **(c)** Interpret $q$.",
      steps: [
        { h: "(a)", m: "$q = -0.235$; $\\log_{10}p = 2.25 \\Rightarrow p = 178$", mk: "M1 A1 A1" },
        { h: "(b)", m: "Model: $178 \\times 5^{-0.235} = 122$ bpm, against the actual 119 — close, so the model is suitable for this mammal.", mk: "M1 A1" },
        { h: "(c)", m: "$q < 0$: heart rate **decreases** as mass increases (larger animals have slower hearts); the rate of decrease is small.", mk: "B1" }
      ], result: "(a) $p = 178$, $q = -0.235$ (b) predicts 122 vs 119: suitable" } },
    { worked: { tag: "exam", title: "A non-log linearisation: $h^2 = at + b$", src: "A-level June 2022 · P1 Q5 · 6 marks",
      q: "A tree's height $h$ m, $t$ years after planting, is modelled by $h^2 = at + b$. It was 2.60 m after 2 years and 5.10 m after 10 years. **(a)** Find a complete equation, $a$ and $b$ to 3 s.f. It was 7 m after 20 years. **(b)** Evaluate the model.",
      steps: [
        { h: "(a) Two points on the line $h^2$ vs $t$", m: "$6.76 = 2a + b$, $\; 26.01 = 10a + b \\Rightarrow 8a = 19.25 \\Rightarrow a = 2.41$, $b = 1.95$\n$h^2 = 2.41t + 1.95$", mk: "M1 A1 A1 A1", n: "Square the heights first — the linear variable is $h^2$." },
        { h: "(b) $t = 20$", m: "$h^2 = 50.07 \\Rightarrow h = 7.08$ m, against the actual 7 m: a good fit, the model is reliable at 20 years.", mk: "M1 A1" }
      ], result: "(a) $h^2 = 2.41t + 1.95$ (b) predicts 7.08 vs 7: good" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Wrong plot for the model**: $ax^n$ ↔ log–log; $kb^x$ ↔ log against $x$.",
      "**Intercept is $\\log a$, not $a$**: undo with $10^{\\ldots}$ (or $e^{\\ldots}$ if $\\ln$ was used).",
      "**Gradient is $\\log b$** in the exponential case — also undo it.",
      "**Wrong base**: $\\ln$ plots undo with $e$; $\\log_{10}$ plots with 10.",
      "**Interpretation**: $a$/$k$ is the value at $x = 0$ (or $t = 0$); $b$ is the multiplier per unit; $n$ is the power (how $y$ scales).",
      "**Reliability comments**: interpolation (inside the data) is reliable; extrapolation far outside is not."
    ] },
    { callout: { t: "mnemonic", h: "\"Power law → log both; exponential → log $y$ only\"", body: "And the intercept is always the log of the front constant." } }
  ],
  flashcards: [
    ["$y = ax^n$ linearised?", "$\\log y = n\\log x + \\log a$: plot $\\log y$ vs $\\log x$."],
    ["$y = kb^x$ linearised?", "$\\log y = x\\log b + \\log k$: plot $\\log y$ vs $x$."],
    ["Line $\\log V = -0.021t + 3$: $a$ and $b$ in $V = ab^t$?", "$a = 10^3 = 1000$, $b = 10^{-0.021} = 0.953$."],
    ["$\\log T$ vs $\\log l$ through $(-0.7, 0)$ and $(0.21, 0.45)$: $b$?", "$\\frac{0.45}{0.91} \\approx 0.49$."],
    ["$\\log_{10}V = 0.072t + 2.379$ → $V = $?", "$10^{2.379} \\times (10^{0.072})^t = 239 \\times 1.18^t$."],
    ["Meaning of $b$ in $V = ab^t$?", "The factor by which $V$ multiplies each unit of $t$."],
    ["$h^2 = at + b$ from $(2, 2.6)$ and $(10, 5.1)$?", "$a = 2.41$, $b = 1.95$ (use $h^2$)."],
    ["Intercept of a $\\ln y$ vs $x$ plot is 3.95: $a$?", "$e^{3.95} \\approx 52$."]
  ],
  quiz: [
    { q: "A straight line on a $\\log y$ vs $\\log x$ plot means", opts: ["$y = ax^n$", "$y = kb^x$", "$y = mx + c$", "$y = a\\ln x$"], ans: 0, why: "Power law." },
    { q: "$\\log y = 0.5x + 1.2$ (base 10). $k =$", opts: ["$10^{1.2}$", "1.2", "$10^{0.5}$", "$e^{1.2}$"], ans: 0, why: "Intercept is $\\log k$." },
    { q: "Gradient of the $\\log y$ vs $x$ line is $\\log b$. If the gradient is $-0.021$, $b =$", opts: ["$10^{-0.021}$", "$-0.021$", "$0.979$", "$10^{0.021}$"], ans: 0, why: "Undo the log." },
    { q: "Interpretation of $a$ in $V = ab^t$:", opts: ["value at $t = 0$", "growth rate", "time to double", "final value"], ans: 0, why: "$b^0 = 1$." },
    { q: "$T = al^b$ with $\\log T = b\\log l + \\log a$; if $b = 0.5$ then $T \\propto$", opts: ["$\\sqrt l$", "$l^2$", "$l$", "$\\tfrac1l$"], ans: 0, why: "$l^{0.5}$." }
  ]
};

/* =====================================================================
   6.7  Exponential growth and decay in modelling
   ===================================================================== */
C["maths:6.7"] = {
  notes: [
    { h: "Exponential models — the whole topic on one page" },
    "The single most-examined modelling topic in Pure: 22 questions in eight years. The model is one of three shapes, and the questions are always drawn from the same list.",
    { table: { head: ["Shape", "Form", "Behaviour", "Examples set"], rows: [
      ["growth", "$N = Ae^{kt}$, $k > 0$", "from $A$, doubling every $\\frac{\\ln 2}{k}$; unbounded", "bacteria, pond weed, bees, algae"],
      ["decay to a floor", "$V = c + Ae^{-kt}$", "from $c + A$ down to the asymptote $c$", "car value, tea cooling, tyre pressure"],
      ["growth to a ceiling", "$h = c - Ae^{-kt}$", "from $c - A$ up to the limit $c$", "tree/plant height, ethanol heating, car sales, tree cover"]
    ] } },
    { fig: { x: [0, 20], y: [0, 36], axes: { x: "t", y: "h", xt: [5, 10, 15], yt: [10, 20, 31] }, items: [
      { fn: "31-31.25*exp(-0.02231*x)", label: "h = 31 − 31.25e^(−0.0223t)", at: 12, pos: "s" },
      { hline: 31, c: "accent3", label: "limit 31" },
      { pt: [10, 6], label: "(10, 6)", pos: "se" }, { pt: [20, 11], label: "(20, 11)", pos: "se" }
    ], cap: "AS 2025 Q13: growth towards a ceiling. The two data points fix $A$ and $k$; the ceiling is the constant $c = 31$, never reached." } },
    { callout: { t: "memorise", h: "The question bank", body: [
      "**Initial value**: put $t = 0$ ($e^0 = 1$).",
      "**Limit / long-term value**: as $t \\to \\infty$, $e^{-kt} \\to 0$; read the constant. Say \"approaches but never reaches\".",
      "**Find the constants**: one from $t = 0$, one from another data point via logs; or two data points → divide to eliminate $A$.",
      "**Time to reach a value**: isolate the exponential, take logs.",
      "**Rate of change**: differentiate ($ke^{kt}$ rule); \"rate of decrease\" is quoted positive.",
      "**Evaluate / limitation / refinement**: compare with a later observation; name the failing assumption (unbounded growth, fixed room temperature, no other factors); suggest a fix (a ceiling, a different constant)."
    ] } },

    { page: "Growth and decay to a limit" },
    { worked: { tag: "exam", title: "Tree height $h = 31 - Ae^{-kt}$ from two data points; limit; early-growth check; rate", src: "AS June 2025 · P1 Q13 · 12 marks",
      q: "$h = 31 - Ae^{-kt}$ models a tree's height $h$ m after $t$ years; $h = 6$ at $t = 10$ and $h = 11$ at $t = 20$. **(a)** Find $A$ and $k$ to 3 s.f. **(b)** Deduce the limit to the height. **(c)(i)** Find the initial height. **(ii)** Hence explain whether the model suits the tree's early growth. **(d)(i)** Find $\\frac{dh}{dt}$ in simplest form. **(ii)** Find the rate of growth at $t = 10$.",
      steps: [
        { h: "(a) Two equations, then divide", m: "$Ae^{-10k} = 25$ and $Ae^{-20k} = 20$; dividing: $e^{-10k} = 0.8 \\Rightarrow k = -\\dfrac{\\ln 0.8}{10} = 0.0223$", mk: "M1 M1 A1", n: "Rearrange each to isolate $Ae^{-kt}$ first; division cancels $A$." },
        { m: "$A = \\dfrac{25}{0.8} = 31.25$ (or $31.3$ to 3 s.f.): $h = 31 - 31.25e^{-0.0223t}$", mk: "A1" },
        { h: "(b)", m: "As $t \\to \\infty$, $e^{-kt} \\to 0$: the height approaches 31 m.", mk: "B1" },
        { h: "(c)", m: "(i) $h(0) = 31 - 31.25 = -0.25$ m. (ii) A negative height is impossible, so the model is **not** suitable for the early growth (it is fitted to years 10–20).", mk: "M1 A1 B1" },
        { h: "(d)", m: "(i) $\\dfrac{dh}{dt} = 31.25 \\times 0.0223e^{-0.0223t} = 0.697e^{-0.0223t}$. (ii) At $t = 10$: $0.697 \\times 0.8 = 0.558$ m per year.", mk: "M1 A1 M1 A1", n: "$e^{-10k} = 0.8$ exactly from part (a) — reuse it." }
      ], result: "(a) $k = 0.0223$, $A = 31.3$ (b) 31 m (c) $-0.25$ m: unsuitable early (d) $0.558$ m/yr" } },
    { worked: { tag: "exam", title: "Ethanol heating $\\theta = A - Be^{-0.07t}$: constants from two temperatures; evaluate against the boiling point", src: "A-level Oct 2020 · P2 Q9 · 6 marks",
      q: "$\\theta = A - Be^{-0.07t}$ °C after $t$ seconds; initially $18$ °C, after 10 s $44$ °C. **(a)** Find $A$ and $B$ to 3 s.f. Ethanol boils at about $78$ °C. **(b)** Evaluate the model.",
      steps: [
        { h: "(a)", m: "$t = 0$: $A - B = 18$. $t = 10$: $A - Be^{-0.7} = 44$. Subtract: $B(1 - e^{-0.7}) = 26 \\Rightarrow B = 51.6$, $A = 69.6$", mk: "M1 A1 M1 A1" },
        { h: "(b)", m: "The model's temperature approaches $A = 69.6$ °C and never exceeds it — so it never reaches the boiling point of 78 °C, contradicting the fact that the ethanol was heated until it boiled. The model is not appropriate.", mk: "M1 A1", n: "The limit is the thing to compare with." }
      ], result: "(a) $A = 69.6$, $B = 51.6$ (b) limit 69.6 < 78: unsuitable" } },
    { worked: { tag: "exam", title: "Car sales $N = 5000 - 5000e^{-0.075t}$: value, time, rate, refinement", src: "A-level June 2025 · P2 Q9 · 8 marks",
      q: "$N$ cars sold $t$ months after release. **(a)** Find the number sold in the first 3 months. **(b)** Find $T$ when $N = 3000$, to 2 d.p. **(c)** Find the rate of increase in sales at $t = 3$, to 3 s.f. After a marketing campaign the total is expected to rise with an upper limit of 6500. **(d)** Suggest one refinement.",
      steps: [
        { h: "(a)", m: "$N(3) = 5000(1 - e^{-0.225}) = 1007$ cars", mk: "M1 A1" },
        { h: "(b)", m: "$5000e^{-0.075T} = 2000 \\Rightarrow e^{-0.075T} = 0.4 \\Rightarrow T = \\dfrac{\\ln 2.5}{0.075} = 12.22$ months", mk: "M1 A1 A1" },
        { h: "(c)", m: "$\\dfrac{dN}{dt} = 375e^{-0.075t}$; at $t = 3$: $375e^{-0.225} = 299$ cars per month", mk: "M1 A1" },
        { h: "(d)", m: "Replace the limit: $N = 6500 - 6500e^{-0.075t}$ (or change the constant so the ceiling is 6500).", mk: "B1" }
      ], result: "(a) 1007 (b) 12.22 (c) 299 per month (d) $N = 6500 - 6500e^{-0.075t}$" } },
    { worked: { tag: "exam", title: "Coffee cooling: $A$ from the start, $B$ from the initial rate", src: "A-level June 2023 · P2 Q4 · 4 marks",
      q: "$H = Ae^{-Bt} + 30$ is the temperature of coffee after $t$ minutes; initially $85$ °C and cooling at $7.5$ °C per minute. **(a)** State $A$. **(b)** Find a complete equation with $B$ to 3 d.p.",
      steps: [
        { h: "(a)", m: "$A + 30 = 85 \\Rightarrow A = 55$", mk: "B1" },
        { h: "(b) The rate at $t = 0$", m: "$\\dfrac{dH}{dt} = -ABe^{-Bt}$; at $t = 0$: $-55B = -7.5 \\Rightarrow B = 0.136$\n$H = 55e^{-0.136t} + 30$", mk: "M1 A1 A1", n: "A *rate* given at a time is a derivative condition, not a value." }
      ], result: "$H = 55e^{-0.136t} + 30$" } },

    { page: "Growth without limit, and evaluating" },
    { worked: { tag: "exam", title: "Pond weed $A = 0.2e^{0.3t}$: rate, time to cover the pond, evaluation", src: "AS Specimen · P1 Q13 · 8 marks",
      q: "The weed area $A$ m$^2$ after $t$ days is $A = 0.2e^{0.3t}$. **(a)** State the area at the start. **(b)** Find the rate of increase exactly 5 days in, to 3 s.f. **(c)** The pond is 100 m$^2$. Find, to the nearest hour, when it is fully covered. **(d)** After a month, 90% of the pond was covered. Evaluate the model.",
      steps: [
        { h: "(a)", m: "$0.2$ m$^2$", mk: "B1" },
        { h: "(b)", m: "$\\dfrac{dA}{dt} = 0.06e^{0.3t}$; at $t = 5$: $0.06e^{1.5} = 0.269$ m$^2$/day", mk: "M1 A1" },
        { h: "(c)", m: "$0.2e^{0.3t} = 100 \\Rightarrow t = \\dfrac{\\ln 500}{0.3} = 20.72$ days $= 497$ hours", mk: "M1 A1 A1 A1", n: "$20.72 \\times 24 = 497.2$." },
        { h: "(d)", m: "The model says the pond is fully covered after 21 days (and predicts more than the pond's area after that), but after a month only 90% was covered — the model over-estimates; unlimited exponential growth is not realistic (growth slows as space runs out).", mk: "B1" }
      ], result: "(a) 0.2 m² (b) 0.269 m²/day (c) 497 h (d) over-estimates; growth must slow" } },
    { worked: { tag: "exam", title: "Car value: build $V = 20\\,000 \\times 0.8^t$ from two facts, evaluate, adapt", src: "A-level June 2019 · P1 Q7 · 7 marks",
      q: "Car A: worth £20 000 new and £16 000 after one year. **(a)** Use an exponential model to form a possible equation linking $V$ with $t$. **(b)** After 10 years car A was worth £2000. Evaluate the model. **(c)** Car B has the same new value but depreciates more slowly. Explain how to adapt the equation.",
      steps: [
        { h: "(a) $V = Ab^t$ (or $Ae^{kt}$)", m: "$A = 20\\,000$; $16\\,000 = 20\\,000b \\Rightarrow b = 0.8$: $V = 20\\,000 \\times 0.8^t$ (equivalently $20\\,000e^{-0.223t}$)", mk: "M1 A1 M1 A1" },
        { h: "(b)", m: "$V(10) = 20\\,000 \\times 0.8^{10} = £2147$, against £2000 — close, so the model is reasonably reliable.", mk: "M1 A1" },
        { h: "(c)", m: "Keep $A = 20\\,000$ and use a value of $b$ closer to 1 (e.g. $0.9$) — a smaller yearly percentage loss.", mk: "B1" }
      ], result: "(a) $V = 20\\,000 \\times 0.8^t$ (b) £2147 vs £2000: reliable (c) larger $b$" } },
    { worked: { tag: "exam", title: "Two metal prices: find $p$; when the rates of change are equal in size", src: "AS June 2024 · P1 Q11 · 6 marks",
      q: "Metal A: $V_A = 100 + 20e^{0.04t}$; metal B: $V_B = pe^{-0.02t}$ (£ per gram, $t$ months). At $t = 0$, $V_B = 2V_A$. **(a)** Find $p$. **(b)** When $t = T$ the rate of increase of $V_A$ equals the rate of decrease of $V_B$. Find $T$ to 1 d.p.",
      steps: [
        { h: "(a)", m: "$V_A(0) = 120$, so $p = 240$", mk: "M1 A1" },
        { h: "(b)", m: "$\\dfrac{dV_A}{dt} = 0.8e^{0.04t}$, $\\dfrac{dV_B}{dt} = -4.8e^{-0.02t}$. Equal magnitudes: $0.8e^{0.04T} = 4.8e^{-0.02T} \\Rightarrow e^{0.06T} = 6 \\Rightarrow T = \\dfrac{\\ln 6}{0.06} = 29.9$", mk: "M1 A1 M1 A1", n: "Divide the exponentials: $e^{0.04T}/e^{-0.02T} = e^{0.06T}$." }
      ], result: "(a) 240 (b) $T = 29.9$" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Find a complete equation for the model**", "every constant evaluated (to the accuracy asked) and the equation written out"],
      ["**State the initial value**", "$t = 0$"],
      ["**Deduce the limit / long-term value**", "the constant the model approaches, with \"never reaches\""],
      ["**Find the rate of increase at $t = $**", "differentiate, substitute; positive number with units per unit time"],
      ["**Evaluate the model in light of …**", "model's prediction, actual value, verdict with reason"],
      ["**State a limitation / suggest a refinement**", "an assumption that fails (in context) / a concrete change to the equation"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Logs of a sum** instead of isolating the exponential.",
      "**Confusing a value condition with a rate condition** (\"cooling at 7.5 °C per minute\" is $\\frac{dH}{dt}$).",
      "**Dividing two data-point equations** not done, leading to a mess with $A$.",
      "**Sign of $k$**: decay needs $-kt$ with $k > 0$ (or $k < 0$ in $e^{kt}$ — be consistent).",
      "**Units and rounding**: days → hours; nearest month; 3 s.f. as asked.",
      "**Limitation not in context** or a refinement that does not address it."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Store constants", "STO $k$ and $A$ unrounded; every later part uses them."],
      ["Solve for $t$ check", "Table app with $f(x) = 31 - 31.25e^{-0.0223x}$: scroll to find where it passes a target value, to confirm a log calculation."],
      ["Derivative at a point", "$\\frac{d}{dx}$ template (CATALOG → Func Analysis) evaluates the rate at a given $t$ — a check for part (d)-type marks."]
    ] },
    { callout: { t: "mnemonic", h: "\"Zero for the start, infinity for the limit, logs for the time, differentiate for the rate\"", body: "Four question types, four moves." } }
  ],
  flashcards: [
    ["Initial value of $V = c + Ae^{-kt}$? Limit?", "$c + A$; $c$ (approached, never reached)."],
    ["$h = 31 - Ae^{-kt}$ with $h(10) = 6$, $h(20) = 11$: $k$?", "$e^{-10k} = \\frac{20}{25} = 0.8$, $k = -\\frac{\\ln0.8}{10} = 0.0223$."],
    ["Coffee: $H = Ae^{-Bt} + 30$, initially 85 °C cooling at 7.5 °C/min: $A$, $B$?", "$A = 55$; $-55B = -7.5$, $B = 0.136$."],
    ["Why is $A = 0.2e^{0.3t}$ unrealistic long-term?", "Unbounded growth — the pond has a finite area; growth slows."],
    ["Ethanol model limit 69.6 °C but it boiled at 78 °C: verdict?", "Model unsuitable — it never reaches the boiling point."],
    ["Doubling time for $e^{kt}$?", "$\\frac{\\ln 2}{k}$."],
    ["Refinement when sales will now cap at 6500 instead of 5000?", "$N = 6500 - 6500e^{-0.075t}$."],
    ["Rates equal in magnitude: $0.8e^{0.04T} = 4.8e^{-0.02T}$ gives…", "$e^{0.06T} = 6$, $T = \\frac{\\ln 6}{0.06} = 29.9$."]
  ],
  quiz: [
    { q: "$\\theta = 18 + 65e^{-t/8}$: value at $t = 0$", opts: ["83", "18", "65", "8"], ans: 0, why: "$e^0 = 1$." },
    { q: "Long-term value of $V = 1500 + 18500e^{-kt}$:", opts: ["1500", "20000", "18500", "0"], ans: 0, why: "Exponential decays to 0." },
    { q: "$N = 1000e^{kt}$ doubles in 5 h. $k =$", opts: ["$\\tfrac{\\ln2}{5}$", "$5\\ln2$", "$\\tfrac{2}{5}$", "$\\ln 10$"], ans: 0, why: "$e^{5k} = 2$." },
    { q: "\"Cooling at 7.5 °C per minute initially\" is a condition on", opts: ["$H(0)$", "$H'(0)$", "$H(7.5)$", "the limit"], ans: 1, why: "A rate is a derivative." },
    { q: "A good refinement for a growth model that must not exceed $L$:", opts: ["$N = L - Ae^{-kt}$", "$N = Ae^{kt}$ with bigger $k$", "$N = Lt$", "$N = A + kt$"], ans: 0, why: "Growth to a ceiling." },
    { q: "$5000e^{-0.075T} = 2000$ gives $T =$", opts: ["$\\tfrac{\\ln 2.5}{0.075}$", "$\\tfrac{\\ln 0.4}{0.075}$", "$0.4 \\times 0.075$", "$\\ln 3000$"], ans: 0, why: "$e^{-0.075T} = 0.4$, so $0.075T = \\ln 2.5$." }
  ]
};


/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
