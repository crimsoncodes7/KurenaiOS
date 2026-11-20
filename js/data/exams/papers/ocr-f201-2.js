/* Kurenai OS — js/data/exams/papers/ocr-f201-2.js
   OCR Cambridge Advanced National in IT (H119), Unit F201: Practice paper 2.

   WRITTEN BY KURENAIOS — NOT AN OCR PAPER. Original questions to the
   blueprint of OCR's Sample Assessment Material (v3.0, November 2024), the
   same as practice paper 1 (ocr-f201-1.js, which documents the shape): 1 h 30,
   60 marks, one organisation, marks per question 9 · 9 · 5 · 5 · 2 · 18 · 8 ·
   4, a table to clean, a table to complete, a linked (i)/(ii), one 6-mark
   Analyse and one 9-mark Discuss. Roadmap 5.22: it leans on the topic areas
   paper 1 touched least — the evolution of big data (1.2), data science and
   data analytics (2.5), K-Means (3.1), protecting identity and inclusive
   data (4.2), smart cities and natural disaster management (5.1, 5.2).
   Every fact is from the specification (F201.1.1–5.2); the schemes are in
   OCR's form but our own words. Calderford is a made-up city.            */
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
  (P["ocr-f201"] = P["ocr-f201"] || [])[1] = {
    id: "ocr-f201-2", n: 2, title: "Practice paper 2", board: "OCR", format: "ocr-case", mins: 90, marks: 60,
    org: "Calderford City Council",
    context: "Calderford City Council runs the services for a city of 380,000 people. It is making Calderford a smart city: sensors on roads, buses, street lights and bins send data to the council's data platform, and residents report problems such as potholes through the Calderford app. The council shares some of its data with the city's bus company, the police and the local hospital.",
    questions: [
      { n: 1, title: "A city of data",
        stem: "Twenty years ago the council's data was held in a few databases. It now collects data every second from thousands of connected devices.",
        parts: [
          { label: "(a)", command: "Identify", ref: "F201.1.2", marks: 1,
            q: "Identify the development that allows the council's road sensors, buses and bins to send data to its data platform over the internet.",
            ms: ["Internet of Everything / IoE (1)"],
            guide: "Accept Internet of Things / IoT." },
          { label: "(b)", command: "Explain", ref: "F201.1.2", marks: 2,
            q: "Explain how the proliferation of devices generating digital data has contributed to the evolution of big data.",
            ms: ["People and organisations own far more devices that create data all the time, e.g. phones, wearables, sensors (1)",
              "so the volume and velocity of data available to collect and analyse has grown hugely (1)"] },
          { label: "(c)", command: "Identify", ref: "F201.2.2", marks: 3,
            q: "Here are some of the records the city's buses send to the council.\n\nThe records will be cleaned before they are analysed. Identify three data cleaning techniques that need to be carried out on the records above.",
            table: { head: ["Bus ID", "Route", "Date", "Passengers", "Delay (mins)"],
              rows: [
                ["B114", "12", "03/11/2026", "38", "4"],
                ["B209", "7", "03/11/2026", "forty", "2"],
                ["B114", "12", "03/11/2026", "38", "4"],
                ["B318", "Route 5", "03/11/2026", "22", ""],
                ["B402", "9", "03/11/2026", "-6", "3"]
              ] },
            ms: ["Max 3 from (each must match an error in the records):",
              "Removing duplicates: B114's record appears twice (1)",
              "Converting data type: \"forty\" is text, not a number (1)",
              "Fix missing data: B318 has no delay (1)",
              "Fix structural errors: \"Route 5\" where the other routes are numbers (1)",
              "Validate data: -6 passengers is impossible (1)"],
            guide: "Accept a technique only once. The technique must fit an error in the table." },
          { label: "(d)", command: "Complete", ref: "F201.2.1", marks: 3,
            q: "Complete the table to show whether each item of the council's data is structured, semi-structured or unstructured.",
            fill: { head: ["The council's data", "Type of data"], rows: [
              ["Council tax payments held in a relational database", "Structured"],
              ["Photos of potholes uploaded by residents", ""],
              ["Emails that residents send to the council", ""],
              ["Air quality readings kept in a spreadsheet file", ""]] },
            ms: ["Photos: unstructured (1)", "Emails: semi-structured (1)", "Air quality readings: structured (1)"] }
        ] },
      { n: 2, title: "Protecting residents' data",
        stem: "The council holds personal data about every resident who pays council tax or uses the Calderford app.",
        parts: [
          { label: "(a)", command: "State", ref: "F201.4.1", marks: 1,
            q: "State the regulation the council must comply with when it processes residents' personal data.",
            ms: ["UK General Data Protection Regulation / UK GDPR (1)"],
            guide: "Accept UK GDPR with the Data Protection Act 2018. Do not accept the EU GDPR alone." },
          { label: "(b)", command: "Explain", ref: "F201.4.1", marks: 2,
            q: "Explain one impact on the council if it does not comply with UK GDPR.",
            ms: ["One mark for the impact, one for applying it to the council, e.g.:",
              "A large fine from the Information Commissioner's Office (1) which is money taken from the city's services (1)",
              "Residents lose trust in the council (1) so fewer report problems or use the app (1)",
              "An enforcement notice can stop the processing (1) so a service such as the app cannot run (1)",
              "Residents can claim compensation (1) which adds to the council's costs (1)"] },
          { label: "(c)", command: "Analyse", ref: "F201.4.2", marks: 6,
            q: "The council plans to share data from the city's traffic cameras and from the Calderford app with the police and the bus company.\n\nAnalyse how the council could protect the identity of residents when it collects, stores and shares this data.",
            ms: ["Levels of response: mark with the level descriptors (6)"],
            levels: L6,
            indicative: [
              "Data minimisation: collect and share only the fields each partner needs; the bus company needs journey counts, not names.",
              "Anonymise the data before sharing: remove names, app account details and exact addresses.",
              "Pseudonymise where records must be linked: replace each resident with a code, keeping the key at the council.",
              "Aggregate: share totals by street or hour rather than individual records.",
              "Blur faces and number plates in camera images unless the police have a lawful reason to see them.",
              "Store the data securely: encryption, access only for named staff, and an audit of who opens records.",
              "Set how long each kind of data is kept and delete it after that time.",
              "A data sharing agreement with each partner fixes what they may do with the data; a risk is re-identification when datasets are combined, so the council must test for it."] }
        ] },
      { n: 3, title: "Data science and data analytics",
        stem: "The council employs a small team of data scientists and data analysts.",
        parts: [
          { label: "(a)", command: "State", ref: "F201.2.5", marks: 1,
            q: "State the purpose of data analytics.",
            ms: ["To examine existing data to answer specific questions / find conclusions that support decisions (1)"] },
          { label: "(b)", command: "Explain", ref: "F201.2.5", marks: 2,
            q: "Explain one difference between data science and data analytics.",
            ms: ["Data science builds new models and algorithms to discover patterns and make predictions, often asking new questions (1)",
              "while data analytics examines existing data to answer questions that are already known (1)"],
            guide: "Both sides of the difference are needed for 2 marks." },
          { label: "(c)", command: "Explain", ref: "F201.2.5", marks: 2,
            q: "Explain how the council could use data science to improve one of its services.",
            ms: ["One mark for the use, one for the improvement, e.g.:",
              "A model built from bin sensor readings predicts when each bin will be full (1) so lorries only visit bins that need emptying, saving fuel and staff time (1)",
              "A model of road sensor and weather data predicts where potholes will form (1) so roads are repaired before they cause damage (1)",
              "A model of street light use predicts when lights are needed (1) so lights are dimmed when streets are empty, saving energy (1)"] }
        ] },
      { n: 4, title: "Grouping the city",
        stem: "The council wants to group Calderford's 120 neighbourhoods by how their residents use council services.",
        parts: [
          { label: "(a)", command: "State", ref: "F201.3.1", marks: 1,
            q: "State what is meant by machine learning.",
            ms: ["Computers learning from data to make predictions or decisions without being explicitly programmed for each one (1)"] },
          { label: "(b)", command: "Explain", ref: "F201.3.1", marks: 2,
            q: "Explain how the K-Means algorithm would group the neighbourhoods.",
            ms: ["A number of groups (k) is chosen and a centre point placed for each (1)",
              "each neighbourhood joins the nearest centre; the centres move to the average of their group and this repeats until the groups stop changing (1)"] },
          { label: "(c)", command: "Explain", ref: "F201.3.1", marks: 2,
            q: "Explain one limitation to the council of using K-Means to group the neighbourhoods.",
            ms: ["One mark for the limitation, one for applying it to the council, e.g.:",
              "The number of groups has to be chosen in advance (1) so a poor choice gives groups that do not match the neighbourhoods' real needs (1)",
              "The groups are not labelled (1) so staff must work out what each group means before planning services (1)",
              "Unusual neighbourhoods / outliers pull the centres (1) so a few very different areas distort the groups (1)"] }
        ] },
      { n: 5, title: "Measuring traffic",
        stem: "The council wants to measure how much traffic uses each road in the city.",
        parts: [
          { label: "", command: "Identify", ref: "F201.1.3", marks: 2,
            q: "Identify two data capture methods the council could use to measure the traffic on the city's roads.",
            ms: ["Max 2 from:", "Sensors, e.g. in the road surface (1)", "Digital images and videos, e.g. traffic cameras (1)",
              "GPS signals from phones, buses or vehicles (1)", "Satellites (1)", "IoE connected devices, e.g. connected cars (1)"] }
        ] },
      { n: 6, title: "A smart city",
        stem: "The council's data platform already collects data from roads, buses, bins and street lights.",
        parts: [
          { label: "(a)", command: "State", ref: "F201.5.2", marks: 1,
            q: "State the purpose of a smart city.",
            ms: ["To use data from connected sources to make city services more efficient / improve residents' quality of life (1)"] },
          { label: "(b)", command: "Explain", ref: "F201.5.2", marks: 2,
            q: "Explain how data from a variety of sources can be exchanged to manage the traffic in Calderford.",
            ms: ["Data from road sensors, cameras and the buses' GPS is sent to one platform (1)",
              "which changes traffic light timings or sends route advice in real time, so congestion is reduced (1)"] },
          { label: "(c)", command: "Discuss", ref: "F201.5.2", marks: 9,
            q: "The council is thinking about connecting its traffic, waste, street lighting and housing data in one platform for the whole city.\n\nDiscuss whether the council should connect all of these services in one smart city platform.\n\nIn your answer you must write about:\n• any benefits to the council and its residents\n• any limitations to the council and its residents\n• whether you would recommend that the council connects all of these services, and your reasons.",
            ms: ["Levels of response: mark with the level descriptors (9)"],
            levels: L9,
            indicative: [
              "Benefit: traffic lights that respond to real traffic cut congestion and pollution.",
              "Benefit: bins and street lights served only when needed save money that can go to other services.",
              "Benefit: combined data helps urban and community planning, e.g. where new housing needs new bus routes and schools.",
              "Benefit: emergency services reach incidents faster when roads are managed and data is shared.",
              "Limitation: the sensors, platform and staff are expensive to buy and maintain.",
              "Limitation: one platform is a target for cyber attacks; an attack could stop several city services at once.",
              "Limitation: residents may see it as surveillance; personal data must comply with UK GDPR.",
              "Limitation: residents without smartphones or internet access may be left out of services that rely on the app.",
              "Recommendation: e.g. connect the services in stages, starting with traffic, with strong security and clear rules on personal data."] },
          { label: "(d)", command: "Explain", ref: "F201.2.6", marks: 2,
            q: "Explain how the council could use cohort analysis to understand the residents who started using the Calderford app in the same month.",
            ms: ["Residents who share a characteristic, such as the month they joined, are put in one group / cohort (1)",
              "and the group's behaviour is followed over time, e.g. how many still report problems six months later (1)"] },
          { label: "(e)", command: "Explain", ref: "F201.2.4", marks: 4,
            q: "The council stores the data from its platform in a public cloud.\n\nExplain one benefit and one limitation to the council of using a public cloud.",
            ms: ["Up to two marks for a benefit: one for identifying it, one for applying it, e.g.:",
              "Storage can grow when it is needed (1) so more sensors can be added without buying hardware (1)",
              "The provider maintains the hardware (1) so the council's IT staff can work on other things (1)",
              "Up to two marks for a limitation, e.g.:",
              "The data is held by another organisation (1) so the council has less control over residents' personal data (1)",
              "It depends on an internet connection (1) so city services stop if the connection fails (1)",
              "There is a continuing charge (1) which grows as the city's data grows (1)"],
            guide: "Answers must relate to the council or its residents for the second mark of each." }
        ] },
      { n: 7, title: "Fair decisions",
        stem: "The council uses automated decision making to decide which households are offered help with heating bills.",
        parts: [
          { label: "(a)", command: "Explain", ref: "F201.4.2", marks: 2,
            q: "Explain how UK GDPR applies to the council's automated decision making.",
            ms: ["Residents have the right not to be subject to a decision based only on automated processing that significantly affects them (1)",
              "so the council must tell them, and let them ask for a person to review / challenge the decision (1)"] },
          { label: "(b)(i)", command: "State", ref: "F201.4.2", marks: 2,
            q: "The council will use data about residents to decide where to put new charging points for electric cars. State two inclusive data principles the council should follow when choosing the data it uses.",
            ms: ["Max 2 from:", "All population groups must be included (1)", "The data must be up to date (1)", "The data must be transparent (1)"] },
          { label: "(b)(ii)", command: "Explain", ref: "F201.4.2", marks: 4, dependsOn: "(b)(i)",
            q: "Explain why each principle you stated in 7(b)(i) would need to be considered by the council.",
            ms: ["Up to two marks for each principle: one for the reason, one for applying it to the council, e.g.:",
              "All groups included: app data misses residents without smartphones or cars today (1) so charging points would only go where app users live (1)",
              "Up to date: the number of electric cars changes quickly (1) so old data would put charging points in the wrong places (1)",
              "Transparent: residents should be able to see what data was used and how (1) so they trust the locations and can challenge them (1)"],
            guide: "Each explanation must refer to a principle given in (i). Where (i) scores 0, (ii) scores 0." }
        ] },
      { n: 8, title: "Flood warnings",
        stem: "Calderford is built beside a river that floods every few years.",
        parts: [
          { label: "", command: "Explain", ref: "F201.5.1", marks: 4,
            q: "Explain one benefit and one limitation to the council of using big data to manage flooding in Calderford.",
            ms: ["Up to two marks for a benefit, e.g.:",
              "River level sensors, rainfall forecasts and satellite images give an early warning (1) so residents can be warned and flood barriers put up in time (1)",
              "Phone locations and social media posts show where people are during a flood (1) so rescue teams are sent where they are needed (1)",
              "Up to two marks for a limitation, e.g.:",
              "Sensors can fail when they are flooded or lose power (1) so warnings stop when they are most needed (1)",
              "Warnings that turn out to be false (1) mean residents may ignore the next one (1)",
              "The sensors and systems are expensive (1) which takes money from other services (1)"],
            guide: "Answers must focus on Calderford or its residents for the second mark of each." }
        ] }
    ]
  };
})();
