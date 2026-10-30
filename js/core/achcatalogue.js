/* Kurenai OS — core/achcatalogue.js
   The Badge Wall's catalogue (roadmap 5.16–5.17, docs/achievements-plan.md):
   the sets, every badge with the record it reads, and the titles.

   Every measure READS a record the app already keeps — nothing here tracks
   anything new. Where a badge in the plan had no evidence in the app, it is
   not registered; the plan's "Blocked" list says why. A badge whose content
   is not released (a Japanese stage still outlined, a Creatives unit with no
   lessons) reads `soon`: drawn dim, never progressing, until it ships.

   A badge has art when its id is in KOS_ACH_ART (assets/app/img/<art>.webp);
   until then the medallion is drawn by the page from the set's colour and
   the badge's glyph (never an SVG picture standing in for the art).        */
(function () {
  "use strict";
  var A = KOS.achievements, store = KOS.store;
  if (!A) return;
  function st() { return store.state; }
  function obj(v) { return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
  function life(ctx, k) { return ctx.life()[k] || 0; }
  function keys(o) { return Object.keys(obj(o)); }
  function isoOf(ts) { var d = new Date(ts); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function addDays(s, n) { return KOS.srs.addDays(s, n); }

  /* ================= the sets =================
     `area` groups the filter; `hue` is a token the page paints the panel
     and the uncast medallions with; `glyph` marks the set; `pano` the
     panorama's art id (null until it is made, batch 26). */
  var SETS = [
    { id: "app", name: "Time with KurenaiOS", area: "app", hue: "--crimson", glyph: "日", kicker: "The long view" },
    { id: "focus", name: "Focus", area: "productivity", hue: "--amber", glyph: "集", kicker: "Deep work" },
    { id: "streaks", name: "Streaks", area: "app", hue: "--gold", glyph: "連", kicker: "Day after day" },
    { id: "study", name: "Study", area: "study", hue: "--cs", glyph: "学", kicker: "CS, Maths and IT" },
    { id: "exams", name: "Exams & Deadlines", area: "study", hue: "--maths", glyph: "試", kicker: "Under the clock" },
    { id: "code", name: "Code", area: "study", hue: "--code", glyph: "碼", kicker: "C# and beyond" },
    { id: "ja", name: "Japanese", area: "study", hue: "--ja", glyph: "語", kicker: "Four skills" },
    { id: "mind", name: "Mind", area: "study", hue: "--mind", glyph: "心", kicker: "Ideas that last" },
    { id: "creatives", name: "Creatives", area: "study", hue: "--cr", glyph: "創", kicker: "Made, not claimed" },
    { id: "routines", name: "Routines and reviews", area: "productivity", hue: "--teal", glyph: "習", kicker: "The shape of a day" },
    { id: "organised", name: "Organised", area: "productivity", hue: "--teal", glyph: "整", kicker: "Plans kept" },
    { id: "goals", name: "Goals and Money", area: "productivity", hue: "--green", glyph: "標", kicker: "Targets met" },
    { id: "collection", name: "The Collection", area: "collection", hue: "--anime", glyph: "蒐", kicker: "Watched, read, played" },
    { id: "ink", name: "Pen, ink and files", area: "study", hue: "--bloom", glyph: "筆", kicker: "By hand" },
    { id: "kurenai", name: "Kurenai and the Governor", area: "app", hue: "--crimson", glyph: "紅", kicker: "Your seat" },
    /* the unit sets: the 153 badges made in 5.13's batches 11 and 21–25 */
    { id: "u-cs", name: "Computer Science units", area: "study", hue: "--cs", glyph: "算", kicker: "Each unit to Green", units: true },
    { id: "u-maths", name: "Maths sections", area: "study", hue: "--maths", glyph: "数", kicker: "Each section to Green", units: true },
    { id: "u-it", name: "IT units", area: "study", hue: "--it", glyph: "情", kicker: "Passed and submitted", units: true },
    { id: "u-code", name: "Code: the core path", area: "study", hue: "--code", glyph: "碼", kicker: "Units, stages, capstones", units: true },
    { id: "u-code-t", name: "Code: the tracks", area: "study", hue: "--code", glyph: "軌", kicker: "Parts, tracks, capstones", units: true },
    { id: "u-ja", name: "Japanese: the path", area: "study", hue: "--ja", glyph: "道", kicker: "At each checkpoint", units: true },
    { id: "u-mind", name: "Mind: the paths", area: "study", hue: "--mind", glyph: "径", kicker: "Units, paths, crossings", units: true },
    { id: "u-cr-art", name: "Creatives: Art", area: "study", hue: "--cr", glyph: "絵", kicker: "Each unit, the track", units: true },
    { id: "u-cr-design", name: "Creatives: Design", area: "study", hue: "--cr", glyph: "意", kicker: "Each unit, the track", units: true },
    { id: "u-cr-edit", name: "Creatives: Editing", area: "study", hue: "--cr", glyph: "編", kicker: "Each unit, the track", units: true },
    { id: "u-cr-write", name: "Creatives: Writing", area: "study", hue: "--cr", glyph: "文", kicker: "Each unit, the track", units: true }
  ];
  /* a set's panorama and a badge's picture are named by id (batches 26–27,
     tools/gen_ach_manifest.py); the page draws them only once imported */
  SETS.forEach(function (s, i) { s.order = i; s.pano = "app.ach.pano." + s.id; A.defineSet(s); });

  function reg(set, id, name, what, owners, tiers, measure, extra) {
    var d = Object.assign({ id: id, set: set, name: name, what: what, owners: owners, tiers: tiers, art: "app.ach." + id }, extra || {});
    if (typeof measure === "function") { if (measure.length >= 2) d.measure = measure; else d.v = measure; }
    A.register(d);
  }

  /* ---------------- shared async reads (once per evaluation) ---------------- */
  /* one pass over the vault: what the Collection's badges read */
  function vault(ctx, cb) {
    ctx.later("vault", function (done) {
      if (!KOS.mediadb || !KOS.mediadb.available()) { done(null); return; }
      KOS.mediadb.open(function (err, db) {
        if (err || !db) { done(null); return; }
        var out = { anime: 0, episodes: 0, owned: 0, books: 0, routes: 0, vn: 0, hours: 0, favourites: 0, anilist: 0, vndb: 0, steam: 0, seasonal: 0 };
        var SEASON = { WINTER: 0, SPRING: 3, SUMMER: 6, FALL: 9 };
        try {
          var rq = db.transaction("entries", "readonly").objectStore("entries").openCursor();
          rq.onsuccess = function (e) {
            var cur = e.target.result;
            if (!cur) { done(out); return; }
            try { tally(cur.value || {}); } catch (rowErr) { if (window.KOS_DEBUG_ACH) window.KOS_DEBUG_ACH(rowErr); }
            cur.continue();
          };
          rq.onerror = function () { done(null); };
        } catch (e2) { done(null); }
        function tally(v) {
            var pr = v.progress || {}, ex = v.externalIds || {}, extra = v.extra || {};
            var done2 = v.status === "completed";
            if (v.module === "anime") {
              out.episodes += pr.current || 0;
              if (done2) {
                out.anime++;
                /* finished in the season it aired: the journal's move to completed
                   falls inside that season's three months */
                if (extra.season && extra.seasonYear && SEASON[extra.season] != null) {
                  var from = new Date(extra.seasonYear, SEASON[extra.season], 1).getTime();
                  var to = new Date(extra.seasonYear, SEASON[extra.season] + 3, 1).getTime();
                  if ((v.journal || []).some(function (j) { return j[1] === "status" && j[3] === "completed" && j[0] >= from && j[0] < to; })) out.seasonal++;
                }
              }
            }
            if (v.module === "books") { if (done2) out.books++; if (v.physical && v.physical.volumes) out.owned += v.physical.volumes.length; }
            if (v.module === "vn") { out.routes += pr.current || 0; if (done2) out.vn++; }
            if (v.module === "game") out.hours += pr.current || 0;
            if (v.favourite) out.favourites++;
            if (ex.anilistId) out.anilist++;
            if (ex.vndbId) out.vndb++;
            if (ex.steamAppId) out.steam++;
        }
      });
    }, cb);
  }
  function vaultField(k) { return function (ctx, cb) { vault(ctx, function (v) { cb(v ? v[k] : null); }); }; }
  function money(ctx, cb) {
    ctx.later("money", function (done) {
      if (!KOS.money || !KOS.money.available()) { done(null); return; }
      KOS.money.range("1900-01-01", "2999-12-31", function (err, tx) { done(err ? null : tx || []); });
    }, cb);
  }
  function reviewCount(ctx, cb) {
    ctx.later("reviews", function (done) {
      if (!KOS.reviewLog || !KOS.reviewLog.available()) { done(null); return; }
      KOS.reviewLog.count(function (err, n) { done(err ? null : n); });
    }, cb);
  }
  function inkDocs() { return KOS.ink && KOS.ink.allDocs ? KOS.ink.allDocs() : []; }
  function attempts() { return KOS.tracker && KOS.tracker.all ? KOS.tracker.all() : []; }
  function assessments() { return KOS.exams && KOS.exams.all ? KOS.exams.all() : []; }

  /* ================= Set 1 · Time with KurenaiOS ================= */
  reg("app", "regular", "Regular", "Days you did anything in the app — a session, a review, a tick", ["ledger"], [7, 30, 100, 365],
    function (ctx) { return life(ctx, "days"); }, { unit: "days", glyph: "日" });
  reg("app", "year-one", "One year in", "A year since your first day in KurenaiOS", [], [365],
    function () { var c = +st().created; return c > 0 ? Math.floor((Date.now() - c) / 86400000) : null; }, { unit: "days", glyph: "年" });
  reg("app", "early-bird", "Early bird", "Study sessions started between 04:00 and 07:00", ["ledger"], [1, 10, 50],
    function (ctx) { return life(ctx, "early"); }, { unit: "sessions", glyph: "朝", title: { id: "early", name: "the Early Riser", tier: 3 } });
  reg("app", "night-owl", "Night owl", "Study sessions finished between 23:00 and 03:00", ["ledger"], [1, 10, 50],
    function (ctx) { return life(ctx, "late"); }, { unit: "sessions", glyph: "夜", title: { id: "owl", name: "Night Owl", tier: 3 } });
  reg("app", "witching", "The witching hour", "Something done in the app between 03:00 and 04:00", ["ledger"], [1],
    function (ctx) { return life(ctx, "witch"); }, { hidden: true, glyph: "丑" });
  reg("app", "first-light", "First light of the year", "A Focus session finished on 1 January", ["ledger", "focus"], [1],
    function (ctx) { return life(ctx, "jan1"); }, { hidden: true, glyph: "初" });

  /* ================= Set 2 · Focus ================= */
  reg("focus", "in-the-zone", "In the zone", "Completed Focus sessions", ["focus"], [10, 100, 500, 1000],
    function (ctx) { return life(ctx, "focus"); }, { unit: "sessions", glyph: "集" });
  reg("focus", "deep-hours", "Deep hours", "Hours of focus, in all", ["focus"], [10, 100, 500, 1000],
    function (ctx) { return Math.floor(life(ctx, "focusSecs") / 3600); }, { unit: "hours", glyph: "時" });
  reg("focus", "marathon", "Marathon", "One Focus session of this many hours", ["focus"], [2, 3, 4],
    function (ctx) { return Math.floor(life(ctx, "longest") / 360) / 10; }, { unit: "hours", glyph: "長" });
  reg("focus", "unbroken", "Unbroken", "Focus sessions completed without a pause", ["focus"], [10, 50, 200],
    function (ctx) { return life(ctx, "focusClean"); }, { unit: "sessions", glyph: "貫" });
  reg("focus", "full-day", "Full day", "Hours of focus in one day", ["focus"], [4, 6, 8],
    function (ctx) { return Math.floor(life(ctx, "bestDay") / 360) / 10; }, { unit: "hours", glyph: "満" });
  reg("focus", "change-of-subject", "Change of subject", "A Focus session switched to another subject mid-way", ["focus"], [1],
    function (ctx) { return life(ctx, "switched"); }, { glyph: "転" });

  /* ================= Set 3 · Streaks ================= */
  reg("streaks", "kept-going", "Kept going", "Your study streak at its longest", ["ledger"], [7, 30, 100, 365],
    function () { return KOS.sessions.streaks().best || 0; }, { unit: "days", glyph: "連", title: { id: "unbroken", name: "the Unbroken", tier: 3 } });
  reg("streaks", "rest-is-work", "Rest is work too", "A rest streak (a day of leisure logged) this long", ["ledger"], [7, 30],
    function () { return KOS.sessions.streaks().rest || 0; }, { unit: "days", glyph: "休" });
  /* Mon–Sun weeks whose every day has study AND a completed routine — read
     from the ledger the app still holds */
  reg("streaks", "perfect-week", "Perfect week", "Weeks with study and a completed routine every day", ["ledger", "routines"], [1, 4, 12],
    function (ctx) {
      var sc = ctx.scan(), days = Object.keys(sc.studyDays).sort(), seen = {}, n = 0;
      days.forEach(function (d) {
        var dt = new Date(d + "T12:00:00"), mon = addDays(d, -((dt.getDay() + 6) % 7));
        if (seen[mon]) return; seen[mon] = true;
        var ok = true;
        for (var i = 0; i < 7; i++) { var x = addDays(mon, i); if (!sc.studyDays[x] || !sc.routineDays[x]) { ok = false; break; } }
        if (ok) n++;
      });
      return n;
    }, { unit: "weeks", glyph: "週" });

  /* ================= Set 4 · Study ================= */
  function leafKeys(sid) {
    var out = [];
    (sid ? [sid] : KOS.subjects.ids("exam")).forEach(function (s) { (KOS.hub.LEAVES[s] || []).forEach(function (l) { out.push([s, l.ref, l]); }); });
    return out;
  }
  function isGreen(s, ref) { var r = KOS.rag && KOS.rag.effective ? KOS.rag.effective(s, ref) : null; return !!(r && r.band === "g"); }
  reg("study", "into-the-green", "Into the green", "Topics at Green across CS, Maths and IT", ["study"], [10, 50, 100, "all"],
    function (ctx) { return ctx.once("green", function () { return leafKeys().filter(function (k) { return isGreen(k[0], k[1]); }).length; }); },
    { unit: "topics", glyph: "緑", total: function () { return leafKeys().length; }, title: { id: "scholar", name: "Master of the Spine", tier: 4 } });
  reg("study", "card-sharp", "Card sharp", "Flashcard reviews", ["study"], [100, 1000, 10000, 50000],
    function (ctx) { return life(ctx, "cards"); }, { unit: "reviews", glyph: "札" });
  reg("study", "steady-memory", "Steady memory", "Months at 90% recall or better, over 200 reviews", ["study"], [1, 3, 6],
    function (ctx) { var r = ctx.life().months; return Object.keys(r).filter(function (m) { return r[m].monthCards >= 200 && r[m].monthRecall >= 90; }).length; },
    { unit: "months", glyph: "憶" });
  reg("study", "leech-hunter", "Leech hunter", "Cards set aside by lapses and brought back from Rework", ["study"], [5, 25],
    function () { var s = st().srs || {}; return Object.keys(s).filter(function (k) { return s[k] && s[k].leechBase != null; }).length; },
    { unit: "cards", glyph: "蛭" });
  reg("study", "quiz-runner", "Quiz runner", "Quiz questions answered", ["study"], [100, 500, 2000],
    function (ctx) { return life(ctx, "quizQ"); }, { unit: "questions", glyph: "問" });
  reg("study", "paper-trail", "Paper trail", "Papers and exams logged in Exams & Papers", ["exams"], [1, 10, 30, 60],
    function () { return attempts().length; }, { unit: "papers", glyph: "紙" });
  reg("study", "second-attempt", "Second attempt", "Redo items you got right on review", ["study", "exams"], [10, 50],
    function () { var s = st().srs || {}; return Object.keys(s).filter(function (k) { return k.indexOf("x:") === 0 && s[k] && s[k].lastRating >= 3; }).length; },
    { unit: "items", glyph: "再" });
  reg("study", "margin-notes", "Notes in the margin", "Quick notes filed on topics", ["study"], [10, 50],
    function () {
      var n = 0;
      (function walk(x) {
        if (Array.isArray(x)) x.forEach(walk);
        else if (x && typeof x === "object") { if (x.src === "quick-note") n++; Object.keys(x).forEach(function (k) { walk(x[k]); }); }
      })(st().edits && st().edits.topics);
      return n;
    }, { unit: "notes", glyph: "記" });
  function labIds() { return (KOS.governor.catalog() || []).filter(function (i) { return i.kind === "lab"; }).map(function (i) { return i.id; }); }
  reg("study", "lab-keys", "Lab keys", "Labs and simulations unlocked", ["governor"], [5, "all"],
    function () { var owned = (st().governor && st().governor.owned) || []; return labIds().filter(function (id) { return owned.indexOf(id) >= 0; }).length; },
    { unit: "labs", glyph: "鍵", total: function () { return labIds().length; } });
  /* every leaf of a paper's full Companion with a practice set logged (an
     attempt from `set-<ref>`, invariant 127) */
  function deepPapers() { return Object.keys((window.KOS_EXAMS && window.KOS_EXAMS.deep) || {}); }
  reg("study", "companion-complete", "Companion complete", "An Exam Companion with every topic's practice set logged", ["exams"], [1, "all"],
    function () {
      var setsDone = {};
      attempts().forEach(function (e) {
        var ref = e.source && e.source.kind === "custom-mock" && /:set-(.+)$/.exec(String(e.source.ref || ""));
        if (ref) setsDone[ref[1]] = true;
      });
      return deepPapers().filter(function (pid) {
        var leaves = Object.keys((window.KOS_EXAMS.deep[pid] || {}).leaves || {});
        return leaves.length && leaves.every(function (r) { return setsDone[r]; });
      }).length;
    }, { unit: "companions", glyph: "伴", total: function () { return deepPapers().length; } });
  reg("study", "tuned-to-you", "Tuned to you", "1,000 reviews in the log: enough to fit FSRS to your memory", ["study"], [1000],
    function (ctx, cb) { reviewCount(ctx, cb); }, { unit: "reviews", glyph: "調" });

  /* ================= Set 5 · Exams & Deadlines ================= */
  function pctOf(r) { return r && r.max > 0 ? 100 * r.marks / r.max : null; }
  function targetPct(a) {
    var rows = KOS.exams.boundsFor ? KOS.exams.boundsFor(a) : [];
    if (a.target && rows && rows.length) {
      var cuts = rows.map(function (r) { return r.marks && r.marks[a.target] != null ? 100 * r.marks[a.target] / r.max : null; }).filter(function (v) { return v != null; });
      if (cuts.length) return Math.max.apply(null, cuts);
    }
    return 70;
  }
  reg("exams", "dress-rehearsal", "Dress rehearsal", "Mocks sat with a result logged", ["exams"], [1, 5, 10],
    function () { return assessments().filter(function (a) { return a.tier === "mock" && a.result; }).length; }, { unit: "mocks", glyph: "演" });
  reg("exams", "on-target", "On target", "Results at or above their target", ["exams"], [1, 5],
    function () { return assessments().filter(function (a) { var p = pctOf(a.result); return p != null && (a.tier === "mock" || a.tier === "real_exam") && p >= targetPct(a); }).length; },
    { unit: "results", glyph: "的" });
  reg("exams", "ready", "Ready", "An assessment reading Ready before its day", ["exams", "study"], [1],
    function (ctx) {
      return assessments().some(function (a) {
        if ((a.tier !== "real_exam" && a.tier !== "mock") || !a.date || a.date < ctx.today) return false;
        var r = KOS.exams.readiness(a); return !!(r && r.band && r.band.band === "ready");
      }) ? 1 : 0;
    }, { glyph: "備" });
  /* a series (real exams no more than 28 days apart) that has ended with a
     result logged for every exam in it */
  reg("exams", "survived-season", "Survived the season", "An exam season over, with every exam's result logged", ["exams"], [1],
    function (ctx) {
      var reals = assessments().filter(function (a) { return a.tier === "real_exam" && a.date; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
      var series = [], cur = null;
      reals.forEach(function (a) {
        if (!cur || KOS.srs.daysBetween(cur[cur.length - 1].date, a.date) > 28) { cur = []; series.push(cur); }
        cur.push(a);
      });
      return series.filter(function (s) { return s[s.length - 1].date < ctx.today && s.every(function (a) { return !!a.result; }); }).length;
    }, { glyph: "越" });
  reg("exams", "ahead-of-time", "Ahead of time", "Assignments finished a day or more before they were due", ["organise"], [5, 20],
    function () {
      return KOS.assignments.all().filter(function (r) {
        var at = r.completedAt || r.submittedAt;
        return r.status === "complete" && at && r.due && isoOf(at) <= addDays(r.due, -1);
      }).length;
    }, { unit: "assignments", glyph: "早", title: { id: "timekeeper", name: "Timekeeper", tier: 2 } });
  reg("exams", "under-the-clock", "Under the clock", "Papers logged as timed attempts", ["exams"], [1, 10, 30],
    function () { return attempts().filter(function (e) { return e.timed; }).length; }, { unit: "papers", glyph: "刻" });
  /* calibration (invariant 123): the guess before marking within 5
     percentage points of the mark */
  reg("exams", "know-thyself", "Know thyself", "Papers where your prediction was within 5 points of the mark", ["exams"], [1, 5, 15],
    function () {
      return attempts().filter(function (e) {
        var mx = e.max || e.outOf; return e.predicted != null && e.marks != null && mx > 0 && Math.abs(100 * (e.predicted - e.marks) / mx) <= 5;
      }).length;
    }, { unit: "papers", glyph: "己", title: { id: "clear-eyed", name: "the Clear-Eyed", tier: 3 } });

  /* ================= Set 6 · Code ================= */
  function code() { return st().code || {}; }
  function codeProjects() { return KOS.code && KOS.code.projects ? KOS.code.projects() : []; }
  function projectDone(p) { var r = obj(obj(code().projects)[p.id]); return p.milestones.length && p.milestones.every(function (m) { return obj(r.passed)[m.id]; }); }
  function reportsOf(id) { var r = obj(obj(code().projects)[id]); return keys(r.reports).map(function (k) { return r.reports[k]; }); }
  function mutantProjects() { return codeProjects().filter(function (p) { return p.milestones.some(function (m) { return (m.checks || []).some(function (c) { return c.type === "mutants"; }); }); }); }
  reg("code", "green-tests", "Green tests", "Code tasks passed", ["code"], [20, 100, 300],
    function () { var t = obj(code().tasks); return keys(t).filter(function (id) { return t[id].passAt; }).length; },
    { unit: "tasks", glyph: "緑", title: { id: "debugger", name: "Debugger", tier: 3 } });
  reg("code", "recall", "Recall", "Retrievals proven", ["code"], [25, 100, 500],
    function (ctx) { return life(ctx, "codeRecall"); }, { unit: "retrievals", glyph: "復" });
  reg("code", "kata", "Kata", "Katas done", ["code"], [10, 50],
    function () { return keys(code().katas).length; }, { unit: "katas", glyph: "型" });
  reg("code", "shipped", "Shipped", "Rider projects with every milestone passed", ["code"], [1, 5, "all"],
    function () { return codeProjects().filter(projectDone).length; },
    { unit: "projects", glyph: "船", total: function () { return codeProjects().length; }, title: { id: "architect", name: "Architect", tier: 3 } });
  reg("code", "verified", "Verified", "Reports checked in GitHub Actions (◆ CI-verified)", ["code"], [1, 10],
    function () { return codeProjects().reduce(function (n, p) { return n + reportsOf(p.id).filter(function (r) { return r.level === "ci" && !r.practice; }).length; }, 0); },
    { unit: "reports", glyph: "証" });
  reg("code", "no-hints", "No hints", "Tasks passed with no hint and no answer seen", ["code"], [25, 100],
    function () { var t = obj(code().tasks); return keys(t).filter(function (id) { return t[id].passAt && !t[id].hints && !t[id].seen; }).length; },
    { unit: "tasks", glyph: "独" });
  /* every planted bug caught: a report whose mutants check says "caught N of N" */
  reg("code", "bug-catcher", "Bug catcher", "Projects whose tests caught every planted bug", ["code"], [1, "all"],
    function () {
      return mutantProjects().filter(function (p) {
        return reportsOf(p.id).some(function (r) {
          return !r.practice && (r.milestones || []).some(function (m) {
            return (m.checks || []).some(function (c) { var x = c.type === "mutants" && /caught (\d+) of (\d+)/.exec(c.note || ""); return !!(x && +x[1] === +x[2] && +x[2] > 0); });
          });
        });
      }).length;
    }, { unit: "projects", glyph: "虫", total: function () { return mutantProjects().length; } });
  /* the Daily 20 is computed, never stored (invariant 108): a day counts
     when a new Code task was passed on it — the workout's own evidence */
  reg("code", "daily-20", "Daily 20", "Days you passed a new Code task", ["code"], [7, 30, 100],
    function (ctx) { return life(ctx, "codeDays"); }, { unit: "days", glyph: "廿" });

  /* ================= Set 7 · Japanese ================= */
  function facets() { return obj(st().japanese && st().japanese.facets); }
  var HOLD = 7;
  function facetCount(test) {
    var f = facets(), n = 0;
    Object.keys(f).forEach(function (k) {
      var i = k.lastIndexOf("|"), item = k.slice(0, i), skill = k.slice(i + 1), x = f[k];
      if (x && x.reps > 0 && test(item, skill, x)) n++;
    });
    return n;
  }
  var HIRA = /^k:[あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん]$/;
  var KATA = /^k:[アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン]$/;
  var STABLE = (KOS.jaSrs && KOS.jaSrs.STABLE) || 21;
  reg("ja", "hiragana", "Hiragana", "All 46 hiragana read and held three weeks", ["ja"], [46],
    function () { return facetCount(function (it, sk, x) { return sk === "R" && HIRA.test(it) && x.s >= STABLE; }); }, { unit: "kana", glyph: "ひ" });
  reg("ja", "katakana", "Katakana", "All 46 katakana read and held three weeks", ["ja"], [46],
    function () { return facetCount(function (it, sk, x) { return sk === "R" && KATA.test(it) && x.s >= STABLE; }); }, { unit: "kana", glyph: "カ" });
  reg("ja", "words", "Words", "Words you read, held three weeks", ["ja"], [100, 500, 1000, 2000],
    function () { return KOS.ja.skills().words.R || 0; }, { unit: "words", glyph: "語", title: { id: "polyglot", name: "Polyglot", tier: 3 } });
  reg("ja", "ear", "Ear", "Listening facets holding a week", ["ja"], [100, 1000],
    function () { return facetCount(function (it, sk, x) { return sk === "L" && x.s >= HOLD; }); }, { unit: "facets", glyph: "耳" });
  reg("ja", "brush", "Brush", "Kana written by hand, holding a week", ["ja"], [50, 500],
    function () { return facetCount(function (it, sk, x) { return sk === "W" && it.indexOf("k:") === 0 && x.s >= HOLD; }); }, { unit: "kana", glyph: "書" });
  reg("ja", "voice", "Voice", "Speaking facets holding a week", ["ja"], [50, 500],
    function () { return facetCount(function (it, sk, x) { return sk === "S" && x.s >= HOLD; }); }, { unit: "facets", glyph: "声" });
  reg("ja", "checkpoint", "Checkpoint", "Japanese checkpoints passed", ["ja"], [1, 5, 10],
    function () { var c = obj(st().japanese && st().japanese.checkpoints); return keys(c).filter(function (k) { return c[k] && c[k].passAt; }).length; },
    { unit: "checkpoints", glyph: "関" });
  reg("ja", "immersion", "Immersion", "Hours of Japanese reading and listening logged", ["ja"], [10, 50, 200],
    function () {
      var inp = obj(st().japanese && st().japanese.input), m = 0;
      keys(inp).forEach(function (d) { ["read", "listen", "raw", "jpSub"].forEach(function (k) { m += +inp[d][k] || 0; }); });
      return Math.floor(m / 6) / 10;
    }, { unit: "hours", glyph: "浸" });
  reg("ja", "sentence-miner", "Sentence miner", "Lines saved from your own media", ["ja"], [10, 50, 200],
    function () { return keys(st().japanese && st().japanese.mined).length; }, { unit: "lines", glyph: "掘" });

  /* ================= Set 8 · Mind ================= */
  reg("mind", "evaluated", "Evaluated", "Concepts at the ladder's last rung, Evaluate", ["mind"], [5, 25, 75],
    function () { return KOS.mind.rungCounts()[3] || 0; }, { unit: "concepts", glyph: "評", title: { id: "philosopher", name: "Philosopher", tier: 3 } });
  reg("mind", "changed-my-mind", "Changed my mind", "Positions revised to a new answer", ["mind"], [1, 5, 20],
    function () { return KOS.mind.stats().changed || 0; }, { unit: "revisions", glyph: "翻" });
  reg("mind", "journal", "Journal", "Entries in the Mind Journal", ["mind"], [10, 100, 365],
    function () { return KOS.mindJournal && KOS.mindJournal.loaded && KOS.mindJournal.loaded() ? KOS.mindJournal.counts().all : null; },
    { unit: "entries", glyph: "誌" });
  reg("mind", "big-questions", "Big Questions", "Weeks of a Big Question closed with your answer", ["mind"], [4, 12, 26],
    function () { var b = obj(st().mind && st().mind.bq); return keys(b).filter(function (w) { return b[w] && b[w].closedAt; }).length; },
    { unit: "weeks", glyph: "問" });

  /* ================= Set 9 · Creatives ================= */
  function works() { var w = obj(st().creatives && st().creatives.works); return keys(w).map(function (k) { return w[k]; }); }
  function crProjectUnits() {
    var out = [];
    (window.KOS_CR ? window.KOS_CR.TRACKS : []).forEach(function (t) { t.units.forEach(function (u) { var U = window.KOS_CR.UNITS[u]; if (U && U.project && U.lessons.length) out.push(u); }); });
    return out;
  }
  reg("creatives", "studies", "Studies", "Micro-studies passed", ["creatives"], [10, 50, 200],
    function () { return keys(st().creatives && st().creatives.paid).filter(function (k) { return k.indexOf("study:") === 0; }).length; }, { unit: "studies", glyph: "創" });
  reg("creatives", "wordsmith", "Wordsmith", "Words written at the Writing Desk", ["creatives"], [10000, 50000, 100000, 250000],
    function () { return works().reduce(function (n, w) { return w.track === "write" ? n + (+w.words || 0) : n; }, 0); },
    { unit: "words", glyph: "文", title: { id: "wordsmith", name: "Wordsmith", tier: 3 } });
  reg("creatives", "sketchbook", "Sketchbook", "Pages saved from the sketchbook", ["creatives"], [10, 100, 500],
    function () { return works().filter(function (w) { return w.track === "art" && w.kind === "image"; }).length; }, { unit: "pages", glyph: "画" });
  reg("creatives", "drills", "Drills", "Days with a Graphic design drill", ["creatives"], [10, 50, 150],
    function (ctx) { return life(ctx, "crDrillDays"); }, { unit: "days", glyph: "練" });
  reg("creatives", "portfolio", "Portfolio", "Pieces promoted to the Portfolio", ["creatives"], [1, 10, 30],
    function () { return works().filter(function (w) { return w.portfolio; }).length; }, { unit: "pieces", glyph: "選" });
  reg("creatives", "momentum", "Momentum", "Studies done with Momentum on", ["creatives"], [5, 25],
    function () { return works().filter(function (w) { return w.momentum; }).length; }, { unit: "studies", glyph: "勢" });
  reg("creatives", "projects", "Projects", "Unit projects finished", ["creatives"], [1, 5, "all"],
    function () { return crProjectUnits().filter(function (u) { var s = KOS.creatives.projectState(u); return s && s.done; }).length; },
    { unit: "projects", glyph: "作", total: function () { return crProjectUnits().length; } });

  /* ================= Set 10 · Routines and reviews ================= */
  /* the Daily Review keeps 60 days of its own state (core/dayreview.js), so
     these count the reviews finished in the last 60 days */
  function reviewsDone(slot) {
    var d = obj(st().dayReview && st().dayReview.days);
    return keys(d).filter(function (day) { return d[day] && d[day][slot] && d[day][slot].state === "done"; }).length;
  }
  function habits() { return KOS.routines && KOS.routines.all ? KOS.routines.all({ kind: "habit" }) : []; }
  reg("routines", "routine", "Routine", "Routines completed", ["routines"], [30, 100, 365, 1000],
    function (ctx) { return life(ctx, "routine"); }, { unit: "routines", glyph: "習", title: { id: "steadfast", name: "the Steadfast", tier: 3 } });
  reg("routines", "morning-person", "Morning person", "Morning Reviews finished in the last 60 days", ["routines"], [7, 21, 45],
    function () { return reviewsDone("morning"); }, { unit: "reviews", glyph: "暁" });
  reg("routines", "wind-down", "Wind down", "Evening Reviews finished in the last 60 days", ["routines"], [7, 21, 45],
    function () { return reviewsDone("evening"); }, { unit: "reviews", glyph: "宵" });
  reg("routines", "habit-former", "Habit former", "Habits kept 30 days in a row", ["routines"], [1, 5],
    function () { return habits().filter(function (h) { return KOS.routines.best(h.id) >= 30; }).length; }, { unit: "habits", glyph: "慣" });
  reg("routines", "every-time", "Every time", "A several-times-a-day habit kept a whole week", ["routines"], [1],
    function () { return habits().filter(function (h) { return h.times && h.times.length && KOS.routines.best(h.id) >= 7; }).length; }, { glyph: "毎" });

  /* ================= Set 11 · Organised ================= */
  function personalRows() { return KOS.pacing ? KOS.pacing.entries().filter(function (e) { return e.source === "personal"; }) : []; }
  reg("organised", "done-and-dusted", "Done and dusted", "Reminders ticked off", ["organise", "routines"], [50, 250, 1000],
    function (ctx) { var items = KOS.reminders.all().filter(function (r) { return r.done; }).length; return Math.max(items, life(ctx, "reminders")); },
    { unit: "reminders", glyph: "済" });
  reg("organised", "handed-in", "Handed in", "Assignments completed", ["organise"], [5, 25, 100],
    function () { return KOS.assignments.all().filter(function (r) { return r.status === "complete"; }).length; }, { unit: "assignments", glyph: "提" });
  reg("organised", "on-the-plan", "On the plan", "Plan rows ticked", ["organise"], [25, 100, 300],
    function () { return KOS.pacing ? KOS.pacing.entries().filter(function (e) { return e.done; }).length : null; }, { unit: "rows", glyph: "計" });
  reg("organised", "caught-up", "Caught up", "Plan weeks with every personal row ticked by the week's end", ["organise"], [1, 10],
    function (ctx) {
      var byWeek = {};
      personalRows().forEach(function (e) { (byWeek[e.wb] = byWeek[e.wb] || []).push(e); });
      return Object.keys(byWeek).filter(function (wb) {
        var end = KOS.pacing.weekEnd(wb);
        return end < ctx.today && byWeek[wb].every(function (e) { return e.done && e.doneAt && isoOf(e.doneAt) <= end; });
      }).length;
    }, { unit: "weeks", glyph: "追" });
  /* a half-term: a run of school weeks with no gap; in step when every week
     has a personal row and no subject is behind or unplanned */
  reg("organised", "in-step", "In step", "A whole half-term with your plan and class aligned, and no week unplanned", ["organise", "study"], [1],
    function (ctx) {
      if (!KOS.pacing) return null;
      var ws = KOS.pacing.weeks(), runs = [], cur = null, prevWb = null;
      ws.forEach(function (w) {
        if (!w.schoolWk) { cur = null; prevWb = null; return; }
        if (!cur || (prevWb && KOS.srs.daysBetween(prevWb, w.wb) > 7)) { cur = []; runs.push(cur); }
        cur.push(w); prevWb = w.wb;
      });
      var personal = {};
      personalRows().forEach(function (e) { personal[e.wb] = true; });
      return runs.filter(function (run) {
        if (run.length < 3 || KOS.pacing.weekEnd(run[run.length - 1].wb) >= ctx.today) return false;
        return run.every(function (w) {
          if (!personal[w.wb]) return false;
          return KOS.subjects.ids("exam").every(function (sid) { var al = KOS.pacing.alignment(w.wb, sid); return !al.evidence || (!al.behind && !al.unplanned); });
        });
      }).length;
    }, { glyph: "歩" });
  reg("organised", "synced", "Synced", "Google Calendar, Google Tasks or Todoist switched on", ["organise"], [1],
    function () { var v = KOS.ext && KOS.ext.view ? KOS.ext.view() : null; return v && ((v.google && v.google.on) || (v.todoist && v.todoist.on)) ? 1 : 0; }, { glyph: "繋" });

  /* ================= Set 12 · Goals and Money ================= */
  reg("goals", "goal-getter", "Goal getter", "Goals reached", ["goals"], [1, 10, 50],
    function () { var l = obj(st().goals && st().goals.completionLedger); return keys(l).filter(function (k) { return l[k].payout !== "none"; }).length; }, { unit: "goals", glyph: "標" });
  reg("goals", "every-period", "Every week", "Repeating goals met four periods in a row", ["goals"], [1, 5],
    function () {
      var items = (st().goals && st().goals.items) || [];
      return items.filter(function (g) {
        if (!g.repeat) return false;
        var ks = keys(g.outcomes).sort(), run = 0, top = 0;
        ks.forEach(function (k) { if (g.outcomes[k].met) { run++; top = Math.max(top, run); } else run = 0; });
        return top >= 4;
      }).length;
    }, { unit: "goals", glyph: "毎" });
  reg("goals", "bookkeeper", "Bookkeeper", "Transactions logged in Money", ["money"], [50, 250, 1000],
    function (ctx, cb) { money(ctx, function (tx) { cb(tx ? tx.filter(function (t) { return !t.mirror && String(t.syncId || t.id || "").indexOf("wl:") !== 0; }).length : null); }); },
    { unit: "transactions", glyph: "帳" });
  /* a month (Money's own period) that has ended, with spending in it, and no
     budgeted category over its budget (budgets as they are set now) */
  reg("goals", "under-budget", "Under budget", "Months with every budget kept", ["money"], [1, 3, 6, 12],
    function (ctx, cb) {
      money(ctx, function (tx) {
        if (!tx) { cb(null); return; }
        var M = KOS.money, budgets = {}, by = {};
        M.categories().forEach(function (c) { var b = M.budgetOf(c); if (b != null) budgets[c.id] = b; });
        if (!Object.keys(budgets).length) { cb(0); return; }
        var curKey = M.periodKey(ctx.today);
        tx.forEach(function (t) { var k = M.periodKey(t.date); if (k < curKey) (by[k] = by[k] || []).push(t); });
        cb(Object.keys(by).filter(function (k) {
          var tl = M.tally(by[k]);
          return tl.outgoings > 0 && Object.keys(budgets).every(function (cid) { var c = tl.byCat[cid]; return !c || c.net <= budgets[cid]; });
        }).length);
      });
    }, { unit: "months", glyph: "倹", title: { id: "treasurer", name: "Treasurer", tier: 4 } });
  reg("goals", "saver", "Saver", "Pots filled to their target", ["money"], [1, 5],
    function (ctx, cb) {
      if (!KOS.money || !KOS.money.available()) { cb(null); return; }
      var pots = KOS.money.pots().filter(function (p) { return p.target > 0; });
      if (!pots.length) { cb(0); return; }
      KOS.money.potBalances(function (err, bal) { cb(err ? null : pots.filter(function (p) { return (bal[p.id] || 0) >= p.target; }).length); });
    }, { unit: "pots", glyph: "貯" });
  reg("goals", "wish-granted", "Wish granted", "Wishlist items bought through the planner", ["collection", "money"], [1, 10],
    function () { var w = st().wishlist; return w && Array.isArray(w.items) ? w.items.filter(function (it) { return it.status === "purchased"; }).length : 0; }, { unit: "items", glyph: "願" });

  /* ================= Set 13 · The Collection ================= */
  reg("collection", "binge", "Binge", "Anime completed", ["collection"], [10, 50, 100, 250], vaultField("anime"), { unit: "series", glyph: "映" });
  reg("collection", "episodes", "Episodes", "Episodes watched", ["collection"], [500, 2000, 5000], vaultField("episodes"), { unit: "episodes", glyph: "話" });
  reg("collection", "bookshelf", "Bookshelf", "Physical volumes on your shelf", ["collection"], [10, 50, 100, 250], vaultField("owned"),
    { unit: "volumes", glyph: "棚", title: { id: "bookworm", name: "Bookworm", tier: 3 } });
  reg("collection", "reader", "Reader", "Books and manga completed", ["collection"], [10, 50, 100], vaultField("books"), { unit: "titles", glyph: "読" });
  reg("collection", "route-master", "Route master", "Visual-novel routes cleared", ["collection"], [10, 50], vaultField("routes"), { unit: "routes", glyph: "路" });
  reg("collection", "visual-novels", "Visual novels", "Visual novels completed", ["collection"], [5, 25, 50], vaultField("vn"), { unit: "novels", glyph: "綴" });
  reg("collection", "player", "Player", "Hours of games played", ["collection"], [100, 500, 1000], vaultField("hours"), { unit: "hours", glyph: "遊" });
  reg("collection", "the-shrine", "The Shrine", "Titles enshrined as favourites", ["collection"], [10, 25, 50], vaultField("favourites"), { unit: "titles", glyph: "祠" });
  reg("collection", "mirror", "Mirror", "Your AniList lists mirrored into the Collection", ["collection"], [1],
    function (ctx, cb) { vault(ctx, function (v) { cb(v ? (v.anilist > 0 ? 1 : 0) : null); }); }, { glyph: "鏡" });
  reg("collection", "backlog-clearer", "Backlog clearer", "Your Steam library imported or VNDB connected", ["collection"], [1],
    function (ctx, cb) { vault(ctx, function (v) { cb(v ? (v.steam > 0 || v.vndb > 0 ? 1 : 0) : null); }); }, { glyph: "積" });
  reg("collection", "airing", "In season", "Shows finished in the season they aired", ["collection"], [1, 10], vaultField("seasonal"), { unit: "shows", glyph: "季" });

  /* ================= Set 14 · Pen, ink and files ================= */
  reg("ink", "handwritten", "Handwritten", "Pages written by hand", ["ink"], [10, 100, 500],
    function () { return inkDocs().reduce(function (n, d) { var w = KOS.ink.written(d.key); return n + (w ? w.n : 0); }, 0); }, { unit: "pages", glyph: "筆" });
  reg("ink", "marked", "Marked", "Past papers written and marked in the PDF viewer", ["ink", "exams"], [1, 10, 30],
    function () { return inkDocs().filter(function (d) { return d.key.indexOf("paper:") === 0 && d.logged; }).length; }, { unit: "papers", glyph: "採" });
  reg("ink", "write-it-out", "Write it out", "Blurts, worked examples and diagrams drilled by hand", ["ink"], [10, 50, 200],
    function () { return inkDocs().filter(function (d) { return /^(drill|blurt):/.test(d.key) && KOS.ink.written(d.key); }).length; }, { unit: "drills", glyph: "練" });
  /* figures, formulas and PDF regions clipped onto a topic's notebook pages */
  reg("ink", "clipper", "Clipper", "Figures and PDF regions clipped into topic notebooks", ["ink"], [10, 50],
    function (ctx, cb) {
      var docs = inkDocs().filter(function (d) { return d.key.indexOf("topic:") === 0 && d.pages && d.pages.length; });
      if (!docs.length) { cb(0); return; }
      var n = 0, left = docs.length;
      docs.forEach(function (d) {
        KOS.ink.listPages(d.key, function (err, pages) {
          (pages || []).forEach(function (p) { (p.items || []).forEach(function (it) { if (it && it.clip) n++; }); });
          if (--left === 0) cb(n);
        });
      });
    }, { unit: "clips", glyph: "切" });
  reg("ink", "library", "Library", "Files in Files", ["files"], [25, 100, 500],
    function () { return KOS.files && KOS.files.all ? KOS.files.all().length : null; }, { unit: "files", glyph: "庫", title: { id: "archivist", name: "Archivist", tier: 3 } });

  /* ================= Set 15 · Kurenai and the Governor ================= */
  function tally() { return obj(st().assistant && st().assistant.tally); }
  function shopIds() { return (KOS.governor.catalog() || []).map(function (i) { return i.id; }); }
  reg("kurenai", "conversations", "Conversations", "Days you talked with Kurenai (the last 400 days)", ["assistant"], [10, 50, 200],
    function () { var t = tally(); return keys(t).filter(function (d) { return t[d] && t[d].c > 0; }).length; }, { unit: "days", glyph: "話" });
  reg("kurenai", "on-a-schedule", "On a schedule", "Scheduled messages Kurenai sent", ["assistant"], [10, 100],
    function () { var t = tally(); return keys(t).reduce(function (n, d) { return n + (+t[d].s || 0); }, 0); }, { unit: "messages", glyph: "定" });
  reg("kurenai", "week-by-week", "Week by week", "Weekly reports saved", ["reports"], [4, 26, 52],
    function (ctx, cb) {
      if (!KOS.reportStore || !KOS.reportStore.list) { cb(null); return; }
      KOS.reportStore.list("week", function (err, l) { cb(err ? null : (l || []).length); });
    }, { unit: "reports", glyph: "録" });
  reg("kurenai", "gold", "Gold", "Gold earned, in all", ["ledger"], [10000, 50000, 100000, 250000],
    function (ctx) { return life(ctx, "gold"); }, { unit: "gold", glyph: "金" });
  reg("kurenai", "level", "Level", "Your Governor level", ["ledger"], [10, 25, 50],
    function () { return KOS.governor.levelInfo((st().governor && st().governor.xp) || 0).level; }, { unit: "level", glyph: "級" });
  reg("kurenai", "collector", "Collector", "Items owned from the shop", ["governor"], [10, 50, "all"],
    function () { var owned = (st().governor && st().governor.owned) || []; return shopIds().filter(function (id) { return owned.indexOf(id) >= 0; }).length; },
    { unit: "items", glyph: "蔵", total: function () { return shopIds().length; }, title: { id: "collector", name: "Collector", tier: 3 } });
  /* Kurenai's outfits arrive with roadmap 5.13's shop pass (18.5) */
  reg("kurenai", "wardrobe", "Wardrobe", "Kurenai's outfits owned", ["governor"], [1, 4, "all"],
    function () {
      var outfits = (KOS.governor.catalog() || []).filter(function (i) { return i.kind === "outfit"; });
      if (!outfits.length) return null;
      var owned = (st().governor && st().governor.owned) || [];
      return outfits.filter(function (i) { return owned.indexOf(i.id) >= 0; }).length;
    }, { unit: "outfits", glyph: "衣", soonIf: function () { return !(KOS.governor.catalog() || []).some(function (i) { return i.kind === "outfit"; }); },
      total: function () { return (KOS.governor.catalog() || []).filter(function (i) { return i.kind === "outfit"; }).length || null; } });

  /* ================= the unit sets (art made: batches 11, 21–25) ================= */
  /* CS units and Maths sections: every leaf Green */
  function sectionLeaves(sid, sec) { return (KOS.hub.LEAVES[sid] || []).filter(function (l) { return l.section && l.section.ref === sec; }); }
  function unitGreen(sid, sec) {
    return function () { return sectionLeaves(sid, sec).filter(function (l) { return isGreen(sid, l.ref); }).length; };
  }
  ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8", "4.9", "4.10", "4.11", "4.12", "4.13"].forEach(function (sec) {
    var leaf = sectionLeaves("compsci", sec)[0], title = leaf ? leaf.section.title : sec;
    reg("u-cs", "cs-" + sec, title, "Every topic of " + sec + " at Green", ["study"], ["all"], unitGreen("compsci", sec),
      { unit: "topics", art: "app.badge.cs." + sec.replace(".", ""), total: function () { return sectionLeaves("compsci", sec).length; }, ref: sec });
  });
  ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "S1", "S2", "S3", "S4", "S5", "M6", "M7", "M8", "M9"].forEach(function (sec) {
    var leaf = sectionLeaves("maths", sec)[0], title = leaf ? leaf.section.title : sec;
    reg("u-maths", "maths-" + sec, title, "Every topic of " + sec + " at Green", ["study"], ["all"], unitGreen("maths", sec),
      { unit: "topics", art: "app.badge.maths." + sec.toLowerCase(), total: function () { return sectionLeaves("maths", sec).length; }, ref: sec });
  });
  function itDone(code) { return function () { var u = KOS.itUnits.get ? KOS.itUnits.get(code) : null; return u && u.status === "done" ? 1 : 0; }; }
  reg("u-it", "it-f201", "F201 Strategic management", "F201 passed", ["study"], [1], itDone("F201"), { art: "app.badge.it.f201", ref: "F201" });
  reg("u-it", "it-f206", "F206 The NEA", "F206, the NEA, submitted", ["study"], [1], itDone("F206"), { art: "app.badge.it.f206", ref: "F206" });

  /* Code: a unit's lessons Completed; a stage its units and capstone; a
     track its parts and capstone; a capstone passed */
  function codeUnitDone(ref) { var s = KOS.code.unitState(ref); return s.total && s.done >= s.total; }
  function capPassed(id) { var c = obj(code().capstones)[id]; return !!(c && c.passAt); }
  function codeUnitLessons(ref) { return function () { var s = KOS.code.unitState(ref); return s.total ? s.done : null; }; }
  function codeUnitTotal(ref) { return function () { return KOS.code.unitState(ref).total || null; }; }
  var CU = { U1: "Values, types and variables", U2: "Decisions and loops", U3: "Methods and scope", U4: "Collections", U5: "Text", U6: "Files and exceptions",
    B: "Your real toolkit", U7: "Classes and objects", U8: "Interfaces and inheritance", U9: "LINQ and generics", U10: "Testing and design", U11: "Async, events and I/O", U12: "Data structures and algorithms" };
  Object.keys(CU).forEach(function (u) {
    var u0 = KOS.code.unit(u);
    reg("u-code", "code-" + u.toLowerCase(), u0 ? u0.title : CU[u], "Every lesson of " + (u === "B" ? "Bridge B" : "unit " + u.slice(1)) + " Completed", ["code"], ["all"],
      codeUnitLessons(u), { unit: "lessons", art: "app.badge.code." + u.toLowerCase(), total: codeUnitTotal(u), ref: u });
  });
  (window.KOS_CODE ? window.KOS_CODE.STAGES : []).filter(function (s) { return typeof s.id === "number"; }).forEach(function (s) {
    var parts = s.units.length + (s.capstone ? 1 : 0);
    reg("u-code", "code-s" + s.id, "Stage " + s.id + ": " + s.title, "Every unit of stage " + s.id + " and its capstone", ["code"], [parts],
      function () { return s.units.filter(codeUnitDone).length + (s.capstone && capPassed(s.capstone) ? 1 : 0); },
      { unit: "parts", art: "app.badge.code.s" + s.id, gold: true });
  });
  ["C1", "C2", "C3", "C4"].forEach(function (c) {
    reg("u-code", "code-" + c.toLowerCase(), "Capstone " + c, "Capstone " + c + " passed", ["code"], [1], function () { return capPassed(c) ? 1 : 0; },
      { art: "app.badge.code." + c.toLowerCase() });
  });
  [["T1", ["T1A", "T1B", "T1C", "T1D", "T1E", "T1F"], "CT1", "Track T1: Data and the web"], ["T2", ["T2A", "T2B", "T2C", "T2D", "T2E"], "CT2", "Track T2: Desktop apps"]].forEach(function (t) {
    t[1].forEach(function (p) {
      var u0 = KOS.code.unit(p);
      reg("u-code-t", "code-" + p.toLowerCase(), u0 ? u0.title : p, "Every lesson of " + p + " Completed", ["code"], ["all"], codeUnitLessons(p),
        { unit: "lessons", art: "app.badge.code." + p.toLowerCase(), total: codeUnitTotal(p), ref: p });
    });
    reg("u-code-t", "code-" + t[2].toLowerCase(), "Capstone " + t[2], "Track " + t[0] + "'s capstone passed", ["code"], [1], function () { return capPassed(t[2]) ? 1 : 0; },
      { art: "app.badge.code." + t[2].toLowerCase() });
    reg("u-code-t", "code-" + t[0].toLowerCase(), t[3], "Every part of " + t[0] + " and its capstone", ["code"], [t[1].length + 1],
      function () { return t[1].filter(codeUnitDone).length + (capPassed(t[2]) ? 1 : 0); }, { unit: "parts", art: "app.badge.code." + t[0].toLowerCase(), gold: true });
  });

  /* Japanese: a unit at its checkpoint; a stage at all of its units' (stage
     1's six units F1–F6 are planned in docs/japanese-plan.md §3.1); the
     tracks are not built */
  function jaCp(id) { var c = obj(st().japanese && st().japanese.checkpoints)[id]; return !!(c && c.passAt); }
  function jaReleased(u) { return !!(window.KOS_JA && window.KOS_JA.CHECKPOINTS && window.KOS_JA.CHECKPOINTS["cp-" + u]); }
  [["H", "Hiragana", "s0h"], ["K", "Katakana", "s0k"]].forEach(function (u) {
    reg("u-ja", "ja-" + u[0].toLowerCase(), u[1], "The " + u[1].toLowerCase() + " checkpoint passed", ["ja"], [1], function () { return jaCp("cp-" + u[0]) ? 1 : 0; }, { art: "app.badge.ja." + u[2] });
  });
  reg("u-ja", "ja-s0", "Stage 0: The sounds and the kana", "Both kana checkpoints passed", ["ja"], [2], function () { return (jaCp("cp-H") ? 1 : 0) + (jaCp("cp-K") ? 1 : 0); },
    { unit: "checkpoints", art: "app.badge.ja.s0", gold: true });
  var JAF = { F1: "First conversations", F2: "Days and times", F3: "Out and about", F4: "Daily life", F5: "Likes and plans", F6: "Food and invitations" };
  Object.keys(JAF).forEach(function (u) {
    reg("u-ja", "ja-" + u.toLowerCase(), JAF[u], "Unit " + u + "'s checkpoint passed", ["ja"], [1], function () { return jaCp("cp-" + u) ? 1 : 0; },
      { art: "app.badge.ja." + u.toLowerCase(), soonIf: function () { return !jaReleased(u); } });
  });
  reg("u-ja", "ja-s1", "Stage 1: Foundations", "All six of stage 1's checkpoints passed", ["ja"], [6],
    function () { return Object.keys(JAF).filter(function (u) { return jaCp("cp-" + u); }).length; }, { unit: "checkpoints", art: "app.badge.ja.s1", gold: true });
  [["s2", "Stage 2"], ["s3", "Stage 3"], ["s4", "Stage 4"], ["s5", "Stage 5"], ["t-kanji", "Kanji track"], ["t-pitch", "Pitch accent track"],
    ["t-keigo", "Keigo track"], ["t-media", "Media track"], ["t-onomato", "Onomatopoeia track"]].forEach(function (x) {
    reg("u-ja", "ja-" + x[0], x[1], x[1] + " complete", ["ja"], [1], function () { return null; },
      { art: "app.badge.ja." + x[0], soon: true, gold: /^s/.test(x[0]) });
  });

  /* Mind: a path's planned lessons all finished; the headers their paths */
  function mindPath(pid) { return (window.KOS_MIND ? window.KOS_MIND.PATHS : []).filter(function (p) { return p.id === pid; })[0] || null; }
  function mindPathCounts(pid) {
    var p = mindPath(pid); if (!p || !p.units.length) return null;
    var n = 0, done = 0, rel = 0;
    p.units.forEach(function (u) { var s = KOS.mind.unitState(u.id); n += u.n; done += s.done; rel += s.released; });
    return { n: n, done: done, released: rel };
  }
  function mindReg(set, id, art, pid, name) {
    reg(set, id, name, "Every lesson of " + name + " finished", ["mind"], ["all"],
      function () { var c = mindPathCounts(pid); return c ? c.done : null; },
      { unit: "lessons", art: art, total: function () { var c = mindPathCounts(pid); return c ? c.n : null; },
        soonIf: function () { var c = mindPathCounts(pid); return !c || !c.released; } });
  }
  (window.KOS_MIND ? window.KOS_MIND.PATHS : []).forEach(function (p) {
    var art = "app.badge.mind." + (p.id === "F" ? "f" : p.id.toLowerCase());
    mindReg("u-mind", "mind-" + p.id.toLowerCase(), art, p.id, p.title || p.name || ("Path " + p.id));
  });
  [["psych", "Y", "Psychology"], ["phil", "P", "Philosophy"], ["cross", "X", "The crossings"]].forEach(function (h) {
    var pids = function () { return (window.KOS_MIND ? window.KOS_MIND.PATHS : []).filter(function (p) { return p.id.charAt(0) === h[1] && p.units.length; }).map(function (p) { return p.id; }); };
    reg("u-mind", "mind-" + h[0], h[2], "Every path of " + h[2].toLowerCase() + " finished", ["mind"], ["all"],
      function () { var done = 0; pids().forEach(function (pid) { var c = mindPathCounts(pid); if (c && c.done >= c.n) done++; }); return done; },
      { unit: "paths", art: "app.badge.mind." + h[0], gold: true, total: function () { return pids().length || null; },
        soonIf: function () { return !pids().some(function (pid) { var c = mindPathCounts(pid); return c && c.released; }); } });
  });

  /* Creatives: a unit's lessons Done and its project finished; a track
     every unit of it */
  function crUnitParts(u) {
    var U = window.KOS_CR && window.KOS_CR.UNITS[u];
    if (!U || !U.lessons.length) return null;
    var s = KOS.creatives.unitState(u), proj = U.project ? KOS.creatives.projectState(u) : null;
    return { done: s.done + (proj && proj.done ? 1 : 0), total: U.lessons.length + (U.project ? 1 : 0) };
  }
  var CRSET = { art: "u-cr-art", design: "u-cr-design", edit: "u-cr-edit", write: "u-cr-write" };
  var CRNUM = { art: "art", design: "design", edit: "edit", write: "write" };
  (window.KOS_CR ? window.KOS_CR.TRACKS : []).forEach(function (t) {
    t.units.forEach(function (u, i) {
      var U = window.KOS_CR.UNITS[u];
      reg(CRSET[t.id], "cr-" + u.toLowerCase(), (U && (U.title || U.name)) || u, "Every lesson of " + u + " and its project", ["creatives"], ["all"],
        function () { var c = crUnitParts(u); return c ? c.done : null; },
        { unit: "parts", art: "app.badge.cre." + CRNUM[t.id] + (i + 1), total: function () { var c = crUnitParts(u); return c ? c.total : null; },
          soonIf: function () { return !crUnitParts(u); } });
    });
    reg(CRSET[t.id], "cr-" + t.id, (t.title || t.name || t.id) + ": the track", "Every unit of the track", ["creatives"], [t.units.length],
      function () { return t.units.filter(function (u) { var c = crUnitParts(u); return c && c.done >= c.total; }).length; },
      { unit: "units", art: "app.badge.cre." + t.id, gold: true });
  });

  /* ================= titles (decision 2: cosmetic, normally at Tier III) ================= */
  A.defs().forEach(function (d) { if (d.title) A.defineTitle({ id: d.title.id, name: d.title.name, badge: d.id, tier: d.title.tier }); });

  /* a badge whose content is not released yet reads `soon` — evaluated live */
  A.defs().forEach(function (d) {
    if (!d.soonIf) return;
    var m = d.measure, v = d.v;
    d.measure = function (ctx, cb) {
      var soon = false;
      try { soon = !!d.soonIf(); } catch (e) { soon = true; }
      if (soon) { cb(null); return; }
      if (m) m(ctx, cb); else cb(v(ctx));
    };
    delete d.v;
  });
})();
