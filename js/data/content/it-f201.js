/* Kurenai OS — deep content: OCR IT AAQ Unit F201 Big Data */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["it:F201.1.1"] = {
  notes: [
    { h: "The 6Vs of Big Data" },
    { callout: { t: "info", h: "Key Characteristics", body: [
      { kv: [
        ["Volume", "The sheer amount of data generated (e.g., Petabytes of $IoT$ streams)."],
        ["Velocity", "The speed at which data is generated and must be processed (e.g., real-time stock ticks)."],
        ["Variety", "The range of formats (Structured, Unstructured, Semi-structured)."],
        ["Veracity", "The accuracy, quality, and trustworthiness of the data."],
        ["Value", "The usefulness of the data to the organisation's goals ($ROI$)."],
        ["Variability", "Inconsistency in the data flow or meaning over time (e.g., seasonal peaks or context shifts)."]
      ] }
    ] } },
    { table: { head: ["V", "Significance in Analytics"], rows: [
      ["$Volume$", "Determines the storage infrastructure ($Data Lakes$)."],
      ["$Velocity$", "Requires real-time streaming tools ($Spark$)."],
      ["$Veracity$", "High veracity data reduces the risk of incorrect decisions."]
    ] } },
    { h: "Six Steps for Analysing Big Data" },
    { steps: [
      { h: "Data Collection", m: "Ingestion", n: "Gathering raw data from sources like $GPS$ and social media." },
      { h: "Data Storing", m: "Persistence", n: "Placing data in scalable systems like $Hadoop$ or $Cloud$ storage." },
      { h: "Data Cleaning", m: "Validation", n: "Removing duplicates and fixing errors to ensure $Veracity$." },
      { h: "Data Mining", m: "Discovery", n: "Using algorithms to find hidden patterns and relationships." },
      { h: "Data Analysis", m: "Insight", n: "Interpreting mined patterns to generate business value." },
      { h: "Data Consumption", m: "Visualisation", n: "Presenting findings via dashboards for decision-making." }
    ] },
    { callout: { t: "memorise", h: "6Vs + Analysis Pipeline", body: "Volume (amount), Velocity (speed of generation), Variety (format types), Veracity (accuracy/quality), Value (ROI/usefulness), Variability (inconsistency over time). Pipeline: Collect → Store → Clean → Mine → Analyse → Consume." }},
    { callout: { t: "miscon", h: "Velocity Is About Data Speed, Not Processing Speed", body: "Velocity measures how fast DATA is generated and arrives — not the speed of the system. The system must match or exceed data velocity to avoid bottlenecks. Also: Veracity is not just accuracy — it includes trustworthiness, consistency, and completeness." }}
  ],
  flashcards: [
    ["What are the $6Vs$?", "$Volume$, $Velocity$, $Variety$, $Veracity$, $Value$, $Variability$."],
    ["Define Veracity.", "The accuracy and quality of the data being collected."],
    ["What is the final step in big data analysis?", "Data Consumption."],
    ["How does Variability differ from Variety?", "$Variety$ is about format types; $Variability$ is about inconsistencies in data flow/meaning."],
    ["Which V is most critical in healthcare analytics?", "$Veracity$ — inaccurate medical data could directly harm patients."],
    ["What does $Value$ mean in the context of big data?", "The usefulness of the data to the organisation — whether acting on it produces a positive return on investment ($ROI$)."]
  ],
  quiz: [
    {
      q: "Which $V$ relates to the speed of data generation?",
      opts: ["$Volume$", "$Velocity$", "$Variety$", "$Veracity$"],
      ans: 1,
      why: "$Velocity$ is the rate at which data arrives."
    },
    {
      q: "Which step involves finding hidden relationships?",
      opts: ["Storing", "Cleaning", "Mining", "Consumption"],
      ans: 2,
      why: "Data mining uses algorithms to discover patterns."
    },
    {
      q: "A social media platform receives 500,000 posts per minute. Which characteristic is most relevant?",
      opts: ["$Veracity$", "$Value$", "$Velocity$", "$Volume$"],
      ans: 2,
      why: "$Velocity$ describes the speed at which data arrives and must be processed."
    }
  ],
  exam: [
    {
      q: "Explain why 'Veracity' is a critical characteristic for a healthcare firm using big data.",
      marks: 3,
      ms: [
        "Veracity refers to the accuracy/trustworthiness of data (1).",
        "In healthcare, inaccurate data could lead to wrong diagnoses or treatments (1).",
        "Ensuring data quality is vital for patient safety and regulatory compliance (1)."
      ]
    }
  ]
};

C["it:F201.1.2"] = {
  notes: [
    { h: "The Evolution of Big Data" },
    { callout: { t: "info", h: "Technological Drivers", body: [
      { kv: [
        ["Database Management Systems ($DBMS$)", "Transition from flat files to $RDBMS$ and then to $NoSQL$ for horizontal scaling — enabling the storage of high-variety data at scale."],
        ["Internet of Everything ($IoE$)", "The connection of people, processes, data, and things — billions of devices now generate continuous data streams."],
        ["Device Proliferation", "The explosion of smartphones and $IoT$ sensors — each device is a data source producing location, usage, and health signals."],
        ["Search Engines", "Required massive indexing and fast retrieval of unstructured web data — drove early innovation in distributed storage and retrieval."],
        ["Web-based Storage", "Cloud computing ($AWS$, $Azure$, $GCP$) provided affordable, elastic scale — lowering the cost barrier for organisations to store petabytes."]
      ] }
    ] } },
    { table: { head: ["Development", "Benefit", "Limitation"], rows: [
      ["$DBMS$ → $NoSQL$", "Flexible schemas; handles $Variety$.", "Weaker ACID guarantees; consistency trade-offs."],
      ["$IoE$ / Device Proliferation", "Massive increase in data $Volume$ and $Velocity$.", "Security risks; heterogeneous data formats."],
      ["Search Engines", "Drove scalable distributed indexing.", "Needed proprietary, non-portable solutions."],
      ["Web-based / Cloud Storage", "Pay-as-you-go scale for all organisations.", "Data sovereignty and vendor lock-in concerns."]
    ] } },
    { callout: { t: "memorise", h: "5 Key Drivers of Big Data", body: "(1) DBMS→NoSQL: flexible schemas for variety and horizontal scale. (2) IoE: billions of connected devices generating streams. (3) Device proliferation: smartphones and sensors everywhere. (4) Search engines: drove distributed unstructured indexing. (5) Cloud storage: elastic scale at low cost." }},
    { callout: { t: "miscon", h: "NoSQL Didn't Make SQL Obsolete", body: "NoSQL handles unstructured, high-variety data with horizontal scaling. But relational databases remain the standard for structured, transactional data requiring ACID compliance (banking, ERP systems). NoSQL trades strict consistency for scalability and schema flexibility." }}
  ],
  flashcards: [
    ["What is the $IoE$?", "The Internet of Everything (People, Process, Data, Things)."],
    ["How did $DBMS$ evolve?", "From rigid relational systems to flexible $NoSQL$ architectures."],
    ["Why did search engines drive big data?", "They had to process and index the entire web's unstructured content."]
  ],
  quiz: [
    {
      q: "Which development refers to the connection of people, data, and things?",
      opts: ["$DBMS$", "$IoE$", "$SQL$", "$SSD$"],
      ans: 1,
      why: "$IoE$ is the holistic connection of all four elements."
    }
  ],
  exam: [
    {
      q: "Identify TWO developments that contributed to big data and explain their impact.",
      marks: 4,
      ms: [
        "Proliferation of devices (1): Billions of sensors now generate data streams (1).",
        "Web-based storage (1): Allows for cheap, scalable storage of massive datasets (1)."
      ]
    }
  ]
};

C["it:F201.1.3"] = {
  notes: [
    { h: "Big Data Capture Methods" },
    { callout: { t: "info", h: "Sources of Capture", body: [
      { kv: [
        ["Digital images and videos", "$CCTV$, medical imaging, and satellite data."],
        ["$GPS$ signals", "Continuous location tracking from mobile devices."],
        ["$IoE$ connected devices", "Smart meters, wearables, and industrial sensors."],
        ["Natural language", "Voice recordings, call centre transcripts, and social media text."],
        ["Online surveys", "Direct consumer feedback and form submissions."],
        ["Satellites", "Weather monitoring and Earth observation imagery."],
        ["Sensors", "Hardware measuring temperature, motion, or pressure."],
        ["Social media sites", "Posts, likes, shares, and user profiles."],
        ["Transactional records", "Point-of-sale logs and online banking history."]
      ] }
    ] } },
    { table: { head: ["Capture Method", "Data Type", "Benefit", "Limitation"], rows: [
      ["Sensors / $IoE$ devices", "Structured (numeric)", "Continuous, real-time, high velocity", "Sensor failure; calibration drift."],
      ["Social Media", "Unstructured (text/image)", "Rich, real-time consumer sentiment", "Low veracity; fake accounts; bias."],
      ["$GPS$ signals", "Structured (coordinates)", "Precise real-time location at scale", "Privacy concerns; battery drain."],
      ["Satellites", "Unstructured (imagery)", "Global coverage; no physical access needed", "Expensive; cloud cover can block data."],
      ["Online Surveys", "Semi-structured ($JSON$/$XML$)", "Targeted questions; direct consumer input", "Self-selection bias; low response rates."],
      ["Transactional records", "Structured (relational)", "Accurate financial audit trail", "Slow batch upload; format standardisation needed."],
      ["Natural Language", "Unstructured (text/audio)", "Captures nuanced human intent", "Requires $NLP$/$AI$ to process; dialect variation."]
    ] } },
    { callout: { t: "memorise", h: "Capture Types + Data Classes", body: "Sensors/IoT = structured, continuous, high velocity. Social media = unstructured, high volume, bias risk. GPS = structured coordinates (privacy risk). Satellites = unstructured imagery, global coverage. Transactional records = structured, high accuracy. Natural language = unstructured, needs NLP." }},
    { callout: { t: "miscon", h: "Social Media Data Is Not Reliable Alone", body: "Social media suffers from low veracity (bots, fake accounts), demographic bias (not all groups are represented equally), and needs AI/NLP to process. Never list it as a benefit without also stating a limitation — exam answers listing only positives are capped." }}
  ],
  flashcards: [
    ["Name a source of unstructured data.", "Social media, digital video, or natural language audio."],
    ["What data type does $GPS$ generate?", "Structured (Coordinates and Timestamps)."],
    ["How are transactional records usually stored?", "In structured relational databases."],
    ["Limitation of survey data?", "Self-selection bias — respondents may not represent the full population."]
  ],
  quiz: [
    {
      q: "Which method is best for tracking logistics in real-time?",
      opts: ["Online surveys", "$GPS$ signals", "Satellites", "Transactional records"],
      ans: 1,
      why: "$GPS$ provides high-velocity location streams."
    }
  ],
  exam: [
    {
      q: "Describe the benefits and limitations of using 'Social Media' as a data capture method.",
      marks: 4,
      ms: [
        "Benefit: Large volume of real-time consumer sentiment (1).",
        "Benefit: Rich insights from unstructured text/images (1).",
        "Limitation: Low veracity due to fake accounts or bias (1).",
        "Limitation: Hard to process without $AI$/$NLP$ (1)."
      ]
    }
  ]
};

C["it:F201.1.4"] = {
  notes: [
    { h: "Purpose and Use of Big Data Analytics" },
    { callout: { t: "info", h: "Areas of Application", body: [
      { kv: [
        ["Banking", "Fraud detection, credit risk assessment, and algorithmic trading."],
        ["Communications, Media and Entertainment", "Recommendation engines ($Netflix$), personalised ads, and real-time content delivery."],
        ["Education", "Personalised learning paths, early-intervention alerts, and progress tracking."],
        ["Energy and utilities", "Smart grid management, demand forecasting, and predictive maintenance."],
        ["Government", "Public health monitoring, tax fraud detection, and urban planning."],
        ["Healthcare", "Disease outbreak prediction, drug discovery, and personalised medicine."],
        ["Insurance", "Customised premiums based on telematics data and risk modelling."],
        ["Manufacturing", "Supply chain optimisation, robotics control, and defect detection."],
        ["Retail", "Targeted marketing, inventory forecasting, and anticipatory shipping."]
      ] }
    ] } },
    { table: { head: ["Sector", "Benefit", "Limitation"], rows: [
      ["Banking", "Near-instant fraud detection saves millions.", "False positives block legitimate transactions."],
      ["Healthcare", "Earlier diagnosis, better outcomes.", "Data breaches risk patient privacy ($GDPR$)."],
      ["Retail", "Higher sales through personalisation.", "Customer distrust over data collection."],
      ["Government", "Evidence-based policy; faster emergency response.", "Mass surveillance concerns."]
    ] } },
    { callout: { t: "tip", h: "Strategic Goal", body: [
      "The primary purpose is to move from **reactive** to **proactive** decision-making based on statistical evidence."
    ] } },
    { callout: { t: "memorise", h: "Key Sectors + Their Use Cases", body: "Banking: fraud detection, credit risk. Healthcare: disease prediction, drug discovery, personalised medicine. Retail: targeted marketing, inventory forecasting. Manufacturing: predictive maintenance, defect detection. Government: tax fraud, urban planning. Insurance: telematics pricing. Goal: reactive → proactive decisions." }},
    { callout: { t: "info", h: "Case Studies: Big Data in Action", body: [
      { kv: [
        ["Retail ($Amazon$)", "Uses predictive analytics to recommend products and even 'anticipatory shipping' to stock local hubs before a customer even orders."],
        ["Transport ($Uber$/$Lyft$)", "Uses real-time $GPS$ and historic traffic data to calculate dynamic pricing (surge) and optimal driver routing."],
        ["Entertainment ($Netflix$)", "Anonymised viewing data is clustered to decide which original series to produce next, reducing the risk of failure."],
        ["Healthcare ($AlphaFold$)", "$DeepMind$ used big data of protein structures to predict 3D shapes of proteins, accelerating drug discovery by years."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Exam Technique: Technology → Outcome", body: [
      "When discussing case studies, always link the **Technology** ($ML$/$Big Data$) to a **Real-world Outcome** (Efficiency/Profit/Safety)."
    ] } },
    { callout: { t: "miscon", h: "Big Data Doesn't Guarantee Better Outcomes", body: "Benefits depend entirely on data veracity. Biased or poor-quality data produces wrong predictions. A fraud detection model trained on biased data will produce false positives, blocking legitimate transactions. Garbage in, garbage out — data quality is the foundation." }}
  ],
  flashcards: [
    ["Big data use in Banking?", "Fraud detection and credit risk modelling."],
    ["Big data use in Retail?", "Targeted marketing and stock management."],
    ["Big data use in Healthcare?", "Predicting epidemics and personalised medicine."],
    ["What is 'Anticipatory Shipping'?", "Shipping goods to local hubs before an order is placed, based on predictive analytics."],
    ["How does dynamic pricing work?", "Using real-time supply and demand data to adjust costs instantly (e.g., ride-sharing)."],
    ["Example of big data in entertainment?", "$Netflix$ using clusters to decide which shows to produce."]
  ],
  quiz: [
    {
      q: "Predictive maintenance is a key application for which sector?",
      opts: ["Banking", "Manufacturing", "Insurance", "Retail"],
      ans: 1,
      why: "Manufacturing uses data to predict when machines will fail."
    },
    {
      q: "Which company uses data to ship products before they are even ordered?",
      opts: ["$Uber$", "$Amazon$", "$Netflix$", "$DeepMind$"],
      ans: 1,
      why: "$Amazon$'s anticipatory shipping is a famous predictive analytics case study."
    }
  ],
  exam: [
    {
      q: "Evaluate the benefits of big data analytics for a national government during a pandemic.",
      marks: 6,
      ms: [
        "Real-time tracking of infection rates to allocate resources (1).",
        "Predictive modelling to identify future hotspots (1).",
        "Monitoring public sentiment towards restrictions via social media (1).",
        "Limitations: Data privacy concerns ($GDPR$) (1).",
        "Limitations: Integration issues between different regional systems (1).",
        "Conclusion: Vital for evidence-based policy making (1)."
      ]
    }
  ]
};

C["it:F201.2.1"] = {
  notes: [
    { h: "Types of Big Data" },
    { callout: { t: "info", h: "Data Classifications", body: [
      { kv: [
        ["Structured", "Organised in rows and columns with a fixed schema (e.g., $SQL$ tables, $CSV$)."],
        ["Unstructured", "No predefined format; very high volume (e.g., Video, Audio, $CCTV$)."],
        ["Semi-structured", "No fixed schema but contains tags or metadata (e.g., $XML$, $JSON$, Email)."]
      ] }
    ] } },
    { table: { head: ["Classification", "Examples"], rows: [
      ["Structured", "Transactional records, $Continuous$ sensor data, $Discrete$ counts."],
      ["Unstructured", "Social media posts, Weather satellite images."],
      ["Semi-structured", "Zipped files, Web pages, $XML$ documents."]
    ] } },
    { callout: { t: "info", h: "Numeric Data Subtypes", body: [
      { kv: [
        ["Continuous", "Data that can take any value in a range (e.g., temperature $22.51$)."],
        ["Discrete", "Data that can only take specific, separate values (e.g., $5$ customers)."]
      ] }
    ] } },
    { callout: { t: "memorise", h: "Data Types — One-Line Definitions", body:
      "**Structured** = rows + columns, fixed schema ($CSV$, $SQL$). **Unstructured** = no format, high volume (video, audio, social media). **Semi-structured** = flexible tags/metadata ($JSON$, $XML$, email). **Continuous** = any value in a range (temperature). **Discrete** = only specific values (count of items)."
    } },
    { callout: { t: "miscon", h: "CSV Is Structured, Not Semi-Structured", body:
      "Students often classify $CSV$ as semi-structured because it is a plain text file. In fact, $CSV$ has a **fixed, column-based schema** — making it **structured**. $JSON$ and $XML$ are semi-structured because they use tags/keys but have no rigid schema requirement."
    } }
  ],
  flashcards: [
    ["Is $JSON$ structured or semi-structured?", "Semi-structured."],
    ["Give an example of continuous data.", "Temperature or $GPS$ coordinates."],
    ["Give an example of discrete data.", "Number of items in a shopping basket."],
    ["What makes data 'unstructured'?", "The lack of a predefined internal model or schema."]
  ],
  quiz: [
    {
      q: "Which of these is semi-structured?",
      opts: ["$SQL$ Database", "$XML$ file", "MP4 Video", "$CSV$ file"],
      ans: 1,
      why: "$XML$ uses tags but is not strictly tabular."
    },
    {
      q: "A count of people entering a building is...",
      opts: ["Continuous", "Discrete", "Unstructured", "Semi-structured"],
      ans: 1,
      why: "You cannot have a fraction of a person."
    }
  ],
  exam: [
    {
      q: "Explain why semi-structured data like $JSON$ is often preferred over structured $SQL$ for $IoT$ applications.",
      marks: 4,
      ms: [
        "$IoT$ sensors generate varying types of data (1).",
        "$JSON$ is flexible and allows adding new fields without rebuilding a schema (1).",
        "$SQL$ requires a rigid, predefined structure which is harder to update (1).",
        "$JSON$ is more lightweight for transmission over networks (1)."
      ]
    }
  ]
};

C["it:F201.2.2"] = {
  notes: [
    { h: "Data Preparation and Cleaning" },
    { callout: { t: "info", h: "Data Wrangling", body: [
      "The process of mapping 'raw' data into a usable format for mining."
    ] } },
    { h: "Cleaning Techniques" },
    { steps: [
      { h: "Removing Duplicates", m: "De-duplication", n: "Ensuring every record is unique to avoid skewing results." },
      { h: "Fixing Missing Data", m: "Imputation", n: "Filling gaps using averages, mode values, or removing incomplete rows entirely." },
      { h: "Removing Irrelevant Data", m: "Filtering", n: "Deleting noise columns/rows that do not contribute to the analysis goal." },
      { h: "Converting Data Types", m: "Casting", n: "Ensuring numbers are treated as integers (not text), and dates as date objects." },
      { h: "Clear Formatting", m: "Standardisation", n: "Aligning inconsistent formats: e.g. '30/12/24' and 'Dec 30 2024' → one format." },
      { h: "Fixing Structural Errors", m: "Mapping", n: "Splitting 'Full Name' into 'First' and 'Last'; combining 'Street' + 'City' into 'Address'." },
      { h: "Language Translation", m: "Normalisation", n: "Converting text data from multiple languages into a single language for uniform analysis." },
      { h: "Validating Data", m: "Checking", n: "Ensuring values fall within logical ranges — e.g. Age must be 0–120, Price must be > 0." }
    ] },
    { callout: { t: "memorise", h: "8 Cleaning Steps", body: "De-duplication (unique records), Imputation (fill missing: mean/mode or delete), Filtering (remove irrelevant data), Casting (fix data types), Standardisation (format alignment), Mapping (restructure fields), Translation (single language), Validation (range checks). Collective term: data wrangling." }},
    { callout: { t: "miscon", h: "Cleaning Is Not a One-Time Step", body: "In continuous big data pipelines, raw data keeps arriving and must be cleaned on an ongoing basis. A cleaned dataset becomes dirty again as source formats, business rules, or data definitions change. Cleaning is an iterative, continuous process — not a single stage." }}
  ],
  flashcards: [
    ["What is data wrangling?", "Transforming raw data into a clean, analytical format."],
    ["How can missing data be fixed?", "Via deletion or imputation (filling with mean/mode)."],
    ["Why is language translation a cleaning step?", "To standardise unstructured text from global sources."],
    ["What is 'de-duplication'?", "Removing duplicate records so each entry is unique — prevents results being skewed."],
    ["What is data validation in cleaning?", "Checking that values fall within logical ranges (e.g. Age must be 0–120)."]
  ],
  quiz: [
    {
      q: "Which technique fixes '30/12/24' and 'Dec 30 2024' being in the same column?",
      opts: ["Removing duplicates", "Standardising formats", "Data mining", "Encryption"],
      ans: 1,
      why: "Standardisation brings all data into one format."
    },
    {
      q: "A retailer's dataset contains the same customer 3 times under different spellings. Which cleaning step is needed?",
      opts: ["Imputation", "De-duplication", "Language translation", "Filtering"],
      ans: 1,
      why: "De-duplication removes duplicate records to prevent skewed analytics."
    },
    {
      q: "Which cleaning term describes filling a missing value with the average of that column?",
      opts: ["Standardisation", "Filtering", "Imputation", "Mapping"],
      ans: 2,
      why: "Imputation replaces missing values with a calculated substitute (mean, mode, or median)."
    }
  ],
  exam: [
    {
      q: "A dataset has many missing values in the '$Age$' column. Describe TWO ways this can be handled.",
      marks: 4,
      ms: [
        "Deletion (1): Removing the entire row if the age is missing (1).",
        "Imputation (1): Filling the missing value with the average age of the dataset (1)."
      ]
    }
  ]
};

C["it:F201.2.3"] = {
  notes: [
    { h: "Data Mining Techniques" },
    { callout: { t: "info", h: "Core Methods", body: [
      { kv: [
        ["Descriptive", "Summarises what happened in the past (e.g., last month's sales total)."],
        ["Diagnostic", "Investigates why something happened (e.g., drill-down into a sales drop)."],
        ["Predictive", "Forecasts what is likely to happen (e.g., stock market trends)."],
        ["Prescriptive", "Recommends actions to take (e.g., 'increase price by $10$ to maximise profit')."]
      ] }
    ] } },
    { table: { head: ["Technique", "Business Goal"], rows: [
      ["Predictive", "Forecast demand."],
      ["Diagnostic", "Identify root cause of fraud."],
      ["Prescriptive", "Optimise supply chain routes."]
    ] } },
    { callout: { t: "memorise", h: "4 Mining Types — DDPP Mnemonic", body:
      "**D**escriptive — 'What happened?' (report sales totals). **D**iagnostic — 'Why did it happen?' (drill down into a sales drop). **P**redictive — 'What will happen?' (forecast demand). **P**rescriptive — 'What should we do?' (recommend an action). Order of insight: Descriptive → Diagnostic → Predictive → Prescriptive."
    } },
    { callout: { t: "miscon", h: "Predictive ≠ Prescriptive", body:
      "A common error is conflating Predictive and Prescriptive. **Predictive** says 'sales will fall by 10%' — it forecasts. **Prescriptive** goes further and says 'therefore reduce price by £2 to counter the drop' — it recommends an action. Prescriptive always builds on a predictive output."
    } }
  ],
  flashcards: [
    ["Define Predictive Mining.", "Using historical data to forecast future outcomes."],
    ["What is Descriptive Mining?", "Summarising historical data to understand past performance."],
    ["Difference between Diagnostic and Descriptive?", "$Descriptive$ says 'what'; $Diagnostic$ says 'why'."],
    ["What is Prescriptive Analytics?", "Recommending the best action to take based on predictive findings."],
    ["Which mining type is the most advanced?", "Prescriptive — it not only predicts but actively recommends a course of action."]
  ],
  quiz: [
    {
      q: "Which mining type recommends a specific action?",
      opts: ["Descriptive", "Diagnostic", "Predictive", "Prescriptive"],
      ans: 3,
      why: "$Prescriptive$ analytics provides 'the best next step'."
    },
    {
      q: "A supermarket wants to know 'why did sales of umbrellas spike in March?'. Which type is this?",
      opts: ["Descriptive", "Diagnostic", "Predictive", "Prescriptive"],
      ans: 1,
      why: "Diagnostic investigates the cause of a known event."
    },
    {
      q: "Which analytics type outputs 'Stock up on umbrellas before the April forecast'?",
      opts: ["Descriptive", "Diagnostic", "Predictive", "Prescriptive"],
      ans: 3,
      why: "Prescriptive recommends a specific action to take."
    }
  ],
  exam: [
    {
      q: "A bank wants to know why loan defaults increased in Q3. Which mining technique is most appropriate and why?",
      marks: 3,
      ms: [
        "Diagnostic mining (1).",
        "It focuses on investigating the causes of past events (1).",
        "It allows the bank to drill down into variables like interest rates or employment (1)."
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
    }
  ]
};

C["it:F201.2.5"] = {
  notes: [
    { h: "Data Science and Data Analytics" },
    { callout: { t: "def", h: "Data Science", body: [
      "An interdisciplinary field that uses statistics, programming, and domain knowledge to **discover new insights** and build **predictive models** from large datasets. It is forward-looking."
    ] } },
    { callout: { t: "def", h: "Data Analytics", body: [
      "The process of **examining existing datasets** to answer specific business questions, identify trends, and support decision-making. It is primarily backward/present-looking."
    ] } },
    { table: { head: ["Dimension", "Data Science", "Data Analytics"], rows: [
      ["Focus", "Future — building new models", "Past/present — analysing what happened"],
      ["Tools", "$Python$, $R$, $ML$ libraries", "$SQL$, $Excel$, $BI$ dashboards ($Tableau$)"],
      ["Output", "Algorithms, prototypes, new knowledge", "Reports, dashboards, trend summaries"],
      ["Question type", "Open: 'What could we predict?'", "Closed: 'What were last month's sales?'"],
      ["Role", "Data Scientist — research-oriented", "Data Analyst — business-oriented"]
    ] } },
    { h: "Application to Sectors" },
    { table: { head: ["Sector", "Data Analytics Use", "Data Science Use"], rows: [
      ["Retail", "Sales dashboard / stock-level reports", "Demand-forecasting model / churn predictor"],
      ["Healthcare", "Patient admission trend analysis", "$ML$ model for early cancer detection"],
      ["Banking", "Monthly fraud transaction reports", "Real-time fraud detection algorithm"]
    ] } },
    { callout: { t: "warn", h: "Misconception", body: [
      "Data Science is NOT just 'more advanced' analytics. It uses a different scientific method — forming hypotheses, experimenting with models, and discovering new patterns the business didn't know existed."
    ] } },
    { callout: { t: "memorise", h: "Science vs Analytics — Decision Rule", body:
      "**Analytics**: backward-looking, answers a *known* question, tools = $SQL$/$Excel$/$Tableau$, output = reports/dashboards. **Science**: forward-looking, asks a *new* question, tools = $Python$/$R$/$ML$, output = algorithms/models. Exam shortcut: if a defined question exists → Analytics. If someone is building a model to discover something previously unknown → Science."
    } },
    { callout: { t: "miscon", h: "Data Science Is Not Just 'Advanced Analytics'", body:
      "Both use data, so students conflate them. The key distinction is the **method**: Analytics answers a predefined question (e.g. 'What were sales in Q3?'). Science forms a hypothesis, builds an experiment, and discovers new knowledge (e.g. 'Which customers will churn next month?'). The Science question was never asked — the model found it."
    } }
  ],
  flashcards: [
    ["Goal of Data Science?", "Discovering new questions and building predictive models from data."],
    ["Goal of Data Analytics?", "Finding answers to existing business questions and understanding trends."],
    ["Tool used in Data Science?", "Python / R / machine learning libraries."],
    ["Tool used in Data Analytics?", "SQL, Excel, Tableau or other BI dashboard software."],
    ["Which is more forward-looking?", "Data Science — it predicts the future."]
  ],
  quiz: [
    {
      q: "Which field is more future-focused?",
      opts: ["Data Analytics", "Data Science", "Data Cleaning", "Data Storage"],
      ans: 1,
      why: "Data Science builds predictive models to forecast future outcomes."
    },
    {
      q: "A company asks 'what were our top-selling products last quarter?' — which field answers this?",
      opts: ["Data Science", "Data Analytics", "Machine Learning", "Data Wrangling"],
      ans: 1,
      why: "Data Analytics answers specific historical business questions using existing data."
    }
  ],
  exam: [
    {
      q: "Explain the difference between Data Science and Data Analytics, using an example from the Healthcare sector for each.",
      marks: 6,
      ms: [
        "Data Analytics is backward/present-looking; answers defined questions (1).",
        "Healthcare Analytics example: analysing which hospital wards have the longest waiting times to schedule more staff (1).",
        "Data Science is forward-looking; discovers new patterns and builds models (1).",
        "Healthcare Science example: building an $ML$ model to predict which patients are at risk of readmission (1).",
        "Key difference: Analytics uses existing data to report; Science creates new algorithms to predict (1).",
        "Data Science relies heavily on big data as training input for its models (1)."
      ]
    }
  ]
};

C["it:F201.2.6"] = {
  notes: [
    { h: "Data Analytic Techniques" },
    { callout: { t: "info", h: "Statistical Methods", body: [
      { kv: [
        ["Regression Analysis", "Estimating the relationship between variables (e.g., how price affects demand)."],
        ["Monte Carlo Simulation", "Using randomness to model the probability of different outcomes."],
        ["Factor Analysis", "Reducing many variables into fewer 'factors' that explain variance."],
        ["Cohort Analysis", "Grouping users by shared characteristics over time (e.g., sign-up date)."],
        ["Cluster Analysis", "Grouping data points by similarity with NO predefined labels."],
        ["Time Series Analysis", "Analysing data points at successive time intervals to find trends."]
      ] }
    ] } },
    { table: { head: ["Technique", "Use Case"], rows: [
      ["Regression", "Predicting sales from temperature."],
      ["Monte Carlo", "Assessing financial risk in uncertain markets."],
      ["Cohort", "Checking if customers who joined in Jan are still loyal in Dec."]
    ] } },
    { callout: { t: "memorise", h: "6 Techniques — When to Use Each", body:
      "**Regression**: relationship between variables (X predicts Y). **Monte Carlo**: uncertain outcomes — model probability via random sampling (financial risk). **Factor Analysis**: reduce many variables into fewer hidden factors. **Cohort**: track a group defined by a *known shared characteristic* over time (loyalty by sign-up month). **Cluster**: group data by *statistical similarity* with no predefined labels (customer segments). **Time Series**: data at successive intervals — spot trends, cycles, seasonality."
    } },
    { callout: { t: "miscon", h: "Cluster ≠ Cohort Analysis", body:
      "**Cohort** groups users by a *predefined* characteristic (e.g. sign-up month) and tracks them over time — the groups are chosen before analysis. **Cluster** groups data purely by *statistical similarity* — the algorithm decides the groups with no prior definition. Exam tell: groups defined before analysis → Cohort. Groups discovered by the algorithm → Cluster."
    } }
  ],
  flashcards: [
    ["Define Regression.", "Statistical method for finding relationships between variables."],
    ["What does Monte Carlo use?", "Random sampling and probability modelling."],
    ["Define Time Series Analysis.", "Analysing data over time to spot trends or seasonality."],
    ["What does Cohort Analysis group users by?", "A shared characteristic — such as sign-up date or age group — and tracks them over time."],
    ["Key difference: Cluster vs Cohort?", "Cohort groups are defined before analysis (by a known trait). Cluster groups are discovered by the algorithm based on similarity."]
  ],
  quiz: [
    {
      q: "Which technique is best for finding seasonal trends?",
      opts: ["Factor Analysis", "Cluster Analysis", "Time Series Analysis", "Regression"],
      ans: 2,
      why: "Time series specifically looks at intervals over time."
    },
    {
      q: "A bank runs 10,000 simulated economic scenarios to assess loan default risk. Which technique is this?",
      opts: ["Regression", "Monte Carlo", "Cohort Analysis", "Factor Analysis"],
      ans: 1,
      why: "Monte Carlo uses random sampling to model the probability of different outcomes in uncertain situations."
    },
    {
      q: "An e-commerce site groups customers automatically by purchase behaviour, without predefined categories. Which technique?",
      opts: ["Cohort Analysis", "Time Series", "Cluster Analysis", "Regression"],
      ans: 2,
      why: "Cluster analysis groups data by similarity without predefined labels — the algorithm finds the groups."
    }
  ],
  exam: [
    {
      q: "A fashion retailer wants to see if customers who signed up during a winter sale spend more over the year than those who signed up in summer. Identify the technique and explain how it would be used.",
      marks: 4,
      ms: [
        "Cohort Analysis (1).",
        "Create two cohorts based on sign-up date (Winter vs Summer) (1).",
        "Track the average lifetime value ($LTV$) of each group over $12$ months (1).",
        "Compare results to determine marketing effectiveness (1)."
      ]
    }
  ]
};

C["it:F201.3.1"] = {
  notes: [
    { h: "Artificial Intelligence and Machine Learning" },
    { callout: { t: "info", h: "Core Definitions", body: [
      { kv: [
        ["$AI$", "Systems that perform tasks requiring human-like intelligence (e.g., reasoning)."],
        ["$ML$", "A subset of $AI$ where systems 'learn' patterns from data without explicit programming."]
      ] }
    ] } },
    { h: "Key Algorithms" },
    { steps: [
      { h: "Decision Tree", m: "Supervised", n: "A tree-like model of decisions and their possible consequences." },
      { h: "Random Forest", m: "Supervised", n: "An ensemble of many decision trees for better accuracy." },
      { h: "K-Means", m: "Unsupervised", n: "Grouping data into $k$ clusters based on distance/similarity." }
    ] },
    { callout: { t: "info", h: "Big Data Interaction", body: [
      "Big data provides the massive training sets ($Volume$ and $Variety$) required for $ML$ models to become accurate."
    ] } },
    { callout: { t: "memorise", h: "ML Types + Key Algorithms", body: "Supervised ML: labelled training data with known correct outputs (Decision Tree, Random Forest — classification/regression). Unsupervised ML: no labels, algorithm finds patterns (K-Means = clustering). Big data provides the large training sets ML needs — more data → better pattern recognition → lower prediction bias." }},
    { callout: { t: "miscon", h: "ML Doesn't Understand Data Like Humans", body: "ML finds statistical correlations in training data — it does NOT understand context or meaning. If training data is biased or unrepresentative, the model reproduces those biases in its predictions without any awareness of doing so. This is the root cause of algorithmic bias." }}
  ],
  flashcards: [
    ["Is $K-Means$ supervised?", "No, it is unsupervised (Clustering)."],
    ["What is a Random Forest?", "An ensemble of multiple decision trees."],
    ["Why does $ML$ need big data?", "To recognise patterns and reduce prediction errors through large training sets."],
    ["Supervised vs Unsupervised ML?", "Supervised uses labelled training data (known correct answers). Unsupervised finds patterns in unlabelled data."],
    ["What is Reinforcement Learning?", "A type of ML where an agent learns by receiving rewards/penalties for actions in an environment."]
  ],
  quiz: [
    {
      q: "Which algorithm is used for clustering?",
      opts: ["Decision Tree", "Random Forest", "$K-Means$", "Regression"],
      ans: 2,
      why: "$K-Means$ is the standard unsupervised clustering algorithm."
    },
    {
      q: "A spam filter is trained on thousands of emails labelled 'spam' or 'not spam'. Which type of ML is this?",
      opts: ["Unsupervised", "Reinforcement", "Supervised", "Generative"],
      ans: 2,
      why: "Supervised learning uses labelled training data — the algorithm learns from known classifications."
    },
    {
      q: "Why does $ML$ accuracy improve with more training data?",
      opts: ["More data makes algorithms faster", "Larger datasets expose more patterns, reducing bias in the model", "Models store all data in memory", "Big data removes the need for cleaning"],
      ans: 1,
      why: "More data improves pattern recognition and reduces the risk of the model learning from a skewed sample."
    }
  ],
  exam: [
    {
      q: "Describe how $AI$ and Big Data interact in the field of autonomous vehicles.",
      marks: 4,
      ms: [
        "Vehicles capture massive volumes of sensor/image data (Big Data) (1).",
        "This data is used to train $ML$ models to recognise obstacles/signs (1).",
        "The $AI$ makes real-time decisions (braking/steering) based on processed data (1).",
        "Continuous feedback loop improves the algorithm over time (Reinforcement Learning) (1)."
      ]
    }
  ]
};

C["it:F201.4.1"] = {
  notes: [
    { h: "Legal Issues in Big Data" },
    { callout: { t: "info", h: "UK GDPR Principles", body: [
      { steps: [
        { h: "Lawfulness/Fairness", m: "Legal", n: "Processing must be transparent and legal." },
        { h: "Purpose Limitation", m: "Intent", n: "Data only used for the specified reason." },
        { h: "Data Minimisation", m: "Scope", n: "Only collect what is absolutely necessary." },
        { h: "Accuracy", m: "Veracity", n: "Data must be correct and up to date." },
        { h: "Storage Limitation", m: "Time", n: "Don't keep data longer than needed." },
        { h: "Integrity/Security", m: "Safety", n: "Data must be protected against theft." },
        { h: "Accountability", m: "Proof", n: "Organisations must prove they comply." }
      ] }
    ] } },
    { callout: { t: "info", h: "Rights of Data Subjects", body: [
      { kv: [
        ["Right to Access", "Subjects can see what data is held about them."],
        ["Right to Erasure", "Also known as the 'right to be forgotten'."],
        ["Marketing Consent", "Users must 'opt-in' for their data to be used for ads."]
      ] }
    ] } },
    { callout: { t: "tip", h: "ICO", body: [
      "The Information Commissioner's Office ($ICO$) is the UK body that enforces these laws."
    ] } },
    { callout: { t: "memorise", h: "7 GDPR Principles — Mnemonic: LP-DA-SIA", body:
      "**L**awful — processing must be legal and transparent. **P**urpose Limitation — only use data for the stated reason. **D**ata Minimisation — collect only what is necessary. **A**ccuracy — data must be correct and up to date. **S**torage Limitation — delete data when no longer needed. **I**ntegrity/Security — protect data from theft/loss. **A**ccountability — prove you comply. Hook: **LP-DA-SIA** (Lawful Purpose, Data Accurate, Stored Securely, I'm Accountable)."
    } },
    { callout: { t: "miscon", h: "GDPR Is Only About Digital Data", body:
      "UK GDPR applies to **any** personally identifiable information held in a structured way — including paper filing systems and physical records. A filing cabinet of patient names and addresses must comply just as a $SQL$ database must."
    } }
  ],
  flashcards: [
    ["What is the 'right to be forgotten'?", "The Right to Erasure under $GDPR$."],
    ["Define Data Minimisation.", "Only collecting the minimum data needed for a task."],
    ["Who enforces UK $GDPR$?", "The $ICO$ (Information Commissioner's Office)."],
    ["Maximum fine for a serious UK GDPR breach?", "Up to £17.5 million or 4% of global annual turnover — whichever is higher."],
    ["What are the two tiers of UK GDPR fines?", "Tier 1: up to £8.7m or 2% of turnover (less severe). Tier 2: up to £17.5m or 4% of turnover (most severe)."]
  ],
  quiz: [
    {
      q: "Which principle is breached if a delivery app sells your address to a gym without consent?",
      opts: ["Accuracy", "Purpose Limitation", "Storage Limitation", "Security"],
      ans: 1,
      why: "The data is being used for a different purpose than delivery."
    },
    {
      q: "A hospital keeps patient records from 20 years ago that are no longer required. Which GDPR principle is breached?",
      opts: ["Accuracy", "Data Minimisation", "Storage Limitation", "Accountability"],
      ans: 2,
      why: "Storage Limitation requires organisations to delete personal data once it is no longer needed."
    },
    {
      q: "An individual asks a company to show them all data held about them. Which right is this?",
      opts: ["Right to Erasure", "Right to Access", "Right to Portability", "Right to Rectification"],
      ans: 1,
      why: "The Right to Access (Subject Access Request) lets individuals see exactly what data a company holds about them."
    }
  ],
  exam: [
    {
      q: "Discuss the impact of non-compliance with UK $GDPR$ on a big data company.",
      marks: 4,
      ms: [
        "Financial: Fines of up to £17.5m or 4% of global turnover (1).",
        "Reputational: Loss of customer trust and brand value (1).",
        "Legal: Lawsuits from data subjects (1).",
        "Operational: Forced deletion of illegal datasets, losing insights (1)."
      ]
    }
  ]
};

C["it:F201.4.2"] = {
  notes: [
    { h: "Ethical Issues" },
    { callout: { t: "info", h: "Key Ethical Debates", body: [
      { kv: [
        ["Automated Decision Making", "Risks of lack of transparency and human empathy."],
        ["Algorithmic Bias", "Models reflecting prejudices in their training data (e.g., gender bias)."],
        ["Data Ownership", "Debate over whether users or companies own the 'value' of data."],
        ["Data Sharing", "Ethics of selling 'anonymous' data that could be re-identified."],
        ["Protecting Identity", "The difficulty of maintaining privacy in massive datasets."]
      ] }
    ] } },
    { h: "Automated Decision Making and UK GDPR" },
    { callout: { t: "warn", h: "UK GDPR — Automated Decisions", body: [
      "Article 22 of UK GDPR gives individuals the **right not to be subject to solely automated decisions** that produce a significant legal or similarly significant effect. Organisations must provide human oversight or the ability to contest the decision."
    ] } },
    { table: { head: ["Impact on Individuals", "Example"], rows: [
      ["Discrimination risk", "Loan refusal algorithm trained on biased historical data."],
      ["Lack of transparency", "Cannot explain why a job application was auto-rejected."],
      ["Erosion of appeal rights", "Automated benefit denials with no human review process."]
    ] } },
    { h: "Data Ownership and Sharing" },
    { callout: { t: "info", h: "The Ownership Debate", body: [
      { kv: [
        ["Who Creates?", "Individuals — through their online behaviour, purchases, and location data."],
        ["Who Profits?", "Organisations — who mine, package, and sell the analysed data."],
        ["Who Controls?", "Under UK GDPR — individuals have Rights of Access, Erasure, and Portability."]
      ] }
    ] } },
    { h: "Ethical Frameworks" },
    { steps: [
      { h: "Data Ethics Framework", m: "UK Gov", n: "A government guide for using data in a transparent, accountable, and public-focused way — covering transparency, participation, and accountability." },
      { h: "Inclusive Data Principles", m: "Fairness", n: "Ensuring all population groups are represented in datasets — guarding against the underrepresentation that leads to biased models." }
    ] },
    { callout: { t: "memorise", h: "5 Ethical Issues — Quick Reference", body:
      "**Automated Decision Making** — lack of human empathy/transparency (Article 22 gives right to human review). **Algorithmic Bias** — model prejudices inherited from biased training data. **Data Ownership** — users create it, companies profit — GDPR gives rights of Access, Erasure, Portability. **Data Sharing** — 'anonymous' data can be re-identified by combining datasets. **Protecting Identity** — very hard to maintain privacy in massive datasets. Exam tip: always link each issue to a specific impact on an individual."
    } },
    { callout: { t: "miscon", h: "Anonymised Data Is Completely Private", body:
      "Students assume anonymisation makes data safe to share freely. In reality, supposedly anonymous datasets can be **re-identified** by cross-referencing with other publicly available data — e.g. combining anonymous medical records with a public census can reveal individual patients. This is why UK GDPR still applies to the sharing of datasets even after personal identifiers are removed."
    } }
  ],
  flashcards: [
    ["What is algorithmic bias?", "Unfair outcomes caused by prejudiced or unrepresentative training data."],
    ["Ethical risk of data sharing?", "Erosion of privacy and potential for re-identification from 'anonymous' data."],
    ["Why is ownership a big data issue?", "Users create the data but companies profit — UK GDPR gives individuals rights to access and erasure."],
    ["GDPR rule on automated decisions?", "Article 22: individuals have the right not to be subject to solely automated decisions with significant effects."]
  ],
  quiz: [
    {
      q: "Which issue refers to $AI$ inheriting human prejudices?",
      opts: ["Data Ownership", "Algorithmic Bias", "Automated Decisions", "GDPR"],
      ans: 1,
      why: "Bias occurs when the training data is not representative or reflects historical discrimination."
    },
    {
      q: "Under UK GDPR, which right protects individuals from solely automated job rejections?",
      opts: ["Right to Erasure", "Right to Rectification", "Right not to be subject to automated decisions", "Right to Access"],
      ans: 2,
      why: "Article 22 gives individuals the right to human review of significant automated decisions."
    }
  ],
  exam: [
    {
      q: "Discuss the ethical implications of a bank using an automated decision-making system to approve or reject loan applications.",
      marks: 6,
      ms: [
        "Risk of algorithmic bias: if the training data reflects historical lending discrimination, the model perpetuates it (1).",
        "Lack of transparency: applicants may not understand why they were rejected ('black box' problem) (1).",
        "UK GDPR Article 22: individuals have the right to human review of significant automated decisions (1).",
        "Data ownership issue: personal financial data used to train the model — did users consent? (1).",
        "Benefit: faster decisions, consistent application of criteria (1).",
        "Conclusion: must have human oversight and an appeal process to be ethically compliant (1)."
      ]
    }
  ]
};

C["it:F201.5.1"] = {
  notes: [
    { h: "Big Data and the Environment" },
    { callout: { t: "info", h: "Environmental Impacts", body: [
      { kv: [
        ["Weather Forecasting", "Higher accuracy allows better preparation for extreme events."],
        ["Natural Disaster Management", "Predicting floods and quakes saves lives and habitat."],
        ["Energy Efficiency", "Smart grids use data to reduce electricity waste."],
        ["Environmental Management", "Tracking deforestation and ice melt via satellites."],
        ["Climate Change Platforms", "Global datasets used to combat rising temperatures."]
      ] }
    ] } },
    { callout: { t: "info", h: "The Downside", body: [
      "Data centres consume massive amounts of energy for cooling and processing, and server upgrades produce significant e-waste."
    ] } },
    { table: { head: ["Area", "Benefit", "Limitation"], rows: [
      ["Weather Forecasting", "Saves lives; reduces economic loss from extreme events.", "Models can still fail for unprecedented events."],
      ["Natural Disaster Mgmt", "Early-warning systems give populations time to evacuate.", "False alarms erode public trust."],
      ["Energy Efficiency", "Smart grids reduce carbon emissions and energy waste.", "Requires expensive sensor/network infrastructure."],
      ["Environmental Mgmt", "Satellite tracking gives objective, global deforestation data.", "High energy cost of satellite operation."],
      ["Climate Platforms", "Enables international collaboration on climate modelling.", "Data centres themselves produce significant $CO_2$."]
    ] } },
    { callout: { t: "memorise", h: "Two Sides of Big Data and the Environment", body:
      "**Benefits**: Weather forecasting (saves lives via early warnings). Natural disaster prediction (evacuation lead time). Energy efficiency via smart grids (reduces waste). Environmental monitoring via satellites (deforestation/ice melt). Climate change modelling (international collaboration). **Costs**: Data centres consume enormous electricity (majority still fossil-fuel powered). Server hardware upgrades produce e-waste. Satellite operation has ongoing energy and material costs."
    } },
    { callout: { t: "miscon", h: "Data Centres Run on Renewables So Big Data Is Green", body:
      "While some tech companies ($Google$, $Microsoft$) have invested in renewable energy, the global majority of data centres still draw significant power from fossil fuel sources. Even renewable-powered centres use vast amounts of water for cooling and produce hardware e-waste at end of life."
    } }
  ],
  flashcards: [
    ["How does big data help Energy Efficiency?", "Through Smart Grids that balance supply and demand in real-time."],
    ["Environmental cost of big data?", "High electricity use for data centres and cooling; server upgrades produce e-waste."],
    ["How can satellites help the environment?", "Monitoring deforestation, ocean health, and ice melt via real-time imagery."],
    ["Limitation of big data for climate?", "Data centres themselves consume large amounts of energy and produce carbon emissions."],
    ["Environmental paradox of big data?", "Big data helps combat climate change via modelling, yet data centres are themselves significant energy consumers and $CO_2$ producers."]
  ],
  quiz: [
    {
      q: "Which technology uses big data to balance electricity supply and demand?",
      opts: ["Data Lake", "Smart Grid", "Blockchain", "NoSQL"],
      ans: 1,
      why: "Smart grids use real-time sensor data to optimise electricity distribution."
    },
    {
      q: "A country builds five new data centres to store climate modelling data. What environmental trade-off arises?",
      opts: ["Better weather forecasting", "Increased $CO_2$ emissions from power consumption", "Faster disaster warnings", "Cheaper satellite imagery"],
      ans: 1,
      why: "Data centres consume large amounts of electricity, often from non-renewable sources, producing significant carbon emissions."
    }
  ],
  exam: [
    {
      q: "Evaluate the use of big data in managing natural disasters. Include both benefits and limitations.",
      marks: 6,
      ms: [
        "Benefit: Predictive models using weather and seismic data can give early warnings (1).",
        "Benefit: Authorities can pre-position resources and evacuate populations ahead of time (1).",
        "Benefit: Post-disaster, satellite imagery helps target rescue efforts efficiently (1).",
        "Limitation: False alarms cause unnecessary evacuations — economic and social cost (1).",
        "Limitation: Requires reliable infrastructure to collect and transmit data — may fail in the disaster itself (1).",
        "Conclusion: The benefits of saving lives outweigh the limitations, but false alarm protocols must be managed (1)."
      ]
    }
  ]
};

C["it:F201.5.2"] = {
  notes: [
    { h: "Big Data and Society" },
    { callout: { t: "info", h: "Social Developments", body: [
      { kv: [
        ["Smart Cities", "Using $IoT$ to manage traffic, waste, and lighting."],
        ["Personalised Healthcare", "Custom treatments based on genetic and lifestyle data."],
        ["Smart Homes", "Energy-saving appliances and security systems."],
        ["Traffic Management", "Reducing congestion via real-time $GPS$ routing."],
        ["Urban Planning", "Using footfall data to design better parks and services."]
      ] }
    ] } },
    { table: { head: ["Benefit", "Impact on Individuals"], rows: [
      ["Personalised Health", "Improved life expectancy."],
      ["Smart Homes", "Lower utility bills."],
      ["Traffic Analysis", "Reduced commute times."]
    ] } },
    { callout: { t: "memorise", h: "5 Social Applications — Quick Reference", body:
      "**Smart Cities** — $IoT$ manages traffic, waste, and lighting at city scale. **Personalised Healthcare** — genetic and lifestyle data creates custom treatment plans. **Smart Homes** — energy-saving appliances and connected security. **Traffic Management** — real-time $GPS$ routing reduces congestion. **Urban Planning** — footfall and movement data improves parks and public services. Exam anchor: 'Smart' in every example = sensors + data + automated response."
    } },
    { callout: { t: "miscon", h: "Smart Cities Are Purely Beneficial", body:
      "Exam answers listing only benefits will be capped. Smart cities also raise serious concerns: **mass surveillance** ($CCTV$ and $IoT$ sensors track all movement), **privacy erosion** (citizens often cannot opt out of data collection), **cyber-attack vulnerability** (interconnected systems create single points of failure), and **digital exclusion** (elderly or low-income residents may not benefit equally). Always balance positives with negatives."
    } }
  ],
  flashcards: [
    ["Define a Smart City.", "An urban area that uses big data/$IoT$ to improve services and efficiency."],
    ["How does big data help Urban Planning?", "By showing where people actually move and use services."],
    ["Impact of smart homes?", "Greater convenience and lower energy consumption."],
    ["Give one negative social impact of Smart Cities.", "Mass surveillance — citizens' movement is constantly tracked by $IoT$ sensors and $CCTV$ networks."],
    ["How does personalised healthcare use big data?", "Genetic and lifestyle data is analysed to create tailored treatment plans for individual patients."]
  ],
  quiz: [
    {
      q: "Which society application involves managing city infrastructure?",
      opts: ["Personalised Health", "Smart Cities", "Blockchain", "GDPR"],
      ans: 1,
      why: "Smart cities focus on urban efficiency."
    },
    {
      q: "A hospital uses genetic sequencing data combined with lifestyle data to prescribe individualised drugs. Which application is this?",
      opts: ["Smart Cities", "Urban Planning", "Personalised Healthcare", "Smart Homes"],
      ans: 2,
      why: "Personalised Healthcare uses individual genetic and lifestyle data to create custom treatment plans."
    },
    {
      q: "Which is a significant negative impact of Smart Cities on individuals?",
      opts: ["Reduced commute times", "Mass surveillance of residents", "Lower utility bills", "Improved waste management"],
      ans: 1,
      why: "Smart city $IoT$ sensors and cameras continuously track citizens' movements, raising serious privacy concerns."
    }
  ],
  exam: [
    {
      q: "Discuss the positive and negative impacts of 'Smart Cities' on society.",
      marks: 6,
      ms: [
        "Positive: Improved traffic flow reduces pollution and stress (1).",
        "Positive: Automated waste management improves hygiene (1).",
        "Positive: Better public safety through data-driven $CCTV$ (1).",
        "Negative: Mass surveillance concerns and loss of privacy (1).",
        "Negative: Vulnerability to cyber-attacks/system failure (1).",
        "Conclusion: Benefits are significant but require strong ethical oversight (1)."
      ]
    }
  ]
};

})(window.KOS_CONTENT);
