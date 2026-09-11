/* Kurenai OS — past-paper bank: Edexcel 9MA0/8MA0 Pure, topics 7–10
   (differentiation, integration, numerical methods, vectors). Modelled on
   Pure Papers 1 & 2 and AS Paper 1, June 2018–2025 plus the Specimen.
   Edexcel M1/A1/B1 mark conventions. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (X) {

X("maths:7.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "First principles — 3 to 5 marks, most papers" },
    "Prove from first principles that the derivative of $x^2$ is $2x$ (2024), of $x^3$ is $3x^2$ (AS 2018), of $2x^3 + 5$ at a point (Specimen), of $\\sin x$ is $\\cos x$ (2023) and of $\\cos\\theta$ is $-\\sin\\theta$ (2018). The structure that scores: **write $f'(x) = \\lim_{h \\to 0}\\dfrac{f(x + h) - f(x)}{h}$**, expand (binomial or addition formula), cancel the $h$, then **state the limit** with the small-angle results $\\dfrac{\\sin h}{h} \\to 1$, $\\dfrac{\\cos h - 1}{h} \\to 0$ for the trig cases.",
    { callout: { t: "warn", body: "Writing $\\lim_{h \\to 0}$ only on the last line loses the A1. The limit notation must appear from the definition onwards, and the final line must say \"$= 2x$ as $h \\to 0$\" — not \"$= 2x + h$\"." }}
  ],
  flashcards: [
    ["State the definition of the derivative from first principles.", "$f'(x) = \\displaystyle\\lim_{h \\to 0}\\dfrac{f(x + h) - f(x)}{h}$."],
    ["Prove from first principles that $\\dfrac{d}{dx}(x^2) = 2x$.", "$\\dfrac{(x+h)^2 - x^2}{h} = \\dfrac{2xh + h^2}{h} = 2x + h \\to 2x$ as $h \\to 0$."],
    ["Prove from first principles that $\\dfrac{d}{dx}(x^3) = 3x^2$.", "$\\dfrac{(x+h)^3 - x^3}{h} = 3x^2 + 3xh + h^2 \\to 3x^2$."],
    ["Prove from first principles that $\\dfrac{d}{dx}(\\sin x) = \\cos x$.", "$\\dfrac{\\sin(x+h) - \\sin x}{h} = \\sin x\\dfrac{\\cos h - 1}{h} + \\cos x\\dfrac{\\sin h}{h} \\to \\sin x \\cdot 0 + \\cos x \\cdot 1$."],
    ["Prove from first principles that $\\dfrac{d}{d\\theta}(\\cos\\theta) = -\\sin\\theta$.", "$\\dfrac{\\cos\\theta\\cos h - \\sin\\theta\\sin h - \\cos\\theta}{h} = \\cos\\theta\\dfrac{\\cos h - 1}{h} - \\sin\\theta\\dfrac{\\sin h}{h} \\to -\\sin\\theta$."],
    ["Which two limits are quoted in trig first-principles proofs?", "$\\dfrac{\\sin h}{h} \\to 1$ and $\\dfrac{\\cos h - 1}{h} \\to 0$ as $h \\to 0$."],
    ["Gradient of the chord from $P(2, 4)$ to $Q(2 + h, (2+h)^2)$ on $y = x^2$?", "$\\dfrac{(2+h)^2 - 4}{h} = 4 + h$; as $h \\to 0$ the tangent gradient is 4."],
    ["Why is $f(x + h) - f(x)$ divided by $h$?", "It is the gradient of the chord between $x$ and $x + h$; the limit as $h \\to 0$ is the tangent gradient."]
  ],
  quiz: [
    { q: "$\\displaystyle\\lim_{h \\to 0}\\dfrac{(x+h)^2 - x^2}{h} =$", opts: ["$x$", "$2x$", "$2x + h$", "$x^2$"], ans: 1, why: "Cancel then take the limit." },
    { q: "$\\dfrac{\\sin h}{h} \\to$ as $h \\to 0$:", opts: ["0", "1", "$h$", "$\\infty$"], ans: 1, why: "Small-angle result." },
    { q: "$\\dfrac{\\cos h - 1}{h} \\to$ as $h \\to 0$:", opts: ["0", "1", "$-1$", "$-\\tfrac12$"], ans: 0, why: "$\\approx -h/2 \\to 0$." },
    { q: "The expression $\\dfrac{f(x+h) - f(x)}{h}$ is the gradient of:", opts: ["the tangent", "a chord", "the normal", "the curve"], ans: 1, why: "Between two points." },
    { q: "In the first-principles proof for $x^3$, the term that survives is:", opts: ["$3x^2$", "$3xh$", "$h^2$", "$x^3$"], ans: 0, why: "Others contain $h$." },
    { q: "Omitting $\\lim_{h \\to 0}$ from the working:", opts: ["is fine", "loses accuracy marks", "gains marks", "changes the answer"], ans: 1, why: "Notation is assessed." }
  ],
  exam: [
    { src: "Edexcel 2024 P1 Q4", q: "Prove, from first principles, that the derivative of $x^2$ is $2x$.", marks: 3,
      ms: ["M1: $f'(x) = \\lim_{h \\to 0}\\dfrac{(x+h)^2 - x^2}{h}$", "M1: expands and simplifies to $\\dfrac{2xh + h^2}{h} = 2x + h$", "A1: states that as $h \\to 0$ this tends to $2x$, with correct limit notation throughout"] },
    { src: "Edexcel 2023 P1 Q12", q: "Prove, from first principles, that the derivative of $\\sin x$ is $\\cos x$. You may assume that $\\dfrac{\\sin h}{h} \\to 1$ and $\\dfrac{\\cos h - 1}{h} \\to 0$ as $h \\to 0$.", marks: 5,
      ms: ["M1: $\\lim_{h \\to 0}\\dfrac{\\sin(x + h) - \\sin x}{h}$", "M1: expands $\\sin(x + h) = \\sin x\\cos h + \\cos x\\sin h$", "M1: rearranges to $\\sin x\\left(\\dfrac{\\cos h - 1}{h}\\right) + \\cos x\\left(\\dfrac{\\sin h}{h}\\right)$", "A1: applies the given limits", "A1: $= \\cos x$ with correct notation throughout"] },
    { level: "AS", src: "Edexcel AS Nov 2021 P1 Q5", ctx: "The point $P(3, 9)$ lies on the curve $y = x^2$. The point $Q$ has $x$-coordinate $3 + h$.",
      parts: [
        { q: "Show that the gradient of the chord $PQ$ is $6 + h$.", marks: 3, ms: ["M1: $y_Q = (3 + h)^2 = 9 + 6h + h^2$", "M1: gradient $= \\dfrac{9 + 6h + h^2 - 9}{h}$", "A1: $= 6 + h$"] },
        { q: "Explain how the gradient of the tangent at $P$ can be deduced from this result.", marks: 2, ms: ["M1: as $h \\to 0$, $Q \\to P$ and the chord tends to the tangent", "A1: gradient of the tangent is $\\lim_{h\\to 0}(6 + h) = 6$"] }
      ] },
    { src: "Edexcel 2018 P2 Q9", q: "Prove, from first principles, that the derivative of $\\cos\\theta$ is $-\\sin\\theta$.", marks: 5,
      ms: ["M1: $\\lim_{h \\to 0}\\dfrac{\\cos(\\theta + h) - \\cos\\theta}{h}$", "M1: $\\cos(\\theta + h) = \\cos\\theta\\cos h - \\sin\\theta\\sin h$", "M1: $\\cos\\theta\\left(\\dfrac{\\cos h - 1}{h}\\right) - \\sin\\theta\\left(\\dfrac{\\sin h}{h}\\right)$", "A1: uses $\\dfrac{\\cos h - 1}{h} \\to 0$, $\\dfrac{\\sin h}{h} \\to 1$", "A1: $= -\\sin\\theta$"] }
  ]
});

X("maths:7.2", {
  flashcards: [
    ["Differentiate $y = 3x^2 + \\dfrac{2}{x} + 2$.", "$6x - \\dfrac{2}{x^2}$."],
    ["Differentiate $y = 4\\sqrt x - \\dfrac{5}{x^3}$.", "$2x^{-1/2} + 15x^{-4}$."],
    ["Differentiate $e^{3x}$, $\\sin 2x$, $\\cos 5x$, $\\tan x$, $\\ln 4x$.", "$3e^{3x}$, $2\\cos 2x$, $-5\\sin 5x$, $\\sec^2 x$, $\\dfrac1x$."],
    ["Differentiate $y = 3^x$.", "$3^x\\ln 3$."],
    ["Differentiate $\\dfrac{(2x - 3)^2}{\\sqrt x}$… first step?", "Expand and write as powers: $4x^{3/2} - 12x^{1/2} + 9x^{-1/2}$, then $6x^{1/2} - 6x^{-1/2} - \\tfrac92 x^{-3/2}$."],
    ["Gradient of $y = x^3 - 4x$ at $x = 2$?", "$3(4) - 4 = 8$."],
    ["Differentiate $y = \\ln(x^2)$.", "$\\dfrac{2}{x}$ (since $\\ln x^2 = 2\\ln x$)."],
    ["Differentiate $y = e^{-x/8}$.", "$-\\tfrac18 e^{-x/8}$."]
  ],
  quiz: [
    { q: "$\\dfrac{d}{dx}(5x^{-2}) =$", opts: ["$-10x^{-3}$", "$10x^{-1}$", "$-10x^{-1}$", "$5x^{-3}$"], ans: 0, why: "Multiply by the power, reduce by one." },
    { q: "$\\dfrac{d}{dx}(\\sin 3x) =$", opts: ["$\\cos 3x$", "$3\\cos 3x$", "$-3\\cos 3x$", "$3\\sin 3x$"], ans: 1, why: "Chain rule constant." },
    { q: "$\\dfrac{d}{dx}(\\ln 5x) =$", opts: ["$\\dfrac{5}{x}$", "$\\dfrac{1}{5x}$", "$\\dfrac1x$", "$5\\ln x$"], ans: 2, why: "$\\ln 5x = \\ln 5 + \\ln x$." },
    { q: "$\\dfrac{d}{dx}(\\sqrt x) =$", opts: ["$\\dfrac{1}{2\\sqrt x}$", "$\\sqrt x$", "$\\dfrac{1}{\\sqrt x}$", "$2\\sqrt x$"], ans: 0, why: "$\\tfrac12 x^{-1/2}$." },
    { q: "$\\dfrac{d}{dx}(\\tan x) =$", opts: ["$\\sec x$", "$\\sec^2 x$", "$\\cot x$", "$-\\sec^2 x$"], ans: 1, why: "Standard result." },
    { q: "$\\dfrac{d}{dx}(e^{kx}) = ke^{kx}$ is the reason exponential models suit:", opts: ["linear growth", "growth proportional to size", "periodic change", "constant change"], ans: 1, why: "$\\dfrac{dy}{dx} \\propto y$." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2019 P1 Q5", ctx: "The curve $C$ has equation $y = 3x^2 + \\dfrac{2}{x} + 2$, $x > 0$.",
      parts: [
        { q: "Find $\\dfrac{dy}{dx}$.", marks: 2, ms: ["M1: writes $\\dfrac2x = 2x^{-1}$ and differentiates term by term", "A1: $6x - 2x^{-2}$"] },
        { q: "Find the exact range of values of $x$ for which $C$ is increasing.", marks: 3, ms: ["M1: $6x - \\dfrac{2}{x^2} > 0$", "M1: $6x^3 > 2 \\Rightarrow x^3 > \\tfrac13$", "A1: $x > \\left(\\tfrac13\\right)^{1/3}$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2024 P1 Q1", q: "Find $\\dfrac{dy}{dx}$ when $y = \\dfrac{2x^3 - 5}{\\sqrt x}$, giving your answer in its simplest form.", marks: 3,
      ms: ["M1: $y = 2x^{5/2} - 5x^{-1/2}$", "A1: one term correct", "A1: $5x^{3/2} + \\tfrac52 x^{-3/2}$"] },
    { src: "Edexcel 2022 P2 Q4", q: "Given $y = 4^x$, use the result $\\dfrac{d}{dx}(a^x) = a^x\\ln a$ to find the gradient of the curve at $x = 2$, giving your answer in the form $k\\ln 2$.", marks: 2,
      ms: ["M1: $\\dfrac{dy}{dx} = 4^x\\ln 4 = 16 \\times 2\\ln 2$ at $x = 2$", "A1: $32\\ln 2$"] }
  ]
});

X("maths:7.3", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Tangents, normals, stationary points and optimisation" },
    "**Tangent / normal at $P$** (5 marks): $\\dfrac{dy}{dx}$ at $P$, then $y - y_1 = m(x - x_1)$; normal gradient $-\\dfrac1m$; answer in the form asked. Often followed by **area** between the curve and the tangent (8.3). **Stationary points**: solve $f'(x) = 0$, classify with $f''(x)$ (negative → maximum); \"verify\" means substitute the given $x$ into $f'$ and show it is 0. **Optimisation** (9–13 marks): a box, a cylinder + hemisphere tank, a swimming pool, a cheese wedge, a trough — **form the constraint** (volume or area fixed), **substitute** into the quantity to minimise, **show** the given formula, differentiate, set to zero, **justify the minimum** with the second derivative, evaluate. **Increasing / decreasing**: solve $f'(x) > 0$ or $< 0$ as an inequality, often needing a squared denominator's sign.",
    { callout: { t: "warn", body: "In a 'show that $S = \\ldots$' the algebra must be complete and the given form reached exactly. Use the second derivative — not 'it is obviously a minimum' — and give the **value of the quantity**, not only $x$." }}
  ],
  flashcards: [
    ["Tangent to $y = 2x^3 - 4x + 5$ at $P(2, 13)$?", "$\\dfrac{dy}{dx} = 6x^2 - 4 = 20$: $y - 13 = 20(x - 2)$, i.e. $y = 20x - 27$."],
    ["Normal to $y = x^2 - 3x$ at $x = 1$?", "Point $(1, -2)$, $\\dfrac{dy}{dx} = -1$, normal gradient 1: $y = x - 3$."],
    ["Stationary points of $y = x^3 - 3x^2 - 9x + 1$ and their nature?", "$3x^2 - 6x - 9 = 0 \\Rightarrow x = -1, 3$; $y'' = 6x - 6$: max at $(-1, 6)$, min at $(3, -26)$."],
    ["A closed cylinder has volume $500\\pi$. Show $S = 2\\pi r^2 + \\dfrac{1000\\pi}{r}$.", "$h = \\dfrac{500}{r^2}$; $S = 2\\pi r^2 + 2\\pi r h = 2\\pi r^2 + \\dfrac{1000\\pi}{r}$."],
    ["Minimise $S = 2\\pi r^2 + \\dfrac{1000\\pi}{r}$.", "$S' = 4\\pi r - \\dfrac{1000\\pi}{r^2} = 0 \\Rightarrow r^3 = 250 \\Rightarrow r = 6.30$; $S'' = 4\\pi + \\dfrac{2000\\pi}{r^3} > 0$ so minimum; $S = 748$."],
    ["For which $x$ is $y = 2x^3 - 15x^2 + 24x$ decreasing?", "$6x^2 - 30x + 24 < 0 \\Rightarrow (x - 1)(x - 4) < 0 \\Rightarrow 1 < x < 4$."],
    ["Verify that $x = 2$ is a stationary point of $y = x^3 - 12x$ and classify it.", "$y' = 3x^2 - 12 = 0$ at $x = 2$ ✓; $y'' = 6x = 12 > 0$: minimum."],
    ["What does 'the curve is convex' mean and how is it tested?", "$f''(x) > 0$ on the interval — the gradient is increasing."],
    ["Show $f(x) = x + \\dfrac{4}{x}$ ($x > 0$) has a minimum and find it.", "$f' = 1 - \\dfrac{4}{x^2} = 0 \\Rightarrow x = 2$; $f'' = \\dfrac{8}{x^3} > 0$; minimum value 4."],
    ["A quartic has turning points at $x = -1, 0, 2$; $f'(x) = kx(x+1)(x-2)$. Where is $f'(x) \\ge 0$?", "For $k > 0$: $-1 \\le x \\le 0$ or $x \\ge 2$."]
  ],
  quiz: [
    { q: "Gradient of the normal where the tangent gradient is $\\tfrac23$:", opts: ["$-\\tfrac23$", "$-\\tfrac32$", "$\\tfrac32$", "$\\tfrac23$"], ans: 1, why: "Negative reciprocal." },
    { q: "$f''(x) < 0$ at a stationary point means:", opts: ["minimum", "maximum", "inflection", "nothing"], ans: 1, why: "Concave down." },
    { q: "$y = x^3 - 3x$ has stationary points at:", opts: ["$x = 0$", "$x = \\pm 1$", "$x = \\pm\\sqrt3$", "$x = 3$"], ans: 1, why: "$3x^2 - 3 = 0$." },
    { q: "'Verify that $x = 3$ is a stationary point' requires:", opts: ["solving $f'(x) = 0$", "showing $f'(3) = 0$", "finding $f(3)$", "sketching"], ans: 1, why: "Substitution suffices." },
    { q: "A function is decreasing where:", opts: ["$f(x) < 0$", "$f'(x) < 0$", "$f''(x) < 0$", "$x < 0$"], ans: 1, why: "Negative gradient." },
    { q: "In an optimisation problem the constraint is used to:", opts: ["find the maximum directly", "eliminate a variable before differentiating", "check the answer", "find the domain"], ans: 1, why: "One-variable function." },
    { q: "A point where $f''(x) = 0$ and changes sign is:", opts: ["a maximum", "a minimum", "a point of inflection", "a root"], ans: 2, why: "Concavity changes." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2020 P1 Q1", q: "The curve $C$ has equation $y = 2x^3 - 4x + 5$. Find the equation of the tangent to $C$ at the point $P(2, 13)$, giving your answer in the form $y = mx + c$.", marks: 4,
      ms: ["M1: $\\dfrac{dy}{dx} = 6x^2 - 4$", "A1: gradient at $P$ is 20", "M1: $y - 13 = 20(x - 2)$", "A1: $y = 20x - 27$"] },
    { level: "AS", src: "Edexcel AS 2022 P1 Q12", ctx: "A closed cylindrical tin has radius $r$ cm and height $h$ cm, and a volume of $500$ cm³. The metal for the top and bottom costs 0.2 p per cm² and the metal for the curved surface costs 0.1 p per cm².",
      parts: [
        { q: "Show that the total cost $C$ pence of the metal is given by $C = 0.4\\pi r^2 + \\dfrac{100}{r}$.", marks: 4, ms: ["M1: $\\pi r^2 h = 500 \\Rightarrow h = \\dfrac{500}{\\pi r^2}$", "M1: $C = 0.2 \\times 2\\pi r^2 + 0.1 \\times 2\\pi r h$", "M1: substitutes $h$: $0.2\\pi r h = \\dfrac{100}{r}$", "A1: $C = 0.4\\pi r^2 + \\dfrac{100}{r}$ (cso)"] },
        { q: "Use calculus to find the value of $r$ that minimises $C$, and find the minimum cost.", marks: 5, ms: ["M1: $\\dfrac{dC}{dr} = 0.8\\pi r - \\dfrac{100}{r^2}$", "M1: sets to zero: $r^3 = \\dfrac{100}{0.8\\pi}$", "A1: $r = 3.41$ cm", "M1: $\\dfrac{d^2C}{dr^2} = 0.8\\pi + \\dfrac{200}{r^3} > 0$, so a minimum", "A1: $C = 43.9$ p"] }
      ] },
    { src: "Edexcel 2019 P1 Q13", ctx: "A closed water tank is made from a cylinder of radius $r$ m and height $h$ m with a hemisphere of radius $r$ m on top. The volume of the tank is 6 m³.",
      parts: [
        { q: "Show that the surface area $S$ m² of the tank is given by $S = \\dfrac{12}{r} + \\dfrac{5\\pi r^2}{3}$.", marks: 4, ms: ["M1: $\\pi r^2 h + \\tfrac23\\pi r^3 = 6 \\Rightarrow h = \\dfrac{6}{\\pi r^2} - \\dfrac{2r}{3}$", "M1: $S = \\pi r^2 + 2\\pi r h + 2\\pi r^2$", "M1: substitutes $h$: $2\\pi r h = \\dfrac{12}{r} - \\dfrac{4\\pi r^2}{3}$", "A1: $S = \\dfrac{12}{r} + 3\\pi r^2 - \\dfrac{4\\pi r^2}{3} = \\dfrac{12}{r} + \\dfrac{5\\pi r^2}{3}$ (cso)"] },
        { q: "Find the value of $r$ for which $S$ is a minimum, and the minimum value of $S$.", marks: 5, ms: ["M1: $\\dfrac{dS}{dr} = -\\dfrac{12}{r^2} + \\dfrac{10\\pi r}{3}$", "M1: $= 0 \\Rightarrow r^3 = \\dfrac{36}{10\\pi} = \\dfrac{18}{5\\pi}$", "A1: $r = 1.05$", "M1: $\\dfrac{d^2S}{dr^2} = \\dfrac{24}{r^3} + \\dfrac{10\\pi}{3} > 0$ confirms a minimum", "A1: $S = 17.2$ m²"] }
      ] },
    { level: "AS", src: "Edexcel AS 2023 P1 Q1", q: "$y = x^3 - 6x^2 + 9x + 2$. Find $\\dfrac{dy}{dx}$ and hence find the range of values of $x$ for which $y$ is decreasing.", marks: 4,
      ms: ["M1: $\\dfrac{dy}{dx} = 3x^2 - 12x + 9$", "M1: $3(x - 1)(x - 3) < 0$", "A1: critical values 1 and 3", "A1: $1 < x < 3$"] },
    { src: "Edexcel 2025 P1 Q7", ctx: "The curve $C$ has equation $y = f(x)$ where $f(x) = x^4 + ax^3 + bx^2 + 7$, and has turning points at $x = 0$, $x = 1$ and $x = 3$.",
      parts: [
        { q: "Find the set of values of $x$ for which $f'(x) \\ge 0$.", marks: 2, ms: ["M1: $f'(x) = 4x(x - 1)(x - 3)$ (positive leading coefficient)", "A1: $0 \\le x \\le 1$ or $x \\ge 3$"] },
        { q: "Find the values of $a$ and $b$.", marks: 3, ms: ["M1: expands $4x(x-1)(x-3) = 4x^3 - 16x^2 + 12x$", "A1: compares with $4x^3 + 3ax^2 + 2bx$: $a = -\\tfrac{16}{3}$", "A1: $b = 6$"] }
      ] }
  ]
});

X("maths:7.4", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Chain, product, quotient — 'show that $f'(x) = \\ldots$'" },
    "The 5–6 mark version gives a rational or product function — $\\dfrac{e^{3x}}{4x^2 + k}$, $4(x^2 - 2)e^{-2x}$, $10e^{-0.25x}\\sin x$, $\\dfrac{x + 2}{(x+1)^2}$… — and a target form for $f'(x)$: apply the rule, **factorise out the common factor** ($e^{-2x}$, $(x+1)^{-3}$), and simplify. Follow-ons: **stationary points** (numerator $= 0$), **range of $k$ for a stationary point to exist** (discriminant of the numerator), **decreasing** where the numerator is negative, **turning points satisfy $\\tan x = 4$** (divide by $\\cos x$). **Connected rates** (Specimen): $\\dfrac{dV}{dt} = \\dfrac{dV}{dh}\\cdot\\dfrac{dh}{dt}$.",
    { callout: { t: "memorise", body: "Product $(uv)' = u'v + uv'$ · Quotient $\\left(\\dfrac uv\\right)' = \\dfrac{u'v - uv'}{v^2}$ · Chain $\\dfrac{dy}{dx} = \\dfrac{dy}{du}\\cdot\\dfrac{du}{dx}$ · $\\dfrac{dy}{dx} = 1\\Big/\\dfrac{dx}{dy}$." }}
  ],
  flashcards: [
    ["Differentiate $y = x^2e^{3x}$.", "$2xe^{3x} + 3x^2e^{3x} = xe^{3x}(2 + 3x)$."],
    ["Differentiate $y = \\dfrac{\\sin x}{x}$.", "$\\dfrac{x\\cos x - \\sin x}{x^2}$."],
    ["Differentiate $y = (2x - 5)^6$.", "$12(2x - 5)^5$."],
    ["Differentiate $y = \\ln(x^2 + 1)$.", "$\\dfrac{2x}{x^2 + 1}$."],
    ["Show $\\dfrac{d}{dx}\\left[4(x^2 - 2)e^{-2x}\\right] = -8e^{-2x}(x^2 - x - 2)$.", "$8xe^{-2x} - 8(x^2 - 2)e^{-2x} = -8e^{-2x}(x^2 - x - 2)$; stationary at $x = -1, 2$."],
    ["$f(x) = 10e^{-0.25x}\\sin x$: show turning points satisfy $\\tan x = 4$.", "$f' = 10e^{-0.25x}(\\cos x - 0.25\\sin x) = 0 \\Rightarrow \\tan x = 4$."],
    ["$f(x) = \\dfrac{e^{3x}}{4x^2 + k}$: for which $k$ does $f$ have a stationary point?", "$f' = \\dfrac{e^{3x}(12x^2 - 8x + 3k)}{(4x^2+k)^2}$; need $64 - 144k \\ge 0 \\Rightarrow k \\le \\tfrac49$ (and $k > 0$ for a defined denominator)."],
    ["Differentiate $y = \\sqrt{1 + \\sin 2x}$.", "$\\dfrac{\\cos 2x}{\\sqrt{1 + \\sin 2x}}$."],
    ["Connected rates: $V = \\tfrac43\\pi r^3$, $\\dfrac{dV}{dt} = 10$. Find $\\dfrac{dr}{dt}$ when $r = 2$.", "$\\dfrac{dV}{dr} = 4\\pi r^2 = 16\\pi$; $\\dfrac{dr}{dt} = \\dfrac{10}{16\\pi} = \\dfrac{5}{8\\pi}$."],
    ["Differentiate $y = \\dfrac{x + 2}{(x + 1)^2}$ into the form $\\dfrac{A}{(x+1)^n}$.", "$\\dfrac{(x+1)^2 - 2(x+2)(x+1)}{(x+1)^4} = \\dfrac{(x + 1) - 2(x + 2)}{(x+1)^3} = \\dfrac{-x - 3}{(x+1)^3}$."]
  ],
  quiz: [
    { q: "$\\dfrac{d}{dx}(xe^x) =$", opts: ["$e^x$", "$e^x(x + 1)$", "$xe^x$", "$e^x(x - 1)$"], ans: 1, why: "Product rule." },
    { q: "$\\dfrac{d}{dx}(\\cos^3 x) =$", opts: ["$3\\cos^2 x$", "$-3\\cos^2 x\\sin x$", "$3\\cos^2 x\\sin x$", "$-\\sin^3 x$"], ans: 1, why: "Chain rule." },
    { q: "$\\dfrac{d}{dx}\\left(\\dfrac{1}{x^2 + 1}\\right) =$", opts: ["$\\dfrac{-2x}{(x^2+1)^2}$", "$\\dfrac{2x}{(x^2+1)^2}$", "$\\dfrac{1}{2x}$", "$-\\dfrac{1}{(x^2+1)^2}$"], ans: 0, why: "Chain on $(x^2+1)^{-1}$." },
    { q: "Turning points of $y = e^{-x}\\sin x$ satisfy:", opts: ["$\\tan x = 1$", "$\\tan x = -1$", "$\\sin x = 0$", "$\\cos x = 0$"], ans: 0, why: "$e^{-x}(\\cos x - \\sin x) = 0$." },
    { q: "$\\dfrac{dy}{dx}$ when $x = y^3 + y$:", opts: ["$3y^2 + 1$", "$\\dfrac{1}{3y^2 + 1}$", "$3y^2$", "$y^3$"], ans: 1, why: "Reciprocal of $\\dfrac{dx}{dy}$." },
    { q: "In the quotient rule the denominator becomes:", opts: ["$v$", "$v^2$", "$u^2$", "$uv$"], ans: 1, why: "$\\dfrac{u'v - uv'}{v^2}$." },
    { q: "$\\dfrac{dV}{dt} = \\dfrac{dV}{dr}\\cdot\\dfrac{dr}{dt}$ is:", opts: ["the product rule", "the chain rule for connected rates", "implicit differentiation", "the quotient rule"], ans: 1, why: "Rates linked through $r$." }
  ],
  exam: [
    { src: "Edexcel 2022 P2 Q12", ctx: "$f(x) = \\dfrac{e^{3x}}{4x^2 + k}$, where $k$ is a positive constant.",
      parts: [
        { q: "Show that $f'(x) = \\dfrac{e^{3x}(12x^2 - 8x + 3k)}{(4x^2 + k)^2}$.", marks: 4, ms: ["M1: quotient rule with $u = e^{3x}$, $v = 4x^2 + k$", "A1: $u' = 3e^{3x}$, $v' = 8x$", "M1: $\\dfrac{3e^{3x}(4x^2 + k) - 8xe^{3x}}{(4x^2 + k)^2}$", "A1: factorises $e^{3x}$ to the given form (cso)"] },
        { q: "Find the range of values of $k$ for which $f$ has at least one stationary point.", marks: 2, ms: ["M1: $12x^2 - 8x + 3k = 0$ needs $64 - 144k \\ge 0$", "A1: $0 < k \\le \\tfrac49$"] }
      ] },
    { src: "Edexcel 2019 P2 Q12", ctx: "$f(x) = 10e^{-0.25x}\\sin x$, $x \\ge 0$, models the displacement of a damped oscillation.",
      parts: [
        { q: "Show that the turning points of $y = f(x)$ satisfy $\\tan x = 4$.", marks: 4, ms: ["M1: product rule: $f'(x) = -2.5e^{-0.25x}\\sin x + 10e^{-0.25x}\\cos x$", "A1: correct derivative", "M1: $e^{-0.25x}(10\\cos x - 2.5\\sin x) = 0$", "A1: $\\tan x = 4$ (cso)"] },
        { q: "Find the $x$-coordinate of the first turning point for $x > 0$, to 3 decimal places.", marks: 1, ms: ["B1: $x = 1.326$"] },
        { q: "Describe the long-term behaviour of $f(x)$ as $x$ increases.", marks: 1, ms: ["B1: the oscillations decay — $f(x) \\to 0$ because $e^{-0.25x} \\to 0$"] }
      ] },
    { src: "Edexcel 2024 P1 Q5", ctx: "$f(x) = \\dfrac{2x - 1}{x^2 + 4}$.",
      parts: [
        { q: "Show that $f'(x) = \\dfrac{-2(x^2 - x - 4)}{(x^2 + 4)^2}$.", marks: 3, ms: ["M1: quotient rule $\\dfrac{2(x^2 + 4) - 2x(2x - 1)}{(x^2 + 4)^2}$", "A1: numerator $2x^2 + 8 - 4x^2 + 2x = -2x^2 + 2x + 8$", "A1: $= -2(x^2 - x - 4)$ (cso)"] },
        { q: "Find the values of $x$ for which $f$ is decreasing.", marks: 3, ms: ["M1: $f'(x) < 0 \\iff x^2 - x - 4 > 0$", "A1: critical values $\\dfrac{1 \\pm \\sqrt{17}}{2}$", "A1: $x < \\dfrac{1 - \\sqrt{17}}{2}$ or $x > \\dfrac{1 + \\sqrt{17}}{2}$"] }
      ] },
    { src: "Edexcel Specimen P1 Q8", ctx: "A hemispherical bowl of radius 25 cm contains water to a depth $h$ cm. The volume of water is $V = \\dfrac{\\pi h^2(75 - h)}{3}$ cm³. Water flows in at a constant rate of 40 cm³ per second.",
      parts: [
        { q: "Find $\\dfrac{dV}{dh}$.", marks: 2, ms: ["M1: expands $V = 25\\pi h^2 - \\dfrac{\\pi h^3}{3}$ and differentiates", "A1: $\\dfrac{dV}{dh} = 50\\pi h - \\pi h^2 = \\pi h(50 - h)$"] },
        { q: "Find the rate at which the depth is increasing when $h = 10$.", marks: 3, ms: ["M1: $\\dfrac{dh}{dt} = \\dfrac{dV}{dt}\\Big/\\dfrac{dV}{dh}$", "M1: $\\dfrac{40}{\\pi \\times 10 \\times 40}$", "A1: $\\dfrac{1}{10\\pi} \\approx 0.0318$ cm per second"] }
      ] }
  ]
});

X("maths:7.5", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Implicit differentiation — 7 to 12 marks" },
    "$x^2 - 2xy + 3y^2 = 50$, $x^2\\tan y = 9$, $px^3 + qxy + 3y^2 = 26$, $x^3 + 2xy + 3y^2 = 47$, $(x + y)^3 = 3x^2 - 3y - 2$, $\\sin x + \\cos y = 0.5$. Differentiate term by term with $\\dfrac{d}{dx}(y^n) = ny^{n-1}\\dfrac{dy}{dx}$ and the **product rule for $xy$ terms**, collect $\\dfrac{dy}{dx}$, **show the given form**. Then: the **normal at $P$** (gives equations for $p, q$), **points where the tangent is parallel to an axis** ($\\dfrac{dy}{dx} = 0$: set the numerator to zero; parallel to the $y$-axis: denominator zero), the **furthest point west** ($\\dfrac{dx}{dy} = 0$), and **prove the normal does not meet the curve again** (substitute the line into the curve and show the resulting quadratic has the tangency root repeated / no other real root).",
    { callout: { t: "tip", body: "$y = x^x$ (2019): take logs, $\\ln y = x\\ln x$, differentiate implicitly: $\\dfrac1y\\dfrac{dy}{dx} = \\ln x + 1$; turning point at $x = e^{-1}$." }}
  ],
  flashcards: [
    ["Differentiate $x^2 + y^2 = 25$ implicitly.", "$2x + 2y\\dfrac{dy}{dx} = 0 \\Rightarrow \\dfrac{dy}{dx} = -\\dfrac xy$."],
    ["$\\dfrac{d}{dx}(xy) = ?$", "$y + x\\dfrac{dy}{dx}$."],
    ["$\\dfrac{d}{dx}(3y^2) = ?$", "$6y\\dfrac{dy}{dx}$."],
    ["$x^2 - 2xy + 3y^2 = 50$: find $\\dfrac{dy}{dx}$.", "$2x - 2y - 2x\\dfrac{dy}{dx} + 6y\\dfrac{dy}{dx} = 0 \\Rightarrow \\dfrac{dy}{dx} = \\dfrac{x - y}{x - 3y}$."],
    ["Where is the tangent to $x^2 - 2xy + 3y^2 = 50$ parallel to the $x$-axis?", "$x = y$: substitute: $2x^2 = 50 \\Rightarrow (5, 5)$ and $(-5, -5)$."],
    ["$y = x^x$: find $\\dfrac{dy}{dx}$.", "$\\ln y = x\\ln x \\Rightarrow \\dfrac{dy}{dx} = x^x(\\ln x + 1)$."],
    ["$x^2\\tan y = 9$: show $\\dfrac{dy}{dx} = -\\dfrac{2\\tan y}{x\\sec^2 y}$… or in terms of $x$?", "$2x\\tan y + x^2\\sec^2 y\\dfrac{dy}{dx} = 0 \\Rightarrow \\dfrac{dy}{dx} = -\\dfrac{2\\tan y}{x\\sec^2 y} = -\\dfrac{18x}{x^4 + 81}$ using $\\tan y = 9/x^2$."],
    ["$\\sin x + \\cos y = 0.5$: tangent parallel to the $x$-axis where?", "$\\cos x - \\sin y\\dfrac{dy}{dx} = 0$; $\\dfrac{dy}{dx} = 0 \\Rightarrow \\cos x = 0 \\Rightarrow x = \\tfrac\\pi2$; then $\\cos y = -0.5$, $y = \\tfrac{2\\pi}{3}$."],
    ["Normal at $P(-2, 3)$ to $x^3 + 2xy + 3y^2 = 7$?", "$3x^2 + 2y + 2x y' + 6y y' = 0$; at $P$: $12 + 6 + (-4 + 18)y' = 0 \\Rightarrow y' = -\\tfrac97$; normal gradient $\\tfrac79$: $y - 3 = \\tfrac79(x + 2)$."],
    ["Why does implicit differentiation give $\\dfrac{dy}{dx}$ in terms of both $x$ and $y$?", "The relation is not solved for $y$; the gradient at a point needs both coordinates."]
  ],
  quiz: [
    { q: "$\\dfrac{d}{dx}(y^3) =$", opts: ["$3y^2$", "$3y^2\\dfrac{dy}{dx}$", "$3x^2$", "$y^3\\dfrac{dy}{dx}$"], ans: 1, why: "Chain rule." },
    { q: "$\\dfrac{d}{dx}(x^2y) =$", opts: ["$2xy$", "$2xy + x^2\\dfrac{dy}{dx}$", "$x^2\\dfrac{dy}{dx}$", "$2x\\dfrac{dy}{dx}$"], ans: 1, why: "Product rule." },
    { q: "For $x^2 + y^2 = 25$ at $(3, 4)$, $\\dfrac{dy}{dx} =$", opts: ["$\\tfrac34$", "$-\\tfrac34$", "$\\tfrac43$", "$-\\tfrac43$"], ans: 1, why: "$-x/y$." },
    { q: "A tangent parallel to the $y$-axis occurs where:", opts: ["the numerator of $\\dfrac{dy}{dx}$ is 0", "the denominator of $\\dfrac{dy}{dx}$ is 0", "$y = 0$", "$x = 0$"], ans: 1, why: "Infinite gradient." },
    { q: "$\\dfrac{d}{dx}(\\cos y) =$", opts: ["$-\\sin y$", "$-\\sin y\\dfrac{dy}{dx}$", "$\\sin y\\dfrac{dy}{dx}$", "$-\\cos y$"], ans: 1, why: "Chain rule." },
    { q: "To differentiate $y = x^x$ you first:", opts: ["use the power rule", "take logs of both sides", "use the quotient rule", "substitute $u = x$"], ans: 1, why: "Variable in both base and exponent." }
  ],
  exam: [
    { src: "Edexcel 2023 P2 Q7", ctx: "The curve $C$ has equation $x^3 + 2xy + 3y^2 = 7$, and the point $P(-2, 3)$ lies on $C$.",
      parts: [
        { q: "Find $\\dfrac{dy}{dx}$ in terms of $x$ and $y$.", marks: 4, ms: ["M1: $3x^2 + \\left(2y + 2x\\dfrac{dy}{dx}\\right) + 6y\\dfrac{dy}{dx} = 0$", "A1: correct differentiation of every term", "M1: collects $\\dfrac{dy}{dx}$ terms", "A1: $\\dfrac{dy}{dx} = -\\dfrac{3x^2 + 2y}{2x + 6y}$"] },
        { q: "Find the equation of the normal to $C$ at $P$, giving your answer in the form $ax + by + c = 0$.", marks: 3, ms: ["M1: at $P$: $\\dfrac{dy}{dx} = -\\dfrac{12 + 6}{-4 + 18} = -\\tfrac97$", "M1: normal gradient $\\tfrac79$; $y - 3 = \\tfrac79(x + 2)$", "A1: $7x - 9y + 41 = 0$"] }
      ] },
    { src: "Edexcel 2018 P1 Q9", ctx: "The curve $C$ has equation $x^2 - 2xy + 3y^2 = 50$.",
      parts: [
        { q: "Show that $\\dfrac{dy}{dx} = \\dfrac{x - y}{x - 3y}$.", marks: 4, ms: ["M1: $2x - 2y - 2x\\dfrac{dy}{dx} + 6y\\dfrac{dy}{dx} = 0$", "A1: all terms correct", "M1: $\\dfrac{dy}{dx}(6y - 2x) = 2y - 2x$", "A1: $\\dfrac{dy}{dx} = \\dfrac{x - y}{x - 3y}$ (cso)"] },
        { q: "The point $P$ on $C$ is the point with the least $x$-coordinate. Find the coordinates of $P$.", marks: 5, ms: ["M1: at the leftmost point the tangent is vertical, so $x - 3y = 0$", "M1: substitutes $x = 3y$ into $C$: $9y^2 - 6y^2 + 3y^2 = 50$", "A1: $6y^2 = 50 \\Rightarrow y = \\pm\\dfrac{5}{\\sqrt3}$", "M1: $x = 3y$ with the negative root", "A1: $P\\left(-5\\sqrt3, -\\dfrac{5\\sqrt3}{3}\\right)$"] }
      ] },
    { src: "Edexcel 2019 P1 Q11", ctx: "The curve $C$ has equation $y = x^x$, $x > 0$.",
      parts: [
        { q: "Show that $\\dfrac{dy}{dx} = x^x(1 + \\ln x)$.", marks: 4, ms: ["M1: takes logs: $\\ln y = x\\ln x$", "M1: differentiates implicitly: $\\dfrac1y\\dfrac{dy}{dx} = \\ln x + 1$ (product rule on the right)", "A1: correct derivative of $x\\ln x$", "A1: $\\dfrac{dy}{dx} = x^x(1 + \\ln x)$ (cso)"] },
        { q: "Find the exact $x$-coordinate of the turning point of $C$ and determine its nature.", marks: 3, ms: ["M1: $1 + \\ln x = 0$ (since $x^x > 0$)", "A1: $x = e^{-1}$", "A1: gradient changes from negative to positive (e.g. $\\ln x < -1$ for $x < e^{-1}$), so a minimum"] }
      ] },
    { src: "Edexcel Specimen P1 Q12", q: "The curve $C$ has equation $\\sin x + \\cos y = 0.5$, $0 < x < \\pi$, $0 < y < \\pi$. Find the exact coordinates of the point $P$ on $C$ at which the tangent is parallel to the $x$-axis.", marks: 7,
      ms: ["M1: $\\cos x - \\sin y\\dfrac{dy}{dx} = 0$", "A1: $\\dfrac{dy}{dx} = \\dfrac{\\cos x}{\\sin y}$", "M1: parallel to the $x$-axis when $\\cos x = 0$", "A1: $x = \\tfrac\\pi2$", "M1: $1 + \\cos y = 0.5 \\Rightarrow \\cos y = -\\tfrac12$", "A1: $y = \\tfrac{2\\pi}{3}$", "A1: $P\\left(\\tfrac\\pi2, \\tfrac{2\\pi}{3}\\right)$"] }
  ]
});

X("maths:7.6", {
  flashcards: [
    ["The rate of increase of $n$ is proportional to $\\sqrt n$. Write a differential equation.", "$\\dfrac{dn}{dt} = k\\sqrt n$, $k > 0$."],
    ["A mint's radius decreases at a rate inversely proportional to $r^2$. Differential equation?", "$\\dfrac{dr}{dt} = -\\dfrac{k}{r^2}$."],
    ["A balloon's volume decreases at a constant rate $c$. Show $\\dfrac{dr}{dt} = -\\dfrac{k}{r^2}$.", "$V = \\tfrac43\\pi r^3$, $\\dfrac{dV}{dt} = 4\\pi r^2\\dfrac{dr}{dt} = -c \\Rightarrow \\dfrac{dr}{dt} = -\\dfrac{c}{4\\pi r^2}$."],
    ["Water flows into a tank at 9 litres/min and out at a rate proportional to the volume ($0.3V$). Differential equation?", "$\\dfrac{dV}{dt} = 9 - 0.3V$."],
    ["Newton's law of cooling: differential equation?", "$\\dfrac{d\\theta}{dt} = -k(\\theta - \\theta_{room})$."],
    ["Population growth with a limit $L$ (logistic): form?", "$\\dfrac{dN}{dt} = kN(L - N)$."],
    ["A cuboid tank of base area $A$ fills so that $\\dfrac{dV}{dt} = \\dfrac{c}{\\sqrt h}$. Show $\\dfrac{dh}{dt} = \\dfrac{\\lambda}{\\sqrt h}$.", "$V = Ah \\Rightarrow \\dfrac{dV}{dt} = A\\dfrac{dh}{dt}$, so $\\dfrac{dh}{dt} = \\dfrac{c}{A\\sqrt h}$, $\\lambda = \\dfrac cA$."],
    ["Why is $k$ negative in a decay model $\\dfrac{dN}{dt} = kN$?", "The rate of change is negative — $N$ decreases as $t$ increases."]
  ],
  quiz: [
    { q: "'Rate of change of $P$ is proportional to $P$' is:", opts: ["$\\dfrac{dP}{dt} = kP$", "$P = kt$", "$\\dfrac{dP}{dt} = k$", "$\\dfrac{dP}{dt} = \\dfrac kP$"], ans: 0, why: "Proportional." },
    { q: "'Decreases at a rate inversely proportional to $r^2$':", opts: ["$\\dfrac{dr}{dt} = -kr^2$", "$\\dfrac{dr}{dt} = -\\dfrac{k}{r^2}$", "$\\dfrac{dr}{dt} = \\dfrac{k}{r^2}$", "$\\dfrac{dr}{dt} = -k$"], ans: 1, why: "Negative, inverse square." },
    { q: "For a tank with inflow 5 and outflow $0.2V$:", opts: ["$\\dfrac{dV}{dt} = 5 + 0.2V$", "$\\dfrac{dV}{dt} = 5 - 0.2V$", "$\\dfrac{dV}{dt} = 0.2V - 5$", "$V = 5 - 0.2t$"], ans: 1, why: "In minus out." },
    { q: "In $\\dfrac{dV}{dt} = 4\\pi r^2\\dfrac{dr}{dt}$ the factor $4\\pi r^2$ is:", opts: ["the volume", "$\\dfrac{dV}{dr}$", "the surface area only by coincidence", "$\\dfrac{dr}{dV}$"], ans: 1, why: "Chain rule." },
    { q: "Newton cooling: $\\theta$ approaches:", opts: ["0", "room temperature", "infinity", "$k$"], ans: 1, why: "Equilibrium." },
    { q: "The constant of proportionality is found from:", opts: ["the differential equation alone", "a given data point / rate", "differentiating again", "guessing"], ans: 1, why: "Boundary condition." }
  ],
  exam: [
    { src: "Edexcel Oct 2020 P2 Q14", ctx: "A spherical balloon is deflating. Its volume decreases at a constant rate of $c$ cm³ per second.",
      parts: [
        { q: "Show that $\\dfrac{dr}{dt} = -\\dfrac{k}{r^2}$, where $k$ is a positive constant.", marks: 3, ms: ["M1: $V = \\tfrac43\\pi r^3$, $\\dfrac{dV}{dr} = 4\\pi r^2$", "M1: $\\dfrac{dV}{dt} = 4\\pi r^2\\dfrac{dr}{dt} = -c$", "A1: $\\dfrac{dr}{dt} = -\\dfrac{c}{4\\pi r^2}$, i.e. $k = \\dfrac{c}{4\\pi}$"] },
        { q: "Given that $r = 8$ when $t = 0$ and $r = 4$ when $t = 7$, solve the differential equation to find $r$ in terms of $t$.", marks: 5, ms: ["M1: separates: $\\int r^2\\,dr = -\\int k\\,dt$", "A1: $\\tfrac13 r^3 = -kt + C$", "M1: $t = 0$: $C = \\tfrac{512}{3}$; $t = 7$: $\\tfrac{64}{3} = -7k + \\tfrac{512}{3}$", "A1: $k = \\tfrac{448}{21} = \\tfrac{64}{3}$", "A1: $r^3 = 512 - 64t$, so $r = (512 - 64t)^{1/3}$"] }
      ] },
    { src: "Edexcel 2023 P2 Q11", ctx: "A cuboid tank has a horizontal base of area 2 m². Water flows in so that the volume $V$ m³ increases at a rate inversely proportional to the square root of the depth $h$ m.",
      parts: [
        { q: "Show that $\\dfrac{dh}{dt} = \\dfrac{\\lambda}{\\sqrt h}$, where $\\lambda$ is a positive constant.", marks: 3, ms: ["M1: $\\dfrac{dV}{dt} = \\dfrac{c}{\\sqrt h}$", "M1: $V = 2h \\Rightarrow \\dfrac{dV}{dt} = 2\\dfrac{dh}{dt}$", "A1: $\\dfrac{dh}{dt} = \\dfrac{c}{2\\sqrt h}$, $\\lambda = \\dfrac c2$"] },
        { q: "Given that the depth is 0.25 m when $t = 0$ and 1 m when $t = 7$ minutes, find the depth when $t = 21$ minutes.", marks: 5, ms: ["M1: $\\int\\sqrt h\\,dh = \\int\\lambda\\,dt$", "A1: $\\tfrac23 h^{3/2} = \\lambda t + C$", "M1: $C = \\tfrac23 \\times \\tfrac18 = \\tfrac{1}{12}$; $\\tfrac23 = 7\\lambda + \\tfrac{1}{12} \\Rightarrow \\lambda = \\tfrac{1}{12}$", "M1: at $t = 21$: $\\tfrac23 h^{3/2} = \\tfrac{21}{12} + \\tfrac{1}{12} = \\tfrac{11}{6}$", "A1: $h^{3/2} = \\tfrac{11}{4} \\Rightarrow h = 1.96$ m"] }
      ] },
    { src: "Edexcel 2025 P1 Q10", ctx: "Water flows into a container at a constant rate of 0.45 litres per minute and flows out at a rate of $0.3V$ litres per minute, where $V$ litres is the volume in the container after $t$ minutes.",
      parts: [
        { q: "Show that $20\\dfrac{dV}{dt} = 9 - 6V$.", marks: 2, ms: ["M1: $\\dfrac{dV}{dt} = 0.45 - 0.3V$", "A1: multiplies by 20 (cso)"] },
        { q: "Given that the container is empty at $t = 0$, solve the differential equation, giving $V$ in the form $P - Qe^{-kt}$.", marks: 6, ms: ["M1: separates: $\\int\\dfrac{20}{9 - 6V}dV = \\int dt$", "A1: $-\\tfrac{20}{6}\\ln|9 - 6V| = t + C$", "M1: $V = 0$ at $t = 0$: $C = -\\tfrac{10}{3}\\ln 9$", "M1: $\\ln\\dfrac{9 - 6V}{9} = -0.3t$", "A1: $9 - 6V = 9e^{-0.3t}$", "A1: $V = 1.5 - 1.5e^{-0.3t}$"] },
        { q: "State the limiting volume of water in the container.", marks: 1, ms: ["B1: 1.5 litres"] }
      ] }
  ]
});

X("maths:8.1", {
  flashcards: [
    ["State the Fundamental Theorem of Calculus.", "If $F'(x) = f(x)$ then $\\displaystyle\\int_a^b f(x)\\,dx = F(b) - F(a)$ — integration is the reverse of differentiation."],
    ["$f'(x) = 6x^2 + ax - 23$ and $f(0) = 4$. Write $f(x)$.", "$f(x) = 2x^3 + \\tfrac a2 x^2 - 23x + 4$."],
    ["Given $\\dfrac{dy}{dx} = 3x^2 - 4$ and the curve passes through $(2, 5)$, find $y$.", "$y = x^3 - 4x + c$; $8 - 8 + c = 5 \\Rightarrow y = x^3 - 4x + 5$."],
    ["Why is $+c$ needed in an indefinite integral?", "Differentiating any constant gives 0, so the antiderivative is determined only up to a constant."],
    ["$\\dfrac{d}{dx}\\left(\\int_1^x t^2\\,dt\\right) = ?$", "$x^2$ — differentiating the integral returns the integrand."],
    ["$f'(x) = 4x + a\\sqrt x + b$ with a stationary point at $x = 1$ and $f(0) = 3$… what do you get from each condition?", "$f'(1) = 0$ gives $4 + a + b = 0$; $f(0) = 3$ gives the constant of integration; a third condition is needed for $a, b$ separately."],
    ["Evaluate $\\displaystyle\\int_1^4 \\dfrac{1}{\\sqrt x}dx$.", "$[2\\sqrt x]_1^4 = 4 - 2 = 2$."],
    ["What does a definite integral represent when $f(x) \\ge 0$?", "The area between the curve and the $x$-axis over the interval."]
  ],
  quiz: [
    { q: "$\\displaystyle\\int_0^2 3x^2\\,dx =$", opts: ["8", "12", "4", "6"], ans: 0, why: "$[x^3]_0^2$." },
    { q: "If $F(x) = x^4$, then $\\int 4x^3\\,dx =$", opts: ["$x^4$", "$x^4 + c$", "$4x^4$", "$12x^2$"], ans: 1, why: "Constant of integration." },
    { q: "Given $f'(x)$ and one point on the curve you can find:", opts: ["$f''(x)$ only", "$f(x)$ uniquely", "nothing", "only $c$"], ans: 1, why: "Integrate then fix $c$." },
    { q: "$\\dfrac{d}{dx}\\displaystyle\\int_0^x \\sin t\\,dt =$", opts: ["$\\cos x$", "$\\sin x$", "$-\\cos x$", "0"], ans: 1, why: "FTC." },
    { q: "$\\displaystyle\\int_a^a f(x)\\,dx =$", opts: ["$f(a)$", "0", "$2f(a)$", "undefined"], ans: 1, why: "Zero width." },
    { q: "$\\displaystyle\\int_2^5 f(x)dx = -\\int_5^2 f(x)dx$ is:", opts: ["true", "false"], ans: 0, why: "Swapping limits changes sign." }
  ],
  exam: [
    { src: "Edexcel Oct 2020 P1 Q8", ctx: "$f'(x) = 6x^2 + ax - 23$, where $a$ is a constant. The curve $y = f(x)$ crosses the $y$-axis at $(0, 4)$ and $(x - 2)$ is a factor of $f(x)$.",
      parts: [
        { q: "Find $f(x)$ in terms of $a$.", marks: 3, ms: ["M1: integrates: $2x^3 + \\dfrac{a}{2}x^2 - 23x + c$", "A1: correct integral", "A1: $c = 4$"] },
        { q: "Find the value of $a$.", marks: 3, ms: ["M1: $f(2) = 0$: $16 + 2a - 46 + 4 = 0$", "A1: $2a = 26$", "A1: $a = 13$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2023 P1 Q16", ctx: "$f'(x) = 4x + a\\sqrt x + b$, $x > 0$. The curve $y = f(x)$ has a stationary point at $(4, 10)$ and $f(1) = 7$.",
      parts: [
        { q: "Show that $2a + b = -16$.", marks: 2, ms: ["M1: $f'(4) = 16 + 2a + b = 0$", "A1: $2a + b = -16$"] },
        { q: "Find $f(x)$.", marks: 5, ms: ["M1: integrates: $f(x) = 2x^2 + \\tfrac23 a x^{3/2} + bx + c$", "M1: $f(4) = 10$: $32 + \\tfrac{16}{3}a + 4b + c = 10$; $f(1) = 7$: $2 + \\tfrac23 a + b + c = 7$", "M1: subtracts to eliminate $c$: $30 + \\tfrac{14}{3}a + 3b = 3$", "A1: with $b = -16 - 2a$: $30 + \\tfrac{14}{3}a - 48 - 6a = 3 \\Rightarrow -\\tfrac43 a = 21 \\Rightarrow a = -\\tfrac{63}{4}$, $b = \\tfrac{31}{2}$", "A1: $c = 7 - 2 + \\tfrac{21}{2} - \\tfrac{31}{2} = 0$; $f(x) = 2x^2 - \\tfrac{21}{2}x^{3/2} + \\tfrac{31}{2}x$"] }
      ] }
  ]
});

X("maths:8.2", {
  flashcards: [
    ["$\\int \\left(\\dfrac{2}{x^3} - 6\\sqrt x + 1\\right)dx$", "$-\\dfrac{1}{x^2} - 4x^{3/2} + x + c$."],
    ["$\\int \\dfrac{3x^4 - 4}{2x^3}dx$", "$\\int\\left(\\tfrac32 x - 2x^{-3}\\right)dx = \\tfrac34 x^2 + x^{-2} + c$."],
    ["$\\int \\dfrac{2x - 3}{\\sqrt x}dx$", "$\\int(2x^{1/2} - 3x^{-1/2})dx = \\tfrac43 x^{3/2} - 6x^{1/2} + c$."],
    ["$\\int e^{3x}dx$, $\\int \\sin 2x\\,dx$, $\\int \\cos 5x\\,dx$", "$\\tfrac13 e^{3x}$, $-\\tfrac12\\cos 2x$, $\\tfrac15\\sin 5x$ ($+c$)."],
    ["$\\int \\dfrac{1}{x}dx$ and $\\int \\dfrac{1}{3x - 2}dx$", "$\\ln|x| + c$; $\\tfrac13\\ln|3x - 2| + c$."],
    ["$\\int \\sec^2 3x\\,dx$", "$\\tfrac13\\tan 3x + c$."],
    ["$\\int \\sin^2 x\\,dx$", "Use $\\sin^2 x = \\tfrac12(1 - \\cos 2x)$: $\\tfrac x2 - \\tfrac14\\sin 2x + c$."],
    ["$\\int \\dfrac{1}{x^4} + 6x^2 + 3\\,dx$", "$-\\dfrac{1}{3x^3} + 2x^3 + 3x + c$."],
    ["$\\int (2x + 1)^5\\,dx$", "$\\dfrac{(2x+1)^6}{12} + c$ (reverse chain rule)."],
    ["$\\int \\dfrac{x}{x^2 + 3}dx$", "$\\tfrac12\\ln(x^2 + 3) + c$ — the numerator is half the derivative of the denominator."]
  ],
  quiz: [
    { q: "$\\int x^{-1/2}dx =$", opts: ["$2x^{1/2} + c$", "$\\tfrac12 x^{1/2} + c$", "$-\\tfrac12 x^{-3/2} + c$", "$\\ln x + c$"], ans: 0, why: "Raise power to $\\tfrac12$, divide by $\\tfrac12$." },
    { q: "$\\int \\cos 3x\\,dx =$", opts: ["$3\\sin 3x$", "$\\tfrac13\\sin 3x + c$", "$-\\tfrac13\\sin 3x + c$", "$\\sin 3x + c$"], ans: 1, why: "Divide by the inner derivative." },
    { q: "$\\int e^{-x/8}dx =$", opts: ["$-8e^{-x/8} + c$", "$-\\tfrac18 e^{-x/8} + c$", "$8e^{-x/8} + c$", "$e^{-x/8} + c$"], ans: 0, why: "Divide by $-\\tfrac18$." },
    { q: "$\\int \\dfrac{4}{x}dx =$", opts: ["$4\\ln|x| + c$", "$-\\dfrac{4}{x^2}$", "$\\ln|4x|$", "$4x^{-2}$"], ans: 0, why: "Log integral." },
    { q: "$\\int \\dfrac{1}{(3x - 1)^2}dx =$", opts: ["$-\\dfrac{1}{3(3x - 1)} + c$", "$\\dfrac{1}{3x - 1}$", "$\\ln(3x - 1)^2$", "$-\\dfrac{3}{3x-1}$"], ans: 0, why: "Power $-1$ then divide by 3." },
    { q: "To integrate $\\cos^2 x$ use:", opts: ["$\\cos^2 x = 1 - \\sin^2 x$", "$\\cos^2 x = \\tfrac12(1 + \\cos 2x)$", "the product rule", "$\\sec^2 x$"], ans: 1, why: "Double-angle rearranged." },
    { q: "$\\int \\dfrac{2x}{x^2 + 1}dx =$", opts: ["$\\ln(x^2 + 1) + c$", "$2\\ln(x^2 + 1)$", "$\\dfrac{x^2}{x^2+1}$", "$\\arctan x$"], ans: 0, why: "$\\dfrac{f'}{f}$." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS Nov 2021 P1 Q3", q: "Find $\\displaystyle\\int \\dfrac{3x^4 - 4}{2x^3}\\,dx$, giving each term in its simplest form.", marks: 4,
      ms: ["M1: splits into $\\tfrac32 x - 2x^{-3}$", "A1: correct powers", "A1: $\\tfrac34 x^2$", "A1: $+ x^{-2} + c$"] },
    { level: "AS", src: "Edexcel AS 2018 P1 Q1", q: "Find $\\displaystyle\\int \\left(\\dfrac{2}{x^3} - 6\\sqrt x + 1\\right)dx$, giving each term in its simplest form.", marks: 4,
      ms: ["M1: writes as $2x^{-3} - 6x^{1/2} + 1$", "A1: $-x^{-2}$", "A1: $-4x^{3/2}$", "A1: $+ x + c$"] },
    { src: "Edexcel 2023 P1 Q1", q: "Find $\\displaystyle\\int \\dfrac{\\sqrt x\\,(2x - 5)}{3}\\,dx$, writing each term in its simplest form.", marks: 4,
      ms: ["M1: expands to $\\tfrac23 x^{3/2} - \\tfrac53 x^{1/2}$", "M1: integrates each power", "A1: $\\tfrac{4}{15}x^{5/2}$", "A1: $- \\tfrac{10}{9}x^{3/2} + c$"] },
    { src: "Edexcel 2018 P1 Q7", q: "Show that $\\displaystyle\\int_{k}^{2k} \\dfrac{1}{3x - k}\\,dx$ ($k > 0$) is independent of $k$, and find its exact value.", marks: 4,
      ms: ["M1: integrates to $\\tfrac13\\ln|3x - k|$", "M1: evaluates: $\\tfrac13(\\ln 5k - \\ln 2k)$", "A1: $= \\tfrac13\\ln\\tfrac52$", "A1: no $k$ remains, so the value is independent of $k$"] }
  ]
});

X("maths:8.3", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Areas — under a curve, between a curve and a line, split at the axis" },
    "**Curve and tangent/normal** (AS 2018, 2022, 2024; A-level Oct 2021, 2024): find the tangent, find where it meets the curve again or the axes, then **area = $\\int$ curve $-$ area of the triangle** (or $\\int(\\text{curve} - \\text{line})$). **Area below the axis** is negative — split the integral at the root and add magnitudes (AS 2020, Specimen). **Equal areas** (2019): $\\int_0^b f = 0$ gives an equation in $b$. **Exact form** answers ($a\\sqrt2 + b$, $a\\ln b + c$, $A + Be^{-3}$) — keep everything exact. **Find $k$** from a definite integral equal to a given value (AS 2019, Nov 2021).",
    { callout: { t: "warn", body: "Sketch first. If the region is between the curve and a **line**, the integrand is (upper $-$ lower); if part of the region is a triangle or trapezium, geometry is quicker than a second integral — but state what you are computing." }}
  ],
  flashcards: [
    ["Area between $y = x^2$ and $y = 2x$?", "Intersections 0, 2: $\\int_0^2(2x - x^2)dx = 4 - \\tfrac83 = \\tfrac43$."],
    ["Area bounded by $y = x(x - 2)(x + 1)$ and the $x$-axis?", "Positive on $(-1, 0)$: $\\int_{-1}^0 = \\tfrac{5}{12}$; negative on $(0, 2)$: $\\left|\\int_0^2\\right| = \\tfrac83$; total $\\tfrac{37}{12}$."],
    ["$\\int_1^k \\left(\\dfrac{4}{x^3} + kx\\right)dx = 8$… how do you set it up?", "$\\left[-\\dfrac{2}{x^2} + \\dfrac{kx^2}{2}\\right]_1^k$, expand, solve the resulting equation in $k$."],
    ["Area under $y = 4x^2 + 3$ from $x = -1$ to $x = 2$?", "$\\left[\\tfrac43 x^3 + 3x\\right]_{-1}^2 = (\\tfrac{32}{3} + 6) - (-\\tfrac43 - 3) = 21$."],
    ["Region between $y = x^3 - 3x$ and its tangent at $x = 1$?", "Tangent $y = -2$ meets the curve again where $x^3 - 3x + 2 = (x-1)^2(x+2) = 0$, $x = -2$; area $= \\int_{-2}^{1}(x^3 - 3x + 2)dx = \\tfrac{27}{4}$."],
    ["Exact area under $y = \\dfrac{(x-2)(x-4)}{x}$ between the roots?", "$\\int_2^4\\left(x - 6 + \\dfrac8x\\right)dx = [\\tfrac{x^2}{2} - 6x + 8\\ln x]_2^4 = -6 + 8\\ln 2$; area $6 - 8\\ln 2$."],
    ["Area under $y = \\sqrt x$ from 0 to $a$ equals 18. Find $a$.", "$\\tfrac23 a^{3/2} = 18 \\Rightarrow a = 27^{2/3} = 9$."],
    ["Why must you split $\\int_{-1}^{2} x(x-2)(x+1)\\,dx$?", "The curve is above the axis on part and below on the rest; the signed integral would cancel."],
    ["Area of the region between $y = e^{2x}(2 - x)$ and the axes?", "Roots at $x = 2$; $\\int_0^2 (2 - x)e^{2x}dx$ by parts $= \\left[(2-x)\\tfrac{e^{2x}}{2} + \\tfrac{e^{2x}}{4}\\right]_0^2 = \\tfrac{e^4}{4} - \\tfrac54$."],
    ["Area of a trapezium under a tangent line from $x = 0$ to $x = 3$ with heights 2 and 8?", "$\\tfrac12(2 + 8)\\times 3 = 15$."]
  ],
  quiz: [
    { q: "$\\int_0^3 (x^2 - 3x)dx$ is negative because:", opts: ["a mistake", "the curve is below the $x$-axis on $(0, 3)$", "the limits are reversed", "$x^2$ is negative"], ans: 1, why: "Signed area." },
    { q: "Area between $y = f(x)$ (above) and $y = g(x)$ (below) from $a$ to $b$:", opts: ["$\\int_a^b f + g$", "$\\int_a^b (f - g)$", "$\\int_a^b f \\cdot g$", "$\\int_a^b |f|$"], ans: 1, why: "Upper minus lower." },
    { q: "$\\int_{-2}^{2} x^3\\,dx =$", opts: ["8", "0", "4", "16"], ans: 1, why: "Odd function, symmetric limits." },
    { q: "The area of $\\int_0^4 \\sqrt x\\,dx$ is:", opts: ["$\\tfrac{16}{3}$", "8", "$\\tfrac83$", "4"], ans: 0, why: "$\\tfrac23 \\cdot 8$." },
    { q: "To find where a tangent meets the curve again you:", opts: ["differentiate again", "solve curve = tangent, expecting a repeated root at the point of tangency", "integrate", "use the normal"], ans: 1, why: "$(x - a)^2$ factor." },
    { q: "Region $R$ under a curve but above the $x$-axis between $x = 1$ and $x = 3$ where $f(2) < 0$:", opts: ["one integral", "split at the root and add magnitudes", "no area", "use the normal"], ans: 1, why: "Sign change inside." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2022 P1 Q10", ctx: "The curve $C$ has equation $y = x^2 + 4x + 1$. The tangent to $C$ at the point $P(1, 6)$ crosses the $y$-axis at $Q$. The region $R$ is bounded by $C$, the tangent and the $y$-axis.",
      parts: [
        { q: "Find the equation of the tangent at $P$.", marks: 3, ms: ["M1: $\\dfrac{dy}{dx} = 2x + 4 = 6$ at $P$", "M1: $y - 6 = 6(x - 1)$", "A1: $y = 6x$"] },
        { q: "Find the exact area of $R$.", marks: 5, ms: ["M1: $\\int_0^1 (x^2 + 4x + 1)dx$", "A1: $= \\tfrac13 + 2 + 1 = \\tfrac{10}{3}$", "M1: area under the tangent from 0 to 1 is the triangle $\\tfrac12 \\times 1 \\times 6 = 3$", "M1: area $= \\tfrac{10}{3} - 3$", "A1: $\\tfrac13$"] }
      ] },
    { src: "Edexcel 2022 P1 Q8", ctx: "The curve $C$ has equation $y = \\dfrac{(x - 2)(x - 4)}{x}$, $x > 0$. The region $R$ is bounded by $C$ and the $x$-axis.",
      parts: [
        { q: "Show that $y = x - 6 + \\dfrac{8}{x}$.", marks: 1, ms: ["B1: expands and divides by $x$"] },
        { q: "Find the exact area of $R$, giving your answer in the form $a + b\\ln 2$.", marks: 5, ms: ["M1: integrates: $\\tfrac{x^2}{2} - 6x + 8\\ln x$", "A1: correct integral", "M1: evaluates between 2 and 4", "A1: $(8 - 24 + 8\\ln 4) - (2 - 12 + 8\\ln 2) = -6 + 8\\ln 2$", "A1: area $= 6 - 8\\ln 2$ (region below the axis)"] }
      ] },
    { src: "Edexcel 2019 P1 Q8", ctx: "The curve $y = x(x - 2)(x - b)$, $b > 2$, meets the $x$-axis at 0, 2 and $b$. The area of the region above the axis between 0 and 2 equals the area of the region below the axis between 2 and $b$.",
      parts: [
        { q: "Explain why $\\displaystyle\\int_0^b x(x - 2)(x - b)\\,dx = 0$.", marks: 1, ms: ["B1: the positive and negative signed areas are equal in magnitude so they cancel"] },
        { q: "Hence find the value of $b$.", marks: 5, ms: ["M1: expands $x^3 - (2 + b)x^2 + 2bx$", "M1: integrates: $\\tfrac14 x^4 - \\tfrac{2+b}{3}x^3 + bx^2$", "A1: evaluates at $b$: $\\tfrac{b^4}{4} - \\tfrac{(2+b)b^3}{3} + b^3 = 0$", "M1: divides by $b^3$ ($b \\ne 0$): $\\tfrac b4 - \\tfrac{2 + b}{3} + 1 = 0 \\Rightarrow 3b - 8 - 4b + 12 = 0$", "A1: $b = 4$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2019 P1 Q3", q: "Given that $\\displaystyle\\int_1^2 \\left(\\dfrac{4}{x^3} + kx\\right)dx = 8$, find the value of $k$.", marks: 6,
      ms: ["M1: integrates: $-2x^{-2} + \\tfrac{k}{2}x^2$", "A1: correct integral", "M1: evaluates: $\\left(-\\tfrac12 + 2k\\right) - \\left(-2 + \\tfrac k2\\right)$", "A1: $\\tfrac32 + \\tfrac{3k}{2}$", "M1: $= 8$", "A1: $k = \\tfrac{13}{3}$"] }
  ]
});

X("maths:8.4", {
  flashcards: [
    ["Express $\\displaystyle\\lim_{\\delta x \\to 0}\\sum_{x=1}^{4} \\dfrac{2}{x}\\,\\delta x$ as an integral and evaluate it.", "$\\int_1^4 \\dfrac2x dx = 2\\ln 4 = \\ln 16$."],
    ["What does $\\sum y\\,\\delta x$ represent?", "The total area of thin rectangles of width $\\delta x$ and height $y$ approximating the area under the curve."],
    ["Why does the limit as $\\delta x \\to 0$ give the exact area?", "The rectangles become infinitely thin so the overestimate/underestimate from the tops vanishes."],
    ["Express $\\displaystyle\\lim_{\\delta x \\to 0}\\sum_{x=0}^{3} x^2\\,\\delta x$ as an integral.", "$\\int_0^3 x^2\\,dx = 9$."],
    ["How is the trapezium rule related to integration as a limit of a sum?", "It approximates the area with a finite number of trapezia; the integral is the limit as the strip width tends to 0."],
    ["Show $\\displaystyle\\lim_{\\delta x \\to 0}\\sum_{x=1}^{e^2} \\dfrac{2}{x}\\,\\delta x = k$ for integer $k$.", "$\\int_1^{e^2}\\dfrac2x dx = 2[\\ln x]_1^{e^2} = 4$."],
    ["What symbol replaces $\\sum$ and $\\delta x$ in the limit?", "$\\int$ and $dx$."],
    ["If the rectangles use the left endpoint of each strip on an increasing function, the sum is an…", "Underestimate."]
  ],
  quiz: [
    { q: "$\\displaystyle\\lim_{\\delta x\\to0}\\sum_{x=2}^{5} f(x)\\delta x =$", opts: ["$f(5) - f(2)$", "$\\int_2^5 f(x)dx$", "$\\sum f(x)$", "$f'(x)$"], ans: 1, why: "Definition." },
    { q: "$\\displaystyle\\lim_{\\delta x\\to0}\\sum_{x=1}^{8}\\dfrac{2}{x}\\delta x =$", opts: ["$\\ln 8$", "$\\ln 64$", "$2\\ln 7$", "$\\ln 16$"], ans: 1, why: "$2\\ln 8 = \\ln 64$." },
    { q: "$\\delta x$ represents:", opts: ["the derivative", "a small change / strip width in $x$", "the limit", "the area"], ans: 1, why: "Strip width." },
    { q: "As $\\delta x \\to 0$ the number of strips:", opts: ["decreases", "tends to infinity", "stays fixed", "becomes 1"], ans: 1, why: "Width shrinks." },
    { q: "$\\displaystyle\\lim_{\\delta x\\to0}\\sum_{x=0}^{2} 3x^2\\delta x =$", opts: ["8", "12", "4", "6"], ans: 0, why: "$[x^3]_0^2$." },
    { q: "Integration as the limit of a sum underpins:", opts: ["the product rule", "the area interpretation of a definite integral", "logarithms", "the chain rule"], ans: 1, why: "Riemann sums." }
  ],
  exam: [
    { src: "Edexcel 2025 P1 Q5", q: "Show that $\\displaystyle\\lim_{\\delta x \\to 0}\\sum_{x = 1}^{e^3} \\dfrac{2}{x}\\,\\delta x = k$, where $k$ is an integer to be found.", marks: 3,
      ms: ["M1: expresses the limit as $\\displaystyle\\int_1^{e^3}\\dfrac{2}{x}dx$", "M1: $= [2\\ln x]_1^{e^3}$", "A1: $= 6$"] },
    { src: "Edexcel 2019 P1 Q5", q: "The region $R$ is bounded by the curve $y = x^2 + 1$, the $x$-axis and the lines $x = 0$ and $x = 3$. Write down $\\displaystyle\\lim_{\\delta x \\to 0}\\sum_{x=0}^{3}(x^2 + 1)\\,\\delta x$ as an integral and hence find the area of $R$.", marks: 3,
      ms: ["B1: $\\displaystyle\\int_0^3 (x^2 + 1)dx$", "M1: $[\\tfrac13 x^3 + x]_0^3$", "A1: 12"] }
  ]
});

X("maths:8.5", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Substitution and parts — 5 to 15 marks" },
    "**Substitution** (7–10 marks): the substitution is **given** — $x = u^2 + 1$, $u = 1 + \\sqrt x$, $x = a\\sin^2\\theta$, $x = 2\\sin u$, $u = 4 - \\sqrt h$. Marks: **$dx$ in terms of $du$**, **change the limits**, rewrite the integrand entirely in $u$, integrate (often after dividing out or partial fractions), evaluate to the **exact form** ($A - B\\ln 5$, $k\\pi a^2$). **Parts** (5 marks): $\\int x^3\\ln x$, $\\int 8x^2e^{-3x}$ (parts twice), $\\int(2 - x)e^{2x}$: choose $u$ = the part that simplifies on differentiation (LATE: log, algebra, trig, exponential), give the exact answer.",
    { callout: { t: "warn", body: "Change the **limits** when you change the variable — or substitute back before evaluating. $\\int\\ln x\\,dx$ is parts with $u = \\ln x$, $dv = 1$." }}
  ],
  flashcards: [
    ["$\\int x e^{2x}dx$", "Parts, $u = x$: $\\tfrac x2 e^{2x} - \\tfrac14 e^{2x} + c$."],
    ["$\\int x^3\\ln x\\,dx$", "$u = \\ln x$: $\\tfrac{x^4}{4}\\ln x - \\tfrac{x^4}{16} + c$."],
    ["$\\int_1^{e^2} x^3\\ln x\\,dx$", "$\\left[\\tfrac{x^4}{4}\\ln x - \\tfrac{x^4}{16}\\right]_1^{e^2} = \\tfrac{e^8}{2} - \\tfrac{e^8}{16} + \\tfrac{1}{16} = \\tfrac{7e^8}{16} + \\tfrac{1}{16}$."],
    ["$\\int \\ln x\\,dx$", "$x\\ln x - x + c$."],
    ["$\\int 2x(x^2 + 2)^{3/2}dx$", "$u = x^2 + 2$: $\\tfrac25(x^2 + 2)^{5/2} + c$."],
    ["$\\int_1^4 \\dfrac{1}{1 + \\sqrt x}dx$ with $u = 1 + \\sqrt x$", "$x = (u-1)^2$, $dx = 2(u-1)du$, limits $2 \\to 3$: $\\int_2^3 \\dfrac{2(u-1)}{u}du = [2u - 2\\ln u]_2^3 = 2 - 2\\ln\\tfrac32$."],
    ["$\\int_0^{a}\\sqrt{x(a - x)}\\,dx$ with $x = a\\sin^2\\theta$… set-up?", "$dx = 2a\\sin\\theta\\cos\\theta\\,d\\theta$, limits $0 \\to \\tfrac\\pi2$; integrand becomes $a\\sin\\theta\\cos\\theta \\cdot 2a\\sin\\theta\\cos\\theta = \\tfrac{a^2}{2}\\sin^2 2\\theta$; result $\\tfrac{\\pi a^2}{8}$."],
    ["$\\int x^2 e^{-3x}dx$ needs parts how many times?", "Twice — each application reduces the power of $x$ by one."],
    ["Which substitution for $\\int\\dfrac{1}{\\sqrt{4 - x^2}}dx$?", "$x = 2\\sin u$: gives $\\int du = u = \\arcsin\\tfrac x2$."],
    ["State the parts formula.", "$\\int u\\dfrac{dv}{dx}dx = uv - \\int v\\dfrac{du}{dx}dx$."]
  ],
  quiz: [
    { q: "For $\\int x\\cos x\\,dx$ choose $u =$", opts: ["$\\cos x$", "$x$", "$x\\cos x$", "$\\sin x$"], ans: 1, why: "Differentiates to 1." },
    { q: "With $u = x^2 + 1$, $du =$", opts: ["$2x\\,dx$", "$x\\,dx$", "$dx$", "$2\\,dx$"], ans: 0, why: "$\\dfrac{du}{dx} = 2x$." },
    { q: "$\\int_0^1$ with $u = 1 + x^2$ has $u$-limits:", opts: ["0 to 1", "1 to 2", "0 to 2", "1 to 1"], ans: 1, why: "Substitute the endpoints." },
    { q: "$\\int \\ln x\\,dx =$", opts: ["$\\dfrac1x$", "$x\\ln x - x + c$", "$\\ln x + c$", "$x\\ln x + c$"], ans: 1, why: "Parts with $dv = 1$." },
    { q: "$\\int x e^x dx =$", opts: ["$xe^x + c$", "$(x - 1)e^x + c$", "$(x + 1)e^x + c$", "$\\tfrac{x^2}{2}e^x$"], ans: 1, why: "$xe^x - e^x$." },
    { q: "In $\\int f'(x)\\left[f(x)\\right]^n dx$ the answer is:", opts: ["$\\dfrac{[f(x)]^{n+1}}{n+1} + c$", "$n[f(x)]^{n-1}$", "$\\ln f(x)$", "$[f(x)]^n$"], ans: 0, why: "Reverse chain rule." },
    { q: "The substitution $x = 3\\sin\\theta$ simplifies:", opts: ["$\\sqrt{9 + x^2}$", "$\\sqrt{9 - x^2}$", "$x^2 - 9$", "$e^x$"], ans: 1, why: "$9 - 9\\sin^2 = 9\\cos^2$." }
  ],
  exam: [
    { src: "Edexcel 2022 P2 Q12", q: "Show that $\\displaystyle\\int_1^{e^2} x^3\\ln x\\,dx = ae^8 + b$, where $a$ and $b$ are rational constants to be found.", marks: 5,
      ms: ["M1: parts with $u = \\ln x$, $\\dfrac{dv}{dx} = x^3$: $\\tfrac{x^4}{4}\\ln x - \\int\\tfrac{x^3}{4}dx$", "A1: $\\tfrac{x^4}{4}\\ln x - \\tfrac{x^4}{16}$", "M1: evaluates between 1 and $e^2$", "A1: $\\tfrac{e^8}{2} - \\tfrac{e^8}{16} + \\tfrac{1}{16}$", "A1: $a = \\tfrac{7}{16}$, $b = \\tfrac{1}{16}$"] },
    { src: "Edexcel Oct 2021 P1 Q12", q: "Use the substitution $u = 1 + \\sqrt x$ to show that $\\displaystyle\\int_1^{16}\\dfrac{1}{1 + \\sqrt x}\\,dx = A - B\\ln 5$, where $A$ and $B$ are constants to be found.", marks: 7,
      ms: ["M1: $x = (u - 1)^2$, $\\dfrac{dx}{du} = 2(u - 1)$", "A1: limits $u = 2$ to $u = 5$", "M1: $\\displaystyle\\int_2^5\\dfrac{2(u - 1)}{u}du = \\int_2^5\\left(2 - \\dfrac2u\\right)du$", "A1: $[2u - 2\\ln u]_2^5$", "M1: evaluates", "A1: $(10 - 2\\ln 5) - (4 - 2\\ln 2) = 6 - 2\\ln\\tfrac52$", "A1: $= 6 + 2\\ln 2 - 2\\ln 5$, so $A = 6 + 2\\ln 2$, $B = 2$ (accept $6 - 2\\ln 2.5$)"] },
    { src: "Edexcel 2024 P1 Q11", q: "The region $R$ is bounded by the curve $y = 8x^2e^{-3x}$, the $x$-axis and the line $x = 1$. Find the exact area of $R$, giving your answer in the form $A + Be^{-3}$.", marks: 5,
      ms: ["M1: parts with $u = 8x^2$: $-\\tfrac83 x^2e^{-3x} + \\int\\tfrac{16x}{3}e^{-3x}dx$", "M1: parts again: $\\int\\tfrac{16x}{3}e^{-3x}dx = -\\tfrac{16x}{9}e^{-3x} - \\tfrac{16}{27}e^{-3x}$", "A1: $\\left[-\\tfrac83 x^2e^{-3x} - \\tfrac{16}{9}xe^{-3x} - \\tfrac{16}{27}e^{-3x}\\right]_0^1$", "M1: evaluates", "A1: $\\tfrac{16}{27} - \\tfrac{136}{27}e^{-3}$"] },
    { src: "Edexcel 2024 P2 Q13", q: "Use the substitution $x = a\\sin^2\\theta$ to show that $\\displaystyle\\int_0^a \\sqrt{x(a - x)}\\,dx = k\\pi a^2$, where $k$ is a constant to be found.", marks: 8,
      ms: ["M1: $\\dfrac{dx}{d\\theta} = 2a\\sin\\theta\\cos\\theta$", "A1: limits $\\theta = 0$ to $\\tfrac\\pi2$", "M1: $x(a - x) = a^2\\sin^2\\theta\\cos^2\\theta$ so $\\sqrt{x(a-x)} = a\\sin\\theta\\cos\\theta$", "A1: integrand $2a^2\\sin^2\\theta\\cos^2\\theta = \\tfrac{a^2}{2}\\sin^2 2\\theta$", "M1: $\\sin^2 2\\theta = \\tfrac12(1 - \\cos 4\\theta)$", "A1: $\\tfrac{a^2}{4}\\left[\\theta - \\tfrac14\\sin 4\\theta\\right]_0^{\\pi/2}$", "M1: evaluates", "A1: $\\tfrac{\\pi a^2}{8}$, so $k = \\tfrac18$"] }
  ]
});

X("maths:8.6", {
  flashcards: [
    ["$\\int\\dfrac{5x + 7}{(x + 1)(x + 3)}dx$", "$\\int\\left(\\dfrac{1}{x+1} + \\dfrac{4}{x+3}\\right)dx = \\ln|x+1| + 4\\ln|x+3| + c$."],
    ["$\\int\\dfrac{1}{(x - 1)(x + 2)}dx$", "$\\tfrac13\\ln\\left|\\dfrac{x - 1}{x + 2}\\right| + c$."],
    ["$\\int_2^4\\dfrac{2x + 3}{x(x + 1)}dx$", "$\\dfrac{3}{x} - \\dfrac{1}{x+1}$: $[3\\ln x - \\ln(x+1)]_2^4 = 3\\ln 2 - \\ln 5 + \\ln 3 = \\ln\\tfrac{24}{5}$."],
    ["$\\int\\dfrac{x^2 + 1}{x + 1}dx$", "Divide: $x - 1 + \\dfrac{2}{x+1}$: $\\tfrac{x^2}{2} - x + 2\\ln|x + 1| + c$."],
    ["$\\int\\dfrac{3}{(x - 1)^2}dx$", "$-\\dfrac{3}{x - 1} + c$."],
    ["Solve $\\dfrac{dV}{dt} = \\dfrac{V}{(2t - 1)(t + 1)}$ — the key step?", "$\\int\\dfrac{dV}{V} = \\int\\left(\\dfrac{2/3}{2t - 1} - \\dfrac{1/3}{t + 1}\\right)dt$, so $\\ln V = \\tfrac13\\ln(2t-1) - \\tfrac13\\ln(t+1) + c$."],
    ["Solve $\\dfrac{dV}{dt} = \\tfrac{1}{10}V(25 - V)$ — set-up?", "$\\int\\dfrac{10}{V(25 - V)}dV = \\int dt$; $\\dfrac{10}{V(25-V)} = \\dfrac{2/5}{V} + \\dfrac{2/5}{25 - V}$."],
    ["Why must an improper fraction be divided before integrating?", "Partial fractions apply only to proper fractions; the polynomial part integrates directly."]
  ],
  quiz: [
    { q: "$\\int\\dfrac{1}{x + 2} - \\dfrac{1}{x + 3}\\,dx =$", opts: ["$\\ln\\left|\\dfrac{x+2}{x+3}\\right| + c$", "$\\ln|(x+2)(x+3)|$", "$\\dfrac{1}{(x+2)(x+3)}$", "$\\ln|x + 2| + \\ln|x + 3|$"], ans: 0, why: "Difference of logs." },
    { q: "Before integrating $\\dfrac{x^2}{x - 1}$ you should:", opts: ["use parts", "divide to get $x + 1 + \\dfrac{1}{x-1}$", "substitute $u = x^2$", "differentiate"], ans: 1, why: "Improper fraction." },
    { q: "$\\int\\dfrac{4}{(2x + 1)^2}dx =$", opts: ["$-\\dfrac{2}{2x + 1} + c$", "$\\dfrac{4}{2x+1}$", "$2\\ln(2x+1)$", "$-\\dfrac{4}{2x+1}$"], ans: 0, why: "Power $-1$, divide by 2." },
    { q: "The logistic DE $\\dfrac{dP}{dt} = kP(L - P)$ is solved using:", opts: ["parts", "partial fractions on $\\dfrac{1}{P(L - P)}$", "the trapezium rule", "a substitution $u = P^2$"], ans: 1, why: "Separable with a product denominator." },
    { q: "$\\int_0^1\\dfrac{1}{x + 1}dx =$", opts: ["1", "$\\ln 2$", "$\\ln 1$", "$\\tfrac12$"], ans: 1, why: "$[\\ln(x+1)]_0^1$." },
    { q: "$\\dfrac{1}{(x-1)(x+2)} = \\dfrac{A}{x-1} + \\dfrac{B}{x+2}$ gives $A =$", opts: ["$\\tfrac13$", "$-\\tfrac13$", "1", "3"], ans: 0, why: "$x = 1$: $1 = 3A$." }
  ],
  exam: [
    { src: "Edexcel 2022 P1 Q14", ctx: "The volume $V$ of a balloon satisfies $\\dfrac{dV}{dt} = \\dfrac{V}{(2t - 1)(t + 1)}$ for $t > 1$, and $V = 10$ when $t = 2$.",
      parts: [
        { q: "Express $\\dfrac{1}{(2t - 1)(t + 1)}$ in partial fractions.", marks: 3, ms: ["M1: $1 = A(t + 1) + B(2t - 1)$", "A1: $A = \\tfrac23$ (from $t = \\tfrac12$)", "A1: $B = -\\tfrac13$ (from $t = -1$)"] },
        { q: "Solve the differential equation, giving $V$ as a function of $t$.", marks: 7, ms: ["M1: separates: $\\int\\dfrac{1}{V}dV = \\int\\left(\\dfrac{2/3}{2t - 1} - \\dfrac{1/3}{t + 1}\\right)dt$", "A1: $\\ln V = \\tfrac13\\ln(2t - 1) - \\tfrac13\\ln(t + 1) + c$", "M1: combines logs: $\\ln V = \\tfrac13\\ln\\dfrac{2t - 1}{t + 1} + c$", "M1: $V = A\\left(\\dfrac{2t - 1}{t + 1}\\right)^{1/3}$", "M1: $t = 2$, $V = 10$: $10 = A \\cdot 1$", "A1: $A = 10$", "A1: $V = 10\\left(\\dfrac{2t - 1}{t + 1}\\right)^{1/3}$"] }
      ] },
    { src: "Edexcel Oct 2020 P1 Q6", q: "Given $\\dfrac{2x^2 + 3x - 1}{x + 2} \\equiv Ax + B + \\dfrac{C}{x + 2}$, find $A$, $B$ and $C$, and hence show that $\\displaystyle\\int_0^2\\dfrac{2x^2 + 3x - 1}{x + 2}dx = a + b\\ln 2$ for integers $a$ and $b$.", marks: 7,
      ms: ["M1: divides / compares: $2x^2 + 3x - 1 = (Ax + B)(x + 2) + C$", "A1: $A = 2$, $B = -1$", "A1: $C = 1$", "M1: integrates: $x^2 - x + \\ln|x + 2|$", "M1: evaluates 0 to 2", "A1: $(4 - 2 + \\ln 4) - \\ln 2$", "A1: $= 2 + \\ln 2$, so $a = 2$, $b = 1$"] }
  ]
});

X("maths:8.7", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Separable differential equations — 8 to 12 marks" },
    "$\\dfrac{dH}{dt} = \\dfrac{H\\cos(0.25t)}{40}$, $\\dfrac{dr}{dt} = -\\dfrac{k}{r^2}$, $\\dfrac{dh}{dt} = \\dfrac{\\lambda}{\\sqrt h}$, $\\dfrac{dH}{dt} = -0.12e^{-0.2t}$, $\\dfrac{dV}{dt} = \\tfrac{1}{10}V(25 - V)$: **separate** ($\\int\\dfrac{1}{H}dH = \\int\\dfrac{\\cos 0.25t}{40}dt$), integrate both sides **with one constant**, use the **initial condition** to find it, and rearrange to the form asked ($H = 5e^{0.1\\sin 0.25t}$). The **general solution** has an arbitrary constant; the **particular solution** fixes it.",
    { callout: { t: "warn", body: "After $\\ln V = f(t) + c$, write $V = Ae^{f(t)}$ with $A = e^c$ **before** applying the condition — it avoids sign and log errors. A modulus in $\\ln|9 - 6V|$ can be dropped once the sign is known from the context." }}
  ],
  flashcards: [
    ["Solve $\\dfrac{dy}{dx} = xy$ with $y = 2$ at $x = 0$.", "$\\ln y = \\tfrac{x^2}{2} + c \\Rightarrow y = 2e^{x^2/2}$."],
    ["Solve $\\dfrac{dH}{dt} = \\dfrac{H\\cos 0.25t}{40}$, $H = 5$ at $t = 0$.", "$\\ln H = \\tfrac{\\sin 0.25t}{10} + c$; $H = 5e^{0.1\\sin 0.25t}$."],
    ["Maximum of $H = 5e^{0.1\\sin 0.25t}$ and when first reached?", "$5e^{0.1}$ when $\\sin 0.25t = 1$, $t = 2\\pi$."],
    ["Solve $\\dfrac{dr}{dt} = -\\dfrac{k}{r^2}$ with $r = 8$ at $t = 0$.", "$\\tfrac13 r^3 = -kt + \\tfrac{512}{3}$, so $r^3 = 512 - 3kt$."],
    ["Solve $\\dfrac{dH}{dt} = -0.12e^{-0.2t}$, $H = 1.2$ at $t = 0$.", "$H = 0.6e^{-0.2t} + 0.6$."],
    ["General solution of $\\dfrac{dy}{dx} = \\dfrac{y}{x}$?", "$\\ln y = \\ln x + c \\Rightarrow y = Ax$."],
    ["Solve $\\dfrac{dN}{dt} = kN$, $N(0) = N_0$.", "$N = N_0e^{kt}$."],
    ["Solve $\\dfrac{dy}{dx} = \\dfrac{2x}{y}$.", "$\\int y\\,dy = \\int 2x\\,dx \\Rightarrow \\tfrac{y^2}{2} = x^2 + c$."],
    ["Why is the constant found after integrating, not before?", "The condition applies to the solution, which only exists once both sides are integrated."],
    ["Solve $\\dfrac{dV}{dt} = \\tfrac{1}{10}V(25 - V)$ with $V(0) = 5$ — final form?", "$\\tfrac{2}{5}\\ln\\dfrac{V}{25 - V} = t + c$; $V = \\dfrac{25}{1 + 4e^{-2.5t}}$."]
  ],
  quiz: [
    { q: "$\\dfrac{dy}{dx} = 3y$ has general solution:", opts: ["$y = 3x + c$", "$y = Ae^{3x}$", "$y = e^{3x}$", "$y = 3e^{x}$"], ans: 1, why: "$\\ln y = 3x + c$." },
    { q: "Separating $\\dfrac{dy}{dx} = \\dfrac{x^2}{y}$ gives:", opts: ["$\\int y\\,dy = \\int x^2\\,dx$", "$\\int\\dfrac{1}{y}dy = \\int x^2 dx$", "$\\int y\\,dx = \\int x^2 dy$", "$y = x^3$"], ans: 0, why: "Multiply by $y\\,dx$." },
    { q: "A particular solution is found using:", opts: ["a second derivative", "an initial / boundary condition", "the general solution alone", "partial fractions"], ans: 1, why: "Fixes $c$." },
    { q: "$\\ln y = \\sin x + c$ rearranges to:", opts: ["$y = \\sin x + A$", "$y = Ae^{\\sin x}$", "$y = e^{\\sin x} + c$", "$y = A\\sin x$"], ans: 1, why: "$A = e^c$." },
    { q: "The DE $\\dfrac{dy}{dx} = x + y$:", opts: ["is separable", "is not separable", "has solution $y = e^{x}$", "has solution $y = x^2$"], ans: 1, why: "Sum, not product." },
    { q: "In $\\dfrac{dV}{dt} = 9 - 6V$, separating gives $\\int\\dfrac{1}{9 - 6V}dV =$", opts: ["$\\int dt$", "$\\int V\\,dt$", "$\\int 6\\,dt$", "$\\int\\dfrac{1}{t}dt$"], ans: 0, why: "Divide through." }
  ],
  exam: [
    { src: "Edexcel 2018 P2 Q10", ctx: "The height $H$ metres of a plant $t$ days after planting satisfies $\\dfrac{dH}{dt} = \\dfrac{H\\cos(0.25t)}{40}$, and $H = 5$ when $t = 0$.",
      parts: [
        { q: "Show that $H = 5e^{0.1\\sin(0.25t)}$.", marks: 5, ms: ["M1: $\\int\\dfrac{1}{H}dH = \\int\\dfrac{\\cos 0.25t}{40}dt$", "A1: $\\ln H = \\dfrac{\\sin 0.25t}{10} + c$", "M1: $t = 0$: $\\ln 5 = c$", "M1: $H = e^{0.1\\sin 0.25t + \\ln 5}$", "A1: $H = 5e^{0.1\\sin(0.25t)}$ (cso)"] },
        { q: "Find the maximum height of the plant and the first value of $t$ at which it occurs.", marks: 3, ms: ["M1: maximum when $\\sin 0.25t = 1$", "A1: $H = 5e^{0.1} = 5.53$ m", "A1: $t = 2\\pi = 6.28$ days"] }
      ] },
    { src: "Edexcel 2024 P1 Q7", ctx: "A cylindrical tank is leaking. The depth $H$ m of water after $t$ minutes satisfies $\\dfrac{dH}{dt} = -0.12e^{-0.2t}$, and $H = 1.2$ when $t = 0$.",
      parts: [
        { q: "Find $H$ in terms of $t$, giving your answer in the form $Ae^{-0.2t} + B$.", marks: 4, ms: ["M1: $H = \\int -0.12e^{-0.2t}dt = 0.6e^{-0.2t} + c$", "A1: correct integral", "M1: $1.2 = 0.6 + c$", "A1: $H = 0.6e^{-0.2t} + 0.6$"] },
        { q: "Find the depth of water that remains in the tank in the long term, and the time at which the depth is 0.9 m.", marks: 4, ms: ["B1: 0.6 m", "M1: $0.6e^{-0.2t} = 0.3$", "M1: $t = -5\\ln 0.5$", "A1: $t = 3.47$ min"] }
      ] },
    { src: "Edexcel 2024 P2 Q12", ctx: "The volume $V$ (thousand litres) of water in a reservoir satisfies $\\dfrac{dV}{dt} = \\tfrac{1}{10}V(25 - V)$, and $V = 5$ when $t = 0$.",
      parts: [
        { q: "Express $\\dfrac{10}{V(25 - V)}$ in partial fractions.", marks: 2, ms: ["M1: $\\dfrac{A}{V} + \\dfrac{B}{25 - V}$ with $10 = A(25 - V) + BV$", "A1: $A = B = \\tfrac25$"] },
        { q: "Solve the differential equation, giving $V$ in the form $\\dfrac{a}{1 + be^{-kt}}$.", marks: 7, ms: ["M1: $\\int\\left(\\dfrac{2/5}{V} + \\dfrac{2/5}{25 - V}\\right)dV = \\int dt$", "A1: $\\tfrac25\\ln V - \\tfrac25\\ln(25 - V) = t + c$", "M1: $\\ln\\dfrac{V}{25 - V} = 2.5t + C$", "M1: $V = 5$, $t = 0$: $C = \\ln\\tfrac14$", "M1: $\\dfrac{V}{25 - V} = \\tfrac14 e^{2.5t}$", "A1: $4V = (25 - V)e^{2.5t} \\Rightarrow V(4 + e^{2.5t}) = 25e^{2.5t}$", "A1: $V = \\dfrac{25}{1 + 4e^{-2.5t}}$"] },
        { q: "State the limiting volume.", marks: 1, ms: ["B1: 25 thousand litres"] }
      ] }
  ]
});

X("maths:8.8", {
  flashcards: [
    ["$V = \\dfrac{25}{1 + 4e^{-2.5t}}$: what does the model say as $t \\to \\infty$?", "$V \\to 25$ — the reservoir fills towards a limit of 25 000 litres (an upper bound)."],
    ["A mint dissolves with $r^3 = 512 - 64t$. When has it completely dissolved?", "$r = 0$ at $t = 8$ minutes."],
    ["$N = 3 + 7e^{-0.25t}$ for a mouse population: long-term value and initial value?", "3 (thousand) and 10 (thousand)."],
    ["Show $\\dfrac{dN}{dt} = -0.25(N - 3)$ for $N = 3 + 7e^{-0.25t}$.", "$\\dfrac{dN}{dt} = -1.75e^{-0.25t} = -0.25 \\times 7e^{-0.25t} = -0.25(N - 3)$."],
    ["When is the rate of decrease of $N$ greatest?", "At $t = 0$ — $|\\dfrac{dN}{dt}|$ is largest when $e^{-0.25t}$ is largest."],
    ["What is a limitation of $H = 5e^{0.1\\sin 0.25t}$ as a plant-height model?", "It predicts the plant shrinking periodically, which real plants do not do."],
    ["Solution $h = (512 - 64t)^{1/3}$ — state the domain.", "$0 \\le t \\le 8$; beyond that $r$ would be negative."],
    ["In a solution $V = 1.5 - 1.5e^{-0.3t}$, interpret 1.5 and 0.3.", "1.5 litres is the limiting volume; 0.3 controls how quickly it is approached (the outflow constant)."]
  ],
  quiz: [
    { q: "$V = \\dfrac{25}{1 + 4e^{-2.5t}}$ at $t = 0$ is:", opts: ["25", "5", "0", "4"], ans: 1, why: "$\\dfrac{25}{5}$." },
    { q: "A solution $r = (512 - 64t)^{1/3}$ is valid for:", opts: ["all $t$", "$0 \\le t \\le 8$", "$t \\ge 8$", "$t < 0$"], ans: 1, why: "$r \\ge 0$." },
    { q: "A limit value in a DE solution represents:", opts: ["the initial condition", "the long-term equilibrium", "the maximum rate", "the constant of integration"], ans: 1, why: "As $t \\to \\infty$." },
    { q: "$N = 3 + 7e^{-0.25t}$ has its greatest rate of change at:", opts: ["$t = 0$", "$t = 3$", "$t \\to \\infty$", "$t = 7$"], ans: 0, why: "Exponential decay steepest at the start." },
    { q: "A DE solution that gives negative population for large $t$ shows:", opts: ["the population dies", "the model is not valid there", "a calculation error", "nothing"], ans: 1, why: "Domain limitation." },
    { q: "Interpreting $k$ in $\\dfrac{dN}{dt} = -kN$:", opts: ["the initial size", "the proportional rate of decrease", "the limit", "the time"], ans: 1, why: "Rate constant." }
  ],
  exam: [
    { src: "Edexcel 2018 P1 Q14", ctx: "The number of mice $N$ (thousands) in a field $t$ months after a cull is modelled by $N = 3 + 7e^{-0.25t}$.",
      parts: [
        { q: "Show that $\\dfrac{dN}{dt} = -\\tfrac14(N - 3)$.", marks: 3, ms: ["M1: $\\dfrac{dN}{dt} = -1.75e^{-0.25t}$", "M1: $e^{-0.25t} = \\dfrac{N - 3}{7}$", "A1: $\\dfrac{dN}{dt} = -\\tfrac14(N - 3)$ (cso)"] },
        { q: "Interpret the differential equation in context, and state the long-term population.", marks: 2, ms: ["B1: the population decreases at a rate proportional to how far it is above 3000", "B1: 3000 mice"] },
        { q: "Find the time at which the population is decreasing at 1000 mice per month.", marks: 3, ms: ["M1: $1.75e^{-0.25t} = 1$", "M1: $t = -4\\ln\\dfrac{1}{1.75}$", "A1: $t = 2.24$ months"] }
      ] },
    { src: "Edexcel 2018 P2 Q10", ctx: "A spherical mint of initial radius 8 mm dissolves so that its radius $r$ mm after $t$ minutes satisfies $\\dfrac{dr}{dt} = -\\dfrac{k}{r^2}$, where $k$ is a positive constant. After 4 minutes the radius is 6 mm.",
      parts: [
        { q: "Solve the differential equation to show that $r^3 = 512 - 74t$.", marks: 5, ms: ["M1: $\\int r^2\\,dr = -\\int k\\,dt$", "A1: $\\tfrac13 r^3 = -kt + c$", "M1: $t = 0$: $c = \\tfrac{512}{3}$", "M1: $t = 4$: $72 = -4k + \\tfrac{512}{3} \\Rightarrow k = \\tfrac{74}{3}$", "A1: $r^3 = 512 - 74t$ (cso)"] },
        { q: "Find the total time for the mint to dissolve completely, and give one limitation of the model.", marks: 2, ms: ["B1: $t = \\dfrac{512}{74} = 6.9$ minutes", "B1: e.g. the mint is not a perfect sphere / the dissolving rate depends on sucking, temperature — not just $r$"] }
      ] }
  ]
});

X("maths:9.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Change of sign — 2 marks, but the wording is marked" },
    "Evaluate $f$ at both ends, **show both values with signs**, then the sentence: \"**there is a change of sign and $f$ is continuous on the interval, so a root lies between…**\". Miss either the continuity or the change-of-sign phrase and the second mark goes. Failure cases: a **discontinuity** (asymptote) can give a sign change with no root; **two roots** in the interval give no sign change.",
    { callout: { t: "tip", body: "To show a root is $3.27$ **to 2 d.p.**, test $f(3.265)$ and $f(3.275)$ — the interval that rounds to 3.27." }}
  ],
  flashcards: [
    ["Show $x^3 - 5x + 1 = 0$ has a root between 2 and 3.", "$f(2) = -1 < 0$, $f(3) = 13 > 0$; change of sign and $f$ continuous, so a root lies in $(2, 3)$."],
    ["Why must continuity be mentioned?", "A function like $\\dfrac1x$ changes sign across $x = 0$ without having a root there."],
    ["Show $\\alpha = 1.52$ to 2 d.p. is a root of $f(x) = 0$… method?", "Show $f(1.515)$ and $f(1.525)$ have opposite signs."],
    ["When can a sign-change test miss a root?", "When there are two (an even number of) roots in the interval — the sign returns to what it was."],
    ["$f(x) = 2\\ln(8 - x) - x$: show a root lies in $(3, 4)$.", "$f(3) = 2\\ln 5 - 3 = 0.22$, $f(4) = 2\\ln 4 - 4 = -1.23$; sign change, continuous, so a root in $(3, 4)$."],
    ["What does 'sufficiently well behaved' mean in the spec?", "Continuous on the interval — no asymptotes or jumps."],
    ["Show $\\tan x - x - 1 = 0$ has a root in $(1.1, 1.2)$… caution?", "Check $\\tan$ is continuous there (asymptote is at $\\pi/2 \\approx 1.57$, outside), then test the signs."],
    ["Root of $x^2 - 2 = 0$ lies in $(1.41, 1.42)$: verify.", "$f(1.41) = -0.0119$, $f(1.42) = 0.0164$; sign change, so $\\sqrt2 \\in (1.41, 1.42)$."]
  ],
  quiz: [
    { q: "$f(1) = -2$, $f(2) = 3$ and $f$ continuous. Conclusion:", opts: ["exactly one root in $(1, 2)$", "at least one root in $(1, 2)$", "no root", "root at 1.5"], ans: 1, why: "Could be more than one." },
    { q: "A sign change across an asymptote:", opts: ["proves a root", "does not prove a root", "proves two roots", "is impossible"], ans: 1, why: "Discontinuity." },
    { q: "To show a root is 2.4 (1 d.p.) test:", opts: ["$f(2.4)$ only", "$f(2.35)$ and $f(2.45)$", "$f(2)$ and $f(3)$", "$f(2.3)$ and $f(2.4)$"], ans: 1, why: "Rounding interval." },
    { q: "$f(a) > 0$ and $f(b) > 0$ means:", opts: ["no root in $(a, b)$", "not necessarily — there could be two", "one root", "$f$ is positive everywhere"], ans: 1, why: "Even number of crossings." },
    { q: "The essential phrase in the conclusion:", opts: ["'the answer is'", "'change of sign and continuous'", "'approximately'", "'by calculator'"], ans: 1, why: "Both conditions." },
    { q: "$f(x) = \\dfrac{1}{x - 2}$: $f(1) < 0 < f(3)$ but:", opts: ["there is a root at 2", "there is no root — $f$ is discontinuous at 2", "the root is 2.5", "$f$ is continuous"], ans: 1, why: "Asymptote." }
  ],
  exam: [
    { src: "Edexcel 2018 P2 Q4", ctx: "The curve $y = 2\\ln(8 - x)$ meets the line $y = x$ at the point with $x$-coordinate $\\alpha$.",
      parts: [
        { q: "Show that $3 < \\alpha < 4$.", marks: 2, ms: ["M1: $f(x) = 2\\ln(8 - x) - x$: $f(3) = 0.219$, $f(4) = -1.227$", "A1: change of sign and $f$ continuous on $[3, 4]$, so a root lies in $(3, 4)$"] },
        { q: "The iteration $x_{n+1} = 2\\ln(8 - x_n)$ with $x_0 = 3.5$ is used. Find $x_1$, $x_2$ and $x_3$ to 3 decimal places.", marks: 2, ms: ["A1: $x_1 = 3.008$", "A1: $x_2 = 3.216$, $x_3 = 3.131$"] }
      ] },
    { src: "Edexcel 2024 P1 Q3", ctx: "$f(x) = \\tan x - 3x + 1$, $-\\tfrac\\pi2 < x < \\tfrac\\pi2$.",
      parts: [
        { q: "Show that $f(x) = 0$ has a root $\\alpha$ in the interval $[1.2, 1.3]$.", marks: 2, ms: ["M1: $f(1.2) = 2.572 - 3.6 + 1 = -0.028$, $f(1.3) = 3.602 - 3.9 + 1 = 0.702$", "A1: sign change and $f$ continuous on the interval (no asymptote before $\\tfrac\\pi2$), so a root lies in $[1.2, 1.3]$"] },
        { q: "Explain why the interval $[1.5, 1.6]$ could not be used with this test to locate a root.", marks: 1, ms: ["B1: $\\tan x$ has an asymptote at $x = \\tfrac\\pi2 \\approx 1.571$ inside the interval, so $f$ is not continuous there — a sign change would not imply a root"] }
      ] }
  ]
});

X("maths:9.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Iteration $x_{n+1} = g(x_n)$ — the calculus link" },
    "Most iteration questions start from **calculus**: a turning point of $y = (8 - x)\\ln x$, a maximum speed $v = (10 - 0.4t)\\ln(t + 1)$, $f'(x) = g'(x)$ for exponential and log curves, a car $v = 15t - te^{0.2t}$ — you **differentiate**, set to zero, **rearrange into the given iterative form** (show the algebra), then iterate from $x_0$ to the required accuracy, writing each $x_n$ to more figures than asked. Then **verify** with a change-of-sign check on the interval that rounds to your answer. **Cobweb / staircase**: draw $y = x$ and $y = g(x)$, step vertically to the curve and horizontally to the line; convergence when $|g'(\\alpha)| < 1$.",
    { callout: { t: "warn", body: "Use the **ANS** key and write $x_1, x_2, x_3$ to 4–5 d.p. even if the answer is wanted to 3 d.p. Give the final answer to the accuracy asked and **state the number of decimal places**." }}
  ],
  flashcards: [
    ["Show $x^3 - 5x + 1 = 0$ can be written as $x = \\sqrt{5 - \\dfrac1x}$.", "$x^3 = 5x - 1 \\Rightarrow x^2 = 5 - \\dfrac1x \\Rightarrow x = \\sqrt{5 - \\dfrac1x}$."],
    ["Iterate $x_{n+1} = \\sqrt{5 - 1/x_n}$ from $x_0 = 2$: $x_1, x_2$?", "$x_1 = \\sqrt{4.5} = 2.1213$, $x_2 = \\sqrt{5 - 0.4714} = 2.1281$."],
    ["Turning point of $y = (8 - x)\\ln x$: derive a convergent iteration.", "$\\dfrac{dy}{dx} = -\\ln x + \\dfrac{8 - x}{x} = 0 \\Rightarrow x(1 + \\ln x) = 8 \\Rightarrow x = \\dfrac{8}{1 + \\ln x}$."],
    ["When does $x_{n+1} = g(x_n)$ converge to $\\alpha$?", "When $|g'(\\alpha)| < 1$; it diverges if $|g'(\\alpha)| > 1$."],
    ["Staircase vs cobweb?", "Staircase when $g'(\\alpha) > 0$ (monotone approach); cobweb when $g'(\\alpha) < 0$ (oscillating around the root)."],
    ["Does $x_{n+1} = 2\\ln(8 - x_n)$ converge near $\\alpha \\approx 3.13$?", "$g'(x) = -\\dfrac{2}{8 - x}$; $|g'(3.13)| = 0.41 < 1$ — converges (cobweb)."],
    ["$v = (10 - 0.4t)\\ln(t + 1)$: equation for maximum speed?", "$\\dfrac{dv}{dt} = -0.4\\ln(t + 1) + \\dfrac{10 - 0.4t}{t + 1} = 0$."],
    ["How do you draw a cobweb diagram?", "From $x_0$ go vertically to $y = g(x)$, horizontally to $y = x$, repeat; the staircase/cobweb closes in on the intersection."],
    ["Verify a root is 2.128 to 3 d.p.", "$f(2.1275)$ and $f(2.1285)$ have opposite signs."],
    ["Why might an iteration find a different root from the one wanted?", "Different starting values (and different rearrangements) converge to different fixed points — or diverge."]
  ],
  quiz: [
    { q: "$x^2 - 3x + 1 = 0$ rearranged as $x = g(x)$:", opts: ["$x = \\dfrac{x^2 + 1}{3}$", "$x = 3 - x$", "$x = x^2$", "$x = 1$"], ans: 0, why: "Isolate $3x$." },
    { q: "Iteration converges to $\\alpha$ when:", opts: ["$g'(\\alpha) > 1$", "$|g'(\\alpha)| < 1$", "$g(\\alpha) = 0$", "$x_0 = \\alpha$"], ans: 1, why: "Contraction." },
    { q: "A cobweb diagram occurs when $g'(\\alpha)$ is:", opts: ["positive", "negative", "zero", "large"], ans: 1, why: "Alternating sides." },
    { q: "$x_{n+1} = e^{8/x_n - 1}$ with $x_0 = 3.5$: $x_1 =$", opts: ["3.55", "3.60", "3.61", "3.72"], ans: 2, why: "$e^{1.2857} = 3.617$." },
    { q: "Working to 3 d.p. during iteration:", opts: ["is fine", "risks rounding errors — keep more figures", "speeds convergence", "is required"], ans: 1, why: "Accumulated rounding." },
    { q: "A staircase diagram shows:", opts: ["divergence always", "monotone convergence when $0 < g'(\\alpha) < 1$", "oscillation", "no root"], ans: 1, why: "Same side each step." }
  ],
  exam: [
    { src: "Edexcel Specimen P2 Q6", ctx: "The curve $C$ has equation $y = (8 - x)\\ln x$, $x > 0$. The point $P$ is the maximum point of $C$.",
      parts: [
        { q: "Show that the $x$-coordinate of $P$ satisfies $x = \\dfrac{8}{1 + \\ln x}$.", marks: 4, ms: ["M1: product rule: $\\dfrac{dy}{dx} = -\\ln x + \\dfrac{8 - x}{x}$", "A1: correct derivative", "M1: sets to zero: $x\\ln x = 8 - x$", "A1: $x(1 + \\ln x) = 8 \\Rightarrow x = \\dfrac{8}{1 + \\ln x}$ (cso)"] },
        { q: "Use the iteration $x_{n+1} = \\dfrac{8}{1 + \\ln x_n}$ with $x_0 = 3.5$ to find $x_1$, $x_2$ and $x_3$ to 3 decimal places.", marks: 2, ms: ["A1: $x_1 = 3.551$", "A1: $x_2 = 3.529$, $x_3 = 3.538$"] },
        { q: "Show that the $x$-coordinate of $P$ lies between 3.5 and 3.6.", marks: 2, ms: ["M1: $h(x) = \\ln x - \\dfrac8x + 1$: $h(3.5) = -0.033$, $h(3.6) = 0.059$", "A1: sign change and continuous, so the root lies in $(3.5, 3.6)$"] }
      ] },
    { src: "Edexcel 2022 P2 Q8", ctx: "A car's speed $v$ m/s $t$ seconds after starting is modelled by $v = (10 - 0.4t)\\ln(t + 1)$, $0 \\le t \\le 25$.",
      parts: [
        { q: "Show that the maximum speed occurs when $t$ satisfies $t = \\dfrac{10 - 0.4t}{0.4\\ln(t + 1)} - 1$.", marks: 4, ms: ["M1: $\\dfrac{dv}{dt} = -0.4\\ln(t + 1) + \\dfrac{10 - 0.4t}{t + 1}$", "A1: correct derivative", "M1: $= 0 \\Rightarrow 0.4(t + 1)\\ln(t + 1) = 10 - 0.4t$", "A1: $t + 1 = \\dfrac{10 - 0.4t}{0.4\\ln(t+1)}$, hence the given form (cso)"] },
        { q: "Starting with $t_0 = 7.3$, find $t_1$, $t_2$ and $t_3$ to 3 decimal places. Given that the maximum occurs at $t = 7.33$ to 2 decimal places, find the maximum speed.", marks: 4, ms: ["M1: $t_1 = \\dfrac{7.08}{0.4\\ln 8.3} - 1 = 7.364$", "A1: $t_2 = 7.304$, $t_3 = 7.360$ (oscillating about the root)", "M1: $v = (10 - 0.4 \\times 7.33)\\ln 8.33$", "A1: $v = 15.0$ m/s"] }
      ] }
  ]
});

X("maths:9.3", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Newton–Raphson — derive, iterate, and explain failure" },
    "\"**Show that** the Newton–Raphson formula for $f(x) = x^3 - 2x - 5$ is $x_{n+1} = \\dfrac{2x_n^3 + 5}{3x_n^2 - 2}$\" (2018): substitute into $x_{n+1} = x_n - \\dfrac{f(x_n)}{f'(x_n)}$ and simplify over a common denominator. Then **apply once or twice** from $x_0$ (2022, 2024). **Why $x_0 = 0$ fails** (2018): $f'(0) = 0$ — division by zero / the tangent is horizontal and never meets the axis. Other failures: a starting value near a **turning point** sends the tangent far away; the iteration converges to a **different root**.",
    { callout: { t: "memorise", body: "$x_{n+1} = x_n - \\dfrac{f(x_n)}{f'(x_n)}$. Geometrically: draw the tangent at $x_n$; where it crosses the $x$-axis is $x_{n+1}$." }}
  ],
  flashcards: [
    ["State the Newton–Raphson formula.", "$x_{n+1} = x_n - \\dfrac{f(x_n)}{f'(x_n)}$."],
    ["Derive the NR formula for $f(x) = x^3 - 2x - 5$.", "$x_{n+1} = x_n - \\dfrac{x_n^3 - 2x_n - 5}{3x_n^2 - 2} = \\dfrac{2x_n^3 + 5}{3x_n^2 - 2}$."],
    ["Apply NR once to $f(x) = x^3 - 2x - 5$ from $x_0 = 2$.", "$x_1 = \\dfrac{16 + 5}{12 - 2} = 2.1$."],
    ["Why does $x_0 = 0$ fail for $f(x) = x^3 - 2x - 5$?", "$f'(0) = -2 \\ne 0$ — it does not fail here; $x_1 = 2.5$. Failure needs $f'(x_0) = 0$, e.g. $x_0 = \\sqrt{2/3}$."],
    ["Geometric meaning of one NR step?", "The tangent at $(x_n, f(x_n))$ is drawn; $x_{n+1}$ is where it meets the $x$-axis."],
    ["When does NR fail?", "When $f'(x_n) = 0$ (horizontal tangent), when $x_0$ is near a turning point (tangent shoots off), or it converges to a different root."],
    ["NR for $f(x) = 8\\sin(x/2) - 3x + 9$ from $x_0 = 4$: $x_1$?", "$f(4) = 8\\sin 2 - 12 + 9 = 4.27$; $f'(x) = 4\\cos(x/2) - 3$, $f'(4) = 4\\cos 2 - 3 = -4.66$; $x_1 = 4 + 0.916 = 4.92$."],
    ["Why does NR usually converge faster than $x = g(x)$ iteration?", "It uses gradient information — convergence is quadratic (the number of correct figures roughly doubles each step)."],
    ["NR for $f(x) = \\tan x - 3x + 1$ from $x_0 = 1.2$ — $f'(x)$?", "$f'(x) = \\sec^2 x - 3$."],
    ["If $f'(x_0) = 0$ what happens geometrically?", "The tangent is parallel to the $x$-axis and never meets it — $x_1$ is undefined."]
  ],
  quiz: [
    { q: "NR uses:", opts: ["chords", "tangents", "rectangles", "trapezia"], ans: 1, why: "Tangent intersection." },
    { q: "NR fails immediately if:", opts: ["$f(x_0) = 0$", "$f'(x_0) = 0$", "$x_0 > 0$", "$f''(x_0) = 0$"], ans: 1, why: "Division by zero." },
    { q: "For $f(x) = x^2 - 2$, NR gives $x_{n+1} =$", opts: ["$\\dfrac{x_n}{2} + \\dfrac{1}{x_n}$", "$x_n - x_n^2 + 2$", "$\\dfrac{2}{x_n}$", "$x_n^2 - 2$"], ans: 0, why: "$x - \\dfrac{x^2 - 2}{2x}$." },
    { q: "From $x_0 = 1$, NR on $x^2 - 2$ gives $x_1 =$", opts: ["1.5", "1.4", "2", "1.25"], ans: 0, why: "$0.5 + 1$." },
    { q: "A starting value near a turning point:", opts: ["converges fastest", "may send the tangent far from the root", "is required", "gives an exact root"], ans: 1, why: "Small gradient." },
    { q: "NR convergence is typically:", opts: ["linear", "quadratic — digits double each step", "random", "none"], ans: 1, why: "Second-order." }
  ],
  exam: [
    { src: "Edexcel 2018 P1 Q5", ctx: "$f(x) = x^3 - 2x - 5$ has exactly one real root $\\alpha$.",
      parts: [
        { q: "Show that the Newton–Raphson iteration for finding $\\alpha$ can be written as $x_{n+1} = \\dfrac{2x_n^3 + 5}{3x_n^2 - 2}$.", marks: 3, ms: ["M1: $f'(x) = 3x^2 - 2$", "M1: $x_{n+1} = x_n - \\dfrac{x_n^3 - 2x_n - 5}{3x_n^2 - 2}$", "A1: combines: $\\dfrac{3x_n^3 - 2x_n - x_n^3 + 2x_n + 5}{3x_n^2 - 2} = \\dfrac{2x_n^3 + 5}{3x_n^2 - 2}$ (cso)"] },
        { q: "Using $x_0 = 2$, find $x_1$ and $x_2$ to 4 decimal places.", marks: 2, ms: ["A1: $x_1 = 2.1$", "A1: $x_2 = 2.0946$"] },
        { q: "Explain why the iteration would fail if $x_0 = \\sqrt{\\tfrac23}$ were used.", marks: 1, ms: ["B1: $f'(x_0) = 0$ — the tangent at $x_0$ is horizontal, so it never meets the $x$-axis (division by zero)"] }
      ] },
    { src: "Edexcel 2022 P1 Q6", ctx: "$f(x) = 8\\sin\\left(\\dfrac x2\\right) - 3x + 9$, $0 \\le x \\le 2\\pi$.",
      parts: [
        { q: "Show that $f(x)$ has a local maximum at $x = 2\\arccos\\tfrac34$.", marks: 3, ms: ["M1: $f'(x) = 4\\cos\\dfrac x2 - 3 = 0$", "A1: $\\cos\\dfrac x2 = \\tfrac34 \\Rightarrow x = 2\\arccos\\tfrac34$", "A1: $f''(x) = -2\\sin\\dfrac x2 < 0$ there, so a maximum"] },
        { q: "Use the Newton–Raphson method once, with $x_0 = 4$, to find an approximation for the root of $f(x) = 0$, to 3 decimal places.", marks: 3, ms: ["M1: $f(4) = 8\\sin 2 - 3 = 4.274$, $f'(4) = 4\\cos 2 - 3 = -4.665$", "M1: $x_1 = 4 - \\dfrac{4.274}{-4.665}$", "A1: $x_1 = 4.916$"] }
      ] },
    { src: "Edexcel 2024 P1 Q3", q: "$f(x) = \\tan x - 3x + 1$ has a root $\\alpha$ in $[1.2, 1.3]$. Find $f'(x)$ and apply the Newton–Raphson method once with $x_0 = 1.2$ to find an improved approximation to $\\alpha$, to 4 decimal places.", marks: 4,
      ms: ["B1: $f'(x) = \\sec^2 x - 3$", "M1: $f(1.2) = -0.0280$, $f'(1.2) = 7.616 - 3 = 4.616$", "M1: $x_1 = 1.2 + \\dfrac{0.0280}{4.616}$", "A1: $x_1 = 1.2061$"] }
  ]
});

X("maths:9.4", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Trapezium rule — 4 to 8 marks" },
    "**Complete the table** to the stated accuracy, **apply** $\\dfrac h2[y_0 + y_n + 2(y_1 + \\ldots + y_{n-1})]$ with the correct $h$ (the strip width, $h = \\dfrac{b - a}{n}$ — count strips, not ordinates), give the answer to 3 s.f., then the **follow-ons**: is it an **over- or under-estimate** (sketch: concave curve → underestimate; convex → overestimate), how to **improve** it (more strips), **deduce** related integrals ($\\int 2f(x)dx = 2 \\times$ estimate; $\\int (f(x) + 3)dx$ = estimate + 3 × width; $\\int f(2x)$ needs a change of limits), and **unknowns in the table** (2023: two $y$-values $a$ and $b$ with the area and their sum given → simultaneous equations). In context (2019): a speed table gives a **distance** estimate for a runway.",
    { callout: { t: "warn", body: "The exact area by integration (Oct 2021: $\\int(\\ln x)^2$ by parts) is asked *after* the estimate to compare — keep both to compare the percentage error." }}
  ],
  flashcards: [
    ["State the trapezium rule.", "$\\int_a^b y\\,dx \\approx \\dfrac h2[y_0 + 2(y_1 + \\ldots + y_{n-1}) + y_n]$ with $h = \\dfrac{b - a}{n}$."],
    ["Five ordinates from $x = 1$ to $x = 3$: what is $h$?", "Four strips: $h = 0.5$."],
    ["Table $y$: 1, 1.5, 2.2, 3.1, 4.5 at $h = 0.5$. Estimate.", "$\\tfrac{0.5}{2}[1 + 4.5 + 2(1.5 + 2.2 + 3.1)] = 0.25 \\times 19.1 = 4.775$."],
    ["Given $\\int_1^3 f(x)dx \\approx 4.78$, deduce $\\int_1^3 (2f(x) + 1)dx$.", "$2 \\times 4.78 + 2 = 11.56$."],
    ["Given $\\int_1^3 f(x)dx \\approx 4.78$, deduce $\\int_{0.5}^{1.5} f(2x)dx$.", "$\\tfrac12\\int_1^3 f(u)du = 2.39$."],
    ["When is the trapezium rule an overestimate?", "When the curve is convex (bends upward — $f'' > 0$) on the interval, the chords lie above the curve."],
    ["How can the estimate be improved?", "Use more strips (smaller $h$)."],
    ["Speed table every 5 s: 0, 12, 21, 27, 31 m/s. Estimate distance.", "$\\tfrac52[0 + 31 + 2(12 + 21 + 27)] = 2.5 \\times 151 = 377.5$ m."],
    ["Percentage error of an estimate 4.78 against the exact 4.62?", "$\\dfrac{0.16}{4.62} \\times 100 = 3.5\\%$."],
    ["Table with unknown $y$-values $a$, $b$: area 17.59 and $a + b = 7.2$… how do you solve?", "The rule gives a linear equation in $a$ and $b$; with the sum, solve simultaneously."]
  ],
  quiz: [
    { q: "Six ordinates means how many strips?", opts: ["6", "5", "7", "3"], ans: 1, why: "$n$ strips need $n + 1$ ordinates." },
    { q: "For $\\int_0^2$ with 4 strips, $h =$", opts: ["0.4", "0.5", "2", "0.25"], ans: 1, why: "$2/4$." },
    { q: "For a concave (bending down) curve the trapezium rule gives:", opts: ["an overestimate", "an underestimate", "the exact value", "zero"], ans: 1, why: "Chords lie below." },
    { q: "$\\int_a^b (f(x) + 3)dx$ from an estimate $E$ of $\\int_a^b f$:", opts: ["$E + 3$", "$E + 3(b - a)$", "$3E$", "$E$"], ans: 1, why: "Add the rectangle." },
    { q: "In the rule, interior ordinates are multiplied by:", opts: ["1", "2", "4", "$h$"], ans: 1, why: "Shared by two trapezia." },
    { q: "Doubling the number of strips generally:", opts: ["doubles the error", "reduces the error", "has no effect", "halves the area"], ans: 1, why: "Closer fit." }
  ],
  exam: [
    { src: "Edexcel Oct 2021 P2 Q11", ctx: "The curve $y = (\\ln x)^2$ and the region $R$ bounded by the curve, the $x$-axis and the line $x = 4$. The table gives values of $y$ to 3 decimal places.",
      code: { lang: "pseudo", src: "x :  1     1.5    2      2.5    3      3.5    4\ny :  0     0.164  0.480  0.840  1.207  1.569  1.922" },
      parts: [
        { q: "Use the trapezium rule with all the values in the table to estimate the area of $R$, to 3 significant figures.", marks: 3, ms: ["M1: $h = 0.5$ and correct structure $\\tfrac{0.5}{2}[0 + 1.922 + 2(0.164 + 0.480 + 0.840 + 1.207 + 1.569)]$", "A1: $0.25 \\times 10.442$", "A1: $2.61$"] },
        { q: "Use integration by parts to find the exact area of $R$, and hence find the percentage error in the estimate.", marks: 5, ms: ["M1: $\\int(\\ln x)^2 dx = x(\\ln x)^2 - \\int 2\\ln x\\,dx$", "M1: $\\int\\ln x\\,dx = x\\ln x - x$", "A1: $x(\\ln x)^2 - 2x\\ln x + 2x$", "A1: $[\\ldots]_1^4 = 4(\\ln 4)^2 - 8\\ln 4 + 8 - 2 = 4(\\ln 4)^2 - 8\\ln 4 + 6 = 2.596$", "A1: error $\\approx 0.5\\%$ (the estimate is an overestimate — the curve is convex)"] }
      ] },
    { src: "Edexcel 2022 P1 Q5", ctx: "The table shows values of $y = \\log_{10}(2x)$ for $x = 1$ to $x = 5$ in steps of 1.",
      code: { lang: "pseudo", src: "x :  1       2       3       4       5\ny :  0.3010  0.6021  0.7782  0.9031  1.0000" },
      parts: [
        { q: "Use the trapezium rule with all the values to estimate $\\displaystyle\\int_1^5 \\log_{10}(2x)\\,dx$, to 3 decimal places.", marks: 3, ms: ["M1: $\\tfrac12[0.3010 + 1.0000 + 2(0.6021 + 0.7782 + 0.9031)]$", "A1: $\\tfrac12 \\times 5.8678$", "A1: $2.934$"] },
        { q: "Using your answer, estimate (i) $\\displaystyle\\int_1^5 \\log_{10}(4x^2)\\,dx$ and (ii) $\\displaystyle\\int_1^5 \\log_{10}(20x)\\,dx$.", marks: 3, ms: ["M1: $\\log(4x^2) = 2\\log(2x)$", "A1: (i) $5.868$", "A1: (ii) $\\log(20x) = 1 + \\log(2x)$: $2.934 + 4 = 6.934$"] }
      ] },
    { src: "Edexcel 2019 P2 Q2", ctx: "An aircraft's speed $v$ m/s is recorded every 5 seconds during take-off: $t = 0, 5, 10, 15, 20$ gives $v = 0, 16, 29, 40, 48$.",
      parts: [
        { q: "Use the trapezium rule to estimate the distance travelled in the 20 seconds.", marks: 3, ms: ["M1: distance $= \\int v\\,dt \\approx \\tfrac52[0 + 48 + 2(16 + 29 + 40)]$", "A1: $2.5 \\times 218$", "A1: 545 m"] },
        { q: "State, with a reason, whether this is likely to be an overestimate or an underestimate of the true distance.", marks: 1, ms: ["B1: underestimate — the speed increases at a decreasing rate (the $v$–$t$ curve is concave), so the chords lie below the curve"] }
      ] },
    { src: "Edexcel 2023 P1 Q5", ctx: "The table gives values of $y = f(x)$ for $x = 0, 1, 2, 3, 4$: $y = 2.4, a, 5.1, b, 7.3$. The trapezium rule with all five values estimates $\\displaystyle\\int_0^4 f(x)\\,dx$ as 20.15, and $b - a = 2.4$.",
      parts: [
        { q: "Find the values of $a$ and $b$.", marks: 4, ms: ["M1: $\\tfrac12[2.4 + 7.3 + 2(a + 5.1 + b)] = 20.15$", "A1: $9.7 + 10.2 + 2(a + b) = 40.3 \\Rightarrow a + b = 10.2$", "M1: solves with $b - a = 2.4$", "A1: $a = 3.9$, $b = 6.3$"] }
      ] }
  ]
});

X("maths:9.5", {
  flashcards: [
    ["A runway-length estimate from a speed table uses which method?", "The trapezium rule on $v$ against $t$ — distance is the area under the speed–time graph."],
    ["Why is the trapezium estimate of distance from an increasing-but-flattening speed graph an underestimate?", "The curve is concave, so each chord lies below it."],
    ["A maximum speed problem leads to $t = g(t)$. Why iterate rather than solve exactly?", "The equation mixes $t$ and $\\ln(t + 1)$ — no algebraic solution exists."],
    ["Turning point of $f(x) = 7xe^x/\\sqrt{e^{3x} - 2}$… why numerical?", "$f'(x) = 0$ gives a transcendental equation solvable only by iteration."],
    ["How do you verify an iteration's answer is correct to 3 d.p.?", "Change of sign of the original equation over the interval $[\\alpha - 0.0005, \\alpha + 0.0005]$."],
    ["What does 'interval bisection' involve?", "Repeatedly halving an interval containing a root, keeping the half with the sign change."],
    ["Estimate the area of a lake from width measurements every 10 m: 0, 12, 18, 21, 15, 0.", "$\\tfrac{10}{2}[0 + 0 + 2(12 + 18 + 21 + 15)] = 660$ m²."],
    ["Why give the number of decimal places when reporting an iteration?", "The value is an approximation; the accuracy claimed must be stated and justified."]
  ],
  quiz: [
    { q: "Distance from a speed–time table is estimated by:", opts: ["Newton–Raphson", "the trapezium rule", "differentiation", "a cobweb diagram"], ans: 1, why: "Area under $v$–$t$." },
    { q: "'Solve $x = \\cos x$ to 2 d.p.' is best done by:", opts: ["factorising", "iteration $x_{n+1} = \\cos x_n$", "the quadratic formula", "integration"], ans: 1, why: "No algebraic method." },
    { q: "A change-of-sign check after iteration:", opts: ["is optional", "confirms the stated accuracy", "finds a second root", "is a proof of convergence"], ans: 1, why: "Verification." },
    { q: "Interval bisection halves the interval:", opts: ["once", "until the required accuracy is reached", "twice", "never"], ans: 1, why: "Iterative." },
    { q: "A car model $v = 15t - te^{0.2t}$: the time of maximum speed satisfies:", opts: ["$15 - e^{0.2t}(1 + 0.2t) = 0$", "$15 = e^{0.2t}$", "$t = 0$", "$v = 0$"], ans: 0, why: "Product rule on $te^{0.2t}$." },
    { q: "Numerical methods are needed when:", opts: ["the equation is quadratic", "no exact algebraic method exists", "the answer is an integer", "always"], ans: 1, why: "Transcendental equations." }
  ],
  exam: [
    { src: "Edexcel 2025 P2 Q9", ctx: "The speed $v$ m/s of a racing car $t$ seconds after the start is modelled by $v = 15t - te^{0.2t}$, $0 \\le t \\le 12$.",
      parts: [
        { q: "Show that the maximum speed occurs when $t = 5\\ln\\left(\\dfrac{15}{1 + 0.2t}\\right)$.", marks: 4, ms: ["M1: $\\dfrac{dv}{dt} = 15 - e^{0.2t} - 0.2te^{0.2t}$", "A1: correct derivative", "M1: $= 0 \\Rightarrow e^{0.2t}(1 + 0.2t) = 15$", "A1: $0.2t = \\ln\\dfrac{15}{1 + 0.2t} \\Rightarrow t = 5\\ln\\dfrac{15}{1 + 0.2t}$ (cso)"] },
        { q: "Use the iteration $t_{n+1} = 5\\ln\\left(\\dfrac{15}{1 + 0.2t_n}\\right)$ with $t_0 = 8$ to find $t_1$, $t_2$ and $t_3$ to 3 decimal places.", marks: 2, ms: ["A1: $t_1 = 5\\ln\\dfrac{15}{2.6} = 8.762$", "A1: $t_2 = 8.478$, $t_3 = 8.582$"] },
        { q: "Given that the maximum occurs at $t = 8.55$ (2 d.p.), find the maximum speed to the nearest m/s.", marks: 2, ms: ["M1: $v = 15(8.55) - 8.55e^{1.71}$", "A1: $128.3 - 47.3 = 81$ m/s"] }
      ] },
    { src: "Edexcel 2019 P2 Q2", q: "During a test, the speed of a train is recorded every 10 seconds: $0, 8, 15, 20, 24, 27$ m/s. Estimate the distance travelled in the 50 seconds using the trapezium rule, and explain how a better estimate could be obtained.", marks: 4,
      ms: ["M1: $\\tfrac{10}{2}[0 + 27 + 2(8 + 15 + 20 + 24)]$", "A1: $5 \\times 161$", "A1: 805 m", "B1: record the speed more frequently (smaller time intervals / more strips)"] }
  ]
});

X("maths:10.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Vectors — the geometry question" },
    "Position vectors of $A$, $B$, $C$ (2D or 3D) and: **find $\\overrightarrow{AB}$** ($\\mathbf b - \\mathbf a$), its **magnitude as a simplified surd**, **show a quadrilateral is a trapezium** (one pair of sides parallel: $\\overrightarrow{AB} = k\\overrightarrow{DC}$), **a rhombus** (all sides equal), **right-angled** (Pythagoras on the side lengths — no dot product in this spec), **collinear points** ($\\overrightarrow{AB} = k\\overrightarrow{AC}$ → find $p$), a point **dividing a line in a ratio** ($\\mathbf q = \\mathbf p + \\tfrac13(\\mathbf r - \\mathbf p)$), the **fourth vertex** of a parallelogram, **$|AP| = 2|BP|$** on a line (two positions), **exact area** of a triangle or parallelogram ($\\tfrac12 ab\\sin C$ after finding an angle by the cosine rule).",
    { callout: { t: "warn", body: "$\\overrightarrow{AB} = \\mathbf b - \\mathbf a$, **end minus start**. Parallel vectors are scalar multiples — write \"$\\overrightarrow{AD} = 2\\overrightarrow{BC}$, so $AD$ is parallel to $BC$ and twice as long\". Give surds simplified: $\\sqrt{50} = 5\\sqrt2$." }}
  ],
  flashcards: [
    ["$\\mathbf a = 2\\mathbf i + 3\\mathbf j$, $\\mathbf b = 5\\mathbf i - \\mathbf j$. Find $\\overrightarrow{AB}$ and $|\\overrightarrow{AB}|$.", "$3\\mathbf i - 4\\mathbf j$, magnitude 5."],
    ["$A(1, 2, -1)$, $B(3, -1, 4)$. Find $\\overrightarrow{AB}$ and its magnitude.", "$\\begin{pmatrix}2\\\\-3\\\\5\\end{pmatrix}$, $\\sqrt{38}$."],
    ["Show $A, B, C$ are collinear when $\\overrightarrow{AB} = 2\\mathbf i - \\mathbf j$, $\\overrightarrow{AC} = 6\\mathbf i - 3\\mathbf j$.", "$\\overrightarrow{AC} = 3\\overrightarrow{AB}$ — parallel and share $A$."],
    ["$P, Q, R$ collinear with $Q$ one third of the way from $P$ to $R$. Show $\\mathbf q = \\dfrac{2\\mathbf p + \\mathbf r}{3}$.", "$\\mathbf q = \\mathbf p + \\tfrac13(\\mathbf r - \\mathbf p) = \\tfrac23\\mathbf p + \\tfrac13\\mathbf r$."],
    ["Show $OABC$ is a trapezium given $\\mathbf a = \\mathbf i + 2\\mathbf j$, $\\mathbf b = 4\\mathbf i + 5\\mathbf j$, $\\mathbf c = 2\\mathbf i + 2\\mathbf j$… check.", "$\\overrightarrow{OA} = \\mathbf i + 2\\mathbf j$, $\\overrightarrow{CB} = 2\\mathbf i + 3\\mathbf j$ — not parallel; $\\overrightarrow{OC} = 2\\mathbf i + 2\\mathbf j$, $\\overrightarrow{AB} = 3\\mathbf i + 3\\mathbf j = \\tfrac32\\overrightarrow{OC}$ — parallel, so a trapezium."],
    ["Fourth vertex $D$ of parallelogram $ABCD$ given $\\mathbf a, \\mathbf b, \\mathbf c$?", "$\\mathbf d = \\mathbf a + \\mathbf c - \\mathbf b$ (since $\\overrightarrow{AD} = \\overrightarrow{BC}$)."],
    ["Show triangle with $\\overrightarrow{PQ} = 3\\mathbf i + 4\\mathbf j$, $\\overrightarrow{QR} = 4\\mathbf i - 3\\mathbf j$ is right-angled and isosceles.", "$|PQ| = |QR| = 5$ and $\\overrightarrow{PR} = 7\\mathbf i + \\mathbf j$, $|PR|^2 = 50 = 25 + 25$ — Pythagoras holds, right angle at $Q$."],
    ["Unit vector in the direction of $3\\mathbf i - 4\\mathbf j$?", "$\\tfrac15(3\\mathbf i - 4\\mathbf j)$."],
    ["Exact area of a triangle with sides 5, 5 and included angle $90°$?", "$\\tfrac12 \\times 25 = 12.5$."],
    ["Points on line $AB$ with $|AP| = 2|BP|$?", "Two: $P$ between $A$ and $B$ with $\\mathbf p = \\mathbf a + \\tfrac23(\\mathbf b - \\mathbf a)$, and $P$ beyond $B$ with $\\mathbf p = \\mathbf a + 2(\\mathbf b - \\mathbf a)$."]
  ],
  quiz: [
    { q: "$\\overrightarrow{AB} =$", opts: ["$\\mathbf a - \\mathbf b$", "$\\mathbf b - \\mathbf a$", "$\\mathbf a + \\mathbf b$", "$\\mathbf b$"], ans: 1, why: "End minus start." },
    { q: "$|2\\mathbf i - 3\\mathbf j + 6\\mathbf k| =$", opts: ["7", "11", "$\\sqrt{11}$", "5"], ans: 0, why: "$\\sqrt{4 + 9 + 36}$." },
    { q: "$\\mathbf u = 2\\mathbf i + \\mathbf j$ and $\\mathbf v = -6\\mathbf i - 3\\mathbf j$ are:", opts: ["perpendicular", "parallel", "equal", "unit"], ans: 1, why: "$\\mathbf v = -3\\mathbf u$." },
    { q: "Midpoint $M$ of $AB$ has position vector:", opts: ["$\\mathbf a + \\mathbf b$", "$\\tfrac12(\\mathbf a + \\mathbf b)$", "$\\mathbf b - \\mathbf a$", "$\\tfrac12(\\mathbf b - \\mathbf a)$"], ans: 1, why: "Average." },
    { q: "A quadrilateral with exactly one pair of parallel sides is a:", opts: ["parallelogram", "trapezium", "rhombus", "kite"], ans: 1, why: "Definition." },
    { q: "$\\mathbf a = \\begin{pmatrix}1\\\\2\\\\3\\end{pmatrix}$, $\\mathbf b = \\begin{pmatrix}3\\\\5\\\\7\\end{pmatrix}$: $\\overrightarrow{AB}$ has magnitude", opts: ["$\\sqrt{29}$", "$\\sqrt{14}$", "$\\sqrt{83}$", "5"], ans: 0, why: "$\\sqrt{4 + 9 + 16}$." },
    { q: "Three points are collinear if:", opts: ["$|\\overrightarrow{AB}| = |\\overrightarrow{AC}|$", "$\\overrightarrow{AB} = k\\overrightarrow{AC}$", "$\\overrightarrow{AB} + \\overrightarrow{AC} = 0$", "they form a triangle"], ans: 1, why: "Parallel through a common point." }
  ],
  exam: [
    { src: "Edexcel 2025 P1 Q10", ctx: "$\\overrightarrow{PQ} = 3\\mathbf i - 2\\mathbf j + 6\\mathbf k$ and $\\overrightarrow{QR} = 6\\mathbf i + 3\\mathbf j - 2\\mathbf k$.",
      parts: [
        { q: "Find $\\overrightarrow{PR}$.", marks: 1, ms: ["B1: $9\\mathbf i + \\mathbf j + 4\\mathbf k$"] },
        { q: "Show that triangle $PQR$ is right-angled and isosceles.", marks: 5, ms: ["M1: $|PQ| = \\sqrt{9 + 4 + 36} = 7$", "A1: $|QR| = \\sqrt{36 + 9 + 4} = 7$, so isosceles", "M1: $|PR|^2 = 81 + 1 + 16 = 98$", "A1: $|PQ|^2 + |QR|^2 = 49 + 49 = 98 = |PR|^2$", "A1: by the converse of Pythagoras the angle at $Q$ is $90°$"] }
      ] },
    { src: "Edexcel 2024 P2 Q7", ctx: "The points $A$ and $B$ have position vectors $\\mathbf a = 2\\mathbf i - \\mathbf j + 4\\mathbf k$ and $\\mathbf b = 5\\mathbf i + 2\\mathbf j - 2\\mathbf k$. The point $P$ lies on the line through $A$ and $B$ such that $|\\overrightarrow{AP}| = 2|\\overrightarrow{BP}|$.",
      parts: [
        { q: "Find $\\overrightarrow{AB}$.", marks: 1, ms: ["B1: $3\\mathbf i + 3\\mathbf j - 6\\mathbf k$"] },
        { q: "Find the two possible position vectors of $P$.", marks: 4, ms: ["M1: $P$ between $A$ and $B$: $\\mathbf p = \\mathbf a + \\tfrac23\\overrightarrow{AB}$", "A1: $4\\mathbf i + \\mathbf j$", "M1: $P$ beyond $B$: $\\mathbf p = \\mathbf a + 2\\overrightarrow{AB}$", "A1: $8\\mathbf i + 5\\mathbf j - 8\\mathbf k$"] }
      ] },
    { src: "Edexcel Oct 2020 P2 Q3", ctx: "$\\mathbf a = \\begin{pmatrix}2\\\\1\\\\-3\\end{pmatrix}$, $\\mathbf b = \\begin{pmatrix}5\\\\3\\\\-1\\end{pmatrix}$, $\\mathbf c = \\begin{pmatrix}6\\\\4\\\\4\\end{pmatrix}$ are the position vectors of $A$, $B$ and $C$.",
      parts: [
        { q: "Find $\\overrightarrow{AB}$.", marks: 1, ms: ["B1: $\\begin{pmatrix}3\\\\2\\\\2\\end{pmatrix}$"] },
        { q: "Show that $OABC$ is a trapezium.", marks: 3, ms: ["M1: $\\overrightarrow{OC} = \\begin{pmatrix}6\\\\4\\\\4\\end{pmatrix}$", "A1: $\\overrightarrow{OC} = 2\\overrightarrow{AB}$", "A1: $OC$ is parallel to $AB$ (and not equal in length), so $OABC$ is a trapezium"] }
      ] },
    { level: "AS", src: "Edexcel AS 2024 P1 Q3", ctx: "$P$, $Q$, $R$ have position vectors $\\mathbf p = \\mathbf i + 4\\mathbf j$, $\\mathbf q = 4\\mathbf i + 6\\mathbf j$, $\\mathbf r = 6\\mathbf i + 3\\mathbf j$.",
      parts: [
        { q: "Find $\\overrightarrow{PQ}$ and $\\overrightarrow{QR}$.", marks: 2, ms: ["B1: $3\\mathbf i + 2\\mathbf j$", "B1: $2\\mathbf i - 3\\mathbf j$"] },
        { q: "Show that angle $PQR = 90°$.", marks: 3, ms: ["M1: $|PQ|^2 = 13$, $|QR|^2 = 13$, $\\overrightarrow{PR} = 5\\mathbf i - \\mathbf j$, $|PR|^2 = 26$", "A1: $13 + 13 = 26$", "A1: converse of Pythagoras gives a right angle at $Q$"] },
        { q: "$PQRS$ is a rectangle. Find the position vector of $S$ and the exact area of $PQRS$.", marks: 3, ms: ["M1: $\\mathbf s = \\mathbf p + \\overrightarrow{QR} = 3\\mathbf i + \\mathbf j$", "A1: $S(3, 1)$", "A1: area $= \\sqrt{13}\\times\\sqrt{13} = 13$"] }
      ] }
  ]
});

X("maths:10.2", {
  flashcards: [
    ["Magnitude of $5\\mathbf i - 12\\mathbf j$?", "13."],
    ["Direction of $3\\mathbf i + 4\\mathbf j$ as an angle from the positive $x$-axis?", "$\\arctan\\tfrac43 = 53.1°$."],
    ["Write the vector of magnitude 10 at $30°$ above the positive $x$-axis in component form.", "$10\\cos 30°\\,\\mathbf i + 10\\sin 30°\\,\\mathbf j = 5\\sqrt3\\,\\mathbf i + 5\\mathbf j$."],
    ["Bearing of the vector $-4\\mathbf i + 4\\mathbf j$?", "Pointing north-west: bearing $315°$."],
    ["A boat moves from $(2, 3)$ to $(8, 11)$ in 2 hours. Speed and bearing?", "Displacement $6\\mathbf i + 8\\mathbf j$, distance 10, speed 5 km/h; bearing $\\arctan\\tfrac68 = 36.9°$ (measured from north)."],
    ["Unit vector in the direction of $2\\mathbf i - 2\\mathbf j + \\mathbf k$?", "$\\tfrac13(2\\mathbf i - 2\\mathbf j + \\mathbf k)$."],
    ["Smallest integer $a$ such that $|a\\mathbf i + 2\\mathbf j + 3\\mathbf k| > \\sqrt{38}$?", "$a^2 + 13 > 38 \\Rightarrow a^2 > 25 \\Rightarrow a = 6$."],
    ["Angle between $\\mathbf m = 3\\mathbf i + 4\\mathbf j$ and $\\mathbf m - \\mathbf n$ where $\\mathbf n = \\mathbf i + 7\\mathbf j$?", "$\\mathbf m - \\mathbf n = 2\\mathbf i - 3\\mathbf j$; angles $53.1°$ and $-56.3°$: angle between $= 109.4°$."]
  ],
  quiz: [
    { q: "$|-6\\mathbf i + 8\\mathbf j| =$", opts: ["2", "10", "14", "$\\sqrt{28}$"], ans: 1, why: "$\\sqrt{36 + 64}$." },
    { q: "The angle $4\\mathbf i + 4\\mathbf j$ makes with $\\mathbf i$:", opts: ["$30°$", "$45°$", "$60°$", "$90°$"], ans: 1, why: "Equal components." },
    { q: "Vector of magnitude 6 in the direction of $\\mathbf i - \\mathbf j$… wait: $2\\mathbf i - 2\\mathbf j$ scaled to magnitude 6 is:", opts: ["$3\\mathbf i - 3\\mathbf j$", "$3\\sqrt2(\\mathbf i - \\mathbf j)$", "$6\\mathbf i - 6\\mathbf j$", "$\\mathbf i - \\mathbf j$"], ans: 1, why: "Unit vector $\\tfrac{1}{\\sqrt2}(\\mathbf i - \\mathbf j)$ times 6." },
    { q: "A bearing is measured:", opts: ["anticlockwise from east", "clockwise from north", "from the $x$-axis", "from south"], ans: 1, why: "Convention." },
    { q: "$|\\mathbf a + \\mathbf b| = |\\mathbf a| + |\\mathbf b|$ means:", opts: ["$\\mathbf a \\perp \\mathbf b$", "$\\mathbf a$ and $\\mathbf b$ are parallel in the same direction", "$\\mathbf a = \\mathbf b$", "impossible"], ans: 1, why: "Triangle inequality equality case." },
    { q: "Converting magnitude 8 at $120°$ to components gives $x =$", opts: ["4", "$-4$", "$4\\sqrt3$", "$-4\\sqrt3$"], ans: 1, why: "$8\\cos 120°$." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2020 P1 Q2", ctx: "A boat is at the point with position vector $(2\\mathbf i + 5\\mathbf j)$ km at 1 pm and at $(14\\mathbf i + 10\\mathbf j)$ km at 3 pm, moving with constant velocity. The unit vectors $\\mathbf i$ and $\\mathbf j$ are due east and due north.",
      parts: [
        { q: "Find the speed of the boat.", marks: 3, ms: ["M1: displacement $12\\mathbf i + 5\\mathbf j$", "M1: distance $\\sqrt{144 + 25} = 13$ km in 2 hours", "A1: 6.5 km/h"] },
        { q: "Find the bearing on which the boat is travelling.", marks: 2, ms: ["M1: angle from north $= \\arctan\\dfrac{12}{5}$", "A1: $067°$ (to the nearest degree)"] }
      ] },
    { level: "AS", src: "Edexcel AS 2019 P1 Q16", parts: [
      { q: "Given that $|\\mathbf a + \\mathbf b| = |\\mathbf a| + |\\mathbf b|$ for non-zero vectors $\\mathbf a$ and $\\mathbf b$, state the geometrical relationship between them.", marks: 1, ms: ["B1: $\\mathbf a$ and $\\mathbf b$ are parallel and in the same direction"] },
      { q: "$\\mathbf m = 3\\mathbf i + 4\\mathbf j$ and $\\mathbf n = \\mathbf i + 7\\mathbf j$. Find the angle between $\\mathbf m$ and $\\mathbf m - \\mathbf n$, to 1 decimal place.", marks: 4, ms: ["B1: $\\mathbf m - \\mathbf n = 2\\mathbf i - 3\\mathbf j$", "M1: angle of $\\mathbf m$ above $\\mathbf i$: $\\arctan\\tfrac43 = 53.13°$; angle of $\\mathbf m - \\mathbf n$ below $\\mathbf i$: $\\arctan\\tfrac32 = 56.31°$", "M1: adds", "A1: $109.4°$"] }
    ] },
    { src: "Edexcel 2023 P1 Q3", ctx: "$\\overrightarrow{OA} = 2\\mathbf i - 3\\mathbf j + 5\\mathbf k$ and $\\overrightarrow{OB} = a\\mathbf i + 2\\mathbf j + 3\\mathbf k$, where $a$ is a constant.",
      parts: [
        { q: "Show that $|\\overrightarrow{OA}| = \\sqrt{38}$.", marks: 1, ms: ["B1: $\\sqrt{4 + 9 + 25}$"] },
        { q: "Given that $a$ is a positive integer and $|\\overrightarrow{OB}| > |\\overrightarrow{OA}|$, find the smallest possible value of $a$.", marks: 2, ms: ["M1: $a^2 + 13 > 38 \\Rightarrow a^2 > 25$", "A1: $a = 6$"] }
      ] }
  ]
});

X("maths:10.3", {
  flashcards: [
    ["$\\mathbf a = 2\\mathbf i + \\mathbf j$, $\\mathbf b = -\\mathbf i + 3\\mathbf j$. Find $2\\mathbf a - 3\\mathbf b$.", "$7\\mathbf i - 7\\mathbf j$."],
    ["Geometric meaning of $\\mathbf a + \\mathbf b$?", "Place $\\mathbf b$'s tail at $\\mathbf a$'s head; the resultant runs from $\\mathbf a$'s tail to $\\mathbf b$'s head (triangle law)."],
    ["Geometric meaning of $k\\mathbf a$ for $k < 0$?", "A vector parallel to $\\mathbf a$, $|k|$ times as long, in the opposite direction."],
    ["In triangle $OAB$, $M$ is the midpoint of $AB$. Express $\\overrightarrow{OM}$ in terms of $\\mathbf a$, $\\mathbf b$.", "$\\tfrac12(\\mathbf a + \\mathbf b)$."],
    ["$\\overrightarrow{OA} = \\mathbf a$, $\\overrightarrow{OB} = \\mathbf b$, $C$ divides $OA$ with $OC : CA = 1 : 2$. Find $\\overrightarrow{CB}$.", "$\\mathbf b - \\tfrac13\\mathbf a$."],
    ["Line through $C$ and $M$ meets $OB$ at $N$. How do you find the ratio $ON : NB$?", "Write $\\overrightarrow{ON}$ two ways — as $\\lambda\\mathbf b$ and as $\\overrightarrow{OC} + \\mu\\overrightarrow{CM}$ — and equate coefficients of $\\mathbf a$ and $\\mathbf b$."],
    ["Why can coefficients of $\\mathbf a$ and $\\mathbf b$ be equated?", "Because $\\mathbf a$ and $\\mathbf b$ are non-parallel, a vector has a unique expression $\\lambda\\mathbf a + \\mu\\mathbf b$."],
    ["Parallelogram $PQRS$: $\\overrightarrow{PQ} = \\mathbf u$, $\\overrightarrow{PS} = \\mathbf v$. Diagonals?", "$\\overrightarrow{PR} = \\mathbf u + \\mathbf v$, $\\overrightarrow{QS} = \\mathbf v - \\mathbf u$."],
    ["Show $PQRS$ with $\\overrightarrow{PQ} = 3\\mathbf i + 4\\mathbf j$, $\\overrightarrow{PS} = 5\\mathbf j$ is a rhombus.", "$|PQ| = 5 = |PS|$ and it is a parallelogram, so all sides are 5."],
    ["Exact area of that rhombus?", "$|PQ||PS|\\sin\\theta$ where $\\cos\\theta = \\tfrac45$ (angle between $3\\mathbf i + 4\\mathbf j$ and $\\mathbf j$): $25 \\times \\tfrac35 = 15$."]
  ],
  quiz: [
    { q: "$3(\\mathbf i - 2\\mathbf j) + 2(\\mathbf i + \\mathbf j) =$", opts: ["$5\\mathbf i - 4\\mathbf j$", "$5\\mathbf i - 8\\mathbf j$", "$\\mathbf i - 4\\mathbf j$", "$5\\mathbf i + 4\\mathbf j$"], ans: 0, why: "Component-wise." },
    { q: "$\\mathbf a - \\mathbf b$ runs from:", opts: ["the head of $\\mathbf a$ to the head of $\\mathbf b$", "the head of $\\mathbf b$ to the head of $\\mathbf a$ (tails together)", "the origin", "$\\mathbf a$'s tail to $\\mathbf b$'s head"], ans: 1, why: "Triangle law." },
    { q: "If $\\lambda\\mathbf a + \\mu\\mathbf b = 2\\mathbf a - \\mathbf b$ with $\\mathbf a \\nparallel \\mathbf b$, then:", opts: ["$\\lambda = 2, \\mu = -1$", "$\\lambda = -1, \\mu = 2$", "nothing follows", "$\\lambda = \\mu$"], ans: 0, why: "Unique decomposition." },
    { q: "$\\overrightarrow{AB} = 2\\overrightarrow{CD}$ implies:", opts: ["$AB$ and $CD$ are perpendicular", "$AB$ is parallel to $CD$ and twice as long", "$A = C$", "$AB = CD$"], ans: 1, why: "Scalar multiple." },
    { q: "Midpoint of $AB$ with $\\mathbf a = 2\\mathbf i$, $\\mathbf b = 4\\mathbf j$:", opts: ["$\\mathbf i + 2\\mathbf j$", "$2\\mathbf i + 4\\mathbf j$", "$\\mathbf i + \\mathbf j$", "$3\\mathbf i + 2\\mathbf j$"], ans: 0, why: "Average." },
    { q: "In a parallelogram $OACB$ with $\\overrightarrow{OA} = \\mathbf a$, $\\overrightarrow{OB} = \\mathbf b$, $\\overrightarrow{OC} =$", opts: ["$\\mathbf a - \\mathbf b$", "$\\mathbf a + \\mathbf b$", "$\\tfrac12(\\mathbf a + \\mathbf b)$", "$\\mathbf b - \\mathbf a$"], ans: 1, why: "Diagonal." }
  ],
  exam: [
    { src: "Edexcel 2019 P2 Q10", ctx: "In triangle $OAB$, $\\overrightarrow{OA} = \\mathbf a$ and $\\overrightarrow{OB} = \\mathbf b$. The point $C$ lies on $OA$ with $OC : CA = 2 : 1$, and $M$ is the midpoint of $AB$. The line through $C$ and $M$ meets $OB$ extended at $N$.",
      parts: [
        { q: "Find $\\overrightarrow{CM}$ in terms of $\\mathbf a$ and $\\mathbf b$.", marks: 2, ms: ["M1: $\\overrightarrow{OM} = \\tfrac12(\\mathbf a + \\mathbf b)$, $\\overrightarrow{OC} = \\tfrac23\\mathbf a$", "A1: $\\overrightarrow{CM} = \\tfrac12\\mathbf b - \\tfrac16\\mathbf a$"] },
        { q: "Prove that $ON : NB = 3 : 1$… find the ratio $ON : OB$.", marks: 4, ms: ["M1: $\\overrightarrow{ON} = \\overrightarrow{OC} + \\mu\\overrightarrow{CM} = \\tfrac23\\mathbf a + \\mu(\\tfrac12\\mathbf b - \\tfrac16\\mathbf a)$ and also $\\overrightarrow{ON} = \\lambda\\mathbf b$", "M1: equates coefficients of $\\mathbf a$: $\\tfrac23 - \\tfrac\\mu6 = 0 \\Rightarrow \\mu = 4$", "A1: coefficient of $\\mathbf b$: $\\lambda = 2$, so $\\overrightarrow{ON} = 2\\mathbf b$", "A1: $ON : OB = 2 : 1$, i.e. $N$ is such that $B$ is the midpoint of $ON$"] }
      ] },
    { src: "Edexcel 2022 P2 Q9", ctx: "$PQRS$ is a parallelogram with $\\overrightarrow{PQ} = 3\\mathbf i + 4\\mathbf j$ and $\\overrightarrow{PS} = 5\\mathbf j$… in three dimensions: $\\overrightarrow{PQ} = 2\\mathbf i + 2\\mathbf j + \\mathbf k$ and $\\overrightarrow{PS} = \\mathbf i - 2\\mathbf j + 2\\mathbf k$.",
      parts: [
        { q: "Show that $PQRS$ is a rhombus.", marks: 2, ms: ["M1: $|PQ| = \\sqrt{4 + 4 + 1} = 3$, $|PS| = \\sqrt{1 + 4 + 4} = 3$", "A1: a parallelogram with two adjacent sides equal is a rhombus"] },
        { q: "Find the exact area of $PQRS$.", marks: 4, ms: ["M1: $\\overrightarrow{QS} = \\overrightarrow{PS} - \\overrightarrow{PQ} = -\\mathbf i - 4\\mathbf j + \\mathbf k$, $|QS| = \\sqrt{18} = 3\\sqrt2$", "M1: cosine rule in triangle $PQS$: $18 = 9 + 9 - 18\\cos P \\Rightarrow \\cos P = 0$", "A1: angle $P = 90°$ — the rhombus is a square", "A1: area $= 3 \\times 3 = 9$"] }
      ] }
  ]
});

X("maths:10.4", {
  flashcards: [
    ["Distance between points with position vectors $\\mathbf a = \\mathbf i + 2\\mathbf j - \\mathbf k$ and $\\mathbf b = 3\\mathbf i - \\mathbf j + 4\\mathbf k$?", "$|\\mathbf b - \\mathbf a| = |2\\mathbf i - 3\\mathbf j + 5\\mathbf k| = \\sqrt{38}$."],
    ["$\\overrightarrow{AB} = \\overrightarrow{BD}$ with $\\mathbf a = (1, 2, 3)$, $\\mathbf b = (4, 0, 5)$. Find $\\mathbf d$.", "$\\mathbf d = 2\\mathbf b - \\mathbf a = (7, -2, 7)$."],
    ["$|AC| = 4$ where $\\mathbf a = (1, 2, 3)$, $\\mathbf c = (a, 2, 3 + 2\\sqrt3)$: find $a$.", "$(a - 1)^2 + 12 = 16 \\Rightarrow a = 3$ or $-1$."],
    ["Position vector of the point dividing $AB$ in the ratio $2 : 3$?", "$\\mathbf a + \\tfrac25(\\mathbf b - \\mathbf a) = \\tfrac35\\mathbf a + \\tfrac25\\mathbf b$."],
    ["A running track has vertices $A(0,0)$, $B(60, 0)$, $C(70, 30)$, $D(10, 30)$. Show $AD \\parallel BC$.", "$\\overrightarrow{AD} = 10\\mathbf i + 30\\mathbf j = \\overrightarrow{BC}$ — equal, so parallel."],
    ["Average speed round that track (perimeter $60 + 2\\sqrt{1000} + 60$ m) in 40 s?", "$\\dfrac{120 + 20\\sqrt{10}}{40} \\approx 4.58$ m/s."],
    ["$A, B, C$ collinear with $\\mathbf a = (1, 1)$, $\\mathbf b = (3, 5)$, $\\mathbf c = (p, 13)$. Find $p$.", "$\\overrightarrow{AB} = (2, 4)$, $\\overrightarrow{AC} = (p - 1, 12) = 3(2, 4) \\Rightarrow p = 7$."],
    ["Extend $OB$ to $D$ so that $CD \\parallel OA$… what condition?", "$\\mathbf d = k\\mathbf b$ and $\\mathbf d - \\mathbf c = \\lambda\\mathbf a$; equate components to find $k$."]
  ],
  quiz: [
    { q: "Distance from $(1, 2, 2)$ to the origin:", opts: ["3", "5", "$\\sqrt5$", "9"], ans: 0, why: "$\\sqrt{1 + 4 + 4}$." },
    { q: "The point dividing $AB$ in ratio $1:1$ is:", opts: ["$A$", "the midpoint", "$B$", "outside $AB$"], ans: 1, why: "Halfway." },
    { q: "$\\overrightarrow{AB} = \\overrightarrow{BD}$ means $B$ is:", opts: ["the midpoint of $AD$", "at $A$", "at $D$", "twice as far from $A$ as $D$"], ans: 0, why: "Equal steps." },
    { q: "$|\\overrightarrow{AC}| = 4$ with $\\overrightarrow{AC} = (a - 1, 0, \\sqrt{12})$ gives:", opts: ["$a = 3$ only", "$a = 3$ or $a = -1$", "$a = 5$", "$a = 1$"], ans: 1, why: "$(a-1)^2 = 4$." },
    { q: "Position vectors describe points relative to:", opts: ["each other", "the origin", "the $x$-axis", "any point"], ans: 1, why: "Fixed origin." },
    { q: "The distance between two points is:", opts: ["$|\\mathbf a| - |\\mathbf b|$", "$|\\mathbf b - \\mathbf a|$", "$|\\mathbf a + \\mathbf b|$", "$|\\mathbf a||\\mathbf b|$"], ans: 1, why: "Magnitude of the displacement." }
  ],
  exam: [
    { src: "Edexcel 2018 P1 Q2", ctx: "$A$, $B$ and $C$ have position vectors $\\mathbf a = \\mathbf i + 2\\mathbf j + 3\\mathbf k$, $\\mathbf b = 4\\mathbf i - \\mathbf k$ and $\\mathbf c = a\\mathbf i + 2\\mathbf j + (3 + 2\\sqrt3)\\mathbf k$, where $a$ is a constant.",
      parts: [
        { q: "The point $D$ is such that $\\overrightarrow{AB} = \\overrightarrow{BD}$. Find the position vector of $D$.", marks: 2, ms: ["M1: $\\mathbf d = \\mathbf b + (\\mathbf b - \\mathbf a) = 2\\mathbf b - \\mathbf a$", "A1: $7\\mathbf i - 2\\mathbf j - 5\\mathbf k$"] },
        { q: "Given that $|\\overrightarrow{AC}| = 4$, find the possible values of $a$.", marks: 3, ms: ["M1: $\\overrightarrow{AC} = (a - 1)\\mathbf i + 2\\sqrt3\\,\\mathbf k$", "M1: $(a - 1)^2 + 12 = 16$", "A1: $a = 3$ or $a = -1$"] }
      ] },
    { src: "Edexcel 2023 P2 Q6", ctx: "A running track has vertices $A$, $B$, $C$, $D$ with position vectors $\\mathbf a = \\mathbf 0$, $\\mathbf b = 60\\mathbf i$, $\\mathbf c = 70\\mathbf i + 30\\mathbf j$, $\\mathbf d = 10\\mathbf i + 30\\mathbf j$ (metres).",
      parts: [
        { q: "Show that $AD$ is parallel to $BC$.", marks: 2, ms: ["M1: $\\overrightarrow{AD} = 10\\mathbf i + 30\\mathbf j$, $\\overrightarrow{BC} = 10\\mathbf i + 30\\mathbf j$", "A1: equal vectors, hence parallel (the track is a parallelogram)"] },
        { q: "A runner completes one lap $ABCDA$ in 40 seconds. Find her average speed.", marks: 4, ms: ["M1: $|AB| = 60$, $|BC| = \\sqrt{100 + 900} = 10\\sqrt{10}$", "M1: perimeter $= 120 + 20\\sqrt{10}$", "A1: $= 183.2$ m", "A1: average speed $4.58$ m/s"] }
      ] },
    { src: "Edexcel 2022 P1 Q13", ctx: "$\\mathbf a = 2\\mathbf i + \\mathbf j - \\mathbf k$, $\\mathbf b = 3\\mathbf i + 3\\mathbf j + \\mathbf k$ and $\\mathbf c = 5\\mathbf i + 7\\mathbf j + p\\mathbf k$ are the position vectors of $A$, $B$, $C$, and $A$, $B$, $C$ are collinear.",
      parts: [
        { q: "Find the value of $p$.", marks: 3, ms: ["M1: $\\overrightarrow{AB} = \\mathbf i + 2\\mathbf j + 2\\mathbf k$, $\\overrightarrow{AC} = 3\\mathbf i + 6\\mathbf j + (p + 1)\\mathbf k$", "M1: $\\overrightarrow{AC} = 3\\overrightarrow{AB}$", "A1: $p + 1 = 6 \\Rightarrow p = 5$"] },
        { q: "The point $D$ lies on $OB$ extended so that $CD$ is parallel to $OA$. Find $|\\overrightarrow{OD}|$.", marks: 3, ms: ["M1: $\\mathbf d = k\\mathbf b$ and $\\mathbf d - \\mathbf c = \\lambda\\mathbf a$: $(3k - 5, 3k - 7, k - 5) = \\lambda(2, 1, -1)$", "M1: from the $\\mathbf j$ and $\\mathbf k$ components $3k - 7 = -(k - 5) \\Rightarrow k = 3$ (check $\\mathbf i$: $4 = 2\\lambda$, $\\lambda = 2$ ✓)", "A1: $\\mathbf d = 9\\mathbf i + 9\\mathbf j + 3\\mathbf k$, $|\\overrightarrow{OD}| = \\sqrt{171} = 3\\sqrt{19}$"] }
      ] }
  ]
});

X("maths:10.5", {
  flashcards: [
    ["A stone slides on ice with constant velocity; positions at $t = 0$ and $t = 3$ are $(2, 8)$ and $(8, -1)$. Does it pass through the origin?", "Velocity $(2, -3)$ per second; position $(2 + 2t, 8 - 3t)$ — at $t = -1$ it is at $(0, 11)$, not $O$; check $2 + 2t = 0 \\Rightarrow t = -1$ gives $y = 11 \\ne 0$: no."],
    ["Speed of that stone?", "$|(2, -3)| = \\sqrt{13}$ m/s."],
    ["Forces $\\mathbf F_1 = 3\\mathbf i + 2\\mathbf j$ and $\\mathbf F_2 = -\\mathbf i + 4\\mathbf j$ act on a particle. Resultant and its magnitude?", "$2\\mathbf i + 6\\mathbf j$, $2\\sqrt{10}$ N."],
    ["Trapezium $ABCD$ with $\\overrightarrow{AB} = 6\\mathbf i$, $\\overrightarrow{DC} = 2\\mathbf i$; diagonals meet at $X$. Ratio $BX : XD$?", "Triangles $ABX$ and $CDX$ are similar with ratio $3 : 1$, so $BX : XD = 3 : 1$."],
    ["Position of a particle at time $t$ with initial position $\\mathbf r_0$ and constant velocity $\\mathbf v$?", "$\\mathbf r = \\mathbf r_0 + t\\mathbf v$."],
    ["Two ships: $\\mathbf r_A = (1 + 2t)\\mathbf i + (3 + t)\\mathbf j$, $\\mathbf r_B = (7 - t)\\mathbf i + (t)\\mathbf j$. Do they collide?", "Equal $\\mathbf i$: $t = 2$; then $\\mathbf j$: $5 \\ne 2$ — no collision."],
    ["Area ratio when a point divides a side of a triangle in ratio $1 : 2$?", "The two sub-triangles share a height, so areas are in the ratio $1 : 2$."],
    ["How do you find where a line $\\mathbf r = \\mathbf a + \\lambda\\mathbf d$ meets another $\\mathbf r = \\mathbf b + \\mu\\mathbf e$?", "Equate components to get simultaneous equations in $\\lambda$ and $\\mu$."]
  ],
  quiz: [
    { q: "A particle with position $(1 + 3t)\\mathbf i + (2 - t)\\mathbf j$ has velocity:", opts: ["$3\\mathbf i - \\mathbf j$", "$\\mathbf i + 2\\mathbf j$", "$3\\mathbf i + \\mathbf j$", "$4\\mathbf i + \\mathbf j$"], ans: 0, why: "Coefficient of $t$." },
    { q: "The resultant of $2\\mathbf i + \\mathbf j$ and $-2\\mathbf i + 3\\mathbf j$ is:", opts: ["$4\\mathbf j$", "$4\\mathbf i + 4\\mathbf j$", "$\\mathbf j$", "$4\\mathbf i$"], ans: 0, why: "Add components." },
    { q: "A particle passes through the origin when:", opts: ["its speed is zero", "both components of its position vector are zero at the same $t$", "$t = 0$", "its velocity is zero"], ans: 1, why: "Same $t$ for both." },
    { q: "Diagonals of a trapezium with parallel sides in ratio $3:1$ divide each other in ratio:", opts: ["$1:1$", "$3:1$", "$9:1$", "$2:1$"], ans: 1, why: "Similar triangles." },
    { q: "If $\\overrightarrow{AB} = \\lambda\\overrightarrow{AC}$ with $0 < \\lambda < 1$, $B$ lies:", opts: ["beyond $C$", "between $A$ and $C$", "before $A$", "off the line"], ans: 1, why: "Fraction of the way." },
    { q: "A constant-velocity model assumes:", opts: ["zero acceleration", "constant speed only", "circular motion", "friction"], ans: 0, why: "Velocity fixed." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS Nov 2021 P1 Q4", ctx: "A stone slides across ice with constant velocity. At time $t = 0$ its position vector is $(3\\mathbf i - 4\\mathbf j)$ m and at $t = 4$ s it is $(-5\\mathbf i + 2\\mathbf j)$ m.",
      parts: [
        { q: "Find the velocity of the stone.", marks: 2, ms: ["M1: $\\dfrac{(-5 - 3)\\mathbf i + (2 + 4)\\mathbf j}{4}$", "A1: $(-2\\mathbf i + 1.5\\mathbf j)$ m/s"] },
        { q: "Prove that the stone does not pass through the origin.", marks: 3, ms: ["M1: position $\\mathbf r = (3 - 2t)\\mathbf i + (-4 + 1.5t)\\mathbf j$", "M1: $3 - 2t = 0 \\Rightarrow t = 1.5$; then $\\mathbf j$-component $= -1.75$", "A1: not zero at the same time, so the stone never passes through $O$"] },
        { q: "Find the speed of the stone.", marks: 1, ms: ["B1: $\\sqrt{4 + 2.25} = 2.5$ m/s"] }
      ] },
    { src: "Edexcel 2025 P1 Q14", ctx: "$ABCD$ is a trapezium with $\\overrightarrow{AB} = 6\\mathbf i + 3\\mathbf j$, $\\overrightarrow{AD} = \\mathbf i + 5\\mathbf j$ and $\\overrightarrow{DC} = k(2\\mathbf i + \\mathbf j)$, where $k$ is a constant. The diagonals $AC$ and $BD$ meet at $X$. Given that $|\\overrightarrow{DC}| = \\tfrac13|\\overrightarrow{AB}|$,",
      parts: [
        { q: "Show that $k = 1$.", marks: 2, ms: ["M1: $|\\overrightarrow{AB}| = \\sqrt{45} = 3\\sqrt5$, $|\\overrightarrow{DC}| = k\\sqrt5$", "A1: $k\\sqrt5 = \\sqrt5 \\Rightarrow k = 1$"] },
        { q: "Find the ratio $BX : XD$.", marks: 4, ms: ["M1: $\\overrightarrow{AX} = \\lambda\\overrightarrow{AC} = \\lambda(3\\mathbf i + 6\\mathbf j)$ and $\\overrightarrow{AX} = \\overrightarrow{AB} + \\mu\\overrightarrow{BD} = 6\\mathbf i + 3\\mathbf j + \\mu(-5\\mathbf i + 2\\mathbf j)$", "M1: equates: $3\\lambda = 6 - 5\\mu$, $6\\lambda = 3 + 2\\mu$", "A1: $\\mu = \\tfrac34$", "A1: $BX : XD = 3 : 1$"] }
      ] }
  ]
});

})(KOS.content.extend);
