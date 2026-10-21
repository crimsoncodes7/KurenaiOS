/* Kurenai OS — core/outlook.js · KOS.outlook
   What a closed app should still say (roadmap 5.7 item 1,
   docs/server-runner-plan.md §3–4). The device works out, with each
   owner's own rules, every notice it would raise in the next seven days,
   and the facts a scheduled message would read; KOS.push publishes both to
   `kos_outlook`, and the server's runner only delivers them at their time.
   The server never re-derives a notice (invariant 131).

     items  [{id, kind, at (ms), title, body, view, arg}] — the ledger's own
            ids (cal:/rem:/asg: from the alert tickers' forecasts; exam:,
            money:, goal: from each owner's notices(day) at the morning
            time), with this device's filters, quiet hours and Exam
            Season's hold applied before anything leaves it
     brief  the read tools' answers for the week: Pacing, events and
            reminders by day, open assignments, assessments with their band,
            bills by name (never amounts), goals ending, cards due, the
            streak. Never notes, card text, money amounts or chat history.

   build() reads only; it writes nothing.                                   */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;
  var DAYS = 7, CAP = 200;
  var HM = /^([01]\d|2[0-3]):([0-5]\d)$/;

  function ui() { return (store.state && store.state.ui) || {}; }
  function morning() { var m = ui().notifyMorning; return HM.test(m) ? m : "08:00"; }
  function at(day, hm) {
    var p = day.split("-"), h = hm.split(":");
    return new Date(+p[0], +p[1] - 1, +p[2], +h[0], +h[1], 0, 0).getTime();
  }
  function iso(ts) {
    var d = new Date(ts);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function safe(fn, dflt) { try { var v = fn(); return v == null ? dflt : v; } catch (e) { return dflt; } }
  function tz() { return safe(function () { return Intl.DateTimeFormat().resolvedOptions().timeZone; }, "UTC"); }

  /* a short-lead alert ("in 10 minutes") means nothing late; a day's
     notice still does */
  function shortLead(it) {
    if (!/^(cal|rem|asg):/.test(it.id)) return false;
    return +it.id.split(":").pop() < 1440;
  }
  /* quiet hours: a day notice waits for the window's end; a short-lead
     alert inside the window is dropped */
  function quieten(it) {
    var N = KOS.notify;
    if (!N || !N.inQuiet || !N.inQuiet(new Date(it.at))) return it;
    if (shortLead(it)) return null;
    var q = N.quiet(), end = at(iso(it.at), q.to);
    if (end <= it.at) end += 864e5;
    return Object.assign({}, it, { at: end });
  }

  function items(now, rows) {
    var to = now + DAYS * 864e5, m = morning(), out = [];
    out = out.concat(safe(function () { return KOS.calendar.forecast(now, to, m); }, []));
    out = out.concat(safe(function () { return KOS.reminders.forecast(now, to); }, []));
    out = out.concat(safe(function () { return KOS.assignments.forecast(now, to); }, []));
    for (var d = 0; d <= DAYS; d++) {
      var day = KOS.srs.addDays(iso(now), d), when = at(day, m);
      if (when < now || when >= to) continue;
      var dayItems = []
        .concat(safe(function () { return KOS.exams.notices(day); }, []))
        .concat(safe(function () { return KOS.money.notices(day, { hide: true }); }, []))
        /* reached and missed need the day's measurement: not forecast */
        .concat(safe(function () { return KOS.goals.notices(rows || [], day); }, [])
          .filter(function (n) { return !/:(done|missed)$/.test(n.id); }));
      dayItems.forEach(function (n) { out.push(Object.assign({}, n, { at: when })); });
    }
    var N = KOS.notify, seen = {};
    return out
      .filter(function (it) { return it && it.id && it.at >= now; })
      .filter(function (it) { return !(N && N.isMuted && N.isMuted(it.kind)) && !(N && N.isHeld && N.isHeld(it.kind)); })
      .map(quieten).filter(Boolean)
      .filter(function (it) { if (seen[it.id]) return false; seen[it.id] = true; return true; })
      .sort(function (a, b) { return a.at - b.at; })
      .slice(0, CAP)
      .map(function (it) {
        return { id: String(it.id), kind: it.kind, at: it.at, title: String(it.title || "").slice(0, 200),
          body: String(it.body || "").slice(0, 300), view: it.view || null, arg: it.arg === undefined ? null : it.arg };
      });
  }

  /* ---- the brief: what a scheduled message on the server may read ---- */
  function brief(now, rows) {
    var t = iso(now), b = { asOf: new Date(now).toISOString(), today: t };
    b.days = [];
    for (var d = 0; d < DAYS; d++) {
      var day = KOS.srs.addDays(t, d);
      b.days.push({
        date: day,
        events: safe(function () {
          return KOS.calendar.eventsOn(day).map(function (e) { return { time: e.time || null, title: e.title, type: e.type }; });
        }, []).slice(0, 20),
        reminders: safe(function () { return KOS.reminders.forDate(day).map(function (r) { return { time: r.dueTime || null, title: r.title }; }); }, []).slice(0, 20),
        lessons: safe(function () { return KOS.pacing.lessonsOn(day).map(function (l) { return { subject: l.entry.subject, text: l.lesson.text, sat: !!l.sat }; }); }, []).slice(0, 12)
      });
    }
    b.plan = safe(function () {
      var w = KOS.pacing.currentWeek();
      return w ? { week: w.wb, rows: KOS.pacing.entriesFor(w.wb).slice(0, 30).map(function (e) {
        return { subject: e.subject, source: e.source, title: e.title, done: !!e.done };
      }) } : null;
    }, null);
    b.assignments = safe(function () {
      var cut = KOS.srs.addDays(t, 21);
      return KOS.assignments.all().filter(function (a) {
        return a.due && a.due <= cut && a.status !== "complete" && a.status !== "submitted";
      }).slice(0, 20).map(function (a) { return { title: a.title, subject: a.subject || null, due: a.due, status: a.status, progress: a.progress || 0 }; });
    }, []);
    b.assessments = safe(function () {
      var cut = KOS.srs.addDays(t, 60);
      return KOS.exams.upcoming(t).filter(function (a) { return a.date <= cut; }).slice(0, 12).map(function (a) {
        var r = safe(function () { return KOS.exams.readiness(a, t); }, null), sb = safe(function () { return KOS.exams.startBy(a, t); }, null);
        return { title: a.title, subject: a.subject || null, tier: a.tier, date: a.date, band: r && r.band || null, startBy: sb && sb.date || null };
      });
    }, []);
    b.bills = safe(function () {
      return KOS.money.upcoming(t, KOS.srs.addDays(t, DAYS - 1), t).map(function (o) { return { name: o.name, date: o.date, kind: o.kind }; }).slice(0, 20);
    }, []);
    b.goals = (rows || []).filter(function (r) { return !r.archived && r.status === "active"; }).slice(0, 12).map(function (r) {
      return { title: r.title, progress: r.progress != null ? r.progress : null, ends: (r._period && r._period.to) || r.deadline || null };
    });
    b.cards = { dueToday: safe(function () { return KOS.srs.dueCount(); }, 0) };
    b.study = safe(function () { return { streak: KOS.sessions.streaks().all }; }, {});
    return b;
  }

  /* build(cb, {now}) → {v, builtAt, tz, morning, items, brief} */
  function build(cb, opts) {
    var now = (opts && opts.now) || Date.now();
    function done(rows) { cb(null, { v: 1, builtAt: now, tz: tz(), morning: morning(), items: items(now, rows), brief: brief(now, rows) }); }
    if (KOS.goals && KOS.goals.compute) {
      try { KOS.goals.compute(function (err, rows) { done(err ? [] : rows || []); }, { archived: false }); }
      catch (e) { done([]); }
    } else done([]);
  }

  KOS.outlook = { build: build, DAYS: DAYS, morning: morning };
})();
