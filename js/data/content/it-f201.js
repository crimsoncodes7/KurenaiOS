/* Kurenai OS — deep content: OCR IT AAQ Unit F201 Big Data */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["it:F201.1.1"] = {
  notes: [
    "This leaf has two halves the spec lists separately: the **six characteristics** that *define* what makes data \"big\" (the 6 V's), and the **six steps** used to *analyse* it. The spec wants, for each characteristic: what it is, how it helps to define big data, its purpose, and when it can be used — and for each step: what is involved, its role in managing big data, and when it can be used. Cover both halves fully; questions frequently mix them.",
    { callout: { t: "def", h: "Big data", body: "Data sets so large, fast-moving or varied that traditional storage and processing tools (a single relational database on one server) cannot capture, store or analyse them within a useful timeframe. The 6 V's are the standard way of *characterising* why a data set qualifies as big data." }},

    { page: "The six characteristics (6 V's)" },
    { h: "What the 6 V's are and why they matter" },
    "Each V is a *dimension* on which a data set can be \"big\". A data set usually qualifies as big data on several at once — but naming the **dominant** V for a given scenario is the most common exam skill. For each, know the definition, *how it helps define big data*, its *purpose* (why an analyst cares), and *when it applies*.",
    { callout: { t: "def", h: "Volume", body: "The sheer **amount** of data generated and stored — measured in terabytes, petabytes or more. Defines big data because the quantity exceeds what a single machine can hold, forcing distributed storage. Purpose: drives the choice of storage infrastructure ($data$ $lakes$, distributed clusters). Applies when: an organisation accumulates huge historical or streamed datasets (e.g. years of transaction logs)." }},
    { callout: { t: "def", h: "Variety", body: "The **range of formats and sources** — structured (tables), semi-structured ($XML$/$JSON$), and unstructured (video, text, audio). Defines big data because mixed formats can't fit one rigid schema. Purpose: dictates whether you need $NoSQL$/$data$ $lakes$ rather than a relational database. Applies when: combining e.g. sensor readings + social posts + images in one analysis." }},
    { callout: { t: "def", h: "Velocity", body: "The **speed** at which data is generated and streamed, and the speed at which it must be processed to stay useful. Defines big data because real-time arrival outpaces batch tools. Purpose: drives the choice of streaming/real-time processing. Applies when: data loses value quickly — stock ticks, fraud checks, live sensor feeds." }},
    { callout: { t: "def", h: "Value", body: "The **usefulness** of the data to the organisation's goals — whether acting on it produces a worthwhile return ($ROI$). Defines big data because volume alone is worthless if no insight can be extracted. Purpose: justifies the cost of collection and storage. Applies when: deciding which data is worth keeping vs discarding." }},
    { callout: { t: "def", h: "Veracity", body: "The **accuracy, quality and trustworthiness** of the data — how complete, consistent and reliable it is. Defines big data because large, varied, fast data is often messy, biased or incomplete. Purpose: low veracity means insights cannot be trusted, so it drives the need for cleaning. Applies when: data comes from unverified sources (social media, crowd-sourced input)." }},
    { callout: { t: "def", h: "Variability", body: "The **inconsistency** of the data — in its flow rate, its meaning, or its structure **over time**. Defines big data because patterns shift (seasonal peaks, a word's sentiment changing by context). Purpose: warns analysts that a model trained once may drift and need re-training. Applies when: demand or meaning fluctuates — retail seasons, trending slang, irregular sensor bursts." }},
    { table: { head: ["V", "One-word handle", "What it drives in an analytics system"], rows: [
      ["$Volume$", "Amount", "Storage scale — distributed clusters, data lakes."],
      ["$Variety$", "Formats", "Schema choice — NoSQL / lake over relational."],
      ["$Velocity$", "Speed", "Real-time streaming vs batch processing."],
      ["$Value$", "Usefulness", "Whether the project is worth funding ($ROI$)."],
      ["$Veracity$", "Trust", "How much cleaning/validation is needed."],
      ["$Variability$", "Consistency", "Whether models must adapt to drift over time."]
    ] } },
    { callout: { t: "miscon", h: "Variety ≠ Variability; Velocity ≠ processing speed", body: "$Variety$ is about **how many different formats** you have; $Variability$ is about **inconsistency over time** in flow or meaning. They are different V's — don't conflate them. Likewise $Velocity$ measures how fast **data arrives**, not how fast the computer runs; the system must keep *pace* with velocity to avoid a bottleneck." }},

    { page: "The six analysis steps" },
    { h: "Six steps for analysing big data" },
    "This is the pipeline a data set passes through. The spec wants what each step *involves*, its *role* in managing big data, and *when* it is used. The order matters — each step feeds the next.",
    { steps: [
      { h: "1 · Data collection", m: "Gather raw data from every source — sensors, $GPS$, social media, transactional records.", n: "Role: feeds the pipeline. Without broad, representative collection later steps work on gaps. Used at ingestion, continuously for streamed sources." },
      { h: "2 · Data storing", m: "Persist the raw data in scalable systems — distributed clusters, $cloud$ storage, $data$ $lakes$.", n: "Role: makes high-volume data available for repeated processing. Used immediately after collection; choice driven by Volume and Variety." },
      { h: "3 · Data cleaning", m: "Remove duplicates, fix errors, handle missing values and standardise formats.", n: "Role: raises Veracity so later analysis is trustworthy. Used before any mining — \"garbage in, garbage out\"." },
      { h: "4 · Data mining", m: "Apply algorithms to discover hidden patterns, correlations and relationships.", n: "Role: turns clean data into candidate insights. Used once data is clean and stored; see techniques in 2.3." },
      { h: "5 · Data analysis", m: "Interpret the mined patterns against the business question to produce meaning.", n: "Role: converts patterns into decisions/recommendations. Used after mining; distinguishes correlation from useful insight." },
      { h: "6 · Data consumption", m: "Present findings via dashboards, reports and visualisations to decision-makers.", n: "Role: delivers Value — insight nobody sees earns nothing. Used at the end; closes the loop into action." }
    ] },
    { callout: { t: "info", h: "When each step is the focus", body: [
      { kv: [
        ["Collection / Storing", "Early in a project, or whenever a new data source is onboarded — dominated by Volume, Variety, Velocity."],
        ["Cleaning", "Whenever Veracity is low — unverified or merged sources. The most time-consuming step in practice."],
        ["Mining / Analysis", "Once a trustworthy dataset exists and a business question is defined."],
        ["Consumption", "When results must reach non-technical stakeholders to drive a decision."]
      ] }
    ] } },
    { callout: { t: "memorise", h: "6 V's + the pipeline", body: "V's: **Volume** (amount), **Variety** (formats), **Velocity** (speed of arrival), **Value** (usefulness/ROI), **Veracity** (trust/accuracy), **Variability** (inconsistency over time). Pipeline: **Collect → Store → Clean → Mine → Analyse → Consume.** Mnemonic for steps: \"Can Stan Clean My Awful Computer?\"" }},

    { page: "Exam technique" },
    { callout: { t: "tip", h: "Naming the dominant V", body: "Scenario questions describe a situation and ask which characteristic is *most relevant*. Match the keyword: \"500,000 posts a minute\" → Velocity; \"mix of video, text and sensor logs\" → Variety; \"data may be fake/biased\" → Veracity; \"petabytes of history\" → Volume; \"seasonal peaks\" → Variability; \"is it worth the cost\" → Value. Always justify with the data feature, not just the label." }},
    { callout: { t: "warn", h: "\"Describe\" vs \"Explain\"", body: "\"Describe a characteristic\" = state what it is. \"Explain how it helps define big data\" = link the feature to *why traditional tools fail* (e.g. Volume exceeds one server → needs distributed storage). The second verb earns the higher marks — don't just re-state the definition." }}
  ],
  flashcards: [
    ["List the $6Vs$ of big data.", "$Volume$ (amount), $Variety$ (formats), $Velocity$ (speed of arrival), $Value$ (usefulness/$ROI$), $Veracity$ (accuracy/trust), $Variability$ (inconsistency over time)."],
    ["Define $Veracity$.", "The accuracy, quality and trustworthiness of the data — how complete, consistent and reliable it is."],
    ["How does $Variability$ differ from $Variety$?", "$Variety$ = the number of different data formats/sources; $Variability$ = inconsistency in flow or meaning over time (e.g. seasonal peaks, shifting sentiment)."],
    ["Why does $Velocity$ help define data as 'big'?", "Data arrives so fast that batch tools can't keep pace — it forces real-time/streaming processing to stay useful."],
    ["What does $Value$ mean and why does it matter?", "The usefulness of the data to the organisation — whether acting on it yields a positive $ROI$. Volume is worthless without extractable insight."],
    ["List the six steps for analysing big data in order.", "Data collection → storing → cleaning → mining → analysis → consumption."],
    ["What is the role of the data cleaning step?", "To raise $Veracity$ — removing duplicates, fixing errors and missing values so later mining/analysis can be trusted."],
    ["What happens in the data consumption step?", "Findings are presented via dashboards/reports/visualisations to decision-makers — delivering the data's $Value$ as action."],
    ["Which step turns clean data into hidden patterns?", "Data mining — applying algorithms to discover correlations and relationships."],
    ["Why must cleaning come before mining?", "\"Garbage in, garbage out\" — mining errors or duplicates produces unreliable, misleading patterns."]
  ],
  quiz: [
    {
      q: "A logistics firm streams live $GPS$ from 50,000 vehicles that must be processed within seconds. Which characteristic is most relevant?",
      opts: ["$Volume$", "$Velocity$", "$Variety$", "$Value$"],
      ans: 1,
      why: "The defining feature is the speed of arrival and the need for near-instant processing — $Velocity$."
    },
    {
      q: "A retailer notices its data flow and meaning change sharply between seasons. Which V describes this?",
      opts: ["$Variety$", "$Veracity$", "$Variability$", "$Volume$"],
      ans: 2,
      why: "$Variability$ is inconsistency in flow or meaning over time — exactly seasonal fluctuation."
    },
    {
      q: "Which step directly raises the $Veracity$ of a dataset?",
      opts: ["Data storing", "Data cleaning", "Data mining", "Data consumption"],
      ans: 1,
      why: "Cleaning removes duplicates and fixes errors/missing values, improving accuracy and trustworthiness."
    },
    {
      q: "Which ordering of the analysis pipeline is correct?",
      opts: [
        "Collect → Clean → Store → Analyse → Mine → Consume",
        "Collect → Store → Clean → Mine → Analyse → Consume",
        "Store → Collect → Mine → Clean → Consume → Analyse",
        "Collect → Mine → Clean → Store → Analyse → Consume"
      ],
      ans: 1,
      why: "Raw data is collected, stored, then cleaned before mining; analysis interprets mined patterns and consumption presents them."
    },
    {
      q: "An analyst argues a dataset isn't worth keeping because no insight can be extracted from it. Which V is being questioned?",
      opts: ["$Value$", "$Volume$", "$Velocity$", "$Veracity$"],
      ans: 0,
      why: "$Value$ is whether the data is useful enough to justify its cost — usefulness, not size."
    },
    {
      q: "Which characteristic most directly forces an organisation to abandon a single relational database for a $data$ $lake$?",
      opts: ["$Value$", "$Variability$", "$Variety$", "$Veracity$"],
      ans: 2,
      why: "$Variety$ — mixed structured/semi/unstructured formats won't fit one rigid relational schema, so a flexible store is needed."
    }
  ],
  exam: [
    {
      q: "State three of the six 'V' characteristics of big data and, for each, give one example of data that demonstrates it.",
      marks: 6,
      ms: [
        "Volume (1) — e.g. years of stored transaction logs / petabytes of CCTV (1).",
        "Velocity (1) — e.g. live stock-market ticks / real-time GPS streams (1).",
        "Variety (1) — e.g. mixing video, text and sensor readings (1).",
        "Veracity (1) — e.g. unverified social-media posts of uncertain accuracy (1).",
        "(Accept Value — usefulness/ROI — and Variability — seasonal flow/meaning shifts — with valid examples.)"
      ]
    },
    {
      q: "Describe the six steps an organisation follows to analyse big data.",
      marks: 6,
      ms: [
        "Data collection — gather raw data from sources such as sensors/GPS/social media (1).",
        "Data storing — persist it in scalable storage (cloud/distributed cluster/data lake) (1).",
        "Data cleaning — remove duplicates and fix errors/missing values to raise veracity (1).",
        "Data mining — apply algorithms to find hidden patterns and relationships (1).",
        "Data analysis — interpret those patterns against the business question (1).",
        "Data consumption — present findings via dashboards/reports for decision-making (1)."
      ]
    },
    {
      q: "A hospital is building a system to analyse patient-monitor streams, scan images and clinical notes. Discuss how the 6 V's of big data apply to this system and which is most critical.",
      marks: 9,
      ms: [
        "Volume — continuous monitor and imaging data accumulates to very large datasets requiring scalable storage (1–2).",
        "Velocity — patient-monitor streams arrive in real time and must be processed instantly to flag deterioration (1–2).",
        "Variety — combines structured vitals, unstructured images and free-text notes, needing flexible storage (1–2).",
        "Veracity — accuracy is paramount; corrupt or mislabelled data could cause misdiagnosis (1–2).",
        "Value/Variability — insights must justify cost; patient patterns vary over time so models may drift (1).",
        "Judgement: Veracity is most critical here because inaccurate data risks patient safety, outweighing the others (1–2).",
        "Coherent evaluation with justified conclusion rather than a list (1)."
      ]
    }
  ]
};

C["it:F201.1.2"] = {
  notes: [
    "Big data did not appear overnight — it is the result of five technological **developments** the spec names explicitly: **database management systems**, the **Internet of Everything (IoE)**, the **proliferation of devices** generating digital data, **search engines**, and **web-based storage**. For each you must explain *how it contributed* to the evolution of big data and give its *benefits and limitations* in that role.",
    { callout: { t: "tip", h: "How to read \"evolution\"", body: "These developments stack: storage tech ($DBMS$ → web-based storage) made it *possible* to hold huge data; data-generating tech ($IoE$, device proliferation) *produced* the data; search engines forced the *processing* breakthroughs (distributed indexing) that made huge unstructured data usable. Strong answers link a development to *which V it boosted*." }},

    { page: "The five developments" },
    { callout: { t: "def", h: "Database management systems (DBMS)", body: "Software for storing, organising and querying data — evolving from flat files to relational databases ($RDBMS$, using $SQL$) and then to $NoSQL$ systems built for horizontal scaling. Contribution: gave organisations a structured way to *store and retrieve* growing datasets reliably, and $NoSQL$ later removed the rigid-schema limit so high-$Variety$ data could be stored at scale." }},
    { callout: { t: "def", h: "Internet of Everything (IoE)", body: "The networked connection of **people, processes, data and things** — extending the Internet of Things to include human and process interactions. Contribution: turned everyday objects and interactions into continuous data sources, massively increasing the $Volume$ and $Velocity$ of data generated." }},
    { callout: { t: "def", h: "Proliferation of devices generating digital data", body: "The explosion of smartphones, wearables, smart appliances and embedded sensors. Contribution: every device is a data producer — location, usage, biometric and environmental signals — so the *quantity and variety* of data sources grew exponentially, feeding the $IoE$." }},
    { callout: { t: "def", h: "Search engines", body: "Systems ($Google$ and others) that crawl, index and rank the entire web. Contribution: the need to index billions of unstructured web pages fast drove the invention of **distributed storage and processing** (e.g. the $MapReduce$/$Hadoop$ lineage) — the core technology that later made *all* big data processing feasible." }},
    { callout: { t: "def", h: "Web-based storage", body: "Online/$cloud$ storage where data is held on remote provider infrastructure ($AWS$, $Azure$, $GCP$) and accessed over the internet. Contribution: provided **affordable, elastic** capacity so organisations could store petabytes without buying their own data centres — removing the cost barrier to keeping big data." }},
    { callout: { t: "miscon", h: "IoE is broader than IoT", body: "Candidates often equate the two. $IoT$ = the *things* (connected devices). $IoE$ = things **plus people, processes and data** — the wider networked ecosystem. Device proliferation is what *populates* the $IoT$ layer of the $IoE$." }},

    { page: "Benefits & limitations" },
    { table: { head: ["Development", "Benefit to big data", "Limitation"], rows: [
      ["$DBMS$ → $NoSQL$", "Reliable structured storage/querying; NoSQL adds flexible schemas + horizontal scale for $Variety$.", "Relational schemas are rigid; NoSQL weakens $ACID$ consistency guarantees."],
      ["$IoE$", "Huge rise in real-time data $Volume$ and $Velocity$ from connected entities.", "Security/privacy risk; heterogeneous formats are hard to integrate."],
      ["Device proliferation", "Vast number and variety of data sources, cheaply.", "Data quality varies ($Veracity$); device sprawl raises attack surface."],
      ["Search engines", "Forced invention of scalable distributed indexing/processing.", "Early solutions were proprietary and complex; relevance ranking can bias results."],
      ["Web-based storage", "Elastic, pay-as-you-go capacity for any size organisation.", "Data sovereignty, ongoing cost and vendor lock-in concerns."]
    ] } },
    { callout: { t: "memorise", h: "Five drivers of the evolution", body: "**DBMS→NoSQL** (store at scale, flexible schemas) · **IoE** (connect people+process+data+things) · **device proliferation** (everything is a sensor) · **search engines** (forced distributed processing) · **web-based/cloud storage** (cheap elastic capacity). Generation tech makes the data; storage + processing tech make it usable." }},

    { page: "Exam technique" },
    { callout: { t: "tip", h: "Linking development → contribution", body: "A bare list of developments scores low. For each, write a *because* clause: \"Web-based storage contributed **because** it made petabyte-scale storage affordable, so organisations stopped discarding data and could keep it for analysis.\" Tie it to a V where you can." }},
    { callout: { t: "warn", h: "Don't forget limitations", body: "\"Benefits **and** limitations\" is in the spec for each development. An answer that only praises a development is capped — always pair it with a drawback (cost, security, lock-in, consistency, quality)." }}
  ],
  flashcards: [
    ["Name the five developments behind big data's evolution.", "Database management systems, Internet of Everything ($IoE$), proliferation of devices, search engines, and web-based storage."],
    ["What does the $IoE$ connect?", "People, processes, data and things — broader than the $IoT$, which is just the things."],
    ["How did $DBMS$ evolution contribute to big data?", "From flat files → relational ($SQL$) → $NoSQL$; $NoSQL$ removed the rigid-schema limit, allowing high-$Variety$ data to be stored and scaled horizontally."],
    ["How did search engines drive big data technology?", "Indexing the whole web forced the invention of distributed storage/processing (the $MapReduce$/$Hadoop$ lineage) that underpins all big data processing."],
    ["How did web-based storage contribute?", "Cheap, elastic $cloud$ capacity removed the cost barrier, so organisations could store petabytes instead of discarding data."],
    ["Give one benefit and one limitation of $IoE$ for big data.", "Benefit: huge rise in real-time $Volume$/$Velocity$. Limitation: security/privacy risk and hard-to-integrate heterogeneous formats."],
    ["Why did 'device proliferation' increase $Variety$?", "Different device types (phones, wearables, sensors, appliances) each produce different data formats — location, biometric, environmental, usage."],
    ["What is one limitation of relying on web-based (cloud) storage?", "Data sovereignty concerns, ongoing cost, and vendor lock-in."]
  ],
  quiz: [
    {
      q: "Which development is defined as the connection of people, processes, data and things?",
      opts: ["$DBMS$", "$IoE$", "Search engines", "Web-based storage"],
      ans: 1,
      why: "$IoE$ (Internet of Everything) extends the $IoT$ to include people, processes and data, not just devices."
    },
    {
      q: "The need to index the entire web most directly drove which big data breakthrough?",
      opts: ["Relational databases", "Distributed storage and processing", "Solid state drives", "Online surveys"],
      ans: 1,
      why: "Search engines had to process billions of unstructured pages, forcing distributed/parallel processing techniques."
    },
    {
      q: "Which development most directly removed the cost barrier to storing petabytes of data?",
      opts: ["Web-based storage", "$IoE$", "Search engines", "Device proliferation"],
      ans: 0,
      why: "Cloud/web-based storage offers elastic pay-as-you-go capacity without buying physical data centres."
    },
    {
      q: "Which is a genuine limitation of the move from relational databases to $NoSQL$?",
      opts: [
        "It cannot store any structured data",
        "It weakens $ACID$ consistency guarantees",
        "It only runs on a single server",
        "It removed support for horizontal scaling"
      ],
      ans: 1,
      why: "$NoSQL$ trades strict $ACID$ consistency for schema flexibility and horizontal scalability."
    },
    {
      q: "Why is 'device proliferation' considered a driver of big data $Variety$?",
      opts: [
        "All devices output identical formats",
        "Different device types generate different data formats and signals",
        "Devices reduce the number of data sources",
        "It only affects data $Volume$, never $Variety$"
      ],
      ans: 1,
      why: "Phones, wearables, sensors and appliances each produce distinct formats — boosting $Variety$ as well as $Volume$."
    }
  ],
  exam: [
    {
      q: "Identify two developments that contributed to the evolution of big data and explain how each contributed.",
      marks: 4,
      ms: [
        "Proliferation of devices (1) — billions of phones/sensors each generate continuous data streams, raising volume and variety (1).",
        "Web-based storage (1) — affordable elastic cloud capacity let organisations store petabytes instead of discarding data (1).",
        "(Accept DBMS→NoSQL, IoE, search engines with valid contribution.)"
      ]
    },
    {
      q: "Explain how the development of database management systems contributed to the evolution of big data, and give one limitation of relational databases for big data.",
      marks: 4,
      ms: [
        "DBMS evolved from flat files to relational ($SQL$) systems giving reliable structured storage/querying (1).",
        "Then to $NoSQL$, removing the rigid-schema constraint (1).",
        "This allowed high-variety data to be stored and scaled horizontally across many servers (1).",
        "Limitation: relational schemas are rigid / cannot easily handle unstructured high-variety data (1)."
      ]
    },
    {
      q: "Discuss the benefits and limitations of the developments that enabled big data, using at least three developments in your answer.",
      marks: 9,
      ms: [
        "Web-based storage: benefit — cheap elastic scale; limitation — data sovereignty / lock-in (1–2).",
        "IoE / device proliferation: benefit — massive real-time volume and variety; limitation — security/privacy and integration difficulty (1–2).",
        "Search engines: benefit — drove distributed processing now central to big data; limitation — early proprietary/complex solutions (1–2).",
        "DBMS→NoSQL: benefit — flexible schemas + horizontal scale; limitation — weaker consistency (1–2).",
        "Judgement — e.g. storage + processing advances were the true enablers, generation tech merely supplied the raw material (1).",
        "Balanced, linked discussion rather than a list, with a conclusion (1)."
      ]
    }
  ]
};

C["it:F201.1.3"] = {
  notes: [
    "Data **capture** is the process of gathering raw data from a source into a system so it can be stored and analysed. The spec lists **nine** capture methods and, for each, wants: *how it is used to collect data*, *when it can be used*, the *types of data it generates*, and its *benefits and limitations*. Cover all nine — questions often name a scenario and ask which method fits.",
    { callout: { t: "def", h: "Big data capture", body: "The methods and technologies used to **collect** raw data from real-world sources and bring it into a storage/processing system. It is the first step of the analysis pipeline (1.1); the *method* chosen determines the *type* and *quality* (Veracity) of data you end up with." }},

    { page: "The nine capture methods" },
    { callout: { t: "info", h: "What each method captures", body: [
      { kv: [
        ["Digital images and videos", "Visual data from $CCTV$, cameras, medical scanners and dashcams. Used for surveillance, diagnostics, automated inspection. Type: **unstructured** (pixels/frames)."],
        ["$GPS$ signals", "Location coordinates + timestamps from satellites to receivers in phones/vehicles. Used for navigation, logistics, asset tracking. Type: **structured** (lat/long, time)."],
        ["$IoE$ connected devices", "Readings exchanged by connected smart devices — smart meters, wearables, industrial machines. Used for monitoring and automation. Type: usually **structured/semi-structured** streams."],
        ["Natural language", "Human speech and text — voice notes, call-centre recordings, chat messages. Used for sentiment, voice assistants, transcription. Type: **unstructured** (needs $NLP$)."],
        ["Online surveys", "Direct responses captured through web forms/questionnaires. Used for market research and feedback. Type: **semi-structured** (defined fields + free text)."],
        ["Satellites", "Earth-observation and weather imagery/telemetry from orbit. Used for forecasting, mapping, environmental monitoring. Type: **unstructured** imagery + structured telemetry."],
        ["Sensors", "Hardware measuring physical quantities — temperature, motion, pressure, light. Used in $IoT$, manufacturing, environment. Type: **structured** numeric, often high-$Velocity$."],
        ["Social media sites", "Posts, likes, shares, profiles and interactions captured via platform feeds/$APIs$. Used for sentiment and trend analysis. Type: **unstructured/semi-structured**."],
        ["Transactional records", "Logs of completed transactions — $POS$ sales, online banking, orders. Used for finance, retail analytics, audit. Type: **structured** (relational rows)."]
      ] }
    ] } },
    { callout: { t: "miscon", h: "Capture method ≠ data type one-to-one", body: "Some methods produce mixed types: satellites give *both* unstructured imagery and structured telemetry; $IoE$ devices and surveys are usually *semi*-structured. Don't blanket-label everything 'unstructured' — state what the *specific* method produces." }},

    { page: "Benefits & limitations" },
    { table: { head: ["Method", "Generates", "Benefit", "Limitation"], rows: [
      ["Digital images/video", "Unstructured", "Rich detail; works where text can't (visual evidence).", "Huge $Volume$; needs $AI$/vision to interpret; privacy."],
      ["$GPS$ signals", "Structured coords", "Precise real-time location at scale.", "Privacy concerns; weak indoors; battery drain."],
      ["$IoE$ devices", "Structured/semi streams", "Continuous automated monitoring, real time.", "Security/attack surface; format heterogeneity."],
      ["Natural language", "Unstructured", "Captures nuanced human intent/sentiment.", "Needs $NLP$; dialect/sarcasm/ambiguity errors."],
      ["Online surveys", "Semi-structured", "Targeted, cheap, direct from the consumer.", "Self-selection bias; low response rates; honesty."],
      ["Satellites", "Imagery + telemetry", "Global coverage without physical access.", "Expensive; cloud cover; latency."],
      ["Sensors", "Structured numeric", "High-$Velocity$, objective, continuous readings.", "Calibration drift / sensor failure; maintenance."],
      ["Social media", "Unstructured/semi", "Vast real-time sentiment and trends.", "Low $Veracity$ (bots/fakes); demographic bias."],
      ["Transactional records", "Structured", "Accurate, complete audit trail of real events.", "Often batch (latency); needs format standardising."]
    ] } },
    { callout: { t: "memorise", h: "Capture → data class shortcut", body: "**Structured & high-velocity:** sensors, $GPS$, $IoE$, transactional records. **Unstructured (needs AI):** images/video, natural language, social media. **Semi-structured:** online surveys (and parts of social/$IoE$). **Imagery + telemetry mix:** satellites." }},

    { page: "Exam technique" },
    { callout: { t: "tip", h: "Matching method to scenario", body: "\"Track delivery vans in real time\" → $GPS$. \"Gauge opinion on a new product launch\" → social media or online surveys. \"Monitor a production line for faults\" → sensors / $IoE$. \"Forecast a storm\" → satellites. Justify with the data *type* and the *when* it suits." }},
    { callout: { t: "warn", h: "Always pair benefit with limitation", body: "The spec demands benefits **and** limitations for each method. Social media's reach is worthless without flagging its low veracity and bias; sensor accuracy is undermined by calibration drift. Single-sided answers are capped." }}
  ],
  flashcards: [
    ["List the nine big data capture methods.", "Digital images/videos, $GPS$ signals, $IoE$ connected devices, natural language, online surveys, satellites, sensors, social media sites, transactional records."],
    ["What is data capture?", "The process of collecting raw data from real-world sources into a system for storage and analysis — the first step of the pipeline."],
    ["What data type do $GPS$ signals generate?", "Structured data — coordinates (latitude/longitude) plus timestamps."],
    ["Give a benefit and a limitation of sensor capture.", "Benefit: high-$Velocity$, objective, continuous numeric readings. Limitation: calibration drift / sensor failure needing maintenance."],
    ["Why is social media a low-$Veracity$ capture method?", "It contains bots, fake accounts and demographic bias, so the data may not be accurate or representative."],
    ["Which methods typically produce unstructured data?", "Digital images/videos, natural language, and social media — all need $AI$/$NLP$ to interpret."],
    ["What type of data do online surveys produce, and a key limitation?", "Semi-structured (defined fields + free text); limitation: self-selection bias and low response rates."],
    ["When would satellites be the best capture method?", "When you need global coverage without physical access — e.g. weather forecasting or environmental/Earth monitoring."],
    ["Why are transactional records high-$Veracity$?", "They log completed real-world events in structured relational form, giving an accurate, complete audit trail."],
    ["Give one limitation of capturing digital images/video.", "Very high $Volume$/storage cost and the need for $AI$/computer vision to interpret them (plus privacy concerns)."]
  ],
  quiz: [
    {
      q: "A logistics firm wants to track its delivery fleet's position in real time. Which capture method fits best?",
      opts: ["Online surveys", "$GPS$ signals", "Satellites", "Transactional records"],
      ans: 1,
      why: "$GPS$ provides precise, high-velocity location coordinates in real time."
    },
    {
      q: "Which capture method generates structured numeric data with the highest $Velocity$?",
      opts: ["Online surveys", "Social media", "Sensors", "Digital images"],
      ans: 2,
      why: "Sensors continuously emit objective numeric readings (temperature, pressure, motion) as structured streams."
    },
    {
      q: "Which is a correct limitation of natural-language capture?",
      opts: [
        "It produces only structured data",
        "Sarcasm, dialect and ambiguity cause processing errors",
        "It cannot capture sentiment",
        "It requires no software to interpret"
      ],
      ans: 1,
      why: "Natural language is unstructured and needs $NLP$; ambiguity, dialect and sarcasm reduce accuracy."
    },
    {
      q: "Which capture method produces both unstructured imagery and structured telemetry?",
      opts: ["Transactional records", "Satellites", "Online surveys", "$GPS$ signals"],
      ans: 1,
      why: "Satellites return Earth-observation images plus structured positional/sensor telemetry."
    },
    {
      q: "A market-research team needs targeted opinions on a specific new feature. Which method is most appropriate?",
      opts: ["Sensors", "Online surveys", "Satellites", "$IoE$ devices"],
      ans: 1,
      why: "Online surveys capture targeted, direct consumer responses in a semi-structured form."
    },
    {
      q: "Why might transactional records introduce latency despite high accuracy?",
      opts: [
        "They are unstructured and need AI",
        "They are often uploaded in batches rather than streamed live",
        "They contain many fake entries",
        "They require satellite coverage"
      ],
      ans: 1,
      why: "Transactional data is frequently processed in batch loads, so it is accurate but not always real time."
    }
  ],
  exam: [
    {
      q: "Describe the benefits and limitations of using social media as a big data capture method.",
      marks: 4,
      ms: [
        "Benefit: captures a large volume of real-time consumer sentiment/trends (1).",
        "Benefit: rich, varied content (text, images, interactions) (1).",
        "Limitation: low veracity — bots, fake accounts and bias (1).",
        "Limitation: unstructured, so needs $AI$/$NLP$ to process (1)."
      ]
    },
    {
      q: "For each of sensors, $GPS$ signals and online surveys, state the type of data captured and one situation in which the method would be used.",
      marks: 6,
      ms: [
        "Sensors — structured numeric (1); e.g. monitoring a production line / environment for faults (1).",
        "GPS — structured coordinates + time (1); e.g. tracking a delivery fleet / navigation (1).",
        "Online surveys — semi-structured (fields + free text) (1); e.g. market research on a new product (1)."
      ]
    },
    {
      q: "A national weather service is choosing how to capture data for forecasting. Evaluate the suitability of satellites, sensors and social media as capture methods for this purpose.",
      marks: 9,
      ms: [
        "Satellites — global coverage and imagery/telemetry ideal for forecasting; but expensive and cloud cover can obstruct readings (1–2).",
        "Sensors — ground stations give precise, high-velocity local readings (temp, pressure, rainfall); but limited to where sensors are placed and need maintenance/calibration (1–2).",
        "Social media — could crowd-source live reports of conditions cheaply; but low veracity and bias make it unreliable for official forecasts (1–2).",
        "Comparison of data types/veracity across the three (1).",
        "Judgement: satellites + sensors as primary (high veracity, broad + precise coverage), social media only as a supplementary signal (1–2).",
        "Coherent evaluation with a justified conclusion (1)."
      ]
    }
  ]
};

C["it:F201.1.4"] = {
  notes: [
    "The spec names **nine areas of application** for big data analytics and wants, for each: the *purpose* of using analytics there, and its *benefits and limitations*. The areas are: **banking; communications, media and entertainment; education; energy and utilities; government; healthcare; insurance; manufacturing; retail.** The overarching purpose across all of them is to move from **reactive** to **proactive, evidence-based** decision-making.",
    { callout: { t: "def", h: "Big data analytics", body: "The process of examining large, varied datasets to uncover patterns, correlations and trends that support decision-making. Its purpose is to convert raw data ($Volume$/$Variety$/$Velocity$) into $Value$ — actionable insight — in a specific domain." }},

    { page: "The nine application areas" },
    { callout: { t: "info", h: "Purpose of analytics in each area", body: [
      { kv: [
        ["Banking", "Detect fraud in real time, assess credit risk, model markets and personalise products. Purpose: reduce losses and lend safely."],
        ["Communications, media & entertainment", "Power recommendation engines, personalise ads, plan content and optimise delivery. Purpose: maximise engagement and retention."],
        ["Education", "Personalise learning paths, flag at-risk students early, track progress and plan resources. Purpose: improve attainment and retention."],
        ["Energy and utilities", "Manage smart grids, forecast demand, enable predictive maintenance of infrastructure. Purpose: balance supply/demand and cut outages."],
        ["Government", "Monitor public health, detect tax fraud, plan services and respond to emergencies. Purpose: evidence-based policy and efficient public services."],
        ["Healthcare", "Predict outbreaks, accelerate drug discovery, enable personalised medicine and manage resources. Purpose: better outcomes at lower cost."],
        ["Insurance", "Price premiums from telematics/behaviour, model risk and detect fraudulent claims. Purpose: fair, accurate pricing and reduced fraud."],
        ["Manufacturing", "Optimise supply chains, run predictive maintenance, detect defects and control robotics. Purpose: efficiency, quality and uptime."],
        ["Retail", "Target marketing, forecast inventory, personalise offers and enable anticipatory shipping. Purpose: increase sales and cut waste."]
      ] }
    ] } },
    { callout: { t: "tip", h: "The common thread", body: "In every area the purpose reduces to the same idea: replace guesswork with **statistical prediction** so the organisation acts *before* an event (fraud, machine failure, a stock-out, an epidemic) rather than reacting after it." }},

    { page: "Benefits & limitations" },
    { table: { head: ["Area", "Benefit of analytics", "Limitation"], rows: [
      ["Banking", "Near-instant fraud detection; safer lending decisions.", "False positives block legitimate customers; bias in credit models."],
      ["Comms/media/ent.", "Higher engagement via personalisation; data-driven commissioning.", "Filter bubbles; privacy concerns over tracking."],
      ["Education", "Early intervention raises attainment.", "Risk of labelling students; data privacy of minors."],
      ["Energy/utilities", "Efficient grids; fewer outages via prediction.", "High sensor/infra cost; security of critical infrastructure."],
      ["Government", "Evidence-based policy; faster emergency response.", "Mass-surveillance concerns; siloed legacy systems."],
      ["Healthcare", "Earlier diagnosis; personalised treatment.", "Breaches risk sensitive data ($GDPR$); bias harms patients."],
      ["Insurance", "Fairer, accurate premiums; less fraud.", "Telematics feels intrusive; can penalise some groups."],
      ["Manufacturing", "Predictive maintenance cuts downtime; fewer defects.", "Costly $IoT$ rollout; integration with legacy machinery."],
      ["Retail", "More sales; less waste from better forecasting.", "Customer distrust over data use; over-personalisation."]
    ] } },
    { callout: { t: "memorise", h: "Area → flagship use case", body: "Banking = fraud/credit. Media = recommendation engines. Education = at-risk alerts. Energy = smart grid/demand forecast. Government = policy + tax fraud. Healthcare = outbreak prediction + personalised medicine. Insurance = telematics pricing. Manufacturing = predictive maintenance. Retail = targeted marketing + anticipatory shipping." }},

    { page: "Case studies" },
    { callout: { t: "info", h: "Big data in action", body: [
      { kv: [
        ["Retail — anticipatory shipping", "Predictive analytics pre-positions likely orders in local hubs before customers buy, cutting delivery time."],
        ["Transport — dynamic pricing", "Real-time $GPS$ + historic demand sets surge prices and optimal routing for ride-hailing fleets."],
        ["Entertainment — content commissioning", "Clustering anonymised viewing data guides which original series to produce, reducing flop risk."],
        ["Healthcare — protein folding", "Large protein-structure datasets trained models that predict 3-D shapes, accelerating drug discovery."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Technology → outcome", body: "In a case study always link the **technology** (big data / $ML$) to a concrete **outcome** (profit, efficiency, safety, lives saved). \"Used data\" earns nothing; \"used real-time transaction data to cut fraud losses by X\" earns the mark." }},

    { page: "Exam technique" },
    { callout: { t: "miscon", h: "Big data ≠ guaranteed better outcomes", body: "Every benefit depends on $Veracity$. Biased or poor-quality data produces wrong predictions — a fraud model trained on skewed data wrongly blocks genuine customers. \"Garbage in, garbage out.\" Always temper benefit claims with the data-quality and ethics limitation." }},
    { callout: { t: "warn", h: "Answer the area asked", body: "Generic \"it improves efficiency\" answers are capped. Tie the purpose and the benefit/limitation to the *specific* area in the question — telematics for insurance, predictive maintenance for manufacturing, outbreak modelling for healthcare." }}
  ],
  flashcards: [
    ["List the nine areas of application for big data analytics.", "Banking; communications/media/entertainment; education; energy & utilities; government; healthcare; insurance; manufacturing; retail."],
    ["What is the overarching purpose of big data analytics?", "To shift from reactive to proactive, evidence-based decision-making by turning data into actionable insight ($Value$)."],
    ["Purpose of big data analytics in banking?", "Real-time fraud detection, credit-risk assessment and market modelling — to reduce losses and lend safely."],
    ["Purpose in healthcare, with one benefit and one limitation?", "Predict outbreaks, personalise medicine, speed drug discovery. Benefit: earlier diagnosis/better outcomes. Limitation: breaches risk sensitive data ($GDPR$)."],
    ["Flagship use of analytics in manufacturing?", "Predictive maintenance — predicting machine failure before it happens to cut downtime; plus defect detection."],
    ["How does insurance use big data analytics?", "Telematics/behaviour data to price premiums accurately, model risk and detect fraudulent claims."],
    ["What is 'anticipatory shipping'?", "Retail predictive analytics that pre-positions likely orders in local hubs before customers buy, cutting delivery time."],
    ["Give a limitation of analytics in government.", "Mass-surveillance/privacy concerns, and integration difficulty across siloed legacy systems."],
    ["Why is data $Veracity$ the foundation of every application area?", "Biased/poor-quality data yields wrong predictions (\"garbage in, garbage out\") — e.g. a skewed fraud model blocks legitimate customers."],
    ["Purpose of analytics in energy & utilities?", "Smart-grid management, demand forecasting and predictive maintenance to balance supply/demand and reduce outages."]
  ],
  quiz: [
    {
      q: "Predictive maintenance to reduce machine downtime is a flagship application for which area?",
      opts: ["Banking", "Manufacturing", "Insurance", "Education"],
      ans: 1,
      why: "Manufacturing uses sensor/$IoT$ data to predict failures before they cause downtime."
    },
    {
      q: "Pricing premiums from telematics and driving-behaviour data is characteristic of which area?",
      opts: ["Retail", "Insurance", "Government", "Energy"],
      ans: 1,
      why: "Insurance uses behavioural/telematics data to set accurate, individualised premiums."
    },
    {
      q: "Which is the single best statement of the overarching purpose of big data analytics?",
      opts: [
        "To store as much data as possible",
        "To replace reactive decisions with proactive, evidence-based ones",
        "To reduce the variety of data formats",
        "To remove the need for any human decision-making"
      ],
      ans: 1,
      why: "Across all areas the purpose is proactive, statistically grounded decision-making."
    },
    {
      q: "An education provider flags students likely to drop out so tutors can intervene early. Which limitation should it most guard against?",
      opts: [
        "Lack of any structured data",
        "Mislabelling students and privacy of minors' data",
        "Inability to store the data",
        "That analytics cannot be applied to education at all"
      ],
      ans: 1,
      why: "Predictive flags risk stigmatising students and involve sensitive data about minors."
    },
    {
      q: "Which pairing of area and use case is INCORRECT?",
      opts: [
        "Retail — targeted marketing and inventory forecasting",
        "Government — tax-fraud detection and policy planning",
        "Banking — predictive maintenance of factory robots",
        "Healthcare — outbreak prediction and personalised medicine"
      ],
      ans: 2,
      why: "Predictive maintenance of robots belongs to manufacturing, not banking."
    },
    {
      q: "Why can a fraud-detection model harm legitimate banking customers?",
      opts: [
        "It always processes data too slowly",
        "Biased or poor-quality training data causes false positives that block genuine transactions",
        "It cannot handle structured data",
        "It removes the need for transactional records"
      ],
      ans: 1,
      why: "Low-veracity/biased data produces false positives — \"garbage in, garbage out\"."
    }
  ],
  exam: [
    {
      q: "State the purpose of big data analytics in three different areas of application, naming each area.",
      marks: 6,
      ms: [
        "Banking (1) — detect fraud / assess credit risk in real time (1).",
        "Healthcare (1) — predict outbreaks / personalise treatment / speed drug discovery (1).",
        "Retail (1) — target marketing / forecast inventory / anticipatory shipping (1).",
        "(Accept any three of the nine areas with a valid purpose.)"
      ]
    },
    {
      q: "Explain two benefits and two limitations of using big data analytics in healthcare.",
      marks: 4,
      ms: [
        "Benefit: earlier diagnosis and better patient outcomes through prediction (1).",
        "Benefit: personalised medicine / faster drug discovery (1).",
        "Limitation: breaches risk highly sensitive personal data ($GDPR$) (1).",
        "Limitation: biased/poor-quality data can harm patients via wrong predictions (1)."
      ]
    },
    {
      q: "Evaluate the benefits and limitations of a national government using big data analytics during a pandemic.",
      marks: 9,
      ms: [
        "Benefit: real-time tracking of infection rates to allocate resources (1–2).",
        "Benefit: predictive modelling to identify future hotspots and plan capacity (1–2).",
        "Benefit: monitoring public sentiment toward restrictions to shape communication (1).",
        "Limitation: privacy/surveillance concerns and $GDPR$ compliance (1–2).",
        "Limitation: integration difficulty across siloed regional/legacy systems; data veracity (1–2).",
        "Judgement: net vital for evidence-based policy provided privacy safeguards and data quality are maintained (1–2)."
      ]
    }
  ]
};

C["it:F201.2.1"] = {
  notes: [
    { h: "Types of Big Data" },
    "Big data is classified by how organised it is into three types — **structured**, **unstructured** and **semi-structured**. The spec wants the **difference** between them, **how each is captured**, **its purpose**, **when it is used**, and the **benefits and limitations** of each. Structured numeric data is further split into **continuous** and **discrete**.",
    { callout: { t: "memorise", h: "The three types in one line each", body: "**Structured** = fixed rows + columns / schema ($SQL$ tables, spreadsheets, transactions). **Unstructured** = no predefined format, very high volume (social media, video, weather imagery). **Semi-structured** = no rigid schema but self-describing tags/metadata ($XML$, $JSON$, emails, web pages)." }},

    { page: "Structured data" },
    { callout: { t: "def", h: "Structured data", body: "Data organised into a predefined model of rows and columns with a fixed schema, so it can be stored in a relational database and queried with $SQL$." }},
    "**Examples:** relational database tables, spreadsheet files, transactional data (sales, payments). **Captured** through forms, point-of-sale tills, online transactions and database entry. **Subtypes (numeric):** *continuous* — any value in a range (temperature $22.51°$); *discrete* — separate countable values ($5$ customers).",
    { callout: { t: "info", h: "Structured — benefits and limitations", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["Easy to store, search and query ($SQL$).", "Rigid schema — adding new fields is costly."],
        ["Consistent and reliable for reporting.", "Can only represent data that fits the model."],
        ["Mature, well-supported tools.", "Poor fit for varied, fast-changing big data."]
      ] } }
    ] } },

    { page: "Unstructured data" },
    { callout: { t: "def", h: "Unstructured data", body: "Data with no predefined format or internal model — it cannot be held in simple rows and columns. It makes up the majority of big data by volume." }},
    "**Examples:** social media and entertainment data, images, audio/video, weather/satellite imagery. **Captured** from sensors, cameras, social platforms, $IoT$ devices and uploads. **Purpose/use:** sentiment analysis, image recognition, recommendation engines — rich insight that structured data can't hold.",
    { callout: { t: "info", h: "Unstructured — benefits and limitations", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["Captures rich, real-world variety (text, media).", "Hard to search, store and analyse directly."],
        ["Huge volumes available cheaply.", "Needs advanced tools/AI to extract meaning."],
        ["Often the most valuable, novel insight.", "Quality and relevance vary wildly."]
      ] } }
    ] } },

    { page: "Semi-structured data" },
    { callout: { t: "def", h: "Semi-structured data", body: "Data with no rigid schema, but which carries self-describing tags or metadata that give it some structure — sitting between structured and unstructured." }},
    "**Examples:** emails, $XML$ and $JSON$, zipped files, web pages. **Captured** from web APIs, document exchanges and messaging. **Purpose/use:** flexible data exchange between systems and storage of varied records — common in $IoT$ and web apps.",
    { callout: { t: "info", h: "Semi-structured — benefits and limitations", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["Flexible — new fields added without rebuilding a schema.", "Less efficient to query than fully structured data."],
        ["Self-describing and portable between systems.", "Tags add overhead/size to each record."],
        ["Good fit for varied, evolving big data.", "Can be inconsistent if tags aren't standardised."]
      ] } }
    ] } },

    { page: "Comparison & exam technique" },
    { table: { head: ["", "Structured", "Semi-structured", "Unstructured"], rows: [
      ["Schema", "Fixed, rigid.", "Flexible tags/metadata.", "None."],
      ["Store with", "Relational DB / $SQL$.", "$XML$/$JSON$ stores, NoSQL.", "Data lake, object store."],
      ["Examples", "Tables, spreadsheets, transactions.", "Emails, $XML$, web pages.", "Video, audio, social media."],
      ["Query/analysis", "Easy.", "Moderate.", "Hard (needs AI)."],
      ["Share of big data", "Small.", "Some.", "Most (by volume)."]
    ] } },
    { callout: { t: "miscon", h: "CSV is structured, not semi-structured", body: "Students see a plain-text $CSV$ and call it semi-structured. But $CSV$ has a **fixed column schema**, so it is **structured**. $XML$/$JSON$ are semi-structured because they use tags but enforce no rigid schema." }},
    { callout: { t: "tip", h: "Answering type questions", body: "Justify a classification by the schema: rigid columns → structured; tags but no rigid schema → semi-structured; no format at all → unstructured. For 'continuous vs discrete', ask: can it take any value in a range (continuous) or only separate counts (discrete)?" }}
  ],
  flashcards: [
    ["Define structured data.", "Data in a fixed schema of rows and columns, e.g. $SQL$ tables — easy to query."],
    ["Define unstructured data.", "Data with no predefined format (video, audio, social media); the majority of big data by volume."],
    ["Define semi-structured data.", "Data with no rigid schema but self-describing tags/metadata, e.g. $XML$, $JSON$, emails."],
    ["How is unstructured data captured?", "From sensors, cameras, social platforms, $IoT$ devices and uploads."],
    ["One benefit and limitation of structured data?", "Benefit: easy to query/report. Limitation: rigid schema, poor fit for varied big data."],
    ["One benefit of semi-structured data?", "Flexible — new fields can be added without rebuilding a schema."],
    ["Continuous vs discrete data?", "Continuous = any value in a range (temperature). Discrete = separate countable values (number of customers)."],
    ["Is $JSON$ structured or semi-structured?", "Semi-structured — it uses tags/keys but enforces no rigid schema."]
  ],
  quiz: [
    {
      q: "Which is semi-structured?",
      opts: ["$SQL$ database table", "$XML$ file", "MP4 video", "Spreadsheet"],
      ans: 1,
      why: "$XML$ uses self-describing tags but has no rigid tabular schema."
    },
    {
      q: "A count of people entering a building is…",
      opts: ["Continuous", "Discrete", "Unstructured", "Semi-structured"],
      ans: 1,
      why: "It can only take separate whole-number values — you can't have a fraction of a person."
    },
    {
      q: "Which data type makes up the majority of big data by volume?",
      opts: ["Structured", "Semi-structured", "Unstructured", "Relational"],
      ans: 2,
      why: "Unstructured data (media, social, sensor) dominates big data by volume."
    },
    {
      q: "Which is a limitation of structured data for big data?",
      opts: ["Hard to query", "Rigid schema unsuited to varied, fast-changing data", "Cannot be stored in databases", "No tools support it"],
      ans: 1,
      why: "Its fixed schema makes it a poor fit for the variety and velocity of big data."
    },
    {
      q: "Temperature recorded to two decimal places is an example of…",
      opts: ["Discrete data", "Continuous data", "Semi-structured data", "Unstructured data"],
      ans: 1,
      why: "Temperature can take any value in a range, so it is continuous."
    }
  ],
  exam: [
    {
      q: "Explain the difference between structured and unstructured data, giving one example of each. [4]",
      marks: 4,
      ms: [
        "Structured data has a fixed schema of rows and columns (1).",
        "Example: a relational database / spreadsheet of transactions (1).",
        "Unstructured data has no predefined format (1).",
        "Example: social media posts / video / images (1)."
      ]
    },
    {
      q: "An IoT weather network collects readings from thousands of varied sensors whose formats change over time. Explain why semi-structured data is more suitable than fully structured data here. [4]",
      marks: 4,
      ms: [
        "Sensors generate varied data whose fields change (1).",
        "Semi-structured ($JSON$/$XML$) allows new fields without rebuilding a schema (1).",
        "A rigid structured schema would be costly to update each change (1).",
        "Semi-structured tags make records self-describing and portable between systems (1)."
      ]
    },
    {
      q: "Discuss the benefits and limitations of using unstructured data for a company analysing customer opinion. [6]",
      marks: 6,
      ms: [
        "Benefit: captures rich real-world opinion (text, images, video) (1).",
        "Benefit: huge volumes of social-media data available cheaply (1).",
        "Benefit: can reveal sentiment structured data would miss (1).",
        "Limitation: hard to store and analyse directly (1).",
        "Limitation: needs advanced AI/NLP tools to extract meaning (1).",
        "Conclusion: valuable for sentiment but only with the tools/skills to process it (1)."
      ]
    }
  ]
};

C["it:F201.2.2"] = {
  notes: [
    { h: "Data Preparation and Cleaning" },
    "Before big data can be mined it must be **prepared** and **cleaned** — raw data is messy, inconsistent and full of errors. The spec wants the **purpose** of preparing and cleaning data, what **data wrangling** is and how it's used, **when to use each cleaning technique**, and the **benefits and limitations** of each. Technical/coding detail is **out of scope**.",
    { callout: { t: "tip", h: "Why it matters: garbage in, garbage out", body: "Analysis is only as good as the data fed in. Dirty data → wrong conclusions, so preparation and cleaning are essential, ongoing stages of every big-data pipeline." }},

    { page: "Preparation & wrangling" },
    { callout: { t: "def", h: "Data preparation", body: "Getting raw data into a usable state for analysis — handling **numeric** data (fixing types, units, ranges) and **textual** data (casing, encoding, tokenising) so it is consistent." }},
    { callout: { t: "def", h: "Data wrangling", body: "The broader process of mapping and transforming raw data from its original form into a clean, structured format ready for mining — it includes cleaning, restructuring and enriching the data." }},
    "**How wrangling is used:** combine multiple sources, reshape fields, derive new columns, and feed a consistent dataset into the mining stage. Preparation/wrangling typically consumes the majority of an analyst's time.",

    { page: "Cleaning techniques" },
    "Eight cleaning techniques the spec names — know what each does and **when** to use it.",
    { steps: [
      { h: "Removing duplicates (de-duplication)", m: "When: the same record appears more than once.", n: "Keeps each entity unique so counts/averages aren't skewed." },
      { h: "Removing irrelevant data (filtering)", m: "When: columns/rows don't serve the analysis goal.", n: "Cuts noise and reduces dataset size." },
      { h: "Converting data type (casting)", m: "When: numbers stored as text, dates as strings.", n: "Lets values be calculated and sorted correctly." },
      { h: "Clear formatting (standardisation)", m: "When: inconsistent formats ('30/12/24' vs 'Dec 30 2024').", n: "Aligns everything to one consistent format." },
      { h: "Fix structural errors", m: "When: fields are mis-split or mislabelled.", n: "Splitting 'Full Name' into first/last; fixing typos in categories." },
      { h: "Language translation", m: "When: text comes from multiple languages.", n: "Normalises to one language for uniform analysis." },
      { h: "Fix missing data", m: "When: values are blank.", n: "Delete the row, or impute (fill with mean/median/mode)." },
      { h: "Validate data", m: "When: values may be out of range.", n: "Range/format checks (Age 0–120, Price > 0) catch errors." }
    ] },

    { page: "When & trade-offs" },
    { callout: { t: "info", h: "Benefits and limitations of cleaning", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["More accurate, trustworthy analysis (no skew from dirty data).", "Time-consuming and resource-intensive."],
        ["Smaller, consistent datasets process faster.", "Imputing missing values can introduce bias if done poorly."],
        ["Validation prevents impossible/erroneous values.", "Over-aggressive filtering can delete useful data."],
        ["Standardised data integrates across sources.", "Must be repeated continuously as new data arrives."]
      ] } }
    ] } },
    { callout: { t: "miscon", h: "Cleaning is not a one-time step", body: "In a continuous big-data pipeline raw data keeps arriving, and clean data goes stale as source formats and business rules change. Cleaning is an **iterative, ongoing** process — not a single stage done once." }},
    { callout: { t: "memorise", h: "The 8 cleaning techniques", body: "De-duplication · remove irrelevant · convert type (cast) · clear formatting (standardise) · fix structural errors · language translation · fix missing (delete/impute) · validate (range checks). Umbrella term for transforming raw → usable = **data wrangling**." }}
  ],
  flashcards: [
    ["What is the purpose of data preparation?", "To get raw numeric and textual data into a consistent, usable state for analysis."],
    ["What is data wrangling?", "Mapping/transforming raw data from its original form into a clean, structured format ready for mining."],
    ["When do you use de-duplication?", "When the same record appears more than once, to stop counts/averages being skewed."],
    ["Two ways to handle missing data?", "Delete the affected rows, or impute (fill with mean/median/mode)."],
    ["What does standardisation (clear formatting) fix?", "Inconsistent formats, e.g. '30/12/24' and 'Dec 30 2024' aligned to one format."],
    ["What does data validation check?", "That values fall within logical ranges/formats (e.g. Age 0–120, Price > 0)."],
    ["One benefit and one limitation of cleaning?", "Benefit: more accurate analysis. Limitation: time-consuming and must be repeated continuously."],
    ["Why is language translation a cleaning step?", "To normalise multilingual text into one language for uniform analysis."]
  ],
  quiz: [
    {
      q: "Which technique fixes '30/12/24' and 'Dec 30 2024' appearing in one column?",
      opts: ["Removing duplicates", "Standardising formats", "Data mining", "Validation"],
      ans: 1,
      why: "Standardisation (clear formatting) brings all values into one consistent format."
    },
    {
      q: "A dataset lists the same customer three times under different spellings. Which step is needed?",
      opts: ["Imputation", "De-duplication", "Language translation", "Filtering"],
      ans: 1,
      why: "De-duplication removes duplicate records so analytics aren't skewed."
    },
    {
      q: "Filling a missing value with the average of its column is called…",
      opts: ["Standardisation", "Filtering", "Imputation", "Casting"],
      ans: 2,
      why: "Imputation replaces missing values with a calculated substitute (mean/median/mode)."
    },
    {
      q: "Which is a limitation of data cleaning?",
      opts: ["It improves accuracy", "It is time-consuming and must be repeated as new data arrives", "It removes duplicates", "It standardises formats"],
      ans: 1,
      why: "Cleaning is resource-intensive and ongoing, not a one-off task."
    },
    {
      q: "Numbers stored as text need which technique before calculation?",
      opts: ["Converting data type (casting)", "De-duplication", "Translation", "Filtering"],
      ans: 0,
      why: "Casting converts text to a numeric type so values can be calculated and sorted."
    }
  ],
  exam: [
    {
      q: "The 'Age' column of a dataset has many missing values. Describe two ways this could be handled. [4]",
      marks: 4,
      ms: [
        "Deletion (1): remove the rows where age is missing (1).",
        "Imputation (1): fill the gap with the mean/median age of the dataset (1)."
      ]
    },
    {
      q: "Explain why data cleaning is described as an ongoing process rather than a one-off task. [4]",
      marks: 4,
      ms: [
        "New raw data arrives continuously in a big-data pipeline (1).",
        "It must be cleaned each time before analysis (1).",
        "Source formats/business rules change, making clean data stale (1).",
        "So cleaning is iterative and repeated, not done once (1)."
      ]
    },
    {
      q: "A retailer is preparing a large, messy customer dataset for mining. Discuss the benefits and limitations of thoroughly cleaning the data first. [6]",
      marks: 6,
      ms: [
        "Benefit: removes duplicates/errors so analysis is accurate (1).",
        "Benefit: standardised, validated data integrates across sources (1).",
        "Benefit: smaller consistent data processes faster (1).",
        "Limitation: cleaning is time-consuming and resource-intensive (1).",
        "Limitation: poor imputation or over-filtering can bias/lose data (1).",
        "Conclusion: cleaning is essential for trustworthy results despite the cost (1)."
      ]
    }
  ]
};

C["it:F201.2.3"] = {
  notes: [
    { h: "Data Mining Techniques" },
    { callout: { t: "def", h: "Data mining", body: "The process of analysing large datasets to discover patterns, relationships and anomalies that turn raw big data into useful knowledge for decision-making." }},
    "The spec wants you to know **what data mining is**, the **role** of mining techniques in analysing big data, the **characteristics** of each technique, **when** each is used, and the **benefits and limitations to organisations** of each. Coding detail is **out of scope**. The four techniques form a ladder of insight: **Descriptive → Diagnostic → Predictive → Prescriptive (DDPP)**.",
    { callout: { t: "info", h: "Role of data mining", body: "Big data is too large to read manually. Mining techniques automatically surface the patterns inside it — letting organisations understand the past, explain it, predict the future and decide what to do." }},

    { page: "Descriptive" },
    { callout: { t: "def", h: "Descriptive — 'What happened?'", body: "Summarises historical data into an understandable form (totals, averages, dashboards) to describe past performance." }},
    "**Characteristics:** backward-looking, aggregates data, the foundation other techniques build on. **When used:** routine reporting — last month's sales, website traffic, KPIs.",
    { callout: { t: "info", h: "Benefits and limitations", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["Simple, fast, easy to understand.", "Only describes the past — no 'why' or 'what next'."],
        ["Good basis for KPIs and dashboards.", "Limited decision-making value on its own."]
      ] } }
    ] } },

    { page: "Diagnostic" },
    { callout: { t: "def", h: "Diagnostic — 'Why did it happen?'", body: "Investigates the causes behind what the descriptive stage found, by drilling down and correlating variables." }},
    "**Characteristics:** explanatory, looks for relationships and root causes. **When used:** explaining a sales drop, identifying the cause of a spike in fraud.",
    { callout: { t: "info", h: "Benefits and limitations", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["Explains root causes so problems can be fixed.", "Can mistake correlation for causation."],
        ["Targets the right area for action.", "Needs richer data and more analysis than descriptive."]
      ] } }
    ] } },

    { page: "Predictive" },
    { callout: { t: "def", h: "Predictive — 'What will happen?'", body: "Uses historical patterns and models to forecast likely future outcomes." }},
    "**Characteristics:** forward-looking, probabilistic, model-based. **When used:** forecasting demand, predicting customer churn or stock trends.",
    { callout: { t: "info", h: "Benefits and limitations", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["Enables proactive, future-focused decisions.", "Only a probability — never certain."],
        ["Spots risks/opportunities early.", "Accuracy depends on quality, unbiased data."]
      ] } }
    ] } },

    { page: "Prescriptive" },
    { callout: { t: "def", h: "Prescriptive — 'What should we do?'", body: "Goes beyond prediction to recommend the best action to take, often weighing several options." }},
    "**Characteristics:** the most advanced; builds on a predictive output to suggest an action. **When used:** optimising delivery routes, recommending a price change to maximise profit.",
    { callout: { t: "info", h: "Benefits and limitations", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["Directly guides the best decision/action.", "Complex and expensive to build."],
        ["Can automate optimisation at scale.", "A wrong recommendation can be costly; needs trust."]
      ] } }
    ] } },

    { page: "Compare & exam technique" },
    { callout: { t: "memorise", h: "DDPP — the ladder of insight", body: "**D**escriptive — what happened (report). **D**iagnostic — why (drill down). **P**redictive — what will happen (forecast). **P**rescriptive — what to do (recommend). Each step adds value and complexity, building on the one before." }},
    { callout: { t: "miscon", h: "Predictive ≠ Prescriptive", body: "Predictive says 'sales will fall 10%' — it forecasts. Prescriptive says 'so cut price by £2 to counter it' — it recommends an action. Prescriptive always builds on a predictive output." }},
    { callout: { t: "tip", h: "Identifying the technique", body: "Match the verb in the question: report/summarise → descriptive; explain/why → diagnostic; forecast/predict → predictive; recommend/optimise/what-should → prescriptive." }}
  ],
  flashcards: [
    ["What is data mining?", "Analysing large datasets to discover patterns, relationships and anomalies for decision-making."],
    ["Role of data mining techniques?", "To automatically surface patterns in big data that are too large to read manually."],
    ["Descriptive mining — question and example?", "'What happened?' — e.g. summarising last month's sales total."],
    ["Diagnostic mining — question and example?", "'Why did it happen?' — e.g. drilling into the cause of a sales drop."],
    ["Predictive mining — question and example?", "'What will happen?' — e.g. forecasting next quarter's demand."],
    ["Prescriptive mining — question and example?", "'What should we do?' — e.g. recommending a price change to maximise profit."],
    ["One limitation of predictive mining?", "It gives only a probability, not certainty, and depends on unbiased data."],
    ["One benefit and limitation of prescriptive mining?", "Benefit: directly recommends the best action. Limitation: complex/expensive and a wrong recommendation is costly."]
  ],
  quiz: [
    {
      q: "Which mining technique recommends a specific action?",
      opts: ["Descriptive", "Diagnostic", "Predictive", "Prescriptive"],
      ans: 3,
      why: "Prescriptive recommends the best next step, building on a prediction."
    },
    {
      q: "'Why did umbrella sales spike in March?' is answered by which technique?",
      opts: ["Descriptive", "Diagnostic", "Predictive", "Prescriptive"],
      ans: 1,
      why: "Diagnostic mining investigates the causes of a known past event."
    },
    {
      q: "'Stock up on umbrellas before April's forecast rain' is an output of…",
      opts: ["Descriptive", "Diagnostic", "Predictive", "Prescriptive"],
      ans: 3,
      why: "Recommending an action is prescriptive."
    },
    {
      q: "Which technique simply reports last month's total sales?",
      opts: ["Descriptive", "Diagnostic", "Predictive", "Prescriptive"],
      ans: 0,
      why: "Summarising past performance is descriptive mining."
    },
    {
      q: "A limitation common to predictive and prescriptive mining is…",
      opts: ["They only describe the past", "They rely on data quality and are never certain", "They cannot forecast", "They require no data"],
      ans: 1,
      why: "Both are forward-looking and depend on unbiased, quality data; outcomes are probabilistic."
    }
  ],
  exam: [
    {
      q: "A bank wants to know why loan defaults increased in Q3. Identify the most appropriate mining technique and justify your choice. [3]",
      marks: 3,
      ms: [
        "Diagnostic mining (1).",
        "It investigates the causes of past events (1).",
        "It lets the bank drill into variables such as interest rates or employment (1)."
      ]
    },
    {
      q: "Explain the difference between predictive and prescriptive data mining, with an example of each. [4]",
      marks: 4,
      ms: [
        "Predictive forecasts what is likely to happen (1).",
        "Example: predicting next month's product demand (1).",
        "Prescriptive recommends an action to take (1).",
        "Example: recommending the stock level to order for that demand (1)."
      ]
    },
    {
      q: "Discuss the benefits and limitations to an organisation of using prescriptive data mining. [6]",
      marks: 6,
      ms: [
        "Benefit: directly recommends the best action, guiding decisions (1).",
        "Benefit: can automate optimisation at scale (e.g. routing, pricing) (1).",
        "Benefit: builds on predictions for proactive advantage (1).",
        "Limitation: complex and expensive to develop (1).",
        "Limitation: a wrong recommendation can be costly; staff must trust it (1).",
        "Conclusion: powerful for optimisation if the organisation can resource and validate it (1)."
      ]
    }
  ]
};

C["it:F201.2.4"] = {
  notes: [
    { h: "Big Data Infrastructure" },
    "Big data infrastructure is the combination of **hardware, software and storage** an organisation puts in place to capture, store, process and analyse big data. The spec groups it into three decisions: the **server configuration** (where processing happens), the **software platform** (the tools used), and the **data storage area** (where data lives). For every option you must know its characteristics, when it is used, and — the part that earns the marks — its **benefits and limitations**.",
    { callout: { t: "info", h: "The three infrastructure decisions", body: [
      { kv: [
        ["Server configuration", "Dedicated servers vs a distributed cluster of servers — how the processing power is arranged."],
        ["Software platform", "Open-source vs vendor-specific tools, plus visualisation, analytics, $NoSQL$ and integration software."],
        ["Data storage area", "Public/private cloud, data lake, data warehouse and $SSDs$ — where the data is physically held."]
      ] }
    ] } },
    { callout: { t: "tip", h: "What the exam actually wants", body: "Almost every question here is a compare/evaluate. For each option, hold a benefit AND a limitation in your head and be ready to recommend one for a given scenario using the 'factors influencing choice'." }},

    { page: "Server configurations" },
    { h: "Dedicated servers" },
    "A **dedicated server** is a single physical machine (or a small fixed set) reserved for one organisation or task. All of its processing power and storage belong to that workload.",
    { callout: { t: "info", h: "Dedicated servers — benefits vs limitations", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["Full control over hardware, software and security.", "Expensive to scale — you must buy and install more hardware (vertical scaling)."],
        ["Predictable, consistent performance (no 'noisy neighbours').", "A single point of failure — if it goes down, processing stops."],
        ["Better suited to sensitive data (physically isolated).", "Often under-utilised at low load, wasting capacity and money."],
        ["Simpler to set up and reason about than a cluster.", "The organisation carries the full maintenance burden."]
      ] } }
    ] } },
    { h: "Distributed cluster of servers" },
    "A **distributed cluster** is many servers (nodes) working together, splitting a job and processing data **in parallel** — the model behind $Hadoop$ and $Spark$. Data is replicated across nodes for resilience.",
    { callout: { t: "info", h: "Distributed cluster — benefits vs limitations", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["Handles massive volume and velocity by processing in parallel.", "Complex to set up, configure and manage."],
        ["Scales horizontally — add cheap commodity nodes as data grows.", "Network communication between nodes adds overhead."],
        ["Fault-tolerant — replicated data means no single point of failure.", "Keeping data consistent across nodes is hard."],
        ["Cost-effective at scale (commodity hardware, not one huge machine).", "Requires distributed-systems expertise to run well."]
      ] } }
    ] } },
    { h: "Dedicated vs distributed — and how to choose" },
    { table: { head: ["Factor", "Dedicated server", "Distributed cluster"], rows: [
      ["Scaling", "Vertical — upgrade the machine (limited).", "Horizontal — add more nodes (elastic)."],
      ["Fault tolerance", "Single point of failure.", "Replicated, resilient to node failure."],
      ["Cost at scale", "High (specialist hardware).", "Lower (commodity hardware)."],
      ["Complexity", "Lower — easier to manage.", "Higher — needs expertise."],
      ["Best for", "Steady, predictable workloads; full control; sensitive data.", "Very large, parallelisable datasets that grow fast."]
    ] } },
    { callout: { t: "memorise", h: "Factors influencing the choice of server configuration", body: "**Data volume & growth** (how big, how fast). **Scalability needs** (steady vs spiky). **Budget** (upfront hardware vs commodity). **In-house expertise** (can staff run a cluster?). **Fault-tolerance requirement** (how costly is downtime?). **Security/control** (must data stay physically isolated?). Frame any 'recommend a configuration' answer around these." }},

    { page: "Software platforms" },
    "The software platform is the set of tools used to store, process, analyse and present big data. The first decision is **open-source vs vendor-specific**; the spec also names visualisation, analytics, $NoSQL$ and integration software.",
    { callout: { t: "info", h: "Open-source vs vendor-specific", body: [
      { table: { head: ["", "Open-source (e.g. $Hadoop$, $Spark$)", "Vendor-specific (e.g. $Oracle$, $SAP$)"], rows: [
        ["Purpose", "Process/store/analyse big data with freely available, modifiable code.", "Managed, proprietary big-data tooling sold under licence."],
        ["Benefits", "Free licensing; fully customisable; large community; no lock-in.", "Professional support + $SLAs$; polished, integrated tools; training; accountability."],
        ["Limitations", "Needs in-house expertise; support is community-based (no guaranteed SLA).", "Licensing cost; vendor lock-in; less customisable."],
        ["When used", "Org has technical staff and wants flexibility/low cost.", "Org wants reliable managed support and has fewer specialists."]
      ] } }
    ] } },
    { callout: { t: "info", h: "The other platform types", body: [
      { kv: [
        ["Data visualisation software", "Turns analysis into charts/dashboards (e.g. $Tableau$, $PowerBI$). Benefit: makes patterns accessible to non-technical stakeholders. Limitation: cost, and poor design can mislead."],
        ["Data analytics software", "Performs statistics and modelling (e.g. $R$, $SAS$, $Python$ libraries). Benefit: extracts insight and builds predictive models. Limitation: needs analytical skill to use correctly."],
        ["$NoSQL$ database", "Non-relational store for unstructured/semi-structured data (e.g. $MongoDB$). Benefit: flexible schema, scales horizontally, handles variety. Limitation: weaker $ACID$ guarantees than $SQL$."],
        ["Data integration platforms", "Combine many sources into one unified view via $ETL$ pipelines. Benefit: consistency and automated pipelines. Limitation: setup complexity."]
      ] }
    ] } },
    { callout: { t: "miscon", h: "'Open-source means no cost'", body: "The licence is free, but running open-source big-data software needs skilled staff to set up, integrate and maintain it — a real cost. 'Free software' is not 'free to operate'." }},

    { page: "Data storage areas" },
    { callout: { t: "info", h: "Cloud: public vs private", body: [
      { table: { head: ["", "Public cloud (e.g. $AWS$, $Azure$)", "Private cloud"], rows: [
        ["Characteristics", "Shared third-party infrastructure, pay-as-you-go, elastic.", "Cloud infrastructure dedicated to one organisation."],
        ["Benefits", "Scales on demand; no upfront hardware; accessible anywhere; provider-managed.", "More control; better for security/compliance; customisable."],
        ["Limitations", "Less control; security/compliance concerns; ongoing cost; depends on provider + internet.", "Higher cost; the organisation must manage it."],
        ["When used", "Variable workloads, startups, rapid scaling.", "Sensitive data, regulated industries."]
      ] } }
    ] } },
    { h: "Data lake vs data warehouse" },
    "Both store large volumes, but they sit at different points in the pipeline. Raw data lands in a **lake**; once cleaned and structured by an **$ETL$** (Extract → Transform → Load) process it moves into a **warehouse** for reporting.",
    { table: { head: ["", "Data lake", "Data warehouse"], rows: [
      ["Data held", "Raw, any format, unprocessed.", "Structured, cleaned, processed."],
      ["Schema", "Schema-on-read (applied when queried).", "Schema-on-write (applied on entry)."],
      ["Main users", "Data scientists, ML, exploration.", "Business analysts, $BI$/reporting."],
      ["Cost per TB", "Lower (cheap bulk storage).", "Higher (optimised, structured)."],
      ["Risk", "Becomes a 'data swamp' if ungoverned.", "Rigid schema; ETL overhead."]
    ] } },
    { callout: { t: "info", h: "Solid state drives ($SSDs$)", body: "Fast storage with no moving parts. **Benefit:** very low latency and high read/write speed, improving processing throughput; reliable (no mechanical parts). **Limitation:** higher cost per GB than traditional hard drives." }},
    { callout: { t: "miscon", h: "Data lake ≠ data warehouse", body: "Running complex BI queries directly on a raw data lake is slow and unreliable — the data must be ETL-processed into a warehouse first. Lake = store raw at scale; warehouse = structured analytics and reporting." }},

    { page: "Emerging storage technologies" },
    "The spec names three emerging technologies — know one line on what each is and why it matters for big data.",
    { steps: [
      { h: "Blockchain", m: "A distributed, immutable ledger.", n: "Records are chained and tamper-evident — useful for secure, auditable transaction tracking across parties." },
      { h: "DNA storage", m: "Encoding data in synthetic DNA molecules.", n: "Extreme storage density and longevity (data lasts millennia). Still experimental: read/write is slow and expensive." },
      { h: "Quantum server", m: "Computation using quantum bits (qubits).", n: "Can explore many states at once, promising huge speed-ups for complex big-data simulations and optimisation. Still emerging." }
    ] },
    { callout: { t: "memorise", h: "Storage one-liners", body: "Public cloud = shared, elastic, pay-as-you-go. Private cloud = dedicated, controlled, compliant. Lake = raw + schema-on-read. Warehouse = structured + schema-on-write (after ETL). SSD = fast, low-latency, costlier per GB. Emerging: blockchain (immutable ledger), DNA (density/longevity), quantum (qubit speed)." }},

    { page: "Exam technique" },
    { callout: { t: "tip", h: "Command words", body: [
      { kv: [
        ["Describe / State", "Give the characteristics or features — no justification needed."],
        ["Explain", "Make a point then give its consequence ('…which means…')."],
        ["Compare", "Explicit X-vs-Y points that are linked, not two separate lists."],
        ["Discuss / Evaluate", "Both benefits AND limitations, then a justified conclusion/recommendation."]
      ] }
    ] } },
    "**Model structure for a 9-mark 'evaluate dedicated vs distributed' answer:** (1) define each configuration; (2) benefits of dedicated linked to a scenario; (3) limitations of dedicated; (4) benefits of distributed (scaling, fault tolerance); (5) limitations of distributed (complexity, expertise); (6) conclusion that recommends one **based on the organisation's data volume, growth, budget and expertise**.",
    { callout: { t: "warn", h: "Don't include", body: "The spec explicitly excludes the *costs of implementation* and the *providers of data lakes/warehouses* — don't waste time pricing things up or naming vendors as the answer." }}
  ],
  flashcards: [
    ["Two main server configurations for big data?", "Dedicated servers and a distributed cluster of servers."],
    ["One benefit and one limitation of a dedicated server?", "Benefit: full control + predictable performance. Limitation: single point of failure, expensive to scale."],
    ["Why does a distributed cluster scale well?", "It scales horizontally — add cheap commodity nodes to process more data in parallel ($Hadoop$)."],
    ["Two limitations of a distributed cluster?", "Complex to set up/manage, and needs distributed-systems expertise (plus network overhead)."],
    ["Open-source vs vendor-specific software?", "Open-source: free, customisable, community support, no lock-in but needs expertise. Vendor: managed support + $SLAs$ but licensing cost and lock-in."],
    ["What is vendor lock-in?", "Becoming so dependent on a vendor's platform that switching away is very costly/difficult."],
    ["Data lake vs data warehouse?", "Lake = raw, any format, schema-on-read. Warehouse = structured, processed, schema-on-write (after ETL), optimised for reporting."],
    ["What does ETL stand for and do?", "Extract, Transform, Load — moves raw lake data into a structured warehouse."],
    ["Public vs private cloud trade-off?", "Public: elastic + cheap to start but less control/compliance. Private: more control + compliance but higher cost to run."],
    ["Benefit and limitation of an $SSD$?", "Benefit: fast, low-latency read/write. Limitation: higher cost per GB than a hard drive."],
    ["Name the three emerging storage technologies.", "Blockchain (immutable ledger), DNA storage (density/longevity), quantum servers (qubit speed)."]
  ],
  quiz: [
    {
      q: "An organisation's data is growing rapidly and must tolerate hardware failures. Which configuration best fits?",
      opts: ["A single dedicated server", "A distributed cluster of servers", "A faster $SSD$", "A private cloud only"],
      ans: 1,
      why: "A distributed cluster scales horizontally and replicates data, so it handles growth and survives node failures."
    },
    {
      q: "Which is a limitation of a distributed cluster compared with a dedicated server?",
      opts: ["Cannot scale", "Single point of failure", "More complex to set up and manage", "No parallel processing"],
      ans: 2,
      why: "Clusters add complexity and need distributed-systems expertise; dedicated servers are simpler to run."
    },
    {
      q: "Which storage area is best for raw sensor data in any format, kept for later analysis?",
      opts: ["Data warehouse", "Data lake", "$SSD$ cache", "Private cloud"],
      ans: 1,
      why: "A data lake stores raw, unprocessed data of any format (schema-on-read)."
    },
    {
      q: "A business needs fast, reliable queries on cleaned historical sales data for dashboards. Best choice?",
      opts: ["Data lake", "Data warehouse", "NoSQL only", "Blockchain"],
      ans: 1,
      why: "A data warehouse holds structured, processed data optimised for BI/reporting queries."
    },
    {
      q: "What is a key disadvantage of vendor-specific big data software?",
      opts: ["No professional support", "Vendor lock-in", "Cannot be licensed", "Always slower"],
      ans: 1,
      why: "Vendor lock-in makes switching platforms later costly and complex."
    },
    {
      q: "Which is the strongest reason to choose open-source over vendor software?",
      opts: ["Guaranteed SLAs", "No need for any technical staff", "Free licensing and full customisation", "Impossible to misconfigure"],
      ans: 2,
      why: "Open-source removes licensing cost and allows full customisation — at the cost of needing in-house expertise."
    }
  ],
  exam: [
    {
      q: "A data analytics company processes a rapidly growing volume of streaming data. Evaluate the use of a distributed cluster of servers rather than a single dedicated server for this workload.",
      marks: 9,
      ms: [
        "Distributed cluster defined: many nodes processing data in parallel (1).",
        "Benefit: scales horizontally — add commodity nodes as data volume grows (1).",
        "Benefit: parallel processing handles high volume/velocity of streaming data (1).",
        "Benefit: fault tolerance — replicated data means no single point of failure (1).",
        "Limitation: complex to set up, configure and manage (1).",
        "Limitation: requires distributed-systems expertise the company may lack (1).",
        "Dedicated server contrast: simpler and more controllable but a single point of failure and costly to scale vertically (1).",
        "Application: links a point to the growing/streaming workload in the scenario (1).",
        "Justified conclusion recommending the cluster based on volume, growth and fault-tolerance needs (1)."
      ]
    },
    {
      q: "Discuss the factors a company should consider when choosing between open-source and vendor-specific software platforms.",
      marks: 6,
      ms: [
        "Open-source: lower initial licensing cost (1).",
        "Open-source: flexibility to customise the code (1).",
        "Open-source limitation: requires internal experts; only community support (1).",
        "Vendor: professional support and service-level agreements ($SLAs$) (1).",
        "Vendor limitation: higher recurring cost and vendor lock-in (1).",
        "Conclusion: choice depends on budget and in-house technical capability (1)."
      ]
    },
    {
      q: "Explain the difference between a data lake and a data warehouse, and give one situation suited to each.",
      marks: 4,
      ms: [
        "Data lake: stores raw, unstructured/varied data in its native format ('schema-on-read') (1); suited to exploratory data science where the questions aren't yet fixed (1).",
        "Data warehouse: stores cleaned, structured data in a fixed schema ('schema-on-write') (1); suited to fast, repeated business-intelligence reporting on known queries (1)."
      ]
    }
  ]
};

C["it:F201.2.5"] = {
  notes: [
    { h: "Data Science and Data Analytics" },
    "Organisations use two overlapping but distinct disciplines to get value from big data. **Data analytics** examines data that already exists to answer defined questions and support decisions; **data science** builds new models and algorithms to discover patterns and predict what will happen next. The spec wants you to know the **purpose of each**, the **difference between them**, and **how each is used** in the application areas from Topic 1.4 (banking, retail, healthcare, government, etc.).",
    { callout: { t: "tip", h: "The one distinction that earns the marks", body: "Analytics answers a question someone already asked ('what happened, and why?'). Science investigates a question no one has answered yet ('what will happen, and what should we do?') by building a model. Lead with that and you can't go wrong." }},

    { page: "Data analytics" },
    { callout: { t: "def", h: "Data analytics", body: "The process of examining existing datasets to find trends, answer specific business questions and support decision-making. It is mostly backward/present-looking and business-oriented." }},
    "A data **analyst** takes data that has been collected and cleaned, then queries and visualises it to explain what has happened and why — feeding reports and dashboards to decision-makers. It typically works with **structured** data using $SQL$, $Excel$ and business-intelligence ($BI$) tools such as $Tableau$ or $PowerBI$.",
    { callout: { t: "info", h: "The four types of analytics (increasing value & difficulty)", body: [
      { kv: [
        ["Descriptive", "What happened? — summaries, dashboards, KPIs (the most common)."],
        ["Diagnostic", "Why did it happen? — drilling into causes and correlations."],
        ["Predictive", "What is likely to happen? — uses models (overlaps with data science)."],
        ["Prescriptive", "What should we do about it? — recommends actions."]
      ] }
    ] } },
    { callout: { t: "info", h: "Analytics — benefits and limitations", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["Answers concrete business questions quickly.", "Mostly explains the past — limited at predicting novel events."],
        ["Accessible tools; less specialist skill than science.", "Quality depends entirely on clean, structured input data."],
        ["Clear dashboards aid fast, evidence-based decisions.", "Can confirm what you ask about but miss unknown patterns."]
      ] } }
    ] } },

    { page: "Data science" },
    { callout: { t: "def", h: "Data science", body: "An interdisciplinary field combining statistics, programming and domain knowledge to discover new insights and build predictive/prescriptive models from large, often messy datasets. It is forward-looking and research-oriented." }},
    "A data **scientist** forms a hypothesis, experiments with machine-learning models and works with **raw, unstructured and high-volume** data using $Python$, $R$ and $ML$ libraries. The output is an algorithm or model — new knowledge the business did not previously have — rather than a report.",
    { callout: { t: "info", h: "Data science — benefits and limitations", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["Predicts future outcomes and uncovers unknown patterns.", "Needs scarce, expensive specialist skills (stats + programming)."],
        ["Handles raw, unstructured, very large data.", "Models can be opaque ('black box') and hard to explain."],
        ["Creates reusable models that automate decisions.", "Garbage-in/garbage-out: biased training data → biased predictions."]
      ] } }
    ] } },

    { page: "Science vs analytics" },
    "This comparison is the heart of the topic — the spec explicitly asks for *the difference between data science and data analytics*.",
    { table: { head: ["Dimension", "Data analytics", "Data science"], rows: [
      ["Question", "Closed — 'What were last month's sales?'", "Open — 'Which customers will churn, and why?'"],
      ["Time focus", "Past / present (what happened).", "Future (what will happen, what to do)."],
      ["Data", "Mostly structured, already cleaned.", "Raw, unstructured, high-volume."],
      ["Tools", "$SQL$, $Excel$, $BI$ dashboards ($Tableau$).", "$Python$, $R$, $ML$ libraries."],
      ["Output", "Reports, dashboards, trend summaries.", "Algorithms, predictive models, new knowledge."],
      ["Role / skills", "Data analyst — business-oriented.", "Data scientist — research + programming."]
    ] } },
    { callout: { t: "miscon", h: "Data science is NOT just 'advanced analytics'", body: "Both use data, so students conflate them. The difference is the **method**: analytics answers a predefined question; science forms a hypothesis, builds an experiment and discovers knowledge that was never explicitly requested. Predictive/prescriptive analytics is where the two overlap — but classic analytics reports the past while science models the future." }},

    { page: "Use across sectors" },
    "The spec links this to the Topic 1.4 application areas — be ready to give an analytics use AND a science use for a named sector.",
    { table: { head: ["Sector", "Data analytics use", "Data science use"], rows: [
      ["Banking", "Monthly report of fraudulent transactions by type.", "Real-time ML model that flags fraud as it happens."],
      ["Retail", "Dashboard of stock levels and best-sellers.", "Demand-forecasting / customer-churn prediction model."],
      ["Healthcare", "Trend analysis of ward waiting times to plan staffing.", "ML model predicting which patients risk readmission."],
      ["Government", "Reporting tax-collection figures by region.", "Modelling the spread of disease to plan responses."]
    ] } },
    { callout: { t: "memorise", h: "Science vs analytics — decision rule", body: "If a **defined** question exists and you are explaining the past/present from clean data → **analytics** ($SQL$/$Excel$/$Tableau$, reports). If someone is **building a model** to predict or discover something previously unknown from raw data → **science** ($Python$/$R$/$ML$, algorithms). Analytics looks back; science looks forward." }},

    { page: "Exam technique" },
    { callout: { t: "tip", h: "How to answer 'difference' and 'how used' questions", body: [
      "**Difference (compare):** make linked points across both — question type, time focus, data, tools, output — never two separate lists.",
      "**How used (apply):** name the sector from the question, then give one concrete analytics task and one concrete science task for it.",
      "**Define/purpose:** analytics = answer known questions from existing data; science = discover new insight and build predictive models."
    ] } }
  ],
  flashcards: [
    ["Purpose of data analytics?", "Examine existing data to answer defined business questions and support decisions (mostly backward-looking)."],
    ["Purpose of data science?", "Discover new insights and build predictive models from large datasets (forward-looking)."],
    ["The key difference between them?", "Analytics answers a known question about the past/present; science builds a model to predict/discover the unknown."],
    ["Typical tools for data analytics?", "$SQL$, $Excel$, and $BI$ dashboards such as $Tableau$ or $PowerBI$."],
    ["Typical tools for data science?", "$Python$, $R$ and machine-learning libraries."],
    ["Name the four types of analytics.", "Descriptive (what happened), diagnostic (why), predictive (what will happen), prescriptive (what to do)."],
    ["One limitation of data analytics?", "It mostly explains the past and depends on clean structured data; it can miss unknown patterns."],
    ["One limitation of data science?", "Needs scarce specialist skills, and biased training data produces biased predictions; models can be hard to explain."],
    ["Which works with raw, unstructured data?", "Data science; analytics usually works with already-structured, cleaned data."]
  ],
  quiz: [
    {
      q: "Which discipline is more future-focused?",
      opts: ["Data analytics", "Data science", "Data cleaning", "Data storage"],
      ans: 1,
      why: "Data science builds predictive models to forecast future outcomes."
    },
    {
      q: "A manager asks 'what were our top-selling products last quarter?' Which discipline answers this?",
      opts: ["Data science", "Data analytics", "Machine learning", "Data wrangling"],
      ans: 1,
      why: "Data analytics answers a specific historical question from existing data."
    },
    {
      q: "Which analytics type answers 'why did sales fall?'",
      opts: ["Descriptive", "Diagnostic", "Predictive", "Prescriptive"],
      ans: 1,
      why: "Diagnostic analytics drills into causes and correlations behind what happened."
    },
    {
      q: "Which is a limitation specific to data science rather than analytics?",
      opts: ["Depends on clean structured data", "Needs scarce specialist statistics + programming skills", "Only produces dashboards", "Cannot use SQL"],
      ans: 1,
      why: "Data science requires expensive specialist skills and can produce hard-to-explain 'black box' models."
    },
    {
      q: "A retailer builds a model to predict which customers will stop shopping. This is best described as…",
      opts: ["Descriptive analytics", "Data science", "Diagnostic analytics", "Data storage"],
      ans: 1,
      why: "Building a predictive churn model to discover unknown future behaviour is data science."
    }
  ],
  exam: [
    {
      q: "Explain the difference between data science and data analytics. [4]",
      marks: 4,
      ms: [
        "Data analytics examines existing data to answer defined questions (1).",
        "It is backward/present-looking and uses tools like $SQL$/$BI$ dashboards (1).",
        "Data science builds models to discover new insight and predict the future (1).",
        "It is forward-looking, works with raw data and outputs algorithms/models (1)."
      ]
    },
    {
      q: "A hospital wants to (a) report current ward waiting times and (b) predict which patients are likely to be readmitted. Identify which discipline suits each and justify your choice. [6]",
      marks: 6,
      ms: [
        "(a) Data analytics (1).",
        "Reporting current waiting times answers a defined question from existing data (1).",
        "Likely descriptive analytics shown on a dashboard for staffing decisions (1).",
        "(b) Data science (1).",
        "Predicting readmission requires building a model on historical patient data (1).",
        "It discovers an unknown future outcome rather than reporting the past (1)."
      ]
    },
    {
      q: "Evaluate the use of data science (rather than data analytics) for a bank that wants to reduce fraud. [9]",
      marks: 9,
      ms: [
        "Data science defined: building predictive models from large datasets (1).",
        "Benefit: a model can flag fraud in real time as transactions happen (1).",
        "Benefit: it discovers new fraud patterns analytics reporting would miss (1).",
        "Benefit: automates decisions at scale across millions of transactions (1).",
        "Limitation: needs scarce, expensive data-science expertise (1).",
        "Limitation: a 'black box' model is hard to explain to regulators (1).",
        "Limitation: biased training data could unfairly flag legitimate customers (1).",
        "Analytics contrast: cheaper and clearer but only reports past fraud (1).",
        "Justified conclusion: science is worth it for real-time prevention if the bank can resource it and manage explainability (1)."
      ]
    }
  ]
};

C["it:F201.2.6"] = {
  notes: [
    { h: "Data Analytic Techniques" },
    "These are the specific statistical methods used to extract insight from big data. The spec names **six** — **regression, Monte Carlo simulation, factor analysis, cohort analysis, cluster analysis and time series analysis** — and for each you must know **what it is, its purpose, when it can be used, and its benefits and limitations**. You do **not** need the technical maths behind them.",
    { callout: { t: "info", h: "The six techniques at a glance", body: [
      { kv: [
        ["Regression analysis", "Models the relationship between variables to predict one from others."],
        ["Monte Carlo simulation", "Runs many random scenarios to model the probability of outcomes under uncertainty."],
        ["Factor analysis", "Reduces many correlated variables into a few underlying 'factors'."],
        ["Cohort analysis", "Groups people by a shared characteristic and tracks that group over time."],
        ["Cluster analysis", "Groups data points by similarity, with no predefined labels."],
        ["Time series analysis", "Studies data points taken at successive time intervals to find trends and seasonality."]
      ] }
    ] } },

    { page: "Regression analysis" },
    { callout: { t: "def", h: "Regression analysis", body: "A technique that models the relationship between a dependent variable and one or more independent variables, so the value of one can be predicted from the others (e.g. predicting ice-cream sales from temperature)." }},
    { callout: { t: "info", h: "Benefits and limitations", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["Quantifies how strongly variables are related.", "Correlation is not causation — a relationship may be coincidental."],
        ["Enables prediction of a numeric outcome.", "Poor at modelling complex, non-linear relationships."],
        ["Simple and widely understood.", "Sensitive to outliers and to missing variables."]
      ] } }
    ] } },

    { page: "Monte Carlo simulation" },
    { callout: { t: "def", h: "Monte Carlo simulation", body: "A technique that repeatedly runs a model with random inputs (often thousands of times) to produce a distribution of possible outcomes and their probabilities — used where there is uncertainty and risk." }},
    { callout: { t: "info", h: "Benefits and limitations", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["Models risk and uncertainty other techniques can't.", "Computationally expensive — many runs needed."],
        ["Gives a probability distribution, not a single guess.", "Output is only as good as the assumptions/inputs."],
        ["Handles many interacting random variables.", "Results can give false confidence if misread."]
      ] } }
    ] } },
    "Typical use: a bank running tens of thousands of simulated economic scenarios to estimate the probability of loan defaults.",

    { page: "Factor analysis" },
    { callout: { t: "def", h: "Factor analysis", body: "A technique that reduces a large number of correlated variables into a smaller set of underlying 'factors' that explain most of the variation — simplifying complex data (e.g. condensing 30 survey questions into 'satisfaction', 'price sensitivity' and 'loyalty')." }},
    { callout: { t: "info", h: "Benefits and limitations", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["Simplifies many variables into a few meaningful factors.", "The factors can be hard to interpret/name."],
        ["Removes redundancy from correlated variables.", "Subjective choices (how many factors) affect results."],
        ["Makes large survey/behaviour datasets manageable.", "Loses some detail in the reduction."]
      ] } }
    ] } },
    "When used: simplifying questionnaires, market research and any dataset with many overlapping variables before further analysis.",

    { page: "Cohort analysis" },
    { callout: { t: "def", h: "Cohort analysis", body: "A technique that groups individuals who share a defined characteristic (e.g. the month they signed up) into a 'cohort', then tracks that cohort's behaviour over time." }},
    { callout: { t: "info", h: "Benefits and limitations", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["Reveals how behaviour changes over a group's lifetime.", "Groups are chosen in advance — may miss better groupings."],
        ["Great for retention, loyalty and churn questions.", "Needs data tracked per individual over time."],
        ["Easy to compare cohorts side by side.", "Confounding events can affect one cohort, not another."]
      ] } }
    ] } },

    { page: "Cluster analysis" },
    { callout: { t: "def", h: "Cluster analysis", body: "A technique that automatically groups data points by similarity, with no predefined labels — the algorithm discovers the groups (e.g. segmenting customers by purchasing behaviour)." }},
    { callout: { t: "info", h: "Benefits and limitations", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["Discovers structure you didn't know existed.", "Number/shape of clusters can be subjective to choose."],
        ["No labelled training data required (unsupervised).", "Clusters can be hard to interpret or label meaningfully."],
        ["Powerful for market/customer segmentation.", "Sensitive to the scale and choice of input features."]
      ] } }
    ] } },
    { callout: { t: "miscon", h: "Cluster ≠ Cohort", body: "**Cohort** groups by a *predefined* trait (e.g. sign-up month) chosen before analysis. **Cluster** lets the *algorithm* find the groups from similarity, with no labels. Exam tell: groups defined beforehand → cohort; groups discovered automatically → cluster." }},

    { page: "Time series analysis" },
    { callout: { t: "def", h: "Time series analysis", body: "A technique that analyses data points recorded at successive, evenly spaced time intervals to identify trends, cycles and seasonality, and to forecast future values." }},
    { callout: { t: "info", h: "Benefits and limitations", body: [
      { table: { head: ["Benefits", "Limitations"], rows: [
        ["Reveals trends and repeating seasonal patterns.", "Assumes the past is a good guide to the future."],
        ["Supports forecasting (e.g. next quarter's demand).", "Disrupted by one-off shocks (e.g. a pandemic)."],
        ["Works on any regularly-sampled metric.", "Needs a long, consistent history to be reliable."]
      ] } }
    ] } },

    { page: "Choosing & exam technique" },
    { callout: { t: "memorise", h: "Pick the technique by the question", body: "**Predict a number from other variables** → regression. **Model risk/uncertain outcomes** → Monte Carlo. **Reduce many variables to a few factors** → factor analysis. **Track a defined group over time** → cohort. **Discover unknown groups by similarity** → cluster. **Find trends/seasonality over time** → time series." }},
    { callout: { t: "tip", h: "Answering 'identify the technique' questions", body: [
      "State the technique, then justify with the giveaway in the scenario (e.g. 'groups customers automatically' → cluster).",
      "If asked to evaluate, pair a benefit with a limitation for that technique.",
      "Remember: technical/mathematical detail is explicitly out of scope — focus on what, why, benefits, limitations."
    ] } }
  ],
  flashcards: [
    ["Purpose of regression analysis?", "Model the relationship between variables so one can be predicted from others."],
    ["One limitation of regression?", "Correlation is not causation, and it handles non-linear relationships poorly."],
    ["What does Monte Carlo simulation do?", "Runs many random scenarios to model the probability of different outcomes under uncertainty."],
    ["One limitation of Monte Carlo?", "Computationally expensive and only as good as its input assumptions."],
    ["What does factor analysis do?", "Reduces many correlated variables into a few underlying 'factors' that explain most of the variation."],
    ["One limitation of factor analysis?", "The resulting factors can be hard to interpret, and choices like how many factors are subjective."],
    ["What does cohort analysis group by?", "A predefined shared characteristic (e.g. sign-up month), then tracks that group over time."],
    ["What does cluster analysis group by?", "Statistical similarity, with no predefined labels — the algorithm finds the groups."],
    ["Cluster vs cohort — the key difference?", "Cohort groups are defined beforehand; cluster groups are discovered automatically."],
    ["Purpose of time series analysis?", "Analyse data over successive intervals to find trends/seasonality and forecast."],
    ["One limitation of time series analysis?", "It assumes the past predicts the future and is disrupted by one-off shocks."]
  ],
  quiz: [
    {
      q: "Which technique is best for finding seasonal trends?",
      opts: ["Cluster analysis", "Cohort analysis", "Time series analysis", "Regression"],
      ans: 2,
      why: "Time series analysis studies data over successive intervals to reveal trends and seasonality."
    },
    {
      q: "A bank runs 10,000 simulated economic scenarios to assess loan-default risk. Which technique is this?",
      opts: ["Regression", "Monte Carlo simulation", "Cohort analysis", "Cluster analysis"],
      ans: 1,
      why: "Monte Carlo uses repeated random sampling to model the probability of outcomes under uncertainty."
    },
    {
      q: "An e-commerce site groups customers automatically by purchase behaviour, with no predefined categories. Which technique?",
      opts: ["Cohort analysis", "Time series", "Cluster analysis", "Regression"],
      ans: 2,
      why: "Cluster analysis groups by similarity with no labels — the algorithm discovers the groups."
    },
    {
      q: "Which technique would predict sales figures from advertising spend?",
      opts: ["Regression analysis", "Cohort analysis", "Cluster analysis", "Monte Carlo"],
      ans: 0,
      why: "Regression models how one variable (sales) depends on another (ad spend) to predict it."
    },
    {
      q: "A researcher condenses 30 correlated survey questions into 3 underlying themes. Which technique?",
      opts: ["Cluster analysis", "Factor analysis", "Time series", "Regression"],
      ans: 1,
      why: "Factor analysis reduces many correlated variables into a few underlying factors."
    },
    {
      q: "Which is a limitation common to regression and time series?",
      opts: ["They require labelled clusters", "They can wrongly assume a past relationship continues", "They cannot use numeric data", "They only work on images"],
      ans: 1,
      why: "Both extrapolate from historical relationships, which may not hold (correlation≠causation; past≠future)."
    }
  ],
  exam: [
    {
      q: "A fashion retailer wants to see whether customers who signed up during a winter sale spend more over the year than those who signed up in summer. Identify the most suitable technique and explain how it would be used. [4]",
      marks: 4,
      ms: [
        "Cohort analysis (1).",
        "Create two cohorts based on sign-up period (winter vs summer) (1).",
        "Track the average spend/lifetime value of each cohort over 12 months (1).",
        "Compare the cohorts to judge which campaign attracted higher-value customers (1)."
      ]
    },
    {
      q: "Explain one benefit and one limitation of using Monte Carlo simulation to assess financial risk. [4]",
      marks: 4,
      ms: [
        "Benefit: models uncertainty by producing a probability distribution of outcomes (1).",
        "…rather than a single estimate, so risk is better understood (1).",
        "Limitation: computationally expensive — many simulation runs are needed (1).",
        "Limitation: results are only as reliable as the input assumptions (1) (max 1 limitation mark)."
      ]
    },
    {
      q: "A supermarket wants to (a) segment its customers into groups it has not predefined and (b) forecast next month's demand for ice cream. Recommend a technique for each and justify your choice. [6]",
      marks: 6,
      ms: [
        "(a) Cluster analysis (1).",
        "It groups customers by similarity with no predefined labels, discovering segments (1).",
        "Useful for targeted marketing to the discovered groups (1).",
        "(b) Time series analysis (or regression) (1).",
        "It uses historical demand over successive intervals to spot seasonality (1).",
        "…and forecast next month's demand, accepting it assumes past patterns continue (1)."
      ]
    }
  ]
};

C["it:F201.3.1"] = {
  notes: [
    "This leaf links big data to **artificial intelligence (AI)** and **machine learning (ML)** within **data science**. The spec wants: what AI is; how it is developed and used in data science (with benefits and limitations); what ML is; how ML algorithms are used and their purpose/characteristics; the benefits and limitations of each of the three named algorithms — **Decision Tree, Random Forest, K-Means** — and how each can be used for digital analysis; and finally **how big data, ML and AI interact**. It does *not* require the historical development of AI/ML.",
    { callout: { t: "def", h: "Artificial Intelligence (AI)", body: "Computer systems that perform tasks normally requiring human intelligence — reasoning, recognising patterns, understanding language, making decisions. In data science, AI is the broad goal; $ML$ is the main technique used to achieve it from data." }},
    { callout: { t: "def", h: "Machine Learning (ML)", body: "A subset of AI in which systems **learn patterns from data** and improve their predictions with experience, *without being explicitly programmed* with rules. The model is trained on data, then applied to new, unseen inputs." }},

    { page: "AI in data science" },
    { h: "How AI is developed and used" },
    "AI in data science is *developed* by training models on large datasets: data is collected and cleaned (the pipeline in 1.1), features are selected, a model is trained, validated and then deployed. It is *used* to automate analysis — classifying records, predicting outcomes, clustering customers, flagging anomalies (fraud), recommending content and powering natural-language tools.",
    { table: { head: ["AI in data science", "Benefit", "Limitation"], rows: [
      ["Automation of analysis", "Processes volumes no human team could, fast and consistently.", "Expensive to build; needs skilled data scientists."],
      ["Pattern/anomaly detection", "Spots subtle correlations and fraud humans miss.", "Correlation isn't causation — can mislead."],
      ["Prediction", "Enables proactive decisions (1.4).", "Only as good as training-data $Veracity$ — bias in → bias out."],
      ["Decision support", "Consistent application of criteria at scale.", "\"Black box\" models are hard to explain (ethics — 4.2)."]
    ] } },

    { page: "The three ML algorithms" },
    { callout: { t: "def", h: "Decision Tree (supervised)", body: "A tree of yes/no questions that splits data step-by-step to reach a classification or prediction at a leaf. Purpose: classify or predict from labelled data. Characteristics: easy to read and explain (white-box); used for digital analysis like credit-approval rules or medical triage." }},
    { callout: { t: "def", h: "Random Forest (supervised)", body: "An **ensemble** of many decision trees whose votes are combined for a final prediction. Purpose: more accurate, robust classification/prediction than one tree. Characteristics: reduces overfitting and the effect of any single noisy tree; used for fraud scoring, risk modelling, demand prediction." }},
    { callout: { t: "def", h: "K-Means (unsupervised)", body: "Groups unlabelled data into **$k$ clusters** by similarity/distance to cluster centres. Purpose: discover natural groupings without known labels. Characteristics: needs $k$ chosen in advance; sensitive to starting points; used for customer segmentation, anomaly detection, market grouping." }},
    { table: { head: ["Algorithm", "Type", "Benefit", "Limitation"], rows: [
      ["Decision Tree", "Supervised", "Transparent, easy to explain and visualise.", "Overfits; small data changes can flip the tree."],
      ["Random Forest", "Supervised", "High accuracy; resists overfitting and noise.", "Slower; a \"black box\" — harder to interpret than one tree."],
      ["K-Means", "Unsupervised", "Finds hidden groups without labels; simple, fast.", "Must pre-set $k$; struggles with non-spherical clusters/outliers."]
    ] } },
    { callout: { t: "miscon", h: "Supervised vs unsupervised", body: "Decision Tree and Random Forest are **supervised** — trained on *labelled* data with known correct answers (classification/prediction). $K$-Means is **unsupervised** — it finds structure in *unlabelled* data (clustering). Don't call $K$-Means a classifier: it groups, it doesn't predict a known label." }},

    { page: "How big data, ML and AI interact" },
    "These three are nested and mutually reinforcing. **Big data** supplies the huge, varied training sets; **ML** learns patterns from that data; **AI** is the resulting intelligent behaviour applied to a task. More high-quality data → better-trained ML models → more capable AI — and the AI's outputs often generate *more* data, feeding the loop.",
    { steps: [
      { h: "1 · Big data supplies fuel", m: "High $Volume$ + $Variety$ training data is captured and cleaned.", n: "Without enough representative data, models underfit or inherit bias." },
      { h: "2 · ML learns the patterns", m: "Algorithms (tree/forest/K-Means) train on that data to model relationships.", n: "More data generally → better pattern recognition, lower variance." },
      { h: "3 · AI applies the model", m: "The trained model drives an intelligent task — recommend, detect, predict, classify.", n: "This is the user-facing 'AI' in data science." },
      { h: "4 · Feedback loop", m: "AI outputs and user responses become new data.", n: "The cycle repeats, continually refining accuracy." }
    ] },
    { callout: { t: "memorise", h: "AI / ML / algorithms", body: "**AI** = machines doing intelligent tasks (the goal). **ML** = subset that *learns from data* (the method). **Algorithms** — **Decision Tree** (one explainable tree, supervised), **Random Forest** (ensemble of trees, more accurate, supervised), **K-Means** (clusters unlabelled data into $k$ groups, unsupervised). **Interaction:** big data → trains ML → powers AI → generates more data." }},

    { page: "Exam technique" },
    { callout: { t: "tip", h: "\"How interact\" questions", body: "Score them by writing the *chain*: big data is the **fuel**, ML is the **engine** that learns from it, AI is the **vehicle** that acts on the learning, and outputs feed back as new data. Name the role of each — a list of definitions alone won't reach the top band." }},
    { callout: { t: "warn", h: "Veracity caveat", body: "When stating an AI/ML benefit, pair it with the data-quality limitation: ML only finds *statistical correlations*; biased or unrepresentative training data reproduces that bias unknowingly (root of algorithmic bias — see 4.2)." }}
  ],
  flashcards: [
    ["Define AI and how ML relates to it.", "AI = machines performing tasks needing human-like intelligence. ML = a *subset* of AI that learns patterns from data without being explicitly programmed."],
    ["Name the three ML algorithms in the spec and their type.", "Decision Tree (supervised), Random Forest (supervised), $K$-Means (unsupervised)."],
    ["What is a Decision Tree and a key benefit/limitation?", "A tree of yes/no splits classifying data. Benefit: transparent/easy to explain. Limitation: overfits; unstable to small data changes."],
    ["What is a Random Forest and why is it more accurate than one tree?", "An ensemble of many decision trees whose votes combine — averaging out individual trees' errors/noise, reducing overfitting."],
    ["What does $K$-Means do and what must be set in advance?", "Groups unlabelled data into clusters by similarity; the number of clusters $k$ must be chosen beforehand."],
    ["Is $K$-Means supervised? Why/why not?", "No — unsupervised. It works on *unlabelled* data, finding natural groupings rather than predicting a known label."],
    ["How do big data, ML and AI interact?", "Big data fuels training → ML learns the patterns → AI applies them to a task → outputs become new data, refining the model (a loop)."],
    ["Give one benefit and one limitation of using AI in data science.", "Benefit: automates analysis of volumes no human could handle. Limitation: only as good as training-data veracity — bias in, bias out / black-box opacity."],
    ["Why does ML accuracy generally improve with more data?", "Larger, representative datasets expose more patterns and reduce the chance of learning from a skewed sample (lower bias/variance)."],
    ["For what digital analysis is Random Forest well suited?", "Fraud scoring, credit-risk modelling and demand prediction — where accuracy matters more than full transparency."]
  ],
  quiz: [
    {
      q: "Which algorithm groups unlabelled data into $k$ clusters by similarity?",
      opts: ["Decision Tree", "Random Forest", "$K$-Means", "Linear regression"],
      ans: 2,
      why: "$K$-Means is the unsupervised clustering algorithm; it needs $k$ set in advance."
    },
    {
      q: "A spam filter is trained on thousands of emails each labelled 'spam' or 'not spam'. This is an example of:",
      opts: ["Unsupervised learning", "Supervised learning", "Clustering", "Data wrangling"],
      ans: 1,
      why: "Labelled training data with known correct answers makes it supervised learning."
    },
    {
      q: "Why is a Random Forest usually more accurate than a single decision tree?",
      opts: [
        "It uses unlabelled data",
        "It combines many trees' votes, averaging out individual errors and reducing overfitting",
        "It never needs training data",
        "It always produces a simpler model"
      ],
      ans: 1,
      why: "Ensembling many trees cancels out the noise/overfitting of any single tree."
    },
    {
      q: "Which best describes how big data, ML and AI interact?",
      opts: [
        "They are three unrelated technologies",
        "Big data fuels ML training, ML powers AI behaviour, and AI outputs create more data",
        "AI replaces the need for big data",
        "ML stores the data that AI deletes"
      ],
      ans: 1,
      why: "Big data → trains ML → powers AI → generates new data, a reinforcing loop."
    },
    {
      q: "A key limitation of a single Decision Tree is that it:",
      opts: [
        "Cannot be explained to humans",
        "Tends to overfit and is unstable to small changes in the data",
        "Only works on unlabelled data",
        "Requires an ensemble to make any prediction"
      ],
      ans: 1,
      why: "Single trees overfit and can change drastically with minor data changes — Random Forest mitigates this."
    },
    {
      q: "Why must AI/ML benefits always be qualified by data quality?",
      opts: [
        "Because models understand context like humans",
        "Because ML learns statistical correlations, so biased training data produces biased predictions",
        "Because more data always slows the model",
        "Because AI cannot use structured data"
      ],
      ans: 1,
      why: "ML has no understanding of meaning; unrepresentative data is reproduced as algorithmic bias."
    }
  ],
  exam: [
    {
      q: "Describe the purpose and one characteristic of each of the three machine learning algorithms named in the specification.",
      marks: 6,
      ms: [
        "Decision Tree — purpose: classify/predict from labelled data (1); characteristic: transparent tree of yes/no splits, easy to explain (1).",
        "Random Forest — purpose: more accurate classification/prediction (1); characteristic: ensemble of many trees, resists overfitting (1).",
        "K-Means — purpose: cluster unlabelled data into groups (1); characteristic: unsupervised, requires $k$ set in advance (1)."
      ]
    },
    {
      q: "Explain how big data, machine learning and artificial intelligence interact in data science.",
      marks: 4,
      ms: [
        "Big data provides the large, varied training datasets (1).",
        "ML algorithms learn patterns/relationships from that data (1).",
        "AI applies the trained model to perform an intelligent task (predict/recommend/detect) (1).",
        "Outputs and user responses generate new data, refining the model in a feedback loop (1)."
      ]
    },
    {
      q: "A bank wants to use machine learning on its big data to detect fraudulent transactions. Evaluate the use of AI/ML for this purpose, referring to suitable algorithms.",
      marks: 9,
      ms: [
        "Big data supplies millions of labelled past transactions to train on (1).",
        "Random Forest suits fraud scoring — high accuracy, resists overfitting (1–2).",
        "K-Means could flag anomalies as transactions far from normal clusters (1–2).",
        "Benefit: detects subtle patterns in real time at a scale no human team could (1–2).",
        "Limitation: biased training data causes false positives that block genuine customers (1–2).",
        "Limitation: black-box models are hard to explain — ethics/GDPR Article 22 concerns (1).",
        "Judgement: valuable if data quality and human oversight are maintained (1–2)."
      ]
    }
  ]
};

C["it:F201.4.1"] = {
  notes: [
    "The spec's legal focus is **UK GDPR** — its *features*, *principles*, *rights of data subjects* and *marketing consent*. You must know the *latest version* of the regulation, its *main purpose(s)*, *how to comply*, *why compliance matters*, the *impacts of non-compliance* on organisations, and how *organisational policies* mitigate against non-compliance. You do **not** need the detailed legal content of the regulation itself.",
    { callout: { t: "def", h: "UK GDPR (latest version)", body: "The **UK General Data Protection Regulation**, the UK's data-protection law that came into force alongside the Data Protection Act 2018 and was retained/amended after Brexit (the current UK version). Its main purpose: to protect individuals' personal data and give them control over how organisations collect, store and use it. Enforced by the **Information Commissioner's Office ($ICO$)**." }},

    { page: "Features & principles" },
    { h: "Features" },
    { callout: { t: "info", h: "Key features of UK GDPR", body: [
      { kv: [
        ["Scope", "Applies to any **personal data** — information that can identify a living person — held digitally *or* in a structured paper system."],
        ["Controllers & processors", "Defines responsibilities for the organisation that decides *why/how* data is processed (controller) and any third party processing on its behalf."],
        ["Lawful basis", "Processing needs a lawful basis (e.g. consent, contract, legal obligation, legitimate interest)."],
        ["Breach notification", "Serious breaches must be reported to the $ICO$ within 72 hours."],
        ["Enforcement", "The $ICO$ can audit, order changes and issue fines."]
      ] }
    ] } },
    { h: "The seven principles" },
    { steps: [
      { h: "1 · Lawfulness, fairness & transparency", m: "Process data legally and openly.", n: "Tell people what you do with their data." },
      { h: "2 · Purpose limitation", m: "Only use data for the specified purpose.", n: "Can't repurpose delivery data for ad-selling." },
      { h: "3 · Data minimisation", m: "Collect only what is necessary.", n: "Don't hoard fields you don't need." },
      { h: "4 · Accuracy", m: "Keep data correct and up to date.", n: "Links to $Veracity$ — fix/erase errors." },
      { h: "5 · Storage limitation", m: "Don't keep data longer than needed.", n: "Delete records once their purpose ends." },
      { h: "6 · Integrity & confidentiality (security)", m: "Protect data from theft/loss.", n: "Encryption, access control, backups." },
      { h: "7 · Accountability", m: "Be able to *prove* you comply.", n: "Records, policies, a $DPO$ where required." }
    ] },
    { callout: { t: "memorise", h: "7 principles — LP-DA-SIA", body: "**L**awful/fair/transparent · **P**urpose limitation · **D**ata minimisation · **A**ccuracy · **S**torage limitation · **I**ntegrity & security · **A**ccountability. Hook: *Lawful Purpose, Data Accurate, Stored Securely, I'm Accountable.*" }},

    { page: "Rights & consent" },
    { callout: { t: "info", h: "Rights of data subjects", body: [
      { kv: [
        ["Right to be informed", "Know what data is collected and why."],
        ["Right of access", "See the data held about you (a Subject Access Request)."],
        ["Right to rectification", "Have inaccurate data corrected."],
        ["Right to erasure", "The 'right to be forgotten' — have data deleted."],
        ["Right to restrict processing", "Limit how data is used."],
        ["Right to data portability", "Receive/transfer your data in a usable format."],
        ["Right to object", "Object to processing, including direct marketing."],
        ["Rights re automated decisions", "Not be subject to solely automated decisions with significant effect (links to 4.2)."]
      ] }
    ] } },
    { callout: { t: "def", h: "Marketing consent", body: "Using personal data for marketing requires **freely given, specific, informed, unambiguous opt-in** consent — a positive action (ticking a box), never pre-ticked boxes or assumed consent. Individuals can withdraw consent at any time as easily as they gave it." }},
    { callout: { t: "miscon", h: "GDPR isn't only digital, and consent isn't the only basis", body: "Two common errors: (1) UK GDPR covers **structured paper records** too, not just databases — a filing cabinet of names/addresses must comply. (2) **Consent is one of six lawful bases**, not the only one; marketing specifically relies on opt-in consent, but other processing may use contract, legal obligation, etc." }},

    { page: "Compliance & non-compliance" },
    { h: "How to comply (and why)" },
    { callout: { t: "info", h: "Compliance measures", body: [
      { ul: [
        "Identify a lawful basis for every processing activity; obtain valid opt-in consent for marketing.",
        "Apply data minimisation and storage limits; delete data when its purpose ends.",
        "Secure data — encryption, access controls, staff training, backups.",
        "Honour data-subject rights promptly (access, erasure, rectification).",
        "Keep records and appoint a Data Protection Officer ($DPO$) where required (accountability).",
        "Report serious breaches to the $ICO$ within 72 hours."
      ] }
    ] } },
    "Compliance matters because it protects individuals' privacy, **maintains customer trust**, avoids heavy penalties, and is a legal obligation. **Organisational policies** — a clear privacy/data-protection policy, staff training, access controls, retention schedules and breach-response plans — mitigate against non-compliance by making correct handling routine rather than ad hoc.",
    { table: { head: ["Impact of non-compliance", "Detail"], rows: [
      ["Financial", "Fines up to £17.5m or 4% of global annual turnover (higher tier); lower tier £8.7m/2%."],
      ["Reputational", "Loss of customer trust and brand value after a publicised breach."],
      ["Legal", "Compensation claims from affected data subjects; $ICO$ enforcement orders."],
      ["Operational", "Forced deletion of unlawfully held datasets — losing analytical value; remediation costs."]
    ] } },
    { callout: { t: "memorise", h: "Non-compliance — 4 impacts", body: "**Financial** (up to £17.5m / 4% turnover) · **Reputational** (lost trust) · **Legal** (claims + $ICO$ orders) · **Operational** (forced data deletion + remediation). Mitigate with policies: lawful basis, minimisation, security, rights handling, training, breach plan." }},

    { page: "Exam technique" },
    { callout: { t: "tip", h: "Spot-the-breached-principle", body: "Scenario questions describe a misuse and ask which principle is broken: reselling delivery data → **purpose limitation**; keeping records for decades → **storage limitation**; a leaked unencrypted database → **integrity/security**; collecting needless fields → **data minimisation**; refusing a Subject Access Request → breaches the **right of access**." }},
    { callout: { t: "warn", h: "Name the latest regulation correctly", body: "Say **UK GDPR** (with the Data Protection Act 2018), not just 'GDPR' or 'the EU GDPR' — the spec asks for the *latest UK* version. Quoting the £17.5m / 4% figure earns a precise mark in non-compliance questions." }}
  ],
  flashcards: [
    ["What is the latest UK data-protection regulation and who enforces it?", "UK GDPR (alongside the Data Protection Act 2018), enforced by the Information Commissioner's Office ($ICO$)."],
    ["State the main purpose of UK GDPR.", "To protect individuals' personal data and give them control over how organisations collect, store and use it."],
    ["List the seven GDPR principles (LP-DA-SIA).", "Lawfulness/fairness/transparency, purpose limitation, data minimisation, accuracy, storage limitation, integrity & security, accountability."],
    ["What is the 'right to be forgotten'?", "The right to erasure — having personal data deleted when there's no lawful reason to keep it."],
    ["What does valid marketing consent require?", "Freely given, specific, informed, unambiguous **opt-in** (a positive action) — no pre-ticked boxes; withdrawable any time."],
    ["Does UK GDPR apply to paper records?", "Yes — to any personal data in a structured filing system, not just digital data."],
    ["Give three ways an organisation complies with UK GDPR.", "Lawful basis + opt-in consent; data minimisation and retention limits; security (encryption/access control); honouring data-subject rights; breach reporting within 72h."],
    ["State the maximum UK GDPR fine.", "Up to £17.5 million or 4% of global annual turnover, whichever is higher (higher tier)."],
    ["Name the four impacts of non-compliance.", "Financial (fines), reputational (lost trust), legal (claims/$ICO$ orders), operational (forced data deletion + remediation)."],
    ["How do organisational policies mitigate non-compliance?", "Privacy policy, staff training, access controls, retention schedules and breach-response plans make correct handling routine rather than ad hoc."]
  ],
  quiz: [
    {
      q: "A delivery app sells customers' addresses to a gym without consent. Which principle is breached?",
      opts: ["Accuracy", "Purpose limitation", "Storage limitation", "Accountability"],
      ans: 1,
      why: "The data is reused for a purpose other than the one it was collected for."
    },
    {
      q: "A hospital keeps patient records from 20 years ago that are no longer needed. Which principle is breached?",
      opts: ["Accuracy", "Data minimisation", "Storage limitation", "Security"],
      ans: 2,
      why: "Storage limitation requires deletion once the data's purpose has ended."
    },
    {
      q: "Which is a valid form of marketing consent under UK GDPR?",
      opts: [
        "A pre-ticked opt-in box",
        "Assumed consent from a purchase",
        "A box the user actively ticks to opt in",
        "Consent buried in unread terms"
      ],
      ans: 2,
      why: "Consent must be a freely given, unambiguous positive opt-in action."
    },
    {
      q: "What is the higher-tier maximum fine for a serious UK GDPR breach?",
      opts: [
        "£8.7m or 2% of turnover",
        "£17.5m or 4% of global annual turnover",
        "£500,000 fixed",
        "£1m or 10% of turnover"
      ],
      ans: 1,
      why: "The higher tier is up to £17.5m or 4% of global annual turnover, whichever is greater."
    },
    {
      q: "Which measure best demonstrates the 'accountability' principle?",
      opts: [
        "Encrypting the database",
        "Keeping records/policies that prove compliance and appointing a $DPO$ where required",
        "Collecting more data for analysis",
        "Marketing only to opted-in users"
      ],
      ans: 1,
      why: "Accountability is about being able to *demonstrate* compliance through records, policies and oversight."
    }
  ],
  exam: [
    {
      q: "State four of the seven principles of UK GDPR.",
      marks: 4,
      ms: [
        "Lawfulness, fairness and transparency (1).",
        "Purpose limitation (1).",
        "Data minimisation (1).",
        "Accuracy / storage limitation / integrity & security / accountability (1 each, max remaining)."
      ]
    },
    {
      q: "Explain how an organisation can comply with UK GDPR and why compliance is important.",
      marks: 6,
      ms: [
        "Establish a lawful basis and obtain opt-in consent for marketing (1).",
        "Apply data minimisation and delete data when no longer needed (1).",
        "Secure data with encryption/access controls and honour data-subject rights (1).",
        "Keep records/appoint a DPO to demonstrate accountability; report breaches within 72h (1).",
        "Important: protects individuals' privacy and maintains customer trust (1).",
        "Important: avoids heavy fines and legal action — it is a legal obligation (1)."
      ]
    },
    {
      q: "Discuss the impacts of non-compliance with UK GDPR on a big data organisation, and how organisational policies can reduce the risk.",
      marks: 9,
      ms: [
        "Financial: fines up to £17.5m or 4% of global turnover (1–2).",
        "Reputational: loss of customer trust and brand damage after a publicised breach (1–2).",
        "Legal: compensation claims from data subjects and $ICO$ enforcement orders (1–2).",
        "Operational: forced deletion of unlawful datasets, losing analytical value; remediation cost (1–2).",
        "Mitigation: clear privacy policy, staff training, access controls, retention schedules, breach-response plan (1–2).",
        "Judgement: proactive policies make compliance routine and far cheaper than the cost of a breach (1–2)."
      ]
    }
  ]
};

C["it:F201.4.2"] = {
  notes: [
    "Beyond the *legal* minimum of UK GDPR (4.1), the spec covers the *ethical* use of data: **automated decision making**; the **collection, storage, ownership and sharing** of data; **emerging ethical debates**; and **frameworks for ethical data management** — the **Data Ethics Framework** and **Inclusive Data Principles**. For each you must explain the *risks/impacts on individuals* and *how organisations respond*.",
    { callout: { t: "tip", h: "Legal vs ethical", body: "Something can be **legal but unethical**. UK GDPR sets the legal floor; ethics asks whether a practice is *fair, transparent and respectful* even where the law allows it. Top answers reference both — e.g. an automated decision may be GDPR-compliant yet still discriminatory." }},

    { page: "Automated decision making" },
    { callout: { t: "def", h: "Automated decision making (ADM)", body: "Making a decision about a person **solely by automated means** — an algorithm with no meaningful human involvement (e.g. auto-approving a loan, screening a CV, setting an insurance premium)." }},
    "ADM creates risks of **discrimination and bias**: if the training data reflects historical prejudice, the model reproduces it — at scale and invisibly. It also reduces *transparency* (people can't tell why they were rejected — the 'black box') and *empathy* (no human judgement of special circumstances).",
    { callout: { t: "warn", h: "How UK GDPR applies to ADM", body: "Individuals have the **right not to be subject to a solely automated decision** that has a legal or similarly significant effect. Organisations must offer human oversight, an explanation, and a route to **contest** the decision. ADM on special-category data needs extra safeguards." }},
    { table: { head: ["Impact on individuals", "Example"], rows: [
      ["Discrimination/bias", "A loan-scoring model trained on biased history rejects certain groups."],
      ["Lack of transparency", "An applicant can't find out why a job application was auto-rejected."],
      ["Loss of appeal/empathy", "Automated benefit denial with no human to review the circumstances."]
    ] } },

    { page: "Collection, storage, ownership & sharing" },
    { callout: { t: "info", h: "The four data-handling concerns", body: [
      { kv: [
        ["Collection", "Is consent informed? Are people aware how much is gathered? Protecting identity at the point of capture."],
        ["Storage", "Keeping data secure and only as long as needed; anonymisation/pseudonymisation to protect identity."],
        ["Ownership", "Who owns the value — individuals *create* it through behaviour, but organisations *profit* by analysing it. UK GDPR gives individuals rights (access, erasure, portability) even where the company holds it."],
        ["Sharing", "Selling/sharing datasets risks re-identification; third parties may use data in ways the subject never agreed to."]
      ] }
    ] } },
    { callout: { t: "miscon", h: "'Anonymised' ≠ safe to share freely", body: "Supposedly anonymous datasets can be **re-identified** by cross-referencing other public data — e.g. anonymous medical records + a public dataset can reveal individuals. This is why protecting identity is hard at big-data scale and why GDPR can still apply to 'anonymised' data sharing." }},
    "**How organisations respond:** clear consent and privacy notices, pseudonymisation/anonymisation, strict access controls and retention limits, data-sharing agreements, and honouring data-subject rights — turning the ethical concerns into operational policy.",

    { page: "Emerging debates & frameworks" },
    { callout: { t: "info", h: "Emerging ethical debates", body: [
      { ul: [
        "**Surveillance & profiling** — pervasive tracking (smart cities, social media) erodes privacy and can chill behaviour.",
        "**AI bias & fairness** — who is accountable when an algorithm discriminates?",
        "**Consent fatigue** — endless cookie/consent prompts mean consent is rarely truly informed.",
        "**Data and power** — a few large organisations control vast datasets, raising competition and democratic concerns.",
        "**Re-identification & genetic data** — increasingly sensitive data types create new risks."
      ] }
    ] } },
    { callout: { t: "def", h: "Data Ethics Framework", body: "A UK government framework guiding the responsible use of data in the public sector — built around **transparency, accountability and fairness** (and public benefit). Organisations use it as a checklist to assess a data project's ethics, not just its legality." }},
    { callout: { t: "def", h: "Inclusive Data Principles", body: "Principles ensuring datasets **represent all population groups** so analysis doesn't overlook or disadvantage under-represented people. They guard against the unrepresentative data that causes algorithmic bias — making fairness a design goal from the start." }},
    "**How organisations use frameworks:** adopt them as policy, run ethics/impact assessments on data projects, build diverse and representative datasets, document decisions, and assign accountability — moving from reactive compliance to proactive responsible-data practice.",
    { callout: { t: "memorise", h: "4.2 in one screen", body: "**ADM** — risk of bias/opacity; GDPR gives the right to human review/contest. **Collection/storage/ownership/sharing** — consent, security, who owns the value, re-identification risk. **Emerging debates** — surveillance, AI fairness, consent fatigue, data power. **Frameworks** — *Data Ethics Framework* (transparency/accountability/fairness) and *Inclusive Data Principles* (representation, anti-bias)." }},

    { page: "Exam technique" },
    { callout: { t: "tip", h: "Always reach the individual", body: "Ethics questions reward linking each issue to a concrete **impact on a person** — \"biased model → a qualified applicant is wrongly refused a mortgage.\" Then state the organisational response (human oversight, inclusive data, an ethics framework). Issue → impact → response is the full-mark shape." }},
    { callout: { t: "warn", h: "Don't just re-state GDPR", body: "4.2 is *ethics*, not a repeat of 4.1's legal rules. Mention GDPR where relevant (especially ADM), but the marks here are for fairness, bias, transparency, ownership and the two named frameworks." }}
  ],
  flashcards: [
    ["What is automated decision making (ADM)?", "Making a decision about a person solely by automated means, with no meaningful human involvement."],
    ["What right does UK GDPR give over significant automated decisions?", "The right not to be subject to a solely automated decision with significant effect — requiring human oversight and a route to contest it."],
    ["What is algorithmic bias and its cause?", "Unfair, discriminatory outputs caused by biased or unrepresentative training data being reproduced by the model at scale."],
    ["Why is data ownership an ethical issue?", "Individuals create the data through their behaviour, but organisations profit from analysing it; GDPR gives individuals rights (access, erasure, portability) despite the company holding it."],
    ["Why can 'anonymised' data still be a privacy risk?", "It can be re-identified by cross-referencing with other public datasets, revealing individuals."],
    ["Name two emerging ethical debates around data.", "Pervasive surveillance/profiling, AI bias & accountability, consent fatigue, or concentration of data power (any two)."],
    ["What is the Data Ethics Framework?", "A UK government framework for responsible data use built on transparency, accountability and fairness — used to assess a project's ethics, not just legality."],
    ["What are the Inclusive Data Principles?", "Principles ensuring datasets represent all population groups, guarding against the unrepresentative data that causes algorithmic bias."],
    ["How do organisations respond to ownership/sharing concerns?", "Clear consent notices, pseudonymisation/anonymisation, access controls, retention limits, data-sharing agreements and honouring data-subject rights."],
    ["Legal vs ethical — what's the distinction?", "GDPR sets the legal floor; ethics asks whether a practice is fair/transparent/respectful even where the law permits it (legal can still be unethical)."]
  ],
  quiz: [
    {
      q: "Which term describes $AI$ reproducing human prejudice from its training data?",
      opts: ["Data portability", "Algorithmic bias", "Data minimisation", "Pseudonymisation"],
      ans: 1,
      why: "Bias arises when training data is unrepresentative or reflects historical discrimination."
    },
    {
      q: "Under UK GDPR, what must an organisation provide for significant solely-automated decisions?",
      opts: [
        "Nothing — they are exempt",
        "Human oversight and a way to contest the decision",
        "A faster algorithm",
        "More training data only"
      ],
      ans: 1,
      why: "Individuals can require human review and the ability to challenge the outcome."
    },
    {
      q: "Why is sharing an 'anonymised' dataset still ethically risky?",
      opts: [
        "It is always illegal",
        "It can be re-identified by combining it with other public data",
        "Anonymised data cannot be analysed",
        "It removes the need for consent forever"
      ],
      ans: 1,
      why: "Re-identification through cross-referencing defeats naive anonymisation."
    },
    {
      q: "Which framework specifically targets representation to reduce bias?",
      opts: ["Data Ethics Framework", "Inclusive Data Principles", "UK GDPR Article 5", "ISO 9001"],
      ans: 1,
      why: "The Inclusive Data Principles ensure all population groups are represented in datasets."
    },
    {
      q: "Which is the best example of a practice that is legal under GDPR but may still be unethical?",
      opts: [
        "Deleting data when its purpose ends",
        "A consent-based but opaque automated scoring system that disadvantages a group",
        "Encrypting stored personal data",
        "Reporting a breach within 72 hours"
      ],
      ans: 1,
      why: "It can satisfy a lawful basis yet be unfair/discriminatory and untransparent — an ethics failing."
    }
  ],
  exam: [
    {
      q: "Explain two ways automated decision making can negatively impact individuals.",
      marks: 4,
      ms: [
        "Discrimination/bias — a model trained on biased data unfairly rejects certain groups (1) at scale and invisibly (1).",
        "Lack of transparency — individuals can't find out why they were rejected ('black box') (1) and have no clear route to appeal (1).",
        "(Accept loss of human empathy/judgement of special circumstances.)"
      ]
    },
    {
      q: "Describe how the Data Ethics Framework and the Inclusive Data Principles help an organisation manage data ethically.",
      marks: 4,
      ms: [
        "Data Ethics Framework — guides responsible use via transparency, accountability and fairness (1); used to assess a project's ethics, not just legality (1).",
        "Inclusive Data Principles — ensure datasets represent all population groups (1); reducing the unrepresentative data that causes algorithmic bias (1)."
      ]
    },
    {
      q: "A bank uses an automated decision-making system to approve or reject loan applications. Discuss the ethical implications and how the bank should respond.",
      marks: 9,
      ms: [
        "Algorithmic bias — biased historical lending data perpetuates discrimination against groups (1–2).",
        "Transparency — applicants can't understand a black-box rejection (1).",
        "GDPR/ADM — individuals have the right to human review and to contest the decision (1–2).",
        "Ownership/consent — personal financial data used to train the model; was consent informed? (1).",
        "Benefit side — faster, consistent decisions free of individual human prejudice (1).",
        "Response — human oversight, an appeal process, inclusive/representative data, an ethics framework (1–2).",
        "Judgement: acceptable only with oversight, explainability and bias testing (1)."
      ]
    }
  ]
};

C["it:F201.5.1"] = {
  notes: [
    "This leaf is about big data and the **environment**. The spec lists six areas: **accuracy of weather forecasting; natural disaster management; energy efficiency; environmental management; platforms to combat climate change; and emerging environmental developments** affected by big data. For each you must explain *how big data is used* and its *benefits and limitations*.",
    { callout: { t: "tip", h: "The recurring trade-off", body: "Big data helps *understand and protect* the environment — but the data centres, sensors and satellites that power it **consume energy and produce e-waste**. Nearly every full-mark answer here ends by weighing the environmental *good* against this environmental *cost*." }},

    { page: "The six environmental areas" },
    { callout: { t: "info", h: "How big data is used in each", body: [
      { kv: [
        ["Accuracy of weather forecasting", "Huge volumes of satellite, sensor and historical data feed models that predict weather more accurately and further ahead."],
        ["Natural disaster management", "Seismic, weather and satellite data power early-warning systems and post-event response (mapping damage, targeting rescue)."],
        ["Energy efficiency", "Smart grids and smart meters use real-time data to match supply to demand and cut waste; analytics optimise building/industry energy use."],
        ["Environmental management", "Satellite and sensor data track deforestation, ocean health, air quality and ice melt objectively at global scale."],
        ["Platforms to combat climate change", "Shared global datasets and modelling platforms let scientists/governments collaborate on emissions and climate projections."],
        ["Emerging environmental developments", "New uses — e.g. precision agriculture, carbon-tracking, biodiversity monitoring with AI/$IoT$ — continually expand what big data can do for the environment."]
      ] }
    ] } },

    { page: "Benefits & limitations" },
    { table: { head: ["Area", "Benefit", "Limitation"], rows: [
      ["Weather forecasting", "More accurate, earlier warnings reduce loss of life/economic damage.", "Models can still fail for unprecedented events; needs costly compute."],
      ["Natural disaster mgmt", "Early-warning systems give time to evacuate; faster targeted rescue.", "False alarms erode public trust; infrastructure may fail in the disaster."],
      ["Energy efficiency", "Smart grids cut waste and emissions; lower bills.", "Expensive sensor/network rollout; cybersecurity of the grid."],
      ["Environmental management", "Objective, global, continuous monitoring of ecosystems.", "High energy cost of satellites; data gaps from cloud cover."],
      ["Climate platforms", "International collaboration accelerates climate science.", "The data centres themselves emit significant $CO_2$ and use water."],
      ["Emerging developments", "Opens new frontiers (precision farming, carbon tracking).", "Unproven, costly, and may raise their own footprint."]
    ] } },
    { callout: { t: "miscon", h: "Big data isn't automatically 'green'", body: "Some firms ($Google$, $Microsoft$) buy renewable energy, but the global majority of data centres still draw heavily on fossil fuels, use vast cooling water, and generate hardware **e-waste**. Big data is a *tool* for the environment whose own footprint must be managed — not an inherently clean technology." }},
    { callout: { t: "memorise", h: "Environment — both sides", body: "**Helps:** accurate forecasting, disaster early-warning, smart-grid energy efficiency, satellite environmental monitoring, climate-modelling platforms, emerging green uses. **Costs:** data centres' electricity + cooling water + $CO_2$, sensor/satellite energy, and e-waste from hardware churn." }},

    { page: "Exam technique" },
    { callout: { t: "tip", h: "Use the named six", body: "Map your answer to the spec's six areas rather than vague 'big data helps the planet'. Name the data source (satellite/sensor/seismic), the use (forecast/early-warning/grid optimisation), then a benefit *and* a limitation." }},
    { callout: { t: "warn", h: "Always include the footprint limitation", body: "An evaluation that praises big data's environmental benefits without acknowledging the energy/e-waste cost of the infrastructure is one-sided and capped. The footprint *is* the key limitation examiners look for." }}
  ],
  flashcards: [
    ["List the six environmental areas big data affects.", "Weather-forecast accuracy, natural disaster management, energy efficiency, environmental management, platforms to combat climate change, and emerging environmental developments."],
    ["How does big data improve weather forecasting?", "Vast satellite/sensor/historical data feeds models that predict weather more accurately and further ahead."],
    ["How is big data used in natural disaster management?", "Seismic/weather/satellite data powers early-warning systems and post-event response — mapping damage and targeting rescue."],
    ["How do smart grids improve energy efficiency?", "They use real-time data to balance electricity supply and demand, cutting waste and emissions."],
    ["How does big data support environmental management?", "Satellite/sensor data tracks deforestation, ocean health, air quality and ice melt objectively at global scale."],
    ["What is the main environmental *cost* of big data?", "Data centres consume large amounts of electricity and cooling water and produce $CO_2$; hardware churn creates e-waste."],
    ["Give a limitation of big-data disaster early-warning.", "False alarms erode public trust, and the data infrastructure itself may fail during the disaster."],
    ["Why isn't big data automatically 'green'?", "Most data centres still rely heavily on fossil-fuel energy and water cooling, and generate e-waste — its footprint must be actively managed."],
    ["Give an emerging environmental use of big data.", "Precision agriculture, carbon/emissions tracking, or AI/$IoT$ biodiversity monitoring."],
    ["State the core environmental trade-off of big data.", "It helps understand and protect the environment, but the centres/sensors/satellites powering it consume energy and create e-waste."]
  ],
  quiz: [
    {
      q: "Which technology uses big data to balance electricity supply and demand in real time?",
      opts: ["Data lake", "Smart grid", "Blockchain", "$NoSQL$ database"],
      ans: 1,
      why: "Smart grids use real-time sensor data to optimise electricity distribution and cut waste."
    },
    {
      q: "A country builds five new data centres for climate modelling. What environmental trade-off arises?",
      opts: ["Better forecasting", "Increased $CO_2$ from power consumption", "Faster rescue", "Cheaper satellites"],
      ans: 1,
      why: "Data centres consume large amounts of (often non-renewable) electricity, producing significant emissions."
    },
    {
      q: "Which is a genuine limitation of big-data natural-disaster early-warning systems?",
      opts: [
        "They cannot use satellite data",
        "False alarms erode public trust and infrastructure may fail in the event",
        "They make forecasting less accurate",
        "They remove the need for any sensors"
      ],
      ans: 1,
      why: "False positives undermine trust, and the data-collection infrastructure can be knocked out by the disaster."
    },
    {
      q: "How does big data primarily support environmental management?",
      opts: [
        "By replacing all renewable energy",
        "By using satellite/sensor data for objective global monitoring of ecosystems",
        "By deleting climate records",
        "By increasing deforestation"
      ],
      ans: 1,
      why: "Satellite and sensor data give continuous, objective tracking of deforestation, oceans, air quality and ice."
    },
    {
      q: "Why must an evaluation of big data and the environment mention its own footprint?",
      opts: [
        "Because big data has no environmental benefits",
        "Because the energy, cooling water and e-waste of the infrastructure are the key limitation",
        "Because data centres are always carbon-neutral",
        "Because satellites use no energy"
      ],
      ans: 1,
      why: "The infrastructure's energy/e-waste cost is the central limitation that balances the benefits."
    }
  ],
  exam: [
    {
      q: "Describe two ways big data is used to benefit the environment.",
      marks: 4,
      ms: [
        "Weather forecasting/disaster management — satellite & sensor data give earlier, more accurate warnings (1) so people can prepare/evacuate (1).",
        "Energy efficiency — smart grids use real-time data to balance supply/demand (1), cutting waste and emissions (1).",
        "(Accept environmental monitoring via satellites / climate-modelling platforms.)"
      ]
    },
    {
      q: "Explain one benefit and one limitation of using big data for energy efficiency.",
      marks: 4,
      ms: [
        "Benefit: smart grids/meters match supply to demand, reducing waste and carbon emissions (1) and lowering bills (1).",
        "Limitation: requires expensive sensor/network infrastructure (1) and introduces cybersecurity risk to critical energy systems (1)."
      ]
    },
    {
      q: "Evaluate the use of big data in managing natural disasters, considering both its benefits and its environmental and practical limitations.",
      marks: 9,
      ms: [
        "Predictive models from weather/seismic data give early warnings (1–2).",
        "Authorities can pre-position resources and evacuate ahead of time (1–2).",
        "Post-disaster satellite imagery targets rescue and assesses damage (1).",
        "Limitation: false alarms cause costly unnecessary evacuations and erode trust (1–2).",
        "Limitation: data infrastructure may fail during the event; data centres carry their own energy/$CO_2$ footprint (1–2).",
        "Judgement: life-saving benefits generally outweigh costs if false-alarm protocols and resilient infrastructure are in place (1–2)."
      ]
    }
  ]
};

C["it:F201.5.2"] = {
  notes: [
    "This leaf covers big data's impact on **society**. The spec has two parts: **big data and the development of smart cities**, and **emerging social developments driven by big data** — namely **personalised healthcare, smart homes, traffic management, and urban & community planning**. You must know the *purpose* of a smart city, *how data from many sources is exchanged to optimise city operations*, the *benefits and limitations* of a smart city, and *how individuals are affected* by the emerging developments.",

    { page: "Smart cities" },
    { callout: { t: "def", h: "Smart city", body: "An urban area that uses **big data and $IoT$** — sensors, cameras, connected infrastructure — to monitor and manage city services (traffic, waste, lighting, energy, transport) in real time. Purpose: make the city more **efficient, sustainable and liveable** by basing operations on live data rather than guesswork." }},
    "A smart city works by **exchanging data from many sources** — traffic sensors, public-transport feeds, energy meters, environmental monitors, mobile/$GPS$ data and citizen apps — into a central platform that analyses it and triggers responses: re-timing traffic lights, rerouting buses, dimming unused street lighting, predicting maintenance. The value comes from *integration* — many feeds optimised together, not in isolation.",
    { table: { head: ["Smart city", "Benefit", "Limitation"], rows: [
      ["Traffic & transport", "Less congestion, lower emissions, smoother journeys.", "System failure/cyber-attack can paralyse the city."],
      ["Energy & lighting", "Lower energy use and cost via demand-based control.", "Expensive sensor/network infrastructure to install."],
      ["Waste & services", "Efficient, data-driven collection and cleaner streets.", "Mass surveillance — constant tracking of residents."],
      ["Safety", "Faster emergency response from live data.", "Privacy erosion; residents often can't opt out."],
      ["Inclusion", "Better-targeted public services.", "Digital exclusion — elderly/low-income may not benefit equally."]
    ] } },
    { callout: { t: "miscon", h: "Smart cities aren't purely beneficial", body: "Answers that list only benefits are capped. Smart cities also bring **mass surveillance** ($CCTV$/$IoT$ track all movement), **privacy erosion** (no real opt-out), **cyber-attack vulnerability** (interconnected systems = single points of failure), and **digital exclusion**. Always balance the efficiency gains against these." }},

    { page: "Emerging social developments" },
    { callout: { t: "info", h: "How individuals are affected", body: [
      { kv: [
        ["Personalised healthcare", "Genetic + lifestyle + monitoring data tailors treatment to the individual. **Effect:** earlier diagnosis, better outcomes — but highly sensitive data and risk of insurance/discrimination misuse."],
        ["Smart homes", "Connected appliances, heating and security learn habits and automate the home. **Effect:** convenience and lower bills — but always-on devices collect intimate behavioural data and can be hacked."],
        ["Traffic management", "Real-time $GPS$/sensor data reroutes and re-times traffic. **Effect:** shorter, safer commutes and less pollution — but location tracking and dependence on the system."],
        ["Urban & community planning", "Footfall, movement and service-use data informs where to build parks, transport and services. **Effect:** better-designed communities — but planning driven by data may overlook under-represented residents."]
      ] }
    ] } },
    { callout: { t: "memorise", h: "Society — smart city + 4 developments", body: "**Smart city:** $IoT$ + big data exchanged across sources → optimise traffic/energy/waste/safety. Benefits efficiency/sustainability; costs surveillance, privacy, cyber-risk, exclusion. **Emerging developments:** *personalised healthcare* (tailored treatment), *smart homes* (automation/convenience), *traffic management* (faster commutes), *urban & community planning* (data-led design)." }},

    { page: "Exam technique" },
    { callout: { t: "tip", h: "'How is data exchanged?'", body: "For smart-city questions, explicitly name *multiple sources* (traffic sensors, transport feeds, energy meters, $GPS$, citizen apps) feeding a *central platform* that analyses and *acts*. The mark is for the **integration** of many feeds, not one sensor in isolation." }},
    { callout: { t: "warn", h: "Reach the individual", body: "For the emerging developments the spec asks *how individuals are affected* — so for each, give a concrete personal effect (better treatment, a lower bill, a shorter commute) **and** a personal risk (sensitive data exposure, surveillance, dependence). Pair benefit with impact every time." }}
  ],
  flashcards: [
    ["What is a smart city and its purpose?", "An urban area using big data/$IoT$ to manage services (traffic, waste, energy, lighting) in real time — purpose: a more efficient, sustainable, liveable city."],
    ["How does a smart city optimise operations?", "By exchanging data from many sources (traffic sensors, transport feeds, energy meters, $GPS$, citizen apps) into a central platform that analyses it and triggers responses."],
    ["Give two benefits of a smart city.", "Reduced congestion/emissions; lower energy use/cost; faster emergency response; better-targeted services (any two)."],
    ["Give two limitations of a smart city.", "Mass surveillance/privacy erosion; cyber-attack vulnerability; high infrastructure cost; digital exclusion (any two)."],
    ["Name the four emerging social developments driven by big data.", "Personalised healthcare, smart homes, traffic management, and urban & community planning."],
    ["How does personalised healthcare affect individuals?", "Genetic/lifestyle/monitoring data tailors treatment — earlier diagnosis and better outcomes, but very sensitive data and discrimination risk."],
    ["How do smart homes affect individuals?", "Convenience and lower bills through automation, but always-on devices collect intimate behavioural data and can be hacked."],
    ["How does data-driven urban planning affect communities?", "Footfall/movement data improves where parks, transport and services are placed — but may overlook under-represented residents."],
    ["Why is digital exclusion a smart-city concern?", "Elderly or low-income residents may lack the devices/skills to benefit, so improvements aren't shared equally."],
    ["What single word captures the value of a smart city's data?", "Integration — many feeds analysed *together* to optimise the whole city, not one sensor alone."]
  ],
  quiz: [
    {
      q: "Which best describes the purpose of a smart city?",
      opts: [
        "To remove all sensors from a city",
        "To use big data/$IoT$ to manage services efficiently and sustainably in real time",
        "To replace local government with a database",
        "To stop collecting any personal data"
      ],
      ans: 1,
      why: "Smart cities use integrated $IoT$/big data to optimise services and make the city more liveable."
    },
    {
      q: "A hospital combines genetic sequencing with lifestyle data to prescribe individualised drugs. Which development is this?",
      opts: ["Smart homes", "Urban planning", "Personalised healthcare", "Traffic management"],
      ans: 2,
      why: "Tailoring treatment from individual genetic/lifestyle data is personalised healthcare."
    },
    {
      q: "Which is a significant negative impact of smart cities on individuals?",
      opts: ["Reduced commute times", "Mass surveillance of residents", "Lower energy bills", "Cleaner streets"],
      ans: 1,
      why: "Pervasive $IoT$/$CCTV$ tracking of movement raises serious privacy/surveillance concerns."
    },
    {
      q: "What gives a smart city's data its value?",
      opts: [
        "Keeping each sensor's data separate",
        "Integrating many data sources into one platform that analyses and acts",
        "Deleting data immediately",
        "Using a single traffic camera"
      ],
      ans: 1,
      why: "Optimising the whole city requires integrating many feeds together, not isolated sensors."
    },
    {
      q: "Which is a genuine personal risk of smart-home technology?",
      opts: [
        "Devices cannot save energy",
        "Always-on devices collect intimate behavioural data and can be hacked",
        "They make bills higher by design",
        "They cannot connect to the internet"
      ],
      ans: 1,
      why: "Convenience comes with continuous data collection and a cyber-attack surface inside the home."
    }
  ],
  exam: [
    {
      q: "Explain the purpose of a smart city and how it uses data to optimise city operations.",
      marks: 4,
      ms: [
        "Purpose: use big data/$IoT$ to make the city more efficient, sustainable and liveable (1).",
        "Collects data from many sources — traffic sensors, transport feeds, energy meters, $GPS$ (1).",
        "Integrates and analyses them on a central platform (1).",
        "Triggers responses — re-timing lights, rerouting transport, demand-based lighting/energy (1)."
      ]
    },
    {
      q: "Describe how two emerging social developments driven by big data affect individuals.",
      marks: 4,
      ms: [
        "Personalised healthcare — tailored treatment from genetic/lifestyle data (1) gives earlier diagnosis/better outcomes but exposes very sensitive data (1).",
        "Smart homes/traffic management — automation gives convenience/shorter commutes (1) but involves continuous tracking/cyber-risk (1).",
        "(Accept urban & community planning with valid individual effect.)"
      ]
    },
    {
      q: "Discuss the benefits and limitations of smart cities for the individuals who live in them.",
      marks: 9,
      ms: [
        "Benefit: less congestion and pollution, smoother journeys via traffic optimisation (1–2).",
        "Benefit: lower energy use/cost and cleaner, better-targeted public services (1–2).",
        "Benefit: faster emergency response from live data (1).",
        "Limitation: mass surveillance and privacy erosion with no real opt-out (1–2).",
        "Limitation: cyber-attack vulnerability — interconnected systems are single points of failure (1–2).",
        "Limitation: digital exclusion of elderly/low-income residents (1).",
        "Judgement: net positive only with strong privacy safeguards, security and inclusive design (1–2)."
      ]
    }
  ]
};

})(window.KOS_CONTENT);
