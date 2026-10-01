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

/* =====================================================================
   M7.2  Graphs in kinematics
   ===================================================================== */
C["maths:M7.2"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Graphs in kinematics — the whole topic on one page" },
    "Spec 7.2: understand, use and interpret graphs for motion in a straight line — **displacement against time** (gradient = velocity) and **velocity against time** (gradient = acceleration, area = displacement). Graphical solutions may be required.",
    "Almost every AS paper opens its Mechanics section with a journey drawn as a speed-time graph:",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Sketch a speed-time / velocity-time graph from a description", "1–3", "AS Specimen Q2, 2018 Q7, 2019 Q1, 2022 Q2"],
      ["Total area = total distance → an equation in one unknown ($T$, $V$, $t$)", "2–5", "AS Specimen Q2, 2018 Q7, 2019 Q1, 2022 Q2, 2024 Q1, 2025 Q1"],
      ["Gradient → an acceleration; a speed at a given time", "1–2", "AS 2022 Q2(c)(d), 2023 Q1(b), A-level 2024 Q2(a)"],
      ["Two graphs with equal areas (two runners, same race)", "4–8", "AS June 2023 Q1"],
      ["The final speed from the remaining distance", "3", "A-level June 2024 Q2(c)"],
      ["Sketch a **distance-time** graph from a speed-time graph", "3", "AS June 2024 Q1(b)"],
      ["Explain why a model allows a range of values", "2", "AS Specimen Q2(c)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**Displacement-time graphs** — gradient, curvature, sketching.",
      "**Velocity-time graphs** — gradient, area, below the axis.",
      "**Journey problems** — accelerate, cruise, decelerate.",
      "**Unknowns and comparisons** — two graphs, a missing speed, a range of times.",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "Displacement-time graphs" },
    { kv: [
      ["Gradient", "velocity (for a distance-time graph, speed)"],
      ["Straight line", "constant velocity"],
      ["Horizontal line", "at rest"],
      ["Curve getting steeper", "speeding up (accelerating in the direction of motion)"],
      ["Curve levelling off", "slowing down; a horizontal tangent means instantaneous rest"],
      ["Line sloping down", "moving back towards the origin (negative velocity)"]
    ] },
    { fig: { x: [0, 33], y: [0, 130], w: 500, h: 240,
      axes: { x: "t (s)", y: "s (m)", xt: [5, 20, 30], yt: [12.5, 87.5, 112.5] },
      items: [
        { fn: "0.5*x^2", from: 0, to: 5, c: "accent", w: 2.4 },
        { fn: "12.5+5*(x-5)", from: 5, to: 20, c: "accent", w: 2.4 },
        { fn: "87.5+5*(x-20)-0.25*(x-20)^2", from: 20, to: 30, c: "accent", w: 2.4 },
        { text: [3.2, 30], t: "steeper", c: "accent2", size: 11.5 },
        { text: [13, 74], t: "straight: 5 m s⁻¹", c: "accent2", size: 11.5 },
        { text: [27, 124], t: "levels off", c: "accent2", size: 11.5 }
      ], cap: "The distance-time graph of the AS June 2024 car: a curve getting steeper while it accelerates, a straight line at constant speed, a curve levelling off to a horizontal tangent as it stops." } },
    { worked: { tag: "exam", title: "A distance, then the distance-time graph", src: "AS June 2024 · P2 Q1 · 6 marks",
      q: "A car moves in a long queue of traffic on a straight horizontal road. At $t = 0$ it is at rest at $A$. It accelerates uniformly for 5 seconds until it reaches a speed of 5 m s$^{-1}$, travels at a constant 5 m s$^{-1}$ for the next 15 seconds, then decelerates uniformly until it comes to rest at $B$. The total journey time is 30 seconds. **(a)** Find the distance $AB$. **(b)** Sketch a distance-time graph for the journey from $A$ to $B$.",
      steps: [
        { h: "(a) Area under the speed-time graph", m: "$\\tfrac12 \\times 5 \\times 5 + 15 \\times 5 + \\tfrac12 \\times 10 \\times 5$", mk: "M1 A1", n: "Or one trapezium: $\\frac12(30 + 15) \\times 5$." },
        { m: "$AB = 12.5 + 75 + 25 = 112.5$ m", mk: "A1" },
        { h: "(b) Three sections", m: "$0 \\le t \\le 5$: a curve, gradient increasing from 0 (to 12.5 m).", mk: "B1" },
        { m: "$5 \\le t \\le 20$: a straight line with positive gradient (to 87.5 m).", mk: "B1" },
        { m: "$20 \\le t \\le 30$: a curve, gradient decreasing to zero, never going down; ends at (30, 112.5). Mark 5, 20, 30 and 112.5.", mk: "B1", n: "Joined smoothly. A vertical line at the end loses a mark." }
      ], result: "(a) 112.5 m" } },
    { worked: { tag: "variation", title: "Reading velocities off a displacement-time graph", q: "A cyclist's displacement from home is 0 m at $t = 0$, 600 m at $t = 120$ s, stays 600 m until $t = 200$ s, then is 0 m at $t = 320$ s, each stage a straight line. Find the velocity in each stage and the average speed.",
      steps: [
        { h: "Gradients", m: "$\\frac{600}{120} = 5$ m s$^{-1}$; $\\;0$ (at rest); $\\;\\frac{0 - 600}{120} = -5$ m s$^{-1}$" },
        { h: "Average speed", m: "$\\dfrac{1200}{320} = 3.75$ m s$^{-1}$", n: "The average velocity is 0 — the cyclist is back home." }
      ], result: "5, 0, −5 m s$^{-1}$; 3.75 m s$^{-1}$" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Velocity-time graphs" },
    { callout: { t: "memorise", h: "Gradient and area", body: [
      "**Gradient** of a velocity-time graph = **acceleration**. A straight line means constant acceleration.",
      "**Area** between the graph and the $t$-axis = **displacement**. Area above the axis is positive, area below is negative.",
      "Total **distance** = the sum of the areas, all counted positive."
    ] } },
    { fig: vtFig([[0, 0], [4, 10], [18, 10], [24, 10 / 3]], { area: true, xt: [4, 18, 24], yt: [{ v: 10 / 3, label: "U" }, 10],
      marks: [[4, 10, "(4, 10)", "n"], [18, 10, "(18, 10)", "n"]],
      extra: [{ text: [2.4, 2.4], t: "triangle", c: "text2", size: 11 }, { text: [11, 5], t: "rectangle 14 × 10", c: "text2", size: 11 }, { text: [21, 3], t: "trapezium", c: "text2", size: 11 }],
      cap: "The A-level June 2024 sprint: area $= 20 + 140 + 40 = 200$ m. Triangles, rectangles and trapezia are all you ever need." }) },
    { table: { head: ["Shape", "Area"], rows: [
      ["Triangle (start or end at rest)", "$\\frac12 \\times$ time $\\times$ top speed"],
      ["Rectangle (constant speed)", "time $\\times$ speed"],
      ["Trapezium (speed changes from $u$ to $v$)", "$\\frac12(u + v) \\times$ time"],
      ["Whole accelerate–cruise–decelerate journey", "$\\frac12(\\text{total time} + \\text{cruise time}) \\times$ top speed"]
    ] } },
    { callout: { t: "warn", h: "One suvat equation for the whole journey is M0", body: "The acceleration changes between stages, so suvat may only be used stage by stage. The mark schemes give no credit for a single formula across the whole motion, and no credit for a triangle drawn where a trapezium is needed (\"equivalent to using three triangles\")." } },
    { worked: { tag: "variation", title: "Velocity below the axis: displacement and distance", q: "A particle's velocity-time graph is a straight line from (0, 6) to (5, −4). Find (a) its acceleration, (b) its displacement over the 5 s, (c) the distance travelled.",
      steps: [
        { h: "(a) Gradient", m: "$\\dfrac{-4 - 6}{5} = -2$ m s$^{-2}$" },
        { h: "It stops at $t = 3$", m: "$6 - 2t = 0$" },
        { h: "(b) Signed areas", m: "$\\tfrac12 \\times 3 \\times 6 - \\tfrac12 \\times 2 \\times 4 = 9 - 4 = 5$ m" },
        { h: "(c) Both positive", m: "$9 + 4 = 13$ m" }
      ], result: "(a) −2 m s$^{-2}$ (b) 5 m (c) 13 m" } },
    { fig: vtFig([[0, 6], [5, -4]], { xt: [3, 5], yt: [-4, 6],
      extra: [{ poly: [[0, 0], [0, 6], [3, 0]], fill: "accent3", alpha: 0.25, c: "accent3", w: 0.5 }, { poly: [[3, 0], [5, -4], [5, 0]], fill: "accent2", alpha: 0.3, c: "accent2", w: 0.5 },
        { text: [1, 2], t: "+9", c: "accent3", b: true }, { text: [4.4, -1.4], t: "−4", c: "accent2", b: true }],
      cap: "Above the axis it moves forwards 9 m; below, back 4 m. Displacement 5 m, distance 13 m." }) },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Journey problems" },
    "Draw the graph, mark every time and speed you know, then write **total area = total distance** as an equation with one unknown.",
    { worked: { tag: "exam", title: "Accelerate then decelerate: find $V$; why $T$ can vary", src: "AS Specimen · P2 Q2(a)–(c) · 6 marks",
      q: "A car travels along a straight horizontal road between two sets of traffic lights 1500 m apart. In a model, it accelerates uniformly from rest to a speed of $V$ m s$^{-1}$, then immediately decelerates uniformly to rest at the second lights, taking 120 s in total. **(a)** Sketch a velocity-time graph for the model. **(b)** Find $V$. It is given that the car accelerates uniformly for $T$ seconds. **(c)** Explain why there is a range of possible values for $T$ which satisfy the requirements of the model.",
      steps: [
        { h: "(a) A triangle", m: "Starts at the origin, rises to a peak $V$, falls to the $t$-axis at 120.", mk: "B1 B1" },
        { h: "(b) Area = 1500", m: "$\\tfrac12 \\times 120 \\times V = 1500$", mk: "M1" },
        { m: "$V = 25$", mk: "A1" },
        { h: "(c) The area does not depend on $T$", m: "The area of a triangle with base 120 and height 25 is 1500 wherever the peak is,", mk: "B1" },
        { m: "so any $T$ with $0 < T < 120$ fits the model (the accelerations change but the distance does not).", mk: "B1" }
      ], result: "(b) $V = 25$" } },
    { fig: vtFig([[0, 0], [40, 25], [120, 0]], { area: true, xt: [{ v: 40, label: "T" }, 120], yt: [{ v: 25, label: "V = 25" }],
      extra: [{ line: [[0, 0], [90, 25]], c: "muted", dash: true }, { line: [[90, 25], [120, 0]], c: "muted", dash: true }, { text: [60, 8], t: "area 1500", c: "text2", b: true }],
      cap: "Moving the peak (dashed) keeps base 120 and height 25: the same 1500 m, a different $T$." }) },
    { worked: { tag: "exam", title: "Accelerate, cruise, decelerate: the total time", src: "AS June 2018 · P2 Q7(a)(b) · 6 marks",
      q: "A train travels along a straight horizontal track between stations $A$ and $B$. In a model, it starts from rest at $A$ and moves with constant acceleration 0.3 m s$^{-2}$ for 80 s, then at constant velocity, then with constant deceleration 0.5 m s$^{-2}$, coming to rest at $B$. **(a)** (i) State the value of the constant velocity, (ii) state the time for which the train is decelerating, (iii) sketch a velocity-time graph. The distance between the stations is 4800 m. **(b)** Find the total time taken from $A$ to $B$.",
      steps: [
        { h: "(a)(i)", m: "$v = 0.3 \\times 80 = 24$ m s$^{-1}$", mk: "B1" },
        { h: "(a)(ii)", m: "$\\dfrac{24}{0.5} = 48$ s", mk: "B1" },
        { h: "(a)(iii)", m: "A trapezium starting at the origin and ending on the $t$-axis.", mk: "B1" },
        { h: "(b) Let the cruise last $T$ s", m: "$\\tfrac12 \\times 80 \\times 24 + 24T + \\tfrac12 \\times 48 \\times 24 = 4800$", mk: "M1 A1ft", n: "Or $\\frac12(T + T + 80 + 48) \\times 24 = 4800$. Three triangles is M0." },
        { m: "$960 + 24T + 576 = 4800 \\Rightarrow T = 136$; total $80 + 136 + 48 = 264$ s", mk: "A1" }
      ], result: "(a) 24 m s$^{-1}$, 48 s (b) 264 s" } },
    { worked: { tag: "exam", title: "Decelerating for four times as long", src: "AS June 2022 · P2 Q2(a)–(d) · 7 marks",
      q: "A train travels from station $P$ to station $Q$. It starts from rest and accelerates uniformly to its maximum speed of 25 m s$^{-1}$, travels at this speed, then decelerates uniformly to rest at $Q$. The time spent decelerating is four times the time spent accelerating. The journey takes 700 s and the stations are 15 km apart. **(a)** Sketch a speed-time graph. **(b)** Show that the time spent accelerating is 40 s. **(c)** Find the acceleration. **(d)** Find the speed of the train 572 s after leaving $P$.",
      steps: [
        { h: "(a)", m: "A trapezium from the origin to (700, 0), top at 25, with the falling side longer than the rising side.", mk: "B1" },
        { h: "(b) Accelerate $t$, cruise $700 - 5t$, decelerate $4t$", m: "$\\tfrac12\\big(700 + (700 - 5t)\\big) \\times 25 = 15\\,000$", mk: "M1 A1", n: "Convert 15 km to 15 000 m. Or triangle + rectangle + triangle: $\\frac12 \\cdot t \\cdot 25 + 25(700 - 5t) + \\frac12 \\cdot 4t \\cdot 25$." },
        { m: "$1400 - 5t = 1200 \\Rightarrow t = 40$ s", mk: "A1*" },
        { h: "(c)", m: "$\\dfrac{25}{40} = 0.625$ m s$^{-2}$", mk: "B1" },
        { h: "(d) Deceleration runs from 540 s to 700 s", m: "deceleration $= \\dfrac{25}{160}$; $\\; 572 - 540 = 32$ s into it: $\\; v = 25 - 32 \\times \\dfrac{25}{160}$", mk: "M1" },
        { m: "$v = 20$ m s$^{-1}$", mk: "A1", n: "Or by similar triangles: 128 s before the end, $\\frac{128}{160} \\times 25$." }
      ], result: "(c) 0.625 m s$^{-2}$ (d) 20 m s$^{-1}$" } },
    { fig: vtFig([[0, 0], [40, 25], [540, 25], [700, 0]], { area: true, xt: [40, 540, 572, 700], yt: [20, 25],
      extra: [{ line: [[572, 0], [572, 20]], c: "accent2", dash: true }, { pt: [572, 20], label: "20", pos: "ne", c: "accent2", i: false }],
      cap: "AS June 2022: accelerate 40 s, cruise 500 s, decelerate 160 s. At 572 s the speed is 20 m s$^{-1}$." }) },
    { worked: { tag: "exam", title: "The total time from the distance", src: "AS June 2025 · P2 Q1(a) · 3 marks",
      q: "A runner travels along a straight horizontal road from $A$ to $B$, 400 m. In a model the runner starts from rest at $A$, moves with constant acceleration for 5 s reaching 5 m s$^{-1}$, travels at a constant 5 m s$^{-1}$, then moves with constant deceleration for 15 s until coming to rest at $B$, taking $T$ seconds in all. Find $T$.",
      steps: [
        { h: "Cruise time $T - 20$", m: "$400 = \\tfrac12\\big(T + (T - 20)\\big) \\times 5$", mk: "M1 A1", n: "Or $12.5 + 5(T - 20) + 37.5 = 400$." },
        { m: "$2T - 20 = 160 \\Rightarrow T = 90$", mk: "A1" }
      ], result: "$T = 90$" } },
    { worked: { tag: "exam", title: "A parachutist: free fall, braking, steady descent", src: "AS June 2019 · P2 Q1(a)–(c) · 8 marks",
      q: "At $t = 0$ a parachutist falls vertically from rest from a helicopter hovering 550 m above horizontal ground. She falls freely under gravity ($g = 10$ m s$^{-2}$) for 3 s, until her parachute opens. She then decelerates at 12 m s$^{-2}$ for 2 s, reaching a constant speed with which she reaches the ground. The total time is $T$ s. **(a)** Find her speed when the parachute opens. **(b)** Sketch a speed-time graph for $0 \\le t \\le T$. **(c)** Find $T$ to the nearest whole number.",
      steps: [
        { h: "(a)", m: "$v = 0 + 10 \\times 3 = 30$ m s$^{-1}$", mk: "B1" },
        { h: "(b)", m: "From the origin up to (3, 30), straight down to (5, 6), then horizontal at 6 until $T$.", mk: "B1 B1ft", n: "Speed after braking: $30 - 12 \\times 2 = 6$. Mark 3, 5 and $T$; 3 must be the peak." },
        { h: "(c) Total area = 550", m: "$\\tfrac12 \\times 3 \\times 30 + \\tfrac12(30 + 6) \\times 2 + 6(T - 5) = 550$", mk: "M1 A2ft", n: "All three sections, each with the right shape — triangle, trapezium, rectangle." },
        { m: "$45 + 36 + 6T - 30 = 550 \\Rightarrow 6T = 499$", mk: "M1" },
        { m: "$T = 83.2 \\approx 83$", mk: "A1" }
      ], result: "(a) 30 m s$^{-1}$ (c) $T = 83$" } },
    { fig: vtFig([[0, 0], [3, 30], [5, 6], [83.17, 6]], { area: true, xt: [3, 5, { v: 83.17, label: "T" }], yt: [6, 30], yl: "speed (m s⁻¹)",
      cap: "AS June 2019: area $45 + 36 + 6(T - 5) = 550$." }) },

    /* ---------------------------------------------------------------- Page 4 */
    { page: "Unknowns and comparisons" },
    { worked: { tag: "exam", title: "Two runners who finish together", src: "AS June 2023 · P2 Q1 · 8 marks",
      q: "Pat and Sam run a race along a straight horizontal track. Both start from rest at the same time and cross the finish line together, after 27.5 s. In a model: Pat accelerates at a constant rate from rest for 5 s to 4 m s$^{-1}$, then runs at 4 m s$^{-1}$; Sam accelerates at a constant 1 m s$^{-2}$ from rest to $X$ m s$^{-1}$, then runs at $X$ m s$^{-1}$. **(a)** Explain why the areas under their two velocity-time graphs are equal. **(b)** Find Pat's acceleration during the first 5 s. **(c)** Find the length of the race. **(d)** Find $X$ to 3 significant figures.",
      steps: [
        { h: "(a)", m: "The areas are the distances travelled, and both run the same distance (the length of the race).", mk: "B1" },
        { h: "(b)", m: "$\\dfrac45 = 0.8$ m s$^{-2}$", mk: "B1" },
        { h: "(c) Pat's area", m: "$\\tfrac12 \\times 5 \\times 4 + 22.5 \\times 4 = 10 + 90$", mk: "M1" },
        { m: "$= 100$ m", mk: "A1" },
        { h: "(d) Sam takes $X$ s to reach $X$ m s$^{-1}$ (acceleration 1)", m: "$\\tfrac12 \\times X \\times X + X(27.5 - X) = 100$", mk: "M1 A1ft A1ft" },
        { m: "$X^2 - 55X + 200 = 0 \\Rightarrow X = \\dfrac{55 - \\sqrt{2225}}{2} = 3.92$", mk: "A1", n: "The other root, 51.1, would mean accelerating for longer than the race." }
      ], result: "(b) 0.8 m s$^{-2}$ (c) 100 m (d) 3.92" } },
    { fig: vtFig([[0, 0], [5, 4], [27.5, 4]], { xt: [3.92, 5, 27.5], yt: [3.92, 4],
      extra: [{ line: [[0, 0], [3.915, 3.915]], c: "accent2", w: 2.4 }, { line: [[3.915, 3.915], [27.5, 3.915]], c: "accent2", w: 2.4 },
        { text: [16, 4.5], t: "Pat (P)", c: "accent", b: true, size: 12 }, { text: [16, 3.3], t: "Sam (S)", c: "accent2", b: true, size: 12 }],
      y: [0, 5.2], cap: "Equal areas, 100 m each: Sam's lower top speed is reached sooner." }) },
    { worked: { tag: "exam", title: "A sprint: distance so far, then the finishing speed", src: "A-level June 2024 · P3 Q2(b)(c) · 6 marks",
      q: "A speed-time graph models an athlete running a 200 m race in 24 s. The athlete starts from rest at $t = 0$, accelerates at a constant rate to 10 m s$^{-1}$ at $t = 4$, runs at 10 m s$^{-1}$ from $t = 4$ to $t = 18$, then decelerates at a constant rate from $t = 18$ to $t = 24$, crossing the finishing line with speed $U$ m s$^{-1}$. Using the model, **(b)** find the distance covered during the first 18 s, **(c)** find $U$.",
      steps: [
        { h: "(b) Triangle + rectangle", m: "$\\tfrac12 \\times 4 \\times 10 + 14 \\times 10$", mk: "M1 A1", n: "Or the trapezium $\\frac12(14 + 18) \\times 10$." },
        { m: "$= 160$ m", mk: "A1" },
        { h: "(c) The last 6 s cover the remaining 40 m", m: "$\\tfrac12(10 + U) \\times 6 = 200 - 160$", mk: "M1 A1ft", n: "Not $(10 - U)$: a trapezium adds the parallel sides." },
        { m: "$10 + U = \\dfrac{40}{3} \\Rightarrow U = \\dfrac{10}{3} = 3.33$", mk: "A1" }
      ], result: "(b) 160 m (c) $U = \\frac{10}{3}$" } },

    /* ---------------------------------------------------------------- Exam toolkit */
    { page: "Exam toolkit" },
    { callout: { t: "memorise", h: "The two rules", body: [
      "Displacement-time: **gradient = velocity**.",
      "Velocity-time: **gradient = acceleration**, **area = displacement** (distance if it never goes below the axis)."
    ] } },
    { callout: { t: "memorise", h: "A sketch that scores", body: [
      "Start at the origin if it starts from rest; end **on** the $t$-axis if it comes to rest (no vertical line down).",
      "Straight lines for constant acceleration; mark every time and speed you know.",
      "A longer stage is drawn longer; a deceleration of 0.5 after an acceleration of 0.3 is the steeper side."
    ] } },
    { callout: { t: "mnemonic", h: "\"Draw, mark, area\"", body: "**Draw** the graph, **mark** the knowns and the unknown, set **area** = distance." } },
    { callout: { t: "warn", h: "Common losses", body: [
      "Using one suvat formula across stages with different accelerations.",
      "Forgetting the $\\frac12$ in a triangle or trapezium.",
      "Leaving distances in km.",
      "Taking the root of a quadratic that is impossible in context (51.1 s in a 27.5 s race)."
    ] } }
  ],
  flashcards: [
    ["Gradient of a displacement-time graph?", "Velocity."],
    ["Gradient of a velocity-time graph?", "Acceleration."],
    ["Area under a velocity-time graph?", "Displacement."],
    ["Area below the $t$-axis on a velocity-time graph?", "Negative displacement (moving backwards)."],
    ["Area of an accelerate–cruise–decelerate journey with top speed $V$, total time $T$, cruise $c$?", "$\\frac12(T + c)V$."],
    ["Horizontal line on a displacement-time graph?", "At rest."],
    ["How does a distance-time graph look while the object accelerates from rest?", "A curve with increasing gradient."],
    ["Train: 0.3 m s$^{-2}$ for 80 s. Top speed?", "24 m s$^{-1}$."],
    ["Why can one suvat equation not be used for a whole journey?", "The acceleration changes between stages."],
    ["A triangle journey: 120 s, 1500 m. Top speed?", "25 m s$^{-1}$."]
  ],
  quiz: [
    { q: "On a velocity-time graph the area under the line gives", opts: ["displacement", "acceleration", "velocity", "time"], ans: 0, why: "Velocity × time." },
    { q: "A horizontal line on a velocity-time graph means", opts: ["constant velocity", "at rest", "constant acceleration", "deceleration"], ans: 0, why: "Gradient zero, so acceleration zero." },
    { q: "A car accelerates from rest to 20 m s$^{-1}$ in 8 s. The distance is", opts: ["80 m", "160 m", "2.5 m", "40 m"], ans: 0, why: "$\\frac12 \\times 8 \\times 20$." },
    { q: "The end of a speed-time sketch for a train stopping at $B$ should", opts: ["meet the $t$-axis", "drop vertically", "stay horizontal", "go below the axis"], ans: 0, why: "A vertical line would be an instant stop." },
    { q: "A velocity-time line from (0, 6) to (5, −4) gives a distance of", opts: ["13 m", "5 m", "1 m", "25 m"], ans: 0, why: "$9 + 4$." }
  ]
};

/* =====================================================================
   M7.3  Constant acceleration
   ===================================================================== */
C["maths:M7.3"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Constant acceleration — the whole topic on one page" },
    "Spec 7.3: understand, use and **derive** the formulae for constant acceleration in a straight line, and extend them to 2 dimensions using vectors: $\\mathbf v = \\mathbf u + \\mathbf a t$, $\\mathbf r = \\mathbf u t + \\frac12 \\mathbf a t^2$, in $\\mathbf i$–$\\mathbf j$ or column form.",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["One suvat step: a speed or a distance", "2–3", "A-level June 2023 Q1, June 2025 Q1(a)"],
      ["Vertical motion: time to hit the ground from a height", "2–4", "AS 2018 Q6, AS 2020 Q1(b), AS 2022 Q1(b)"],
      ["Vertical motion: find the launch speed from the impact speed", "2–3", "AS Specimen Q1(a), AS 2020 Q1(a), AS 2022 Q1(a)"],
      ["Time to a point below the start (a quadratic, one root rejected)", "4", "AS June 2020 Q1(c)"],
      ["Sketch the velocity-time graph of a throw", "2", "AS June 2020 Q1(d)"],
      ["Height reached after a bounce", "2", "AS Specimen Q1(b)"],
      ["Vectors: find $\\mathbf u$, $\\mathbf a$, a velocity or a position", "4", "A-level Specimen Q1, Oct 2021 Q1"],
      ["Vectors: a time from one component, then the other component", "8–10", "A-level 2018 Q8, Oct 2020 Q2, 2023 Q4"],
      ["Moving in a given direction (north-east, parallel to …)", "4", "A-level 2018 Q8(b)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**The five equations** — derived from the velocity-time graph.",
      "**Using them** — choosing the equation, one-step questions.",
      "**Motion under gravity** — up, down, from a height, bouncing.",
      "**Two objects** — meeting and overtaking.",
      "**Constant acceleration with vectors**.",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "The five equations" },
    { callout: { t: "formula", h: "Constant acceleration (\"suvat\")", body: [
      "$s$ displacement, $u$ initial velocity, $v$ final velocity, $a$ acceleration, $t$ time.",
      "$$v = u + at \\qquad s = \\tfrac12(u + v)t \\qquad s = ut + \\tfrac12 at^2$$",
      "$$s = vt - \\tfrac12 at^2 \\qquad v^2 = u^2 + 2as$$",
      "Not in the formulae booklet — learn them, and be ready to derive them."
    ] } },
    { fig: vtFig([[0, 3], [6, 9]], { area: true, xt: [{ v: 6, label: "t" }], yt: [{ v: 3, label: "u" }, { v: 9, label: "v" }],
      extra: [{ line: [[0, 3], [6, 3]], c: "muted", dash: true }, { line: [[6, 3], [6, 9]], arrow: "both", c: "accent2", label: "at", loff: 12 }, { text: [3, 1.5], t: "ut", c: "text2", b: true }, { text: [4, 4.6], t: "½ at²", c: "text2", b: true }],
      y: [0, 11], cap: "Gradient $a$ gives $v = u + at$; the trapezium area gives $s = \\frac12(u + v)t$, which splits into a rectangle $ut$ and a triangle $\\frac12 at^2$." }) },
    { worked: { tag: "example", title: "Derive all five from the velocity-time graph", q: "A particle moves in a straight line with constant acceleration $a$, from velocity $u$ to velocity $v$ in time $t$, with displacement $s$. Derive the five constant-acceleration formulae.",
      steps: [
        { h: "Gradient = acceleration", m: "$a = \\dfrac{v - u}{t} \\;\\Rightarrow\\; v = u + at$" },
        { h: "Area = displacement (a trapezium)", m: "$s = \\tfrac12(u + v)t$" },
        { h: "Eliminate $v$", m: "$s = \\tfrac12(u + u + at)t = ut + \\tfrac12 at^2$" },
        { h: "Eliminate $u = v - at$", m: "$s = \\tfrac12(v - at + v)t = vt - \\tfrac12 at^2$" },
        { h: "Eliminate $t = \\frac{v - u}{a}$", m: "$s = \\tfrac12(u + v)\\dfrac{v - u}{a} = \\dfrac{v^2 - u^2}{2a} \\;\\Rightarrow\\; v^2 = u^2 + 2as$", n: "Calculus gives the same: integrate $a$ to get $v = u + at$, integrate again to get $s = ut + \\frac12 at^2$ (M7.4)." }
      ], result: "the five suvat equations" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Using the equations" },
    { table: { head: ["Variable you neither know nor want", "Use"], rows: [
      ["$s$", "$v = u + at$"],
      ["$a$", "$s = \\frac12(u + v)t$"],
      ["$v$", "$s = ut + \\frac12 at^2$"],
      ["$u$", "$s = vt - \\frac12 at^2$"],
      ["$t$", "$v^2 = u^2 + 2as$"]
    ] } },
    { steps: [
      { h: "1. Choose a positive direction", m: "Usually the direction of motion, or upwards." },
      { h: "2. List s, u, v, a, t", m: "Mark the one wanted and the one not involved." },
      { h: "3. Pick the equation without the uninvolved letter", m: "Substitute with signs, solve." }
    ] },
    { worked: { tag: "exam", title: "A speed and a distance from rest", src: "A-level June 2023 · P3 Q1 · 3 marks",
      q: "A car is initially at rest on a straight horizontal road. It then accelerates along the road with a constant acceleration of 3.2 m s$^{-2}$. Find **(a)** the speed of the car after 5 s, **(b)** the distance travelled by the car in the first 5 s.",
      steps: [
        { h: "(a) $v = u + at$", m: "$v = 0 + 3.2 \\times 5 = 16$ m s$^{-1}$", mk: "B1" },
        { h: "(b) $s = ut + \\frac12 at^2$", m: "$s = \\tfrac12 \\times 3.2 \\times 5^2$", mk: "M1", n: "Or $s = \\frac12(0 + 16) \\times 5$ using (a)." },
        { m: "$s = 40$ m", mk: "A1" }
      ], result: "(a) 16 m s$^{-1}$ (b) 40 m" } },
    { worked: { tag: "exam", title: "Already moving: a speed 4 s later", src: "A-level June 2025 · P3 Q1(a) · 2 marks",
      q: "A car moves in a straight line along a horizontal road with constant acceleration 2 m s$^{-2}$. It is moving with speed 15 m s$^{-1}$ in the direction of the acceleration when it passes a signpost. Modelling the car as a particle, find its speed 4 s after passing the signpost.",
      steps: [
        { h: "$v = u + at$", m: "$v = 15 + 2 \\times 4$", mk: "M1", n: "M0 for $u = 0$." },
        { m: "$v = 23$ m s$^{-1}$", mk: "A1" }
      ], result: "23 m s$^{-1}$" } },
    { worked: { tag: "variation", title: "Braking distance with $v^2 = u^2 + 2as$", q: "A car travelling at 72 km h$^{-1}$ brakes with constant deceleration 5 m s$^{-2}$. Find the distance it travels before stopping and the time it takes.",
      steps: [
        { h: "Units", m: "$u = 72 \\div 3.6 = 20$ m s$^{-1}$, $v = 0$, $a = -5$" },
        { h: "No $t$: $v^2 = u^2 + 2as$", m: "$0 = 400 - 10s \\Rightarrow s = 40$ m" },
        { h: "Time: $v = u + at$", m: "$0 = 20 - 5t \\Rightarrow t = 4$ s" }
      ], result: "40 m, 4 s" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Motion under gravity" },
    { callout: { t: "memorise", h: "Moving freely under gravity", body: [
      "The acceleration is $g$ **downwards** throughout — on the way up, at the top and on the way down.",
      "Take **up as positive**: $a = -9.8$ (or $-10$ if told), a point below the start has $s < 0$, a downward velocity is negative.",
      "At the top $v = 0$. Times up and down to the same level are equal, and the speed back at the start equals the launch speed."
    ] } },
    { fig: vertFig([[11.025, "top: v = 0"], [0, "A: u = 14.7 m s⁻¹ up"], [-19.6, "ground: s = −19.6", "accent3"]],
      { lo: -21, hi: 13, h: 240, w: 420, ground: -19.6,
        paths: [[150, 0, 11.025, "a = −9.8 all the way", "accent2"], [210, 11.025, -19.6, "", "accent"]],
        cap: "AS Specimen: up positive, the ground is at $s = -19.6$ for the whole flight. One equation covers the whole motion." }) },
    { worked: { tag: "exam", title: "Impact speed in one equation; then the height after the bounce", src: "AS Specimen · P2 Q1(a)(b) · 5 marks",
      q: "A small ball is projected vertically upwards from a point $A$ which is 19.6 m above the ground. It strikes the ground for the first time 4 s later. The ball is modelled as a particle moving freely under gravity. **(a)** Find the speed of the ball as it hits the ground for the first time. The ball rebounds with a vertical speed of 14.7 m s$^{-1}$ and next comes to instantaneous rest at $B$. **(b)** Find the height of $B$ above the ground.",
      steps: [
        { h: "(a) No $u$: $s = vt - \\frac12 at^2$ (up positive)", m: "$-19.6 = 4v - \\tfrac12(-9.8)(4^2) = 4v + 78.4$", mk: "M1 A1", n: "Or find $u$ first: $-19.6 = 4u - 4.9 \\times 16 \\Rightarrow u = 14.7$, then $v = 14.7 - 9.8 \\times 4$." },
        { m: "$v = -24.5$, so the speed is 24.5 m s$^{-1}$", mk: "A1" },
        { h: "(b) $v^2 = u^2 + 2as$ up from the ground", m: "$0 = 14.7^2 - 2 \\times 9.8 \\times h$", mk: "M1" },
        { m: "$h = 11.025 \\approx 11$ m", mk: "A1" }
      ], result: "(a) 24.5 m s$^{-1}$ (b) 11 m" } },
    { worked: { tag: "exam", title: "A tennis ball: time to the ground", src: "AS June 2018 · P2 Q6 · 4 marks",
      q: "A man throws a tennis ball into the air so that, as it leaves his hand, the ball is 2 m above the ground and moving vertically upwards with speed 9 m s$^{-1}$. The ball is modelled as a particle moving freely under gravity, with $g$ modelled as 10 m s$^{-2}$. The ball hits the ground $T$ seconds after leaving his hand. Find $T$.",
      steps: [
        { h: "Whole flight, up positive: $s = -2$", m: "$-2 = 9T - \\tfrac12 \\times 10 \\times T^2$", mk: "M1 A1", n: "Splitting works too: 0.9 s up, then 1.1 s down." },
        { m: "$5T^2 - 9T - 2 = 0 \\Rightarrow (5T + 1)(T - 2) = 0$", mk: "DM1" },
        { m: "$T = 2$ (only)", mk: "A1", n: "Giving both roots is A0." }
      ], result: "$T = 2$" } },
    { worked: { tag: "exam", title: "Launch speed, flight time, a point below the start, the graph", src: "AS June 2020 · P2 Q1(a)–(d) · 10 marks",
      q: "At $t = 0$ a small ball is projected vertically upwards with speed $U$ m s$^{-1}$ from a point $A$ that is 16.8 m above horizontal ground. Its speed immediately before it first hits the ground is 19 m s$^{-1}$, at $t = T$. The ball is modelled as a particle moving freely under gravity with $g = 10$ m s$^{-2}$. **(a)** Show that $U = 5$. **(b)** Find $T$. **(c)** Find the time from projection until the ball is 1.2 m below $A$. **(d)** Sketch a velocity-time graph for $0 \\le t \\le T$, stating the coordinates of its start and end points.",
      steps: [
        { h: "(a) $v^2 = u^2 + 2as$, up positive", m: "$(-19)^2 = U^2 + 2(-10)(-16.8)$", mk: "M1" },
        { m: "$U^2 = 361 - 336 = 25 \\Rightarrow U = 5$", mk: "A1*" },
        { h: "(b) $v = u + at$", m: "$-19 = 5 - 10T$", mk: "M1" },
        { m: "$T = 2.4$", mk: "A1" },
        { h: "(c) $s = -1.2$", m: "$-1.2 = 5t - 5t^2$", mk: "M1 A1" },
        { m: "$5t^2 - 5t - 1.2 = 0 \\Rightarrow 25t^2 - 25t - 6 = 0 \\Rightarrow (5t + 1)(5t - 6) = 0$", mk: "M(A)1" },
        { m: "$t = 1.2$ s", mk: "A1", n: "The root $t = -0.2$ is before projection." },
        { h: "(d)", m: "A straight line from $(0, 5)$ down to $(2.4, -19)$, crossing the axis at $t = 0.5$.", mk: "B1 B1ft", n: "A reflection (down positive) is also accepted, from $(0, -5)$ to $(2.4, 19)$." }
      ], result: "(b) 2.4 (c) 1.2 s" } },
    { fig: vtFig([[0, 5], [2.4, -19]], { xt: [0.5, 1.2, 2.4], yt: [-19, 5], y: [-22, 8],
      marks: [[0, 5, "(0, 5)", "e"], [2.4, -19, "(2.4, −19)", "w"]],
      cap: "AS June 2020: one straight line, gradient $-10$, for the whole flight. Above the axis going up, below coming down." }) },
    { worked: { tag: "exam", title: "Launch speed from the impact speed; then the time", src: "AS June 2022 · P2 Q1(a)(b) · 5 marks",
      q: "The point $A$ is 1.8 m vertically above horizontal ground. At $t = 0$ a small stone is projected vertically upwards with speed $U$ m s$^{-1}$ from $A$, and hits the ground at $t = T$ with speed 10 m s$^{-1}$. The stone is modelled as a particle moving freely under gravity with $g = 10$ m s$^{-2}$. Find **(a)** $U$, **(b)** $T$.",
      steps: [
        { h: "(a) An equation in $U$ only", m: "$10^2 = U^2 + 2(-10)(-1.8)$", mk: "M1 A1" },
        { m: "$U^2 = 64 \\Rightarrow U = 8$", mk: "A1" },
        { h: "(b)", m: "$-10 = 8 - 10T$", mk: "M1" },
        { m: "$T = 1.8$", mk: "A1" }
      ], result: "(a) 8 (b) 1.8" } },

    /* ---------------------------------------------------------------- Page 4 */
    { page: "Two objects" },
    "When two objects move at once, give each its own suvat with the **same clock**, write each position from the **same origin**, and set the positions equal (they meet) or the gap to a value.",
    { worked: { tag: "variation", title: "Overtaking from rest", q: "A van passes a stationary car at a constant 20 m s$^{-1}$. At that instant the car sets off after it with constant acceleration 2 m s$^{-2}$. Find when and where the car catches the van, and the car's speed then.",
      steps: [
        { h: "Positions from the meeting point", m: "Van: $x = 20t$; $\\quad$ car: $x = \\tfrac12 \\times 2t^2 = t^2$" },
        { h: "Equal positions", m: "$t^2 = 20t \\Rightarrow t = 20$ s (not 0, the start)" },
        { m: "$x = 400$ m; car's speed $= 2 \\times 20 = 40$ m s$^{-1}$" }
      ], result: "20 s, 400 m, 40 m s$^{-1}$" } },
    { worked: { tag: "variation", title: "Two stones meeting in the air", q: "Stone $P$ is dropped from rest from the top of a 40 m tower. At the same instant stone $Q$ is thrown vertically upwards from the foot of the tower at 20 m s$^{-1}$. Find when and at what height they meet ($g = 9.8$).",
      steps: [
        { h: "Heights above the ground", m: "$P$: $h = 40 - 4.9t^2$; $\\quad Q$: $h = 20t - 4.9t^2$" },
        { h: "Equal", m: "$40 = 20t \\Rightarrow t = 2$ s", n: "The $4.9t^2$ terms cancel — both have the same acceleration." },
        { m: "$h = 40 - 4.9 \\times 4 = 20.4$ m" }
      ], result: "2 s, 20.4 m" } },

    /* ---------------------------------------------------------------- Page 5 */
    { page: "Constant acceleration with vectors" },
    { callout: { t: "formula", h: "In two dimensions", body: [
      "$$\\mathbf v = \\mathbf u + \\mathbf a t \\qquad \\mathbf r = \\mathbf r_0 + \\mathbf u t + \\tfrac12 \\mathbf a t^2$$",
      "Each is two equations at once: one for the $\\mathbf i$-components, one for the $\\mathbf j$-components, sharing the same $t$. $v^2 = u^2 + 2as$ has **no** vector form — do not use it."
    ] } },
    { kv: [
      ["Speed", "$|\\mathbf v| = \\sqrt{v_x^2 + v_y^2}$"],
      ["Moving parallel to $p\\mathbf i + q\\mathbf j$", "$\\mathbf v = k(p\\mathbf i + q\\mathbf j)$: $\\; v_x : v_y = p : q$"],
      ["Moving north-east", "$v_x = v_y$ (both positive)"],
      ["Moving due north / perpendicular to $\\mathbf i$", "$v_x = 0$"],
      ["Passing through a point", "match **one** component to find $t$, then use the other"]
    ] },
    { worked: { tag: "exam", title: "Find the initial velocity", src: "A-level Specimen · P3 Q1 · 4 marks",
      q: "A particle $P$ moves with constant acceleration $(\\mathbf i - 2\\mathbf j)$ m s$^{-2}$. At $t = 0$ it is at $A$, with position vector $(2\\mathbf i + 5\\mathbf j)$ m, moving with velocity $\\mathbf u$ m s$^{-1}$. At $t = 3$ s it is at $B$, with position vector $(-2.5\\mathbf i + 8\\mathbf j)$ m. Find $\\mathbf u$.",
      steps: [
        { h: "Displacement $\\overrightarrow{AB}$", m: "$(-2.5\\mathbf i + 8\\mathbf j) - (2\\mathbf i + 5\\mathbf j) = -4.5\\mathbf i + 3\\mathbf j$", mk: "B1" },
        { h: "$\\mathbf s = \\mathbf u t + \\frac12 \\mathbf a t^2$", m: "$-4.5\\mathbf i + 3\\mathbf j = 3\\mathbf u + \\tfrac92(\\mathbf i - 2\\mathbf j)$", mk: "M1 A1ft" },
        { m: "$3\\mathbf u = -9\\mathbf i + 12\\mathbf j \\Rightarrow \\mathbf u = -3\\mathbf i + 4\\mathbf j$", mk: "A1" }
      ], result: "$\\mathbf u = (-3\\mathbf i + 4\\mathbf j)$ m s$^{-1}$" } },
    { worked: { tag: "exam", title: "A velocity, then a position", src: "A-level Oct 2021 · P3 Q1 · 4 marks",
      q: "A particle $P$ moves with constant acceleration $(2\\mathbf i - 3\\mathbf j)$ m s$^{-2}$. At $t = 0$, $P$ is moving with velocity $4\\mathbf i$ m s$^{-1}$. **(a)** Find the velocity of $P$ at $t = 2$ s. At $t = 0$ the position vector of $P$ relative to $O$ is $(\\mathbf i + \\mathbf j)$ m. **(b)** Find the position vector of $P$ at $t = 3$ s.",
      steps: [
        { h: "(a)", m: "$\\mathbf v = 4\\mathbf i + 2(2\\mathbf i - 3\\mathbf j)$", mk: "M1" },
        { m: "$\\mathbf v = (8\\mathbf i - 6\\mathbf j)$ m s$^{-1}$", mk: "A1" },
        { h: "(b)", m: "$\\mathbf r = (\\mathbf i + \\mathbf j) + 3(4\\mathbf i) + \\tfrac92(2\\mathbf i - 3\\mathbf j)$", mk: "M1", n: "Do not forget the starting position $\\mathbf i + \\mathbf j$." },
        { m: "$\\mathbf r = (22\\mathbf i - 12.5\\mathbf j)$ m", mk: "A1" }
      ], result: "(a) $8\\mathbf i - 6\\mathbf j$ (b) $22\\mathbf i - 12.5\\mathbf j$" } },
    { worked: { tag: "exam", title: "Show the acceleration; then the time to move north-east", src: "A-level June 2018 · P3 Q8 · 8 marks",
      q: "[$\\mathbf i$ and $\\mathbf j$ are horizontal unit vectors due east and due north.] A particle $P$ moves with constant acceleration. At $t = 0$ it is at $O$ moving with velocity $(2\\mathbf i - 3\\mathbf j)$ m s$^{-1}$. At $t = 2$ s it is at $A$, with position vector $(7\\mathbf i - 10\\mathbf j)$ m. **(a)** Show that the magnitude of the acceleration of $P$ is 2.5 m s$^{-2}$. As $P$ leaves $A$, its acceleration changes to a constant $(4\\mathbf i + 8.8\\mathbf j)$ m s$^{-2}$. At the instant $P$ reaches $B$, its direction of motion is north-east. **(b)** Find the time it takes to travel from $A$ to $B$.",
      steps: [
        { h: "(a) $\\mathbf r = \\mathbf u t + \\frac12 \\mathbf a t^2$", m: "$7\\mathbf i - 10\\mathbf j = 2(2\\mathbf i - 3\\mathbf j) + \\tfrac12 \\mathbf a (2^2)$", mk: "M1" },
        { m: "$2\\mathbf a = 3\\mathbf i - 4\\mathbf j \\Rightarrow \\mathbf a = 1.5\\mathbf i - 2\\mathbf j$", mk: "A1" },
        { m: "$|\\mathbf a| = \\sqrt{1.5^2 + 2^2}$", mk: "M1" },
        { m: "$= \\sqrt{6.25} = 2.5$ m s$^{-2}$", mk: "A1*" },
        { h: "(b) Velocity at $A$", m: "$\\mathbf v_A = (2\\mathbf i - 3\\mathbf j) + 2(1.5\\mathbf i - 2\\mathbf j) = 5\\mathbf i - 7\\mathbf j$", mk: "M1 A1" },
        { h: "After $A$", m: "$\\mathbf v = (5 + 4t)\\mathbf i + (8.8t - 7)\\mathbf j$; north-east: $5 + 4t = 8.8t - 7$", mk: "M1" },
        { m: "$4.8t = 12 \\Rightarrow t = 2.5$ s", mk: "A1", n: "Check: $\\mathbf v = 15\\mathbf i + 15\\mathbf j$, both positive, so north-east (not south-west)." }
      ], result: "(b) 2.5 s" } },
    { worked: { tag: "exam", title: "A time from the $\\mathbf j$-component, then $\\lambda$", src: "A-level Oct 2020 · P3 Q2 · 8 marks",
      q: "A particle $P$ moves with acceleration $(4\\mathbf i - 5\\mathbf j)$ m s$^{-2}$. At $t = 0$, $P$ is moving with velocity $(-2\\mathbf i + 2\\mathbf j)$ m s$^{-1}$. **(a)** Find the velocity of $P$ at $t = 2$ s. At $t = 0$, $P$ passes through $O$. At $t = T$, where $T > 0$, $P$ passes through $A$, with position vector $(\\lambda\\mathbf i - 4.5\\mathbf j)$ m. **(b)** Find $T$. **(c)** Hence find $\\lambda$.",
      steps: [
        { h: "(a)", m: "$\\mathbf v = (-2\\mathbf i + 2\\mathbf j) + 2(4\\mathbf i - 5\\mathbf j)$", mk: "M1" },
        { m: "$= (6\\mathbf i - 8\\mathbf j)$ m s$^{-1}$", mk: "A1" },
        { h: "(b) Only the $\\mathbf j$-component is known", m: "$\\mathbf r = T(-2\\mathbf i + 2\\mathbf j) + \\tfrac12 T^2(4\\mathbf i - 5\\mathbf j)$", mk: "M1" },
        { m: "$\\mathbf j$: $\\; 2T - 2.5T^2 = -4.5$", mk: "A1 M1" },
        { m: "$5T^2 - 4T - 9 = 0 \\Rightarrow (5T - 9)(T + 1) = 0 \\Rightarrow T = 1.8$", mk: "A1" },
        { h: "(c) $\\mathbf i$-component", m: "$\\lambda = -2(1.8) + 2(1.8)^2$", mk: "M1" },
        { m: "$\\lambda = 2.88$", mk: "A1" }
      ], result: "(a) $6\\mathbf i - 8\\mathbf j$ (b) $T = 1.8$ (c) $\\lambda = 2.88$" } },
    { worked: { tag: "exam", title: "A speed; a time from the $\\mathbf i$-component; then $c$", src: "A-level June 2023 · P3 Q4 · 10 marks",
      q: "A particle $P$ moves on a smooth horizontal plane with constant acceleration $(2.4\\mathbf i + \\mathbf j)$ m s$^{-2}$. At $t = 0$ it passes through $A$ with velocity $(-16\\mathbf i - 3\\mathbf j)$ m s$^{-1}$; at $t = 5$ s it passes through $B$. **(a)** Find the speed of $P$ at $B$. The position vector of $A$ is $(44\\mathbf i - 10\\mathbf j)$ m. At $t = T$, where $T > 5$, $P$ passes through $C$, with position vector $(4\\mathbf i + c\\mathbf j)$ m. **(b)** Find $T$. **(c)** Find $c$.",
      steps: [
        { h: "(a)", m: "$\\mathbf v_B = (-16\\mathbf i - 3\\mathbf j) + 5(2.4\\mathbf i + \\mathbf j)$", mk: "M1" },
        { m: "$= -4\\mathbf i + 2\\mathbf j$", mk: "A1" },
        { m: "speed $= \\sqrt{(-4)^2 + 2^2}$", mk: "M1" },
        { m: "$= 2\\sqrt5 = 4.47$ m s$^{-1}$", mk: "A1" },
        { h: "(b) $\\mathbf i$-component from $A$", m: "$4 = 44 - 16T + 1.2T^2$", mk: "M1 A1" },
        { m: "$1.2T^2 - 16T + 40 = 0 \\Rightarrow 3T^2 - 40T + 100 = 0 \\Rightarrow (3T - 10)(T - 10) = 0$; $\\; T > 5$, so $T = 10$", mk: "A1" },
        { h: "(c) $\\mathbf j$-component at $T = 10$", m: "$c = -10 + (-3)(10) + \\tfrac12(1)(10^2)$", mk: "M1 A1" },
        { m: "$c = 10$", mk: "A1" }
      ], result: "(a) 4.47 m s$^{-1}$ (b) $T = 10$ (c) $c = 10$" } },
    { fig: { x: [-12, 50], y: [-16, 14], w: 500, h: 260, aspect: "equal",
      axes: { x: "x (m)", y: "y (m)", xt: [-10, 10, 20, 30, 40], yt: [-10, 10] },
      items: [
        { param: { x: "44-16*t+1.2*t^2", y: "-10-3*t+0.5*t^2" }, t: [0, 10.5], c: "accent", w: 2.2 },
        { pt: [44, -10], label: "A (t = 0)", pos: "s", i: false },
        { pt: [-6, -12.5], label: "B (t = 5)", pos: "s", i: false },
        { pt: [4, 10], label: "C (t = 10)", pos: "e", i: false },
        { pt: [-9.33, -14.4], r: 2.5, c: "muted" }
      ], cap: "A-level June 2023 Q4: the particle heads west, is turned round by the acceleration and passes $C(4, 10)$ at $t = 10$. The time $\\frac{10}{3}$ is the first pass through $x = 4$, rejected because it is before $B$." } },

    /* ---------------------------------------------------------------- Exam toolkit */
    { page: "Exam toolkit" },
    { callout: { t: "memorise", h: "The method", body: [
      "Positive direction first. List s u v a t. Drop the letter you neither know nor want.",
      "Vertical motion: $a = -g$ all the way; a point below the start is a negative $s$; one equation can cover the whole flight.",
      "Vectors: $\\mathbf v = \\mathbf u + \\mathbf a t$, $\\mathbf r = \\mathbf r_0 + \\mathbf u t + \\frac12 \\mathbf a t^2$; one component gives $t$, the other gives the unknown."
    ] } },
    { callout: { t: "mnemonic", h: "\"Which one is missing?\"", body: "No $s$ → $v = u + at$; no $t$ → $v^2 = u^2 + 2as$; no $v$ → $s = ut + \\frac12 at^2$; no $u$ → $s = vt - \\frac12 at^2$; no $a$ → $s = \\frac12(u + v)t$." } },
    { callout: { t: "warn", h: "Common losses", body: [
      "Inconsistent signs: $u = 14.7$ up but $a = +9.8$.",
      "Keeping a negative root for a time, or giving both roots.",
      "Forgetting the starting position vector $\\mathbf r_0$.",
      "Using $v^2 = u^2 + 2as$ with vectors.",
      "North-east needs $v_x = v_y > 0$ — check the signs."
    ] } }
  ],
  flashcards: [
    ["Five suvat equations?", "$v = u + at$; $s = \\frac12(u + v)t$; $s = ut + \\frac12 at^2$; $s = vt - \\frac12 at^2$; $v^2 = u^2 + 2as$."],
    ["Which equation has no $t$?", "$v^2 = u^2 + 2as$."],
    ["Which equation has no $u$?", "$s = vt - \\frac12 at^2$."],
    ["How is $v = u + at$ derived?", "From the gradient of the velocity-time graph."],
    ["How is $s = \\frac12(u + v)t$ derived?", "From the area (a trapezium) under the velocity-time graph."],
    ["Acceleration of a ball thrown upwards, at the top?", "$g$ downwards — not zero."],
    ["Velocity at the top of a vertical throw?", "Zero."],
    ["Ball thrown up at $u$: time to the top?", "$u / g$."],
    ["Greatest height above the start of a ball thrown up at $u$?", "$u^2 / (2g)$."],
    ["Vector suvat equations?", "$\\mathbf v = \\mathbf u + \\mathbf a t$, $\\mathbf r = \\mathbf r_0 + \\mathbf u t + \\frac12 \\mathbf a t^2$."],
    ["Condition for moving north-east?", "$v_x = v_y$, both positive."],
    ["Condition for moving parallel to $\\mathbf j$?", "$v_x = 0$."]
  ],
  quiz: [
    { q: "A car accelerates from 10 m s$^{-1}$ at 2 m s$^{-2}$ for 5 s. Its speed is", opts: ["20 m s$^{-1}$", "15 m s$^{-1}$", "12 m s$^{-1}$", "35 m s$^{-1}$"], ans: 0, why: "$10 + 2 \\times 5$." },
    { q: "To find a stopping distance without the time, use", opts: ["$v^2 = u^2 + 2as$", "$v = u + at$", "$s = ut + \\frac12 at^2$", "$s = vt - \\frac12 at^2$"], ans: 0, why: "No $t$." },
    { q: "A ball is thrown up at 19.6 m s$^{-1}$ ($g = 9.8$). It returns to the hand after", opts: ["4 s", "2 s", "1 s", "19.6 s"], ans: 0, why: "2 s up, 2 s down." },
    { q: "With up positive, a point 3 m below the start has", opts: ["$s = -3$", "$s = 3$", "$s = 0$", "$a = -3$"], ans: 0, why: "Below the start is negative." },
    { q: "$\\mathbf u = 2\\mathbf i$, $\\mathbf a = \\mathbf j$. After 2 s, $\\mathbf v$ is", opts: ["$2\\mathbf i + 2\\mathbf j$", "$2\\mathbf i + \\mathbf j$", "$4\\mathbf i + 2\\mathbf j$", "$2\\mathbf j$"], ans: 0, why: "$\\mathbf u + 2\\mathbf a$." },
    { q: "$\\mathbf v = (3 + t)\\mathbf i + (2t - 1)\\mathbf j$ is parallel to $\\mathbf i + \\mathbf j$ when", opts: ["$t = 4$", "$t = 1$", "$t = 3$", "$t = 0.5$"], ans: 0, why: "$3 + t = 2t - 1$." }
  ]
};

/* =====================================================================
   M7.4  Calculus in kinematics
   ===================================================================== */
C["maths:M7.4"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Calculus in kinematics — the whole topic on one page" },
    "Spec 7.4: use calculus for motion in a straight line — $v = \\dfrac{dr}{dt}$, $a = \\dfrac{dv}{dt} = \\dfrac{d^2r}{dt^2}$, $r = \\displaystyle\\int v\\,dt$, $v = \\displaystyle\\int a\\,dt$ — and extend to 2 dimensions using vectors. The calculus is that of Pure sections 7 and 8.",
    "Use it whenever the acceleration is **not constant** (a formula in $t$). Every AS paper has one of these, every A-level paper has the vector version:",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Instantaneous rest: solve $v = 0$", "2–5", "AS Specimen Q4(b), 2018 Q8(a), 2019 Q3(a), 2021 Q2(b), 2022 Q3(a), 2023 Q3(a), 2025 Q4(a)"],
      ["Acceleration at an instant; when it stops accelerating ($a = 0$)", "2–5", "AS 2019 Q3(a), 2020 Q3(a), 2021 Q2(a), 2022 Q3(a), 2023 Q3(b), 2024 Q2(a)"],
      ["Distance over an interval with no turning point", "3", "AS Specimen Q4(a), 2019 Q3(b), 2020 Q3(b), 2024 Q2(b)"],
      ["**Total distance** across a turning point", "3–4", "AS 2018 Q8(b), 2021 Q2(c), 2022 Q3(b), 2023 Q3(c), 2025 Q4(b)"],
      ["Returns to the start; never negative; maximum speed", "2–3", "AS Specimen Q4(c), 2018 Q8(c), 2025 Q4(c)"],
      ["Vectors: differentiate/integrate, with a constant from a given position", "3–6", "A-level 2018 Q6, 2022 Q1, Oct 2020 Q3, Oct 2021 Q5"],
      ["Vectors: speed, moving parallel/perpendicular, a bearing", "2–6", "A-level 2023 Q3, 2024 Q4, 2025 Q4, Oct 2021 Q5"],
      ["Force from a variable velocity ($\\mathbf F = m\\mathbf a$)", "7", "A-level Specimen Q2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**The calculus chain** — differentiate down, integrate up, find the constant.",
      "**Rest, acceleration and extremes** — straight-line questions on $v$ and $a$.",
      "**Distance with calculus** — when the particle turns round.",
      "**Calculus with vectors**.",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "The calculus chain" },
    { fig: { w: 500, h: 130, items: [
      { poly: [[20, 40], [130, 40], [130, 90], [20, 90]], c: "accent", w: 1.6 }, { text: [75, 65], t: "r (or s, x)", b: true, c: "text", size: 13 },
      { poly: [[195, 40], [305, 40], [305, 90], [195, 90]], c: "accent", w: 1.6 }, { text: [250, 65], t: "v", b: true, c: "text", size: 14 },
      { poly: [[370, 40], [480, 40], [480, 90], [370, 90]], c: "accent", w: 1.6 }, { text: [425, 65], t: "a", b: true, c: "text", size: 14 },
      { line: [[135, 52], [190, 52]], arrow: true, c: "accent2", w: 2 }, { line: [[310, 52], [365, 52]], arrow: true, c: "accent2", w: 2 },
      { text: [162, 30], t: "d/dt", c: "accent2", b: true, size: 12 }, { text: [338, 30], t: "d/dt", c: "accent2", b: true, size: 12 },
      { line: [[190, 78], [135, 78]], arrow: true, c: "accent3", w: 2 }, { line: [[365, 78], [310, 78]], arrow: true, c: "accent3", w: 2 },
      { text: [162, 104], t: "∫ dt + c", c: "accent3", b: true, size: 12 }, { text: [338, 104], t: "∫ dt + c", c: "accent3", b: true, size: 12 }
    ], cap: "Differentiate to go right, integrate to go left — and every integration needs its constant." } },
    { callout: { t: "memorise", h: "Which tool?", body: [
      "Acceleration **constant** → suvat (M7.3). Acceleration **a function of $t$** → calculus. Using suvat on a $t$-dependent motion scores nothing.",
      "The constant of integration comes from a known value: \"starts from rest at $O$\" gives $v = 0$ and $s = 0$ at $t = 0$; \"when $t = 1$, $\\mathbf r = -\\mathbf j$\" fixes $\\mathbf c$.",
      "A definite integral $\\int_a^b v\\,dt$ is a **displacement**, not a distance."
    ] } },
    { worked: { tag: "example", title: "Up the chain with a constant", q: "A particle moves in a straight line with acceleration $a = (6t - 4)$ m s$^{-2}$. When $t = 0$ it is at $O$ with velocity 3 m s$^{-1}$. Find $v$ and $s$ in terms of $t$.",
      steps: [
        { h: "Integrate $a$", m: "$v = 3t^2 - 4t + c$; $\\; t = 0, v = 3 \\Rightarrow c = 3$: $\\; v = 3t^2 - 4t + 3$" },
        { h: "Integrate $v$", m: "$s = t^3 - 2t^2 + 3t + k$; $\\; t = 0, s = 0 \\Rightarrow k = 0$" }
      ], result: "$v = 3t^2 - 4t + 3$, $s = t^3 - 2t^2 + 3t$" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Rest, acceleration and extremes" },
    { kv: [
      ["Instantaneous rest", "$v = 0$ (solve; reject $t < 0$)"],
      ["Stops accelerating / maximum or minimum velocity", "$a = \\dfrac{dv}{dt} = 0$"],
      ["Changes direction", "$v = 0$ **and** $v$ changes sign there"],
      ["Returns to the start", "displacement $s = 0$ (with $t > 0$)"],
      ["Maximum speed on an interval", "check $|v|$ where $a = 0$ and at the ends"]
    ] },
    { worked: { tag: "exam", title: "Distance in the first second; direction change; back to the start", src: "AS Specimen · P2 Q4 · 8 marks",
      q: "A particle $P$ moves along a straight line such that at time $t$ seconds, $t \\ge 0$, its velocity is $v = 16 - 3t^2$ m s$^{-1}$. Find **(a)** the distance travelled by $P$ in the first second, **(b)** the value of $t$ when $P$ changes its direction of motion, **(c)** the value of $t$ when $P$ returns to its starting point.",
      steps: [
        { h: "(a) $v > 0$ on $[0, 1]$, so integrate", m: "$\\displaystyle\\int_0^1 (16 - 3t^2)\\,dt = \\big[16t - t^3\\big]_0^1$", mk: "M1 A1" },
        { m: "$= 15$ m", mk: "A1" },
        { h: "(b)", m: "$16 - 3t^2 = 0$", mk: "M1" },
        { m: "$t = \\dfrac{4}{\\sqrt3} = 2.31$", mk: "A1" },
        { h: "(c) Displacement zero", m: "$s = 16t - t^3 = 0$", mk: "M1" },
        { m: "$t(16 - t^2) = 0 \\Rightarrow t = 4$", mk: "A1 A1" }
      ], result: "(a) 15 m (b) 2.31 (c) 4" } },
    { worked: { tag: "exam", title: "Acceleration at rest; distance over 3 s", src: "AS June 2019 · P2 Q3 · 8 marks",
      q: "A particle $P$ moves along a straight line such that at time $t$ seconds, $t \\ge 0$, its velocity is modelled as $v = 12 + 4t - t^2$ m s$^{-1}$. Find **(a)** the magnitude of the acceleration of $P$ when $P$ is at instantaneous rest, **(b)** the distance travelled by $P$ in the interval $0 \\le t \\le 3$.",
      steps: [
        { h: "(a) Rest", m: "$t^2 - 4t - 12 = 0 \\Rightarrow (t - 6)(t + 2) = 0 \\Rightarrow t = 6$", mk: "M1 A1" },
        { h: "Differentiate", m: "$a = 4 - 2t$", mk: "M1" },
        { m: "$t = 6$: $a = -8$, magnitude 8 m s$^{-2}$", mk: "M1 A1" },
        { h: "(b) $v > 0$ throughout (first rest at $t = 6$)", m: "$\\displaystyle\\int_0^3 (12 + 4t - t^2)\\,dt = \\Big[12t + 2t^2 - \\tfrac{t^3}{3}\\Big]_0^3$", mk: "M1 A1" },
        { m: "$= 36 + 18 - 9 = 45$ m", mk: "A1" }
      ], result: "(a) 8 m s$^{-2}$ (b) 45 m" } },
    { worked: { tag: "exam", title: "When it stops accelerating; where it turns (no calculator)", src: "AS June 2020 · P2 Q3 · 9 marks",
      q: "In this question solutions relying on calculator technology are not acceptable. A particle $P$ moves along a straight line; $t$ seconds after leaving the point $O$ on the line its velocity is modelled as $v = (7 - 2t)(t + 2)$ m s$^{-1}$. **(a)** Find the value of $t$ when $P$ stops accelerating. **(b)** Find the distance of $P$ from $O$ when $P$ changes its direction of motion.",
      steps: [
        { h: "(a) Expand, differentiate", m: "$v = 14 + 3t - 2t^2$; $\\; a = 3 - 4t$", mk: "M1 A1" },
        { m: "$a = 0$: $t = \\dfrac34$", mk: "M1 A1" },
        { h: "(b) Direction changes at $v = 0$", m: "$t = \\dfrac72$ (the root $t = -2$ is rejected)", mk: "B1" },
        { h: "Integrate from $O$", m: "$s = 14t + \\tfrac32 t^2 - \\tfrac23 t^3$", mk: "M1 A1" },
        { m: "$s = 49 + \\dfrac{147}{8} - \\dfrac{343}{12} = \\dfrac{1176 + 441 - 686}{24}$", mk: "M1" },
        { m: "$= \\dfrac{931}{24} = 38.8$ m", mk: "A1" }
      ], result: "(a) $\\frac34$ (b) $\\frac{931}{24}$ m" } },
    { worked: { tag: "exam", title: "Rest twice; total distance; maximum speed", src: "AS June 2025 · P2 Q4 · 10 marks",
      q: "In this question you must show all stages of your working. A particle $P$ moves along a straight line; at time $t$ seconds, $t \\ge 0$, its distance from a fixed point $O$ on the line is $s = 2t^3 - 12t^2 + 18t$ metres. **(a)** Find the values of $t$ for which $P$ is instantaneously at rest. **(b)** Find the total distance travelled by $P$ in the interval $0 \\le t \\le 4$. **(c)** Find the maximum speed of $P$ in the interval $1 \\le t \\le 3$.",
      steps: [
        { h: "(a) Differentiate", m: "$v = 6t^2 - 24t + 18$", mk: "M1 A1" },
        { m: "$6(t - 1)(t - 3) = 0 \\Rightarrow t = 1, 3$", mk: "M1 A1" },
        { h: "(b) Positions at 0, 1, 3, 4", m: "$s(0) = 0$, $s(1) = 8$, $s(3) = 0$, $s(4) = 8$", mk: "M1" },
        { m: "$8 + 8 + 8$", mk: "M1" },
        { m: "$= 24$ m", mk: "A1" },
        { h: "(c) $a = 0$", m: "$a = 12t - 24 = 0 \\Rightarrow t = 2$", mk: "M1" },
        { m: "$v(2) = 24 - 48 + 18 = -6$", mk: "M1" },
        { m: "maximum speed 6 m s$^{-1}$", mk: "A1", n: "At $t = 1$ and $t = 3$ the speed is 0, so the largest $|v|$ is at $t = 2$." }
      ], result: "(a) 1, 3 (b) 24 m (c) 6 m s$^{-1}$" } },
    { fig: { x: [0, 4.4], y: [-2, 10], w: 480, h: 220,
      axes: { x: "t (s)", y: "s (m)", xt: [1, 2, 3, 4], yt: [4, 8] },
      items: [
        { fn: "2*x^3-12*x^2+18*x", from: 0, to: 4, c: "accent", w: 2.4 },
        { pt: [1, 8], label: "rest", pos: "n", i: false }, { pt: [3, 0], label: "rest", pos: "s", i: false },
        { line: [[1, 8], [3, 0]], c: "accent2", dash: true }
      ], cap: "AS June 2025: out 8 m, back 8 m, out 8 m — 24 m in all, though the displacement after 4 s is only 8 m." } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Distance with calculus" },
    { callout: { t: "memorise", h: "Total distance across a turning point", body: [
      "1. Solve $v = 0$ for the turning times inside the interval.",
      "2. Integrate **piece by piece** between them (or find $s$ at each turning time).",
      "3. Add the **magnitudes**. One integral straight across the interval gives the displacement — the areas below the axis cancel the ones above."
    ] } },
    { fig: { x: [0, 6.6], y: [-28, 4], w: 500, h: 240,
      axes: { x: "t (s)", y: "v (m s⁻¹)", xt: [4, 6], yt: [-24, -10, 1] },
      items: [
        { shade: { fn: "10*x-x^2-24", from: 0, to: 4 }, c: "accent2", alpha: 0.3 },
        { shade: { fn: "10*x-x^2-24", from: 4, to: 6 }, c: "accent3", alpha: 0.45 },
        { fn: "10*x-x^2-24", from: 0, to: 6.4, c: "accent", w: 2.4 },
        { text: [2, -12], t: "−112/3", c: "accent2", b: true }, { text: [5, 3], t: "+4/3", c: "accent3", b: true }
      ], cap: "AS Nov 2021: $v = 10t - t^2 - 24$. Distance $= \\frac{112}{3} + \\frac43 = \\frac{116}{3}$; a single integral from 0 to 6 would give $-36$." } },
    { worked: { tag: "exam", title: "Find $k$; the other rest; total distance", src: "AS Nov 2021 · P2 Q2 · 10 marks",
      q: "A particle $P$ moves along a straight line. At time $t$ seconds its velocity is modelled as $v = 10t - t^2 - k$ m s$^{-1}$, $t \\ge 0$, where $k$ is a constant. **(a)** Find the acceleration of $P$ at time $t$. $P$ is instantaneously at rest when $t = 6$. **(b)** Find the other value of $t$ when $P$ is instantaneously at rest. **(c)** Find the total distance travelled by $P$ in the interval $0 \\le t \\le 6$.",
      steps: [
        { h: "(a)", m: "$a = \\dfrac{dv}{dt} = 10 - 2t$", mk: "M1 A1" },
        { h: "(b) Use $t = 6$ to find $k$", m: "$60 - 36 - k = 0 \\Rightarrow k = 24$", mk: "M1 A1" },
        { m: "$t^2 - 10t + 24 = 0 \\Rightarrow (t - 4)(t - 6) = 0 \\Rightarrow t = 4$", mk: "M1 A1" },
        { h: "(c) Integrate in two pieces", m: "$s = 5t^2 - \\tfrac13 t^3 - 24t$: $\\; s(4) = -\\dfrac{112}{3}$, $\\; s(6) = -36$", mk: "M1 A1" },
        { m: "$\\dfrac{112}{3} + \\left|-36 + \\dfrac{112}{3}\\right| = \\dfrac{112}{3} + \\dfrac43$", mk: "M1" },
        { m: "$= \\dfrac{116}{3} = 38.7$ m", mk: "A1" }
      ], result: "(a) $10 - 2t$ (b) 4 (c) 38.7 m" } },
    { worked: { tag: "exam", title: "Acceleration at each rest; total distance over 4 s", src: "AS June 2022 · P2 Q3 · 9 marks",
      q: "A fixed point $O$ lies on a straight line along which a particle $P$ moves. At time $t$ seconds, $t \\ge 0$, the distance of $P$ from $O$ is $s = \\tfrac13 t^3 - \\tfrac52 t^2 + 6t$ metres. **(a)** Find the acceleration of $P$ at each of the times when $P$ is at instantaneous rest. **(b)** Find the total distance travelled by $P$ in the interval $0 \\le t \\le 4$.",
      steps: [
        { h: "(a)", m: "$v = t^2 - 5t + 6$", mk: "M1 A1" },
        { m: "$(t - 2)(t - 3) = 0 \\Rightarrow t = 2, 3$", mk: "M1 A1" },
        { m: "$a = 2t - 5$: $\\; -1$ m s$^{-2}$ at $t = 2$, $\\; 1$ m s$^{-2}$ at $t = 3$", mk: "M1 A1" },
        { h: "(b) Positions", m: "$s(2) = \\dfrac{14}{3}$, $\\; s(3) = \\dfrac92$, $\\; s(4) = \\dfrac{16}{3}$", mk: "M1" },
        { m: "$\\dfrac{14}{3} + \\left(\\dfrac{14}{3} - \\dfrac92\\right) + \\left(\\dfrac{16}{3} - \\dfrac92\\right) = \\dfrac{14}{3} + \\dfrac16 + \\dfrac56$", mk: "M1" },
        { m: "$= \\dfrac{17}{3} = 5.67$ m", mk: "A1" }
      ], result: "(a) −1 and 1 m s$^{-2}$ (b) $\\frac{17}{3}$ m" } },
    { worked: { tag: "exam", title: "Verify rest; the acceleration there; total distance", src: "AS June 2023 · P2 Q3 · 8 marks",
      q: "In this question you must show all stages of your working. A particle $P$ moves along a straight line such that at time $t$ seconds, $t \\ge 0$, after passing through $O$, its velocity is modelled as $v = 15 - t^2 - 2t$ m s$^{-1}$. **(a)** Verify that $P$ comes to instantaneous rest when $t = 3$. **(b)** Find the magnitude of the acceleration of $P$ when $t = 3$. **(c)** Find the total distance travelled by $P$ in the interval $0 \\le t \\le 4$.",
      steps: [
        { h: "(a)", m: "$v(3) = 15 - 9 - 6 = 0$ ✓", mk: "B1" },
        { h: "(b)", m: "$a = -2t - 2$", mk: "M1 A1" },
        { m: "$a(3) = -8$, magnitude 8 m s$^{-2}$", mk: "A1" },
        { h: "(c) Integrate to the turn, then beyond", m: "$s = 15t - \\tfrac13 t^3 - t^2$: $\\; s(3) = 45 - 9 - 9 = 27$", mk: "M1 A1" },
        { m: "$s(4) = 60 - \\dfrac{64}{3} - 16 = \\dfrac{68}{3}$; back $27 - \\dfrac{68}{3} = \\dfrac{13}{3}$", mk: "M1" },
        { m: "total $27 + \\dfrac{13}{3} = \\dfrac{94}{3} = 31.3$ m", mk: "A1" }
      ], result: "(b) 8 m s$^{-2}$ (c) $\\frac{94}{3}$ m" } },
    { worked: { tag: "exam", title: "Rest from a displacement; total distance; never negative", src: "AS June 2018 · P2 Q8 · 10 marks",
      q: "A particle $P$ moves along the $x$-axis. At time $t$ seconds, $t \\ge 0$, its displacement from $O$ is $x = \\tfrac12 t^2(t^2 - 2t + 1)$ metres. **(a)** Find the times when $P$ is instantaneously at rest. **(b)** Find the total distance travelled by $P$ in the interval $0 \\le t \\le 2$. **(c)** Show that $P$ will never move along the negative $x$-axis.",
      steps: [
        { h: "(a) Expand, differentiate", m: "$x = \\tfrac12(t^4 - 2t^3 + t^2)$; $\\; v = 2t^3 - 3t^2 + t$", mk: "M1 A1" },
        { m: "$v = t(2t^2 - 3t + 1) = t(2t - 1)(t - 1)$", mk: "M1" },
        { m: "$t = 0, \\tfrac12, 1$", mk: "A1 A1" },
        { h: "(b) Positions", m: "$x(0) = 0$, $\\; x(\\tfrac12) = \\tfrac{1}{32}$, $\\; x(1) = 0$, $\\; x(2) = 2$", mk: "M1" },
        { m: "$\\tfrac{1}{32} + \\tfrac{1}{32} + 2$", mk: "M1" },
        { m: "$= \\dfrac{33}{16} = 2.06$ m", mk: "A1" },
        { h: "(c) Factorise $x$", m: "$x = \\tfrac12 t^2(t - 1)^2$", mk: "M1" },
        { m: "a product of squares, so $x \\ge 0$ for all $t$: $P$ is never on the negative $x$-axis.", mk: "A1" }
      ], result: "(a) 0, ½, 1 (b) $\\frac{33}{16}$ m" } },
    { worked: { tag: "exam", title: "Roots of $t$: an acceleration, then an exact distance", src: "AS June 2024 · P2 Q2 · 7 marks",
      q: "In this question you must show all stages of your working; solutions relying on calculator technology are not acceptable. A particle moves along a straight line. At time $t$ seconds, $t > 0$, its velocity is $v = 2t - 7\\sqrt t + 6$ m s$^{-1}$. **(a)** Find the acceleration of the particle when $t = 4$. When $t = 1$ the particle is at $X$; when $t = 2$ it is at $Y$. Given that it does not come to instantaneous rest in $1 < t < 2$, **(b)** show that $XY = \\tfrac13(41 - 28\\sqrt2)$ metres.",
      steps: [
        { h: "(a)", m: "$a = 2 - \\tfrac72 t^{-\\frac12}$", mk: "M1 A1" },
        { m: "$a(4) = 2 - \\tfrac74 = \\tfrac14$ m s$^{-2}$", mk: "A1" },
        { h: "(b) No rest in between, so one integral", m: "$\\displaystyle\\int_1^2 \\big(2t - 7t^{\\frac12} + 6\\big)\\,dt = \\Big[t^2 - \\tfrac{14}{3} t^{\\frac32} + 6t\\Big]_1^2$", mk: "M1 A1" },
        { m: "$= \\Big(4 - \\tfrac{28\\sqrt2}{3} + 12\\Big) - \\Big(1 - \\tfrac{14}{3} + 6\\Big)$", mk: "M1" },
        { m: "$= 16 - \\tfrac73 - \\tfrac{28\\sqrt2}{3} = \\tfrac13(41 - 28\\sqrt2)$", mk: "A1*", n: "$2^{\\frac32} = 2\\sqrt2$. Positive (0.467), so it is the distance." }
      ], result: "(a) ¼ m s$^{-2}$" } },

    /* ---------------------------------------------------------------- Page 4 */
    { page: "Calculus with vectors" },
    { callout: { t: "formula", h: "Component by component", body: [
      "$\\mathbf r = x\\mathbf i + y\\mathbf j \\;\\Rightarrow\\; \\mathbf v = \\dot x\\mathbf i + \\dot y\\mathbf j, \\quad \\mathbf a = \\ddot x\\mathbf i + \\ddot y\\mathbf j$",
      "Integrating gives a **vector** constant $\\mathbf c = c_1\\mathbf i + c_2\\mathbf j$.",
      "Speed $|\\mathbf v|$; distance from $O$ $|\\mathbf r|$; parallel to $p\\mathbf i + q\\mathbf j$: $\\dot x : \\dot y = p : q$; perpendicular to $\\mathbf i$: $\\mathbf i$-component zero; $\\mathbf F = m\\mathbf a$."
    ] } },
    { worked: { tag: "exam", title: "The time when the force has a given size", src: "A-level Specimen · P3 Q2 · 7 marks",
      q: "A particle $P$ moves under the action of a single force so that at time $t$ seconds, $t \\ge 0$, its velocity is $\\mathbf v = (t^2 - 3t)\\mathbf i - 12t\\mathbf j$ m s$^{-1}$. The mass of $P$ is 0.5 kg. Find the time at which the magnitude of the force acting on $P$ is 6.5 N.",
      steps: [
        { h: "Differentiate", m: "$\\mathbf a = (2t - 3)\\mathbf i - 12\\mathbf j$", mk: "M1 A1" },
        { h: "$|\\mathbf F| = 6.5 \\Rightarrow |\\mathbf a| = 13$", m: "$(2t - 3)^2 + 12^2 = 13^2$", mk: "M1 M1" },
        { m: "$(2t - 3)^2 = 25$", mk: "A1" },
        { m: "$2t - 3 = \\pm 5$", mk: "M1" },
        { m: "$t = 4$ (as $t \\ge 0$)", mk: "A1" }
      ], result: "$t = 4$ s" } },
    { worked: { tag: "exam", title: "An exact distance from a velocity with $t^{-\\frac12}$", src: "A-level June 2018 · P3 Q6 · 6 marks",
      q: "At time $t$ seconds, $t \\ge 0$, a particle $P$ moves in the $x$-$y$ plane with velocity $\\mathbf v = t^{-\\frac12}\\mathbf i - 4t\\mathbf j$ m s$^{-1}$. When $t = 1$, $P$ is at $A$; when $t = 4$, $P$ is at $B$. Find the exact distance $AB$.",
      steps: [
        { h: "Integrate", m: "$\\mathbf r = 2t^{\\frac12}\\mathbf i - 2t^2\\mathbf j + \\mathbf c$", mk: "M1 A1" },
        { h: "$\\overrightarrow{AB} = \\mathbf r(4) - \\mathbf r(1)$", m: "$(4\\mathbf i - 32\\mathbf j) - (2\\mathbf i - 2\\mathbf j) = 2\\mathbf i - 30\\mathbf j$", mk: "M1 A1", n: "The constant cancels — or use $\\int_1^4$." },
        { m: "$AB = \\sqrt{2^2 + 30^2} = \\sqrt{904}$", mk: "M1" },
        { m: "$= 2\\sqrt{226}$ m", mk: "A1" }
      ], result: "$2\\sqrt{226}$ m" } },
    { worked: { tag: "exam", title: "From acceleration: a velocity, a direction; then a speed from a position", src: "A-level Oct 2020 · P3 Q3 · 12 marks",
      q: "(i) At time $t$ seconds, $t \\ge 0$, a particle $P$ has acceleration $\\mathbf a = (1 - 4t)\\mathbf i + (3 - t^2)\\mathbf j$ m s$^{-2}$. When $t = 0$ its velocity is $36\\mathbf i$ m s$^{-1}$. **(a)** Find the velocity of $P$ when $t = 4$. **(b)** Find $t$ when $P$ is moving in a direction perpendicular to $\\mathbf i$. (ii) A particle $Q$ has position vector $\\mathbf r = (t^2 - t)\\mathbf i + 3t\\mathbf j$ m. Find $t$ when the speed of $Q$ is 5 m s$^{-1}$.",
      steps: [
        { h: "(i)(a) Integrate with $\\mathbf c = 36\\mathbf i$", m: "$\\mathbf v = (36 + t - 2t^2)\\mathbf i + \\left(3t - \\tfrac13 t^3\\right)\\mathbf j$", mk: "M1 A1" },
        { m: "$\\mathbf v(4) = 8\\mathbf i - \\tfrac{28}{3}\\mathbf j$ m s$^{-1}$", mk: "A1" },
        { h: "(b) Perpendicular to $\\mathbf i$: $\\mathbf i$-component zero", m: "$36 + t - 2t^2 = 0$", mk: "M1" },
        { m: "$(2t - 9)(t + 4) = 0 \\Rightarrow t = 4.5$", mk: "M1 A1" },
        { h: "(ii) Differentiate", m: "$\\mathbf v = (2t - 1)\\mathbf i + 3\\mathbf j$", mk: "M1 A1" },
        { m: "$(2t - 1)^2 + 9 = 25$", mk: "M1 A1" },
        { m: "$2t - 1 = 4 \\Rightarrow t = 2.5$", mk: "M1 A1", n: "$2t - 1 = -4$ gives a negative time." }
      ], result: "(a) $8\\mathbf i - \\frac{28}{3}\\mathbf j$ (b) 4.5 (ii) 2.5" } },
    { worked: { tag: "exam", title: "Direction $\\mathbf i - \\mathbf j$; $\\mathbf r$ from a condition; distance at speed 10", src: "A-level Oct 2021 · P3 Q5 · 14 marks",
      q: "At time $t$ seconds a particle $P$ has velocity $\\mathbf v = 3t^{\\frac12}\\mathbf i - 2t\\mathbf j$ m s$^{-1}$, $t > 0$. **(a)** Find the acceleration of $P$ at time $t$. **(b)** Find $t$ when $P$ is moving in the direction of $\\mathbf i - \\mathbf j$. The position vector of $P$ relative to $O$ is $\\mathbf r$ metres, and $\\mathbf r = -\\mathbf j$ when $t = 1$. **(c)** Find $\\mathbf r$ in terms of $t$. **(d)** Find the exact distance of $P$ from $O$ when $P$ is moving with speed 10 m s$^{-1}$.",
      steps: [
        { h: "(a)", m: "$\\mathbf a = \\tfrac32 t^{-\\frac12}\\mathbf i - 2\\mathbf j$", mk: "M1 A1" },
        { h: "(b) Components equal and opposite", m: "$3t^{\\frac12} = 2t$", mk: "M1" },
        { m: "$t^{\\frac12} = \\tfrac32 \\Rightarrow t = \\tfrac94$", mk: "DM1 A1" },
        { h: "(c) Integrate", m: "$\\mathbf r = 2t^{\\frac32}\\mathbf i - t^2\\mathbf j + \\mathbf c$", mk: "M1 A1" },
        { m: "$t = 1$: $2\\mathbf i - \\mathbf j + \\mathbf c = -\\mathbf j \\Rightarrow \\mathbf c = -2\\mathbf i$; $\\; \\mathbf r = (2t^{\\frac32} - 2)\\mathbf i - t^2\\mathbf j$", mk: "A1" },
        { h: "(d) Speed 10", m: "$9t + 4t^2 = 100$", mk: "M1" },
        { m: "$4t^2 + 9t - 100 = 0 \\Rightarrow (4t + 25)(t - 4) = 0 \\Rightarrow t = 4$", mk: "M(A)1 A1" },
        { m: "$\\mathbf r(4) = 14\\mathbf i - 16\\mathbf j$", mk: "M1" },
        { m: "$|\\mathbf r| = \\sqrt{196 + 256} = \\sqrt{452}$", mk: "M1" },
        { m: "$= 2\\sqrt{113}$ m", mk: "A1" }
      ], result: "(b) $\\frac94$ (c) $(2t^{3/2} - 2)\\mathbf i - t^2\\mathbf j$ (d) $2\\sqrt{113}$ m" } },
    { worked: { tag: "exam", title: "Speed, acceleration, and a position from a later position", src: "A-level June 2022 · P3 Q1 · 8 marks",
      q: "At time $t$ seconds, $t > 0$, a particle $P$ has velocity $\\mathbf v = 3t^2\\mathbf i - 6t^{\\frac12}\\mathbf j$ m s$^{-1}$. **(a)** Find the speed of $P$ at $t = 2$. **(b)** Find the acceleration of $P$ at time $t$. At $t = 4$ the position vector of $P$ is $(\\mathbf i - 4\\mathbf j)$ m. **(c)** Find the position vector of $P$ at $t = 1$.",
      steps: [
        { h: "(a)", m: "$\\mathbf v(2) = 12\\mathbf i - 6\\sqrt2\\mathbf j$; $\\; |\\mathbf v| = \\sqrt{144 + 72}$", mk: "M1" },
        { m: "$= \\sqrt{216} = 14.7$ m s$^{-1}$", mk: "A1" },
        { h: "(b)", m: "$\\mathbf a = 6t\\mathbf i - 3t^{-\\frac12}\\mathbf j$", mk: "M1 A1" },
        { h: "(c) Integrate", m: "$\\mathbf r = t^3\\mathbf i - 4t^{\\frac32}\\mathbf j + \\mathbf c$", mk: "M1 A1" },
        { m: "$t = 4$: $64\\mathbf i - 32\\mathbf j + \\mathbf c = \\mathbf i - 4\\mathbf j \\Rightarrow \\mathbf c = -63\\mathbf i + 28\\mathbf j$", mk: "M1" },
        { m: "$\\mathbf r(1) = (-62\\mathbf i + 24\\mathbf j)$ m", mk: "A1" }
      ], result: "(a) 14.7 m s$^{-1}$ (c) $-62\\mathbf i + 24\\mathbf j$" } },
    { worked: { tag: "exam", title: "Speed at $t = 0$; parallel to $\\mathbf i + \\mathbf j$; acceleration perpendicular to $\\mathbf i$", src: "A-level June 2023 · P3 Q3 · 9 marks",
      q: "At time $t$ seconds, $t \\ge 0$, a particle $P$ has velocity $\\mathbf v = (t^2 - 3t + 7)\\mathbf i + (2t^2 - 3)\\mathbf j$ m s$^{-1}$. Find **(a)** the speed of $P$ at $t = 0$, **(b)** the value of $t$ when $P$ is moving parallel to $(\\mathbf i + \\mathbf j)$, **(c)** the acceleration of $P$ at time $t$, **(d)** the value of $t$ when the direction of the acceleration is perpendicular to $\\mathbf i$.",
      steps: [
        { h: "(a)", m: "$\\mathbf v(0) = 7\\mathbf i - 3\\mathbf j$; $\\; \\sqrt{49 + 9}$", mk: "M1 A1" },
        { m: "$= \\sqrt{58} = 7.62$ m s$^{-1}$", mk: "A1" },
        { h: "(b) Components equal", m: "$t^2 - 3t + 7 = 2t^2 - 3 \\Rightarrow t^2 + 3t - 10 = 0$", mk: "M1" },
        { m: "$(t + 5)(t - 2) = 0 \\Rightarrow t = 2$", mk: "A1", n: "Check: $\\mathbf v(2) = 5\\mathbf i + 5\\mathbf j$." },
        { h: "(c)", m: "$\\mathbf a = (2t - 3)\\mathbf i + 4t\\mathbf j$", mk: "M1 A1" },
        { h: "(d) $\\mathbf i$-component zero", m: "$2t - 3 = 0$", mk: "M1" },
        { m: "$t = 1.5$", mk: "A1" }
      ], result: "(a) 7.62 m s$^{-1}$ (b) 2 (d) 1.5" } },
    { worked: { tag: "exam", title: "A bearing fixes $c$; a speed; accelerating in a given direction", src: "A-level June 2024 · P3 Q4 · 11 marks",
      q: "In this question you must show all stages of your working. [$\\mathbf i$ is due east, $\\mathbf j$ due north.] At time $t$ seconds, $t \\ge 1$, the position vector of a particle $P$ is $\\mathbf r = ct^{\\frac12}\\mathbf i - \\tfrac38 t^2\\mathbf j$ metres, where $c$ is a constant. When $t = 4$ the bearing of $P$ from $O$ is 135°. **(a)** Show that $c = 3$. **(b)** Find the speed of $P$ when $t = 4$. When $t = T$, $P$ is accelerating in the direction of $(-\\mathbf i - 27\\mathbf j)$. **(c)** Find $T$.",
      steps: [
        { h: "(a) At $t = 4$", m: "$\\mathbf r = 2c\\mathbf i - 6\\mathbf j$", mk: "B1" },
        { m: "Bearing 135° is south-east: east and south components equal, so $2c = 6$", mk: "M1", n: "The justification (45° angle, or an isosceles right-angled triangle) must be seen." },
        { m: "$c = 3$", mk: "A1*" },
        { h: "(b) Differentiate", m: "$\\mathbf v = \\tfrac32 t^{-\\frac12}\\mathbf i - \\tfrac34 t\\mathbf j$", mk: "M1 A1" },
        { m: "$\\mathbf v(4) = \\tfrac34\\mathbf i - 3\\mathbf j$; $\\; |\\mathbf v| = \\sqrt{\\tfrac{9}{16} + 9}$", mk: "M1" },
        { m: "$= \\tfrac34\\sqrt{17} = 3.09$ m s$^{-1}$", mk: "A1" },
        { h: "(c) Differentiate again", m: "$\\mathbf a = -\\tfrac34 t^{-\\frac32}\\mathbf i - \\tfrac34\\mathbf j$", mk: "M1 A1" },
        { h: "Parallel to $-\\mathbf i - 27\\mathbf j$", m: "$\\dfrac{\\frac34 T^{-\\frac32}}{\\frac34} = \\dfrac{1}{27} \\Rightarrow T^{\\frac32} = 27$", mk: "M1" },
        { m: "$T = 9$", mk: "A1" }
      ], result: "(b) 3.09 m s$^{-1}$ (c) $T = 9$" } },
    { fig: { x: [0, 10], y: [-10, 1.5], w: 480, h: 250,
      axes: { x: "x (east, m)", y: "y (north, m)", xt: [3, 6, 9], yt: [-9, -6, -3] },
      items: [
        { param: { x: "3*sqrt(t)", y: "-0.375*t^2" }, t: [1, 5], c: "accent", w: 2.4 },
        { pt: [6, -6], label: "t = 4: (6, −6)", pos: "e", i: false },
        { line: [[0, 0], [6, -6]], c: "accent2", dash: true },
        { arc: [0, 0, 34, 315, 360], label: "45°", c: "accent2" }
      ], cap: "A-level June 2024: at $t = 4$, $P$ is at $(6, -6)$, 45° south of east — a bearing of 135°." } },
    { worked: { tag: "exam", title: "A position, its distance, a velocity; acceleration perpendicular to a line", src: "A-level June 2025 · P3 Q4 · 9 marks",
      q: "At time $t$ seconds, $t > 0$, the position vector of a particle $P$ relative to $O$ is $\\mathbf r = 4t^{\\frac32}\\mathbf i - t^2\\mathbf j$ metres. **(a)** Find the position vector of $P$ at $t = 4$. **(b)** Find the exact distance of $P$ from $O$ at $t = 4$. **(c)** Find the velocity of $P$ at time $t$. At $t = T$ the acceleration of $P$ is perpendicular to the line $y = \\tfrac13 x$. **(d)** Find $T$.",
      steps: [
        { h: "(a)", m: "$\\mathbf r(4) = 4 \\times 8\\,\\mathbf i - 16\\mathbf j = (32\\mathbf i - 16\\mathbf j)$ m", mk: "B1" },
        { h: "(b)", m: "$\\sqrt{32^2 + 16^2} = \\sqrt{1280}$", mk: "M1" },
        { m: "$= 16\\sqrt5$ m", mk: "A1" },
        { h: "(c)", m: "$\\mathbf v = 6t^{\\frac12}\\mathbf i - 2t\\mathbf j$", mk: "M1 A1" },
        { h: "(d) Acceleration", m: "$\\mathbf a = 3t^{-\\frac12}\\mathbf i - 2\\mathbf j$", mk: "M1" },
        { h: "The line has direction $3\\mathbf i + \\mathbf j$", m: "Perpendicular: $(3T^{-\\frac12})(3) + (-2)(1) = 0$", mk: "A1 M1", n: "Or gradients: $\\dfrac{-2}{3T^{-1/2}} = -3$." },
        { m: "$T^{-\\frac12} = \\tfrac29 \\Rightarrow T = \\tfrac{81}{4}$", mk: "A1" }
      ], result: "(a) $32\\mathbf i - 16\\mathbf j$ (b) $16\\sqrt5$ m (c) $6t^{1/2}\\mathbf i - 2t\\mathbf j$ (d) $\\frac{81}{4}$" } },

    /* ---------------------------------------------------------------- Exam toolkit */
    { page: "Exam toolkit" },
    { callout: { t: "memorise", h: "The chain", body: [
      "$r \\xrightarrow{\\;d/dt\\;} v \\xrightarrow{\\;d/dt\\;} a$; $\\; a \\xrightarrow{\\;\\int\\;} v \\xrightarrow{\\;\\int\\;} r$, each with a constant.",
      "Rest: $v = 0$. Stops accelerating, maximum velocity: $a = 0$. Back at the start: $s = 0$.",
      "Distance: split at every $v = 0$ inside the interval, add the sizes."
    ] } },
    { callout: { t: "memorise", h: "Vectors", body: "Treat $\\mathbf i$ and $\\mathbf j$ separately; the constant is a vector. Speed $= |\\mathbf v|$, distance from $O = |\\mathbf r|$. Parallel to $p\\mathbf i + q\\mathbf j$: components in ratio $p : q$ with the right signs. Perpendicular to a direction $\\mathbf d$: scalar product zero." } },
    { callout: { t: "mnemonic", h: "\"Constant? suvat. Changing? calculus.\"", body: "Look at $a$ first: a number means suvat, a function of $t$ means calculus." } },
    { callout: { t: "warn", h: "Common losses", body: [
      "Forgetting the constant of integration, or setting it to 0 when the particle does not start at $O$.",
      "One integral across a turning point when the **distance** is asked for.",
      "Index slips with $t^{\\frac12}$: $\\int t^{\\frac12} dt = \\frac23 t^{\\frac32}$, $\\frac{d}{dt} t^{\\frac12} = \\frac12 t^{-\\frac12}$.",
      "Keeping a negative time or a direction with the wrong signs (south-west for north-east).",
      "Relying on the calculator when the question says not to."
    ] } }
  ],
  flashcards: [
    ["$v$ from $s$?", "$v = \\dfrac{ds}{dt}$."],
    ["$a$ from $v$?", "$a = \\dfrac{dv}{dt}$."],
    ["$s$ from $v$?", "$s = \\int v\\,dt$ + a constant."],
    ["When is calculus needed instead of suvat?", "When the acceleration varies with time."],
    ["Condition for instantaneous rest?", "$v = 0$."],
    ["Condition for maximum velocity (or \"stops accelerating\")?", "$a = 0$."],
    ["What does $\\int_a^b v\\,dt$ give?", "The displacement from $t = a$ to $t = b$."],
    ["How do you get a total distance with calculus?", "Split at each $v = 0$, integrate each piece, add the sizes."],
    ["Moving perpendicular to $\\mathbf i$?", "The $\\mathbf i$-component of $\\mathbf v$ is zero."],
    ["Moving parallel to $\\mathbf i + \\mathbf j$?", "The two components of $\\mathbf v$ are equal."],
    ["Distance of $P$ from $O$?", "$|\\mathbf r|$."],
    ["Force from a velocity vector?", "Differentiate to get $\\mathbf a$, then $\\mathbf F = m\\mathbf a$."]
  ],
  quiz: [
    { q: "$s = t^3 - 6t$. Then $v$ is", opts: ["$3t^2 - 6$", "$6t$", "$\\frac14 t^4 - 3t^2$", "$3t^2$"], ans: 0, why: "Differentiate." },
    { q: "$v = 4 - 2t$. The particle is at rest when", opts: ["$t = 2$", "$t = 4$", "$t = 0$", "never"], ans: 0, why: "$v = 0$." },
    { q: "$v = 3t^2$ and $s = 2$ when $t = 0$. Then $s$ is", opts: ["$t^3 + 2$", "$t^3$", "$6t$", "$t^3 - 2$"], ans: 0, why: "The constant is 2." },
    { q: "$v = t^2 - 4$ for $0 \\le t \\le 3$. The distance is found by", opts: ["splitting at $t = 2$", "one integral from 0 to 3", "suvat", "differentiating"], ans: 0, why: "It turns round at $t = 2$." },
    { q: "$\\mathbf v = (t - 3)\\mathbf i + 2t\\mathbf j$ is perpendicular to $\\mathbf i$ when", opts: ["$t = 3$", "$t = 0$", "$t = 1$", "never"], ans: 0, why: "$\\mathbf i$-component zero." },
    { q: "$\\frac{d}{dt}\\big(4t^{\\frac32}\\big)$ is", opts: ["$6t^{\\frac12}$", "$4t^{\\frac12}$", "$\\frac83 t^{\\frac52}$", "$6t^{\\frac32}$"], ans: 0, why: "$4 \\times \\frac32 t^{\\frac12}$." }
  ]
};

/* =====================================================================
   M7.5  Projectiles
   ===================================================================== */
C["maths:M7.5"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Projectiles — the whole topic on one page" },
    "Spec 7.5: model motion under gravity in a vertical plane using vectors; projectiles. Includes the derivation of the time of flight, the range, the greatest height and the equation of the path.",
    "A-level only, and on every A-level paper since the Specimen — usually the longest Mechanics question (8–15 marks):",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Show a given relation from the range (eliminate $t$)", "6", "2022 Q5(a), 2023 Q5(a)(b)"],
      ["Greatest height (vertical $v = 0$)", "2–4", "2018 Q10(a), Oct 2020 Q5(b), 2022 Q5(b), 2024 Q5(c), 2025 Q5(b)"],
      ["Projected from a cliff: time to land, launch speed, the cliff height", "4–6", "Oct 2020 Q5(a), Oct 2021 Q4(a), 2025 Q5(a)"],
      ["Speed (and direction) at a point", "4–5", "Specimen Q5(b), Oct 2021 Q4(b)"],
      ["Height at a given horizontal distance (clears a net?)", "8", "Specimen Q5(a)"],
      ["Find the angle: a quadratic in $\\tan\\alpha$ (using $\\sec^2 = 1 + \\tan^2$)", "5–9", "2018 Q10(b), 2023 Q5(b)"],
      ["Derive the equation of the path $y = f(x)$; use it", "6–10", "2024 Q5(a)–(c)"],
      ["Refinements and limitations (M6.1)", "1–2", "every one"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**The model** — split the velocity, two independent motions.",
      "**The standard results** — time of flight, greatest height, range, path — derived.",
      "**From level ground** — range, height, angles.",
      "**From a height** — cliffs, nets, speed on landing.",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "The model" },
    { callout: { t: "memorise", h: "Two motions, one clock", body: [
      "A particle projected with speed $U$ at angle $\\alpha$ above the horizontal, moving freely under gravity:",
      "**Horizontal**: no force, so constant velocity $U\\cos\\alpha$: $\\; x = (U\\cos\\alpha)t$.",
      "**Vertical**: acceleration $g$ downwards: $\\; \\dot y = U\\sin\\alpha - gt$, $\\; y = (U\\sin\\alpha)t - \\tfrac12 gt^2$.",
      "The **time** links them. In vector form: $\\mathbf r = (U\\cos\\alpha\\,\\mathbf i + U\\sin\\alpha\\,\\mathbf j)t - \\tfrac12 gt^2\\mathbf j$."
    ] } },
    { fig: { w: 460, h: 220, items: [
      { line: [[40, 180], [420, 180]], c: "muted", w: 2 },
      { vec: [[60, 180], [210, 80]], label: "U", lpos: 0.6, loff: -14 },
      { line: [[60, 180], [210, 180]], arrow: true, c: "accent", w: 2, label: "U cos α", loff: 14 },
      { line: [[210, 180], [210, 80]], arrow: true, c: "accent3", w: 2, label: "U sin α", loff: -30 },
      { arc: [60, 180, 40, 0, 33.7], label: "α", c: "accent2" },
      { text: [330, 60], t: "horizontal: a = 0", c: "accent", b: true, size: 12 },
      { text: [330, 84], t: "vertical: a = −g", c: "accent3", b: true, size: 12 },
      { vec: [[380, 110], [380, 160]], label: "g", lpos: 0.6, loff: -10, c: "accent3" }
    ], cap: "Resolve the launch velocity once, at the start; then never mix the two directions." } },
    { table: { head: ["Fact", "Why"], rows: [
      ["At the greatest height the vertical velocity is zero", "it stops rising; the horizontal velocity is still $U\\cos\\alpha$"],
      ["The speed at any instant is $\\sqrt{\\dot x^2 + \\dot y^2}$", "Pythagoras on the two components"],
      ["The direction of motion is at $\\tan^{-1}\\dfrac{|\\dot y|}{\\dot x}$ to the horizontal", "the velocity is tangent to the path"],
      ["Landing at the launch height takes twice the time to the top", "the vertical motion is symmetrical"]
    ] } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "The standard results" },
    "These are derived, not quoted. A \"show that\" needs the derivation each time.",
    { worked: { tag: "example", title: "Time to the top and the greatest height", q: "A particle is projected from level ground with speed $U$ at angle $\\alpha$ above the horizontal. Derive the time to the greatest height and the greatest height.",
      steps: [
        { h: "Vertical: $v = u + at$ with $v = 0$", m: "$0 = U\\sin\\alpha - gt \\Rightarrow t = \\dfrac{U\\sin\\alpha}{g}$" },
        { h: "Vertical: $v^2 = u^2 + 2as$", m: "$0 = U^2\\sin^2\\alpha - 2gH \\Rightarrow H = \\dfrac{U^2\\sin^2\\alpha}{2g}$" }
      ], result: "$t = \\frac{U\\sin\\alpha}{g}$, $H = \\frac{U^2\\sin^2\\alpha}{2g}$" } },
    { worked: { tag: "example", title: "Time of flight and range", q: "Derive the time of flight and the horizontal range on level ground, and the angle giving the greatest range.",
      steps: [
        { h: "Vertical: back to $y = 0$", m: "$0 = (U\\sin\\alpha)T - \\tfrac12 gT^2 \\Rightarrow T = \\dfrac{2U\\sin\\alpha}{g}$" },
        { h: "Horizontal", m: "$R = (U\\cos\\alpha)T = \\dfrac{2U^2\\sin\\alpha\\cos\\alpha}{g} = \\dfrac{U^2\\sin 2\\alpha}{g}$" },
        { h: "Greatest range", m: "$\\sin 2\\alpha = 1 \\Rightarrow \\alpha = 45°$, $R_{\\max} = \\dfrac{U^2}{g}$", n: "Complementary angles ($\\alpha$ and $90° - \\alpha$) give the same range." }
      ], result: "$T = \\frac{2U\\sin\\alpha}{g}$, $R = \\frac{U^2\\sin 2\\alpha}{g}$" } },
    { worked: { tag: "example", title: "The equation of the path", q: "Show that the path is $y = x\\tan\\alpha - \\dfrac{gx^2}{2U^2\\cos^2\\alpha} = x\\tan\\alpha - \\dfrac{gx^2(1 + \\tan^2\\alpha)}{2U^2}$.",
      steps: [
        { h: "Eliminate $t$", m: "$t = \\dfrac{x}{U\\cos\\alpha}$" },
        { h: "Substitute into $y$", m: "$y = U\\sin\\alpha \\cdot \\dfrac{x}{U\\cos\\alpha} - \\tfrac12 g \\dfrac{x^2}{U^2\\cos^2\\alpha} = x\\tan\\alpha - \\dfrac{gx^2}{2U^2\\cos^2\\alpha}$" },
        { h: "$\\sec^2\\alpha = 1 + \\tan^2\\alpha$", m: "$y = x\\tan\\alpha - \\dfrac{gx^2(1 + \\tan^2\\alpha)}{2U^2}$", n: "A quadratic in $\\tan\\alpha$ — the route to finding an angle through a given point." }
      ], result: "a parabola" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "From level ground" },
    { worked: { tag: "exam", title: "From the range, show $U^2\\sin\\alpha\\cos\\alpha = 588$; then $U^2 = 1960$", src: "A-level June 2022 · P3 Q5(a)(b) · 10 marks",
      q: "A golf ball is at rest at $A$ on horizontal ground. It is hit and initially moves at an angle $\\alpha$ to the ground, first hitting the ground at $B$, where $AB = 120$ m. The ball is modelled as a particle moving freely under gravity with initial speed $U$ m s$^{-1}$. **(a)** Show that $U^2\\sin\\alpha\\cos\\alpha = 588$. The ball reaches a maximum height of 10 m above the ground. **(b)** Show that $U^2 = 1960$.",
      steps: [
        { h: "(a) Horizontal", m: "$120 = (U\\cos\\alpha)t$", mk: "M1 A1" },
        { h: "Vertical, back to the ground", m: "$0 = (U\\sin\\alpha)t - 4.9t^2 \\Rightarrow t = \\dfrac{U\\sin\\alpha}{4.9}$", mk: "M1 A1" },
        { h: "Eliminate $t$", m: "$120 = U\\cos\\alpha \\cdot \\dfrac{U\\sin\\alpha}{4.9}$", mk: "DM1" },
        { m: "$U^2\\sin\\alpha\\cos\\alpha = 120 \\times 4.9 = 588$", mk: "A1*" },
        { h: "(b) Greatest height", m: "$0 = U^2\\sin^2\\alpha - 2 \\times 9.8 \\times 10 \\Rightarrow U^2\\sin^2\\alpha = 196$", mk: "M1 A1" },
        { h: "Divide", m: "$\\dfrac{U^2\\sin^2\\alpha}{U^2\\sin\\alpha\\cos\\alpha} = \\tan\\alpha = \\dfrac{196}{588} = \\dfrac13 \\Rightarrow \\sin^2\\alpha = \\dfrac{1}{10}$", mk: "DM1" },
        { m: "$U^2 = 196 \\times 10 = 1960$", mk: "A1*", n: "Working backwards from 1960 is not accepted." }
      ], result: "$U = 44.3$ m s$^{-1}$, $\\alpha = 18.4°$" } },
    { fig: projFig(42, 14, 0, 2.857, { xt: [60, 120], yt: [10], h: 200, ulabel: "U",
      extra: [{ pt: [120, 0], label: "B", pos: "n", i: false }, { pt: [0, 0], label: "A", pos: "s", i: false }, { line: [[60, 0], [60, 10]], c: "accent2", dash: true, label: "10 m", loff: -18 }],
      cap: "A-level June 2022: $U\\cos\\alpha = 42$, $U\\sin\\alpha = 14$ — range 120 m, top 10 m (the axes are not to the same scale)." }) },
    { worked: { tag: "exam", title: "Through a point: a quadratic in $\\tan\\alpha$", src: "A-level June 2023 · P3 Q5(a)–(c) · 10 marks",
      q: "A small ball is projected with speed 28 m s$^{-1}$ from a point $O$ on horizontal ground at an angle $\\alpha$ to the ground. After $T$ seconds it passes through $A$, 40 m horizontally and 20 m vertically from $O$. Modelling the ball as a particle moving freely under gravity, **(a)** show that $T = \\dfrac{10}{7\\cos\\alpha}$, **(b)** show that $\\tan^2\\alpha - 4\\tan\\alpha + 3 = 0$, **(c)** find the greatest possible height, in metres, of the ball above the ground as it moves from $O$ to $A$.",
      steps: [
        { h: "(a) Horizontal", m: "$40 = 28\\cos\\alpha \\cdot T$", mk: "M1" },
        { m: "$T = \\dfrac{40}{28\\cos\\alpha} = \\dfrac{10}{7\\cos\\alpha}$", mk: "A1*" },
        { h: "(b) Vertical", m: "$20 = 28\\sin\\alpha \\cdot T - 4.9T^2$", mk: "M1 A1" },
        { h: "Substitute $T$", m: "$20 = 40\\tan\\alpha - 4.9 \\times \\dfrac{100}{49\\cos^2\\alpha} = 40\\tan\\alpha - 10\\sec^2\\alpha$", mk: "M1" },
        { h: "$\\sec^2\\alpha = 1 + \\tan^2\\alpha$", m: "$20 = 40\\tan\\alpha - 10 - 10\\tan^2\\alpha$", mk: "M1" },
        { m: "$10\\tan^2\\alpha - 40\\tan\\alpha + 30 = 0 \\Rightarrow \\tan^2\\alpha - 4\\tan\\alpha + 3 = 0$", mk: "A1*" },
        { h: "(c) Two angles: $\\tan\\alpha = 1$ or $3$", m: "Greatest height with the steeper one, $\\sin\\alpha = \\dfrac{3}{\\sqrt{10}}$: $\\; H = \\dfrac{(28\\sin\\alpha)^2}{2 \\times 9.8}$", mk: "M1 A1", n: "Check it is reached before $A$: time to top 2.71 s, $T = 4.52$ s. With $\\tan\\alpha = 1$, $A$ is the top (20 m)." },
        { m: "$H = \\dfrac{784 \\times 0.9}{19.6} = 36$ m", mk: "A1" }
      ], result: "(c) 36 m" } },
    { fig: { x: [0, 52], y: [0, 42], w: 480, h: 250, axes: { x: "x (m)", y: "y (m)", xt: [20, 40], yt: [20, 36] },
      items: [
        { param: { x: "19.799*t", y: "19.799*t-4.9*t^2" }, t: [0, 2.6], c: "accent2", w: 2.2, label: "tan α = 1", pos: "e" },
        { param: { x: "8.854*t", y: "26.563*t-4.9*t^2" }, t: [0, 5.35], c: "accent", w: 2.4, label: "tan α = 3", pos: "w" },
        { pt: [40, 20], label: "A (40, 20)", pos: "e", i: false },
        { hline: 36, c: "accent", label: "36 m" }
      ], cap: "A-level June 2023: two launch angles reach $A$. The steep one rises to 36 m first; the shallow one has $A$ as its top." } },
    { worked: { tag: "exam", title: "Derive the path; then the range and the greatest height from it", src: "A-level June 2024 · P3 Q5(a)–(c) · 10 marks",
      q: "At $t = 0$ a small stone is projected with speed 35 m s$^{-1}$ from a point $O$ on horizontal ground at an angle $\\alpha$ to the horizontal, where $\\tan\\alpha = \\frac34$. It is modelled as a particle $P$ moving freely under gravity and hits the ground at $A$. At time $t$ seconds the horizontal distance of $P$ from $O$ is $x$ metres and its height above the ground is $y$ metres. **(a)** Show that $y = \\tfrac34 x - \\dfrac{x^2}{160}$. **(b)** Find the length $OA$. **(c)** Find the greatest height $H$ of the stone above the ground.",
      steps: [
        { h: "(a) Components", m: "$\\cos\\alpha = \\frac45$, $\\sin\\alpha = \\frac35$: $\\; 35\\cos\\alpha = 28$, $\\; 35\\sin\\alpha = 21$", mk: "M1" },
        { m: "$x = 28t$", mk: "A1" },
        { m: "$y = 21t - 4.9t^2$", mk: "M1 A1" },
        { h: "Eliminate $t = \\frac{x}{28}$", m: "$y = \\dfrac{21x}{28} - \\dfrac{4.9x^2}{784}$", mk: "M1" },
        { m: "$y = \\tfrac34 x - \\dfrac{x^2}{160}$", mk: "A1*" },
        { h: "(b) $y = 0$", m: "$x\\left(\\tfrac34 - \\tfrac{x}{160}\\right) = 0 \\Rightarrow x = 120$", mk: "M1" },
        { m: "$OA = 120$ m", mk: "A1" },
        { h: "(c) Top halfway, at $x = 60$", m: "$H = \\tfrac34(60) - \\dfrac{60^2}{160}$", mk: "M1", n: "Or $\\frac{dy}{dx} = 0$, or $\\frac{21^2}{2 \\times 9.8}$." },
        { m: "$H = 45 - 22.5 = 22.5$ m", mk: "A1" }
      ], result: "(b) 120 m (c) 22.5 m" } },

    /* ---------------------------------------------------------------- Page 4 */
    { page: "From a height" },
    { callout: { t: "tip", h: "Put the origin at the launch point", body: "Up positive, so a landing point below the cliff top has $y = -h$. One vertical equation then covers the whole flight, exactly as in M7.3." } },
    { worked: { tag: "exam", title: "Show $U = 28$; greatest height above the ground", src: "A-level Oct 2020 · P3 Q5(a)(b) · 9 marks",
      q: "A small ball is projected with speed $U$ m s$^{-1}$ at 45° above the horizontal from a point $O$ at the top of a vertical cliff. $O$ is 25 m vertically above the point $N$ on horizontal ground. The ball hits the ground at $A$, where $AN = 100$ m. The ball is modelled as a particle moving freely under gravity. **(a)** Show that $U = 28$. **(b)** Find the greatest height of the ball above the horizontal ground $NA$.",
      steps: [
        { h: "(a) Horizontal", m: "$100 = U\\cos45° \\cdot t$", mk: "M1 A1" },
        { h: "Vertical (up positive, lands at $-25$)", m: "$-25 = U\\sin45° \\cdot t - 4.9t^2$", mk: "M1 A1" },
        { h: "$U\\sin45° \\cdot t = U\\cos45° \\cdot t = 100$", m: "$-25 = 100 - 4.9t^2 \\Rightarrow t^2 = \\dfrac{125}{4.9} \\Rightarrow t = 5.05$", mk: "M1" },
        { m: "$U = \\dfrac{100}{t\\cos45°} = 28$", mk: "A1*", n: "Exact: $t^2 = \\frac{1250}{49}$, $U^2 = \\frac{2 \\times 100^2}{t^2} = 784$." },
        { h: "(b) Rise above $O$", m: "$0 = (28\\sin45°)^2 - 2 \\times 9.8 \\times h$", mk: "M1 A1" },
        { m: "$h = \\dfrac{392}{19.6} = 20$, so $25 + 20 = 45$ m", mk: "A1" }
      ], result: "(b) 45 m" } },
    { fig: projFig(19.799, 19.799, 25, 5.0508, { xt: [50, 100], yt: [25, 45], h: 230, ulabel: "U",
      extra: [{ pt: [0, 25], label: "O", pos: "w", i: false }, { pt: [0, 0], label: "N", pos: "sw", i: false }, { pt: [100, 0], label: "A", pos: "n", i: false }, { hline: 45, c: "accent2", label: "45 m" }],
      cap: "A-level Oct 2020: from the cliff top, up 20 m, then down 45 m to $A$." }) },
    { worked: { tag: "exam", title: "Time to land; speed on landing ($g = 10$)", src: "A-level Oct 2021 · P3 Q4(a)(b) · 9 marks",
      q: "A small stone is projected with speed 65 m s$^{-1}$ from a point $O$ at the top of a vertical cliff, 70 m vertically above the point $N$ on horizontal ground. It is projected at an angle $\\alpha$ above the horizontal, where $\\tan\\alpha = \\frac{5}{12}$, and hits the ground at $A$. The stone is modelled as a particle moving freely under gravity, with $g = 10$ m s$^{-2}$. Find **(a)** the time taken for the stone to travel from $O$ to $A$, **(b)** the speed of the stone just before it hits the ground at $A$.",
      steps: [
        { h: "Components", m: "$\\sin\\alpha = \\frac{5}{13}$, $\\cos\\alpha = \\frac{12}{13}$: $\\; 65\\sin\\alpha = 25$, $\\; 65\\cos\\alpha = 60$" },
        { h: "(a) Vertical", m: "$-70 = 25t - 5t^2$", mk: "M1 A1" },
        { m: "$t^2 - 5t - 14 = 0 \\Rightarrow (t - 7)(t + 2) = 0$", mk: "M(A)1" },
        { m: "$t = 7$ s", mk: "A1" },
        { h: "(b) Horizontal velocity at $A$", m: "$60$ m s$^{-1}$", mk: "B1" },
        { h: "Vertical velocity at $A$", m: "$25 - 10 \\times 7 = -45$", mk: "M1 A1ft" },
        { m: "speed $= \\sqrt{60^2 + 45^2}$", mk: "M1" },
        { m: "$= 75$ m s$^{-1}$", mk: "A1", n: "Or straight from suvat: $v_y^2 = 25^2 + 2 \\times 10 \\times 70 = 2025$." }
      ], result: "(a) 7 s (b) 75 m s$^{-1}$" } },
    { worked: { tag: "exam", title: "The cliff height from the landing distance; the greatest height", src: "A-level June 2025 · P3 Q5 · 8 marks",
      q: "A small stone is projected with speed 14 m s$^{-1}$ from a point $O$ on the top of a cliff, $H$ metres vertically above the point $N$ on horizontal ground. It is projected at an angle $\\theta$ above the horizontal, where $\\tan\\theta = \\frac12$, and strikes the ground at $A$, where $NA = 40$ m. Modelling the stone as a particle moving freely under gravity, find **(a)** the value of $H$, **(b)** the maximum height of the stone above the horizontal ground.",
      steps: [
        { h: "Components", m: "$\\cos\\theta = \\frac{2}{\\sqrt5}$, $\\sin\\theta = \\frac{1}{\\sqrt5}$: $\\; \\dfrac{28}{\\sqrt5}$ and $\\dfrac{14}{\\sqrt5}$" },
        { h: "(a) Horizontal", m: "$40 = \\dfrac{28}{\\sqrt5}t \\Rightarrow t = \\dfrac{10\\sqrt5}{7} = 3.19$ s", mk: "M1 A1" },
        { h: "Vertical", m: "$-H = \\dfrac{14}{\\sqrt5}t - 4.9t^2$", mk: "M1 A1" },
        { m: "$-H = 20 - 4.9 \\times \\dfrac{500}{49} = 20 - 50 \\Rightarrow H = 30$", mk: "A1" },
        { h: "(b) Rise above $O$", m: "$0 = \\left(\\dfrac{14}{\\sqrt5}\\right)^2 - 2 \\times 9.8 \\times h$", mk: "M1" },
        { m: "$h = \\dfrac{39.2}{19.6} = 2$", mk: "A1" },
        { m: "$30 + 2 = 32$ m", mk: "A1" }
      ], result: "(a) $H = 30$ (b) 32 m" } },
    { worked: { tag: "exam", title: "Does the serve clear the net? Its speed there", src: "A-level Specimen · P3 Q5(a)(b) · 12 marks",
      q: "A tennis player serves so the ball passes over the net. The ball is struck at $O$, 3.5 m vertically above the point $A$ on horizontal ground, with velocity 45 m s$^{-1}$ at 10° **below** the horizontal. The bottom of the net is $B$, on the ground, with $AB = 12$ m; the net is 1 m high. The ball is modelled as a particle moving freely under gravity and passes over the net vertically above $B$. Find, using the model, **(a)** in centimetres to 2 s.f., the distance between the ball and the top of the net as it passes over, **(b)** to 2 s.f., the speed of the ball as it passes over the net.",
      steps: [
        { h: "(a) Horizontal: time to the net", m: "$12 = 45\\cos10° \\cdot T$", mk: "M1 A1" },
        { m: "$T = 0.2708$ s", mk: "A1" },
        { h: "Vertical (down positive)", m: "$s = 45\\sin10° \\cdot T + 4.9T^2$", mk: "M1 A1" },
        { m: "$s = 2.116 + 0.359 = 2.475$ m dropped", mk: "M1" },
        { h: "Height above the net", m: "$3.5 - 2.475 - 1 = 0.025$ m", mk: "M1" },
        { m: "$= 2.5$ cm", mk: "A1", n: "2.5 is the only answer: a very close shave." },
        { h: "(b) Vertical velocity at the net", m: "$v_y = 45\\sin10° + 9.8 \\times 0.2708 = 10.47$ (down)", mk: "M1 A1" },
        { m: "speed $= \\sqrt{(45\\cos10°)^2 + 10.47^2}$", mk: "M1" },
        { m: "$= 45.5 \\approx 46$ m s$^{-1}$", mk: "A1" }
      ], result: "(a) 2.5 cm (b) 46 m s$^{-1}$" } },
    { fig: { x: [-1, 14], y: [0, 4.2], w: 500, h: 220, axes: { x: "x (m)", y: "height (m)", xt: [12], yt: [1, 3.5] },
      items: [
        { param: { x: "44.316*t", y: "3.5-7.814*t-4.9*t^2" }, t: [0, 0.31], c: "accent", w: 2.4 },
        { line: [[12, 0], [12, 1]], c: "text2", w: 3 },
        { pt: [0, 3.5], label: "O", pos: "n", i: false },
        { pt: [12, 1.025], label: "2.5 cm above the net", pos: "ne", i: false }
      ], cap: "A-level Specimen: the ball drops 2.475 m in the 0.27 s it takes to reach the net." } },
    { worked: { tag: "exam", title: "From a greatest height to the launch angle", src: "A-level June 2018 · P3 Q10(a)(b)(d) · 14 marks",
      q: "A boy throws a ball at a target. As it leaves his hand at $A$, the ball is 2 m above horizontal ground, moving with speed $U$ at angle $\\alpha$ above the horizontal. The highest point reached is 3 m above the ground. The target is modelled as the point $T$, 20 m horizontally from $A$ and 0.75 m above the ground; the ball reaches $T$ without hitting the ground. The ball is modelled as a particle moving freely under gravity. **(a)** Show that $U^2 = \\dfrac{2g}{\\sin^2\\alpha}$. **(b)** Find the size of the angle $\\alpha$. **(d)** Find the time taken for the ball to travel from $A$ to $T$.",
      steps: [
        { h: "(a) It rises 1 m", m: "$0^2 = (U\\sin\\alpha)^2 - 2g(3 - 2)$", mk: "M1" },
        { m: "$U^2 = \\dfrac{2g}{\\sin^2\\alpha}$", mk: "A1*" },
        { h: "(b) Horizontal", m: "$20 = U\\cos\\alpha \\cdot t$", mk: "M1 A1" },
        { h: "Vertical: $T$ is 1.25 m below $A$", m: "$-1.25 = U\\sin\\alpha \\cdot t - \\tfrac12 gt^2$", mk: "M1 A1" },
        { h: "Substitute $t = \\dfrac{20}{U\\cos\\alpha}$", m: "$-1.25 = 20\\tan\\alpha - \\dfrac{200g}{U^2\\cos^2\\alpha}$", mk: "M1" },
        { h: "Use (a): $U^2\\cos^2\\alpha = \\dfrac{2g}{\\tan^2\\alpha}$", m: "$-1.25 = 20\\tan\\alpha - 100\\tan^2\\alpha$", mk: "M1 A1", n: "$g$ cancels." },
        { m: "$100\\tan^2\\alpha - 20\\tan\\alpha - 1.25 = 0 \\Rightarrow (4\\tan\\alpha - 1)(100\\tan\\alpha + 5) = 0$", mk: "M1" },
        { m: "$\\tan\\alpha = \\frac14 \\Rightarrow \\alpha = 14.0°$", mk: "A1", n: "No restriction on accuracy, since $g$ cancels." },
        { h: "(d)", m: "$U = \\dfrac{\\sqrt{2 \\times 9.8}}{\\sin 14.04°} = 18.25$", mk: "M1" },
        { m: "$t = \\dfrac{20}{U\\cos\\alpha}$", mk: "M1" },
        { m: "$t = 1.1$ s", mk: "A1" }
      ], result: "(b) 14° (d) 1.1 s" } },

    /* ---------------------------------------------------------------- Exam toolkit */
    { page: "Exam toolkit" },
    { callout: { t: "memorise", h: "Every projectile question", body: [
      "Resolve the launch velocity: $U\\cos\\alpha$ across, $U\\sin\\alpha$ up (or down, if projected below the horizontal).",
      "Across: $x = U\\cos\\alpha\\, t$. Up: $y = U\\sin\\alpha\\, t - \\frac12 gt^2$, $\\dot y = U\\sin\\alpha - gt$.",
      "Top: $\\dot y = 0$. Landing: $y = 0$ or $y = -h$. Speed: $\\sqrt{\\dot x^2 + \\dot y^2}$."
    ] } },
    { callout: { t: "formula", h: "Derived results (level ground) — derive, do not quote", body: "$t_{\\text{top}} = \\dfrac{U\\sin\\alpha}{g}$, $\\; H = \\dfrac{U^2\\sin^2\\alpha}{2g}$, $\\; T = \\dfrac{2U\\sin\\alpha}{g}$, $\\; R = \\dfrac{U^2\\sin2\\alpha}{g}$, $\\; y = x\\tan\\alpha - \\dfrac{gx^2(1 + \\tan^2\\alpha)}{2U^2}$" } },
    { callout: { t: "mnemonic", h: "\"Split, link, solve\"", body: "**Split** into across and up; **link** them with $t$; **solve** the one with the unknown." } },
    { callout: { t: "warn", h: "Common losses", body: [
      "sin/cos confused when resolving (condoned in the M mark, never in the A mark).",
      "Using the horizontal speed alone as the speed at a point.",
      "Forgetting the cliff: landing is $y = -h$, not $y = 0$.",
      "\"Show that\" without eliminating $t$ fully, or with $g = 9.81$.",
      "Leaving $\\sec^2\\alpha$ instead of turning it into $1 + \\tan^2\\alpha$."
    ] } }
  ],
  flashcards: [
    ["Horizontal acceleration of a projectile?", "Zero — the horizontal velocity is constant."],
    ["Vertical acceleration of a projectile?", "$g$ downwards."],
    ["Velocity components at launch?", "$U\\cos\\alpha$ horizontal, $U\\sin\\alpha$ vertical."],
    ["Condition at the greatest height?", "Vertical velocity zero."],
    ["Greatest height on level ground?", "$\\dfrac{U^2\\sin^2\\alpha}{2g}$."],
    ["Time of flight on level ground?", "$\\dfrac{2U\\sin\\alpha}{g}$."],
    ["Range on level ground?", "$\\dfrac{U^2\\sin2\\alpha}{g}$."],
    ["Angle for the greatest range?", "45°."],
    ["Equation of the path?", "$y = x\\tan\\alpha - \\dfrac{gx^2(1 + \\tan^2\\alpha)}{2U^2}$."],
    ["Speed at any instant?", "$\\sqrt{\\dot x^2 + \\dot y^2}$."],
    ["Landing point 70 m below the launch point, up positive?", "$y = -70$."],
    ["$\\tan\\alpha = \\frac34$, $U = 35$: components?", "28 horizontal, 21 vertical."]
  ],
  quiz: [
    { q: "At the top of its path a projectile's velocity is", opts: ["horizontal, $U\\cos\\alpha$", "zero", "vertical", "$U$"], ans: 0, why: "Only the vertical part is zero." },
    { q: "Projected at 20 m s$^{-1}$ at 30°: its horizontal velocity is", opts: ["17.3 m s$^{-1}$", "10 m s$^{-1}$", "20 m s$^{-1}$", "11.5 m s$^{-1}$"], ans: 0, why: "$20\\cos30°$." },
    { q: "The range is greatest when $\\alpha$ is", opts: ["45°", "30°", "60°", "90°"], ans: 0, why: "$\\sin2\\alpha = 1$." },
    { q: "Which pair of angles gives the same range?", opts: ["20° and 70°", "20° and 40°", "30° and 45°", "15° and 60°"], ans: 0, why: "Complementary angles." },
    { q: "$\\sec^2\\alpha$ in a path equation is replaced by", opts: ["$1 + \\tan^2\\alpha$", "$1 - \\tan^2\\alpha$", "$\\cos^2\\alpha$", "$\\tan^2\\alpha - 1$"], ans: 0, why: "The Pythagorean identity." }
  ]
};

/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
