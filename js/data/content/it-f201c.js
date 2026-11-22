/* Kurenai OS — deep content: OCR Cambridge Advanced National in IT: Data
   Analytics (H119), Unit F201 Big data and machine learning — Topic Areas
   3–5: AI and machine learning (F201.3.1), legal and ethical issues (4.1,
   4.2), environment and society (5.1, 5.2). Written from the specification
   (Version 5, June 2026) and the Sample Assessment Material: every worked
   exam answer is our own question in the SAM's shapes, marked the way its
   mark scheme marks (identify + apply, "any two from", levels of response). */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---------- small figure helpers (pixel coordinates) ---------- */
function txt(x, y, t, o) { o = o || {}; return { text: [x, y], t: t, size: o.size || 11, c: o.c || "muted", b: !!o.b, pos: o.pos || "c", off: o.off }; }
function arrow(x1, y1, x2, y2, label, o) {
  o = o || {};
  var it = [{ line: [[x1, y1], [x2, y2]], arrow: true, c: o.c || "accent2", w: o.w || 1.6, dash: o.dash }];
  if (label) it.push(txt((x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 + (o.dy || 0), label, { size: 10.5, c: o.c || "accent2", b: !!o.b }));
  return it;
}
/* a box with one bold line and optional smaller lines under it */
function box(x, y, w, h, lines, o) {
  o = o || {};
  var col = o.c || "it", L = Array.isArray(lines) ? lines : [lines];
  var it = [{ poly: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], fill: col, alpha: o.alpha || 0.14, c: col, w: 1.3 }];
  L.forEach(function (t, i) {
    it.push(txt(x + w / 2, y + h / 2 + (i - (L.length - 1) / 2) * 14, t, { b: i === 0, size: i === 0 ? (o.size || 11.5) : 10, c: i === 0 ? "text" : "text2" }));
  });
  return it;
}
function line(x1, y1, x2, y2, o) { o = o || {}; return { line: [[x1, y1], [x2, y2]], c: o.c || "line", w: o.w || 1.4, dash: o.dash }; }

/* ---------- the levels-of-response descriptors (SAM structure, our words) ---------- */
function lor6(what) {
  /* the note in the callout, its table after it: never a block inside a block */
  return [{ callout: { t: "tip", h: "How a 6-mark \"Analyse\" answer is levelled", body: ["The examiner starts at Level 3 and works down to the level that fits best, then places you at the top or bottom of it.", "Breadth gets you into a level; **developed, applied** points move you up it. Three developed points beat six one-liners."] } },
    { table: { head: ["Level", "Marks", "What the answer does"], rows: [
      ["Level 3 (high)", "5–6", "A **thorough** analysis: a **range** of " + what + ", detailed knowledge applied to the scenario, clear explanation (point → because → so for this organisation), subject terms used consistently."],
      ["Level 2 (mid)", "3–4", "An **adequate** analysis: **some** " + what + ", sound knowledge in context, adequate explanation, some subject terms."],
      ["Level 1 (low)", "1–2", "A **basic** analysis: at least **one** point, limited link to the scenario, basic explanation, few subject terms."],
      ["0", "0", "Nothing worthy of credit."]
    ] } }];
}
function lor9(topic) {
  /* the note in the callout, its table after it: never a block inside a block */
  return [{ callout: { t: "tip", h: "How a 9-mark \"Discuss\" answer is levelled", body: ["The question's three bullets are the plan: **benefits**, **limitations**, **whether you would recommend it**.", "No conclusion, or a one-sided answer, caps you in Level 2.", "Middle of a level = meets it with some inconsistency; top = consistently."] } },
    { table: { head: ["Level", "Marks", "What the answer does"], rows: [
      ["Level 3 (high)", "7–9", "A **thorough** discussion with detailed evaluation: a **range** of uses of " + topic + ", **both** benefits **and** limitations, analysed in the scenario's context, a **clear conclusion** with detailed justification, consistent subject terms."],
      ["Level 2 (mid)", "4–6", "An **adequate** discussion: **some** uses, some benefits **or** limitations, some analysis in context, an adequate conclusion with relevant reasons, some subject terms."],
      ["Level 1 (low)", "1–3", "A **basic** discussion: a few points, limited context, a brief conclusion with limited reasons, few subject terms."],
      ["0", "0", "Nothing worthy of credit."]
    ] } }];
}

/* =====================================================================
   F201.3.1  Artificial intelligence and machine learning
   ===================================================================== */
function treeFig() {
  var it = [];
  it = it.concat(box(200, 8, 240, 42, "Active in the last 14 days?"));
  it.push(txt(448, 29, "← root node (first test)", { pos: "e", size: 10, c: "text2" }));
  it = it.concat(line(270, 50, 110, 96), line(370, 50, 450, 96));
  it.push(txt(175, 66, "No", { b: true, c: "danger", size: 10.5 }), txt(428, 66, "Yes", { b: true, c: "good", size: 10.5 }));
  it = it.concat(box(30, 96, 160, 42, ["Likely to cancel", "leaf node"], { c: "danger" }));
  it = it.concat(box(350, 96, 200, 42, "On a family plan?"));
  it = it.concat(line(400, 138, 330, 182), line(500, 138, 560, 182));
  it.push(txt(350, 156, "No", { b: true, c: "danger", size: 10.5 }), txt(548, 156, "Yes", { b: true, c: "good", size: 10.5 }));
  it = it.concat(box(230, 182, 200, 42, "Skips over half the songs?"));
  it = it.concat(box(490, 182, 140, 42, ["Likely to stay", "leaf node"], { c: "good" }));
  it = it.concat(line(290, 224, 220, 266), line(370, 224, 440, 266));
  it.push(txt(240, 242, "Yes", { b: true, c: "danger", size: 10.5 }), txt(420, 242, "No", { b: true, c: "good", size: 10.5 }));
  it = it.concat(box(150, 266, 140, 40, "Likely to cancel", { c: "danger" }));
  it = it.concat(box(370, 266, 140, 40, "Likely to stay", { c: "good" }));
  it.push(txt(20, 210, "decision nodes test", { pos: "e", size: 10, c: "text2" }), txt(20, 224, "one feature each", { pos: "e", size: 10, c: "text2" }));
  return { fig: { w: 640, h: 312, items: it, cap: "A decision tree that predicts whether a streaming subscriber will cancel. Start at the root, answer each test, follow the branch; the leaf you reach is the prediction. Every route can be read out as a rule — that is why trees are easy to explain." } };
}
function forestFig() {
  var it = [];
  it = it.concat(box(170, 6, 300, 36, ["Training data: every subscriber's history"], { c: "accent" }));
  var xs = [80, 240, 400, 560], votes = ["Cancel", "Stay", "Cancel", "Cancel"];
  xs.forEach(function (cx, i) {
    it = it.concat(arrow(320, 42, cx, 70, null, { c: "muted", w: 1.2 }));
    it = it.concat(box(cx - 66, 70, 132, 34, ["Random sample " + (i + 1), "rows + features"], { c: "accent", alpha: 0.08, size: 10.5 }));
    it.push({ poly: [[cx, 114], [cx - 30, 160], [cx + 30, 160]], fill: "accent3", alpha: 0.22, c: "accent3", w: 1.3 });
    it.push({ line: [[cx, 160], [cx, 170]], c: "accent3", w: 3 });
    it.push(txt(cx, 146, "Tree " + (i + 1), { b: true, size: 10.5, c: "text" }));
    it.push(txt(cx, 186, "votes " + votes[i], { b: true, size: 11, c: votes[i] === "Cancel" ? "danger" : "good" }));
    it = it.concat(arrow(cx, 196, 320, 222, null, { c: "muted", w: 1.2 }));
  });
  it = it.concat(box(190, 222, 260, 40, ["Majority vote → Cancel (3 to 1)", "average instead, to predict a number"], { c: "it", size: 11 }));
  return { fig: { w: 640, h: 268, items: it, cap: "A random forest: each tree learns from a different random sample of the rows and a random subset of the features, so the trees make different mistakes. The forest's answer is the majority vote (classification) or the average (a number) — one tree's error is outvoted." } };
}
function kmeansFig() {
  var A = [[2, 4], [3, 8], [5, 5], [4, 9], [6, 3], [3, 6]], B = [[11, 38], [13, 45], [15, 40], [12, 48], [14, 36]], D = [[22, 10], [25, 15], [27, 12], [23, 17], [26, 8]];
  var it = [];
  A.forEach(function (p) { it.push({ pt: p, c: "accent", r: 4 }); });
  B.forEach(function (p) { it.push({ pt: p, c: "accent3", r: 4 }); });
  D.forEach(function (p) { it.push({ pt: p, c: "accent2", r: 4 }); });
  it.push({ pt: [3.8, 5.8], c: "accent", r: 7, open: true, label: "centroid (3.8, 5.8)", pos: "ne", size: 10.5 });
  it.push({ pt: [13, 41.4], c: "accent3", r: 7, open: true, label: "centroid (13, 41.4)", pos: "e", size: 10.5 });
  it.push({ pt: [24.6, 12.4], c: "accent2", r: 7, open: true, label: "centroid (24.6, 12.4)", pos: "n", size: 10.5, dy: -6 });
  it.push({ text: [4, 18], t: "Casual listeners", c: "accent", b: true, size: 11 });
  it.push({ text: [13, 54], t: "Explorers", c: "accent3", b: true, size: 11 });
  it.push({ text: [24.5, 27], t: "Super-fans", c: "accent2", b: true, size: 11 });
  return { fig: { x: [0, 30], y: [0, 60], w: 560, h: 320, axes: { x: "hours a week", y: "artists a week", xt: [0, 5, 10, 15, 20, 25, 30], yt: [0, 10, 20, 30, 40, 50, 60] }, items: it,
    cap: "k-means with k = 3 on 16 subscribers. Each point joins its nearest centroid; each centroid (ringed) is the mean of its cluster's points — e.g. the casual group's x is (2+3+5+4+6+3) ÷ 6 = 3.8. The algorithm gives no names: an analyst reads the groups and calls them casual, explorers and super-fans." } };
}
function loopFig() {
  var it = [];
  it = it.concat(box(16, 14, 250, 54, ["1 · Big data", "huge Volume, wide Variety, fast Velocity"], { c: "accent" }));
  it = it.concat(box(354, 14, 250, 54, ["2 · Machine learning", "an algorithm learns patterns from it"], { c: "it" }));
  it = it.concat(box(354, 150, 250, 54, ["3 · AI in use", "predict, classify, recommend, detect"], { c: "accent3" }));
  it = it.concat(box(16, 150, 250, 54, ["4 · New data", "clicks, skips, outcomes, corrections"], { c: "accent2" }));
  it = it.concat(arrow(266, 41, 354, 41, "trains", { dy: -10 }));
  it = it.concat(arrow(479, 68, 479, 150, "deploys", { dx: 30 }));
  it = it.concat(arrow(354, 177, 266, 177, "creates", { dy: -10 }));
  it = it.concat(arrow(141, 150, 141, 68, "retrains", { dx: -34 }));
  return { fig: { w: 620, h: 214, items: it, cap: "How big data, machine learning and AI interact: data trains the model, the model drives the AI, and the AI's own use produces more data that retrains it. Bad data at step 1 flows all the way round." } };
}

C["it:F201.3.1"] = {
  notes: [
    { h: "Artificial intelligence and machine learning — the whole topic on one page" },
    { h: "What the specification asks (F201 3.1)" },
    { kv: [
      [
        "Teaching content",
        "Artificial intelligence (AI) · the interaction of big data and AI in data science · machine learning · machine learning algorithms: **Decision Tree**, **Random Forest**, **K-Means**."
      ],
      [
        "To include",
        "What AI is · how AI is developed and used in data science · benefits and limitations of AI in data science · what machine learning is · how ML algorithms are used · the purpose and characteristics of each algorithm · benefits and limitations of each · how each is used for digital analysis · how big data, ML and AI interact."
      ],
      [
        "Does not include",
        "The **history** of AI and machine learning — no Turing, no timelines. Not taught here."
      ]
    ] },
    { ol: ["AI in data science", "Machine learning", "Decision tree", "Random forest", "K-means", "How big data, ML and AI interact", "In exam questions", "Exam toolkit"] },
    { table: { head: ["Item", "One line to remember"], rows: [
      ["AI", "Computers doing tasks that normally need human intelligence."],
      ["Machine learning", "The part of AI where a model **learns patterns from data** instead of being given rules."],
      ["Decision tree", "Supervised. A flowchart of tests on features → a prediction at a leaf. Easy to explain."],
      ["Random forest", "Supervised. Many trees on random samples; majority vote. More accurate, harder to explain."],
      ["K-means", "Unsupervised. Groups unlabelled data into **k** clusters around centroids."],
      ["Interaction", "Big data trains ML → ML powers AI → AI creates new data → retrain."]
    ] } },

    { page: "AI in data science" },
    { callout: { t: "def", h: "Artificial intelligence (AI)", body: "Computer systems that carry out tasks that would normally need **human intelligence** — recognising patterns, understanding language, making predictions and decisions — and that can **improve with experience**." } },
    { h: "Characteristics of AI" },
    { ul: [
      "**Learns from data** — it is trained, not hand-coded rule by rule.",
      "**Recognises patterns** too subtle or too many for people to spot.",
      "**Makes predictions or decisions** about new, unseen cases.",
      "**Improves** as it is given more (and better) data.",
      "**Narrow**: every AI in use today does one kind of task well (a recommender cannot drive a car)."
    ] },
    { h: "How AI is developed for data science" },
    { steps: [
      { h: "1 · Define the problem", m: "What should the AI predict or decide? (e.g. which subscribers will cancel)", n: "A vague goal gives a useless model." },
      { h: "2 · Collect and prepare the data", m: "Gather big data from many sources, then clean, wrangle and label it (F201 1.2–1.3).", n: "Usually most of the work." },
      { h: "3 · Choose an algorithm", m: "Decision tree, random forest, k-means… to suit the task and the data.", n: "Labelled data → supervised; unlabelled → unsupervised." },
      { h: "4 · Train", m: "The algorithm learns patterns from a **training set**.", n: "Needs computing power — often in the cloud." },
      { h: "5 · Test and validate", m: "Check its accuracy on a **test set** it has never seen.", n: "Catches a model that has only memorised its training data." },
      { h: "6 · Deploy and monitor", m: "Put it into use; watch accuracy; retrain as behaviour changes.", n: "Patterns drift (Variability) — a model goes stale." }
    ] },
    { h: "How AI is used in data science" },
    { table: { head: ["Use", "What the AI does", "UK-style example"], rows: [
      ["Recommendations", "Predicts what a person will like from their history and similar people's.", "A streaming app's 'Made for you' playlist; a supermarket's online 'You might like'."],
      ["Classification", "Puts a new case into a category.", "A bank flags a card payment as likely fraud."],
      ["Prediction / forecasting", "Estimates a future number or event.", "A retailer forecasts next week's demand per store."],
      ["Clustering / segmentation", "Finds groups nobody labelled.", "A gym chain finds three types of member for its marketing."],
      ["Anomaly detection", "Spots the unusual record.", "An energy firm spots a faulty smart meter."],
      ["Language and images", "Reads text, speech or pictures.", "A chatbot answers customers; AI reads medical scans."],
      ["Automation of analysis", "Runs the analysis continuously, at speed.", "Live dashboards updated every few seconds."]
    ] } },
    { table: { head: ["Benefits of AI in data science", "Limitations of AI in data science"], rows: [
      ["Analyses volumes no team of people could, in seconds.", "Only as good as its training data: biased or poor data → biased or wrong outputs."],
      ["Finds hidden patterns and links humans miss.", "Finds **correlation**, not cause — can mislead."],
      ["Works 24/7 and applies the same rules consistently.", "Complex models are a **black box** — hard to explain a decision (UK GDPR, F201 4.2)."],
      ["Predicts, so the organisation can act early.", "Costly: specialist staff, computing power, storage."],
      ["Personalises at scale (one offer per customer).", "Needs large amounts of (often personal) data — privacy and legal risk."],
      ["Frees analysts for higher-value work.", "Goes stale when behaviour changes; needs monitoring and retraining."]
    ] } },
    { worked: { tag: "example", title: "How does a recommender actually choose?", q: "A music-streaming app shows each listener a 'Made for you' playlist. What data does the AI use, and how does it pick the songs?",
      steps: [
        { m: "**Input data**: the listener's plays, skips, saves, searches and time of day — plus the same data from millions of other listeners.", n: "Big data: high Volume and Velocity." },
        { m: "**Pattern**: listeners who play song A and song B also tend to play song C.", n: "The model learns this; nobody wrote the rule." },
        { m: "**Prediction**: this listener played A and B, so C scores highly; songs they skip score low.", n: "The playlist is the highest-scoring songs they have not heard." },
        { m: "**Feedback**: what they play or skip from the playlist becomes new training data.", n: "The interaction loop — see the last teaching page." }
      ], result: "History + similar users → predicted likes → feedback improves it" } },

    { page: "Machine learning" },
    { callout: { t: "def", h: "Machine learning (ML)", body: "A branch of AI in which a computer **learns patterns from data** and uses them to make predictions or decisions, **without being explicitly programmed** with the rules. Its accuracy improves as it is given more data." } },
    { h: "How machine learning algorithms are used" },
    { kv: [
      ["Training data", "The past examples the algorithm learns from."],
      ["Features", "The inputs it looks at (age, hours listened, postcode…)."],
      ["Label", "The known answer in supervised learning (cancelled: yes/no)."],
      ["Model", "What training produces — the learned pattern (e.g. a finished tree)."],
      ["Prediction", "The model's output for a new case it has never seen."],
      ["Test set", "Held-back data used to measure accuracy honestly."]
    ] },
    { table: { head: ["Kind of ML", "Data it learns from", "What it does", "Spec algorithms"], rows: [
      ["Supervised", "**Labelled** — each example has the right answer.", "Classifies or predicts a value for new cases.", "Decision tree, random forest"],
      ["Unsupervised", "**Unlabelled** — no right answers given.", "Finds structure: groups (clusters), outliers.", "K-means"],
      ["Reinforcement", "Rewards and penalties from trying actions.", "Learns a strategy (games, robots, route planning).", "None named — know it exists"]
    ] } },
    { callout: { t: "def", h: "Overfitting", body: "When a model learns its training data **too closely** — noise and all — so it scores well on that data but badly on new data. It is the main weakness of a single decision tree and the reason random forests exist." } },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"ML is programmed with rules.\" — No: it **learns** the rules from data. That is the definition.",
      "\"More data always means a better model.\" — Only if it is **accurate and representative**. More biased data is just more bias.",
      "\"K-means predicts which group a customer belongs to, like a classifier.\" — It **discovers** groups in unlabelled data; there was no right answer to learn.",
      "\"AI and ML are the same thing.\" — ML is one **way** of achieving AI (the main one in data science).",
      "\"A random forest is a big decision tree.\" — It is **many separate** trees that vote.",
      "\"A model that is 99% accurate on its training data is good.\" — It may be overfitted; judge it on **test** data."
    ] } },

    { page: "Decision tree" },
    { callout: { t: "def", h: "Decision tree", body: "A **supervised** ML algorithm that predicts an outcome by asking a **series of questions (tests) about the features**, branching on each answer, until it reaches a **leaf** that gives the prediction. It is drawn like an upside-down tree." } },
    { kv: [
      ["Purpose", "To **classify** a case (cancel / stay, fraud / genuine) or **predict a value** (a price) from labelled past data."],
      ["Root node", "The first test — the feature that best splits the data."],
      ["Decision (internal) node", "A further test on one feature."],
      ["Branch", "One answer to a test (Yes / No, or a range such as under 25)."],
      ["Leaf node", "The end of a route: the prediction."],
      ["How it learns", "At each node it picks the test that separates the outcomes most cleanly, then repeats on each branch."]
    ] },
    treeFig(),
    { h: "Characteristics" },
    { ul: [
      "**White box**: every prediction is a readable route — \"not active in 14 days → likely to cancel\".",
      "Handles numbers and categories together; needs little data preparation.",
      "Fast to train and very fast to use.",
      "Prone to **overfitting** if allowed to grow deep; a small change in the data can give a very different tree (**unstable**)."
    ] },
    { h: "Used for digital analysis" },
    { ul: [
      "**Customer churn**: which subscribers are likely to leave, and the rule that says why.",
      "**Loan or credit decisions**: a lender's rules it can show the regulator and the applicant.",
      "**Triage**: a symptom checker routing patients to urgent care, a GP or self-care.",
      "**Targeting**: which customers should get which offer."
    ] },
    { table: { head: ["Benefits", "Limitations"], rows: [
      ["Easy to understand, draw and **explain** — helps when a decision must be justified (UK GDPR).", "**Overfits**: a deep tree memorises its training data and predicts badly on new data."],
      ["Shows which features matter most (they sit near the root).", "**Unstable**: small changes in the data can change the whole tree."],
      ["Little data preparation; mixed data types.", "Usually **less accurate** than a random forest."],
      ["Quick to build and to run.", "Can be biased towards the most common outcome if the classes are unbalanced."]
    ] } },
    { worked: { tag: "example", title: "Follow the tree", q: "Use the tree in the figure. Subscriber P was active last week, is on a single plan and skips about 70% of songs. Subscriber Q was active yesterday and is on a family plan. Predict each.",
      steps: [
        { m: "P: active? **Yes** → family plan? **No** → skips over half? **Yes** → **likely to cancel**." },
        { m: "Q: active? **Yes** → family plan? **Yes** → **likely to stay**." },
        { m: "The route itself is the explanation the company can give.", n: "This is what \"white box\" means." }
      ], result: "P cancel, Q stay" } },

    { page: "Random forest" },
    { callout: { t: "def", h: "Random forest", body: "A **supervised** ML algorithm that builds **many decision trees**, each on a **random sample** of the data and features, and combines their answers — the **majority vote** for a category, the **average** for a number. It is an **ensemble** method." } },
    { kv: [
      ["Purpose", "More **accurate** and **reliable** classification or prediction than one tree."],
      ["Random rows", "Each tree trains on a random sample of the records (drawn with replacement)."],
      ["Random features", "At each split a tree may only choose from a random handful of the features."],
      ["Combining", "Classification → majority vote. Regression (a number) → mean of the trees' answers."]
    ] },
    forestFig(),
    { h: "Characteristics" },
    { ul: [
      "Trees differ, so their errors differ — and **cancel out** in the vote.",
      "Much less prone to overfitting than one deep tree.",
      "Copes well with noisy data, outliers and many features.",
      "Can rank **feature importance** (which inputs mattered most overall).",
      "But no single readable route: a **black box** compared with one tree."
    ] },
    { h: "Used for digital analysis" },
    { ul: [
      "**Fraud detection**: scoring each card payment as it happens.",
      "**Credit scoring and insurance risk**: where accuracy matters more than a simple rule.",
      "**Predicting numbers**: house prices, delivery times, demand.",
      "**Health risk**: estimating a patient's risk of a condition from many measurements."
    ] },
    { table: { head: ["Benefits", "Limitations"], rows: [
      ["More **accurate** than a single tree.", "Hard to **explain** an individual decision — a problem for UK GDPR rights and trust."],
      ["**Resists overfitting** — errors are outvoted.", "**Slower** and needs more computing power and memory (hundreds of trees)."],
      ["Robust to noise, outliers and missing values.", "Still learns any **bias** in the training data."],
      ["Shows which features matter most.", "Predicting a number, it cannot go beyond the range it was trained on."]
    ] } },

    { page: "K-means" },
    { callout: { t: "def", h: "K-means (clustering)", body: "An **unsupervised** ML algorithm that divides **unlabelled** data into **k clusters**, putting each record in the cluster whose **centre (centroid)** it is nearest to. **k** is chosen by the analyst before it runs." } },
    { steps: [
      { h: "1 · Choose k", m: "Decide how many clusters (e.g. 3).", n: "Often found by trying several k and seeing where adding a cluster stops helping (the 'elbow')." },
      { h: "2 · Place k centroids", m: "Start them at random points (or random records).", n: "Different starts can give different answers." },
      { h: "3 · Assign", m: "Every record joins its **nearest** centroid.", n: "Distance on the features, e.g. hours and artists." },
      { h: "4 · Update", m: "Move each centroid to the **mean** of the records in its cluster." },
      { h: "5 · Repeat", m: "Re-assign and update until no record changes cluster.", n: "Then the clusters are stable." }
    ] },
    kmeansFig(),
    { h: "Characteristics" },
    { ul: [
      "Purpose: **discover natural groups** (segments) in data nobody has labelled.",
      "Simple and fast — scales to big data.",
      "Needs **numeric** features on similar scales.",
      "Works best when groups are round-ish and similar in size.",
      "The clusters have **no meaning** until an analyst interprets them."
    ] },
    { h: "Used for digital analysis" },
    { ul: [
      "**Customer segmentation**: groups for targeted marketing or pricing.",
      "**Grouping stores or areas** with similar sales patterns.",
      "**Anomaly detection**: a record far from every centroid is suspicious.",
      "**Organising content**: grouping similar documents, songs or images."
    ] },
    { table: { head: ["Benefits", "Limitations"], rows: [
      ["Finds hidden groups with **no labelled data** needed.", "**k must be chosen in advance** — the wrong k gives meaningless groups."],
      ["Simple, fast and scales to very large data sets.", "Results depend on the **starting centroids** — runs can differ."],
      ["Easy to see and explain the groups on a chart.", "**Outliers** pull centroids out of place."],
      ["Lets an organisation tailor offers to each segment.", "Struggles with odd-shaped or very uneven clusters; needs numeric, scaled data."]
    ] } },
    { worked: { tag: "example", title: "Run one update step", q: "After assigning, cluster 1 holds the points (2, 4), (4, 8) and (6, 6). Where does its centroid move?",
      steps: [
        { m: "Mean of x: (2 + 4 + 6) ÷ 3 = **4**" },
        { m: "Mean of y: (4 + 8 + 6) ÷ 3 = **6**" },
        { m: "The centroid moves to **(4, 6)**; every point is then re-assigned to its nearest centroid.", n: "OCR will not ask for the arithmetic — but knowing the step makes \"how it works\" answers precise." }
      ], result: "(4, 6)" } },

    { page: "How big data, ML and AI interact" },
    loopFig(),
    { kv: [
      ["Big data → ML", "ML needs **large, varied, accurate** data to learn reliable patterns; big data supplies it. Little data → the model can't generalise."],
      ["ML → AI", "The trained model is the 'intelligence' inside the AI application — it is what predicts, classifies or recommends."],
      ["AI → big data", "Using the AI generates **more data** (what was clicked, whether a prediction came true), adding Volume and Velocity."],
      ["The loop", "New data retrains the model, so the AI **improves over time** — or drifts if the new data is poor."],
      ["Why it matters", "Big data on its own is too large for people to analyse; AI/ML is how its **Value** is extracted."]
    ] },
    { callout: { t: "key", h: "One sentence for the exam", body: "**Big data is the fuel, machine learning is the engine that learns from it, AI is what acts on what was learned — and its actions create more data.**" } },
    { worked: { tag: "example", title: "Which algorithm fits the job?", q: "For each task, choose decision tree, random forest or k-means.",
      steps: [
        { m: "Group 2 million shoppers into segments nobody has defined → **k-means** (unlabelled; find groups)." },
        { m: "Approve or refuse a loan and **show the applicant why** → **decision tree** (explainable rule)." },
        { m: "Flag fraudulent card payments as accurately as possible → **random forest** (accuracy first)." },
        { m: "Spot the odd sensor reading in a factory → **k-means** (far from every centroid)." }
      ], result: "Unlabelled → k-means; explain → tree; accuracy → forest",
      try: [{ notesOnly: true, grid: { cols: ["Task", "Algorithm"], rows: [
        ["Find types of hospital patient by their visit patterns (no labels)", "k-means"],
        ["Predict house prices as accurately as possible from 40 features", "random forest"],
        ["A council must explain every parking-permit refusal", "decision tree"],
        ["Group a city's postcodes by energy use", "k-means"]
      ], given: [[0, 0], [1, 0], [2, 0], [3, 0]], cap: "**Your turn.** Type **decision tree**, **random forest** or **k-means**." } }] } },

    { page: "In exam questions" },
    { callout: { t: "info", h: "Scenario used on this page", body: "**TuneWave** is a UK music-streaming service with 3 million subscribers. It records every play, skip, search and subscription change. It wants to use AI and machine learning to keep subscribers and to market to them." } },
    { worked: { tag: "exam", title: "AI recommendations", src: "OCR-style · Explain · 2 marks",
      q: "When subscribers log in, TuneWave shows songs it thinks they will like. Explain how artificial intelligence (AI) can be used to provide these recommendations.",
      steps: [
        { m: "AI/an algorithm analyses the subscriber's listening history (plays, skips, saves) (1)…", mk: "1", n: "Modelled on SAM Q5. 1 mark for identifying the feature." },
        { m: "…so it can suggest songs similar to those they played / that similar listeners played (1).", mk: "1", n: "1 mark for how it is used. Maximum ONE explanation. Also accept: compares them with listeners with similar tastes (1) and recommends what those listeners liked (1). Credit any other appropriate response." }
      ], result: "Identify how AI uses the data (1) + how that gives the recommendation (1)" } },
    { worked: { tag: "exam", title: "What machine learning is", src: "OCR-style · Describe · 2 marks",
      q: "TuneWave's analysts say they will use machine learning. Describe what is meant by machine learning.",
      steps: [
        { m: "A type/branch of AI where a computer learns from data (1)…", mk: "1" },
        { m: "…finding patterns to make predictions/decisions without being explicitly programmed with rules (1).", mk: "1", n: "Also accept: improves its accuracy as it receives more data (1). Do not accept: 'a computer that thinks' with no reference to learning from data." }
      ], result: "Learns from data (1) + without explicit rules / improves with data (1)" } },
    { worked: { tag: "exam", title: "Decision tree for cancellations", src: "OCR-style · Explain · 4 marks",
      q: "TuneWave wants to predict which subscribers are likely to cancel. Explain one benefit and one limitation to TuneWave of using a decision tree to do this.",
      steps: [
        { m: "Benefit: a decision tree is easy to understand / shows the route to each prediction (1)…", mk: "1", n: "Modelled on SAM Q8's benefit + limitation shape: identify (1) + effect on the organisation (1), each." },
        { m: "…so TuneWave's managers can see WHY a subscriber is at risk (e.g. inactive for 14 days) and target an offer at that reason (1).", mk: "1", n: "The second mark must be about TuneWave." },
        { m: "Limitation: a single tree can overfit its training data / small changes in the data change the tree (1)…", mk: "1" },
        { m: "…so its predictions for new subscribers may be wrong and TuneWave may send discounts to people who would have stayed (wasting money) (1).", mk: "1", n: "Also accept: less accurate than a random forest (1) so some subscribers who will leave are missed (1). Maximum one benefit and one limitation." }
      ], result: "Benefit (1) + effect (1); limitation (1) + effect (1)" } },
    { worked: { tag: "exam", title: "K-means for marketing", src: "OCR-style · Explain · 3 marks",
      q: "TuneWave wants to group its subscribers for marketing, but has no existing categories. Explain how the k-means algorithm could be used to do this.",
      steps: [
        { m: "The analyst chooses the number of groups (k) and k centroids are placed (1).", mk: "1" },
        { m: "Each subscriber is assigned to the nearest centroid using features such as hours listened / genres (1).", mk: "1" },
        { m: "Centroids move to the mean of their group and the process repeats until the groups stop changing (1)…", mk: "1", n: "Any three from these, or: it is unsupervised so needs no labels (1); TuneWave can then send each group its own playlist/offer (1). Credit any other appropriate response." }
      ], result: "Choose k → assign to nearest centroid → update and repeat (any three)" } },
    { worked: { tag: "exam", title: "Supervised or not?", src: "OCR-style · State · 2 marks",
      q: "State which of the three algorithms — decision tree, random forest, k-means — is unsupervised, and what makes it unsupervised.",
      steps: [
        { m: "K-means (1)", mk: "1" },
        { m: "It learns from unlabelled data / there is no known correct answer for each record (1).", mk: "1", n: "Do not accept: 'it has no supervisor' or 'it needs no human'." }
      ], result: "K-means (1); unlabelled data (1)" } },
    { worked: { tag: "exam", title: "How big data and AI interact", src: "OCR-style · Explain · 2 marks",
      q: "Explain how big data and AI interact in TuneWave's recommendation system.",
      steps: [
        { m: "Big data (millions of plays and skips) is used to train the machine learning model behind the AI (1)…", mk: "1" },
        { m: "…and the AI's recommendations create new data (whether they were played or skipped) which is used to retrain and improve it (1).", mk: "1", n: "Also accept: the more data, the more accurate the AI's patterns (1). Credit any other appropriate response." }
      ], result: "Data trains the AI (1) + AI generates data that improves it (1)" } },
    lor9("a random forest"),
    { worked: { tag: "exam", title: "Should TuneWave switch to a random forest?", src: "OCR-style · Discuss · 9 marks",
      q: "TuneWave currently uses a single decision tree to predict which subscribers will cancel. Its analysts propose replacing it with a random forest. Discuss whether TuneWave should use a random forest.\n\nYou should consider:\n- the benefits of using a random forest\n- the limitations of using a random forest\n- whether you would recommend it.",
      steps: [
        { m: "Purpose: a random forest builds many trees on random samples of the subscriber data and takes a majority vote on 'cancel' or 'stay'.", mk: "1", n: "Modelled on the shape of SAM Q6(c). Shows understanding — supports every level." },
        { m: "Benefit: more accurate than one tree, so fewer at-risk subscribers are missed and fewer retention discounts are wasted on loyal ones.", mk: "1", n: "Benefit applied to TuneWave — L2/L3." },
        { m: "Benefit: resists overfitting, so it keeps working as new subscribers join who are not like the training data.", mk: "1", n: "L3 when the reason (errors outvoted) is given." },
        { m: "Benefit: copes with TuneWave's many noisy features (skips, devices, genres) and can rank which features matter most.", mk: "1", n: "Uses the scenario's Variety — L3." },
        { m: "Limitation: harder to explain — TuneWave can't easily say why one subscriber was flagged, which matters if decisions affect customers (UK GDPR, trust).", mk: "1", n: "Limitation with consequence — L2/L3." },
        { m: "Limitation: needs more computing power and storage (hundreds of trees on 3 million subscribers), so higher cloud costs and slower scoring.", mk: "1", n: "L2/L3." },
        { m: "Limitation: if the history is biased (e.g. few older subscribers), every tree learns the same bias — accuracy for those groups stays poor.", mk: "1", n: "L3: links to data quality/ethics." },
        { m: "Recommendation: yes — use the random forest for scoring because accuracy saves money at this scale…", mk: "1", n: "A conclusion is needed for Level 3." },
        { m: "…but keep a simple tree (or the forest's feature importance) to explain the main reasons to the marketing team, and monitor accuracy for each customer group.", mk: "1", n: "A justified, conditional judgement is the top of Level 3. Credit the opposite recommendation if justified." }
      ], result: "Level 3: several benefits AND limitations applied to TuneWave, ending in a justified recommendation" } },
    { worked: { tag: "example", title: "Model Level 3 answer (opening and conclusion)", q: "Write the opening and conclusion of a Level 3 answer to the 9-mark question.",
      steps: [
        { m: "**Opening**: \"A random forest trains many decision trees on random samples of TuneWave's subscriber history and lets them vote. Because the trees make different errors, the vote is usually more accurate than TuneWave's single tree, so fewer subscribers who are about to leave would be missed…\"" },
        { m: "**Conclusion**: \"I would recommend the random forest, because with 3 million subscribers even a small gain in accuracy means fewer lost subscriptions and fewer wasted discounts. However, TuneWave should keep its decision tree to explain the main reasons for cancelling, and check the forest is equally accurate for every group of subscribers.\"" }
      ], result: "Every point tied to TuneWave; a conditional recommendation" } },

    { page: "Exam toolkit" },
    { callout: { t: "tip", h: "How OCR marks it", body: [
      "**Explain (2)**: identify (1) + how/so-what in the scenario (1). One explanation only — a second is not marked.",
      "**Explain one benefit and one limitation (4)**: 2 + 2; the second mark of each must be about the organisation (SAM Q8).",
      "**State / Identify (1 each)**: the term itself — 'k-means', 'supervised', 'majority vote'.",
      "**Discuss (9)**: benefits, limitations, a recommendation with reasons. No conclusion → no Level 3.",
      "Use the algorithm's **own vocabulary**: root, branch, leaf; ensemble, vote; k, centroid, cluster. Vague answers ('it sorts data') score little.",
      "Do not accept 'AI thinks like a human' or 'ML is clever software' — say it **learns patterns from data**."
    ] } },
    { callout: { t: "mnemonic", h: "Mnemonic — \"Tree Talks, Forest Votes, K Clusters\"", body: [
      "**Tree Talks** — a decision tree can explain itself (white box), but overfits.",
      "**Forest Votes** — many random trees vote: accurate, robust, but a black box and costly.",
      "**K Clusters** — k-means groups unlabelled data around k centroids; choose k first.",
      "And the loop: **D-L-A-D** — Data → Learn → Act → more Data."
    ] } },
    { h: "Must-know comparison" },
    { table: { head: ["", "Decision tree", "Random forest", "K-means"], rows: [
      ["Learning", "Supervised", "Supervised", "Unsupervised"],
      ["Output", "Class or value", "Vote or average", "k clusters"],
      ["Best for", "Explaining", "Accuracy", "Finding groups"],
      ["Key weakness", "Overfits, unstable", "Black box, costly", "Choose k; outliers"]
    ] } },
    { callout: { t: "tip", h: "Synoptic links", body: [
      "**F201 1.1** — big data's 6 V's are what makes ML necessary; Veracity limits every model.",
      "**F201 1.2–1.3** — capture and cleaning come first: training data must be wrangled.",
      "**F201 2.4–2.6** — predictive and prescriptive analytics; cluster analysis (2.6) is what k-means does; regression is the 'number' version of prediction.",
      "**F201 4.1–4.2** — personal training data must follow UK GDPR; automated decisions and algorithmic bias are 4.2's core.",
      "**F201 5.1–5.2** — AI in weather forecasting, smart cities, personalised healthcare.",
      "**F200** — the data analysis process and types of analysis; **F204** — IoE devices generate the data AI learns from; **F206** — AI recommendations and segmentation in digital marketing."
    ] } }
  ],
  flashcards: [
    ["Define AI and how ML relates to it.", "AI: computers doing tasks that normally need human intelligence. ML is a branch of AI that learns patterns from data instead of being programmed with rules.", 0],
    ["Name the three ML algorithms in the spec and their type.", "Decision tree (supervised), random forest (supervised), k-means (unsupervised).", 1],
    ["What is a random forest and why is it more accurate than one tree?", "Many decision trees, each on a random sample of rows and features, combined by majority vote — the trees' different errors cancel out.", 3],
    ["What does k-means do, and what must be chosen before it runs?", "Groups unlabelled data into k clusters around centroids; the analyst must choose k.", 4],
    ["How do big data, ML and AI interact?", "Big data trains the ML model; the model powers the AI; the AI's use creates new data that retrains it — a loop.", 6],
    ["What is supervised learning?", "Learning from labelled data — each training example has the correct answer — to classify or predict new cases.", 100],
    ["What is unsupervised learning?", "Learning from unlabelled data to find structure such as clusters or outliers, with no right answers given.", 101],
    ["Name the parts of a decision tree.", "Root node (first test), decision nodes (further tests), branches (answers), leaf nodes (predictions).", 102],
    ["Why is a decision tree called a 'white box'?", "Every prediction follows a readable route of tests, so the reason for a decision can be explained.", 103],
    ["What is meant by overfitting a model?", "A model learns its training data too closely, including noise, so it predicts badly on new data.", 104],
    ["How does a random forest combine its trees for a category and for a number?", "Category: majority vote. Number: the average of the trees' predictions.", 105],
    ["Give the main limitation of a random forest.", "It is hard to explain an individual decision (black box), and it needs more computing power than one tree.", 106],
    ["What is a centroid in k-means?", "The centre of a cluster — the mean of the points in it; each point joins its nearest centroid.", 107],
    ["List the k-means steps in order.", "Choose k → place k centroids → assign each point to the nearest → move centroids to the mean → repeat until nothing changes.", 108],
    ["Give two limitations of k-means.", "k must be chosen in advance; results depend on the starting centroids; outliers distort it; prefers round, even clusters.", 109],
    ["Give two benefits of AI in data science.", "Analyses huge volumes fast; finds hidden patterns; predicts so action is early; works consistently 24/7; personalises at scale.", 110],
    ["Give two limitations of AI in data science.", "Biased/poor data gives biased/wrong results; black-box decisions are hard to explain; costly; privacy risk; finds correlation not cause.", 111],
    ["List the stages of developing an AI model.", "Define the problem → collect and prepare data → choose an algorithm → train → test on unseen data → deploy and monitor.", 112],
    ["How can k-means detect anomalies?", "A record that lies far from every centroid doesn't fit any group, so it is flagged as unusual.", 114],
    ["What is NOT in the 3.1 spec, so need not be learnt?", "The historical development of AI and machine learning.", 115]
  ],
  quiz: [
    { q: "Which algorithm groups unlabelled records around k centroids?", opts: ["Decision tree", "Random forest", "K-means", "Regression"], ans: 2, why: "K-means is the unsupervised clustering algorithm; k is chosen first." },
    { q: "A model is trained on emails each labelled 'spam' or 'not spam'. This is:", opts: ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Data wrangling"], ans: 0, why: "Labelled examples with the right answer make it supervised." },
    { q: "Why is a random forest usually more accurate than one decision tree?", opts: ["It uses only the cleanest rows", "Its trees' errors are outvoted", "It never needs labelled data", "It has a single deeper tree"], ans: 1, why: "Trees built on different random samples make different mistakes; the majority vote cancels them out." },
    { q: "Which is the main BENEFIT of a single decision tree over a random forest?", opts: ["It is far more accurate", "It needs no training data", "It never overfits its data", "It is easy to explain"], ans: 3, why: "A tree's route is readable (white box); a forest of hundreds of trees is not." },
    { q: "In a decision tree, where is the prediction found?", opts: ["At a leaf node", "At the root node", "On every branch", "At the centroid"], ans: 0, why: "Leaves are the ends of routes and hold the outcome; the root is the first test." },
    { q: "Which is a LIMITATION of k-means?", opts: ["It needs labelled data", "It can't handle numbers", "k must be set in advance", "It always gives one cluster"], ans: 2, why: "The analyst chooses k; a poor choice gives meaningless groups. It needs numeric data and no labels." },
    { q: "A model scores 99% on its training data but 60% on new data. It is:", opts: ["Unsupervised", "Overfitted", "Clustered", "Anonymised"], ans: 1, why: "It learned the training data's noise — overfitting." },
    { q: "Which best describes how big data and AI interact?", opts: ["AI deletes the oldest data", "Data trains AI; AI makes data", "AI replaces the need for data", "Data is only used once by AI"], ans: 1, why: "Big data trains the models; using the AI generates new data that retrains it." },
    { q: "Which task suits a random forest best?", opts: ["Finding unknown customer groups", "Explaining each refusal simply", "Scoring card fraud accurately", "Choosing the number of clusters"], ans: 2, why: "Fraud scoring needs accuracy over explanation; groups are k-means' job; explaining is a tree's." },
    { q: "Which is NOT required by the 3.1 specification?", opts: ["How AI is used in data science", "Benefits of each algorithm", "How k-means can be used", "The history of AI research"], ans: 3, why: "The spec's 'Does not include' line rules out the historical development of AI and ML." }
  ]
};

/* =====================================================================
   F201.4.1  Legal issues — UK GDPR
   ===================================================================== */
function lawFig() {
  var it = [];
  it = it.concat(box(200, 8, 240, 46, ["UK GDPR", "the core rules for personal data"], { c: "it" }));
  it = it.concat(box(10, 92, 190, 54, ["Data Protection Act 2018", "sits beside it: exemptions,", "law enforcement, offences"], { c: "accent", size: 11 }));
  it = it.concat(box(225, 92, 190, 54, ["Data (Use and Access)", "Act 2025", "amends both (in stages)"], { c: "accent2", size: 11 }));
  it = it.concat(box(440, 92, 190, 54, ["PECR", "electronic marketing,", "cookies, calls, texts"], { c: "accent3", size: 11 }));
  it = it.concat(line(105, 92, 280, 54), line(320, 92, 320, 54), line(535, 92, 360, 54));
  it = it.concat(box(150, 186, 340, 46, ["Information Commissioner's Office (ICO)", "regulates all of them: advice, investigations, fines"], { c: "danger", alpha: 0.1 }));
  it = it.concat(arrow(320, 186, 320, 148, null, { c: "danger" }));
  it.push(txt(330, 168, "enforces", { pos: "e", size: 10.5, c: "danger", b: true }));
  return { fig: { w: 640, h: 240, items: it, cap: "The UK's data protection law today. UK GDPR is the EU GDPR kept in UK law after Brexit; the Data Protection Act 2018 works alongside it; the Data (Use and Access) Act 2025 amends both; PECR adds the rules for electronic marketing. The ICO enforces them (the 2025 Act turns it into a board-led Information Commission)." } };
}
function rolesFig() {
  var it = [];
  it = it.concat(box(10, 20, 160, 56, ["Data subject", "the member whose", "data it is"], { c: "accent3", size: 11 }));
  it = it.concat(box(240, 20, 160, 56, ["Data controller", "decides why and how", "(the gym chain)"], { c: "it", size: 11 }));
  it = it.concat(box(470, 20, 160, 56, ["Data processor", "processes on its behalf", "(e.g. a cloud host)"], { c: "accent", size: 11 }));
  it = it.concat(arrow(170, 40, 240, 40, "gives data", { dy: -10 }));
  it = it.concat(arrow(240, 62, 170, 62, "rights owed", { dy: 12, c: "good" }));
  it = it.concat(arrow(400, 40, 470, 40, "contract", { dy: -10 }));
  it.push(txt(320, 104, "The controller is accountable for compliance — including what its processors do.", { size: 10.5, c: "text2" }));
  return { fig: { w: 640, h: 118, items: it, cap: "The three roles UK GDPR names. Personal data = any information about an identifiable living person." } };
}

C["it:F201.4.1"] = {
  notes: [
    { h: "Legal issues — the whole topic on one page" },
    { h: "What the specification asks (F201 4.1)" },
    { kv: [
      [
        "Teaching content",
        "UK General Data Protection Regulation (UK GDPR): its **features**, **principles**, **rights of data subjects** and **marketing consent**."
      ],
      [
        "To include",
        "The latest version of the regulation · its main purpose(s) · how to comply · why compliance matters · the impacts of non-compliance on organisations · how organisational policies on data use mitigate non-compliance."
      ],
      [
        "Does not include",
        "The **detailed content** of the regulation — no article numbers or legal wording needed. Know what it requires, not the text."
      ]
    ] },
    { ol: ["What UK GDPR is", "The seven principles", "Rights of data subjects", "Marketing consent", "Complying and why it matters", "Non-compliance and policies", "In exam questions", "Exam toolkit"] },
    { table: { head: ["Item", "One line to remember"], rows: [
      ["Latest version", "UK GDPR, with the Data Protection Act 2018, as amended by the Data (Use and Access) Act 2025."],
      ["Purpose", "Protect individuals' personal data; set the principles, rights and obligations for processing it."],
      ["Principles", "Seven: lawful/fair/transparent, purpose limitation, minimisation, accuracy, storage limitation, security, accountability."],
      ["Rights", "Eight: informed, access, rectification, erasure, restrict, portability, object, automated decisions."],
      ["Marketing consent", "Freely given, specific, informed, unambiguous opt-in; easy to withdraw; PECR for emails/texts."],
      ["Non-compliance", "Fines (up to £17.5m or 4% of worldwide turnover), enforcement, compensation, reputation, disruption."]
    ] } },

    { page: "What UK GDPR is" },
    { callout: { t: "def", h: "UK GDPR", body: "The UK law that controls how **personal data** is collected, stored, used and shared. It is the EU's General Data Protection Regulation **retained in UK law** after Brexit (from 1 January 2021), read together with the **Data Protection Act 2018**." } },
    lawFig(),
    { callout: { t: "def", h: "The latest version", body: "**UK GDPR and the Data Protection Act 2018, as amended by the Data (Use and Access) Act 2025** (Royal Assent June 2025, brought in in stages). The 2025 Act adjusts the rules — for example, clearer 'recognised legitimate interests', more room for automated decisions with safeguards, some low-risk cookies without consent, and PECR fines raised to UK GDPR levels — but the principles and rights stay." } },
    { h: "Main purposes" },
    { ul: [
      "**Protect individuals'** personal data and privacy.",
      "Set out the **principles, rights and obligations** for anyone processing personal data.",
      "Give people **control** over their data (the rights).",
      "Make organisations **accountable** — able to prove they comply.",
      "Allow data to be used and shared **safely**, including with the EU, which recognises UK law as adequate."
    ] },
    rolesFig(),
    { h: "Features" },
    { kv: [
      ["Personal data", "Any information relating to an **identified or identifiable living person** — name, email, location, an online ID, a member number."],
      ["Special category data", "Extra-sensitive data needing extra protection: health, racial or ethnic origin, religion, politics, trade union membership, genetic, biometric (for ID), sex life or sexual orientation."],
      ["Lawful basis", "Every processing needs one of six: **consent**, **contract**, **legal obligation**, **vital interests**, **public task**, **legitimate interests**."],
      ["Accountability", "Keep records of processing; be able to show compliance."],
      ["Data protection by design and default", "Build privacy in from the start; collect the minimum by default."],
      ["DPIA", "A **Data Protection Impact Assessment** before high-risk processing (e.g. large-scale health data, monitoring)."],
      ["Data Protection Officer", "Required for public bodies and organisations whose core work is large-scale monitoring or special category data."],
      ["Breach reporting", "Report a personal data breach to the ICO **within 72 hours** if it risks people's rights; tell the people affected without undue delay if the risk is high."],
      ["Scope", "Applies to paper filing systems as well as computers, and to organisations abroad that offer goods or services to people in the UK."],
      ["International transfers", "Personal data may leave the UK only to an 'adequate' country or with safeguards."]
    ] },

    { page: "The seven principles" },
    { table: { head: ["Principle", "What it means", "PulseFit gym example"], rows: [
      ["1 · Lawfulness, fairness and transparency", "Have a lawful basis; don't mislead; tell people what you do (privacy notice).", "The app's privacy notice explains the health questionnaire is used to tailor workouts."],
      ["2 · Purpose limitation", "Collect for specified, explicit, legitimate purposes; don't reuse for an incompatible one.", "Data collected to run memberships isn't sold to a supplement firm."],
      ["3 · Data minimisation", "Adequate, relevant and limited to what is necessary.", "No need for a member's job title or marital status."],
      ["4 · Accuracy", "Accurate and kept up to date; correct or delete errors.", "Members can update their address and medical conditions in the app."],
      ["5 · Storage limitation", "Keep identifiable data no longer than necessary.", "Delete ex-members' details after a set retention period."],
      ["6 · Integrity and confidentiality (security)", "Protect against unauthorised access, loss or damage.", "Encrypted database; staff see only what their job needs."],
      ["7 · Accountability", "Take responsibility and be able to **prove** compliance.", "Records of processing, DPIAs, staff training logs."]
    ] } },
    { callout: { t: "warn", h: "Principles are not rights", body: "\"Right to access\" is a **right**; \"accuracy\" is a **principle**. A question asking for principles gets no marks for rights, and the reverse." } },
    { worked: { tag: "example", title: "Which principle is broken?", q: "PulseFit:\n- **(a)** keeps ex-members' bank details for ten years 'just in case'\n- **(b)** asks new members for their religion\n- **(c)** leaves printed health forms on reception.\n\nName the principle each breaks.",
      steps: [
        { m: "(a) No reason to keep them → **storage limitation**." },
        { m: "(b) Not needed to run a gym membership → **data minimisation**.", n: "Religion is also special category data — doubly hard to justify." },
        { m: "(c) Anyone could read them → **integrity and confidentiality (security)**." }
      ], result: "Storage limitation; minimisation; security" } },

    { page: "Rights of data subjects" },
    { callout: { t: "def", h: "Data subject", body: "The **living individual** the personal data is about. UK GDPR gives them **eight rights** the organisation must respect — usually within **one month** of a request, and normally free of charge." } },
    { table: { head: ["Right", "What the person can do", "Example"], rows: [
      ["To be informed", "Be told what is collected, why, how long it is kept and who it is shared with.", "A privacy notice at sign-up."],
      ["Of access", "Get a copy of their data — a **subject access request (SAR)**.", "A member asks for everything PulseFit holds on them."],
      ["To rectification", "Have inaccurate or incomplete data corrected.", "Fix a wrong date of birth."],
      ["To erasure ('to be forgotten')", "Have data deleted when there's no good reason to keep it.", "An ex-member asks for their account to be deleted."],
      ["To restrict processing", "Have data kept but not used, e.g. while accuracy is disputed.", "Pause use of a disputed health note."],
      ["To data portability", "Get their data in a common, machine-readable format to reuse elsewhere.", "Export workout history as a CSV to another fitness app."],
      ["To object", "Object to processing — **absolutely** for direct marketing.", "\"Stop sending me offers.\" It must stop."],
      ["Related to automated decision-making and profiling", "Safeguards on significant decisions made solely by computer: be told, give their view, get a human to review, contest it.", "An automatic refusal of membership can be challenged (see 4.2)."]
    ] } },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"The right to erasure means the organisation must always delete.\" — Not if it still has a lawful reason (e.g. a legal duty to keep financial records).",
      "\"UK GDPR only covers computer data.\" — Paper records in a filing system are covered too.",
      "\"Anonymous statistics are personal data.\" — Truly anonymised data is not; pseudonymised data (a code that can be linked back) still is.",
      "\"Consent is always needed.\" — Consent is only one of six lawful bases; a gym can process payment details because of the **contract**.",
      "\"UK GDPR was replaced after Brexit.\" — It was **kept** (retained) and amended, not replaced.",
      "\"The maximum fine is €20 million.\" — That is the EU figure; the UK figure is **£17.5 million or 4% of annual worldwide turnover, whichever is higher**."
    ] } },

    { page: "Marketing consent" },
    { callout: { t: "def", h: "Valid consent (UK GDPR)", body: "A **freely given, specific, informed and unambiguous** indication of the person's wishes, by a **clear affirmative action** (they actively opt in). It must be **recorded** and as **easy to withdraw as to give**." } },
    { table: { head: ["Valid", "Not valid"], rows: [
      ["An unticked box the member ticks: \"Email me offers\".", "A **pre-ticked** box, or silence, or inactivity."],
      ["Separate choices for email, text and post.", "One bundled 'I agree to everything' with the terms and conditions."],
      ["Says who will contact them and about what.", "Vague: \"we and our partners may contact you\"."],
      ["Unsubscribe link in every message.", "Making the person phone or write a letter to opt out."],
      ["A record of when and how they opted in.", "No proof — the organisation can't show consent."]
    ] } },
    { h: "PECR alongside UK GDPR" },
    { kv: [
      ["PECR", "The Privacy and Electronic Communications Regulations: extra rules for marketing by **email, text, phone** and for **cookies**."],
      ["Emails and texts to individuals", "Need consent — **unless** the 'soft opt-in' applies."],
      ["Soft opt-in", "An existing customer, details collected during a sale (or negotiation), marketing only similar products, a chance to opt out when collected **and** in every message."],
      ["Phone marketing", "Don't call numbers on the Telephone Preference Service (TPS) unless they have agreed."],
      ["Right to object", "Anyone can stop direct marketing at any time — this right is **absolute**."]
    ] },

    { page: "Complying and why it matters" },
    { h: "How to comply" },
    { steps: [
      { h: "Know your data", m: "Audit what personal data is held, where, why and who sees it; keep records of processing.", n: "Accountability starts here." },
      { h: "Choose a lawful basis", m: "For every purpose; extra conditions for special category data.", n: "Gym payments: contract. Health questionnaire: explicit consent." },
      { h: "Tell people", m: "A clear privacy notice at the point of collection.", n: "Right to be informed." },
      { h: "Collect the minimum, keep it accurate, delete on schedule", m: "Minimisation, accuracy, storage limitation — a retention schedule.", n: "" },
      { h: "Secure it", m: "Encryption, access controls, strong passwords, backups, staff training.", n: "Integrity and confidentiality." },
      { h: "Handle rights requests", m: "A process to answer SARs, corrections and erasure within one month.", n: "" },
      { h: "Assess and appoint", m: "DPIAs for high-risk processing; a DPO where required; contracts with processors.", n: "" },
      { h: "Plan for breaches", m: "Detect, contain, report to the ICO within 72 hours where needed, tell those affected.", n: "" }
    ] },
    { h: "Why compliance is important" },
    { table: { head: ["Reason", "Why it matters to the organisation"], rows: [
      ["It is the law", "Avoids fines, enforcement notices and legal action."],
      ["Customer trust", "People share data with organisations they trust — and leave those they don't."],
      ["Reputation and brand", "Avoids damaging headlines after a breach."],
      ["Better data", "Accurate, minimal, well-organised data is cheaper to store and more useful to analyse."],
      ["Security", "Following the security principle reduces the chance and impact of a breach."],
      ["Business opportunities", "Partners, public-sector contracts and EU data flows expect compliance."],
      ["Protects individuals", "From fraud, identity theft, discrimination and distress."]
    ] } },

    { page: "Non-compliance and policies" },
    { h: "Impacts of non-compliance on an organisation" },
    { table: { head: ["Impact", "What happens", "Why it hurts"], rows: [
      ["Financial penalties", "ICO fines up to **£17.5 million or 4% of annual worldwide turnover, whichever is higher** (lower tier £8.7m or 2%).", "Can wipe out profit; a large chain pays far more under the 4% rule."],
      ["Other ICO action", "Reprimands, enforcement notices, orders to **stop processing**.", "Can halt marketing or a whole service."],
      ["Regulatory investigation", "Audits and investigations.", "Time-consuming and costly; may lead to further penalties."],
      ["Legal action and compensation", "Individuals can claim compensation for damage or distress; some offences are criminal.", "Legal fees and payouts; group claims after a breach."],
      ["Reputational damage", "Negative publicity, loss of trust.", "Customers leave; brand value and future deals fall."],
      ["Increased costs", "Extra security, staff retraining, consultants, breach notification.", "The bigger the organisation, the more staff to retrain."],
      ["Business disruption", "Systems taken offline, data rebuilt after a breach.", "Lost sales while it is fixed."]
    ] } },
    { callout: { t: "warn", h: "€20 million or £17.5 million?", body: "The SAM's mark scheme quotes the EU figure (€20 million or 4%). UK law says **£17.5 million or 4% of annual worldwide turnover, whichever is higher**. Write the UK figure; the key idea examiners want is **'up to 4% of global turnover — whichever is greater'**." } },
    { h: "Organisational policies that mitigate non-compliance" },
    { table: { head: ["Policy", "What it sets out", "Which risk it reduces"], rows: [
      ["Data protection policy", "Roles, lawful bases, how principles are applied.", "Staff not knowing their duties."],
      ["Data retention policy", "How long each type of data is kept and how it is deleted.", "Breaching storage limitation."],
      ["Information security / access control policy", "Passwords, encryption, who can see what, device use.", "Breaches of security and confidentiality."],
      ["Acceptable use / BYOD policy", "Rules for using systems and personal devices.", "Data leaking on phones, USB sticks, personal email."],
      ["Breach response policy", "Who does what in the first 72 hours.", "Late or missed ICO reports; bigger damage."],
      ["Subject rights procedure", "How SARs, erasure and objections are handled in time.", "Missed one-month deadlines."],
      ["Marketing and consent policy", "How consent is collected, recorded and withdrawn.", "Unlawful emails and texts (PECR)."],
      ["Staff training policy", "Regular, recorded training for everyone who handles data.", "Human error — the commonest cause of breaches."],
      ["Data sharing policy and agreements", "When and how data goes to third parties.", "Unlawful or unsafe sharing."]
    ] } },
    { worked: { tag: "example", title: "Turn a policy into a mitigation", q: "How does a data retention policy reduce PulseFit's risk of non-compliance?",
      steps: [
        { m: "The policy sets a fixed period for each kind of data — e.g. delete ex-members' records two years after they leave.", n: "What the policy says." },
        { m: "Staff then delete on schedule instead of keeping data 'just in case', so PulseFit meets **storage limitation**…", n: "The principle it protects." },
        { m: "…and if a breach happens, less data is exposed — smaller harm, smaller likely fine.", n: "The impact it reduces." }
      ], result: "Policy → behaviour → principle met → impact reduced" } },

    { page: "In exam questions" },
    { callout: { t: "info", h: "Scenario used on this page", body: "**PulseFit** runs 120 gyms across the UK. Members join through an app, giving their name, address, date of birth, bank details and a health questionnaire. PulseFit emails members offers and wants to send texts too." } },
    { worked: { tag: "exam", title: "Purpose of UK GDPR", src: "OCR-style · Describe · 1 mark",
      q: "PulseFit must comply with UK GDPR. Describe the purpose of UK GDPR.",
      steps: [
        { m: "Any one from: to protect individuals' personal data / privacy (1); to set out the principles, rights and obligations for processing personal data (1).", mk: "1", n: "Modelled on SAM Q2(a). Credit any other appropriate response, e.g. to give people control over how their data is used." }
      ], result: "Protect personal data / set rules for processing it (1)" } },
    { worked: { tag: "exam", title: "Two principles", src: "OCR-style · State · 2 marks",
      q: "State two principles of UK GDPR that PulseFit must follow when storing members' data.",
      steps: [
        { m: "Any two from: lawfulness, fairness and transparency (1); purpose limitation (1); data minimisation (1); accuracy (1)…", mk: "1", n: "Modelled on SAM Q2(b). Accept the principle's description in place of its name (e.g. 'kept no longer than necessary')." },
        { m: "…storage limitation (1); integrity and confidentiality / security (1); accountability (1).", mk: "1", n: "Do not accept rights (e.g. 'right to access') — they are not principles. Mark only the first two answers." }
      ], result: "Any two of the seven principles (1 + 1)" } },
    { worked: { tag: "exam", title: "Identify the principle broken", src: "OCR-style · Identify · 3 marks",
      q: "An audit of PulseFit finds three problems. Identify the UK GDPR principle each one breaks:\n- **(a)** members' addresses are years out of date\n- **(b)** members' data was shared with an energy-drink brand for its own adverts\n- **(c)** the app asks for members' National Insurance numbers.",
      steps: [
        { m: "(a) Accuracy (1)", mk: "1" },
        { m: "(b) Purpose limitation (1)", mk: "1", n: "Also accept lawfulness, fairness and transparency." },
        { m: "(c) Data minimisation (1)", mk: "1" }
      ], result: "Accuracy; purpose limitation; data minimisation",
      try: [{ notesOnly: true, grid: { cols: ["Problem found", "Principle broken"], rows: [
        ["Cancelled members' records are never deleted", "storage limitation"],
        ["The members' database has no password", "integrity and confidentiality"],
        ["PulseFit can't show any record of how it handles data", "accountability"],
        ["Members aren't told their data is used for profiling", "transparency"]
      ], given: [[0, 0], [1, 0], [2, 0], [3, 0]], cap: "**Your turn.** Type **storage limitation**, **integrity and confidentiality**, **accountability** or **transparency**." } }] } },
    { worked: { tag: "exam", title: "Rights of data subjects", src: "OCR-style · Explain · 4 marks",
      q: "A former member contacts PulseFit about the data it holds on her. Explain two rights she has under UK GDPR.",
      steps: [
        { m: "Right of access (1)…", mk: "1", n: "One mark for identifying each right." },
        { m: "…she can make a subject access request and PulseFit must give her a copy of her data, normally free and within one month (1).", mk: "1", n: "One mark for applying it to her / PulseFit." },
        { m: "Right to erasure (1)…", mk: "1" },
        { m: "…as she has left, PulseFit should delete her details unless it has a legal reason to keep some, e.g. payment records (1).", mk: "1", n: "Also accept rectification, restriction, portability (e.g. export her workout history), objection (e.g. to marketing). Credit any other appropriate response." }
      ], result: "Right (1) + what it lets her do with PulseFit (1), twice" } },
    { worked: { tag: "exam", title: "Consent for marketing texts", src: "OCR-style · Explain · 2 marks",
      q: "PulseFit wants to send marketing texts to members. Explain how PulseFit can get valid consent to do this.",
      steps: [
        { m: "Members must actively opt in, e.g. by ticking an unticked box for texts in the app (1)…", mk: "1" },
        { m: "…which is specific to texts, says what they will receive, is recorded, and can be withdrawn as easily (e.g. reply STOP) (1).", mk: "1", n: "Do not accept: a pre-ticked box, or consent hidden in the terms and conditions. Also accept: the soft opt-in for existing members marketed similar services, with an opt-out each time (1)." }
      ], result: "Clear opt-in (1) + specific, informed, recorded, easy to withdraw (1)" } },
    { worked: { tag: "exam", title: "Policies that reduce the risk", src: "OCR-style · Explain · 4 marks",
      q: "Explain how two organisational policies could help PulseFit avoid breaching UK GDPR.",
      steps: [
        { m: "A data retention policy (1)…", mk: "1" },
        { m: "…sets how long members' data is kept so it is deleted when they leave, meeting storage limitation (1).", mk: "1" },
        { m: "An access control / security policy (1)…", mk: "1" },
        { m: "…means only staff who need health questionnaires can open them, with encryption and strong passwords, reducing the risk of a breach (1).", mk: "1", n: "Also accept staff training, breach response, marketing consent, acceptable use/BYOD. Identify (1) + how it prevents non-compliance at PulseFit (1)." }
      ], result: "Policy (1) + how it prevents a breach of UK GDPR (1), twice" } },
    lor6("impacts"),
    { worked: { tag: "exam", title: "Impacts of non-compliance", src: "OCR-style · Analyse · 6 marks",
      q: "Analyse the possible impacts on PulseFit of not complying with UK GDPR.",
      steps: [
        { m: "Financial penalties: the ICO can fine up to £17.5 million or 4% of annual worldwide turnover, whichever is higher — for a 120-gym chain this could wipe out a year's profit.", mk: "1", n: "Modelled on SAM Q2(c). Accept '€20 million or 4%' (the EU figure). An impact + its consequence for PulseFit → L2/L3." },
        { m: "Reputational damage: a leak of health questionnaires would make the news; members would lose trust and cancel, and new members would join rivals.", mk: "1", n: "Tied to special category data — L3." },
        { m: "Legal action: members can claim compensation for distress, especially as health data is involved, adding legal costs.", mk: "1", n: "L2/L3." },
        { m: "Increased costs: retraining staff at 120 gyms, new security, consultants — expensive because of the number of sites.", mk: "1", n: "Scale of the business used — L3." },
        { m: "Business disruption: the ICO could order PulseFit to stop processing, e.g. halt its marketing texts or app sign-ups until fixed.", mk: "1", n: "L3." },
        { m: "Regulatory investigation: an ICO audit takes management time and can lead to further sanctions.", mk: "1", n: "L2." }
      ], result: "Level 3: a range of impacts, each explained and tied to PulseFit (scale, health data), using correct terms" } },

    { page: "Exam toolkit" },
    { callout: { t: "tip", h: "How OCR marks it", body: [
      "**State two principles**: the name or its description scores; a **right** scores nothing.",
      "**Describe the purpose**: 'to protect personal data' is enough for 1 mark. 'To stop hacking' is not the purpose.",
      "**Explain a right**: name it (1) + what the person can make the organisation do (1).",
      "**Analyse impacts (6)**: fines, reputation, legal action, costs, disruption, investigation — each **explained** and **applied** (size of the firm, sensitivity of its data).",
      "Fines: '**up to 4% of annual (worldwide) turnover or £17.5m, whichever is higher**' — the 'whichever is higher' wins credit.",
      "The law is **UK GDPR** (with the DPA 2018). Don't write 'the Data Protection Act 1998' — it was repealed."
    ] } },
    { callout: { t: "mnemonic", h: "Mnemonics", body: [
      "**Seven principles — \"Lazy People Make Awful Spreadsheets In August\"**: Lawfulness (fair, transparent), Purpose limitation, Minimisation, Accuracy, Storage limitation, Integrity and confidentiality, Accountability.",
      "**Eight rights — \"I Always Read Every Rule; Paperwork Overwhelms Admins\"**: Informed, Access, Rectification, Erasure, Restrict, Portability, Object, Automated decisions.",
      "**Valid consent — FSIU**: Freely given, Specific, Informed, Unambiguous (and easy to withdraw)."
    ] } },
    { h: "Numbers to know" },
    { kv: [
      ["Maximum fine", "£17.5 million or 4% of annual worldwide turnover, whichever is higher"],
      ["Lower tier", "£8.7 million or 2%"],
      ["Report a breach to the ICO", "within 72 hours (if it risks people's rights)"],
      ["Answer a subject access request", "within one month, normally free"],
      ["Lawful bases", "six · Principles: seven · Rights: eight"]
    ] },
    { callout: { t: "tip", h: "Synoptic links", body: [
      "**F200 4** — legal considerations in data analytics: data protection, copyright, computer misuse.",
      "**F201 4.2** — ethics goes beyond the law: automated decisions (UK GDPR's safeguards), ownership, sharing, frameworks.",
      "**F201 1.2** — data capture (loyalty cards, apps, sensors) must have a lawful basis and a privacy notice.",
      "**F201 2.1–2.3** — where data is stored (cloud, abroad) raises security and international-transfer duties.",
      "**F203** — databases holding personal data need access control and retention; **F204** — IoE devices collect personal data; **F206** — digital marketing lives under consent and PECR."
    ] } }
  ],
  flashcards: [
    ["What is the latest UK data protection regulation and who enforces it?", "UK GDPR with the Data Protection Act 2018, as amended by the Data (Use and Access) Act 2025; enforced by the ICO.", 0],
    ["State the main purpose of UK GDPR.", "To protect individuals' personal data by setting the principles, rights and obligations for processing it.", 1],
    ["List the seven principles of UK GDPR.", "Lawfulness, fairness and transparency; purpose limitation; data minimisation; accuracy; storage limitation; integrity and confidentiality; accountability.", 2],
    ["What does the 'right to be forgotten' let a person do?", "Have their personal data erased when there's no longer a good reason to keep it — the right to erasure.", 3],
    ["What does valid marketing consent require?", "Freely given, specific, informed, unambiguous opt-in by a clear action, recorded, and as easy to withdraw as to give.", 4],
    ["How do organisational policies mitigate non-compliance?", "They set rules staff follow (retention, access, training, breach response), so principles are met and breaches are less likely.", 9],
    ["List the eight rights of data subjects.", "Informed, access, rectification, erasure, restrict processing, data portability, object, rights on automated decision-making and profiling.", 100],
    ["What is personal data?", "Any information relating to an identified or identifiable living person.", 101],
    ["Give four examples of special category data.", "Health, ethnic origin, religion, political opinions, trade union membership, genetic, biometric, sex life or sexual orientation.", 102],
    ["Name the six lawful bases for processing.", "Consent, contract, legal obligation, vital interests, public task, legitimate interests.", 103],
    ["How quickly must a serious data breach be reported to the ICO?", "Within 72 hours of becoming aware, if it risks people's rights.", 104],
    ["What is PECR and when does it apply?", "The Privacy and Electronic Communications Regulations — rules for marketing by email, text and phone, and for cookies, alongside UK GDPR.", 106],
    ["What is the 'soft opt-in'?", "Emailing existing customers about similar products without fresh consent, if they could opt out when their details were taken and in every message.", 107],
    ["Name four impacts of non-compliance on an organisation.", "Fines, reputational damage and lost trust, legal action and compensation, increased costs, business disruption, investigations.", 8],
    ["What is the difference between a data controller and a data processor?", "The controller decides why and how data is processed and is accountable; the processor processes it on the controller's behalf.", 108],
    ["Why does the SAM quote €20 million for the maximum fine?", "It is the EU GDPR figure; the UK equivalent is £17.5 million or 4% of worldwide turnover, whichever is higher.", 109]
  ],
  quiz: [
    { q: "Which of these is a PRINCIPLE of UK GDPR?", opts: ["Right of access", "Data minimisation", "Right to object", "Data portability"], ans: 1, why: "Minimisation is a principle; the other three are rights of data subjects." },
    { q: "What is the maximum UK GDPR fine?", opts: ["£500,000 or 1% of turnover", "£8.7m or 2%, whichever lower", "£17.5m or 4%, whichever higher", "£20m or 10% of UK profit"], ans: 2, why: "£17.5 million or 4% of annual worldwide turnover, whichever is higher." },
    { q: "Which makes consent for marketing emails valid?", opts: ["A pre-ticked opt-in box", "An unticked box they tick", "Silence after a notice", "Consent in the T&Cs"], ans: 1, why: "Consent must be a clear affirmative action — the person ticks an unticked box." },
    { q: "Keeping ex-members' data 'just in case' breaks which principle?", opts: ["Storage limitation", "Accuracy", "Accountability", "Transparency"], ans: 0, why: "Data must be kept no longer than necessary." },
    { q: "How long does an organisation normally have to answer a subject access request?", opts: ["72 hours", "One week", "Six months", "One month"], ans: 3, why: "One month, normally free; 72 hours is the breach-reporting deadline." },
    { q: "Which law adds the rules for marketing texts and cookies?", opts: ["PECR", "Computer Misuse Act", "Equality Act", "Copyright Act"], ans: 0, why: "The Privacy and Electronic Communications Regulations sit alongside UK GDPR." },
    { q: "Which is the latest version of the regulation?", opts: ["Data Protection Act 1998 only", "EU GDPR as applied in 2018", "UK GDPR as amended in 2025", "Freedom of Information Act"], ans: 2, why: "UK GDPR with the DPA 2018, amended by the Data (Use and Access) Act 2025. The 1998 Act was repealed." },
    { q: "A member exports her workout history to a rival app. Which right is this?", opts: ["Rectification", "Restriction", "Erasure", "Data portability"], ans: 3, why: "Portability: getting your data in a reusable, machine-readable format." },
    { q: "Which policy most directly reduces late breach reports?", opts: ["A breach response policy", "A marketing consent policy", "A data retention policy", "A dress code policy"], ans: 0, why: "It sets who does what in the first 72 hours." }
  ]
};

/* =====================================================================
   F201.4.2  Ethical issues
   ===================================================================== */
function biasFig() {
  var it = [];
  it = it.concat(box(10, 14, 190, 58, ["Historical data", "past hires were mostly men", "from a few universities"], { c: "accent2", size: 11 }));
  it = it.concat(box(225, 14, 190, 58, ["Algorithm trains", "learns 'what a hire", "looks like'"], { c: "it", size: 11 }));
  it = it.concat(box(440, 14, 190, 58, ["Automated decisions", "scores CVs; similar", "candidates ranked top"], { c: "danger", size: 11 }));
  it = it.concat(arrow(200, 43, 225, 43), arrow(415, 43, 440, 43));
  it = it.concat(box(225, 124, 190, 50, ["New outcome data", "only shortlisted people", "ever get a result"], { c: "muted", size: 11, alpha: 0.12 }));
  it = it.concat(arrow(535, 72, 415, 140, "feeds back", { dx: 36, dy: 6 }));
  it = it.concat(arrow(225, 150, 105, 72, "retrains → bias grows", { dx: -36, dy: 8 }));
  it.push(txt(320, 196, "Also: proxy features — a postcode or a gap in employment can stand in for ethnicity, disability or pregnancy.", { size: 10.5, c: "text2" }));
  return { fig: { w: 640, h: 210, items: it, cap: "How automated decision making builds in bias: the model copies the pattern in its training data, its decisions create new data with the same pattern, and retraining strengthens it. Nobody has to intend to discriminate." } };
}
function identityFig() {
  var it = [];
  var cols = ["danger", "accent2", "accent", "good"];
  var heads = [["Identifiable", "Name: Amy Khan", "DOB 03/05/2004"], ["Pseudonymised", "ID: C-4471", "key kept separately"], ["Anonymised", "Age 20–24, Leeds", "no way back"], ["Aggregated", "38% of applicants", "were aged 20–24"]];
  heads.forEach(function (h, i) {
    it = it.concat(box(10 + i * 158, 16, 146, 64, h, { c: cols[i], size: 11 }));
    if (i < 3) it = it.concat(arrow(156 + i * 158, 48, 168 + i * 158, 48, null, { c: "muted", w: 1.3 }));
  });
  it.push(txt(10, 100, "still personal data — UK GDPR applies", { pos: "e", size: 10.5, c: "danger" }));
  it.push(txt(630, 100, "not personal data — if re-identification is not reasonably likely", { pos: "w", size: 10.5, c: "good" }));
  it = it.concat(arrow(30, 122, 610, 122, "more protection for the person, less detail for the analyst", { dy: 14, c: "it" }));
  return { fig: { w: 640, h: 150, items: it, cap: "Protecting identity is a sliding scale. Pseudonymised data can be linked back with the key, so it is still personal data; properly anonymised or aggregated data is not — but combining 'anonymous' data sets can re-identify people." } };
}

C["it:F201.4.2"] = {
  notes: [
    { h: "Ethical issues — the whole topic on one page" },
    { h: "What the specification asks (F201 4.2)" },
    { kv: [
      [
        "Teaching content",
        "Automated decision making · collection, storage, ownership and sharing of data · emerging ethical debates affecting the use of data · frameworks for ethical data management: the **Data Ethics Framework** and **inclusive data principles**."
      ],
      [
        "To include",
        "How automated decision making creates risks of discrimination and bias · how UK GDPR applies to it · its impacts on individuals · protecting identity when collecting, storing and sharing · how data ownership is determined · how organisations respond to collection, storage, ownership and sharing issues · the impacts of emerging ethical debates on individuals and how organisations respond · how organisations use the frameworks."
      ],
      ["Remember", "Ethics = what is **right**, which can go further than what is **legal** (4.1)."]
    ] },
    { ol: ["Automated decision making", "Collection, storage, ownership and sharing", "Emerging ethical debates", "Frameworks for ethical data management", "In exam questions", "Exam toolkit"] },
    { table: { head: ["Item", "One line to remember"], rows: [
      ["Automated decision making", "A decision about a person made by computer; bias comes from data, proxies, designers and feedback loops."],
      ["UK GDPR and ADM", "Be told; give your view; get a human to review; contest it — for significant solely automated decisions."],
      ["Protecting identity", "Minimise, pseudonymise, anonymise, aggregate, encrypt, restrict access."],
      ["Ownership", "Set by who collected/created it, contracts and terms, employment, IP rights — the person keeps their data rights."],
      ["Emerging debates", "Generative AI training data, facial recognition, workplace monitoring, health data, children's data…"],
      ["Frameworks", "Data Ethics Framework: transparency, accountability, fairness + five actions. Inclusive data principles: everyone counted."]
    ] } },

    { page: "Automated decision making" },
    { callout: { t: "def", h: "Automated decision making (ADM)", body: "Making a decision about a person **by automated means** — an algorithm or AI model — with **no meaningful human involvement**. Often it uses **profiling**: analysing someone's data to predict their behaviour, preferences or risk." } },
    { ul: [
      "**Examples**: shortlisting CVs; approving loans and credit limits; insurance pricing; fraud flags that freeze an account; which customers get a discount voucher; benefit claims flagged for checks.",
      "**Why organisations use it**: speed, scale, lower cost, the same rules applied every time."
    ] },
    { h: "How ADM creates risks of bias and discrimination" },
    biasFig(),
    { table: { head: ["Cause", "How it creates bias", "Example"], rows: [
      ["Biased historical data", "The model copies past unfair decisions.", "Amazon scrapped an experimental CV-screening tool (reported 2018) that marked down CVs mentioning 'women's'."],
      ["Unrepresentative training data", "Too little data on some groups, so the model hasn't learned their patterns.", "Face recognition less accurate for under-represented skin tones."],
      ["Proxy variables", "A neutral-looking feature stands in for a protected one.", "Postcode standing in for ethnicity or income."],
      ["Designer's unconscious bias", "Choices of features, goals and thresholds reflect the builders' assumptions.", "Treating a career gap as a negative hits carers and parents."],
      ["Feedback loops", "Decisions shape the next data, which strengthens the bias.", "Only shortlisted people ever produce 'success' data."],
      ["No human check", "Errors are applied at scale before anyone notices.", "Thousands of applicants rejected by the same flaw."]
    ] } },
    { callout: { t: "def", h: "Discrimination (Equality Act 2010)", body: "Treating someone less favourably because of a **protected characteristic**: age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race, religion or belief, sex, sexual orientation. An algorithm can discriminate **indirectly** even if it never sees the characteristic." } },
    { h: "How UK GDPR applies to ADM in organisations" },
    { table: { head: ["Requirement", "What the organisation must do"], rows: [
      ["Significant decisions", "Extra rules apply to decisions made **solely by automated means** that have a **legal or similarly significant effect** (a job, a loan, a benefit)."],
      ["Transparency", "Tell people ADM is used, the logic involved in meaningful terms and the likely consequences (right to be informed)."],
      ["Safeguards", "Let the person **make representations** (give their view), obtain **human intervention** (a person reviews) and **contest** the decision."],
      ["Lawful basis", "A lawful basis is needed; special category data (health, ethnicity) is far more restricted."],
      ["DPIA", "A Data Protection Impact Assessment before high-risk ADM or profiling."],
      ["Principles", "Fairness and accuracy apply: biased or inaccurate outputs are a breach in themselves."]
    ] } },
    { callout: { t: "tip", h: "The 2025 change in one line", body: "The Data (Use and Access) Act 2025 relaxes **when** organisations may make significant solely automated decisions, but keeps the **safeguards** (information, representations, human review, challenge) and tighter limits on special category data. The exam wants the safeguards." } },
    { h: "Impacts of ADM on individuals" },
    { table: { head: ["Positive", "Negative"], rows: [
      ["Fast decisions — a loan or quote in seconds.", "Unfairly refused a job, loan or service because of bias."],
      ["Consistent: the same inputs get the same outcome.", "No explanation — they don't know why or how to improve."],
      ["Less exposure to one person's prejudice.", "Hard to challenge a 'computer says no'; stress and lost opportunities."],
      ["Personalised offers and prices.", "Profiling can feel intrusive; higher prices for some groups."],
      ["", "Mistakes repeat at scale — one error hits thousands."]
    ] } },

    { page: "Collection, storage, ownership and sharing" },
    { h: "Protecting the identity of individuals" },
    identityFig(),
    { kv: [
      ["Data minimisation", "Don't collect identifiers you don't need."],
      ["Pseudonymisation", "Replace names with codes; keep the key separately and secure. Still personal data."],
      ["Anonymisation", "Remove or generalise identifiers so a person can't reasonably be identified (age bands, area not address). No longer personal data."],
      ["Aggregation", "Publish totals and percentages, never single records; suppress very small counts."],
      ["Data masking", "Hide part of a value (**** **** **** 1234)."],
      ["Encryption", "In storage and in transit, so stolen data is unreadable."],
      ["Access control", "Role-based permissions; audit logs of who looked at what."],
      ["Secure sharing", "Data sharing agreements; share the minimum; trusted research environments where analysts work on data without taking it away."]
    ] },
    { callout: { t: "warn", h: "Re-identification", body: "Two 'anonymous' data sets can identify someone when combined — a date of birth, a postcode and a gender together single out most people. Test anonymised data before release." } },
    { h: "How data ownership is determined" },
    { table: { head: ["Factor", "How it decides who controls the data"], rows: [
      ["Who collected or created it", "The organisation that gathered and paid for it usually controls the data set."],
      ["Contracts and terms of service", "An app's terms say what users grant the company; a contract with a supplier says who owns the data produced."],
      ["Employment", "Data created at work for the employer normally belongs to the employer."],
      ["Intellectual property", "Copyright (creative content) and database right (a database with substantial investment) give legal ownership."],
      ["Licences", "Open data is shared under a licence (e.g. the Open Government Licence) that sets reuse rules."],
      ["Data protection law", "The person never loses their **rights** over personal data, whoever 'owns' the data set."],
      ["Where it is stored", "Data sovereignty: data is subject to the laws of the country it is held in."]
    ] } },
    { h: "How organisations respond to these issues" },
    { ul: [
      "**Collection**: clear privacy notices; collect only what is needed; real choices; consent management.",
      "**Storage**: encryption, access control, retention schedules, secure (often UK-based) cloud hosting.",
      "**Ownership**: clear terms of service and contracts; data stewards and governance boards; data dashboards letting people download or delete their data.",
      "**Sharing**: data sharing agreements; anonymise or aggregate first; DPIAs; transparency about who receives data; opt-outs (e.g. the NHS national data opt-out)."
    ] },

    { page: "Emerging ethical debates" },
    { table: { head: ["Debate", "Impact on individuals", "How organisations respond"], rows: [
      ["Generative AI trained on scraped data", "Personal posts and creative work used without knowledge or payment; AI may repeat personal details.", "Opt-outs from training, licensing deals, filtering personal data, transparency about sources."],
      ["Live facial recognition in public", "Tracked without consent; misidentification; 'chilling' of protest.", "Watch-lists only, signs, human checks of matches, deleting non-matches at once, independent testing."],
      ["Workplace monitoring", "Keystrokes, location, webcams — stress, loss of trust and privacy.", "Proportionate monitoring, telling staff, DPIAs, consultation."],
      ["Health data and private firms", "Fear of data being sold or used for profit; loss of trust in the NHS.", "Opt-outs, secure data environments, public engagement, publishing who uses data."],
      ["Children's data", "Profiling and addictive design aimed at children.", "Age-appropriate design: high privacy by default, no nudging, age checks."],
      ["Deepfakes and misinformation", "Reputations harmed; can't trust images or audio.", "Labelling AI content, detection tools, takedown processes."],
      ["Predictive analytics about people", "Judged on predicted behaviour rather than actions (policing, benefits).", "Algorithmic transparency records, bias audits, human decision-makers."]
    ] } },
    { callout: { t: "def", h: "Emerging ethical debate", body: "A new or growing disagreement about whether a **use of data is right**, usually because technology has moved faster than the law. Organisations respond by **going beyond the minimum legal duty**: transparency, consultation, ethics boards, impact assessments, pausing or limiting a use." } },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"If it's legal it's ethical.\" — Law sets a minimum; ethics asks whether it is **right** (scraping public posts may be legal and still unfair).",
      "\"An algorithm can't be biased — it's maths.\" — It learns from human data and human design choices.",
      "\"Removing the ethnicity column removes bias.\" — **Proxies** (postcode, name, school) can carry it back in.",
      "\"Pseudonymised data is anonymous.\" — With the key it can be linked back; it is still personal data.",
      "\"The person whose data it is owns it.\" — They keep **rights** over it; control of the data set is set by collection, contracts and IP.",
      "\"Human review means a person clicks 'approve'.\" — It must be **meaningful**: someone with the authority and information to change the decision."
    ] } },

    { page: "Frameworks for ethical data management" },
    { callout: { t: "def", h: "Data Ethics Framework", body: "UK government guidance (Central Digital and Data Office) for anyone working with data in the public sector — and a model for any organisation. It has **three overarching principles** applied at each of **five specific actions**." } },
    { table: { head: ["Overarching principle", "Meaning"], rows: [
      ["Transparency", "Your actions, processes and data are open to inspection; you publish what you do and why."],
      ["Accountability", "Effective governance and oversight; clear responsibility for decisions and outcomes."],
      ["Fairness", "Avoid unintended discriminatory effects on individuals and groups; respect dignity."]
    ] } },
    { steps: [
      { h: "1 · Define and understand public benefit and user need", m: "What is the project for, and who benefits?" },
      { h: "2 · Involve diverse expertise", m: "Bring in different skills and perspectives — including the people affected." },
      { h: "3 · Comply with the law", m: "UK GDPR, the Equality Act and any sector rules." },
      { h: "4 · Review the quality and limitations of the data", m: "Is it accurate, representative, biased, up to date?" },
      { h: "5 · Evaluate and consider wider policy implications", m: "Monitor outcomes; think about long-term and unintended effects." }
    ] },
    { callout: { t: "def", h: "Inclusive data principles", body: "From the UK's **Inclusive Data Taskforce** (2021): data should let **everyone count and be counted**, so no group is invisible in the evidence that shapes decisions. Wording varies between sources; the themes are below." } },
    { table: { head: ["Principle (theme)", "What it means in practice"], rows: [
      ["**All population groups included**", "Every group is captured — no one left out of the data (the SAM's main answer)."],
      ["Trust and trustworthiness", "People feel safe to share data about themselves; their data is protected."],
      ["Whole-system, shared responsibility", "Everyone who collects and uses data works to make it inclusive."],
      ["Enough detail (granular data)", "Data can be broken down by group, and groups combined (e.g. age and ethnicity)."],
      ["Inclusive collection methods", "Reach groups often missed: other languages, offline options, accessible formats."],
      ["Consistent standards", "Harmonised definitions so data sets can be compared."],
      ["**Transparent**", "How data is collected, selected and used is open and explainable."],
      ["**Up to date** and reviewed", "Data is kept current and inclusivity is checked again over time."]
    ] } },
    { callout: { t: "tip", h: "The SAM's safe answers", body: "For \"State two inclusive data principles\" the SAM credited: **all population groups must be included**; **the data must be up to date**; **the data must be transparent**. Use these three, then explain each in the scenario." } },
    { worked: { tag: "example", title: "Using the framework on a real project", q: "A council plans to use an algorithm to decide which households get home-insulation grants. How would the Data Ethics Framework shape the project?",
      steps: [
        { m: "**Public benefit**: lower bills and emissions for households in fuel poverty — the goal is written down." },
        { m: "**Diverse expertise**: housing officers, data scientists, residents' groups and a disability charity are involved." },
        { m: "**Law**: a DPIA; residents told an algorithm helps decide; a human reviews refusals." },
        { m: "**Data quality**: check older properties and renters are represented, not just owners who filled in surveys." },
        { m: "**Wider implications**: publish how it works (transparency), name who is responsible (accountability), monitor outcomes by group (fairness)." }
      ], result: "Five actions, each judged by transparency, accountability and fairness" } },

    { page: "In exam questions" },
    { callout: { t: "info", h: "Scenario used on this page", body: "**Brightpath Recruitment** fills office jobs for UK employers. It receives 40,000 CVs a year and wants an algorithm trained on its past placements to shortlist candidates automatically. It also shares candidate data with employers and with a university research team." } },
    { worked: { tag: "exam", title: "ADM and the risk of bias", src: "OCR-style · Explain · 2 marks",
      q: "Explain how automated decision making could increase the risk of bias when Brightpath shortlists candidates.",
      steps: [
        { m: "The algorithm is trained on Brightpath's past placements, which may contain bias (e.g. mostly men placed in IT roles) (1)…", mk: "1", n: "Modelled on SAM Q7(a). 1 mark for the cause." },
        { m: "…so the algorithm learns that pattern and ranks similar candidates higher, rejecting others unfairly (1).", mk: "1", n: "1 mark for the implication. Maximum one explanation. Also accept: too little data on some groups (1) so it hasn't learned their patterns (1); the designer's unconscious bias (1) is built into the algorithm (1). Generic answers accepted (PO1)." }
      ], result: "Cause of bias (1) + how it leads to unfair decisions (1)" } },
    { worked: { tag: "exam", title: "UK GDPR and automated shortlisting", src: "OCR-style · Explain · 4 marks",
      q: "Explain two ways UK GDPR affects Brightpath's use of automated decision making to reject candidates.",
      steps: [
        { m: "Brightpath must tell candidates that automated decision making is used (1)…", mk: "1" },
        { m: "…and give meaningful information about how the decision is made, e.g. in its privacy notice before they apply (1).", mk: "1" },
        { m: "Candidates must be able to ask for a human to review the decision / contest it (1)…", mk: "1" },
        { m: "…so Brightpath needs a recruiter who can look at a rejected CV and overturn the decision (1).", mk: "1", n: "Also accept: carry out a DPIA (1) because it is high-risk profiling (1); decisions must be fair and accurate (1) so it must test for bias (1)." }
      ], result: "Requirement (1) + what Brightpath must do (1), twice" } },
    { worked: { tag: "exam", title: "Protecting identity when sharing", src: "OCR-style · Explain · 4 marks",
      q: "Brightpath will share candidate data with a university studying recruitment. Explain two ways Brightpath could protect candidates' identities.",
      steps: [
        { m: "Anonymise the data — remove names, emails and addresses and use age bands and regions (1)…", mk: "1" },
        { m: "…so the researchers can study patterns without being able to identify any candidate (1).", mk: "1" },
        { m: "Encrypt the data / send it through a secure transfer with access limited to named researchers (1)…", mk: "1" },
        { m: "…so if it is intercepted or leaked it cannot be read (1).", mk: "1", n: "Also accept pseudonymisation (key kept by Brightpath), aggregation, a data sharing agreement, sharing only the fields needed (minimisation)." }
      ], result: "Method (1) + how it protects candidates (1), twice" } },
    { worked: { tag: "exam", title: "Inclusive data principles", src: "OCR-style · State · 2 marks",
      q: "Brightpath will survey some candidates about their experience, selected from its database. State two inclusive data principles Brightpath should consider when selecting candidates.",
      steps: [
        { m: "Any two from: all population groups must be included (1); the data must be up to date (1)…", mk: "1", n: "Modelled on SAM Q7(b)(i)." },
        { m: "…the data / selection process must be transparent (1).", mk: "1", n: "Credit any other appropriate response." }
      ], result: "Any two (1 + 1)" } },
    { worked: { tag: "exam", title: "Why each principle matters", src: "OCR-style · Explain · 4 marks",
      q: "Explain why each principle you gave would need to be considered by Brightpath.",
      steps: [
        { m: "All groups included: so the survey reaches candidates of every age, background and disability (1)…", mk: "1", n: "Modelled on SAM Q7(b)(ii). Each explanation must match a principle given in the part before; 0 there → 0 here." },
        { m: "…otherwise the views gathered are biased and Brightpath may not notice its process disadvantages a group (1).", mk: "1" },
        { m: "Up to date: the database must be cleaned so it only contains current candidates (1)…", mk: "1" },
        { m: "…so the survey isn't sent to people who withdrew or whose details are wrong (1).", mk: "1", n: "Transparent: the selection method is fair and can be shown to anyone who asks (1) so candidates trust the results (1)." }
      ], result: "Reason (1) + application to Brightpath (1), for each principle" } },
    lor9("automated decision making"),
    { worked: { tag: "exam", title: "Should Brightpath automate shortlisting?", src: "OCR-style · Discuss · 9 marks",
      q: "Discuss whether Brightpath should use automated decision making to shortlist candidates.\n\nYou should consider:\n- the benefits to Brightpath and to candidates\n- the risks and limitations\n- whether you would recommend it.",
      steps: [
        { m: "Benefit: 40,000 CVs a year can be screened in minutes, freeing recruiters to interview and filling roles faster.", mk: "1", n: "Benefit in context — L2/L3." },
        { m: "Benefit: the same criteria are applied to every CV, reducing one recruiter's personal prejudice or tiredness.", mk: "1", n: "L2/L3." },
        { m: "Benefit: candidates get quicker answers.", mk: "1", n: "Impact on individuals — L2." },
        { m: "Risk: trained on past placements, the algorithm can copy historical bias and discriminate against protected groups (Equality Act), even through proxies like postcode or career gaps.", mk: "1", n: "Cause + effect — L3." },
        { m: "Risk: UK GDPR safeguards — Brightpath must tell candidates, let them give their view and get a human review, so it still needs staff and processes.", mk: "1", n: "Applies 4.1/4.2 law — L3." },
        { m: "Risk: reputational damage and legal claims if bias is found; a 'black-box' model is hard to explain to a rejected candidate.", mk: "1", n: "L2/L3." },
        { m: "Ethics: Data Ethics Framework — is it fair, transparent, accountable? Inclusive data — are all groups in the training data?", mk: "1", n: "Uses the frameworks — L3." },
        { m: "Recommendation: use it to sort and prioritise, not to reject — a recruiter makes every rejection…", mk: "1", n: "A conclusion is needed for Level 3." },
        { m: "…with regular bias audits by group, a DPIA and clear information to candidates; switch off if outcomes differ between groups.", mk: "1", n: "Justified, conditional judgement — top of Level 3. Credit a justified 'no'." }
      ], result: "Level 3: benefits and risks for Brightpath and candidates, law and ethics applied, a justified recommendation" } },

    { page: "Exam toolkit" },
    { callout: { t: "tip", h: "How OCR marks it", body: [
      "**Explain how ADM increases bias (2)**: the CAUSE (biased/unrepresentative training data, developer bias) (1) + the IMPLICATION (the algorithm learns it, so decisions are unfair) (1). Generic answers are accepted.",
      "**Inclusive data principles**: say 'all population groups included', 'up to date', 'transparent'. Part (ii) must explain the SAME principles — and scores 0 if part (i) did.",
      "**UK GDPR and ADM**: be told · give your view · human review · contest. Not 'ADM is banned'.",
      "**Ownership**: name how it is decided (collection, contracts/terms, employment, IP) — not 'the person owns it'.",
      "Always tie ethics to **the individual**: what happens to the candidate, the customer, the patient."
    ] } },
    { callout: { t: "mnemonic", h: "Mnemonics", body: [
      "**Where bias comes from — \"HUPDF\" (\"Hidden Unfairness Pops up During Feedback\")**: Historical data, Unrepresentative data, Proxies, Designer bias, Feedback loops.",
      "**ADM safeguards — \"TRHC\" (\"Tell, Respond, Human, Challenge\")**: told it's used, make representations, human intervention, contest.",
      "**Data Ethics Framework — \"TAF\"**: Transparency, Accountability, Fairness (\"Take A Fair view\")."
    ] } },
    { callout: { t: "tip", h: "Synoptic links", body: [
      "**F201 4.1** — UK GDPR's principles (fairness, accuracy), rights (automated decisions) and DPIAs underpin this leaf.",
      "**F201 3.1** — decision trees, random forests and k-means are what make automated decisions; training data quality drives bias.",
      "**F201 1.1** — Veracity: biased or out-of-date data is poor-quality data.",
      "**F201 5.2** — smart cities, personalised healthcare and smart homes raise the same privacy and ownership debates.",
      "**F200** — legal and ethical considerations; **F206** — profiling and personalised marketing; **F204** — IoE devices collecting data continuously."
    ] } }
  ],
  flashcards: [
    ["What is automated decision making (ADM)?", "A decision about a person made by an algorithm or AI with no meaningful human involvement, often using profiling.", 0],
    ["What rights does UK GDPR give over significant automated decisions?", "To be told, to give their view, to have a human review the decision, and to contest it.", 1],
    ["What is algorithmic bias and what causes it?", "Systematically unfair outcomes from an algorithm — caused by biased or unrepresentative training data, proxies, designer choices and feedback loops.", 2],
    ["Name two emerging ethical debates around data.", "Generative AI trained on scraped data; live facial recognition; workplace monitoring; health data and private firms; children's data; deepfakes.", 5],
    ["List the five actions of the Data Ethics Framework.", "Define public benefit and user need; involve diverse expertise; comply with the law; review data quality and limitations; evaluate wider policy implications.", 100],
    ["What is a proxy variable in automated decision making?", "A neutral-looking feature (e.g. postcode) that stands in for a protected one (e.g. ethnicity), letting bias back in.", 102],
    ["Why is pseudonymised data still personal data?", "It can be linked back to the person using the separately kept key.", 103],
    ["How is anonymised data different from pseudonymised data?", "Anonymised data can't reasonably identify anyone, so it isn't personal data; pseudonymised data can be re-linked.", 104],
    ["Why can 'anonymised' data still be a privacy risk?", "Combining it with other data sets can re-identify people (e.g. postcode + date of birth + gender).", 4],
    ["List four factors that determine who owns a data set.", "Who collected or created it, contracts and terms of service, employment, intellectual property rights (and licences).", 105],
    ["Give two impacts of automated decision making on individuals.", "Unfair refusal through bias; no explanation; hard to challenge; but faster and more consistent decisions.", 106],
    ["How do organisations respond to concerns about data sharing?", "Data sharing agreements, anonymising or aggregating first, DPIAs, transparency about recipients, opt-outs.", 8],
    ["How does a feedback loop strengthen bias in ADM?", "The model's decisions create the next training data (only shortlisted people produce outcomes), so retraining repeats the bias.", 107],
    ["What is the legal versus ethical distinction?", "Legal = what the law requires (a minimum); ethical = what is right, which can go further.", 9],
    ["Name the nine protected characteristics in the Equality Act 2010.", "Age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race, religion or belief, sex, sexual orientation.", 108]
  ],
  quiz: [
    { q: "An algorithm trained on past hires prefers men. The most likely cause is:", opts: ["Biased training data", "Too much encryption", "A slow network link", "Anonymised records"], ans: 0, why: "It learned the pattern in historical decisions." },
    { q: "Under UK GDPR, a person refused a loan by a solely automated decision can:", opts: ["Demand the bank closes", "Ask for a human review", "Delete the bank's model", "Claim a fixed payout"], ans: 1, why: "Safeguards: be told, give their view, human intervention, contest." },
    { q: "Which keeps data personal data under UK GDPR?", opts: ["Aggregation into totals", "Full anonymisation", "Pseudonymisation", "Deleting the records"], ans: 2, why: "A pseudonym can be linked back with the key." },
    { q: "Which is a Data Ethics Framework overarching principle?", opts: ["Profitability", "Portability", "Minimisation", "Accountability"], ans: 3, why: "Transparency, accountability, fairness." },
    { q: "Which is an inclusive data principle the SAM credits?", opts: ["All groups are included", "Data is sold to partners", "Data is kept forever", "Only online users count"], ans: 0, why: "All population groups included; up to date; transparent." },
    { q: "A postcode letting ethnicity bias into a model is an example of:", opts: ["Encryption", "A proxy variable", "Data portability", "Aggregation"], ans: 1, why: "A neutral feature standing in for a protected characteristic." },
    { q: "Which does NOT help decide who owns a data set?", opts: ["Terms of service", "Who collected it", "The file's colour", "Database right"], ans: 2, why: "Collection, contracts/terms, employment and IP rights decide it." },
    { q: "Live facial recognition in public places is an example of:", opts: ["A data ethics framework", "A lawful basis", "A storage method", "An emerging ethical debate"], ans: 3, why: "A growing debate about privacy, consent and accuracy." },
    { q: "Which response best protects identities when sharing data for research?", opts: ["Share raw records by email", "Anonymise and aggregate first", "Add the candidates' names", "Publish it on a website"], ans: 1, why: "Removing or generalising identifiers protects people while keeping patterns." }
  ]
};

/* =====================================================================
   F201.5.1  Environment
   ===================================================================== */
function ensembleFig() {
  var cs = [-1.1, -0.7, -0.35, 0, 0.3, 0.6, 0.9], it = [];
  cs.forEach(function (c, i) { it.push({ fn: "12 + 0.6*sin(x) + " + c + "*x^2/10", from: 0, to: 10, c: i === 3 ? "it" : "muted", w: i === 3 ? 2.4 : 1.2 }); });
  it.push({ text: [1.8, 19], t: "days 1–3: runs agree", c: "good", b: true, size: 11 });
  it.push({ text: [1.8, 17], t: "high confidence", c: "good", size: 10.5 });
  it.push({ text: [7.6, 21], t: "days 8–10: runs spread", c: "danger", b: true, size: 11 });
  it.push({ text: [7.6, 1.5], t: "low confidence", c: "danger", size: 10.5 });
  it.push({ vline: 3 });
  return { fig: { x: [0, 10], y: [0, 22], w: 560, h: 300, axes: { x: "days ahead", y: "°C", xt: [0, 2, 4, 6, 8, 10], yt: [0, 5, 10, 15, 20] }, items: it,
    cap: "An ensemble forecast: the same model is run many times from slightly different starting data. Where the runs agree the forecast is reliable; as they spread, confidence falls. Big data (more observations) narrows the start; the atmosphere's chaos still limits how far ahead any forecast can go." } };
}
function floodFig() {
  var it = [];
  it.push(txt(70, 12, "Data sources", { b: true, c: "text", size: 11 }));
  ["River level gauges", "Rain radar + satellites", "Weather forecasts", "Social media + 999 calls"].forEach(function (s, i) {
    it = it.concat(box(8, 22 + i * 40, 150, 32, s, { c: "accent", size: 10.5 }));
    it = it.concat(arrow(158, 38 + i * 40, 205, 96, null, { c: "muted", w: 1.2 }));
  });
  it = it.concat(box(205, 66, 160, 60, ["Flood model", "combines live data", "with past floods + maps"], { c: "it", size: 11 }));
  it = it.concat(arrow(365, 96, 410, 96));
  it.push(txt(520, 12, "Actions", { b: true, c: "text", size: 11 }));
  ["Warnings to phones", "Barriers + pumps out", "Evacuate high-risk streets", "Send crews where needed"].forEach(function (s, i) {
    it = it.concat(box(410, 22 + i * 40, 220, 32, s, { c: "good", size: 10.5 }));
  });
  return { fig: { w: 640, h: 186, items: it, cap: "Big data in natural disaster management: many live sources feed a model that turns readings into early warnings and decisions on where to send people and equipment." } };
}
function energyFig() {
  var it = [];
  it.push({ poly: [[0, 20], [6, 20], [6, 80], [21, 80], [21, 20], [24, 20]], close: false, c: "danger", w: 2, dash: "5 4" });
  it.push({ fn: "15 + 75*exp(0-((x-13)^2)/14)", from: 0, to: 24, c: "good", w: 2.4 });
  it.push({ text: [3, 88], t: "fixed timer: full heat 6:00–21:00", c: "danger", b: true, size: 10.5, pos: "e" });
  it.push({ text: [13.4, 96], t: "data-led: heat follows occupancy", c: "good", b: true, size: 10.5 });
  it.push({ text: [7.6, 50], t: "wasted", c: "danger", size: 10.5 });
  it.push({ text: [19.6, 50], t: "wasted", c: "danger", size: 10.5 });
  return { fig: { x: [0, 24], y: [0, 100], w: 560, h: 280, axes: { x: "hour of day", y: "heating %", xt: [0, 6, 12, 18, 24], yt: [0, 25, 50, 75, 100] }, items: it,
    cap: "Energy efficiency from data: occupancy sensors and smart meters show when a building is actually used. Heating and lighting that follow that pattern cut the energy wasted in the early morning and evening. (Illustrative shape, not measured data.)" } };
}

C["it:F201.5.1"] = {
  notes: [
    { h: "Environment — the whole topic on one page" },
    { h: "What the specification asks (F201 5.1)" },
    { kv: [
      [
        "Teaching content",
        "Accuracy of weather forecasting · natural disaster management · energy efficiency · environmental management · platforms to combat climate change · emerging environmental developments affected by big data."
      ],
      [
        "To include",
        "**How** big data can be used in each area of environmental work, and the **benefits and limitations** of big data use in each."
      ],
      [
        "How to learn it",
        "For each of the six areas: the data sources → what is done with them → a benefit → a limitation."
      ]
    ] },
    { ol: ["Weather forecasting", "Natural disaster management", "Energy efficiency", "Environmental management", "Platforms to combat climate change", "Emerging developments", "In exam questions", "Exam toolkit"] },
    { table: { head: ["Area", "Big data used for", "A limitation to quote"], rows: [
      ["Weather forecasting", "More observations + supercomputer models → more accurate, longer forecasts.", "Chaos: accuracy still falls off after about a week or two."],
      ["Natural disasters", "Early warnings, evacuation, targeting rescue and aid.", "False alarms; networks fail in the disaster itself."],
      ["Energy efficiency", "Smart meters and sensors match energy to real use.", "Upfront cost; patterns change; sensors fail."],
      ["Environmental management", "Monitoring air, water, wildlife, forests, waste.", "Sensor gaps and cost; data must be verified."],
      ["Climate platforms", "Shared data on emissions and climate to act on.", "Inconsistent or self-reported data; data centres use energy."],
      ["Emerging developments", "Digital twins, smart grids, precision farming, satellite methane detection.", "Expensive, new, and big data's own carbon footprint."]
    ] } },

    { page: "Weather forecasting" },
    { callout: { t: "def", h: "Big data in weather forecasting", body: "Forecasters feed **huge volumes of observations** — collected every few minutes worldwide — into **numerical weather prediction** models run on supercomputers, and increasingly into **machine-learning** models, to predict the atmosphere's future state." } },
    { kv: [
      ["Data sources", "Weather stations, satellites, rain radar, ocean buoys, weather balloons, aircraft and ship reports, even phones and cars."],
      ["Velocity and Volume", "Millions of readings an hour, processed fast enough to issue forecasts several times a day."],
      ["Ensembles", "The model is run many times with slightly different starts; the spread shows how certain the forecast is."],
      ["AI models", "Machine-learning models trained on decades of past weather (e.g. Google DeepMind's GraphCast) produce forecasts far faster than traditional models."],
      ["Who uses it", "Farmers (planting, harvest), airlines and shipping (routes), energy firms (wind and solar output, demand), councils (gritting roads), emergency services."]
    ] },
    ensembleFig(),
    { table: { head: ["Benefits", "Limitations"], rows: [
      ["More accurate and more local forecasts.", "The atmosphere is **chaotic** — day-to-day detail is unreliable beyond about two weeks however much data there is."],
      ["Earlier, more confident warnings of storms, heat and snow.", "Supercomputers and storage are very **expensive** and energy-hungry."],
      ["Better planning: renewable output, gritting, crop protection.", "**Data gaps** over oceans and in poorer regions reduce accuracy there."],
      ["Probabilities (70% chance of rain) let people judge risk.", "Local effects (a valley, a coast) can still be missed; people misread probabilities."]
    ] } },

    { page: "Natural disaster management" },
    { callout: { t: "def", h: "Big data in natural disaster management", body: "Using live and historical data to **predict, prepare for, respond to and recover from** floods, storms, wildfires, earthquakes and heatwaves — getting warnings out sooner and people and equipment to the right place." } },
    floodFig(),
    { table: { head: ["Stage", "How big data is used"], rows: [
      ["Predict / warn", "River gauges, rainfall and forecasts trigger flood alerts (e.g. the Environment Agency's flood warnings); seismic sensors give seconds of warning of shaking."],
      ["Prepare", "Maps of past events and who lives where (elderly, care homes) plan evacuations and stockpiles."],
      ["Respond", "Mobile-phone location data shows where people are; social media and drone/satellite images show damage; resources are sent where needed."],
      ["Recover", "Satellite images compare before and after; insurers and councils target help."]
    ] } },
    { table: { head: ["Benefits", "Limitations"], rows: [
      ["**Earlier warnings** → time to evacuate, so fewer injuries and deaths.", "**False alarms** cause 'warning fatigue' — people ignore the next one."],
      ["Resources (crews, sandbags, pumps) go where they're needed.", "Phone networks and power often **fail** in the disaster itself."],
      ["A shared live picture coordinates councils, police, fire and NHS.", "Social media posts can be **unverified or false** (Veracity)."],
      ["Damage is assessed quickly, speeding up aid.", "Location data raises **privacy** questions; people without phones are missed."],
      ["Past data shows which areas to protect first.", "Some disasters (earthquakes) still **can't be predicted**, only warned of seconds ahead."]
    ] } },

    { page: "Energy efficiency" },
    { callout: { t: "def", h: "Big data for energy efficiency", body: "Collecting detailed data on **when, where and how energy is used** — from smart meters and sensors — and analysing it so energy is used only when and where it is needed, cutting cost and emissions." } },
    { kv: [
      ["Smart meters", "Half-hourly readings show patterns of use and waste."],
      ["Building management systems", "IoT sensors for occupancy, temperature, light and CO₂ control heating, cooling and lighting automatically."],
      ["Predictive maintenance", "Data from boilers, motors and air-conditioning predicts faults before they waste energy."],
      ["Smart grids", "Forecast demand and renewable supply; shift flexible use (EV charging, storage heating) to times of cheap, green power."],
      ["Benchmarking", "Compare sites or buildings to find the worst performers."]
    ] },
    energyFig(),
    { table: { head: ["Benefits", "Limitations"], rows: [
      ["Trends show when and where energy is used, so it can be managed in those areas and times.", "Patterns from 'normal' times can change (e.g. working from home) — the model then wastes energy."],
      ["Smart controls switch equipment on and off automatically.", "If a device malfunctions, the system's instructions aren't carried out and the fault may be hard to find."],
      ["Lower bills and carbon emissions.", "**Upfront cost** of sensors, meters, insulation and software."],
      ["Shows where green energy (solar panels, heat pumps) would pay back.", "Occupancy data can feel like **staff monitoring**."],
      ["Predictive maintenance avoids breakdowns.", "Data centres processing the data use energy too."]
    ] } },
    { worked: { tag: "example", title: "Where does the saving come from?", q: "A council office's heating ran on a fixed timer from 06:00 to 21:00. Sensors show the building is almost empty before 08:00 and after 18:00. What does the data let the council do?",
      steps: [
        { m: "**Pattern**: occupancy data shows the real busy hours.", n: "Value from Volume: a reading every few minutes for months." },
        { m: "**Action**: heat and light follow occupancy — warm up just before 08:00, wind down after 18:00, zones heated only when used." },
        { m: "**Benefit**: several hours a day of heating an empty building are removed — lower bills and emissions." },
        { m: "**Watch**: if hybrid working changes the pattern, retrain the schedule or it wastes energy again." }
      ], result: "Use data → match energy to real use → monitor for change" } },

    { page: "Environmental management" },
    { callout: { t: "def", h: "Big data in environmental management", body: "Monitoring and protecting the natural environment — **air, water, land, wildlife, waste** — using continuous data from sensors, satellites and the public, so problems are found and acted on early." } },
    { table: { head: ["Use", "Data", "Example action"], rows: [
      ["Air quality", "Networks of pollution sensors; traffic data.", "Clean Air Zones; alerts on high-pollution days."],
      ["Water quality", "River sensors, sewage-overflow monitors.", "Find and fix pollution sources; warn swimmers."],
      ["Deforestation and land use", "Satellite images analysed by AI (e.g. Global Forest Watch).", "Spot illegal logging within days."],
      ["Wildlife", "GPS collars, camera traps and sound recorders read by AI.", "Track endangered species and protect habitats."],
      ["Waste", "Fill-level sensors in bins; collection-route data.", "Empty bins only when full; fewer lorry miles."],
      ["Agriculture", "Soil sensors, drones, satellite crop images.", "Precision farming: less water, fertiliser and pesticide."]
    ] } },
    { table: { head: ["Benefits", "Limitations"], rows: [
      ["Continuous, wide coverage — problems spotted early.", "Sensors are costly to install and maintain; coverage has gaps."],
      ["Evidence for action and enforcement against polluters.", "Low-cost sensors can be **inaccurate** — data needs checking."],
      ["Targets money and staff where problems are worst.", "Huge data volumes need skilled analysts and storage."],
      ["Public can see the data (open data) and hold bodies to account.", "Data alone changes nothing without funding and political will."]
    ] } },

    { page: "Platforms to combat climate change" },
    { callout: { t: "def", h: "Platform to combat climate change", body: "An online system that **collects, combines and shares climate and emissions data** — often openly — so governments, businesses, researchers and the public can measure the problem, model solutions and track progress." } },
    { table: { head: ["Kind of platform", "What it does", "Real example"], rows: [
      ["Earth observation", "Satellite data on temperature, ice, sea level, land use.", "Copernicus (EU), including its Climate Change Service."],
      ["Emissions tracking", "Estimates emissions from satellites, sensors and AI, not just self-reporting.", "Climate TRACE."],
      ["Forest and land monitoring", "Near-real-time alerts on tree loss.", "Global Forest Watch."],
      ["Climate projections", "Models of future climate for planning.", "UK Climate Projections (UKCP), Met Office."],
      ["Carbon accounting", "Organisations measure and report their own carbon footprint.", "Software used for net-zero reporting."]
    ] } },
    { table: { head: ["Benefits", "Limitations"], rows: [
      ["One shared, open evidence base — countries and firms can collaborate.", "Data from different countries is **inconsistent** in quality and method."],
      ["Independent measurement makes polluters accountable.", "Self-reported figures can be **inaccurate** or 'greenwashed'."],
      ["Models test policies (e.g. a new flood defence) before money is spent.", "Platforms cost a lot to run; poorer countries contribute less data."],
      ["Public awareness and pressure for action.", "Storing and processing it uses energy — data centres have a carbon cost."]
    ] } },

    { page: "Emerging developments" },
    { table: { head: ["Development", "How big data drives it", "Benefit", "Limitation"], rows: [
      ["Digital twins", "A live virtual copy of a city, coastline or the whole Earth (e.g. the EU's Destination Earth) fed by sensors.", "Test 'what if' scenarios safely.", "Very expensive; only as good as its data."],
      ["Smart grids and EV charging", "Forecast supply and demand minute by minute.", "More renewables used; less waste.", "Cyber-security risk; needs smart meters everywhere."],
      ["AI weather and climate models", "Train on decades of observations.", "Faster, cheaper forecasts.", "Can miss events rarer than its training data."],
      ["Satellite methane detection", "Spot leaks from space.", "Find and fix big emitters fast.", "Cloud cover; needs follow-up on the ground."],
      ["Precision agriculture", "Field-by-field sensor and satellite data.", "Less fertiliser and water.", "Costly for small farms."],
      ["Big data's own footprint", "Data centres need electricity and cooling water.", "Pressure for renewable-powered, efficient centres.", "Growth of AI raises energy demand."]
    ] } },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"With enough data, weather can be forecast perfectly.\" — Chaos limits it; more data narrows the error, it never removes it.",
      "\"Big data is automatically green.\" — It has a carbon cost: data centres, devices and networks use energy.",
      "\"Big data prevents disasters.\" — It can't stop a flood or earthquake; it reduces the **harm** through warning and response.",
      "\"Sensors are always right.\" — Cheap sensors drift and fail; Veracity must be checked.",
      "\"Energy efficiency means using renewable energy.\" — Efficiency is using **less** energy for the same job; renewables are a different source."
    ] } },

    { page: "In exam questions" },
    { callout: { t: "info", h: "Scenario used on this page", body: "**Eastwold District Council** covers a market town on a river that floods, villages and farmland. It runs offices and a leisure centre with a pool and wants to cut its energy use, manage flood risk and monitor air quality." } },
    { worked: { tag: "exam", title: "Energy efficiency at the leisure centre", src: "OCR-style · Explain · 4 marks",
      q: "The council wants its leisure centre to be as energy efficient as possible. Explain one benefit and one limitation to the council of using big data to increase the energy efficiency of the leisure centre.",
      steps: [
        { m: "Benefit: data from smart meters and occupancy sensors shows when and where the centre is busy (1)…", mk: "1", n: "Modelled on SAM Q8. 1 mark for identifying, 1 for the effect on the council." },
        { m: "…so heating, lighting and pool pumps can be reduced at quiet times, cutting the council's energy bills (1).", mk: "1" },
        { m: "Limitation: sensors, meters and control software are expensive to install (1)…", mk: "1" },
        { m: "…so it may take years before the savings repay the council's upfront cost (1).", mk: "1", n: "Also accept: patterns change (e.g. a new timetable) (1) so the system wastes energy until updated (1); a faulty device ignores instructions (1) and the fault is hard to find (1). Answers must focus on the council's leisure centre." }
      ], result: "Benefit (1) + effect (1); limitation (1) + effect (1)" } },
    { worked: { tag: "exam", title: "More accurate weather forecasts", src: "OCR-style · Explain · 2 marks",
      q: "The council grits roads when frost is forecast. Explain how big data has made weather forecasts more accurate.",
      steps: [
        { m: "Huge volumes of observations from satellites, weather stations, radar and buoys are fed into forecasting models (1)…", mk: "1" },
        { m: "…so the model starts from a more accurate picture and can be run many times (an ensemble), giving more reliable, local predictions of frost (1).", mk: "1", n: "Also accept: machine learning finds patterns in decades of past weather (1) to predict conditions (1). Credit any other appropriate response." }
      ], result: "More / better data (1) + why that improves the prediction (1)" } },
    { worked: { tag: "exam", title: "Data for flood warnings", src: "OCR-style · Identify · 2 marks",
      q: "Identify two sources of data the council could use to warn residents about flooding.",
      steps: [
        { m: "Any two from: river level gauges/sensors (1); rainfall radar or rain gauges (1); weather forecasts (1)…", mk: "1" },
        { m: "…satellite or drone images (1); social media reports from residents (1); historic flood maps (1).", mk: "1", n: "Mark only the first two answers." }
      ], result: "Any two sources (1 + 1)" } },
    { worked: { tag: "exam", title: "A limitation in a disaster", src: "OCR-style · Explain · 2 marks",
      q: "Explain one limitation of relying on big data to manage a flood in Eastwold.",
      steps: [
        { m: "Mobile networks and power may fail during the flood (1)…", mk: "1" },
        { m: "…so live data stops arriving and warnings may not reach residents when they are needed most (1).", mk: "1", n: "Also accept: false alarms (1) so residents ignore later warnings (1); unverified social media (1) sends crews to the wrong place (1); residents without smartphones (1) don't get alerts (1)." }
      ], result: "Limitation (1) + consequence in Eastwold (1)" } },
    { worked: { tag: "exam", title: "Using a climate platform", src: "OCR-style · Explain · 2 marks",
      q: "The council has declared a climate emergency. Explain how a platform to combat climate change could help the council.",
      steps: [
        { m: "A platform such as UK Climate Projections provides data on future rainfall and temperature for the area (1)…", mk: "1" },
        { m: "…so the council can plan flood defences and building standards for the climate it will face, and track its own emissions against its target (1).", mk: "1", n: "Credit any appropriate platform and use, e.g. emissions tracking, satellite land-use monitoring." }
      ], result: "What the platform provides (1) + how the council uses it (1)" } },
    lor6("benefits and limitations"),
    { worked: { tag: "exam", title: "Big data for flood risk", src: "OCR-style · Analyse · 6 marks",
      q: "Analyse the benefits and limitations to Eastwold District Council of using big data to manage flood risk.",
      steps: [
        { m: "Benefit: live river-gauge and rainfall data feed a flood model, giving earlier warnings so residents can move belongings and evacuate in time.", mk: "1", n: "Benefit + consequence — L2/L3." },
        { m: "Benefit: maps of past floods and population data show which streets and care homes to protect first, so sandbags and crews are targeted.", mk: "1", n: "L3." },
        { m: "Benefit: a shared live picture lets the council, Environment Agency and emergency services coordinate.", mk: "1", n: "L2/L3." },
        { m: "Limitation: sensors, models and analysts are costly for a district council's budget.", mk: "1", n: "L2." },
        { m: "Limitation: false alarms cause warning fatigue — residents may ignore the warning that matters.", mk: "1", n: "L3 with the consequence." },
        { m: "Limitation: data can fail when most needed (networks down) or be unreliable (unverified social media), so decisions may be based on poor data.", mk: "1", n: "Veracity — L3." }
      ], result: "Level 3: a range of benefits and limitations, each explained and applied to Eastwold's flooding, using correct terms" } },

    { page: "Exam toolkit" },
    { callout: { t: "tip", h: "How OCR marks it", body: [
      "**Explain one benefit and one limitation (4)**: identify (1) + how it affects THE ORGANISATION in the scenario (1), for each. Generic answers lose the second mark.",
      "Name **specific data**: smart meters, occupancy sensors, river gauges, satellites — not just 'data'.",
      "Limitation favourites from the SAM: patterns change from 'normal' days; devices malfunction and the fault is hard to find; extra equipment adds initial cost.",
      "Don't claim big data **prevents** disasters or makes forecasts **perfect** — it improves warnings and accuracy.",
      "Energy efficiency ≠ renewable energy: say how data **reduces waste**."
    ] } },
    { callout: { t: "mnemonic", h: "Mnemonic — the six areas: \"We Never Eat Eggs Past Easter\"", body: [
      "**W**eather forecasting · **N**atural disasters · **E**nergy efficiency · **E**nvironmental management · **P**latforms for climate · **E**merging developments.",
      "For each: **S-U-B-L** — Sources, Use, Benefit, Limitation."
    ] } },
    { callout: { t: "tip", h: "Synoptic links", body: [
      "**F201 1.1** — Volume and Velocity of sensor data; Veracity of cheap sensors and social media.",
      "**F201 1.2** — capture methods: sensors, IoT, satellites, smart meters.",
      "**F201 2.6** — time series analysis (seasonality in energy use, river levels); Monte Carlo and ensemble thinking.",
      "**F201 3.1** — AI weather models; machine learning on satellite images.",
      "**F201 5.2** — smart cities share the same sensors (air quality, smart grids).",
      "**F204** — Data and the Internet of Everything: the connected devices behind all of this; **F205** — visualising environmental data on dashboards and maps."
    ] } }
  ],
  flashcards: [
    ["List the six environmental areas big data affects.", "Weather forecasting accuracy, natural disaster management, energy efficiency, environmental management, platforms to combat climate change, emerging developments.", 0],
    ["How does big data improve weather forecasting?", "More observations from satellites, stations, radar and buoys feed supercomputer and AI models; ensembles show confidence — more accurate, local forecasts.", 1],
    ["How is big data used in natural disaster management?", "Live sensor, satellite, phone and social media data give early warnings, plan evacuations and target rescue and aid.", 2],
    ["How do smart grids improve energy efficiency?", "They forecast demand and renewable supply and shift flexible use to when power is plentiful, reducing waste.", 3],
    ["How does big data support environmental management?", "Sensors and satellites monitor air, water, forests, wildlife and waste continuously, so problems are found and acted on early.", 4],
    ["What is the main environmental cost of big data itself?", "Data centres and devices use large amounts of electricity (and cooling water), adding carbon emissions.", 5],
    ["Give a limitation of big-data disaster early warning.", "False alarms cause warning fatigue; networks fail during the disaster; unverified social media data.", 6],
    ["Give an emerging environmental use of big data.", "Digital twins, smart grids, AI weather models, satellite methane detection, precision agriculture.", 8],
    ["Why can't more data make weather forecasts perfect?", "The atmosphere is chaotic: tiny errors in the start grow, so detail becomes unreliable after about one to two weeks.", 100],
    ["What is an ensemble forecast?", "Running a model many times from slightly different starting data; the spread of results shows how confident the forecast is.", 101],
    ["Give two sources of data for flood warnings.", "River level gauges, rainfall radar, weather forecasts, satellite or drone images, social media reports, historic flood maps.", 102],
    ["Give two limitations of big data for energy efficiency.", "Upfront cost of sensors; patterns change from normal days; faulty devices ignore instructions; occupancy data feels like monitoring.", 103],
    ["Name a platform used to combat climate change and what it does.", "Copernicus (satellite Earth data), Climate TRACE (emissions tracking), Global Forest Watch (tree-loss alerts), UKCP (climate projections).", 104],
    ["What is a digital twin?", "A live virtual copy of a real place or system, fed by sensor data, used to test 'what if' scenarios.", 105],
    ["How does precision agriculture use big data?", "Soil sensors, drones and satellite images guide exactly where water and fertiliser go, reducing waste and run-off.", 106],
    ["Give one limitation of climate-change data platforms.", "Data from different countries is inconsistent; self-reported data can be inaccurate; the platforms use energy themselves.", 107]
  ],
  quiz: [
    { q: "Why does forecast accuracy fall with days ahead, even with big data?", opts: ["Satellites switch off", "The atmosphere is chaotic", "Radar only works at night", "Models refuse old data"], ans: 1, why: "Small errors in the starting state grow over time." },
    { q: "Which data source is most useful for a river flood warning?", opts: ["Smart thermostat logs", "Online shopping records", "River level gauges", "Payroll records"], ans: 2, why: "Live river levels show rising water directly." },
    { q: "Which is a LIMITATION of big data in disaster management?", opts: ["Networks may fail", "Warnings come earlier", "Aid is better targeted", "Agencies coordinate"], ans: 0, why: "Power and phone networks often go down in the disaster." },
    { q: "Occupancy sensors cut a building's energy use by:", opts: ["Raising its temperature", "Making staff work faster", "Buying more electricity", "Heating only used spaces"], ans: 3, why: "Energy follows actual use, removing waste." },
    { q: "Which is an emerging environmental development driven by big data?", opts: ["Paper flood maps", "Digital twins", "Fixed heating timers", "Hand-written logs"], ans: 1, why: "Live virtual copies fed by sensors." },
    { q: "Global Forest Watch is an example of:", opts: ["A climate platform", "A smart meter", "A lawful basis", "A decision tree"], ans: 0, why: "It shares satellite tree-loss data to combat deforestation and climate change." },
    { q: "Which is a limitation of climate-change data platforms?", opts: ["Data is fully consistent", "They cost nothing to run", "Emissions are self-reported", "Everyone has equal data"], ans: 2, why: "Self-reported figures can be inaccurate or greenwashed." },
    { q: "What is the main environmental COST of big data itself?", opts: ["Paper used for reports", "Fewer weather stations", "Slower forecasts", "Data centre energy use"], ans: 3, why: "Data centres need electricity and cooling." },
    { q: "Warehouse heating patterns learned before hybrid working now waste energy. This is because:", opts: ["Patterns have changed", "Sensors are too accurate", "Data was anonymised", "Energy got cheaper"], ans: 0, why: "Patterns from 'normal' days changed, so the model is wrong (SAM Q8's limitation)." }
  ]
};

/* =====================================================================
   F201.5.2  Society
   ===================================================================== */
function cityFig() {
  var it = [];
  it.push(txt(85, 12, "Data in (sources)", { b: true, c: "text", size: 11 }));
  it.push(txt(555, 12, "Actions out", { b: true, c: "text", size: 11 }));
  var ins = ["Road cameras + sensors", "Bus GPS + ticket taps", "Smart meters + street lights", "Air-quality sensors", "Bin fill sensors", "Residents' app reports"];
  var outs = ["Re-time traffic lights", "Live bus times, extra buses", "Dim lights on empty streets", "Pollution alerts, diversions", "Collect only full bins", "Repairs sent faster"];
  ins.forEach(function (s, i) {
    var y = 22 + i * 40;
    it = it.concat(box(6, y, 170, 32, s, { c: "accent", size: 10 }));
    it = it.concat(arrow(176, y + 16, 236, 140, null, { c: "muted", w: 1.1 }));
  });
  outs.forEach(function (s, i) {
    var y = 22 + i * 40;
    it = it.concat(box(464, y, 170, 32, s, { c: "good", size: 10 }));
    it = it.concat(arrow(404, 140, 464, y + 16, null, { c: "muted", w: 1.1 }));
  });
  it = it.concat(box(236, 92, 168, 96, ["Urban data platform", "collects + shares via APIs", "analyses (AI, dashboards)", "open data to others"], { c: "it", size: 11.5 }));
  return { fig: { w: 640, h: 270, items: it, cap: "How a smart city exchanges data: sensors and services send data to a shared platform, where it is combined and analysed, and decisions flow back out — often automatically. The value comes from combining sources: bus GPS plus traffic sensors plus air quality says more than any one alone." } };
}
function healthFig() {
  var it = [];
  it = it.concat(box(6, 10, 150, 30, "Genome (DNA test)", { c: "accent", size: 10.5 }));
  it = it.concat(box(6, 48, 150, 30, "Wearable + app data", { c: "accent", size: 10.5 }));
  it = it.concat(box(6, 86, 150, 30, "Health records + scans", { c: "accent", size: 10.5 }));
  [25, 63, 101].forEach(function (y) { it = it.concat(arrow(156, y, 220, 63, null, { c: "muted", w: 1.1 })); });
  it = it.concat(box(220, 34, 180, 58, ["AI / analytics", "compares with millions", "of similar patients"], { c: "it", size: 11 }));
  it = it.concat(arrow(400, 63, 450, 63));
  it = it.concat(box(450, 22, 184, 82, ["Personalised care", "the drug and dose that suit", "you; early warning; remote", "monitoring at home"], { c: "good", size: 11 }));
  return { fig: { w: 640, h: 126, items: it, cap: "Personalised healthcare: one person's data, compared with large populations' data, gives treatment tailored to that person instead of the 'average patient'." } };
}

C["it:F201.5.2"] = {
  notes: [
    { h: "Society — the whole topic on one page" },
    { h: "What the specification asks (F201 5.2)" },
    { kv: [
      [
        "Teaching content",
        "Big data and the development of **smart cities** · emerging social developments driven by big data: **personalised healthcare**, **smart homes**, **traffic management**, **urban and community planning**."
      ],
      [
        "To include",
        "The purpose of a smart city · how data from a variety of sources is exchanged to optimise city operations · benefits and limitations of a smart city · how **individuals** are affected by each emerging social development."
      ],
      [
        "Focus",
        "Questions are usually about the **effect on people** — residents, patients, drivers — as well as on the organisation."
      ]
    ] },
    { ol: ["Smart cities", "Data exchange in a smart city", "Personalised healthcare", "Smart homes", "Traffic management", "Urban and community planning", "How individuals are affected", "In exam questions", "Exam toolkit"] },
    { table: { head: ["Item", "One line to remember"], rows: [
      ["Smart city", "Uses connected sensors and data to run services better — efficient, sustainable, better to live in."],
      ["Data exchange", "Many sources → a shared platform → analysis → automatic or planned action."],
      ["Personalised healthcare", "Treatment tailored to your genes, lifestyle and records; remote monitoring."],
      ["Smart homes", "Connected devices learn routines: heating, security, assistive tech."],
      ["Traffic management", "Live data re-times lights, reroutes traffic, informs travellers."],
      ["Urban planning", "Population and movement data decide where homes, schools, clinics and routes go."]
    ] } },

    { page: "Smart cities" },
    { callout: { t: "def", h: "Smart city", body: "An urban area that uses **connected sensors (IoT), networks and big data analytics** to monitor and manage its services — transport, energy, lighting, waste, water, public safety — in real time." } },
    { callout: { t: "def", h: "Purpose of a smart city", body: "To use data to make city services **more efficient**, the city **more sustainable** (less energy, pollution and waste) and residents' **quality of life better** — and to plan for the future on evidence." } },
    { ul: [
      "**UK examples**: Milton Keynes' MK:Smart project (shared data on energy, water and transport); Manchester's CityVerve IoT demonstrator; London's adaptive traffic signals (SCOOT) that adjust timings from road sensors.",
      "**Worldwide**: Singapore, Barcelona and Amsterdam are often cited."
    ] },
    { table: { head: ["Benefits of a smart city", "Limitations of a smart city"], rows: [
      ["Less congestion and pollution — traffic and transport tuned live.", "**Surveillance and privacy**: cameras, sensors and phones track residents, with no real opt-out."],
      ["Lower energy use and cost (lighting, buildings).", "**Cyber-attack risk**: connected systems can be hacked; one fault can spread."],
      ["Better, faster services (bins, repairs, buses).", "**Very expensive** to install, connect and maintain."],
      ["Faster emergency response from live information.", "**Digital exclusion**: people without smartphones or skills miss out."],
      ["Evidence for planning; open data for new services.", "**Dependence** on technology and suppliers; outages disrupt the city."],
      ["Greener city; healthier residents.", "Data quality: faulty sensors give wrong decisions; data can be biased towards app users."]
    ] } },

    { page: "Data exchange in a smart city" },
    cityFig(),
    { steps: [
      { h: "1 · Collect", m: "Sensors, cameras, meters, vehicles, ticketing and residents' apps produce data continuously.", n: "High Volume, Velocity and Variety." },
      { h: "2 · Share", m: "Data goes to a central **urban data platform** over secure networks; organisations exchange it through **APIs** and data-sharing agreements.", n: "Council, transport operator, police, energy and health share the same picture." },
      { h: "3 · Combine and analyse", m: "Sources are joined — bus GPS + traffic sensors + roadworks + weather — and analysed with dashboards and AI.", n: "Combining is where the value is." },
      { h: "4 · Act", m: "Automatic actions (re-time lights, dim lamps) or decisions by staff (send a crew, add a bus).", n: "Optimising operations." },
      { h: "5 · Publish", m: "Open data lets developers build apps (live bus times, parking).", n: "Personal data removed or aggregated first." }
    ] },
    { worked: { tag: "example", title: "Why combine sources?", q: "A city knows from traffic sensors that a road is jammed. Why does combining that with other sources help more than the sensor alone?",
      steps: [
        { m: "**Bus GPS** shows buses stuck → add priority at the lights for buses." },
        { m: "**Roadworks data** explains the cause → reroute traffic via signs and navigation apps." },
        { m: "**Air-quality sensors** show pollution rising near a school → divert lorries until it falls." },
        { m: "Each source alone gives a fact; together they give a **reason and the best action**." }
      ], result: "Combined data → cause + best response" } },

    { page: "Personalised healthcare" },
    { callout: { t: "def", h: "Personalised healthcare", body: "Using big data about an **individual** — genes, lifestyle, wearable readings, medical history — analysed against data from large populations, to **predict, prevent and treat** illness in the way that suits **that person**." } },
    healthFig(),
    { ul: [
      "**Genomics**: DNA sequencing guides cancer and rare-disease treatment (e.g. the 100,000 Genomes Project, now the NHS Genomic Medicine Service).",
      "**Remote monitoring**: patients at home with devices sending readings to clinicians ('virtual wards').",
      "**AI on scans and records**: spotting disease early; predicting who is at risk.",
      "**Apps and wearables**: heart rate, sleep, glucose — personal advice and alerts."
    ] },
    { table: { head: ["How individuals benefit", "How individuals may be harmed"], rows: [
      ["Earlier diagnosis, sometimes before symptoms.", "Very **sensitive data** — a breach is serious and permanent."],
      ["Treatments and doses that work for them; fewer side effects.", "Fear of data reaching **insurers or employers**."],
      ["Care at home instead of hospital stays.", "**Digital exclusion**: not everyone can use apps or devices."],
      ["More control and information about their own health.", "**Anxiety** from risk scores or constant monitoring."],
      ["", "AI trained on unrepresentative data may suit some groups less well."]
    ] } },

    { page: "Smart homes" },
    { callout: { t: "def", h: "Smart home", body: "A home whose devices — thermostats, lights, meters, speakers, cameras, locks, appliances — are **connected to the internet** and to each other, collecting data to **automate and learn the household's routines**, controlled by app or voice." } },
    { table: { head: ["Device", "Data it collects", "What it does with it"], rows: [
      ["Smart thermostat", "Temperature, occupancy, schedule.", "Heats only when people are home; learns routines."],
      ["Smart meter", "Energy use every half hour.", "Shows use and cost; enables time-of-use tariffs."],
      ["Voice assistant", "Voice commands, usage.", "Controls devices; answers questions; shopping."],
      ["Video doorbell / cameras", "Video, motion, sound.", "Security alerts to the owner's phone."],
      ["Assistive sensors", "Movement, falls, door opening.", "Lets older or disabled people live independently; alerts carers."]
    ] } },
    { table: { head: ["How individuals benefit", "How individuals may be harmed"], rows: [
      ["Convenience — routines run themselves.", "**Privacy**: always-on microphones and cameras; data shared with the maker."],
      ["Lower energy bills.", "**Hacking**: weak devices let attackers in (cameras, locks)."],
      ["Security alerts wherever they are.", "Cameras can record **neighbours and passers-by** — a data protection issue."],
      ["Independence for older and disabled people.", "**Cost** and dependence on one maker; devices stop working when support ends."],
      ["", "Profiling for advertising from what the home reveals."]
    ] } },

    { page: "Traffic management" },
    { callout: { t: "def", h: "Big data in traffic management", body: "Using live and historical data from roads, vehicles, phones and public transport to **keep traffic moving, cut journey times and pollution, and improve safety**." } },
    { kv: [
      ["Adaptive traffic signals", "Road sensors adjust light timings to real queues (e.g. SCOOT)."],
      ["Navigation apps", "Anonymised phone location data shows jams; drivers are rerouted."],
      ["Smart motorways / variable limits", "Sensors set speed limits to smooth flow and warn of incidents."],
      ["Public transport", "Bus GPS gives live arrival times; ticket data shows where to add services."],
      ["ANPR cameras", "Number-plate recognition for congestion charges, Clean Air Zones, enforcement."],
      ["Parking guidance", "Bay sensors direct drivers to free spaces — less circling."]
    ] },
    { table: { head: ["How individuals benefit", "How individuals may be harmed"], rows: [
      ["Shorter, more predictable journeys.", "**Tracking**: ANPR and phone data record where people go."],
      ["Cleaner air; fewer accidents.", "Charges and **fines** enforced automatically; errors are hard to dispute."],
      ["Reliable live bus information.", "Navigation apps send traffic down **quiet residential streets**."],
      ["Less time hunting for parking.", "Over-reliance: when systems fail, chaos."]
    ] } },

    { page: "Urban and community planning" },
    { callout: { t: "def", h: "Big data in urban and community planning", body: "Using data about **population, movement, housing, services and the environment** to decide where to build homes, schools, clinics, roads, cycle lanes and green spaces — and to test plans before building them." } },
    { ul: [
      "**Data used**: the Census, mobile-phone movement data, transport ticketing, footfall counters, house prices, health and school-place data, flood and pollution maps, residents' consultation responses.",
      "**Digital twins** of a city let planners model a new estate's traffic, shade and flood risk before it is built.",
      "**Examples**: forecasting school places; siting EV chargers where demand will be; choosing bus routes for a new development."
    ] },
    { table: { head: ["How individuals benefit", "How individuals may be harmed"], rows: [
      ["Services built where people actually need them.", "Groups **missing from the data** (no smartphone, didn't answer the census) are overlooked — see inclusive data, 4.2."],
      ["Better transport links, safer streets.", "Decisions feel made 'by data' with **little community voice**."],
      ["Fewer costly planning mistakes.", "Movement data raises **privacy** concerns."],
      ["Greener, healthier neighbourhoods.", "Improvements can raise rents and push people out (gentrification)."]
    ] } },

    { page: "How individuals are affected" },
    { table: { head: ["Development", "Positive for the individual", "Negative for the individual"], rows: [
      ["Smart city", "Faster journeys, cleaner air, better services.", "Constant surveillance; excluded if not online."],
      ["Personalised healthcare", "Earlier diagnosis, treatment that suits them.", "Sensitive data at risk; anxiety; unequal access."],
      ["Smart homes", "Convenience, lower bills, independence.", "Privacy, hacking, cost, lock-in."],
      ["Traffic management", "Shorter, safer journeys.", "Tracked by ANPR; automatic fines; rat-running."],
      ["Urban planning", "Services where needed.", "Under-represented groups missed; gentrification."]
    ] } },
    { callout: { t: "key", h: "The pattern behind every answer", body: "Every development trades **convenience, efficiency and better outcomes** against **privacy, security, cost and exclusion**. A strong answer names both sides and says **who** gains and **who** loses." } },
    { callout: { t: "miscon", h: "Misconceptions", body: [
      "\"A smart city is just free Wi-Fi.\" — It is **sensors + data sharing + analysis + action** across services.",
      "\"Everyone benefits equally.\" — People without devices, skills or a voice in the data benefit least (digital exclusion).",
      "\"Smart city data is anonymous, so privacy isn't an issue.\" — Location and camera data can identify people; anonymisation must be done properly.",
      "\"Personalised healthcare means a health app.\" — It is treatment tailored to the **individual's** data, especially genetics and records.",
      "\"Traffic management only helps drivers.\" — It also targets buses, cyclists, pedestrians and air quality."
    ] } },

    { page: "In exam questions" },
    { callout: { t: "info", h: "Scenario used on this page", body: "**Harbourton** is a UK city of 300,000 people. The city council wants to become a smart city: sensors on roads, street lights and bins, a residents' app and a shared data platform with the bus company and the local NHS trust." } },
    { worked: { tag: "exam", title: "Purpose of a smart city", src: "OCR-style · Describe · 1 mark",
      q: "Describe the purpose of a smart city.",
      steps: [
        { m: "Any one from: to use data from connected sensors to run city services more efficiently (1); to make the city more sustainable / reduce energy and pollution (1); to improve residents' quality of life (1).", mk: "1", n: "Credit any other appropriate response. Do not accept: 'a city with lots of technology' with no purpose." }
      ], result: "Use data to improve services / sustainability / quality of life (1)" } },
    { worked: { tag: "exam", title: "Exchanging data to manage traffic", src: "OCR-style · Explain · 3 marks",
      q: "Explain how data from different sources could be exchanged to reduce congestion in Harbourton.",
      steps: [
        { m: "Data is collected from road sensors, traffic cameras and bus GPS (1)…", mk: "1" },
        { m: "…sent to a shared data platform where the council and bus company can both use it (1)…", mk: "1" },
        { m: "…and analysed so traffic lights are re-timed / buses given priority / drivers rerouted via signs and apps (1).", mk: "1", n: "Collect (1) + share/combine (1) + act (1). Credit any other appropriate sources and actions." }
      ], result: "Sources (1) → shared platform (1) → optimising action (1)" } },
    { worked: { tag: "exam", title: "Benefit and limitation for residents", src: "OCR-style · Explain · 4 marks",
      q: "Explain one benefit and one limitation to Harbourton's residents of the city becoming a smart city.",
      steps: [
        { m: "Benefit: traffic lights and bus services adjust to live data (1)…", mk: "1" },
        { m: "…so residents' journeys are shorter and the air near busy roads is cleaner (1).", mk: "1" },
        { m: "Limitation: cameras, sensors and the app track where residents go (1)…", mk: "1" },
        { m: "…so residents lose privacy and their data could be misused or breached, with no real way to opt out (1).", mk: "1", n: "Also accept: digital exclusion (1) — residents without smartphones can't use the app's services (1); cyber-attack (1) disrupts lights or transport (1). Answers must be about residents." }
      ], result: "Benefit (1) + effect on residents (1); limitation (1) + effect (1)",
      try: [{ notesOnly: true, grid: { cols: ["Effect on Harbourton residents", "Benefit or limitation"], rows: [
        ["Bins are emptied before they overflow", "benefit"],
        ["An elderly resident with no smartphone can't report repairs", "limitation"],
        ["Hackers turn off the city's traffic lights", "limitation"],
        ["Street lights dim on empty roads, cutting the council tax spent on energy", "benefit"]
      ], given: [[0, 0], [1, 0], [2, 0], [3, 0]], cap: "**Your turn.** Type **benefit** or **limitation** for each." } }] } },
    { worked: { tag: "exam", title: "Personalised healthcare and the patient", src: "OCR-style · Explain · 2 marks",
      q: "Harbourton's NHS trust will give heart patients wearable monitors that send readings to clinicians. Explain one way this personalised healthcare could affect a patient.",
      steps: [
        { m: "Clinicians see the patient's own readings continuously (1)…", mk: "1" },
        { m: "…so a problem is spotted early and treated before an emergency, and the patient can stay at home instead of in hospital (1).", mk: "1", n: "Also accept negatives: very sensitive data sent and stored (1) so a breach would expose their health (1); constant monitoring may cause anxiety (1). Maximum one explanation." }
      ], result: "What changes (1) + effect on the patient (1)" } },
    { worked: { tag: "exam", title: "Smart homes in council housing", src: "OCR-style · Explain · 4 marks",
      q: "The council will fit smart thermostats and damp sensors in its flats. Explain one benefit and one limitation to tenants.",
      steps: [
        { m: "Benefit: the thermostat learns when tenants are home and heats only then (1)…", mk: "1" },
        { m: "…lowering tenants' energy bills; damp sensors get problems fixed before they harm health (1).", mk: "1" },
        { m: "Limitation: the devices collect data about when tenants are in or out (1)…", mk: "1" },
        { m: "…which tenants may feel is monitoring, and if hacked could show burglars when flats are empty (1).", mk: "1", n: "Also accept cost/maintenance, reliance on internet, tenants who can't use the app. Answers must refer to the tenants." }
      ], result: "Benefit (1) + effect (1); limitation (1) + effect (1)" } },
    lor9("a smart city"),
    { worked: { tag: "exam", title: "Should Harbourton become a smart city?", src: "OCR-style · Discuss · 9 marks",
      q: "Discuss whether Harbourton City Council should become a smart city.\n\nYou should consider:\n- the benefits to the council and residents\n- the limitations\n- whether you would recommend it.",
      steps: [
        { m: "Use: road sensors, bus GPS and lights share data on one platform to re-time signals and give buses priority — shorter journeys and less pollution.", mk: "1", n: "A use explained in context — every level." },
        { m: "Benefit: bin sensors and dimming street lights cut fuel, energy and staff costs — money the council can spend elsewhere.", mk: "1", n: "Benefit to the council — L2/L3." },
        { m: "Benefit: live data speeds emergency response and repairs; open data lets local firms build useful apps.", mk: "1", n: "L2/L3." },
        { m: "Benefit: evidence for planning — new bus routes and school places where the data shows need.", mk: "1", n: "L3: links to urban planning." },
        { m: "Limitation: privacy — residents tracked by cameras, sensors and the app; UK GDPR duties, DPIAs and public trust to manage.", mk: "1", n: "Limitation + consequence — L3." },
        { m: "Limitation: cyber-attacks on connected traffic and lighting could disrupt the whole city; security costs money.", mk: "1", n: "L2/L3." },
        { m: "Limitation: high installation and maintenance cost for a council budget; residents without smartphones are excluded.", mk: "1", n: "L2/L3." },
        { m: "Recommendation: yes, but phased — start with traffic and lighting where savings are measurable…", mk: "1", n: "Conclusion needed for Level 3." },
        { m: "…with strong security, anonymised data, published rules on data use, and non-digital ways to use services so no resident is left out.", mk: "1", n: "Justified, conditional judgement — top of Level 3. Credit a justified 'no'." }
      ], result: "Level 3: a range of uses, benefits AND limitations for council and residents, with a justified recommendation" } },
    { worked: { tag: "example", title: "Model Level 3 conclusion", q: "Write the conclusion of a Level 3 answer to the smart-city question.",
      steps: [
        { m: "\"Overall I would recommend Harbourton becomes a smart city, because sharing traffic, bus and lighting data should cut congestion, pollution and the council's energy costs, which benefits every resident. However, the council should introduce it in stages, starting where savings can be measured, anonymise data before it is shared or published, and keep phone and face-to-face services so residents without smartphones are not excluded. Without strong cyber security the risks would outweigh the benefits.\"" }
      ], result: "Recommendation + reasons + conditions" } },

    { page: "Exam toolkit" },
    { callout: { t: "tip", h: "How OCR marks it", body: [
      "**Purpose of a smart city (1)**: data → efficient services / sustainability / quality of life. Not just 'lots of technology'.",
      "**How data is exchanged (3)**: sources → shared platform → analysis and action. Name real sources and a real action.",
      "**Individuals affected (2)**: what changes (1) + the effect on the person (1) — health, money, time, privacy, safety.",
      "**Discuss (9)**: uses, benefits, limitations, a recommendation — both council AND residents.",
      "Avoid one-word limitations ('privacy'): say **what** is tracked and **what could happen**."
    ] } },
    { callout: { t: "mnemonic", h: "Mnemonics", body: [
      "**The four social developments — \"Healthy Homes Travel Planned\"**: personalised Healthcare, smart Homes, Traffic management, urban Planning.",
      "**Smart city limitations — \"Spies Can Cost Everyone\"**: Surveillance/privacy, Cyber-attack, Cost, Exclusion (digital).",
      "**Data exchange — \"Collect, Share, Combine, Act\"**."
    ] } },
    { callout: { t: "tip", h: "Synoptic links", body: [
      "**F201 1.1–1.2** — smart-city data is high Volume, Velocity and Variety; captured by sensors, IoT, cameras, apps.",
      "**F201 2.1–2.3** — the shared platform is cloud storage and processing; data must be integrated.",
      "**F201 3.1** — AI predicts traffic and health risks; k-means groups neighbourhoods.",
      "**F201 4.1–4.2** — location and health data are personal (health is special category); surveillance and inclusive data are ethical debates.",
      "**F201 5.1** — smart grids and air-quality sensors overlap with energy efficiency and environmental management.",
      "**F204** — Data and the Internet of Everything is the technology of smart cities and homes; **F205** — city dashboards visualise the data."
    ] } }
  ],
  flashcards: [
    ["What is a smart city and what is its purpose?", "A city that uses connected sensors and data analytics to manage services in real time — to be more efficient, sustainable and better to live in.", 0],
    ["How does a smart city optimise its operations?", "Collects data from many sources, shares it on a platform, combines and analyses it, then acts — re-timing lights, routing bins, dimming lights.", 1],
    ["Give two benefits of a smart city.", "Less congestion and pollution; lower energy costs; faster services and emergency response; evidence for planning.", 2],
    ["Give two limitations of a smart city.", "Surveillance and privacy loss; cyber-attack risk; high cost; digital exclusion; dependence on technology.", 3],
    ["How does personalised healthcare affect individuals?", "Earlier diagnosis and treatment that suits them, care at home — but sensitive data at risk, anxiety and unequal access.", 5],
    ["How do smart homes affect individuals?", "Convenience, lower bills and independence — but privacy, hacking, cost and dependence on one maker.", 6],
    ["How does data-driven urban planning affect communities?", "Services go where needed — but groups missing from the data can be overlooked and people may feel unheard.", 7],
    ["Why is digital exclusion a smart-city concern?", "People without smartphones, internet or skills can't use app-based services, so they benefit less or are left out.", 8],
    ["What is an urban data platform in a smart city?", "A shared system that collects data from many sources, shares it via APIs, analyses it and publishes open data.", 100],
    ["Give three sources of smart-city data.", "Traffic sensors and cameras, bus GPS and ticketing, smart meters, air-quality sensors, bin sensors, residents' app reports.", 101],
    ["How do adaptive traffic signals use big data?", "Road sensors measure queues and the system changes light timings in real time to keep traffic moving.", 102],
    ["What data does personalised healthcare use?", "Genetic data, medical records and scans, wearable and app readings, lifestyle data — compared with large populations.", 103],
    ["Give one negative effect of traffic management data on individuals.", "ANPR and phone data track their movements; automatic fines; navigation apps send traffic down residential streets.", 104],
    ["What is a digital twin used for in urban planning?", "A live virtual model of the city to test plans (traffic, flooding, shade) before building.", 105],
    ["Name a UK smart-city example and what it did.", "Milton Keynes' MK:Smart (shared energy, water and transport data); Manchester's CityVerve IoT demonstrator; London's SCOOT signals.", 106]
  ],
  quiz: [
    { q: "What is the main purpose of a smart city?", opts: ["Sell residents' data", "Use data to run services better", "Replace council staff", "Ban cars from the centre"], ans: 1, why: "Efficiency, sustainability and quality of life through data." },
    { q: "In a smart city, data from many sources is usually combined on:", opts: ["A residents' notice board", "Each sensor separately", "A shared data platform", "Paper forms"], ans: 2, why: "An urban data platform collects, shares and analyses it." },
    { q: "Which is a LIMITATION of a smart city for residents?", opts: ["Shorter journeys", "Cleaner air", "Faster repairs", "Being tracked"], ans: 3, why: "Cameras, sensors and apps record where people go." },
    { q: "Adaptive traffic lights change their timings using:", opts: ["Live road sensor data", "Last year's timetable", "Residents' votes", "A fixed timer"], ans: 0, why: "Sensors measure queues in real time (e.g. SCOOT)." },
    { q: "Personalised healthcare tailors treatment using:", opts: ["The average patient", "An individual's own data", "Random selection", "A hospital's budget"], ans: 1, why: "Genes, records and wearable data of that person." },
    { q: "Which is a risk of smart homes for individuals?", opts: ["Lower energy bills", "Independent living", "Devices being hacked", "Security alerts"], ans: 2, why: "Weak devices can let attackers in." },
    { q: "Who is most likely to be overlooked by data-driven urban planning?", opts: ["Groups missing from data", "Frequent app users", "Census respondents", "Daily bus commuters"], ans: 0, why: "People not captured in the data — the inclusive data problem." },
    { q: "Which is one of the spec's four emerging social developments?", opts: ["Weather forecasting", "Smart homes", "Decision trees", "Marketing consent"], ans: 1, why: "Personalised healthcare, smart homes, traffic management, urban and community planning." },
    { q: "Why is combining data sources valuable in a smart city?", opts: ["It uses less storage", "It removes all errors", "It ends privacy rules", "It explains causes"], ans: 3, why: "Together they give the reason and the best response, not just one fact." }
  ]
};

/* the exam tab's items derive from the worked exam cards above */
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
