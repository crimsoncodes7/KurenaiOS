/* Kurenai OS — core/search.js
   Category 7 Phase F: cross-app search (audit CHR-1 / U-25).

   The topbar box searched the specification and nothing else. On the
   owner's real account that meant one search field over 355 spec points,
   and no way at all to reach 1,880 collection entries, 5 calendar events,
   the assignment tracker, the reminders or a single topic note. The box
   said "Search the specification database", which was honest, and useless.

   This file is the DOMAIN half — it builds result groups and knows nothing
   about the DOM. hub.js owns the listbox that renders them. Keeping the
   split means the assistant's search tool and the topbar box can share a
   ranking, exactly as they already share `KOS.hub.search` for spec points.

   Two rules the implementation is built around:

   · NOTHING PRIVATE IS SEARCHABLE. Provider tokens, the media kv store,
     the Supabase session, `push.log`, the session ledger and the assistant
     audit trail are all deliberately absent. A search box is a disclosure
     surface; only things the user authored or collected belong in it.

   · THE VAULT IS NOT LOADED TO BE SEARCHED. Media goes through
     `mediadb.query({search})`, which walks an IndexedDB cursor and filters
     on the stored `titleLower` — the same read path the vault views use.
     Results are capped per domain before anything reaches a renderer, so a
     1,880-entry library contributes at most `PER_DOMAIN` nodes.          */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var PER_DOMAIN = 6;
  var MIN_LEN = 2;

  function norm(s) { return String(s == null ? "" : s).toLowerCase(); }
  function terms(q) { return norm(q).trim().split(/\s+/).filter(Boolean); }
  function hits(hay, ts) {
    hay = norm(hay);
    return ts.every(function (t) { return hay.indexOf(t) !== -1; });
  }
  /* a title that STARTS with the query is what the user meant more often
     than one that merely contains it; everything else keeps insertion order */
  function rank(list, ts, key) {
    var head = ts[0] || "";
    return list.slice().sort(function (a, b) {
      var pa = norm(key(a)).indexOf(head) === 0 ? 0 : 1;
      var pb = norm(key(b)).indexOf(head) === 0 ? 0 : 1;
      return pa - pb;
    });
  }
  function clip(s, n) {
    s = String(s == null ? "" : s).replace(/\s+/g, " ").trim();
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  }

  /* "Wed 28 Oct", not the stored ISO (SH-18) */
  function niceDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
    return m ? new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) : String(iso || "");
  }
  var GOAL_WORD = { completed: "Reached", failed: "Missed", active: "In progress" };

  /* ---------------- the domains ----------------
     Each returns { label, items } or null. An item is
     { title, sub, meta, open() } — `open` is what the listbox activates,
     and it is the ONLY place a domain decides where its records live. */

  /* only the exam subjects have a specification; Code, Japanese, Mind and
     Creatives are authored lessons, each its own group (CO-38) */
  function specDomain(q, ts) {
    var by = {}, ids = [];
    (KOS.hub && KOS.hub.search ? KOS.hub.search(q) || [] : []).forEach(function (m) {
      var key = KOS.subjects.isExam(m.subject) ? "spec" : "lessons-" + m.subject;
      if (!by[key]) { by[key] = []; ids.push(key); }
      by[key].push(m);
    });
    return ids.map(function (key) {
      return {
        id: key, view: "subject",
        label: key === "spec" ? "Specification" : KOS.subjects.name(key.slice(8)) + " lessons",
        items: by[key].slice(0, PER_DOMAIN).map(function (m) {
          return {
            title: m.ref + " · " + m.title,
            sub: (window.KOS_DATA[m.subject] || {}).name || m.subject,
            meta: m.noteHit ? "Notes match" : m.fcHit ? "Flashcard match" : clip(m.snippet, 90),
            open: function () { KOS.show("ref", { subject: m.subject, ref: m.ref }); }
          };
        })
      };
    });
  }

  /* the user's own writing on a topic — the one part of the spec tree that
     is theirs rather than the exam board's, and previously unreachable */
  function notesDomain(q, ts) {
    var prog = KOS.store.state.progress || {};
    var out = [];
    Object.keys(prog).forEach(function (key) {
      var p = prog[key];
      if (!p || !p.note || !hits(p.note, ts)) return;
      var bits = key.split(":");
      var sid = bits[0], ref = bits.slice(1).join(":");
      var d = window.KOS_DATA[sid];
      if (!d) return;
      var leaf = KOS.hub && KOS.hub.BYREF && KOS.hub.BYREF[sid] ? KOS.hub.BYREF[sid][ref] : null;
      out.push({
        title: (leaf && leaf.title) || ref,
        sub: d.name + " · " + ref,
        meta: clip(p.note, 90),
        open: function () { KOS.show("ref", { subject: sid, ref: ref }); }
      });
    });
    if (!out.length) return null;
    return { id: "notes", view: "subject", label: "Your topic notes", items: out.slice(0, PER_DOMAIN) };
  }

  function remindersDomain(q, ts) {
    if (!KOS.reminders || !KOS.reminders.all) return null;
    var all = KOS.reminders.all() || [];
    var out = all.filter(function (r) {
      return hits(r.title, ts) || hits(r.notes, ts) || hits((r.tags || []).join(" "), ts);
    });
    if (!out.length) return null;
    return {
      id: "reminders", view: "reminders", label: "Reminders",
      items: rank(out, ts, function (r) { return r.title; }).slice(0, PER_DOMAIN).map(function (r) {
        return {
          title: r.title,
          sub: r.done ? "Completed" : (r.due
            ? (KOS.reminders.isOverdue && KOS.reminders.isOverdue(r) ? "Overdue · " : "Due ") + niceDate(r.due) : "No date"),
          meta: clip(r.notes || (r.tags || []).map(function (t) { return "#" + t; }).join(" "), 70),
          open: function () { KOS.show("reminders", { id: r.id, section: "all" }); }
        };
      })
    };
  }

  function assignmentsDomain(q, ts) {
    if (!KOS.assignments || !KOS.assignments.all) return null;
    var out = (KOS.assignments.all() || []).filter(function (a) {
      return hits(a.title, ts) || hits(a.description, ts) || hits(a.subject, ts);
    });
    if (!out.length) return null;
    return {
      id: "assignments", view: "assignments", label: "Assignments",
      items: rank(out, ts, function (a) { return a.title; }).slice(0, PER_DOMAIN).map(function (a) {
        return {
          title: a.title,
          sub: (KOS.assignments.statusLabel ? KOS.assignments.statusLabel(a.status) : a.status) +
            (a.due ? " · due " + niceDate(a.due) : ""),
          meta: clip(a.description, 70),
          open: function () {
            KOS.show("assignments");
            if (KOS.assignmentDetail) KOS.assignmentDetail(a.id, function () {});
          }
        };
      })
    };
  }

  function calendarDomain(q, ts) {
    var cal = KOS.store.state.calendar;
    if (!cal || !cal.events) return null;
    var out = cal.events.filter(function (ev) {
      return hits(ev.title, ts) || hits(ev.notes, ts) || hits(ev.room, ts) || hits(ev.paper, ts);
    });
    if (!out.length) return null;
    return {
      id: "calendar", view: "calendar", label: "Calendar",
      items: rank(out, ts, function (e) { return e.title; }).slice(0, PER_DOMAIN).map(function (ev) {
        return {
          title: ev.title || "Untitled",
          sub: (KOS.calendar && KOS.calendar.TYPES && KOS.calendar.TYPES[ev.type]
            ? KOS.calendar.TYPES[ev.type].label || ev.type : ev.type) + " · " + ev.date,
          meta: clip(ev.notes || ev.room || "", 70),
          open: function () {
            KOS.show("calendar");
            if (KOS.calendar && KOS.calendar.eventDetail) KOS.calendar.eventDetail(ev, ev.date, function () {});
          }
        };
      })
    };
  }

  function plannerDomain(q, ts) {
    if (!KOS.wishlist || !KOS.wishlist.data) return null;
    var items = (KOS.wishlist.data().items || []).filter(function (i) {
      return hits(i.title, ts) || hits(i.retailer, ts) || hits(i.notes, ts);
    });
    if (!items.length) return null;
    return {
      id: "planner", view: "wishlist", label: "Purchase planner",
      items: rank(items, ts, function (i) { return i.title; }).slice(0, PER_DOMAIN).map(function (i) {
        return {
          title: i.title,
          sub: i.status === "purchased" ? "Purchased" : i.status === "waiting" ? "Waiting for release" : "Want to buy",
          meta: clip([i.retailer, i.price ? i.currency + i.price : ""].filter(Boolean).join(" · "), 60),
          open: function () { KOS.show("wishlist"); }
        };
      })
    };
  }

  function goalsDomain(q, ts) {
    if (!KOS.goals || !KOS.goals.all) return null;
    var out = (KOS.goals.all() || []).filter(function (g) {
      return hits(g.title, ts) || hits(g.description, ts) || hits(g.notes, ts);
    });
    if (!out.length) return null;
    return {
      id: "goals", view: "goals", label: "Goals",
      items: rank(out, ts, function (g) { return g.title; }).slice(0, PER_DOMAIN).map(function (g) {
        return {
          title: g.title, sub: GOAL_WORD[g.status] || GOAL_WORD.active, meta: clip(g.description, 70),
          open: function () { KOS.show("goals", { id: g.id }); }
        };
      })
    };
  }

  function personalCardsDomain(q, ts) {
    var cards = (KOS.store.state.custom && KOS.store.state.custom.cards) || [];
    var out = cards.filter(function (c) {
      return c.sid === (KOS.srs && KOS.srs.PERSONAL_SID) && (hits(c.q, ts) || hits(c.a, ts));
    });
    if (!out.length) return null;
    return {
      id: "cards", view: "personaldeck", label: "Personal flashcards",
      items: out.slice(0, PER_DOMAIN).map(function (c) {
        return {
          title: clip(c.q, 70), sub: "Personal deck", meta: clip(c.a, 70),
          open: function () { KOS.show("personaldeck"); }
        };
      })
    };
  }

  /* ---- media: the only asynchronous domain ----
     It never renders the vault; it asks IndexedDB for title matches and
     takes the first PER_DOMAIN. `open` goes to the owning vault and then
     to the record's own editor, which is where a collection entry lives. */
  var MOD_LABEL = { anime: "Anime", books: "Books", vn: "Visual novel", game: "Game" };
  function mediaDomain(q, cb) {
    if (!KOS.mediadb || !KOS.mediadb.available || !KOS.mediadb.available()) { cb(null); return; }
    var done = false;
    var bail = setTimeout(function () { if (!done) { done = true; cb(null); } }, 1200);
    try {
      KOS.mediadb.query({ search: q }, function (err, rows) {
        if (done) return;
        done = true; clearTimeout(bail);
        if (err || !rows || !rows.length) { cb(null); return; }
        var ts = terms(q);
        cb({
          id: "media", view: "matrix", label: "Collection",
          items: rank(rows, ts, function (e) { return e.title; }).slice(0, PER_DOMAIN).map(function (e) {
            return {
              title: e.title,
              sub: (MOD_LABEL[e.module] || e.module) +
                (e.author ? " · " + e.author : e.developer ? " · " + e.developer : ""),
              meta: (KOS.media && KOS.media.progressText ? KOS.media.progressText(e) : "") || "",
              open: function () {
                KOS.show(e.module);
                if (KOS.mediaEditor) KOS.mediaEditor(e, function () {});
              }
            };
          })
        });
      });
    } catch (e) { if (!done) { done = true; clearTimeout(bail); cb(null); } }
  }

  /* Reports (roadmap 5.1): the page itself for "report", "review" or
     "wrapped", and the saved reports this session has already read from
     their store, matched on their words. A report's facts are derived
     from data that has its own home; only the headline is searched. */
  var REPORT_WORDS = "reports report weekly week in review reviews wrapped story recap";
  function reportsDomain(q, ts) {
    var items = [];
    if (hits(REPORT_WORDS, ts)) items.push({ title: "Reports", sub: "Home", meta: "your weeks in review",
      open: function () { KOS.show("reports"); } });
    var seen = (KOS.reportStore && KOS.reportStore.cached) ? KOS.reportStore.cached() : [];
    seen.forEach(function (r) {
      var w = KOS.reportWords ? KOS.reportWords.current(r) : { headline: "" };
      if (!hits(w.headline + " " + r.start, ts) || items.length >= PER_DOMAIN) return;
      items.push({ title: w.headline, sub: "Week of " + r.start, meta: "weekly report",
        open: function () { KOS.show("reports", { period: r.period, start: r.start }); } });
    });
    return items.length ? { id: "reports", view: "home", label: "Reports", items: items } : null;
  }

  /* Files (roadmap 5.11, invariant 150): names and aliases at once, and
     the text inside PDFs once the index has loaded (the first search loads
     it; the next keystroke reads it). A file is opened in the app's own
     viewer (invariant 152). */
  function filesDomain(q, ts) {
    if (!KOS.files || !KOS.files.search) return null;
    if (KOS.files.loadText) KOS.files.loadText();
    var items = [];
    if (hits("files file documents pdf worksheet handout scan", ts)) items.push({ title: "Files", sub: "Archive", meta: "every file you've added", open: function () { KOS.show("files"); } });
    KOS.files.search(q, PER_DOMAIN).forEach(function (h) {
      if (items.length >= PER_DOMAIN) return;
      items.push({ title: h.rec.name, sub: h.where === "text" ? "p." + h.page + " · " + clip(h.snippet, 80) : (KOS.files.KIND_NAME[h.rec.kind] || "File"),
        meta: h.where === "text" ? "inside a file" : "file", open: function () { KOS.files.open(h.rec); } });
    });
    return items.length ? { id: "files", view: "files", label: "Files", items: items } : null;
  }

  var SYNC_DOMAINS = [specDomain, notesDomain, remindersDomain, assignmentsDomain,
    calendarDomain, personalCardsDomain, filesDomain, reportsDomain, plannerDomain, goalsDomain];
  /* where each group reads: what you study, then what you owe, then what you own */
  var ORDER = "spec lessons- notes code creatives drafts exams reminders assignments calendar cards files reports achievements pages media planner goals".split(" ");
  function orderOf(g) {
    var i = ORDER.indexOf(g.id.replace(/^(lessons-).*/, "$1"));
    return i < 0 ? 99 : g.id === "pages" && g.rank <= 1 ? -1 : i;
  }

  /* run(q, cb) — cb(groups, done) may be called TWICE: once immediately
     with everything readable from memory, once more when IndexedDB has
     answered. A caller that only wants the final answer can ignore the
     first; the topbar renders both so typing never feels blocked. */
  function run(q, cb) {
    var ts = terms(q);
    if (!q || norm(q).trim().length < MIN_LEN) { cb([], true); return; }
    var groups = [];
    function take(g) {
      [].concat(g).forEach(function (one) { if (one && one.items && one.items.length) groups.push(one); });
    }
    function sorted() {
      return groups.map(function (g, i) { return [orderOf(g), i, g]; })
        .sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }).map(function (x) { return x[2]; });
    }
    function safe(fn) { try { take(fn(q, ts)); } catch (e) { /* one domain never blanks the box */ } }
    SYNC_DOMAINS.forEach(safe);
    cb(sorted(), false);
    var pending = 2;
    function land(g) { take(g); if (--pending === 0) cb(sorted(), true); }
    mediaDomain(q, land);
    /* the rest is a lazy bundle, in on the first search; a failed load leaves the core answer */
    withMore(function (M) {
      if (!M) { land(null); return; }
      M.sync.concat([M.pages]).forEach(safe);
      M.drafts(q, land);
    });
  }
  function withMore(fn) {
    if (KOS.search.more) { fn(KOS.search.more); return; }
    KOS.lazy.need(["search-more"]).then(function () { fn(KOS.search.more); }, function () { fn(null); });
  }

  KOS.search = { run: run, PER_DOMAIN: PER_DOMAIN, MIN_LEN: MIN_LEN,
    /* exposed so the smoke suite can assert a domain in isolation */
    _sync: SYNC_DOMAINS, _media: mediaDomain, _h: { norm: norm, terms: terms, hits: hits, rank: rank, clip: clip, niceDate: niceDate },
    more: null, withMore: withMore };
})();
