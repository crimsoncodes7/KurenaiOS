/* Kurenai OS — deep content: Pure Mathematics (P1-P5) */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["maths:1.1"] = {
  "notes": [
    { "h": "Methods of Proof" },
    {
      "callout": {
        "t": "def",
        "h": "Proof by Deduction",
        "body": "Starting from **known facts/axioms**, use logical algebraic steps to reach the conclusion. Every step must follow logically from the previous. The most common proof type in A-Level."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Proof by Exhaustion",
        "body": "Test **every single possible case** in a finite set to show the statement holds for all of them. Only valid when there are a limited number of cases to check."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Proof by Contradiction",
        "body": "Assume the **negation** of the statement is true, then derive a logical contradiction. Since the assumption leads to an impossibility, the original statement must be true. Classic example: $\\sqrt{2}$ is irrational."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Disproof by Counter-Example",
        "body": "To disprove a statement 'for all $n$, $P(n)$ is true', you only need to find **one specific value** of $n$ for which $P(n)$ is false. One counter-example is sufficient."
      }
    },
    {
      "table": {
        "head": ["Method", "Process", "Example Use Case"],
        "rows": [
          ["Deduction", "Known facts → logical steps → conclusion.", "$(a+b)^2 = a^2 + 2ab + b^2$ for all $a, b$."],
          ["Exhaustion", "Test every case in a finite set.", "Proving a property holds for $n \\in \\{1,2,3,4,5\\}$."],
          ["Counter-example", "Find one case where the statement fails.", "Disproving 'all odd numbers are prime' (e.g. $9 = 3\\times3$)."],
          ["Contradiction", "Assume false → derive impossibility.", "Proving $\\sqrt{2}$ is irrational."]
        ]
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Key Algebraic Definitions — Use These in Proofs",
        "body": "Even integer: $2n$ (where $n \\in \\mathbb{Z}$). Odd integer: $2n+1$. Consecutive integers: $n, n+1, n+2$. Consecutive even: $2n, 2n+2$. Consecutive odd: $2n+1, 2n+3$."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "One Counter-Example is Enough to Disprove",
        "body": "A universal statement ('for all $n$...') is disproved by a **single** counter-example. You do NOT need to show it fails in multiple cases. Conversely, showing it works for many values does NOT prove it — you need a proof."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Checking Cases is NOT a Proof",
        "body": "Testing $n = 1, 2, 3, 4, 5$ and finding the result holds does NOT prove it holds for all $n$. This is only valid as 'proof by exhaustion' if you've checked **every** possible case (only works for finite domains)."
      }
    },
    {
      "steps": [
        {
          "h": "Proof by Deduction: Odd × Odd = Odd",
          "m": "Let the two odd numbers be $2m+1$ and $2n+1$ (where $m, n \\in \\mathbb{Z}$).\n$(2m+1)(2n+1) = 4mn + 2m + 2n + 1 = 2(2mn+m+n) + 1$.",
          "n": "Since $2mn+m+n$ is an integer, the product has the form $2k+1$ — which is odd. QED."
        }
      ]
    }
  ],
  "flashcards": [
    ["What is a mathematical proof?", "A rigorous logical argument establishing the truth of a statement."],
    ["How do you disprove a universal statement?", "By providing a single counter-example."],
    ["Definition of an even number in proof?", "$2n$, where $n \\in \\mathbb{Z}$."],
    ["Definition of an odd number in proof?", "$2n+1$ or $2n-1$, where $n \\in \\mathbb{Z}$."],
    ["What is proof by exhaustion?", "Checking every possible case separately to show the statement holds for all."],
    ["What is proof by contradiction?", "Assuming the negation of the statement and finding a logical conflict."]
  ],
  "quiz": [
    {
      "q": "To disprove 'All prime numbers are odd', which number is the best counter-example?",
      "opts": ["1", "2", "3", "9"],
      "ans": 1,
      "why": "2 is prime and even, thus disproving the statement."
    }
  ],
  "exam": [
    {
      "q": "Use proof by contradiction to show that there are no positive integers $n$ such that $n^2-1$ is prime, for $n > 2$.",
      "marks": 3,
      "ms": [
        "Assume there exists $n > 2$ such that $n^2-1$ is prime. (1)",
        "$n^2-1 = (n-1)(n+1)$. Since $n > 2$, $n-1 > 1$ and $n+1 > 3$. (1)",
        "Since $n^2-1$ is a product of two integers both greater than 1, it cannot be prime. Contradiction. (1)"
      ]
    }
  ]
};

C["maths:2.1"] = {
  "notes": [
    { "h": "Laws of Indices" },
    {
      "callout": {
        "t": "info",
        "h": "Why These Matter",
        "body": "Index laws appear throughout A-Level — in surds, differentiation, integration, exponentials, and logarithms. You need them fluent. These are NOT given in the formula booklet."
      }
    },
    {
      "table": {
        "head": ["Rule", "Algebraic Form", "Description"],
        "rows": [
          ["Multiplication", "$a^m \\times a^n = a^{m+n}$", "Add indices when multiplying same base."],
          ["Division", "$a^m \\div a^n = a^{m-n}$", "Subtract indices when dividing same base."],
          ["Power of Power", "$(a^m)^n = a^{mn}$", "Multiply indices when raising a power to a power."],
          ["Zero Index", "$a^0 = 1$", "Any non-zero base raised to power 0 is 1."],
          ["Negative Index", "$a^{-n} = \\dfrac{1}{a^n}$", "A negative index represents a reciprocal."],
          ["Fractional Index", "$a^{\\frac{1}{n}} = \\sqrt[n]{a}$", "The denominator of the index is the root."],
          ["Rational Index", "$a^{\\frac{m}{n}} = (\\sqrt[n]{a})^m$", "Numerator is power, denominator is root."]
        ]
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "Fractional/Rational Index — Key Formula",
        "body": "$$a^{m/n} = \\left(\\sqrt[n]{a}\\right)^m = \\sqrt[n]{a^m}$$ Rule: **root is the denominator, power is the numerator**. Example: $8^{2/3} = (\\sqrt[3]{8})^2 = 2^2 = 4$."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "$a^0 = 1$ Only When $a \\neq 0$",
        "body": "$0^0$ is undefined. Also: index laws only apply when **bases are equal**. You cannot simplify $2^3 \\times 3^3$ by adding the indices — only $2^3 \\times 2^3 = 2^6$ works."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common Mistakes",
        "body": "$a^m + a^n \\neq a^{m+n}$ — you can only add indices for **multiplication**, not addition. $(a+b)^n \\neq a^n + b^n$ — you must expand the bracket. $\\sqrt{a+b} \\neq \\sqrt{a} + \\sqrt{b}$."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Powers to Know Instantly",
        "body": "$2^0=1, 2^{1/2}=\\sqrt{2}\\approx1.41, 2^{10}=1024$. $4^{1/2}=2, 8^{1/3}=2, 16^{1/4}=2, 27^{1/3}=3, 125^{1/3}=5$. Key squares: $1,4,9,16,25,36,49,64,81,100,121,144$."
      }
    }
  ],
  "flashcards": [
    ["Simplify $x^a \\times x^b$.", "$x^{a+b}$."],
    ["Simplify $(x^a)^b$.", "$x^{ab}$."],
    ["What is $x^{-3}$ in fraction form?", "$1/x^3$."],
    ["What is $x^{1/2}$ in radical form?", "$\\sqrt{x}$."],
    ["Simplify $x^5 \\div x^2$.", "$x^3$."],
    ["Evaluate $16^{3/4}$.", "$(\\sqrt[4]{16})^3 = 2^3 = 8$."]
  ],
  "quiz": [
    {
      "q": "Simplify $(2x^3)^4$.",
      "opts": ["$8x^{12}$", "$16x^7$", "$16x^{12}$", "$2x^{12}$"],
      "ans": 2,
      "why": "$2^4 \\times (x^3)^4 = 16x^{12}$."
    }
  ],
  "exam": [
    {
      "q": "Given that $32\\sqrt{2} = 2^k$, find the value of $k$.",
      "marks": 2,
      "ms": [
        "$32 = 2^5$ and $\\sqrt{2} = 2^{1/2}$. (1)",
        "$2^5 \\times 2^{1/2} = 2^{5.5} \\implies k = 5.5$ or $11/2$. (1)"
      ]
    }
  ]
};

C["maths:2.2"] = {
  "notes": [
    { "h": "Surds" },
    {
      "callout": {
        "t": "def",
        "h": "Surd",
        "body": "A **surd** is an irrational root that cannot be simplified to a rational number. E.g. $\\sqrt{2}, \\sqrt{3}, \\sqrt{5}$ are surds, but $\\sqrt{4} = 2$ is not. We keep surds in exact form to avoid rounding errors."
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "Surd Rules",
        "body": "$\\sqrt{ab} = \\sqrt{a} \\times \\sqrt{b}$ ·  $\\sqrt{\\dfrac{a}{b}} = \\dfrac{\\sqrt{a}}{\\sqrt{b}}$ · $\\sqrt{a} + \\sqrt{a} = 2\\sqrt{a}$ (only like surds can be combined) · $(\\sqrt{a})^2 = a$"
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "Rationalising the Denominator",
        "body": [
          "**Type 1** — $\\dfrac{k}{\\sqrt{a}}$: Multiply by $\\dfrac{\\sqrt{a}}{\\sqrt{a}}$ → denominator becomes $a$.",
          "**Type 2** — $\\dfrac{k}{a + \\sqrt{b}}$: Multiply by the **conjugate** $\\dfrac{a - \\sqrt{b}}{a - \\sqrt{b}}$ → denominator becomes $a^2 - b$ (difference of two squares)."
        ]
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Difference of Two Squares with Surds",
        "body": "$(a + \\sqrt{b})(a - \\sqrt{b}) = a^2 - b$. This is why the conjugate rationalises — the surd terms cancel. The result is always rational."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "$\\sqrt{a+b} \\neq \\sqrt{a} + \\sqrt{b}$",
        "body": "$\\sqrt{9+16} = \\sqrt{25} = 5$, but $\\sqrt{9} + \\sqrt{16} = 3 + 4 = 7 \\neq 5$. You cannot split a surd over addition or subtraction."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Simplifying — Find the Highest Square Factor",
        "body": "For $\\sqrt{72}$: factors of 72 include $36$ (the highest square). So $\\sqrt{72} = \\sqrt{36 \\times 2} = 6\\sqrt{2}$. Don't go $\\sqrt{4 \\times 18} = 2\\sqrt{18}$ — you'd then need another step."
      }
    },
    {
      "steps": [
        {
          "h": "Rationalise $\\dfrac{5}{3 - \\sqrt{2}}$",
          "m": "Multiply by conjugate: $\\dfrac{5}{3-\\sqrt{2}} \\times \\dfrac{3+\\sqrt{2}}{3+\\sqrt{2}} = \\dfrac{5(3+\\sqrt{2})}{9-2} = \\dfrac{15+5\\sqrt{2}}{7}$",
          "n": "Denominator: $(3)^2 - (\\sqrt{2})^2 = 9 - 2 = 7$. Always rational after multiplying by conjugate."
        }
      ]
    }
  ],
  "flashcards": [
    ["Simplify $\\sqrt{20}$.", "$2\\sqrt{5}$."],
    ["Simplify $\\sqrt{3} \\times \\sqrt{6}$.", "$\\sqrt{18} = 3\\sqrt{2}$."],
    ["Rationalise $1/\\sqrt{2}$.", "$\\sqrt{2}/2$."],
    ["What is the conjugate of $2+\\sqrt{3}$?", "$2-\\sqrt{3}$."],
    ["Expand $(1+\\sqrt{2})(1-\\sqrt{2})$.", "$1-2 = -1$."],
    ["Simplify $\\sqrt{48} - \\sqrt{12}$.", "$4\\sqrt{3} - 2\\sqrt{3} = 2\\sqrt{3}$."]
  ],
  "quiz": [
    {
      "q": "Express $\\frac{1}{3-\\sqrt{2}}$ in the form $a+b\\sqrt{2}$.",
      "opts": ["$\\frac{3+\\sqrt{2}}{7}$", "$\\frac{3-\\sqrt{2}}{7}$", "$\\frac{3+\\sqrt{2}}{11}$", "$3+\\sqrt{2}$"],
      "ans": 0,
      "why": "Multiply numerator and denominator by $3+\\sqrt{2}$. Denominator becomes $3^2 - 2 = 7$."
    }
  ],
  "exam": [
    {
      "q": "Show that $\\frac{\\sqrt{75} - \\sqrt{27}}{\\sqrt{3}}$ is an integer.",
      "marks": 2,
      "ms": [
        "$\\sqrt{75} = 5\\sqrt{3}$ and $\\sqrt{27} = 3\\sqrt{3}$. (1)",
        "$\\frac{5\\sqrt{3} - 3\\sqrt{3}}{\\sqrt{3}} = \\frac{2\\sqrt{3}}{\\sqrt{3}} = 2$. (1)"
      ]
    }
  ]
};

C["maths:2.3"] = {
  "notes": [
    { "h": "Quadratic Functions & Discriminant" },
    {
      "callout": {
        "t": "info",
        "h": "General Form",
        "body": "$f(x) = ax^2 + bx + c$. The shape is a parabola."
      }
    },
    {
      "table": {
        "head": ["Method", "Purpose", "Formula/Process"],
        "rows": [
          ["Factorising", "Find roots quickly", "Find $p, q$ such that $(x-p)(x-q)=0$."],
          ["Completing Square", "Find vertex/min/max", "$a(x+p)^2 + q$."],
          ["Quadratic Formula", "Find roots for any quadratic", "$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$."],
          ["Discriminant", "Determine nature of roots", "$D = b^2 - 4ac$."]
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "The Discriminant $D$",
        "body": [
          "$D > 0$: Two distinct real roots.",
          "$D = 0$: One repeated real root (tangent to x-axis).",
          "$D < 0$: No real roots (doesn't touch x-axis)."
        ]
      }
    }
  ],
  "flashcards": [
    ["Formula for the discriminant?", "$b^2 - 4ac$."],
    ["Condition for two distinct real roots?", "$b^2 - 4ac > 0$."],
    ["Condition for a repeated root?", "$b^2 - 4ac = 0$."],
    ["What does $b^2 - 4ac < 0$ imply about the graph?", "It never crosses or touches the $x$-axis."],
    ["Vertex of $y = (x-3)^2 + 5$?", "$(3, 5)$."],
    ["How to find the $y$-intercept of a quadratic?", "Set $x=0$ (it is the value of $c$ in $ax^2+bx+c$)."]
  ],
  "quiz": [
    {
      "q": "Find the discriminant of $2x^2 - 5x + 3 = 0$.",
      "opts": ["1", "49", "-1", "25"],
      "ans": 0,
      "why": "$(-5)^2 - 4(2)(3) = 25 - 24 = 1$."
    }
  ],
  "exam": [
    {
      "q": "The equation $x^2 + kx + (k+3) = 0$ has real roots. Find the set of possible values for $k$.",
      "marks": 4,
      "ms": [
        "For real roots, $b^2 - 4ac \\ge 0$. (1)",
        "$k^2 - 4(1)(k+3) \\ge 0 \\implies k^2 - 4k - 12 \\ge 0$. (1)",
        "Critical values: $(k-6)(k+2) = 0 \\implies k=6, k=-2$. (1)",
        "Solution: $k \\le -2$ or $k \\ge 6$. (1)"
      ]
    }
  ],
  "gens": ["quad"]
};

C["maths:2.4"] = {
  "notes": [
    { "h": "Simultaneous Equations" },
    {
      "callout": {
        "t": "def",
        "h": "Simultaneous Equations",
        "body": "Two or more equations that must **all be satisfied at the same time**. The solution is the set of values that makes every equation true simultaneously. Geometrically, this is the **intersection** of the curves."
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Methods",
        "body": [
          {"kv": [
            ["Elimination", "Used for two linear equations — multiply to match coefficients, then add/subtract to eliminate one variable."],
            ["Substitution", "Used for one linear + one non-linear — rearrange the linear for one variable, substitute into the other equation."]
          ]}
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "When the Discriminant = 0, the Line is a Tangent",
        "body": "If substitution produces a quadratic with $b^2 - 4ac = 0$, the line **touches** the curve at exactly one point — it's a tangent. If $b^2 - 4ac < 0$, there's no intersection."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Always Get Full Coordinate Pairs",
        "body": "After finding $x$ values, substitute back into the **simpler equation** to find $y$. Write your answers as coordinate pairs $(x, y)$. Don't pair the wrong $x$ and $y$ values together."
      }
    },
    {
      "steps": [
        {
          "h": "Linear + Quadratic: $y = x+1$ and $x^2 + y^2 = 5$",
          "m": "1. Substitute $y = x+1$ into circle: $x^2 + (x+1)^2 = 5$.\n2. Expand: $2x^2 + 2x + 1 = 5 \\implies 2x^2 + 2x - 4 = 0 \\implies x^2 + x - 2 = 0$.\n3. Factorise: $(x+2)(x-1) = 0 \\implies x = -2, x = 1$.\n4. Find $y$: $x=-2 \\implies y=-1$; $x=1 \\implies y=2$.",
          "n": "Solutions: $(-2, -1)$ and $(1, 2)$. Check both pairs in the original circle equation."
        }
      ]
    }
  ],
  "flashcards": [
    ["Most common method for linear + quadratic?", "Substitution."],
    ["Geometric meaning of simultaneous solutions?", "Points of intersection between graphs."],
    ["How many solutions can a line and a circle have?", "0, 1 (tangent), or 2."],
    ["If substitution results in $b^2-4ac=0$, what is the line?", "A tangent to the curve."],
    ["First step in solving $2x+y=5$ and $x^2+y^2=10$?", "Rearrange linear for one variable, e.g., $y=5-2x$."],
    ["What if there are no real solutions to the resulting quadratic?", "The graphs do not intersect."]
  ],
  "quiz": [
    {
      "q": "Solve $y=2x$ and $y=x^2-3$.",
      "opts": ["$(3, 6), (-1, -2)$", "$(1, 2), (-3, -6)$", "$(3, 6)$ only", "$(-1, -2)$ only"],
      "ans": 0,
      "why": "$x^2-3=2x \\implies x^2-2x-3=0 \\implies (x-3)(x+1)=0$."
    }
  ],
  "exam": [
    {
      "q": "The line $y=mx+1$ is a tangent to the curve $y=x^2+5$. Find the possible values of $m$.",
      "marks": 4,
      "ms": [
        "$mx+1 = x^2+5 \\implies x^2 - mx + 4 = 0$. (1)",
        "For a tangent, $b^2 - 4ac = 0$. (1)",
        "$(-m)^2 - 4(1)(4) = 0 \\implies m^2 = 16$. (1)",
        "$m = 4$ or $m = -4$. (1)"
      ]
    }
  ]
};

C["maths:2.5"] = {
  "notes": [
    { "h": "Linear & Quadratic Inequalities" },
    {
      "callout": {
        "t": "warn",
        "h": "The Golden Rule — Flip the Sign",
        "body": "When multiplying or dividing an inequality by a **negative number**, you MUST reverse the inequality sign. E.g.: $-2x < 6 \\implies x > -3$."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Linear Inequality",
        "body": "Solved by rearranging like an equation, with one exception: dividing/multiplying by a negative reverses the sign. Solutions can be written as $x > a$, $x \\le b$, or in set notation $\\{x : x > a\\}$."
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "Quadratic Inequality — Method",
        "body": "1. Rearrange to $ax^2 + bx + c > 0$ (or $< 0$). 2. Find critical values by solving $ax^2 + bx + c = 0$. 3. Sketch the parabola. 4. Read off the correct region: $< 0$ = **inside** (between) roots; $> 0$ = **outside** (beyond) roots."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Inside vs Outside Critical Values",
        "body": "For $a > 0$ (U-parabola): **$f(x) < 0$ → inside the roots** ($a < x < b$). **$f(x) > 0$ → outside the roots** ($x < a$ or $x > b$). Draw the sketch every time — don't try to remember the rule without visualising it."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "$x^2 > 9$ Does NOT Mean $x > 3$",
        "body": "$x^2 > 9$ means $(x-3)(x+3) > 0$, giving $x < -3$ or $x > 3$. Students who write only $x > 3$ miss the negative solution. Always find critical values $\\pm\\sqrt{k}$ for $x^2 > k$."
      }
    },
    {
      "steps": [
        {
          "h": "Solve $x^2 - 5x + 4 < 0$",
          "m": "1. Critical values: $(x-1)(x-4) = 0 \\implies x = 1, 4$.\n2. U-parabola: below x-axis between the roots.\n3. Solution: $1 < x < 4$.",
          "n": "Always sketch the parabola — it makes the region selection visual and reliable."
        }
      ]
    }
  ],
  "flashcards": [
    ["Solve $2x + 5 > 11$.", "$x > 3$."],
    ["What happens if you multiply $-x < 3$ by $-1$?", "It becomes $x > -3$."],
    ["First step in solving $x^2 - 9 \\ge 0$?", "Find critical values: $x=3, x=-3$."],
    ["Solution format for 'inside' critical values $a, b$?", "$a < x < b$."],
    ["Solution format for 'outside' critical values $a, b$ (where $a < b$)?", "$x < a$ or $x > b$."],
    ["Set notation for $x > 5$?", "$\\{x : x > 5\\}$."]
  ],
  "quiz": [
    {
      "q": "Solve $x^2 > 9$.",
      "opts": ["$x > 3$", "$-3 < x < 3$", "$x < -3$ or $x > 3$", "$x > \\pm 3$"],
      "ans": 2,
      "why": "Critical values are $\\pm 3$. Graph is above $x$-axis for $x < -3$ or $x > 3$."
    }
  ],
  "exam": [
    {
      "q": "Find the set of values of $x$ for which $x^2 - 2x - 15 \\le 0$ AND $x > 2$.",
      "marks": 4,
      "ms": [
        "$(x-5)(x+3) \\le 0 \\implies -3 \\le x \\le 5$. (2)",
        "Intersect with $x > 2$. (1)",
        "Final answer: $2 < x \\le 5$. (1)"
      ]
    }
  ]
};

C["maths:2.6"] = {
  "notes": [
    { "h": "Polynomials & Factor Theorem" },
    {
      "callout": {
        "t": "info",
        "h": "Factor Theorem",
        "body": "If $f(a) = 0$, then $(x-a)$ is a factor of $f(x)$."
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Remainder Theorem",
        "body": "The remainder when $f(x)$ is divided by $(x-a)$ is $f(a)$."
      }
    },
    {
      "steps": [
        {
          "h": "Factorising a Cubic",
          "m": "Factorise $f(x) = x^3 - 6x^2 + 11x - 6$.\n1. Try $f(1)$: $1 - 6 + 11 - 6 = 0$. So $(x-1)$ is a factor.\n2. Divide $f(x)$ by $(x-1)$ using long division or inspection.\n3. $f(x) = (x-1)(x^2 - 5x + 6)$.\n4. Factorise quadratic: $(x-1)(x-2)(x-3)$.",
          "n": "Always start by testing small integer values like $\\pm 1, \\pm 2$."
        }
      ]
    }
  ],
  "flashcards": [
    ["State the Factor Theorem.", "If $f(k)=0$, then $(x-k)$ is a factor."],
    ["How to find the remainder of $f(x) \\div (x+2)$?", "Calculate $f(-2)$."],
    ["If $(2x-1)$ is a factor of $f(x)$, what is $f(1/2)$?", "Zero."],
    ["Degree of a cubic polynomial?", "Three."],
    ["What is the maximum number of roots for a quartic?", "Four."],
    ["Simplify $(x^3 - 1) \\div (x-1)$.", "$x^2 + x + 1$."]
  ],
  "quiz": [
    {
      "q": "If $f(x) = x^3 + kx + 2$ and $(x-1)$ is a factor, find $k$.",
      "opts": ["-3", "3", "1", "-1"],
      "ans": 0,
      "why": "$f(1) = 1 + k + 2 = 0 \\implies k = -3$."
    }
  ],
  "exam": [
    {
      "q": "Given $f(x) = 2x^3 + ax^2 + bx + 3$. When $f(x)$ is divided by $(x-1)$, the remainder is 4. When divided by $(x+1)$, the remainder is 10. Find $a$ and $b$.",
      "marks": 5,
      "ms": [
        "$f(1) = 2 + a + b + 3 = 4 \\implies a + b = -1$. (1)",
        "$f(-1) = -2 + a - b + 3 = 10 \\implies a - b = 9$. (1)",
        "Add equations: $2a = 8 \\implies a = 4$. (1)",
        "Substitute: $4 + b = -1 \\implies b = -5$. (1)",
        "Final values $a=4, b=-5$. (1)"
      ]
    }
  ]
};

C["maths:2.7"] = {
  "notes": [
    { "h": "Graphs of Functions" },
    {
      "callout": {
        "t": "info",
        "h": "What You Need",
        "body": "Recognise and sketch: linear, quadratic, cubic, reciprocal ($1/x$ and $1/x^2$), and exponential graphs. Know the shape, asymptotes, intercepts, and how transformations change each."
      }
    },
    {
      "table": {
        "head": ["Function Type", "Equation Form", "Key Features"],
        "rows": [
          ["Linear", "$y = mx + c$", "Straight line, gradient $m$, $y$-intercept $c$."],
          ["Quadratic", "$y = ax^2 + bx + c$", "Parabola. Positive $a$: U-shape; negative $a$: n-shape."],
          ["Cubic", "$y = ax^3 + bx^2 + cx + d$", "S-shape, up to 2 turning points. Positive $a$: bottom-left to top-right."],
          ["Reciprocal", "$y = k/x$", "Hyperbola. Asymptotes $x=0, y=0$. Quadrants 1 & 3 (if $k>0$)."],
          ["Reciprocal Squared", "$y = k/x^2$", "Always above $x$-axis (if $k>0$). Asymptotes $x=0, y=0$."],
          ["Exponential", "$y = a^x$", "Always positive. Asymptote $y=0$. Passes through $(0,1)$."]
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Negative Coefficient = Reflection in $x$-axis",
        "body": "Multiplying by $-1$ reflects the graph in the $x$-axis. So $y = -x^2$ opens downwards, $y = -1/x$ is in the 2nd and 4th quadrants, and $y = -a^x$ is always below the $x$-axis."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Asymptote Checklist — NOT Given",
        "body": "$y = k/x$: asymptotes $x=0, y=0$. $y = k/x^2$: same asymptotes, both branches above $x$-axis ($k>0$). $y = a^x$: asymptote $y=0$, always positive. These are never given — learn them."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Repeated Root = Graph Touches, Doesn't Cross",
        "body": "If $(x-a)^2$ is a factor, the graph touches the $x$-axis at $x=a$ and bounces back. A single factor $(x-a)$ means the graph crosses. For cubics: a repeated root + single root = shape with a 'bounce'."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Exponential Does Not Hit $y = 0$",
        "body": "$y = a^x$ has a horizontal asymptote at $y=0$ but never reaches it. Students sometimes draw the curve touching the axis — this is wrong. It approaches but never meets."
      }
    }
  ],
  "flashcards": [
    ["Shape of a cubic with positive $x^3$ coefficient?", "Starts bottom-left, ends top-right."],
    ["Asymptotes of $y = 1/x$?", "$x=0$ and $y=0$."],
    ["How many turning points can a quartic have?", "Up to 3."],
    ["What feature does $y=1/x^2$ have at $x=0$?", "A vertical asymptote."],
    ["Where does $y=3^x$ cross the $y$-axis?", "At $(0, 1)$."],
    ["Effect of a negative 'a' in $y=ax^2$?", "Reflects the parabola in the $x$-axis (opens downwards)."]
  ],
  "quiz": [
    {
      "q": "Which graph has asymptotes $x=0$ and $y=0$?",
      "opts": ["$y=x^2$", "$y=e^x$", "$y=1/x$", "$y=\\sin x$"],
      "ans": 2,
      "why": "The reciprocal function $y=k/x$ is undefined at $x=0$ and never reaches $y=0$."
    }
  ],
  "exam": [
    {
      "q": "Sketch the graph of $y = (x-2)^2(x+1)$, showing the coordinates of any intercepts with the axes.",
      "marks": 3,
      "ms": [
        "Correct cubic shape (positive $x^3$). (1)",
        "Intercepts $x$-axis at $x=2$ (touches) and $x=-1$ (crosses). (1)",
        "Intercepts $y$-axis at $(0, 4)$. (1)"
      ]
    }
  ]
};

C["maths:2.8"] = {
  "notes": [
    { "h": "Composite & Inverse Functions" },
    {
      "callout": {
        "t": "info",
        "h": "Notation",
        "body": [
          "$fg(x)$ means $f(g(x))$: Apply $g$ first, then $f$.",
          "$f^{-1}(x)$ is the inverse: Undoes the action of $f$."
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Condition for Inverse",
        "body": "An inverse function $f^{-1}(x)$ exists IF AND ONLY IF $f(x)$ is a one-to-one function."
      }
    },
    {
      "kv": [
        ["Domain of $f^{-1}$", "Range of $f$"],
        ["Range of $f^{-1}$", "Domain of $f$"],
        ["Graph of $f^{-1}$", "Reflection of $f$ in the line $y=x$"]
      ]
    }
  ],
  "flashcards": [
    ["What does $gf(x)$ mean?", "Apply $f$ then apply $g$ to the result."],
    ["How to find an inverse function algebraically?", "Swap $x$ and $y$ and rearrange for $y$."],
    ["Geometric relationship between $f$ and $f^{-1}$?", "Reflection in the line $y=x$."],
    ["Constraint for $f^{-1}(x)$ to exist?", "$f(x)$ must be one-to-one."],
    ["Relationship between domains and ranges?", "$Dom(f^{-1}) = Ran(f)$ and vice versa."],
    ["Evaluate $ff^{-1}(x)$.", "$x$."]
  ],
  "quiz": [
    {
      "q": "If $f(x) = 2x+3$ and $g(x) = x^2$, find $fg(2)$.",
      "opts": ["7", "11", "49", "25"],
      "ans": 1,
      "why": "$g(2) = 4 \\implies f(4) = 2(4)+3 = 11$."
    }
  ],
  "exam": [
    {
      "q": "Let $f(x) = \\frac{2x+1}{x-3}, x \\ne 3$. Find $f^{-1}(x)$ and state its domain.",
      "marks": 4,
      "ms": [
        "$x = \\frac{2y+1}{y-3} \\implies x(y-3) = 2y+1$. (1)",
        "$xy - 3x = 2y + 1 \\implies y(x-2) = 3x+1$. (1)",
        "$f^{-1}(x) = \\frac{3x+1}{x-2}$. (1)",
        "Domain: $x \\ne 2$ (since range of $f$ is $y \\ne 2$). (1)"
      ]
    }
  ]
};

C["maths:2.9"] = {
  "notes": [
    { "h": "Graph Transformations" },
    {
      "table": {
        "head": ["Notation", "Transformation", "Direction", "Mnemonic"],
        "rows": [
          ["$f(x) + a$", "Translate up $a$ units", "Vertical", "Outside = vertical"],
          ["$f(x + a)$", "Translate left $a$ units ($a>0$)", "Horizontal", "Inside = horizontal, OPPOSITE direction"],
          ["$a f(x)$", "Vertical stretch, scale factor $a$", "Vertical", "Multiply $y$-values by $a$"],
          ["$f(ax)$", "Horizontal stretch, scale factor $1/a$", "Horizontal", "Divide $x$-values by $a$"],
          ["$-f(x)$", "Reflection in the $x$-axis", "Vertical", "Negates all $y$-values"],
          ["$f(-x)$", "Reflection in the $y$-axis", "Horizontal", "Negates all $x$-values"]
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "The Horizontal Direction Trap",
        "body": "For $f(x+a)$: adding $a$ INSIDE the bracket moves the graph LEFT (negative direction). For $f(ax)$: multiplying $x$ by $a$ INSIDE the bracket compresses the graph (scale factor $1/a$, not $a$). Inside always does the opposite of what you'd expect."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Order of Combined Transformations",
        "body": "For $y = af(x+b) + c$: apply in this order — (1) Horizontal shift by $-b$, (2) Horizontal stretch by $1/a$, (3) Vertical stretch by $a$, (4) Vertical shift by $c$. Each individual part acts on the result of the previous."
      }
    }
  ],
  "flashcards": [
    ["Effect of $f(x-3)$?", "Translate right by 3 units."],
    ["Effect of $2f(x)$?", "Vertical stretch scale factor 2."],
    ["Effect of $f(2x)$?", "Horizontal stretch scale factor $1/2$."],
    ["How to reflect a graph in the $x$-axis?", "Apply $-f(x)$."],
    ["Transformation for $f(x)+5$?", "Translate up by 5 units."],
    ["How to reflect in the $y$-axis?", "Apply $f(-x)$."]
  ],
  "quiz": [
    {
      "q": "The graph of $y=x^2$ is translated by $\\begin{pmatrix} 2 \\\\ -1 \\end{pmatrix}$. What is the new equation?",
      "opts": ["$y = (x+2)^2-1$", "$y = (x-2)^2-1$", "$y = (x-2)^2+1$", "$y = (x+2)^2+1$"],
      "ans": 1,
      "why": "Horizontal translation $a=2 \\implies (x-2)$, Vertical $b=-1 \\implies -1$."
    }
  ],
  "exam": [
    {
      "q": "Describe the transformations that map $y = \\sin x$ onto $y = 3\\sin(2x)$.",
      "marks": 2,
      "ms": [
        "Vertical stretch scale factor 3. (1)",
        "Horizontal stretch scale factor $1/2$. (1)"
      ]
    }
  ]
};

C["maths:2.10"] = {
  "notes": [
    { "h": "Partial Fractions" },
    {
      "callout": {
        "t": "def",
        "h": "Partial Fractions",
        "body": "Decomposing a rational expression into a **sum of simpler fractions** with linear (or repeated) denominators. Essential for integration of rational functions and binomial expansion."
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "Type 1: Distinct Linear Factors",
        "body": "$$\\frac{f(x)}{(x-a)(x-b)} = \\frac{A}{x-a} + \\frac{B}{x-b}$$ Find $A$ and $B$ by either: (1) substituting $x=a$ then $x=b$ into the numerator equation, or (2) equating coefficients."
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "Type 2: Repeated Linear Factor",
        "body": "$$\\frac{f(x)}{(x-a)^2(x-b)} = \\frac{A}{x-a} + \\frac{B}{(x-a)^2} + \\frac{C}{x-b}$$ Each power of the repeated factor needs its own numerator constant."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Improper Fractions — Do Long Division First",
        "body": "If the degree of the **numerator** $\\ge$ degree of the **denominator**, the fraction is **improper**. Perform polynomial long division first to get: $\\text{quotient} + \\dfrac{\\text{remainder}}{\\text{denominator}}$, then decompose the remainder."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Cover-Up Method for Finding Constants",
        "body": "For $\\dfrac{f(x)}{(x-a)(x-b)} = \\dfrac{A}{x-a} + \\dfrac{B}{x-b}$: to find $A$, substitute $x=a$ into $\\dfrac{f(x)}{x-b}$ (covering $(x-a)$). To find $B$, substitute $x=b$ into $\\dfrac{f(x)}{x-a}$."
      }
    },
    {
      "steps": [
        {
          "h": "Express $\\frac{x+7}{(x-1)(x+3)}$ in partial fractions",
          "m": "Let $\\frac{A}{x-1} + \\frac{B}{x+3}$. Multiply through: $x+7 = A(x+3) + B(x-1)$.\nSubstitute $x=1$: $8 = 4A \\implies A = 2$.\nSubstitute $x=-3$: $4 = -4B \\implies B = -1$.",
          "n": "Answer: $\\dfrac{2}{x-1} - \\dfrac{1}{x+3}$. Check by recombining over a common denominator."
        }
      ]
    }
  ],
  "flashcards": [
    ["Form for $\\frac{1}{(x+1)(x-2)}$?", "$\\frac{A}{x+1} + \\frac{B}{x-2}$."],
    ["Form for repeated factor $(x+3)^2$?", "$\\frac{A}{x+3} + \\frac{B}{(x+3)^2}$."],
    ["When is a fraction 'improper'?", "Numerator degree $\\ge$ Denominator degree."],
    ["How to find constants $A$ and $B$?", "Equate numerators and substitute values of $x$."],
    ["Why use partial fractions?", "To simplify expressions for integration or binomial expansion."],
    ["Expand $\\frac{x}{(x+1)(x+2)}$?", "$\\frac{-1}{x+1} + \\frac{2}{x+2}$."]
  ],
  "quiz": [
    {
      "q": "Find the form of the partial fractions for $\\frac{5x}{(x-1)^2}$.",
      "opts": ["$\\frac{A}{x-1} + \\frac{B}{x-1}$", "$\\frac{A}{x-1} + \\frac{B}{(x-1)^2}$", "$\\frac{A}{x-1}$", "$\\frac{Ax+B}{(x-1)^2}$"],
      "ans": 1,
      "why": "Repeated factors require terms for each power up to the repetition count."
    }
  ],
  "exam": [
    {
      "q": "Express $\\frac{x+7}{(x-1)(x+3)}$ in partial fractions.",
      "marks": 3,
      "ms": [
        "$\\frac{A}{x-1} + \\frac{B}{x+3} = \\frac{A(x+3) + B(x-1)}{(x-1)(x+3)}$. (1)",
        "Let $x=1 \\implies 8 = 4A \\implies A=2$. (1)",
        "Let $x=-3 \\implies 4 = -4B \\implies B=-1$. Final: $\\frac{2}{x-1} - \\frac{1}{x+3}$. (1)"
      ]
    }
  ]
};

C["maths:2.11"] = {
  "notes": [
    { "h": "Functions in Modelling" },
    {
      "callout": {
        "t": "def",
        "h": "Mathematical Modelling",
        "body": "Using mathematical functions to represent real-world scenarios. Key steps: (1) set up the model, (2) solve/analyse mathematically, (3) interpret the result in context, (4) check validity."
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Common Model Types",
        "body": [
          {"kv": [
            ["Quadratic", "Projectile motion, profit/revenue. $h(t) = -at^2 + bt + c$. Maximum at vertex."],
            ["Exponential growth", "$P = Ae^{kt}$ ($k>0$). E.g. population growth, compound interest."],
            ["Exponential decay", "$N = N_0 e^{-kt}$ ($k>0$). E.g. radioactive decay, Newton's cooling."],
            ["Reciprocal", "$y = k/x$. E.g. pressure-volume relationship ($PV = k$)."]
          ]}
        ]
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "Exponential Model Key Parameters",
        "body": "For $y = Ae^{kt}$: **$A$** = initial value (at $t=0$, since $e^0=1$). **$k$** = rate constant (positive = growth, negative = decay). **Doubling time** (growth): $t = \\dfrac{\\ln 2}{k}$. **Half-life** (decay): $t_{1/2} = \\dfrac{\\ln 2}{k}$."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Domain Restrictions in Models",
        "body": "Real-world models always have domain restrictions that must be stated. Time is usually $t \\ge 0$. Height can't be negative. Population must be $\\ge 0$. Always check your answer makes physical sense — e.g. negative time or height is meaningless."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Interpreting the $y$-intercept",
        "body": "For models of the form $f(t)$, the $y$-intercept ($t=0$) is always the **initial value**. In $T = 20 + 80e^{-0.1t}$, the initial temperature is $T(0) = 100$. As $t \\to \\infty$, $e^{-0.1t} \\to 0$ so $T \\to 20$ (room temperature)."
      }
    },
    {
      "steps": [
        {
          "h": "Quadratic Model: Ball thrown, $h(t) = -5t^2 + 10t + 2$",
          "m": "Max height: $t = -b/2a = -10/(2 \\times -5) = 1\\text{ s}$. Then $h(1) = -5+10+2 = 7\\text{ m}$.\nInitial height: $h(0) = 2\\text{ m}$. Lands when $h=0$: $-5t^2+10t+2=0$.",
          "n": "The domain is $0 \\le t \\le$ (time when ball lands). Negative $h$ values are outside the model's validity."
        }
      ]
    }
  ],
  "flashcards": [
    ["What does the $y$-intercept usually represent?", "The initial value (at $t=0$)."],
    ["In a growth model $P = Ae^{kt}$, what is $A$?", "Initial population."],
    ["Constraint on time $t$ in most models?", "$t \\ge 0$."],
    ["Meaning of 'asymptotic behavior' in modelling?", "A limit the system approaches but never reaches."],
    ["How to find a maximum value of a function?", "Differentiate and set to 0, or complete the square."],
    ["What does a negative gradient in a linear model imply?", "A constant rate of decrease."]
  ],
  "quiz": [
    {
      "q": "Temperature $T = 20 + 80e^{-0.1t}$. What is the room temperature (as $t \\to \\infty$)?",
      "opts": ["100", "80", "20", "0"],
      "ans": 2,
      "why": "As $t \\to \\infty$, $e^{-0.1t} \\to 0$, so $T \\to 20$."
    }
  ],
  "exam": [
    {
      "q": "A company's profit $P$ (thousands) is modelled by $P = 100 - (x-5)^2$ where $x$ is the number of units sold. Find the maximum profit and the number of units required.",
      "marks": 2,
      "ms": [
        "Maximum profit is 100 (thousand). (1)",
        "Occurs when $(x-5)=0 \\implies x=5$ units. (1)"
      ]
    }
  ]
};

C["maths:3.1"] = {
  "notes": [
    { "h": "Straight Lines" },
    {
      "callout": {
        "t": "formula",
        "h": "Key Equations",
        "body": [
          "Gradient $m = \\frac{y_2 - y_1}{x_2 - x_1}$",
          "$y - y_1 = m(x - x_1)$ (Point-gradient form)",
          "$y = mx + c$ (Gradient-intercept form)",
          "$ax + by + c = 0$ (General form)"
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Parallel & Perpendicular",
        "body": [
          "Parallel lines: $m_1 = m_2$.",
          "Perpendicular lines: $m_1 \\times m_2 = -1$."
        ]
      }
    }
  ],
  "flashcards": [
    ["Formula for gradient between two points?", "$m = (y_2-y_1)/(x_2-x_1)$."],
    ["Condition for perpendicular lines?", "$m_1 m_2 = -1$."],
    ["Equation of line through $(x_1, y_1)$ with gradient $m$?", "$y - y_1 = m(x - x_1)$."],
    ["Gradient of the line $2x + 3y = 6$?", "$-2/3$."],
    ["Midpoint formula?", "$(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2})$."],
    ["Distance formula between two points?", "$\\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$."]
  ],
  "quiz": [
    {
      "q": "Find the gradient of a line perpendicular to $y = 3x - 5$.",
      "opts": ["3", "-3", "$1/3$", "$-1/3$"],
      "ans": 3,
      "why": "Negative reciprocal of 3 is $-1/3$."
    }
  ],
  "exam": [
    {
      "q": "The line $L_1$ passes through $(2, 5)$ and $(4, 9)$. Find the equation of the line $L_2$ which is perpendicular to $L_1$ and passes through the midpoint of $L_1$.",
      "marks": 5,
      "ms": [
        "Gradient $L_1 = (9-5)/(4-2) = 2$. (1)",
        "Gradient $L_2 = -1/2$. (1)",
        "Midpoint = $((2+4)/2, (5+9)/2) = (3, 7)$. (1)",
        "$y - 7 = -1/2(x - 3)$. (1)",
        "$y = -1/2x + 8.5$ (or equivalent). (1)"
      ]
    }
  ]
};

C["maths:3.2"] = {
  "notes": [
    { "h": "Circles" },
    {
      "callout": {
        "t": "formula",
        "h": "Circle Equation",
        "body": "$$(x-a)^2 + (y-b)^2 = r^2$$",
        "footer": "Center $(a, b)$, radius $r$."
      }
    },
    {
      "steps": [
        {
          "h": "Finding Center and Radius",
          "m": "Given $x^2 + y^2 - 4x + 6y - 3 = 0$.\n1. Group $x$ and $y$ terms: $(x^2-4x) + (y^2+6y) = 3$.\n2. Complete square: $(x-2)^2 - 4 + (y+3)^2 - 9 = 3$.\n3. Simplify: $(x-2)^2 + (y+3)^2 = 16$.",
          "n": "Center $(2, -3)$, Radius $4$."
        }
      ]
    }
  ],
  "flashcards": [
    ["Standard equation of a circle?", "$(x-a)^2 + (y-b)^2 = r^2$."],
    ["Center of $(x+3)^2 + (y-5)^2 = 10$?", "$(-3, 5)$."],
    ["Radius of $x^2 + y^2 = 49$?", "7."],
    ["Angle in a semi-circle?", "$90^\\circ$ (Right angle)."],
    ["Perpendicular bisector of a chord passes through...?", "The center of the circle."],
    ["The tangent at any point is perpendicular to...?", "The radius at that point."]
  ],
  "quiz": [
    {
      "q": "A circle has equation $(x-1)^2 + y^2 = 25$. Does point $(4, 4)$ lie on the circle?",
      "opts": ["Yes", "No, it's inside", "No, it's outside", "Insufficient info"],
      "ans": 0,
      "why": "$(4-1)^2 + 4^2 = 3^2 + 4^2 = 9+16=25$. Yes."
    }
  ],
  "exam": [
    {
      "q": "The points $A(1, 7)$ and $B(5, 9)$ are the endpoints of a diameter of a circle. Find the equation of the circle.",
      "marks": 4,
      "ms": [
        "Center is midpoint: $( (1+5)/2, (7+9)/2 ) = (3, 8)$. (1)",
        "Radius squared = distance from center to $A$: $(3-1)^2 + (8-7)^2 = 2^2 + 1^2 = 5$. (2)",
        "Equation: $(x-3)^2 + (y-8)^2 = 5$. (1)"
      ]
    }
  ]
};

C["maths:3.3"] = {
  "notes": [
    { "h": "Parametric Equations" },
    {
      "callout": {
        "t": "info",
        "body": "Expressing $x$ and $y$ separately in terms of a third variable, the parameter $t$ or $\\theta$."
      }
    },
    {
      "steps": [
        {
          "h": "Converting to Cartesian",
          "m": "Given $x = t+1, y = t^2$.\n1. Rearrange for $t$: $t = x-1$.\n2. Substitute into $y$: $y = (x-1)^2$.",
          "n": "Identify the domain of $x$ based on the range of $t$."
        }
      ]
    }
  ],
  "flashcards": [
    ["What is a parametric equation?", "Representing $x$ and $y$ as functions of a parameter $t$."],
    ["How to eliminate $t$ from $x=2t, y=t^2$?", "$t=x/2 \\implies y=(x/2)^2$."],
    ["Identity used to eliminate $\\theta$ from $x=\\cos \\theta, y=\\sin \\theta$?", "$\\cos^2 \\theta + \\sin^2 \\theta = 1$."],
    ["Cartesian equation for $x = a \\cos \\theta, y = b \\sin \\theta$?", "$(x/a)^2 + (y/b)^2 = 1$ (Ellipse)."],
    ["Find $y$ if $x=3$ for $x=t+1, y=2t$?", "$t=2 \\implies y=4$."],
    ["What does $t$ often represent in physics?", "Time."]
  ],
  "quiz": [
    {
      "q": "Eliminate $t$ from $x=e^t, y=e^{2t}$.",
      "opts": ["$y=2x$", "$y=x^2$", "$y=\\ln x$", "$y=2\\ln x$"],
      "ans": 1,
      "why": "$y = (e^t)^2 = x^2$."
    }
  ],
  "exam": [
    {
      "q": "A curve is defined by $x = 2\\sin \\theta, y = 3\\cos \\theta$. Find the Cartesian equation of the curve.",
      "marks": 3,
      "ms": [
        "$\\sin \\theta = x/2$ and $\\cos \\theta = y/3$. (1)",
        "Using $\\sin^2 \\theta + \\cos^2 \\theta = 1$. (1)",
        "$(x/2)^2 + (y/3)^2 = 1 \\implies \\frac{x^2}{4} + \\frac{y^2}{9} = 1$. (1)"
      ]
    }
  ]
};

C["maths:3.4"] = {
  "notes": [
    { "h": "Parametric Modelling" },
    {
      "callout": {
        "t": "info",
        "h": "What is Parametric Modelling?",
        "body": "Using parametric equations to model real paths — a particle's trajectory, a projectile, or a mechanism. The parameter $t$ (time) gives the **position at each instant**, not just the overall curve shape."
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "Eliminating the Parameter — Standard Method",
        "body": [
          "1. Express $t$ from the simpler equation.",
          "2. Substitute into the other equation.",
          "3. Simplify to get the Cartesian form $y = f(x)$.",
          "**Or**: use a trig identity if $x = r\\cos t$, $y = r\\sin t$ → $x^2 + y^2 = r^2$."
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Example: Projectile",
          "m": "A ball: $x = 15t$, $y = 20t - 5t^2$. Find Cartesian equation.",
          "n": "From $x = 15t \\implies t = x/15$. Substitute: $y = 20(x/15) - 5(x/15)^2 = \\frac{4x}{3} - \\frac{x^2}{45}$."
        },
        {
          "h": "Example: Trig parametric",
          "m": "$x = 3\\cos t$, $y = 3\\sin t$. Find Cartesian.",
          "n": "Use $\\cos^2 t + \\sin^2 t = 1$: $(x/3)^2 + (y/3)^2 = 1 \\implies x^2 + y^2 = 9$. This is a circle, radius 3."
        }
      ]
    },
    {
      "callout": {
        "t": "warn",
        "h": "Domain Restriction",
        "body": "When converting to Cartesian, check the **domain of $x$** imposed by the parameter range. E.g. if $0 \\leq t \\leq 4$, $x=15t$ gives $0 \\leq x \\leq 60$. The Cartesian equation alone doesn't capture this."
      }
    }
  ],
  "flashcards": [
    ["Why use parametric modelling?", "It describes position at a specific time, not just the path."],
    ["Common parameter in physical models?", "$t$ (time)."],
    ["How to find when a projectile hits the ground?", "Set the $y(t)$ equation to zero."],
    ["How to find initial position in a parametric model?", "Set $t=0$."],
    ["What represents horizontal displacement?", "$x(t)$."],
    ["What represents vertical displacement?", "$y(t)$."]
  ],
  "quiz": [
    {
      "q": "Path $x=10t, y=20t-5t^2$. Find horizontal distance when $y=0$ (for $t>0$).",
      "opts": ["20", "40", "10", "5"],
      "ans": 1,
      "why": "$y=0 \\implies 5t(4-t)=0 \\implies t=4$. $x=10(4)=40$."
    }
  ],
  "exam": [
    {
      "q": "A particle moves such that $x = 5t, y = 20t - 4.9t^2$. Find the maximum height reached.",
      "marks": 3,
      "ms": [
        "Max height when $v_y = dy/dt = 0$. (1)",
        "$20 - 9.8t = 0 \\implies t \\approx 2.04$. (1)",
        "$y(2.04) = 20(2.04) - 4.9(2.04)^2 \\approx 20.4m$. (1)"
      ]
    }
  ]
};

C["maths:4.1"] = {
  "notes": [
    { "h": "Binomial Expansion (Rational $n$)" },
    {
      "callout": {
        "t": "formula",
        "h": "The Formula",
        "body": "$$(1+x)^n = 1 + nx + \\frac{n(n-1)}{2!}x^2 + \\frac{n(n-1)(n-2)}{3!}x^3 + \\dots$$",
        "footer": "Valid for $|x| < 1$."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Important Requirement",
        "body": "The first term in the bracket MUST be 1. If you have $(a+bx)^n$, you must factor out $a^n$ first: $a^n(1 + \\frac{b}{a}x)^n$."
      }
    }
  ],
  "flashcards": [
    ["Validity condition for $(1+x)^n$?", "$|x| < 1$."],
    ["First three terms of $(1+x)^{-1}$?", "$1 - x + x^2$."],
    ["First three terms of $(1+x)^{1/2}$?", "$1 + \\frac{1}{2}x - \\frac{1}{8}x^2$."],
    ["Factor to extract from $(4+x)^n$?", "$4^n$."],
    ["What is $n!$ (factorial)?", "Product of all integers from 1 to $n$."],
    ["Validity of $(1-2x)^{1/2}$ expansion?", "$|-2x| < 1 \\implies |x| < 1/2$."]
  ],
  "quiz": [
    {
      "q": "What is the third term in the expansion of $(1+x)^{1/2}$?",
      "opts": ["$\\frac{1}{2}x$", "$-\\frac{1}{4}x^2$", "$-\\frac{1}{8}x^2$", "$\\frac{3}{8}x^2$"],
      "ans": 2,
      "why": "$\\frac{(1/2)(-1/2)}{2}x^2 = -1/8 x^2$."
    }
  ],
  "exam": [
    {
      "q": "Expand $(1-3x)^{-2}$ up to the term in $x^2$, stating the range of validity.",
      "marks": 4,
      "ms": [
        "$1 + (-2)(-3x) + \\frac{(-2)(-3)}{2!}(-3x)^2$. (2)",
        "$1 + 6x + 27x^2$. (1)",
        "Validity: $|-3x| < 1 \\implies |x| < 1/3$. (1)"
      ]
    }
  ]
};

C["maths:4.2"] = {
  "notes": [
    { "h": "Sequences & Recurrence" },
    {
      "callout": {
        "t": "info",
        "body": "A sequence where each term is defined in relation to previous terms. $u_{n+1} = f(u_n)$."
      }
    },
    {
      "kv": [
        ["Convergent", "Sequence approaches a limit $L$."],
        ["Divergent", "Sequence grows without bound or oscillates."],
        ["Periodic", "Terms repeat in a cycle: $u_{n+k} = u_n$."]
      ]
    }
  ],
  "flashcards": [
    ["What is a recurrence relation?", "Defining a term using previous terms, e.g., $u_{n+1} = 2u_n + 1$."],
    ["What is a periodic sequence?", "A sequence that repeats its values after a fixed interval."],
    ["How to find the limit $L$ of a convergent sequence?", "Solve $L = f(L)$."],
    ["Meaning of $u_1$?", "The first term of the sequence."],
    ["Generate first 3 terms: $u_{n+1} = u_n^2, u_1 = 2$.", "2, 4, 16."],
    ["Order of a periodic sequence $1, 2, 1, 2...$?", "2."]
  ],
  "quiz": [
    {
      "q": "Find the limit of the sequence $u_{n+1} = 0.5u_n + 4$.",
      "opts": ["4", "8", "2", "No limit"],
      "ans": 1,
      "why": "$L = 0.5L + 4 \\implies 0.5L = 4 \\implies L = 8$."
    }
  ],
  "exam": [
    {
      "q": "A sequence is defined by $u_{n+1} = k u_n + 3$, $u_1 = 2$. Given $u_3 = 13$, find the possible values of $k$.",
      "marks": 4,
      "ms": [
        "$u_2 = 2k + 3$. (1)",
        "$u_3 = k(2k+3) + 3 = 13$. (1)",
        "$2k^2 + 3k - 10 = 0$. (1)",
        "$(2k+5)(k-2) = 0 \\implies k=2$ or $k=-2.5$. (1)"
      ]
    }
  ]
};

C["maths:4.3"] = {
  "notes": [
    { "h": "Sigma Notation" },
    {
      "callout": {
        "t": "info",
        "h": "Definition",
        "body": "$$\\sum_{r=k}^{n} f(r)$$ Sum of terms $f(r)$ from $r=k$ to $r=n$."
      }
    },
    {
      "callout": {
        "t": "tip",
        "body": "The number of terms in the sum is $(n - k + 1)$."
      }
    }
  ],
  "flashcards": [
    ["What does $\\sum$ stand for?", "Summation."],
    ["Number of terms in $\\sum_{r=1}^{10} r$?", "10."],
    ["Number of terms in $\\sum_{r=5}^{15} f(r)$?", "$15 - 5 + 1 = 11$."],
    ["Evaluate $\\sum_{r=1}^{4} 2r$.", "$2+4+6+8 = 20$."],
    ["$\\sum_{r=1}^{n} k$ where $k$ is constant?", "$nk$."],
    ["Linear property: $\\sum (ar+b)$?", "$a\\sum r + \\sum b$."]
  ],
  "quiz": [
    {
      "q": "Evaluate $\\sum_{r=1}^{3} r^2$.",
      "opts": ["6", "14", "9", "13"],
      "ans": 1,
      "why": "$1^2 + 2^2 + 3^2 = 1 + 4 + 9 = 14$."
    }
  ],
  "exam": [
    {
      "q": "Show that $\\sum_{r=1}^{n} (2r-1) = n^2$.",
      "marks": 3,
      "ms": [
        "Identify as an arithmetic series with $a=1, d=2$. (1)",
        "$S_n = \\frac{n}{2}(2(1) + (n-1)2)$. (1)",
        "$S_n = \\frac{n}{2}(2 + 2n - 2) = \\frac{n}{2}(2n) = n^2$. (1)"
      ]
    }
  ]
};

C["maths:4.4"] = {
  "notes": [
    { "h": "Arithmetic Sequences & Series" },
    {
      "callout": {
        "t": "formula",
        "h": "Key Formulae",
        "body": [
          "nth term: $u_n = a + (n-1)d$",
          "Sum: $S_n = \\frac{n}{2}(2a + (n-1)d)$",
          "Alternative Sum: $S_n = \\frac{n}{2}(a + l)$ where $l$ is the last term."
        ]
      }
    }
  ],
  "flashcards": [
    ["Formula for the $n$th term of an AP?", "$a + (n-1)d$."],
    ["Formula for the sum of an AP?", "$n/2 [2a + (n-1)d]$."],
    ["What is $d$ in an AP?", "The common difference."],
    ["Sum of first $n$ integers?", "$n(n+1)/2$."],
    ["If $a=5, d=3$, what is $u_{10}$?", "$5 + 9(3) = 32$."],
    ["Common difference of $10, 7, 4...$?", "$-3$."]
  ],
  "quiz": [
    {
      "q": "An AP has $a=10$ and $d=2$. Find $S_{20}$.",
      "opts": ["480", "580", "500", "400"],
      "ans": 1,
      "why": "$20/2 [20 + 19(2)] = 10 [20 + 38] = 580$."
    }
  ],
  "exam": [
    {
      "q": "In an arithmetic series, the 4th term is 18 and the 10th term is 42. Find the sum of the first 20 terms.",
      "marks": 5,
      "ms": [
        "$a+3d=18$ and $a+9d=42$. (1)",
        "Subtract: $6d=24 \\implies d=4$. (1)",
        "$a+12=18 \\implies a=6$. (1)",
        "$S_{20} = \\frac{20}{2}(2(6) + 19(4))$. (1)",
        "$10(12+76) = 880$. (1)"
      ]
    }
  ]
};

C["maths:4.5"] = {
  "notes": [
    { "h": "Geometric Sequences & Series" },
    {
      "callout": {
        "t": "formula",
        "h": "Key Formulae",
        "body": [
          "nth term: $u_n = ar^{n-1}$",
          "Sum: $S_n = \\frac{a(1-r^n)}{1-r}$",
          "Sum to infinity: $S_{\\infty} = \\frac{a}{1-r}$ (if $|r| < 1$)"
        ]
      }
    }
  ],
  "flashcards": [
    ["Formula for the $n$th term of a GP?", "$ar^{n-1}$."],
    ["Condition for a GP to converge to infinity?", "$|r| < 1$."],
    ["Formula for sum to infinity?", "$a/(1-r)$."],
    ["What is $r$ in a GP?", "Common ratio."],
    ["If $a=3, r=2$, what is $u_5$?", "$3 \\times 2^4 = 48$."],
    ["Sum of $1 + 1/2 + 1/4 + \\dots$?", "$1/(1-0.5) = 2$."]
  ],
  "quiz": [
    {
      "q": "Find the common ratio $r$ of the GP: $8, 12, 18, \\dots$",
      "opts": ["$4$", "$1.5$", "$2$", "$0.66$"],
      "ans": 1,
      "why": "$12/8 = 1.5$."
    }
  ],
  "exam": [
    {
      "q": "The first term of a GP is 10 and the sum to infinity is 50. Find the common ratio $r$.",
      "marks": 3,
      "ms": [
        "$\\frac{10}{1-r} = 50$. (1)",
        "$10 = 50 - 50r \\implies 50r = 40$. (1)",
        "$r = 0.8$. (1)"
      ]
    }
  ]
};

C["maths:4.6"] = {
  "notes": [
    { "h": "Series in Modelling" },
    {
      "callout": {
        "t": "info",
        "body": "Applying AP and GP to financial growth, depreciation, and periodic processes."
      }
    },
    {
      "table": {
        "head": ["Context", "Series Type", "Key Variable"],
        "rows": [
          ["Simple Interest", "Arithmetic", "$d$ = fixed interest amount."],
          ["Compound Interest", "Geometric", "$r = 1 + \\text{rate}$."],
          ["Depreciation", "Geometric", "$r = 1 - \\text{rate}$."],
          ["Salary Increase (fixed amount)", "Arithmetic", "$d$ = increase amount."]
        ]
      }
    }
  ],
  "flashcards": [
    ["Type of series for compound interest?", "Geometric."],
    ["Type of series for fixed annual salary increments?", "Arithmetic."],
    ["If a value drops by 10% each year, what is $r$?", "$0.9$."],
    ["Sum used for total savings over $n$ years?", "$S_n$."],
    ["Term used for value in year $n$?", "$u_n$."],
    ["Meaning of $r=1.05$ in a growth model?", "5% increase per period."]
  ],
  "quiz": [
    {
      "q": "Save $£100$ in month 1, $£110$ in month 2, adding $£10$ more each month. Total after 12 months?",
      "opts": ["$£1200$", "$£1860$", "$£2310$", "$£1500$"],
      "ans": 1,
      "why": "AP: $a=100, d=10, n=12$. $S_{12} = 6[200 + 11(10)] = 6(310) = 1860$."
    }
  ],
  "exam": [
    {
      "q": "A car was bought for $£20,000$. Its value depreciates by 15% each year. Find its value after 5 years.",
      "marks": 3,
      "ms": [
        "GP with $a=20000, r=0.85$. (1)",
        "Value after 5 years is $u_6$ or $20000 \\times 0.85^5$. (1)",
        "Result: $\\approx £8874$. (1)"
      ]
    }
  ]
};

C["maths:5.1"] = {
  "notes": [
    { "h": "Radian Measure" },
    {
      "callout": {
        "t": "info",
        "h": "Definition",
        "body": "1 radian is the angle subtended at the center of a circle by an arc equal in length to the radius."
      }
    },
    {
      "table": {
        "head": ["Feature", "Degrees", "Radians"],
        "rows": [
          ["Full Circle", "$360^\\circ$", "$2\\pi$"],
          ["Straight Line", "$180^\\circ$", "$\\pi$"],
          ["Right Angle", "$90^\\circ$", "$\\pi/2$"],
          ["Arc Length", "$\\frac{\\theta}{360} \\times 2\\pi r$", "$r\\theta$"],
          ["Sector Area", "$\\frac{\\theta}{360} \\times \\pi r^2$", "$\\frac{1}{2}r^2\\theta$"]
        ]
      }
    }
  ],
  "flashcards": [
    ["Convert $180^\\circ$ to radians.", "$\\pi$."],
    ["Formula for arc length in radians?", "$s = r\\theta$."],
    ["Formula for sector area in radians?", "$A = \\frac{1}{2}r^2\\theta$."],
    ["Convert $\\pi/3$ to degrees.", "$60^\\circ$."],
    ["Approximate value of 1 radian in degrees?", "$\\approx 57.3^\\circ$."],
    ["Length of arc for unit circle with angle $\\pi$?", "$\\pi$."]
  ],
  "quiz": [
    {
      "q": "Find the area of a sector with $r=6$ and $\\theta=0.5$ rad.",
      "opts": ["3", "9", "18", "1.5"],
      "ans": 1,
      "why": "$0.5 \\times 6^2 \\times 0.5 = 0.5 \\times 36 \\times 0.5 = 9$."
    }
  ],
  "exam": [
    {
      "q": "A sector of a circle has radius $r$ cm and angle $\\theta$ radians. Given the perimeter is $20$ cm and the area is $25$ cm$^2$, find $r$.",
      "marks": 5,
      "ms": [
        "$2r + r\\theta = 20 \\implies \\theta = (20-2r)/r$. (1)",
        "$\\frac{1}{2}r^2\\theta = 25$. (1)",
        "$\\frac{1}{2}r^2(\\frac{20-2r}{r}) = 25 \\implies \\frac{1}{2}r(20-2r) = 25$. (1)",
        "$10r - r^2 = 25 \\implies r^2 - 10r + 25 = 0$. (1)",
        "$(r-5)^2 = 0 \\implies r = 5$. (1)"
      ]
    }
  ]
};

C["maths:5.2"] = {
  "notes": [
    { "h": "Small Angle Approximations" },
    {
      "callout": {
        "t": "formula",
        "h": "When $\\theta \\approx 0$ (in radians)",
        "body": [
          "$\\sin \\theta \\approx \\theta$",
          "$\\tan \\theta \\approx \\theta$",
          "$\\cos \\theta \\approx 1 - \\frac{\\theta^2}{2}$"
        ]
      }
    }
  ],
  "flashcards": [
    ["$\\sin \\theta \\approx$ ?", "$\\theta$."],
    ["$\\tan \\theta \\approx$ ?", "$\\theta$."],
    ["$\\cos \\theta \\approx$ ?", "$1 - \\theta^2/2$."],
    ["Condition for these approximations?", "$\\theta$ is small AND in radians."],
    ["Approximate $\\sin(2\\theta)$?", "$2\\theta$."],
    ["Approximate $1 - \\cos \\theta$?", "$\\theta^2/2$."]
  ],
  "quiz": [
    {
      "q": "Approximate $\\frac{\\sin 3\\theta}{\\theta}$ for small $\\theta$.",
      "opts": ["1", "3", "$\\theta$", "0"],
      "ans": 1,
      "why": "$\\sin 3\\theta \\approx 3\\theta \\implies 3\\theta / \\theta = 3$."
    }
  ],
  "exam": [
    {
      "q": "Show that for small $\\theta$, $\\frac{\\cos 4\\theta - 1}{\\theta \\sin 2\\theta} \\approx -4$.",
      "marks": 3,
      "ms": [
        "$\\cos 4\\theta \\approx 1 - \\frac{(4\\theta)^2}{2} = 1 - 8\\theta^2$. (1)",
        "$\\sin 2\\theta \\approx 2\\theta$. (1)",
        "$\\frac{1 - 8\\theta^2 - 1}{\\theta(2\\theta)} = \\frac{-8\\theta^2}{2\\theta^2} = -4$. (1)"
      ]
    }
  ]
};

C["maths:5.3"] = {
  "notes": [
    { "h": "Trig Functions (Sec, Cosec, Cot)" },
    {
      "callout": {
        "t": "info",
        "h": "Definitions",
        "body": [
          "$\\sec x = \\frac{1}{\\cos x}$",
          "$\\csc x = \\frac{1}{\\sin x}$",
          "$\\cot x = \\frac{1}{\\tan x} = \\frac{\\cos x}{\\sin x}$"
        ]
      }
    },
    {
      "table": {
        "head": ["Function", "Asymptotes", "Range"],
        "rows": [
          ["$\\sec x$", "$\\cos x = 0$", "$y \\ge 1$ or $y \\le -1$"],
          ["$\\csc x$", "$\\sin x = 0$", "$y \\ge 1$ or $y \\le -1$"],
          ["$\\cot x$", "$\\tan x = 0$ or undefined", "All real $y$"]
        ]
      }
    }
  ],
  "flashcards": [
    ["$\\sec x$ is reciprocal of...?", "$\\cos x$."],
    ["$\\csc x$ is reciprocal of...?", "$\\sin x$."],
    ["$\\cot x$ is reciprocal of...?", "$\\tan x$."],
    ["Value of $\\sec 0$?", "1."],
    ["Where is $\\csc x$ undefined?", "Where $\\sin x = 0$ (e.g., $0, \\pi, 2\\pi$)."],
    ["Range of $\\sec x$?", "$(-\\infty, -1] \\cup [1, \\infty)$."]
  ],
  "quiz": [
    {
      "q": "Which function is undefined at $x = \\pi/2$?",
      "opts": ["$\\csc x$", "$\\sec x$", "$\\cot x$", "All of them"],
      "ans": 1,
      "why": "$\\cos(\\pi/2) = 0$, so $\\sec(\\pi/2)$ is undefined."
    }
  ],
  "exam": [
    {
      "q": "Sketch the graph of $y = \\sec x$ for $0 \\le x \\le 2\\pi$.",
      "marks": 3,
      "ms": [
        "Correct shape with 'U' and 'n' curves. (1)",
        "Asymptotes at $x = \\pi/2$ and $x = 3\\pi/2$. (1)",
        "Intercepts at $(0, 1), (\\pi, -1), (2\\pi, 1)$. (1)"
      ]
    }
  ]
};

C["maths:5.4"] = {
  "notes": [
    { "h": "Inverse Trig Functions" },
    {
      "callout": {
        "t": "info",
        "body": "$\\arcsin x$, $\\arccos x$, and $\\arctan x$. Domains must be restricted for these to be functions."
      }
    },
    {
      "table": {
        "head": ["Function", "Domain", "Range (Principal Value)"],
        "rows": [
          ["$\\arcsin x$", "$[-1, 1]$", "$[-\\pi/2, \\pi/2]$"],
          ["$\\arccos x$", "$[-1, 1]$", "$[0, \\pi]$"],
          ["$\\arctan x$", "All real numbers", "$(-\\pi/2, \\pi/2)$"]
        ]
      }
    }
  ],
  "flashcards": [
    ["Domain of $\\arcsin x$?", "$[-1, 1]$."],
    ["Range of $\\arccos x$?", "$[0, \\pi]$."],
    ["Alternative notation for $\\arcsin x$?", "$\\sin^{-1} x$."],
    ["Value of $\\arctan 1$ in radians?", "$\\pi/4$."],
    ["Value of $\\arccos 0$?", "$\\pi/2$."],
    ["Is $\\arctan x$ bounded?", "Yes, between $\\pm \\pi/2$."]
  ],
  "quiz": [
    {
      "q": "Find $\\arcsin(-0.5)$ in radians.",
      "opts": ["$\\pi/6$", "$-\\pi/6$", "$5\\pi/6$", "$\\pi/3$"],
      "ans": 1,
      "why": "Principal range for $\\arcsin$ is $[-\\pi/2, \\pi/2]$."
    }
  ],
  "exam": [
    {
      "q": "Sketch $y = \\arctan x$.",
      "marks": 3,
      "ms": [
        "Correct S-shape passing through origin. (1)",
        "Horizontal asymptotes at $y = \\pi/2$ and $y = -\\pi/2$. (2)"
      ]
    }
  ]
};

C["maths:5.5"] = {
  "notes": [
    { "h": "Trig Identities" },
    {
      "callout": {
        "t": "formula",
        "h": "The Three Pythagorean Identities",
        "body": [
          "$\\sin^2 x + \\cos^2 x = 1$ ← the master identity",
          "$1 + \\tan^2 x = \\sec^2 x$ ← divide master by $\\cos^2 x$",
          "$1 + \\cot^2 x = \\csc^2 x$ ← divide master by $\\sin^2 x$"
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Deriving the others from memory",
        "body": "You only need to memorise $\\sin^2 x + \\cos^2 x = 1$. Divide every term by $\\cos^2 x$ to get $\\tan^2 x + 1 = \\sec^2 x$. Divide by $\\sin^2 x$ to get $1 + \\cot^2 x = \\csc^2 x$."
      }
    },
    { "h": "Rearrangements to recognise" },
    {
      "kv": [
        ["$\\sin^2 x = 1 - \\cos^2 x$", "Rearrangement 1 of master identity"],
        ["$\\cos^2 x = 1 - \\sin^2 x$", "Rearrangement 2 of master identity"],
        ["$\\tan^2 x = \\sec^2 x - 1$", "Rearrangement of second identity"],
        ["$\\cot^2 x = \\csc^2 x - 1$", "Rearrangement of third identity"]
      ]
    },
    {
      "callout": {
        "t": "warn",
        "h": "Common Proof Mistake",
        "body": "Never manipulate both sides simultaneously in a proof. Start from one side (usually the more complex side) and show it equals the other. Use $\\sin^2 x + \\cos^2 x = 1$ as a substitution tool at every step."
      }
    }
  ],
  "flashcards": [
    ["$\\sin^2 x + \\cos^2 x =$ ?", "1."],
    ["What does $1 + \\tan^2 x$ equal?", "$\\sec^2 x$."],
    ["What does $1 + \\cot^2 x$ equal?", "$\\csc^2 x$."],
    ["Express $\\tan x$ in terms of $\\sin$ and $\\cos$.", "$\\sin x / \\cos x$."],
    ["Express $\\cot x$ in terms of $\\sin$ and $\\cos$.", "$\\cos x / \\sin x$."],
    ["Simplify $(\\sec^2 x - 1) / \\tan x$.", "$\\tan x$."]
  ],
  "quiz": [
    {
      "q": "Simplify $5\\sin^2 x + 5\\cos^2 x$.",
      "opts": ["1", "5", "$5\\tan^2 x$", "$10$"],
      "ans": 1,
      "why": "$5(\\sin^2 x + \\cos^2 x) = 5(1) = 5$."
    }
  ],
  "exam": [
    {
      "q": "Prove the identity $\\frac{1}{\\tan x + \\cot x} = \\sin x \\cos x$.",
      "marks": 3,
      "ms": [
        "$\\tan x + \\cot x = \\frac{\\sin x}{\\cos x} + \\frac{\\cos x}{\\sin x}$. (1)",
        "Combine: $\\frac{\\sin^2 x + \\cos^2 x}{\\sin x \\cos x} = \\frac{1}{\\sin x \\cos x}$. (1)",
        "Reciprocal: $1 \\div \\frac{1}{\\sin x \\cos x} = \\sin x \\cos x$. (1)"
      ]
    }
  ]
};

C["maths:5.6"] = {
  "notes": [
    { "h": "Addition & Double Angle Formulae" },
    {
      "callout": {
        "t": "formula",
        "h": "Addition Formulae",
        "body": [
          "$\\sin(A \\pm B) = \\sin A \\cos B \\pm \\cos A \\sin B$",
          "$\\cos(A \\pm B) = \\cos A \\cos B \\mp \\sin A \\sin B$",
          "$\\tan(A \\pm B) = \\frac{\\tan A \\pm \\tan B}{1 \\mp \\tan A \\tan B}$"
        ]
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "Double Angle Formulae",
        "body": [
          "$\\sin 2A = 2\\sin A \\cos A$",
          "$\\cos 2A = \\cos^2 A - \\sin^2 A = 2\\cos^2 A - 1 = 1 - 2\\sin^2 A$",
          "$\\tan 2A = \\frac{2\\tan A}{1 - \\tan^2 A}$"
        ]
      }
    }
  ],
  "flashcards": [
    ["$\\sin 2x =$ ?", "$2\\sin x \\cos x$."],
    ["Three forms of $\\cos 2x$?", "$\\cos^2 x - \\sin^2 x$, $2\\cos^2 x - 1$, $1 - 2\\sin^2 x$."],
    ["$\\tan 2x =$ ?", "$2\\tan x / (1 - \\tan^2 x)$."],
    ["$\\sin(A+B) =$ ?", "$\\sin A \\cos B + \\cos A \\sin B$."],
    ["$\\cos(A+B) =$ ?", "$\\cos A \\cos B - \\sin A \\sin B$."],
    ["What is $\\cos^2 x$ in terms of $\\cos 2x$?", "$\\frac{1 + \\cos 2x}{2}$."]
  ],
  "quiz": [
    {
      "q": "Simplify $2\\sin 15^\\circ \\cos 15^\\circ$.",
      "opts": ["$\\sin 30^\\circ$", "$\\cos 30^\\circ$", "$\\sin 15^\\circ$", "1"],
      "ans": 0,
      "why": "Double angle formula for sine."
    }
  ],
  "exam": [
    {
      "q": "Solve $\\sin 2x = \\cos x$ for $0 \\le x < 2\\pi$.",
      "marks": 4,
      "ms": [
        "$2\\sin x \\cos x = \\cos x \\implies \\cos x(2\\sin x - 1) = 0$. (1)",
        "$\\cos x = 0 \\implies x = \\pi/2, 3\\pi/2$. (1)",
        "$2\\sin x = 1 \\implies \\sin x = 1/2 \\implies x = \\pi/6, 5\\pi/6$. (1)",
        "All four solutions. (1)"
      ]
    }
  ]
};

C["maths:5.7"] = {
  "notes": [
    { "h": "$R\\cos(x \\pm \\alpha)$ and $R\\sin(x \\pm \\alpha)$" },
    {
      "callout": {
        "t": "info",
        "body": "Expressing $a\\sin x + b\\cos x$ as a single trigonometric function. $R = \\sqrt{a^2 + b^2}$ and $\\tan \\alpha = b/a$ (or $a/b$ depending on target form)."
      }
    },
    {
      "steps": [
        {
          "h": "Converting to Harmonic Form",
          "m": "Express $3\\sin x + 4\\cos x$ as $R\\sin(x+\\alpha)$.\n1. $R = \\sqrt{3^2 + 4^2} = 5$.\n2. $5(\\sin x \\cos \\alpha + \\cos x \\sin \\alpha) = 3\\sin x + 4\\cos x$.\n3. $5\\cos \\alpha = 3, 5\\sin \\alpha = 4 \\implies \\tan \\alpha = 4/3$.\n4. $\\alpha = 53.1^\\circ$. Result: $5\\sin(x + 53.1^\\circ)$.",
          "n": "This form is used to find max/min values of the expression."
        }
      ]
    }
  ],
  "flashcards": [
    ["Formula for $R$ in harmonic form?", "$\\sqrt{a^2 + b^2}$."],
    ["Maximum value of $R\\sin(x+\\alpha)$?", "$R$."],
    ["Minimum value of $R\\cos(x-\\alpha)$?", "$-R$."],
    ["How to find $\\alpha$?", "Usually $\\tan \\alpha = b/a$ (match coefficients)."],
    ["Solve $R\\sin(x+\\alpha) = k$.", "$\\sin(x+\\alpha) = k/R$ then use arcsin."],
    ["When is $R\\cos(x-\\alpha)$ maximum?", "When $x-\\alpha = 0 \\implies x = \\alpha$."]
  ],
  "quiz": [
    {
      "q": "Find the maximum value of $12\\cos x - 5\\sin x$.",
      "opts": ["7", "17", "13", "144"],
      "ans": 2,
      "why": "$R = \\sqrt{12^2 + 5^2} = \\sqrt{144+25} = 13$."
    }
  ],
  "exam": [
    {
      "q": "Express $2\\cos x + 5\\sin x$ in the form $R\\cos(x-\\alpha)$ where $R>0, 0<\\alpha<90^\\circ$. Hence solve $2\\cos x + 5\\sin x = 3$ for $0<x<360^\\circ$.",
      "marks": 6,
      "ms": [
        "$R = \\sqrt{2^2+5^2} = \\sqrt{29} \\approx 5.39$. (1)",
        "$\\tan \\alpha = 5/2 \\implies \\alpha = 68.2^\\circ$. (1)",
        "$\\sqrt{29}\\cos(x-68.2) = 3 \\implies \\cos(x-68.2) = 3/\\sqrt{29} \\approx 0.557$. (1)",
        "$x-68.2 = 56.1$ or $x-68.2 = -56.1$ (or $303.9$). (1)",
        "$x = 124.3^\\circ, 12.1^\\circ$. (2)"
      ]
    }
  ]
};

C["maths:5.8"] = {
  "notes": [
    { "h": "Trig Equations" },
    {
      "callout": {
        "t": "info",
        "body": "Solving equations involving $\\sin, \\cos, \\tan$. Always check the specified interval (e.g., $0 \\le x < 2\\pi$)."
      }
    },
    {
      "steps": [
        {
          "h": "Solving $\\sin(3x) = 0.5$ in $0 \\le x < 180^\\circ$",
          "m": "1. Range for $3x$: $0 \\le 3x < 540^\\circ$.\n2. $3x = \\arcsin(0.5) = 30^\\circ, 150^\\circ, 390^\\circ, 510^\\circ$.\n3. Divide by 3: $x = 10^\\circ, 50^\\circ, 130^\\circ, 170^\\circ$.",
          "n": "Don't forget to expand the interval for the transformed variable."
        }
      ]
    }
  ],
  "flashcards": [
    ["First step in solving $\\sin x = 0.5$?", "Find the principal value $\\arcsin(0.5) = 30^\\circ$."],
    ["How to find other solutions for $\\sin$?", "$180 - \\theta$ and $\\pm 360$."],
    ["How to find other solutions for $\\cos$?", "$360 - \\theta$ and $\\pm 360$."],
    ["How to find other solutions for $\\tan$?", "$\\theta + 180$ and $\\pm 180$."],
    ["Interval for $2x$ if $0 \\le x < 180$?", "$0 \\le 2x < 360$."],
    ["General solution for $\\cos x = \\alpha$?", "$2n\\pi \\pm \\arccos \\alpha$."]
  ],
  "quiz": [
    {
      "q": "How many solutions for $\\cos x = 0.1$ in $0 \\le x < 2\\pi$?",
      "opts": ["1", "2", "0", "Infinite"],
      "ans": 1,
      "why": "Cosine crosses 0.1 twice in one period."
    }
  ],
  "exam": [
    {
      "q": "Solve $2\\cos^2 x + \\sin x - 1 = 0$ for $0 \\le x < 360^\\circ$.",
      "marks": 5,
      "ms": [
        "$2(1-\\sin^2 x) + \\sin x - 1 = 0 \\implies 2 - 2\\sin^2 x + \\sin x - 1 = 0$. (1)",
        "$2\\sin^2 x - \\sin x - 1 = 0$. (1)",
        "$(2\\sin x + 1)(\\sin x - 1) = 0$. (1)",
        "$\\sin x = 1 \\implies x = 90^\\circ$. (1)",
        "$\\sin x = -0.5 \\implies x = 210^\\circ, 330^\\circ$. (1)"
      ]
    }
  ]
};

C["maths:5.9"] = {
  "notes": [
    { "h": "Trig Modelling" },
    {
      "callout": {
        "t": "info",
        "body": "Modelling periodic phenomena such as tides, pendulums, or Ferris wheels using sine or cosine functions."
      }
    },
    {
      "callout": {
        "t": "formula",
        "body": "$$y = A\\sin(B(x-C)) + D$$",
        "footer": "A: Amplitude, B: Freq factor ($360/Period$), C: Phase shift, D: Vertical shift."
      }
    }
  ],
  "flashcards": [
    ["What does amplitude represent in a tide model?", "Half the distance between high and low tide."],
    ["What does $D$ represent in $y = A\\sin x + D$?", "The mean (average) level."],
    ["Formula for period in terms of $B$ (degrees)?", "$360/B$."],
    ["How to find the first time a height is reached?", "Set equation to the height and solve for $t$."],
    ["Typical function for a Ferris wheel height?", "Cosine (usually starting at max or min)."],
    ["What is the frequency?", "$1/Period$."]
  ],
  "quiz": [
    {
      "q": "Tide height $h = 4 + 2\\sin(30t)$. What is the max height?",
      "opts": ["4", "2", "6", "30"],
      "ans": 2,
      "why": "Mean 4 + Amplitude 2 = 6."
    }
  ],
  "exam": [
    {
      "q": "The depth of water $D$ meters in a harbor is $D = 10 + 3\\sin(30t)$ where $t$ is hours after midnight. Find the first time after midnight when the depth is 8.5m.",
      "marks": 4,
      "ms": [
        "$10 + 3\\sin(30t) = 8.5 \\implies 3\\sin(30t) = -1.5$. (1)",
        "$\\sin(30t) = -0.5$. (1)",
        "$30t = 210^\\circ \\implies t = 7$. (1)",
        "Answer: 7:00 AM. (1)"
  ]
    }
  ]
};

C["maths:6.1"] = {
  "notes": [
    { "h": "Exponential Functions" },
    {
      "callout": {
        "t": "info",
        "h": "General Form",
        "body": "An exponential function is of the form $f(x) = a^x$, where $a > 0$. The variable is in the exponent."
      }
    },
    {
      "table": {
        "head": ["Feature", "For $a > 1$", "For $0 < a < 1$"],
        "rows": [
          ["Trend", "Exponential Growth", "Exponential Decay"],
          ["$y$-intercept", "$(0, 1)$", "$(0, 1)$"],
          ["Asymptote", "$y = 0$ (negative $x$-axis)", "$y = 0$ (positive $x$-axis)"],
          ["Domain", "All real $x$", "All real $x$"],
          ["Range", "$y > 0$", "$y > 0$"]
        ]
      }
    },
    {
      "kv": [
        ["$y = k a^x$", "Stretch vertically by scale factor $k$."],
        ["$y = a^{x-c}$", "Translation right by $c$ units."],
        ["$y = a^x + d$", "Translation up by $d$ units. Asymptote becomes $y = d$."]
      ]
    }
  ],
  "flashcards": [
    ["What is the $y$-intercept of $y = a^x$?", "$(0, 1)$."],
    ["What is the horizontal asymptote of $y = 3^x$?", "$y = 0$."],
    ["Does $y = a^x$ ever cross the $x$-axis?", "No, it is always positive ($y > 0$)."],
    ["Shape of $y = 0.5^x$?", "Exponential decay (decreasing)."],
    ["Effect of $k$ in $y = k a^x$?", "Vertical stretch scale factor $k$."],
    ["Where is the asymptote of $y = 2^x - 5$?", "$y = -5$."]
  ],
  "quiz": [
    {
      "q": "Which of these functions represents exponential decay?",
      "opts": ["$y = 2^x$", "$y = 1.1^x$", "$y = (0.9)^x$", "$y = e^x$"],
      "ans": 2,
      "why": "Base $0.9 < 1$ leads to decay."
    },
    {
      "q": "What is the $y$-intercept of $y = 3(2^x) + 4$?",
      "opts": ["4", "3", "7", "1"],
      "ans": 2,
      "why": "$3(2^0) + 4 = 3(1) + 4 = 7$."
    },
    {
      "q": "Find the asymptote of $y = 5 - e^{-x}$.",
      "opts": ["$y = 0$", "$y = 5$", "$y = -e$", "$y = -5$"],
      "ans": 1,
      "why": "As $x \\to \\infty, e^{-x} \\to 0$, so $y \\to 5$."
    },
    {
      "q": "The graph of $y = 2^x$ is translated by vector $(0, 3)$. New equation?",
      "opts": ["$y = 2^{x+3}$", "$y = 2^x + 3$", "$y = 2^{x-3}$", "$y = 5^x$"],
      "ans": 1,
      "why": "Vertical translation adds to the function."
    }
  ],
  "exam": [
    {
      "q": "Sketch the graph of $y = 4^x - 2$, showing the coordinates of the $y$-intercept and the equation of the asymptote.",
      "marks": 3,
      "ms": [
        "Correct exponential growth shape. (1)",
        "$y$-intercept at $(0, -1)$ since $4^0 - 2 = -1$. (1)",
        "Horizontal asymptote at $y = -2$. (1)"
      ]
    }
  ]
};

C["maths:6.2"] = {
  "notes": [
    { "h": "Logarithms" },
    {
      "callout": {
        "t": "info",
        "h": "Definition",
        "body": "The logarithm is the inverse of the exponential function. If $y = a^x$, then $\\log_a y = x$."
      }
    },
    {
      "kv": [
        ["$\\log_{10} x$", "Common logarithm, often written as $\\log x$."],
        ["$\\log_e x$", "Natural logarithm, written as $\\ln x$."],
        ["$\\log_a 1$", "Always $0$ (since $a^0 = 1$)."],
        ["$\\log_a a$", "Always $1$ (since $a^1 = a$)."]
      ]
    },
    {
      "steps": [
        {
          "h": "Converting Forms",
          "m": "Convert $\\log_2 8 = 3$ to exponential form.\n1. Base is 2.\n2. Exponent is 3.\n3. Result is 8.\n4. $2^3 = 8$.",
          "n": "The log value is the power to which the base must be raised."
        }
      ]
    }
  ],
  "flashcards": [
    ["Inverse of $y = 10^x$?", "$y = \\log_{10} x$."],
    ["Evaluate $\\log_3 9$.", "2."],
    ["Evaluate $\\log_5 125$.", "3."],
    ["Evaluate $\\log_2 (1/4)$.", "-2."],
    ["What is $\\log_a a$?", "1."],
    ["What is $\\log_a 1$?", "0."]
  ],
  "quiz": [
    {
      "q": "Evaluate $\\log_4 2$.",
      "opts": ["0.5", "2", "8", "-2"],
      "ans": 0,
      "why": "$4^{0.5} = \\sqrt{4} = 2$."
    },
    {
      "q": "Solve $\\log_x 64 = 3$.",
      "opts": ["4", "8", "2", "21.3"],
      "ans": 0,
      "why": "$x^3 = 64 \\implies x = 4$."
    },
    {
      "q": "What is the value of $\\log_{10} 0.01$?",
      "opts": ["2", "-2", "0.1", "-1"],
      "ans": 1,
      "why": "$10^{-2} = 1/100 = 0.01$."
    },
    {
      "q": "If $\\log_2 y = x$, express $y$ in terms of $x$.",
      "opts": ["$y = x^2$", "$y = 2^x$", "$y = \\log x / \\log 2$", "$y = 2x$"],
      "ans": 1,
      "why": "Definition of logarithm."
    }
  ],
  "exam": [
    {
      "q": "Find the value of $x$ such that $\\log_3 (2x - 1) = 2$.",
      "marks": 2,
      "ms": [
        "$2x - 1 = 3^2 = 9$. (1)",
        "$2x = 10 \\implies x = 5$. (1)"
      ]
    }
  ]
};

C["maths:6.3"] = {
  "notes": [
    { "h": "Laws of Logarithms" },
    {
      "callout": {
        "t": "formula",
        "h": "The Three Laws",
        "body": [
          "1. Multiplication: $\\log_a (xy) = \\log_a x + \\log_a y$",
          "2. Division: $\\log_a (\\frac{x}{y}) = \\log_a x - \\log_a y$",
          "3. Power: $\\log_a (x^k) = k \\log_a x$"
        ]
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Change of Base",
        "body": "$$\\log_a x = \\frac{\\log_b x}{\\log_b a}$$",
        "footer": "Useful for calculating logs with any base on a calculator."
      }
    }
  ],
  "flashcards": [
    ["Expand $\\log(ab)$.", "$\\log a + \\log b$."],
    ["Expand $\\log(a/b)$.", "$\\log a - \\log b$."],
    ["Expand $\\log(a^n)$.", "$n \\log a$."],
    ["Simplify $\\log 2 + \\log 5$.", "$\\log(10)$."],
    ["How to write $\\log_2 7$ using natural logs?", "$\\ln 7 / \\ln 2$."],
    ["Simplify $2 \\log x - \\log y$.", "$\\log(x^2/y)$."]
  ],
  "quiz": [
    {
      "q": "Simplify $\\log_a 12 - \\log_a 3$.",
      "opts": ["$\\log_a 9$", "$\\log_a 4$", "$\\log_a 36$", "4"],
      "ans": 1,
      "why": "Subtraction law: $\\log(12/3) = \\log 4$."
    },
    {
      "q": "Given $\\log p = A$ and $\\log q = B$, express $\\log(p^2 q)$ in terms of $A$ and $B$.",
      "opts": ["$2A + B$", "$A^2 + B$", "$2AB$", "$A+B+2$"],
      "ans": 0,
      "why": "$\\log p^2 + \\log q = 2\\log p + \\log q = 2A + B$."
    },
    {
      "q": "Which is equivalent to $\\log_2 10$?",
      "opts": ["$\\log 10 / \\log 2$", "$\\log 2 / \\log 10$", "$5$", "$\\log 5$"],
      "ans": 0,
      "why": "Change of base formula."
    },
    {
      "q": "Simplify $\\frac{1}{2} \\log 16$.",
      "opts": ["$\\log 8$", "$\\log 4$", "$\\log 256$", "8"],
      "ans": 1,
      "why": "$\\log(16^{0.5}) = \\log 4$."
    }
  ],
  "exam": [
    {
      "q": "Solve the equation $2\\log_3 x - \\log_3 (x-2) = 2$.",
      "marks": 4,
      "ms": [
        "$\\log_3 (\\frac{x^2}{x-2}) = 2$. (1)",
        "$\\frac{x^2}{x-2} = 3^2 = 9$. (1)",
        "$x^2 = 9x - 18 \\implies x^2 - 9x + 18 = 0$. (1)",
        "$(x-6)(x-3) = 0 \\implies x = 6$ or $x = 3$. (Both valid since $x>2$). (1)"
      ]
    }
  ]
};

C["maths:6.4"] = {
  "notes": [
    { "h": "Natural Logs & $e$" },
    {
      "callout": {
        "t": "info",
        "h": "Euler's Number $e$",
        "body": "$e \\approx 2.71828$. It is the unique base such that the gradient of $y=e^x$ at $(0,1)$ is exactly 1."
      }
    },
    {
      "kv": [
        ["Definition", "$\\ln x = \\log_e x$"],
        ["Inverse", "$e^{\\ln x} = x$ and $\\ln(e^x) = x$"],
        ["Key Value", "$\\ln e = 1$ and $\\ln 1 = 0$"],
        ["Derivative", "$\\frac{d}{dx}(e^x) = e^x$ (unique property)"]
      ]
    }
  ],
  "flashcards": [
    ["What is the base of natural logs?", "$e$."],
    ["Approximate value of $e$?", "2.718."],
    ["Evaluate $\\ln e$.", "1."],
    ["Evaluate $\\ln 1$.", "0."],
    ["What is the inverse of $f(x) = e^x$?", "$f^{-1}(x) = \\ln x$."],
    ["Simplify $e^{3\\ln x}$.", "$x^3$."]
  ],
  "quiz": [
    {
      "q": "Solve $e^x = 5$.",
      "opts": ["$x = \\ln 5$", "$x = 5/e$", "$x = \\log 5$", "$x = e^5$"],
      "ans": 0,
      "why": "Taking natural logs of both sides."
    },
    {
      "q": "Simplify $\\ln(e^{2x+1})$.",
      "opts": ["$2x+1$", "$e$", "$2x$", "$\\ln(2x+1)$"],
      "ans": 0,
      "why": "$\\ln$ and $e$ are inverse functions."
    },
    {
      "q": "If $\\ln x = 2$, what is $x$?",
      "opts": ["$e^2$", "2", "100", "$\\log 2$"],
      "ans": 0,
      "why": "Convert to exponential form: $x = e^2$."
    },
    {
      "q": "What is the gradient of $y = e^x$ at $x = 0$?",
      "opts": ["0", "1", "$e$", "undefined"],
      "ans": 1,
      "why": "The derivative is $e^x$, and $e^0 = 1$."
    }
  ],
  "exam": [
    {
      "q": "Find the exact coordinates of the point of intersection of the curves $y = 3e^x$ and $y = 1 - e^x$.",
      "marks": 3,
      "ms": [
        "$3e^x = 1 - e^x \\implies 4e^x = 1$. (1)",
        "$e^x = 1/4 \\implies x = \\ln(1/4)$ or $-\\ln 4$. (1)",
        "$y = 3(1/4) = 3/4$. Point is $(-\\ln 4, 0.75)$. (1)"
      ]
    }
  ]
};

C["maths:6.5"] = {
  "notes": [
    { "h": "Solving Equations with Logs" },
    {
      "callout": {
        "t": "info",
        "body": "Used to solve equations where the unknown is in the power, e.g., $a^x = b$."
      }
    },
    {
      "steps": [
        {
          "h": "Solving $a^x = b$",
          "m": "Solve $3^x = 20$.\n1. Take logs of both sides: $\\log(3^x) = \\log(20)$.\n2. Power law: $x \\log 3 = \\log 20$.\n3. Divide: $x = \\frac{\\log 20}{\\log 3}$.\n4. Calculate: $x \\approx 2.73$.",
          "n": "You can use any base, but $\\log_{10}$ or $\\ln$ are most common on calculators."
        }
      ]
    },
    {
      "callout": {
        "t": "warn",
        "h": "Quadratic Equations in $e^x$",
        "body": "Equations like $e^{2x} - 5e^x + 6 = 0$ can be solved by substituting $u = e^x$. This gives $u^2 - 5u + 6 = 0$."
      }
    }
  ],
  "flashcards": [
    ["How to solve $2^x = 10$?", "Take logs: $x\\log 2 = \\log 10 \\implies x = \\log 10 / \\log 2$."],
    ["Substitution for $e^{2x} + 3e^x - 4 = 0$?", "$u = e^x$."],
    ["Can you take the log of a negative number?", "No, the domain of $\\log(x)$ is $x > 0$."],
    ["Solve $5^x = 0.2$.", "$x = -1$ (since $5^{-1} = 1/5 = 0.2$)."],
    ["First step for $4^x = 7^{x+1}$?", "Take logs: $x \\log 4 = (x+1) \\log 7$."],
    ["Result of taking $\\ln$ of $e^k$?", "$k$."]
  ],
  "quiz": [
    {
      "q": "Solve $2^x = 32$.",
      "opts": ["5", "4", "16", "6"],
      "ans": 0,
      "why": "$2^5 = 32$."
    },
    {
      "q": "Solve $e^{2x} = 9$.",
      "opts": ["$\\ln 3$", "$\\ln 9$", "$\\ln 4.5$", "3"],
      "ans": 0,
      "why": "$2x = \\ln 9 \\implies x = 0.5 \\ln 9 = \\ln(9^{0.5}) = \\ln 3$."
    },
    {
      "q": "Solve $10^{2x-1} = 100$.",
      "opts": ["1.5", "1", "0.5", "2"],
      "ans": 0,
      "why": "$2x-1 = 2 \\implies 2x = 3 \\implies x = 1.5$."
    },
    {
      "q": "How many solutions for $e^x = -2$?",
      "opts": ["0", "1", "2", "infinite"],
      "ans": 0,
      "why": "Exponential functions are always positive."
    }
  ],
  "exam": [
    {
      "q": "Solve $3^{2x} - 10(3^x) + 9 = 0$.",
      "marks": 4,
      "ms": [
        "Let $u = 3^x \\implies u^2 - 10u + 9 = 0$. (1)",
        "$(u-9)(u-1) = 0 \\implies u=9, u=1$. (1)",
        "$3^x = 9 \\implies x = 2$. (1)",
        "$3^x = 1 \\implies x = 0$. (1)"
      ]
    }
  ]
};

C["maths:6.6"] = {
  "notes": [
    { "h": "Exponential Growth & Decay" },
    {
      "callout": {
        "t": "formula",
        "h": "General Model",
        "body": "$$N = N_0 e^{kt}$$",
        "footer": "$N_0$: initial value, $k$: growth/decay constant, $t$: time."
      }
    },
    {
      "kv": [
        ["$k > 0$", "Exponential Growth (e.g., population)"],
        ["$k < 0$", "Exponential Decay (e.g., radioactivity)"],
        ["Half-life", "Time taken for $N$ to reach $N_0/2$."]
      ]
    }
  ],
  "flashcards": [
    ["Formula for exponential growth?", "$N = N_0 e^{kt}$."],
    ["What does $N_0$ represent?", "Initial amount at $t=0$."],
    ["What sign is $k$ for radioactive decay?", "Negative."],
    ["What happens as $t \\to \\infty$ in a decay model?", "$N \\to 0$."],
    ["How to find doubling time?", "Set $N = 2N_0$ and solve for $t$."],
    ["Meaning of $e^{0.05t}$?", "5% continuous growth rate."]
  ],
  "quiz": [
    {
      "q": "Initial population 1000, growth rate $k=0.1$. Pop after 10 years?",
      "opts": ["$1000e$", "$1000e^{0.1}$", "$2000$", "$1100$"],
      "ans": 0,
      "why": "$1000 e^{(0.1 \\times 10)} = 1000e^1$."
    },
    {
      "q": "A substance decays: $M = 50e^{-0.2t}$. Initial mass?",
      "opts": ["50", "0", "$50e$", "25"],
      "ans": 0,
      "why": "At $t=0$, $M = 50e^0 = 50$."
    },
    {
      "q": "Which $k$ represents the fastest decay?",
      "opts": ["$k = -0.1$", "$k = -0.5$", "$k = 0.5$", "$k = 0$"],
      "ans": 1,
      "why": "Larger magnitude negative value means faster decay."
    },
    {
      "q": "Find half-life if $k = -0.693$.",
      "opts": ["1", "2", "0.5", "10"],
      "ans": 0,
      "why": "$e^{-0.693t} = 0.5 \\implies -0.693t = \\ln 0.5 \\approx -0.693 \\implies t=1$."
    }
  ],
  "exam": [
    {
      "q": "The temperature $\\theta$ of a coffee is $\\theta = 20 + 60e^{-0.05t}$ where $t$ is in minutes. Find the time taken for the coffee to cool to 40 degrees.",
      "marks": 4,
      "ms": [
        "$40 = 20 + 60e^{-0.05t} \\implies 20 = 60e^{-0.05t}$. (1)",
        "$e^{-0.05t} = 1/3$. (1)",
        "$-0.05t = \\ln(1/3) = -\\ln 3$. (1)",
        "$t = \\ln 3 / 0.05 \\approx 1.0986 / 0.05 \\approx 22$ minutes. (1)"
      ]
    }
  ]
};

C["maths:6.7"] = {
  "notes": [
    { "h": "Linearising Data" },
    {
      "callout": {
        "t": "info",
        "body": "Converting a non-linear relationship into a linear one by taking logarithms. This allows us to use $Y = mX + C$."
      }
    },
    {
      "table": {
        "head": ["Model", "Log Transformation", "Gradient ($m$)", "Intercept ($C$)"],
        "rows": [
          ["$y = ax^n$", "$\\log y = n \\log x + \\log a$", "$n$", "$\\log a$"],
          ["$y = ab^x$", "$\\log y = (\\log b)x + \\log a$", "$\\log b$", "$\\log a$"]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Finding Constants from a Graph",
          "m": "A graph of $\\log y$ against $\\log x$ is a straight line through $(0, 2)$ with gradient $3$.\n1. Relationship is $y = ax^n$.\n2. Intercept $C = \\log a = 2 \\implies a = 10^2 = 100$.\n3. Gradient $m = n = 3$.\n4. $y = 100x^3$.",
          "n": "Always check which axes are being used ($\\log x$ vs $x$)."
        }
      ]
    }
  ],
  "flashcards": [
    ["How to linearise $y = ax^n$?", "Plot $\\log y$ against $\\log x$."],
    ["How to linearise $y = ab^x$?", "Plot $\\log y$ against $x$."],
    ["Gradient of $\\log y$ vs $\\log x$ for $y = ax^n$?", "$n$."],
    ["Intercept of $\\log y$ vs $x$ for $y = ab^x$?", "$\\log a$."],
    ["If $\\log y$ vs $x$ is linear, what is the model?", "$y = ab^x$."],
    ["Value of $a$ if $\\log_{10} a = 3$?", "1000."]
  ],
  "quiz": [
    {
      "q": "For $y = 5x^2$, what is the gradient of the $\\log y$ against $\\log x$ graph?",
      "opts": ["2", "5", "$\\log 5$", "$\\log 2$"],
      "ans": 0,
      "why": "$n=2$ is the gradient."
    },
    {
      "q": "For $y = 3(2^x)$, what is plotted on the x-axis to get a straight line with $\\log y$?",
      "opts": ["$x$", "$\\log x$", "$2^x$", "$3x$"],
      "ans": 0,
      "why": "Exponential models require plotting against $x$."
    },
    {
      "q": "A line $\\ln y = 0.5x + 1.2$ represents which model?",
      "opts": ["$y = e^{1.2} e^{0.5x}$", "$y = 1.2x^{0.5}$", "$y = 0.5 e^{1.2x}$", "$y = e^{0.5} x^{1.2}$"],
      "ans": 0,
      "why": "$\\ln y = mx + C \\implies y = e^{mx+C} = e^C e^{mx}$."
    },
    {
      "q": "In $y = ax^n$, if the gradient is $-1$, what is the relationship?",
      "opts": ["Reciprocal ($y = a/x$)", "Negative linear", "Decay", "Constant"],
      "ans": 0,
      "why": "$n=-1 \\implies y = ax^{-1} = a/x$."
    }
  ],
  "exam": [
    {
      "q": "Variables $P$ and $t$ satisfy $P = ab^t$. A graph of $\\ln P$ against $t$ is a straight line passing through $(0, 4.5)$ and $(10, 7.5)$. Find $a$ and $b$ to 2 decimal places.",
      "marks": 4,
      "ms": [
        "$\\ln P = t \\ln b + \\ln a$. (1)",
        "$\\ln a = 4.5 \\implies a = e^{4.5} \\approx 90.02$. (1)",
        "$\\text{Gradient} = \\ln b = (7.5 - 4.5)/10 = 0.3$. (1)",
        "$b = e^{0.3} \\approx 1.35$. (1)"
      ]
    }
  ]
};

C["maths:7.1"] = {
  "notes": [
    { "h": "Basic Differentiation" },
    {
      "table": {
        "head": ["Function $f(x)$", "Derivative $f'(x)$", "Rule Name"],
        "rows": [
          ["$x^n$", "$nx^{n-1}$", "Power Rule"],
          ["$e^{ax}$", "$ae^{ax}$", "Exponential Rule"],
          ["$\\ln x$", "$1/x$", "Natural Log Rule"],
          ["$k$ (constant)", "0", "Constant Rule"],
          ["$af(x) + bg(x)$", "$af'(x) + bg'(x)$", "Linearity"]
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "First Principles",
        "body": "$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$"
      }
    }
  ],
  "flashcards": [
    ["Derivative of $x^5$?", "$5x^4$."],
    ["Derivative of $e^{2x}$?", "$2e^{2x}$."],
    ["Derivative of $\\ln x$?", "$1/x$."],
    ["Derivative of $1/x$?", "$-1/x^2$."],
    ["Derivative of $\\sqrt{x}$?", "$\\frac{1}{2\\sqrt{x}}$."],
    ["What does $f'(x)$ represent?", "The gradient of the curve at point $x$."]
  ],
  "quiz": [
    {
      "q": "Find $dy/dx$ if $y = 3x^4 - 2x + 5$.",
      "opts": ["$12x^3 - 2$", "$12x^3 - 2x$", "$7x^3 - 2$", "$12x^4 - 2$"],
      "ans": 0,
      "why": "Differentiate term by term."
    },
    {
      "q": "Find the gradient of $y = e^x$ at $x = \\ln 3$.",
      "opts": ["3", "$e^3$", "$\\ln 3$", "1"],
      "ans": 0,
      "why": "$dy/dx = e^x$. At $x = \\ln 3$, $e^{\\ln 3} = 3$."
    },
    {
      "q": "Differentiate $y = \\ln(3x)$.",
      "opts": ["$1/x$", "$3/x$", "$1/(3x)$", "3"],
      "ans": 0,
      "why": "$\\ln(3x) = \\ln 3 + \\ln x$. Derivative of constant $\\ln 3$ is 0."
    },
    {
      "q": "Derivative of $4/\\sqrt{x}$?",
      "opts": ["$-2x^{-3/2}$", "$2x^{-1/2}$", "$-2x^{1/2}$", "$-4x^{-3/2}$"],
      "ans": 0,
      "why": "$4x^{-1/2} \\to 4(-1/2)x^{-3/2} = -2x^{-3/2}$."
    }
  ],
  "exam": [
    {
      "q": "Find the equation of the tangent to the curve $y = x^2 + \\ln x$ at the point where $x=1$.",
      "marks": 4,
      "ms": [
        "At $x=1, y=1^2+\\ln 1 = 1$. Point is $(1, 1)$. (1)",
        "$dy/dx = 2x + 1/x$. (1)",
        "Gradient at $x=1$ is $2(1) + 1/1 = 3$. (1)",
        "Equation: $y - 1 = 3(x - 1) \\implies y = 3x - 2$. (1)"
      ]
    }
  ]
};

C["maths:7.2"] = {
  "notes": [
    { "h": "The Chain Rule" },
    {
      "callout": {
        "t": "formula",
        "h": "Definition",
        "body": "$$\\frac{dy}{dx} = \\frac{dy}{du} \\times \\frac{du}{dx}$$",
        "footer": "Used for composite functions $y = f(g(x))$."
      }
    },
    {
      "steps": [
        {
          "h": "Applying the Chain Rule",
          "m": "Differentiate $y = (3x^2 + 1)^5$.\n1. Let $u = 3x^2 + 1$. Then $y = u^5$.\n2. $du/dx = 6x$.\n3. $dy/du = 5u^4$.\n4. $dy/dx = 5(3x^2 + 1)^4 \\times 6x$.",
          "n": "Simplified: $30x(3x^2 + 1)^4$."
        }
      ]
    }
  ],
  "flashcards": [
    ["When to use the Chain Rule?", "For functions within functions (composite)."],
    ["Derivative of $[f(x)]^n$?", "$n[f(x)]^{n-1} \\times f'(x)$."],
    ["Derivative of $e^{f(x)}$?", "$f'(x) e^{f(x)}$."],
    ["Derivative of $\\ln(f(x))$?", "$f'(x) / f(x)$."],
    ["Derivative of $\\sqrt{x^2+1}$?", "$x/\\sqrt{x^2+1}$."],
    ["Chain rule for $dy/dx$ using $u$?", "$(dy/du) \\times (du/dx)$."]
  ],
  "quiz": [
    {
      "q": "Differentiate $y = \\ln(x^2 + 5)$.",
      "opts": ["$2x / (x^2 + 5)$", "$1 / (x^2 + 5)$", "$2x \\ln(x^2 + 5)$", "$2 / x$"],
      "ans": 0,
      "why": "Using $\\ln(u)$ rule: $u' / u$."
    },
    {
      "q": "Find $dy/dx$ for $y = e^{-x^2}$.",
      "opts": ["$-2x e^{-x^2}$", "$e^{-x^2}$", "$-2x e^{x^2}$", "$e^{-2x}$"],
      "ans": 0,
      "why": "Derivative of exponent is $-2x$."
    },
    {
      "q": "Differentiate $y = (2x+3)^{10}$.",
      "opts": ["$20(2x+3)^9$", "$10(2x+3)^9$", "$2(2x+3)^9$", "$20x^9$"],
      "ans": 0,
      "why": "$10(2x+3)^9 \\times 2 = 20(2x+3)^9$."
    },
    {
      "q": "Given $x = \\sin t, y = t^2$. Find $dy/dx$.",
      "opts": ["$2t / \\cos t$", "$2t \\cos t$", "$\\cos t / 2t$", "$2t$"],
      "ans": 0,
      "why": "$(dy/dt) / (dx/dt) = 2t / \\cos t$."
    }
  ],
  "exam": [
    {
      "q": "The curve $C$ has equation $y = \\sqrt{4x+1}$. Find the gradient of the normal to $C$ at the point where $x=2$.",
      "marks": 4,
      "ms": [
        "$y = (4x+1)^{1/2}$. $dy/dx = \\frac{1}{2}(4x+1)^{-1/2} \\times 4 = 2(4x+1)^{-1/2}$. (1)",
        "At $x=2, dy/dx = 2(9)^{-1/2} = 2/3$. (1)",
        "Gradient of tangent is $2/3$. (1)",
        "Gradient of normal is $-3/2$. (1)"
      ]
    }
  ]
};

C["maths:7.3"] = {
  "notes": [
    { "h": "The Product Rule" },
    {
      "callout": {
        "t": "formula",
        "h": "Definition",
        "body": "If $y = uv$, then $$\\frac{dy}{dx} = u\\frac{dv}{dx} + v\\frac{du}{dx}$$",
        "footer": "Used when two functions of $x$ are multiplied together."
      }
    },
    {
      "steps": [
        {
          "h": "Applying the Product Rule",
          "m": "Differentiate $y = x^2 e^x$.\n1. Let $u = x^2$ and $v = e^x$.\n2. $du/dx = 2x$ and $dv/dx = e^x$.\n3. $dy/dx = x^2(e^x) + e^x(2x)$.",
          "n": "Factorised: $x e^x (x + 2)$."
        }
      ]
    }
  ],
  "flashcards": [
    ["When to use the Product Rule?", "When two functions of $x$ are multiplied together."],
    ["Product rule formula?", "$u v' + v u'$"],
    ["Differentiate $x \\ln x$.", "$1 + \\ln x$."],
    ["Differentiate $x^3 e^{2x}$.", "$3x^2 e^{2x} + 2x^3 e^{2x}$."],
    ["Is the order of $u$ and $v$ important in Product Rule?", "No, because addition is commutative."],
    ["Differentiate $e^x \\sin x$.", "$e^x(\\sin x + \\cos x)$."]
  ],
  "quiz": [
    {
      "q": "Differentiate $y = x^2 \\ln x$.",
      "opts": ["$x + 2x \\ln x$", "$2 + 2x \\ln x$", "$x \\ln x$", "$x^2/x + 2x$"],
      "ans": 0,
      "why": "$x^2(1/x) + (\\ln x)(2x) = x + 2x \\ln x$."
    },
    {
      "q": "Find $dy/dx$ for $y = e^x \\cos x$.",
      "opts": ["$e^x(\\cos x - \\sin x)$", "$e^x(\\cos x + \\sin x)$", "$-e^x \\sin x$", "$e^x \\cos x$"],
      "ans": 0,
      "why": "$u=e^x, v=\\cos x \\implies e^x(-\\sin x) + \\cos x(e^x)$."
    },
    {
      "q": "Differentiate $y = x(x+1)^5$.",
      "opts": ["$(x+1)^4(6x+1)$", "$(x+1)^5 + 5x(x+1)^4$", "$5(x+1)^4$", "$(x+1)^5$"],
      "ans": 1,
      "why": "Product of $x$ and $(x+1)^5$. Result is $1(x+1)^5 + x[5(x+1)^4]$."
    },
    {
      "q": "Gradient of $y = x e^{-x}$ at $x = 0$.",
      "opts": ["1", "0", "-1", "$e$"],
      "ans": 0,
      "why": "$dy/dx = e^{-x} - x e^{-x}$. At $x=0$, $e^0 - 0 = 1$."
    }
  ],
  "exam": [
    {
      "q": "Find the stationary points of the curve $y = x^2 e^{-x}$.",
      "marks": 5,
      "ms": [
        "$dy/dx = 2x e^{-x} - x^2 e^{-x}$. (1)",
        "Set $dy/dx = 0 \\implies x e^{-x} (2 - x) = 0$. (1)",
        "$e^{-x} \\ne 0$, so $x = 0$ or $x = 2$. (1)",
        "At $x=0, y=0$. At $x=2, y=4/e^2 \\approx 0.54$. (1)",
        "Stationary points: $(0, 0)$ and $(2, 4/e^2)$. (1)"
      ]
    }
  ]
};

C["maths:7.4"] = {
  "notes": [
    { "h": "The Quotient Rule" },
    {
      "callout": {
        "t": "formula",
        "h": "Definition",
        "body": "If $y = \\frac{u}{v}$, then $$\\frac{dy}{dx} = \\frac{v\\frac{du}{dx} - u\\frac{dv}{dx}}{v^2}$$",
        "footer": "Used when one function of $x$ is divided by another."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Order Matters",
        "body": "In the numerator, you MUST start with $v \\frac{du}{dx}$. Reversing the order will lead to the wrong sign."
      }
    }
  ],
  "flashcards": [
    ["When to use the Quotient Rule?", "When functions of $x$ are in a fraction."],
    ["Quotient rule formula?", "$(v u' - u v') / v^2$"],
    ["Differentiate $\\frac{\\ln x}{x}$.", "$\\frac{1 - \\ln x}{x^2}$."],
    ["Differentiate $\\frac{e^x}{x}$.", "$\\frac{e^x(x-1)}{x^2}$."],
    ["What is $v^2$ in the derivative of $y = \\frac{3x+1}{x-2}$?", "$(x-2)^2$."],
    ["Derivative of $\\tan x$ using quotient rule?", "$\\sec^2 x$ (since $\\tan = \\sin/\\cos$)."]
  ],
  "quiz": [
    {
      "q": "Differentiate $y = \\frac{x}{x+1}$.",
      "opts": ["$1 / (x+1)^2$", "$(2x+1) / (x+1)^2$", "1", "$-1 / (x+1)^2$"],
      "ans": 0,
      "why": "$\\frac{(x+1)(1) - x(1)}{(x+1)^2} = \\frac{1}{(x+1)^2}$."
    },
    {
      "q": "Find $dy/dx$ for $y = \\frac{e^{2x}}{x^2}$.",
      "opts": ["$\\frac{2e^{2x}(x-1)}{x^3}$", "$\\frac{e^{2x}(2x-2)}{x^4}$", "$\\frac{2e^{2x}}{2x}$", "$\\frac{e^{2x}}{x^2}$"],
      "ans": 0,
      "why": "$\\frac{x^2(2e^{2x}) - e^{2x}(2x)}{x^4} = \\frac{2x e^{2x}(x-1)}{x^4}$."
    },
    {
      "q": "Derivative of $\\frac{3x+2}{2x-3}$.",
      "opts": ["$-13 / (2x-3)^2$", "$13 / (2x-3)^2$", "1.5", "$6 / 4$"],
      "ans": 0,
      "why": "$\\frac{(2x-3)(3) - (3x+2)(2)}{(2x-3)^2} = \\frac{6x-9-6x-4}{\\dots} = -13/\\dots$."
    },
    {
      "q": "Gradient of $y = \\frac{\\ln x}{x}$ at $x = e$.",
      "opts": ["0", "$1/e^2$", "$1/e$", "1"],
      "ans": 0,
      "why": "$(1 - \\ln x)/x^2$. At $x=e$, $1 - \\ln e = 0$."
    }
  ],
  "exam": [
    {
      "q": "Show that the derivative of $y = \\frac{\\cos x}{\\sin x}$ is $-\\csc^2 x$.",
      "marks": 3,
      "ms": [
        "Let $u = \\cos x, v = \\sin x$. $u' = -\\sin x, v' = \\cos x$. (1)",
        "$\\frac{dy}{dx} = \\frac{\\sin x(-\\sin x) - \\cos x(\\cos x)}{\\sin^2 x}$. (1)",
        "$= \\frac{-(\\sin^2 x + \\cos^2 x)}{\\sin^2 x} = \\frac{-1}{\\sin^2 x} = -\\csc^2 x$. (1)"
      ]
    }
  ]
};

C["maths:7.5"] = {
  "notes": [
    { "h": "Trigonometric Differentiation" },
    {
      "table": {
        "head": ["Function $f(x)$", "Derivative $f'(x)$"],
        "rows": [
          ["$\\sin x$", "$\\cos x$"],
          ["$\\cos x$", "$-\\sin x$"],
          ["$\\tan x$", "$\\sec^2 x$"],
          ["$\\sec x$", "$\\sec x \\tan x$"],
          ["$\\csc x$", "$-\\csc x \\cot x$"],
          ["$\\cot x$", "$-\\csc^2 x$"]
        ]
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Standard Chains",
        "body": [
          "$\\frac{d}{dx}(\\sin ax) = a\\cos ax$",
          "$\\frac{d}{dx}(\\cos ax) = -a\\sin ax$",
          "$\\frac{d}{dx}(\\tan ax) = a\\sec^2 ax$"
        ]
      }
    }
  ],
  "flashcards": [
    ["Derivative of $\\sin x$?", "$\\cos x$."],
    ["Derivative of $\\cos x$?", "$-\\sin x$."],
    ["Derivative of $\\tan x$?", "$\\sec^2 x$."],
    ["Derivative of $\\sin(2x)$?", "$2\\cos(2x)$."],
    ["Derivative of $\\cos(x^2)$?", "$-2x\\sin(x^2)$."],
    ["Derivative of $\\sec x$?", "$\\sec x \\tan x$."]
  ],
  "quiz": [
    {
      "q": "Differentiate $y = \\sin^2 x$.",
      "opts": ["$2\\sin x \\cos x$", "$\\cos^2 x$", "$\\sin 2x$", "A and C are correct"],
      "ans": 3,
      "why": "Using chain rule $2\\sin x \\times \\cos x$, which equals $\\sin 2x$."
    },
    {
      "q": "Find $dy/dx$ for $y = \\tan(3x)$.",
      "opts": ["$3\\sec^2(3x)$", "$\\sec^2(3x)$", "$3\\tan^2(3x)$", "$\\sec^2(x)$"],
      "ans": 0,
      "why": "Derivative of inner function (3) comes outside."
    },
    {
      "q": "Differentiate $y = e^x \\sin x$.",
      "opts": ["$e^x(\\sin x + \\cos x)$", "$e^x \\cos x$", "$e^x \\sin x$", "$e^x(\\sin x - \\cos x)$"],
      "ans": 0,
      "why": "Product rule: $e^x(\\cos x) + \\sin x(e^x)$."
    },
    {
      "q": "What is the derivative of $\\cot 2x$?",
      "opts": ["$-2\\csc^2 2x$", "$-\\csc^2 2x$", "$2\\csc^2 2x$", "$-2\\sec^2 2x$"],
      "ans": 0,
      "why": "Standard result for $\\cot ax$."
    }
  ],
  "exam": [
    {
      "q": "A curve has equation $y = \\frac{\\sin x}{1 + \\cos x}$. Find $dy/dx$ and simplify your answer.",
      "marks": 4,
      "ms": [
        "$\\frac{(1+\\cos x)(\\cos x) - \\sin x(-\\sin x)}{(1+\\cos x)^2}$. (1)",
        "$\\frac{\\cos x + \\cos^2 x + \\sin^2 x}{(1+\\cos x)^2}$. (1)",
        "$\\frac{\\cos x + 1}{(1+\\cos x)^2}$. (1)",
        "$\\frac{1}{1+\\cos x}$. (1)"
      ]
    }
  ]
};

C["maths:7.6"] = {
  "notes": [
    { "h": "Stationary Points & Second Derivatives" },
    {
      "callout": {
        "t": "info",
        "h": "Definitions",
        "body": "A stationary point occurs where $f'(x) = 0$. These can be local maxima, local minima, or points of inflection."
      }
    },
    {
      "table": {
        "head": ["Condition", "Nature of Stationary Point"],
        "rows": [
          ["$f''(x) > 0$", "Local Minimum (concave up)"],
          ["$f''(x) < 0$", "Local Maximum (concave down)"],
          ["$f''(x) = 0$", "Inconclusive (test gradient either side)"]
        ]
      }
    },
    {
      "kv": [
        ["Concave Up", "$f''(x) \\ge 0$"],
        ["Concave Down", "$f''(x) \\le 0$"],
        ["Point of Inflection", "A point where concavity changes ($f''(x)=0$ and changes sign)"]
      ]
    }
  ],
  "flashcards": [
    ["How to find stationary points?", "Set $f'(x) = 0$."],
    ["Nature of point if $f''(x) < 0$?", "Local maximum."],
    ["Nature of point if $f''(x) > 0$?", "Local minimum."],
    ["What if $f''(x) = 0$?", "Check gradient on both sides to distinguish inflection from max/min."],
    ["Condition for a function to be concave down?", "$f''(x) \\le 0$."],
    ["What is a point of inflection?", "Where the curve changes from concave up to concave down (or vice versa)."]
  ],
  "quiz": [
    {
      "q": "Find the stationary point of $y = x^2 - 4x + 7$.",
      "opts": ["$(2, 3)$", "$(2, 7)$", "$(4, 7)$", "$(0, 7)$"],
      "ans": 0,
      "why": "$2x-4 = 0 \\implies x=2. y = 4-8+7=3$."
    },
    {
      "q": "If $f'(a)=0$ and $f''(a)=5$, what is at $x=a$?",
      "opts": ["Minimum", "Maximum", "Inflection", "Intercept"],
      "ans": 0,
      "why": "Positive second derivative means minimum."
    },
    {
      "q": "Find $f''(x)$ for $f(x) = x^3 - 5x$.",
      "opts": ["$6x$", "$3x^2 - 5$", "$6$", "$0$"],
      "ans": 0,
      "why": "$f'(x) = 3x^2 - 5 \\implies f''(x) = 6x$."
    },
    {
      "q": "At what $x$ value does $y = x^3 - 3x^2$ have a point of inflection?",
      "opts": ["$x=1$", "$x=0$", "$x=2$", "$x=3$"],
      "ans": 0,
      "why": "$y'' = 6x - 6 = 0 \\implies x=1$."
    }
  ],
  "exam": [
    {
      "q": "The function $f(x) = x^3 - 3x^2 - 9x + 5$ has two stationary points. Find them and determine their nature.",
      "marks": 6,
      "ms": [
        "$f'(x) = 3x^2 - 6x - 9 = 0$. (1)",
        "$x^2 - 2x - 3 = 0 \\implies (x-3)(x+1) = 0$. $x=3, x=-1$. (1)",
        "At $x=3, y=-22$. At $x=-1, y=10$. (1)",
        "$f''(x) = 6x - 6$. (1)",
        "$f''(3) = 12 > 0 \\implies (3, -22)$ is a minimum. (1)",
        "$f''(-1) = -12 < 0 \\implies (-1, 10)$ is a maximum. (1)"
      ]
    }
  ]
};

C["maths:8.1"] = {
  "notes": [
    { "h": "Basic Integration" },
    {
      "table": {
        "head": ["Function $f(x)$", "Integral $\\int f(x) dx$", "Rule Name"],
        "rows": [
          ["$x^n$", "$\\frac{x^{n+1}}{n+1} + C$", "Power Rule ($n \\ne -1$)"],
          ["$e^{ax}$", "$\\frac{1}{a}e^{ax} + C$", "Exponential Rule"],
          ["$1/x$", "$\\ln|x| + C$", "Log Rule"],
          ["$k$ (constant)", "$kx + C$", "Constant Rule"]
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "The Constant of Integration",
        "body": "NEVER forget the $+ C$ for indefinite integrals. It represents an unknown vertical translation."
      }
    }
  ],
  "flashcards": [
    ["Integral of $x^3$?", "$x^4/4 + C$."],
    ["Integral of $e^{2x}$?", "$0.5e^{2x} + C$."],
    ["Integral of $1/x$?", "$\\ln|x| + C$."],
    ["Integral of $1/x^2$?", "$-1/x + C$."],
    ["What does $\\int$ represent?", "Anti-differentiation or the area under a curve."],
    ["Integral of $\\sqrt{x}$?", "$\\frac{2}{3}x^{3/2} + C$."]
  ],
  "quiz": [
    {
      "q": "Find $\\int (3x^2 - 4x + 5) dx$.",
      "opts": ["$x^3 - 2x^2 + 5x + C$", "$3x^3 - 4x^2 + 5x + C$", "$x^3 - 2x^2 + 5 + C$", "$6x - 4 + C$"],
      "ans": 0,
      "why": "Apply power rule to each term."
    },
    {
      "q": "Evaluate $\\int e^{-x} dx$.",
      "opts": ["$-e^{-x} + C$", "$e^{-x} + C$", "$-e^x + C$", "$-1/e^x + C$"],
      "ans": 0,
      "why": "Divide by coefficient of $x$ (which is -1)."
    },
    {
      "q": "Find $\\int \\frac{2}{x} dx$.",
      "opts": ["$2\\ln|x| + C$", "$\\ln|2x| + C$", "$-2/x^2 + C$", "$2x + C$"],
      "ans": 0,
      "why": "Constant factor 2 stays outside."
    },
    {
      "q": "Find $\\int (x+1)^2 dx$.",
      "opts": ["$\\frac{1}{3}(x+1)^3 + C$", "$x^2/2 + x + C$", "$(x+1)^3 + C$", "$\\frac{1}{2}(x+1)^2 + C$"],
      "ans": 0,
      "why": "Expand or use reverse chain rule since inner derivative is 1."
    }
  ],
  "exam": [
    {
      "q": "Given that $dy/dx = 4x^3 - \\frac{1}{x^2}$ and the curve passes through $(1, 2)$, find the equation of the curve.",
      "marks": 4,
      "ms": [
        "$y = \\int (4x^3 - x^{-2}) dx = x^4 + x^{-1} + C$. (2)",
        "Substitute $(1, 2): 2 = 1^4 + 1^{-1} + C \\implies 2 = 1+1+C \\implies C=0$. (1)",
        "Equation: $y = x^4 + 1/x$. (1)"
      ]
    }
  ]
};

C["maths:8.2"] = {
  "notes": [
    { "h": "Trigonometric Integration" },
    {
      "table": {
        "head": ["Function $f(x)$", "Integral $\\int f(x) dx$"],
        "rows": [
          ["$\\sin ax$", "$-\\frac{1}{a}\\cos ax + C$"],
          ["$\\cos ax$", "$\\frac{1}{a}\\sin ax + C$"],
          ["$\\sec^2 ax$", "$\\frac{1}{a}\\tan ax + C$"],
          ["$\\csc^2 ax$", "$-\\frac{1}{a}\\cot ax + C$"],
          ["$\\sec ax \\tan ax$", "$\\frac{1}{a}\\sec ax + C$"],
          ["$\\csc ax \\cot ax$", "$-\\frac{1}{a}\\csc ax + C$"]
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Using Identities",
        "body": [
          "To integrate $\\sin^2 x$, use $\\frac{1}{2}(1 - \\cos 2x)$.",
          "To integrate $\\cos^2 x$, use $\\frac{1}{2}(1 + \\cos 2x)$."
        ]
      }
    }
  ],
  "flashcards": [
    ["Integral of $\\sin x$?", "$-\\cos x + C$."],
    ["Integral of $\\cos x$?", "$\\sin x + C$."],
    ["Integral of $\\sec^2 x$?", "$\\tan x + C$."],
    ["Integral of $\\sin 2x$?", "$-0.5\\cos 2x + C$."],
    ["How to integrate $\\sin^2 x$?", "Use the $\\cos 2x$ double angle identity."],
    ["Integral of $\\cos(3x+1)$?", "$\\frac{1}{3}\\sin(3x+1) + C$."]
  ],
  "quiz": [
    {
      "q": "Find $\\int \\cos(4x) dx$.",
      "opts": ["$0.25\\sin 4x + C$", "$-0.25\\sin 4x + C$", "$4\\sin 4x + C$", "$\\sin 4x + C$"],
      "ans": 0,
      "why": "Divide by the coefficient of $x$."
    },
    {
      "q": "Evaluate $\\int \\sec^2(0.5x) dx$.",
      "opts": ["$2\\tan(0.5x) + C$", "$0.5\\tan(0.5x) + C$", "$-2\\tan(0.5x) + C$", "$\\tan x + C$"],
      "ans": 0,
      "why": "$1 \\div 0.5 = 2$."
    },
    {
      "q": "Find $\\int (\\sin x + \\cos x) dx$.",
      "opts": ["$\\sin x - \\cos x + C$", "$\\cos x - \\sin x + C$", "$-\\cos x + \\sin x + C$", "$\\sin x + \\cos x + C$"],
      "ans": 2,
      "why": "Integrate terms individually."
    },
    {
      "q": "What identity is used for $\\int \\tan^2 x dx$?",
      "opts": ["$\\sec^2 x - 1$", "$1 - \\sec^2 x$", "$\\sin^2 / \\cos^2$", "$\\cot^2$"],
      "ans": 0,
      "why": "$\\tan^2 x + 1 = \\sec^2 x$."
    }
  ],
  "exam": [
    {
      "q": "Find the exact value of $\\int_0^{\\pi/2} \\sin^2 x dx$.",
      "marks": 4,
      "ms": [
        "Use $\\sin^2 x = \\frac{1}{2} - \\frac{1}{2}\\cos 2x$. (1)",
        "Integral is $[\\frac{1}{2}x - \\frac{1}{4}\\sin 2x]_0^{\\pi/2}$. (1)",
        "At upper limit: $(\\pi/4 - 0.25\\sin \\pi) = \\pi/4$. (1)",
        "At lower limit: $(0 - 0) = 0$. Result: $\\pi/4$. (1)"
      ]
    }
  ]
};

C["maths:8.3"] = {
  "notes": [
    { "h": "Integration by Substitution" },
    {
      "callout": {
        "t": "info",
        "body": "Changing the variable to simplify the integral. Useful for integrals of the form $\\int f(g(x))g'(x) dx$."
      }
    },
    {
      "steps": [
        {
          "h": "General Method",
          "m": "Integrate $\\int x(x^2+1)^3 dx$.\n1. Let $u = x^2+1 \\implies du/dx = 2x \\implies dx = du/2x$.\n2. Substitute: $\\int x u^3 (du/2x) = \\frac{1}{2} \\int u^3 du$.\n3. Integrate: $\\frac{1}{2} \\cdot \\frac{u^4}{4} = \\frac{u^4}{8}$.\n4. Re-substitute: $\\frac{(x^2+1)^4}{8} + C$.",
          "n": "For definite integrals, don't forget to change the limits of integration."
        }
      ]
    }
  ],
  "flashcards": [
    ["When to use substitution?", "When one part of the integral is (roughly) the derivative of another part."],
    ["First step in substitution?", "Choose $u$ and find $du/dx$."],
    ["What to do with limits in $\\int_a^b$ when using $u$?", "Calculate new limits $u(a)$ and $u(b)$."],
    ["Integral of $\\frac{f'(x)}{f(x)}$?", "$\\ln|f(x)| + C$."],
    ["Integral of $f'(x) e^{f(x)}$?", "$e^{f(x)} + C$."],
    ["Substitute for $\\int \\sin x \\cos^3 x dx$?", "$u = \\cos x$."]
  ],
  "quiz": [
    {
      "q": "To integrate $\\int x \\sqrt{x-1} dx$, what is a good substitution?",
      "opts": ["$u = x-1$", "$u = \\sqrt{x-1}$", "$u = x$", "A or B"],
      "ans": 3,
      "why": "Both $u=x-1$ or $u^2=x-1$ work well."
    },
    {
      "q": "Evaluate $\\int \\frac{2x}{x^2+1} dx$.",
      "opts": ["$\\ln(x^2+1) + C$", "$2\\ln(x^2+1) + C$", "$1/(x^2+1) + C$", "$x^2+1 + C$"],
      "ans": 0,
      "why": "Form $f'(x)/f(x)$."
    },
    {
      "q": "Find $\\int e^{\\sin x} \\cos x dx$.",
      "opts": ["$e^{\\sin x} + C$", "$e^{\\cos x} + C$", "$\\sin x e^{\\sin x} + C$", "$\\ln|\\sin x| + C$"],
      "ans": 0,
      "why": "$u = \\sin x$ makes it $\\int e^u du$."
    },
    {
      "q": "If $u = 3x+1$, what is $dx$ in terms of $du$?",
      "opts": ["$du/3$", "$3 du$", "$du$", "$x du$"],
      "ans": 0,
      "why": "$du/dx = 3$."
    }
  ],
  "exam": [
    {
      "q": "Using the substitution $u = 1 + \\sin x$, find the exact value of $\\int_0^{\\pi/2} \\cos x (1 + \\sin x)^3 dx$.",
      "marks": 5,
      "ms": [
        "$u = 1 + \\sin x \\implies du = \\cos x dx$. (1)",
        "Limits: $x=0 \\implies u=1; x=\\pi/2 \\implies u=2$. (1)",
        "Integral becomes $\\int_1^2 u^3 du$. (1)",
        "$[\\frac{1}{4}u^4]_1^2 = \\frac{1}{4}(16 - 1) = 3.75$. (2)"
      ]
    }
  ]
};

C["maths:8.4"] = {
  "notes": [
    { "h": "Integration by Parts" },
    {
      "callout": {
        "t": "formula",
        "h": "The Formula",
        "body": "$$\\int u \\frac{dv}{dx} dx = uv - \\int v \\frac{du}{dx} dx$$",
        "footer": "Used for products of functions that substitution cannot solve."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Choosing $u$ (LIATE)",
        "body": [
          "Choose $u$ in this priority order:",
          "L: Logarithmic ($\\ln x$)",
          "I: Inverse Trig ($\\arcsin x$)",
          "A: Algebraic ($x^n$)",
          "T: Trig ($\\sin x$)",
          "E: Exponential ($e^x$)"
        ]
      }
    }
  ],
  "flashcards": [
    ["Integration by parts formula?", "$uv - \\int v du$."],
    ["When to use parts?", "For products of different types of functions (e.g., $x$ and $e^x$)."],
    ["Best choice of $u$ for $\\int x \\ln x dx$?", "$\\ln x$ (Logs take priority)."],
    ["Best choice of $u$ for $\\int x e^x dx$?", "$x$ (Algebraic over Exponential)."],
    ["How to integrate $\\ln x$?", "Use parts with $u = \\ln x$ and $dv/dx = 1$."],
    ["What happens in $\\int x^2 e^x dx$?", "You must apply parts twice."]
  ],
  "quiz": [
    {
      "q": "Find $\\int x \\cos x dx$.",
      "opts": ["$x \\sin x + \\cos x + C$", "$x \\sin x - \\cos x + C$", "$-x \\sin x + \\cos x + C$", "$x \\sin x + C$"],
      "ans": 0,
      "why": "$u=x, v'=\\cos x \\implies x \\sin x - \\int \\sin x = x \\sin x + \\cos x$."
    },
    {
      "q": "Evaluate $\\int \\ln x dx$.",
      "opts": ["$x \\ln x - x + C$", "$1/x + C$", "$x \\ln x + C$", "$x^2/2 \\ln x + C$"],
      "ans": 0,
      "why": "Standard result using parts."
    },
    {
      "q": "In $\\int x^2 \\ln x dx$, if $u = \\ln x$, what is $v$?",
      "opts": ["$x^3/3$", "$2x$", "$1/x$", "$x^2$"],
      "ans": 0,
      "why": "$v$ is the integral of $x^2$."
    },
    {
      "q": "Which integral requires parts twice?",
      "opts": ["$\\int x^2 e^x dx$", "$\\int x \\ln x dx$", "$\\int x^2 \\sin(x^3) dx$", "$\\int e^{2x} dx$"],
      "ans": 0,
      "why": "Power of $x$ is 2 and not part of a chain rule."
    }
  ],
  "exam": [
    {
      "q": "Find $\\int x^2 e^{3x} dx$.",
      "marks": 6,
      "ms": [
        "$u = x^2, v' = e^{3x} \\implies u' = 2x, v = \\frac{1}{3}e^{3x}$. (1)",
        "$\\frac{1}{3}x^2 e^{3x} - \\int \\frac{2}{3}x e^{3x} dx$. (1)",
        "Apply parts again: $U = \\frac{2}{3}x, V' = e^{3x} \\implies U' = \\frac{2}{3}, V = \\frac{1}{3}e^{3x}$. (1)",
        "$\\dots - [\\frac{2}{9}x e^{3x} - \\int \\frac{2}{9}e^{3x} dx]$. (1)",
        "$\\frac{1}{3}x^2 e^{3x} - \\frac{2}{9}x e^{3x} + \\frac{2}{27}e^{3x} + C$. (2)"
      ]
    }
  ]
};

C["maths:8.5"] = {
  "notes": [
    { "h": "Integration using Partial Fractions" },
    {
      "callout": {
        "t": "info",
        "body": "Decompose complex rational functions into simpler fractions that result in natural logs when integrated."
      }
    },
    {
      "steps": [
        {
          "h": "Example Walkthrough",
          "m": "Integrate $\\int \\frac{1}{(x-1)(x-2)} dx$.\n1. Partial fractions: $\\frac{A}{x-1} + \\frac{B}{x-2} \\implies 1 = A(x-2) + B(x-1)$.\n2. Solve: $x=1 \\implies A=-1; x=2 \\implies B=1$.\n3. $\\int (\\frac{-1}{x-1} + \\frac{1}{x-2}) dx$.",
          "n": "Result: $-\\ln|x-1| + \\ln|x-2| + C = \\ln|\\frac{x-2}{x-1}| + C$."
        }
      ]
    }
  ],
  "flashcards": [
    ["When to use partial fractions for integration?", "When the denominator is a factorable polynomial."],
    ["Integral of $\\frac{1}{x-a}$?", "$\\ln|x-a| + C$."],
    ["Integral of $\\frac{k}{ax+b}$?", "$\\frac{k}{a}\\ln|ax+b| + C$."],
    ["Form of partial fraction for $\\frac{1}{(x+1)^2}$?", "Not needed, use power rule: $(x+1)^{-2}$."],
    ["What to do if numerator degree $\\ge$ denominator degree?", "Polynomial long division first."],
    ["Simplify $\\ln A - \\ln B$.", "$\\ln(A/B)$."]
  ],
  "quiz": [
    {
      "q": "Find $\\int \\frac{3}{2x+1} dx$.",
      "opts": ["$1.5\\ln|2x+1| + C$", "$3\\ln|2x+1| + C$", "$\\ln|2x+1| + C$", "$-3/(2x+1)^2 + C$"],
      "ans": 0,
      "why": "Divide by coefficient of $x$ (which is 2)."
    },
    {
      "q": "Integrate $\\int (\\frac{1}{x} + \\frac{1}{x+1}) dx$.",
      "opts": ["$\\ln|x(x+1)| + C$", "$\\ln|x/(x+1)| + C$", "$\\ln|2x+1| + C$", "$2/x^2$"],
      "ans": 0,
      "why": "$\\ln|x| + \\ln|x+1| = \\ln|x(x+1)|$."
    },
    {
      "q": "What is $\\int \\frac{1}{x^2-1} dx$ using partial fractions?",
      "opts": ["$0.5\\ln|\\frac{x-1}{x+1}| + C$", "$\\ln|x^2-1| + C$", "$\\arctan x + C$", "$-1/x$"],
      "ans": 0,
      "why": "$\\frac{1}{(x-1)(x+1)} = \\frac{0.5}{x-1} - \\frac{0.5}{x+1}$."
    },
    {
      "q": "Form of partial fractions for $\\frac{x+1}{x^2(x-1)}$?",
      "opts": ["$\\frac{A}{x} + \\frac{B}{x^2} + \\frac{C}{x-1}$", "$\\frac{A}{x^2} + \\frac{B}{x-1}$", "$\\frac{Ax+B}{x^2} + \\frac{C}{x-1}$", "$\\frac{A}{x} + \\frac{B}{x-1}$"],
      "ans": 0,
      "why": "Repeated factor $x^2$ needs two terms."
    }
  ],
  "exam": [
    {
      "q": "Express $\\frac{2x+3}{(x+1)(x+2)}$ in partial fractions and hence find $\\int_0^1 \\frac{2x+3}{(x+1)(x+2)} dx$.",
      "marks": 6,
      "ms": [
        "$\\frac{A}{x+1} + \\frac{B}{x+2} \\implies 2x+3 = A(x+2) + B(x+1)$. (1)",
        "$x=-1 \\implies A=1; x=-2 \\implies B=1$. (1)",
        "$\\int (\\frac{1}{x+1} + \\frac{1}{x+2}) dx = [\\ln|x+1| + \\ln|x+2|]$. (1)",
        "Evaluate: $(\\ln 2 + \\ln 3) - (\\ln 1 + \\ln 2)$. (2)",
        "Result: $\\ln 3$. (1)"
      ]
    }
  ]
};

C["maths:8.6"] = {
  "notes": [
    { "h": "Areas under Curves" },
    {
      "callout": {
        "t": "formula",
        "h": "Standard Area",
        "body": "The area between curve $y=f(x)$ and the $x$-axis from $x=a$ to $x=b$ is: $$A = \\int_a^b y dx$$"
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Areas Below the X-axis",
        "body": "Integration will give a negative value for areas below the $x$-axis. You must take the absolute value or negate the integral to get the physical area."
      }
    },
    {
      "kv": [
        ["Area between two curves", "$\\int_a^b (y_{top} - y_{bottom}) dx$"],
        ["Area between curve and Y-axis", "$\\int_c^d x dy$"]
      ]
    }
  ],
  "flashcards": [
    ["Geometric interpretation of $\\int_a^b f(x) dx$?", "Net signed area between curve and $x$-axis."],
    ["How to find area between $y=f(x)$ and $y=g(x)$?", "$\\int (f(x) - g(x)) dx$ between intersection points."],
    ["What if the area is split above and below the $x$-axis?", "Integrate the regions separately and sum their magnitudes."],
    ["Area of $y=x$ from 0 to 2?", "2 (Triangle base 2, height 2)."],
    ["Does $\\int_{-1}^1 x^3 dx$ give the total area?", "No, it gives 0 (anti-symmetric). Need $2 \\int_0^1 x^3 dx$."],
    ["Units of area in integration?", "Square units."]
  ],
  "quiz": [
    {
      "q": "Find the area under $y = x^2$ from $x=0$ to $x=3$.",
      "opts": ["9", "3", "27", "1"],
      "ans": 0,
      "why": "$[x^3/3]_0^3 = 27/3 = 9$."
    },
    {
      "q": "Area between $y=x$ and $y=x^2$ (intersections 0, 1).",
      "opts": ["$1/6$", "$1/2$", "$1/3$", "$2/3$"],
      "ans": 0,
      "why": "$\\int_0^1 (x - x^2) dx = [x^2/2 - x^3/3] = 1/2 - 1/3 = 1/6$."
    },
    {
      "q": "Area under $y = e^x$ from $x=0$ to $x=1$.",
      "opts": ["$e-1$", "$e$", "1", "$e+1$"],
      "ans": 0,
      "why": "$[e^x]_0^1 = e^1 - e^0 = e - 1$."
    },
    {
      "q": "What happens to the area calculation if you integrate from right to left ($b$ to $a$)?",
      "opts": ["The sign is reversed", "It stays the same", "It becomes zero", "It's undefined"],
      "ans": 0,
      "why": "$\\int_a^b = -\\int_b^a$."
    }
  ],
  "exam": [
    {
      "q": "Sketch $y = x(x-2)$ and find the total area enclosed between the curve and the $x$-axis.",
      "marks": 4,
      "ms": [
        "Correct parabola crossing $x$-axis at 0 and 2. (1)",
        "Region is below $x$-axis. Area $= |\\int_0^2 (x^2-2x) dx|$. (1)",
        "Integral: $[x^3/3 - x^2]_0^2 = 8/3 - 4 = -4/3$. (1)",
        "Physical Area = $4/3$. (1)"
      ]
    }
  ]
};

C["maths:8.7"] = {
  "notes": [
    { "h": "Definite Integrals & Fundamental Theorem" },
    {
      "callout": {
        "t": "info",
        "h": "The Fundamental Theorem of Calculus",
        "body": "If $F(x)$ is an antiderivative of $f(x)$, then $$\\int_a^b f(x) dx = F(b) - F(a)$$"
      }
    },
    {
      "kv": [
        ["$\\int_a^b f(x) dx = -\\int_b^a f(x) dx$", "Reversing limits changes sign."],
        ["$\\int_a^a f(x) dx = 0$", "Area of zero width is zero."],
        ["$\\int_a^c f(x) dx = \\int_a^b f(x) dx + \\int_b^c f(x) dx$", "Interval addition property."]
      ]
    }
  ],
  "flashcards": [
    ["What is a definite integral?", "An integral with specific upper and lower limits, resulting in a number."],
    ["How to evaluate $\\int_a^b f(x) dx$?", "$F(b) - F(a)$."],
    ["Is $+C$ needed for definite integrals?", "No, it cancels out during subtraction."],
    ["Value of $\\int_2^2 e^x dx$?", "0."],
    ["If $\\int_0^5 f(x) dx = 10$ and $\\int_0^2 f(x) dx = 3$, what is $\\int_2^5 f(x) dx$?", "7."],
    ["Property for $\\int_a^b (f+g)$?", "$\\int_a^b f + \\int_a^b g$."]
  ],
  "quiz": [
    {
      "q": "Evaluate $\\int_1^4 \\sqrt{x} dx$.",
      "opts": ["14/3", "7/3", "12/3", "2/3"],
      "ans": 0,
      "why": "$[2/3 x^{3/2}]_1^4 = 2/3(8 - 1) = 14/3$."
    },
    {
      "q": "Evaluate $\\int_0^{\\pi} \\sin x dx$.",
      "opts": ["2", "0", "1", "-2"],
      "ans": 0,
      "why": "$[-\\cos x]_0^{\\pi} = -(-1) - (-1) = 1 + 1 = 2$."
    },
    {
      "q": "If $\\int_1^3 f(x) dx = 5$, find $\\int_1^3 2f(x) dx$.",
      "opts": ["10", "5", "7", "2.5"],
      "ans": 0,
      "why": "Constants can be pulled out of the integral."
    },
    {
      "q": "Evaluate $\\int_{-2}^2 x^5 dx$.",
      "opts": ["0", "64", "32", "128"],
      "ans": 0,
      "why": "Odd function over a symmetric interval is always zero."
    }
  ],
  "exam": [
    {
      "q": "Evaluate $\\int_0^{\\ln 2} e^{2x} dx$.",
      "marks": 3,
      "ms": [
        "Integral is $[\\frac{1}{2}e^{2x}]$. (1)",
        "$\\frac{1}{2}(e^{2\\ln 2} - e^0) = \\frac{1}{2}(e^{\\ln 4} - 1)$. (1)",
        "$\\frac{1}{2}(4 - 1) = 1.5$. (1)"
      ]
    }
  ]
};

C["maths:8.8"] = {
  "notes": [
    { "h": "Differential Equations (Separable)" },
    {
      "callout": {
        "t": "info",
        "body": "Solving equations involving $dy/dx$. At A-Level, we focus on separable variables: $\\frac{dy}{dx} = f(x)g(y)$."
      }
    },
    {
      "steps": [
        {
          "h": "Method of Separation",
          "m": "Solve $\\frac{dy}{dx} = \\frac{x}{y}$.\n1. Separate: $y dy = x dx$.\n2. Integrate: $\\int y dy = \\int x dx$.\n3. Result: $\\frac{1}{2}y^2 = \\frac{1}{2}x^2 + C$.",
          "n": "Multiply by 2 and let $2C = K$: $y^2 = x^2 + K$."
        }
      ]
    },
    {
      "kv": [
        ["General Solution", "Contains $+C$. Represents a family of curves."],
        ["Particular Solution", "Found by using 'boundary conditions' (a specific point) to find $C$."]
      ]
    }
  ],
  "flashcards": [
    ["What is a first-order differential equation?", "One involving $dy/dx$ but no higher derivatives."],
    ["How to solve $dy/dx = xy$?", "Separate: $1/y dy = x dx$ then integrate."],
    ["General solution of $dy/dx = ky$?", "$y = Ae^{kx}$."],
    ["What is a 'boundary condition'?", "A given point $(x, y)$ used to find the constant $C$."],
    ["First step in solving $dy/dx = f(x)g(y)$?", "Divide by $g(y)$ and multiply by $dx$."],
    ["Integral of $1/y$ in DEs?", "$\\ln|y|$ (often leads to exponential solutions)."]
  ],
  "quiz": [
    {
      "q": "Solve $dy/dx = 2y$.",
      "opts": ["$y = Ae^{2x}$", "$y = x^2 + C$", "$y = 2x + C$", "$y = e^x + 2$"],
      "ans": 0,
      "why": "$\\int 1/y dy = \\int 2 dx \\implies \\ln y = 2x + C \\implies y = e^{2x+C} = Ae^{2x}$."
    },
    {
      "q": "What is the particular solution for $dy/dx = 1$ passing through $(1, 5)$?",
      "opts": ["$y = x+4$", "$y = x+C$", "$y = 5x$", "$y = x+5$"],
      "ans": 0,
      "why": "$y = x+C$. $5 = 1+C \\implies C=4$."
    },
    {
      "q": "Separate variables for $dy/dx = e^{x+y}$.",
      "opts": ["$e^{-y} dy = e^x dx$", "$e^y dy = e^x dx$", "$dy/e^x = dx/e^y$", "$dy-dx = e^y$"],
      "ans": 0,
      "why": "$e^{x+y} = e^x e^y \\implies 1/e^y dy = e^x dx$."
    },
    {
      "q": "In a growth model $dP/dt = kP$, what is $k$?",
      "opts": ["Growth constant", "Initial population", "Time", "Carrying capacity"],
      "ans": 0,
      "why": "The rate of change is proportional to the current amount."
    }
  ],
  "exam": [
    {
      "q": "Solve the differential equation $\\frac{dy}{dx} = \\frac{x^2}{y^2}$, given that $y=2$ when $x=0$.",
      "marks": 5,
      "ms": [
        "Separate: $y^2 dy = x^2 dx$. (1)",
        "Integrate: $\\frac{1}{3}y^3 = \\frac{1}{3}x^3 + C$. (1)",
        "Multiply by 3: $y^3 = x^3 + K$. (1)",
        "Condition: $2^3 = 0^3 + K \\implies K = 8$. (1)",
        "Solution: $y = \\sqrt[3]{x^3 + 8}$. (1)"
      ]
    }
  ]
};

C["maths:9.1"] = {
  "notes": [
    { "h": "Location of Roots" },
    {
      "callout": {
        "t": "info",
        "h": "Change of Sign Rule",
        "body": "If $f(x)$ is continuous on $[a, b]$ and $f(a)$ and $f(b)$ have opposite signs, then there is at least one root of $f(x)=0$ in the interval $(a, b)$."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Limitations",
        "body": [
          "1. A sign change doesn't happen if there is an even number of roots (e.g., $(x-1)^2$).",
          "2. A sign change can happen without a root if there is a discontinuity (e.g., $1/x$)."
        ]
      }
    }
  ],
  "flashcards": [
    ["How to show a root exists in $[1, 2]$?", "Show $f(1)$ and $f(2)$ have different signs."],
    ["What if $f(1) < 0$ and $f(2) < 0$?", "There could be zero or an even number of roots."],
    ["Requirement for sign change rule?", "$f(x)$ must be continuous."],
    ["Can $1/x$ have a sign change without a root?", "Yes, at $x=0$ (discontinuity)."],
    ["What is a 'root'?", "A value of $x$ such that $f(x) = 0$."],
    ["Does $f(1)=0.1$ and $f(2)=-0.1$ guarantee a root?", "Yes, if $f(x)$ is continuous."]
  ],
  "quiz": [
    {
      "q": "For $f(x) = x^3 - 5$, show where a root lies.",
      "opts": ["$[1, 2]$", "$[2, 3]$", "$[0, 1]$", "$[-1, 0]$"],
      "ans": 0,
      "why": "$f(1)=-4, f(2)=3$. Sign change."
    },
    {
      "q": "Why might $f(x) = \\frac{1}{x-1}$ change sign between 0 and 2 without a root?",
      "opts": ["Discontinuity at $x=1$", "It has 2 roots", "It is a parabola", "It's always positive"],
      "ans": 0,
      "why": "The function is undefined at $x=1$."
    },
    {
      "q": "If $f(x) = (x-2)^2$, is there a sign change at $x=2$?",
      "opts": ["No", "Yes", "Maybe", "Only if $x$ is large"],
      "ans": 0,
      "why": "The graph touches but doesn't cross the $x$-axis."
    },
    {
      "q": "What is the first step in finding a root numerically?",
      "opts": ["Locate an interval with a sign change", "Use Newton-Raphson", "Differentiate", "Integrate"],
      "ans": 0,
      "why": "You need a starting point or interval."
    }
  ],
  "exam": [
    {
      "q": "Show that the equation $e^x = 3 - x$ has a root in the interval $[0.5, 1.0]$. Prove it to 2 decimal places.",
      "marks": 3,
      "ms": [
        "Let $f(x) = e^x + x - 3$. (1)",
        "$f(0.5) = e^{0.5} + 0.5 - 3 \\approx -0.85$. (1)",
        "$f(1.0) = e^1 + 1 - 3 \\approx 0.72$. Sign change $\\implies$ root exists. (1)"
      ]
    }
  ]
};

C["maths:9.2"] = {
  "notes": [
    { "h": "Iteration" },
    {
      "callout": {
        "t": "formula",
        "h": "Fixed Point Iteration",
        "body": "Rearrange $f(x)=0$ into the form $x = g(x)$. Then use the formula: $$x_{n+1} = g(x_n)$$"
      }
    },
    {
      "steps": [
        {
          "h": "Iterative Process",
          "m": "Solve $x^3 - x - 1 = 0$ using $x_{n+1} = \\sqrt[3]{x_n + 1}$ starting with $x_0 = 1$.\n1. $x_1 = \\sqrt[3]{1+1} \\approx 1.2599$.\n2. $x_2 = \\sqrt[3]{1.2599+1} \\approx 1.3123$.\n3. $x_3 = \\dots \\approx 1.3224$.",
          "n": "The values will converge to the root if $|g'(root)| < 1$."
        }
      ]
    },
    {
      "kv": [
        ["Cobweb Diagram", "Formed when $g(x)$ is monotonic."],
        ["Staircase Diagram", "Formed when $g(x)$ is not monotonic (oscillates)."]
      ]
    }
  ],
  "flashcards": [
    ["What is an iterative formula?", "A rule where each term depends on the previous one, $x_{n+1} = g(x_n)$."],
    ["How to rearrange $x^2-x-3=0$ for iteration?", "e.g., $x = \\sqrt{x+3}$ or $x = x^2-3$."],
    ["When does an iteration converge?", "When the values approach a single number."],
    ["What is a cobweb diagram?", "A visual representation of iteration showing convergence or divergence."],
    ["What is $x_0$?", "The initial guess."],
    ["How to show $x=L$ is the root of $x=g(x)$?", "Show $L = g(L)$."]
  ],
  "quiz": [
    {
      "q": "If $x_{n+1} = \\frac{5}{x_n^2}$, find $x_1$ if $x_0 = 2$.",
      "opts": ["1.25", "2.5", "0.2", "5"],
      "ans": 0,
      "why": "$5/4 = 1.25$."
    },
    {
      "q": "Which rearrangement of $x^3 + x - 3 = 0$ is valid?",
      "opts": ["$x = 3 - x^3$", "$x = \\sqrt[3]{3-x}$", "$x = 3/x - 1/x^2$", "Both A and B"],
      "ans": 3,
      "why": "Both are algebraically correct rearrangements."
    },
    {
      "q": "A staircase diagram indicates what?",
      "opts": ["Convergence/Divergence from one side", "Oscillating values", "A repeated root", "No root"],
      "ans": 0,
      "why": "Staircase is produced by a monotonic $g(x)$."
    },
    {
      "q": "If iteration fails to converge, what should you do?",
      "opts": ["Try a different rearrangement $g(x)$", "Try a different $x_0$", "Give up", "A or B"],
      "ans": 3,
      "why": "Convergence depends on both the starting value and the formula."
    }
  ],
  "exam": [
    {
      "q": "An iterative formula is $x_{n+1} = \\frac{4}{x_n^2 + 1}$. Starting with $x_0 = 1$, find $x_1, x_2, x_3$ to 3 decimal places. State the equation that the root satisfies.",
      "marks": 4,
      "ms": [
        "$x_1 = 4/2 = 2.000$. (1)",
        "$x_2 = 4/5 = 0.800$. (1)",
        "$x_3 = 4/(0.8^2 + 1) \\approx 2.439$. (1)",
        "Equation: $x = \\frac{4}{x^2 + 1} \\implies x^3 + x - 4 = 0$. (1)"
      ]
    }
  ]
};

C["maths:9.3"] = {
  "notes": [
    { "h": "Newton-Raphson Method" },
    {
      "callout": {
        "t": "formula",
        "h": "The Formula",
        "body": "$$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$$",
        "footer": "Usually converges much faster than basic iteration."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "When it Fails",
        "body": [
          "1. If $f'(x_n) = 0$ (division by zero).",
          "2. If $x_0$ is too far from the root, it may diverge or find a different root.",
          "3. If the starting point is near a local max/min."
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Geometric Interpretation",
          "m": "Newton-Raphson uses the tangent at $x_n$.\n1. Find tangent to $y=f(x)$ at $x_n$.\n2. Find where this tangent crosses the $x$-axis.\n3. This intersection is $x_{n+1}$.",
          "n": "The formula is derived from $y - f(x_n) = f'(x_n)(x - x_n)$ by setting $y=0$."
        }
      ]
    }
  ],
  "flashcards": [
    ["Newton-Raphson formula?", "$x_{n+1} = x_n - f(x_n)/f'(x_n)$."],
    ["Major advantage of NR?", "Very fast convergence."],
    ["When does NR fail?", "When $f'(x)=0$ or $x_0$ is poor."],
    ["Geometric meaning of NR?", "Using $x$-intercepts of tangents to approximate roots."],
    ["How many iterations are usually needed?", "Often just 2 or 3 for high accuracy."],
    ["Does NR work for all functions?", "No, it must be differentiable."]
  ],
  "quiz": [
    {
      "q": "For $f(x) = x^2 - 2$, find the NR formula.",
      "opts": ["$x - \\frac{x^2-2}{2x}$", "$x - \\frac{2x}{x^2-2}$", "$\\frac{x^2+2}{2x}$", "A and C are correct"],
      "ans": 3,
      "why": "$x - (x^2-2)/(2x) = (2x^2 - x^2 + 2)/(2x) = (x^2+2)/(2x)$."
    },
    {
      "q": "What is the value of $f'(x)$ at a stationary point?",
      "opts": ["0", "1", "undefined", "infinite"],
      "ans": 0,
      "why": "Tangents are horizontal at stationary points."
    },
    {
      "q": "Find $x_1$ for $f(x)=x^3-10, x_0=2$.",
      "opts": ["2.167", "2.5", "3", "2.05"],
      "ans": 0,
      "why": "$2 - (8-10)/(3 \\times 4) = 2 - (-2/12) = 2 + 1/6 \\approx 2.167$."
    },
    {
      "q": "NR is used to solve which type of problem?",
      "opts": ["$f(x)=0$", "$\\int f(x) dx$", "$dy/dx = k$", "Area calculation"],
      "ans": 0,
      "why": "It is a root-finding algorithm."
    }
  ],
  "exam": [
    {
      "q": "The function $f(x) = x^2 + \\sin x - 1$. Show that there is a root near $x=0.5$. Use one iteration of Newton-Raphson to find a better approximation.",
      "marks": 5,
      "ms": [
        "$f(0) = -1, f(1) = 1 + 0.84 - 1 = 0.84$. Sign change. (1)",
        "$f'(x) = 2x + \\cos x$. (1)",
        "$f(0.5) = 0.25 + 0.479 - 1 = -0.271$. (1)",
        "$f'(0.5) = 1 + 0.878 = 1.878$. (1)",
        "$x_1 = 0.5 - (-0.271/1.878) \\approx 0.644$. (1)"
      ]
    }
  ]
};

C["maths:9.4"] = {
  "notes": [
    { "h": "The Trapezium Rule" },
    {
      "callout": {
        "t": "formula",
        "h": "The Approximation",
        "body": "$$\\int_a^b y dx \\approx \\frac{1}{2}h [ (y_0 + y_n) + 2(y_1 + y_2 + \\dots + y_{n-1}) ]$$",
        "footer": "$h = \\frac{b-a}{n}$, where $n$ is the number of strips."
      }
    },
    {
      "table": {
        "head": ["Strips ($n$)", "Ordinates", "Width ($h$)"],
        "rows": [
          ["1", "$y_0, y_1$", "$b-a$"],
          ["2", "$y_0, y_1, y_2$", "$(b-a)/2$"],
          ["4", "$y_0, \\dots, y_4$", "$(b-a)/4$"]
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Over/Under Estimation",
        "body": [
          "If the curve is convex (concave up, $y'' > 0$), the rule OVER-estimates.",
          "If the curve is concave (concave down, $y'' < 0$), the rule UNDER-estimates."
        ]
      }
    }
  ],
  "flashcards": [
    ["Trapezium rule formula?", "$0.5h [ends + 2(middles)]$."],
    ["How to find strip width $h$?", "$(b-a)/n$."],
    ["Difference between strips and ordinates?", "Number of ordinates is $n+1$."],
    ["When does Trapezium rule over-estimate?", "When the curve is convex (U-shaped)."],
    ["When does it under-estimate?", "When the curve is concave (n-shaped)."],
    ["Is the rule exact for linear functions?", "Yes, because the 'trapeziums' match the 'curve' exactly."]
  ],
  "quiz": [
    {
      "q": "Find $h$ for $\\int_1^5 f(x) dx$ with 4 strips.",
      "opts": ["1", "4", "2", "0.5"],
      "ans": 0,
      "why": "$(5-1)/4 = 1$."
    },
    {
      "q": "How many y-values are needed for 6 strips?",
      "opts": ["7", "6", "5", "12"],
      "ans": 0,
      "why": "Number of ordinates is always strips + 1."
    },
    {
      "q": "Area under $y = x^2$ is being estimated. Over or under?",
      "opts": ["Over", "Under", "Exact", "Zero"],
      "ans": 0,
      "why": "$x^2$ is convex."
    },
    {
      "q": "What happens to the error as $n$ increases?",
      "opts": ["Decreases", "Increases", "Stays same", "Becomes negative"],
      "ans": 0,
      "why": "More strips provide a better approximation."
    }
  ],
  "exam": [
    {
      "q": "Use the trapezium rule with 4 strips to estimate $\\int_0^1 \\sqrt{1+x^2} dx$. Give your answer to 3 decimal places.",
      "marks": 4,
      "ms": [
        "$h = (1-0)/4 = 0.25$. (1)",
        "Table of $x$: $0, 0.25, 0.5, 0.75, 1$. (1)",
        "Table of $y$: $1, 1.031, 1.118, 1.25, 1.414$. (1)",
        "Area $\\approx 0.125 [ (1 + 1.414) + 2(1.031+1.118+1.25) ] \\approx 1.151$. (1)"
      ]
    }
  ]
};

C["maths:9.5"] = {
  "notes": [
    { "h": "Numerical Applications" },
    {
      "callout": {
        "t": "info",
        "body": "Numerical methods are essential when an exact solution (analytical) is impossible or too difficult to find."
      }
    },
    {
      "kv": [
        ["$\\int e^{-x^2} dx$", "Impossible to integrate analytically. Must use numerical methods."],
        ["$x + \\sin x = 3$", "Impossible to solve for $x$ exactly. Must use iteration/NR."],
        ["Experimental Data", "No equation given, only points. Trapezium rule is the only option."]
      ]
    }
  ],
  "flashcards": [
    ["Why use numerical integration?", "When the antiderivative cannot be expressed in standard functions."],
    ["Can numerical methods give an exact answer?", "Usually no, but they can be arbitrarily close."],
    ["What is a 'heuristic'?", "A 'rule of thumb' or method that is not guaranteed to be optimal but is sufficient."],
    ["Most accurate method between 9.1-9.4?", "Newton-Raphson usually converges fastest."],
    ["Real-world use of Trapezium rule?", "Calculating areas from sensor data (e.g., GPS points)."],
    ["What does 'converge to 4dp' mean?", "The value stops changing in the first 4 decimal places."]
  ],
  "quiz": [
    {
      "q": "Which equation cannot be solved analytically?",
      "opts": ["$x = \\cos x$", "$x^2 = 4$", "$e^x = 10$", "$\\ln x = 5$"],
      "ans": 0,
      "why": "Transcendental equation with $x$ both inside and outside the trig function."
    },
    {
      "q": "To find the root of $x^5+x-1=0$, which is best?",
      "opts": ["Newton-Raphson", "Quadratic formula", "Factor theorem", "Exact division"],
      "ans": 0,
      "why": "Polynomials of degree 5 generally have no radical solution."
    },
    {
      "q": "Numerical integration is the same as...",
      "opts": ["Approximating area", "Finding $dy/dx$", "Locating roots", "Simplifying surds"],
      "ans": 0,
      "why": "Integration is area calculation."
    },
    {
      "q": "What is 'error analysis' in numerical methods?",
      "opts": ["Estimating the difference between approx and exact", "Counting typos", "Ignoring mistakes", "Rounding to 1dp"],
      "ans": 0,
      "why": "Crucial for knowing if the result is reliable."
    }
  ],
  "exam": [
    {
      "q": "A river's width is measured at 2m intervals. Depths are $0, 0.5, 1.2, 0.8, 0$ meters. Estimate the cross-sectional area.",
      "marks": 3,
      "ms": [
        "$h = 2, n = 4$. (1)",
        "Area $\\approx 0.5 \\times 2 [ (0+0) + 2(0.5+1.2+0.8) ]$. (1)",
        "Area $\\approx 1 [ 5 ] = 5$ m$^2$. (1)"
      ]
    }
  ]
};

C["maths:10.1"] = {
  "notes": [
    { "h": "2D and 3D Vectors" },
    {
      "callout": {
        "t": "info",
        "h": "Definition",
        "body": "A vector is a quantity with both magnitude and direction. It can be represented in component form ($x\\mathbf{i} + y\\mathbf{j} + z\\mathbf{k}$) or as a column vector."
      }
    },
    {
      "kv": [
        ["$\\mathbf{i}$", "Unit vector in the positive $x$ direction."],
        ["$\\mathbf{j}$", "Unit vector in the positive $y$ direction."],
        ["$\\mathbf{k}$", "Unit vector in the positive $z$ direction (3D only)."],
        ["$\\begin{pmatrix} a \\\\ b \\\\ c \\end{pmatrix}$", "Column vector notation."]
      ]
    }
  ],
  "flashcards": [
    ["What is a vector?", "A quantity with magnitude and direction."],
    ["Component form of $\\begin{pmatrix} 2 \\\\ -3 \\end{pmatrix}$?", "$2\\mathbf{i} - 3\\mathbf{j}$."],
    ["What is a unit vector?", "A vector with magnitude 1."],
    ["How to represent a 3D vector?", "$a\\mathbf{i} + b\\mathbf{j} + c\\mathbf{k}$ or a $3 \\times 1$ column vector."],
    ["Zero vector symbol?", "$\\mathbf{0}$ or $\\begin{pmatrix} 0 \\\\ 0 \\\\ 0 \\end{pmatrix}$."],
    ["Are coordinates the same as vectors?", "No, but position vectors represent coordinates relative to the origin."]
  ],
  "quiz": [
    {
      "q": "Which is a scalar quantity?",
      "opts": ["Force", "Velocity", "Speed", "Acceleration"],
      "ans": 2,
      "why": "Speed has no direction."
    },
    {
      "q": "Convert $5\\mathbf{i} - \\mathbf{k}$ to column vector.",
      "opts": ["$\\begin{pmatrix} 5 \\\\ 0 \\\\ -1 \\end{pmatrix}$", "$\\begin{pmatrix} 5 \\\\ -1 \\\\ 0 \\end{pmatrix}$", "$\\begin{pmatrix} 5 \\\\ -1 \\end{pmatrix}$", "$\\begin{pmatrix} 0 \\\\ 5 \\\\ -1 \\end{pmatrix}$"],
      "ans": 0,
      "why": "The $\\mathbf{j}$ component is 0."
    },
    {
      "q": "What is the unit vector $\\mathbf{j}$?",
      "opts": ["$\\begin{pmatrix} 0 \\\\ 1 \\\\ 0 \\end{pmatrix}$", "$\\begin{pmatrix} 1 \\\\ 0 \\\\ 0 \\end{pmatrix}$", "$\\begin{pmatrix} 0 \\\\ 0 \\\\ 1 \\end{pmatrix}$", "$\\begin{pmatrix} 1 \\\\ 1 \\\\ 1 \\end{pmatrix}$"],
      "ans": 0,
      "why": "Standard basis vector for the y-axis."
    },
    {
      "q": "How many components does a 3D vector have?",
      "opts": ["3", "2", "1", "4"],
      "ans": 0,
      "why": "$x, y,$ and $z$."
    }
  ],
  "exam": [
    {
      "q": "Given $\\mathbf{a} = 2\\mathbf{i} - \\mathbf{j} + 3\\mathbf{k}$ and $\\mathbf{b} = \\mathbf{i} + 4\\mathbf{j} - \\mathbf{k}$, find $2\\mathbf{a} - 3\\mathbf{b}$.",
      "marks": 2,
      "ms": [
        "$2\\mathbf{a} = 4\\mathbf{i} - 2\\mathbf{j} + 6\\mathbf{k}$ and $3\\mathbf{b} = 3\\mathbf{i} + 12\\mathbf{j} - 3\\mathbf{k}$. (1)",
        "Result: $\\mathbf{i} - 14\\mathbf{j} + 9\\mathbf{k}$. (1)"
      ]
    }
  ]
};

C["maths:10.2"] = {
  "notes": [
    { "h": "Magnitude and Direction" },
    {
      "callout": {
        "t": "formula",
        "h": "Magnitude",
        "body": "For $\\mathbf{v} = a\\mathbf{i} + b\\mathbf{j} + c\\mathbf{k}$, the magnitude (length) is: $$|\\mathbf{v}| = \\sqrt{a^2 + b^2 + c^2}$$"
      }
    },
    {
      "steps": [
        {
          "h": "Finding Direction in 2D",
          "m": "For $\\mathbf{v} = x\\mathbf{i} + y\\mathbf{j}$, the angle $\\theta$ with the positive $x$-axis is:\n1. Use $\\tan \\alpha = |y/x|$ to find reference angle.\n2. Adjust for the correct quadrant.",
          "n": "In 3D, we often use 'direction cosines' or angles with each axis."
        }
      ]
    },
    {
      "callout": {
        "t": "info",
        "h": "Unit Vector in direction of $\\mathbf{v}$",
        "body": "$\\hat{\\mathbf{v}} = \\frac{\\mathbf{v}}{|\\mathbf{v}|}$"
      }
    }
  ],
  "flashcards": [
    ["Formula for magnitude of $x\\mathbf{i} + y\\mathbf{j}$?", "$\\sqrt{x^2 + y^2}$."],
    ["Magnitude of $3\\mathbf{i} + 4\\mathbf{j}$?", "5."],
    ["How to find a unit vector in the same direction?", "Divide the vector by its magnitude."],
    ["Magnitude of $\\mathbf{i} + \\mathbf{j} + \\mathbf{k}$?", "$\\sqrt{3}$."],
    ["Direction of $\\mathbf{i} + \\mathbf{j}$ relative to $x$-axis?", "$45^\\circ$."],
    ["Is magnitude always positive?", "Yes (or zero)."]
  ],
  "quiz": [
    {
      "q": "Find the magnitude of $\\begin{pmatrix} 1 \\\\ -2 \\\\ 2 \\end{pmatrix}$.",
      "opts": ["3", "9", "5", "1"],
      "ans": 0,
      "why": "$\\sqrt{1^2 + (-2)^2 + 2^2} = \\sqrt{1+4+4} = \\sqrt{9} = 3$."
    },
    {
      "q": "Find a unit vector in the direction of $3\\mathbf{i} - 4\\mathbf{j}$.",
      "opts": ["$0.6\\mathbf{i} - 0.8\\mathbf{j}$", "$3\\mathbf{i} - 4\\mathbf{j}$", "$\\mathbf{i} - \\mathbf{j}$", "$0.3\\mathbf{i} - 0.4\\mathbf{j}$"],
      "ans": 0,
      "why": "Magnitude is 5. Divide components by 5."
    },
    {
      "q": "Angle of $\\mathbf{i} - \\sqrt{3}\\mathbf{j}$ with positive $x$-axis?",
      "opts": ["$-60^\\circ$", "$60^\\circ$", "$30^\\circ$", "$-30^\\circ$"],
      "ans": 0,
      "why": "$\\tan \\theta = -\\sqrt{3}/1 \\implies \\theta = -60^\\circ$."
    },
    {
      "q": "If $|\\mathbf{v}| = 10$ and $\\mathbf{v}$ is parallel to $\\mathbf{i}$, what is $\\mathbf{v}$?",
      "opts": ["$10\\mathbf{i}$", "$\\mathbf{i}$", "$10\\mathbf{j}$", "$\\pm 10\\mathbf{i}$"],
      "ans": 3,
      "why": "Parallel can mean same or opposite direction."
    }
  ],
  "exam": [
    {
      "q": "The vector $\\mathbf{u} = k\\mathbf{i} + 12\\mathbf{j}$ has magnitude 13. Find the possible values of $k$.",
      "marks": 3,
      "ms": [
        "$\\sqrt{k^2 + 12^2} = 13$. (1)",
        "$k^2 + 144 = 169$. (1)",
        "$k^2 = 25 \\implies k = \\pm 5$. (1)"
      ]
    }
  ]
};

C["maths:10.3"] = {
  "notes": [
    { "h": "Vector Addition & Scalar Multiplication" },
    {
      "callout": {
        "t": "formula",
        "h": "Vector Addition",
        "body": "Add corresponding components: $\\mathbf{a} + \\mathbf{b} = \\begin{pmatrix} a_1 + b_1 \\\\ a_2 + b_2 \\end{pmatrix}$. Geometrically, place vectors end-to-end (triangle law)."
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "Vector Subtraction",
        "body": "$\\mathbf{a} - \\mathbf{b} = \\begin{pmatrix} a_1 - b_1 \\\\ a_2 - b_2 \\end{pmatrix}$. Note: $\\vec{AB} = \\mathbf{b} - \\mathbf{a}$ (destination minus start). Students often get the sign wrong."
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "Scalar Multiplication",
        "body": "$\\lambda\\mathbf{a} = \\begin{pmatrix} \\lambda a_1 \\\\ \\lambda a_2 \\end{pmatrix}$. Scales the magnitude by $|\\lambda|$. If $\\lambda < 0$, direction reverses. $\\lambda = 0$ gives the zero vector."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Parallel Vectors",
        "body": "Two non-zero vectors $\\mathbf{a}$ and $\\mathbf{b}$ are **parallel** if $\\mathbf{a} = \\lambda\\mathbf{b}$ for some scalar $\\lambda \\neq 0$. If $\\lambda > 0$ they point the same way; if $\\lambda < 0$ they point opposite ways."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Triangle Law",
        "body": "$\\vec{AB} + \\vec{BC} = \\vec{AC}$. The resultant is the shortcut from start to finish. Think: what's the net displacement if you travel $AB$ then $BC$?"
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Direction of $\\vec{AB}$ — Common Mistake",
        "body": "$\\vec{AB} = \\mathbf{b} - \\mathbf{a}$ (NOT $\\mathbf{a} - \\mathbf{b}$). The arrow points from $A$ to $B$, so you subtract the starting position from the ending position."
      }
    },
    {
      "steps": [
        {
          "h": "Find $\\vec{PQ}$ given $P(1, 2)$ and $Q(4, 6)$",
          "m": "$\\vec{PQ} = \\begin{pmatrix} 4-1 \\\\ 6-2 \\end{pmatrix} = \\begin{pmatrix} 3 \\\\ 4 \\end{pmatrix}$",
          "n": "Destination minus start: $\\mathbf{q} - \\mathbf{p}$."
        },
        {
          "h": "Check if $\\begin{pmatrix} 6 \\\\ -4 \\end{pmatrix}$ and $\\begin{pmatrix} -3 \\\\ 2 \\end{pmatrix}$ are parallel",
          "m": "$\\begin{pmatrix} 6 \\\\ -4 \\end{pmatrix} = -2 \\begin{pmatrix} -3 \\\\ 2 \\end{pmatrix}$ ✓",
          "n": "One is a scalar multiple of the other, so they are parallel."
        }
      ]
    }
  ],
  "flashcards": [
    ["How to add two vectors?", "Add their $x, y, z$ components separately."],
    ["What is a resultant vector?", "The sum of two or more vectors."],
    ["Condition for two vectors to be parallel?", "One is a scalar multiple of the other."],
    ["Effect of multiplying a vector by -2?", "Doubles magnitude and reverses direction."],
    ["$\\vec{AB}$ in terms of position vectors?", "$\\mathbf{b} - \\mathbf{a}$."],
    ["Does $\\mathbf{a} + \\mathbf{b} = \\mathbf{b} + \\mathbf{a}$?", "Yes (Commutative)."]
  ],
  "quiz": [
    {
      "q": "$\\begin{pmatrix} 1 \\\\ 2 \\end{pmatrix} + 3\\begin{pmatrix} 0 \\\\ -1 \\end{pmatrix} =$ ?",
      "opts": ["$\\begin{pmatrix} 1 \\\\ -1 \\end{pmatrix}$", "$\\begin{pmatrix} 4 \\\\ 1 \\end{pmatrix}$", "$\\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}$", "$\\begin{pmatrix} 1 \\\\ -3 \\end{pmatrix}$"],
      "ans": 0,
      "why": "$\\begin{pmatrix} 1+0 \\\\ 2-3 \\end{pmatrix} = \\begin{pmatrix} 1 \\\\ -1 \\end{pmatrix}$."
    },
    {
      "q": "Are $\\begin{pmatrix} 2 \\\\ 4 \\end{pmatrix}$ and $\\begin{pmatrix} -1 \\\\ -2 \\end{pmatrix}$ parallel?",
      "opts": ["Yes", "No", "Only in 3D", "Insufficient info"],
      "ans": 0,
      "why": "First is $-2 \\times$ the second."
    },
    {
      "q": "Find $\\vec{PQ}$ if $P(1, 5)$ and $Q(4, 2)$.",
      "opts": ["$3\\mathbf{i} - \\mathbf{j}$", "$-3\\mathbf{i} + 3\\mathbf{j}$", "$5\\mathbf{i} + 7\\mathbf{j}$", "$4\\mathbf{i} + 2\\mathbf{j}$"],
      "ans": 0,
      "why": "$\\vec{OQ} - \\vec{OP} = (4-1)\\mathbf{i} + (2-5)\\mathbf{j}$."
    },
    {
      "q": "If $\\mathbf{a} + \\mathbf{b} = \\mathbf{0}$, what is the relationship?",
      "opts": ["$\\mathbf{a} = -\\mathbf{b}$", "They are same", "They are perpendicular", "They are unit vectors"],
      "ans": 0,
      "why": "They have same magnitude but opposite direction."
    }
  ],
  "exam": [
    {
      "q": "The vectors $\\mathbf{a} = 3\\mathbf{i} + p\\mathbf{j}$ and $\\mathbf{b} = q\\mathbf{i} - 4\\mathbf{j}$ are parallel. Find a relationship between $p$ and $q$. If $q=6$, find $p$.",
      "marks": 3,
      "ms": [
        "Parallel $\\implies \\frac{3}{q} = \\frac{p}{-4}$. (1)",
        "$pq = -12$. (1)",
        "If $q=6, 6p = -12 \\implies p = -2$. (1)"
      ]
    }
  ]
};

C["maths:10.4"] = {
  "notes": [
    { "h": "Position Vectors & Distance" },
    {
      "callout": {
        "t": "info",
        "h": "Position Vector",
        "body": "The vector from the origin $O$ to a point $P$. Written as $\\vec{OP}$ or $\\mathbf{p}$."
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "Distance Between Two Points",
        "body": "Distance between $A$ and $B$ is the magnitude of vector $\\vec{AB}$: $$d = |\\mathbf{b} - \\mathbf{a}| = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}$$"
      }
    },
    {
      "steps": [
        {
          "h": "Finding a Point on a Line",
          "m": "Point $M$ divides line $AB$ in ratio $m:n$.\n1. $\\vec{OM} = \\mathbf{a} + \\frac{m}{m+n}(\\mathbf{b} - \\mathbf{a})$.\n2. This is the weighted average formula.",
          "n": "For the midpoint, ratio is $1:1$, so $\\vec{OM} = 0.5(\\mathbf{a} + \\mathbf{b})$."
        }
      ]
    }
  ],
  "flashcards": [
    ["What is $\\vec{AB}$ in terms of position vectors?", "$\\mathbf{b} - \\mathbf{a}$."],
    ["Formula for distance between two points in 3D?", "$\\sqrt{\\Delta x^2 + \\Delta y^2 + \\Delta z^2}$."],
    ["How to find the midpoint of $AB$?", "$0.5(\\mathbf{a} + \\mathbf{b})$."],
    ["Position vector of the origin?", "$\\mathbf{0}$."],
    ["Distance from origin to $(a, b, c)$?", "$\\sqrt{a^2 + b^2 + c^2}$."],
    ["If $\\vec{OA} = \\mathbf{a}$ and $\\vec{OB} = \\mathbf{b}$, find $\\vec{AM}$ where $M$ is midpoint.", "$0.5(\\mathbf{b} - \\mathbf{a})$."]
  ],
  "quiz": [
    {
      "q": "Distance between $(1, 0, 2)$ and $(4, 4, 2)$.",
      "opts": ["5", "25", "7", "3"],
      "ans": 0,
      "why": "$\\sqrt{(4-1)^2 + (4-0)^2 + 0^2} = \\sqrt{3^2 + 4^2} = 5$."
    },
    {
      "q": "Position vector of point $(3, -1, 5)$.",
      "opts": ["$3\\mathbf{i} - \\mathbf{j} + 5\\mathbf{k}$", "$\\begin{pmatrix} 3 \\\\ -1 \\\\ 5 \\end{pmatrix}$", "Both", "Neither"],
      "ans": 2,
      "why": "Both are valid notations for the same vector."
    },
    {
      "q": "Point $C$ lies on $AB$ such that $\\vec{AC} = 3\\vec{CB}$. Ratio $AC:CB$?",
      "opts": ["$3:1$", "$1:3$", "$3:4$", "$4:3$"],
      "ans": 0,
      "why": "Direct from the vector equation."
    },
    {
      "q": "Find midpoint of $A(2, 4)$ and $B(6, 10)$.",
      "opts": ["$(4, 7)$", "$(8, 14)$", "$(2, 3)$", "$(4, 3)$"],
      "ans": 0,
      "why": "Average the components: $(2+6)/2=4, (4+10)/2=7$."
    }
  ],
  "exam": [
    {
      "q": "Points $A$ and $B$ have position vectors $2\\mathbf{i} + \\mathbf{j} + 3\\mathbf{k}$ and $4\\mathbf{i} - 3\\mathbf{j} + \\mathbf{k}$ respectively. Find the position vector of point $C$ which divides $AB$ in the ratio $1:3$.",
      "marks": 4,
      "ms": [
        "$\\vec{AB} = \\mathbf{b} - \\mathbf{a} = 2\\mathbf{i} - 4\\mathbf{j} - 2\\mathbf{k}$. (1)",
        "$\\vec{OC} = \\mathbf{a} + \\frac{1}{4}\\vec{AB}$. (1)",
        "$\\vec{OC} = (2\\mathbf{i} + \\mathbf{j} + 3\\mathbf{k}) + (0.5\\mathbf{i} - \\mathbf{j} - 0.5\\mathbf{k})$. (1)",
        "$\\vec{OC} = 2.5\\mathbf{i} + 2.5\\mathbf{k}$. (1)"
      ]
    }
  ]
};

C["maths:10.5"] = {
  "notes": [
    { "h": "Geometric Problems" },
    {
      "callout": {
        "t": "info",
        "body": "Using vectors to prove geometric properties (collinearity, parallel lines, midpoints)."
      }
    },
    {
      "kv": [
        ["Collinear Points", "Points $A, B, C$ lie on a straight line if $\\vec{AB} = \\lambda \\vec{BC}$."],
        ["Parallelogram", "Opposite sides are equal vectors: $\\vec{AB} = \\vec{DC}$."],
        ["Coplanar", "Vectors lying in the same plane (not required for pure A-level but useful)."]
      ]
    },
    {
      "steps": [
        {
          "h": "Proving Collinearity",
          "m": "Show $A, B, C$ are collinear.\n1. Find vector $\\vec{AB}$.\n2. Find vector $\\vec{BC}$.\n3. Show $\\vec{AB} = k\\vec{BC}$.\n4. State that they share a common point $B$.",
          "n": "Both the parallel property and the common point are necessary for the proof."
        }
      ]
    }
  ],
  "flashcards": [
    ["How to show 3 points are collinear?", "Show vectors between them are parallel and share a common point."],
    ["Vector property of a parallelogram $ABCD$?", "$\\vec{AB} = \\vec{DC}$."],
    ["In triangle $OAB$, if $M$ is midpoint of $AB$, what is $\\vec{OM}$?", "$0.5(\\mathbf{a} + \\mathbf{b})$."],
    ["If $\\vec{AB} = \\vec{BC}$, what is $B$?", "The midpoint of $AC$."],
    ["What does it mean if $\\vec{AB} = 2\\vec{CD}$?", "$AB$ is parallel to $CD$ and twice as long."],
    ["Can vectors prove the diagonal of a parallelogram bisect each other?", "Yes, by finding the midpoint of both diagonals and showing they are the same."]
  ],
  "quiz": [
    {
      "q": "If $\\vec{AB} = 2\\mathbf{i} + 3\\mathbf{j}$ and $\\vec{BC} = 4\\mathbf{i} + 6\\mathbf{j}$, are $A, B, C$ collinear?",
      "opts": ["Yes", "No", "Only if $B$ is origin", "Insufficient info"],
      "ans": 0,
      "why": "$\\vec{BC} = 2\\vec{AB}$ and they share point $B$."
    },
    {
      "q": "In rectangle $ABCD$, if $\\vec{AB} = \\mathbf{p}$ and $\\vec{AD} = \\mathbf{q}$, what is $\\vec{AC}$?",
      "opts": ["$\\mathbf{p} + \\mathbf{q}$", "$\\mathbf{p} - \\mathbf{q}$", "$\\mathbf{q} - \\mathbf{p}$", "$\\sqrt{p^2+q^2}$"],
      "ans": 0,
      "why": "Diagonal resultant of the two sides."
    },
    {
      "q": "If $\\vec{OA} = \\mathbf{a}$ and $\\vec{OB} = \\mathbf{b}$, find $\\vec{AB}$.",
      "opts": ["$\\mathbf{b} - \\mathbf{a}$", "$\\mathbf{a} + \\mathbf{b}$", "$\\mathbf{a} - \\mathbf{b}$", "$-\\mathbf{a} - \\mathbf{b}$"],
      "ans": 0,
      "why": "Shortcut from $A$ to $B$ is $A \\to O \\to B$."
    },
    {
      "q": "Property of a rhombus in vectors?",
      "opts": ["$\\vec{AB} = \\vec{DC}$ and $|\\vec{AB}| = |\\vec{BC}|$", "$\\vec{AB} \\perp \\vec{BC}$", "$\\vec{AC} = \\vec{BD}$", "None"],
      "ans": 0,
      "why": "All sides are equal and opposite sides are parallel."
    }
  ],
  "exam": [
    {
      "q": "In triangle $OAB$, $M$ is the midpoint of $OA$ and $N$ is the midpoint of $OB$. Use vectors to show that $MN$ is parallel to $AB$ and half its length.",
      "marks": 4,
      "ms": [
        "$\\vec{OA} = \\mathbf{a}, \\vec{OB} = \\mathbf{b}$. (1)",
        "$\\vec{MN} = \\vec{ON} - \\vec{OM} = 0.5\\mathbf{b} - 0.5\\mathbf{a}$. (1)",
        "$\\vec{AB} = \\mathbf{b} - \\mathbf{a}$. (1)",
        "Since $\\vec{MN} = 0.5\\vec{AB}$, they are parallel and $MN$ is half the length. (1)"
      ]
    }
  ]
};

})(window.KOS_CONTENT);
