/* Kurenai OS — deep content: Pure Mathematics, section P10 (Vectors)
   at full A-level depth. Same contract as maths-pure-p4.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* =====================================================================
   10.1  Vectors in two and three dimensions
   ===================================================================== */
C["maths:10.1"] = {
  notes: [
    { h: "What a vector is" },
    { callout: { t: "def", h: "Vector vs scalar", body: [
      "A **vector** has magnitude and direction (displacement, velocity, force). A **scalar** is a number (distance, speed, mass).",
      "Two vectors are **equal** when they have the same magnitude and direction — wherever they are drawn. A vector is not tied to a starting point."
    ] } },
    { table: { head: ["Notation", "Meaning", "Notes"], rows: [
      ["$\\overrightarrow{AB}$", "the vector from $A$ to $B$", "direction matters: $\\overrightarrow{BA} = -\\overrightarrow{AB}$"],
      ["$\\mathbf{a}$ (bold) / $\\underline{a}$ (handwritten)", "a vector named by a letter", "**always underline** in handwriting — an un-underlined $a$ is a scalar and loses marks in a proof"],
      ["$\\mathbf{i}, \\mathbf{j}, \\mathbf{k}$", "unit vectors along the $x$, $y$, $z$ axes", "$3\\mathbf{i} - 2\\mathbf{j} + \\mathbf{k}$"],
      ["$\\begin{pmatrix} 3 \\\\ -2 \\\\ 1 \\end{pmatrix}$", "column vector — the same thing", "easier for adding and scaling; either form is accepted"],
      ["$|\\mathbf{a}|$", "magnitude (length)", "10.2"],
      ["$\\hat{\\mathbf{a}}$", "unit vector in the direction of $\\mathbf{a}$", "$\\mathbf{a}/|\\mathbf{a}|$"],
      ["$\\mathbf{0}$", "the zero vector", "magnitude 0, no direction"]
    ] } },
    { h: "Position vectors and displacement vectors" },
    { callout: { t: "key", h: "The one identity that runs the whole topic", body: [
      "$$\\overrightarrow{AB} = \\mathbf{b} - \\mathbf{a} \\qquad\\text{(\"end minus start\")}$$",
      "where $\\mathbf{a} = \\overrightarrow{OA}$ and $\\mathbf{b} = \\overrightarrow{OB}$ are the **position vectors** of $A$ and $B$ relative to the origin $O$.",
      "Why: $\\overrightarrow{AB} = \\overrightarrow{AO} + \\overrightarrow{OB} = -\\mathbf{a} + \\mathbf{b}$. Go from $A$ back to $O$, then out to $B$."
    ] } },
    { fig: { x: [-0.5, 7], y: [-0.5, 5], aspect: "equal", axes: { xt: [1, 2, 3, 4, 5, 6], yt: [1, 2, 3, 4] }, items: [
      { vec: [[0, 0], [1, 4]], label: "a", c: "accent" }, { vec: [[0, 0], [6, 1]], label: "b", c: "accent2" },
      { vec: [[1, 4], [6, 1]], label: "b − a", c: "danger" },
      { pt: [1, 4], label: "A(1, 4)", pos: "n" }, { pt: [6, 1], label: "B(6, 1)", pos: "e" }, { pt: [0, 0], label: "O", pos: "sw" }
    ], cap: "$\\overrightarrow{AB} = \\mathbf{b} - \\mathbf{a} = (6\\mathbf{i} + \\mathbf{j}) - (\\mathbf{i} + 4\\mathbf{j}) = 5\\mathbf{i} - 3\\mathbf{j}$: right 5, down 3 — exactly the arrow from $A$ to $B$." } },
    { ul: [
      "**Coordinates ↔ position vector**: the point $(3, -8)$ has position vector $3\\mathbf{i} - 8\\mathbf{j}$; in 3D, $(x, y, z) \\leftrightarrow x\\mathbf{i} + y\\mathbf{j} + z\\mathbf{k}$.",
      "**Components add separately**: $(2\\mathbf{i} + 3\\mathbf{j} - 4\\mathbf{k}) + (4\\mathbf{i} - 2\\mathbf{j} + 3\\mathbf{k}) = 6\\mathbf{i} + \\mathbf{j} - \\mathbf{k}$. In columns this is just adding rows.",
      "**Parallel** vectors are scalar multiples: $\\mathbf{u} \\parallel \\mathbf{v} \\iff \\mathbf{u} = \\lambda\\mathbf{v}$. Same direction if $\\lambda > 0$, opposite if $\\lambda < 0$.",
      "**Collinear points**: $A$, $B$, $C$ lie on a line $\\iff \\overrightarrow{AB} = \\lambda\\overrightarrow{AC}$ (parallel *and* sharing the point $A$)."
    ] },
    { worked: { tag: "example", title: "$\\overrightarrow{AB}$ and its length from two position vectors", src: "AS June 2018 · P1 Q3 · 4 marks",
      q: "$A$ has position vector $4\\mathbf{i} - 5\\mathbf{j}$ and $B$ has position vector $-5\\mathbf{i} - 2\\mathbf{j}$. **(a)** Find $\\overrightarrow{AB}$. **(b)** Find $|\\overrightarrow{AB}|$ as a simplified surd.",
      steps: [
        { h: "(a) End minus start", m: "$\\overrightarrow{AB} = \\mathbf{b} - \\mathbf{a} = (-5 - 4)\\mathbf{i} + (-2 - (-5))\\mathbf{j} = -9\\mathbf{i} + 3\\mathbf{j}$", mk: "M1 A1", n: "Subtract each component: $x$ then $y$. $-2 - (-5) = 3$." },
        { h: "(b)", m: "$|\\overrightarrow{AB}| = \\sqrt{(-9)^2 + 3^2} = \\sqrt{90} = 3\\sqrt{10}$", mk: "M1 A1", n: "$90 = 9 \\times 10$. \"Simplified surd\" means pull out the square factor." }
      ], result: "$-9\\mathbf{i} + 3\\mathbf{j}$; $3\\sqrt{10}$" } },
    { worked: { tag: "exam", title: "Third side of a triangle, its length, and a point dividing a side in a ratio", src: "AS June 2022 · P1 Q3 · 6 marks",
      q: "Triangle $PQR$ has $\\overrightarrow{PQ} = 3\\mathbf{i} + 5\\mathbf{j}$ and $\\overrightarrow{PR} = 13\\mathbf{i} - 15\\mathbf{j}$. **(a)** Find $\\overrightarrow{QR}$. **(b)** Hence find $|\\overrightarrow{QR}|$ as a simplified surd. **(c)** $S$ lies on $QR$ with $QS : SR = 3 : 2$. Find $\\overrightarrow{PS}$.",
      steps: [
        { h: "(a) Route via $P$", m: "$\\overrightarrow{QR} = \\overrightarrow{QP} + \\overrightarrow{PR} = -(3\\mathbf{i} + 5\\mathbf{j}) + (13\\mathbf{i} - 15\\mathbf{j}) = 10\\mathbf{i} - 20\\mathbf{j}$", mk: "M1 A1", n: "\"Go back along $PQ$, then along $PR$.\" Equivalently $\\overrightarrow{PR} - \\overrightarrow{PQ}$." },
        { h: "(b)", m: "$|\\overrightarrow{QR}| = \\sqrt{10^2 + 20^2} = \\sqrt{500} = 10\\sqrt5$", mk: "M1 A1" },
        { h: "(c) $S$ is $\\frac35$ of the way from $Q$ to $R$", m: "$\\overrightarrow{QS} = \\tfrac35\\overrightarrow{QR} = 6\\mathbf{i} - 12\\mathbf{j}$\n$\\overrightarrow{PS} = \\overrightarrow{PQ} + \\overrightarrow{QS} = 3\\mathbf{i} + 5\\mathbf{j} + 6\\mathbf{i} - 12\\mathbf{j} = 9\\mathbf{i} - 7\\mathbf{j}$", mk: "M1 A1", n: "Ratio $3 : 2$ means $S$ is $\\frac{3}{3 + 2}$ along from $Q$. The denominator is the *sum* of the ratio parts.", fig: { x: [-1, 15], y: [-16, 7], aspect: "equal", axes: { xt: [5, 10], yt: [-10, -5, 5] }, items: [
          { vec: [[0, 0], [3, 5]], label: "PQ", c: "accent" }, { vec: [[0, 0], [13, -15]], label: "PR", c: "accent" },
          { vec: [[3, 5], [13, -15]], label: "QR", c: "accent2" }, { vec: [[0, 0], [9, -7]], label: "PS", c: "danger" },
          { pt: [0, 0], label: "P", pos: "w" }, { pt: [3, 5], label: "Q", pos: "n" }, { pt: [13, -15], label: "R", pos: "e" }, { pt: [9, -7], label: "S", pos: "e" }
        ] } }
      ], result: "$10\\mathbf{i} - 20\\mathbf{j}$; $10\\sqrt5$; $9\\mathbf{i} - 7\\mathbf{j}$" } },

    { page: "Three dimensions" },
    { p: "Nothing changes except a third component. Add, subtract and scale component by component; the magnitude gains a third square (10.2)." },
    { kv: [
      ["Position vector of $(x, y, z)$", "$x\\mathbf{i} + y\\mathbf{j} + z\\mathbf{k}$"],
      ["$\\overrightarrow{AB}$", "$(b_1 - a_1)\\mathbf{i} + (b_2 - a_2)\\mathbf{j} + (b_3 - a_3)\\mathbf{k}$"],
      ["Missing component", "$4\\mathbf{j} + 6\\mathbf{k}$ has $x$-component 0: write it as $0\\mathbf{i} + 4\\mathbf{j} + 6\\mathbf{k}$ before subtracting."],
      ["Parallel in 3D", "Every component in the same ratio: $(-20, 35, 5) = 5(-4, 7, 1)$."]
    ] },
    { worked: { tag: "exam", title: "Find $\\overrightarrow{AB}$; show $OABC$ is a trapezium (3D)", src: "A-level Oct 2020 · P1 Q3 · 4 marks",
      q: "$A$: $2\\mathbf{i} + 5\\mathbf{j} - 6\\mathbf{k}$, $B$: $3\\mathbf{i} - 3\\mathbf{j} - 4\\mathbf{k}$, $C$: $2\\mathbf{i} - 16\\mathbf{j} + 4\\mathbf{k}$. **(a)** Find $\\overrightarrow{AB}$. **(b)** Show that quadrilateral $OABC$ is a trapezium, giving reasons.",
      steps: [
        { h: "(a)", m: "$\\overrightarrow{AB} = (3 - 2)\\mathbf{i} + (-3 - 5)\\mathbf{j} + (-4 + 6)\\mathbf{k} = \\mathbf{i} - 8\\mathbf{j} + 2\\mathbf{k}$", mk: "M1 A1" },
        { h: "(b) Compare with $\\overrightarrow{OC}$", m: "$\\overrightarrow{OC} = 2\\mathbf{i} - 16\\mathbf{j} + 4\\mathbf{k} = 2\\overrightarrow{AB}$", mk: "M1", n: "A trapezium needs one pair of parallel sides. The sides of $OABC$ are $OA$, $AB$, $BC$, $CO$ — test $AB$ against $OC$." },
        { m: "So $OC \\parallel AB$ (scalar multiple) and $|OC| = 2|AB| \\ne |AB|$: one pair of parallel sides of different lengths, hence a trapezium (not a parallelogram).", mk: "A1", n: "Both reasons: *parallel* (the multiple) and *not equal in length* (so not a parallelogram)." }
      ], result: "$\\mathbf{i} - 8\\mathbf{j} + 2\\mathbf{k}$; $OC = 2AB$" } },
    { worked: { tag: "variation", title: "The 2D version", src: "AS Specimen · P1 Q2 · 4 marks",
      q: "$\\overrightarrow{OA} = 4\\mathbf{i} + 2\\mathbf{j}$, $\\overrightarrow{OB} = 6\\mathbf{i} - 3\\mathbf{j}$, $\\overrightarrow{OC} = 8\\mathbf{i} - 20\\mathbf{j}$. **(a)** Find $\\overrightarrow{AB}$. **(b)** Show $OABC$ is a trapezium.",
      steps: [
        { m: "$\\overrightarrow{AB} = 2\\mathbf{i} - 5\\mathbf{j}$", mk: "M1 A1" },
        { m: "$\\overrightarrow{OC} = 8\\mathbf{i} - 20\\mathbf{j} = 4\\overrightarrow{AB}$, so $OC \\parallel AB$ with $OC \\ne AB$: a trapezium.", mk: "M1 A1" }
      ], result: "$OC = 4AB$" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command", "What they want", "Marks"], rows: [
      ["Find $\\overrightarrow{AB}$", "$\\mathbf{b} - \\mathbf{a}$, components shown", "M1 A1"],
      ["Show $OABC$ is a trapezium", "One side a scalar multiple of another, and not equal length", "M1 A1"],
      ["Find $\\overrightarrow{PS}$ where $QS : SR = m : n$", "$\\overrightarrow{PS} = \\overrightarrow{PQ} + \\frac{m}{m + n}\\overrightarrow{QR}$", "M1 A1"],
      ["Show $A$, $B$, $C$ collinear", "$\\overrightarrow{AB} = \\lambda\\overrightarrow{AC}$ (or $\\overrightarrow{BC}$) with the common point named", "M1 A1"]
    ] } },
    { kv: [
      ["Underline", "Handwritten vectors are underlined; $\\mathbf{i}$, $\\mathbf{j}$, $\\mathbf{k}$ too. Column vectors need no underline."],
      ["Order", "$\\overrightarrow{AB}$ starts at $A$. Reversing the order negates the vector and usually costs the A mark."],
      ["Route-finding", "Any path between two points gives the same vector: $\\overrightarrow{QR} = \\overrightarrow{QP} + \\overrightarrow{PR}$. Write the route, then substitute."],
      ["fx-991CW", "Vector mode (Menu → Vector) stores up to four vectors and adds/subtracts/scales; magnitude via **Abs**. Fine for checking, but show the components in your working."]
    ] },
    { callout: { t: "mnemonic", h: "\"End minus start\"", body: "$\\overrightarrow{AB} = \\mathbf{b} - \\mathbf{a}$: the vector to the **end** minus the vector to the **start**." } },
    { ul: [
      "**Misconception:** $\\overrightarrow{AB} = \\mathbf{a} - \\mathbf{b}$. That is $\\overrightarrow{BA}$.",
      "**Misconception:** \"parallel\" proved by \"the gradients look similar\". It must be an exact scalar multiple, shown.",
      "**Misconception:** $QS : SR = 3 : 2 \\Rightarrow \\overrightarrow{QS} = \\frac32\\overrightarrow{QR}$. It is $\\frac35$."
    ] }
  ],
  flashcards: [
    ["$\\overrightarrow{AB}$ in terms of position vectors?", "$\\mathbf{b} - \\mathbf{a}$ (end minus start)."],
    ["Parallel vectors?", "One is a scalar multiple of the other."],
    ["$A$, $B$, $C$ collinear — test?", "$\\overrightarrow{AB} = \\lambda\\overrightarrow{AC}$."],
    ["$QS : SR = 3 : 2$: $\\overrightarrow{QS} =$?", "$\\frac35\\overrightarrow{QR}$."],
    ["Trapezium test with vectors?", "One pair of opposite sides parallel (scalar multiple), not equal in length."],
    ["Handwritten vector convention?", "Underline it."]
  ],
  quiz: [
    { q: "$\\mathbf{a} = 2\\mathbf{i} - \\mathbf{j}$, $\\mathbf{b} = -\\mathbf{i} + 4\\mathbf{j}$: $\\overrightarrow{AB} =$", opts: ["$-3\\mathbf{i} + 5\\mathbf{j}$", "$3\\mathbf{i} - 5\\mathbf{j}$", "$\\mathbf{i} + 3\\mathbf{j}$", "$-2\\mathbf{i} - 4\\mathbf{j}$"], ans: 0, why: "$\\mathbf{b} - \\mathbf{a}$." },
    { q: "Which is parallel to $2\\mathbf{i} - 6\\mathbf{j} + 4\\mathbf{k}$?", opts: ["$-\\mathbf{i} + 3\\mathbf{j} - 2\\mathbf{k}$", "$2\\mathbf{i} + 6\\mathbf{j} + 4\\mathbf{k}$", "$\\mathbf{i} - 3\\mathbf{j} + 4\\mathbf{k}$", "$4\\mathbf{i} - 6\\mathbf{j} + 8\\mathbf{k}$"], ans: 0, why: "$-\\frac12$ times the vector." },
    { q: "$\\overrightarrow{PQ} = \\mathbf{u}$, $\\overrightarrow{PR} = \\mathbf{v}$: $\\overrightarrow{QR} =$", opts: ["$\\mathbf{v} - \\mathbf{u}$", "$\\mathbf{u} - \\mathbf{v}$", "$\\mathbf{u} + \\mathbf{v}$", "$-\\mathbf{u} - \\mathbf{v}$"], ans: 0, why: "$\\overrightarrow{QP} + \\overrightarrow{PR}$." },
    { q: "$S$ on $QR$ with $QS : SR = 1 : 3$. $\\overrightarrow{QS} =$", opts: ["$\\frac14\\overrightarrow{QR}$", "$\\frac13\\overrightarrow{QR}$", "$\\frac34\\overrightarrow{QR}$", "$3\\overrightarrow{QR}$"], ans: 0, why: "One part out of four." }
  ]
};

/* =====================================================================
   10.2  Magnitude and direction
   ===================================================================== */
C["maths:10.2"] = {
  notes: [
    { h: "Magnitude" },
    { callout: { t: "memorise", h: "Length of a vector — Pythagoras", body: [
      "$$|x\\mathbf{i} + y\\mathbf{j}| = \\sqrt{x^2 + y^2} \\qquad |x\\mathbf{i} + y\\mathbf{j} + z\\mathbf{k}| = \\sqrt{x^2 + y^2 + z^2}$$",
      "The distance between $A$ and $B$ is $|\\overrightarrow{AB}| = |\\mathbf{b} - \\mathbf{a}|$ (10.4). Leave it as a simplified surd unless a decimal is asked."
    ] } },
    { callout: { t: "def", h: "Unit vector", body: [
      "$$\\hat{\\mathbf{a}} = \\dfrac{\\mathbf{a}}{|\\mathbf{a}|}$$ — same direction as $\\mathbf{a}$, length 1.",
      "A vector of length $L$ in the direction of $\\mathbf{a}$ is $L\\hat{\\mathbf{a}} = \\frac{L}{|\\mathbf{a}|}\\mathbf{a}$. This is how \"$\\overrightarrow{AX}$ has the same direction as $\\overrightarrow{AB}$ and $|\\overrightarrow{AX}| = 10\\sqrt2$\" is done (10.5)."
    ] } },
    { worked: { tag: "exam", title: "Show $|\\overrightarrow{OA}| = \\sqrt{38}$; smallest integer $a$ with $|\\overrightarrow{OB}| > |\\overrightarrow{OA}|$", src: "A-level June 2023 · P1 Q3 · 3 marks",
      q: "$A$: $5\\mathbf{i} + 3\\mathbf{j} + 2\\mathbf{k}$; $B$: $2\\mathbf{i} + 4\\mathbf{j} + a\\mathbf{k}$, $a$ a positive integer. **(a)** Show $|\\overrightarrow{OA}| = \\sqrt{38}$. **(b)** Find the smallest $a$ for which $|\\overrightarrow{OB}| > |\\overrightarrow{OA}|$.",
      steps: [
        { h: "(a)", m: "$|\\overrightarrow{OA}| = \\sqrt{5^2 + 3^2 + 2^2} = \\sqrt{25 + 9 + 4} = \\sqrt{38}$", mk: "B1*", n: "Show the three squares." },
        { h: "(b) Compare squares", m: "$4 + 16 + a^2 > 38 \\Rightarrow a^2 > 18 \\Rightarrow a > \\sqrt{18} = 4.24\\ldots$", mk: "M1", n: "Square both sides to avoid roots; $a > 0$ so only the positive branch matters." },
        { m: "Smallest positive integer: $a = 5$", mk: "A1", n: "Check: $a = 4$ gives $\\sqrt{36} < \\sqrt{38}$; $a = 5$ gives $\\sqrt{45} > \\sqrt{38}$ ✓." }
      ], result: "$a = 5$" } },

    { page: "Direction — angles and bearings" },
    { fig: { x: [-0.5, 6], y: [-0.5, 4.5], aspect: "equal", axes: { xt: [1, 2, 3, 4, 5], yt: [1, 2, 3, 4] }, items: [
      { vec: [[0, 0], [5, 3]], label: "a = 5i + 3j", c: "accent" },
      { line: [[5, 0], [5, 3]], c: "muted", dash: true, label: "3", loff: 12 }, { line: [[0, 0], [5, 0]], c: "muted", dash: true },
      { text: [2.5, -0.35], t: "5", c: "text2", size: 11 },
      { arc: [0, 0, 34, 0, 31], label: "θ", c: "accent2" }
    ], cap: "$\\tan\\theta = \\frac{3}{5}$ gives $\\theta = 31.0°$ above the $\\mathbf{i}$ direction; $|\\mathbf{a}| = \\sqrt{34}$. Conversely, a vector of magnitude $r$ at angle $\\theta$ to $\\mathbf{i}$ is $r\\cos\\theta\\,\\mathbf{i} + r\\sin\\theta\\,\\mathbf{j}$." } },
    { kv: [
      ["Angle with the $x$-axis ($\\mathbf{i}$)", "$\\tan\\theta = \\frac{y}{x}$. **Draw the vector** to place the angle in the right quadrant; the calculator's $\\tan^{-1}$ only gives $(-90°, 90°)$."],
      ["Component form → magnitude/direction", "$r = \\sqrt{x^2 + y^2}$, $\\theta = \\tan^{-1}\\frac{y}{x}$ adjusted by the quadrant."],
      ["Magnitude/direction → component form", "$x = r\\cos\\theta$, $y = r\\sin\\theta$ with $\\theta$ measured from $\\mathbf{i}$ anticlockwise."],
      ["Bearing", "Clockwise from north ($\\mathbf{j}$), three figures. For $-7\\mathbf{i} - 3\\mathbf{j}$: the vector points into the south-west quadrant; bearing $= 180° + \\tan^{-1}\\frac73 = 246.8°$."],
      ["Angle between two vectors", "Not in this spec by scalar product — use the **cosine rule** on the triangle they form, or compare their direction angles in 2D (next page). A correct scalar-product method is accepted but not expected."]
    ] },
    { worked: { tag: "exam", title: "Bearing and speed of a boat from two positions", src: "AS June 2020 · P1 Q2 · 6 marks",
      q: "[$\\mathbf{i}$ east, $\\mathbf{j}$ north.] At 10:00 a boat is at $(4\\mathbf{i} - 2\\mathbf{j})$ km; at 12:45 it is at $(-3\\mathbf{i} - 5\\mathbf{j})$ km, moving in a straight line at constant speed. **(a)** Find the bearing on which it moves, to 1 d.p. **(b)** Find its speed in km h$^{-1}$.",
      steps: [
        { h: "(a) Displacement", m: "$(-3\\mathbf{i} - 5\\mathbf{j}) - (4\\mathbf{i} - 2\\mathbf{j}) = -7\\mathbf{i} - 3\\mathbf{j}$", mk: "M1", n: "End minus start. West 7, south 3: the south-west quadrant.", fig: { x: [-8, 5], y: [-6, 2], aspect: "equal", axes: { xt: [-6, -3, 3], yt: [-4, -2, 1] }, items: [
          { pt: [4, -2], label: "10:00", pos: "e" }, { pt: [-3, -5], label: "12:45", pos: "w" },
          { vec: [[4, -2], [-3, -5]], label: "−7i − 3j", c: "accent" },
          { line: [[4, -2], [4, 1.5]], c: "muted", dash: true, label: "N", lpos: 1, loff: -10 }, { line: [[4, -2], [-3, -2]], c: "muted", dash: true },
          { arc: [4, -2, 26, 203, 90], label: "bearing", c: "accent2", loff: 16 }
        ] } },
        { m: "$\\tan^{-1}\\dfrac{7}{3} = 66.8°$ below west; bearing $= 180° + 66.8° = 246.8°$", mk: "M1 A1", n: "Clockwise from north: $90°$ to west + $180°$… simplest is *south* ($180°$) then turn $66.8°$ further clockwise. Draw it." },
        { h: "(b) Distance and time", m: "$|{-7\\mathbf{i} - 3\\mathbf{j}}| = \\sqrt{49 + 9} = \\sqrt{58} = 7.616$ km; time $= 2$ h $45$ min $= 2.75$ h", mk: "M1 B1", n: "12:45 − 10:00. Minutes must become a decimal hour: $45/60 = 0.75$." },
        { m: "Speed $= \\dfrac{\\sqrt{58}}{2.75} = 2.77$ km h$^{-1}$", mk: "A1" }
      ], result: "$246.8°$; $2.77$ km h$^{-1}$" } },
    { worked: { tag: "exam", title: "Prove a moving stone passes through $O$; find its speed", src: "AS Nov 2021 · P1 Q4 · 5 marks",
      q: "A stone is at $A(-24\\mathbf{i} - 10\\mathbf{j})$ m and 4 s later at $B(12\\mathbf{i} + 5\\mathbf{j})$ m, moving in a straight line at constant speed. **(a)** Prove the stone passes through $O$. **(b)** Find its speed.",
      steps: [
        { h: "(a) Show $O$ is on line $AB$", m: "$\\overrightarrow{AB} = 36\\mathbf{i} + 15\\mathbf{j} = 3(12\\mathbf{i} + 5\\mathbf{j})$ and $\\overrightarrow{AO} = 24\\mathbf{i} + 10\\mathbf{j} = 2(12\\mathbf{i} + 5\\mathbf{j})$", mk: "M1", n: "Two vectors from the same point $A$." },
        { m: "$\\overrightarrow{AO} = \\tfrac23\\overrightarrow{AB}$: parallel and share $A$, so $O$ lies on $AB$ — between $A$ and $B$ since $0 < \\tfrac23 < 1$ — hence the stone passes through $O$.", mk: "A1", n: "\"Passes through\" needs $O$ *between* $A$ and $B$: the fraction is in $(0, 1)$." },
        { h: "(b)", m: "$|\\overrightarrow{AB}| = \\sqrt{36^2 + 15^2} = \\sqrt{1521} = 39$ m; speed $= \\dfrac{39}{4} = 9.75$ m s$^{-1}$", mk: "M1 A1 A1" }
      ], result: "$\\overrightarrow{AO} = \\frac23\\overrightarrow{AB}$; $9.75$ m s$^{-1}$" } },

    { page: "Angles inside triangles — cosine rule, sine rule" },
    { p: "With $\\overrightarrow{AB}$ and $\\overrightarrow{AC}$ known you know all three side lengths of triangle $ABC$ ($|\\overrightarrow{BC}| = |\\overrightarrow{AC} - \\overrightarrow{AB}|$). Then any angle is a cosine-rule calculation (5.1)." },
    { worked: { tag: "exam", title: "$|\\overrightarrow{OB}|$ exactly, then angle $OAB$", src: "AS June 2025 · P1 Q3 · 6 marks",
      q: "$A$ is $(3, -8)$ and $\\overrightarrow{AB} = -5\\mathbf{i} + 2\\mathbf{j}$. **(a)** Find the exact value of $|\\overrightarrow{OB}|$. **(b)** Find angle $OAB$ to 1 d.p.",
      steps: [
        { h: "(a)", m: "$\\overrightarrow{OB} = \\overrightarrow{OA} + \\overrightarrow{AB} = (3 - 5)\\mathbf{i} + (-8 + 2)\\mathbf{j} = -2\\mathbf{i} - 6\\mathbf{j}$\n$|\\overrightarrow{OB}| = \\sqrt{4 + 36} = \\sqrt{40} = 2\\sqrt{10}$", mk: "M1 M1 A1" },
        { h: "(b) Three sides, cosine rule at $A$", m: "$OA = \\sqrt{9 + 64} = \\sqrt{73}$, $AB = \\sqrt{25 + 4} = \\sqrt{29}$, $OB = \\sqrt{40}$\n$\\cos A = \\dfrac{73 + 29 - 40}{2\\sqrt{73}\\sqrt{29}} = \\dfrac{62}{2\\sqrt{2117}} = 0.6738\\ldots$", mk: "M1 A1", n: "The angle at $A$ is opposite side $OB$. Squares of the surds are the integers under the roots — no rounding until the end.", fig: { x: [-4, 5], y: [-9.5, 1], aspect: "equal", axes: { xt: [-2, 3], yt: [-8, -6] }, items: [
          { poly: [[0, 0], [3, -8], [-2, -6]], c: "muted", fill: "accent", alpha: 0.05 },
          { vec: [[3, -8], [-2, -6]], label: "AB", c: "accent" }, { vec: [[0, 0], [3, -8]], label: "OA", c: "accent2" }, { vec: [[0, 0], [-2, -6]], label: "OB", c: "danger" },
          { pt: [0, 0], label: "O", pos: "n" }, { pt: [3, -8], label: "A(3, −8)", pos: "e" }, { pt: [-2, -6], label: "B(−2, −6)", pos: "w" },
          { arc: [3, -8, 30, 110, 158], label: "OAB", c: "accent2", loff: 18 }
        ] } },
        { m: "$\\angle OAB = 47.6°$", mk: "A1", n: "Alternative: the directions of $\\overrightarrow{AO} = -3\\mathbf{i} + 8\\mathbf{j}$ ($110.6°$) and $\\overrightarrow{AB}$ ($158.2°$) differ by $47.6°$." }
      ], result: "$2\\sqrt{10}$; $47.6°$" } },
    { worked: { tag: "exam", title: "$|\\mathbf{a} + \\mathbf{b}| = |\\mathbf{a}| + |\\mathbf{b}|$ geometrically; an angle by the sine rule", src: "AS June 2019 · P1 Q16 · 5 marks",
      q: "**(i)** Non-zero $\\mathbf{a}$, $\\mathbf{b}$ satisfy $|\\mathbf{a} + \\mathbf{b}| = |\\mathbf{a}| + |\\mathbf{b}|$. Explain geometrically the significance. **(ii)** $|\\mathbf{m}| = 3$, $|\\mathbf{m} - \\mathbf{n}| = 6$ and the angle between $\\mathbf{m}$ and $\\mathbf{n}$ is $30°$. Find the angle between $\\mathbf{m}$ and $\\mathbf{m} - \\mathbf{n}$ to 1 d.p.",
      steps: [
        { h: "(i)", m: "$\\mathbf{a}$ and $\\mathbf{b}$ are parallel and in the same direction (the triangle inequality is an equality only when the triangle is flat).", mk: "B1", n: "\"Parallel\" alone is not enough — opposite directions give $|\\mathbf{a} + \\mathbf{b}| = \\big||\\mathbf{a}| - |\\mathbf{b}|\\big|$." },
        { h: "(ii) Draw the triangle", m: "Triangle $OMN$ with $\\overrightarrow{OM} = \\mathbf{m}$ (length 3), $\\overrightarrow{ON} = \\mathbf{n}$, $\\overrightarrow{NM} = \\mathbf{m} - \\mathbf{n}$ (length 6), angle $O = 30°$.", mk: "M1", n: "The angle between $\\mathbf{m}$ and $\\mathbf{m} - \\mathbf{n}$ is the interior angle at $M$ (both arrows meet at $M$).", fig: { w: 400, h: 220, items: [
          { poly: [[40, 180], [280, 180], [318, 60]], c: "muted" },
          { vec: [[40, 180], [280, 180]], label: "m (3)", c: "accent" }, { vec: [[40, 180], [318, 60]], label: "n", c: "accent2", loff: -12 }, { vec: [[318, 60], [280, 180]], label: "m − n (6)", c: "danger", loff: -14 },
          { pt: [40, 180], label: "O", pos: "sw" }, { pt: [280, 180], label: "M", pos: "se" }, { pt: [318, 60], label: "N", pos: "ne" },
          { arc: [40, 180, 40, 0, 23], label: "30°", c: "muted", loff: 14 }, { arc: [280, 180, 30, 73, 180], label: "?", c: "danger", loff: 12 }
        ] } },
        { h: "Sine rule for angle $N$", m: "$\\dfrac{\\sin N}{3} = \\dfrac{\\sin 30°}{6} \\Rightarrow \\sin N = \\tfrac14 \\Rightarrow N = 14.48°$", mk: "M1 A1", n: "$N$ is opposite $OM = 3$; $O$ is opposite $NM = 6$. $N$ must be acute ($30° + 165.5° > 180°$)." },
        { m: "$M = 180° - 30° - 14.48° = 135.5°$", mk: "A1" }
      ], result: "Same direction; $135.5°$" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command", "What they want", "Marks"], rows: [
      ["Find $|\\overrightarrow{AB}|$ as a simplified surd", "$\\sqrt{x^2 + y^2 (+ z^2)}$ then extract square factors", "M1 A1"],
      ["Find the unit vector in the direction of $\\mathbf{a}$", "$\\mathbf{a}/|\\mathbf{a}|$", "M1 A1"],
      ["Find the bearing", "Displacement; $\\tan^{-1}$; adjust for quadrant; clockwise from north", "M1 M1 A1"],
      ["Find the speed", "$|\\text{displacement}| / \\text{time}$ with matching units", "M1 A1"],
      ["Find angle $OAB$", "Three side lengths; cosine rule at the named vertex", "M1 A1 A1"],
      ["Explain geometrically", "Parallel + same direction / flat triangle", "B1"]
    ] } },
    { kv: [
      ["Which vertex", "Angle $OAB$ is at $A$ (the middle letter). Use the two vectors *from* $A$."],
      ["Quadrants", "Sketch every direction question. $\\tan^{-1}$ of a negative ratio is negative — add $180°$ or $360°$ as the sketch shows."],
      ["Units", "km and hours → km h$^{-1}$; m and seconds → m s$^{-1}$. Convert minutes to decimal hours first."],
      ["fx-991CW", "**Pol(** $x, y$ **)** converts components to $(r, \\theta)$ with the quadrant handled; **Rec(** $r, \\theta$ **)** goes back. Radians/degrees mode applies."]
    ] },
    { callout: { t: "mnemonic", h: "\"Root of the sum of the squares\"", body: "Magnitude is always Pythagoras; a third component is just a third square under the root." } },
    { ul: [
      "**Misconception:** $|\\mathbf{a} + \\mathbf{b}| = |\\mathbf{a}| + |\\mathbf{b}|$ in general. Only when they point the same way.",
      "**Misconception:** bearing $= \\tan^{-1}(y/x)$. Bearings are from north, clockwise; the calculator angle is from east, anticlockwise.",
      "**Misconception:** using $\\sqrt{x^2 - y^2}$ or forgetting to square a negative component."
    ] }
  ],
  flashcards: [
    ["$|x\\mathbf{i} + y\\mathbf{j} + z\\mathbf{k}| =$?", "$\\sqrt{x^2 + y^2 + z^2}$."],
    ["Unit vector in the direction of $\\mathbf{a}$?", "$\\mathbf{a}/|\\mathbf{a}|$."],
    ["Vector of magnitude $r$ at angle $\\theta$ to $\\mathbf{i}$?", "$r\\cos\\theta\\,\\mathbf{i} + r\\sin\\theta\\,\\mathbf{j}$."],
    ["Bearing of $-7\\mathbf{i} - 3\\mathbf{j}$?", "$180° + \\tan^{-1}\\frac73 = 246.8°$."],
    ["Angle between two vectors in A-level Maths — method?", "Cosine rule on the triangle of the three lengths (no scalar product needed)."],
    ["$|\\mathbf{a} + \\mathbf{b}| = |\\mathbf{a}| + |\\mathbf{b}|$ means?", "Same direction (parallel, $\\lambda > 0$)."]
  ],
  quiz: [
    { q: "$|3\\mathbf{i} - 4\\mathbf{j} + 12\\mathbf{k}| =$", opts: ["13", "$\\sqrt{19}$", "11", "$\\sqrt{169} - 1$"], ans: 0, why: "$9 + 16 + 144 = 169$." },
    { q: "Unit vector in the direction of $6\\mathbf{i} - 8\\mathbf{j}$:", opts: ["$0.6\\mathbf{i} - 0.8\\mathbf{j}$", "$6\\mathbf{i} - 8\\mathbf{j}$", "$\\frac{1}{14}(6\\mathbf{i} - 8\\mathbf{j})$", "$0.8\\mathbf{i} - 0.6\\mathbf{j}$"], ans: 0, why: "Divide by 10." },
    { q: "Bearing of $3\\mathbf{i} - 3\\mathbf{j}$ ($\\mathbf{j}$ north)?", opts: ["135°", "045°", "225°", "315°"], ans: 0, why: "South-east." },
    { q: "Magnitude 10 at $60°$ to $\\mathbf{i}$:", opts: ["$5\\mathbf{i} + 5\\sqrt3\\mathbf{j}$", "$5\\sqrt3\\mathbf{i} + 5\\mathbf{j}$", "$10\\mathbf{i} + 60\\mathbf{j}$", "$6\\mathbf{i} + 8\\mathbf{j}$"], ans: 0, why: "$10\\cos 60°$, $10\\sin 60°$." }
  ]
};

/* =====================================================================
   10.3  Vector addition, scalar multiples and geometric proof
   ===================================================================== */
C["maths:10.3"] = {
  notes: [
    { h: "Adding vectors — triangle and parallelogram laws" },
    { fig: { w: 460, h: 230, items: [
      { vec: [[30, 190], [190, 190]], label: "a", c: "accent" }, { vec: [[190, 190], [260, 60]], label: "b", c: "accent2" }, { vec: [[30, 190], [260, 60]], label: "a + b", c: "danger", loff: -14 },
      { text: [140, 30], t: "triangle law: nose to tail", size: 12, c: "text2" },
      { vec: [[300, 190], [430, 190]], label: "a", c: "accent" }, { vec: [[300, 190], [360, 80]], label: "b", c: "accent2", loff: -12 },
      { line: [[430, 190], [490, 80]], c: "accent2", dash: true }, { line: [[360, 80], [490, 80]], c: "accent", dash: true },
      { vec: [[300, 190], [490, 80]], label: "a + b", c: "danger", loff: 14 },
      { text: [400, 30], t: "parallelogram law", size: 12, c: "text2" }
    ], cap: "Triangle law: place $\\mathbf{b}$ at the tip of $\\mathbf{a}$; the sum runs from the start of $\\mathbf{a}$ to the tip of $\\mathbf{b}$. Parallelogram law: the same sum as the diagonal from the common tail. $\\mathbf{a} - \\mathbf{b}$ is the *other* diagonal (from the tip of $\\mathbf{b}$ to the tip of $\\mathbf{a}$)." } },
    { kv: [
      ["$\\lambda\\mathbf{a}$", "Same line as $\\mathbf{a}$, $|\\lambda|$ times as long; reversed if $\\lambda < 0$."],
      ["$\\mathbf{a} + \\mathbf{b} = \\mathbf{b} + \\mathbf{a}$", "Both diagonals of the parallelogram construction agree — order does not matter."],
      ["$\\mathbf{a} - \\mathbf{b} = \\mathbf{a} + (-\\mathbf{b})$", "Add the reverse of $\\mathbf{b}$."],
      ["Midpoint of $AB$", "$\\overrightarrow{OM} = \\tfrac12(\\mathbf{a} + \\mathbf{b})$."],
      ["Point dividing $AB$ in ratio $m : n$", "$\\overrightarrow{OP} = \\mathbf{a} + \\frac{m}{m + n}(\\mathbf{b} - \\mathbf{a}) = \\frac{n\\mathbf{a} + m\\mathbf{b}}{m + n}$."]
    ] },
    { worked: { tag: "exam", title: "$Q$ one third of the way from $P$ to $R$", src: "A-level Oct 2020 · P2 Q2 · 3 marks",
      q: "$P$, $Q$, $R$ have position vectors $\\mathbf{p}$, $\\mathbf{q}$, $\\mathbf{r}$; they are collinear and $Q$ lies one third of the way from $P$ to $R$. Show that $\\mathbf{q} = \\frac13(2\\mathbf{p} + \\mathbf{r})$.",
      steps: [
        { m: "$\\overrightarrow{PQ} = \\tfrac13\\overrightarrow{PR} = \\tfrac13(\\mathbf{r} - \\mathbf{p})$", mk: "M1 A1", n: "\"One third of the way from $P$\" is the vector statement." },
        { m: "$\\mathbf{q} = \\mathbf{p} + \\overrightarrow{PQ} = \\mathbf{p} + \\tfrac13\\mathbf{r} - \\tfrac13\\mathbf{p} = \\tfrac23\\mathbf{p} + \\tfrac13\\mathbf{r} = \\tfrac13(2\\mathbf{p} + \\mathbf{r})$", mk: "A1*", n: "Position vector of $Q$ = position of $P$ plus the displacement." }
      ], result: "$\\mathbf{q} = \\frac13(2\\mathbf{p} + \\mathbf{r})$" } },

    { page: "Geometric proofs with a and b" },
    { p: "The classic A-level vector proof: a triangle or quadrilateral is described with two base vectors $\\mathbf{a}$, $\\mathbf{b}$; you express other vectors in terms of them and find a ratio or prove parallel/collinear. The method is always the same:" },
    { steps: [
      "Write every vector you can in terms of $\\mathbf{a}$ and $\\mathbf{b}$ by **route-finding** (e.g. $\\overrightarrow{CM} = \\overrightarrow{CO} + \\overrightarrow{OM}$).",
      "For a point on a line you do not yet know, introduce a **parameter**: $\\overrightarrow{ON} = \\overrightarrow{OC} + \\lambda\\overrightarrow{CM}$.",
      "Use the second fact about the point (it lies on $OB$, so its $\\mathbf{a}$-component is 0; or it equals another parametrised expression) to **compare coefficients** of $\\mathbf{a}$ and $\\mathbf{b}$ — valid because $\\mathbf{a}$, $\\mathbf{b}$ are not parallel.",
      "Solve for the parameter(s); read off the ratio."
    ] },
    { worked: { tag: "exam", title: "Line through $C$ and $M$ cuts $OB$ at $N$: prove $ON : NB = 2 : 1$", src: "A-level June 2019 · P2 Q10 · 6 marks",
      q: "Triangle $OAB$; $\\overrightarrow{OC} = 2\\overrightarrow{OA}$; $M$ is the midpoint of $AB$; the line through $C$ and $M$ cuts $OB$ at $N$. $\\overrightarrow{OA} = \\mathbf{a}$, $\\overrightarrow{OB} = \\mathbf{b}$. **(a)** Find $\\overrightarrow{CM}$ in terms of $\\mathbf{a}$ and $\\mathbf{b}$. **(b)** Show $\\overrightarrow{ON} = \\left(2 - \\frac{3}{2}\\lambda\\right)\\mathbf{a} + \\frac12\\lambda\\mathbf{b}$. **(c)** Hence prove $ON : NB = 2 : 1$.",
      steps: [
        { h: "(a) Route $C \\to O \\to M$", m: "$\\overrightarrow{OM} = \\tfrac12(\\mathbf{a} + \\mathbf{b})$\n$\\overrightarrow{CM} = -2\\mathbf{a} + \\tfrac12(\\mathbf{a} + \\mathbf{b}) = -\\tfrac32\\mathbf{a} + \\tfrac12\\mathbf{b}$", mk: "M1 A1", fig: { w: 400, h: 240, items: [
          { poly: [[40, 220], [160, 220], [100, 50]], c: "muted" }, { line: [[160, 220], [280, 220]], c: "muted" }, { line: [[280, 220], [80, 106.7]], c: "accent2", dash: true },
          { vec: [[40, 220], [160, 220]], label: "a", c: "accent" }, { vec: [[40, 220], [100, 50]], label: "b", c: "accent", loff: -12 },
          { pt: [40, 220], label: "O", pos: "sw" }, { pt: [160, 220], label: "A", pos: "s" }, { pt: [280, 220], label: "C", pos: "se" }, { pt: [100, 50], label: "B", pos: "n" },
          { pt: [130, 135], label: "M", pos: "e", c: "accent2" }, { pt: [80, 106.7], label: "N", pos: "w", c: "danger" }
        ], cap: "$OC = 2OA$; $M$ midpoint of $AB$; $N$ where $CM$ meets $OB$." } },
        { h: "(b) $N$ is on line $CM$", m: "$\\overrightarrow{ON} = \\overrightarrow{OC} + \\lambda\\overrightarrow{CM} = 2\\mathbf{a} + \\lambda\\left(-\\tfrac32\\mathbf{a} + \\tfrac12\\mathbf{b}\\right) = \\left(2 - \\tfrac32\\lambda\\right)\\mathbf{a} + \\tfrac12\\lambda\\mathbf{b}$", mk: "M1 A1*", n: "$\\lambda$ is how far along $CM$ (beyond $M$ if $\\lambda > 1$)." },
        { h: "(c) $N$ is also on $OB$ — no $\\mathbf{a}$ component", m: "$2 - \\tfrac32\\lambda = 0 \\Rightarrow \\lambda = \\tfrac43$", mk: "M1", n: "$\\overrightarrow{ON} = \\mu\\mathbf{b}$ for some $\\mu$; comparing $\\mathbf{a}$-coefficients gives $\\lambda$ because $\\mathbf{a}$ and $\\mathbf{b}$ are not parallel." },
        { m: "$\\overrightarrow{ON} = \\tfrac12 \\cdot \\tfrac43\\mathbf{b} = \\tfrac23\\mathbf{b}$, so $\\overrightarrow{NB} = \\tfrac13\\mathbf{b}$ and $ON : NB = 2 : 1$", mk: "A1", n: "State the ratio explicitly." }
      ], result: "$ON : NB = 2 : 1$" } },
    { worked: { tag: "exam", title: "Trapezium in $\\mathbf{a}$, $\\mathbf{b}$: find $k$; then the ratio at an intersection", src: "A-level June 2025 · P2 Q14 · 8 marks",
      q: "Trapezium $ABCD$ with $AD \\parallel BC$; $\\overrightarrow{AB} = 2\\mathbf{a} + 3\\mathbf{b}$, $\\overrightarrow{BC} = 15\\mathbf{a} - 5\\mathbf{b}$, $\\overrightarrow{DB} = -4\\mathbf{a} + k\\mathbf{b}$, $k$ an integer. **(a)** Show $k = 5$. **(b)** $N$ lies on $BC$ with $BN : NC = 1 : 4$, and $AN$ meets $BD$ at $X$. Find $BX : XD$. *You must show detailed reasoning.*",
      steps: [
        { h: "(a) $\\overrightarrow{AD}$ by route, then parallel to $\\overrightarrow{BC}$", m: "$\\overrightarrow{AD} = \\overrightarrow{AB} + \\overrightarrow{BD} = (2\\mathbf{a} + 3\\mathbf{b}) + (4\\mathbf{a} - k\\mathbf{b}) = 6\\mathbf{a} + (3 - k)\\mathbf{b}$", mk: "M1", n: "$\\overrightarrow{BD} = -\\overrightarrow{DB}$.", fig: { w: 400, h: 250, items: [
          { poly: [[60, 200], [90, 158], [260, 228], [128, 228]], c: "muted", fill: "accent", alpha: 0.04 },
          { pt: [60, 200], label: "A", pos: "w" }, { pt: [90, 158], label: "B", pos: "n" }, { pt: [260, 228], label: "C", pos: "e" }, { pt: [128, 228], label: "D", pos: "s" },
          { line: [[90, 158], [128, 228]], c: "accent2", dash: true }, { line: [[60, 200], [124, 172]], c: "accent2", dash: true },
          { pt: [124, 172], label: "N", pos: "n", c: "accent2" }, { pt: [102.7, 181.3], label: "X", pos: "s", c: "danger" }
        ], cap: "$AD \\parallel BC$; $N$ one fifth along $BC$; $X = AN \\cap BD$." } },
        { m: "$AD \\parallel BC \\Rightarrow 6\\mathbf{a} + (3 - k)\\mathbf{b} = \\mu(15\\mathbf{a} - 5\\mathbf{b})$: $\\mu = \\tfrac{6}{15} = \\tfrac25$, so $3 - k = -5\\cdot\\tfrac25 = -2 \\Rightarrow k = 5$", mk: "M1 A1*", n: "Compare $\\mathbf{a}$-coefficients for $\\mu$, then $\\mathbf{b}$-coefficients for $k$." },
        { h: "(b) Two descriptions of $X$", m: "$\\overrightarrow{BN} = \\tfrac15\\overrightarrow{BC} = 3\\mathbf{a} - \\mathbf{b}$; $\\overrightarrow{AN} = \\overrightarrow{AB} + \\overrightarrow{BN} = 5\\mathbf{a} + 2\\mathbf{b}$\n$\\overrightarrow{BD} = 4\\mathbf{a} - 5\\mathbf{b}$", mk: "M1 A1", n: "$X$ on $AN$: $\\overrightarrow{AX} = s(5\\mathbf{a} + 2\\mathbf{b})$. $X$ on $BD$: $\\overrightarrow{BX} = t(4\\mathbf{a} - 5\\mathbf{b})$." },
        { h: "Equate via $A \\to B \\to X$", m: "$\\overrightarrow{AX} = \\overrightarrow{AB} + \\overrightarrow{BX} = (2 + 4t)\\mathbf{a} + (3 - 5t)\\mathbf{b}$\nCompare: $5s = 2 + 4t$ and $2s = 3 - 5t$", mk: "M1", n: "Two equations, two unknowns — the heart of every intersection question." },
        { m: "From the second $s = \\tfrac{3 - 5t}{2}$; substitute: $\\tfrac{5(3 - 5t)}{2} = 2 + 4t \\Rightarrow 15 - 25t = 4 + 8t \\Rightarrow t = \\tfrac13$", mk: "A1", n: "$s = \\frac23$ (not needed but a check: $\\frac{10}{3} = 2 + \\frac43$ ✓)." },
        { m: "$\\overrightarrow{BX} = \\tfrac13\\overrightarrow{BD}$, so $BX : XD = 1 : 2$", mk: "A1" }
      ], result: "$k = 5$; $BX : XD = 1 : 2$" } },
    { worked: { tag: "exam", title: "Collinear points give $p$; ratio of triangle areas", src: "AS June 2023 · P1 Q13 · 7 marks",
      q: "$A$: $10\\mathbf{i} - 3\\mathbf{j}$; $B$: $-8\\mathbf{i} + 9\\mathbf{j}$; $C$: $-2\\mathbf{i} + p\\mathbf{j}$. **(a)** Find $\\overrightarrow{AB}$. **(b)** Find $|\\overrightarrow{AB}|$ as a simplified surd. Given $A$, $B$, $C$ are collinear, **(c)(i)** find $p$; **(ii)** state the ratio of the area of triangle $AOC$ to the area of triangle $AOB$.",
      steps: [
        { h: "(a)(b)", m: "$\\overrightarrow{AB} = -18\\mathbf{i} + 12\\mathbf{j}$; $|\\overrightarrow{AB}| = \\sqrt{324 + 144} = \\sqrt{468} = 6\\sqrt{13}$", mk: "M1 A1 M1 A1", n: "$468 = 36 \\times 13$." },
        { h: "(c)(i) $\\overrightarrow{AC} = \\lambda\\overrightarrow{AB}$", m: "$\\overrightarrow{AC} = -12\\mathbf{i} + (p + 3)\\mathbf{j}$; $\\dfrac{-12}{-18} = \\dfrac23 \\Rightarrow p + 3 = \\tfrac23 \\times 12 = 8 \\Rightarrow p = 5$", mk: "M1 A1", n: "Same ratio in each component." },
        { h: "(c)(ii) Same height from $O$", m: "$AC = \\tfrac23 AB$ and both triangles have the same perpendicular height from $O$ to the line, so area $AOC$ : area $AOB = 2 : 3$", mk: "B1", n: "Triangles on the same line with the same apex have areas in the ratio of their bases." }
      ], result: "$6\\sqrt{13}$; $p = 5$; $2 : 3$" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command", "What they want", "Marks"], rows: [
      ["Find $\\overrightarrow{CM}$ in terms of $\\mathbf{a}$, $\\mathbf{b}$", "Route via $O$; midpoint $\\frac12(\\mathbf{a} + \\mathbf{b})$", "M1 A1"],
      ["Show $\\overrightarrow{ON} = (\\ldots)\\mathbf{a} + (\\ldots)\\mathbf{b}$", "Start point plus $\\lambda \\times$ direction; expand", "M1 A1*"],
      ["Hence prove $ON : NB = 2 : 1$", "Second condition kills one coefficient; solve; state the ratio", "M1 A1"],
      ["Show $k = \\ldots$ (parallel sides)", "Parallel ⇒ scalar multiple; compare both coefficients", "M1 M1 A1*"],
      ["Find $BX : XD$ (intersection)", "Two parameters, two routes to $X$, compare coefficients, solve", "M1 A1 M1 A1 A1"],
      ["Ratio of areas", "Same height ⇒ ratio of bases", "B1"]
    ] } },
    { kv: [
      ["Why comparing coefficients is allowed", "$\\mathbf{a}$ and $\\mathbf{b}$ are not parallel, so $\\alpha\\mathbf{a} + \\beta\\mathbf{b} = \\gamma\\mathbf{a} + \\delta\\mathbf{b}$ forces $\\alpha = \\gamma$ and $\\beta = \\delta$. Say so in a \"detailed reasoning\" question."],
      ["Choose the parameter well", "Let $\\overrightarrow{BX} = t\\overrightarrow{BD}$ so that the answer $BX : XD = t : (1 - t)$ drops straight out."],
      ["Signs", "$\\overrightarrow{DB} = -4\\mathbf{a} + k\\mathbf{b}$ means $\\overrightarrow{BD} = 4\\mathbf{a} - k\\mathbf{b}$. Reversing is the commonest slip in these proofs."],
      ["Underline", "Every $\\mathbf{a}$, $\\mathbf{b}$ underlined. In a proof, an un-underlined vector is a scalar and the argument reads as nonsense."]
    ] },
    { callout: { t: "mnemonic", h: "\"Route, parameter, compare\"", body: "Every vector-geometry proof: write vectors by **route**, put a **parameter** on the unknown point, **compare** coefficients of $\\mathbf{a}$ and $\\mathbf{b}$." } },
    { ul: [
      "**Misconception:** $\\overrightarrow{OM} = \\mathbf{a} + \\mathbf{b}$ for a midpoint (it is half that).",
      "**Misconception:** setting the $\\mathbf{b}$-coefficient to zero when the point is on $OB$ — it is the $\\mathbf{a}$-coefficient that vanishes.",
      "**Misconception:** giving $\\lambda = \\frac43$ as the answer to \"prove $ON : NB = 2 : 1$\". Finish: $\\overrightarrow{ON} = \\frac23\\mathbf{b}$, ratio $2 : 1$."
    ] }
  ],
  flashcards: [
    ["Triangle law?", "Nose to tail: $\\mathbf{a} + \\mathbf{b}$ runs from the start of $\\mathbf{a}$ to the tip of $\\mathbf{b}$."],
    ["Midpoint $M$ of $AB$: $\\overrightarrow{OM}$?", "$\\frac12(\\mathbf{a} + \\mathbf{b})$."],
    ["Point $P$ on $AB$ with $AP : PB = m : n$?", "$\\overrightarrow{OP} = \\mathbf{a} + \\frac{m}{m+n}(\\mathbf{b} - \\mathbf{a})$."],
    ["Unknown point on a line through $C$ in direction $\\overrightarrow{CM}$?", "$\\overrightarrow{OC} + \\lambda\\overrightarrow{CM}$."],
    ["Why can coefficients of $\\mathbf{a}$ and $\\mathbf{b}$ be compared?", "They are not parallel, so the representation is unique."],
    ["June 2019 P2 Q10 result?", "$ON : NB = 2 : 1$ from $\\lambda = \\frac43$."]
  ],
  quiz: [
    { q: "$M$ is the midpoint of $AB$. $\\overrightarrow{OM} =$", opts: ["$\\frac12(\\mathbf{a} + \\mathbf{b})$", "$\\mathbf{a} + \\mathbf{b}$", "$\\frac12(\\mathbf{b} - \\mathbf{a})$", "$\\mathbf{a} - \\mathbf{b}$"], ans: 0, why: "$\\mathbf{a} + \\frac12(\\mathbf{b} - \\mathbf{a})$." },
    { q: "$\\overrightarrow{ON} = (2 - \\frac32\\lambda)\\mathbf{a} + \\frac12\\lambda\\mathbf{b}$ lies on $OB$ when", opts: ["$2 - \\frac32\\lambda = 0$", "$\\frac12\\lambda = 0$", "$\\lambda = 1$", "$\\lambda = 2$"], ans: 0, why: "No $\\mathbf{a}$ component along $OB$." },
    { q: "$\\overrightarrow{PQ} = 2\\mathbf{a} + \\mathbf{b}$, $\\overrightarrow{RS} = 6\\mathbf{a} + k\\mathbf{b}$ parallel: $k =$", opts: ["3", "6", "2", "1"], ans: 0, why: "Multiple of 3." },
    { q: "Triangles $AOC$, $AOB$ with $C$ on $AB$ and $AC = \\frac23 AB$: area ratio", opts: ["2 : 3", "4 : 9", "3 : 2", "1 : 3"], ans: 0, why: "Same height; bases in ratio $2 : 3$." }
  ]
};

/* =====================================================================
   10.4  Position vectors and distance
   ===================================================================== */
C["maths:10.4"] = {
  notes: [
    { h: "Distance between two points" },
    { callout: { t: "memorise", h: "Distance formula (2D and 3D)", body: [
      "$$d^2 = (x_1 - x_2)^2 + (y_1 - y_2)^2 \\qquad d^2 = (x_1 - x_2)^2 + (y_1 - y_2)^2 + (z_1 - z_2)^2$$",
      "It is $|\\overrightarrow{AB}|$: subtract the position vectors, then Pythagoras. Working with $d^2$ avoids square roots until the end — essential when an unknown coordinate is to be found."
    ] } },
    { worked: { tag: "exam", title: "Fourth point from $\\overrightarrow{AB} = \\overrightarrow{BD}$; unknown coordinate from a length", src: "A-level June 2018 · P2 Q2 · 5 marks",
      q: "$A$: $2\\mathbf{i} + 3\\mathbf{j} - 4\\mathbf{k}$; $B$: $4\\mathbf{i} - 2\\mathbf{j} + 3\\mathbf{k}$; $C$: $a\\mathbf{i} + 5\\mathbf{j} - 2\\mathbf{k}$ with $a < 0$. $D$ is such that $\\overrightarrow{AB} = \\overrightarrow{BD}$. **(a)** Find the position vector of $D$. **(b)** Given $|\\overrightarrow{AC}| = 4$, find $a$.",
      steps: [
        { h: "(a) $B$ is the midpoint of $AD$", m: "$\\overrightarrow{AB} = 2\\mathbf{i} - 5\\mathbf{j} + 7\\mathbf{k}$\n$\\overrightarrow{OD} = \\overrightarrow{OB} + \\overrightarrow{BD} = \\overrightarrow{OB} + \\overrightarrow{AB} = 6\\mathbf{i} - 7\\mathbf{j} + 10\\mathbf{k}$", mk: "M1 A1", n: "Or $\\mathbf{d} = 2\\mathbf{b} - \\mathbf{a}$." },
        { h: "(b) Distance squared", m: "$\\overrightarrow{AC} = (a - 2)\\mathbf{i} + 2\\mathbf{j} + 2\\mathbf{k}$\n$(a - 2)^2 + 4 + 4 = 16 \\Rightarrow (a - 2)^2 = 8$", mk: "M1 A1", n: "Square the magnitude condition — no roots in the working." },
        { m: "$a - 2 = \\pm 2\\sqrt2 \\Rightarrow a = 2 - 2\\sqrt2$ (since $a < 0$)", mk: "A1", n: "$2 + 2\\sqrt2 > 0$ is rejected by the condition in the question. $2 - 2\\sqrt2 = -0.83$ ✓." }
      ], result: "$6\\mathbf{i} - 7\\mathbf{j} + 10\\mathbf{k}$; $a = 2 - 2\\sqrt2$" } },
    { worked: { tag: "exam", title: "Collinear points give $p$; a parallel condition fixes $D$; $|\\overrightarrow{OD}|$", src: "A-level June 2022 · P2 Q13 · 6 marks",
      q: "$A$: $4\\mathbf{i} - 3\\mathbf{j} + 5\\mathbf{k}$; $B$: $4\\mathbf{j} + 6\\mathbf{k}$; $C$: $-16\\mathbf{i} + p\\mathbf{j} + 10\\mathbf{k}$. **(a)** Given $A$, $B$, $C$ are collinear, find $p$. **(b)** $OB$ is extended to $D$ so that $\\overrightarrow{CD}$ is parallel to $\\overrightarrow{OA}$. Find $|\\overrightarrow{OD}|$ as a simplified surd.",
      steps: [
        { h: "(a)", m: "$\\overrightarrow{AB} = -4\\mathbf{i} + 7\\mathbf{j} + \\mathbf{k}$, $\\quad \\overrightarrow{AC} = -20\\mathbf{i} + (p + 3)\\mathbf{j} + 5\\mathbf{k}$", mk: "M1", n: "$B$ has $x$-component 0: $0 - 4 = -4$." },
        { m: "$\\overrightarrow{AC} = 5\\overrightarrow{AB}$ (from the $\\mathbf{i}$ and $\\mathbf{k}$ components) $\\Rightarrow p + 3 = 35 \\Rightarrow p = 32$", mk: "M1 A1", n: "Check the multiplier on two components before using it on the third." },
        { h: "(b) $D$ on line $OB$", m: "$\\overrightarrow{OD} = \\lambda\\overrightarrow{OB} = 4\\lambda\\mathbf{j} + 6\\lambda\\mathbf{k}$\n$\\overrightarrow{CD} = \\overrightarrow{OD} - \\overrightarrow{OC} = 16\\mathbf{i} + (4\\lambda - 32)\\mathbf{j} + (6\\lambda - 10)\\mathbf{k}$", mk: "M1", n: "Parameter for the unknown point; then end minus start." },
        { m: "Parallel to $4\\mathbf{i} - 3\\mathbf{j} + 5\\mathbf{k}$: multiplier $\\tfrac{16}{4} = 4$, so $4\\lambda - 32 = -12 \\Rightarrow \\lambda = 5$ (check: $6(5) - 10 = 20 = 4 \\times 5$ ✓)", mk: "M1", n: "Three components, one unknown: use one to find $\\lambda$, another to confirm." },
        { m: "$\\overrightarrow{OD} = 20\\mathbf{j} + 30\\mathbf{k}$; $|\\overrightarrow{OD}| = \\sqrt{400 + 900} = \\sqrt{1300} = 10\\sqrt{13}$", mk: "A1" }
      ], result: "$p = 32$; $10\\sqrt{13}$" } },
    { worked: { tag: "exam", title: "Points on a line with $|\\overrightarrow{AP}| = 2|\\overrightarrow{BP}|$ — two answers", src: "A-level June 2024 · P2 Q7 · 5 marks",
      q: "Line $l$ passes through $A$ ($2\\mathbf{i} - 3\\mathbf{j} + 5\\mathbf{k}$) and $B$ ($5\\mathbf{i} + 6\\mathbf{j} + 8\\mathbf{k}$). **(a)** Find $\\overrightarrow{AB}$. **(b)** $P$ lies on $l$ with $|\\overrightarrow{AP}| = 2|\\overrightarrow{BP}|$. Find the possible position vectors of $P$.",
      steps: [
        { h: "(a)", m: "$\\overrightarrow{AB} = 3\\mathbf{i} + 9\\mathbf{j} + 3\\mathbf{k}$", mk: "B1" },
        { h: "(b) Think along the line", m: "$P$ is on $l$, so $\\overrightarrow{AP} = t\\overrightarrow{AB}$ and $\\overrightarrow{BP} = (t - 1)\\overrightarrow{AB}$\n$|t| = 2|t - 1|$", mk: "M1", n: "Distances along a line are proportional to the parameter — no square roots needed.", fig: { w: 420, h: 120, items: [
          { line: [[20, 60], [400, 60]], c: "muted" },
          { pt: [110, 60], label: "A (t = 0)", pos: "s" }, { pt: [230, 60], label: "B (t = 1)", pos: "s" },
          { pt: [190, 60], label: "P₁ (t = ⅔)", pos: "n", c: "danger" }, { pt: [350, 60], label: "P₂ (t = 2)", pos: "n", c: "danger" },
          { text: [150, 30], t: "AP = 2·BP", size: 11, c: "text2" }
        ], cap: "Two places on the line are twice as far from $A$ as from $B$: between them ($AP : PB = 2 : 1$) and beyond $B$." } },
        { m: "$t = 2(t - 1) \\Rightarrow t = 2$; or $t = -2(t - 1) \\Rightarrow t = \\tfrac23$", mk: "A1", n: "One point between $A$ and $B$ (dividing $2 : 1$) and one beyond $B$." },
        { m: "$t = 2$: $\\overrightarrow{OP} = \\mathbf{a} + 2\\overrightarrow{AB} = 8\\mathbf{i} + 15\\mathbf{j} + 11\\mathbf{k}$\n$t = \\tfrac23$: $\\overrightarrow{OP} = \\mathbf{a} + \\tfrac23\\overrightarrow{AB} = 4\\mathbf{i} + 3\\mathbf{j} + 7\\mathbf{k}$", mk: "M1 A1", n: "Both required for full marks. Check: $|\\overrightarrow{AP}| = 2\\sqrt{99}$, $|\\overrightarrow{BP}| = \\sqrt{99}$ for the first." }
      ], result: "$8\\mathbf{i} + 15\\mathbf{j} + 11\\mathbf{k}$ and $4\\mathbf{i} + 3\\mathbf{j} + 7\\mathbf{k}$" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command", "What they want", "Marks"], rows: [
      ["Find the position vector of $D$ given $\\overrightarrow{AB} = \\overrightarrow{BD}$", "$\\mathbf{d} = \\mathbf{b} + (\\mathbf{b} - \\mathbf{a})$", "M1 A1"],
      ["Given $|\\overrightarrow{AC}| = k$, find $a$", "Square: sum of squared components $= k^2$; quadratic; choose the root the condition allows", "M1 A1 A1"],
      ["Find $p$ so that $A$, $B$, $C$ are collinear", "$\\overrightarrow{AC} = \\lambda\\overrightarrow{AB}$; find $\\lambda$ from known components", "M1 M1 A1"],
      ["Points on a line at a given distance/ratio", "Parameter $t$ along $\\overrightarrow{AB}$; solve $|t| = 2|t - 1|$; two answers", "M1 A1 M1 A1"]
    ] } },
    { kv: [
      ["Modulus equations", "$|t| = 2|t - 1|$ splits into $t = 2(t - 1)$ and $t = -2(t - 1)$ (2.x modulus). Expect two solutions unless the question restricts $P$."],
      ["Reject with a reason", "\"$a < 0$ so $a = 2 - 2\\sqrt2$\" — quote the condition when discarding a root."],
      ["Zero components", "$4\\mathbf{j} + 6\\mathbf{k}$ is $(0, 4, 6)$; do not skip the zero when subtracting."],
      ["fx-991CW", "Solve $(a - 2)^2 + 8 = 16$ with the equation solver; or keep it exact by hand — surd answers are expected."]
    ] },
    { callout: { t: "mnemonic", h: "\"Square it, don't root it\"", body: "Every distance condition becomes an equation in squares first. Roots appear only in the final line." } },
    { ul: [
      "**Misconception:** $D$ with $\\overrightarrow{AB} = \\overrightarrow{BD}$ is $\\mathbf{a} + \\mathbf{b}$. It is $2\\mathbf{b} - \\mathbf{a}$ ($B$ is the midpoint of $AD$).",
      "**Misconception:** only one point $P$ with $|AP| = 2|BP|$. There are two (one internal, one external).",
      "**Misconception:** $|\\overrightarrow{AC}| = 4 \\Rightarrow (a - 2) + 2 + 2 = 4$. Magnitude is a root of a sum of squares."
    ] }
  ],
  flashcards: [
    ["Distance between $(x_1, y_1, z_1)$ and $(x_2, y_2, z_2)$?", "$\\sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2 + (z_1 - z_2)^2}$."],
    ["$\\overrightarrow{AB} = \\overrightarrow{BD}$: $\\mathbf{d} =$?", "$2\\mathbf{b} - \\mathbf{a}$."],
    ["$|\\overrightarrow{AC}| = 4$ with $\\overrightarrow{AC} = (a - 2)\\mathbf{i} + 2\\mathbf{j} + 2\\mathbf{k}$?", "$(a - 2)^2 + 8 = 16 \\Rightarrow a = 2 \\pm 2\\sqrt2$."],
    ["$P$ on $AB$ with $|AP| = 2|BP|$: parameter equation?", "$|t| = 2|t - 1|$: $t = 2$ or $t = \\frac23$."],
    ["June 2022 P2 Q13: $p$ and $|\\overrightarrow{OD}|$?", "$p = 32$; $10\\sqrt{13}$."]
  ],
  quiz: [
    { q: "Distance from $(1, 2, 3)$ to $(3, 0, 6)$:", opts: ["$\\sqrt{17}$", "$\\sqrt{7}$", "17", "$\\sqrt{29}$"], ans: 0, why: "$4 + 4 + 9$." },
    { q: "$\\mathbf{a} = \\mathbf{i} + \\mathbf{j}$, $\\mathbf{b} = 3\\mathbf{i} - \\mathbf{j}$, $\\overrightarrow{AB} = \\overrightarrow{BD}$: $\\mathbf{d} =$", opts: ["$5\\mathbf{i} - 3\\mathbf{j}$", "$4\\mathbf{i}$", "$2\\mathbf{i} - 2\\mathbf{j}$", "$-\\mathbf{i} + 3\\mathbf{j}$"], ans: 0, why: "$2\\mathbf{b} - \\mathbf{a}$." },
    { q: "$|k\\mathbf{i} + 2\\mathbf{j} + 2\\mathbf{k}| = 3$: $k =$", opts: ["$\\pm 1$", "$\\pm 3$", "1 only", "$\\pm\\sqrt5$"], ans: 0, why: "$k^2 + 8 = 9$." },
    { q: "$P$ on line $AB$ with $|AP| = 3|BP|$: how many such $P$?", opts: ["2", "1", "0", "3"], ans: 0, why: "$t = 3(t-1)$ and $t = -3(t-1)$." }
  ]
};

/* =====================================================================
   10.5  Vector problems — shapes, angles, areas, context
   ===================================================================== */
C["maths:10.5"] = {
  notes: [
    { h: "Shapes from vectors" },
    { table: { head: ["To show a quadrilateral $ABCD$ is a…", "Vector test"], rows: [
      ["parallelogram", "$\\overrightarrow{AB} = \\overrightarrow{DC}$ (one pair of opposite sides equal *and* parallel)"],
      ["rhombus", "parallelogram with $|\\overrightarrow{AB}| = |\\overrightarrow{BC}|$ (adjacent sides equal)"],
      ["rectangle", "parallelogram with a right angle (adjacent sides perpendicular — cosine rule / Pythagoras on the diagonal)"],
      ["trapezium", "one pair of opposite sides parallel: $\\overrightarrow{AD} = \\lambda\\overrightarrow{BC}$, $\\lambda \\ne 1$"],
      ["triangle $PQR$ right-angled at $Q$", "$|\\overrightarrow{PQ}|^2 + |\\overrightarrow{QR}|^2 = |\\overrightarrow{PR}|^2$ (Pythagoras' converse)"],
      ["isosceles", "two equal side lengths"]
    ] } },
    { callout: { t: "key", h: "Fourth vertex of a parallelogram", body: [
      "$ABCD$ in order: $\\overrightarrow{AD} = \\overrightarrow{BC}$, so $\\mathbf{d} = \\mathbf{a} + (\\mathbf{c} - \\mathbf{b}) = \\mathbf{a} + \\mathbf{c} - \\mathbf{b}$.",
      "Read the letters in order round the shape: the vertex *opposite* $B$ is $D$, and the diagonals bisect each other, which is the same statement ($\\mathbf{a} + \\mathbf{c} = \\mathbf{b} + \\mathbf{d}$)."
    ] } },
    { worked: { tag: "exam", title: "Fourth vertex; a point at a given distance along $\\overrightarrow{AB}$", src: "A-level Specimen · P1 Q4 · 5 marks",
      q: "$A$: $\\mathbf{i} + 7\\mathbf{j} - 2\\mathbf{k}$; $B$: $4\\mathbf{i} + 3\\mathbf{j} + 3\\mathbf{k}$; $C$: $2\\mathbf{i} + 10\\mathbf{j} + 9\\mathbf{k}$. **(a)** $ABCD$ is a parallelogram; find the position vector of $D$. **(b)** $\\overrightarrow{AX}$ has the same direction as $\\overrightarrow{AB}$ and $|\\overrightarrow{AX}| = 10\\sqrt2$. Find the position vector of $X$.",
      steps: [
        { h: "(a) $\\overrightarrow{AD} = \\overrightarrow{BC}$", m: "$\\overrightarrow{BC} = -2\\mathbf{i} + 7\\mathbf{j} + 6\\mathbf{k}$\n$\\overrightarrow{OD} = \\overrightarrow{OA} + \\overrightarrow{BC} = -\\mathbf{i} + 14\\mathbf{j} + 4\\mathbf{k}$", mk: "M1 A1", n: "$\\mathbf{a} + \\mathbf{c} - \\mathbf{b}$ gives the same.", fig: { w: 400, h: 200, items: [
          { poly: [[60, 160], [220, 160], [340, 50], [180, 50]], c: "muted", fill: "accent", alpha: 0.05 },
          { vec: [[60, 160], [220, 160]], label: "AB", c: "accent" }, { vec: [[220, 160], [340, 50]], label: "BC", c: "accent2" }, { vec: [[60, 160], [180, 50]], label: "AD = BC", c: "accent2", loff: -14 },
          { pt: [60, 160], label: "A", pos: "sw" }, { pt: [220, 160], label: "B", pos: "se" }, { pt: [340, 50], label: "C", pos: "ne" }, { pt: [180, 50], label: "D", pos: "nw" }
        ] } },
        { h: "(b) Scale $\\overrightarrow{AB}$ to the required length", m: "$\\overrightarrow{AB} = 3\\mathbf{i} - 4\\mathbf{j} + 5\\mathbf{k}$, $|\\overrightarrow{AB}| = \\sqrt{9 + 16 + 25} = \\sqrt{50} = 5\\sqrt2$\n$\\overrightarrow{AX} = \\dfrac{10\\sqrt2}{5\\sqrt2}\\overrightarrow{AB} = 2\\overrightarrow{AB} = 6\\mathbf{i} - 8\\mathbf{j} + 10\\mathbf{k}$", mk: "M1 M1", n: "$L\\hat{\\mathbf{a}}$ (10.2): required length over current length, times the vector." },
        { m: "$\\overrightarrow{OX} = \\overrightarrow{OA} + \\overrightarrow{AX} = 7\\mathbf{i} - \\mathbf{j} + 8\\mathbf{k}$", mk: "A1" }
      ], result: "$D$: $-\\mathbf{i} + 14\\mathbf{j} + 4\\mathbf{k}$; $X$: $7\\mathbf{i} - \\mathbf{j} + 8\\mathbf{k}$" } },
    { worked: { tag: "exam", title: "Show a parallelogram is a rhombus; exact area", src: "A-level June 2022 · P1 Q9 · 6 marks",
      q: "Parallelogram $PQRS$ with $\\overrightarrow{PQ} = 2\\mathbf{i} + 3\\mathbf{j} - 4\\mathbf{k}$ and $\\overrightarrow{QR} = 5\\mathbf{i} - 2\\mathbf{k}$. **(a)** Show $PQRS$ is a rhombus. **(b)** Find the exact area of $PQRS$.",
      steps: [
        { h: "(a) Adjacent sides equal", m: "$|\\overrightarrow{PQ}|^2 = 4 + 9 + 16 = 29$, $\\quad |\\overrightarrow{QR}|^2 = 25 + 0 + 4 = 29$\nA parallelogram with two adjacent sides equal has all four equal: a rhombus.", mk: "M1 A1", n: "Compare squares. State the conclusion in words." },
        { h: "(b) Diagonals", m: "$\\overrightarrow{PR} = \\overrightarrow{PQ} + \\overrightarrow{QR} = 7\\mathbf{i} + 3\\mathbf{j} - 6\\mathbf{k}$, $|\\overrightarrow{PR}|^2 = 94$\n$\\overrightarrow{QS} = \\overrightarrow{QR} - \\overrightarrow{PQ} = 3\\mathbf{i} - 3\\mathbf{j} + 2\\mathbf{k}$, $|\\overrightarrow{QS}|^2 = 22$", mk: "M1 A1", n: "A rhombus's diagonals are perpendicular, so area $= \\frac12 d_1 d_2$. $\\overrightarrow{QS} = \\overrightarrow{QR} + \\overrightarrow{RS} = \\overrightarrow{QR} - \\overrightarrow{PQ}$." },
        { m: "Area $= \\tfrac12\\sqrt{94}\\sqrt{22} = \\tfrac12\\sqrt{2068} = \\tfrac12 \\cdot 2\\sqrt{517} = \\sqrt{517}$", mk: "M1 A1", n: "Alternative: cosine rule for angle $Q$ from sides $\\sqrt{29}, \\sqrt{29}, \\sqrt{94}$ gives $\\cos Q = -\\frac{18}{29}$, $\\sin Q = \\frac{\\sqrt{517}}{29}$, area $= 29\\sin Q = \\sqrt{517}$." }
      ], result: "$\\sqrt{517}$" } },
    { worked: { tag: "exam", title: "$\\overrightarrow{PR}$; show $PQR$ is right-angled and isosceles", src: "A-level June 2025 · P1 Q10 · 6 marks",
      q: "$\\overrightarrow{PQ} = 2\\mathbf{i} + 8\\mathbf{j} - 2\\mathbf{k}$, $\\overrightarrow{QR} = 6\\mathbf{i} + 6\\mathbf{k}$. **(a)** Find $\\overrightarrow{PR}$. **(b)** Hence show that triangle $PQR$ is both right-angled and isosceles.",
      steps: [
        { h: "(a)", m: "$\\overrightarrow{PR} = \\overrightarrow{PQ} + \\overrightarrow{QR} = 8\\mathbf{i} + 8\\mathbf{j} + 4\\mathbf{k}$", mk: "M1 A1" },
        { h: "(b) Three squared lengths", m: "$|\\overrightarrow{PQ}|^2 = 4 + 64 + 4 = 72$, $\\;|\\overrightarrow{QR}|^2 = 36 + 36 = 72$, $\\;|\\overrightarrow{PR}|^2 = 64 + 64 + 16 = 144$", mk: "M1 A1", n: "\"Hence\" — use the $\\overrightarrow{PR}$ you found." },
        { m: "$72 + 72 = 144$, so $PQ^2 + QR^2 = PR^2$: right angle at $Q$ (converse of Pythagoras). $|PQ| = |QR| = 6\\sqrt2$: isosceles.", mk: "A1 A1", n: "Name the vertex of the right angle and name the two equal sides." }
      ], result: "$8\\mathbf{i} + 8\\mathbf{j} + 4\\mathbf{k}$; right angle at $Q$, $PQ = QR$" } },
    { worked: { tag: "exam", title: "Show $\\cos ABC = \\frac{9}{10}$ from two side vectors", src: "A-level Oct 2021 · P1 Q6 · 5 marks",
      q: "Triangle $ABC$ with $\\overrightarrow{AB} = -3\\mathbf{i} - 4\\mathbf{j} - 5\\mathbf{k}$ and $\\overrightarrow{BC} = \\mathbf{i} + \\mathbf{j} + 4\\mathbf{k}$. **(a)** Find $\\overrightarrow{AC}$. **(b)** Show that $\\cos ABC = \\frac{9}{10}$.",
      steps: [
        { h: "(a)", m: "$\\overrightarrow{AC} = \\overrightarrow{AB} + \\overrightarrow{BC} = -2\\mathbf{i} - 3\\mathbf{j} - \\mathbf{k}$", mk: "M1 A1" },
        { h: "(b) Cosine rule at $B$", m: "$AB^2 = 9 + 16 + 25 = 50$, $\\;BC^2 = 1 + 1 + 16 = 18$, $\\;AC^2 = 4 + 9 + 1 = 14$\n$\\cos B = \\dfrac{50 + 18 - 14}{2\\sqrt{50}\\sqrt{18}} = \\dfrac{54}{2\\sqrt{900}} = \\dfrac{54}{60} = \\dfrac{9}{10}$", mk: "M1 M1 A1*", n: "$\\sqrt{50}\\sqrt{18} = \\sqrt{900} = 30$. Angle $ABC$ is at $B$, opposite $AC$." }
      ], result: "$\\cos ABC = \\frac{9}{10}$" } },
    { worked: { tag: "exam", title: "Right angle by perpendicular directions; area of a trapezium", src: "AS June 2024 · P1 Q3 · 8 marks",
      q: "$P$: $9\\mathbf{i} - 8\\mathbf{j}$; $Q$: $3\\mathbf{i} - 5\\mathbf{j}$. **(a)** Find $\\overrightarrow{PQ}$. **(b)** $R$ is such that $\\overrightarrow{QR} = 9\\mathbf{i} + 18\\mathbf{j}$; show angle $PQR = 90°$. **(c)** $S$ is such that $\\overrightarrow{PS} = 3\\overrightarrow{QR}$; find the exact area of $PQRS$.",
      steps: [
        { h: "(a)", m: "$\\overrightarrow{PQ} = -6\\mathbf{i} + 3\\mathbf{j}$", mk: "M1 A1" },
        { h: "(b) Gradients (2D) or Pythagoras", m: "Direction of $\\overrightarrow{QP} = 6\\mathbf{i} - 3\\mathbf{j}$ has gradient $-\\tfrac12$; $\\overrightarrow{QR}$ has gradient $2$; product $-1$, so $QP \\perp QR$: angle $PQR = 90°$.", mk: "M1 A1", n: "Or: $PQ^2 + QR^2 = 45 + 405 = 450 = PR^2$ with $\\overrightarrow{PR} = 3\\mathbf{i} + 21\\mathbf{j}$." },
        { h: "(c) Shape", m: "$\\overrightarrow{PS} = 27\\mathbf{i} + 54\\mathbf{j} \\parallel \\overrightarrow{QR}$, so $PQRS$ is a trapezium with parallel sides $QR$ and $PS$ and height $|PQ|$ (since $PQ \\perp QR$).", mk: "M1", n: "Sketch it: $P(9, -8)$, $Q(3, -5)$, $R(12, 13)$, $S(36, 46)$.", fig: { x: [0, 40], y: [-12, 50], aspect: "equal", axes: { xt: [10, 20, 30], yt: [20, 40] }, items: [
          { poly: [[9, -8], [3, -5], [12, 13], [36, 46]], c: "muted", fill: "accent", alpha: 0.06 },
          { vec: [[9, -8], [3, -5]], label: "PQ", c: "accent" }, { vec: [[3, -5], [12, 13]], label: "QR", c: "accent2" }, { vec: [[9, -8], [36, 46]], label: "PS = 3QR", c: "accent2", loff: 14 },
          { rangle: [[3, -5], [9, -8], [12, 13]] },
          { pt: [9, -8], label: "P", pos: "s" }, { pt: [3, -5], label: "Q", pos: "w" }, { pt: [12, 13], label: "R", pos: "w" }, { pt: [36, 46], label: "S", pos: "e" }
        ] } },
        { m: "$|QR| = \\sqrt{81 + 324} = 9\\sqrt5$, $|PS| = 27\\sqrt5$, $|PQ| = \\sqrt{36 + 9} = 3\\sqrt5$\nArea $= \\tfrac12(9\\sqrt5 + 27\\sqrt5)(3\\sqrt5) = \\tfrac12 \\cdot 36\\sqrt5 \\cdot 3\\sqrt5 = 270$", mk: "M1 A1 A1", n: "$\\sqrt5 \\cdot \\sqrt5 = 5$. The exact area is an integer here." }
      ], result: "$-6\\mathbf{i} + 3\\mathbf{j}$; $90°$; $270$" } },

    { page: "Vectors in context" },
    { worked: { tag: "exam", title: "Running track: parallel sides, then average speed in km/h", src: "A-level June 2023 · P2 Q6 · 6 marks",
      q: "$A$: $12\\mathbf{i}$; $B$: $16\\mathbf{j}$; $C$: $50\\mathbf{i} + 136\\mathbf{j}$; $D$: $22\\mathbf{i} + 24\\mathbf{j}$ (metres). **(a)** Show $AD$ is parallel to $BC$. **(b)** $ABCD$ models a running track; a runner completes 2 laps in exactly 5 minutes. Find the average speed in km h$^{-1}$.",
      steps: [
        { h: "(a)", m: "$\\overrightarrow{AD} = 10\\mathbf{i} + 24\\mathbf{j}$, $\\overrightarrow{BC} = 50\\mathbf{i} + 120\\mathbf{j} = 5\\overrightarrow{AD}$: parallel", mk: "M1 A1" },
        { h: "(b) Perimeter", m: "$|AB| = \\sqrt{144 + 256} = 20$; $|BC| = \\sqrt{2500 + 14400} = 130$; $|CD| = \\sqrt{28^2 + 112^2} = 115.4\\ldots$; $|DA| = \\sqrt{100 + 576} = 26$\nPerimeter $= 291.4\\ldots$ m", mk: "M1 A1", n: "$\\overrightarrow{CD} = -28\\mathbf{i} - 112\\mathbf{j}$; $|CD| = 28\\sqrt{17}$. Keep the decimals." },
        { m: "2 laps $= 582.9$ m in $5$ min $= \\tfrac{1}{12}$ h: speed $= \\dfrac{0.5829}{1/12} = 6.99$ km h$^{-1}$", mk: "M1 A1", n: "m → km ($\\div 1000$), min → h ($\\div 60$). $\\approx 7.0$ km h$^{-1}$." }
      ], result: "$BC = 5AD$; $6.99$ km h$^{-1}$" } },
    { p: "Forces, velocities and displacements in Paper 3 use exactly these vectors (M 6.1, 7.3, 8.1–8.4): $\\mathbf{F} = m\\mathbf{a}$ componentwise, speed $= |\\mathbf{v}|$, bearing from $\\tan^{-1}$ as in 10.2." },

    { page: "Exam toolkit" },
    { table: { head: ["Command", "What they want", "Marks"], rows: [
      ["Find the position vector of $D$ ($ABCD$ parallelogram)", "$\\mathbf{a} + \\mathbf{c} - \\mathbf{b}$ (or $\\overrightarrow{AD} = \\overrightarrow{BC}$)", "M1 A1"],
      ["Find $X$ with $\\overrightarrow{AX} \\parallel \\overrightarrow{AB}$, $|\\overrightarrow{AX}| = L$", "$\\overrightarrow{AX} = \\frac{L}{|\\overrightarrow{AB}|}\\overrightarrow{AB}$; add to $\\mathbf{a}$", "M1 M1 A1"],
      ["Show it is a rhombus", "Adjacent sides equal (squares)", "M1 A1"],
      ["Show right-angled / isosceles", "Squared lengths; Pythagoras' converse; equal sides named", "M1 A1 A1"],
      ["Show $\\cos ABC = \\ldots$", "Three squared lengths, cosine rule at $B$", "M1 M1 A1"],
      ["Exact area", "Rhombus: $\\frac12 d_1 d_2$; triangle: $\\frac12 ab\\sin C$; trapezium: $\\frac12(a + b)h$", "M1 A1"],
      ["Context (track, boat, stone)", "Lengths from vectors; unit conversions; sensible accuracy", "M1 A1 M1 A1"]
    ] } },
    { kv: [
      ["No scalar product needed", "Every angle in A-level Maths comes from the cosine rule (or 2D gradients). If you know $\\mathbf{a}\\cdot\\mathbf{b}$ from Further Maths it is accepted, but the cosine-rule route is what the mark scheme is written for."],
      ["Squares, not roots", "Compare $|\\ldots|^2$ for equal sides and right angles; take the root only for a final length."],
      ["Order of letters", "$ABCD$ round the shape; $\\overrightarrow{AD} = \\overrightarrow{BC}$, not $\\overrightarrow{AD} = \\overrightarrow{CB}$."],
      ["fx-991CW", "Vector mode: **Abs(VctA)** for lengths; **VctA − VctB** for sides. Cosine rule by hand from the squares."]
    ] },
    { callout: { t: "mnemonic", h: "\"A plus C minus B\"", body: "Fourth vertex $D$ of parallelogram $ABCD$: $\\mathbf{d} = \\mathbf{a} + \\mathbf{c} - \\mathbf{b}$ — the two vertices *not* opposite $D$, minus the one that is." } },
    { ul: [
      "**Misconception:** a rhombus shown by one pair of equal sides in a *non*-parallelogram — you need it to be a parallelogram first (given here) *and* adjacent sides equal.",
      "**Misconception:** area of a rhombus $= $ side$^2$. Only for a square; use diagonals or $ab\\sin\\theta$.",
      "**Misconception:** angle $ABC$ computed at $A$. Middle letter."
    ] }
  ],
  flashcards: [
    ["Fourth vertex $D$ of parallelogram $ABCD$?", "$\\mathbf{d} = \\mathbf{a} + \\mathbf{c} - \\mathbf{b}$."],
    ["Rhombus test (given a parallelogram)?", "Two adjacent sides of equal length."],
    ["Right angle at $Q$ in triangle $PQR$ — test?", "$PQ^2 + QR^2 = PR^2$."],
    ["Area of a rhombus from its diagonals?", "$\\frac12 d_1 d_2$."],
    ["$\\cos ABC$ from three side lengths?", "Cosine rule: $\\cos B = \\frac{AB^2 + BC^2 - AC^2}{2\\cdot AB\\cdot BC}$."],
    ["$\\overrightarrow{AX}$ in the direction of $\\overrightarrow{AB}$ with length $L$?", "$\\frac{L}{|\\overrightarrow{AB}|}\\overrightarrow{AB}$."]
  ],
  quiz: [
    { q: "$\\mathbf{a} = \\mathbf{i}$, $\\mathbf{b} = \\mathbf{i} + \\mathbf{j}$, $\\mathbf{c} = 3\\mathbf{j}$: parallelogram $ABCD$ has $\\mathbf{d} =$", opts: ["$2\\mathbf{j}$", "$2\\mathbf{i} + 4\\mathbf{j}$", "$\\mathbf{i} + 3\\mathbf{j}$", "$-\\mathbf{i} + 2\\mathbf{j}$"], ans: 0, why: "$\\mathbf{a} + \\mathbf{c} - \\mathbf{b} = (1 + 0 - 1)\\mathbf{i} + (0 + 3 - 1)\\mathbf{j}$." },
    { q: "Sides $\\sqrt{72}, \\sqrt{72}, \\sqrt{144}$: the triangle is", opts: ["right-angled and isosceles", "equilateral", "obtuse", "scalene"], ans: 0, why: "$72 + 72 = 144$." },
    { q: "Rhombus with diagonals $\\sqrt{94}$ and $\\sqrt{22}$: area", opts: ["$\\sqrt{517}$", "$\\sqrt{2068}$", "$\\sqrt{116}$", "$47$"], ans: 0, why: "$\\frac12\\sqrt{94 \\times 22}$." },
    { q: "Angle $ABC$ is found with the cosine rule using", opts: ["$AB$, $BC$ and $AC$ opposite", "$AB$, $AC$ and $BC$ opposite", "$BC$, $AC$ and $AB$ opposite", "any two sides"], ans: 0, why: "The angle at $B$ is opposite $AC$." }
  ]
};


/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
