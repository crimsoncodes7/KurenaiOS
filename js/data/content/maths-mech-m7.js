/* Kurenai OS — deep content: Mechanics, sections M6 (Quantities and units
   in mechanics) and M7 (Kinematics) at full A-level depth. Each topic here
   REPLACES the outline entry the base file used to carry: every question
   shape Edexcel has set on units and modelling, the language of
   kinematics, motion graphs, constant acceleration (scalar and vector),
   calculus in kinematics and projectiles (9MA0 Paper 3 Section B, 8MA0
   Paper 2 Section B, June 2018–2025, the Oct/Nov 2020–21 series and the
   Specimens) is explained and then worked through with Edexcel M1/A1/B1
   marks. Past-paper item banks stay in bank-maths-mech.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---- figure helpers ---- */

/* a velocity-time (or speed-time) graph through the corners pts = [[t, v]],
   on data axes; o.area shades the region under it, o.marks = [[t, v,
   label, pos]] labels corners, o.extra adds items */
function vtFig(pts, o) {
  o = o || {};
  var it = [], i, tmax = 0, vmin = 0, vmax = 0;
  pts.forEach(function (p) { tmax = Math.max(tmax, p[0]); vmax = Math.max(vmax, p[1]); vmin = Math.min(vmin, p[1]); });
  if (o.area) it.push({ poly: pts.concat([[pts[pts.length - 1][0], 0], [pts[0][0], 0]]), fill: o.areaC || "accent", alpha: 0.14, c: "line", w: 0.1 });
  for (i = 0; i + 1 < pts.length; i++) it.push({ line: [pts[i], pts[i + 1]], c: o.c || "accent", w: 2.4 });
  (o.marks || []).forEach(function (m) { it.push({ pt: [m[0], m[1]], label: m[2], pos: m[3] || "n", r: 3, c: "accent2", i: false }); });
  var span = (vmax - vmin) || 1;
  return { x: o.x || [0, tmax * 1.1], y: o.y || [vmin < 0 ? vmin - span * 0.18 : 0, vmax + span * 0.25], w: o.w || 500, h: o.h || 230,
    axes: { x: o.xl || "t (s)", y: o.yl || "v (m s⁻¹)", xt: o.xt, yt: o.yt },
    items: it.concat(o.extra || []), cap: o.cap };
}
/* a vertical line diagram for motion up and down: levels = [[height,
   label]], drawn to scale between lo and hi on the page */
function vertFig(levels, o) {
  o = o || {};
  var lo = o.lo, hi = o.hi, top = 22, bot = (o.h || 260) - 24;
  function Yp(h) { return bot - (h - lo) / (hi - lo) * (bot - top); }
  var it = [{ line: [[60, Yp(lo)], [60, Yp(hi)]], c: "line", w: 1.2 }];
  if (o.ground != null) it.push({ line: [[20, Yp(o.ground)], [o.w ? o.w - 20 : 380, Yp(o.ground)]], c: "muted", w: 2 });
  levels.forEach(function (l) {
    it.push({ line: [[54, Yp(l[0])], [66, Yp(l[0])]], c: "text2", w: 1.4 });
    it.push({ text: [72, Yp(l[0])], t: l[1], pos: "e", size: 12, c: l[2] || "text", off: 2 });
  });
  (o.paths || []).forEach(function (p) {
    it.push({ line: [[p[0], Yp(p[1])], [p[0], Yp(p[2])]], arrow: true, c: p[4] || "accent", w: 2.2 });
    if (p[3]) it.push({ text: [p[0] + 8, (Yp(p[1]) + Yp(p[2])) / 2], t: p[3], pos: "e", size: 11.5, c: p[4] || "accent", off: 2 });
  });
  return { w: o.w || 400, h: o.h || 260, items: it.concat(o.extra || []), cap: o.cap };
}
/* the path of a projectile launched from (0, h) with velocity (ux, uy),
   g = 9.8 unless o.g, from t = 0 to t1, on data axes in metres */
function projFig(ux, uy, h, t1, o) {
  o = o || {};
  var g = o.g || 9.8, xr = ux * t1, top = h + (uy > 0 ? uy * uy / (2 * g) : 0), it = [];
  if (h > 0) it.push({ line: [[0, 0], [0, h]], c: "muted", w: 2 });
  it.push({ line: [[o.xmin != null ? o.xmin : -xr * 0.06, 0], [xr * 1.08, 0]], c: "muted", w: 2 });
  it.push({ param: { x: ux + "*t", y: h + "+" + uy + "*t-" + (g / 2) + "*t^2" }, t: [0, t1], c: "accent", w: 2.4 });
  var L = o.vlen || xr * 0.16;
  var sp = Math.sqrt(ux * ux + uy * uy);
  it.push({ vec: [[0, h], [ux / sp * L, h + uy / sp * L * (o.vy || 1)]], label: o.ulabel || "", lpos: 0.9, loff: -12 });
  return { x: o.x || [-xr * 0.08, xr * 1.12], y: o.y || [0, top * 1.22 + 0.5], w: o.w || 500, h: o.h || 240, aspect: o.aspect,
    axes: { x: o.xl || "x (m)", y: o.yl || "y (m)", xt: o.xt, yt: o.yt },
    items: it.concat(o.extra || []), cap: o.cap };
}

/* =====================================================================
   M6.1  Quantities, units and modelling
   ===================================================================== */
C["maths:M6.1"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Quantities, units and modelling — the whole topic on one page" },
    "Spec 6.1: understand and use the **fundamental** S.I. quantities and units (length, time, mass) and the **derived** ones (velocity, acceleration, force, weight, moment); convert one unit into another, e.g. km h$^{-1}$ into m s$^{-1}$.",
    "Section 6 is rarely a question on its own, but it is marked in almost every Mechanics question: a unit asked for, a value of $g$ to use, an accuracy to give, and — nearly always — a last mark on the **model** itself.",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["State a value **with its units**", "1–2", "A-level June 2024 Q2(a)"],
      ["Convert units before using a formula (km → m, km h$^{-1}$ → m s$^{-1}$, tonnes → kg)", "inside a question", "AS June 2022 Q2 (15 km), every connected-particle question"],
      ["Use $g = 9.8$ (or the value given) and round to 2 or 3 s.f.", "penalised once", "every paper"],
      ["Suggest a **refinement** / state a **limitation** of the model", "1 (B1, AO 3.5c)", "nearly every question — AS 2018 Q7, 2019 Q1, 2020 Q1, 2022 Q1–Q2, A-level Specimen Q5 …"],
      ["How would a refined value compare? (air resistance included)", "1 (B1, AO 3.5a)", "AS 2019 Q1(d), 2020 Q1(e), 2022 Q1(d); A-level Oct 2020 Q5(c), 2022 Q5(c), 2024 Q5(d)"],
      ["Explain what an assumption (\"light\", \"inextensible\", \"smooth\", \"particle\") means for the working", "1", "connected particles, moments"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**S.I. units** — fundamental and derived quantities, conversions.",
      "**$g$, accuracy and given answers** — what the rubric expects.",
      "**Modelling** — the vocabulary, the refinements that score and the ones that do not, and how a refinement moves an answer.",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "S.I. units" },
    { h: "1.1  Fundamental quantities" },
    { kv: [
      ["Length", "metre, **m**"],
      ["Time", "second, **s**"],
      ["Mass", "kilogram, **kg** (not the gram)"]
    ] },
    { h: "1.2  Derived quantities" },
    { table: { head: ["Quantity", "Defined as", "S.I. unit"], rows: [
      ["Velocity (speed)", "rate of change of displacement (distance)", "m s$^{-1}$"],
      ["Acceleration", "rate of change of velocity", "m s$^{-2}$"],
      ["Force", "mass × acceleration ($F = ma$)", "newton, N $= $ kg m s$^{-2}$"],
      ["Weight", "the force of gravity on a mass, $W = mg$", "N"],
      ["Moment", "force × perpendicular distance", "N m"]
    ] } },
    { callout: { t: "tip", h: "How the units are built", body: "A derived unit follows its definition: velocity is metres **per** second, so m s$^{-1}$; acceleration is (m s$^{-1}$) per second, so m s$^{-2}$; a newton is the force that gives 1 kg an acceleration of 1 m s$^{-2}$, so 1 N = 1 kg m s$^{-2}$. Mark schemes accept m/s and m/s² too." } },
    { h: "1.3  Conversions" },
    { table: { head: ["From", "To", "Do"], rows: [
      ["km h$^{-1}$", "m s$^{-1}$", "$\\times 1000 \\div 3600$, i.e. $\\div 3.6$"],
      ["m s$^{-1}$", "km h$^{-1}$", "$\\times 3.6$"],
      ["km", "m", "$\\times 1000$"],
      ["cm", "m", "$\\div 100$"],
      ["g", "kg", "$\\div 1000$"],
      ["tonne", "kg", "$\\times 1000$"],
      ["minutes, hours", "s", "$\\times 60$, $\\times 3600$"],
      ["kN", "N", "$\\times 1000$"]
    ] } },
    { fig: { w: 440, h: 110, items: [
      { poly: [[20, 30], [150, 30], [150, 78], [20, 78]], c: "accent", w: 1.6 },
      { text: [85, 54], t: "km h⁻¹", size: 14, b: true, c: "text" },
      { poly: [[290, 30], [420, 30], [420, 78], [290, 78]], c: "accent", w: 1.6 },
      { text: [355, 54], t: "m s⁻¹", size: 14, b: true, c: "text" },
      { line: [[160, 44], [280, 44]], arrow: true, c: "accent2", w: 2 },
      { text: [220, 32], t: "÷ 3.6", size: 13, b: true, c: "accent2" },
      { line: [[280, 66], [160, 66]], arrow: true, c: "accent3", w: 2 },
      { text: [220, 82], t: "× 3.6", size: 13, b: true, c: "accent3" }
    ], cap: "36 km in an hour is 36 000 m in 3600 s — 10 m every second. So divide km h$^{-1}$ by 3.6." } },
    { worked: { tag: "example", title: "Speeds both ways", q: "(a) Convert 90 km h$^{-1}$ into m s$^{-1}$. (b) Convert 15 m s$^{-1}$ into km h$^{-1}$.",
      steps: [
        { h: "(a)", m: "$90 \\div 3.6 = 25$ m s$^{-1}$", n: "Or $\\dfrac{90 \\times 1000}{3600}$." },
        { h: "(b)", m: "$15 \\times 3.6 = 54$ km h$^{-1}$" }
      ], result: "(a) 25 m s$^{-1}$ (b) 54 km h$^{-1}$" } },
    { worked: { tag: "example", title: "Convert first, then use the formula", q: "A car of mass 1.2 tonnes accelerates uniformly from rest to 108 km h$^{-1}$ in 12 s. Find (a) its acceleration, (b) the resultant force on it.",
      steps: [
        { h: "Units first", m: "$108 \\div 3.6 = 30$ m s$^{-1}$; $\\quad 1.2$ tonnes $= 1200$ kg" },
        { h: "(a) $v = u + at$", m: "$30 = 0 + 12a \\;\\Rightarrow\\; a = 2.5$ m s$^{-2}$" },
        { h: "(b) $F = ma$", m: "$F = 1200 \\times 2.5 = 3000$ N", n: "kg × m s$^{-2}$ = N: the units check the formula." }
      ], result: "(a) 2.5 m s$^{-2}$ (b) 3000 N" } },
    { worked: { tag: "exam", title: "An acceleration, stating its units", src: "A-level June 2024 · P3 Q2(a) · 2 marks",
      q: "A speed-time graph models an athlete running a 200 m race in 24 s. The athlete starts from rest at $t = 0$ and accelerates at a constant rate, reaching a speed of 10 m s$^{-1}$ at $t = 4$. Using the model, find the acceleration of the athlete during the first 4 s of the race, stating the units of your answer.",
      steps: [
        { h: "Gradient of the first line", m: "$a = \\dfrac{10 - 0}{4 - 0}$", mk: "M1", n: "Or $v = u + at$: $10 = 0 + 4a$." },
        { m: "$a = 2.5$ m s$^{-2}$", mk: "A1", n: "\"units needed\" — 2.5 alone is A0. m/s² and m s$^{-2}$ are both accepted." }
      ], result: "2.5 m s$^{-2}$" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "g, accuracy and given answers" },
    { callout: { t: "memorise", h: "The rubric on every Mechanics paper", body: [
      "\"Unless otherwise indicated, wherever a numerical value of $g$ is required, take $g = 9.8$ m s$^{-2}$ and give your answer to either **2 significant figures or 3 significant figures**.\"",
      "Because 9.8 has 2 s.f., an answer that used it is only trustworthy to 2 or 3 s.f. Writing 4 s.f. or more after using 9.8 can lose the final A mark."
    ] } },
    { table: { head: ["Situation", "What to do"], rows: [
      ["Nothing said about $g$", "Use 9.8; round the final answer to 2 or 3 s.f."],
      ["\"$g$ is modelled as 10 m s$^{-2}$\" (AS 2019 Q1, 2020 Q1, 2022 Q1; A-level Oct 2021 Q4)", "Use exactly 10; the answer is then exact (e.g. $T = 2$, $U = 8$)."],
      ["$g$ cancels (an angle, a ratio, $\\mu$ in some questions)", "Any sensible accuracy: \"no restriction on accuracy since $g$'s cancel\"."],
      ["\"Find the exact value\"", "Leave surds and fractions: $2\\sqrt{226}$, $\\frac{41 - 28\\sqrt2}{3}$."],
      ["\"Show that …\" a given answer", "Every line shown; the final mark is A1* (cso) and lost for a gap or a wrong value of $g$."],
      ["Used 9.81 or 10 when 9.8 was wanted", "Penalised once in that question."]
    ] } },
    { callout: { t: "def", h: "$g$ is not a universal constant", body: "It is the acceleration due to gravity near the Earth's surface and varies with location — from about 9.78 m s$^{-2}$ at the equator to about 9.83 m s$^{-2}$ at the poles, and about 1.6 m s$^{-2}$ on the Moon. A-level models assume it is constant over the motion (the inverse square law is not needed)." } },
    { worked: { tag: "example", title: "The same question with two values of $g$", q: "A stone is dropped from rest from a height of 45 m. Find the time it takes to reach the ground using (a) $g = 9.8$, (b) $g = 10$.",
      steps: [
        { h: "$s = ut + \\frac12 at^2$ with $u = 0$, $s = 45$", m: "$45 = \\frac12 g t^2 \\;\\Rightarrow\\; t = \\sqrt{\\dfrac{90}{g}}$" },
        { h: "(a)", m: "$t = \\sqrt{\\dfrac{90}{9.8}} = 3.0304\\ldots = 3.0$ s or $3.03$ s", n: "Not 3.0305 — that claims more accuracy than 9.8 has." },
        { h: "(b)", m: "$t = \\sqrt{9} = 3$ s exactly" }
      ], result: "(a) 3.03 s (b) 3 s" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Modelling" },
    "Every Mechanics answer comes from a **model**: a simplified version of the real situation, stated in a few standard words. Each word changes the working, and each one is a place where the model can be improved.",
    { table: { head: ["Word", "Meaning", "What it does to the working"], rows: [
      ["**Particle**", "dimensions negligible; mass at a single point", "no rotation, no air resistance from its shape; all forces act at one point"],
      ["**Rod**", "rigid, one dimension significant", "it does not bend; moments can be taken along it"],
      ["**Uniform**", "mass evenly spread", "weight acts at the centre (the midpoint of a rod)"],
      ["**Non-uniform**", "mass not evenly spread", "weight acts at a centre of mass you are given or must find"],
      ["**Light**", "mass negligible", "a light string has the same tension throughout; a light rod has no weight"],
      ["**Inextensible**", "does not stretch", "particles joined by it move with the same speed and the same magnitude of acceleration"],
      ["**Smooth** surface", "no friction", "$F = 0$; only the normal reaction acts on the contact"],
      ["**Smooth** pulley or peg", "no friction at the support", "the tension is the same on both sides of a pulley; a peg's reaction is perpendicular to the rod"],
      ["**Rough** surface", "friction acts", "$F \\le \\mu R$ (M8.6)"],
      ["**Moving freely under gravity**", "only its weight acts", "acceleration $g$ vertically downwards, no air resistance"],
      ["**Bead**", "a particle threaded on a wire", "it moves along the wire"],
      ["**Lamina**", "a flat object, thickness negligible", "two dimensions only"]
    ] } },
    { fig: { w: 500, h: 170, items: [
      { circle: [70, 85, 9], fill: "accent", alpha: 0.6, c: "accent" },
      { vec: [[70, 85], [70, 145]], label: "mg", lpos: 0.85, loff: -12 },
      { text: [70, 30], t: "particle", b: true, size: 12.5, c: "text" },
      { text: [70, 160], t: "all forces at one point", size: 11, c: "muted" },
      { line: [[190, 85], [330, 85]], c: "text2", w: 7 },
      { vec: [[260, 85], [260, 145]], label: "W", lpos: 0.85, loff: -12 },
      { pt: [260, 85], r: 3, c: "accent2" },
      { text: [260, 30], t: "uniform rod", b: true, size: 12.5, c: "text" },
      { text: [260, 160], t: "weight at the midpoint", size: 11, c: "muted" },
      { circle: [430, 55, 18], c: "text2", w: 1.6 },
      { line: [[412, 55], [412, 130]], c: "text2", w: 1.4 },
      { line: [[448, 55], [448, 110]], c: "text2", w: 1.4 },
      { vec: [[412, 95], [412, 70]], label: "T", lpos: 0.5, loff: 10 },
      { vec: [[448, 95], [448, 70]], label: "T", lpos: 0.5, loff: -10 },
      { text: [430, 22], t: "smooth pulley, light string", b: true, size: 12.5, c: "text" },
      { text: [430, 160], t: "same tension both sides", size: 11, c: "muted" }
    ], cap: "Three of the standard model words, drawn: what each lets you assume." } },
    { h: "3.1  Refinements that score — and the ones that do not" },
    { table: { head: ["Accepted (B1)", "Not accepted (B0)"], rows: [
      ["Include air resistance (unless the question says \"apart from air resistance\")", "Include the mass or weight of the object — it is already in the model"],
      ["Use a more accurate value of $g$ (9.81, or allow $g$ to vary)", "\"Moves horizontally\", upthrust, air pressure"],
      ["Allow for wind; allow for spin", "\"The ground is not horizontal\", \"the cliff is not vertical\" — not part of the model"],
      ["Do not model the object as a particle: include its size, shape or dimensions", "Terminal velocity, or anything that is a consequence rather than a change to the model"],
      ["Journeys: a smooth change between stages; acceleration not constant; time to change speed", "Friction or the length of a train in a pure kinematics question"],
      ["Connected particles: include the mass of the string; the pulley is not smooth; the string stretches", "\"The particle has a mass\""]
    ] } },
    { callout: { t: "warn", h: "One answer, no extras", body: "The B1 is lost if **any** incorrect extra is given with a correct refinement. Give one clear refinement, in context, and stop." } },
    { h: "3.2  How a refinement moves an answer" },
    { table: { head: ["Air resistance now included", "So the refined value is", "Seen in"], rows: [
      ["Ball projected up; speed at impact is given; find $U$", "**greater** — it must start faster to arrive as fast", "AS 2020 Q1(e), AS 2022 Q1(d)"],
      ["Ball falls; find its speed at impact", "**less** — it is slowed on the way", "AS Specimen Q1(c)"],
      ["Parachutist; find the time to fall", "**greater** — slower fall, longer time", "AS 2019 Q1(d)"],
      ["Projectile reaches a fixed point; find the launch speed", "**greater** ($V > U$)", "A-level Oct 2020 Q5(c), 2022 Q5(c)"],
      ["Projectile; find the greatest height", "**less** ($K < H$)", "A-level 2024 Q5(d)"]
    ] } },
    { worked: { tag: "exam", title: "Air resistance on the way down", src: "AS Specimen · P2 Q1(c) · 1 mark",
      q: "A small ball is projected vertically upwards from a point $A$, 19.6 m above the ground, and strikes the ground 4 s later. Modelled as a particle moving freely under gravity, the ball hits the ground at 24.5 m s$^{-1}$. In a refined model the effect of air resistance is included and is used to find the speed of the ball as it hits the ground for the first time. How would this new value compare with the value found using the initial model?",
      steps: [
        { m: "It would be **less** (smaller): air resistance opposes the motion.", mk: "B1" }
      ], result: "Less than 24.5 m s$^{-1}$" } },
    { worked: { tag: "exam", title: "A parachutist: the refined time, then one more refinement", src: "AS June 2019 · P2 Q1(d)(e) · 2 marks",
      q: "A parachutist falls from rest from a hovering helicopter 550 m above horizontal ground. She is modelled as a particle falling freely under gravity ($g = 10$) for 3 s, then decelerating at 12 m s$^{-2}$ for 2 s, then falling at constant speed; the total time is found to be $T = 83$ s. **(d)** In a refinement the effect of air resistance is included before her parachute opens. How would the new value of $T$ compare with 83? **(e)** Suggest one further refinement, apart from air resistance, to make the model more realistic.",
      steps: [
        { h: "(d)", m: "The new value of $T$ would be **bigger** (it would increase).", mk: "B1", n: "\"It takes longer\" was B0 — the mark wants a clear statement about the value of $T$." },
        { h: "(e)", m: "e.g. use a more accurate value for $g$; include the effect of wind; allow the deceleration to vary (not constant); include the time taken for the parachute to open.", mk: "B1", n: "B0 for: mass or weight of the parachutist, moving horizontally, upthrust, terminal velocity." }
      ], result: "(d) bigger (e) e.g. a more accurate $g$" } },
    { worked: { tag: "exam", title: "A launch speed, refined; then a refinement of your own", src: "AS June 2020 · P2 Q1(e)(f) · 2 marks",
      q: "A small ball is projected vertically upwards with speed $U$ m s$^{-1}$ from a point 16.8 m above horizontal ground and hits the ground at 19 m s$^{-1}$. Modelling it as a particle moving freely under gravity with $g = 10$ gives $U = 5$. **(e)** In a refinement, air resistance on the ball is included and the refined model is used to find $U$. State, with a reason, how this new value of $U$ would compare with 5. **(f)** Suggest one further refinement, apart from air resistance.",
      steps: [
        { h: "(e)", m: "**Greater**, since air resistance would slow the ball down — to arrive at 19 m s$^{-1}$ it must start faster.", mk: "B1" },
        { h: "(f)", m: "e.g. take into account the spin of the ball, wind effects, a more accurate value of $g$, or do not model the ball as a particle.", mk: "B1" }
      ], result: "(e) greater (f) e.g. spin" } },
    { worked: { tag: "exam", title: "Improving a journey model", src: "AS June 2018 · P2 Q7(c) · 1 mark",
      q: "In a model of the motion of a train between two stations, the train accelerates uniformly from rest, moves at constant velocity, then decelerates uniformly to rest. Suggest one improvement that could be made to the model to make it more realistic.",
      steps: [
        { m: "Allow a smooth (gradual) change from acceleration to constant velocity, or from constant velocity to deceleration; or let the train accelerate/decelerate at a variable rate.", mk: "B1", n: "B0: air resistance or resistive forces, the straightness of the track, friction, the length or mass of the train. \"Variable acceleration due to **variable** air resistance\" was allowed." }
      ], result: "e.g. a smooth change between the stages" } },
    { worked: { tag: "exam", title: "A limitation that affects the answers", src: "AS June 2022 · P2 Q2(e) · 1 mark",
      q: "A train's journey between two stations is modelled by a speed-time graph: constant acceleration to 25 m s$^{-1}$, constant speed, then constant deceleration. From the model the time spent accelerating is 40 s and the acceleration is 0.625 m s$^{-2}$. State one limitation of the model which could affect these answers.",
      steps: [
        { m: "e.g. the train cannot change its acceleration instantaneously; it will not move with constant acceleration; it will not move at exactly constant speed.", mk: "B1", n: "Must be a limitation of the **model** — friction, air resistance or the size of the train were B0." }
      ], result: "e.g. acceleration would not really be constant" } },
    { worked: { tag: "exam", title: "Why the real time differs", src: "AS June 2025 · P2 Q1(b) · 1 mark",
      q: "A runner's motion from $A$ to $B$, 400 m, is modelled as constant acceleration for 5 s to 5 m s$^{-1}$, constant speed, then constant deceleration for 15 s to rest at $B$, giving a time of $T = 90$ s. State one reason why the actual time taken might not be $T$ seconds.",
      steps: [
        { m: "e.g. the runner's acceleration (or deceleration) will not be constant; the speed will not be exactly constant in the middle stage; the road may not be straight, so the distance run differs.", mk: "B1" }
      ], result: "e.g. acceleration not constant" } },
    { worked: { tag: "exam", title: "With and without air resistance: which launch speed is greater?", src: "A-level June 2022 · P3 Q5(c)(d) · 2 marks",
      q: "A golf ball is hit from a point $A$ on horizontal ground and first lands at $B$, 120 m away. Modelled as a particle moving freely under gravity, its initial speed is $U$ m s$^{-1}$. In a refinement, air resistance is included and the initial speed is $V$ m s$^{-1}$. **(c)** State which is greater, $U$ or $V$, giving a reason. **(d)** State one further refinement that would make the model more realistic.",
      steps: [
        { h: "(c)", m: "$V$ is greater, since air resistance has to be overcome to reach the same point $B$.", mk: "B1" },
        { h: "(d)", m: "e.g. wind effects, spin of the ball, a more accurate value of $g$, the size or shape of the ball (not a particle).", mk: "B1", n: "Any mention of air resistance or drag in (d) is ignored — it has already been used." }
      ], result: "(c) $V$ (d) e.g. spin" } },
    { worked: { tag: "exam", title: "Greatest height with air resistance; a limitation of the refined model", src: "A-level June 2024 · P3 Q5(d)(e) · 2 marks",
      q: "A stone is projected from horizontal ground and, modelled as a particle moving freely under gravity, reaches a greatest height of $H$ metres. The model is refined to include air resistance, and the greatest height is now found to be $K$ metres. **(d)** State which is greater, $H$ or $K$, justifying your answer. **(e)** State one limitation of this refined model.",
      steps: [
        { h: "(d)", m: "$H$ is greater: air resistance also acts downwards on the way up, so the stone decelerates faster and stops rising sooner.", mk: "B1" },
        { h: "(e)", m: "e.g. it still models the stone as a particle (ignores its size/shape and spin); it ignores wind; it uses an approximate value of $g$.", mk: "B1" }
      ], result: "(d) $H$ (e) e.g. still a particle" } },
    { worked: { tag: "exam", title: "Two limitations of a tennis-serve model", src: "A-level Specimen · P3 Q5(c) · 2 marks",
      q: "A tennis ball is served with speed 45 m s$^{-1}$ at 10° below the horizontal and is modelled as a particle moving freely under gravity, to find its height and speed as it passes over the net. State two limitations of the model that could affect the reliability of your answers.",
      steps: [
        { m: "The model does not take account of **air resistance**.", mk: "B1" },
        { m: "The model does not take account of the **size of the ball** (or its spin, or the wind).", mk: "B1" }
      ], result: "e.g. air resistance; size of the ball" } },

    /* ---------------------------------------------------------------- Exam toolkit */
    { page: "Exam toolkit" },
    { callout: { t: "memorise", h: "The units", body: [
      "Length m, time s, mass kg. Velocity m s$^{-1}$, acceleration m s$^{-2}$, force and weight N, moment N m.",
      "km h$^{-1}$ $\\div 3.6$ = m s$^{-1}$. Tonnes $\\times 1000$ = kg. km $\\times 1000$ = m."
    ] } },
    { callout: { t: "memorise", h: "The accuracy rule", body: "$g = 9.8$ unless told otherwise; then 2 or 3 s.f. If $g$ cancels, any accuracy. \"Exact\" means surds and fractions. \"Show that\" means every step." } },
    { callout: { t: "mnemonic", h: "Refinements: \"WAGS\"", body: "**W**ind · **A**ir resistance (if not excluded) · a better **G** · **S**ize, shape or spin (not a particle). Never mass or weight." } },
    { callout: { t: "warn", h: "Common losses", body: [
      "Forgetting the units when the question says \"stating the units\".",
      "Using km or km h$^{-1}$ directly in a formula with $g$.",
      "Giving 4 or more significant figures after using $g = 9.8$.",
      "Listing two refinements, one of them wrong."
    ] } }
  ],
  flashcards: [
    ["The three fundamental S.I. quantities and units?", "Length (m), time (s), mass (kg)."],
    ["S.I. unit of acceleration?", "m s$^{-2}$."],
    ["1 newton in base units?", "1 kg m s$^{-2}$."],
    ["Unit of a moment?", "N m."],
    ["Convert km h$^{-1}$ to m s$^{-1}$?", "Divide by 3.6."],
    ["72 km h$^{-1}$ in m s$^{-1}$?", "20 m s$^{-1}$."],
    ["Default value of $g$ and the accuracy that goes with it?", "9.8 m s$^{-2}$; answers to 2 or 3 s.f."],
    ["Is $g$ a universal constant?", "No — it varies with location (and is about 1.6 m s$^{-2}$ on the Moon)."],
    ["What does \"light\" mean for a string?", "Its mass is negligible, so the tension is the same throughout."],
    ["What does \"inextensible\" mean?", "It does not stretch, so connected particles share the same speed and acceleration magnitude."],
    ["What does \"smooth\" mean for a surface?", "No friction."],
    ["What does \"moving freely under gravity\" assume?", "Only the weight acts: acceleration $g$ downwards, no air resistance."],
    ["Name two refinements that score.", "e.g. include air resistance; a more accurate $g$; wind; spin; the object's size or shape."],
    ["Name a refinement that scores B0.", "\"Include the mass/weight of the object\"."],
    ["Air resistance included: launch speed to reach a fixed point?", "Greater."]
  ],
  quiz: [
    { q: "15 m s$^{-1}$ in km h$^{-1}$ is", opts: ["54", "4.17", "15 000", "900"], ans: 0, why: "Multiply by 3.6." },
    { q: "Which is a fundamental S.I. unit?", opts: ["kilogram", "newton", "m s$^{-1}$", "N m"], ans: 0, why: "Mass is fundamental; the others are derived." },
    { q: "After using $g = 9.8$, a time of 3.030 45 s should be given as", opts: ["3.03 s", "3.030 45 s", "3.0305 s", "3 s exactly"], ans: 0, why: "2 or 3 s.f." },
    { q: "\"Model the ball as a particle\" means", opts: ["its dimensions are negligible", "it has no mass", "it has no weight", "it is smooth"], ans: 0, why: "Size ignored, mass kept." },
    { q: "Which refinement earns the mark?", opts: ["Allow for the spin of the ball", "Include the weight of the ball", "The ground is not horizontal", "Upthrust from the air"], ans: 0, why: "Spin changes the model; the others do not or are not part of it." },
    { q: "Air resistance is included for a ball that must hit the ground at a given speed. The new launch speed is", opts: ["greater", "less", "unchanged", "zero"], ans: 0, why: "It loses speed on the way, so must start faster." }
  ]
};

/* =====================================================================
   M7.1  The language of kinematics
   ===================================================================== */
C["maths:M7.1"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "The language of kinematics — the whole topic on one page" },
    "Spec 7.1: understand and use the language of kinematics — **position, displacement, distance travelled, velocity, speed, acceleration**. Distance and speed are always positive.",
    "The marks come from keeping each pair apart: a displacement can be negative or zero, a distance cannot; a velocity has a direction, a speed does not.",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Total **distance** when the object turns round (vs displacement)", "3–4", "AS Nov 2021 Q1(b); calculus: AS 2022 Q3(b), 2023 Q3(c), 2025 Q4(b)"],
      ["When the object **returns** to its start (displacement zero)", "2–3", "AS Nov 2021 Q1(a), AS Specimen Q4(c)"],
      ["How high was the start? (displacement negative)", "3", "AS June 2023 Q2(a)"],
      ["For how long is the **speed** at most $k$? (both directions)", "3", "AS June 2023 Q2(b)"],
      ["Distance from $O$: the magnitude of a position vector", "2–6", "A-level 2025 Q4(b), Oct 2021 Q5(d) (M7.4)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**Scalars and vectors** — the six words, signs and directions.",
      "**Displacement and distance** — including motion that turns round.",
      "**Velocity and speed** — and averages.",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "Scalars and vectors" },
    { kv: [
      ["Position", "Where the object is, measured from a fixed origin $O$: $x$ (a straight line) or $\\mathbf r$ (a plane). **Vector.**"],
      ["Displacement", "The change in position: $s = x_{\\text{end}} - x_{\\text{start}}$. Can be negative or zero. **Vector.**"],
      ["Distance travelled", "The total length of path covered. Never negative, never less than |displacement|. **Scalar.**"],
      ["Velocity", "Rate of change of displacement, $v = \\dfrac{ds}{dt}$. Its sign gives the direction. **Vector.**"],
      ["Speed", "The magnitude of velocity, $|v|$. Never negative. **Scalar.**"],
      ["Acceleration", "Rate of change of velocity, $a = \\dfrac{dv}{dt}$. **Vector.** A \"deceleration of 2 m s$^{-2}$\" is an acceleration of $-2$ m s$^{-2}$ (opposite to the motion)."]
    ] },
    { fig: { w: 520, h: 150, items: [
      { line: [[30, 70], [500, 70]], arrow: true, c: "line", w: 1.4 },
      { pt: [130, 70], label: "O", pos: "s", r: 3.5, c: "muted", i: false },
      { pt: [210, 70], label: "start x = 2", pos: "s", r: 3.5, c: "accent", i: false },
      { pt: [370, 70], label: "turns at x = 6", pos: "s", r: 3.5, c: "accent2", i: false },
      { pt: [90, 70], label: "ends at x = −1", pos: "s", r: 3.5, c: "accent3", i: false },
      { line: [[210, 50], [370, 50]], arrow: true, c: "accent2", w: 2, label: "4 m", loff: -10 },
      { line: [[370, 34], [90, 34]], arrow: true, c: "accent3", w: 2, label: "7 m", loff: -10 },
      { line: [[210, 118], [90, 118]], arrow: true, c: "accent", w: 2.2, label: "displacement −3 m", loff: 12 }
    ], cap: "A particle moves from $x = 2$ to $x = 6$ and back to $x = -1$. Distance travelled $4 + 7 = 11$ m; displacement $-1 - 2 = -3$ m." } },
    { callout: { t: "memorise", h: "Choose a positive direction — and keep it", body: "Before any equation, say which way is positive (\"take upwards as positive\"). Every displacement, velocity and acceleration then carries its sign: a ball thrown up at 14.7 m s$^{-1}$ under gravity has $u = +14.7$, $a = -9.8$; a point below the start has $s < 0$." } },
    { callout: { t: "miscon", h: "\"Decelerating\" is not \"moving backwards\"", body: "Deceleration means the speed is falling: the acceleration points against the velocity. A car braking while moving forwards has $v > 0$, $a < 0$. Moving backwards is $v < 0$." } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Displacement and distance" },
    "Displacement uses only the start and the end. Distance needs **every turning point** in between: split the motion where the velocity is zero and add the lengths of each piece.",
    { steps: [
      { h: "1. Find when $v = 0$", m: "That is where the object can turn round (top of a throw, a root of $v(t)$)." },
      { h: "2. Find the position at the start, each turning point and the end", m: "Use suvat or integrate." },
      { h: "3. Add the lengths of the pieces", m: "Each piece is $|x_{\\text{later}} - x_{\\text{earlier}}|$." }
    ] },
    { worked: { tag: "exam", title: "Back through the start; total distance in 4 s", src: "AS Nov 2021 · P2 Q1(a)(b) · 6 marks",
      q: "At time $t = 0$ a small stone is thrown vertically upwards with speed 14.7 m s$^{-1}$ from a point $A$. At time $t = T$ seconds the stone passes through $A$, moving downwards. The stone is modelled as a particle moving freely under gravity throughout its motion. Using the model, **(a)** find the value of $T$, **(b)** find the total distance travelled by the stone in the first 4 seconds of its motion.",
      steps: [
        { h: "(a) Back at $A$: displacement zero (up positive)", m: "$0 = 14.7T - 4.9T^2 \\;\\Rightarrow\\; T(14.7 - 4.9T) = 0$", mk: "M1", n: "Or $v = u + at$: it arrives back at $A$ at $-14.7$ m s$^{-1}$, so $-14.7 = 14.7 - 9.8T$. M0 for only finding the time to the top." },
        { m: "$T = 3$", mk: "A1" },
        { h: "(b) It turns round at the top", m: "Time to top: $0 = 14.7 - 9.8t \\Rightarrow t = 1.5$ s. Height gained: $s = \\frac{(14.7 + 0)}{2} \\times 1.5 = 11.025$ m", mk: "M1" },
        { h: "Fall in the remaining 2.5 s", m: "$s = \\frac12 \\times 9.8 \\times 2.5^2 = 30.625$ m", mk: "M1", n: "Or the displacement at $t = 4$: $14.7 \\times 4 - 4.9 \\times 16 = -19.6$, i.e. 19.6 m below $A$." },
        { h: "Add the pieces", m: "$11.025 + 30.625 = 41.65 \\approx 41.7$ m", mk: "M1 A1", n: "Or $2 \\times 11.025 + 19.6$: up to the top, back to $A$, then 19.6 m below. Not 19.6 — that is the displacement." }
      ], result: "(a) $T = 3$ (b) 41.7 m (or 42 m)" } },
    { fig: vertFig([[11.025, "top: 11.025 m above A, t = 1.5"], [0, "A: t = 0 and t = 3"], [-19.6, "t = 4: 19.6 m below A", "accent3"]],
      { lo: -21, hi: 13, h: 250, w: 420,
        paths: [[150, 0, 11.025, "up 11.025", "accent"], [195, 11.025, -19.6, "down 30.625", "accent2"]],
        cap: "Distance 41.65 m is the length of both arrows; the displacement at $t = 4$ is only $-19.6$ m." }) },
    { worked: { tag: "exam", title: "How high is the start? A negative displacement", src: "AS June 2023 · P2 Q2(a) · 3 marks",
      q: "A small stone is projected vertically upwards with speed 39.2 m s$^{-1}$ from a point $O$. The stone is modelled as a particle moving freely under gravity from when it is projected until it hits the ground 10 s later. Using the model, find the height of $O$ above the ground.",
      steps: [
        { h: "Displacement after 10 s (up positive)", m: "$s = ut + \\frac12 at^2 = 39.2 \\times 10 - \\frac12 \\times 9.8 \\times 10^2$", mk: "M1 A1" },
        { m: "$s = 392 - 490 = -98$, so $O$ is **98 m** above the ground", mk: "A1", n: "The answer must be positive: a height. Up-and-down method: 78.4 m up in 4 s, 176.4 m down in 6 s, $176.4 - 78.4 = 98$." }
      ], result: "98 m" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Velocity and speed" },
    "A speed condition such as \"speed $\\le 24.5$\" is **two** velocity conditions: $-24.5 \\le v \\le 24.5$. On the way up and on the way down the stone has the same speeds at the same heights.",
    { worked: { tag: "exam", title: "For how long is the speed at most 24.5 m s$^{-1}$?", src: "AS June 2023 · P2 Q2(b) · 3 marks",
      q: "A small stone is projected vertically upwards with speed 39.2 m s$^{-1}$ from a point $O$ and moves freely under gravity until it hits the ground 10 s later. Find the total length of time for which the speed of the stone is less than or equal to 24.5 m s$^{-1}$.",
      steps: [
        { h: "Speed $\\le 24.5$ means $-24.5 \\le v \\le 24.5$", m: "$v = 39.2 - 9.8t$", mk: "M1" },
        { m: "$v = 24.5$: $\\; t = \\dfrac{39.2 - 24.5}{9.8} = 1.5$; $\\quad v = -24.5$: $\\; t = \\dfrac{39.2 + 24.5}{9.8} = 6.5$", mk: "A1" },
        { m: "$6.5 - 1.5 = 5$ s", mk: "A1", n: "Or by symmetry: from 24.5 up to 0 takes $24.5 / 9.8 = 2.5$ s, so $2 \\times 2.5 = 5$ s. Check $6.5 < 10$, so the stone is still in the air." }
      ], result: "5 s" } },
    { fig: vtFig([[0, 39.2], [10, -58.8]], { xt: [1.5, 4, 6.5, 10], yt: [-58.8, -24.5, 24.5, 39.2], h: 260,
      extra: [{ poly: [[1.5, -70], [6.5, -70], [6.5, 50], [1.5, 50]], fill: "accent2", alpha: 0.12, c: "accent2", w: 0.5 },
        { hline: 24.5, c: "accent2" }, { hline: -24.5, c: "accent2" },
        { text: [4, -40], t: "|v| ≤ 24.5 for 5 s", c: "accent2", b: true, size: 12 }],
      cap: "$v = 39.2 - 9.8t$: the speed is at most 24.5 between $t = 1.5$ and $t = 6.5$ — on both sides of the top." }) },
    { h: "3.1  Averages" },
    { kv: [
      ["Average speed", "$\\dfrac{\\text{total distance travelled}}{\\text{total time}}$"],
      ["Average velocity", "$\\dfrac{\\text{displacement}}{\\text{total time}}$ — zero for a round trip"]
    ] },
    { worked: { tag: "example", title: "Average speed and average velocity of a round trip", q: "A cyclist rides 6 km due east in 20 minutes, then rides back 4 km due west in 10 minutes. Find, in m s$^{-1}$, (a) the average speed, (b) the magnitude of the average velocity.",
      steps: [
        { h: "Units", m: "Distance $10\\,000$ m; displacement $2000$ m east; time $30 \\times 60 = 1800$ s" },
        { h: "(a)", m: "$\\dfrac{10\\,000}{1800} = 5.56$ m s$^{-1}$" },
        { h: "(b)", m: "$\\dfrac{2000}{1800} = 1.11$ m s$^{-1}$ (due east)" }
      ], result: "(a) 5.56 m s$^{-1}$ (b) 1.11 m s$^{-1}$" } },
    { worked: { tag: "variation", title: "Distance from the origin in a plane", q: "A particle is at the point with position vector $(6\\mathbf i - 8\\mathbf j)$ m relative to $O$. Find its distance from $O$, and the bearing of the particle from $O$ when $\\mathbf i$ is due east and $\\mathbf j$ due north.",
      steps: [
        { h: "Distance: the magnitude", m: "$\\sqrt{6^2 + (-8)^2} = 10$ m" },
        { h: "Bearing", m: "It is 6 east and 8 south of $O$: angle east of south $= \\tan^{-1}\\frac68 = 36.9°$, so the bearing is $180° - 36.9° = 143°$." }
      ], result: "10 m, bearing 143°" } },

    /* ---------------------------------------------------------------- Exam toolkit */
    { page: "Exam toolkit" },
    { callout: { t: "memorise", h: "The six words", body: [
      "**Vectors** (signed): position, displacement, velocity, acceleration.",
      "**Scalars** (never negative): distance, speed.",
      "Distance = displacement only if the object never turns round."
    ] } },
    { callout: { t: "mnemonic", h: "\"Stop, split, sum\"", body: "For a total distance: find where it **stops** ($v = 0$), **split** the motion there, **sum** the lengths." } },
    { callout: { t: "warn", h: "Common losses", body: [
      "Giving the displacement when the distance was asked for (19.6 m instead of 41.7 m).",
      "Answering a speed condition with only one time.",
      "A negative height or distance as the final answer.",
      "Losing the sign of $g$ halfway through."
    ] } }
  ],
  flashcards: [
    ["Displacement vs distance?", "Displacement is the change in position (signed); distance is the total path length (never negative)."],
    ["Velocity vs speed?", "Velocity has direction (signed); speed is its magnitude."],
    ["When are distance and |displacement| equal?", "When the object never turns round."],
    ["Where can an object change direction?", "Where its velocity is zero."],
    ["Average velocity of a round trip?", "Zero — the displacement is zero."],
    ["Average speed?", "Total distance ÷ total time."],
    ["\"Speed at most 24.5\" in velocities?", "$-24.5 \\le v \\le 24.5$."],
    ["A deceleration of 3 m s$^{-2}$ as an acceleration?", "$-3$ m s$^{-2}$ (against the motion)."],
    ["Distance from $O$ of $(5\\mathbf i + 12\\mathbf j)$ m?", "13 m."],
    ["Stone thrown up at 14.7: back at the start when?", "$t = 3$ s."]
  ],
  quiz: [
    { q: "A ball is thrown up 5 m and falls back to its start. Its displacement is", opts: ["0 m", "5 m", "10 m", "−5 m"], ans: 0, why: "Same start and end." },
    { q: "…and the distance it travels is", opts: ["10 m", "0 m", "5 m", "2.5 m"], ans: 0, why: "5 up + 5 down." },
    { q: "Which is a scalar?", opts: ["speed", "velocity", "displacement", "acceleration"], ans: 0, why: "Magnitude only." },
    { q: "A car moving forwards brakes. Then", opts: ["$v > 0$, $a < 0$", "$v < 0$, $a < 0$", "$v < 0$, $a > 0$", "$v = 0$"], ans: 0, why: "Deceleration opposes the velocity." },
    { q: "For a total distance in a motion that turns round you must first find", opts: ["when $v = 0$", "when $a = 0$", "the average speed", "the maximum speed"], ans: 0, why: "Split at the turning points." }
  ]
};

/* @@M7.2@@ */

/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
