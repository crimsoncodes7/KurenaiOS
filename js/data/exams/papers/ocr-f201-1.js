/* Kurenai OS — js/data/exams/papers/ocr-f201-1.js
   OCR Cambridge Advanced National in IT (H119), Unit F201: Practice paper 1.

   WRITTEN BY KURENAIOS — NOT AN OCR PAPER. Original questions to the
   blueprint of OCR's Sample Assessment Material (v3.0, November 2024):
   1 h 30, 60 marks, ONE organisation as the context for every question,
   8 questions of lettered parts (marks per question 9 · 9 · 5 · 5 · 2 ·
   18 · 8 · 4), a data table to clean, a sentence or table to complete, a
   pair of (i)/(ii) parts where (ii) builds on (i), one 6-mark Analyse and
   one 9-mark Discuss marked by level. The specification (F201.1.1–5.2) is
   the source of every fact; the schemes are written in OCR's form ("one
   mark for identifying… one mark for…") but are our own words.

   Shape (read by KOS.examPaper's authored papers):
     {id, n, title, board, format: "ocr-case", mins, marks, org, context,
      questions: [{n, title, stem, table?, parts: [{label, q, marks, ref,
        command, ms: [lines], guide?, levels?, indicative?, dependsOn?,
        list?, fill?}]}]}
   A scheme line ending "(n)" is worth n; "Max N" caps a list of points.  */
(function () {
  "use strict";
  var X = window.KOS_EXAMS = window.KOS_EXAMS || {};
  var P = X.papers = X.papers || {};
  var L6 = [
    "Level 3 (5–6 marks): a thorough analysis. Detailed knowledge, with well-developed points that are applied to the organisation throughout; the reasoning is clear and logically structured.",
    "Level 2 (3–4 marks): an adequate analysis. Sound knowledge with some development; points are partly applied to the organisation; the reasoning is mostly clear.",
    "Level 1 (1–2 marks): a basic analysis. Limited knowledge; points are listed rather than developed and are mostly generic.",
    "0 marks: nothing worthy of credit."
  ];
  var L9 = [
    "Level 3 (7–9 marks): a thorough discussion. Detailed knowledge; benefits AND limitations are developed and applied to the organisation; a recommendation is made and supported by the points discussed.",
    "Level 2 (4–6 marks): an adequate discussion. Sound knowledge; benefits and/or limitations with some development and some application; a recommendation may be given with limited support.",
    "Level 1 (1–3 marks): a basic discussion. Limited knowledge; points are mostly generic and undeveloped; no recommendation, or one with no support.",
    "0 marks: nothing worthy of credit."
  ];
  (P["ocr-f201"] = P["ocr-f201"] || [])[0] = {
    id: "ocr-f201-1", n: 1, title: "Practice paper 1", board: "OCR", format: "ocr-case", mins: 90, marks: 60,
    org: "Coastline Energy",
    context: "Coastline Energy is a UK company that supplies gas and electricity to 2.4 million homes. Every home it supplies has a smart meter that sends a reading to Coastline every 30 minutes. Customers use the Coastline app to see their bills and their energy use, and to contact customer service. Coastline also owns three wind farms.",
    questions: [
      { n: 1, title: "Smart meter data",
        stem: "Each smart meter reading is sent to Coastline as soon as it is taken. Coastline also collects data from the app, from customer service calls and from weather services.",
        parts: [
          { label: "(a)", command: "State", ref: "F201.1.1", marks: 1,
            q: "State the characteristic of big data that relates to the speed at which the smart meter readings arrive at Coastline.",
            ms: ["Velocity (1)"],
            guide: "Accept \"velocity of streamed data\". Do not accept volume." },
          { label: "(b)", command: "State", ref: "F201.1.1", marks: 2,
            q: "State two ways the variety of Coastline's data could characterise it as big data.",
            ms: ["Max 2 from:",
              "The data comes from many different sources, e.g. meters, the app, calls, weather services (1)",
              "The data is of different types: structured, semi-structured and unstructured (1)",
              "The data is in different formats, e.g. numbers, text, audio, images (1)",
              "Different kinds of data have to be combined before they can be analysed (1)"] },
          { label: "(c)", command: "Identify", ref: "F201.2.2", marks: 3,
            q: "Here are some of the smart meter records.\n\nData cleaning and data wrangling will be carried out on these records before they are analysed. Identify three data cleaning techniques that need to be carried out on the records above.",
            table: { head: ["Meter ID", "Customer number", "Reading date", "Reading (kWh)", "Region"],
              rows: [
                ["SM-40177", "C1029384", "14/11/2026", "12.4", "Scotland"],
                ["SM-51902", "C2238471", "2026-11-14", "9.8kWh", "North West"],
                ["SM-40177", "C1029384", "14/11/2026", "12.4", "Scotland"],
                ["SM-66310", "C3374025", "14/11/2026", "", "SCOT"],
                ["SM-70245", "C4410938", "14/11/2026", "-3.2", "Wales"]
              ] },
            ms: ["Max 3 from (each must match an error in the records):",
              "Removing duplicates: SM-40177 appears twice (1)",
              "Fix missing data: SM-66310 has no reading (1)",
              "Converting data type: \"9.8kWh\" is text, not a number (1)",
              "Fix structural errors: two date formats / \"SCOT\" and \"Scotland\" for one region (1)",
              "Validate data: a reading of -3.2 kWh is impossible (1)",
              "Clear formatting: the unit typed into the reading (1)"],
            guide: "Accept a technique only once. The error does not need to be named for the mark, but the technique must fit an error in the table." },
          { label: "(d)", command: "Complete", ref: "F201.1.1", marks: 3,
            q: "Complete the table to show the six steps for analysing big data, in order.",
            fill: { head: ["Step", "Name"], rows: [["1", "Data collection"], ["2", ""], ["3", "Data cleaning"], ["4", ""], ["5", "Data analysis"], ["6", ""]] },
            ms: ["Step 2: Data storing (1)", "Step 4: Data mining (1)", "Step 6: Data consumption (1)"] }
        ] },
      { n: 2, title: "Personal data",
        stem: "To open an account, a customer gives Coastline their name, address, date of birth and bank details. Coastline must comply with UK General Data Protection Regulations (UK GDPR).",
        parts: [
          { label: "(a)", command: "Identify", ref: "F201.4.1", marks: 2,
            q: "Identify two rights that Coastline's customers have under UK GDPR.",
            ms: ["Max 2 from:", "The right to be informed (1)", "The right of access (1)", "The right to rectification (1)",
              "The right to erasure (1)", "The right to restrict processing (1)", "The right to data portability (1)",
              "The right to object (1)", "Rights in relation to automated decision making and profiling (1)"] },
          { label: "(b)", command: "State", ref: "F201.4.1", marks: 1,
            q: "Coastline wants to email customers about a new electric-car tariff. State what Coastline must have from each customer before it sends them marketing emails.",
            ms: ["Their consent to marketing / they must have opted in (1)"],
            guide: "Do not accept \"permission to use their data\" alone; it must be consent to be sent marketing." },
          { label: "(c)", command: "Analyse", ref: "F201.4.2", marks: 6,
            q: "Coastline collects every customer's energy use every 30 minutes and is considering sharing this data with other organisations.\n\nAnalyse the ethical issues for Coastline of collecting and sharing customers' half-hourly energy data.",
            ms: ["Levels of response: mark with the level descriptors (6)"],
            levels: L6,
            indicative: [
              "Half-hourly readings show when a home is empty or occupied, so they reveal people's routines: collection is intrusive.",
              "Customers may not understand how much the readings reveal, so their consent may not be informed.",
              "Ownership: customers may feel the data about their home is theirs; Coastline must be clear about who owns it.",
              "Sharing with third parties (insurers, advertisers) could be used against customers, e.g. higher premiums; trust is lost.",
              "Storing a large volume of sensitive data increases the impact of a breach; Coastline must secure it.",
              "Anonymising or aggregating the data before sharing reduces the risk but may not remove it (re-identification).",
              "Using the data for public good (e.g. grid planning) can be ethical if it is transparent and proportionate."] }
        ] },
      { n: 3, title: "Types of data",
        stem: "Customers can type comments in the app when their supply has a fault. Coastline's billing system exports bills as XML files.",
        parts: [
          { label: "(a)", command: "State", ref: "F201.2.1", marks: 1,
            q: "State the type of big data that the customers' typed comments are.",
            ms: ["Unstructured (data) (1)"] },
          { label: "(b)", command: "Explain", ref: "F201.2.1", marks: 2,
            q: "Explain why the XML files are classed as semi-structured data.",
            ms: ["The data has tags / markers that label and organise its elements (1)",
              "but it does not fit a fixed schema / rigid rows and columns like a relational table (1)"] },
          { label: "(c)", command: "State", ref: "F201.1.3", marks: 2,
            q: "State two data capture methods, other than sensors, that Coastline could use to collect data about how its customers use energy.",
            ms: ["Max 2 from:", "Online surveys (1)", "Transactional records, e.g. payments and top-ups (1)",
              "IoE connected devices, e.g. smart thermostats or appliances (1)", "Natural language, e.g. calls or chat with customer service (1)",
              "Social media sites (1)"],
            guide: "Do not accept sensors or smart meters (excluded by the question)." }
        ] },
      { n: 4, title: "Storing and processing",
        stem: "Coastline stores every reading in a data lake. The readings are processed by a distributed cluster of servers.",
        parts: [
          { label: "(a)", command: "State", ref: "F201.2.4", marks: 2,
            q: "State two characteristics of a data lake.",
            ms: ["Max 2 from:", "Stores data in its raw / native format (1)",
              "Holds structured, semi-structured and unstructured data together (1)",
              "No schema is needed before the data is stored; it is applied when the data is read (1)",
              "Can grow to hold very large volumes of data (1)", "Low cost storage for each unit of data (1)"] },
          { label: "(b)", command: "Explain", ref: "F201.2.4", marks: 2,
            q: "Explain one benefit to Coastline of using a distributed cluster of servers to process the readings.",
            ms: ["One mark for identifying a benefit, one mark for applying it to Coastline, e.g.:",
              "The work is shared across many servers (1) so 2.4 million readings every 30 minutes can be processed before the next set arrives (1)",
              "More servers can be added (1) as Coastline gains customers / readings (1)",
              "If one server fails the others carry on (1) so readings are not lost and bills are still produced (1)"] },
          { label: "(c)", command: "State", ref: "F201.2.4", marks: 1,
            q: "State one emerging data storage technology.",
            ms: ["Max 1 from:", "DNA (data) storage (1)", "Blockchain (1)", "Quantum (server / storage) (1)"] }
        ] },
      { n: 5, title: "Predicting missed payments",
        stem: "Coastline uses a machine learning algorithm, a decision tree, to predict which customers are likely to miss a payment.",
        parts: [
          { label: "", command: "Explain", ref: "F201.3.1", marks: 2,
            q: "Explain how a decision tree reaches its prediction for a customer.",
            ms: ["The customer's data is tested against a question / condition at each node, e.g. \"missed a payment in the last year?\" (1)",
              "the branch matching the answer is followed until a leaf is reached, which gives the prediction / class (1)"] }
        ] },
      { n: 6, title: "Forecasting demand",
        stem: "Coastline must buy enough electricity for its customers before each day starts. It uses data mining and data analytics to plan how much to buy.",
        parts: [
          { label: "(a)", command: "State", ref: "F201.2.3", marks: 1,
            q: "State what descriptive data mining does.",
            ms: ["It summarises / describes what has happened in past data, e.g. average use per day (1)"] },
          { label: "(b)", command: "Explain", ref: "F201.2.3", marks: 2,
            q: "Explain how predictive data mining could help Coastline decide how much electricity to buy.",
            ms: ["It uses patterns in past data to forecast future demand (1)",
              "so Coastline can buy close to the amount that will be used, avoiding shortages or paying for electricity it does not need (1)"] },
          { label: "(c)", command: "Discuss", ref: "F201.2.6", marks: 9,
            q: "Coastline is thinking about using time series analysis of its half-hourly readings to forecast demand for electricity over the winter.\n\nDiscuss whether Coastline should use time series analysis to forecast winter demand.\n\nIn your answer you must write about:\n• any benefits to Coastline\n• any limitations to Coastline\n• whether you would recommend that Coastline uses time series analysis, and your reasons.",
            ms: ["Levels of response: mark with the level descriptors (9)"],
            levels: L9,
            indicative: [
              "Benefit: half-hourly readings over several years show daily, weekly and seasonal patterns, so winter peaks can be forecast.",
              "Benefit: trends (more electric cars and heat pumps) can be seen and allowed for.",
              "Benefit: the forecasts can be updated as new readings stream in, so buying is adjusted day by day.",
              "Benefit: a better forecast means buying less expensive short-notice electricity.",
              "Limitation: it assumes the future follows the past; an unusually cold winter or an energy crisis breaks the pattern.",
              "Limitation: it does not explain why demand changes (it is not a cause), so other factors such as weather forecasts must be added.",
              "Limitation: it needs clean, complete history; missing or wrong readings distort the forecast.",
              "Limitation: needs specialist staff and software, which costs money.",
              "Recommendation: e.g. use it, combined with weather data / regression, and review forecasts against actual use."] },
          { label: "(d)", command: "State", ref: "F201.2.6", marks: 2,
            q: "State two data analytic techniques, other than time series analysis.",
            ms: ["Max 2 from:", "Regression analysis (1)", "Monte Carlo simulation (1)", "Cohort analysis (1)", "Cluster analysis (1)"] },
          { label: "(e)", command: "Explain", ref: "F201.2.4", marks: 4,
            q: "Coastline will use data visualisation software to show customers their energy use in the app.\n\nExplain one benefit and one limitation to Coastline of using data visualisation software for this.",
            ms: ["Up to two marks for a benefit: one for identifying it, one for applying it, e.g.:",
              "Charts make patterns easy to see (1) so customers can spot when they use the most energy and cut their bills (1)",
              "The charts can update in real time (1) so customers see the effect of changes straight away (1)",
              "Up to two marks for a limitation, e.g.:",
              "A badly chosen chart can mislead (1) so customers may misread their use and complain about bills (1)",
              "The charts are only as good as the data (1) so a faulty meter's readings give a wrong picture (1)"],
            guide: "Two marks for a benefit and two for a limitation; answers must relate to Coastline or its customers for the second mark." }
        ] },
      { n: 7, title: "Fair tariffs",
        stem: "Coastline uses automated decision making to choose which customers are offered its cheapest tariff.",
        parts: [
          { label: "(a)", command: "Explain", ref: "F201.4.2", marks: 2,
            q: "Explain one way automated decision making could be unfair to some of Coastline's customers.",
            ms: ["One mark for the cause, one for its effect on customers, e.g.:",
              "The algorithm is trained on historical data that contains bias (1) so groups that were offered fewer deals before keep being left out (1)",
              "Customers without a smart meter / with little data are not assessed well (1) so they are less likely to be offered the tariff (1)",
              "No person checks the decision (1) so an error is not noticed or put right (1)"] },
          { label: "(b)(i)", command: "State", ref: "F201.4.2", marks: 2,
            q: "Coastline will follow the government's Data Ethics Framework. State two principles of the Data Ethics Framework.",
            ms: ["Max 2 from:", "Transparency (1)", "Accountability (1)", "Fairness (1)"] },
          { label: "(b)(ii)", command: "Explain", ref: "F201.4.2", marks: 4, dependsOn: "(b)(i)",
            q: "Explain why each principle you stated in 7(b)(i) would need to be considered by Coastline.",
            ms: ["Up to two marks for each principle: one for the reason, one for applying it to Coastline, e.g.:",
              "Transparency: customers should be able to find out how the tariff decision was made (1) so they can trust it and challenge it (1)",
              "Accountability: someone at Coastline must be responsible for the algorithm's decisions (1) so problems are investigated and fixed (1)",
              "Fairness: the decision must not discriminate against groups of customers (1) so Coastline checks the outcomes for bias (1)"],
            guide: "Each explanation must refer to a principle given in (i). Where (i) scores 0, (ii) scores 0." }
        ] },
      { n: 8, title: "Wind farm forecasts",
        stem: "Coastline uses big data from weather satellites and sensors to forecast how much electricity its wind farms will produce.",
        parts: [
          { label: "", command: "Explain", ref: "F201.5.1", marks: 4,
            q: "Explain one benefit and one limitation to Coastline of using big data to improve the accuracy of its weather forecasting.",
            ms: ["Up to two marks for a benefit, e.g.:",
              "Forecasts of wind speed are more accurate (1) so Coastline knows how much electricity the wind farms will produce and buys less elsewhere (1)",
              "Storms can be predicted earlier (1) so turbines can be protected / maintenance planned (1)",
              "Up to two marks for a limitation, e.g.:",
              "Collecting and processing the data needs expensive infrastructure (1) which adds to Coastline's costs (1)",
              "Weather is still uncertain (1) so Coastline must keep a back-up supply / cannot rely on the forecast alone (1)"],
            guide: "Answers must focus on Coastline for the second mark of each." }
        ] }
    ]
  };
})();
