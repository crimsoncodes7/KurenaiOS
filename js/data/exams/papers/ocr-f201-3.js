/* Kurenai OS — js/data/exams/papers/ocr-f201-3.js
   OCR Cambridge Advanced National in IT (H119), Unit F201: Practice paper 3.

   WRITTEN BY KURENAIOS — NOT AN OCR PAPER. Original questions to the
   blueprint of OCR's Sample Assessment Material (v3.0, November 2024), the
   same as practice paper 1 (ocr-f201-1.js, which documents the shape): 1 h 30,
   60 marks, one organisation, marks per question 9 · 9 · 5 · 5 · 2 · 18 · 8 ·
   4, a table to clean, a table to complete, a linked (i)/(ii), one 6-mark
   Analyse and one 9-mark Discuss. Roadmap 5.22: retail this time, leaning on
   what papers 1 and 2 touched least — veracity and value (1.1), retail as an
   area of application (1.4), the four data mining techniques (2.3), data
   warehouses, NoSQL and dedicated servers (2.4), Monte Carlo simulation
   (2.6), Random Forest (3.1), UK GDPR's principles (4.1), facial
   recognition as an emerging ethical debate (4.2), energy efficiency and
   smart homes (5.1, 5.2). Every fact is from the specification; the schemes
   are in OCR's form but our own words. Freshway is a made-up company.     */
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
  (P["ocr-f201"] = P["ocr-f201"] || [])[2] = {
    id: "ocr-f201-3", n: 3, title: "Practice paper 3", board: "OCR", format: "ocr-case", mins: 90, marks: 60,
    org: "Freshway",
    context: "Freshway is a UK supermarket chain with 420 stores and an online shop. Shoppers scan their Freshway Card at the till and in the Freshway app, so Freshway knows what each card holder buys. Freshway's delivery lorries carry GPS trackers, and the fridges and freezers in every store have temperature sensors.",
    questions: [
      { n: 1, title: "Loyalty card data",
        stem: "Freshway Card records from all 420 stores are sent to Freshway's head office every night.",
        parts: [
          { label: "(a)", command: "State", ref: "F201.1.1", marks: 1,
            q: "State the characteristic of big data that describes how far the data can be trusted to be accurate.",
            ms: ["Veracity (1)"],
            guide: "Do not accept validity or variability." },
          { label: "(b)", command: "Explain", ref: "F201.1.1", marks: 2,
            q: "Explain how the value of the Freshway Card data helps to define it as big data.",
            ms: ["Value is the useful insight that can be gained from the data once it is analysed (1)",
              "e.g. shoppers' buying patterns let Freshway target offers and stock each store, which raises sales (1)"] },
          { label: "(c)", command: "Identify", ref: "F201.2.2", marks: 3,
            q: "Here are some of the Freshway Card records.\n\nThe records will be cleaned before they are analysed. Identify three data cleaning techniques that need to be carried out on the records above.",
            table: { head: ["Card number", "Store", "Date", "Spend (£)", "Postcode"],
              rows: [
                ["FW-883104", "Leeds Central", "06/11/2026", "42.17", "LS1 4AP"],
                ["FW-120933", "leeds central", "06/11/2026", "18.50", "LS2 7EW"],
                ["FW-883104", "Leeds Central", "06/11/2026", "42.17", "LS1 4AP"],
                ["FW-557210", "York Road", "06/11/2026", "£9.99", "YO1 9RN"],
                ["FW-340016", "York Road", "31/11/2026", "25.00", ""]
              ] },
            ms: ["Max 3 from (each must match an error in the records):",
              "Removing duplicates: FW-883104's record appears twice (1)",
              "Fix structural errors: \"Leeds Central\" and \"leeds central\" for one store (1)",
              "Clear formatting / converting data type: the £ sign typed into a number column (1)",
              "Validate data: 31/11/2026 is not a real date (1)",
              "Fix missing data: FW-340016 has no postcode (1)"],
            guide: "Accept a technique only once. The technique must fit an error in the table." },
          { label: "(d)", command: "Complete", ref: "F201.2.3", marks: 3,
            q: "Complete the table to show which data mining technique Freshway would use to answer each question.",
            fill: { head: ["Freshway's question", "Data mining technique"], rows: [
              ["What did shoppers buy most last Christmas?", "Descriptive"],
              ["Why did sales of bread fall in October?", ""],
              ["How much turkey will each store sell this Christmas?", ""],
              ["Which offer should each shopper be sent to make them spend more?", ""]] },
            ms: ["Why sales fell: diagnostic (1)", "How much turkey: predictive (1)", "Which offer to send: prescriptive (1)"] }
        ] },
      { n: 2, title: "Shoppers' personal data",
        stem: "To join the Freshway Card scheme, a shopper gives their name, email address and postcode.",
        parts: [
          { label: "(a)", command: "Identify", ref: "F201.4.1", marks: 2,
            q: "Identify two principles of UK GDPR.",
            ms: ["Max 2 from:", "Lawfulness, fairness and transparency (1)", "Purpose limitation (1)", "Data minimisation (1)", "Accuracy (1)",
              "Storage limitation (1)", "Integrity and confidentiality / security (1)", "Accountability (1)"] },
          { label: "(b)", command: "State", ref: "F201.4.1", marks: 1,
            q: "State one organisational policy on data use that would help Freshway to avoid not complying with UK GDPR.",
            ms: ["Max 1 from:", "Training staff in how to handle personal data (1)", "A retention policy that deletes data it no longer needs (1)",
              "Giving staff access only to the data their job needs (1)", "Regular audits / data protection impact assessments (1)",
              "Appointing a Data Protection Officer (1)"] },
          { label: "(c)", command: "Analyse", ref: "F201.4.2", marks: 6,
            q: "Freshway is considering putting cameras with facial recognition in its stores, to spot known shoplifters and to recognise Freshway Card holders as they walk in.\n\nAnalyse the ethical issues for Freshway of using facial recognition in its stores.",
            ms: ["Levels of response: mark with the level descriptors (6)"],
            levels: L6,
            indicative: [
              "A face is biometric data, a special category under UK GDPR: Freshway needs a lawful basis and shoppers' clear agreement to be recognised.",
              "Every shopper is scanned, including the many who are not suspected of anything: this is surveillance that shoppers may not expect.",
              "Facial recognition can be less accurate for some ethnic groups, ages or genders, so innocent shoppers may be wrongly accused: bias and discrimination.",
              "A database of faces is a serious risk if it is breached, because a face cannot be changed like a password.",
              "Freshway must be transparent: clear signs, and an explanation of how long images are kept and who they are shared with.",
              "Sharing a watch-list with other stores or the police raises questions of who owns the data and whether shoppers can challenge being on it.",
              "Staff safety and lower theft are real benefits, so Freshway must show the use is proportionate.",
              "Shoppers who object may shop elsewhere, and the regulator may investigate."] }
        ] },
      { n: 3, title: "Capturing data",
        stem: "The fridge and freezer sensors send a temperature reading every minute. Freshway also asks shoppers to complete online surveys.",
        parts: [
          { label: "(a)", command: "State", ref: "F201.2.1", marks: 1,
            q: "State whether the temperature readings are continuous or discrete data.",
            ms: ["Continuous (1)"] },
          { label: "(b)", command: "Explain", ref: "F201.1.3", marks: 2,
            q: "Explain one benefit to Freshway of using transactional records to capture data about what its shoppers buy.",
            ms: ["Every sale is recorded automatically at the till or online (1)",
              "so the data is complete and accurate, with the exact items, prices and times, without asking shoppers anything (1)"] },
          { label: "(c)", command: "Explain", ref: "F201.1.3", marks: 2,
            q: "Explain one limitation to Freshway of using online surveys to capture data about its shoppers.",
            ms: ["One mark for the limitation, one for applying it to Freshway, e.g.:",
              "Only some shoppers reply (1) so the results may not represent all of Freshway's shoppers (1)",
              "Shoppers may not answer honestly or accurately (1) so Freshway could act on wrong information (1)"] }
        ] },
      { n: 4, title: "Storing and serving data",
        stem: "Freshway keeps its sales data in a data warehouse. Its online shop runs on dedicated servers.",
        parts: [
          { label: "(a)", command: "State", ref: "F201.2.4", marks: 1,
            q: "State one characteristic of a data warehouse.",
            ms: ["Max 1 from:", "It stores structured, processed data (1)", "It combines data from many sources in one place (1)",
              "The data is organised for analysis and reporting (1)", "It holds historical data over many years (1)",
              "The structure / schema is set before the data is stored (1)"] },
          { label: "(b)", command: "Explain", ref: "F201.2.4", marks: 2,
            q: "Explain why Freshway might use a NoSQL database to store the reviews that shoppers write in the app.",
            ms: ["A NoSQL database does not need a fixed schema of tables and columns (1)",
              "so reviews of different lengths, with or without photos, can be stored as they are and the store can grow easily (1)"] },
          { label: "(c)", command: "Explain", ref: "F201.2.4", marks: 2,
            q: "Explain one benefit to Freshway of using dedicated servers for its online shop.",
            ms: ["One mark for the benefit, one for applying it to Freshway, e.g.:",
              "All of each server's resources are Freshway's alone (1) so the shop stays fast at busy times such as Christmas (1)",
              "Freshway controls the servers' set-up and security (1) so shoppers' payment and account data is better protected (1)"] }
        ] },
      { n: 5, title: "Predicting stock",
        stem: "Freshway uses a Random Forest to predict which products will sell out in each store.",
        parts: [
          { label: "", command: "Explain", ref: "F201.3.1", marks: 2,
            q: "Explain why a Random Forest can make more accurate predictions than a single decision tree.",
            ms: ["It builds many decision trees, each from a different sample of the data / features (1)",
              "and combines their answers (a majority vote or an average), so the errors of any one tree have less effect (1)"] }
        ] },
      { n: 6, title: "Planning and personal prices",
        stem: "Freshway uses big data analytics across its business, from planning deliveries to its offers in the app.",
        parts: [
          { label: "(a)", command: "State", ref: "F201.1.4", marks: 1,
            q: "State one purpose of big data analytics in retail.",
            ms: ["Max 1 from:", "To understand shoppers' buying behaviour (1)", "To personalise offers / recommendations (1)",
              "To plan stock so products are on the shelves when needed (1)", "To set prices (1)", "To reduce waste (1)"] },
          { label: "(b)", command: "Explain", ref: "F201.5.1", marks: 2,
            q: "Explain how Freshway could use the data from its fridge and freezer sensors to improve energy efficiency.",
            ms: ["The readings show units running colder than needed, failing, or with doors left open (1)",
              "so settings can be changed or faults fixed, and the units use less electricity (1)"] },
          { label: "(c)", command: "Explain", ref: "F201.2.6", marks: 2,
            q: "Explain how Freshway could use Monte Carlo simulation to plan how many delivery lorries it needs over Christmas.",
            ms: ["The plan is run many times with random values for the things that are uncertain, e.g. demand, traffic, breakdowns (1)",
              "which gives the range and likelihood of outcomes, so Freshway can have enough lorries for the likely busiest days (1)"] },
          { label: "(d)", command: "Discuss", ref: "F201.1.4", marks: 9,
            q: "Freshway is thinking about using big data analytics to set a personal price for some products for each Freshway Card holder, shown in the app.\n\nDiscuss whether Freshway should set personal prices for its Freshway Card holders.\n\nIn your answer you must write about:\n• any benefits to Freshway\n• any limitations to Freshway\n• whether you would recommend that Freshway sets personal prices, and your reasons.",
            ms: ["Levels of response: mark with the level descriptors (9)"],
            levels: L9,
            indicative: [
              "Benefit: prices matched to what each shopper buys can raise sales and keep shoppers loyal.",
              "Benefit: lower personal prices on food near its sell-by date reduce waste.",
              "Benefit: Freshway learns how shoppers respond to prices, which improves its other decisions.",
              "Limitation: shoppers who find they paid more than others may see it as unfair and shop elsewhere.",
              "Limitation: profiling shoppers this way needs a lawful basis under UK GDPR and must be explained to them.",
              "Limitation: shoppers without the app or a smartphone cannot get the personal prices: digital exclusion.",
              "Limitation: the analytics, systems and staff are expensive, and a wrong price harms trust.",
              "Limitation: the press and the regulator may criticise it, damaging Freshway's reputation.",
              "Recommendation: e.g. offer personal discounts (never higher prices) to card holders who opt in, and explain how they are chosen."] },
          { label: "(e)", command: "Explain", ref: "F201.5.1", marks: 4,
            q: "Freshway wants to cut the amount of food it throws away.\n\nExplain one benefit and one limitation to Freshway of using big data to reduce its food waste.",
            ms: ["Up to two marks for a benefit: one for identifying it, one for applying it, e.g.:",
              "Demand is forecast for each store and day (1) so less fresh food is over-ordered and thrown away (1)",
              "Food near its sell-by date is spotted early (1) so it can be reduced in price and sold (1)",
              "Up to two marks for a limitation, e.g.:",
              "Forecasts can be wrong, e.g. after unexpected weather or events (1) so food is still wasted or shelves are empty (1)",
              "The data and systems cost money to set up (1) which may be more than the waste saved at first (1)"],
            guide: "Answers must relate to Freshway for the second mark of each." }
        ] },
      { n: 7, title: "Lorry data",
        stem: "Freshway has kept the GPS data from its lorries for ten years. The data also shows where each lorry driver is during their shift.",
        parts: [
          { label: "(a)", command: "Explain", ref: "F201.1.2", marks: 2,
            q: "Explain how web-based storage has contributed to the evolution of big data.",
            ms: ["Storage over the internet is cheap and can grow when needed (1)",
              "so organisations can keep far larger volumes of data, for longer, than their own hardware could hold (1)"] },
          { label: "(b)(i)", command: "State", ref: "F201.4.2", marks: 2,
            q: "Freshway will share the lorry data with a logistics company that plans its routes. State two ways Freshway could protect the identity of its drivers when it shares the data.",
            ms: ["Max 2 from:", "Anonymise the data / remove the drivers' names and IDs (1)", "Pseudonymise / replace each driver with a code (1)",
              "Aggregate the data, e.g. averages per route (1)", "Share only the data needed / data minimisation (1)", "Encrypt the data when it is sent (1)"] },
          { label: "(b)(ii)", command: "Explain", ref: "F201.4.2", marks: 4, dependsOn: "(b)(i)",
            q: "Explain how each way you stated in 7(b)(i) would protect Freshway's drivers.",
            ms: ["Up to two marks for each way: one for how it works, one for applying it to the drivers, e.g.:",
              "Anonymise: nothing in the data links a journey to a person (1) so the logistics company cannot track where a driver was (1)",
              "Pseudonymise: the code can only be linked back to a driver with a key that Freshway keeps (1) so routes can be compared without revealing who drove them (1)",
              "Aggregate: only totals or averages are shared (1) so no single driver's breaks or speed can be seen (1)",
              "Data minimisation: only the fields route planning needs are shared (1) so the drivers' details never leave Freshway (1)",
              "Encryption: the data cannot be read if it is intercepted (1) so drivers' locations stay private on the way (1)"],
            guide: "Each explanation must refer to a way given in (i). Where (i) scores 0, (ii) scores 0." }
        ] },
      { n: 8, title: "Smart fridges",
        stem: "Freshway is planning to let shoppers link a smart fridge to the Freshway app, so that food running out is added to their next online order.",
        parts: [
          { label: "", command: "Explain", ref: "F201.5.2", marks: 4,
            q: "Explain one benefit and one limitation for shoppers of linking their smart fridge to the Freshway app.",
            ms: ["Up to two marks for a benefit, e.g.:",
              "Food is reordered before it runs out (1) so shoppers spend less time planning and shopping (1)",
              "Only what is needed is ordered (1) so shoppers waste less food and money (1)",
              "Up to two marks for a limitation, e.g.:",
              "Freshway learns what is in each shopper's fridge (1) which could be used for targeted marketing the shopper did not expect (1)",
              "A smart fridge is expensive (1) so only some shoppers can benefit (1)",
              "The fridge may misread what is there (1) so unwanted food is ordered (1)"],
            guide: "Answers must focus on the shoppers for the second mark of each." }
        ] }
    ]
  };
})();
