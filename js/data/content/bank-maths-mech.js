/* KurenaiOS — Edexcel Maths Mechanics question bank (S6–S9).
 * Modelled on the Topic Practice compilation (8MA0 Paper 2 / 9MA0 Paper 3 Section B).
 * Numbers and contexts are re-written; `src` names the paper each item is modelled on.
 * g = 9.8 m/s² throughout, answers to 2 or 3 s.f. as the mark schemes expect.
 * Loaded after maths-applied.js; extends the base leaves via KOS.content.extend. */
(function (X) {
"use strict";

X("maths:S6.1", {
  notes: [
    { page: "Past-paper patterns" },
    "Every mechanics question ends with a **modelling** part worth 1–2 marks: *state a limitation / assumption* and *how the answer would change*. Have the standard list ready and tie it to the question: **particle** (no size, no rotation, no air resistance area); **light** string/rod (no mass, so tension is the same throughout); **inextensible** string (both particles have the same speed and acceleration); **smooth** surface/pulley (no friction; tension the same each side); **rough** (friction $\\le \\mu R$); **uniform** rod (weight at the midpoint); **$g$ constant** at 9.8. Because $g = 9.8$ is used, give final answers to **2 or 3 significant figures** — an answer to 5 s.f. loses the accuracy mark.",
    { callout: { t: "tip", h: "The 'refine the model' answer", body: "\"Include air resistance — the stone would reach a lower maximum height and take a shorter time to land\" scores both marks: a named refinement *and* its direction of effect." } }
  ],
  flashcards: [
    ["SI units of force, and its base-unit form?", "Newton (N) $= \\text{kg m s}^{-2}$."],
    ["Convert 72 km/h to m/s.", "$72 \\times \\dfrac{1000}{3600} = 20$ m/s."],
    ["Convert 15 m/s to km/h.", "$15 \\times 3.6 = 54$ km/h."],
    ["Units of moment?", "Newton metres (N m)."],
    ["What does modelling as a *particle* assume?", "The object has no size — all its mass acts at one point and rotation/air resistance are ignored."],
    ["What does a *light* string mean and why does it matter?", "It has no mass, so the tension is the same at every point along it."],
    ["What does *inextensible* give you?", "Connected particles have the same speed and the same magnitude of acceleration."],
    ["What does a *smooth* pulley give you?", "The tension is the same on both sides of the pulley."],
    ["Why are answers given to 2 or 3 s.f.?", "Because $g = 9.8$ is itself an approximation to 2 s.f."],
    ["Why model a ball as a particle even though it spins?", "It simplifies the problem — the effects of size, spin and air resistance are small at low speeds."]
  ],
  quiz: [
    { q: "Units of acceleration:", opts: ["m/s", "m/s²", "N", "kg m/s"], ans: 1, why: "Rate of change of velocity." },
    { q: "'Light inextensible string' means:", opts: ["massless and fixed length", "massless and stretchy", "heavy and fixed length", "weightless in space"], ans: 0, why: "Standard model." },
    { q: "A smooth surface exerts:", opts: ["friction only", "a normal reaction only", "no force", "weight"], ans: 1, why: "No friction." },
    { q: "Modelling a beam as *uniform* puts its weight:", opts: ["at one end", "at the midpoint", "at the support", "nowhere"], ans: 1, why: "Centre of mass at the middle." },
    { q: "$g$ is taken as:", opts: ["10", "9.8", "9.81", "9.806"], ans: 1, why: "Edexcel convention." },
    { q: "Ignoring air resistance in projectile motion makes the predicted range:", opts: ["smaller", "larger", "the same", "zero"], ans: 1, why: "Real drag shortens the range." },
    { q: "1 N is the force giving 1 kg an acceleration of:", opts: ["9.8 m/s²", "1 m/s²", "1 m/s", "10 m/s²"], ans: 1, why: "Definition." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2022 P2 Q1", q: "A stone is modelled as a particle moving freely under gravity. State two assumptions this model makes, and for one of them explain how removing it would change the calculated time of flight.", marks: 3,
      ms: ["B1: air resistance is ignored", "B1: the stone has no size / does not spin / $g$ is constant", "B1: including air resistance would reduce the speed so the stone rises less and lands sooner (shorter time of flight)"] },
    { level: "AS", src: "Edexcel AS 2019 P2 Q2", q: "Two balls are connected by a light inextensible string passing over a smooth fixed pulley. Explain how each of the words *light*, *inextensible* and *smooth* has been used in setting up the equations of motion.", marks: 3,
      ms: ["B1: light — the tension is the same throughout the string", "B1: inextensible — both balls have the same magnitude of acceleration", "B1: smooth — the tension is the same on each side of the pulley"] },
    { src: "Edexcel 2023 P3 Q1", ctx: "A car of mass 900 kg travels along a straight horizontal road. Its speed increases from 54 km/h to 90 km/h in 8 seconds with constant acceleration.",
      parts: [
        { q: "Convert the two speeds to m/s.", marks: 1, ms: ["B1: 15 m/s and 25 m/s"] },
        { q: "Find the acceleration and the resultant force on the car.", marks: 2, ms: ["M1: $a = \\tfrac{25 - 15}{8} = 1.25$ m/s²", "A1: $F = 900 \\times 1.25 = 1125$ N"] },
        { q: "State one limitation of modelling the car as a particle.", marks: 1, ms: ["B1: the car has size — forces such as air resistance depend on its shape, and the rotation of wheels is ignored"] }
      ] }
  ]
});

X("maths:S7.1", {
  notes: [
    { page: "Past-paper patterns" },
    "**Displacement** is a vector from the start point; **distance** is the total length travelled — a ball thrown up and caught has zero displacement but non-zero distance (Nov 2021 Q1 \"total distance in 4 s\" needs the up *and* down legs). **Velocity** is a vector; **speed** is its magnitude. In $\\mathbf i$–$\\mathbf j$ questions: *position* $\\mathbf r$, *velocity* $\\mathbf v$, *speed* $|\\mathbf v|$, *direction of motion* is the direction of $\\mathbf v$ (as a bearing from $\\mathbf j$ = north), *distance from $O$* is $|\\mathbf r|$. With constant acceleration $\\mathbf r = \\mathbf r_0 + \\mathbf u t + \\tfrac12\\mathbf a t^2$ (Specimen Q1: two positions give $\\mathbf u$).",
    { callout: { t: "warn", h: "Bearings from vectors", body: "$\\mathbf v = 4\\mathbf i - 3\\mathbf j$ points east-and-south: bearing $= 90° + \\arctan\\tfrac34 = 126.9°$. Sketch the vector before reaching for arctan." } }
  ],
  flashcards: [
    ["Displacement vs distance?", "Displacement: vector from start to finish; distance: total path length (scalar)."],
    ["Velocity vs speed?", "Velocity is a vector (has direction); speed is its magnitude."],
    ["Position vector formula for constant acceleration?", "$\\mathbf r = \\mathbf r_0 + \\mathbf u t + \\tfrac12\\mathbf a t^2$."],
    ["$\\mathbf r_0 = 2\\mathbf i + \\mathbf j$, $\\mathbf a = \\mathbf i - 2\\mathbf j$, $\\mathbf r(3) = 14\\mathbf i - 11\\mathbf j$. Find $\\mathbf u$.", "$3\\mathbf u = 14\\mathbf i - 11\\mathbf j - (2\\mathbf i + \\mathbf j) - 4.5(\\mathbf i - 2\\mathbf j) = 7.5\\mathbf i - 3\\mathbf j$; $\\mathbf u = 2.5\\mathbf i - \\mathbf j$."],
    ["Bearing of the velocity $4\\mathbf i - 3\\mathbf j$?", "$126.9°$ (east then south)."],
    ["A stone thrown up at 14.7 m/s returns to the hand after 3 s. Displacement and distance?", "Displacement 0; distance $2 \\times 11.025 = 22.05$ m."],
    ["Average velocity vs average speed?", "Average velocity $= \\dfrac{\\text{displacement}}{\\text{time}}$; average speed $= \\dfrac{\\text{distance}}{\\text{time}}$."],
    ["Distance of the particle from $O$ when $\\mathbf r = 6\\mathbf i - 8\\mathbf j$?", "10 m."],
    ["'Instantaneously at rest' means…", "$v = 0$ at that instant (the acceleration need not be zero)."]
  ],
  quiz: [
    { q: "A runner completes one lap of a 400 m track. Displacement:", opts: ["400 m", "0", "200 m", "800 m"], ans: 1, why: "Back at the start." },
    { q: "Speed of a particle with $\\mathbf v = 3\\mathbf i + 4\\mathbf j$:", opts: ["7", "5", "1", "12"], ans: 1, why: "Magnitude." },
    { q: "Direction of motion is the direction of:", opts: ["$\\mathbf r$", "$\\mathbf v$", "$\\mathbf a$", "$\\mathbf F$"], ans: 1, why: "Velocity." },
    { q: "The bearing of $-\\mathbf i + \\mathbf j$ is:", opts: ["045", "135", "225", "315"], ans: 3, why: "North-west." },
    { q: "Velocity $-5$ m/s means:", opts: ["slowing down", "moving in the negative direction at 5 m/s", "at rest", "accelerating"], ans: 1, why: "Sign = direction." },
    { q: "A particle moving north-east has velocity proportional to:", opts: ["$\\mathbf i + \\mathbf j$", "$\\mathbf i - \\mathbf j$", "$\\mathbf j$", "$-\\mathbf i + \\mathbf j$"], ans: 0, why: "Equal components." }
  ],
  exam: [
    { src: "Edexcel Specimen P3 Q1", ctx: "A particle moves with constant acceleration $(\\mathbf i - 2\\mathbf j)$ m/s². At $t = 0$ its position vector is $(2\\mathbf i + \\mathbf j)$ m and at $t = 3$ s it is $(14\\mathbf i - 11\\mathbf j)$ m.",
      parts: [
        { q: "Find the initial velocity $\\mathbf u$ of the particle.", marks: 3, ms: ["M1: $14\\mathbf i - 11\\mathbf j = 2\\mathbf i + \\mathbf j + 3\\mathbf u + \\tfrac12(\\mathbf i - 2\\mathbf j)(9)$", "M1: $3\\mathbf u = 7.5\\mathbf i - 3\\mathbf j$", "A1: $\\mathbf u = (2.5\\mathbf i - \\mathbf j)$ m/s"] },
        { q: "Find the speed of the particle at $t = 3$ and the bearing on which it is then moving.", marks: 3, ms: ["M1: $\\mathbf v = \\mathbf u + 3\\mathbf a = 5.5\\mathbf i - 7\\mathbf j$", "A1: speed $\\sqrt{30.25 + 49} = 8.90$ m/s", "A1: bearing $90° + \\arctan\\tfrac{7}{5.5} = 141.8°$ (awrt 142°)"] }
      ] },
    { level: "AS", src: "Edexcel AS Nov 2021 P2 Q1", ctx: "A stone is thrown vertically upwards from a point $O$ with speed 14.7 m/s and moves freely under gravity.",
      parts: [
        { q: "Find the time $T$ at which the stone returns to $O$.", marks: 2, ms: ["M1: $0 = 14.7T - 4.9T^2$", "A1: $T = 3$ s"] },
        { q: "Find the total distance travelled by the stone in the first 4 seconds. ($O$ is well above the ground.)", marks: 4, ms: ["M1: maximum height $\\tfrac{14.7^2}{2 \\times 9.8} = 11.025$ m", "M1: displacement at $t = 4$: $14.7(4) - 4.9(16) = -19.6$ m", "M1: distance $= 11.025 + 11.025 + 19.6$", "A1: $41.65$ m (awrt 41.6 or 41.7)"] },
        { q: "State the displacement of the stone from $O$ at $t = 4$ and explain how it differs from the distance travelled.", marks: 1, ms: ["B1: displacement $-19.6$ m (19.6 m below $O$); the distance counts the upward and downward journeys separately"] }
      ] },
    { src: "Edexcel Oct 2021 P3 Q1", ctx: "A particle $P$ has velocity $(3\\mathbf i - 2\\mathbf j)$ m/s at $t = 0$ and moves with constant acceleration $(2\\mathbf i - 3\\mathbf j)$ m/s². At $t = 0$ it is at the point with position vector $(-\\mathbf i + 4\\mathbf j)$ m.",
      parts: [
        { q: "Find the velocity of $P$ at $t = 2$.", marks: 2, ms: ["M1: $\\mathbf v = (3\\mathbf i - 2\\mathbf j) + 2(2\\mathbf i - 3\\mathbf j)$", "A1: $(7\\mathbf i - 8\\mathbf j)$ m/s"] },
        { q: "Find the position vector of $P$ at $t = 2$ and its distance from $O$.", marks: 3, ms: ["M1: $\\mathbf r = -\\mathbf i + 4\\mathbf j + 2(3\\mathbf i - 2\\mathbf j) + \\tfrac12(4)(2\\mathbf i - 3\\mathbf j)$", "A1: $(9\\mathbf i - 6\\mathbf j)$ m", "A1: distance $\\sqrt{117} = 10.8$ m"] }
      ] }
  ]
});

X("maths:S7.2", {
  notes: [
    { page: "Past-paper patterns" },
    "**Velocity–time graphs**: gradient $=$ acceleration, area $=$ displacement. Every graph question (AS 2022 Q2, AS 2025 Q1, Specimen Q2, 2024 Q2) is *\"sketch, then use the area\"*: write the area as a trapezium $\\tfrac12(a + b)h$ or as triangles + rectangle in terms of the unknown ($V$ or $T$), set it equal to the given distance and solve. **Two-phase symmetric journeys** (accelerate at 2, decelerate at 3): times are $\\tfrac V2$ and $\\tfrac V3$, so area $= \\tfrac12 V\\left(\\tfrac V2 + \\tfrac V3\\right)$. **Distance–time sketch** (AS 2024 Q1): constant speed is a straight line, acceleration curves upward (convex), deceleration levels off; the graph never falls if the particle keeps moving forward.",
    { callout: { t: "warn", h: "Label the sketch", body: "Axes ($v$ m/s, $t$ s), the value $V$ on the $v$-axis, and each time on the $t$-axis. An unlabelled sketch scores at most the shape mark." } }
  ],
  flashcards: [
    ["Gradient of a $v$–$t$ graph?", "Acceleration."],
    ["Area under a $v$–$t$ graph?", "Displacement (distance if $v \\ge 0$)."],
    ["Gradient of a displacement–time graph?", "Velocity."],
    ["Train: accelerates from rest for 60 s to $V$, constant for 500 s, decelerates to rest in 140 s; total 12 km. Find $V$.", "$\\tfrac12(700 + 500)V = 12000 \\Rightarrow 600V = 12000$, $V = 20$ m/s."],
    ["Car: accelerates at 2 m/s² to $V$ then immediately decelerates at 3 m/s² to rest, covering 240 m. $V$?", "$\\tfrac{V^2}{4} + \\tfrac{V^2}{6} = 240 \\Rightarrow \\tfrac{5V^2}{12} = 240$, $V = 24$ m/s."],
    ["Runner: accelerates uniformly from rest to 8 m/s in 5 s then keeps 8 m/s; 400 m total. Time $T$?", "$20 + 8(T - 5) = 400 \\Rightarrow T = 52.5$ s."],
    ["Shape of the $s$–$t$ graph during constant acceleration from rest?", "A curve of increasing gradient (parabola)."],
    ["What does a horizontal section of a $v$–$t$ graph show?", "Constant velocity — zero acceleration."],
    ["What does a negative gradient on a $v$–$t$ graph show?", "Deceleration (acceleration in the negative direction)."]
  ],
  quiz: [
    { q: "A $v$–$t$ graph is a straight line from (0, 0) to (10, 25). Acceleration:", opts: ["2.5 m/s²", "25 m/s²", "0.4 m/s²", "10 m/s²"], ans: 0, why: "Gradient." },
    { q: "Distance covered in that 10 s:", opts: ["250 m", "125 m", "25 m", "50 m"], ans: 1, why: "Triangle area." },
    { q: "Trapezium rule for a $v$–$t$ trapezium with parallel sides $T_1$, $T_2$ and height $V$:", opts: ["$\\tfrac12(T_1 + T_2)V$", "$(T_1 + T_2)V$", "$\\tfrac12 T_1 T_2 V$", "$T_1 V$"], ans: 0, why: "Area." },
    { q: "Constant acceleration on a $v$–$t$ graph is:", opts: ["a curve", "a straight line", "horizontal", "vertical"], ans: 1, why: "Constant gradient." },
    { q: "A displacement–time graph with a horizontal section shows:", opts: ["constant velocity", "at rest", "acceleration", "returning"], ans: 1, why: "No change in position." },
    { q: "If the acceleration phase takes $V/2$ s and deceleration $V/3$ s, the total time is:", opts: ["$5V/6$", "$V/6$", "$V$", "$6V/5$"], ans: 0, why: "Add." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2022 P2 Q2", ctx: "A train travels between two stations 12 km apart in 700 s. It accelerates uniformly from rest for 60 s to speed $V$ m/s, travels at $V$ for 500 s, then decelerates uniformly to rest.",
      parts: [
        { q: "Sketch a speed–time graph for the journey.", marks: 2, ms: ["B1: trapezium shape starting and ending at $v = 0$", "B1: labelled 60, 560, 700 on the $t$-axis and $V$ on the $v$-axis"] },
        { q: "Find the value of $V$.", marks: 3, ms: ["M1: $\\tfrac12(700 + 500)V = 12000$", "A1: $600V = 12000$", "A1: $V = 20$"] },
        { q: "Find the deceleration of the train.", marks: 2, ms: ["M1: $\\tfrac{20}{140}$", "A1: $0.143$ m/s²"] }
      ] },
    { level: "AS", src: "Edexcel AS Specimen P2 Q2", ctx: "A car starts from rest at a set of traffic lights, accelerates uniformly at 2 m/s² to a speed $V$ m/s, then immediately decelerates uniformly at 3 m/s² and comes to rest at the next set of lights 240 m away.",
      parts: [
        { q: "Sketch a velocity–time graph for the motion.", marks: 2, ms: ["B1: triangle from the origin to $V$ then back to zero", "B1: times $\\tfrac V2$ and $\\tfrac V3$ (or $T_1$, $T_2$) labelled"] },
        { q: "Find $V$.", marks: 4, ms: ["M1: times $\\tfrac{V}{2}$ and $\\tfrac{V}{3}$", "M1: $\\tfrac12 V\\left(\\tfrac V2 + \\tfrac V3\\right) = 240$", "A1: $\\tfrac{5V^2}{12} = 240$", "A1: $V = 24$"] },
        { q: "Find the total time taken.", marks: 1, ms: ["B1: $12 + 8 = 20$ s"] }
      ] },
    { level: "AS", src: "Edexcel AS 2025 P2 Q1", ctx: "A runner starts from rest at $A$, accelerates uniformly to 8 m/s in 5 s, then runs at 8 m/s until reaching $B$, 400 m from $A$, at time $T$ s.",
      parts: [
        { q: "Sketch a speed–time graph.", marks: 2, ms: ["B1: line from origin to $(5, 8)$ then horizontal to $(T, 8)$", "B1: labels 5, $T$, 8"] },
        { q: "Find $T$.", marks: 3, ms: ["M1: $\\tfrac12 \\times 5 \\times 8 + 8(T - 5) = 400$", "A1: $8T - 20 = 400$", "A1: $T = 52.5$"] }
      ] },
    { src: "Edexcel 2024 P3 Q2", ctx: "A sprinter runs 200 m. She accelerates uniformly from rest to 11 m/s in 4 s, holds 11 m/s for 12 s, then decelerates uniformly to 9 m/s, crossing the line at $t = T$.",
      parts: [
        { q: "Find her acceleration in the first phase.", marks: 1, ms: ["B1: $2.75$ m/s²"] },
        { q: "Find the distance covered in the first 16 s.", marks: 2, ms: ["M1: $22 + 132$", "A1: $154$ m"] },
        { q: "Find $T$.", marks: 3, ms: ["M1: $\\tfrac12(11 + 9)(T - 16) = 46$", "A1: $10(T - 16) = 46$", "A1: $T = 20.6$ s"] },
        { q: "Sketch a displacement–time graph for the whole run, describing its shape in each phase.", marks: 2, ms: ["B1: curve of increasing gradient, then straight line", "B1: curve of slightly decreasing gradient to 200 m at $T = 20.6$"] }
      ] }
  ]
});

X("maths:S7.3", {
  notes: [
    { page: "Past-paper patterns" },
    "**Vertical motion under gravity** dominates the AS papers: choose *up* as positive, $a = -9.8$, write $s$ as displacement *from the launch point* (a stone thrown from 1.8 m that hits the ground has $s = -1.8$). The classic parts: **maximum height** ($v = 0$), **time to hit the ground** (quadratic in $t$ — reject the negative root), **speed on impact** ($v^2 = u^2 + 2as$), **time above a height / speed below a threshold** (\"$|v| < 9.8$\" $\\Rightarrow$ a time interval, use symmetry). **Two-stage motion** (AS 2019 Q1 parachutist): free fall then uniform deceleration — the final speed of stage 1 is the initial speed of stage 2. **Cars** (2023 Q1): $v = u + at$, $s = ut + \\tfrac12 at^2$, then link to $F = ma$.",
    { callout: { t: "mnemonic", h: "Pick the suvat", body: "List $s, u, v, a, t$; tick the three you know and the one you want; the formula without the fifth letter is the one to use. Show the substitution line — it is the method mark even if the arithmetic slips." } }
  ],
  flashcards: [
    ["The five suvat equations?", "$v = u + at$; $s = ut + \\tfrac12 at^2$; $v^2 = u^2 + 2as$; $s = \\tfrac12(u + v)t$; $s = vt - \\tfrac12 at^2$."],
    ["Stone projected up from 1.8 m above ground reaches 20 m above ground. $U$?", "$0 = U^2 - 2(9.8)(18.2) \\Rightarrow U = 18.9$ m/s."],
    ["Time for that stone to hit the ground?", "$-1.8 = 18.9t - 4.9t^2 \\Rightarrow t = 3.95$ s."],
    ["Ball projected up at 14.7 m/s from 19.6 m above ground: speed on impact?", "$v^2 = 14.7^2 + 2(9.8)(19.6) = 600.25$, $v = 24.5$ m/s."],
    ["Car: $u = 5$, $a = 3.2$, $t = 5$. $v$ and $s$?", "$v = 21$ m/s; $s = 25 + 40 = 65$ m."],
    ["Parachutist falls freely from rest for 3 s. Speed and distance?", "$v = 29.4$ m/s, $s = 44.1$ m."],
    ["Then decelerates uniformly to land at 4 m/s after a total fall of 250 m. Deceleration?", "$4^2 = 29.4^2 - 2a(205.9) \\Rightarrow a = 2.06$ m/s²."],
    ["Stone from $O$ (height $h$) at 19.6 m/s up hits the ground after 5 s. $h$?", "$-h = 19.6(5) - 4.9(25) = -24.5$, so $h = 24.5$ m."],
    ["For how long is that stone's speed less than 9.8 m/s?", "$|19.6 - 9.8t| < 9.8 \\Rightarrow 1 < t < 3$: 2 s."],
    ["Why reject the negative root when solving for $t$?", "Time before projection has no physical meaning in the model."]
  ],
  quiz: [
    { q: "Max height of a ball thrown up at 19.6 m/s:", opts: ["19.6 m", "39.2 m", "9.8 m", "4.9 m"], ans: 0, why: "$u^2/2g = 384.16/19.6$." },
    { q: "Time to reach that max height:", opts: ["1 s", "2 s", "4 s", "9.8 s"], ans: 1, why: "$u/g$." },
    { q: "Taking up as positive, $a =$", opts: ["9.8", "$-9.8$", "0", "$\\pm 9.8$"], ans: 1, why: "Gravity acts down." },
    { q: "A stone dropped from rest falls 44.1 m in:", opts: ["3 s", "4.5 s", "9 s", "2 s"], ans: 0, why: "$4.9t^2 = 44.1$." },
    { q: "Which equation has no $t$?", opts: ["$v = u + at$", "$v^2 = u^2 + 2as$", "$s = ut + \\tfrac12 at^2$", "$s = \\tfrac12(u+v)t$"], ans: 1, why: "Time-free." },
    { q: "A ball thrown up returns to the thrower's hand with:", opts: ["a smaller speed", "the same speed", "a larger speed", "zero speed"], ans: 1, why: "Symmetry (no air resistance)." },
    { q: "$u = 12$, $v = 0$, $a = -3$: $s =$", opts: ["24 m", "48 m", "4 m", "36 m"], ans: 0, why: "$144/6$." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2022 P2 Q1", ctx: "A stone is projected vertically upwards with speed $U$ m/s from a point 1.8 m above horizontal ground. It reaches a maximum height of 20 m above the ground before falling to the ground at time $T$ s after projection. Model the stone as a particle moving freely under gravity.",
      parts: [
        { q: "Show that $U = 18.9$ to 3 significant figures.", marks: 3, ms: ["M1: $0 = U^2 - 2 \\times 9.8 \\times 18.2$", "A1: $U^2 = 356.72$", "A1: $U = 18.89 = 18.9$"] },
        { q: "Find $T$.", marks: 4, ms: ["M1: $-1.8 = 18.9T - 4.9T^2$", "A1: $4.9T^2 - 18.9T - 1.8 = 0$", "M1: solves the quadratic", "A1: $T = 3.95$ s (rejecting the negative root)"] },
        { q: "State how air resistance would affect the value of $T$.", marks: 1, ms: ["B1: $T$ would be smaller — the stone would not rise as high"] }
      ] },
    { level: "AS", src: "Edexcel AS 2019 P2 Q1", ctx: "A parachutist steps out of a stationary helicopter and falls freely under gravity for 3 seconds. Her parachute then opens and she decelerates uniformly, reaching the ground with speed 4 m/s. She falls a total distance of 250 m.",
      parts: [
        { q: "Find her speed when the parachute opens and the distance fallen in the first 3 s.", marks: 3, ms: ["M1: $v = 9.8 \\times 3$", "A1: $29.4$ m/s", "A1: $s = \\tfrac12 \\times 9.8 \\times 9 = 44.1$ m"] },
        { q: "Find her deceleration after the parachute opens.", marks: 3, ms: ["M1: $4^2 = 29.4^2 - 2a(250 - 44.1)$", "A1: $2a \\times 205.9 = 848.36$", "A1: $a = 2.06$ m/s²"] },
        { q: "Find the total time of the fall.", marks: 2, ms: ["M1: $4 = 29.4 - 2.06t$", "A1: $t = 12.3$ s, total $15.3$ s"] },
        { q: "Sketch a velocity–time graph for the fall.", marks: 2, ms: ["B1: line from origin to (3, 29.4)", "B1: line down to (15.3, 4)"] }
      ] },
    { level: "AS", src: "Edexcel AS 2023 P2 Q2", ctx: "A stone is projected vertically upwards from a point $O$ with speed 19.6 m/s. It hits the ground, vertically below $O$, 5 seconds later.",
      parts: [
        { q: "Find the height of $O$ above the ground.", marks: 3, ms: ["M1: $s = 19.6(5) - 4.9(25)$", "A1: $s = -24.5$", "A1: $O$ is 24.5 m above the ground"] },
        { q: "Find the total time during which the speed of the stone is less than 9.8 m/s.", marks: 3, ms: ["M1: $v = 19.6 - 9.8t$; $v = 9.8$ at $t = 1$ and $v = -9.8$ at $t = 3$", "A1: $1 < t < 3$", "A1: 2 s"] },
        { q: "Find the speed of the stone when it hits the ground.", marks: 2, ms: ["M1: $v = 19.6 - 9.8(5)$", "A1: $29.4$ m/s"] }
      ] },
    { level: "AS", src: "Edexcel AS Specimen P2 Q1", ctx: "A ball is projected vertically upwards with speed 14.7 m/s from a point 19.6 m above the ground. It hits the ground and rebounds with half the speed with which it hit.",
      parts: [
        { q: "Find the speed of the ball when it first hits the ground.", marks: 3, ms: ["M1: $v^2 = 14.7^2 + 2(9.8)(19.6)$", "A1: $v^2 = 600.25$", "A1: $24.5$ m/s"] },
        { q: "Find the height to which the ball rebounds.", marks: 3, ms: ["M1: rebound speed $12.25$; $0 = 12.25^2 - 2(9.8)h$", "A1: $h = 150.06 / 19.6$", "A1: $7.66$ m"] }
      ] }
  ]
});

X("maths:S7.4", {
  notes: [
    { page: "Past-paper patterns" },
    "$v = \\dfrac{ds}{dt}$, $a = \\dfrac{dv}{dt}$; $s = \\int v\\,dt$, $v = \\int a\\,dt$ (+ constant from the initial conditions). The examiners' favourite trap is **total distance**: find where $v = 0$ (direction changes), integrate over each interval separately and *add the magnitudes*. **Maximum speed** on an interval: check where $a = 0$ *and* the endpoints, and remember speed is $|v|$ (AS 2025 Q4). **Vectors** (2023 Q3, 2024 Q4): differentiate/integrate each component; \"parallel to $\\mathbf i + \\mathbf j$\" means the components are equal; \"bearing 045\" means $x = y$; \"perpendicular to $y = x$\" means $\\mathbf a \\parallel \\mathbf i - \\mathbf j$.",
    { callout: { t: "warn", h: "Constant of integration", body: "$\\mathbf r = \\int \\mathbf v\\,dt + \\mathbf c$ — evaluate $\\mathbf c$ from the position at $t = 0$. Forgetting it is the most common lost accuracy mark in Paper 3." } }
  ],
  flashcards: [
    ["$s = 2t^3 - 12t^2 + 18t$: when is the particle at rest?", "$v = 6t^2 - 24t + 18 = 6(t - 1)(t - 3)$: $t = 1, 3$."],
    ["Total distance for $0 \\le t \\le 4$ with that $s$?", "$s(0) = 0, s(1) = 8, s(3) = 0, s(4) = 8$: $8 + 8 + 8 = 24$ m."],
    ["Maximum speed for $0 \\le t \\le 4$?", "$a = 12t - 24 = 0$ at $t = 2$ gives $v = -6$; endpoints $v = 18$: max speed 18 m/s."],
    ["$v = 15 - 2t - t^2$: time at rest and acceleration then?", "$(5 + t)(3 - t) = 0 \\Rightarrow t = 3$; $a = -2 - 2t = -8$ m/s²."],
    ["Distance in the first 3 s for that $v$?", "$\\int_0^3 (15 - 2t - t^2)dt = 45 - 9 - 9 = 27$ m."],
    ["$\\mathbf v = (t^2 - 3t + 7)\\mathbf i + (2t^2 - 3)\\mathbf j$: when parallel to $\\mathbf i + \\mathbf j$?", "$t^2 - 3t + 7 = 2t^2 - 3 \\Rightarrow t^2 + 3t - 10 = 0$, $t = 2$."],
    ["Acceleration of that particle at $t = 2$?", "$\\mathbf a = (2t - 3)\\mathbf i + 4t\\mathbf j = \\mathbf i + 8\\mathbf j$; $|\\mathbf a| = \\sqrt{65}$."],
    ["$\\mathbf r = ct^2\\mathbf i + t^{3/2}\\mathbf j$ is on bearing 045 at $t = 4$. $c$?", "$16c = 8 \\Rightarrow c = \\tfrac12$."],
    ["Speed then?", "$\\mathbf v = 2ct\\,\\mathbf i + \\tfrac32 t^{1/2}\\mathbf j = 4\\mathbf i + 3\\mathbf j$: 5 m/s."],
    ["$x = t^2(t - 1)^2$: why is $x$ never negative, and when is it at rest?", "It is a product of squares; $v = 2t(2t - 1)(t - 1) = 0$ at $t = 0, \\tfrac12, 1$."]
  ],
  quiz: [
    { q: "$v = 3t^2 - 4$: acceleration at $t = 2$:", opts: ["8", "12", "4", "6"], ans: 1, why: "$a = 6t$." },
    { q: "$a = 4t$, $v = 2$ at $t = 0$: $v =$", opts: ["$2t^2 + 2$", "$4t^2 + 2$", "$2t^2$", "$4$"], ans: 0, why: "Integrate, add $c$." },
    { q: "Total distance when the particle reverses direction requires:", opts: ["one integral", "splitting the integral at $v = 0$", "$|s|$", "the average speed"], ans: 1, why: "Sign change." },
    { q: "$\\mathbf v$ parallel to $\\mathbf j$ when:", opts: ["$x$-component is 0", "$y$-component is 0", "components equal", "$|\\mathbf v| = 1$"], ans: 0, why: "Purely vertical." },
    { q: "'Instantaneously at rest' for $v = t^2 - 5t + 6$:", opts: ["$t = 2, 3$", "$t = 5$", "$t = 6$", "never"], ans: 0, why: "Factorise." },
    { q: "Max speed on $[0, 4]$ must consider:", opts: ["only $a = 0$", "$a = 0$ and the endpoints, using $|v|$", "only endpoints", "$v = 0$"], ans: 1, why: "Closed interval." },
    { q: "$\\mathbf r = t^2\\mathbf i + t^3\\mathbf j$: distance from $O$ at $t = 1$:", opts: ["1", "$\\sqrt2$", "2", "$\\sqrt5$"], ans: 1, why: "$(1, 1)$." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2025 P2 Q4", ctx: "A particle $P$ moves on the $x$-axis. At time $t$ seconds its displacement from $O$ is $s = 2t^3 - 12t^2 + 18t$ metres, $0 \\le t \\le 4$.",
      parts: [
        { q: "Find the times at which $P$ is instantaneously at rest.", marks: 3, ms: ["M1: $v = 6t^2 - 24t + 18$", "M1: $6(t - 1)(t - 3) = 0$", "A1: $t = 1$ and $t = 3$"] },
        { q: "Find the total distance travelled by $P$ in the interval $0 \\le t \\le 4$.", marks: 4, ms: ["M1: $s(1) = 8$, $s(3) = 0$, $s(4) = 8$", "M1: distances $8 + 8 + 8$", "A1: 24 m", "B1: direction changes at $t = 1$ and $t = 3$ noted"] },
        { q: "Find the maximum speed of $P$ in the interval.", marks: 3, ms: ["M1: $a = 12t - 24 = 0 \\Rightarrow t = 2$, $v = -6$", "M1: compares with $v(0) = v(4) = 18$", "A1: 18 m/s"] }
      ] },
    { src: "Edexcel 2023 P3 Q3", ctx: "A particle $P$ moves so that at time $t$ s its velocity is $\\mathbf v = (t^2 - 3t + 7)\\mathbf i + (2t^2 - 3)\\mathbf j$ m/s.",
      parts: [
        { q: "Find the speed of $P$ when $t = 2$.", marks: 2, ms: ["M1: $\\mathbf v = 5\\mathbf i + 5\\mathbf j$", "A1: $5\\sqrt2 = 7.07$ m/s"] },
        { q: "Show that there is exactly one positive time at which $P$ is moving parallel to $\\mathbf i + \\mathbf j$, and find it.", marks: 3, ms: ["M1: $t^2 - 3t + 7 = 2t^2 - 3$", "A1: $t^2 + 3t - 10 = (t + 5)(t - 2) = 0$", "A1: $t = 2$ only (reject $-5$)"] },
        { q: "Find the magnitude of the acceleration of $P$ at $t = 2$.", marks: 3, ms: ["M1: $\\mathbf a = (2t - 3)\\mathbf i + 4t\\mathbf j$", "A1: $\\mathbf i + 8\\mathbf j$", "A1: $\\sqrt{65} = 8.06$ m/s²"] }
      ] },
    { src: "Edexcel 2024 P3 Q4", ctx: "A particle $P$ has position vector $\\mathbf r = ct^2\\mathbf i + t^{3/2}\\mathbf j$ metres at time $t$ s, where $c$ is a positive constant. When $t = 4$, $P$ is on a bearing of $045°$ from $O$.",
      parts: [
        { q: "Show that $c = \\tfrac12$.", marks: 2, ms: ["M1: bearing 045 means the $\\mathbf i$ and $\\mathbf j$ components are equal: $16c = 8$", "A1: $c = \\tfrac12$"] },
        { q: "Find the speed of $P$ when $t = 4$.", marks: 3, ms: ["M1: $\\mathbf v = 2ct\\,\\mathbf i + \\tfrac32 t^{1/2}\\mathbf j$", "A1: $4\\mathbf i + 3\\mathbf j$", "A1: 5 m/s"] },
        { q: "Find the acceleration of $P$ when $t = 4$.", marks: 3, ms: ["M1: $\\mathbf a = 2c\\,\\mathbf i + \\tfrac34 t^{-1/2}\\mathbf j$", "A1: $\\mathbf i + \\tfrac38\\mathbf j$", "A1: magnitude $1.07$ m/s²"] }
      ] },
    { level: "AS", src: "Edexcel AS 2018 P2 Q8", ctx: "A particle moves along the $x$-axis so that at time $t$ seconds its displacement from $O$ is $x = t^2(t - 1)^2$ metres.",
      parts: [
        { q: "Explain why $x$ is never negative.", marks: 1, ms: ["B1: it is a product of two squares"] },
        { q: "Find the times at which the particle is instantaneously at rest.", marks: 4, ms: ["M1: expands $x = t^4 - 2t^3 + t^2$ and differentiates", "A1: $v = 4t^3 - 6t^2 + 2t$", "M1: $2t(2t - 1)(t - 1) = 0$", "A1: $t = 0, \\tfrac12, 1$"] },
        { q: "Find the total distance travelled in the first second.", marks: 3, ms: ["M1: $x(\\tfrac12) = \\tfrac{1}{16}$, $x(1) = 0$", "M1: $\\tfrac1{16} + \\tfrac1{16}$", "A1: $0.125$ m"] }
      ] }
  ]
});

X("maths:S7.5", {
  notes: [
    { page: "Past-paper patterns" },
    "Resolve the initial velocity: $u_x = U\\cos\\alpha$, $u_y = U\\sin\\alpha$. Horizontal: $x = U\\cos\\alpha\\, t$ (no acceleration). Vertical: $y = U\\sin\\alpha\\, t - \\tfrac12 gt^2$. **Time of flight** from $y =$ landing level (a cliff of height $H$: $y = -H$); **range** $= u_x \\times$ time; **maximum height** from $v_y = 0$: $\\dfrac{U^2\\sin^2\\alpha}{2g}$; **speed at a point** from $v_x$ and $v_y$; **trajectory** $y = x\\tan\\alpha - \\dfrac{gx^2}{2U^2}(1 + \\tan^2\\alpha)$ — the \"show that $\\tan^2\\alpha - 4\\tan\\alpha + 3 = 0$\" questions (2023 Q5, 2024 Q5) substitute a point into this. **Show $U = 28$** (Oct 2020 Q5): a 45° cliff shot with range 100 m and drop 25 m.",
    { callout: { t: "formula", h: "Trajectory derivation (learn it)", body: "$t = \\dfrac{x}{U\\cos\\alpha}$ into $y = U\\sin\\alpha\\,t - \\tfrac12 gt^2$ gives $y = x\\tan\\alpha - \\dfrac{gx^2}{2U^2\\cos^2\\alpha}$, then $\\sec^2\\alpha = 1 + \\tan^2\\alpha$." } }
  ],
  flashcards: [
    ["Horizontal and vertical components of $U$ at angle $\\alpha$?", "$U\\cos\\alpha$ (constant) and $U\\sin\\alpha$ (decreasing by $g$ each second)."],
    ["Trajectory equation?", "$y = x\\tan\\alpha - \\dfrac{gx^2}{2U^2}(1 + \\tan^2\\alpha)$."],
    ["$U = 28$, passes through $(40, 20)$: show the tan equation.", "$20 = 40\\tan\\alpha - \\tfrac{9.8 \\cdot 1600}{2 \\cdot 784}(1 + \\tan^2\\alpha) = 40\\tan\\alpha - 10(1 + \\tan^2\\alpha)$, so $\\tan^2\\alpha - 4\\tan\\alpha + 3 = 0$."],
    ["Solutions?", "$\\tan\\alpha = 1$ or $3$: $\\alpha = 45°$ or $71.6°$."],
    ["Ball from a 25 m cliff at 45° lands 100 m from the base: show $U = 28$.", "$-25 = 100 - \\tfrac{9.8 \\cdot 10^4}{2U^2} \\cdot 2 \\Rightarrow U^2 = 784$."],
    ["Greatest height above the sea then?", "$25 + \\dfrac{(28\\sin 45°)^2}{2g} = 25 + 20 = 45$ m."],
    ["Stone at 14 m/s, $\\tan\\alpha = \\tfrac34$, from a cliff of height $H$, lands after 4 s. $H$?", "$u_y = 8.4$: $y = 33.6 - 78.4 = -44.8$, so $H = 44.8$ m."],
    ["Maximum height of that stone above the sea?", "$44.8 + \\dfrac{8.4^2}{19.6} = 48.4$ m."],
    ["Tennis serve: 45 m/s at 5° below horizontal from 2.8 m; net 12 m away, 0.9 m high. Clears?", "$t = 0.268$ s; drop $= 45\\sin5°\\,t + 4.9t^2 = 1.40$ m; height 1.40 m $>$ 0.9 — clears by 0.50 m."],
    ["Speed at the net?", "$v_x = 44.8$, $v_y = 3.92 + 9.8(0.268) = 6.55$: $45.3$ m/s."]
  ],
  quiz: [
    { q: "Horizontal acceleration of a projectile (no air resistance):", opts: ["$g$", "0", "$-g$", "$g\\cos\\alpha$"], ans: 1, why: "Only gravity, vertical." },
    { q: "Time of flight on level ground:", opts: ["$\\dfrac{U\\sin\\alpha}{g}$", "$\\dfrac{2U\\sin\\alpha}{g}$", "$\\dfrac{2U\\cos\\alpha}{g}$", "$\\dfrac{U}{g}$"], ans: 1, why: "Up and down." },
    { q: "Maximum height:", opts: ["$\\dfrac{U^2\\sin^2\\alpha}{2g}$", "$\\dfrac{U^2\\sin 2\\alpha}{g}$", "$\\dfrac{U\\sin\\alpha}{g}$", "$\\dfrac{U^2}{2g}$"], ans: 0, why: "$v_y = 0$." },
    { q: "At the highest point the velocity is:", opts: ["zero", "horizontal, $U\\cos\\alpha$", "vertical", "$U$"], ans: 1, why: "Only $v_y = 0$." },
    { q: "Landing at the launch level, the speed is:", opts: ["$U$", "$U\\cos\\alpha$", "0", "$2U$"], ans: 0, why: "Symmetry." },
    { q: "Projected *below* the horizontal at angle $\\beta$: $u_y =$", opts: ["$U\\sin\\beta$ upward", "$-U\\sin\\beta$", "0", "$U\\cos\\beta$"], ans: 1, why: "Downward component." },
    { q: "Range on level ground is greatest at:", opts: ["30°", "45°", "60°", "90°"], ans: 1, why: "$\\sin 2\\alpha$ max." }
  ],
  exam: [
    { src: "Edexcel 2023 P3 Q5", ctx: "A ball is projected from a point $O$ on horizontal ground with speed 28 m/s at an angle $\\alpha$ above the horizontal. It passes through the point $A$ which is 40 m horizontally from $O$ and 20 m above the ground.",
      parts: [
        { q: "Show that $\\tan^2\\alpha - 4\\tan\\alpha + 3 = 0$.", marks: 5, ms: ["M1: $t = \\dfrac{40}{28\\cos\\alpha}$", "M1: $20 = 28\\sin\\alpha\\,t - 4.9t^2$", "A1: $20 = 40\\tan\\alpha - \\dfrac{4.9 \\times 1600}{784\\cos^2\\alpha}$", "M1: $\\sec^2\\alpha = 1 + \\tan^2\\alpha$", "A1: $20 = 40\\tan\\alpha - 10 - 10\\tan^2\\alpha$, hence result (cso)"] },
        { q: "Find the two possible values of $\\alpha$.", marks: 2, ms: ["M1: $(\\tan\\alpha - 1)(\\tan\\alpha - 3) = 0$", "A1: $45°$ and $71.6°$"] },
        { q: "For the smaller angle, find the time taken to reach $A$.", marks: 2, ms: ["M1: $t = \\dfrac{40}{28\\cos 45°}$", "A1: $2.02$ s"] }
      ] },
    { src: "Edexcel Oct 2020 P3 Q5", ctx: "A ball is projected from the top of a vertical cliff, 25 m above the sea, with speed $U$ m/s at 45° above the horizontal. It hits the sea at a point 100 m horizontally from the foot of the cliff.",
      parts: [
        { q: "Show that $U = 28$.", marks: 5, ms: ["M1: $100 = U\\cos45°\\,t$", "M1: $-25 = U\\sin45°\\,t - 4.9t^2$", "M1: substitutes $U t = 100\\sqrt2$: $-25 = 100 - 4.9t^2$", "A1: $t^2 = \\tfrac{125}{4.9}$, $t = 5.05$", "A1: $U = \\dfrac{100\\sqrt2}{5.05} = 28$ (cso)"] },
        { q: "Find the greatest height above the sea reached by the ball.", marks: 3, ms: ["M1: $v_y = 0$: $h = \\dfrac{(28\\sin45°)^2}{2 \\times 9.8}$", "A1: $h = 20$ m above the cliff top", "A1: 45 m above the sea"] },
        { q: "Find the speed of the ball as it hits the sea.", marks: 3, ms: ["M1: $v_y^2 = (28\\sin 45°)^2 + 2(9.8)(25) = 392 + 490$", "M1: $v^2 = 392 + 882$", "A1: $35.7$ m/s"] }
      ] },
    { src: "Edexcel 2025 P3 Q5", ctx: "A stone is projected from the top of a vertical cliff of height $H$ m with speed 14 m/s at an angle $\\alpha$ above the horizontal, where $\\tan\\alpha = \\tfrac34$. The stone hits the sea 4 seconds later.",
      parts: [
        { q: "Find the value of $H$.", marks: 3, ms: ["M1: $u_y = 14 \\times \\tfrac35 = 8.4$", "M1: $-H = 8.4(4) - 4.9(16)$", "A1: $H = 44.8$"] },
        { q: "Find the horizontal distance from the foot of the cliff to the point where the stone hits the sea.", marks: 2, ms: ["M1: $14 \\times \\tfrac45 \\times 4$", "A1: $44.8$ m"] },
        { q: "Find the maximum height of the stone above the sea.", marks: 3, ms: ["M1: $\\dfrac{8.4^2}{2 \\times 9.8}$", "A1: $3.6$ m above the cliff top", "A1: $48.4$ m"] }
      ] },
    { src: "Edexcel Specimen P3 Q5", ctx: "A tennis ball is served from a height of 2.8 m with speed 45 m/s at 5° below the horizontal. The net is 12 m away horizontally and 0.9 m high.",
      parts: [
        { q: "Find the time for the ball to reach the net.", marks: 2, ms: ["M1: $t = \\dfrac{12}{45\\cos5°}$", "A1: $0.268$ s"] },
        { q: "Show that the ball clears the net and find by how much.", marks: 4, ms: ["M1: drop $= 45\\sin5°\\,t + 4.9t^2$", "A1: $= 1.40$ m", "A1: height $2.8 - 1.40 = 1.40$ m $> 0.9$", "A1: clears by 0.50 m"] },
        { q: "Find the speed of the ball as it passes over the net.", marks: 3, ms: ["M1: $v_y = 45\\sin5° + 9.8(0.268) = 6.55$", "M1: $v^2 = 44.83^2 + 6.55^2$", "A1: $45.3$ m/s"] },
        { q: "State one modelling assumption and how it affects the answer to (b).", marks: 1, ms: ["B1: air resistance is ignored — with drag the ball would be lower at the net, so the clearance would be less"] }
      ] }
  ]
});

X("maths:S8.1", {
  notes: [
    { page: "Past-paper patterns" },
    "**Newton's first law**: a particle stays at rest or moves with constant velocity unless a resultant force acts. So \"constant speed\" $\\Rightarrow$ **resultant zero** $\\Rightarrow$ resolve and equate. **Equilibrium in $\\mathbf i$–$\\mathbf j$** (AS 2025 Q2): the extra force needed is *minus the resultant*. **Limiting equilibrium** on a rough surface (2024 Q1): $F = \\mu R$ exactly and the particle is on the point of moving. **Force diagrams** score marks: weight down, normal reaction perpendicular to the surface, tension along the string away from the particle, friction along the surface opposing (potential) motion.",
    { callout: { t: "def", h: "Names of forces", body: "**Weight** $mg$ (down). **Normal reaction** $R$ (perpendicular to contact). **Tension** (string/rope, pulls). **Thrust** (rod, pushes). **Friction** (along the surface). **Driving force / resistance** (vehicles)." } }
  ],
  flashcards: [
    ["Newton's first law?", "A body remains at rest or in uniform motion in a straight line unless acted on by a resultant force."],
    ["What does 'moves at constant velocity' tell you about the forces?", "They are in equilibrium — resultant zero."],
    ["$\\mathbf F_1 = 3\\mathbf i + 2\\mathbf j$, $\\mathbf F_2 = -\\mathbf i + 4\\mathbf j$. Resultant and magnitude?", "$2\\mathbf i + 6\\mathbf j$; $2\\sqrt{10} = 6.32$ N."],
    ["Force $\\mathbf F_3$ that keeps the particle in equilibrium?", "$-2\\mathbf i - 6\\mathbf j$."],
    ["Particle of 4 kg on a rough horizontal plane, horizontal force $P$, limiting equilibrium, $\\mu = 0.5$. $P$?", "$P = \\mu mg = 0.5 \\times 39.2 = 19.6$ N."],
    ["A particle hangs from two strings at 30° and 60° to the horizontal; weight 10 N. Tensions?", "Horizontal: $T_1\\cos30° = T_2\\cos60°$; vertical: $T_1\\sin30° + T_2\\sin60° = 10$ → $T_1 = 5$ N, $T_2 = 8.66$ N."],
    ["Direction of the normal reaction on a slope?", "Perpendicular to the slope, away from it."],
    ["Direction of tension in a string?", "Along the string, pulling toward the string (away from the particle)."],
    ["Thrust vs tension?", "Tension pulls (strings, rods); thrust pushes (rods only)."]
  ],
  quiz: [
    { q: "A car moving at a steady 20 m/s on a straight road has resultant force:", opts: ["forward", "backward", "zero", "$mg$"], ans: 2, why: "N1." },
    { q: "The resultant of $\\mathbf i + 2\\mathbf j$ and $3\\mathbf i - 2\\mathbf j$:", opts: ["$4\\mathbf i$", "$4\\mathbf i + 4\\mathbf j$", "$-2\\mathbf i$", "$2\\mathbf i$"], ans: 0, why: "Add." },
    { q: "Force to bring three forces into equilibrium:", opts: ["equal to the resultant", "minus the resultant", "zero", "the largest force"], ans: 1, why: "Cancel." },
    { q: "Limiting equilibrium means:", opts: ["$F = 0$", "$F = \\mu R$ and on the point of moving", "$R = 0$", "moving at constant speed"], ans: 1, why: "Friction maximal." },
    { q: "A string can only exert:", opts: ["a push", "a pull", "either", "a moment"], ans: 1, why: "Tension." },
    { q: "Normal reaction on a particle on a smooth 30° slope with weight $W$:", opts: ["$W$", "$W\\cos30°$", "$W\\sin30°$", "0"], ans: 1, why: "Perpendicular component." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2025 P2 Q2", ctx: "Two forces $\\mathbf F_1 = (3\\mathbf i + 2\\mathbf j)$ N and $\\mathbf F_2 = (-\\mathbf i + 4\\mathbf j)$ N act on a particle $P$ of mass 0.5 kg.",
      parts: [
        { q: "Find the magnitude of the resultant force.", marks: 2, ms: ["M1: $2\\mathbf i + 6\\mathbf j$", "A1: $\\sqrt{40} = 6.32$ N"] },
        { q: "Find the acceleration of $P$.", marks: 2, ms: ["M1: $\\mathbf a = (2\\mathbf i + 6\\mathbf j)/0.5$", "A1: $(4\\mathbf i + 12\\mathbf j)$ m/s²"] },
        { q: "A third force $\\mathbf F_3$ is added so that $P$ moves with constant velocity. Find $\\mathbf F_3$.", marks: 1, ms: ["B1: $(-2\\mathbf i - 6\\mathbf j)$ N"] }
      ] },
    { src: "Edexcel 2024 P3 Q1", q: "A particle of mass 4 kg rests on a rough horizontal plane. A horizontal force of magnitude $P$ N acts on the particle, which is in limiting equilibrium. The coefficient of friction is 0.5. Find $P$, and state what happens if $P$ is increased slightly.", marks: 3,
      ms: ["B1: $R = 4g = 39.2$", "A1: $P = \\mu R = 19.6$ N", "B1: the particle begins to slide (accelerates) in the direction of $P$"] },
    { src: "Edexcel 2025 P3 Q2", ctx: "A particle of weight 10 N hangs in equilibrium from two light strings $PA$ and $PB$. String $PA$ makes 30° with the horizontal and $PB$ makes 60° with the horizontal.",
      parts: [
        { q: "Draw a diagram showing the forces on $P$.", marks: 1, ms: ["B1: weight down, two tensions along the strings"] },
        { q: "Find the tensions in the two strings.", marks: 5, ms: ["M1: horizontal $T_A\\cos30° = T_B\\cos60°$", "M1: vertical $T_A\\sin30° + T_B\\sin60° = 10$", "A1: $T_B = \\sqrt3\\,T_A$", "A1: $T_A = 5$ N", "A1: $T_B = 8.66$ N"] }
      ] }
  ]
});

X("maths:S8.2", {
  notes: [
    { page: "Past-paper patterns" },
    "$\\mathbf F = m\\mathbf a$ — always write the *resultant* on the left in the direction of motion: \"driving force $-$ resistance $= ma$\". **Vector versions** (AS 2024 Q3, 2022 Q3, 2025 Q3): add the forces, divide by $m$; a magnitude condition gives $(2 + c)^2 + 6^2 = 100$-type equations with **two** solutions; \"moves in the direction $\\mathbf i + 3\\mathbf j$\" means the resultant is parallel to it — equate the ratio of components. **Lifts** (AS 2022 Q4): treat the whole system for the cable tension, then a single body for the force between them. **Braking**: the resultant is backwards, so $a$ is negative.",
    { callout: { t: "tip", h: "From force to distance", body: "Force $\\to$ acceleration $\\to$ suvat. A 3-mark tail like \"find the distance in the first 2 s from rest\" is $s = \\tfrac12|\\mathbf a|t^2$ once you have $|\\mathbf a|$." } }
  ],
  flashcards: [
    ["Newton's second law?", "Resultant force $= $ mass $\\times$ acceleration, $\\mathbf F = m\\mathbf a$, with $\\mathbf a$ in the direction of the resultant."],
    ["Car 900 kg, resistance 300 N, accelerates at 1.5 m/s². Driving force?", "$D - 300 = 900 \\times 1.5 \\Rightarrow D = 1650$ N."],
    ["$\\mathbf F_1 = 4\\mathbf i + 2\\mathbf j$, $\\mathbf F_2 = c\\mathbf i + 4\\mathbf j$ on 2 kg give $|\\mathbf a| = 5$. $c$?", "$|(4 + c)\\mathbf i + 6\\mathbf j| = 10 \\Rightarrow (4 + c)^2 = 64$, $c = 4$ or $-12$."],
    ["$\\mathbf F_1 = 3\\mathbf i + \\mathbf j$, $\\mathbf F_2 = p\\mathbf i + 5\\mathbf j$; particle from rest moves in direction $\\mathbf i + 3\\mathbf j$. $p$?", "Resultant $(3 + p)\\mathbf i + 6\\mathbf j \\parallel \\mathbf i + 3\\mathbf j \\Rightarrow 3(3 + p) = 6$, $p = -1$."],
    ["Mass 0.5 kg there: acceleration and distance in 2 s from rest?", "$\\mathbf a = 4\\mathbf i + 12\\mathbf j$, $|\\mathbf a| = 4\\sqrt{10}$; $s = \\tfrac12 \\times 4\\sqrt{10} \\times 4 = 8\\sqrt{10} = 25.3$ m."],
    ["Lift cage 300 kg carrying a 50 kg block accelerates up at 0.8 m/s². Cable tension?", "$T - 350g = 350 \\times 0.8 \\Rightarrow T = 3710$ N."],
    ["Force from the lift floor on the block?", "$R - 50g = 50 \\times 0.8 \\Rightarrow R = 530$ N."],
    ["2 kg particle, $\\mathbf u = 3\\mathbf i - \\mathbf j$, after 4 s $\\mathbf v = 11\\mathbf i + 7\\mathbf j$ under constant $\\mathbf F$. Find $\\mathbf F$.", "$\\mathbf a = 2\\mathbf i + 2\\mathbf j$, $\\mathbf F = 4\\mathbf i + 4\\mathbf j$ N."],
    ["Why can a resultant force have two possible $c$ values in a magnitude question?", "Squaring loses the sign — both roots satisfy $|\\mathbf a| = 5$; reject one only if the question restricts it."]
  ],
  quiz: [
    { q: "A 5 kg mass with resultant 20 N accelerates at:", opts: ["100 m/s²", "4 m/s²", "0.25 m/s²", "25 m/s²"], ans: 1, why: "$F/m$." },
    { q: "Driving force 2000 N, resistance 500 N, mass 1000 kg: $a =$", opts: ["2", "1.5", "2.5", "0.5"], ans: 1, why: "$(2000 - 500)/1000$." },
    { q: "Lift accelerating upwards: tension is", opts: ["less than the weight", "greater than the weight", "equal to the weight", "zero"], ans: 1, why: "Net force up." },
    { q: "'Resultant parallel to $\\mathbf i + 2\\mathbf j$' means:", opts: ["$y$-component $= 2\\times x$-component", "$x = y$", "$x = 2y$", "$|\\mathbf F| = \\sqrt5$"], ans: 0, why: "Ratio $1 : 2$." },
    { q: "Braking: the resultant is", opts: ["forward", "backward", "zero", "vertical"], ans: 1, why: "Decelerates." },
    { q: "$\\mathbf F = 6\\mathbf i - 8\\mathbf j$ on 2 kg: $|\\mathbf a| =$", opts: ["10", "5", "20", "$\\sqrt{50}$"], ans: 1, why: "$|\\mathbf F| = 10$, divide by 2." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2024 P2 Q3", ctx: "Two forces $\\mathbf F_1 = (4\\mathbf i + 2\\mathbf j)$ N and $\\mathbf F_2 = (c\\mathbf i + 4\\mathbf j)$ N act on a particle of mass 2 kg, where $c$ is a constant. The magnitude of the acceleration is 5 m/s².",
      parts: [
        { q: "Find the two possible values of $c$.", marks: 5, ms: ["M1: resultant $(4 + c)\\mathbf i + 6\\mathbf j$", "M1: $|\\mathbf F| = 2 \\times 5 = 10$", "M1: $(4 + c)^2 + 36 = 100$", "A1: $4 + c = \\pm 8$", "A1: $c = 4$ or $c = -12$"] }
      ] },
    { src: "Edexcel 2022 P3 Q3", ctx: "A particle $P$ of mass 0.5 kg is acted on by forces $\\mathbf F_1 = (3\\mathbf i + \\mathbf j)$ N and $\\mathbf F_2 = (p\\mathbf i + 5\\mathbf j)$ N only. $P$ starts from rest at $A$ and moves in the direction of $\\mathbf i + 3\\mathbf j$.",
      parts: [
        { q: "Show that $p = -1$.", marks: 3, ms: ["M1: resultant $(3 + p)\\mathbf i + 6\\mathbf j$", "M1: parallel to $\\mathbf i + 3\\mathbf j$: $\\dfrac{6}{3 + p} = 3$", "A1: $p = -1$ (cso)"] },
        { q: "Find the acceleration of $P$.", marks: 2, ms: ["M1: $(2\\mathbf i + 6\\mathbf j)/0.5$", "A1: $(4\\mathbf i + 12\\mathbf j)$ m/s²"] },
        { q: "After 2 seconds $P$ is at $B$. Find the length $AB$.", marks: 3, ms: ["M1: $|\\mathbf a| = \\sqrt{160} = 4\\sqrt{10}$", "M1: $AB = \\tfrac12 \\times 4\\sqrt{10} \\times 2^2$", "A1: $8\\sqrt{10} = 25.3$ m"] }
      ] },
    { level: "AS", src: "Edexcel AS 2022 P2 Q4", ctx: "A lift cage of mass 300 kg carries a block of mass 50 kg on its floor. The cage is raised by a vertical cable and accelerates upwards at 0.8 m/s².",
      parts: [
        { q: "Find the tension in the cable.", marks: 3, ms: ["M1: whole system: $T - 350g = 350 \\times 0.8$", "A1: $T = 3430 + 280$", "A1: $3710$ N"] },
        { q: "Find the magnitude of the force exerted by the floor of the cage on the block.", marks: 3, ms: ["M1: block alone: $R - 50g = 50 \\times 0.8$", "A1: $R = 490 + 40$", "A1: $530$ N"] }
      ] },
    { src: "Edexcel 2025 P3 Q3", ctx: "A particle of mass 2 kg moves on a smooth horizontal plane under a constant force $\\mathbf F$. Its velocity changes from $(3\\mathbf i - \\mathbf j)$ m/s to $(11\\mathbf i + 7\\mathbf j)$ m/s in 4 seconds.",
      parts: [
        { q: "Find $\\mathbf F$.", marks: 3, ms: ["M1: $\\mathbf a = \\dfrac{(11\\mathbf i + 7\\mathbf j) - (3\\mathbf i - \\mathbf j)}{4}$", "A1: $\\mathbf a = 2\\mathbf i + 2\\mathbf j$", "A1: $\\mathbf F = (4\\mathbf i + 4\\mathbf j)$ N"] },
        { q: "Find the magnitude of $\\mathbf F$ and the bearing on which it acts.", marks: 2, ms: ["B1: $4\\sqrt2 = 5.66$ N", "B1: bearing $045°$"] },
        { q: "Find the velocity of the particle after 2 seconds.", marks: 2, ms: ["M1: $\\mathbf v = (3\\mathbf i - \\mathbf j) + 2(2\\mathbf i + 2\\mathbf j)$", "A1: $(7\\mathbf i + 3\\mathbf j)$ m/s"] }
      ] }
  ]
});

X("maths:S8.3", {
  notes: [
    { page: "Past-paper patterns" },
    "Weight $= mg$ acts *down* at the centre of mass; on Earth $g = 9.8$ m/s². Objects moving freely under gravity have $a = g$ downward — the same for every mass (2019 Q1 parachutist, Specimen Q1 rebound). In a **lift** the apparent weight changes: $R - mg = ma$ (up) — a person feels *heavier* accelerating up and *lighter* accelerating down; $R = 0$ would mean free fall. Questions also ask for the reaction force on a person *in a lift that is decelerating*: decelerating while going up is an acceleration *downwards*.",
    { callout: { t: "miscon", h: "Mass vs weight", body: "Mass (kg) is the amount of matter and is constant; weight (N) is the gravitational force $mg$ and changes with $g$. 'A 5 kg weight' is a mass; its weight is 49 N." } }
  ],
  flashcards: [
    ["Weight of a 50 kg block?", "$50 \\times 9.8 = 490$ N."],
    ["Acceleration of a falling 2 kg ball vs a 10 kg ball (no air resistance)?", "Both $9.8$ m/s² downward."],
    ["60 kg person in a lift accelerating down at 1.2 m/s². Reaction from the floor?", "$60g - R = 60 \\times 1.2 \\Rightarrow R = 588 - 72 = 516$ N."],
    ["Same person, lift accelerating up at 1.2 m/s²?", "$R = 60(9.8 + 1.2) = 660$ N."],
    ["Lift moving up but slowing at 2 m/s²: direction of acceleration?", "Downward, so $R = m(g - 2)$."],
    ["Ball projected up at 14.7 m/s from 19.6 m: impact speed?", "$24.5$ m/s."],
    ["Rebounds at half that speed: height reached?", "$\\dfrac{12.25^2}{19.6} = 7.66$ m."],
    ["What is $g$ physically?", "The acceleration of free fall / the gravitational field strength (N per kg)."],
    ["Why does a heavier object not fall faster?", "Weight $mg$ is larger but so is the mass to accelerate: $a = mg/m = g$."]
  ],
  quiz: [
    { q: "Weight of 3 kg on Earth:", opts: ["3 N", "29.4 N", "9.8 N", "30 N"], ans: 1, why: "$3 \\times 9.8$." },
    { q: "Person in a lift accelerating upwards feels:", opts: ["lighter", "heavier", "the same", "weightless"], ans: 1, why: "$R > mg$." },
    { q: "In free fall, $R =$", opts: ["$mg$", "0", "$2mg$", "$ma$"], ans: 1, why: "No support." },
    { q: "A lift going down and slowing has acceleration:", opts: ["down", "up", "zero", "horizontal"], ans: 1, why: "Opposes velocity." },
    { q: "Units of $g$:", opts: ["N", "m/s", "m/s² or N/kg", "kg"], ans: 2, why: "Acceleration / field strength." },
    { q: "Dropped from rest, distance after 2 s:", opts: ["19.6 m", "9.8 m", "39.2 m", "4.9 m"], ans: 0, why: "$4.9 \\times 4$." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2018 P2 Q6", ctx: "A tennis ball of mass 0.06 kg is thrown vertically upwards with speed 12 m/s from a point 1.5 m above the ground and moves freely under gravity.",
      parts: [
        { q: "Find the weight of the ball.", marks: 1, ms: ["B1: $0.588$ N"] },
        { q: "Find the maximum height above the ground reached by the ball.", marks: 3, ms: ["M1: $0 = 144 - 19.6h$", "A1: $h = 7.35$ m", "A1: $8.85$ m above the ground"] },
        { q: "Find the speed of the ball when it hits the ground.", marks: 2, ms: ["M1: $v^2 = 144 + 2(9.8)(1.5)$", "A1: $13.2$ m/s"] }
      ] },
    { src: "Edexcel 2022 P3 Q1", ctx: "A person of mass 60 kg stands on the floor of a lift. The lift moves vertically, starting from rest, accelerating at 1.2 m/s² for 3 s, then moving at constant speed, then decelerating at 2 m/s² to rest.",
      parts: [
        { q: "Find the force exerted by the floor on the person while the lift accelerates upwards.", marks: 3, ms: ["M1: $R - 60g = 60 \\times 1.2$", "A1: $R = 588 + 72$", "A1: $660$ N"] },
        { q: "Find the force exerted by the floor on the person while the lift decelerates.", marks: 3, ms: ["M1: acceleration $2$ m/s² downwards: $60g - R = 60 \\times 2$", "A1: $R = 588 - 120$", "A1: $468$ N"] },
        { q: "The lift's maximum speed is 3.6 m/s. Explain why the person's weight is unchanged during the constant-speed phase, and state the floor force.", marks: 2, ms: ["B1: weight is always $mg = 588$ N; only the reaction changes", "B1: at constant speed the resultant is zero so $R = 588$ N"] }
      ] }
  ]
});

X("maths:S8.4", {
  notes: [
    { page: "Past-paper patterns" },
    "**Newton's third law**: the forces between two bodies are equal and opposite — the tension pulling the hanging ball is the same tension pulling the ball on the table; the force of the lift floor on the block equals the force of the block on the floor. **Connected particles** (every AS paper): write $F = ma$ for **each particle separately** in its own direction of motion, then add to eliminate $T$. Pulleys: $T$ is the same on both sides (smooth), accelerations equal (inextensible). **Force on the pulley** $= 2T$ (both string segments vertical). **After the string goes slack** (Nov 2021 Q3 \"Q hits the ground\"), the other particle moves freely under gravity with the speed it had — a suvat tail. **Tow-bar** (AS 2024 Q4): a light rod can be in **thrust** when braking.",
    { callout: { t: "warn", h: "Two equations, not one", body: "The system equation $(m_1 - m_2)g = (m_1 + m_2)a$ gives $a$ but never scores the tension marks. Write both particle equations explicitly." } }
  ],
  flashcards: [
    ["Newton's third law?", "If $A$ exerts a force on $B$, then $B$ exerts an equal and opposite force on $A$."],
    ["3 kg on a smooth table, string over a smooth pulley to a hanging 2 kg. Acceleration and tension?", "$2g - T = 2a$, $T = 3a$: $a = 3.92$ m/s², $T = 11.8$ N."],
    ["3 kg and 5 kg hang over a smooth pulley. $a$, $T$?", "$5g - T = 5a$, $T - 3g = 3a$: $a = 2.45$, $T = 36.75$ N."],
    ["Force on that pulley?", "$2T = 73.5$ N downward."],
    ["2 kg and 3 kg over a pulley, 3 kg 1 m above the floor, released. Speed when it lands?", "$a = 1.96$; $v^2 = 2(1.96)(1) \\Rightarrow v = 1.98$ m/s."],
    ["How much further does the 2 kg then rise?", "String slack, free motion: $\\dfrac{1.98^2}{19.6} = 0.2$ m."],
    ["Car 1200 kg tows trailer 400 kg, resistances 500 N and 200 N, driving force 2100 N. $a$ and tension?", "$a = (2100 - 700)/1600 = 0.875$; trailer: $T - 200 = 400(0.875)$, $T = 550$ N."],
    ["Same car brakes with 1500 N (no driving force). Force in the tow-bar?", "$a = -2200/1600 = -1.375$; trailer: $-200 - X = 400(-1.375) \\Rightarrow X = 350$ N thrust."],
    ["Why is the tension the same throughout a light string?", "A light string has no mass, so any difference in tension would give it infinite acceleration."],
    ["Why do connected particles have the same acceleration?", "The string is inextensible."]
  ],
  quiz: [
    { q: "Two 4 kg masses hang over a smooth pulley. Acceleration:", opts: ["9.8", "4.9", "0", "2"], ans: 2, why: "Balanced." },
    { q: "Tension then:", opts: ["0", "39.2 N", "78.4 N", "19.6 N"], ans: 1, why: "$T = 4g$." },
    { q: "Force on a pulley with two vertical strands of tension $T$:", opts: ["$T$", "$2T$", "$T/2$", "0"], ans: 1, why: "Both strands." },
    { q: "When the hanging mass hits the floor, the other mass:", opts: ["stops", "continues under gravity with the string slack", "accelerates faster", "reverses"], ans: 1, why: "Free motion." },
    { q: "A tow-bar in thrust:", opts: ["pulls the trailer", "pushes the trailer (braking)", "does nothing", "is a string"], ans: 1, why: "Compression." },
    { q: "N3 pair for a book on a table:", opts: ["weight and normal reaction", "book pushes table down, table pushes book up", "weight and gravity", "friction and reaction"], ans: 1, why: "Same interaction, different bodies." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2019 P2 Q2", ctx: "A ball $A$ of mass 3 kg lies on a smooth horizontal table. It is connected by a light inextensible string passing over a smooth pulley at the edge of the table to a ball $B$ of mass 2 kg hanging freely. The system is released from rest.",
      parts: [
        { q: "Write down an equation of motion for each ball.", marks: 2, ms: ["B1: $A$: $T = 3a$", "B1: $B$: $2g - T = 2a$"] },
        { q: "Find the acceleration of the system and the tension in the string.", marks: 3, ms: ["M1: adds: $2g = 5a$", "A1: $a = 3.92$ m/s²", "A1: $T = 11.8$ N"] },
        { q: "Find the magnitude of the force exerted by the string on the pulley.", marks: 2, ms: ["M1: resultant of two perpendicular tensions $\\sqrt{T^2 + T^2}$", "A1: $16.6$ N"] },
        { q: "State how the answers would change if the table were rough.", marks: 1, ms: ["B1: friction on $A$ would reduce the acceleration and the tension would be larger (closer to $2g$)"] }
      ] },
    { level: "AS", src: "Edexcel AS Nov 2021 P2 Q3", ctx: "Two particles $P$ (2 kg) and $Q$ (3 kg) are connected by a light inextensible string over a smooth fixed pulley. $Q$ is 1 m above the floor and the system is released from rest with the string taut.",
      parts: [
        { q: "Find the acceleration and the tension.", marks: 4, ms: ["M1: $3g - T = 3a$ and $T - 2g = 2a$", "A1: $a = \\tfrac g5 = 1.96$ m/s²", "M1: $T = 2(9.8 + 1.96)$", "A1: $23.5$ N"] },
        { q: "Find the speed of $Q$ when it hits the floor.", marks: 2, ms: ["M1: $v^2 = 2 \\times 1.96 \\times 1$", "A1: $1.98$ m/s"] },
        { q: "Given that $P$ does not reach the pulley, find the greatest height of $P$ above its starting point.", marks: 3, ms: ["M1: after $Q$ lands the string is slack; $P$ rises a further $\\dfrac{v^2}{2g}$", "A1: $0.2$ m", "A1: total $1.2$ m"] },
        { q: "State how you have used the fact that the pulley is smooth.", marks: 1, ms: ["B1: the tension is the same on both sides of the pulley"] }
      ] },
    { level: "AS", src: "Edexcel AS 2024 P2 Q4", ctx: "A car of mass 1200 kg tows a trailer of mass 400 kg along a straight horizontal road by a light rigid tow-bar. Resistances to motion are 500 N on the car and 200 N on the trailer. The engine produces a driving force of 2100 N.",
      parts: [
        { q: "Find the acceleration of the car.", marks: 3, ms: ["M1: whole system $2100 - 700 = 1600a$", "A1: $1400 = 1600a$", "A1: $0.875$ m/s²"] },
        { q: "Find the tension in the tow-bar.", marks: 2, ms: ["M1: trailer: $T - 200 = 400 \\times 0.875$", "A1: $550$ N"] },
        { q: "Later the driver brakes; the driving force is removed and the brakes provide a force of 1500 N on the car only. Find the magnitude of the force in the tow-bar and state whether it is a tension or a thrust.", marks: 4, ms: ["M1: system: $-(1500 + 700) = 1600a \\Rightarrow a = -1.375$", "M1: trailer: $-200 - X = 400(-1.375)$", "A1: $X = 350$ N", "A1: thrust (the rod pushes the trailer back)"] }
      ] }
  ]
});

X("maths:S8.5", {
  notes: [
    { page: "Past-paper patterns" },
    "**Resolve** along and perpendicular to the motion (or the slope). On a smooth slope of angle $\\theta$: $R = mg\\cos\\theta$, and along the slope $mg\\sin\\theta = ma$ (down). With a pulling force $P$ at angle $\\beta$ above the horizontal on a horizontal plane: $R = mg - P\\sin\\beta$ (the pull *reduces* $R$), $P\\cos\\beta - F = ma$. A rope on a slope at angle $\\beta$ *to the slope* (Specimen Q3): $R = mg\\cos\\theta - T\\sin\\beta$, $T\\cos\\beta - mg\\sin\\theta - F = ma$. **Two-particle slopes** (Oct 2021 Q2): one particle on a rough incline, one hanging — equations for each, add.",
    { callout: { t: "tip", h: "Component checklist", body: "Weight on a slope: $mg\\sin\\theta$ *down the slope*, $mg\\cos\\theta$ *into the slope*. If $\\theta$ is the slope angle, the sine goes with the slope-parallel component — sketch the triangle each time rather than memorising." } }
  ],
  flashcards: [
    ["Components of weight on a slope of angle $\\theta$?", "$mg\\sin\\theta$ down the slope, $mg\\cos\\theta$ perpendicular into the slope."],
    ["Acceleration of a particle sliding down a smooth 30° slope?", "$g\\sin30° = 4.9$ m/s²."],
    ["Force of 20 N at 30° above horizontal pulls a 5 kg block on a smooth floor. $a$ and $R$?", "$a = 20\\cos30°/5 = 3.46$ m/s²; $R = 49 - 10 = 39$ N."],
    ["Why does an upward-angled pull reduce the normal reaction?", "Its vertical component supports part of the weight."],
    ["Resultant of 3 N east and 4 N north?", "5 N on bearing $036.9°$."],
    ["Rope at 30° to a 20° rough slope, $T = 80$ N, 10 kg box: $R$?", "$R = 98\\cos20° - 80\\sin30° = 52.1$ N."],
    ["With $\\mu = 0.3$, acceleration up the slope?", "$80\\cos30° - 98\\sin20° - 0.3(52.1) = 10a \\Rightarrow a = 2.01$ m/s²."],
    ["Particle 0.5 kg on a smooth slope held by a horizontal force $H$ at angle 30°: $H$?", "$H\\cos30° = 0.5g\\sin30° \\Rightarrow H = 2.83$ N."],
    ["What is meant by 'resolving'?", "Splitting a force into perpendicular components so each direction can be treated separately."]
  ],
  quiz: [
    { q: "Component of 10 N at 60° to the horizontal, horizontally:", opts: ["5 N", "8.66 N", "10 N", "0"], ans: 0, why: "$10\\cos60°$." },
    { q: "Normal reaction on a 4 kg particle on a smooth 30° slope:", opts: ["39.2 N", "33.9 N", "19.6 N", "0"], ans: 1, why: "$4g\\cos30°$." },
    { q: "On a smooth slope, acceleration is independent of:", opts: ["angle", "mass", "$g$", "direction"], ans: 1, why: "$a = g\\sin\\theta$." },
    { q: "Pulling at an angle above horizontal makes $R$:", opts: ["larger", "smaller", "the same", "zero"], ans: 1, why: "Vertical lift." },
    { q: "Pushing at an angle below horizontal makes $R$:", opts: ["larger", "smaller", "the same", "negative"], ans: 0, why: "Presses down." },
    { q: "Resultant of 6 N and 8 N at right angles:", opts: ["14 N", "10 N", "2 N", "48 N"], ans: 1, why: "Pythagoras." }
  ],
  exam: [
    { src: "Edexcel Specimen P3 Q3", ctx: "A box of mass 10 kg is pulled up a rough plane inclined at 20° to the horizontal by a rope inclined at 30° to the plane. The tension in the rope is 80 N and the coefficient of friction is 0.3.",
      parts: [
        { q: "Find the normal reaction between the box and the plane.", marks: 3, ms: ["M1: perpendicular to plane: $R + 80\\sin30° = 10g\\cos20°$", "A1: $R = 92.09 - 40$", "A1: $52.1$ N"] },
        { q: "Find the acceleration of the box up the plane.", marks: 4, ms: ["M1: $F = 0.3R = 15.6$", "M1: $80\\cos30° - 10g\\sin20° - 15.6 = 10a$", "A1: $69.28 - 33.52 - 15.63 = 10a$", "A1: $a = 2.01$ m/s²"] },
        { q: "The rope breaks. Find the deceleration of the box while it continues to move up the plane.", marks: 3, ms: ["M1: now $R = 10g\\cos20° = 92.1$, $F = 27.6$", "M1: $10a = -(33.5 + 27.6)$", "A1: deceleration $6.11$ m/s²"] }
      ] },
    { src: "Edexcel 2018 P3 Q7", ctx: "A crate of mass 20 kg is pulled across a rough horizontal floor by a handle inclined at 25° above the horizontal. The force in the handle is 100 N and the coefficient of friction is 0.3.",
      parts: [
        { q: "Find the normal reaction.", marks: 2, ms: ["M1: $R + 100\\sin25° = 20g$", "A1: $R = 154$ N (awrt 154)"] },
        { q: "Find the acceleration of the crate.", marks: 4, ms: ["M1: $F = 0.3 \\times 153.7 = 46.1$", "M1: $100\\cos25° - 46.1 = 20a$", "A1: $90.6 - 46.1 = 20a$", "A1: $2.23$ m/s²"] }
      ] },
    { src: "Edexcel Oct 2021 P3 Q2", ctx: "Two stones $A$ (2 kg) and $B$ (3 kg) are connected by a light inextensible string over a smooth pulley at the top of a smooth plane inclined at 30°. $A$ rests on the plane and $B$ hangs vertically. The system is released from rest.",
      parts: [
        { q: "Find the acceleration of the system.", marks: 4, ms: ["M1: $A$: $T - 2g\\sin30° = 2a$", "M1: $B$: $3g - T = 3a$", "A1: $3g - g = 5a$", "A1: $a = 3.92$ m/s²"] },
        { q: "Find the tension in the string.", marks: 2, ms: ["M1: $T = 3(9.8 - 3.92)$", "A1: $17.6$ N"] },
        { q: "State how the answer to (a) would change if the plane were rough.", marks: 1, ms: ["B1: friction would act down the plane on $A$, reducing the acceleration"] }
      ] }
  ]
});

X("maths:S8.6", {
  notes: [
    { page: "Past-paper patterns" },
    "$F \\le \\mu R$, with $F = \\mu R$ only in **limiting equilibrium or when moving**. Three question shapes: (1) *moving* — use $F = \\mu R$ and $F = ma$ (2023 Q2, 2024 Q3: \"show $a = \\dfrac{g(5 - 12\\mu)}{13}$\"); (2) *on the point of sliding* — $F = \\mu R$ with equilibrium: on a slope $\\mu = \\tan\\theta$ (Oct 2020 Q1); (3) *at rest, not limiting* — find $F$ from equilibrium first, then **check** $F \\le \\mu R$ and state the **direction** of friction (2022 Q2). Friction opposes the direction the particle *would* move; if the sign comes out negative, it acts the other way — say which. **Constant speed** (2025 Q2) still means $F = \\mu R$ and resultant zero.",
    { callout: { t: "warn", h: "Never assume $R = mg$", body: "Any force with a vertical (or slope-perpendicular) component changes $R$ — resolve perpendicular first, *then* find $\\mu R$." } }
  ],
  flashcards: [
    ["Friction law?", "$F \\le \\mu R$; equality when the object is moving or on the point of moving."],
    ["4 kg pulled by a horizontal 30 N on a rough plane accelerates at 2.5 m/s². $\\mu$?", "$30 - F = 10 \\Rightarrow F = 20$; $R = 39.2$; $\\mu = 0.51$."],
    ["Particle released on a rough slope, $\\tan\\alpha = \\tfrac5{12}$: show $a = \\dfrac{g(5 - 12\\mu)}{13}$.", "$mg\\sin\\alpha - \\mu mg\\cos\\alpha = ma$ with $\\sin\\alpha = \\tfrac5{13}$, $\\cos\\alpha = \\tfrac{12}{13}$."],
    ["If $a = 1.4$ there, $\\mu$?", "$5 - 12\\mu = \\tfrac{1.4 \\times 13}{9.8} = 1.857 \\Rightarrow \\mu = 0.262$."],
    ["Brick on the point of sliding down a 20° slope: $\\mu$?", "$\\mu = \\tan20° = 0.364$."],
    ["5 kg block on a rough 30° slope held by a horizontal 20 N force; friction?", "Down-slope weight $24.5$, up-slope from the force $17.3$: friction $7.18$ N *up* the slope."],
    ["Is that equilibrium possible with $\\mu = 0.4$?", "$R = 49\\cos30° + 20\\sin30° = 52.4$; $\\mu R = 21 > 7.18$ — yes."],
    ["30 kg box dragged at constant speed by a rope at 20° above horizontal, $\\mu = 0.5$. $T$?", "$T\\cos20° = 0.5(294 - T\\sin20°) \\Rightarrow T = 132$ N; $R = 249$ N."],
    ["Why does friction act *up* the slope for a particle sliding down?", "Friction opposes the relative motion."],
    ["Coefficient of friction is a property of…", "The pair of surfaces in contact (dimensionless)."]
  ],
  quiz: [
    { q: "A block at rest on a rough plane with no other horizontal force: $F =$", opts: ["$\\mu R$", "0", "$mg$", "$\\mu mg$"], ans: 1, why: "Nothing to oppose." },
    { q: "On the point of sliding down a rough slope of angle $\\theta$:", opts: ["$\\mu = \\sin\\theta$", "$\\mu = \\tan\\theta$", "$\\mu = \\cos\\theta$", "$\\mu = g$"], ans: 1, why: "$mg\\sin\\theta = \\mu mg\\cos\\theta$." },
    { q: "Moving at constant speed on a rough plane, friction is:", opts: ["0", "$\\mu R$", "less than $\\mu R$", "$ma$"], ans: 1, why: "Sliding friction." },
    { q: "Friction on a body sliding up a slope acts:", opts: ["up the slope", "down the slope", "perpendicular", "horizontally"], ans: 1, why: "Opposes motion." },
    { q: "Increasing $\\mu$ on a slope with $a = g(5 - 12\\mu)/13$:", opts: ["increases $a$", "decreases $a$", "no effect", "changes $g$"], ans: 1, why: "Linear decrease." },
    { q: "If the calculated $F$ exceeds $\\mu R$, the body:", opts: ["stays in equilibrium", "cannot be in equilibrium — it moves", "has $R = 0$", "is smooth"], ans: 1, why: "Friction cannot supply it." }
  ],
  exam: [
    { src: "Edexcel 2024 P3 Q3", ctx: "A particle is released from rest on a rough plane inclined at angle $\\alpha$ to the horizontal, where $\\tan\\alpha = \\tfrac{5}{12}$. The coefficient of friction is $\\mu$, and the particle slides down the plane.",
      parts: [
        { q: "Show that the acceleration of the particle is $\\dfrac{g(5 - 12\\mu)}{13}$.", marks: 5, ms: ["B1: $R = mg\\cos\\alpha = \\tfrac{12}{13}mg$", "M1: $F = \\mu R$", "M1: $mg\\sin\\alpha - \\mu R = ma$", "A1: $\\tfrac{5}{13}mg - \\tfrac{12}{13}\\mu mg = ma$", "A1: $a = \\tfrac{g(5 - 12\\mu)}{13}$ (cso)"] },
        { q: "Given that the particle takes 2 seconds to slide 2.8 m from rest, find $\\mu$.", marks: 3, ms: ["M1: $2.8 = \\tfrac12 a(4) \\Rightarrow a = 1.4$", "M1: $5 - 12\\mu = \\tfrac{1.4 \\times 13}{9.8}$", "A1: $\\mu = 0.262$ (awrt 0.26)"] },
        { q: "State the largest value of $\\mu$ for which the particle would slide.", marks: 1, ms: ["B1: $\\mu < \\tfrac{5}{12}$"] }
      ] },
    { src: "Edexcel 2022 P3 Q2", ctx: "A block of mass 5 kg rests on a rough plane inclined at 30° to the horizontal. It is held in equilibrium by a horizontal force of magnitude 20 N. The coefficient of friction is 0.4.",
      parts: [
        { q: "Find the normal reaction.", marks: 2, ms: ["M1: $R = 5g\\cos30° + 20\\sin30°$", "A1: $52.4$ N"] },
        { q: "Find the magnitude and direction of the frictional force.", marks: 4, ms: ["M1: along the plane: $F + 20\\cos30° = 5g\\sin30°$ (taking $F$ up the plane)", "A1: $F = 24.5 - 17.32$", "A1: $7.18$ N", "A1: acting up the plane (the block would otherwise slide down)"] },
        { q: "Verify that the block is in equilibrium.", marks: 2, ms: ["M1: $\\mu R = 0.4 \\times 52.4 = 21.0$", "A1: $7.18 < 21.0$ so friction is sufficient — equilibrium"] }
      ] },
    { src: "Edexcel 2025 P3 Q2", ctx: "A box of mass 30 kg is dragged across a rough horizontal floor at constant speed by a rope inclined at 20° above the horizontal. The coefficient of friction is 0.5.",
      parts: [
        { q: "Draw a diagram showing the forces on the box.", marks: 1, ms: ["B1: weight, $R$, $T$ at 20°, friction backward"] },
        { q: "Find the tension in the rope.", marks: 5, ms: ["M1: $R = 30g - T\\sin20°$", "M1: $T\\cos20° = 0.5R$ (constant speed)", "A1: $T(\\cos20° + 0.5\\sin20°) = 147$", "A1: $T = 132$ N (awrt 132)", "A1: $R = 249$ N"] },
        { q: "The rope is now pulled with tension 150 N at the same angle. Find the acceleration of the box.", marks: 3, ms: ["M1: $R = 294 - 150\\sin20° = 242.7$; $F = 121.3$", "M1: $150\\cos20° - 121.3 = 30a$", "A1: $a = 0.654$ m/s² (awrt 0.65)"] }
      ] },
    { src: "Edexcel Oct 2020 P3 Q1", ctx: "A brick of mass 2 kg rests on a rough plane inclined at 20° to the horizontal and is on the point of sliding down the plane.",
      parts: [
        { q: "Find the normal reaction.", marks: 2, ms: ["M1: $R = 2g\\cos20°$", "A1: $18.4$ N"] },
        { q: "Find the coefficient of friction.", marks: 3, ms: ["M1: $F = 2g\\sin20°$ and $F = \\mu R$", "M1: $\\mu = \\tan20°$", "A1: $0.364$"] },
        { q: "The plane's angle is increased to 25°. Find the acceleration of the brick.", marks: 3, ms: ["M1: $2g\\sin25° - 0.364 \\times 2g\\cos25° = 2a$", "A1: $8.28 - 6.47 = 2a$", "A1: $0.91$ m/s²"] }
      ] }
  ]
});

X("maths:S9.1", {
  notes: [
    { page: "Past-paper patterns" },
    "Moment $=$ force $\\times$ **perpendicular** distance from the pivot. For a rod at angle $\\theta$ to the horizontal, a vertical force at distance $d$ along the rod has moment $Fd\\cos\\theta$; a force perpendicular to the rod has moment $Fd$. **Choose the pivot where the unknown forces act** — for a ladder, take moments about the foot to kill both ground forces. **Ladder / beam against a smooth wall** (2023 Q6, Oct 2021 Q3): wall gives a horizontal $N$ only; ground gives $R$ (up) and $F$ (toward the wall); limiting $\\Rightarrow F = \\mu R$; a \"show $\\mu \\ge \\ldots$\" answer comes from $F \\le \\mu R$. **Tilting** (non-uniform rods): about to tilt means the reaction at the *other* support is **zero**. **Non-uniform rod**: the weight acts at an unknown distance $x$ — find it from the ratio of reactions.",
    { callout: { t: "mnemonic", h: "Three equations of a rigid body", body: "Resolve horizontally, resolve vertically, take moments about one point. Any extra moment equation is a combination of these, so if you are stuck, take moments about a *different* point instead of resolving." } }
  ],
  flashcards: [
    ["Moment of a force?", "Force $\\times$ perpendicular distance from the pivot to the line of action (N m); clockwise or anticlockwise."],
    ["Condition for equilibrium of a rigid body?", "Resultant force zero *and* total moment about any point zero."],
    ["Uniform ladder 20 kg at 60° against a smooth wall, man 80 kg $\\tfrac34$ up, limiting. Wall reaction?", "Moments about the foot (length $2a$): $N \\cdot 2a\\sin60° = 20g\\,a\\cos60° + 80g \\cdot 1.5a\\cos60°$ → $N = 396$ N."],
    ["$\\mu$ then?", "$F = N = 396$, $R = 100g = 980$: $\\mu = 0.404$."],
    ["Why take moments about the foot of the ladder?", "Both unknown ground forces pass through it, so they have zero moment."],
    ["Rod $AB$, 4 m, 10 kg, hinged at $A$ at 30° to horizontal, particle 5 kg at 3 m from $A$, held by a string at $B$ perpendicular to the rod. $T$?", "$4T = 10g(2\\cos30°) + 5g(3\\cos30°) \\Rightarrow T = 74.3$ N."],
    ["Plank 6 m, 30 kg, centre of mass 2.5 m from $A$, supports at 1 m and 4 m from $A$. Boy 40 kg walks toward $B$: where does it tilt?", "Tilts about the 4 m support when $R_C = 0$: $30g(1.5) = 40g\\,x \\Rightarrow x = 1.125$ m beyond it, i.e. 5.125 m from $A$."],
    ["Same plank, boy at 3 m from $A$: reactions?", "About $C$ (1 m): $3R_D = 30g(1.5) + 40g(2) = 125g \\Rightarrow R_D = 408$ N; $R_C = 70g - 408 = 278$ N."],
    ["Non-uniform 20 kg plank, 5 m, on supports at its ends with $R_A = 2R_B$. Distance of the centre of mass from $A$?", "$R_B = \\tfrac{20g}{3}$; about $A$: $20g\\,x = 5R_B \\Rightarrow x = \\tfrac53$ m."],
    ["Rod on rough ground resting on a smooth peg — direction of the peg's force?", "Perpendicular to the rod."]
  ],
  quiz: [
    { q: "Moment of 10 N at 2 m perpendicular distance:", opts: ["5 N m", "20 N m", "12 N m", "0"], ans: 1, why: "$Fd$." },
    { q: "Moment of a vertical force $W$ at distance $d$ along a rod inclined at $\\theta$:", opts: ["$Wd$", "$Wd\\cos\\theta$", "$Wd\\sin\\theta$", "$Wd\\tan\\theta$"], ans: 1, why: "Horizontal distance." },
    { q: "'About to tilt about support $D$' means:", opts: ["$R_D = 0$", "the other reaction is 0", "both are 0", "$R_D = W$"], ans: 1, why: "Loses contact elsewhere." },
    { q: "Smooth wall exerts on a ladder:", opts: ["a vertical force", "a horizontal force only", "friction", "nothing"], ans: 1, why: "Normal only." },
    { q: "Best pivot for a ladder problem:", opts: ["the top", "the foot", "the middle", "the wall base"], ans: 1, why: "Eliminates $R$ and $F$." },
    { q: "Uniform rod's weight acts at:", opts: ["one end", "the midpoint", "the support", "the pivot"], ans: 1, why: "Centre of mass." },
    { q: "Number of independent equations for a rigid body in 2D equilibrium:", opts: ["1", "2", "3", "4"], ans: 2, why: "Two resolves + one moments." }
  ],
  exam: [
    { src: "Edexcel 2023 P3 Q6", ctx: "A uniform ladder $AB$ of mass 20 kg and length $2a$ rests with $A$ on rough horizontal ground and $B$ against a smooth vertical wall, at 60° to the ground. A man of mass 80 kg stands on the ladder at the point $\\tfrac34$ of the way up from $A$, and the ladder is in limiting equilibrium.",
      parts: [
        { q: "Draw a diagram showing the forces acting on the ladder.", marks: 1, ms: ["B1: $20g$ at midpoint, $80g$ at $\\tfrac32 a$ from $A$, $N$ horizontal at $B$, $R$ up and $F$ toward the wall at $A$"] },
        { q: "Show that the reaction at the wall is 396 N to 3 significant figures.", marks: 4, ms: ["M1: moments about $A$: $N \\times 2a\\sin60° = 20g \\times a\\cos60° + 80g \\times \\tfrac32 a\\cos60°$", "A1: $N\\sqrt3 = 10g + 60g$", "M1: $N = \\dfrac{70g}{\\sqrt3}$", "A1: $396$ N (cso)"] },
        { q: "Find the coefficient of friction between the ladder and the ground.", marks: 3, ms: ["M1: horizontal: $F = N = 396$; vertical: $R = 100g = 980$", "M1: $\\mu = F/R$", "A1: $0.404$"] },
        { q: "State one way the model could be refined.", marks: 1, ms: ["B1: treat the man as a particle at a point / include friction at the wall / the ladder may not be uniform"] }
      ] },
    { src: "Edexcel 2022 P3 Q4", ctx: "A uniform rod $AB$ of mass 10 kg and length 4 m is freely hinged to a wall at $A$ and held at 30° above the horizontal by a light string attached at $B$ perpendicular to the rod. A particle of mass 5 kg is attached to the rod at $C$, where $AC = 3$ m.",
      parts: [
        { q: "Find the tension in the string.", marks: 4, ms: ["M1: moments about $A$: $T \\times 4 = 10g \\times 2\\cos30° + 5g \\times 3\\cos30°$", "A1: $4T = 35g\\cos30°$", "M1: $T = \\dfrac{35 \\times 9.8 \\times 0.866}{4}$", "A1: $74.3$ N"] },
        { q: "Find the magnitude of the force exerted by the hinge on the rod.", marks: 4, ms: ["M1: horizontal: $X = T\\sin30° = 37.1$", "M1: vertical: $Y + T\\cos30° = 15g \\Rightarrow Y = 147 - 64.3 = 82.7$", "M1: $\\sqrt{X^2 + Y^2}$", "A1: $90.6$ N"] }
      ] },
    { src: "Edexcel 2018 P3 Q9", ctx: "A plank $AB$ of length 6 m and mass 30 kg has its centre of mass 2.5 m from $A$. It rests horizontally on two supports at $C$ and $D$, where $AC = 1$ m and $AD = 4$ m. A boy of mass 40 kg stands on the plank.",
      parts: [
        { q: "With the boy at the midpoint of the plank, find the reactions at $C$ and $D$.", marks: 5, ms: ["M1: moments about $C$: $3R_D = 30g \\times 1.5 + 40g \\times 2$", "A1: $3R_D = 125g$", "A1: $R_D = 408$ N", "M1: $R_C + R_D = 70g$", "A1: $R_C = 278$ N"] },
        { q: "The boy walks slowly towards $B$. Find how far from $A$ he can go before the plank starts to tilt.", marks: 4, ms: ["M1: on the point of tilting $R_C = 0$", "M1: moments about $D$: $30g \\times 1.5 = 40g \\times x$", "A1: $x = 1.125$", "A1: $5.125$ m from $A$ (awrt 5.13)"] },
        { q: "State how you used the fact that the plank was modelled as a rod.", marks: 1, ms: ["B1: it is rigid and has no thickness so the forces act along one line and it does not bend"] }
      ] },
    { src: "Edexcel 2024 P3 Q6", ctx: "A uniform rod $AB$ of weight $W$ and length $2a$ has end $A$ on rough horizontal ground and rests on a smooth peg at $C$, where $AC = \\tfrac32 a$. The rod makes angle $\\theta$ with the ground, where $\\tan\\theta = \\tfrac34$, and is in equilibrium.",
      parts: [
        { q: "Show that the reaction at the peg is $\\tfrac{8}{15}W$.", marks: 3, ms: ["M1: moments about $A$: $S \\times \\tfrac32 a = W \\times a\\cos\\theta$", "A1: $\\tfrac32 S = \\tfrac45 W$", "A1: $S = \\tfrac{8}{15}W$ (cso)"] },
        { q: "Find the frictional force and the normal reaction at $A$ in terms of $W$.", marks: 4, ms: ["M1: horizontal: $F = S\\sin\\theta$", "A1: $F = \\tfrac{8}{15} \\times \\tfrac35 W = 0.32W$", "M1: vertical: $R + S\\cos\\theta = W$", "A1: $R = W - \\tfrac{32}{75}W = 0.573W$"] },
        { q: "Show that the coefficient of friction satisfies $\\mu \\ge 0.56$ to 2 significant figures.", marks: 2, ms: ["M1: $F \\le \\mu R \\Rightarrow \\mu \\ge \\dfrac{0.32}{0.5733}$", "A1: $\\mu \\ge 0.558 = 0.56$"] }
      ] }
  ]
});

})(KOS.content.extend);
