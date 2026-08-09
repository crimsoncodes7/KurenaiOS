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

  /* ---------------- the domains ----------------
     Each returns { label, items } or null. An item is
     { title, sub, meta, open() } — `open` is what the listbox activates,
     and it is the ONLY place a domain decides where its records live. */

  function specDomain(q, ts) {
    if (!KOS.hub || !KOS.hub.search) return null;
    var res = KOS.hub.search(q) || [];
    if (!res.length) return null;
    return {
      id: "spec", label: "Specification",
      items: res.slice(0, PER_DOMAIN).map(function (m) {
        return {
          title: m.ref + " · " + m.title,
          sub: (window.KOS_DATA[m.subject] || {}).name || m.subject,
          meta: m.fcHit ? "Flashcard match" : clip(m.snippet, 90),
          open: function () { KOS.show("ref", { subject: m.subject, ref: m.ref }); }
        };
      })
    };
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
    return { id: "notes", label: "Your topic notes", items: out.slice(0, PER_DOMAIN) };
  }

  function remindersDomain(q, ts) {
    if (!KOS.reminders || !KOS.reminders.all) return null;
    var all = KOS.reminders.all() || [];
    var out = all.filter(function (r) {
      return hits(r.title, ts) || hits(r.notes, ts) || hits((r.tags || []).join(" "), ts);
    });
    if (!out.length) return null;
    return {
      id: "reminders", label: "Reminders",
      items: rank(out, ts, function (r) { return r.title; }).slice(0, PER_DOMAIN).map(function (r) {
        return {
          title: r.title,
          sub: r.done ? "Completed" : (r.due ? "Due " + r.due : "No date"),
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
      id: "assignments", label: "Assignments",
      items: rank(out, ts, function (a) { return a.title; }).slice(0, PER_DOMAIN).map(function (a) {
        return {
          title: a.title,
          sub: (KOS.assignments.statusLabel ? KOS.assignments.statusLabel(a.status) : a.status) +
            (a.due ? " · due " + a.due : ""),
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
      id: "calendar", label: "Calendar",
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
      id: "planner", label: "Purchase planner",
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
      id: "goals", label: "Collection goals",
      items: rank(out, ts, function (g) { return g.title; }).slice(0, PER_DOMAIN).map(function (g) {
        return {
          title: g.title, sub: g.status || "active", meta: clip(g.description, 70),
          open: function () { KOS.show("goals"); }
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
      id: "cards", label: "Personal flashcards",
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
          id: "media", label: "Collection",
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

  /* the synchronous domains, in the order a result list should read them:
     what you are studying, then what you owe, then what you own */
  var SYNC_DOMAINS = [specDomain, notesDomain, remindersDomain, assignmentsDomain,
    calendarDomain, personalCardsDomain, plannerDomain, goalsDomain];

  /* run(q, cb) — cb(groups, done) may be called TWICE: once immediately
     with everything readable from memory, once more when IndexedDB has
     answered. A caller that only wants the final answer can ignore the
     first; the topbar renders both so typing never feels blocked. */
  function run(q, cb) {
    var ts = terms(q);
    if (!q || norm(q).trim().length < MIN_LEN) { cb([], true); return; }
    var groups = [];
    SYNC_DOMAINS.forEach(function (fn) {
      var g;
      try { g = fn(q, ts); } catch (e) { g = null; }
      if (g && g.items && g.items.length) groups.push(g);
    });
    cb(groups.slice(), false);
    mediaDomain(q, function (mg) {
      if (mg && mg.items.length) {
        /* the Collection sits after the study domains but before the
           planning tail — it is the largest store and the least urgent */
        var at = groups.findIndex(function (g) { return g.id === "planner" || g.id === "goals"; });
        if (at === -1) groups.push(mg); else groups.splice(at, 0, mg);
      }
      cb(groups, true);
    });
  }

  KOS.search = { run: run, PER_DOMAIN: PER_DOMAIN, MIN_LEN: MIN_LEN,
    /* exposed so the smoke suite can assert a domain in isolation */
    _sync: SYNC_DOMAINS, _media: mediaDomain };
})();
