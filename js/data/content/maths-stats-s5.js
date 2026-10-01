/* Kurenai OS — deep content: Statistics, section S5 (Statistical
   hypothesis testing) at full A-level depth. Each topic here REPLACES the
   outline entry the base file used to carry: every question shape Edexcel
   has set on the language of testing, critical regions, tests for a
   binomial proportion, tests for zero correlation and tests for the mean
   of a Normal distribution (9MA0 Paper 3 Section A, 8MA0 Paper 2 Section
   A, June 2018–2025, the Oct/Nov 2020–21 series and the Specimens) is
   explained and then worked through with Edexcel M1/A1/B1 marks, in the
   notation of the Mathematical Formulae and Statistical Tables booklet.
   Past-paper item banks stay in bank-maths-stats.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---- figure helpers ---- */

/* binomial bar chart with the critical region in a contrasting colour:
   crLo = largest value in the lower tail (or -1), crHi = smallest value in
   the upper tail (or n + 1), obs = the observed value (marked) */
function binomCR(n, p, crLo, crHi, o) {
  o = o || {};
  var ps = [], c = 1, top = 0;
  for (var r = 0; r <= n; r++) { if (r > 0) c = c * (n - r + 1) / r; ps.push(c * Math.pow(p, r) * Math.pow(1 - p, n - r)); top = Math.max(top, ps[r]); }
  var x1 = o.to != null ? o.to : n, items = [];
  for (var k = 0; k <= x1; k++) {
    var inCR = k <= crLo || k >= crHi;
    items.push({ line: [[k, 0], [k, ps[k]]], c: inCR ? "accent2" : "muted", w: o.bw || 5 });
  }
  if (o.obs != null) items.push({ pt: [o.obs, ps[o.obs] + top * 0.06], c: "accent3", r: 4, label: "observed " + o.obs, pos: "n", lc: "accent3" });
  return { x: [-1, x1 + 1], y: [0, top * 1.3], w: o.w || 500, h: o.h || 210,
    axes: { x: "x", y: "P(X = x)", xt: o.xt, yt: [] }, items: items.concat(o.extra || []), cap: o.cap };
}
/* a standard-Normal (or sampling-distribution) curve with shaded tail(s) */
function tailFig(mu, sd, tails, o) {
  o = o || {};
  var f = "exp(-((x-(" + mu + "))^2)/(2*" + sd + "^2))", lo = mu - 3.6 * sd, hi = mu + 3.6 * sd, items = [];
  tails.forEach(function (t) { items.push({ shade: { fn: f, from: Math.max(lo, t[0]), to: Math.min(hi, t[1]) }, c: t[2] || "danger", alpha: 0.45 }); });
  items.push({ fn: f, from: lo, to: hi, c: "accent", w: 2.2 });
  /* marks: [x, label, colour, labelHeight] — a second mark sits lower so labels never collide */
  (o.vl || []).forEach(function (v) {
    items.push({ line: [[v[0], 0], [v[0], 1.08]], c: v[2] || "text2", w: 1.4, dash: true });
    items.push({ text: [v[0], v[3] != null ? v[3] : 1.1], t: v[1], pos: "e", size: 11.5, c: v[2] || "text2", i: true, off: 4 });
  });
  return { x: [lo, hi], y: [0, 1.15], w: o.w || 480, h: o.h || 190, axes: { x: o.xl || "", y: "", xt: o.xt, yt: [] }, items: items.concat(o.extra || []), cap: o.cap };
}

/* =====================================================================
   S5.1  The language of hypothesis testing; correlation tests
   ===================================================================== */
C["maths:S5.1"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Hypothesis testing — the whole topic on one page" },
    "A hypothesis test asks whether a sample gives **enough evidence** to reject a claim about a **population**.",
    "Spec 5.1 is the vocabulary, developed through the binomial model, and its extension to **correlation coefficients**; 5.2 and 5.3 are the full tests for a binomial proportion and a Normal mean.",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Write the hypotheses", "1", "every test"],
      ["Find a one-tailed critical region; its actual significance level", "2–3", "AS June 2019 Q5"],
      ["Find a two-tailed critical region, each tail as close to 2.5% as possible", "3–4", "AS 2023 Q4, A-level 2022 Q4, 2024 Q4"],
      ["Spot the errors in someone's test", "2–3", "AS June 2019 Q5"],
      ["PMCC test with a critical value from the table", "3", "A-level 2018, Oct 2020, Oct 2021, 2022, 2024, Specimen"],
      ["PMCC test with a given p-value", "2", "A-level June 2025 Q4"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**The language** — every term in the specification, defined and illustrated.",
      "**Critical regions** for a binomial test — one- and two-tailed, the actual significance level.",
      "**Testing for correlation** — hypotheses in $\\rho$, the critical-value table, p-values.",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "The language" },
    { kv: [
      ["Null hypothesis $H_0$", "The claim assumed true unless the evidence is strong enough: a statement of **no change**, always with \"=\": $H_0: p = 0.15$, $H_0: \\rho = 0$, $H_0: \\mu = 18$."],
      ["Alternative hypothesis $H_1$", "What you are looking for evidence of: $p > 0.15$ (increase), $p < 0.15$ (decrease) or $p \\ne 0.15$ (change)."],
      ["Population parameter", "Hypotheses are about the **population**: $p$ (proportion), $\\rho$ (correlation), $\\mu$ (mean) — never about $x$, $r$ or $\\bar{x}$, which are sample values."],
      ["Test statistic", "The quantity calculated from the sample to decide the test: the number of successes $X$, the PMCC $r$, or the sample mean $\\bar{X}$."],
      ["Significance level $\\alpha$", "The threshold for \"unlikely\" — 5%, 1%, 10%. It is the **probability of incorrectly rejecting $H_0$** when $H_0$ is true."],
      ["One-tailed test", "$H_1$ has $>$ or $<$: evidence sought in one direction only."],
      ["Two-tailed test", "$H_1$ has $\\ne$: the significance level is **split equally** between the two tails."],
      ["Critical value", "The first value that falls in the critical region."],
      ["Critical region (CR)", "The set of values of the test statistic that lead to **rejecting $H_0$**."],
      ["Acceptance region", "The values that do **not** lead to rejecting $H_0$ — everything outside the CR."],
      ["p-value", "The probability, assuming $H_0$, of a result **at least as extreme** as the one observed. Reject $H_0$ if the p-value is less than the significance level (for a two-tailed test, compare with half of it — or double the p-value)."],
      ["Actual significance level", "For a discrete test statistic, the true probability of the critical region (e.g. 2.78% rather than 5%)."]
    ] },
    { fig: binomCR(30, 0.15, -1, 9, { to: 16, xt: [0, 2, 4, 6, 8, 10, 12, 14, 16], obs: 8, cap: "$X \\sim B(30, 0.15)$, testing for an increase at 5%: the critical region is $X \\ge 9$ (amber), with actual significance level $P(X \\ge 9) = 0.0278$. An observed 8 is just outside it." }) },
    { callout: { t: "memorise", h: "The conclusion — two sentences, both needed", body: [
      "**Statistical:** \"0.0698 > 0.05, so not significant — do not reject $H_0$\" (or \"8 is not in the critical region\").",
      "**In context:** \"there is insufficient evidence that the proportion of customers buying chocolate has increased\".",
      "Never \"accept $H_0$\" or \"$H_0$ is true\": a test can only fail to find evidence. Never \"proves\": evidence supports."
    ] } },
    { callout: { t: "warn", h: "A sample is used to make an inference about the population", body: [
      "The test does not ask \"is 8 out of 30 more than 15%?\" — it obviously is. It asks whether 8 is **so unlikely under $p = 0.15$** that $p$ is probably no longer 0.15.",
      "The significance level is the risk you accept of rejecting $H_0$ wrongly. A formal treatment of Type I errors is not required, but this sentence is."
    ] } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Critical regions" },
    { callout: { t: "memorise", h: "Finding a binomial critical region", body: [
      "**One tail, upper** ($H_1: p > p_0$): find the smallest $c$ with $P(X \\ge c) \\le \\alpha$. Show $P(X \\ge c)$ **and** $P(X \\ge c - 1)$ to prove $c$ is the boundary.",
      "**One tail, lower** ($H_1: p < p_0$): the largest $c$ with $P(X \\le c) \\le \\alpha$; show $P(X \\le c)$ and $P(X \\le c + 1)$.",
      "**Two tails** ($H_1: p \\ne p_0$): each tail at most (or as close as possible to) $\\frac{\\alpha}{2}$ — the question says which.",
      "**Actual significance level** = the probability of the whole critical region (add both tails)."
    ] } },
    { worked: { tag: "exam", title: "Spot the errors, then find the critical region", src: "AS June 2019 · P2 Q5 · 6 marks",
      q: "Past records show 15% of customers buy chocolate. After moving the chocolate closer to the till, a random sample of 30 customers has 8 who buy chocolate. Julie's test of the shopkeeper's belief that the proportion has increased reads: $H_0: p = 0.15$, $H_1: p \\ne 0.15$; $X \\sim B(30, 0.15)$; $P(X = 8) = 0.0420$; $0.0420 < 0.05$ so reject $H_0$; there is evidence the proportion has increased. **(a)** Identify the first two errors. **(b)** Explain whether these errors affect the conclusion. **(c)** Find, at the 5% level, the critical region for a one-tailed test of the belief (tail probability less than 0.05). **(d)** Find the actual significance level.",
      steps: [
        { h: "(a) Error 1: the alternative", m: "An increase is one-tailed: $H_1: p > 0.15$.", mk: "B1" },
        { h: "Error 2: the probability", m: "The test needs $P(X \\ge 8)$ — at least as extreme — not $P(X = 8)$.", mk: "B1", n: "\"$P(X = 8)$ is wrong\" alone is not enough; say what it should be." },
        { h: "(b)", m: "Yes: $P(X \\ge 8) = 1 - P(X \\le 7) = 0.0698 > 0.05$, so $H_0$ should **not** be rejected — the conclusion changes.", mk: "B1" },
        { h: "(c) The boundary pair", m: "$P(X \\ge 8) = 0.0698 > 0.05$; $\\quad P(X \\ge 9) = 1 - 0.9722 = 0.0278 < 0.05$", mk: "M1" },
        { m: "Critical region $X \\ge 9$", mk: "A1" },
        { h: "(d)", m: "$P(X \\ge 9) = 0.0278$ — 2.78%", mk: "B1ft" }
      ], result: "(a) $H_1$ should be $p > 0.15$; use $P(X \\ge 8)$ (b) yes — 0.0698 > 0.05 (c) $X \\ge 9$ (d) 0.0278" } },
    { worked: { tag: "exam", title: "A two-tailed critical region, tails as close to 2.5% as possible", src: "AS June 2023 · P2 Q4 · 7 marks",
      q: "25% of adults in a large population have an allergy. Rylan believes the proportion differs from 25%, takes a random sample of 50 adults and tests $H_0: p = 0.25$ at the 5% level. **(a)** Write down the alternative hypothesis. **(b)** Find the critical region, stating the probability of each tail, which should be as close to 2.5% as possible. **(c)** State the actual probability of incorrectly rejecting $H_0$. 10 adults in his sample have the allergy. **(d)** State the conclusion.",
      steps: [
        { h: "(a)", m: "$H_1: p \\ne 0.25$", mk: "B1" },
        { h: "(b) Lower tail, $X \\sim B(50, 0.25)$", m: "$P(X \\le 6) = 0.0194$; $\\; P(X \\le 7) = 0.0453$ — so 6 is closest to 0.025.", mk: "B1 M1" },
        { h: "Upper tail", m: "$P(X \\ge 19) = 0.0287$; $\\; P(X \\ge 20) = 0.0139$ — 0.0287 is closer to 0.025.", mk: "A1",
          fig: binomCR(50, 0.25, 6, 19, { to: 26, xt: [0, 5, 10, 15, 20, 25], obs: 10 }) },
        { m: "Critical region: $X \\le 6$ or $X \\ge 19$", mk: "A1", n: "\"As close as possible\" can choose a tail slightly **above** 2.5% — read the instruction: AS 2023 says closest, A-level 2022 says \"less than 0.025\"." },
        { h: "(c)", m: "$0.0194 + 0.0287 = 0.0481$", mk: "B1ft" },
        { h: "(d)", m: "10 is not in the critical region: there is insufficient evidence that the proportion with the allergy differs from 25%.", mk: "B1" }
      ], result: "(a) $p \\ne 0.25$ (b) $X \\le 6$ or $X \\ge 19$ (c) 0.0481 (d) no evidence of a change" } },
    { worked: { tag: "exam", title: "Two tails, each below 0.025; actual level; a decision", src: "A-level June 2022 · P3 Q4 · 6 marks",
      q: "10% of a dentist's customers arrive late. A new manager believes the proportion has changed. A random sample of 50 customers is taken. **(a)** Write down suitable hypotheses. **(b)** Using a 5% level, find the critical region for a two-tailed test, with the probability of rejection in each tail less than 0.025. **(c)** Find the actual significance level. 15 of the 50 customers arrived late. **(d)** Comment on the manager's belief.",
      steps: [
        { h: "(a)", m: "$H_0: p = 0.1$, $\\; H_1: p \\ne 0.1$", mk: "B1" },
        { h: "(b) $X \\sim B(50, 0.1)$", m: "Lower: $P(X = 0) = 0.0052$ (and $P(X \\le 1) = 0.0338 > 0.025$)\nUpper: $P(X \\ge 10) = 0.0245$ (and $P(X \\ge 9) = 0.0579 > 0.025$)", mk: "M1 A1" },
        { m: "Critical region: $X = 0$ or $X \\ge 10$", mk: "A1" },
        { h: "(c)", m: "$0.0052 + 0.0245 = 0.0297$", mk: "B1ft" },
        { h: "(d)", m: "15 is in the critical region, so there is evidence that the proportion arriving late has changed — supporting the manager's belief.", mk: "B1ft" }
      ], result: "(b) $X = 0$ or $X \\ge 10$ (c) 0.0297 (d) evidence of a change" } },
    { worked: { tag: "exam", title: "Left-handed adults: a two-tailed region and a comment", src: "A-level June 2024 · P3 Q4 · 6 marks",
      q: "10% of adults in a country are left-handed. Freya believes the proportion among adults under 25 is different, and takes a random sample of 40. **(a)** Find the critical region for a suitable test, stating hypotheses, using 5%, and stating the probability of rejection in each tail. **(b)** Write down the actual significance level. 7 adults in her sample were left-handed. **(c)** Comment on Freya's belief.",
      steps: [
        { h: "(a) Hypotheses", m: "$H_0: p = 0.1$, $\\; H_1: p \\ne 0.1$", mk: "B1" },
        { h: "Tails of $B(40, 0.1)$", m: "$P(X = 0) = 0.0148$; $\\; P(X \\ge 9) = 1 - 0.9845 = 0.0155$", mk: "M1 A1" },
        { m: "Critical region: $X = 0$ or $X \\ge 9$", mk: "A1" },
        { h: "(b)", m: "$0.0148 + 0.0155 = 0.0303$", mk: "B1ft" },
        { h: "(c)", m: "7 is not in the critical region: insufficient evidence that the proportion of left-handed adults under 25 differs from 10%.", mk: "B1" }
      ], result: "(a) $X = 0$ or $X \\ge 9$ (b) 0.0303 (c) no evidence for Freya's belief" } },
    { callout: { t: "tip", h: "Which tail is the observed value in? Use $np$", body: [
      "In a two-tailed test, compare the observed count with the expected value $np$ under $H_0$.",
      "Above $np$: test the upper tail, $P(X \\ge x)$. Below: the lower tail, $P(X \\le x)$. Then compare with half the significance level.",
      "This \"informal appreciation that the expected value of a binomial is $np$\" is named in the specification."
    ] } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Testing for correlation" },
    "The **product moment correlation coefficient** $r$ measures how close a sample's points lie to a straight line ($-1 \\le r \\le 1$). The test asks whether the **population** correlation coefficient $\\rho$ (rho) is non-zero.",
    { callout: { t: "memorise", h: "The PMCC test", body: [
      "$H_0: \\rho = 0$ $\\quad$ against $\\quad H_1: \\rho > 0$, $\\; \\rho < 0$ $\\;$ or $\\; \\rho \\ne 0$.",
      "Look up the **critical value** in the booklet's *Critical values for correlation coefficients* table: the row is the sample size $n$, the column the **one-tail** significance level (for a two-tailed test at 5%, use the 2.5% column).",
      "**Reject $H_0$** when $|r|$ is at least the critical value **and $r$ has the sign $H_1$ predicts**.",
      "Or, if a **p-value** is given, reject $H_0$ when it is less than the significance level.",
      "Hypotheses must be in $\\rho$, not $r$. You find $r$ on your calculator; the formula is not needed."
    ] } },
    { table: { head: ["$n$", "5% one-tail (10% two-tail)", "2.5% one-tail (5% two-tail)"], rows: [
      ["7", "0.6694", "0.7545"], ["8", "0.6215", "0.7067"], ["10", "0.5494", "0.6319"], ["16", "0.4259", "0.4973"],
      ["19", "0.3887", "0.4555"], ["30", "0.3061", "0.3610"]
    ] } },
    { fig: { x: [-1, 1], y: [0, 1], w: 500, h: 130, axes: false, items: [
      { line: [[-0.95, 0.5], [0.95, 0.5]], c: "text2", w: 1.6 },
      { poly: [[-0.95, 0.42], [-0.4259, 0.42], [-0.4259, 0.58], [-0.95, 0.58]], fill: "accent2", alpha: 0.3, c: "accent2", w: 1 },
      { text: [-0.95, 0.95], t: "−1", size: 11, c: "muted" }, { text: [0, 0.95], t: "0", size: 11, c: "muted" }, { text: [0.95, 0.95], t: "1", size: 11, c: "muted" },
      { line: [[0, 0.44], [0, 0.56]], c: "muted", w: 1.4 },
      { text: [-0.4259, 0.18], t: "critical value −0.4259", size: 11, c: "accent2", b: true }, { text: [-0.8, 0.72], t: "reject H₀", size: 11, c: "accent2", b: true },
      { pt: [-0.545, 0.5], c: "accent3", r: 4.5 }, { text: [-0.545, 0.78], t: "r = −0.545", size: 11, c: "accent3", b: true }
    ], cap: "$H_1: \\rho < 0$, $n = 16$, 5%: the critical region is $r \\le -0.4259$. Marc's $r = -0.545$ falls inside it." } },
    { worked: { tag: "exam", title: "Calculate $r$, then test for negative correlation", src: "A-level Oct 2021 · P3 Q2 · 6 marks",
      q: "Marc records, for 16 students, the number of letters in their last name ($x$) and first name ($y$): $x$ = 3, 6, 8, 7, 5, 3, 11, 3, 4, 5, 4, 9, 7, 10, 6, 6 and $y$ = 7, 7, 4, 4, 6, 8, 5, 5, 8, 4, 7, 4, 5, 5, 6, 3. **(a)** Describe the correlation. Marc suggests that parents with long last names give their children shorter first names. **(b)** Comment on the suggestion. **(c)** Find the PMCC. **(d)** Test, at 5%, whether there is evidence of negative correlation.",
      steps: [
        { h: "(a)", m: "Negative (weak).", mk: "B1" },
        { h: "(b)", m: "Compatible: the correlation is negative — longer last names tend to go with shorter first names.", mk: "B1" },
        { h: "(c) Calculator, 2-variable statistics", m: "$r = -0.545$", mk: "B1" },
        { h: "(d) Hypotheses", m: "$H_0: \\rho = 0$, $\\; H_1: \\rho < 0$", mk: "B1" },
        { h: "Critical value", m: "$n = 16$, 5% one-tail: $-0.4259$", mk: "M1" },
        { m: "$-0.545 < -0.4259$: significant — reject $H_0$. There is evidence of negative correlation between the number of letters in a student's last name and first name.", mk: "A1" }
      ], result: "(c) −0.545 (d) significant: evidence of negative correlation" } },
    { worked: { tag: "exam", title: "A one-tailed test that fails", src: "A-level June 2024 · P3 Q2(b) · 3 marks",
      q: "For 10 values of $t$, the PMCC between a bird's height $h$ and time $t$ is $-0.510$. Test whether there is evidence of a negative correlation between height and time, stating your hypotheses, using 5% and stating the critical value.",
      steps: [
        { h: "Hypotheses", m: "$H_0: \\rho = 0$, $\\; H_1: \\rho < 0$", mk: "B1" },
        { h: "Critical value", m: "$n = 10$, 5% one-tail: $-0.5494$", mk: "M1" },
        { h: "Compare", m: "$-0.510 > -0.5494$: not significant. Insufficient evidence of a negative correlation between height and time.", mk: "A1", n: "The scatter diagram showed a curve: a non-linear relationship can have a weak $r$." }
      ], result: "Not significant: −0.510 > −0.5494" } },
    { worked: { tag: "exam", title: "A two-tailed correlation test, then a prediction", src: "A-level Oct 2020 · P3 Q2(c)(d) · 4 marks",
      q: "Stav believes there is a correlation between Daily Total Sunshine and Daily Maximum Relative Humidity at Heathrow. For a random sample of 30 days, $r = -0.377$. **(c)** Carry out a suitable test at 5%, stating your hypotheses and critical value. On a random day the humidity was 97%. **(d)** Comment on the number of hours of sunshine you would expect, giving a reason.",
      steps: [
        { h: "(c) \"A correlation\" — no direction", m: "$H_0: \\rho = 0$, $\\; H_1: \\rho \\ne 0$", mk: "B1" },
        { h: "Two-tailed 5%: the 2.5% column", m: "$n = 30$: critical values $\\pm 0.3610$", mk: "M1" },
        { m: "$-0.377 < -0.3610$: significant. There is evidence of a correlation between sunshine and humidity.", mk: "A1" },
        { h: "(d)", m: "97% is very high humidity, and the correlation is negative, so expect **fewer** hours of sunshine than average for Heathrow.", mk: "B1" }
      ], result: "(c) significant (d) lower than average sunshine" } },
    { worked: { tag: "exam", title: "Testing with a given p-value", src: "A-level June 2025 · P3 Q4(e) · 2 marks",
      q: "A teacher claims that the more sunshine in a day, the less rain there is. Using all the Leeming 2015 data as a sample, the PMCC between Daily Total Sunshine and Daily Total Rainfall is $-0.160$, and for a suitable test the p-value is 0.015. Using a 5% level, state the hypotheses and the conclusion.",
      steps: [
        { h: "Hypotheses", m: "$H_0: \\rho = 0$, $\\; H_1: \\rho < 0$", mk: "B1" },
        { h: "Compare the p-value", m: "$0.015 < 0.05$: significant. There is evidence to support the teacher's claim — negative correlation between sunshine and rainfall.", mk: "B1", n: "A weak $r$ can be significant with a large sample (184 days)." }
      ], result: "Significant — evidence for the claim" } },
    { worked: { tag: "exam", title: "A coded (log) correlation test", src: "A-level June 2022 · P3 Q6(b) · 3 marks",
      q: "For 19 people, the PMCC between $x = \\log_{10} m$ (minutes of exercise) and $y = \\log_{10} h$ (resting heart rate) is $-0.897$. Test whether there is significant evidence of negative correlation between $x$ and $y$, stating hypotheses, using 5% and stating the critical value.",
      steps: [
        { h: "Hypotheses", m: "$H_0: \\rho = 0$, $\\; H_1: \\rho < 0$", mk: "B1" },
        { h: "Critical value", m: "$n = 19$: $-0.3887$", mk: "M1" },
        { m: "$-0.897 < -0.3887$: reject $H_0$ — there is evidence of negative correlation between $x$ and $y$.", mk: "A1" }
      ], result: "Significant: −0.897 < −0.3887" } },
    { worked: { tag: "exam", title: "Tessa's shop: a negative one-tailed test", src: "A-level June 2018 · P3 Q2(a) · 3 marks",
      q: "For 8 summer weeks, the PMCC between weekly sales and average weekly temperature is $-0.915$. Stating your hypotheses and using a 5% level, test whether the correlation is negative.",
      steps: [
        { h: "Hypotheses", m: "$H_0: \\rho = 0$, $\\; H_1: \\rho < 0$", mk: "B1" },
        { h: "Critical value", m: "$n = 8$, 5% one-tail: $-0.6215$", mk: "M1" },
        { m: "$-0.915 < -0.6215$: significant — evidence of negative correlation between sales and temperature.", mk: "A1" }
      ], result: "Significant: evidence of negative correlation" } },
    { worked: { tag: "exam", title: "A 10% test for positive correlation from seven places", src: "A-level Specimen · P3 Q2(b) · 3 marks",
      q: "For the 7 northern-hemisphere places in the large data set, the PMCC between the July mean temperature and mean rainfall is $r = 0.658$. Stating your hypotheses, test at the 10% level whether the population correlation coefficient is greater than zero.",
      steps: [
        { h: "Hypotheses", m: "$H_0: \\rho = 0$, $\\; H_1: \\rho > 0$", mk: "B1" },
        { h: "Critical value", m: "$n = 7$, 10% one-tail: $0.5509$", mk: "M1" },
        { m: "$0.658 > 0.5509$: reject $H_0$ — there is evidence that the population correlation coefficient is greater than zero.", mk: "A1", n: "Significant, but S2.2 showed the pattern is really two groups — a test cannot fix a poor model." }
      ], result: "Significant at 10%" } },

    /* ---------------------------------------------------------------- Page 4 */
    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**State your hypotheses clearly**", "$H_0$ and $H_1$ in the parameter ($p$, $\\rho$, $\\mu$) with its value"],
      ["**Find the critical region**", "the boundary probabilities on both sides, then the region as inequalities in $X$"],
      ["**State the probability of rejection in each tail**", "the tail probabilities you used, to 3–4 s.f."],
      ["**Actual significance level** / **probability of incorrectly rejecting $H_0$**", "the total probability of the critical region"],
      ["**State the critical value used**", "the number from the table, with sign"],
      ["**Comment on the belief with reference to (b)**", "is the observed value in the CR? then the contextual conclusion"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**B1 hypotheses** — parameter letter, both $H_0$ and $H_1$, correct direction.",
      "**M1 model** — $B(30, 0.15)$ or the critical value named.",
      "**A1 probability / CR** — boundary probabilities shown.",
      "**A1 conclusion** — in context, with the words of the question (\"proportion\", \"increased\", \"correlation between sunshine and rainfall\"), and no contradiction."
    ] },
    { h: "Misconceptions" },
    { ul: [
      "\"$H_0: r = 0$\" — use $\\rho$ (population).",
      "\"$P(X = 8)$ as the test probability\" — use the tail $P(X \\ge 8)$.",
      "\"Two-tailed at 5% uses the 5% column\" — it uses the 2.5% column.",
      "\"Accept $H_0$\" / \"proves\" — say insufficient evidence / evidence supports.",
      "\"Significant means strong\" — with a large $n$ even a weak $r$ is significant."
    ] },
    { callout: { t: "mnemonic", h: "\"Hypotheses, model, probability, compare, context\"", body: "The five moves of every test, each worth a mark." } }
  ],
  flashcards: [
    ["Null hypothesis?", "The assumed claim of no change, with \"=\": e.g. $H_0: p = 0.15$."],
    ["Alternative hypothesis — one- vs two-tailed?", "$>$ or $<$ is one-tailed; $\\ne$ is two-tailed."],
    ["Significance level means…", "The probability of incorrectly rejecting $H_0$ (when it is true)."],
    ["Critical region?", "The values of the test statistic that lead to rejecting $H_0$."],
    ["p-value?", "The probability, under $H_0$, of a result at least as extreme as the observed one."],
    ["Actual significance level?", "The probability of the critical region (discrete tests)."],
    ["$B(30, 0.15)$, upper 5% CR?", "$X \\ge 9$ ($P = 0.0278$; $P(X \\ge 8) = 0.0698$)."],
    ["$B(50, 0.25)$ two-tailed 5%, tails closest to 2.5%?", "$X \\le 6$ (0.0194) or $X \\ge 19$ (0.0287)."],
    ["$B(40, 0.1)$ two-tailed 5%?", "$X = 0$ (0.0148) or $X \\ge 9$ (0.0155); actual 0.0303."],
    ["PMCC test hypotheses?", "$H_0: \\rho = 0$; $H_1: \\rho > 0$, $< 0$ or $\\ne 0$."],
    ["Critical value: $n = 16$, 5% one-tail?", "0.4259."],
    ["Critical value: $n = 30$, 5% two-tail?", "0.3610 (the 2.5% column)."],
    ["$r = -0.510$, $n = 10$, $H_1: \\rho < 0$ at 5%?", "Not significant (cv −0.5494)."],
    ["Given p-value 0.015 at 5%?", "Significant: reject $H_0$."],
    ["Which tail for a two-tailed binomial test?", "Compare the observed value with $np$."]
  ],
  quiz: [
    { q: "Testing whether a proportion has decreased from 0.3:", opts: ["$H_1: p < 0.3$", "$H_1: p \\ne 0.3$", "$H_1: p > 0.3$", "$H_0: p < 0.3$"], ans: 0, why: "Decrease, one-tailed." },
    { q: "The significance level is the probability of", opts: ["rejecting $H_0$ when it is true", "accepting $H_1$", "$H_0$ being true", "the observed value"], ans: 0, why: "Incorrect rejection." },
    { q: "A two-tailed PMCC test at 5% uses the column for", opts: ["2.5%", "5%", "10%", "1%"], ans: 0, why: "Split between tails." },
    { q: "p-value 0.07, significance level 5%:", opts: ["do not reject $H_0$", "reject $H_0$", "accept $H_1$", "test invalid"], ans: 0, why: "0.07 > 0.05." },
    { q: "The hypotheses of a correlation test use", opts: ["$\\rho$", "$r$", "$p$", "$\\mu$"], ans: 0, why: "Population coefficient." },
    { q: "$X \\sim B(20, 0.5)$, observed 15, $H_1: p \\ne 0.5$. Test with", opts: ["$P(X \\ge 15)$ against 0.025", "$P(X \\le 15)$ against 0.05", "$P(X = 15)$", "$P(X \\ge 15)$ against 0.05"], ans: 0, why: "15 > np = 10: upper tail, half the level." }
  ]
};

/* =====================================================================
   S5.2  Hypothesis tests for the proportion of a binomial distribution
   ===================================================================== */
C["maths:S5.2"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Testing a binomial proportion — the whole topic on one page" },
    "Spec 5.2: **conduct** a hypothesis test for the proportion $p$ of a binomial distribution and **interpret the result in context**, understanding that a **sample** is used to make an inference about the **population** and that the significance level is the probability of incorrectly rejecting $H_0$.",
    "Every test is the same five moves; only the direction and the numbers change.",
    { callout: { t: "memorise", h: "The five moves", body: [
      "1. **Hypotheses** in $p$: $H_0: p = p_0$; $H_1$ from the claim ($>$, $<$, or $\\ne$).",
      "2. **Model** under $H_0$: $X \\sim B(n, p_0)$.",
      "3. **Probability** of the observed value **or more extreme** — $P(X \\ge x)$ for an increase, $P(X \\le x)$ for a decrease (or find the critical region).",
      "4. **Compare** with the significance level (half of it for a two-tailed test).",
      "5. **Conclude in context**, with the words of the claim."
    ] } },
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Full one-tailed test (increase)", "4–5", "AS Specimen Q2, AS 2018 Q3, AS 2020 Q5, AS 2025 Q3"],
      ["Full one-tailed test (decrease)", "4", "AS 2022 Q2, AS 2024 Q4, A-level 2023 Q2"],
      ["Full two-tailed test", "4", "AS Nov 2021 Q4, A-level 2025 Q3"],
      ["Conclusion at a different significance level", "1", "AS Specimen Q2(c)"],
      ["State the p-value; find the acceptance region", "1–2", "AS Nov 2021, 2024, 2025"]
    ] } },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "One-tailed tests" },
    { worked: { tag: "exam", title: "Organic eggs: a 1% test, then the 5% verdict", src: "AS Specimen · P2 Q2(b)(c) · 6 marks",
      q: "Past records show that 25% of people who buy eggs buy organic eggs. On one day a random sample of 40 egg-buyers includes 16 who bought organic eggs. **(b)** Test, at the 1% level, whether the proportion $p$ buying organic eggs that day had increased, stating your hypotheses clearly. **(c)** State the conclusion you would have reached at the 5% level.",
      steps: [
        { h: "Hypotheses", m: "$H_0: p = 0.25$, $\\; H_1: p > 0.25$", mk: "B1" },
        { h: "Model", m: "$Y \\sim B(40, 0.25)$", mk: "M1" },
        { h: "Probability of 16 or more", m: "$P(Y \\ge 16) = 1 - P(Y \\le 15) = 1 - 0.9738 = 0.0262$", mk: "M1 A1",
          fig: binomCR(40, 0.25, -1, 18, { to: 22, xt: [0, 5, 10, 15, 20], obs: 16, cap: "At 1% the critical region is $Y \\ge 18$ (amber); 16 is outside it." }) },
        { h: "Compare and conclude", m: "$0.0262 > 0.01$: not significant. There is insufficient evidence at the 1% level that the proportion of people buying organic eggs has increased.", mk: "A1" },
        { h: "(c) At 5%", m: "$0.0262 < 0.05$: significant — there would be evidence that the proportion buying organic eggs has increased.", mk: "B1ft", n: "The same data can be significant at 5% but not at 1%: the level is the test's standard of proof." }
      ], result: "(b) not significant at 1% (c) significant at 5%" } },
    { worked: { tag: "exam", title: "Probabilities of winning, then Naasir's claim", src: "AS June 2018 · P2 Q3 · 7 marks",
      q: "The probability that Naasir wins a game is $\\frac13$. **(a)** For 15 games, find the probability that he wins (i) exactly 2, (ii) more than 5. Naasir claims he has a method to win more than $\\frac13$ of games. In 32 more games he wins 16. **(b)** Stating your hypotheses clearly, test his claim at 5%.",
      steps: [
        { h: "(a) $N \\sim B(15, \\frac13)$", m: "(i) $P(N = 2) = 0.0599$ $\\quad$ (ii) $P(N > 5) = 1 - P(N \\le 5) = 0.382$", mk: "M1 A1 A1" },
        { h: "(b) Hypotheses", m: "$H_0: p = \\frac13$, $\\; H_1: p > \\frac13$", mk: "B1" },
        { h: "Model and probability", m: "$X \\sim B(32, \\frac13)$: $\\; P(X \\ge 16) = 1 - P(X \\le 15) = 0.0377$", mk: "M1 A1" },
        { h: "Conclude", m: "$0.0377 < 0.05$: significant — there is evidence to support Naasir's claim.", mk: "A1" }
      ], result: "(a) 0.0599, 0.382 (b) significant: evidence for the claim" } },
    { worked: { tag: "exam", title: "Is Rowan more successful?", src: "AS June 2020 · P2 Q5(c) · 4 marks",
      q: "Each sales call has a $\\frac16$ chance of success. Rowan believes he is more successful. Of his next 35 calls, 11 are successful. Stating your hypotheses clearly, test at 5% whether there is evidence to support Rowan's belief.",
      steps: [
        { h: "Hypotheses", m: "$H_0: p = \\frac16$, $\\; H_1: p > \\frac16$", mk: "B1" },
        { h: "Model", m: "$R \\sim B(35, \\frac16)$", mk: "M1" },
        { h: "Probability", m: "$P(R \\ge 11) = 1 - P(R \\le 10) = 0.0232$", mk: "A1" },
        { h: "Conclude", m: "$0.0232 < 0.05$: significant — evidence that Rowan is a more successful salesperson.", mk: "A1", n: "\"Rowan can reject $H_0$\" is not a contextual conclusion." }
      ], result: "Significant: evidence for Rowan's belief" } },
    { worked: { tag: "exam", title: "A decrease: supplier B's damp bags, at 10%", src: "AS June 2022 · P2 Q2(b) · 4 marks",
      q: "8% of bags of sugar from supplier A are damp. Supplier B claims its proportion is less than 8%. In a random sample of 70 bags from B, 2 are damp. Test supplier B's claim, stating your hypotheses clearly and using a 10% level.",
      steps: [
        { h: "Hypotheses", m: "$H_0: p = 0.08$, $\\; H_1: p < 0.08$", mk: "B1" },
        { h: "Model", m: "$X \\sim B(70, 0.08)$", mk: "M1" },
        { h: "Lower tail", m: "$P(X \\le 2) = 0.0740$", mk: "A1" },
        { h: "Conclude", m: "$0.074 < 0.10$: significant — there is evidence to support supplier B's claim.", mk: "A1" }
      ], result: "Significant at 10%: evidence for B's claim" } },
    { worked: { tag: "exam", title: "After a service — has the defective proportion fallen?", src: "AS June 2024 · P2 Q4(b)(c) · 5 marks",
      q: "Historically 12% of items from a machine are defective. After a service, a random sample of 60 items has 3 defective. **(b)** Test at 5% whether the proportion has decreased, stating your hypotheses clearly. **(c)** Write down the p-value.",
      steps: [
        { h: "Hypotheses", m: "$H_0: p = 0.12$, $\\; H_1: p < 0.12$", mk: "B1" },
        { h: "Model and probability", m: "$D \\sim B(60, 0.12)$: $\\; P(D \\le 3) = 0.0601$", mk: "M1 A1",
          fig: binomCR(60, 0.12, 2, 99, { to: 16, xt: [0, 4, 8, 12, 16], obs: 3, cap: "Critical region $D \\le 2$ ($P = 0.0196$); 3 is just outside." }) },
        { h: "Conclude", m: "$0.0601 > 0.05$: not significant — insufficient evidence that the proportion of defective items has decreased.", mk: "A1" },
        { h: "(c)", m: "p-value $= 0.0601$", mk: "B1ft" }
      ], result: "(b) not significant (c) 0.0601" } },
    { worked: { tag: "exam", title: "Green counters: p-value and the acceptance region", src: "AS June 2025 · P2 Q3(b) · 6 marks",
      q: "Jayda believes the proportion of green counters in a bag is greater than 0.2. In a random sample of 40 (with replacement) there are 11 green counters. **(i)** Test Jayda's belief, stating hypotheses, using 5% and stating the p-value. **(ii)** Find the acceptance region for this test.",
      steps: [
        { h: "(i) Hypotheses", m: "$H_0: p = 0.2$, $\\; H_1: p > 0.2$", mk: "B1" },
        { h: "Model and p-value", m: "$X \\sim B(40, 0.2)$: $\\; P(X \\ge 11) = 1 - 0.8392 = 0.161$", mk: "M1 A1" },
        { h: "Conclude", m: "$0.161 > 0.05$: not significant — insufficient evidence that the proportion of green counters is greater than 0.2.", mk: "A1" },
        { h: "(ii) Where does rejection start?", m: "$P(X \\le 11) = 0.9125 < 0.95$; $\\; P(X \\le 12) = 0.9568 > 0.95$\nso the critical region is $X \\ge 13$", mk: "M1" },
        { m: "Acceptance region: $0 \\le X \\le 12$", mk: "A1", n: "Write the region, not a probability statement such as $P(X < 13)$." }
      ], result: "(i) p-value 0.161, not significant (ii) $X \\le 12$" } },
    { worked: { tag: "exam", title: "Kamil's claim about prizes", src: "A-level June 2023 · P3 Q2(d) · 4 marks",
      q: "$\\frac17$ of packets contain a prize. Kamil claims the proportion is less than $\\frac17$. In a random sample of 110 packets, 9 contain a prize. Use a suitable test to assess Kamil's claim, stating your hypotheses clearly and using a 5% level.",
      steps: [
        { h: "Hypotheses", m: "$H_0: p = \\frac17$, $\\; H_1: p < \\frac17$", mk: "B1" },
        { h: "Model", m: "$X \\sim B(110, \\frac17)$", mk: "M1" },
        { h: "Lower tail", m: "$P(X \\le 9) = 0.0383$", mk: "A1", n: "Expected $110 \\times \\frac17 \\approx 15.7$; 9 is well below." },
        { h: "Conclude", m: "$0.0383 < 0.05$: significant — there is evidence to support Kamil's claim.", mk: "A1" }
      ], result: "Significant: evidence for the claim" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Two-tailed tests" },
    { callout: { t: "memorise", h: "Two-tailed — the differences", body: [
      "$H_1: p \\ne p_0$ (the claim says *changed* or *different*).",
      "Decide the tail from $np_0$: observed below → $P(X \\le x)$; above → $P(X \\ge x)$.",
      "Compare with **half** the significance level (0.025 for 5%) — or double the tail probability to get the p-value and compare with 0.05."
    ] } },
    { worked: { tag: "exam", title: "Has the proportion of red beads changed? With the p-value", src: "AS Nov 2021 · P2 Q4(d)(e) · 5 marks",
      q: "14% of a sack's beads were red. After children have used the sack, a random sample of 75 beads contains 4 red beads. **(d)** Stating your hypotheses clearly, use a 5% level to test whether the proportion of red beads has changed. **(e)** Find the p-value.",
      steps: [
        { h: "Hypotheses", m: "$H_0: p = 0.14$, $\\; H_1: p \\ne 0.14$", mk: "B1" },
        { h: "Model; which tail?", m: "$X \\sim B(75, 0.14)$; $np = 10.5$ and 4 is below it — lower tail.", mk: "M1" },
        { h: "Probability", m: "$P(X \\le 4) = 0.0151$", mk: "A1" },
        { h: "Compare with 0.025", m: "$0.0151 < 0.025$: significant — there is evidence that the proportion of red beads has changed.", mk: "A1" },
        { h: "(e) Two tails", m: "p-value $= 2 \\times 0.0151 = 0.0301$", mk: "B1ft" }
      ], result: "(d) significant: evidence of change (e) 0.0301" } },
    { worked: { tag: "exam", title: "A two-tailed test that is not significant", src: "A-level June 2025 · P3 Q3(b) · 3 marks",
      q: "1.5% of components are defective. The manufacturer tests $H_0: p = 0.015$ against $H_1: p \\ne 0.015$. A random sample of 260 components contains 8 defective. Using a 5% level, complete the test.",
      steps: [
        { h: "Model; which tail?", m: "$X \\sim B(260, 0.015)$; $np = 3.9$, and 8 is above it — upper tail.", mk: "M1" },
        { h: "Probability", m: "$P(X \\ge 8) = 1 - P(X \\le 7) = 0.0441$", mk: "A1" },
        { h: "Compare with 0.025", m: "$0.0441 > 0.025$: not significant — insufficient evidence that the proportion of defective components has changed.", mk: "A1", n: "Compared with 0.05 by mistake, this test would wrongly be called significant." }
      ], result: "Not significant: no evidence of a change" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Test … stating your hypotheses clearly**", "all five moves, with $H_0$, $H_1$ in $p$"],
      ["**Use a suitable test to assess the claim**", "the same; choose the tail from the claim's wording"],
      ["**State the p-value**", "the tail probability (doubled for a two-tailed test)"],
      ["**Find the acceptance region**", "the values not in the critical region, as an inequality in $X$"],
      ["**State the conclusion at the 5% level**", "the comparison redone with the new level"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Claim words decide $H_1$**: increased / more → $>$; decreased / less → $<$; changed / different → $\\ne$.",
      "**\"At least as extreme\"**: $P(X \\ge x)$ includes $x$ itself — $1 - P(X \\le x - 1)$.",
      "**Two-tailed**: compare with 0.025, not 0.05.",
      "**Conclusion** names the population proportion and the claim — \"insufficient evidence that the proportion … has increased\"."
    ] },
    { h: "Misconceptions" },
    { ul: [
      "\"$H_0: p > 0.25$\" — $H_0$ always has \"=\".",
      "\"$P(X \\ge 16) = 1 - P(X \\le 16)$\" — it is $1 - P(X \\le 15)$.",
      "\"Not significant, so $H_0$ is true\" — there is just not enough evidence against it.",
      "\"Significant at 1% but not at 5%\" — impossible: 1% is the stricter test."
    ] },
    { callout: { t: "mnemonic", h: "\"Equals in the null, the claim in the alternative\"", body: "$H_0$ keeps the old value with =; $H_1$ is what the person in the question believes." } }
  ],
  flashcards: [
    ["Five moves of a test?", "Hypotheses; model under $H_0$; probability of observed-or-more-extreme; compare; conclude in context."],
    ["Claim \"proportion has increased\": $H_1$?", "$p > p_0$."],
    ["Claim \"proportion has changed\": $H_1$?", "$p \\ne p_0$."],
    ["$P(X \\ge 16)$ in cumulative form?", "$1 - P(X \\le 15)$."],
    ["Two-tailed test at 5%: compare a tail probability with…", "0.025."],
    ["Two-tailed p-value from a tail probability $q$?", "$2q$."],
    ["Eggs: $B(40, 0.25)$, 16 observed. $P(Y \\ge 16)$?", "0.0262 — significant at 5%, not at 1%."],
    ["Beads: $B(75, 0.14)$, 4 observed, two-tailed. Verdict?", "$P(X \\le 4) = 0.0151 < 0.025$: significant; p-value 0.0301."],
    ["Defects: $B(60, 0.12)$, 3 observed, decrease. Verdict?", "$P(D \\le 3) = 0.0601 > 0.05$: not significant."],
    ["Acceptance region for $B(40, 0.2)$, upper 5%?", "$X \\le 12$."],
    ["Components: $B(260, 0.015)$, 8 observed, two-tailed.", "$P(X \\ge 8) = 0.0441 > 0.025$: not significant."]
  ],
  quiz: [
    { q: "$H_0: p = 0.4$, $H_1: p < 0.4$, $X \\sim B(20, 0.4)$, observed 4. The test probability is", opts: ["$P(X \\le 4)$", "$P(X \\ge 4)$", "$P(X = 4)$", "$1 - P(X \\le 4)$"], ans: 0, why: "Lower tail, observed or less." },
    { q: "$P(X \\ge 12) = 0.031$ at 5% one-tailed:", opts: ["significant", "not significant", "accept $H_0$", "need two tails"], ans: 0, why: "0.031 < 0.05." },
    { q: "Two-tailed at 5%, lower-tail probability 0.031:", opts: ["not significant", "significant", "p-value 0.031", "reject $H_0$"], ans: 0, why: "Compare with 0.025." },
    { q: "The p-value of that two-tailed test is", opts: ["0.062", "0.031", "0.0155", "0.969"], ans: 0, why: "Double the tail." },
    { q: "A good contextual conclusion says", opts: ["insufficient evidence that the proportion of red beads has changed", "accept $H_0$", "$p = 0.14$ is proven", "the sample is wrong"], ans: 0, why: "Evidence language, in context." }
  ]
};

/* =====================================================================
   S5.3  Hypothesis tests for the mean of a Normal distribution
   ===================================================================== */
C["maths:S5.3"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Testing a Normal mean — the whole topic on one page" },
    "Spec 5.3: test the **mean $\\mu$ of a Normal distribution** with known, given or assumed variance, and interpret the result in context.",
    { callout: { t: "formula", h: "The sampling distribution of the mean (formulae booklet)", body: [
      "If $X \\sim N(\\mu, \\sigma^2)$ and $\\bar{X}$ is the mean of a random sample of size $n$, then",
      "$$\\bar{X} \\sim N\\left(\\mu, \\frac{\\sigma^2}{n}\\right) \\qquad\\text{and}\\qquad Z = \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}} \\sim N(0, 1^2)$$",
      "The sample mean is **less variable** than one observation: its standard deviation is $\\frac{\\sigma}{\\sqrt{n}}$ (the *standard error*). No proof, and no Central Limit Theorem, is required."
    ] } },
    { fig: { x: [12, 24], y: [0, 2.3], w: 480, h: 210, axes: { x: "hours", y: "", xt: [12, 14, 16, 18, 20, 22, 24], yt: [] }, items: [
      { fn: "exp(-((x-18)^2)/(2*16))", from: 12, to: 24, c: "accent", w: 2 },
      { fn: "2.236*exp(-((x-18)^2)/(2*0.8))", from: 12, to: 24, c: "accent2", w: 2.2 },
      { text: [21.5, 0.75], t: "X ~ N(18, 4²)", size: 12, c: "accent" }, { text: [20.4, 1.9], t: "X̄ ~ N(18, 4²/20)", size: 12, c: "accent2" }
    ], cap: "One battery against the mean of 20 batteries (A-level June 2018): the sample mean is $\\sqrt{20} \\approx 4.5$ times less spread out." } },
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Full one-tailed test (increase)", "4–5", "A-level Specimen Q1, 2018 Q5, Oct 2020 Q5"],
      ["Full one-tailed test (decrease)", "4", "A-level Oct 2021 Q5"],
      ["Full two-tailed test and its p-value", "5", "A-level June 2023 Q4"],
      ["Critical region for $\\bar{X}$, or the critical $z$", "alternative routes to the same marks", "all of the above"]
    ] } },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "The test" },
    { callout: { t: "memorise", h: "The five moves, for a mean", body: [
      "1. **Hypotheses** in $\\mu$: $H_0: \\mu = \\mu_0$; $H_1: \\mu > \\mu_0$, $\\mu < \\mu_0$ or $\\mu \\ne \\mu_0$.",
      "2. **Model** under $H_0$: $\\bar{X} \\sim N\\left(\\mu_0, \\frac{\\sigma^2}{n}\\right)$ — with $\\mu_0$, never the sample mean.",
      "3. **Probability** of the observed $\\bar{x}$ or more extreme: $P(\\bar{X} > \\bar{x})$ or $P(\\bar{X} < \\bar{x})$. *Alternatives:* the test statistic $z = \\frac{\\bar{x} - \\mu_0}{\\sigma/\\sqrt{n}}$ against the critical value (1.6449, 1.9600…), or the critical region for $\\bar{X}$.",
      "4. **Compare** with the significance level (half it for two tails).",
      "5. **Conclude in context** about the population mean."
    ] } },
    { fig: tailFig(0, 1, [[1.6449, 4]], { vl: [[1.6449, "1.6449"], [1.677, "z = 1.677", "accent2", 0.6]], xt: [-3, -2, -1, 0, 1, 2, 3],
      cap: "Doctor's appointments (Oct 2020): the 5% upper critical region is $z \\ge 1.6449$; the sample gives $z = 1.677$ — just inside." }) },
    { worked: { tag: "exam", title: "The patients' complaint about appointment length", src: "A-level Oct 2020 · P3 Q5(a)(b) · 5 marks",
      q: "A doctor's appointment time is claimed to be $N(10, 4^2)$ minutes. **(a)** Find the probability that an appointment is longer than 15 minutes. Patients complain that the mean is more than 10 minutes. A random sample of 20 patients has mean 11.5 minutes. **(b)** Stating your hypotheses clearly and using a 5% level, test whether there is evidence to support the complaint.",
      steps: [
        { h: "(a)", m: "$P(X > 15) = 0.106$", mk: "B1" },
        { h: "(b) Hypotheses", m: "$H_0: \\mu = 10$, $\\; H_1: \\mu > 10$", mk: "B1" },
        { h: "Sampling distribution", m: "$\\bar{X} \\sim N\\left(10, \\dfrac{4^2}{20}\\right)$", mk: "M1" },
        { h: "Probability", m: "$P(\\bar{X} > 11.5) = 0.0468$ $\\;$ (or $z = \\dfrac{11.5 - 10}{4/\\sqrt{20}} = 1.677 > 1.6449$)", mk: "A1" },
        { h: "Conclude", m: "$0.0468 < 0.05$: significant — there is evidence to support the patients' complaint that the mean time is more than 10 minutes.", mk: "A1" }
      ], result: "(a) 0.106 (b) significant: evidence for the complaint" } },
    { worked: { tag: "exam", title: "Alice's batteries: critical region for the mean", src: "A-level June 2018 · P3 Q5(d) · 5 marks",
      q: "Battery lifetimes are $N(18, 4^2)$ hours. Alice believes the mean lifetime is more than 18 hours. A random sample of 20 batteries has mean 19.2 hours. Stating your hypotheses clearly and using a 5% level, test Alice's belief.",
      steps: [
        { h: "Hypotheses", m: "$H_0: \\mu = 18$, $\\; H_1: \\mu > 18$", mk: "B1" },
        { h: "Model", m: "$\\bar{L} \\sim N\\left(18, \\dfrac{4^2}{20}\\right)$ — variance 0.8", mk: "M1" },
        { h: "Probability (or critical region)", m: "$P(\\bar{L} > 19.2) = 0.0899$ $\\;$ — or CR: $\\bar{L} > 18 + 1.6449 \\times \\dfrac{4}{\\sqrt{20}} = 19.47$", mk: "A1",
          fig: tailFig(18, 0.8944, [[19.471, 25]], { vl: [[19.471, "CR starts 19.47"], [19.2, "x̄ = 19.2", "accent2", 0.6]], xt: [16, 17, 18, 19, 20], xl: "x̄" }) },
        { h: "Compare", m: "$0.0899 > 0.05$ (19.2 is not in the critical region): not significant, do not reject $H_0$.", mk: "A1" },
        { h: "Conclude", m: "There is insufficient evidence that the mean lifetime of the batteries is more than 18 hours.", mk: "A1" }
      ], result: "Not significant: insufficient evidence for Alice's belief" } },
    { worked: { tag: "exam", title: "Coffee packets: test the seller's claim", src: "A-level Specimen · P3 Q1(d) · 5 marks",
      q: "A seller claims that the mean mass of coffee in a packet is more than the stated 250 g. The standard deviation is 4 g, and a random sample of 90 packets has an estimated mean of 250.4 g. Assuming the mass is Normally distributed, test at the 5% level whether the seller's claim is justified, stating your hypotheses clearly.",
      steps: [
        { h: "Hypotheses", m: "$H_0: \\mu = 250$, $\\; H_1: \\mu > 250$", mk: "B1" },
        { h: "Model", m: "$\\bar{X} \\sim N\\left(250, \\dfrac{4^2}{90}\\right)$", mk: "M1" },
        { h: "Probability", m: "$P(\\bar{X} > 250.4) = 0.171$ $\\;$ ($z = 0.949$)", mk: "A1" },
        { h: "Compare", m: "$0.171 > 0.05$ (or $0.949 < 1.6449$): not significant.", mk: "A1" },
        { h: "Conclude", m: "There is insufficient evidence that the mean mass of coffee is greater than 250 g — the seller's claim is not supported.", mk: "A1" }
      ], result: "Not significant: claim not supported" } },
    { worked: { tag: "exam", title: "Mia's belief: a test for a decrease", src: "A-level Oct 2021 · P3 Q5(d) · 4 marks",
      q: "Heights of females in a second country are Normal with standard deviation 7.4 cm. Mia believes their mean is less than 166.5 cm. A random sample of 50 has mean 164.6 cm. Carry out a suitable test, stating hypotheses and using a 5% level.",
      steps: [
        { h: "Hypotheses", m: "$H_0: \\mu = 166.5$, $\\; H_1: \\mu < 166.5$", mk: "B1" },
        { h: "Model", m: "$\\bar{X} \\sim N\\left(166.5, \\dfrac{7.4^2}{50}\\right)$", mk: "M1" },
        { h: "Lower tail", m: "$P(\\bar{X} < 164.6) = 0.0347$ $\\;$ ($z = -1.816 < -1.6449$)", mk: "A1" },
        { h: "Conclude", m: "$0.0347 < 0.05$: significant — there is evidence to support Mia's belief that the mean height is less than 166.5 cm.", mk: "dA1" }
      ], result: "Significant: evidence for Mia's belief" } },
    { worked: { tag: "exam", title: "Region B heights: a two-tailed test and its p-value", src: "A-level June 2023 · P3 Q4 · 6 marks",
      q: "Heights of adult men from region A are $N(175.4, 6.8^2)$ cm. **(a)** Find the proportion taller than 180 cm. A student claims the mean height in region B is different. A random sample of 52 men from region B has mean 177.2 cm; assume $\\sigma = 6.8$ cm. **(b)** Test the claim, stating hypotheses and using 5%. **(c)** Find the p-value.",
      steps: [
        { h: "(a)", m: "$P(X > 180) = 0.249$", mk: "B1" },
        { h: "(b) \"Different\": two-tailed", m: "$H_0: \\mu = 175.4$, $\\; H_1: \\mu \\ne 175.4$", mk: "B1" },
        { h: "Model and tail", m: "$\\bar{X} \\sim N\\left(175.4, \\dfrac{6.8^2}{52}\\right)$: $\\; P(\\bar{X} > 177.2) = 0.0281$ $\\;$ ($z = 1.909$)", mk: "M1 A1",
          fig: tailFig(0, 1, [[-4, -1.96], [1.96, 4]], { vl: [[1.96, "1.96"], [-1.96, "−1.96"], [1.909, "z = 1.909", "accent2", 0.6]], xt: [-3, -2, -1, 0, 1, 2, 3] }) },
        { h: "Compare with 0.025", m: "$0.0281 > 0.025$ ($1.909 < 1.96$): not significant — insufficient evidence to support the student's claim that the mean height differs.", mk: "A1" },
        { h: "(c)", m: "p-value $= 2 \\times 0.0281 = 0.0563$", mk: "B1ft", n: "As a one-tailed test this would have been significant — the direction of $H_1$ matters." }
      ], result: "(a) 0.249 (b) not significant (c) 0.0563" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Test whether there is evidence** … stating hypotheses", "the five moves with $\\mu$"],
      ["**Find the p-value**", "the tail probability, doubled if two-tailed"],
      ["**Find the critical region for $\\bar{X}$**", "$\\mu_0 \\pm z\\frac{\\sigma}{\\sqrt{n}}$ as an inequality"],
      ["**You may assume … is Normally distributed**", "use $\\bar{X} \\sim N(\\mu_0, \\sigma^2/n)$ without comment"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Model mark**: $N\\left(\\mu_0, \\frac{\\sigma^2}{n}\\right)$ — the hypothesised mean and the divided variance.",
      "**Any of three routes** scores the probability mark: $P(\\bar{X} > \\bar{x})$; $z$ against the critical value; or the critical region for $\\bar{X}$.",
      "**Conclusion** about the **mean** in context: \"evidence that the mean time is more than 10 minutes\"."
    ] },
    { h: "Misconceptions" },
    { ul: [
      "\"$\\bar{X} \\sim N(11.5, \\ldots)$\" — the model uses $\\mu_0$, not the sample mean (it loses the A marks).",
      "\"Standard deviation $\\frac{\\sigma^2}{n}$\" — that is the variance; the sd is $\\frac{\\sigma}{\\sqrt{n}}$.",
      "\"Two-tailed compared with 0.05\".",
      "\"The test is about the sample mean\" — hypotheses are about $\\mu$, the population mean."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Probability for $\\bar{X}$", "**Normal CD** with $\\mu = \\mu_0$ and $\\sigma = \\frac{\\sigma}{\\sqrt{n}}$ — type $4 \\div \\sqrt{20}$ straight into the σ field."],
      ["Critical value", "**Inverse Normal** with area 0.95 (upper 5%) on $N(0, 1)$ gives 1.6449."]
    ] },
    { callout: { t: "mnemonic", h: "\"Divide the variance by $n$, root for the sd\"", body: "$\\text{Var}(\\bar{X}) = \\frac{\\sigma^2}{n}$, $\\; \\text{sd}(\\bar{X}) = \\frac{\\sigma}{\\sqrt{n}}$." } }
  ],
  flashcards: [
    ["Distribution of $\\bar{X}$ for samples of size $n$ from $N(\\mu, \\sigma^2)$?", "$N\\left(\\mu, \\frac{\\sigma^2}{n}\\right)$."],
    ["Test statistic for a Normal mean?", "$z = \\frac{\\bar{x} - \\mu_0}{\\sigma/\\sqrt{n}}$."],
    ["Hypotheses for \"the mean has increased from 10\"?", "$H_0: \\mu = 10$, $H_1: \\mu > 10$."],
    ["5% one-tail critical $z$?", "1.6449."],
    ["5% two-tail critical $z$?", "±1.9600."],
    ["$\\sigma = 4$, $n = 20$: standard deviation of $\\bar{X}$?", "$\\frac{4}{\\sqrt{20}} = 0.894$."],
    ["Alice: CR for $\\bar{L}$, $H_1: \\mu > 18$, $\\sigma = 4$, $n = 20$?", "$\\bar{L} > 19.47$."],
    ["Doctor: $\\bar{x} = 11.5$, $n = 20$, $\\sigma = 4$, $\\mu_0 = 10$. p-value?", "0.0468 — significant at 5%."],
    ["Region B: one tail 0.0281, two-tailed. p-value and verdict at 5%?", "0.0563; not significant."],
    ["Which mean goes in the model?", "$\\mu_0$ from $H_0$, never $\\bar{x}$."]
  ],
  quiz: [
    { q: "$X \\sim N(50, 6^2)$, $n = 9$. $\\bar{X} \\sim$", opts: ["$N(50, 4)$", "$N(50, 36)$", "$N(50, 2)$", "$N(50, \\tfrac{6}{9})$"], ans: 0, why: "$36 / 9 = 4$." },
    { q: "$z = 1.70$, $H_1: \\mu > \\mu_0$, 5%:", opts: ["significant", "not significant", "need p-value", "accept $H_0$"], ans: 0, why: "1.70 > 1.6449." },
    { q: "$z = 1.90$, $H_1: \\mu \\ne \\mu_0$, 5%:", opts: ["not significant", "significant", "reject $H_0$", "p-value 0.0287"], ans: 0, why: "1.90 < 1.96." },
    { q: "A model written as $\\bar{X} \\sim N(11.5, \\tfrac{16}{20})$ for $H_0: \\mu = 10$ is", opts: ["wrong — use $\\mu_0 = 10$", "correct", "correct for two tails", "only wrong at 1%"], ans: 0, why: "Assume $H_0$." },
    { q: "The standard deviation of $\\bar{X}$ for $\\sigma = 7.4$, $n = 50$ is about", opts: ["1.05", "7.4", "0.148", "1.095"], ans: 0, why: "$7.4/\\sqrt{50}$." }
  ]
};


/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
