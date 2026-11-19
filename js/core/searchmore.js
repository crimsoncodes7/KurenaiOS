/* Kurenai OS — core/searchmore.js
   The rest of the cross-app search, loaded on the first search (the lazy
   bundle "search-more"): the Pages table, Exams, Code projects and tasks,
   the Creatives Portfolio and drafts, and the Wall (quality W7: SH-07,
   CO-38, CR-37, AX-32). The same two rules as search.js hold: a pure read,
   and nothing private (invariant 71). It is a bundle of its own to keep
   the boot payload down; core/search.js composes its groups. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var H = KOS.search._h, norm = H.norm, terms = H.terms, hits = H.hits, rank = H.rank, clip = H.clip,
    niceDate = H.niceDate, PER_DOMAIN = KOS.search.PER_DOMAIN;

  /* ---- Pages (SH-07, AX-32): every page and tab the rail, the sub-navs and
     the Governor/Wall tabs reach, by its name or the word a person would
     use for it. [title, view, arg, aliases]. Reports and Files have their
     own domains; their pages are in them. A test holds that every rail
     view is named here, so a new page cannot be unreachable from search. */
  var PAGES = [
    ["Home", "home", undefined, "dashboard today"],
    ["Computer Science", "subject", "compsci", "cs a-level"],
    ["Mathematics", "subject", "maths", "maths math a-level"],
    ["IT · Data Analytics", "subject", "it", "information technology data analytics cambridge technical"],
    ["Code", "subject", "code", "csharp c# programming lessons"],
    ["Japanese", "subject", "ja", "nihongo kana kanji language"],
    ["Mind", "subject", "mind", "psychology"],
    ["Creatives", "subject", "creatives", "art writing drawing"],
    ["Writing Desk", "creatives", { page: "write" }, "drafts writing creatives"],
    ["Portfolio", "creatives", { page: "portfolio" }, "creatives works"],
    ["Review", "review", undefined, "flashcards cards due revision spaced repetition"],
    ["Card stats", "cardstats", undefined, "statistics retention fsrs"],
    ["Assignments", "assignments", undefined, "homework coursework deadlines"],
    ["Exams & Papers", "exams", undefined, "exam mock past papers timetable readiness"],
    ["Pacing", "pacing", undefined, "weekly plan term schedule"],
    ["Personal deck", "personaldeck", undefined, "my flashcards"],
    ["Labs and simulations", "sims", undefined, "labs simulators interactive"],
    ["Trace Lab", "trace", undefined, "trace tables algorithms dry run"],
    ["OOP sandbox", "oop", undefined, "object oriented classes"],
    ["Worked examples", "worked", undefined, "maths worked solutions"],
    ["Progress tracker", "tracker", undefined, "attempts"],
    ["Focus Timer", "focus", undefined, "pomodoro timer study session"],
    ["Reminders", "reminders", undefined, "todo tasks to-do"],
    ["Routines", "routines", undefined, "habits daily review"],
    ["Calendar", "calendar", undefined, "events schedule timetable"],
    ["Money", "money", undefined, "budget spending transactions finance pots"],
    ["Goals", "goals", undefined, "targets objectives"],
    ["Collection overview", "matrix", undefined, "collection library media"],
    ["Anime", "anime", undefined, "watching"],
    ["Books", "books", undefined, "reading manga"],
    ["Visual Novels", "vn", undefined, "vndb"],
    ["Games", "game", undefined, "steam gaming"],
    ["Shrine", "shrine", undefined, "favourites top rated"],
    ["Wishlist", "wishlist", undefined, "planner purchase buy"],
    ["Collection Sync", "mediasync", undefined, "anilist vndb sync"],
    ["Seasonal anime", "seasonal", undefined, "airing season"],
    ["Mangaka", "mangaka", undefined, "authors artists"],
    ["The Governor's Seat", "governor", undefined, "governor status xp hp gold streak"],
    ["Gold Shop", "governor", "shop", "shop store buy spend"],
    ["Avatar", "governor", "avatar", "profile picture banner"],
    ["Session Log", "governor", "history", "sessions ledger history"],
    ["The Wall", "achievements", undefined, "badges achievements trophies"],
    ["Titles", "achievements", "titles", "badges earned titles"],
    ["Kurenai", "assistant", undefined, "assistant ai chat ask"],
    ["Backup & Restore", "data", undefined, "backup restore export import data settings"],
    ["Help & Guide", "help", undefined, "help guide docs how to manual"],
    ["Notifications", "notifications", undefined, "alerts bell inbox"],
    ["Storage", "storage", undefined, "space disk cache settings"],
    ["Pen and ink", "pen", undefined, "handwriting notebook stylus pencil"],
    ["Connections", "connections", undefined, "google todoist github integrations settings accounts"],
    ["Code settings", "code", { page: "settings" }, "settings csharp"],
    ["Creatives settings", "creatives", { page: "settings" }, "settings"]
  ];
  function pageScore(p, ts) {
    var t = norm(p[0]), q = ts.join(" ");
    if (t === q) return 0;
    if (t.indexOf(q) === 0 || (ts.length === 1 && t.replace(/^the /, "").indexOf(q) === 0)) return 1;
    var words = norm(p[3]).split(/\s+/);
    if (ts.length === 1 && words.indexOf(ts[0]) !== -1) return 1;
    return 2;
  }
  function pagesDomain(q, ts) {
    var out = [];
    PAGES.forEach(function (p) {
      if (KOS.views && !KOS.views[p[1]]) return;
      if (hits(p[0] + " " + p[3], ts)) out.push({ p: p, s: pageScore(p, ts), i: out.length });
    });
    if (!out.length) return null;
    out.sort(function (a, b) { return a.s - b.s || a.i - b.i; });
    return {
      id: "pages", label: "Pages", rank: out[0].s,
      items: out.slice(0, PER_DOMAIN).map(function (o) {
        var p = o.p, sec = KOS.sectionOf ? KOS.sectionOf(p[1]) : null;
        return { title: p[0], sub: SEC_NAME[sec] || "Page", meta: "open the page",
          open: function () { KOS.show(p[1], p[2]); } };
      })
    };
  }
  var SEC_NAME = { home: "Home", study: "Study", productivity: "Productivity", collection: "Collection",
    governor: "Governor", assistant: "Assistant", system: "Archive" };

  /* Exams & Papers: an assessment by its title, subject or paper */
  function examsDomain(q, ts) {
    var ex = KOS.store.state.exams;
    var all = (ex && ex.assessments) || [];
    var out = all.filter(function (a) {
      return a && !a.deleted && hits((a.title || "") + " " + (a.subject || "") + " " + (a.tier || "") + " " + (a.preset || ""), ts);
    });
    if (!out.length) return null;
    return {
      id: "exams", view: "exams", label: "Exams & Papers",
      items: rank(out, ts, function (a) { return a.title; }).slice(0, PER_DOMAIN).map(function (a) {
        return { title: a.title || "Untitled exam", sub: (a.tier || "exam").replace(/_/g, " ") + (a.date ? " · " + niceDate(a.date) : ""),
          meta: "", open: function () { KOS.show("exams", { id: a.id }); } };
      })
    };
  }

  /* Code: capstones, Rider projects and tasks, besides the lessons the
     lessons group already finds (CO-38). Authored content, read once loaded. */
  function codeDomain(q, ts) {
    var K = window.KOS_CODE;
    if (!K) return null;
    var items = [];
    function add(map, kind, label, page) {
      Object.keys(map || {}).forEach(function (id) {
        var o = map[id];
        if (!o || !o.title || !hits(o.title, ts)) return;
        items.push({ t: o.title, kind: label, id: id, page: page, extra: o.summary || o.statement });
      });
    }
    add(K.CAPSTONES, "capstone", "Capstone", "capstone");
    add(K.PROJECTS, "project", "Rider project", "project");
    add(K.TASKS, "task", "Task", "task");
    if (!items.length) return null;
    return {
      id: "code", view: "code", label: "Code projects and tasks",
      items: rank(items, ts, function (x) { return x.t; }).slice(0, PER_DOMAIN).map(function (x) {
        return { title: x.t, sub: "Code · " + x.kind, meta: clip(typeof x.extra === "string" ? x.extra : "", 70),
          open: function () { KOS.show("code", { page: x.page, id: x.id }); } };
      })
    };
  }

  /* Creatives: only what you chose to show (the Portfolio, invariant 156);
     the Practice Log stays out, and drafts come in the async pass */
  function creativesDomain(q, ts) {
    if (!KOS.creatives || !KOS.creatives.portfolio) return null;
    var out = (KOS.creatives.portfolio() || []).filter(function (w) {
      return hits((w.title || "") + " " + (w.madeFrom || ""), ts);
    });
    if (!out.length) return null;
    return {
      id: "creatives", view: "creatives", label: "Creatives portfolio",
      items: rank(out, ts, function (w) { return w.title; }).slice(0, PER_DOMAIN).map(function (w) {
        return { title: w.title || "Untitled", sub: "Portfolio", meta: clip(w.madeFrom, 70),
          open: function () {
            KOS.show("creatives", { page: "portfolio" });
            if (KOS.crOpenWork) KOS.crOpenWork(w.id);
          } };
      })
    };
  }
  function draftsDomain(q, cb) {
    var F = KOS.creatives && KOS.creatives.files;
    if (!F || !F.available || !F.available() || !F.all) { cb(null); return; }
    var ts = terms(q);
    function done(rows) {
      var out = rows.filter(function (r) { return hits((r.title || "") + " " + (r.text || ""), ts); });
      if (!out.length) { cb(null); return; }
      cb({
        id: "drafts", view: "creatives", label: "Writing Desk drafts",
        items: rank(out, ts, function (r) { return r.title; }).slice(0, PER_DOMAIN).map(function (r) {
          var pos = norm(r.text).indexOf(ts[0]);
          return { title: r.title || "Untitled", sub: "Draft", meta: pos > 0 ? "…" + clip(String(r.text).slice(Math.max(0, pos - 20), pos + 60), 80) : clip(r.text, 70),
            open: function () { KOS.show("creatives", { page: "write", id: String(r.id).slice(4) }); } };
        })
      });
    }
    try {
      F.all(function (err, rows) {
        rows = (rows || []).filter(function (r) { return String(r.id).indexOf("doc:") === 0; });
        done(rows);
      });
    } catch (e) { cb(null); }
  }

  /* The Wall: badges (never a hidden one before it is earned) and titles */
  function achievementsDomain(q, ts) {
    var A = KOS.achievements;
    if (!A || !A.defs) return null;
    var earned = (A.peek ? A.peek().earned : null) || {};
    var sets = {};
    (A.sets ? A.sets() : []).forEach(function (s) { sets[s.id] = s.name; });
    var items = [];
    (A.defs() || []).forEach(function (d) {
      if (d.hidden && !earned[d.id]) return;
      if (!hits(d.name + " " + (d.what || ""), ts)) return;
      items.push({ t: d.name, sub: "Badge · " + (sets[d.set] || "The Wall"), meta: clip(d.what, 70), arg: "set/" + d.set + "/" + d.id });
    });
    (A.titles ? A.titles() : []).forEach(function (t) {
      if (!hits(t.name, ts)) return;
      items.push({ t: t.name, sub: "Title" + (t.unlocked ? " · earned" : ""), meta: "", arg: "titles" });
    });
    if (!items.length) return null;
    return {
      id: "achievements", view: "achievements", label: "The Wall",
      items: rank(items, ts, function (x) { return x.t; }).slice(0, PER_DOMAIN).map(function (x) {
        return { title: x.t, sub: x.sub, meta: x.meta, open: function () { KOS.show("achievements", x.arg); } };
      })
    };
  }



  /* a topic's notes, quiz and exam words, built once when its content is in
     (CC-28); figures are drawings and left out */
  function noteText(it) {
    if (it.nt != null) return it.nt;
    var deep = window.KOS_CONTENT && window.KOS_CONTENT[it.subject + ":" + it.ref];
    if (!deep || (KOS.lazy && KOS.lazy.isStub(deep))) return "";
    var out = [];
    function walk(v, key) {
      if (v == null || key === "fig") return;
      if (typeof v === "string") { out.push(v); return; }
      if (Array.isArray(v)) { v.forEach(function (x) { walk(x); }); return; }
      if (typeof v === "object") Object.keys(v).forEach(function (k) { walk(v[k], k); });
    }
    walk(deep.notes); walk(deep.quiz); walk(deep.exam);
    it.nt = KOS.hub._.plainSpec(out.join(" ")).toLowerCase();
    return it.nt;
  }
  /* rank (SH-29): exact title, starts with, word starts with, contains, then
     spec wording, flashcards, notes; ties keep spec order */
  function tier(it, qq, terms, kind) {
    var t = it.title.toLowerCase();
    if (terms.every(function (w) { return t.indexOf(w) !== -1; })) {
      if (t === qq) return 0;
      if (t.indexOf(qq) === 0) return 1;
      if (new RegExp("(^|[^a-z0-9])" + terms[0].replace(/[^a-z0-9]/g, "\\$&")).test(t)) return 2;
      return 3;
    }
    return 4 + kind;
  }
  KOS.search.more = {
    noteText: noteText, tier: tier,
    PAGES: PAGES, pages: pagesDomain, drafts: draftsDomain,
    sync: [codeDomain, creativesDomain, examsDomain, achievementsDomain]
  };
})();
