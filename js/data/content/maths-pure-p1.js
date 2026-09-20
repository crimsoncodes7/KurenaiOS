/* Kurenai OS — deep content: Pure Mathematics, section P1 (Proof)
   at full A-level depth. Same contract as maths-pure-p4.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* =====================================================================
   1.1  Methods of proof
   ===================================================================== */
C["maths:1.1"] = {
  notes: [
    { h: "What a proof is" },
    { callout: { t: "def", h: "Proof", body: [
      "A proof is a chain of logical steps from **given assumptions** (the definitions and facts you may use) to the **conclusion**, each step justified, that establishes the result for **every** case it claims.",
      "Testing examples is not a proof — however many you try. One example *is* enough to disprove a general claim (a counter-example)."
    ] } },
    { table: { head: ["Method", "When it fits", "Shape of the argument", "Typical marks"], rows: [
      ["Deduction", "\"Prove that … for all $n$\" — algebra does the work", "Let $n = 2k$ / $2k + 1$ (or a general form); expand; factorise; conclude", "4"],
      ["Exhaustion", "A finite list of cases: primes between 3 and 25, $n \\le 4$, remainders mod 5", "Check every case explicitly; state that the cases cover everything", "2–4"],
      ["Counter-example", "\"Show the statement is false\" / \"sometimes true\"", "One specific value that breaks it, with the arithmetic shown", "1–2"],
      ["Contradiction", "\"Prove by contradiction\"; irrationality; \"there are no integers such that…\"", "Assume the negation; deduce something impossible; conclude the original", "3–6"]
    ] } },
    { h: "Notation and vocabulary" },
    { kv: [
      ["$\\mathbb{N}$, $\\mathbb{Z}$, $\\mathbb{Q}$, $\\mathbb{R}$", "natural numbers $1, 2, 3, \\ldots$; integers; rationals ($\\frac{p}{q}$, $p, q$ integers, $q \\ne 0$); reals"],
      ["$\\Rightarrow$, $\\Leftarrow$, $\\iff$", "\"implies\", \"is implied by\", \"if and only if\". $x = 2 \\Rightarrow x^2 = 4$ is true; the reverse is false"],
      ["$\\forall$, $\\exists$", "\"for all\", \"there exists\". A statement with $\\forall$ needs a proof; one with $\\exists$ needs an example"],
      ["Even / odd", "$2k$ / $2k + 1$ for some integer $k$. Two *different* numbers need *different* letters ($2m$, $2n$)"],
      ["Multiple of $a$", "$ak$, $k \\in \\mathbb{Z}$. \"Divisible by 8\" = a multiple of 8"],
      ["Prime", "an integer $> 1$ whose only positive factors are 1 and itself. 1 is not prime; 2 is the only even prime"],
      ["Rational / irrational", "can / cannot be written $\\frac{p}{q}$ with integers $p$, $q$ and no common factor"],
      ["Always / sometimes / never true", "prove it / give a case that works and one that fails / prove the negation"]
    ] },
    { callout: { t: "tip", h: "How the marks are given", body: [
      "Proof questions are marked on **structure**: a correct general form (M1), correct algebra (A1), a conclusion that refers back to the claim (A1). A proof that stops at the expanded expression without the words \"which is even, so…\" loses the last mark every time.",
      "\"Prove, using algebra\" forbids checking values. \"Show by means of a counter-example\" wants one value and its arithmetic. \"Fully justify\" wants both the example and the reason."
    ] } },

    { page: "Proof by deduction" },
    { p: "Deduction is direct proof: start from the general case and manipulate. The standard tools:" },
    { kv: [
      ["Parity", "Any integer is $2k$ or $2k + 1$. Odd $\\times$ odd is odd; anything $\\times$ even is even; $n(n + 1)$ is always even (consecutive integers)."],
      ["Consecutive integers", "$n$, $n + 1$, $n + 2$: among any two consecutive integers one is even; among any three, one is a multiple of 3."],
      ["Completing the square", "$x^2 - 8x + 17 = (x - 4)^2 + 1 \\ge 1 > 0$: a square is never negative."],
      ["Remainders (mod $m$)", "Every integer is $mk + r$ with $r \\in \\{0, 1, \\ldots, m - 1\\}$ — then it is exhaustion over $r$."],
      ["Factorise, don't expand", "$n^3 - n = n(n - 1)(n + 1)$ says far more than $n^3 - n$."]
    ] },
    { worked: { tag: "exam", title: "Positive for all real $x$ — complete the square", src: "AS June 2018 · P1 Q2(i) · 3 marks",
      q: "Show that $x^2 - 8x + 17 > 0$ for all real values of $x$.",
      steps: [
        { m: "$x^2 - 8x + 17 = (x - 4)^2 - 16 + 17 = (x - 4)^2 + 1$", mk: "M1 A1", n: "Half the coefficient of $x$, square it, correct." },
        { m: "$(x - 4)^2 \\ge 0$ for all real $x$, so $(x - 4)^2 + 1 \\ge 1 > 0$.", mk: "A1", n: "The A1 is for the *reason*: a square is non-negative, and the $+1$ makes it strictly positive. (Alternative: discriminant $64 - 68 < 0$ and the coefficient of $x^2$ is positive, so the curve never meets the axis and is above it.)" }
      ], result: "$(x - 4)^2 + 1 \\ge 1 > 0$" } },
    { worked: { tag: "exam", title: "Product of three consecutive integers — divisible by 6", src: "AS June 2022 · P1 Q14(ii) · 3 marks",
      q: "Prove that for all positive integers $n$, $n^3 + 3n^2 + 2n$ is divisible by 6.",
      steps: [
        { h: "Factorise", m: "$n^3 + 3n^2 + 2n = n(n^2 + 3n + 2) = n(n + 1)(n + 2)$", mk: "M1 A1", n: "The product of three consecutive integers." },
        { h: "Reason", m: "Of any two consecutive integers one is even, so the product is divisible by 2. Of any three consecutive integers one is a multiple of 3, so the product is divisible by 3. Hence divisible by $2 \\times 3 = 6$.", mk: "A1", n: "Both facts stated. \"Divisible by 2 and by 3 so by 6\" needs the coprimality — 2 and 3 share no factor — which examiners accept as understood." }
      ], result: "$n(n + 1)(n + 2)$: divisible by 2 and by 3" } },
    { worked: { tag: "exam", title: "$(n + 1)^3 - n^3$ is odd", src: "A-level June 2023 · P1 Q14 · 4 marks",
      q: "Prove, using algebra, that $(n + 1)^3 - n^3$ is odd for all $n \\in \\mathbb{N}$.",
      steps: [
        { h: "Expand", m: "$(n + 1)^3 - n^3 = n^3 + 3n^2 + 3n + 1 - n^3 = 3n^2 + 3n + 1$", mk: "M1 A1", n: "Binomial expansion of $(n + 1)^3$; the cubes cancel." },
        { h: "Factorise the even part", m: "$= 3n(n + 1) + 1$", mk: "M1", n: "$n(n + 1)$ is a product of consecutive integers, so even; say $n(n + 1) = 2k$." },
        { m: "$= 6k + 1 = 2(3k) + 1$, which is odd for all $n \\in \\mathbb{N}$.", mk: "A1", n: "Alternative: cases $n = 2m$ and $n = 2m + 1$ separately, each giving an even number plus 1. Either route; the conclusion sentence is required." }
      ], result: "$3n(n + 1) + 1$ = even + 1 = odd" } },
    { worked: { tag: "exam", title: "$n(n^2 + 5)$ is even — parity cases", src: "A-level June 2022 · P2 Q11 · 4 marks",
      q: "Prove, using algebra, that $n(n^2 + 5)$ is even for all $n \\in \\mathbb{N}$.",
      steps: [
        { h: "Case 1: $n$ even", m: "$n = 2k$: $n(n^2 + 5) = 2k(4k^2 + 5) = 2(4k^3 + 5k)$, even.", mk: "M1 A1", n: "An even factor makes the product even — but show the factor 2 pulled out." },
        { h: "Case 2: $n$ odd", m: "$n = 2k + 1$: $n^2 + 5 = 4k^2 + 4k + 1 + 5 = 4k^2 + 4k + 6 = 2(2k^2 + 2k + 3)$, even; so $n(n^2 + 5) = (2k + 1)\\cdot 2(2k^2 + 2k + 3)$ is even.", mk: "M1 A1", n: "Both cases, then: \"every $n$ is even or odd, so $n(n^2 + 5)$ is even for all $n$.\" Alternative in one line: $n(n^2 + 5) = n(n^2 - 1) + 6n = (n - 1)n(n + 1) + 6n$, both terms even." }
      ], result: "Even in both cases" } },
    { worked: { tag: "exam", title: "$n^2 + 5n$ is even", src: "AS June 2024 · P1 Q14 · 4 marks",
      q: "Prove, using algebra, that $n^2 + 5n$ is even for all $n \\in \\mathbb{N}$.",
      steps: [
        { m: "$n = 2k$: $4k^2 + 10k = 2(2k^2 + 5k)$, even.\n$n = 2k + 1$: $4k^2 + 4k + 1 + 10k + 5 = 4k^2 + 14k + 6 = 2(2k^2 + 7k + 3)$, even.", mk: "M1 A1 M1 A1", n: "Or: $n^2 + 5n = n(n + 5)$; if $n$ is even the product is even; if $n$ is odd then $n + 5$ is even. Conclude for all $n$." }
      ], result: "Even in both cases" } },
    { worked: { tag: "exam", title: "Cube minus square of an odd number is even", src: "AS Specimen · P1 Q6(ii) · 4 marks",
      q: "Prove that the difference between the cube and the square of an odd number is even.",
      steps: [
        { m: "Odd number $n = 2k + 1$: $n^3 - n^2 = n^2(n - 1) = (2k + 1)^2(2k)$", mk: "M1 A1", n: "Factorise before expanding — $n - 1 = 2k$ is the even factor." },
        { m: "$= 2k(2k + 1)^2$, a multiple of 2, so even.", mk: "A1 A1", n: "Full expansion $8k^3 + 8k^2 + 2k = 2(4k^3 + 4k^2 + k)$ is equally fine." }
      ], result: "$2k(2k + 1)^2$" } },
    { worked: { tag: "exam", title: "$n^3 - n$ is a multiple of 4 for odd $n$", src: "AS Nov 2021 · P1 Q10(a) · 4 marks",
      q: "Prove, using algebra, that \"$n^3 - n$ is a multiple of 4\" is true for all odd numbers $n$.",
      steps: [
        { m: "$n^3 - n = n(n - 1)(n + 1)$; with $n = 2k + 1$: $(2k + 1)(2k)(2k + 2) = 4k(k + 1)(2k + 1)$", mk: "M1 A1 M1", n: "$2k \\times 2(k + 1) = 4k(k + 1)$." },
        { m: "$= 4 \\times [k(k + 1)(2k + 1)]$, a multiple of 4 for every integer $k$, hence for every odd $n$.", mk: "A1", n: "In fact a multiple of 8, since $k(k + 1)$ is even — not needed." }
      ], result: "$4k(k + 1)(2k + 1)$" } },
    { worked: { tag: "exam", title: "$n^2 + 2$ is never divisible by 4", src: "A-level June 2019 · P1 Q10(i) · 4 marks",
      q: "Prove that for all $n \\in \\mathbb{N}$, $n^2 + 2$ is not divisible by 4.",
      steps: [
        { h: "Even", m: "$n = 2k$: $n^2 + 2 = 4k^2 + 2 = 4(k^2) + 2$ — leaves remainder 2 on division by 4.", mk: "M1 A1", n: "Write it as $4(k^2) + 2$: a multiple of 4 plus 2." },
        { h: "Odd", m: "$n = 2k + 1$: $n^2 + 2 = 4k^2 + 4k + 3 = 4(k^2 + k) + 3$ — remainder 3.", mk: "M1 A1", n: "Both cases covered; neither remainder is 0, so $n^2 + 2$ is never a multiple of 4." }
      ], result: "Remainder 2 or 3 mod 4" } },
    { worked: { tag: "exam", title: "$n^3 + 2$ is not divisible by 8", src: "AS June 2019 · P1 Q15 · 4 marks",
      q: "Given $n \\in \\mathbb{N}$, prove that $n^3 + 2$ is not divisible by 8.",
      steps: [
        { m: "$n = 2k$: $8k^3 + 2$ — a multiple of 8 plus 2.\n$n = 2k + 1$: $8k^3 + 12k^2 + 6k + 1 + 2 = 2(4k^3 + 6k^2 + 3k + 1) + 1$ — odd, so not a multiple of 8.", mk: "M1 A1 M1 A1", n: "The even case leaves remainder 2; the odd case is odd. Conclude." }
      ], result: "Never a multiple of 8" } },
    { worked: { tag: "exam", title: "Consecutive even integers: $q^3 - p^3$ is a multiple of 8", src: "AS June 2023 · P1 Q17(b) · 4 marks",
      q: "$p$ and $q$ are positive integers with $q > p$. Prove that when $p$ and $q$ are consecutive even integers, $q^3 - p^3$ is a multiple of 8.",
      steps: [
        { m: "$p = 2k$, $q = 2k + 2$", mk: "B1", n: "Consecutive evens differ by 2; same $k$ because they are related." },
        { m: "$q^3 - p^3 = (2k + 2)^3 - (2k)^3 = 8(k + 1)^3 - 8k^3 = 8\\left[(k + 1)^3 - k^3\\right]$", mk: "M1 A1", n: "Pull the 8 out of each cube rather than expanding everything." },
        { m: "$= 8(3k^2 + 3k + 1)$, a multiple of 8.", mk: "A1" }
      ], result: "$8(3k^2 + 3k + 1)$" } },
    { worked: { tag: "exam", title: "Inequality by deduction: $\\frac{4a}{b} + \\frac{b}{a} \\ge 4$", src: "AS June 2020 · P1 Q13(a) · 4 marks",
      q: "Prove that for all positive values of $a$ and $b$, $\\frac{4a}{b} + \\frac{b}{a} \\ge 4$.",
      steps: [
        { h: "Start from a true statement", m: "$(2a - b)^2 \\ge 0 \\Rightarrow 4a^2 - 4ab + b^2 \\ge 0 \\Rightarrow 4a^2 + b^2 \\ge 4ab$", mk: "M1 A1", n: "Work backwards on scrap paper: the target times $ab$ is $4a^2 + b^2 \\ge 4ab$, which is a perfect square. Then write it forwards." },
        { m: "Divide by $ab > 0$ (inequality preserved): $\\dfrac{4a}{b} + \\dfrac{b}{a} \\ge 4$.", mk: "M1 A1", n: "Say why the division is legal — $a, b > 0$. That is exactly where the proof fails for negative values (part (b), next page)." }
      ], result: "From $(2a - b)^2 \\ge 0$" } },
    { worked: { tag: "exam", title: "Inequality with a sign flip: show $y > 4x$", src: "A-level June 2022 · P1 Q7(ii) · 2 marks",
      q: "$x$, $y$ are integers with $x < 0$ and $(x + y)^2 < 9x^2 + y^2$. Show that $y > 4x$.",
      steps: [
        { m: "$x^2 + 2xy + y^2 < 9x^2 + y^2 \\Rightarrow 2xy < 8x^2$", mk: "M1" },
        { m: "Divide by $2x$, which is **negative**, so the inequality reverses: $y > 4x$.", mk: "A1", n: "The whole mark is the sign flip and the reason for it." }
      ], result: "$y > 4x$" } },

    { page: "Proof by exhaustion" },
    { p: "When the claim covers a **finite** set of cases, check them all. The two marks are: every case done, and a statement that the cases are all of them." },
    { worked: { tag: "exam", title: "$(n + 1)^3 > 3^n$ for $n \\le 4$", src: "A-level Oct 2021 · P1 Q15(i) · 2 marks",
      q: "Use proof by exhaustion to show that for $n \\in \\mathbb{N}$, $n \\le 4$: $(n + 1)^3 > 3^n$.",
      steps: [
        { m: "$n = 1$: $8 > 3$ ✓ $\\quad n = 2$: $27 > 9$ ✓ $\\quad n = 3$: $64 > 27$ ✓ $\\quad n = 4$: $125 > 81$ ✓", mk: "M1", n: "$\\mathbb{N}$ starts at 1 here. All four cases with both values shown." },
        { m: "These are all the natural numbers $\\le 4$, so the statement holds.", mk: "A1", n: "The closing sentence is the second mark." }
      ], result: "True for $n = 1, 2, 3, 4$" } },
    { worked: { tag: "example", title: "The specification's own example: primes $3 < p < 25$", src: "Edexcel specification · 1.1 guidance",
      q: "Given that $p$ is a prime with $3 < p < 25$, prove by exhaustion that $(p - 1)(p + 1)$ is a multiple of 12.",
      steps: [
        { m: "Primes in range: $5, 7, 11, 13, 17, 19, 23$.", n: "List the finite set first." },
        { m: "$4 \\cdot 6 = 24$; $6 \\cdot 8 = 48$; $10 \\cdot 12 = 120$; $12 \\cdot 14 = 168$; $16 \\cdot 18 = 288$; $18 \\cdot 20 = 360$; $22 \\cdot 24 = 528$", n: "$24 = 12 \\cdot 2$, $48 = 12 \\cdot 4$, $120 = 12 \\cdot 10$, $168 = 12 \\cdot 14$, $288 = 12 \\cdot 24$, $360 = 12 \\cdot 30$, $528 = 12 \\cdot 44$." },
        { m: "Every prime in the range gives a multiple of 12, so the statement is proved.", n: "(Why it is true in general: $p$ is odd so $p \\pm 1$ are consecutive evens, giving a factor 8; one of $p - 1, p, p + 1$ is a multiple of 3 and it is not $p$. That is a deduction proof — not asked here.)" }
      ], result: "All seven cases are multiples of 12" } },
    { worked: { tag: "exam", title: "Squares are $3k$ or $3k + 1$ — exhaustion over remainders", src: "A-level Oct 2020 · P2 Q16 · 4 marks",
      q: "Use algebra to prove that the square of any natural number is either a multiple of 3 or one more than a multiple of 3.",
      steps: [
        { h: "Every natural number is $3k$, $3k + 1$ or $3k + 2$", m: "$(3k)^2 = 9k^2 = 3(3k^2)$ — a multiple of 3", mk: "M1 A1", n: "State the three forms first: this is what makes it exhaustive." },
        { m: "$(3k + 1)^2 = 9k^2 + 6k + 1 = 3(3k^2 + 2k) + 1$ — one more than a multiple of 3", mk: "A1" },
        { m: "$(3k + 2)^2 = 9k^2 + 12k + 4 = 3(3k^2 + 4k + 1) + 1$ — one more than a multiple of 3\nThese three forms cover every natural number, so the result holds.", mk: "A1", n: "The $+4$ splits as $3 + 1$. Conclusion sentence required." }
      ], result: "$3k^2$, $3(\\ldots) + 1$, $3(\\ldots) + 1$" } },
    { worked: { tag: "exam", title: "Correct an error and complete a mod-5 proof", src: "A-level June 2025 · P1 Q8 · 5 marks",
      q: "A student proves that the square of any number is of the form $5n$ or $5n \\pm 1$. Their work: $m = 5k$: $m^2 = 25k^2 = 5(5k^2)$. $m = 5k + 1$: $m^2 = 25k^2 + 10k + 1 = 5(5k^2 + 2k) + 1$. $m = 5k + 2$: $m^2 = 25k^2 + 10k + 4 = 5(5k^2 + 2k + 1) - 1$. **(a)** Identify and correct an algebraic error. **(b)** Show the calculations and statements required to complete the proof.",
      steps: [
        { h: "(a)", m: "$(5k + 2)^2 = 25k^2 + 20k + 4$, not $10k$. Correct: $25k^2 + 20k + 4 = 5(5k^2 + 4k + 1) - 1$.", mk: "B1", n: "$2 \\times 5k \\times 2 = 20k$." },
        { h: "(b) Remaining cases", m: "$m = 5k + 3$: $m^2 = 25k^2 + 30k + 9 = 5(5k^2 + 6k + 2) - 1$\n$m = 5k + 4$: $m^2 = 25k^2 + 40k + 16 = 5(5k^2 + 8k + 3) + 1$", mk: "M1 A1 A1", n: "$9 = 10 - 1$; $16 = 15 + 1$." },
        { m: "Every integer is one of $5k, 5k + 1, 5k + 2, 5k + 3, 5k + 4$, so every square is $5n$, $5n + 1$ or $5n - 1$.", mk: "A1", n: "The statement that the five cases are exhaustive is a mark on its own." }
      ], result: "Cases $5k + 3$, $5k + 4$ and the closing statement" } },

    { page: "Disproof by counter-example" },
    { callout: { t: "key", h: "One case is enough", body: [
      "To show \"for all $x$, $P(x)$\" is false you need **one** $x$ with $P(x)$ false — and you must **show the arithmetic**, not just name the number.",
      "Choose the simplest value that works and check it on paper before writing. Typical breakers: $0$, $1$, negatives, non-integers, $\\sqrt2$, equal values ($a = b$)."
    ] } },
    { worked: { tag: "exam", title: "$n^2 - n - 1$ is prime for $3 \\le n \\le 10$?", src: "AS Specimen · P1 Q6(i) · 2 marks",
      q: "Use a counter-example to show that \"$n^2 - n - 1$ is a prime number for $3 \\le n \\le 10$\" is false.",
      steps: [
        { m: "$n = 8$: $64 - 8 - 1 = 55 = 5 \\times 11$, not prime.", mk: "M1 A1", n: "Show the factorisation. ($n = 3, 4, 5, 6, 7$ give $5, 11, 19, 29, 41$ — all prime — so the first failure is $n = 8$.)" }
      ], result: "$n = 8$ gives 55" } },
    { worked: { tag: "exam", title: "Product of two irrationals can be rational", src: "A-level June 2018 · P2 Q3(a) · 2 marks",
      q: "\"If $m$ and $n$ are irrational numbers, $m \\ne n$, then $mn$ is also irrational.\" Disprove this by a counter-example.",
      steps: [
        { m: "$m = \\sqrt2$, $n = \\sqrt8$ (both irrational, unequal): $mn = \\sqrt{16} = 4$, rational.", mk: "M1 A1", n: "Or $m = \\sqrt2$, $n = \\frac{1}{\\sqrt2}$, product 1. Note $m = n = \\sqrt2$ is *not* allowed by the question." }
      ], result: "$\\sqrt2 \\times \\sqrt8 = 4$" } },
    { worked: { tag: "exam", title: "Negative values break $\\frac{4a}{b} + \\frac{b}{a} \\ge 4$", src: "AS June 2020 · P1 Q13(b) · 1 mark",
      q: "Prove, by counter-example, that $\\frac{4a}{b} + \\frac{b}{a} \\ge 4$ is not true for all values of $a$ and $b$.",
      steps: [
        { m: "$a = 1$, $b = -1$: $\\dfrac{4}{-1} + \\dfrac{-1}{1} = -5 < 4$.", mk: "B1", n: "Opposite signs make both fractions negative." }
      ], result: "$a = 1, b = -1$ gives $-5$" } },
    { worked: { tag: "exam", title: "\"$n^3 - n$ is a multiple of 4\" is not always true", src: "AS Nov 2021 · P1 Q10(b) · 1 mark",
      steps: [
        { m: "$n = 2$: $8 - 2 = 6$, not a multiple of 4.", mk: "B1", n: "Any even $n$ that is not a multiple of 4 works: 2, 6, 10…" }
      ], result: "$n = 2$" } },
    { worked: { tag: "exam", title: "$x^2 > 9 \\Rightarrow x > 3$?", src: "AS June 2022 · P1 Q14(i) · 1 mark",
      q: "A student states \"if $x^2$ is greater than 9 then $x$ must be greater than 3\". Determine whether this is true, giving a reason.",
      steps: [
        { m: "False: $x = -4$ has $x^2 = 16 > 9$ but $x < 3$.", mk: "B1", n: "$x^2 > 9 \\iff x < -3$ or $x > 3$ (2.x inequalities)." }
      ], result: "False, e.g. $x = -4$" } },
    { worked: { tag: "exam", title: "$q^3 - p^3$ can be a multiple of 5", src: "AS June 2023 · P1 Q17(a) · 1 mark",
      q: "$p$, $q$ positive integers, $q > p$. Statement 1: \"$q^3 - p^3$ is never a multiple of 5.\" Show by a counter-example that Statement 1 is not true.",
      steps: [
        { m: "$q = 6$, $p = 1$: $216 - 1 = 215 = 5 \\times 43$.", mk: "B1", n: "Cubes mod 5 are $0, \\pm1$; you need $q^3 \\equiv p^3$: e.g. $6^3 \\equiv 1^3$, or $q = 7, p = 2$: $343 - 8 = 335$." }
      ], result: "$6^3 - 1^3 = 215$" } },

    { page: "Always, sometimes or never true" },
    { p: "Three verdicts, three different pieces of evidence:" },
    { kv: [
      ["Always true", "A proof (deduction or exhaustion) — an example is not enough."],
      ["Sometimes true", "**One case where it holds and one where it fails**, both with working. Ideally describe *when* it holds."],
      ["Never true", "A proof that it always fails (often: the negation is always true)."]
    ] },
    { worked: { tag: "exam", title: "$3^x \\ge 2^x$: always, sometimes or never?", src: "A-level Specimen · P2 Q14(i) · 2 marks",
      q: "Kayden claims that $3^x \\ge 2^x$. Determine whether the claim is always true, sometimes true or never true, justifying your answer.",
      steps: [
        { m: "$x = 1$: $3 \\ge 2$ ✓ $\\qquad x = -1$: $\\tfrac13 \\ge \\tfrac12$ ✗", mk: "M1", n: "One success and one failure.", fig: { x: [-2.5, 2.5], y: [-0.5, 6], axes: { xt: [-2, -1, 1, 2], yt: [1, 2, 3, 4, 5] }, items: [
          { fn: "3^x", label: "y = 3ˣ", at: 1.6, pos: "w" }, { fn: "2^x", c: "accent2", label: "y = 2ˣ", at: 2.3, pos: "s" },
          { pt: [0, 1], label: "cross at x = 0", pos: "e", c: "danger" }, { vline: 0, c: "muted" }
        ] } },
        { m: "Sometimes true: it holds for $x \\ge 0$ (equality at $x = 0$) and fails for $x < 0$.", mk: "A1", n: "Divide by $2^x > 0$: $(\\frac32)^x \\ge 1 \\iff x \\ge 0$. The graphs cross once, at $(0, 1)$." }
      ], result: "Sometimes — true iff $x \\ge 0$" } },
    { worked: { tag: "exam", title: "$|3x - 28| \\ge x - 9$: always, sometimes or never?", src: "A-level June 2019 · P1 Q10(ii) · 2 marks",
      q: "\"Given $x \\in \\mathbb{R}$, the value of $|3x - 28|$ is greater than or equal to the value of $(x - 9)$.\" State, giving a reason, whether this is always, sometimes or never true.",
      steps: [
        { m: "$x = 0$: $28 \\ge -9$ ✓ $\\qquad x = 9.3$: $|27.9 - 28| = 0.1$ but $x - 9 = 0.3$: $0.1 < 0.3$ ✗", mk: "M1", n: "The failure is squeezed between $x = 9.25$ and $x = 9\\frac13$ — near where $3x - 28 = 0$. Sketching both sides finds it.", fig: { x: [8, 10.5], y: [-0.5, 3.5], axes: { xt: [9, 10], yt: [1, 2, 3] }, items: [
          { fn: "abs(3*x-28)", label: "y = |3x − 28|", at: 10.3, pos: "w" }, { fn: "x-9", c: "accent2", label: "y = x − 9", at: 10.3, pos: "s" },
          { shade: { fn: "x-9", fn2: "abs(3*x-28)", from: 9.25, to: 9.3333 }, c: "danger", alpha: 0.35 },
          { pt: [9.3, 0.1], label: "fails here", pos: "se", c: "danger" }
        ], cap: "The V of $|3x - 28|$ dips below the line $y = x - 9$ on $(9.25, 9\\frac13)$ — the only place the claim fails." } },
        { m: "Sometimes true.", mk: "A1" }
      ], result: "Sometimes (fails for $9.25 < x < 9\\frac13$)" } },
    { worked: { tag: "exam", title: "\"Add 3 and square: bigger than the original square\"", src: "AS June 2018 · P1 Q2(ii) · 2 marks",
      q: "\"If I add 3 to a number and square the sum, the result is greater than the square of the original number.\" Always, sometimes or never true? Give a reason.",
      steps: [
        { m: "$(x + 3)^2 > x^2 \\iff 6x + 9 > 0 \\iff x > -1.5$", mk: "M1", n: "Expand and cancel $x^2$." },
        { m: "Sometimes: true for $x = 1$ ($16 > 1$), false for $x = -2$ ($1 > 4$ is false).", mk: "A1" }
      ], result: "Sometimes — iff $x > -1.5$" } },
    { worked: { tag: "exam", title: "$n^3 + 4n$ prime? $n^3 + 5n$ prime?", src: "AS June 2025 · P1 Q15 · 4 marks",
      q: "**(a)** \"$n^3 + 4n$ is prime for $n \\in \\mathbb{N}$\": always, sometimes or never true? **(b)** The same for \"$n^3 + 5n$ is prime for $n \\in \\mathbb{N}$\". Fully justify.",
      steps: [
        { h: "(a)", m: "$n = 1$: $5$, prime ✓. $n = 2$: $8 + 8 = 16$, not prime ✗. **Sometimes true.**", mk: "M1 A1", n: "One of each, with the values." },
        { h: "(b) Factorise", m: "$n^3 + 5n = n(n^2 + 5)$. For $n \\ge 2$ both factors are $\\ge 2$, so it is composite. For $n = 1$: $6$, not prime. **Never true.**", mk: "M1 A1", n: "\"Never\" needs a proof covering every $n$ — the factorisation plus the $n = 1$ check. (Also: $n(n^2 + 5)$ is always even and $> 2$.)" }
      ], result: "(a) sometimes; (b) never" } },

    { page: "Proof by contradiction" },
    { callout: { t: "def", h: "The structure", body: [
      "1. **Assume the statement is false** — write the negation precisely (\"Assume $\\sqrt3$ is rational\"; \"Assume $m$ is odd\"; \"Assume there exist positive integers $p, q$ with…\").",
      "2. **Deduce** consequences by valid steps.",
      "3. Reach something **impossible** (a number both even and odd; a fraction in lowest terms with a common factor; a non-integer that must be an integer).",
      "4. **Conclude**: \"This is a contradiction, so the assumption is false and the original statement is true.\""
    ] } },
    { callout: { t: "warn", h: "Negations that go wrong", body: [
      "\"At least one of $p$, $q$ is even\" negates to \"**both** are odd\" — not \"both are even\".",
      "\"There are no positive integers such that…\" negates to \"there **exist** positive integers such that…\".",
      "\"$m$ is even\" negates to \"$m$ is odd\" — for integers only.",
      "\"$\\sin x - \\cos x \\ge 1$\" negates to \"$\\sin x - \\cos x < 1$\"."
    ] } },
    { worked: { tag: "exam", title: "$\\sqrt3$ is irrational", src: "A-level Specimen · P2 Q14(ii) · 6 marks",
      q: "Prove that $\\sqrt3$ is an irrational number.",
      steps: [
        { h: "Assume the opposite", m: "Assume $\\sqrt3$ is rational: $\\sqrt3 = \\dfrac{p}{q}$ with $p, q$ integers, $q \\ne 0$, and **no common factor**.", mk: "B1", n: "\"Lowest terms\" is the thing that will be contradicted — it must be written down." },
        { m: "$3q^2 = p^2$, so $p^2$ is a multiple of 3.", mk: "M1" },
        { h: "So $p$ is a multiple of 3", m: "If $p$ were not, $p = 3k \\pm 1$ and $p^2 = 9k^2 \\pm 6k + 1 = 3(3k^2 \\pm 2k) + 1$, not a multiple of 3. Hence $p = 3m$.", mk: "A1", n: "This lemma — \"$3 \\mid p^2 \\Rightarrow 3 \\mid p$\" — is where marks are lost when it is merely asserted. One line of justification is enough." },
        { m: "$3q^2 = 9m^2 \\Rightarrow q^2 = 3m^2$, so $q^2$ and hence $q$ is a multiple of 3.", mk: "M1 A1" },
        { m: "Then $p$ and $q$ share the factor 3, contradicting \"no common factor\". So $\\sqrt3$ is irrational.", mk: "A1", n: "Name the contradiction and state the conclusion." }
      ], result: "Contradiction: $p$, $q$ both multiples of 3" } },
    { worked: { tag: "example", title: "There are infinitely many primes (Euclid)", src: "Specification 1.1 — named proof",
      q: "Prove that there are infinitely many prime numbers.",
      steps: [
        { m: "Assume there are finitely many primes: $p_1, p_2, \\ldots, p_n$ is the complete list.", n: "The negation of \"infinitely many\"." },
        { m: "Let $N = p_1 p_2 \\cdots p_n + 1$.", n: "The product of all of them, plus one." },
        { m: "Dividing $N$ by any $p_i$ leaves remainder 1, so no prime on the list divides $N$.", n: "$N = p_i \\times (\\text{the others}) + 1$." },
        { m: "But $N > 1$, so it has a prime factor (either $N$ itself or a smaller prime) — which is not on the list. Contradiction: the list was not complete. Hence there are infinitely many primes.", n: "Do not claim $N$ is prime — it need not be ($2\\cdot3\\cdot5\\cdot7\\cdot11\\cdot13 + 1 = 30031 = 59 \\times 509$). Only that it has a *new* prime factor." }
      ], result: "A new prime factor always exists" } },
    { worked: { tag: "exam", title: "No positive integers with $4p^2 - q^2 = 25$", src: "A-level Oct 2020 · P1 Q16 · 4 marks",
      q: "Prove by contradiction that there are no positive integers $p$ and $q$ such that $4p^2 - q^2 = 25$.",
      steps: [
        { m: "Assume positive integers $p$, $q$ exist with $4p^2 - q^2 = 25$. Then $(2p - q)(2p + q) = 25$.", mk: "B1 M1", n: "Difference of two squares. Both brackets are integers and $2p + q > 0$, so $2p - q > 0$ too." },
        { m: "The positive factor pairs of 25 are $1 \\times 25$ and $5 \\times 5$; since $2p + q > 2p - q$ (as $q > 0$), the only option is $2p - q = 1$, $2p + q = 25$.", mk: "M1", n: "$5 \\times 5$ would need $q = 0$, not positive." },
        { m: "Adding: $4p = 26 \\Rightarrow p = 6.5$, not an integer. Contradiction — so no such positive integers exist.", mk: "A1" }
      ], result: "$p = 6.5$ is not an integer" } },
    { worked: { tag: "exam", title: "$m^3 + 5$ odd $\\Rightarrow m$ even", src: "A-level Oct 2021 · P1 Q15(ii) · 4 marks",
      q: "Given that $m^3 + 5$ is odd, use proof by contradiction to show, using algebra, that $m$ is even.",
      steps: [
        { m: "Assume $m$ is odd: $m = 2k + 1$.", mk: "B1", n: "Negation of \"$m$ is even\"." },
        { m: "$m^3 + 5 = (2k + 1)^3 + 5 = 8k^3 + 12k^2 + 6k + 1 + 5 = 8k^3 + 12k^2 + 6k + 6 = 2(4k^3 + 6k^2 + 3k + 3)$", mk: "M1 A1", n: "Full expansion of the cube, then factor 2." },
        { m: "This is even, contradicting the given fact that $m^3 + 5$ is odd. Hence $m$ is even.", mk: "A1" }
      ], result: "Odd $m$ makes $m^3 + 5$ even — contradiction" } },
    { worked: { tag: "exam", title: "$pq$ even $\\Rightarrow$ at least one of $p$, $q$ even", src: "A-level June 2022 · P1 Q7(i) · 3 marks",
      q: "$p$, $q$ are integers with $pq$ even. Use algebra to prove by contradiction that at least one of $p$ or $q$ is even.",
      steps: [
        { m: "Assume neither is even: $p = 2m + 1$, $q = 2n + 1$ (**different** letters).", mk: "B1", n: "The negation of \"at least one even\" is \"both odd\"." },
        { m: "$pq = (2m + 1)(2n + 1) = 4mn + 2m + 2n + 1 = 2(2mn + m + n) + 1$, odd.", mk: "M1 A1", n: "Contradicts \"$pq$ is even\"; so at least one of $p$, $q$ is even." }
      ], result: "Both odd gives an odd product" } },
    { worked: { tag: "exam", title: "Complete a started proof: $\\sin x - \\cos x \\ge 1$ for obtuse $x$", src: "A-level June 2023 · P2 Q15 · 3 marks",
      q: "Given $x$ is obtuse, prove by contradiction that $\\sin x - \\cos x \\ge 1$. The proof begins: *Assume $\\sin x - \\cos x < 1$ when $x$ is obtuse $\\Rightarrow (\\sin x - \\cos x)^2 < 1 \\Rightarrow \\ldots$* Complete it.",
      steps: [
        { m: "$\\sin^2 x - 2\\sin x\\cos x + \\cos^2 x < 1 \\Rightarrow 1 - 2\\sin x\\cos x < 1 \\Rightarrow \\sin x\\cos x > 0$", mk: "M1 A1", n: "Expand; $\\sin^2 + \\cos^2 = 1$. (Squaring was valid because for obtuse $x$, $\\sin x > 0$ and $-\\cos x > 0$, so $0 < \\sin x - \\cos x < 1$.)" },
        { m: "But for obtuse $x$ ($90° < x < 180°$), $\\sin x > 0$ and $\\cos x < 0$, so $\\sin x\\cos x < 0$. Contradiction; hence $\\sin x - \\cos x \\ge 1$.", mk: "A1", n: "The signs in the second quadrant are the whole point." }
      ], result: "$\\sin x\\cos x > 0$ is impossible for obtuse $x$" } },
    { worked: { tag: "exam", title: "Complete a factor-pair contradiction: $(3x + 2y)(2x - 5y) = 28$", src: "A-level June 2024 · P1 Q15 · 6 marks",
      q: "**(i)** Show $k^2 - 4k + 5$ is positive for all real $k$. **(ii)** A student is proving by contradiction that there are no positive integers $x$, $y$ with $(3x + 2y)(2x - 5y) = 28$, and has done the case $3x + 2y = 14$, $2x - 5y = 2$ (giving $x = \\frac{74}{19}$, $y = \\frac{22}{19}$, not integers). Show the calculations and statements needed to complete the proof.",
      steps: [
        { h: "(i)", m: "$k^2 - 4k + 5 = (k - 2)^2 + 1 \\ge 1 > 0$", mk: "M1 A1" },
        { h: "(ii) Which factor pairs are possible", m: "$x, y \\ge 1 \\Rightarrow 3x + 2y \\ge 5$, and since the product is positive, $2x - 5y > 0$. Factor pairs of 28 with first factor $\\ge 5$: $(7, 4)$, $(14, 2)$, $(28, 1)$.", mk: "M1", n: "Ruling out $(1, 28)$, $(2, 14)$, $(4, 7)$ by the size of $3x + 2y$ is a required statement." },
        { m: "$(7, 4)$: $3x + 2y = 7$, $2x - 5y = 4 \\Rightarrow 15x + 10y = 35$, $4x - 10y = 8 \\Rightarrow 19x = 43$: not an integer.", mk: "A1" },
        { m: "$(28, 1)$: $3x + 2y = 28$, $2x - 5y = 1 \\Rightarrow 19x = 142$: not an integer.", mk: "A1" },
        { m: "With $(14, 2)$ already excluded, every case gives non-integer $x$: contradiction, so no positive integers $x$, $y$ exist.", mk: "A1", n: "The closing statement is a mark." }
      ], result: "All three admissible pairs fail" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command", "What they want", "Marks"], rows: [
      ["Prove, using algebra, that … for all $n$", "General form ($2k$, $2k + 1$, $3k + r$…); expand/factorise; conclude in words", "M1 A1 M1 A1"],
      ["Use proof by exhaustion", "Every case computed; \"these are all the cases\"", "M1 A1"],
      ["Show by means of a counter-example", "One value with its arithmetic", "B1 / M1 A1"],
      ["Always, sometimes or never true", "Sometimes: one ✓ one ✗; always/never: a proof", "M1 A1"],
      ["Prove by contradiction", "Precise negation; deduction; named contradiction; conclusion", "B1 M1 A1 A1"],
      ["Complete the student's proof", "Find the missing cases/lines; keep their notation; finish with the concluding sentence", "varies"],
      ["Identify and correct an error", "Quote the wrong line and give the right one", "B1"]
    ] } },
    { kv: [
      ["Different numbers, different letters", "$p = 2m + 1$, $q = 2n + 1$. Using $k$ for both proves only the case $p = q$."],
      ["The conclusion sentence", "\"… $= 2(\\ldots)$, which is even. Hence … for all $n \\in \\mathbb{N}$.\" Every proof ends by restating the claim."],
      ["Squares", "$(2k + 1)^2 = 4k^2 + 4k + 1$; $(5k + 2)^2 = 25k^2 + 20k + 4$. The cross term is $2ab$ — the most common algebraic error (June 2025 Q8 was built on it)."],
      ["Lowest terms", "In every irrationality proof, write \"with no common factor\" in the assumption — it is what gets contradicted."],
      ["fx-991CW", "Use the **table** function to scan $n = 1$ to $10$ for a counter-example, and **FACT** to factorise a candidate ($55 = 5 \\times 11$) before you commit."]
    ] },
    { callout: { t: "mnemonic", h: "\"Assume, deduce, clash, conclude\"", body: "The four beats of every contradiction proof. And for deduction: \"**Let**, **expand**, **factorise**, **hence**\"." } },
    { ul: [
      "**Misconception:** checking $n = 1, 2, 3$ proves \"for all $n$\". It never does.",
      "**Misconception:** $2k$ and $2k + 1$ for two unrelated numbers — they must be $2m$ and $2n + 1$ (unless the question links them, as with consecutive integers).",
      "**Misconception:** in the $\\sqrt3$ proof, jumping from \"$p^2$ is a multiple of 3\" to \"$p$ is a multiple of 3\" with no reason.",
      "**Misconception:** \"sometimes true\" with only a failing example — you need one of each.",
      "**Misconception:** ending a contradiction proof at the impossible statement without \"so the assumption is false, hence…\"."
    ] }
  ],
  flashcards: [
    ["General form of an odd number?", "$2k + 1$, $k \\in \\mathbb{Z}$ (a different letter for a second, unrelated odd number)."],
    ["Structure of a contradiction proof?", "Assume the negation; deduce; reach an impossibility; conclude the original is true."],
    ["Negation of \"at least one of $p$, $q$ is even\"?", "Both are odd."],
    ["To disprove \"for all $x$, $P(x)$\"?", "One counter-example with its arithmetic shown."],
    ["\"Sometimes true\" — evidence?", "One case where it holds and one where it fails."],
    ["Key step in the $\\sqrt3$ irrationality proof?", "$3 \\mid p^2 \\Rightarrow 3 \\mid p$ (justify), then $q$ too, contradicting lowest terms."],
    ["Why is $n(n+1)(n+2)$ divisible by 6?", "Among three consecutive integers there is a multiple of 2 and a multiple of 3."],
    ["Euclid's primes proof: what is $N$?", "$p_1 p_2 \\cdots p_n + 1$ — no listed prime divides it, so a new prime exists."]
  ],
  quiz: [
    { q: "Which proves \"$n^2 + n$ is even for all $n$\"?", opts: ["$n(n + 1)$ is a product of consecutive integers, one of which is even", "$1 + 1 = 2$, $4 + 2 = 6$, $9 + 3 = 12$", "$n^2 + n$ is even because $n^2$ and $n$ have the same parity, e.g. $n = 3$", "it is obvious"], ans: 0, why: "A general argument, not examples." },
    { q: "Counter-example to \"$n^2 - n - 1$ is prime for $3 \\le n \\le 10$\":", opts: ["$n = 8$ (55)", "$n = 3$ (5)", "$n = 4$ (11)", "$n = 10$ (89)"], ans: 0, why: "$55 = 5 \\times 11$." },
    { q: "Prove by contradiction \"$m$ is even\" — the assumption is", opts: ["$m$ is odd", "$m$ is even", "$m = 0$", "$m$ is prime"], ans: 0, why: "Negate the conclusion." },
    { q: "$3^x \\ge 2^x$ is", opts: ["sometimes true (iff $x \\ge 0$)", "always true", "never true", "true only for integers"], ans: 0, why: "$(3/2)^x \\ge 1 \\iff x \\ge 0$." },
    { q: "In the $\\sqrt3$ proof, why must $p$ be a multiple of 3?", opts: ["if $p = 3k \\pm 1$ then $p^2 = 3(\\ldots) + 1$, not a multiple of 3", "because $p^2 = 3q^2$ and 3 is prime, obviously", "because $q$ is a multiple of 3", "it need not be"], ans: 0, why: "The contrapositive of the lemma, justified." }
  ]
};


/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
