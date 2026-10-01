/* Kurenai OS — deep content: Statistics, section S1 (Statistical sampling)
   at full A-level depth, with the large data set context that Edexcel
   examines alongside it. This topic REPLACES the outline entry the base
   file used to carry: every question shape Edexcel has set on sampling and
   on the large data set (9MA0 Paper 3 Section A, 8MA0 Paper 2 Section A,
   June 2018–2025, the Oct/Nov 2020–21 series and the Specimen) is explained
   and then worked through with Edexcel M1/A1/B1 marks. Past-paper item
   banks stay in bank-maths-stats.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* a row of n numbered sampling-frame cells, every k-th from `start`
   highlighted — the picture of a systematic sample */
function frameRow(n, k, start, y, label) {
  var items = [], w = 480 / n;
  for (var i = 0; i < n; i++) {
    var x = 20 + i * w, hit = i + 1 >= start && (i + 1 - start) % k === 0;
    items.push({ poly: [[x, y], [x + w - 2, y], [x + w - 2, y + 26], [x, y + 26]], fill: hit ? "accent" : null, alpha: hit ? 0.45 : 0, c: hit ? "accent" : "muted", w: 1.2 });
    if (i === 0 || i === n - 1 || hit) items.push({ text: [x + (w - 2) / 2, y + 38], t: String(i + 1), size: 10, c: hit ? "accent" : "muted" });
  }
  if (label) items.push({ text: [20, y - 10], t: label, pos: "e", size: 12, c: "text2", off: 0 });
  return items;
}

/* =====================================================================
   S1.1  Population, sample, sampling techniques — and the large data set
   ===================================================================== */
C["maths:S1.1"] = {
  notes: [
    /* ---------------------------------------------------------------- Overview */
    { h: "Statistical sampling — the whole topic on one page" },
    "Section 1 of the specification is a single leaf, but it is examined on almost every Paper 3 (A-level) and Paper 2 (AS).",
    "It is nearly all **words**: the marks go to precise vocabulary and to descriptions a stranger could follow.",
    { ul: [
      "**Population, sample, census** — what each is, and the advantages and disadvantages of a census against a sample.",
      "**Five named sampling methods** — three random (simple random, systematic, stratified) and two non-random (quota, opportunity).",
      "**Describe how to take** a named sample — 2 or 3 marks, each for one specific ingredient.",
      "**Select or critique** a method in context — why this one, why not that one.",
      "**Informal inference** — what a sample does (and does not) tell you about the population, and why two samples can disagree.",
      "**The large data set (LDS)** — the weather data Edexcel expects you to know; its questions sit in every section but most often beside sampling."
    ] },
    { table: { head: ["Question shape", "Typical marks", "Where it appeared"], rows: [
      ["Name the method used", "1", "AS 2021 Q3, A-level 2018 Q4, 2025 Q4"],
      ["Describe how to take a stratified / systematic / simple random sample", "2–3", "AS 2019 Q1, AS 2020 Q4"],
      ["Why a method cannot be used (no sampling frame)", "1", "AS 2020 Q4"],
      ["Name and describe a non-random alternative", "2", "A-level 2018 Q4"],
      ["One advantage / disadvantage of a method", "1", "A-level Oct 2021 Q1"],
      ["Census: name it, or its pros and cons", "1", "A-level 2018 Q4, AS 2025 Q2"],
      ["Sample vs population for a test", "2", "A-level 2025 Q4(f)"],
      ["LDS: identify a variable, a unit, a month, a location; clean a value", "1–2 each", "every series"]
    ] } },
    { h: "How these notes are organised" },
    { ol: [
      "**Populations and samples** — the vocabulary, the census, the sampling frame, inference and sampling variability.",
      "**Random sampling** — simple random, systematic and stratified: the recipe for each and how the marks are split.",
      "**Non-random sampling** — quota and opportunity, and when they are the only option.",
      "**Choosing and critiquing** — the decision in context, bias, and the comparison table.",
      "**The large data set** — stations, variables, units, codes and the seasonal facts examiners use.",
      "**Exam toolkit** — command words, where marks go, misconceptions and memory aids."
    ] },
    "Every worked example is modelled on a real Edexcel question (the source is on its header) and every step carries the mark it earns.",
    "Sampling answers look easy to read and are easy to under-write: cover the working and write your own answer before you check it.",

    /* ---------------------------------------------------------------- Page 1 */
    { page: "Populations and samples" },
    { h: "1.1  The vocabulary" },
    { kv: [
      ["Population", "The **whole** set of items (people, days, fish…) that are of interest to the investigation."],
      ["Census", "Collecting data from **every** member of the population."],
      ["Sample", "A **subset** of the population, used to collect data and make inferences about the whole population."],
      ["Sampling unit", "One individual member of the population that can be sampled (one student, one day, one fish)."],
      ["Sampling frame", "A **list** of all the sampling units — usually numbered — from which the sample is drawn. A register, a database, the 184 dated rows of a station in the LDS."],
      ["Statistic", "A value calculated from the sample only (a sample mean, a sample proportion). It is used to *estimate* the matching population value (a parameter)."]
    ] },
    { fig: { w: 480, h: 200, items: [
      { circle: [210, 100, 92], fill: "muted", alpha: 0.10, c: "muted" },
      { text: [210, 24], t: "Population — every member", size: 12.5, c: "text2" },
      { circle: [180, 112, 40], fill: "accent", alpha: 0.22, c: "accent" },
      { text: [180, 112], t: "sample", size: 12.5, c: "accent", b: true },
      { pt: [262, 92], r: 2.6, c: "muted" }, { pt: [280, 130], r: 2.6, c: "muted" }, { pt: [240, 150], r: 2.6, c: "muted" },
      { pt: [168, 104], r: 2.6, c: "accent" }, { pt: [192, 122], r: 2.6, c: "accent" }, { pt: [176, 128], r: 2.6, c: "accent" },
      { line: [[300, 100], [345, 100]], arrow: true, c: "text2" },
      { text: [350, 92], t: "statistic", pos: "e", size: 11.5, c: "text2" },
      { text: [350, 110], t: "estimates the parameter", pos: "e", size: 11.5, c: "text2" }
    ], cap: "A sample is a subset of the population; what you calculate from it is a *statistic*, used to estimate the population's value." } },
    { h: "1.2  Census or sample?" },
    "A census is the only way to know a population value **exactly**. Everything else is an estimate.",
    { table: { head: ["", "Census", "Sample"], rows: [
      ["Accuracy", "**Completely accurate** — every member is included (no sampling error)", "Only an estimate; a different sample could give a different answer"],
      ["Cost and time", "Expensive and time-consuming for a large population", "Cheaper, quicker; less data to process"],
      ["When the test destroys the item", "Impossible — nothing would be left (testing the life of every light bulb)", "The only sensible choice"],
      ["Large or hard-to-reach population", "Often impractical", "Practical"],
      ["Small population, high stakes", "Sensible (a class of 12, a medical register)", "Risks missing members that matter"]
    ] } },
    { callout: { t: "memorise", h: "The census answers that score", body: [
      "**Advantage:** it is completely accurate / gives the true value / every member is represented.",
      "**Disadvantage:** it is time-consuming / expensive / hard to process — **or** testing destroys the items.",
      "\"More accurate\" is not enough for a census; say *completely* accurate or *unbiased, every member is used*."
    ] } },
    { callout: { t: "warn", h: "The large data set can be a population *or* a sample", body: [
      "\"Treating the large data set for Perth in 2015 as the population, Jasper uses all the data\" — that is a **census** (AS June 2025).",
      "\"The teacher used all the data for Leeming in 2015 **as a sample**\" — then the population is something bigger: Leeming in every year, or the whole of 2015, or every UK station (A-level June 2025).",
      "Read which role the question gives the data. The same rows are a population in one question and a sample in the next."
    ] } },
    { h: "1.3  Using a sample to make inferences — and why samples disagree" },
    { ul: [
      "A sample statistic is used to make an **informal inference** about the population: \"the mean daily rainfall at Leeming in summer is probably about 2 mm\".",
      "Different samples from the same population contain different members, so they give **different statistics**. This is **sampling variability** — not a mistake.",
      "Larger samples vary less, so their inferences are more reliable. A sample of 18 days says much less than all 184.",
      "A **biased** method is different: it pushes the statistic the *same* wrong way every time (asking only people at a gym about exercise). A bigger biased sample is still biased."
    ] },
    { worked: { tag: "exam", title: "Two systematic samples of the same variable — what can be inferred?", src: "AS Nov 2021 · P2 Q3 · 4 marks",
      q: "Helen studies one qualitative variable in the large data set for Heathrow 2015. She starts with the reading for 3rd May and then takes every 10th reading. There are 3 outcomes, A, B and C, with frequencies 16, 2 and 1. **(a)** State the sampling technique Helen used. **(b)** Using your knowledge of the large data set, (i) suggest which variable was being studied, (ii) state the name of outcome A. George studies the same variable, starting on 5th May and taking every 10th reading; his frequencies are 16, 1, 1. The whole of the 2015 Heathrow data gives 155, 26, 3. **(c)** State what inference Helen and George could reliably make from their original samples about the outcomes of this variable.",
      steps: [
        { h: "(a) Every 10th reading from a starting point", m: "Systematic sampling.", mk: "B1", n: "Spelling is condoned (\"sysmatic\") but \"systemic\" is a different word and scores B0." },
        { h: "(b)(i) A qualitative variable with three outcomes, one very common", m: "Daily Mean Windspeed (the Beaufort conversion).", mk: "B1", n: "The LDS's qualitative variables are the Beaufort *descriptions* of windspeed and the cardinal wind direction. Direction would have up to 16 outcomes, so windspeed fits. \"Wind\" alone is B0." },
        { h: "(b)(ii) The modal outcome", m: "Outcome A is **Light**.", mk: "B1", n: "Most summer days at a UK station are Light (Beaufort 1–3). The two B marks are independent: \"rainfall\" and \"light\" scores B0 B1." },
        { h: "(c) Compare the samples with the truth", m: "Both samples show A as by far the most frequent outcome (16 of 19 and 16 of 18). The whole year has $\\frac{155}{184} = 84\\%$ A, so that inference is reliable.\nThe samples disagree about B and C (2 and 1 against 1 and 1) — they are too small to estimate the rare outcomes.", mk: "B1", n: "The mark is for \"A is the most frequent\" (or occurs around 80–90% of the time). Comments about B and C can follow, but the reliable inference is about A." }
      ], result: "(a) systematic (b) windspeed (Beaufort); A = Light (c) outcome A is the most common — about 80–90% of days" } },

    /* ---------------------------------------------------------------- Page 2 */
    { page: "Random sampling" },
    "A sampling method is **random** when every member of the population has a known, non-zero chance of selection and chance alone decides who is chosen.",
    "Random methods let you make **valid inferences** — the statistics are unbiased estimates. All three need a **sampling frame**.",
    { h: "2.1  Simple random sampling" },
    { callout: { t: "def", h: "Simple random sample", body: "A sample of size $n$ chosen so that **every possible sample of size $n$ has an equal chance** of being selected." } },
    { callout: { t: "memorise", h: "Describe it in three moves", body: [
      "1. **Sampling frame** — list every member of the population and number them $1$ to $N$.",
      "2. **Random numbers** — use a random number generator (calculator, computer, random number table) to produce $n$ different numbers between $1$ and $N$. Ignore repeats and numbers out of range.",
      "3. **Select** the members whose numbers were chosen.",
      "The lottery method (names in a hat) is also simple random sampling, for a small population."
    ] } },
    { kv: [
      ["Advantages", "Free from bias; easy and cheap for a small population with a frame; each member equally likely to be chosen."],
      ["Disadvantages", "Needs a sampling frame (not always possible); impractical for a large population; may by chance under-represent a group."]
    ] },
    { h: "2.2  Systematic sampling" },
    { callout: { t: "def", h: "Systematic sample", body: "Required members are chosen at **regular intervals** from an **ordered list**, starting at a **randomly chosen** point." } },
    { callout: { t: "memorise", h: "Describe it in three moves", body: [
      "1. **Interval** $k = \\dfrac{\\text{population size}}{\\text{sample size}}$ (round down if it is not whole).",
      "2. **Random start** — choose a random number from $1$ to $k$.",
      "3. **Every $k$th** member after that start, from the ordered list (the sampling frame).",
      "No random start means no random sample — just a fixed pattern."
    ] } },
    { fig: { w: 520, h: 110, items: frameRow(30, 6, 4, 34, "Population N = 30, sample n = 5, so k = 6; random start 4 → members 4, 10, 16, 22, 28"), cap: "A systematic sample: a random start in the first $k$ members, then every $k$th." } },
    { kv: [
      ["Advantages", "Simple and quick to use; suitable for a large population; spreads the sample evenly through the list."],
      ["Disadvantages", "Needs a sampling frame; **can introduce bias if the list has a pattern** that matches $k$ (every 7th day is always a Sunday)."]
    ] },
    { callout: { t: "warn", h: "The periodic-pattern trap", body: [
      "Sampling every 7th day from a daily list gives the same weekday every time; every 10th house on a street may always be on one side.",
      "If the variable depends on that pattern (weekend traffic, which side gets the sun), the sample is biased even with a random start."
    ] } },
    { h: "2.3  Stratified sampling" },
    { callout: { t: "def", h: "Stratified sample", body: "The population is divided into mutually exclusive **strata** (groups such as year groups, sexes, ages) and a **simple random sample** is taken from each stratum, the number from each being **in proportion to the size of the stratum**." } },
    { callout: { t: "formula", h: "Number from each stratum", body: [
      "$$\\text{number sampled from stratum} = \\frac{\\text{stratum size}}{\\text{population size}} \\times \\text{sample size}$$",
      "Round to whole numbers and check they add up to the sample size. If rounding breaks the total, adjust the stratum whose fraction was closest to .5."
    ] } },
    { fig: { w: 520, h: 120, items: [
      { poly: [[20, 30], [308, 30], [308, 66], [20, 66]], fill: "accent", alpha: 0.25, c: "accent" },
      { poly: [[308, 30], [500, 30], [500, 66], [308, 66]], fill: "accent2", alpha: 0.25, c: "accent2" },
      { text: [164, 48], t: "Year 12: 84 students", size: 12, c: "text" },
      { text: [404, 48], t: "Year 13: 56 students", size: 12, c: "text" },
      { text: [164, 88], t: "84/140 × 40 = 24 sampled", size: 12, c: "accent", b: true },
      { text: [404, 88], t: "56/140 × 40 = 16 sampled", size: 12, c: "accent2", b: true },
      { text: [260, 14], t: "Population 140 → sample of 40 (that is, 2/7 of each stratum)", size: 11.5, c: "text2" }
    ], cap: "Each stratum keeps its share: 60% of the population is Year 12, so 60% of the sample is Year 12." } },
    { kv: [
      ["Advantages", "The sample **reflects the population structure**; every group is guaranteed representation; gives a proportional representation of each group."],
      ["Disadvantages", "Needs a sampling frame **for each stratum**; the population must divide into clear, non-overlapping strata; more work than simple random sampling."]
    ] },
    { worked: { tag: "exam", title: "Describe how to take a stratified sample", src: "AS June 2019 · P2 Q1(a) · 3 marks",
      q: "A sixth form college has 84 students in Year 12 and 56 students in Year 13. The head teacher selects a stratified sample of 40 students, stratified by year group. Describe how this sample could be taken.",
      steps: [
        { h: "Make the sampling frames", m: "List (number) the students in each year group separately — a register for Year 12 numbered 1–84 and one for Year 13 numbered 1–56.", mk: "B1", n: "B1 for a numbered/labelled list for **each** year group. One combined list only works if Year 12s and 13s can be told apart." },
        { h: "Choose at random within each stratum", m: "Use random numbers (a random number generator) to select students from each list.", mk: "B1", n: "Randomness must be explicit. Describing a systematic sample here caps the answer at B1 B0 B0." },
        { h: "Proportional sizes", m: "$\\dfrac{84}{140} \\times 40 = 24$ from Year 12 and $\\dfrac{56}{140} \\times 40 = 16$ from Year 13.", mk: "B1", n: "Both numbers are needed. Show the fractions so the marker can see the proportionality." }
      ], result: "Number each year group's list; use random numbers to select 24 Year 12 and 16 Year 13 students." } },
    { worked: { tag: "example", title: "Stratified sizes that need rounding", src: "practice variant",
      q: "A club has 47 juniors, 85 adults and 28 seniors. A stratified sample of 25 is wanted. How many from each group?",
      steps: [
        { h: "Total and fractions", m: "$N = 47 + 85 + 28 = 160$\n$\\text{juniors } \\dfrac{47}{160} \\times 25 = 7.34, \\quad \\text{adults } \\dfrac{85}{160} \\times 25 = 13.28, \\quad \\text{seniors } \\dfrac{28}{160} \\times 25 = 4.375$" },
        { h: "Round and check the total", m: "$7 + 13 + 4 = 24$ — one short. The largest remaining fraction is the seniors' $0.375$, so take 5 seniors.\nSample: 7 juniors, 13 adults, 5 seniors $= 25$.", n: "State the adjustment. A total that does not equal the requested sample size loses the accuracy mark." }
      ], result: "7 juniors, 13 adults, 5 seniors" } },
    { worked: { tag: "example", title: "Describe a systematic sample from the large data set", src: "practice variant (LDS)",
      q: "Describe how to take a systematic sample of 23 days from the 184 days of data for Hurn in 2015.",
      steps: [
        { h: "Interval", m: "$k = \\dfrac{184}{23} = 8$" },
        { h: "Random start", m: "Use a random number generator to choose a starting day between the 1st and the 8th day (1st–8th May)." },
        { h: "Every 8th", m: "Then take every 8th day after that, in date order — e.g. a start of 5 gives days 5, 13, 21, …, 181.", n: "Three ingredients: the interval, the **random** start in the first $k$, and every $k$th. The dates are already an ordered list, so the LDS is its own sampling frame." }
      ], result: "$k = 8$; random start from days 1–8; then every 8th day" } },

    /* ---------------------------------------------------------------- Page 3 */
    { page: "Non-random sampling" },
    "Non-random methods do not give every member a known chance of selection.",
    "They are used when there is **no sampling frame** or when speed and cost matter more than representativeness — but the results cannot be relied on to generalise.",
    { h: "3.1  Quota sampling" },
    { callout: { t: "def", h: "Quota sample", body: "The population is divided into groups by a characteristic (age, sex, type). An interviewer **selects members until a quota for each group is filled**, usually in proportion to the group's share of the population. The choice of who to ask within a group is **not random**." } },
    { kv: [
      ["Advantages", "**No sampling frame needed**; quick, cheap and easy; the sample can still be made to represent the population's groups; easy to compare groups."],
      ["Disadvantages", "**Not random** — the interviewer chooses, which can introduce bias; non-responses are simply replaced; the strata may not reflect the population exactly; harder to make valid inferences."]
    ] },
    { callout: { t: "tip", h: "Quota vs stratified — the one-word difference", body: [
      "Both split the population into groups and both use proportional numbers.",
      "**Stratified** chooses *randomly* inside each group, from a sampling frame.",
      "**Quota** chooses *non-randomly* (whoever the interviewer finds), and needs no frame.",
      "A description of quota sampling that mentions random selection scores B0."
    ] } },
    { worked: { tag: "exam", title: "No sampling frame — so quota sampling", src: "AS June 2020 · P2 Q4(a)(b) · 3 marks",
      q: "A lake contains an estimated 450 mirror carp, 300 leather carp and 850 common carp. Tim wants to investigate the health of the fish and takes a sample of 160. **(a)** Give a reason why stratified random sampling cannot be used. **(b)** Explain how a sample of size 160 could be taken so that the estimated populations of each type of carp are fairly represented. You should state the name of the sampling method used.",
      steps: [
        { h: "(a) What stratified sampling needs", m: "It is not possible to have a sampling frame — the fish in a lake cannot be listed and numbered.", mk: "B1" },
        { h: "(b) Name the method and work out the quotas", m: "Quota sampling. The population is $450 + 300 + 850 = 1600$, so the sample is $\\dfrac{160}{1600} = \\dfrac{1}{10}$ of each type:\n$45$ mirror carp, $30$ leather carp, $85$ common carp.", mk: "M1", n: "M1 for quota and either the correct numbers or the idea of ignoring extra fish once a quota is full." },
        { h: "Say how the quota is filled", m: "Catch fish and record each one's type; once the quota for a type is full, return any further fish of that type and keep sampling until all three quotas are filled.", mk: "A1", n: "A1 needs both the correct numbers and the \"ignore once full\" idea." }
      ], result: "(a) no sampling frame (b) quota sampling: 45 mirror, 30 leather, 85 common; ignore fish of a type whose quota is full" } },
    { h: "3.2  Opportunity (convenience) sampling" },
    { callout: { t: "def", h: "Opportunity sample", body: "The sample is taken from the people (or items) that are **available at the time** the study is carried out and fit the criteria." } },
    { kv: [
      ["Advantages", "Easy, quick and cheap to carry out."],
      ["Disadvantages", "Unlikely to be representative; **highly dependent on the individual researcher**; likely to be biased (everyone near the door at 08 40 travelled at the same time)."]
    ] },
    { worked: { tag: "exam", title: "Name the method; offer a non-random alternative; name the census", src: "A-level June 2018 · P3 Q4(a)–(c) · 4 marks",
      q: "Charlie studies how long members of his company take to travel to the office. He stands by the office door from 08 40 to 08 50 one morning and asks workers, as they arrive, how long their journey was. **(a)** State the sampling method Charlie used. **(b)** State and briefly describe an alternative method of non-random sampling Charlie could have used to obtain a sample of 40 workers. Taruni asks every member of the company. **(c)** State the data selection process Taruni used.",
      steps: [
        { h: "(a) Whoever happened to arrive", m: "Opportunity (convenience) sampling.", mk: "B1" },
        { h: "(b) Name the alternative", m: "Quota sampling.", mk: "B1", n: "\"Stratified\", \"systematic\" or \"random\" score B0 B0 — the question asks for *non-random*." },
        { h: "Describe it with real groups", m: "e.g. split the workers by department (or by arrival time slot) and keep asking people in each group until its quota is filled — say 4 people in each 10-minute slot from 08 00 to 09 40.", mk: "B1", n: "The second B1 needs suitable categories. Any suggestion of choosing at random is B0." },
        { h: "(c) Everyone asked", m: "A census.", mk: "B1" }
      ], result: "(a) opportunity (b) quota — e.g. 4 people per 10-minute slot (c) census" } },
    { worked: { tag: "exam", title: "One disadvantage of quota sampling", src: "A-level Oct 2021 · P3 Q1(a) · 1 mark",
      q: "State one disadvantage of using quota sampling compared with simple random sampling.",
      steps: [
        { h: "Name the property that is lost", m: "It is not random, so it may be biased and it cannot be used reliably to make inferences about the population.", mk: "B1", n: "Allowed: not random, not representative, biased, cannot be used for inference, less accurate. **Not** allowed: any comment about time or cost (quota is quicker, so that is an advantage) or non-response." }
      ], result: "Not random — likely biased, so inferences are unreliable" } },

    /* ---------------------------------------------------------------- Page 4 */
    { page: "Choosing and critiquing" },
    { h: "4.1  The five methods side by side" },
    { table: { head: ["Method", "Random?", "Sampling frame?", "Strongest point", "Weakest point"], rows: [
      ["Simple random", "Yes", "Yes", "Unbiased; every sample equally likely", "Impractical for a large population"],
      ["Systematic", "Yes (random start)", "Yes", "Quick, spreads through the list", "Biased if the list has a period matching $k$"],
      ["Stratified", "Yes (within strata)", "Yes, for each stratum", "Reflects the population's structure", "Needs clear strata and their frames"],
      ["Quota", "No", "No", "No frame needed; represents groups", "Interviewer bias; no valid inference"],
      ["Opportunity", "No", "No", "Quick and cheap", "Unlikely to be representative"]
    ] } },
    { h: "4.2  A decision path" },
    { fig: { w: 520, h: 250, items: [
      { poly: [[170, 12], [350, 12], [350, 46], [170, 46]], c: "accent", fill: "accent", alpha: 0.12 },
      { text: [260, 29], t: "Is there a sampling frame?", size: 12, c: "text" },
      { line: [[215, 46], [110, 90]], arrow: true, c: "text2", label: "no", loff: -10 },
      { line: [[305, 46], [400, 90]], arrow: true, c: "text2", label: "yes", loff: 10 },
      { poly: [[20, 92], [200, 92], [200, 126], [20, 126]], c: "accent2", fill: "accent2", alpha: 0.12 },
      { text: [110, 109], t: "Non-random only", size: 12, c: "text" },
      { line: [[70, 126], [60, 168]], arrow: true, c: "text2" },
      { line: [[150, 126], [160, 168]], arrow: true, c: "text2" },
      { text: [55, 184], t: "groups matter →", size: 11, c: "text2" }, { text: [55, 200], t: "QUOTA", size: 12, c: "accent2", b: true },
      { text: [165, 184], t: "just quick →", size: 11, c: "text2" }, { text: [165, 200], t: "OPPORTUNITY", size: 12, c: "accent2", b: true },
      { poly: [[310, 92], [500, 92], [500, 126], [310, 126]], c: "good", fill: "good", alpha: 0.12 },
      { text: [405, 109], t: "Random methods", size: 12, c: "text" },
      { line: [[340, 126], [320, 168]], arrow: true, c: "text2" },
      { line: [[405, 126], [405, 168]], arrow: true, c: "text2" },
      { line: [[470, 126], [470, 168]], arrow: true, c: "text2" },
      { text: [315, 184], t: "distinct groups", size: 11, c: "text2" }, { text: [315, 200], t: "STRATIFIED", size: 12, c: "good", b: true },
      { text: [405, 184], t: "long list", size: 11, c: "text2" }, { text: [405, 200], t: "SYSTEMATIC", size: 12, c: "good", b: true },
      { text: [478, 184], t: "small N", size: 11, c: "text2" }, { text: [478, 200], t: "SIMPLE", size: 12, c: "good", b: true },
      { text: [260, 236], t: "Destructive test or huge population → never a census", size: 11.5, c: "danger", i: true }
    ], cap: "Start from the sampling frame: without one, only quota or opportunity sampling is possible." } },
    { h: "4.3  Critiquing a method in context" },
    "A critique earns its mark only when it names the **specific** way the sample could fail to represent the population in **this** context.",
    { table: { head: ["Generic (B0)", "In context (B1)"], rows: [
      ["\"It is biased.\"", "\"Asking only people arriving between 08 40 and 08 50 misses everyone who starts earlier or later, whose journeys may be longer.\""],
      ["\"The sample is too small.\"", "\"18 days cannot estimate how often the rare outcomes B and C happen; the two samples disagree about them.\""],
      ["\"Systematic sampling isn't random.\"", "\"Taking every 7th day always picks the same weekday, so weekday traffic patterns would bias it.\""],
      ["\"Use a bigger sample.\"", "\"Use stratified sampling by year group so both years are represented in proportion.\""]
    ] } },
    { callout: { t: "miscon", h: "\"A larger sample removes bias\"", body: [
      "A larger sample reduces **variability** (random error) but does not remove **bias**.",
      "An opportunity sample of 1000 gym-goers is still a sample of gym-goers."
    ] } },
    { worked: { tag: "variation", title: "Pick and justify a method", src: "practice variant",
      q: "A council wants the views of residents on a new cycle lane. It has the electoral register (names and addresses of all 12 000 adult residents), and it knows that 40% live in the town centre and 60% in the suburbs. Suggest a suitable sampling method for a sample of 300 and describe it.",
      steps: [
        { h: "Is there a frame? Do groups matter?", m: "Yes — the electoral register. Town-centre and suburban residents may well hold different views, so both groups should be represented in proportion." },
        { h: "Choose", m: "Stratified random sampling by area." },
        { h: "Describe", m: "Split the register into town-centre and suburban lists and number each.\nTake $0.4 \\times 300 = 120$ town-centre residents and $0.6 \\times 300 = 180$ suburban residents, each chosen with a random number generator." },
        { h: "Justify", m: "It reflects the population's structure, so neither area's view is over- or under-weighted, and it is random, so valid inferences can be made." }
      ], result: "Stratified by area: 120 town-centre and 180 suburban residents, random within each list" } },

    /* ---------------------------------------------------------------- Page 5 */
    { page: "The large data set" },
    "Edexcel publishes one **large data set (LDS)** of weather data and tells you to become familiar with it **before** the exam.",
    "Questions that say \"using your knowledge of the large data set\" award LDS marks you cannot get from the question alone.",
    { h: "5.1  What is in it" },
    { kv: [
      ["Period", "**1 May to 31 October** in **1987** and in **2015** — 184 days per station per year."],
      ["UK stations (5)", "**Camborne** (Cornwall, far south-west coast), **Hurn** (near Bournemouth, south coast), **Heathrow** (London, south-east), **Leeming** (North Yorkshire), **Leuchars** (Fife, east coast of Scotland)."],
      ["Overseas stations (3)", "**Beijing** (China), **Jacksonville** (Florida, USA), **Perth** (Western Australia — **southern hemisphere**, so May–October is its autumn and winter)."],
      ["One row", "One day at one station: a date and a value of each variable."]
    ] },
    { table: { head: ["Variable", "Units / form", "Recorded at"], rows: [
      ["Daily Mean Temperature", "°C, to 0.1", "all 8 stations"],
      ["Daily Total Rainfall (incl. solid precipitation — snow, hail)", "mm; **tr** = trace, less than 0.05 mm", "all 8"],
      ["Daily Mean Pressure", "hPa (hectopascals = millibars), values near 1000–1030", "all 8"],
      ["Daily Mean Windspeed", "knots (kn), and its **Beaufort** description", "all 8"],
      ["Daily Total Sunshine", "hours, to 0.1", "UK only"],
      ["Daily Maximum Relative Humidity", "%, up to 100", "UK only"],
      ["Daily Mean Total Cloud Cover", "**oktas** (eighths of the sky): whole numbers 0–8", "UK only"],
      ["Daily Mean Visibility", "**decametres (Dm)** — 1 Dm = 10 m", "UK only"],
      ["Daily Mean Wind Direction, Daily Maximum Gust (and its direction)", "direction in degrees as a bearing (0–360); gust in knots", "UK only"],
      ["Cardinal Wind Direction", "compass points (N, NE, E…); the direction the wind blows **from**", "UK only"]
    ] } },
    { callout: { t: "memorise", h: "Codes and conventions", body: [
      "**tr** — trace of rain, $0 < r \\le 0.05$ mm. Before calculating, it must be replaced by a value (0, or 0.025) or removed — this is **cleaning** the data.",
      "**n/a** — not available. Leave it out: the sample size $n$ is the number of real values, not 31.",
      "**Beaufort descriptions** of windspeed: Calm, **Light** (Beaufort 1–3, about 1–10 kn), **Moderate** (4, 11–16 kn), **Fresh** (5, 17–21 kn), Strong… At UK stations in summer \"Light\" is by far the most common.",
      "**Wind direction** is a bearing, so a value above 360 (such as 999) is an error, not an outlier to keep.",
      "**Qualitative** variables: the Beaufort description and the cardinal direction. Everything else is quantitative."
    ] } },
    { h: "5.2  The weather facts examiners use" },
    { table: { head: ["Fact", "How it is tested"], rows: [
      ["UK prevailing wind is from the **south-west / west**", "fewest days have wind from the **East** (AS June 2024)"],
      ["UK summer is warmer than May or October; autumn is windier", "\"which month had the highest mean windspeed?\" → **October** (AS June 2018)"],
      ["**Perth is in the southern hemisphere**: May–Oct runs from autumn through winter (coldest in July) into spring", "a 2015 Perth month with a mean well above the period mean → **October** (A-level 2024)"],
      ["**Great Storm of 15–16 October 1987** across southern England", "extreme gusts and pressure lows at Hurn, Heathrow, Camborne"],
      ["Beijing and Jacksonville have hot, wet summers (monsoon, hurricane season)", "high rainfall and temperature outliers in July–September"],
      ["Pressure is around **1000–1030 hPa**", "a sensible median ≈ 1015, range 10–50 (AS June 2022)"],
      ["Northern stations (Leeming, Leuchars) are cooler than southern (Camborne, Hurn)", "comparisons of mean temperature or rainfall"],
      ["In the northern hemisphere wind circulates **clockwise** round high pressure, **anticlockwise** round low", "assign wind directions to three stations (A-level Oct 2021)"]
    ] } },
    { worked: { tag: "exam", title: "Mean and standard deviation with n/a values; which month?", src: "AS June 2018 · P2 Q4(a)–(c) · 5 marks",
      q: "Helen studies the daily mean windspeed for Camborne in 1987. For one month the data are: windspeed 6, 7, 8, 9, 11, 12, 13, 14, 16 with frequencies 2, 3, 2, 2, 3, 1, 2, 1, 2, and 13 days recorded as n/a. **(a)** Calculate the mean. **(b)** Calculate the standard deviation and state the units. The means of the other five months are 7.58, 8.26, 8.57, 8.57 and 11.57. **(c)** Using your knowledge of the large data set, suggest, giving a reason, which month had the mean of 11.57.",
      steps: [
        { h: "Exclude n/a and total up", m: "$n = 18$ (the 13 n/a days are not data), $\\; \\sum fx = 184$, $\\; \\sum fx^2 = 2062$", n: "Treating n/a as 0 and using $n = 31$ gives $5.94$ — B0. This is the trap the question is built around." },
        { h: "(a) Mean", m: "$\\bar{x} = \\dfrac{184}{18} = 10.2$", mk: "B1" },
        { h: "(b) Standard deviation", m: "$\\sigma = \\sqrt{\\dfrac{2062}{18} - \\left(\\dfrac{184}{18}\\right)^2} = \\sqrt{10.06} = 3.17$", mk: "B1ft", n: "$s = 3.26$ (dividing by $n - 1$) is also accepted." },
        { h: "Units from the LDS", m: "knots (kn)", mk: "B1", n: "An LDS mark: windspeed is recorded in knots." },
        { h: "(c) Which month is windiest?", m: "October — at Camborne it is windier in the autumn (and October 1987 had the Great Storm).", mk: "B1 B1", n: "B1 for October (September is accepted) and B1 for the reason that autumn months are windier." }
      ], result: "(a) 10.2 (b) 3.17 knots (c) October — autumn is windier" } },
    { worked: { tag: "exam", title: "Which compass direction? What to do with 999?", src: "AS June 2024 · P2 Q2 · 3 marks",
      q: "Keith summarises the Daily Mean Wind Direction for Camborne in 1987 into four directions A, B, C and D (North, South, East and West in some order) with frequencies 22, 48, 56 and 58. **(a)** Using your knowledge of the large data set, state, giving a reason, which direction A represents. The entry for Hurn on 27th September 1987 was 999. **(b)** State, giving a reason, what Keith should do with this value.",
      steps: [
        { h: "(a) The least frequent direction", m: "A is **East**: the prevailing winds at Camborne (and in the UK) come from the south and west, so easterly winds are the least common.", mk: "B1", n: "East plus a reason based on UK/Camborne winds. Saying \"Camborne is in the north\" contradicts the reason — B0." },
        { h: "(b) Is 999 possible?", m: "Wind direction is a bearing, so it must lie between 0 and 360. 999 is impossible —", mk: "M1" },
        { h: "Clean it", m: "— so Keith should ignore (remove) the value.", mk: "A1", n: "Say what to *do*, not just that it is an anomaly." }
      ], result: "(a) East — prevailing UK winds are south-westerly (b) remove it: a bearing cannot exceed 360" } },
    { worked: { tag: "exam", title: "Census, then counting days from LDS knowledge", src: "AS June 2025 · P2 Q2(a)(c) · 3 marks",
      q: "Jasper treats the large data set for Perth in 2015 as the population and uses all of the data. **(a)** Write down the name given to this method of data collection. Every Daily Mean Windspeed for Perth in 2015 is classed as either Light or Moderate. A box plot of Daily Mean Pressure for Light days is based on 161 days, and the Moderate box plot shows that a quarter of Moderate days had pressure of 1028 hPa or higher. **(c)** Using your knowledge of the large data set, estimate the number of Moderate days with a Daily Mean Pressure of 1028 hPa or higher.",
      steps: [
        { h: "(a) All of the population", m: "Census.", mk: "B1" },
        { h: "(c) How many days are there?", m: "The LDS covers May–October: $184$ days. Moderate days: $184 - 161 = 23$.", mk: "M1", n: "The LDS mark: knowing 184 (anything from 180 to 185 is allowed)." },
        { h: "Upper quarter", m: "$23 \\times 0.25 = 5.75$, so about 6 days.", mk: "A1", n: "1028 is the upper quartile on the Moderate box plot, so 25% of Moderate days lie at or above it. 5 or 6 accepted." }
      ], result: "(a) census (c) about 6 days" } },
    { worked: { tag: "exam", title: "Sampling, cleaning and sample-versus-population for one LDS study", src: "A-level June 2025 · P3 Q4(a)(b)(f) · 4 marks",
      q: "Kay studies Daily Total Sunshine and Daily Total Rainfall for Leeming in 2015. She starts with 5th May and then selects every 10th day. **(a)** State the name of the sampling technique. **(b)** Using your knowledge of the large data set, explain how Kay might need to clean these data before finding a regression line. Her teacher uses all the data for these variables for Leeming in 2015 as a sample in a hypothesis test. **(f)** Describe (i) the sample, (ii) a possible population.",
      steps: [
        { h: "(a)", m: "Systematic sampling.", mk: "B1" },
        { h: "(b) The rainfall codes", m: "The rainfall data may contain **tr** (trace) entries, which need a numerical value substituting (or the days removing) before any calculation.", mk: "B1", n: "Any mention of \"tr\" or trace in the rainfall scores; n/a is ignored." },
        { h: "(f)(i) The sample", m: "The rainfall and sunshine for every day from May to October 2015 at Leeming.", mk: "B1", n: "\"Rainfall and sunshine for Leeming in 2015\" is B0 — that could be the population. The point is the May–October window." },
        { h: "(f)(ii) A possible population", m: "e.g. rainfall and sunshine at Leeming for all of 2015, or for May–October in every year, or for May–October across the UK.", mk: "B1", n: "Any population of which the teacher's data is a subset." }
      ], result: "(a) systematic (b) replace or remove the tr entries (f) May–Oct 2015 at Leeming; e.g. all of 2015 at Leeming" } },
    { worked: { tag: "exam", title: "Which variable did Ming select by mistake? Which month?", src: "A-level June 2024 · P3 Q3 · 6 marks",
      q: "Ming wants summary statistics for Daily Mean Air Temperature, $x$ °C, for Perth in 2015 from the large data set but selects the wrong variable, which has mean 5.3 and standard deviation 12.4. **(a)** Using your knowledge of the large data set, suggest which variable Ming selected. The correct data are summarised by $n = 184$, $\\sum x = 2801.2$, $\\sum x^2 = 44\\,695.4$. **(b)** Calculate the mean and standard deviation. One month for Perth in 2015 has mean 19.4 and standard deviation 2.83. **(c)** Suggest, giving a reason, which month these data may have come from.",
      steps: [
        { h: "(a) Small mean, huge spread", m: "Daily Total Rainfall — most days have little or none, a few have a great deal, so the standard deviation is bigger than the mean.", mk: "B1", n: "Mean windspeed is also accepted. Perth has only rainfall, pressure, windspeed and temperature recorded, and pressure (≈1018) cannot have mean 5.3." },
        { h: "(b) Mean", m: "$\\bar{x} = \\dfrac{2801.2}{184} = 15.2$", mk: "B1" },
        { h: "Standard deviation", m: "$\\sigma = \\sqrt{\\dfrac{44\\,695.4}{184} - 15.22^2} = \\sqrt{11.14} = 3.34$", mk: "M1 A1", n: "$s = 3.35$ is allowed. Keep the unrounded mean in the calculator." },
        { h: "(c) A hot Perth month", m: "19.4 is well above the May–October mean of 15.2, so it is one of Perth's warmer months. Perth is in the southern hemisphere, so it is warming into spring: **October**.", mk: "M1 A1", n: "M1 for \"higher than average / a warmer month\"; A1 for October only. September (actual mean 15.6) scores A0." }
      ], result: "(a) rainfall (b) $\\bar{x} = 15.2$ °C, $\\sigma = 3.34$ °C (c) October" } },
    { worked: { tag: "exam", title: "A trace value, and why a binomial model can fail", src: "A-level June 2022 · P3 Q3(a)(d) · 2 marks",
      q: "Dian uses the large data set to investigate Daily Total Rainfall, $r$ mm, for Camborne. **(a)** Write down how a value of $0 < r \\le 0.05$ is recorded in the large data set. Dian estimates the proportion of days with no rain at Camborne in 1987 to be 0.27. **(d)** Explain why B(14, 0.27) might not be a reasonable model for the number of days without rain during a 14-day summer event.",
      steps: [
        { h: "(a)", m: "As **tr** (trace).", mk: "B1" },
        { h: "(d) Check the binomial conditions", m: "Dry days are not independent — weather comes in spells, so a dry day is more likely to follow a dry day. (Also, the probability of a dry day varies with the season, so it is not constant.)", mk: "B1", n: "Any one failed condition, stated in context, earns the mark." }
      ], result: "(a) tr (d) days are not independent (dry spells), and $p$ is not constant through the summer" } },
    { worked: { tag: "variation", title: "Unit, value and clean — the short LDS marks", src: "practice variant (AS June 2020 Q2(a), AS June 2022 Q4 shape)",
      q: "**(a)** Daily Mean Visibility is recorded in decametres to the nearest 100. What range of distances in metres does a recorded value of 0 represent? **(b)** A box plot of Daily Mean Pressure for one month has its median value missing. Suggest a sensible median and a sensible range.",
      steps: [
        { h: "(a) Decametres", m: "Recorded 0 means less than 50 Dm, and 1 Dm = 10 m, so 0 to 500 m.", n: "The mark is for realising the recorded value is a *maximum* distance, given in metres." },
        { h: "(b) Pressure", m: "A median around 1015 hPa (anything from 990 to 1030 is sensible), and a range between 10 and 50 hPa." }
      ], result: "(a) 0–500 m (b) median ≈ 1015 hPa, range ≈ 10–50 hPa" } },

    /* ---------------------------------------------------------------- Page 6 */
    { page: "Exam toolkit" },
    { h: "Command words" },
    { table: { head: ["The question says", "It wants"], rows: [
      ["**State / Name** the sampling method", "the name alone — \"systematic\", \"quota\", \"census\""],
      ["**Describe how** the sample could be taken", "frame, random selection, numbers from each group — each a mark"],
      ["**Give a reason why** a method cannot be used", "the missing ingredient, usually **no sampling frame**"],
      ["**State one advantage / disadvantage**", "a property of the method, in comparison with the named alternative"],
      ["**Using your knowledge of the large data set**", "a fact from the LDS — station, unit, season, code — not from the question"],
      ["**Suggest**", "a sensible answer with a reason; several answers may be accepted"],
      ["**Explain**", "a reason linked to the context, not a definition"]
    ] } },
    { h: "Where the marks go" },
    { ul: [
      "**Stratified description**: frame for each stratum + random numbers + proportional sizes. Missing the word *random* loses a mark.",
      "**Systematic description**: $k$ = population ÷ sample, **random** start in 1 to $k$, every $k$th.",
      "**Quota description**: groups + quota numbers + \"stop when a quota is full\"; never the word random.",
      "**Census vs sample**: say *completely* accurate; for the downside, cost or time — or destruction.",
      "**LDS cleaning**: tr → a value; n/a → excluded from $n$; impossible values (bearing 999) → removed.",
      "**Sample vs population**: the sample is the data actually used; the population is the bigger set it was drawn from."
    ] },
    { h: "Misconceptions" },
    { ul: [
      "**\"Systematic is not random\"** — with a random start it is a random method.",
      "**\"Quota sampling is stratified sampling\"** — quota has no frame and no randomness.",
      "**\"Bigger samples remove bias\"** — they only reduce variability.",
      "**\"n/a means zero\"** — it means missing; zero is a real value.",
      "**\"Wind direction is where the wind goes\"** — it is where the wind comes **from**."
    ] },
    { h: "Calculator (fx-991CW)" },
    { kv: [
      ["Random integers", "**CATALOG → Probability → RanInt#(a, b)**, then EXE repeatedly: RanInt#(1, 140) gives frame numbers for a simple random sample. Skip repeats."],
      ["Random start", "RanInt#(1, k) for the start of a systematic sample."]
    ] },
    { callout: { t: "mnemonic", h: "\"Frame, Random, Proportion\"", body: "The three marks of a stratified description, in the order you should write them. Drop *Random* and it becomes quota; drop *Frame* and it cannot be done." } }
  ],
  flashcards: [
    ["Define a population.", "The whole set of items that are of interest."],
    ["Define a census.", "Data collected from every member of the population."],
    ["What is a sampling frame?", "A (numbered) list of every member of the population that can be sampled."],
    ["Census — one advantage, one disadvantage?", "Completely accurate; but time-consuming/expensive (or destroys the items if testing is destructive)."],
    ["Describe a simple random sample of 20 from 300.", "Number the population 1–300; use a random number generator to pick 20 different numbers; select those members."],
    ["Describe a systematic sample of 30 from 180.", "$k = 180 \\div 30 = 6$; random start between 1 and 6; then every 6th member of the list."],
    ["Describe a stratified sample.", "Split into strata; list each; simple random sample from each in proportion to its size."],
    ["Stratified sample of 40 from 84 Y12 and 56 Y13?", "$\\frac{84}{140} \\times 40 = 24$ and $\\frac{56}{140} \\times 40 = 16$."],
    ["Why can't stratified sampling be used for fish in a lake?", "There is no sampling frame — the fish cannot be listed."],
    ["Quota sampling — how is it done?", "Split into groups; an interviewer fills a quota for each group, choosing non-randomly; ignore extras once a quota is full."],
    ["Quota sampling — one advantage, one disadvantage?", "No sampling frame needed, quick and cheap; not random so possibly biased and no valid inference."],
    ["Opportunity sampling?", "Sampling whoever is available at the time; quick and cheap but unlikely to be representative."],
    ["Systematic sampling — main risk?", "A periodic pattern in the list that matches the interval $k$ biases the sample."],
    ["Why can two samples from one population disagree?", "Sampling variability: different members give different statistics. Larger samples vary less."],
    ["LDS: which months and years?", "1 May – 31 October, 1987 and 2015 (184 days)."],
    ["LDS: the 5 UK stations?", "Camborne, Hurn, Heathrow, Leeming, Leuchars."],
    ["LDS: the 3 overseas stations?", "Beijing, Jacksonville, Perth (southern hemisphere)."],
    ["LDS: what does 'tr' mean?", "Trace of rain: $0 < r \\le 0.05$ mm."],
    ["LDS: units of windspeed, pressure, cloud cover, visibility?", "Knots; hPa; oktas (0–8); decametres."],
    ["LDS: which direction is wind least often from in the UK?", "East (prevailing winds are south-westerly)."],
    ["LDS: what is the Beaufort 'Light' category?", "Beaufort 1–3, about 1–10 knots — the most common summer category at UK stations."]
  ],
  quiz: [
    { q: "Picking the first 40 students through the gate is:", opts: ["simple random", "systematic", "opportunity", "quota"], ans: 2, why: "Whoever is available at the time." },
    { q: "Every 20th name from a random start in 1–20 is:", opts: ["systematic", "stratified", "quota", "simple random"], ans: 0, why: "Regular interval, random start." },
    { q: "A sample of 50 from strata of 300 and 200, stratified, takes from the larger stratum:", opts: ["30", "25", "20", "300"], ans: 0, why: "$\\frac{300}{500} \\times 50 = 30$." },
    { q: "Which method needs no sampling frame?", opts: ["quota", "stratified", "systematic", "simple random"], ans: 0, why: "Quota and opportunity need none." },
    { q: "Testing every battery until it fails is unsuitable for a census because:", opts: ["it destroys the population", "it is biased", "it is random", "it needs a frame"], ans: 0, why: "Destructive testing." },
    { q: "In the LDS, 'n/a' days should be:", opts: ["excluded from $n$", "counted as 0", "replaced by the mean", "counted as tr"], ans: 0, why: "Not available means missing." },
    { q: "A Perth 2015 month with mean temperature 19.4 °C (May–Oct mean 15.2 °C) is most likely:", opts: ["October", "July", "August", "June"], ans: 0, why: "Southern hemisphere: June–August is winter; October is spring." },
    { q: "A larger opportunity sample:", opts: ["reduces variability but not bias", "removes bias", "becomes random", "becomes a census"], ans: 0, why: "Bias is about the method." }
  ]
};


/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes));
});
})(window.KOS_CONTENT);
