/* Kurenai OS — deep content: OCR Cambridge Advanced National in IT: Data
   Analytics (H119), Unit F201 Big data and machine learning — Topic Area 2,
   The infrastructure challenges of big data (F201.2.1–2.6), at full depth
   (roadmap 5.19 item 1). Written from the specification (Version 5, June
   2026, pp. 39–41) and the Sample Assessment Material (SAM, Version 3.0,
   November 2024). There are no past papers: every exam-style question here
   is written by KurenaiOS on the SAM's shapes, and says which SAM question
   it is modelled on. The exam tab's items derive from the worked cards. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---------- small figure helpers (pixel coordinates, y down) ---------- */
function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }
function arrow(x1, y1, x2, y2, label, o) {
  o = o || {};
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: o.both ? "both" : true, c: o.c || "accent2", w: o.w || 1.6, dash: o.dash }];
  if (label) it.push(txt((x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0), label, { size: 10.5, c: o.c || "accent2" }));
  return it;
}
/* a labelled box; `lines` is one string or an array of lines, the first bold */
function box(x, y, w, h, lines, o) {
  o = o || {};
  var col = o.c || "accent", it = [{ poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill: col, alpha: o.a == null ? 0.13 : o.a, c: col, w: 1.3, dash: o.dash }];
  lines = [].concat(lines || []);
  var lh = o.lh || 14, top = y + h / 2 - (lines.length - 1) * lh / 2;
  lines.forEach(function (t, i) { it.push(txt(x + w / 2, top + i * lh, t, { b: i === 0 && !o.plain, size: i === 0 ? (o.size || 11.5) : (o.size2 || 10.5), c: i === 0 ? "text" : "text2" })); });
  return it;
}

/* ---------- the levels-of-response descriptors, in our own words, on the SAM's structure ---------- */
function lor6(topic) {
  /* the note in the callout, its table after it: never a block inside a block */
  return [{ callout: { t: "info", h: "How a 6-mark “Analyse” answer is levelled", body: "Start at Level 3 and work down; the mark inside a level depends on how consistently the answer meets it. A list of points with no explanation stays in Level 1–2 however long it is." } },
    { table: { head: ["Level", "Marks", "What the answer shows"], rows: [
      ["3 (high)", "5–6", "A **thorough** analysis: a **range** of points, each explained in a **logical chain** (point → because → so for this organisation), detailed knowledge of " + topic + " used **in the scenario**, subject terms used throughout."],
      ["2 (mid)", "3–4", "An **adequate** analysis: **some** points, sound knowledge, explanations that are partly in context, some subject terms."],
      ["1 (low)", "1–2", "A **basic** analysis: at least one point, limited knowledge or context, brief explanation, few subject terms."],
      ["0", "0", "Nothing worthy of credit."]
    ] } }];
}
function lor9(topic) {
  /* the note in the callout, its table after it: never a block inside a block */
  return [{ callout: { t: "info", h: "How a 9-mark “Discuss whether” answer is levelled", body: "The three bullets in the question (benefits · limitations · recommendation) are the plan. No recommendation, or one with no reasons, cannot reach Level 3." } },
    { table: { head: ["Level", "Marks", "What the answer shows"], rows: [
      ["3 (high)", "7–9", "A **thorough discussion**: a range of examples of " + topic + " in this scenario, **benefits AND limitations** for this organisation, detailed analysis in context, and a **clear conclusion with detailed reasons**; subject terms used throughout."],
      ["2 (mid)", "4–6", "An **adequate discussion**: some examples, some benefits **or** limitations, some analysis in context, an adequate conclusion with relevant reasons."],
      ["1 (low)", "1–3", "A **basic discussion**: a few examples or points, limited context, a brief conclusion with little justification."],
      ["0", "0", "Nothing worthy of credit."]
    ] } }];
}

/* =====================================================================
   F201.2.1  Types of big data
   ===================================================================== */
function typesFig() {
  var it = [];
  /* structured: a table */
  it.push(txt(105, 16, "Structured", { b: true, size: 12.5, c: "text" }));
  it.push(txt(105, 32, "fixed schema · rows × columns", { size: 10 }));
  var cols = ["ID", "Item", "£"], rows = [["0417", "Ticket", "89.00"], ["0418", "Cider", "6.50"], ["0419", "Ticket", "89.00"]];
  [cols].concat(rows).forEach(function (r, ri) {
    r.forEach(function (v, ci) {
      var x = 18 + ci * 58, y = 44 + ri * 26;
      it.push({ poly: [[x, y], [x + 58, y], [x + 58, y + 26], [x, y + 26]], fill: ri === 0 ? "accent" : "line", alpha: ri === 0 ? 0.25 : 0.06, c: "accent", w: 1.1 });
      it.push(txt(x + 29, y + 13, v, { size: 10.5, b: ri === 0, c: "text" }));
    });
  });
  it.push(txt(105, 168, "relational DB · spreadsheet", { size: 10, c: "accent" }));
  it.push(txt(105, 182, "transactions · counts, measures", { size: 10, c: "accent" }));
  /* semi-structured: tags */
  it.push(txt(320, 16, "Semi-structured", { b: true, size: 12.5, c: "text" }));
  it.push(txt(320, 32, "tags label the data · no fixed table", { size: 10 }));
  it = it.concat(box(228, 44, 184, 104, ["<booking>", "  <name>Sam Ng</name>", "  <tickets>2</tickets>", "  <note>Wheelchair</note>", "</booking>"], { c: "accent2", plain: true, size: 10.5, size2: 10.5, lh: 17 }));
  it.push(txt(320, 168, "XML · email · web page", { size: 10, c: "accent2" }));
  it.push(txt(320, 182, "zipped file", { size: 10, c: "accent2" }));
  /* unstructured: a cloud of media */
  it.push(txt(532, 16, "Unstructured", { b: true, size: 12.5, c: "text" }));
  it.push(txt(532, 32, "no predefined model", { size: 10 }));
  it = it.concat(box(444, 48, 74, 40, ["video"], { c: "accent3", a: 0.18 }), box(528, 52, 98, 36, ["“best set ever!!”"], { c: "accent3", a: 0.1, plain: true, size: 10.5 }),
    box(444, 100, 88, 42, ["satellite", "image"], { c: "accent3", a: 0.18 }), box(544, 100, 82, 42, ["voice", "note"], { c: "accent3", a: 0.1 }));
  it.push(txt(532, 168, "social media · entertainment", { size: 10, c: "accent3" }));
  it.push(txt(532, 182, "weather data", { size: 10, c: "accent3" }));
  it = it.concat(arrow(40, 204, 600, 204, "", { c: "muted", both: true }));
  it.push(txt(40, 222, "easiest to store and query", { size: 10, pos: "e", off: 0 }), txt(600, 222, "richest, hardest to analyse", { size: 10, pos: "w", off: 0 }));
  return { fig: { w: 640, h: 236, items: it, cap: "The three types of big data on one line: the more organised the data, the easier it is to store and query; the less organised, the richer it is — and the more processing it needs before it can be analysed." } };
}
function numberFig() {
  var it = [];
  it.push(txt(16, 22, "Discrete — counted", { b: true, size: 11.5, c: "text", pos: "e", off: 0 }));
  it.push({ line: [[200, 22], [610, 22]], c: "line", w: 1.2 });
  [0, 1, 2, 3, 4, 5, 6].forEach(function (n) { it.push({ circle: [220 + n * 64, 22, 6], fill: "accent", alpha: 0.85, c: "accent" }); it.push(txt(220 + n * 64, 42, String(n), { size: 10.5 })); });
  it.push(txt(412, 62, "tickets bought: 0, 1, 2 … never 2.5", { size: 10.5, c: "accent" }));
  it.push(txt(16, 102, "Continuous — measured", { b: true, size: 11.5, c: "text", pos: "e", off: 0 }));
  it.push({ poly: [[220, 96], [604, 96], [604, 108], [220, 108]], fill: "accent2", alpha: 0.35, c: "accent2", w: 1.2 });
  it.push(txt(220, 124, "0 °C", { size: 10.5 }), txt(604, 124, "30 °C", { size: 10.5 }));
  it.push(txt(412, 142, "temperature: 17.4, 17.43, 17.436 … any value in the range", { size: 10.5, c: "accent2" }));
  return { fig: { w: 640, h: 156, items: it, cap: "Discrete data takes separate, countable values; continuous data can take any value in a range, limited only by how precisely it is measured." } };
}

C["it:F201.2.1"] = {
  notes: [
    { h: "Types of big data — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (F201 2.1)", body: [
      "**To include:** the difference between the three types · how each is captured · the purpose of each · when each can be used · the benefits and limitations of each.",
      "**Exam evidence:** SAM Q3(c) asks for two examples of structured data other than transactional data (2 marks)."
    ] } },
    { kv: [
      [
        "Structured data",
        "continuous · discrete · relational database · spreadsheet file data · transactional data"
      ],
      ["Unstructured data", "social media and entertainment data · weather data"],
      ["Semi-structured data", "emails · XML · zipped files · web pages"]
    ] },
    { ol: ["**Structured data** — the five kinds, capture, purpose, benefits and limitations.", "**Unstructured data** — social media and entertainment, weather.", "**Semi-structured data** — emails, XML, zipped files, web pages.", "**Comparing the three types** — side by side, and how to classify.", "**In exam questions** — worked answers in OCR's format.", "**Exam toolkit** — terms, traps, mnemonic and links."] },
    typesFig(),

    { page: "Structured data" },
    { callout: { t: "def", h: "Structured data", body: "Data organised to a **predefined model (schema)**: fixed fields in **rows and columns**, each field with a set data type, so it can be stored in tables and searched, sorted and calculated on directly (for example with SQL)." } },
    { table: { head: ["Kind (spec)", "What it is", "Example"], rows: [
      ["**Continuous**", "Numeric data that is **measured** and can take **any value in a range**.", "Temperature 17.4 °C; delivery time 2.35 h; weight 1.27 kg."],
      ["**Discrete**", "Numeric data that is **counted** and takes **separate, fixed values**.", "Number of tickets bought (2); shoe size (7½); items in a basket (5)."],
      ["**Relational database**", "Data held in **linked tables**; each record has a **primary key** and tables join on **foreign keys**.", "Customers, Orders and Products tables linked by CustomerID and ProductID."],
      ["**Spreadsheet file data**", "Data in a **grid of rows and columns** in a spreadsheet file (e.g. .xlsx, .csv).", "A staff rota; a monthly sales sheet exported as CSV."],
      ["**Transactional data**", "A **record of each transaction** (sale, payment, booking): what, when, where, how much, who.", "Till receipt: 14/07/2026 21:42 · Bar 3 · 2 × cider · £13.00 · card."]
    ] } },
    numberFig(),
    { callout: { t: "info", h: "How structured data is captured", body: [
      "**Online forms** with fixed fields and validation (a registration or booking form).",
      "**EPOS tills and barcode scanners** — each scan writes a transaction row.",
      "**Card terminals and online checkouts** — payment records.",
      "**Sensors and meters** that output numbers at set intervals (a smart meter reading every 30 minutes).",
      "**Data entry** into a database or spreadsheet; imports from other systems."
    ] } },
    { kv: [
      ["Purpose", "To record **precise, measurable facts** in a consistent form so they can be totalled, compared, reported and audited."],
      ["When it is used", "Sales and stock control · finance and accounts · bookings · loyalty schemes · KPIs and dashboards · any question with a numeric answer (how many, how much, when)."]
    ] },
    { h: "Structured data — benefits and limitations" },
    { table: { head: ["Benefits", "Limitations"], rows: [
      [
        "**Easy to search, sort, filter and calculate** — SQL and spreadsheet functions work on it directly.",
        "**Rigid schema** — it can only hold what fits the predefined fields."
      ],
      [
        "**Validation at input** keeps quality high (a date field only accepts dates).",
        "**Changing the structure** (a new field) takes time and can break reports."
      ],
      [
        "**Quick to analyse and chart** — fewer preparation steps.",
        "**Misses the rich detail** — opinions, images, tone of voice."
      ],
      [
        "**Mature tools and skills** — most staff can use it.",
        "Only a **small share of all big data** is structured, so it gives a partial picture."
      ],
      [
        "**Compact to store** — fixed fields, no repeated tags.",
        "Data that arrives in other forms must be **converted** before it fits."
      ]
    ] } },
    { worked: { tag: "example", title: "Continuous or discrete?", q: "A festival records:\n- **(a)** the number of wristbands scanned at a gate each minute\n- **(b)** the noise level at the stage in decibels\n- **(c)** the number of bar staff on shift\n- **(d)** the time each queue takes to clear.",
      steps: [
        { m: "(a) **Discrete** — wristbands are counted in whole numbers.", mk: "✓" },
        { m: "(b) **Continuous** — sound level is measured and can be any value (94.6 dB).", mk: "✓" },
        { m: "(c) **Discrete** — a count of people.", mk: "✓" },
        { m: "(d) **Continuous** — time is measured and can be any value in a range.", mk: "✓", n: "The test: counted → discrete; measured → continuous." }
      ], result: "Counted = discrete; measured = continuous" } },

    { page: "Unstructured data" },
    { callout: { t: "def", h: "Unstructured data", body: "Data with **no predefined model or organisation** — it does not fit rows and columns. It still has content and patterns, but software must **process** it (for example with AI) to find them. Most of the world's data is unstructured." } },
    { table: { head: ["Kind (spec)", "What it includes", "How it is captured"], rows: [
      ["**Social media and entertainment data**", "Posts, comments, likes, images, videos, live streams, music and TV viewing, game play, reviews.", "Social media sites and their feeds (social media monitoring), streaming platforms logging what is watched or played, uploads from phones."],
      ["**Weather data**", "Satellite and radar images, readings from many different weather stations and sensors, forecasters' text — in many formats and arriving continuously.", "Satellites, radar, weather stations and sensors, ships and aircraft, IoE devices; often bought from a weather service."]
    ] } },
    { callout: { t: "warn", h: "Weather data is in the spec's unstructured list", body: "A single reading (12:00, 17.4 °C) looks structured. The spec lists **weather data as unstructured** because, as big data, it is mostly images, radar, free text and mixed sensor feeds in many formats. Follow the spec in the exam." } },
    { kv: [
      ["Purpose", "To capture **rich, real-world information** — what people say, feel, watch and share, and what the environment is doing — that a form could never collect."],
      ["When it is used", "Sentiment analysis of posts and reviews · spotting trends as they start · recommendation engines (what to watch next) · targeted advertising · image and voice recognition · forecasting and planning with weather data (staffing, stock, safety, energy demand)."]
    ] },
    { h: "Unstructured data — benefits and limitations" },
    { table: { head: ["Benefits", "Limitations"], rows: [
      [
        "**Rich detail** — opinions, emotion, images and context that numbers cannot hold.",
        "**Hard to search and analyse** — needs AI, machine learning, natural language processing or image recognition."
      ],
      [
        "**Huge amounts are available**, often generated for free by users.",
        "**Large storage** needed (often a data lake) and long processing times."
      ],
      [
        "**Honest, unprompted views** — people post what they would not put on a survey.",
        "**Veracity problems** — fake accounts, sarcasm, slang, spam, duplicates."
      ],
      [
        "**Real-time insight** — a complaint trending now can be acted on now.",
        "**Privacy and legal risk** — personal data in posts and images must still meet UK GDPR."
      ],
      [
        "Reveals **patterns nobody asked about** in advance.",
        "Needs **specialist skills and tools**, so it is harder to use."
      ]
    ] } },
    { worked: { tag: "example", title: "Why does the festival buy weather data?", q: "Skyline Festivals buys detailed weather data for each site in the week before an event. Give two ways it could use the data.",
      steps: [
        { m: "**Safety:** a forecast of high wind or storms can trigger a plan to secure stages or delay opening.", mk: "✓" },
        { m: "**Staffing and stock:** a heatwave forecast means more water points, more first-aid staff and more cold drinks at the bars; heavy rain means more trackway and fewer outdoor sales.", mk: "✓", n: "Each use names the data (identify) and what the festival does with it (apply) — the shape of a 2-mark Explain." }
      ], result: "Plan safety, staff and stock around the forecast" } },

    { page: "Semi-structured data" },
    { callout: { t: "def", h: "Semi-structured data", body: "Data that does **not** fit a rigid table, but carries **tags, markers or metadata** that label its parts, so it has **some organisation** and is **self-describing**. It sits between structured and unstructured." } },
    { table: { head: ["Kind (spec)", "The structured part", "The free part"], rows: [
      ["**Emails**", "Header fields: To, From, Date, Subject, attachments.", "The message body: free text, images."],
      ["**XML** (eXtensible Markup Language)", "Named tags that open and close around each value, nested to show hierarchy.", "Any tag can be added; records need not have the same fields."],
      ["**Zipped files**", "The archive's index: each file's name, size, date and compression.", "The files inside can be anything — text, images, video."],
      ["**Web pages**", "HTML tags: title, headings, links, metadata.", "The text, images and video on the page."]
    ] } },
    { code: { lang: "xml", src: "<booking id=\"B2291\">\n  <name>Sam Ng</name>\n  <tickets>2</tickets>\n  <festival>Skyline North</festival>\n  <note>Needs the accessible campsite</note>\n</booking>\n<booking id=\"B2292\">\n  <name>Ola Ade</name>\n  <tickets>4</tickets>\n</booking>", cap: "Two XML records from a ticket agent's feed: each value is labelled by its tag, but the second record has no festival or note — no fixed schema forces it to." } },
    { callout: { t: "info", h: "How semi-structured data is captured", body: [
      "**Email servers** store every message with its header fields.",
      "**Data feeds and APIs** between organisations send XML (or JSON) records.",
      "**Web crawlers and scraping** collect web pages for analysis.",
      "**File transfers and downloads** move zipped archives of many files at once.",
      "**IoE devices** often send their readings as tagged messages."
    ] } },
    { kv: [
      ["Purpose", "To **exchange and hold varied records** between systems while keeping each value labelled, so a computer can still find the parts it needs."],
      ["When it is used", "Sharing data between organisations (ticket agents, suppliers) · analysing customer emails · web analytics and scraping · sending many files in one compressed archive · storing records whose fields vary."]
    ] },
    { h: "Semi-structured data — benefits and limitations" },
    { table: { head: ["Benefits", "Limitations"], rows: [
      [
        "**Flexible** — new tags or fields can be added without redesigning a schema.",
        "**Harder to query** than a table; often must be converted first."
      ],
      [
        "**Self-describing** — tags label the data, so systems can exchange it easily.",
        "**Inconsistent tags** between sources need wrangling (name vs fullName)."
      ],
      [
        "**Easier to analyse than unstructured** — the tags can be read by software.",
        "**Tags add size** — the same label repeats in every record."
      ],
      [
        "Handles **nested, hierarchical** data (a booking holding several tickets).",
        "Part of it (an email body, a page's text) is still **unstructured**."
      ]
    ] } },

    { page: "Comparing the three types" },
    { table: { head: ["", "Structured", "Semi-structured", "Unstructured"], rows: [
      ["Organisation", "Fixed schema, rows × columns", "Tags / metadata, no fixed table", "No predefined model"],
      ["Spec examples", "Continuous, discrete, relational DB, spreadsheet, transactional", "Emails, XML, zipped files, web pages", "Social media and entertainment, weather"],
      ["Typical capture", "Forms, tills, card terminals, sensors", "Email servers, feeds and APIs, web crawlers", "Social media, cameras, satellites, radar"],
      ["Typical store", "Relational database, data warehouse", "NoSQL database, data lake", "Data lake"],
      ["Analysis", "Direct: SQL, spreadsheet functions", "Read the tags, then analyse", "AI / ML: NLP, image recognition"],
      ["Main benefit", "Easy and fast to query", "Flexible and portable", "Richest insight"],
      ["Main limitation", "Rigid; misses detail", "Inconsistent tags; harder to query", "Hard, slow and skilled work to analyse"]
    ] } },
    { steps: [
      { h: "Is there a fixed set of fields, the same for every record, in rows and columns?", m: "Yes → structured.", n: "A CSV file and a spreadsheet are structured, even though CSV is plain text." },
      { h: "If not: are there tags, markers or header fields that label the parts?", m: "Yes → semi-structured.", n: "Email headers, XML tags, HTML tags, a zip file's index." },
      { h: "If not: is it free content — text, images, audio, video, mixed feeds?", m: "Yes → unstructured.", n: "Posts, videos, satellite images, voice recordings." }
    ] },
    { callout: { t: "tip", h: "Synoptic links", body: [
      "**F200 1.4** classifies data as structured / unstructured and qualitative / quantitative; **F200 1.3** covers XML, JSON and CSV as file formats.",
      "**F201 1.1** — **Variety** is the V this leaf describes; unstructured data drives **Veracity** problems.",
      "**F201 1.3** — each capture method generates a type: transactional records → structured; social media, images and video → unstructured.",
      "**F201 2.2** — every type needs preparing; unstructured text needs the most.",
      "**F201 2.4** — the type decides the store: relational database or warehouse for structured, NoSQL or a data lake for the rest.",
      "**F203** (relational database design) is structured data in depth; **F206** (digital marketing) lives on social media data."
    ] } },

    { page: "In exam questions" },
    { callout: { t: "info", h: "The scenario", body: "**Skyline Festivals** runs six outdoor music festivals across the UK each summer. It sells tickets online, takes card payments at the bars, monitors social media during each event and buys weather data for every site." } },
    { worked: { tag: "exam", title: "Two other examples of structured data", src: "OCR-style · State · 2 marks",
      q: "Skyline records every bar sale as transactional data, which is structured data. State two other examples of structured data.",
      steps: [
        { m: "Any two from:\n- continuous data (1)\n- discrete data (1)\n- relational database (1)\n- spreadsheet file data (1).", mk: "2", n: "Modelled on SAM Q3(c). One mark for each correct answer; correct answers only." },
        { m: "Do not accept: transactional data — it is already given in the question.", mk: "0", n: "The SAM's scheme rules this out in the same way. Read the stem for the example you must not repeat." }
      ], result: "e.g. relational database; spreadsheet file data" } },
    { worked: { tag: "exam", title: "Classify the festival's data", src: "OCR-style · Identify · 3 marks",
      q: "Skyline collects:\n- **(i)** bar card payments\n- **(ii)** videos that festival-goers post online\n- **(iii)** emails sent to its customer service team.\n\nIdentify the type of big data each one is.",
      steps: [
        { m: "(i) Structured (1).", mk: "1", n: "Each payment is a transaction with fixed fields." },
        { m: "(ii) Unstructured (1).", mk: "1", n: "Social media and entertainment data: no predefined model." },
        { m: "(iii) Semi-structured (1).", mk: "1", n: "Header fields are structured, the body is free text. Do not accept: unstructured." }
      ], result: "Structured · unstructured · semi-structured",
      "try": [{ notesOnly: true, grid: { cols: ["Skyline's data", "Type of big data"], rows: [
        ["Online ticket sales table", "structured"],
        ["Satellite images of each site", "unstructured"],
        ["XML feed from a ticket agent", "semi-structured"],
        ["Comments under the line-up post", "unstructured"],
        ["Staff rota in a spreadsheet", "structured"],
        ["Festival web pages", "semi-structured"],
        ["A zipped folder of press photos", "semi-structured"],
        ["Number of cars in each car park", "structured"]
      ], given: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]], cap: "Type one of: structured, semi-structured, unstructured." } }] } },
    { worked: { tag: "exam", title: "A benefit of weather data", src: "OCR-style · Explain · 2 marks",
      q: "Skyline buys weather data for each festival site. Explain one benefit to Skyline of using weather data.",
      steps: [
        { m: "Extreme weather can be identified in advance (1) so Skyline can secure stages or change opening times to keep festival-goers safe (1).", mk: "2", n: "Up to two marks for one benefit: identify (1) + application to Skyline (1). Modelled on the SAM's 2-mark Explain shape (Q3(b))." },
        { m: "OR: demand can be predicted (1) so bars stock more water and cold drinks in a heatwave and less stock is wasted (1).", mk: "", n: "Credit any other appropriate response. Maximum one benefit." }
      ], result: "Identify the benefit, then say what Skyline does with it" } },
    { worked: { tag: "exam", title: "A limitation of social media data", src: "OCR-style · Explain · 2 marks",
      q: "Skyline monitors social media posts during each festival. Explain one limitation to Skyline of using this unstructured data.",
      steps: [
        { m: "It is difficult to analyse because it has no predefined structure (1) so Skyline would need AI / natural language processing tools and specialist staff to find complaints in thousands of posts (1).", mk: "2", n: "One mark for the limitation, one for applying it to Skyline." },
        { m: "OR: the data may not be accurate — fake accounts, sarcasm or jokes (1) so Skyline could react to a problem that does not exist (1).", mk: "", n: "OR: large volumes need a lot of storage (1) so Skyline needs a data lake or more cloud storage (1). Maximum one limitation." }
      ], result: "Hard to analyse / low veracity, applied to the festival" } },
    { worked: { tag: "exam", title: "Why an email is semi-structured", src: "OCR-style · Explain · 2 marks",
      q: "Skyline's customer service team receives thousands of emails each week. Explain why emails are classed as semi-structured data.",
      steps: [
        { m: "Emails have header fields such as sender, date and subject that are organised and labelled (1).", mk: "1" },
        { m: "…but the body of the email is free text or images with no fixed structure (1).", mk: "1", n: "Both halves are needed for 2 marks: the structured part AND the unstructured part." }
      ], result: "Labelled headers + free-text body" } },
    lor6("the types of big data"),
    { worked: { tag: "exam", title: "Using all three types of data", src: "OCR-style · Analyse · 6 marks",
      q: "Skyline wants to improve the safety and experience of festival-goers. Analyse how Skyline could use structured, semi-structured and unstructured data to do this.",
      steps: [
        { m: "Structured: ticket and gate-scan data show how many people are on site and when, so stewards can be moved to busy entrances before queues build.", mk: "1", n: "Level 2 needs some points like this, each with a consequence for Skyline. Modelled on the SAM's 6-mark Analyse (Q2(c))." },
        { m: "Structured: bar transactions show what sells at each hour, so stock and staff can match demand and queues shorten.", mk: "1" },
        { m: "Semi-structured: customer emails before the event can be sorted by subject and content to find accessibility requests and plan facilities.", mk: "1" },
        { m: "Unstructured: social media posts during the event can be analysed for complaints (a crush at a stage, a broken water point), so staff respond in minutes.", mk: "1", n: "Real-time use of unstructured data is a strong Level 3 point." },
        { m: "Unstructured: weather data (satellite and radar) warns of storms or heat, so Skyline can secure structures or add shade and water.", mk: "1" },
        { m: "Weighed: unstructured data needs AI tools and is less reliable (fake posts), so it should trigger a check rather than a decision on its own; combining all three types gives the fullest picture.", mk: "1", n: "Level 3: a range of uses across all three types, explained in chains, with subject terms (structured, unstructured, sentiment, real time)." }
      ], result: "Level 3: uses of each type, each explained in context, weighed with a limitation" } },

    { page: "Exam toolkit" },
    { h: "The spec's lists — word for word" },
    { kv: [
      [
        "Structured (5)",
        "Continuous · Discrete · Relational database · Spreadsheet file data · Transactional data"
      ],
      ["Unstructured (2)", "Social media and entertainment data · Weather data"],
      ["Semi-structured (4)", "Emails · XML · Zipped files · Web pages"]
    ] },
    { callout: { t: "mnemonic", h: "Remember the lists", body: [
      "**Tables · Tags · Tangle** — structured is tables, semi-structured is tags, unstructured is a tangle.",
      "Structured: **C**ount **D**own **R**ows, **S**ee **T**otals → Continuous, Discrete, Relational database, Spreadsheet, Transactional.",
      "Semi-structured: **E**very e**X**pert **Z**ips **W**ebpages → Emails, XML, Zipped files, Web pages.",
      "Unstructured: **S**unny **W**eekend → Social media and entertainment, Weather."
    ] } },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "**“A CSV file is semi-structured because it is plain text.”** — No: it has fixed columns in every row, so it is **structured** (spreadsheet file data).",
      "**“Emails are unstructured.”** — The spec lists them as **semi-structured**: the header fields are labelled.",
      "**“Unstructured means random or useless.”** — It holds the richest information; it just has no predefined model, so it needs processing.",
      "**“Continuous and discrete are extra types.”** — They are **kinds of structured** (numeric) data in the spec.",
      "**Repeating the stem's example** — if the question says transactional data is structured, “transactional data” earns nothing as another example.",
      "**“Weather data is structured because it is numbers.”** — The spec lists it as **unstructured**; answer from the spec."
    ] } },
    { callout: { t: "tip", h: "How OCR marks it", body: [
      "**State / Identify** (1 mark each): the spec's term is enough — “relational database”, “XML”.",
      "**Describe** (1–2): the characteristic — “fixed rows and columns”, “tags that label the data”.",
      "**Explain** a benefit or limitation (2): identify (1) + apply to the scenario (1). One developed point only: a second is not marked.",
      "**Analyse** (6): several points, each in a chain — point → because → so for this organisation.",
      "Contradictory answers (calling the same data structured AND unstructured) score nothing.",
      "Use the exact spec wording: “spreadsheet file data”, “social media and entertainment data”."
    ] } },
    { kv: [
      ["Fixed schema", "Structured"],
      ["Tags / metadata / headers", "Semi-structured"],
      ["No model; needs AI", "Unstructured"],
      ["Counted / measured", "Discrete / continuous"]
    ] }
  ],
  flashcards: [
    ["Define the term structured data.", "Data organised to a fixed schema of rows and columns, each field with a set type — so it can be searched, sorted and queried directly (e.g. with SQL).", 0],
    ["Define the term unstructured data.", "Data with no predefined model or organisation (posts, video, satellite images) — it must be processed, often with AI, before it can be analysed.", 1],
    ["Define the term semi-structured data.", "Data with no rigid table but with tags or metadata that label its parts, so it is self-describing (emails, XML, web pages).", 2],
    ["How is unstructured data such as social media posts captured?", "From social media sites and streaming platforms (social media monitoring), cameras, phones and uploads; weather data from satellites, radar and sensors.", 3],
    ["Give one benefit and one limitation of structured data.", "Benefit: easy and fast to query and calculate on. Limitation: a rigid schema that can only hold data fitting its predefined fields.", 4],
    ["Give one benefit of semi-structured data over structured data.", "It is flexible — new tags or fields can be added without redesigning a schema, and its tags make it easy to exchange between systems.", 5],
    ["What is the difference between continuous and discrete data?", "Continuous is measured and can take any value in a range (temperature); discrete is counted and takes separate values (tickets bought).", 6],
    ["Which type of big data is an XML file, and why?", "Semi-structured — its tags label every value, but there is no fixed table and records need not share the same fields.", 7],
    ["Name the five kinds of structured data in the specification.", "Continuous, discrete, relational database, spreadsheet file data, transactional data.", 100],
    ["Name the two kinds of unstructured data in the specification.", "Social media and entertainment data, and weather data.", 101],
    ["Name the four kinds of semi-structured data in the specification.", "Emails, XML, zipped files, web pages.", 102],
    ["Why is an email semi-structured rather than unstructured?", "Its header fields (To, From, Date, Subject) are labelled and organised, while its body is free text.", 103],
    ["What is transactional data, and how is it captured?", "A record of each transaction — what was bought or booked, when, where, how much and by whom — captured by tills, card terminals and online checkouts.", 105],
    ["Give two limitations of unstructured data for an organisation.", "It is hard and slow to analyse (needs AI and specialist skills), and its veracity is low — fake accounts, sarcasm, spam.", 106],
    ["Which type of big data makes up most of the data in the world?", "Unstructured data — posts, images, video, audio and sensor feeds far outweigh tables.", 107],
    ["Why might a business still use unstructured data despite the difficulty?", "It holds rich, honest, real-time insight — opinions and trends that structured forms never collect.", 108],
    ["Which store suits each type of big data?", "Structured → relational database or data warehouse; semi-structured → NoSQL database or data lake; unstructured → data lake.", 109]
  ],
  quiz: [
    { q: "Which of these is semi-structured data?", opts: ["A relational database table", "An XML file of bookings", "A video posted online", "A spreadsheet of sales"], ans: 1, why: "XML uses tags that label each value, but has no fixed table — the spec lists it as semi-structured." },
    { q: "The number of people entering a gate each minute is…", opts: ["Continuous data", "Unstructured data", "Discrete data", "Semi-structured data"], ans: 2, why: "People are counted in whole numbers, so the data is discrete." },
    { q: "Where does the specification place weather data?", opts: ["Structured data", "Semi-structured data", "Transactional data", "Unstructured data"], ans: 3, why: "Weather data — satellite and radar images, mixed sensor feeds — is listed under unstructured." },
    { q: "Which is a limitation of structured data?", opts: ["Its schema is rigid and fixed", "It cannot be queried with SQL", "It needs AI to be analysed", "It has no data types at all"], ans: 0, why: "A fixed schema means only data that fits the predefined fields can be stored." },
    { q: "A delivery time recorded as 2.35 hours is…", opts: ["Discrete data", "Continuous data", "Semi-structured data", "Unstructured data"], ans: 1, why: "Time is measured and can take any value in a range, so it is continuous." },
    { q: "Which part of an email gives it its structure?", opts: ["The message body", "The attached images", "The header fields", "The signature text"], ans: 2, why: "Labelled header fields (To, From, Date, Subject) make an email semi-structured." },
    { q: "A question says transactional data is structured. Which is NOT credited as another example?", opts: ["Relational database", "Spreadsheet file data", "Discrete data", "Transactional data"], ans: 3, why: "Repeating the example in the stem earns nothing (SAM Q3(c): do not accept transactional data)." },
    { q: "Which benefit belongs to unstructured data?", opts: ["Rich, real-world insight", "Fast SQL querying", "Validation at input", "Compact fixed fields"], ans: 0, why: "Unstructured data holds opinions, images and context; the other three are benefits of structured data." },
    { q: "Why is a zipped file semi-structured?", opts: ["It is always plain text", "Its index labels each file", "It has no structure at all", "It is stored in tables"], ans: 1, why: "The archive's index lists each file's name, size and date; the contents can be anything." },
    { q: "Which is usually needed to analyse thousands of social media posts?", opts: ["A spreadsheet formula", "A relational join", "A barcode scanner", "Language processing (AI)"], ans: 3, why: "Free text has no structure; natural language processing, a kind of AI, finds topics and sentiment in it." }
  ]
};

/* @@NEXT@@ */

/* =====================================================================
   F201.2.2  Data preparation and cleaning techniques for data mining
   ===================================================================== */
function wrangleFig() {
  var it = [];
  it.push(txt(70, 14, "Raw sources", { b: true, size: 11.5, c: "text" }));
  it = it.concat(box(10, 26, 120, 38, ["Practice A", "database"], { c: "muted", a: 0.1 }), box(10, 74, 120, 38, ["Practice B", "spreadsheets"], { c: "muted", a: 0.1 }), box(10, 122, 120, 38, ["Online bookings", "XML feed"], { c: "muted", a: 0.1 }));
  it = it.concat(arrow(132, 45, 168, 92), arrow(132, 93, 168, 93), arrow(132, 141, 168, 94));
  it.push({ poly: [[172, 22], [478, 22], [478, 168], [172, 168]], fill: "accent", alpha: 0.06, c: "accent", w: 1.3, dash: true });
  it.push(txt(325, 14, "Data wrangling", { b: true, size: 11.5, c: "accent" }));
  var st = [["Discover", "what is there?"], ["Structure", "one layout"], ["Clean", "the 8 techniques"], ["Enrich", "add useful data"], ["Validate", "check the rules"], ["Publish", "hand it on"]];
  st.forEach(function (s, i) {
    var x = 182 + (i % 3) * 98, y = 34 + Math.floor(i / 3) * 68;
    it = it.concat(box(x, y, 88, 50, s, { c: i === 2 ? "accent2" : "accent", a: i === 2 ? 0.22 : 0.13, size: 11, size2: 9.5 }));
    if (i % 3 !== 2) it = it.concat(arrow(x + 88, y + 25, x + 98, y + 25, "", { w: 1.3 }));
  });
  it = it.concat(arrow(350, 100, 392, 86, "", { c: "muted", dash: true, w: 1.1 }));
  it = it.concat(arrow(480, 95, 506, 95));
  it = it.concat(box(510, 60, 120, 70, ["Clean, consistent", "dataset", "ready to mine"], { c: "accent3", a: 0.18 }));
  it.push(txt(570, 150, "→ data mining (2.3)", { size: 10.5, c: "accent3" }));
  it.push(txt(325, 186, "It loops: validation that fails sends the data back to be cleaned again.", { size: 10.5, c: "text2" }));
  return { fig: { w: 640, h: 200, items: it, cap: "Data wrangling turns raw data from one or more sources into a format that can be analysed. Cleaning is one stage of it; the six stage names are a common way to describe the work, not a list the spec asks you to learn." } };
}
function recordsFig() {
  var it = [], cols = ["Pet ID", "Owner", "Phone", "Weight kg", "Last visit"], w = [62, 128, 116, 82, 92];
  var rows = [
    ["P1043", "Ann Hughes", "07700 900123", "12.5", "03/02/2026"],
    ["P2210", "Bryn Jones", "", "31.0", "11/01/2026"],
    ["P1043", "Ann Hughes", "07700 900123", "12.5", "03/02/2026"],
    ["P3307", "Chen Li", "07700 900456", "640", "20/01/2026"],
    ["P4011", "dev@pmail.uk", "07700 900789", "8.1", "05/02/2026"]
  ];
  [cols].concat(rows).forEach(function (r, ri) {
    var x = 30;
    r.forEach(function (v, ci) {
      var y = 8 + ri * 26;
      it.push({ poly: [[x, y], [x + w[ci], y], [x + w[ci], y + 26], [x, y + 26]], fill: ri === 0 ? "it" : "line", alpha: ri === 0 ? 0.22 : 0.05, c: "line", w: 1 });
      it.push(txt(x + w[ci] / 2, y + 13, v, { size: 10.5, b: ri === 0, c: "text" }));
      x += w[ci];
    });
  });
  it.push(txt(16, 21 + 26, "1", { size: 10 }), txt(16, 21 + 52, "2", { size: 10 }), txt(16, 21 + 78, "3", { size: 10 }), txt(16, 21 + 104, "4", { size: 10 }), txt(16, 21 + 130, "5", { size: 10 }));
  return { w: 520, h: 170, items: it, cap: "Five of the merged records." };
}

C["it:F201.2.2"] = {
  notes: [
    { h: "Data preparation and cleaning — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (F201 2.2)", body: [
      "**To include:** the purpose of preparing data · how the different types of data can be prepared · what data wrangling is · how it is used · the purpose of cleaning · when to use each technique · the benefits and limitations of each.",
      "**Does not include:** the technical details of each cleaning technique — no code, formulas or tool menus.",
      "**Exam evidence:** SAM Q1(c) (identify three cleaning techniques for a table of records, 3 marks) and Q1(d) (a cloze on what data wrangling is, 3 marks)."
    ] } },
    { kv: [
      ["Data preparation", "numeric data · textual data"],
      ["Data wrangling", "what it is and how it is used to prepare data"],
      [
        "Data cleaning techniques",
        "removing duplicates · removing irrelevant data · converting data type · clear formatting · fix structural errors · language translation · fix missing data · validate data"
      ]
    ] },
    { ol: ["**Data preparation** — purpose; numeric and textual data.", "**Data wrangling** — what it is and how it is used.", "**Cleaning: four techniques** — duplicates, irrelevant data, data type, formatting.", "**Cleaning: four more** — structural errors, translation, missing data, validation.", "**In exam questions** — worked answers in OCR's format.", "**Exam toolkit** — the list, traps, mnemonic and links."] },
    wrangleFig(),

    { page: "Data preparation" },
    { callout: { t: "def", h: "Data preparation", body: "Getting raw data into a **consistent, accurate, complete and usable** form before it is mined and analysed. It covers finding, combining, cleaning and formatting the data." } },
    { callout: { t: "key", h: "The purpose of preparing data", body: [
      "**Reliable results** — analysis is only as good as its input (**garbage in, garbage out**).",
      "**Consistency** — data from different sources can be combined and compared.",
      "**Usability** — tools can read it: numbers stored as numbers, dates as dates.",
      "**Efficiency** — less data to store and process once the irrelevant is removed.",
      "**Better decisions** — managers can trust the figures they act on."
    ] } },
    { table: { head: ["Numeric data — how it is prepared", "Example"], rows: [
      ["Use **one unit** throughout", "Weights all in kg, not a mix of kg and lb."],
      ["Store values **as numbers**, without symbols", "“£1,250.00” → 1250 so it can be totalled."],
      ["Use **consistent precision** (decimal places, rounding)", "Every price to 2 dp."],
      ["Use **one date and time format**", "All dates DD/MM/YYYY, all times 24-hour."],
      ["Check **outliers** — extreme values", "A 640 kg cat is an error; a 640 kg horse is not."],
      ["**Group** values into ranges where useful", "Ages 0–2, 3–7, 8+ for a pet-age analysis."],
      ["Put fields on a **common scale** where they are compared", "So a large-number field does not swamp a small one."]
    ] } },
    { table: { head: ["Textual data — how it is prepared", "Example"], rows: [
      ["Use **consistent case**", "“CARDIFF”, “cardiff” → “Cardiff”."],
      ["**Trim** extra spaces and stray characters", "“ Ann  Hughes ” → “Ann Hughes”."],
      ["**Standardise** spellings and abbreviations", "“Rd”, “Road”, “road.” → “Road”."],
      ["**Correct spelling** mistakes", "“Labrdor” → “Labrador”."],
      ["Remove **punctuation and filler words** before text analysis", "Keeps the words that carry the meaning."],
      ["Split text into **words or phrases**", "So each word can be counted or scored for sentiment."],
      ["**Code** free text into categories", "“limping”, “sore leg” → category: lameness."],
      ["**Translate** into one language", "Welsh-language reviews → English for analysis."]
    ] } },
    { callout: { t: "warn", h: "Know the purpose, not the mechanics", body: "The spec rules out technical detail. Say **what** is done and **why** (“dates converted to one format so they can be sorted and compared”), not how a tool does it." } },

    { page: "Data wrangling" },
    { callout: { t: "def", h: "Data wrangling", body: "The process of **transforming and preparing raw data from one or more sources into a format that can be analysed** or used by a computer system or application. It is **time-consuming** but **essential for reliable results**. Also called **data munging**." } },
    { kv: [
      ["Wrangling vs cleaning", "**Cleaning** fixes what is wrong (duplicates, gaps, errors). **Wrangling** is the wider job — combining, restructuring, cleaning, enriching and checking — that ends with data ready to analyse."],
      ["Where it sits", "Between **data storing** and **data mining** in the six steps of big data analysis (F201 1.1) — it covers the **data cleaning** step and more."]
    ] },
    { steps: [
      { h: "Discover", m: "Look at what the data holds — fields, formats, gaps, sources.", n: "PawsCare finds Practice B records weights in pounds." },
      { h: "Structure", m: "Reshape it into one layout — the same fields in the same order.", n: "“Full name” split into first name and family name to match Practice A." },
      { h: "Clean", m: "Apply the cleaning techniques — duplicates, missing values, errors.", n: "The eight techniques on the next two pages." },
      { h: "Enrich", m: "Add data that makes it more useful.", n: "Add each owner's region from their postcode." },
      { h: "Validate", m: "Check the result follows the rules and makes sense.", n: "Every weight in a sensible range for its species." },
      { h: "Publish", m: "Store the prepared data for analysts or the mining software.", n: "Load it into the data warehouse (F201 2.4)." }
    ] },
    { h: "How wrangling is used — and its benefits and limitations" },
    { table: { head: ["Benefits", "Limitations"], rows: [
      [
        "Combines **several sources into one** consistent dataset.",
        "**Time-consuming** — often most of an analytics project's time."
      ],
      [
        "Gives **reliable, accurate results** from analysis.",
        "Needs **skilled staff** who understand the data."
      ],
      [
        "Makes data **usable by software** (the right types and layout).",
        "Mistakes made while wrangling **carry into every result**."
      ],
      [
        "Can be **automated** and repeated as new data arrives.",
        "Must be **repeated** whenever sources or formats change."
      ]
    ] } },
    { worked: { tag: "example", title: "Wrangling two vet systems", q: "PawsCare, a chain of 60 vet practices, has bought another chain. Its records are in a database; the other chain's are in spreadsheets. Describe how data wrangling would let PawsCare analyse all its patients together.",
      steps: [
        { m: "Bring the **raw data** from both systems together and **discover** how each is laid out.", mk: "✓" },
        { m: "**Restructure** the spreadsheets to the database's fields and **clean** them — one weight unit, one date format, duplicates removed.", mk: "✓" },
        { m: "**Validate** the merged data and load it where it can be **analysed** — giving **reliable** results across all practices.", mk: "✓", n: "Raw → formatted for analysis → reliable: the three ideas OCR's definition is built on." }
      ], result: "Raw data from both sources → one analysable, reliable dataset" } },

    { page: "Cleaning: four techniques" },
    { callout: { t: "def", h: "Data cleaning", body: "Finding and **fixing or removing data that is incorrect, incomplete, duplicated, irrelevant or wrongly formatted**. Its **purpose** is to make the data accurate and consistent so that mining and analysis give **reliable** results and decisions are not based on errors." } },
    { table: { head: ["Technique", "What it does", "When to use it"], rows: [
      ["**Removing duplicates**", "Deletes or merges records that appear more than once.", "Data is merged from several sources, or a customer registered twice."],
      ["**Removing irrelevant data**", "Takes out fields or records the analysis does not need.", "Columns or rows that do not answer the question being asked (fax numbers; records outside the period)."],
      ["**Converting data type**", "Changes values to the correct type — text to number, text to date, Yes/No to Boolean.", "Numbers or dates are stored as text, so they cannot be calculated or sorted."],
      ["**Clear formatting**", "Removes formatting from the source — bold, colours, merged cells, hyperlinks, hidden characters, HTML tags.", "Data comes from documents, spreadsheets or web pages in different formats that tools cannot read cleanly."]
    ] } },
    { h: "Benefits and limitations — the first four" },
    { table: { head: ["Technique", "Benefit", "Limitation"], rows: [
      [
        "Removing duplicates",
        "Counts and totals are not inflated; each customer is contacted once.",
        "Two genuine records can look alike (two pets with one name) and one is wrongly deleted."
      ],
      [
        "Removing irrelevant data",
        "Smaller, faster dataset; less personal data held (data minimisation under UK GDPR).",
        "Data judged irrelevant now may be needed for a later question."
      ],
      [
        "Converting data type",
        "Values can be calculated, sorted and compared correctly.",
        "A value that will not convert (“twelve”) is lost or must be fixed by hand."
      ],
      [
        "Clear formatting",
        "Every source arrives as plain, uniform values the software can process.",
        "Meaning carried by formatting (red = overdue) is lost unless recorded in a field first."
      ]
    ] } },

    { page: "Cleaning: four more" },
    { table: { head: ["Technique", "What it does", "When to use it"], rows: [
      ["**Fix structural errors**", "Corrects typos, inconsistent naming and capitalisation, mislabelled categories and values in the wrong field.", "“Lab”, “labrador”, “Labrador” all mean one breed; an email address in the name column; “N/A” and “Not applicable” both used."],
      ["**Language translation**", "Translates text into one language.", "Reviews, emails or posts arrive in several languages but the analysis (or the AI model) works in one."],
      ["**Fix missing data**", "Deals with blanks: **remove** the record, **fill** it (from the source, or with an estimate such as the average), or **flag** it as missing.", "Fields were left empty, lost in transfer, or never collected by one source."],
      ["**Validate data**", "Checks data against rules — range, type, format, presence, length, lookup.", "Before analysis, to catch impossible or unreasonable values (a 640 kg cat, a date of 31/02)."]
    ] } },
    { h: "Benefits and limitations — the second four" },
    { table: { head: ["Technique", "Benefit", "Limitation"], rows: [
      [
        "Fix structural errors",
        "Categories group correctly, so counts per category are right.",
        "Needs rules or knowledge of the data; some errors are hard to spot."
      ],
      [
        "Language translation",
        "All customers' views are included, not just one language's.",
        "Machine translation can lose meaning, slang and tone (sarcasm)."
      ],
      [
        "Fix missing data",
        "Keeps records usable; totals and averages are not distorted by blanks.",
        "Removing records shrinks the data and may bias it; filled-in estimates are not real values."
      ],
      [
        "Validate data",
        "Errors are caught before they reach results; confidence in the data rises.",
        "Validation shows data is **reasonable**, not **correct** — a valid but wrong phone number passes."
      ]
    ] } },
    { h: "Cleaning as a whole — benefits and limitations" },
    { table: { head: ["Benefits", "Limitations"], rows: [
      ["Accurate, reliable analysis and decisions.", "Time-consuming and needs skilled staff."],
      [
        "Consistent data that combines across sources.",
        "Over-cleaning can delete or change genuine data."
      ],
      ["Less storage and faster processing.", "Never finished: new data keeps arriving dirty."],
      [
        "Fewer embarrassing errors (two letters to one customer).",
        "Automated rules can introduce new, systematic errors."
      ]
    ] } },
    { worked: { tag: "example", title: "Pick the technique", q: "Which cleaning technique fixes each problem?\n- **(a)** Weights typed as “12.5kg” in a number field.\n- **(b)** “Swansea”, “swansea” and “SWANSEA” in the town field.\n- **(c)** A blank date of last visit.",
      steps: [
        { m: "(a) **Converting data type** — the text must become a number (12.5) before averages can be worked out.", mk: "✓" },
        { m: "(b) **Fix structural errors** — inconsistent capitalisation splits one town into three groups.", mk: "✓" },
        { m: "(c) **Fix missing data** — find it from the practice's records, or flag it as missing.", mk: "✓", n: "Name the technique in the spec's words; that is what earns the mark." }
      ], result: "Converting data type · fix structural errors · fix missing data" } },

    { page: "In exam questions" },
    { callout: { t: "info", h: "The scenario", body: "**PawsCare** runs 60 vet practices in England and Wales. It has bought another chain and is merging the two sets of pet and owner records so it can mine them for patterns in illness, visits and spending." } },
    { worked: { tag: "exam", title: "Three cleaning techniques for the records", src: "OCR-style · Identify · 3 marks",
      q: "PawsCare's merged records will be cleaned before they are mined. Five of the records are shown. Identify three data cleaning techniques that need to be carried out on these records.",
      fig: recordsFig(),
      steps: [
        { m: "Removing duplicates (1) — records 1 and 3 are the same.", mk: "1", n: "Modelled on SAM Q1(c). One mark for each correct technique; the reason is not needed for the mark but shows you read the table." },
        { m: "Fix missing data (1) — record 2 has no phone number.", mk: "1" },
        { m: "Fix structural errors (1) — record 5 has an email address in the Owner field.", mk: "1" },
        { m: "Validate data (1) — record 4's weight of 640 kg is out of range for a pet.", mk: "", n: "Any three of the four. Credit any other appropriate technique that fits a record." }
      ], result: "Removing duplicates · fix missing data · fix structural errors (or validate data)",
      "try": [{ notesOnly: true, grid: { cols: ["Problem in PawsCare's data", "Cleaning technique"], rows: [
        ["The same pet appears twice with identical details", "removing duplicates"],
        ["A column of owners' fax numbers no one will analyse", "removing irrelevant data"],
        ["Weights stored as text, so they cannot be averaged", "converting data type"],
        ["Imported cells in bold, coloured and merged", "clear formatting"],
        ["“Labrador”, “labrador” and “Lab” for one breed", "fix structural errors"],
        ["Reviews from Cardiff practices written in Welsh", "language translation"],
        ["Several records have no date of last visit", "fix missing data"],
        ["A dog's age recorded as 87 years", "validate data"]
      ], given: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]], cap: "Type the technique's name as the spec words it: removing duplicates, removing irrelevant data, converting data type, clear formatting, fix structural errors, language translation, fix missing data, validate data." } }] } },
    { worked: { tag: "exam", title: "What data wrangling is", src: "OCR-style · Complete · 3 marks",
      q: "Complete the sentences about data wrangling using words from the list: `raw`, `consistent`, `analysed`, `deleted`, `encrypted`, `accurate`.\n\nData wrangling takes **(1)** ____ data from different sources and changes it into a **(2)** ____ format so that it can be **(3)** ____ by software. It takes time, but the results are more reliable.",
      steps: [
        { m: "(1) raw (1)", mk: "1", n: "Modelled on SAM Q1(d), with our own sentences. Correct answers only." },
        { m: "(2) consistent (1)", mk: "1" },
        { m: "(3) analysed (1)", mk: "1", n: "“Deleted” and “encrypted” are the traps: wrangling prepares data for use, it does not remove or secure it." }
      ], result: "raw · consistent · analysed",
      "try": [{ grid: { cols: ["Gap", "Word"], rows: [["(1)", "raw"], ["(2)", "consistent"], ["(3)", "analysed"]], given: [[0, 0], [1, 0], [2, 0]], cap: "Choose from: raw, consistent, analysed, deleted, encrypted, accurate." } }] } },
    { worked: { tag: "exam", title: "Two ways to prepare textual data", src: "OCR-style · State · 2 marks",
      q: "PawsCare's records include vets' free-text notes. State two ways textual data can be prepared before it is analysed.",
      steps: [
        { m: "Any two from:\n- make the case consistent (1)\n- remove extra spaces and stray characters (1)\n- standardise spellings and abbreviations (1)\n- correct spelling mistakes (1)\n- code free text into categories (1)\n- translate into one language (1).", mk: "2", n: "One mark each. Credit any other appropriate response." }
      ], result: "e.g. consistent case; standardised spellings" } },
    { worked: { tag: "exam", title: "A benefit and a limitation of fixing missing data", src: "OCR-style · Explain · 4 marks",
      q: "Some of PawsCare's records have no weight. The data team plans to fill each blank with the average weight for that breed. Explain one benefit and one limitation to PawsCare of fixing missing data in this way.",
      steps: [
        { m: "Benefit: the records are kept rather than deleted (1) so PawsCare's analysis still includes those pets and the dataset stays large (1).", mk: "2", n: "Identify (1) + application to PawsCare (1). Maximum one benefit." },
        { m: "Limitation: the filled-in weights are estimates, not real values (1) so an analysis of, say, overweight dogs could under-count them and PawsCare could draw the wrong conclusion (1).", mk: "2", n: "OR: it hides how much data was really missing (1) so managers trust the results more than they should (1). Maximum one limitation." }
      ], result: "Keeps records usable · but the values are estimates" } },
    lor6("data preparation and cleaning"),
    { worked: { tag: "exam", title: "Why prepare and clean before mining", src: "OCR-style · Analyse · 6 marks",
      q: "PawsCare wants to mine the merged records to find which illnesses are rising in each region. Analyse the impact on PawsCare of preparing and cleaning the data before it is mined.",
      steps: [
        { m: "Removing duplicates stops the same pet being counted twice, so illness rates per region are not inflated and resources go where they are really needed.", mk: "1", n: "Level 2: some points with an impact for PawsCare." },
        { m: "Fixing structural errors (one name per illness and breed) means cases group correctly, so a rising illness is not hidden across three spellings.", mk: "1" },
        { m: "Converting weights to one unit and type lets them be compared across both chains, so links between weight and illness are found.", mk: "1" },
        { m: "Translating Welsh-language notes includes the Welsh practices, so the regional picture is complete.", mk: "1" },
        { m: "The cost: wrangling is time-consuming and needs skilled staff, so the analysis starts later, and filling or removing records can bias the results if done badly.", mk: "1", n: "Weighing a limitation lifts the answer: analysis means impacts both ways." },
        { m: "Overall: reliable results depend on it — mining dirty data would give wrong patterns and poor decisions (garbage in, garbage out), so the time is worth spending.", mk: "1", n: "Level 3: a range of techniques, each with a clear impact on PawsCare, terminology throughout, and a reasoned view." }
      ], result: "Level 3: several techniques, each with its impact on PawsCare, weighed against the time and risk" } },

    { page: "Exam toolkit" },
    { callout: { t: "memorise", h: "The eight cleaning techniques — the spec's words", body: [
      "Removing duplicates",
      "Removing irrelevant data",
      "Converting data type",
      "Clear formatting",
      "Fix structural errors",
      "Language translation",
      "Fix missing data",
      "Validate data"
    ] } },
    { callout: { t: "mnemonic", h: "Remember the eight", body: [
      "**D**ogs **I**n **T**he **F**ield **S**niff **L**ost **M**uddy **V**ets → Duplicates, Irrelevant, Type, Formatting, Structural, Language, Missing, Validate.",
      "Wrangling's three cloze words: **Raw** in → **Analysed** by software → **Reliable** results."
    ] } },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "**“Wrangling and cleaning are the same.”** — Cleaning is **part of** wrangling; wrangling also combines, restructures, enriches and checks.",
      "**“Cleaning is done once.”** — New data keeps arriving with new errors; it is repeated for every load.",
      "**“Validation proves data is correct.”** — It proves data is **reasonable** (in range, right format). A wrong but sensible value passes.",
      "**“Delete every record with a gap.”** — That is only one way to fix missing data, and it can shrink and bias the dataset.",
      "**“Clear formatting means making the formats the same.”** — It means **removing** source formatting (bold, colours, merged cells, tags); making spellings or categories consistent is **fixing structural errors**.",
      "**Describing how a tool works** — the spec excludes technical detail; marks are for what and why."
    ] } },
    { callout: { t: "tip", h: "How OCR marks it", body: [
      "**Identify** techniques from a table (1 each): look for a repeated row, a blank, a value in the wrong field, an impossible value, text where a number should be.",
      "Use the **spec's names** — “fix missing data”, not “fill in the gaps”.",
      "**Complete** (cloze): correct answers only; check each word fits the grammar of the sentence.",
      "**Explain** a benefit/limitation (2 each): identify (1) + what it means for this organisation (1).",
      "If the question asks for three techniques, only the first three are marked."
    ] } },
    { callout: { t: "tip", h: "Synoptic links", body: [
      "**F200 2.4** — the purpose and importance of data wrangling; **F200 2.2** — validation, verification, accuracy and the other data assurance considerations.",
      "**F201 1.1** — **data cleaning** is the third of the six steps; **Veracity** is the V that cleaning improves.",
      "**F201 2.1** — unstructured text needs the most preparation; structured data the least.",
      "**F201 2.3** — clean data is what data mining works on.",
      "**F201 2.4** — data integration platforms automate wrangling; a data warehouse stores the cleaned result.",
      "**F201 4.1** — removing irrelevant personal data supports UK GDPR's data minimisation principle.",
      "**F202 / F203** — validation rules in spreadsheets and databases."
    ] } }
  ],
  flashcards: [
    ["What is the purpose of data preparation?", "To get raw numeric and textual data into a consistent, accurate, usable state so analysis gives reliable results (garbage in, garbage out).", 0],
    ["What is data wrangling?", "Transforming and preparing raw data from one or more sources into a format that can be analysed or used by a system — time-consuming but essential for reliable results.", 1],
    ["When should you use the technique of removing duplicates?", "When the same record appears more than once — after merging sources or a double registration — so counts are not inflated.", 2],
    ["Give two ways to fix missing data.", "Remove the record, fill the value (from the source or with an estimate such as an average), or flag it as missing.", 3],
    ["What does the validate data technique check?", "That values meet rules — range, type, format, presence, length, lookup — e.g. a pet's weight in a sensible range.", 5],
    ["Give one benefit and one limitation of data cleaning.", "Benefit: accurate, reliable analysis. Limitation: time-consuming and never finished — new data arrives dirty.", 6],
    ["Why is language translation a cleaning technique?", "Text arrives in several languages but the analysis or AI model works in one; translating includes everyone's data.", 7],
    ["List the eight cleaning techniques in the specification.", "Removing duplicates, removing irrelevant data, converting data type, clear formatting, fix structural errors, language translation, fix missing data, validate data.", 100],
    ["When would you use converting data type?", "When numbers or dates are stored as text (“12.5”, “03/02/2026” as a string), so they cannot be calculated or sorted.", 102],
    ["Give two examples of a structural error in data.", "Inconsistent naming or capitalisation (“Lab”, “labrador”), and a value in the wrong field (an email in the Name column).", 103],
    ["Give two ways numeric data can be prepared.", "Use one unit throughout, and store values as numbers without symbols (“£1,250” → 1250); also one date format, consistent decimal places.", 104],
    ["Give two ways textual data can be prepared.", "Make the case consistent and standardise spellings and abbreviations; also trim spaces, correct spellings, code into categories, translate.", 105],
    ["What is one limitation of removing irrelevant data?", "Data judged irrelevant now may be needed for a later question, and once deleted it is gone.", 106],
    ["Why can validation not guarantee that data is correct?", "It only checks that data is reasonable (in range, right format); a sensible but wrong value still passes.", 107],
    ["How is data wrangling different from data cleaning?", "Cleaning fixes errors; wrangling is the wider process — combining, restructuring, cleaning, enriching, validating — that ends with data ready to analyse.", 108]
  ],
  quiz: [
    { q: "A table holds “Cardiff”, “cardiff” and “CARDIFF”. Which technique is needed?", opts: ["Fix structural errors", "Removing duplicates", "Language translation", "Clear formatting"], ans: 0, why: "Inconsistent capitalisation is a structural error: one town is split into three groups." },
    { q: "Prices are stored as text, so they cannot be totalled. Which technique is needed?", opts: ["Validate data", "Converting data type", "Fix missing data", "Removing duplicates"], ans: 1, why: "The values must become numbers before they can be calculated on." },
    { q: "Which word completes the definition: wrangling transforms ___ data into a format that can be analysed?", opts: ["encrypted", "deleted", "raw", "archived"], ans: 2, why: "Wrangling starts with raw data from one or more sources (SAM Q1(d))." },
    { q: "Which is a limitation of filling a blank with the average value?", opts: ["The record has to be deleted", "The dataset gets smaller", "It needs a second language", "The value is only an estimate"], ans: 3, why: "An average is not the real value, so analysis built on it can be distorted." },
    { q: "A customer's age is recorded as 187. Which technique catches this?", opts: ["Validate data", "Clear formatting", "Language translation", "Removing irrelevant data"], ans: 0, why: "A range check during validation flags an impossible value." },
    { q: "What does clear formatting remove?", opts: ["Duplicate customer records", "Bold, colours and merged cells", "Records with missing values", "Fields nobody will analyse"], ans: 1, why: "Clear formatting strips formatting carried over from source documents, leaving plain values." },
    { q: "Why does removing irrelevant data help with UK GDPR?", opts: ["It encrypts the personal data", "It translates the personal data", "It holds less personal data", "It proves the data is correct"], ans: 2, why: "Holding only what is needed supports the data minimisation principle." },
    { q: "Which is the best description of the purpose of data cleaning?", opts: ["To make data look more attractive", "To store data in the cloud", "To speed up the internet link", "To make results reliable"], ans: 3, why: "Cleaning removes errors so mining and analysis give reliable results." },
    { q: "Which statement about cleaning is true?", opts: ["It is repeated as new data arrives", "It is done once, then never again", "It proves every value is correct", "It is only needed for numbers"], ans: 0, why: "New data keeps arriving with new errors, so cleaning is an ongoing process." },
    { q: "Which is cleaning, rather than the wider job of wrangling?", opts: ["Combining two sources", "Removing a duplicate", "Adding a region field", "Loading the warehouse"], ans: 1, why: "Removing duplicates is a cleaning technique; combining, enriching and publishing are other parts of wrangling." }
  ]
};

/* =====================================================================
   F201.2.3  Data mining techniques
   ===================================================================== */
function ladderFig() {
  var it = [];
  it.push({ line: [[50, 230], [620, 230]], arrow: true, c: "muted", w: 1.4 });
  it.push({ line: [[50, 230], [50, 14]], arrow: true, c: "muted", w: 1.4 });
  it.push(txt(335, 250, "difficulty, data and skill needed →", { size: 10.5, c: "text2" }));
  it.push(txt(26, 122, "value", { size: 10.5, c: "text2" }));
  it.push(txt(26, 136, "to the", { size: 10.5, c: "text2" }));
  it.push(txt(26, 150, "business", { size: 10.5, c: "text2" }));
  var steps = [
    ["Descriptive", "What happened?", "hindsight", "accent"],
    ["Diagnostic", "Why did it happen?", "insight", "accent2"],
    ["Predictive", "What will happen?", "foresight", "accent3"],
    ["Prescriptive", "What should we do?", "best action", "it"]
  ];
  steps.forEach(function (s, i) {
    var x = 62 + i * 138, h = 52 + i * 44, y = 228 - h;
    it.push({ poly: [[x, y], [x + 128, y], [x + 128, 228], [x, 228]], fill: s[3], alpha: 0.16, c: s[3], w: 1.3 });
    it.push(txt(x + 64, y + 16, s[0], { b: true, size: 11.5, c: "text" }));
    it.push(txt(x + 64, y + 32, s[1], { size: 10.5, c: "text2" }));
    it.push(txt(x + 64, y - 10, s[2], { size: 10.5, c: s[3], b: true }));
  });
  return { fig: { w: 640, h: 262, items: it, cap: "The four data mining techniques as a staircase: each step answers a harder question, gives more value and needs more data, tools and skill. Each builds on the one before — you cannot prescribe well without a good prediction." } };
}

C["it:F201.2.3"] = {
  notes: [
    { h: "Data mining techniques — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (F201 2.3)", body: [
      "**To include:** what data mining is · the role of data mining techniques in analysing big data · the characteristics of each technique · when each can be used · the benefits and limitations to organisations of each.",
      "**Does not include:** coding details."
    ] } },
    { kv: [
      ["Data mining", "what it is and its role in analysing big data"],
      ["Data mining techniques", "descriptive · diagnostic · predictive · prescriptive"]
    ] },
    { ol: ["**What data mining is** — definition, role, what it finds.", "**Descriptive and diagnostic** — looking back.", "**Predictive and prescriptive** — looking forward.", "**Choosing a technique** — the four side by side.", "**In exam questions** — worked answers in OCR's format.", "**Exam toolkit** — the questions each answers, traps and links."] },
    ladderFig(),

    { page: "What data mining is" },
    { callout: { t: "def", h: "Data mining", body: "The process of **exploring large datasets** with statistics, algorithms and machine learning to **discover hidden patterns, trends, relationships and anomalies**, turning the data into **useful information for decision-making**. Sometimes called knowledge discovery in data." } },
    { callout: { t: "key", h: "The role of data mining techniques in analysing big data", body: [
      "**Scale** — finds patterns in data far too large for people to read (millions of rows, every second).",
      "**Hidden patterns** — reveals links nobody thought to look for.",
      "**From data to decisions** — turns stored data into information managers can act on.",
      "**Its place** — step 4 of the six steps (collection → storing → cleaning → **mining** → analysis → consumption, F201 1.1); it needs clean data and feeds the analysis.",
      "**Choice of technique** — each of the four answers a different question about the business."
    ] } },
    { table: { head: ["What mining looks for", "Example in an energy company"], rows: [
      ["**Trends** over time", "Gas use per home falling year on year."],
      ["**Associations** — things that occur together", "Customers with smart meters also use the app more."],
      ["**Groups** of similar records", "Homes with similar daily use patterns."],
      ["**Anomalies** — records unlike the rest", "A meter whose readings suddenly drop to zero (a fault or tampering)."],
      ["**Relationships** between variables", "Colder days → higher demand."]
    ] } },
    { kv: [
      ["Benefits of data mining", "Finds patterns humans would miss · works on huge volumes quickly · supports evidence-based decisions · spots fraud and faults early · can be automated."],
      ["Limitations of data mining", "Only as good as the data (needs cleaning first) · needs skilled staff and tools · can find patterns that are coincidence · privacy and UK GDPR concerns when mining personal data."]
    ] },

    { page: "Descriptive and diagnostic" },
    { callout: { t: "def", h: "Descriptive data mining", body: "Summarises **historical data** to show **what happened** (and what is happening now) — totals, averages, counts, percentages, reports and dashboards." } },
    { kv: [
      ["Characteristics", "Looks back · summarises rather than explains · the simplest and most common technique · outputs reports, charts, KPIs and dashboards."],
      ["When it can be used", "Monthly sales or usage reports · KPI dashboards · comparing regions or periods · answering “how many”, “how much”, “when”."],
      ["Example", "BrightVolt's report: average household electricity use by region, last winter."]
    ] },
    { table: { head: ["Benefits to organisations", "Limitations to organisations"], rows: [
      ["**Easy to understand** — managers read it at a glance.", "Says **what** happened, **not why** or what will happen next."],
      ["**Quick** to produce; often automated in dashboards.", "Only as accurate as the data summarised."],
      ["A **clear picture of performance** against targets.", "Large reports can **overwhelm** with figures."],
      ["A **baseline** for the other three techniques.", "Looks backwards — no advice on what to do."]
    ] } },
    { callout: { t: "def", h: "Diagnostic data mining", body: "Examines data in more depth to find **why something happened** — drilling down, comparing segments and looking for **correlations** and **root causes**." } },
    { kv: [
      ["Characteristics", "Starts from an outcome found by descriptive mining · drill-down from totals to detail · compares groups · looks for correlations and causes."],
      ["When it can be used", "A sudden change needs explaining — complaints rise, sales fall, a machine fails more often."],
      ["Example", "Complaints rose 40% in March: drill-down shows most came from customers moved to a new billing system."]
    ] },
    { table: { head: ["Benefits to organisations", "Limitations to organisations"], rows: [
      ["**Finds the cause**, so the problem can be fixed.", "Needs **detailed data** and **skilled analysts**."],
      ["Helps **prevent it happening again**.", "**Correlation is not causation** — a link may be coincidence."],
      ["Explains successes too, so they can be repeated.", "Takes time; still **looks backwards**."],
      ["Decisions are based on evidence, not guesses.", "Can miss causes that are not in the data at all."]
    ] } },
    { worked: { tag: "example", title: "From descriptive to diagnostic", q: "BrightVolt's dashboard shows that customers leaving for another supplier doubled in the North West last quarter. Which technique showed this, and which would come next?",
      steps: [
        { m: "The dashboard is **descriptive** — it reports what happened.", mk: "✓" },
        { m: "Next is **diagnostic** — drill down by tariff, age of account and complaint history to find **why** (e.g. a price rise hit one tariff).", mk: "✓", n: "The two looking-back techniques work as a pair: what, then why." }
      ], result: "Descriptive found it; diagnostic explains it" } },

    { page: "Predictive and prescriptive" },
    { callout: { t: "def", h: "Predictive data mining", body: "Uses **patterns in historical data** with statistical models and machine learning to estimate **what is likely to happen** — a forecast, a score or a **probability**, never a certainty." } },
    { kv: [
      ["Characteristics", "Looks forward · built on past patterns · outputs probabilities, scores and forecasts · needs large amounts of good data · models must be retrained as things change."],
      ["When it can be used", "Forecasting demand (a cold snap next week) · which customers are likely to leave · credit and fraud risk · when a machine is likely to fail."],
      ["Example", "Each BrightVolt customer gets a “risk of leaving” score from 0 to 1."]
    ] },
    { table: { head: ["Benefits to organisations", "Limitations to organisations"], rows: [
      ["**Proactive** — act before the problem happens.", "A **probability, not a certainty** — it can be wrong."],
      ["**Plan resources** — staff, stock, energy bought.", "Assumes **past patterns continue**; shocks break it."],
      ["**Reduce risk** — fraud, bad debt, breakdowns.", "Needs **large, high-quality data** and skills."],
      ["**Target** effort at the customers who matter most.", "**Biased data → biased predictions**, unfair to some groups."]
    ] } },
    { callout: { t: "def", h: "Prescriptive data mining", body: "Goes one step further and **recommends the best action** — it tests possible decisions against the predictions (using optimisation, simulation and AI) to say **what should be done**, and can make the decision automatically." } },
    { kv: [
      ["Characteristics", "Looks forward · builds on predictive results · compares options and their likely outcomes · outputs a recommended action · the most complex technique."],
      ["When it can be used", "Which offer to make each customer · routing engineers · when to buy wholesale energy · setting prices · stock levels."],
      ["Example", "For a customer with a high risk of leaving, recommend a fixed tariff that keeps them and still makes a profit."]
    ] },
    { table: { head: ["Benefits to organisations", "Limitations to organisations"], rows: [
      ["**Actionable** — says what to do, not just what may happen.", "The **most complex and demanding** — data, tools and specialist staff."],
      ["Weighs **many options quickly**, beyond what people can.", "Only as good as the **prediction** it builds on."],
      ["Can **automate decisions** in real time.", "Hard to **explain** why it chose an action, so hard to trust."],
      ["Aims at the **best outcome** (profit, cost, service).", "Automated decisions about people raise **UK GDPR and bias** issues (F201 4.1–4.2)."]
    ] } },

    { page: "Choosing a technique" },
    { table: { head: ["", "Descriptive", "Diagnostic", "Predictive", "Prescriptive"], rows: [
      ["Question", "What happened?", "Why did it happen?", "What will happen?", "What should we do?"],
      ["Looks", "Back", "Back", "Forward", "Forward"],
      ["Output", "Totals, charts, dashboards", "Causes, correlations", "Probabilities, forecasts", "Recommended actions"],
      ["Difficulty", "Lowest", "Medium", "High", "Highest"],
      ["Energy example", "Use per region last winter", "Why complaints rose in March", "Who is likely to switch", "Which offer keeps them"]
    ] } },
    { steps: [
      { h: "Does the question ask for a summary of the past?", m: "Descriptive.", n: "“How many…”, “what was the total…”, “show last month's…”." },
      { h: "Does it ask for the reason something happened?", m: "Diagnostic.", n: "“Why did…”, “what caused…”." },
      { h: "Does it ask what is likely in future?", m: "Predictive.", n: "“Forecast…”, “which customers are likely to…”, “how many will…”." },
      { h: "Does it ask what action to take?", m: "Prescriptive.", n: "“What should we…”, “which option is best…”, “recommend…”." }
    ] },
    { callout: { t: "tip", h: "Synoptic links", body: [
      "**F200 2.5.2** — the same four types (plus cognitive) as types of **data analytics**: the same questions, met in F200.",
      "**F201 1.1** — data mining is the fourth of the six steps of analysing big data.",
      "**F201 2.2** — mining needs prepared, clean data first.",
      "**F201 2.6** — regression and time series feed predictive mining; Monte Carlo simulation feeds prescriptive.",
      "**F201 3.1** — machine learning (decision trees, random forests, k-means) powers predictive mining.",
      "**F201 4.1–4.2** — prescriptive decisions about people are automated decision-making: UK GDPR rights, bias and ethics."
    ] } },

    { page: "In exam questions" },
    { callout: { t: "info", h: "The scenario", body: "**BrightVolt** supplies gas and electricity to two million homes in the UK. Most homes have smart meters that send readings every 30 minutes. BrightVolt mines this data, its billing records and its customer contact logs." } },
    { worked: { tag: "exam", title: "What data mining is", src: "OCR-style · Describe · 2 marks",
      q: "BrightVolt uses data mining on its smart meter readings. Describe what is meant by data mining.",
      steps: [
        { m: "Exploring / analysing large datasets (1)…", mk: "1", n: "Modelled on the SAM's 1-mark Describe shape (Q6(a)), extended to 2." },
        { m: "…to discover patterns, trends, relationships or anomalies that support decision-making (1).", mk: "1", n: "Credit any other appropriate response." }
      ], result: "Analysing large datasets to find patterns that help decisions" } },
    { worked: { tag: "exam", title: "Which technique answers which question?", src: "OCR-style · Identify · 4 marks",
      q: "BrightVolt's managers ask:\n- **(i)** How much gas did customers use last January?\n- **(ii)** Why did calls to the helpline rise last week?\n- **(iii)** Which customers are likely to miss a payment?\n- **(iv)** What price should each tariff be set at next month?\n\nIdentify the data mining technique that answers each question.",
      steps: [
        { m: "(i) Descriptive (1).", mk: "1" },
        { m: "(ii) Diagnostic (1).", mk: "1" },
        { m: "(iii) Predictive (1).", mk: "1" },
        { m: "(iv) Prescriptive (1).", mk: "1", n: "Correct answers only. Key words: how much → describe; why → diagnose; likely → predict; should → prescribe." }
      ], result: "Descriptive · diagnostic · predictive · prescriptive",
      "try": [{ notesOnly: true, grid: { cols: ["BrightVolt's question", "Technique"], rows: [
        ["Which region used the most electricity in 2025?", "descriptive"],
        ["Why did complaints rise after the new app launched?", "diagnostic"],
        ["How much electricity will be needed during next week's cold snap?", "predictive"],
        ["Which engineers should be sent to which faults today?", "prescriptive"],
        ["What percentage of customers paid by direct debit last month?", "descriptive"],
        ["Which smart meters are likely to fail this year?", "predictive"]
      ], given: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]], cap: "Type one of: descriptive, diagnostic, predictive, prescriptive." } }] } },
    { worked: { tag: "exam", title: "A benefit of predictive data mining", src: "OCR-style · Explain · 2 marks",
      q: "BrightVolt plans to use predictive data mining on its smart meter data. Explain one benefit to BrightVolt of using predictive data mining.",
      steps: [
        { m: "It can forecast demand from patterns in past usage and weather (1) so BrightVolt can buy the right amount of energy in advance and avoid paying high short-notice prices (1).", mk: "2", n: "Identify (1) + application to BrightVolt (1). Maximum one benefit." },
        { m: "OR: it can identify customers likely to leave (1) so BrightVolt can contact them with an offer before they switch (1).", mk: "", n: "OR: it can predict which meters are likely to fail (1) so engineers replace them before customers lose readings (1)." }
      ], result: "Forecast → act before it happens" } },
    { worked: { tag: "exam", title: "Descriptive vs diagnostic", src: "OCR-style · Explain · 2 marks",
      q: "Explain the difference between descriptive and diagnostic data mining.",
      steps: [
        { m: "Descriptive data mining summarises past data to show what happened (1)…", mk: "1" },
        { m: "…whereas diagnostic data mining looks deeper / drills down to find why it happened (1).", mk: "1", n: "A difference needs both sides; two separate definitions joined by “whereas” earn both marks." }
      ], result: "What happened vs why it happened" } },
    lor9("prescriptive data mining"),
    { worked: { tag: "exam", title: "Should BrightVolt use prescriptive mining?", src: "OCR-style · Discuss · 9 marks",
      q: "BrightVolt is considering using prescriptive data mining to decide automatically which offer to make to each customer when their fixed tariff ends. Discuss whether BrightVolt should use prescriptive data mining to make these decisions.\n\nIn your answer you must write about:\n- any benefits to BrightVolt\n- any limitations to BrightVolt\n- whether you would recommend that BrightVolt uses prescriptive data mining and your reasons.",
      steps: [
        { m: "Purpose: prescriptive mining recommends the best action by testing options against predictions — here, the offer most likely to keep each customer profitably.", mk: "1", n: "Shows understanding of the technique (all levels)." },
        { m: "Benefit: it can weigh millions of customers and many tariffs quickly, far beyond what staff could, so every customer gets a tailored offer on time.", mk: "1", n: "Benefit in context — Level 2 needs some of these." },
        { m: "Benefit: offers are based on evidence (usage, payment history, risk of leaving), so fewer customers switch and revenue is protected.", mk: "1" },
        { m: "Benefit: decisions can be automated in real time and improve as the model learns, cutting the cost of the retention team.", mk: "1" },
        { m: "Limitation: it is only as good as the predictive model beneath it — if the risk-of-leaving scores are wrong, the wrong customers get discounts and profit falls.", mk: "1", n: "Limitations in context — both sides are needed for Level 3." },
        { m: "Limitation: biased historical data could give some groups (e.g. older or lower-income customers) worse offers — unfair, damaging to reputation, and a regulatory risk.", mk: "1" },
        { m: "Limitation: an automated decision with a significant effect on a person triggers UK GDPR rights (to human intervention and an explanation), and the reasons can be hard to explain.", mk: "1", n: "Synoptic with F201 4.1–4.2: strong Level 3 terminology." },
        { m: "Limitation: it needs specialist staff, good clean data and time to build and monitor.", mk: "1" },
        { m: "Conclusion: recommend it, with conditions — use prescriptive mining to recommend offers, with a human check on unusual cases, regular bias testing and a clear explanation for customers; the benefits at BrightVolt's scale outweigh the risks if these controls are in place.", mk: "1", n: "Level 3 needs a clear, justified conclusion that follows from the points made. “It depends” with no decision cannot reach the top." }
      ], result: "Level 3: benefits and limitations in BrightVolt's context, then a justified, conditional recommendation" } },
    { worked: { tag: "example", title: "Model Level 3 answer (summary)", q: "What a full-mark answer to the BrightVolt question reads like, in short lines.",
      steps: [
        { m: "**Benefits:** tailored offers for two million customers at scale and on time; evidence-based offers cut switching; automation cuts cost and improves over time." },
        { m: "**Limitations:** depends on the accuracy of the predictions; biased data could treat groups unfairly; automated decisions bring UK GDPR duties and are hard to explain; needs skills and clean data." },
        { m: "**Recommendation:** yes, with a human in the loop for unusual cases, regular checks for bias and plain-English explanations — at BrightVolt's scale the gain outweighs the risk once these controls exist." }
      ], result: "Both sides, in context, with a justified decision" } },

    { page: "Exam toolkit" },
    { h: "One question each" },
    { kv: [
      ["Descriptive", "What happened?"],
      ["Diagnostic", "Why did it happen?"],
      ["Predictive", "What is likely to happen?"],
      ["Prescriptive", "What should we do?"]
    ] },
    { callout: { t: "mnemonic", h: "The doctor's visit", body: [
      "A doctor **Describes** your symptoms → **Diagnoses** the cause → **Predicts** how it will go → **Prescribes** the treatment.",
      "Same order, same difficulty: **D · D · P · P**."
    ] } },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "**“Predictive tells you what will happen.”** — It gives a **probability**; it can be wrong.",
      "**“Diagnostic proves the cause.”** — It finds **correlations**; a link may be coincidence.",
      "**“Prescriptive replaces people.”** — It recommends; for decisions about people, UK GDPR expects human review to be available.",
      "**“Data mining is collecting data.”** — Collection is step 1; mining is step 4, finding patterns in data already stored and cleaned.",
      "**“The techniques are alternatives.”** — They build on each other: prescriptive needs predictive, diagnostic starts from descriptive.",
      "Writing code or algorithms — the spec excludes coding details."
    ] } },
    { callout: { t: "tip", h: "How OCR marks it", body: [
      "**Identify** the technique from a question: spot the key word — how many / why / likely / should.",
      "**Describe** a technique (1–2): its question + its output (“summarises past data in reports”).",
      "**Explain** a benefit or limitation (2): identify (1) + what it means for this organisation (1).",
      "**Discuss** (9): benefits AND limitations in context, then a recommendation with reasons — the three bullets in the question.",
      "Do not mix techniques up in one answer — a contradiction scores nothing."
    ] } }
  ],
  flashcards: [
    ["What is data mining?", "Exploring large datasets with statistics, algorithms and machine learning to discover hidden patterns, trends, relationships and anomalies that support decisions.", 0],
    ["What is the role of data mining techniques in analysing big data?", "To find patterns in data too large for people to read, turning stored, cleaned data into information for decisions — step 4 of the six steps.", 1],
    ["What question does descriptive data mining answer, with an example?", "What happened? — e.g. a report of average electricity use by region last winter.", 2],
    ["What question does diagnostic data mining answer, with an example?", "Why did it happen? — e.g. drilling down to find that complaints rose because of a new billing system.", 3],
    ["What question does predictive data mining answer, with an example?", "What is likely to happen? — e.g. a score for each customer's risk of leaving.", 4],
    ["What question does prescriptive data mining answer, with an example?", "What should we do? — e.g. recommending the offer that keeps a customer at risk of leaving.", 5],
    ["Give one limitation of predictive data mining.", "It gives a probability, not a certainty, and assumes past patterns continue; biased data gives biased predictions.", 6],
    ["Give one benefit and one limitation of prescriptive data mining.", "Benefit: says exactly what action to take, quickly and at scale. Limitation: the most complex and only as good as the prediction beneath it.", 7],
    ["Name the four data mining techniques in order of difficulty.", "Descriptive, diagnostic, predictive, prescriptive.", 100],
    ["Give one benefit and one limitation of descriptive data mining.", "Benefit: easy to understand and quick to produce. Limitation: says what happened, not why or what next.", 101],
    ["Name four kinds of pattern data mining looks for.", "Trends, associations (things occurring together), groups of similar records, and anomalies (records unlike the rest).", 103],
    ["Which two data mining techniques look back, and which two look forward?", "Back: descriptive and diagnostic. Forward: predictive and prescriptive.", 104],
    ["Why can prescriptive data mining raise UK GDPR concerns?", "It can make automated decisions about people; individuals have rights around such decisions, including human review and an explanation.", 105],
    ["What does data mining need before it starts?", "Data that has been collected, stored and cleaned — mining dirty data finds false patterns.", 106],
    ["What is the output of each data mining technique?", "Descriptive: totals and dashboards. Diagnostic: causes and correlations. Predictive: probabilities and forecasts. Prescriptive: recommended actions.", 107]
  ],
  quiz: [
    { q: "A supplier wants to know why helpline calls doubled last week. Which technique?", opts: ["Descriptive", "Diagnostic", "Predictive", "Prescriptive"], ans: 1, why: "Finding the reason something happened is diagnostic." },
    { q: "Which technique produces a dashboard of last month's totals?", opts: ["Descriptive", "Predictive", "Prescriptive", "Diagnostic"], ans: 0, why: "Summarising what happened is descriptive." },
    { q: "Which is a limitation of predictive data mining?", opts: ["It only looks at the past", "It cannot use large datasets", "Its result is a probability", "It never needs clean data"], ans: 2, why: "A prediction is a likelihood and can be wrong." },
    { q: "Which technique recommends the best action to take?", opts: ["Diagnostic", "Descriptive", "Predictive", "Prescriptive"], ans: 3, why: "Prescriptive mining tests options and recommends what should be done." },
    { q: "Where does data mining sit in the six steps of analysing big data?", opts: ["After cleaning, before analysis", "Before collection, after storing", "After consumption, at the end", "Between collection and storing"], ans: 0, why: "Collection → storing → cleaning → mining → analysis → consumption." },
    { q: "Which technique is the most complex and needs the most data and skill?", opts: ["Descriptive", "Prescriptive", "Diagnostic", "Each is equally complex"], ans: 1, why: "Prescriptive builds on predictive and compares many options." },
    { q: "“Which customers are likely to miss a payment?” needs…", opts: ["Descriptive mining", "Diagnostic mining", "Predictive mining", "Prescriptive mining"], ans: 2, why: "“Likely” asks for a forecast of the future: predictive." },
    { q: "Which is a limitation of diagnostic data mining?", opts: ["It cannot use past data", "It only gives probabilities", "It recommends no causes", "A link may be coincidence"], ans: 3, why: "Correlation is not causation, so a cause it suggests may be wrong." },
    { q: "Which best describes data mining?", opts: ["Finding patterns in large datasets", "Typing data into a database", "Backing data up to the cloud", "Deleting data no longer needed"], ans: 0, why: "Data mining discovers patterns, trends and anomalies in large datasets." },
    { q: "Which pair builds most directly on each other?", opts: ["Descriptive and prescriptive", "Predictive and prescriptive", "Diagnostic and predictive", "No technique uses another"], ans: 1, why: "Prescriptive recommendations depend on predictive results." }
  ]
};

/* =====================================================================
   F201.2.4  Big data infrastructure
   ===================================================================== */
function serverFig() {
  var it = [];
  it.push(txt(150, 14, "Dedicated server", { b: true, size: 12.5, c: "text" }));
  it.push(txt(150, 30, "one machine, one organisation", { size: 10 }));
  it = it.concat(box(80, 48, 140, 96, ["Server", "all its CPU, RAM", "and storage for", "one workload"], { c: "accent", a: 0.16 }));
  it.push(txt(150, 162, "scale UP: a bigger machine", { size: 10.5, c: "accent" }));
  it.push(txt(150, 178, "one failure = everything stops", { size: 10.5, c: "danger" }));
  it.push({ line: [[300, 10], [300, 190]], c: "line", w: 1, dash: true });
  it.push(txt(470, 14, "Distributed cluster", { b: true, size: 12.5, c: "text" }));
  it.push(txt(470, 30, "many nodes acting as one system", { size: 10 }));
  it = it.concat(box(420, 42, 100, 26, ["Master / manager"], { c: "accent2", a: 0.2, size: 10.5 }));
  [0, 1, 2, 3].forEach(function (i) {
    var x = 334 + i * 70;
    it = it.concat(arrow(470, 68, x + 28, 92, "", { w: 1.1 }));
    it = it.concat(box(x, 94, 56, 44, ["Node " + (i + 1), "part of data"], { c: "accent3", a: 0.16, size: 10.5, size2: 9 }));
  });
  it.push({ line: [[362, 146], [572, 146]], c: "accent3", w: 1.2, dash: true });
  it.push(txt(470, 162, "scale OUT: add more nodes · work in parallel", { size: 10.5, c: "accent3" }));
  it.push(txt(470, 178, "copies on other nodes: one failure, work goes on", { size: 10.5, c: "good" }));
  return { fig: { w: 640, h: 194, items: it, cap: "A dedicated server gives one organisation a whole machine; a distributed cluster splits the data and the work across many networked nodes, which process it in parallel and hold copies of each other's data." } };
}
function cloudFig() {
  var it = [];
  it.push(txt(160, 14, "Public cloud", { b: true, size: 12.5, c: "text" }));
  it = it.concat(box(70, 28, 180, 84, ["Provider's data centre", "shared by many customers", "(multi-tenant)"], { c: "accent", a: 0.12 }));
  ["Trust", "Shop", "Bank"].forEach(function (n, i) {
    var x = 40 + i * 86;
    it = it.concat(box(x, 150, 70, 30, [n], { c: i === 0 ? "accent2" : "muted", a: 0.14, size: 10.5 }));
    it = it.concat(arrow(x + 35, 148, 160, 114, "", { c: "muted", w: 1.1 }));
  });
  it.push(txt(160, 196, "over the internet · pay for what is used", { size: 10.5, c: "accent" }));
  it.push({ line: [[320, 10], [320, 204]], c: "line", w: 1, dash: true });
  it.push(txt(480, 14, "Private cloud", { b: true, size: 12.5, c: "text" }));
  it = it.concat(box(390, 28, 180, 84, ["Cloud for ONE", "organisation only", "(on site or hosted)"], { c: "accent2", a: 0.16 }));
  it = it.concat(box(400, 150, 70, 30, ["Ward PC"], { c: "accent2", a: 0.14, size: 10.5 }), box(490, 150, 70, 30, ["Home login"], { c: "accent2", a: 0.14, size: 10.5 }));
  it = it.concat(arrow(435, 148, 460, 114, "intranet", { w: 1.2, dx: -28, dy: 8 }), arrow(525, 148, 500, 114, "", { w: 1.2, dash: true }));
  it.push(txt(560, 128, "internet +", { size: 9.5, c: "accent2" }), txt(560, 140, "permissions", { size: 9.5, c: "accent2" }));
  it.push(txt(480, 196, "intranet, or remote access with permission levels", { size: 10.5, c: "accent2" }));
  return { fig: { w: 640, h: 210, items: it, cap: "Public cloud: a provider's infrastructure shared by many organisations over the internet. Private cloud: infrastructure only one organisation can use, reached through its intranet or remotely with permission levels (the characteristics the SAM credits)." } };
}
function lakeFig() {
  var it = [];
  it.push(txt(62, 14, "Sources", { b: true, size: 11.5, c: "text" }));
  it = it.concat(box(8, 26, 108, 30, ["Patient records"], { c: "muted", a: 0.1, size: 10 }), box(8, 64, 108, 30, ["Scans (images)"], { c: "muted", a: 0.1, size: 10 }), box(8, 102, 108, 30, ["Monitor feeds"], { c: "muted", a: 0.1, size: 10 }), box(8, 140, 108, 30, ["Emails, notes"], { c: "muted", a: 0.1, size: 10 }));
  [41, 79, 117, 155].forEach(function (y) { it = it.concat(arrow(118, y, 152, 98, "", { c: "muted", w: 1.1 })); });
  it = it.concat(box(156, 50, 140, 96, ["DATA LAKE", "raw, every format", "kept as it arrived", "structure on read"], { c: "accent", a: 0.16 }));
  it = it.concat(arrow(298, 98, 368, 98, "clean · ETL", { dy: -2 }));
  it = it.concat(box(372, 50, 140, 96, ["DATA WAREHOUSE", "cleaned, structured", "integrated, historic", "structure on write"], { c: "accent2", a: 0.18 }));
  it = it.concat(arrow(514, 98, 540, 98));
  it = it.concat(box(544, 62, 90, 72, ["Reports", "dashboards", "managers"], { c: "accent3", a: 0.16, size: 11 }));
  it = it.concat(arrow(226, 148, 226, 176, "", { c: "accent" }));
  it.push(txt(226, 190, "data scientists explore and train ML models", { size: 10.5, c: "accent" }));
  return { fig: { w: 640, h: 204, items: it, cap: "A data lake keeps everything raw, in any format, for exploration and machine learning; data that is needed for reporting is cleaned and loaded (ETL: extract, transform, load) into a data warehouse, structured for fast, consistent queries." } };
}

C["it:F201.2.4"] = {
  notes: [
    { h: "Big data infrastructure — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (F201 2.4)", body: [
      "**Servers — to include:** characteristics · when each can be used · benefits and limitations · the factors that influence the choice. **Does not include:** costs of implementation.",
      "**Software platforms — to include:** purpose · when each can be used · characteristics · benefits and limitations.",
      "**Storage areas — to include:** purpose · characteristics · when each can be used · benefits and limitations. **Does not include:** providers of data lakes and data warehouses.",
      "**Exam evidence:** SAM Q4(a)–(c) (private cloud: two characteristics, a limitation, another storage area) and Q6(b), Q6(e) (data analytics and data visualisation software)."
    ] } },
    { kv: [
      ["Server configurations", "dedicated servers · distributed cluster of servers"],
      [
        "Software platforms",
        "open-source software · vendor-specific software · data visualisation software · data analytics software · NoSQL database · data integration platforms"
      ],
      [
        "Data storage areas",
        "public cloud · private cloud · data lake · data warehouse · solid state drives (SSDs) · emerging: blockchain, DNA, quantum server"
      ]
    ] },
    { ol: ["**Server configurations** — dedicated, distributed cluster, the factors.", "**Open-source and vendor-specific** software.", "**What the platforms do** — visualisation, analytics, NoSQL, integration.", "**Public and private cloud**.", "**Lakes, warehouses and SSDs**.", "**Emerging storage** — blockchain, DNA, quantum server.", "**In exam questions** — worked answers in OCR's format.", "**Exam toolkit** — lists, traps, mnemonic and links."] },

    { page: "Server configurations" },
    serverFig(),
    { callout: { t: "def", h: "Dedicated server", body: "A **physical server used by one organisation only** — all of its processing power, memory and storage serve that organisation's workload. It may sit on the organisation's own site or be rented from a hosting company." } },
    { kv: [
      ["Characteristics", "Single tenant · full control of hardware, operating system and software · fixed capacity · scaled **up** by upgrading or replacing the machine."],
      ["When it can be used", "A steady, predictable workload · sensitive data that must be isolated · software that needs consistent performance (a hospital's patient database)."]
    ] },
    { table: { head: ["Benefits", "Limitations"], rows: [
      ["**Full control** — configure it exactly as needed.", "**Limited capacity** — one machine can only grow so far."],
      ["**Predictable performance** — no other customer shares it.", "A **single point of failure** unless a backup server is kept."],
      ["**Security and isolation** — easier to meet strict rules.", "Needs **specialist staff** to maintain and secure it."],
      ["Good for **compliance** — the organisation knows where the data is.", "Capacity **sits idle** when demand is low; slow to scale for peaks."]
    ] } },
    { callout: { t: "def", h: "Distributed cluster of servers", body: "**Many networked servers (nodes) working together as one system.** The data is split across the nodes and processed **in parallel**, and copies are kept on more than one node. (Apache Hadoop is a well-known example of software that runs such clusters.)" } },
    { kv: [
      ["Characteristics", "Many nodes, often ordinary hardware · data and work divided between them · parallel processing · replication for fault tolerance · scaled **out** by adding nodes."],
      ["When it can be used", "Very large or fast-growing volumes · processing that must finish quickly (velocity) · services that must keep running if a machine fails."]
    ] },
    { table: { head: ["Benefits", "Limitations"], rows: [
      ["**Scales out** — add nodes as data grows.", "**Complex** to set up, manage and secure."],
      ["**Fast** — the work runs on many nodes at once.", "Needs **specialist skills** in distributed systems."],
      ["**Fault tolerant** — a node fails, the copies carry on.", "**Network traffic** between nodes can slow it down."],
      ["Can use **lower-specification** hardware for each node.", "Keeping every copy **consistent** is harder; more machines to secure."]
    ] } },
    { callout: { t: "key", h: "Factors which influence the choice of server configuration", body: [
      "**Volume and growth** — how much data now, and how fast it grows (scalability).",
      "**Velocity** — does it have to be processed in real time?",
      "**Performance** needed — response times, processing deadlines.",
      "**Reliability** — can the service ever stop? (fault tolerance)",
      "**Security and legal compliance** — how sensitive is the data; must it stay isolated or in the UK?",
      "**Staff skills** available to build and run it.",
      "**Control** wanted over hardware and software.",
      "**Predictability** of the workload — steady or with peaks.",
      "The spec excludes **costs of implementation**: build answers on these factors, not on prices."
    ] } },

    { page: "Open-source and vendor-specific" },
    { table: { head: ["", "Open-source software", "Vendor-specific software"], rows: [
      ["What it is", "Software whose **source code is freely available** to use, study, change and share under its licence.", "Software **owned by one company**, closed source, used under a **licence or subscription**; also called proprietary."],
      ["Purpose", "To give organisations tools they can adapt freely, built and checked by a community.", "To give organisations a finished, supported product with a guaranteed level of service."],
      ["Characteristics", "Community-developed · customisable · no licence fee · runs on many platforms.", "Polished interface · vendor support and updates · service level agreement (SLA) · works best inside the vendor's own range of products."],
      ["When it can be used", "Skilled in-house team · need to customise · want to avoid lock-in (e.g. Hadoop, Spark, Python, R).", "Need for support, training and reliability · staff without deep technical skills (e.g. commercial BI and database products)."]
    ] } },
    { table: { head: ["", "Benefits", "Limitations"], rows: [
      ["**Open-source**", "No licence fee · can be changed to fit · large community, quick fixes and add-ons · no vendor lock-in · code can be checked for security.", "No guaranteed support or SLA · needs skilled staff · documentation varies · the organisation is responsible for updates and security · may be harder to integrate."],
      ["**Vendor-specific**", "Professional support and SLAs · easier to learn and use · tested, regular updates · training and documentation · integrates with the vendor's other products.", "Licence or subscription fees · **vendor lock-in** — hard to move away · little customisation · depends on the vendor's plans and survival."]
    ] } },
    { callout: { t: "def", h: "Vendor lock-in", body: "Depending so heavily on one supplier's products and formats that **changing supplier becomes difficult, slow or costly**." } },

    { page: "What the platforms do" },
    { table: { head: ["Platform", "Purpose", "Characteristics", "When it can be used"], rows: [
      ["**Data visualisation software**", "To present data as **charts, graphs, maps and dashboards** so patterns are seen quickly.", "Drag-and-drop charts · interactive, filterable dashboards · real-time updates · export and share.", "Presenting findings at a meeting · live dashboards · showing trends to non-specialists."],
      ["**Data analytics software**", "To **process and analyse** data to find trends, patterns and statistics that support decisions.", "Statistics and models · querying large datasets · forecasting · often includes visualisation.", "Deciding which products to stock · finding why sales fell · forecasting demand."],
      ["**NoSQL database**", "To store and retrieve **large volumes of varied, fast-changing data** that does not fit fixed tables.", "Non-relational · **flexible schema** · document, key-value, wide-column or graph models · **scales out** across a cluster.", "Semi-structured and unstructured data · social media feeds · sensor (IoE) data · apps with millions of users."],
      ["**Data integration platforms**", "To **combine data from many sources** into one consistent, unified view.", "Connectors to many systems · extract, transform, load (ETL) · scheduled or real-time pipelines · data mapping and cleaning.", "Merging systems after a takeover · feeding a data warehouse · keeping systems in sync."]
    ] } },
    { table: { head: ["Platform", "Benefits", "Limitations"], rows: [
      ["Data visualisation", "Patterns seen at a glance rather than in raw data · charts can be shared across departments · real-time monitoring · easier for non-specialists.", "Wrong or poor data gives misleading charts · cluttered output unsuited to its audience · a wrong chart type misleads · needs training to design well."],
      ["Data analytics", "Finds trends quickly in huge datasets · evidence-based decisions · can automate reports and forecasts.", "Results only as good as the data · needs skilled analysts · findings can be misread."],
      ["NoSQL database", "Handles variety (no fixed schema) · scales out for volume and velocity · stays available if a node fails.", "Weaker consistency than relational databases · no single standard query language · complex joins and transactions are harder · fewer staff with the skills."],
      ["Data integration", "One version of the truth · automates wrangling and loading · saves staff time · keeps data current.", "Complex to set up and map · a failure can stop the data flow · poor source data spreads everywhere · data must be secured in transit."]
    ] } },
    { worked: { tag: "example", title: "Which platform?", q: "Weyford Hospitals Trust wants to:\n- **(a)** show bed occupancy live on a screen in each ward\n- **(b)** store millions of readings from bedside monitors in many formats\n- **(c)** bring its three hospitals' systems into one view.\n\nWhich platform suits each?",
      steps: [
        { m: "(a) **Data visualisation software** — a live dashboard.", mk: "✓" },
        { m: "(b) **NoSQL database** — flexible schema, scales out for volume and velocity.", mk: "✓" },
        { m: "(c) **Data integration platform** — combines the sources into one consistent view.", mk: "✓", n: "Match the platform's PURPOSE to the need." }
      ], result: "Visualisation · NoSQL · integration" } },

    { page: "Public and private cloud" },
    cloudFig(),
    { callout: { t: "def", h: "Public cloud", body: "Storage and computing provided by a **third-party provider over the internet**, on infrastructure **shared by many organisations**, paid for as it is used." } },
    { callout: { t: "def", h: "Private cloud", body: "Cloud infrastructure **used by one organisation only**, hosted on its own site or by a third party, and reached through its **intranet** or **remotely through the internet with permission levels**." } },
    { table: { head: ["", "Public cloud", "Private cloud"], rows: [
      ["Purpose", "Flexible storage and processing without owning hardware.", "Cloud flexibility with the control and security of one owner."],
      ["Characteristics", "Multi-tenant · accessed over the internet · elastic, on-demand capacity · provider maintains it · pay as you go.", "Single tenant · intranet or permission-controlled remote access · organisation controls it · often maintained by its own staff."],
      ["When it can be used", "Changing or peak demand · start-ups and growing firms · data that is not highly sensitive · sharing data widely.", "Sensitive or regulated data (health, finance) · strict security policies · steady, predictable demand."]
    ] } },
    { table: { head: ["", "Benefits", "Limitations"], rows: [
      ["**Public cloud**", "Scales up and down on demand · no hardware to buy or maintain · reach it from anywhere · provider handles backup and updates under an SLA.", "Needs a reliable internet connection · less control over where and how data is held (UK GDPR, data leaving the UK) · shared infrastructure raises security concerns · ongoing fees and lock-in."],
      ["**Private cloud**", "More control and customisation · higher security — no other tenants · easier to show compliance · predictable performance.", "Higher staff costs — specialists needed to run it · access fails if its systems or internet links fail · maintenance takes longer with no external SLA · scaling means buying more hardware."]
    ] } },

    { page: "Lakes, warehouses and SSDs" },
    lakeFig(),
    { callout: { t: "def", h: "Data lake", body: "A central store that holds **very large amounts of raw data in its original format** — structured, semi-structured and unstructured — until it is needed. Structure is applied **when the data is read** (schema-on-read)." } },
    { callout: { t: "def", h: "Data warehouse", body: "A central store of **cleaned, structured, integrated data** from many sources, organised for **querying and reporting**. Data is transformed **before it is loaded** (schema-on-write), usually through ETL, and history is kept." } },
    { callout: { t: "def", h: "Solid state drive (SSD)", body: "A storage device that holds data in **flash memory with no moving parts**, giving fast reads and writes." } },
    { table: { head: ["", "Data lake", "Data warehouse", "SSDs"], rows: [
      ["Purpose", "Keep all data, raw, for future analysis and machine learning.", "Give a single, reliable source of structured data for reports and business intelligence.", "Fast storage where speed of access matters."],
      ["Characteristics", "Any format · raw · schema-on-read · very large and scalable.", "Structured only · cleaned and integrated · schema-on-write · historic · optimised for queries.", "Flash memory · no moving parts · low latency · durable · quiet, low power."],
      ["When it can be used", "Data scientists exploring · training AI models · storing images, video, sensor feeds.", "Monthly reports · dashboards · comparing years · a single version of the truth.", "Real-time analytics · databases under heavy use · the fast tier in a cluster."]
    ] } },
    { table: { head: ["", "Benefits", "Limitations"], rows: [
      ["**Data lake**", "Stores any type of data · keeps everything for questions not yet asked · scales cheaply · flexible for data science.", "Can become a **data swamp** — unorganised, hard to find anything · data quality not guaranteed · harder for business users to query · governance and security of raw personal data."],
      ["**Data warehouse**", "Fast, consistent queries · clean, trusted data · history for trends · easy for business users.", "Structured data only · rigid — changes take time · ETL delays mean it is rarely real-time · data must be prepared before it is useful."],
      ["**SSDs**", "Very fast reads and writes · low latency for real-time work · no moving parts, so robust · low power.", "Higher cost per gigabyte than hard drives · a limited number of write cycles · data can be harder to recover when one fails."]
    ] } },
    { callout: { t: "warn", h: "Providers are not examined", body: "The spec excludes **providers of data lakes and data warehouses** — do not build an answer on brand names. Explain the characteristics instead." } },

    { page: "Emerging storage" },
    { table: { head: ["", "Blockchain", "DNA", "Quantum server"], rows: [
      ["What it is", "A **distributed ledger**: records grouped into blocks, each linked to the one before by a cryptographic **hash**, with copies held on many computers (nodes).", "Digital data **encoded in synthetic DNA** — the binary is written as sequences of the bases A, C, G and T — and read back by sequencing.", "A server built on a **quantum computer**, which uses **qubits** that can hold more than one state at once (superposition)."],
      ["Purpose", "Records that are **tamper-evident** and trusted without one central owner.", "**Archives** that must last a very long time in very little space.", "Processing (and, in research, storing) data in ways classical machines cannot, for certain hard problems."],
      ["Characteristics", "Decentralised · append-only · changing a past block breaks every later link · transparent and traceable.", "Extremely dense · very long-lasting if kept cool, dry and dark · needs no power to keep the data · slow to write and read.", "Experimental · error-prone (qubits lose their state easily) · needs extreme cooling · mostly reached through the cloud."],
      ["When it could be used", "Audit trails · consent records · supply chains (provenance) · shared records between organisations.", "Long-term cold storage: archives, records kept for decades.", "Optimisation, simulation and searching very large datasets — when the technology matures."]
    ] } },
    { table: { head: ["", "Benefits", "Limitations"], rows: [
      ["**Blockchain**", "Tamper-evident — past records cannot be quietly changed · no single point of failure · a transparent, traceable history · trust between parties without a middleman.", "Slow and, with some methods, energy-hungry · impractical for large files (usually only a hash is stored) · **immutability conflicts with UK GDPR's rights to rectification and erasure** · every node stores a copy."],
      ["**DNA**", "Huge capacity in a tiny space · can last for centuries or more · very low energy to keep.", "Very slow and very expensive to write and read today · errors in writing and reading need correcting · not for data that changes or is needed quickly · still experimental."],
      ["**Quantum server**", "Potentially far faster for certain problems · could analyse vast datasets and complex models.", "Experimental and unreliable today · extreme cooling and specialist skills · very expensive and scarce · could break today's encryption, a security risk."]
    ] } },
    { callout: { t: "tip", h: "Synoptic links", body: [
      "**F200 2.3** — on-site storage (HDD, **SSD**, NAS, SAN), cloud types (public, private, hybrid, community) and block, file and object storage.",
      "**F201 1.1** — volume drives clusters and lakes; velocity drives SSDs and real-time platforms; variety drives NoSQL and lakes.",
      "**F201 2.1** — the type of data decides the store: warehouse for structured, lake or NoSQL for the rest.",
      "**F201 2.2** — integration platforms automate wrangling; ETL is preparation in action.",
      "**F201 2.5–2.6** — analytics and visualisation software run the techniques.",
      "**F201 4.1** — where data is stored and who can reach it are UK GDPR questions (security, transfers outside the UK).",
      "**F201 5.1** — data centres' energy use; **F203** — relational databases; **F205** — data visualisation in depth."
    ] } },

    { page: "In exam questions" },
    { callout: { t: "info", h: "The scenario", body: "**Weyford Hospitals Trust** runs three hospitals. It stores patient records, scan images and readings from bedside monitors, and its managers use the data to plan beds, staff and operating theatres." } },
    { worked: { tag: "exam", title: "Two characteristics of a private cloud", src: "OCR-style · State · 2 marks",
      q: "Weyford stores its patient records in a private cloud. State two characteristics of a private cloud.",
      steps: [
        { m: "Any two from:\n- the infrastructure is only accessible to one organisation (1)\n- it is accessed through an intranet (1)\n- it can be accessed remotely through the internet with permission levels (1).", mk: "2", n: "Modelled on SAM Q4(a). One mark each. Credit any other appropriate response, e.g. controlled and maintained by the organisation itself (1)." },
        { m: "Do not accept: “it is secure” on its own — say why (one organisation only, permission levels).", mk: "0" }
      ], result: "One organisation only · intranet / permission-level remote access" } },
    { worked: { tag: "exam", title: "A limitation of the private cloud", src: "OCR-style · Explain · 2 marks",
      q: "Explain one limitation to Weyford of using a private cloud to store its patient records.",
      steps: [
        { m: "Higher staff costs (1) — the trust needs its own specialist staff to maintain the private cloud so that clinicians can always reach records (1).", mk: "2", n: "Modelled on SAM Q4(b). Up to two marks for ONE limitation: identify (1) + application (1)." },
        { m: "OR: unreliable access (1) — if the trust's systems or internet links fail, staff cannot open records during treatment (1). OR: maintenance takes longer (1) — with no SLA with an outside company, problems may take longer to fix (1).", mk: "", n: "Generic answers are accepted as well as applied ones (the SAM's guidance for this PO1 question). Maximum one limitation." }
      ], result: "Identify one limitation and say what it means for the trust" } },
    { worked: { tag: "exam", title: "Another storage area", src: "OCR-style · State · 1 mark",
      q: "State one other storage area Weyford could use to store its patient records.",
      steps: [
        { m: "Any one from:\n- public cloud (1)\n- data lake (1)\n- data warehouse (1)\n- solid state drives (1).", mk: "1", n: "Modelled on SAM Q4(c). Correct answer only. Do not accept: private cloud (given in the stem)." }
      ], result: "e.g. data warehouse" } },
    { worked: { tag: "exam", title: "Visualisation software: a benefit and a limitation", src: "OCR-style · Explain · 4 marks",
      q: "Weyford's analysts will present bed-occupancy findings to the trust's board. Explain one benefit and one limitation to Weyford of using data visualisation software to present these findings.",
      steps: [
        { m: "Benefit: charts and dashboards can be created (1) so board members see occupancy trends at a glance instead of reading raw figures (1).", mk: "2", n: "Modelled on SAM Q6(e). Up to two marks each: identify (1) + effect on the trust (1). OR: real-time dashboards (1) so ward managers see free beds as they happen (1)." },
        { m: "Limitation: if the wrong or poor-quality data is used, the charts will be wrong (1) so the board could close or open wards on a misleading picture (1).", mk: "2", n: "OR: cluttered or the wrong chart type (1) so board members misread the findings (1). Maximum one benefit and one limitation." }
      ], result: "Benefit: seen at a glance. Limitation: misleading if the data or chart is wrong" } },
    { worked: { tag: "exam", title: "Why a distributed cluster", src: "OCR-style · Explain · 2 marks",
      q: "Weyford's bedside monitors send millions of readings a day. Explain why a distributed cluster of servers could be used to process this data.",
      steps: [
        { m: "The work is shared across many nodes and processed in parallel (1) so the readings are analysed quickly enough to alert staff in time (1).", mk: "2", n: "OR: it scales out (1) so nodes can be added as more monitors are installed (1). OR: copies on several nodes (1) so the alerts keep working if one server fails (1)." }
      ], result: "Parallel, scalable, fault tolerant — applied to the monitors" } },
    lor6("server configurations"),
    { worked: { tag: "exam", title: "Factors in choosing a server configuration", src: "OCR-style · Analyse · 6 marks",
      q: "Weyford must choose between dedicated servers and a distributed cluster for its new patient-monitoring system. Analyse the factors that will influence its choice.",
      steps: [
        { m: "Volume and growth: readings from every bed grow as wards are added; a cluster scales out by adding nodes, a dedicated server only as far as one machine.", mk: "1", n: "Each factor linked to a consequence for the trust — the Level 2 to 3 step." },
        { m: "Velocity: alerts must be near real time; a cluster's parallel processing keeps up, a single overloaded server may delay an alert.", mk: "1" },
        { m: "Reliability: a monitoring system cannot stop; a cluster's copies survive a node failure, while a single dedicated server is a single point of failure unless duplicated.", mk: "1" },
        { m: "Security and compliance: health records are special category data under UK GDPR; a dedicated server is isolated and easier to control, a cluster has many more machines to secure.", mk: "1" },
        { m: "Staff skills: a cluster needs distributed-systems expertise the trust may not have; dedicated servers are simpler to run.", mk: "1" },
        { m: "Weighed: for a fast, growing, must-not-fail monitoring system the cluster's scalability and fault tolerance matter most, provided the trust has (or hires) the skills to secure it.", mk: "1", n: "Level 3: a range of factors, each analysed in the trust's context, with terminology and a reasoned view." }
      ], result: "Level 3: several factors, each explained for the trust, weighed to a view" } },
    lor9("public cloud storage"),
    { worked: { tag: "exam", title: "Should the trust move to a public cloud?", src: "OCR-style · Discuss · 9 marks",
      q: "Weyford is running out of space for scan images in its private cloud and is considering moving them to a public cloud. Discuss whether Weyford should store its scan images in a public cloud.\n\nIn your answer you must write about:\n- any benefits to Weyford\n- any limitations to Weyford\n- whether you would recommend that Weyford uses a public cloud and your reasons.",
      steps: [
        { m: "Benefit: capacity scales on demand, so the growing volume of scans never runs out of space and no new hardware has to be bought and installed.", mk: "1", n: "Benefits in context support Level 2; both sides are needed for Level 3." },
        { m: "Benefit: the provider maintains, updates and backs up the infrastructure under an SLA, freeing the trust's own IT staff.", mk: "1" },
        { m: "Benefit: scans can be reached from all three hospitals and by approved specialists elsewhere, speeding up diagnosis.", mk: "1" },
        { m: "Limitation: scans are health data — special category personal data under UK GDPR — so the trust must be sure where the data is held (in or outside the UK) and how it is protected.", mk: "1" },
        { m: "Limitation: shared, multi-tenant infrastructure and internet access raise the risk of a breach, with fines and loss of patient trust if it happens.", mk: "1" },
        { m: "Limitation: access depends on the internet connection — an outage could delay a diagnosis — and the trust has less control and may become locked in to one provider.", mk: "1" },
        { m: "Limitation: large image files take time to upload and download, which may slow clinicians compared with local storage.", mk: "1" },
        { m: "Alternative weighed: keep current patient records in the private cloud and move only older scans (an archive) to the public cloud, encrypted, with UK data centres in the contract.", mk: "1" },
        { m: "Conclusion: recommend a public cloud for the scan archive only, with encryption, UK-based storage and access controls; keep live records private. This gains the scalability without putting the most sensitive, most-used data at the greatest risk.", mk: "1", n: "Level 3: a clear, justified recommendation that answers the question and follows from the points." }
      ], result: "Level 3: benefits and limitations in the trust's context, then a justified recommendation" } },

    { page: "Exam toolkit" },
    { h: "The spec's lists" },
    { kv: [
      ["Servers (2)", "Dedicated servers · Distributed cluster of servers"],
      [
        "Software platforms (6)",
        "Open-source · Vendor-specific · Data visualisation · Data analytics · NoSQL database · Data integration platforms"
      ],
      [
        "Storage areas (5 + 3)",
        "Public cloud · Private cloud · Data lake · Data warehouse · SSDs · emerging: Blockchain · DNA · Quantum server"
      ],
      [
        "Private cloud (SAM)",
        "One organisation only · intranet · remote access through the internet with permission levels"
      ]
    ] },
    { callout: { t: "mnemonic", h: "Remember the lists", body: [
      "Software: **O**ur **V**ets **V**iew **A**nimals **N**ear **I**pswich → Open-source, Vendor-specific, Visualisation, Analytics, NoSQL, Integration.",
      "Storage: **P**lease **P**ut **L**ions **W**here **S**afe — **B**ig **D**angerous **Q**uiet → Public, Private, Lake, Warehouse, SSD, Blockchain, DNA, Quantum.",
      "**Lake = Loose** (raw, any format); **Warehouse = Workshop-finished** (clean, structured)."
    ] } },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "**“Private cloud means on-site.”** — It means **one organisation only**; it may be hosted by a third party.",
      "**“A data lake is a big data warehouse.”** — A lake holds **raw data of any type**; a warehouse holds **cleaned, structured** data.",
      "**“NoSQL means no queries.”** — It means **not only SQL** / non-relational: it is queried, just not through fixed tables.",
      "**“Open-source is free, so it costs nothing.”** — No licence fee, but it needs skilled staff and has no guaranteed support.",
      "**“A cluster is always better.”** — It is more complex and harder to secure; a steady, sensitive workload may suit a dedicated server.",
      "**“Blockchain is ideal for personal data.”** — Its immutability clashes with the rights to rectification and erasure.",
      "**Implementation costs and provider names** are outside the spec — argue from characteristics."
    ] } },
    { callout: { t: "tip", h: "How OCR marks it", body: [
      "**State** characteristics (1 each): short and factual — “accessible to one organisation only”.",
      "**Explain** a limitation (2): ONE limitation, identified (1) and developed for the organisation (1). A second limitation is not marked.",
      "**State one other storage area**: never the one named in the stem.",
      "**Explain one benefit and one limitation** (4): the paper gives separate Benefit and Limitation headings — 2 marks under each.",
      "**Discuss** (9): benefits AND limitations in context, then a recommendation with reasons; a compromise (archive only, with controls) is a strong conclusion if justified."
    ] } }
  ],
  flashcards: [
    ["What are the two server configurations in the specification?", "Dedicated servers and a distributed cluster of servers.", 0],
    ["Give one benefit and one limitation of a dedicated server.", "Benefit: full control and predictable performance. Limitation: limited capacity and a single point of failure.", 1],
    ["Why does a distributed cluster scale well?", "It scales out — more nodes can be added, and the data and work are split across them and processed in parallel.", 2],
    ["Give two limitations of a distributed cluster.", "It is complex to set up and secure, and it needs specialist distributed-systems skills (network traffic between nodes can also slow it).", 3],
    ["How does open-source software differ from vendor-specific software?", "Open-source: code freely available, no licence fee, customisable, community support. Vendor-specific: owned and licensed, professional support and SLAs, but fees and lock-in.", 4],
    ["What is vendor lock-in?", "Depending so heavily on one supplier's products and formats that changing supplier is difficult, slow or costly.", 5],
    ["How does a data lake differ from a data warehouse?", "Lake: raw data of any format, structure applied on reading. Warehouse: cleaned, structured, integrated data, structured before loading, for reports.", 6],
    ["What does ETL stand for, and what does it do?", "Extract, Transform, Load — takes data from sources, cleans and restructures it, and loads it into a data warehouse.", 7],
    ["Give one benefit and one limitation of a private cloud.", "Benefit: control and security — one organisation only. Limitation: higher staff costs, and no external SLA, so fixes can take longer.", 8],
    ["Give one benefit and one limitation of an SSD.", "Benefit: very fast reads and writes with low latency. Limitation: higher cost per gigabyte and a limited number of write cycles.", 9],
    ["Name the three emerging data storage technologies in the specification.", "Blockchain, DNA and quantum server.", 10],
    ["State two characteristics of a private cloud.", "Only accessible to one organisation; accessed through an intranet, or remotely through the internet with permission levels.", 100],
    ["List four factors that influence the choice of server configuration.", "Volume and growth, velocity (real-time needs), reliability, security and compliance — also staff skills, control and workload predictability.", 101],
    ["What is a NoSQL database, and when is it used?", "A non-relational database with a flexible schema that scales out — used for large volumes of semi-structured or unstructured, fast-changing data.", 102],
    ["Give one benefit and one limitation of data visualisation software.", "Benefit: patterns seen at a glance and shared easily. Limitation: wrong data or a poor chart misleads, leading to bad decisions.", 104],
    ["Why does blockchain's design conflict with UK GDPR?", "Records cannot be changed or deleted, but data subjects have rights to rectification and erasure.", 105],
    ["Give one benefit and one limitation of DNA data storage.", "Benefit: enormous capacity in a tiny space for a very long time. Limitation: very slow and expensive to write and read — archives only, still experimental.", 106],
    ["What is a data swamp?", "A data lake that has become disorganised — no metadata or governance — so data is hard to find and trust.", 107]
  ],
  quiz: [
    { q: "Which is a characteristic of a private cloud?", opts: ["Shared by many organisations", "Used by one organisation only", "Always free of charge to use", "Only reachable by satellite"], ans: 1, why: "A private cloud's infrastructure is accessible to one organisation only (SAM Q4(a))." },
    { q: "Which store keeps raw data of every format until it is needed?", opts: ["Data warehouse", "Dedicated server", "Data lake", "Relational table"], ans: 2, why: "A data lake holds raw data in its original format; structure is applied on reading." },
    { q: "Which is a benefit of a distributed cluster?", opts: ["Work runs on nodes in parallel", "It is simple to set up and run", "It has one point of failure", "It needs no network at all"], ans: 0, why: "Splitting the work across nodes lets them process it in parallel." },
    { q: "Which software platform suits fast, varied data with no fixed schema?", opts: ["Data visualisation software", "A spreadsheet file", "A data warehouse", "A NoSQL database"], ans: 3, why: "NoSQL databases have a flexible schema and scale out." },
    { q: "Which is a limitation of vendor-specific software?", opts: ["No professional support", "Source code must be shared", "Vendor lock-in", "No user interface"], ans: 2, why: "Depending on one vendor's products makes moving away difficult." },
    { q: "Which is a limitation of SSDs?", opts: ["Slow to read data back", "Higher cost per gigabyte", "Many fragile moving parts", "Very high access latency"], ans: 1, why: "SSDs are fast but cost more per gigabyte than hard drives and have limited write cycles." },
    { q: "Which emerging storage writes data as sequences of A, C, G and T?", opts: ["DNA storage", "Blockchain", "Quantum server", "Data lake"], ans: 0, why: "DNA storage encodes binary data in the four bases of synthetic DNA." },
    { q: "Which factor is excluded from the specification for server choice?", opts: ["Volume of the data", "Skills of the staff", "Reliability of service", "Implementation costs"], ans: 3, why: "The spec says costs of implementation are not included." },
    { q: "What does a data integration platform do?", opts: ["Draws charts from data", "Combines many sources", "Stores data in DNA", "Encrypts each email"], ans: 1, why: "It brings data from many systems into one consistent view." },
    { q: "Which is a limitation of a public cloud?", opts: ["It cannot scale up", "It needs the internet", "It needs its own hardware", "It has no SLA"], ans: 1, why: "Public cloud is reached over the internet, so an outage stops access." }
  ]
};

/* =====================================================================
   F201.2.5  Data science and data analytics
   ===================================================================== */
function vennFig() {
  var it = [];
  it.push({ circle: [210, 92, 74], fill: "accent", alpha: 0.12, c: "accent", w: 1.4 });
  it.push({ circle: [310, 92, 74], fill: "accent2", alpha: 0.12, c: "accent2", w: 1.4 });
  it.push({ circle: [260, 172, 74], fill: "accent3", alpha: 0.12, c: "accent3", w: 1.4 });
  it.push(txt(176, 70, "Statistics", { b: true, size: 11, c: "text" }), txt(176, 84, "and maths", { size: 10.5, c: "text2" }));
  it.push(txt(346, 70, "Computing", { b: true, size: 11, c: "text" }), txt(346, 84, "code, ML, AI", { size: 10.5, c: "text2" }));
  it.push(txt(260, 212, "Domain knowledge", { b: true, size: 11, c: "text" }), txt(260, 226, "the business, the sector", { size: 10.5, c: "text2" }));
  it.push(txt(260, 128, "DATA", { b: true, size: 11.5, c: "text" }), txt(260, 142, "SCIENCE", { b: true, size: 11.5, c: "text" }));
  /* right: data analytics inside data science */
  it.push({ poly: [[420, 20], [630, 20], [630, 236], [420, 236]], fill: "accent", alpha: 0.06, c: "accent", w: 1.3 });
  it.push(txt(525, 36, "Data science", { b: true, size: 12, c: "accent" }));
  it.push(txt(525, 54, "builds models · ML and AI", { size: 10, c: "text2" }));
  it.push(txt(525, 68, "raw, unstructured data", { size: 10, c: "text2" }));
  it.push(txt(525, 82, "asks new questions", { size: 10, c: "text2" }));
  it = it.concat(box(440, 100, 170, 116, ["Data analytics", "answers set questions", "trends and patterns", "reports, dashboards", "mostly structured data"], { c: "accent2", a: 0.16, size: 11.5, size2: 10 }));
  return { fig: { w: 640, h: 246, items: it, cap: "Left: data science sits where statistics, computing and knowledge of the business meet. Right: data analytics is one part of the wider field of data science — it answers known questions from existing data; data science also builds the models that predict and automate." } };
}

C["it:F201.2.5"] = {
  notes: [
    { h: "Data science and data analytics — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (F201 2.5)", body: "**Exam evidence:** SAM Q6(a) (describe the purpose of data analytics, 1 mark) and Q6(b) (explain how data analytics software could help a retailer decide on new products, 2 marks)." } },
    { kv: [
      ["Data science", "its purpose"],
      ["Data analytics", "its purpose"],
      ["The difference", "between data science and data analytics"],
      [
        "Application areas",
        "how each is used in the areas of F201 1.4: banking · communications, media and entertainment · education · energy and utilities · government · healthcare · insurance · manufacturing · retail"
      ]
    ] },
    { ol: ["**Data analytics** — what it is and its purpose.", "**Data science** — what it is and its purpose.", "**The difference** — side by side.", "**Across the application areas** — each of the nine areas of 1.4.", "**In exam questions** — worked answers in OCR's format.", "**Exam toolkit** — definitions, traps, mnemonic and links."] },
    vennFig(),

    { page: "Data analytics" },
    { callout: { t: "def", h: "Data analytics", body: "Examining data — usually already collected and structured — to **find trends and patterns** and **answer specific questions**, so an organisation can **make sense of its data** and **make informed decisions**." } },
    { callout: { t: "key", h: "The purpose of data analytics", body: [
      "To help an organisation **make sense of the data it has collected**.",
      "To analyse raw data and **identify trends and patterns**.",
      "To **support decision-making** with evidence — what to stock, where to cut, what to change.",
      "To **monitor performance** against targets (KPIs)."
    ] } },
    { kv: [
      ["Characteristics", "Starts from a known business question · works mostly on structured, cleaned data · uses querying, statistics and visualisation · outputs reports, dashboards and recommendations · mainly descriptive and diagnostic, sometimes predictive."],
      ["Tools", "Spreadsheets, SQL, data analytics software and data visualisation software (F201 2.4)."],
      ["Who", "Data analysts; business intelligence analysts."],
      ["Example", "A retailer finds which products sold best in each region last quarter, so it can decide what to stock."]
    ] },
    { steps: [
      { h: "Ask", m: "Set the business question.", n: "Which new series are our viewers most likely to watch?" },
      { h: "Prepare", m: "Collect and clean the data needed.", n: "Viewing history, ratings, genres (F201 2.2)." },
      { h: "Analyse", m: "Query, summarise and look for trends.", n: "Crime dramas grew fastest among 18–34s this year." },
      { h: "Share", m: "Present the findings visually.", n: "A dashboard for the commissioning team." },
      { h: "Act", m: "The decision is made on the evidence.", n: "Commission a new crime drama." }
    ] },

    { page: "Data science" },
    { callout: { t: "def", h: "Data science", body: "A wider field that combines **statistics, computing (programming, machine learning, AI) and knowledge of the business** to **extract knowledge from large, complex data** — structured and unstructured — and to **build models and algorithms that predict, automate and discover**." } },
    { callout: { t: "key", h: "The purpose of data science", body: [
      "To **discover new insights and questions** nobody has asked yet.",
      "To **build predictive models** — what is likely to happen.",
      "To **build products that automate decisions** — recommendation engines, fraud detection, chatbots.",
      "To make use of **raw, unstructured big data** — text, images, sensor streams."
    ] } },
    { kv: [
      ["Characteristics", "Exploratory — finds the questions as well as the answers · works on raw, large, often unstructured data · programming and machine learning · experiments and tests models · outputs models, algorithms and AI products · predictive and prescriptive."],
      ["Tools", "Programming languages (e.g. Python, R), machine learning libraries, NoSQL databases, data lakes, distributed clusters."],
      ["Who", "Data scientists; machine learning engineers."],
      ["Example", "A streaming service builds a model that learns from every viewer's history to recommend what each person will watch next."]
    ] },
    { table: { head: ["", "Benefits", "Limitations"], rows: [
      ["**Data analytics**", "Quick, clear answers to business questions · works with existing tools and staff · easy to communicate · lower risk.", "Mostly explains the past · limited to the questions asked · needs clean, structured data · can miss patterns no one looked for."],
      ["**Data science**", "Predicts and automates · finds new opportunities · uses all data, including unstructured · can give a competitive advantage.", "Needs scarce specialist skills · takes time and experiments, with no guaranteed result · models can be hard to explain · biased data gives biased models."]
    ] } },

    { page: "The difference" },
    { table: { head: ["", "Data analytics", "Data science"], rows: [
      ["Scope", "Narrower — one part of data science", "Wider — includes analytics and more"],
      ["Starting point", "A known question", "Data, and questions not yet asked"],
      ["Looks", "Mainly back and at now: what happened, why", "Mainly forward: what will happen, what to do"],
      ["Data", "Mostly structured, cleaned", "Raw, large, structured and unstructured"],
      ["Methods", "Querying, statistics, visualisation", "Programming, machine learning, AI, modelling"],
      ["Output", "Reports, dashboards, insights for a decision", "Models, algorithms, automated products"],
      ["Skills", "Business knowledge, statistics, BI tools", "Advanced statistics, programming, ML, domain knowledge"]
    ] } },
    { callout: { t: "tip", h: "The difference in one sentence", body: "**Data analytics answers the questions you already have from the data you already have; data science builds the models that find new questions and predict or automate the answers.**" } },
    { worked: { tag: "example", title: "Analytics or science?", q: "Say whether each task is data analytics or data science:\n- **(a)** a monthly report of A&E waiting times by hospital\n- **(b)** a model that reads chest X-rays and flags likely pneumonia.",
      steps: [
        { m: "(a) **Data analytics** — a known question answered from existing structured data, as a report.", mk: "✓" },
        { m: "(b) **Data science** — a machine learning model built on unstructured image data that predicts and automates.", mk: "✓", n: "Report on a set question → analytics. Model that learns, predicts or automates → science." }
      ], result: "(a) analytics · (b) science" } },

    { page: "Across the application areas" },
    { table: { head: ["Area (F201 1.4)", "Data analytics is used to…", "Data science is used to…"], rows: [
      ["**Banking**", "Report loan defaults, branch and app use; compare products.", "Detect fraud in real time; score credit risk with machine learning."],
      ["**Communications, media and entertainment**", "Measure viewing figures and which adverts performed.", "Recommend content to each user; predict which shows to commission."],
      ["**Education**", "Track attendance and results; compare groups of students.", "Predict students at risk of dropping out; adapt online learning to each student."],
      ["**Energy and utilities**", "Report use by region and time; analyse outages.", "Forecast demand with weather data; predict faults in the network (predictive maintenance)."],
      ["**Government**", "Publish statistics on services, tax collected, waiting times.", "Model population, traffic or the spread of disease; detect tax and benefit fraud."],
      ["**Healthcare**", "Monitor waiting times, bed occupancy, admissions trends.", "AI that reads scans; predict which patients will deteriorate or be readmitted."],
      ["**Insurance**", "Analyse claims by type, month and region.", "Price each policy by risk; score drivers from telematics; flag likely fraudulent claims."],
      ["**Manufacturing**", "Report output, defects and downtime per line.", "Predict machine failure from sensor data; camera-based quality checks."],
      ["**Retail**", "Find best and worst sellers, stock levels, loyalty card trends.", "Recommend products online; forecast demand; set prices dynamically."]
    ] } },
    { callout: { t: "tip", h: "Synoptic links", body: [
      "**F200 2.5.1** — what data analytics is and its purpose (the same purpose, at F200 depth); **F200 5.1** — job roles such as data analyst and data scientist.",
      "**F201 1.4** — the nine application areas used on this page.",
      "**F201 2.3** — analytics is mostly descriptive and diagnostic; data science adds predictive and prescriptive.",
      "**F201 2.4** — the software and storage each uses: BI and visualisation tools; data lakes, clusters and NoSQL.",
      "**F201 2.6** — the analytic techniques (regression, cluster analysis…) that both use.",
      "**F201 3.1** — machine learning and AI are data science's main tools.",
      "**F205** — data visualisation, the end of an analytics project; **F206** — analytics in digital marketing."
    ] } },

    { page: "In exam questions" },
    { callout: { t: "info", h: "The scenario", body: "**StreamBox** is a UK video streaming service with millions of subscribers. It records what each subscriber watches, when, on which device and for how long, and it wants to decide which new series to commission." } },
    { worked: { tag: "exam", title: "The purpose of data analytics", src: "OCR-style · Describe · 1 mark",
      q: "StreamBox will use data analytics to decide which new series to commission. Describe the purpose of data analytics.",
      steps: [
        { m: "To help StreamBox make sense of the data it has collected (1) / to analyse raw data to identify trends and patterns to help decision-making (1).", mk: "1", n: "Modelled on SAM Q6(a). Maximum one description. Credit any other appropriate response." }
      ], result: "Make sense of the data · find trends and patterns · support decisions" } },
    { worked: { tag: "exam", title: "How analytics software helps", src: "OCR-style · Explain · 2 marks",
      q: "Explain how data analytics software could help StreamBox make informed decisions about which new series to commission.",
      steps: [
        { m: "The software can identify trends and patterns in viewing data (1) so StreamBox knows which genres are growing in popularity and commissions series in those genres (1).", mk: "2", n: "Modelled on SAM Q6(b). Identify an action (1) + how StreamBox uses it (1). The expansion must relate to commissioning series." },
        { m: "OR: it can compare completion rates of past series (1) so StreamBox commissions the kind of series viewers watch to the end (1).", mk: "", n: "Maximum one explanation." }
      ], result: "Finds trends → commission what is growing" } },
    { worked: { tag: "exam", title: "The purpose of data science", src: "OCR-style · Describe · 2 marks",
      q: "StreamBox also employs data scientists. Describe the purpose of data science.",
      steps: [
        { m: "To extract knowledge from large, complex data, including unstructured data (1)…", mk: "1" },
        { m: "…by building models and algorithms, such as machine learning, that predict outcomes or automate decisions (1).", mk: "1", n: "Credit: to discover new insights / questions (1); to build AI products such as a recommendation engine (1)." }
      ], result: "Extract knowledge · build models that predict and automate" } },
    { worked: { tag: "exam", title: "Science vs analytics", src: "OCR-style · Explain · 2 marks",
      q: "Explain the difference between data science and data analytics.",
      steps: [
        { m: "Data analytics examines existing data to answer specific, known questions — e.g. which series were watched most (1)…", mk: "1" },
        { m: "…whereas data science is a wider field that uses programming, machine learning and AI to build models that predict or discover new questions — e.g. a recommendation engine (1).", mk: "1", n: "Both sides needed. Credit: analytics is part of data science (1); analytics mostly structured data, science raw and unstructured too (1)." }
      ], result: "Known questions from existing data vs models that predict and discover",
      "try": [{ notesOnly: true, grid: { cols: ["StreamBox task", "Analytics or science?"], rows: [
        ["A weekly report of the ten most-watched series", "analytics"],
        ["A model that learns what each viewer will watch next", "science"],
        ["A dashboard of subscribers gained and lost by month", "analytics"],
        ["Software that predicts which viewers will cancel", "science"],
        ["Comparing how far viewers got through last year's dramas", "analytics"],
        ["An AI that writes a summary of every review posted online", "science"]
      ], given: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]], cap: "Type analytics or science." } }] } },
    lor9("data science"),
    { worked: { tag: "exam", title: "Should StreamBox build its own recommendation model?", src: "OCR-style · Discuss · 9 marks",
      q: "StreamBox currently uses data analytics reports to choose which series to promote on its home page. It is considering employing a data science team to build a recommendation model that personalises the home page for each subscriber. Discuss whether StreamBox should use data science in this way.\n\nIn your answer you must write about:\n- any benefits to StreamBox\n- any limitations to StreamBox\n- whether you would recommend that StreamBox uses data science in this way and your reasons.",
      steps: [
        { m: "Difference stated: analytics reports show what was popular overall; data science would build a model that learns from each subscriber's own history and predicts what they will watch.", mk: "1", n: "Shows the difference — supports every level." },
        { m: "Benefit: each subscriber sees series they are likely to enjoy, so they watch more and are less likely to cancel — protecting subscription income.", mk: "1", n: "Benefits in context: Level 2 needs some." },
        { m: "Benefit: the model uses unstructured data too (what was searched, skipped or abandoned), finding preferences a report would miss.", mk: "1" },
        { m: "Benefit: it updates automatically for millions of subscribers in real time — impossible for staff choosing by hand.", mk: "1" },
        { m: "Limitation: data scientists are scarce specialists, and building and testing a model takes time with no guaranteed result.", mk: "1", n: "Limitations in context: both sides needed for Level 3." },
        { m: "Limitation: a model trained on past viewing can trap viewers in a ‘bubble’ of the same genre and under-promote new series StreamBox has paid for.", mk: "1" },
        { m: "Limitation: it relies on personal viewing data — StreamBox must meet UK GDPR (transparency, a lawful basis, security), and a breach or misuse would damage trust.", mk: "1" },
        { m: "Limitation: the model's choices can be hard to explain to managers, who may not trust it.", mk: "1" },
        { m: "Conclusion: recommend it — at StreamBox's scale personalisation is the most effective way to keep subscribers — but keep analytics reports to check the model, mix in new series deliberately, and be open with subscribers about how their data is used.", mk: "1", n: "Level 3: a clear recommendation with reasons that follow from the benefits and limitations." }
      ], result: "Level 3: both sides in StreamBox's context, then a justified recommendation" } },

    { page: "Exam toolkit" },
    { h: "Purposes — learn these" },
    { kv: [
      [
        "Data analytics",
        "Make sense of collected data · identify trends and patterns · support decision-making."
      ],
      [
        "Data science",
        "Extract knowledge from large, complex data · build models that predict and automate · discover new questions."
      ],
      ["Relationship", "Data analytics is one part of the wider field of data science."]
    ] },
    { callout: { t: "mnemonic", h: "Analytics Answers, Science Seeks", body: [
      "**A**nalytics **A**nswers the questions you **A**lready have.",
      "**S**cience **S**eeks new questions and **S**ets up models that predict.",
      "Nine areas: **B**ig **C**ats **E**at **E**very **G**reen **H**erb **I**n **M**y **R**ockery → Banking, Communications/media/entertainment, Education, Energy and utilities, Government, Healthcare, Insurance, Manufacturing, Retail."
    ] } },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "**“They are the same thing.”** — Analytics is a **part** of data science; the exam wants the difference.",
      "**“Analytics never predicts.”** — It is mainly descriptive and diagnostic but can forecast; data science goes further, building models that learn and automate.",
      "**“Data science is just bigger spreadsheets.”** — It uses programming, machine learning and AI on raw and unstructured data.",
      "**“Describe the purpose” = list the tools.** — The purpose is what it achieves (make sense of data, inform decisions), not the software.",
      "**Generic answers to an applied Explain** — the second mark needs the scenario (new series, new products)."
    ] } },
    { callout: { t: "tip", h: "How OCR marks it", body: [
      "**Describe the purpose** (1): one clear description — “to analyse raw data to identify trends and patterns to help decision-making”.",
      "**Explain how software could help** (2): identify an action (1) + how this organisation uses it (1); the expansion must fit the scenario.",
      "**Explain the difference** (2): one side (1) + the other side (1), joined by “whereas”.",
      "**Discuss** (9): benefits and limitations in context, then a recommendation with reasons."
    ] } }
  ],
  flashcards: [
    ["What is the purpose of data science?", "To extract knowledge from large, complex data and build models and algorithms (machine learning, AI) that predict, automate and discover.", 1],
    ["What is the key difference between data analytics and data science?", "Analytics answers known questions from existing data; data science is the wider field that builds models to predict and discover new questions.", 2],
    ["Give typical tools used for data analytics.", "Spreadsheets, SQL, data analytics software and data visualisation dashboards.", 3],
    ["Give typical tools used for data science.", "Programming languages such as Python and R, machine learning libraries, data lakes, NoSQL and clusters.", 4],
    ["Give one limitation of data analytics.", "It mostly explains the past, depends on clean structured data and only answers the questions asked.", 6],
    ["Give one limitation of data science.", "It needs scarce specialist skills, takes time with no guaranteed result, and biased data gives biased models.", 7],
    ["Which of the two works with raw, unstructured data?", "Data science; data analytics usually works on structured, cleaned data.", 8],
    ["Name the three disciplines data science combines.", "Statistics and maths, computing (programming, machine learning, AI), and domain knowledge of the business.", 101],
    ["How could a bank use data analytics and data science?", "Analytics: reports on loan defaults and app use. Science: real-time fraud detection and machine-learning credit scoring.", 102],
    ["How could a hospital use data analytics and data science?", "Analytics: waiting-time and bed-occupancy dashboards. Science: AI that reads scans; predicting which patients will deteriorate.", 103],
    ["How could a retailer use data analytics and data science?", "Analytics: best and worst sellers, stock levels. Science: product recommendations, demand forecasting, dynamic pricing.", 104],
    ["How could an energy company use data science?", "Forecast demand using weather data, and predict faults in the network before they happen.", 105],
    ["What does each produce as its main output?", "Data analytics: reports, dashboards and insights. Data science: models, algorithms and automated products.", 107]
  ],
  quiz: [
    { q: "Which task is data science rather than data analytics?", opts: ["A report of last month's sales", "A dashboard of waiting times", "A model predicting fraud live", "A chart of exam results by class"], ans: 2, why: "Building a model that predicts and automates is data science.", oi: 1 },
    { q: "How are the two fields related?", opts: ["Science is part of analytics", "Analytics is part of science", "They never overlap at all", "They are exactly the same"], ans: 1, why: "Data analytics is one part of the wider field of data science.", oi: 2 },
    { q: "Which data does data science typically use that analytics often does not?", opts: ["Cleaned sales tables", "Monthly KPI totals", "Spreadsheet summaries", "Raw unstructured data"], ans: 3, why: "Data science works with raw, large and unstructured data such as text and images.", oi: 3 },
    { q: "A hospital wants AI to flag likely tumours on scans. This is…", opts: ["Data science", "Data analytics", "Data wrangling", "Data archiving"], ans: 0, why: "A machine-learning model on image data is data science.", oi: 4 },
    { q: "Which is a limitation of data science?", opts: ["It only ever explains the past", "It needs scarce specialist skills", "It cannot handle any big data", "It only works inside spreadsheets"], ans: 1, why: "Data scientists combine rare skills in statistics, programming and ML.", oi: 5 },
    { q: "Which question is a typical data analytics question?", opts: ["What new product could we invent?", "Can a model write our adverts?", "Which store sold most last month?", "Can AI read handwritten forms?"], ans: 2, why: "A known question about existing data is data analytics.", oi: 6 },
    { q: "Which sector would use telematics models to price each driver's policy?", opts: ["Education", "Retail", "Government", "Insurance"], ans: 3, why: "Insurers use data science on telematics data to price risk.", oi: 7 },
    { q: "Which output is typical of data analytics?", opts: ["A dashboard of trends", "A trained AI model", "A new algorithm", "A self-driving system"], ans: 0, why: "Analytics outputs reports and dashboards; models and algorithms are data science outputs.", oi: 8 }
  ]
};

/* =====================================================================
   F201.2.6  Data analytic techniques
   ===================================================================== */
function regressionFig() {
  var pts = [[2, 230], [4, 240], [5, 330], [7, 350], [8, 420], [10, 430], [11, 520], [13, 520], [14, 600], [16, 610], [18, 700]];
  var it = pts.map(function (p) { return { pt: p, r: 4, c: "accent" }; });
  it.push({ fn: "150+30*x", from: 0, to: 20, c: "accent2", w: 2, label: "line of best fit", at: 17, pos: "nw" });
  it.push({ line: [[15, 600], [15, 0]], c: "muted", w: 1, dash: true });
  it.push({ line: [[15, 600], [0, 600]], c: "muted", w: 1, dash: true });
  it.push({ pt: [15, 600], r: 4, c: "accent2", label: "predict: 15k miles → £600", pos: "se" });
  return { fig: { x: [0, 20], y: [0, 900], w: 560, h: 320, axes: { x: "miles (k)", y: "cost £", xt: [5, 10, 15, 20], yt: [200, 400, 600, 800] }, items: it,
    cap: "Annual mileage (thousands, across) against yearly claims cost per driver (£, up), illustrative figures. Regression fits a line of best fit through the data. The line measures how strongly claims cost rises with mileage and lets the insurer predict the cost for a mileage it has not seen — but it shows a relationship, not proof that mileage causes the cost." } };
}
function monteFig() {
  var h = [200, 600, 1300, 1900, 2000, 1600, 1100, 650, 350, 180, 80, 40], it = [];
  h.forEach(function (v, i) {
    var x0 = 2 + i * 2;
    it.push({ poly: [[x0, 0], [x0 + 2, 0], [x0 + 2, v], [x0, v]], fill: x0 >= 20 ? "accent2" : "accent", alpha: 0.35, c: x0 >= 20 ? "accent2" : "accent", w: 1 });
  });
  it.push({ vline: 20, c: "danger", label: "97% of runs ≤ £20m" });
  it.push({ text: [14, 2250], t: "most likely: £10m–£12m", c: "accent", size: 11, b: true });
  return { fig: { x: [0, 28], y: [0, 2500], w: 560, h: 300, axes: { x: "£m", y: "runs", xt: [4, 8, 12, 16, 20, 24], yt: [500, 1000, 1500, 2000] }, items: it,
    cap: "A Monte Carlo simulation of a year's storm claims run 10,000 times (illustrative): total claims in £m across, number of runs up. Each run picks random values for the uncertain inputs; together the runs show the range of outcomes and how likely each is — here, enough to set aside £20m covers 97% of the simulated years." } };
}
function factorFig() {
  var it = [];
  var qs = ["Fair price", "Good discounts", "Value for money", "Quick payout", "Helpful staff", "Easy claim form"];
  qs.forEach(function (q, i) {
    it = it.concat(box(20, 12 + i * 34, 150, 26, [q], { c: "muted", a: 0.1, size: 10.5 }));
    var fy = i < 3 ? 60 : 162;
    it = it.concat(arrow(172, 25 + i * 34, 330, fy, "", { c: i < 3 ? "accent" : "accent2", w: 1.2 }));
  });
  it = it.concat(box(334, 34, 150, 52, ["Factor 1", "“Value”"], { c: "accent", a: 0.18 }), box(334, 136, 150, 52, ["Factor 2", "“Claims service”"], { c: "accent2", a: 0.2 }));
  it.push(txt(560, 52, "6 survey questions", { size: 10.5, c: "text2" }), txt(560, 68, "→ 2 underlying factors", { size: 10.5, c: "text2" }));
  it.push(txt(560, 150, "the analyst", { size: 10.5, c: "text2" }), txt(560, 166, "names each factor", { size: 10.5, c: "text2" }));
  return { fig: { w: 640, h: 220, items: it, cap: "Factor analysis finds which variables move together. Customers who rate “fair price” highly also rate “discounts” and “value” highly, so the three are explained by one factor; the analyst names it." } };
}
function clusterFig() {
  var A = [[20, 4], [22, 5], [19, 6], [24, 4.5], [21, 3.5], [23, 6.5]], B = [[38, 16], [42, 18], [45, 15], [40, 19], [48, 17], [44, 20]], Cc = [[65, 7], [70, 6], [68, 8.5], [72, 5], [62, 7.5], [75, 7]];
  var it = [];
  A.forEach(function (p) { it.push({ pt: p, r: 4, c: "accent" }); });
  B.forEach(function (p) { it.push({ pt: p, r: 4, c: "accent2" }); });
  Cc.forEach(function (p) { it.push({ pt: p, r: 4, c: "accent3" }); });
  it.push({ circle: [21.5, 5, 6], c: "accent", w: 1.2, dash: true }, { circle: [43, 17.5, 7.5], c: "accent2", w: 1.2, dash: true }, { circle: [68.5, 6.5, 8], c: "accent3", w: 1.2, dash: true });
  it.push({ text: [21.5, 12.5], t: "young · short trips", c: "accent", size: 10.5, b: true });
  it.push({ text: [43, 23.5], t: "commuters · long miles", c: "accent2", size: 10.5, b: true });
  it.push({ text: [68.5, 16], t: "retired · local", c: "accent3", size: 10.5, b: true });
  it.push({ pt: [57, 23], r: 4, c: "danger", label: "outlier — check", pos: "e" });
  return { fig: { x: [10, 85], y: [0, 26], w: 560, h: 300, axes: { x: "age", y: "miles (k)", xt: [20, 40, 60, 80], yt: [5, 10, 15, 20, 25] }, items: it,
    cap: "Drivers plotted by age (across) and miles a year in thousands (up), illustrative. Cluster analysis groups them by similarity with no groups set in advance. Three clusters appear; the analyst gives each a name and a product. A point far from every cluster is worth checking — it could be an error or fraud." } };
}
function seriesFig() {
  return { fig: { x: [0, 36], y: [0, 800], w: 560, h: 300, axes: { x: "month", y: "claims", xt: [12, 24, 36], yt: [200, 400, 600] }, items: [
    { fn: "380+5*x+90*cos(2*pi*x/12)", from: 0, to: 36, c: "accent", w: 2, label: "actual claims", at: 25, pos: "ne" },
    { fn: "380+5*x", from: 0, to: 36, c: "accent2", w: 1.6, dash: true, label: "trend", at: 34, pos: "s" },
    { pt: [0, 470], r: 3.5, c: "danger", label: "winter peak", pos: "ne" },
    { pt: [6, 320], r: 3.5, c: "accent3", label: "summer dip", pos: "s" },
    { pt: [12, 530], r: 3.5, c: "danger" },
    { pt: [24, 590], r: 3.5, c: "danger" }
  ], cap: "A time series of claims each month from January 2024 (month 0), illustrative: a rising trend (dashed) with a seasonal pattern on top — more claims every winter, fewer every summer. Separating the two lets the insurer forecast next winter's peak and staff for it." } };
}

C["it:F201.2.6"] = {
  notes: [
    { h: "Data analytic techniques — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (F201 2.6)", body: [
      "**To include:** what each technique is · the purpose of each · when each can be used · the benefits and limitations of each.",
      "**Does not include:** the technical details of each technique — no formulas or calculations.",
      "**Exam evidence:** SAM Q6(c) (discuss whether a retailer should use cluster analysis, 9 marks) and Q6(d) (state two techniques other than cluster analysis, 2 marks)."
    ] } },
    { kv: [
      [
        "Techniques",
        "regression analysis · Monte Carlo simulation · factor analysis · cohort analysis · cluster analysis · time series analysis"
      ]
    ] },
    { ol: ["**Regression analysis**.", "**Monte Carlo simulation**.", "**Factor analysis**.", "**Cohort analysis**.", "**Cluster analysis**.", "**Time series analysis**.", "**Choosing a technique** — the six side by side.", "**In exam questions** — worked answers in OCR's format.", "**Exam toolkit** — the list, traps, mnemonic and links."] },
    { table: { head: ["Technique", "In one line", "Question it answers"], rows: [
      ["Regression", "Measures how one variable changes with others", "How much does X affect Y? What will Y be?"],
      ["Monte Carlo simulation", "Runs a model thousands of times with random inputs", "What range of outcomes could happen, and how likely is each?"],
      ["Factor analysis", "Reduces many variables to a few hidden factors", "What really lies behind these answers?"],
      ["Cohort analysis", "Tracks groups who share a start point over time", "How do people who joined at the same time behave later?"],
      ["Cluster analysis", "Finds groups of similar items, none set in advance", "What natural groups are in the data?"],
      ["Time series analysis", "Finds trend and seasonal patterns over time", "What is the pattern over time, and what comes next?"]
    ] } },

    { page: "Regression analysis" },
    { callout: { t: "def", h: "Regression analysis", body: "A statistical technique that estimates the **relationship between a dependent (outcome) variable and one or more independent (predictor) variables** by fitting a line or curve of best fit, so the outcome can be **predicted** and each factor's **influence measured**." } },
    regressionFig(),
    { kv: [
      ["Purpose", "To understand which factors affect an outcome and by how much, and to predict the outcome from those factors."],
      ["When it can be used", "Pricing (claims cost from mileage and age) · sales from advertising spend · energy demand from temperature · house prices from size and location."]
    ] },
    { table: { head: ["Benefits", "Limitations"], rows: [
      ["**Predicts** an outcome from known factors.", "**Correlation is not causation** — a link may not be a cause."],
      ["**Measures** how strongly each factor matters, so effort goes where it counts.", "Assumes the **shape** of the relationship (e.g. a straight line); a poor fit misleads."],
      ["Results are **easy to show** on a graph.", "**Outliers** can pull the line badly."],
      ["Well understood and widely supported in software.", "Predicting **outside the range** of the data (extrapolation) is unreliable."]
    ] } },

    { page: "Monte Carlo simulation" },
    { callout: { t: "def", h: "Monte Carlo simulation", body: "A technique that **runs a model of a situation thousands of times**, each time picking **random values for the uncertain inputs**, to build up the **range of possible outcomes and the probability of each**. Named after the Monte Carlo casino, because it relies on chance." } },
    monteFig(),
    { kv: [
      ["Purpose", "To measure **risk and uncertainty** — not one forecast, but how likely each outcome is."],
      ["When it can be used", "How much money to hold for claims · whether a project finishes on time and budget · investment and pension risk · energy demand and supply · stock levels under uncertain demand."]
    ] },
    { table: { head: ["Benefits", "Limitations"], rows: [
      ["Shows the **full range** of outcomes and their **probabilities**, not a single guess.", "Only as good as its **input assumptions** — wrong ranges give wrong results."],
      ["Handles **many uncertain variables** at once.", "Needs **a lot of computing power and time** for many runs."],
      ["Lets managers test **“what if?”** scenarios safely.", "Needs **skilled staff** to build the model and explain it."],
      ["Supports decisions on **how much risk** to accept.", "The precise-looking output can give a **false sense of certainty**."]
    ] } },

    { page: "Factor analysis" },
    { callout: { t: "def", h: "Factor analysis", body: "A technique that **reduces a large number of variables to a smaller number of underlying factors**, by finding which variables are **correlated** (move together) and so are probably explained by the same hidden cause." } },
    factorFig(),
    { kv: [
      ["Purpose", "To **simplify** data with many variables and **reveal the hidden dimensions** behind them."],
      ["When it can be used", "Customer satisfaction surveys and questionnaires · market research · designing shorter surveys · reducing variables before other analysis (e.g. regression)."]
    ] },
    { table: { head: ["Benefits", "Limitations"], rows: [
      ["**Simplifies** dozens of variables into a few that are easier to act on.", "Factors must be **named and interpreted by people** — subjective."],
      ["**Reveals hidden drivers** (e.g. “value” behind price questions).", "Needs a **large sample** to be reliable."],
      ["Helps **design better surveys** — drop questions that measure the same thing.", "Results depend on **which variables are included**."],
      ["Makes **later analysis** faster and clearer.", "Assumes simple (linear) relationships; may miss others."]
    ] } },

    { page: "Cohort analysis" },
    { callout: { t: "def", h: "Cohort analysis", body: "A technique that **splits people into cohorts — groups who share a characteristic or experience in the same time period** (e.g. joined in the same month) — and **tracks and compares each cohort's behaviour over time**. The groups are **defined in advance**." } },
    { table: { head: ["Joined (cohort)", "Start", "After 3 months", "After 6 months", "After 12 months"], rows: [
      ["January 2025", "100%", "91%", "84%", "71%"],
      ["April 2025", "100%", "93%", "87%", "75%"],
      ["July 2025 (new app)", "100%", "96%", "93%", "—"],
      ["October 2025 (new app)", "100%", "97%", "—", "—"]
    ] } },
    { callout: { t: "info", h: "Reading the cohort table", body: [
      "Each row is a cohort; each column is time since joining. Illustrative figures: % of each cohort still insured.",
      "Cohorts that joined after the new app was launched keep more customers at 3 and 6 months — evidence the app helps retention.",
      "Blank cells are months that have not happened yet."
    ] } },
    { kv: [
      ["Purpose", "To see **how behaviour changes over a customer's lifetime**, and whether a change (a new app, a price, a campaign) affected those who joined after it."],
      ["When it can be used", "Retention and churn · lifetime value of customers recruited by different campaigns · students starting in the same year · patients starting a treatment in the same month."]
    ] },
    { table: { head: ["Benefits", "Limitations"], rows: [
      ["Shows **retention and churn** clearly over time.", "Groups are **set in advance** — other differences may be missed."],
      ["Compares the **effect of changes** on new joiners.", "Needs **data over a long period** before patterns show."],
      ["Identifies **when** customers are most likely to leave, so action can be timed.", "Shows **what** happened to each cohort, **not why**."],
      ["Simple to present as a table or chart.", "**Outside events** (a recession) can affect cohorts differently and confuse the comparison; small cohorts are unreliable."]
    ] } },

    { page: "Cluster analysis" },
    { callout: { t: "def", h: "Cluster analysis", body: "A technique that **sorts objects or data points into groups (clusters)** so that items in the same cluster are **more similar to each other** than to items in other clusters, **identifying the degree of association**. The groups are **not set in advance** — they emerge from the data." } },
    clusterFig(),
    { kv: [
      ["Purpose", "To discover **natural groups** in data and how strongly items are associated — the SAM's wording: to sort objects or data points into groups to identify the degree of association."],
      ["When it can be used", "Customer segmentation (by age, location, online or in store) · targeted marketing · grouping products bought together · spotting fraud (transactions outside every cluster) · grouping locations or patients."]
    ] },
    { table: { head: ["Benefits", "Limitations"], rows: [
      ["**Clear links** between data — groups and their associations are identified.", "**Incorrect selection of data** leads to incorrect results."],
      ["**Groups can be analysed separately** — e.g. how often each buys — for informed decisions.", "Some associations can be **false** if the groups are not formed correctly."],
      ["Identifies **“bad” transactions** outside the clusters — possible fraud.", "**Incorrect analysis** leads to incorrect decisions."],
      ["Grouping can **reduce the volume of data** to work with.", "The analyst must choose **how many clusters** and **name them**; results shift with these choices and with outliers."]
    ] } },
    { callout: { t: "warn", h: "Cluster vs cohort", body: "**Cohort**: groups are **defined first** by a shared start (joined in March) and followed over time. **Cluster**: groups are **found by the analysis** from similarity. The exam rewards that difference." } },

    { page: "Time series analysis" },
    { callout: { t: "def", h: "Time series analysis", body: "A technique that analyses **data recorded at regular intervals over time** (daily, monthly, yearly) to identify the **trend, seasonal patterns, cycles and irregular changes**, and to **forecast** future values." } },
    seriesFig(),
    { table: { head: ["Part of a time series", "Meaning", "Example"], rows: [
      ["Trend", "The long-term direction", "Claims rising by about 5 a month"],
      ["Seasonality", "A pattern repeating at the same time each year (or week, or day)", "A winter peak every year"],
      ["Cycle", "Longer rises and falls, not tied to the calendar", "Economic booms and slowdowns"],
      ["Irregular", "One-off, random changes", "A storm or a pandemic lockdown"]
    ] } },
    { kv: [
      ["Purpose", "To understand how something changes over time and **forecast** what comes next."],
      ["When it can be used", "Monthly sales and stock planning · claims and staffing · energy demand by hour · website traffic · share prices · hospital admissions in winter."]
    ] },
    { table: { head: ["Benefits", "Limitations"], rows: [
      ["**Forecasts** future values for planning.", "Assumes **past patterns continue**."],
      ["Reveals **seasonal patterns**, so staff and stock match demand.", "**One-off events** (a pandemic) break the pattern."],
      ["Separates real change (trend) from the usual seasonal ups and downs.", "Needs a **long, consistent history** — years for yearly seasons."],
      ["Spots **anomalies** — a month far from the expected value.", "Shows **when**, **not why** — causes need other techniques."]
    ] } },

    { page: "Choosing a technique" },
    { steps: [
      { h: "Predict one value from others, or measure a factor's effect?", m: "Regression analysis.", n: "Price from mileage; sales from advertising." },
      { h: "Many uncertain inputs — need the range and likelihood of outcomes?", m: "Monte Carlo simulation.", n: "Risk, reserves, project deadlines." },
      { h: "Too many related variables — need the few behind them?", m: "Factor analysis.", n: "Survey questions → underlying factors." },
      { h: "Compare groups who started at the same time, over time?", m: "Cohort analysis.", n: "Customers who joined each month." },
      { h: "Find groups nobody has defined yet?", m: "Cluster analysis.", n: "Customer segments; fraud outliers." },
      { h: "Data at regular intervals — find the pattern and forecast?", m: "Time series analysis.", n: "Monthly claims; hourly demand." }
    ] },
    { worked: { tag: "example", title: "Which technique fits?", q: "A garden centre chain wants to:\n- **(a)** forecast next spring's compost sales from five years of monthly sales\n- **(b)** find natural groups among its loyalty-card customers.",
      steps: [
        { m: "(a) **Time series analysis** — monthly data over years, with a strong spring season, to forecast.", mk: "✓" },
        { m: "(b) **Cluster analysis** — groups are not known in advance; the analysis finds them.", mk: "✓", n: "Name the technique, then give the reason from its purpose." }
      ], result: "Time series · cluster" } },
    { callout: { t: "tip", h: "Synoptic links", body: [
      "**F201 2.3** — regression and time series power **predictive** mining; Monte Carlo supports **prescriptive**; cohort and cluster are often **diagnostic**.",
      "**F201 2.4** — data analytics software runs the techniques; visualisation software presents the results.",
      "**F201 2.5** — these are the tools of both data analytics and data science.",
      "**F201 3.1** — **k-means** is a machine learning algorithm for cluster analysis; decision trees and random forests also predict.",
      "**F201 4.2** — segmenting people by cluster can create bias and unfair treatment.",
      "**F200 2.5–2.6** — the types of analytics and the charts (scatter, line) used to show these results; **F202** spreadsheet models (what-if, trend lines); **F205** data visualisation; **F206** customer segmentation in digital marketing."
    ] } },

    { page: "In exam questions" },
    { callout: { t: "info", h: "The scenario", body: "**ShieldDrive** is a UK car insurer with 800,000 customers. It holds policy records, claims, customer surveys and telematics data from “black box” devices that record how and when customers drive." } },
    { worked: { tag: "exam", title: "Two other techniques", src: "OCR-style · State · 2 marks",
      q: "ShieldDrive uses time series analysis on its monthly claims. State two data analytic techniques, other than time series analysis.",
      steps: [
        { m: "Any two from:\n- regression analysis (1)\n- Monte Carlo simulation (1)\n- factor analysis (1)\n- cohort analysis (1)\n- cluster analysis (1).", mk: "2", n: "Modelled on SAM Q6(d). One mark each." },
        { m: "Do not accept: time series analysis — it is named in the question.", mk: "0" }
      ], result: "e.g. regression analysis; cohort analysis" } },
    { worked: { tag: "exam", title: "The right technique for each task", src: "OCR-style · Identify · 3 marks",
      q: "ShieldDrive wants to:\n- **(i)** find out how much a driver's age and annual mileage affect the cost of their claims\n- **(ii)** estimate the probability that next winter's storm claims exceed its reserve\n- **(iii)** compare how many customers who joined in each month of 2025 renewed a year later.\n\nIdentify the most suitable data analytic technique for each task.",
      steps: [
        { m: "(i) Regression analysis (1).", mk: "1" },
        { m: "(ii) Monte Carlo simulation (1).", mk: "1" },
        { m: "(iii) Cohort analysis (1).", mk: "1", n: "Correct answers only. Clue words: how much affect → regression; probability under uncertainty → Monte Carlo; groups by joining month → cohort." }
      ], result: "Regression · Monte Carlo · cohort",
      "try": [{ notesOnly: true, grid: { cols: ["ShieldDrive's task", "Technique"], rows: [
        ["Predict a claim's cost from the car's age and value", "regression"],
        ["Model 10,000 possible flood seasons to set a reserve", "monte carlo"],
        ["Reduce 30 survey questions to a few underlying themes", "factor"],
        ["Follow customers who joined after a TV advert over two years", "cohort"],
        ["Find groups of drivers with similar telematics patterns", "cluster"],
        ["Forecast next December's claims from five years of monthly data", "time series"]
      ], given: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]], cap: "Type one of: regression, monte carlo, factor, cohort, cluster, time series." } }] } },
    { worked: { tag: "exam", title: "Regression: a benefit and a limitation", src: "OCR-style · Explain · 4 marks",
      q: "ShieldDrive plans to use regression analysis to set prices from drivers' details. Explain one benefit and one limitation to ShieldDrive of using regression analysis.",
      steps: [
        { m: "Benefit: it measures how strongly each factor (age, mileage, car value) affects the cost of claims (1) so ShieldDrive can price each policy to its risk and stay competitive (1).", mk: "2", n: "Identify (1) + application (1). Maximum one benefit." },
        { m: "Limitation: it shows correlation, not causation (1) so ShieldDrive could charge a group more for a factor that does not really cause claims, losing customers or treating them unfairly (1).", mk: "2", n: "OR: predictions outside the data's range are unreliable (1) so prices for very high-mileage drivers may be wrong (1). Maximum one limitation." }
      ], result: "Measures each factor's effect · but correlation is not causation" } },
    { worked: { tag: "exam", title: "Using cohort analysis", src: "OCR-style · Explain · 2 marks",
      q: "ShieldDrive launched a new mobile app in July 2025. Explain how ShieldDrive could use cohort analysis to judge whether the app has improved customer retention.",
      steps: [
        { m: "Group customers into cohorts by the month they joined, before and after July 2025 (1)…", mk: "1" },
        { m: "…and compare the percentage of each cohort still insured after 3, 6 and 12 months; higher retention in the later cohorts suggests the app helps (1).", mk: "1", n: "Both the grouping and the comparison over time are needed." }
      ], result: "Cohorts by joining month → compare retention over time" } },
    lor6("time series analysis"),
    { worked: { tag: "exam", title: "Time series for planning", src: "OCR-style · Analyse · 6 marks",
      q: "ShieldDrive has five years of monthly claims data. Analyse how time series analysis could help ShieldDrive plan its claims department.",
      steps: [
        { m: "It separates the long-term trend from the seasonal pattern, so ShieldDrive can see whether claims are really rising or just following the usual winter peak.", mk: "1", n: "Each point linked to a consequence for the department." },
        { m: "Seasonality shows claims peak each winter (ice, dark evenings), so extra claims handlers can be recruited or rota'd in before the peak and customers are not left waiting.", mk: "1" },
        { m: "A forecast of next year's monthly claims lets managers budget for staff and payouts in advance.", mk: "1" },
        { m: "A month far above the forecast can be spotted quickly as an anomaly — a storm, or a sign of fraud — and investigated.", mk: "1" },
        { m: "Limitation: it assumes past patterns continue; a one-off event (a major flood, a change in the law) would make the forecast wrong, so plans need slack.", mk: "1" },
        { m: "Limitation: it shows when claims rise, not why — ShieldDrive would need other techniques (e.g. regression with weather data) to explain the causes.", mk: "1", n: "Level 3: a range of uses explained in the department's context, weighed with limitations, using terms such as trend, seasonality and forecast." }
      ], result: "Level 3: trend, season, forecast and anomalies — each tied to staffing and budgets — weighed with limitations" } },
    lor9("Monte Carlo simulation"),
    { worked: { tag: "exam", title: "Should ShieldDrive use Monte Carlo simulation?", src: "OCR-style · Discuss · 9 marks",
      q: "ShieldDrive must decide how much money to keep in reserve to pay storm-damage claims next winter. Discuss whether ShieldDrive should use Monte Carlo simulation to make this decision.\n\nIn your answer you must write about:\n- any benefits to ShieldDrive\n- any limitations to ShieldDrive\n- whether you would recommend that ShieldDrive uses Monte Carlo simulation and your reasons.",
      steps: [
        { m: "Purpose: Monte Carlo runs a model of the winter thousands of times with random values for the uncertain inputs (number of storms, their strength, how many customers are hit, repair costs), giving the range of total claims and the probability of each.", mk: "1", n: "Shows what the technique is — the base of every level. Modelled on the structure of SAM Q6(c)." },
        { m: "Benefit: instead of one guess, ShieldDrive sees how likely each total is — e.g. the reserve needed to cover 97% of simulated winters — so it can choose its level of risk.", mk: "1", n: "Benefits in context." },
        { m: "Benefit: it handles many uncertain variables together, which a single forecast or a spreadsheet average cannot.", mk: "1" },
        { m: "Benefit: managers can test what-if scenarios (more frequent storms with climate change, higher repair costs) before they happen.", mk: "1" },
        { m: "Benefit: holding the right reserve avoids both running short (unable to pay claims) and tying up too much money that could be invested.", mk: "1" },
        { m: "Limitation: the results are only as good as the assumptions — if the storm or cost ranges are wrong, so is the reserve.", mk: "1", n: "Limitations in context: both sides for Level 3." },
        { m: "Limitation: it needs skilled analysts and a lot of computing power, and its precise-looking output can give managers false confidence.", mk: "1" },
        { m: "Limitation: past storm data may not reflect a changing climate, so the model must be updated each year.", mk: "1" },
        { m: "Conclusion: recommend it — the decision is about uncertainty, which is exactly what Monte Carlo measures — provided the inputs come from good historical and weather data, are reviewed each year, and the result is used with managers' judgement and a safety margin.", mk: "1", n: "Level 3: a clear, justified recommendation that follows from the points." }
      ], result: "Level 3: benefits and limitations for ShieldDrive's reserve, then a justified recommendation" } },

    { page: "Exam toolkit" },
    { callout: { t: "memorise", h: "The six techniques — the spec's names", body: [
      "Regression analysis",
      "Monte Carlo simulation",
      "Factor analysis",
      "Cohort analysis",
      "Cluster analysis",
      "Time series analysis"
    ] } },
    { callout: { t: "mnemonic", h: "Remember the six", body: [
      "**R**eal **M**agicians **F**ind **C**ards **C**leverly **T**ucked → Regression, Monte Carlo, Factor, Cohort, Cluster, Time series.",
      "**Cohort = Class of 2025** (set in advance, followed over time). **Cluster = Crowd that forms** (found by the data).",
      "**Monte Carlo = Many Chances** — thousands of random runs."
    ] } },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "**“Cohort and cluster are the same.”** — Cohorts are defined in advance by a shared start; clusters are discovered.",
      "**“Regression proves a cause.”** — It measures a relationship; correlation is not causation.",
      "**“Monte Carlo predicts the exact outcome.”** — It gives a range and probabilities, and depends on its assumptions.",
      "**“Factor analysis adds more variables.”** — It reduces many variables to a few factors.",
      "**“Time series explains why.”** — It shows the pattern and forecasts; it does not give causes.",
      "**Repeating the technique in the stem** — “other than cluster analysis” means cluster analysis earns nothing.",
      "**Formulas** — technical details are excluded; explain purpose, use, benefits and limitations."
    ] } },
    { callout: { t: "tip", h: "How OCR marks it", body: [
      "**State** techniques (1 each): the spec's name — “Monte Carlo simulation”, not “random modelling”.",
      "**Identify** the technique for a task: match the clue (how much affects → regression; probability → Monte Carlo; themes → factor; joined in → cohort; groups → cluster; monthly → time series).",
      "**Explain** a benefit or limitation (2): identify (1) + effect on the organisation (1).",
      "**Discuss** (9, as SAM Q6(c)): examples of use, benefits AND limitations in context, and a recommendation with reasons. The SAM's indicative content for cluster analysis: clear links between data; groups analysed separately; “bad” transactions spotted; data volume reduced — against wrong data selection, false associations, wrong analysis."
    ] } }
  ],
  flashcards: [
    ["What is the purpose of regression analysis?", "To model the relationship between an outcome and one or more factors, so the outcome can be predicted and each factor's effect measured.", 0],
    ["Give one limitation of regression analysis.", "Correlation is not causation; it also assumes the shape of the relationship and is pulled by outliers.", 1],
    ["What does Monte Carlo simulation do?", "Runs a model thousands of times with random values for the uncertain inputs, giving the range of possible outcomes and the probability of each.", 2],
    ["Give one limitation of Monte Carlo simulation.", "Its results are only as good as its input assumptions; it also needs a lot of computing power and skill.", 3],
    ["What does factor analysis do?", "Reduces many correlated variables to a few underlying factors that explain them (e.g. survey questions → “value”).", 4],
    ["Give one limitation of factor analysis.", "The factors must be named and interpreted by people, which is subjective; it also needs a large sample.", 5],
    ["What does cohort analysis group people by?", "A shared characteristic or experience in the same period (e.g. joined in March), set in advance — then tracks each group over time.", 6],
    ["What does cluster analysis group data by?", "Similarity — items in a cluster are more alike than items in other clusters; the groups are found by the analysis, not set in advance.", 7],
    ["What is the key difference between cluster and cohort analysis?", "Cohort groups are defined beforehand by a shared start; cluster groups are discovered from the data.", 8],
    ["What is the purpose of time series analysis?", "To find the trend and seasonal patterns in data recorded at regular intervals, and forecast future values.", 9],
    ["Name the six data analytic techniques in the specification.", "Regression analysis, Monte Carlo simulation, factor analysis, cohort analysis, cluster analysis, time series analysis.", 100],
    ["Give two benefits of cluster analysis to a retailer.", "Clear links between customer groups and products; groups can be analysed separately to inform decisions — also spots unusual (possibly fraudulent) transactions.", 101],
    ["Give two limitations of cluster analysis.", "Incorrect selection of data gives incorrect results, and associations can be false if groups are formed badly — leading to wrong decisions.", 102],
    ["Name the four parts of a time series.", "Trend, seasonality, cycles and irregular (one-off) variation.", 103],
    ["When would Monte Carlo simulation be used?", "When a decision depends on many uncertain inputs — financial risk, insurance reserves, project deadlines, energy supply.", 104],
    ["Give one benefit of cohort analysis.", "It shows retention over time and whether a change (an app, a campaign) helped those who joined after it.", 105]
  ],
  quiz: [
    { q: "Which technique sorts data into groups that are not defined in advance?", opts: ["Cohort analysis", "Regression analysis", "Cluster analysis", "Time series analysis"], ans: 2, why: "Cluster analysis discovers groups from similarity; cohorts are defined first." },
    { q: "An insurer models 10,000 possible winters to set a reserve. Which technique?", opts: ["Monte Carlo simulation", "Factor analysis of data", "Cohort analysis of joiners", "Cluster analysis of data"], ans: 0, why: "Repeated random runs giving a range of outcomes is Monte Carlo simulation." },
    { q: "Which is a limitation of regression analysis?", opts: ["It cannot make any prediction", "A link may not be a cause", "It needs no data at all", "It only works on images"], ans: 1, why: "Regression measures a relationship; correlation is not causation." },
    { q: "Thirty survey questions are reduced to four themes. Which technique?", opts: ["Time series analysis", "Cluster analysis", "Regression analysis", "Factor analysis"], ans: 3, why: "Factor analysis reduces many correlated variables to a few factors." },
    { q: "Customers who joined in March are followed for a year. Which technique?", opts: ["Cohort analysis", "Cluster analysis", "Monte Carlo simulation", "Factor analysis"], ans: 0, why: "A group sharing a start point, tracked over time, is a cohort." },
    { q: "Which shows a winter peak repeating every year?", opts: ["The trend", "An irregular change", "Seasonality", "A cluster"], ans: 2, why: "A pattern that repeats at the same time each year is seasonality." },
    { q: "Which is a limitation of time series analysis?", opts: ["It cannot forecast at all", "It needs no history", "It shows patterns by age", "It assumes the past repeats"], ans: 3, why: "Forecasts assume past patterns continue; one-off events break them." },
    { q: "Which is a benefit of Monte Carlo simulation?", opts: ["A range with probabilities", "No assumptions are needed", "It needs little computing", "It proves a single result"], ans: 0, why: "It shows the spread of possible outcomes and how likely each is." },
    { q: "A question asks for two techniques “other than cluster analysis”. Which earns no mark?", opts: ["Cohort analysis", "Cluster analysis", "Factor analysis", "Regression analysis"], ans: 1, why: "Repeating the technique named in the stem is not accepted (SAM Q6(d))." },
    { q: "Which technique predicts claim cost from a car's age and value?", opts: ["Cohort analysis", "Factor analysis", "Regression analysis", "Cluster analysis"], ans: 2, why: "Predicting an outcome from factors is regression." }
  ]
};

/* the levels helpers return two blocks: the notes are flattened one level */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !Array.isArray(C[k].notes)) return;
  C[k].notes = [].concat.apply([], C[k].notes);
});

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = KOS.content.examFromWorked(C[k].notes, "OCR");
});

})(window.KOS_CONTENT);
