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
        "head": [
          "Method",
          "Definition (the words that score)",
          "Random?"
        ],
        "rows": [
          [
            "Simple random",
            "Every sample of size $n$ has an equal chance of selection (e.g. numbered list + random number generator)",
            "Yes"
          ],
          [
            "Systematic",
            "Every $k$th element taken from an ordered list, starting from a RANDOM start point",
            "Yes"
          ],
          [
            "Stratified",
            "Population divided into groups (strata); simple random sample taken from each IN PROPORTION to group size",
            "Yes"
          ],
          [
            "Quota",
            "Interviewer selects who they like until quotas per group are filled",
            "No"
          ],
          [
            "Opportunity (convenience)",
            "Sample taken from whoever is available and willing at the time",
            "No"
          ]
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "The Five Methods at a Glance",
        "body": "SRS — equal chance every sample. Systematic — every $k$th + random start (random). Stratified — proportional random from strata (random). Quota — interviewer fills groups (NOT random). Opportunity — whoever available (NOT random)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Systematic is Fully Random",
        "body": "Systematic sampling is NOT fully random — the start must be chosen randomly to qualify as probability sampling. Without it the sample is deterministic. Also: a periodic pattern in the list that matches interval $k$ biases the sample even with a random start."
      }
    }
  ],
  "flashcards": [
    [
      "Define simple random sampling.",
      "Every possible sample of size $n$ has an equal chance of being chosen — e.g. number the population and use a random number generator."
    ],
    [
      "Define systematic sampling.",
      "Take every $k$th element from an ordered list, starting from a randomly chosen start point."
    ],
    [
      "Define stratified sampling and its formula.",
      "Split the population into strata, sample each randomly in proportion: $(\\text{stratum} \\div \\text{population}) \\times \\text{sample size}$."
    ],
    [
      "Which named methods are NOT random?",
      "Quota and opportunity (convenience) sampling."
    ],
    [
      "One advantage and one drawback of a census?",
      "Completely accurate (whole population); but expensive, slow, and impossible if testing destroys items."
    ],
    [
      "What is a census?",
      "Data collected from every member of the population."
    ],
    [
      "What is a simple random sample?",
      "Every member has an equal chance of selection (e.g. numbered names drawn at random)."
    ],
    [
      "What is stratified sampling?",
      "The population is split into groups (strata) and sampled in proportion to each group's size."
    ],
    [
      "What is systematic sampling?",
      "Select every kth member from an ordered list after a random start."
    ],
    [
      "One advantage of a sample over a census?",
      "Cheaper and quicker, and feasible when testing is destructive."
    ],
    [
      "One disadvantage of opportunity (convenience) sampling?",
      "It is unlikely to be representative — prone to bias."
    ]
  ],
  "quiz": [
    {
      "q": "Population $800$, sample $40$, stratum of $220$ students. Stratum sample = ?",
      "opts": [
        "$22$",
        "$11$",
        "$40$",
        "$5.5$"
      ],
      "ans": 1,
      "why": "$\\frac{220}{800} \\times 40 = 11$."
    },
    {
      "q": "“Every $20$th caller, starting from a random number $1-20$” is…",
      "opts": [
        "quota",
        "systematic",
        "stratified",
        "opportunity"
      ],
      "ans": 1,
      "why": "Fixed interval + random start = systematic."
    },
    {
      "q": "Crash-testing cars must use a sample because…",
      "opts": [
        "censuses are illegal",
        "testing destroys the items",
        "samples are more accurate",
        "cars vary"
      ],
      "ans": 1,
      "why": "A census would destroy the entire population — the classic justification."
    },
    {
      "q": "A census surveys...?",
      "opts": [
        "a sample",
        "the whole population",
        "only volunteers",
        "every kth person"
      ],
      "ans": 1,
      "why": "Census = entire population."
    },
    {
      "q": "Sampling in proportion to group sizes is called...?",
      "opts": [
        "systematic",
        "stratified",
        "quota",
        "opportunity"
      ],
      "ans": 1,
      "why": "Stratified sampling uses proportional strata."
    },
    {
      "q": "Selecting every 10th name from a list (random start) is...?",
      "opts": [
        "simple random",
        "systematic",
        "stratified",
        "quota"
      ],
      "ans": 1,
      "why": "Fixed interval = systematic."
    },
    {
      "q": "A drawback of a census is that it is...?",
      "opts": [
        "biased",
        "expensive and time-consuming",
        "too small",
        "always wrong"
      ],
      "ans": 1,
      "why": "Censuses are costly and slow."
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
    },
    {
      "q": "A school has 600 boys and 400 girls. A stratified sample of 50 students is taken. How many girls should be in the sample?",
      "marks": 3,
      "ms": [
        "Total $=1000$; fraction sampled $=50/1000=0.05$. (1)",
        "Girls in sample $=0.05\\times400$. (1)",
        "$=20$ girls. (1)"
      ]
    },
    {
      "q": "Explain one advantage and one disadvantage of using a sample rather than a census, and describe how to take a simple random sample of 30 from 500 employees.",
      "marks": 6,
      "ms": [
        "Advantage: a sample is cheaper and quicker than a census. (1)",
        "Disadvantage: a sample may not be fully representative / introduces sampling error. (1)",
        "Number all 500 employees $1$ to $500$. (1)",
        "Use random numbers (calculator/table) to select. (1)",
        "Ignore repeats and numbers over 500. (1)",
        "Continue until 30 distinct employees are chosen. (1)"
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
              [
                "Frequency Density",
                "Frequency $\\div$ Class Width. The height of the bar in a histogram."
              ],
              [
                "Area",
                "In a histogram, $\\text{Area} = \\text{Frequency}$ (or $k \\times \\text{Frequency}$)."
              ],
              [
                "Cumulative Frequency",
                "A running total of frequencies, plotted at the UPPER class boundary."
              ]
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
        "head": [
          "Feature",
          "Histogram",
          "Cumulative Frequency Graph"
        ],
        "rows": [
          [
            "Data Type",
            "Continuous Grouped",
            "Continuous Grouped"
          ],
          [
            "$y$-Axis",
            "Frequency Density",
            "Cumulative Frequency"
          ],
          [
            "$x$-Axis Plot Point",
            "Bar width = Class interval",
            "Upper class boundary"
          ],
          [
            "Interpretation",
            "Area = Frequency",
            "Reading percentiles/median"
          ]
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Histogram Key Facts",
        "body": "$\\text{FD} = \\text{Frequency} \\div \\text{Class Width}$. Area of bar $=$ frequency. CF plots at the UPPER class boundary. Start CF curve at zero on the lower boundary of the first class."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Bar Height = Frequency",
        "body": "In a true histogram, bar HEIGHT is frequency density, NOT frequency. Two classes with the same frequency density but different widths represent different frequencies — always multiply height by width."
      }
    }
  ],
  "flashcards": [
    [
      "Formula for Frequency Density?",
      "$\\text{Frequency Density} = \\frac{\\text{Frequency}}{\\text{Class Width}}$."
    ],
    [
      "What does the area of a histogram bar represent?",
      "The frequency of that class ($\\text{Area} = k \\times \\text{Frequency}$)."
    ],
    [
      "Where do you plot points for Cumulative Frequency?",
      "At the UPPER class boundary."
    ],
    [
      "How do you find the median from a CF graph?",
      "Find the value on the $x$-axis corresponding to $\\text{CF} = \\frac{n}{2}$ on the $y$-axis."
    ],
    [
      "In a histogram, what does area represent?",
      "Frequency (area is proportional to frequency)."
    ],
    [
      "What is frequency density?",
      "Frequency divided by class width."
    ],
    [
      "What does a box plot show?",
      "Minimum, lower quartile, median, upper quartile and maximum."
    ],
    [
      "How do you read the median from a cumulative frequency graph?",
      "Read across from half the total frequency to the curve, then down to the value."
    ],
    [
      "Why use frequency density in a histogram with unequal class widths?",
      "So that area (not height) represents frequency, avoiding distortion."
    ],
    [
      "What does the interquartile range measure?",
      "The spread of the middle 50% of the data ($Q_3-Q_1$)."
    ]
  ],
  "quiz": [
    {
      "q": "Class $10-20$, frequency $15$. What is the Frequency Density?",
      "opts": [
        "$1.5$",
        "$150$",
        "$0.67$",
        "$5$"
      ],
      "ans": 0,
      "why": "$\\text{FD} = \\frac{15}{20-10} = 1.5$."
    },
    {
      "q": "On a histogram, a bar of width $2$ and height $5$ represents frequency $20$. What is the scale factor $k$?",
      "opts": [
        "$1$",
        "$2$",
        "$4$",
        "$10$"
      ],
      "ans": 1,
      "why": "$\\text{Area} = 2 \\times 5 = 10$. $\\text{Freq} = k \\times \\text{Area} \\Rightarrow 20 = k \\times 10 \\Rightarrow k = 2$."
    },
    {
      "q": "In a histogram, frequency density $=$?",
      "opts": [
        "frequency $\\times$ width",
        "frequency $\\div$ width",
        "width $\\div$ frequency",
        "frequency only"
      ],
      "ans": 1,
      "why": "Density = frequency / class width."
    },
    {
      "q": "A box plot's middle line shows the...?",
      "opts": [
        "mean",
        "median",
        "mode",
        "range"
      ],
      "ans": 1,
      "why": "The box's central line is the median."
    },
    {
      "q": "Histogram area represents...?",
      "opts": [
        "height",
        "frequency",
        "class width",
        "the mean"
      ],
      "ans": 1,
      "why": "Area is proportional to frequency."
    },
    {
      "q": "Cumulative frequency at the top of the curve equals...?",
      "opts": [
        "the median",
        "the total frequency",
        "the mode",
        "Q1"
      ],
      "ans": 1,
      "why": "It accumulates to the total."
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
    },
    {
      "q": "A class of width 5 has frequency 20. Find its frequency density.",
      "marks": 2,
      "ms": [
        "Frequency density $=$ frequency $\\div$ width $=20\\div5$. (1)",
        "$=4$. (1)"
      ]
    },
    {
      "q": "The bars of a histogram have classes $0\\text{-}10$ (freq 30) and $10\\text{-}30$ (freq 40). (a) Find both frequency densities. (b) Explain why the second bar is shorter despite a larger frequency.",
      "marks": 6,
      "ms": [
        "First: width 10, density $=30/10=3$. (1)",
        "Second: width 20, density $=40/20=2$. (1)",
        "Heights are 3 and 2. (1)",
        "(b) Height represents frequency density, not frequency. (1)",
        "The second class is twice as wide. (1)",
        "So its frequency is spread over a wider interval, giving a lower density/height. (1)"
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
              [
                "Explanatory Variable",
                "The independent variable ($x$), usually on the horizontal axis."
              ],
              [
                "Response Variable",
                "The dependent variable ($y$), usually on the vertical axis."
              ],
              [
                "PMCC ($r$)",
                "Product Moment Correlation Coefficient. Measures the strength of LINEAR correlation."
              ],
              [
                "Regression Line",
                "The line of best fit ($y = a + bx$) that minimises the sum of squares of residuals."
              ]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": [
          "$r$ value",
          "Interpretation"
        ],
        "rows": [
          [
            "$r = 1$",
            "Perfect positive linear correlation"
          ],
          [
            "$r \\approx 0.8$",
            "Strong positive linear correlation"
          ],
          [
            "$r \\approx 0$",
            "No linear correlation"
          ],
          [
            "$r \\approx -0.9$",
            "Strong negative linear correlation"
          ],
          [
            "$r = -1$",
            "Perfect negative linear correlation"
          ]
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Correlation & Regression Rules",
        "body": "$-1 \\le r \\le 1$. Only predict $y$ from $x$, not $x$ from $y$. Only interpolate (within data range). Gradient $b$ = change in $y$ per unit $x$. PMCC is unchanged by linear coding."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Correlation Implies Causation",
        "body": "High $|r|$ does NOT mean one variable causes the other — a lurking third variable may drive both. Also: extrapolating (predicting outside data range) is unreliable regardless of how strong the correlation is."
      }
    }
  ],
  "flashcards": [
    [
      "What does PMCC ($r$) measure?",
      "The strength and direction of a LINEAR relationship between two variables."
    ],
    [
      "Range of values for PMCC?",
      "$-1$ to $+1$."
    ],
    [
      "What is interpolation?",
      "Predicting a value WITHIN the range of the data set — usually reliable."
    ],
    [
      "How does coding data affect PMCC?",
      "It doesn't. PMCC is invariant under linear transformation."
    ],
    [
      "What does a scatter diagram show?",
      "The relationship (correlation) between two variables."
    ],
    [
      "What is positive correlation?",
      "As one variable increases, the other tends to increase."
    ],
    [
      "What is the regression line used for?",
      "Predicting one variable from another (line of best fit)."
    ],
    [
      "What is interpolation?",
      "Estimating within the range of the data (more reliable)."
    ],
    [
      "What is extrapolation and why is it risky?",
      "Predicting outside the data range — the relationship may not continue, so it is unreliable."
    ],
    [
      "Does correlation imply causation?",
      "No — a correlation does not prove one variable causes the other."
    ]
  ],
  "quiz": [
    {
      "q": "If $r = -0.95$, the relationship is…",
      "opts": [
        "Weak positive",
        "Strong positive",
        "Strong negative",
        "Weak negative"
      ],
      "ans": 2,
      "why": "Close to $-1$ indicates strong negative linear correlation."
    },
    {
      "q": "The regression line is $y = 12 + 0.5x$. Interpretation of $0.5$?",
      "opts": [
        "$y$ is $0.5$ when $x$ is $0$",
        "$y$ increases by $0.5$ for every $1$ unit increase in $x$",
        "$x$ increases by $0.5$ for every $1$ unit increase in $y$",
        "Correlation is $0.5$"
      ],
      "ans": 1,
      "why": "Gradient '$b$' represents the rate of change."
    },
    {
      "q": "As $x$ increases, $y$ decreases. This is...?",
      "opts": [
        "positive correlation",
        "negative correlation",
        "no correlation",
        "causation"
      ],
      "ans": 1,
      "why": "Opposite directions = negative correlation."
    },
    {
      "q": "Predicting within the data range is called...?",
      "opts": [
        "extrapolation",
        "interpolation",
        "regression",
        "sampling"
      ],
      "ans": 1,
      "why": "Interpolation is inside the range."
    },
    {
      "q": "Extrapolation is unreliable because...?",
      "opts": [
        "the data is wrong",
        "the pattern may not continue outside the range",
        "it uses the mean",
        "it needs more variables"
      ],
      "ans": 1,
      "why": "Beyond the data the trend may break down."
    },
    {
      "q": "A strong correlation between two variables...?",
      "opts": [
        "proves causation",
        "does not prove causation",
        "means they are equal",
        "means no relationship"
      ],
      "ans": 1,
      "why": "Correlation is not causation."
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
    },
    {
      "q": "State whether predicting a value outside the data range is reliable, and name the process.",
      "marks": 2,
      "ms": [
        "It is unreliable. (1)",
        "The process is extrapolation. (1)"
      ]
    },
    {
      "q": "Data on hours studied ($x$) and test score ($y$) gives the regression line $y=12+5x$. (a) Predict the score for 4 hours. (b) Comment on using the line to predict the score for 20 hours.",
      "marks": 6,
      "ms": [
        "(a) $y=12+5(4)$. (1)",
        "$=32$. (1)",
        "This is interpolation (within range), so reasonably reliable. (1)",
        "(b) 20 hours is far outside the data range. (1)",
        "This is extrapolation. (1)",
        "The linear trend may not hold (and a score cannot exceed 100), so the prediction is unreliable. (1)"
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
              [
                "Mean ($\\bar{x}$)",
                "$\\sum x / n$. The average value."
              ],
              [
                "Median",
                "The middle value when data is ordered."
              ],
              [
                "Variance ($\\sigma^2$)",
                "Mean of the squares minus square of the mean: $\\frac{\\sum x^2}{n} - (\\frac{\\sum x}{n})^2$."
              ],
              [
                "Standard Deviation ($\\sigma$)",
                "The square root of the variance."
              ]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": [
          "Measure",
          "Formula / Method",
          "Sensitivity"
        ],
        "rows": [
          [
            "Mean",
            "$\\sum x / n$",
            "Affected by all values (and outliers)"
          ],
          [
            "Median",
            "$(n+1)/2$ position",
            "Robust to outliers"
          ],
          [
            "Mode",
            "Most frequent",
            "Used for qualitative data"
          ],
          [
            "Variance",
            "$\\frac{\\sum x^2}{n} - \\bar{x}^2$",
            "Measures spread about the mean"
          ]
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Variance and Coding",
        "body": "$\\sigma^2 = \\frac{\\sum x^2}{n} - \\bar{x}^2$. Adding constant $a$: mean shifts by $a$, $\\sigma$ unchanged. Dividing by $b$: $\\sigma_y = \\sigma_x / b$. Both together: $\\bar{y} = (\\bar{x}-a)/b$, $\\sigma_y = \\sigma_x/b$."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Adding a Constant Changes SD",
        "body": "Adding a constant to every data value shifts the MEAN but leaves the standard deviation and variance UNCHANGED — spread depends on differences between values, not their absolute size. Only scaling (multiplying/dividing) changes $\\sigma$."
      }
    }
  ],
  "flashcards": [
    [
      "Formula for Variance?",
      "$\\frac{\\sum x^2}{n} - \\bar{x}^2$."
    ],
    [
      "How does adding $10$ to every point affect the Mean and SD?",
      "Mean increases by $10$; SD remains unchanged."
    ],
    [
      "When is the median preferred over the mean?",
      "When the data set contains extreme outliers (skewed data)."
    ],
    [
      "How do you find the mean?",
      "Sum of values divided by the number of values."
    ],
    [
      "What is the median?",
      "The middle value when the data is ordered."
    ],
    [
      "What is the mode?",
      "The most frequently occurring value."
    ],
    [
      "What is the range?",
      "Largest value minus smallest value."
    ],
    [
      "What does standard deviation measure?",
      "The typical spread of values about the mean."
    ],
    [
      "When is the median preferred over the mean?",
      "When the data has outliers or is skewed (the median is resistant)."
    ]
  ],
  "quiz": [
    {
      "q": "$\\sum x = 100$, $\\sum x^2 = 2500$, $n = 10$. Find $\\sigma$.",
      "opts": [
        "$15$",
        "$10$",
        "$12.2$",
        "$5$"
      ],
      "ans": 2,
      "why": "$\\text{Var} = \\frac{2500}{10} - 10^2 = 150$. $\\sigma = \\sqrt{150} \\approx 12.25$."
    },
    {
      "q": "The mean of $2,4,9$ is...?",
      "opts": [
        "$4$",
        "$5$",
        "$6$",
        "$15$"
      ],
      "ans": 1,
      "why": "$(2+4+9)/3=5$."
    },
    {
      "q": "The median of $3,7,1,9,5$ is...?",
      "opts": [
        "$3$",
        "$5$",
        "$7$",
        "$9$"
      ],
      "ans": 1,
      "why": "Ordered: $1,3,5,7,9$; middle is 5."
    },
    {
      "q": "Which average is most affected by an outlier?",
      "opts": [
        "mode",
        "median",
        "mean",
        "range"
      ],
      "ans": 2,
      "why": "The mean uses every value, so outliers pull it."
    },
    {
      "q": "Standard deviation is a measure of...?",
      "opts": [
        "central tendency",
        "spread",
        "correlation",
        "frequency"
      ],
      "ans": 1,
      "why": "It measures dispersion about the mean."
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
    },
    {
      "q": "Find the mean and range of $4,8,8,10,15$.",
      "marks": 3,
      "ms": [
        "Mean $=(4+8+8+10+15)/5=45/5$. (1)",
        "$=9$. (1)",
        "Range $=15-4=11$. (1)"
      ]
    },
    {
      "q": "A data set has $\\sum x=200$, $\\sum x^2=4600$, $n=10$. Find the mean and the standard deviation.",
      "marks": 6,
      "ms": [
        "Mean $\\bar x=\\sum x/n=200/10=20$. (1)",
        "Variance $=\\dfrac{\\sum x^2}{n}-\\bar x^2$. (1)",
        "$=\\dfrac{4600}{10}-20^2$. (1)",
        "$=460-400=60$. (1)",
        "Standard deviation $=\\sqrt{60}$. (1)",
        "$\\approx7.75$. (1)"
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
              [
                "$1.5 \\times \\text{IQR}$ Rule",
                "Outliers are $< Q_1 - 1.5\\text{IQR}$ or $> Q_3 + 1.5\\text{IQR}$."
              ],
              [
                "$2\\sigma$ Rule",
                "Outliers are more than $2$ standard deviations from the mean ($\\bar{x} \\pm 2\\sigma$)."
              ],
              [
                "Cleaning Data",
                "The process of identifying and dealing with errors or anomalies."
              ]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": [
          "Step",
          "Action",
          "Reason"
        ],
        "rows": [
          [
            "Identification",
            "Apply outlier rules",
            "Find suspicious data points"
          ],
          [
            "Investigation",
            "Check original source",
            "Determine if it's a genuine extreme or an error"
          ],
          [
            "Decision",
            "Keep, Correct, or Remove",
            "Error data is removed; genuine extremes are kept"
          ]
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Outlier Rules",
        "body": "IQR rule: outlier if $< Q_1 - 1.5\\text{IQR}$ or $> Q_3 + 1.5\\text{IQR}$. $2\\sigma$ rule: outlier if outside $\\bar{x} \\pm 2\\sigma$. Identified outliers must be INVESTIGATED before any action is taken."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Outliers Must Always Be Removed",
        "body": "Outliers are NOT automatically removed. Investigate first: if it is a genuine extreme value (rare but real), KEEP it. Only remove if it results from a recording error, equipment fault, or corrupted data."
      }
    }
  ],
  "flashcards": [
    [
      "Standard outlier rule for quartiles?",
      "$V < Q_1 - 1.5\\text{IQR}$ or $V > Q_3 + 1.5\\text{IQR}$."
    ],
    [
      "Why might you keep an outlier?",
      "If it represents a genuine but rare occurrence in the population."
    ],
    [
      "What is an outlier?",
      "A value that is unusually far from the rest of the data."
    ],
    [
      "State the IQR outlier rule.",
      "Below $Q_1-1.5\\times IQR$ or above $Q_3+1.5\\times IQR$."
    ],
    [
      "State the mean/standard-deviation outlier rule.",
      "More than 2 (or 3) standard deviations from the mean."
    ],
    [
      "What is data cleaning?",
      "Identifying and dealing with errors/outliers before analysis."
    ],
    [
      "Should you always remove an outlier?",
      "No — only if it is a genuine error; valid extreme values may be kept."
    ],
    [
      "Why can an outlier distort the mean?",
      "It is an extreme value and the mean uses all values."
    ]
  ],
  "quiz": [
    {
      "q": "$Q_1 = 20$, $Q_3 = 30$. Which is an outlier?",
      "opts": [
        "$4.9$",
        "$35$",
        "$5.1$",
        "$25$"
      ],
      "ans": 0,
      "why": "$\\text{IQR} = 10$. $\\text{Lower} = 20 - 15 = 5$. $4.9 < 5$."
    },
    {
      "q": "An outlier is more than how many IQRs beyond a quartile (common rule)?",
      "opts": [
        "$0.5$",
        "$1$",
        "$1.5$",
        "$5$"
      ],
      "ans": 2,
      "why": "$1.5\\times IQR$ rule."
    },
    {
      "q": "$Q_1=10$, $Q_3=20$. The upper outlier boundary is...?",
      "opts": [
        "$25$",
        "$30$",
        "$35$",
        "$40$"
      ],
      "ans": 2,
      "why": "IQR $=10$; $Q_3+1.5(10)=35$."
    },
    {
      "q": "An outlier that is a genuine extreme value should be...?",
      "opts": [
        "always deleted",
        "kept (not an error)",
        "doubled",
        "ignored"
      ],
      "ans": 1,
      "why": "Only errors should be removed."
    },
    {
      "q": "Which statistic is least affected by an outlier?",
      "opts": [
        "mean",
        "range",
        "median",
        "standard deviation"
      ],
      "ans": 2,
      "why": "The median is resistant to outliers."
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
    },
    {
      "q": "A data set has $Q_1=15$ and $Q_3=27$. Using the $1.5\\times IQR$ rule, find the outlier boundaries.",
      "marks": 3,
      "ms": [
        "$IQR=27-15=12$. (1)",
        "Lower $=15-1.5(12)=15-18=-3$. (1)",
        "Upper $=27+1.5(12)=27+18=45$. (1)"
      ]
    },
    {
      "q": "The masses (g) of items are $50,52,53,55,90$. (a) Calculate the mean. (b) Identify any outlier using mean $\\pm2$ s.d. given the s.d. is $15.0$, and discuss whether to remove it.",
      "marks": 6,
      "ms": [
        "(a) Mean $=(50+52+53+55+90)/5=300/5=60$. (1)",
        "(b) Boundaries: $60\\pm2(15)=60\\pm30$, i.e. $30$ to $90$. (1)",
        "$90$ is on the boundary; check the rest lie within. (1)",
        "$90$ is far above the cluster $50\\text{-}55$, so it is a potential outlier. (1)",
        "Investigate whether it is a recording error. (1)",
        "Remove only if it is an error; otherwise keep it as a genuine value. (1)"
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
              [
                "Mutually Exclusive",
                "Events that cannot happen at the same time: $P(A \\cap B) = 0$."
              ],
              [
                "Independent",
                "Occurrence of one does not affect the other: $P(A \\cap B) = P(A) \\times P(B)$."
              ],
              [
                "Intersection ($\\cap$)",
                "Both $A$ AND $B$ occur."
              ],
              [
                "Union ($\\cup$)",
                "$A$ OR $B$ (or both) occur."
              ]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": [
          "Condition",
          "Formula / Rule"
        ],
        "rows": [
          [
            "General Union",
            "$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$"
          ],
          [
            "Mutually Exclusive",
            "$P(A \\cup B) = P(A) + P(B)$"
          ],
          [
            "Independent",
            "$P(A \\cap B) = P(A) \\times P(B)$"
          ],
          [
            "Complement",
            "$P(A') = 1 - P(A)$"
          ]
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "ME vs Independent — Formulae",
        "body": "Mutually Exclusive: $P(A \\cap B) = 0$, so $P(A \\cup B) = P(A) + P(B)$. Independent: $P(A \\cap B) = P(A) \\times P(B)$, equivalently $P(A|B) = P(A)$. General union: $P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Mutually Exclusive Implies Independent",
        "body": "ME and independence are OPPOSITES for non-trivial events. If $A$ and $B$ are ME, knowing $A$ happened means $B$ CANNOT happen — so they are dependent. Only if $P(A)=0$ or $P(B)=0$ can events be both ME and independent."
      }
    }
  ],
  "flashcards": [
    [
      "Definition of Mutually Exclusive?",
      "Events where $P(A \\cap B) = 0$."
    ],
    [
      "Definition of Independent?",
      "Events where $P(A \\cap B) = P(A)P(B)$."
    ],
    [
      "What does 'mutually exclusive' mean?",
      "The events cannot both happen; $P(A\\cap B)=0$."
    ],
    [
      "Addition rule for mutually exclusive events?",
      "$P(A\\cup B)=P(A)+P(B)$."
    ],
    [
      "What does 'independent' mean?",
      "One event does not affect the probability of the other."
    ],
    [
      "Multiplication rule for independent events?",
      "$P(A\\cap B)=P(A)\\times P(B)$."
    ],
    [
      "General addition rule for any two events?",
      "$P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$."
    ],
    [
      "Can two events be both mutually exclusive and independent (non-zero prob)?",
      "No — mutual exclusivity forces dependence."
    ]
  ],
  "quiz": [
    {
      "q": "$P(A)=0.5, P(B)=0.4$. If independent, $P(A \\cap B) = ?$",
      "opts": [
        "$0.9$",
        "$0.1$",
        "$0.2$",
        "$0$"
      ],
      "ans": 2,
      "why": "$0.5 \\times 0.4 = 0.2$."
    },
    {
      "q": "For mutually exclusive events, $P(A\\cap B)=$?",
      "opts": [
        "$P(A)P(B)$",
        "$0$",
        "$1$",
        "$P(A)+P(B)$"
      ],
      "ans": 1,
      "why": "They cannot occur together."
    },
    {
      "q": "For independent events, $P(A\\cap B)=$?",
      "opts": [
        "$0$",
        "$P(A)+P(B)$",
        "$P(A)P(B)$",
        "$1$"
      ],
      "ans": 2,
      "why": "Multiply the probabilities."
    },
    {
      "q": "$P(A)=0.4$, $P(B)=0.5$, mutually exclusive. $P(A\\cup B)=$?",
      "opts": [
        "$0.9$",
        "$0.2$",
        "$0.7$",
        "$0.1$"
      ],
      "ans": 0,
      "why": "$0.4+0.5=0.9$."
    },
    {
      "q": "$P(A)=0.3$, $P(B)=0.5$, independent. $P(A\\cap B)=$?",
      "opts": [
        "$0.8$",
        "$0.15$",
        "$0$",
        "$0.2$"
      ],
      "ans": 1,
      "why": "$0.3\\times0.5=0.15$."
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
    },
    {
      "q": "$A$ and $B$ are mutually exclusive with $P(A)=0.35$, $P(B)=0.25$. Find $P(A\\cup B)$ and $P(A\\cap B)$.",
      "marks": 3,
      "ms": [
        "$P(A\\cap B)=0$ (mutually exclusive). (1)",
        "$P(A\\cup B)=P(A)+P(B)=0.35+0.25$. (1)",
        "$=0.6$. (1)"
      ]
    },
    {
      "q": "Events $A$ and $B$ are independent with $P(A)=0.6$ and $P(B)=0.5$. Find (a) $P(A\\cap B)$ (b) $P(A\\cup B)$.",
      "marks": 6,
      "ms": [
        "(a) Independent: $P(A\\cap B)=P(A)P(B)$. (1)",
        "$=0.6\\times0.5=0.3$. (1)",
        "(b) General rule: $P(A\\cup B)=P(A)+P(B)-P(A\\cap B)$. (1)",
        "$=0.6+0.5-0.3$. (1)",
        "$=0.8$. (1)",
        "(Note: not mutually exclusive since $P(A\\cap B)\\neq0$.) (1)"
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
              [
                "$P(A|B)$",
                "Probability of $A$ given that $B$ has already occurred."
              ],
              [
                "Tree Diagram",
                "Branches show conditional probabilities."
              ],
              [
                "Two-way Table",
                "Frequency distribution of two variables."
              ]
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Conditional Probability Formula",
        "body": "$P(A|B) = \\frac{P(A \\cap B)}{P(B)}$. Think: restrict the sample space to where $B$ occurred, then ask how much of that is $A$. Independence check: $P(A|B) = P(A)$ iff $A$ and $B$ independent."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "$P(A|B) = P(B|A)$",
        "body": "$P(A|B)$ and $P(B|A)$ are generally NOT equal. Confusing them is the 'prosecutor's fallacy'. Use $P(A|B) = P(A \\cap B)/P(B)$ and $P(B|A) = P(A \\cap B)/P(A)$ and check the denominators."
      }
    }
  ],
  "flashcards": [
    [
      "Formula for $P(B|A)$?",
      "$P(B \\cap A) / P(A)$."
    ],
    [
      "What if $P(A|B) = P(A)$?",
      "Events $A$ and $B$ are independent."
    ],
    [
      "Define conditional probability $P(A\\mid B)$.",
      "$\\dfrac{P(A\\cap B)}{P(B)}$ — probability of $A$ given $B$ has occurred."
    ],
    [
      "What does $P(A\\mid B)=P(A)$ imply?",
      "$A$ and $B$ are independent."
    ],
    [
      "What tool shows conditional probabilities of sequential events?",
      "A tree diagram (branch probabilities are conditional)."
    ],
    [
      "On a tree diagram, how do you find the probability of a path?",
      "Multiply the probabilities along the branches."
    ],
    [
      "How do you combine paths giving the same outcome?",
      "Add the path probabilities."
    ],
    [
      "Formula linking $P(A\\cap B)$ and conditional probability?",
      "$P(A\\cap B)=P(B)\\times P(A\\mid B)$."
    ]
  ],
  "quiz": [
    {
      "q": "$P(B)=0.4, P(A \\cap B)=0.1$. Find $P(A|B)$.",
      "opts": [
        "$0.25$",
        "$4$",
        "$0.5$",
        "$0.04$"
      ],
      "ans": 0,
      "why": "$0.1 / 0.4 = 0.25$."
    },
    {
      "q": "$P(A\\mid B)=$?",
      "opts": [
        "$P(A)P(B)$",
        "$\\dfrac{P(A\\cap B)}{P(B)}$",
        "$P(A)+P(B)$",
        "$\\dfrac{P(B)}{P(A)}$"
      ],
      "ans": 1,
      "why": "Definition of conditional probability."
    },
    {
      "q": "On a tree diagram, the probability of one full path is found by...?",
      "opts": [
        "adding branches",
        "multiplying along branches",
        "subtracting",
        "dividing"
      ],
      "ans": 1,
      "why": "Multiply consecutive branch probabilities."
    },
    {
      "q": "If $P(A\\mid B)=P(A)$, then $A$ and $B$ are...?",
      "opts": [
        "mutually exclusive",
        "independent",
        "equal",
        "impossible"
      ],
      "ans": 1,
      "why": "B doesn't change A's probability."
    },
    {
      "q": "$P(A\\cap B)=0.2$, $P(B)=0.5$. $P(A\\mid B)=$?",
      "opts": [
        "$0.1$",
        "$0.4$",
        "$0.7$",
        "$0.25$"
      ],
      "ans": 1,
      "why": "$0.2/0.5=0.4$."
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
    },
    {
      "q": "$P(A\\cap B)=0.12$ and $P(B)=0.3$. Find $P(A\\mid B)$.",
      "marks": 2,
      "ms": [
        "$P(A\\mid B)=\\dfrac{P(A\\cap B)}{P(B)}=\\dfrac{0.12}{0.3}$. (1)",
        "$=0.4$. (1)"
      ]
    },
    {
      "q": "A bag has 5 red and 3 blue counters. Two are drawn without replacement. Find the probability that both are red.",
      "marks": 6,
      "ms": [
        "$P(\\text{1st red})=\\dfrac58$. (1)",
        "After one red: 4 red of 7 left. (1)",
        "$P(\\text{2nd red}\\mid\\text{1st red})=\\dfrac47$. (1)",
        "$P(\\text{both red})=\\dfrac58\\times\\dfrac47$. (1)",
        "$=\\dfrac{20}{56}$. (1)",
        "$=\\dfrac{5}{14}$. (1)"
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
              [
                "Assumption",
                "A simplifying rule made to create a model."
              ],
              [
                "Refinement",
                "Improving a model by making it more realistic."
              ],
              [
                "Validity",
                "How well predictions match real-world observations."
              ]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": [
          "Model",
          "Common Assumptions"
        ],
        "rows": [
          [
            "Coin Tossing",
            "Fair coin ($P=0.5$), Independent tosses"
          ],
          [
            "Weather",
            "Independence (often false), Constant probability"
          ],
          [
            "Games",
            "Randomness, No cheating/bias"
          ]
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Model–Test–Refine Cycle",
        "body": "1. State assumptions (fixed $p$, independence, etc.). 2. Predict using the model. 3. Compare with observed data. 4. If poor fit, identify which assumption fails and refine. Conclusions are always 'in context'."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Model is Wrong if Not Exact",
        "body": "No probability model is a perfect description of reality — all rely on simplifying assumptions. A model is 'good' if it gives useful predictions, not if it matches exactly. A poor fit means refine the assumptions, not abandon modelling."
      }
    }
  ],
  "flashcards": [
    [
      "Why make assumptions?",
      "To simplify complex real-world situations into solvable math."
    ],
    [
      "How to test validity?",
      "Compare predicted outcomes with actual experimental data."
    ],
    [
      "What is a probability model?",
      "A set of assumptions assigning probabilities to outcomes."
    ],
    [
      "Give one assumption when modelling a coin as fair.",
      "Each outcome (heads/tails) is equally likely and tosses are independent."
    ],
    [
      "Why critique a probability model?",
      "Real situations may break the assumptions (e.g. a biased coin), making predictions inaccurate."
    ],
    [
      "What does 'equally likely outcomes' allow?",
      "Computing probability as (favourable outcomes)/(total outcomes)."
    ],
    [
      "How can a model be refined?",
      "By adjusting probabilities to fit observed data (e.g. estimate $p$ from experiments)."
    ],
    [
      "What is a uniform probability model?",
      "One where all outcomes have equal probability."
    ]
  ],
  "quiz": [
    {
      "q": "Which is a common assumption for binomial?",
      "opts": [
        "Dependent trials",
        "Changing $p$",
        "Fixed $n$",
        "Infinite outcomes"
      ],
      "ans": 2,
      "why": "Requires fixed $n$, constant $p$, independence."
    },
    {
      "q": "Assuming a die is fair, $P(6)=$?",
      "opts": [
        "$\\tfrac16$",
        "$\\tfrac12$",
        "$\\tfrac13$",
        "$1$"
      ],
      "ans": 0,
      "why": "Six equally likely faces."
    },
    {
      "q": "A modelling assumption for independent trials is that one trial...?",
      "opts": [
        "affects the next",
        "does not affect the next",
        "is impossible",
        "is certain"
      ],
      "ans": 1,
      "why": "Independence = no influence."
    },
    {
      "q": "If observed data don't match a model, you should...?",
      "opts": [
        "ignore the data",
        "refine the model",
        "delete outcomes",
        "double the probabilities"
      ],
      "ans": 1,
      "why": "Refine assumptions to fit reality."
    },
    {
      "q": "A uniform model assigns each outcome...?",
      "opts": [
        "different probabilities",
        "equal probabilities",
        "zero",
        "probability 1"
      ],
      "ans": 1,
      "why": "Uniform = equally likely."
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
    },
    {
      "q": "A spinner is modelled as fair with 4 equal sections numbered 1-4. State $P(3)$ and one assumption of the model.",
      "marks": 2,
      "ms": [
        "$P(3)=\\dfrac14$. (1)",
        "Assumption: the four sections are equally likely (the spinner is unbiased). (1)"
      ]
    },
    {
      "q": "A coin is tossed 100 times and lands heads 62 times. (a) State the probability of heads under a fair-coin model. (b) Discuss whether the model seems appropriate and how it could be refined.",
      "marks": 6,
      "ms": [
        "(a) Fair model: $P(H)=0.5$. (1)",
        "(b) Expected heads $=50$. (1)",
        "Observed 62 is noticeably higher. (1)",
        "This suggests the coin may be biased. (1)",
        "Refine by estimating $p$ from the data: $\\hat p=62/100=0.62$. (1)",
        "A larger sample / hypothesis test would confirm whether the bias is significant. (1)"
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
        "head": [
          "English",
          "Rewrite as",
          "Why"
        ],
        "rows": [
          [
            "at most $4$",
            "$P(X \\le 4)$",
            "direct"
          ],
          [
            "fewer than $4$",
            "$P(X \\le 3)$",
            "strict $<$ drops one"
          ],
          [
            "at least $4$",
            "$1 - P(X \\le 3)$",
            "complement"
          ],
          [
            "more than $4$",
            "$1 - P(X \\le 4)$",
            "complement of $\\le$"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Strictly Drop One",
        "body": "Any STRICT inequality ($<$ or $>$) shifts the boundary by $1$ for the calculator. $P(X < k) = P(X \\le k-1)$."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Binomial Conditions and Formula",
        "body": "FTIC: Fixed $n$, Two outcomes, Independent trials, Constant $p$. Formula: $P(X=x) = \\binom{n}{x}p^x(1-p)^{n-x}$. Mean $= np$. Calculator: always use $P(X \\le k)$ form; strict inequality drops boundary by $1$."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "$P(X < 4) = P(X \\le 4)$",
        "body": "For a discrete distribution, $P(X < 4) = P(X \\le 3)$, NOT $P(X \\le 4)$. 'Fewer than $4$' excludes $4$. Always translate strict inequalities before using tables or the calculator."
      }
    }
  ],
  "flashcards": [
    [
      "Mean of $B(n, p)$?",
      "$np$."
    ],
    [
      "$P(X > k)$ in calculator form?",
      "$1 - P(X \\le k)$."
    ],
    [
      "What is a discrete random variable?",
      "One that takes separate (countable) values, each with a probability summing to 1."
    ],
    [
      "State the binomial probability formula.",
      "$P(X=r)=\\binom{n}{r}p^r(1-p)^{n-r}$."
    ],
    [
      "State the conditions for a binomial distribution.",
      "Fixed number of trials $n$, two outcomes, constant $p$, independent trials."
    ],
    [
      "What does $X\\sim B(n,p)$ mean?",
      "$X$ is binomial with $n$ trials and success probability $p$."
    ],
    [
      "Mean of $B(n,p)$?",
      "$np$."
    ],
    [
      "What must the probabilities of a discrete distribution sum to?",
      "$1$."
    ]
  ],
  "quiz": [
    {
      "q": "$X \\sim B(20, 0.3)$. 'Fewer than $5$ successes' = ?",
      "opts": [
        "$P(X \\le 5)$",
        "$P(X \\le 4)$",
        "$1 - P(X \\le 5)$",
        "$P(X = 4)$"
      ],
      "ans": 1,
      "why": "Strictly fewer than $5$ means at most $4$."
    },
    {
      "q": "Which is a condition for a binomial model?",
      "opts": [
        "infinite trials",
        "fixed $n$, constant $p$, independent trials",
        "continuous outcomes",
        "varying $p$"
      ],
      "ans": 1,
      "why": "These are the binomial conditions."
    },
    {
      "q": "$X\\sim B(10,0.3)$. The mean is...?",
      "opts": [
        "$3$",
        "$0.3$",
        "$10$",
        "$7$"
      ],
      "ans": 0,
      "why": "$np=10\\times0.3=3$."
    },
    {
      "q": "For a discrete distribution, $\\sum P(X=x)=$?",
      "opts": [
        "$0$",
        "$1$",
        "$n$",
        "$p$"
      ],
      "ans": 1,
      "why": "Total probability is 1."
    },
    {
      "q": "$P(X=r)$ in a binomial uses which coefficient?",
      "opts": [
        "$n!$",
        "$\\binom{n}{r}$",
        "$r^n$",
        "$np$"
      ],
      "ans": 1,
      "why": "The binomial coefficient $\\binom{n}{r}$."
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
    },
    {
      "q": "$X\\sim B(6,0.5)$. Find $P(X=2)$.",
      "marks": 3,
      "ms": [
        "$P(X=2)=\\binom{6}{2}(0.5)^2(0.5)^4$. (1)",
        "$=15\\times(0.5)^6$. (1)",
        "$=15/64\\approx0.234$. (1)"
      ]
    },
    {
      "q": "A biased coin has $P(\\text{head})=0.4$. It is tossed 8 times; $X$ is the number of heads. (a) State the distribution. (b) Find $P(X=3)$. (c) Find the mean number of heads.",
      "marks": 6,
      "ms": [
        "(a) $X\\sim B(8,0.4)$. (1)",
        "(b) $P(X=3)=\\binom{8}{3}(0.4)^3(0.6)^5$. (1)",
        "$=56\\times0.064\\times0.07776$. (1)",
        "$\\approx0.279$. (1)",
        "(c) Mean $=np=8\\times0.4$. (1)",
        "$=3.2$. (1)"
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Normal Distribution Notation",
        "body": "$X \\sim N(\\mu, \\sigma^2)$ — second parameter is VARIANCE, not SD. Standardise: $Z = (X - \\mu)/\\sigma$. Points of inflection at $\\mu \\pm \\sigma$. Symmetric: $P(X < \\mu) = 0.5$."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "$N(\\mu, \\sigma)$ — Second Parameter is SD",
        "body": "In $N(\\mu, \\sigma^2)$ the second parameter is the VARIANCE $\\sigma^2$, not the standard deviation. $N(100, 25)$ has $\\sigma = 5$, not $\\sigma = 25$. Always square-root the second parameter to get $\\sigma$ before standardising."
      }
    }
  ],
  "flashcards": [
    [
      "Standardisation formula?",
      "$Z = (X - \\mu)/\\sigma$."
    ],
    [
      "Where are points of inflection?",
      "At $\\mu \\pm \\sigma$."
    ],
    [
      "What does $X\\sim N(\\mu,\\sigma^2)$ mean?",
      "$X$ is normally distributed with mean $\\mu$ and variance $\\sigma^2$."
    ],
    [
      "What is the standardising formula?",
      "$Z=\\dfrac{X-\\mu}{\\sigma}$, giving the standard normal $N(0,1)$."
    ],
    [
      "What proportion of data lies within 1 s.d. of the mean?",
      "About 68%."
    ],
    [
      "What is the shape of the normal distribution?",
      "A symmetric bell curve centred on the mean."
    ],
    [
      "Within 2 standard deviations of the mean lies about...?",
      "95% of the data."
    ],
    [
      "What does $P(Z<z)$ from tables give?",
      "The cumulative probability up to $z$."
    ]
  ],
  "quiz": [
    {
      "q": "$X \\sim N(100, 25)$. $P(X < 100) = ?$",
      "opts": [
        "$0.25$",
        "$0.5$",
        "$0.95$",
        "depends"
      ],
      "ans": 1,
      "why": "Symmetry about the mean."
    },
    {
      "q": "Standardising uses $Z=$?",
      "opts": [
        "$\\dfrac{X-\\mu}{\\sigma}$",
        "$\\dfrac{\\mu-X}{\\sigma}$",
        "$X\\mu$",
        "$\\dfrac{X}{\\sigma^2}$"
      ],
      "ans": 0,
      "why": "Subtract mean, divide by s.d."
    },
    {
      "q": "About what percentage lies within 2 s.d. of the mean?",
      "opts": [
        "68%",
        "95%",
        "99.7%",
        "50%"
      ],
      "ans": 1,
      "why": "The 95% rule."
    },
    {
      "q": "The normal curve is...?",
      "opts": [
        "skewed left",
        "symmetric (bell-shaped)",
        "uniform",
        "discrete"
      ],
      "ans": 1,
      "why": "Symmetric about the mean."
    },
    {
      "q": "$X\\sim N(50,16)$. The standard deviation is...?",
      "opts": [
        "$16$",
        "$4$",
        "$8$",
        "$50$"
      ],
      "ans": 1,
      "why": "$\\sigma=\\sqrt{16}=4$."
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
    },
    {
      "q": "$X\\sim N(100,25)$. Find the $z$-value corresponding to $X=110$.",
      "marks": 2,
      "ms": [
        "$\\sigma=\\sqrt{25}=5$. (1)",
        "$z=\\dfrac{110-100}{5}=2$. (1)"
      ]
    },
    {
      "q": "The lengths of bolts are $X\\sim N(20,4)$ cm. (a) Find the probability a bolt is longer than 22 cm. (b) Find the probability a bolt is between 18 and 22 cm. (Use $P(Z<1)=0.8413$.)",
      "marks": 6,
      "ms": [
        "$\\sigma=2$. (1)",
        "(a) $z=\\dfrac{22-20}{2}=1$. (1)",
        "$P(X>22)=1-0.8413=0.1587$. (1)",
        "(b) $z=\\dfrac{18-20}{2}=-1$ and $z=1$. (1)",
        "$P(-1<Z<1)=2(0.8413)-1$. (1)",
        "$=0.6826$. (1)"
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
              [
                "Binomial $B(n, p)$",
                "Discrete counting. Fixed trials, independent, constant $p$."
              ],
              [
                "Normal $N(\\mu, \\sigma^2)$",
                "Continuous measurement. Symmetric clustering."
              ],
              [
                "Uniform $U(a, b)$",
                "Equal probability for all outcomes in a range."
              ]
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "When to Use Each Distribution",
        "body": "Binomial — discrete counting, fixed trials, constant $p$. Normal — continuous symmetric data. Normal approx to Binomial: need $n > 50$, $np > 5$, AND $nq > 5$; use $\\mu = np$, $\\sigma^2 = np(1-p)$, apply continuity correction $\\pm 0.5$."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Large $n$ Alone Justifies Normal Approx",
        "body": "Normal approximation to Binomial requires BOTH $np > 5$ AND $nq > 5$ — not just large $n$. If $p$ is very small (e.g. $0.01$), $np$ may be tiny even for large $n$, making the Normal a poor fit."
      }
    }
  ],
  "flashcards": [
    [
      "Criteria for Normal approx to Binomial?",
      "$n$ large, $p \\approx 0.5$ (so $np > 5$ and $nq > 5$)."
    ],
    [
      "Mean and Variance of $B(n, p)$?",
      "Mean $= np$, Variance $= np(1-p)$."
    ],
    [
      "When is a binomial model appropriate?",
      "Fixed trials, two outcomes, constant $p$, independent trials (discrete count)."
    ],
    [
      "When is a normal model appropriate?",
      "Continuous data, symmetric and bell-shaped about the mean."
    ],
    [
      "State the conditions for the normal approximation to the binomial.",
      "$n$ large and $p$ close to 0.5 (so $np$ and $n(1-p)$ both $>5$)."
    ],
    [
      "What continuity correction is used (binomial to normal)?",
      "Adjust by $\\pm0.5$ (e.g. $P(X\\le k)\\to P(X<k+0.5)$)."
    ],
    [
      "Which distribution for the number of sixes in 20 die rolls?",
      "Binomial $B(20,1/6)$ (discrete)."
    ],
    [
      "Which distribution for adult heights?",
      "Normal (continuous, bell-shaped)."
    ]
  ],
  "quiz": [
    {
      "q": "Measuring heights of $1000$ trees. Model?",
      "opts": [
        "Binomial",
        "Normal",
        "Uniform",
        "Discrete"
      ],
      "ans": 1,
      "why": "Measurement data clusters symmetrically."
    },
    {
      "q": "A count of successes in fixed independent trials is modelled by the...?",
      "opts": [
        "normal",
        "binomial",
        "uniform",
        "exponential"
      ],
      "ans": 1,
      "why": "Binomial models success counts."
    },
    {
      "q": "Continuous, symmetric data is best modelled by the...?",
      "opts": [
        "binomial",
        "normal",
        "discrete uniform",
        "Poisson"
      ],
      "ans": 1,
      "why": "Normal distribution."
    },
    {
      "q": "Normal approximation to binomial works best when $p$ is...?",
      "opts": [
        "near 0",
        "near 0.5",
        "near 1",
        "exactly 1"
      ],
      "ans": 1,
      "why": "Symmetry needs $p\\approx0.5$ and large $n$."
    },
    {
      "q": "The continuity correction adjusts values by...?",
      "opts": [
        "$\\pm1$",
        "$\\pm0.5$",
        "$\\pm2$",
        "$0$"
      ],
      "ans": 1,
      "why": "Half-unit correction for a discrete-to-continuous switch."
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
    },
    {
      "q": "State whether a binomial or normal model is appropriate for: (a) the number of defective items in a batch of 50; (b) the weights of apples.",
      "marks": 2,
      "ms": [
        "(a) Binomial (a count of successes in fixed trials). (1)",
        "(b) Normal (continuous, bell-shaped data). (1)"
      ]
    },
    {
      "q": "$X\\sim B(100,0.5)$. (a) Explain why a normal approximation is suitable. (b) State the approximating distribution. (c) Using a continuity correction, write the expression for $P(X\\le45)$.",
      "marks": 6,
      "ms": [
        "(a) $n=100$ is large and $p=0.5$, so the binomial is roughly symmetric. (1)",
        "$np=50$ and $n(1-p)=50$, both $>5$. (1)",
        "(b) Mean $np=50$, variance $np(1-p)=25$. (1)",
        "So $X\\approx N(50,25)$. (1)",
        "(c) Continuity correction: $P(X\\le45)\\to P(Y<45.5)$. (1)",
        "where $Y\\sim N(50,25)$. (1)"
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
              [
                "Null ($H_0$)",
                "Status quo. Always uses '=' (e.g. $p = 0.5$)."
              ],
              [
                "Alternative ($H_1$)",
                "Claim. Uses $>$, $<$ or $\\neq$."
              ]
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
              [
                "Significance Level ($\\alpha$)",
                "Risk threshold (usually $5\\%$). Prob of rejecting $H_0$ if true."
              ],
              [
                "Critical Region (CR)",
                "Reject Zone. Enough evidence if result falls here."
              ],
              [
                "$p$-value",
                "Prob of result by luck. If $p < \\alpha$, reject $H_0$."
              ]
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Hypothesis Testing Language",
        "body": "$H_0$ always uses $=$. $H_1$ uses $>$, $<$, or $\\neq$. $p$-value $< \\alpha$ → reject $H_0$. Conclude: 'There is sufficient evidence to suggest [in context].' Two-tailed: split $\\alpha$ across both tails."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "We Accept $H_0$",
        "body": "We NEVER 'accept $H_0$' — we only 'fail to reject it'. The test only gathers evidence against $H_0$; failing to find it does not prove $H_0$ true. Also never use the word 'prove' in a conclusion."
      }
    }
  ],
  "flashcards": [
    [
      "What is a 'Critical Region'?",
      "Set of values leading to rejection of $H_0$."
    ],
    [
      "Two-tailed test at $5\\%$: check each tail against?",
      "$0.025$ ($\\alpha / 2$)."
    ],
    [
      "What is the null hypothesis $H_0$?",
      "The default assumption being tested (e.g. $p=0.5$)."
    ],
    [
      "What is the alternative hypothesis $H_1$?",
      "What you test for (e.g. $p>0.5$ or $p\\neq0.5$)."
    ],
    [
      "What is the significance level?",
      "The probability of rejecting $H_0$ when it is true (e.g. 5%)."
    ],
    [
      "What is the critical region?",
      "The set of values for which $H_0$ is rejected."
    ],
    [
      "What is a p-value?",
      "The probability of a result at least as extreme as observed, assuming $H_0$."
    ],
    [
      "One-tailed vs two-tailed test?",
      "One-tailed tests for a change in one direction; two-tailed tests for a change in either direction."
    ]
  ],
  "quiz": [
    {
      "q": "$p$-value $0.042$, $\\alpha = 0.05$. Result?",
      "opts": [
        "Reject $H_0$",
        "Fail to reject",
        "Accept $H_0$"
      ],
      "ans": 0,
      "why": "$0.042 < 0.05$."
    },
    {
      "q": "The null hypothesis is...?",
      "opts": [
        "what you hope to show",
        "the default assumption tested",
        "always false",
        "the sample mean"
      ],
      "ans": 1,
      "why": "$H_0$ is the status-quo claim."
    },
    {
      "q": "A 5% significance level means...?",
      "opts": [
        "5% of data is wrong",
        "5% chance of wrongly rejecting a true $H_0$",
        "reject 5% of the time",
        "p = 5 always"
      ],
      "ans": 1,
      "why": "It is the false-rejection probability."
    },
    {
      "q": "If the p-value is less than the significance level you...?",
      "opts": [
        "accept $H_0$",
        "reject $H_0$",
        "ignore it",
        "increase $n$"
      ],
      "ans": 1,
      "why": "A small p-value is significant evidence against $H_0$."
    },
    {
      "q": "Testing for a change in either direction uses a...?",
      "opts": [
        "one-tailed test",
        "two-tailed test",
        "no test",
        "census"
      ],
      "ans": 1,
      "why": "Two-tailed covers both directions."
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
    },
    {
      "q": "A coin is suspected of bias towards heads. State suitable null and alternative hypotheses for $p=P(\\text{head})$.",
      "marks": 2,
      "ms": [
        "$H_0: p=0.5$. (1)",
        "$H_1: p>0.5$ (one-tailed). (1)"
      ]
    },
    {
      "q": "Explain the meaning of the significance level, critical region, and p-value in a hypothesis test, and how they lead to a conclusion.",
      "marks": 6,
      "ms": [
        "The significance level is the probability of rejecting a true $H_0$ (e.g. 5%). (1)",
        "The critical region is the set of outcomes leading to rejection of $H_0$. (1)",
        "The p-value is the probability of a result at least as extreme as observed, assuming $H_0$. (1)",
        "If the observed value is in the critical region (or p-value < significance level)... (1)",
        "...reject $H_0$ in favour of $H_1$. (1)",
        "Otherwise there is insufficient evidence to reject $H_0$. (1)"
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "HEN CC Scaffold",
        "body": "H — define $p$ in words, state $H_0$ (=) and $H_1$ ($>$/$<$/$\\neq$). E — model ($X \\sim B(n, p)$ under $H_0$). N — compute $p$-value or find CR. C — compare with $\\alpha$. C — conclude in context. Never say 'prove'."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Forgetting to Define $p$ in Words",
        "body": "Stating '$H_0: p = 0.3$' without defining what $p$ represents loses the B1 context mark. Write 'Let $p$ be the probability that a randomly chosen [item] is [outcome]' before the hypotheses."
      }
    }
  ],
  "flashcards": [
    [
      "What does HEN CC stand for?",
      "Hypotheses, Expected model, Numbers, Compare, Conclude."
    ],
    [
      "Conclusion wording for significant result?",
      "'Significant evidence to suggest [context]'. No 'proof'."
    ],
    [
      "What distribution underlies a binomial hypothesis test?",
      "$X\\sim B(n,p)$ under $H_0$."
    ],
    [
      "How do you find the critical region for a one-tailed binomial test?",
      "Find values where the cumulative probability is below the significance level."
    ],
    [
      "What is the actual significance level?",
      "The true probability of the critical region (usually less than the nominal level)."
    ],
    [
      "When do you reject $H_0$ in a binomial test?",
      "When the observed value lies in the critical region (or its tail probability < significance level)."
    ],
    [
      "For $H_1:p>p_0$, which tail is the critical region?",
      "The upper tail (large values)."
    ],
    [
      "What does a non-significant result mean?",
      "Insufficient evidence to reject $H_0$ — not proof that $H_0$ is true."
    ]
  ],
  "quiz": [
    {
      "q": "Testing bias TOWARD heads: $H_1$ is?",
      "opts": [
        "$p \\neq 0.5$",
        "$p > 0.5$",
        "$p < 0.5$"
      ],
      "ans": 1,
      "why": "Direction stated."
    },
    {
      "q": "Under $H_0$ a binomial test models $X$ as...?",
      "opts": [
        "$N(0,1)$",
        "$B(n,p_0)$",
        "uniform",
        "$Poisson$"
      ],
      "ans": 1,
      "why": "Binomial with the hypothesised $p_0$."
    },
    {
      "q": "For $H_1:p>0.3$, the critical region is in the...?",
      "opts": [
        "lower tail",
        "upper tail",
        "both tails",
        "centre"
      ],
      "ans": 1,
      "why": "Evidence for an increase is large values."
    },
    {
      "q": "The actual significance level is usually...?",
      "opts": [
        "exactly 5%",
        "less than the nominal level",
        "more than 50%",
        "zero"
      ],
      "ans": 1,
      "why": "Discreteness makes it below nominal."
    },
    {
      "q": "You reject $H_0$ when the observed value...?",
      "opts": [
        "equals the mean",
        "lies in the critical region",
        "is the median",
        "is positive"
      ],
      "ans": 1,
      "why": "Critical region = rejection."
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
    },
    {
      "q": "$X\\sim B(20,0.25)$ under $H_0$. State $H_0$, $H_1$ for testing whether $p$ has increased, and the expected value of $X$.",
      "marks": 2,
      "ms": [
        "$H_0:p=0.25$, $H_1:p>0.25$. (1)",
        "Expected $X=np=20\\times0.25=5$. (1)"
      ]
    },
    {
      "q": "A drug is claimed to cure 30% of patients. In a trial of 20 patients, 11 are cured. Test at the 5% level whether the cure rate exceeds 30%. (Given $P(X\\ge11)=0.0171$ for $X\\sim B(20,0.3)$.)",
      "marks": 6,
      "ms": [
        "$H_0:p=0.3$, $H_1:p>0.3$ (one-tailed). (1)",
        "Under $H_0$, $X\\sim B(20,0.3)$. (1)",
        "Find $P(X\\ge11)=0.0171$. (1)",
        "Compare with 5% = 0.05. (1)",
        "$0.0171<0.05$, so the result is significant. (1)",
        "Reject $H_0$: there is evidence the cure rate exceeds 30%. (1)"
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Sample Mean Distribution",
        "body": "If $X \\sim N(\\mu, \\sigma^2)$, then $\\bar{X} \\sim N(\\mu, \\sigma^2/n)$. Standard Error $= \\sigma/\\sqrt{n}$. Test statistic: $Z = \\frac{\\bar{X} - \\mu_0}{\\sigma/\\sqrt{n}}$. Critical values: $\\pm 1.96$ (5% two-tail), $\\pm 1.6449$ (5% one-tail), $\\pm 2.3263$ (1% one-tail)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Using $\\sigma^2$ Instead of $\\sigma^2/n$",
        "body": "The sample mean $\\bar{X}$ has variance $\\sigma^2/n$, NOT $\\sigma^2$. Using the population variance directly in the test statistic gives the wrong $Z$ value. Divide by $n$ inside the root: $\\sigma/\\sqrt{n}$, NOT $\\sigma/n$."
      }
    }
  ],
  "flashcards": [
    [
      "Define 'Standard Error'.",
      "Standard deviation of sample mean: $\\sigma / \\sqrt{n}$."
    ],
    [
      "$Z_{crit}$ for $5\\%$ two-tailed?",
      "$\\pm 1.96$."
    ],
    [
      "What is the distribution of the sample mean for $X\\sim N(\\mu,\\sigma^2)$?",
      "$\\bar X\\sim N\\left(\\mu,\\dfrac{\\sigma^2}{n}\\right)$."
    ],
    [
      "Test statistic for a normal mean test?",
      "$Z=\\dfrac{\\bar x-\\mu_0}{\\sigma/\\sqrt n}$."
    ],
    [
      "Critical $z$ for a one-tailed 5% test?",
      "$1.645$."
    ],
    [
      "Critical $z$ for a two-tailed 5% test?",
      "$\\pm1.96$."
    ],
    [
      "When do you reject $H_0$ using the $z$-statistic?",
      "When $|z|$ exceeds the critical value (in the critical region)."
    ],
    [
      "What does $\\sigma/\\sqrt n$ represent?",
      "The standard error of the sample mean."
    ]
  ],
  "quiz": [
    {
      "q": "$X \\sim N(100, 64), n=16$. Standard Error?",
      "opts": [
        "$8$",
        "$4$",
        "$2$",
        "$0.5$"
      ],
      "ans": 2,
      "why": "$\\sigma = 8$. $\\text{SE} = 8 / \\sqrt{16} = 2$."
    },
    {
      "q": "The sample mean of $N(\\mu,\\sigma^2)$ has variance...?",
      "opts": [
        "$\\sigma^2$",
        "$\\dfrac{\\sigma^2}{n}$",
        "$n\\sigma^2$",
        "$\\sigma$"
      ],
      "ans": 1,
      "why": "Variance of the mean is $\\sigma^2/n$."
    },
    {
      "q": "Critical value for a one-tailed test at 5% is...?",
      "opts": [
        "$1.96$",
        "$1.645$",
        "$2.576$",
        "$0.5$"
      ],
      "ans": 1,
      "why": "One-tailed 5% uses 1.645."
    },
    {
      "q": "The test statistic $Z=$?",
      "opts": [
        "$\\dfrac{\\bar x-\\mu_0}{\\sigma/\\sqrt n}$",
        "$\\dfrac{\\bar x-\\mu_0}{\\sigma}$",
        "$\\dfrac{\\mu_0}{\\bar x}$",
        "$\\bar x-\\mu_0$"
      ],
      "ans": 0,
      "why": "Standardise using the standard error."
    },
    {
      "q": "A two-tailed 5% test rejects $H_0$ when $|z|>$?",
      "opts": [
        "$1.645$",
        "$1.96$",
        "$2.33$",
        "$1$"
      ],
      "ans": 1,
      "why": "Two-tailed 5% critical value is 1.96."
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
    },
    {
      "q": "$\\bar X$ is the mean of $n=25$ observations from $N(\\mu,100)$. State the distribution of $\\bar X$ and the standard error.",
      "marks": 2,
      "ms": [
        "$\\bar X\\sim N\\left(\\mu,\\dfrac{100}{25}\\right)=N(\\mu,4)$. (1)",
        "Standard error $=\\sqrt4=2$. (1)"
      ]
    },
    {
      "q": "A machine should fill bottles to a mean of 500 ml with s.d. 8 ml. A sample of 16 bottles has mean 495 ml. Test at the 5% level whether the mean has decreased.",
      "marks": 6,
      "ms": [
        "$H_0:\\mu=500$, $H_1:\\mu<500$ (one-tailed). (1)",
        "Standard error $=\\dfrac{8}{\\sqrt{16}}=2$. (1)",
        "$z=\\dfrac{495-500}{2}=-2.5$. (1)",
        "Critical value (one-tailed 5%) $=-1.645$. (1)",
        "$-2.5<-1.645$, so in the critical region. (1)",
        "Reject $H_0$: evidence the mean has decreased. (1)"
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
              [
                "Mass",
                "Kilogram ($\\text{kg}$)"
              ],
              [
                "Length",
                "Metre ($\\text{m}$)"
              ],
              [
                "Time",
                "Second ($\\text{s}$)"
              ]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": [
          "Quantity",
          "Standard Unit",
          "Base Units"
        ],
        "rows": [
          [
            "Velocity ($v$)",
            "$\\text{m s}^{-1}$",
            "$\\text{m/s}$"
          ],
          [
            "Acceleration ($a$)",
            "$\\text{m s}^{-2}$",
            "$\\text{m/s}^2$"
          ],
          [
            "Force ($F$)",
            "Newton ($\\text{N}$)",
            "$\\text{kg m s}^{-2}$"
          ],
          [
            "Energy ($E$)",
            "Joule ($\\text{J}$)",
            "$\\text{kg m}^2 \\text{s}^{-2}$"
          ]
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "SI Base Units in Mechanics",
        "body": "Mass — kg. Length — m. Time — s. Velocity — $\\text{m s}^{-1}$. Acceleration — $\\text{m s}^{-2}$. Force — Newton ($\\text{N}$) $= \\text{kg m s}^{-2}$. Convert km/h: $\\div 3.6$ to get m/s."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Weight is Measured in kg",
        "body": "Weight is a FORCE measured in Newtons ($W = mg$). Mass is measured in kg. Saying an object 'weighs $5\\text{ kg}$' is everyday language, but in mechanics weight must be in Newtons."
      }
    }
  ],
  "flashcards": [
    [
      "Base units of Newton?",
      "$\\text{kg m s}^{-2}$."
    ],
    [
      "Why is kg special?",
      "Only base unit with a prefix."
    ],
    [
      "SI base units for mass, length and time?",
      "kilogram (kg), metre (m), second (s)."
    ],
    [
      "SI unit of force, in base units?",
      "Newton (N) $=$ kg·m·s$^{-2}$."
    ],
    [
      "Units of velocity and acceleration?",
      "m s$^{-1}$ and m s$^{-2}$."
    ],
    [
      "What is a derived unit?",
      "A unit built from base units, e.g. N $=$ kg m s$^{-2}$."
    ],
    [
      "Units of momentum?",
      "kg m s$^{-1}$ (equivalently N s)."
    ],
    [
      "Why check units in a formula?",
      "To verify it is dimensionally consistent — a useful check against errors."
    ]
  ],
  "quiz": [
    {
      "q": "Convert $90\\text{ km/h}$ to $\\text{m/s}$.",
      "opts": [
        "$25$",
        "$32.4$",
        "$900$"
      ],
      "ans": 0,
      "why": "$90,000 / 3,600 = 25$."
    },
    {
      "q": "The newton in base units is...?",
      "opts": [
        "kg m s$^{-1}$",
        "kg m s$^{-2}$",
        "kg s$^{-1}$",
        "kg m$^2$"
      ],
      "ans": 1,
      "why": "$F=ma\\Rightarrow$ kg·m·s$^{-2}$."
    },
    {
      "q": "SI unit of acceleration?",
      "opts": [
        "m s$^{-1}$",
        "m s$^{-2}$",
        "m",
        "N"
      ],
      "ans": 1,
      "why": "Rate of change of velocity."
    },
    {
      "q": "Which is a base quantity?",
      "opts": [
        "force",
        "velocity",
        "mass",
        "energy"
      ],
      "ans": 2,
      "why": "Mass is fundamental."
    },
    {
      "q": "Momentum has units...?",
      "opts": [
        "kg m s$^{-1}$",
        "N",
        "m s$^{-2}$",
        "J"
      ],
      "ans": 0,
      "why": "mass × velocity."
    }
  ],
  "exam": [
    {
      "q": "Determine base units of $G$ from $F = G m_1 m_2 / r^2$.",
      "marks": 3,
      "ms": [
        "$G = F r^2 / (m_1 m_2)$ (1)",
        "Units: $(\\text{kg m s}^{-2})(\\text{m}^2) / (\\text{kg}^2)$ (1)",
        "$= \\text{kg}^{-1} \\text{m}^3 \\text{s}^{-2}$ (1)"
      ]
    },
    {
      "q": "State the SI base units of (a) acceleration (b) force.",
      "marks": 2,
      "ms": [
        "(a) m s$^{-2}$. (1)",
        "(b) kg m s$^{-2}$ (the newton). (1)"
      ]
    },
    {
      "q": "Using base units, show that $F=ma$ is dimensionally consistent when $F$ is measured in newtons.",
      "marks": 6,
      "ms": [
        "Mass $m$ has units kg. (1)",
        "Acceleration $a$ has units m s$^{-2}$. (1)",
        "So $ma$ has units kg·m·s$^{-2}$. (1)",
        "The newton is defined as kg·m·s$^{-2}$. (1)",
        "Hence the units of $ma$ equal the units of $F$. (1)",
        "The equation is dimensionally consistent. (1)"
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
              [
                "Scalar",
                "Magnitude only: Distance, Speed, Time, Mass."
              ],
              [
                "Vector",
                "Magnitude and Direction: Displacement ($s$), Velocity ($v$), Accel ($a$)."
              ]
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Scalar/Vector Pairs",
        "body": "Scalar → vector: Distance → Displacement. Speed → Velocity. Mass → Weight (force). Average speed $=$ total distance $\\div$ total time. Average velocity $=$ total displacement $\\div$ total time. At rest: $v = 0$."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Average Speed = Displacement / Time",
        "body": "Average SPEED uses total DISTANCE (path length), not displacement. If you travel $50\\text{ m}$ and return $50\\text{ m}$, average speed $= 100/t$, but average velocity $= 0/t = 0$."
      }
    }
  ],
  "flashcards": [
    [
      "Difference between speed and velocity?",
      "Speed is scalar; velocity is vector."
    ],
    [
      "Define 'at rest'.",
      "$v = 0$."
    ],
    [
      "Difference between distance and displacement?",
      "Distance is total path length (scalar); displacement is the straight-line vector from start to end."
    ],
    [
      "Difference between speed and velocity?",
      "Speed is a scalar; velocity is speed with direction (a vector)."
    ],
    [
      "What is acceleration?",
      "The rate of change of velocity."
    ],
    [
      "Is acceleration a scalar or a vector?",
      "A vector."
    ],
    [
      "What does negative velocity indicate?",
      "Motion in the negative direction."
    ],
    [
      "What does deceleration mean?",
      "Acceleration acting opposite to the velocity (slowing down)."
    ]
  ],
  "quiz": [
    {
      "q": "Swim $50\\text{m}$ and back. Displacement?",
      "opts": [
        "$100\\text{m}$",
        "$50\\text{m}$",
        "$0\\text{m}$"
      ],
      "ans": 2,
      "why": "Starts and ends at O."
    },
    {
      "q": "Displacement is a...?",
      "opts": [
        "scalar",
        "vector",
        "speed",
        "distance only"
      ],
      "ans": 1,
      "why": "It has magnitude and direction."
    },
    {
      "q": "Which is a scalar?",
      "opts": [
        "velocity",
        "displacement",
        "speed",
        "acceleration"
      ],
      "ans": 2,
      "why": "Speed has no direction."
    },
    {
      "q": "A particle returns to its start. Its displacement is...?",
      "opts": [
        "maximum",
        "zero",
        "the distance travelled",
        "negative"
      ],
      "ans": 1,
      "why": "Start = end, so displacement is zero."
    },
    {
      "q": "Acceleration is the rate of change of...?",
      "opts": [
        "displacement",
        "velocity",
        "distance",
        "speed only"
      ],
      "ans": 1,
      "why": "$a=dv/dt$."
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
    },
    {
      "q": "A runner goes 100 m east then 40 m west. State the total distance and the magnitude of the displacement.",
      "marks": 2,
      "ms": [
        "Distance $=100+40=140$ m. (1)",
        "Displacement $=100-40=60$ m (east). (1)"
      ]
    },
    {
      "q": "Explain the difference between distance and displacement, and between speed and velocity, using a particle that travels 5 m right then 5 m left in 4 s.",
      "marks": 6,
      "ms": [
        "Distance is the total path length: $5+5=10$ m. (1)",
        "Displacement is the net vector from start to end: $0$ m. (1)",
        "Speed (scalar) = distance/time = $10/4=2.5$ m s$^{-1}$ average. (1)",
        "Velocity (vector) = displacement/time = $0/4=0$. (1)",
        "So average speed is non-zero but average velocity is zero. (1)",
        "This shows scalars ignore direction while vectors include it. (1)"
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
      "callout": {
        "t": "formula",
        "h": "Gradient = Rate of Change",
        "body": "$s$-$t$ graph: gradient = velocity. $v$-$t$ graph: gradient = acceleration. $a$-$t$ graph: gradient = rate of change of acceleration. Area under graph = integral of that quantity."
      }
    },
    {
      "table": {
        "head": [
          "Graph",
          "Gradient gives",
          "Area gives"
        ],
        "rows": [
          [
            "$s$-$t$",
            "Velocity $v$",
            "N/A"
          ],
          [
            "$v$-$t$",
            "Acceleration $a$",
            "Displacement $s$"
          ],
          [
            "$a$-$t$",
            "Rate of change of $a$",
            "Change in velocity $\\Delta v$"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Distance ≠ Displacement from $v$-$t$ Graph",
        "body": "**Displacement** = net area (regions below the axis count negative). **Distance** = total area, all positive. If a particle reverses, distance > |displacement|."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Curved $v$-$t$ Graph",
        "body": "If the $v$-$t$ graph is curved, the gradient at a point (instantaneous acceleration) requires differentiation. Area under a curved $v$-$t$ graph requires integration — you cannot use simple trapezium rules exactly."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Reading the Graph — Key Signs",
        "body": "Positive velocity = moving in positive direction. Zero velocity = stationary (turning point or rest). Negative velocity = moving in opposite direction. Horizontal $v$-$t$ segment = constant velocity (zero acceleration)."
      }
    },
    {
      "steps": [
        {
          "h": "Find distance from $v$-$t$ graph with sign change",
          "m": "Split at $v = 0$ (where direction reverses). Compute each area separately, then sum the absolute values.",
          "n": "Displacement = algebraic sum; distance = sum of absolute areas."
        }
      ]
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Area Under $v$-$t$ = Distance",
        "body": "Area under a $v$-$t$ graph gives DISPLACEMENT (signed), NOT distance. Distance requires summing the absolute area of each section, treating regions below the axis as positive. If the particle never reverses, displacement $=$ distance."
      }
    }
  ],
  "flashcards": [
    [
      "Gradient of $v-t$?",
      "Acceleration."
    ],
    [
      "Area of $v-t$?",
      "Displacement."
    ],
    [
      "What does the gradient of a displacement-time graph give?",
      "The velocity."
    ],
    [
      "What does the gradient of a velocity-time graph give?",
      "The acceleration."
    ],
    [
      "What does the area under a velocity-time graph give?",
      "The displacement."
    ],
    [
      "What does a horizontal line on a velocity-time graph mean?",
      "Constant velocity (zero acceleration)."
    ],
    [
      "What does a straight sloping line on a v-t graph mean?",
      "Constant acceleration."
    ],
    [
      "How do you find distance from a v-t graph if velocity goes negative?",
      "Take the area as positive for distance (displacement uses signed area)."
    ]
  ],
  "quiz": [
    {
      "q": "$v-t$ triangle: base $10$, height $20$. $s = ?$",
      "opts": [
        "$200$",
        "$100$",
        "$2$"
      ],
      "ans": 1,
      "why": "$\\frac{1}{2} \\times 10 \\times 20 = 100$."
    },
    {
      "q": "Gradient of a displacement-time graph is...?",
      "opts": [
        "acceleration",
        "velocity",
        "distance",
        "force"
      ],
      "ans": 1,
      "why": "$ds/dt=v$."
    },
    {
      "q": "Area under a velocity-time graph is...?",
      "opts": [
        "acceleration",
        "displacement",
        "speed",
        "force"
      ],
      "ans": 1,
      "why": "$\\int v\\,dt=s$."
    },
    {
      "q": "A horizontal v-t line means...?",
      "opts": [
        "constant acceleration",
        "constant velocity",
        "at rest",
        "increasing speed"
      ],
      "ans": 1,
      "why": "No change in velocity."
    },
    {
      "q": "Gradient of a velocity-time graph gives...?",
      "opts": [
        "displacement",
        "acceleration",
        "speed",
        "distance"
      ],
      "ans": 1,
      "why": "$dv/dt=a$."
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
    },
    {
      "q": "A velocity-time graph is a straight line from $(0,0)$ to $(10,20)$ (s, m s$^{-1}$). Find the acceleration and the distance travelled.",
      "marks": 3,
      "ms": [
        "Acceleration = gradient $=20/10=2$ m s$^{-2}$. (1)",
        "Distance = area $=\\tfrac12(10)(20)$. (1)",
        "$=100$ m. (1)"
      ]
    },
    {
      "q": "A car accelerates uniformly from rest to 30 m s$^{-1}$ in 12 s, travels at 30 m s$^{-1}$ for 8 s, then decelerates uniformly to rest in 6 s. Sketch reasoning aside, find the total distance.",
      "marks": 6,
      "ms": [
        "Phase 1 (triangle): $\\tfrac12(12)(30)=180$ m. (1)",
        "Phase 2 (rectangle): $30\\times8=240$ m. (1)",
        "Phase 3 (triangle): $\\tfrac12(6)(30)=90$ m. (1)",
        "Sum the three areas. (1)",
        "$180+240+90$. (1)",
        "$=510$ m. (1)"
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "The Five suvat Equations",
        "body": "$v = u + at$; $s = ut + \\tfrac{1}{2}at^2$; $s = \\tfrac{1}{2}(u+v)t$; $v^2 = u^2 + 2as$; $s = vt - \\tfrac{1}{2}at^2$. Valid ONLY for constant acceleration. List $s,u,v,a,t$ and pick the equation that uses 4 of the 5."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "suvat Works for Variable Acceleration",
        "body": "suvat equations assume CONSTANT acceleration throughout. For variable acceleration you MUST use calculus ($v = ds/dt$, $a = dv/dt$). Using suvat with variable $a$ gives wrong answers."
      }
    }
  ],
  "flashcards": [
    [
      "When is suvat invalid?",
      "Variable acceleration."
    ],
    [
      "At max height, what is zero?",
      "Vertical velocity $v_y$."
    ],
    [
      "State the suvat equation linking $v,u,a,t$.",
      "$v=u+at$."
    ],
    [
      "State the suvat equation for displacement with $u,a,t$.",
      "$s=ut+\\tfrac12 at^2$."
    ],
    [
      "State the suvat equation without $t$.",
      "$v^2=u^2+2as$."
    ],
    [
      "State the suvat equation using average velocity.",
      "$s=\\tfrac12(u+v)t$."
    ],
    [
      "What condition must hold to use suvat?",
      "Constant (uniform) acceleration."
    ],
    [
      "What does $u$ represent?",
      "The initial velocity."
    ]
  ],
  "quiz": [
    {
      "q": "Know $u, a, t$; want $s$, no $v$. Use?",
      "opts": [
        "$v^2=u^2+2as$",
        "$s=ut+\\frac{1}{2}at^2$",
        "$v=u+at$"
      ],
      "ans": 1,
      "why": "Missing $v$."
    },
    {
      "q": "Which equation finds $v$ from $u,a,t$?",
      "opts": [
        "$v=u+at$",
        "$s=ut+\\tfrac12at^2$",
        "$v^2=u^2+2as$",
        "$s=\\tfrac12(u+v)t$"
      ],
      "ans": 0,
      "why": "$v=u+at$."
    },
    {
      "q": "suvat equations require...?",
      "opts": [
        "constant velocity",
        "constant acceleration",
        "no acceleration",
        "a force"
      ],
      "ans": 1,
      "why": "They assume uniform acceleration."
    },
    {
      "q": "A body from rest, $a=2$, after $5$ s has $v=$?",
      "opts": [
        "$2$",
        "$10$",
        "$5$",
        "$25$"
      ],
      "ans": 1,
      "why": "$v=0+2(5)=10$."
    },
    {
      "q": "Which equation omits time?",
      "opts": [
        "$v=u+at$",
        "$v^2=u^2+2as$",
        "$s=ut+\\tfrac12at^2$",
        "$s=\\tfrac12(u+v)t$"
      ],
      "ans": 1,
      "why": "$v^2=u^2+2as$ has no $t$."
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
    },
    {
      "q": "A car accelerates from $8$ m s$^{-1}$ at $3$ m s$^{-2}$ for $4$ s. Find its final velocity and the distance travelled.",
      "marks": 3,
      "ms": [
        "$v=u+at=8+3(4)=20$ m s$^{-1}$. (1)",
        "$s=ut+\\tfrac12at^2=8(4)+\\tfrac12(3)(16)$. (1)",
        "$=32+24=56$ m. (1)"
      ]
    },
    {
      "q": "A ball is thrown vertically up at $14$ m s$^{-1}$ ($g=9.8$). Find the greatest height and the time to return to the throwing point.",
      "marks": 6,
      "ms": [
        "At greatest height $v=0$. (1)",
        "$v^2=u^2-2gs\\Rightarrow0=14^2-2(9.8)s$. (1)",
        "$s=\\dfrac{196}{19.6}=10$ m. (1)",
        "Time up: $v=u-gt\\Rightarrow0=14-9.8t$. (1)",
        "$t=\\dfrac{14}{9.8}=1.43$ s. (1)",
        "By symmetry, total time $=2(1.43)\\approx2.86$ s. (1)"
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Calculus Chain in Kinematics",
        "body": "Differentiate: $s \\xrightarrow{d/dt} v \\xrightarrow{d/dt} a$. Integrate: $a \\xrightarrow{\\int} v \\xrightarrow{\\int} s$ (add $+c$ each time, use initial conditions). Integrating $v$ gives DISPLACEMENT; to get DISTANCE, split at $v=0$ and sum absolute areas."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Integrating $v$ Gives Distance",
        "body": "Integrating $v(t)$ from $a$ to $b$ gives DISPLACEMENT (signed), not distance. If the particle changes direction, $\\int |v(t)| \\, dt$ gives distance. Missing this when the particle reverses gives an underestimate of distance."
      }
    }
  ],
  "flashcards": [
    [
      "How to find velocity from displacement?",
      "$v = ds/dt$."
    ],
    [
      "What to add when integrating?",
      "Constant of integration $+C$."
    ],
    [
      "How do you get velocity from displacement using calculus?",
      "Differentiate: $v=\\dfrac{ds}{dt}$."
    ],
    [
      "How do you get acceleration from velocity?",
      "Differentiate: $a=\\dfrac{dv}{dt}$."
    ],
    [
      "How do you get displacement from velocity?",
      "Integrate: $s=\\int v\\,dt$."
    ],
    [
      "How do you get velocity from acceleration?",
      "Integrate: $v=\\int a\\,dt$."
    ],
    [
      "Why use calculus instead of suvat?",
      "When the acceleration is NOT constant (varies with time)."
    ],
    [
      "What do you need when integrating to find motion?",
      "Initial conditions to determine the constant of integration."
    ]
  ],
  "quiz": [
    {
      "q": "$s = 2t^3 - 5t$. $v$ at $t=2$?",
      "opts": [
        "$19$",
        "$11$",
        "$24$"
      ],
      "ans": 0,
      "why": "$v = 6t^2 - 5$. $6(4)-5 = 19$."
    },
    {
      "q": "$v=\\dfrac{ds}{dt}$ means velocity is the...?",
      "opts": [
        "integral of s",
        "derivative of displacement",
        "area under s",
        "constant"
      ],
      "ans": 1,
      "why": "Differentiate displacement."
    },
    {
      "q": "To find displacement from velocity you...?",
      "opts": [
        "differentiate",
        "integrate",
        "square",
        "divide by t"
      ],
      "ans": 1,
      "why": "$s=\\int v\\,dt$."
    },
    {
      "q": "Calculus methods are needed when acceleration is...?",
      "opts": [
        "constant",
        "zero",
        "variable",
        "negative"
      ],
      "ans": 2,
      "why": "suvat fails for variable acceleration."
    },
    {
      "q": "$a=\\dfrac{dv}{dt}$ is the...?",
      "opts": [
        "integral of v",
        "derivative of velocity",
        "displacement",
        "speed"
      ],
      "ans": 1,
      "why": "Differentiate velocity."
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
    },
    {
      "q": "A particle has velocity $v=3t^2-4t$ m s$^{-1}$. Find its acceleration at $t=2$.",
      "marks": 3,
      "ms": [
        "$a=\\dfrac{dv}{dt}=6t-4$. (1)",
        "At $t=2$: $a=12-4$. (1)",
        "$=8$ m s$^{-2}$. (1)"
      ]
    },
    {
      "q": "A particle moves with velocity $v=6t-t^2$ m s$^{-1}$, starting at the origin. Find (a) the acceleration when $t=1$, (b) the displacement after 3 s.",
      "marks": 6,
      "ms": [
        "(a) $a=\\dfrac{dv}{dt}=6-2t$. (1)",
        "At $t=1$: $a=4$ m s$^{-2}$. (1)",
        "(b) $s=\\int_0^3(6t-t^2)\\,dt$. (1)",
        "$=\\left[3t^2-\\tfrac{t^3}{3}\\right]_0^3$. (1)",
        "$=27-9$. (1)",
        "$=18$ m. (1)"
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Projectile Motion Setup",
        "body": "Resolve initial velocity: $u_x = u\\cos\\theta$, $u_y = u\\sin\\theta$. Horizontal: $a=0$, $x = (u\\cos\\theta)t$. Vertical: $a = -g$, use suvat. Time $t$ is the same for both components. At max height: $v_y = 0$."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Horizontal Velocity Changes During Flight",
        "body": "In standard projectile motion, horizontal velocity is CONSTANT (no air resistance, $a_x = 0$). Only vertical velocity changes due to gravity. Applying $F=ma$ horizontally gives zero net force, so $v_x = u\\cos\\theta$ throughout."
      }
    }
  ],
  "flashcards": [
    [
      "Horizontal acceleration?",
      "Zero."
    ],
    [
      "Vertical acceleration?",
      "$-9.8\\text{ m/s}^2$."
    ],
    [
      "How is projectile motion split?",
      "Into independent horizontal (constant velocity) and vertical (acceleration $g$) components."
    ],
    [
      "Horizontal acceleration of a projectile (no air resistance)?",
      "Zero."
    ],
    [
      "Vertical acceleration of a projectile?",
      "$g\\approx9.8$ m s$^{-2}$ downward."
    ],
    [
      "Initial horizontal/vertical components of speed $u$ at angle $\\theta$?",
      "$u\\cos\\theta$ and $u\\sin\\theta$."
    ],
    [
      "What links the horizontal and vertical motions?",
      "Time — it is the same for both components."
    ],
    [
      "When does a projectile reach maximum height?",
      "When its vertical velocity is zero."
    ]
  ],
  "quiz": [
    {
      "q": "$u=20$ at $30^\\circ$. Initial $v_y$?",
      "opts": [
        "$10$",
        "$17.3$",
        "$20$"
      ],
      "ans": 0,
      "why": "$20\\sin 30 = 10$."
    },
    {
      "q": "Horizontal acceleration of a projectile is...?",
      "opts": [
        "$g$",
        "$0$",
        "$-g$",
        "$u$"
      ],
      "ans": 1,
      "why": "No horizontal force (ignoring air resistance)."
    },
    {
      "q": "Vertical velocity at maximum height is...?",
      "opts": [
        "$u$",
        "$0$",
        "$g$",
        "maximum"
      ],
      "ans": 1,
      "why": "It momentarily stops rising."
    },
    {
      "q": "Horizontal component of $u$ at angle $\\theta$?",
      "opts": [
        "$u\\sin\\theta$",
        "$u\\cos\\theta$",
        "$u\\tan\\theta$",
        "$u$"
      ],
      "ans": 1,
      "why": "$u\\cos\\theta$."
    },
    {
      "q": "The two component motions share the same...?",
      "opts": [
        "acceleration",
        "velocity",
        "time",
        "displacement"
      ],
      "ans": 2,
      "why": "Time connects them."
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
    },
    {
      "q": "A ball is projected horizontally at $10$ m s$^{-1}$ from a height of $20$ m ($g=9.8$). Find the time to land.",
      "marks": 3,
      "ms": [
        "Vertical: $s=\\tfrac12gt^2\\Rightarrow20=\\tfrac12(9.8)t^2$. (1)",
        "$t^2=\\dfrac{40}{9.8}=4.08$. (1)",
        "$t\\approx2.02$ s. (1)"
      ]
    },
    {
      "q": "A projectile is launched at $20$ m s$^{-1}$ at $30^\\circ$ above the horizontal ($g=9.8$). Find the maximum height and the horizontal range.",
      "marks": 6,
      "ms": [
        "$u_y=20\\sin30^\\circ=10$, $u_x=20\\cos30^\\circ\\approx17.3$. (1)",
        "Max height: $v_y^2=u_y^2-2g h\\Rightarrow0=100-19.6h$. (1)",
        "$h=\\dfrac{100}{19.6}\\approx5.10$ m. (1)",
        "Time of flight: $t=\\dfrac{2u_y}{g}=\\dfrac{20}{9.8}\\approx2.04$ s. (1)",
        "Range $=u_x\\times t=17.3\\times2.04$. (1)",
        "$\\approx35.3$ m. (1)"
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Newton's First Law",
        "body": "An object remains at rest or at constant velocity UNLESS a resultant force acts. Equilibrium: $\\sum F_x = 0$ and $\\sum F_y = 0$. Constant speed in a straight line means zero resultant force — drives and resistances balance."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Constant Speed Requires a Driving Force",
        "body": "A driving force is needed to maintain constant speed ONLY to balance resistances (friction, drag). If there were no resistances, zero net force would maintain constant speed by N1L. The driving force balances resistance, not speed."
      }
    }
  ],
  "flashcards": [
    [
      "What is inertia?",
      "Resistance to change in motion. Measured by mass."
    ],
    [
      "Resultant force on car at steady speed?",
      "Zero."
    ],
    [
      "State Newton's first law.",
      "A body stays at rest or moves with constant velocity unless acted on by a resultant force."
    ],
    [
      "What is meant by equilibrium?",
      "The resultant force is zero (so no acceleration)."
    ],
    [
      "Name three common forces in mechanics.",
      "Weight, normal reaction, friction, tension, thrust (any three)."
    ],
    [
      "What is the normal reaction force?",
      "The contact force a surface exerts perpendicular to itself."
    ],
    [
      "What is tension?",
      "A pulling force along a string or rod."
    ],
    [
      "If a body moves at constant velocity, the resultant force is...?",
      "Zero."
    ]
  ],
  "quiz": [
    {
      "q": "$1000\\text{kg}$ car at steady $30\\text{ m/s}$. Net force?",
      "opts": [
        "$30000$",
        "$0$",
        "$9800$"
      ],
      "ans": 1,
      "why": "Constant velocity."
    },
    {
      "q": "Newton's first law concerns bodies with...?",
      "opts": [
        "no resultant force",
        "increasing force",
        "friction only",
        "weight only"
      ],
      "ans": 0,
      "why": "Zero resultant means rest or constant velocity."
    },
    {
      "q": "Equilibrium means the resultant force is...?",
      "opts": [
        "maximum",
        "zero",
        "weight",
        "upward"
      ],
      "ans": 1,
      "why": "No net force."
    },
    {
      "q": "The normal reaction acts...?",
      "opts": [
        "along the surface",
        "perpendicular to the surface",
        "downward always",
        "with friction"
      ],
      "ans": 1,
      "why": "Perpendicular to the contact surface."
    },
    {
      "q": "A book resting on a table is in...?",
      "opts": [
        "acceleration",
        "equilibrium",
        "free fall",
        "tension"
      ],
      "ans": 1,
      "why": "Forces balance."
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
    },
    {
      "q": "A box rests in equilibrium on a horizontal floor. Name the two vertical forces and state how they are related.",
      "marks": 2,
      "ms": [
        "Weight (down) and normal reaction (up). (1)",
        "They are equal in magnitude (resultant zero). (1)"
      ]
    },
    {
      "q": "A lift moves at constant velocity carrying a 60 kg person ($g=9.8$). (a) State why the resultant force is zero. (b) Find the normal reaction on the person.",
      "marks": 6,
      "ms": [
        "(a) Constant velocity means no acceleration. (1)",
        "By Newton's first law the resultant force is zero. (1)",
        "Forces on the person: weight down, reaction up. (1)",
        "Weight $=mg=60\\times9.8=588$ N. (1)",
        "Resultant zero $\\Rightarrow R=W$. (1)",
        "$R=588$ N. (1)"
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "$F = ma$ Routine",
        "body": "Draw diagram. Resolve forces. Apply $F_{\\text{net}} = ma$ along motion; $0$ perpendicular. On slope: $mg\\sin\\theta$ component along slope, $mg\\cos\\theta$ perpendicular (= normal reaction $R$ if smooth). Weight $= mg$ (Newtons)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Weight = Mass",
        "body": "Weight is a FORCE: $W = mg$ in Newtons. Mass is in kg and measures inertia. Substituting mass (kg) for weight in $F = ma$ gives dimensionally wrong answers. Always convert mass to weight when needed."
      }
    }
  ],
  "flashcards": [
    [
      "Newton's Second Law?",
      "$F = ma$."
    ],
    [
      "Weight vs Mass?",
      "$W=mg$ (Force); $m$ is matter (Inertia)."
    ],
    [
      "State Newton's second law.",
      "Resultant force $=$ mass $\\times$ acceleration ($F=ma$)."
    ],
    [
      "Rearrange $F=ma$ for acceleration.",
      "$a=\\dfrac{F}{m}$."
    ],
    [
      "What does a larger resultant force do (same mass)?",
      "Produces a larger acceleration."
    ],
    [
      "Units check for $F=ma$?",
      "N $=$ kg $\\times$ m s$^{-2}$."
    ],
    [
      "What force is needed to accelerate 2 kg at 3 m s$^{-2}$?",
      "$F=ma=6$ N."
    ],
    [
      "If the resultant force is zero, the acceleration is...?",
      "Zero (constant velocity)."
    ]
  ],
  "quiz": [
    {
      "q": "Net $12\\text{N}$ on $3\\text{kg}$. Accel?",
      "opts": [
        "$4$",
        "$36$",
        "$0.25$"
      ],
      "ans": 0,
      "why": "$12/3 = 4$."
    },
    {
      "q": "$F=ma$. A 5 kg mass under 20 N accelerates at...?",
      "opts": [
        "$4$ m s$^{-2}$",
        "$100$ m s$^{-2}$",
        "$0.25$ m s$^{-2}$",
        "$15$ m s$^{-2}$"
      ],
      "ans": 0,
      "why": "$a=F/m=20/5=4$."
    },
    {
      "q": "Doubling the resultant force (same mass) doubles the...?",
      "opts": [
        "mass",
        "acceleration",
        "weight",
        "time"
      ],
      "ans": 1,
      "why": "$a\\propto F$."
    },
    {
      "q": "Force to give 3 kg an acceleration of 2 m s$^{-2}$?",
      "opts": [
        "$1.5$ N",
        "$5$ N",
        "$6$ N",
        "$2/3$ N"
      ],
      "ans": 2,
      "why": "$F=ma=6$ N."
    },
    {
      "q": "If $F=0$ then $a=$?",
      "opts": [
        "$g$",
        "$0$",
        "$m$",
        "max"
      ],
      "ans": 1,
      "why": "No resultant force, no acceleration."
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
    },
    {
      "q": "A resultant force of 24 N acts on a 4 kg object. Find its acceleration.",
      "marks": 2,
      "ms": [
        "$a=\\dfrac{F}{m}=\\dfrac{24}{4}$. (1)",
        "$=6$ m s$^{-2}$. (1)"
      ]
    },
    {
      "q": "A 1200 kg car experiences a driving force of 4000 N and a resistance of 1000 N. (a) Find the resultant force. (b) Find the acceleration. (c) Find the time to reach 15 m s$^{-1}$ from rest.",
      "marks": 6,
      "ms": [
        "(a) Resultant $=4000-1000=3000$ N. (1)",
        "(b) $a=\\dfrac{3000}{1200}$. (1)",
        "$=2.5$ m s$^{-2}$. (1)",
        "(c) $v=u+at\\Rightarrow15=0+2.5t$. (1)",
        "$t=\\dfrac{15}{2.5}$. (1)",
        "$=6$ s. (1)"
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Weight and Gravity",
        "body": "$W = mg$, unit: Newton. $g = 9.8\\text{ m s}^{-2}$ (use $10$ only if told). Free fall: $a = g$ downward regardless of mass. $g$ is the same for all objects (Galileo). Heavier objects do not fall faster."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Object in Free Fall Has No Weight",
        "body": "Weight ($W = mg$) always acts on an object — it does not disappear in free fall. In free fall there is NO NORMAL REACTION, giving the sensation of weightlessness, but gravitational force ($mg$) still acts throughout."
      }
    }
  ],
  "flashcards": [
    [
      "Unit of Weight?",
      "Newton."
    ],
    [
      "Does $g$ depend on mass?",
      "No."
    ],
    [
      "Formula for weight?",
      "$W=mg$ ($g\\approx9.8$ m s$^{-2}$)."
    ],
    [
      "Difference between mass and weight?",
      "Mass (kg) is the amount of matter; weight (N) is the gravitational force on it."
    ],
    [
      "Weight of a 10 kg mass ($g=9.8$)?",
      "$98$ N."
    ],
    [
      "Does mass change with location? Does weight?",
      "Mass stays constant; weight depends on $g$ (location)."
    ],
    [
      "Direction of weight?",
      "Vertically downward."
    ],
    [
      "What is $g$ approximately on Earth?",
      "$9.8$ m s$^{-2}$ (sometimes 9.81)."
    ]
  ],
  "quiz": [
    {
      "q": "Weight of $5\\text{kg}$?",
      "opts": [
        "$5$",
        "$49$",
        "$9.8$"
      ],
      "ans": 1,
      "why": "$5 \\times 9.8 = 49$."
    },
    {
      "q": "Weight $=$?",
      "opts": [
        "$m/g$",
        "$mg$",
        "$m+g$",
        "$ma$ only"
      ],
      "ans": 1,
      "why": "$W=mg$."
    },
    {
      "q": "A 5 kg mass weighs ($g=9.8$)...?",
      "opts": [
        "$5$ N",
        "$49$ N",
        "$9.8$ N",
        "$0.5$ N"
      ],
      "ans": 1,
      "why": "$5\\times9.8=49$ N."
    },
    {
      "q": "Mass is measured in...?",
      "opts": [
        "newtons",
        "kilograms",
        "m s$^{-2}$",
        "joules"
      ],
      "ans": 1,
      "why": "kg."
    },
    {
      "q": "Weight acts...?",
      "opts": [
        "horizontally",
        "vertically down",
        "up",
        "along the surface"
      ],
      "ans": 1,
      "why": "Toward the Earth's centre."
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
    },
    {
      "q": "Find the weight of a 25 kg object ($g=9.8$).",
      "marks": 2,
      "ms": [
        "$W=mg=25\\times9.8$. (1)",
        "$=245$ N. (1)"
      ]
    },
    {
      "q": "A 2 kg stone is dropped from rest ($g=9.8$). (a) State its weight. (b) Find its acceleration (no air resistance). (c) Find its speed after 3 s.",
      "marks": 6,
      "ms": [
        "(a) $W=mg=2\\times9.8=19.6$ N. (1)",
        "(b) Only force is weight; $a=\\dfrac{W}{m}=g$. (1)",
        "$=9.8$ m s$^{-2}$. (1)",
        "(c) $v=u+at=0+9.8(3)$. (1)",
        "$=29.4$ m s$^{-1}$. (1)",
        "(downward). (1)"
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Newton's Third Law Pairs",
        "body": "N3L pair: equal magnitude, opposite direction, same TYPE of force, act on DIFFERENT bodies. Examples: Earth pulls ball (gravity) ↔ ball pulls Earth (gravity). Connected particles: tension $T$ same throughout a light inextensible string over a smooth pulley."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Normal Reaction and Weight are N3L Pair",
        "body": "Normal reaction ($R$) and weight ($W = mg$) are NOT a Newton's 3rd Law pair — they act on the SAME body. N3L partner of weight (Earth pulling object) is the object pulling Earth. N3L partner of $R$ is the object pushing down on the surface."
      }
    }
  ],
  "flashcards": [
    [
      "State N3L.",
      "Equal magnitude, opposite direction, same type, different bodies."
    ],
    [
      "Smooth pulley implies?",
      "Same tension on both sides."
    ],
    [
      "State Newton's third law.",
      "Every action has an equal and opposite reaction (forces act in pairs on different bodies)."
    ],
    [
      "Do action-reaction forces act on the same body?",
      "No — on two different bodies, so they don't cancel."
    ],
    [
      "Give an example of a third-law pair.",
      "A book pushes down on a table; the table pushes up on the book."
    ],
    [
      "Are action-reaction forces equal in magnitude?",
      "Yes, equal and opposite."
    ],
    [
      "Why don't third-law pairs cancel out?",
      "They act on different objects."
    ],
    [
      "When you walk, what propels you forward?",
      "The ground's reaction to the backward push of your foot."
    ]
  ],
  "quiz": [
    {
      "q": "Partner of 'Earth pulls moon'?",
      "opts": [
        "Moon pulls Earth",
        "Gravity",
        "Centripetal"
      ],
      "ans": 0,
      "why": "Swap bodies."
    },
    {
      "q": "Newton's third-law forces are...?",
      "opts": [
        "unequal",
        "equal and opposite, on different bodies",
        "on the same body",
        "always zero"
      ],
      "ans": 1,
      "why": "Equal/opposite pair on two bodies."
    },
    {
      "q": "A rocket moves forward by ejecting gas backward. This is...?",
      "opts": [
        "first law",
        "second law",
        "third law",
        "friction"
      ],
      "ans": 2,
      "why": "Action-reaction."
    },
    {
      "q": "Action-reaction pairs do NOT cancel because they act on...?",
      "opts": [
        "the same body",
        "different bodies",
        "nothing",
        "the ground"
      ],
      "ans": 1,
      "why": "Different objects."
    },
    {
      "q": "If A pushes B with 10 N, B pushes A with...?",
      "opts": [
        "0 N",
        "5 N",
        "10 N",
        "20 N"
      ],
      "ans": 2,
      "why": "Equal and opposite."
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
    },
    {
      "q": "A swimmer pushes back on the water. State the reaction force and its effect.",
      "marks": 2,
      "ms": [
        "The water pushes the swimmer forward with an equal and opposite force. (1)",
        "This propels the swimmer through the water. (1)"
      ]
    },
    {
      "q": "A 50 kg box sits on the floor. (a) Identify the Newton's third-law pair to the box's weight. (b) Explain why this pair does not balance the weight in the box's equilibrium. (c) Name the force that balances the weight.",
      "marks": 6,
      "ms": [
        "(a) The box's weight is the Earth pulling the box; the pair is the box pulling the Earth up. (1)",
        "These are equal and opposite. (1)",
        "(b) The pair acts on the EARTH, not on the box. (1)",
        "So it cannot balance forces on the box. (1)",
        "(c) The normal reaction from the floor balances the box's weight. (1)",
        "Reaction and weight act on the box and are equal (equilibrium). (1)"
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Finding Resultant Force",
        "body": "Resultant = vector sum of all forces. For two perpendicular forces: $|R| = \\sqrt{P^2 + Q^2}$, direction $\\theta = \\arctan(Q/P)$. Resolve into components, sum each axis separately, then combine."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Resultant = Sum of Magnitudes",
        "body": "Resultant magnitude equals the sum of individual magnitudes ONLY if all forces point in the same direction. For forces at an angle, use vector addition (components or cosine rule). Two $5\\text{ N}$ forces at $90°$ give resultant $\\approx 7.07\\text{ N}$, not $10\\text{ N}$."
      }
    }
  ],
  "flashcards": [
    [
      "How to find resultant of $P, Q$ at $90^\\circ$?",
      "$\\sqrt{P^2 + Q^2}$."
    ],
    [
      "What is a resultant force?",
      "The single force equivalent to the vector sum of all forces."
    ],
    [
      "How do you add perpendicular forces?",
      "Use Pythagoras for magnitude and trig for direction."
    ],
    [
      "What is the condition for equilibrium with forces?",
      "The resultant (vector sum) is zero — components balance in each direction."
    ],
    [
      "How do you resolve a force at angle $\\theta$?",
      "Horizontal $F\\cos\\theta$, vertical $F\\sin\\theta$."
    ],
    [
      "Resultant of perpendicular forces 3 N and 4 N?",
      "$\\sqrt{3^2+4^2}=5$ N."
    ],
    [
      "For equilibrium, the sum of horizontal components equals...?",
      "Zero (and likewise vertical)."
    ],
    [
      "What does it mean to resolve a force?",
      "To split it into perpendicular (e.g. horizontal and vertical) components."
    ]
  ],
  "quiz": [
    {
      "q": "$4\\text{kg}, 20\\text{N}$ push, $4\\text{N}$ resistance. $a = ?$",
      "opts": [
        "$4$",
        "$5$",
        "$6$"
      ],
      "ans": 0,
      "why": "$(20-4)/4 = 4$."
    },
    {
      "q": "Resultant of 3 N east and 4 N north?",
      "opts": [
        "$7$ N",
        "$5$ N",
        "$1$ N",
        "$12$ N"
      ],
      "ans": 1,
      "why": "$\\sqrt{9+16}=5$."
    },
    {
      "q": "For equilibrium, the resultant force is...?",
      "opts": [
        "maximum",
        "zero",
        "weight",
        "the largest force"
      ],
      "ans": 1,
      "why": "Vector sum zero."
    },
    {
      "q": "Horizontal component of force $F$ at angle $\\theta$ to horizontal?",
      "opts": [
        "$F\\sin\\theta$",
        "$F\\cos\\theta$",
        "$F\\tan\\theta$",
        "$F$"
      ],
      "ans": 1,
      "why": "$F\\cos\\theta$."
    },
    {
      "q": "Two equal and opposite forces give a resultant of...?",
      "opts": [
        "double",
        "zero",
        "half",
        "maximum"
      ],
      "ans": 1,
      "why": "They cancel."
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
    },
    {
      "q": "Forces of 6 N east and 8 N north act on a point. Find the magnitude of the resultant.",
      "marks": 3,
      "ms": [
        "Perpendicular forces: use Pythagoras. (1)",
        "$R=\\sqrt{6^2+8^2}=\\sqrt{100}$. (1)",
        "$=10$ N. (1)"
      ]
    },
    {
      "q": "A particle is in equilibrium under three forces: $5$ N east, $P$ N west, and $Q$ N at $90^\\circ$ (north). Given the system balances, with a fourth force of $5$ N west already opposing the east force, find $P$ and explain the role of $Q$.",
      "marks": 6,
      "ms": [
        "Resolve horizontally: east forces = west forces. (1)",
        "$5=P$ (the 5 N east is balanced). (1)",
        "So $P=5$ N. (1)",
        "Resolve vertically: $Q$ must be balanced by an equal opposite vertical force. (1)",
        "For equilibrium the vertical components must also sum to zero. (1)",
        "So $Q$ requires an equal and opposite vertical force ($Q$ alone would break equilibrium). (1)"
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Friction Model",
        "body": "$F \\le \\mu R$. Limiting (about to slip or moving): $F = \\mu R$. Find $R$ from perpendicular equilibrium first. Friction OPPOSES motion (or tendency of motion). $\\mu$ has no units."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Friction Always Equals $\\mu R$",
        "body": "Friction is $F = \\mu R$ ONLY at the limiting case (on the point of sliding, or already moving). When stationary and not at the limit, friction is whatever value is needed for equilibrium — which may be less than $\\mu R$."
      }
    }
  ],
  "flashcards": [
    [
      "Limiting friction formula?",
      "$F = \\mu R$."
    ],
    [
      "Direction of friction?",
      "Opposite to potential motion."
    ],
    [
      "State the friction model.",
      "$F\\le\\mu R$, where $\\mu$ is the coefficient of friction and $R$ the normal reaction."
    ],
    [
      "When is friction at its maximum?",
      "When the object is on the point of sliding (limiting equilibrium): $F=\\mu R$."
    ],
    [
      "What does a larger $\\mu$ mean?",
      "Rougher contact — more friction available."
    ],
    [
      "Direction of friction?",
      "Opposes (relative) motion or tendency to move."
    ],
    [
      "Maximum friction for $\\mu=0.4$, $R=20$ N?",
      "$F_{max}=\\mu R=8$ N."
    ],
    [
      "Can friction exceed $\\mu R$?",
      "No — $\\mu R$ is the maximum available."
    ]
  ],
  "quiz": [
    {
      "q": "$\\mu=0.4, R=50$. Max friction?",
      "opts": [
        "$20$",
        "$125$",
        "$50$"
      ],
      "ans": 0,
      "why": "$0.4 \\times 50 = 20$."
    },
    {
      "q": "The maximum friction force is...?",
      "opts": [
        "$R/\\mu$",
        "$\\mu R$",
        "$\\mu+R$",
        "$\\mu R^2$"
      ],
      "ans": 1,
      "why": "$F_{max}=\\mu R$."
    },
    {
      "q": "Friction acts...?",
      "opts": [
        "along motion",
        "opposing motion/tendency",
        "perpendicular to surface",
        "downward"
      ],
      "ans": 1,
      "why": "It resists sliding."
    },
    {
      "q": "Limiting equilibrium is when...?",
      "opts": [
        "$F=0$",
        "$F=\\mu R$ (about to slide)",
        "$R=0$",
        "$\\mu=0$"
      ],
      "ans": 1,
      "why": "Friction is at maximum."
    },
    {
      "q": "$\\mu=0.5$, $R=30$ N. Max friction?",
      "opts": [
        "$15$ N",
        "$60$ N",
        "$30.5$ N",
        "$0.5$ N"
      ],
      "ans": 0,
      "why": "$0.5\\times30=15$ N."
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
    },
    {
      "q": "A block on a horizontal surface has $\\mu=0.3$ and normal reaction $R=50$ N. Find the maximum friction force.",
      "marks": 2,
      "ms": [
        "$F_{max}=\\mu R=0.3\\times50$. (1)",
        "$=15$ N. (1)"
      ]
    },
    {
      "q": "A 4 kg block ($g=9.8$) on a rough horizontal floor has $\\mu=0.25$. A horizontal force $P$ is applied. (a) Find the normal reaction. (b) Find the maximum friction. (c) Determine whether the block moves when $P=12$ N, and if so its acceleration.",
      "marks": 6,
      "ms": [
        "(a) $R=mg=4\\times9.8=39.2$ N. (1)",
        "(b) $F_{max}=\\mu R=0.25\\times39.2=9.8$ N. (1)",
        "(c) $P=12$ N $>9.8$ N, so the block moves. (1)",
        "Resultant $=P-F_{max}=12-9.8=2.2$ N. (1)",
        "$a=\\dfrac{2.2}{4}$. (1)",
        "$=0.55$ m s$^{-2}$. (1)"
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
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Principle of Moments",
        "body": "Moment $= F \\times d_{\\perp}$ (perpendicular distance), unit Nm. Equilibrium: CW moments $=$ ACW moments about ANY chosen point. Choose pivot at an unknown force to eliminate it from the equation. Weight of uniform rod acts at midpoint."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Can Only Take Moments About a Support",
        "body": "You can take moments about ANY point on (or off) the beam — not just supports. Taking moments about a point where an unknown force acts eliminates that unknown, making it the strategic pivot choice. There is no restriction to supports or pivots."
      }
    }
  ],
  "flashcards": [
    [
      "Moment formula?",
      "$F \\times d_{\\perp}$."
    ],
    [
      "Reaction at support B if tilting about A?",
      "Zero."
    ],
    [
      "Define the moment of a force.",
      "Force $\\times$ perpendicular distance from the pivot."
    ],
    [
      "Units of a moment?",
      "Newton-metres (N m)."
    ],
    [
      "Condition for a body in equilibrium (rotation)?",
      "Total clockwise moments = total anticlockwise moments."
    ],
    [
      "What is the principle of moments?",
      "For equilibrium, sum of clockwise moments about any point = sum of anticlockwise moments."
    ],
    [
      "Moment of a 10 N force at 0.5 m from a pivot?",
      "$10\\times0.5=5$ N m."
    ],
    [
      "What happens if moments are unbalanced?",
      "The body rotates (turns) about the pivot."
    ]
  ],
  "quiz": [
    {
      "q": "$20\\text{N}$ at $3\\text{m}$ at $90^\\circ$. Moment?",
      "opts": [
        "$60$",
        "$6.6$",
        "$23$"
      ],
      "ans": 0,
      "why": "$20 \\times 3 = 60$."
    },
    {
      "q": "Moment $=$?",
      "opts": [
        "force $+$ distance",
        "force $\\times$ perpendicular distance",
        "force $/$ distance",
        "mass $\\times$ distance"
      ],
      "ans": 1,
      "why": "Definition of a moment."
    },
    {
      "q": "Units of a moment?",
      "opts": [
        "N",
        "N m",
        "m",
        "kg"
      ],
      "ans": 1,
      "why": "Newton-metres."
    },
    {
      "q": "For equilibrium, clockwise moments equal...?",
      "opts": [
        "zero",
        "anticlockwise moments",
        "the weight",
        "the reaction"
      ],
      "ans": 1,
      "why": "Principle of moments."
    },
    {
      "q": "A 20 N force at 0.4 m has moment...?",
      "opts": [
        "$8$ N m",
        "$50$ N m",
        "$20.4$ N m",
        "$0.4$ N m"
      ],
      "ans": 0,
      "why": "$20\\times0.4=8$."
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
    },
    {
      "q": "A force of 15 N acts at a perpendicular distance of 0.6 m from a pivot. Find its moment.",
      "marks": 2,
      "ms": [
        "Moment $=$ force $\\times$ distance $=15\\times0.6$. (1)",
        "$=9$ N m. (1)"
      ]
    },
    {
      "q": "A uniform beam of length 4 m and weight 60 N rests on a pivot 1 m from the left end. A weight $W$ hangs from the left end to keep it in equilibrium. Find $W$ (take moments about the pivot; the beam's weight acts at its centre).",
      "marks": 6,
      "ms": [
        "Beam's weight 60 N acts at the centre, 2 m from the left, i.e. 1 m to the RIGHT of the pivot. (1)",
        "Clockwise moment (beam weight) $=60\\times1=60$ N m. (1)",
        "$W$ acts 1 m to the LEFT of the pivot. (1)",
        "Anticlockwise moment $=W\\times1$. (1)",
        "Equilibrium: $W\\times1=60$. (1)",
        "$W=60$ N. (1)"
      ]
    }
  ]
};

})(window.KOS_CONTENT);
