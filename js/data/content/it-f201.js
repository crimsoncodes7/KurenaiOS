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
    ] }
  ],
  flashcards: [
    ["What are the $6Vs$?", "$Volume$, $Velocity$, $Variety$, $Veracity$, $Value$, $Variability$."],
    ["Define Veracity.", "The accuracy and quality of the data being collected."],
    ["What is the final step in big data analysis?", "Data Consumption."],
    ["How does Variability differ from Variety?", "$Variety$ is about format types; $Variability$ is about inconsistencies in data flow/meaning."]
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
        ["Database Management Systems ($DBMS$)", "Transition from flat files to $RDBMS$ and then to $NoSQL$ for horizontal scaling."],
        ["Internet of Everything ($IoE$)", "The connection of people, processes, data, and things."],
        ["Device Proliferation", "The explosion of smartphones and $IoT$ sensors."],
        ["Search Engines", "Required massive indexing and fast retrieval of unstructured web data."],
        ["Web-based Storage", "Cloud computing provided the affordable scale needed for big data."]
      ] }
    ] } },
    { table: { head: ["Development", "Impact"], rows: [
      ["$IoE$", "Creates trillions of new data points daily."],
      ["Cloud Storage", "Removes the hardware cost barrier for $SMEs$."]
    ] } }
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
    { table: { head: ["Capture Method", "Common Data Type"], rows: [
      ["Sensors", "Structured (Numeric)"],
      ["Social Media", "Unstructured (Text/Image)"],
      ["Surveys", "Semi-structured ($JSON$/$XML$)"]
    ] } }
  ],
  flashcards: [
    ["Name a source of unstructured data.", "Social media or digital video."],
    ["What data type does $GPS$ generate?", "Structured (Coordinates and Timestamps)."],
    ["How are transactional records usually stored?", "In structured databases."]
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
        ["Banking", "Fraud detection and risk assessment."],
        ["Education", "Personalised learning paths and tracking student progress."],
        ["Energy and utilities", "Smart grid management and predictive maintenance."],
        ["Government", "Public health monitoring and urban planning."],
        ["Healthcare", "Disease outbreak prediction and drug discovery."],
        ["Insurance", "Customised premiums based on telematics data."],
        ["Manufacturing", "Supply chain optimisation and robotics control."],
        ["Retail", "Targeted marketing and inventory forecasting."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Strategic Goal", body: [
      { n: "The primary purpose is to move from reactive to **proactive** decision-making based on statistical evidence." }
    ] } }
  ],
  flashcards: [
    ["Big data use in Banking?", "Fraud detection and credit risk modelling."],
    ["Big data use in Retail?", "Targeted marketing and stock management."],
    ["Big data use in Healthcare?", "Predicting epidemics and personalised medicine."]
  ],
  quiz: [
    {
      q: "Predictive maintenance is a key application for which sector?",
      opts: ["Banking", "Manufacturing", "Insurance", "Retail"],
      ans: 1,
      why: "Manufacturing uses data to predict when machines will fail."
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
    ] } }
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
      { n: "The process of mapping 'raw' data into a usable format for mining." }
    ] } },
    { h: "Cleaning Techniques" },
    { steps: [
      { h: "Removing Duplicates", m: "De-duplication", n: "Ensuring every record is unique to avoid skewing results." },
      { h: "Fixing Missing Data", m: "Imputation", n: "Filling gaps using averages or removing incomplete rows." },
      { h: "Removing Irrelevant Data", m: "Filtering", n: "Deleting noise that does not help the analysis." },
      { h: "Converting Data Types", m: "Casting", n: "Ensuring numbers are treated as integers, not text." },
      { h: "Fixing Structural Errors", m: "Mapping", n: "Splitting 'Full Name' into 'First' and 'Last' for better sorting." },
      { h: "Validating Data", m: "Checking", n: "Ensuring values fall within logical ranges (e.g., Age < $120$)." }
    ] }
  ],
  flashcards: [
    ["What is data wrangling?", "Transforming raw data into a clean, analytical format."],
    ["How can missing data be fixed?", "Via deletion or imputation (filling with mean/mode)."],
    ["Why is language translation a cleaning step?", "To standardise unstructured text from global sources."]
  ],
  quiz: [
    {
      q: "Which technique fixes '30/12/24' and 'Dec 30 2024' being in the same column?",
      opts: ["Removing duplicates", "Standardising formats", "Data mining", "Encryption"],
      ans: 1,
      why: "Standardisation brings all data into one format."
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
    ] } }
  ],
  flashcards: [
    ["Define Predictive Mining.", "Using historical data to forecast future outcomes."],
    ["What is Descriptive Mining?", "Summarising historical data to understand past performance."],
    ["Difference between Diagnostic and Descriptive?", "$Descriptive$ says 'what'; $Diagnostic$ says 'why'."]
  ],
  quiz: [
    {
      q: "Which mining type recommends a specific action?",
      opts: ["Descriptive", "Diagnostic", "Predictive", "Prescriptive"],
      ans: 3,
      why: "$Prescriptive$ analytics provides 'the best next step'."
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
    { callout: { t: "info", h: "Configurations", body: [
      { kv: [
        ["Dedicated Servers", "Single high-performance machines for specific tasks."],
        ["Distributed Cluster", "Groups of servers (e.g., $Hadoop$) processing data in parallel."],
        ["Public Cloud", "Shared infrastructure ($AWS$, $Azure$) for scalability."],
        ["Private Cloud", "Dedicated infrastructure for security/compliance."],
        ["Data Lake", "Large-scale storage for raw, unstructured data."],
        ["Data Warehouse", "Storage for structured, processed data used for reporting."]
      ] }
    ] } },
    { h: "Software and Platforms" },
    { callout: { t: "info", h: "Platforms", body: [
      { kv: [
        ["Open-source", "Free to modify, large community support (e.g., $Spark$, $Hadoop$)."],
        ["Vendor-specific", "Managed support but risk of lock-in (e.g., $Oracle$, $SAP$)."],
        ["$NoSQL$ Database", "Non-relational storage built for variety and volume."]
      ] }
    ] } },
    { h: "Emerging Technologies" },
    { steps: [
      { h: "Block chain", m: "Security", n: "Distributed ledgers for immutable transaction tracking." },
      { h: "DNA Storage", m: "Longevity", n: "Storing data in biological molecules for extreme density." },
      { h: "Quantum Server", m: "Speed", n: "Using quantum bits to solve complex big data simulations." }
    ] }
  ],
  flashcards: [
    ["Data Lake vs Warehouse?", "$Lake$ = Raw; $Warehouse$ = Structured."],
    ["Benefit of a Distributed Cluster?", "Parallel processing allows handling massive volumes ($Hadoop$)."],
    ["What is $NoSQL$?", "Non-relational database for unstructured/semi-structured data."]
  ],
  quiz: [
    {
      q: "Which storage is best for raw sensor data in any format?",
      opts: ["Data Warehouse", "Data Lake", "$SQL$ Server", "$SSD$"],
      ans: 1,
      why: "Data lakes store data in its original raw state."
    }
  ],
  exam: [
    {
      q: "Discuss the factors a company should consider when choosing between 'Open-source' and 'Vendor-specific' software platforms.",
      marks: 6,
      ms: [
        "Open-source factor: Lower initial licensing costs (1).",
        "Open-source factor: Flexibility to customise code (1).",
        "Open-source limitation: Requires internal experts for maintenance (1).",
        "Vendor factor: Professional support and service-level agreements ($SLAs$) (1).",
        "Vendor limitation: Higher recurring costs and vendor lock-in (1).",
        "Conclusion: Choice depends on budget and internal technical capability (1)."
      ]
    }
  ]
};

C["it:F201.2.5"] = {
  notes: [
    { h: "Data Science and Data Analytics" },
    { callout: { t: "info", h: "Key Differences", body: [
      { kv: [
        ["Data Science", "Focused on the future; creates models, prototypes, and algorithms; uses $ML$."],
        ["Data Analytics", "Focused on the past/present; answers specific business questions; uses $SQL$/BI tools."]
      ] }
    ] } },
    { table: { head: ["Task", "More likely..."], rows: [
      ["Building an image recognition algorithm", "Data Science"],
      ["Creating a monthly sales report", "Data Analytics"],
      ["Developing a predictive model for churn", "Data Science"]
    ] } }
  ],
  flashcards: [
    ["Goal of Data Science?", "Discovering new questions and building predictive models."],
    ["Goal of Data Analytics?", "Finding answers to existing business questions and trends."]
  ],
  quiz: [
    {
      q: "Which field is more future-focused?",
      opts: ["Data Analytics", "Data Science", "Data Cleaning", "Data Storage"],
      ans: 1,
      why: "Science builds the models that predict the future."
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
    ] } }
  ],
  flashcards: [
    ["Define Regression.", "Statistical method for finding relationships between variables."],
    ["What does Monte Carlo use?", "Random sampling and probability modelling."],
    ["Define Time Series Analysis.", "Analysing data over time to spot trends or seasonality."]
  ],
  quiz: [
    {
      q: "Which technique is best for finding seasonal trends?",
      opts: ["Factor Analysis", "Cluster Analysis", "Time Series Analysis", "Regression"],
      ans: 2,
      why: "Time series specifically looks at intervals over time."
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
      { n: "Big data provides the massive training sets ($Volume$ and $Variety$) required for $ML$ models to become accurate." }
    ] } }
  ],
  flashcards: [
    ["Is $K-Means$ supervised?", "No, it is unsupervised (Clustering)."],
    ["What is a Random Forest?", "An ensemble of multiple decision trees."],
    ["Why does $ML$ need big data?", "To recognise patterns and reduce prediction errors through large training sets."]
  ],
  quiz: [
    {
      q: "Which algorithm is used for clustering?",
      opts: ["Decision Tree", "Random Forest", "$K-Means$", "Regression"],
      ans: 2,
      why: "$K-Means$ is the standard unsupervised clustering algorithm."
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
      { n: "The Information Commissioner's Office ($ICO$) is the UK body that enforces these laws." }
    ] } }
  ],
  flashcards: [
    ["What is the 'right to be forgotten'?", "The Right to Erasure under $GDPR$."],
    ["Define Data Minimisation.", "Only collecting the minimum data needed for a task."],
    ["Who enforces UK $GDPR$?", "The $ICO$ (Information Commissioner's Office)."]
  ],
  quiz: [
    {
      q: "Which principle is breached if a delivery app sells your address to a gym without consent?",
      opts: ["Accuracy", "Purpose Limitation", "Storage Limitation", "Security"],
      ans: 1,
      why: "The data is being used for a different purpose than delivery."
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
    { h: "Ethical Frameworks" },
    { steps: [
      { h: "Data Ethics Framework", m: "UK Gov", n: "Guides for using data in a way that is clear and public-focused." },
      { h: "Inclusive Data Principles", m: "Fairness", n: "Ensuring all population groups are fairly represented in data." }
    ] }
  ],
  flashcards: [
    ["What is algorithmic bias?", "Unfair outcomes caused by prejudiced training data."],
    ["Ethical risk of data sharing?", "Erosion of privacy and potential for re-identification."],
    ["Why is ownership a big data issue?", "Users create the data, but companies profit from the analysis."]
  ],
  quiz: [
    {
      q: "Which issue refers to $AI$ inheriting human prejudices?",
      opts: ["Data Ownership", "Algorithmic Bias", "Automated Decisions", "GDPR"],
      ans: 1,
      why: "Bias occurs when the training data is not representative or fair."
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
      { n: "Data centres consume massive amounts of energy for cooling and processing, and server upgrades produce significant e-waste." }
    ] } }
  ],
  flashcards: [
    ["How does big data help Energy Efficiency?", "Through Smart Grids that optimise distribution."],
    ["Environmental cost of big data?", "High electricity use by data centres and cooling systems."],
    ["How can satellites help the environment?", "Monitoring deforestation and ocean health in real-time."]
  ],
  quiz: [
    {
      q: "Which technology uses big data to balance electricity supply and demand?",
      opts: ["Data Lake", "Smart Grid", "Blockchain", "NoSQL"],
      ans: 1,
      why: "Smart grids are the primary data-driven tool for energy efficiency."
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
    ] } }
  ],
  flashcards: [
    ["Define a Smart City.", "An urban area that uses big data/$IoT$ to improve services and efficiency."],
    ["How does big data help Urban Planning?", "By showing where people actually move and use services."],
    ["Impact of smart homes?", "Greater convenience and lower energy consumption."]
  ],
  quiz: [
    {
      q: "Which society application involves managing city infrastructure?",
      opts: ["Personalised Health", "Smart Cities", "Blockchain", "GDPR"],
      ans: 1,
      why: "Smart cities focus on urban efficiency."
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

/* ── ORPHAN CONTENT (disabled) ───────────────────────────────────────────
   F201.5.3 "NEA Units" is a non-leaf header in the generated spec (it.js)
   with no child leaves, so this entry was unreachable in the UI and failed
   smoke2's "every content key maps to a spec leaf" assertion. Preserved here
   verbatim — GEMINI: re-key these Big-Data case studies onto a real content
   leaf (e.g. an F201 big-data sub-topic) to bring them back into the app.
C["it:F201.5.3"] = {
  notes: [
    { h: "Case Studies: Big Data in Action" },
    { callout: { t: "info", h: "Sector Case Studies", body: [
      { kv: [
        ["Retail ($Amazon$)", "Uses predictive analytics to recommend products and even 'anticipatory shipping' to stock local hubs before a customer even orders."],
        ["Transport ($Uber$/$Lyft$)", "Uses real-time $GPS$ and historic traffic data to calculate dynamic pricing (surge) and optimal driver routing."],
        ["Entertainment ($Netflix$)", "Anonymised viewing data is clustered to decide which original series to produce next, reducing the risk of failure."],
        ["Healthcare ($AlphaFold$)", "$DeepMind$ used big data of protein structures to predict 3D shapes of proteins, accelerating drug discovery by years."]
      ] }
    ] } },
    { callout: { t: "tip", h: "Exam Tip", body: [
      { n: "When discussing case studies, always link the **Technology** ($ML$/$Big Data$) to a **Real-world Outcome** (Efficiency/Profit/Safety)." }
    ] } }
  ],
  flashcards: [
    ["What is 'Anticipatory Shipping'?", "Shipping goods to local hubs before an order is placed, based on predictive analytics."],
    ["How does dynamic pricing work?", "Using real-time supply and demand data to adjust costs instantly (e.g., ride-sharing)."],
    ["Example of big data in entertainment?", "$Netflix$ using clusters to decide which shows to produce."]
  ],
  quiz: [
    {
      q: "Which company uses data to ship products before they are even ordered?",
      opts: ["$Uber$", "$Amazon$", "$Netflix$", "$DeepMind$"],
      ans: 1,
      why: "$Amazon$'s anticipatory shipping is a famous predictive analytics case study."
    }
  ]
};
*/

})(window.KOS_CONTENT);
