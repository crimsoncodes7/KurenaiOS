/* Kurenai OS — deep content: Pure Mathematics, section P3 (Coordinate
   geometry in the (x, y) plane) at full A-level depth. Same contract as
   maths-pure-p4.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* =====================================================================
   3.1  Straight lines
   ===================================================================== */
C["maths:3.1"] = {
  notes: [
    { h: "Straight lines — the whole topic on one page" },
    "Gradient, one point, one equation. Everything on this page is a rearrangement of $y - y_1 = m(x - x_1)$, plus the two gradient facts for parallel and perpendicular lines. The examiners' favourite use is the **linear model**: two data points, an equation, an interpretation, and a verdict on whether the model holds.",
    { ul: [
      "**Equation from two points**: gradient $m = \\frac{y_2 - y_1}{x_2 - x_1}$, then $y - y_1 = m(x - x_1)$; rearrange to $y = mx + c$ or $ax + by + c = 0$ as asked.",
      "**Parallel**: same gradient. **Perpendicular**: $m_1 m_2 = -1$, i.e. $m_2 = -\\frac{1}{m_1}$.",
      "**Intersections** by simultaneous equations; **lengths** by Pythagoras; **areas** of triangles from a base on an axis and the height.",
      "**Tangents and normals to circles** (3.2) are straight-line questions in disguise.",
      "**Models**: cost, fuel, tree height, CO$_2$ — build from two points, interpret $m$ and $c$, test against a third fact."
    ] },

    { page: "Equations, gradients, intersections" },
    { callout: { t: "memorise", h: "The three forms", body: [
      "$$y - y_1 = m(x - x_1) \\qquad y = mx + c \\qquad ax + by + c = 0$$",
      "Gradient of $ax + by + c = 0$ is $-\\frac{a}{b}$ (rearrange to check). $4y - 3x = 10$ has gradient $\\frac34$.",
      "\"In the form $ax + by + c = 0$ where $a$, $b$, $c$ are integers\": multiply out fractions and move everything to one side."
    ] } },
    { callout: { t: "tip", h: "Why $m_1 m_2 = -1$ for perpendicular lines", body: "Rotate a gradient triangle (across $a$, up $b$, gradient $\\frac{b}{a}$) by $90°$: it becomes across $-b$, up $a$, gradient $-\\frac{a}{b}$. The product is $\\frac{b}{a} \\times \\left(-\\frac{a}{b}\\right) = -1$. So the perpendicular gradient is the **negative reciprocal**: flip it and change the sign." } },
    { worked: { tag: "exam", title: "Parallel, perpendicular or neither — with full reasons", src: "AS June 2018 · P1 Q4 · 4 marks",
      q: "The line $l_1$ has equation $4y - 3x = 10$. The line $l_2$ passes through $(5, -1)$ and $(-1, 8)$. Determine, giving full reasons, whether $l_1$ and $l_2$ are parallel, perpendicular or neither.",
      steps: [
        { h: "Gradient of $l_1$", m: "$4y = 3x + 10 \\Rightarrow y = \\dfrac34 x + \\dfrac52$, so $m_1 = \\dfrac34$", mk: "B1" },
        { h: "Gradient of $l_2$", m: "$m_2 = \\dfrac{8 - (-1)}{-1 - 5} = \\dfrac{9}{-6} = -\\dfrac32$", mk: "M1 A1" },
        { h: "Compare", m: "$m_1 \\neq m_2$ so not parallel; $m_1 m_2 = \\dfrac34 \\times \\left(-\\dfrac32\\right) = -\\dfrac98 \\neq -1$ so not perpendicular. **Neither.**", mk: "A1", n: "\"Full reasons\" = both tests written with their numbers. \"They look different\" is not a reason." }
      ], result: "neither" } },
    { worked: { tag: "exam", title: "Perpendicular gradient, then the intersection", src: "AS June 2019 · P1 Q1 · 4 marks",
      q: "$l_1$: $2x + 4y - 3 = 0$. $l_2$: $y = mx + 7$. Given $l_1$ and $l_2$ are perpendicular, **(a)** find $m$. **(b)** The lines meet at $P$; find the $x$-coordinate of $P$.",
      steps: [
        { h: "(a)", m: "$l_1$: $y = -\\dfrac12 x + \\dfrac34$, gradient $-\\dfrac12$; perpendicular: $m = 2$", mk: "M1 A1" },
        { h: "(b) Substitute $y = 2x + 7$ into $l_1$", m: "$2x + 4(2x + 7) - 3 = 0 \\Rightarrow 10x + 25 = 0 \\Rightarrow x = -\\dfrac52$", mk: "M1 A1" }
      ], result: "(a) $m = 2$ (b) $x = -\\frac52$" } },
    { worked: { tag: "exam", title: "Perpendicular through a point; exact area of a triangle", src: "AS June 2023 · P1 Q10 · 8 marks",
      q: "$l_1$: $y = \\frac35 x + 6$. $l_2$ is perpendicular to $l_1$ and passes through $B(8, 0)$. **(a)** Show that $l_2$ has equation $5x + 3y = 40$. The lines meet at $C$ and $l_1$ crosses the $x$-axis at $A$. **(b)** Find the exact area of triangle $ABC$ as a fully simplified fraction.",
      steps: [
        { h: "(a)", m: "Perpendicular gradient $-\\dfrac53$; through $(8, 0)$: $y = -\\dfrac53(x - 8) \\Rightarrow 3y = -5x + 40 \\Rightarrow 5x + 3y = 40$", mk: "B1 M1 A1*" },
        { h: "(b) $A$: where $l_1$ meets the axis", m: "$\\dfrac35 x + 6 = 0 \\Rightarrow x = -10$, so $A(-10, 0)$ and the base $AB = 18$", mk: "B1" },
        { h: "$C$: solve the lines", m: "$5x + 3\\left(\\dfrac35 x + 6\\right) = 40 \\Rightarrow \\dfrac{34}{5}x = 22 \\Rightarrow x = \\dfrac{55}{17}, \\quad y = \\dfrac35 \\cdot \\dfrac{55}{17} + 6 = \\dfrac{135}{17}$", mk: "M1 A1", n: "Only the $y$-coordinate of $C$ is needed — it is the height of the triangle above the base on the $x$-axis." },
        { m: "Area $= \\dfrac12 \\times 18 \\times \\dfrac{135}{17} = \\dfrac{1215}{17}$", mk: "M1 A1", fig: { x: [-12, 12], y: [-2, 10], axes: { xt: [-10, 8], yt: [6] }, items: [ { poly: [[-10, 0], [8, 0], [55 / 17, 135 / 17]], fill: "accent", alpha: 0.12 }, { fn: "0.6*x+6", c: "accent", label: "l₁", at: 5, pos: "s" }, { fn: "(40-5*x)/3", c: "accent3", label: "l₂", at: 9.6, pos: "e" }, { pt: [-10, 0], label: "A", pos: "sw" }, { pt: [8, 0], label: "B", pos: "se" }, { pt: [55 / 17, 135 / 17], label: "C", pos: "n" }, { rangle: [[55 / 17, 135 / 17], [-10, 0], [8, 0]] } ], cap: "Base $AB$ on the $x$-axis, height = $y_C$. The right angle at $C$ is the perpendicularity of the two lines." }, n: "Exact: keep $\\frac{135}{17}$; a decimal here loses the last mark." }
      ], result: "(b) $\\dfrac{1215}{17}$" } },

    { page: "Linear models" },
    { callout: { t: "memorise", h: "Building and judging a linear model", body: [
      "1. Two data points → gradient → equation (in the variables the question names, e.g. $H$ and $t$).",
      "2. **Interpret**: the gradient is the *rate* (units of $y$ per unit of $x$); the intercept is the value at $x = 0$ (initial value / fixed cost).",
      "3. **Use**: substitute to predict; solve for the input that gives a target output.",
      "4. **Judge**: compare a prediction with a third given fact. Close → \"supports the model\"; far → \"the model is not suitable / the rate is not constant\". Say **which way** it is out.",
      "5. **Limitation**: a linear model assumes a constant rate for ever — leaks slow down, trees stop growing, emissions fall faster than predicted."
    ] } },
    { worked: { tag: "exam", title: "Tank leaking — initial volume, time to empty, limitation", src: "AS Specimen · P1 Q3 · 8 marks",
      q: "A tank leaks. After 24 minutes it holds $4$ m$^3$; after 60 minutes, $2.8$ m$^3$. The volume $V$ m$^3$ after $t$ minutes is modelled linearly. **(a)** Find an equation linking $V$ with $t$. **(b)(i)** Find the initial volume. **(ii)** Find the time taken to empty. **(c)** Suggest a reason why the linear model may not be suitable.",
      steps: [
        { h: "(a)", m: "$m = \\dfrac{2.8 - 4}{60 - 24} = -\\dfrac{1.2}{36} = -\\dfrac{1}{30}$\n$V - 4 = -\\dfrac{1}{30}(t - 24) \\Rightarrow V = -\\dfrac{1}{30}t + 4.8$", mk: "M1 A1 M1 A1", n: "Points are $(t, V)$: time is the independent variable." },
        { h: "(b)(i) $t = 0$", m: "$V = 4.8$ m$^3$", mk: "B1" },
        { h: "(ii) $V = 0$", m: "$\\dfrac{t}{30} = 4.8 \\Rightarrow t = 144$ minutes", mk: "M1 A1" },
        { h: "(c)", m: "The rate of leaking is unlikely to stay constant — as the water level (pressure) falls, the leak slows.", mk: "B1", n: "A reason about the *physics*, in context." }
      ], result: "(a) $V = 4.8 - \\frac{t}{30}$ (b) $4.8$ m$^3$; 144 min" } },
    { worked: { tag: "exam", title: "CO$_2$ emissions — a model that fails a later data point", src: "AS June 2020 · P1 Q4 · 6 marks",
      q: "In 1997 the average CO$_2$ emission of new cars was 190 g/km; in 2005 it was 169 g/km. $A$ g/km is the average emission $n$ years after 1997. **(a)** Using a linear model, form an equation linking $A$ with $n$. In 2016 the average was 120 g/km. **(b)** Comment on the suitability of your model in light of this information.",
      steps: [
        { h: "(a)", m: "$m = \\dfrac{169 - 190}{8} = -\\dfrac{21}{8} = -2.625$; through $(0, 190)$: $A = 190 - 2.625n$", mk: "M1 A1 A1" },
        { h: "(b) Predict 2016 ($n = 19$) and compare", m: "$A = 190 - 2.625 \\times 19 = 140.1$ g/km. The actual value, 120, is much lower — emissions fell **faster** than the model predicts, so the linear model is not suitable for extrapolating to 2016 (the rate of decrease was not constant).", mk: "M1 A1 A1", n: "Three parts to the comment: the model's number, the comparison, the verdict with a reason." }
      ], result: "(a) $A = 190 - 2.625n$ (b) predicts 140.1 vs 120 — not suitable" } },
    { worked: { tag: "exam", title: "Fuel remaining vs distance", src: "AS June 2023 · P1 Q7 · 8 marks",
      q: "From a full tank, 40 litres remained after 80 km and 25 litres after 200 km. Using a linear model, $V$ litres remaining after $d$ km: **(a)** find an equation linking $V$ and $d$. **(b)(i)** Find the initial volume of fuel. **(ii)** Find the distance travelled when the car runs out of fuel. In fact the car travelled 320 km. **(c)** Evaluate the model in light of this.",
      steps: [
        { h: "(a)", m: "$m = \\dfrac{25 - 40}{200 - 80} = -\\dfrac{15}{120} = -\\dfrac18$; $\; V - 40 = -\\dfrac18(d - 80) \\Rightarrow V = 50 - \\dfrac{d}{8}$", mk: "M1 A1 M1 A1" },
        { h: "(b)", m: "(i) $V(0) = 50$ litres. (ii) $V = 0 \\Rightarrow d = 400$ km.", mk: "B1 M1 A1" },
        { h: "(c)", m: "The model predicts 400 km but the car managed only 320 km, so the model **over-estimates** the range — fuel consumption was not constant (e.g. more fuel per km later in the journey), so the model is not reliable beyond the data.", mk: "B1" }
      ], result: "(a) $V = 50 - \\frac{d}{8}$ (b) 50 L; 400 km (c) over-estimates (320 actual)" } },
    { worked: { tag: "exam", title: "A linear demand model feeding a quadratic profit", src: "A-level June 2025 · P2 Q11 · 11 marks",
      q: "At £30 a toy sells 1500 a year; at £50, 300 a year. With a linear model, $y$ toys sold at price £$x$: **(a)** find $y$ in terms of $x$. Each toy costs £10 to make and there are £8000 fixed costs. **(b)** Show that the yearly profit, $P$ thousand pounds, is $P = -0.06x^2 + 3.9x - 41$. **(c)** Find the range of selling prices for which the company makes a profit. **(d)** Deduce the price that maximises the profit and **(e)** the maximum profit.",
      steps: [
        { h: "(a)", m: "$m = \\dfrac{300 - 1500}{50 - 30} = -60$; $\; y = 1500 - 60(x - 30) = 3300 - 60x$", mk: "M1 A1 A1" },
        { h: "(b) Profit = (price − cost) × number − fixed costs", m: "$P_{£} = (x - 10)(3300 - 60x) - 8000 = -60x^2 + 3900x - 41\\,000$\nIn thousands: $P = -0.06x^2 + 3.9x - 41$", mk: "M1 A1 A1*" },
        { h: "(c) $P > 0$", m: "$0.06x^2 - 3.9x + 41 < 0$; roots $x = \\dfrac{3.9 \\pm \\sqrt{15.21 - 9.84}}{0.12} = 13.19\\ldots, \; 51.80\\ldots$\nProfit for $13.19 < x < 51.80$ (prices between about £13.20 and £51.80)", mk: "M1 A1" },
        { h: "(d) Vertex", m: "$x = \\dfrac{3.9}{0.12} = 32.5$ → £32.50 (or the midpoint of the roots)", mk: "B1" },
        { h: "(e)", m: "$P = -0.06(32.5)^2 + 3.9(32.5) - 41 = 22.375$ → £22 375", mk: "M1 A1" }
      ], result: "(a) $y = 3300 - 60x$ (c) £13.20–£51.80 (d) £32.50 (e) £22 375" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Find the equation of the line … in the form $y = mx + c$** / **$ax + by + c = 0$ with integers**", "exactly that form, simplified"],
      ["**Determine, giving full reasons, whether … parallel, perpendicular or neither**", "both gradients, the equality test and the product test, and the word"],
      ["**Show that** the equation is …", "the gradient found (perpendicular rule shown), the point substituted, the rearrangement to the printed form"],
      ["**Find the exact area**", "base and height as exact fractions; $\\frac12 bh$"],
      ["**Interpret the value of … in the model**", "rate or initial value, with units and context"],
      ["**Comment on / evaluate the model in light of …**", "predict, compare, verdict with direction and reason"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Gradient upside down** ($\\frac{\\Delta x}{\\Delta y}$) or with the points in inconsistent order.",
      "**Perpendicular gradient without the sign change** ($\\frac53$ instead of $-\\frac53$).",
      "**Wrong variable order in a model**: the independent variable ($t$, $d$, $n$) is $x$.",
      "**Predicting but not comparing** in a suitability question.",
      "**Decimal where exact was asked.**",
      "**Area with the wrong height** — the height is the $y$-coordinate of the apex when the base lies on the $x$-axis."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Two-point line", "**Statistics → 2-variable** ($y = a + bx$): enter the two points, read $a$ and $b$ from the regression — an instant check of your gradient and intercept."],
      ["Intersection", "**Equation → Simultaneous → 2 unknowns** with both lines in $ax + by = c$ form."]
    ] },
    { callout: { t: "mnemonic", h: "\"Flip and flop\" for perpendicular", body: "Flip the fraction, flop the sign: $\\frac35 \\to -\\frac53$." } }
  ],
  flashcards: [
    ["Gradient of $4y - 3x = 10$?", "$\\frac34$."],
    ["Gradient perpendicular to $\\frac35$?", "$-\\frac53$ (negative reciprocal)."],
    ["Line through $(5, -1)$ and $(-1, 8)$: gradient?", "$\\frac{9}{-6} = -\\frac32$."],
    ["Perpendicular to $y = \\frac35 x + 6$ through $(8, 0)$?", "$5x + 3y = 40$."],
    ["Linear model from $(24, 4)$ and $(60, 2.8)$?", "$V = 4.8 - \\frac{t}{30}$; empties at $t = 144$."],
    ["How do you judge a linear model against a third data point?", "Predict with the model, compare with the actual value, state the direction of the error and a reason."],
    ["Meaning of the gradient in $V = 50 - \\frac{d}{8}$?", "Fuel used per km: $\\frac18$ litre per km."],
    ["Area of a triangle with base on the $x$-axis from $A(-10, 0)$ to $B(8, 0)$ and apex $y = \\frac{135}{17}$?", "$\\frac12 \\times 18 \\times \\frac{135}{17} = \\frac{1215}{17}$."],
    ["Why is $m_1 m_2 = -1$ for perpendicular lines?", "Rotating the gradient triangle by $90°$ turns $\\frac{b}{a}$ into $-\\frac{a}{b}$."]
  ],
  quiz: [
    { q: "Gradient of the line through $(2, 3)$ and $(6, 11)$:", opts: ["2", "$\\tfrac12$", "4", "8"], ans: 0, why: "$\\frac{8}{4}$." },
    { q: "A line perpendicular to $y = 2x + 1$ has gradient", opts: ["$-2$", "$\\tfrac12$", "$-\\tfrac12$", "2"], ans: 2, why: "Negative reciprocal." },
    { q: "$3x - 2y + 6 = 0$ in the form $y = mx + c$:", opts: ["$y = \\tfrac32 x + 3$", "$y = -\\tfrac32 x + 3$", "$y = \\tfrac23 x + 2$", "$y = 3x + 6$"], ans: 0, why: "$2y = 3x + 6$." },
    { q: "Lines with gradients $\\frac34$ and $-\\frac32$ are", opts: ["parallel", "perpendicular", "neither", "the same line"], ans: 2, why: "Product $-\\frac98$." },
    { q: "In $A = 190 - 2.625n$, the $-2.625$ is", opts: ["the emission in 1997", "the yearly fall in g/km", "the year", "the total fall"], ans: 1, why: "Rate per year." },
    { q: "Intersection of $y = 2x + 7$ and $2x + 4y - 3 = 0$ has $x =$", opts: ["$-2.5$", "$2.5$", "$-7$", "$0$"], ans: 0, why: "$10x + 25 = 0$." }
  ]
};

/* =====================================================================
   3.2  Circles
   ===================================================================== */
C["maths:3.2"] = {
  notes: [
    { h: "Circles — the whole topic on one page" },
    "Eighteen questions in eight years — a circle question is on **every** AS and A-level Paper 1. One equation, three geometric facts, and a discriminant.",
    { ul: [
      "**Equation** $(x - a)^2 + (y - b)^2 = r^2$; the expanded form $x^2 + y^2 + 2fx + 2gy + c = 0$ is turned back into it by completing the square — centre and radius fall out.",
      "**Tangent ⊥ radius**: the tangent at $P$ has gradient $-\\frac{1}{m_{\\text{radius}}}$. Every \"find the tangent\" and \"find the circle from a tangent\" question.",
      "**Perpendicular from centre bisects a chord** and **angle in a semicircle is $90°$**: the two facts behind chord-length and circumcircle questions.",
      "**Line meets circle**: substitute, collect a quadratic, discriminant $> 0$, $= 0$, $< 0$ for two points, tangent, none.",
      "**Position questions**: is a point inside (distance from centre $< r$)? does the circle cross an axis (compare $r$ with the centre's coordinate)? two circles intersect (compare $d$ with $r_1 \\pm r_2$)?"
    ] },
    { fig: { x: [-2, 12], y: [-2, 12], aspect: "equal", axes: { xt: [3, 7], yt: [5, 7] }, items: [
      { circle: [7, 5, Math.sqrt(20)], c: "accent" }, { pt: [7, 5], label: "A(7, 5)", pos: "se" },
      { line: [[7, 5], [3, 7]], c: "accent2", label: "r", loff: -9 }, { pt: [3, 7], label: "P(3, 7)", pos: "nw" },
      { fn: "2*x+1", c: "accent3", label: "y = 2x + 1", at: 4.3, pos: "e" }, { rangle: [[3, 7], [7, 5], [1, 3]] }
    ], cap: "A-level 2018 P1 Q6: the tangent $y = 2x + 1$ touches at $P$; the radius $AP$ is perpendicular to it, which is how $P$ is found." } },

    { page: "Centre, radius and position" },
    { callout: { t: "memorise", h: "From the expanded form to centre and radius", body: [
      "$$x^2 + y^2 - 10x + 4y + 11 = 0 \;\\Rightarrow\; (x - 5)^2 - 25 + (y + 2)^2 - 4 + 11 = 0 \;\\Rightarrow\; (x - 5)^2 + (y + 2)^2 = 18$$",
      "Centre $(5, -2)$, radius $\\sqrt{18} = 3\\sqrt2$. Halve each linear coefficient with the sign flipped for the centre; the radius squared is the constant you get after moving the two squared numbers across.",
      "In general $x^2 + y^2 + 2fx + 2gy + c = 0$ has centre $(-f, -g)$ and $r^2 = f^2 + g^2 - c$."
    ] } },
    { worked: { tag: "exam", title: "Centre, exact radius, and the point furthest from the origin", src: "A-level June 2022 · P1 Q3 · 5 marks",
      q: "A circle has equation $x^2 + y^2 - 10x + 16y = 80$. **(a)** Find (i) the centre, (ii) the radius. **(b)** $P$ is the point on the circle furthest from the origin $O$. Find the exact length $OP$.",
      steps: [
        { h: "(a)", m: "$(x - 5)^2 + (y + 8)^2 = 80 + 25 + 64 = 169$: centre $(5, -8)$, radius $13$", mk: "M1 A1 A1" },
        { h: "(b) The furthest point lies on the line through $O$ and the centre, beyond the centre", m: "$OP = |OC| + r = \\sqrt{5^2 + 8^2} + 13 = \\sqrt{89} + 13$", mk: "M1 A1", fig: { x: [-8, 22], y: [-24, 8], aspect: "equal", axes: { grid: false, xt: [5], yt: [-8] }, items: [ { circle: [5, -8, 13] }, { pt: [5, -8], label: "C", pos: "e" }, { line: [[0, 0], [5 + 13 * 5 / Math.sqrt(89), -8 - 13 * 8 / Math.sqrt(89)]], c: "accent2", dash: true }, { pt: [5 + 13 * 5 / Math.sqrt(89), -8 - 13 * 8 / Math.sqrt(89)], label: "P", pos: "se" }, { pt: [0, 0], label: "O", pos: "nw" } ], cap: "Furthest point: continue $OC$ by one radius. (Nearest would be $|OC| - r$.)" }, n: "Do not attempt to find $P$'s coordinates — the question asks for the length." }
      ], result: "(a) $(5, -8)$, $r = 13$ (b) $13 + \\sqrt{89}$" } },
    { worked: { tag: "exam", title: "Is the origin inside the circle?", src: "A-level June 2025 · P1 Q2 · 5 marks",
      q: "$C$: $(x + 3)^2 + (y - 4)^2 = 24$. **(a)(i)** State the centre. **(ii)** Find the radius as a fully simplified surd. **(b)** Determine, giving a reason, whether or not the origin lies inside $C$.",
      steps: [
        { h: "(a)", m: "Centre $(-3, 4)$; $r = \\sqrt{24} = 2\\sqrt6$", mk: "B1 B1 B1" },
        { h: "(b) Compare the distance from the centre to $O$ with $r$", m: "$|CO| = \\sqrt{9 + 16} = 5$ and $5 > 2\\sqrt6 \\approx 4.90$, so the origin is **outside** the circle.", mk: "M1 A1", n: "Or substitute $(0, 0)$: $9 + 16 = 25 > 24$ — the left side exceeds $r^2$, so outside. Either way, the comparison must be written." }
      ], result: "$(-3, 4)$, $2\\sqrt6$; origin outside" } },
    { worked: { tag: "exam", title: "Circle that must not cut the $x$-axis — range of $k$", src: "AS June 2023 · P1 Q6 · 5 marks",
      q: "$C$: $x^2 + y^2 - 6x + 10y + k = 0$. **(a)** Find the centre. **(b)** Given that $C$ does not cut or touch the $x$-axis, find the range of possible values of $k$.",
      steps: [
        { h: "(a)", m: "$(x - 3)^2 + (y + 5)^2 = 34 - k$: centre $(3, -5)$", mk: "M1 A1" },
        { h: "(b) The centre is 5 below the axis, so the radius must be less than 5 — and positive", m: "$0 < 34 - k < 25 \;\\Rightarrow\; 9 < k < 34$", mk: "M1 A1 A1", n: "Two conditions: $r < 5$ gives $k > 9$; $r^2 > 0$ (it must be a real circle) gives $k < 34$. The second is the one people forget." }
      ], result: "(a) $(3, -5)$ (b) $9 < k < 34$" } },
    { worked: { tag: "exam", title: "Circle entirely in the fourth quadrant", src: "AS June 2020 · P1 Q11(ii) · 4 marks",
      q: "$C_2$: $x^2 + y^2 - 8x + 12y + k = 0$. Given that $C_2$ lies entirely in the fourth quadrant, find the range of possible values for $k$.",
      steps: [
        { m: "$(x - 4)^2 + (y + 6)^2 = 52 - k$: centre $(4, -6)$, $r = \\sqrt{52 - k}$", mk: "M1 A1" },
        { m: "Must not reach the $y$-axis (4 away) or the $x$-axis (6 away): $r < 4$, so $52 - k < 16 \\Rightarrow k > 36$; and $r > 0$: $k < 52$.\n$36 < k < 52$", mk: "M1 A1", n: "The nearer axis sets the bound." }
      ], result: "$36 < k < 52$" } },
    { worked: { tag: "exam", title: "Two circles meeting at two points — range of a radius", src: "A-level June 2024 · P2 Q14 · 8 marks",
      q: "$C_1$: $x^2 + y^2 - 6x + 14y + 33 = 0$. **(a)** Find the centre and radius of $C_1$. $C_2$ has centre $(-6, -8)$ and radius $k$. Given $C_1$ and $C_2$ intersect at two distinct points, **(b)** find the range of values of $k$, in set notation.",
      steps: [
        { h: "(a)", m: "$(x - 3)^2 + (y + 7)^2 = 25$: centre $(3, -7)$, radius $5$", mk: "M1 A1 A1" },
        { h: "(b) Distance between centres", m: "$d = \\sqrt{(3 + 6)^2 + (-7 + 8)^2} = \\sqrt{82}$", mk: "M1" },
        { h: "Two intersections ⇔ $|k - 5| < d < k + 5$", m: "$k + 5 > \\sqrt{82} \\Rightarrow k > \\sqrt{82} - 5$; $\\quad k - 5 < \\sqrt{82} \\Rightarrow k < \\sqrt{82} + 5$\n$\\{k : \\sqrt{82} - 5 < k < \\sqrt{82} + 5\\}$", mk: "M1 A1 A1", n: "Too small and $C_2$ misses $C_1$ (sum of radii $< d$); too large and $C_2$ swallows it (difference of radii $> d$). The two boundary cases are external and internal tangency." }
      ], result: "(a) $(3, -7)$, 5 (b) $\\{k : \\sqrt{82} - 5 < k < \\sqrt{82} + 5\\}$" } },

    { page: "Tangents and chords" },
    { callout: { t: "memorise", h: "Three geometric facts and what each is for", body: [
      "**Tangent ⊥ radius.** Tangent at $P$: gradient $= -\\frac{1}{m_{CP}}$, through $P$. Or backwards: given the tangent, the radius through $P$ is perpendicular to it — this finds the centre or the point of contact.",
      "**Perpendicular from the centre bisects a chord.** Half-chord, distance from centre, radius form a right-angled triangle: $\\left(\\frac{\\text{chord}}{2}\\right)^2 + d^2 = r^2$.",
      "**Angle in a semicircle is $90°$.** If $PQ$ is a diameter, any $R$ on the circle has $\\angle PRQ = 90°$. Also: the midpoint of a diameter is the centre — the standard way to build a circle from two given endpoints."
    ] } },
    { worked: { tag: "exam", title: "Circle from a tangent line and its centre; the parallel tangent", src: "A-level June 2018 · P1 Q6 · 10 marks",
      q: "$C$ has centre $A(7, 5)$. The line $l$: $y = 2x + 1$ is the tangent to $C$ at $P$. **(a)** Show that an equation of $PA$ is $2y + x = 17$. **(b)** Find an equation for $C$. **(c)** The line $y = 2x + k$, $k \\neq 1$, is also a tangent to $C$. Find $k$.",
      steps: [
        { h: "(a) $PA$ is the radius, perpendicular to $l$", m: "Gradient of $PA$ is $-\\dfrac12$; through $(7, 5)$: $y - 5 = -\\dfrac12(x - 7) \\Rightarrow 2y - 10 = -x + 7 \\Rightarrow 2y + x = 17$", mk: "M1 M1 A1*" },
        { h: "(b) $P$ is where $PA$ meets $l$; then $r = |AP|$", m: "$2(2x + 1) + x = 17 \\Rightarrow x = 3, \; y = 7$: $P(3, 7)$\n$r^2 = (7 - 3)^2 + (5 - 7)^2 = 20$; $\; (x - 7)^2 + (y - 5)^2 = 20$", mk: "M1 A1 M1 A1" },
        { h: "(c) The other tangent parallel to $l$ touches at the point diametrically opposite $P$", m: "$P' = 2A - P = (11, 3)$; on $y = 2x + k$: $3 = 22 + k \\Rightarrow k = -19$", mk: "M1 M1 A1", n: "Alternative: substitute $y = 2x + k$ into the circle and set the discriminant to zero — longer. The reflection through the centre is the fast route." }
      ], result: "(b) $(x - 7)^2 + (y - 5)^2 = 20$ (c) $k = -19$" } },
    { worked: { tag: "exam", title: "Tangent at a given point in $ax + by + c = 0$ form", src: "AS June 2020 · P1 Q11(i) · 5 marks",
      q: "$C_1$: $x^2 + y^2 + 18x - 2y + 30 = 0$. The line $l$ is the tangent to $C_1$ at $P(-5, 7)$. Find an equation of $l$ in the form $ax + by + c = 0$ with integers $a$, $b$, $c$.",
      steps: [
        { h: "Centre", m: "$(x + 9)^2 + (y - 1)^2 = 52$: centre $(-9, 1)$", mk: "M1 A1" },
        { h: "Radius gradient, then perpendicular", m: "$m_{CP} = \\dfrac{7 - 1}{-5 + 9} = \\dfrac32$, so the tangent has gradient $-\\dfrac23$", mk: "M1" },
        { m: "$y - 7 = -\\dfrac23(x + 5) \\Rightarrow 3y - 21 = -2x - 10 \\Rightarrow 2x + 3y - 11 = 0$", mk: "M1 A1", n: "Clear the fraction, gather on one side, integer coefficients." }
      ], result: "$2x + 3y - 11 = 0$" } },
    { worked: { tag: "exam", title: "Tangent line with unknown intercept — discriminant route", src: "A-level Oct 2021 · P1 Q7 · 9 marks",
      q: "$C$: $x^2 + y^2 - 10x + 4y + 11 = 0$. **(a)** Find (i) the centre, (ii) the exact radius as a simplified surd. **(b)** The line $y = 3x + k$ is a tangent to $C$. Find the possible values of $k$ as simplified surds.",
      steps: [
        { h: "(a)", m: "$(x - 5)^2 + (y + 2)^2 = 18$: centre $(5, -2)$, $r = 3\\sqrt2$", mk: "M1 A1 A1 A1" },
        { h: "(b) Substitute the line into the circle", m: "$x^2 + (3x + k)^2 - 10x + 4(3x + k) + 11 = 0 \;\\Rightarrow\; 10x^2 + (6k + 2)x + (k^2 + 4k + 11) = 0$", mk: "M1 A1" },
        { h: "Tangent ⇒ discriminant zero", m: "$(6k + 2)^2 - 40(k^2 + 4k + 11) = 0 \\Rightarrow -4k^2 - 136k - 436 = 0 \\Rightarrow k^2 + 34k + 109 = 0$", mk: "M1" },
        { m: "$k = \\dfrac{-34 \\pm \\sqrt{1156 - 436}}{2} = -17 \\pm \\sqrt{180} = -17 \\pm 6\\sqrt5$", mk: "A1 A1", n: "Alternative: the perpendicular distance from the centre to the line equals $r$: $\\frac{|3(5) - (-2) + k|}{\\sqrt{10}} = 3\\sqrt2 \\Rightarrow |17 + k| = 6\\sqrt5$. Same answer, half the algebra — but only if you know the distance formula reliably." }
      ], result: "(a) $(5, -2)$, $3\\sqrt2$ (b) $k = -17 \\pm 6\\sqrt5$" } },
    { worked: { tag: "exam", title: "Circle from a centre and a tangent through the origin; the second parallel tangent", src: "AS Nov 2021 · P1 Q15 · 9 marks",
      q: "$C$ has centre $N(7, 4)$ and the line $l$: $y = \\frac13 x$ is a tangent to $C$ at $P$. **(a)** Find the equation of $PN$ in the form $y = mx + c$. **(b)** Find an equation for $C$. **(c)** The line $y = \\frac13 x + k$, $k \\neq 0$, is also a tangent to $C$. Find $k$.",
      steps: [
        { h: "(a)", m: "Perpendicular to $l$: gradient $-3$; $y - 4 = -3(x - 7) \\Rightarrow y = -3x + 25$", mk: "M1 A1" },
        { h: "(b) $P$ = intersection of $PN$ and $l$", m: "$\\dfrac13 x = -3x + 25 \\Rightarrow x = 7.5, \; y = 2.5$; $\; r^2 = 0.5^2 + 1.5^2 = 2.5$\n$(x - 7)^2 + (y - 4)^2 = 2.5$", mk: "M1 A1 M1 A1" },
        { h: "(c) Reflect $P$ through $N$", m: "$P' = (6.5, 5.5)$; $5.5 = \\dfrac13(6.5) + k \\Rightarrow k = \\dfrac{10}{3}$", mk: "M1 M1 A1" }
      ], result: "(a) $y = -3x + 25$ (b) $(x - 7)^2 + (y - 4)^2 = 2.5$ (c) $k = \\frac{10}{3}$" } },
    { worked: { tag: "exam", title: "Centre and point in terms of $k$; tangent gradient fixes $k$", src: "AS June 2024 · P1 Q10 · 8 marks",
      q: "$P(-1, k + 8)$ is the centre of $C$; $Q(3, k^2 - 2k)$ lies on $C$; $k > 0$; the line $l$ is the tangent at $Q$ and has gradient $-2$. **(a)** Show that $k^2 - 3k - 10 = 0$. **(b)** Find an equation for $C$. **(c)** Find an equation for $l$.",
      steps: [
        { h: "(a) $PQ$ is a radius, so its gradient is $\\frac12$", m: "$\\dfrac{(k^2 - 2k) - (k + 8)}{3 - (-1)} = \\dfrac12 \\Rightarrow k^2 - 3k - 8 = 2 \\Rightarrow k^2 - 3k - 10 = 0$", mk: "M1 M1 A1*" },
        { h: "(b)", m: "$(k - 5)(k + 2) = 0$, $k > 0 \\Rightarrow k = 5$: $P(-1, 13)$, $Q(3, 15)$; $r^2 = 16 + 4 = 20$\n$(x + 1)^2 + (y - 13)^2 = 20$", mk: "M1 A1 A1" },
        { h: "(c)", m: "$y - 15 = -2(x - 3) \\Rightarrow y = -2x + 21$", mk: "M1 A1" }
      ], result: "(b) $(x + 1)^2 + (y - 13)^2 = 20$ (c) $y = -2x + 21$" } },
    { worked: { tag: "exam", title: "Diameter, chord distance, angle at the circumference", src: "A-level Specimen · P2 Q9 · 9 marks",
      q: "A circle with centre $A(3, -1)$ passes through $P(-9, 8)$ and $Q(15, -10)$. **(a)** Show that $PQ$ is a diameter. **(b)** Find an equation for the circle. $R$ also lies on the circle and the chord $PR$ has length 20. **(c)** Find the shortest distance from $A$ to $PR$, as a surd. **(d)** Find angle $ARQ$ to the nearest $0.1°$.",
      steps: [
        { h: "(a) Midpoint of $PQ$", m: "$\\left(\\dfrac{-9 + 15}{2}, \\dfrac{8 - 10}{2}\\right) = (3, -1) = A$ — the centre is the midpoint, so $PQ$ is a diameter.", mk: "M1 A1" },
        { h: "(b)", m: "$r = |AP| = \\sqrt{12^2 + 9^2} = 15$; $\; (x - 3)^2 + (y + 1)^2 = 225$", mk: "M1 A1 A1" },
        { h: "(c) Perpendicular from centre bisects the chord", m: "$d = \\sqrt{15^2 - 10^2} = \\sqrt{125} = 5\\sqrt5$", mk: "M1 A1", n: "Half-chord 10, radius 15, right angle between them." },
        { h: "(d) $\\angle PRQ = 90°$ (semicircle); triangle $ARQ$ is isosceles with $AR = AQ = 15$", m: "$QR = \\sqrt{30^2 - 20^2} = 10\\sqrt5$; $\; \\cos\\angle ARQ = \\dfrac{5\\sqrt5}{15} \\Rightarrow \\angle ARQ = 41.8°$", mk: "M1 A1", n: "Half of $QR$ over the radius, because the perpendicular from $A$ bisects $QR$ too." }
      ], result: "(b) $(x - 3)^2 + (y + 1)^2 = 225$ (c) $5\\sqrt5$ (d) $41.8°$" } },

    { page: "Lines meeting circles" },
    { callout: { t: "memorise", h: "Line and circle — the discriminant, or the distance", body: [
      "**Substitute** the line into the circle, collect $Ax^2 + Bx + C = 0$ (the unknown $k$ ends up in $B$ and $C$), then $B^2 - 4AC > 0$ / $= 0$ / $< 0$.",
      "**Or** compare the perpendicular distance from the centre to the line with $r$ — shorter when the line is horizontal or vertical ($y = k$: two points iff $|k - b| < r$)."
    ] } },
    { worked: { tag: "exam", title: "$y = kx$ cutting a circle twice — a quadratic inequality in $k$", src: "AS June 2018 · P1 Q14 · 9 marks",
      q: "$C$: $x^2 + y^2 - 6x + 10y + 9 = 0$. **(a)** Find the centre and radius. **(b)** The line $y = kx$ cuts $C$ at two distinct points. Find the range of values for $k$.",
      steps: [
        { h: "(a)", m: "$(x - 3)^2 + (y + 5)^2 = 25$: centre $(3, -5)$, $r = 5$", mk: "M1 A1 A1" },
        { h: "(b) Substitute", m: "$x^2 + k^2x^2 - 6x + 10kx + 9 = 0 \\Rightarrow (1 + k^2)x^2 + (10k - 6)x + 9 = 0$", mk: "M1 A1" },
        { m: "$(10k - 6)^2 - 36(1 + k^2) > 0 \\Rightarrow 64k^2 - 120k > 0 \\Rightarrow 8k(8k - 15) > 0$", mk: "M1 A1" },
        { m: "$k < 0$ or $k > \\dfrac{15}{8}$", mk: "M1 A1", n: "A quadratic inequality (2.5): roots $0$ and $\\frac{15}{8}$, positive outside. Geometrically: lines through $O$ steeper than $\\frac{15}{8}$ or sloping down hit the circle in the fourth quadrant." }
      ], result: "(a) $(3, -5)$, 5 (b) $k < 0$ or $k > \\frac{15}{8}$" } },
    { worked: { tag: "exam", title: "Horizontal and vertical lines: $y = k$ twice, $x = k$ tangent", src: "AS June 2025 · P1 Q4 and AS June 2019 · P1 Q10",
      q: "**(i)** $x^2 + y^2 + 10x - 4y + 1 = 0$: find the centre and exact radius; the line $y = k$ cuts $C$ at two distinct points — find the range of $k$ in set notation. **(ii)** $x^2 + y^2 - 4x + 8y - 8 = 0$: find the centre and exact radius; the line $x = k$ is a tangent — find the possible values of $k$.",
      steps: [
        { h: "(i)", m: "$(x + 5)^2 + (y - 2)^2 = 28$: centre $(-5, 2)$, $r = 2\\sqrt7$. A horizontal line cuts twice when it is within a radius of the centre's height: $\\{k : 2 - 2\\sqrt7 < k < 2 + 2\\sqrt7\\}$", mk: "M1 A1 A1 M1 A1 A1", n: "No substitution needed — the geometry is immediate for axis-parallel lines." },
        { h: "(ii)", m: "$(x - 2)^2 + (y + 4)^2 = 28$: centre $(2, -4)$, $r = 2\\sqrt7$. Vertical tangents are one radius left or right of the centre: $k = 2 \\pm 2\\sqrt7$", mk: "M1 A1 A1 M1 A1" }
      ], result: "(i) $\\{k : 2 - 2\\sqrt7 < k < 2 + 2\\sqrt7\\}$ (ii) $k = 2 \\pm 2\\sqrt7$" } },
    { worked: { tag: "exam", title: "Circle in terms of $k$ meeting a line at two points", src: "A-level June 2023 · P1 Q10 · 9 marks",
      q: "$C$: $x^2 + y^2 + 6kx - 2ky + 7 = 0$. **(a)** Find, in terms of $k$, (i) the centre, (ii) the radius. **(b)** The line $y = 2x - 1$ meets $C$ at two distinct points. Find the range of possible values of $k$.",
      steps: [
        { h: "(a)", m: "$(x + 3k)^2 + (y - k)^2 = 10k^2 - 7$: centre $(-3k, k)$, $r = \\sqrt{10k^2 - 7}$", mk: "M1 A1 A1" },
        { h: "(b) Substitute the line", m: "$x^2 + (2x - 1)^2 + 6kx - 2k(2x - 1) + 7 = 0 \\Rightarrow 5x^2 + (2k - 4)x + (2k + 8) = 0$", mk: "M1 A1" },
        { m: "$(2k - 4)^2 - 20(2k + 8) > 0 \\Rightarrow k^2 - 14k - 36 > 0$", mk: "M1 A1" },
        { m: "Roots $7 \\pm \\sqrt{85}$, so $k < 7 - \\sqrt{85}$ or $k > 7 + \\sqrt{85}$", mk: "M1 A1", n: "Both regions also satisfy $10k^2 - 7 > 0$ (a real circle), so nothing is excluded — but check it." }
      ], result: "(a) $(-3k, k)$, $\\sqrt{10k^2 - 7}$ (b) $k < 7 - \\sqrt{85}$ or $k > 7 + \\sqrt{85}$" } },
    { worked: { tag: "exam", title: "Shortest distance from a circle to a line", src: "AS June 2022 · P1 Q11 · 8 marks",
      q: "$C$: $x^2 + y^2 - 10x - 8y + 32 = 0$ and $l$: $2y + x + 6 = 0$. **(a)** Find the centre and radius of $C$. **(b)** Find the shortest distance between $C$ and $l$.",
      steps: [
        { h: "(a)", m: "$(x - 5)^2 + (y - 4)^2 = 9$: centre $(5, 4)$, $r = 3$", mk: "M1 A1 A1" },
        { h: "(b) Distance from the centre to the line, minus the radius", m: "Perpendicular through $(5, 4)$ to $l$ (gradient $-\\frac12$) has gradient $2$: $y = 2x - 6$. Meets $l$: $2(2x - 6) + x + 6 = 0 \\Rightarrow x = \\dfrac65, \; y = -\\dfrac{18}{5}$\nDistance centre→line $= \\sqrt{\\left(5 - \\tfrac65\\right)^2 + \\left(4 + \\tfrac{18}{5}\\right)^2} = \\sqrt{\\tfrac{361}{25} + \\tfrac{1444}{25}} = \\dfrac{19}{\\sqrt5}$", mk: "M1 M1 A1", n: "Or the distance formula $\\frac{|5 + 8 + 6|}{\\sqrt{1 + 4}} = \\frac{19}{\\sqrt5}$ in one line." },
        { m: "Shortest distance $= \\dfrac{19}{\\sqrt5} - 3 = \\dfrac{19\\sqrt5}{5} - 3 \\approx 5.50$", mk: "M1 A1" }
      ], result: "(a) $(5, 4)$, 3 (b) $\\frac{19\\sqrt5}{5} - 3 \\approx 5.50$" } },
    { worked: { tag: "exam", title: "Circle touching both axes; tangency gives $r$", src: "A-level Oct 2020 · P2 Q14 · 7 marks",
      q: "A circle $C$ of radius $r$ lies only in the first quadrant and touches both axes. $l$: $2x + y = 12$. **(a)** Show that the $x$-coordinates of the intersections of $l$ and $C$ satisfy $5x^2 + (2r - 48)x + (r^2 - 24r + 144) = 0$. **(b)** Given $l$ is a tangent to $C$, find the two possible values of $r$ as simplified surds.",
      steps: [
        { h: "(a) Touching both axes ⇒ centre $(r, r)$", m: "$(x - r)^2 + (y - r)^2 = r^2$ with $y = 12 - 2x$:\n$(x - r)^2 + (12 - 2x - r)^2 = r^2 \\Rightarrow 5x^2 + (2r - 48)x + (r^2 - 24r + 144) = 0$", mk: "B1 M1 A1*", n: "$(12 - r - 2x)^2 = (12 - r)^2 - 4(12 - r)x + 4x^2$; collect with $x^2 - 2rx + r^2 - r^2$." },
        { h: "(b) Discriminant zero", m: "$(2r - 48)^2 - 20(r^2 - 24r + 144) = 0 \\Rightarrow -16r^2 + 288r - 576 = 0 \\Rightarrow r^2 - 18r + 36 = 0$", mk: "M1 A1" },
        { m: "$r = 9 \\pm 3\\sqrt5$", mk: "M1 A1", n: "Both positive: a small circle tucked under the line and a large one it touches from above." }
      ], result: "$r = 9 \\pm 3\\sqrt5$" } },
    { worked: { tag: "exam", title: "Two circles: angle at the origin in radians and a perimeter", src: "A-level Oct 2020 · P1 Q11 · 8 marks",
      q: "$C_1$: $x^2 + y^2 = 100$ and $C_2$: $(x - 15)^2 + y^2 = 40$ meet at $A$ and $B$. **(a)** Show that angle $AOB = 0.635$ radians to 3 s.f. **(b)** The region shaded is bounded by $C_1$ and $C_2$ (the union of the two discs). Find its perimeter to 1 d.p.",
      steps: [
        { h: "(a) Subtract the equations to find the chord line", m: "$x^2 + y^2 = 100$ and $x^2 - 30x + 225 + y^2 = 40 \\Rightarrow 100 - 30x + 225 = 40 \\Rightarrow x = 9.5$", mk: "M1 A1", n: "Subtracting kills the squared terms and leaves the equation of the common chord." },
        { m: "$y^2 = 100 - 90.25 = 9.75$; $\; \\angle AOB = 2\\arctan\\dfrac{\\sqrt{9.75}}{9.5} = 0.635$ rad", mk: "M1 A1*", n: "Or $\\cos\\angle AOB = \\frac{9.5}{10}$… careful: that gives the half-angle; $\\angle AOB = 2\\arccos(0.95)$." },
        { h: "(b) Two major arcs", m: "At the centre of $C_2$, half-angle $\\arctan\\dfrac{\\sqrt{9.75}}{5.5}$, so $\\angle AC_2B = 1.033$ rad\nPerimeter $= 10(2\\pi - 0.635) + \\sqrt{40}(2\\pi - 1.033) = 56.48 + 33.21 = 89.7$", mk: "M1 M1 M1 A1", n: "Arc length $= r\\theta$ (5.1) with the **reflex** angles — the parts of each circle outside the other." }
      ], result: "(a) $0.635$ rad (b) $89.7$" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Find the coordinates of the centre and the radius**", "complete the square; radius as an exact simplified surd if asked"],
      ["**Show that $PQ$ is a diameter**", "midpoint of $PQ$ = centre (or $\\angle$ in semicircle, or $|PQ| = 2r$)"],
      ["**Find an equation of the tangent at $P$**", "radius gradient → negative reciprocal → line through $P$ in the form asked"],
      ["**Find the possible values of $k$ for which … tangent / two points**", "substitute and use the discriminant, or distance-to-centre vs $r$"],
      ["**Determine whether the point lies inside**", "distance from centre compared with $r$, with the comparison written"],
      ["**Find the range of $k$ so the circle lies entirely in …**", "$r$ less than the distance to the nearest axis, and $r^2 > 0$"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Centre signs**: $(x + 5)^2$ means centre $x = -5$.",
      "**$r$ vs $r^2$**: leaving 28 as the radius.",
      "**Tangent with the radius gradient** instead of its negative reciprocal.",
      "**Forgetting $r^2 > 0$** in range-of-$k$ questions.",
      "**Wrong inequality direction** for \"does not touch\" ($r <$ distance) vs \"cuts twice\".",
      "**Chord questions without the perpendicular-bisects fact** — trying to find $R$'s coordinates instead.",
      "**Radians vs degrees** in the arc-length follow-on."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Distance and midpoint", "Plain arithmetic — but store coordinates in variables to avoid retyping."],
      ["Line–circle check", "**Equation → Polynomial → 2** on the collected quadratic with a trial $k$: two real roots means two intersections."],
      ["Radius check", "Substitute a known point into your circle equation: left side must equal $r^2$."]
    ] },
    { callout: { t: "mnemonic", h: "\"Complete, then read; tangent flips; chord halves; semicircle squares\"", body: "Complete the square and read off centre/radius; tangent gradient is the flipped, negated radius gradient; the perpendicular from the centre halves a chord; the angle in a semicircle is a right angle." } }
  ],
  flashcards: [
    ["Centre and radius of $x^2 + y^2 - 10x + 4y + 11 = 0$?", "$(5, -2)$, $r = \\sqrt{18} = 3\\sqrt2$."],
    ["General $x^2 + y^2 + 2fx + 2gy + c = 0$: centre and $r^2$?", "$(-f, -g)$; $r^2 = f^2 + g^2 - c$."],
    ["Tangent at $P$ on a circle with centre $C$: gradient?", "$-\\frac{1}{m_{CP}}$ — perpendicular to the radius."],
    ["Chord of length 20 in a circle of radius 15: distance from centre?", "$\\sqrt{225 - 100} = 5\\sqrt5$."],
    ["How to show $PQ$ is a diameter?", "Midpoint of $PQ$ equals the centre (or $|PQ| = 2r$)."],
    ["Line $y = mx + k$ tangent to a circle — two methods?", "Substitute and set $b^2 - 4ac = 0$; or distance from centre to line $= r$."],
    ["Circle centre $(3, -5)$ not cutting the $x$-axis: condition on $r$?", "$0 < r < 5$."],
    ["Second tangent parallel to a known tangent at $P$: fastest route?", "Reflect $P$ through the centre and use that point."],
    ["Two circles with centres $d$ apart and radii $r_1, r_2$ meet twice iff…", "$|r_1 - r_2| < d < r_1 + r_2$."],
    ["Point furthest from $O$ on a circle with centre $C$?", "Along $OC$ extended: $|OC| + r$."],
    ["Is $(0, 0)$ inside $(x + 3)^2 + (y - 4)^2 = 24$?", "$9 + 16 = 25 > 24$: outside."],
    ["Common chord of two circles?", "Subtract their equations — the squared terms cancel, leaving a line."]
  ],
  quiz: [
    { q: "Centre of $(x + 2)^2 + (y - 7)^2 = 50$:", opts: ["$(2, -7)$", "$(-2, 7)$", "$(-2, -7)$", "$(2, 7)$"], ans: 1, why: "Opposite signs to the brackets." },
    { q: "Radius of $x^2 + y^2 - 4x + 8y - 8 = 0$:", opts: ["28", "$2\\sqrt7$", "$\\sqrt{12}$", "8"], ans: 1, why: "$4 + 16 + 8 = 28$." },
    { q: "Tangent at $(-5, 7)$ to a circle with centre $(-9, 1)$ has gradient", opts: ["$\\tfrac32$", "$-\\tfrac32$", "$-\\tfrac23$", "$\\tfrac23$"], ans: 2, why: "Radius gradient $\\frac32$; perpendicular $-\\frac23$." },
    { q: "$y = k$ meets $(x + 5)^2 + (y - 2)^2 = 28$ twice when", opts: ["$|k| < 28$", "$|k - 2| < 2\\sqrt7$", "$|k + 5| < 2\\sqrt7$", "$k < 2$"], ans: 1, why: "Within a radius of the centre's $y$." },
    { q: "Circle $(x - 4)^2 + (y + 6)^2 = r^2$ lies entirely in the 4th quadrant if", opts: ["$r < 6$", "$r < 4$", "$r < 10$", "$r > 4$"], ans: 1, why: "Nearest axis is 4 away." },
    { q: "Angle in a semicircle is", opts: ["$45°$", "$60°$", "$90°$", "$180°$"], ans: 2, why: "Standard circle theorem." },
    { q: "Distance from $(5, 4)$ to the line $x + 2y + 6 = 0$:", opts: ["$\\tfrac{19}{\\sqrt5}$", "19", "$\\tfrac{19}{5}$", "$\\sqrt5$"], ans: 0, why: "$\\frac{|5 + 8 + 6|}{\\sqrt5}$." }
  ]
};

/* =====================================================================
   3.3  Parametric equations
   ===================================================================== */
C["maths:3.3"] = {
  notes: [
    { h: "Parametric equations — the whole topic on one page" },
    "A curve given as $x = f(t)$, $y = g(t)$: each value of the parameter $t$ places one point. The examiner asks you to **convert** to a Cartesian equation (eliminate $t$), to respect the **domain** the parameter imposes, to find **intersections** with other curves, and — in Paper 2 especially — to **differentiate** ($\\frac{dy}{dx} = \\frac{dy/dt}{dx/dt}$, topic 7.5) and **integrate** ($\\int y\\,\\frac{dx}{dt}\\,dt$, topic 8.5).",
    { table: { head: ["Parametric", "Cartesian", "Method"], rows: [
      ["$x = 3\\cos t$, $y = 3\\sin t$", "$x^2 + y^2 = 9$", "$\\cos^2 t + \\sin^2 t = 1$"],
      ["$x = 2 + 5\\cos t$, $y = -4 + 5\\sin t$", "$(x - 2)^2 + (y + 4)^2 = 25$", "isolate $\\cos t$, $\\sin t$, then the identity"],
      ["$x = 5t$, $y = \\frac{5}{t}$", "$xy = 25$", "multiply"],
      ["$x = 5t$, $y = 3t^2$", "$25y = 3x^2$", "$t = \\frac{x}{5}$, substitute"],
      ["$x = 3 + 2\\sin t$, $y = 4 + 2\\cos 2t$", "$y = 6 - (x - 3)^2$, $1 \\le x \\le 5$", "$\\cos 2t = 1 - 2\\sin^2 t$"],
      ["$x = t^2 + 6t - 16$, $y = 6\\ln(t + 3)$", "$y = 3\\ln(x + 25)$", "complete the square in $t$; $t + 3 = e^{y/6}$"]
    ] } },

    { page: "Converting to Cartesian form" },
    { callout: { t: "memorise", h: "Three ways to eliminate $t$", body: [
      "**Substitute**: make $t$ the subject of the simpler equation ($t = 2x + 1$) and substitute into the other.",
      "**Identity**: with $\\cos t$ and $\\sin t$ use $\\cos^2 t + \\sin^2 t = 1$; with $\\tan t$ and $\\sec^2 t$ use $1 + \\tan^2 t = \\sec^2 t$; with $\\cos 2t$ use a double-angle formula to get it in terms of the same function as $x$.",
      "**Combine**: multiply or divide the equations when $t$ cancels ($x = 5t$, $y = \\frac5t$).",
      "Then state the **domain** of $x$ (or $y$) that the range of $t$ allows — a parametric curve is often only *part* of the Cartesian curve."
    ] } },
    { worked: { tag: "exam", title: "Trig parametric with a double angle — Cartesian, sketch, domain, intersections", src: "A-level June 2018 · P1 Q14 · 10 marks",
      q: "$C$: $x = 3 + 2\\sin t$, $y = 4 + 2\\cos 2t$, $0 \\le t < 2\\pi$. **(a)** Show that all points on $C$ satisfy $y = 6 - (x - 3)^2$. **(b)(i)** Sketch $C$. **(ii)** Explain briefly why $C$ does not include all points of $y = 6 - (x - 3)^2$. **(c)** The line $x + y = k$ intersects $C$ at two distinct points. State the range of values of $k$ in set notation.",
      steps: [
        { h: "(a) Write $\\cos 2t$ in terms of $\\sin t$", m: "$y = 4 + 2(1 - 2\\sin^2 t) = 6 - 4\\sin^2 t$ and $\\sin t = \\dfrac{x - 3}{2}$, so $y = 6 - 4 \\cdot \\dfrac{(x - 3)^2}{4} = 6 - (x - 3)^2$", mk: "M1 A1*", n: "Choose the double-angle form that matches what $x$ gives you — $\\sin t$ here." },
        { h: "(b) Domain from $-1 \\le \\sin t \\le 1$", m: "$1 \\le x \\le 5$, so $C$ is the arc of the parabola between $(1, 2)$ and $(5, 2)$, vertex $(3, 6)$.\n(ii) $\\sin t$ cannot exceed 1 in size, so $x$ is restricted to $[1, 5]$ — the parabola's arms outside that are not on $C$.", mk: "B1 B1 B1", fig: { x: [-1, 8], y: [-2, 8], axes: { xt: [1, 3, 5], yt: [2, 6] }, items: [ { fn: "6-(x-3)^2", from: -1, to: 8, c: "muted", dash: true }, { fn: "6-(x-3)^2", from: 1, to: 5, w: 2.6, label: "C", at: 4.4, pos: "ne" }, { pt: [1, 2], label: "(1, 2)", pos: "w" }, { pt: [5, 2], label: "(5, 2)", pos: "e" }, { pt: [3, 6], label: "(3, 6)", pos: "n" }, { fn: "7-x", c: "accent3", dash: true, label: "x + y = 7", at: 6.8, pos: "ne" } ], cap: "$C$ is the solid arc; the dashed parabola continues but is not part of $C$. The line $x + y = 7$ passes through the endpoint $(5, 2)$." } },
        { h: "(c) Substitute $y = k - x$", m: "$k - x = 6 - (x - 3)^2 \\Rightarrow x^2 - 7x + (3 + k) = 0$; two distinct roots need $49 - 4(3 + k) > 0 \\Rightarrow k < \\dfrac{37}{4}$", mk: "M1 A1" },
        { m: "Both roots must lie in $[1, 5]$. The roots sum to 7, so as one root passes $5$ the other passes $2$; at $x = 5$, $k = 7$. For $k < 7$ one intersection leaves $C$.\n$\\{k : 7 \\le k < \\tfrac{37}{4}\\}$", mk: "M1 A1 A1", n: "The discriminant alone gives $k < \\frac{37}{4}$ and loses two marks: the domain restriction is the whole point of part (b)(ii). $k = 7$ is included because $(5, 2)$ is on $C$ ($t = \\frac{\\pi}{2}$)." }
      ], result: "(a) shown (b) $1 \\le x \\le 5$ (c) $\\{k : 7 \\le k < \\frac{37}{4}\\}$" } },
    { worked: { tag: "exam", title: "Addition formula inside a parametric — an ellipse", src: "A-level Specimen · P1 Q14 · 5 marks",
      q: "$C$: $x = 4\\cos\\left(t + \\frac{\\pi}{6}\\right)$, $y = 2\\sin t$, $0 < t < 2\\pi$. Show that a Cartesian equation of $C$ can be written as $(x + y)^2 + ay^2 = b$, where $a$ and $b$ are integers.",
      steps: [
        { h: "Expand the compound angle", m: "$x = 4\\left(\\cos t\\cos\\tfrac{\\pi}{6} - \\sin t\\sin\\tfrac{\\pi}{6}\\right) = 2\\sqrt3\\cos t - 2\\sin t$", mk: "M1 A1" },
        { h: "Use $y = 2\\sin t$ to isolate $\\cos t$", m: "$x = 2\\sqrt3\\cos t - y \\Rightarrow x + y = 2\\sqrt3\\cos t$", mk: "M1", n: "The printed form $(x + y)^2$ is the hint: the sum is what isolates $\\cos t$." },
        { h: "Square and use the identity", m: "$(x + y)^2 = 12\\cos^2 t = 12(1 - \\sin^2 t) = 12\\left(1 - \\dfrac{y^2}{4}\\right) = 12 - 3y^2$\n$(x + y)^2 + 3y^2 = 12$: $a = 3$, $b = 12$", mk: "M1 A1" }
      ], result: "$(x + y)^2 + 3y^2 = 12$" } },
    { worked: { tag: "exam", title: "Rational parametrics of a circle", src: "A-level Oct 2021 · P1 Q13 · 3 marks",
      q: "$C$: $x = \\frac{t^2 + 5}{t^2 + 1}$, $y = \\frac{4t}{t^2 + 1}$, $t \\in \\mathbb{R}$. Show that all points on $C$ satisfy $(x - 3)^2 + y^2 = 4$.",
      steps: [
        { h: "Form $x - 3$ over the common denominator", m: "$x - 3 = \\dfrac{t^2 + 5 - 3t^2 - 3}{t^2 + 1} = \\dfrac{2 - 2t^2}{t^2 + 1}$", mk: "M1" },
        { m: "$(x - 3)^2 + y^2 = \\dfrac{(2 - 2t^2)^2 + 16t^2}{(t^2 + 1)^2} = \\dfrac{4t^4 - 8t^2 + 4 + 16t^2}{(t^2 + 1)^2} = \\dfrac{4(t^2 + 1)^2}{(t^2 + 1)^2} = 4$", mk: "M1 A1*", n: "The numerator collapses to a perfect square — that is the whole design of the question." }
      ], result: "shown" } },
    { worked: { tag: "exam", title: "Log parametric → $y = A\\ln(x + B)$; tangent at the $y$-intercept", src: "A-level June 2023 · P2 Q9 · 7 marks",
      q: "$C$: $x = t^2 + 6t - 16$, $y = 6\\ln(t + 3)$, $t > -3$. **(a)** Show that a Cartesian equation is $y = A\\ln(x + B)$, $x > -B$. **(b)** $C$ cuts the $y$-axis at $P$. Show that the tangent at $P$ has equation $ax + by = c\\ln5$ with integers $a$, $b$, $c$.",
      steps: [
        { h: "(a) Complete the square in $t$, and invert the log", m: "$x = (t + 3)^2 - 25$ and $t + 3 = e^{y/6}$, so $x = e^{y/3} - 25 \\Rightarrow y = 3\\ln(x + 25)$: $A = 3$, $B = 25$", mk: "M1 M1 A1" },
        { h: "(b) $P$: $x = 0$", m: "$t^2 + 6t - 16 = (t + 8)(t - 2) = 0$, $t > -3 \\Rightarrow t = 2$; $P = (0, 6\\ln5)$", mk: "M1" },
        { h: "Gradient by parametric differentiation", m: "$\\dfrac{dy}{dx} = \\dfrac{6/(t + 3)}{2t + 6} = \\dfrac{3}{(t + 3)^2} = \\dfrac{3}{25}$ at $t = 2$", mk: "M1 A1" },
        { m: "$y - 6\\ln5 = \\dfrac{3}{25}x \\Rightarrow 25y - 3x = 150\\ln5$", mk: "A1", n: "$-3x + 25y = 150\\ln5$: $a = -3$, $b = 25$, $c = 150$." }
      ], result: "(a) $y = 3\\ln(x + 25)$ (b) $-3x + 25y = 150\\ln 5$" } },
    { worked: { tag: "exam", title: "Find $y$ at a point, convert, differentiate", src: "A-level June 2025 · P2 Q5 · 7 marks",
      q: "$C$: $x = \\frac{t - 1}{2}$, $y = 5(t + 2)^4$, $t \\in \\mathbb{R}$. $P$ has $x$-coordinate $-3$. **(a)** Find the $y$-coordinate of $P$. **(b)** Find a Cartesian equation $y = f(x)$. **(c)** Hence, or otherwise, find the gradient of $C$ at $P$.",
      steps: [
        { h: "(a)", m: "$\\dfrac{t - 1}{2} = -3 \\Rightarrow t = -5$; $y = 5(-3)^4 = 405$", mk: "M1 A1" },
        { h: "(b)", m: "$t = 2x + 1 \\Rightarrow y = 5(2x + 3)^4$", mk: "M1 A1" },
        { h: "(c) Chain rule", m: "$\\dfrac{dy}{dx} = 5 \\cdot 4(2x + 3)^3 \\cdot 2 = 40(2x + 3)^3$; at $x = -3$: $40(-3)^3 = -1080$", mk: "M1 A1 A1", n: "Parametrically: $\\frac{dy/dt}{dx/dt} = \\frac{20(t + 2)^3}{1/2}$ at $t = -5$ gives the same $-1080$." }
      ], result: "(a) 405 (b) $y = 5(2x + 3)^4$ (c) $-1080$" } },
    { worked: { tag: "exam", title: "Parametric curve meeting a circle — the point in the fourth quadrant", src: "A-level June 2019 · P2 Q4 · 6 marks",
      q: "$C_1$: $x = 10\\cos t$, $y = 4\\sqrt2\\sin t$, $0 \\le t < 2\\pi$, meets the circle $x^2 + y^2 = 66$ at four points. One of them, $S$, lies in the fourth quadrant. Find the Cartesian coordinates of $S$.",
      steps: [
        { h: "Substitute the parametric form into the circle", m: "$100\\cos^2 t + 32\\sin^2 t = 66 \\Rightarrow 100(1 - \\sin^2 t) + 32\\sin^2 t = 66 \\Rightarrow 68\\sin^2 t = 34 \\Rightarrow \\sin^2 t = \\dfrac12$", mk: "M1 A1" },
        { h: "Fourth quadrant: $\\cos t > 0$, $\\sin t < 0$", m: "$\\sin t = -\\dfrac{1}{\\sqrt2}, \; \\cos t = \\dfrac{1}{\\sqrt2}$ (i.e. $t = \\dfrac{7\\pi}{4}$)", mk: "M1 A1" },
        { m: "$S = \\left(10 \\cdot \\dfrac{1}{\\sqrt2}, \; 4\\sqrt2 \\cdot \\left(-\\dfrac{1}{\\sqrt2}\\right)\\right) = (5\\sqrt2, -4)$", mk: "M1 A1" }
      ], result: "$S(5\\sqrt2, -4)$" } },

    { page: "Gradients on parametric curves" },
    "Full treatment is in 7.5; the two facts needed here:",
    { callout: { t: "formula", h: "Parametric differentiation", body: [
      "$$\\dfrac{dy}{dx} = \\dfrac{dy/dt}{dx/dt} \\qquad \\text{tangent at } t = t_0: \; y - y(t_0) = \\dfrac{dy}{dx}\\Big|_{t_0}(x - x(t_0)) \\qquad \\text{normal gradient } = -\\dfrac{dx/dt}{dy/dt}$$"
    ] } },
    { worked: { tag: "exam", title: "Normal at a point using parametric differentiation; the Cartesian form", src: "A-level June 2022 · P2 Q16(a)(b) · 8 marks",
      q: "$C$: $x = 2\\tan t + 1$, $y = 2\\sec^2 t + 3$, $-\\frac{\\pi}{4} \\le t \\le \\frac{\\pi}{3}$. $l$ is the normal to $C$ at $P$, where $t = \\frac{\\pi}{4}$. **(a)** Show that $l$ has equation $y = -\\frac12 x + \\frac{17}{2}$. **(b)** Show that all points on $C$ satisfy $y = 5 + \\frac12(x - 1)^2$.",
      steps: [
        { h: "(a) Derivatives", m: "$\\dfrac{dx}{dt} = 2\\sec^2 t, \\quad \\dfrac{dy}{dt} = 4\\sec^2 t\\tan t \\Rightarrow \\dfrac{dy}{dx} = 2\\tan t$", mk: "M1 A1" },
        { m: "At $t = \\frac{\\pi}{4}$: $P(3, 7)$, gradient $2$, normal gradient $-\\dfrac12$: $y - 7 = -\\dfrac12(x - 3) \\Rightarrow y = -\\dfrac12 x + \\dfrac{17}{2}$", mk: "M1 M1 A1*" },
        { h: "(b) $\\sec^2 t = 1 + \\tan^2 t$", m: "$\\tan t = \\dfrac{x - 1}{2}$, so $y = 2\\left(1 + \\dfrac{(x - 1)^2}{4}\\right) + 3 = 5 + \\dfrac12(x - 1)^2$", mk: "M1 A1 A1", n: "Domain: $\\tan t$ runs from $-1$ to $\\sqrt3$, so $-1 \\le x \\le 1 + 2\\sqrt3$." }
      ], result: "shown" } },
    { worked: { tag: "exam", title: "Gradient at a given $y$ with $\\sin 2\\theta$ and $\\text{cosec}^3\\theta$", src: "A-level Oct 2021 · P2 Q13 · 6 marks",
      q: "$C$: $x = \\sin 2\\theta$, $y = \\text{cosec}^3\\theta$, $0 < \\theta < \\frac{\\pi}{2}$. **(a)** Find $\\frac{dy}{dx}$ in terms of $\\theta$. **(b)** Hence find the exact gradient of the tangent at the point where $y = 8$.",
      steps: [
        { h: "(a)", m: "$\\dfrac{dx}{d\\theta} = 2\\cos 2\\theta; \\qquad \\dfrac{dy}{d\\theta} = 3\\,\\text{cosec}^2\\theta \\cdot (-\\text{cosec}\\,\\theta\\cot\\theta) = -3\\,\\text{cosec}^3\\theta\\cot\\theta$\n$\\dfrac{dy}{dx} = -\\dfrac{3\\,\\text{cosec}^3\\theta\\cot\\theta}{2\\cos 2\\theta}$", mk: "M1 A1 A1" },
        { h: "(b) $y = 8 \\Rightarrow \\text{cosec}\\,\\theta = 2 \\Rightarrow \\theta = \\frac{\\pi}{6}$", m: "$\\cot\\dfrac{\\pi}{6} = \\sqrt3, \; \\cos\\dfrac{\\pi}{3} = \\dfrac12$: $\\dfrac{dy}{dx} = -\\dfrac{3 \\cdot 8 \\cdot \\sqrt3}{2 \\cdot \\frac12} = -24\\sqrt3$", mk: "M1 M1 A1" }
      ], result: "(a) $-\\dfrac{3\\,\\text{cosec}^3\\theta\\cot\\theta}{2\\cos 2\\theta}$ (b) $-24\\sqrt3$" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Show that all points on $C$ satisfy …**", "eliminate $t$ with every step shown, ending at the printed equation"],
      ["**Find a Cartesian equation in the form $y = f(x)$**", "$t$ eliminated and $y$ made the subject"],
      ["**State the domain of $x$**", "the $x$-values the range of $t$ allows, as an inequality"],
      ["**Explain why $C$ does not include all points of …**", "the bound on the parameter's function ($|\\sin t| \\le 1$, $t > -3$) and the $x$ or $y$ values it excludes"],
      ["**Using parametric differentiation**", "$\\frac{dy/dt}{dx/dt}$ — converting first and differentiating the Cartesian form scores 0 for that part"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Ignoring the domain**: a parametric arc is not the whole Cartesian curve (2018 Q14(c) lost two marks that way).",
      "**Wrong double-angle form**: choose the one in the function you can substitute.",
      "**$\\frac{dx/dt}{dy/dt}$ upside down.**",
      "**Point from the wrong $t$**: $x = 4$ with $x = (t + 3)^2$ gives $t = -1$ *or* $-5$; the domain picks one.",
      "**Exact values dropped** ($6\\ln5$, $5\\sqrt2$)."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Check a Cartesian conversion", "Pick a $t$, compute $(x, y)$ from the parametric equations, substitute into your Cartesian equation: both sides equal."],
      ["Table of the curve", "Table app with $f(x) = $ your $x(t)$ and $g(x) = $ your $y(t)$ (using $x$ as $t$) shows the sweep of points and the domain at a glance."]
    ] },
    { callout: { t: "mnemonic", h: "\"Eliminate, then limit\"", body: "Get rid of $t$ — then ask what values of $x$ and $y$ the range of $t$ actually reaches." } }
  ],
  flashcards: [
    ["$x = 3\\cos t$, $y = 3\\sin t$ describes…", "the circle $x^2 + y^2 = 9$."],
    ["$x = 2 + 5\\cos t$, $y = -4 + 5\\sin t$?", "Circle centre $(2, -4)$, radius 5."],
    ["$x = 5t$, $y = \\frac5t$ — Cartesian?", "$xy = 25$."],
    ["$x = 3 + 2\\sin t$, $y = 4 + 2\\cos 2t$ — Cartesian and domain?", "$y = 6 - (x - 3)^2$, $1 \\le x \\le 5$."],
    ["Why is a parametric curve often only part of its Cartesian curve?", "The parameter's range limits $x$ and $y$ (e.g. $|\\sin t| \\le 1$)."],
    ["$\\frac{dy}{dx}$ for a parametric curve?", "$\\frac{dy/dt}{dx/dt}$."],
    ["$x = 4\\cos(t + \\frac{\\pi}{6})$, $y = 2\\sin t$ → Cartesian?", "$(x + y)^2 + 3y^2 = 12$."],
    ["$x = t^2 + 6t - 16$, $y = 6\\ln(t + 3)$ → Cartesian?", "$y = 3\\ln(x + 25)$."],
    ["Which identity for $x = 2\\tan t + 1$, $y = 2\\sec^2 t + 3$?", "$\\sec^2 t = 1 + \\tan^2 t$."],
    ["$x = 10\\cos t$, $y = 4\\sqrt2\\sin t$ meets $x^2 + y^2 = 66$ where…", "$\\sin^2 t = \\frac12$; 4th-quadrant point $(5\\sqrt2, -4)$."]
  ],
  quiz: [
    { q: "$x = t + 1$, $y = t^2$ is the curve", opts: ["$y = (x - 1)^2$", "$y = (x + 1)^2$", "$y = x^2 - 1$", "$y = x - 1$"], ans: 0, why: "$t = x - 1$." },
    { q: "$x = 2\\cos t$, $y = 2\\sin t$, $0 \\le t \\le \\pi$ traces", opts: ["a full circle", "the upper semicircle", "the lower semicircle", "a line"], ans: 1, why: "$\\sin t \\ge 0$ on $[0, \\pi]$." },
    { q: "For $x = t^2$, $y = t^3$, $\\frac{dy}{dx} =$", opts: ["$\\tfrac{3t}{2}$", "$\\tfrac{2}{3t}$", "$3t^2$", "$\\tfrac32 t^2$"], ans: 0, why: "$\\frac{3t^2}{2t}$." },
    { q: "To eliminate $t$ from $x = \\cos t$, $y = \\cos 2t$ use", opts: ["$\\cos 2t = 2\\cos^2 t - 1$", "$\\cos 2t = 1 - 2\\sin^2 t$", "$\\sin^2 t + \\cos^2 t = 1$", "$\\tan t$"], ans: 0, why: "Express in $\\cos t$, which is $x$." },
    { q: "$x = e^t$, $y = t$: Cartesian", opts: ["$y = \\ln x$", "$y = e^x$", "$x = \\ln y$", "$xy = 1$"], ans: 0, why: "$t = \\ln x$." },
    { q: "$x = (t + 3)^2$, $y = 1 - t^3$, $-2 \\le t \\le 1$; the point $(4, 2)$ has $t =$", opts: ["$-1$", "$-5$", "$1$", "$2$"], ans: 0, why: "$t + 3 = \\pm2$; only $-1$ is in range, and $1 - (-1)^3 = 2$." }
  ]
};

/* =====================================================================
   3.4  Parametric modelling
   ===================================================================== */
C["maths:3.4"] = {
  notes: [
    { h: "Parametric modelling — the whole topic on one page" },
    "Parametric equations with $t$ as **time** describe motion: the position at each instant. The spec wants you to write them for simple motion, to read them off a model (a slide, a dam, a wheel), and to answer questions the Cartesian form cannot — *when* and *where at the same time*.",
    { kv: [
      ["Constant velocity from $A$ to $B$", "From $(1, 8)$ at $t = 0$ to $(6, 20)$ at $t = 5$: $x = 1 + \\frac{5}{5}t = 1 + t$, $y = 8 + \\frac{12}{5}t$. Each coordinate changes linearly; the velocity is $\\begin{pmatrix} 1 \\\\ 2.4 \\end{pmatrix}$."],
      ["Circular motion", "$x = a + r\\cos\\omega t$, $y = b + r\\sin\\omega t$: centre $(a, b)$, radius $r$, one revolution every $\\frac{2\\pi}{\\omega}$."],
      ["Projectile (Paper 3 link)", "$x = (u\\cos\\alpha)t$, $y = (u\\sin\\alpha)t - \\frac12 g t^2$: eliminating $t$ gives the parabola of the path."],
      ["A shape", "A slide profile $x = (t + 3)^2$, $y = 1 - t^3$; a dam face $x = 6\\sin t$, $y = 5\\sin 2t$. Here $t$ is just a parameter; the questions are about the greatest height, the width, the area."]
    ] },

    { page: "Motion and shape models" },
    { worked: { tag: "example", title: "Write parametric equations for constant-velocity motion", src: "spec example",
      q: "An object moves with constant velocity from $(1, 8)$ at $t = 0$ to $(6, 20)$ at $t = 5$. Find parametric equations for its position, and its position at $t = 2$.",
      steps: [
        { m: "$x$ changes by 5 in 5 s: $x = 1 + t$. $\; y$ changes by 12 in 5 s: $y = 8 + \\dfrac{12}{5}t = 8 + 2.4t$", mk: "M1 A1" },
        { m: "At $t = 2$: $(3, 12.8)$", mk: "A1", n: "Eliminating $t$: $y = 8 + 2.4(x - 1)$ — the straight-line path; but the parametric form also tells you *when* it is at each point." }
      ], result: "$x = 1 + t$, $y = 8 + 2.4t$; $(3, 12.8)$" } },
    { worked: { tag: "exam", title: "A water slide: tangent at a point, greatest height", src: "A-level June 2024 · P2 Q10 · 6 marks",
      q: "$C$: $x = (t + 3)^2$, $y = 1 - t^3$, $-2 \\le t \\le 1$, models the profile of a slide (metres; $y$ is height above water). $P(4, 2)$ lies on $C$. **(a)** Using parametric differentiation, show that the tangent at $P$ is $3x + 4y = 20$. **(b)** Find, according to the model, the greatest height of the slide above the water.",
      steps: [
        { h: "(a) Which $t$ gives $P$?", m: "$(t + 3)^2 = 4 \\Rightarrow t = -1$ (since $-2 \\le t \\le 1$); check $y = 1 + 1 = 2$ ✓", mk: "B1" },
        { m: "$\\dfrac{dy}{dx} = \\dfrac{-3t^2}{2(t + 3)} = \\dfrac{-3}{4}$ at $t = -1$", mk: "M1 A1" },
        { m: "$y - 2 = -\\dfrac34(x - 4) \\Rightarrow 4y - 8 = -3x + 12 \\Rightarrow 3x + 4y = 20$", mk: "M1 A1*" },
        { h: "(b) $y = 1 - t^3$ is largest when $t$ is smallest", m: "$t = -2$: $y = 1 + 8 = 9$ m", mk: "B1", n: "The greatest height is at the end of the parameter range, not at a stationary point — check the ends." }
      ], result: "(b) 9 m" } },
    { worked: { tag: "exam", title: "The dam: area by parametric integration, and the model's width", src: "A-level Oct 2020 · P2 Q12 · 11 marks",
      q: "$C$: $x = 6\\sin t$, $y = 5\\sin 2t$, $0 \\le t \\le \\frac{\\pi}{2}$. The region $R$ is bounded by $C$ and the $x$-axis. **(a)(i)** Show that the area of $R$ is $\\displaystyle\\int_0^{\\pi/2} 60\\sin t\\cos^2 t\\,\\mathrm{d}t$. **(ii)** Hence show that the area is exactly 20. The curve models the cross-section of a dam (metres). **(b)** Find the width and greatest height of the dam.",
      steps: [
        { h: "(a)(i) $\\int y\\,dx = \\int y\\,\\frac{dx}{dt}\\,dt$", m: "$\\dfrac{dx}{dt} = 6\\cos t$, and $y = 5\\sin 2t = 10\\sin t\\cos t$, so the area is $\\displaystyle\\int_0^{\\pi/2} 10\\sin t\\cos t \\cdot 6\\cos t\\,\\mathrm{d}t = \\int_0^{\\pi/2} 60\\sin t\\cos^2 t\\,\\mathrm{d}t$", mk: "M1 A1 A1*", n: "Limits change to $t$-limits: $x = 0 \\Rightarrow t = 0$, $x = 6 \\Rightarrow t = \\frac{\\pi}{2}$." },
        { h: "(ii) Recognise $\\sin t\\cos^2 t$ as the derivative of $-\\frac13\\cos^3 t$", m: "$\\left[-20\\cos^3 t\\right]_0^{\\pi/2} = 0 - (-20) = 20$", mk: "M1 A1 A1*" },
        { h: "(b) Width: the $x$-range; height: max of $y$", m: "$x$ runs from $0$ to $6$: width $6$ m. $y = 5\\sin 2t$ is largest when $\\sin 2t = 1$ ($t = \\frac{\\pi}{4}$): height $5$ m.", mk: "B1 B1" }
      ], result: "(a) shown; 20 (b) width 6 m, height 5 m" } },
    { worked: { tag: "exam", title: "A parametric log curve: domain, and an area", src: "A-level Specimen · P2 Q10 · 9 marks",
      q: "$C$: $x = \\ln(t + 2)$, $y = \\frac{1}{t + 1}$, $t > -\\frac23$. **(a)** State the domain of values of $x$ for $C$. **(b)** $R$ is bounded by $C$, the line $x = \\ln2$, the $x$-axis and the line $x = \\ln4$. Use calculus to show that the area of $R$ is $\\ln\\left(\\frac32\\right)$.",
      steps: [
        { h: "(a) $t > -\\frac23 \\Rightarrow t + 2 > \\frac43$", m: "$x > \\ln\\dfrac43$", mk: "B1" },
        { h: "(b) Convert the limits to $t$", m: "$x = \\ln2 \\Rightarrow t = 0$; $\; x = \\ln4 \\Rightarrow t = 2$; $\; \\dfrac{dx}{dt} = \\dfrac{1}{t + 2}$", mk: "B1 B1" },
        { m: "Area $= \\displaystyle\\int_0^2 \\dfrac{1}{t + 1} \\cdot \\dfrac{1}{t + 2}\\,\\mathrm{d}t = \\int_0^2 \\left(\\dfrac{1}{t + 1} - \\dfrac{1}{t + 2}\\right)\\mathrm{d}t$", mk: "M1 A1", n: "Partial fractions (2.10): $\\frac{1}{(t+1)(t+2)} = \\frac{1}{t+1} - \\frac{1}{t+2}$." },
        { m: "$= \\Big[\\ln(t + 1) - \\ln(t + 2)\\Big]_0^2 = (\\ln3 - \\ln4) - (0 - \\ln2) = \\ln\\dfrac{3 \\cdot 2}{4} = \\ln\\dfrac32$", mk: "M1 A1 A1*" }
      ], result: "(a) $x > \\ln\\frac43$ (b) $\\ln\\frac32$" } },

    { page: "Exam toolkit" },
    { h: "Where the marks go" },
    { ul: [
      "**Forgetting $\\frac{dx}{dt}$** in a parametric area — $\\int y\\,dx$ becomes $\\int y\\,\\frac{dx}{dt}\\,dt$ with $t$-limits.",
      "**Limits not converted** to $t$.",
      "**Greatest/least value at an endpoint** of the parameter range missed.",
      "**Choosing the wrong $t$** for a given point when two values fit the equation but only one fits the range.",
      "**Units and context** dropped in the final sentence of a modelling part."
    ] },
    { callout: { t: "mnemonic", h: "\"$y$ times $dx/dt$, $t$-limits\"", body: "The parametric area recipe in five words." } }
  ],
  flashcards: [
    ["Parametric equations for constant velocity from $(1, 8)$ at $t = 0$ to $(6, 20)$ at $t = 5$?", "$x = 1 + t$, $y = 8 + 2.4t$."],
    ["Area under a parametric curve?", "$\\int y\\,\\frac{dx}{dt}\\,dt$ between the $t$-limits."],
    ["Greatest height of a slide $y = 1 - t^3$, $-2 \\le t \\le 1$?", "At $t = -2$: 9 m (an endpoint)."],
    ["$x = 6\\sin t$, $y = 5\\sin 2t$, $0 \\le t \\le \\frac{\\pi}{2}$: width and height of the dam?", "Width 6 (range of $x$), height 5 (max of $y$ at $t = \\frac{\\pi}{4}$)."],
    ["Circular motion centre $(a, b)$, radius $r$, period $T$?", "$x = a + r\\cos\\frac{2\\pi t}{T}$, $y = b + r\\sin\\frac{2\\pi t}{T}$."],
    ["Why keep the parametric form of a motion rather than convert?", "It records *when* the object is at each point, not just the path."]
  ],
  quiz: [
    { q: "$x = 2t$, $y = 3t$ from $t = 0$ describes", opts: ["a line through $O$ with gradient $\\tfrac32$", "a parabola", "a circle", "a line with gradient $\\tfrac23$"], ans: 0, why: "$y = \\frac32 x$." },
    { q: "Area under $x = f(t)$, $y = g(t)$ from $t = a$ to $b$:", opts: ["$\\int_a^b g(t)\\,dt$", "$\\int_a^b g(t)f'(t)\\,dt$", "$\\int_a^b f(t)g'(t)\\,dt$", "$\\int_a^b f(t)\\,dt$"], ans: 1, why: "$y\\,\\frac{dx}{dt}\\,dt$." },
    { q: "$x = 5\\cos t$, $y = 5\\sin t$, $t$ in seconds: time for one revolution", opts: ["$5$ s", "$2\\pi$ s", "$\\pi$ s", "$10\\pi$ s"], ans: 1, why: "Period of $\\cos t$." },
    { q: "Maximum of $y = 5\\sin 2t$ on $0 \\le t \\le \\frac{\\pi}{2}$ occurs at", opts: ["$t = \\tfrac{\\pi}{2}$", "$t = \\tfrac{\\pi}{4}$", "$t = 0$", "$t = \\pi$"], ans: 1, why: "$\\sin 2t = 1$." }
  ]
};


/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
