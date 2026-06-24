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
