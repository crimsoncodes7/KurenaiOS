/* Kurenai OS — deep content: Statistics, section S4 (Statistical
   distributions) at full A-level depth. Each topic here REPLACES the
   outline entry the base file used to carry: every question shape Edexcel
   has set on discrete distributions and the binomial, the Normal
   distribution (including the Normal approximation to the binomial) and
   choosing a distribution (9MA0 Paper 3 Section A, 8MA0 Paper 2 Section A,
   June 2018–2025, the Oct/Nov 2020–21 series and the Specimens) is
   explained and then worked through with Edexcel M1/A1/B1 marks, in the
   notation of the Mathematical Formulae and Statistical Tables booklet.
   Past-paper item banks stay in bank-maths-stats.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---- figure helpers ---- */

/* a Normal curve N(mu, sd^2) on data axes, with shaded intervals
   sh = [[from, to, colour]] and vertical marks vl = [[x, label]] */
function normFig(mu, sd, sh, vl, o) {
  o = o || {};
  var f = "exp(-((x-(" + mu + "))^2)/(2*" + sd + "^2))";
  var lo = mu - 3.6 * sd, hi = mu + 3.6 * sd, items = [];
  (sh || []).forEach(function (s) {
    items.push({ shade: { fn: f, from: Math.max(lo, s[0]), to: Math.min(hi, s[1]) }, c: s[2] || "accent2", alpha: 0.4 });
  });
  items.push({ fn: f, from: lo, to: hi, c: "accent", w: 2.2 });
  (vl || []).forEach(function (v) { items.push({ vline: v[0], label: v[1], c: v[2] || "text2" }); });
  return { x: [lo, hi], y: [0, 1.15], w: o.w || 480, h: o.h || 200,
    axes: { x: o.xl || "x", y: "", xt: o.xt || [mu - 2 * sd, mu - sd, mu, mu + sd, mu + 2 * sd], yt: [] },
    items: items.concat(o.extra || []), cap: o.cap };
}
/* a probability-distribution bar chart: values xs, probabilities ps */
function pmfFig(xs, ps, o) {
  o = o || {};
  var top = Math.max.apply(null, ps) * 1.2, items = xs.map(function (x, i) {
    var hl = o.hl && o.hl.indexOf(x) >= 0;
    return { line: [[x, 0], [x, ps[i]]], c: hl ? "accent2" : "accent", w: o.bw || 6 };
  });
  return { x: [xs[0] - 1, xs[xs.length - 1] + 1], y: [0, top], w: o.w || 480, h: o.h || 200,
    axes: { x: o.xl || "x", y: o.yl || "P(X = x)", xt: o.xt || xs, yt: o.yt },
    items: items.concat(o.extra || []), cap: o.cap };
}
/* binomial probabilities, used only to draw */
function binomPs(n, p) {
  var out = [], c = 1;
  for (var r = 0; r <= n; r++) {
    if (r > 0) c = c * (n - r + 1) / r;
    out.push(c * Math.pow(p, r) * Math.pow(1 - p, n - r));
  }
  return out;
}
function range(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }

/* =====================================================================
   S4.1  Discrete distributions and the binomial distribution
   ===================================================================== */
C["maths:S4.1"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Discrete distributions and the binomial — the whole topic on one page" },
    "Spec 4.1: understand and use **simple discrete probability distributions**, including the **binomial** as a model; calculate binomial probabilities; know and identify the **discrete uniform** distribution. (Mean and variance of a general discrete random variable are excluded.)",
    "In practice this is the most frequently examined topic in Statistics:",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Binomial probabilities: $P(X = r)$, $P(X \\le r)$, $P(X > r)$, $P(a \\le X < b)$", "1–3", "every series"],
      ["State a binomial model / its conditions in context", "1–2", "AS Nov 2021 Q4, A-level 2018 Q3, 2023 Q2"],
      ["Binomial of a binomial: a probability becomes the $p$ of a second model", "2–4", "AS 2020 Q5, A-level Specimen Q3, Oct 2021 Q1, 2023 Q2, 2024 Q1"],
      ["Find $k$ in a probability distribution (sum to 1)", "2–5", "AS 2018 Q5, AS 2020 Q3, A-level Oct 2020 Q4, Oct 2021 Q6, 2025 Q6"],
      ["Distribution of a count from draws (without replacement)", "5", "AS June 2023 Q5"],
      ["Sums of two independent observations", "3–6", "AS 2020 Q3, AS 2022 Q5, A-level Oct 2020 Q4, Oct 2021 Q6"],
      ["Stopping rules and \"first success\" distributions", "2–8", "AS 2024 Q5, A-level 2018 Q3"],
      ["Name the distribution: discrete uniform", "1", "AS June 2019 Q3"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**Discrete random variables** — tables, probability functions, sum to 1, finding constants.",
      "**Combining and stopping** — two observations, sums, stopping rules, draws without replacement.",
      "**The discrete uniform distribution**.",
      "**The binomial distribution** — conditions, the formula, cumulative probabilities and the inequality translations.",
      "**Binomial in context** — models of models, expected values, assumptions.",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "Discrete random variables" },
    { kv: [
      ["Random variable", "A quantity whose value depends on chance, written with a capital letter: $X$ = the score on a spin."],
      ["Discrete", "It takes separate (countable) values: 1, 2, 3 …"],
      ["Probability distribution", "Every value $x$ with its probability $P(X = x)$ — as a **table** or a **probability function**."],
      ["The rule", "$\\displaystyle\\sum P(X = x) = 1$, and each $0 \\le P(X = x) \\le 1$."]
    ] },
    { fig: pmfFig([1, 2, 3, 4], [0.15, 0.35, 0.15, 0.35], { yt: [0.1, 0.2, 0.3], cap: "A biased spinner (AS June 2018): $P(X = r) = P(X = r + 2)$ and $P(X = 2) = 0.35$ force this distribution." }) },
    { worked: { tag: "exam", title: "A distribution from two facts; then an inequality in $X$", src: "AS June 2018 · P2 Q5(a)(c) · 5 marks",
      q: "A biased spinner lands on 1, 2, 3 or 4. $X$ is the number it lands on, with $P(X = r) = P(X = r + 2)$ for $r = 1, 2$, and $P(X = 2) = 0.35$. **(a)** Find the complete probability distribution of $X$. The random variable $Y = \\dfrac{12}{X}$. **(c)** Find $P(Y - X \\le 4)$.",
      steps: [
        { h: "(a) Use each fact", m: "$P(X = 4) = P(X = 2) = 0.35$; $\\quad P(X = 1) = P(X = 3)$ and they share $1 - 0.7 = 0.3$", mk: "M1" },
        { m: "$x$: 1, 2, 3, 4 with $P(X = x)$: 0.15, 0.35, 0.15, 0.35", mk: "A1" },
        { h: "(c) Turn the event into an inequality in $X$", m: "$\\dfrac{12}{X} - X \\le 4 \\;\\Rightarrow\\; 12 - X^2 \\le 4X$ (as $X > 0$) $\\;\\Rightarrow\\; X^2 + 4X - 12 \\ge 0$", mk: "M1" },
        { m: "$(X + 6)(X - 2) \\ge 0 \\;\\Rightarrow\\; X \\ge 2$", mk: "M1", n: "Or tabulate: $Y - X$ is 11, 4, 1, −1 for $X = 1, 2, 3, 4$." },
        { m: "$P(X \\ge 2) = 0.35 + 0.15 + 0.35 = 0.85$", mk: "A1" }
      ], result: "(a) 0.15, 0.35, 0.15, 0.35 (c) 0.85" } },
    { worked: { tag: "exam", title: "A probability function $\\frac{k}{d}$; a sum of two; an arithmetic sequence", src: "A-level Oct 2020 · P3 Q4 · 10 marks",
      q: "$D$ takes the values 10, 20, 30, 40, 50 with $P(D = d) = \\dfrac{k}{d}$. **(a)** Show that $k = \\dfrac{600}{137}$. $D_1$ and $D_2$ are independent, each distributed as $D$. **(b)** Find $P(D_1 + D_2 = 80)$ to 3 s.f. A single observation $d$ of $D$ is the common difference of an arithmetic sequence whose first 4 terms are the angles, in degrees, of a quadrilateral $Q$. **(c)** Find the exact probability that the smallest angle of $Q$ is more than 50°.",
      steps: [
        { h: "(a) Sum to 1", m: "$k\\left(\\dfrac{1}{10} + \\dfrac{1}{20} + \\dfrac{1}{30} + \\dfrac{1}{40} + \\dfrac{1}{50}\\right) = k \\times \\dfrac{60 + 30 + 20 + 15 + 12}{600} = \\dfrac{137k}{600} = 1$", mk: "M1" },
        { m: "$k = \\dfrac{600}{137}$", mk: "A1*" },
        { h: "(b) Pairs that make 80", m: "$(30, 50)$, $(50, 30)$, $(40, 40)$. $\\; P(30) = \\dfrac{20}{137}$, $P(40) = \\dfrac{15}{137}$, $P(50) = \\dfrac{12}{137}$", mk: "M1" },
        { m: "$2 \\times \\dfrac{20}{137} \\times \\dfrac{12}{137} + \\left(\\dfrac{15}{137}\\right)^2 = \\dfrac{480 + 225}{18\\,769} = 0.0376$", mk: "M1 A1", n: "Both orders of (30, 50) count; (40, 40) only once." },
        { h: "(c) The angles", m: "$a + (a + d) + (a + 2d) + (a + 3d) = 360 \\;\\Rightarrow\\; 4a + 6d = 360 \\;\\Rightarrow\\; a = 90 - 1.5d$", mk: "M1 A1" },
        { h: "Smallest angle $a > 50$", m: "$90 - 1.5d > 50 \\;\\Rightarrow\\; d < 26.7$, so $d = 10$ or $20$", mk: "M1 A1" },
        { m: "$P(D = 10) + P(D = 20) = \\dfrac{60}{137} + \\dfrac{30}{137} = \\dfrac{90}{137}$", mk: "A1" }
      ], result: "(b) 0.0376 (c) $\\frac{90}{137}$" } },
    { worked: { tag: "exam", title: "Probabilities that are logarithms", src: "A-level Oct 2021 · P3 Q6 · 7 marks",
      q: "$X$ takes the values $a$, $b$, $c$ with $P(X = x) = \\log_{36} x$, where $a$, $b$, $c$ are distinct integers, $a < b < c$, and every probability is greater than zero. **(a)** Find $a$, $b$ and $c$, showing your working clearly. $X_1$ and $X_2$ are independent, each distributed as $X$. **(b)** Find $P(X_1 = X_2)$.",
      steps: [
        { h: "(a) Sum to 1, then the log law", m: "$\\log_{36} a + \\log_{36} b + \\log_{36} c = \\log_{36}(abc) = 1 \\;\\Rightarrow\\; abc = 36$", mk: "M1 A1" },
        { h: "Every probability positive", m: "$\\log_{36} x > 0 \\Rightarrow x > 1$, so $a$, $b$, $c$ are distinct integers greater than 1 with product 36.", mk: "M1" },
        { m: "The only choice: $a = 2$, $b = 3$, $c = 6$", mk: "A1 A1", n: "$2 \\times 3 \\times 6 = 36$; any factorisation with a 1 is excluded, and $(2, 2, 9)$, $(3, 3, 4)$ are not distinct." },
        { h: "(b) Same value twice", m: "$(\\log_{36} 2)^2 + (\\log_{36} 3)^2 + (\\log_{36} 6)^2 = 0.0374 + 0.0940 + 0.25 = 0.381$", mk: "M1 A1", n: "$\\log_{36} 6 = \\frac12$ exactly, since $36^{1/2} = 6$." }
      ], result: "(a) 2, 3, 6 (b) 0.381" } },
    { worked: { tag: "exam", title: "A probability function $\\frac{r}{k}$ and a quadratic with no real roots", src: "A-level June 2025 · P3 Q6 · 11 marks",
      q: "$R$ takes the even integers $2, 4, 6, \\ldots, 2n$ with $P(R = r) = \\dfrac{r}{k}$. **(a)** Show that $k = n(n + 1)$. When $n = 20$: **(b)** find the exact value of $P(16 \\le R < 26)$; a value $g$ of $R$ is used to form $x^2 + gx + 3g = 5$. **(c)** Find the exact probability that this equation has no real roots.",
      steps: [
        { h: "(a) Sum to 1", m: "$\\dfrac{1}{k}(2 + 4 + \\cdots + 2n) = \\dfrac{2}{k} \\cdot \\dfrac{n(n + 1)}{2} = \\dfrac{n(n + 1)}{k} = 1$", mk: "M1 M1 A1" },
        { m: "$k = n(n + 1)$", mk: "A1*" },
        { h: "(b) $n = 20$, $k = 420$", m: "$R = 16, 18, 20, 22, 24$: $\\dfrac{16 + 18 + 20 + 22 + 24}{420} = \\dfrac{100}{420} = \\dfrac{5}{21}$", mk: "M1 A1" },
        { h: "(c) Discriminant", m: "$x^2 + gx + (3g - 5) = 0$: no real roots when $g^2 - 4(3g - 5) < 0$", mk: "M1" },
        { m: "$g^2 - 12g + 20 < 0 \\;\\Rightarrow\\; (g - 2)(g - 10) < 0 \\;\\Rightarrow\\; 2 < g < 10$", mk: "M1 M1" },
        { m: "$g = 4, 6, 8$: $\\; \\dfrac{4 + 6 + 8}{420} = \\dfrac{18}{420} = \\dfrac{3}{70}$", mk: "dM1 A1" }
      ], result: "(b) $\\frac{5}{21}$ (c) $\\frac{3}{70}$" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Combining and stopping" },
    { h: "2.1  Two independent observations" },
    "For two independent observations, list every pair that gives the event and **multiply** the probabilities in each pair, then **add** the pairs. Remember both orders.",
    { worked: { tag: "exam", title: "Find constants, then the probability of a total", src: "AS June 2020 · P2 Q3 · 6 marks",
      q: "A player scores $S$ = 0, 1, 2, 3 or 4 points with probabilities $a$, $b$, $c$, 0.1, 0.15. The probability of scoring less than 2 points is twice the probability of scoring at least 2 points. Games are independent. John plays twice and adds the scores. Calculate the probability that the total is 6.",
      steps: [
        { h: "Translate the condition", m: "$P(S < 2) = a + b$, $\\; P(S \\ge 2) = c + 0.25$: $\\; a + b = 2(c + 0.25)$", mk: "M1" },
        { h: "Sum to 1", m: "$a + b + c + 0.25 = 1 \\;\\Rightarrow\\; 2c + 0.5 + c + 0.25 = 1 \\;\\Rightarrow\\; c = \\dfrac{1}{12}$", mk: "M1 A1", n: "You never need $a$ and $b$ separately — only $c$ and the given values." },
        { h: "Totals of 6", m: "$(2, 4)$, $(4, 2)$, $(3, 3)$", mk: "M1" },
        { m: "$2 \\times \\dfrac{1}{12} \\times 0.15 + 0.1^2 = 0.025 + 0.01 = 0.035$", mk: "M1 A1" }
      ], result: "0.035" } },
    { worked: { tag: "exam", title: "Two spinners; find $m$ and $n$ in $X = mR + nG$", src: "AS June 2022 · P2 Q5 · 8 marks",
      q: "A red spinner scores $R$ = 2 or 3 with probabilities $\\frac14$, $\\frac34$; a green spinner scores $G$ = 1 or 4 with probabilities $\\frac23$, $\\frac13$. Each is spun once. **(a)** Find the probability that (i) the sum is 7, (ii) the sum is less than 4. The random variable $X = mR + nG$, where $m$ and $n$ are integers, has $P(X = 20) = \\frac16$ and $P(X = 50) = \\frac14$. **(b)** Find $m$ and $n$.",
      steps: [
        { h: "(a)(i) Sum 7: only $3 + 4$", m: "$\\dfrac34 \\times \\dfrac13 = \\dfrac14$", mk: "B1" },
        { h: "(a)(ii) Sum < 4: only $2 + 1$", m: "$\\dfrac14 \\times \\dfrac23 = \\dfrac16$", mk: "M1 A1" },
        { h: "(b) Match each probability to a pair", m: "The four pairs have probabilities $(2,1): \\frac16$, $(2,4): \\frac{1}{12}$, $(3,1): \\frac12$, $(3,4): \\frac14$.\nSo $X = 20$ comes from $(2, 1)$ and $X = 50$ from $(3, 4)$.", mk: "M1 A1" },
        { h: "Two equations", m: "$2m + n = 20$, $\\quad 3m + 4n = 50$", mk: "M1" },
        { m: "$3m + 4(20 - 2m) = 50 \\;\\Rightarrow\\; -5m = -30 \\;\\Rightarrow\\; m = 6$, $n = 8$", mk: "A1 A1" }
      ], result: "(a) $\\frac14$, $\\frac16$ (b) $m = 6$, $n = 8$" } },
    { h: "2.2  Stopping rules" },
    "\"Repeat until …\" questions build a distribution of the **number of trials**. Each value is one path: failures, then the stopping event.",
    { worked: { tag: "exam", title: "Spin until a 7, at most 4 times", src: "AS June 2024 · P2 Q5 · 8 marks",
      q: "A biased spinner scores 6, 7, 8, 10 with probabilities 0.5, 0.2, $q$, $q$. **(a)** Find $q$. Karen spins until she gets a 7 or has taken 4 spins. **(b)** Show that the probability that she stops after her 3rd spin is 0.128. $S$ is the number of spins she takes. **(c)** Find the probability distribution of $S$. $N$ is the number of 7s she gets. **(d)** Find $P(S > N)$.",
      steps: [
        { h: "(a)", m: "$0.5 + 0.2 + 2q = 1 \\;\\Rightarrow\\; q = 0.15$", mk: "B1" },
        { h: "(b) Not 7, not 7, then 7", m: "$0.8 \\times 0.8 \\times 0.2 = 0.128$", mk: "M1 A1*" },
        { h: "(c) Every way to stop", m: "$P(S = 1) = 0.2$; $\\; P(S = 2) = 0.8 \\times 0.2 = 0.16$; $\\; P(S = 3) = 0.128$; $\\; P(S = 4) = 0.8^3 = 0.512$", mk: "M1 M1 A1 A1", n: "$S = 4$ is every path with three non-7s — whatever the 4th spin shows. Check: $0.2 + 0.16 + 0.128 + 0.512 = 1$." },
        { h: "(d) $N$ is 0 or 1", m: "$S > N$ fails only when $S = 1$ (one spin, one 7). So $P(S > N) = 1 - 0.2 = 0.8$", mk: "B1" }
      ], result: "(a) 0.15 (c) 0.2, 0.16, 0.128, 0.512 (d) 0.8" } },
    { h: "2.3  Draws without replacement" },
    { worked: { tag: "exam", title: "Number of A's in three letters without replacement", src: "AS June 2023 · P2 Q5(a) · 5 marks",
      q: "Julia selects 3 letters at random, one at a time without replacement, from the word VARIANCE. $X$ is the number of times she selects a letter A. Find the complete probability distribution of $X$.",
      steps: [
        { h: "Possible values", m: "VARIANCE has 8 letters, two of them A — so $X = 0, 1, 2$.", mk: "B1" },
        { h: "$X = 0$", m: "$\\dfrac68 \\times \\dfrac57 \\times \\dfrac46 = \\dfrac{5}{14}$", mk: "M1" },
        { h: "$X = 1$: three positions for the A", m: "$3 \\times \\dfrac28 \\times \\dfrac67 \\times \\dfrac56 = \\dfrac{15}{28}$", mk: "M1 A1" },
        { h: "$X = 2$", m: "$3 \\times \\dfrac28 \\times \\dfrac17 \\times \\dfrac66 = \\dfrac{3}{28}$", mk: "A1", n: "Check: $\\frac{10}{28} + \\frac{15}{28} + \\frac{3}{28} = 1$." }
      ], result: "$P(X = 0) = \\frac{5}{14}$, $P(X = 1) = \\frac{15}{28}$, $P(X = 2) = \\frac{3}{28}$" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "The discrete uniform distribution" },
    { callout: { t: "def", h: "Discrete uniform distribution", body: "A random variable that takes $n$ distinct values, **each with the same probability** $\\frac{1}{n}$. A fair die (1 to 6, each $\\frac16$) and a fair 5-sided spinner (1 to 5, each $\\frac15$) are the standard examples." } },
    { fig: pmfFig([1, 2, 3, 4, 5], [0.2, 0.2, 0.2, 0.2, 0.2], { yt: [0.1, 0.2], cap: "A fair 5-sided spinner: discrete uniform on {1, 2, 3, 4, 5}." }) },
    { worked: { tag: "exam", title: "Name the distribution, then a binomial count", src: "AS June 2019 · P2 Q3 · 6 marks",
      q: "A fair 5-sided spinner has sides numbered 1 to 5. **(a)** Write down the name of the distribution that can model the score. The spinner is spun 28 times; $X$ is the number of times it lands on 2. **(b)** Find (i) the probability it lands on 2 at least 7 times, (ii) $P(4 \\le X < 8)$.",
      steps: [
        { h: "(a)", m: "(Discrete) uniform distribution.", mk: "B1", n: "\"Continuous uniform\" is B0." },
        { h: "(b) The count of 2s", m: "$X \\sim B(28, 0.2)$", mk: "B1" },
        { h: "(i)", m: "$P(X \\ge 7) = 1 - P(X \\le 6) = 1 - 0.6784 = 0.322$", mk: "M1 A1" },
        { h: "(ii)", m: "$P(4 \\le X < 8) = P(X \\le 7) - P(X \\le 3) = 0.8180 - 0.1600 = 0.658$", mk: "M1 A1" }
      ], result: "(a) discrete uniform (b) 0.322, 0.658" } },

    /* ---------------------------------------------------------------- Page 4 */
    { page: "The binomial distribution" },
    { callout: { t: "memorise", h: "When is $X \\sim B(n, p)$ a suitable model?", body: [
      "1. A **fixed number of trials**, $n$.",
      "2. Each trial has **two outcomes** — success or failure.",
      "3. The trials are **independent**.",
      "4. The probability of success $p$ is the **same** (constant) in every trial.",
      "$X$ is then the **number of successes** in the $n$ trials."
    ] } },
    { callout: { t: "formula", h: "Formulae booklet (Discrete distributions)", body: [
      "$$P(X = x) = \\binom{n}{x}p^x(1 - p)^{n - x} \\qquad x = 0, 1, \\ldots, n$$",
      "Mean $np$, variance $np(1 - p)$ (used for the Normal approximation in S4.2). The booklet also prints cumulative binomial tables, $P(X \\le x)$, for selected $n$ and $p$ — your calculator does the same job for any $n$ and $p$."
    ] } },
    { fig: pmfFig(range(0, 20), binomPs(20, 0.37), { xt: [0, 5, 10, 15, 20], yt: [0.05, 0.1, 0.15], hl: [8], extra: [{ text: [8, 0.19], t: "P(X = 8) = 0.173", size: 11, c: "accent2" }], cap: "$X \\sim B(20, 0.37)$ (AS June 2025): centred near $np = 7.4$." }) },
    { h: "4.1  Translating inequalities — the step most marks depend on" },
    "Calculators and tables give **$P(X \\le x)$**. Every other request must be rewritten in that form first:",
    { table: { head: ["The question says", "Rewrite as", "Example, $X \\sim B(20, p)$"], rows: [
      ["$P(X \\le 5)$ — at most 5", "$P(X \\le 5)$", "direct"],
      ["$P(X < 5)$ — fewer than 5", "$P(X \\le 4)$", "lose the endpoint"],
      ["$P(X \\ge 5)$ — at least 5", "$1 - P(X \\le 4)$", "complement of \"4 or fewer\""],
      ["$P(X > 5)$ — more than 5", "$1 - P(X \\le 5)$", "complement of \"5 or fewer\""],
      ["$P(3 \\le X \\le 7)$", "$P(X \\le 7) - P(X \\le 2)$", "subtract everything below 3"],
      ["$P(3 < X < 7)$", "$P(X \\le 6) - P(X \\le 3)$", "both ends open"],
      ["$P(X \\le 5.7)$ or $P(X < 5.7)$", "$P(X \\le 5)$", "$X$ is a whole number"]
    ] } },
    { fig: { w: 520, h: 110, items: (function () {
      var it = [];
      for (var i = 0; i <= 10; i++) {
        var on = i >= 3 && i <= 6, x = 30 + i * 46;
        it.push({ circle: [x, 50, 15], fill: on ? "accent" : null, alpha: on ? 0.45 : 0, c: on ? "accent" : "muted", w: 1.4 });
        it.push({ text: [x, 50], t: String(i), size: 12, c: on ? "text" : "muted", b: on });
      }
      it.push({ text: [260, 92], t: "P(2 < X ≤ 6) = P(X ≤ 6) − P(X ≤ 2): keep 3, 4, 5, 6", size: 12, c: "accent", b: true });
      return it;
    })(), cap: "Write the whole numbers out: the shaded ones are the event; subtract the cumulative probability of everything to their left." } },
    { worked: { tag: "exam", title: "Point and interval probabilities on the calculator", src: "AS June 2024 · P2 Q4(a) · 3 marks",
      q: "The random variable $X \\sim B(27, 0.35)$. Find (i) $P(X = 10)$, (ii) $P(12 \\le X < 15)$.",
      steps: [
        { h: "(i) Binomial PD", m: "$P(X = 10) = 0.154$", mk: "B1" },
        { h: "(ii) Whole numbers 12, 13, 14", m: "$P(12 \\le X < 15) = P(X \\le 14) - P(X \\le 11) = 0.97707 - 0.79760 = 0.179$", mk: "M1 A1" }
      ], result: "(i) 0.154 (ii) 0.179" } },
    { worked: { tag: "exam", title: "Same answer twice: $X$ is a whole number", src: "AS June 2025 · P2 Q1 · 3 marks",
      q: "The random variable $X \\sim B(20, 0.37)$. Find **(a)** $P(X = 8)$, **(b)** $P(X \\le 5)$, **(c)** $P(X < 5.7)$.",
      steps: [
        { h: "(a)", m: "$0.173$", mk: "B1" },
        { h: "(b)", m: "$0.191$", mk: "B1" },
        { h: "(c) The values below 5.7 are 0 to 5", m: "$P(X < 5.7) = P(X \\le 5) = 0.191$", mk: "B1ft" }
      ], result: "(a) 0.173 (b) 0.191 (c) 0.191" } },
    { worked: { tag: "exam", title: "Probabilities from a known proportion", src: "AS June 2022 · P2 Q2(a) · 3 marks",
      q: "8% of the bags of sugar from supplier A are damp. A random sample of 35 bags is taken. Using a suitable model, find the probability that the number of damp bags is (i) exactly 2, (ii) more than 3.",
      steps: [
        { h: "Model", m: "$D \\sim B(35, 0.08)$", mk: "M1" },
        { h: "(i)", m: "$P(D = 2) = \\binom{35}{2}(0.08)^2(0.92)^{33} = 0.243$", mk: "A1" },
        { h: "(ii)", m: "$P(D > 3) = 1 - P(D \\le 3) = 1 - 0.6940 = 0.306$", mk: "A1" }
      ], result: "(i) 0.243 (ii) 0.306" } },
    { worked: { tag: "exam", title: "A proportion from a table, then the binomial", src: "AS June 2025 · P2 Q3(a) · 3 marks",
      q: "A bag contains red, green and white counters in proportions $p$, 0.2 and $4p$. Elsa selects 40 counters at random, one at a time, with replacement. Assuming these proportions, find the distribution of the number of red counters she selects.",
      steps: [
        { h: "Sum to 1", m: "$p + 0.2 + 4p = 1 \\;\\Rightarrow\\; p = 0.16$", mk: "M1" },
        { h: "Name the model", m: "With replacement: 40 independent trials, each red with probability 0.16 — binomial.", mk: "M1" },
        { m: "$R \\sim B(40, 0.16)$", mk: "A1" }
      ], result: "$B(40, 0.16)$" } },

    /* ---------------------------------------------------------------- Page 5 */
    { page: "Binomial in context" },
    { h: "5.1  A binomial inside a binomial" },
    "When the \"success\" is itself an event with a binomial probability (\"a day with at least 3 successful calls\"), find that probability first, then use it as the $p$ of a second binomial.",
    { worked: { tag: "exam", title: "At least 3 successes on exactly 1 of 5 days", src: "AS June 2020 · P2 Q5(a)(b) · 4 marks",
      q: "Each sales call Afrika makes is successful with probability $\\frac16$, independently. She makes 9 calls. **(a)** Calculate the probability that at least 3 are successful. She makes 9 calls on each of 5 different days. **(b)** Calculate the probability that at least 3 calls are successful on exactly 1 of these days.",
      steps: [
        { h: "(a) $C \\sim B(9, \\frac16)$", m: "$P(C \\ge 3) = 1 - P(C \\le 2) = 0.178$", mk: "M1 A1" },
        { h: "(b) A \"good day\" has probability 0.178", m: "$Y$ = number of good days, $Y \\sim B(5, 0.1782)$:\n$P(Y = 1) = 5 \\times 0.1782 \\times 0.8218^4 = 0.406$", mk: "M1 A1" }
      ], result: "(a) 0.178 (b) 0.406" } },
    { worked: { tag: "exam", title: "Bags with more blue than white; fewer than 2 of 5 bags", src: "A-level Specimen · P3 Q3(a) · 4 marks",
      q: "36% of a type of bulb grow into plants with blue flowers; the rest have white flowers. Bulbs are sold in mixed bags of 40. Russell selects a random sample of 5 bags. Find the probability that fewer than 2 of these bags contain more bulbs that grow blue flowers than white flowers.",
      steps: [
        { h: "One bag: more blue than white", m: "$A \\sim B(40, 0.36)$; more blue than white means $A \\ge 21$:\n$p = P(A \\ge 21) = 1 - P(A \\le 20) = 0.0240$", mk: "M1 A1" },
        { h: "Five bags", m: "$C \\sim B(5, 0.0240)$: $\\; P(C \\le 1) = 0.995$", mk: "M1 A1", n: "\"More than white\" out of 40 means 21 or more: 20 blue would be a tie." }
      ], result: "0.995" } },
    { worked: { tag: "exam", title: "Members who tango — a product, then a new binomial", src: "A-level Oct 2021 · P3 Q1(b)–(d) · 6 marks",
      q: "8% of a university's students are in the dance club; a random sample of 36 students is taken and $X$ is the number in the club. **(b)** Using a suitable model, find (i) $P(X = 4)$, (ii) $P(X \\ge 7)$. 40% of club members can tango. **(c)** Find the probability that a student is in the club and can tango. A random sample of 50 students is taken. **(d)** Find the probability that fewer than 3 are in the club and can tango.",
      steps: [
        { h: "(b) $X \\sim B(36, 0.08)$", m: "(i) $P(X = 4) = 0.167$ $\\quad$ (ii) $P(X \\ge 7) = 1 - P(X \\le 6) = 0.0222$", mk: "M1 A1 A1" },
        { h: "(c)", m: "$0.08 \\times 0.4 = 0.032$", mk: "B1" },
        { h: "(d) $T \\sim B(50, 0.032)$", m: "$P(T < 3) = P(T \\le 2) = 0.785$", mk: "M1 A1" }
      ], result: "(b) 0.167, 0.0222 (c) 0.032 (d) 0.785" } },
    { worked: { tag: "exam", title: "Conditions, probabilities, and a binomial of boxes", src: "A-level June 2023 · P3 Q2(a)–(c) · 5 marks",
      q: "$\\frac17$ of packets of sweets contain a prize; there are 40 packets in each box, and $T$ is the number of prize packets in a box. **(a)** State a condition needed for $T$ to be modelled by $B(40, \\frac17)$. **(b)** Find (i) $P(T = 6)$, (ii) $P(T < 3)$. Kamil buys 5 boxes. **(c)** Find the probability that exactly 2 of the 5 boxes have fewer than 3 prize packets.",
      steps: [
        { h: "(a) In context", m: "Prizes must be put into packets independently (at random) — or: the probability that a packet contains a prize is constant.", mk: "B1", n: "\"Two outcomes\" or \"a fixed number of packets\" are B0 here: they are true by construction." },
        { h: "(b)", m: "(i) $P(T = 6) = 0.173$ $\\quad$ (ii) $P(T \\le 2) = 0.0616$", mk: "B1 B1" },
        { h: "(c) $K \\sim B(5, 0.0616)$", m: "$P(K = 2) = \\binom52 (0.0616)^2(0.9384)^3 = 0.0313$", mk: "M1 A1" }
      ], result: "(a) prizes placed independently / constant probability (b) 0.173, 0.0616 (c) 0.0313" } },
    { worked: { tag: "exam", title: "Days with three sixes; the expected number of sixes", src: "A-level June 2024 · P3 Q1(a)–(c) · 7 marks",
      q: "Xian rolls a fair die 10 times; $X$ is the number of sixes. **(a)** Using a suitable distribution, find (i) $P(X = 3)$, (ii) $P(X < 3)$. Xian repeats this every day for 60 days and records the number of days when $X = 3$. **(b)** Find the probability that there were at least 12 such days. **(c)** Find an estimate of the total number of sixes over the 60 days.",
      steps: [
        { h: "(a) $X \\sim B(10, \\frac16)$", m: "(i) $0.155$ $\\quad$ (ii) $P(X \\le 2) = 0.775$", mk: "M1 A1 A1" },
        { h: "(b) $D \\sim B(60, 0.155)$", m: "$P(D \\ge 12) = 1 - P(D \\le 11) = 1 - 0.7882 = 0.212$", mk: "M1 M1 A1" },
        { h: "(c) Expected value", m: "600 rolls $\\times \\frac16 = 100$ sixes", mk: "B1" }
      ], result: "(a) 0.155, 0.775 (b) 0.212 (c) 100" } },
    { worked: { tag: "exam", title: "Two models for the first hit: constant against improving", src: "A-level June 2018 · P3 Q3 · 11 marks",
      q: "Children throw darts at a target; $H$ is the number of hits in the first 10 throws, modelled by Peta as $B(10, 0.1)$. **(a)** State two assumptions Peta needs. **(b)** Find $P(H \\ge 4)$. $F$ is the number of the throw on which the first hit occurs. **(c)** Using Peta's assumptions, find $P(F = 5)$. Thomas assumes no child needs more than 10 throws and models $P(F = n) = 0.01 + (n - 1)\\alpha$. **(d)** Find $\\alpha$. **(e)** Find $P(F = 5)$ using Thomas' model. **(f)** Explain how the two models differ in describing the probability of a hit.",
      steps: [
        { h: "(a)", m: "The probability of hitting the target is constant (0.1) for every throw; the throws are independent.", mk: "B1 B1" },
        { h: "(b)", m: "$P(H \\ge 4) = 1 - P(H \\le 3) = 1 - 0.9872 = 0.0128$", mk: "B1" },
        { h: "(c) Four misses, then a hit", m: "$P(F = 5) = 0.9^4 \\times 0.1 = 0.0656$", mk: "M1 A1" },
        { h: "(d) Sum over $n = 1$ to 10", m: "$\\sum_{n=1}^{10}[0.01 + (n - 1)\\alpha] = 0.1 + 45\\alpha = 1 \\;\\Rightarrow\\; \\alpha = 0.02$", mk: "M1 M1 A1 A1", n: "An arithmetic series: $\\frac{10}{2}[2(0.01) + 9\\alpha]$." },
        { h: "(e)", m: "$0.01 + 4 \\times 0.02 = 0.09$", mk: "B1ft" },
        { h: "(f)", m: "Peta's model keeps the probability of a hit the same on every throw; Thomas' model has the probability of the first hit increasing with each throw — the children improve.", mk: "B1" }
      ], result: "(b) 0.0128 (c) 0.0656 (d) 0.02 (e) 0.09" } },
    { worked: { tag: "exam", title: "Is a binomial model suitable for beads from a sack?", src: "AS Nov 2021 · P2 Q4(a)–(c) · 5 marks",
      q: "A sack contains a large number of beads, 14% of them red. Aliya takes a random sample of 18 beads for a bracelet. **(a)** State a suitable binomial distribution for the number of red beads. **(b)** Find the probability that (i) she has just 1 red bead, (ii) she has at least 4 red beads. **(c)** Comment on the suitability of a binomial distribution here.",
      steps: [
        { h: "(a)", m: "$R \\sim B(18, 0.14)$", mk: "B1" },
        { h: "(b)", m: "(i) $P(R = 1) = 0.194$ $\\quad$ (ii) $P(R \\ge 4) = 1 - P(R \\le 3) = 1 - 0.7618 = 0.238$", mk: "B1 M1 A1" },
        { h: "(c) Is $p$ constant?", m: "Taking beads out changes the proportion left, so strictly the trials are not independent. But the sack holds a **large number** of beads, so removing 18 barely changes $p = 0.14$ — the binomial is a suitable model.", mk: "B1" }
      ], result: "(a) $B(18, 0.14)$ (b) 0.194, 0.238 (c) suitable — large sack keeps $p$ nearly constant" } },

    /* ---------------------------------------------------------------- Page 6 */
    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**State a suitable model**", "$B(n, p)$ with both numbers"],
      ["**State an assumption / condition** for the binomial", "independence or constant probability, *in context*"],
      ["**Find** $P(\\ldots)$", "the probability statement rewritten as $P(X \\le x)$ form, then the value (3 s.f.)"],
      ["**Show that** $k = \\ldots$", "sum of probabilities = 1, written out, simplified to the given value"],
      ["**Find the probability distribution**", "every value with its probability, in a table or as a function"],
      ["**Exact** probability", "a fraction"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**M1 for the model**: write $X \\sim B(36, 0.08)$ — it is often the first mark of the question.",
      "**The translation line** $1 - P(X \\le 6)$ earns the method mark even if a key is mistyped.",
      "**3 significant figures** for probabilities; more is fine, fewer can lose A marks.",
      "**Second-stage binomial**: carry the unrounded first probability.",
      "**Sum to 1** is the key to every \"find $k$\" or \"find $a$, $b$\" question."
    ] },
    { h: "Misconceptions" },
    { ul: [
      "\"$P(X > 5) = 1 - P(X \\le 4)$\" — that is $P(X \\ge 5)$.",
      "\"$B(0.08, 36)$\" — the number of trials comes first.",
      "\"Both orders\" forgotten when two observations differ: (30, 50) and (50, 30).",
      "\"Two outcomes\" given as the binomial assumption when the question wants the one that can actually fail (independence, constant $p$)."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Binomial PD", "**Distribution → Binomial PD**: enter $x$, $N$ (= $n$), $p$ → $P(X = x)$."],
      ["Binomial CD", "**Distribution → Binomial CD**: the cumulative probability $P(X \\le x)$ for your $x$, $N$, $p$. Translate the question's inequality first, then key it in."],
      ["$\\binom{n}{r}$", "**CATALOG → Probability → nCr** for a hand calculation."]
    ] },
    { callout: { t: "mnemonic", h: "\"Fixed, two, free, same\"", body: "The binomial conditions: **fixed** $n$, **two** outcomes, trials **free** of each other, the **same** $p$." } }
  ],
  flashcards: [
    ["Rule every probability distribution satisfies?", "$\\sum P(X = x) = 1$."],
    ["Discrete uniform distribution?", "$n$ values, each with probability $\\frac1n$."],
    ["Four conditions for $B(n, p)$?", "Fixed $n$; two outcomes; independent trials; constant $p$."],
    ["$P(X = x)$ for $B(n, p)$?", "$\\binom{n}{x}p^x(1 - p)^{n - x}$."],
    ["$P(X \\ge 7)$ in cumulative form?", "$1 - P(X \\le 6)$."],
    ["$P(X > 5)$ in cumulative form?", "$1 - P(X \\le 5)$."],
    ["$P(4 \\le X < 8)$ in cumulative form?", "$P(X \\le 7) - P(X \\le 3)$."],
    ["$P(X < 5.7)$ for binomial $X$?", "$P(X \\le 5)$."],
    ["Mean of $B(n, p)$?", "$np$."],
    ["Variance of $B(n, p)$?", "$np(1 - p)$."],
    ["$P(D = d) = \\frac{k}{d}$ for $d = 10, \\ldots, 50$. $k$?", "$\\frac{600}{137}$."],
    ["$P(R = r) = \\frac rk$, $r = 2, 4, \\ldots, 2n$. $k$?", "$n(n + 1)$."],
    ["Spin until a 7 ($p = 0.2$), max 4 spins: $P(S = 4)$?", "$0.8^3 = 0.512$."],
    ["3 letters without replacement from VARIANCE: $P(\\text{no A})$?", "$\\frac{5}{14}$."],
    ["Probability of a good day 0.178; exactly 1 good day in 5?", "$5(0.178)(0.822)^4 = 0.406$."],
    ["Why is a binomial OK for beads taken from a large sack?", "Removing a few barely changes $p$, so it stays (nearly) constant."]
  ],
  quiz: [
    { q: "$X \\sim B(10, 0.3)$. $P(X > 3)$ equals", opts: ["$1 - P(X \\le 3)$", "$1 - P(X \\le 2)$", "$P(X \\le 3)$", "$1 - P(X < 3)$"], ans: 0, why: "More than 3 is 4 upwards." },
    { q: "Which is NOT a binomial condition?", opts: ["outcomes equally likely", "fixed $n$", "independent trials", "constant $p$"], ans: 0, why: "$p$ need not be $\\frac12$." },
    { q: "A fair die's score follows", opts: ["a discrete uniform distribution", "$B(6, \\tfrac16)$", "a Normal distribution", "a continuous uniform distribution"], ans: 0, why: "Six equally likely values." },
    { q: "$P(X = x) = kx$ for $x = 1, 2, 3, 4$. $k =$", opts: ["0.1", "0.25", "0.4", "1"], ans: 0, why: "$10k = 1$." },
    { q: "$X \\sim B(40, 0.25)$: expected value", opts: ["10", "7.5", "0.25", "30"], ans: 0, why: "$np$." },
    { q: "$P(2 < X \\le 6)$ in cumulative form", opts: ["$P(X \\le 6) - P(X \\le 2)$", "$P(X \\le 6) - P(X \\le 3)$", "$P(X \\le 5) - P(X \\le 2)$", "$P(X \\le 6) - P(X < 2)$"], ans: 0, why: "Keep 3 to 6." },
    { q: "Two independent observations of $X$; $P(X = 3) = 0.2$, $P(X = 5) = 0.1$. $P(\\text{sum} = 8)$ from these values is", opts: ["0.04", "0.02", "0.3", "0.01"], ans: 0, why: "$2 \\times 0.2 \\times 0.1$ (both orders)." }
  ]
};

/* =====================================================================
   S4.2  The Normal distribution; the Normal approximation to the binomial
   ===================================================================== */
C["maths:S4.2"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "The Normal distribution — the whole topic on one page" },
    "Spec 4.2: understand and use the **Normal distribution** as a model; find probabilities with a calculator; link it to histograms, the mean, the standard deviation, **points of inflection** and the **binomial** — including the **Normal approximation** with a **continuity correction**.",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Probability of a range: $P(X > a)$, $P(a < X < b)$", "1", "every series"],
      ["Inverse: find the value with a given probability", "2", "A-level Oct 2021 Q5, June 2022 Q2"],
      ["Find $\\sigma$ (or $\\mu$) from one probability", "2–3", "A-level Specimen Q5, June 2022 Q2"],
      ["Find $\\mu$ and $\\sigma$ from two probabilities", "5", "A-level June 2024 Q5, June 2025 Q5"],
      ["Conditional probabilities with a Normal variable", "3–5", "A-level June 2018 Q5, Oct 2020 Q5, Oct 2021 Q5"],
      ["Independent Normal events multiplied; expected numbers and profits", "3–5", "A-level Specimen, June 2022 Q2, June 2024 Q5, 2025 Q5"],
      ["Is a Normal model suitable?", "1", "A-level Oct 2020 Q5, June 2023 Q6"],
      ["Normal approximation to the binomial (continuity correction)", "3–6", "A-level Specimen Q3, June 2022 Q1, June 2024 Q1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**The shape** — symmetry, the 68–95–99.7 rule, points of inflection.",
      "**Probabilities** — the calculator, standardising, $Z$.",
      "**Working backwards** — inverse Normal, unknown $\\mu$ and $\\sigma$.",
      "**Conditional and combined probabilities**.",
      "**The Normal approximation to the binomial**.",
      "**Exam toolkit**."
    ] },
    "The hypothesis test for a Normal mean is in S5.3; this leaf is everything it rests on.",

    /* ---------------------------------------------------------------- Page 1 */
    { page: "The shape" },
    { callout: { t: "def", h: "$X \\sim N(\\mu, \\sigma^2)$", body: [
      "A **continuous** random variable whose distribution is bell-shaped and **symmetrical about the mean $\\mu$**; the second parameter is the **variance** $\\sigma^2$ (so $N(150, 25^2)$ has standard deviation 25).",
      "Mean = median = mode = $\\mu$. The total area under the curve is 1. The tails approach the axis but never touch it."
    ] } },
    { fig: normFig(10, 1, [[9, 11, "accent2"]], [[9, "μ − σ", "accent3"], [11, "μ + σ", "accent3"]], { xl: "", xt: [{ v: 7, label: "μ−3σ" }, { v: 8, label: "μ−2σ" }, { v: 9, label: "μ−σ" }, { v: 10, label: "μ" }, { v: 11, label: "μ+σ" }, { v: 12, label: "μ+2σ" }, { v: 13, label: "μ+3σ" }],
      extra: [{ text: [10, 0.45], t: "≈ 68%", size: 12.5, c: "text", b: true }], cap: "About 68% of values lie within one standard deviation of the mean, 95% within two, 99.7% within three. The curve changes from concave to convex — its **points of inflection** — at $\\mu \\pm \\sigma$." }) },
    { table: { head: ["Within", "Probability", "Use"], rows: [
      ["$\\mu \\pm \\sigma$", "≈ 0.68", "points of inflection are here"],
      ["$\\mu \\pm 2\\sigma$", "≈ 0.95", "a quick plausibility check"],
      ["$\\mu \\pm 3\\sigma$", "≈ 0.997", "values beyond are rare — candidate outliers"]
    ] } },
    { callout: { t: "tip", h: "Reading $\\mu$ and $\\sigma$ off a curve", body: [
      "$\\mu$ is the line of symmetry; $\\sigma$ is the horizontal distance from $\\mu$ to a point of inflection.",
      "From a histogram: a roughly symmetrical, single-peaked shape with mean ≈ median suggests a Normal model; $\\bar{x}$ and $s$ estimate $\\mu$ and $\\sigma$."
    ] } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Probabilities" },
    { callout: { t: "memorise", h: "Standardising", body: [
      "$$Z = \\frac{X - \\mu}{\\sigma} \\sim N(0, 1^2)$$",
      "$Z$ counts **standard deviations from the mean**. $P(X < a) = P\\left(Z < \\frac{a - \\mu}{\\sigma}\\right)$.",
      "Your calculator finds Normal probabilities directly — but you must standardise whenever $\\mu$ or $\\sigma$ is unknown, and writing the $z$ value earns method marks."
    ] } },
    { ul: [
      "$P(X = a) = 0$, so $<$ and $\\le$ give the same answer for a Normal variable.",
      "By symmetry $P(X < \\mu - c) = P(X > \\mu + c)$, and $P(X < \\mu) = 0.5$.",
      "The booklet prints a table of **percentage points** of $N(0, 1)$ (e.g. $z = 1.6449$ for 5% in one tail, $1.9600$ for 2.5%)."
    ] },
    { worked: { tag: "exam", title: "Expected number in a box; σ from a percentage; choose a company", src: "A-level Specimen · P3 Q5 · 8 marks",
      q: "Battery lifetimes from company X are $N(150, 25^2)$ hours. A box contains 12 batteries from X. **(a)** Find the expected number with a lifetime of more than 160 hours. Company Y's lifetimes are Normal with mean 160 hours, and 80% last less than 180 hours. **(b)** Find the standard deviation for company Y. Both companies charge the same. **(c)** State which company you would recommend, giving reasons.",
      steps: [
        { h: "(a)", m: "$P(L > 160) = P(Z > 0.4) = 0.3446$", mk: "B1", fig: normFig(150, 25, [[160, 250, "accent2"]], [[160, "160"]], { xl: "hours", xt: [100, 125, 150, 175, 200] }) },
        { m: "Expected number $= 12 \\times 0.3446 = 4.13$", mk: "M1 A1" },
        { h: "(b) The $z$ for 80%", m: "$P(Z < 0.8416) = 0.8$, so $\\dfrac{180 - 160}{\\sigma} = 0.8416$", mk: "B1 M1" },
        { m: "$\\sigma = \\dfrac{20}{0.8416} = 23.8$ hours", mk: "A1" },
        { h: "(c)", m: "The standard deviations are similar (25 and 23.8) but Y has the higher mean, so Y's batteries tend to last longer: recommend company Y.", mk: "M1 A1" }
      ], result: "(a) 4.13 (b) 23.8 h (c) Y — higher mean, similar spread" } },
    { worked: { tag: "exam", title: "Both conditions: independent Normal variables", src: "A-level June 2024 · P3 Q5(a)–(c) · 5 marks",
      q: "High-jump heights $H$ are $N(1.4, 0.15^2)$ metres. **(a)** Find the proportion of students jumping more than 1.6 m. 1500 m times $T$ are $N(330, 26^2)$ seconds. The Head wants the proportion who can jump higher than 1.6 m **and** run 1500 m in under 5 minutes. **(b)** State a necessary assumption about $H$ and $T$. **(c)** Find the Head's estimate.",
      steps: [
        { h: "(a)", m: "$P(H > 1.6) = 0.0912$", mk: "B1" },
        { h: "(b)", m: "$H$ and $T$ are independent.", mk: "B1" },
        { h: "(c) 5 minutes = 300 s", m: "$P(T < 300) = 0.1243$", mk: "M1" },
        { m: "$0.0912 \\times 0.1243 = 0.0113$", mk: "M1 A1", n: "Convert the units first — 5 minutes, not 5." }
      ], result: "(a) 0.0912 (b) independence (c) 0.0113" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Working backwards" },
    { callout: { t: "memorise", h: "Inverse Normal and unknown parameters", body: [
      "**Known $\\mu$, $\\sigma$, unknown value**: inverse Normal with the area **to the left**: $P(X < k) = 0.01 \\Rightarrow k = \\text{InvN}(0.01, \\mu, \\sigma)$.",
      "**Unknown $\\sigma$ (or $\\mu$)**: use the $z$ value for the given probability, then $\\dfrac{x - \\mu}{\\sigma} = z$.",
      "**Both unknown**: two probabilities give two equations $x_1 = \\mu + z_1\\sigma$ and $x_2 = \\mu + z_2\\sigma$ — solve simultaneously.",
      "**Sign check**: a value below the mean has a **negative** $z$."
    ] } },
    { worked: { tag: "exam", title: "1% shorter than $k$; a proportion between two heights", src: "A-level Oct 2021 · P3 Q5(a)(b) · 3 marks",
      q: "Female heights in a country are $N(166.5, 6.1^2)$ cm. Given that 1% are shorter than $k$ cm, **(a)** find $k$. **(b)** Find the proportion with heights between 150 cm and 175 cm.",
      steps: [
        { h: "(a) $z$ for the lowest 1%", m: "$\\dfrac{k - 166.5}{6.1} = -2.3263 \\;\\Rightarrow\\; k = 152.3$ cm", mk: "M1 A1" },
        { h: "(b)", m: "$P(150 < X < 175) = 0.915$", mk: "B1" }
      ], result: "(a) 152.3 cm (b) 0.915" } },
    { worked: { tag: "exam", title: "Show σ; a proportion; an expected profit; a binomial check", src: "A-level June 2022 · P3 Q2 · 12 marks",
      q: "Rod lengths $L$ cm are Normal with mean 8 and standard deviation $x$; 2.5% are shorter than 7.902 cm. **(a)** Show that $x = 0.05$ to 2 d.p. **(b)** Find the proportion between 7.94 cm and 8.09 cm. Each rod costs 20p to make; a rod with $L < 7.94$ is scrap sold for 5p; $7.94 \\le L \\le 8.09$ sells for 50p; $L > 8.09$ is shortened for an extra 10p and sold for 50p. **(c)** Calculate the expected profit per 500 rods, to the nearest pound. Hinges are faulty with probability 0.015; a batch is accepted if fewer than 6 of a sample of 200 are faulty, and the aim is for 95% of batches to be accepted. **(d)** Explain whether the aim is likely to be achieved.",
      steps: [
        { h: "(a)", m: "$\\dfrac{7.902 - 8}{x} = -1.96 \\;\\Rightarrow\\; x = \\dfrac{0.098}{1.96} = 0.05$", mk: "M1 A1*" },
        { h: "(b)", m: "$P(7.94 \\le L \\le 8.09) = 0.849$", mk: "B1",
          fig: normFig(8, 0.05, [[7.8, 7.94, "danger"], [7.94, 8.09, "accent3"], [8.09, 8.2, "accent2"]], [[7.94, "7.94"], [8.09, "8.09"]], { xl: "L (cm)", xt: [7.9, 7.95, 8, 8.05, 8.1] }) },
        { h: "(c) The other two probabilities", m: "$P(L < 7.94) = 0.1151$, $\\; P(L > 8.09) = 0.0359$", mk: "B1 B1" },
        { h: "Income per rod, then profit", m: "$5(0.1151) + 50(0.849) + 40(0.0359) = 44.46$p, less the 20p cost: 24.46p per rod", mk: "M1" },
        { m: "$500 \\times 24.46\\text{p} = 12\\,231\\text{p} \\approx £122$", mk: "M1d A1" },
        { h: "(d) A binomial for faults", m: "$F \\sim B(200, 0.015)$: $P(F < 6) = P(F \\le 5) = 0.918$", mk: "M1 M1 A1" },
        { m: "$0.918 < 0.95$, so the aim is unlikely to be achieved.", mk: "A1ft" }
      ], result: "(b) 0.849 (c) £122 (d) no — only 91.8% of batches would be accepted" } },
    { worked: { tag: "exam", title: "μ and σ from two percentages", src: "A-level June 2025 · P3 Q5 · 10 marks",
      q: "Men's heights in a tennis club are $N(183, 4.9^2)$ cm. **(a)** Find the probability that a man is (i) taller than 186 cm, (ii) between 175 cm and 185 cm. Women's heights are $N(\\mu, \\sigma^2)$; 40% are shorter than 170 cm and 15% are taller than 175 cm. **(b)** Find $\\mu$ and $\\sigma$, showing your working clearly. A man and a woman are chosen at random. **(c)** Find the probability that both have heights between 170 cm and 175 cm.",
      steps: [
        { h: "(a)", m: "(i) $0.270$ $\\quad$ (ii) $0.607$", mk: "B1 B1" },
        { h: "(b) The two $z$ values", m: "$P(Z < -0.2533) = 0.40$; $\\quad P(Z > 1.0364) = 0.15$", mk: "M1 B1" },
        { h: "Two equations", m: "$170 = \\mu - 0.2533\\sigma$, $\\quad 175 = \\mu + 1.0364\\sigma$", mk: "M1" },
        { m: "Subtract: $5 = 1.2898\\sigma \\;\\Rightarrow\\; \\sigma = 3.88$; $\\quad \\mu = 170 + 0.2533 \\times 3.88 = 171.0$", mk: "M1 A1 A1",
          fig: normFig(170.98, 3.877, [[160, 170, "accent2"], [175, 185, "accent3"]], [[170, "170"], [175, "175"]], { xl: "cm", xt: [165, 170, 175, 180], extra: [{ text: [167, 0.25], t: "40%", size: 12, c: "accent2", b: true }, { text: [177.4, 0.25], t: "15%", size: 12, c: "accent3", b: true }] }) },
        { h: "(c) Independent people: multiply", m: "Woman: $1 - 0.40 - 0.15 = 0.45$; man: $P(170 < M < 175) = 0.0473$\n$0.45 \\times 0.0473 = 0.0213$", mk: "M1 A1ft A1", n: "The woman's probability needs no calculator: it is what the two given tails leave." }
      ], result: "(a) 0.270, 0.607 (b) $\\mu = 171.0$, $\\sigma = 3.88$ (c) 0.0213" } },
    { worked: { tag: "exam", title: "μ and σ when both probabilities are in different tails", src: "A-level June 2024 · P3 Q5(d) · 5 marks",
      q: "Discus distances $D \\sim N(\\mu, \\sigma^2)$ metres, with $P(D < 16.3) = 0.30$ and $P(D > 29.0) = 0.10$. Calculate $\\mu$ and $\\sigma$.",
      steps: [
        { h: "$z$ values", m: "$-0.5244$ (30% below) and $1.2816$ (10% above)", mk: "B1 B1" },
        { h: "Equations", m: "$16.3 = \\mu - 0.5244\\sigma$, $\\quad 29.0 = \\mu + 1.2816\\sigma$", mk: "M1" },
        { m: "$12.7 = 1.8060\\sigma \\;\\Rightarrow\\; \\sigma = 7.03$; $\\quad \\mu = 16.3 + 0.5244 \\times 7.03 = 20.0$", mk: "A1 A1", n: "Use 4 d.p. $z$ values: rounding to 0.524 and 1.28 shifts $\\sigma$ in the third figure." }
      ], result: "$\\mu = 20.0$ m, $\\sigma = 7.03$ m" } },

    /* ---------------------------------------------------------------- Page 4 */
    { page: "Conditional and combined probabilities" },
    "Conditional probability (S3.2) works the same way with a Normal variable — the probabilities just come from the calculator:",
    "$$P(X > a \\mid X > b) = \\frac{P(X > a \\text{ and } X > b)}{P(X > b)} = \\frac{P(X > a)}{P(X > b)} \\quad (a > b)$$",
    { fig: normFig(166.5, 6.1, [[160, 175, "accent2"], [150, 160, "accent3"]], [[150, "150"], [160, "160"], [175, "175"]], { xl: "height (cm)", xt: [150, 160, 170, 180],
      cap: "Oct 2021: given the height is between 150 and 175 (both shaded regions), the chance it is over 160 is the darker share: $\\frac{0.775}{0.915} = 0.847$." }) },
    { worked: { tag: "exam", title: "A conditional probability inside an interval", src: "A-level Oct 2021 · P3 Q5(c) · 4 marks",
      q: "Female heights are $N(166.5, 6.1^2)$ cm, and 91.5% lie between 150 cm and 175 cm. A female is chosen at random from those with heights between 150 cm and 175 cm. Find the probability that her height is more than 160 cm.",
      steps: [
        { h: "The condition", m: "$P(F > 160 \\mid 150 < F < 175) = \\dfrac{P(160 < F < 175)}{P(150 < F < 175)}$", mk: "M1 M1" },
        { m: "$= \\dfrac{0.7749}{0.9148} = 0.847$", mk: "A1ft A1", n: "The intersection of \"more than 160\" and \"150 to 175\" is \"160 to 175\"." }
      ], result: "0.847" } },
    { worked: { tag: "exam", title: "Batteries that have already lasted 16 hours", src: "A-level June 2018 · P3 Q5(a)–(c) · 9 marks",
      q: "Battery lifetimes $L$ are $N(18, 4^2)$ hours. Alice's calculator uses 4 batteries and stops when any one runs out. **(a)** Find the probability that a battery lasts longer than 16 hours. She has used the calculator for 16 hours with 4 new batteries and has 4 more hours of exams. **(b)** Find the probability that the calculator does not stop during the remaining exams. Instead, after 16 hours she replaces 2 of the batteries (chosen at random) with 2 new ones. **(c)** Show that the probability the calculator does not stop for the rest of her exams is 0.199 to 3 s.f.",
      steps: [
        { h: "(a)", m: "$P(L > 16) = 0.6915$", mk: "B1" },
        { h: "(b) Each old battery must last to 20, given it reached 16", m: "$P(L > 20 \\mid L > 16) = \\dfrac{P(L > 20)}{P(L > 16)} = \\dfrac{0.3085}{0.6915} = 0.4462$", mk: "M1 M1 A1" },
        { m: "All four, independently: $0.4462^4 = 0.0396$", mk: "M1 A1" },
        { h: "(c) Two new batteries must last 4 hours; two old ones 4 more", m: "$P(L > 4)^2 \\times 0.4462^2 = 0.99977^2 \\times 0.1991 = 0.199$", mk: "M1 A1ft A1*" }
      ], result: "(a) 0.6915 (b) 0.0396 (c) 0.199" } },
    { worked: { tag: "exam", title: "A Normal model that allows negative times — and its refinement", src: "A-level Oct 2020 · P3 Q5(c)(d) · 10 marks",
      q: "A dentist's routine appointment time $T$ is modelled by $N(5, 3.5^2)$ minutes. **(c)** (i) Find $P(T < 2)$. (ii) Find $P(T < 2 \\mid T > 0)$. (iii) Hence explain why this Normal distribution may not be a good model. The dentist suggests a refined model including only values $T > 2$. **(d)** Find the median time under the new model, to 1 d.p.",
      steps: [
        { h: "(c)(i)", m: "$P(T < 2) = 0.196$", mk: "B1" },
        { h: "(c)(ii)", m: "$\\dfrac{P(0 < T < 2)}{P(T > 0)} = \\dfrac{0.196 - 0.0766}{0.9234} = 0.129$", mk: "M1 A1 A1" },
        { h: "(c)(iii)", m: "The model gives $P(T < 0) = 0.077$ — a significant probability of a **negative** time, which is impossible; the answers to (i) and (ii) differ a lot because of it.", mk: "B1" },
        { h: "(d) Condition on $T > 2$", m: "The median $m$ satisfies $P(T > m \\mid T > 2) = 0.5$, i.e. $P(T > m) = 0.5 \\times P(T > 2) = 0.5 \\times 0.8043 = 0.4022$", mk: "M1 M1 A1ft" },
        { m: "$P(T < m) = 0.5978 \\;\\Rightarrow\\; \\dfrac{m - 5}{3.5} = 0.2477 \\;\\Rightarrow\\; m = 5.9$ min", mk: "M1 A1" }
      ], result: "(c) 0.196, 0.129; negative times (d) 5.9 minutes" } },

    /* ---------------------------------------------------------------- Page 5 */
    { page: "The Normal approximation to the binomial" },
    { callout: { t: "memorise", h: "When and how", body: [
      "If $X \\sim B(n, p)$ with **$n$ large** and **$p$ close to 0.5**, then approximately $X \\sim N\\big(np,\\; np(1 - p)\\big)$.",
      "Mean $\\mu = np$, variance $\\sigma^2 = np(1 - p)$ — the **variance**, not the standard deviation, goes in the bracket.",
      "**Continuity correction**: the binomial lives on whole numbers; each whole number $k$ becomes the interval $k - 0.5$ to $k + 0.5$."
    ] } },
    { table: { head: ["Binomial", "Normal with continuity correction"], rows: [
      ["$P(X = 110)$", "$P(109.5 < Y < 110.5)$"],
      ["$P(X > 110)$, i.e. $X \\ge 111$", "$P(Y > 110.5)$"],
      ["$P(X \\ge 110)$", "$P(Y > 109.5)$"],
      ["$P(X < 110)$, i.e. $X \\le 109$", "$P(Y < 109.5)$"],
      ["$P(X \\le 110)$", "$P(Y < 110.5)$"]
    ] } },
    { fig: { x: [104.5, 117.5], y: [0, 0.06], w: 480, h: 200, axes: { x: "x", y: "", xt: [105, 108, 110, 112, 115], yt: [] }, items: (function () {
      var it = [], f = "exp(-((x-110)^2)/(2*62.4))/sqrt(2*pi*62.4)";
      for (var k = 105; k <= 117; k++) {
        var v = Math.exp(-Math.pow(k - 110, 2) / 124.8) / Math.sqrt(2 * Math.PI * 62.4), hi = k >= 111;
        it.push({ poly: [[k - 0.5, 0], [k + 0.5, 0], [k + 0.5, v], [k - 0.5, v]], fill: hi ? "accent2" : "accent", alpha: hi ? 0.4 : 0.15, c: hi ? "accent2" : "accent", w: 1 });
      }
      it.push({ fn: f, from: 104.5, to: 117.5, c: "accent3", w: 2 });
      it.push({ vline: 110.5, label: "110.5", c: "danger" });
      return it;
    })(), cap: "Each bar of the binomial is 1 wide, centred on a whole number. \"More than 110\" starts at the bar for 111, whose left edge is 110.5." } },
    { worked: { tag: "exam", title: "Exact binomial, then the Normal approximation", src: "A-level June 2022 · P3 Q1 · 6 marks",
      q: "George hits a target with probability 0.48 on each throw. $X$ is the number of hits in 15 throws. **(a)** Find (i) $P(X = 3)$, (ii) $P(X \\ge 5)$. George now throws 250 times. **(b)** Use a Normal approximation to calculate the probability that he hits the target more than 110 times.",
      steps: [
        { h: "(a) $X \\sim B(15, 0.48)$", m: "(i) $0.0197$ $\\quad$ (ii) $1 - P(X \\le 4) = 0.920$", mk: "M1 A1 A1" },
        { h: "(b) Parameters", m: "$np = 120$, $\\; np(1 - p) = 62.4$: $\\; Y \\sim N(120, 62.4)$", mk: "B1" },
        { h: "Continuity correction", m: "$P(X > 110) \\approx P(Y > 110.5) = P\\left(Z > \\dfrac{110.5 - 120}{\\sqrt{62.4}}\\right) = P(Z > -1.203) = 0.885$", mk: "M1 A1", n: "Using $\\sigma = 62.4$ (forgetting the square root) is the classic slip." }
      ], result: "(a) 0.0197, 0.920 (b) 0.885" } },
    { worked: { tag: "exam", title: "Total sixes over 60 days", src: "A-level June 2024 · P3 Q1(d) · 4 marks",
      q: "A fair die is rolled 10 times a day for 60 days. Use a Normal approximation to estimate the probability that the total number of sixes is more than 95.",
      steps: [
        { h: "The binomial and its parameters", m: "$S \\sim B(600, \\frac16)$: $\\; \\mu = 100$, $\\; \\sigma^2 = 600 \\times \\frac16 \\times \\frac56 = 83.3$", mk: "M1 A1" },
        { h: "Approximate with correction", m: "$P(S > 95) \\approx P(T > 95.5) = P\\left(Z > \\dfrac{95.5 - 100}{9.129}\\right) = 0.689$", mk: "M1 A1", n: "$p = \\frac16$ is not close to 0.5, but $n = 600$ is so large that the approximation is still good." }
      ], result: "0.689" } },
    { worked: { tag: "exam", title: "Find $n$ from an approximated probability", src: "A-level Specimen · P3 Q3(b) · 6 marks",
      q: "36% of bulbs grow blue flowers. Maggie takes a random sample of $n$ bulbs. Using a Normal approximation, the probability that more than 244 grow blue flowers is 0.0521 to 4 d.p. Find $n$.",
      steps: [
        { h: "Approximate", m: "$T \\sim B(n, 0.36) \\approx N(0.36n,\\; 0.2304n)$", mk: "B1" },
        { h: "Continuity correction and $z$", m: "$P(T > 244.5) = 0.0521 \\;\\Rightarrow\\; \\dfrac{244.5 - 0.36n}{\\sqrt{0.2304n}} = 1.625$", mk: "M1 M1 A1" },
        { h: "A quadratic in $\\sqrt{n}$", m: "Let $x = \\sqrt{n}$: $\\; 0.36x^2 + 1.625 \\times 0.48x - 244.5 = 0$, i.e. $0.36x^2 + 0.78x - 244.5 = 0$", mk: "M1" },
        { m: "$x = 25$ (the negative root is rejected), so $n = 625$", mk: "A1" }
      ], result: "$n = 625$" } },

    /* ---------------------------------------------------------------- Page 6 */
    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Find** $P(\\ldots)$", "the probability (3 s.f.); write the statement, e.g. $P(L > 160)$"],
      ["**Find the value of** $k$ / **show that** $\\sigma = \\ldots$", "the $z$ value (4 d.p.), the standardised equation, the answer"],
      ["**Find $\\mu$ and $\\sigma$**", "two $z$ values, two equations, solved simultaneously"],
      ["**Use a Normal approximation**", "$N(np, np(1 - p))$, a continuity correction, then the probability"],
      ["**Explain why the model may not be suitable**", "a probability for an impossible value (negative time), or skew in the data"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**$z$ values to 4 d.p.** from the percentage-points table or the calculator ($1.6449$, $0.8416$, $-2.3263$, $-0.5244$).",
      "**Signs**: below the mean, negative $z$.",
      "**Variance vs sd**: $N(\\mu, \\sigma^2)$ — take the square root before standardising.",
      "**Continuity correction**: draw the whole numbers if unsure.",
      "**Units**: convert minutes to seconds and so on before standardising."
    ] },
    { h: "Misconceptions" },
    { ul: [
      "\"$N(150, 25)$ has sd 25\" — the second number is the variance unless written $25^2$.",
      "\"$P(X \\le a) \\ne P(X < a)$ for a Normal variable\" — they are equal.",
      "\"Continuity correction for a Normal variable\" — only when approximating a **discrete** one.",
      "\"Inverse Normal with the right-tail area\" — most calculators want the area to the left."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Normal CD", "**Distribution → Normal CD**: Lower, Upper, $\\sigma$, $\\mu$. For $P(X > a)$ use Upper $= 10^{99}$ (or a huge number); for $P(X < a)$ use Lower $= -10^{99}$."],
      ["Inverse Normal", "**Distribution → Inverse Normal**: the area to the **left**, $\\sigma$, $\\mu$. With $\\sigma = 1$, $\\mu = 0$ it gives $z$ values."]
    ] },
    { callout: { t: "mnemonic", h: "\"Square-root the variance, then standardise\"", body: "$N(120, 62.4)$ has $\\sigma = \\sqrt{62.4} = 7.90$ — divide by 7.90, not 62.4." } }
  ],
  flashcards: [
    ["Properties of $N(\\mu, \\sigma^2)$?", "Continuous, bell-shaped, symmetrical about $\\mu$; mean = median = mode; total area 1."],
    ["Where are the points of inflection of a Normal curve?", "$x = \\mu \\pm \\sigma$."],
    ["Within $\\mu \\pm \\sigma$, $\\pm 2\\sigma$, $\\pm 3\\sigma$?", "About 68%, 95%, 99.7%."],
    ["Standardising formula?", "$Z = \\frac{X - \\mu}{\\sigma}$."],
    ["$z$ for 5% in the upper tail?", "1.6449."],
    ["$z$ for 2.5% in the upper tail?", "1.9600."],
    ["$P(Y < 180) = 0.8$, $\\mu = 160$. $\\sigma$?", "$\\frac{20}{0.8416} = 23.8$."],
    ["Two unknowns $\\mu$, $\\sigma$ — method?", "Two $z$ values; $x_1 = \\mu + z_1\\sigma$, $x_2 = \\mu + z_2\\sigma$; solve."],
    ["$P(L > 20 \\mid L > 16)$ for a Normal $L$?", "$\\frac{P(L > 20)}{P(L > 16)}$."],
    ["Normal approximation to $B(n, p)$?", "$N(np, np(1 - p))$ for $n$ large, $p$ near 0.5."],
    ["Continuity correction for $P(X > 110)$?", "$P(Y > 110.5)$."],
    ["Continuity correction for $P(X \\ge 110)$?", "$P(Y > 109.5)$."],
    ["Why might $N(5, 3.5^2)$ be a poor model for appointment times?", "It gives a sizeable probability (0.077) of negative times."],
    ["$P(X = a)$ for a Normal variable?", "0."]
  ],
  quiz: [
    { q: "$X \\sim N(50, 4^2)$. $P(X < 50) =$", opts: ["0.5", "0.4", "0.68", "1"], ans: 0, why: "Symmetry." },
    { q: "$X \\sim N(50, 16)$. The standard deviation is", opts: ["4", "16", "256", "8"], ans: 0, why: "Variance 16." },
    { q: "Points of inflection of $N(20, 3^2)$ are at", opts: ["17 and 23", "14 and 26", "20", "11 and 29"], ans: 0, why: "$\\mu \\pm \\sigma$." },
    { q: "$B(200, 0.45)$ is approximated by", opts: ["$N(90, 49.5)$", "$N(90, 7.04)$", "$N(110, 49.5)$", "$N(90, 0.2475)$"], ans: 0, why: "$np = 90$, $np(1 - p) = 49.5$." },
    { q: "Continuity correction for $P(X < 30)$:", opts: ["$P(Y < 29.5)$", "$P(Y < 30.5)$", "$P(Y < 30)$", "$P(Y > 29.5)$"], ans: 0, why: "$X \\le 29$." },
    { q: "$P(X < k) = 0.01$, $X \\sim N(100, 10^2)$. $k \\approx$", opts: ["76.7", "123.3", "99.9", "90"], ans: 0, why: "$100 - 2.3263 \\times 10$." }
  ]
};

/* =====================================================================
   S4.3  Selecting a distribution
   ===================================================================== */
C["maths:S4.3"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Choosing a distribution — the whole topic on one page" },
    "Spec 4.3: select an appropriate probability distribution for a context **with reasons**, and recognise when the **binomial** or **Normal** model may **not** be appropriate.",
    "Three models are on the specification:",
    { table: { head: ["Model", "Type", "Use it when", "It fails when"], rows: [
      ["**Discrete uniform**", "discrete", "a finite set of values, all equally likely (fair die, fair spinner)", "some values are more likely (cloud cover)"],
      ["**Binomial** $B(n, p)$", "discrete", "a count of successes in $n$ fixed, independent trials with constant $p$", "trials are dependent; $p$ changes; $n$ not fixed; sampling without replacement from a small population"],
      ["**Normal** $N(\\mu, \\sigma^2)$", "continuous", "a measured quantity, symmetrical, bell-shaped, single peak", "data skewed; values bounded (e.g. cannot be negative) with $\\mu$ close to the bound; discrete counts with small $n$"]
    ] } },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "Choosing with reasons" },
    { fig: { w: 520, h: 230, items: [
      { poly: [[170, 10], [350, 10], [350, 44], [170, 44]], fill: "accent", alpha: 0.12, c: "accent" },
      { text: [260, 27], t: "Counted or measured?", size: 12, c: "text" },
      { line: [[215, 44], [110, 84]], arrow: true, c: "text2", label: "counted", loff: -12 },
      { line: [[305, 44], [410, 84]], arrow: true, c: "text2", label: "measured", loff: 12 },
      { poly: [[20, 86], [200, 86], [200, 120], [20, 120]], fill: "accent2", alpha: 0.12, c: "accent2" },
      { text: [110, 103], t: "successes in n trials?", size: 12, c: "text" },
      { line: [[70, 120], [60, 160]], arrow: true, c: "text2", label: "yes", loff: -10 },
      { line: [[150, 120], [195, 160]], arrow: true, c: "text2", label: "no", loff: 10 },
      { text: [55, 178], t: "BINOMIAL", size: 12, c: "accent2", b: true }, { text: [55, 194], t: "indep., same p", size: 10.5, c: "text2" },
      { text: [205, 178], t: "equally likely values?", size: 10.5, c: "text2" }, { text: [205, 194], t: "DISCRETE UNIFORM", size: 12, c: "accent2", b: true },
      { poly: [[320, 86], [500, 86], [500, 120], [320, 120]], fill: "accent3", alpha: 0.12, c: "accent3" },
      { text: [410, 103], t: "symmetric, bell-shaped?", size: 12, c: "text" },
      { line: [[410, 120], [410, 160]], arrow: true, c: "text2", label: "yes", loff: 10 },
      { text: [410, 178], t: "NORMAL", size: 12, c: "accent3", b: true }, { text: [410, 194], t: "check: mean ≈ median, no impossible tail", size: 10.5, c: "text2" },
      { text: [260, 222], t: "Large n, p near 0.5: a binomial count can be approximated by a Normal", size: 11, c: "muted", i: true }
    ], cap: "Choose from the kind of data first, then check the conditions in context." } },
    { callout: { t: "memorise", h: "Reasons that score", body: [
      "**Binomial** — \"a fixed number of [packets], each [contains a prize] or not, independently, with the same probability\". Critique with *independence* or *constant probability*, in context.",
      "**Normal** — \"[heights] are continuous and roughly symmetrical about the mean\". Critique with *skew* (mean ≠ median, histogram not symmetrical) or an *impossible tail* (negative times).",
      "**Uniform** — \"each [side] is equally likely\". Critique with data showing unequal frequencies."
    ] } },
    { worked: { tag: "exam", title: "Why the Normal model is wrong for hospital stays", src: "A-level June 2023 · P3 Q6(b)(e)(i)(f) · 3 marks",
      q: "A histogram of the hours, $T$, that 90 patients stay in hospital is highest between 7 and 16 hours and has a long right tail to 40 hours; the mean is 14.9 and the standard deviation 9.3. Tomas suggests $T \\sim N(14.9, 9.3^2)$. **(b)** With reference to the histogram, state whether Tomas' model could be suitable. **(e)(i)** Estimate $P(10 < T < 30)$ using Tomas' model. Xiang models the frequency polygon by $y = 99xe^{-x}$, $0 \\le x \\le 4$ ($x$ in tens of hours). **(f)** State one limitation of Xiang's model.",
      steps: [
        { h: "(b) Shape", m: "Not suitable: the histogram is skewed (long right tail) but a Normal distribution is symmetrical.", mk: "B1" },
        { h: "(e)(i)", m: "$P(10 < T < 30) = 0.649$", mk: "B1", n: "Compare the histogram's 0.538 — the symmetrical model overstates the middle." },
        { h: "(f)", m: "Xiang's curve stops at $x = 4$ (40 hours), but some patients might stay longer than 40 hours.", mk: "B1" }
      ], result: "(b) no — skewed (e)(i) 0.649 (f) ignores stays over 40 hours" } },
    { worked: { tag: "variation", title: "Pick a model for each situation", src: "practice variant",
      q: "Suggest a suitable distribution, with a reason, for: (a) the number of defective bulbs in a box of 50, when 2% of bulbs are defective; (b) the mass of a randomly chosen apple; (c) the number on a fair 8-sided die; (d) the number of days in a fortnight with rain at Leeming.",
      steps: [
        { h: "(a)", m: "$B(50, 0.02)$: a fixed number of bulbs, each defective or not, independently, probability 0.02." },
        { h: "(b)", m: "Normal: mass is continuous and likely to be roughly symmetrical about a mean." },
        { h: "(c)", m: "Discrete uniform on 1–8: each face equally likely." },
        { h: "(d)", m: "$B(14, p)$ is the natural model, but it is doubtful: rainy days come in spells (not independent) and $p$ varies through the season." }
      ], result: "(a) binomial (b) Normal (c) discrete uniform (d) binomial, with doubts" } },
    { worked: { tag: "variation", title: "Normal approximation or not — check the conditions", src: "practice variant (A-level June 2025 Q3 shape)",
      q: "On average 1.5% of components are defective. Explain why a Normal approximation would not be suitable for the number of defectives in a sample of 36, and state the model you would use.",
      steps: [
        { h: "Conditions for the approximation", m: "$n$ large and $p$ close to 0.5. Here $p = 0.015$ is far from 0.5 and $np = 0.54$ is tiny: the distribution is very skewed." },
        { h: "Model", m: "Use the binomial directly: $D \\sim B(36, 0.015)$." }
      ], result: "$p$ is far from 0.5 and $np$ is small — use $B(36, 0.015)$" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Exam toolkit" },
    { ul: [
      "**State the model with its parameters**: $B(40, \\frac17)$, $N(166.5, 6.1^2)$.",
      "**Give the reason in context**: name the trials, the success, the measured quantity.",
      "**For a critique, pick the condition that genuinely fails** — independence and constant probability for binomial; symmetry and impossible values for Normal.",
      "**Uniform is a discrete model** here; a continuous model for a count (or for oktas) is wrong."
    ] },
    { callout: { t: "mnemonic", h: "\"Count → binomial or uniform; measure → Normal\"", body: "Decide discrete or continuous before anything else." } }
  ],
  flashcards: [
    ["When is a binomial model appropriate?", "A count of successes in a fixed number of independent trials with constant probability."],
    ["When is a Normal model appropriate?", "A continuous measurement, roughly symmetrical and bell-shaped."],
    ["When is a discrete uniform model appropriate?", "A finite set of equally likely values."],
    ["Evidence against a Normal model?", "Skew (mean far from median, histogram asymmetrical) or a large probability of impossible values."],
    ["Evidence against a binomial model?", "Trials not independent, or the probability not constant."],
    ["Conditions for a Normal approximation to a binomial?", "$n$ large, $p$ close to 0.5."],
    ["$B(36, 0.015)$ — Normal approximation suitable?", "No: $np = 0.54$, very skewed."],
    ["Hospital stays: mean 14.9, sd 9.3, long right tail. Normal?", "No — skewed, and it allows negative stays."]
  ],
  quiz: [
    { q: "The number of heads in 20 tosses is best modelled by", opts: ["$B(20, 0.5)$", "$N(10, 5)$ exactly", "discrete uniform", "$B(0.5, 20)$"], ans: 0, why: "Fixed independent trials." },
    { q: "The height of a randomly chosen adult is best modelled by", opts: ["a Normal distribution", "a binomial", "a discrete uniform", "none"], ans: 0, why: "Continuous and symmetrical." },
    { q: "A Normal model is unsuitable for waiting times with mean 2 min, sd 3 min because", opts: ["it gives negative times a large probability", "times are continuous", "the mean is small", "it is symmetrical"], ans: 0, why: "Impossible tail." },
    { q: "A binomial model for rainy days fails mainly because", opts: ["days are not independent", "rain is continuous", "there are 2 outcomes", "$n$ is fixed"], ans: 0, why: "Weather comes in spells." }
  ]
};


/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
