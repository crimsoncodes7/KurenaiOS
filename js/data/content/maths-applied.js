/* Kurenai OS — deep content: Applied Mathematics (Stats/Mech) */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["maths:S1.1"] = {
  "notes": [
    {
      "h": "Sampling: the five named methods"
    },
    {
      "callout": {
        "t": "info",
        "h": "B1 Definition Marks",
        "body": "These are recall marks — pure recall, no working. Learn the exact phrases used in the specification."
      }
    },
    {
      "table": {
        "head": ["Method", "Definition (the words that score)", "Random?"],
        "rows": [
          ["Simple random", "Every sample of size $n$ has an equal chance of selection (e.g. numbered list + random number generator)", "Yes"],
          ["Systematic", "Every $k$th element taken from an ordered list, starting from a RANDOM start point", "Yes"],
          ["Stratified", "Population divided into groups (strata); simple random sample taken from each IN PROPORTION to group size", "Yes"],
          ["Quota", "Interviewer selects who they like until quotas per group are filled", "No"],
          ["Opportunity (convenience)", "Sample taken from whoever is available and willing at the time", "No"]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Stratified calculation",
          "m": "School: $600$ Year 12s, $400$ Year 13s. Sample of $50$. $\\text{Year 12: } \\frac{600}{1000} \\times 50 = 30$; $\\text{Year 13: } \\frac{400}{1000} \\times 50 = 20$",
          "n": "$(\\text{group size} \\div \\text{population}) \\times \\text{sample size}$ — show the fraction, then the value."
        }
      ]
    },
    {
      "callout": {
        "t": "warn",
        "h": "Misconception: Systematic Bias",
        "body": "Systematic is only valid with a RANDOM start; \"every $10$th from the top\" without one isn't random sampling. A hidden pattern in the list (e.g. every $10$th house is a corner plot) biases it."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Critique Context",
        "body": "Critique questions are marked IN CONTEXT: \"opportunity sampling outside one gym at $7\\text{am}$ over-represents morning exercisers, so results won't generalise.\" Generic \"it's biased\" scores $0$."
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Census vs Sample",
        "body": "A census surveys the ENTIRE population — perfectly accurate but expensive/slow/destructive. A sample is cheaper and faster but carries sampling error and risks bias."
      }
    }
  ],
  "flashcards": [
    ["Define simple random sampling.", "Every possible sample of size $n$ has an equal chance of being chosen — e.g. number the population and use a random number generator."],
    ["Define systematic sampling.", "Take every $k$th element from an ordered list, starting from a randomly chosen start point."],
    ["Define stratified sampling and its formula.", "Split the population into strata, sample each randomly in proportion: $(\\text{stratum} \\div \\text{population}) \\times \\text{sample size}$."],
    ["Which named methods are NOT random?", "Quota and opportunity (convenience) sampling."],
    ["One advantage and one drawback of a census?", "Completely accurate (whole population); but expensive, slow, and impossible if testing destroys items."]
  ],
  "quiz": [
    {
      "q": "Population $800$, sample $40$, stratum of $220$ students. Stratum sample = ?",
      "opts": ["$22$", "$11$", "$40$", "$5.5$"],
      "ans": 1,
      "why": "$\\frac{220}{800} \\times 40 = 11$."
    },
    {
      "q": "“Every $20$th caller, starting from a random number $1-20$” is…",
      "opts": ["quota", "systematic", "stratified", "opportunity"],
      "ans": 1,
      "why": "Fixed interval + random start = systematic."
    },
    {
      "q": "Crash-testing cars must use a sample because…",
      "opts": ["censuses are illegal", "testing destroys the items", "samples are more accurate", "cars vary"],
      "ans": 1,
      "why": "A census would destroy the entire population — the classic justification."
    }
  ],
  "exam": [
    {
      "q": "A factory employs $350$ machinists, $100$ supervisors and $50$ managers. Explain how a stratified sample of $60$ employees would be taken, showing the number from each group.",
      "marks": 4,
      "ms": [
        "Strata identified as the three job types (1)",
        "Machinists $\\frac{350}{500} \\times 60 = 42$ (1)",
        "Supervisors $12$; managers $6$ (1)",
        "Within each stratum, members selected by simple random sampling (numbered + RNG) (1)"
      ]
    }
  ]
};

C["maths:S2.1"] = {
  "notes": [
    {
      "h": "Histograms: Area is Frequency"
    },
    {
      "callout": {
        "t": "def",
        "h": "Terminology",
        "body": [
          {
            "kv": [
              ["Frequency Density", "Frequency $\\div$ Class Width. The height of the bar in a histogram."],
              ["Area", "In a histogram, $\\text{Area} = \\text{Frequency}$ (or $k \\times \\text{Frequency}$)."],
              ["Cumulative Frequency", "A running total of frequencies, plotted at the UPPER class boundary."]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "True Histograms",
        "body": "$\\text{Frequency Density (FD)} = \\frac{\\text{Frequency}}{\\text{Class Width}}$. Always check if the $y$-axis is $\\text{FD}$ or just $\\text{Frequency}$."
      }
    },
    {
      "table": {
        "head": ["Feature", "Histogram", "Cumulative Frequency Graph"],
        "rows": [
          ["Data Type", "Continuous Grouped", "Continuous Grouped"],
          ["$y$-Axis", "Frequency Density", "Cumulative Frequency"],
          ["$x$-Axis Plot Point", "Bar width = Class interval", "Upper class boundary"],
          ["Interpretation", "Area = Frequency", "Reading percentiles/median"]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Calculating Frequency from Histogram",
          "m": "1. Identify the class width. 2. Read the frequency density ($height$). 3. $\\text{Frequency} = \\text{Width} \\times \\text{Height}$.",
          "n": "If a scale factor $k$ is given, $\\text{Frequency} = k \\times \\text{Width} \\times \\text{Height}$."
        }
      ]
    },
    {
      "callout": {
        "t": "tip",
        "h": "Plotting Rule",
        "body": "For Cumulative Frequency, always plot at the **UPPER** class boundary and join with a smooth curve starting from the lower boundary of the first class at $y=0$."
      }
    }
  ],
  "flashcards": [
    ["Formula for Frequency Density?", "$\\text{Frequency Density} = \\frac{\\text{Frequency}}{\\text{Class Width}}$."],
    ["What does the area of a histogram bar represent?", "The frequency of that class ($\\text{Area} = k \\times \\text{Frequency}$)."],
    ["Where do you plot points for Cumulative Frequency?", "At the UPPER class boundary."],
    ["How do you find the median from a CF graph?", "Find the value on the $x$-axis corresponding to $\\text{CF} = \\frac{n}{2}$ on the $y$-axis."]
  ],
  "quiz": [
    {
      "q": "Class $10-20$, frequency $15$. What is the Frequency Density?",
      "opts": ["$1.5$", "$150$", "$0.67$", "$5$"],
      "ans": 0,
      "why": "$\\text{FD} = \\frac{15}{20-10} = 1.5$."
    },
    {
      "q": "On a histogram, a bar of width $2$ and height $5$ represents frequency $20$. What is the scale factor $k$?",
      "opts": ["$1$", "$2$", "$4$", "$10$"],
      "ans": 1,
      "why": "$\\text{Area} = 2 \\times 5 = 10$. $\\text{Freq} = k \\times \\text{Area} \\Rightarrow 20 = k \\times 10 \\Rightarrow k = 2$."
    }
  ],
  "exam": [
    {
      "q": "A histogram represents the heights of $100$ plants. The bar for $10 < h \\le 15$ has a width of $2\\text{ cm}$ and a height of $5\\text{ cm}$. This bar represents $30$ plants. Find the total area of the histogram in $\\text{cm}^2$.",
      "marks": 3,
      "ms": [
        "Area of bar $= 2 \\times 5 = 10\\text{ cm}^2$ (1)",
        "Frequency per unit area $= \\frac{30}{10} = 3\\text{ plants/cm}^2$ (1)",
        "Total Area $= \\frac{100}{3} = 33.3\\text{ cm}^2$ (1)"
      ]
    }
  ]
};

C["maths:S2.2"] = {
  "notes": [
    {
      "h": "Correlation and Regression"
    },
    {
      "callout": {
        "t": "def",
        "h": "Regression Terminology",
        "body": [
          {
            "kv": [
              ["Explanatory Variable", "The independent variable ($x$), usually on the horizontal axis."],
              ["Response Variable", "The dependent variable ($y$), usually on the vertical axis."],
              ["PMCC ($r$)", "Product Moment Correlation Coefficient. Measures the strength of LINEAR correlation."],
              ["Regression Line", "The line of best fit ($y = a + bx$) that minimises the sum of squares of residuals."]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": ["$r$ value", "Interpretation"],
        "rows": [
          ["$r = 1$", "Perfect positive linear correlation"],
          ["$r \\approx 0.8$", "Strong positive linear correlation"],
          ["$r \\approx 0$", "No linear correlation"],
          ["$r \\approx -0.9$", "Strong negative linear correlation"],
          ["$r = -1$", "Perfect negative linear correlation"]
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Correlation vs Causation",
        "body": "**Correlation $\\neq$ Causation.** Just because two variables are correlated doesn't mean one causes the other (there could be a third 'lurking' variable)."
      }
    },
    {
      "steps": [
        {
          "h": "Using the Regression Line $y = a + bx$",
          "m": "1. Predict $y$ for given $x$: Substitute $x$ into equation. 2. Gradient '$b$': change in $y$ per $1$ unit increase in $x$. 3. '$a$': predicted $y$ when $x = 0$.",
          "n": "Only predict $y$ from $x$ (not $x$ from $y$) and stay within the data range (interpolation)."
        }
      ]
    },
    {
      "callout": {
        "t": "warn",
        "h": "Extrapolation",
        "body": "**Extrapolation** is predicting outside the range of observed data. It is UNRELIABLE as the linear trend may not continue."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Coding & PMCC",
        "body": "**Coding:** PMCC ($r$) is NOT affected by linear coding (e.g., $y = ax + b$). The correlation remains the same."
      }
    }
  ],
  "flashcards": [
    ["What does PMCC ($r$) measure?", "The strength and direction of a LINEAR relationship between two variables."],
    ["Range of values for PMCC?", "$-1$ to $+1$."],
    ["What is interpolation?", "Predicting a value WITHIN the range of the data set — usually reliable."],
    ["How does coding data affect PMCC?", "It doesn't. PMCC is invariant under linear transformation."]
  ],
  "quiz": [
    {
      "q": "If $r = -0.95$, the relationship is…",
      "opts": ["Weak positive", "Strong positive", "Strong negative", "Weak negative"],
      "ans": 2,
      "why": "Close to $-1$ indicates strong negative linear correlation."
    },
    {
      "q": "The regression line is $y = 12 + 0.5x$. Interpretation of $0.5$?",
      "opts": ["$y$ is $0.5$ when $x$ is $0$", "$y$ increases by $0.5$ for every $1$ unit increase in $x$", "$x$ increases by $0.5$ for every $1$ unit increase in $y$", "Correlation is $0.5$"],
      "ans": 1,
      "why": "Gradient '$b$' represents the rate of change."
    }
  ],
  "exam": [
    {
      "q": "A researcher finds $r = 0.02$ between age and hours spent sleeping. Comment on this result.",
      "marks": 2,
      "ms": [
        "$r$ is very close to zero (1)",
        "Suggests no linear correlation between age and hours spent sleeping (1)"
      ]
    }
  ]
};

C["maths:S2.3"] = {
  "notes": [
    {
      "h": "Central Tendency and Variation"
    },
    {
      "callout": {
        "t": "def",
        "h": "Measures Terminology",
        "body": [
          {
            "kv": [
              ["Mean ($\\bar{x}$)", "$\\sum x / n$. The average value."],
              ["Median", "The middle value when data is ordered."],
              ["Variance ($\\sigma^2$)", "Mean of the squares minus square of the mean: $\\frac{\\sum x^2}{n} - (\\frac{\\sum x}{n})^2$."],
              ["Standard Deviation ($\\sigma$)", "The square root of the variance."]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": ["Measure", "Formula / Method", "Sensitivity"],
        "rows": [
          ["Mean", "$\\sum x / n$", "Affected by all values (and outliers)"],
          ["Median", "$(n+1)/2$ position", "Robust to outliers"],
          ["Mode", "Most frequent", "Used for qualitative data"],
          ["Variance", "$\\frac{\\sum x^2}{n} - \\bar{x}^2$", "Measures spread about the mean"]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Linear Interpolation",
          "m": "$L + \\left[ \\frac{\\frac{n}{2} - F}{f} \\times w \\right]$ where $L$ is lower bound, $F$ is CF before class, $f$ is frequency, $w$ is width.",
          "n": "Use this for median or quartiles in grouped frequency tables."
        }
      ]
    },
    {
      "callout": {
        "t": "info",
        "h": "Standard Deviation",
        "body": "$\\sigma = \\sqrt{ \\frac{\\sum x^2}{n} - \\left(\\frac{\\sum x}{n}\\right)^2 }$. Think: 'Mean of squares minus square of mean'."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Coding Effects",
        "body": "If $y = \\frac{x - a}{b}$, then $\\bar{y} = \\frac{\\bar{x} - a}{b}$ and $\\sigma_y = \\frac{\\sigma_x}{b}$. Addition '$a$' does NOT affect spread."
      }
    }
  ],
  "flashcards": [
    ["Formula for Variance?", "$\\frac{\\sum x^2}{n} - \\bar{x}^2$."],
    ["How does adding $10$ to every point affect the Mean and SD?", "Mean increases by $10$; SD remains unchanged."],
    ["When is the median preferred over the mean?", "When the data set contains extreme outliers (skewed data)."]
  ],
  "quiz": [
    {
      "q": "$\\sum x = 100$, $\\sum x^2 = 2500$, $n = 10$. Find $\\sigma$.",
      "opts": ["$15$", "$10$", "$12.2$", "$5$"],
      "ans": 2,
      "why": "$\\text{Var} = \\frac{2500}{10} - 10^2 = 150$. $\\sigma = \\sqrt{150} \\approx 12.25$."
    }
  ],
  "exam": [
    {
      "q": "For $20$ numbers, $\\sum x = 400$ and $\\sum x^2 = 8200$. A $21$st number, $30$, is added. New mean?",
      "marks": 3,
      "ms": [
        "New $\\sum x = 400 + 30 = 430$ (1)",
        "New $n = 21$ (1)",
        "New mean $= 430 / 21 = 20.48$ (1)"
      ]
    }
  ]
};

C["maths:S2.4"] = {
  "notes": [
    {
      "h": "Outliers and Cleaning Data"
    },
    {
      "callout": {
        "t": "def",
        "h": "Outlier Rules",
        "body": [
          {
            "kv": [
              ["$1.5 \\times \\text{IQR}$ Rule", "Outliers are $< Q_1 - 1.5\\text{IQR}$ or $> Q_3 + 1.5\\text{IQR}$."],
              ["$2\\sigma$ Rule", "Outliers are more than $2$ standard deviations from the mean ($\\bar{x} \\pm 2\\sigma$)."],
              ["Cleaning Data", "The process of identifying and dealing with errors or anomalies."]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": ["Step", "Action", "Reason"],
        "rows": [
          ["Identification", "Apply outlier rules", "Find suspicious data points"],
          ["Investigation", "Check original source", "Determine if it's a genuine extreme or an error"],
          ["Decision", "Keep, Correct, or Remove", "Error data is removed; genuine extremes are kept"]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Finding Outliers using IQR",
          "m": "1. Calculate $Q_1$ and $Q_3$. 2. $\\text{IQR} = Q_3 - Q_1$. 3. $\\text{Lower Limit} = Q_1 - 1.5\\text{IQR}$. 4. $\\text{Upper Limit} = Q_3 + 1.5\\text{IQR}$.",
          "n": "Any data point outside these limits is an outlier."
        }
      ]
    }
  ],
  "flashcards": [
    ["Standard outlier rule for quartiles?", "$V < Q_1 - 1.5\\text{IQR}$ or $V > Q_3 + 1.5\\text{IQR}$."],
    ["Why might you keep an outlier?", "If it represents a genuine but rare occurrence in the population."]
  ],
  "quiz": [
    {
      "q": "$Q_1 = 20$, $Q_3 = 30$. Which is an outlier?",
      "opts": ["$4.9$", "$35$", "$5.1$", "$25$"],
      "ans": 0,
      "why": "$\\text{IQR} = 10$. $\\text{Lower} = 20 - 15 = 5$. $4.9 < 5$."
    }
  ],
  "exam": [
    {
      "q": "Weights of $10$ bags (kg): $1.0, 1.1, 1.0, 0.9, 1.0, 1.1, 2.5, 1.0, 0.9, 1.0$. Use $2\\sigma$ rule for $2.5$.",
      "marks": 4,
      "ms": [
        "$\\bar{x} = 1.15$ (1)",
        "$\\sigma \\approx 0.45$ (1)",
        "Limit $= 1.15 + 2(0.45) = 2.05$ (1)",
        "$2.5 > 2.05$, so it is an outlier (1)"
      ]
    }
  ]
};

C["maths:S3.1"] = {
  "notes": [
    {
      "h": "Mutually Exclusive and Independent Events"
    },
    {
      "callout": {
        "t": "def",
        "h": "Probability Terminology",
        "body": [
          {
            "kv": [
              ["Mutually Exclusive", "Events that cannot happen at the same time: $P(A \\cap B) = 0$."],
              ["Independent", "Occurrence of one does not affect the other: $P(A \\cap B) = P(A) \\times P(B)$."],
              ["Intersection ($\\cap$)", "Both $A$ AND $B$ occur."],
              ["Union ($\\cup$)", "$A$ OR $B$ (or both) occur."]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": ["Condition", "Formula / Rule"],
        "rows": [
          ["General Union", "$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$"],
          ["Mutually Exclusive", "$P(A \\cup B) = P(A) + P(B)$"],
          ["Independent", "$P(A \\cap B) = P(A) \\times P(B)$"],
          ["Complement", "$P(A') = 1 - P(A)$"]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Proving Independence",
          "m": "1. Calculate $P(A) \\times P(B)$. 2. Find $P(A \\cap B)$ from data. 3. Compare values.",
          "n": "If equal, events are independent."
        }
      ]
    }
  ],
  "flashcards": [
    ["Definition of Mutually Exclusive?", "Events where $P(A \\cap B) = 0$."],
    ["Definition of Independent?", "Events where $P(A \\cap B) = P(A)P(B)$."]
  ],
  "quiz": [
    {
      "q": "$P(A)=0.5, P(B)=0.4$. If independent, $P(A \\cap B) = ?$",
      "opts": ["$0.9$", "$0.1$", "$0.2$", "$0$"],
      "ans": 2,
      "why": "$0.5 \\times 0.4 = 0.2$."
    }
  ],
  "exam": [
    {
      "q": "$P(A)=0.5, P(B)=0.3, P(A \\cup B)=0.6$. Show not independent.",
      "marks": 3,
      "ms": [
        "$P(A \\cap B) = 0.5 + 0.3 - 0.6 = 0.2$ (1)",
        "$P(A)P(B) = 0.5 \\times 0.3 = 0.15$ (1)",
        "$0.2 \\neq 0.15$, so not independent (1)"
      ]
    }
  ]
};

C["maths:S3.2"] = {
  "notes": [
    {
      "h": "Conditional Probability"
    },
    {
      "callout": {
        "t": "def",
        "h": "Conditional Terminology",
        "body": [
          {
            "kv": [
              ["$P(A|B)$", "Probability of $A$ given that $B$ has already occurred."],
              ["Tree Diagram", "Branches show conditional probabilities."],
              ["Two-way Table", "Frequency distribution of two variables."]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Formula",
        "body": "$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$. Think: 'Probability of both, restricted to the world where $B$ happened'."
      }
    },
    {
      "steps": [
        {
          "h": "Solving from Venn Diagram",
          "m": "1. Identify area for $B$ (denominator). 2. Identify area for $A \\cap B$ (numerator). 3. Divide.",
          "n": "The 'Universe' shrinks from $1$ to $P(B)$."
        }
      ]
    }
  ],
  "flashcards": [
    ["Formula for $P(B|A)$?", "$P(B \\cap A) / P(A)$."],
    ["What if $P(A|B) = P(A)$?", "Events $A$ and $B$ are independent."]
  ],
  "quiz": [
    {
      "q": "$P(B)=0.4, P(A \\cap B)=0.1$. Find $P(A|B)$.",
      "opts": ["$0.25$", "$4$", "$0.5$", "$0.04$"],
      "ans": 0,
      "why": "$0.1 / 0.4 = 0.25$."
    }
  ],
  "exam": [
    {
      "q": "$100$ students: $60$ study Math, $40$ study Physics, $20$ both. Given Math, find prob Physics.",
      "marks": 3,
      "ms": [
        "$P(M) = 0.6, P(M \\cap P) = 0.2$ (1)",
        "$P(P|M) = 0.2 / 0.6$ (1)",
        "$= 1/3$ (1)"
      ]
    }
  ]
};

C["maths:S3.3"] = {
  "notes": [
    {
      "h": "Modelling with Probability"
    },
    {
      "callout": {
        "t": "def",
        "h": "Modelling Terminology",
        "body": [
          {
            "kv": [
              ["Assumption", "A simplifying rule made to create a model."],
              ["Refinement", "Improving a model by making it more realistic."],
              ["Validity", "How well predictions match real-world observations."]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": ["Model", "Common Assumptions"],
        "rows": [
          ["Coin Tossing", "Fair coin ($P=0.5$), Independent tosses"],
          ["Weather", "Independence (often false), Constant probability"],
          ["Games", "Randomness, No cheating/bias"]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Critiquing a Model",
          "m": "1. List assumptions. 2. Look for real-world failures. 3. Suggest improvement.",
          "n": "Example: $P(\\text{Goal})$ isn't constant in football; depends on time, morale."
        }
      ]
    }
  ],
  "flashcards": [
    ["Why make assumptions?", "To simplify complex real-world situations into solvable math."],
    ["How to test validity?", "Compare predicted outcomes with actual experimental data."]
  ],
  "quiz": [
    {
      "q": "Which is a common assumption for binomial?",
      "opts": ["Dependent trials", "Changing $p$", "Fixed $n$", "Infinite outcomes"],
      "ans": 2,
      "why": "Requires fixed $n$, constant $p$, independence."
    }
  ],
  "exam": [
    {
      "q": "Spinner spun $50$ times, lands on '6' $20$ times. Model $P(6) = 1/6$. Critique.",
      "marks": 2,
      "ms": [
        "Expected $6\\text{s} = 50 \\times (1/6) \\approx 8.3$ (1)",
        "Observed $20$ is significantly higher, suggesting bias (1)"
      ]
    }
  ]
};

C["maths:S4.1"] = {
  "notes": [
    {
      "h": "The Binomial Distribution"
    },
    {
      "callout": {
        "t": "info",
        "h": "Modelling Conditions",
        "body": "Quote all four in context: 1. FIXED number of trials ($n$). 2. TWO outcomes per trial. 3. CONSTANT $p$. 4. INDEPENDENT trials."
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Formula",
        "body": "$P(X = x) = ^nC_x p^x(1-p)^{n-x}$. Mean is $np$."
      }
    },
    {
      "table": {
        "head": ["English", "Rewrite as", "Why"],
        "rows": [
          ["at most $4$", "$P(X \\le 4)$", "direct"],
          ["fewer than $4$", "$P(X \\le 3)$", "strict $<$ drops one"],
          ["at least $4$", "$1 - P(X \\le 3)$", "complement"],
          ["more than $4$", "$1 - P(X \\le 4)$", "complement of $\\le$"]
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Strictly Drop One",
        "body": "Any STRICT inequality ($<$ or $>$) shifts the boundary by $1$ for the calculator. $P(X < k) = P(X \\le k-1)$."
      }
    }
  ],
  "flashcards": [
    ["Mean of $B(n, p)$?", "$np$."],
    ["$P(X > k)$ in calculator form?", "$1 - P(X \\le k)$."]
  ],
  "quiz": [
    {
      "q": "$X \\sim B(20, 0.3)$. 'Fewer than $5$ successes' = ?",
      "opts": ["$P(X \\le 5)$", "$P(X \\le 4)$", "$1 - P(X \\le 5)$", "$P(X = 4)$"],
      "ans": 1,
      "why": "Strictly fewer than $5$ means at most $4$."
    }
  ],
  "exam": [
    {
      "q": "Spinner lands on red with $p=0.25$. Spun $12$ times. Find $P(\\text{more than } 4 \\text{ reds})$.",
      "marks": 3,
      "ms": [
        "$X \\sim B(12, 0.25)$ (1)",
        "$P(X > 4) = 1 - P(X \\le 4)$ (1)",
        "$= 0.158$ (3 s.f.) (1)"
      ]
    }
  ]
};

C["maths:S4.2"] = {
  "notes": [
    {
      "h": "The Normal Distribution"
    },
    {
      "callout": {
        "t": "def",
        "h": "Notation",
        "body": "$X \\sim N(\\mu, \\sigma^2)$. Symmetric about mean $\\mu$. Parameters are mean and VARIANCE."
      }
    },
    {
      "steps": [
        {
          "h": "The Three-Step Routine",
          "m": "1. SKETCH the bell. 2. STANDARDISE: $Z = (X - \\mu)/\\sigma$. 3. Look up / calculator.",
          "n": "Standardisation line is the method mark."
        }
      ]
    },
    {
      "callout": {
        "t": "warn",
        "h": "Continuity Correction",
        "body": "When approximating $B(n, p)$, $P(X \\le 30)$ becomes $P(Y < 30.5)$. Forgetting $\\pm 0.5$ is a standard error."
      }
    }
  ],
  "flashcards": [
    ["Standardisation formula?", "$Z = (X - \\mu)/\\sigma$."],
    ["Where are points of inflection?", "At $\\mu \\pm \\sigma$."]
  ],
  "quiz": [
    {
      "q": "$X \\sim N(100, 25)$. $P(X < 100) = ?$",
      "opts": ["$0.25$", "$0.5$", "$0.95$", "depends"],
      "ans": 1,
      "why": "Symmetry about the mean."
    }
  ],
  "exam": [
    {
      "q": "Apples are $N(160, 15^2)$. $10\\%$ are lighter than $m\\text{ g}$. Find $m$.",
      "marks": 3,
      "ms": [
        "Inverse normal: $z = -1.2816$ for lower $10\\%$ (1)",
        "$m = 160 + (-1.2816)(15)$ (1)",
        "$m = 141\\text{ g}$ (1)"
      ]
    }
  ]
};

C["maths:S4.3"] = {
  "notes": [
    {
      "h": "Distribution Selection & Modelling"
    },
    {
      "callout": {
        "t": "def",
        "h": "The Core Three",
        "body": [
          {
            "kv": [
              ["Binomial $B(n, p)$", "Discrete counting. Fixed trials, independent, constant $p$."],
              ["Normal $N(\\mu, \\sigma^2)$", "Continuous measurement. Symmetric clustering."],
              ["Uniform $U(a, b)$", "Equal probability for all outcomes in a range."]
            ]
          }
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Approximation Routine",
          "m": "1. Check $n > 50$ and $np > 5$. 2. $\\mu = np, \\sigma = \\sqrt{np(1-p)}$. 3. Apply Continuity Correction ($\\pm 0.5$). 4. Standardise.",
          "n": "Crucial: Binomial is 'stairs', Normal is 'slope'. $0.5$ fills the gap."
        }
      ]
    }
  ],
  "flashcards": [
    ["Criteria for Normal approx to Binomial?", "$n$ large, $p \\approx 0.5$ (so $np > 5$ and $nq > 5$)."],
    ["Mean and Variance of $B(n, p)$?", "Mean $= np$, Variance $= np(1-p)$."]
  ],
  "quiz": [
    {
      "q": "Measuring heights of $1000$ trees. Model?",
      "opts": ["Binomial", "Normal", "Uniform", "Discrete"],
      "ans": 1,
      "why": "Measurement data clusters symmetrically."
    }
  ],
  "exam": [
    {
      "q": "$X \\sim B(80, 0.4)$. Find $P(30 \\le X \\le 40)$ using Normal approx.",
      "marks": 4,
      "ms": [
        "$\\mu = 32, \\sigma^2 = 19.2$ (1)",
        "Continuity correction: $P(29.5 < Y < 40.5)$ (1)",
        "$Z$ values $-0.57$ and $1.94$ (1)",
        "Prob $= 0.6895$ (1)"
      ]
    }
  ]
};

C["maths:S5.1"] = {
  "notes": [
    {
      "h": "Language of Hypothesis Testing"
    },
    {
      "callout": {
        "t": "def",
        "h": "Hypotheses",
        "body": [
          {
            "kv": [
              ["Null ($H_0$)", "Status quo. Always uses '=' (e.g. $p = 0.5$)."],
              ["Alternative ($H_1$)", "Claim. Uses $>$, $<$ or $\\neq$."]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Significance & Regions",
        "body": [
          {
            "kv": [
              ["Significance Level ($\\alpha$)", "Risk threshold (usually $5\\%$). Prob of rejecting $H_0$ if true."],
              ["Critical Region (CR)", "Reject Zone. Enough evidence if result falls here."],
              ["$p$-value", "Prob of result by luck. If $p < \\alpha$, reject $H_0$."]
            ]
          }
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Standard Test Workflow",
          "m": "1. Define parameter $p$. 2. State $H_0, H_1$. 3. Calc test stat. 4. Find $p$-value or CR. 5. Compare. 6. Conclude in context.",
          "n": "Never use 'Prove'. Always 'evidence to suggest'."
        }
      ]
    }
  ],
  "flashcards": [
    ["What is a 'Critical Region'?", "Set of values leading to rejection of $H_0$."],
    ["Two-tailed test at $5\\%$: check each tail against?", "$0.025$ ($\\alpha / 2$)."]
  ],
  "quiz": [
    {
      "q": "$p$-value $0.042$, $\\alpha = 0.05$. Result?",
      "opts": ["Reject $H_0$", "Fail to reject", "Accept $H_0$"],
      "ans": 0,
      "why": "$0.042 < 0.05$."
    }
  ],
  "exam": [
    {
      "q": "Toss coin $20$ times. $H_0: p=0.5, H_1: p>0.5$. Find CR at $5\\%$ level.",
      "marks": 3,
      "ms": [
        "$X \\sim B(20, 0.5)$ under $H_0$ (1)",
        "$P(X \\ge 14) = 0.0577, P(X \\ge 15) = 0.0207$ (1)",
        "CR is $X \\ge 15$ (1)"
      ]
    }
  ]
};

C["maths:S5.2"] = {
  "notes": [
    {
      "h": "Binomial Hypothesis Testing"
    },
    {
      "callout": {
        "t": "tip",
        "h": "HEN CC Scaffold",
        "body": "**HEN CC** — **H**ypotheses, **E**xpected model, **N**umbers (prob/CR), **C**ompare, **C**onclude in context."
      }
    },
    {
      "steps": [
        {
          "h": "H — Hypotheses",
          "m": "Let $p$ be pop proportion. $H_0: p = 0.3, H_1: p > 0.3$.",
          "n": "Defining $p$ in words is a B1 mark."
        },
        {
          "h": "E — Model",
          "m": "Under $H_0, X \\sim B(20, 0.3)$."
        },
        {
          "h": "N — Numbers",
          "m": "Observed $x = 10$. $P(X \\ge 10) = 1 - P(X \\le 9) = 0.0480$."
        }
      ]
    }
  ],
  "flashcards": [
    ["What does HEN CC stand for?", "Hypotheses, Expected model, Numbers, Compare, Conclude."],
    ["Conclusion wording for significant result?", "'Significant evidence to suggest [context]'. No 'proof'."]
  ],
  "quiz": [
    {
      "q": "Testing bias TOWARD heads: $H_1$ is?",
      "opts": ["$p \\neq 0.5$", "$p > 0.5$", "$p < 0.5$"],
      "ans": 1,
      "why": "Direction stated."
    }
  ],
  "exam": [
    {
      "q": "Gardener suspects germination rate below $80\\%$. $12/20$ germinate. Test at $5\\%$ level.",
      "marks": 6,
      "ms": [
        "$H_0: p=0.8, H_1: p<0.8$ (1)",
        "$X \\sim B(20, 0.8)$ under $H_0$ (1)",
        "$P(X \\le 12) = 0.0321$ (1)",
        "$0.0321 < 0.05 \\Rightarrow$ Reject $H_0$ (1)",
        "Evidence to suggest rate is below $80\\%$ (2)"
      ]
    }
  ]
};

C["maths:S5.3"] = {
  "notes": [
    {
      "h": "Normal Mean Hypothesis Testing"
    },
    {
      "callout": {
        "t": "def",
        "h": "Sample Mean Distribution",
        "body": "If $X \\sim N(\\mu, \\sigma^2)$, then $\\bar{X} \\sim N(\\mu, \\sigma^2/n)$. Standard Error is $\\sigma / \\sqrt{n}$."
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Test Statistic",
        "body": "$Z = \\frac{\\bar{X} - \\mu_0}{\\sigma / \\sqrt{n}}$. Compare to $Z_{crit}$ (e.g. $1.96$ for $5\\%$ two-tail)."
      }
    },
    {
      "steps": [
        {
          "h": "The 6-Step Mean Test",
          "m": "1. Hypotheses ($H_0: \\mu = k$). 2. Distribution of $\\bar{X}$. 3. Calc $Z$. 4. Compare. 5. Conclude.",
          "n": "Always divide pop variance by $n$."
        }
      ]
    }
  ],
  "flashcards": [
    ["Define 'Standard Error'.", "Standard deviation of sample mean: $\\sigma / \\sqrt{n}$."],
    ["$Z_{crit}$ for $5\\%$ two-tailed?", "$\\pm 1.96$."]
  ],
  "quiz": [
    {
      "q": "$X \\sim N(100, 64), n=16$. Standard Error?",
      "opts": ["$8$", "$4$", "$2$", "$0.5$"],
      "ans": 2,
      "why": "$\\sigma = 8$. $\\text{SE} = 8 / \\sqrt{16} = 2$."
    }
  ],
  "exam": [
    {
      "q": "Machine mean $5.0\\text{cm}, \\sigma=0.1$. Sample $n=25, \\bar{x}=5.05$. Test at $1\\%$ level if increased.",
      "marks": 6,
      "ms": [
        "$H_0: \\mu=5.0, H_1: \\mu>5.0$ (1)",
        "$Z = (5.05 - 5.0) / (0.1/\\sqrt{25}) = 2.5$ (2)",
        "Crit value $2.3263$ (1)",
        "$2.5 > 2.3263 \\Rightarrow$ Reject $H_0$ (1)",
        "Evidence to suggest mean increased (1)"
      ]
    }
  ]
};

C["maths:S6.1"] = {
  "notes": [
    {
      "h": "S.I. Units in Mechanics"
    },
    {
      "callout": {
        "t": "def",
        "h": "Base Units",
        "body": [
          {
            "kv": [
              ["Mass", "Kilogram ($\text{kg}$)"],
              ["Length", "Metre ($\text{m}$)"],
              ["Time", "Second ($\text{s}$)"]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": ["Quantity", "Standard Unit", "Base Units"],
        "rows": [
          ["Velocity ($v$)", "$\text{m s}^{-1}$", "$\text{m/s}$"],
          ["Acceleration ($a$)", "$\text{m s}^{-2}$", "$\text{m/s}^2$"],
          ["Force ($F$)", "Newton ($\text{N}$)", "$\text{kg m s}^{-2}$"],
          ["Energy ($E$)", "Joule ($\text{J}$)", "$\text{kg m}^2 \text{s}^{-2}$"]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Dimensional Homogeneity",
          "m": "Check that every term in an equation (e.g. $s = ut + \\frac{1}{2}at^2$) has the same base units.",
          "n": "Constants like $\\frac{1}{2}$ are dimensionless."
        }
      ]
    }
  ],
  "flashcards": [
    ["Base units of Newton?", "$\text{kg m s}^{-2}$."],
    ["Why is kg special?", "Only base unit with a prefix."]
  ],
  "quiz": [
    {
      "q": "Convert $90\\text{ km/h}$ to $\text{m/s}$.",
      "opts": ["$25$", "$32.4$", "$900$"],
      "ans": 0,
      "why": "$90,000 / 3,600 = 25$."
    }
  ],
  "exam": [
    {
      "q": "Determine base units of $G$ from $F = G m_1 m_2 / r^2$.",
      "marks": 3,
      "ms": [
        "$G = F r^2 / (m_1 m_2)$ (1)",
        "Units: $(\text{kg m s}^{-2})(\text{m}^2) / (\text{kg}^2)$ (1)",
        "$= \text{kg}^{-1} \text{m}^3 \text{s}^{-2}$ (1)"
      ]
    }
  ]
};

C["maths:S7.1"] = {
  "notes": [
    {
      "h": "Language of Kinematics"
    },
    {
      "callout": {
        "t": "def",
        "h": "Vectors vs Scalars",
        "body": [
          {
            "kv": [
              ["Scalar", "Magnitude only: Distance, Speed, Time, Mass."],
              ["Vector", "Magnitude and Direction: Displacement ($s$), Velocity ($v$), Accel ($a$)."]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Averages",
        "body": "Average Speed $= \\frac{\\text{Total Distance}}{\\text{Total Time}}$. Average Velocity $= \\frac{\\text{Total Displacement}}{\\text{Total Time}}$."
      }
    }
  ],
  "flashcards": [
    ["Difference between speed and velocity?", "Speed is scalar; velocity is vector."],
    ["Define 'at rest'.", "$v = 0$."]
  ],
  "quiz": [
    {
      "q": "Swim $50\\text{m}$ and back. Displacement?",
      "opts": ["$100\\text{m}$", "$50\\text{m}$", "$0\\text{m}$"],
      "ans": 2,
      "why": "Starts and ends at O."
    }
  ],
  "exam": [
    {
      "q": "Calculate avg speed for $100\\text{m}$ in $70\\text{s}$ total journey.",
      "marks": 2,
      "ms": [
        "Avg speed $= 100/70$ (1)",
        "$= 1.43\\text{ m/s}$ (1)"
      ]
    }
  ]
};

C["maths:S7.2"] = {
  "notes": [
    {
      "h": "Kinematics Graphs"
    },
    {
      "table": {
        "head": ["Graph", "Gradient", "Area"],
        "rows": [
          ["$s-t$", "Velocity ($v$)", "N/A"],
          ["$v-t$", "Acceleration ($a$)", "Displacement ($s$)"],
          ["$a-t$", "Rate of change of $a$", "Change in $v$"]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Distance from $v-t$ graph",
          "m": "Sum absolute areas of triangles/trapeziums.",
          "n": "Displacement is net area (Above - Below)."
        }
      ]
    }
  ],
  "flashcards": [
    ["Gradient of $v-t$?", "Acceleration."],
    ["Area of $v-t$?", "Displacement."]
  ],
  "quiz": [
    {
      "q": "$v-t$ triangle: base $10$, height $20$. $s = ?$",
      "opts": ["$200$", "$100$", "$2$"],
      "ans": 1,
      "why": "$\\frac{1}{2} \\times 10 \\times 20 = 100$."
    }
  ],
  "exam": [
    {
      "q": "Car accelerates $0$ to $15$ in $10\\text{s}$, stays $20\\text{s}$, slows in $5\\text{s}$. Total dist?",
      "marks": 3,
      "ms": [
        "Trapezium areas or parts (1)",
        "Area $= \\frac{1}{2}(20 + 35) \\times 15$ (1)",
        "$= 412.5\\text{m}$ (1)"
      ]
    }
  ]
};

C["maths:S7.3"] = {
  "notes": [
    {
      "h": "suvat: Constant Acceleration"
    },
    {
      "callout": {
        "t": "info",
        "h": "The Five Equations",
        "body": "$v = u + at$; $s = ut + \\frac{1}{2}at^2$; $s = \\frac{1}{2}(u+v)t$; $v^2 = u^2 + 2as$; $s = vt - \\frac{1}{2}at^2$."
      }
    },
    {
      "steps": [
        {
          "h": "The Routine",
          "m": "1. List $s, u, v, a, t$. 2. Declare positive direction. 3. Pick equation. 4. Solve.",
          "n": "Gravity $a = -9.8\\text{ m s}^{-2}$ if up is positive."
        }
      ]
    }
  ],
  "flashcards": [
    ["When is suvat invalid?", "Variable acceleration."],
    ["At max height, what is zero?", "Vertical velocity $v_y$."]
  ],
  "quiz": [
    {
      "q": "Know $u, a, t$; want $s$, no $v$. Use?",
      "opts": ["$v^2=u^2+2as$", "$s=ut+\\frac{1}{2}at^2$", "$v=u+at$"],
      "ans": 1,
      "why": "Missing $v$."
    }
  ],
  "exam": [
    {
      "q": "Car $8\\text{ m/s}$ to $20\\text{ m/s}$ over $150\\text{m}$. Find $a$.",
      "marks": 3,
      "ms": [
        "$v^2 = u^2 + 2as$ (1)",
        "$400 = 64 + 300a$ (1)",
        "$a = 1.12\\text{ m/s}^2$ (1)"
      ]
    }
  ]
};

C["maths:S7.4"] = {
  "notes": [
    {
      "h": "Calculus in Kinematics"
    },
    {
      "steps": [
        {
          "h": "Differentiation Chain",
          "m": "$s(t) \\xrightarrow{d/dt} v(t) \\xrightarrow{d/dt} a(t)$."
        },
        {
          "h": "Integration Chain",
          "m": "$a(t) \\xrightarrow{\\int} v(t) \\xrightarrow{\\int} s(t)$. Always add $+c$.",
          "n": "Use boundary conditions to find constants."
        }
      ]
    },
    {
      "callout": {
        "t": "tip",
        "h": "Distance Travelled",
        "body": "Integrate $|v(t)|$ or split integral at points where $v=0$ if particle changes direction."
      }
    }
  ],
  "flashcards": [
    ["How to find velocity from displacement?", "$v = ds/dt$."],
    ["What to add when integrating?", "Constant of integration $+C$."]
  ],
  "quiz": [
    {
      "q": "$s = 2t^3 - 5t$. $v$ at $t=2$?",
      "opts": ["$19$", "$11$", "$24$"],
      "ans": 0,
      "why": "$v = 6t^2 - 5$. $6(4)-5 = 19$."
    }
  ],
  "exam": [
    {
      "q": "$a = 3t^2 - 4, v(0)=2, s(0)=5$. Find $s(2)$.",
      "marks": 5,
      "ms": [
        "$v = t^3 - 4t + 2$ (1)",
        "$s = \\frac{1}{4}t^4 - 2t^2 + 2t + 5$ (2)",
        "$s(2) = 4 - 8 + 4 + 5 = 5\\text{m}$ (2)"
      ]
    }
  ]
};

C["maths:S7.5"] = {
  "notes": [
    {
      "h": "Projectiles"
    },
    {
      "callout": {
        "t": "info",
        "h": "Independence",
        "body": "Horizontal: $a=0, v_x = u\\cos\\theta, x = (u\\cos\\theta)t$. Vertical: $a=-g, y = (u\\sin\\theta)t - \\frac{1}{2}gt^2$."
      }
    },
    {
      "steps": [
        {
          "h": "Resolution",
          "m": "Resolve $u$ into $u_x, u_y$. Solve $x, y$ independently.",
          "n": "Time $t$ is the common link."
        }
      ]
    }
  ],
  "flashcards": [
    ["Horizontal acceleration?", "Zero."],
    ["Vertical acceleration?", "$-9.8\\text{ m/s}^2$."]
  ],
  "quiz": [
    {
      "q": "$u=20$ at $30^\\circ$. Initial $v_y$?",
      "opts": ["$10$", "$17.3$", "$20$"],
      "ans": 0,
      "why": "$20\\sin 30 = 10$."
    }
  ],
  "exam": [
    {
      "q": "$28\\text{ m/s}$ at $30^\\circ$. Range?",
      "marks": 3,
      "ms": [
        "$t_{flight} = 2.86\\text{ s}$ (1)",
        "$x = (28\\cos 30) \\times 2.86$ (1)",
        "$= 69.3\\text{m}$ (1)"
      ]
    }
  ]
};

C["maths:S8.1"] = {
  "notes": [
    {
      "h": "Newton's First Law"
    },
    {
      "callout": {
        "t": "info",
        "h": "The Law",
        "body": "Object stays at rest or constant velocity unless acted on by a resultant force."
      }
    },
    {
      "steps": [
        {
          "h": "Equilibrium",
          "m": "Sum of forces is zero. $\\sum F_x = 0$ and $\\sum F_y = 0$.",
          "n": "Constant speed in straight line is equilibrium."
        }
      ]
    }
  ],
  "flashcards": [
    ["What is inertia?", "Resistance to change in motion. Measured by mass."],
    ["Resultant force on car at steady speed?", "Zero."]
  ],
  "quiz": [
    {
      "q": "$1000\\text{kg}$ car at steady $30\\text{ m/s}$. Net force?",
      "opts": ["$30000$", "$0$", "$9800$"],
      "ans": 1,
      "why": "Constant velocity."
    }
  ],
  "exam": [
    {
      "q": "$F_1 = (3i+5j), F_2 = (-i+2j)$. Find $F_3$ for equilibrium.",
      "marks": 3,
      "ms": [
        "$F_1 + F_2 + F_3 = 0$ (1)",
        "$(2i + 7j) + F_3 = 0$ (1)",
        "$F_3 = -2i - 7j$ (1)"
      ]
    }
  ]
};

C["maths:S8.2"] = {
  "notes": [
    {
      "h": "Newton's Second Law: $F=ma$"
    },
    {
      "steps": [
        {
          "h": "Routine",
          "m": "1. Draw diagram. 2. Resolve. 3. $F_{net} = ma$ along motion; $0$ perp.",
          "n": "Weight is $mg$ (Newtons), mass is $m$ (kg)."
        }
      ]
    },
    {
      "callout": {
        "t": "tip",
        "h": "Sin Slides",
        "body": "On a slope, $mg\\sin\\theta$ slides it down; $mg\\cos\\theta$ presses it in."
      }
    }
  ],
  "flashcards": [
    ["Newton's Second Law?", "$F = ma$."],
    ["Weight vs Mass?", "$W=mg$ (Force); $m$ is matter (Inertia)."]
  ],
  "quiz": [
    {
      "q": "Net $12\\text{N}$ on $3\\text{kg}$. Accel?",
      "opts": ["$4$", "$36$", "$0.25$"],
      "ans": 0,
      "why": "$12/3 = 4$."
    }
  ],
  "exam": [
    {
      "q": "$4\\text{kg}$ block pushed up smooth $25^\\circ$ slope by $30\\text{N}$ parallel. Accel?",
      "marks": 4,
      "ms": [
        "$30 - 4g\\sin 25 = 4a$ (2)",
        "$13.43 = 4a$ (1)",
        "$a = 3.36\\text{ m/s}^2$ (1)"
      ]
    }
  ]
};

C["maths:S8.3"] = {
  "notes": [
    {
      "h": "Weight and Gravity"
    },
    {
      "callout": {
        "t": "info",
        "h": "Gravity",
        "body": "$W = mg$. $g = 9.8\\text{ m/s}^2$. Acceleration under gravity alone is $a=-g$."
      }
    }
  ],
  "flashcards": [
    ["Unit of Weight?", "Newton."],
    ["Does $g$ depend on mass?", "No."]
  ],
  "quiz": [
    {
      "q": "Weight of $5\\text{kg}$?",
      "opts": ["$5$", "$49$", "$9.8$"],
      "ans": 1,
      "why": "$5 \\times 9.8 = 49$."
    }
  ],
  "exam": [
    {
      "q": "$500\\text{kg}$ lift lowered at $1.2\\text{ m/s}^2$. Tension?",
      "marks": 3,
      "ms": [
        "$mg - T = ma$ (1)",
        "$4900 - T = 600$ (1)",
        "$T = 4300\\text{N}$ (1)"
      ]
    }
  ]
};

C["maths:S8.4"] = {
  "notes": [
    {
      "h": "Newton's Third Law"
    },
    {
      "callout": {
        "t": "info",
        "h": "The Law",
        "body": "Every action has an equal and opposite reaction acting on DIFFERENT bodies."
      }
    },
    {
      "steps": [
        {
          "h": "Connected Particles",
          "m": "Tension $T$ is same throughout for light inextensible strings.",
          "n": "Consider whole system for $a$, single particle for $T$."
        }
      ]
    }
  ],
  "flashcards": [
    ["State N3L.", "Equal magnitude, opposite direction, same type, different bodies."],
    ["Smooth pulley implies?", "Same tension on both sides."]
  ],
  "quiz": [
    {
      "q": "Partner of 'Earth pulls moon'?",
      "opts": ["Moon pulls Earth", "Gravity", "Centripetal"],
      "ans": 0,
      "why": "Swap bodies."
    }
  ],
  "exam": [
    {
      "q": "$2\\text{kg}$ held by horiz $15\\text{N}$ and angled $T$. Find $\\theta$.",
      "marks": 4,
      "ms": [
        "$T\\cos\\theta = 15, T\\sin\\theta = 19.6$ (2)",
        "$\\tan\\theta = 1.306 \\Rightarrow \\theta = 52.6^\\circ$ (2)"
      ]
    }
  ]
};

C["maths:S8.5"] = {
  "notes": [
    {
      "h": "Resultant Forces"
    },
    {
      "callout": {
        "t": "tip",
        "h": "Vector Net",
        "body": "Net force is the vector sum of all individual forces."
      }
    }
  ],
  "flashcards": [
    ["How to find resultant of $P, Q$ at $90^\\circ$?", "$\\sqrt{P^2 + Q^2}$."]
  ],
  "quiz": [
    {
      "q": "$4\\text{kg}, 20\\text{N}$ push, $4\\text{N}$ resistance. $a = ?$",
      "opts": ["$4$", "$5$", "$6$"],
      "ans": 0,
      "why": "$(20-4)/4 = 4$."
    }
  ],
  "exam": [
    {
      "q": "$5\\text{kg}$ block on smooth $30^\\circ$ slope. Accel?",
      "marks": 2,
      "ms": [
        "$mg\\sin 30 = ma \\Rightarrow g\\sin 30 = a$ (1)",
        "$a = 4.9\\text{ m/s}^2$ (1)"
      ]
    }
  ]
};

C["maths:S8.6"] = {
  "notes": [
    {
      "h": "Friction"
    },
    {
      "callout": {
        "t": "def",
        "h": "Model",
        "body": "$F \\le \\mu R$. Limiting is $F = \\mu R$ (about to slip)."
      }
    },
    {
      "steps": [
        {
          "h": "Solving",
          "m": "1. Find $R$ from perp. 2. $F = \\mu R$ if moving/limiting. 3. $F = ma$ along motion.",
          "n": "Friction opposes motion."
        }
      ]
    }
  ],
  "flashcards": [
    ["Limiting friction formula?", "$F = \\mu R$."],
    ["Direction of friction?", "Opposite to potential motion."]
  ],
  "quiz": [
    {
      "q": "$\\mu=0.4, R=50$. Max friction?",
      "opts": ["$20$", "$125$", "$50$"],
      "ans": 0,
      "why": "$0.4 \\times 50 = 20$."
    }
  ],
  "exam": [
    {
      "q": "$10\\text{kg}, \\mu=0.3$. $P=40\\text{N}$ applied. Accel?",
      "marks": 4,
      "ms": [
        "$R=98, F_{max}=29.4$ (1)",
        "$40 > 29.4 \\Rightarrow$ moves (1)",
        "$40 - 29.4 = 10a \\Rightarrow a = 1.06$ (2)"
      ]
    }
  ]
};

C["maths:S9.1"] = {
  "notes": [
    {
      "h": "Moments"
    },
    {
      "callout": {
        "t": "def",
        "h": "Definition",
        "body": "Moment $= F \\times d$ (perpendicular distance). Units: $\\text{Nm}$."
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Principle of Moments",
        "body": "In equilibrium, Clockwise Moments = Anticlockwise Moments about ANY point."
      }
    },
    {
      "steps": [
        {
          "h": "Beam Problems",
          "m": "1. Diagram. 2. $\\sum F_y = 0$. 3. $\\sum M = 0$. Solve.",
          "n": "Weight of uniform beam acts at center."
        }
      ]
    }
  ],
  "flashcards": [
    ["Moment formula?", "$F \\times d_{\\perp}$."],
    ["Reaction at support B if tilting about A?", "Zero."]
  ],
  "quiz": [
    {
      "q": "$20\\text{N}$ at $3\\text{m}$ at $90^\\circ$. Moment?",
      "opts": ["$60$", "$6.6$", "$23$"],
      "ans": 0,
      "why": "$20 \\times 3 = 60$."
    }
  ],
  "exam": [
    {
      "q": "Uniform $4\\text{m}, 5\\text{kg}$ rod. Support $A(0)$ and $C(3)$. $10\\text{kg}$ at $B(4)$. Reaction $C$?",
      "marks": 5,
      "ms": [
        "Moments about $A$: $(5g \\times 2) + (10g \\times 4) = 3R_c$ (2)",
        "$50g = 3R_c$ (1)",
        "$R_c = 163.3\\text{N}$ (2)"
      ]
    }
  ]
};

})(window.KOS_CONTENT);
