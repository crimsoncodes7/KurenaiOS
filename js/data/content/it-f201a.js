/* Kurenai OS — deep content: OCR Cambridge Advanced National in IT: Data
   Analytics (H119), Unit F201 Big data and machine learning — Topic Area 1,
   The scope of managing big data (F201 1.1–1.4), at full depth (roadmap 5.19
   item 1). Written from the specification (Version 5) and the Sample
   Assessment Material: every worked exam answer is OUR question, modelled on
   the SAM's shapes (1-mark State, 2-mark identify + apply, 6-mark Analyse,
   9-mark Discuss) and marked in OCR's own style. Scenarios are fictional. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---- small figure helpers (the style of cs-p1-42b.js) ---- */
function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }
function arrow(x1, y1, x2, y2, label, o) {
  o = o || {};
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: true, c: o.c || "accent2", w: o.w || 1.6, dash: o.dash }];
  if (label) it.push(txt((x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0), label, { size: 10, c: o.c || "accent2" }));
  return it;
}
/* a labelled box: lines[0] bold, the rest small */
function box(x, y, w, h, lines, o) {
  o = o || {};
  var col = o.col || "accent", it = [{ poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill: col, alpha: o.alpha == null ? 0.14 : o.alpha, c: col, w: 1.3, dash: o.dash }];
  lines = [].concat(lines);
  var top = y + h / 2 - (lines.length - 1) * 7;
  lines.forEach(function (t, i) { it.push(txt(x + w / 2, top + i * 14, t, { b: i === 0, size: i === 0 ? (o.size || 11) : 9.5, c: i === 0 ? "text" : "text2" })); });
  return it;
}
function line(x1, y1, x2, y2, o) { o = o || {}; return { line: [[x1, y1], [x2, y2]], c: o.c || "line", w: o.w || 1.2, dash: o.dash }; }

/* =====================================================================
   F201 1.1  The six characteristics (6Vs) and the six analysis steps
   ===================================================================== */
function vWheelFig() {
  var it = [];
  it.push({ circle: [320, 150, 54], fill: "it", alpha: 0.16, c: "it", w: 1.6 });
  it.push(txt(320, 142, "BIG DATA", { b: true, size: 13, c: "text" }));
  it.push(txt(320, 160, "the 6Vs", { size: 10, c: "text2" }));
  var L = [["Volume of data", "How much?", 40], ["Variety of data types", "What kinds?", 130], ["Velocity of streamed data", "How fast?", 220]];
  var R = [["Value of data", "Worth it?", 40], ["Veracity of data", "Can we trust it?", 130], ["Variability of data", "inconsistencies: steady?", 220]];
  L.forEach(function (v) { it.push(line(212, v[2] + 20, 268, 150)); it = it.concat(box(20, v[2], 192, 40, [v[0], v[1]], { col: "accent" })); });
  R.forEach(function (v) { it.push(line(428, v[2] + 20, 372, 150)); it = it.concat(box(428, v[2], 192, 40, [v[0], v[1]], { col: "accent2" })); });
  it.push(txt(116, 284, "SIZE AND SHAPE of the data", { b: true, size: 10, c: "accent" }));
  it.push(txt(524, 284, "QUALITY AND WORTH of the data", { b: true, size: 10, c: "accent2" }));
  return { fig: { w: 640, h: 300, items: it, cap: "The 6Vs with the specification's full names and the question each one asks. The first three describe how big and fast the data is; the last three describe how useful, trustworthy and stable it is." } };
}
function pipelineFig() {
  var it = [], names = [["1 Collection", "raw data in"], ["2 Storing", "keep it safe"], ["3 Cleaning", "fix quality"], ["4 Mining", "find patterns"], ["5 Analysis", "make meaning"], ["6 Consumption", "act on it"]];
  names.forEach(function (n, i) {
    var x = 8 + i * 106;
    it = it.concat(box(x, 70, 94, 46, n, { col: i < 2 ? "it" : (i === 2 ? "danger" : (i < 5 ? "accent3" : "accent2")), size: 10.5 }));
    if (i < 5) it = it.concat(arrow(x + 95, 93, x + 105, 93, null, { c: "text2", w: 1.4 }));
  });
  it.push(line(8, 40, 208, 40, { c: "it", w: 2 }));
  it.push(txt(108, 28, "Volume · Variety · Velocity press here", { size: 9.5, c: "it" }));
  it.push(line(220, 40, 314, 40, { c: "danger", w: 2 }));
  it.push(txt(267, 28, "Veracity fixed here", { size: 9.5, c: "danger" }));
  it.push(line(326, 40, 632, 40, { c: "accent2", w: 2 }));
  it.push(txt(479, 28, "Value is created here (Variability: re-check)", { size: 9.5, c: "accent2" }));
  it = it.concat(arrow(590, 128, 54, 128, null, { c: "muted", w: 1.2, dash: true }));
  it.push(txt(322, 144, "new data keeps arriving: the cycle repeats", { size: 9.5, c: "muted" }));
  return { fig: { w: 640, h: 160, items: it, cap: "The six steps for analysing big data, in order, with the characteristics that matter most at each stage." } };
}

C["it:F201.1.1"] = {
  notes: [
    { h: "The six characteristics (6Vs) — the whole topic on one page" },
    { h: "What the specification asks (F201 1.1)" },
    { kv: [
      [
        "Teaching content",
        "**Volume of data · Variety of data types · Velocity of streamed data · Value of data · Veracity of data · Variability of data inconsistencies**; and the **six steps for analysing big data**: data collection, data storing, data cleaning, data mining, data analysis, data consumption."
      ],
      [
        "To include (6Vs)",
        "what each characteristic is · how each one helps to define big data · the purpose of each · when each can be used."
      ],
      [
        "To include (steps)",
        "what is involved in each step · the role of each step in managing big data · when each step can be used."
      ],
      [
        "Does not include",
        "nothing is excluded here — but the techniques inside steps 3–5 are taught in 2.2 (cleaning), 2.3 (mining) and 2.6 (analytic techniques)."
      ]
    ] },
    { table: { head: ["Question shape", "Command word", "Marks", "Nearest evidence"], rows: [
      ["Name the characteristic a situation shows", "State", "1", "SAM Q1(a)"],
      ["Ways volume makes data big", "State two", "2", "SAM Q1(b)"],
      ["Why a characteristic matters to the organisation", "Explain", "2", "identify (1) + apply (1)"],
      ["What happens in a step / its role", "Describe / Explain", "1–2", "spec 1.1"],
      ["How the steps or Vs affect a decision", "Analyse", "6", "levels of response"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The 6Vs**: each characteristic in full.", "**Telling the Vs apart**: the confusable pairs and data sizes.", "**The six analysis steps**: what, role, when.", "**Steps and Vs together**: one data set through the pipeline.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The 6Vs" },
    { callout: { t: "def", h: "Big data", body: "Data sets so **large, fast-arriving or varied** that ordinary tools (one spreadsheet, one database on one server) cannot capture, store and analyse them in a useful time. The **6Vs** are the six characteristics used to decide whether data is big data and what it will need." } },
    vWheelFig(),
    { h: "Volume of data" },
    { kv: [
      [
        "What it is",
        "the **amount** of data generated, collected and stored — measured in terabytes (TB), petabytes (PB) and beyond."
      ],
      [
        "How it defines big data",
        "the amount that **exists**, the **initial size** collected and how fast the amount is **growing** are too great for one computer or a traditional database."
      ],
      [
        "Purpose",
        "tells the organisation how much **storage** and **processing power** it needs (scalable, distributed, cloud) and what that will cost."
      ],
      [
        "When it is used",
        "planning storage; deciding whether to keep or archive old data; when data builds up over years (transactions, CCTV, sensor logs)."
      ],
      ["Example", "a supermarket keeping every basket from every till for ten years."]
    ] },
    { h: "Variety of data types" },
    { kv: [
      [
        "What it is",
        "the **range of types and formats** of data and the number of **sources** it comes from."
      ],
      [
        "The types",
        "**structured** (tables, transactions) · **semi-structured** (emails, XML, web pages) · **unstructured** (images, video, audio, free text) — see 2.1."
      ],
      [
        "How it defines big data",
        "mixed data cannot be held in one fixed table design (schema), so traditional relational tools are not enough on their own."
      ],
      [
        "Purpose",
        "tells the organisation what **storage** (e.g. a data lake) and how much **preparation** it needs to combine sources."
      ],
      [
        "When it is used",
        "whenever data is combined from different places — or one online form collects text, dates, numbers, email addresses and photos."
      ]
    ] },
    { h: "Velocity of streamed data" },
    { kv: [
      [
        "What it is",
        "the **speed** at which data is generated and **streamed** in, and how quickly it must be processed to be useful."
      ],
      [
        "How it defines big data",
        "data arrives continuously, in real time, faster than it can be saved and analysed later in batches."
      ],
      [
        "Purpose",
        "decides between **real-time (stream) processing** and **batch processing**, and how up to date decisions can be."
      ],
      [
        "When it is used",
        "when data loses value in seconds or minutes: card fraud checks, live traffic, stock levels, sensor alarms."
      ],
      ["Example", "card payments from 300 stores arriving every second during a Saturday rush."]
    ] },
    { h: "Value of data" },
    { kv: [
      [
        "What it is",
        "the **worth** of the data to the organisation — the useful insight, money saved or income it can lead to."
      ],
      [
        "How it defines big data",
        "big data is only worth collecting if it can be turned into **useful information**; huge amounts of data with no insight are a cost, not an asset."
      ],
      [
        "Purpose",
        "justifies the **cost** of collecting, storing and analysing; links data to business **goals**; decides what to keep."
      ],
      [
        "When it is used",
        "deciding whether to start an analytics project; choosing which sources to collect; reviewing retention."
      ],
      ["Example", "weather forecasts joined to sales data cut waste on salads and barbecue food."]
    ] },
    { h: "Veracity of data" },
    { kv: [
      [
        "What it is",
        "the **accuracy, quality and trustworthiness** of the data — is it correct, complete, consistent and from a reliable source?"
      ],
      [
        "How it defines big data",
        "data from many sources at high volume is often duplicated, incomplete, biased or fake, so its quality cannot be assumed."
      ],
      [
        "Purpose",
        "shows how much **cleaning and validation** is needed and how much **confidence** to place in the results."
      ],
      [
        "When it is used",
        "data typed in by the public, social media, sensors that drift, data merged from different systems — and before any decision is made from results."
      ],
      ["Example", "customers enter a fake birthday on a loyalty form to get a free cake."]
    ] },
    { h: "Variability of data inconsistencies" },
    { kv: [
      [
        "What it is",
        "how much the data is **inconsistent or changes over time** — in its flow (peaks and troughs), its format, or its **meaning** in context."
      ],
      [
        "How it defines big data",
        "flows are irregular and meanings shift, so fixed rules, fixed capacity and models trained once stop working."
      ],
      [
        "Purpose",
        "warns the organisation to plan for **peaks**, re-check cleaning rules and **re-train** models, and to read data in context."
      ],
      [
        "When it is used",
        "seasonal trading (Christmas, Black Friday), trending topics on social media, bursts of sensor data, a word changing meaning (“sick” as praise)."
      ],
      [
        "Not the same as",
        "Variety (how many different kinds) — Variability is about **change and inconsistency**."
      ]
    ] },

    { page: "Telling the Vs apart" },
    { table: { head: ["Characteristic", "The question it asks", "Clue words in a scenario", "What it drives"], rows: [
      ["Volume of data", "How much?", "millions of records, years of history, TB/PB, growing", "storage size, distributed or cloud storage"],
      ["Variety of data types", "What kinds?", "text, images, video, forms, many sources", "flexible storage, data preparation"],
      ["Velocity of streamed data", "How fast?", "live, every second, real time, streamed", "real-time vs batch processing"],
      ["Value of data", "Is it worth it?", "profit, cost, insight, decision, goal", "whether to fund it; what to keep"],
      ["Veracity of data", "Can we trust it?", "errors, fake, missing, duplicates, bias", "cleaning and validation"],
      ["Variability of data inconsistencies", "Does it stay steady?", "seasonal, peaks, changes over time, meaning", "spare capacity, re-training models"]
    ] } },
    { callout: { t: "info", h: "How big is “big”? Units of volume", body: [
      "Each step is ×1,000 (decimal). Computing also uses ×1,024 steps (GiB, TiB); either is accepted in F201.",
      "There is no fixed size at which data becomes “big”: it is big when it outgrows the organisation's ordinary tools."
    ] } },
    { table: { head: ["Unit", "Size", "Feels like"], rows: [
      ["Gigabyte (GB)", "1,000 MB", "a film in standard definition"],
      ["Terabyte (TB)", "1,000 GB", "a home external hard drive"],
      ["Petabyte (PB)", "1,000 TB", "a large organisation's data store"],
      ["Exabyte (EB)", "1,000 PB", "a cloud provider's data centres"],
      ["Zettabyte (ZB)", "1,000 EB", "the world's data, measured in ZB"]
    ] } },
    { worked: { tag: "example", title: "Which V dominates here, and why?", q: "Harbour Foods, a supermarket chain with 320 UK stores and a loyalty app, lists six things its data team has noticed. Name the characteristic each one shows.",
      steps: [
        { m: "Card payments from every store arrive every second and stock must update straight away → **Velocity of streamed data** (speed of arrival, needs real-time processing).", mk: "1" },
        { m: "One project mixes till records, app reviews, CCTV clips and delivery-van GPS → **Variety of data types** (structured, unstructured and semi-structured together).", mk: "1" },
        { m: "Ten years of baskets need petabytes of storage and grow every day → **Volume of data**.", mk: "1" },
        { m: "Some members typed a fake birthday to get a free cake → **Veracity of data** (the data is not accurate).", mk: "1" },
        { m: "Barbecue food sales treble in a heatwave and collapse in rain → **Variability of data inconsistencies** (the flow changes over time).", mk: "1" },
        { m: "Joining weather data to sales cut food waste → **Value of data** (it produced a useful, money-saving insight).", mk: "1", n: "Always give the reason from the scenario, not just the label." }
      ], result: "Velocity · Variety · Volume · Veracity · Variability · Value",
      try: [{ grid: { cols: ["What the gym chain notices", "Characteristic (one word)"], rows: [
        ["Smart treadmills send a reading every second", "Velocity"],
        ["Membership forms hold text, dates, photos and typed injury notes", "Variety"],
        ["Eight years of check-ins fill 40 TB and keep growing", "Volume"],
        ["Some members give a false postcode to get a cheaper gym", "Veracity"],
        ["Check-ins double every January then fall away by March", "Variability"],
        ["Class data shows which timetable change won back members", "Value"]
      ], given: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]], cap: "Type the one-word V. In the exam write the specification's full name (e.g. Velocity of streamed data)." } }] } },
    { callout: { t: "warn", h: "The confusable pairs", body: [
      "**Variety vs Variability** — Variety = how many *different kinds* of data; Variability = how much the data *changes or is inconsistent over time*.",
      "**Velocity vs processing speed** — Velocity is how fast data *arrives*; the system must keep pace with it.",
      "**Value vs Volume** — more data is not more value; value is the *useful insight*, which may come from a small part of the data.",
      "**Veracity vs Validity** — Veracity is the *trustworthiness* of the data as a whole; validation (2.2) is one way of improving it."
    ] } },

    { page: "The six analysis steps" },
    pipelineFig(),
    { h: "1 · Data collection" },
    { kv: [
      [
        "What is involved",
        "gathering raw data from its sources — forms, transactions, sensors, GPS, social media, surveys (the capture methods of 1.3)."
      ],
      [
        "Role in managing big data",
        "supplies the raw material: what is not collected cannot be analysed; collecting the right, relevant data (and lawfully, under UK GDPR) sets the limit on every later step."
      ],
      ["When it is used", "at the start of a project and continuously for streamed sources."]
    ] },
    { h: "2 · Data storing" },
    { kv: [
      [
        "What is involved",
        "saving the data securely where it can be reached again — databases, data warehouses, data lakes, cloud storage (2.4)."
      ],
      [
        "Role in managing big data",
        "keeps the data **available, secure and backed up**; the storage chosen must scale with Volume and hold the Variety of types."
      ],
      [
        "When it is used",
        "as soon as data is collected, before it is cleaned; reviewed as the data grows."
      ]
    ] },
    { h: "3 · Data cleaning" },
    { kv: [
      [
        "What is involved",
        "finding and fixing problems: removing duplicates and irrelevant data, fixing missing data and structural errors, converting types, validating (2.2)."
      ],
      [
        "Role in managing big data",
        "raises **Veracity** so the results can be trusted — “garbage in, garbage out”."
      ],
      [
        "When it is used",
        "after storing and before mining; again whenever new data is added. Often the longest step."
      ]
    ] },
    { h: "4 · Data mining" },
    { kv: [
      [
        "What is involved",
        "searching large data sets with software and algorithms to **discover patterns, trends and relationships** that are not obvious (descriptive, diagnostic, predictive, prescriptive — 2.3)."
      ],
      [
        "Role in managing big data",
        "turns a mass of clean data into **candidate patterns** worth investigating."
      ],
      ["When it is used", "once the data is clean and stored and there is a question to answer."]
    ] },
    { h: "5 · Data analysis" },
    { kv: [
      [
        "What is involved",
        "examining and **interpreting** the patterns with analytic techniques (regression, cluster, time series… — 2.6) to answer the question and reach conclusions."
      ],
      [
        "Role in managing big data",
        "turns patterns into **information and insight** that support a decision; checks a pattern is real and useful, not chance."
      ],
      ["When it is used", "after mining, when the organisation needs an answer or a prediction."]
    ] },
    { h: "6 · Data consumption" },
    { kv: [
      [
        "What is involved",
        "the results are **used**: shared with decision-makers through reports, dashboards and visualisations (F205), or fed into systems such as recommendations."
      ],
      [
        "Role in managing big data",
        "delivers the **Value** — an insight nobody acts on earns nothing; feedback starts the next cycle."
      ],
      ["When it is used", "at the end of the analysis, and continuously where dashboards update live."]
    ] },

    { page: "Steps and Vs together" },
    { table: { head: ["Step", "The Vs it must cope with", "If this step is skipped or done badly…"], rows: [
      ["Data collection", "Velocity, Variety", "gaps or biased samples; the wrong data for the question"],
      ["Data storing", "Volume, Variety, Velocity", "data lost, slow to reach, or not secure"],
      ["Data cleaning", "Veracity, Variability", "duplicates and errors give false results"],
      ["Data mining", "Volume, Variety", "patterns stay hidden in the mass of data"],
      ["Data analysis", "Value, Variability", "patterns misread; chance mistaken for a trend"],
      ["Data consumption", "Value", "insight never reaches the people who decide"]
    ] } },
    { worked: { tag: "example", title: "One question through the six steps", q: "Harbour Foods wants to know which stores should open an hour later on Sundays. Show how each step of analysing big data would be used.",
      steps: [
        { h: "Collection", m: "Gather till transactions with time stamps, loyalty-app visits and footfall-counter readings for every store." },
        { h: "Storing", m: "Load them into the company's cloud data warehouse, where two years of history are kept." },
        { h: "Cleaning", m: "Remove duplicate transactions, fix stores whose clocks were wrong after the change to BST, fill gaps where a counter failed." },
        { h: "Mining", m: "Search for patterns: Sunday sales by hour, by store type and by season." },
        { h: "Analysis", m: "Compare the last hour's sales with the cost of staying open; find the stores where the hour loses money all year round." },
        { h: "Consumption", m: "A dashboard for the regional managers lists the stores, with a map and the predicted saving; they decide and the next cycle measures the result." }
      ], result: "Each step feeds the next; the decision comes only at consumption.",
      try: [{ grid: { cols: ["Activity at Harbour Foods", "Step (one word)"], rows: [
        ["Deleting 40,000 duplicate loyalty records", "Cleaning"],
        ["A dashboard shows regional managers the slow stores", "Consumption"],
        ["Footfall counters send readings to head office", "Collection"],
        ["An algorithm finds that rainy Saturdays boost soup sales", "Mining"],
        ["Two years of baskets are loaded into a cloud warehouse", "Storing"],
        ["Analysts judge whether the soup pattern justifies a promotion", "Analysis"]
      ], given: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]], cap: "Name the step of analysing big data (Collection, Storing, Cleaning, Mining, Analysis or Consumption)." } }] } },
    { callout: { t: "info", h: "Where this leads in F201", body: [
      "Collection → **1.3** capture methods.",
      "Storing → **2.4** big data infrastructure (cloud, data lakes, warehouses).",
      "Cleaning → **2.2** preparation, wrangling and cleaning techniques.",
      "Mining → **2.3** descriptive, diagnostic, predictive, prescriptive.",
      "Analysis → **2.6** regression, Monte Carlo, factor, cohort, cluster, time series.",
      "Consumption → **2.5** data science and analytics; F205 visualisation."
    ] } },

    { page: "In exam questions" },
    { callout: { t: "info", h: "The scenario for these questions", body: "**PulseGym** runs 110 gyms across the UK. New members join through an online form; members book classes in an app; smart treadmills and turnstiles stream readings to head office. The questions develop the scenario as a real paper does." } },
    { worked: { tag: "exam", title: "The characteristic a form shows", src: "OCR-style · State · 1 mark",
      q: "PulseGym's online joining form collects each new member's name, date of birth, email address, a photo and a typed note about any injuries. State the characteristic of big data that relates to the data collected by the form.",
      steps: [
        { m: "Variety of data types (1)", mk: "1", n: "Modelled on SAM Q1(a). Do not accept: Variety (the scheme wants the full characteristic)." }
      ], result: "Variety of data types" } },
    { worked: { tag: "exam", title: "How volume makes data big", src: "OCR-style · State · 2 marks",
      q: "PulseGym has over two million members and stores every check-in and class booking. State two ways the volume of data can characterise data as big data.",
      steps: [
        { m: "Any two from: the amount of data that exists (1) · the initial size of the data collected (1) · the amount of data is growing (1) · too much data to store or process with traditional tools / one server (1).", mk: "2", n: "Modelled on SAM Q1(b). Generic answers are fine; answers applied to PulseGym are also accepted. Credit any other appropriate response." }
      ], result: "e.g. the amount that exists; the amount is growing" } },
    { worked: { tag: "exam", title: "Why velocity matters to the gym", src: "OCR-style · Explain · 2 marks",
      q: "PulseGym's smart treadmills and turnstiles send a reading every second to head office. Explain one reason why the velocity of streamed data is a challenge for PulseGym.",
      steps: [
        { m: "Identify: data arrives continuously and in real time / faster than it can be processed in batches (1)…", mk: "1" },
        { m: "…apply: so PulseGym needs systems that process the stream straight away, e.g. to spot a treadmill fault or a full gym floor before members are affected (1).", mk: "1", n: "One mark for the reason, one for linking it to PulseGym. A definition of velocity alone = 1 max." }
      ], result: "Continuous real-time data (1) → must be processed at once to act on faults/capacity (1)" } },
    { worked: { tag: "exam", title: "Veracity before a decision", src: "OCR-style · Explain · 2 marks",
      q: "PulseGym plans to close classes with low bookings, using data members type into the app. Explain why PulseGym must consider the veracity of the data before deciding.",
      steps: [
        { m: "Identify: the data may be inaccurate / incomplete / duplicated, e.g. members book and do not turn up, or book twice (1)…", mk: "1" },
        { m: "…apply: so decisions based on it could be wrong — a popular class might be closed, losing members (1).", mk: "1", n: "Accept: data must be cleaned / validated first so the results can be trusted (1) as the expansion. Credit any other appropriate response." }
      ], result: "Untrustworthy data (1) → wrong closure decision (1)" } },
    { worked: { tag: "exam", title: "What happens in data cleaning", src: "OCR-style · Describe · 2 marks",
      q: "PulseGym's member records come from the joining form, the app and gym reception. Describe what is involved in the data cleaning step of analysing big data.",
      steps: [
        { m: "Any two from: removing duplicate records (1) · fixing / filling missing data (1) · correcting structural errors such as inconsistent formats (1) · removing irrelevant data (1) · validating data, e.g. checking postcodes and email addresses (1).", mk: "2", n: "Describe needs what happens, not just the name of the step. Credit any other appropriate response." }
      ], result: "e.g. remove duplicates (1); fix missing data (1)" } },
    { worked: { tag: "exam", title: "The role of data consumption", src: "OCR-style · Explain · 2 marks",
      q: "PulseGym has analysed which classes members attend most. Explain the role of the data consumption step for PulseGym.",
      steps: [
        { m: "Identify: the results are presented / used, e.g. through a dashboard or report for managers (1)…", mk: "1" },
        { m: "…apply: so managers can act on them, e.g. adding more of the popular classes to the timetable — this is where the value of the data is gained (1).", mk: "1" }
      ], result: "Results reach decision-makers (1) → timetable changed, value realised (1)" } },
    { callout: { t: "info", h: "Levels of response: 6-mark “Analyse” questions (our wording of the SAM's levels)", body: [
      "Start at the top level and work down; the mark within a level depends on how consistently the answer meets it.",
      "Analyse = break it into parts and explain the IMPACT of each with a chain of reasoning (“…which means…, so…”)."
    ] } },
    { table: { head: ["Level", "Marks", "What the answer shows"], rows: [
      [
        "3 (high)",
        "5–6",
        "a thorough analysis: a **range** of points identified; **detailed** knowledge applied to the scenario; clear explanation of the effects; subject terms used **consistently**."
      ],
      [
        "2 (mid)",
        "3–4",
        "an adequate analysis: **some** points identified; sound knowledge in context; adequate explanation; **some** subject terms."
      ],
      [
        "1 (low)",
        "1–2",
        "a basic analysis: **at least one** point; limited knowledge of the context; basic explanation; terms used little."
      ],
      ["0", "0", "nothing worthy of credit."]
    ] } },
    { worked: { tag: "exam", title: "How the six steps help a decision", src: "OCR-style · Analyse · 6 marks",
      q: "PulseGym wants to decide which classes to run at each gym next term. Analyse how the six steps for analysing big data could help PulseGym make this decision.",
      steps: [
        { m: "Collection: class bookings, attendance from turnstiles, app ratings and the joining form give a full picture of demand at each gym.", mk: "1", n: "Indicative content. Each step explained in context supports Level 2; linking it to the decision supports Level 3." },
        { m: "Storing: years of data from 110 gyms is a large volume, so it must be held in scalable storage (e.g. cloud) where it can be reached quickly and securely.", mk: "1", n: "Use of terms (volume, scalable) supports Level 3." },
        { m: "Cleaning: duplicate bookings and no-shows are removed and missing data fixed, so attendance figures are accurate — otherwise a popular class could be cut.", mk: "1", n: "A chain of reasoning (impact on the decision) supports Level 3." },
        { m: "Mining: patterns are found, e.g. spin classes full at 6 am in city gyms but empty in rural ones.", mk: "1", n: "An example in context supports Level 2." },
        { m: "Analysis: the patterns are interpreted against costs (instructor hours, room space) to rank classes by value at each gym.", mk: "1", n: "Links the step to the decision: Level 3." },
        { m: "Consumption: managers see a dashboard per gym and set the timetable; the next term's data shows whether it worked.", mk: "1", n: "A limitation (results only as good as the data; patterns change — variability) gives the balance a Level 3 analysis has." }
      ], result: "Level 3: every step explained in PulseGym's context, each linked to the timetable decision, with consistent terms." } },
    { worked: { tag: "example", title: "Model answer (Level 3)", q: "The 6-mark answer above, written out.",
      steps: [
        { m: "PulseGym would first **collect** bookings, turnstile check-ins and app ratings from all 110 gyms, so it sees real demand rather than guesses. This data is a large **volume**, so it would be **stored** in scalable cloud storage that managers can reach securely." },
        { m: "**Cleaning** comes next: removing duplicate bookings and no-shows means attendance is accurate, which matters because a decision made on dirty data could cut a class that is actually popular." },
        { m: "**Mining** the clean data would show patterns — e.g. early spin classes full in city gyms but not rural ones — and **analysis** would compare these with instructor costs, ranking the classes worth running at each site." },
        { m: "Finally, in **consumption**, a dashboard gives each manager the ranking so the timetable is based on evidence. However, patterns can change (**variability** — January rushes), so PulseGym should repeat the cycle each term rather than trust one analysis." }
      ], result: "Range of points · in context · impacts explained · consistent terms → 6 marks" } },

    { page: "Exam toolkit" },
    { steps: [
      { h: "Use the full names", m: "Volume of data · Variety of data types · Velocity of streamed data · Value of data · Veracity of data · Variability of data inconsistencies." },
      { h: "Match the clue", m: "amount → Volume; kinds/formats → Variety; speed/live → Velocity; worth → Value; accuracy/trust → Veracity; change over time → Variability." },
      { h: "Explain = identify + apply", m: "one mark for the point, one for what it means for THIS organisation." },
      { h: "Steps in order", m: "collection → storing → cleaning → mining → analysis → consumption." },
      { h: "Analyse (6)", m: "a range of points, each with a chain of reasoning in context, plus balance." }
    ] },
    { callout: { t: "tip", h: "How OCR marks it", body: [
      "**State** = a short factual answer; **Describe** = what it is/involves; **Explain** = reason + application; **Analyse** = break down and give impacts.",
      "**Do not accept: Variety** when the scheme wants **Variety of data types** — give the specification's full wording every time.",
      "For “two ways”, give two different points: only the first two answers are marked.",
      "A definition alone rarely earns the second mark of an Explain question: add “so the gym / retailer…”."
    ] } },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "“Big data just means a lot of data.” — Volume is only one of six characteristics.",
      "“Variety and Variability are the same.” — kinds of data vs change over time.",
      "“More data always means more value.” — value comes from useful insight; data with no use is a cost.",
      "“Mining and analysis are the same step.” — mining finds patterns; analysis interprets them to answer the question.",
      "“Consumption means the data is used up.” — it means the results are used by people or systems."
    ] } },
    { callout: { t: "mnemonic", h: "Six questions, six steps", body: [
      "The 6Vs as questions: **How much? What kinds? How fast? Worth it? Can we trust it? Does it stay steady?**",
      "The steps: **C**an **S**tan **C**lean **M**y **A**wful **C**omputer? — Collect, Store, Clean, Mine, Analyse, Consume."
    ] } },
    { callout: { t: "tip", h: "Synoptic links", body: [
      "F200 1.2 — what big data is, its sources and formats (the introduction this leaf builds on).",
      "F200 2.1 — the data lifecycle and the data analytics pipeline (compare the six steps).",
      "F201 1.3 (capture = collection), 2.1 (the types behind Variety), 2.2 (cleaning, Veracity), 2.3 (mining), 2.4 (storing), 2.6 (analysis techniques).",
      "F204 — IoE devices are a major source of Velocity; F205 — visualisation is how data is consumed; F203 — relational databases and their limits with Variety."
    ] } }
  ],
  flashcards: [
    ["List the six characteristics of big data (the 6Vs) by their full names.", "Volume of data, Variety of data types, Velocity of streamed data, Value of data, Veracity of data, Variability of data inconsistencies.", 0],
    ["Define the Veracity of data characteristic.", "The accuracy, quality and trustworthiness of the data — whether it is correct, complete and from a reliable source.", 1],
    ["How does Variability differ from Variety?", "Variety = how many different types/formats of data; Variability = how much the data is inconsistent or changes over time (flow, format or meaning).", 2],
    ["Why does Velocity help to define data as big?", "Data streams in so fast that it cannot be stored and processed later in batches — it needs real-time processing to stay useful.", 3],
    ["What does Value of data mean, and why does it matter?", "The worth of the data to the organisation — the useful insight it gives. It justifies the cost of collecting and storing it.", 4],
    ["List the six steps for analysing big data in order.", "Data collection → data storing → data cleaning → data mining → data analysis → data consumption.", 5],
    ["What is the role of the data cleaning step?", "To raise Veracity — removing duplicates and fixing errors and missing data so later results can be trusted.", 6],
    ["What happens in the data consumption step?", "The results are used — presented to decision-makers in reports and dashboards, or fed into systems — so the data's value is realised.", 7],
    ["Which step searches clean data to discover hidden patterns?", "Data mining — algorithms search large data sets for patterns, trends and relationships.", 8],
    ["Why must data cleaning come before data mining?", "Garbage in, garbage out — mining dirty data (duplicates, errors) produces misleading patterns.", 9],
    ["State three ways the volume of data can characterise data as big data.", "The amount of data that exists; the initial size of the data collected; the amount of data is growing (too much for traditional tools).", 100],
    ["Which characteristic does an online form collecting text, dates and photos show?", "Variety of data types — many different types of data from one source (SAM Q1(a); “Variety” alone is not accepted).", 101],
    ["What is the purpose of the Volume characteristic for an organisation?", "It tells the organisation how much storage and processing power it needs (scalable, distributed or cloud) and the likely cost.", 102],
    ["Give an example of when Velocity of streamed data matters most.", "When data loses value quickly and must be acted on at once — e.g. card fraud checks or live stock levels.", 103],
    ["What is involved in the data storing step?", "Saving the collected data securely and accessibly — in databases, warehouses, data lakes or the cloud — sized for its volume and variety.", 104],
    ["How does data analysis differ from data mining?", "Mining discovers patterns; analysis interprets them with analytic techniques to answer the question and support a decision.", 105],
    ["Give an example of Variability of data inconsistencies in retail.", "Seasonal peaks — sales and data flow surge at Christmas or in a heatwave, then fall, so capacity and models must adapt.", 106]
  ],
  quiz: [
    { q: "A logistics firm streams GPS from 50,000 vans and must react within seconds. Which characteristic matters most?", opts: ["Volume of data", "Velocity of streamed data", "Variety of data types", "Value of data"], ans: 1, why: "The defining feature is speed of arrival and the need for real-time processing." },
    { q: "A retailer's data flow and the meaning of customer comments change sharply between seasons. Which characteristic is this?", opts: ["Variety of data types and formats", "Veracity and accuracy of the data", "Velocity of the streamed data", "Variability of data inconsistencies"], ans: 3, why: "Variability is inconsistency or change over time, in flow or in meaning." },
    { q: "Which step directly improves the veracity of a data set?", opts: ["Data storing", "Data consumption", "Data cleaning", "Data collection"], ans: 2, why: "Cleaning removes duplicates and fixes errors and missing values, making the data trustworthy." },
    { q: "Which order of the six steps is correct?", opts: ["Collect, clean, store, analyse, mine, consume", "Collect, store, clean, mine, analyse, consume", "Store, collect, mine, clean, consume, analyse", "Collect, mine, clean, store, analyse, consume"], ans: 1, why: "Data is collected, stored, cleaned, mined for patterns, analysed, then consumed." },
    { q: "A manager says a data set is not worth keeping because it leads to no useful insight. Which characteristic is she judging?", opts: ["Value of data", "Volume of data", "Velocity of streamed data", "Veracity of data"], ans: 0, why: "Value is the worth of the data — the insight it gives — not its size." },
    { q: "Which characteristic most directly means one fixed relational table design cannot hold all the data?", opts: ["Value of data", "Variability of data inconsistencies", "Variety of data types", "Veracity of data"], ans: 2, why: "Mixed structured, semi-structured and unstructured data will not fit one fixed schema." },
    { q: "In which step are the results shown to managers on a dashboard?", opts: ["Data mining", "Data analysis", "Data storing", "Data consumption"], ans: 3, why: "Consumption is where results are presented and used to make decisions." },
    { q: "Customers enter fake birthdays to get a free gift. Which characteristic does this reduce?", opts: ["Veracity of data", "Velocity of streamed data", "Volume of data", "Variety of data types"], ans: 0, why: "Veracity is the accuracy and trustworthiness of the data; false entries lower it." },
    { q: "Which is NOT one of the ways volume characterises data as big data?", opts: ["The amount of data that exists", "The amount of data is growing", "The number of data formats used", "The initial size of data collected"], ans: 2, why: "The number of formats is Variety; the other three are the SAM's volume points." },
    { q: "What is the main role of the data mining step?", opts: ["To present results to managers", "To discover hidden patterns", "To remove duplicate records", "To save the data securely"], ans: 1, why: "Mining searches large clean data sets for patterns, trends and relationships." }
  ]
};

/* =====================================================================
   F201 1.2  The evolution of big data
   ===================================================================== */
function evolutionFig() {
  var it = [], rows = [
    ["Database management systems", "from the 1970s", "relational DBMS, SQL, then NoSQL", "accent"],
    ["Search engines", "from the 1990s", "index the whole web on many servers", "accent3"],
    ["Web-based storage", "from the mid-2000s", "rent storage in the cloud", "accent2"],
    ["Proliferation of devices", "from the late 2000s", "smartphones, wearables, smart TVs", "it"],
    ["Internet of Everything", "from the 2010s", "people, process, data, things", "danger"]
  ];
  it.push(line(30, 20, 30, 268, { c: "line", w: 2 }));
  rows.forEach(function (r, i) {
    var y = 22 + i * 50;
    it.push({ circle: [30, y + 20, 6], fill: r[3], alpha: 0.9, c: r[3], w: 1 });
    it.push(txt(46, y + 12, r[0], { b: true, size: 11, c: "text", pos: "e" }));
    it.push(txt(46, y + 29, r[1] + " · " + r[2], { size: 9.5, c: "text2", pos: "e" }));
    it = it.concat(arrow(360, y + 20, 478, 150, null, { c: r[3], w: 1.2 }));
  });
  it = it.concat(box(482, 104, 148, 92, ["BIG DATA", "more volume", "more variety", "more velocity"], { col: "it", size: 12 }));
  return { fig: { w: 640, h: 280, items: it, cap: "The five developments the specification names, in rough order of arrival, all feeding big data. Dates are approximate eras, not exam facts." } };
}
function ioeFig() {
  var it = [];
  it.push({ circle: [320, 120, 50], fill: "it", alpha: 0.16, c: "it", w: 1.6 });
  it.push(txt(320, 112, "Internet of", { b: true, size: 11, c: "text" }));
  it.push(txt(320, 128, "Everything", { b: true, size: 11, c: "text" }));
  var P = [["People", "phones, wearables, social", 90, 40], ["Process", "right data, right time", 550, 40], ["Data", "turned into information", 90, 200], ["Things", "sensors, machines, vehicles", 550, 200]];
  P.forEach(function (p) {
    it = it.concat(box(p[2] - 80, p[3] - 22, 160, 44, [p[0], p[1]], { col: "accent", size: 11.5 }));
    it.push(line(p[2] < 320 ? p[2] + 80 : p[2] - 80, p[3], p[2] < 320 ? 278 : 362, p[3] < 120 ? 100 : 140, { c: "it", w: 1.3 }));
  });
  it.push(txt(320, 236, "IoT = the things only; IoE = all four, connected", { size: 10, c: "accent2", b: true }));
  return { fig: { w: 640, h: 250, items: it, cap: "The Internet of Everything (Cisco's term) connects people, process, data and things — wider than the Internet of Things." } };
}

C["it:F201.1.2"] = {
  notes: [
    { h: "The evolution of big data — the whole topic on one page" },
    { h: "What the specification asks (F201 1.2)" },
    { kv: [
      [
        "Teaching content",
        "**Developments**: database management systems · Internet of Everything (IoE) · proliferation of devices generating digital data · search engines · web-based storage."
      ],
      [
        "To include",
        "how each development has **contributed to the evolution** of big data · the **benefits and limitations** of each development in relation to the evolution of big data."
      ],
      [
        "Does not include",
        "no exclusions are listed here. F200 1.2 explicitly leaves “the evolution of big data” to this unit; the detail of cloud models belongs to 2.4."
      ]
    ] },
    { table: { head: ["Question shape", "Command word", "Marks", "What earns the marks"], rows: [
      ["Name a development / what IoE connects", "State / Identify", "1–2", "the spec's own names"],
      ["How a development contributed", "Explain / Describe", "2", "what it did (1) + effect on big data (1)"],
      ["A benefit or a limitation of a development", "Explain", "2", "identify (1) + apply (1)"],
      ["Should an organisation adopt a development?", "Discuss", "9", "benefits, limitations, recommendation"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**The timeline**: five developments at a glance.", "**Database management systems**.", "**IoE and the proliferation of devices**.", "**Search engines and web-based storage**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "The timeline" },
    evolutionFig(),
    { callout: { t: "def", h: "The evolution of big data", body: "How big data grew from **separate, small, structured** stores into today's **huge, fast, mixed** data — because each development made more data **possible to create, capture, store or search**." } },
    { table: { head: ["Development", "What it added to big data", "The V it pushed"], rows: [
      ["Database management systems", "a reliable way to store and query large structured data; later NoSQL for any data", "Volume, Variety"],
      ["Internet of Everything", "constant streams from connected people, processes and things", "Velocity, Volume"],
      ["Proliferation of devices", "billions of data sources in people's pockets and homes", "Volume, Variety"],
      ["Search engines", "the tools to store and process data across many servers; search data itself", "Volume, Value"],
      ["Web-based storage", "cheap, scalable storage anyone can rent", "Volume"]
    ] } },
    { callout: { t: "tip", h: "The thread linking all five", body: [
      "Each development made data **cheaper or easier** to create, collect, store or find.",
      "Cheaper data → organisations kept **more** of it → new tools were needed → those tools allowed **even more** data.",
      "For every development learn: **what it is · how it contributed · one benefit · one limitation**."
    ] } },

    { page: "Database management systems" },
    { callout: { t: "def", h: "Database management system (DBMS)", body: "Software that **creates, stores, organises, retrieves and secures** data held in a database, and lets many users and programs share it — e.g. a relational DBMS queried with **SQL**, or a **NoSQL** database for less structured data." } },
    { steps: [
      { h: "Flat files", m: "each program kept its own files: duplicated, inconsistent, hard to combine." },
      { h: "Early DBMSs (1960s)", m: "hierarchical and network databases: data shared, but rigid." },
      { h: "Relational DBMS (from the 1970s)", m: "tables linked by keys, queried with SQL; became the standard for structured business data." },
      { h: "Data warehouses (1990s)", m: "historic data from many systems gathered in one place for analysis — keeping data became normal." },
      { h: "NoSQL and distributed databases (2000s)", m: "no fixed schema, spread across many servers: hold huge volumes of semi-structured and unstructured data." }
    ] },
    { callout: { t: "info", h: "How DBMSs contributed to the evolution of big data", body: [
      "Made it possible to store **large amounts of structured data** reliably and query it quickly.",
      "Let many users share one consistent copy, so organisations **centralised** their data.",
      "Data warehouses created the habit of **keeping history** for analysis — the start of large analytical data sets.",
      "NoSQL and distributed DBMSs removed the fixed-schema and one-server limits, so **Volume and Variety** could grow."
    ] } },
    { table: { head: ["Benefits (for big data)", "Limitations (for big data)"], rows: [
      ["Organised, consistent data with less duplication (integrity)", "A relational design needs a fixed schema — poor for unstructured data"],
      ["Fast searching and querying with SQL", "One server can only grow so far; scaling up is costly"],
      ["Many users at once, with permissions and security", "Licences, hardware and specialist staff (database administrators) cost money"],
      ["Backup and recovery built in", "NoSQL may trade strict consistency for scale and speed"]
    ] } },
    { worked: { tag: "example", title: "Why a relational DBMS struggles with big data", q: "A bookshop chain's relational database holds stock and sales well, but it now wants to store customer reviews, shelf-camera images and website clickstreams too. Explain the problem and how DBMSs have evolved to cope.",
      steps: [
        { m: "The relational DBMS expects every record to fit a fixed table design; reviews (free text) and images (unstructured) do not fit rows and columns." },
        { m: "Clickstreams arrive fast and in huge volume; one database server would slow down as the tables grow." },
        { m: "NoSQL and distributed databases store data without a fixed schema across many servers, so the chain can add these sources and scale out by adding servers." }
      ], result: "Fixed schema + one server → NoSQL / distributed storage for Variety and Volume" } },

    { page: "IoE and the proliferation of devices" },
    ioeFig(),
    { callout: { t: "def", h: "Internet of Everything (IoE)", body: [
      "The networked connection of **people, process, data and things** — Cisco's term, wider than the Internet of Things (IoT), which connects things only.",
      "**People**: connected through phones, wearables and social media.",
      "**Process**: delivering the right information to the right person or machine at the right time.",
      "**Data**: turned into useful information. **Things**: sensors, machines, vehicles, appliances."
    ] } },
    { callout: { t: "info", h: "How the IoE contributed to the evolution of big data", body: [
      "Billions of connected things send readings **continuously** → a jump in **Velocity** and **Volume**.",
      "New kinds of data (sensor readings, location, machine status) → more **Variety**.",
      "Connecting processes and people made **real-time analytics** worth doing: smart meters, connected cars, smart cities, remote patient monitoring.",
      "Data now describes the **physical world**, not just transactions."
    ] } },
    { table: { head: ["IoE: benefits", "IoE: limitations"], rows: [
      ["Real-time data about places, machines and people", "Every device is a possible point of attack (security)"],
      ["Automation: devices act on data without a person", "Privacy: constant tracking of people and homes"],
      ["New services and efficiency (energy, transport, health)", "Huge volumes to store and process; cost of infrastructure"],
      ["A fuller picture by joining people, process and things", "Cheap sensors can be inaccurate (veracity); devices from many makers may not work together"]
    ] } },
    { callout: { t: "def", h: "Proliferation of devices generating digital data", body: "The rapid **spread and growth in the number** of devices that create digital data — smartphones, tablets, laptops, wearables, smart TVs and speakers, cameras, games consoles, connected cars, sensors — so that almost every person and activity now leaves data behind." } },
    { callout: { t: "info", h: "How the proliferation of devices contributed", body: [
      "Most people carry a **smartphone** that creates location, app, photo, message and payment data all day → **Volume**.",
      "Each kind of device produces different data → **Variety**.",
      "Devices became **cheaper and smaller**, so organisations could put them everywhere.",
      "Data is now created by **individuals**, not only by organisations — e.g. photos, posts, fitness data."
    ] } },
    { table: { head: ["Devices: benefits", "Devices: limitations"], rows: [
      ["Rich data about behaviour, location and preferences", "Data overload: more data than can be analysed"],
      ["Data collected cheaply and in real time", "Many formats and makers: hard to combine"],
      ["People can reach services and data anywhere", "Privacy and consent: personal data on every device"],
      ["New markets: apps, mobile payments, wearables", "Digital divide: people without devices are missing from the data (bias)"]
    ] } },

    { page: "Search engines and web-based storage" },
    { callout: { t: "def", h: "Search engine", body: "A system that **crawls** the web, **indexes** what it finds and returns **ranked results** for a query — e.g. Google, Bing." } },
    { callout: { t: "info", h: "How search engines contributed to the evolution of big data", body: [
      "Indexing the whole web was too big for any one computer, so search companies built **distributed storage and processing** across thousands of ordinary servers.",
      "Google published how its file system (2003) and **MapReduce** (2004) worked; the open-source **Hadoop** copied the ideas — the foundation of big data tools used everywhere.",
      "Search **queries themselves** are big data: they reveal what people want, used for trends and targeted adverts.",
      "They made the web's information **findable**, so collecting and using online data became normal."
    ] } },
    { table: { head: ["Search engines: benefits", "Search engines: limitations"], rows: [
      ["Fast access to vast amounts of information", "Privacy: searches are tracked and profiled"],
      ["Search data shows trends early (products, news, health)", "Results and ranking can be biased; filter bubbles"],
      ["Drove the distributed tools all big data now uses", "Veracity: results may be unreliable or out of date"],
      ["Adverts targeted by search fund free services", "Search trends can mislead — Google Flu Trends over-estimated flu levels"]
    ] } },
    { callout: { t: "def", h: "Web-based storage", body: "Storing data on **remote servers reached over the internet** (cloud storage), run by a provider — e.g. Amazon Web Services, Microsoft Azure, Google Cloud; for individuals OneDrive, iCloud, Google Drive, Dropbox." } },
    { callout: { t: "info", h: "How web-based storage contributed", body: [
      "Organisations could store huge amounts **without buying their own servers** — pay for what they use.",
      "Storage **scales up quickly** (elastic), so data no longer had to be thrown away for lack of space.",
      "Smaller organisations could afford big data; providers added **analytics tools** beside the storage.",
      "Data can be reached **from anywhere**, so many sites, staff and devices share it."
    ] } },
    { table: { head: ["Web-based storage: benefits", "Web-based storage: limitations"], rows: [
      ["Scalable: grows with the data", "Needs a reliable internet connection"],
      ["Low up-front cost; no hardware to maintain", "Ongoing fees rise as the data grows"],
      ["Access from anywhere, on any device", "Data held by a third party: security and privacy risk"],
      ["Backups and resilience run by the provider", "Data location (UK GDPR rules on transfers), lock-in, outages outside your control"]
    ] } },
    { worked: { tag: "example", title: "Which development made this possible?", q: "Paige & Quill, a bookshop chain founded in 1975, now uses data that would have been impossible then. Name the development behind each change.",
      steps: [
        { m: "Customers' phones run the chain's app and share their location near a shop → **proliferation of devices**." },
        { m: "Smart shelves report stock, and the app tells staff to restock before a book runs out → **Internet of Everything** (things, data, process and people connected)." },
        { m: "Ten years of sales are kept in rented cloud space that grows each month → **web-based storage**." },
        { m: "What people search for online shows which new titles will sell → **search engines**." },
        { m: "Stock and sales are held in linked tables queried with SQL → **database management systems**." }
      ], result: "Devices · IoE · Web storage · Search engines · DBMS",
      try: [{ grid: { cols: ["What happened", "Development (DBMS, IoE, Devices, Search or Storage)"], rows: [
        ["A chain rents cloud space instead of buying servers", "Storage"],
        ["Fridges, people and delivery processes share data automatically", "IoE"],
        ["Tables of orders are linked by keys and queried with SQL", "DBMS"],
        ["Indexing the whole web forced work to be spread over many servers", "Search"],
        ["Nearly every customer carries a phone that logs location and app use", "Devices"]
      ], given: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], cap: "Type the short name shown in the column heading." } }] } },

    { page: "In exam questions" },
    { callout: { t: "info", h: "The scenario for these questions", body: "**Paige & Quill** is a UK bookshop chain with 90 shops and a website. It began in 1975 with paper records; it now runs a relational database and an app, and is considering smart shelves and cloud storage." } },
    { worked: { tag: "exam", title: "What the IoE connects", src: "OCR-style · State · 2 marks",
      q: "Paige & Quill is considering using the Internet of Everything (IoE) in its shops. State two elements that are connected by the IoE.",
      steps: [
        { m: "Any two from: people (1) · process (1) · data (1) · things (1).", mk: "2", n: "Modelled on the SAM's short State questions (e.g. Q2(b)). Do not accept “devices” and “things” as two separate answers." }
      ], result: "e.g. people (1); things (1)" } },
    { worked: { tag: "exam", title: "How search engines contributed", src: "OCR-style · Explain · 2 marks",
      q: "Paige & Quill uses search trends to decide which books to stock. Explain how search engines have contributed to the evolution of big data.",
      steps: [
        { m: "Identify: search engines had to store and index the whole web, which needed processing spread across many servers (1)…", mk: "1" },
        { m: "…expand: these distributed storage and processing methods (e.g. MapReduce, Hadoop) became the tools used to manage big data generally (1).", mk: "1", n: "Alternative pair: search queries are themselves huge volumes of data (1) that reveal trends organisations like Paige & Quill can analyse (1). Credit any other appropriate response." }
      ], result: "Indexing the web (1) → distributed tools for all big data (1)" } },
    { worked: { tag: "exam", title: "A benefit of web-based storage", src: "OCR-style · Explain · 2 marks",
      q: "Paige & Quill wants to keep ten years of sales and website data. Explain one benefit to Paige & Quill of using web-based storage for this data.",
      steps: [
        { m: "Identify: web-based storage is scalable / capacity can be increased when needed (1)…", mk: "1" },
        { m: "…apply: so as the chain's sales and website data grows it does not have to buy and maintain more of its own servers (1).", mk: "1", n: "Other benefits: access from any shop or office (1) so head office and shops share one copy (1); backups managed by the provider (1) so data is not lost if a shop's computer fails (1). Maximum one benefit." }
      ], result: "Scalable (1) → no new servers as data grows (1)" } },
    { worked: { tag: "exam", title: "A limitation of web-based storage", src: "OCR-style · Explain · 2 marks",
      q: "Paige & Quill is moving its customer data to web-based storage. Explain one limitation to Paige & Quill of using web-based storage for its customer data.",
      steps: [
        { m: "Identify: access depends on an internet connection (1)…", mk: "1" },
        { m: "…apply: so if a shop's connection fails, staff cannot look up stock or loyalty details (1).", mk: "1", n: "Modelled on SAM Q4(b). Other limitations: data held by a third party (1) so Paige & Quill must check it is kept securely under UK GDPR (1); ongoing costs (1) that rise as the data grows (1). Maximum one limitation." }
      ], result: "Needs internet (1) → shops cut off if it fails (1)" } },
    { worked: { tag: "exam", title: "How DBMSs contributed", src: "OCR-style · Describe · 2 marks",
      q: "Paige & Quill moved from paper records to a database management system in the 1990s. Describe how database management systems have contributed to the evolution of big data.",
      steps: [
        { m: "Any two from: allowed large amounts of structured data to be stored and searched quickly (1) · allowed many users to share consistent data (1) · data warehouses kept historic data for analysis (1) · NoSQL / distributed databases allowed unstructured data and huge volumes across many servers (1).", mk: "2", n: "Credit any other appropriate response." }
      ], result: "e.g. store and query large data (1); NoSQL for unstructured data (1)" } },
    { callout: { t: "info", h: "Levels of response: 9-mark “Discuss” questions (our wording of the SAM's levels)", body: [
      "Top of a level = consistently meets it; middle = meets it with some inconsistency; bottom = borderline with the level below.",
      "No conclusion (a recommendation with reasons) keeps an answer out of Level 3."
    ] } },
    { table: { head: ["Level", "Marks", "What the answer shows"], rows: [
      [
        "3 (high)",
        "7–9",
        "a thorough discussion with detailed evaluation: a **range** of examples; **benefits and limitations** for the organisation; detailed analysis in context; a **clear conclusion** with detailed reasons; terms used consistently."
      ],
      [
        "2 (mid)",
        "4–6",
        "an adequate discussion with sound evaluation: **some** examples; some benefits **or** limitations; some analysis in context; an adequate conclusion with relevant reasons; some terms."
      ],
      [
        "1 (low)",
        "1–3",
        "a basic discussion: **a few** examples or points; limited analysis in context; a brief conclusion with limited reasons; few terms."
      ],
      ["0", "0", "nothing worthy of credit."]
    ] } },
    { worked: { tag: "exam", title: "Should the chain use IoE devices in its shops?", src: "OCR-style · Discuss · 9 marks",
      q: "Paige & Quill is considering fitting its 90 shops with IoE devices: smart shelves that report stock, footfall sensors, and an app that greets loyalty members as they arrive. Discuss whether Paige & Quill should use IoE devices in its shops. In your answer you must write about: any benefits to Paige & Quill; any limitations to Paige & Quill; whether you would recommend that Paige & Quill uses IoE devices, and your reasons.",
      steps: [
        { m: "Benefit: smart shelves report stock in real time, so books are reordered before they sell out and sales are not lost.", mk: "1", n: "Indicative content, modelled on the shape of SAM Q6(c). A benefit applied to the shops supports Level 2." },
        { m: "Benefit: footfall sensors show busy times in each shop, so staff rotas match demand and wage costs fall.", mk: "1", n: "A range of benefits with examples → Level 3." },
        { m: "Benefit: the app links people, process and data — e.g. telling a member their reserved book is in stock as they walk in — improving loyalty.", mk: "1", n: "Use of IoE terms (people, process, data, things) supports Level 3." },
        { m: "Benefit: the data builds a large, fast-moving data set (volume, velocity) that can be analysed for trends across all 90 shops.", mk: "1", n: "Links to the 6Vs: consistent terminology." },
        { m: "Limitation: cost of devices, installation in 90 shops, and storing and analysing the extra data.", mk: "1", n: "Limitations as well as benefits are needed for Level 3." },
        { m: "Limitation: every connected device is a security risk; a breach of loyalty members' data could bring UK GDPR fines and lost trust.", mk: "1", n: "Analysis in context: Level 3." },
        { m: "Limitation: tracking members as they arrive raises privacy concerns; some customers may object or leave the scheme.", mk: "1", n: "Supports Level 2–3." },
        { m: "Limitation: cheap sensors can give inaccurate readings (veracity), and devices need a reliable connection.", mk: "1", n: "Supports Level 2–3." },
        { m: "Conclusion: recommend it, starting with smart shelves and footfall sensors in a few shops (clear benefit, low privacy risk), with security tested and the greeting feature opt-in only — then roll out if stock losses fall.", mk: "1", n: "A justified recommendation that weighs the points is required for Level 3. Credit a reasoned recommendation either way." }
      ], result: "Level 3: several benefits and limitations in Paige & Quill's context, IoE terms used, and a clear, justified recommendation." } },
    { worked: { tag: "example", title: "Model conclusion (the part most answers miss)", q: "Write a Level 3 conclusion for the 9-mark question above.",
      steps: [
        { m: "I would recommend that Paige & Quill uses IoE devices, but in stages. Smart shelves and footfall sensors give clear benefits — fewer lost sales and better staffing — and they collect little personal data, so the privacy risk is small." },
        { m: "The member-greeting app is riskier: it tracks individuals, so it should be opt-in and protected to UK GDPR standards. Piloting in a few shops first lets the chain check the sensors' accuracy and the real savings before paying to equip all 90." }
      ], result: "A decision · the reasons weighed · conditions attached" } },

    { page: "Exam toolkit" },
    { steps: [
      { h: "Name all five", m: "DBMSs · Internet of Everything · proliferation of devices · search engines · web-based storage." },
      { h: "Contribution", m: "say what the development made possible AND what that did to big data (more volume / variety / velocity, or new tools)." },
      { h: "Benefit or limitation", m: "identify it, then apply it: “…so the chain…”." },
      { h: "IoE ≠ IoT", m: "IoE = people, process, data, things; IoT = things." },
      { h: "Discuss (9)", m: "benefits, limitations, then a recommendation with reasons." }
    ] },
    { callout: { t: "tip", h: "How OCR marks it", body: [
      "**Explain** = one point plus its expansion; two unexpanded points earn 1.",
      "**Discuss** must end in a recommendation: “I would recommend… because…, provided that…”.",
      "Keep the development in focus: a question on search engines wants indexing, distributed processing or search data — not cloud storage.",
      "Applied answers (“so Paige & Quill…”) are what PO2 questions credit; generic ones may be capped."
    ] } },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "“IoE is just another name for IoT.” — IoE adds people, process and data to the things.",
      "“Web-based storage is always safer.” — it moves the risk to a third party and depends on the internet.",
      "“Relational databases are big data tools.” — they underpin structured data, but NoSQL and distributed systems were needed for big data's variety and volume.",
      "“Search engines only matter as a source of information.” — their biggest contribution was the distributed technology behind big data.",
      "“More devices means better data.” — more data, but not always more accurate or representative data."
    ] } },
    { callout: { t: "mnemonic", h: "“Dad Searched Web, Dug IoE”", body: [
      "**D**BMS → **S**earch engines → **W**eb-based storage → **D**evices (proliferation) → **IoE**: the rough order the developments arrived.",
      "IoE's four: **P**eople, **P**rocess, **D**ata, **T**hings — “**P**lease **P**ass **D**ata **T**ogether”."
    ] } },
    { callout: { t: "tip", h: "Synoptic links", body: [
      "F200 1.2 — big data's sources and formats (F200 leaves the evolution to F201).",
      "F200 2.3 — storage; F201 2.4 — big data infrastructure: cloud (public, private, hybrid), data lakes, warehouses.",
      "F203 — relational database design: the DBMS strand in detail.",
      "F204 — Data and the Internet of Everything: the IoE strand in full.",
      "F201 1.1 (the Vs each development pushed), 1.3 (devices and IoE as capture methods), 4.1 (UK GDPR and the cloud)."
    ] } }
  ],
  flashcards: [
    ["Name the five developments behind the evolution of big data.", "Database management systems, the Internet of Everything (IoE), proliferation of devices generating digital data, search engines, web-based storage.", 0],
    ["What four things does the Internet of Everything connect?", "People, process, data and things — wider than the IoT, which connects things only.", 1],
    ["How did the evolution of DBMSs contribute to big data?", "Flat files → relational (SQL) → data warehouses → NoSQL/distributed; NoSQL removed the fixed-schema and one-server limits, so volume and variety could grow.", 2],
    ["How did search engines drive the technology of big data?", "Indexing the whole web forced distributed storage and processing (Google's MapReduce, copied by Hadoop) — the basis of big data tools.", 3],
    ["How did web-based storage contribute to big data?", "Cheap, scalable cloud storage meant organisations could keep huge amounts of data without buying servers.", 4],
    ["Give one benefit and one limitation of the IoE for big data.", "Benefit: real-time data from connected things and people. Limitation: every device is a security and privacy risk, and the volume is costly to handle.", 5],
    ["Why did the proliferation of devices increase the variety of data?", "Different devices (phones, wearables, cameras, smart TVs, sensors) each produce different types of data.", 6],
    ["What is one limitation of relying on web-based storage?", "It needs a reliable internet connection — plus ongoing costs, third-party security risk and lock-in.", 7],
    ["Define a database management system (DBMS).", "Software that creates, stores, organises, retrieves and secures data in a database and lets many users share it.", 100],
    ["What is the difference between the IoT and the IoE?", "The IoT connects things (devices, sensors); the IoE connects people, process, data and things together.", 101],
    ["What does proliferation of devices generating digital data mean?", "The rapid spread and growth in the number of data-creating devices — smartphones, wearables, smart TVs, connected cars, sensors.", 102],
    ["Give a limitation of the proliferation of devices for big data analysis.", "The digital divide: people without devices are missing from the data, so analysis can be biased (also overload and privacy).", 103],
    ["Define web-based storage and give an example provider.", "Storing data on remote servers reached over the internet (cloud), e.g. Amazon Web Services, Microsoft Azure, OneDrive.", 104],
    ["Why can search-engine data mislead an analyst?", "Search interest is not the same as real behaviour — e.g. Google Flu Trends over-estimated flu levels.", 105],
    ["Why is a relational DBMS a limitation for unstructured big data?", "It needs a fixed schema of tables, rows and columns, which text, images and video do not fit.", 106]
  ],
  quiz: [
    { q: "Which development connects people, process, data and things?", opts: ["Web-based storage", "Internet of Everything", "Relational databases", "Search engines"], ans: 1, why: "That is the IoE; the IoT connects things only." },
    { q: "Which development forced the creation of distributed processing such as MapReduce?", opts: ["Search engines indexing the web", "Smartphones taking photographs", "Building societies using SQL", "Shops fitting footfall sensors"], ans: 0, why: "Indexing the whole web needed work spread across thousands of servers." },
    { q: "What is the main limitation of a relational DBMS for big data?", opts: ["It cannot be searched with SQL", "It cannot hold numeric data", "It cannot be backed up at all", "It needs a fixed table schema"], ans: 3, why: "Unstructured data does not fit fixed rows and columns." },
    { q: "Which is a benefit of web-based storage for big data?", opts: ["It never needs the internet", "It scales as the data grows", "It removes all privacy risk", "It is free at every size"], ans: 1, why: "Capacity can be increased on demand; the other three are false." },
    { q: "Which is a limitation of the proliferation of devices?", opts: ["Less data about people's behaviour", "Fewer data formats to combine", "People without devices are missing", "Data arrives much more slowly"], ans: 2, why: "The digital divide biases the data towards people who own devices." },
    { q: "Which limitation applies most to the IoE?", opts: ["Each device is a point of attack", "It only produces paper records", "It cannot work in real time", "It reduces the variety of data"], ans: 0, why: "More connected devices means more ways in for attackers." },
    { q: "How did data warehouses contribute to the evolution of big data?", opts: ["They replaced the internet", "They indexed the world's web pages", "They made sensors much cheaper", "They kept historic data for analysis"], ans: 3, why: "Gathering history from many systems made keeping data for analysis normal." },
    { q: "A shop chain rents storage from a provider and pays more as its data grows. Which development is this?", opts: ["Search engines", "Proliferation of devices", "Web-based storage", "Internet of Everything"], ans: 2, why: "Rented, internet-reached storage that scales is web-based (cloud) storage." },
    { q: "Why can search-trend data have low veracity?", opts: ["Searches are always typed twice", "Interest is not the same as behaviour", "Search engines store no data", "Trends never change over time"], ans: 1, why: "People search for many reasons, so searches do not always reflect what they do." }
  ]
};

/* =====================================================================
   F201 1.3  How big data is captured
   ===================================================================== */
function captureFig() {
  var it = [];
  var top = [["Images & video", "unstructured", "danger"], ["GPS signals", "structured", "accent3"], ["Satellites", "images + numbers", "danger"], ["Sensors", "structured", "accent3"], ["IoE devices", "structured + semi", "accent3"]];
  var bot = [["Natural language", "unstructured", "danger"], ["Online surveys", "ticks + free text", "accent2"], ["Social media", "posts + metadata", "danger"], ["Transactions", "structured", "accent3"]];
  top.forEach(function (b, i) { var x = 12 + i * 125; it = it.concat(box(x, 14, 116, 44, [b[0], b[1]], { col: b[2], size: 10.5 })); it = it.concat(arrow(x + 58, 60, 320 + (x + 58 - 320) * 0.25, 128, null, { c: "muted", w: 1.1 })); });
  bot.forEach(function (b, i) { var x = 75 + i * 125; it = it.concat(box(x, 236, 116, 44, [b[0], b[1]], { col: b[2], size: 10.5 })); it = it.concat(arrow(x + 58, 234, 320 + (x + 58 - 320) * 0.25, 172, null, { c: "muted", w: 1.1 })); });
  it = it.concat(box(220, 130, 200, 40, ["Organisation's data store", "captured data, ready for storing"], { col: "it", size: 11.5, alpha: 0.2 }));
  it.push(txt(30, 112, "structured", { b: true, size: 10, c: "accent3", pos: "e" }));
  it.push(txt(30, 130, "semi-structured", { b: true, size: 10, c: "accent2", pos: "e" }));
  it.push(txt(30, 148, "unstructured", { b: true, size: 10, c: "danger", pos: "e" }));
  it.push(txt(610, 130, "the data type", { size: 10, c: "text2", pos: "w" }));
  it.push(txt(610, 146, "each method mostly gives", { size: 10, c: "text2", pos: "w" }));
  return { fig: { w: 640, h: 296, items: it, cap: "The nine capture methods the specification names, coloured by the type of data each mostly generates (see 2.1 for the types)." } };
}
function gpsFig() {
  var it = [];
  it.push({ poly: [[0, 210], [160, 196], [320, 192], [480, 196], [640, 210], [640, 230], [0, 230]], fill: "accent3", alpha: 0.12, c: "accent3", w: 1.2 });
  var sats = [[90, 40], [250, 22], [410, 30], [560, 54]];
  sats.forEach(function (s, i) {
    it.push({ poly: [[s[0] - 14, s[1] - 7], [s[0] + 14, s[1] - 7], [s[0] + 14, s[1] + 7], [s[0] - 14, s[1] + 7]], fill: "accent", alpha: 0.3, c: "accent", w: 1.2 });
    it.push(line(s[0], s[1] + 8, 330, 186, { c: "accent", w: 1.1, dash: true }));
    it.push(txt(s[0], s[1] - 16, "satellite " + (i + 1), { size: 9.5, c: "text2" }));
  });
  it.push({ circle: [330, 188, 7], fill: "danger", alpha: 0.9, c: "danger", w: 1 });
  it.push(txt(342, 172, "receiver (phone, van, watch)", { size: 10, c: "text", pos: "e", b: true }));
  it.push(txt(320, 112, "each signal carries its send time → distance to that satellite", { size: 10, c: "accent" }));
  it.push(txt(320, 128, "four or more distances → latitude, longitude, height and time", { size: 10, c: "accent" }));
  return { fig: { w: 640, h: 236, items: it, cap: "GPS: a receiver times signals from at least four satellites and works out where it is. The receiver captures the data; the satellites only broadcast." } };
}

C["it:F201.1.3"] = {
  notes: [
    { h: "How big data is captured — the whole topic on one page" },
    { h: "What the specification asks (F201 1.3)" },
    { kv: [
      [
        "Teaching content",
        "**Data capture methods**: digital images and videos · GPS signals · IoE connected devices · natural language · online surveys · satellites · sensors · social media sites · transactional records."
      ],
      [
        "To include",
        "what big data capture is · how each method is used to collect data · when each method can be used · the **types of data** each generates · the **benefits and limitations** of each method."
      ],
      [
        "Does not include",
        "no exclusions are listed; the full treatment of data types (structured, semi-structured, unstructured) is 2.1."
      ]
    ] },
    { table: { head: ["Question shape", "Command word", "Marks", "Nearest evidence"], rows: [
      ["Why an organisation captures this data", "Why… / State", "1", "SAM Q3(a)"],
      ["A benefit of the captured data to the organisation", "Explain", "2", "SAM Q3(b)"],
      ["Which method is being used", "Identify", "1–3", "spec 1.3"],
      ["A benefit and a limitation of a method", "Explain", "4", "SAM Q6(e) / Q8 shape"],
      ["Weigh up methods for a purpose", "Analyse", "6", "levels of response"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**What big data capture is**: the nine methods at a glance.", "**Images, GPS and satellites**.", "**IoE devices and sensors**.", "**Language, surveys, social media and transactions**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "What big data capture is" },
    { callout: { t: "def", h: "Big data capture", body: "The process of **collecting data from its sources** — people, devices, systems and the physical world — and getting it into an organisation's systems so it can be **stored and analysed**. It is the first step (data collection) of analysing big data (1.1)." } },
    captureFig(),
    { table: { head: ["Method", "How it collects data", "Data generated", "Typical use"], rows: [
      ["Digital images and videos", "cameras: CCTV, phones, ANPR, drones, scanners", "unstructured pixels + metadata", "security, traffic counts, inspection"],
      ["GPS signals", "a receiver times satellite signals to fix its position", "structured: coordinates, time, speed", "tracking vehicles, deliveries, fitness"],
      ["IoE connected devices", "internet-connected devices send data automatically", "structured readings, semi-structured messages", "smart meters, wearables, connected cars"],
      ["Natural language", "speech and writing captured as audio or text", "unstructured text and audio", "chatbots, call centres, reviews"],
      ["Online surveys", "questionnaires on web pages, apps or emails", "structured answers + free text", "feedback, consultations"],
      ["Satellites", "orbiting sensors image and measure the Earth", "huge images + structured measurements", "weather, climate, crops, floods"],
      ["Sensors", "measure a physical quantity and output a value", "structured numbers with time stamps", "air quality, machines, buildings"],
      ["Social media sites", "posts, likes and shares collected via the platform", "unstructured posts + metadata", "sentiment, trends, marketing"],
      ["Transactional records", "every sale, payment or booking is logged", "structured: date, item, price, customer", "sales, stock, fraud, offers"]
    ] } },
    { callout: { t: "tip", h: "Two ways to group the methods", body: [
      "**Automatic** (no one types anything): sensors, IoE devices, GPS, satellites, cameras, transactions → high velocity, fewer human errors.",
      "**From people's own words or choices**: natural language, online surveys, social media → tells you *why*, but veracity is lower.",
      "Most real projects **combine** methods: the strengths of one cover the gaps of another."
    ] } },

    { page: "Images, GPS and satellites" },
    { h: "Digital images and videos" },
    { kv: [
      [
        "How it collects data",
        "cameras turn light into pixels: CCTV, smartphones, number-plate (ANPR) cameras, drones, body cameras, medical scanners."
      ],
      [
        "Data generated",
        "**unstructured** image and video files, plus **metadata** (time, place, device) — semi-structured."
      ],
      [
        "When it is used",
        "security and policing; counting traffic or people; checking products on a production line; medical imaging; photos posted online."
      ],
      [
        "How it becomes useful",
        "computer vision / AI recognises objects, number plates or faces in the pixels."
      ]
    ] },
    { table: { head: ["Images and video: benefits", "Images and video: limitations"], rows: [
      ["Very rich detail — shows what actually happened", "Huge files: storage and processing cost (Volume)"],
      ["Can be analysed automatically by AI (e.g. ANPR)", "Needs AI or people to extract meaning"],
      ["Useful evidence (security, insurance claims)", "Privacy: images of identifiable people are personal data under UK GDPR"],
      ["Captured continuously without staff", "Quality falls with poor light, weather or a dirty lens"]
    ] } },
    gpsFig(),
    { h: "GPS signals" },
    { kv: [
      [
        "How it collects data",
        "a GPS receiver (phone, vehicle tracker, watch) picks up signals from navigation satellites and works out its position from their timing; the device then records or sends its location."
      ],
      [
        "Data generated",
        "**structured**: latitude, longitude, height, time stamp, and speed or direction derived from them."
      ],
      [
        "When it is used",
        "tracking delivery vans and buses; journey planning; fitness apps; ride-hailing; location-based offers; logging where photos were taken."
      ]
    ] },
    { table: { head: ["GPS: benefits", "GPS: limitations"], rows: [
      ["Accurate to a few metres outdoors", "Weak or lost indoors, in tunnels, between tall buildings"],
      ["Automatic and in real time", "Drains device batteries"],
      ["Works anywhere in the world, free to receive", "Privacy: shows where people live, work and go"],
      ["Structured data that is easy to analyse and map", "Signals can be jammed or spoofed"]
    ] } },
    { h: "Satellites" },
    { kv: [
      [
        "How it collects data",
        "Earth-observation satellites carry cameras and instruments that image and measure the Earth's surface and atmosphere as they orbit; data is sent to ground stations."
      ],
      [
        "Data generated",
        "very large **images** (visible, infrared, radar) and **structured measurements** (temperature, cloud, sea level) tagged with location and time."
      ],
      [
        "When it is used",
        "weather forecasting (e.g. the Met Office); climate and ice monitoring; crop health; flood and wildfire mapping; urban planning; ship tracking."
      ],
      [
        "Who owns the data",
        "most organisations buy it or use free open data (e.g. the EU's Copernicus Sentinel images) rather than launching satellites."
      ]
    ] },
    { table: { head: ["Satellites: benefits", "Satellites: limitations"], rows: [
      ["Cover huge or remote areas no one can visit", "Very expensive to build and launch; data may cost money"],
      ["Repeat passes build up a time series", "Cloud cover blocks optical images"],
      ["Consistent, objective measurements", "Resolution limits what can be seen; delays before data arrives"],
      ["No permission needed to enter land", "Enormous volumes; needs specialist skills to process"]
    ] } },

    { page: "IoE devices and sensors" },
    { h: "Sensors" },
    { kv: [
      [
        "How it collects data",
        "a sensor measures a **physical quantity** — temperature, light, motion, pressure, sound, moisture, vibration, pollutants — and converts it into a digital value, usually many times a minute."
      ],
      ["Data generated", "**structured** numbers with time stamps, often **streamed** (high velocity)."],
      [
        "When it is used",
        "air-quality monitoring; machines on a production line (vibration predicts failure); smart buildings (lights, heating); hospital monitors; farming (soil moisture)."
      ]
    ] },
    { table: { head: ["Sensors: benefits", "Sensors: limitations"], rows: [
      ["Automatic, continuous, no staff needed", "Drift out of calibration or fail: wrong readings (Veracity)"],
      ["Objective — no human opinion", "Measure one thing with no context (why it changed)"],
      ["High frequency: changes seen at once", "Cost of buying, powering and maintaining many"],
      ["Can work in dangerous or remote places", "Floods of readings to store and filter (Volume, Velocity)"]
    ] } },
    { h: "IoE connected devices" },
    { kv: [
      [
        "How it collects data",
        "devices connected to the internet — smart meters, thermostats, wearables, connected cars, smart bins, voice assistants — **send data automatically** to the organisation and can receive instructions back."
      ],
      [
        "Data generated",
        "**structured** readings and logs; **semi-structured** messages (e.g. JSON); some **unstructured** (voice, images)."
      ],
      [
        "When it is used",
        "real-time monitoring and automation where people, processes and things work together: energy use, health monitoring, fleet management, smart cities."
      ],
      [
        "Sensor vs IoE device",
        "a sensor **measures**; an IoE connected device **connects** (it often contains sensors) and shares data with people and processes."
      ]
    ] },
    { table: { head: ["IoE devices: benefits", "IoE devices: limitations"], rows: [
      ["Real-time data, captured without anyone acting", "Security: each device can be hacked"],
      ["Two-way: data in, instructions back (automation)", "Privacy: devices in homes and on bodies"],
      ["Data from many places joined up (people, process, things)", "Need power and a reliable connection"],
      ["Remote monitoring saves visits and staff time", "Devices from different makers may not work together; cost"]
    ] } },
    { worked: { tag: "example", title: "Sensor or IoE device? Which data type?", q: "Lowmoor City Council fits lamp posts with nitrogen-dioxide sensors, and gives residents smart bins that report when they are full. For each, say how data is captured and what type of data it generates.",
      steps: [
        { m: "The lamp-post **sensor** measures the gas concentration every minute and outputs a number with a time stamp → **structured**, high-velocity data." },
        { m: "The **IoE connected** smart bin contains a fill-level sensor but also **connects**: it sends a message to the council's route-planning system, which sends a lorry → structured readings in **semi-structured** messages, and a process acting on them." }
      ], result: "Sensor = measures; IoE device = measures, connects and triggers action" } },

    { page: "Language, surveys, social media and transactions" },
    { h: "Natural language" },
    { kv: [
      ["What it is", "human language as people speak or write it — not forms or codes."],
      [
        "How it collects data",
        "voice assistants and phone lines record **speech**; chatbots, emails, reviews, complaints and free-text boxes capture **text**; **natural language processing (NLP)** turns it into data — speech-to-text, keywords, sentiment."
      ],
      ["Data generated", "**unstructured** text and audio."],
      [
        "When it is used",
        "analysing customer-service calls and chatbot logs; reading reviews and complaints for sentiment; voice commands; translation."
      ]
    ] },
    { table: { head: ["Natural language: benefits", "Natural language: limitations"], rows: [
      ["Captures opinions and reasons in people's own words", "Ambiguity, sarcasm, slang, accents and dialects are hard for NLP"],
      ["Natural for users: no form to fill in", "Needs NLP tools and processing power"],
      ["Huge amounts already exist (emails, calls, reviews)", "Unstructured: hard to store and search"],
      ["Shows why customers feel as they do", "Recordings are personal data; consent and privacy"]
    ] } },
    { h: "Online surveys" },
    { kv: [
      [
        "How it collects data",
        "a questionnaire on a web page, app or email link (e.g. Microsoft Forms); answers go straight into a data set."
      ],
      [
        "Data generated",
        "**structured** answers (tick boxes, ratings, drop-downs) plus **unstructured** free-text comments — semi-structured overall."
      ],
      [
        "When it is used",
        "customer satisfaction; staff surveys; a council's public consultation; product feedback; the 2021 Census was online-first."
      ]
    ] },
    { table: { head: ["Online surveys: benefits", "Online surveys: limitations"], rows: [
      ["Cheap and quick to send to thousands", "Low response rates; self-selection bias (only keen people reply)"],
      ["Answers collated automatically; validation on fields", "Excludes people who are not online (digital divide)"],
      ["Questions targeted at exactly what is needed", "Rushed, careless or dishonest answers"],
      ["Closed questions are easy to analyse", "Badly worded questions give poor data; survey fatigue"]
    ] } },
    { h: "Social media sites" },
    { kv: [
      [
        "How it collects data",
        "posts, comments, images, likes, shares and follows on platforms (X, Facebook, Instagram, TikTok, LinkedIn) are collected through the platform's own analytics or its API, within its terms."
      ],
      [
        "Data generated",
        "**unstructured** posts, images and video with **semi-structured** metadata (time, hashtags, likes, location)."
      ],
      [
        "When it is used",
        "sentiment analysis about a brand or policy; spotting trends early; targeted advertising; monitoring public reaction during an event."
      ]
    ] },
    { table: { head: ["Social media: benefits", "Social media: limitations"], rows: [
      ["Enormous and real time", "Veracity: bots, fake accounts, misinformation"],
      ["Opinions given freely, not prompted by a survey", "Not representative: users skew by age and interest"],
      ["Low cost to collect", "Access rules, API charges and terms of use; privacy"],
      ["Shows reach and engagement (likes, shares)", "Sarcasm, slang and emojis are hard to interpret"]
    ] } },
    { h: "Transactional records" },
    { kv: [
      [
        "How it collects data",
        "every exchange is logged automatically as it happens: a till (EPOS) sale, an online order, a card payment, a booking, a loyalty-card scan, a ticket tap."
      ],
      [
        "Data generated",
        "**structured**: date, time, item, quantity, price, payment method, store, customer or membership number."
      ],
      [
        "When it is used",
        "recording what each customer buys (SAM Q3); stock control; spotting trends and the most profitable products; fraud detection; personalised offers."
      ]
    ] },
    { table: { head: ["Transactional records: benefits", "Transactional records: limitations"], rows: [
      ["Accurate: captured automatically at the point of sale", "Shows WHAT was bought, never WHY"],
      ["Structured: easy to store, query and analyse", "Only covers customers who buy — and cash sales may not link to a customer"],
      ["Linked to a customer (loyalty number) for personal offers", "Very high volume to store"],
      ["Real time: stock and fraud checks at once", "Personal data: UK GDPR applies"]
    ] } },
    { worked: { tag: "example", title: "Pick the best method", q: "Lowmoor City Council wants to know (a) how residents feel about a new low-emission zone and (b) whether pollution actually fell. Which capture methods suit each, and why?",
      steps: [
        { m: "(a) Feelings: an **online survey** asks every household the same questions (structured, easy to count) and **social media** shows unprompted reaction in real time — together they cover both the people who are asked and those who speak up." },
        { m: "(a) Watch out: survey replies are self-selected and social media is not representative, so neither alone is reliable (veracity)." },
        { m: "(b) Pollution: **sensors** on lamp posts measure nitrogen dioxide continuously before and after, giving objective structured data; **satellite** measurements give a city-wide picture to compare with nearby towns." }
      ], result: "Opinions → surveys + social media; facts about the air → sensors (+ satellites)" } },

    { page: "In exam questions" },
    { callout: { t: "info", h: "The scenario for these questions", body: "**Lowmoor City Council** runs a “Clean Air Lowmoor” project: air-quality sensors on lamp posts, GPS trackers on buses and bin lorries, number-plate cameras, an online residents' survey, a website chatbot, and a parking app that records every car-park payment." } },
    { worked: { tag: "exam", title: "What big data capture is", src: "OCR-style · Describe · 1 mark",
      q: "Lowmoor City Council is collecting data from many sources for its Clean Air project. Describe what is meant by big data capture.",
      steps: [
        { m: "Collecting / gathering data from its sources (people, devices, the environment) into the organisation's systems so it can be stored and analysed (1).", mk: "1", n: "Credit any other appropriate response. Naming one method alone is not a description." }
      ], result: "Gathering data from sources into systems for storage and analysis" } },
    { worked: { tag: "exam", title: "Why capture transactional data", src: "OCR-style · State · 1 mark",
      q: "Every payment made at Lowmoor's car parks through the parking app is captured and saved against the driver's account. Why does the council capture this transactional data?",
      steps: [
        { m: "Any one from: to keep a record of each payment — when, where and how much (1) · to record which car parks each driver uses (1) · to see how busy each car park is (1).", mk: "1", n: "Modelled on SAM Q3(a). Credit any other appropriate response." }
      ], result: "To record each parking payment (when, where, how much)" } },
    { worked: { tag: "exam", title: "A benefit of the transactional data", src: "OCR-style · Explain · 2 marks",
      q: "Explain one benefit to Lowmoor City Council of using the transactional data from the parking app.",
      steps: [
        { m: "Identify one benefit (1)…", mk: "1", n: "Modelled on SAM Q3(b). One mark for the benefit, one for applying it to the council." },
        { m: "…apply it (1), e.g.: busy times and car parks can be identified (1) so prices or park-and-ride buses can be adjusted to cut traffic in the centre (1) · income per car park can be analysed (1) so under-used car parks can be closed or repurposed (1) · trends after the low-emission zone starts can be seen (1) so the council knows if drivers changed behaviour (1).", mk: "1", n: "Up to two marks for one benefit. Maximum one benefit." }
      ], result: "e.g. busy times identified (1) → prices / buses adjusted to cut traffic (1)" } },
    { worked: { tag: "exam", title: "Identify the capture method", src: "OCR-style · Identify · 3 marks",
      q: "Lowmoor City Council collects three kinds of data: (i) the position of each bus every ten seconds; (ii) residents' comments about the low-emission zone posted on X and Facebook; (iii) nitrogen-dioxide levels measured on lamp posts. Identify the data capture method used for each.",
      steps: [
        { m: "(i) GPS signals (1)", mk: "1", n: "Accept: GPS. Do not accept: satellites (the bus's receiver captures the data)." },
        { m: "(ii) Social media sites (1)", mk: "1", n: "Do not accept: natural language alone — the source here is social media." },
        { m: "(iii) Sensors (1)", mk: "1", n: "Accept: IoE connected devices if the answer makes clear they are connected and send data. Correct answers only." }
      ], result: "GPS signals · social media sites · sensors",
      try: [{ grid: { cols: ["Data the council collects", "Capture method (one or two words)"], rows: [
        ["Bus positions every ten seconds", "GPS"],
        ["Residents' posts about the zone on X", "Social media"],
        ["Nitrogen-dioxide readings on lamp posts", "Sensors"],
        ["Number-plate camera footage at the zone's edge", "Video"],
        ["Payments made through the parking app", "Transactions"],
        ["Questions typed to the website chatbot", "Natural language"],
        ["Images of tree cover across the city from orbit", "Satellites"]
      ], given: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]], cap: "Type: GPS, Social media, Sensors, Video, Transactions, Natural language or Satellites." } }] } },
    { worked: { tag: "exam", title: "A limitation of online surveys", src: "OCR-style · Explain · 2 marks",
      q: "The council emails an online survey to residents asking for their views on the low-emission zone. Explain one limitation to the council of using an online survey to capture this data.",
      steps: [
        { m: "Identify: only some residents will reply / self-selection bias / residents without internet access are left out (1)…", mk: "1" },
        { m: "…apply: so the views captured may not represent all of Lowmoor — e.g. older residents or those strongly against the zone may dominate — and the council could make the wrong decision (1).", mk: "1", n: "Other limitations: careless or dishonest answers (1) so results are unreliable (1). Maximum one limitation." }
      ], result: "Not everyone replies (1) → unrepresentative views, wrong decision (1)" } },
    { worked: { tag: "exam", title: "Social media: a benefit and a limitation", src: "OCR-style · Explain · 4 marks",
      q: "The council plans to capture posts from social media sites to judge public reaction to the low-emission zone. Explain one benefit and one limitation to the council of capturing data from social media sites.",
      steps: [
        { m: "Benefit — identify: data is available in real time / in large amounts (1)…", mk: "1", n: "Modelled on the shape of SAM Q6(e) and Q8: up to two marks for a benefit, up to two for a limitation." },
        { m: "…apply: so the council can see reaction on the day the zone starts and respond quickly, e.g. correcting misunderstandings about charges (1).", mk: "1" },
        { m: "Limitation — identify: low veracity — posts may come from bots, fake accounts or people outside Lowmoor / users are not representative (1)…", mk: "1" },
        { m: "…apply: so the council may over- or under-estimate opposition and base its review of the zone on misleading data (1).", mk: "1", n: "Maximum one benefit and one limitation. Credit any other appropriate response." }
      ], result: "Real-time reaction (1+1); unreliable / unrepresentative (1+1)" } },
    { h: "Levels of response: 6-mark “Analyse” questions" },
    { table: { head: ["Level", "Marks", "What the answer shows"], rows: [
      [
        "3 (high)",
        "5–6",
        "a thorough analysis: a range of points; detailed knowledge applied to the scenario; clear explanation of each impact; terms used consistently."
      ],
      [
        "2 (mid)",
        "3–4",
        "an adequate analysis: some points; sound knowledge in context; adequate explanation; some terms."
      ],
      [
        "1 (low)",
        "1–2",
        "a basic analysis: at least one point; limited context; basic explanation; few terms."
      ],
      ["0", "0", "nothing worthy of credit."]
    ] } },
    { worked: { tag: "exam", title: "Sensors and IoE devices for air quality", src: "OCR-style · Analyse · 6 marks",
      q: "Lowmoor City Council wants to measure air quality across the city using sensors on lamp posts that are connected to the internet. Analyse the benefits and limitations to the council of using sensors and IoE connected devices to capture this data.",
      steps: [
        { m: "Benefit: readings are captured automatically and continuously, so the council has data for every hour without paying staff to take samples.", mk: "1", n: "Indicative content. A point with its impact on the council supports Level 2." },
        { m: "Benefit: data is streamed in real time (velocity), so pollution spikes near schools can trigger alerts or traffic changes straight away.", mk: "1", n: "Chain of reasoning in context → Level 3." },
        { m: "Benefit: objective, structured numeric data is easy to store and analyse, e.g. comparing before and after the low-emission zone.", mk: "1", n: "Use of terms (structured, velocity) supports Level 3." },
        { m: "Limitation: sensors drift or fail, giving inaccurate readings (veracity), which could lead the council to wrong conclusions about the zone unless they are calibrated and checked.", mk: "1", n: "Limitations explained, not just listed, for Level 3." },
        { m: "Limitation: cost of buying, powering, connecting and maintaining hundreds of devices, plus storing the large volume of readings.", mk: "1" },
        { m: "Limitation: connected devices can be hacked or lose connection, leaving gaps in the data; sensors show what the air is like but not why.", mk: "1", n: "Balance across benefits and limitations is needed for Level 3." }
      ], result: "Level 3: benefits and limitations both explained with impacts on the council, using terms such as velocity, veracity and structured data." } },

    { page: "Exam toolkit" },
    { steps: [
      { h: "Know all nine", m: "images/video · GPS · IoE devices · natural language · online surveys · satellites · sensors · social media · transactional records." },
      { h: "For each", m: "how it collects · when it is used · the data type it generates · a benefit · a limitation." },
      { h: "Name the method precisely", m: "a phone's location is GPS signals, not satellites; posts are social media, a chatbot is natural language." },
      { h: "Explain (2)", m: "identify the benefit or limitation, then say what it means for the organisation." },
      { h: "Transactional data", m: "records what was bought / paid, when and where — never why." }
    ] },
    { callout: { t: "tip", h: "How OCR marks it", body: [
      "**Why… capture?** (1 mark) wants the purpose: “to record the purchases made by the customer”.",
      "**Explain one benefit** (2): benefit (1) + application to the organisation (1); the expansion must relate to the scenario (online or in store, the council's car parks…).",
      "“Maximum one benefit”: a second benefit earns nothing — develop one instead.",
      "In “Identify” questions, name the method with the spec's words; vague answers (“technology”, “the internet”) earn nothing."
    ] } },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "“GPS data is captured by the satellites.” — satellites broadcast; the receiver works out and records its position.",
      "“Sensors and IoE devices are the same.” — a sensor measures; an IoE device connects and shares (it may contain sensors).",
      "“Surveys give the truth.” — they give what people choose to say; response bias lowers veracity.",
      "“Social media shows what the public thinks.” — it shows what active users post, including bots.",
      "“Transactional data explains customer behaviour.” — it shows what happened, not why."
    ] } },
    { callout: { t: "mnemonic", h: "“Three S's and a TIGON”", body: [
      "Three **S**'s: **S**atellites · **S**ensors · **S**ocial media sites.",
      "A **TIGON** (a tiger–lion cross): **T**ransactional records · **I**mages and videos (digital) · **G**PS signals · **I**oE connected devices · **O**nline surveys · **N**atural language.",
      "Data type rule of thumb: **machines count → structured; people talk → unstructured; forms → both.**"
    ] } },
    { callout: { t: "tip", h: "Synoptic links", body: [
      "F200 2.2 — creation and capture in the data lifecycle; F200 1.3 — the file formats captured data arrives in (JPEG, PNG, WAV, CSV, JSON, XML).",
      "F201 1.1 — capture is the data collection step and drives Velocity and Variety; 1.2 — devices and the IoE that made capture possible.",
      "F201 2.1 — structured, semi-structured and unstructured data; 2.2 — cleaning what was captured; 4.1–4.2 — UK GDPR, consent and ethics of capture.",
      "F204 — IoE devices and sensors in depth; F206 — social media and survey data in digital marketing."
    ] } }
  ],
  flashcards: [
    ["List the nine big data capture methods in the specification.", "Digital images and videos, GPS signals, IoE connected devices, natural language, online surveys, satellites, sensors, social media sites, transactional records.", 0],
    ["What is meant by big data capture?", "Collecting data from its sources (people, devices, the environment) into an organisation's systems so it can be stored and analysed.", 1],
    ["What type of data do GPS signals generate?", "Structured data — latitude, longitude, height and a time stamp (and speed or direction derived from them).", 2],
    ["Give one benefit and one limitation of capturing data with sensors.", "Benefit: automatic, continuous, objective readings. Limitation: they drift or fail, giving inaccurate data, and give no context.", 3],
    ["Why is data from social media sites often low in veracity?", "Bots, fake accounts and misinformation, and users are not representative of the whole population.", 4],
    ["Which capture methods mostly produce unstructured data?", "Digital images and videos, natural language, social media posts (and satellite images) — they need AI or NLP to interpret.", 5],
    ["What type of data do online surveys produce, and what is a key limitation?", "Structured answers plus free-text comments (semi-structured); limitation: low response and self-selection bias.", 6],
    ["When would satellites be the best capture method?", "When data is needed over huge or remote areas, repeatedly — e.g. weather forecasting, flood mapping, crop health.", 7],
    ["Why are transactional records a reliable source of data?", "They are captured automatically at the point of sale as structured records, so they are accurate and complete.", 8],
    ["Give one limitation of capturing digital images and videos.", "Very large files to store and process, and AI is needed to extract meaning (plus privacy of people filmed).", 9],
    ["Why does a retailer capture each customer's transactional data?", "To record the purchases the customer makes — what, when and where (online or in store) (SAM Q3(a)).", 100],
    ["How is natural language turned into data an organisation can analyse?", "Speech and text are captured and processed with NLP — speech-to-text, keywords and sentiment analysis.", 101],
    ["What is the difference between a sensor and an IoE connected device?", "A sensor measures a physical quantity; an IoE device is connected to the internet and shares data automatically (often containing sensors).", 102],
    ["State one limitation of GPS as a capture method.", "The signal is weak or lost indoors, in tunnels and between tall buildings (also battery use and privacy).", 103],
    ["Give one limitation of satellite data for an organisation.", "Cloud cover blocks optical images; the data can be costly, huge and need specialist skills.", 104],
    ["What is one limitation of transactional records for understanding customers?", "They show what was bought, not why — and cash sales may not be linked to a customer.", 105]
  ],
  quiz: [
    { q: "A delivery firm records the location of every van each minute. Which capture method is this?", opts: ["Satellites", "Sensors", "GPS signals", "Online surveys"], ans: 2, why: "The van's GPS receiver works out and records its position." },
    { q: "Which capture method mostly produces structured data?", opts: ["Transactional records", "Natural language", "Social media posts", "Digital video footage"], ans: 0, why: "Sales and payments are logged in fixed fields: date, item, price, customer." },
    { q: "What is the main veracity problem with social media data?", opts: ["It is always out of date", "It cannot hold any images", "It has no time stamps at all", "Bots and fake accounts post"], ans: 3, why: "Bots, fake accounts and misinformation lower its trustworthiness." },
    { q: "Which is a limitation of online surveys?", opts: ["They cost a great deal to send", "Only keen people tend to reply", "Answers cannot be collated", "They cannot ask closed questions"], ans: 1, why: "Self-selection bias and low response rates make results unrepresentative." },
    { q: "A council needs flood maps of a whole region after a storm. Which method suits best?", opts: ["Satellites", "Online surveys", "Transactional records", "Natural language"], ans: 0, why: "Satellites image huge areas without anyone visiting them." },
    { q: "What turns recorded customer calls into analysable data?", opts: ["GPS tracking of the caller", "Storing it in a data warehouse", "Natural language processing", "A fixed relational schema"], ans: 2, why: "NLP converts speech and text into words, keywords and sentiment." },
    { q: "Which is a limitation of sensors?", opts: ["They need staff to take readings", "They drift and give false readings", "They only work once a year", "They produce unstructured video"], ans: 1, why: "Calibration drift and faults lower the accuracy of sensor data." },
    { q: "Which best describes an IoE connected device?", opts: ["A paper form scanned later", "A survey sent by post", "A camera with no network link", "A device that shares data online"], ans: 3, why: "An IoE device is connected and sends data automatically." },
    { q: "What can transactional records NOT tell a retailer?", opts: ["What was bought", "When it was bought", "Why it was bought", "Where it was bought"], ans: 2, why: "They record the purchase, not the customer's reasons." }
  ]
};

/* =====================================================================
   F201 1.4  The purpose, importance and use of big data analytics
   ===================================================================== */
function areasFig() {
  var it = [], A = [
    ["Banking", "fraud checks, credit risk", "accent"], ["Comms, media, entertainment", "recommendations, networks", "accent2"], ["Education", "spot students at risk", "accent3"],
    ["Energy and utilities", "smart meters, demand", "accent2"], ["Government", "plan services, tax fraud", "accent3"], ["Healthcare", "predict demand, diagnose", "danger"],
    ["Insurance", "price risk, catch fraud", "accent"], ["Manufacturing", "predictive maintenance", "it"], ["Retail", "stock, offers, loyalty", "accent"]
  ];
  A.forEach(function (a, i) {
    var x = 10 + (i % 3) * 210, y = 10 + Math.floor(i / 3) * 70;
    it = it.concat(box(x, y, 200, 58, [a[0], a[1]], { col: a[2], size: 11.5 }));
  });
  it.push(txt(320, 232, "Same idea everywhere: data → patterns → a better, evidence-based decision", { b: true, size: 10.5, c: "text2" }));
  return { fig: { w: 640, h: 246, items: it, cap: "The nine areas of application in the specification, each with its headline use of big data analytics." } };
}

C["it:F201.1.4"] = {
  notes: [
    { h: "The purpose, importance and use of big data analytics — the whole topic on one page" },
    { h: "What the specification asks (F201 1.4)" },
    { kv: [
      [
        "Teaching content",
        "**Areas of application**: banking · communications, media and entertainment · education · energy and utilities · government · healthcare · insurance · manufacturing · retail."
      ],
      [
        "To include",
        "the **purpose** of the use of big data analytics in each area · the **benefits and limitations** of its use in each area."
      ],
      [
        "Does not include",
        "no exclusions are listed. How the analysis is done (mining, techniques, ML) is Topic Areas 2–3; the law and ethics are Topic Area 4."
      ]
    ] },
    { table: { head: ["Question shape", "Command word", "Marks", "Nearest evidence"], rows: [
      ["The purpose of data analytics", "Describe", "1", "SAM Q6(a)"],
      ["How analytics helps this organisation decide", "Explain", "2", "SAM Q6(b)"],
      ["A benefit and a limitation in this area", "Explain", "4", "SAM Q8"],
      ["Should the organisation use analytics for X?", "Discuss", "9", "SAM Q6(c) shape"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Why organisations use big data analytics**.", "**Banking, insurance and retail**.", "**Government, healthcare and education**.", "**Energy, manufacturing and media**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "Why organisations use big data analytics" },
    { callout: { t: "def", h: "Big data analytics", body: "Examining large, varied data sets to find **patterns, trends, relationships and preferences**, so an organisation can **make sense of its data** and make **informed, evidence-based decisions**. (SAM Q6(a): “to help make sense of the collected data” / “to identify trends and patterns to help decision making”.)" } },
    areasFig(),
    { table: { head: ["Purpose", "What it means", "Example"], rows: [
      ["Predict", "forecast what will happen", "A&E admissions next week; demand for electricity tonight"],
      ["Personalise", "tailor products and offers to each person", "film recommendations; loyalty-card offers"],
      ["Protect", "spot fraud, risk and faults early", "an unusual card payment blocked"],
      ["Plan and perform", "use resources efficiently", "staff rotas, stock levels, machine servicing"]
    ] } },
    { callout: { t: "info", h: "Why it is important", body: [
      "Decisions move from **guesswork and reaction** to **evidence and anticipation** — acting before a problem happens.",
      "**Efficiency**: less waste, lower costs, resources where they are needed.",
      "**Competitive advantage**: organisations that understand customers better win and keep them.",
      "**Better services**: earlier diagnosis, fewer outages, faster claims, safer payments."
    ] } },
    { table: { head: ["Benefits in every area", "Limitations in every area"], rows: [
      ["Informed decisions based on evidence", "Results are only as good as the data (veracity): garbage in, garbage out"],
      ["Patterns found that people would miss", "Cost: storage, software, specialist staff (data scientists)"],
      ["Faster, often real-time, responses", "Privacy and security of personal data; UK GDPR compliance"],
      ["Savings and new income", "Bias in data or algorithms can treat groups unfairly"],
      ["Personal service for each customer", "Past patterns may not hold when things change (variability)"]
    ] } },

    { page: "Banking, insurance and retail" },
    { h: "Banking" },
    { kv: [
      [
        "Purpose",
        "detect **fraud** in real time; assess **credit risk** for loans and cards; anti-money-laundering checks; personalise products; predict which customers may leave."
      ],
      [
        "How",
        "each card payment is scored against the customer's usual pattern (place, amount, time) in milliseconds; lending decisions use repayment histories."
      ],
      [
        "Example",
        "a payment in another country minutes after one in Leeds is blocked and the customer is sent a text to confirm."
      ]
    ] },
    { table: { head: ["Banking: benefits", "Banking: limitations"], rows: [
      ["Less money lost to fraud; customers protected", "False positives block genuine payments and annoy customers"],
      ["Faster, more consistent lending decisions", "Biased credit models can be unfair; people have rights over automated decisions"],
      ["Products and advice suited to each customer", "Highly sensitive financial data: a breach is very damaging"],
      ["Meets legal duties on money laundering", "Old (legacy) banking systems are hard to connect"]
    ] } },
    { h: "Insurance" },
    { kv: [
      [
        "Purpose",
        "**price premiums by risk**; detect **fraudulent claims**; settle claims faster; model large risks such as floods."
      ],
      [
        "How",
        "telematics “black boxes” or apps record how a policyholder drives (speed, braking, time of day); claims are compared with patterns of known fraud; flood maps use weather and river data."
      ],
      ["Example", "a young driver who drives smoothly in daylight earns a lower renewal price."]
    ] },
    { table: { head: ["Insurance: benefits", "Insurance: limitations"], rows: [
      ["Fairer, often cheaper, premiums for low-risk customers", "High-risk people may be priced out of cover"],
      ["Fraudulent claims caught, keeping prices down", "Privacy: tracking where and how people drive"],
      ["Faster claims decisions", "Proxies (e.g. postcode) can discriminate unfairly"],
      ["Better models of floods and other big risks", "A faulty device or data error can raise a price wrongly"]
    ] } },
    { h: "Retail" },
    { kv: [
      [
        "Purpose",
        "forecast **demand** and manage **stock**; set prices and promotions; **personalise** offers through loyalty schemes; group customers (cluster analysis); decide new products and store layouts."
      ],
      [
        "How",
        "transactional records linked to loyalty numbers, website clicks, weather and local events are analysed for patterns (SAM Q3, Q6)."
      ],
      [
        "Example",
        "a supermarket stocks more barbecue food in stores where a heatwave is forecast and sends members money-off vouchers for items they often buy."
      ]
    ] },
    { table: { head: ["Retail: benefits", "Retail: limitations"], rows: [
      ["Right stock in the right store: fewer empty shelves, less waste", "Wrong predictions when habits change suddenly (e.g. the pandemic)"],
      ["Personal offers increase sales and loyalty", "Customers may find personalisation intrusive"],
      ["Popular and poor-selling products identified", "Cost of systems and analysts"],
      ["Prices and promotions tested on evidence", "Loyalty data covers members only — not all shoppers"]
    ] } },

    { page: "Government, healthcare and education" },
    { h: "Government" },
    { kv: [
      [
        "Purpose",
        "**plan public services** (schools, housing, transport); detect **tax and benefit fraud**; target policing and emergency services; evaluate policies; run smart-city systems."
      ],
      [
        "How",
        "census and survey data (the ONS), records from departments cross-matched (HMRC's Connect system compares many data sources to find undeclared income), sensor and traffic data."
      ],
      [
        "Example",
        "a council uses population forecasts and birth data to decide where a new primary school is needed."
      ]
    ] },
    { table: { head: ["Government: benefits", "Government: limitations"], rows: [
      ["Evidence-based policy and planning", "Surveillance and privacy fears reduce public trust"],
      ["Public money saved by catching fraud", "Biased data can lead to unfair treatment of groups"],
      ["Services sent where need is greatest", "Departments' data is in separate, old systems (silos)"],
      ["Faster response in emergencies", "Large projects are costly to taxpayers; breaches are serious"]
    ] } },
    { h: "Healthcare" },
    { kv: [
      [
        "Purpose",
        "**predict demand** (A&E, beds, staff); **earlier diagnosis** (AI reading scans); track disease in the population; personalised medicine; research into treatments; remote monitoring of patients at home."
      ],
      [
        "How",
        "patient records, appointment and admission data, test results, scans, wearables and population data are analysed."
      ],
      [
        "Example",
        "a hospital trust forecasts winter admissions from past years and flu data, and opens extra beds before the peak."
      ]
    ] },
    { table: { head: ["Healthcare: benefits", "Healthcare: limitations"], rows: [
      ["Earlier diagnosis and better outcomes", "Health data is special category data under UK GDPR: extra protection needed"],
      ["Beds, staff and theatres used efficiently", "Patient trust: NHS England's care.data plan was dropped in 2016 after public concern"],
      ["Outbreaks spotted early", "Bias if some groups are under-represented in the data"],
      ["Faster research into treatments", "Systems that do not share data; an error could harm a patient"]
    ] } },
    { h: "Education" },
    { kv: [
      [
        "Purpose",
        "**track progress and attendance**; identify students **at risk** of falling behind or dropping out; **personalise** learning; plan staffing and resources; national policy (the DfE's National Pupil Database)."
      ],
      [
        "How",
        "learning analytics from attendance, assessment results, homework platforms and virtual learning environments."
      ],
      [
        "Example",
        "a college flags students whose attendance and online activity have dropped so tutors can contact them early."
      ]
    ] },
    { table: { head: ["Education: benefits", "Education: limitations"], rows: [
      ["Early support for students who are struggling", "Children's personal data needs strong protection"],
      ["Learning matched to each student (adaptive platforms)", "Students may be labelled; predictions can become self-fulfilling"],
      ["Evidence about which teaching works", "Online activity is not the same as learning"],
      ["Staff and resources planned better", "Staff time and skills; students without devices are missed"]
    ] } },

    { page: "Energy, manufacturing and media" },
    { h: "Energy and utilities" },
    { kv: [
      [
        "Purpose",
        "**forecast demand** and balance supply (especially with weather-dependent wind and solar); **smart meter** data for accurate bills and time-of-use tariffs; **predictive maintenance** of networks; find water leaks; respond to outages."
      ],
      [
        "How",
        "smart meters send readings (often half-hourly), sensors monitor pipes and cables, weather forecasts are combined with past demand."
      ],
      [
        "Example",
        "a supplier offers cheaper electricity overnight when demand is low, and its customers shift washing and car charging to then."
      ]
    ] },
    { table: { head: ["Energy and utilities: benefits", "Energy and utilities: limitations"], rows: [
      ["Less waste; supply matched to demand", "Smart-meter data shows when people are at home (privacy)"],
      ["Accurate bills, no estimated readings", "Installation costs; meters that lose connection"],
      ["Renewables used more effectively", "Critical infrastructure is a target for cyber attack"],
      ["Faults fixed before customers lose supply", "Unusual weather or events break the forecasts"]
    ] } },
    { h: "Manufacturing" },
    { kv: [
      [
        "Purpose",
        "**predictive maintenance** (fix machines before they break); **quality control** (cameras spot defects); optimise the supply chain and production schedule; forecast demand."
      ],
      [
        "How",
        "sensors measure vibration, temperature and power use on machines; images of products are checked by AI; supply and order data are combined."
      ],
      [
        "Example",
        "jet-engine makers monitor engines in flight (e.g. Rolls-Royce's engine health monitoring) and schedule servicing before a fault develops."
      ]
    ] },
    { table: { head: ["Manufacturing: benefits", "Manufacturing: limitations"], rows: [
      ["Less downtime: repairs planned, not emergencies", "Sensors and systems are expensive to fit to older machines"],
      ["Fewer defects and less waste", "Needs data and engineering skills"],
      ["Lower stock and costs in the supply chain", "Connected factories can be attacked (cyber security)"],
      ["Production matched to demand", "False alarms stop lines unnecessarily"]
    ] } },
    { h: "Communications, media and entertainment" },
    { kv: [
      [
        "Purpose",
        "**recommend** content; understand audiences; decide what to make or buy; target **advertising**; schedule and price; for telecoms, **manage networks** (predict congestion, plan new masts) and predict customers leaving."
      ],
      [
        "How",
        "viewing and listening histories, clicks, ratings, social media reaction, and network traffic data."
      ],
      [
        "Example",
        "a streaming service recommends shows from what similar viewers watched and uses viewing data to decide which series to renew."
      ]
    ] },
    { table: { head: ["Comms, media, entertainment: benefits", "Comms, media, entertainment: limitations"], rows: [
      ["Viewers find content they like: more use, fewer cancellations", "Filter bubbles: people see more of the same"],
      ["Targeted adverts earn more", "Privacy of viewing and location data"],
      ["Commissioning decisions backed by evidence", "New content has no data yet (the “cold start” problem)"],
      ["Networks kept running smoothly", "Chasing clicks can favour sensational content"]
    ] } },
    { worked: { tag: "example", title: "Which area, and what purpose?", q: "Name the area of application and the purpose of big data analytics in each case.",
      steps: [
        { m: "A card payment is blocked seconds after it is made → **banking**: fraud detection." },
        { m: "Vibration readings tell engineers to replace a bearing next week → **manufacturing**: predictive maintenance." },
        { m: "A trust opens extra beds before the winter peak → **healthcare**: predicting demand." },
        { m: "A smooth driver's renewal price falls → **insurance**: pricing by risk (telematics)." }
      ], result: "Banking · Manufacturing · Healthcare · Insurance",
      try: [{ grid: { cols: ["Use of big data analytics", "Area (one word)"], rows: [
        ["Half-hourly meter readings set a cheaper overnight tariff", "Energy"],
        ["A tutor is alerted when a student's attendance drops", "Education"],
        ["A council finds where a new primary school is needed", "Government"],
        ["Vouchers are sent for products a member often buys", "Retail"],
        ["A streaming service decides which series to renew", "Media"],
        ["A claim is flagged because it matches known fraud patterns", "Insurance"],
        ["A loan decision is made from repayment history", "Banking"]
      ], given: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]], cap: "Type one word: Banking, Media, Education, Energy, Government, Healthcare, Insurance, Manufacturing or Retail." } }] } },

    { page: "In exam questions" },
    { callout: { t: "info", h: "The scenario for these questions", body: "**Westbridge Hospitals NHS Trust** runs two hospitals and community clinics. It holds patient records, A&E arrival times, bed occupancy and staff rotas, and wants to use big data analytics to plan its services. Two questions at the end use other areas, as a paper may." } },
    { worked: { tag: "exam", title: "The purpose of data analytics", src: "OCR-style · Describe · 1 mark",
      q: "Westbridge Hospitals NHS Trust collects data on every patient visit. Describe the purpose of big data analytics for the trust.",
      steps: [
        { m: "One from: to help the trust make sense of the data it collects (1) · to analyse the raw data to identify trends and patterns that help decision making (1).", mk: "1", n: "Modelled on SAM Q6(a). Maximum one description; credit any other appropriate response." }
      ], result: "To find trends/patterns in the data that help the trust make decisions" } },
    { worked: { tag: "exam", title: "How analytics helps plan A&E staffing", src: "OCR-style · Explain · 2 marks",
      q: "The trust wants to plan how many A&E staff are needed on each shift. Explain how big data analytics could help the trust to make this decision.",
      steps: [
        { m: "Identify an action: the analytics will identify patterns / trends in past A&E arrivals by day, time and season (1)…", mk: "1", n: "Modelled on SAM Q6(b): one mark for the action, one for how the trust uses it." },
        { m: "…apply: so the trust can predict busy shifts (e.g. Saturday nights, winter) and roster more staff then, reducing waiting times (1).", mk: "1", n: "The expansion must relate to the trust / A&E staffing. Maximum one explanation." }
      ], result: "Patterns in arrivals (1) → staff rostered for predicted peaks (1)" } },
    { worked: { tag: "exam", title: "A limitation for the trust", src: "OCR-style · Explain · 2 marks",
      q: "Explain one limitation to Westbridge Hospitals NHS Trust of using big data analytics on its patient records.",
      steps: [
        { m: "Identify: patient records are highly sensitive (special category) personal data / a data breach is a serious risk (1)…", mk: "1" },
        { m: "…apply: so the trust must spend on security and UK GDPR compliance, and a breach could mean fines and loss of patients' trust (1).", mk: "1", n: "Other limitations: inaccurate or incomplete records (1) leading to wrong predictions about beds or staff (1); cost of systems and analysts (1) taking money from patient care (1). Maximum one limitation." }
      ], result: "Sensitive data (1) → security cost, fines, lost trust if breached (1)" } },
    { worked: { tag: "exam", title: "Insurance: a benefit and a limitation", src: "OCR-style · Explain · 4 marks",
      q: "A car insurer offers young drivers a policy with a telematics app that records how and when they drive. Explain one benefit and one limitation to the insurer of using big data analytics on the telematics data.",
      steps: [
        { m: "Benefit — identify: premiums can be priced on each driver's actual risk (1)…", mk: "1", n: "Modelled on the shape of SAM Q8: up to two marks each for one benefit and one limitation." },
        { m: "…apply: so careful drivers are offered lower prices and stay with the insurer, while risky drivers pay for their risk (1).", mk: "1" },
        { m: "Limitation — identify: drivers may see the tracking as an invasion of privacy / the data may be wrong if the phone is in a passenger's pocket (1)…", mk: "1" },
        { m: "…apply: so customers may choose another insurer, or be charged unfairly, harming the insurer's reputation (1).", mk: "1", n: "Answers must focus on the insurer. Maximum one benefit and one limitation." }
      ], result: "Risk-based pricing (1+1); privacy or data errors (1+1)" } },
    { worked: { tag: "exam", title: "Energy: a benefit of smart-meter analytics", src: "OCR-style · Explain · 2 marks",
      q: "An energy supplier receives half-hourly readings from its customers' smart meters. Explain one benefit to the supplier of using big data analytics on this data.",
      steps: [
        { m: "Identify: demand can be forecast more accurately / patterns of use by time of day are found (1)…", mk: "1" },
        { m: "…apply: so the supplier buys or generates the right amount of energy, wasting less, and can offer cheaper off-peak tariffs (1).", mk: "1", n: "Other benefits: accurate bills without estimated readings (1) so fewer complaints (1). Credit any other appropriate response." }
      ], result: "Accurate demand forecasts (1) → less waste, off-peak tariffs (1)" } },
    { callout: { t: "info", h: "Levels of response: 9-mark “Discuss” questions", body: [
      "Use all three bullets of the question: benefits, limitations, recommendation.",
      "Context in every paragraph: name the trust, its patients, its wards."
    ] } },
    { table: { head: ["Level", "Marks", "What the answer shows"], rows: [
      [
        "3 (high)",
        "7–9",
        "a thorough discussion with detailed evaluation: a range of examples of the use; benefits **and** limitations for the organisation; detailed analysis in context; a clear conclusion with detailed reasons; consistent terms."
      ],
      [
        "2 (mid)",
        "4–6",
        "an adequate discussion: some examples; some benefits **or** limitations; some analysis in context; an adequate conclusion with relevant reasons; some terms."
      ],
      [
        "1 (low)",
        "1–3",
        "a basic discussion: a few examples or points; limited analysis in context; a brief conclusion with limited reasons; few terms."
      ],
      ["0", "0", "nothing worthy of credit."]
    ] } },
    { worked: { tag: "exam", title: "Should the trust predict readmissions?", src: "OCR-style · Discuss · 9 marks",
      q: "Westbridge Hospitals NHS Trust wants to use big data analytics on patient records to predict which patients are likely to be readmitted within 30 days of going home, so that community nurses can visit them. Discuss whether the trust should use big data analytics in this way. In your answer you must write about: any benefits to the trust; any limitations to the trust; whether you would recommend that the trust uses big data analytics in this way, and your reasons.",
      steps: [
        { m: "Purpose: to find patterns in past admissions (age, condition, medicines, previous visits) that predict readmission, so care is targeted.", mk: "1", n: "Indicative content, modelled on the shape of SAM Q6(c). Stating the purpose in context supports Level 2." },
        { m: "Benefit: nurses visit the patients most at risk first, so problems are caught early and fewer patients return to hospital.", mk: "1", n: "A benefit with its impact on the trust → Level 2–3." },
        { m: "Benefit: fewer readmissions free beds and reduce costs, easing winter pressure on wards.", mk: "1" },
        { m: "Benefit: evidence replaces guesswork, and the model can be checked against outcomes and improved over time.", mk: "1", n: "A range of benefits → Level 3." },
        { m: "Limitation: patient records are special category data; using them needs a lawful basis, strong security and transparency with patients, or trust and UK GDPR compliance suffer.", mk: "1", n: "Limitations in context needed for Level 3." },
        { m: "Limitation: incomplete or inaccurate records (veracity) give wrong predictions — a high-risk patient could be missed.", mk: "1" },
        { m: "Limitation: bias — if some groups are under-represented in past data, the model may under-predict their risk, which is unfair.", mk: "1", n: "Use of terms (veracity, bias) supports Level 3." },
        { m: "Limitation: cost of software, analysts and training, and nurses may over-rely on the score instead of their judgement.", mk: "1" },
        { m: "Conclusion: recommend it as decision support, not a replacement for clinical judgement — with data cleaned, patients informed, the model tested for bias and its results monitored.", mk: "1", n: "A clear recommendation with detailed reasons is needed for Level 3. Credit a reasoned recommendation either way." }
      ], result: "Level 3: purpose, several benefits and limitations in the trust's context, terms used, and a justified recommendation with conditions." } },
    { worked: { tag: "example", title: "Model answer (Level 3)", q: "The 9-mark answer above, written out in four paragraphs.",
      steps: [
        { m: "The trust would analyse past patient records — age, condition, medicines and earlier visits — to find the patterns that came before a readmission. Community nurses could then visit the patients the model rates most at risk." },
        { m: "The main benefit is earlier care: problems are caught at home, so fewer patients come back to hospital. That frees beds and money, which matters most in winter, and decisions about who to visit rest on evidence rather than guesswork." },
        { m: "However, patient records are special category data, so the trust needs a lawful basis, strong security and openness with patients. If records are incomplete (low veracity) or some groups are under-represented, the model could miss high-risk patients or treat groups unfairly (bias). Software, analysts and training also cost money." },
        { m: "I would recommend the trust goes ahead, but uses the predictions to support nurses' judgement, not replace it. It should clean the data, test the model for bias, tell patients how their data is used, and check each month whether readmissions are actually falling." }
      ], result: "Purpose · benefits · limitations · justified recommendation → Level 3" } },

    { page: "Exam toolkit" },
    { steps: [
      { h: "Learn nine pairs", m: "for every area: a purpose (with an example) + a benefit + a limitation." },
      { h: "The common purpose", m: "make sense of data → patterns and trends → informed decisions." },
      { h: "Four Ps", m: "Predict · Personalise · Protect · Plan — every area does at least one." },
      { h: "Explain (2)", m: "action/benefit (1) + how THIS organisation uses it (1)." },
      { h: "Discuss (9)", m: "purpose in context, benefits, limitations, a recommendation with conditions." }
    ] },
    { callout: { t: "tip", h: "How OCR marks it", body: [
      "SAM Q6(b)-style: “The expansion must relate to the retailer / product buying” — a generic expansion loses the second mark.",
      "SAM Q8-style: “Answers must focus on the [organisation]” — write about its warehouse, wards or customers.",
      "Benefits and limitations must be **of using big data analytics in that area**, not of computers in general.",
      "A 9-mark answer with no conclusion cannot reach Level 3."
    ] } },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "“Analytics makes the decision.” — it informs people's decisions; responsibility stays with the organisation.",
      "“More data always means better predictions.” — only if it is accurate, relevant and representative.",
      "“Limitations are just cost.” — also privacy, bias, data quality, skills and changing patterns.",
      "“Public bodies can use any data they hold.” — UK GDPR's principles (purpose limitation, minimisation) still apply.",
      "“Personalisation is always welcome.” — customers can find it intrusive."
    ] } },
    { callout: { t: "mnemonic", h: "The nine areas: “Big Cats Eat Eggs; Giant Hens Inspect Many Rats”", body: [
      "**B**anking · **C**ommunications, media, entertainment · **E**ducation · **E**nergy and utilities · **G**overnment · **H**ealthcare · **I**nsurance · **M**anufacturing · **R**etail (the spec's order).",
      "Purposes: the **four Ps** — Predict, Personalise, Protect, Plan."
    ] } },
    { callout: { t: "tip", h: "Synoptic links", body: [
      "F200 1.1 — data and information in society, its positive and negative impacts; F200 4.1 — legislation and the ICO.",
      "F201 1.1 (Value of data), 1.3 (how each area captures its data), 2.3 (descriptive to prescriptive mining), 2.5 (data science and analytics in each area — the spec links 2.5 to these areas), 2.6 (cluster, regression, time series).",
      "F201 3.1 (AI and ML in these areas), 4.1–4.2 (UK GDPR, bias, the Data Ethics Framework), 5.1–5.2 (environment and society).",
      "F204 — IoE in energy, manufacturing and smart cities; F206 — retail and media marketing analytics."
    ] } }
  ],
  flashcards: [
    ["List the nine areas of application for big data analytics in the specification.", "Banking; communications, media and entertainment; education; energy and utilities; government; healthcare; insurance; manufacturing; retail.", 0],
    ["What is the overall purpose of big data analytics?", "To make sense of large data sets by finding trends and patterns, so organisations make informed, evidence-based decisions.", 1],
    ["What is the purpose of big data analytics in banking?", "Real-time fraud detection, credit-risk assessment for lending, anti-money-laundering checks and personalised products.", 2],
    ["Give the purpose of big data analytics in healthcare, with a benefit and a limitation.", "Predict demand, diagnose earlier, track disease. Benefit: earlier diagnosis and efficient beds. Limitation: special category data — privacy and trust.", 3],
    ["What is the main use of big data analytics in manufacturing?", "Predictive maintenance — sensors predict machine failure so repairs are planned before breakdowns (also quality control).", 4],
    ["How does the insurance industry use big data analytics?", "To price premiums by each customer's risk (e.g. telematics), detect fraudulent claims and settle claims faster.", 5],
    ["Give one limitation of big data analytics in government.", "Surveillance and privacy fears reduce trust; data is in separate legacy systems; bias can treat groups unfairly.", 7],
    ["Why is data veracity vital in every area of application?", "Inaccurate or biased data gives wrong predictions — garbage in, garbage out — e.g. a missed high-risk patient.", 8],
    ["What is the purpose of big data analytics in energy and utilities?", "Forecast demand and balance supply (with renewables), use smart-meter data for bills and tariffs, and predict network faults.", 9],
    ["What is the purpose of big data analytics in retail?", "Forecast demand and stock, personalise loyalty offers, set prices and promotions, and decide new products.", 100],
    ["Give one benefit and one limitation of analytics in education.", "Benefit: students at risk are spotted early. Limitation: children's data privacy, and students may be labelled.", 101],
    ["How do communications, media and entertainment firms use analytics?", "Recommendations, audience insight for commissioning, targeted adverts, and (telecoms) network management.", 102],
    ["State the four Ps of what big data analytics is used for.", "Predict, Personalise, Protect (fraud, risk, faults), Plan (use resources efficiently).", 103],
    ["Give one limitation of insurers pricing premiums with big data.", "High-risk people can be priced out of cover, and tracking driving raises privacy concerns.", 104],
    ["Give one limitation of big data analytics in energy and utilities.", "Smart-meter data reveals when people are home (privacy); critical systems attract cyber attacks; forecasts fail in unusual weather.", 105]
  ],
  quiz: [
    { q: "A bank blocks a card payment made abroad minutes after one in Leeds. What is the purpose?", opts: ["Fraud detection", "Credit scoring", "Demand forecasting", "Content recommendation"], ans: 0, why: "Payments are scored against the customer's usual pattern to catch fraud." },
    { q: "Which area uses predictive maintenance as its flagship use?", opts: ["Education and schools", "Insurance and claims", "Manufacturing", "Local government"], ans: 2, why: "Machine sensors predict failures so repairs happen before breakdowns." },
    { q: "Which is a limitation of big data analytics in healthcare?", opts: ["Beds are planned more efficiently", "Outbreaks are spotted much earlier", "Diagnosis can happen sooner", "Patient data is highly sensitive"], ans: 3, why: "Health data is special category data needing extra protection; the others are benefits." },
    { q: "What does telematics data allow an insurer to do?", opts: ["Price each driver's own risk", "Build cars to a better design", "Collect income tax from drivers", "Recommend films to drivers"], ans: 0, why: "Driving behaviour data lets premiums reflect each driver's actual risk." },
    { q: "Which describes the purpose of data analytics (SAM-style)?", opts: ["To store data in one table", "To find patterns to aid decisions", "To delete out-of-date records", "To collect data from sensors"], ans: 1, why: "Analytics makes sense of data, finding trends and patterns that support decisions." },
    { q: "Which is a limitation of analytics in retail?", opts: ["Fewer empty shelves", "Less food waste", "Offers can feel intrusive", "Popular items identified"], ans: 2, why: "Personalisation can feel like an invasion of privacy; the others are benefits." },
    { q: "Smart-meter readings let a supplier offer cheaper overnight prices. Which area is this?", opts: ["Central government", "Retail banking", "Healthcare and the NHS", "Energy and utilities"], ans: 3, why: "Energy and utilities use smart-meter data to forecast demand and set tariffs." },
    { q: "What is the “cold start” problem in media recommendations?", opts: ["New content has no viewing data", "Servers start slowly in winter", "Old content is always deleted", "Viewers must log in twice daily"], ans: 0, why: "With no history, the system cannot yet tell who will like new content." },
    { q: "Which is a limitation of big data analytics in education?", opts: ["Earlier support for students", "Better planning of resources", "Students may be labelled unfairly", "Evidence about effective teaching"], ans: 2, why: "Predictions can label students and become self-fulfilling; the others are benefits." }
  ]
};

/* the Exam questions tab: one self-marked item per exam-tagged worked card */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = KOS.content.examFromWorked(C[k].notes, "OCR");
});

})(window.KOS_CONTENT);
