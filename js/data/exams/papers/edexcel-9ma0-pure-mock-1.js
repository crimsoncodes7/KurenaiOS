/* Kurenai OS — js/data/exams/papers/edexcel-9ma0-pure-mock-1.js
   Edexcel A-level Mathematics (9MA0), Pure mock: Practice paper 1.

   WRITTEN BY KURENAIOS — NOT A PEARSON PAPER. Original questions in the
   style of an Edexcel Pure paper: 2 hours, 100 marks, calculator allowed,
   16 questions, short to long, each part's marks in brackets, the scheme in
   Edexcel's notation (M1 method, A1 accuracy that needs its M, B1
   independent, dM1 a method that needs the M before it; "*" a given
   answer, cso correct solution only).

   Scope (the December 2026 mock): all of AS Pure — proof, algebra and
   functions, coordinate geometry and circles, the binomial expansion for a
   positive integer power, trigonometry in degrees, exponentials and
   logarithms, differentiation, integration — and these A2 chapters only:
   proof by contradiction, partial fractions, sequences and series
   (geometric, sigma notation, sequences by recurrence, the binomial
   expansion for a rational power), functions (modulus, composite,
   inverse), radians (sectors, small angles), sec/cosec/cot with double
   angles, R cos(θ + α) in a model, and vectors in 3D. About 51 marks AS
   and 49 marks A2 (the cosine rule in Q5 is AS work inside a 3D question).

   Verified by program before it was written (sympy 1.14 and numpy, in a
   scratch script): every root, coefficient and factorisation, the partial
   fractions and their series, the inverse and composite functions, every
   trig equation's solutions in its interval (sympy's solveset and a
   numerical sign-change scan), R and α, the model's maximum and the times
   it reaches 20 m, the vector lengths and angle, the sector's quadratic,
   the small-angle limit, the geometric series' sums either side of 127,
   the tangent and the triangle's area, and both integrals. Each part's
   scheme codes add up to its marks.

   Shape (read by KOS.examPaper's authored papers):
     {id, n, title, board, format: "edexcel", mins, marks, org, context,
      questions: [{n, title, stem, parts: [{label, q, marks, ref, command,
        ms: [lines], guide?, dependsOn?}]}]}                             */
(function () {
  "use strict";
  var X = window.KOS_EXAMS = window.KOS_EXAMS || {};
  var P = X.papers = X.papers || {};
  (P["edexcel-9ma0-pure-mock"] = P["edexcel-9ma0-pure-mock"] || [])[0] = {
    id: "edexcel-9ma0-pure-mock-1", n: 1, title: "Practice paper 1", board: "Edexcel", format: "edexcel", mins: 120, marks: 100,
    org: "", context: "",
    questions: [
      /* 1 · quadratics, the discriminant and inequalities (AS) — 5 */
      { n: 1, title: "Discriminant and inequalities",
        stem: "The equation $kx^2 + 4x + k - 3 = 0$, where $k$ is a constant, has two distinct real roots.",
        parts: [
          { label: "(a)", command: "Show that", ref: "2.3", marks: 2,
            q: "Show that $k^2 - 3k - 4 < 0$",
            ms: ["M1: uses $b^2 - 4ac > 0$ with $a = k$, $b = 4$, $c = k - 3$: $16 - 4k(k - 3) > 0$",
              "A1*: $16 - 4k^2 + 12k > 0 \\Rightarrow k^2 - 3k - 4 < 0$ (cso, the inequality reversed correctly)"],
            guide: "The method mark needs the discriminant with a correct a, b and c and an inequality (or the boundary equation). The given answer must follow with no error in the sign." },
          { label: "(b)", command: "Find", ref: "2.5", marks: 3, dependsOn: "(a)",
            q: "Hence find the set of possible values of $k$.",
            ms: ["M1: solves $k^2 - 3k - 4 = 0$ to find the critical values $k = -1$ and $k = 4$",
              "A1: chooses the inside region, $-1 < k < 4$",
              "B1: excludes $k = 0$ (the equation would be $4x - 3 = 0$, with one root): $\\{k : -1 < k < 0\\} \\cup \\{k : 0 < k < 4\\}$"],
            guide: "Accept \"$-1 < k < 0$ or $0 < k < 4$\". The B1 is for excluding $k = 0$ with or without the reason, and may be given even if the critical values are wrong." }
        ] },
      /* 2 · proof (counter-example AS, contradiction A2) — 4 */
      { n: 2, title: "Proof",
        parts: [
          { label: "(a)", command: "Prove", ref: "1.1", marks: 1,
            q: "Prove, by counter-example, that the statement\n\n\"$2^n + 1$ is a prime number for every positive integer $n$\"\n\nis false.",
            ms: ["B1: a correct counter-example with its working, e.g. $n = 3$: $2^3 + 1 = 9 = 3 \\times 3$, which is not prime"],
            guide: "Any correct counter-example, e.g. $n = 5$ gives $33 = 3 \\times 11$. A value of $n$ with no evidence that the result is not prime scores nothing." },
          { label: "(b)", command: "Prove", ref: "1.1", marks: 3,
            q: "Use proof by contradiction to prove that there are no integers $a$ and $b$ such that\n\n$a^2 - 4b = 2$",
            ms: ["M1: assumes there ARE integers $a$, $b$ with $a^2 - 4b = 2$, so $a^2 = 4b + 2 = 2(2b + 1)$ is even and hence $a$ is even",
              "M1: writes $a = 2m$ and substitutes: $4m^2 - 4b = 2 \\Rightarrow 2m^2 - 2b = 1$ (or $2(m^2 - b) = 1$)",
              "A1: the left side is even and the right side is odd, a contradiction; so there are no integers $a$ and $b$ with $a^2 - 4b = 2$"],
            guide: "The first M1 needs the opening assumption. \"$a^2$ even so $a$ even\" may be stated (an odd number squared is odd). The A1 needs the contradiction and a concluding statement." }
        ] },
      /* 3 · binomial expansion, positive integer power (AS) — 5 */
      { n: 3, title: "Binomial expansion",
        parts: [
          { label: "(a)", command: "Find", ref: "4.1", marks: 3,
            q: "Find the first three terms, in ascending powers of $x$, of the binomial expansion of\n\n$\\left(2 - \\frac{x}{4}\\right)^8$\n\ngiving each term in its simplest form.",
            ms: ["M1: the correct structure for the $x$ or $x^2$ term, e.g. $\\binom{8}{1} 2^7 \\left(-\\frac{x}{4}\\right)$ or $\\binom{8}{2} 2^6 \\left(-\\frac{x}{4}\\right)^2$",
              "B1: the first term $256$",
              "A1: $-256x + 112x^2$"],
            guide: "Answer $256 - 256x + 112x^2$. Allow the terms listed with commas. Taking out $2^8$ first is fine: $256\\left(1 - \\frac{x}{8}\\right)^8$." },
          { label: "(b)", command: "Find", ref: "4.1", marks: 2, dependsOn: "(a)",
            q: "Hence find the coefficient of $x^2$ in the expansion of\n\n$(1 + 3x)\\left(2 - \\frac{x}{4}\\right)^8$",
            ms: ["M1: multiplies the two terms that give $x^2$: $1 \\times 112 + 3 \\times (-256)$",
              "A1: $-656$"],
            guide: "Follow through their coefficients for the M1 only. Accept $-656x^2$." }
        ] },
      /* 4 · polynomials and the factor theorem (AS) — 5 */
      { n: 4, title: "The factor theorem",
        stem: "$\\mathrm{f}(x) = 2x^3 - 5x^2 - 4x + 3$",
        parts: [
          { label: "(a)", command: "Show that", ref: "2.6", marks: 2,
            q: "Use the factor theorem to show that $(x - 3)$ is a factor of $\\mathrm{f}(x)$.",
            ms: ["M1: attempts $\\mathrm{f}(3) = 2(27) - 5(9) - 4(3) + 3$",
              "A1: $\\mathrm{f}(3) = 0$, so $(x - 3)$ is a factor"],
            guide: "The A1 needs $\\mathrm{f}(3) = 0$ AND a conclusion. Long division alone is not the factor theorem and scores nothing here." },
          { label: "(b)", command: "Factorise", ref: "2.6", marks: 3, dependsOn: "(a)",
            q: "Hence factorise $\\mathrm{f}(x)$ completely.",
            ms: ["M1: divides by $(x - 3)$ or compares coefficients to find a quadratic factor $2x^2 + bx + c$",
              "A1: $2x^2 + x - 1$",
              "A1: $(x - 3)(2x - 1)(x + 1)$"],
            guide: "The final A1 needs all three factors on one line. Accept $(x - 3)(1 - 2x)(-x - 1)$ and equivalent sign arrangements." }
        ] },
      /* 5 · vectors in 3D, with the cosine rule (A2, AS trig) — 5 */
      { n: 5, title: "Vectors in three dimensions",
        stem: "Relative to a fixed origin $O$, the points $A$, $B$ and $C$ have coordinates $(1, 2, -1)$, $(3, -1, 5)$ and $(4, 2, -1)$ respectively.",
        parts: [
          { label: "(a)", command: "Find", ref: "10.2", marks: 2,
            q: "Find $|\\overrightarrow{AB}|$.",
            ms: ["M1: $\\overrightarrow{AB} = \\mathbf{b} - \\mathbf{a} = 2\\mathbf{i} - 3\\mathbf{j} + 6\\mathbf{k}$ (either direction) and attempts $\\sqrt{2^2 + 3^2 + 6^2}$",
              "A1: $|\\overrightarrow{AB}| = 7$"] },
          { label: "(b)", command: "Find", ref: "10.4", marks: 3, dependsOn: "(a)",
            q: "Find the size of angle $BAC$, giving your answer in degrees to one decimal place.",
            ms: ["B1: $|\\overrightarrow{AC}| = 3$ and $|\\overrightarrow{BC}| = \\sqrt{46}$",
              "M1: uses the cosine rule with their three lengths: $\\cos BAC = \\frac{7^2 + 3^2 - 46}{2 \\times 7 \\times 3}$",
              "A1: $\\cos BAC = \\frac{2}{7}$, so angle $BAC = 73.4°$"],
            guide: "$\\overrightarrow{AC} = 3\\mathbf{i}$, $\\overrightarrow{BC} = \\mathbf{i} + 3\\mathbf{j} - 6\\mathbf{k}$. Awrt $73.4°$; $1.28$ radians is A0." }
        ] },
      /* 6 · exponentials and logarithms (AS) — 6 */
      { n: 6, title: "Exponentials and logarithms",
        parts: [
          { label: "(a)", command: "Solve", ref: "6.5", marks: 3,
            q: "Solve the equation\n\n$3^{2x} - 4\\left(3^{x + 1}\\right) + 27 = 0$",
            ms: ["M1: writes the equation as a quadratic in $3^x$: $(3^x)^2 - 12(3^x) + 27 = 0$",
              "M1: solves the quadratic: $3^x = 3$ or $3^x = 9$",
              "A1: $x = 1$, $x = 2$"],
            guide: "The first M1 needs $3^{x+1} = 3 \\times 3^x$. Using $y = 3^x$ is the expected method." },
          { label: "(b)", command: "Solve", ref: "6.4", marks: 3,
            q: "Solve the equation\n\n$\\log_3 x + \\log_3 (x - 6) = 3$",
            ms: ["M1: uses the addition law: $\\log_3 x(x - 6) = 3$",
              "M1: removes the logarithm and solves the quadratic: $x^2 - 6x - 27 = 0$, $(x - 9)(x + 3) = 0$",
              "A1: $x = 9$ only, with $x = -3$ rejected"],
            guide: "The A1 needs $-3$ rejected (or never stated as an answer): $\\log_3$ of a negative number is undefined." }
        ] },
      /* 7 · radians: sector and small angles (A2) — 6 */
      { n: 7, title: "Radians, sectors and small angles",
        stem: "The sector $OAB$ of a circle has centre $O$, radius $r$ cm and angle $AOB = \\theta$ radians.\n\nThe perimeter of the sector is 20 cm and its area is 16 cm².",
        parts: [
          { label: "(a)", command: "Show that", ref: "5.1", marks: 2,
            q: "Show that $r^2 - 10r + 16 = 0$",
            ms: ["M1: writes $2r + r\\theta = 20$ and $\\frac{1}{2}r^2\\theta = 16$ and eliminates $\\theta$, e.g. $\\frac{1}{2}r(20 - 2r) = 16$",
              "A1*: $10r - r^2 = 16 \\Rightarrow r^2 - 10r + 16 = 0$ (cso)"] },
          { label: "(b)", command: "Find", ref: "5.1", marks: 2, dependsOn: "(a)",
            q: "Find the value of $r$ and the value of $\\theta$, explaining why one solution of the equation in part (a) must be rejected.",
            ms: ["M1: solves to get $r = 2$ or $r = 8$ and finds $\\theta$ for at least one, using $\\theta = \\frac{20 - 2r}{r}$",
              "A1: $r = 8$, $\\theta = 0.5$; $r = 2$ gives $\\theta = 8 > 2\\pi$, which is impossible for a sector"],
            guide: "The A1 needs a reason for rejecting $r = 2$: $\\theta = 8$ is more than a full turn ($2\\pi \\approx 6.28$)." },
          { label: "(c)", command: "Find", ref: "5.2", marks: 2,
            q: "A different angle, $x$ radians, is small. Use small-angle approximations to find the value of the constant $k$ for which\n\n$\\frac{1 - \\cos 4x}{2x \\sin 3x} \\approx k$",
            ms: ["M1: uses $\\cos 4x \\approx 1 - \\frac{(4x)^2}{2} = 1 - 8x^2$ and $\\sin 3x \\approx 3x$",
              "A1: $\\frac{8x^2}{6x^2}$, so $k = \\frac{4}{3}$"],
            guide: "The M1 needs both approximations with the angle doubled or trebled correctly; $\\cos 4x \\approx 1 - \\frac{4x^2}{2}$ is M0." }
        ] },
      /* 8 · trigonometric identities and equations in degrees (AS) — 6 */
      { n: 8, title: "Trigonometric equations",
        parts: [
          { label: "(a)", command: "Show that", ref: "5.5", marks: 2,
            q: "Show that the equation\n\n$4\\sin^2 x + 8\\cos x - 7 = 0$\n\ncan be written as\n\n$4\\cos^2 x - 8\\cos x + 3 = 0$",
            ms: ["M1: uses $\\sin^2 x = 1 - \\cos^2 x$: $4(1 - \\cos^2 x) + 8\\cos x - 7 = 0$",
              "A1*: $-4\\cos^2 x + 8\\cos x - 3 = 0 \\Rightarrow 4\\cos^2 x - 8\\cos x + 3 = 0$ (cso)"] },
          { label: "(b)", command: "Solve", ref: "5.7", marks: 4, dependsOn: "(a)",
            q: "Hence solve, for $0 \\le \\theta < 360°$,\n\n$4\\sin^2 2\\theta + 8\\cos 2\\theta - 7 = 0$\n\nShow each stage of your working.",
            ms: ["M1: solves the quadratic in $\\cos 2\\theta$: $(2\\cos 2\\theta - 1)(2\\cos 2\\theta - 3) = 0$",
              "A1: $\\cos 2\\theta = \\frac{1}{2}$ (with $\\cos 2\\theta = \\frac{3}{2}$ rejected or ignored)",
              "M1: finds $2\\theta = 60°$ and works in the range $0 \\le 2\\theta < 720°$: $2\\theta = 60°, 300°, 420°, 660°$",
              "A1: $\\theta = 30°, 150°, 210°, 330°$"],
            guide: "The final A1 needs all four and no extras in the range. Solving $\\cos \\theta = \\frac{1}{2}$ instead scores M1 A0 M0 A0 at most." }
        ] },
      /* 9 · a sequence by recurrence, geometric series and sigma notation (A2) — 6 */
      { n: 9, title: "Geometric series",
        stem: "A sequence $u_1, u_2, u_3, \\ldots$ is defined by\n\n$u_{n + 1} = r u_n$\n\nwhere $r$ is a constant with $0 < r < 1$.\n\nGiven that $u_2 = 24$ and $\\sum_{n = 1}^{\\infty} u_n = 128$,",
        parts: [
          { label: "(a)", command: "Show that", ref: "4.5", marks: 3,
            q: "show that $16r^2 - 16r + 3 = 0$",
            ms: ["M1: recognises a geometric series with first term $a = u_1$: $ar = 24$",
              "M1: uses $\\frac{a}{1 - r} = 128$ and eliminates $a$, e.g. $\\frac{24}{r} = 128(1 - r)$",
              "A1*: $128r^2 - 128r + 24 = 0 \\Rightarrow 16r^2 - 16r + 3 = 0$ (cso)"] },
          { label: "(b)", command: "Find", ref: "4.3", marks: 3, dependsOn: "(a)",
            q: "Given also that $r > \\frac{1}{2}$, find the smallest value of $N$ for which\n\n$\\sum_{n = 1}^{N} u_n > 127$",
            ms: ["B1: $r = \\frac{3}{4}$ and $u_1 = 32$",
              "M1: sets up $\\frac{32\\left(1 - 0.75^N\\right)}{1 - 0.75} > 127$ and uses logarithms on $0.75^N < \\frac{1}{128}$: $N > \\frac{\\log(1/128)}{\\log 0.75} = 16.87\\ldots$",
              "A1: $N = 17$"],
            guide: "Check: $S_{16} = 126.72$, $S_{17} = 127.04$. Trial of $S_{16}$ and $S_{17}$ is an acceptable alternative for M1 A1. The A1 needs the inequality the right way round (dividing by $\\log 0.75 < 0$ reverses it)." }
        ] },
      /* 10 · differentiation: stationary points (AS) — 7 */
      { n: 10, title: "Stationary points",
        stem: "The curve $C$ has equation\n\n$y = 2x^3 - 9x^2 + 12x + 1$",
        parts: [
          { label: "(a)", command: "Find", ref: "7.3", marks: 4,
            q: "Find the coordinates of the stationary points of $C$.",
            ms: ["M1: differentiates, at least one power reduced by one",
              "A1: $\\frac{dy}{dx} = 6x^2 - 18x + 12$",
              "M1: sets their $\\frac{dy}{dx} = 0$ and solves the quadratic: $6(x - 1)(x - 2) = 0$",
              "A1: $(1, 6)$ and $(2, 5)$"] },
          { label: "(b)", command: "Determine", ref: "7.3", marks: 2, dependsOn: "(a)",
            q: "Use the second derivative to determine the nature of each stationary point.",
            ms: ["M1: finds $\\frac{d^2y}{dx^2} = 12x - 18$ and substitutes at least one of their $x$ values",
              "A1: at $x = 1$, $\\frac{d^2y}{dx^2} = -6 < 0$, a maximum; at $x = 2$, $\\frac{d^2y}{dx^2} = 6 > 0$, a minimum"] },
          { label: "(c)", command: "State", ref: "7.3", marks: 1, dependsOn: "(a)",
            q: "State the set of values of $x$ for which $y$ is decreasing.",
            ms: ["B1: $1 < x < 2$"],
            guide: "Accept $1 \\le x \\le 2$." }
        ] },
      /* 11 · partial fractions and the binomial expansion for a rational power (A2) — 7 */
      { n: 11, title: "Partial fractions and series",
        stem: "$\\mathrm{f}(x) = \\frac{7x - 2}{(x + 1)(2x - 1)}$",
        parts: [
          { label: "(a)", command: "Express", ref: "2.10", marks: 3,
            q: "Express $\\mathrm{f}(x)$ in partial fractions.",
            ms: ["M1: writes $7x - 2 \\equiv A(2x - 1) + B(x + 1)$ and substitutes values or compares coefficients",
              "A1: one of $A = 3$ or $B = 1$",
              "A1: $\\mathrm{f}(x) = \\frac{3}{x + 1} + \\frac{1}{2x - 1}$"] },
          { label: "(b)", command: "Find", ref: "4.1", marks: 3, dependsOn: "(a)",
            q: "Hence, or otherwise, find the series expansion of $\\mathrm{f}(x)$, in ascending powers of $x$, up to and including the term in $x^2$. Simplify each term.",
            ms: ["M1: expands $(1 + x)^{-1}$ or $(1 - 2x)^{-1}$ to the term in $x^2$ with the correct structure, e.g. $1 - x + x^2$ or $1 + 2x + 4x^2$",
              "M1: writes $\\frac{1}{2x - 1} = -(1 - 2x)^{-1}$ and combines: $3(1 - x + x^2) - (1 + 2x + 4x^2)$",
              "A1: $2 - 5x - x^2$"],
            guide: "Expanding $(7x - 2)(1 + x)^{-1}(2x - 1)^{-1}$ directly is acceptable. Check: $\\mathrm{f}(0) = 2$." },
          { label: "(c)", command: "State", ref: "4.1", marks: 1, dependsOn: "(b)",
            q: "State the range of values of $x$ for which your expansion is valid.",
            ms: ["B1: $|x| < \\frac{1}{2}$"],
            guide: "Accept $-\\frac{1}{2} < x < \\frac{1}{2}$." }
        ] },
      /* 12 · reciprocal trig functions and double angles (A2) — 6 */
      { n: 12, title: "Trigonometric identities",
        parts: [
          { label: "(a)", command: "Prove", ref: "5.6", marks: 2,
            q: "Prove that\n\n$\\frac{1 + \\cos 2\\theta}{\\sin 2\\theta} \\equiv \\cot \\theta, \\quad \\theta \\ne 90n°, \\; n \\in \\mathbb{Z}$",
            ms: ["M1: uses $\\cos 2\\theta = 2\\cos^2\\theta - 1$ and $\\sin 2\\theta = 2\\sin\\theta\\cos\\theta$",
              "A1*: $\\frac{2\\cos^2\\theta}{2\\sin\\theta\\cos\\theta} = \\frac{\\cos\\theta}{\\sin\\theta} = \\cot\\theta$ (cso)"] },
          { label: "(b)", command: "Solve", ref: "5.4", marks: 4, dependsOn: "(a)",
            q: "Hence solve, for $0 < \\theta < 360°$,\n\n$\\frac{1 + \\cos 2\\theta}{\\sin 2\\theta} = 2\\,\\text{cosec}^2\\theta - 3$\n\ngiving your answers to one decimal place where appropriate.",
            ms: ["M1: uses part (a) and $\\text{cosec}^2\\theta = 1 + \\cot^2\\theta$ to form a quadratic in $\\cot\\theta$",
              "A1: $2\\cot^2\\theta - \\cot\\theta - 1 = 0$, so $(2\\cot\\theta + 1)(\\cot\\theta - 1) = 0$, $\\cot\\theta = 1$ or $\\cot\\theta = -\\frac{1}{2}$",
              "M1: solves $\\tan\\theta = 1$ or $\\tan\\theta = -2$ for $\\theta$ in the range",
              "A1: $\\theta = 45°, 116.6°, 225°, 296.6°$"],
            guide: "The final A1 needs all four answers and no extras. Working with $\\sin$ and $\\cos$ throughout is fine." }
        ] },
      /* 13 · functions: modulus, inverse, composite (A2) — 7 */
      { n: 13, title: "Functions",
        stem: "The functions f and g are defined by\n\n$\\mathrm{f}(x) = 2|x + 1| - 4, \\quad x \\in \\mathbb{R}$\n\n$\\mathrm{g}(x) = \\mathrm{e}^x + 2, \\quad x \\in \\mathbb{R}$",
        parts: [
          { label: "(a)", command: "Solve", ref: "2.7", marks: 3,
            q: "Solve the equation\n\n$\\mathrm{f}(x) = \\frac{1}{2}x$",
            ms: ["M1: solves $2(x + 1) - 4 = \\frac{1}{2}x$ to get $x = \\frac{4}{3}$",
              "M1: solves $-2(x + 1) - 4 = \\frac{1}{2}x$",
              "A1: $x = \\frac{4}{3}$ and $x = -\\frac{12}{5}$ only"],
            guide: "A sketch of $y = \\mathrm{f}(x)$ (a V with vertex $(-1, -4)$) and $y = \\frac{1}{2}x$ shows the line meets both branches. Squaring both sides of $2|x + 1| = \\frac{1}{2}x + 4$ is a valid alternative." },
          { label: "(b)", command: "Find", ref: "2.8", marks: 2,
            q: "Find $\\mathrm{g}^{-1}(x)$, stating its domain.",
            ms: ["M1: sets $y = \\mathrm{e}^x + 2$ and changes the subject: $x = \\ln(y - 2)$",
              "A1: $\\mathrm{g}^{-1}(x) = \\ln(x - 2)$, $x > 2$"] },
          { label: "(c)", command: "Solve", ref: "2.8", marks: 2,
            q: "Find $\\mathrm{fg}(x)$ in its simplest form and hence solve $\\mathrm{fg}(x) = 8$, giving your answer in exact form.",
            ms: ["M1: $\\mathrm{fg}(x) = 2|\\mathrm{e}^x + 3| - 4 = 2\\mathrm{e}^x + 2$ (the modulus removed because $\\mathrm{e}^x + 3 > 0$), and sets it equal to 8",
              "A1: $\\mathrm{e}^x = 3$, so $x = \\ln 3$"],
            guide: "Accept fg written with the modulus, then solved correctly, for M1. Decimal $1.0986\\ldots$ alone is A0." }
        ] },
      /* 14 · circles and straight lines (AS) — 8 */
      { n: 14, title: "Circles",
        stem: "The circle $C$ has equation\n\n$x^2 + y^2 - 6x + 4y - 12 = 0$",
        parts: [
          { label: "(a)", command: "Find", ref: "3.2", marks: 3,
            q: "Find\n\n(i) the coordinates of the centre of $C$,\n\n(ii) the radius of $C$.",
            ms: ["M1: completes the square: $(x - 3)^2 + (y + 2)^2 = 25$",
              "A1: centre $(3, -2)$",
              "A1: radius $5$"] },
          { label: "(b)", command: "Find", ref: "3.2", marks: 3, dependsOn: "(a)",
            q: "The point $P(7, 1)$ lies on $C$.\n\nFind an equation of the tangent to $C$ at $P$, giving your answer in the form $ax + by + c = 0$, where $a$, $b$ and $c$ are integers.",
            ms: ["M1: finds the gradient of the radius from the centre to $P$: $\\frac{1 - (-2)}{7 - 3} = \\frac{3}{4}$",
              "M1: uses the perpendicular gradient $-\\frac{4}{3}$ with $(7, 1)$: $y - 1 = -\\frac{4}{3}(x - 7)$",
              "A1: $4x + 3y - 31 = 0$"],
            guide: "Accept any integer multiple of $4x + 3y - 31 = 0$." },
          { label: "(c)", command: "Find", ref: "3.1", marks: 2, dependsOn: "(b)",
            q: "The tangent meets the $x$-axis at the point $Q$. The centre of $C$ is the point $M$.\n\nFind the exact area of triangle $MPQ$.",
            ms: ["M1: finds $Q\\left(\\frac{31}{4}, 0\\right)$ and uses a correct method for the area, e.g. $\\frac{1}{2} \\times MP \\times PQ$ with the right angle at $P$, $PQ = \\frac{5}{4}$",
              "A1: $\\frac{25}{8}$"],
            guide: "The shoelace formula with $M(3, -2)$, $P(7, 1)$, $Q\\left(\\frac{31}{4}, 0\\right)$ gives the same. Accept $3.125$ as exact." }
        ] },
      /* 15 · integration and the area between a curve and a line (AS) — 8 */
      { n: 15, title: "Integration",
        parts: [
          { label: "(a)", command: "Find", ref: "8.2", marks: 3,
            q: "Find\n\n$\\int \\left(3\\sqrt{x} - \\frac{4}{x^2}\\right) dx$\n\ngiving each term in its simplest form.",
            ms: ["M1: raises at least one power by one: $x^{\\frac{1}{2}} \\to x^{\\frac{3}{2}}$ or $x^{-2} \\to x^{-1}$",
              "A1: $2x^{\\frac{3}{2}}$",
              "A1: $+ 4x^{-1} + c$ (or $+\\frac{4}{x} + c$)"],
            guide: "The final A1 needs the constant of integration." },
          { label: "(b)", command: "Find", ref: "8.3", marks: 5,
            q: "The finite region $R$ is bounded by the curve with equation $y = 4x - x^2$ and the line with equation $y = x$.\n\nUse algebraic integration to find the exact area of $R$.",
            ms: ["B1: the curve and the line meet where $x = 0$ and $x = 3$",
              "M1: integrates the curve or the difference: $\\int (4x - x^2)\\,dx = 2x^2 - \\frac{1}{3}x^3$ or $\\int (3x - x^2)\\,dx = \\frac{3}{2}x^2 - \\frac{1}{3}x^3$",
              "M1: a correct strategy for the area: curve minus line, or the area under the curve (9) minus the triangle ($\\frac{9}{2}$)",
              "dM1: applies their limits 0 and 3 to their integral",
              "A1: area of $R = \\frac{9}{2}$"],
            guide: "Area under the curve from 0 to 3 is 9; the triangle under the line is $\\frac{9}{2}$. A calculator's answer with no algebraic integration scores B1 only." }
        ] },
      /* 16 · R cos(x + α) in a model (A2) — 9 */
      { n: 16, title: "A tide model",
        parts: [
          { label: "(a)", command: "Express", ref: "5.6", marks: 3,
            q: "Express $5\\cos x - 12\\sin x$ in the form $R\\cos(x + \\alpha)$, where $R > 0$ and $0 < \\alpha < \\frac{\\pi}{2}$.\n\nGive the exact value of $R$ and the value of $\\alpha$, in radians, to 3 decimal places.",
            ms: ["B1: $R = 13$",
              "M1: $\\tan\\alpha = \\frac{12}{5}$ (or $\\cos\\alpha = \\frac{5}{13}$, $\\sin\\alpha = \\frac{12}{13}$)",
              "A1: $\\alpha = 1.176$"],
            guide: "Degrees ($67.4°$) is A0. $\\tan\\alpha = \\frac{5}{12}$ is M0." },
          { label: "(b)", command: "Find", ref: "5.9", marks: 3, dependsOn: "(a)",
            q: "The depth of water, $D$ metres, at the entrance to a harbour is modelled by the equation\n\n$D = 16 + 5\\cos(0.5t) - 12\\sin(0.5t), \\quad 0 \\le t \\le 12$\n\nwhere $t$ is the number of hours after midnight.\n\nUsing your answer to part (a), find the maximum depth of water predicted by the model and the value of $t$, to 2 decimal places, at which it occurs.",
            ms: ["B1: maximum depth $16 + 13 = 29$ m",
              "M1: sets $0.5t + 1.176 = 2\\pi$",
              "A1: $t = 10.21$"],
            guide: "$t = 2(2\\pi - \\alpha) = 10.214\\ldots$; using $\\alpha = 1.176$ gives $10.214\\ldots$ too. $0.5t + \\alpha = 0$ gives a negative $t$, outside the model." },
          { label: "(c)", command: "Find", ref: "5.9", marks: 3, dependsOn: "(a)",
            q: "Find the values of $t$ for which the model predicts a depth of 20 metres.",
            ms: ["M1: $13\\cos(0.5t + \\alpha) = 4$, so $0.5t + \\alpha = \\arccos\\frac{4}{13} = 1.258\\ldots$",
              "dM1: finds a second angle in the range $\\alpha \\le 0.5t + \\alpha \\le 6 + \\alpha$: $2\\pi - 1.258 = 5.025\\ldots$, and solves for $t$",
              "A1: $t = 0.16$ and $t = 7.70$ only"],
            guide: "$t = 0.164\\ldots$ and $7.698\\ldots$; awrt 0.16 and 7.70. The next solution, $t = 12.73$, is outside $0 \\le t \\le 12$ and must not be given for the A1." }
        ] }
    ]
  };
})();
