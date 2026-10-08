/* Kurenai OS — deep content: Statistics, section S2 (Data presentation and
   interpretation) at full A-level depth. Each topic here REPLACES the
   outline entry the base file used to carry: every question shape Edexcel
   has set on single-variable diagrams, bivariate data, measures of
   location and spread, outliers and cleaning (9MA0 Paper 3 Section A, 8MA0
   Paper 2 Section A, June 2018–2025, the Oct/Nov 2020–21 series and the
   Specimens) is explained and then worked through with Edexcel M1/A1/B1
   marks, in the notation of the Mathematical Formulae and Statistical
   Tables booklet. Past-paper item banks stay in bank-maths-stats.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---- figure helpers: every statistical diagram in this section is drawn
   from its numbers, so the picture and the working cannot disagree ---- */

/* a histogram: bars [[lo, hi, fd], …] on data axes */
function histFig(o) {
  var items = o.bars.map(function (b, i) {
    var hl = o.hl && o.hl.indexOf(i) >= 0;
    return { poly: [[b[0], 0], [b[1], 0], [b[1], b[2]], [b[0], b[2]]], fill: hl ? "accent2" : "accent", alpha: hl ? 0.42 : 0.22, c: hl ? "accent2" : "accent", w: 1.4 };
  });
  return { x: o.x, y: o.y, w: o.w || 520, h: o.h || 300, axes: { x: o.xl || "x", y: o.yl || "frequency density", xt: o.xt, yt: o.yt },
    items: items.concat(o.extra || []), cap: o.cap };
}
/* a horizontal box plot at height y (data units), box half-height h */
function box(y, h, v, outs, c, lab) {
  c = c || "accent";
  var it = [
    { line: [[v[0], y], [v[1], y]], c: c, w: 1.8 }, { line: [[v[3], y], [v[4], y]], c: c, w: 1.8 },
    { line: [[v[0], y - h * 0.6], [v[0], y + h * 0.6]], c: c, w: 1.8 }, { line: [[v[4], y - h * 0.6], [v[4], y + h * 0.6]], c: c, w: 1.8 },
    { poly: [[v[1], y - h], [v[3], y - h], [v[3], y + h], [v[1], y + h]], fill: c, alpha: 0.16, c: c, w: 1.8 },
    { line: [[v[2], y - h], [v[2], y + h]], c: c, w: 2.4 }
  ];
  (outs || []).forEach(function (x) { it.push({ text: [x, y], t: "×", size: 15, c: c, b: true }); });
  if (lab) it.push({ text: [v[0], y + h], t: lab, pos: "nw", size: 11.5, c: "text2" });
  return it;
}
/* scatter points */
function pts(xs, ys, c, r) {
  return xs.map(function (x, i) { return { pt: [x, ys[i]], r: r || 3.2, c: c || "accent" }; });
}

/* =====================================================================
   S2.1  Single-variable diagrams: histograms, frequency polygons,
         cumulative frequency, box plots
   ===================================================================== */
C["maths:S2.1"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Diagrams for one variable — the whole topic on one page" },
    "Spec 2.1 asks you to **interpret** histograms, frequency polygons, box plots (with outliers) and cumulative frequency diagrams — and to know that **area in a histogram represents frequency**.",
    "In the exam that one sentence produces a small number of very recognisable question shapes:",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Histogram with no vertical scale: use a known frequency to find the scale, then estimate a frequency or a percentage", "4", "AS June 2020 Q1"],
      ["Complete a partly drawn histogram / its table", "2–3 each", "AS Nov 2021 Q2, AS June 2024 Q3"],
      ["Width and height of a bar on a given drawing scale", "3", "A-level Specimen Q1"],
      ["Estimate a frequency or probability from part of a bar", "2", "A-level June 2023 Q6"],
      ["Model the frequency density by a curve; find $k$ by integration", "3", "AS June 2022 Q3, AS June 2024 Q3"],
      ["Draw a box plot from summary facts", "4", "AS June 2024 Q1"],
      ["Read a box plot: range, IQR, outliers, compare two", "1–3", "A-level Oct 2020 Q3, AS June 2025 Q2"],
      ["Estimate a mean from a histogram or frequency polygon", "2", "AS June 2023 Q1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**Histograms** — frequency density, area as frequency, finding a missing scale, unequal class widths, estimating from part of a bar.",
      "**From histogram to model** — the frequency density as a curve, and the area under it (the link to probability distributions).",
      "**Frequency polygons and cumulative frequency** — how each is drawn and what each is read for.",
      "**Box plots** — the five-number summary, outliers, drawing from facts and comparing two distributions.",
      "**Shape** — symmetry and skew, and what it says about the mean, median and mode.",
      "**Exam toolkit**."
    ] },
    "Every worked example is modelled on a real Edexcel question (the source is on its header) and every step carries the mark it earns.",

    /* ---------------------------------------------------------------- Page 1 */
    { page: "Histograms" },
    { h: "1.1  Why a histogram uses area" },
    "A histogram shows **continuous grouped data**. The bars touch, because the classes run on from one another with no gaps.",
    "When the classes have **different widths**, the bar heights cannot be frequencies — a wide class would look important just because it is wide. Instead:",
    { callout: { t: "formula", h: "Frequency density", body: [
      "$$\\text{frequency density} = \\frac{\\text{frequency}}{\\text{class width}} \\qquad\\Longleftrightarrow\\qquad \\text{frequency} = \\text{frequency density} \\times \\text{class width}$$",
      "So the **area of each bar is proportional to the frequency** of its class.",
      "On some drawings area is *proportional*, not equal: area $= k \\times$ frequency. Questions with no vertical scale, or a scale in centimetres, are built on that $k$."
    ] } },
    { fig: histFig({ x: [0, 42], y: [0, 5], xl: "hours", xt: [0, 5, 10, 15, 20, 25, 30, 35, 40], yt: [1, 2, 3, 4, 5],
      bars: [[0, 4, 2.5], [4, 7, 3], [7, 12, 4.2], [12, 16, 4], [16, 20, 3.5], [20, 40, 1]],
      extra: [{ text: [2, 1.2], t: "10", size: 11, c: "text" }, { text: [5.5, 1.4], t: "9", size: 11, c: "text" }, { text: [9.5, 2], t: "21", size: 11, c: "text" },
        { text: [14, 2], t: "16", size: 11, c: "text" }, { text: [18, 1.7], t: "14", size: 11, c: "text" }, { text: [30, 0.5], t: "20", size: 11, c: "text" }],
      cap: "Hospital stays for 90 patients (A-level June 2023). The number inside each bar is its **area** = frequency. The wide 20–40 bar is low but still holds 20 patients." }) },
    { h: "1.2  Class boundaries" },
    { ul: [
      "For continuous data written as $10 \\le w < 15$ the boundaries are exactly 10 and 15; the width is 5; the midpoint is 12.5.",
      "For data recorded to a precision, such as \"0.1–0.5 mm\" or \"5–9 years\", the true boundaries sit **halfway between** the printed limits: 0.05–0.55, or 4.5–9.5. Widths and midpoints come from those boundaries.",
      "Age is the exception you should know: \"aged 5–9\" means $5 \\le x < 10$, because you are 9 until the day you turn 10."
    ] },
    { h: "1.3  Finding a missing scale from one known frequency" },
    "When the vertical axis has no numbers, the question always tells you one frequency. Use it to find how many items one unit of area represents, then work in areas.",
    { callout: { t: "memorise", h: "The method", body: [
      "1. Measure each relevant bar in grid units: width × height = area (in squares).",
      "2. **Known frequency ÷ its area** = items per square.",
      "3. Every other frequency = its area × items per square.",
      "4. If the question asks for a percentage, you also need the **total** area."
    ] } },
    { worked: { tag: "exam", title: "A histogram with no vertical scale — estimate a percentage", src: "AS June 2020 · P2 Q1 · 4 marks",
      q: "A histogram shows the times taken by a random sample of students to complete a crossword, with bars over 2–10, 10–12, 12–15, 15–18, 18–22 and 22–24 minutes whose heights are 1, 8, 4, 12, 3 and 2 grid units. No vertical scale is given. The number of students who took more than 15 minutes is 78. Estimate the percentage of students who took less than 11 minutes.",
      steps: [
        { fig: histFig({ x: [0, 26], y: [0, 13], xl: "minutes", yl: "fd", xt: [0, 5, 10, 15, 20, 25], yt: [], w: 460, h: 230,
          bars: [[2, 10, 1], [10, 12, 8], [12, 15, 4], [15, 18, 12], [18, 22, 3], [22, 24, 2]], hl: [3, 4, 5],
          extra: [{ shade: { fn: "8", from: 10, to: 11 }, c: "accent3", alpha: 0.5 }, { shade: { fn: "1", from: 2, to: 10 }, c: "accent3", alpha: 0.5 }, { vline: 11, label: "11", c: "accent3" }] }),
          h: "Areas of the bars above 15 minutes", m: "$3 \\times 12 + 4 \\times 3 + 2 \\times 2 = 36 + 12 + 4 = 52$ squares hold 78 students, so 1 square $= \\dfrac{78}{52} = 1.5$ students." },
        { h: "Area below 11 minutes", m: "$8 \\times 1 + 1 \\times 8 = 16$ squares (the whole 2–10 bar and one minute of the 10–12 bar), so $16 \\times 1.5 = 24$ students.", mk: "M1 A1", n: "M1 for using areas with the scale found from the 78; A1 for 24 (or for 16 squares out of 88)." },
        { h: "Total, then the percentage", m: "All bars: $8 + 16 + 12 + 36 + 12 + 4 = 88$ squares $= 132$ students.\n$\\dfrac{24}{132} \\times 100 = 18.2\\%$", mk: "M1 A1", n: "Part of a bar is taken in proportion to its width — the linear-interpolation assumption that values are spread evenly through the class." }
      ], result: "about 18%" } },
    { worked: { tag: "exam", title: "Complete the histogram, then the median", src: "AS Nov 2021 · P2 Q2(a)(b) · 7 marks",
      q: "The ages of passengers on an airline are grouped as $0 \\le x < 5$, $5 \\le x < 20$, $20 \\le x < 40$, $40 \\le x < 65$, $65 \\le x < 80$, $80 \\le x < 90$ with frequencies 5, 45, 90, ?, ?, 1. The histogram already shows the bars for 5–20 (frequency density 3), 40–65 (5.2), 65–80 (4) and 80–90 (0.1). **(a)** Complete the histogram. **(b)** Use linear interpolation to estimate the median age.",
      steps: [
        { h: "(a) Find the scale from a known bar", m: "$5 \\le x < 20$: frequency 45, width 15, so frequency density $= \\dfrac{45}{15} = 3$ — which fixes the vertical scale.", mk: "M1" },
        { h: "The two missing bars", m: "$0 \\le x < 5$: $\\dfrac{5}{5} = 1$; $\\quad 20 \\le x < 40$: $\\dfrac{90}{20} = 4.5$", mk: "A1 A1",
          fig: histFig({ x: [0, 92], y: [0, 6], xl: "age", xt: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90], yt: [1, 2, 3, 4, 5, 6], w: 480, h: 240,
            bars: [[0, 5, 1], [5, 20, 3], [20, 40, 4.5], [40, 65, 5.2], [65, 80, 4], [80, 90, 0.1]], hl: [0, 2] }) },
        { h: "(b) Read the missing frequencies off the drawn bars", m: "$40 \\le x < 65$: $5.2 \\times 25 = 130$; $\\quad 65 \\le x < 80$: $4 \\times 15 = 60$\nTotal $= 5 + 45 + 90 + 130 + 60 + 1 = 331$", mk: "M1 A1" },
        { h: "Locate the median class", m: "$\\dfrac{331}{2} = 165.5$. Cumulative: 5, 50, 140, 270 — so the median lies in $40 \\le x < 65$, 25.5 of the way into its 130 people." },
        { h: "Interpolate", m: "$Q_2 = 40 + \\dfrac{165.5 - 140}{130} \\times 25 = 44.9$ years", mk: "M1 A1", n: "Using $\\frac{n + 1}{2}$ gives 45 and is also accepted. Show the fraction: it is the method mark." }
      ], result: "(a) bars of height 1 over 0–5 and 4.5 over 20–40 (b) 44.9 years" } },
    { worked: { tag: "exam", title: "A bar's width and height on a centimetre scale", src: "A-level Specimen · P3 Q1(a) · 3 marks",
      q: "Masses of 90 packets of coffee are grouped as $240 \\le w < 245$ (8), $245 \\le w < 248$ (15), $248 \\le w < 252$ (35), $252 \\le w < 255$ (23), $255 \\le w < 260$ (9). On a histogram, the class $245 \\le w < 248$ is a rectangle 1.2 cm wide and 10 cm high. Calculate the width and height of the rectangle for $255 \\le w < 260$.",
      steps: [
        { h: "Horizontal scale", m: "3 g is drawn as 1.2 cm, so 1 g = 0.4 cm. The class $255 \\le w < 260$ is 5 g wide: $5 \\times 0.4 = 2$ cm.", mk: "B1" },
        { h: "Area per packet", m: "$1.2 \\times 10 = 12$ cm² represents 15 packets, so 1 packet $= 0.8$ cm².", mk: "M1" },
        { h: "Height", m: "9 packets $= 9 \\times 0.8 = 7.2$ cm², so height $= \\dfrac{7.2}{2} = 3.6$ cm", mk: "A1", n: "Area — not height — is what scales with frequency. Setting up \"15 packets ↔ 10 cm high\" gives 6 cm and loses the M." }
      ], result: "width 2 cm, height 3.6 cm" } },
    { worked: { tag: "exam", title: "A probability from part of the histogram; is a Normal model suitable?", src: "A-level June 2023 · P3 Q6(a)(b) · 3 marks",
      q: "A histogram of the hours, $T$, that 90 patients stay in hospital has bars 0–4 (frequency density 2.5), 4–7 (3), 7–12 (4.2), 12–16 (4), 16–20 (3.5) and 20–40 (1). **(a)** Use the histogram to estimate $P(10 < T < 30)$. The data have mean 14.9 hours and standard deviation 9.3 hours, and Tomas suggests modelling $T$ by $N(14.9, 9.3^2)$. **(b)** With reference to the histogram, state, giving a reason, whether or not Tomas' model could be suitable.",
      steps: [
        { h: "(a) Area between 10 and 30", m: "$\\underbrace{2 \\times 4.2}_{10\\text{–}12} + \\underbrace{4 \\times 4}_{12\\text{–}16} + \\underbrace{4 \\times 3.5}_{16\\text{–}20} + \\underbrace{10 \\times 1}_{20\\text{–}30} = 8.4 + 16 + 14 + 10 = 48.4$", mk: "M1", n: "Two partial bars: 2 of the 7–12 bar's 5 hours, and 10 of the 20–40 bar's 20 hours." },
        { h: "As a probability", m: "$P(10 < T < 30) \\approx \\dfrac{48.4}{90} = 0.538$", mk: "A1", n: "Anything from 0.53 to 0.54 is accepted." },
        { h: "(b) Compare the shape with a Normal curve", m: "Not suitable: the histogram is **not symmetrical** — it has a long tail to the right (positive skew), while a Normal distribution is symmetrical.", mk: "B1", n: "Also: the Normal model gives positive probability to $T < 0$ (mean − 1.6 sd), which is impossible. \"Not bell-shaped\" is accepted." }
      ], result: "(a) 0.538 (b) not suitable — the data are skewed, the Normal is symmetrical" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "From histogram to model" },
    "Spec 2.1 says *connect to probability distributions*. The connection is the one in the picture: as classes get narrower, the tops of the bars trace out a **curve**, and the **area under the curve** between two values is the frequency (or, scaled to 1, the probability) of that interval.",
    { fig: { x: [0, 8.6], y: [0, 60], w: 500, h: 260, axes: { x: "height (cm)", y: "fd", xt: [0, 1, 2, 3, 4, 5, 6, 7, 8], yt: [10, 20, 30, 40, 50] }, items: [
      { poly: [[0, 0], [1, 0], [1, 15], [0, 15]], fill: "accent", alpha: 0.18, c: "accent", w: 1.2 },
      { poly: [[1, 0], [2, 0], [2, 35], [1, 35]], fill: "accent", alpha: 0.18, c: "accent", w: 1.2 },
      { poly: [[2, 0], [3.5, 0], [3.5, 50], [2, 50]], fill: "accent", alpha: 0.18, c: "accent", w: 1.2 },
      { poly: [[3.5, 0], [4.5, 0], [4.5, 55], [3.5, 55]], fill: "accent", alpha: 0.18, c: "accent", w: 1.2 },
      { poly: [[4.5, 0], [6.5, 0], [6.5, 26], [4.5, 26]], fill: "accent", alpha: 0.18, c: "accent", w: 1.2 },
      { poly: [[6.5, 0], [8, 0], [8, 16], [6.5, 16]], fill: "accent", alpha: 0.18, c: "accent", w: 1.2 },
      { fn: "3*x*(8-x)", from: 0, to: 8, c: "accent2", w: 2.4, label: "y = 3x(8 − x)", at: 6.3 },
      { vline: 4, label: "model median 4", c: "accent3" }
    ], cap: "Seedling heights (AS June 2022): 256 seedlings, and the model curve $y = 3x(8 - x)$ whose area is also 256. The model is symmetrical about 4, so its median is 4." } },
    { callout: { t: "memorise", h: "Fitting a frequency-density curve", body: [
      "The total area under the curve must equal the **total frequency**: $\\displaystyle\\int_a^b f(x)\\,dx = n$.",
      "Solve that for the constant $k$.",
      "A symmetrical curve has its median (and mean) on the line of symmetry.",
      "A model curve on a finite interval cannot describe values outside it — that is the usual limitation asked for."
    ] } },
    { worked: { tag: "exam", title: "Interpolate a median, then fit a frequency-density curve", src: "AS June 2022 · P2 Q3 · 8 marks",
      q: "A histogram shows the heights of 256 seedlings with frequency densities 15 (0–1 cm), 35 (1–2), 50 (2–3.5), 55 (3.5–4.5), 26 (4.5–6.5) and 16 (6.5–8). **(a)** Use linear interpolation to estimate the median height. Chris models the frequency density by $y = kx(8 - x)$, $0 \\le x \\le 8$. **(b)** Find the value of $k$. **(c)** Using this model, write down the median height.",
      steps: [
        { h: "(a) Frequencies = fd × width", m: "$15,\\ 35,\\ 50 \\times 1.5 = 75,\\ 55,\\ 26 \\times 2 = 52,\\ 16 \\times 1.5 = 24$ (total 256)\nCumulative: $15,\\ 50,\\ 125,\\ 180,\\ \\ldots$", mk: "M1 A1", n: "The 2–3.5 class is 1.5 wide: forgetting this (writing 50) is the commonest slip." },
        { h: "Interpolate at $\\frac{256}{2} = 128$", m: "$Q_2 = 3.5 + \\dfrac{128 - 125}{55} \\times 1 = 3.55$ cm", mk: "M1 A1" },
        { h: "(b) Area under the model = 256", m: "$$\\int_0^8 kx(8 - x)\\,dx = k\\left[4x^2 - \\dfrac{x^3}{3}\\right]_0^8 = k\\left(256 - \\dfrac{512}{3}\\right) = \\dfrac{256k}{3}$$", mk: "M1 M1" },
        { m: "$\\dfrac{256k}{3} = 256 \\;\\Rightarrow\\; k = 3$", mk: "A1" },
        { h: "(c) Symmetry", m: "$y = 3x(8 - x)$ is symmetrical about $x = 4$, so the model median is **4 cm**.", mk: "B1", n: "No calculation needed — a parabola with roots 0 and 8 peaks halfway between them." }
      ], result: "(a) 3.55 cm (b) $k = 3$ (c) 4 cm" } },
    { worked: { tag: "exam", title: "Complete a table and histogram; fit $y = \\frac{k}{x^2}$", src: "AS June 2024 · P2 Q3 · 7 marks",
      q: "The times, $x$ minutes, that 112 customers spent queuing are grouped 1–2 (64), 2–3 (?), 3–4 (13), 4–6 (?), 6–8 (3). The histogram shows the 1–2 bar and the 2–3 bar at frequency density 25 and the 3–4 bar at 13. No customer queued for less than 1 or more than 8 minutes. **(a)** Complete the table. **(b)** Complete the histogram. Ting models the frequency density by $y = \\dfrac{k}{x^2}$, $1 \\le x \\le 8$. **(c)** Find $k$.",
      steps: [
        { h: "(a) The 2–3 class from its bar", m: "Width 1, density 25, so frequency 25.", mk: "M1" },
        { h: "The 4–6 class from the total", m: "$112 - (64 + 25 + 13 + 3) = 7$", mk: "A1" },
        { h: "(b) The missing bars", m: "4–6: $\\dfrac{7}{2} = 3.5$; $\\quad$ 6–8: $\\dfrac{3}{2} = 1.5$", mk: "M1 A1",
          fig: histFig({ x: [0, 8.5], y: [0, 70], xl: "minutes", xt: [0, 1, 2, 3, 4, 5, 6, 7, 8], yt: [10, 20, 30, 40, 50, 60], w: 460, h: 230,
            bars: [[1, 2, 64], [2, 3, 25], [3, 4, 13], [4, 6, 3.5], [6, 8, 1.5]], hl: [3, 4],
            extra: [{ fn: "128/x^2", from: 1.3, to: 8, c: "accent2", w: 2, label: "y = 128/x²", at: 2.6 }] }) },
        { h: "(c) Area under the curve = 112", m: "$$\\int_1^8 kx^{-2}\\,dx = k\\left[-\\dfrac{1}{x}\\right]_1^8 = k\\left(1 - \\dfrac18\\right) = \\dfrac{7k}{8}$$", mk: "M1 M1" },
        { m: "$\\dfrac{7k}{8} = 112 \\;\\Rightarrow\\; k = 128$", mk: "A1" }
      ], result: "(a) 25 and 7 (b) bars of height 3.5 over 4–6 and 1.5 over 6–8 (c) $k = 128$" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Frequency polygons and cumulative frequency" },
    { h: "3.1  Frequency polygons" },
    { ul: [
      "Plot the **midpoint** of each class against its frequency (or frequency density, when widths differ) and join the points with **straight lines**.",
      "On a histogram, the polygon joins the midpoints of the tops of the bars.",
      "Its use is **comparison**: two polygons on one grid show two distributions at once, which two histograms cannot."
    ] },
    { fig: histFig({ x: [59.5, 68.5], y: [0, 14], xl: "grams", xt: [60, 61, 62, 63, 64, 65, 66, 67, 68], yt: [2, 4, 6, 8, 10, 12, 14], w: 480, h: 250,
      bars: [[60, 62, 3], [62, 64, 12], [64, 66, 8], [66, 68, 2]],
      extra: [{ poly: [[61, 3], [63, 12], [65, 8], [67, 2]], close: false, c: "accent2", w: 2.2 },
        { pt: [61, 3], c: "accent2" }, { pt: [63, 12], c: "accent2" }, { pt: [65, 8], c: "accent2" }, { pt: [67, 2], c: "accent2" }],
      cap: "Weights of 50 plums (AS June 2023): the frequency polygon joins the class midpoints at the bar heights." }) },
    { worked: { tag: "exam", title: "A mean and standard deviation from a histogram; the effect of a shift", src: "AS June 2023 · P2 Q1 · 5 marks",
      q: "A histogram with frequency polygon gives the weights of 50 plums: classes 60–62, 62–64, 64–66, 66–68 grams with frequency densities 3, 12, 8 and 2. **(a)** Show that an estimate of the mean weight is 63.72 grams. **(b)** Calculate an estimate of the standard deviation. The scales were broken: every plum actually weighs 5 grams less. **(c)** State the effect on the estimate of the standard deviation, giving a reason.",
      steps: [
        { h: "(a) Frequencies and midpoints", m: "$f = 2 \\times 3,\\ 2 \\times 12,\\ 2 \\times 8,\\ 2 \\times 2 = 6,\\ 24,\\ 16,\\ 4$ at midpoints $61, 63, 65, 67$", mk: "M1" },
        { m: "$\\bar{x} = \\dfrac{61 \\times 6 + 63 \\times 24 + 65 \\times 16 + 67 \\times 4}{50} = \\dfrac{3186}{50} = 63.72$", mk: "A1*", n: "A \"show that\": all four products must be visible. $\\frac{3186}{50}$ on its own is M0 A0." },
        { h: "(b)", m: "$\\sigma = \\sqrt{\\dfrac{61^2 \\times 6 + 63^2 \\times 24 + 65^2 \\times 16 + 67^2 \\times 4}{50} - 63.72^2} = \\sqrt{2.5216} = 1.59$ g", mk: "M1 A1", n: "$\\sum fx^2 = 203\\,138$. $s = 1.60$ is accepted." },
        { h: "(c)", m: "No effect: subtracting 5 g from every value moves the data but does not change how spread out they are.", mk: "B1", n: "Adding or subtracting a constant changes the mean, not the standard deviation; only multiplying or dividing changes the spread." }
      ], result: "(a) 63.72 g (b) 1.59 g (c) unchanged — every value moves by the same amount" } },
    { h: "3.2  Cumulative frequency diagrams" },
    { ul: [
      "Plot cumulative frequency against the **upper class boundary** — the point says \"this many values are *below* here\".",
      "Start at (lower boundary of the first class, 0). Join with a smooth curve or straight lines.",
      "Read the median at $\\frac{n}{2}$, $Q_1$ at $\\frac{n}{4}$, $Q_3$ at $\\frac{3n}{4}$ (for grouped data Edexcel does not use $n + 1$).",
      "Read \"how many are less than $x$?\" straight up from $x$; \"more than $x$\" is $n$ minus that."
    ] },
    { fig: { x: [0, 31], y: [0, 190], w: 500, h: 280, axes: { x: "rainfall r (mm)", y: "cumulative frequency", xt: [0, 5, 10, 15, 20, 25, 30], yt: [25, 50, 75, 100, 125, 150, 175] }, items: [
      { poly: [[0, 0], [0.5, 121], [1, 131], [5, 155], [10, 167], [30, 184]], close: false, c: "accent", w: 2.2 },
      { pt: [0.5, 121], c: "accent" }, { pt: [1, 131], c: "accent" }, { pt: [5, 155], c: "accent" }, { pt: [10, 167], c: "accent" }, { pt: [30, 184], c: "accent" },
      { line: [[0, 138], [2.17, 138]], dash: true, c: "accent2" }, { line: [[2.17, 138], [2.17, 0]], dash: true, c: "accent2" },
      { text: [3.2, 128], t: "Q₃ ≈ 2.17 mm at 138", pos: "e", size: 11.5, c: "accent2" }
    ], cap: "Hurn daily rainfall, May–October 2015 (AS June 2019): points at the upper boundaries; the upper quartile is read at $\\frac{3}{4} \\times 184 = 138$." } },
    { callout: { t: "tip", h: "Interpolation and the cumulative frequency graph are the same idea", body: [
      "Joining the cumulative points with straight lines and reading off is exactly **linear interpolation**.",
      "That is why a calculated interpolation and a graph reading agree — and why both assume the values are spread evenly through each class (S2.3)."
    ] } },

    /* ---------------------------------------------------------------- Page 4 */
    { page: "Box plots" },
    { h: "4.1  The five-number summary" },
    "A box plot (box-and-whisker diagram) draws five values on a scale:",
    { kv: [
      ["Box", "From the **lower quartile** $Q_1$ to the **upper quartile** $Q_3$, with a line at the **median** $Q_2$. The box holds the middle 50% of the data; its length is the IQR."],
      ["Whiskers", "From the box out to the **lowest and highest values that are not outliers**."],
      ["Outliers", "Plotted individually, with a cross (×) or asterisk (*). The rule that defines them is always given in the question — usually more than $1.5 \\times \\text{IQR}$ beyond a quartile."]
    ] },
    { fig: { x: [0, 72], y: [0, 2], w: 520, h: 150, axes: { x: "time (minutes)", y: "", xt: [0, 10, 20, 30, 40, 50, 60, 70], yt: [] },
      items: box(1, 0.35, [7, 14, 20, 25, 40], [46, 68], "accent").concat([
        { text: [7, 1.55], t: "min 7", size: 11, c: "text2" }, { text: [14, 1.55], t: "Q₁ 14", size: 11, c: "text2" }, { text: [20, 1.55], t: "Q₂ 20", size: 11, c: "text2" },
        { text: [25.5, 1.55], t: "Q₃ 25", size: 11, c: "text2" }, { text: [40, 1.55], t: "40", size: 11, c: "text2" }, { text: [57, 1.55], t: "outliers 46, 68", size: 11, c: "danger" }]),
      cap: "Puzzle times for 27 people (A-level Oct 2020). The whisker stops at 40, the largest value that is not an outlier." } },
    { worked: { tag: "exam", title: "Draw a box plot from a description", src: "AS June 2024 · P2 Q1 · 4 marks",
      q: "A coach records the heights of some adult rugby players: median 1.85 m, range 0.28 m, interquartile range 0.11 m. The shortest player is 1.72 m, and 25% of the heights are below 1.81 m. Draw a box and whisker plot to represent this information.",
      steps: [
        { h: "Translate every sentence into a value", m: "\"25% below 1.81\" means $Q_1 = 1.81$; $\\quad Q_3 = Q_1 + \\text{IQR} = 1.81 + 0.11 = 1.92$\nminimum $= 1.72$; $\\quad$ maximum $=$ minimum $+$ range $= 1.72 + 0.28 = 2.00$", n: "Read each fact twice: range and IQR are *differences*, not positions." },
        { h: "Draw the box", m: "Box from 1.81 to 1.92 with the median line at 1.85.", mk: "B1 B1ft",
          fig: { x: [1.6, 2.1], y: [0, 2], w: 480, h: 130, axes: { x: "m", y: "", xt: [1.6, 1.7, 1.8, 1.9, 2.0, 2.1], yt: [] }, items: box(1, 0.4, [1.72, 1.81, 1.85, 1.92, 2.0], [], "accent") } },
        { h: "The whiskers", m: "Lower whisker to 1.72, upper whisker to 2.00.", mk: "B1 B1ft", n: "Each whisker must be attached to the box. The marks follow through from your own $Q_1$ if that was wrong." }
      ], result: "$Q_1 = 1.81$, $Q_2 = 1.85$, $Q_3 = 1.92$, whiskers to 1.72 and 2.00" } },
    { worked: { tag: "exam", title: "Read a box plot; outliers by a standard-deviation rule", src: "A-level Oct 2020 · P3 Q3(a)–(e) · 6 marks",
      q: "The times, $x$ minutes, for 27 people to complete a puzzle are shown in a box plot: lower whisker 7, $Q_1 = 14$, median 20, $Q_3 = 25$, upper whisker 40, and outliers at 46 and 68. **(a)** Find the range. **(b)** Find the interquartile range. Also $\\sum x = 607.5$ and $\\sum x^2 = 17\\,623.25$. **(c)** Calculate the mean. **(d)** Calculate the standard deviation. Taruni defines an outlier as a value more than 3 standard deviations above the mean. **(e)** State how many outliers Taruni would say there are, giving a reason.",
      steps: [
        { h: "(a) Range uses the extreme values, outliers included", m: "$68 - 7 = 61$ minutes", mk: "B1", n: "Not $40 - 7$: the whisker end is not the maximum when there are outliers." },
        { h: "(b)", m: "$25 - 14 = 11$ minutes", mk: "B1" },
        { h: "(c)", m: "$\\bar{x} = \\dfrac{607.5}{27} = 22.5$", mk: "B1" },
        { h: "(d)", m: "$\\sigma = \\sqrt{\\dfrac{17\\,623.25}{27} - 22.5^2} = \\sqrt{146.46} = 12.1$", mk: "M1 A1" },
        { h: "(e) The new rule", m: "$\\bar{x} + 3\\sigma = 22.5 + 3 \\times 12.1 = 58.8$. Only 68 is above it, so **one** outlier.", mk: "B1ft", n: "Different rules give different outliers: the box plot's rule flagged 46 too." }
      ], result: "(a) 61 (b) 11 (c) 22.5 (d) 12.1 (e) one — only 68 exceeds 58.8" } },
    { h: "4.2  Comparing two box plots" },
    "A comparison question wants **two** comparisons, each **in context**:",
    { ol: [
      "**Location** — compare the **medians**: \"the median time for A is higher, so A's students typically took longer\".",
      "**Spread** — compare the **IQRs** (or ranges): \"B's IQR is larger, so B's times are more variable\"."
    ] },
    { fig: { x: [998, 1037], y: [0, 3], w: 520, h: 180, axes: { x: "Daily Mean Pressure (hPa)", y: "", xt: [1000, 1005, 1010, 1015, 1020, 1025, 1030, 1035], yt: [] },
      items: box(2.1, 0.32, [1009, 1018, 1022, 1025, 1034], [1007], "accent", "Light days").concat(box(0.9, 0.32, [1010, 1016, 1024, 1028, 1030], [], "accent2", "Moderate days")),
      cap: "Perth 2015 (AS June 2025). Location: Moderate days have the higher median pressure (1024 against 1022 hPa). Spread: Moderate days have the larger IQR (12 against 7 hPa), so their pressure is more variable." } },
    { callout: { t: "warn", h: "What a comparison must not do", body: [
      "Compare means when the question gives you medians, or vice versa.",
      "State the numbers without saying what they mean (\"median A = 21, median B = 19\" scores nothing on its own).",
      "Compare minimum and maximum values when outliers are present — they are the least reliable values."
    ] } },

    /* ---------------------------------------------------------------- Page 5 */
    { page: "Shape: symmetry and skew" },
    { fig: { x: [0, 30], y: [0, 1.1], w: 520, h: 200, axes: { x: "", y: "", xt: [], yt: [] }, items: [
      { fn: "exp(-((x-5)^2)/3)", from: 0.5, to: 9.5, c: "accent", w: 2.2 },
      { text: [5, 1.05], t: "symmetric", size: 12, c: "accent", b: true }, { text: [5, -0.06], t: "mean = median = mode", size: 10.5, c: "text2" },
      { fn: "(x-10.5)*exp(-(x-10.5)/1.5)/1.5*1.7", from: 10.5, to: 19, c: "accent2", w: 2.2 },
      { text: [14.2, 1.05], t: "positive skew", size: 12, c: "accent2", b: true }, { text: [15, -0.06], t: "mode < median < mean", size: 10.5, c: "text2" },
      { fn: "(29.5-x)*exp(-(29.5-x)/1.5)/1.5*1.7", from: 21, to: 29.5, c: "accent3", w: 2.2 },
      { text: [25.8, 1.05], t: "negative skew", size: 12, c: "accent3", b: true }, { text: [25, -0.06], t: "mean < median < mode", size: 10.5, c: "text2" }
    ], cap: "A long tail drags the **mean** towards it; the median resists. Positive skew = tail to the right." } },
    { table: { head: ["Shape", "Quartiles", "Averages"], rows: [
      ["Symmetric", "$Q_2 - Q_1 = Q_3 - Q_2$", "mean ≈ median ≈ mode"],
      ["Positive skew (tail right)", "$Q_2 - Q_1 < Q_3 - Q_2$", "mode < median < mean"],
      ["Negative skew (tail left)", "$Q_2 - Q_1 > Q_3 - Q_2$", "mean < median < mode"]
    ] } },
    { ul: [
      "LDS rainfall is the textbook positive skew: most days have little or none, a few have a great deal.",
      "A Normal model needs a roughly symmetric, single-peaked histogram with mean ≈ median — that is the check behind \"comment on the assumption of normality\" (A-level Specimen Q1(e))."
    ] },
    { worked: { tag: "variation", title: "Use the mean and median to comment on normality", src: "practice variant (A-level Specimen Q1(e) shape)",
      q: "For 90 packets of coffee the estimated median mass is 250.5 g and the estimated mean is 250.4 g. Comment on the assumption that the mass is normally distributed.",
      steps: [
        { h: "What does a Normal distribution need?", m: "Symmetry, so mean = median." },
        { h: "Compare", m: "250.4 and 250.5 are very close, so the data are roughly symmetrical: the assumption is consistent with the data." }
      ], result: "Consistent — mean ≈ median suggests symmetry" } },

    /* ---------------------------------------------------------------- Page 6 */
    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Complete the histogram**", "the scale first (from one full bar), then each bar's height = frequency ÷ width"],
      ["**Estimate the number / percentage**", "areas, with part bars in proportion to width"],
      ["**Use linear interpolation**", "the fraction-through-the-class line, written out"],
      ["**Draw a box plot**", "five values on the scale; whiskers attached; outliers as crosses"],
      ["**Compare**", "median *and* IQR, each in context"],
      ["**With reference to the histogram, comment on the model**", "shape: symmetric or skewed, against the model's shape"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Frequency is area**, never height, unless every class has the same width.",
      "**Find the scale from a whole bar** whose frequency you know before touching the others.",
      "**Class widths** of 1.5 or 2.5 are where the arithmetic slips.",
      "**Range** uses the extreme values, outliers included; **whiskers** stop at the last non-outlier.",
      "**Integrate to find $k$**: the area under a frequency-density curve is the total frequency."
    ] },
    { h: "Misconceptions" },
    { ul: [
      "\"The tallest bar has the most data\" — only if the widths are equal.",
      "\"A cumulative frequency point goes at the midpoint\" — it goes at the upper boundary.",
      "\"Positive skew means most values are high\" — it means a long tail of high values; most values are low.",
      "\"The whisker reaches the maximum\" — not when the maximum is an outlier."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Grouped mean and sd", "**Statistics → 1-Variable**, turn on the Frequency column (Settings), enter midpoints and frequencies; **Calc** gives $\\bar{x}$ and $\\sigma_x$ (Edexcel's $\\sigma$) as well as $s_x$."],
      ["Area under a model curve", "The $\\int$ template checks your $k$ — but the question says *find*, so write the integration."]
    ] },
    { callout: { t: "mnemonic", h: "\"Area for amount, middle for polygon, top for cumulative\"", body: "Histogram area = frequency; frequency polygon plots at midpoints; cumulative frequency plots at the upper boundary." } }
  ],
  flashcards: [
    ["Frequency density?", "Frequency ÷ class width."],
    ["In a histogram, what represents frequency?", "The area of the bar (or area proportional to frequency)."],
    ["Bars over 15–18 (12 units), 18–22 (3), 22–24 (2) hold 78. Items per square?", "$36 + 12 + 4 = 52$ squares, so $78 \\div 52 = 1.5$."],
    ["A bar 1.2 cm wide, 10 cm high represents 15. What does 1 cm² represent?", "$15 \\div 12 = 1.25$ items (equivalently 1 item = 0.8 cm²)."],
    ["How do you find $k$ for a frequency-density curve $y = f(x)$ on $[a, b]$?", "Set $\\int_a^b f(x)\\,dx$ = total frequency and solve."],
    ["Where is a cumulative frequency point plotted?", "At the upper class boundary."],
    ["Where is a frequency polygon point plotted?", "At the class midpoint."],
    ["Five values in a box plot?", "Lowest non-outlier, $Q_1$, median, $Q_3$, highest non-outlier (plus outliers marked separately)."],
    ["Range when there are outliers?", "Largest value − smallest value, outliers included."],
    ["Comparing two box plots — what two things?", "Median (location) and IQR (spread), each in context."],
    ["Positive skew: order of mean, median, mode?", "mode < median < mean."],
    ["Positive skew from quartiles?", "$Q_3 - Q_2 > Q_2 - Q_1$."],
    ["Boundaries for 'aged 5–9'?", "$5 \\le x < 10$.", 13],
    ["Boundaries for rainfall '0.1–0.5' (to 0.1 mm)?", "0.05 to 0.55.", 14]
  ],
  quiz: [
    { q: "A class $10 \\le x < 25$ has frequency 45. Its frequency density is:", opts: ["3", "45", "4.5", "1.8"], ans: 0, why: "$45 \\div 15$." },
    { q: "On a histogram the most frequent class is the one with the greatest:", opts: ["area", "height", "width", "midpoint"], ans: 0, why: "Area is frequency." },
    { q: "A model $y = kx(8 - x)$ on $[0, 8]$ for 256 items gives $k =$", opts: ["3", "4", "1", "$\\tfrac{3}{256}$"], ans: 0, why: "$\\frac{256k}{3} = 256$." },
    { q: "A cumulative frequency curve is used to read:", opts: ["median and quartiles", "the mode", "the mean", "the standard deviation"], ans: 0, why: "Read at $\\frac n4, \\frac n2, \\frac{3n}{4}$." },
    { q: "A whisker ends at:", opts: ["the last value that is not an outlier", "the maximum always", "$Q_3 + 1.5\\,\\text{IQR}$ always", "the mean"], ans: 0, why: "Outliers are plotted separately." },
    { q: "Data with mean 34, median 28 are most likely:", opts: ["positively skewed", "negatively skewed", "symmetric", "bimodal"], ans: 0, why: "A tail of high values pulls the mean up." },
    { q: "Subtracting 5 g from every plum weight changes:", opts: ["the mean only", "the standard deviation only", "both", "neither"], ans: 0, why: "A shift moves location, not spread." }
  ]
};

/* =====================================================================
   S2.2  Scatter diagrams, correlation and regression lines
   ===================================================================== */
C["maths:S2.2"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Bivariate data — the whole topic on one page" },
    "Spec 2.2 is about **two variables measured on the same items** and what a scatter diagram and a regression line say about them.",
    "Edexcel never asks you to *calculate* a regression line (\"calculations involving regression lines are excluded\"). It gives you the equation and asks what it means.",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Describe the correlation", "1", "most years"],
      ["Interpret the gradient (and intercept) in context, with units", "1–2", "AS 2018, 2019, 2022; A-level 2018, 2024, 2025"],
      ["Use the line: change over an interval, a prediction, a constant", "2–4", "AS 2022 Q1, AS 2025 Q4"],
      ["Reliability of a prediction: interpolation or extrapolation", "1", "AS 2022 Q1, AS Specimen Q3"],
      ["Explanatory and response variables", "1", "A-level 2018 Q2"],
      ["Correlation and causation; is a linear model appropriate?", "1", "A-level Specimen, 2024 Q2"],
      ["Distinct sections of the population in one scatter diagram", "1", "A-level Specimen Q2"],
      ["Change of variable: logs to linearise $y = ax^n$ or $y = kb^x$", "5", "A-level June 2022 Q6"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**Scatter diagrams and correlation** — describing, the vocabulary, causation, distinct sections.",
      "**Regression lines** — explanatory and response variables, interpreting $a$ and $b$ in context, units.",
      "**Using the line** — predictions, interpolation and extrapolation.",
      "**Non-linear models** — when a line is wrong, and how logarithms turn a curve into a line.",
      "**Exam toolkit**."
    ] },
    "The hypothesis test for correlation (\"is there evidence of negative correlation?\") is in S5.1; this leaf is the description and interpretation it rests on.",

    /* ---------------------------------------------------------------- Page 1 */
    { page: "Scatter diagrams and correlation" },
    { h: "1.1  Describing correlation" },
    "**Correlation** describes how close the points lie to a straight line. Describe it with a **direction** and, if asked, a **strength**:",
    { fig: { x: [0, 33], y: [0, 11], w: 540, h: 190, axes: { x: "", y: "", xt: [], yt: [] }, items: [].concat(
      pts([1, 2, 2.6, 3.4, 4, 5, 5.6, 6.5, 7.2, 8], [1.5, 2.2, 3.4, 3.2, 4.4, 5, 6.2, 6.4, 7.6, 8.4], "accent"),
      pts([12, 13, 13.7, 14.4, 15, 16, 16.6, 17.4, 18.2, 19], [8.6, 7.4, 8, 6.2, 6.8, 5, 5.6, 3.8, 4, 2.4], "accent2"),
      pts([23, 24, 24.6, 25.5, 26.2, 27, 27.6, 28.5, 29.2, 30], [5, 2.4, 8.4, 4, 6.8, 2, 7, 4.8, 3, 6.2], "muted"),
      [{ text: [4.5, 10.2], t: "positive", size: 12, c: "accent", b: true }, { text: [15.5, 10.2], t: "negative", size: 12, c: "accent2", b: true }, { text: [26.5, 10.2], t: "no correlation", size: 12, c: "muted", b: true }]
    ), cap: "Positive: as one increases, so does the other. Negative: as one increases, the other decreases. None: no linear pattern." } },
    { kv: [
      ["Positive / negative / zero (no)", "The direction. \"As $x$ increases, $y$ tends to increase\" is an acceptable *interpretation*; say it in the context's words."],
      ["Strong / weak", "How tightly the points hug a line. With a PMCC: $|r|$ near 1 is strong, near 0 weak."],
      ["Product moment correlation coefficient $r$", "$-1 \\le r \\le 1$. $r = \\pm 1$ means every point lies on a straight line. It measures **linear** association only. You find it with your calculator; the formula is not required."]
    ] },
    { callout: { t: "warn", h: "Describe vs interpret", body: [
      "**Describe** the correlation: \"positive\" (or \"weak negative\").",
      "**Interpret** the correlation: say it in context — \"as humidity increases, mean visibility tends to decrease\".",
      "\"Negative skew\" is a different idea entirely and scores B0."
    ] } },
    { h: "1.2  Correlation does not imply causation" },
    { ul: [
      "Two variables can be correlated because **both depend on a third** (ice-cream sales and drownings both rise in hot weather) or by coincidence.",
      "A correlation shows *association*. Only an experiment, or a known mechanism, shows cause.",
      "Exam language: \"suggest a possible reason for this correlation\" wants a plausible mechanism in context; \"does this show that $x$ causes $y$?\" wants **no**, with the reason above."
    ] },
    { worked: { tag: "exam", title: "Explain a correlation in context — not just describe it", src: "A-level June 2018 · P3 Q2(b)–(e) · 4 marks",
      q: "Tessa owns a clothes shop in a seaside town. For 8 summer weeks she records weekly sales, £$w$, and average weekly temperature, $t$ °C; the PMCC is $-0.915$. **(b)** Suggest a possible reason for this correlation. Tessa suggests a linear regression model. **(c)** State, giving a reason, whether the correlation coefficient is consistent with this. **(d)** State, giving a reason, which variable would be the explanatory variable. The regression equation is $w = 10\\,755 - 171t$. **(e)** Interpret the gradient.",
      steps: [
        { h: "(b) A mechanism, in context", m: "On hotter days people spend their time on the beach rather than shopping.", mk: "B1", n: "\"As temperature increases, sales decrease\" only *describes* the correlation — B0." },
        { h: "(c) How close to a line?", m: "Yes: $r = -0.915$ is close to $-1$, so the points lie close to a straight line.", mk: "B1" },
        { h: "(d) Which depends on which?", m: "$t$ (temperature): sales are likely to depend on the temperature, not the other way round.", mk: "B1", n: "\"$t$ causes $w$ to fall\" claims causation — B0. \"$t$ is the independent variable\" without a reason — B0." },
        { h: "(e) Rate, in context, with the number", m: "For every 1 °C rise in average weekly temperature, weekly sales fall by about £171.", mk: "B1" }
      ], result: "(b) beach not shops (c) consistent — $r$ near $-1$ (d) temperature (e) £171 less per extra °C" } },
    { h: "1.3  Distinct sections of the population" },
    "A scatter diagram can contain **two groups** that behave differently — two stations, two seasons, two species. Taken together they can show a correlation that neither group has, or hide one each group does have.",
    { fig: { x: [0, 33], y: [0, 7], w: 480, h: 240, axes: { x: "mean temperature t (°C)", y: "mean rainfall s (mm)", xt: [5, 10, 15, 20, 25, 30], yt: [2, 4, 6] }, items: [].concat(
      pts([14.5, 15.2, 16, 16.6, 17.3], [3.4, 2.9, 2.4, 2.1, 1.6], "accent"),
      [{ pt: [26.5, 5.4], c: "accent2", label: "G", pos: "e" }, { pt: [28, 6.1], c: "accent2", label: "H", pos: "e" },
       { text: [16, 4.2], t: "five UK stations", size: 11.5, c: "accent" }, { text: [24.5, 6.6], t: "Beijing, Jacksonville", size: 11.5, c: "accent2" }]
    ), cap: "July 2015, the seven northern-hemisphere stations (A-level Specimen Q2). Overall $r = 0.658$ — but the UK stations alone slope **down**. Two populations, not one line." } },
    { worked: { tag: "exam", title: "Why a single line does not fit; which places are G and H?", src: "A-level Specimen · P3 Q2(a)(c)(d)(e) · 4 marks",
      q: "A researcher plots, for the 7 northern-hemisphere places in the large data set, the July 2015 mean of the daily mean temperature, $t$ °C, against the mean daily total rainfall, $s$ mm. Five points sit together near $t = 15$–$17$ and fall slightly; two, G and H, sit apart at $t \\approx 27$ with much higher rainfall. **(a)** With reference to the scatter diagram, explain why a linear regression model may not be suitable. **(c)** Using your knowledge of the large data set, suggest the names of G and H. **(d)** Give a reason why these places have the highest temperatures in July. **(e)** Suggest how you could make better use of the large data set to investigate the relationship.",
      steps: [
        { h: "(a) Look at the pattern, not just $r$", m: "The points do not lie close to a straight line: there appear to be two separate groups, and without G and H the correlation looks negative.", mk: "B1" },
        { h: "(c) The two hot, wet places", m: "Beijing and Jacksonville.", mk: "B1", n: "Perth is excluded (southern hemisphere); the other five are in the UK." },
        { h: "(d)", m: "They are the closest to the equator of the seven places, and July is their summer.", mk: "B1" },
        { h: "(e)", m: "Use the daily data from **one** place (and all its days), rather than one monthly mean per place.", mk: "B1", n: "Seven monthly means is a tiny sample mixing different climates." }
      ], result: "(a) two populations, not one line (c) Beijing and Jacksonville (d) nearest the equator (e) use daily data from one place" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Regression lines" },
    { h: "2.1  Explanatory and response variables" },
    { kv: [
      ["Explanatory (independent) variable", "The one that is controlled, measured first, or that the other depends on. Plotted on the **horizontal** axis."],
      ["Response (dependent) variable", "The one whose value is thought to depend on the other. Plotted on the **vertical** axis."],
      ["Regression line of $y$ on $x$", "$y = a + bx$: the least-squares line used to **predict $y$ from $x$**. Do not use it backwards to predict $x$ from $y$."]
    ] },
    { h: "2.2  Interpreting $a$ and $b$" },
    { callout: { t: "memorise", h: "The sentence templates that score", body: [
      "**Gradient $b$:** \"For every 1 [unit of $x$] increase in [$x$ in words], [$y$ in words] increases/decreases by [$|b|$] [units of $y$], on average.\"",
      "**Intercept $a$:** \"When [$x$ in words] is 0, [$y$ in words] is [$a$] [units].\" Then ask: is $x = 0$ inside the data? If not, the intercept may have no sensible meaning.",
      "**Units of the gradient:** units of $y$ **per** unit of $x$ — mm per hour, cm per day, £ per point.",
      "Always include **the number** and the idea of a **rate**; \"every point earns £4.50\" (no rate) is B0, \"every extra point gives £4.50 more\" is B1."
    ] } },
    { fig: { x: [0, 11], y: [0, 24], w: 480, h: 250, axes: { x: "t (days)", y: "p (cm)", xt: [0, 2, 4, 6, 8, 10], yt: [5, 10, 15, 20] }, items: [
      { fn: "22-1.1*x", from: 0, to: 11, c: "accent", w: 2.2, label: "p = 22 − 1.1t", at: 2, pos: "sw" },
      { line: [[4, 17.6], [7, 17.6]], c: "accent2", w: 1.6, dash: true }, { line: [[7, 17.6], [7, 14.3]], c: "accent2", w: 1.6, dash: true },
      { text: [5.5, 18.6], t: "3 days", size: 11, c: "accent2" }, { text: [7.3, 16], t: "−3.3 cm", pos: "e", size: 11, c: "accent2" },
      { pt: [0, 22], c: "accent3", label: "intercept 22", pos: "e" }
    ], cap: "AS June 2022: the gradient is $-1.1$ cm per day, so over 3 days $p$ falls by 3.3 cm." } },
    { worked: { tag: "exam", title: "Correlation, units, a 3-day change, and reliability", src: "AS June 2022 · P2 Q1 · 5 marks",
      q: "Two variables $p$ and $t$ are modelled by the regression line $p = 22 - 1.1t$, based on observations of the independent variable $t$ between 1 and 10. **(a)** Describe the correlation implied. $p$ is in centimetres and $t$ in days. **(b)** State the units of the gradient. **(c)** Using the model, calculate the change in $p$ over a 3-day period. Tisam uses the model to estimate $p$ when $t = 19$. **(d)** Comment, giving a reason, on the reliability of this estimate.",
      steps: [
        { h: "(a)", m: "Negative correlation (the gradient is negative).", mk: "B1" },
        { h: "(b)", m: "cm per day (cm day⁻¹).", mk: "B1" },
        { h: "(c)", m: "$3 \\times 1.1 = 3.3$: $p$ **decreases** by 3.3 cm.", mk: "M1 A1", n: "The word \"decrease\" is part of the A mark; \"$-3.3$\" alone scores M1 A0." },
        { h: "(d)", m: "Unreliable: $t = 19$ is well outside the range 1 to 10 used to make the model — extrapolation.", mk: "B1", n: "Both parts are needed: the verdict and the reason." }
      ], result: "(a) negative (b) cm/day (c) decrease of 3.3 cm (d) unreliable — extrapolation" } },
    { worked: { tag: "exam", title: "Interpret a gradient; why the model fails for some jobs", src: "AS June 2018 · P2 Q1 · 3 marks",
      q: "A company awards points, $x$, to each job and allocates pay, £$y$, by points. For a sample of 8 employees the regression line of pay on points is $y = 4.5x - 47$. **(a)** Describe the correlation between points and pay. **(b)** Interpret the gradient. **(c)** Explain why this model might not be appropriate for all jobs in the company.",
      steps: [
        { h: "(a)", m: "Positive.", mk: "B1" },
        { h: "(b)", m: "Every extra point gives £4.50 more pay.", mk: "B1" },
        { h: "(c) Test the model at its edge", m: "For fewer than about 10.4 points ($4.5x - 47 < 0$) it predicts **negative pay**, which is impossible.", mk: "B1", n: "Also accepted: the sample of 8 may not cover the full range of points, so the line may not apply outside it." }
      ], result: "(a) positive (b) £4.50 per extra point (c) predicts negative pay for low-point jobs" } },
    { worked: { tag: "exam", title: "Effect of extra sleep; a limitation of the model", src: "AS June 2019 · P2 Q1(b)(c) · 2 marks",
      q: "For a sample of 40 students, the regression line of test mark $p$ on hours of sleep $s$ the night before is $p = 26.1 + 5.60s$. **(b)** Describe the effect that an extra 0.5 hours of sleep may have, on average, on performance. **(c)** Describe one limitation of the model.",
      steps: [
        { h: "(b)", m: "$0.5 \\times 5.60 = 2.8$: the mark increases by 2.8 marks on average.", mk: "B1", n: "\"About 3 marks\" is B0 unless 2.8 is seen." },
        { h: "(c)", m: "e.g. it predicts ever-higher marks the longer a student sleeps (the best mark for a student who never wakes up); it ignores every other factor; it cannot apply beyond 24 hours or the maximum mark.", mk: "B1", n: "\"There might be no correlation\" or \"individuals vary\" are B0." }
      ], result: "(b) +2.8 marks (c) e.g. predicts unlimited improvement with more sleep" } },
    { worked: { tag: "exam", title: "LDS units of a gradient; meaning of an intercept; does it match a claim?", src: "A-level June 2025 · P3 Q4(c)(d) · 3 marks",
      q: "Kay's regression line of Daily Total Rainfall, $y$, on Daily Total Sunshine, $x$, for a systematic sample from Leeming 2015 is $y = 0.741 + 0.199x$. **(c)** Using your knowledge of the large data set, (i) state the units of the gradient, (ii) interpret the $y$-intercept. Her teacher claims that the more sunshine in a day, the less rain there should be. **(d)** State, giving a reason, whether the claim is true for Kay's data.",
      steps: [
        { h: "(c)(i) Rainfall is in mm, sunshine in hours", m: "mm per hour (mm h⁻¹).", mk: "B1" },
        { h: "(c)(ii)", m: "On a day with no sunshine, there is on average 0.741 mm of rain.", mk: "B1", n: "\"Minimum rain\" is B0 — the intercept is a prediction, not a bound." },
        { h: "(d)", m: "No: the gradient 0.199 is **positive**, so Kay's line says more sunshine goes with more rain.", mk: "B1" }
      ], result: "(c)(i) mm/h (ii) 0.741 mm of rain when there is no sun (d) not consistent — positive gradient" } },
    { worked: { tag: "exam", title: "Build the line from two statements", src: "AS June 2025 · P2 Q4(b) · 4 marks",
      q: "Giovanni models fuel consumption $c$ (mpg) by mass $m$ (kg) with $c = a + bm$. On average, fuel consumption is 3.5 mpg lower for each additional 500 kg of mass, and a car of mass 1700 kg does 20 mpg. Find (i) $b$, (ii) $a$.",
      steps: [
        { h: "(i) The gradient is the rate", m: "$b = \\dfrac{-3.5}{500} = -0.007$", mk: "M1 A1", n: "Writing \"3.5 = a + 500b\" treats the rate as a point — M0." },
        { h: "(ii) The point fixes $a$", m: "$20 = a - 0.007 \\times 1700 = a - 11.9 \\;\\Rightarrow\\; a = 31.9$", mk: "M1 A1" }
      ], result: "$b = -0.007$, $a = 31.9$" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Interpolation and extrapolation" },
    { kv: [
      ["Interpolation", "Using the line **within** the range of the explanatory variable's data. Reasonably reliable — if the correlation is strong."],
      ["Extrapolation", "Using the line **outside** that range. Unreliable: nothing says the relationship continues."],
      ["Wrong direction", "Using a $y$-on-$x$ line to predict $x$ from $y$ is not valid even inside the range."]
    ] },
    { fig: { x: [0, 14], y: [0, 14], w: 480, h: 250, axes: { x: "x", y: "y", xt: [], yt: [] }, items: [].concat(
      pts([3, 3.6, 4.4, 5, 5.7, 6.4, 7, 7.8, 8.4, 9], [3.6, 3.2, 4.6, 4.4, 5.6, 5.4, 6.6, 6.2, 7.4, 7.6], "accent"),
      [{ fn: "1.4+0.68*x", from: 3, to: 9, c: "accent", w: 2.2 },
       { fn: "1.4+0.68*x", from: 9, to: 13.5, c: "danger", w: 2, dash: true },
       { fn: "1.4+0.68*x", from: 0.5, to: 3, c: "danger", w: 2, dash: true },
       { text: [6, 10.5], t: "interpolation zone", size: 12, c: "accent", b: true },
       { text: [11.8, 13.2], t: "extrapolation", size: 12, c: "danger", b: true },
       { vline: 3, c: "accent3" }, { vline: 9, c: "accent3" }]
    ), cap: "Inside the data's $x$-range (solid) the line is supported by data; outside it (dashed) it is a guess." } },
    { worked: { tag: "exam", title: "Interpret a rate; a December prediction from the LDS", src: "AS Specimen · P2 Q3(d)(e) · 2 marks",
      q: "Using all the data in the large data set for Perth, the regression line of daily rainfall, $w$ mm, on daily mean pressure, $p$ hPa, is $w = 1023 - 0.223p$. **(d)** Interpret the figure $-0.223$. John uses the line to estimate the daily rainfall on a December day when the pressure is 1011 hPa. **(e)** Using your knowledge of the large data set, comment on the reliability of the estimate.",
      steps: [
        { h: "(d)", m: "On average, an increase of 1 hPa in daily mean pressure goes with a decrease of 0.223 mm in daily rainfall.", mk: "B1" },
        { h: "(e)", m: "Unreliable: the large data set covers only May to October, so December is outside the data — extrapolation (in time).", mk: "B1", n: "\"Extrapolation\" alone, with no reason, is B0. 1011 hPa is inside the pressure range — the problem is the month." }
      ], result: "(d) −0.223 mm per hPa (e) unreliable — no December data" } },
    { worked: { tag: "exam", title: "Interpolate within a scatter diagram; a qualitative variable", src: "AS June 2023 · P2 Q2 · 4 marks",
      q: "Fred and Nadine investigate Daily Mean Pressure, $p$ hPa, against Daily Mean Air Temperature, $t$ °C, for Beijing 2015. Fred's scatter diagram for one randomly chosen month shows no clear pattern. Nadine's diagram, using all the Beijing 2015 data on the same scales, shows a clear downward trend. **(a)** Describe the correlation in Fred's diagram. **(b)** Explain, in context, what Nadine can infer. **(c)** Using your knowledge of the large data set, state a value of $p$ for which interpolation could be used to predict $t$. **(d)** Explain why it is not meaningful to look for a linear relationship between Daily Mean Wind Speed (Beaufort conversion) and Daily Mean Air Temperature.",
      steps: [
        { h: "(a)", m: "No (or weak) correlation.", mk: "B1", n: "One month covers a narrow range of temperatures — a small slice of a big pattern can look like noise." },
        { h: "(b)", m: "As pressure increases, temperature tends to decrease.", mk: "B1", n: "\"Negative correlation\" alone is B0: say it in context." },
        { h: "(c)", m: "Any value in the observed pressure range, e.g. $p = 1010$ hPa (990–1040 accepted).", mk: "B1" },
        { h: "(d)", m: "The Beaufort conversion is **qualitative** (words such as Light, Moderate), so it cannot be plotted on a linear scale.", mk: "B1" }
      ], result: "(a) none (b) higher pressure, lower temperature (c) e.g. 1010 hPa (d) Beaufort is qualitative" } },

    /* ---------------------------------------------------------------- Page 4 */
    { page: "Non-linear models and logarithms" },
    "When the scatter diagram is a **curve**, a straight line is the wrong model — however the PMCC looks.",
    "Two curved models become straight after taking logarithms (Pure 6.6):",
    { table: { head: ["Model", "Take logs", "Plot", "Gradient", "Intercept"], rows: [
      ["$y = ax^n$", "$\\log y = \\log a + n\\log x$", "$\\log y$ against $\\log x$", "$n$", "$\\log a$"],
      ["$y = kb^x$", "$\\log y = \\log k + x\\log b$", "$\\log y$ against $x$", "$\\log b$", "$\\log k$"]
    ] } },
    { callout: { t: "tip", h: "Undoing the logs", body: [
      "If the coded line is $Y = c + mX$ with $Y = \\log_{10} y$:",
      "for $X = \\log_{10} x$: $\\; y = 10^c \\, x^m$ — so $a = 10^c$ and $n = m$;",
      "for $X = x$: $\\; y = 10^c \\left(10^m\\right)^x$ — so $k = 10^c$ and $b = 10^m$."
    ] } },
    { worked: { tag: "exam", title: "From a log–log line back to $h = am^k$", src: "A-level June 2022 · P3 Q6(a)(c) · 6 marks",
      q: "Anna records, for 19 people, resting heart rate $h$ (beats per minute) and minutes of exercise per week $m$. The scatter diagram shows $h$ falling steeply at first and then levelling off as $m$ increases. **(a)** Interpret the nature of the relationship between $h$ and $m$. She codes $x = \\log_{10} m$, $y = \\log_{10} h$ and finds the line of best fit $y = -0.05x + 1.92$. **(c)** Use this to find a model for $h$ in the form $h = am^k$.",
      steps: [
        { h: "(a) Describe the curve in context", m: "As minutes of exercise increase, resting heart rate decreases — but each extra minute has a smaller effect (the curve flattens).", mk: "B1",
          fig: { x: [0, 420], y: [55, 85], w: 440, h: 220, axes: { x: "m (minutes)", y: "h (bpm)", xt: [0, 100, 200, 300, 400], yt: [60, 70, 80] }, items: [
            { fn: "83.18*x^(-0.05)", from: 5, to: 420, c: "accent", w: 2.2, label: "h = 83.2 m^(−0.05)", at: 250 }] } },
        { h: "(c) Substitute the codings", m: "$\\log_{10} h = -0.05\\log_{10} m + 1.92$", mk: "M1" },
        { h: "Power rule", m: "$\\log_{10} h = \\log_{10} m^{-0.05} + 1.92$", mk: "M1" },
        { h: "Collect the logs", m: "$\\log_{10}\\left(h\\,m^{0.05}\\right) = 1.92$", mk: "M1" },
        { h: "Remove the log", m: "$h\\,m^{0.05} = 10^{1.92} \\;\\Rightarrow\\; h = 10^{1.92}\\,m^{-0.05}$", mk: "M1" },
        { m: "$h = 83.2\\,m^{-0.05}$: $\\; a = 83.2$, $k = -0.05$", mk: "A1" }
      ], result: "$h = 83.2\\,m^{-0.05}$" } },
    { worked: { tag: "exam", title: "Is a straight line appropriate? A better model by a change of variable", src: "A-level June 2024 · P3 Q2(a)(c)(d) · 3 marks",
      q: "Amar measures a bird's height above the ground, $h$ m, at 10 times $t$ s, and finds the regression line $h = 38.6 - 1.28t$. **(a)** Interpret the gradient. Jane's scatter diagram shows $h$ rising from about 33 m to a maximum near $t = 3.5$ and then falling steeply to about 20 m at $t = 8$. **(c)** With reference to the scatter diagram, state, giving a reason, whether the regression line is an appropriate model. Jane suggests a model using $u = (t - k)^2$ and obtains $h = 38.1 - 0.78u$. **(d)** Choose a suitable value for $k$ and write the model in terms of $t$.",
      steps: [
        { h: "(a)", m: "The height decreases by about 1.28 m for each second of the flight.", mk: "B1" },
        { h: "(c)", m: "No — the points follow a curve: the height increases at first and then decreases, so a straight line with negative gradient misrepresents the start of the flight.", mk: "B1", n: "\"The points don't lie close to a line\" without mentioning the curve is B0." },
        { h: "(d) The vertex of the parabola is the maximum", m: "Take $k = 3.5$ (where the height peaks): $h = 38.1 - 0.78(t - 3.5)^2$", mk: "B1", n: "Any $k$ between 3 and 4.5 is accepted.",
          fig: { x: [0, 9], y: [0, 42], w: 440, h: 220, axes: { x: "t (s)", y: "h (m)", xt: [1, 2, 3, 4, 5, 6, 7, 8], yt: [10, 20, 30, 40] }, items: [
            { fn: "38.1-0.78*(x-3.5)^2", from: 0.5, to: 8.5, c: "accent", w: 2.2, label: "quadratic model", at: 6.5, pos: "ne" },
            { fn: "38.6-1.28*x", from: 0.5, to: 8.5, c: "danger", w: 1.6, dash: true, label: "linear", at: 1.2, pos: "sw" }] } }
      ], result: "(a) −1.28 m per second (c) not appropriate — curved pattern (d) $h = 38.1 - 0.78(t - 3.5)^2$" } },

    /* ---------------------------------------------------------------- Page 5 */
    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Describe the correlation**", "positive / negative / none (strength if it is obvious)"],
      ["**Interpret the correlation**", "a sentence in context: as $x$ increases, $y$ tends to…"],
      ["**Interpret the gradient**", "rate + number + units + context"],
      ["**Give an interpretation of the intercept**", "the value of $y$ when $x = 0$, in context — and whether $x = 0$ makes sense"],
      ["**Comment on the reliability**", "a verdict + a reason: within/outside the data range, strength of correlation, sample size, time period"],
      ["**State, giving a reason, which is the explanatory variable**", "the one the other depends on, with the dependence explained"],
      ["**Suggest a reason for the correlation**", "a mechanism in context, not a re-description"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**The number in the interpretation**: 171, 0.223, 2.8 — always quoted.",
      "**Increase / decrease in words**, not just a sign.",
      "**Units of a gradient** are a ratio: $y$-units per $x$-unit.",
      "**Extrapolation** must be explained — say which range the data covered.",
      "**LDS months**: a prediction for December or January is extrapolation in time."
    ] },
    { h: "Misconceptions" },
    { ul: [
      "\"Strong correlation means $x$ causes $y$.\"",
      "\"$r$ near 0 means no relationship\" — it means no *linear* relationship; a curve can have $r \\approx 0$.",
      "\"The regression line of $y$ on $x$ can predict $x$.\"",
      "\"A bigger gradient means stronger correlation\" — the gradient depends on units; $r$ measures strength."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["PMCC", "**Statistics → 2-Variable** ($y = a + bx$), enter the $x$ and $y$ lists, **Calc → Regression**: it shows $a$, $b$ and $r$. Use $r$; you will not be asked to calculate $a$ and $b$."],
      ["Logs", "Enter $\\log x$, $\\log y$ in the lists to check a coded line."]
    ] },
    { callout: { t: "mnemonic", h: "\"Per one, by how much, which way, in words\"", body: "The four parts of every gradient interpretation." } }
  ],
  flashcards: [
    ["Describe correlation in two words.", "Direction (positive/negative/none) and strength (strong/weak)."],
    ["Range of the PMCC $r$?", "$-1 \\le r \\le 1$; $\\pm 1$ means all points on a straight line."],
    ["Does correlation imply causation?", "No — a third variable or coincidence can produce it."],
    ["Explanatory vs response variable?", "Explanatory ($x$-axis) is the one the other depends on; response ($y$-axis) depends on it."],
    ["Interpret $b$ in $y = a + bx$.", "For each 1-unit increase in $x$, $y$ changes by $b$ units on average (in context, with units)."],
    ["Units of the gradient of rainfall (mm) on sunshine (hours)?", "mm per hour."],
    ["Interpolation vs extrapolation?", "Predicting inside vs outside the range of the explanatory variable's data; extrapolation is unreliable."],
    ["Why is an LDS-based prediction for December unreliable?", "The LDS covers May–October only — extrapolation."],
    ["$p = 22 - 1.1t$: change in $p$ over 3 days?", "Decrease of 3.3."],
    ["$c = a + bm$; 3.5 lower per 500 kg; 20 at 1700 kg. $a$, $b$?", "$b = -0.007$, $a = 31.9$."],
    ["$\\log_{10} h = -0.05\\log_{10} m + 1.92$ gives $h =$", "$10^{1.92} m^{-0.05} = 83.2\\,m^{-0.05}$.", 12],
    ["A scatter diagram has two clusters. Why care?", "There may be two distinct populations; a single line can mislead.", 13]
  ],
  quiz: [
    { q: "$y = 26.1 + 5.60s$: an extra half hour of sleep changes $y$ by", opts: ["+2.8", "+5.6", "+26.1", "+13.05"], ans: 0, why: "$0.5 \\times 5.6$." },
    { q: "The units of the gradient of $p$ (cm) on $t$ (days) are", opts: ["cm/day", "day/cm", "cm", "cm·day"], ans: 0, why: "$y$ per $x$." },
    { q: "A model built on $1 \\le t \\le 10$ used at $t = 19$ is", opts: ["extrapolation", "interpolation", "regression", "coding"], ans: 0, why: "Outside the range." },
    { q: "$r = -0.915$ suggests", opts: ["strong negative linear correlation", "weak negative", "causation", "no correlation"], ans: 0, why: "Close to $-1$." },
    { q: "To linearise $y = 3 \\times 2^x$ plot", opts: ["$\\log y$ against $x$", "$\\log y$ against $\\log x$", "$y$ against $\\log x$", "$y$ against $x^2$"], ans: 0, why: "Exponential in $x$." },
    { q: "Ice-cream sales and sunburn are positively correlated. Most likely:", opts: ["both depend on sunny weather", "ice cream causes sunburn", "sunburn causes ice-cream sales", "it is coincidence"], ans: 0, why: "A third variable." }
  ]
};

/* =====================================================================
   S2.3  Measures of location and spread; standard deviation; coding
   ===================================================================== */
C["maths:S2.3"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Measures of location and spread — the whole topic on one page" },
    "Spec 2.3: interpret **central tendency** (mean, median, mode) and **variation** (range, interpercentile ranges, variance, standard deviation); calculate a standard deviation, including from **summary statistics**; use **coding**; and use **linear interpolation** for percentiles of grouped data.",
    "This is the most heavily examined calculation in AS and A-level statistics — it turns up in almost every paper, often inside an LDS question.",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Mean and sd from $n$, $\\sum x$, $\\sum x^2$", "3", "A-level 2018, 2022, 2023, 2024, 2025; AS 2025"],
      ["Mean and sd from a frequency table (raw or grouped)", "2–3", "AS 2018, AS 2020, AS 2023, A-level Specimen"],
      ["Median / quartile / percentile by linear interpolation", "2–4", "AS Specimen, AS 2019, AS 2021, AS 2022"],
      ["Coded data: decode the mean, median, sd", "3", "AS Specimen Q1, A-level Oct 2021 Q3"],
      ["Choose median/IQR or mean/sd, with a reason", "2", "A-level 2018 Q4"],
      ["Effect of adding/changing values on the median, mean or sd", "1–3", "A-level 2018 Q4, Oct 2020 Q3"],
      ["Midpoint assumption, and over/under-estimates", "3", "AS June 2019 Q4"],
      ["Use mean and sd to compare groups in context", "2", "A-level June 2025 Q2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**Location** — mean, median, mode; raw, discrete-frequency and grouped data.",
      "**Linear interpolation** — median, quartiles and percentiles from grouped data.",
      "**Spread** — range, IQR, interpercentile range, variance and standard deviation, and $S_{xx}$.",
      "**Coding** — what adding and multiplying do to each measure.",
      "**Choosing and changing** — which pair to quote, and what happens when data are added or altered.",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "Measures of location" },
    { kv: [
      ["Mode", "The most common value (or **modal class** for grouped data). The only average for qualitative data."],
      ["Median $Q_2$", "The middle value when the data are in order. Unaffected by extreme values."],
      ["Mean $\\bar{x}$", "$\\bar{x} = \\dfrac{\\sum x}{n}$, or $\\dfrac{\\sum fx}{\\sum f}$ from a frequency table. Uses every value — so is affected by extreme values."]
    ] },
    { h: "1.1  Median and quartiles of raw (discrete) data — Edexcel's rule" },
    { callout: { t: "memorise", h: "Finding the position", body: [
      "For the median: work out $\\frac{n}{2}$. For $Q_1$: $\\frac{n}{4}$. For $Q_3$: $\\frac{3n}{4}$.",
      "If the result is **not** a whole number, **round up** and take that value.",
      "If it **is** a whole number, take the **mean of that value and the next one**.",
      "Example, $n = 27$: $\\frac{27}{2} = 13.5$ → 14th value; $\\frac{27}{4} = 6.75$ → 7th value; $\\frac{81}{4} = 20.25$ → 21st value.",
      "For **grouped continuous** data do not round — interpolate at exactly $\\frac{n}{4}$, $\\frac{n}{2}$, $\\frac{3n}{4}$ (next page)."
    ] } },
    { h: "1.2  Means from frequency tables" },
    { ul: [
      "Discrete frequency table: $\\bar{x} = \\dfrac{\\sum fx}{\\sum f}$ with $x$ the actual values.",
      "Grouped table: use **class midpoints** for $x$. The answer is an **estimate**, because it assumes every value sits at its class midpoint (equivalently, that values are spread evenly through each class).",
      "Leave out any value recorded as n/a — and reduce $n$ to match."
    ] },
    { worked: { tag: "example", title: "Mean, median and quartiles of a small data set", src: "practice variant",
      q: "The number of hours of sunshine on 10 days at Hurn was: 0.0, 2.4, 5.1, 6.8, 7.3, 8.0, 9.6, 10.2, 11.5, 13.9. Find the mean, median and quartiles.",
      steps: [
        { h: "Mean", m: "$\\sum x = 74.8$, $\\; \\bar{x} = 7.48$ hours" },
        { h: "Median: $\\frac{10}{2} = 5$ — a whole number", m: "Mean of the 5th and 6th values: $\\dfrac{7.3 + 8.0}{2} = 7.65$" },
        { h: "$Q_1$: $\\frac{10}{4} = 2.5$ → round up to the 3rd value", m: "$Q_1 = 5.1$" },
        { h: "$Q_3$: $\\frac{30}{4} = 7.5$ → the 8th value", m: "$Q_3 = 10.2$" }
      ], result: "$\\bar{x} = 7.48$, $Q_1 = 5.1$, $Q_2 = 7.65$, $Q_3 = 10.2$" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Linear interpolation" },
    "For grouped continuous data the individual values are lost. **Linear interpolation** estimates a median, quartile or percentile by assuming the values in its class are **spread evenly** across the class.",
    { callout: { t: "formula", h: "The interpolation line", body: [
      "$$Q = L + \\frac{\\text{position} - \\text{cf below the class}}{\\text{class frequency}} \\times \\text{class width}$$",
      "$L$ = lower boundary of the class containing the position; position = $\\frac{n}{2}$, $\\frac{n}{4}$, $\\frac{3n}{4}$ or $\\frac{p}{100}n$ for the $p$th percentile.",
      "Equivalent picture: a straight line through the class on a cumulative frequency graph."
    ] } },
    { fig: { w: 520, h: 120, items: [
      { line: [[60, 50], [460, 50]], c: "text2", w: 2 },
      { line: [[60, 40], [60, 60]], c: "text2" }, { line: [[460, 40], [460, 60]], c: "text2" },
      { text: [60, 76], t: "5 (lower boundary)", size: 11.5, c: "text2" }, { text: [460, 76], t: "10 (upper boundary)", size: 11.5, c: "text2" },
      { text: [60, 28], t: "cf 3", size: 11.5, c: "accent" }, { text: [460, 28], t: "cf 18", size: 11.5, c: "accent" },
      { pt: [380, 50], c: "accent2" }, { text: [380, 28], t: "position 15", size: 11.5, c: "accent2", b: true },
      { text: [380, 96], t: "5 + (15 − 3)/15 × 5 = 9", size: 12, c: "accent2", b: true }
    ], cap: "The 15th value is 12 of the class's 15 values in, so it is $\\frac{12}{15}$ of the way across the class." } },
    { worked: { tag: "exam", title: "Interpolate a coded median; decode median and standard deviation", src: "AS Specimen · P2 Q1 · 9 marks",
      q: "Coded aptitude-test times, $x$ minutes, for 30 applicants: $0 \\le x < 5$ (3), $5 \\le x < 10$ (15), $10 \\le x < 15$ (2), $15 \\le x < 25$ (9), $25 \\le x < 35$ (1), with midpoints $y$ such that $\\sum fy = 355$ and $\\sum fy^2 = 5675$. **(a)** Use linear interpolation to estimate the median of the coded times. **(b)** Estimate the standard deviation of the coded times. The coded times were found by subtracting 15 from each time $t$ and dividing by 2. **(c)** Estimate the median and standard deviation of $t$. Next year there are 25 positions, 60 applicants, and no position is offered to anyone taking 35 minutes or more. **(d)** Comment on whether all 25 positions can be filled.",
      steps: [
        { h: "(a) Position $\\frac{30}{2} = 15$, in the class 5–10", m: "$Q_2 = 5 + \\dfrac{15 - 3}{15} \\times 5 = 9$", mk: "M1 A1" },
        { h: "(b)", m: "$\\sigma_x = \\sqrt{\\dfrac{5675}{30} - \\left(\\dfrac{355}{30}\\right)^2} = \\sqrt{49.14} = 7.01$", mk: "M1 A1" },
        { h: "(c) Reverse the coding", m: "$x = \\dfrac{t - 15}{2} \\;\\Rightarrow\\; t = 2x + 15$", mk: "M1" },
        { m: "median of $t$: $2 \\times 9 + 15 = 33$ minutes", mk: "A1ft", n: "Every value is doubled and shifted, so the median is too." },
        { m: "sd of $t$: $2 \\times 7.01 = 14.0$ minutes", mk: "A1ft", n: "The $+15$ does not change the spread; the $\\times 2$ doubles it." },
        { h: "(d) Use the median", m: "The median is 33 < 35, so about half the applicants — around 30 of the 60 — finish in under 35 minutes. That is more than 25, so the positions can probably be filled.", mk: "M1 A1" }
      ], result: "(a) 9 (b) 7.01 (c) median 33 min, sd 14.0 min (d) yes — about 30 qualify" } },
    { worked: { tag: "exam", title: "Upper quartile, sd, and the midpoint assumption for LDS rainfall", src: "AS June 2019 · P2 Q4 · 8 marks",
      q: "Joshua groups the Daily Total Rainfall, $r$ mm, for Hurn May–October 2015: $0 \\le r < 0.5$ (121), $0.5 \\le r < 1.0$ (10), $1.0 \\le r < 5.0$ (24), $5.0 \\le r < 10.0$ (12), $10.0 \\le r < 30.0$ (17), with $\\sum fx = 539.75$ and $\\sum fx^2 = 7704.1875$. **(a)** Using your knowledge of the large data set, explain why Joshua needs to clean the data first. **(b)** Use linear interpolation to estimate the upper quartile. **(c)** Estimate the standard deviation. **(d)** (i) State the assumption involved in using class midpoints to estimate a mean. (ii) Explain why it does not hold here. (iii) State whether you would expect the actual mean to be larger than, smaller than or the same as the estimate.",
      steps: [
        { h: "(a)", m: "The rainfall column contains **tr** (trace) entries, which must be converted to numbers before calculating.", mk: "B1" },
        { h: "(b) Position $\\frac{3}{4} \\times 184 = 138$", m: "Cumulative: 121, 131, 155 — so $Q_3$ is in $1.0 \\le r < 5.0$.\n$Q_3 = 1 + \\dfrac{138 - 131}{24} \\times 4 = 2.17$ mm", mk: "M1 A1" },
        { h: "(c)", m: "$\\sigma = \\sqrt{\\dfrac{7704.1875}{184} - \\left(\\dfrac{539.75}{184}\\right)^2} = 5.77$ mm", mk: "M1 A1" },
        { h: "(d)(i)", m: "That the values are spread evenly (uniformly) through each class, so each class's mean is its midpoint.", mk: "B1" },
        { h: "(d)(ii)", m: "Most of the 121 days in the first class had **no rain (0 mm)** or a trace — they are bunched at 0, not spread evenly up to 0.5.", mk: "B1" },
        { h: "(d)(iii)", m: "So the actual mean is likely to be **smaller** than the estimate: the first class's values are below its midpoint 0.25.", mk: "dB1" }
      ], result: "(a) tr values (b) 2.17 mm (c) 5.77 mm (d) even spread; most values are 0; actual mean smaller" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Measures of spread" },
    { kv: [
      ["Range", "largest − smallest. Uses only two values, so is distorted by any outlier."],
      ["Interquartile range (IQR)", "$Q_3 - Q_1$: the spread of the middle 50%. Unaffected by extreme values — pair it with the median."],
      ["Interpercentile range", "e.g. the 10–90 range, $P_{90} - P_{10}$: the spread of the middle 80%."],
      ["Variance $\\sigma^2$", "the mean of the squared distances from the mean."],
      ["Standard deviation $\\sigma$", "the square root of the variance, in the **same units as the data**. Pair it with the mean."]
    ] },
    { callout: { t: "formula", h: "Formulae (Statistics section of the formulae booklet)", body: [
      "$$S_{xx} = \\sum (x - \\bar{x})^2 = \\sum x^2 - \\frac{\\left(\\sum x\\right)^2}{n}$$",
      "$$\\sigma = \\sqrt{\\frac{S_{xx}}{n}} = \\sqrt{\\frac{\\sum x^2}{n} - \\bar{x}^2} \\qquad\\text{frequency table: } \\sigma = \\sqrt{\\frac{\\sum fx^2}{\\sum f} - \\bar{x}^2}$$",
      "Edexcel expects $\\sigma$ (divide by $n$). The spreadsheet/calculator $s = \\sqrt{\\frac{S_{xx}}{n - 1}}$ is also accepted, and mark schemes quote both values.",
      "The mnemonic: **\"mean of the squares minus the square of the mean\"**, then square-root."
    ] } },
    { callout: { t: "warn", h: "Three slips that cost the A mark", body: [
      "Squaring the **rounded** mean — keep $\\bar{x}$ in the calculator.",
      "Writing $\\frac{\\sum x^2}{n} - \\bar{x}^2$ and forgetting the square root (that is the variance).",
      "Using $\\left(\\sum x\\right)^2$ in place of $\\sum x^2$."
    ] } },
    { worked: { tag: "exam", title: "Mean and sd from summary statistics; north versus south", src: "A-level June 2022 · P3 Q3(b)(c) · 5 marks",
      q: "Dian uses the 31 days of August 2015 for Camborne: $n = 31$, $\\sum r = 174.9$, $\\sum r^2 = 3523.283$, where $r$ mm is the Daily Total Rainfall. **(b)** Calculate (i) the mean, (ii) the standard deviation. Dian believes that mean Daily Total Rainfall in August is less in the south of the UK than in the north. The mean for Leuchars in August 2015 is 1.72 mm. **(c)** State, giving a reason, whether this supports Dian's belief.",
      steps: [
        { h: "(b)(i)", m: "$\\mu = \\dfrac{174.9}{31} = 5.64$ mm", mk: "B1" },
        { h: "(b)(ii)", m: "$\\sigma = \\sqrt{\\dfrac{3523.283}{31} - 5.642^2} = \\sqrt{81.82} = 9.05$ mm", mk: "M1 A1", n: "$s = 9.19$ also accepted." },
        { h: "(c) Place the stations", m: "Leuchars is in the north (Scotland) and Camborne in the south (Cornwall).", mk: "M1" },
        { m: "Camborne's mean (5.64) is **larger** than Leuchars' (1.72), the opposite of Dian's belief — so no, this does not support it.", mk: "A1ft" }
      ], result: "(b) 5.64 mm, 9.05 mm (c) no — the southern station had more rain" } },
    { worked: { tag: "exam", title: "Which coach trained the winner? Spread decides", src: "A-level June 2025 · P3 Q2 · 5 marks",
      q: "Coach A trains 120 runners for the 400 m; their best times, $x$ seconds, give $\\sum x = 6612$ and $\\sum x^2 = 364\\,902$. **(a)** Calculate the mean. **(b)** Calculate the standard deviation. Coach B's 100 runners have mean 55.1 s and standard deviation 3.6 s. A race has equal numbers of the fastest runners from each coach. **(c)** State, giving a reason, which coach is more likely to have trained the winner.",
      steps: [
        { h: "(a)", m: "$\\bar{x} = \\dfrac{6612}{120} = 55.1$ s", mk: "B1" },
        { h: "(b)", m: "$\\sigma = \\sqrt{\\dfrac{364\\,902}{120} - 55.1^2} = \\sqrt{4.84} = 2.2$ s", mk: "M1 A1" },
        { h: "(c) Same mean, so compare spread", m: "**Coach B**: B's standard deviation (3.6) is greater than A's (2.2), so B's times are more spread out — B has more runners with extreme times, including the very fastest.", mk: "B1 dB1", n: "e.g. mean − 1 sd: A 52.9 s, B 51.5 s. The winner comes from the tail, not the middle." }
      ], result: "(a) 55.1 s (b) 2.2 s (c) coach B — larger spread, so more very fast runners" } },
    { worked: { tag: "exam", title: "IQR, mean and standard deviation from a box plot and summary statistics", src: "A-level June 2018 · P3 Q4(d)(e) · 4 marks",
      q: "Taruni asks all 95 members of a company their journey time, $x$ minutes. Her box plot has $Q_1 = 26$ and $Q_3 = 58$, and $\\sum x = 4133$, $\\sum x^2 = 202\\,294$. **(d)** Write down the interquartile range. **(e)** Calculate the mean and the standard deviation.",
      steps: [
        { h: "(d)", m: "$58 - 26 = 32$ minutes", mk: "B1" },
        { h: "(e) Mean", m: "$\\bar{x} = \\dfrac{4133}{95} = 43.5$ minutes", mk: "B1" },
        { h: "Standard deviation", m: "$\\sigma = \\sqrt{\\dfrac{202\\,294}{95} - 43.505^2} = \\sqrt{236.7} = 15.4$ minutes", mk: "M1 A1" }
      ], result: "IQR 32; $\\bar{x} = 43.5$, $\\sigma = 15.4$" } },

    /* ---------------------------------------------------------------- Page 4 */
    { page: "Coding" },
    "Coding replaces each value $x$ by $y = \\dfrac{x - a}{b}$ to make the arithmetic easier. You calculate with $y$ and then **decode**.",
    { callout: { t: "memorise", h: "What coding does to each measure", body: [
      "If $y = \\dfrac{x - a}{b}$ then $x = a + by$, and:",
      "$$\\bar{x} = a + b\\bar{y} \\qquad Q_x = a + bQ_y \\qquad \\sigma_x = |b|\\,\\sigma_y \\qquad \\sigma_x^2 = b^2\\sigma_y^2$$",
      "**Adding or subtracting** a constant moves every **location** measure (mean, median, quartiles, mode) and leaves every **spread** measure (range, IQR, sd) unchanged.",
      "**Multiplying or dividing** by a constant scales **both**."
    ] } },
    { fig: { x: [-4, 30], y: [0, 1.6], w: 520, h: 170, axes: { x: "", y: "", xt: [0, 5, 10, 15, 20, 25], yt: [] }, items: [
      { fn: "exp(-((x-4)^2)/4)", from: -2, to: 10, c: "accent", w: 2.2 }, { text: [4, 1.15], t: "y", size: 12, c: "accent", b: true },
      { fn: "exp(-((x-12)^2)/4)", from: 6, to: 18, c: "accent2", w: 2.2, dash: true }, { text: [12, 1.15], t: "y + 8: same shape, shifted", size: 11.5, c: "accent2" },
      { fn: "0.5*exp(-((x-20)^2)/16)", from: 10, to: 30, c: "accent3", w: 2.2 }, { text: [24, 0.75], t: "×2 then shifted: twice as wide", size: 11.5, c: "accent3" }
    ], cap: "A shift slides the distribution; a scaling stretches it." } },
    { worked: { tag: "exam", title: "Coded pressure: units, mean and standard deviation", src: "A-level Oct 2021 · P3 Q3(a)–(c) · 6 marks",
      q: "Stav codes the Daily Mean Pressure, $x$, for the 30 days of September 2015 at Hurn by $y = x - 1010$, and finds $\\sum y = 214$, $\\sum y^2 = 5912$. **(a)** State the units of $x$. **(b)** Find the mean Daily Mean Pressure. **(c)** Find its standard deviation.",
      steps: [
        { h: "(a)", m: "hPa (hectopascals).", mk: "B1", n: "\"Millibars\" is accepted; \"kPa\" or \"Pa\" is not." },
        { h: "(b) Mean of $y$, then decode", m: "$\\bar{y} = \\dfrac{214}{30} = 7.133$, so $\\bar{x} = 1010 + 7.133 = 1017$ hPa", mk: "M1 A1" },
        { h: "(c) Subtraction does not change spread", m: "$\\sigma_x = \\sigma_y$", mk: "M1" },
        { m: "$\\sigma_y = \\sqrt{\\dfrac{5912}{30} - 7.133^2} = \\sqrt{146.18} = 12.1$ hPa", mk: "M1 A1", n: "Adding 1010 to the sd at the end loses the A mark — the classic coding error." }
      ], result: "(a) hPa (b) 1017 hPa (c) 12.1 hPa" } },
    { worked: { tag: "example", title: "Coding with a scale factor, both directions", src: "practice variant",
      q: "Values of $x$ are coded by $y = \\dfrac{x - 200}{5}$. For the coded data $\\bar{y} = 3.2$ and $\\sigma_y = 1.4$. Find $\\bar{x}$ and $\\sigma_x$. Also, if $\\sum x = 6480$ for $n = 30$, what is $\\sum y$?",
      steps: [
        { h: "Decode the mean", m: "$x = 200 + 5y \\;\\Rightarrow\\; \\bar{x} = 200 + 5 \\times 3.2 = 216$" },
        { h: "Decode the sd", m: "$\\sigma_x = 5 \\times 1.4 = 7$" },
        { h: "Code a total", m: "$\\sum y = \\sum \\dfrac{x - 200}{5} = \\dfrac{\\sum x - 200n}{5} = \\dfrac{6480 - 6000}{5} = 96$", n: "The constant is subtracted **$n$ times** in a sum — the step most often missed." }
      ], result: "$\\bar{x} = 216$, $\\sigma_x = 7$, $\\sum y = 96$" } },

    /* ---------------------------------------------------------------- Page 5 */
    { page: "Choosing and changing" },
    { h: "5.1  Which pair to quote" },
    { table: { head: ["Data", "Quote", "Why"], rows: [
      ["Roughly symmetric, no outliers", "mean and standard deviation", "they use every value"],
      ["Skewed, or with outliers", "median and IQR", "not affected by extreme values"],
      ["Qualitative", "mode", "no order or arithmetic"]
    ] } },
    { worked: { tag: "exam", title: "Mean/sd or median/IQR? Which box-plot values change?", src: "A-level June 2018 · P3 Q4(f)(g) · 5 marks",
      q: "Taruni's journey-time box plot for 95 workers has lower whisker 20, $Q_1 = 26$, median 40, $Q_3 = 58$, upper whisker 92, and outliers plotted above the upper whisker. **(f)** State, giving a reason, whether you would recommend the mean and standard deviation or the median and IQR to describe these data. Two workers move house: Rana's journey changes from 75 to 35 minutes and David's from 60 to 33 minutes. Taruni redraws the box plot and only two values change. **(g)** Explain which two values changed and whether each increased or decreased.",
      steps: [
        { h: "(f) Outliers and skew", m: "There are outliers (and the data are positively skewed), which distort the mean and standard deviation —", mk: "B1" },
        { h: "", m: "— so use the median and IQR, which are not affected by extreme values.", mk: "dB1" },
        { h: "(g) What cannot change", m: "The minimum (20), $Q_1$ (26) and the outliers stay the same: both old and new journeys are above 26 and below the outliers.", mk: "B1" },
        { h: "What must change", m: "Two values move from above 40 and above 58 to below 40, so more than half the data are now below 40 and more than three-quarters below 58. The **median and the upper quartile both decrease**.", mk: "M1 A1" }
      ], result: "(f) median and IQR — outliers/skew (g) the median and $Q_3$, both lower" } },
    { h: "5.2  Adding values: what moves?" },
    { ul: [
      "A value **equal to the mean** leaves the mean unchanged and makes the standard deviation **smaller** (more data at zero distance).",
      "Two values **equally spaced either side of the mean** leave the mean unchanged; if both are within 1 sd of the mean, the sd decreases.",
      "Values **above the median** push the median up; the median moves at most one or two places for two new values."
    ] },
    { worked: { tag: "exam", title: "Two new times that keep the mean and raise the median", src: "A-level Oct 2020 · P3 Q3(f)(g) · 4 marks",
      q: "For 27 puzzle times the median is 20 minutes, the mean is 22.5 and the standard deviation is 12.1. Adam and Beth take $a$ and $b$ minutes, $a > b$. Including their times, the median increases and the mean does not change. **(f)** Suggest possible values of $a$ and $b$, explaining how they satisfy the conditions. **(g)** Without further calculation, explain why the standard deviation of all 29 times is lower than 12.1.",
      steps: [
        { h: "(f) Median up", m: "Both new values must be above the median: $a, b > 20$.", mk: "M1" },
        { h: "Mean unchanged", m: "Their mean must equal 22.5: $a + b = 45$.", mk: "M1" },
        { h: "A pair", m: "e.g. $b = 21$, $a = 24$: both above 20, and $21 + 24 = 45$.", mk: "A1" },
        { h: "(g)", m: "Both new values are less than 1 standard deviation (12.1) from the mean, so they add little to the total of squared deviations while increasing $n$ — the sd falls.", mk: "B1" }
      ], result: "(f) e.g. $a = 24$, $b = 21$ (g) both within 1 sd of the mean" } },
    { worked: { tag: "exam", title: "LDS: only May–October — what does it do to an annual estimate?", src: "A-level June 2023 · P3 Q3(b)(c) · 5 marks",
      q: "Ben uses all 184 values of Daily Total Rainfall, $x$ mm, for Leeming in 1987 (May–October) and estimates $\\sum x = 390$, $\\sum x^2 = 4336$. **(b)** Calculate estimates for (i) the mean, (ii) the standard deviation. Ben suggests using the mean to estimate the annual mean Daily Total Rainfall for Leeming in 1987. **(c)** Using your knowledge of the large data set, (i) give a reason why these data would not be suitable, (ii) state, giving a reason, how you would expect the estimate to differ from the actual annual mean.",
      steps: [
        { h: "(b)(i)", m: "$\\bar{x} = \\dfrac{390}{184} = 2.12$ mm", mk: "B1" },
        { h: "(b)(ii)", m: "$\\sigma = \\sqrt{\\dfrac{4336}{184} - 2.12^2} = \\sqrt{19.07} = 4.37$ mm", mk: "M1 A1" },
        { h: "(c)(i)", m: "The data only cover May to October, so they are not representative of the whole year.", mk: "B1" },
        { h: "(c)(ii)", m: "The missing winter months would be expected to have more rain, so the estimate is likely to be an **underestimate**.", mk: "B1", n: "Three ideas: missing months are winter; winter is wetter; so the estimate is too low." }
      ], result: "(b) 2.12 mm, 4.37 mm (c) May–Oct only; underestimate (wetter winter missing)" } },

    /* ---------------------------------------------------------------- Page 6 */
    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Calculate** the standard deviation", "the expression with values substituted, including the square root, then the number"],
      ["**Estimate** the mean / sd", "grouped data with midpoints — the answer is an estimate"],
      ["**Use linear interpolation**", "the fraction-of-a-class line written out"],
      ["**State the effect** on the mean / sd", "the effect (increase, decrease, no change) and *why*"],
      ["**Comment on** / **compare**", "a numerical comparison and its meaning in context"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**M1 for the expression**: $\\sqrt{\\frac{\\sum x^2}{n} - \\bar{x}^2}$ with the numbers in. A bare answer that is wrong scores 0.",
      "**$\\sigma$ or $s$** — both accepted; quote enough figures (3 s.f.).",
      "**Decoding**: the mean takes $+a$ and $\\times b$; the sd only $\\times b$.",
      "**Interpolation fraction**: $\\frac{\\text{position} - \\text{cf before}}{\\text{class frequency}}$, times the **width**.",
      "**Units** on every final answer in context."
    ] },
    { h: "Misconceptions" },
    { ul: [
      "\"Adding 1010 to every value adds 1010 to the sd.\"",
      "\"A grouped mean is exact.\" It is an estimate (midpoint assumption).",
      "\"n/a counts as 0.\" It is missing data — leave it out and reduce $n$.",
      "\"The mean is always the best average.\" Not with outliers or skew."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["1-variable statistics", "**Statistics → 1-Variable**; with Frequency on, enter $x$ and $f$. **Calc → 1-Variable Results**: $\\bar{x}$, $\\sum x$, $\\sum x^2$, $\\sigma_x$, $s_x$, $n$, min, $Q_1$, Med, $Q_3$, max."],
      ["Caution with quartiles", "The calculator's $Q_1$ and $Q_3$ use a different rule from Edexcel's for raw data — use the $\\frac{n}{4}$ rule by hand."]
    ] },
    { callout: { t: "mnemonic", h: "\"Mean of squares minus square of mean\"", body: "$\\sigma^2 = \\frac{\\sum x^2}{n} - \\bar{x}^2$ — then root." } }
  ],
  flashcards: [
    ["Edexcel rule for the median of $n$ raw values?", "$\\frac{n}{2}$: not whole → round up; whole → mean of that and the next value."],
    ["Median position for 27 values?", "13.5 → the 14th value."],
    ["$Q_1$ and $Q_3$ positions for 27 values?", "6.75 → 7th; 20.25 → 21st."],
    ["Interpolation formula?", "$L + \\frac{\\text{position} - \\text{cf before}}{f_{\\text{class}}} \\times \\text{width}$."],
    ["Assumption behind interpolation / midpoints?", "Values are spread evenly through each class."],
    ["$S_{xx}$?", "$\\sum x^2 - \\frac{(\\sum x)^2}{n}$; $\\sigma = \\sqrt{S_{xx}/n}$.", 6],
    ["$n = 120$, $\\sum x = 6612$, $\\sum x^2 = 364\\,902$: $\\bar{x}$, $\\sigma$?", "55.1, 2.2.", 7],
    ["$y = \\frac{x - a}{b}$: $\\bar{x}$ and $\\sigma_x$?", "$\\bar{x} = a + b\\bar{y}$; $\\sigma_x = |b|\\sigma_y$.", 8],
    ["Effect of adding a constant to every value?", "Location measures shift by it; spread unchanged.", 9],
    ["Effect of doubling every value?", "Location and spread both double; variance ×4.", 10],
    ["Mean/sd or median/IQR for skewed data with outliers?", "Median and IQR — unaffected by extreme values.", 11],
    ["Two values added with sum $2\\bar{x}$, both within 1 sd of the mean?", "Mean unchanged; sd decreases.", 12],
    ["Why might an LDS-based annual rainfall mean be too low?", "The LDS has May–Oct only; winter months (wetter) are missing.", 13],
    ["Most LDS rainfall in the first class is 0. Effect on the midpoint estimate of the mean?", "Actual mean is smaller than the estimate.", 14]
  ],
  quiz: [
    { q: "$n = 30$, $\\sum y = 214$, $\\sum y^2 = 5912$, $x = y + 1010$. $\\sigma_x =$", opts: ["12.1", "1022.1", "7.13", "146"], ans: 0, why: "Shift leaves sd unchanged; 146 is the variance." },
    { q: "Coded $y = (t - 15)/2$, median of $y$ is 9. Median of $t$ is", opts: ["33", "18", "24", "−3"], ans: 0, why: "$t = 2y + 15$." },
    { q: "Interpolate the median of 30 values in class 5–10 with 3 below and 15 in it:", opts: ["9", "8", "7.5", "10"], ans: 0, why: "$5 + \\frac{12}{15} \\times 5$." },
    { q: "A grouped mean is an estimate because", opts: ["midpoints stand in for the values", "the sample is small", "of rounding", "of outliers"], ans: 0, why: "Midpoint assumption." },
    { q: "The variance of data with $\\sigma = 3$ after multiplying by 2 is", opts: ["36", "12", "6", "18"], ans: 0, why: "$(2 \\times 3)^2$." },
    { q: "For data with extreme outliers the best measure of spread is", opts: ["IQR", "range", "sd", "variance"], ans: 0, why: "Resistant to extremes." }
  ]
};

/* =====================================================================
   S2.4  Outliers, cleaning data, selecting and critiquing presentation
   ===================================================================== */
C["maths:S2.4"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Outliers and cleaning data — the whole topic on one page" },
    "Spec 2.4 has three strands:",
    { ul: [
      "**Recognise and interpret outliers** in data sets and diagrams. The rule is always given in the question — $Q_1 - 1.5 \\times \\text{IQR}$ and $Q_3 + 1.5 \\times \\text{IQR}$, or mean $\\pm 3$ standard deviations, or another $k$.",
      "**Clean data** — deal with missing values, errors and outliers before calculating.",
      "**Select or critique** a data presentation for a statistical problem."
    ] },
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Show that a value is an outlier (find the fence, compare)", "2", "AS Specimen Q3, AS 2020 Q2, AS 2025 Q2"],
      ["Is the oldest/largest value an outlier?", "2", "AS Nov 2021 Q2"],
      ["Outliers by a standard-deviation rule", "1", "A-level Oct 2020 Q3"],
      ["Complete a box plot once outliers are known", "1", "AS June 2025 Q2"],
      ["Effect of removing outliers on correlation", "1", "AS Specimen Q3"],
      ["Clean LDS data: tr, n/a, impossible values", "1–2", "AS 2019, AS 2024, A-level 2023, 2025"],
      ["Effect of correcting a recording error on the sd", "2", "AS June 2020 Q4"]
    ] } },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "Outliers" },
    { callout: { t: "def", h: "Outlier", body: "A value that is **very different from the rest of the data** — far outside the main body. It is identified by a stated rule, never by eye alone." } },
    { callout: { t: "formula", h: "The usual rules (the question gives the one to use)", body: [
      "$$\\text{outlier if } x < Q_1 - 1.5 \\times \\text{IQR} \\quad\\text{or}\\quad x > Q_3 + 1.5 \\times \\text{IQR}$$",
      "$$\\text{or: outlier if } x > \\bar{x} + 3\\sigma \\quad\\text{or}\\quad x < \\bar{x} - 3\\sigma$$",
      "The values $Q_1 - 1.5\\,\\text{IQR}$ and $Q_3 + 1.5\\,\\text{IQR}$ are called the **fences** (or limits). Work them out, then compare — the comparison is the A mark."
    ] } },
    { fig: { x: [-10, 120], y: [0, 2], w: 520, h: 140, axes: { x: "age (years)", y: "", xt: [0, 20, 40, 60, 80, 100], yt: [] },
      items: box(1.05, 0.3, [0, 27.3, 44.9, 58.9, 89], [], "accent").concat([
        { vline: 106.3, label: "upper fence 106.3", c: "danger" },
        { text: [89, 1.55], t: "oldest < 90", size: 11, c: "text2" }]),
      cap: "Airline passengers (AS Nov 2021): $Q_3 + 1.5\\,\\text{IQR} = 106.3$. Nobody is 90 or over, so the oldest passenger cannot be an outlier." } },
    { worked: { tag: "exam", title: "Could the oldest passenger be an outlier?", src: "AS Nov 2021 · P2 Q2(c) · 2 marks",
      q: "There were no passengers aged 90 or over. An outlier is a value greater than $Q_3 + 1.5 \\times$ interquartile range. Given that $Q_1 = 27.3$ and $Q_3 = 58.9$, determine, giving a reason, whether or not the oldest passenger could be an outlier.",
      steps: [
        { h: "The fence", m: "$58.9 + 1.5 \\times (58.9 - 27.3) = 58.9 + 47.4 = 106.3$", mk: "M1" },
        { h: "Compare", m: "Every passenger is under 90 < 106.3, so the oldest passenger is **not** an outlier.", mk: "A1" }
      ], result: "Not an outlier: upper limit 106.3 > 90" } },
    { worked: { tag: "exam", title: "Show three points are outliers; the effect on correlation; is the sample random?", src: "AS Specimen · P2 Q3(a)–(c) · 4 marks",
      q: "Pete takes a sample of 12 days from the large data set for Perth 2015, recording daily mean pressure $p$ hPa and daily rainfall $w$ mm: $p$ = 1007, 1012, 1013, 1009, 1019, 1010, 1010, 1010, 1013, 1011, 1014, 1022 and $w$ = 102.0, 63.0, 63.0, 38.4, 38.0, 35.0, 34.2, 32.0, 30.4, 28.0, 28.0, 15. For $p$: $Q_1 = 1010$, $Q_3 = 1013.5$; for $w$: $Q_1 = 29.2$, $Q_3 = 50.7$. An outlier is more than $1.5 \\times$ IQR above $Q_3$ or below $Q_1$. **(a)** Show that the points (1019, 38.0), (1022, 15) and (1007, 102.0) are outliers. **(b)** Describe the effect of removing these 3 outliers on the correlation. **(c)** From your knowledge of the large data set, explain why Pete's sample is unlikely to be random.",
      steps: [
        { h: "(a) Pressure fences", m: "IQR $= 3.5$: $\\; 1010 - 5.25 = 1004.75$, $\\; 1013.5 + 5.25 = 1018.75$\nso $p = 1019$ and $p = 1022$ are outliers.", mk: "M1" },
        { h: "Rainfall fences", m: "IQR $= 21.5$: $\\; 29.2 - 32.25 = -3.05$, $\\; 50.7 + 32.25 = 82.95$\nso $w = 102.0$ is an outlier.", mk: "A1",
          fig: { x: [1004, 1024], y: [0, 110], w: 440, h: 220, axes: { x: "p (hPa)", y: "w (mm)", xt: [1005, 1010, 1015, 1020], yt: [20, 40, 60, 80, 100] }, items: [].concat(
            pts([1012, 1013, 1009, 1010, 1010, 1010, 1013, 1011, 1014], [63, 63, 38.4, 35, 34.2, 32, 30.4, 28, 28], "accent"),
            [{ pt: [1019, 38], c: "danger", r: 4.5, open: true }, { pt: [1022, 15], c: "danger", r: 4.5, open: true }, { pt: [1007, 102], c: "danger", r: 4.5, open: true },
             { vline: 1018.75, c: "danger" }, { hline: 82.95, c: "danger" }]) } },
        { h: "(b)", m: "With the outliers the correlation is negative ($r \\approx -0.50$); without them there is essentially no correlation ($r \\approx 0.20$, weak).", mk: "B1", n: "Three points created the whole pattern — a reason to look before trusting $r$." },
        { h: "(c)", m: "Perth has many days with no rain in the LDS, but every rainfall in the sample is large — a random sample would be expected to include some zeros.", mk: "B1" }
      ], result: "(a) fences 1018.75 and 82.95 (b) negative → no correlation (c) no dry days in the sample" } },
    { worked: { tag: "exam", title: "Show a visibility value is an outlier; interpret; name the hidden variable", src: "AS June 2020 · P2 Q2(b)–(d) · 3 marks",
      q: "For Camborne, June 1987, Daily Mean Visibility has $Q_1 = 1100$ and IQR $= 1600$. An outlier is more than $1.5 \\times$ IQR above $Q_3$. **(b)** Show that the circled point, visibility 5300 (at humidity 90%), is an outlier. **(c)** The scatter diagram of visibility against Daily Maximum Relative Humidity shows a downward trend; interpret the correlation. **(d)** A second scatter diagram plots visibility against an unlabelled variable whose values run from 0 to about 14 in steps of 0.1. Using your knowledge of the large data set, suggest the variable.",
      steps: [
        { h: "(b) The upper fence", m: "$Q_3 = 1100 + 1600 = 2700$; $\\; 2700 + 1.5 \\times 1600 = 5100$", mk: "M1" },
        { m: "$5300 > 5100$, so it is an outlier.", mk: "A1" },
        { h: "(c)", m: "As humidity increases, mean visibility decreases.", mk: "B1" },
        { h: "(d) Values 0–14 to one decimal place in June", m: "Daily Total Sunshine (hours).", mk: "B1", n: "Not cloud cover (whole numbers up to 8), not windspeed (whole numbers), not temperature (near 0 °C is unlikely in June)." }
      ], result: "(b) 5300 > 5100 (c) more humid, less visibility (d) hours of sunshine" } },
    { worked: { tag: "exam", title: "An outlier below $Q_1$, then complete the box plot", src: "AS June 2025 · P2 Q2(b) · 3 marks",
      q: "A box plot of Daily Mean Pressure for Light days at Perth in 2015 has $Q_1 = 1018$ and $Q_3 = 1025$, but the lower whisker is missing. The three smallest values are 1007, 1009 and 1010 hPa. An outlier is any value more than $1.5 \\times$ IQR below $Q_1$. (i) Determine whether there are any outliers below $Q_1$. (ii) Hence complete the box plot.",
      steps: [
        { h: "(i) The lower fence", m: "$1018 - 1.5 \\times (1025 - 1018) = 1018 - 10.5 = 1007.5$", mk: "M1" },
        { m: "$1007 < 1007.5$: 1007 is an outlier (and the only one, since $1009 > 1007.5$).", mk: "A1", n: "\"1007\" with no fence calculated is M0 A0." },
        { h: "(ii)", m: "Lower whisker to 1009 (the smallest non-outlier); a cross at 1007.", mk: "B1ft",
          fig: { x: [1004, 1036], y: [0, 2], w: 460, h: 120, axes: { x: "hPa", y: "", xt: [1005, 1010, 1015, 1020, 1025, 1030, 1035], yt: [] }, items: box(1, 0.35, [1009, 1018, 1022, 1025, 1034], [1007], "accent") } }
      ], result: "(i) 1007 is an outlier (fence 1007.5) (ii) whisker to 1009, × at 1007" } },
    { h: "1.2  What to do with an outlier" },
    { table: { head: ["It is…", "Then", "Example"], rows: [
      ["an **error** (impossible or mis-recorded)", "**remove** it (or correct it, if the true value is known)", "a wind bearing of 999; a 400-year-old passenger"],
      ["a **genuine extreme value**", "**keep** it — it is real information; consider reporting median and IQR instead of mean and sd", "the Great Storm's gusts in October 1987"],
      ["**from a different population**", "analyse separately", "Jacksonville's rainfall in a UK study"]
    ] } },
    { callout: { t: "warn", h: "\"Remove the outliers\" is not automatic", body: [
      "An outlier is only removed when there is a reason to think it is an error, or it belongs to a different population.",
      "Removing real extremes makes the data look tidier than the world is."
    ] } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Cleaning data" },
    "**Cleaning** means getting the data into a state where calculations are valid. In Edexcel questions it nearly always means one of these:",
    { table: { head: ["Problem", "What to do", "Exam wording that scores"], rows: [
      ["**tr** in LDS rainfall", "replace with a number in $[0, 0.05]$ — 0, 0.025 or 0.05", "\"tr must be replaced by a numerical value such as 0.025\""],
      ["**n/a** (missing)", "leave the value out; reduce $n$", "\"remove the n/a days; $n$ = number of real values\""],
      ["**Impossible values**", "remove (or correct)", "\"a bearing must be 0–360, so 999 is an error and should be removed\""],
      ["**Units or variable mixed up**", "check against the LDS's units and ranges", "\"a mean of 5.3 with sd 12.4 is rainfall, not temperature\""],
      ["**Transposed digits / typos**", "correct, and say what the correction does", "\"2.3 → 3.2 stays in the same class, so no effect\""]
    ] } },
    { worked: { tag: "exam", title: "Clean trace values; mean and sd of LDS rainfall", src: "A-level June 2023 · P3 Q3(a) · 2 marks",
      q: "Ben summarises the Daily Total Rainfall for Leeming in 1987 from the large data set. The table includes 55 days of 0 mm and 29 days recorded as \"tr\". Explain how the data will need to be cleaned before Ben can calculate statistics such as the mean and standard deviation.",
      steps: [
        { h: "Name the problem", m: "The 29 \"tr\" entries are not numbers and must be replaced by a numerical value —", mk: "M1", n: "\"Ignore the tr values\" or \"remove outliers\" scores M0: the values must be *replaced*." },
        { h: "Choose a sensible value", m: "— a trace is between 0 and 0.05 mm, so use e.g. 0.025 (or 0).", mk: "A1" }
      ], result: "Replace each tr by a value in [0, 0.05], e.g. 0.025" } },
    { worked: { tag: "exam", title: "Correcting two recording errors — effect on a grouped sd", src: "AS June 2020 · P2 Q4(c)(d) · 4 marks",
      q: "Tim's carp weights, $w$ kg, are grouped as $2 \\le w < 3.5$ (8), $3.5 \\le w < 4$ (32), $4 \\le w < 4.5$ (64), $4.5 \\le w < 5$ (40), $5 \\le w < 6$ (16), with $\\sum fm = 692$ and $\\sum fm^2 = 3053$. **(c)** Calculate an estimate of the standard deviation. Tim realises he recorded 2.3 instead of 3.2, and 4.6 instead of 6.4. **(d)** Without calculating a new estimate, state what effect (i) correcting 2.3 to 3.2, (ii) correcting 4.6 to 6.4 would have on the estimated standard deviation. Give a reason for each.",
      steps: [
        { h: "(c)", m: "$\\sigma = \\sqrt{\\dfrac{3053}{160} - \\left(\\dfrac{692}{160}\\right)^2} = 0.613$ kg", mk: "M1 A1", n: "$s = 0.615$ accepted." },
        { h: "(d)(i) Same class?", m: "No effect: 2.3 and 3.2 are both in the class $2 \\le w < 3.5$, so the grouped table — and the estimate — does not change.", mk: "B1" },
        { h: "(d)(ii) A value moves to the extreme", m: "It would **increase** the sd: 6.4 lies beyond the top class, much further from the mean (≈4.3) than 4.6, while the mean barely changes.", mk: "B1" }
      ], result: "(c) 0.613 kg (d)(i) no effect — same class (ii) increase — new value far from the mean" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Selecting and critiquing presentation" },
    { h: "3.1  Which diagram for which data?" },
    { table: { head: ["Data", "Good choice", "Why"], rows: [
      ["Qualitative (wind direction, Beaufort category)", "bar chart, pie chart", "categories, no numerical scale"],
      ["Discrete, few values", "vertical line / bar chart", "each value separate"],
      ["Continuous, grouped (unequal widths)", "**histogram**", "area shows frequency"],
      ["Comparing two or more distributions", "**box plots** on one scale; frequency polygons", "medians and spreads side by side"],
      ["Estimating medians and quartiles from grouped data", "**cumulative frequency** diagram", "read at $\\frac{n}{4}$, $\\frac{n}{2}$, $\\frac{3n}{4}$"],
      ["Two quantitative variables", "**scatter diagram**", "shows correlation and outliers in two dimensions"]
    ] } },
    { h: "3.2  Critiques that score" },
    { ul: [
      "**A bar chart for unequal classes** exaggerates the wide classes — use a histogram.",
      "**A box plot hides the shape inside the box** (two peaks look like one) and the sample size.",
      "**A scatter diagram of two groups** may show a trend neither group has — separate them (S2.2).",
      "**A qualitative variable on a linear axis** is meaningless (Beaufort descriptions are not numbers).",
      "**A truncated vertical axis** makes small differences look large."
    ] },
    { worked: { tag: "variation", title: "Choose and justify a diagram", src: "practice variant",
      q: "A student wants to compare the Daily Mean Temperature at Leuchars and at Camborne in summer 2015 using the large data set. Suggest a suitable diagram, and give one advantage over drawing two histograms.",
      steps: [
        { h: "Choose", m: "Two box plots drawn on the same scale (or two frequency polygons on one grid)." },
        { h: "Justify", m: "They let the medians and IQRs — location and spread — be compared directly, and any outliers are marked." }
      ], result: "Comparative box plots on a common scale" } },

    /* ---------------------------------------------------------------- Page 4 */
    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Show that** … is an outlier", "the fence calculated, and the value compared with it"],
      ["**Determine whether**", "the same, with a conclusion either way"],
      ["**Explain how the data need to be cleaned**", "the specific problem (tr, n/a, impossible value) and the specific action"],
      ["**State the effect** of a correction / removal", "increase, decrease or no effect — with the reason"],
      ["**Complete the box plot**", "whisker to the last non-outlier, outliers marked"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Write the fence as a number** (5100, 1007.5) before comparing.",
      "**Both fences** when the question says \"outliers\" without a direction.",
      "**Whisker to the next value in**, not to the fence (though the fence is often condoned).",
      "**Replace tr, exclude n/a, remove impossible values** — and say which is which."
    ] },
    { h: "Misconceptions" },
    { ul: [
      "\"Outliers are always errors.\"",
      "\"The whisker goes to the fence.\"",
      "\"Removing outliers always strengthens correlation\" — it can remove it (AS Specimen).",
      "\"Any value far away is an outlier\" — only by the stated rule."
    ] },
    { callout: { t: "mnemonic", h: "\"Fence, then compare, then conclude\"", body: "Three moves: compute the limit, compare the value, say outlier or not." } }
  ],
  flashcards: [
    ["Usual outlier rule with quartiles?", "Below $Q_1 - 1.5\\,\\text{IQR}$ or above $Q_3 + 1.5\\,\\text{IQR}$."],
    ["Usual outlier rule with the sd?", "More than $3\\sigma$ (or the given $k\\sigma$) from the mean."],
    ["$Q_1 = 27.3$, $Q_3 = 58.9$: upper fence?", "$58.9 + 1.5 \\times 31.6 = 106.3$."],
    ["$Q_1 = 1018$, $Q_3 = 1025$: lower fence?", "$1018 - 10.5 = 1007.5$."],
    ["Where does the whisker go when there is an outlier?", "To the most extreme value that is not an outlier."],
    ["An outlier is a recording error. Do what?", "Remove (or correct) it."],
    ["An outlier is a genuine extreme. Do what?", "Keep it; consider median and IQR."],
    ["LDS 'tr' — cleaning?", "Replace with a value in $[0, 0.05]$, e.g. 0.025."],
    ["LDS 'n/a' — cleaning?", "Exclude the value and reduce $n$."],
    ["Wind bearing 999 — cleaning?", "Impossible (must be 0–360): remove it."],
    ["Correcting 2.3 to 3.2 in class $2 \\le w < 3.5$: effect on grouped sd?", "None — same class."],
    ["Which diagram compares two distributions best?", "Box plots on a common scale (or frequency polygons)."],
    ["Why not a bar chart for unequal class widths?", "Heights misrepresent frequency; a histogram uses area."]
  ],
  quiz: [
    { q: "$Q_1 = 10$, $Q_3 = 22$. Using 1.5×IQR, which value is an outlier?", opts: ["41", "38", "−7", "0"], ans: 0, why: "Upper fence $22 + 18 = 40$." },
    { q: "LDS rainfall shows 'tr'. Before finding a mean you should", opts: ["replace it by a value in [0, 0.05]", "delete the day", "treat it as n/a", "replace it by the mean"], ans: 0, why: "Trace is a real small amount." },
    { q: "Removing a genuine extreme value", opts: ["can misrepresent the data", "is always correct", "never changes the mean", "increases the sd"], ans: 0, why: "Only errors should go." },
    { q: "Best diagram for two continuous variables:", opts: ["scatter diagram", "histogram", "pie chart", "box plot"], ans: 0, why: "Bivariate." },
    { q: "Mean 22.5, sd 12.1; outlier if > mean + 3 sd. Is 46 an outlier?", opts: ["no", "yes", "only by IQR rule", "cannot tell"], ans: 0, why: "Limit 58.8." }
  ]
};


/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
