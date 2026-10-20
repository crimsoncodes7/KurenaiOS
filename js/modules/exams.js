/* Kurenai OS — modules/exams.js
   The Exams & Deadlines hub (roadmap 5.8, docs/exams-plan.md), phase 1:
   the timetable, an assessment's page and the assessment editor with the
   Scope Builder. Drawn with the app's shared components until design turn
   29 (frames 29a–29x) restyles it; the data and its rules are final.

     #/exams                 the timetable (Practice is the record, #/tracker)
     #/exams/<id>            one assessment: logistics, scope, start-by,
                             practice and its result, milestones

   Pages only READ (invariant 54 and smoke56): a render writes nothing.
   A click may write (a milestone ticked, an assessment saved), always
   through KOS.exams.                                                     */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var E = function () { return KOS.exams; };
  var SUBJ = { compsci: "Computer Science", maths: "Mathematics", it: "IT" };
  var SHORT = { compsci: "CS", maths: "Maths", it: "IT" };
  var HUE = { compsci: "var(--cs)", maths: "var(--maths)", it: "var(--it)" };
  var TIER_TONE = { real_exam: "crimson", mock: "amber", topic_test: "teal", retrieval_test: "green", deadline: "bloom" };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function parse(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function pretty(iso, withDow) {
    if (!iso) return "";
    var d = parse(iso);
    return (withDow ? DOW[d.getDay()] + " " : "") + d.getDate() + " " + MONTHS[d.getMonth()] +
      (d.getFullYear() !== new Date().getFullYear() ? " " + d.getFullYear() : "");
  }
  function inDays(n) {
    if (n == null) return "";
    if (n === 0) return "today";
    if (n === 1) return "tomorrow";
    if (n === -1) return "yesterday";
    return n > 0 ? "in " + n + " days" : Math.abs(n) + " days ago";
  }
  function mins(m) {
    if (!m) return "";
    var h = Math.floor(m / 60), r = m % 60;
    return (h ? h + " h" : "") + (r ? (h ? " " : "") + r + " min" : "");
  }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many || one + "s"); }
  function tierChip(a) {
    var t = E().tier(a.tier);
    return el("span", { class: "k-chip", "data-ui": "exams.tier", "data-tone": TIER_TONE[a.tier] || null, text: t.label });
  }
  function examTabs(active) {
    var tabs = KOS.ui.tabs([
      { label: "Timetable", active: active === "timetable", onSelect: function () { if (active !== "timetable") KOS.show("exams"); } },
      { label: "Practice", active: active === "practice", onSelect: function () { if (active !== "practice") KOS.show("tracker"); } }
    ], { variant: "workspace", label: "Exams & Deadlines" });
    tabs.setAttribute("data-ui", tabs.getAttribute("data-ui") + " exams.tabs");
    return tabs;
  }
  KOS.examTabs = examTabs;

  /* ---------------- the timetable ---------------- */
  function startByChip(a) {
    var sb = E().startBy(a);
    if (!sb) return null;
    var t = KOS.srs.todayISO();
    if (a.date < t) return null;
    var passed = sb.date <= t;
    return el("span", { class: "k-chip", "data-ui": "exams.startby", "data-tone": passed ? "danger" : null,
      title: sb.override ? "Your start-by date" : sb.why,
      text: passed ? (sb.date === t ? "Start by today" : "Start-by passed " + pretty(sb.date)) : "Start by " + pretty(sb.date) });
  }
  function scopeLine(a) {
    if (a.tier === "deadline") {
      var left = a.milestones.filter(function (m) { return !m.done; }).length;
      return a.milestones.length ? plural(left, "milestone") + " left" : "";
    }
    var n = E().leaves(a).length, x = E().excluded(a).length;
    return n ? plural(n, "topic") + (x ? " · " + x + " excluded" : "") : "No scope yet";
  }
  function row(a) {
    var days = E().daysTo(a);
    var d = a.date ? parse(a.date) : null;
    var attempts = KOS.tracker.forAssessment(a.id).filter(function (e) { return e.role !== "result"; }).length;
    return el("button", { type: "button", class: "k-ex-row", "data-ui": "exams.row", "data-id": a.id,
      "data-state": [a.result ? "done" : null, days != null && days < 0 ? "past" : null].filter(Boolean).join(" ") || null,
      style: "--s: " + (HUE[a.subject] || "var(--muted)"),
      onclick: function () { KOS.show("exams", a.id); } }, [
      el("span", { class: "k-ex-date", "aria-hidden": "true" }, d ? [
        el("b", { text: String(d.getDate()) }), el("span", { text: MONTHS[d.getMonth()] })
      ] : [el("span", { text: "—" })]),
      el("span", { class: "k-ex-main" }, [
        el("span", { class: "k-ex-title", text: a.title }),
        el("span", { class: "k-ex-meta" }, [
          tierChip(a),
          a.subject ? el("span", { text: SHORT[a.subject] }) : null,
          a.time ? el("span", { class: "k-mono", text: a.time }) : null,
          scopeLine(a) ? el("span", { text: scopeLine(a) }) : null,
          attempts ? el("span", { text: plural(attempts, "paper") + " logged" }) : null,
          a.provisional ? el("span", { class: "k-chip", text: "Provisional date" }) : null
        ].filter(Boolean))
      ]),
      el("span", { class: "k-ex-when" }, [
        a.result ? el("span", { class: "k-chip", "data-tone": "green", text: resultText(a.result) }) : startByChip(a),
        el("span", { class: "k-ex-days", text: days == null ? "No date" : inDays(days) })
      ].filter(Boolean))
    ]);
  }
  function resultText(r) {
    if (!r) return "";
    var pct = r.marks != null && r.max ? Math.round(100 * r.marks / r.max) + "%" : null;
    return [r.grade, pct].filter(Boolean).join(" · ") || "Result in";
  }
  function group(title, list, holder) {
    if (!list.length) return;
    holder.appendChild(el("div", { class: "k-card k-ex-group", "data-ui": "exams.group" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: title }), el("span", { class: "k-card-meta", text: plural(list.length, "assessment") })])
    ].concat(list.map(row))));
  }

  function hub(main, tab) {
    var X = E();
    main.appendChild(KOS.ui.pageHeader({ kicker: "Study", title: "Exams & Deadlines",
      sub: "Every exam, mock, test and deadline: what it covers, when to start, and how practice is going.",
      actions: [examTabs("timetable"),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "exams.add", text: "+ Assessment",
          onclick: function () { editor(null, {}, function (a) { KOS.show("exams", a.id); }); } })] }));
    var t = KOS.srs.todayISO();
    var up = X.upcoming(t), past = X.past(t);
    var undated = X.all().filter(function (a) { return !a.archived && !a.date; });
    var wrap = el("div", { class: "k-ex", "data-ui": "exams.hub" });
    main.appendChild(wrap);
    if (!up.length && !past.length && !undated.length) {
      wrap.appendChild(KOS.ui.emptyState({ mark: "試", title: "No assessments yet",
        body: "Add a real exam, a mock, a topic test or an NEA deadline. Exams on your calendar move here by themselves.",
        action: el("button", { type: "button", class: "k-btn k-btn--primary", text: "+ Assessment", onclick: function () { editor(null, {}, function (a) { KOS.show("exams", a.id); }); } }) }));
      return;
    }
    var list = el("div", { class: "k-ex-col", "data-ui": "exams.timetable" });
    var week = KOS.srs.addDays(t, 7), month = KOS.srs.addDays(t, 28);
    group("This week", up.filter(function (a) { return a.date <= week; }), list);
    group("The next four weeks", up.filter(function (a) { return a.date > week && a.date <= month; }), list);
    group("Later", up.filter(function (a) { return a.date > month; }), list);
    group("No date yet", undated, list);
    if (tab === "past") group("Past", past, list);
    else if (past.length) list.appendChild(el("button", { type: "button", class: "k-link k-ex-more", "data-ui": "exams.past",
      text: "Show " + plural(past.length, "past assessment") + " →", onclick: function () { KOS.show("exams", "past"); } }));

    var side = el("div", { class: "k-ex-side", "data-ui": "exams.side" });
    var next = up.filter(function (a) { return a.tier !== "deadline"; })[0] || up[0];
    if (next) side.appendChild(nextCard(next));
    var sbs = up.map(function (a) { return { a: a, sb: X.startBy(a, t) }; }).filter(function (x) { return x.sb; })
      .sort(function (x, y) { return x.sb.date < y.sb.date ? -1 : 1; }).slice(0, 5);
    if (sbs.length) side.appendChild(el("div", { class: "k-card", "data-ui": "exams.startbys" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Start-by dates" }),
        el("span", { class: "k-card-meta", text: "when revision should begin" })])
    ].concat(sbs.map(function (x) {
      var passed = x.sb.date <= t;
      return el("button", { type: "button", class: "k-card-row k-ex-sbrow", onclick: function () { KOS.show("exams", x.a.id); } }, [
        el("span", { class: "k-ex-grow", text: x.a.title }),
        el("span", { class: "k-chip", "data-tone": passed ? "danger" : null, text: passed ? (x.sb.date === t ? "Today" : "Passed · " + pretty(x.sb.date)) : pretty(x.sb.date) })
      ]);
    }))));
    side.appendChild(practiceCard(null));
    wrap.appendChild(list);
    wrap.appendChild(side);
  }
  function nextCard(a) {
    var days = E().daysTo(a), sb = E().startBy(a);
    return el("div", { class: "k-card k-ex-next", "data-ui": "exams.next", style: "--s: " + (HUE[a.subject] || "var(--crimson)") }, [
      el("div", { class: "k-kicker", text: "Next up" }),
      el("button", { type: "button", class: "k-ex-next-title", text: a.title, onclick: function () { KOS.show("exams", a.id); } }),
      el("div", { class: "k-ex-next-days" }, [el("b", { text: days === 0 ? "Today" : days === 1 ? "Tomorrow" : String(days) }), days > 1 ? el("span", { text: "days" }) : null].filter(Boolean)),
      el("div", { class: "k-ex-meta" }, [tierChip(a), el("span", { text: pretty(a.date, true) + (a.time ? " · " + a.time : "") }),
        a.location ? el("span", { text: a.location }) : null].filter(Boolean)),
      sb ? el("p", { class: "k-muted k-ex-small", text: (sb.override ? "Start by " : "Suggested start ") + pretty(sb.date) + (sb.override ? "" : " · " + sb.why) }) : null
    ].filter(Boolean));
  }
  function practiceCard(a) {
    var entries = a ? KOS.tracker.forAssessment(a.id) : KOS.tracker.all();
    var since = KOS.srs.addDays(KOS.srs.todayISO(), -30);
    var recent = entries.filter(function (e) { return e.date >= since && e.role !== "result"; });
    var redo = KOS.tracker.redoCards().filter(function (c) { return !a || entries.some(function (e) { return e.id === c.entryId; }); });
    var due = redo.filter(function (c) { var m = KOS.srs.peek(c.key); return m && m.due && m.due <= KOS.srs.todayISO(); }).length;
    var rows = (a ? entries : recent).slice().sort(function (x, y) { return x.date > y.date ? -1 : 1; }).slice(0, a ? 8 : 4);
    return el("div", { class: "k-card", "data-ui": "exams.practice" }, [
      el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: a ? "Practice and result" : "Practice" }),
        el("span", { class: "k-card-meta", text: a ? (entries.length ? plural(entries.length, "attempt") : "") : (recent.length ? plural(recent.length, "paper") + " in 30 days" : "") }),
        el("button", { type: "button", class: "k-link", text: "Log a paper", onclick: function () { KOS.trackerLog({ assessmentId: a ? a.id : null }, function () { KOS.rerender(); }); } })
      ])
    ].concat(rows.length ? rows.map(function (e) {
      var p = KOS.tracker.pct(e);
      return el("div", { class: "k-card-row", "data-ui": "exams.attempt" }, [
        el("span", { class: "k-mono k-muted", text: pretty(e.date) }),
        el("span", { class: "k-ex-grow", text: (e.paper || e.topic || "Untitled") + (e.role === "result" ? " · the real paper" : "") }),
        e.timed ? el("span", { class: "k-chip", text: "Timed" }) : null,
        el("b", { class: "k-mono", text: p == null ? "—" : p + "%" })
      ].filter(Boolean));
    }) : [el("p", { class: "k-muted k-ex-small", text: a ? "No paper logged for this yet — the first timed one sets the baseline." : "Nothing logged in the last 30 days." })])
      .concat(redo.length ? [el("button", { type: "button", class: "k-card-row k-ex-sbrow", onclick: function () { KOS.show("due"); } }, [
        el("span", { class: "k-ex-grow", text: plural(redo.length, "redo item") }),
        due ? el("span", { class: "k-chip", "data-tone": "crimson", text: due + " due" }) : el("span", { class: "k-muted", text: "none due" })
      ])] : []));
  }

  /* ---------------- one assessment ---------------- */
  function page(main, id) {
    var a = E().get(id);
    if (!a) {
      main.appendChild(KOS.ui.pageHeader({ kicker: "Exams & Deadlines", title: "Not found", actions: [examTabs("timetable")] }));
      main.appendChild(KOS.ui.emptyState({ mark: "試", title: "That assessment is gone", body: "It may have been deleted on another device.",
        action: el("button", { type: "button", class: "k-btn", text: "Back to the timetable", onclick: function () { KOS.show("exams"); } }) }));
      return;
    }
    var t = E().tier(a.tier), days = E().daysTo(a);
    if (a.subject) main.style.setProperty("--accent", HUE[a.subject]);
    main.appendChild(KOS.ui.pageHeader({ kicker: t.label + (a.subject ? " · " + SUBJ[a.subject] : ""), title: a.title,
      sub: a.date ? pretty(a.date, true) + (a.time ? " · " + a.time : "") + (a.location ? " · " + a.location : "") + " · " + inDays(days) : "No date yet",
      actions: [
        el("button", { type: "button", class: "k-btn", "data-ui": "exams.edit", text: "Edit", onclick: function () { editor(a, {}, function () { KOS.rerender(); }); } }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "exams.log", text: "Log a paper",
          onclick: function () { KOS.trackerLog({ assessmentId: a.id }, function () { KOS.rerender(); }); } })
      ] }));
    var wrap = el("div", { class: "k-ex", "data-ui": "exams.page" });
    main.appendChild(wrap);
    var col = el("div", { class: "k-ex-col" }), side = el("div", { class: "k-ex-side" });
    if (a.tier === "deadline") col.appendChild(milestonesCard(a));
    else col.appendChild(scopeCard(a));
    col.appendChild(practiceCard(a));
    side.appendChild(logisticsCard(a));
    side.appendChild(startCard(a));
    if (a.notes) side.appendChild(el("div", { class: "k-card", "data-ui": "exams.notes" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Notes" })]),
      el("p", { class: "k-ex-pre", text: a.notes })
    ]));
    wrap.appendChild(col);
    wrap.appendChild(side);
  }
  function kv(dl, k, v) {
    if (v == null || v === "") return;
    dl.appendChild(el("dt", { text: k }));
    dl.appendChild(el("dd", { text: String(v) }));
  }
  function logisticsCard(a) {
    var dl = el("dl", { class: "k-ex-kvs" });
    kv(dl, "Date", a.date ? pretty(a.date, true) + (a.provisional ? " (provisional)" : "") : "Not set");
    kv(dl, "Time", a.time);
    if (a.durationMins) kv(dl, "Length", mins(a.durationMins) + (a.extraTime ? " + " + a.extraTime + "% extra time = " + mins(Math.round(a.durationMins * (1 + a.extraTime / 100))) : ""));
    kv(dl, "Where", [a.location, a.seat ? "seat " + a.seat : ""].filter(Boolean).join(" · "));
    kv(dl, "Paper", [a.board, a.qual, a.paper].filter(Boolean).join(" "));
    if (a.marks) kv(dl, "Marks", a.marks);
    kv(dl, "Calculator", a.calculator === "allowed" ? "Allowed" : a.calculator === "none" ? "Not allowed" : "");
    if (a.tier === "mock" || a.tier === "real_exam") kv(dl, "Flashcards", a.cap ? "Held for this exam where your recall on the day would be short" : "Not held for this mock");
    if (a.result) kv(dl, "Result", resultText(a.result));
    var pr = a.preset ? E().preset(a.preset) : null;
    var secs = pr && pr.sections && pr.sections.length > 1 ? el("ul", { class: "k-ex-sections", "data-ui": "exams.sections" },
      pr.sections.map(function (s) { return el("li", { text: s.title }); })) : null;
    return el("div", { class: "k-card", "data-ui": "exams.logistics" }, [
      el("div", { class: "k-card-head" }, [tierChip(a), el("span", { class: "k-card-title", text: "Logistics" })]), dl, secs
    ].filter(Boolean));
  }
  function startCard(a) {
    var sb = E().startBy(a), t = KOS.srs.todayISO();
    if (!sb || a.date < t) return el("div", { class: "k-card", "data-ui": "exams.start" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Start by" })]),
      el("p", { class: "k-muted k-ex-small", text: a.date ? "This has passed." : "Give it a date to get a start-by date." })
    ]);
    var passed = sb.date <= t;
    return el("div", { class: "k-card", "data-ui": "exams.start", "data-state": passed ? "passed" : null }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Start by" }),
        el("span", { class: "k-card-meta", text: sb.override ? "your date" : "suggested" })]),
      el("div", { class: "k-ex-big", "data-tone": passed ? "danger" : null, text: pretty(sb.date, true) + (passed ? " · " + (sb.date === t ? "today" : "passed") : "") }),
      el("p", { class: "k-muted k-ex-small", text: sb.override ? "Set by you. Clear it in Edit to see the suggestion." :
        sb.why + (sb.weeklyFrom === "default" ? " (6 h a week until your ledger says otherwise)" : sb.weeklyFrom === "ledger" ? " (from your last four weeks)" : "") + "." }),
      sb.milestone ? el("p", { class: "k-ex-small", text: "Next milestone: " + sb.milestone.text + " · " + pretty(sb.milestone.date) }) : null
    ].filter(Boolean));
  }
  /* the scope, grouped by unit, with the exclusions called out */
  function scopeCard(a) {
    var X = E(), ls = X.leaves(a), ex = X.excluded(a), growth = X.ruleGrowth(a);
    var byUnit = {}, order = [];
    ls.forEach(function (k) {
      var p = KOS.spec.parse(k), n = p && KOS.spec.node(p.subject, p.ref);
      if (!n) return;
      var uk = p.subject + ":" + n.unit;
      if (!byUnit[uk]) { byUnit[uk] = []; order.push(uk); }
      byUnit[uk].push(n);
    });
    /* units in specification order, whichever pick brought them in */
    var units = {};
    ["compsci", "maths", "it"].forEach(function (sid) { KOS.spec.units(sid).forEach(function (u, i) { units[u.key] = i; }); });
    order.sort(function (x, y) { return x.split(":")[0] === y.split(":")[0] ? (units[x] || 0) - (units[y] || 0) : x < y ? -1 : 1; });
    var p = a.scope.pacing;
    return el("div", { class: "k-card", "data-ui": "exams.scope" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "What it covers" }),
        el("span", { class: "k-card-meta", text: ls.length ? plural(ls.length, "topic") + " across " + plural(order.length, "unit") : "No topics in scope yet" })]),
      p ? el("p", { class: "k-ex-small", "data-ui": "exams.pacing-rule", text: p.frozen
        ? "Includes what Pacing had covered up to " + pretty(p.upTo || a.date) + " — fixed on " + pretty(p.frozenAt) + ", so later plan edits don't change it."
        : "Includes everything Pacing covers up to " + pretty(p.upTo || a.date) + (growth > 0 ? " · +" + plural(growth, "topic") + " since you made this" : "") + "." }) : null,
      order.length ? el("div", { class: "k-ex-units" }, order.map(function (uk) {
        var pu = KOS.spec.parse(uk), un = pu && KOS.spec.node(pu.subject, pu.ref);
        var list = byUnit[uk], all = un ? un.leafCount : list.length;
        return el("details", { class: "k-ex-unit", "data-ui": "exams.unit" }, [
          el("summary", {}, [el("span", { class: "k-mono", text: pu ? pu.ref : uk }), el("span", { class: "k-ex-grow", text: un ? un.title : "" }),
            el("span", { class: "k-muted", text: list.length === all ? "all " + all : list.length + " of " + all })]),
          el("ul", {}, list.map(function (n) {
            return el("li", {}, [el("button", { type: "button", class: "k-link", onclick: function () { KOS.show("ref", { subject: n.subject, ref: n.ref }); } }, [
              el("span", { class: "k-mono", text: n.ref + " " }), document.createTextNode(n.title)])]);
          }))
        ]);
      })) : null,
      ex.length ? el("div", { class: "k-ex-callout", "data-ui": "exams.excluded", role: "note" }, [
        el("b", { text: "Excluded from this test" }),
        el("p", { class: "k-ex-small", text: "These won't appear — don't revise them for this one." }),
        el("ul", {}, ex.map(function (x) { return el("li", {}, [el("span", { class: "k-mono", text: x.ref + " " }), document.createTextNode(x.title + (x.leaves > 1 ? " (" + x.leaves + " topics)" : ""))]); }))
      ]) : null
    ].filter(Boolean));
  }
  function milestonesCard(a) {
    var t = KOS.srs.todayISO();
    var ms = a.milestones.slice().sort(function (x, y) { return (x.date || "9") < (y.date || "9") ? -1 : 1; });
    return el("div", { class: "k-card", "data-ui": "exams.milestones" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Milestones" }),
        el("span", { class: "k-card-meta", text: ms.length ? ms.filter(function (m) { return m.done; }).length + " of " + ms.length + " done" : "" })])
    ].concat(ms.length ? ms.map(function (m) {
      var late = !m.done && m.date && m.date < t;
      var box = el("input", { type: "checkbox", class: "k-box", "aria-label": "Done: " + m.text, onchange: function () {
        var list = a.milestones.map(function (x) { return x.id === m.id ? Object.assign({}, x, { done: box.checked }) : x; });
        E().update(a.id, { milestones: list });
        KOS.rerender();
      } });
      box.checked = m.done;
      return el("label", { class: "k-card-row k-ex-ms", "data-ui": "exams.milestone", "data-state": m.done ? "done" : late ? "late" : null }, [
        box, el("span", { class: "k-ex-grow", text: m.text }),
        m.date ? el("span", { class: "k-chip", "data-tone": late ? "danger" : null, text: (late ? "Late · " : "") + pretty(m.date) }) : null
      ].filter(Boolean));
    }) : [el("p", { class: "k-muted k-ex-small", text: "Add the steps between now and the hand-in in Edit." })]));
  }

  /* ---------------- the editor and the Scope Builder ---------------- */
  function editor(existing, seed, onSaved) {
    var X = E();
    var d = existing ? JSON.parse(JSON.stringify(existing)) : X.normalise(Object.assign({ tier: "real_exam" }, seed || {}));
    var overlay = el("div", { class: "k-dialog-overlay" });
    function close() { overlay.remove(); }
    overlay.close = close;
    function field(label, control, cls) {
      return el("label", { class: "k-field" + (cls ? " " + cls : ""), "data-ui": "ui.field" }, [el("span", { class: "k-field-label", text: label }), control]);
    }
    function input(type, attrs) { return el("input", Object.assign({ type: type, class: "k-input" }, attrs || {})); }
    function select(opts, value) {
      var s = el("select", { class: "k-input" }, opts.map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
      s.value = value == null ? "" : value;
      return s;
    }
    var title = input("text", { value: d.title, placeholder: "e.g. CS Paper 1 · Summer 2027" });
    var tierSel = select(X.TIERS.map(function (t) { return [t.v, t.label]; }), d.tier);
    var subjSel = select([["", "Several or none"], ["compsci", SUBJ.compsci], ["maths", SUBJ.maths], ["it", SUBJ.it]], d.subject || "");
    var presetSel = el("select", { class: "k-input", "aria-label": "Board paper" });
    function fillPresets() {
      presetSel.innerHTML = "";
      presetSel.appendChild(el("option", { value: "", text: "No board paper" }));
      X.presets().filter(function (p) { return !subjSel.value || p.subject === subjSel.value; }).forEach(function (p) {
        presetSel.appendChild(el("option", { value: p.id, text: p.title + (p.level === "AS" ? " (AS)" : "") }));
      });
      presetSel.value = d.preset || "";
    }
    fillPresets();
    var date = input("date", { value: d.date || "" });
    var time = input("time", { value: d.time || "" });
    var dur = input("number", { min: 1, max: 600, value: d.durationMins || "", placeholder: "minutes" });
    var loc = input("text", { value: d.location, placeholder: "e.g. Sports hall" });
    var seat = input("text", { value: d.seat, placeholder: "e.g. 42" });
    var marks = input("number", { min: 0, value: d.marks == null ? "" : d.marks });
    var calc = select([["", "—"], ["allowed", "Allowed"], ["none", "Not allowed"]], d.calculator || "");
    var extra = input("number", { min: 0, max: 100, step: 5, value: d.extraTime || "", placeholder: "0" });
    var prov = el("input", { type: "checkbox", class: "k-box" }); prov.checked = !!d.provisional;
    var cap = el("input", { type: "checkbox", class: "k-box", "data-ui": "exams.cap" }); cap.checked = !!d.cap;
    var startBy = input("date", { value: d.startBy || "" });
    var notes = el("textarea", { class: "k-input", rows: 3, placeholder: "Equipment, travel, anything to remember" });
    notes.value = d.notes || "";

    /* the Scope Builder (plan §6): include, the Pacing rule, exclude */
    var inc = KOS.topicPicker({ label: "Include", multi: true, value: d.scope.include, onChange: preview });
    var exc = KOS.topicPicker({ label: "Exclude (always wins)", multi: true, value: d.scope.exclude, onChange: preview });
    var pacingOn = el("input", { type: "checkbox", class: "k-box", "data-ui": "exams.pacing" });
    pacingOn.checked = !!d.scope.pacing;
    var pacingUpTo = input("date", { value: (d.scope.pacing && d.scope.pacing.upTo) || "", "aria-label": "Covered up to", class: "k-input k-ex-date-in" });
    var frozen = d.scope.pacing && d.scope.pacing.frozen;
    var y2 = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "exams.year2", text: "Exclude Year 2 content", onclick: function () {
      var sid = subjSel.value;
      var list = sid ? X.year2Only(sid) : [];
      if (!list.length) { KOS.ui.toast(sid ? "No Year 2 list for this subject yet." : "Pick a subject first.", true); return; }
      exc.set(KOS.spec.normaliseRefs(exc.value().concat(list)));
      preview();
    } });
    var pv = el("div", { class: "k-ex-preview", "data-ui": "exams.scope-preview", role: "status" });
    function scopeNow() {
      return { include: inc.value(), exclude: exc.value(),
        pacing: pacingOn.checked ? (frozen ? d.scope.pacing : { upTo: pacingUpTo.value || null, frozen: null, seen: d.scope.pacing ? d.scope.pacing.seen : null }) : null };
    }
    function preview() {
      var probe = X.normalise({ subject: subjSel.value || null, date: date.value || null, scope: scopeNow() });
      var n = X.leaves(probe).length, x = KOS.spec.resolve(probe.scope.exclude).length;
      pv.textContent = n ? plural(n, "topic") + " in scope" + (x ? " · " + x + " excluded" : "") : "Nothing in scope yet — pick a board paper or add topics.";
    }
    function applyPreset() {
      var p = X.preset(presetSel.value);
      if (!p) return;
      if (!title.value.trim() || (d.preset && X.preset(d.preset) && title.value === X.preset(d.preset).title)) title.value = p.title;
      if (!subjSel.value) { subjSel.value = p.subject; }
      if (!dur.value && p.mins) dur.value = p.mins;
      if (!marks.value && p.marks) marks.value = p.marks;
      if (!calc.value && p.calculator) calc.value = p.calculator;
      inc.set(KOS.spec.normaliseRefs(inc.value().concat(p.include)));
      if (p.excludeYear2) exc.set(KOS.spec.normaliseRefs(exc.value().concat(X.year2Only(p.subject))));
      d.preset = p.id;
      preview();
    }
    presetSel.addEventListener("change", applyPreset);
    subjSel.addEventListener("change", function () { fillPresets(); preview(); });
    [date, pacingUpTo].forEach(function (i) { i.addEventListener("input", preview); });
    pacingOn.addEventListener("change", preview);

    /* milestones (deadline tier) */
    var msHost = el("div", { class: "k-ex-mslist", "data-ui": "exams.ms-edit" });
    var ms = d.milestones.map(function (m) { return Object.assign({}, m); });
    function drawMs() {
      msHost.innerHTML = "";
      ms.forEach(function (m, i) {
        var tx = input("text", { value: m.text, "aria-label": "Milestone " + (i + 1), oninput: function () { m.text = tx.value; } });
        var dt = input("date", { value: m.date || "", "aria-label": "Milestone date", oninput: function () { m.date = dt.value || null; } });
        msHost.appendChild(el("div", { class: "k-ex-msrow" }, [tx, dt,
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Remove milestone", text: "✕", onclick: function () { ms.splice(i, 1); drawMs(); } })]));
      });
      msHost.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", text: "+ Milestone", onclick: function () { ms.push({ text: "", date: null, done: false }); drawMs(); } }));
    }
    drawMs();

    var scopeSec = el("fieldset", { class: "k-ex-fs", "data-ui": "exams.scope-builder" }, [
      el("legend", { text: "What it covers" }),
      el("div", { class: "k-ex-form" }, [
        field("Board paper", presetSel, "k-ex-span"),
        el("div", { class: "k-ex-span" }, [inc.el]),
        el("div", { class: "k-ex-span k-ex-inline", "data-ui": "exams.pacing-row" }, [
          el("label", { class: "k-check" }, [pacingOn, el("span", { text: frozen ? "Covered in Pacing (fixed on " + pretty(d.scope.pacing.frozenAt) + ")" : "Add everything covered in Pacing so far, up to" })]),
          frozen ? null : pacingUpTo, frozen ? null : el("span", { class: "k-muted k-ex-small", text: "blank = the date" })].filter(Boolean)),
        el("div", { class: "k-ex-span" }, [exc.el]),
        el("div", { class: "k-ex-span k-ex-inline" }, [y2, pv])
      ])
    ]);
    var msSec = el("fieldset", { class: "k-ex-fs", "data-ui": "exams.ms-builder" }, [el("legend", { text: "Milestones" }), msHost]);
    var capRow = el("label", { class: "k-check k-ex-span" }, [cap, el("span", { text: "Hold flashcards for this mock (bring reviews forward when recall on the day would be short)" })]);
    function syncTier() {
      var tv = tierSel.value;
      scopeSec.hidden = tv === "deadline";
      msSec.hidden = tv !== "deadline";
      capRow.hidden = tv !== "mock";
    }
    tierSel.addEventListener("change", syncTier);

    var errBox = el("div", { class: "k-field-error", role: "alert", hidden: "" });
    function save() {
      if (!title.value.trim()) { errBox.hidden = false; errBox.textContent = "Give it a name."; title.focus(); return; }
      var patch = {
        title: title.value.trim(), tier: tierSel.value, subject: subjSel.value || null, preset: presetSel.value || null,
        date: date.value || null, time: time.value || null, durationMins: dur.value === "" ? null : Number(dur.value),
        location: loc.value, seat: seat.value, marks: marks.value === "" ? null : Number(marks.value),
        calculator: calc.value, extraTime: extra.value === "" ? 0 : Number(extra.value), provisional: prov.checked,
        cap: cap.checked, startBy: startBy.value || null, notes: notes.value,
        scope: scopeNow(), milestones: ms.filter(function (m) { return String(m.text || "").trim(); })
      };
      var a = existing ? X.update(existing.id, patch) : X.add(patch);
      KOS.ui.toast(existing ? "Saved." : "Added to Exams & Deadlines.");
      close();
      onSaved && onSaved(a);
    }
    var body = el("div", { class: "k-dialog-body" }, [
      errBox,
      el("div", { class: "k-ex-form" }, [
        field("Name", title, "k-ex-span"),
        field("Kind", tierSel), field("Subject", subjSel),
        field("Date", date), field("Start time", time),
        field("Length (minutes)", dur), field("Extra time (%)", extra),
        field("Where", loc), field("Seat", seat),
        field("Marks", marks), field("Calculator", calc),
        el("label", { class: "k-check" }, [prov, el("span", { text: "The date is provisional" })]),
        field("Start by (blank = suggested)", startBy),
        capRow,
        field("Notes", notes, "k-ex-span")
      ]),
      scopeSec, msSec
    ]);
    overlay.appendChild(el("div", { class: "k-dialog k-ex-dialog", "data-ui": "ui.dialog exams.editor" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
        el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "試" }),
        el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: existing ? "Edit assessment" : "New assessment" })
      ]),
      body,
      el("div", { class: "k-dialog-foot" }, [
        existing ? el("button", { type: "button", class: "k-btn k-btn--danger", "data-intent": "danger", text: "Delete", onclick: function () {
          KOS.ui.confirm({ title: "Delete this assessment?", body: "Its practice papers stay in the record; goals linked to it are unlinked, not deleted.", danger: true, confirm: "Delete" }, function () {
            X.remove(existing.id); close(); KOS.show("exams");
          });
        } }) : null,
        el("span", { class: "k-spacer" }),
        el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: close }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "exams.save", text: existing ? "Save changes" : "Add", onclick: save })
      ].filter(Boolean))
    ]));
    KOS.ui.openDialog(overlay);
    syncTier();
    preview();
    title.focus();
    return overlay;
  }
  KOS.examEditor = editor;

  /* ---------------- the view ---------------- */
  KOS.views.exams = function (main, arg) {
    KOS.shell.tree("none");
    if (arg && typeof arg === "object" && arg.id) return page(main, arg.id);
    if (typeof arg === "string" && arg && arg !== "timetable" && arg !== "past") return page(main, arg);
    hub(main, arg);
  };
})();
