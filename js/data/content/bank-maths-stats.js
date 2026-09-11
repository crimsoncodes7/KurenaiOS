/* KurenaiOS — Edexcel Maths Statistics question bank (S1–S5).
 * Modelled on the Topic Practice compilation (8MA0/9MA0 Paper 3 Section A).
 * Numbers and contexts are re-written; `src` names the paper each item is modelled on.
 * Loaded after maths-applied.js; extends the base leaves via KOS.content.extend. */
(function (X) {
"use strict";

X("maths:S1.1", {
  notes: [
    { page: "Past-paper patterns" },
    "**Sampling questions are worded, not numerical** — and the marks go to *specific* wording. \"Describe how to take a stratified sample\" needs: the strata, the **proportional** sizes (with the arithmetic), a **sampling frame** (a numbered list), and **random numbers** used *within each stratum*. \"Describe a systematic sample of 30 from 180\" needs $180 \\div 30 = 6$, a random start between 1 and 6, then every 6th. \"Why is a random sample impossible?\" — **no sampling frame** (you cannot list every fish in a lake). \"Opportunity sampling\" — the sampler takes whoever is available; it is quick and cheap but **not random and likely biased**, and a valid **non-random alternative** is quota sampling.",
    { callout: { t: "warn", h: "Large data set phrasing", body: "State the **variable** and the **outcome** in the terms of the data set: e.g. the variable is *Daily Mean Wind Direction* (qualitative — compass points), the population is *the 184 days at Hurn in 2015*, and a systematic sample of 23 takes every 8th day from a random start in the first 8 (184 ÷ 8 = 23)." } }
  ],
  flashcards: [
    ["Population vs sample?", "The population is *every* member of the group of interest; a sample is a subset chosen to make inferences about it."],
    ["What is a sampling frame?", "A list of every member of the population that can be sampled from (numbered)."],
    ["Describe simple random sampling of size $n$.", "Number every member of the population (sampling frame); generate $n$ random numbers (or use a lottery); select the matching members."],
    ["Describe systematic sampling of 30 from 180.", "$180 \\div 30 = 6$; choose a random start from 1 to 6; then take every 6th member of the sampling frame."],
    ["Describe stratified sampling.", "Split the population into strata (groups); take a simple random sample from each stratum in proportion to its size."],
    ["When is stratified random sampling impossible?", "When there is no sampling frame for the population (e.g. the fish in a lake cannot all be listed)."],
    ["Opportunity (convenience) sampling — one advantage, one disadvantage?", "Quick and cheap; but not random, so likely to be unrepresentative/biased."],
    ["Quota sampling — how does it differ from stratified?", "The population is split into groups and a quota is filled from each, but the members are chosen *non-randomly* by the interviewer."],
    ["Census — advantage and disadvantage?", "Every member is used so the result is completely accurate; but it is expensive/time-consuming and testing may destroy the items."],
    ["Stratified sample of 80 from 350 mirror carp, 250 common carp, 200 leather carp?", "$\\tfrac{350}{800} \\times 80 = 35$, $\\tfrac{250}{800} \\times 80 = 25$, $\\tfrac{200}{800} \\times 80 = 20$."]
  ],
  quiz: [
    { q: "A sample of 40 students is taken by picking the first 40 through the school gate. This is:", opts: ["simple random", "systematic", "opportunity", "stratified"], ans: 2, why: "Whoever is available." },
    { q: "Systematic sampling of 25 from 500 uses every:", opts: ["25th", "20th", "5th", "50th"], ans: 1, why: "$500 \\div 25 = 20$." },
    { q: "Stratified sampling requires:", opts: ["a random start", "strata sizes in proportion to the population", "the interviewer's judgement", "the whole population"], ans: 1, why: "Proportional random sampling from each stratum." },
    { q: "A census is inappropriate when:", opts: ["the population is small", "testing destroys the item", "a sampling frame exists", "accuracy matters"], ans: 1, why: "Destructive testing." },
    { q: "Which is a random sampling method?", opts: ["quota", "opportunity", "systematic", "judgement"], ans: 2, why: "Random start then fixed interval." },
    { q: "In the large data set, 'Daily Mean Wind Direction' is:", opts: ["continuous", "discrete quantitative", "qualitative", "a bivariate variable"], ans: 2, why: "Compass points — categories." },
    { q: "The reason a sample cannot be perfectly representative:", opts: ["sampling error / natural variation", "the sample is too small", "bias always occurs", "the frame is wrong"], ans: 0, why: "Samples vary." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2020 P2 Q4", ctx: "A fishery wants to estimate the mean length of the carp in a lake. The lake holds mirror carp, common carp and leather carp. A previous survey gave estimates of 350 mirror, 250 common and 200 leather carp.",
      parts: [
        { q: "Explain why a stratified random sample of the carp in the lake cannot be taken.", marks: 1, ms: ["B1: there is no sampling frame — the fish in the lake cannot all be listed/numbered"] },
        { q: "Instead, 80 carp are caught from the lake by net. Describe how the manager could use the previous survey to decide how many of each type to record for a sample that reflects the population.", marks: 3, ms: ["M1: proportion of each type: $\\tfrac{350}{800}$, $\\tfrac{250}{800}$, $\\tfrac{200}{800}$", "A1: 35 mirror, 25 common, 20 leather", "B1: within each type select randomly (e.g. random numbers / release extras) — this is quota sampling since a frame is unavailable"] }
      ] },
    { src: "Edexcel 2025 P3 Q4", ctx: "Oliver is investigating the Daily Maximum Gust at Camborne in 2015 using the large data set. He takes a systematic sample of 23 days from the 184 days of data.",
      parts: [
        { q: "Describe how Oliver could take his systematic sample.", marks: 2, ms: ["B1: $184 \\div 23 = 8$; use random numbers to pick a start day between 1 and 8", "B1: then select every 8th day from the list"] },
        { q: "Some of the sampled days show 'n/a' for Daily Maximum Gust. State what Oliver should do and why.", marks: 1, ms: ["B1: remove those days (data cleaning) since no value was recorded — or re-sample to keep 23 days"] },
        { q: "Explain why the systematic sample might not be representative of the whole year.", marks: 1, ms: ["B1: the large data set only covers May–October, so winter gusts are not represented / seasonal variation is missed"] }
      ] },
    { src: "Edexcel 2018 P3 Q4", ctx: "A researcher wants to investigate the time spent on homework by the 1200 students in a school. She stands at the school entrance and asks the first 60 students who arrive.",
      parts: [
        { q: "Name this sampling method and give one reason it may be unreliable.", marks: 2, ms: ["B1: opportunity (convenience) sampling", "B1: not random — early arrivals may differ (e.g. more conscientious), so the sample is likely biased"] },
        { q: "Suggest a non-random alternative that would be more representative.", marks: 1, ms: ["B1: quota sampling — fixed numbers from each year group / gender"] },
        { q: "Describe how she could instead take a simple random sample of 60 students.", marks: 3, ms: ["B1: obtain a list of all 1200 students (sampling frame) and number them 1–1200", "B1: generate 60 different random numbers (calculator/random number table)", "B1: select the students whose numbers were generated; ignore repeats"] }
      ] },
    { level: "AS", src: "Edexcel AS Nov 2021 P2 Q3", q: "Kuldeep takes a systematic sample of 23 days from the Hurn 2015 data in the large data set, recording the Daily Mean Wind Direction for each day. State the variable, whether it is qualitative or quantitative, and describe one possible outcome.", marks: 3,
      ms: ["B1: variable is Daily Mean Wind Direction", "B1: qualitative (categorical) — recorded as compass points", "B1: an outcome such as 'W' / 'SW' / 'NE' (a compass direction, not a number)"] }
  ]
});

X("maths:S2.1", {
  notes: [
    { page: "Past-paper patterns" },
    "**Histograms**: frequency density $= \\dfrac{\\text{frequency}}{\\text{class width}}$ and **area $\\propto$ frequency**. The recurring trap (Specimen Q1, AS 2024 Q3) is a histogram drawn with *cm*, where one bar's frequency tells you the scale: e.g. a bar 2 cm wide and 3 cm high represents 24 items $\\Rightarrow$ 6 cm² per 24 items $\\Rightarrow$ 1 cm² $= 4$ items. **Estimating a proportion** (AS 2020 Q1 \"under 11 minutes\") assumes values are *uniformly spread within a class* — take the fraction of the class width.",
    "**Box plots** (AS 2024 Q1, Oct 2020 Q3): five figures — min, $Q_1$, median, $Q_3$, max — plus outliers marked with crosses and the whisker drawn to the **largest non-outlier**. The outlier fence is $Q_1 - 1.5\\,\\text{IQR}$ and $Q_3 + 1.5\\,\\text{IQR}$ unless the question gives another rule. Comparing two box plots: compare a **location** (median) and a **spread** (IQR or range) *in context*, and mention skew if asked.",
    { callout: { t: "mnemonic", h: "Skew from a box plot", body: "Positive skew: median closer to $Q_1$, long right whisker. Negative skew: median closer to $Q_3$. A hospital stay / waiting time / rainfall is usually positively skewed, which is one reason a **normal model is unsuitable** (2023 Q6)." } }
  ],
  flashcards: [
    ["Frequency density formula?", "$\\text{fd} = \\dfrac{\\text{frequency}}{\\text{class width}}$."],
    ["A histogram bar for class $10 \\le x < 20$ is 2 cm wide and 3 cm tall and represents 24 items. What area is 1 item?", "$6 \\text{ cm}^2 = 24$ items, so 1 item $= 0.25$ cm²."],
    ["Same scale: class $20 \\le x < 25$ has frequency 30. Width and height of its bar?", "Width $= 1$ cm (5 units at 2 cm per 10). Area $= 30 \\times 0.25 = 7.5$ cm² so height $= 7.5$ cm."],
    ["Estimate the number under 11 minutes when the class $10\\text{–}15$ has frequency 20.", "Assume uniform spread: $\\tfrac{1}{5} \\times 20 = 4$ (plus every lower class)."],
    ["Five values a box plot shows?", "Minimum (or lowest non-outlier), $Q_1$, median, $Q_3$, maximum (or highest non-outlier); outliers as crosses."],
    ["Outlier fences with $Q_1 = 8$, $Q_3 = 17$?", "IQR $= 9$; fences $8 - 13.5 = -5.5$ and $17 + 13.5 = 30.5$."],
    ["How do you compare two box plots for a mark scheme?", "One comparison of location (median), one of spread (IQR/range), both in context."],
    ["Cumulative frequency graph: how do you read the median for $n = 80$?", "Read across from cumulative frequency 40 to the curve, then down."],
    ["Why might a histogram show a normal model is unsuitable?", "The distribution is skewed (not symmetric) or has a tail/cut-off."],
    ["Why must class boundaries be used for continuous data?", "E.g. '10–19' recorded to the nearest unit has boundaries 9.5 and 19.5 — the width is 10, not 9."]
  ],
  quiz: [
    { q: "Frequency density for class $30 \\le x < 50$ with frequency 8:", opts: ["0.4", "160", "2.5", "8"], ans: 0, why: "$8 \\div 20$." },
    { q: "In a histogram, frequency is proportional to:", opts: ["height", "width", "area", "the number of bars"], ans: 2, why: "Area." },
    { q: "Median position from a cumulative frequency curve with $n = 120$:", opts: ["60", "61", "30", "120"], ans: 0, why: "$n/2$ on the axis." },
    { q: "In a box plot, the box shows:", opts: ["min to max", "$Q_1$ to $Q_3$", "mean $\\pm$ sd", "the range"], ans: 1, why: "The middle 50%." },
    { q: "A box plot with the median close to $Q_3$ shows:", opts: ["positive skew", "negative skew", "no skew", "an outlier"], ans: 1, why: "Longer lower half." },
    { q: "Estimating a proportion within a histogram class assumes:", opts: ["a normal shape", "values evenly spread in the class", "the class is the mode", "nothing"], ans: 1, why: "Linear assumption." },
    { q: "'Ages 20–29' (whole years) has class width:", opts: ["9", "10", "9.5", "29"], ans: 1, why: "Boundaries 20 and 30." }
  ],
  exam: [
    { src: "Edexcel Specimen P3 Q1", ctx: "A histogram shows the lengths (mm) of 200 leaves. The bar for $10 \\le l < 20$ is 2 cm wide and 3 cm high and represents 24 leaves.",
      parts: [
        { q: "Find the area, in cm², that represents one leaf.", marks: 2, ms: ["M1: $2 \\times 3 = 6$ cm² represents 24 leaves", "A1: $0.25$ cm² per leaf"] },
        { q: "The class $20 \\le l < 25$ has frequency 30. Find the width and height of its bar.", marks: 3, ms: ["B1: width $= 1$ cm", "M1: area $= 30 \\times 0.25 = 7.5$ cm²", "A1: height $= 7.5$ cm"] },
        { q: "Estimate the number of leaves with length between 15 mm and 22 mm.", marks: 2, ms: ["M1: $\\tfrac{5}{10} \\times 24 + \\tfrac{2}{5} \\times 30$", "A1: $12 + 12 = 24$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2020 P2 Q1", ctx: "The times, $t$ minutes, taken by 50 people to complete a crossword are summarised: $0 \\le t < 5$: 6, $5 \\le t < 10$: 14, $10 \\le t < 15$: 20, $15 \\le t < 25$: 10.",
      parts: [
        { q: "Draw a histogram to represent the data — state the frequency densities you would use.", marks: 2, ms: ["M1: fd $= f \\div$ width", "A1: $1.2, 2.8, 4, 1$"] },
        { q: "Estimate the percentage of people who took less than 11 minutes.", marks: 2, ms: ["M1: $6 + 14 + \\tfrac15 \\times 20 = 24$", "A1: $48\\%$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2024 P2 Q1", ctx: "The daily total rainfall (mm) at a weather station over 30 days had: minimum 0.2, lower quartile 1.8, median 4.1, upper quartile 7.4, maximum 21.5. An outlier is any value more than $1.5 \\times$ IQR above $Q_3$ or below $Q_1$. The largest non-outlier value was 15.6.",
      parts: [
        { q: "Show that 21.5 is an outlier.", marks: 2, ms: ["M1: $7.4 + 1.5 \\times 5.6 = 15.8$", "A1: $21.5 > 15.8$ so it is an outlier (lower fence $-6.6$: none below)"] },
        { q: "Draw a box plot for the data.", marks: 3, ms: ["B1: box $1.8$, $4.1$, $7.4$ with the median inside", "B1: whiskers from 0.2 to 15.6", "B1: outlier marked at 21.5 with a cross"] },
        { q: "Describe the skewness of the distribution and interpret it.", marks: 2, ms: ["B1: positive skew ($Q_3 - Q_2 = 3.3 > Q_2 - Q_1 = 2.3$; long upper whisker)", "B1: most days have little rain with a few very wet days"] }
      ] },
    { src: "Edexcel 2023 P3 Q6", ctx: "A histogram summarises the time, $h$ hours, that 160 patients spent in a hospital department: $0 \\le h < 2$: 24, $2 \\le h < 3$: 40, $3 \\le h < 4$: 46, $4 \\le h < 6$: 36, $6 \\le h < 10$: 14.",
      parts: [
        { q: "Estimate the probability that a randomly chosen patient spent more than 5 hours in the department.", marks: 2, ms: ["M1: $\\tfrac12 \\times 36 + 14 = 32$", "A1: $\\tfrac{32}{160} = 0.2$"] },
        { q: "Estimate the mean time.", marks: 2, ms: ["M1: $\\sum fx = 24 + 100 + 161 + 180 + 112 = 577$", "A1: $577 \\div 160 = 3.61$ hours"] },
        { q: "A manager suggests modelling $h$ with a normal distribution with mean 3.6 and standard deviation 1.8. Give two reasons why this model is not suitable.", marks: 2, ms: ["B1: the histogram is positively skewed, the normal is symmetric", "B1: the normal model would give a non-zero probability of negative times ($3.6 - 2 \\times 1.8 = 0$ is only 2 sd below the mean)"] }
      ] }
  ]
});

X("maths:S2.2", {
  notes: [
    { page: "Past-paper patterns" },
    "**Interpret the gradient** in the units of the question: $p = 22 - 1.1t$ means *each extra unit of $t$ reduces $p$ by 1.1 units*. **Interpret the intercept** only if $x = 0$ is meaningful. **Extrapolation** (predicting outside the data range) is **unreliable** — say so with the range. **Correlation ≠ causation**: a comment such as \"longer names cause better marks\" is not justified by correlation. A regression line of $y$ on $x$ is only for predicting $y$ from $x$, and only when $x$ is the *independent* (controlled) variable.",
    "**Log coding** (2022 Q6): $\\log_{10} y = a + bx$ becomes $y = 10^a \\times (10^b)^x$ — an exponential model; a linear relationship between $\\log y$ and $x$ shows exponential growth/decay. Quote the PMCC of the *coded* data to justify the linear fit.",
    { callout: { t: "warn", h: "Describe the correlation", body: "Three words: **strength**, **direction**, **context** — \"strong negative correlation between pressure and rainfall\". Then, if asked for a large-data-set variable, name one exactly (Daily Mean Temperature, Daily Total Rainfall, Daily Mean Pressure, Daily Mean Windspeed, Daily Maximum Gust, Daily Total Sunshine, Daily Mean Visibility, Daily Maximum Relative Humidity, Daily Mean Cloud Cover)." } }
  ],
  flashcards: [
    ["Interpret the gradient of $p = 22 - 1.1t$ (price £, $t$ years old).", "For each additional year of age the price falls by £1.10 (per year)… i.e. £1100 if in thousands — always quote the units."],
    ["Why is using $p = 22 - 1.1t$ at $t = 30$ unreliable when the data has $2 \\le t \\le 12$?", "It is extrapolation outside the range of the data — the linear model may not hold."],
    ["Regression line of $y$ on $x$ — what can it predict?", "$y$ from a given $x$ (the independent variable), not $x$ from $y$."],
    ["Describe the correlation shown by points falling steeply from top-left to bottom-right.", "Strong negative correlation."],
    ["Correlation vs causation?", "Correlation shows an association; it does not show that one variable causes the other (a third factor may be involved)."],
    ["$\\log_{10} y = 0.2x + 1.5$. Write $y$ in the form $ab^x$.", "$y = 10^{1.5} \\times (10^{0.2})^x = 31.6 \\times 1.58^x$."],
    ["What does a linear relationship between $\\log y$ and $x$ tell you?", "$y$ grows or decays exponentially in $x$."],
    ["Why might a linear regression line be unsuitable for a scatter diagram?", "The points show a curved (non-linear) pattern, or an outlier distorts the fit."],
    ["PMCC of $-0.03$ — what does it show?", "Almost no linear correlation."],
    ["Which large-data-set variable is on the horizontal axis of a rainfall-vs-pressure scatter diagram?", "Daily Mean Pressure (hPa)."]
  ],
  quiz: [
    { q: "$y = 3.2 + 0.8x$: the gradient means", opts: ["$y$ is 3.2 when $x = 0$", "each unit increase in $x$ increases $y$ by 0.8", "$x$ causes $y$", "the correlation is 0.8"], ans: 1, why: "Rate of change." },
    { q: "Predicting at $x = 50$ when data cover $5 \\le x \\le 20$ is:", opts: ["interpolation", "extrapolation — unreliable", "valid", "impossible"], ans: 1, why: "Outside the range." },
    { q: "PMCC $= 0.95$ shows:", opts: ["strong positive linear correlation", "weak correlation", "causation", "no correlation"], ans: 0, why: "Close to 1." },
    { q: "The independent variable in 'sales against advertising spend' is:", opts: ["sales", "advertising spend", "either", "neither"], ans: 1, why: "Spend is controlled." },
    { q: "$\\log y = a + bx$ gives $y =$", opts: ["$a + bx$", "$10^a \\cdot 10^{bx}$", "$ax^b$", "$e^{a} x^b$"], ans: 1, why: "Exponential model." },
    { q: "$\\log y = a + b\\log x$ gives $y =$", opts: ["$10^a x^b$", "$ab^x$", "$a + bx$", "$b\\cdot 10^{ax}$"], ans: 0, why: "Power model." },
    { q: "'Ice-cream sales and drownings are correlated' is best explained by:", opts: ["ice cream causes drowning", "a third variable (hot weather)", "sampling error", "extrapolation"], ans: 1, why: "Confounding." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2022 P2 Q1", ctx: "A garage records the age, $t$ years, and price, $p$ thousand pounds, of 12 second-hand cars of one model, with $2 \\le t \\le 9$. The regression line is $p = 22 - 1.1t$.",
      parts: [
        { q: "Describe the correlation between $t$ and $p$.", marks: 1, ms: ["B1: negative (strong) correlation — older cars cost less"] },
        { q: "Give an interpretation of the gradient, stating its units.", marks: 2, ms: ["B1: the price falls by 1.1 thousand pounds", "B1: for each extra year of age — units £1000 per year"] },
        { q: "Comment on the reliability of using the line to estimate the price of a 20-year-old car.", marks: 2, ms: ["B1: unreliable — $t = 20$ is outside the data range (extrapolation)", "B1: the line gives $p = 0$ which is not sensible"] }
      ] },
    { src: "Edexcel 2022 P3 Q6", ctx: "The number of bacteria $N$ in a culture after $t$ hours was recorded and the data coded with $y = \\log_{10} N$. The regression line of $y$ on $t$ is $y = 2.10 + 0.155t$ and the PMCC between $y$ and $t$ is 0.994.",
      parts: [
        { q: "Explain what the value of the PMCC tells you about the relationship between $t$ and $N$.", marks: 2, ms: ["B1: almost perfect positive linear correlation between $t$ and $\\log N$", "B1: so $N$ grows exponentially with $t$"] },
        { q: "Show that the model can be written $N = ab^t$, giving $a$ and $b$ to 3 significant figures.", marks: 3, ms: ["M1: $N = 10^{2.10 + 0.155t}$", "A1: $a = 10^{2.10} = 126$", "A1: $b = 10^{0.155} = 1.43$"] },
        { q: "Interpret the value of $b$ in context.", marks: 1, ms: ["B1: the number of bacteria increases by 43% every hour"] }
      ] },
    { src: "Edexcel Oct 2021 P3 Q2", ctx: "A student collected the lengths (letters) of 30 people's first names and their scores in a memory test, and drew a scatter diagram showing a weak positive correlation. He concludes that people with longer names have better memories.",
      parts: [
        { q: "Comment on this conclusion.", marks: 2, ms: ["B1: correlation does not imply causation", "B1: the correlation is weak / 30 people is a small sample / other factors (age) affect memory"] },
        { q: "The student proposes fitting a regression line of score on name length. Explain why this may not be appropriate.", marks: 1, ms: ["B1: the correlation is weak so a linear model explains little; name length is not a controlled independent variable"] }
      ] },
    { src: "Edexcel Oct 2020 P3 Q2", q: "A scatter diagram from the large data set shows Daily Mean Temperature (°C) against Daily Total Sunshine (hours) for Leeming, May–October 2015. The points rise from bottom-left to top-right with moderate scatter. Describe the correlation, and state, with a reason, which of the two variables should be treated as the independent variable when fitting a regression line.", marks: 3,
      ms: ["B1: moderate positive correlation — sunnier days tend to be warmer", "B1: Daily Total Sunshine as the independent variable", "B1: because sunshine drives temperature (sunshine is the explanatory variable), so temperature is predicted from it"] }
  ]
});

X("maths:S2.3", {
  notes: [
    { page: "Past-paper patterns" },
    "**Mean and standard deviation from sums** appear every year: $\\bar x = \\dfrac{\\sum x}{n}$ and $\\sigma = \\sqrt{\\dfrac{\\sum x^2}{n} - \\bar x^2}$ (the mark scheme also accepts the $n - 1$ version — *say which you used*). With a **frequency table** use $\\sum fx$ and $\\sum fx^2$ with midpoints. **Coding** $y = \\dfrac{x - a}{b}$: $\\bar x = a + b\\bar y$ and $\\sigma_x = b\\,\\sigma_y$ — subtracting a constant does not change the spread (AS 2023 Q1 \"effect of subtracting 5 g\").",
    "**Linear interpolation** for a median or quartile: position $\\tfrac n2$ (Edexcel convention for grouped data), find the class, then $\\text{lower bound} + \\dfrac{\\text{position} - \\text{cf before}}{\\text{class frequency}} \\times \\text{class width}$. Show the fraction — that is the method mark.",
    { callout: { t: "tip", h: "Comparing two data sets", body: "Two sentences: one comparing a **location** (mean/median), one comparing a **spread** (sd/IQR), each *in context*: \"Coach B's runners have a lower mean time so are faster on average; their sd is larger so their times are more variable.\"" } }
  ],
  flashcards: [
    ["Standard deviation from $\\sum x$ and $\\sum x^2$?", "$\\sigma = \\sqrt{\\dfrac{\\sum x^2}{n} - \\left(\\dfrac{\\sum x}{n}\\right)^2}$."],
    ["$n = 12$, $\\sum x = 780$, $\\sum x^2 = 50850$. Mean and sd?", "$\\bar x = 65$; $\\sigma^2 = 4237.5 - 4225 = 12.5$; $\\sigma = 3.54$."],
    ["Coding $y = x - 1010$: $\\bar y = 3.2$, $\\sigma_y = 5.46$. Mean and sd of $x$?", "$\\bar x = 1013.2$, $\\sigma_x = 5.46$ (unchanged)."],
    ["Coding $y = \\dfrac{x - 20}{5}$ with $\\sigma_y = 1.4$. $\\sigma_x$?", "$5 \\times 1.4 = 7$."],
    ["Every value is reduced by 5 g. Effect on mean and sd?", "Mean decreases by 5 g; sd unchanged."],
    ["Every value is multiplied by 1.2. Effect on mean and sd?", "Both multiplied by 1.2."],
    ["Median by interpolation: $n = 60$, cf before the class $10 \\le x < 20$ is 22, class frequency 22.", "$10 + \\dfrac{30 - 22}{22} \\times 10 = 13.6$."],
    ["Grouped mean: what value represents each class?", "The midpoint of the class."],
    ["Mean vs median — when is the median preferred?", "When the data are skewed or contain outliers (the median is unaffected by extreme values)."],
    ["IQR of grouped data — which positions?", "$Q_1$ at $\\tfrac n4$, $Q_3$ at $\\tfrac{3n}{4}$ by interpolation."]
  ],
  quiz: [
    { q: "$\\sum x = 200$, $\\sum x^2 = 4300$, $n = 10$: variance $=$", opts: ["30", "430", "20", "$\\sqrt{30}$"], ans: 0, why: "$430 - 400$." },
    { q: "Adding 3 to every value changes:", opts: ["mean only", "sd only", "both", "neither"], ans: 0, why: "Shift." },
    { q: "Coding $y = 2x$ makes the sd of $y$:", opts: ["the same", "double", "half", "four times"], ans: 1, why: "Scale." },
    { q: "Median position (grouped, Edexcel) for $n = 50$:", opts: ["25", "25.5", "26", "24"], ans: 0, why: "$n/2$." },
    { q: "Estimated grouped mean uses:", opts: ["class widths", "class midpoints", "upper bounds", "frequency densities"], ans: 1, why: "Midpoints." },
    { q: "A distribution with mean > median is usually:", opts: ["negatively skewed", "positively skewed", "symmetric", "uniform"], ans: 1, why: "Tail pulls the mean up." },
    { q: "Comparing two classes' test results needs:", opts: ["mean only", "a measure of location and a measure of spread, in context", "the range only", "a histogram"], ans: 1, why: "Two comparisons." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2023 P2 Q1", ctx: "The weights, $w$ grams, of 50 plums are summarised: $20 \\le w < 30$: 5, $30 \\le w < 40$: 12, $40 \\le w < 50$: 18, $50 \\le w < 60$: 10, $60 \\le w < 80$: 5.",
      parts: [
        { q: "Show that an estimate of the mean weight is 45.1 g.", marks: 2, ms: ["M1: $\\sum fx = 125 + 420 + 810 + 550 + 350 = 2255$", "A1: $2255 \\div 50 = 45.1$"] },
        { q: "Estimate the standard deviation.", marks: 3, ms: ["M1: $\\sum fx^2 = 3125 + 14700 + 36450 + 30250 + 24500 = 109025$", "M1: $\\sqrt{\\tfrac{109025}{50} - 45.1^2}$", "A1: $\\sqrt{146.49} = 12.1$ g"] },
        { q: "Each plum is packed with a 5 g wrapper removed from its recorded weight. State the mean and standard deviation of the new weights.", marks: 2, ms: ["B1: mean $40.1$ g", "B1: sd unchanged $12.1$ g"] }
      ] },
    { src: "Edexcel Oct 2021 P3 Q3", ctx: "The Daily Mean Pressure, $p$ hPa, on 30 days at Heathrow was coded using $y = p - 1010$. The coded data give $\\sum y = 96$ and $\\sum y^2 = 1200$.",
      parts: [
        { q: "Find the mean and standard deviation of the pressure.", marks: 4, ms: ["M1: $\\bar y = 3.2$", "M1: $\\sigma_y = \\sqrt{40 - 10.24} = 5.455$", "A1: $\\bar p = 1013.2$ hPa", "A1: $\\sigma_p = 5.46$ hPa"] },
        { q: "Ali claims the standard deviation should be adjusted by 1010 as well. Explain why he is wrong.", marks: 1, ms: ["B1: subtracting a constant shifts every value equally so the spread is unchanged"] },
        { q: "State the units of $\\sum y^2$.", marks: 1, ms: ["B1: hPa²"] }
      ] },
    { src: "Edexcel 2025 P3 Q2", ctx: "Two athletics coaches record the best 400 m times (seconds) of their 12 runners each. Coach A: $\\sum x = 780$, $\\sum x^2 = 50850$. Coach B: mean 63.2 s, standard deviation 5.1 s.",
      parts: [
        { q: "Find the mean and standard deviation of Coach A's runners' times.", marks: 3, ms: ["B1: $\\bar x = 65$", "M1: $\\sqrt{\\tfrac{50850}{12} - 65^2}$", "A1: $\\sigma = 3.54$ s"] },
        { q: "Compare the two groups of runners.", marks: 2, ms: ["B1: Coach B's runners have a lower mean time so are faster on average", "B1: Coach B's times have a larger sd so are more varied/less consistent"] }
      ] },
    { level: "AS", src: "Edexcel AS 2022 P2 Q3", ctx: "The heights, $h$ cm, of 60 seedlings: $0 \\le h < 5$: 8, $5 \\le h < 10$: 14, $10 \\le h < 20$: 22, $20 \\le h < 30$: 12, $30 \\le h < 50$: 4.",
      parts: [
        { q: "Use linear interpolation to estimate the median height.", marks: 2, ms: ["M1: $10 + \\dfrac{30 - 22}{22} \\times 10$", "A1: $13.6$ cm"] },
        { q: "State an assumption made in using interpolation.", marks: 1, ms: ["B1: the heights are evenly (uniformly) spread within each class"] },
        { q: "Estimate the upper quartile.", marks: 2, ms: ["M1: position 45; $20 + \\dfrac{45 - 44}{12} \\times 10$", "A1: $20.8$ cm"] }
      ] }
  ]
});

X("maths:S2.4", {
  notes: [
    { page: "Past-paper patterns" },
    "**Two outlier rules** — use the one the question gives: *quartile* rule ($Q_1 - k \\times$ IQR, $Q_3 + k \\times$ IQR, usually $k = 1.5$) or *mean* rule ($\\bar x \\pm 2\\sigma$, sometimes $3\\sigma$). Calculate **both fences** and state which values fall outside. **Cleaning** the large data set: entries recorded as `tr` (trace, less than 0.05 mm of rain) should be **replaced by 0** (or excluded, with justification); `n/a` or `999` codes mean *not recorded* and are **removed**; a wind direction of 0 is not a direction. Always say what you did and why — the method mark is for the decision.",
    { callout: { t: "warn", h: "Remove or keep?", body: "An outlier is only removed if it is an **error** (impossible value, recording mistake). A genuine but extreme value (a storm's rainfall) is kept — say so." } }
  ],
  flashcards: [
    ["Quartile outlier rule?", "Below $Q_1 - 1.5 \\times$ IQR or above $Q_3 + 1.5 \\times$ IQR."],
    ["Mean-sd outlier rule?", "More than 2 (or 3) standard deviations from the mean: outside $\\bar x \\pm 2\\sigma$."],
    ["$\\bar x = 24.5$, $\\sigma = 6.2$: outlier limits?", "$12.1$ and $36.9$ — so 11 and 38 would be outliers."],
    ["What does `tr` mean in the rainfall column of the large data set?", "Trace — less than 0.05 mm; treat as 0 (state the decision)."],
    ["What should you do with a data entry of 999 or n/a?", "Remove it — it is a code for a missing reading, not a value."],
    ["When should an outlier be removed?", "Only when it is an error/impossible; a genuine extreme value is kept."],
    ["Why remove an outlier before calculating the mean and sd?", "They are heavily influenced by extreme values; the median and IQR are not."],
    ["Effect of removing a high outlier on mean and sd?", "Both decrease."]
  ],
  quiz: [
    { q: "$Q_1 = 15$, $Q_3 = 27$: upper fence ($1.5$ IQR):", opts: ["45", "39", "42", "33"], ans: 0, why: "$27 + 18$." },
    { q: "A 'tr' rainfall reading is best treated as:", opts: ["missing", "0", "0.05", "an outlier"], ans: 1, why: "Trace ≈ 0." },
    { q: "A Daily Total Rainfall entry of $-1$ mm should be:", opts: ["kept", "removed as an error", "set to 1", "averaged"], ans: 1, why: "Impossible." },
    { q: "Which statistic is unaffected by an outlier?", opts: ["mean", "sd", "median", "range"], ans: 2, why: "Robust." },
    { q: "Outlier rule 'more than 3 sd from the mean' with $\\bar x = 50$, $\\sigma = 4$: 63 is", opts: ["an outlier", "not an outlier", "the mean", "$Q_3$"], ans: 0, why: "$> 62$." },
    { q: "Removing a low outlier makes the mean:", opts: ["increase", "decrease", "unchanged", "zero"], ans: 0, why: "Pulls up." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2019 P2 Q4", ctx: "Jade is investigating Daily Total Rainfall (mm) at Hurn in 2015 from the large data set. Her sample of 20 days contains the values `tr` twice, and one day recorded as 25.4.",
      parts: [
        { q: "State what `tr` means and explain how Jade should treat these values.", marks: 2, ms: ["B1: trace — less than 0.05 mm of rain", "B1: replace with 0 (so the data are numerical) — or exclude, stating the choice"] },
        { q: "The other 18 values have $\\sum x = 61.2$ and $\\sum x^2 = 391.4$. Using all 20 values (with `tr` as 0), find the mean and standard deviation.", marks: 3, ms: ["M1: $\\bar x = 61.2 \\div 20 = 3.06$", "M1: $\\sigma = \\sqrt{391.4/20 - 3.06^2}$", "A1: $3.21$ mm"] },
        { q: "Using the rule 'an outlier is more than 2 standard deviations above the mean', show that 25.4 is an outlier and explain whether Jade should remove it.", marks: 3, ms: ["M1: $3.06 + 2 \\times 3.21 = 9.48$", "A1: $25.4 > 9.48$ so it is an outlier", "B1: keep it — a very wet day is a genuine value, not an error"] }
      ] },
    { src: "Edexcel 2023 P3 Q3", ctx: "A student records the Daily Mean Windspeed (knots) for 31 days at Camborne. The summary statistics are $Q_1 = 7$, $Q_2 = 10$, $Q_3 = 13$; the largest value is 24 and the smallest is 2. One day was recorded as 999.",
      parts: [
        { q: "Explain what the student should do with the value 999.", marks: 1, ms: ["B1: remove it — it is the code for a missing reading"] },
        { q: "Using the rule $Q_3 + 1.5(Q_3 - Q_1)$, determine whether 24 is an outlier.", marks: 2, ms: ["M1: $13 + 1.5 \\times 6 = 22$", "A1: $24 > 22$ so 24 is an outlier"] },
        { q: "State, with a reason, whether the median or the mean is the better measure of location for these data.", marks: 1, ms: ["B1: the median — it is not affected by the outlier"] }
      ] },
    { level: "AS", src: "Edexcel AS 2024 P2 Q2", q: "A frequency table of Daily Mean Wind Direction for Leuchars, May–October 2015, includes a category labelled 0. Explain what the entry 0 represents and how it should be handled when drawing a bar chart of the directions.", marks: 2,
      ms: ["B1: 0 is not a compass bearing; it is used when the wind was calm/no direction was recorded", "B1: exclude it from the direction categories (or show it separately as 'calm')"] }
  ]
});

X("maths:S3.1", {
  notes: [
    { page: "Past-paper patterns" },
    "Venn-diagram algebra: write each region as an unknown, then translate every given fact into an equation. **Mutually exclusive**: $P(A \\cap B) = 0$ — the circles do not overlap (or the overlap region is 0). **Independent**: $P(A \\cap B) = P(A)P(B)$ — always *test this product* when asked \"are they independent?\" and show both sides. Total $= 1$ gives the last unknown. \"Explain why they are not independent\" — quote numbers: $P(A|B) = 0.3 \\ne P(A) = 0.4$.",
    { callout: { t: "miscon", h: "Mutually exclusive ≠ independent", body: "If $A$ and $B$ are mutually exclusive with $P(A), P(B) > 0$ they **cannot** be independent: $P(A \\cap B) = 0 \\ne P(A)P(B)$. Knowing $A$ happened tells you $B$ did not." } }
  ],
  flashcards: [
    ["Condition for mutually exclusive events?", "$P(A \\cap B) = 0$; then $P(A \\cup B) = P(A) + P(B)$."],
    ["Condition for independent events?", "$P(A \\cap B) = P(A) \\times P(B)$, equivalently $P(A|B) = P(A)$."],
    ["Addition rule?", "$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$."],
    ["$P(A) = 0.25$, $P(C) = 0.4$, $A$ and $C$ independent: $P(A \\cap C)$?", "$0.1$."],
    ["Can mutually exclusive events (non-zero probabilities) be independent?", "No: $P(A \\cap B) = 0 \\ne P(A)P(B)$."],
    ["Test: 60 students, 24 in Art, 30 in Music, 12 in both. Independent?", "$P(A)P(M) = 0.4 \\times 0.5 = 0.2 = \\tfrac{12}{60}$ — yes."],
    ["Same club data with 15 in both — independent?", "$\\tfrac{15}{60} = 0.25 \\ne 0.2$ — not independent."],
    ["Suppliers A (40%, 3% faulty), B (35%, 5%), C (25%, 2%). $P(\\text{faulty})$?", "$0.012 + 0.0175 + 0.005 = 0.0345$."],
    ["Why are 'faulty' and 'from A' not independent there?", "$P(\\text{faulty}|A) = 0.03 \\ne P(\\text{faulty}) = 0.0345$."],
    ["$P(A') $ in terms of $P(A)$?", "$1 - P(A)$."]
  ],
  quiz: [
    { q: "$P(A) = 0.5$, $P(B) = 0.3$, independent: $P(A \\cup B) =$", opts: ["0.8", "0.65", "0.15", "0.35"], ans: 1, why: "$0.5 + 0.3 - 0.15$." },
    { q: "$P(A) = 0.5$, $P(B) = 0.3$, mutually exclusive: $P(A \\cup B) =$", opts: ["0.8", "0.65", "0.15", "0"], ans: 0, why: "No overlap." },
    { q: "$P(A \\cap B) = 0.12$, $P(A) = 0.4$, $P(B) = 0.3$: the events are", opts: ["mutually exclusive", "independent", "dependent", "exhaustive"], ans: 1, why: "$0.4 \\times 0.3 = 0.12$." },
    { q: "In a Venn diagram, mutually exclusive events are drawn:", opts: ["overlapping", "not overlapping", "one inside the other", "as a single circle"], ans: 1, why: "No common region." },
    { q: "$P(A \\cap B') $ where $P(A) = 0.6$, $P(A \\cap B) = 0.2$:", opts: ["0.4", "0.8", "0.2", "0.6"], ans: 0, why: "$A$ minus the overlap." },
    { q: "Exhaustive events satisfy:", opts: ["$P(A \\cap B) = 0$", "$P(A \\cup B) = 1$", "$P(A) = P(B)$", "$P(A)P(B) = 1$"], ans: 1, why: "Cover everything." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS 2019 P2 Q2", ctx: "Events $A$, $B$ and $C$ have $P(A) = 0.25$, $P(C) = 0.4$, $P(B \\cap C) = 0.1$ and $P(B \\cap A' \\cap C') = 0.15$. $A$ and $B$ are mutually exclusive; $A$ and $C$ are independent.",
      parts: [
        { q: "Draw a Venn diagram, using $x$, $y$ and $z$ for $P(A \\cap C')$, $P(A \\cap C)$ and $P(C \\cap A' \\cap B')$.", marks: 2, ms: ["B1: $A$ and $B$ not overlapping; $C$ overlapping both", "B1: 0.1 in $B \\cap C$, 0.15 in $B$ only, $x$, $y$, $z$ placed correctly"] },
        { q: "Find $x$, $y$, $z$ and $P(A' \\cap B' \\cap C')$.", marks: 3, ms: ["M1: $y = 0.25 \\times 0.4 = 0.1$, so $x = 0.15$", "A1: $z = 0.4 - 0.1 - 0.1 = 0.2$", "A1: $1 - (0.15 + 0.1 + 0.2 + 0.1 + 0.15) = 0.3$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2023 P2 Q3", ctx: "In a sixth form of 60 students, 24 belong to the Art club ($A$), 30 to the Music club ($M$) and $x$ belong to both.",
      parts: [
        { q: "Find the range of possible values of $x$.", marks: 2, ms: ["B1: $x \\le 24$", "B1: $24 + 30 - x \\le 60 \\Rightarrow x \\ge 0$; so $0 \\le x \\le 24$"] },
        { q: "Determine the value of $x$ for which $A$ and $M$ are independent.", marks: 2, ms: ["M1: $\\tfrac{x}{60} = \\tfrac{24}{60} \\times \\tfrac{30}{60}$", "A1: $x = 12$"] },
        { q: "Given instead that $x = 15$, find $P(A \\cup M)$ and state whether $A$ and $M$ are mutually exclusive.", marks: 2, ms: ["B1: $\\tfrac{24 + 30 - 15}{60} = 0.65$", "B1: not mutually exclusive since $P(A \\cap M) = 0.25 \\ne 0$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2018 P2 Q2", ctx: "A factory buys components from three suppliers: 40% from $A$ (3% faulty), 35% from $B$ (5% faulty) and 25% from $C$ (2% faulty).",
      parts: [
        { q: "Find the percentage of the factory's components that are faulty.", marks: 2, ms: ["M1: $0.4 \\times 0.03 + 0.35 \\times 0.05 + 0.25 \\times 0.02$", "A1: $0.0345 = 3.45\\%$"] },
        { q: "Explain why the events 'the component is faulty' and 'the component is from $A$' are not independent.", marks: 2, ms: ["M1: $P(F|A) = 0.03$ but $P(F) = 0.0345$", "A1: not equal so not independent"] }
      ] },
    { level: "AS", src: "Edexcel AS Nov 2021 P2 Q1", q: "The Venn diagram shows $P(A \\cap B) = p$, $P(A \\cap B') = 0.2$, $P(B \\cap A') = 0.35$, $P(A' \\cap B') = 0.3$. Find $p$, and state, with a reason, whether $A$ and $B$ are mutually exclusive.", marks: 3,
      ms: ["M1: $0.2 + p + 0.35 + 0.3 = 1$", "A1: $p = 0.15$", "B1: not mutually exclusive as $P(A \\cap B) = 0.15 \\ne 0$"] }
  ]
});

X("maths:S3.2", {
  notes: [
    { page: "Past-paper patterns" },
    "$P(A|B) = \\dfrac{P(A \\cap B)}{P(B)}$ — *restrict the sample space to $B$*. On a **Venn diagram** the denominator is the whole of $B$; on a **two-way table** it is the row/column total; on a **tree** it is the sum of the branches that satisfy the condition. Two consistent traps: $P(A|B) \\ne P(B|A)$, and \"given that exactly one occurs\" means the denominator is $P(A \\cap B') + P(A' \\cap B)$.",
    "**Independence with unknowns** (2023 Q1): $p + 0.12$ and $q + 0.12$ multiply to 0.12 and add to 0.8 — a quadratic. **Bags and trees** (2025 Q1): $P(\\text{both yellow} \\mid \\text{same colour}) = \\dfrac{P(YY)}{P(YY) + P(BB)}$.",
    { callout: { t: "formula", h: "Useful rearrangements", body: "$P(A \\cap B) = P(A|B)P(B) = P(B|A)P(A)$; $P(A|B') = \\dfrac{P(A) - P(A \\cap B)}{1 - P(B)}$; if independent, $P(A|B) = P(A|B') = P(A)$." } }
  ],
  flashcards: [
    ["Conditional probability formula?", "$P(A|B) = \\dfrac{P(A \\cap B)}{P(B)}$."],
    ["Two-way table: 120 employees, 60 work from home; 30 of those are full-time. $P(\\text{FT}|\\text{home})$?", "$\\tfrac{30}{60} = 0.5$."],
    ["If $P(\\text{FT}) = \\tfrac23$ there, are FT and home independent?", "No: $P(\\text{FT}|\\text{home}) = 0.5 \\ne \\tfrac23$."],
    ["Bag A: 3 yellow, 5 blue; bag B: 4 yellow, 2 blue; one bead from each. $P(\\text{both yellow})$?", "$\\tfrac38 \\times \\tfrac46 = \\tfrac14$."],
    ["Same bags: $P(\\text{both yellow} \\mid \\text{same colour})$?", "$P(BB) = \\tfrac58 \\times \\tfrac26 = \\tfrac{5}{24}$; $\\dfrac{6/24}{6/24 + 5/24} = \\tfrac{6}{11}$."],
    ["$P(A|B')$ in terms of Venn regions?", "$\\dfrac{P(A \\cap B')}{1 - P(B)}$."],
    ["Given $A$ and $B$ independent, $P(A|B') = $?", "$P(A)$."],
    ["'Given that exactly one of $A$, $B$ occurs, find the probability it was $A$.'", "$\\dfrac{P(A \\cap B')}{P(A \\cap B') + P(A' \\cap B)}$."],
    ["Tree diagram: second-branch probabilities are…", "Conditional on the first branch — they change when sampling without replacement."]
  ],
  quiz: [
    { q: "$P(A \\cap B) = 0.2$, $P(B) = 0.5$: $P(A|B) =$", opts: ["0.1", "0.4", "0.7", "0.25"], ans: 1, why: "$0.2/0.5$." },
    { q: "$P(A|B) = P(A)$ means:", opts: ["mutually exclusive", "independent", "exhaustive", "$A \\subset B$"], ans: 1, why: "Definition." },
    { q: "In a two-way table, $P(\\text{row}|\\text{column})$ divides by:", opts: ["the grand total", "the column total", "the row total", "1"], ans: 1, why: "Restrict to the column." },
    { q: "Without replacement, 2 red from 5 red and 3 blue: $P(RR) =$", opts: ["$\\tfrac{25}{64}$", "$\\tfrac{5}{14}$", "$\\tfrac{10}{56}$", "$\\tfrac{2}{8}$"], ans: 1, why: "$\\tfrac58 \\times \\tfrac47$." },
    { q: "$P(B|A) = 0.6$, $P(A) = 0.5$: $P(A \\cap B) =$", opts: ["0.3", "1.1", "0.1", "0.83"], ans: 0, why: "Multiply." },
    { q: "$P(A) = 0.6$, $P(B) = 0.2$, independent: $P(A|B') =$", opts: ["0.6", "0.48", "0.8", "0.12"], ans: 0, why: "Independence." }
  ],
  exam: [
    { src: "Edexcel 2022 P3 Q5", ctx: "A company has 120 employees. 80 are full-time (FT) and 40 part-time (PT). Of the full-time staff, 30 usually work from home; of the part-time staff, 30 usually work from home.",
      parts: [
        { q: "Draw a two-way table and find the probability that a randomly chosen employee works from home.", marks: 2, ms: ["B1: table with FT: 50 office, 30 home; PT: 10 office, 30 home", "B1: $\\tfrac{60}{120} = 0.5$"] },
        { q: "Find the probability that an employee is full-time given they work from home.", marks: 2, ms: ["M1: $\\tfrac{30}{60}$", "A1: $0.5$"] },
        { q: "Determine whether 'full-time' and 'works from home' are independent.", marks: 2, ms: ["M1: $P(\\text{FT}) = \\tfrac{80}{120} = \\tfrac23 \\ne P(\\text{FT}|\\text{home}) = 0.5$", "A1: not independent"] },
        { q: "Two employees are chosen at random without replacement. Find the probability that exactly one is part-time.", marks: 3, ms: ["M1: $\\tfrac{40}{120} \\times \\tfrac{80}{119} + \\tfrac{80}{120} \\times \\tfrac{40}{119}$", "M1: $2 \\times \\tfrac{3200}{14280}$", "A1: $\\tfrac{160}{357} = 0.448$"] }
      ] },
    { src: "Edexcel 2025 P3 Q1", ctx: "Bag $A$ contains 3 yellow and 5 blue beads; bag $B$ contains 4 yellow and 2 blue beads. One bead is taken at random from each bag.",
      parts: [
        { q: "Draw a tree diagram and find the probability that both beads are yellow.", marks: 3, ms: ["B1: branches $\\tfrac38, \\tfrac58$ then $\\tfrac46, \\tfrac26$", "M1: $\\tfrac38 \\times \\tfrac46$", "A1: $\\tfrac14$"] },
        { q: "Find the probability that the beads are the same colour.", marks: 2, ms: ["M1: $\\tfrac14 + \\tfrac58 \\times \\tfrac26$", "A1: $\\tfrac{11}{24}$"] },
        { q: "Given that the beads are the same colour, find the probability that both are yellow.", marks: 2, ms: ["M1: $\\dfrac{1/4}{11/24}$", "A1: $\\tfrac{6}{11}$"] }
      ] },
    { src: "Edexcel 2023 P3 Q1", ctx: "Events $A$ and $B$ are independent with $P(A \\cap B) = 0.12$, $P(A' \\cap B') = 0.32$, $P(A \\cap B') = p$ and $P(A' \\cap B) = q$, where $P(A) > P(B)$.",
      parts: [
        { q: "Show that $p + q = 0.56$.", marks: 1, ms: ["B1: $p + q = 1 - 0.12 - 0.32$"] },
        { q: "Find the values of $p$ and $q$.", marks: 4, ms: ["M1: $(p + 0.12)(q + 0.12) = 0.12$", "M1: with $a = p + 0.12$: $a(0.8 - a) = 0.12 \\Rightarrow a^2 - 0.8a + 0.12 = 0$", "A1: $a = 0.6$ (or 0.2)", "A1: $p = 0.48$, $q = 0.08$ (using $P(A) > P(B)$)"] },
        { q: "Find $P(A|B')$.", marks: 1, ms: ["B1: $= P(A) = 0.6$ by independence (or $0.48 \\div 0.8$)"] }
      ] }
  ]
});

X("maths:S3.3", {
  notes: [
    { page: "Past-paper patterns" },
    "**Critiquing a model** means naming an *assumption* and saying whether it is realistic: independence of trials (a player's successive shots are not independent — confidence/fatigue), constant probability (weather changes across a season), a fair die (may be biased), sampling with replacement when the population is small. **Ball-transfer problems** (Nov 2021 Q5): draw the tree for the transfer, then for the draw; the second-stage probabilities depend on what moved. **Inequality/bound questions** (2024 Q6): with an unknown region $x$, write $P(A|B)$ as a function of $x$ and use $0 \\le x \\le$ (smallest containing region) to bound it.",
    { callout: { t: "tip", h: "Explain / comment marks", body: "Give a specific reason tied to the context, not a generic 'it might be biased'. \"The probability of a sale might not be constant because customers late in the day are less likely to buy\" scores; \"it is only a model\" does not." } }
  ],
  flashcards: [
    ["Bag A: 2 red, 3 green; bag B: 4 red, 1 green. One ball moved A→B, then one drawn from B. $P(\\text{green drawn})$?", "$\\tfrac35 \\times \\tfrac26 + \\tfrac25 \\times \\tfrac16 = \\tfrac{8}{30} = \\tfrac{4}{15}$."],
    ["Same setup: $P(\\text{green moved} \\mid \\text{green drawn})$?", "$\\dfrac{6/30}{8/30} = \\tfrac34$."],
    ["Two assumptions when modelling free throws with a fixed probability $p$?", "Each throw is independent of the others; $p$ is constant for every throw."],
    ["Why might those be unrealistic?", "A player may gain confidence after a success (not independent) or tire (probability changes)."],
    ["A spinner lands on $x$ with probability $\\tfrac x{10}$, $x = 1, 2, 3, 4$. Given $X = x$, a coin with $P(\\text{head}) = \\tfrac{k}{x}$ is tossed. Find $P(\\text{head})$ in terms of $k$.", "$\\sum \\tfrac{x}{10}\\cdot\\tfrac{k}{x} = \\tfrac{4k}{10} = 0.4k$."],
    ["'Probability of rain each day is 0.3, days independent' — realistic?", "No — weather on consecutive days is correlated and the probability varies with season."],
    ["When is 'with replacement' a reasonable simplification of 'without'?", "When the population is very large compared with the sample so probabilities barely change."],
    ["How do you bound $P(A|B)$ when a Venn region $x$ is unknown?", "Write it as a function of $x$ and substitute the extreme allowed values of $x$."]
  ],
  quiz: [
    { q: "A model assumes shots at goal are independent. A reason it may fail:", opts: ["the goal is fixed", "confidence changes after a goal", "the ball is spherical", "the probability is small"], ans: 1, why: "Dependence." },
    { q: "Moving a ball between bags then drawing: the second probabilities are", opts: ["fixed", "conditional on what was moved", "always $\\tfrac12$", "independent"], ans: 1, why: "Tree structure." },
    { q: "Drawing 2 cards from a full pack without replacement: $P(\\text{second is an ace})$ is", opts: ["$\\tfrac{4}{52}$", "$\\tfrac{3}{51}$", "$\\tfrac{4}{51}$", "0"], ans: 0, why: "By symmetry, same as the first." },
    { q: "'The probability a component is faulty is 0.02 and components are independent' is a:", opts: ["binomial model", "normal model", "uniform model", "regression model"], ans: 0, why: "Fixed $n$, constant $p$, independent trials." },
    { q: "A model gives $P(\\text{heights} < 0) = 0.001$. This shows the model is", opts: ["exact", "an approximation with a small flaw", "useless", "discrete"], ans: 1, why: "Models approximate reality." },
    { q: "The best critique of a model states:", opts: ["'it is only a model'", "a specific assumption and why it may fail in context", "the answer is wrong", "the sample is small"], ans: 1, why: "Context-specific." }
  ],
  exam: [
    { level: "AS", src: "Edexcel AS Nov 2021 P2 Q5", ctx: "Bag $A$ contains 2 red and 3 green balls. Bag $B$ contains 4 red and 1 green ball. A ball is taken at random from $A$ and placed in $B$; then a ball is taken at random from $B$.",
      parts: [
        { q: "Find the probability that the ball taken from $B$ is green.", marks: 3, ms: ["M1: tree: $\\tfrac35$ green moved then $\\tfrac26$; $\\tfrac25$ red moved then $\\tfrac16$", "M1: $\\tfrac35 \\times \\tfrac26 + \\tfrac25 \\times \\tfrac16$", "A1: $\\tfrac{4}{15}$"] },
        { q: "Given that the ball taken from $B$ is green, find the probability that the ball moved was red.", marks: 2, ms: ["M1: $\\dfrac{2/30}{8/30}$", "A1: $\\tfrac14$"] },
        { q: "Bag $B$ is changed to contain $n$ red balls and 1 green. The probability that the ball taken from $B$ is green is now $\\tfrac{1}{5}$. Find $n$.", marks: 3, ms: ["M1: $\\tfrac35 \\cdot \\tfrac{2}{n + 2} + \\tfrac25 \\cdot \\tfrac{1}{n + 2} = \\tfrac15$", "M1: $\\tfrac{8}{5(n + 2)} = \\tfrac15$", "A1: $n = 6$"] }
      ] },
    { src: "Edexcel 2023 P3 Q5", ctx: "A biased spinner shows $X = x$ with $P(X = x) = \\dfrac{x}{10}$ for $x = 1, 2, 3, 4$. After the spin, a biased coin is tossed with $P(\\text{head} \\mid X = x) = \\dfrac{k}{x}$, where $k$ is a constant.",
      parts: [
        { q: "State the range of possible values of $k$.", marks: 1, ms: ["B1: $0 \\le k \\le 1$ (so that $P(\\text{head}|X = 1) \\le 1$)"] },
        { q: "Show that $P(\\text{head}) = 0.4k$.", marks: 2, ms: ["M1: $\\sum_{x} \\tfrac{x}{10} \\times \\tfrac{k}{x}$", "A1: $4 \\times \\tfrac{k}{10} = 0.4k$"] },
        { q: "Given $k = 0.5$, find $P(X = 2 \\mid \\text{head})$.", marks: 3, ms: ["M1: $P(X = 2 \\cap H) = \\tfrac{2}{10} \\times \\tfrac{0.5}{2} = 0.05$", "M1: $\\div 0.2$", "A1: $0.25$"] },
        { q: "Comment on whether the model is likely to be realistic.", marks: 1, ms: ["B1: unrealistic — the coin's bias would not depend on the spinner (the events would be independent in practice)"] }
      ] },
    { src: "Edexcel 2024 P3 Q6", ctx: "In a Venn diagram of events $A$ and $B$: $P(A \\cap B') = 0.3$, $P(A \\cap B) = x$, $P(A' \\cap B) = 0.2$ and $P(A' \\cap B') = 0.5 - x$.",
      parts: [
        { q: "Write down the range of possible values of $x$.", marks: 1, ms: ["B1: $0 \\le x \\le 0.5$"] },
        { q: "Find $P(A|B)$ in terms of $x$ and hence the range of possible values of $P(A|B)$.", marks: 3, ms: ["M1: $P(A|B) = \\dfrac{x}{x + 0.2}$", "A1: at $x = 0$ it is 0; at $x = 0.5$ it is $\\tfrac{5}{7}$", "A1: $0 \\le P(A|B) \\le \\tfrac57$"] },
        { q: "Find the value of $x$ for which $A$ and $B$ are independent.", marks: 3, ms: ["M1: $x = (0.3 + x)(0.2 + x)$", "M1: $x^2 - 0.5x + 0.06 = 0 \\Rightarrow (x - 0.2)(x - 0.3) = 0$", "A1: $x = 0.2$ or $x = 0.3$"] }
      ] }
  ]
});

X("maths:S4.1", {
  notes: [
    { page: "Past-paper patterns" },
    "**Find $k$**: probabilities sum to 1. **Sums of two independent copies** ($P(X_1 + X_2 = 5)$, $P(X_1 = X_2)$): list the combinations, multiply, add — remember both orders. **Discrete uniform**: $P(X = x) = \\tfrac1n$; \"is it suitable for cloud cover (oktas 0–8)?\" — no, because the frequencies in the large data set are far from equal (8 oktas is most common). **Binomial as a named distribution** (AS 2019 Q3): identify $n$, $p$, state independence and constant probability. **Stopping rules** (AS 2024 Q5): spin until the first 4 — $P(N = n) = (1 - p)^{n-1}p$, and $P(N \\le 3) = 1 - (1 - p)^3$.",
    { callout: { t: "warn", h: "Set the calculation out", body: "$P(X_1 + X_2 = 5) = P(1,4) + P(4,1) + P(2,3) + P(3,2)$ — listing the pairs is the method mark; a bare answer with no pairs shown drops it." } }
  ],
  flashcards: [
    ["$P(X = x) = kx$, $x = 1, 2, 3, 4$. Find $k$.", "$k(1 + 2 + 3 + 4) = 1 \\Rightarrow k = 0.1$."],
    ["With that distribution, $P(X_1 + X_2 = 5)$ for two independent spins?", "$2(0.1 \\times 0.4 + 0.2 \\times 0.3) = 0.2$."],
    ["$P(X = x) = \\log_{10}\\dfrac{x + 1}{x}$, $x = 1, \\dots, 9$. Why is this a valid distribution?", "Sum telescopes: $\\log_{10}\\tfrac21 + \\dots + \\log_{10}\\tfrac{10}{9} = \\log_{10} 10 = 1$."],
    ["Same distribution: $P(X > 4)$?", "$\\log_{10}\\tfrac{10}{5} = \\log_{10} 2 = 0.301$."],
    ["Discrete uniform on $\\{1, \\dots, 5\\}$: $P(X = 2)$?", "$0.2$."],
    ["Why is a discrete uniform a poor model for Daily Mean Cloud Cover (oktas)?", "The observed frequencies are not equal — high oktas (7, 8) occur far more often."],
    ["Spin until the first 4, $P(4) = 0.3$. $P(N = 3)$?", "$0.7^2 \\times 0.3 = 0.147$."],
    ["$P(N \\le 3)$ there?", "$1 - 0.7^3 = 0.657$."],
    ["Two biased spinners, $R$ and $G$; $X = mR + nG$ — how do you find $m$, $n$ from a given distribution of $X$?", "Match the smallest and largest values of $X$ to $m \\cdot \\min R + n \\cdot \\min G$ etc."],
    ["Conditions for a binomial model?", "Fixed number of trials, two outcomes, constant probability, independent trials."]
  ],
  quiz: [
    { q: "$P(X = x) = \\dfrac{k}{x}$ for $x = 1, 2, 4$: $k =$", opts: ["$\\tfrac47$", "$\\tfrac17$", "$\\tfrac74$", "1"], ans: 0, why: "$k(1 + \\tfrac12 + \\tfrac14) = 1$." },
    { q: "A fair 5-sided spinner's score has distribution:", opts: ["binomial", "discrete uniform", "normal", "geometric"], ans: 1, why: "Equal probabilities." },
    { q: "Number of 2s in 20 spins of a fair 5-sided spinner:", opts: ["$B(20, 0.2)$", "$B(5, 0.2)$", "uniform", "$B(20, 0.5)$"], ans: 0, why: "Binomial." },
    { q: "$P(X_1 = X_2)$ for independent copies of $X$ is:", opts: ["$\\sum P(X = x)^2$", "$2\\sum P(X = x)$", "$P(X = x)$", "1"], ans: 0, why: "Sum of squares." },
    { q: "'Spin until the first success' has how many trials?", opts: ["fixed", "not fixed — so not binomial", "always 1", "$n$"], ans: 1, why: "Geometric setting." },
    { q: "Cloud cover in oktas is:", opts: ["continuous", "discrete (0–8)", "qualitative", "always 8"], ans: 1, why: "Integer scale." }
  ],
  exam: [
    { src: "Edexcel Oct 2020 P3 Q4", ctx: "A spinner gives score $X$ with $P(X = x) = kx$ for $x = 1, 2, 3, 4$.",
      parts: [
        { q: "Show that $k = 0.1$.", marks: 1, ms: ["B1: $10k = 1$"] },
        { q: "The spinner is spun twice. Find $P(X_1 + X_2 = 5)$.", marks: 3, ms: ["M1: pairs (1,4), (4,1), (2,3), (3,2)", "M1: $0.1 \\times 0.4 + 0.4 \\times 0.1 + 0.2 \\times 0.3 + 0.3 \\times 0.2$", "A1: $0.2$"] },
        { q: "Find $P(X_1 = X_2)$.", marks: 2, ms: ["M1: $0.1^2 + 0.2^2 + 0.3^2 + 0.4^2$", "A1: $0.3$"] }
      ] },
    { src: "Edexcel Oct 2021 P3 Q6", ctx: "The random variable $X$ has $P(X = x) = \\log_{10}\\left(\\dfrac{x + 1}{x}\\right)$ for $x = 1, 2, \\dots, 9$.",
      parts: [
        { q: "Show that this is a valid probability distribution.", marks: 2, ms: ["M1: $\\sum = \\log_{10}\\left(\\tfrac21 \\cdot \\tfrac32 \\cdots \\tfrac{10}{9}\\right)$", "A1: $= \\log_{10} 10 = 1$ and each term is positive"] },
        { q: "Find $P(X > 4)$.", marks: 2, ms: ["M1: $\\log_{10}\\tfrac{10}{5}$", "A1: $0.301$"] },
        { q: "Two independent observations of $X$ are taken. Find $P(X_1 = X_2)$ to 3 significant figures.", marks: 2, ms: ["M1: $\\sum_{x=1}^{9}\\left(\\log_{10}\\tfrac{x+1}{x}\\right)^2$", "A1: $0.165$"] }
      ] },
    { level: "AS", src: "Edexcel AS 2024 P2 Q5", ctx: "A biased 4-sided spinner has $P(1) = 0.2$, $P(2) = 0.3$, $P(3) = 0.2$, $P(4) = 0.3$. Nia spins it repeatedly until it shows a 4, and $N$ is the number of spins needed.",
      parts: [
        { q: "Find $P(N = 3)$.", marks: 2, ms: ["M1: $0.7 \\times 0.7 \\times 0.3$", "A1: $0.147$"] },
        { q: "Find $P(N \\le 3)$.", marks: 2, ms: ["M1: $1 - 0.7^3$", "A1: $0.657$"] },
        { q: "Explain why $N$ does not have a binomial distribution.", marks: 1, ms: ["B1: the number of trials is not fixed (it stops at the first 4)"] },
        { q: "Nia instead spins exactly 10 times and counts the number of 4s, $Y$. Find $P(Y = 2)$.", marks: 2, ms: ["M1: $Y \\sim B(10, 0.3)$; $\\binom{10}{2}0.3^2 0.7^8$", "A1: $0.233$"] }
      ] },
    { src: "Edexcel 2018 P3 Q1", q: "Jamil suggests that the Daily Mean Cloud Cover (oktas) at Hurn in the large data set can be modelled by a discrete uniform distribution on $\\{0, 1, \\dots, 8\\}$. Using this model, find $P(X \\ge 7)$, and comment on the suitability of the model given that a sample of 30 days contained 14 days with cloud cover 7 or 8.", marks: 4,
      ms: ["M1: $P(X \\ge 7) = \\tfrac29$", "A1: $0.222$", "M1: expected under the model $30 \\times \\tfrac29 = 6.7$ days vs observed 14", "A1: the model is not suitable — high cloud cover is far more common than the uniform model predicts"] }
  ]
});

X("maths:S4.2", {
  notes: [
    { page: "Past-paper patterns" },
    "**Standardise** with $Z = \\dfrac{X - \\mu}{\\sigma}$ whenever $\\mu$ or $\\sigma$ is unknown; use the calculator's normal CD/inverse normal directly otherwise, but *write the probability statement* ($P(X > 16) = 0.6915$) — that is where the marks are. **Finding $\\mu$ and $\\sigma$ from two percentiles** (2025 Q5): two simultaneous equations $x_1 = \\mu + z_1\\sigma$, $x_2 = \\mu + z_2\\sigma$ with $z$ from the inverse normal to 4 d.p. **\"Both batteries last\"** = product of independent probabilities. **Expected cost/number** = $n \\times$ probability. **Conditional**: $P(H > 170 \\mid H > 165) = \\dfrac{P(H > 170)}{P(H > 165)}$.",
    { callout: { t: "formula", h: "Common z-values (4 d.p.)", body: "$P(Z < z)$: 0.90 → 1.2816, 0.95 → 1.6449, 0.975 → 1.9600, 0.99 → 2.3263, 0.995 → 2.5758; 0.85 → 1.0364; 0.40 → −0.2533; 0.10 → −1.2816." } }
  ],
  flashcards: [
    ["Battery life $\\sim N(18, 4^2)$ hours. $P(L > 16)$?", "$P(Z > -0.5) = 0.6915$."],
    ["A torch needs two such batteries both working. $P(\\text{works for 16 h})$?", "$0.6915^2 = 0.478$."],
    ["$P(X < a) = 0.1$ for $N(200, \\sigma^2)$ with $a = 196$: find $\\sigma$.", "$\\dfrac{196 - 200}{\\sigma} = -1.2816 \\Rightarrow \\sigma = 3.12$."],
    ["Two percentiles: $P(H < 160) = 0.4$, $P(H > 170) = 0.15$. Set up the equations.", "$160 = \\mu - 0.2533\\sigma$, $170 = \\mu + 1.0364\\sigma$."],
    ["Solve them.", "$1.2897\\sigma = 10 \\Rightarrow \\sigma = 7.75$, $\\mu = 162.0$."],
    ["Female heights $N(162, 6.5^2)$: 90th percentile?", "$162 + 1.2816 \\times 6.5 = 170.3$ cm."],
    ["$P(H > 170 \\mid H > 165)$ for that distribution?", "$\\dfrac{P(Z > 1.231)}{P(Z > 0.4615)} = \\dfrac{0.1092}{0.3222} = 0.339$."],
    ["Normal distribution: proportion within one sd / two sd of the mean?", "About 68% and 95%."],
    ["Points of inflection of the normal curve are at…", "$\\mu \\pm \\sigma$."],
    ["Expected number out of 500 rods with $P(\\text{reject}) = 0.1$?", "50."]
  ],
  quiz: [
    { q: "$X \\sim N(50, 5^2)$: $P(X < 60) =$", opts: ["0.9772", "0.8413", "0.5", "0.0228"], ans: 0, why: "$z = 2$." },
    { q: "$P(Z < z) = 0.95$: $z =$", opts: ["1.96", "1.6449", "1.2816", "2.3263"], ans: 1, why: "Tables." },
    { q: "$P(\\mu - \\sigma < X < \\mu + \\sigma) \\approx$", opts: ["0.5", "0.68", "0.95", "0.997"], ans: 1, why: "Empirical rule." },
    { q: "To find $\\sigma$ from $P(X < 30) = 0.2$, $\\mu = 35$:", opts: ["$\\sigma = 5/0.8416$", "$\\sigma = 5 \\times 0.8416$", "$\\sigma = 0.2 \\times 5$", "impossible"], ans: 0, why: "$-5/\\sigma = -0.8416$." },
    { q: "Two unknowns $\\mu$, $\\sigma$ need:", opts: ["one probability", "two probability statements", "the mode", "the median only"], ans: 1, why: "Two equations." },
    { q: "Normal curve is symmetric about:", opts: ["0", "$\\mu$", "$\\sigma$", "the median only"], ans: 1, why: "Mean = median = mode." },
    { q: "$P(X = 20)$ exactly for a continuous $X$ is:", opts: ["0", "$P(X < 20)$", "0.5", "undefined"], ans: 0, why: "Continuous." }
  ],
  exam: [
    { src: "Edexcel 2018 P3 Q5", ctx: "The lifetime, $L$ hours, of a battery is modelled by $N(18, 4^2)$. A calculator needs two batteries and works only while both are working.",
      parts: [
        { q: "Find $P(L > 16)$.", marks: 2, ms: ["M1: $P(Z > -0.5)$", "A1: $0.6915$"] },
        { q: "Find the probability that a calculator fitted with two new batteries works for at least 16 hours.", marks: 2, ms: ["M1: $0.6915^2$ (independence)", "A1: $0.478$"] },
        { q: "Find the value of $t$ such that $P(L > t) = 0.1$.", marks: 3, ms: ["M1: $P(Z > z) = 0.1 \\Rightarrow z = 1.2816$", "M1: $t = 18 + 1.2816 \\times 4$", "A1: $23.1$ hours"] },
        { q: "A different battery has lifetime $N(20, \\sigma^2)$ and $P(L < 15) = 0.05$. Find $\\sigma$.", marks: 3, ms: ["M1: $\\dfrac{15 - 20}{\\sigma} = -1.6449$", "M1: $\\sigma = 5 \\div 1.6449$", "A1: $3.04$"] }
      ] },
    { src: "Edexcel 2025 P3 Q5", ctx: "The heights of adult men in a town are modelled by $N(175, 7.5^2)$ cm. The heights of adult women are modelled by $N(\\mu, \\sigma^2)$ with $P(H < 160) = 0.4$ and $P(H > 170) = 0.15$.",
      parts: [
        { q: "Find the probability that a man is taller than 185 cm.", marks: 2, ms: ["M1: $P(Z > 1.333)$", "A1: $0.0912$"] },
        { q: "Given that a man is taller than 180 cm, find the probability that he is taller than 185 cm.", marks: 3, ms: ["M1: $\\dfrac{P(H > 185)}{P(H > 180)}$", "M1: $\\dfrac{0.0912}{0.2525}$", "A1: $0.361$"] },
        { q: "Find $\\mu$ and $\\sigma$ for the women.", marks: 5, ms: ["B1: $z = -0.2533$ and $z = 1.0364$", "M1: $160 = \\mu - 0.2533\\sigma$", "M1: $170 = \\mu + 1.0364\\sigma$", "A1: $\\sigma = 7.75$", "A1: $\\mu = 162$ (awrt 162.0)"] }
      ] },
    { src: "Edexcel 2022 P3 Q2", ctx: "A machine cuts metal rods whose lengths $L$ mm follow $N(200, \\sigma^2)$. Rods shorter than 196 mm are scrapped at a cost of £2 each; rods longer than 205 mm are re-cut at a cost of £1 each. It is known that 10% of rods are scrapped.",
      parts: [
        { q: "Show that $\\sigma = 3.12$ to 3 significant figures.", marks: 3, ms: ["M1: $P(L < 196) = 0.1 \\Rightarrow \\dfrac{-4}{\\sigma} = -1.2816$", "M1: $\\sigma = 4 \\div 1.2816$", "A1: $3.121\\ldots = 3.12$ (cso)"] },
        { q: "Find the proportion of rods that are neither scrapped nor re-cut.", marks: 3, ms: ["M1: $P(196 < L < 205)$", "M1: $P(Z < 1.602) - 0.1$", "A1: $0.845$"] },
        { q: "Find the expected total cost for a batch of 500 rods.", marks: 3, ms: ["M1: $P(L > 205) = 0.0546$", "M1: $500(0.1 \\times 2 + 0.0546 \\times 1)$", "A1: £127"] }
      ] },
    { src: "Edexcel 2024 P3 Q5", ctx: "In a school, high-jump heights are modelled by $N(1.68, 0.12^2)$ m and 1500 m times by $N(255, 20^2)$ s, independently. A student qualifies for a competition by jumping over 1.90 m *and* running under 230 s.",
      parts: [
        { q: "Find the probability that a student jumps over 1.90 m.", marks: 2, ms: ["M1: $P(Z > 1.833)$", "A1: $0.0334$"] },
        { q: "Estimate the proportion of students who qualify.", marks: 3, ms: ["M1: $P(T < 230) = P(Z < -1.25) = 0.1056$", "M1: product $0.0334 \\times 0.1056$", "A1: $0.00353$ (about 0.35%)"] },
        { q: "State an assumption you made and comment on it.", marks: 1, ms: ["B1: the two events were assumed independent; in practice athletic ability links them so the estimate may be too low"] }
      ] }
  ]
});

X("maths:S4.3", {
  notes: [
    { page: "Past-paper patterns" },
    "**Choosing a model** and **justifying it**: binomial needs a fixed $n$, constant $p$, independent trials, two outcomes; normal needs a continuous, symmetric, bell-shaped variable. **Normal approximation to $B(n, p)$** (A-level only): valid when $n$ is large and $p$ is close to 0.5; $Y \\sim N(np,\; np(1 - p))$ with a **continuity correction**: $P(X \\ge 70) \\approx P(Y > 69.5)$, $P(X \\le 70) \\approx P(Y < 70.5)$, $P(X < 70) \\approx P(Y < 69.5)$. State \"$np = 60$, $np(1 - p) = 42$\" and the $\\pm 0.5$ explicitly.",
    { callout: { t: "warn", h: "Which way does the 0.5 go?", body: "Draw the bars: $X \\ge 70$ starts at the *left edge* of the 70 bar, i.e. 69.5. $X > 70$ starts at 70.5. If in doubt write the equivalent integer inequality first ($X > 70 \\Leftrightarrow X \\ge 71$)." } }
  ],
  flashcards: [
    ["Four conditions for a binomial model?", "Fixed number of trials; each trial success/failure; constant probability; trials independent."],
    ["When is the normal approximation to the binomial reasonable?", "$n$ large and $p$ close to 0.5 (so $np$ and $n(1-p)$ are both large, e.g. $> 5$)."],
    ["Parameters of the approximation to $B(200, 0.3)$?", "$N(60, 42)$: $\\mu = np = 60$, $\\sigma^2 = np(1-p) = 42$."],
    ["Continuity correction for $P(X \\ge 70)$?", "$P(Y > 69.5)$."],
    ["Continuity correction for $P(X < 70)$?", "$P(Y < 69.5)$."],
    ["Continuity correction for $P(65 \\le X \\le 70)$?", "$P(64.5 < Y < 70.5)$."],
    ["$P(X \\ge 70)$ for $B(200, 0.3)$ via the approximation?", "$P\\left(Z > \\dfrac{69.5 - 60}{\\sqrt{42}}\\right) = P(Z > 1.466) = 0.0713$."],
    ["Why might a normal model be unsuitable for waiting times?", "Times are positively skewed and cannot be negative."],
    ["A quota sample vs random sample for a binomial model — which is justified?", "Only a random sample gives independent trials with constant $p$."],
    ["Discrete uniform vs binomial — how to tell?", "Uniform: each outcome equally likely (one trial); binomial: counting successes over $n$ trials."]
  ],
  quiz: [
    { q: "$B(100, 0.5)$ approximates to:", opts: ["$N(50, 25)$", "$N(50, 5)$", "$N(100, 25)$", "$N(50, 50)$"], ans: 0, why: "$np = 50$, $npq = 25$." },
    { q: "$P(X \\le 40)$ with continuity correction:", opts: ["$P(Y < 40.5)$", "$P(Y < 39.5)$", "$P(Y < 40)$", "$P(Y > 40.5)$"], ans: 0, why: "Include the 40 bar." },
    { q: "Normal approximation is poor when:", opts: ["$p = 0.5$", "$n = 1000$", "$p = 0.02$, $n = 20$", "$np = 50$"], ans: 2, why: "Skewed, small $np$." },
    { q: "Which needs a continuity correction?", opts: ["normal → normal", "binomial → normal", "uniform → uniform", "none"], ans: 1, why: "Discrete to continuous." },
    { q: "A model for the number of faulty items in a batch of 50, $p = 0.04$:", opts: ["$B(50, 0.04)$", "$N(2, 1.92)$", "uniform", "geometric"], ans: 0, why: "Binomial; $np$ too small for normal." },
    { q: "'Height of a randomly chosen adult' is best modelled by:", opts: ["binomial", "normal", "discrete uniform", "none"], ans: 1, why: "Continuous, symmetric." }
  ],
  exam: [
    { src: "Edexcel Specimen P3 Q3", ctx: "A supermarket finds that 30% of its bags of apples contain at least one bruised apple. A random sample of 200 bags is checked; $X$ is the number containing a bruised apple.",
      parts: [
        { q: "State two conditions needed for $X$ to have a binomial distribution.", marks: 2, ms: ["B1: bags are independent of each other", "B1: the probability 0.3 is the same for every bag"] },
        { q: "Using a normal approximation, estimate $P(X \\ge 70)$.", marks: 4, ms: ["B1: $Y \\sim N(60, 42)$", "M1: continuity correction $P(Y > 69.5)$", "M1: $P\\left(Z > \\dfrac{69.5 - 60}{\\sqrt{42}}\\right) = P(Z > 1.47)$", "A1: $0.0713$ (exact binomial 0.0728)"] },
        { q: "Explain why a normal approximation is appropriate here.", marks: 1, ms: ["B1: $n = 200$ is large and $p = 0.3$ is not too far from 0.5 (both $np$ and $n(1-p)$ are large)"] }
      ] },
    { src: "Edexcel 2024 P3 Q1", ctx: "A fair die is rolled 180 times and $X$ is the number of sixes.",
      parts: [
        { q: "Write down the distribution of $X$ and its mean and variance.", marks: 2, ms: ["B1: $B(180, \\tfrac16)$", "B1: mean 30, variance 25"] },
        { q: "Use a normal approximation to estimate $P(X \\ge 35)$.", marks: 3, ms: ["M1: $P(Y > 34.5)$ with $Y \\sim N(30, 25)$", "M1: $P(Z > 0.9)$", "A1: $0.184$"] },
        { q: "A student calculates the exact value as 0.1828. Comment on the accuracy of the approximation.", marks: 1, ms: ["B1: very close (within 0.002) — the approximation is good because $n$ is large"] }
      ] },
    { src: "Edexcel Oct 2021 P3 Q1", ctx: "A pollster wants to estimate the proportion of voters who support a policy. She uses quota sampling to select 36 people and finds that 25% of the population support it.",
      parts: [
        { q: "Give one reason why a binomial model may not be appropriate for the number of supporters in her sample.", marks: 1, ms: ["B1: quota sampling is not random so the selections are not independent / $p$ not constant"] },
        { q: "Assuming $X \\sim B(36, 0.25)$, find $P(X < 6)$ and $P(X \\ge 12)$.", marks: 3, ms: ["M1: $P(X \\le 5)$", "A1: $0.0835$", "A1: $P(X \\ge 12) = 1 - 0.8329 = 0.167$"] }
      ] }
  ]
});

X("maths:S5.1", {
  notes: [
    { page: "Past-paper patterns" },
    "**The language** every test needs, in order: hypotheses in terms of a *parameter* ($p$, $\\mu$ or $\\rho$ — never \"H₀: the coin is fair\"); the **test statistic**; the **significance level**; either a **p-value** compared with the level or a **critical region**; the conclusion *\"reject H₀ / insufficient evidence to reject H₀\"* and *then* a sentence in context. **Actual significance level** = the probability of the critical region under H₀ (not the nominal 5%).",
    "**PMCC tests** (2018 Q2, 2022 Q6, 2024 Q2): H₀: $\\rho = 0$, H₁: $\\rho < 0$ (one-tailed) or $\\rho \\ne 0$; compare $|r|$ with the **table critical value** for the sample size and tail; e.g. $n = 8$, 5% one-tailed: 0.6215; $n = 10$: 0.5494; $n = 12$: 0.4973; $n = 15$: 0.4409; $n = 20$: 0.3783. Conclusion: \"there is evidence of negative correlation between … and … in the population\".",
    { callout: { t: "warn", h: "Common critique targets (AS 2019 Q5)", body: "Wrong tail; $P(X = 8)$ used instead of $P(X \\ge 8)$; hypotheses about the sample not the population; conclusion 'proves' H₁; comparing a probability with 0.95 rather than 0.05." } }
  ],
  flashcards: [
    ["What is a null hypothesis?", "The default statement about a population parameter, assumed true unless there is sufficient evidence against it."],
    ["One-tailed vs two-tailed test?", "One-tailed: H₁ specifies a direction ($p > 0.3$); two-tailed: H₁ is $p \\ne 0.3$ and the level is split between the tails."],
    ["What is a critical region?", "The set of values of the test statistic that lead to rejecting H₀."],
    ["Actual significance level?", "The probability, under H₀, of the test statistic lying in the critical region."],
    ["p-value?", "The probability, under H₀, of a result at least as extreme as the one observed."],
    ["Hypotheses for a test of negative correlation?", "H₀: $\\rho = 0$, H₁: $\\rho < 0$."],
    ["$r = -0.915$, $n = 8$, 5% one-tailed: conclusion?", "Critical value $-0.6215$; $-0.915 < -0.6215$ so reject H₀ — evidence of negative correlation."],
    ["$r = -0.510$, $n = 10$, 5% one-tailed?", "Critical value $-0.5494$; $-0.510 > -0.5494$ so do not reject H₀ — insufficient evidence."],
    ["How should a conclusion be worded?", "'Reject H₀ (or not); there is (insufficient) evidence at the 5% level that … in context'."],
    ["Why is 'H₀: the coin is fair' not acceptable?", "Hypotheses must be about a parameter: H₀: $p = 0.5$."]
  ],
  quiz: [
    { q: "H₁: $p > 0.2$ is a:", opts: ["two-tailed", "one-tailed (upper)", "one-tailed (lower)", "null"], ans: 1, why: "Direction given." },
    { q: "At 5% two-tailed, each tail has:", opts: ["5%", "2.5%", "10%", "1%"], ans: 1, why: "Split." },
    { q: "p-value 0.03 with level 0.05:", opts: ["reject H₀", "accept H₀", "no conclusion", "increase $n$"], ans: 0, why: "$0.03 < 0.05$." },
    { q: "'Insufficient evidence to reject H₀' means:", opts: ["H₀ is true", "H₁ is true", "the data are consistent with H₀", "the test failed"], ans: 2, why: "Never 'prove'." },
    { q: "Critical value for $r$ with $n = 20$, 5% one-tailed:", opts: ["0.3783", "0.4438", "0.5494", "0.6215"], ans: 0, why: "Tables." },
    { q: "The actual significance level is:", opts: ["always 5%", "$P(\\text{critical region} \\mid H_0)$", "the p-value", "$1 - \\alpha$"], ans: 1, why: "Definition." },
    { q: "PMCC test hypotheses use the symbol:", opts: ["$r$", "$\\rho$", "$p$", "$\\mu$"], ans: 1, why: "Population correlation." }
  ],
  exam: [
    { src: "Edexcel 2018 P3 Q2", q: "A biologist records the altitude (m) and mean temperature (°C) at 8 weather stations and finds a product moment correlation coefficient of $-0.915$. Test, at the 5% level, whether there is evidence of negative correlation between altitude and temperature. State your hypotheses clearly.", marks: 4,
      ms: ["B1: H₀: $\\rho = 0$, H₁: $\\rho < 0$", "M1: critical value for $n = 8$, one-tailed 5%: $-0.6215$", "A1: $-0.915 < -0.6215$ so reject H₀", "A1: there is evidence of negative correlation between altitude and temperature"] },
    { src: "Edexcel 2024 P3 Q2", ctx: "A biologist fits the regression line $d = 45.2 - 1.8w$ for the distance flown, $d$ km, by 10 migrating birds against their wing damage score $w$. The PMCC is $-0.510$.",
      parts: [
        { q: "Interpret the gradient of the regression line.", marks: 1, ms: ["B1: each extra point of wing damage reduces the distance flown by 1.8 km"] },
        { q: "Test at the 5% level whether there is negative correlation between $w$ and $d$.", marks: 4, ms: ["B1: H₀: $\\rho = 0$, H₁: $\\rho < 0$", "M1: critical value ($n = 10$) $-0.5494$", "A1: $-0.510 > -0.5494$ so do not reject H₀", "A1: insufficient evidence of negative correlation between wing damage and distance"] },
        { q: "State the effect on the conclusion of using a 10% significance level instead.", marks: 1, ms: ["B1: critical value $-0.4428$; $-0.510 < -0.4428$ so H₀ would be rejected"] }
      ] },
    { level: "AS", src: "Edexcel AS 2019 P2 Q5", ctx: "A shop believes 15% of customers buy chocolate. After a display is moved, a random sample of 30 customers contains 8 who buy chocolate. Julie tests whether the proportion has increased. Her working: \"H₀: $p = 0.15$, H₁: $p > 0.15$. $P(X = 8) = 0.042 < 0.05$, so the proportion has increased.\"",
      parts: [
        { q: "Identify two errors in Julie's test.", marks: 2, ms: ["B1: she should use $P(X \\ge 8)$, not $P(X = 8)$", "B1: the conclusion should be phrased as evidence, not 'has increased' (and should be in terms of rejecting H₀)"] },
        { q: "Carry out the test correctly at the 5% level.", marks: 3, ms: ["M1: $X \\sim B(30, 0.15)$, $P(X \\ge 8) = 1 - 0.9302$", "A1: $0.0698 > 0.05$", "A1: do not reject H₀; insufficient evidence that the proportion buying chocolate has increased"] }
      ] },
    { src: "Edexcel 2022 P3 Q6", q: "Data on hours of exercise per week, $x$, and resting heart rate, $y$, were recorded for 12 adults; the PMCC between $x$ and $\\log_{10} y$ is $-0.897$. Test, at the 1% level, whether there is evidence of negative correlation, and explain what the result implies about the relationship between $x$ and $y$.", marks: 5,
      ms: ["B1: H₀: $\\rho = 0$, H₁: $\\rho < 0$", "M1: critical value $n = 12$, 1% one-tailed: $-0.6581$", "A1: $-0.897 < -0.6581$ so reject H₀", "A1: evidence of negative correlation between exercise and $\\log$ of heart rate", "B1: so resting heart rate decreases exponentially with hours of exercise"] }
  ]
});

X("maths:S5.2", {
  notes: [
    { page: "Past-paper patterns" },
    "Two shapes: **p-value** (AS: \"test the claim\" — compute $P(X \\ge x)$ or $P(X \\le x)$ under H₀ and compare with the level) and **critical region** (\"find the critical region\"; usually two-tailed — split 5% into 2.5% each tail, and *each tail's probability must be ≤ 2.5%*, so $P(X \\ge 6) = 0.0113$ is in but $P(X \\ge 5) = 0.0432$ is not). Then **actual significance level** = sum of the tail probabilities. A lower tail can be **empty** ($P(X = 0) = 0.1216 > 0.025$ for $B(20, 0.1)$) — say so.",
    { callout: { t: "tip", h: "Working that scores", body: "Write the distribution under H₀ ($X \\sim B(40, 0.25)$), the probability statements with their values ($P(X \\le 4) = 0.0160$, $P(X \\le 5) = 0.0433$), the critical region as inequalities ($X \\le 4$ or $X \\ge 17$), and the actual level ($0.0160 + 0.0116 = 0.0276$)." } }
  ],
  flashcards: [
    ["Hypotheses for 'a dentist claims fewer than 10% of patients are late'?", "H₀: $p = 0.1$, H₁: $p < 0.1$."],
    ["$X \\sim B(20, 0.1)$, two-tailed 5%: lower critical region?", "None — $P(X = 0) = 0.1216 > 0.025$."],
    ["Upper critical region there?", "$P(X \\ge 6) = 0.0113 \\le 0.025$ (but $P(X \\ge 5) = 0.0432$): $X \\ge 6$."],
    ["Actual significance level of that test?", "$0.0113$ (1.13%)."],
    ["$X \\sim B(40, 0.25)$, two-tailed 5%: critical region?", "$X \\le 4$ ($0.0160$) or $X \\ge 17$ ($0.0116$); actual level 2.76%."],
    ["$B(30, 0.15)$, observed 8, H₁: $p > 0.15$: p-value?", "$P(X \\ge 8) = 1 - 0.9302 = 0.0698 > 0.05$ — do not reject."],
    ["$B(200, 0.015)$, two-tailed 5%: critical region?", "Lower: none ($P(0) = 0.0487$); upper $X \\ge 7$ ($0.0113$)."],
    ["How is the conclusion worded when the observed value is in the critical region?", "'Reject H₀; there is evidence at the 5% level that [context]'."],
    ["Why must the tail probability be ≤ the tail level, not 'closest to'?", "Edexcel's convention: the critical region cannot have probability greater than the significance level."]
  ],
  quiz: [
    { q: "H₁: $p \\ne 0.3$ at 5%: each tail uses", opts: ["0.05", "0.025", "0.1", "0.3"], ans: 1, why: "Two-tailed." },
    { q: "Observed $X = 6$, critical region $X \\ge 6$:", opts: ["reject H₀", "do not reject H₀", "inconclusive", "retest"], ans: 0, why: "In the region." },
    { q: "$P(X \\ge 5) = 0.0432$, $P(X \\ge 6) = 0.0113$ at 2.5% tail: CR is", opts: ["$X \\ge 5$", "$X \\ge 6$", "$X \\ge 4$", "$X > 6$"], ans: 1, why: "$0.0432 > 0.025$." },
    { q: "Actual significance level equals:", opts: ["5%", "the sum of critical-region probabilities", "the p-value", "$1 - 0.05$"], ans: 1, why: "Definition." },
    { q: "'Test whether the proportion has changed' is:", opts: ["one-tailed", "two-tailed", "not a test", "a PMCC test"], ans: 1, why: "'Changed' = either direction." },
    { q: "Under H₀: $p = 0.2$ with $n = 25$, the model for $X$ is:", opts: ["$B(25, 0.2)$", "$N(5, 4)$", "uniform", "$B(20, 0.25)$"], ans: 0, why: "Binomial under H₀." }
  ],
  exam: [
    { src: "Edexcel 2022 P3 Q4", ctx: "A dentist believes 10% of patients arrive late. A new reminder system is introduced and she takes a random sample of 20 patients to test whether the proportion arriving late has changed.",
      parts: [
        { q: "State the hypotheses.", marks: 1, ms: ["B1: H₀: $p = 0.1$, H₁: $p \\ne 0.1$"] },
        { q: "Find the critical region for a test at the 5% level, with each tail as close as possible to but not exceeding 2.5%.", marks: 4, ms: ["M1: $X \\sim B(20, 0.1)$; $P(X = 0) = 0.1216 > 0.025$ so no lower tail", "M1: $P(X \\ge 5) = 0.0432$, $P(X \\ge 6) = 0.0113$", "A1: critical region $X \\ge 6$", "A1: (no lower critical region) stated"] },
        { q: "Find the actual significance level of the test.", marks: 1, ms: ["B1: $0.0113$ (1.13%)"] },
        { q: "In the sample 4 patients were late. State the conclusion.", marks: 1, ms: ["B1: 4 is not in the critical region — insufficient evidence that the proportion arriving late has changed"] }
      ] },
    { level: "AS", src: "Edexcel AS 2023 P2 Q4", ctx: "It is claimed that 25% of people in a city have a pollen allergy. A doctor takes a random sample of 40 people to test, at the 5% level, whether the proportion is different from 25%.",
      parts: [
        { q: "Find the critical region for the test.", marks: 4, ms: ["B1: $X \\sim B(40, 0.25)$", "M1: $P(X \\le 4) = 0.0160$, $P(X \\le 5) = 0.0433$; $P(X \\ge 16) = 0.0262$, $P(X \\ge 17) = 0.0116$", "A1: $X \\le 4$", "A1: $X \\ge 17$"] },
        { q: "Find the actual significance level.", marks: 1, ms: ["B1: $0.0160 + 0.0116 = 0.0276$ (2.76%)"] },
        { q: "The sample contained 16 people with the allergy. Comment.", marks: 2, ms: ["M1: 16 not in the critical region", "A1: insufficient evidence at the 5% level that the proportion differs from 25%"] }
      ] },
    { src: "Edexcel 2025 P3 Q3", ctx: "A manufacturer claims that 1.5% of its components are defective. A quality inspector takes a random sample of 200 components.",
      parts: [
        { q: "Assuming the claim is true, find the probability that the sample contains at most 2 defective components.", marks: 2, ms: ["M1: $B(200, 0.015)$, $P(X \\le 2)$", "A1: $0.4215$"] },
        { q: "The sample contains 7 defective components. Test, at the 5% level, whether the proportion of defective components differs from 1.5%.", marks: 4, ms: ["B1: H₀: $p = 0.015$, H₁: $p \\ne 0.015$", "M1: $P(X \\ge 7) = 1 - 0.9887 = 0.0113$", "A1: $0.0113 < 0.025$ so reject H₀", "A1: evidence that the proportion of defective components is not 1.5% (it appears higher)"] }
      ] },
    { level: "AS", src: "Edexcel AS 2022 P2 Q2", ctx: "Supplier $A$ delivers sugar in bags of which 12% are damp. A shop switches to supplier $B$ and, in a random sample of 30 bags from $B$, finds 1 damp bag. The manager claims supplier $B$ has a lower proportion of damp bags.",
      parts: [
        { q: "Find the probability that a sample of 30 bags from supplier $A$ contains fewer than 4 damp bags.", marks: 2, ms: ["M1: $B(30, 0.12)$, $P(X \\le 3)$", "A1: $0.5071$"] },
        { q: "Test the manager's claim at the 5% level.", marks: 4, ms: ["B1: H₀: $p = 0.12$, H₁: $p < 0.12$", "M1: $P(X \\le 1) = 0.88^{30} + 30(0.12)(0.88)^{29}$", "A1: $= 0.1100$ (awrt 0.110) $> 0.05$", "A1: do not reject H₀ — insufficient evidence that supplier $B$ has a lower proportion of damp bags"] }
      ] }
  ]
});

X("maths:S5.3", {
  notes: [
    { page: "Past-paper patterns" },
    "For $X \\sim N(\\mu, \\sigma^2)$ the **sample mean** of $n$ observations is $\\bar X \\sim N\\left(\\mu, \\dfrac{\\sigma^2}{n}\\right)$ — state this distribution explicitly; it is a mark. Then either compute $P(\\bar X \\ge \\bar x)$ under H₀ (p-value), standardise $z = \\dfrac{\\bar x - \\mu}{\\sigma/\\sqrt n}$ and compare with 1.6449 / 1.96, or give the critical value of $\\bar x$. The conclusion sentence names the *population mean* in context. **Assumption**: $\\sigma$ is known and unchanged; the sample is random.",
    { callout: { t: "formula", h: "Critical values of z", body: "One-tailed 5%: 1.6449; 1%: 2.3263. Two-tailed 5%: ±1.9600; 1%: ±2.5758; 10%: ±1.6449." } }
  ],
  flashcards: [
    ["Distribution of the sample mean of $n$ observations from $N(\\mu, \\sigma^2)$?", "$\\bar X \\sim N\\left(\\mu, \\dfrac{\\sigma^2}{n}\\right)$."],
    ["Doctor's consultation time $N(10, 3^2)$ min; sample of 20 has mean 11.5. Test statistic?", "$z = \\dfrac{11.5 - 10}{3/\\sqrt{20}} = 2.24$."],
    ["Conclusion at 5% one-tailed?", "$2.24 > 1.6449$ (p-value 0.0127) — reject H₀; evidence the mean time has increased."],
    ["Critical value of $\\bar x$ for that test?", "$10 + 1.6449 \\times \\dfrac{3}{\\sqrt{20}} = 11.10$."],
    ["Heights $N(177, 7.4^2)$; sample of 52 from region B has mean 175.2; two-tailed 5%?", "$z = \\dfrac{-1.8}{7.4/\\sqrt{52}} = -1.75$; $|z| < 1.96$ — do not reject H₀."],
    ["Standard error of the mean?", "$\\dfrac{\\sigma}{\\sqrt n}$."],
    ["Effect of increasing $n$ on the test?", "Smaller standard error, so the same difference in means gives a larger $|z|$ — more likely to be significant."],
    ["What assumption about $\\sigma$ is made?", "The population standard deviation is known and unchanged under H₁."],
    ["Hypotheses for 'the mean is different from 177'?", "H₀: $\\mu = 177$, H₁: $\\mu \\ne 177$."]
  ],
  quiz: [
    { q: "$\\sigma = 6$, $n = 36$: sd of $\\bar X$ is", opts: ["6", "1", "$\\tfrac16$", "36"], ans: 1, why: "$6/\\sqrt{36}$." },
    { q: "One-tailed 5% critical $z$:", opts: ["1.96", "1.6449", "2.3263", "1.2816"], ans: 1, why: "Tables." },
    { q: "$z = 2.24$ two-tailed 5%:", opts: ["reject H₀", "do not reject", "inconclusive", "need $n$"], ans: 0, why: "$> 1.96$." },
    { q: "Test statistic for a normal mean test:", opts: ["$\\dfrac{\\bar x - \\mu}{\\sigma}$", "$\\dfrac{\\bar x - \\mu}{\\sigma/\\sqrt n}$", "$\\dfrac{x - \\mu}{\\sigma}$", "$\\bar x - \\mu$"], ans: 1, why: "Standard error." },
    { q: "Quadrupling $n$ halves:", opts: ["$\\mu$", "the standard error", "$\\sigma$", "the p-value"], ans: 1, why: "$\\sqrt 4 = 2$." },
    { q: "A p-value of 0.0127 at the 1% level:", opts: ["reject H₀", "do not reject H₀", "reject H₁", "accept both"], ans: 1, why: "$0.0127 > 0.01$." }
  ],
  exam: [
    { src: "Edexcel Oct 2020 P3 Q5", ctx: "The time a doctor spends with a patient is modelled by $N(10, 3^2)$ minutes. After a change in procedure, a random sample of 20 consultations has mean 11.5 minutes. The practice manager believes the mean time has increased.",
      parts: [
        { q: "Write down the distribution of the sample mean $\\bar X$ under the original model.", marks: 1, ms: ["B1: $\\bar X \\sim N\\left(10, \\tfrac{9}{20}\\right)$"] },
        { q: "Test the manager's belief at the 5% level.", marks: 5, ms: ["B1: H₀: $\\mu = 10$, H₁: $\\mu > 10$", "M1: $z = \\dfrac{11.5 - 10}{3/\\sqrt{20}} = 2.236$ (or $P(\\bar X \\ge 11.5) = 0.0127$)", "A1: $2.236 > 1.6449$ (or $0.0127 < 0.05$)", "A1: reject H₀", "A1: evidence that the mean consultation time has increased"] },
        { q: "Find the critical value of $\\bar x$ for this test.", marks: 2, ms: ["M1: $10 + 1.6449 \\times \\tfrac{3}{\\sqrt{20}}$", "A1: $11.10$ minutes"] },
        { q: "State an assumption made about the standard deviation.", marks: 1, ms: ["B1: it remains 3 minutes after the change"] }
      ] },
    { src: "Edexcel 2023 P3 Q4", ctx: "The heights of adult men in region $A$ are modelled by $N(177, 7.4^2)$ cm. A researcher believes the mean height in region $B$ is different. A random sample of 52 men from region $B$ has mean height 175.2 cm; assume the standard deviation is the same.",
      parts: [
        { q: "Test the researcher's belief at the 5% level.", marks: 5, ms: ["B1: H₀: $\\mu = 177$, H₁: $\\mu \\ne 177$", "M1: $\\bar X \\sim N\\left(177, \\tfrac{7.4^2}{52}\\right)$; $z = \\dfrac{175.2 - 177}{7.4/\\sqrt{52}}$", "A1: $z = -1.75$ (p-value 0.079)", "A1: $|{-1.75}| < 1.96$ so do not reject H₀", "A1: insufficient evidence that the mean height in region $B$ differs from 177 cm"] },
        { q: "The researcher repeats the study with a sample of 200 men and obtains the same sample mean. State, with a reason, whether the conclusion changes.", marks: 2, ms: ["M1: $z = \\dfrac{-1.8}{7.4/\\sqrt{200}} = -3.44$", "A1: yes — now $|z| > 1.96$ so H₀ is rejected"] }
      ] },
    { src: "Edexcel Specimen P3 Q5", q: "Bags of flour are filled by a machine so that the mass is $N(1005, 4^2)$ g. After maintenance a random sample of 16 bags has mean mass 1002.6 g. Test, at the 1% level, whether the mean mass has decreased.", marks: 5,
      ms: ["B1: H₀: $\\mu = 1005$, H₁: $\\mu < 1005$", "M1: $\\bar X \\sim N(1005, 1)$; $z = \\dfrac{1002.6 - 1005}{1} = -2.4$", "A1: critical value $-2.3263$ (or p-value 0.0082)", "A1: $-2.4 < -2.3263$ so reject H₀", "A1: evidence at the 1% level that the mean mass has decreased"] }
  ]
});

})(KOS.content.extend);
