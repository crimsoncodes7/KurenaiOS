"""The Maths specification's text, typeset by hand (W6, CM-01).

The PDF extraction behind js/data/maths.js lost every exponent, fraction,
root and modulus sign and split words across lines, so about 40 of the 89
leaves read as fragments ("n2 - 6n + 10", "× = , ÷ = - , = m n n am").
This table is the Edexcel 9MA0 specification (Issue 4, February 2020,
pp. 11–28 and 30–38) re-typed from the printed pages: the same wording, the
maths as LaTeX between $…$ (typeset on the Spec tab by KaTeX), the spec's
own sub-points as "• " lines, and none of the "What students need to
learn:" column headings the extraction ran into the text.

`python3 tools/gen_data.py --maths-spec` applies it to the checked-in
payload (it replaces each listed leaf's content, info and, where given,
title). smoke138 refuses a fragment line (four characters or fewer, a run
of single letters, "need to learn") anywhere in the Maths spec.

LaTeX lives in raw strings, so a backslash is written once.
"""

# short spine titles for the Statistics and Mechanics leaves, whose
# extracted titles were their first 80 characters of spec wording (CM-07),
# and the Pure titles that showed caret notation in the spine (CM-28)
TITLES = {
    "6.1": "Exponential functions & eˣ",
    "6.2": "Gradient of eᵏˣ",
    "6.5": "Solving aˣ = b",
    "7.2": "Differentiating xⁿ, eᵏˣ, trig & ln x",
}

SPEC = {
    # ---------------- 1 Proof ----------------
    "1.1": {
        "content": [
            "Understand and use the structure of mathematical proof, proceeding from given assumptions through a series of logical steps to a conclusion; use methods of proof, including:",
            "• Proof by deduction",
            "• Proof by exhaustion",
            "• Disproof by counter example",
            r"• Proof by contradiction (including proof of the irrationality of $\sqrt{2}$ and the infinity of primes, and application to unfamiliar proofs).",
        ],
        "info": [
            "Examples of proofs:",
            r"• Proof by deduction — e.g. using completion of the square, prove that $n^2 - 6n + 10$ is positive for all values of $n$ or, for example, differentiation from first principles for small positive integer powers of $x$ or proving results for arithmetic and geometric series. This is the most commonly used method of proof throughout this specification.",
            r"• Proof by exhaustion — given that $p$ is a prime number such that $3 < p < 25$, prove by exhaustion that $(p - 1)(p + 1)$ is a multiple of 12.",
            r"• Disproof by counter example — e.g. show that the statement “$n^2 - n + 1$ is a prime number for all values of $n$” is untrue.",
        ],
    },
    # ---------------- 2 Algebra and functions ----------------
    "2.1": {
        "content": ["Understand and use the laws of indices for all rational exponents."],
        "info": [
            r"$a^m \times a^n = a^{m+n}$, $\;a^m \div a^n = a^{m-n}$, $\;(a^m)^n = a^{mn}$",
            r"The equivalence of $a^{\frac{m}{n}}$ and $\sqrt[n]{a^m}$ should be known.",
        ],
    },
    "2.2": {
        "content": ["Use and manipulate surds, including rationalising the denominator."],
        "info": [
            "Students should be able to simplify algebraic surds using the results",
            r"$\left(\sqrt{x}\right)^2 = x$, $\;\sqrt{xy} = \sqrt{x}\sqrt{y}$ and $\left(\sqrt{x} + \sqrt{y}\right)\left(\sqrt{x} - \sqrt{y}\right) = x - y$",
        ],
    },
    "2.3": {
        "content": [
            "Work with quadratic functions and their graphs.",
            "The discriminant of a quadratic function, including the conditions for real and repeated roots.",
            "Completing the square.",
            "Solution of quadratic equations, including solving quadratic equations in a function of the unknown.",
        ],
        "info": [
            r"The notation $\mathrm{f}(x)$ may be used.",
            r"Need to know and to use $b^2 - 4ac > 0$, $\;b^2 - 4ac = 0$ and $b^2 - 4ac < 0$.",
            r"$ax^2 + bx + c = a\left(x + \dfrac{b}{2a}\right)^2 + \left(c - \dfrac{b^2}{4a}\right)$",
            "Solution of quadratic equations by factorisation, use of the formula, use of a calculator or completing the square.",
            r"These functions could include powers of $x$, trigonometric functions of $x$, exponential and logarithmic functions of $x$.",
        ],
    },
    "2.4": {
        "content": ["Solve simultaneous equations in two variables by elimination and by substitution, including one linear and one quadratic equation."],
        "info": [
            "This may involve powers of 2 in one unknown or in both unknowns,",
            r"e.g. solve $y = 2x + 3$, $\;y = x^2 - 4x + 8$",
            r"or $2x - 3y = 6$, $\;x^2 - y^2 + 3x = 50$",
        ],
    },
    "2.5": {
        "content": [
            "Solve linear and quadratic inequalities in a single variable and interpret such inequalities graphically, including inequalities with brackets and fractions.",
            "Express solutions through correct use of ‘and’ and ‘or’, or through set notation.",
            r"Represent linear and quadratic inequalities such as $y > x + 1$ and $y > ax^2 + bx + c$ graphically.",
        ],
        "info": [
            r"e.g. solving $ax + b > cx + d$, $\;px^2 + qx + r \ge 0$, $\;px^2 + qx + r < ax + b$",
            r"and interpreting the third inequality as the range of $x$ for which the curve $y = px^2 + qx + r$ is below the line with equation $y = ax + b$.",
            r"These would be reducible to linear or quadratic inequalities, e.g. $\dfrac{a}{x} < b$ becomes $ax < bx^2$.",
            r"So, e.g. $x < a$ or $x > b$ is equivalent to $\{x : x < a\} \cup \{x : x > b\}$, and $\{x : c < x\} \cap \{x : x < d\}$ is equivalent to $x > c$ and $x < d$.",
            "Shading and use of dotted and solid line convention is required.",
        ],
    },
    "2.6": {
        "content": [
            "Manipulate polynomials algebraically, including expanding brackets and collecting like terms, factorisation and simple algebraic division; use of the factor theorem.",
            "Simplify rational expressions, including by factorising and cancelling, and algebraic division (by linear expressions only).",
        ],
        "info": [
            r"Only division by $(ax + b)$ or $(ax - b)$ will be required.",
            r"Students should know that if $\mathrm{f}(x) = 0$ when $x = \dfrac{b}{a}$, then $(ax - b)$ is a factor of $\mathrm{f}(x)$.",
            r"Students may be required to factorise cubic expressions such as $x^3 + 3x^2 - 4$ and $6x^3 + 11x^2 - x - 6$.",
            r"Denominators of rational expressions will be linear or quadratic, e.g. $\dfrac{1}{ax + b}$, $\;\dfrac{ax + b}{px^2 + qx + r}$, $\;\dfrac{x^3 + a^3}{x^2 - a^2}$",
        ],
    },
    "2.7": {
        "content": [
            "Understand and use graphs of functions; sketch curves defined by simple equations including polynomials.",
            "The modulus of a linear function.",
            r"$y = \dfrac{a}{x}$ and $y = \dfrac{a}{x^2}$ (including their vertical and horizontal asymptotes).",
            "Interpret algebraic solution of equations graphically; use intersection points of graphs to solve equations.",
            "Understand and use proportional relationships and their graphs.",
        ],
        "info": [
            r"Graph to include simple cubic and quartic functions, e.g. sketch the graph with equation $y = x^2(2x - 1)^2$.",
            r"Students should be able to sketch the graph of $y = |ax + b|$. They should be able to use their graph.",
            r"For example, sketch the graph with equation $y = |2x - 1|$ and use the graph to solve the equation $|2x - 1| = x$ or the inequality $|2x - 1| > x$.",
            r"The asymptotes will be parallel to the axes, e.g. the asymptotes of the curve with equation $y = \dfrac{2}{x + a} + b$ are the lines with equations $y = b$ and $x = -a$.",
            r"Express relationship between two variables using proportion “$\propto$” symbol or using equation involving constant.",
            r"e.g. the circumference of a semicircle is directly proportional to its diameter so $C \propto d$ or $C = kd$, and the graph of $C$ against $d$ is a straight line through the origin with gradient $k$.",
        ],
    },
    "2.8": {
        "content": ["Understand and use composite functions; inverse functions and their graphs."],
        "info": [
            r"The concept of a function as a one-one or many-one mapping from $\mathbb{R}$ (or a subset of $\mathbb{R}$) to $\mathbb{R}$. The notation $\mathrm{f} : x \mapsto$ and $\mathrm{f}(x)$ will be used. Domain and range of functions.",
            r"Students should know that $\mathrm{fg}$ will mean ‘do g first, then f’ and that if $\mathrm{f}^{-1}$ exists, then $\mathrm{f}^{-1}\mathrm{f}(x) = \mathrm{f}\mathrm{f}^{-1}(x) = x$.",
            r"They should also know that the graph of $y = \mathrm{f}^{-1}(x)$ is the image of the graph of $y = \mathrm{f}(x)$ after reflection in the line $y = x$.",
        ],
    },
    "2.9": {
        "content": [
            r"Understand the effect of simple transformations on the graph of $y = \mathrm{f}(x)$, including sketching associated graphs:",
            r"• $y = a\mathrm{f}(x)$, $\;y = \mathrm{f}(x) + a$, $\;y = \mathrm{f}(x + a)$, $\;y = \mathrm{f}(ax)$",
            "• and combinations of these transformations",
        ],
        "info": [
            r"Students should be able to find the graphs of $y = |\mathrm{f}(x)|$ and $y = |\mathrm{f}(-x)|$, given the graph of $y = \mathrm{f}(x)$.",
            r"Students should be able to apply a combination of these transformations to any of the functions in the A Level specification (quadratics, cubics, quartics, reciprocal, $\dfrac{a}{x^2}$, $|x|$, $\sin x$, $\cos x$, $\tan x$, $\mathrm{e}^x$ and $a^x$) and sketch the resulting graph.",
            r"Given the graph of $y = \mathrm{f}(x)$, students should be able to sketch the graph of, e.g. $y = 2\mathrm{f}(3x)$, or $y = \mathrm{f}(-x) + 1$,",
            r"and should be able to sketch (for example) $y = 3 + \sin 2x$, $\;y = -\cos\left(x + \dfrac{\pi}{4}\right)$.",
        ],
    },
    "2.10": {
        "content": ["Decompose rational functions into partial fractions (denominators not more complicated than squared linear terms and with no more than 3 terms, numerators constant or linear)."],
        "info": [
            r"Partial fractions to include denominators such as $(ax + b)(cx + d)(ex + f)$ and $(ax + b)(cx + d)^2$.",
            "Applications to integration, differentiation and series expansions.",
        ],
    },
    "2.11": {
        "content": ["Use of functions in modelling, including consideration of limitations and refinements of the models."],
        "info": ["For example, use of trigonometric functions for modelling tides, hours of sunlight, etc. Use of exponential functions for growth and decay (see Paper 1, Section 6.7). Use of reciprocal function for inverse proportion (e.g. pressure and volume)."],
    },
    # ---------------- 3 Coordinate geometry ----------------
    "3.1": {
        "content": [
            r"Understand and use the equation of a straight line, including the forms $y - y_1 = m(x - x_1)$ and $ax + by + c = 0$;",
            "Gradient conditions for two straight lines to be parallel or perpendicular.",
            "Be able to use straight line models in a variety of contexts.",
        ],
        "info": [
            "To include the equation of a line through two given points, and the equation of a line parallel (or perpendicular) to a given line through a given point.",
            r"$m' = m$ for parallel lines and $m' = -\dfrac{1}{m}$ for perpendicular lines.",
            "For example, the line for converting degrees Celsius to degrees Fahrenheit, distance against time for constant speed, etc.",
        ],
    },
    "3.2": {
        "content": [
            r"Understand and use the coordinate geometry of the circle including using the equation of a circle in the form $(x - a)^2 + (y - b)^2 = r^2$.",
            "Completing the square to find the centre and radius of a circle; use of the following properties:",
            "• the angle in a semicircle is a right angle",
            "• the perpendicular from the centre to a chord bisects the chord",
            "• the radius of a circle at a given point on its circumference is perpendicular to the tangent to the circle at that point.",
        ],
        "info": [
            "Students should be able to find the radius and the coordinates of the centre of the circle given the equation of the circle, and vice versa.",
            r"Students should also be familiar with the equation $x^2 + y^2 + 2fx + 2gy + c = 0$.",
            "Students should be able to find the equation of a circumcircle of a triangle with given vertices using these properties.",
            "Students should be able to find the equation of a tangent at a specified point, using the perpendicular property of tangent and radius.",
        ],
    },
    "3.3": {
        "content": ["Understand and use the parametric equations of curves and conversion between Cartesian and parametric forms."],
        "info": [
            r"For example: $x = 3\cos t$, $\;y = 3\sin t$ describes a circle centre $O$ radius 3;",
            r"$x = 2 + 5\cos t$, $\;y = -4 + 5\sin t$ describes a circle centre $(2, -4)$ with radius 5;",
            r"$x = 5t$, $\;y = \dfrac{5}{t}$ describes the curve $xy = 25$ (or $y = \dfrac{25}{x}$);",
            r"$x = 5t$, $\;y = 3t^2$ describes the quadratic curve $25y = 3x^2$, and other familiar curves covered in the specification.",
            r"Students should pay particular attention to the domain of the parameter $t$, as a specific section of a curve may be described.",
        ],
    },
    "3.4": {
        "content": ["Use parametric equations in modelling in a variety of contexts."],
        "info": [r"A shape may be modelled using parametric equations or students may be asked to find parametric equations for a motion. For example, an object moves with constant velocity from $(1, 8)$ at $t = 0$ to $(6, 20)$ at $t = 5$. This may also be tested in Paper 3, section 7 (kinematics)."],
    },
    # ---------------- 4 Sequences and series ----------------
    "4.1": {
        "content": [
            r"Understand and use the binomial expansion of $(a + bx)^n$ for positive integer $n$; the notations $n!$ and ${}^n\mathrm{C}_r$; link to binomial probabilities.",
            r"Extend to any rational $n$, including its use for approximation; be aware that the expansion is valid for $\left|\dfrac{bx}{a}\right| < 1$ (proof not required).",
        ],
        "info": [
            "Use of Pascal’s triangle.",
            "Relation between binomial coefficients.",
            r"Also be aware of alternative notations such as $\dbinom{n}{r}$ and ${}^n\mathrm{C}_r$.",
            "Considered further in Paper 3 Section 4.1.",
            "May be used with the expansion of rational functions by decomposition into partial fractions.",
            "May be asked to comment on the range of validity.",
        ],
    },
    "4.2": {
        "content": [
            r"Work with sequences including those given by a formula for the $n$th term and those generated by a simple relation of the form $x_{n+1} = \mathrm{f}(x_n)$;",
            "increasing sequences; decreasing sequences; periodic sequences.",
        ],
        "info": [
            r"For example $u_n = \dfrac{1}{3n + 1}$ describes a decreasing sequence as $u_{n+1} < u_n$ for all integer $n$.",
            r"$u_n = 2^n$ is an increasing sequence as $u_{n+1} > u_n$ for all integer $n$.",
            r"$u_{n+1} = \dfrac{1}{u_n}$ for $n > 1$ and $u_1 = 3$ describes a periodic sequence of order 2.",
        ],
    },
    "4.3": {
        "content": ["Understand and use sigma notation for sums of series."],
        "info": [r"Knowledge that $\displaystyle\sum_{1}^{n} 1 = n$ is expected."],
    },
    "4.4": {
        "content": [r"Understand and work with arithmetic sequences and series, including the formulae for $n$th term and the sum to $n$ terms."],
        "info": [r"The proof of the sum formula for an arithmetic sequence should be known, including the formula for the sum of the first $n$ natural numbers."],
    },
    "4.5": {
        "content": [r"Understand and work with geometric sequences and series, including the formulae for the $n$th term and the sum of a finite geometric series; the sum to infinity of a convergent geometric series, including the use of $|r| < 1$; modulus notation."],
        "info": [
            "The proof of the sum formula should be known.",
            r"Given the sum of a series students should be able to use logs to find the value of $n$.",
            r"The sum to infinity may be expressed as $S_\infty$.",
        ],
    },
    "4.6": {
        "content": ["Use sequences and series in modelling."],
        "info": ["Examples could include amounts paid into saving schemes, increasing by the same amount (arithmetic) or by the same percentage (geometric) or could include other series defined by a formula or a relation."],
    },
}

SPEC.update({
    # ---------------- 5 Trigonometry ----------------
    "5.1": {
        "content": [
            "Understand and use the definitions of sine, cosine and tangent for all arguments;",
            "the sine and cosine rules;",
            r"the area of a triangle in the form $\frac{1}{2}ab\sin C$.",
            "Work with radian measure, including use for arc length and area of sector.",
        ],
        "info": [
            r"Use of $x$ and $y$ coordinates of points on the unit circle to give cosine and sine respectively,",
            "including the ambiguous case of the sine rule.",
            r"Use of the formulae $s = r\theta$ and $A = \frac{1}{2}r^2\theta$ for arc lengths and areas of sectors of a circle.",
        ],
    },
    "5.2": {
        "content": [
            "Understand and use the standard small angle approximations of sine, cosine and tangent:",
            r"• $\sin\theta \approx \theta$, $\;\cos\theta \approx 1 - \dfrac{\theta^2}{2}$, $\;\tan\theta \approx \theta$",
            r"• where $\theta$ is in radians.",
        ],
        "info": [r"Students should be able to approximate, e.g. $\dfrac{\cos 3x - 1}{x\sin 4x}$ when $x$ is small, to $-\dfrac{9}{8}$."],
    },
    "5.3": {
        "content": [
            "Understand and use the sine, cosine and tangent functions; their graphs, symmetries and periodicity.",
            r"Know and use exact values of $\sin$ and $\cos$ for $0, \dfrac{\pi}{6}, \dfrac{\pi}{4}, \dfrac{\pi}{3}, \dfrac{\pi}{2}, \pi$ and multiples thereof, and exact values of $\tan$ for $0, \dfrac{\pi}{6}, \dfrac{\pi}{4}, \dfrac{\pi}{3}, \pi$ and multiples thereof.",
        ],
        "info": [r"Knowledge of graphs of curves with equations such as $y = \sin x$, $\;y = \cos(x + 30°)$, $\;y = \tan 2x$ is expected."],
    },
    "5.4": {
        "content": ["Understand and use the definitions of secant, cosecant and cotangent and of arcsin, arccos and arctan; their relationships to sine, cosine and tangent; understanding of their graphs; their ranges and domains."],
        "info": ["Angles measured in both degrees and radians."],
    },
    "5.5": {
        "content": [
            r"Understand and use $\tan\theta = \dfrac{\sin\theta}{\cos\theta}$.",
            r"Understand and use $\sin^2\theta + \cos^2\theta = 1$; $\;\sec^2\theta = 1 + \tan^2\theta$ and $\operatorname{cosec}^2\theta = 1 + \cot^2\theta$.",
        ],
        "info": ["These identities may be used to solve trigonometric equations and angles may be in degrees or radians. They may also be used to prove further identities."],
    },
    "5.6": {
        "content": [
            r"Understand and use double angle formulae; use of formulae for $\sin(A \pm B)$, $\cos(A \pm B)$ and $\tan(A \pm B)$; understand geometrical proofs of these formulae.",
            r"Understand and use expressions for $a\cos\theta + b\sin\theta$ in the equivalent forms of $r\cos(\theta \pm \alpha)$ or $r\sin(\theta \pm \alpha)$.",
        ],
        "info": [
            "To include application to half angles.",
            r"Knowledge of the $\tan\left(\frac{1}{2}\theta\right)$ formulae will not be required.",
            r"Students should be able to solve equations such as $a\cos\theta + b\sin\theta = c$ in a given interval.",
        ],
    },
    "5.7": {
        "content": ["Solve simple trigonometric equations in a given interval, including quadratic equations in sin, cos and tan and equations involving multiples of the unknown angle."],
        "info": [
            "Students should be able to solve equations such as",
            r"• $\sin(x + 70°) = 0.5$ for $0 < x < 360°$",
            r"• $3 + 5\cos 2x = 1$ for $-180° < x < 180°$",
            r"• $6\cos^2 x + \sin x - 5 = 0$, $\;0 \le x < 360°$",
            "These may be in degrees or radians and this will be specified in the question.",
        ],
    },
    "5.8": {
        "content": ["Construct proofs involving trigonometric functions and identities."],
        "info": [r"Students need to prove identities such as $\cos x\cos 2x + \sin x\sin 2x \equiv \cos x$."],
    },
    "5.9": {
        "content": ["Use trigonometric functions to solve problems in context, including problems involving vectors, kinematics and forces."],
        "info": ["Problems could involve (for example) wave motion, the height of a point on a vertical circular wheel, or the hours of sunlight throughout the year. Angles may be measured in degrees or in radians."],
    },
    # ---------------- 6 Exponentials and logarithms ----------------
    "6.1": {
        "content": [
            r"Know and use the function $a^x$ and its graph, where $a$ is positive.",
            r"Know and use the function $\mathrm{e}^x$ and its graph.",
        ],
        "info": [
            r"Understand the difference in shape between $a < 1$ and $a > 1$.",
            r"To include the graph of $y = \mathrm{e}^{ax + b} + c$.",
        ],
    },
    "6.2": {
        "content": [r"Know that the gradient of $\mathrm{e}^{kx}$ is equal to $k\mathrm{e}^{kx}$ and hence understand why the exponential model is suitable in many applications."],
        "info": [r"Realise that when the rate of change is proportional to the $y$ value, an exponential model should be used."],
    },
    "6.3": {
        "content": [
            r"Know and use the definition of $\log_a x$ as the inverse of $a^x$, where $a$ is positive and $x \ge 0$.",
            r"Know and use the function $\ln x$ and its graph.",
            r"Know and use $\ln x$ as the inverse function of $\mathrm{e}^x$.",
        ],
        "info": [
            r"$a \ne 1$",
            r"Solution of equations of the form $\mathrm{e}^{ax + b} = p$ and $\ln(ax + b) = q$ is expected.",
        ],
    },
    "6.4": {
        "content": [
            "Understand and use the laws of logarithms:",
            r"• $\log_a x + \log_a y = \log_a(xy)$",
            r"• $\log_a x - \log_a y = \log_a\left(\dfrac{x}{y}\right)$",
            r"• $k\log_a x = \log_a x^k$ (including, for example, $k = -1$ and $k = -\frac{1}{2}$)",
        ],
        "info": [r"Includes $\log_a a = 1$."],
    },
    "6.5": {
        "content": [r"Solve equations of the form $a^x = b$."],
        "info": [r"Students may use the change of base formula. Questions may be of the form, e.g. $2^{3x - 1} = 3$."],
    },
    "6.6": {
        "content": [r"Use logarithmic graphs to estimate parameters in relationships of the form $y = ax^n$ and $y = kb^x$, given data for $x$ and $y$."],
        "info": [
            r"Plot $\log y$ against $\log x$ and obtain a straight line where the intercept is $\log a$ and the gradient is $n$.",
            r"Plot $\log y$ against $x$ and obtain a straight line where the intercept is $\log k$ and the gradient is $\log b$.",
        ],
    },
    "6.7": {
        "content": ["Understand and use exponential growth and decay; use in modelling (examples may include the use of e in continuous compound interest, radioactive decay, drug concentration decay, exponential growth as a model for population growth); consideration of limitations and refinements of exponential models."],
        "info": [
            "Students may be asked to find the constants used in a model.",
            r"They need to be familiar with terms such as initial, meaning when $t = 0$.",
            r"They may need to explore the behaviour for large values of $t$ or to consider whether the range of values predicted is appropriate.",
            "Consideration of an improved model may be required.",
        ],
    },
    # ---------------- 7 Differentiation ----------------
    "7.1": {
        "content": [
            r"Understand and use the derivative of $\mathrm{f}(x)$ as the gradient of the tangent to the graph of $y = \mathrm{f}(x)$ at a general point $(x, y)$; the gradient of the tangent as a limit; interpretation as a rate of change;",
            "sketching the gradient function for a given curve;",
            "second derivatives;",
            r"differentiation from first principles for small positive integer powers of $x$ and for $\sin x$ and $\cos x$.",
        ],
        "info": [
            r"Know that $\dfrac{\mathrm{d}y}{\mathrm{d}x}$ is the rate of change of $y$ with respect to $x$.",
            r"The notation $\mathrm{f}'(x)$ may be used for the first derivative and $\mathrm{f}''(x)$ may be used for the second derivative.",
            r"Given for example the graph of $y = \mathrm{f}(x)$, sketch the graph of $y = \mathrm{f}'(x)$ using given axes and scale. This could relate speed and acceleration for example.",
            r"For example, students should be able to use, for $n = 2$ and $n = 3$, the gradient expression $\displaystyle\lim_{h \to 0}\left(\frac{(x + h)^n - x^n}{h}\right)$.",
            r"Students may use $\delta x$ or $h$.",
        ],
    },
})

SPEC["7.1"]["content"].append("Understand and use the second derivative as the rate of change of gradient; connection to convex and concave sections of curves and points of inflection.")
SPEC["7.1"]["info"] += [
    r"Use the condition $\mathrm{f}''(x) > 0$ implies a minimum and $\mathrm{f}''(x) < 0$ implies a maximum for points where $\mathrm{f}'(x) = 0$.",
    r"Know that at an inflection point $\mathrm{f}''(x)$ changes sign.",
    r"Consider cases where $\mathrm{f}''(x) = 0$ and $\mathrm{f}'(x) = 0$ where the point may be a minimum, a maximum or a point of inflection (e.g. $y = x^n$, $n > 2$).",
]

SPEC.update({
    "7.2": {
        "content": [
            r"Differentiate $x^n$, for rational values of $n$, and related constant multiples, sums and differences.",
            r"Differentiate $\mathrm{e}^{kx}$ and $a^{kx}$, $\sin kx$, $\cos kx$, $\tan kx$ and related sums, differences and constant multiples.",
            r"Understand and use the derivative of $\ln x$.",
        ],
        "info": [
            r"For example, the ability to differentiate expressions such as $(2x + 5)(x - 1)$ and $\dfrac{x^2 + 3x - 5}{4x^{\frac{1}{2}}}$, $x > 0$, is expected.",
            r"Knowledge and use of the result $\dfrac{\mathrm{d}}{\mathrm{d}x}\left(a^{kx}\right) = ka^{kx}\ln a$ is expected.",
        ],
    },
    "7.3": {
        "content": [
            "Apply differentiation to find gradients, tangents and normals,",
            "maxima and minima and stationary points,",
            "points of inflection.",
            "Identify where functions are increasing or decreasing.",
        ],
        "info": [
            "Use of differentiation to find equations of tangents and normals at specific points on a curve.",
            "To include applications to curve sketching. Maxima and minima problems may be set in the context of a practical problem.",
            "To include applications to curve sketching.",
        ],
    },
    "7.4": {
        "content": ["Differentiate using the product rule, the quotient rule and the chain rule, including problems involving connected rates of change and inverse functions."],
        "info": [
            r"Differentiation of $\operatorname{cosec} x$, $\cot x$ and $\sec x$.",
            r"Differentiation of functions of the form $x = \sin y$, $x = 3\tan 2y$ and the use of $\dfrac{\mathrm{d}y}{\mathrm{d}x} = \dfrac{1}{\left(\frac{\mathrm{d}x}{\mathrm{d}y}\right)}$.",
            r"Use of connected rates of change in models, e.g. $\dfrac{\mathrm{d}V}{\mathrm{d}t} = \dfrac{\mathrm{d}V}{\mathrm{d}r} \times \dfrac{\mathrm{d}r}{\mathrm{d}t}$.",
            r"Skill will be expected in the differentiation of functions generated from standard forms using products, quotients and composition, such as $2x^4\sin x$, $\;\dfrac{\mathrm{e}^{3x}}{x}$, $\;\cos^2 x$ and $\tan^2 2x$.",
        ],
    },
    "7.5": {
        "content": ["Differentiate simple functions and relations defined implicitly or parametrically, for first derivative only."],
        "info": ["The finding of equations of tangents and normals to curves given parametrically or implicitly is required."],
    },
    "7.6": {
        "content": ["Construct simple differential equations in pure mathematics and in context (contexts may include kinematics, population growth and modelling the relationship between price and demand)."],
        "info": [
            "Set up a differential equation using given information.",
            "For example: in a simple model, the rate of decrease of the radius of the mint is inversely proportional to the square of the radius.",
        ],
    },
    # ---------------- 8 Integration ----------------
    "8.1": {
        "content": ["Know and use the Fundamental Theorem of Calculus."],
        "info": ["Integration as the reverse process of differentiation. Students should know that for indefinite integrals a constant of integration is required."],
    },
    "8.2": {
        "content": [
            r"Integrate $x^n$ (excluding $n = -1$) and related sums, differences and constant multiples.",
            r"Integrate $\mathrm{e}^{kx}$, $\dfrac{1}{x}$, $\sin kx$, $\cos kx$ and related sums, differences and constant multiples.",
        ],
        "info": [
            r"For example, the ability to integrate expressions such as $\frac{1}{2}x^2 - 3x^{-\frac{1}{2}}$ and $\dfrac{(x + 2)^2}{x^{\frac{1}{2}}}$ is expected.",
            r"Given $\mathrm{f}'(x)$ and a point on the curve, students should be able to find an equation of the curve in the form $y = \mathrm{f}(x)$.",
            r"To include integration of standard functions such as $\sin 3x$, $\sec^2 2x$, $\tan x$, $\mathrm{e}^{5x}$, $\dfrac{1}{2x}$.",
            r"Students are expected to be able to use trigonometric identities to integrate, for example, $\sin^2 x$, $\tan^2 x$, $\cos^2 3x$.",
        ],
    },
    "8.3": {
        "content": ["Evaluate definite integrals; use a definite integral to find the area under a curve and the area between two curves."],
        "info": [
            "Students will be expected to be able to evaluate the area of a region bounded by a curve and given straight lines, or between two curves. This includes curves defined parametrically.",
            r"For example, find the finite area bounded by the curve $y = 6x - x^2$ and the line $y = 2x$,",
            r"or find the finite area bounded by the curve $y = x^2 - 5x + 6$ and the curve $y = 4 - x^2$.",
        ],
    },
    "8.4": {
        "content": ["Understand and use integration as the limit of a sum."],
        "info": [r"Recognise $\displaystyle\int_a^b \mathrm{f}(x)\,\mathrm{d}x = \lim_{\delta x \to 0}\sum_{x = a}^{b}\mathrm{f}(x)\,\delta x$."],
    },
    "8.5": {
        "content": [
            "Carry out simple cases of integration by substitution and integration by parts; understand these methods as the inverse processes of the chain and product rules respectively.",
            "(Integration by substitution includes finding a suitable substitution and is limited to cases where one substitution will lead to a function which can be integrated; integration by parts includes more than one application of the method but excludes reduction formulae.)",
        ],
        "info": [
            r"Students should recognise integrals of the form $\displaystyle\int \frac{\mathrm{f}'(x)}{\mathrm{f}(x)}\,\mathrm{d}x = \ln \mathrm{f}(x) + c$.",
            r"The integral $\displaystyle\int \ln x\,\mathrm{d}x$ is required.",
        ],
    },
    "8.6": {
        "content": ["Integrate using partial fractions that are linear in the denominator."],
        "info": [
            r"Integration of rational expressions such as those arising from partial fractions, e.g. $\dfrac{2}{3x + 5}$.",
            r"Note that the integration of other rational expressions, such as $\dfrac{x}{x^2 + 5}$ and $\dfrac{2}{(2x - 1)^4}$, is also required (see previous paragraph).",
        ],
    },
    "8.7": {
        "content": [
            "Evaluate the analytical solution of simple first order differential equations with separable variables, including finding particular solutions.",
            "(Separation of variables may require factorisation involving a common factor.)",
        ],
        "info": ["Students may be asked to sketch members of the family of solution curves."],
    },
    "8.8": {
        "content": ["Interpret the solution of a differential equation in the context of solving a problem, including identifying limitations of the solution; includes links to kinematics."],
        "info": ["The validity of the solution for large values should be considered."],
    },
    # ---------------- 9 Numerical methods ----------------
    "9.1": {
        "content": [
            r"Locate roots of $\mathrm{f}(x) = 0$ by considering changes of sign of $\mathrm{f}(x)$ in an interval of $x$ on which $\mathrm{f}(x)$ is sufficiently well behaved.",
            "Understand how change of sign methods can fail.",
        ],
        "info": [
            "Students should know that sign change is appropriate for continuous functions in a small interval.",
            "When the interval is too large sign may not change as there may be an even number of roots.",
            "If the function is not continuous, sign may change but there may be an asymptote (not a root).",
        ],
    },
    "9.2": {
        "content": ["Solve equations approximately using simple iterative methods; be able to draw associated cobweb and staircase diagrams."],
        "info": [
            "Understand that many mathematical problems cannot be solved analytically, but numerical methods permit solution to a required level of accuracy.",
            r"Use an iteration of the form $x_{n+1} = \mathrm{f}(x_n)$ to find a root of the equation $x = \mathrm{f}(x)$ and show understanding of the convergence in geometrical terms by drawing cobweb and staircase diagrams.",
        ],
    },
    "9.3": {
        "content": [
            r"Solve equations using the Newton–Raphson method and other recurrence relations of the form $x_{n+1} = \mathrm{g}(x_n)$.",
            "Understand how such methods can fail.",
        ],
        "info": ["For the Newton–Raphson method, students should understand its working in geometrical terms, so that they understand its failure near to points where the gradient is small."],
    },
})

SPEC.update({
    "9.4": {
        "content": ["Understand and use numerical integration of functions, including the use of the trapezium rule and estimating the approximate area under a curve and limits that it must lie between."],
        "info": [r"For example, evaluate $\displaystyle\int_0^1 \sqrt{2x + 1}\,\mathrm{d}x$ using the values of $\sqrt{2x + 1}$ at $x = 0, 0.25, 0.5, 0.75$ and $1$ and use a sketch on a given graph to determine whether the trapezium rule gives an over-estimate or an under-estimate."],
    },
    "9.5": {
        "content": ["Use numerical methods to solve problems in context."],
        "info": ["Iterations may be suggested for the solution of equations not soluble by analytic means."],
    },
    # ---------------- 10 Vectors ----------------
    "10.1": {
        "content": ["Use vectors in two dimensions and in three dimensions."],
        "info": [r"Students should be familiar with column vectors and with the use of $\mathbf{i}$ and $\mathbf{j}$ unit vectors in two dimensions and $\mathbf{i}$, $\mathbf{j}$ and $\mathbf{k}$ unit vectors in three dimensions."],
    },
    "10.2": {
        "content": ["Calculate the magnitude and direction of a vector and convert between component form and magnitude/direction form."],
        "info": [r"Students should be able to find a unit vector in the direction of $\mathbf{a}$, and be familiar with the notation $|\mathbf{a}|$."],
    },
    "10.3": {
        "content": ["Add vectors diagrammatically and perform the algebraic operations of vector addition and multiplication by scalars, and understand their geometrical interpretations."],
        "info": ["The triangle and parallelogram laws of addition.", "Parallel vectors."],
    },
    "10.4": {
        "content": ["Understand and use position vectors; calculate the distance between two points represented by position vectors."],
        "info": [
            r"$\overrightarrow{OB} - \overrightarrow{OA} = \overrightarrow{AB} = \mathbf{b} - \mathbf{a}$",
            r"The distance $d$ between two points $(x_1, y_1)$ and $(x_2, y_2)$ is given by $d^2 = (x_1 - x_2)^2 + (y_1 - y_2)^2$.",
            r"In three dimensions, the distance $d$ between two points $(x_1, y_1, z_1)$ and $(x_2, y_2, z_2)$ is given by $d^2 = (x_1 - x_2)^2 + (y_1 - y_2)^2 + (z_1 - z_2)^2$.",
        ],
    },
    "10.5": {
        "content": ["Use vectors to solve problems in pure mathematics and in context (including forces)."],
        "info": [
            r"For example, finding position vector of the fourth corner of a shape (e.g. parallelogram) $ABCD$ with three given position vectors for the corners $A$, $B$ and $C$.",
            "Contexts such as velocity, displacement, kinematics and forces will be covered in Paper 3, Sections 6.1, 7.3 and 8.1–8.4.",
        ],
    },
    # ================ Paper 3: Statistics ================
    "S1.1": {
        "content": [
            "Understand and use the terms ‘population’ and ‘sample’.",
            "Use samples to make informal inferences about the population.",
            "Understand and use sampling techniques, including simple random sampling and opportunity sampling.",
            "Select or critique sampling techniques in the context of solving a statistical problem, including understanding that different samples can lead to different conclusions about the population.",
        ],
        "info": [
            "Students will be expected to comment on the advantages and disadvantages associated with a census and a sample.",
            "Students will be expected to be familiar with: simple random sampling, stratified sampling, systematic sampling, quota sampling and opportunity (or convenience) sampling.",
        ],
    },
    "S2.1": {
        "content": [
            "Interpret diagrams for single-variable data, including understanding that area in a histogram represents frequency.",
            "Connect to probability distributions.",
        ],
        "info": ["Students should be familiar with histograms, frequency polygons, box and whisker plots (including outliers) and cumulative frequency diagrams."],
    },
    "S2.2": {
        "content": [
            "Interpret scatter diagrams and regression lines for bivariate data, including recognition of scatter diagrams which include distinct sections of the population (calculations involving regression lines are excluded).",
            "Understand informal interpretation of correlation.",
            "Understand that correlation does not imply causation.",
        ],
        "info": [
            "Students should be familiar with the terms explanatory (independent) and response (dependent) variables.",
            r"Use of interpolation and the dangers of extrapolation. Variables other than $x$ and $y$ may be used.",
            "Use to make predictions within the range of values of the explanatory variable.",
            r"Change of variable may be required, e.g. using knowledge of logarithms to reduce a relationship of the form $y = ax^n$ or $y = kb^x$ into linear form to estimate $a$ and $n$ or $k$ and $b$.",
            "Use of terms such as positive, negative, zero, strong and weak are expected.",
        ],
    },
    "S2.3": {
        "content": [
            "Interpret measures of central tendency and variation, extending to standard deviation.",
            "Be able to calculate standard deviation, including from summary statistics.",
        ],
        "info": [
            "Data may be discrete, continuous, grouped or ungrouped. Understanding and use of coding.",
            "Measures of central tendency: mean, median, mode.",
            "Measures of variation: variance, standard deviation, range and interpercentile ranges.",
            "Use of linear interpolation to calculate percentiles from grouped data is expected.",
            r"Students should be able to use the statistic $S_{xx} = \sum(x - \bar{x})^2 = \sum x^2 - \dfrac{\left(\sum x\right)^2}{n}$.",
            r"Use of standard deviation $= \sqrt{\dfrac{S_{xx}}{n}}$ (or equivalent) is expected but the use of $S = \sqrt{\dfrac{S_{xx}}{n - 1}}$ (as used on spreadsheets) will be accepted.",
        ],
    },
})
TITLES.update({
    "S1.1": "Populations, samples & sampling",
    "S2.1": "Single-variable data & histograms",
    "S2.2": "Scatter diagrams, regression & correlation",
    "S2.3": "Central tendency, variation & standard deviation",
})

SPEC.update({
    "S2.4": {
        "content": [
            "Recognise and interpret possible outliers in data sets and statistical diagrams.",
            "Select or critique data presentation techniques in the context of a statistical problem.",
            "Be able to clean data, including dealing with missing data, errors and outliers.",
        ],
        "info": [
            "Any rule needed to identify outliers will be specified in the question.",
            r"For example, use of $Q_1 - 1.5 \times \text{IQR}$ and $Q_3 + 1.5 \times \text{IQR}$ or mean $\pm\, 3 \times$ standard deviation.",
            "Students will be expected to draw simple inferences and give interpretations to measures of central tendency and variation. Significance tests, other than those mentioned in Section 5, will not be expected.",
            "For example, students may be asked to identify possible outliers on a box plot or scatter diagram.",
        ],
    },
    "S3.1": {
        "content": [
            "Understand and use mutually exclusive and independent events when calculating probabilities.",
            "Link to discrete and continuous distributions.",
        ],
        "info": [
            "Venn diagrams or tree diagrams may be used. Set notation to describe events may be used.",
            r"Use of $\mathrm{P}(B \mid A) = \mathrm{P}(B)$, $\;\mathrm{P}(A \mid B) = \mathrm{P}(A)$, $\;\mathrm{P}(A \cap B) = \mathrm{P}(A)\,\mathrm{P}(B)$ in connection with independent events.",
            "No formal knowledge of probability density functions is required but students should understand that area under the curve represents probability in the case of a continuous distribution.",
        ],
    },
    "S3.2": {
        "content": [
            "Understand and use conditional probability, including the use of tree diagrams, Venn diagrams, two-way tables.",
            r"Understand and use the conditional probability formula $\mathrm{P}(A \mid B) = \dfrac{\mathrm{P}(A \cap B)}{\mathrm{P}(B)}$.",
        ],
        "info": [
            "Understanding and use of",
            r"• $\mathrm{P}(A') = 1 - \mathrm{P}(A)$",
            r"• $\mathrm{P}(A \cup B) = \mathrm{P}(A) + \mathrm{P}(B) - \mathrm{P}(A \cap B)$",
            r"• $\mathrm{P}(A \cap B) = \mathrm{P}(A)\,\mathrm{P}(B \mid A)$",
        ],
    },
    "S3.3": {
        "content": ["Modelling with probability, including critiquing assumptions made and the likely effect of more realistic assumptions."],
        "info": ["For example, questioning the assumption that a die or coin is fair."],
    },
    "S4.1": {
        "content": ["Understand and use simple, discrete probability distributions (calculation of mean and variance of discrete random variables is excluded), including the binomial distribution, as a model; calculate probabilities using the binomial distribution."],
        "info": [
            "Students will be expected to use distributions to model a real-world situation and to comment critically on the appropriateness.",
            "Students should know and be able to identify the discrete uniform distribution.",
            r"The notation $X \sim \mathrm{B}(n, p)$ may be used.",
            "Use of a calculator to find individual or cumulative binomial probabilities.",
        ],
    },
    "S4.2": {
        "content": [
            "Understand and use the Normal distribution as a model; find probabilities using the Normal distribution.",
            "Link to histograms, mean, standard deviation, points of inflection and the binomial distribution.",
        ],
        "info": [
            r"The notation $X \sim \mathrm{N}(\mu, \sigma^2)$ may be used.",
            "Knowledge of the shape and the symmetry of the distribution is required. Knowledge of the probability density function is not required. Derivation of the mean, variance and cumulative distribution function is not required.",
            "Questions may involve the solution of simultaneous equations.",
            "Students will be expected to use their calculator to find probabilities connected with the normal distribution.",
            r"Students should know that the points of inflection on the normal curve are at $x = \mu \pm \sigma$. The derivation of this result is not expected.",
            r"Students should know that when $n$ is large and $p$ is close to 0.5 the distribution $\mathrm{B}(n, p)$ can be approximated by $\mathrm{N}(np, np[1 - p])$.",
            "The application of a continuity correction is expected.",
        ],
    },
    "S4.3": {
        "content": ["Select an appropriate probability distribution for a context, with appropriate reasoning, including recognising when the binomial or Normal model may not be appropriate."],
        "info": ["Students should know under what conditions a binomial distribution or a Normal distribution might be a suitable model."],
    },
    "S5.1": {
        "content": [
            r"Understand and apply the language of statistical hypothesis testing, developed through a binomial model: null hypothesis, alternative hypothesis, significance level, test statistic, 1-tail test, 2-tail test, critical value, critical region, acceptance region, $p$-value;",
            "extend to correlation coefficients as measures of how close data points lie to a straight line,",
            r"and be able to interpret a given correlation coefficient using a given $p$-value or critical value (calculation of correlation coefficients is excluded).",
        ],
        "info": [
            r"An informal appreciation that the expected value of a binomial distribution is given by $np$ may be required for a 2-tail test.",
            r"Students should know that the product moment correlation coefficient $r$ satisfies $|r| \le 1$ and that a value of $r = \pm 1$ means the data points all lie on a straight line.",
            r"Students will be expected to calculate a value of $r$ using their calculator but use of the formula is not required.",
            r"Hypotheses should be stated in terms of $\rho$ with a null hypothesis of $\rho = 0$ where $\rho$ represents the population correlation coefficient.",
            r"Tables of critical values or a $p$-value will be given.",
        ],
    },
    "S5.2": {
        "content": [
            "Conduct a statistical hypothesis test for the proportion in the binomial distribution and interpret the results in context.",
            "Understand that a sample is being used to make an inference about the population and appreciate that the significance level is the probability of incorrectly rejecting the null hypothesis.",
        ],
        "info": [
            r"Hypotheses should be expressed in terms of the population parameter $p$.",
            "A formal understanding of Type I errors is not expected.",
        ],
    },
    "S5.3": {
        "content": ["Conduct a statistical hypothesis test for the mean of a Normal distribution with known, given or assumed variance and interpret the results in context."],
        "info": [
            "Students should know that:",
            r"• if $X \sim \mathrm{N}(\mu, \sigma^2)$ then $\bar{X} \sim \mathrm{N}\left(\mu, \dfrac{\sigma^2}{n}\right)$",
            r"• and that a test for $\mu$ can be carried out using $\dfrac{\bar{X} - \mu}{\sigma / \sqrt{n}} \sim \mathrm{N}(0, 1^2)$.",
            "No proofs required.",
            r"Hypotheses should be stated in terms of the population mean $\mu$.",
            "Knowledge of the Central Limit Theorem or other large sample approximations is not required.",
        ],
    },
    # ================ Paper 3: Mechanics ================
    "M6.1": {
        "content": [
            "Understand and use fundamental quantities and units in the S.I. system: length, time, mass.",
            "Understand and use derived quantities and units: velocity, acceleration, force, weight, moment.",
        ],
        "info": [r"Students may be required to convert one unit into another, e.g. $\text{km h}^{-1}$ into $\text{m s}^{-1}$."],
    },
})
TITLES.update({
    "S2.4": "Outliers & cleaning data",
    "S3.1": "Mutually exclusive & independent events",
    "S3.2": "Conditional probability",
    "S3.3": "Modelling with probability",
    "S4.1": "Discrete distributions & the binomial",
    "S4.2": "The Normal distribution",
    "S4.3": "Choosing a distribution",
    "S5.1": "The language of hypothesis testing",
    "S5.2": "Testing a binomial proportion",
    "S5.3": "Testing a Normal mean",
    "M6.1": "S.I. quantities & units",
})

SPEC.update({
    "M7.1": {
        "content": ["Understand and use the language of kinematics: position; displacement; distance travelled; velocity; speed; acceleration."],
        "info": ["Students should know that distance and speed must be positive."],
    },
    "M7.2": {
        "content": ["Understand, use and interpret graphs in kinematics for motion in a straight line: displacement against time and interpretation of gradient; velocity against time and interpretation of gradient and area under the graph."],
        "info": ["Graphical solutions to problems may be required."],
    },
    "M7.3": {
        "content": [
            "Understand, use and derive the formulae for constant acceleration for motion in a straight line.",
            "Extend to 2 dimensions using vectors.",
        ],
        "info": [
            "Derivation may use knowledge of sections 7.2 and/or 7.4.",
            r"Understand and use suvat formulae for constant acceleration in 2-D, e.g. $\mathbf{v} = \mathbf{u} + \mathbf{a}t$, $\;\mathbf{r} = \mathbf{u}t + \frac{1}{2}\mathbf{a}t^2$ with vectors given in $\mathbf{i}$–$\mathbf{j}$ or column vector form.",
            "Use vectors to solve problems.",
        ],
    },
    "M7.4": {
        "content": [
            "Use calculus in kinematics for motion in a straight line:",
            r"• $v = \dfrac{\mathrm{d}r}{\mathrm{d}t}$, $\;a = \dfrac{\mathrm{d}v}{\mathrm{d}t} = \dfrac{\mathrm{d}^2 r}{\mathrm{d}t^2}$",
            r"• $r = \displaystyle\int v\,\mathrm{d}t$, $\;v = \displaystyle\int a\,\mathrm{d}t$",
            "Extend to 2 dimensions using vectors.",
        ],
        "info": [
            "The level of calculus required will be consistent with that in Sections 7 and 8 in the Pure Mathematics content.",
            r"Differentiation and integration of a vector with respect to time, e.g. given $\mathbf{r} = t^2\mathbf{i} + t^{\frac{3}{2}}\mathbf{j}$, find $\dot{\mathbf{r}}$ and $\ddot{\mathbf{r}}$ at a given time.",
        ],
    },
    "M7.5": {
        "content": ["Model motion under gravity in a vertical plane using vectors; projectiles."],
        "info": ["Derivation of formulae for time of flight, range and greatest height and the derivation of the equation of the path of a projectile may be required."],
    },
    "M8.1": {
        "content": ["Understand the concept of a force; understand and use Newton’s first law."],
        "info": ["Normal reaction, tension, thrust or compression, resistance."],
    },
    "M8.2": {
        "content": ["Understand and use Newton’s second law for motion in a straight line (restricted to forces in two perpendicular directions or simple cases of forces given as 2-D vectors); extend to situations where forces need to be resolved (restricted to 2 dimensions)."],
        "info": [
            "Problems will involve motion in a straight line with constant acceleration in scalar form, where the forces act either parallel or perpendicular to the motion.",
            r"Problems may involve motion in a straight line with constant acceleration in vector form, where the forces are given in $\mathbf{i}$–$\mathbf{j}$ form or as column vectors.",
            "Extend to problems where forces need to be resolved, e.g. a particle moving on an inclined plane.",
        ],
    },
    "M8.3": {
        "content": [
            r"Understand and use weight and motion in a straight line under gravity; gravitational acceleration, $g$, and its value in S.I. units to varying degrees of accuracy.",
            r"(The inverse square law for gravitation is not required and $g$ may be assumed to be constant, but students should be aware that $g$ is not a universal constant but depends on location.)",
        ],
        "info": [r"The default value of $g$ will be $9.8\ \text{m s}^{-2}$ but some questions may specify another value, e.g. $g = 10\ \text{m s}^{-2}$."],
    },
    "M8.4": {
        "content": ["Understand and use Newton’s third law; equilibrium of forces on a particle and motion in a straight line (restricted to forces in two perpendicular directions or simple cases of forces given as 2-D vectors); application to problems involving smooth pulleys and connected particles; resolving forces in 2 dimensions; equilibrium of a particle under coplanar forces."],
        "info": [
            "Connected particle problems could include problems with particles in contact, e.g. lift problems.",
            "Problems may be set where forces need to be resolved, e.g. at least one of the particles is moving on an inclined plane.",
        ],
    },
    "M8.5": {
        "content": ["Understand and use addition of forces; resultant forces; dynamics for motion in a plane."],
        "info": ["Students may be required to resolve a vector into two components or use a vector diagram, e.g. problems involving two or more forces, given in magnitude-direction form."],
    },
    "M8.6": {
        "content": [r"Understand and use the $F \le \mu R$ model for friction; coefficient of friction; motion of a body on a rough surface; limiting friction and statics."],
        "info": [
            r"An understanding of $F = \mu R$ when a particle is moving.",
            r"An understanding of $F \le \mu R$ in a situation of equilibrium.",
        ],
    },
    "M9.1": {
        "content": ["Understand and use moments in simple static contexts."],
        "info": [
            "Equilibrium of rigid bodies.",
            "Problems involving parallel and non-parallel coplanar forces, e.g. ladder problems.",
        ],
    },
})
TITLES.update({
    "M7.1": "The language of kinematics",
    "M7.2": "Kinematics graphs",
    "M7.3": "Constant acceleration (suvat)",
    "M7.4": "Calculus in kinematics",
    "M7.5": "Projectiles",
    "M8.1": "Forces & Newton’s first law",
    "M8.2": "Newton’s second law",
    "M8.3": "Weight & gravity",
    "M8.4": "Newton’s third law, pulleys & connected particles",
    "M8.5": "Resultant forces",
    "M8.6": "Friction",
    "M9.1": "Moments",
})
