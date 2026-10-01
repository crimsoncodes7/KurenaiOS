/* Kurenai OS — deep content: Mechanics, section M8 (Forces and Newton's
   laws) at full A-level depth. Each topic here REPLACES the outline entry
   the base file used to carry: every question shape Edexcel has set on
   forces and Newton's first law, F = ma in scalar and vector form, weight
   and lifts, Newton's third law and connected particles, resultant forces
   and dynamics in a plane, and friction (9MA0 Paper 3 Section B, 8MA0
   Paper 2 Section B, June 2018–2025, the Oct/Nov 2020–21 series and the
   Specimens) is explained and then worked through with Edexcel M1/A1/B1
   marks. Past-paper item banks stay in bank-maths-mech.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---- figure helpers (free diagrams in pixels, y downwards) ---- */

function rad(d) { return d * Math.PI / 180; }
/* a force arrow from (x, y) in direction deg (anticlockwise from east,
   as on paper), length len, labelled just beyond its tip */
function F(x, y, deg, len, label, o) {
  o = o || {};
  var ex = x + len * Math.cos(rad(deg)), ey = y - len * Math.sin(rad(deg));
  var out = [{ vec: [[x, y], [ex, ey]], c: o.c || "accent2", w: o.w || 2.2 }];
  if (label) out.push({ text: [x + (len + (o.gap || 14)) * Math.cos(rad(deg)) + (o.dx || 0), y - (len + (o.gap || 14)) * Math.sin(rad(deg)) + (o.dy || 0)], t: label, b: true, size: o.size || 12.5, c: o.lc || o.c || "accent2" });
  return out;
}
/* a w × h block centred on (cx, cy), turned through deg */
function box(cx, cy, w, h, deg, o) {
  o = o || {};
  var c = Math.cos(rad(deg || 0)), s = Math.sin(rad(deg || 0));
  var pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(function (p) {
    return [cx + p[0] * c - p[1] * s, cy - (p[0] * s + p[1] * c)];
  });
  return { poly: pts, fill: o.fill || "accent", alpha: o.alpha != null ? o.alpha : 0.25, c: o.c || "accent", w: 1.6 };
}
/* a slope rising to the right from (x0, y0) over a horizontal base, at deg,
   with its angle marked */
function slope(x0, y0, base, deg, label) {
  var top = y0 - base * Math.tan(rad(deg));
  return [{ poly: [[x0, y0], [x0 + base, y0], [x0 + base, top]], fill: "muted", alpha: 0.12, c: "text2", w: 1.6 },
    { arc: [x0, y0, 34, 0, deg], label: label || "α", c: "accent3" }];
}
/* a point on that slope's surface, d pixels along it from (x0, y0) */
function along(x0, y0, deg, d, up) {
  return [x0 + d * Math.cos(rad(deg)) - (up || 0) * Math.sin(rad(deg)), y0 - d * Math.sin(rad(deg)) - (up || 0) * Math.cos(rad(deg))];
}
function ground(x1, x2, y) { return { line: [[x1, y], [x2, y]], c: "text2", w: 2 }; }

/* =====================================================================
   M8.1  Forces and Newton's first law
   ===================================================================== */
C["maths:M8.1"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Forces and Newton's first law — the whole topic on one page" },
    "Spec 8.1: understand the concept of a force; understand and use **Newton's first law**. Know normal reaction, tension, thrust or compression, and resistance.",
    "Every Mechanics question starts with a correct force diagram, and many give a mark for reading \"constant velocity\" or \"at rest\" as **zero resultant force**:",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Normal reaction when a force is applied at an angle", "1–3", "A-level 2025 Q2(a), 2018 Q7"],
      ["Moving at constant speed/velocity → forces balance", "1–3", "A-level 2025 Q2(a), AS 2025 Q2(c)"],
      ["Describe the motion after a force is removed", "1–2", "A-level 2025 Q2(b), Oct 2020 Q1(d)"],
      ["Explain why an object stays at rest / keeps moving", "1–2", "A-level Oct 2020 Q1(c)(d)"],
      ["Draw or use a force diagram: weight, reaction, tension, thrust, friction, resistance", "inside every question", "every paper"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**Forces** — what each one is and which way it acts.",
      "**Force diagrams** — how to draw one that earns marks.",
      "**Newton's first law** — zero resultant force, at rest or constant velocity.",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "Forces" },
    "A **force** is a push or a pull: a vector with a magnitude (in newtons) and a direction. It changes, or tends to change, the motion of whatever it acts on.",
    { table: { head: ["Force", "Acts", "Notes"], rows: [
      ["**Weight** $W = mg$", "vertically downwards, at the centre of mass", "the pull of gravity; mass is in kg, weight in N"],
      ["**Normal reaction** $R$", "perpendicular to the surface, away from it", "a contact force; it is NOT always $mg$ — it adjusts to stop the object sinking in"],
      ["**Tension** $T$", "along a string or rod, pulling away from the object", "a string can only pull; same throughout a light string over a smooth pulley"],
      ["**Thrust** (compression)", "along a rod, pushing towards the object", "only a rod can push (a towbar, a pole); a string cannot"],
      ["**Friction** $F$", "along the surface, against the (tendency to) motion", "$F \\le \\mu R$ on a rough surface (M8.6)"],
      ["**Resistance**", "against the motion", "air resistance, water resistance, \"resistance to motion\""],
      ["**Driving force**", "in the direction of motion", "from an engine; often $D$"]
    ] } },
    { fig: { w: 520, h: 200, items: [].concat(
      [ground(20, 500, 150), box(250, 128, 80, 44, 0)],
      F(290, 128, 0, 80, "tension T", { c: "accent", dx: 30 }),
      F(210, 128, 180, 70, "friction F", { c: "accent3", dx: -32 }),
      F(250, 106, 90, 60, "R", { c: "text2" }),
      F(250, 150, 270, 40, "W = mg", { c: "accent2", dx: 34, dy: -6 }),
      [{ text: [250, 128], t: "m", i: true, b: true, c: "text" }]
    ), cap: "A block pulled along a rough floor by a horizontal string: four forces, each drawn from the block in its own direction." } },
    { callout: { t: "miscon", h: "\"The normal reaction equals the weight\"", body: "Only when nothing else pushes or pulls vertically. Pull the block up at an angle and $R$ falls ($R + P\\sin\\alpha = mg$); push it down at an angle and $R$ grows. Always find $R$ by resolving perpendicular to the surface." } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Force diagrams" },
    { steps: [
      { h: "1. One object at a time", m: "Draw it as a dot or a box. For connected particles, one diagram per particle." },
      { h: "2. Weight first", m: "$mg$ straight down." },
      { h: "3. Every contact", m: "A surface gives $R$ (perpendicular) and, if rough, $F$ (along it); a string gives $T$ (away); a rod gives $T$ or a thrust." },
      { h: "4. Anything else named", m: "Applied forces at their given angles; resistance against the motion; driving force with it." },
      { h: "5. Show the acceleration separately", m: "A double-headed or separate arrow labelled $a$ — never as a force." }
    ] },
    { worked: { tag: "example", title: "The forces on a box pulled at an angle", q: "A box of mass 2 kg is dragged along a rough horizontal floor by a force of 5 N at an angle $\\alpha$ above the horizontal, where $\\sin\\alpha = \\frac35$. Draw the force diagram and write the resolved equations, without solving.",
      steps: [
        { h: "Forces", m: "Weight $2g$ down; normal reaction $R$ up; friction $F$ backwards; 5 N at $\\alpha$ above the horizontal." },
        { h: "Resolve the 5 N", m: "Horizontal $5\\cos\\alpha = 4$; vertical $5\\sin\\alpha = 3$." },
        { h: "Vertical (no vertical motion)", m: "$R + 3 = 2g$" },
        { h: "Horizontal", m: "$4 - F = 2a$" }
      ], result: "two equations, one per direction" } },
    { fig: { w: 520, h: 210, items: [].concat(
      [ground(20, 500, 160), box(250, 138, 80, 44, 0)],
      F(290, 128, 36.87, 110, "5 N", { c: "accent" }),
      [{ arc: [290, 128, 40, 0, 36.87], label: "α", c: "accent3" }],
      F(210, 138, 180, 70, "F", { c: "accent3" }),
      F(250, 116, 90, 60, "R", { c: "text2" }),
      F(250, 160, 270, 34, "2g", { c: "accent2", dx: 22, dy: -10 })
    ), cap: "A-level June 2025: the 5 N pull lifts the box a little, so $R = 2g - 3 = 16.6$ N, not $2g$." } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Newton's first law" },
    { callout: { t: "def", h: "Newton's first law", body: "A body stays **at rest** or moves with **constant velocity** (constant speed in a straight line) unless a resultant force acts on it. So: at rest or constant velocity ⇔ resultant force zero ⇔ the forces balance in every direction." } },
    { kv: [
      ["\"at rest\", \"in equilibrium\"", "resultant force $= \\mathbf 0$"],
      ["\"constant speed in a straight line\", \"constant velocity\"", "resultant force $= \\mathbf 0$ — it is still in equilibrium"],
      ["\"accelerating\", \"slowing down\", \"turning\"", "there is a resultant force (M8.2)"],
      ["\"limiting equilibrium\", \"on the point of sliding\"", "at rest, and friction is at its maximum $\\mu R$ (M8.6)"]
    ] },
    { worked: { tag: "variation", title: "Constant speed: the driving force", q: "A car of mass 900 kg moves along a straight horizontal road at a constant speed of 20 m s$^{-1}$. The resistance to its motion is 650 N. Find the driving force.",
      steps: [
        { h: "Constant velocity ⇒ resultant zero", m: "$D - 650 = 0 \\Rightarrow D = 650$ N", n: "The mass and the speed are not needed — a common distractor." }
      ], result: "650 N" } },
    { worked: { tag: "exam", title: "Dragged at constant speed; then the force is removed", src: "A-level June 2025 · P3 Q2(a)–(c) · 5 marks",
      q: "A small box $B$ of mass 2 kg is dragged in a straight line along a rough horizontal plane at a constant speed by a force of magnitude 5 N. The line of action of the force makes an angle $\\alpha$ with the plane, where $\\sin\\alpha = \\frac35$. **(a)** Show that the magnitude of the normal reaction of the plane on the box is 16.6 N. At the instant when $B$ is at the point $O$ on the plane, the force of magnitude 5 N is removed. **(b)** Describe the motion of the box after the force is removed. **(c)** Find the magnitude of the normal reaction of the plane on the box after the force is removed.",
      steps: [
        { h: "(a) Resolve vertically: no vertical acceleration", m: "$R + 5\\sin\\alpha = 2g$", mk: "M1 A1" },
        { m: "$R = 19.6 - 3 = 16.6$ N", mk: "A1*" },
        { h: "(b)", m: "The only horizontal force is now friction, against the motion: the box **decelerates** (uniformly) until it stops.", mk: "B1", n: "It does not stop at once and does not move backwards." },
        { h: "(c)", m: "$R = 2g = 19.6$ N", mk: "B1" }
      ], result: "(b) slows down to rest (c) 19.6 N" } },
    { worked: { tag: "exam", title: "Why a heavier brick stays put; a brick that keeps going", src: "A-level Oct 2020 · P3 Q1(c)(d) · 3 marks",
      q: "A rough plane is inclined at $\\alpha$ to the horizontal, where $\\tan\\alpha = \\frac34$. A brick $P$ is in equilibrium on the plane, on the point of sliding down, and it has been shown that the coefficient of friction $\\mu = \\frac34$. $P$ is removed and a much heavier brick $Q$, with the same coefficient of friction, is placed on the plane. **(c)** Explain briefly why $Q$ will remain at rest. $Q$ is now projected with speed 0.5 m s$^{-1}$ down a line of greatest slope. Modelling $Q$ as a particle, **(d)** describe the motion of $Q$, giving a reason.",
      steps: [
        { h: "(c)", m: "The weight component down the slope, $mg\\sin\\alpha$, and the greatest friction, $\\mu mg\\cos\\alpha$, are both proportional to $m$ — the mass cancels, and $\\tan\\alpha = \\mu$ still holds, so $Q$ is in limiting equilibrium and stays at rest.", mk: "B1" },
        { h: "(d)", m: "$Q$ moves down the plane at a **constant speed** of 0.5 m s$^{-1}$,", mk: "B1" },
        { m: "because friction ($= \\mu R$ while sliding) exactly balances $mg\\sin\\alpha$: the resultant force is zero (Newton's first law).", mk: "B1" }
      ], result: "(d) constant speed 0.5 m s$^{-1}$ down the plane" } },

    /* ---------------------------------------------------------------- Exam toolkit */
    { page: "Exam toolkit" },
    { callout: { t: "memorise", h: "Read the words", body: [
      "At rest, in equilibrium, constant speed, constant velocity → **resultant force zero**: resolve and set each direction to zero.",
      "Strings pull (tension); rods pull or push (tension or thrust); surfaces push (reaction) and, if rough, rub (friction).",
      "$R$ comes from resolving perpendicular to the surface — never assume $R = mg$."
    ] } },
    { callout: { t: "mnemonic", h: "\"Weight, contacts, others\"", body: "Draw the weight; then every contact (reaction, friction, tension, thrust); then every other named force. Acceleration goes beside the diagram, not on it." } },
    { callout: { t: "warn", h: "Common losses", body: [
      "Drawing the acceleration, or $ma$, as a force.",
      "Taking $R = mg$ when a force acts at an angle.",
      "Saying an object stops instantly when a force is removed.",
      "Giving a string a thrust."
    ] } }
  ],
  flashcards: [
    ["Newton's first law?", "A body stays at rest or moves with constant velocity unless a resultant force acts on it."],
    ["Constant velocity means the resultant force is …?", "Zero."],
    ["Direction of the normal reaction?", "Perpendicular to the surface, away from it."],
    ["What can a rod do that a string cannot?", "Push — exert a thrust (compression)."],
    ["Weight of a 5 kg mass ($g = 9.8$)?", "49 N."],
    ["A force $P$ pulls at $\\alpha$ above the horizontal on a mass $m$ on a floor. $R$?", "$R = mg - P\\sin\\alpha$."],
    ["Car at constant speed, resistance 400 N. Driving force?", "400 N."],
    ["What does \"in equilibrium\" mean?", "The resultant force is zero (at rest or constant velocity)."],
    ["Is acceleration a force?", "No — draw it separately from the force diagram."]
  ],
  quiz: [
    { q: "A particle moves at constant velocity. The resultant force on it is", opts: ["zero", "in the direction of motion", "against the motion", "equal to its weight"], ans: 0, why: "Newton's first law." },
    { q: "A 3 kg block on a horizontal floor is pulled by 10 N at 30° above the horizontal. $R$ is", opts: ["$3g - 5$ N", "$3g$ N", "$3g + 5$ N", "$3g - 10$ N"], ans: 0, why: "$10\\sin30° = 5$ upwards." },
    { q: "Which force can only pull?", opts: ["the tension in a string", "the thrust in a rod", "the normal reaction", "the weight"], ans: 0, why: "A string goes slack if pushed." },
    { q: "A box sliding on a rough floor has the pulling force removed. It", opts: ["slows down to rest", "stops instantly", "moves at constant speed", "moves backwards"], ans: 0, why: "Friction is the resultant force, against the motion." }
  ]
};

/* =====================================================================
   M8.2  Newton's second law
   ===================================================================== */
C["maths:M8.2"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Newton's second law — the whole topic on one page" },
    "Spec 8.2: understand and use **Newton's second law** for motion in a straight line — forces in two perpendicular directions or given as 2-D vectors — and extend to situations where forces need to be **resolved** (e.g. an inclined plane).",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["One equation: a driving force, a resistance, an acceleration", "2", "A-level June 2025 Q1(b)"],
      ["Normal reaction, then friction from $F = ma$", "3–4", "A-level June 2023 Q2"],
      ["Vector forces: the resultant, $\\mathbf F = m\\mathbf a$, a magnitude", "5", "AS June 2024 Q3, AS 2025 Q2"],
      ["Vector force then constant-acceleration kinematics", "8", "A-level June 2025 Q3"],
      ["Inclined plane: resolve along and perpendicular", "4–11", "A-level 2024 Q3, Specimen Q3 (M8.6)"],
      ["Force from a variable velocity", "7", "A-level Specimen Q2 (M7.4)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**$F = ma$ in a straight line**.",
      "**Resolving** — angled forces and inclined planes.",
      "**$\\mathbf F = m\\mathbf a$ with vectors**.",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "F = ma in a straight line" },
    { callout: { t: "def", h: "Newton's second law", body: "The resultant force on a body equals its mass times its acceleration, $\\mathbf F = m\\mathbf a$, and the acceleration is in the direction of the resultant force. 1 N is the force that gives 1 kg an acceleration of 1 m s$^{-2}$." } },
    { steps: [
      { h: "1. Force diagram", m: "All forces, with the acceleration marked beside it." },
      { h: "2. Resolve in the direction of the acceleration", m: "(forces with $a$) $-$ (forces against $a$) $= ma$" },
      { h: "3. Resolve perpendicular to it", m: "the forces balance there (no acceleration that way): this usually gives $R$." }
    ] },
    { fig: { w: 520, h: 150, items: [].concat(
      [ground(20, 500, 110), box(250, 86, 120, 48, 0), { text: [250, 86], t: "800 kg", b: true, c: "text" }],
      F(310, 86, 0, 90, "D N", { c: "accent" }),
      F(190, 86, 180, 80, "400 N", { c: "accent3", dx: -14 }),
      [{ vec: [[200, 30], [300, 30]], c: "text2", w: 1.6 }, { text: [330, 30], t: "2 m s⁻²", c: "text2", size: 12 }]
    ), cap: "A-level June 2025: $D - 400 = 800 \\times 2$." } },
    { worked: { tag: "exam", title: "A driving force from $F = ma$", src: "A-level June 2025 · P3 Q1(b) · 2 marks",
      q: "The horizontal forces on a car of mass 800 kg moving along a horizontal road are a driving force of magnitude $D$ newtons and a resistance to motion of magnitude 400 N. The acceleration of the car is 2 m s$^{-2}$ in the direction of the driving force. Modelling the car as a particle, find $D$.",
      steps: [
        { h: "$F = ma$ along the motion", m: "$D - 400 = 800 \\times 2$", mk: "M1" },
        { m: "$D = 2000$", mk: "A1" }
      ], result: "$D = 2000$" } },
    { worked: { tag: "exam", title: "Reaction, friction, and the coefficient", src: "A-level June 2023 · P3 Q2 · 4 marks",
      q: "A particle $P$ of mass 5 kg is pulled along a rough horizontal plane by a horizontal force of magnitude 28 N. The only resistance to motion is a frictional force of magnitude $F$ newtons. **(a)** Find the magnitude of the normal reaction of the plane on $P$. The particle is accelerating along the plane at 1.4 m s$^{-2}$. **(b)** Find $F$. The coefficient of friction between $P$ and the plane is $\\mu$. **(c)** Find $\\mu$ to 2 significant figures.",
      steps: [
        { h: "(a)", m: "$R = 5g = 49$ N", mk: "B1" },
        { h: "(b) $F = ma$", m: "$28 - F = 5 \\times 1.4$", mk: "M1" },
        { m: "$F = 21$", mk: "A1" },
        { h: "(c) Sliding, so $F = \\mu R$", m: "$\\mu = \\dfrac{21}{49} = 0.43$", mk: "B1ft" }
      ], result: "(a) 49 N (b) 21 (c) 0.43" } },
    { worked: { tag: "variation", title: "Vertical $F = ma$: air resistance on a falling ball", q: "A ball of mass 0.2 kg falls vertically. Air resistance on it is 0.6 N. Find its acceleration. Then it is thrown vertically upwards; find its deceleration while it rises (same resistance).",
      steps: [
        { h: "Falling: down positive", m: "$0.2g - 0.6 = 0.2a \\Rightarrow a = 9.8 - 3 = 6.8$ m s$^{-2}$" },
        { h: "Rising: weight and resistance both act downwards", m: "$0.2g + 0.6 = 0.2d \\Rightarrow d = 12.8$ m s$^{-2}$", n: "Resistance always opposes the motion, so it changes direction at the top." }
      ], result: "6.8 m s$^{-2}$; 12.8 m s$^{-2}$" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Resolving" },
    { callout: { t: "memorise", h: "A force at an angle", body: [
      "A force $P$ at angle $\\theta$ to a direction has component $P\\cos\\theta$ **along** it and $P\\sin\\theta$ **perpendicular** to it.",
      "On a slope at angle $\\alpha$, the weight $mg$ resolves into $mg\\sin\\alpha$ **down the slope** and $mg\\cos\\alpha$ **into the slope**.",
      "Resolve along the slope (the direction of motion) and perpendicular to it — never horizontally and vertically on a slope."
    ] } },
    { fig: { w: 520, h: 250, items: (function () {
      var x0 = 60, y0 = 230, d = 30, p = along(x0, y0, d, 250, 24), it = [].concat(slope(x0, y0, 370, d, "α"), [box(p[0], p[1], 64, 44, d)]);
      it = it.concat(F(p[0], p[1], 270, 90, "mg", { c: "accent2", dx: 18 }));
      it = it.concat(F(p[0], p[1], 180 + d, 78, "mg sin α", { c: "accent", dx: -26, dy: 8 }));
      it = it.concat(F(p[0], p[1], 270 + d, 80, "mg cos α", { c: "accent3", dx: 34, dy: 0 }));
      it = it.concat(F(p[0], p[1], 90 + d, 70, "R", { c: "text2" }));
      return it;
    })(), cap: "On a smooth slope the weight splits into $mg\\sin\\alpha$ down the slope and $mg\\cos\\alpha$ into it; $R = mg\\cos\\alpha$ and, released, $a = g\\sin\\alpha$." } },
    { worked: { tag: "variation", title: "Pulled up a smooth slope", q: "A particle of mass 4 kg is pulled up a line of greatest slope of a smooth plane inclined at 30° to the horizontal by a force of 30 N parallel to the slope. Find (a) the normal reaction, (b) the acceleration.",
      steps: [
        { h: "(a) Perpendicular: no acceleration", m: "$R = 4g\\cos30° = 33.9$ N" },
        { h: "(b) Along, up the slope positive", m: "$30 - 4g\\sin30° = 4a \\Rightarrow 30 - 19.6 = 4a \\Rightarrow a = 2.6$ m s$^{-2}$" }
      ], result: "(a) 33.9 N (b) 2.6 m s$^{-2}$" } },
    { worked: { tag: "variation", title: "Released on a smooth slope", q: "A particle is released from rest on a smooth plane inclined at $\\alpha$ to the horizontal, where $\\sin\\alpha = \\frac{5}{13}$. Find its acceleration and its speed after it has slid 2.6 m.",
      steps: [
        { h: "Along the slope", m: "$mg\\sin\\alpha = ma \\Rightarrow a = \\frac{5}{13} \\times 9.8 = 3.77$ m s$^{-2}$", n: "The mass cancels." },
        { h: "$v^2 = u^2 + 2as$", m: "$v^2 = 2 \\times 3.77 \\times 2.6 = 19.6 \\Rightarrow v = 4.43$ m s$^{-1}$" }
      ], result: "3.77 m s$^{-2}$, 4.43 m s$^{-1}$" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "F = ma with vectors" },
    { callout: { t: "formula", h: "Vector form", body: [
      "$\\mathbf F_1 + \\mathbf F_2 + \\cdots = m\\mathbf a$: add the forces component by component, then divide by $m$.",
      "$|\\mathbf a| = \\dfrac{|\\mathbf F|}{m}$; the direction of $\\mathbf a$ is the direction of the resultant.",
      "Then the M7.3 equations apply: $\\mathbf v = \\mathbf u + \\mathbf a t$, $\\mathbf r = \\mathbf u t + \\frac12 \\mathbf a t^2$."
    ] } },
    { worked: { tag: "exam", title: "Two forces, a given acceleration size: two values of $c$", src: "AS June 2024 · P2 Q3 · 5 marks",
      q: "[$\\mathbf i$ and $\\mathbf j$ are perpendicular unit vectors in a horizontal plane.] A particle $P$ of mass 2 kg moves on a smooth horizontal surface under the action of two forces, $(2\\mathbf i + 4\\mathbf j)$ N and $(c\\mathbf i - 2\\mathbf j)$ N, where $c$ is a constant. The magnitude of the acceleration of $P$ is $\\sqrt5$ m s$^{-2}$. Find the two possible values of $c$.",
      steps: [
        { h: "Resultant", m: "$\\mathbf R = (2 + c)\\mathbf i + 2\\mathbf j$", mk: "B1" },
        { h: "$|\\mathbf F| = m|\\mathbf a|$", m: "$|\\mathbf R| = 2\\sqrt5$", mk: "M1" },
        { m: "$(2 + c)^2 + 2^2 = 20$", mk: "M1" },
        { m: "$(2 + c)^2 = 16 \\Rightarrow c = 2$ or $c = -6$", mk: "A1 A1" }
      ], result: "$c = 2$ or $c = -6$" } },
    { worked: { tag: "exam", title: "A force, a velocity, a bearing, a displacement", src: "A-level June 2025 · P3 Q3 · 8 marks",
      q: "[$\\mathbf i$ and $\\mathbf j$ are horizontal unit vectors due east and due north.] A particle $P$ of mass 0.5 kg moves with constant acceleration $(2\\mathbf i - 2.4\\mathbf j)$ m s$^{-2}$ on a smooth horizontal plane under a constant horizontal force $\\mathbf F$ N. **(a)** Find $\\mathbf F$. At $t = 0$, $P$ is moving with velocity $(-7\\mathbf i + 7.8\\mathbf j)$ m s$^{-1}$. **(b)** Find the velocity of $P$ at $t = 2$ s. **(c)** Find the direction of motion of $P$ at $t = 2$ s as a bearing. At $t = 0$, $P$ passes through $O$; at $t = 5$ s it passes through $A$. **(d)** Find $\\overrightarrow{OA}$.",
      steps: [
        { h: "(a) $\\mathbf F = m\\mathbf a$", m: "$\\mathbf F = 0.5(2\\mathbf i - 2.4\\mathbf j) = (\\mathbf i - 1.2\\mathbf j)$ N", mk: "B1" },
        { h: "(b)", m: "$\\mathbf v = (-7\\mathbf i + 7.8\\mathbf j) + 2(2\\mathbf i - 2.4\\mathbf j)$", mk: "M1" },
        { m: "$= (-3\\mathbf i + 3\\mathbf j)$ m s$^{-1}$", mk: "A1" },
        { h: "(c) West and north equally", m: "angle with north $= \\tan^{-1}\\frac33 = 45°$, towards the west", mk: "M1 A1" },
        { m: "bearing $315°$", mk: "A1" },
        { h: "(d)", m: "$\\overrightarrow{OA} = 5(-7\\mathbf i + 7.8\\mathbf j) + \\tfrac12 \\times 25(2\\mathbf i - 2.4\\mathbf j)$", mk: "M1" },
        { m: "$= (-10\\mathbf i + 9\\mathbf j)$ m", mk: "A1" }
      ], result: "(a) $\\mathbf i - 1.2\\mathbf j$ (b) $-3\\mathbf i + 3\\mathbf j$ (c) 315° (d) $-10\\mathbf i + 9\\mathbf j$" } },
    { worked: { tag: "variation", title: "Perpendicular forces: size and direction of the acceleration", q: "A particle of mass 2 kg on a smooth horizontal plane is acted on by forces of 6 N due east and 8 N due north. Find the magnitude and direction of its acceleration.",
      steps: [
        { h: "Resultant", m: "$\\sqrt{6^2 + 8^2} = 10$ N" },
        { h: "$a = F / m$", m: "$a = 5$ m s$^{-2}$" },
        { h: "Direction", m: "$\\tan^{-1}\\frac86 = 53.1°$ north of east (bearing 036.9°)" }
      ], result: "5 m s$^{-2}$ on a bearing of 037°" } },

    /* ---------------------------------------------------------------- Exam toolkit */
    { page: "Exam toolkit" },
    { callout: { t: "memorise", h: "The equation", body: [
      "Resultant force in the direction of $a$ $= ma$. Forces with the acceleration are positive, against it negative.",
      "Perpendicular to the acceleration the forces balance — that finds $R$.",
      "Slope: $mg\\sin\\alpha$ along, $mg\\cos\\alpha$ into it."
    ] } },
    { callout: { t: "mnemonic", h: "\"With minus against equals $ma$\"", body: "Forces **with** the acceleration, **minus** forces **against** it, **equals $ma$**." } },
    { callout: { t: "warn", h: "Common losses", body: [
      "Putting $g$ into the $ma$ term ($ma$ is mass × acceleration, never weight).",
      "sin and cos swapped when resolving the weight on a slope.",
      "Forgetting that $|\\mathbf F| = m|\\mathbf a|$ — dividing the components but not the magnitude, or vice versa.",
      "Bearings measured from east instead of north."
    ] } }
  ],
  flashcards: [
    ["Newton's second law?", "Resultant force $= ma$, in the direction of the acceleration."],
    ["1 newton?", "The force giving 1 kg an acceleration of 1 m s$^{-2}$."],
    ["Component of $mg$ down a slope at $\\alpha$?", "$mg\\sin\\alpha$."],
    ["Normal reaction on a smooth slope (no other forces)?", "$mg\\cos\\alpha$."],
    ["Acceleration of a particle released on a smooth slope?", "$g\\sin\\alpha$."],
    ["Car 1000 kg, driving force 3000 N, resistance 1000 N. $a$?", "2 m s$^{-2}$."],
    ["Forces $(3\\mathbf i + \\mathbf j)$ and $(\\mathbf i + 2\\mathbf j)$ on 0.5 kg. $\\mathbf a$?", "$8\\mathbf i + 6\\mathbf j$, magnitude 10."],
    ["Falling 0.2 kg ball, resistance 0.6 N. $a$?", "6.8 m s$^{-2}$."],
    ["Bearing of a velocity $-3\\mathbf i + 3\\mathbf j$?", "315°."]
  ],
  quiz: [
    { q: "A 2 kg mass has a resultant force of 10 N. Its acceleration is", opts: ["5 m s$^{-2}$", "20 m s$^{-2}$", "0.2 m s$^{-2}$", "12 m s$^{-2}$"], ans: 0, why: "$10 / 2$." },
    { q: "On a smooth slope at 30°, a released particle accelerates at", opts: ["$4.9$ m s$^{-2}$", "$8.49$ m s$^{-2}$", "$9.8$ m s$^{-2}$", "0"], ans: 0, why: "$g\\sin30°$." },
    { q: "Forces $(4\\mathbf i - \\mathbf j)$ and $(2\\mathbf i + 9\\mathbf j)$ act on 2 kg. $|\\mathbf a|$ is", opts: ["5", "10", "7", "2.5"], ans: 0, why: "Resultant $6\\mathbf i + 8\\mathbf j$, size 10, ÷ 2." },
    { q: "A car of mass 1200 kg accelerates at 0.5 m s$^{-2}$ against resistance 300 N. The driving force is", opts: ["900 N", "600 N", "300 N", "1500 N"], ans: 0, why: "$D - 300 = 600$." },
    { q: "Which equation is wrong for a block of mass $m$ pulled up a rough slope by $P$?", opts: ["$P - mg - F = ma$", "$P - mg\\sin\\alpha - F = ma$", "$R = mg\\cos\\alpha$", "$F = \\mu R$"], ans: 0, why: "Only $mg\\sin\\alpha$ acts along the slope." }
  ]
};

/* =====================================================================
   M8.3  Weight and motion under gravity
   ===================================================================== */
C["maths:M8.3"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Weight and motion under gravity — the whole topic on one page" },
    "Spec 8.3: understand and use **weight** and motion in a straight line under gravity; the gravitational acceleration $g$ and its value in S.I. units to varying degrees of accuracy. $g$ is assumed constant but is not a universal constant: it depends on location. The default is $g = 9.8$ m s$^{-2}$; a question may give another value (e.g. 10).",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Weight in an equation of motion (vertical $F = ma$)", "inside most questions", "every connected-particle question"],
      ["Lift: the tension in a rope raising a load", "3", "AS June 2022 Q4(a)"],
      ["Lift: the reaction on a passenger or block (M8.4)", "3", "AS June 2022 Q4(b)"],
      ["Using a value of $g$ other than 9.8", "rubric", "AS 2018 Q6, 2019 Q1, 2020 Q1, 2022 Q1, Specimen Q3; A-level Oct 2021 Q4"],
      ["Free fall (M7.3), with resistance (vertical $F = ma$)", "2–5", "AS 2019 Q1, variations"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**Mass and weight**.",
      "**Vertical motion with forces** — resistance, lifts.",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "Mass and weight" },
    { kv: [
      ["Mass $m$", "the amount of matter, in kg; the same everywhere"],
      ["Weight $W$", "the gravitational force on the mass, $W = mg$, in N, vertically downwards"],
      ["$g$", "the acceleration of a body falling freely; about 9.8 m s$^{-2}$ near the Earth's surface"]
    ] },
    { table: { head: ["Place", "$g$ (m s$^{-2}$)", "Weight of 60 kg"], rows: [
      ["Equator", "9.78", "587 N"],
      ["Poles", "9.83", "590 N"],
      ["Exam default", "9.8", "588 N"],
      ["Moon", "1.62", "97 N"]
    ] } },
    { callout: { t: "miscon", h: "\"Heavier objects fall faster\"", body: "With no air resistance, $mg = ma$ gives $a = g$ for every mass. Air resistance is what separates a feather from a hammer — and including it is a refinement (M6.1)." } },
    { worked: { tag: "variation", title: "Weight here and on the Moon", q: "An astronaut has mass 75 kg. Find her weight on Earth ($g = 9.8$) and on the Moon ($g = 1.62$). What is her mass on the Moon?",
      steps: [
        { h: "Earth", m: "$75 \\times 9.8 = 735$ N" },
        { h: "Moon", m: "$75 \\times 1.62 = 121.5$ N" },
        { h: "Mass", m: "still 75 kg — mass does not depend on location" }
      ], result: "735 N, 122 N, 75 kg" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Vertical motion with forces" },
    "When something other than gravity acts vertically — a rope, a floor, air resistance, a thrust — use vertical $F = ma$ with the weight as one of the forces.",
    { fig: { w: 460, h: 230, items: [].concat(
      [{ poly: [[170, 90], [290, 90], [290, 190], [170, 190]], c: "text2", w: 2 }, box(230, 170, 50, 36, 0), { text: [230, 170], t: "10 kg", size: 11, b: true, c: "text" }],
      [{ line: [[230, 90], [230, 20]], c: "text2", w: 2 }],
      F(230, 70, 90, 40, "T", { c: "accent" }),
      F(230, 190, 270, 30, "50g (cage + block)", { c: "accent2", dx: 0, dy: 4 }),
      [{ vec: [[340, 160], [340, 100]], c: "text2", w: 1.6 }, { text: [370, 130], t: "0.2 m s⁻²", c: "text2", size: 12 }]
    ), cap: "AS June 2022: treat the cage and block as one body for the tension; isolate the block for the reaction on it." } },
    { worked: { tag: "exam", title: "The tension in a rope raising a lift", src: "AS June 2022 · P2 Q4(a) · 3 marks",
      q: "A vertical rope $PQ$ has its end $Q$ attached to the top of a small lift cage of mass 40 kg, which carries a block of mass 10 kg. The cage is raised vertically by moving the end $P$ of the rope vertically upwards with constant acceleration 0.2 m s$^{-2}$. The rope is modelled as light and inextensible and air resistance is ignored. Find the tension in the rope $PQ$.",
      steps: [
        { h: "Cage + block as one body, up positive", m: "$T - 50g = 50 \\times 0.2$", mk: "M1 A1" },
        { m: "$T = 490 + 10 = 500$ N", mk: "A1" }
      ], result: "500 N" } },
    { worked: { tag: "variation", title: "Bathroom scales in a lift", q: "A woman of mass 60 kg stands on scales in a lift. Find the reading (the normal reaction) when the lift (a) moves up at constant speed, (b) accelerates upwards at 1.5 m s$^{-2}$, (c) accelerates downwards at 1.5 m s$^{-2}$.",
      steps: [
        { h: "(a) No acceleration", m: "$R = 60g = 588$ N" },
        { h: "(b) Up positive", m: "$R - 60g = 60 \\times 1.5 \\Rightarrow R = 678$ N", n: "She feels heavier." },
        { h: "(c) Down positive", m: "$60g - R = 60 \\times 1.5 \\Rightarrow R = 498$ N", n: "She feels lighter; in free fall ($a = g$) the reading would be 0." }
      ], result: "588 N, 678 N, 498 N" } },
    { worked: { tag: "variation", title: "A crate lowered on a rope", q: "A crate of mass 120 kg is lowered on a rope. Starting from rest, it reaches a speed of 2 m s$^{-1}$ in 4 s with constant acceleration. Find the tension in the rope.",
      steps: [
        { h: "Acceleration (down)", m: "$a = \\dfrac{2}{4} = 0.5$ m s$^{-2}$" },
        { h: "Down positive", m: "$120g - T = 120 \\times 0.5 \\Rightarrow T = 1176 - 60 = 1116$ N" }
      ], result: "1116 N (1120 N to 3 s.f.)" } },

    /* ---------------------------------------------------------------- Exam toolkit */
    { page: "Exam toolkit" },
    { callout: { t: "memorise", h: "Weight", body: [
      "$W = mg$, downwards, in N. Mass in kg never changes; weight depends on $g$.",
      "Use $g = 9.8$ unless told otherwise; then 2 or 3 s.f.",
      "Free fall: $a = g$ whatever the mass. Anything else vertical: $F = ma$ with $mg$ in it."
    ] } },
    { callout: { t: "mnemonic", h: "Lifts: \"up adds, down subtracts\"", body: "Accelerating up: $R = m(g + a)$. Accelerating down: $R = m(g - a)$. Constant speed: $R = mg$." } },
    { callout: { t: "warn", h: "Common losses", body: [
      "Writing a mass where a weight is needed ($T - 50 = 50a$).",
      "Forgetting the weight of the cage when finding the rope's tension.",
      "Using 9.81 or 10 when 9.8 was expected (penalised once)."
    ] } }
  ],
  flashcards: [
    ["Weight formula?", "$W = mg$."],
    ["Units of mass and weight?", "kg and N."],
    ["Default value of $g$?", "9.8 m s$^{-2}$."],
    ["Does $g$ depend on location?", "Yes (equator ~9.78, poles ~9.83, Moon ~1.6)."],
    ["Acceleration of a freely falling body of any mass?", "$g$."],
    ["Reaction on a person of mass $m$ in a lift accelerating up at $a$?", "$m(g + a)$."],
    ["… accelerating down at $a$?", "$m(g - a)$."],
    ["Tension raising 50 kg at 0.2 m s$^{-2}$?", "$50(9.8 + 0.2) = 500$ N."]
  ],
  quiz: [
    { q: "The weight of a 3 kg mass is", opts: ["29.4 N", "3 N", "0.31 N", "3 kg"], ans: 0, why: "$3 \\times 9.8$." },
    { q: "A lift accelerates downwards at 2 m s$^{-2}$. A 50 kg passenger's reaction is", opts: ["390 N", "590 N", "490 N", "100 N"], ans: 0, why: "$50(9.8 - 2)$." },
    { q: "With no air resistance, a 10 kg and a 1 kg ball dropped together", opts: ["land together", "the 10 kg lands first", "the 1 kg lands first", "depends on height"], ans: 0, why: "Both accelerate at $g$." },
    { q: "On the Moon an object's mass is", opts: ["the same as on Earth", "about one sixth", "zero", "six times"], ans: 0, why: "Mass does not change." }
  ]
};

/* =====================================================================
   M8.4  Newton's third law, connected particles and equilibrium
   ===================================================================== */
C["maths:M8.4"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Newton's third law and connected particles — the whole topic on one page" },
    "Spec 8.4: understand and use **Newton's third law**; equilibrium of forces on a particle and motion in a straight line; application to problems involving **smooth pulleys and connected particles** (including particles in contact, e.g. lifts); resolving forces in 2 dimensions; **equilibrium of a particle under coplanar forces**.",
    "The single most frequent AS Mechanics question:",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Write an equation of motion for each particle", "2–4", "AS Nov 2021 Q3(a), AS 2025 Q3(a), A-level Oct 2021 Q2(a)"],
      ["Show the acceleration; find the tension", "3–7", "AS 2018 Q9, 2019 Q2, 2020 Q2, 2025 Q3, Specimen Q3; A-level Oct 2021 Q2"],
      ["Find a mass or a ratio $k$", "4–6", "AS Specimen Q3, AS 2018 Q9(c)"],
      ["Force exerted on the pulley ($2T$)", "8", "AS June 2020 Q2"],
      ["After the string goes slack: second stage (free motion or constant speed)", "4–7", "AS 2019 Q2(b), Nov 2021 Q3(b), 2025 Q3(d)"],
      ["Car and trailer: towbar/rope tension, resistance, then the bar breaks", "6–12", "AS 2023 Q4, 2024 Q4"],
      ["Lift: reaction between the block and the floor (third law)", "3", "AS June 2022 Q4(b)"],
      ["One particle on a rough slope, one hanging", "12", "A-level Oct 2021 Q2"],
      ["Limitations: light string, smooth pulley, inextensible", "1", "nearly all of these"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**Newton's third law** — action and reaction.",
      "**Equilibrium of a particle** — resolving coplanar forces.",
      "**Pulleys** — hanging, on a table, on a slope; force on the pulley.",
      "**When the string goes slack** — the second stage.",
      "**Towing and lifts**.",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "Newton's third law" },
    { callout: { t: "def", h: "Newton's third law", body: "When body $A$ exerts a force on body $B$, $B$ exerts a force on $A$ that is **equal in magnitude and opposite in direction**. The two forces act on **different** bodies, so they never cancel in one equation of motion." } },
    { kv: [
      ["Block on a lift floor", "the floor pushes the block up with $R$; the block pushes the floor down with $R$"],
      ["Towbar between car and trailer", "it pulls the trailer forward with $T$ and the car backward with $T$ (tension); when braking it may push both ways (thrust)"],
      ["String over a smooth pulley", "pulls each particle towards the pulley with $T$; pulls the pulley with $T$ along **each** part"]
    ] },
    { callout: { t: "memorise", h: "Two ways to find the acceleration", body: [
      "**Separate**: one equation per particle, each containing the tension; add them to eliminate $T$.",
      "**Whole system** (when the particles move along one line, e.g. a car and trailer): internal forces cancel — external forces $= (\\text{total mass}) \\times a$. Then one separate equation for the tension.",
      "Over a pulley the directions turn, so use separate equations."
    ] } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Equilibrium of a particle" },
    "A particle at rest under several coplanar forces: **resolve in two perpendicular directions** and set each sum to zero. Choose directions that kill an unknown (along a slope and perpendicular to it, or horizontal and vertical).",
    { fig: { w: 460, h: 220, items: [].concat(
      [{ line: [[60, 30], [400, 30]], c: "text2", w: 2.5 }],
      [{ line: [[100, 30], [230, 105]], c: "text2", w: 1.6 }, { line: [[360, 30], [230, 105]], c: "text2", w: 1.6 }],
      [{ circle: [230, 105, 6], fill: "accent", alpha: 0.8, c: "accent" }],
      F(230, 105, 150, 70, "T₁", { c: "accent" }),
      F(230, 105, 30, 80, "T₂", { c: "accent" }),
      F(230, 105, 270, 70, "20 N", { c: "accent2", dx: 22 }),
      [{ arc: [100, 30, 36, 300, 330], label: "30°", c: "accent3", loff: 14 }, { arc: [360, 30, 36, 210, 240], label: "30°", c: "accent3", loff: 14 }]
    ), cap: "Resolve horizontally and vertically: the horizontal parts of the tensions balance; their vertical parts hold up the weight." } },
    { worked: { tag: "variation", title: "A weight held by two strings", q: "A particle of weight 20 N hangs in equilibrium from two light strings attached to a horizontal ceiling. One string makes 30° with the horizontal, the other 60°. Find the tensions.",
      steps: [
        { h: "Horizontal", m: "$T_1\\cos30° = T_2\\cos60° \\Rightarrow T_2 = \\sqrt3\\,T_1$" },
        { h: "Vertical", m: "$T_1\\sin30° + T_2\\sin60° = 20 \\Rightarrow \\tfrac12 T_1 + \\tfrac32 T_1 = 20$" },
        { m: "$T_1 = 10$ N, $\\; T_2 = 10\\sqrt3 = 17.3$ N", n: "The steeper string carries more of the weight." }
      ], result: "10 N and 17.3 N" } },
    { worked: { tag: "variation", title: "Three forces in equilibrium: find $P$ and $\\theta$", q: "A particle is in equilibrium under three forces: 8 N due east, 6 N due north, and a force $P$ N at angle $\\theta$ south of west. Find $P$ and $\\theta$.",
      steps: [
        { h: "$P$ must cancel the other two", m: "$P\\cos\\theta = 8$ (west), $\\; P\\sin\\theta = 6$ (south)" },
        { m: "$P = \\sqrt{64 + 36} = 10$ N, $\\; \\theta = \\tan^{-1}\\frac68 = 36.9°$" }
      ], result: "$P = 10$, $\\theta = 36.9°$ south of west" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Pulleys" },
    { callout: { t: "memorise", h: "The pulley model", body: [
      "**Light, inextensible string**: the tension is the same all along it, and both particles move with the **same speed and the same size of acceleration**.",
      "**Smooth pulley**: the tension is the same on both sides.",
      "Each particle's equation uses its **own** direction of motion as positive.",
      "The force on a pulley from the string is the resultant of the two tensions: $2T$ if both parts are parallel."
    ] } },
    { fig: { w: 520, h: 275, items: [].concat(
      [{ poly: [[30, 120], [330, 120], [330, 240], [30, 240]], fill: "muted", alpha: 0.08, c: "text2", w: 1.6 }],
      [box(150, 104, 56, 32, 0, { fill: "accent" }), { text: [150, 104], t: "P", b: true, c: "text" }],
      [{ circle: [345, 120, 15], c: "text2", w: 1.8 }, { line: [[178, 105], [345, 105]], c: "text2", w: 1.4 }, { line: [[360, 120], [360, 200]], c: "text2", w: 1.4 }],
      [box(360, 214, 34, 30, 0, { fill: "accent2" }), { text: [360, 214], t: "Q", b: true, c: "text" }],
      F(178, 104, 0, 60, "T", { c: "accent", dy: -10 }),
      F(360, 199, 90, 50, "T", { c: "accent", dx: 14, dy: 20 }),
      F(360, 229, 270, 18, "3g", { c: "accent2", dx: 20, dy: 0 }),
      F(150, 120, 270, 40, "2g", { c: "accent2", dx: 18 }),
      F(150, 88, 90, 40, "R", { c: "text2" }),
      [{ vec: [[440, 150], [440, 210]], c: "text2", w: 1.6 }, { text: [470, 180], t: "a", i: true, c: "text2" }, { vec: [[80, 70], [140, 70]], c: "text2", w: 1.6 }, { text: [110, 56], t: "a", i: true, c: "text2" }]
    ), cap: "AS June 2025: $P$ (2 kg) on a smooth table, $Q$ (3 kg) hanging. Same $T$, same $a$, each in its own direction." } },
    { worked: { tag: "exam", title: "On a smooth table: equation, acceleration, impact speed, time to the pulley", src: "AS June 2025 · P2 Q3 · 11 marks",
      q: "A package $P$ of mass 2 kg is held at rest on a horizontal table, 1.2 m from a pulley fixed at the edge. A thin rope attached to $P$ passes over the pulley to a package $Q$ of mass 3 kg hanging freely, 0.4 m above a horizontal floor; the rope is taut. $P$ is released and $Q$ moves down. In an initial model the table is smooth, the packages are particles, air resistance is negligible, the pulley is small and smooth and the rope light and inextensible. **(a)** Write down an equation of motion for $Q$. **(b)** Find the acceleration of $Q$. **(c)** Find the speed of $Q$ when it hits the floor. $K$ seconds after $Q$ hits the floor, $P$ hits the pulley. **(d)** Find $K$. In a refinement a resistance acts against the motion of $P$. **(e)** State, with a reason, how the new acceleration of $Q$ compares with (b). **(f)** Suggest one further refinement, apart from air resistance.",
      steps: [
        { h: "(a) $Q$, down positive", m: "$3g - T = 3a$", mk: "M1 A1" },
        { h: "(b) $P$: $T = 2a$; add", m: "$3g = 5a$", mk: "M1 A1" },
        { m: "$a = 5.88$ m s$^{-2}$", mk: "A1" },
        { h: "(c) $Q$ falls 0.4 m", m: "$v^2 = 2 \\times 5.88 \\times 0.4 = 4.704$", mk: "M1" },
        { m: "$v = 2.17$ m s$^{-1}$", mk: "A1" },
        { h: "(d) The rope goes slack; the table is smooth", m: "$P$ moves the remaining $1.2 - 0.4 = 0.8$ m at a constant 2.17 m s$^{-1}$: $\\; K = \\dfrac{0.8}{2.17}$", mk: "M1" },
        { m: "$K = 0.37$", mk: "A1" },
        { h: "(e)", m: "**Less** — the resistance opposes $P$'s motion, so the resultant force on the system, and its acceleration, are smaller.", mk: "B1" },
        { h: "(f)", m: "e.g. the table is rough (friction); the pulley is not smooth; the rope has mass; the packages have size.", mk: "B1" }
      ], result: "(b) 5.88 m s$^{-2}$ (c) 2.17 m s$^{-1}$ (d) 0.37" } },
    { worked: { tag: "exam", title: "Show the acceleration is 4.2; time for $P$ to reach the pulley", src: "AS June 2019 · P2 Q2(a)(b) · 11 marks",
      q: "A small ball $P$ of mass 0.8 kg is held at rest on a smooth horizontal table, attached to a thin rope that passes over a pulley at the edge of the table to a ball $Q$ of mass 0.6 kg hanging freely. $P$ is released from rest with the rope taut, 1.5 m from the pulley, with $Q$ 0.4 m above the floor. $Q$ hits the floor and does not rebound. The balls are particles, the rope light and inextensible, the pulley small and smooth. **(a)** Show that the acceleration of $Q$ as it falls is 4.2 m s$^{-2}$. **(b)** Find the time taken by $P$ to hit the pulley from the instant it is released.",
      steps: [
        { h: "(a) $Q$ (down)", m: "$0.6g - T = 0.6a$", mk: "M1 A1" },
        { h: "$P$ (towards the pulley)", m: "$T = 0.8a$", mk: "M1 A1" },
        { m: "$0.6g = 1.4a \\Rightarrow a = \\dfrac{0.6 \\times 9.8}{1.4} = 4.2$ m s$^{-2}$", mk: "A1*" },
        { h: "(b) Stage 1: $Q$ falls 0.4 m", m: "$0.4 = \\tfrac12 \\times 4.2\\,t_1^2 \\Rightarrow t_1 = 0.436$ s", mk: "M1 A1" },
        { m: "speed then: $v = 4.2 \\times 0.436 = 1.83$ m s$^{-1}$ (or $v^2 = 2 \\times 4.2 \\times 0.4$)", mk: "M1 A1" },
        { h: "Stage 2: slack rope, smooth table — constant speed for 1.1 m", m: "$t_2 = \\dfrac{1.1}{1.83} = 0.600$ s", mk: "M1" },
        { m: "total $= 0.436 + 0.600 = 1.04$ s", mk: "A1" }
      ], result: "(b) 1.04 s" } },
    { worked: { tag: "exam", title: "Rough table with a resistance: tension, mass, time ($g = 10$)", src: "AS Specimen · P2 Q3(a)–(c) · 9 marks",
      q: "A ball $P$ of mass 0.4 kg rests on a rough horizontal table, attached to a rope that passes over a pulley at the edge of the table to a ball $Q$ of mass $M$ kg hanging freely. Released from rest with the rope taut and $Q$ 2 m above the ground, $Q$ moves down with acceleration 2.5 m s$^{-2}$; $P$ does not reach the pulley first. The balls are particles, the rope light and inextensible, the pulley small and smooth; the total resistance to the motion of $P$ is a constant 1.5 N; $g = 10$ m s$^{-2}$. Find, to 2 s.f., **(a)** (i) the tension in the rope, (ii) $M$; **(b)** the time for $Q$ to hit the ground. **(c)** State one limitation of the model that will affect the accuracy of (a).",
      steps: [
        { h: "(a)(i) $P$", m: "$T - 1.5 = 0.4 \\times 2.5$", mk: "M1 A1" },
        { m: "$T = 2.5$ N", mk: "A1" },
        { h: "(ii) $Q$", m: "$10M - 2.5 = 2.5M$", mk: "B1 M1" },
        { m: "$M = \\dfrac{2.5}{7.5} = 0.33$", mk: "A1" },
        { h: "(b)", m: "$2 = \\tfrac12 \\times 2.5\\,t^2$", mk: "DM1" },
        { m: "$t = 1.3$ s", mk: "A1" },
        { h: "(c)", m: "e.g. the resistance to $P$'s motion will not be constant; the rope will have weight; the pulley will not be smooth.", mk: "B1" }
      ], result: "(a) 2.5 N, 0.33 (b) 1.3 s" } },
    { worked: { tag: "exam", title: "Both hanging: tension in terms of $m$ and $g$; the ratio $k$", src: "AS June 2018 · P2 Q9(a)–(d) · 9 marks",
      q: "Two small balls $P$ and $Q$ have masses $2m$ and $km$, where $k < 2$. They are attached to the ends of a string passing over a fixed pulley and held at rest with the string taut and the hanging parts vertical. Released, $P$ moves downwards with acceleration of magnitude $\\frac{g}{5}$. The balls are particles moving freely, the string light and inextensible, the pulley small and smooth. **(a)** Find the tension in terms of $m$ and $g$. **(b)** Explain why $Q$'s acceleration also has magnitude $\\frac{g}{5}$. **(c)** Find $k$. **(d)** Identify one limitation of the model that will affect the accuracy of (c).",
      steps: [
        { h: "(a) $P$, down", m: "$2mg - T = 2m \\cdot \\dfrac{g}{5}$", mk: "M1 A1" },
        { m: "$T = \\dfrac{8mg}{5}$", mk: "A1" },
        { h: "(b)", m: "The string is **inextensible**, so $P$ and $Q$ move together with the same size of acceleration.", mk: "B1" },
        { h: "(c) $Q$, up", m: "$T - kmg = km \\cdot \\dfrac{g}{5}$", mk: "M1 A1" },
        { m: "$\\dfrac{8mg}{5} = \\dfrac{6kmg}{5}$", mk: "M1" },
        { m: "$k = \\dfrac43$", mk: "A1" },
        { h: "(d)", m: "e.g. the pulley will not be smooth, so the tensions either side differ; the string is not light; the balls have size.", mk: "B1" }
      ], result: "(a) $\\frac{8mg}{5}$ (c) $\\frac43$" } },
    { worked: { tag: "exam", title: "The force exerted on the pulley", src: "AS June 2020 · P2 Q2 · 9 marks",
      q: "One end of a string is attached to a small ball $P$ of mass $4m$ and the other to a small ball $Q$ of mass $3m$. The string passes over a fixed pulley; $P$ is held at rest with the string taut and the hanging parts vertical, then released. The string is light and inextensible, the balls are particles, the pulley smooth and air resistance ignored. **(a)** Find, in terms of $m$ and $g$, the magnitude of the force exerted on the pulley by the string while $P$ is falling and before $Q$ hits the pulley. **(b)** State one limitation of the model, apart from ignoring air resistance, that will affect the accuracy of (a).",
      steps: [
        { h: "(a) $P$, down", m: "$4mg - T = 4ma$", mk: "M1 A1" },
        { h: "$Q$, up", m: "$T - 3mg = 3ma$", mk: "M1 A1" },
        { h: "Add", m: "$mg = 7ma \\Rightarrow a = \\dfrac{g}{7}$", mk: "M1 A1" },
        { m: "$T = 3m\\left(g + \\dfrac{g}{7}\\right) = \\dfrac{24mg}{7}$", mk: "M1" },
        { h: "Both parts pull the pulley down", m: "force on the pulley $= 2T = \\dfrac{48mg}{7}$", mk: "A1" },
        { h: "(b)", m: "e.g. the string is not light, or the pulley not smooth, so the tension is not the same on both sides.", mk: "B1" }
      ], result: "$\\frac{48mg}{7}$" } },
    { fig: { w: 420, h: 240, items: [].concat(
      [{ line: [[150, 20], [270, 20]], c: "text2", w: 2.5 }, { line: [[210, 20], [210, 50]], c: "text2", w: 1.6 }, { circle: [210, 64, 16], c: "text2", w: 1.8 }],
      [{ line: [[194, 64], [194, 180]], c: "text2", w: 1.4 }, { line: [[226, 64], [226, 130]], c: "text2", w: 1.4 }],
      [box(194, 196, 34, 32, 0, { fill: "accent2" }), { text: [194, 196], t: "4m", size: 11, b: true, c: "text" }],
      [box(226, 146, 30, 30, 0, { fill: "accent" }), { text: [226, 146], t: "3m", size: 11, b: true, c: "text" }],
      F(194, 110, 90, 34, "T", { c: "accent", dx: -16 }),
      F(226, 100, 90, 30, "T", { c: "accent", dx: 16 }),
      F(300, 70, 270, 70, "2T on the pulley", { c: "accent2", dx: 50, dy: -30 })
    ), cap: "AS June 2020: the string pulls the pulley down along both parts — $2T = \\frac{48mg}{7}$." } },
    { worked: { tag: "exam", title: "On a rough slope, one hanging: show $a = \\frac{g}{10}$", src: "A-level Oct 2021 · P3 Q2 · 12 marks",
      q: "A small stone $A$ of mass $3m$ is attached to one end of a string and a small stone $B$ of mass $m$ to the other. $A$ is held at rest on a fixed rough plane inclined at $\\alpha$ to the horizontal, where $\\tan\\alpha = \\frac34$. The string passes over a small smooth pulley $P$ at the top of the plane, the part $AP$ parallel to a line of greatest slope, and $B$ hangs freely below $P$. The coefficient of friction between $A$ and the plane is $\\frac16$. $A$ is released and moves down the plane. Modelling the stones as particles and the string as light and inextensible, for the motion before $B$ reaches the pulley, **(a)** write down an equation of motion for $A$, **(b)** show that the acceleration of $A$ is $\\frac{1}{10}g$, **(c)** sketch a velocity-time graph for $B$, explaining your answer. In reality the string is not light. **(d)** State how this would affect the working in (b).",
      steps: [
        { h: "(a) $A$, down the plane", m: "$3mg\\sin\\alpha - T - F = 3ma$", mk: "M1 A1" },
        { h: "(b) Perpendicular to the plane", m: "$R = 3mg\\cos\\alpha = \\dfrac{12mg}{5}$", mk: "M1 A1" },
        { h: "Sliding", m: "$F = \\tfrac16 R = \\dfrac{2mg}{5}$", mk: "B1" },
        { h: "$B$, up", m: "$T - mg = ma$", mk: "M1 A1" },
        { h: "Add", m: "$\\dfrac{9mg}{5} - \\dfrac{2mg}{5} - mg = 4ma \\Rightarrow \\dfrac{2mg}{5} = 4ma$", mk: "DM1" },
        { m: "$a = \\dfrac{g}{10}$", mk: "A1*" },
        { h: "(c)", m: "A straight line through the origin with positive gradient,", mk: "B1" },
        { m: "because $B$ starts from rest and has a constant acceleration $\\frac{g}{10}$.", mk: "B1" },
        { h: "(d)", m: "The tension would not be the same throughout the string, so the same $T$ could not be used in the equations for $A$ and $B$.", mk: "B1" }
      ], result: "$a = \\frac{g}{10}$" } },
    { fig: { w: 520, h: 230, items: (function () {
      var x0 = 40, y0 = 210, d = 36.87, top = along(x0, y0, d, 330, 0), p = along(x0, y0, d, 200, 18);
      var it = [].concat(slope(x0, y0, 330 * Math.cos(rad(d)), d, "α"), [box(p[0], p[1], 50, 34, d), { text: [p[0], p[1]], t: "3m", size: 11, b: true, c: "text" }]);
      it.push({ circle: [top[0] + 4, top[1] - 12, 12], c: "text2", w: 1.6 });
      it.push({ line: [along(x0, y0, d, 225, 18), [top[0] - 6, top[1] - 20]], c: "text2", w: 1.4 });
      it.push({ line: [[top[0] + 16, top[1] - 12], [top[0] + 16, top[1] + 80]], c: "text2", w: 1.4 });
      it.push(box(top[0] + 16, top[1] + 96, 26, 26, 0, { fill: "accent2" }), { text: [top[0] + 16, top[1] + 96], t: "m", b: true, size: 11, c: "text" });
      it = it.concat(F(p[0], p[1], 180 + d, 60, "3mg sin α", { c: "accent2", dx: -26, dy: 6 }));
      it = it.concat(F(p[0] + 6, p[1] + 12, d, 46, "F", { c: "accent3", dy: 8 }));
      it = it.concat(F(p[0], p[1], 90 + d, 56, "R", { c: "text2" }));
      return it;
    })(), cap: "A-level Oct 2021: $A$ slides down, so friction acts up the slope with the tension; $B$ is pulled up." } },

    /* ---------------------------------------------------------------- Page 4 */
    { page: "When the string goes slack" },
    { callout: { t: "memorise", h: "Two stages", body: [
      "When the falling particle hits the ground (and does not rebound), the string goes **slack**: the tension becomes zero.",
      "The other particle keeps the speed it had at that instant, then moves under its remaining forces only: **constant speed** on a smooth table; **deceleration $\\mu g$** on a rough one; **free motion under gravity** if it hangs.",
      "Find the speed at the end of stage 1 with suvat, then start stage 2 from that speed."
    ] } },
    { worked: { tag: "exam", title: "Equations of motion; then the height where $P$ comes to rest", src: "AS Nov 2021 · P2 Q3(a)(b)(d) · 12 marks",
      q: "A ball $P$ of mass $2m$ and a ball $Q$ of mass $5m$ are attached to the ends of a string that passes over a fixed pulley. Held at rest with the string taut and hanging parts vertical, $P$ is at height $2h$ and $Q$ at height $h$ above horizontal ground. Released from rest, $Q$ does not rebound when it hits the ground and $P$ does not hit the pulley. The balls are particles, the string light and inextensible, the pulley small and smooth, air resistance negligible. **(a)** Write down an equation of motion for (i) $P$, (ii) $Q$. **(b)** Find, in terms of $h$ only, the height above the ground at which $P$ first comes to instantaneous rest. In reality the string will not be inextensible. **(d)** State how this would affect the accelerations of the particles.",
      steps: [
        { h: "(a)(i) $P$, up", m: "$T - 2mg = 2ma$", mk: "M1 A1" },
        { h: "(a)(ii) $Q$, down", m: "$5mg - T = 5ma$", mk: "M1 A1" },
        { h: "(b) Add", m: "$3mg = 7ma \\Rightarrow a = \\dfrac{3g}{7}$", mk: "M1 A1" },
        { h: "$Q$ falls $h$", m: "$v^2 = 2 \\cdot \\dfrac{3g}{7} \\cdot h = \\dfrac{6gh}{7}$", mk: "M1" },
        { h: "$P$ is now at $3h$, moving up freely", m: "$0 = \\dfrac{6gh}{7} - 2gs \\Rightarrow s = \\dfrac{3h}{7}$", mk: "M1 A1" },
        { m: "height $= 3h + \\dfrac{3h}{7} = \\dfrac{24h}{7}$", mk: "M1 A1", n: "$P$ rose $h$ in stage 1 (from $2h$ to $3h$) — forgetting that is the usual slip." },
        { h: "(d)", m: "The accelerations of $P$ and $Q$ would not be equal in magnitude.", mk: "B1" }
      ], result: "(b) $\\frac{24h}{7}$" } },
    { fig: { w: 460, h: 260, items: (function () {
      var g0 = 230, u = 52, it = [ground(20, 440, g0)];
      function mark(x, hgt, t, c) { it.push({ line: [[x - 8, g0 - hgt * u], [x + 8, g0 - hgt * u]], c: "text2", w: 1.4 }, { text: [x + 14, g0 - hgt * u], t: t, pos: "e", size: 11.5, c: c || "text", off: 2 }); }
      it.push({ line: [[120, g0], [120, g0 - 3.6 * u]], c: "line", w: 1 }, { line: [[330, g0], [330, g0 - 1.3 * u]], c: "line", w: 1 });
      mark(120, 2, "P starts: 2h"); mark(120, 3, "Q lands: P at 3h", "accent2"); mark(120, 24 / 7, "rest: 24h/7", "accent");
      mark(330, 1, "Q starts: h"); it.push({ text: [40, g0 - 10], t: "ground", pos: "e", size: 11, c: "muted", off: 2 });
      it.push({ line: [[100, g0 - 2 * u], [100, g0 - 3 * u]], arrow: true, c: "accent2", w: 2 }, { line: [[90, g0 - 3 * u], [90, g0 - 24 / 7 * u]], arrow: true, c: "accent", w: 2 });
      it.push({ text: [70, g0 - 2.5 * u], t: "a = 3g/7", pos: "w", size: 11, c: "accent2" }, { text: [80, g0 - 3.3 * u], t: "free", pos: "w", size: 11, c: "accent" });
      return it;
    })(), cap: "AS Nov 2021: $P$ rises $h$ with the string taut, then $\\frac{3h}{7}$ more under gravity alone." } },

    /* ---------------------------------------------------------------- Page 5 */
    { page: "Towing and lifts" },
    { fig: { w: 540, h: 170, items: [].concat(
      [ground(10, 530, 130)],
      [box(390, 104, 120, 50, 0, { fill: "accent" }), { text: [390, 104], t: "car 800 kg", b: true, size: 12, c: "text" }],
      [box(150, 108, 110, 42, 0, { fill: "accent2" }), { text: [150, 108], t: "trailer 600 kg", b: true, size: 12, c: "text" }],
      [{ line: [[205, 112], [330, 112]], c: "text2", w: 3 }],
      F(450, 104, 0, 60, "1740", { c: "accent", dx: 14 }),
      F(330, 92, 180, 36, "T", { c: "accent3", dy: -8 }),
      F(205, 92, 0, 36, "T", { c: "accent3", dy: -8 }),
      F(95, 108, 180, 50, "R", { c: "text2", dx: -6 }),
      [{ text: [330, 150], t: "400 N resistance on the car", c: "text2", size: 11.5 }]
    ), cap: "AS June 2024: the towbar pulls the trailer forward and the car back with the same $T$ (Newton's third law)." } },
    { worked: { tag: "exam", title: "A car towing a trailer by a rope: find $a$", src: "AS June 2023 · P2 Q4 · 7 marks",
      q: "A car of mass 1200 kg tows a trailer of mass 400 kg along a straight horizontal road with a horizontal tow rope parallel to the motion. The resistance to the car is a constant $2R$ N and to the trailer a constant $R$ N. The rope is light and inextensible, the acceleration is $a$ m s$^{-2}$, the driving force is 7400 N and the tension in the rope is 2400 N. **(a)** Find $a$. In a refined model the rope has mass, and the acceleration is $a_1$ m s$^{-2}$. **(b)** State how $a_1$ compares with $a$. **(c)** State one limitation of the model for the resistance to the motion of the car.",
      steps: [
        { h: "(a) Trailer", m: "$2400 - R = 400a$", mk: "M1 A1" },
        { h: "Car", m: "$7400 - 2400 - 2R = 1200a$", mk: "M1 A1" },
        { m: "$R = 2400 - 400a \\Rightarrow 5000 - 4800 + 800a = 1200a \\Rightarrow a = 0.5$", mk: "A1", n: "Or the whole system: $7400 - 3R = 1600a$ with either equation." },
        { h: "(b)", m: "$a_1 < a$: the same forces now move a larger total mass.", mk: "B1" },
        { h: "(c)", m: "The resistance is unlikely to be constant — it will vary with the speed.", mk: "B1" }
      ], result: "(a) 0.5" } },
    { worked: { tag: "exam", title: "A towbar: resistance, tension, then it breaks", src: "AS June 2024 · P2 Q4 · 12 marks",
      q: "A car of mass 800 kg tows a trailer of mass 600 kg along a straight horizontal road by a towbar, modelled as a light rod, parallel to the road and the motion. The resistance to the car is a constant 400 N, to the trailer a constant $R$ N. The engine's driving force is a constant 1740 N, the acceleration is 0.6 m s$^{-2}$ and the tension in the towbar is $T$ N. **(a)** Show that $R = 500$. **(b)** Find $T$. When the speed is 12.5 m s$^{-1}$ the towbar breaks, and the trailer moves a further $d$ metres before stopping, its resistance still 500 N. **(c)** Show that the trailer's deceleration is $\\frac56$ m s$^{-2}$. **(d)** Find $d$. **(e)** Give two different reasons why the real $d$ is likely to differ from (d).",
      steps: [
        { h: "(a) Whole system", m: "$1740 - 400 - R = 1400 \\times 0.6$", mk: "M1 A1" },
        { m: "$R = 1340 - 840 = 500$", mk: "A1*" },
        { h: "(b) Trailer", m: "$T - 500 = 600 \\times 0.6$", mk: "M1 A1" },
        { m: "$T = 860$", mk: "A1" },
        { h: "(c) Only the resistance acts", m: "$-500 = 600a \\Rightarrow a = -\\dfrac56$: a deceleration of $\\dfrac56$ m s$^{-2}$", mk: "B1*" },
        { h: "(d)", m: "$0 = 12.5^2 - 2 \\times \\dfrac56 \\times d$", mk: "M1 A1" },
        { m: "$d = 93.75 \\approx 93.8$ m", mk: "A1" },
        { h: "(e)", m: "e.g. the resistance will not be constant (it depends on speed);", mk: "B1" },
        { m: "the trailer is not a particle / the road may not be level or straight / the trailer may have brakes.", mk: "B1" }
      ], result: "(b) 860 (d) 93.8 m" } },
    { worked: { tag: "exam", title: "The force between a block and the lift floor", src: "AS June 2022 · P2 Q4(b) · 3 marks",
      q: "A lift cage of mass 40 kg carries a block of mass 10 kg and is raised vertically with constant acceleration 0.2 m s$^{-2}$ by a light inextensible rope (the tension was found to be 500 N). Air resistance is ignored. Find the magnitude of the force exerted on the block by the lift cage.",
      steps: [
        { h: "The block alone, up positive", m: "$R - 10g = 10 \\times 0.2$", mk: "M1 A1" },
        { m: "$R = 98 + 2 = 100$ N", mk: "A1", n: "By the third law the block pushes down on the cage floor with 100 N too." }
      ], result: "100 N" } },

    /* ---------------------------------------------------------------- Exam toolkit */
    { page: "Exam toolkit" },
    { callout: { t: "memorise", h: "Connected particles", body: [
      "One force diagram and one equation per particle, each in its own direction of motion.",
      "Same $T$ (light string, smooth pulley); same $a$ (inextensible). Add the equations to remove $T$.",
      "Force on a pulley: $2T$ for parallel strings; otherwise add the two tension vectors.",
      "Slack string: $T = 0$; the free particle keeps its speed and continues under the remaining forces."
    ] } },
    { callout: { t: "mnemonic", h: "\"Same T, same a, own direction\"", body: "The three facts the pulley model gives you." } },
    { callout: { t: "warn", h: "Common losses", body: [
      "Using the whole-system mass over a pulley, where the forces point different ways.",
      "Missing the first-stage rise (from $2h$ to $3h$) when finding a final height.",
      "Writing $T = mg$ for a hanging particle that is accelerating.",
      "Including an internal force (tension, towbar) in a whole-system equation."
    ] } }
  ],
  flashcards: [
    ["Newton's third law?", "If $A$ pushes or pulls $B$, then $B$ pushes or pulls $A$ with an equal and opposite force."],
    ["Why don't third-law pairs cancel?", "They act on different bodies."],
    ["What does \"inextensible\" give in a pulley problem?", "Both particles have the same speed and size of acceleration."],
    ["What does \"smooth pulley\" give?", "The tension is the same either side."],
    ["Masses $4m$ and $3m$ over a pulley: $a$?", "$\\frac{g}{7}$."],
    ["… and $T$?", "$\\frac{24mg}{7}$."],
    ["Force on a pulley with both string parts vertical?", "$2T$."],
    ["What happens to $T$ when the hanging particle hits the floor?", "It becomes zero (the string goes slack)."],
    ["Mass on a smooth table after the string goes slack?", "Moves at constant speed."],
    ["Car-and-trailer acceleration quickly?", "Whole system: external forces = total mass × $a$."],
    ["Equilibrium of a particle?", "Resolve in two perpendicular directions; each sum is zero."]
  ],
  quiz: [
    { q: "A 3 kg and a 2 kg particle hang over a smooth pulley. The acceleration is", opts: ["$\\frac{g}{5}$", "$\\frac{g}{3}$", "$g$", "$\\frac{2g}{5}$"], ans: 0, why: "$(3 - 2)g / 5$." },
    { q: "A 2 kg block on a smooth table is pulled by a 3 kg hanging mass. $a$ is", opts: ["$\\frac{3g}{5}$", "$\\frac{2g}{3}$", "$\\frac{3g}{2}$", "$g$"], ans: 0, why: "$3g = 5a$." },
    { q: "In a car-and-trailer whole-system equation, the towbar tension", opts: ["does not appear", "appears once", "appears twice with the same sign", "equals the driving force"], ans: 0, why: "It is internal and cancels." },
    { q: "The string over a smooth pulley has tension 20 N, both parts vertical. The force on the pulley is", opts: ["40 N", "20 N", "10 N", "0"], ans: 0, why: "$2T$." },
    { q: "Two strings at 30° and 60° to the horizontal hold a 20 N weight. The tension in the 60° string is", opts: ["17.3 N", "10 N", "20 N", "11.5 N"], ans: 0, why: "$10\\sqrt3$." }
  ]
};

/* =====================================================================
   M8.5  Resultant forces and dynamics in a plane
   ===================================================================== */
C["maths:M8.5"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Resultant forces and dynamics in a plane — the whole topic on one page" },
    "Spec 8.5: understand and use addition of forces; resultant forces; dynamics for motion in a plane. Resolve a vector into two components or use a vector diagram — e.g. two or more forces given in magnitude-direction form.",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Add $\\mathbf i$-$\\mathbf j$ forces; the acceleration's magnitude", "4", "AS June 2025 Q2(a)(b)"],
      ["A third force giving constant velocity (equilibrium)", "1", "AS June 2025 Q2(c)"],
      ["The resultant is parallel to a given vector → a relation", "4", "A-level June 2022 Q3(a)"],
      ["Then a displacement from rest: $\\mathbf s = \\frac12\\mathbf a t^2$", "5", "A-level June 2022 Q3(b)"],
      ["Forces in magnitude-direction form: resolve, add, recombine", "4–6", "variations; inside slope and ladder questions"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**Adding forces** — components, magnitude, direction.",
      "**Forces in magnitude-direction form**.",
      "**Dynamics in a plane** — $\\mathbf F = m\\mathbf a$ and then kinematics.",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "Adding forces" },
    { kv: [
      ["Resultant", "the single force with the same effect as all of them: $\\mathbf R = \\mathbf F_1 + \\mathbf F_2 + \\cdots$"],
      ["In components", "add the $\\mathbf i$ parts and the $\\mathbf j$ parts separately"],
      ["Magnitude", "$|\\mathbf R| = \\sqrt{R_x^2 + R_y^2}$"],
      ["Direction", "$\\theta = \\tan^{-1}\\dfrac{R_y}{R_x}$ from $\\mathbf i$ — sketch it to get the quadrant right"],
      ["Parallel to $p\\mathbf i + q\\mathbf j$", "$R_x : R_y = p : q$, i.e. $qR_x = pR_y$"],
      ["Equilibrium", "$\\mathbf R = \\mathbf 0$: a missing force is minus the sum of the others"]
    ] },
    { fig: { x: [-1, 8], y: [-2, 4], w: 460, h: 260, aspect: "equal", axes: { x: "i", y: "j", xt: [2, 4, 6], yt: [-1, 1, 2, 3] },
      items: [
        { vec: [[0, 0], [4, -1]], c: "accent" }, { text: [2.2, -1], t: "F₁ = 4i − j", c: "accent", b: true, size: 12 },
        { vec: [[4, -1], [6, 2]], c: "accent3" }, { text: [6.6, 0.4], t: "F₂ = 2i + 3j", c: "accent3", b: true, size: 12 },
        { vec: [[0, 0], [6, 2]], c: "accent2", w: 2.6 }, { text: [2.4, 1.6], t: "R = 6i + 2j", c: "accent2", b: true, size: 12 },
        { line: [[0, 0], [7.5, 2.5]], c: "muted", dash: true }
      ], cap: "A-level June 2022 with $\\lambda = 2$, $\\mu = 3$: nose to tail, the resultant $6\\mathbf i + 2\\mathbf j$ lies along $3\\mathbf i + \\mathbf j$ (dashed)." } },
    { worked: { tag: "exam", title: "The resultant, the acceleration, a balancing force", src: "AS June 2025 · P2 Q2 · 5 marks",
      q: "A particle $P$ of mass 0.25 kg moves on a smooth horizontal surface under the action of two horizontal forces $\\mathbf F_1 = (3\\mathbf i - 5\\mathbf j)$ N and $\\mathbf F_2 = (-6\\mathbf i + 9\\mathbf j)$ N. **(a)** Find the resultant force on $P$ in terms of $\\mathbf i$ and $\\mathbf j$. **(b)** Find the magnitude of the acceleration of $P$. A third horizontal force $\\mathbf F_3$ is now applied, and under $\\mathbf F_1$, $\\mathbf F_2$ and $\\mathbf F_3$ the particle moves with constant velocity. **(c)** Find $\\mathbf F_3$.",
      steps: [
        { h: "(a)", m: "$\\mathbf R = (-3\\mathbf i + 4\\mathbf j)$ N", mk: "B1" },
        { h: "(b) $\\mathbf R = m\\mathbf a$", m: "$\\mathbf a = \\dfrac{-3\\mathbf i + 4\\mathbf j}{0.25} = -12\\mathbf i + 16\\mathbf j$", mk: "M1" },
        { m: "$|\\mathbf a| = \\sqrt{144 + 256}$", mk: "M1" },
        { m: "$= 20$ m s$^{-2}$", mk: "A1", n: "Or $|\\mathbf R| = 5$, so $|\\mathbf a| = 5 / 0.25$." },
        { h: "(c) Constant velocity: resultant zero", m: "$\\mathbf F_3 = -\\mathbf R = (3\\mathbf i - 4\\mathbf j)$ N", mk: "B1ft" }
      ], result: "(a) $-3\\mathbf i + 4\\mathbf j$ (b) 20 m s$^{-2}$ (c) $3\\mathbf i - 4\\mathbf j$" } },
    { worked: { tag: "exam", title: "Moving along $3\\mathbf i + \\mathbf j$: a relation, then a distance", src: "A-level June 2022 · P3 Q3 · 9 marks",
      q: "[$\\mathbf i$ and $\\mathbf j$ are horizontal unit vectors.] A particle $P$ of mass 4 kg is at rest at $A$ on a smooth horizontal plane. At $t = 0$ two forces $\\mathbf F_1 = (4\\mathbf i - \\mathbf j)$ N and $\\mathbf F_2 = (\\lambda\\mathbf i + \\mu\\mathbf j)$ N are applied. $P$ moves in the direction of $(3\\mathbf i + \\mathbf j)$. **(a)** Show that $\\lambda - 3\\mu + 7 = 0$. At $t = 4$ s, $P$ passes through $B$. Given that $\\lambda = 2$, **(b)** find the length $AB$.",
      steps: [
        { h: "(a) Resultant", m: "$\\mathbf R = (4 + \\lambda)\\mathbf i + (\\mu - 1)\\mathbf j$", mk: "M1 A1" },
        { h: "Starting from rest it moves along $\\mathbf R$, parallel to $3\\mathbf i + \\mathbf j$", m: "$4 + \\lambda = 3(\\mu - 1)$", mk: "M1" },
        { m: "$\\lambda - 3\\mu + 7 = 0$", mk: "A1*" },
        { h: "(b) $\\lambda = 2 \\Rightarrow \\mu = 3$", m: "$\\mathbf R = 6\\mathbf i + 2\\mathbf j$; $\\; \\mathbf a = \\dfrac{\\mathbf R}{4} = 1.5\\mathbf i + 0.5\\mathbf j$", mk: "M1 A1" },
        { h: "From rest", m: "$\\overrightarrow{AB} = \\tfrac12 \\mathbf a (4^2) = 12\\mathbf i + 4\\mathbf j$", mk: "M1 A1" },
        { m: "$AB = \\sqrt{144 + 16} = \\sqrt{160} = 12.6$ m", mk: "A1" }
      ], result: "(b) $4\\sqrt{10} = 12.6$ m" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Forces in magnitude-direction form" },
    { steps: [
      { h: "1. Resolve each force", m: "$P$ at $\\theta$ to $\\mathbf i$ gives $(P\\cos\\theta)\\mathbf i + (P\\sin\\theta)\\mathbf j$; check signs by quadrant." },
      { h: "2. Add the components", m: "$R_x = \\sum P\\cos\\theta$, $\\; R_y = \\sum P\\sin\\theta$" },
      { h: "3. Recombine", m: "$|\\mathbf R| = \\sqrt{R_x^2 + R_y^2}$, direction $\\tan^{-1}(R_y / R_x)$" }
    ] },
    { worked: { tag: "variation", title: "Resultant of two forces at an angle", q: "Two forces act on a particle: 10 N due east and 6 N on a bearing of 060°. Find the magnitude and bearing of the resultant.",
      steps: [
        { h: "Components (east, north)", m: "10 N: $(10, 0)$; $\\;$ 6 N at 30° above east: $(6\\cos30°, 6\\sin30°) = (5.196, 3)$" },
        { h: "Add", m: "$\\mathbf R = (15.196, 3)$" },
        { m: "$|\\mathbf R| = \\sqrt{15.196^2 + 3^2} = 15.5$ N; angle above east $\\tan^{-1}\\frac{3}{15.196} = 11.2°$", n: "Bearing $90° - 11.2° = 078.8°$." }
      ], result: "15.5 N, bearing 079°" } },
    { worked: { tag: "variation", title: "Accelerating under three forces", q: "A particle of mass 3 kg on a smooth horizontal plane is acted on by forces of 12 N on a bearing of 000°, 8 N on a bearing of 090° and 20 N on a bearing of 225°. Find its acceleration.",
      steps: [
        { h: "Components (east, north)", m: "$(0, 12) + (8, 0) + (-20\\cos45°, -20\\sin45°) = (8 - 14.14,\\; 12 - 14.14) = (-6.14, -2.14)$" },
        { h: "Magnitude", m: "$|\\mathbf R| = 6.50$ N, so $a = \\dfrac{6.50}{3} = 2.17$ m s$^{-2}$" },
        { h: "Direction", m: "west and slightly south: $\\tan^{-1}\\frac{2.14}{6.14} = 19.2°$ south of west, a bearing of $270° - 19.2° = 250.8°$" }
      ], result: "2.17 m s$^{-2}$ on a bearing of 251°" } },
    { worked: { tag: "variation", title: "Equilibrium: find the missing force", q: "A particle is in equilibrium under $\\mathbf F_1 = (5\\mathbf i + 2\\mathbf j)$ N, $\\mathbf F_2 = (-3\\mathbf i + 7\\mathbf j)$ N and $\\mathbf F_3$. Find $\\mathbf F_3$, its magnitude and its direction.",
      steps: [
        { h: "Sum to zero", m: "$\\mathbf F_3 = -(\\mathbf F_1 + \\mathbf F_2) = -(2\\mathbf i + 9\\mathbf j) = -2\\mathbf i - 9\\mathbf j$" },
        { m: "$|\\mathbf F_3| = \\sqrt{85} = 9.22$ N, at $\\tan^{-1}\\frac92 = 77.5°$ below the $-\\mathbf i$ direction" }
      ], result: "$-2\\mathbf i - 9\\mathbf j$" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Dynamics in a plane" },
    "Once the resultant is known, $\\mathbf a = \\mathbf R / m$ and the constant-acceleration vector equations (M7.3) take over. A particle **starting from rest** always moves along the line of the resultant force; one already moving generally curves.",
    { worked: { tag: "variation", title: "Force, then velocity and position", q: "A particle of mass 2 kg is at rest at the origin when forces $(3\\mathbf i - \\mathbf j)$ N and $(1\\mathbf i + 5\\mathbf j)$ N start to act. Find its velocity and position after 3 s, and its speed then.",
      steps: [
        { h: "$\\mathbf a$", m: "$\\mathbf R = 4\\mathbf i + 4\\mathbf j \\Rightarrow \\mathbf a = 2\\mathbf i + 2\\mathbf j$" },
        { h: "$\\mathbf v = \\mathbf a t$", m: "$\\mathbf v = 6\\mathbf i + 6\\mathbf j$, speed $6\\sqrt2 = 8.49$ m s$^{-1}$" },
        { h: "$\\mathbf r = \\frac12 \\mathbf a t^2$", m: "$\\mathbf r = 9\\mathbf i + 9\\mathbf j$" }
      ], result: "$6\\mathbf i + 6\\mathbf j$, $9\\mathbf i + 9\\mathbf j$, 8.49 m s$^{-1}$" } },

    /* ---------------------------------------------------------------- Exam toolkit */
    { page: "Exam toolkit" },
    { callout: { t: "memorise", h: "Resultants", body: [
      "Add components. Magnitude by Pythagoras. Direction from a sketch and $\\tan^{-1}$.",
      "Parallel to $p\\mathbf i + q\\mathbf j$: components in the ratio $p : q$.",
      "Equilibrium / constant velocity: the sum is $\\mathbf 0$.",
      "Then $\\mathbf a = \\mathbf R / m$ and M7.3."
    ] } },
    { callout: { t: "mnemonic", h: "\"Resolve, add, recombine\"", body: "Every magnitude-direction force problem is these three steps." } },
    { callout: { t: "warn", h: "Common losses", body: [
      "Adding magnitudes instead of vectors (10 N + 6 N is not 16 N unless they are parallel).",
      "A wrong quadrant for the direction.",
      "Using $\\mathbf r = \\mathbf u t + \\frac12 \\mathbf a t^2$ with $\\mathbf u \\ne \\mathbf 0$ when the particle starts from rest — or forgetting $\\mathbf u$ when it does not."
    ] } }
  ],
  flashcards: [
    ["Resultant of $(2\\mathbf i + 3\\mathbf j)$ N and $(4\\mathbf i - 7\\mathbf j)$ N?", "$(6\\mathbf i - 4\\mathbf j)$ N."],
    ["Magnitude of $(5\\mathbf i - 12\\mathbf j)$ N?", "13 N."],
    ["Condition for $a\\mathbf i + b\\mathbf j$ to be parallel to $3\\mathbf i + \\mathbf j$?", "$a = 3b$."],
    ["A particle in equilibrium under $\\mathbf F_1$, $\\mathbf F_2$, $\\mathbf F_3$: $\\mathbf F_3$?", "$-(\\mathbf F_1 + \\mathbf F_2)$."],
    ["Components of 10 N at 30° above $\\mathbf i$?", "$(8.66\\mathbf i + 5\\mathbf j)$ N."],
    ["A particle from rest under a constant force moves …?", "Along the line of the resultant force."],
    ["$|\\mathbf a|$ for $|\\mathbf R| = 5$ N on 0.25 kg?", "20 m s$^{-2}$."],
    ["Displacement from rest after $t$ under constant $\\mathbf a$?", "$\\frac12 \\mathbf a t^2$."]
  ],
  quiz: [
    { q: "$(3\\mathbf i + 4\\mathbf j)$ N and $(\\mathbf i - 7\\mathbf j)$ N act. The resultant's magnitude is", opts: ["5 N", "7 N", "25 N", "1 N"], ans: 0, why: "$4\\mathbf i - 3\\mathbf j$." },
    { q: "Forces of 3 N and 4 N at right angles have a resultant of", opts: ["5 N", "7 N", "1 N", "12 N"], ans: 0, why: "Pythagoras." },
    { q: "For constant velocity under three forces, the third is", opts: ["minus the sum of the other two", "the sum of the other two", "zero", "any force"], ans: 0, why: "Resultant zero." },
    { q: "$(4 + \\lambda)\\mathbf i + 2\\mathbf j$ is parallel to $\\mathbf i + \\mathbf j$ when $\\lambda =$", opts: ["$-2$", "2", "0", "6"], ans: 0, why: "$4 + \\lambda = 2$." }
  ]
};

/* =====================================================================
   M8.6  Friction
   ===================================================================== */
C["maths:M8.6"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Friction — the whole topic on one page" },
    "Spec 8.6: understand and use the $F \\le \\mu R$ model for friction; coefficient of friction; motion of a body on a rough surface; limiting friction and statics. $F = \\mu R$ when the body is moving; $F \\le \\mu R$ in equilibrium.",
    "Friction appears in almost every A-level paper, usually with an angled force or a slope:",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Limiting equilibrium on a horizontal plane", "3", "A-level June 2024 Q1"],
      ["Pulled at an angle: reaction, friction, acceleration", "6–8", "A-level 2018 Q7, Specimen Q3"],
      ["Pulling vs pushing at the same angle", "2", "A-level 2018 Q7(b)"],
      ["On the point of sliding on a slope: $\\mu = \\tan\\alpha$", "6", "A-level Oct 2020 Q1"],
      ["Held on a slope by a horizontal force: friction's size and direction", "4", "A-level 2022 Q2(a)"],
      ["Sliding down a rough slope: acceleration (in terms of $\\mu$)", "6–7", "A-level 2022 Q2(b), 2024 Q3"],
      ["Does it move again after stopping? Compare $mg\\sin\\alpha$ with $\\mu R$", "3", "A-level Specimen Q3(c)"],
      ["Slowing to rest on a rough plane: a distance", "4–5", "A-level 2025 Q2(d)"],
      ["Rough slope with a pulley", "12", "A-level Oct 2021 Q2 (M8.4)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**The friction model** — $F \\le \\mu R$, limiting, direction.",
      "**Rough horizontal surfaces** — angled forces, pulling and pushing.",
      "**Rough slopes** — equilibrium, sliding, will it move?",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "The friction model" },
    { callout: { t: "memorise", h: "$F \\le \\mu R$", body: [
      "Friction acts **along** the surface, opposing the motion — or, at rest, opposing the way the body would otherwise move.",
      "At rest it takes **whatever value is needed** for equilibrium, up to a maximum $\\mu R$.",
      "**Limiting** (on the point of sliding) or **moving**: $F = \\mu R$.",
      "$\\mu$ is the coefficient of friction: no units, $\\mu \\ge 0$; $\\mu = 0$ is smooth."
    ] } },
    { fig: { x: [0, 24], y: [0, 14], w: 480, h: 230, axes: { x: "applied force P (N)", y: "friction F (N)", xt: [5, 10, 15, 20], yt: [{ v: 10, label: "μR" }] },
      items: [
        { line: [[0, 0], [10, 10]], c: "accent", w: 2.4 }, { line: [[10, 10], [22, 10]], c: "accent2", w: 2.4 },
        { text: [4.5, 7.5], t: "at rest: F = P", c: "accent", b: true, size: 12 },
        { text: [16, 11.8], t: "sliding: F = μR", c: "accent2", b: true, size: 12 },
        { pt: [10, 10], label: "limiting", pos: "se", i: false }
      ], cap: "Push harder on a resting block and friction matches you — until it reaches its limit $\\mu R$. Beyond that the block slides and friction stays at $\\mu R$." } },
    { callout: { t: "miscon", h: "\"Friction is always $\\mu R$\"", body: "Only when limiting or sliding. A 20 N block with $\\mu = 0.5$ pushed by 4 N stays still with friction **4 N**, not 10 N. Always find the friction needed first, then compare it with $\\mu R$." } },
    { worked: { tag: "exam", title: "Limiting equilibrium on a horizontal plane", src: "A-level June 2024 · P3 Q1 · 3 marks",
      q: "A particle $P$ of mass 0.5 kg is at rest on a rough horizontal plane. **(a)** Find the magnitude of the normal reaction of the plane on $P$. The coefficient of friction between $P$ and the plane is $\\frac27$. A horizontal force of magnitude $X$ newtons is applied to $P$, and $P$ is now in limiting equilibrium. **(b)** Find $X$.",
      steps: [
        { h: "(a)", m: "$R = 0.5g = 4.9$ N", mk: "B1" },
        { h: "(b) Limiting: $X = F = \\mu R$", m: "$X = \\tfrac27 \\times 4.9$", mk: "M1" },
        { m: "$X = 1.4$", mk: "A1" }
      ], result: "(a) 4.9 N (b) 1.4" } },
    { worked: { tag: "variation", title: "Does it move?", q: "A box of mass 5 kg rests on a rough horizontal floor with $\\mu = 0.4$. A horizontal force of $P$ N is applied. Find the friction and say whether the box moves when (a) $P = 15$, (b) $P = 25$; in (b) find the acceleration.",
      steps: [
        { h: "Maximum friction", m: "$R = 5g = 49$, $\\; \\mu R = 19.6$ N" },
        { h: "(a) $15 < 19.6$", m: "stays at rest; friction $= 15$ N" },
        { h: "(b) $25 > 19.6$", m: "slides; friction $= 19.6$ N; $\\; 25 - 19.6 = 5a \\Rightarrow a = 1.08$ m s$^{-2}$" }
      ], result: "(a) at rest, 15 N (b) 1.08 m s$^{-2}$" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Rough horizontal surfaces" },
    { worked: { tag: "exam", title: "A crate pulled by a handle; pushed instead", src: "A-level June 2018 · P3 Q7 · 8 marks",
      q: "A wooden crate of mass 20 kg is pulled in a straight line along a rough horizontal floor by a handle inclined at $\\alpha$ to the floor, where $\\tan\\alpha = \\frac34$. The tension in the handle is 40 N and the coefficient of friction is 0.14. Modelling the crate as a particle and the handle as a light rod, **(a)** find the acceleration of the crate. The crate is now pushed along the same floor using the handle, at the same angle, with a thrust of 40 N. **(b)** Explain briefly why the acceleration would now be less than in (a).",
      steps: [
        { h: "(a) Vertical", m: "$R + 40\\sin\\alpha = 20g \\Rightarrow R = 196 - 24 = 172$", mk: "M1 A1" },
        { h: "Sliding", m: "$F = 0.14 \\times 172 = 24.08$", mk: "M1" },
        { h: "Horizontal", m: "$40\\cos\\alpha - F = 20a \\Rightarrow 32 - 24.08 = 20a$", mk: "M1 A1" },
        { m: "$a = 0.396 = 0.40$ m s$^{-2}$", mk: "A1" },
        { h: "(b)", m: "Pushing, the vertical component of the thrust acts **downwards**, so the normal reaction increases,", mk: "B1" },
        { m: "so the friction ($\\mu R$) increases while the forward component is unchanged — the resultant force, and the acceleration, are smaller.", mk: "B1" }
      ], result: "(a) 0.40 m s$^{-2}$" } },
    { fig: { w: 540, h: 170, items: [].concat(
      [ground(10, 260, 140), box(120, 118, 70, 44, 0), { text: [120, 118], t: "pull", b: true, size: 11, c: "text" }],
      F(155, 108, 36.87, 70, "40 N", { c: "accent" }),
      F(120, 96, 90, 34, "R = 172", { c: "text2", dy: -2 }),
      [ground(280, 530, 140), box(420, 118, 70, 44, 0), { text: [420, 118], t: "push", b: true, size: 11, c: "text" }],
      [{ vec: [[330, 70], [385, 104]], c: "accent", w: 2.2 }, { text: [322, 60], t: "40 N", b: true, c: "accent" }],
      F(420, 96, 90, 34, "R = 220", { c: "text2", dy: -2 })
    ), cap: "A-level June 2018: pulling lifts the crate ($R = 172$ N); pushing presses it down ($R = 196 + 24 = 220$ N) — more friction, less acceleration." } },
    { worked: { tag: "exam", title: "Sliding to rest: the stopping distance", src: "A-level June 2025 · P3 Q2(d)(e) · 5 marks",
      q: "A small box $B$ of mass 2 kg moves on a rough horizontal plane. At the point $O$ the force dragging it is removed. After this the box is modelled as a particle, air resistance is negligible, the coefficient of friction is 0.2, the speed of the box at $O$ is 4 m s$^{-1}$ and it comes to rest at $X$. **(d)** Find the length $OX$. **(e)** State one limitation of the model, apart from ignoring air resistance, that could affect (d).",
      steps: [
        { h: "(d) Friction now", m: "$R = 2g = 19.6$, $\\; F = 0.2 \\times 19.6 = 3.92$", mk: "M1 B1" },
        { h: "Deceleration", m: "$3.92 = 2a \\Rightarrow a = 1.96$; $\\; 0 = 4^2 - 2(1.96)s$", mk: "M1" },
        { m: "$OX = \\dfrac{16}{3.92} = 4.08$ m", mk: "A1", n: "The mass cancels: deceleration $= \\mu g$." },
        { h: "(e)", m: "e.g. the coefficient of friction may not be constant along the plane; the box is not a particle.", mk: "B1" }
      ], result: "(d) 4.08 m" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Rough slopes" },
    { callout: { t: "memorise", h: "On a slope", body: [
      "$R = mg\\cos\\alpha$ (plus or minus any force with a component perpendicular to the slope).",
      "Sliding down: friction acts **up** the slope; $mg\\sin\\alpha - \\mu R = ma$.",
      "Pushed up: friction acts **down** the slope.",
      "On the point of sliding with no other force: $mg\\sin\\alpha = \\mu mg\\cos\\alpha \\Rightarrow \\mu = \\tan\\alpha$, whatever the mass.",
      "A body at rest slides only if $mg\\sin\\alpha > \\mu mg\\cos\\alpha$, i.e. $\\tan\\alpha > \\mu$."
    ] } },
    { worked: { tag: "exam", title: "On the point of sliding: show $\\mu = \\frac34$", src: "A-level Oct 2020 · P3 Q1(a)(b) · 6 marks",
      q: "A rough plane is inclined at $\\alpha$ to the horizontal, where $\\tan\\alpha = \\frac34$. A brick $P$ of mass $m$ on the plane is in equilibrium and on the point of sliding down the plane; the coefficient of friction is $\\mu$. Modelling $P$ as a particle, **(a)** find, in terms of $m$ and $g$, the magnitude of the normal reaction of the plane on $P$; **(b)** show that $\\mu = \\frac34$.",
      steps: [
        { h: "(a) Perpendicular", m: "$R = mg\\cos\\alpha$", mk: "M1" },
        { m: "$R = \\dfrac{4mg}{5}$", mk: "A1" },
        { h: "(b) Along the slope (friction up it)", m: "$F = mg\\sin\\alpha = \\dfrac{3mg}{5}$", mk: "M1 A1" },
        { h: "Limiting", m: "$F = \\mu R \\Rightarrow \\dfrac{3mg}{5} = \\mu \\cdot \\dfrac{4mg}{5}$", mk: "M1" },
        { m: "$\\mu = \\dfrac34$", mk: "A1*" }
      ], result: "(a) $\\frac{4mg}{5}$" } },
    { worked: { tag: "exam", title: "Sliding down: show the acceleration is $\\frac{g(5 - 12\\mu)}{13}$", src: "A-level June 2024 · P3 Q3 · 7 marks",
      q: "A particle $P$ of mass $m$ is held at rest on a rough plane inclined at $\\alpha$ to the horizontal, where $\\tan\\alpha = \\frac{5}{12}$. The coefficient of friction is $\\mu$, where $\\mu < \\frac{5}{12}$. $P$ is released and slides down the plane; air resistance is negligible. **(a)** Find, in terms of $m$ and $g$, the normal reaction on $P$. **(b)** Show that the acceleration of $P$ down the plane is $\\frac{g(5 - 12\\mu)}{13}$. **(c)** State what would happen to $P$ if it were released from rest with $\\mu \\ge \\frac{5}{12}$.",
      steps: [
        { h: "(a)", m: "$R = mg\\cos\\alpha$", mk: "M1" },
        { m: "$= \\dfrac{12mg}{13}$", mk: "A1" },
        { h: "(b) Down the slope", m: "$mg\\sin\\alpha - \\mu R = ma$", mk: "M1" },
        { m: "$\\dfrac{5mg}{13} - \\mu \\cdot \\dfrac{12mg}{13} = ma$", mk: "A1 M1" },
        { m: "$a = \\dfrac{g(5 - 12\\mu)}{13}$", mk: "A1*" },
        { h: "(c)", m: "It would stay at rest: the friction available is enough to hold it ($\\tan\\alpha \\le \\mu$).", mk: "B1" }
      ], result: "$a = \\frac{g(5 - 12\\mu)}{13}$" } },
    { worked: { tag: "exam", title: "Held by a horizontal force; then released", src: "A-level June 2022 · P3 Q2 · 10 marks",
      q: "A rough plane is inclined at $\\alpha$ to the horizontal, where $\\tan\\alpha = \\frac34$. A small block $B$ of mass 5 kg is held in equilibrium on the plane by a horizontal force of magnitude $X$ newtons, acting in the vertical plane containing a line of greatest slope (pushing the block towards the plane). The magnitude of the normal reaction on $B$ is 68.6 N. Modelling $B$ as a particle, **(a)** (i) find the magnitude of the frictional force on $B$, (ii) state its direction. The horizontal force is removed and $B$ moves down the plane. Given that the coefficient of friction is 0.5, **(b)** find the acceleration of $B$ down the plane.",
      steps: [
        { h: "(a)(i) Perpendicular", m: "$68.6 = 5g\\cos\\alpha + X\\sin\\alpha = 39.2 + 0.6X \\Rightarrow X = 49$", mk: "M1 A1" },
        { h: "Along the slope", m: "up: $X\\cos\\alpha = 39.2$; $\\;$ down: $5g\\sin\\alpha = 29.4$; $\\;$ friction $= 39.2 - 29.4 = 9.8$ N", mk: "A1" },
        { h: "(a)(ii)", m: "Down the plane — without it, $X$ would push the block up.", mk: "A1" },
        { h: "(b) New reaction", m: "$R = 5g\\cos\\alpha = 39.2$", mk: "M1 A1" },
        { h: "Sliding", m: "$F = 0.5 \\times 39.2 = 19.6$", mk: "M1 A1" },
        { h: "Down the slope", m: "$29.4 - 19.6 = 5a$", mk: "M1" },
        { m: "$a = 1.96$ m s$^{-2}$", mk: "A1" }
      ], result: "(a) 9.8 N, down the plane (b) 1.96 m s$^{-2}$" } },
    { fig: { w: 520, h: 240, items: (function () {
      var x0 = 50, y0 = 225, d = 36.87, p = along(x0, y0, d, 200, 20), it = [].concat(slope(x0, y0, 280, d, "α"), [box(p[0], p[1], 46, 34, d)]);
      it = it.concat(F(p[0] - 90, p[1], 0, 62, "X", { c: "accent", dy: -12, dx: -40 }));
      it = it.concat(F(p[0], p[1], 180 + d, 64, "F = 9.8", { c: "accent3", dx: -24, dy: 10 }));
      it = it.concat(F(p[0], p[1], 90 + d, 62, "R = 68.6", { c: "text2", dx: -8 }));
      it = it.concat(F(p[0], p[1], 270, 60, "5g", { c: "accent2", dx: 16 }));
      return it;
    })(), cap: "A-level June 2022: $X\\cos\\alpha = 39.2$ up the slope beats $5g\\sin\\alpha = 29.4$, so friction (9.8 N) acts down it." } },
    { worked: { tag: "exam", title: "Pulled up a rough slope by a rope at an angle; will it slide back?", src: "A-level Specimen · P3 Q3 · 11 marks",
      q: "A small box of mass 3 kg moves on a rough plane inclined at 20° to the horizontal. It is pulled up a line of greatest slope by a rope making 30° with the plane, in the vertical plane containing the line of greatest slope. The coefficient of friction is 0.3 and the tension is 25 N. The box is a particle, the rope a light inextensible string, air resistance ignored. **(a)** Find the acceleration of the box. **(b)** Suggest one improvement to the model. The rope now breaks and the box slows down and comes to rest. **(c)** Show that, after the box comes to rest, it immediately starts to move down the plane.",
      steps: [
        { h: "(a) Perpendicular", m: "$R + 25\\sin30° = 3g\\cos20° \\Rightarrow R = 15.13$", mk: "M1 A1" },
        { h: "Along, up the slope", m: "$25\\cos30° - 3g\\sin20° - F = 3a$", mk: "M1 A1" },
        { h: "Sliding", m: "$F = 0.3R = 4.54$", mk: "B1" },
        { m: "$21.65 - 10.06 - 4.54 = 3a \\Rightarrow a = 2.35$ m s$^{-2}$", mk: "M1 A1" },
        { h: "(b)", m: "e.g. include air resistance; allow for the weight of the rope; do not model the box as a particle.", mk: "B1" },
        { h: "(c) At rest, no rope", m: "$R = 3g\\cos20°$, so $F_{\\max} = 0.9g\\cos20° = 8.29$ N", mk: "B1" },
        { m: "Down the slope: $3g\\sin20° = 10.06$ N, and $10.06 > 8.29$", mk: "M1" },
        { m: "so friction cannot hold it: the box moves down the plane.", mk: "A1*" }
      ], result: "(a) 2.35 m s$^{-2}$" } },
    { fig: { w: 520, h: 230, items: (function () {
      var x0 = 40, y0 = 210, d = 20, p = along(x0, y0, d, 250, 20), it = [].concat(slope(x0, y0, 440, d, "20°"), [box(p[0], p[1], 50, 34, d)]);
      it = it.concat(F(p[0], p[1], d + 30, 90, "25 N", { c: "accent" }));
      it.push({ arc: [p[0], p[1], 40, d, d + 30], label: "30°", c: "accent3" });
      it = it.concat(F(p[0], p[1], 180 + d, 60, "F", { c: "accent3", dx: -6 }));
      it = it.concat(F(p[0], p[1], 90 + d, 55, "R", { c: "text2" }));
      it = it.concat(F(p[0], p[1], 270, 60, "3g", { c: "accent2", dx: 16 }));
      return it;
    })(), cap: "A-level Specimen: the rope's 30° is measured from the slope, so $25\\cos30°$ is along it and $25\\sin30°$ lifts the box off it." } },

    /* ---------------------------------------------------------------- Exam toolkit */
    { page: "Exam toolkit" },
    { callout: { t: "memorise", h: "The friction routine", body: [
      "1. $R$ from resolving perpendicular to the surface (include every force with a perpendicular part).",
      "2. Moving or limiting: $F = \\mu R$, against the motion. At rest: find the $F$ needed and check $F \\le \\mu R$.",
      "3. $F = ma$ (or equilibrium) along the surface."
    ] } },
    { callout: { t: "mnemonic", h: "\"R first, then μR\"", body: "Never write $\\mu mg$ until you have checked that $R = mg$." } },
    { callout: { t: "warn", h: "Common losses", body: [
      "$F = \\mu mg$ on a slope or with an angled force.",
      "Friction in the wrong direction (it opposes the motion, or the tendency to move).",
      "Assuming $F = \\mu R$ for a body that is at rest and not limiting.",
      "Forgetting that $\\mu$ has no units."
    ] } }
  ],
  flashcards: [
    ["The friction model?", "$F \\le \\mu R$; $F = \\mu R$ when moving or on the point of moving."],
    ["Direction of friction?", "Along the surface, opposing motion or the tendency to move."],
    ["What is limiting equilibrium?", "At rest, with friction at its maximum $\\mu R$."],
    ["On the point of sliding on a slope (no other forces): $\\mu$?", "$\\tan\\alpha$."],
    ["Deceleration of a body sliding on a rough horizontal plane?", "$\\mu g$."],
    ["Acceleration sliding down a rough slope?", "$g(\\sin\\alpha - \\mu\\cos\\alpha)$."],
    ["Why is pushing at an angle worse than pulling?", "Pushing down increases $R$, so friction increases."],
    ["When does a body at rest on a slope start sliding?", "When $\\tan\\alpha > \\mu$."],
    ["Units of $\\mu$?", "None."],
    ["5 kg block, $\\mu = 0.4$, pushed by 15 N. Friction?", "15 N (it stays at rest; $\\mu R = 19.6$)."]
  ],
  quiz: [
    { q: "$\\mu = 0.4$, $R = 50$ N. The maximum friction is", opts: ["20 N", "125 N", "50 N", "0.4 N"], ans: 0, why: "$\\mu R$." },
    { q: "A block at rest with $\\mu R = 12$ N is pushed by 7 N. Friction is", opts: ["7 N", "12 N", "5 N", "19 N"], ans: 0, why: "Only what is needed." },
    { q: "A block slides down a rough slope. Friction acts", opts: ["up the slope", "down the slope", "perpendicular to it", "vertically"], ans: 0, why: "Against the motion." },
    { q: "A particle is on the point of sliding on a slope at 30°. $\\mu$ is", opts: ["$\\tan30° = 0.577$", "$\\sin30° = 0.5$", "$\\cos30° = 0.866$", "0.3"], ans: 0, why: "$\\mu = \\tan\\alpha$." },
    { q: "A 2 kg box slides on a floor with $\\mu = 0.25$. Its deceleration is", opts: ["2.45 m s$^{-2}$", "4.9 m s$^{-2}$", "0.25 m s$^{-2}$", "9.8 m s$^{-2}$"], ans: 0, why: "$\\mu g$." }
  ]
};

/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
