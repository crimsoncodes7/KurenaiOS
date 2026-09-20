/* Kurenai OS — deep content: Pure Mathematics, section P5 (Trigonometry)
   at full A-level depth. Same contract as maths-pure-p4.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* =====================================================================
   5.1  Sine and cosine rules, radians, arcs and sectors
   ===================================================================== */
C["maths:5.1"] = {
  notes: [
    { h: "Triangles, radians and sectors — the whole topic on one page" },
    "Two rules for any triangle, one area formula, and the radian — the unit that makes $s = r\\theta$ and $A = \\frac12 r^2\\theta$ true. Every A-level Paper 1 has a sector question; every AS paper has a sine/cosine-rule question, often hiding a quadratic.",
    { callout: { t: "formula", h: "In the booklet — and what is not", body: [
      "$$\\text{Cosine rule: } a^2 = b^2 + c^2 - 2bc\\cos A \\qquad \\text{Sine rule: } \\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C} \\qquad \\text{Area} = \\tfrac12 ab\\sin C$$",
      "**Not in the booklet**: arc length $s = r\\theta$, sector area $A = \\frac12 r^2\\theta$ ($\\theta$ in radians), segment area $= \\frac12 r^2(\\theta - \\sin\\theta)$, and $\\pi$ radians $= 180°$."
    ] } },
    { fig: { w: 420, h: 250, items: [
      { poly: [[40, 210], [380, 210], [250, 40]], c: "text2" },
      { pt: [40, 210], label: "A", pos: "sw" }, { pt: [380, 210], label: "B", pos: "se" }, { pt: [250, 40], label: "C", pos: "n" },
      { text: [210, 218], t: "c", pos: "s", i: true }, { text: [325, 120], t: "a", pos: "e", i: true }, { text: [135, 120], t: "b", pos: "w", i: true },
      { arc: [40, 210, 30, 0, 39], label: "A" }, { arc: [380, 210, 30, 127.5, 180], label: "B" }, { arc: [250, 40, 26, 219, 321], label: "C" }
    ], cap: "Side $a$ is opposite angle $A$, and so on. The cosine rule pairs a side with its *own* opposite angle; the sine rule pairs each side with its opposite angle." } },

    { page: "Sine and cosine rules" },
    { callout: { t: "memorise", h: "Which rule when", body: [
      "**Cosine rule** — you know two sides and the angle between them (find the third side), or all three sides (find an angle: $\\cos A = \\frac{b^2 + c^2 - a^2}{2bc}$).",
      "**Sine rule** — you know a side and its opposite angle, plus one more side or angle.",
      "**Area** $= \\frac12 ab\\sin C$ — two sides and the included angle. Used backwards, a given area fixes $\\sin C$ — and then $C$ may be acute or obtuse.",
      "**Ambiguous case**: $\\sin C = 0.6$ gives $C = 36.9°$ or $143.1°$. Decide from the diagram, from \"obtuse\", from \"$BC$ is the longest side\", or from the angle sum."
    ] } },
    { callout: { t: "tip", h: "Why the ambiguous case exists", body: "$\\sin\\theta = \\sin(180° - \\theta)$: the sine curve is symmetric about $90°$, so a value of $\\sin$ between 0 and 1 belongs to two angles that add to $180°$. The cosine rule never has this problem, because $\\cos\\theta$ takes each value between $-1$ and $1$ exactly once on $0° \\le \\theta \\le 180°$ — an angle found by the cosine rule is unambiguous, which is why it is the safer choice when both are possible." } },
    { worked: { tag: "exam", title: "Area fixes $\\sin\\theta$; two values of $\\cos\\theta$; the longest side", src: "AS June 2018 · P1 Q7 · 6 marks",
      q: "In triangle $ABC$, $AB = 10$ cm, $AC = 5$ cm, angle $BAC = \\theta°$, and the area is $15$ cm$^2$. **(a)** Find the two possible values of $\\cos\\theta$. **(b)** Given that $BC$ is the longest side, find the exact length of $BC$.",
      steps: [
        { h: "(a)", m: "$\\tfrac12 \\times 10 \\times 5 \\times \\sin\\theta = 15 \\Rightarrow \\sin\\theta = \\dfrac35$", mk: "M1 A1" },
        { m: "$\\cos^2\\theta = 1 - \\dfrac{9}{25} = \\dfrac{16}{25} \\Rightarrow \\cos\\theta = \\pm\\dfrac45$", mk: "M1 A1", n: "Both signs: $\\theta$ could be acute ($\\cos > 0$) or obtuse ($\\cos < 0$)." },
        { h: "(b) Longest side opposite the largest angle ⇒ $\\theta$ is obtuse ⇒ $\\cos\\theta = -\\frac45$", m: "$BC^2 = 100 + 25 - 2(10)(5)\\left(-\\dfrac45\\right) = 125 + 80 = 205 \\Rightarrow BC = \\sqrt{205}$", mk: "M1 A1", n: "With $\\cos\\theta = +\\frac45$, $BC = \\sqrt{45} < 10$, so $BC$ would not be the longest side — that is the reason for the choice." }
      ], result: "(a) $\\pm\\frac45$ (b) $\\sqrt{205}$" } },
    { worked: { tag: "exam", title: "A quadratic from the cosine rule; then an angle by the sine rule", src: "AS June 2022 · P1 Q4 · 6 marks",
      q: "Triangle $ABC$ has $AB = (x + 2)$ cm, $BC = (3x + 10)$ cm, $AC = 7x$ cm, angle $BAC = 60°$ and angle $ACB = \\theta°$. **(a)(i)** Show that $17x^2 - 35x - 48 = 0$. **(ii)** Hence find $x$. **(b)** Hence find $\\theta$ to one decimal place.",
      steps: [
        { h: "(a)(i) Cosine rule on the side opposite $60°$", m: "$(3x + 10)^2 = (x + 2)^2 + (7x)^2 - 2(x + 2)(7x)\\cos60°$\n$9x^2 + 60x + 100 = x^2 + 4x + 4 + 49x^2 - 7x^2 - 14x$\n$0 = 34x^2 - 70x - 96 \\Rightarrow 17x^2 - 35x - 48 = 0$", mk: "M1 A1 A1*", n: "$\\cos60° = \\frac12$ halves the $2bc$ term." },
        { h: "(ii)", m: "$(17x + 16)(x - 3) = 0 \\Rightarrow x = 3$ (lengths are positive)", mk: "B1", n: "Sides: $AB = 5$, $BC = 19$, $AC = 21$." },
        { h: "(b) Sine rule for $\\theta$, opposite $AB = 5$", m: "$\\dfrac{\\sin\\theta}{5} = \\dfrac{\\sin60°}{19} \\Rightarrow \\sin\\theta = 0.2279 \\Rightarrow \\theta = 13.2°$", mk: "M1 A1", n: "Acute, because $\\theta$ is opposite the shortest side." }
      ], result: "$x = 3$; $\\theta = 13.2°$" } },
    { worked: { tag: "exam", title: "Roof beams: the ambiguous case decided by the diagram; whole-metre steel", src: "AS June 2020 · P1 Q5 · 6 marks",
      q: "A roof structure has beams $AB = 12$ m, $BC = BD = 7$ m, with $C$ on $AD$ and angle $BAC = 27°$; angle $ACB$ is obtuse in the diagram. **(a)** Find angle $ACB$ to one decimal place. **(b)** Steel beams are sold in whole metres. Find the minimum length of steel needed for the four beams $AB$, $BD$, $BC$, $AD$.",
      steps: [
        { h: "(a) Sine rule", m: "$\\dfrac{\\sin C}{12} = \\dfrac{\\sin27°}{7} \\Rightarrow \\sin C = 0.7783 \\Rightarrow C = 51.1°$ or $128.9°$; the diagram shows $C$ obtuse: **$128.9°$**", mk: "M1 A1 A1", n: "This is the ambiguous case in the wild. Giving $51.1°$ contradicts the figure." },
        { h: "(b) Need $AD = AC + CD$", m: "Angle $ABC = 180° - 27° - 128.9° = 24.1°$; $AC = \\dfrac{7\\sin24.1°}{\\sin27°} = 6.30$ m\nTriangle $BCD$ is isosceles ($BC = BD$) with base angles $180° - 128.9° = 51.1°$: $CD = 2 \\times 7\\cos51.1° = 8.79$ m\n$AD = 15.09$ m", mk: "M1 A1" },
        { m: "Total $= 12 + 7 + 7 + 15.09 = 41.09$ m, so **42 m** of steel (whole metres, rounded up)", mk: "A1", n: "Round *up* — 41 m is not enough." }
      ], result: "(a) $128.9°$ (b) 42 m" } },
    { worked: { tag: "exam", title: "Bearings to a cosine rule; why the distance is unrealistic", src: "AS June 2023 · P1 Q3 · 4 marks",
      q: "From mast $C$, mast $A$ is 8.2 km away on a bearing of $072°$ and mast $B$ is 15.6 km away on a bearing of $039°$. **(a)** Find the distance $AB$ to one decimal place. **(b)** An engineer travels from $A$ to $B$. Give a reason why the answer to (a) is unlikely to be the distance travelled.",
      steps: [
        { h: "(a) Angle at $C$ is the difference of the bearings", m: "$\\angle ACB = 72° - 39° = 33°$\n$AB^2 = 8.2^2 + 15.6^2 - 2(8.2)(15.6)\\cos33° \\Rightarrow AB = 9.8$ km", mk: "B1 M1 A1", fig: { w: 360, h: 260, items: [ { pt: [70, 230], label: "C", pos: "sw" }, { line: [[70, 230], [70, 40]], c: "muted", arrow: true, label: "N", lpos: 1, loff: -12 }, { pt: [253, 173], label: "A", pos: "e" }, { pt: [190, 41], label: "B", pos: "ne" }, { line: [[70, 230], [253, 173]], c: "accent", label: "8.2 km", loff: -12 }, { line: [[70, 230], [190, 41]], c: "accent", label: "15.6 km", loff: 12 }, { line: [[253, 173], [190, 41]], c: "accent2", dash: true, label: "AB", loff: 12 }, { arc: [70, 230, 40, 18, 90], label: "72°", c: "muted", loff: 14 }, { arc: [70, 230, 58, 51, 90], label: "39°", c: "muted", loff: 14 } ], cap: "Bearings are measured clockwise from north; the angle between the two directions is $72° - 39° = 33°$." } },
        { h: "(b)", m: "The straight-line distance ignores roads, terrain and obstacles — the engineer cannot travel in a straight line.", mk: "B1" }
      ], result: "(a) $9.8$ km" } },
    { worked: { tag: "exam", title: "Two triangles sharing a side: show $x$ by the sine rule, then $AB$", src: "AS June 2024 · P1 Q4 · 5 marks",
      q: "$ADC$ is a straight line; in triangle $BCD$, $BD = (x + 3)$ cm, $BC = x$ cm, angle $BDC = 30°$, angle $BCD = 140°$. **(a)** Show that $x = 10.5$ to 3 s.f. **(b)** Given $AD = (x - 2)$ cm, find $AB$ to 3 s.f.",
      steps: [
        { h: "(a) Angle $CBD = 10°$; sine rule with each side opposite its angle", m: "$\\dfrac{x + 3}{\\sin140°} = \\dfrac{x}{\\sin30°} \\Rightarrow \\tfrac12(x + 3) = x\\sin140° \\Rightarrow 1.5 = x(0.6428 - 0.5) \\Rightarrow x = 10.5$", mk: "M1 A1 A1*", n: "$BD$ is opposite $C$ ($140°$); $BC$ is opposite $D$ ($30°$). Collect the $x$ terms, then divide." },
        { h: "(b) Triangle $ABD$: the angle at $D$ is on the straight line $ADC$", m: "$\\angle ADB = 180° - 30° = 150°$; $AD = 8.5$, $BD = 13.5$\n$AB^2 = 8.5^2 + 13.5^2 - 2(8.5)(13.5)\\cos150° = 72.25 + 182.25 + 198.75 = 453.25 \\Rightarrow AB = 21.3$ cm", mk: "M1 A1", n: "The trap: using $30°$ at $D$. $D$ lies between $A$ and $C$, so the angle inside triangle $ABD$ is the *supplement*. $\\cos150° = -\\cos30°$ makes the last term positive." }
      ], result: "(a) $x = 10.5$ (b) $AB = 21.3$ cm" } },
    { worked: { tag: "exam", title: "Parallelogram: obtuse angle from the area, then a diagonal", src: "AS Nov 2021 · P1 Q7 · 5 marks",
      q: "Parallelogram $PQRS$ has area $50$ cm$^2$, $PQ = 14$ cm, $QR = 7$ cm and angle $SPQ$ is obtuse. **(a)** Find angle $SPQ$ to 2 d.p. **(b)** Find the length of the diagonal $SQ$ to 1 d.p.",
      steps: [
        { h: "(a) Area of a parallelogram $= ab\\sin\\theta$ (two triangles)", m: "$14 \\times 7 \\times \\sin P = 50 \\Rightarrow \\sin P = \\dfrac{50}{98} \\Rightarrow P = 30.68°$ or $180° - 30.68° = 149.32°$; obtuse: $P = 149.32°$", mk: "M1 A1 A1" },
        { h: "(b) Triangle $SPQ$: $SP = QR = 7$, $PQ = 14$, included angle $P$", m: "$SQ^2 = 14^2 + 7^2 - 2(14)(7)\\cos149.32° \\Rightarrow SQ = 20.3$ cm", mk: "M1 A1" }
      ], result: "(a) $149.32°$ (b) $20.3$ cm" } },

    { page: "Radians, arcs and sectors" },
    { callout: { t: "memorise", h: "The radian", body: [
      "One radian is the angle at the centre that cuts off an arc equal in length to the radius. So a full turn is $2\\pi$ radians: $\\pi = 180°$, $\\frac{\\pi}{2} = 90°$, $\\frac{\\pi}{3} = 60°$, $\\frac{\\pi}{4} = 45°$, $\\frac{\\pi}{6} = 30°$.",
      "$$s = r\\theta \\qquad A_{\\text{sector}} = \\tfrac12 r^2\\theta \\qquad A_{\\text{segment}} = \\tfrac12 r^2(\\theta - \\sin\\theta) \\qquad \\text{chord} = 2r\\sin\\tfrac{\\theta}{2}$$",
      "**Only with $\\theta$ in radians.** In degrees the formulae are $\\frac{\\theta}{360} \\times 2\\pi r$ and $\\frac{\\theta}{360}\\pi r^2$ — the 2019 P2 Q3 error was exactly this."
    ] } },
    { fig: { w: 420, h: 250, items: [
      { arc: [60, 210, 180, 0, 55], c: "accent", w: 2.2 },
      { line: [[60, 210], [240, 210]], c: "text2", label: "r", loff: 12 }, { line: [[60, 210], [60 + 180 * Math.cos(55 * Math.PI / 180), 210 - 180 * Math.sin(55 * Math.PI / 180)]], c: "text2", label: "r", loff: -12 },
      { arc: [60, 210, 34, 0, 55], label: "θ", c: "accent2" },
      { text: [250, 100], t: "arc s = rθ", c: "accent", i: true, pos: "e" }, { text: [150, 175], t: "A = ½r²θ", c: "text2", i: true },
      { line: [[240, 210], [60 + 180 * Math.cos(55 * Math.PI / 180), 210 - 180 * Math.sin(55 * Math.PI / 180)]], c: "accent3", dash: true, label: "chord", loff: 12 },
      { pt: [60, 210], label: "O", pos: "sw" }
    ], cap: "Sector $OAB$ with angle $\\theta$ radians: arc $r\\theta$, area $\\frac12 r^2\\theta$. The segment is the sector minus the triangle $\\frac12 r^2\\sin\\theta$." } },
    { callout: { t: "tip", h: "Why $s = r\\theta$ and $A = \\frac12 r^2\\theta$", body: "A full circle has circumference $2\\pi r$ and angle $2\\pi$; a sector is the fraction $\\frac{\\theta}{2\\pi}$ of it: $s = \\frac{\\theta}{2\\pi} \\times 2\\pi r = r\\theta$. The same fraction of the area $\\pi r^2$ gives $\\frac12 r^2\\theta$. Radians make the fraction cancel to something simple; that is the whole reason they exist." } },
    { worked: { tag: "exam", title: "Sector: area and a perimeter condition give $\\theta$ and $r$", src: "A-level June 2018 · P1 Q3 · 4 marks",
      q: "A sector $AOB$ has radius $r$ cm and angle $\\theta$ radians. Its area is $11$ cm$^2$ and its perimeter is 4 times the length of the arc $AB$. Find the exact value of $r$.",
      steps: [
        { h: "Perimeter condition", m: "$2r + r\\theta = 4r\\theta \\Rightarrow 2r = 3r\\theta \\Rightarrow \\theta = \\dfrac23$", mk: "M1 A1", n: "Perimeter of a sector = two radii + arc. The $r$ cancels." },
        { h: "Area", m: "$\\tfrac12 r^2 \\cdot \\dfrac23 = 11 \\Rightarrow r^2 = 33 \\Rightarrow r = \\sqrt{33}$", mk: "M1 A1" }
      ], result: "$r = \\sqrt{33}$" } },
    { worked: { tag: "exam", title: "Spot the student's error: degrees in a radian formula", src: "A-level June 2019 · P2 Q3 · 3 marks",
      q: "A sector has radius 5 cm and angle $40°$. A student writes: area $= \\frac12 r^2\\theta = \\frac12 \\times 5^2 \\times 40 = 500$ cm$^2$. **(a)** Explain the error. **(b)** Write out a correct solution.",
      steps: [
        { h: "(a)", m: "The formula $\\frac12 r^2\\theta$ requires $\\theta$ in **radians**; the student used $40$ degrees.", mk: "B1", n: "500 cm$^2$ is bigger than the whole circle ($25\\pi \\approx 78.5$) — a sanity check that should have caught it." },
        { h: "(b)", m: "$40° = \\dfrac{40\\pi}{180} = \\dfrac{2\\pi}{9}$; area $= \\tfrac12 \\times 25 \\times \\dfrac{2\\pi}{9} = \\dfrac{25\\pi}{9} \\approx 8.73$ cm$^2$", mk: "M1 A1" }
      ], result: "$\\frac{25\\pi}{9}$ cm$^2$" } },
    { worked: { tag: "exam", title: "Major sector given — find the minor arc in the form $a\\pi + b$", src: "A-level Specimen · P2 Q1 · 4 marks",
      q: "The area of the major sector $AOB$ is $135$ cm$^2$ and the reflex angle $AOB$ is $4.8$ radians. Find the exact length of the minor arc $AB$ in the form $a\\pi + b$.",
      steps: [
        { m: "$\\tfrac12 r^2(4.8) = 135 \\Rightarrow r^2 = 56.25 \\Rightarrow r = 7.5$", mk: "M1 A1" },
        { h: "Minor angle $= 2\\pi - 4.8$", m: "minor arc $= 7.5(2\\pi - 4.8) = 15\\pi - 36$", mk: "M1 A1", n: "$a = 15$, $b = -36$. \"Exact\" and \"in the form\" — no decimals." }
      ], result: "$15\\pi - 36$" } },
    { worked: { tag: "exam", title: "A logo of two sectors: angle, area and perimeter in terms of $r$ and $\\theta$", src: "A-level Oct 2021 · P2 Q6 · 5 marks",
      q: "$OABCDEFO$ is a logo: $OAB$ is a sector of radius $r$; $OFE$ is congruent to $OAB$; $OCD$ is a sector of radius $2r$ with angle $COD = \\theta$; $AOF$ is a straight line. **(a)** Write down angle $AOB$ in terms of $\\theta$. **(b)** Show that the area is $\\frac12 r^2(3\\theta + \\pi)$. **(c)** Find the perimeter in simplest form.",
      steps: [
        { h: "(a) Angles on the straight line $AOF$", m: "$\\angle AOB = \\dfrac{\\pi - \\theta}{2}$", mk: "B1" },
        { h: "(b)", m: "$2 \\times \\tfrac12 r^2 \\cdot \\dfrac{\\pi - \\theta}{2} + \\tfrac12(2r)^2\\theta = \\dfrac{r^2(\\pi - \\theta)}{2} + 2r^2\\theta = \\tfrac12 r^2(\\pi - \\theta + 4\\theta) = \\tfrac12 r^2(3\\theta + \\pi)$", mk: "M1 A1*" },
        { h: "(c) Go round the boundary", m: "$OA + \\text{arc}AB + BC + \\text{arc}CD + DE + \\text{arc}EF + FO = r + r\\cdot\\dfrac{\\pi - \\theta}{2} + r + 2r\\theta + r + r\\cdot\\dfrac{\\pi - \\theta}{2} + r = r(4 + \\pi + \\theta)$", mk: "M1 A1", n: "$BC$ and $DE$ are the radial gaps from radius $r$ to radius $2r$ — length $r$ each. Trace the outline with a finger and list every piece." }
      ], result: "(a) $\\frac{\\pi - \\theta}{2}$ (c) $r(4 + \\pi + \\theta)$" } },
    { worked: { tag: "exam", title: "Stage plan: sector plus two congruent triangles", src: "A-level June 2023 · P1 Q8 · 10 marks",
      q: "A stage is two congruent triangles $ABO$, $GFO$ joined to a sector $OCDEO$, centre $O$, with angle $COE = 2.3$ rad, arc $CDE = 27.6$ m and $AOG$ a straight line of length 15 m. **(a)** Show that $OC = 12$ m. **(b)** Show that angle $AOB = 0.421$ rad (3 d.p.). Given the total length of the front $BCDEF$ is 35 m, **(c)** find the total area to the nearest m$^2$.",
      steps: [
        { h: "(a)", m: "$s = r\\theta \\Rightarrow r = \\dfrac{27.6}{2.3} = 12$", mk: "M1 A1*" },
        { h: "(b) Angles on the straight line $AOG$, symmetric", m: "$\\angle AOB = \\dfrac{\\pi - 2.3}{2} = 0.4208 = 0.421$ rad", mk: "M1 A1*" },
        { h: "(c) $BC = EF$ from the front length; then two triangle areas plus the sector", m: "$BC = EF = \\dfrac{35 - 27.6}{2} = 3.7$, so $OB = 12 + 3.7 = 15.7$ and $OA = 7.5$\nTriangles: $2 \\times \\tfrac12 \\times 7.5 \\times 15.7 \\times \\sin0.4208 = 48.1$\nSector: $\\tfrac12 \\times 12^2 \\times 2.3 = 165.6$\nTotal $= 213.7 \\to$ **214 m$^2$**", mk: "M1 A1 M1 A1 M1 A1", n: "Radians throughout — $\\sin 0.4208$ with the calculator in radian mode." }
      ], result: "(c) $214$ m$^2$" } },
    { worked: { tag: "exam", title: "Badge: a region between two arcs, exact area $a\\sqrt3 + b\\pi$", src: "A-level June 2024 · P1 Q11 · 4 marks",
      q: "$ABCOA$ is a semicircle with centre $O$ and diameter $AC = 10$ cm. $OB$ is an arc of a circle with centre $A$ and radius 5 cm. The region $R$ is bounded by the arc $OB$, the arc $BC$ and the line $OC$. Find the exact area of $R$ in the form $(a\\sqrt3 + b\\pi)$ cm$^2$.",
      steps: [
        { h: "Triangle $OAB$ is equilateral", m: "$OA = OB = 5$ (radii of the semicircle) and $AB = 5$ (radius of the arc), so $\\angle BAO = \\angle AOB = \\dfrac{\\pi}{3}$", mk: "B1", n: "Spotting the equilateral triangle is the whole question." },
        { h: "$R$ = semicircle − (sector $ABO$ centre $A$) − (segment cut off by chord $AB$)", m: "Semicircle $= \\dfrac{25\\pi}{2}$; sector at $A$: $\\tfrac12 \\cdot 25 \\cdot \\dfrac{\\pi}{3} = \\dfrac{25\\pi}{6}$; segment: $\\tfrac12 \\cdot 25\\left(\\dfrac{\\pi}{3} - \\sin\\dfrac{\\pi}{3}\\right) = \\dfrac{25\\pi}{6} - \\dfrac{25\\sqrt3}{4}$", mk: "M1 M1", fig: { w: 400, h: 230, items: [ { arc: [200, 200, 150, 0, 180], c: "text2" }, { line: [[50, 200], [350, 200]], c: "text2" }, { arc: [50, 200, 150, 0, 60], c: "accent2", w: 2 }, { poly: [[200, 200], [350, 200], [275, 70]], fill: "accent", alpha: 0.02, c: "muted", dash: true }, { pt: [50, 200], label: "A", pos: "sw" }, { pt: [200, 200], label: "O", pos: "s" }, { pt: [350, 200], label: "C", pos: "se" }, { pt: [125, 70], label: "B", pos: "n" }, { text: [255, 135], t: "R", i: true, size: 14 }, { line: [[50, 200], [125, 70]], c: "muted", dash: true }, { line: [[200, 200], [125, 70]], c: "muted", dash: true } ], cap: "$AB = OA = OB = 5$: the triangle is equilateral, so the arc $OB$ (centre $A$) subtends $60°$." } },
        { m: "$R = \\dfrac{25\\pi}{2} - \\dfrac{25\\pi}{6} - \\left(\\dfrac{25\\pi}{6} - \\dfrac{25\\sqrt3}{4}\\right) = \\dfrac{25\\sqrt3}{4} + \\dfrac{25\\pi}{6}$", mk: "A1 A1", n: "$a = \\frac{25}{4}$, $b = \\frac{25}{6}$. Alternative: $R$ = semicircle − (sector $ABO$ centre $A$) − (sector $AOB$ centre $O$) + (triangle $AOB$)." }
      ], result: "$\\frac{25}{4}\\sqrt3 + \\frac{25}{6}\\pi$" } },
    { worked: { tag: "exam", title: "Triangle containing a sector: angle in radians by the cosine rule, then the region", src: "A-level June 2025 · P2 Q4 · 5 marks",
      q: "$ABCD$ consists of triangle $ABD$ containing a sector $ABC$ of a circle with centre $B$; $AD = 6.4$ cm, $BD = 13$ cm, $BA = BC = 8$ cm. **(a)** Show that angle $ABC = 0.394$ radians (3 s.f.). **(b)** The region $R$ is bounded by $CD$, $DA$ and the arc $AC$. Find the area of $R$ to 3 s.f.",
      steps: [
        { h: "(a) Cosine rule for the angle at $B$ in triangle $ABD$", m: "$\\cos B = \\dfrac{13^2 + 8^2 - 6.4^2}{2 \\times 13 \\times 8} = \\dfrac{192.04}{208} = 0.9233 \\Rightarrow B = 0.394$ rad", mk: "M1 A1*", n: "Calculator in radian mode, or convert $22.6°$." },
        { h: "(b) Triangle minus sector", m: "$\\tfrac12 \\times 8 \\times 13 \\times \\sin0.3943 - \\tfrac12 \\times 8^2 \\times 0.3943 = 19.97 - 12.62 = 7.36$ cm$^2$", mk: "M1 M1 A1", n: "Use the unrounded angle." }
      ], result: "(b) $7.36$ cm$^2$" } },
    { worked: { tag: "exam", title: "Optimisation on a sector-based shape (link to 7.3)", src: "A-level June 2025 · P1 Q15 · 9 marks",
      q: "A stage is a sector $AOB$ (radius $r$ m, angle $\\theta$ rad) joined to a rectangle $OBCD$ of length $r$ and width $\\frac{1}{10}r$; the total area is $240$ m$^2$. **(a)** Show that the perimeter is $P = 2r + \\frac{480}{r}$. **(b)** Find the minimum perimeter, justifying that it is a minimum.",
      steps: [
        { h: "(a) Area gives $\\theta$ in terms of $r$", m: "$\\tfrac12 r^2\\theta + \\dfrac{r^2}{10} = 240 \\Rightarrow r\\theta = \\dfrac{480}{r} - \\dfrac{r}{5}$", mk: "M1 A1" },
        { m: "$P = OA + \\text{arc} + BC + CD + DO = r + r\\theta + \\dfrac{r}{10} + r + \\dfrac{r}{10} = 2r + \\dfrac{r}{5} + \\dfrac{480}{r} - \\dfrac{r}{5} = 2r + \\dfrac{480}{r}$", mk: "M1 A1*", n: "The $\\frac r5$ terms cancel — a sign the setup is right." },
        { h: "(b)", m: "$\\dfrac{dP}{dr} = 2 - \\dfrac{480}{r^2} = 0 \\Rightarrow r = \\sqrt{240}$; $\\dfrac{d^2P}{dr^2} = \\dfrac{960}{r^3} > 0$: minimum\n$P = 2\\sqrt{240} + \\dfrac{480}{\\sqrt{240}} = 4\\sqrt{240} = 62.0$ m", mk: "M1 A1 M1 A1 A1" }
      ], result: "$P_{\\min} = 4\\sqrt{240} \\approx 62.0$ m" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Find the two possible values of $\\cos\\theta$**", "$\\sin\\theta$ from the area, then $\\pm\\sqrt{1 - \\sin^2\\theta}$"],
      ["**Find angle … to one decimal place** (sine rule)", "both candidate angles considered, one chosen with a reason from the diagram or the sides"],
      ["**Show that … radians to 3 s.f.**", "the rule applied with the calculator in radian mode; unrounded value then rounded"],
      ["**Exact length / area in the form $a\\pi + b$**", "no decimals; keep $\\pi$ and surds"],
      ["**Explain the error**", "name it (degrees in a radian formula) — and a corrected solution if asked"],
      ["**Find the perimeter**", "every edge of the outline listed: radii, arcs, straight joins"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Degrees in $r\\theta$ or $\\frac12 r^2\\theta$.**",
      "**Wrong angle in the cosine rule**: the angle must be *between* the two sides used.",
      "**Missing the obtuse option** from the sine rule (or taking it when the diagram shows acute).",
      "**Perimeter of a sector without the two radii**, or a composite shape's perimeter missing the joins.",
      "**Segment vs sector**: segment $= \\frac12 r^2(\\theta - \\sin\\theta)$.",
      "**Rounding the angle early** before using it in a later part."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Angle unit", "**SETTINGS → Angle Unit**: Degree or Radian. The status bar shows D or R — check it before every trig question. Mixed questions (bearings in degrees, sector in radians) need a switch mid-question."],
      ["Second angle", "After $\\sin^{-1}$ gives $\\theta$, the other candidate is $180° - \\theta$ (or $\\pi - \\theta$)."],
      ["Degrees to radians", "Multiply by $\\pi \\div 180$; or type $40$ then the degree symbol (CATALOG → Angle) while in radian mode and it converts."]
    ] },
    { callout: { t: "mnemonic", h: "\"Two sides and the angle between — cosine; a side facing its angle — sine\"", body: "Decides the rule in one glance. And \"$\\pi$ is a straight line\": $180° = \\pi$, so $60° = \\frac{\\pi}{3}$ because $180 \\div 3 = 60$." } }
  ],
  flashcards: [
    ["Cosine rule and sine rule?", "$a^2 = b^2 + c^2 - 2bc\\cos A$; $\\frac{a}{\\sin A} = \\frac{b}{\\sin B}$."],
    ["Area of a triangle from two sides and the included angle?", "$\\frac12 ab\\sin C$."],
    ["Arc length, sector area, segment area (radians)?", "$r\\theta$; $\\frac12 r^2\\theta$; $\\frac12 r^2(\\theta - \\sin\\theta)$."],
    ["Why does the sine rule have an ambiguous case?", "$\\sin\\theta = \\sin(180° - \\theta)$; the cosine rule does not because $\\cos$ is one-to-one on $[0°, 180°]$."],
    ["$60°$, $45°$, $30°$ in radians?", "$\\frac{\\pi}{3}$, $\\frac{\\pi}{4}$, $\\frac{\\pi}{6}$."],
    ["Sector: area 11, perimeter $= 4 \\times$ arc: $r$?", "$\\theta = \\frac23$, $r = \\sqrt{33}$."],
    ["Major sector 135 cm$^2$, reflex angle 4.8: minor arc?", "$r = 7.5$; $7.5(2\\pi - 4.8) = 15\\pi - 36$."],
    ["Perimeter of a sector?", "$2r + r\\theta$ — do not forget the two radii."],
    ["Area 15, sides 10 and 5: $\\cos\\theta$?", "$\\sin\\theta = 0.6$, $\\cos\\theta = \\pm0.8$."],
    ["Angle between bearings $072°$ and $039°$ from the same point?", "$33°$."],
    ["Why is one radian defined as it is?", "The angle whose arc equals the radius; then $s = r\\theta$ exactly and a full turn is $2\\pi$."]
  ],
  quiz: [
    { q: "$150°$ in radians:", opts: ["$\\tfrac{5\\pi}{6}$", "$\\tfrac{2\\pi}{3}$", "$\\tfrac{5\\pi}{4}$", "$\\tfrac{3\\pi}{4}$"], ans: 0, why: "$150/180 = 5/6$." },
    { q: "Arc length for $r = 6$, $\\theta = \\frac{\\pi}{3}$:", opts: ["$2\\pi$", "$\\pi$", "$6\\pi$", "$18$"], ans: 0, why: "$6 \\times \\frac{\\pi}{3}$." },
    { q: "Sector area for $r = 4$, $\\theta = 1.5$:", opts: ["12", "6", "24", "3"], ans: 0, why: "$\\frac12 \\times 16 \\times 1.5$." },
    { q: "$\\sin C = 0.6$ in a triangle: $C$ could be", opts: ["$36.9°$ only", "$36.9°$ or $143.1°$", "$53.1°$", "$36.9°$ or $216.9°$"], ans: 1, why: "Supplementary pair." },
    { q: "Third side with $b = 5$, $c = 7$, $A = 60°$:", opts: ["$\\sqrt{39}$", "$\\sqrt{109}$", "$\\sqrt{74}$", "$\\sqrt{44}$"], ans: 0, why: "$25 + 49 - 35$." },
    { q: "A student computes $\\frac12 \\times 5^2 \\times 40 = 500$ for a sector of angle $40°$. The error:", opts: ["wrong radius", "angle must be in radians", "should be $r^2\\theta$", "should divide by 360 only"], ans: 1, why: "Formula needs radians." },
    { q: "Segment area with $r = 2$, $\\theta = \\frac{\\pi}{2}$:", opts: ["$\\pi - 2$", "$\\pi$", "$2$", "$\\pi + 2$"], ans: 0, why: "$\\frac12 \\times 4(\\frac{\\pi}{2} - 1)$." }
  ]
};

/* =====================================================================
   5.2  Small angle approximations
   ===================================================================== */
C["maths:5.2"] = {
  notes: [
    { h: "Small angle approximations — the whole topic on one page" },
    { callout: { t: "memorise", h: "For small $\\theta$ in RADIANS", body: [
      "$$\\sin\\theta \\approx \\theta \\qquad \\cos\\theta \\approx 1 - \\dfrac{\\theta^2}{2} \\qquad \\tan\\theta \\approx \\theta$$",
      "Not in the booklet. They come from the graphs: near the origin $y = \\sin\\theta$ and $y = \\tan\\theta$ hug the line $y = \\theta$; $y = \\cos\\theta$ hugs the parabola $1 - \\frac{\\theta^2}{2}$.",
      "For a multiple, substitute: $\\sin 3\\theta \\approx 3\\theta$, $\\cos 4\\theta \\approx 1 - 8\\theta^2$, $\\tan\\frac{\\theta}{2} \\approx \\frac{\\theta}{2}$."
    ] } },
    { fig: { x: [-1.6, 1.6], y: [-0.6, 1.4], axes: { pi: false, xt: [-1, -0.5, 0.5, 1], yt: [0.5, 1] }, items: [
      { fn: "sin(x)", c: "accent", label: "sin θ", at: 1.4, pos: "s" },
      { fn: "x", c: "accent", dash: true, label: "θ", at: 1.2, pos: "n" },
      { fn: "cos(x)", c: "accent3", label: "cos θ", at: -1.35, pos: "n" },
      { fn: "1-x*x/2", c: "accent3", dash: true, label: "1 − θ²/2", at: -1.45, pos: "s" }
    ], cap: "The approximations are the curves' tangent line (sine) and best-fitting parabola (cosine) at $\\theta = 0$. Inside about $\\pm0.3$ rad they are almost indistinguishable." } },
    { ul: [
      "**Why radians?** The gradient of $\\sin\\theta$ at 0 is exactly 1 only in radians (it is $\\frac{\\pi}{180}$ in degrees). $\\sin 5° \\approx 5$ is nonsense; $\\sin(0.0873) \\approx 0.0873$ is right.",
      "**Where they come from**: the Maclaurin series ($\\sin\\theta = \\theta - \\frac{\\theta^3}{6} + \\cdots$) — not on the spec, but it explains why $\\cos$ keeps a $\\theta^2$ term while $\\sin$ and $\\tan$ stop at $\\theta$: the next terms are $\\theta^3$ and negligible.",
      "**Uses**: approximate a trig expression (usually a fraction whose top and bottom both $\\to 0$), estimate a root or stationary point of an equation mixing polynomials and trig, and Paper 3's small-angle kinematics."
    ] },

    { page: "Approximating expressions" },
    { callout: { t: "memorise", h: "Routine", body: [
      "1. Replace each $\\sin(k\\theta)$ and $\\tan(k\\theta)$ by $k\\theta$, each $\\cos(k\\theta)$ by $1 - \\frac{k^2\\theta^2}{2}$.",
      "2. Expand and simplify. Keep the powers of $\\theta$ the question needs (usually up to $\\theta^2$); drop $\\theta^3$ and beyond as negligible — say so.",
      "3. In a fraction, cancel the common power of $\\theta$: $\\frac{8\\theta^2}{6\\theta^2} = \\frac43$.",
      "4. If a numerical value is wanted, the approximation may reduce to a constant, or you substitute the given small $\\theta$ **in radians**."
    ] } },
    { worked: { tag: "exam", title: "$\\frac{1 - \\cos 4\\theta}{2\\theta\\sin 3\\theta}$", src: "A-level June 2018 · P1 Q1 · 3 marks",
      q: "Given $\\theta$ is small and measured in radians, use the small angle approximations to find an approximate value of $\\frac{1 - \\cos 4\\theta}{2\\theta\\sin 3\\theta}$.",
      steps: [
        { m: "$1 - \\cos 4\\theta \\approx 1 - \\left(1 - \\dfrac{16\\theta^2}{2}\\right) = 8\\theta^2; \\qquad 2\\theta\\sin 3\\theta \\approx 2\\theta \\cdot 3\\theta = 6\\theta^2$", mk: "M1 A1", n: "$\\cos 4\\theta \\approx 1 - \\frac{(4\\theta)^2}{2}$ — square the multiple." },
        { m: "$\\dfrac{8\\theta^2}{6\\theta^2} = \\dfrac43$", mk: "A1", n: "The $\\theta^2$ cancels: the expression tends to a constant as $\\theta \\to 0$." }
      ], result: "$\\dfrac43$" } },
    { worked: { tag: "exam", title: "$4\\sin\\frac{\\theta}{2} + 3\\cos^2\\theta \\approx a + b\\theta + c\\theta^2$", src: "A-level Oct 2021 · P2 Q4 · 3 marks",
      q: "Given $\\theta$ is small and in radians, show that $4\\sin\\frac{\\theta}{2} + 3\\cos^2\\theta \\approx a + b\\theta + c\\theta^2$, where $a$, $b$, $c$ are integers to be found.",
      steps: [
        { m: "$4\\sin\\dfrac{\\theta}{2} \\approx 4 \\cdot \\dfrac{\\theta}{2} = 2\\theta$", mk: "B1" },
        { m: "$\\cos^2\\theta \\approx \\left(1 - \\dfrac{\\theta^2}{2}\\right)^2 = 1 - \\theta^2 + \\dfrac{\\theta^4}{4} \\approx 1 - \\theta^2$", mk: "M1", n: "Square the approximation and discard $\\theta^4$ — the question only wants terms up to $\\theta^2$." },
        { m: "$2\\theta + 3(1 - \\theta^2) = 3 + 2\\theta - 3\\theta^2$: $a = 3$, $b = 2$, $c = -3$", mk: "A1" }
      ], result: "$3 + 2\\theta - 3\\theta^2$" } },
    { worked: { tag: "exam", title: "$\\frac{\\theta\\tan 2\\theta}{1 - \\cos 3\\theta}$", src: "A-level June 2024 · P2 Q5 · 3 marks",
      q: "Given $\\theta$ is small and in radians, find an approximate numerical value of $\\frac{\\theta\\tan 2\\theta}{1 - \\cos 3\\theta}$.",
      steps: [
        { m: "Numerator $\\approx \\theta \\cdot 2\\theta = 2\\theta^2$; denominator $\\approx 1 - \\left(1 - \\dfrac{9\\theta^2}{2}\\right) = \\dfrac{9\\theta^2}{2}$", mk: "M1 A1" },
        { m: "$\\dfrac{2\\theta^2}{9\\theta^2/2} = \\dfrac49$", mk: "A1" }
      ], result: "$\\dfrac49$" } },
    { worked: { tag: "exam", title: "Show an approximation; then find the mistake in a degrees check", src: "A-level Specimen · P2 Q2 · 5 marks",
      q: "**(a)** Given $\\theta$ is small, use the small angle approximation for $\\cos\\theta$ to show that $1 + 4\\cos\\theta + 3\\cos^2\\theta \\approx 8 - 5\\theta^2$. Adele tests it with $\\theta = 5°$: she computes $1 + 4\\cos5° + 3\\cos^2 5° = 7.962$ and $8 - 5(5)^2 = -117$, and concludes the approximation is false. **(b)(i)** Identify her mistake. **(ii)** Show that $8 - 5\\theta^2$ does give a good approximation for $5°$.",
      steps: [
        { h: "(a)", m: "$1 + 4\\left(1 - \\dfrac{\\theta^2}{2}\\right) + 3\\left(1 - \\dfrac{\\theta^2}{2}\\right)^2 \\approx 1 + 4 - 2\\theta^2 + 3 - 3\\theta^2 = 8 - 5\\theta^2$", mk: "M1 A1 A1*", n: "$(1 - \\frac{\\theta^2}{2})^2 \\approx 1 - \\theta^2$ dropping $\\theta^4$." },
        { h: "(b)(i)", m: "She substituted $\\theta = 5$ (degrees) into $8 - 5\\theta^2$; the approximation only holds for $\\theta$ in **radians**.", mk: "B1" },
        { h: "(ii)", m: "$5° = \\dfrac{5\\pi}{180} = 0.08727$ rad: $8 - 5(0.08727)^2 = 7.962$, matching her calculator value.", mk: "B1" }
      ], result: "shown; degrees vs radians" } },
    { worked: { tag: "exam", title: "Chain of approximations with a \"very small\" deduction", src: "A-level June 2025 · P2 Q6 · 6 marks",
      q: "**(a)** Given $x$ is small and in radians, use the approximation for $\\cos\\theta$ to show that $1 - \\cos^2(2x) \\approx 4x^2 - 4x^4$. **(b)** Hence show that $\\frac{1 - \\cos^2(2x)}{\\sin\\left(\\frac{x}{3}\\right)\\tan\\left(\\frac{x}{2}\\right)} \\approx a + bx^2$. **(c)** Hence, given $x$ is **very** small, deduce an approximate value for the expression in (b), giving a reason.",
      steps: [
        { h: "(a)", m: "$\\cos 2x \\approx 1 - 2x^2$, so $\\cos^2 2x \\approx 1 - 4x^2 + 4x^4$ and $1 - \\cos^2 2x \\approx 4x^2 - 4x^4$", mk: "M1 A1*", n: "Here the $x^4$ term is **kept** because the question prints it." },
        { h: "(b)", m: "$\\sin\\dfrac{x}{3}\\tan\\dfrac{x}{2} \\approx \\dfrac{x}{3} \\cdot \\dfrac{x}{2} = \\dfrac{x^2}{6}$; $\; \\dfrac{4x^2 - 4x^4}{x^2/6} = 24 - 24x^2$: $a = 24$, $b = -24$", mk: "M1 A1" },
        { h: "(c)", m: "For very small $x$, $24x^2$ is negligible, so the expression $\\approx 24$.", mk: "M1 A1", n: "\"Giving a reason\": the $x^2$ term is negligible compared with the constant." }
      ], result: "(b) $24 - 24x^2$ (c) $\\approx 24$" } },

    { page: "Estimating roots and stationary points" },
    "Small angles turn a transcendental equation into a quadratic. The estimate is only trustworthy when the root really is small — the question will say so, or a graph will show it.",
    { worked: { tag: "exam", title: "One real root of $\\cos x - 2x - \\frac12 = 0$, estimated", src: "A-level June 2019 · P1 Q2 · 5 marks",
      q: "The graph of $y = \\cos x$ is given. **(a)** Use it to show why $\\cos x - 2x - \\frac12 = 0$ has only one real root. **(b)** Given the root $\\alpha$ is small, use the small angle approximation for $\\cos x$ to estimate $\\alpha$ to 3 d.p.",
      steps: [
        { h: "(a) Rearrange as two graphs", m: "$\\cos x = 2x + \\dfrac12$: the line $y = 2x + \\frac12$ crosses $y = \\cos x$ exactly once (for $x > \\frac14$ the line exceeds 1; for $x < -\\frac34$ it is below $-1$), so there is one real root.", mk: "M1 A1", fig: { x: [-2, 2], y: [-1.5, 2], axes: { xt: [-1, 1], yt: [-1, 1, 2] }, items: [ { fn: "cos(x)", label: "y = cos x", at: -1.6, pos: "s" }, { fn: "2*x+0.5", c: "accent3", label: "y = 2x + ½", at: 0.6, pos: "e" }, { pt: [0.236, 0.972], label: "α", pos: "nw" } ], cap: "One crossing: the line leaves the band $-1 \\le y \\le 1$ on both sides." }, n: "The argument is about the line escaping the range of $\\cos$." },
        { h: "(b)", m: "$1 - \\dfrac{x^2}{2} - 2x - \\dfrac12 = 0 \\Rightarrow x^2 + 4x - 1 = 0 \\Rightarrow x = -2 \\pm \\sqrt5$; the small root is $\\alpha \\approx -2 + \\sqrt5 = 0.236$", mk: "M1 A1 A1", n: "Reject $-2 - \\sqrt5 = -4.24$: not small, so the approximation is invalid there anyway." }
      ], result: "$\\alpha \\approx 0.236$" } },
    { worked: { tag: "exam", title: "Stationary point from $f'(x) = 2x + \\frac12\\cos x$; tangent at $(0, 3)$", src: "A-level June 2023 · P1 Q4 · 5 marks",
      q: "$f'(x) = 2x + \\frac12\\cos x$ and the curve $y = f(x)$ has a stationary point at $x = \\alpha$, where $\\alpha$ is small. **(a)** Use the small angle approximation for $\\cos x$ to estimate $\\alpha$ to 3 d.p. **(b)** $P(0, 3)$ lies on the curve. Find the tangent at $P$ in the form $y = mx + c$.",
      steps: [
        { h: "(a) $f'(\\alpha) = 0$", m: "$2x + \\dfrac12\\left(1 - \\dfrac{x^2}{2}\\right) = 0 \\Rightarrow x^2 - 8x - 2 = 0 \\Rightarrow x = 4 \\pm \\sqrt{18}$; small root $\\alpha \\approx 4 - 3\\sqrt2 = -0.243$", mk: "M1 A1 A1", n: "Multiply by $-4$ to clear fractions; choose the root near 0." },
        { h: "(b) Gradient at $x = 0$ is exact — no approximation needed", m: "$f'(0) = 0 + \\dfrac12 = \\dfrac12$; tangent $y = \\dfrac12 x + 3$", mk: "M1 A1", n: "$\\cos 0 = 1$ exactly. Using an approximation here would be wrong in principle (and unnecessary)." }
      ], result: "(a) $-0.243$ (b) $y = \\frac12 x + 3$" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Degrees**: the approximations are meaningless in degrees — convert first.",
      "**Multiples**: $\\cos 3\\theta \\approx 1 - \\frac{9\\theta^2}{2}$, not $1 - \\frac{3\\theta^2}{2}$.",
      "**Squaring**: $(1 - \\frac{\\theta^2}{2})^2 \\approx 1 - \\theta^2$; keep $\\theta^4$ only if the question's printed form has it.",
      "**Cancelling**: the answer to a fraction is often a constant because the same power of $\\theta$ appears top and bottom.",
      "**Which root**: only the small root of the resulting quadratic is a valid estimate.",
      "**Exact values available**: at $x = 0$ use $\\cos 0 = 1$, not the approximation."
    ] },
    { callout: { t: "mnemonic", h: "\"Sine and tan lose their curves; cos keeps half a square\"", body: "$\\sin\\theta \\approx \\theta$, $\\tan\\theta \\approx \\theta$, $\\cos\\theta \\approx 1 - \\frac{\\theta^2}{2}$." } }
  ],
  flashcards: [
    ["Small angle approximations (radians)?", "$\\sin\\theta \\approx \\theta$, $\\cos\\theta \\approx 1 - \\frac{\\theta^2}{2}$, $\\tan\\theta \\approx \\theta$."],
    ["$\\cos 4\\theta \\approx$?", "$1 - 8\\theta^2$."],
    ["$\\frac{1 - \\cos 4\\theta}{2\\theta\\sin 3\\theta} \\approx$?", "$\\frac{8\\theta^2}{6\\theta^2} = \\frac43$."],
    ["$4\\sin\\frac{\\theta}{2} + 3\\cos^2\\theta \\approx$?", "$3 + 2\\theta - 3\\theta^2$."],
    ["Why must $\\theta$ be in radians?", "Only in radians is the gradient of $\\sin\\theta$ at 0 equal to 1, so $\\sin\\theta \\approx \\theta$."],
    ["Estimate the small root of $\\cos x = 2x + \\frac12$.", "$x^2 + 4x - 1 = 0$, $\\alpha \\approx \\sqrt5 - 2 = 0.236$."],
    ["$\\frac{\\theta\\tan 2\\theta}{1 - \\cos 3\\theta} \\approx$?", "$\\frac{2\\theta^2}{9\\theta^2/2} = \\frac49$."],
    ["$(1 - \\frac{\\theta^2}{2})^2 \\approx$?", "$1 - \\theta^2$ (dropping $\\theta^4$)."]
  ],
  quiz: [
    { q: "$\\sin 3\\theta \\approx$", opts: ["$3\\theta$", "$\\theta$", "$1 - \\tfrac{9\\theta^2}{2}$", "$9\\theta$"], ans: 0, why: "Substitute $3\\theta$." },
    { q: "$1 - \\cos 2\\theta \\approx$", opts: ["$2\\theta^2$", "$\\theta^2$", "$4\\theta^2$", "$2\\theta$"], ans: 0, why: "$\\cos 2\\theta \\approx 1 - 2\\theta^2$." },
    { q: "$\\frac{\\sin 2\\theta}{\\tan 5\\theta} \\approx$", opts: ["$\\tfrac25$", "$\\tfrac52$", "$10\\theta$", "$1$"], ans: 0, why: "$\\frac{2\\theta}{5\\theta}$." },
    { q: "Using $\\theta = 10$ (degrees) in $1 - \\frac{\\theta^2}{2}$ is wrong because", opts: ["10 is not small", "the formula needs radians", "cos is always 1", "you must square first"], ans: 1, why: "Radians only." },
    { q: "$\\cos x = 1 - 4x$ for small $x$ gives the quadratic", opts: ["$x^2 - 8x = 0$", "$x^2 + 8x = 0$", "$x^2 - 4x = 0$", "$2x^2 - 8x = 0$"], ans: 0, why: "$1 - \\frac{x^2}{2} = 1 - 4x$." }
  ]
};

/* =====================================================================
   5.3  Trig graphs and exact values
   ===================================================================== */
C["maths:5.3"] = {
  notes: [
    { h: "Graphs and exact values — the whole topic on one page" },
    "Three graphs, their symmetries, and a short table of exact values. These are not examined much on their own (one AS question in eight years) — they are examined **constantly** inside equation questions: every \"find all solutions in the interval\" is a graph question, and every \"exact value\" answer comes from the table.",
    { fig: { x: [-Math.PI, 2 * Math.PI + 0.3], y: [-1.6, 1.6], axes: { pi: true, yt: [-1, 1] }, items: [
      { fn: "sin(x)", label: "y = sin x", at: 4.0, pos: "s" },
      { fn: "cos(x)", c: "accent3", label: "y = cos x", at: 5.6, pos: "n" }
    ], cap: "$\\sin$ and $\\cos$: period $2\\pi$ ($360°$), amplitude 1. $\\cos x = \\sin\\left(x + \\frac{\\pi}{2}\\right)$ — the same wave shifted a quarter-period left." } },
    { fig: { x: [-Math.PI / 2 - 0.2, 3 * Math.PI / 2 + 0.2], y: [-4, 4], axes: { pi: true, yt: [-2, 2] }, items: [
      { fn: "tan(x)", label: "y = tan x", at: 0.9, pos: "e" },
      { vline: -Math.PI / 2, c: "muted" }, { vline: Math.PI / 2, c: "muted", label: "x = π/2" }, { vline: 3 * Math.PI / 2, c: "muted" }
    ], cap: "$\\tan$: period $\\pi$ ($180°$), no amplitude, vertical asymptotes at $x = \\frac{\\pi}{2} + n\\pi$." } },

    { page: "Definitions, symmetries, the unit circle" },
    { callout: { t: "def", h: "Sine and cosine for any angle", body: "On the unit circle, the point at angle $\\theta$ (anticlockwise from the positive $x$-axis) has coordinates $(\\cos\\theta, \\sin\\theta)$, and $\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$ is the gradient of the line from the origin. This defines the functions for every angle, negative and beyond $360°$, and it is where every symmetry comes from." } },
    { fig: { w: 320, h: 300, x: [-1.5, 1.5], y: [-1.4, 1.4], aspect: "equal", axes: { grid: false, xt: [-1, 1], yt: [-1, 1] }, items: [
      { circle: [0, 0, 1], c: "muted" },
      { vec: [[0, 0], [Math.cos(2.3), Math.sin(2.3)]], label: "1", loff: -10 },
      { line: [[Math.cos(2.3), 0], [Math.cos(2.3), Math.sin(2.3)]], dash: true, c: "accent3" },
      { arc: [0, 0, 24, 0, 131.8], label: "θ" },
      { pt: [Math.cos(2.3), Math.sin(2.3)], label: "(cos θ, sin θ)", pos: "nw" },
      { text: [-1.15, -0.55], t: "S", c: "muted", b: true, size: 14 }, { text: [1.15, -0.55], t: "C", c: "muted", b: true, size: 14 },
      { text: [1.15, 0.55], t: "A", c: "muted", b: true, size: 14 }, { text: [-1.15, 0.55], t: "T", c: "muted", b: true, size: 14, i: false }
    ], cap: "An obtuse $\\theta$: $\\cos\\theta < 0$, $\\sin\\theta > 0$. CAST (anticlockwise from bottom right: Cos, All, Sin, Tan) records which ratios are positive in each quadrant." } },
    { table: { head: ["Symmetry", "Formula", "From the graph"], rows: [
      ["$\\sin$ is odd, $\\cos$ is even", "$\\sin(-\\theta) = -\\sin\\theta$, $\\cos(-\\theta) = \\cos\\theta$", "rotational symmetry about $O$ / reflection in the $y$-axis"],
      ["Supplementary angles", "$\\sin(180° - \\theta) = \\sin\\theta$, $\\cos(180° - \\theta) = -\\cos\\theta$", "the sine curve is symmetric about $90°$"],
      ["Periodicity", "$\\sin(\\theta + 360°) = \\sin\\theta$, $\\tan(\\theta + 180°) = \\tan\\theta$", "repeats"],
      ["Cofunction", "$\\cos\\theta = \\sin(90° - \\theta)$", "shift by a quarter period"],
      ["Tan and the half turn", "$\\tan(180° + \\theta) = \\tan\\theta$, $\\tan(180° - \\theta) = -\\tan\\theta$", "period $180°$"]
    ] } },
    { h: "Exact values" },
    { table: { head: ["$\\theta$", "$0$", "$\\frac{\\pi}{6}$ ($30°$)", "$\\frac{\\pi}{4}$ ($45°$)", "$\\frac{\\pi}{3}$ ($60°$)", "$\\frac{\\pi}{2}$ ($90°$)", "$\\pi$"], rows: [
      ["$\\sin\\theta$", "0", "$\\frac12$", "$\\frac{\\sqrt2}{2}$", "$\\frac{\\sqrt3}{2}$", "1", "0"],
      ["$\\cos\\theta$", "1", "$\\frac{\\sqrt3}{2}$", "$\\frac{\\sqrt2}{2}$", "$\\frac12$", "0", "$-1$"],
      ["$\\tan\\theta$", "0", "$\\frac{1}{\\sqrt3} = \\frac{\\sqrt3}{3}$", "1", "$\\sqrt3$", "—", "0"]
    ] } },
    { callout: { t: "mnemonic", h: "The hand rule / the $\\frac{\\sqrt{n}}{2}$ pattern", body: "$\\sin$ of $0°, 30°, 45°, 60°, 90°$ is $\\frac{\\sqrt0}{2}, \\frac{\\sqrt1}{2}, \\frac{\\sqrt2}{2}, \\frac{\\sqrt3}{2}, \\frac{\\sqrt4}{2}$. Cosine is the same list backwards. Tan is sine over cosine. Multiples ($\\frac{5\\pi}{6}$, $\\frac{4\\pi}{3}$, …) come from the symmetries with a CAST sign." } },
    { worked: { tag: "example", title: "Exact values of multiples", src: "routine",
      steps: [
        { m: "$\\sin\\dfrac{5\\pi}{6} = \\sin\\left(\\pi - \\dfrac{\\pi}{6}\\right) = \\sin\\dfrac{\\pi}{6} = \\dfrac12$", n: "Second quadrant: sine positive." },
        { m: "$\\cos\\dfrac{4\\pi}{3} = \\cos\\left(\\pi + \\dfrac{\\pi}{3}\\right) = -\\cos\\dfrac{\\pi}{3} = -\\dfrac12$", n: "Third quadrant: only tan positive." },
        { m: "$\\tan\\dfrac{7\\pi}{4} = \\tan\\left(2\\pi - \\dfrac{\\pi}{4}\\right) = -\\tan\\dfrac{\\pi}{4} = -1$", n: "Fourth quadrant: only cos positive." },
        { m: "$\\cos150° = -\\cos30° = -\\dfrac{\\sqrt3}{2}$; $\; \\sin(-60°) = -\\dfrac{\\sqrt3}{2}$" }
      ] } },

    { page: "Transformed trig graphs" },
    "The transformations of 2.9 applied to $\\sin$, $\\cos$ and $\\tan$. Read the amplitude, period and shifts straight off the equation:",
    { kv: [
      ["$y = a\\sin(bx + c) + d$", "amplitude $a$, period $\\frac{360°}{b}$ (or $\\frac{2\\pi}{b}$), shifted **left** by $\\frac{c}{b}$, mean level $d$."],
      ["$y = \\cos(x + 30°)$", "the cosine curve moved $30°$ left: maximum at $x = -30°$, zeros at $60°$ and $240°$."],
      ["$y = \\tan 2x$", "period $90°$; asymptotes at $x = 45°, 135°, \\ldots$"],
      ["$y = 3\\cos\\frac{x}{4}$", "amplitude 3, period $1440°$; the minimum $(-180°, -3)$ of $3\\cos x$ moves to $(-720°, -3)$."],
      ["$y = |\\sin x|$", "negative arches reflected up; period $180°$."]
    ] },
    { worked: { tag: "exam", title: "Minimum of $y = 3\\cos x°$, its images, and an equation", src: "AS June 2020 · P1 Q9 · 8 marks",
      q: "The point $P(c, d)$ is a minimum of $y = 3\\cos x°$, with $c$ the smallest negative $x$ at which a minimum occurs. **(a)** State $c$ and $d$. **(b)** State the image of $P$ under the transformation to (i) $y = 3\\cos\\frac{x°}{4}$, (ii) $y = 3\\cos x° - 5$. **(c)** Solve $3\\cos\\theta° = 8\\tan\\theta°$ for $0 < \\theta < 360$.",
      steps: [
        { h: "(a)", m: "$c = -180$, $d = -3$", mk: "B1" },
        { h: "(b)", m: "(i) $x$ stretched by 4: $(-720, -3)$. (ii) down 5: $(-180, -8)$", mk: "B1 B1" },
        { h: "(c) Write $\\tan$ as $\\frac{\\sin}{\\cos}$ and clear", m: "$3\\cos\\theta = \\dfrac{8\\sin\\theta}{\\cos\\theta} \\Rightarrow 3\\cos^2\\theta = 8\\sin\\theta \\Rightarrow 3(1 - \\sin^2\\theta) = 8\\sin\\theta \\Rightarrow 3\\sin^2\\theta + 8\\sin\\theta - 3 = 0$", mk: "M1 M1 A1" },
        { m: "$(3\\sin\\theta - 1)(\\sin\\theta + 3) = 0 \\Rightarrow \\sin\\theta = \\dfrac13$ ($\\sin\\theta = -3$ impossible)\n$\\theta = 19.5°, \; 160.5°$", mk: "M1 A1", n: "Second solution from $180° - 19.47°$." }
      ], result: "(a) $c = -180$, $d = -3$ (c) $19.5°$, $160.5°$" } },
    { worked: { tag: "exam", title: "Counting solutions of $\\sin(nx) = k$ from the graph", src: "A-level June 2025 · P2 Q13 · 3 marks",
      q: "For all $k$ with $0 < |k| < 1$, the equation $\\sin(nx) = k$, $n \\in \\mathbb{N}$, has exactly 6 solutions in $0 \\le x < 2\\pi$. **(i)** Deduce $n$. **(ii)** Deduce the number of solutions of $\\sin^2(nx) = k^2$ in $0 \\le x < 5\\pi$, justifying your answer.",
      steps: [
        { h: "(i) Each period of $\\sin$ gives two solutions for a horizontal line between $-1$ and $1$", m: "$\\sin(nx)$ has $n$ periods in $[0, 2\\pi)$, so $2n = 6 \\Rightarrow n = 3$", mk: "B1" },
        { h: "(ii) $\\sin^2 3x = k^2 \\iff \\sin 3x = k$ or $\\sin 3x = -k$", m: "In $[0, 5\\pi)$ there are $2.5$ times as many periods as in $[0, 2\\pi)$: $\\sin 3x = k$ has $6 \\times 2.5 = 15$ solutions, and so does $\\sin 3x = -k$ — **30** solutions in total.", mk: "M1 A1", n: "The two lines $y = \\pm k$ each cut every arch twice; no solution is shared because $k \\ne -k$." }
      ], result: "(i) $n = 3$ (ii) 30" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Exact values in the wrong form**: $\\tan30° = \\frac{1}{\\sqrt3}$ and $\\frac{\\sqrt3}{3}$ are both fine; $0.577$ is not.",
      "**Signs by quadrant**: use CAST or the unit circle, not memory.",
      "**Period of $\\tan$ is $180°$**, not $360°$.",
      "**Radians vs degrees on the sketch**: label the axis in the unit the question uses.",
      "**Counting solutions**: two per period for $\\sin$/$\\cos$ (unless $k = \\pm1$ or $0$), one per period for $\\tan$."
    ] },
    { callout: { t: "mnemonic", h: "\"All Students Take Calculus\" — anticlockwise from the first quadrant", body: "Quadrant 1 All positive; 2 Sin only; 3 Tan only; 4 Cos only." } }
  ],
  flashcards: [
    ["$\\sin 30°$, $\\cos 30°$, $\\tan 30°$?", "$\\frac12$, $\\frac{\\sqrt3}{2}$, $\\frac{1}{\\sqrt3}$."],
    ["$\\sin 45°$, $\\cos 60°$, $\\tan 60°$?", "$\\frac{\\sqrt2}{2}$, $\\frac12$, $\\sqrt3$."],
    ["$\\cos\\frac{4\\pi}{3}$?", "$-\\frac12$ (third quadrant)."],
    ["Periods of $\\sin$, $\\cos$, $\\tan$?", "$360°$, $360°$, $180°$."],
    ["$\\sin(180° - \\theta)$ and $\\cos(180° - \\theta)$?", "$\\sin\\theta$; $-\\cos\\theta$."],
    ["Which ratios are positive in the third quadrant?", "Only tan (CAST)."],
    ["Period and amplitude of $y = 3\\cos\\frac{x}{4}$?", "$1440°$; 3."],
    ["$\\sin(nx) = k$ has 6 solutions in $[0, 2\\pi)$: $n$?", "3 (two per period)."],
    ["Definition of $\\cos\\theta$, $\\sin\\theta$ for any $\\theta$?", "The $x$ and $y$ coordinates of the point at angle $\\theta$ on the unit circle."],
    ["Asymptotes of $y = \\tan x$?", "$x = 90° + 180°n$."]
  ],
  quiz: [
    { q: "$\\cos 120° =$", opts: ["$-\\tfrac12$", "$\\tfrac12$", "$-\\tfrac{\\sqrt3}{2}$", "$\\tfrac{\\sqrt3}{2}$"], ans: 0, why: "$-\\cos60°$." },
    { q: "$\\tan\\frac{3\\pi}{4} =$", opts: ["1", "$-1$", "$\\sqrt3$", "$-\\sqrt3$"], ans: 1, why: "Second quadrant, tan negative." },
    { q: "Period of $y = \\sin 3x$ (degrees):", opts: ["$120°$", "$360°$", "$1080°$", "$180°$"], ans: 0, why: "$360 \\div 3$." },
    { q: "Maximum of $y = \\cos(x + 30°)$ occurs at", opts: ["$x = 30°$", "$x = -30°$", "$x = 60°$", "$x = 0°$"], ans: 1, why: "Shift left 30." },
    { q: "$\\sin\\theta = 0.5$ for $0 \\le \\theta < 360°$:", opts: ["$30°$ only", "$30°, 150°$", "$30°, 210°$", "$150°, 210°$"], ans: 1, why: "$180 - 30$." },
    { q: "$\\sin(-\\theta) =$", opts: ["$\\sin\\theta$", "$-\\sin\\theta$", "$\\cos\\theta$", "$-\\cos\\theta$"], ans: 1, why: "Sine is odd." }
  ]
};

/* =====================================================================
   5.4  Reciprocal and inverse trig functions
   ===================================================================== */
C["maths:5.4"] = {
  notes: [
    { h: "Reciprocal and inverse functions — the whole topic on one page" },
    { callout: { t: "def", h: "Definitions", body: [
      "$$\\sec\\theta = \\dfrac{1}{\\cos\\theta} \\qquad \\text{cosec}\\,\\theta = \\dfrac{1}{\\sin\\theta} \\qquad \\cot\\theta = \\dfrac{1}{\\tan\\theta} = \\dfrac{\\cos\\theta}{\\sin\\theta}$$",
      "Memory: the **third letter** names the function underneath — se**c** → cos, co**s**ec → sin, co**t** → tan.",
      "$\\arcsin$, $\\arccos$, $\\arctan$ (also $\\sin^{-1}$ etc.) are the **inverse functions** — defined only after restricting the domain so that $\\sin$, $\\cos$, $\\tan$ are one-to-one."
    ] } },
    { table: { head: ["Function", "Domain", "Range", "Asymptotes / notes"], rows: [
      ["$\\sec x$", "$x \\ne 90° + 180°n$", "$y \\le -1$ or $y \\ge 1$", "vertical asymptotes where $\\cos x = 0$; U-shapes touching $\\pm1$"],
      ["$\\text{cosec}\\,x$", "$x \\ne 180°n$", "$y \\le -1$ or $y \\ge 1$", "asymptotes where $\\sin x = 0$"],
      ["$\\cot x$", "$x \\ne 180°n$", "all real $y$", "asymptotes where $\\sin x = 0$; decreasing on each branch"],
      ["$\\arcsin x$", "$-1 \\le x \\le 1$", "$-\\frac{\\pi}{2} \\le y \\le \\frac{\\pi}{2}$", "reflection of $\\sin$ (restricted) in $y = x$"],
      ["$\\arccos x$", "$-1 \\le x \\le 1$", "$0 \\le y \\le \\pi$", "decreasing"],
      ["$\\arctan x$", "all real $x$", "$-\\frac{\\pi}{2} < y < \\frac{\\pi}{2}$", "horizontal asymptotes $y = \\pm\\frac{\\pi}{2}$"]
    ] } },

    { page: "The graphs" },
    { fig: { x: [-Math.PI / 2 - 0.3, 3 * Math.PI / 2 + 0.3], y: [-4, 4], axes: { pi: true, yt: [-1, 1] }, items: [
      { fn: "cos(x)", c: "muted", dash: true, label: "cos x", at: 0.3, pos: "sw" },
      { fn: "sec(x)", label: "y = sec x", at: 0.2, pos: "ne" },
      { vline: -Math.PI / 2, c: "muted" }, { vline: Math.PI / 2, c: "muted" }, { vline: 3 * Math.PI / 2, c: "muted" },
      { hline: 1, c: "accent3" }, { hline: -1, c: "accent3" }
    ], cap: "$y = \\sec x$ over its dashed parent $\\cos x$: a maximum of $\\cos$ becomes a minimum of $\\sec$ (value 1); every zero of $\\cos$ becomes an asymptote." } },
    { fig: { x: [-Math.PI - 0.3, 2 * Math.PI + 0.3], y: [-4, 4], axes: { pi: true, yt: [-1, 1] }, items: [
      { fn: "cosec(x)", label: "y = cosec x", at: 1.2, pos: "ne" },
      { fn: "cot(x)", c: "accent3", label: "y = cot x", at: 2.4, pos: "sw" },
      { vline: -Math.PI, c: "muted" }, { vline: 0, c: "muted" }, { vline: Math.PI, c: "muted" }, { vline: 2 * Math.PI, c: "muted" }
    ], cap: "$\\text{cosec}\\,x$ (U-shapes between the asymptotes at multiples of $\\pi$) and $\\cot x$ (falling through zero at $\\frac{\\pi}{2} + n\\pi$)." } },
    { fig: { x: [-1.4, 1.4], y: [-1.9, 3.5], aspect: "equal", axes: { xt: [-1, 1], yt: [{ v: Math.PI / 2, label: "π/2" }, { v: Math.PI, label: "π" }, { v: -Math.PI / 2, label: "−π/2" }] }, items: [
      { fn: "asin(x)", from: -1, to: 1, label: "arcsin x", at: 0.7, pos: "se" },
      { fn: "acos(x)", from: -1, to: 1, c: "accent3", label: "arccos x", at: -0.6, pos: "ne" },
      { fn: "atan(x)", c: "accent2", label: "arctan x", at: 1.1, pos: "s" },
      { pt: [1, Math.PI / 2] }, { pt: [-1, -Math.PI / 2] }, { pt: [-1, Math.PI], c: "accent3" }, { pt: [1, 0], c: "accent3" }
    ], cap: "The inverse functions. $\\arcsin$ and $\\arccos$ live on $[-1, 1]$; $\\arctan$ takes every real number and levels off at $\\pm\\frac{\\pi}{2}$." } },
    { callout: { t: "tip", h: "Why the domains are restricted", body: "$\\sin x = \\frac12$ has infinitely many solutions, so \"the angle whose sine is $\\frac12$\" is not well defined until we choose one. The convention is the branch nearest the origin that is one-to-one: $[-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$ for $\\sin$ and $\\tan$, $[0, \\pi]$ for $\\cos$ (which is decreasing there). The calculator's $\\sin^{-1}$ returns this **principal value**; the other solutions of an equation come from the symmetries (5.7)." } },

    { page: "Working with them" },
    { worked: { tag: "example", title: "Exact values of reciprocal and inverse functions", src: "routine",
      steps: [
        { m: "$\\sec 60° = \\dfrac{1}{\\cos60°} = 2; \\qquad \\text{cosec}\\,\\dfrac{\\pi}{4} = \\dfrac{1}{\\sin\\frac{\\pi}{4}} = \\sqrt2; \\qquad \\cot 150° = \\dfrac{1}{\\tan150°} = \\dfrac{1}{-1/\\sqrt3} = -\\sqrt3$" },
        { m: "$\\arcsin\\left(-\\dfrac12\\right) = -\\dfrac{\\pi}{6}$ (not $\\dfrac{7\\pi}{6}$ — outside the range); $\; \\arccos\\left(-\\dfrac12\\right) = \\dfrac{2\\pi}{3}$; $\; \\arctan\\sqrt3 = \\dfrac{\\pi}{3}$", n: "Answers must be in the principal range." },
        { m: "$\\sin(\\arccos x) = \\sqrt{1 - x^2}$: draw a right triangle with adjacent $x$, hypotenuse 1.", n: "A composite of a function and a different inverse is a right-triangle problem." }
      ] } },
    { worked: { tag: "exam", title: "Gradient on a curve with $\\text{cosec}^3\\theta$", src: "A-level Oct 2021 · P2 Q13 · 6 marks",
      q: "$x = \\sin 2\\theta$, $y = \\text{cosec}^3\\theta$, $0 < \\theta < \\frac{\\pi}{2}$. **(a)** Find $\\frac{dy}{dx}$ in terms of $\\theta$. **(b)** Find the exact gradient at the point where $y = 8$.",
      steps: [
        { h: "(a) $\\frac{d}{d\\theta}\\text{cosec}\\,\\theta = -\\text{cosec}\\,\\theta\\cot\\theta$", m: "$\\dfrac{dy}{d\\theta} = 3\\text{cosec}^2\\theta \\cdot (-\\text{cosec}\\,\\theta\\cot\\theta) = -3\\text{cosec}^3\\theta\\cot\\theta; \\quad \\dfrac{dx}{d\\theta} = 2\\cos 2\\theta$\n$\\dfrac{dy}{dx} = -\\dfrac{3\\text{cosec}^3\\theta\\cot\\theta}{2\\cos 2\\theta}$", mk: "M1 A1 A1" },
        { h: "(b) $\\text{cosec}\\,\\theta = 2 \\Rightarrow \\sin\\theta = \\frac12 \\Rightarrow \\theta = \\frac{\\pi}{6}$", m: "$\\dfrac{dy}{dx} = -\\dfrac{3 \\cdot 8 \\cdot \\sqrt3}{2 \\cdot \\frac12} = -24\\sqrt3$", mk: "M1 M1 A1" }
      ], result: "$-24\\sqrt3$" } },
    { worked: { tag: "exam", title: "Solve $4\\sin x = \\sec x$", src: "A-level June 2018 · P2 Q7(i) · 4 marks",
      q: "Solve, for $0 \\le x < \\frac{\\pi}{2}$, the equation $4\\sin x = \\sec x$.",
      steps: [
        { m: "$4\\sin x = \\dfrac{1}{\\cos x} \\Rightarrow 4\\sin x\\cos x = 1 \\Rightarrow 2\\sin 2x = 1 \\Rightarrow \\sin 2x = \\dfrac12$", mk: "M1 M1", n: "Multiply by $\\cos x$ (non-zero on the interval), then recognise $2\\sin x\\cos x = \\sin 2x$." },
        { m: "$0 \\le 2x < \\pi$: $2x = \\dfrac{\\pi}{6}, \\dfrac{5\\pi}{6} \\Rightarrow x = \\dfrac{\\pi}{12}, \\dfrac{5\\pi}{12}$", mk: "A1 A1" }
      ], result: "$x = \\frac{\\pi}{12}, \\frac{5\\pi}{12}$" } },

    { page: "Exam toolkit" },
    { ul: [
      "**$\\sec$ is $\\frac{1}{\\cos}$, not $\\frac{1}{\\sin}$** — third-letter rule.",
      "**Range of $\\sec$/$\\text{cosec}$ excludes $(-1, 1)$**: $\\sec x = \\frac12$ has no solutions.",
      "**$\\arcsin$ answers outside $[-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$** or $\\arccos$ outside $[0, \\pi]$.",
      "**$\\sin^{-1} x \\ne \\frac{1}{\\sin x}$**: the $-1$ means inverse function, and $\\frac{1}{\\sin x}$ is $\\text{cosec}\\,x$.",
      "**Derivatives** (7.2): $\\sec x \\to \\sec x\\tan x$, $\\text{cosec}\\,x \\to -\\text{cosec}\\,x\\cot x$, $\\cot x \\to -\\text{cosec}^2 x$."
    ] },
    { callout: { t: "mnemonic", h: "\"Third letter tells\"", body: "se**C** = 1/cos, co**S**ec = 1/sin, co**T** = 1/tan." } }
  ],
  flashcards: [
    ["$\\sec\\theta$, $\\text{cosec}\\,\\theta$, $\\cot\\theta$?", "$\\frac{1}{\\cos\\theta}$, $\\frac{1}{\\sin\\theta}$, $\\frac{1}{\\tan\\theta} = \\frac{\\cos\\theta}{\\sin\\theta}$."],
    ["Range of $\\sec x$?", "$y \\le -1$ or $y \\ge 1$."],
    ["Domain and range of $\\arcsin x$?", "$-1 \\le x \\le 1$; $-\\frac{\\pi}{2} \\le y \\le \\frac{\\pi}{2}$."],
    ["Range of $\\arccos x$? of $\\arctan x$?", "$[0, \\pi]$; $(-\\frac{\\pi}{2}, \\frac{\\pi}{2})$."],
    ["$\\arcsin(-\\frac12)$?", "$-\\frac{\\pi}{6}$."],
    ["Where are the asymptotes of $\\sec x$?", "Where $\\cos x = 0$: $x = \\frac{\\pi}{2} + n\\pi$."],
    ["$\\sec 60°$ and $\\cot 150°$?", "$2$; $-\\sqrt3$."],
    ["Why restrict the domain to define $\\arcsin$?", "$\\sin$ is many-to-one; restricting to $[-\\frac{\\pi}{2}, \\frac{\\pi}{2}]$ makes it one-to-one."],
    ["$4\\sin x = \\sec x$ becomes…", "$\\sin 2x = \\frac12$."]
  ],
  quiz: [
    { q: "$\\text{cosec}\\,30° =$", opts: ["2", "$\\tfrac12$", "$\\sqrt3$", "$\\tfrac{2}{\\sqrt3}$"], ans: 0, why: "$1/\\sin30°$." },
    { q: "$\\sec x = 0.5$ has", opts: ["two solutions per period", "one solution", "no solutions", "infinitely many in one period"], ans: 2, why: "$|\\sec x| \\ge 1$." },
    { q: "$\\arccos(-1) =$", opts: ["$\\pi$", "$-\\pi$", "$0$", "$\\tfrac{\\pi}{2}$"], ans: 0, why: "Range $[0, \\pi]$." },
    { q: "$y = \\cot x$ has asymptotes at", opts: ["$x = 180°n$", "$x = 90° + 180°n$", "$x = 360°n$", "none"], ans: 0, why: "Where $\\sin x = 0$." },
    { q: "$\\arctan x$ as $x \\to \\infty$ tends to", opts: ["$\\infty$", "$\\tfrac{\\pi}{2}$", "$\\pi$", "1"], ans: 1, why: "Horizontal asymptote." },
    { q: "$\\frac{d}{dx}(\\sec x) =$", opts: ["$\\sec x\\tan x$", "$-\\sec x\\tan x$", "$\\sec^2 x$", "$\\tan x$"], ans: 0, why: "Standard result." }
  ]
};

/* =====================================================================
   5.5  Trig identities
   ===================================================================== */
C["maths:5.5"] = {
  notes: [
    { h: "Trig identities — the whole topic on one page" },
    { callout: { t: "memorise", h: "The three identities (not in the booklet)", body: [
      "$$\\tan\\theta \\equiv \\dfrac{\\sin\\theta}{\\cos\\theta} \\qquad \\sin^2\\theta + \\cos^2\\theta \\equiv 1 \\qquad 1 + \\tan^2\\theta \\equiv \\sec^2\\theta \\qquad 1 + \\cot^2\\theta \\equiv \\text{cosec}^2\\theta$$",
      "The last two are the Pythagorean identity divided by $\\cos^2\\theta$ and by $\\sin^2\\theta$. Derive them in ten seconds rather than misremember them.",
      "Rearrangements you use constantly: $\\sin^2\\theta = 1 - \\cos^2\\theta$, $\\cos^2\\theta = 1 - \\sin^2\\theta$, $\\tan^2\\theta = \\sec^2\\theta - 1$."
    ] } },
    { callout: { t: "tip", h: "Why $\\sin^2\\theta + \\cos^2\\theta = 1$", body: "The point $(\\cos\\theta, \\sin\\theta)$ lies on the unit circle $x^2 + y^2 = 1$. That is the identity — Pythagoras on the unit circle. Dividing through by $\\cos^2\\theta$ gives $\\tan^2\\theta + 1 = \\sec^2\\theta$." } },
    "Two jobs: (1) **rewrite an equation** so it contains only one trig function, giving a quadratic (5.7); (2) **prove a given identity** (5.8). The same manipulations serve both.",

    { page: "Turning an equation into a quadratic" },
    { callout: { t: "memorise", h: "Which substitution", body: [
      "$\\sin^2$ and $\\cos$ together → replace $\\sin^2 = 1 - \\cos^2$ (quadratic in $\\cos$).",
      "$\\cos^2$ and $\\sin$ together → $\\cos^2 = 1 - \\sin^2$ (quadratic in $\\sin$).",
      "$\\tan$ and $\\cos$ or $\\sin$ → write $\\tan = \\frac{\\sin}{\\cos}$ and multiply through by $\\cos$.",
      "$\\sec^2$ and $\\tan$ → $\\sec^2 = 1 + \\tan^2$ (quadratic in $\\tan$).",
      "$\\sin^2$ and $\\sin\\cos$ and $\\cos^2$ (homogeneous) → divide by $\\cos^2$ to get a quadratic in $\\tan$.",
      "**Never divide by a trig function that could be zero** — factorise instead, or you lose solutions (the 'student error' questions are built on this)."
    ] } },
    { worked: { tag: "exam", title: "$4\\cos\\theta - 1 = 2\\sin\\theta\\tan\\theta$ → quadratic in $\\cos\\theta$; then solve for $3x$", src: "AS June 2018 · P1 Q12 · 8 marks",
      q: "**(a)** Show that $4\\cos\\theta - 1 = 2\\sin\\theta\\tan\\theta$ can be written as $6\\cos^2\\theta - \\cos\\theta - 2 = 0$. **(b)** Hence solve, for $0 \\le x < 90°$, $4\\cos 3x - 1 = 2\\sin 3x\\tan 3x$, to one decimal place where appropriate.",
      steps: [
        { h: "(a) $\\tan = \\frac{\\sin}{\\cos}$, multiply by $\\cos\\theta$, use $\\sin^2 = 1 - \\cos^2$", m: "$4\\cos\\theta - 1 = \\dfrac{2\\sin^2\\theta}{\\cos\\theta} \\Rightarrow 4\\cos^2\\theta - \\cos\\theta = 2(1 - \\cos^2\\theta) \\Rightarrow 6\\cos^2\\theta - \\cos\\theta - 2 = 0$", mk: "M1 M1 A1 A1*" },
        { h: "(b) Solve the quadratic with $\\theta = 3x$", m: "$(3\\cos3x - 2)(2\\cos3x + 1) = 0 \\Rightarrow \\cos 3x = \\dfrac23$ or $-\\dfrac12$", mk: "M1" },
        { h: "Interval for $3x$: $0 \\le 3x < 270°$", m: "$\\cos 3x = \\dfrac23$: $3x = 48.19°$ (next, $311.8°$, is out of range) $\\Rightarrow x = 16.1°$\n$\\cos 3x = -\\dfrac12$: $3x = 120°, 240° \\Rightarrow x = 40°, 80°$", mk: "M1 A1 A1", n: "Triple the interval **before** listing solutions, then divide each by 3. Missing $240°$ is the usual loss." }
      ], result: "(b) $x = 16.1°, 40°, 80°$" } },
    { worked: { tag: "exam", title: "Homogeneous equation → quadratic in $\\tan$; solutions for $4\\alpha$ far from zero", src: "AS June 2024 · P1 Q13 · 9 marks",
      q: "**(a)** Show that $\\sin\\theta(7\\sin\\theta - 4\\cos\\theta) = 4$ can be written as $3\\tan^2\\theta - 4\\tan\\theta - 4 = 0$. **(b)** Hence solve, for $0 < x < 360°$, $\\sin x(7\\sin x - 4\\cos x) = 4$ to one decimal place. **(c)** Hence find the smallest solution of $\\sin 4\\alpha(7\\sin 4\\alpha - 4\\cos 4\\alpha) = 4$ in $720° < \\alpha < 1080°$.",
      steps: [
        { h: "(a) Replace the 4 by $4(\\sin^2 + \\cos^2)$, then divide by $\\cos^2\\theta$", m: "$7\\sin^2\\theta - 4\\sin\\theta\\cos\\theta = 4\\sin^2\\theta + 4\\cos^2\\theta \\Rightarrow 3\\sin^2\\theta - 4\\sin\\theta\\cos\\theta - 4\\cos^2\\theta = 0$\nDivide by $\\cos^2\\theta$: $3\\tan^2\\theta - 4\\tan\\theta - 4 = 0$", mk: "M1 M1 A1 A1*", n: "Writing $4 = 4(\\sin^2\\theta + \\cos^2\\theta)$ is the trick that makes every term degree 2." },
        { h: "(b)", m: "$(3\\tan x + 2)(\\tan x - 2) = 0$: $\\tan x = 2 \\Rightarrow x = 63.4°, 243.4°$; $\\tan x = -\\dfrac23 \\Rightarrow x = 146.3°, 326.3°$", mk: "M1 A1 A1 A1", n: "Tan repeats every $180°$: add $180°$ to the calculator value; for the negative one, $180° - 33.7°$ and $360° - 33.7°$." },
        { h: "(c) $4\\alpha$ lies in $(2880°, 4320°)$", m: "Solutions of $\\tan 4\\alpha = 2$: $63.4° + 180°n$; the first above $2880°$ is $63.4° + 2880° = 2943.4°$ ($n = 16$). Check $\\tan 4\\alpha = -\\frac23$: $146.3° + 2880° = 3026.3°$, larger.\n$\\alpha = \\dfrac{2943.4°}{4} = 735.9°$", mk: "B1", n: "Multiply the interval by 4, use the period $180°$ to jump, divide back." }
      ], result: "(b) $63.4°, 146.3°, 243.4°, 326.3°$ (c) $735.9°$" } },
    { worked: { tag: "exam", title: "$4\\tan x = 5\\cos x$ → quadratic in $\\sin x$; count solutions for $3x$", src: "AS June 2023 · P1 Q12 · 9 marks",
      q: "**(a)** Show that $4\\tan x = 5\\cos x$ can be written as $5\\sin^2 x + 4\\sin x - 5 = 0$. **(b)** Hence solve, for $0 < x \\le 360°$, to one decimal place. **(c)** Hence find the number of solutions of $4\\tan 3x = 5\\cos 3x$ in $0 < x \\le 1800°$, explaining briefly.",
      steps: [
        { h: "(a)", m: "$\\dfrac{4\\sin x}{\\cos x} = 5\\cos x \\Rightarrow 4\\sin x = 5\\cos^2 x = 5(1 - \\sin^2 x) \\Rightarrow 5\\sin^2 x + 4\\sin x - 5 = 0$", mk: "M1 M1 A1*" },
        { h: "(b) Formula", m: "$\\sin x = \\dfrac{-4 \\pm \\sqrt{16 + 100}}{10} = 0.677$ or $-1.477$ (impossible)\n$x = 42.6°, 137.4°$", mk: "M1 A1 M1 A1", n: "Reject $-1.477$ explicitly: $|\\sin x| \\le 1$." },
        { h: "(c) $3x$ runs over $(0, 5400°]$ — 15 full periods of $360°$", m: "Two solutions per period: $15 \\times 2 = 30$ solutions", mk: "M1 A1", n: "Count periods of the transformed variable; each period has the same two solutions." }
      ], result: "(b) $42.6°, 137.4°$ (c) 30" } },
    { worked: { tag: "exam", title: "Spot the student's errors: dividing by $\\sin x$ and forgetting the negative root", src: "AS Nov 2021 · P1 Q12(ii) · 2 marks",
      q: "A student solves $3\\tan x - 5\\sin x = 0$ for $-90° < x < 90°$ as follows: $3\\frac{\\sin x}{\\cos x} - 5\\sin x = 0 \\Rightarrow 3\\sin x - 5\\sin x\\cos x = 0 \\Rightarrow 3 - 5\\cos x = 0 \\Rightarrow \\cos x = \\frac35 \\Rightarrow x = 53.1°$. Identify two errors or omissions.",
      steps: [
        { m: "**1.** Dividing by $\\sin x$ loses the solution $\\sin x = 0$, i.e. $x = 0$. The line should be $\\sin x(3 - 5\\cos x) = 0$.", mk: "B1" },
        { m: "**2.** $\\cos x = \\frac35$ has two solutions in $-90° < x < 90°$: $x = \\pm53.1°$; the student omitted $-53.1°$.", mk: "B1", n: "These two errors — dividing by a function, and taking only the principal value — are the two most common in the whole topic." }
      ], result: "lost $x = 0$; missed $x = -53.1°$" } },
    { worked: { tag: "exam", title: "$\\sin^2 3x = 4\\cos^2 3x$", src: "AS June 2025 · P1 Q8 · 5 marks",
      q: "Solve, for $0 \\le x \\le 90°$, $\\sin^2 3x = 4\\cos^2 3x$, to one decimal place.",
      steps: [
        { m: "Divide by $\\cos^2 3x$ ($\\ne 0$, since $\\cos 3x = 0$ would force $\\sin 3x = 0$ too): $\\tan^2 3x = 4 \\Rightarrow \\tan 3x = \\pm2$", mk: "M1 A1", n: "Both square roots." },
        { h: "$0 \\le 3x \\le 270°$", m: "$\\tan 3x = 2$: $3x = 63.4°, 243.4°$; $\\tan 3x = -2$: $3x = 116.6°$ ($296.6°$ is out)\n$x = 21.1°, 38.9°, 81.1°$", mk: "M1 A1 A1" }
      ], result: "$x = 21.1°, 38.9°, 81.1°$" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Dividing by $\\sin\\theta$, $\\cos\\theta$, $\\tan\\theta$** — factorise instead.",
      "**$\\cos^2\\theta = 1 - \\sin^2\\theta$ with a sign slip** ($1 + \\sin^2$).",
      "**Not rejecting** $\\sin\\theta = -1.477$ or $\\cos\\theta = 1.2$ in writing.",
      "**Interval not transformed** for $3x$, $4\\alpha$, $2\\theta + 10°$.",
      "**Rounding $\\sin x$ before finding $x$** — keep the surd or full decimal.",
      "**\"Show that\" with a jump**: every identity used must be visible."
    ] },
    { callout: { t: "mnemonic", h: "\"One function, then a quadratic\"", body: "The goal of every substitution: an equation in a single trig function, which is then a quadratic in disguise." } }
  ],
  flashcards: [
    ["The Pythagorean identity and its two divided forms?", "$\\sin^2 + \\cos^2 = 1$; $1 + \\tan^2 = \\sec^2$; $1 + \\cot^2 = \\text{cosec}^2$."],
    ["$4\\cos\\theta - 1 = 2\\sin\\theta\\tan\\theta$ as a quadratic?", "$6\\cos^2\\theta - \\cos\\theta - 2 = 0$."],
    ["$\\sin\\theta(7\\sin\\theta - 4\\cos\\theta) = 4$ as a quadratic in $\\tan$?", "Write $4 = 4(\\sin^2 + \\cos^2)$, divide by $\\cos^2$: $3\\tan^2\\theta - 4\\tan\\theta - 4 = 0$."],
    ["$4\\tan x = 5\\cos x$ as a quadratic in $\\sin x$?", "$5\\sin^2 x + 4\\sin x - 5 = 0$."],
    ["Why never divide an equation by $\\sin x$?", "It discards the solutions where $\\sin x = 0$."],
    ["Solutions of $\\cos 3x = -\\frac12$ for $0 \\le x < 90°$?", "$3x = 120°, 240°$: $x = 40°, 80°$."],
    ["How many solutions has $4\\tan 3x = 5\\cos 3x$ in $0 < x \\le 1800°$?", "$3x$ covers 15 periods, two each: 30."],
    ["$\\tan^2 3x = 4$ gives…", "$\\tan 3x = \\pm2$ — both signs."]
  ],
  quiz: [
    { q: "$1 - \\sin^2\\theta =$", opts: ["$\\cos^2\\theta$", "$\\cos\\theta$", "$\\tan^2\\theta$", "$1 - \\cos^2\\theta$"], ans: 0, why: "Pythagorean identity." },
    { q: "$\\sec^2\\theta - \\tan^2\\theta =$", opts: ["1", "0", "$\\sin^2\\theta$", "$2$"], ans: 0, why: "$1 + \\tan^2 = \\sec^2$." },
    { q: "$2\\sin^2 x + \\cos x = 1$ becomes", opts: ["$2\\cos^2 x - \\cos x - 1 = 0$", "$2\\cos^2 x + \\cos x - 1 = 0$", "$\\cos^2 x - \\cos x = 0$", "$2\\sin^2 x - 1 = 0$"], ans: 0, why: "$2(1 - \\cos^2 x) + \\cos x - 1 = 0$." },
    { q: "$\\sin x\\cos x = \\sin x$ should be solved by", opts: ["dividing by $\\sin x$", "factorising $\\sin x(\\cos x - 1) = 0$", "squaring", "taking $\\tan$"], ans: 1, why: "Keep the $\\sin x = 0$ solutions." },
    { q: "$\\sin\\theta = 1.2$ has", opts: ["two solutions", "no solutions", "one solution", "four solutions"], ans: 1, why: "$|\\sin\\theta| \\le 1$." },
    { q: "$3\\sin^2\\theta - 4\\sin\\theta\\cos\\theta - 4\\cos^2\\theta = 0$ divided by $\\cos^2\\theta$ gives", opts: ["$3\\tan^2\\theta - 4\\tan\\theta - 4 = 0$", "$3 - 4\\tan\\theta - 4\\tan^2\\theta = 0$", "$3\\sin^2\\theta - 4 = 0$", "$3\\tan\\theta - 4 = 0$"], ans: 0, why: "Each term divided by $\\cos^2$." }
  ]
};

/* =====================================================================
   5.6  Addition formulae, double angles and the R-form
   ===================================================================== */
C["maths:5.6"] = {
  notes: [
    { h: "Addition, double angle and $R$-form — the whole topic on one page" },
    { callout: { t: "formula", h: "In the booklet", body: [
      "$$\\sin(A \\pm B) = \\sin A\\cos B \\pm \\cos A\\sin B \\qquad \\cos(A \\pm B) = \\cos A\\cos B \\mp \\sin A\\sin B \\qquad \\tan(A \\pm B) = \\dfrac{\\tan A \\pm \\tan B}{1 \\mp \\tan A\\tan B}$$",
      "**Not in the booklet** (derive by putting $B = A$): $\\sin 2A = 2\\sin A\\cos A$, $\; \\cos 2A = \\cos^2 A - \\sin^2 A = 2\\cos^2 A - 1 = 1 - 2\\sin^2 A$, $\; \\tan 2A = \\frac{2\\tan A}{1 - \\tan^2 A}$.",
      "**$R$-form**: $a\\cos\\theta + b\\sin\\theta = R\\cos(\\theta - \\alpha)$ with $R = \\sqrt{a^2 + b^2}$, $\\tan\\alpha = \\frac{b}{a}$ (for $a, b > 0$). Also $R\\sin(\\theta + \\alpha)$ etc. — match the signs by expanding."
    ] } },
    { callout: { t: "tip", h: "Where the addition formulae come from (a geometric proof the spec says you should understand)", body: "Rotate the unit-circle point $(\\cos B, \\sin B)$ by angle $A$: rotating $(1, 0)$ gives $(\\cos A, \\sin A)$ and rotating $(0, 1)$ gives $(-\\sin A, \\cos A)$, so the image is $\\cos B(\\cos A, \\sin A) + \\sin B(-\\sin A, \\cos A)$. Its coordinates are $(\\cos A\\cos B - \\sin A\\sin B, \; \\sin A\\cos B + \\cos A\\sin B)$ — and it is the point at angle $A + B$, so these are $\\cos(A + B)$ and $\\sin(A + B)$. Replace $B$ by $-B$ for the difference formulae." } },

    { page: "Addition and double angles" },
    { worked: { tag: "exam", title: "Expand both sides to reach $\\tan x = 3\\sqrt3$; then solve a disguised version", src: "A-level June 2022 · P1 Q14 · 8 marks",
      q: "**(a)** Given $2\\sin(x - 60°) = \\cos(x - 30°)$, show that $\\tan x = 3\\sqrt3$. **(b)** Hence, or otherwise, solve for $0 \\le \\theta < 180°$: $2\\sin 2\\theta = \\cos(2\\theta + 30°)$, to one decimal place.",
      steps: [
        { h: "(a) Expand with exact values", m: "$2\\left(\\sin x \\cdot \\tfrac12 - \\cos x \\cdot \\tfrac{\\sqrt3}{2}\\right) = \\cos x \\cdot \\tfrac{\\sqrt3}{2} + \\sin x \\cdot \\tfrac12$\n$\\sin x - \\sqrt3\\cos x = \\tfrac{\\sqrt3}{2}\\cos x + \\tfrac12\\sin x \\Rightarrow \\tfrac12\\sin x = \\tfrac{3\\sqrt3}{2}\\cos x \\Rightarrow \\tan x = 3\\sqrt3$", mk: "M1 M1 A1 A1*", n: "Collect $\\sin x$ on one side and $\\cos x$ on the other, then divide by $\\cos x$." },
        { h: "(b) Match to (a): put $x = 2\\theta + 60°$", m: "Then $x - 60° = 2\\theta$ and $x - 30° = 2\\theta + 30°$, so the equation is exactly (a): $\\tan(2\\theta + 60°) = 3\\sqrt3$", mk: "M1", n: "\"Hence\" is a strong hint that the new equation *is* the old one in disguise." },
        { m: "$2\\theta + 60°$ in $[60°, 420°)$: $2\\theta + 60° = 79.1°, 259.1° \\Rightarrow \\theta = 9.6°, 99.6°$", mk: "M1 A1 A1" }
      ], result: "(b) $\\theta = 9.6°, 99.6°$" } },
    { worked: { tag: "exam", title: "Show $\\sin(x + 30°) + \\sqrt3\\cos(x + 30°) = 2\\cos x$; solve a follow-on", src: "A-level June 2025 · P1 Q14 · 7 marks",
      q: "**(a)** Show that $\\sin(x + 30°) + \\sqrt3\\cos(x + 30°) \\equiv 2\\cos x$. **(b)** Hence solve, for $0 \\le \\theta < 180°$, $\\sin(\\theta + 30°) + \\sqrt3\\cos(\\theta + 30°) = 3\\sin 2\\theta$, to one decimal place where appropriate.",
      steps: [
        { h: "(a)", m: "$\\left(\\tfrac{\\sqrt3}{2}\\sin x + \\tfrac12\\cos x\\right) + \\sqrt3\\left(\\tfrac{\\sqrt3}{2}\\cos x - \\tfrac12\\sin x\\right) = \\tfrac{\\sqrt3}{2}\\sin x + \\tfrac12\\cos x + \\tfrac32\\cos x - \\tfrac{\\sqrt3}{2}\\sin x = 2\\cos x$", mk: "M1 A1 A1*" },
        { h: "(b) $2\\cos\\theta = 3\\sin 2\\theta = 6\\sin\\theta\\cos\\theta$", m: "$\\cos\\theta(1 - 3\\sin\\theta) = 0$: $\\cos\\theta = 0 \\Rightarrow \\theta = 90°$; $\\sin\\theta = \\dfrac13 \\Rightarrow \\theta = 19.5°, 160.5°$", mk: "M1 M1 A1 A1", n: "Factorise — dividing by $\\cos\\theta$ throws away $90°$." }
      ], result: "(b) $19.5°, 90°, 160.5°$" } },
    { worked: { tag: "exam", title: "Prove $\\cos 3A = 4\\cos^3 A - 3\\cos A$; solve $1 - \\cos 3x = \\sin^2 x$", src: "A-level Oct 2020 · P2 Q10 · 8 marks",
      q: "**(a)** Show that $\\cos 3A \\equiv 4\\cos^3 A - 3\\cos A$. **(b)** Hence solve, for $-90° \\le x < 180°$, $1 - \\cos 3x = \\sin^2 x$.",
      steps: [
        { h: "(a) $3A = 2A + A$", m: "$\\cos 3A = \\cos 2A\\cos A - \\sin 2A\\sin A = (2\\cos^2 A - 1)\\cos A - 2\\sin^2 A\\cos A$\n$= 2\\cos^3 A - \\cos A - 2(1 - \\cos^2 A)\\cos A = 4\\cos^3 A - 3\\cos A$", mk: "M1 M1 A1 A1*", n: "Choose the $\\cos 2A$ form in $\\cos^2$, and turn the $\\sin^2$ into $1 - \\cos^2$." },
        { h: "(b)", m: "$1 - 4\\cos^3 x + 3\\cos x = 1 - \\cos^2 x \\Rightarrow 4\\cos^3 x - \\cos^2 x - 3\\cos x = 0 \\Rightarrow \\cos x(4\\cos x + 3)(\\cos x - 1) = 0$", mk: "M1 A1" },
        { m: "$\\cos x = 0$: $x = -90°, 90°$; $\\cos x = 1$: $x = 0$; $\\cos x = -\\dfrac34$: $x = 138.6°$ (the other, $-138.6°$, is outside)\n$x = -90°, 0°, 90°, 138.6°$", mk: "M1 A1", n: "Four solutions; each factor contributes." }
      ], result: "(b) $x = -90°, 0°, 90°, 138.6°$" } },
    { worked: { tag: "exam", title: "Prove $\\frac{\\cos 3\\theta}{\\sin\\theta} + \\frac{\\sin 3\\theta}{\\cos\\theta} \\equiv 2\\cot 2\\theta$ and solve", src: "A-level June 2019 · P2 Q12 · 7 marks",
      q: "**(a)** Prove that $\\frac{\\cos 3\\theta}{\\sin\\theta} + \\frac{\\sin 3\\theta}{\\cos\\theta} \\equiv 2\\cot 2\\theta$, $\\theta \\ne 90n°$. **(b)** Hence solve, for $90° < \\theta < 180°$, $\\frac{\\cos 3\\theta}{\\sin\\theta} + \\frac{\\sin 3\\theta}{\\cos\\theta} = 4$.",
      steps: [
        { h: "(a) Common denominator, then recognise $\\cos(A - B)$", m: "$\\dfrac{\\cos 3\\theta\\cos\\theta + \\sin 3\\theta\\sin\\theta}{\\sin\\theta\\cos\\theta} = \\dfrac{\\cos(3\\theta - \\theta)}{\\frac12\\sin 2\\theta} = \\dfrac{2\\cos 2\\theta}{\\sin 2\\theta} = 2\\cot 2\\theta$", mk: "M1 M1 A1 A1*", n: "The numerator is the $\\cos(A - B)$ expansion read backwards; the denominator is half of $\\sin 2\\theta$." },
        { h: "(b)", m: "$2\\cot 2\\theta = 4 \\Rightarrow \\tan 2\\theta = \\dfrac12$; $180° < 2\\theta < 360°$: $2\\theta = 26.57° + 180° = 206.57° \\Rightarrow \\theta = 103.3°$", mk: "M1 M1 A1" }
      ], result: "(b) $103.3°$" } },

    { page: "The R-form" },
    { callout: { t: "memorise", h: "Method for $a\\cos\\theta + b\\sin\\theta$", body: [
      "1. Write the target form and **expand it**: $R\\cos(\\theta - \\alpha) = R\\cos\\alpha\\cos\\theta + R\\sin\\alpha\\sin\\theta$.",
      "2. Compare coefficients: $R\\cos\\alpha = a$, $R\\sin\\alpha = b$.",
      "3. $R = \\sqrt{a^2 + b^2}$ (square and add); $\\tan\\alpha = \\frac{b}{a}$ (divide). Check $\\alpha$ is in the stated range.",
      "4. Use it: maximum $R$ (when the cosine is 1), minimum $-R$; solve $a\\cos\\theta + b\\sin\\theta = c$ as $\\cos(\\theta - \\alpha) = \\frac{c}{R}$.",
      "Which form? Whatever the question says. $R\\sin(\\theta + \\alpha)$ expands to $R\\sin\\theta\\cos\\alpha + R\\cos\\theta\\sin\\alpha$; $R\\cos(\\theta + \\alpha)$ to $R\\cos\\theta\\cos\\alpha - R\\sin\\theta\\sin\\alpha$ — the signs must match the expression."
    ] } },
    { worked: { tag: "exam", title: "$5\\sin\\theta - 5\\cos\\theta = 2$", src: "A-level June 2018 · P2 Q7(ii) · 5 marks",
      q: "Solve, for $0 \\le \\theta < 360°$, $5\\sin\\theta - 5\\cos\\theta = 2$, giving answers to one decimal place.",
      steps: [
        { h: "$R\\sin(\\theta - \\alpha)$", m: "$R\\sin\\theta\\cos\\alpha - R\\cos\\theta\\sin\\alpha$: $R\\cos\\alpha = 5$, $R\\sin\\alpha = 5 \\Rightarrow R = 5\\sqrt2$, $\\alpha = 45°$", mk: "M1 A1" },
        { m: "$5\\sqrt2\\sin(\\theta - 45°) = 2 \\Rightarrow \\sin(\\theta - 45°) = 0.2828 \\Rightarrow \\theta - 45° = 16.4°, 163.6°$", mk: "M1 A1" },
        { m: "$\\theta = 61.4°, 208.6°$", mk: "A1", n: "The interval for $\\theta - 45°$ is $[-45°, 315°)$; both solutions sit inside it." }
      ], result: "$\\theta = 61.4°, 208.6°$" } },
    { worked: { tag: "exam", title: "$R\\cos(\\theta - \\alpha)$; then the maximum of an arithmetic sum", src: "A-level June 2023 · P2 Q8 · 6 marks",
      q: "**(a)** Express $2\\cos\\theta + 8\\sin\\theta$ in the form $R\\cos(\\theta - \\alpha)$, $R > 0$, $0 < \\alpha < \\frac{\\pi}{2}$, with $\\alpha$ to 3 d.p. The first three terms of an arithmetic sequence are $\\cos x$, $\\cos x + \\sin x$, $\\cos x + 2\\sin x$, $x \\ne n\\pi$. $S_9$ is the sum of the first 9 terms. **(b)(i)** Find the exact maximum of $S_9$; **(ii)** deduce the smallest positive $x$ at which it occurs.",
      steps: [
        { h: "(a)", m: "$R = \\sqrt{4 + 64} = 2\\sqrt{17}$; $\\tan\\alpha = 4 \\Rightarrow \\alpha = 1.326$\n$2\\cos\\theta + 8\\sin\\theta = 2\\sqrt{17}\\cos(\\theta - 1.326)$", mk: "B1 M1 A1" },
        { h: "(b)(i) $a = \\cos x$, $d = \\sin x$", m: "$S_9 = \\dfrac92\\left[2\\cos x + 8\\sin x\\right] = \\dfrac92 \\cdot 2\\sqrt{17}\\cos(x - 1.326)$; maximum $9\\sqrt{17}$", mk: "M1 A1", n: "The sum is exactly the expression from (a) — that is why (a) was asked." },
        { h: "(ii)", m: "when $\\cos(x - 1.326) = 1$: $x = 1.326$", mk: "B1" }
      ], result: "(a) $2\\sqrt{17}\\cos(\\theta - 1.326)$ (b) $9\\sqrt{17}$ at $x = 1.326$" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Sign in $\\cos(A + B)$**: it is *minus* $\\sin A\\sin B$.",
      "**$\\cos 2A$ in the wrong form** — pick the version that leaves one function.",
      "**$\\sin 2A = 2\\sin A\\cos A$**, never $2\\sin A$.",
      "**$R$-form**: $\\alpha$ from $\\tan\\alpha = \\frac{b}{a}$ with the coefficients in the right order for the chosen form; check by expanding.",
      "**Radians for $\\alpha$** when the question says so, to the stated d.p.",
      "**Interval for $\\theta - \\alpha$** — shift the interval before listing solutions."
    ] },
    { callout: { t: "mnemonic", h: "\"Sine: sin-cos, cos-sin, same sign. Cosine: cos-cos, sin-sin, sign flips.\"", body: "The addition formulae in one breath." } }
  ],
  flashcards: [
    ["$\\sin(A + B)$ and $\\cos(A + B)$?", "$\\sin A\\cos B + \\cos A\\sin B$; $\\cos A\\cos B - \\sin A\\sin B$."],
    ["Three forms of $\\cos 2A$?", "$\\cos^2 A - \\sin^2 A = 2\\cos^2 A - 1 = 1 - 2\\sin^2 A$."],
    ["$\\sin 2A$, $\\tan 2A$?", "$2\\sin A\\cos A$; $\\frac{2\\tan A}{1 - \\tan^2 A}$."],
    ["$a\\cos\\theta + b\\sin\\theta = R\\cos(\\theta - \\alpha)$: $R$ and $\\alpha$?", "$R = \\sqrt{a^2 + b^2}$, $\\tan\\alpha = \\frac{b}{a}$."],
    ["Maximum of $2\\cos\\theta + 8\\sin\\theta$?", "$2\\sqrt{17}$."],
    ["$\\cos 3A$ in terms of $\\cos A$?", "$4\\cos^3 A - 3\\cos A$."],
    ["$\\frac{\\cos 3\\theta}{\\sin\\theta} + \\frac{\\sin 3\\theta}{\\cos\\theta} \\equiv$?", "$\\frac{\\cos 2\\theta}{\\sin\\theta\\cos\\theta} = 2\\cot 2\\theta$."],
    ["$5\\sin\\theta - 5\\cos\\theta$ in $R$-form?", "$5\\sqrt2\\sin(\\theta - 45°)$."],
    ["Why $R = \\sqrt{a^2 + b^2}$?", "$R\\cos\\alpha = a$, $R\\sin\\alpha = b$; square and add using $\\cos^2 + \\sin^2 = 1$."],
    ["$\\sin(x + 30°) + \\sqrt3\\cos(x + 30°) \\equiv$?", "$2\\cos x$."]
  ],
  quiz: [
    { q: "$\\cos(A - B) =$", opts: ["$\\cos A\\cos B + \\sin A\\sin B$", "$\\cos A\\cos B - \\sin A\\sin B$", "$\\sin A\\cos B - \\cos A\\sin B$", "$\\cos A - \\cos B$"], ans: 0, why: "Sign flips for cosine." },
    { q: "$\\sin 75° =$", opts: ["$\\tfrac{\\sqrt6 + \\sqrt2}{4}$", "$\\tfrac{\\sqrt6 - \\sqrt2}{4}$", "$\\tfrac{\\sqrt3}{2}$", "$\\tfrac{1 + \\sqrt3}{2}$"], ans: 0, why: "$\\sin(45 + 30)$." },
    { q: "$1 - 2\\sin^2 A =$", opts: ["$\\cos 2A$", "$\\sin 2A$", "$\\cos^2 A$", "$-\\cos 2A$"], ans: 0, why: "Double-angle form." },
    { q: "$3\\cos\\theta + 4\\sin\\theta$ has maximum", opts: ["7", "5", "4", "$\\sqrt7$"], ans: 1, why: "$R = 5$." },
    { q: "$\\tan 2A$ when $\\tan A = \\frac12$:", opts: ["$\\tfrac43$", "1", "$\\tfrac45$", "$\\tfrac34$"], ans: 0, why: "$\\frac{1}{1 - 1/4}$." },
    { q: "$\\cos\\theta\\cos 2\\theta + \\sin\\theta\\sin 2\\theta =$", opts: ["$\\cos\\theta$", "$\\cos 3\\theta$", "$\\sin\\theta$", "1"], ans: 0, why: "$\\cos(2\\theta - \\theta)$." }
  ]
};

/* =====================================================================
   5.7  Trig equations
   ===================================================================== */
C["maths:5.7"] = {
  notes: [
    { h: "Trig equations — the whole topic on one page" },
    "Every trig equation ends the same way: a value of $\\sin$, $\\cos$ or $\\tan$ of **something**, and a list of all the angles in an interval that give it. The skill is finding *all* of them and *only* them.",
    { callout: { t: "memorise", h: "From one solution to all of them", body: [
      "Calculator gives the **principal value** $\\theta_0$. Then:",
      "$\\sin\\theta = k$: $\;\\theta_0$ and $180° - \\theta_0$, then $\\pm360°$.",
      "$\\cos\\theta = k$: $\;\\theta_0$ and $-\\theta_0$ (i.e. $360° - \\theta_0$), then $\\pm360°$.",
      "$\\tan\\theta = k$: $\;\\theta_0$, then $\\pm180°$.",
      "In radians replace $180°$ by $\\pi$ and $360°$ by $2\\pi$. A sketch of the relevant graph with the horizontal line $y = k$ shows how many to expect."
    ] } },
    { fig: { x: [-0.3, 2 * Math.PI + 0.3], y: [-1.4, 1.4], axes: { pi: true, yt: [-1, 1] }, items: [
      { fn: "sin(x)", label: "y = sin x", at: 4.9, pos: "sw" },
      { hline: 0.6, c: "accent3", label: "y = 0.6" },
      { pt: [Math.asin(0.6), 0.6], label: "θ₀", pos: "s" }, { pt: [Math.PI - Math.asin(0.6), 0.6], label: "π − θ₀", pos: "s" }
    ], cap: "$\\sin\\theta = 0.6$ on $[0, 2\\pi)$: the calculator gives $\\theta_0 = 0.644$; the symmetry of the arch gives $\\pi - \\theta_0$. No others until the next period." } },

    { page: "Multiples and shifts of the angle" },
    { callout: { t: "memorise", h: "Transform the interval first", body: [
      "For $\\sin(2\\theta + 10°) = -0.6$ with $-90° \\le \\theta < 270°$: let $u = 2\\theta + 10°$. Then $u$ runs over $-170° \\le u < 550°$.",
      "List **every** solution for $u$ in that (wider) interval, then convert each back: $\\theta = \\frac{u - 10°}{2}$.",
      "Expect twice as many solutions for $2\\theta$ and three times as many for $3\\theta$ — the interval for $u$ is that much longer."
    ] } },
    { worked: { tag: "exam", title: "$\\sin(2\\theta + 10°) = -0.6$ over a wide interval; a student's errors", src: "AS Specimen · P1 Q11 · 9 marks",
      q: "**(i)** Solve, for $-90° \\le \\theta < 270°$, $\\sin(2\\theta + 10°) = -0.6$, to one decimal place. **(ii)(a)** A student solves $7\\tan x = 8\\sin x$ for $-90° < x < 90°$ by writing $7\\frac{\\sin x}{\\cos x} = 8\\sin x \\Rightarrow 7\\sin x = 8\\sin x\\cos x \\Rightarrow 7 = 8\\cos x \\Rightarrow \\cos x = \\frac78 \\Rightarrow x = 29.0°$. Identify two mistakes.",
      steps: [
        { h: "(i) $u = 2\\theta + 10°$, $-170° \\le u < 550°$", m: "$\\sin u = -0.6$: principal value $u_0 = -36.87°$. Solutions: $-36.87°$, $180° + 36.87° = 216.87°$, and adding $360°$: $323.13°$; also $-36.87° - 180° + \\ldots$: check $-143.13°$ ($= -180° + 36.87°$) is in range ✓; $576.87°$ is not.\n$u = -143.13°, -36.87°, 216.87°, 323.13°$", mk: "M1 A1 A1", n: "Four values of $u$ in a $720°$ window — two per period, as expected." },
        { m: "$\\theta = \\dfrac{u - 10°}{2} = -76.6°, -23.4°, 103.4°, 156.6°$", mk: "M1 A1" },
        { h: "(ii)(a)", m: "**1.** Dividing by $\\sin x$ loses $\\sin x = 0$, i.e. $x = 0$. **2.** $\\cos x = \\frac78$ also gives $x = -29.0°$, which is in the interval and was omitted.", mk: "B1 B1" }
      ], result: "(i) $-76.6°, -23.4°, 103.4°, 156.6°$" } },
    { worked: { tag: "exam", title: "$5\\sin 2\\theta = 9\\tan\\theta$; then the smallest positive solution of a shifted version", src: "A-level June 2019 · P1 Q6 · 8 marks",
      q: "**(a)** Solve, for $-180° \\le \\theta \\le 180°$, $5\\sin 2\\theta = 9\\tan\\theta$, to one decimal place where necessary. **(b)** Deduce the smallest positive solution of $5\\sin(2x - 50°) = 9\\tan(x - 25°)$.",
      steps: [
        { h: "(a) Double angle and $\\tan = \\frac{\\sin}{\\cos}$", m: "$10\\sin\\theta\\cos\\theta = \\dfrac{9\\sin\\theta}{\\cos\\theta} \\Rightarrow \\sin\\theta\\left(10\\cos^2\\theta - 9\\right) = 0$", mk: "M1 M1 A1", n: "Factorise, do not divide by $\\sin\\theta$." },
        { m: "$\\sin\\theta = 0$: $\\theta = -180°, 0°, 180°$. $\\cos^2\\theta = 0.9$: $\\cos\\theta = \\pm0.9487$: $\\theta = \\pm18.4°, \\pm161.6°$", mk: "M1 A1 A1", n: "Seven solutions. $\\cos\\theta = -0.9487$ gives $\\pm161.6°$; do not lose the negative square root." },
        { h: "(b) $x - 25° = \\theta$, so $2x - 50° = 2\\theta$ — the same equation", m: "$x = \\theta + 25°$; the smallest positive comes from $\\theta = -18.4°$: $x = 6.6°$", mk: "M1 A1", n: "Not from $\\theta = 0$ ($x = 25°$) — a negative $\\theta$ gives a smaller positive $x$." }
      ], result: "(a) $0°, \\pm18.4°, \\pm161.6°, \\pm180°$ (b) $6.6°$" } },
    { worked: { tag: "exam", title: "$\\text{cosec}\\,x - \\sin x = \\cos x\\cot(3x - 50°)$", src: "A-level Oct 2020 · P1 Q12 · 8 marks",
      q: "**(a)** Show that $\\text{cosec}\\,\\theta - \\sin\\theta \\equiv \\cos\\theta\\cot\\theta$, $\\theta \\ne 180n°$. **(b)** Hence, or otherwise, solve for $0 < x < 180°$: $\\text{cosec}\\,x - \\sin x = \\cos x\\cot(3x - 50°)$.",
      steps: [
        { h: "(a)", m: "$\\dfrac{1}{\\sin\\theta} - \\sin\\theta = \\dfrac{1 - \\sin^2\\theta}{\\sin\\theta} = \\dfrac{\\cos^2\\theta}{\\sin\\theta} = \\cos\\theta \\cdot \\dfrac{\\cos\\theta}{\\sin\\theta} = \\cos\\theta\\cot\\theta$", mk: "M1 A1 A1*" },
        { h: "(b) Replace the left side using (a)", m: "$\\cos x\\cot x = \\cos x\\cot(3x - 50°) \\Rightarrow \\cos x = 0$ or $\\cot x = \\cot(3x - 50°)$", mk: "M1", n: "Factorise: $\\cos x(\\cot x - \\cot(3x - 50°)) = 0$." },
        { m: "$\\cos x = 0$: $x = 90°$. $\\tan(3x - 50°) = \\tan x$: $3x - 50° = x + 180n° \\Rightarrow x = 25° + 90n°$: $x = 25°, 115°$", mk: "M1 A1 A1 A1", n: "Equal tangents differ by a multiple of $180°$ — that is the period of $\\tan$." }
      ], result: "(b) $x = 25°, 90°, 115°$" } },
    { worked: { tag: "exam", title: "Depth of water: solve $5 + 2\\sin(30t)° = 3.8$ for the earliest time", src: "A-level June 2018 · P1 Q8 · 5 marks",
      q: "The depth of water in a harbour is $D = 5 + 2\\sin(30t)°$ metres, $0 \\le t < 24$, $t$ hours after midnight. A boat enters at 06:30 and needs 2 hours to load; it needs at least 3.8 m to leave. **(a)** Find the depth when the boat enters. **(b)** Find, to the nearest minute, the earliest time the boat can leave.",
      steps: [
        { h: "(a) $t = 6.5$", m: "$D = 5 + 2\\sin195° = 5 - 0.518 = 4.48$ m", mk: "B1", n: "Degrees mode: $30t$ is in degrees." },
        { h: "(b) When does $D$ come back up to 3.8?", m: "$2\\sin(30t) = -1.2 \\Rightarrow \\sin(30t) = -0.6 \\Rightarrow 30t = 216.87°$ or $323.13°$ (in $0 \\le 30t < 720$) $\\Rightarrow t = 7.23$ or $10.77$", mk: "M1 A1 A1", n: "At $t = 8.5$ (loading finished) the depth is $5 + 2\\sin255° = 3.07 < 3.8$: too shallow. The depth is *falling* through 3.8 at $t = 7.23$ and *rising* through it at $t = 10.77$." },
        { m: "Earliest departure is when the depth rises back to 3.8: $t = 10.77$ h $= $ **10:46**", mk: "A1", n: "$0.771 \\times 60 = 46.3$ minutes. Choosing $7.23$ (07:14) is wrong — the boat is still loading, and the water is going down." }
      ], result: "(a) $4.48$ m (b) 10:46" } },

    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Solve … for $0 \\le \\theta < 360°$**", "every solution in that interval, no extras, in the unit given"],
      ["**Giving your answers to one decimal place where appropriate**", "exact ones stay exact ($90°$, $\\frac{\\pi}{3}$); others rounded"],
      ["**Hence** solve a related equation", "map the new variable onto the old one; transform the interval"],
      ["**Deduce the smallest positive solution**", "consider the negative solutions of the base equation too"],
      ["**Identify the mistakes**", "name them: dividing by a function; missing the second angle; wrong interval"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Missing the second angle** ($180° - \\theta_0$ for sine, $-\\theta_0$ for cosine).",
      "**Wrong period** for tan ($180°$).",
      "**Interval not transformed** for $2\\theta$, $3x$, $\\theta - \\alpha$.",
      "**Extra solutions** outside the interval left in the answer — each usually costs the final A mark.",
      "**Calculator mode** — degrees vs radians; check the D/R indicator.",
      "**Dividing by a function** instead of factorising."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Principal value", "$\\sin^{-1}$, $\\cos^{-1}$, $\\tan^{-1}$ give one angle in $[-90°, 90°]$, $[0°, 180°]$, $(-90°, 90°)$. Everything else is yours to derive."],
      ["Table for a check", "Table app with $f(x) = 5\\sin(2x) - 9\\tan x$ over the interval, step $5°$: sign changes locate every solution; count them against your list."],
      ["Solve", "**Equation → Solver** finds one root near a start value — useful to check a value, never to find the full set."]
    ] },
    { callout: { t: "mnemonic", h: "\"Sketch, principal, symmetry, period, interval\"", body: "Draw the graph; get the calculator value; use the symmetry for the partner; add periods; keep only what is in the interval." } }
  ],
  flashcards: [
    ["General solutions of $\\sin\\theta = k$, $\\cos\\theta = k$, $\\tan\\theta = k$ from the principal value $\\theta_0$?", "$\\theta_0, 180° - \\theta_0$ ($\\pm360°$); $\\pm\\theta_0$ ($\\pm360°$); $\\theta_0 + 180°n$."],
    ["First step for $\\sin(2\\theta + 10°) = -0.6$, $-90° \\le \\theta < 270°$?", "$u = 2\\theta + 10°$ with $-170° \\le u < 550°$; solve for $u$, convert back."],
    ["$5\\sin 2\\theta = 9\\tan\\theta$ factorised?", "$\\sin\\theta(10\\cos^2\\theta - 9) = 0$."],
    ["$\\tan A = \\tan B$ implies…", "$A = B + 180°n$."],
    ["Depth $5 + 2\\sin(30t)°$ reaches 3.8 m rising at…", "$\\sin(30t) = -0.6$, $30t = 323.13°$, $t = 10.77$ h = 10:46."],
    ["Two classic errors in trig equations?", "Dividing by $\\sin x$ (loses $x = 0$); taking only the principal value."],
    ["How many solutions of $\\cos 3x = k$ ($|k| < 1$) in $0 \\le x < 360°$?", "6 — $3x$ covers three periods, two each."]
  ],
  quiz: [
    { q: "$\\cos\\theta = 0.5$, $0 \\le \\theta < 360°$:", opts: ["$60°, 120°$", "$60°, 300°$", "$60°, 240°$", "$60°$ only"], ans: 1, why: "$\\pm60°$, i.e. $60°$ and $300°$." },
    { q: "$\\tan\\theta = 1$, $-180° \\le \\theta \\le 180°$:", opts: ["$45°$ only", "$45°, -135°$", "$45°, 135°$", "$45°, 225°$"], ans: 1, why: "Period $180°$." },
    { q: "$\\sin 2\\theta = 0.5$, $0 \\le \\theta < 180°$ has", opts: ["1 solution", "2 solutions", "4 solutions", "3 solutions"], ans: 1, why: "$2\\theta \\in [0, 360)$: $30°, 150°$; $\\theta = 15°, 75°$." },
    { q: "$\\sin(\\theta - 30°) = -1$, $0 \\le \\theta < 360°$:", opts: ["$300°$", "$240°$", "$270°$", "$120°$"], ans: 0, why: "$\\theta - 30° = 270°$." },
    { q: "Principal value of $\\cos^{-1}(-0.5)$:", opts: ["$120°$", "$-60°$", "$240°$", "$60°$"], ans: 0, why: "Range $[0°, 180°]$." },
    { q: "$\\sin\\theta\\cos\\theta = 0.25\\sin\\theta$ — correct next step:", opts: ["$\\cos\\theta = 0.25$", "$\\sin\\theta(\\cos\\theta - 0.25) = 0$", "$\\tan\\theta = 0.25$", "$\\theta = 0$"], ans: 1, why: "Factorise." }
  ]
};

/* =====================================================================
   5.8  Trig proofs
   ===================================================================== */
C["maths:5.8"] = {
  notes: [
    { h: "Trig proofs — the whole topic on one page" },
    "\"Prove that … $\\equiv$ …\" or \"Show that … can be written as …\". Almost every A-level paper has one, worth 3–5 marks, and it usually sets up the equation that follows. The rules of the game:",
    { ul: [
      "Work on **one side** (usually the more complicated) until it becomes the other — or work both sides down to the same expression. Never move terms across the $\\equiv$ as if solving an equation.",
      "Every step is an identity or algebra; every step is **written**. The A* mark is for a complete chain with no gaps.",
      "Use $\\equiv$ (or leave the sign out and write a chain of $=$ from the left side); do not write LHS $=$ RHS at the start.",
      "State any excluded values if the question does ($\\theta \\ne 90n°$: where a denominator vanishes)."
    ] },
    { callout: { t: "memorise", h: "The moves, in the order to try them", body: [
      "1. **Everything in $\\sin$ and $\\cos$**: $\\tan = \\frac{\\sin}{\\cos}$, $\\sec = \\frac{1}{\\cos}$, $\\text{cosec} = \\frac{1}{\\sin}$, $\\cot = \\frac{\\cos}{\\sin}$.",
      "2. **Fractions**: put over a common denominator; or split a single fraction; or multiply top and bottom by a conjugate ($1 + \\sin\\theta$ with $1 - \\sin\\theta$ gives $\\cos^2\\theta$).",
      "3. **Pythagoras** to swap $\\sin^2 \\leftrightarrow 1 - \\cos^2$, $\\sec^2 - 1 \\to \\tan^2$, and $1 \\pm \\cos 2\\theta \\to 2\\cos^2\\theta$ or $2\\sin^2\\theta$.",
      "4. **Double angles / addition formulae** whenever a $2\\theta$ or a compound angle appears — or, backwards, when you see $\\cos A\\cos B + \\sin A\\sin B$.",
      "5. **Factorise** and cancel; look for a difference of two squares.",
      "Aim at the target: keep glancing at the right-hand side to see which function it wants."
    ] } },

    { page: "Worked proofs" },
    { worked: { tag: "exam", title: "$1 - \\cos 2\\theta \\equiv \\tan\\theta\\sin 2\\theta$; solve a 3-factor equation", src: "A-level June 2018 · P2 Q12 · 9 marks",
      q: "**(a)** Prove that $1 - \\cos 2\\theta \\equiv \\tan\\theta\\sin 2\\theta$, $\\theta \\ne \\frac{(2n + 1)\\pi}{2}$. **(b)** Hence solve, for $-\\frac{\\pi}{2} < x < \\frac{\\pi}{2}$: $(\\sec^2 x - 5)(1 - \\cos 2x) = 3\\tan^2 x\\sin 2x$, non-exact answers to 3 d.p.",
      steps: [
        { h: "(a) Start from the right", m: "$\\tan\\theta\\sin 2\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta} \\cdot 2\\sin\\theta\\cos\\theta = 2\\sin^2\\theta = 1 - \\cos 2\\theta$", mk: "M1 M1 A1*", n: "The excluded values are where $\\cos\\theta = 0$ — $\\tan\\theta$ undefined." },
        { h: "(b) Substitute (a) for $1 - \\cos 2x$", m: "$(\\sec^2 x - 5)\\tan x\\sin 2x = 3\\tan^2 x\\sin 2x \\Rightarrow \\tan x\\sin 2x\\left[\\sec^2 x - 5 - 3\\tan x\\right] = 0$", mk: "M1 A1", n: "Bring everything to one side and factorise — three factors, three families of solutions." },
        { m: "$\\tan x = 0 \\Rightarrow x = 0$; $\\sin 2x = 0 \\Rightarrow x = 0$; $1 + \\tan^2 x - 5 - 3\\tan x = 0 \\Rightarrow \\tan^2 x - 3\\tan x - 4 = 0 \\Rightarrow (\\tan x - 4)(\\tan x + 1) = 0$", mk: "M1 A1" },
        { m: "$\\tan x = 4 \\Rightarrow x = 1.326$; $\\tan x = -1 \\Rightarrow x = -\\dfrac{\\pi}{4}$\n$x = -\\dfrac{\\pi}{4}, 0, 1.326$", mk: "A1 A1", n: "Radians — the interval is in $\\pi$. The exact $-\\frac{\\pi}{4}$ stays exact." }
      ], result: "(b) $x = -\\frac{\\pi}{4}, 0, 1.326$" } },
    { worked: { tag: "exam", title: "$\\text{cosec}\\,2x + \\cot 2x \\equiv \\cot x$; solve with a shifted angle", src: "A-level Specimen · P2 Q13 · 10 marks",
      q: "**(a)** Show that $\\text{cosec}\\,2x + \\cot 2x \\equiv \\cot x$, $x \\ne 90n°$. **(b)** Hence, or otherwise, solve for $0 \\le \\theta < 180°$: $\\text{cosec}(4\\theta + 10°) + \\cot(4\\theta + 10°) = \\sqrt3$.",
      steps: [
        { h: "(a) Single fraction, then double angles", m: "$\\dfrac{1}{\\sin 2x} + \\dfrac{\\cos 2x}{\\sin 2x} = \\dfrac{1 + \\cos 2x}{\\sin 2x} = \\dfrac{2\\cos^2 x}{2\\sin x\\cos x} = \\dfrac{\\cos x}{\\sin x} = \\cot x$", mk: "M1 M1 A1 A1 A1*", n: "$1 + \\cos 2x = 2\\cos^2 x$ is the version to reach for whenever you see $1 + \\cos$ of a double angle." },
        { h: "(b) With $2x = 4\\theta + 10°$, i.e. $x = 2\\theta + 5°$", m: "$\\cot(2\\theta + 5°) = \\sqrt3 \\Rightarrow \\tan(2\\theta + 5°) = \\dfrac{1}{\\sqrt3}$", mk: "M1 A1" },
        { m: "$5° \\le 2\\theta + 5° < 365°$: $2\\theta + 5° = 30°, 210° \\Rightarrow \\theta = 12.5°, 102.5°$", mk: "M1 A1 A1" }
      ], result: "(b) $\\theta = 12.5°, 102.5°$" } },
    { worked: { tag: "exam", title: "Prove $\\frac{1 - \\cos 2t + \\sin 2t}{1 + \\cos 2t + \\sin 2t} \\equiv \\tan t$", src: "A-level Oct 2021 · P1 Q10 · 8 marks",
      q: "**(a)** Given $1 + \\cos 2\\theta + \\sin 2\\theta \\ne 0$, prove that $\\frac{1 - \\cos 2\\theta + \\sin 2\\theta}{1 + \\cos 2\\theta + \\sin 2\\theta} \\equiv \\tan\\theta$. **(b)** Hence solve, for $0 < x < 180°$: $\\frac{1 - \\cos 4x + \\sin 4x}{1 + \\cos 4x + \\sin 4x} = 3\\sin 2x$, to one decimal place where appropriate.",
      steps: [
        { h: "(a) Double angles chosen to create common factors", m: "Numerator: $2\\sin^2\\theta + 2\\sin\\theta\\cos\\theta = 2\\sin\\theta(\\sin\\theta + \\cos\\theta)$\nDenominator: $2\\cos^2\\theta + 2\\sin\\theta\\cos\\theta = 2\\cos\\theta(\\cos\\theta + \\sin\\theta)$", mk: "M1 A1 M1", n: "$1 - \\cos 2\\theta = 2\\sin^2\\theta$ on top, $1 + \\cos 2\\theta = 2\\cos^2\\theta$ below." },
        { m: "$\\dfrac{2\\sin\\theta(\\sin\\theta + \\cos\\theta)}{2\\cos\\theta(\\sin\\theta + \\cos\\theta)} = \\dfrac{\\sin\\theta}{\\cos\\theta} = \\tan\\theta$", mk: "A1*", n: "The cancelled factor is non-zero by the given condition — mention it." },
        { h: "(b) With $\\theta = 2x$", m: "$\\tan 2x = 3\\sin 2x \\Rightarrow \\sin 2x\\left(\\dfrac{1}{\\cos 2x} - 3\\right) = 0$", mk: "M1" },
        { m: "$\\sin 2x = 0 \\Rightarrow 2x = 180° \\Rightarrow x = 90°$; $\\cos 2x = \\dfrac13 \\Rightarrow 2x = 70.5°, 289.5° \\Rightarrow x = 35.3°, 144.7°$", mk: "M1 A1 A1" }
      ], result: "(b) $x = 35.3°, 90°, 144.7°$" } },
    { worked: { tag: "exam", title: "Prove with cosec: $\\frac{1}{\\text{cosec}\\,\\theta - 1} + \\frac{1}{\\text{cosec}\\,\\theta + 1} \\equiv 2\\tan\\theta\\sec\\theta$", src: "A-level June 2024 · P2 Q8 · 7 marks",
      q: "**(a)** Prove the identity above for $\\theta \\ne 90n°$. **(b)** Hence solve, for $0 < x < 90°$: $\\frac{1}{\\text{cosec}\\,2x - 1} + \\frac{1}{\\text{cosec}\\,2x + 1} = \\cot 2x\\sec 2x$, to one decimal place.",
      steps: [
        { h: "(a) Common denominator is a difference of two squares", m: "$\\dfrac{(\\text{cosec}\\,\\theta + 1) + (\\text{cosec}\\,\\theta - 1)}{\\text{cosec}^2\\theta - 1} = \\dfrac{2\\text{cosec}\\,\\theta}{\\cot^2\\theta}$", mk: "M1 A1", n: "$\\text{cosec}^2\\theta - 1 = \\cot^2\\theta$." },
        { m: "$= \\dfrac{2}{\\sin\\theta} \\cdot \\dfrac{\\sin^2\\theta}{\\cos^2\\theta} = \\dfrac{2\\sin\\theta}{\\cos^2\\theta} = 2 \\cdot \\dfrac{\\sin\\theta}{\\cos\\theta} \\cdot \\dfrac{1}{\\cos\\theta} = 2\\tan\\theta\\sec\\theta$", mk: "A1*" },
        { h: "(b)", m: "$2\\tan 2x\\sec 2x = \\cot 2x\\sec 2x \\Rightarrow 2\\tan 2x = \\cot 2x$ (as $\\sec 2x \\ne 0$) $\\Rightarrow \\tan^2 2x = \\dfrac12 \\Rightarrow \\tan 2x = \\pm\\dfrac{1}{\\sqrt2}$", mk: "M1 A1" },
        { m: "$0 < 2x < 180°$: $2x = 35.3°, 144.7° \\Rightarrow x = 17.6°, 72.4°$", mk: "M1 A1" }
      ], result: "(b) $x = 17.6°, 72.4°$" } },
    { worked: { tag: "exam", title: "AS-level: $\\frac{1}{\\cos\\theta} + \\tan\\theta \\equiv \\frac{\\cos\\theta}{1 - \\sin\\theta}$ by a conjugate", src: "AS June 2022 · P1 Q13 · 8 marks",
      q: "**(a)** Show that $\\frac{1}{\\cos\\theta} + \\tan\\theta \\equiv \\frac{\\cos\\theta}{1 - \\sin\\theta}$, $\\theta \\ne (2n + 1)90°$. **(b)** Given $\\cos 2x \\ne 0$, solve for $0 < x < 90°$: $\\frac{1}{\\cos 2x} + \\tan 2x = 3\\cos 2x$, to one decimal place.",
      steps: [
        { h: "(a)", m: "$\\dfrac{1}{\\cos\\theta} + \\dfrac{\\sin\\theta}{\\cos\\theta} = \\dfrac{1 + \\sin\\theta}{\\cos\\theta} = \\dfrac{(1 + \\sin\\theta)(1 - \\sin\\theta)}{\\cos\\theta(1 - \\sin\\theta)} = \\dfrac{\\cos^2\\theta}{\\cos\\theta(1 - \\sin\\theta)} = \\dfrac{\\cos\\theta}{1 - \\sin\\theta}$", mk: "M1 M1 A1*", n: "Multiplying by $\\frac{1 - \\sin\\theta}{1 - \\sin\\theta}$ turns $1 - \\sin^2\\theta$ into $\\cos^2\\theta$ — the standard way to get a $1 \\pm \\sin$ into a denominator." },
        { h: "(b) Use (a) with $\\theta = 2x$", m: "$\\dfrac{\\cos 2x}{1 - \\sin 2x} = 3\\cos 2x \\Rightarrow 1 = 3(1 - \\sin 2x)$ (dividing by $\\cos 2x \\ne 0$) $\\Rightarrow \\sin 2x = \\dfrac23$", mk: "M1 A1 A1", n: "Here dividing is legitimate because the question *says* $\\cos 2x \\ne 0$." },
        { m: "$0 < 2x < 180°$: $2x = 41.8°, 138.2° \\Rightarrow x = 20.9°, 69.1°$", mk: "M1 A1" }
      ], result: "(b) $x = 20.9°, 69.1°$" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Solving instead of proving** — moving terms across the identity. Work on one side.",
      "**Skipped step**: the A* mark needs the chain complete; a jump from $\\frac{1 + \\cos 2x}{\\sin 2x}$ straight to $\\cot x$ is M1 A0.",
      "**Cancelling a factor that could be zero** without noting the condition given.",
      "**Wrong double-angle form**: $1 + \\cos 2\\theta = 2\\cos^2\\theta$, $1 - \\cos 2\\theta = 2\\sin^2\\theta$.",
      "**Not using the proved identity** in the \"hence\" part and starting from scratch."
    ] },
    { callout: { t: "mnemonic", h: "\"Sin-cos everything, one fraction, Pythagoras, doubles, factorise\"", body: "The five moves. If you are stuck, do the next one on the list." } }
  ],
  flashcards: [
    ["Rule for proving an identity?", "Transform one side into the other (or both into the same thing); never move terms across $\\equiv$."],
    ["$1 + \\cos 2\\theta$ and $1 - \\cos 2\\theta$?", "$2\\cos^2\\theta$; $2\\sin^2\\theta$."],
    ["How do you turn $\\frac{1 + \\sin\\theta}{\\cos\\theta}$ into $\\frac{\\cos\\theta}{1 - \\sin\\theta}$?", "Multiply top and bottom by $1 - \\sin\\theta$; $1 - \\sin^2 = \\cos^2$; cancel a $\\cos\\theta$."],
    ["$\\text{cosec}\\,2x + \\cot 2x \\equiv$?", "$\\frac{1 + \\cos 2x}{\\sin 2x} = \\cot x$."],
    ["$\\text{cosec}^2\\theta - 1 = $?", "$\\cot^2\\theta$."],
    ["$\\tan\\theta\\sin 2\\theta \\equiv$?", "$2\\sin^2\\theta = 1 - \\cos 2\\theta$."],
    ["First move in any proof with tan, sec, cosec, cot?", "Rewrite everything in $\\sin$ and $\\cos$."]
  ],
  quiz: [
    { q: "$\\frac{\\sin 2\\theta}{1 + \\cos 2\\theta} \\equiv$", opts: ["$\\tan\\theta$", "$\\cot\\theta$", "$\\sin\\theta$", "$2\\tan\\theta$"], ans: 0, why: "$\\frac{2\\sin\\theta\\cos\\theta}{2\\cos^2\\theta}$." },
    { q: "To simplify $\\frac{1}{1 + \\cos\\theta}$ multiply top and bottom by", opts: ["$1 - \\cos\\theta$", "$1 + \\cos\\theta$", "$\\cos\\theta$", "$\\sin\\theta$"], ans: 0, why: "Gives $\\sin^2\\theta$ below." },
    { q: "$\\sec\\theta - \\cos\\theta \\equiv$", opts: ["$\\sin\\theta\\tan\\theta$", "$\\tan\\theta$", "$\\sin^2\\theta$", "$\\cos\\theta\\tan\\theta$"], ans: 0, why: "$\\frac{1 - \\cos^2\\theta}{\\cos\\theta} = \\frac{\\sin^2\\theta}{\\cos\\theta}$." },
    { q: "In a proof, writing \"LHS $=$ RHS\" as the first line is", opts: ["required", "not allowed — it assumes the result", "optional", "worth a mark"], ans: 1, why: "Start from one side." },
    { q: "$\\cos^4\\theta - \\sin^4\\theta \\equiv$", opts: ["$\\cos 2\\theta$", "$1$", "$\\sin 2\\theta$", "$\\cos^2\\theta$"], ans: 0, why: "Difference of squares: $(\\cos^2 - \\sin^2)(\\cos^2 + \\sin^2)$." }
  ]
};

/* =====================================================================
   5.9  Trig in context
   ===================================================================== */
C["maths:5.9"] = {
  notes: [
    { h: "Trig models — the whole topic on one page" },
    "Anything that oscillates — tides, temperature, a Ferris wheel, a water wheel, rabbit populations — is modelled by $y = A\\sin(bt + \\alpha) + c$ or its $R$-form cousin $c + a\\cos bt + b'\\sin bt$. The questions: build the model from its features, find the maximum/minimum and **when**, solve for a time, and comment.",
    { table: { head: ["Feature", "Parameter", "How to read / set it"], rows: [
      ["mean level", "$c$", "halfway between max and min"],
      ["amplitude", "$A$ (or $R$)", "half the range: $\\frac{\\max - \\min}{2}$"],
      ["period $T$", "$b = \\frac{360°}{T}$ or $\\frac{2\\pi}{T}$", "time for one full cycle"],
      ["phase / start", "$\\alpha$", "fixed by the value at $t = 0$, or by when the max occurs"],
      ["two-term form $a\\cos bt + b'\\sin bt$", "convert to $R$-form (5.6)", "max $= c + R$, min $= c - R$, at $bt \\mp \\alpha = 0°$ / $180°$"]
    ] } },

    { page: "Building and using a model" },
    { worked: { tag: "exam", title: "Ferris wheel: $H = |A\\sin(bt + \\alpha)°|$ from three facts", src: "A-level June 2022 · P2 Q9(a) · 4 marks",
      q: "The height $H$ m of a passenger $t$ seconds after a Ferris wheel starts is $H = |A\\sin(bt + \\alpha)°|$. The maximum height is 50 m, the passenger starts 1 m above the ground, and one revolution takes 720 seconds. Find $A$ exactly, $b$ exactly and $\\alpha$ to 3 s.f.",
      steps: [
        { h: "Amplitude", m: "$A = 50$", mk: "B1" },
        { h: "Period — the modulus halves it", m: "$|\\sin|$ repeats every $180°$ of its argument, and the graph shows one arch per revolution. So one revolution (720 s) is $180°$ of argument: $720b = 180 \\Rightarrow b = \\dfrac14$", mk: "M1 A1", n: "Without the modulus, one revolution would be $360°$ and $b = \\frac12$. The modulus is what makes the graph a chain of arches." },
        { h: "Start height", m: "$50\\sin\\alpha = 1 \\Rightarrow \\alpha = \\sin^{-1}(0.02) = 1.15°$", mk: "A1" }
      ], result: "$A = 50$, $b = \\frac14$, $\\alpha = 1.15$" } },
    { worked: { tag: "exam", title: "Temperature model with $R$-form: maximum and the time it occurs", src: "A-level Oct 2020 · P1 Q6 · 7 marks",
      q: "**(a)** Express $\\sin x + 2\\cos x$ as $R\\sin(x + \\alpha)$, $R > 0$, $0 < \\alpha < \\frac{\\pi}{2}$, $\\alpha$ to 3 d.p. The temperature in a room is $\\theta = 5 + \\sin\\left(\\frac{\\pi t}{12} - 3\\right) + 2\\cos\\left(\\frac{\\pi t}{12} - 3\\right)$, $0 \\le t < 24$, $t$ hours after midnight. **(b)** Deduce the maximum temperature. **(c)** Find the time of day when it occurs, to the nearest minute.",
      steps: [
        { h: "(a)", m: "$R = \\sqrt5$, $\\tan\\alpha = 2 \\Rightarrow \\alpha = 1.107$: $\\sqrt5\\sin(x + 1.107)$", mk: "B1 M1 A1" },
        { h: "(b)", m: "$\\theta = 5 + \\sqrt5\\sin\\left(\\dfrac{\\pi t}{12} - 3 + 1.107\\right)$; maximum $5 + \\sqrt5 = 7.24°$C", mk: "B1" },
        { h: "(c) Sine is 1 when its argument is $\\frac{\\pi}{2}$", m: "$\\dfrac{\\pi t}{12} - 1.893 = \\dfrac{\\pi}{2} \\Rightarrow t = \\dfrac{12}{\\pi}\\left(\\dfrac{\\pi}{2} + 1.893\\right) = 13.23$ h $=$ **13:14**", mk: "M1 M1 A1", n: "$0.23 \\times 60 = 13.8$ min. Radians throughout: the model's argument has $\\pi$ in it." }
      ], result: "(a) $\\sqrt5\\sin(x + 1.107)$ (b) $7.24°$C (c) 13:14" } },
    { worked: { tag: "exam", title: "Tide model: depth at midnight, maximum depth, afternoon time of the maximum", src: "A-level Specimen · P1 Q13 · 11 marks",
      q: "**(a)** Express $2\\sin\\theta - 1.5\\cos\\theta$ as $R\\sin(\\theta - \\alpha)$, $R > 0$, $0 < \\alpha < \\frac{\\pi}{2}$, $\\alpha$ to 4 d.p. Tom models the depth of water at a harbour by $D = 6 + 2\\sin\\left(\\frac{4\\pi t}{25}\\right) - 1.5\\cos\\left(\\frac{4\\pi t}{25}\\right)$, $0 \\le t \\le 24$. **(b)** Find the depth at 00:00. **(c)** Find the maximum depth. **(d)** Find the time in the afternoon when the maximum occurs, to the nearest minute.",
      steps: [
        { h: "(a)", m: "$R = \\sqrt{4 + 2.25} = 2.5$; $\\tan\\alpha = \\dfrac{1.5}{2} \\Rightarrow \\alpha = 0.6435$: $2.5\\sin(\\theta - 0.6435)$", mk: "B1 M1 A1" },
        { h: "(b) $t = 0$", m: "$D = 6 - 1.5 = 4.5$ m", mk: "B1" },
        { h: "(c)", m: "$D = 6 + 2.5\\sin\\left(\\dfrac{4\\pi t}{25} - 0.6435\\right)$: maximum $8.5$ m", mk: "B1" },
        { h: "(d) Argument $= \\frac{\\pi}{2} + 2\\pi n$", m: "$\\dfrac{4\\pi t}{25} - 0.6435 = \\dfrac{\\pi}{2} \\Rightarrow t = 4.405$ (04:24, morning). Period $= \\dfrac{2\\pi}{4\\pi/25} = 12.5$ h, so the next maximum is at $t = 16.905$ h $=$ **16:54**", mk: "M1 A1 A1", n: "\"In the afternoon\" tells you to add one period to the first maximum." }
      ], result: "(b) 4.5 m (c) 8.5 m (d) 16:54" } },
    { worked: { tag: "exam", title: "Rabbits and foxes: $K\\cos(\\theta + \\alpha)$, a complete model, a comment", src: "A-level June 2024 · P1 Q12 · 11 marks",
      q: "**(a)** Express $140\\cos\\theta - 480\\sin\\theta$ as $K\\cos(\\theta + \\alpha)$, $K > 0$, $0 < \\alpha < 90°$, $\\alpha$ to 2 d.p. The number of rabbits is $R = A + 140\\cos(30t)° - 480\\sin(30t)°$, $t$ months after the start of the year, and the maximum is 1500. **(b)(i)** Find a complete equation for the model. **(ii)** Write down the minimum number of rabbits. The actual minimum occurs in the middle of April. **(c)** Comment on the model. The number of foxes is $F = 100 + 70\\sin(30t + 70)°$ and is at its minimum after $T$ months. **(d)** Find the number of rabbits at time $T$.",
      steps: [
        { h: "(a)", m: "$K = \\sqrt{140^2 + 480^2} = 500$; $\\tan\\alpha = \\dfrac{480}{140} \\Rightarrow \\alpha = 73.74°$", mk: "B1 M1 A1", n: "$K\\cos(\\theta + \\alpha) = K\\cos\\alpha\\cos\\theta - K\\sin\\alpha\\sin\\theta$: the minus sign matches." },
        { h: "(b)", m: "$R = A + 500\\cos(30t + 73.74)°$; maximum $A + 500 = 1500 \\Rightarrow A = 1000$: $R = 1000 + 500\\cos(30t + 73.74)°$. Minimum $500$.", mk: "M1 A1 B1" },
        { h: "(c) When does the model's minimum occur?", m: "$30t + 73.74 = 180 \\Rightarrow t = 3.54$ months — mid-April. The model agrees with the observed minimum, which supports it.", mk: "M1 A1", n: "Compute, compare, conclude." },
        { h: "(d) Foxes minimum when $\\sin(30T + 70)° = -1$", m: "$30T + 70 = 270 \\Rightarrow T = \\dfrac{20}{3}$; $R = 1000 + 500\\cos(200 + 73.74)° = 1000 + 500\\cos273.74° = 1033$", mk: "M1 M1 A1", n: "Whole rabbits: 1033 (or 1030 to 3 s.f.)." }
      ], result: "(a) $500\\cos(\\theta + 73.74°)$ (b) $R = 1000 + 500\\cos(30t + 73.74)°$, min 500 (d) ≈ 1033" } },
    { worked: { tag: "exam", title: "Water wheel: maximum height and when; a negative minimum", src: "A-level Oct 2021 · P2 Q15 · 11 marks",
      q: "**(a)** Express $2\\cos\\theta - \\sin\\theta$ as $R\\cos(\\theta + \\alpha)$, $R > 0$, $0 < \\alpha < \\frac{\\pi}{2}$, $\\alpha$ to 3 d.p. The height of a paddle above the water is $H = 3 + 4\\cos(0.5t) - 2\\sin(0.5t)$ metres, $t$ seconds after the wheel starts. **(b)(i)** Find the maximum height. **(ii)** Find the first time it occurs. **(c)** Find the minimum height and interpret it.",
      steps: [
        { h: "(a)", m: "$R = \\sqrt5$, $\\tan\\alpha = \\dfrac12 \\Rightarrow \\alpha = 0.464$: $\\sqrt5\\cos(\\theta + 0.464)$", mk: "B1 M1 A1" },
        { h: "(b) $H = 3 + 2\\sqrt5\\cos(0.5t + 0.464)$", m: "(i) maximum $3 + 2\\sqrt5 = 7.47$ m. (ii) first when $0.5t + 0.464 = 2\\pi$ ($t > 0$): $t = 2(2\\pi - 0.464) = 11.6$ s", mk: "B1 M1 A1 A1", n: "$0.5t + 0.464 = 0$ gives a negative $t$; the first *positive* time uses $2\\pi$." },
        { h: "(c)", m: "Minimum $3 - 2\\sqrt5 = -1.47$ m: the paddle is $1.47$ m **below** the water level at its lowest point.", mk: "B1 B1" }
      ], result: "(b) 7.47 m at $t = 11.6$ s (c) $-1.47$ m, under water" } },

    { page: "Exam toolkit" },
    { ul: [
      "**Wrong unit**: models with $\\pi$ in the argument are in radians; those with $30t$ and a degree sign are in degrees.",
      "**Maximum time from the wrong equation**: set the *whole argument* of the sine/cosine equal to $\\frac{\\pi}{2}$ or $0$, including the $-\\alpha$.",
      "**\"Afternoon\"/\"first time\"/\"next\"**: add or subtract a period.",
      "**Minutes**: $0.23$ h is 14 min, not 23.",
      "**Interpretation** answers need units and context (\"below the water level\", \"mid-April\").",
      "**Modulus models**: $|\\sin|$ halves the period."
    ] },
    { callout: { t: "mnemonic", h: "\"Mean, amplitude, period, phase\"", body: "The four numbers of any wave model, in the order you read them off: middle line, half the range, cycle length, where it starts." } }
  ],
  flashcards: [
    ["Amplitude and mean of a wave with max 8.5 and min 3.5?", "Amplitude 2.5, mean 6."],
    ["Period of $\\sin\\left(\\frac{4\\pi t}{25}\\right)$?", "$\\frac{2\\pi}{4\\pi/25} = 12.5$."],
    ["Maximum of $5 + \\sqrt5\\sin(\\frac{\\pi t}{12} - 1.893)$ and when?", "$5 + \\sqrt5$; when $\\frac{\\pi t}{12} - 1.893 = \\frac{\\pi}{2}$, $t = 13.23$ h."],
    ["$H = |A\\sin(bt + \\alpha)|$: one revolution in 720 s gives $b = $?", "$\\frac14$ — the modulus halves the period, so $720b = 180$."],
    ["Model min at $t = 3.54$ months, observed mid-April: comment?", "The model's minimum matches the observation — it is supported."],
    ["Minimum of $3 + 2\\sqrt5\\cos(\\ldots)$ and meaning?", "$3 - 2\\sqrt5 = -1.47$: the paddle is 1.47 m below the water."],
    ["$140\\cos\\theta - 480\\sin\\theta$ in $K\\cos(\\theta + \\alpha)$ form?", "$500\\cos(\\theta + 73.74°)$."]
  ],
  quiz: [
    { q: "Period of $\\cos(30t)°$ in $t$:", opts: ["12", "30", "360", "6"], ans: 0, why: "$360/30$." },
    { q: "Maximum of $6 + 2.5\\sin(\\ldots)$:", opts: ["8.5", "6", "2.5", "3.5"], ans: 0, why: "$6 + 2.5$." },
    { q: "$3 + 4\\cos t - 2\\sin t$ has minimum", opts: ["$3 - 2\\sqrt5$", "$3 - 6$", "$-3$", "$3 - \\sqrt5$"], ans: 0, why: "$R = \\sqrt{20}$." },
    { q: "13.23 hours after midnight is", opts: ["13:23", "13:14", "13:38", "13:02"], ans: 1, why: "$0.23 \\times 60 \\approx 14$." },
    { q: "A model's argument is $\\frac{\\pi t}{12} - 3$. The calculator must be in", opts: ["degrees", "radians", "gradians", "either"], ans: 1, why: "$\\pi$ present." }
  ]
};


/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
