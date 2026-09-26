/* Kurenai OS — core/sample.js
   The Sample namespace's account (Graphite review aid).

   KOS.dataMode (store.js) can point the app at three separate namespaces:
   the real account, an Empty one (a first run, nothing added) and a Sample
   one. This file fills the Sample namespace ONCE, the first time it boots,
   with a lived-in account — every domain a surface can read has records,
   so each page can be judged full as well as empty. It never runs against
   the real namespace, and cloud and provider sync are off while it is in
   use, so none of this can reach an account.

   Records go through each domain's schema gate (calendar, reminders,
   assignments, goals, mediadb) exactly as a real write does. Dates are
   relative to today, so the sample always reads as current. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var DAY = 86400000;

  function seedState() {
    var S = KOS.store.state;
    var today0 = new Date(); today0.setHours(9, 0, 0, 0);
    var today = today0.getTime();
    function iso(t) { return KOS.srs.addDays(KOS.srs.todayISO(), Math.round((t - today) / DAY)); }
    function day(n) { return KOS.srs.addDays(KOS.srs.todayISO(), n); }
    /* deterministic: the sample is the same every time it is rebuilt */
    var seed = 20260926;
    function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
    function pick(a) { return a[Math.floor(rnd() * a.length)]; }

    /* ---------- the Governor ---------- */
    S.governor.xp = 18460; S.governor.gold = 640; S.governor.hp = 82;
    S.governor.status = "Paper 2 mock on Friday — heads down until then.";
    /* every lab is open, so each can be reviewed full; one frame and one
       banner are owned, and the rest of the shop is still for sale */
    var cat = KOS.governor.catalog();
    var firstOf = function (kind) { var c = cat.filter(function (x) { return x.kind === kind; })[0]; return c ? [c.id] : []; };
    S.governor.owned = cat.filter(function (c) { return c.kind === "lab"; }).map(function (c) { return c.id; })
      .concat(firstOf("frame"), firstOf("banner"));

    /* ---------- study: progress, confidence, flashcards ---------- */
    var refs = [];
    Object.keys(window.KOS_DATA || {}).forEach(function (sid) {
      (function walk(n) {
        if (!n) return;
        if (n.content && n.content.length) refs.push([sid, n.ref]);
        (n.children || []).forEach(walk);
      })({ children: (window.KOS_DATA[sid] || {}).sections || [] });
    });
    var bySid = { compsci: [], maths: [], it: [] };
    refs.forEach(function (r) { (bySid[r[0]] = bySid[r[0]] || []).push(r); });
    var studied = [];
    Object.keys(bySid).forEach(function (sid) {
      var list = bySid[sid], share = sid === "compsci" ? 0.55 : sid === "maths" ? 0.4 : 0.3;
      list.slice(0, Math.round(list.length * share)).forEach(function (r, i) { studied.push(r); });
    });
    studied.forEach(function (r, i) {
      S.progress[r[0] + ":" + r[1]] = {
        status: i % 4 === 0 ? "started" : i % 9 === 0 ? "paused" : "done",
        check: [true, i % 2 === 0, i % 3 !== 0, i % 5 === 0],
        rag: i % 6 === 0 ? "r" : i % 4 === 0 ? "a" : i % 3 === 0 ? "g" : null,
        note: i % 11 === 0 ? "Redo the worked example without looking — the second step is where marks go." : ""
      };
    });
    studied.slice(0, 40).forEach(function (r, i) {
      (KOS.srs.cardsFor(r[0], r[1]) || []).forEach(function (c, j) {
        if ((i + j) % 4 === 3) return;
        var ahead = ((i * 7 + j * 3) % 29) - 2;          /* a few overdue or due, most ahead */
        S.srs[c.key] = { ef: 2.1 + ((i + j) % 8) / 10, ivl: 1 + ((i + j) % 24), reps: 1 + ((i + j) % 8),
          due: day(ahead), last: day(-1 - ((i + j) % 10)), views: 2 + ((i + j) % 12),
          lapses: (i + j) % 7 === 0 ? 1 : 0, lastRating: 2 + ((i + j) % 3) };
      });
    });
    [["compsci", "Two's complement of −37 in 8 bits", "11011011 — flip 00100101 and add 1."],
     ["compsci", "Why is a circular queue better than a linear one?", "Freed slots at the front are reused, so it never reports full while space remains."],
     ["maths", "d/dx (sin 3x)", "3 cos 3x"],
     ["maths", "Condition for a geometric series to converge", "|r| < 1; then S∞ = a / (1 − r)."],
     ["it", "What does 'veracity' mean for big data?", "How trustworthy and accurate the data is."]
    ].forEach(function (c, i) {
      var ref = (bySid[c[0]] || [])[i] ? bySid[c[0]][i][1] : null;
      S.custom.cards.push({ id: S.custom.nextId++, sid: c[0], ref: ref, q: c[1], a: c[2], created: day(-10 - i) });
    });

    /* ---------- the session ledger: 26 weeks of work and rest ---------- */
    S.sessions = [];
    var sid = 1;
    for (var d = 181; d >= 0; d--) {
      var dayT = today - d * DAY;
      var weekday = new Date(dayT).getDay();
      if (rnd() < (weekday === 0 || weekday === 6 ? 0.45 : 0.22)) continue;   /* a rest day */
      var n = 1 + Math.floor(rnd() * (d < 30 ? 4 : 3));
      for (var k = 0; k < n; k++) {
        var type = pick(["flashcards", "flashcards", "due-review", "quiz", "exam", "notes", "focus", "focus", "todo", "media", "media"]);
        var subj = pick(["compsci", "compsci", "maths", "maths", "it"]);
        var ref = (pick(studied) || ["compsci", "4.2.3.1"]);
        var ts = dayT + (k * 2 + Math.floor(rnd() * 3)) * 3600000;
        var rec = { id: sid++, ts: ts, date: iso(ts), type: type, subject: type === "media" || type === "todo" ? null : ref[0],
          ref: type === "media" || type === "todo" ? null : ref[1], dur: null, metrics: {} };
        if (type === "focus") {
          var mins = pick([25, 25, 50, 45, 30]);
          rec.dur = mins * 60; rec.subject = subj;
          rec.metrics = { mode: "pomodoro", complete: rnd() > 0.1, mins: mins, pauses: Math.floor(rnd() * 2) };
        } else if (type === "media") {
          var mod = pick(["anime", "anime", "books", "vn", "game"]);
          rec.metrics = { module: mod, action: "progress", units: 1 + Math.floor(rnd() * 3), advances: 1 };
        } else if (type === "todo") {
          rec.metrics = { item: pick(["Habit kept: Read for 20 minutes", "Reminder done: Pack the calculator", "Habit kept: Walk before school"]) };
        } else if (type === "quiz") {
          var q = 5 + Math.floor(rnd() * 6);
          rec.dur = 240 + Math.floor(rnd() * 400);
          rec.metrics = { score: Math.max(2, q - Math.floor(rnd() * 4)), total: q };
        } else if (type === "exam") {
          rec.dur = 600 + Math.floor(rnd() * 900);
          rec.metrics = { marks: 3 + Math.floor(rnd() * 6), max: 9 };
        } else {
          rec.dur = 300 + Math.floor(rnd() * 1500);
          rec.metrics = { cards: 8 + Math.floor(rnd() * 25), complete: true };
        }
        S.sessions.push(rec);
      }
    }
    S.sessions.sort(function (a, b) { return a.ts - b.ts; });
    S.sessions.forEach(function (s, i) { s.id = i + 1; });

    /* ---------- calendar: exams, deadlines, study blocks, lessons ---------- */
    S.calendar = { v: 2, nextId: 1, seeded: true, events: [], notified: {} };
    function ev(o) { S.calendar.events.push(KOS.calendar.normalise(o, { id: S.calendar.nextId++ })); }
    ev({ type: "exam", title: "Computer Science Paper 2 mock", date: day(5), time: "09:00", durationMins: 150, subject: "compsci",
      paper: "Paper 2", room: "Sports hall", alerts: [1440], showInCountdown: true });
    ev({ type: "exam", title: "Maths Pure 1 mock", date: day(12), time: "13:15", durationMins: 120, subject: "maths",
      paper: "Paper 1", room: "Hall B", alerts: [1440], showInCountdown: true });
    ev({ type: "exam", title: "IT Unit 1 — Information systems", date: day(33), time: "09:00", durationMins: 90, subject: "it", alerts: [10080], showInCountdown: true });
    ev({ type: "deadline", title: "NEA analysis — first draft to Mr Hart", date: day(3), time: "16:00", subject: "compsci", priority: 2, showInCountdown: true, alerts: [1440] });
    ev({ type: "deadline", title: "UCAS personal statement to tutor", date: day(9), time: "17:00", priority: 1, showInCountdown: true });
    ev({ type: "study", title: "Graphs: Dijkstra past-paper questions", date: day(0), time: "16:30", durationMins: 60, subject: "compsci" });
    ev({ type: "study", title: "Integration by parts — exercise 11C", date: day(1), time: "17:00", durationMins: 45, subject: "maths" });
    ev({ type: "study", title: "Big data case study notes", date: day(2), time: "18:00", durationMins: 40, subject: "it" });
    ev({ type: "study", title: "Recursion and stack frames review", date: day(-2), time: "16:30", durationMins: 50, subject: "compsci" });
    ev({ type: "lesson", title: "Further Maths drop-in", date: day(-3), time: "12:40", durationMins: 40, subject: "maths", recur: "weekly" });
    ev({ type: "lesson", title: "CS revision club", date: day(-1), time: "15:30", durationMins: 60, subject: "compsci", recur: "weekly", location: "Room S12" });
    ev({ type: "personal", title: "Dentist", date: day(6), time: "10:30", durationMins: 30, alerts: [120] });
    ev({ type: "personal", title: "Aki's birthday dinner", date: day(14), time: "19:00", durationMins: 180 });
    ev({ type: "personal", title: "Open day — Durham", date: day(20), allDay: true });

    /* ---------- reminders ---------- */
    S.reminders = { v: 2, nextId: 1, migrated: true, items: [], rewardLog: {},
      lists: [{ id: "l1", name: "Study", colour: "" }, { id: "l2", name: "Life admin", colour: "" }, { id: "l3", name: "Collection", colour: "" }] };
    function rem(o) {
      o.id = S.reminders.nextId++;
      var r = KOS.reminders.normalise(o, { id: o.id });
      r.id = o.id;
      S.reminders.items.push(r);
    }
    rem({ title: "Email Mr Hart about the NEA extension", due: day(-1), dueTime: "20:30", priority: 2, listId: "l1", tags: ["urgent"], created: today - 4 * DAY, updatedAt: today });
    rem({ title: "Print Paper 2 specimen", due: day(0), priority: 1, listId: "l1", created: today - 2 * DAY, updatedAt: today });
    rem({ title: "Pack calculator and spare batteries", due: day(4), dueTime: "21:00", listId: "l1", tags: ["exam"], created: today - DAY, updatedAt: today });
    rem({ title: "Book the driving theory test", due: day(2), priority: 1, listId: "l2", created: today - 6 * DAY, updatedAt: today,
      subs: [{ id: 1, text: "Find the provisional licence number", done: true }, { id: 2, text: "Pick a centre", done: false }] });
    rem({ title: "Renew the library card", due: day(8), listId: "l2", created: today - DAY, updatedAt: today });
    rem({ title: "Water the plants", due: day(1), listId: "l2", recur: "weekly", created: today - 20 * DAY, updatedAt: today });
    rem({ title: "Return Witch Hat Atelier vol. 12 to Mia", due: day(3), listId: "l3", created: today - 3 * DAY, updatedAt: today });
    rem({ title: "Pre-order Frieren vol. 14", listId: "l3", tags: ["planner"], created: today - 5 * DAY, updatedAt: today });
    rem({ title: "Revise hash tables flashcards", due: day(-3), listId: "l1", done: true, completedAt: today - 2 * DAY, created: today - 7 * DAY, updatedAt: today - 2 * DAY });
    rem({ title: "Send the permission slip", due: day(-5), listId: "l2", done: true, completedAt: today - 5 * DAY, created: today - 9 * DAY, updatedAt: today - 5 * DAY });

    /* ---------- assignments ---------- */
    S.assignments = { v: 1, nextId: 1, items: [] };
    function asg(o) {
      o.id = S.assignments.nextId++;
      var a = KOS.assignments.normalise(o, { id: o.id });
      a.id = o.id;
      S.assignments.items.push(a);
    }
    asg({ title: "NEA — Analysis: stakeholder interviews and success criteria", subject: "compsci", type: "coursework",
      assigned: day(-21), due: day(3), dueTime: "16:00", status: "inProgress", progress: 60, priority: 2,
      estimateMins: 480, actualMins: 290, description: "Interview two stakeholders, write measurable success criteria, justify the solution.",
      subtasks: [{ id: 1, text: "Interview transcript 1", done: true }, { id: 2, text: "Interview transcript 2", done: true },
        { id: 3, text: "Success criteria table", done: false }, { id: 4, text: "Proof-read", done: false }],
      showInCalendar: true, showInCountdown: true, created: today - 21 * DAY, updatedAt: today });
    asg({ title: "Integration exercise 11C (Q1–18)", subject: "maths", type: "homework", assigned: day(-4), due: day(1), dueTime: "08:40",
      status: "inProgress", progress: 35, priority: 1, estimateMins: 90, actualMins: 30, showInCalendar: true, created: today - 4 * DAY, updatedAt: today });
    asg({ title: "Big data: case-study essay (1,500 words)", subject: "it", type: "essay", assigned: day(-10), due: day(11), dueTime: "23:59",
      status: "notStarted", progress: 0, priority: 1, estimateMins: 240, showInCalendar: true, showInCountdown: true, created: today - 10 * DAY, updatedAt: today });
    asg({ title: "Sorting algorithms worksheet", subject: "compsci", type: "homework", assigned: day(-9), due: day(-2), dueTime: "08:40",
      status: "submitted", progress: 100, estimateMins: 60, actualMins: 70, created: today - 9 * DAY, updatedAt: today - 2 * DAY, submittedAt: today - 2 * DAY });
    asg({ title: "Vectors test corrections", subject: "maths", type: "classwork", assigned: day(-14), due: day(-7),
      status: "complete", progress: 100, estimateMins: 45, actualMins: 40, created: today - 14 * DAY, updatedAt: today - 7 * DAY, completedAt: today - 7 * DAY });

    /* ---------- exams & papers ---------- */
    S.tracker = { nextId: 1, entries: [] };
    [["paper", "compsci", "AQA 7517/1 — June 2023 Paper 1", 71, 100, "B", 34],
     ["paper", "compsci", "AQA 7517/2 — June 2023 Paper 2", 64, 100, "B", 27],
     ["paper", "maths", "Edexcel 9MA0/01 — June 2022", 58, 100, "C", 20],
     ["exam", "maths", "Year 12 end-of-year exam", 81, 100, "A", 120],
     ["paper", "it", "OCR H019 Unit 1 — sample assessment", 43, 60, "B", 12]
    ].forEach(function (p, i) {
      S.tracker.entries.push({ id: S.tracker.nextId++, kind: p[0], subject: p[1], ref: null, topic: "", paper: p[2],
        marks: p[3], max: p[4], grade: p[5], date: day(-p[6]),
        well: i % 2 ? "Timing was fine; long answers were structured." : "Trace tables and Big-O were solid.",
        badly: i % 2 ? "Lost marks on the proof question." : "Ran out of time on the last 12-marker.",
        notes: "", reviewed: i < 3, added: today - p[6] * DAY });
    });

    /* ---------- subject resources ---------- */
    S.resources = { nextId: 1, items: [] };
    [["compsci", "Isaac Computer Science", "https://isaaccomputerscience.org"],
     ["compsci", "AQA past papers", "https://www.aqa.org.uk"],
     ["maths", "Physics & Maths Tutor — Pure", "https://www.physicsandmathstutor.com"],
     ["it", "OCR AAQ specification", "https://www.ocr.org.uk"]
    ].forEach(function (r) { S.resources.items.push({ id: S.resources.nextId++, subject: r[0], ref: null, name: r[1], url: r[2] }); });

    /* ---------- habits ---------- */
    S.todo = S.todo || { nextId: 1, manual: [], autoChecked: {} };
    S.todo.habits = [];
    ["Read for 20 minutes", "Walk before school", "Flashcards before bed", "No phone after 23:00"].forEach(function (text, i) {
      var days = {};
      for (var b = 1; b <= 60; b++) if (rnd() < 0.75 - i * 0.1) days[day(-b)] = true;
      if (i < 2) days[day(0)] = true;
      S.todo.habits.push({ id: S.todo.nextId++, text: text, days: days, created: day(-60) });
    });

    /* ---------- the Planner (wishlist + budget) ---------- */
    S.wishlist = { nextId: 1, budget: { monthlyLimit: 60, currency: "£", history: [] }, items: [] };
    function wish(o) { o.id = S.wishlist.nextId++; o.currency = "£"; o.coverUrl = ""; o.coverCrop = null; o.linkedEntryId = null; o.notes = o.notes || ""; S.wishlist.items.push(o); }
    wish({ module: "books", title: "Frieren: Beyond Journey's End vol. 14", price: 7.99, retailer: "Waterstones", retailerUrl: "", priority: 1,
      releaseDate: day(18), status: "waitingForRelease", addedAt: today - 5 * DAY, purchasedAt: null });
    wish({ module: "books", title: "Witch Hat Atelier vol. 13", price: 10.99, retailer: "Forbidden Planet", retailerUrl: "", priority: 2,
      releaseDate: day(-40), status: "wantToBuy", addedAt: today - 12 * DAY, purchasedAt: null });
    wish({ module: "game", title: "Metaphor: ReFantazio", price: 39.99, retailer: "Steam", retailerUrl: "", priority: 3,
      releaseDate: day(-300), status: "wantToBuy", addedAt: today - 30 * DAY, purchasedAt: null });
    wish({ module: "vn", title: "Umineko When They Cry — Question Arcs", price: 24.99, retailer: "Steam", retailerUrl: "", priority: 4,
      releaseDate: null, status: "wantToBuy", addedAt: today - 40 * DAY, purchasedAt: null });
    wish({ module: "books", title: "Spice and Wolf vol. 24", price: 13.99, retailer: "Waterstones", retailerUrl: "", priority: 5,
      releaseDate: day(-20), status: "purchased", addedAt: today - 50 * DAY, purchasedAt: today - 9 * DAY });
    wish({ module: "game", title: "Hades II", price: 24.99, retailer: "Steam", retailerUrl: "", priority: 6,
      releaseDate: day(-120), status: "purchased", addedAt: today - 80 * DAY, purchasedAt: today - 38 * DAY });
    var m0 = day(0).slice(0, 7), m1 = day(-35).slice(0, 7);
    S.wishlist.budget.history = [
      { month: m1, spent: 24.99, items: [{ id: 6, title: "Hades II", module: "game", price: 24.99, currency: "£", purchasedAt: today - 38 * DAY }] },
      { month: m0, spent: 13.99, items: [{ id: 5, title: "Spice and Wolf vol. 24", module: "books", price: 13.99, currency: "£", purchasedAt: today - 9 * DAY }] }
    ];

    /* ---------- goals ---------- */
    S.goals = { v: 2, nextId: 1, items: [], completionLedger: {} };
    [{ title: "Finish every light novel on the physical shelf", type: "manual", target: 12, current: 7, module: "books", deadline: day(60) },
     { title: "Clear the anime backlog to under ten", type: "manual", target: 10, current: 6, module: "anime", deadline: day(30) },
     { title: "Finish one visual novel this term", type: "manual", target: 1, current: 0, module: "vn", deadline: day(75) },
     { title: "Read Witch Hat Atelier to the latest volume", type: "manual", target: 12, current: 12, module: "books", status: "completed", completedAt: today - 6 * DAY }
    ].forEach(function (g) {
      g.id = S.goals.nextId++; g.createdAt = today - 30 * DAY; g.updatedAt = today;
      S.goals.items.push(KOS.goals.normalise(g));
    });

    /* ---------- the notification feed ---------- */
    S.notify = { items: [], read: {}, airing: {} };
    [["calendar", "calendar:cs-mock:1", "Computer Science Paper 2 mock", "Tomorrow at 09:00 · Sports hall", 2],
     ["reminder", "reminder:1:due", "Email Mr Hart about the NEA extension", "Overdue since yesterday 20:30", 20],
     ["assignment", "assignment:1:due", "NEA — Analysis due in 3 days", "60% done · 2 of 4 subtasks", 26],
     ["airing", "airing:frieren:12", "Frieren: Beyond Journey's End", "Episode 12 has aired", 40],
     ["wishlist", "wishlist:1:release", "Spice and Wolf vol. 24 is out", "Released today — on the Planner", 70],
     ["calendar", "calendar:dentist:1", "Dentist", "In 2 hours", 150],
     ["reminder", "reminder:3:due", "Pack calculator and spare batteries", "Due tomorrow", 200]
    ].forEach(function (n, i) {
      S.notify.items.push({ id: n[1], kind: n[0], title: n[2], body: n[3], ts: Date.now() - n[4] * 3600000, view: null, arg: null, cover: null });
      if (i >= 4) S.notify.read[n[1]] = Date.now() - 3600000;
    });

    S.ui.sampleSeeded = true;
    KOS.store.save();
  }

  /* ---------- the Collection: four vaults ---------- */
  function mediaRows() {
    var today = Date.now();
    var iso = function (n) { return KOS.srs.addDays(KOS.srs.todayISO(), n); };
    var rows = [];
    function row(o) {
      o.dates = o.dates || { started: o.status === "planned" ? null : iso(-40), finished: o.status === "completed" ? iso(-10) : null };
      o.createdAt = today - 90 * DAY;
      rows.push(o);
    }
    [["Frieren: Beyond Journey's End", "inProgress", 11, 28, 10, ["Adventure", "Drama", "Fantasy"], true],
     ["The Apothecary Diaries", "inProgress", 18, 24, 9, ["Drama", "Mystery"], false],
     ["Dandadan", "inProgress", 7, 12, 8, ["Action", "Comedy", "Supernatural"], false],
     ["Bocchi the Rock!", "completed", 12, 12, 9, ["Comedy", "Music", "Slice of Life"], true],
     ["Vinland Saga Season 2", "completed", 24, 24, 10, ["Action", "Drama"], true],
     ["Mushishi", "completed", 26, 26, 9, ["Mystery", "Slice of Life", "Supernatural"], false],
     ["Violet Evergarden", "completed", 13, 13, 8, ["Drama", "Fantasy"], false],
     ["Oshi no Ko", "onHold", 6, 11, 7, ["Drama", "Mystery"], false],
     ["Summertime Rendering", "planned", 0, 25, 0, ["Mystery", "Thriller"], false],
     ["Made in Abyss", "planned", 0, 13, 0, ["Adventure", "Mystery", "Fantasy"], false],
     ["Blue Period", "dropped", 4, 12, 5, ["Drama", "Slice of Life"], false]
    ].forEach(function (a, i) {
      row({ module: "anime", title: a[0], status: a[1], progress: { current: a[2], total: a[3] }, score: a[4], genres: a[5], favourite: a[6],
        ownership: "digital", syncSource: "anilist", externalIds: { anilistId: 900100 + i },
        customLists: i === 0 || i === 4 ? ["Rewatch someday"] : [], notes: i === 0 ? "The Himmel flashbacks land every single time." : "" });
    });
    [["Witch Hat Atelier", "manga", "Kamome Shirahama", "inProgress", 72, 78, 9, 12, true],
     ["Spice and Wolf", "lightNovel", "Isuna Hasekura", "inProgress", 0, 0, 9, 24, true],
     ["Frieren: Beyond Journey's End", "manga", "Kanehito Yamada", "inProgress", 118, 0, 9, 13, false],
     ["86—EIGHTY-SIX", "lightNovel", "Asato Asato", "completed", 0, 0, 8, 13, false],
     ["Yotsuba&!", "manga", "Kiyohiko Azuma", "completed", 110, 110, 10, 15, true],
     ["Vagabond", "manga", "Takehiko Inoue", "onHold", 210, 327, 10, 0, false],
     ["The Apothecary Diaries", "lightNovel", "Natsu Hyuuga", "planned", 0, 0, 0, 0, false],
     ["Chainsaw Man", "manga", "Tatsuki Fujimoto", "dropped", 40, 0, 6, 0, false],
     ["Monogatari: Bakemonogatari", "lightNovel", "NISIOISIN", "planned", 0, 0, 0, 0, false]
    ].forEach(function (b, i) {
      var shelf = b[7] > 0 && (b[1] === "manga" ? i !== 2 : true);
      var vols = [];
      for (var v = 1; v <= (shelf ? Math.min(b[7], i === 1 ? 20 : b[7]) : 0); v++) {
        vols.push({ number: v, condition: v % 5 === 0 ? "worn" : "good", purchaseDate: iso(-400 + v * 12), price: b[1] === "manga" ? 7.99 : 13.99, coverUrl: "", coverCrop: null });
      }
      row({ module: "books", title: b[0], format: b[1], author: b[2], status: b[3],
        progress: { current: b[4], total: b[5] || null, volumes: b[1] === "lightNovel" ? Math.min(vols.length, 18) : null, totalVolumes: b[7] || null },
        score: b[6], favourite: b[8], genres: ["Fantasy", "Drama"].slice(0, 1 + (i % 2)),
        ownership: shelf ? "physical" : "digital",
        syncSource: i === 1 || i === 3 ? "manual" : "anilist", externalIds: { anilistId: i === 1 || i === 3 ? null : 910100 + i },
        physical: shelf ? { owned: true, volumes: vols } : null,
        shelves: shelf ? ["Bedroom shelf"] : [] });
    });
    [["Steins;Gate", "completed", 10, true, 2400], ["The House in Fata Morgana", "completed", 10, true, 2100],
     ["Fate/stay night", "inProgress", 8, false, 3600], ["Muv-Luv Alternative", "planned", 0, false, 3000],
     ["Clannad", "onHold", 7, false, 4200]
    ].forEach(function (v, i) {
      var routes = [{ name: "Common route", cleared: v[1] !== "planned" }, { name: "Route A", cleared: v[1] === "completed" || (v[1] === "inProgress") },
        { name: "Route B", cleared: v[1] === "completed" }, { name: "True end", cleared: v[1] === "completed" }];
      row({ module: "vn", title: v[0], status: v[1], score: v[2], favourite: v[3], genres: ["Drama", "Mystery"].slice(0, 1 + (i % 2)),
        syncSource: "vndb", externalIds: { vndbId: "v" + (2000 + i) }, routes: routes, developer: ["5pb.", "Novectacle", "Type-Moon", "âge", "Key"][i],
        extra: { lengthMinutes: v[4] },
        quotes: i === 0 ? [{ text: "I am mad scientist. It's so cool! Sonuvabitch!", context: "Okabe, common route" }] : [] });
    });
    [["Persona 5 Royal", "completed", 9, 118, true], ["Elden Ring", "inProgress", 10, 86, true], ["Hades", "completed", 9, 64, false],
     ["Outer Wilds", "completed", 10, 22, true], ["Final Fantasy XIV", "inProgress", 8, 240, false], ["Celeste", "planned", 0, 0, false]
    ].forEach(function (g, i) {
      row({ module: "game", title: g[0], status: g[1], score: g[2], favourite: g[4], playtimeHours: g[3],
        genres: ["RPG", "Action", "Adventure"].slice(0, 1 + (i % 3)), syncSource: "manual", ownership: "digital",
        platform: ["playstation", "pc", "switch", "pc", "pc", "switch"][i],
        completionTier: g[1] === "completed" ? (i === 3 ? "fullCompletion" : "storyComplete") : "notStarted" });
    });
    return rows;
  }

  function seed(done) {
    try { seedState(); } catch (e) { console.warn("Kurenai OS: the sample account could not be built.", e); }
    if (!KOS.mediadb || !KOS.mediadb.available()) { if (done) done(); return; }
    KOS.mediadb.bulkUpsert(mediaRows(), { source: "manual" }, function () { if (done) done(); });
  }

  KOS.sample = {
    /* runs once per Sample namespace; the real namespace never calls it */
    ensure: function (done) {
      if (!KOS.dataMode || KOS.dataMode.mode !== "sample" || (KOS.store.state.ui || {}).sampleSeeded) { if (done) done(false); return; }
      seed(function () { if (done) done(true); });
    }
  };
})();
