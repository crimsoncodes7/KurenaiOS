/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.11.1
   (Big Data: volume, velocity and variety; distributing storage and
   processing; why functional programming fits; the fact-based model and
   graph schemas) at full A-level depth. It REPLACES the short entry
   the retired cs-advanced.js carried; every way AQA has examined it (7517/2 June
   2018–2024, including the 2021 12-mark essay, whose full mark scheme was
   read from the original paper) is explained, worked and answered in the
   mark scheme's own format. Past-paper banks stay in bank-cs-410-413.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }
function boxAt(x, y, w, h, label, col, sub) {
  var it = [{ poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill: col || "accent", alpha: 0.16, c: col || "accent", w: 1.6 }];
  if (label) it.push(txt(x + w / 2, y + (sub ? h / 2 - 8 : h / 2), label, { b: true, size: 12, c: "text" }));
  if (sub) it.push(txt(x + w / 2, y + h / 2 + 9, sub, { size: 10.5 }));
  return it;
}
function arrow(x1, y1, x2, y2, label, o) {
  o = o || {};
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: o.both ? "both" : true, c: o.c || "accent2", w: o.w || 2, dash: o.dash }];
  if (label) it.push(txt((x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 - 10 + (o.dy || 0), label, { size: 10.5, c: o.c || "accent2" }));
  return it;
}

/* A graph schema. nodes: {id, x, y, l1, l2, prop?, col?} — a node is an
   oval (entity), a prop a rectangle (property). links: [a, b, label|null,
   "solid"|"dash", {lx, ly, c}]. Returns the figure spec. */
function schema(nodes, links, cap, o) {
  o = o || {};
  var it = [], N = {};
  nodes.forEach(function (n) {
    var col = n.col || "accent";
    if (n.prop) {
      var w = n.w || 112, h = 36;
      N[n.id] = { x: n.x, y: n.y, w: w, h: h, rect: true };
      it.push({ poly: [[n.x - w / 2, n.y - h / 2], [n.x + w / 2, n.y - h / 2], [n.x + w / 2, n.y + h / 2], [n.x - w / 2, n.y + h / 2]], fill: col, alpha: 0.08, c: col, w: 1.5 });
    } else {
      var rx = n.rx || 64, ry = 26, pts = [];
      for (var i = 0; i < 40; i++) { var a = i / 40 * 2 * Math.PI; pts.push([n.x + rx * Math.cos(a), n.y + ry * Math.sin(a)]); }
      N[n.id] = { x: n.x, y: n.y, rx: rx, ry: ry };
      it.push({ poly: pts, fill: col, alpha: 0.16, c: col, w: 1.6 });
    }
    it.push(txt(n.x, n.y - 7, n.l1, { b: true, size: 11, c: "text" }), txt(n.x, n.y + 8, n.l2, { size: 10.5, c: "text2" }));
  });
  function edgePt(A, dx, dy) {
    if (A.rect) {
      var t = Math.min(dx ? (A.w / 2) / Math.abs(dx) : Infinity, dy ? (A.h / 2) / Math.abs(dy) : Infinity);
      return [A.x + t * dx, A.y + t * dy];
    }
    var k = 1 / Math.sqrt((dx / A.rx) * (dx / A.rx) + (dy / A.ry) * (dy / A.ry));
    return [A.x + k * dx, A.y + k * dy];
  }
  links.forEach(function (l) {
    var A = N[l[0]], B = N[l[1]], lo = l[4] || {}, dx = B.x - A.x, dy = B.y - A.y;
    var p = edgePt(A, dx, dy), q = edgePt(B, -dx, -dy), col = lo.c || (l[3] === "dash" ? "muted" : "text2");
    it.push({ line: [p, q], c: col, w: 1.6, dash: l[3] === "dash" ? "5 4" : undefined });
    if (l[2]) it.push(txt((p[0] + q[0]) / 2 + (lo.lx || 0), (p[1] + q[1]) / 2 + (lo.ly == null ? -9 : lo.ly), l[2], { size: 10.5, c: lo.c || "text2" }));
  });
  return { w: o.w || 640, h: o.h || 330, items: it, cap: cap };
}

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA mark scheme", body: [
  "Each creditworthy point ends in a semicolon (**;**) and earns one mark. **Max n** caps the total. **NE.** not enough · **A.** accept · **R.** reject · **DPT** lose it once.",
  "Big Data's characteristics need their MEANING: **NE.** \"volume\" or \"velocity\" on its own, **NE.** \"high velocity of data\" or \"speed data is sent at\" — velocity is about data that must be **processed** very quickly.",
  "Graph schemas: DPT wrong line style, wrong shapes, missing labels on solid lines, labels on dashed lines; R. two properties in one box."
] } };

/* =====================================================================
   4.11.1  Big Data
   ===================================================================== */
C["compsci:4.11.1"] = {
  notes: [
    { h: "Big Data — the whole topic on one page" },
    { callout: { t: "info", h: "What the specification asks (4.11.1)", body: ["Know that **Big Data** is a catch-all term for data that won't fit the usual containers, described by **volume**, **velocity** and **variety**.", "That when data will not fit on one server the **processing must be distributed** and **functional programming** makes correct, distributable code easier to write, and which of its features do so.", "Be familiar with the **fact-based model** and the **graph schema** (nodes, edges and properties)."] } },
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Characteristics of Big Data", "Describe", "1–2", "A-level 2018 Q14.1, 2023 Q08.1"],
      ["Complete a graph schema for new facts", "Complete / Modify", "3", "A-level 2018 Q14.2, 2023 Q08.2"],
      ["Functional features that ease distributed code", "State / Describe", "2", "A-level 2023 Q08.3, 2024 Q11.2"],
      ["What Big Data is, its challenges and the ethics", "Discuss (12-mark essay)", "12", "A-level 2021 Q09"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**What Big Data is**: the three Vs.", "**Structured, semi-structured, unstructured**.", "**Distributing storage and processing**: MapReduce, traced.", "**Why functional programming**.", "**The fact-based model**.", "**Graph schemas**.", "**Ethics and law**.", "**In exam questions**.", "**Exam toolkit**."] },

    { page: "What Big Data is" },
    { callout: { t: "def", h: "Big Data", body: "A catch-all term for data that **won't fit the usual containers**: data that cannot be stored, processed or analysed using **traditional** processes or tools such as a single server running a relational database." } },
    { table: { head: ["Characteristic", "Meaning (what earns the mark)", "Examples"], rows: [
      ["**Volume**", "there is so much data that it **will not fit on a single server** (hundreds of terabytes and more)", "gene sequencing; large medical datasets for diagnosis; results of large-scale scientific experiments"],
      ["**Velocity**", "data is generated / received and **must be processed very quickly** — often streamed, responding within milliseconds to seconds; it cannot be batched for later", "card-payment fraud detection; recommendation systems; sensor streams; mouse clicks"],
      ["**Variety**", "data comes in **many forms** — structured, unstructured, text, multimedia — and often **lacks structure**, so it cannot be represented in a table", "emails, video, images, web-site contents, facial recognition"]
    ] } },
    { callout: { t: "warn", h: "Name the V AND say what it means", body: "\"Volume\" alone is NE. \"High velocity of data\" and \"speed the data is sent at\" are NE — velocity means the data **must be processed** (or responded to) very quickly. Examples of \"very quickly\" are milliseconds — not \"seconds\" or longer." } },
    { kv: [
      ["The hardest part", "not size but **lack of structure**: analysing unstructured data is much harder, and relational databases need data in rows and columns"],
      ["Why not relational?", "relational databases need a fixed row-and-column structure and **do not scale well across multiple machines**"],
      ["Finding the value", "**machine learning** techniques discern patterns and extract useful information from the data"],
      ["'Big' is relative", "what matters is the point where the data **no longer fits on one server**"]
    ] },

    { page: "Structured, semi-structured, unstructured" },
    { table: { head: [" ", "Structured", "Semi-structured", "Unstructured"], rows: [
      ["Shape", "fixed fields in rows and columns", "tagged or keyed, but flexible — fields can vary record to record", "no predefined model"],
      ["Examples", "a sales table; bank transactions", "JSON and XML documents, emails' headers", "video, images, audio, free text, social-media posts"],
      ["Stored in", "relational database", "document stores; described with XML / JSON", "files spread across a distributed file system"],
      ["Analysed by", "SQL queries", "parsers, queries over keys", "machine learning, pattern recognition"]
    ] } },
    { callout: { t: "miscon", h: "Variety is not \"lots of different values\"", body: "A column of a million different prices is still structured. Variety means different **forms** of data — a table, a video and a tweet in the same dataset." } },

    { page: "Distributing storage and processing" },
    { callout: { t: "info", h: "Key idea", body: "When the data will not fit on one server, **both** the storage and the processing must be **distributed across more than one machine**:" } },
    { kv: [
      ["Distributed storage", "the dataset is split into blocks held on many (often thousands of cheap, commodity) servers, each block replicated for fault tolerance — a distributed file system / distributed database"],
      ["Function to data", "moving terabytes across a network is slow, so the **code is sent to the servers holding the data**, and only small results travel back"],
      ["MapReduce", "a **map** function runs on every server's part of the data in parallel, producing key–value pairs; pairs with the same key are grouped; a **reduce** function combines each group into a result"],
      ["Hardware", "many servers with multiple CPUs, cores and drives, working in parallel"]
    ] },
    { fig: (function () {
      var it = [], ys = [20, 95, 170];
      var logs = [["biscuit", "cake", "biscuit"], ["cake", "tea"], ["biscuit", "tea", "tea"]];
      var maps = [["(biscuit,1) ×2", "(cake,1)"], ["(cake,1)", "(tea,1)"], ["(biscuit,1)", "(tea,1) ×2"]];
      ys.forEach(function (y, i) {
        it = it.concat(boxAt(10, y, 120, 58, "Server " + (i + 1), "accent", logs[i].join(", ")));
        it = it.concat(boxAt(175, y, 150, 58, "map", "accent2", maps[i].join(" · ")));
        it = it.concat(arrow(130, y + 29, 175, y + 29, null, { c: "muted", w: 1.4 }));
      });
      it.push(txt(250, 245, "emits (key, 1) for each sale", { size: 10.5, c: "accent2" }));
      var rs = [["biscuit", "1 + 1 + 1 = 3"], ["cake", "1 + 1 = 2"], ["tea", "1 + 1 + 1 = 3"]];
      rs.forEach(function (r, j) {
        var y = ys[j];
        it = it.concat(boxAt(450, y, 130, 58, "reduce: " + r[0], "good", r[1]));
      });
      ys.forEach(function (ya) { ys.forEach(function (yb) { it.push({ line: [[325, ya + 29], [450, yb + 29]], c: "muted", w: 1, arrow: true }); }); });
      it.push(txt(388, 245, "shuffle: group by key", { size: 10.5, c: "muted" }));
      it.push(txt(515, 245, "combined result", { size: 10.5, c: "good" }));
      return { w: 600, h: 260, items: it, cap: "MapReduce counting sales of each product in logs held on three servers. Each map runs where its data is; only small key–value pairs cross the network to the reducers." };
    })() },
    { table: { head: ["Stage", "Server 1", "Server 2", "Server 3"], rows: [
      ["Data held", "biscuit, cake, biscuit", "cake, tea", "biscuit, tea, tea"],
      ["map (item → (item, 1))", "(biscuit,1)(cake,1)(biscuit,1)", "(cake,1)(tea,1)", "(biscuit,1)(tea,1)(tea,1)"],
      ["shuffle (group by key)", "biscuit: [1,1,1]", "cake: [1,1]", "tea: [1,1,1]"],
      ["reduce (sum each group)", "biscuit 3", "cake 2", "tea 3"]
    ] } },

    { page: "Why functional programming" },
    { callout: { t: "info", h: "Key idea", body: "Functional programming is a solution because it makes it easier to write **correct** and **efficient distributed** code. The features (spec, 4.11.1 and 4.12):" } },
    { table: { head: ["Feature", "What it means", "Why it helps"], rows: [
      ["**Immutable data structures**", "a value or data structure cannot be changed after it is created — no variables to overwrite", "no two servers can change shared data under each other → **correct**; data can be copied to any server freely"],
      ["**Statelessness / no side effects**", "a function's output depends only on its inputs; it changes nothing else (pure functions)", "a function gives the same answer on any server, in any order, any number of times → **distributable**, easy to test and reason about"],
      ["**Higher-order functions**", "functions are first-class: passed as arguments and returned (map, filter, reduce / fold)", "**map-reduce**: apply a function to every element on many processors, then compose / combine the results"],
      ["**Order of execution not fixed**", "programs are not a sequence of instructions that must run in a set order; the translator decides the order at run time", "independent parts can run **in parallel** on different servers"]
    ] } },
    { code: { lang: "text", src: "-- imperative: one shared running total, updated in a fixed order\ntotal = 0\nfor each sale in sales: total = total + sale.price\n\n-- functional: no variable is ever changed\ntotal = foldl (+) 0 (map price sales)\n\n-- …so the same work splits across servers and recombines safely\ntotal = sum (map (\\part -> foldl (+) 0 (map price part)) parts)", cap: "The functional version has no state to share, so each part can be summed on a different server and the partial sums combined." } },
    { callout: { t: "warn", h: "\"Suitable for parallel processing\" is NE", body: "Name the FEATURE (immutable data, no side effects, higher-order functions / map-reduce, execution order not fixed) and, for a \"describe\", what it means." } },

    { page: "The fact-based model" },
    { callout: { t: "def", h: "Fact-based model", body: "Data is represented as a collection of **atomic facts**. Each fact captures a **single piece of information**, is **immutable** (never changed or deleted) and is usually **timestamped**. New information is recorded by **adding** a new fact, never by updating an old one." } },
    { table: { head: ["Fact", "Timestamp"], rows: [
      ["Truck PT63JTR was serviced", "2017-11-02 09:14"],
      ["Truck PT63JTR is refrigerated: No", "2017-11-02 09:20"],
      ["Truck PT63JTR was serviced", "2018-05-10 16:02"],
      ["Truck PT63JTR delivered to Birmingham", "2018-05-11 07:45"]
    ] } },
    { callout: { t: "info", h: "Key idea", body: "\"Last serviced\" is not stored and overwritten — it is **derived** as the latest service fact. The 2017 service is still there." } },
    { table: { head: [" ", "Relational (update in place)", "Fact-based (append only)"], rows: [
      ["A change", "overwrites the old value", "adds a new timestamped fact"],
      ["History", "lost unless designed in", "kept automatically — can query any past state"],
      ["Mistakes", "an erroneous update destroys data", "a bad fact can be ignored; nothing is destroyed"],
      ["Distribution", "updates must be coordinated across servers", "immutable facts copy to any server safely"],
      ["Scale", "does not scale well across machines", "manages very large datasets better"]
    ] } },

    { page: "Graph schemas" },
    { callout: { t: "info", h: "Key idea", body: "A **graph schema** captures the structure of a fact-based dataset visually:" } },
    { kv: [
      ["Node", "an entity — drawn as an **oval** labelled type: value (Truck: MJ15HWE)"],
      ["Edge", "a relationship between two nodes — a **solid line** with a **label** (Delivered_To, Owns); arrows are accepted"],
      ["Property", "a value describing ONE node — a **rectangle** (Refrigerated: Yes) joined to its node by a **dashed line**, with no label"]
    ] },
    { fig: schema([
      { id: "man", x: 170, y: 40, l1: "Store:", l2: "Manchester" },
      { id: "bir", x: 470, y: 40, l1: "Store:", l2: "Birmingham" },
      { id: "t1", x: 170, y: 170, l1: "Truck:", l2: "MJ15HWE" },
      { id: "t2", x: 470, y: 170, l1: "Truck:", l2: "PT63JTR" },
      { id: "r1", x: 60, y: 105, l1: "Refrigerated:", l2: "Yes", prop: true },
      { id: "r2", x: 580, y: 105, l1: "Refrigerated:", l2: "No", prop: true },
      { id: "she", x: 320, y: 255, l1: "Store:", l2: "Sheffield" }
    ], [
      ["man", "t1", "Delivered_To", "solid", { lx: 46 }], ["bir", "t2", "Delivered_To", "solid", { lx: -46 }],
      ["r1", "t1", null, "dash"], ["r2", "t2", null, "dash"]
    ], "The 2018 starting schema: four nodes with two edges, two properties and an unconnected Sheffield node.", { h: 290 }) },
    { steps: [
      "Each new **thing** (company, product) → a new **oval** \"Type: value\".",
      "Each **relationship** sentence (sells, makes, owns) → a **solid labelled** line between two ovals; one line per pair.",
      "Each **attribute value** (employees, cost, date) → its **own rectangle** \"Name: value\" joined by a **dashed** line. One value per box — R. two in one box.",
      "Shared facts (\"both trucks are owned by…\") → one node with an edge to EACH."
    ] },
    { callout: { t: "miscon", h: "Graph schema ≠ ER diagram", body: "An ER diagram shows entity **types** and the degree of relationships between them. A graph schema shows **individual** instances (Truck MJ15HWE) and their values. It has no crow's feet." } },

    { page: "Ethics and law" },
    { callout: { t: "info", h: "Key idea", body: "The 2021 essay's third area. Big Data about people raises questions that link straight to 4.8.1:" } },
    { table: { head: ["Issue", "Question to raise"], rows: [
      ["Security", "how can such a large, distributed dataset be kept secure?"],
      ["Access", "who should have access to which data?"],
      ["Transparency", "will people know what data is stored about them, and how it is used?"],
      ["Location", "where is the data stored — in other countries, under other laws?"],
      ["Rights and ownership", "what rights do people have over data about them; who owns it?"],
      ["Law", "Data Protection Act / GDPR, Computer Misuse Act, Regulation of Investigatory Powers Act (RIPA)"]
    ] } },

    { page: "In exam questions" },
    { worked: { tag: "exam", title: "Two other characteristics", src: "A-level June 2018 · P2 Q14.1 · 2 marks",
      q: "One characteristic that might result in a data set being classified as Big Data is that it contains a variety of different forms of information. Describe two other characteristics that might result in a data set being classified as Big Data.",
      steps: [
        { m: "There is a very high volume of data — it will not fit on one server;", mk: "1 mark", n: "NE. \"volume\" on its own." },
        { m: "The data is generated / received and must be processed very quickly (high velocity);", mk: "1 mark", n: "NE. \"velocity\" alone; NE. the speed data is sent at." }
      ], result: "Volume; velocity — each described" } },
    { worked: { tag: "exam", title: "Trucks: complete the graph schema", src: "A-level June 2018 · P2 Q14.2 · 3 marks",
      q: "In a fact-based model, data is represented as atomic, immutable facts, shown visually by a graph schema. A schema shows Store: Manchester and Store: Birmingham, Truck: MJ15HWE (Refrigerated: Yes) Delivered_To Manchester, Truck: PT63JTR (Refrigerated: No) Delivered_To Birmingham, and an unconnected Store: Sheffield. Complete it for: truck MJ15HWE has made a delivery to the Sheffield store; truck PT63JTR was last serviced on 10 May 2018 and MJ15HWE on 18 March 2018; both trucks are owned by a haulage company called Ferguson's, which has 15 employees and a head office in Bolton.",
      steps: [
        { m: "A solid line labelled Delivered_To joining Truck: MJ15HWE and Store: Sheffield;", mk: "1 mark" },
        { m: "Rectangles Serviced: 10/05/2018 and Serviced: 18/03/2018 joined to the correct trucks by dashed lines;", mk: "1 mark" },
        { m: "An oval Haulage Company: Ferguson's, with rectangles Employees: 15 and Head Office: Bolton on dashed lines, joined to both trucks by solid lines labelled Owns;", mk: "1 mark", n: "A. Head Office as an oval on a solid line; A. \"Company\" without \"Haulage\". Max 2 if any errors or incorrect additions.",
          fig: schema([
            { id: "man", x: 140, y: 36, l1: "Store:", l2: "Manchester" }, { id: "bir", x: 500, y: 36, l1: "Store:", l2: "Birmingham" },
            { id: "t1", x: 140, y: 175, l1: "Truck:", l2: "MJ15HWE" }, { id: "t2", x: 500, y: 175, l1: "Truck:", l2: "PT63JTR" },
            { id: "r1", x: 58, y: 105, l1: "Refrigerated:", l2: "Yes", prop: true, w: 100 }, { id: "r2", x: 582, y: 105, l1: "Refrigerated:", l2: "No", prop: true, w: 100 },
            { id: "she", x: 260, y: 290, l1: "Store:", l2: "Sheffield" },
            { id: "co", x: 320, y: 175, l1: "Haulage Co:", l2: "Ferguson's", col: "accent2", rx: 70 },
            { id: "emp", x: 265, y: 85, l1: "Employees:", l2: "15", prop: true, col: "accent2", w: 96 },
            { id: "hq", x: 380, y: 85, l1: "Head Office:", l2: "Bolton", prop: true, col: "accent2", w: 100 },
            { id: "s1", x: 58, y: 255, l1: "Serviced:", l2: "18/03/2018", prop: true, col: "accent2", w: 100 },
            { id: "s2", x: 582, y: 255, l1: "Serviced:", l2: "10/05/2018", prop: true, col: "accent2", w: 100 }
          ], [
            ["man", "t1", "Delivered_To", "solid", { lx: 48 }], ["bir", "t2", "Delivered_To", "solid", { lx: -48 }],
            ["r1", "t1", null, "dash"], ["r2", "t2", null, "dash"],
            ["t1", "she", "Delivered_To", "solid", { c: "accent2", lx: -46 }],
            ["co", "t1", "Owns", "solid", { c: "accent2" }], ["co", "t2", "Owns", "solid", { c: "accent2" }],
            ["emp", "co", null, "dash", { c: "accent2" }], ["hq", "co", null, "dash", { c: "accent2" }],
            ["s1", "t1", null, "dash", { c: "accent2" }], ["s2", "t2", null, "dash", { c: "accent2" }]
          ], "The additions are in the second colour: one new edge, two service properties, and the company node with its properties and two Owns edges.", { h: 330 }) }
      ], result: "Delivered_To edge; two Serviced boxes; Ferguson's oval with Owns edges" } },
    { worked: { tag: "exam", title: "The third characteristic", src: "A-level June 2023 · P2 Q08.1 · 1 mark",
      q: "A supermarket chain's data is Big Data. Two characteristics of Big Data are that the volume of data means it is too big to fit on a single server and the data comes in a variety of forms. Describe the third characteristic of Big Data.",
      steps: [{ m: "The data is generated / received and must be processed / responded to at high velocity — very quickly, e.g. within milliseconds;", mk: "1 mark", n: "NE. \"velocity\" alone; NE. \"accessed\" quickly; R. a long period such as seconds as the example." }], result: "Velocity — must be processed very quickly" } },
    { worked: { tag: "exam", title: "Biscuits: modify the graph schema", src: "A-level June 2023 · P2 Q08.2 · 3 marks",
      q: "A supermarket's graph schema shows Product: Iced Biscuit, which Store: Bristol and Store: Bath each Sells, and which Customer: 10437 (Forename: John, Surname: Williams) Purchased; and an unconnected Product: Chocolate Biscuit. Modify it for: the Bath store sells chocolate biscuits; there are 20 biscuits in a packet of iced biscuits and each packet costs £1.50; both chocolate and iced biscuits are made by the company Delicious Snacks, which has 75 employees and also makes cake bars.",
      steps: [
        { m: "A solid line labelled Sells joining Store: Bath and Product: Chocolate Biscuit;", mk: "1 mark" },
        { m: "Rectangles Per packet: 20 and Cost: £1.50 — two separate boxes — joined to Iced Biscuit by dashed lines;", mk: "1 mark", n: "R. both values in one box." },
        { m: "An oval Company: Delicious Snacks with a rectangle Employees: 75 on a dashed line; an oval Product: Cake Bar; solid lines labelled Makes from the company to all three products;", mk: "1 mark", n: "DPT wrong line styles, wrong shapes, missing labels on solid lines, labels on dashed lines.",
          fig: schema([
            { id: "emp", x: 70, y: 36, l1: "Employees:", l2: "75", prop: true, col: "accent2", w: 96 },
            { id: "co", x: 250, y: 52, l1: "Company:", l2: "Delicious Snacks", col: "accent2", rx: 74 },
            { id: "choc", x: 480, y: 52, l1: "Product:", l2: "Choc. Biscuit" },
            { id: "cake", x: 78, y: 135, l1: "Product:", l2: "Cake Bar", col: "accent2" },
            { id: "iced", x: 260, y: 185, l1: "Product:", l2: "Iced Biscuit" },
            { id: "bath", x: 565, y: 170, l1: "Store:", l2: "Bath", rx: 56 },
            { id: "bri", x: 78, y: 240, l1: "Store:", l2: "Bristol", rx: 56 },
            { id: "cus", x: 440, y: 268, l1: "Customer:", l2: "10437" },
            { id: "sur", x: 588, y: 300, l1: "Surname:", l2: "Williams", prop: true, w: 96 },
            { id: "for", x: 440, y: 352, l1: "Forename:", l2: "John", prop: true, w: 96 },
            { id: "pp", x: 170, y: 305, l1: "Per packet:", l2: "20", prop: true, col: "accent2", w: 96 },
            { id: "cost", x: 290, y: 330, l1: "Cost:", l2: "£1.50", prop: true, col: "accent2", w: 86 }
          ], [
            ["emp", "co", null, "dash", { c: "accent2" }],
            ["co", "choc", "Makes", "solid", { c: "accent2" }], ["co", "cake", "Makes", "solid", { c: "accent2", lx: 22 }], ["co", "iced", "Makes", "solid", { c: "accent2", lx: 26 }],
            ["choc", "bath", "Sells", "solid", { c: "accent2", lx: 26 }],
            ["iced", "bath", "Sells", "solid"], ["iced", "bri", "Sells", "solid", { lx: 14 }], ["iced", "cus", "Purchased", "solid", { lx: 30 }],
            ["sur", "cus", null, "dash"], ["for", "cus", null, "dash"],
            ["pp", "iced", null, "dash", { c: "accent2" }], ["cost", "iced", null, "dash", { c: "accent2" }]
          ], "Additions in the second colour.", { w: 650, h: 380 }) }
      ], result: "Sells edge; two property boxes; company node, Cake Bar node, three Makes edges" } },
    { worked: { tag: "exam", title: "Two features for distributed code", src: "A-level June 2023 · P2 Q08.3 · 2 marks",
      q: "One approach to dealing with Big Data is to write code that can be distributed to run across more than one server. State two features of functional programming languages that make it easier to write code that can be distributed to run across more than one server.",
      steps: [
        { m: "Immutable data structures — the state of a data structure cannot be changed after creation;", mk: "1 mark" },
        { m: "Statelessness — functions have no side effects / are pure;", mk: "1 mark", n: "Also: functions can be distributed and their results combined (map-reduce); higher-order functions compose results across processors; order of execution not fixed by the code. NE. \"suitable for parallel processing\". Max 2." }
      ], result: "Immutability; statelessness" } },
    { worked: { tag: "exam", title: "Describe two features", src: "A-level June 2024 · P2 Q11.2 · 2 marks",
      q: "Describe two features of functional programming languages that make it easier to write code that can be distributed to run across multiple servers.",
      steps: [
        { m: "Data structures are immutable, which means the values stored in them cannot be changed after they are created (there are no variables to update);", mk: "1 mark" },
        { m: "Functions are stateless: they have no side effects, so a function's output depends only on its inputs;", mk: "1 mark", n: "Also: higher-order functions take a function as an argument and apply it to every element (map-reduce); the order of execution is decided by the translator, not fixed by the code. Max 2." }
      ], result: "Each feature named AND explained" } },
    { worked: { tag: "exam", title: "Big Data: what, challenges, ethics", src: "A-level June 2021 · P2 Q09 · 12 marks",
      q: "Big Data is an important application area for modern computer science. Describe what Big Data is, using examples; explain some of the challenges that Big Data brings and the approaches that can be taken to overcome these, in relation to programming and hardware; consider some of the ethical and legal issues that might arise in applications that store data, particularly data about people.",
      steps: [
        { h: "Area 1 · what Big Data is", m: "Data that cannot be processed or analysed with traditional tools. **Volume**: too much to fit on one server — hundreds of terabytes, e.g. gene sequencing or medical datasets for diagnosis. **Velocity**: generated so fast it must be processed as it arrives, thousands of items a second, e.g. card-fraud detection, recommendation systems. **Variety**: many forms and often unstructured — emails, video, images, web pages — so it cannot be represented in a relational table.", n: "Good understanding = all three characteristics, or two plus the overarching description, with examples." },
        { h: "Area 2 · challenges → approaches", m: "It cannot be stored on one server → distributed file systems / databases spreading blocks over many (thousands of commodity) servers. One computer cannot process it fast enough → massively parallel processing on servers with many CPUs, cores and drives, using MapReduce: split the input, run a mapper on each part where it is stored, combine with reducers. Writing that code is hard → **functional programming**: immutable data and stateless functions make code correct and distributable. It does not fit tables → fact-based models and graph schemas; XML / JSON for semi-structured data. Unstructured data is hard to analyse → machine learning finds the patterns and value.", n: "Good understanding = a range of challenges, each with how it is overcome." },
        { h: "Area 3 · ethics and law", m: "How can so much personal data be kept secure? Who may access which data? Do people know what is stored about them, and who owns it? Data may be held in other countries under other laws. People have rights under the Data Protection Act / GDPR; the Computer Misuse Act covers unauthorised access; RIPA governs interception by authorities.", n: "Good understanding = a range of issues described (two example laws credited)." },
        { h: "Levels", m: "10–12: all three areas covered, good understanding in at least two (all three for the top), a sustained line of reasoning. 7–9: good in two areas, or good in one and reasonable in the other two. 4–6: good in one or some in all three. 1–3: a few points, no line of reasoning.", mk: "12 marks (levels)" }
      ], result: "Three areas, each developed, in a structured argument" } },
    { worked: { tag: "variation", title: "Which V?", q: "Name the main characteristic each illustrates: (a) a smart-meter network sending readings every second that must trigger alerts at once (b) a hospital's scans, typed notes and recorded consultations (c) a physics experiment producing 1 PB a day (d) a sales table with 10 rows.",
      steps: [{ m: "(a) velocity", mk: "1" }, { m: "(b) variety — images, text, audio", mk: "1" }, { m: "(c) volume", mk: "1" }, { m: "(d) none — it fits a usual relational container", mk: "1" }], result: "velocity, variety, volume, not Big Data" } },
    { worked: { tag: "variation", title: "Trace a MapReduce", q: "Server A holds the words \"red blue red\" and server B \"blue blue green\". Trace a MapReduce word count.",
      steps: [
        { h: "map", m: "A → (red,1) (blue,1) (red,1); B → (blue,1) (blue,1) (green,1).", mk: "1" },
        { h: "shuffle", m: "red: [1,1] · blue: [1,1,1] · green: [1].", mk: "1" },
        { h: "reduce", m: "red 2 · blue 3 · green 1.", mk: "1" }
      ], result: "red 2, blue 3, green 1" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Describe a characteristic", "The V AND its meaning: won't fit one server / must be processed very quickly / many forms, unstructured."],
      ["Complete / modify the graph schema", "Ovals for things, solid labelled lines for relationships, rectangles on dashed lines for values — one value per box."],
      ["State / describe functional features", "Immutable data · stateless, no side effects · higher-order functions / map-reduce · execution order not fixed — explained for \"describe\"."],
      ["Discuss (12)", "All three areas, each with examples and the HOW, in a structured line of reasoning."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Three Vs, and a mouthful of SHIP\"", body: "**V**olume · **V**elocity · **V**ariety. Why functional code distributes: **S**tateless · **H**igher-order functions · **I**mmutable data · **P**arallel order not fixed. Graph schema: **O**val = **O**bject, **R**ectangle = **R**eading (a value), **S**olid line = **S**entence (a relationship)." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"Volume\" / \"velocity\" with no meaning.", "Velocity as the speed data is transmitted.", "Two values in one rectangle.", "Labels on dashed lines, or solid lines with no label.", "\"Suitable for parallel processing\" as a feature.", "In the essay, describing Big Data without the challenges' HOW, or forgetting ethics."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.12 functional programming — map, filter, fold, immutability; 4.10.1 ER diagrams versus graph schemas; 4.10.5 distributed databases and concurrency; 4.9.4.10 JSON/XML for semi-structured data; 4.8.1 data protection law and ethics; 4.7.3.7 multi-core and parallel hardware." } }
  ],
  flashcards: [
    ["Big Data?", "Data that won't fit the usual containers — it cannot be stored or processed with traditional tools."],
    ["Volume?", "So much data it will not fit on a single server."],
    ["Velocity?", "Data generated/received that must be processed very quickly (milliseconds to seconds), often streamed."],
    ["Variety?", "Data in many forms — structured, unstructured, text, multimedia."],
    ["Why are relational databases unsuitable?", "They need row-and-column structure and don't scale well across multiple machines."],
    ["What extracts value from unstructured Big Data?", "Machine learning techniques that find patterns."],
    ["MapReduce?", "Map a function over each server's data in parallel, group the key–value pairs, then reduce each group to a result."],
    ["Four functional features that help distribution?", "Immutable data, statelessness/no side effects, higher-order functions, execution order not fixed."],
    ["Fact-based model?", "Data as atomic, immutable, timestamped facts; changes are new facts, never overwrites."],
    ["Graph schema: node, edge, property?", "Oval; solid labelled line; rectangle joined by a dashed line."],
    ["Laws for the Big Data essay?", "DPA/GDPR, Computer Misuse Act, RIPA."],
    ["Why send the function to the data?", "Moving huge data across the network is slow; only small results need to travel."]
  ],
  quiz: [
    { q: "\"High velocity of data\" as a characteristic scores", opts: ["NE.", "1 mark", "2 marks", "R. always"], ans: 0, why: "Say it must be processed quickly." },
    { q: "In a graph schema, \"Cost: £1.50\" is drawn as", opts: ["a rectangle on a dashed line", "an oval", "a solid labelled line", "a crow's foot"], ans: 0, why: "A property." },
    { q: "Which makes functional code safe to run on many servers?", opts: ["no side effects", "global variables", "GOTO", "mutable arrays"], ans: 0, why: "Output depends only on inputs." },
    { q: "In a fact-based model, a truck's new service date is recorded by", opts: ["adding a new fact", "overwriting the old date", "deleting the old fact", "a new table"], ans: 0, why: "Facts are immutable." },
    { q: "Videos, emails and web pages in one dataset illustrate", opts: ["variety", "volume", "velocity", "validity"], ans: 0, why: "Many forms." },
    { q: "In MapReduce the reduce step", opts: ["combines each key's values into a result", "splits the input", "sends data to clients", "sorts the servers"], ans: 0, why: "Combining stage." }
  ]
};

Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
