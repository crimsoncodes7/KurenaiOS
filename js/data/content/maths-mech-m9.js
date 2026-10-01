/* Kurenai OS — deep content: Mechanics, section M9 (Moments) at full
   A-level depth. It REPLACES the outline entry the base file used to
   carry: every question shape Edexcel has set on moments in static
   contexts — beams on supports and tilting, non-uniform rods, rods held by
   strings and hinges, ladders and rods against walls, rails and pegs, in
   limiting equilibrium (9MA0 Paper 3 Section B, June 2018–2025, the Oct
   2020–21 series and the Specimen; moments are not in the AS) — is
   explained and then worked through with Edexcel M1/A1/B1 marks.
   Past-paper item banks stay in bank-maths-mech.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---- figure helpers (free diagrams in pixels, y downwards) ---- */
function rad(d) { return d * Math.PI / 180; }
function F(x, y, deg, len, label, o) {
  o = o || {};
  var ex = x + len * Math.cos(rad(deg)), ey = y - len * Math.sin(rad(deg));
  var out = [{ vec: [[x, y], [ex, ey]], c: o.c || "accent2", w: o.w || 2.2 }];
  if (label) out.push({ text: [x + (len + 14) * Math.cos(rad(deg)) + (o.dx || 0), y - (len + 14) * Math.sin(rad(deg)) + (o.dy || 0)], t: label, b: true, size: o.size || 12.5, c: o.lc || o.c || "accent2" });
  return out;
}
/* a point d pixels along a rod from (x0, y0) at deg above the horizontal */
function on(x0, y0, deg, d) { return [x0 + d * Math.cos(rad(deg)), y0 - d * Math.sin(rad(deg))]; }

/* =====================================================================
   M9.1  Moments
   ===================================================================== */
C["maths:M9.1"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Moments — the whole topic on one page" },
    "Spec 9.1: understand and use **moments** in simple static contexts — equilibrium of rigid bodies; problems with parallel and non-parallel coplanar forces, e.g. ladder problems.",
    "A-level only, and on every A-level paper — usually 9–14 marks, often the last Mechanics question:",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Rod against a smooth wall on rough ground: show a reaction, find $\\mu$", "5–13", "Oct 2021 Q3, 2023 Q6, 2025 Q6"],
      ["Rod against a smooth rail or peg: the perpendicular reaction", "9–10", "Oct 2020 Q4, 2024 Q6"],
      ["Rod held by a string perpendicular to it, with a particle attached", "11", "2022 Q4"],
      ["Plank or beam held horizontal by a rope to a wall; force at the hinge/wall", "13–14", "Specimen Q4, 2018 Q9"],
      ["Direction of a force at a hinge or rough contact: $\\tan\\beta = \\frac{Y}{X}$", "5–6", "Specimen Q4(b), 2018 Q9(c)"],
      ["A rope that breaks above a tension → a range of positions", "3", "2018 Q9(d)"],
      ["Which way does friction act, and why?", "1", "2022 Q4(a), 2023 Q6(a)"],
      ["Refined model: non-uniform rod, rough wall, heavy rope — what changes?", "1–2", "Specimen Q4(c), 2023 Q6(e), 2025 Q6(c)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**The moment of a force**.",
      "**Equilibrium of a rigid body** — beams, supports, tilting, non-uniform rods.",
      "**Rods held by strings and hinges**.",
      "**Ladders: walls, rails and pegs**.",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "The moment of a force" },
    { callout: { t: "def", h: "Moment", body: [
      "The moment of a force about a point $P$ is its turning effect: **force × perpendicular distance** from $P$ to the line of action of the force. Unit: **N m**. Each moment is clockwise or anticlockwise.",
      "A force whose line of action passes through $P$ has **zero** moment about $P$."
    ] } },
    { fig: { w: 520, h: 230, items: [].concat(
      [{ line: [[80, 190], [400, 190]], c: "text2", w: 6 }, { poly: [[70, 190], [90, 190], [80, 212]], fill: "muted", alpha: 0.4, c: "text2", w: 1.2 }],
      [{ pt: [80, 190], label: "P", pos: "w", i: false, c: "text" }],
      F(400, 190, 150, 100, "F", { c: "accent" }),
      [{ arc: [400, 190, 34, 150, 180], label: "θ", c: "accent3", loff: 12 }],
      [{ line: [[313.4, 140], [140, 40]], c: "muted", dash: true },
        { line: [[80, 190], [160, 51.4]], c: "accent2", dash: true },
        { rangle: [[160, 51.4], [80, 190], [313.4, 140]], c: "accent2" },
        { text: [94, 110], t: "d = r sin θ", c: "accent2", b: true, size: 12 }, { text: [240, 208], t: "r", i: true, c: "text2" }]
    ), cap: "Moment of $F$ about $P$ = $F \\times d$, where $d = r\\sin\\theta$ is the perpendicular distance to the line of action — equivalently, $(F\\sin\\theta) \\times r$ using the component perpendicular to the rod." } },
    { worked: { tag: "variation", title: "A force at an angle to a rod", q: "A light rod $AB$ of length 2 m is hinged at $A$. A force of 30 N acts at $B$ at 40° to the rod. Find the moment of the force about $A$.",
      steps: [
        { h: "Component perpendicular to the rod", m: "$30\\sin40° = 19.28$ N at a distance 2 m" },
        { m: "moment $= 19.28 \\times 2 = 38.6$ N m", n: "The component along the rod passes through $A$ and has no moment." }
      ], result: "38.6 N m" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Equilibrium of a rigid body" },
    { callout: { t: "memorise", h: "Two conditions", body: [
      "1. **Resultant force zero**: resolve in two perpendicular directions.",
      "2. **Total moment zero about any point**: clockwise moments = anticlockwise moments.",
      "Take moments about the point where the most unknown forces act — they drop out. You may replace a resolving equation by a second moments equation."
    ] } },
    { kv: [
      ["Uniform rod", "its weight acts at its midpoint"],
      ["Non-uniform rod", "its weight acts at its centre of mass $G$, which may be unknown — call it $x$ from one end"],
      ["Particle on a rod", "its weight acts at its own point"],
      ["On the point of tilting about a support", "the reaction at the **other** support is zero"],
      ["Smooth wall, rail or peg", "the reaction is perpendicular to the wall (or to the rod, for a rail or peg)"],
      ["Rough ground", "a normal reaction $R$ and a friction $F \\le \\mu R$; limiting means $F = \\mu R$"],
      ["Hinge", "a force of unknown size and direction: use components $X$ and $Y$"]
    ] },
    { fig: { w: 520, h: 200, items: [].concat(
      [{ line: [[40, 100], [480, 100]], c: "text2", w: 7 }],
      [{ poly: [[100, 104], [116, 104], [108, 126]], fill: "muted", alpha: 0.5, c: "text2", w: 1.2 }, { poly: [[312, 104], [328, 104], [320, 126]], fill: "muted", alpha: 0.5, c: "text2", w: 1.2 }],
      F(108, 96, 90, 50, "R(C)", { c: "accent" }), F(320, 96, 90, 50, "R(D)", { c: "accent" }),
      F(260, 104, 270, 60, "40g", { c: "accent2" }), F(392, 104, 270, 50, "30g", { c: "accent2" }),
      [{ text: [40, 130], t: "A", b: true, c: "text" }, { text: [480, 130], t: "B", b: true, c: "text" }, { text: [108, 150], t: "C (1 m)", size: 11, c: "text2" }, { text: [320, 150], t: "D (4 m)", size: 11, c: "text2" }, { text: [392, 180], t: "child at 4.5 m", size: 11, c: "accent2" }]
    ), cap: "A uniform 6 m beam on two supports: moments about $C$ remove $R_C$." } },
    { worked: { tag: "variation", title: "A beam on two supports; then on the point of tilting", q: "A uniform beam $AB$, 6 m long and of mass 40 kg, rests horizontally on supports at $C$ and $D$, where $AC = 1$ m and $DB = 2$ m. A child of mass 30 kg stands on the beam 4.5 m from $A$. (a) Find the reactions at the supports. (b) The child walks towards $B$. How far from $A$ is the child when the beam is on the point of tilting?",
      steps: [
        { h: "(a) Moments about $C$", m: "$R_D \\times 3 = 40g \\times 2 + 30g \\times 3.5 = 185g \\Rightarrow R_D = 604$ N" },
        { h: "Resolve vertically", m: "$R_C = 70g - 604 = 81.7$ N" },
        { h: "(b) About to tilt about $D$: $R_C = 0$", m: "Moments about $D$: $40g \\times 1 = 30g \\times (x - 4)$" },
        { m: "$x - 4 = \\dfrac43 \\Rightarrow x = 5.33$ m from $A$", n: "Beyond this the beam turns about $D$." }
      ], result: "(a) 81.7 N, 604 N (b) 5.33 m" } },
    { worked: { tag: "variation", title: "A non-uniform rod: find the centre of mass", q: "A non-uniform rod $AB$, 4 m long and of mass 12 kg, rests horizontally on supports at $A$ and $B$. The reaction at $B$ is twice the reaction at $A$. Find the distance of the centre of mass from $A$.",
      steps: [
        { h: "Resolve", m: "$R + 2R = 12g \\Rightarrow R = 4g$, $\\; R_B = 8g$" },
        { h: "Moments about $A$", m: "$8g \\times 4 = 12g \\times x \\Rightarrow x = \\dfrac83$ m" }
      ], result: "2.67 m from $A$" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Rods held by strings and hinges" },
    { worked: { tag: "exam", title: "A beam hinged to a wall, held by a rope: tension and the hinge force", src: "A-level Specimen · P3 Q4 · 14 marks",
      q: "A beam $AB$ of mass 20 kg and length 3 m is smoothly hinged to a vertical wall at $A$ and held in equilibrium horizontally by a rope of length 1 m, fixed to a point $C$ on the wall vertically above $A$ and to a point $D$ on the beam, with angle $ACD = 30°$. The beam is a uniform rod and the rope a light inextensible string. Find **(a)** the tension in the rope, **(b)** the direction of the force exerted by the wall on the beam at $A$. **(c)** If the rope were not modelled as light, state how this would affect the tension, explaining carefully. The rope is replaced by a longer one from $C$ to the midpoint $G$ of $AB$; the beam stays horizontal. **(d)** Show that the force on the beam at $A$ now acts horizontally.",
      steps: [
        { h: "(a) Geometry", m: "$AD = 1 \\times \\sin30° = 0.5$ m; the rope makes 60° with the beam" },
        { h: "Moments about $A$", m: "$T\\sin60° \\times 0.5 = 20g \\times 1.5$", mk: "M1 A1 A1" },
        { m: "$T = 679$ N (or 680)", mk: "A1" },
        { h: "(b) Resolve horizontally", m: "$X = T\\cos60° = 339.5$ (away from the wall)", mk: "M1 A1" },
        { h: "Resolve vertically", m: "$Y + T\\sin60° = 20g \\Rightarrow Y = 196 - 588 = -392$, i.e. 392 N downwards", mk: "M1 A1" },
        { m: "$\\tan\\theta = \\dfrac{392}{339.5} \\Rightarrow \\theta = 49°$ below the horizontal, away from the wall", mk: "M1 A1", n: "$g$ cancels, so any sensible accuracy." },
        { h: "(c)", m: "The tension would **increase** from $D$ up to $C$,", mk: "B1" },
        { m: "since each point of the rope also has to support the weight of the rope below it.", mk: "B1" },
        { h: "(d) Moments about $G$", m: "the weight and the tension both act at $G$, so $Y \\times 1.5 = 0$", mk: "M1" },
        { m: "$Y = 0$: the force at $A$ is horizontal.", mk: "A1*" }
      ], result: "(a) 679 N (b) 49° below the horizontal, away from the wall" } },
    { fig: { w: 520, h: 230, items: [].concat(
      [{ line: [[60, 20], [60, 220]], c: "text2", w: 4 }, { line: [[60, 170], [440, 170]], c: "text2", w: 6 }, { line: [[60, 66], [140, 170]], c: "text2", w: 1.6 }],
      [{ text: [46, 66], t: "C", b: true, c: "text" }, { text: [46, 176], t: "A", b: true, c: "text" }, { text: [140, 192], t: "D", b: true, c: "text" }, { text: [448, 176], t: "B", b: true, c: "text" }, { arc: [60, 66, 30, 270, 307], label: "30°", c: "accent3", loff: 14 }],
      F(140, 170, 127, 70, "T", { c: "accent" }),
      F(250, 170, 270, 46, "20g", { c: "accent2", dx: 16 }),
      F(60, 170, 0, 50, "X", { c: "accent3", dy: -10 }),
      F(60, 170, 270, 40, "Y", { c: "accent3", dx: -12 })
    ), cap: "A-level Specimen: about $A$ the hinge force vanishes; then resolving finds $X$ and $Y$." } },
    { worked: { tag: "exam", title: "A plank against a rough wall: tension, position, direction, a breaking rope", src: "A-level June 2018 · P3 Q9 · 13 marks",
      q: "A plank $AB$ of mass $M$ and length $2a$ rests with $A$ against a rough vertical wall, held horizontal by a rope from $B$ to a point $C$ on the wall vertically above $A$. A block of mass $3M$ is on the plank at $P$, where $AP = x$. The plank is in equilibrium in a vertical plane perpendicular to the wall, and the rope makes an angle $\\alpha$ with the plank, where $\\tan\\alpha = \\frac34$. The plank is a uniform rod, the block a particle, the rope light and inextensible. **(a)** Show that the tension is $\\dfrac{5Mg(3x + a)}{6a}$. The horizontal component of the force on the plank at $A$ is $2Mg$. **(b)** Find $x$ in terms of $a$. The force at $A$ makes an angle $\\beta$ with the horizontal. **(c)** Find $\\tan\\beta$. The rope breaks if the tension exceeds $5Mg$. **(d)** Explain how this restricts the possible positions of $P$, justifying carefully.",
      steps: [
        { h: "(a) Moments about $A$", m: "$T\\sin\\alpha \\times 2a = Mg \\times a + 3Mg \\times x$", mk: "M1 A1" },
        { m: "$\\tfrac35 T \\times 2a = Mg(a + 3x) \\Rightarrow T = \\dfrac{5Mg(3x + a)}{6a}$", mk: "A1*" },
        { h: "(b) Horizontal", m: "$T\\cos\\alpha = 2Mg \\Rightarrow T = \\dfrac{5Mg}{2}$; $\\; \\dfrac{5Mg(3x + a)}{6a} = \\dfrac{5Mg}{2}$", mk: "M1" },
        { m: "$x = \\dfrac{2a}{3}$", mk: "A1" },
        { h: "(c) Vertical", m: "$Y + T\\sin\\alpha = 4Mg$", mk: "M1 A1" },
        { m: "$Y = 4Mg - \\tfrac35 \\cdot \\tfrac52 Mg = \\tfrac52 Mg$", mk: "A1" },
        { m: "$\\tan\\beta = \\dfrac{Y}{X} = \\dfrac{5/2}{2} = \\dfrac54$", mk: "M1 A1" },
        { h: "(d)", m: "$T \\le 5Mg$: $\\; \\dfrac{5Mg(3x + a)}{6a} \\le 5Mg$", mk: "M1" },
        { m: "$3x + a \\le 6a \\Rightarrow x \\le \\dfrac{5a}{3}$", mk: "A1" },
        { m: "So $P$ must be no further than $\\frac{5a}{3}$ from $A$ — the block cannot be placed within $\\frac a3$ of $B$. ($T$ increases as $x$ increases.)", mk: "A1" }
      ], result: "(b) $\\frac{2a}{3}$ (c) $\\frac54$ (d) $AP \\le \\frac{5a}{3}$" } },
    { worked: { tag: "exam", title: "A string perpendicular to the rod; a particle on it", src: "A-level June 2022 · P3 Q4 · 11 marks",
      q: "A uniform rod $AB$ has mass $M$ and length $2a$. A particle of mass $2M$ is attached at $C$, where $AC = 1.5a$. The rod rests with $A$ on rough horizontal ground, held at an angle $\\theta$ to the ground by a light string attached at $B$ and perpendicular to the rod (the rod rising from $A$ to the right, the string pulling up and to the left). **(a)** Explain why the friction on the rod at $A$ acts horizontally to the right. The tension in the string is $T$. **(b)** Show that $T = 2Mg\\cos\\theta$. Given that $\\cos\\theta = \\frac35$, **(c)** show that the vertical force exerted by the ground on the rod at $A$ is $\\frac{57Mg}{25}$. The coefficient of friction is $\\mu$ and the rod is in limiting equilibrium. **(d)** Show that $\\mu = \\frac{8}{19}$.",
      steps: [
        { h: "(a)", m: "The tension has a horizontal component to the left, and friction is the only other horizontal force, so it must act to the right.", mk: "B1" },
        { h: "(b) Moments about $A$", m: "$T \\times 2a = Mg \\times a\\cos\\theta + 2Mg \\times 1.5a\\cos\\theta$", mk: "M1 A1" },
        { m: "$T = 2Mg\\cos\\theta$", mk: "A1*" },
        { h: "(c) Vertical; the string's vertical part is $T\\cos\\theta$", m: "$R + T\\cos\\theta = 3Mg$", mk: "M1 A1" },
        { m: "$R = 3Mg - 2Mg \\cdot \\tfrac{9}{25} = \\dfrac{57Mg}{25}$", mk: "A1*" },
        { h: "(d) Horizontal", m: "$F = T\\sin\\theta = 2Mg \\cdot \\tfrac35 \\cdot \\tfrac45 = \\dfrac{24Mg}{25}$", mk: "M1 A1" },
        { h: "Limiting: $F = \\mu R$", m: "$\\dfrac{24Mg}{25} = \\mu \\cdot \\dfrac{57Mg}{25}$", mk: "M1" },
        { m: "$\\mu = \\dfrac{24}{57} = \\dfrac{8}{19}$", mk: "A1*" }
      ], result: "$\\mu = \\frac{8}{19}$" } },

    /* ---------------------------------------------------------------- Page 4 */
    { page: "Ladders: walls, rails and pegs" },
    { callout: { t: "memorise", h: "The ladder routine", body: [
      "Forces: weight(s) down; at the ground $R$ up and friction $F$ along the ground; at a **smooth wall** a horizontal $S$; at a **smooth rail or peg** an $S$ perpendicular to the rod.",
      "**Moments about the foot $A$** remove $R$ and $F$ and give $S$.",
      "Resolve: horizontally for $F$, vertically for $R$. Limiting: $F = \\mu R$.",
      "Friction at the foot points **towards** the wall (the foot tends to slide away)."
    ] } },
    { fig: { w: 460, h: 260, items: (function () {
      var A = [110, 230], d = 53.13, L = 250, B = on(A[0], A[1], d, L), G = on(A[0], A[1], d, L / 2);
      var it = [{ line: [[40, 230], [420, 230]], c: "text2", w: 2 }, { line: [[B[0], 20], [B[0], 230]], c: "text2", w: 3 }, { line: [A, B], c: "text2", w: 6 }];
      it.push({ arc: [A[0], A[1], 34, 0, d], label: "θ", c: "accent3" });
      it = it.concat(F(A[0], A[1], 90, 60, "R", { c: "accent" }), F(A[0], A[1], 0, 60, "F", { c: "accent3", dy: -10 }), F(B[0], B[1], 180, 60, "S", { c: "accent" }), F(G[0], G[1], 270, 60, "Mg", { c: "accent2", dx: 16 }));
      it.push({ text: [A[0] - 14, A[1] + 12], t: "A", b: true, c: "text" }, { text: [B[0] + 14, B[1]], t: "B", b: true, c: "text" });
      return it;
    })(), cap: "A uniform rod against a smooth wall on rough ground: four forces, three equations." } },
    { worked: { tag: "exam", title: "Show $\\mu \\ge \\frac12\\cot\\theta$; then a horizontal push at the foot", src: "A-level Oct 2021 · P3 Q3 · 10 marks",
      q: "A beam $AB$ of mass $m$ and length $2a$ rests in equilibrium with $A$ on rough horizontal ground and $B$ against a smooth vertical wall, inclined at $\\theta$ to the horizontal. The coefficient of friction between the beam and the ground is $\\mu$. The beam is a uniform rod in a vertical plane perpendicular to the wall. **(a)** Show that $\\mu \\ge \\frac12\\cot\\theta$. A horizontal force of magnitude $kmg$ is now applied to the beam at $A$, perpendicular to the wall and towards it. Given that $\\tan\\theta = \\frac54$, $\\mu = \\frac12$ and the beam is now in limiting equilibrium, **(b)** find $k$.",
      steps: [
        { h: "(a) Moments about $A$", m: "$S \\times 2a\\sin\\theta = mg \\times a\\cos\\theta \\Rightarrow S = \\tfrac12 mg\\cot\\theta$", mk: "M1 A1" },
        { h: "Resolve", m: "$F = S$, $\\; R = mg$", mk: "B1" },
        { h: "$F \\le \\mu R$", m: "$\\tfrac12 mg\\cot\\theta \\le \\mu mg$", mk: "DM1" },
        { m: "$\\mu \\ge \\tfrac12\\cot\\theta$", mk: "A1*" },
        { h: "(b) $S$ is unchanged (the push acts at $A$)", m: "$S = \\tfrac12 mg \\cdot \\tfrac45 = \\tfrac25 mg$", mk: "M1 A1" },
        { h: "The push drives $A$ towards the wall, so friction now acts away from it", m: "$kmg = S + \\mu R = \\tfrac25 mg + \\tfrac12 mg$", mk: "B1 DM1" },
        { m: "$k = \\dfrac{9}{10}$", mk: "A1" }
      ], result: "(b) $k = \\frac{9}{10}$" } },
    { worked: { tag: "exam", title: "Smooth wall: $S$ by moments; $\\mu$; the resultant at $A$; a non-uniform rod", src: "A-level June 2023 · P3 Q6 · 13 marks",
      q: "A rod $AB$ of mass $M$ and length $2a$ has $A$ on rough horizontal ground and $B$ against a smooth vertical wall, making an angle $\\theta$ with the ground, at rest in limiting equilibrium. **(a)** State the direction (towards or away from the wall) of the friction on the rod at $A$, with a reason. The normal reaction of the wall at $B$ is $S$. In an initial model the rod is uniform. **(b)** By taking moments about $A$, show that $S = \\frac12 Mg\\cot\\theta$. The coefficient of friction is $\\mu$ and $\\tan\\theta = \\frac34$. **(c)** Find $\\mu$. **(d)** Find, in terms of $M$ and $g$, the magnitude of the resultant force on the rod at $A$. In a new model the rod is non-uniform, with its centre of mass closer to $B$ than to $A$; $\\tan\\theta = \\frac34$ still. **(e)** State whether the new $S$ is larger, smaller or equal, with a reason.",
      steps: [
        { h: "(a)", m: "Towards the wall: $S$ pushes the rod away from the wall, so the foot tends to slide away and friction opposes it.", mk: "B1" },
        { h: "(b) Moments about $A$", m: "$S \\times 2a\\sin\\theta = Mg \\times a\\cos\\theta$", mk: "M1 A1" },
        { m: "$S = \\tfrac12 Mg\\cot\\theta$", mk: "A1*" },
        { h: "(c)", m: "$S = \\tfrac12 Mg \\cdot \\tfrac43 = \\tfrac23 Mg$; $\\; F = S$, $\\; R = Mg$", mk: "M1 A1 M1" },
        { h: "Limiting", m: "$\\tfrac23 Mg = \\mu Mg$", mk: "M1" },
        { m: "$\\mu = \\tfrac23$", mk: "A1" },
        { h: "(d)", m: "$\\sqrt{R^2 + F^2} = Mg\\sqrt{1 + \\tfrac49}$", mk: "M1 A1" },
        { m: "$= \\dfrac{\\sqrt{13}}{3}Mg = 1.20Mg$", mk: "A1" },
        { h: "(e)", m: "**Larger**: the weight now acts further from $A$, so its moment about $A$, and the $S$ needed to balance it, increase.", mk: "B1" }
      ], result: "(c) $\\frac23$ (d) $\\frac{\\sqrt{13}}{3}Mg$ (e) larger" } },
    { worked: { tag: "exam", title: "Against a smooth rail: show $S = \\frac{9}{25}Mg$; find $\\mu$", src: "A-level Oct 2020 · P3 Q4 · 10 marks",
      q: "A ladder $AB$ has mass $M$ and length $6a$. Its end $A$ is on rough horizontal ground and it rests against a fixed smooth horizontal rail at $C$, at a vertical height $4a$ above the ground. The vertical plane containing $AB$ is perpendicular to the rail. The ladder is inclined at $\\alpha$ to the horizontal, where $\\sin\\alpha = \\frac45$. The coefficient of friction is $\\mu$ and the ladder is in limiting equilibrium. Modelling it as a uniform rod, **(a)** show that the force exerted by the rail at $C$ has magnitude $\\frac{9Mg}{25}$, **(b)** find $\\mu$.",
      steps: [
        { h: "(a) Distance $AC$", m: "$AC = \\dfrac{4a}{\\sin\\alpha} = 5a$", mk: "B1" },
        { h: "Moments about $A$ ($S$ is perpendicular to the ladder)", m: "$S \\times 5a = Mg \\times 3a\\cos\\alpha = Mg \\times 3a \\times \\tfrac35$", mk: "M1" },
        { m: "$S = \\dfrac{9Mg}{25}$", mk: "A1*" },
        { h: "(b) Resolve horizontally", m: "$F = S\\sin\\alpha = \\dfrac{9Mg}{25} \\cdot \\dfrac45 = \\dfrac{36Mg}{125}$", mk: "M1 A1" },
        { h: "Resolve vertically", m: "$R + S\\cos\\alpha = Mg \\Rightarrow R = Mg - \\dfrac{27Mg}{125} = \\dfrac{98Mg}{125}$", mk: "M1 A1" },
        { h: "Limiting", m: "$\\dfrac{36Mg}{125} = \\mu \\cdot \\dfrac{98Mg}{125}$", mk: "M1" },
        { m: "$\\mu = \\dfrac{36}{98} = \\dfrac{18}{49}$", mk: "A1 A1", n: "Unlike a wall, the rail's reaction has a vertical part, so $R \\ne Mg$." }
      ], result: "(b) $\\mu = \\frac{18}{49}$" } },
    { worked: { tag: "exam", title: "Resting on a smooth peg: $S$, then $\\mu$", src: "A-level June 2024 · P3 Q6 · 9 marks",
      q: "A uniform rod $AB$ of mass $M$ and length $2a$ has $A$ on rough horizontal ground and rests in equilibrium against a small smooth fixed horizontal peg $P$, touching it at $C$, where $AC = 1.5a$. The rod is at an angle $\\theta$ to the ground, where $\\tan\\theta = \\frac43$, in a vertical plane perpendicular to the peg. The normal reaction of the peg is $S$. **(a)** Show that $S = \\frac25 Mg$. The coefficient of friction is $\\mu$ and the rod is in limiting equilibrium. **(b)** Find $\\mu$.",
      steps: [
        { h: "(a) Moments about $A$", m: "$S \\times 1.5a = Mg \\times a\\cos\\theta = Mg \\times a \\times \\tfrac35$", mk: "M1 A1" },
        { m: "$S = \\dfrac25 Mg$", mk: "A1*" },
        { h: "(b) $S$ is perpendicular to the rod: resolve", m: "horizontally $F = S\\sin\\theta = \\tfrac25 \\cdot \\tfrac45 Mg = \\dfrac{8Mg}{25}$", mk: "M1 A1" },
        { m: "vertically $R + S\\cos\\theta = Mg \\Rightarrow R = Mg - \\dfrac{6Mg}{25} = \\dfrac{19Mg}{25}$", mk: "M1 A1" },
        { h: "Limiting", m: "$\\dfrac{8Mg}{25} = \\mu \\cdot \\dfrac{19Mg}{25}$", mk: "M1" },
        { m: "$\\mu = \\dfrac{8}{19}$", mk: "A1" }
      ], result: "(b) $\\mu = \\frac{8}{19}$" } },
    { fig: { w: 460, h: 240, items: (function () {
      var A = [70, 210], d = 53.13, L = 270, Cp = on(A[0], A[1], d, L * 0.75), G = on(A[0], A[1], d, L / 2), B = on(A[0], A[1], d, L);
      var it = [{ line: [[30, 210], [420, 210]], c: "text2", w: 2 }, { line: [A, B], c: "text2", w: 6 }, { circle: [Cp[0] + 10, Cp[1] + 8, 6], c: "text2", w: 1.6 }];
      it.push({ arc: [A[0], A[1], 34, 0, d], label: "θ", c: "accent3" });
      it = it.concat(F(Cp[0], Cp[1], 90 + d, 60, "S", { c: "accent" }), F(A[0], A[1], 90, 56, "R", { c: "accent" }), F(A[0], A[1], 0, 56, "F", { c: "accent3", dy: -10 }), F(G[0], G[1], 270, 56, "Mg", { c: "accent2", dx: 16 }));
      it.push({ text: [A[0] - 12, A[1] + 12], t: "A", b: true, c: "text" }, { text: [Cp[0] + 24, Cp[1] + 14], t: "P", b: true, c: "text" });
      return it;
    })(), cap: "A-level June 2024: the peg pushes perpendicular to the rod, so its reaction has a vertical part — $R = Mg - S\\cos\\theta$." } },
    { worked: { tag: "exam", title: "A particle on a rod against a wall; a rough wall; a heavier load at the top", src: "A-level June 2025 · P3 Q6 · 11 marks",
      q: "A uniform rod $AB$ of mass $M$ and length $2a$ has a particle of mass $2M$ attached at $C$, where $AC = 0.5a$. The rod rests with $A$ on rough horizontal ground and $B$ against a vertical wall, in a vertical plane perpendicular to the wall, at an angle $\\alpha$ **to the wall**. In an initial model the wall is smooth, the normal reaction of the ground at $A$ is $R$ and the force from the wall at $B$ is $S$. **(a)** Find $R$ in terms of $M$ and $g$. **(b)** Show that $S = Mg\\tan\\alpha$. In a refined model the wall is rough, and the normal reaction at $A$ is $R_1$. **(c)** State which is greater, $R$ or $R_1$, with a reason. A second particle of mass $3M$ is attached at $B$; the rod (smooth wall again) is now in limiting equilibrium at an angle $\\beta$ to the wall, where $\\tan\\beta = \\frac12$; the coefficient of friction at the ground is $\\mu$. **(d)** Show that $\\mu = \\frac13$.",
      steps: [
        { h: "(a) Smooth wall: no vertical force at $B$", m: "$R = 3Mg$", mk: "B1" },
        { h: "(b) Moments about $A$ (angle with the wall, so horizontal distances use $\\sin\\alpha$)", m: "$S \\times 2a\\cos\\alpha = Mg \\times a\\sin\\alpha + 2Mg \\times 0.5a\\sin\\alpha$", mk: "M1 A1" },
        { m: "$S \\times 2a\\cos\\alpha = 2Mga\\sin\\alpha \\Rightarrow S = Mg\\tan\\alpha$", mk: "A1*" },
        { h: "(c)", m: "$R$ is greater: on a rough wall friction at $B$ acts upwards and supports part of the weight, so $R_1 < R$.", mk: "B1" },
        { h: "(d) Now $R = 6Mg$; moments about $A$", m: "$S \\times 2a\\cos\\beta = Mg \\cdot a\\sin\\beta + 2Mg \\cdot 0.5a\\sin\\beta + 3Mg \\cdot 2a\\sin\\beta$", mk: "M1 A1" },
        { m: "$S = 4Mg\\tan\\beta = 2Mg$", mk: "A1" },
        { h: "Horizontal: $F = S$; limiting", m: "$2Mg = \\mu \\times 6Mg$", mk: "M1 M1" },
        { m: "$\\mu = \\dfrac13$", mk: "A1*" }
      ], result: "(a) $3Mg$ (c) $R$ (d) $\\frac13$" } },

    /* ---------------------------------------------------------------- Exam toolkit */
    { page: "Exam toolkit" },
    { callout: { t: "memorise", h: "Every moments question", body: [
      "Draw every force where it acts: weights at centres of mass, reactions perpendicular to smooth contacts, friction along rough ground, $X$ and $Y$ at a hinge.",
      "Take moments about the point with the most unknowns. Then resolve twice.",
      "Moment = force × **perpendicular** distance: for a rod at $\\theta$ to the horizontal, a vertical force at distance $d$ along it has arm $d\\cos\\theta$; a horizontal force has arm $d\\sin\\theta$.",
      "Limiting: $F = \\mu R$. Direction of a contact force: $\\tan\\beta = \\frac{\\text{vertical}}{\\text{horizontal}}$."
    ] } },
    { callout: { t: "mnemonic", h: "\"Draw, pivot, resolve, limit\"", body: "**Draw** all forces; take moments about the **pivot** with most unknowns; **resolve** both ways; use the **limit** $F = \\mu R$." } },
    { callout: { t: "warn", h: "Common losses", body: [
      "Using the distance along the rod instead of the perpendicular distance.",
      "Angle given to the **wall**, not the ground — the sines and cosines swap.",
      "Forgetting a rail or peg reaction has a vertical component, so $R \\ne$ total weight.",
      "Weight of a uniform rod not at its midpoint, or a particle's weight forgotten.",
      "Friction drawn the wrong way at the foot."
    ] } }
  ],
  flashcards: [
    ["Moment of a force about a point?", "Force × perpendicular distance from the point to its line of action (N m)."],
    ["Conditions for equilibrium of a rigid body?", "Resultant force zero and total moment zero about any point."],
    ["Where does the weight of a uniform rod act?", "At its midpoint."],
    ["On the point of tilting about one support?", "The reaction at the other support is zero."],
    ["Reaction of a smooth wall on a ladder?", "Horizontal (perpendicular to the wall)."],
    ["Reaction of a smooth peg or rail on a rod?", "Perpendicular to the rod."],
    ["Best point to take moments about for a ladder on rough ground?", "The foot $A$ — it removes $R$ and $F$."],
    ["Uniform ladder, smooth wall, angle $\\theta$ to the ground: $S$?", "$\\frac12 W\\cot\\theta$."],
    ["Which way does friction act at the foot of a ladder against a smooth wall?", "Towards the wall."],
    ["Direction of a hinge force with components $X$, $Y$?", "$\\tan\\beta = Y / X$ to the horizontal."],
    ["Moment of 30 N at 40° to a 2 m rod about its end?", "$30 \\times 2\\sin40° = 38.6$ N m."]
  ],
  quiz: [
    { q: "A 20 N force acts 3 m from a pivot, perpendicular to the rod. Its moment is", opts: ["60 N m", "6.67 N m", "23 N m", "17 N m"], ans: 0, why: "$20 \\times 3$." },
    { q: "A uniform 4 m rod of weight 60 N is pivoted 1 m from its left end. The weight's moment about the pivot is", opts: ["60 N m", "120 N m", "240 N m", "0"], ans: 0, why: "The centre is 1 m from the pivot." },
    { q: "A beam is about to tilt about support $D$. Then", opts: ["the reaction at the other support is zero", "the reaction at $D$ is zero", "both reactions are equal", "friction is limiting"], ans: 0, why: "It is lifting off the other support." },
    { q: "A ladder rests against a smooth wall on rough ground. The wall's reaction is", opts: ["horizontal", "vertical", "along the ladder", "perpendicular to the ladder"], ans: 0, why: "Smooth wall: perpendicular to the wall." },
    { q: "For a uniform ladder at 60° to the ground against a smooth wall, $S = \\frac12 W\\cot60° =$", opts: ["$0.289W$", "$0.866W$", "$0.5W$", "$1.73W$"], ans: 0, why: "$\\cot60° = 0.577$." }
  ]
};

/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
