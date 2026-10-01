/* Kurenai OS — deep content: Statistics, section S3 (Probability) at full
   A-level depth. Each topic here REPLACES the outline entry the base file
   used to carry: every question shape Edexcel has set on mutually
   exclusive and independent events, conditional probability (Venn
   diagrams, tree diagrams, two-way tables) and modelling with probability
   (9MA0 Paper 3 Section A, 8MA0 Paper 2 Section A, June 2018–2025, the
   Oct/Nov 2020–21 series and the Specimens) is explained and then worked
   through with Edexcel M1/A1/B1 marks. Past-paper item banks stay in
   bank-maths-stats.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---- figure helpers ---- */

/* a Venn diagram on a free (pixel) canvas: circles [[cx, cy, r, name,
   namePos]], region labels [[x, y, text, colour?]], optional rectangle */
function venn(o) {
  var items = [{ poly: [[10, 10], [o.w - 10, 10], [o.w - 10, o.h - 10], [10, o.h - 10]], c: "muted", w: 1.4 }];
  var cols = ["accent", "accent2", "accent3", "text2"];
  o.circles.forEach(function (c, i) {
    items.push({ circle: [c[0], c[1], c[2]], fill: c[5] === false ? null : cols[i % 4], alpha: 0.09, c: cols[i % 4], w: 1.8 });
    items.push({ text: [c[0] + (c[4] ? c[4][0] : -c[2] * 0.7), c[1] + (c[4] ? c[4][1] : -c[2] * 0.8)], t: c[3], size: 14, c: cols[i % 4], b: true, i: true });
  });
  (o.labels || []).forEach(function (l) { items.push({ text: [l[0], l[1]], t: l[2], size: l[4] || 12.5, c: l[3] || "text", b: !!l[3] }); });
  return { w: o.w, h: o.h, items: items, cap: o.cap };
}
/* a two-stage probability tree: first [[label, prob]], second[i] = [[label, prob]];
   `hl` = list of "i.j" leaf keys to highlight */
function tree(first, second, o) {
  o = o || {};
  var W = o.w || 520, rows = 0;
  second.forEach(function (s) { rows += s.length; });
  var H = o.h || Math.max(150, rows * 34 + 20), items = [], y0 = 10, leafH = (H - 2 * y0) / rows, k = 0;
  var rx = 24, ry = H / 2, x1 = 175, x2 = 345;
  first.forEach(function (f, i) {
    var ys = [];
    second[i].forEach(function () { ys.push(y0 + leafH * (k + 0.5)); k++; });
    var my = (ys[0] + ys[ys.length - 1]) / 2;
    items.push({ line: [[rx, ry], [x1, my]], c: "text2", w: 1.5 });
    items.push({ text: [(rx + x1) / 2, (ry + my) / 2 - 9], t: f[1], size: 11.5, c: "accent2" });
    items.push({ text: [x1 + 6, my], t: f[0], pos: "e", size: 12.5, c: "text", b: true, off: 0 });
    second[i].forEach(function (s, j) {
      var hl = o.hl && o.hl.indexOf(i + "." + j) >= 0;
      items.push({ line: [[x1 + 34, my], [x2, ys[j]]], c: hl ? "accent" : "text2", w: hl ? 2.4 : 1.5 });
      items.push({ text: [(x1 + 34 + x2) / 2, (my + ys[j]) / 2 - 8], t: s[1], size: 11.5, c: "accent2" });
      items.push({ text: [x2 + 6, ys[j]], t: s[0], pos: "e", size: 12.5, c: hl ? "accent" : "text", b: true, off: 0 });
      if (s[2]) items.push({ text: [x2 + 60, ys[j]], t: s[2], pos: "e", size: 11.5, c: hl ? "accent" : "muted", off: 0 });
    });
  });
  if (o.heads) { items.push({ text: [x1 + 10, 8], t: o.heads[0], size: 11, c: "muted" }); items.push({ text: [x2 + 10, 8], t: o.heads[1], size: 11, c: "muted" }); }
  return { w: W, h: H, items: items, cap: o.cap };
}

/* =====================================================================
   S3.1  Mutually exclusive and independent events
   ===================================================================== */
C["maths:S3.1"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Probability: exclusive and independent events — the whole topic on one page" },
    "Spec 3.1: understand and use **mutually exclusive** and **independent** events when calculating probabilities, with Venn or tree diagrams and set notation — and link probability to **discrete and continuous distributions**.",
    "Almost every Paper 3 probability question is a Venn diagram with unknowns, unlocked by three facts:",
    { ol: [
      "all the probabilities add up to 1;",
      "mutually exclusive events have **no overlap** (an empty region, probability 0);",
      "independent events satisfy $P(A \\cap B) = P(A) \\times P(B)$."
    ] },
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Write down a pair of mutually exclusive events from a Venn diagram", "1", "AS Spec, AS Nov 2021, A-level Oct 2020, 2024"],
      ["Find unknown regions using total = 1 and independence", "4–7", "AS Spec Q4, AS 2019 Q2, AS 2025 Q5, A-level 2023 Q1"],
      ["Determine whether two events are independent", "1–4", "AS Spec Q4(c), AS 2018 Q2(b), AS 2023 Q3, A-level Oct 2021 Q4(d)"],
      ["Range of a count / impossibility of independence", "2–4", "AS June 2023 Q3"],
      ["Set notation: find $P([A \\cup B]' \\cap C)$, write an event in set notation", "1 each", "A-level June 2024 Q6"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**The language of probability** — sample space, events, complement, union, intersection, set notation.",
      "**Venn diagrams** — reading and filling them, with probabilities or with frequencies.",
      "**Mutually exclusive events** — the addition rule.",
      "**Independent events** — the multiplication rule and how to test for independence.",
      "**Probability and distributions** — discrete probabilities, and area under a curve.",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "The language of probability" },
    { kv: [
      ["Experiment / trial", "A repeatable process with uncertain outcomes (rolling a die, picking a student)."],
      ["Sample space", "The set of all possible outcomes."],
      ["Event", "A set of outcomes, written with a capital letter: $A$ = \"the score is even\"."],
      ["Equally likely outcomes", "$P(A) = \\dfrac{\\text{number of outcomes in } A}{\\text{total number of outcomes}}$"],
      ["Probability scale", "$0 \\le P(A) \\le 1$; 0 is impossible, 1 is certain."]
    ] },
    { table: { head: ["Notation", "Read as", "Means"], rows: [
      ["$A'$", "not $A$", "the complement: everything outside $A$; $P(A') = 1 - P(A)$"],
      ["$A \\cap B$", "$A$ and $B$", "the intersection: both happen"],
      ["$A \\cup B$", "$A$ or $B$", "the union: at least one happens"],
      ["$A \\cap B'$", "$A$ and not $B$", "the part of $A$ outside $B$ (\"$A$ only\" in a two-set diagram)"],
      ["$(A \\cup B)'$", "neither $A$ nor $B$", "outside both circles"],
      ["$A \\mid B$", "$A$ given $B$", "conditional — S3.2"]
    ] } },
    { fig: { w: 520, h: 160, items: [
      { poly: [[10, 15], [165, 15], [165, 145], [10, 145]], c: "muted", w: 1.2 },
      { circle: [65, 80, 40], c: "accent", w: 1.6 }, { circle: [110, 80, 40], c: "accent2", w: 1.6 },
      { text: [87, 80], t: "A ∩ B", size: 11.5, c: "text", b: true }, { text: [87, 135], t: "intersection", size: 11, c: "muted" },
      { poly: [[180, 15], [335, 15], [335, 145], [180, 145]], c: "muted", w: 1.2 },
      { circle: [235, 80, 40], fill: "accent", alpha: 0.35, c: "accent", w: 1.6 }, { circle: [280, 80, 40], fill: "accent2", alpha: 0.35, c: "accent2", w: 1.6 },
      { text: [257, 80], t: "A ∪ B", size: 11.5, c: "text", b: true }, { text: [257, 135], t: "union", size: 11, c: "muted" },
      { poly: [[350, 15], [505, 15], [505, 145], [350, 145]], fill: "accent3", alpha: 0.25, c: "muted", w: 1.2 },
      { circle: [427, 80, 42], fill: "var(--s1)", alpha: 1, c: "accent", w: 1.6 },
      { text: [427, 80], t: "A", size: 13, c: "accent", b: true }, { text: [427, 135], t: "A′ — the shaded outside", size: 11, c: "muted" }
    ], cap: "Intersection, union, complement. The rectangle is the whole sample space, probability 1." } },
    { callout: { t: "formula", h: "In the formulae booklet (Probability)", body: [
      "$$P(A') = 1 - P(A)$$",
      "$$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$$",
      "$$P(A \\cap B) = P(A)\\,P(B \\mid A) \\qquad P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}$$",
      "The independence and mutual-exclusivity rules are **not** printed: they are in the boxes below."
    ] } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Venn diagrams" },
    "A Venn diagram puts a **number in every region** — a probability or a frequency — and every question is a matter of adding the right regions.",
    { fig: venn({ w: 460, h: 230, circles: [[170, 110, 75, "A"], [280, 110, 75, "B", [55, -62]]],
      labels: [[125, 110, "A only: A ∩ B′"], [225, 110, "A ∩ B"], [335, 110, "B only: A′ ∩ B"], [225, 210, "outside: (A ∪ B)′"]],
      cap: "Four regions for two sets. $P(A)$ = \"A only\" + \"A ∩ B\" — the whole circle." }) },
    { callout: { t: "memorise", h: "Filling a Venn diagram — the order that never fails", body: [
      "1. Start from the **middle** (the triple or double intersection) and work **outwards**.",
      "2. A total for a whole circle gives the \"only\" region by subtraction.",
      "3. Use **total = 1** (or $n$) for the region outside every circle — usually last.",
      "4. Turn every word into an equation: \"none of the events occur\" is the outside region; \"exactly two\" is the sum of the double-only regions; \"$P(A \\text{ or } C)$\" is the union of those two circles."
    ] } },
    { worked: { tag: "exam", title: "A Venn diagram from bullet points", src: "AS June 2025 · P2 Q5 · 7 marks",
      q: "Events $A$, $B$ and $C$ are such that $P(A \\text{ or } C) = 0.55$; the probability that none of the events occurs is 0.23; the probability that exactly two occur is 0.18; $A$ and $B$ are independent; $P(B) = P(A) + 0.1$. In the Venn diagram $A$ and $C$ do not overlap, and $B$ overlaps both: the regions are $p$ ($A$ only), $q$ ($A \\cap B$), $r$ ($B$ only), $s$ ($B \\cap C$), $t$ ($C$ only) and $u$ (outside). **(a)** Write down $u$. **(b)** Find $r$. **(c)** Find $p$, $q$, $s$ and $t$.",
      steps: [
        { fig: venn({ w: 460, h: 190, circles: [[120, 95, 70, "A"], [230, 95, 70, "B", [0, -76]], [340, 95, 70, "C", [55, -55]]],
          labels: [[95, 95, "p"], [175, 95, "q"], [230, 95, "r"], [285, 95, "s"], [365, 95, "t"], [420, 170, "u"]] }),
          h: "(a) None of the events", m: "$u = 0.23$", mk: "B1" },
        { h: "(b) Everything outside $A \\cup C$ is $r$ or $u$", m: "$p + q + s + t = 0.55$, so $r = 1 - 0.55 - 0.23 = 0.22$", mk: "M1 A1" },
        { h: "(c) Exactly two", m: "$q + s = 0.18$, so $P(B) = r + q + s = 0.22 + 0.18 = 0.4$ and $P(A) = 0.4 - 0.1 = 0.3$", mk: "M1" },
        { h: "Independence of $A$ and $B$", m: "$q = P(A \\cap B) = 0.3 \\times 0.4 = 0.12$, so $s = 0.18 - 0.12 = 0.06$", mk: "M1 A1" },
        { h: "The rest", m: "$p = P(A) - q = 0.3 - 0.12 = 0.18$\n$t = 0.55 - (p + q + s) = 0.55 - 0.36 = 0.19$", mk: "A1" }
      ], result: "$u = 0.23$, $r = 0.22$, $p = 0.18$, $q = 0.12$, $s = 0.06$, $t = 0.19$" } },
    { worked: { tag: "exam", title: "Frequencies in a Venn diagram: the range of a count", src: "AS June 2023 · P2 Q3(a) · 2 marks",
      q: "45 students attend an after-school club; 25 take Art, 12 take both Art and Music, and $x$ take Music. Find the range of possible values of $x$.",
      steps: [
        { h: "Fill from the middle", m: "Art only $= 25 - 12 = 13$. Music only $= x - 12$. Neither $= 45 - 13 - 12 - (x - 12) = 32 - x$." },
        { h: "Every region is a count, so non-negative", m: "Music only $\\ge 0 \\Rightarrow x \\ge 12$; $\\quad$ neither $\\ge 0 \\Rightarrow x \\le 32$", mk: "M1" },
        { m: "$12 \\le x \\le 32$", mk: "A1", n: "Strict inequalities lose the A mark: everyone could do Music (neither = 0)." }
      ], result: "$12 \\le x \\le 32$" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Mutually exclusive events" },
    { callout: { t: "def", h: "Mutually exclusive", body: "Events $A$ and $B$ are mutually exclusive when they **cannot happen at the same time**: $P(A \\cap B) = 0$. On a Venn diagram the circles do not overlap (or the overlap is labelled 0)." } },
    { callout: { t: "memorise", h: "The addition rule for mutually exclusive events", body: [
      "$$P(A \\cup B) = P(A) + P(B) \\quad\\text{only when } A, B \\text{ are mutually exclusive}$$",
      "This is the general rule $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ with $P(A \\cap B) = 0$."
    ] } },
    { worked: { tag: "exam", title: "A missing region and a mutually exclusive pair", src: "AS Nov 2021 · P2 Q1 · 2 marks",
      q: "A Venn diagram shows events $A$, $B$ and $C$: $A$ only 0.2, $A \\cap B$ 0.2, $B$ only 0.2, $B \\cap C$ 0.1, $C$ only $p$, and $A$ and $C$ do not overlap. Nothing lies outside the circles. **(a)** Find $p$. **(b)** Write down a pair of mutually exclusive events from $A$, $B$ and $C$.",
      steps: [
        { h: "(a) Total probability", m: "$p = 1 - (0.2 + 0.2 + 0.2 + 0.1) = 0.3$", mk: "B1" },
        { h: "(b) No overlap", m: "$A$ and $C$.", mk: "B1", n: "Name the **events** — \"$P(A)$ and $P(C)$ are mutually exclusive\" is B0, since probabilities are numbers, not events." }
      ], result: "(a) 0.3 (b) $A$ and $C$" } },
    { callout: { t: "warn", h: "Mutually exclusive is not the same as independent", body: [
      "If $A$ and $B$ are mutually exclusive (and both possible), knowing $A$ happened tells you $B$ **did not** — that is the opposite of independence.",
      "Mutually exclusive: $P(A \\cap B) = 0$. Independent: $P(A \\cap B) = P(A)P(B) > 0$. Two events with non-zero probabilities cannot be both."
    ] } },

    /* ---------------------------------------------------------------- Page 4 */
    { page: "Independent events" },
    { callout: { t: "def", h: "Independent events", body: "$A$ and $B$ are independent when the occurrence of one **does not affect the probability** of the other." } },
    { callout: { t: "memorise", h: "Three equivalent tests — any one proves it", body: [
      "$$P(A \\cap B) = P(A) \\times P(B)$$",
      "$$P(A \\mid B) = P(A) \\qquad\\qquad P(B \\mid A) = P(B)$$",
      "To **show** independence: work out each side as a number and state they are equal.",
      "To **use** independence: write the equation with the unknowns in it, and solve.",
      "If $A$ and $B$ are independent, so are $A$ and $B'$, $A'$ and $B$, $A'$ and $B'$."
    ] } },
    { worked: { tag: "exam", title: "Exclusive, independent, and a teacher's belief", src: "AS Specimen · P2 Q4 · 7 marks",
      q: "Events $A$ (Alyona is late), $D$ (Dawn is late) and $S$ (Sergei is late) are shown on a Venn diagram: circle $D$ overlaps $A$ and $S$, but $A$ and $S$ do not overlap. The regions inside $D$ are $A \\cap D$ = 0.1, $D$ only = 0.1, $D \\cap S$ = 0.05; outside $D$ the regions are $A$ only $= p$, $S$ only $= q$ and outside all three $= r$. **(a)** Write down two events that are mutually exclusive, giving a reason. $P(S) = 0.2$ and $A$ and $D$ are independent. **(b)** Find $r$. The teacher believes that when Sergei is late, Dawn tends to be late. **(c)** State whether or not $D$ and $S$ are independent, giving a reason. **(d)** Comment on the teacher's belief.",
      steps: [
        { fig: venn({ w: 460, h: 190, circles: [[120, 95, 70, "A"], [230, 95, 70, "D", [0, -76]], [340, 95, 70, "S", [55, -55]]],
          labels: [[95, 95, "p"], [175, 95, "0.1"], [230, 95, "0.1"], [285, 95, "0.05"], [365, 95, "q"], [420, 170, "r"]] }),
          h: "(a)", m: "$A$ and $S$: their circles do not intersect, so Alyona and Sergei are never both late.", mk: "B1" },
        { h: "(b) Independence of $A$ and $D$", m: "$P(D) = 0.25$, $\\; P(A) = p + 0.1$, $\\; P(A \\cap D) = 0.1$\n$(p + 0.1) \\times 0.25 = 0.1 \\;\\Rightarrow\\; p = 0.3$", mk: "M1" },
        { h: "$P(S) = 0.2$", m: "$q = 0.2 - 0.05 = 0.15$", mk: "M1" },
        { h: "Total = 1", m: "$r = 1 - (0.3 + 0.1 + 0.1 + 0.05 + 0.15) = 0.3$", mk: "M1dd A1" },
        { h: "(c) Test $D$ and $S$", m: "$P(D) \\times P(S) = 0.25 \\times 0.2 = 0.05 = P(D \\cap S)$, so $D$ and $S$ **are independent**.", mk: "B1" },
        { h: "(d)", m: "The belief is not supported: Sergei being late does not change the probability that Dawn is late.", mk: "B1ft" }
      ], result: "(a) $A$ and $S$ (b) $r = 0.3$ (c) independent (d) the belief is not justified" } },
    { worked: { tag: "exam", title: "Exclusive and independent together: find $x$, $y$, $z$", src: "AS June 2019 · P2 Q2 · 5 marks",
      q: "A Venn diagram shows events $A$, $B$, $C$: $A$ only 0.10, $A \\cap B$ only $y$, $B$ only 0.30, $A \\cap B \\cap C$ = 0, $A \\cap C$ only $z$, $B \\cap C$ only $x$, $C$ only 0.39, outside 0.06. $B$ and $C$ are mutually exclusive; $A$ and $C$ are independent. Showing your working, find $x$, $y$ and $z$.",
      steps: [
        { fig: venn({ w: 460, h: 262, circles: [[180, 91, 68, "A"], [280, 91, 68, "B", [50, -55]], [230, 166, 68, "C", [0, 78]]],
          labels: [[150, 76, "0.10"], [230, 61, "y"], [310, 76, "0.30"], [230, 121, "0"], [185, 146, "z"], [275, 146, "x"], [230, 191, "0.39"], [420, 240, "0.06"]] }),
          h: "Mutually exclusive $B$, $C$", m: "$x = 0$", mk: "B1" },
        { h: "Label what independence needs", m: "$P(A) = 0.1 + y + z$, $\\; P(C) = 0.39 + z$, $\\; P(A \\cap C) = z$", mk: "M1" },
        { h: "Independence equation", m: "$z = (0.1 + y + z)(0.39 + z)$", mk: "M1" },
        { h: "Total = 1", m: "$0.10 + y + 0.30 + z + 0.39 + 0.06 = 1 \\;\\Rightarrow\\; y + z = 0.15$", mk: "M1", n: "This makes $P(A) = 0.25$ — the substitution that turns the quadratic into a linear equation." },
        { h: "Solve", m: "$z = 0.25(0.39 + z) \\;\\Rightarrow\\; 0.75z = 0.0975 \\;\\Rightarrow\\; z = 0.13$, $\\; y = 0.02$", mk: "A1" }
      ], result: "$x = 0$, $y = 0.02$, $z = 0.13$" } },
    { worked: { tag: "exam", title: "Can two events with frequencies be independent?", src: "AS June 2023 · P2 Q3(b) · 4 marks",
      q: "Of 45 club members, 25 do Art ($A$), 12 do both Art and Music, and $x$ do Music ($M$). A member is chosen at random. Determine whether or not it is possible for $A$ and $M$ to be independent.",
      steps: [
        { h: "The condition", m: "Independent $\\iff P(A) \\times P(M) = P(A \\cap M)$", mk: "M1" },
        { h: "Substitute", m: "$\\dfrac{25}{45} \\times \\dfrac{x}{45} = \\dfrac{12}{45}$", mk: "A1" },
        { h: "Solve", m: "$x = \\dfrac{12 \\times 45}{25} = 21.6$", mk: "A1" },
        { h: "Interpret", m: "$x$ counts students, so it must be a whole number. 21.6 is not, so $A$ and $M$ **cannot** be independent.", mk: "A1" }
      ], result: "Not possible — independence needs 21.6 students" } },
    { worked: { tag: "exam", title: "Supplier and fault: why not independent", src: "AS June 2018 · P2 Q2 · 4 marks",
      q: "A factory buys 10% of its components from supplier A, 30% from B and the rest from C. 6% of all components are faulty; 9% of A's and 3% of B's are faulty. **(a)** Find the percentage of C's components that are faulty. A component is chosen at random. **(b)** Explain why the event \"bought from B\" is not independent of the event \"faulty\".",
      steps: [
        { fig: tree([["A", "0.1"], ["B", "0.3"], ["C", "0.6"]], [[["F", "0.09"], ["F′", "0.91"]], [["F", "0.03"], ["F′", "0.97"]], [["F", "p"], ["F′", "1 − p"]]], { heads: ["supplier", "faulty?"] }),
          h: "(a) Total probability of a fault", m: "$0.1 \\times 0.09 + 0.3 \\times 0.03 + 0.6p = 0.06$", mk: "M1 A1" },
        { m: "$0.009 + 0.009 + 0.6p = 0.06 \\;\\Rightarrow\\; p = 0.07$, i.e. 7%", mk: "A1" },
        { h: "(b) Compare", m: "$P(B \\cap F) = 0.3 \\times 0.03 = 0.009$, but $P(B) \\times P(F) = 0.3 \\times 0.06 = 0.018$. They differ, so the events are not independent.", mk: "B1", n: "Equivalently $P(F \\mid B) = 0.03 \\ne P(F) = 0.06$: knowing the supplier changes the chance of a fault." }
      ], result: "(a) 7% (b) $0.009 \\ne 0.018$" } },
    { worked: { tag: "exam", title: "Independence of a compound event", src: "A-level Oct 2021 · P3 Q4(d) · 3 marks",
      q: "For magazines read by students (events $G$, $E$, $S$), the Venn diagram has $G$ only 0.08, $G \\cap E$ only 0.05, $E$ only 0.09, $G \\cap E \\cap S = 0$, $G \\cap S$ only 0.12, $E \\cap S$ only 0.10, $S$ only 0.36 and outside 0.20, with $P(G) = 0.25$. Determine whether or not the events $(S \\cap E')$ and $G$ are independent. Show your working clearly.",
      steps: [
        { fig: venn({ w: 460, h: 262, circles: [[180, 91, 68, "G"], [280, 91, 68, "E", [50, -55]], [230, 166, 68, "S", [0, 78]]],
          labels: [[150, 76, "0.08"], [230, 61, "0.05"], [310, 76, "0.09"], [230, 121, "0"], [185, 146, "0.12"], [275, 146, "0.10"], [230, 191, "0.36"], [420, 240, "0.20"]] }),
          h: "$S$ but not $E$", m: "$P(S \\cap E') = 0.12 + 0.36 = 0.48$", mk: "B1ft" },
        { h: "The intersection with $G$", m: "$P((S \\cap E') \\cap G) = 0.12$; $\\quad P(S \\cap E') \\times P(G) = 0.48 \\times 0.25 = 0.12$", mk: "M1" },
        { h: "Conclude", m: "They are equal, so $(S \\cap E')$ and $G$ **are independent**.", mk: "A1" }
      ], result: "Independent: $0.48 \\times 0.25 = 0.12$" } },
    { worked: { tag: "exam", title: "Set notation both ways", src: "A-level June 2024 · P3 Q6(a)(b)(e)(f) · 5 marks",
      q: "A Venn diagram shows events $A$, $B$, $C$, $D$: $A$ only $q$, $A \\cap B$ 0.05, $B$ only $p$, $B \\cap C$ 0.27, $C$ only (outside $D$) 0.25, $D$ (inside $C$, outside $B$) 0.08, outside all $r$. $A$ and $C$ do not overlap. **(a)** State any pair of mutually exclusive events. $B$ and $C$ are independent. **(b)** Find $p$. **(e)** Find $P([A \\cup B]' \\cap C)$. **(f)** Use set notation to write an expression for the event with probability $p$.",
      steps: [
        { fig: { w: 480, h: 190, items: [
          { poly: [[10, 10], [470, 10], [470, 180], [10, 180]], c: "muted", w: 1.4 },
          { circle: [120, 95, 72], fill: "accent", alpha: 0.09, c: "accent", w: 1.8 }, { circle: [235, 95, 72], fill: "accent2", alpha: 0.09, c: "accent2", w: 1.8 },
          { circle: [350, 95, 72], fill: "accent3", alpha: 0.09, c: "accent3", w: 1.8 }, { circle: [392, 110, 22], fill: "text2", alpha: 0.1, c: "text2", w: 1.6 },
          { text: [70, 30], t: "A", size: 14, c: "accent", b: true, i: true }, { text: [235, 16], t: "B", size: 14, c: "accent2", b: true, i: true },
          { text: [405, 30], t: "C", size: 14, c: "accent3", b: true, i: true }, { text: [410, 80], t: "D", size: 13, c: "text2", b: true, i: true },
          { text: [95, 95], t: "q", size: 13 }, { text: [178, 95], t: "0.05", size: 12.5 }, { text: [235, 95], t: "p", size: 13 },
          { text: [292, 95], t: "0.27", size: 12.5 }, { text: [392, 110], t: "0.08", size: 11.5 }, { text: [350, 150], t: "0.25", size: 12.5 }, { text: [40, 165], t: "r", size: 13 }
        ] }, h: "(a)", m: "e.g. $A$ and $C$ (also $A$ and $D$, or $B$ and $D$).", mk: "B1" },
        { h: "(b) Independence of $B$ and $C$", m: "$P(C) = 0.27 + 0.25 + 0.08 = 0.6$, $\\; P(B \\cap C) = 0.27$\n$0.27 = 0.6 \\times P(B) \\;\\Rightarrow\\; P(B) = 0.45 = 0.05 + p + 0.27 \\;\\Rightarrow\\; p = 0.13$", mk: "M1 A1" },
        { h: "(e) Inside $C$, outside $A$ and $B$", m: "$0.25 + 0.08 = 0.33$", mk: "B1" },
        { h: "(f) $B$ only", m: "$B \\cap A' \\cap C'$ (or $B \\cap (A \\cup C)'$)", mk: "B1" }
      ], result: "(a) $A$, $C$ (b) $p = 0.13$ (e) 0.33 (f) $B \\cap A' \\cap C'$" } },

    /* ---------------------------------------------------------------- Page 5 */
    { page: "Probability and distributions" },
    "Spec 3.1 ends with *link to discrete and continuous distributions*. The link is two pictures:",
    { kv: [
      ["Discrete", "Each value has its own probability; the probabilities of all the values add to 1 (S4.1). The bar heights **are** the probabilities."],
      ["Continuous", "Single values have probability 0. Probability is the **area under the curve** between two values, and the whole area is 1. That is the frequency-density histogram (S2.1) scaled so its area is 1."]
    ] },
    { fig: { x: [0, 15], y: [0, 0.45], w: 520, h: 230, axes: { x: "", y: "", xt: [], yt: [] }, items: [
      { line: [[1, 0], [1, 0.1]], c: "accent", w: 7 }, { line: [[2, 0], [2, 0.25]], c: "accent", w: 7 }, { line: [[3, 0], [3, 0.4]], c: "accent", w: 7 },
      { line: [[4, 0], [4, 0.15]], c: "accent", w: 7 }, { line: [[5, 0], [5, 0.1]], c: "accent", w: 7 },
      { text: [3, 0.43], t: "discrete: heights add to 1", size: 11.5, c: "accent" },
      { shade: { fn: "0.4*exp(-((x-11)^2)/2)", from: 10, to: 12.5 }, c: "accent2", alpha: 0.35 },
      { fn: "0.4*exp(-((x-11)^2)/2)", from: 7, to: 15, c: "accent2", w: 2.2 },
      { text: [11, 0.43], t: "continuous: area = probability", size: 11.5, c: "accent2" },
      { text: [11.2, 0.12], t: "P(10 < X < 12.5)", size: 11, c: "text", b: true }
    ], cap: "Left: a discrete distribution. Right: a continuous one — the shaded area is a probability, and $P(X = 11)$ is 0." } },
    { ul: [
      "For a continuous variable $P(X < a) = P(X \\le a)$ — the endpoint has no area.",
      "Knowledge of probability density functions is **not** required; the area idea is."
    ] },

    /* ---------------------------------------------------------------- Page 6 */
    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Write down** a pair of mutually exclusive events", "the event letters, read straight from non-overlapping circles"],
      ["**Find** the value of $p$, $q$, …", "an equation per fact (total, independence, a given probability), solved"],
      ["**Show that** / **Determine whether** independent", "$P(A \\cap B)$ and $P(A)P(B)$ as numbers, compared, and a conclusion"],
      ["**Showing your working**", "every probability you use labelled — $P(A) = \\ldots$ — before the equation"],
      ["**Use set notation**", "an expression with $\\cap$, $\\cup$ and $'$"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Label** each probability before substituting: \"$P(C) = 0.39 + z$\". Unlabelled numbers often lose the method mark.",
      "**Middle outwards**, total = 1 last.",
      "**Independence** gives the equation; **mutual exclusivity** gives a 0.",
      "**Conclusions** must be stated: \"so they are independent\" — not just two equal numbers."
    ] },
    { h: "Misconceptions" },
    { ul: [
      "\"$P(A \\cup B) = P(A) + P(B)$ always\" — only for mutually exclusive events.",
      "\"Independent means mutually exclusive.\"",
      "\"$P(A)$ is the 'A only' region\" — it is the whole circle.",
      "\"$P(A)$ and $P(B)$ are mutually exclusive\" — events are, numbers are not."
    ] },
    { callout: { t: "mnemonic", h: "\"Exclusive: add. Independent: multiply.\"", body: "$P(A \\cup B) = P(A) + P(B)$ for exclusive events; $P(A \\cap B) = P(A)P(B)$ for independent events." } }
  ],
  flashcards: [
    ["Mutually exclusive — definition and rule?", "Cannot both happen: $P(A \\cap B) = 0$, so $P(A \\cup B) = P(A) + P(B)$."],
    ["Independent — definition and rule?", "One does not affect the other: $P(A \\cap B) = P(A)P(B)$."],
    ["Two other tests for independence?", "$P(A \\mid B) = P(A)$; $P(B \\mid A) = P(B)$."],
    ["General addition rule?", "$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$."],
    ["$A \\cap B'$ in words?", "$A$ and not $B$ ($A$ only, in a two-set diagram)."],
    ["$(A \\cup B)'$ in words?", "Neither $A$ nor $B$."],
    ["Order for filling a Venn diagram?", "Middle outwards; total = 1 last."],
    ["Can two events with non-zero probabilities be both exclusive and independent?", "No: exclusive gives $P(A \\cap B) = 0$ but independence needs $P(A)P(B) > 0$."],
    ["$P(D) = 0.25$, $P(S) = 0.2$, $P(D \\cap S) = 0.05$. Independent?", "Yes: $0.25 \\times 0.2 = 0.05$."],
    ["Art 25 of 45, both 12. Music count for independence?", "$x = 21.6$ — impossible, so not independent."],
    ["If $A$, $B$ independent, what about $A$ and $B'$?", "Also independent."],
    ["What is probability for a continuous variable?", "Area under the curve between two values; total area 1."],
    ["$P(X = a)$ for a continuous variable?", "0."]
  ],
  quiz: [
    { q: "$P(A) = 0.3$, $P(B) = 0.5$, independent. $P(A \\cap B) =$", opts: ["0.15", "0.8", "0", "0.2"], ans: 0, why: "Multiply." },
    { q: "$P(A) = 0.3$, $P(B) = 0.5$, mutually exclusive. $P(A \\cup B) =$", opts: ["0.8", "0.65", "0.15", "1"], ans: 0, why: "Add." },
    { q: "$P(A) = 0.4$, $P(B) = 0.5$, $P(A \\cup B) = 0.7$. $P(A \\cap B) =$", opts: ["0.2", "0.1", "0.3", "0"], ans: 0, why: "$0.4 + 0.5 - 0.7$." },
    { q: "With the values above, $A$ and $B$ are", opts: ["independent", "mutually exclusive", "neither", "both"], ans: 0, why: "$0.4 \\times 0.5 = 0.2$." },
    { q: "In a Venn diagram, $P(A)$ is", opts: ["the whole of circle $A$", "the 'A only' region", "outside $A$", "$A \\cap B$"], ans: 0, why: "Every region inside $A$." },
    { q: "For a continuous random variable, probability is", opts: ["area under the curve", "the height of the curve", "always 0.5", "the mode"], ans: 0, why: "Areas, total 1." }
  ]
};

/* =====================================================================
   S3.2  Conditional probability: tree diagrams, Venn diagrams, two-way tables
   ===================================================================== */
C["maths:S3.2"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Conditional probability — the whole topic on one page" },
    "**Conditional probability** is probability *given* some information: \"what is the probability of $A$, now that we know $B$ happened?\"",
    "Knowing $B$ shrinks the sample space to $B$; the answer is the share of $B$ that is also $A$.",
    { callout: { t: "formula", h: "The conditional probability formula (printed in the booklet)", body: [
      "$$P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)} \\qquad\\Longleftrightarrow\\qquad P(A \\cap B) = P(B)\\,P(A \\mid B)$$",
      "Read it as: **(the part of $B$ that is also $A$) ÷ (all of $B$)**."
    ] } },
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["Conditional probability from a Venn diagram", "2–4", "A-level 2023 Q1(c), Oct 2020 Q1(d), Oct 2021 Q4(c), 2024 Q6(c)(d)"],
      ["A given conditional probability fixes an unknown region", "3–7", "A-level Specimen Q4(c), Oct 2020 Q1(d), Oct 2021 Q4(c)"],
      ["Two-way table → probabilities → Venn diagram → conditional", "10", "A-level June 2022 Q5"],
      ["Tree diagram: missing branch, at least one, conditional reversed", "5–9", "A-level June 2025 Q1, AS 2018 Q2"],
      ["Sequential selections (with/without replacement)", "5", "AS Nov 2021 Q5"],
      ["Greatest possible value of a conditional probability", "3", "A-level June 2024 Q6(c)"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**The formula and Venn diagrams**.",
      "**Two-way tables**.",
      "**Tree diagrams** — multiplying along, adding down, and reversing a condition.",
      "**Selections and counting** — without replacement, and \"at least one\".",
      "**Exam toolkit**."
    ] },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "The formula and Venn diagrams" },
    { fig: venn({ w: 460, h: 200, circles: [[180, 100, 75, "A"], [280, 100, 75, "B", [55, -62]]],
      labels: [[130, 100, "0.13"], [230, 100, "0.25", "accent2"], [330, 100, "0.35"], [420, 180, "0.27"]],
      cap: "$P(A \\mid B) = \\dfrac{0.25}{0.25 + 0.35} = \\dfrac{0.25}{0.6} = 0.417$: inside $B$ only, the share that is also in $A$." }) },
    { callout: { t: "memorise", h: "Reading $P(X \\mid Y)$ off a Venn diagram", body: [
      "**Denominator:** everything inside $Y$ — add all of $Y$'s regions.",
      "**Numerator:** the part of those regions that is also inside $X$.",
      "Check: the numerator must be smaller than the denominator.",
      "$P(A \\mid B')$: the denominator is everything **outside** $B$."
    ] } },
    { worked: { tag: "exam", title: "$P(A)$, independence, then $P(A \\mid B')$", src: "A-level June 2023 · P3 Q1 · 6 marks",
      q: "A Venn diagram shows events $A$, $B$, $C$ with $A$ only 0.13, $A \\cap B$ 0.25, $B$ only 0.05, $B \\cap C$ 0.3, $C$ only $p$ and outside $q$; $A$ and $C$ do not overlap. **(a)** Find $P(A)$. $B$ and $C$ are independent. **(b)** Find $p$ and $q$. **(c)** Find $P(A \\mid B')$.",
      steps: [
        { fig: venn({ w: 460, h: 230, circles: [[130, 80, 62, "A"], [230, 110, 62, "B", [40, -60]], [330, 150, 62, "C", [55, 0]]],
          labels: [[105, 72, "0.13"], [178, 95, "0.25"], [245, 90, "0.05"], [282, 132, "0.3"], [350, 165, "p"], [80, 195, "q"]] }),
          h: "(a)", m: "$P(A) = 0.13 + 0.25 = 0.38$", mk: "B1" },
        { h: "(b) Independence of $B$ and $C$", m: "$P(B) = 0.25 + 0.05 + 0.3 = 0.6$, $\\; P(C) = 0.3 + p$, $\\; P(B \\cap C) = 0.3$\n$0.6(0.3 + p) = 0.3 \\;\\Rightarrow\\; p = 0.2$", mk: "M1 A1" },
        { h: "Total = 1", m: "$q = 1 - (0.13 + 0.25 + 0.05 + 0.3 + 0.2) = 0.07$", mk: "B1ft" },
        { h: "(c) Outside $B$", m: "$P(A \\mid B') = \\dfrac{P(A \\cap B')}{P(B')} = \\dfrac{0.13}{1 - 0.6} = 0.325$", mk: "M1 A1" }
      ], result: "(a) 0.38 (b) $p = 0.2$, $q = 0.07$ (c) 0.325" } },
    { worked: { tag: "exam", title: "Four events, one condition at a time", src: "A-level Oct 2020 · P3 Q1 · 8 marks",
      q: "A Venn diagram shows events $A$, $B$, $C$, $D$: $D$ is a small circle inside $A$ (probability $q$, not overlapping $B$), $A$ only (outside $D$) 0.16, $A \\cap B$ 0.24, $B$ only 0.07, $B \\cap C$ $p$, $C$ only $r$, outside $s$; $A$ and $C$ do not overlap. **(a)** Write down a pair of mutually exclusive events. Given $P(B) = 0.4$, **(b)** find $p$. Given also that $A$ and $B$ are independent, **(c)** find $q$. Given further that $P(B' \\mid C) = 0.64$, **(d)** find $r$ and $s$.",
      steps: [
        { fig: { w: 460, h: 190, items: [
          { poly: [[10, 10], [450, 10], [450, 180], [10, 180]], c: "muted", w: 1.4 },
          { circle: [140, 100, 72], fill: "accent", alpha: 0.09, c: "accent", w: 1.8 }, { circle: [230, 75, 55], fill: "accent2", alpha: 0.09, c: "accent2", w: 1.8 },
          { circle: [320, 100, 72], fill: "accent3", alpha: 0.09, c: "accent3", w: 1.8 }, { circle: [110, 125, 24], fill: "text2", alpha: 0.12, c: "text2", w: 1.6 },
          { text: [80, 35], t: "A", size: 14, c: "accent", b: true, i: true }, { text: [230, 14], t: "B", size: 14, c: "accent2", b: true, i: true },
          { text: [385, 35], t: "C", size: 14, c: "accent3", b: true, i: true }, { text: [78, 112], t: "D", size: 12, c: "text2", b: true, i: true },
          { text: [110, 125], t: "q", size: 12.5 }, { text: [150, 140], t: "0.16", size: 12.5 }, { text: [185, 80], t: "0.24", size: 12.5 },
          { text: [230, 45], t: "0.07", size: 12.5 }, { text: [270, 80], t: "p", size: 12.5 }, { text: [345, 125], t: "r", size: 12.5 }, { text: [230, 165], t: "s", size: 12.5 }
        ] }, h: "(a)", m: "e.g. $A$ and $C$ (or $B$ and $D$, or $C$ and $D$).", mk: "B1" },
        { h: "(b)", m: "$p = 0.4 - 0.07 - 0.24 = 0.09$", mk: "B1" },
        { h: "(c) Independence of $A$ and $B$", m: "$P(A) \\times 0.4 = 0.24 \\;\\Rightarrow\\; P(A) = 0.6 = q + 0.16 + 0.24 \\;\\Rightarrow\\; q = 0.20$", mk: "M1 A1", n: "Not $P(A) = 1 - P(B)$ — that is a guess that happens to work here and scores M0." },
        { h: "(d)(i) The condition", m: "$P(B' \\mid C) = \\dfrac{r}{r + p} = \\dfrac{r}{r + 0.09} = 0.64$", mk: "M1" },
        { m: "$r = 0.64r + 0.0576 \\;\\Rightarrow\\; 0.36r = 0.0576 \\;\\Rightarrow\\; r = 0.16$", mk: "A1" },
        { h: "(d)(ii) Total = 1", m: "$s = 1 - (0.6 + 0.07 + 0.09 + 0.16) = 0.08$", mk: "M1 A1" }
      ], result: "(a) $A$, $C$ (b) 0.09 (c) 0.20 (d) $r = 0.16$, $s = 0.08$" } },
    { worked: { tag: "exam", title: "Two equations from independence and a conditional", src: "A-level Specimen · P3 Q4 · 11 marks",
      q: "A Venn diagram shows lunch boxes containing a drink ($D$), sandwiches ($S$) and a chocolate bar ($C$). $S$ lies entirely inside $D$. The regions are: $S \\cap C$ 0.27, $S \\cap C'$ 0.33, $D \\cap C \\cap S'$ $v$, $D$ only $w$, $C$ outside $D$ $u$, and outside all 0. **(a)** Write down $P(S \\cap D')$. 80 students bring lunch boxes that all contain sandwiches and a drink. **(b)** Estimate how many contain a chocolate bar. Given that $S$ and $C$ are independent and $P(D \\mid C) = \\frac{14}{15}$, **(c)** find $u$, $v$ and $w$.",
      steps: [
        { fig: { w: 460, h: 200, items: [
          { poly: [[10, 10], [450, 10], [450, 190], [10, 190]], c: "muted", w: 1.4 },
          { circle: [190, 100, 82], fill: "accent", alpha: 0.08, c: "accent", w: 1.8 }, { circle: [170, 105, 42], fill: "accent2", alpha: 0.12, c: "accent2", w: 1.8 },
          { circle: [270, 110, 78], fill: "accent3", alpha: 0.08, c: "accent3", w: 1.8 },
          { text: [190, 12], t: "D", size: 14, c: "accent", b: true, i: true }, { text: [118, 80], t: "S", size: 13, c: "accent2", b: true, i: true },
          { text: [360, 70], t: "C", size: 14, c: "accent3", b: true, i: true },
          { text: [150, 98], t: "0.33", size: 12 }, { text: [195, 112], t: "0.27", size: 12 }, { text: [240, 150], t: "v", size: 13 },
          { text: [160, 40], t: "w", size: 13 }, { text: [310, 120], t: "u", size: 13 }, { text: [430, 25], t: "0", size: 12.5 }
        ] }, h: "(a) $S$ is inside $D$", m: "$P(S \\cap D') = 0$", mk: "B1" },
        { h: "(b) Condition on $S \\cap D$ (which is $S$)", m: "$P(C \\mid S \\cap D) = \\dfrac{0.27}{0.6} = 0.45$", mk: "M1" },
        { m: "$80 \\times 0.45 = 36$ lunch boxes", mk: "M1 A1" },
        { h: "(c) Independence of $S$ and $C$", m: "$P(S) = 0.6$, $\\; P(C) = 0.27 + v + u$, $\\; P(S \\cap C) = 0.27$\n$0.6(0.27 + u + v) = 0.27 \\;\\Rightarrow\\; u + v = 0.18$", mk: "M1 A1" },
        { h: "The conditional", m: "$P(D \\mid C) = \\dfrac{0.27 + v}{0.27 + v + u} = \\dfrac{0.27 + v}{0.45} = \\dfrac{14}{15}$", mk: "M1 A1" },
        { h: "Solve", m: "$0.27 + v = 0.42 \\;\\Rightarrow\\; v = 0.15$, $\\; u = 0.03$", mk: "M1dd A1" },
        { h: "Total = 1", m: "$w = 1 - (0.33 + 0.27 + 0.15 + 0.03) = 0.22$", mk: "A1ft" }
      ], result: "(a) 0 (b) 36 (c) $u = 0.03$, $v = 0.15$, $w = 0.22$" } },
    { worked: { tag: "exam", title: "A conditional from a three-circle diagram", src: "A-level Oct 2021 · P3 Q4(a)–(c) · 8 marks",
      q: "For students reading magazines on green issues ($G$), equality ($E$) and sports ($S$): $G$ only 0.08, $G \\cap E$ only 0.05, $E$ only 0.09, centre $p$, $G \\cap S$ only $q$, $E \\cap S$ only $r$, $S$ only 0.36, outside $t$. **(a)** Find the proportion who read exactly one magazine. No student reads all three, and $P(G) = 0.25$. **(b)** Find $p$ and $q$. Given $P(S \\mid E) = \\frac{5}{12}$, **(c)** find $r$ and $t$.",
      steps: [
        { h: "(a) The three \"only\" regions", m: "$0.08 + 0.09 + 0.36 = 0.53$", mk: "B1" },
        { h: "(b)", m: "$p = 0$; $\\quad 0.08 + 0.05 + q + 0 = 0.25 \\;\\Rightarrow\\; q = 0.12$", mk: "B1 M1 A1" },
        { h: "(c) Inside $E$: $0.05 + 0.09 + 0 + r$", m: "$P(S \\mid E) = \\dfrac{r}{0.14 + r} = \\dfrac{5}{12}$", mk: "M1 A1ft" },
        { m: "$12r = 0.7 + 5r \\;\\Rightarrow\\; r = 0.10$", mk: "A1" },
        { h: "Total = 1", m: "$t = 1 - (0.08 + 0.05 + 0.09 + 0.12 + 0.10 + 0.36) = 0.20$", mk: "B1ft" }
      ], result: "(a) 0.53 (b) $p = 0$, $q = 0.12$ (c) $r = 0.10$, $t = 0.20$" } },
    { worked: { tag: "exam", title: "The greatest possible conditional probability; then fix it", src: "A-level June 2024 · P3 Q6(c)(d) · 6 marks",
      q: "In the Venn diagram of events $A$, $B$, $C$, $D$ (with $A$ only $q$, $A \\cap B$ 0.05, $B$ only 0.13, $B \\cap C$ 0.27, $C$ only 0.25, $D$ inside $C$ 0.08, outside $r$; so $P(B) = 0.45$): **(c)** find the greatest possible value of $P(A \\mid B')$. Given that $P(B \\mid A') = 0.5$, **(d)** find $q$ and $r$.",
      steps: [
        { h: "(c) Write the conditional with the unknown", m: "$P(A \\mid B') = \\dfrac{q}{1 - 0.45} = \\dfrac{q}{0.55}$", mk: "M1" },
        { h: "How big can $q$ be?", m: "$q + r = 1 - (0.05 + 0.13 + 0.27 + 0.25 + 0.08) = 0.22$; since $r \\ge 0$, $q \\le 0.22$", mk: "M1" },
        { m: "Greatest $P(A \\mid B') = \\dfrac{0.22}{0.55} = 0.4$", mk: "A1" },
        { h: "(d) Outside $A$", m: "$P(B \\mid A') = \\dfrac{0.13 + 0.27}{1 - q - 0.05} = \\dfrac{0.4}{0.95 - q} = 0.5$", mk: "M1" },
        { m: "$0.95 - q = 0.8 \\;\\Rightarrow\\; q = 0.15$, $\\; r = 0.07$", mk: "A1 A1ft" }
      ], result: "(c) 0.4 (d) $q = 0.15$, $r = 0.07$" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Two-way tables" },
    "A two-way table counts every combination of two classifications. Conditional probabilities come from **one row or one column**:",
    { callout: { t: "memorise", h: "Reading a two-way table", body: [
      "$P(\\text{row } R) = \\dfrac{\\text{row total}}{\\text{grand total}}$",
      "$P(\\text{row } R \\mid \\text{column } K) = \\dfrac{\\text{cell}}{\\text{column } K \\text{ total}}$ — the condition picks the denominator.",
      "Turning a table into a Venn diagram: each cell is one region."
    ] } },
    { worked: { tag: "exam", title: "Table → percentages → Venn diagram → conditional", src: "A-level June 2022 · P3 Q5 · 10 marks",
      q: "A company has 1825 employees: Professional 740 in area A and 380 in area B; Skilled 275 (A) and 90 (B); Elementary 260 (A) and 80 (B). An employee is chosen at random. Find the probability that the employee **(a)** is skilled, **(b)** lives in area B and is not a professional. 65% of professional, 40% of skilled and 5% of elementary employees (in both areas) work from home. Let $F$ = professional, $H$ = works from home, $R$ = from area A. **(c)** Complete the Venn diagram of frequencies, given $R \\cap F' \\cap H = 123$, $R' \\cap F \\cap H' = 133$, $R' \\cap F \\cap H = 247$ and $R \\cap F' \\cap H' = 412$. **(d)** Find $P(R' \\cap F)$. **(e)** Find $P([H \\cup R]')$. **(f)** Find $P(F \\mid H)$.",
      steps: [
        { h: "(a) A row total", m: "$\\dfrac{275 + 90}{1825} = \\dfrac{365}{1825} = \\dfrac{1}{5}$", mk: "B1" },
        { h: "(b) Area B, skilled or elementary", m: "$\\dfrac{90 + 80}{1825} = \\dfrac{170}{1825} = 0.093$", mk: "B1" },
        { h: "(c) The four missing regions", m: "$R \\cap F \\cap H$: $740 \\times 0.65 = 481$; $\\quad R \\cap F \\cap H'$: $740 \\times 0.35 = 259$\n$R' \\cap F' \\cap H$: $90 \\times 0.4 + 80 \\times 0.05 = 40$; $\\quad$ outside all: $90 \\times 0.6 + 80 \\times 0.95 = 130$", mk: "M1 B1 B1 A1",
          fig: venn({ w: 460, h: 270, circles: [[180, 92, 70, "H"], [280, 92, 70, "R", [55, -60]], [230, 168, 70, "F", [0, 80]]],
            labels: [[140, 70, "40"], [230, 60, "123"], [320, 70, "412"], [230, 118, "481"], [185, 150, "247"], [278, 150, "259"], [230, 195, "133"], [420, 248, "130", "accent2"]] }) },
        { h: "(d) Professional in area B", m: "$P(R' \\cap F) = \\dfrac{247 + 133}{1825} = \\dfrac{380}{1825} = 0.208$", mk: "B1" },
        { h: "(e) Neither home-working nor area A", m: "$\\dfrac{133 + 130}{1825} = \\dfrac{263}{1825} = 0.144$", mk: "B1ft" },
        { h: "(f) Inside $H$", m: "$P(F \\mid H) = \\dfrac{481 + 247}{481 + 247 + 123 + 40} = \\dfrac{728}{891} = 0.817$", mk: "M1 A1" }
      ], result: "(a) $\\frac15$ (b) 0.093 (c) 481, 259, 40, 130 (d) 0.208 (e) 0.144 (f) 0.817" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Tree diagrams" },
    "A tree diagram shows events in **sequence**. The second-stage branches carry **conditional** probabilities: each is \"given what happened on the branch before\".",
    { callout: { t: "memorise", h: "The two rules", body: [
      "**Multiply along a path** to get the probability of that whole path: $P(A \\cap B) = P(A)\\,P(B \\mid A)$.",
      "**Add the paths** that make up the event you want.",
      "Branches from one point add to 1.",
      "\"At least one\" is fastest as $1 - P(\\text{none})$."
    ] } },
    { worked: { tag: "exam", title: "A missing branch, at least one, and a reversed condition", src: "A-level June 2025 · P3 Q1 · 9 marks",
      q: "Bag A contains 5 red, 4 yellow and 3 green beads. Bag B contains only red and yellow beads. One bead is taken at random from each bag. The probability that both beads are yellow is $\\frac{3}{16}$. **(a)** (i) Find the probability of taking a yellow bead from bag B. (ii) Complete the tree diagram. **(b)** Find the exact probability that at least one of the beads is yellow. Let $X$ be the event that at least one bead is yellow and $W$ the event that a green bead is selected. **(c)** Find the exact value of $P(W \\mid X)$.",
      steps: [
        { h: "(a)(i) Use the given path", m: "$\\dfrac{4}{12} \\times y = \\dfrac{3}{16} \\;\\Rightarrow\\; y = \\dfrac{9}{16}$", mk: "M1 A1" },
        { h: "(a)(ii) The tree", m: "Bag A: red $\\frac{5}{12}$, yellow $\\frac{4}{12}$, green $\\frac{3}{12}$. Bag B (the same on every branch — the bags are independent): red $\\frac{7}{16}$, yellow $\\frac{9}{16}$.", mk: "B1 B1ft",
          fig: tree([["R", "5/12"], ["Y", "4/12"], ["G", "3/12"]], [[["R", "7/16", "35/192"], ["Y", "9/16", "45/192"]], [["R", "7/16", "28/192"], ["Y", "9/16", "36/192"]], [["R", "7/16", "21/192"], ["Y", "9/16", "27/192"]]],
            { hl: ["0.1", "1.0", "1.1", "2.1"], heads: ["bag A", "bag B"] }) },
        { h: "(b) Complement", m: "$P(\\text{no yellow}) = \\left(\\dfrac{5}{12} + \\dfrac{3}{12}\\right) \\times \\dfrac{7}{16} = \\dfrac{8}{12} \\times \\dfrac{7}{16} = \\dfrac{7}{24}$", mk: "M1 M1" },
        { m: "$P(X) = 1 - \\dfrac{7}{24} = \\dfrac{17}{24}$", mk: "A1" },
        { h: "(c) Paths in both $W$ and $X$", m: "Green from A **and** at least one yellow: only green-then-yellow, $\\dfrac{3}{12} \\times \\dfrac{9}{16} = \\dfrac{27}{192}$", mk: "M1" },
        { m: "$P(W \\mid X) = \\dfrac{27/192}{17/24} = \\dfrac{27}{136}$", mk: "A1" }
      ], result: "(a) $\\frac{9}{16}$ (b) $\\frac{17}{24}$ (c) $\\frac{27}{136}$" } },
    { callout: { t: "tip", h: "Reversing a condition (the \"Bayes\" shape) without Bayes", body: [
      "The tree gives $P(\\text{second} \\mid \\text{first})$. Questions often ask the other way round: \"given the component is faulty, what is the probability it came from A?\"",
      "No new formula: $P(A \\mid F) = \\dfrac{P(A \\cap F)}{P(F)}$ — one path on top, the sum of all the $F$ paths underneath.",
      "Factory example: $P(A \\mid F) = \\dfrac{0.1 \\times 0.09}{0.06} = 0.15$."
    ] } },

    /* ---------------------------------------------------------------- Page 4 */
    { page: "Selections and counting" },
    { ul: [
      "**With replacement**: the probabilities stay the same from draw to draw (independent draws).",
      "**Without replacement**: the second draw's probabilities change — both the colour count and the total drop by one.",
      "**Moving balls between bags** changes the second bag's contents — write the new contents on each branch before multiplying."
    ] },
    { worked: { tag: "exam", title: "Swapping balls between bags until the colours balance", src: "AS Nov 2021 · P2 Q5 · 5 marks",
      q: "Bag A contains 4 red, 3 yellow and $n$ green balls; bag B contains 5 red, 3 yellow and 1 green ball. A ball is taken at random from A and put into B; then a ball is taken at random from B and put into A. The probability that bag A now contains equal numbers of red, yellow and green balls is $p$. Given that $p > 0$, find the possible values of $n$ and $p$.",
      steps: [
        { h: "What can balance?", m: "A ends with $(4, 3, n)$ minus one ball plus one ball. Equal counts need **3 of each** or **4 of each**.", mk: "M1" },
        { h: "3 of each: a red out, a green back, $n = 2$", m: "A has 9 balls; B then has 6 R, 3 Y, 1 G (10 balls).\n$p = \\dfrac{4}{9} \\times \\dfrac{1}{10} = \\dfrac{2}{45}$", mk: "M1 A1" },
        { h: "4 of each: a green out, a yellow back, $n = 5$", m: "A has 12 balls; B then has 5 R, 3 Y, 2 G.\n$p = \\dfrac{5}{12} \\times \\dfrac{3}{10} = \\dfrac{1}{8}$", mk: "M1 A1", n: "Two separate scenarios — **not** to be added: each value of $n$ has its own $p$." }
      ], result: "$n = 2$, $p = \\frac{2}{45}$; or $n = 5$, $p = \\frac{1}{8}$" } },
    { worked: { tag: "example", title: "Without replacement, at least one", src: "practice variant",
      q: "A box has 6 working and 4 faulty bulbs. Three are taken without replacement. Find the probability that at least one is faulty, and the probability that exactly one is faulty.",
      steps: [
        { h: "None faulty", m: "$\\dfrac{6}{10} \\times \\dfrac{5}{9} \\times \\dfrac{4}{8} = \\dfrac{1}{6}$, so $P(\\text{at least one faulty}) = \\dfrac{5}{6}$" },
        { h: "Exactly one faulty: three orders", m: "$3 \\times \\dfrac{4}{10} \\times \\dfrac{6}{9} \\times \\dfrac{5}{8} = 3 \\times \\dfrac{1}{6} = \\dfrac{1}{2}$", n: "Each order (F W W, W F W, W W F) has the same product — multiply by the number of orders." }
      ], result: "$\\frac56$; $\\frac12$" } },

    /* ---------------------------------------------------------------- Page 5 */
    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**Find** $P(A \\mid B)$", "a ratio: part of $B$ in $A$ over all of $B$, with the probabilities labelled"],
      ["**Given that** $P(\\ldots \\mid \\ldots) = k$, **find**", "the conditional written with the unknown, set equal to $k$, solved"],
      ["**Complete the tree diagram**", "every branch labelled, each set adding to 1"],
      ["**Exact** probability", "a fraction — not a rounded decimal"],
      ["**Greatest possible value**", "write the expression, then find the largest the unknown can be (another region ≥ 0)"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**The denominator is the condition** — the event after the bar.",
      "**A conditional set equal to a number** is an equation: clear the fraction before solving.",
      "**Trees**: multiply along, add across; conditional branches change after the first draw without replacement.",
      "**Venn from a table**: one region per cell; check the total."
    ] },
    { h: "Misconceptions" },
    { ul: [
      "\"$P(A \\mid B) = P(B \\mid A)$\" — they are usually different.",
      "\"$P(A \\mid B) = P(A \\cap B)$\" — forgetting to divide by $P(B)$.",
      "\"Two scenarios with different $n$ add\" — each is a separate answer.",
      "\"With and without replacement give the same answer\" — only for large populations, approximately."
    ] },
    { callout: { t: "mnemonic", h: "\"Given goes underneath\"", body: "In $P(A \\mid B)$, the event after the bar is the denominator." } }
  ],
  flashcards: [
    ["Conditional probability formula?", "$P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}$."],
    ["Multiplication rule from it?", "$P(A \\cap B) = P(B)P(A \\mid B) = P(A)P(B \\mid A)$."],
    ["In $P(A \\mid B')$, the denominator is…", "$P(B') = 1 - P(B)$."],
    ["Tree diagram rules?", "Multiply along paths; add the paths that make the event."],
    ["At least one — fastest route?", "$1 - P(\\text{none})$."],
    ["$P(B) = 0.6$, $P(A \\cap B) = 0.25$. $P(A \\mid B)$?", "$0.417$."],
    ["$P(B' \\mid C) = \\frac{r}{r + 0.09} = 0.64$. $r$?", "$0.16$."],
    ["$P(S \\mid E) = \\frac{r}{0.14 + r} = \\frac{5}{12}$. $r$?", "$0.1$."],
    ["Bag A 5R 4Y 3G; $P(YY) = \\frac{3}{16}$. $P(Y \\text{ from B})$?", "$\\frac{9}{16}$."],
    ["From a two-way table, $P(\\text{row} \\mid \\text{column})$?", "Cell ÷ column total."],
    ["Without replacement — what changes?", "Both the count of that type and the total drop by 1."],
    ["Factory: $P(A) = 0.1$, $P(F \\mid A) = 0.09$, $P(F) = 0.06$. $P(A \\mid F)$?", "$\\frac{0.009}{0.06} = 0.15$."]
  ],
  quiz: [
    { q: "$P(A \\cap B) = 0.12$, $P(B) = 0.4$. $P(A \\mid B) =$", opts: ["0.3", "0.048", "0.12", "0.52"], ans: 0, why: "$0.12 / 0.4$." },
    { q: "$P(A) = 0.5$, $P(B \\mid A) = 0.3$. $P(A \\cap B) =$", opts: ["0.15", "0.8", "0.6", "0.2"], ans: 0, why: "Multiply." },
    { q: "If $P(A \\mid B) = P(A)$ then $A$ and $B$ are", opts: ["independent", "mutually exclusive", "complementary", "equal"], ans: 0, why: "Knowing $B$ changes nothing." },
    { q: "Two red balls from 3 red, 2 blue without replacement:", opts: ["$\\tfrac{3}{10}$", "$\\tfrac{9}{25}$", "$\\tfrac{6}{25}$", "$\\tfrac{3}{5}$"], ans: 0, why: "$\\frac35 \\times \\frac24$." },
    { q: "In $P(F \\mid H)$ from a Venn diagram of counts, the denominator is", opts: ["the total inside $H$", "the total inside $F$", "the grand total", "$F \\cap H$"], ans: 0, why: "Given $H$." }
  ]
};

/* =====================================================================
   S3.3  Modelling with probability; critiquing assumptions
   ===================================================================== */
C["maths:S3.3"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Modelling with probability — the whole topic on one page" },
    "Spec 3.3: **model** a situation with probability, **critique the assumptions** the model makes, and say **what more realistic assumptions would change**.",
    "Every probability calculation rests on assumptions — that a coin is fair, that trials are independent, that a probability stays the same. These questions ask you to name them and test them against the context.",
    { table: { head: ["Question shape", "Marks", "Seen in"], rows: [
      ["State an assumption the model makes", "1", "throughout S3–S5"],
      ["Comment on a model in the light of data", "1", "A-level June 2018 Q1, June 2023 Q5(c)"],
      ["Suggest a refinement", "1", "A-level June 2018 Q1(d)"],
      ["Why a model is unsuitable in context (independence, constant $p$)", "1", "A-level June 2022 Q3(d)"],
      ["Build a distribution from modelling statements", "7", "A-level June 2023 Q5"],
      ["Use a result to comment on a belief", "1", "AS Specimen Q4(d)"]
    ] } },

    /* ---------------------------------------------------------------- Page 1 */
    { page: "Models and assumptions" },
    { kv: [
      ["Model", "A simplified mathematical description of a real situation: \"each day is dry with probability 0.27, independently\"."],
      ["Assumption", "Something the model takes to be true that may not be: the die is fair; days are independent; the probability is the same every day."],
      ["Theoretical probability", "From the model (equally likely outcomes, symmetry): $P(6) = \\frac16$."],
      ["Experimental probability (relative frequency)", "From data: $\\frac{\\text{number of times the event happened}}{\\text{number of trials}}$. It estimates the true probability better as the number of trials grows."],
      ["Expected frequency", "$n \\times P(A)$: in 300 rolls of a fair die, expect $300 \\times \\frac16 = 50$ sixes."]
    ] },
    { callout: { t: "memorise", h: "The assumptions to look for, and how they fail", body: [
      "**Equally likely / fair** — a coin or die may be biased; outcomes may not be symmetrical (cloud cover is not uniform over 0–8 oktas).",
      "**Independence** — weather comes in spells; a student late today may be late tomorrow; people in a household are linked.",
      "**Constant probability** — the chance of rain changes through the season; a player gets tired; components age.",
      "**Fixed number of trials** and **two outcomes** — needed for a binomial model (S4)."
    ] } },
    { callout: { t: "tip", h: "How to write a critique that scores", body: [
      "Name the assumption **in context**, say **why it might fail here**, and (if asked) **what a more realistic assumption would do**.",
      "\"The probability of a dry day is unlikely to be constant — summer days are drier than October days — so B(14, 0.27) may underestimate the number of dry days in a summer fortnight.\""
    ] } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Critiquing a model" },
    { worked: { tag: "exam", title: "A uniform model for cloud cover — comment and refine", src: "A-level June 2018 · P3 Q1 · 5 marks",
      q: "Helen believes the random variable $C$, cloud cover from the large data set, can be modelled by a discrete uniform distribution. **(a)** Write down the probability distribution for $C$. **(b)** Using this model, find the probability that cloud cover is less than 50%. Helen uses all the data for Hurn in 2015 and finds the proportion of days with cloud cover less than 50% is 0.315. **(c)** Comment on the suitability of Helen's model. **(d)** Suggest an appropriate refinement to Helen's model.",
      steps: [
        { h: "(a) Cloud cover is in oktas: 0, 1, …, 8", m: "$P(C = c) = \\dfrac{1}{9}$ for $c = 0, 1, 2, \\ldots, 8$", mk: "B1 B1ft", n: "Nine values, so each $\\frac19$. Using 1–8 is the commonest LDS slip." },
        { h: "(b) Less than 50% is less than 4 oktas", m: "$P(C < 4) = P(C = 0, 1, 2, 3) = \\dfrac{4}{9} = 0.444$", mk: "B1" },
        { h: "(c) Compare model and data", m: "The data give 0.315, much lower than the model's 0.444, so the model is **not** a good one.", mk: "B1ft" },
        { h: "(d) A better model", m: "Cloud cover varies with month and location, and high cover is more common, so use a non-uniform distribution with higher probabilities for more cloud — e.g. probabilities from the observed frequencies.", mk: "B1", n: "\"Not uniform\" alone is B0; a continuous model (Normal) is B0 — cloud cover is discrete." }
      ], result: "(a) $\\frac19$ each for 0–8 (b) $\\frac49$ (c) not suitable — 0.315 ≠ 0.444 (d) non-uniform, from the data" } },
    { worked: { tag: "exam", title: "A modelled spinner game — and where the model breaks", src: "A-level June 2023 · P3 Q5 · 8 marks",
      q: "A spinner gives $X$ with values 20, 50, 80, 100 and probabilities $a$, $b$, $c$, $d$. Tisam then stands $x$ cm from a cup and throws a ball; $S$ is the event that she succeeds. Her model assumes $P(S \\mid X = x) = \\frac{k}{x}$, $k$ constant, and that $P(S \\cap \\{X = x\\})$ is the same for every value of $x$. **(a)** Show that $c = \\frac{8}{5}b$. **(b)** Find the probability distribution of $X$. Nav, throwing many times from 100 cm, succeeds 30% of the time. **(c)** State, giving a reason, why Tisam's model is not suitable to describe Nav playing for all values of $X$.",
      steps: [
        { h: "(a) Multiplication rule", m: "$P(S \\cap \\{X = x\\}) = P(S \\mid X = x)\\,P(X = x) = \\dfrac{k}{x}P(X = x)$\nEqual for $x = 50$ and $x = 80$: $\\dfrac{k}{50}b = \\dfrac{k}{80}c \\;\\Rightarrow\\; c = \\dfrac{80}{50}b = \\dfrac{8}{5}b$", mk: "M1 A1*" },
        { h: "(b) The same for all four values", m: "$\\dfrac{a}{20} = \\dfrac{b}{50} = \\dfrac{c}{80} = \\dfrac{d}{100}$, so $a = \\dfrac{2}{5}b$, $d = 2b$", mk: "M1 A1" },
        { h: "Sum to 1", m: "$\\dfrac25 b + b + \\dfrac85 b + 2b = 5b = 1 \\;\\Rightarrow\\; b = \\dfrac15$", mk: "M1 A1" },
        { m: "$P(X = 20) = \\dfrac{2}{25}$, $\\; P(X = 50) = \\dfrac{1}{5}$, $\\; P(X = 80) = \\dfrac{8}{25}$, $\\; P(X = 100) = \\dfrac{2}{5}$", mk: "A1", n: "Each probability is $\\frac{x}{250}$ — proportional to the distance, so that $\\frac{k}{x}P(X = x)$ is constant." },
        { h: "(c) Fit $k$ to Nav", m: "$\\dfrac{k}{100} = 0.3 \\;\\Rightarrow\\; k = 30$; then $P(S \\mid X = 20) = \\dfrac{30}{20} = 1.5 > 1$ — impossible, so the model fails.", mk: "B1" }
      ], result: "(b) $\\frac{2}{25}, \\frac15, \\frac{8}{25}, \\frac25$ (c) $k = 30$ gives a probability of 1.5 at 20 cm" } },
    { worked: { tag: "variation", title: "Is the die fair? Relative frequency against the model", src: "practice variant",
      q: "A die is rolled 300 times and shows a six 72 times. A model assumes the die is fair. Comment on the model, and say what would happen to predictions of \"at least one six in 4 rolls\" if a more realistic probability were used.",
      steps: [
        { h: "Compare", m: "Fair: expected sixes $= 300 \\times \\frac16 = 50$. Observed 72 — relative frequency $0.24$, well above $\\frac16 \\approx 0.167$. The fairness assumption looks doubtful." },
        { h: "Effect of a better estimate", m: "Fair: $1 - \\left(\\frac56\\right)^4 = 0.518$. Using $p = 0.24$: $1 - 0.76^4 = 0.666$. The fair model **underestimates** the chance." }
      ], result: "Probably biased; the fair model underestimates (0.518 against 0.666)" } },
    { worked: { tag: "exam", title: "Use an independence result to judge a belief", src: "AS Specimen · P2 Q4(d) · 1 mark",
      q: "Dawn and Sergei's teacher believes that when Sergei is late for school, Dawn tends to be late too. It has been shown that the events $D$ (Dawn late) and $S$ (Sergei late) are independent. Comment on the teacher's belief.",
      steps: [
        { h: "Translate the belief", m: "\"Dawn tends to be late when Sergei is\" means $P(D \\mid S) > P(D)$ — dependence." },
        { h: "Compare with the result", m: "$D$ and $S$ are independent, so $P(D \\mid S) = P(D)$: the teacher's belief is not supported.", mk: "B1ft" }
      ], result: "Not supported — the events are independent" } },
    { worked: { tag: "exam", title: "A binomial model for dry days — what fails", src: "A-level June 2022 · P3 Q3(d) · 1 mark",
      q: "The proportion of days with no rain at Camborne in 1987 is estimated from the large data set as 0.27. Explain why B(14, 0.27) might not be a reasonable model for the number of days without rain during a 14-day summer event.",
      steps: [
        { h: "Check each binomial condition in context", m: "The probability of a dry day is unlikely to be constant — summer days are drier than the May–October average — and consecutive days are not independent: weather comes in spells.", mk: "B1" }
      ], result: "$p$ not constant (summer is drier); days not independent" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**State an assumption**", "one assumption the model makes, in context"],
      ["**Comment on the suitability** of the model", "a comparison of model and data, and a verdict"],
      ["**Suggest a refinement**", "a specific better model — not just \"a different one\""],
      ["**Explain why the model might not be reasonable**", "a named assumption and why it fails here"],
      ["**Comment on** a belief / claim", "what the result says about it — supported or not"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Context**: every critique mentions the situation (days, students, the spinner).",
      "**A number to compare**: model 0.444 against data 0.315.",
      "**Refinements must still be discrete** for discrete data — no Normal model for oktas.",
      "**Test a model at its extremes**: a probability above 1 or below 0 proves it fails."
    ] },
    { h: "Misconceptions" },
    { ul: [
      "\"A small difference between model and data proves the model wrong\" — small samples vary.",
      "\"Independent means the events are unrelated in real life\" — it is a precise probability statement.",
      "\"Relative frequency is the probability\" — it is an estimate that improves with more trials."
    ] },
    { callout: { t: "mnemonic", h: "\"Fair, Free, Fixed\"", body: "The three assumptions to check: outcomes **fair** (equally likely as claimed), trials **free** of each other (independent), probability **fixed** (constant)." } }
  ],
  flashcards: [
    ["What is a probability model?", "A simplified mathematical description of a real situation, resting on assumptions."],
    ["Three assumptions to critique?", "Fairness/equally likely; independence; constant probability."],
    ["Relative frequency?", "Number of times the event happened ÷ number of trials; an estimate of the probability."],
    ["Expected frequency of an event in $n$ trials?", "$n \\times P(\\text{event})$."],
    ["Cloud cover uniform model: $P(C = c)$?", "$\\frac19$ for $c = 0, 1, \\ldots, 8$."],
    ["Uniform cloud model: $P(\\text{cover} < 50\\%)$?", "$P(C \\le 3) = \\frac49$."],
    ["Why might consecutive LDS days not be independent?", "Weather comes in spells."],
    ["Spinner model $P(X = x) \\propto x$ for 20, 50, 80, 100. $P(X = 100)$?", "$\\frac{100}{250} = \\frac25$."],
    ["How can you prove a probability model fails?", "Show it gives a probability outside $[0, 1]$, or a value that contradicts the data."],
    ["Teacher believes Dawn late when Sergei late; $D$, $S$ independent. Verdict?", "Belief not supported."]
  ],
  quiz: [
    { q: "A die shows 72 sixes in 300 rolls. Relative frequency of a six:", opts: ["0.24", "0.167", "0.72", "0.3"], ans: 0, why: "$72 / 300$." },
    { q: "Expected number of heads in 80 tosses of a fair coin:", opts: ["40", "80", "20", "0.5"], ans: 0, why: "$80 \\times \\frac12$." },
    { q: "B(14, 0.27) for dry days fails mainly because", opts: ["days are not independent", "14 is too small", "0.27 is not a fraction", "rain is continuous"], ans: 0, why: "Weather comes in spells." },
    { q: "A refinement for a uniform model of oktas could be", opts: ["probabilities from observed frequencies", "a Normal model", "uniform on 1–8", "drop the data"], ans: 0, why: "Discrete, non-uniform, data-based." },
    { q: "A model gives $P(S \\mid X = 20) = 1.5$. This shows", opts: ["the model fails", "Tisam always scores", "$k$ is negative", "nothing"], ans: 0, why: "Probabilities cannot exceed 1." }
  ]
};


/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
