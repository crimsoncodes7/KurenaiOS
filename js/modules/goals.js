/* Kurenai OS — modules/goals.js
   Goals (roadmap 5.4, design turn 27: 27i–27l, 27r, 27s): one page for
   goals about Study, Productivity, Money, Code, the Collection and the
   Governor, under Productivity.

     #/goals            All · #/goals/week · #/goals/month · #/goals/done
     #/goals/<id>       one goal opened (27j)

   The model is the Goals engine, core/goals.js (KOS.goals): this file only
   draws, and every write goes through it. The page leads with the goal
   that needs you soonest (a ring with the straight line's tick, one
   sentence that closes the gap, the button that does it, the run of past
   periods); every other goal is a card with its next step.

   GOVERNOR BOUNDARY: nothing here pays. Completion records one activity-
   only receipt in the engine (invariant 5b) and the page says "Met".
   A render writes nothing beyond what compute() settles (smoke56). */
(function () {
  "use strict";
  var el = KOS.ui.el, U = KOS.ui, store = KOS.store, G = KOS.goals;
  var TABS = [["week", "This week"], ["month", "This month"], ["all", "All"], ["done", "Done"]];
  var DOMAIN = {
    study: { k: "学", label: "Study" }, productivity: { k: "集", label: "Productivity" }, money: { k: "円", label: "Money" },
    code: { k: "C#", label: "Code", mono: true }, collection: { k: "蒐", label: "Collection" }, governor: { k: "守", label: "Governor" }
  };
  var DOMAIN_ORDER = ["study", "productivity", "money", "code", "collection", "governor"];
  var SUBJECT_TONE = { compsci: "cs", maths: "maths", it: "it", code: "code" };
  var MODULE_TONE = { anime: "anime", books: "books", vn: "vn", game: "games" };
  var MODULE_K = { anime: "映", books: "本", vn: "選", game: "遊" };
  /* per visit (never stored) */
  var visit = { domain: "" };

  /* ---------------- small helpers ---------------- */
  var MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DAY3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function parse(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2] || 1); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function today() { return G.todayISO(); }
  function addDays(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
  function between(a, b) { return Math.round((parse(b) - parse(a)) / 86400000); }
  function dayLabel(s) { var d = parse(s); return DAY3[d.getDay()] + " " + d.getDate() + " " + MON3[d.getMonth()]; }
  function shortDate(s) { var d = parse(s); return d.getDate() + " " + MON3[d.getMonth()]; }
  function announce(t) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(t); }
  function redraw() { KOS.rerender(); }
  function btn(text, cls, onclick, hook, extra) {
    return el("button", Object.assign({ type: "button", class: "k-btn" + (cls ? " " + cls : ""), "data-ui": hook || null, text: text, onclick: onclick }, extra || {}));
  }
  function chip(text, tone) { return el("span", { class: "k-chip", "data-tone": tone || null, text: text }); }
  function kicker(text) { return el("div", { class: "k-kicker", text: text }); }
  function card(kids, cls, hook) { return el("section", { class: "k-card" + (cls ? " " + cls : ""), "data-ui": hook || null }, kids.filter(Boolean)); }
  function head(title, meta, link) {
    return el("div", { class: "k-card-head" }, [el("h2", { class: "k-card-title", text: title }),
      meta ? el("span", { class: "k-card-meta", text: meta }) : null,
      link ? el("button", { type: "button", class: "k-link", text: link[0], onclick: link[1] }) : null].filter(Boolean));
  }
  function field(label, control, hint) {
    return el("label", { class: "k-field", "data-ui": "ui.field" }, [el("span", { class: "k-field-label", "data-ui": "ui.field-label", text: label }), control,
      hint ? el("span", { class: "k-field-hint", text: hint }) : null].filter(Boolean));
  }
  function input(type, value, attrs) { var n = el("input", Object.assign({ type: type, class: "k-input" }, attrs || {})); if (value != null) n.value = value; return n; }
  function select(options, value, attrs) {
    return el("select", Object.assign({ class: "k-input" }, attrs || {}), options.map(function (o) {
      var opt = el("option", { value: o[0], text: o[1] }); if (String(o[0]) === String(value)) opt.selected = true; return opt;
    }));
  }
  function seg(items, current, onPick, label, cls) {
    return U.tabs(items.map(function (it) { return { label: it[1], count: it[2], active: it[0] === current, onSelect: function () { onPick(it[0]); } }; }),
      { variant: "workspace", label: label, className: "k-seg--quiet" + (cls ? " " + cls : "") });
  }
  /* ---- exam goals (29v): linked to one assessment of the Exams hub ---- */
  function examOf(g) { return KOS.goalsExams && g.links && g.links.examId ? KOS.goalsExams.examOf(g) : null; }
  function isExam(g) { var d = G.typeDef(g.type); return !!(d && d.exam); }
  function examChip(g) {
    if (g._unlinked || (g.params && g.params.examGone && !(g.links && g.links.examId))) {
      return el("span", { class: "k-gl-examchip", "data-state": "gone", "data-ui": "goal.exam-chip" }, [el("span", { "aria-hidden": "true", text: "⊘" }), "Exam removed · unlinked"]);
    }
    var a = examOf(g);
    if (!a) return null;
    return el("span", { class: "k-gl-examchip", "data-tone": SUBJECT_TONE[a.subject] || null, "data-ui": "goal.exam-chip" }, [
      el("i", { class: "k-gl-examdot", "aria-hidden": "true" }), a.title + (a.date ? " · " + dayLabel(a.date) : "")]);
  }
  function examNext(g) {
    var a = examOf(g), cur = g._current, tgt = g._target || g.target;
    if (!a) return null;
    if (cur == null) return g._meta || null;
    if (g._status === "completed") return null;
    var left = Math.max(0, tgt - cur), dl = daysLeft(g);
    if (g.type === "exam_recall") {
      var due = KOS.examPlan ? KOS.examPlan.dueInScope(a, today()) : 0;
      return cur >= tgt ? "At the target; it is judged on " + dayLabel(g.deadline) + ", so keep the reviews going." : "Keep the reviews in scope going" + (due ? ": " + due + " due today." : ".");
    }
    if (g.type === "exam_papers_done") {
      var np = KOS.examPlan ? KOS.examPlan.nextPaper(a) : null, every = dl != null && dl > 0 && left ? Math.max(1, Math.floor((dl + 1) / left)) : null;
      return (left === 1 ? "One more paper" : left + " more papers") + (every && every > 1 ? ": one every " + (every >= 28 ? Math.round(every / 7) + " weeks" : every + " days") + " gets you there" : "") + "." +
        (np && KOS.examIndex ? " Next: " + KOS.examIndex.sittingLabel(np.sitting) + "." : "");
    }
    if (g.type === "exam_checklist") {
      var list = KOS.exams.checklist(a), next = list.filter(function (c) { return !c.done && !c.auto; })[0] || list.filter(function (c) { return !c.done; })[0];
      return next ? "Next: " + next.text.charAt(0).toLowerCase() + next.text.slice(1) + "." : null;
    }
    if (g.type === "exam_topics_green") return left + " to go." + (g.params && g.params.basis === "covered" ? " A topic counts once it is ticked in Pacing or started." : " A topic counts once it is Green.");
    if (g.type === "exam_grade") return g._meta || null;
    return null;
  }
  function examAction(g) {
    var a = examOf(g);
    if (g._unlinked) return ["Link to an exam", function () { linkDialog(g); }];
    if (!a) return null;
    if (g.type === "exam_recall") return ["Review", function () { KOS.show("review", { tab: "due", run: "scope:" + a.id }); }];
    if (g.type === "exam_papers_done") return ["Plan a paper", function () { KOS.show("exams", "plan"); }];
    if (g.type === "exam_checklist") return ["Open checklist", function () { KOS.show("exams", a.id); }];
    if (g.type === "exam_topics_green") return ["Readiness", function () { KOS.show("exams", { id: a.id, tab: "readiness" }); }];
    return ["Open the exam", function () { KOS.show("exams", a.id); }];
  }
  /* the exams a type can link to: upcoming, of a tier the type offers */
  function examChoices(typeId, keep) {
    if (!KOS.exams || !KOS.goalsExams) return [];
    var tiers = G.typeDef(typeId).tiers || [];
    return KOS.exams.upcoming().filter(function (a) {
      return a.id === keep || (tiers.indexOf(a.tier) !== -1 && (typeId !== "exam_checklist" || KOS.exams.checklist(a).length));
    });
  }
  function linkDialog(g) {
    var list = examChoices(g.type, null);
    var sel = select(list.map(function (a) { return [a.id, a.title + (a.date ? " · " + dayLabel(a.date) : "")]; }), "", { "aria-label": "Exam" });
    var ov = dialogBox("Link to an exam", "試", [list.length ? field("Exam", sel, "The goal picks up from here; nothing was lost.")
      : el("p", { class: "k-muted k-gl-small", text: "No exam it can follow is coming up. Add one in Exams first." })],
      [el("span"), btn("Cancel", "", function () { ov.remove(); }), list.length ? btn("Link", "k-btn--primary", function () {
        var a = KOS.exams.get(sel.value);
        G.linkExam(g.id, sel.value); ov.remove(); announce("Linked to " + a.title); redraw();
      }, "goal.link-save") : null].filter(Boolean), "goal.link-dialog", "k-gl-dialog--form");
  }
  function isMoney(g) { return /^[£$€¥]$|^[A-Z]{3}$/.test(g._unit || ""); }
  function hm(hours) {
    var m = Math.round((hours || 0) * 60);
    return Math.floor(m / 60) + " h" + (m % 60 ? " " + (m % 60) + " m" : "");
  }
  /* a figure in its own unit: hours as "7 h 40 m", money as an amount */
  function figure(g, v, opts) {
    opts = opts || {};
    if (v == null) return el("span", { class: "k-gl-big", text: "–" });
    if (isMoney(g)) return U.amount(Math.round(v * 100), { size: opts.size || "30" });
    if (g._unit === "hours") return el("span", { class: "k-gl-big", "data-size": opts.size || null, text: hm(v) });
    return el("span", { class: "k-gl-big", "data-size": opts.size || null, text: String(Math.round(v * 10) / 10) });
  }
  function word(g, v) {
    if (v == null) return "–";
    if (isMoney(g)) return KOS.money && KOS.money.isHidden() ? "" : KOS.money.format(Math.round(v * 100));
    if (g._unit === "hours") return hm(v);
    return String(Math.round(v * 10) / 10) + (g._unit ? " " + g._unit : "");
  }
  function domainOf(g) { return g._domain || g.domain || "collection"; }
  function tone(g) {
    var d = domainOf(g);
    if (g._unlinked) return null;
    if (d === "study") return SUBJECT_TONE[g.links && g.links.subject] || null;
    if (d === "code") return "code";
    if (d === "money") return g.links && g.links.category === "collection" ? "collection" : g.type === "money-save" ? "jade" : null;
    if (d === "collection") return MODULE_TONE[g.module] || "collection";
    return null;
  }
  function pillText(g) {
    var d = DOMAIN[domainOf(g)] || DOMAIN.collection, bits = [d.label];
    if (g.links && g.links.subject && KOS.subjects) bits.push((KOS.subjects.get ? (KOS.subjects.get(g.links.subject) || {}).short : null) || { compsci: "CS", maths: "Maths", it: "IT", code: "Code" }[g.links.subject]);
    if (domainOf(g) === "collection" && g.module) bits.push({ anime: "Anime", books: "Books", vn: "VN", game: "Games" }[g.module]);
    if (g.repeat) bits.push(g.repeat === "week" ? "weekly" : "monthly");
    return bits.filter(Boolean).join(" · ");
  }
  function pillMark(g) {
    var mono = markOf(g) === "C#", cls = mono ? "k-mono k-gl-pillmark" : "k-kanji k-gl-pillmark";
    return el("span", { class: cls, text: markOf(g) });
  }
  function markOf(g) { if (isExam(g)) return "試"; return domainOf(g) === "collection" && g.module ? MODULE_K[g.module] : (DOMAIN[domainOf(g)] || DOMAIN.collection).k; }
  /* the chip a goal shows: its pace, or why it has none */
  function paceKind(g) {
    if (g.archived) return "archived";
    if (g._unlinked) return null;
    if (g._displayOnly) return "display";
    /* a stay-under goal still running has no line: Under or Over */
    if (g._direction === "under" && g._status !== "completed" && g._status !== "failed") return g._pace || "under";
    if (g._status === "completed" || g._status === "met") return "met";
    if (g._status === "failed") return "missed";
    if (g.type === "code-capstone" && !g._current) return "notyet";
    return g._pace || (g._period || g.deadline ? null : "none");
  }
  function daysLeft(g) {
    var end = g._period ? g._period.to : g.deadline;
    return end ? between(today(), end) : null;
  }
  function whenText(g) {
    var dl = daysLeft(g);
    if (g._unlinked) return "kept as it was";
    if (dl == null) return g._displayOnly ? "Shown only" : "No deadline, so no pace";
    var left = dl < 0 ? "ended " + shortDate(g._period ? g._period.to : g.deadline) : dl === 0 ? "ends tonight" : dl + (dl === 1 ? " day left" : " days left");
    if (g._period) return left + " · " + (g.repeat === "week" ? DAY3[parse(g._period.from).getDay()] + "–" + DAY3[parse(g._period.to).getDay()] : MONTHS[parse(g._period.from).getMonth()]);
    return left + " · by " + dayLabel(g.deadline);
  }
  /* the next concrete step, in one line */
  function nextStep(g) {
    var cur = g._current || 0, tgt = g._target || g.target, left = Math.max(0, tgt - cur), dl = daysLeft(g);
    if (g._unlinked) return "The exam was deleted" + (g.params.examGone.at ? " on " + dayLabel(g.params.examGone.at) : "") + ". Link it to another exam to keep it going; nothing was lost.";
    if (isExam(g)) { var xs = examNext(g); if (xs) return xs; }
    if (g._displayOnly) return (left ? left + " more to go. " : "") + "Shown only; a goal never pays.";
    if (g._direction !== "under" && (g._status === "completed" || g._status === "met")) return "Met. Nothing more to do here.";
    if (g._direction === "under") return isMoney(g) ? (KOS.money && KOS.money.isHidden() ? "Room left before the limit." : KOS.money.format(Math.round(Math.max(0, tgt - cur) * 100)) + " left before the limit.") : (cur ? cur + " to clear." : "Clear so far.");
    if (g._current == null) return g._meta || "Nothing to measure yet.";
    if (!left) return "Reached.";
    if (g._unit === "hours") {
      var perDay = dl != null && dl >= 0 ? left / (dl + 1) : null;
      return hm(left) + " to go." + (perDay ? " About " + hm(Math.ceil(perDay * 6) / 6) + (dl === 0 ? " tonight" : dl === 1 ? " today and tomorrow" : " a day") + " gets you there." : "");
    }
    if (isMoney(g)) return (word(g, left) ? word(g, left) + " to go." : "Some to go.") + (g._meta ? " Reads the " + g._meta + " pot." : "");
    var u = g._unit || "";
    var every = dl != null && dl > 0 && left ? Math.max(1, Math.floor((dl + 1) / left)) : null;
    return left + " to go" + (every && every > 1 ? ". One every " + every + " days keeps it." : ".");
  }
  /* the action that moves a goal */
  function actionFor(g) {
    var t = g.type;
    if (isExam(g)) return examAction(g);
    if (t === "study-hours" || t === "focus-hours" || t === "focus-blocks") return ["Start focus", function () { KOS.show("focus"); }];
    if (t === "topics-green" || t === "study-finish-unit" || t === "cards-reviewed" || t === "recall-rate") {
      var sid = g.links && g.links.subject;
      if (t === "cards-reviewed" || t === "recall-rate") return ["Review", function () { KOS.show("review"); }];
      return [sid ? "Open " + ({ compsci: "Computer Science", maths: "Maths", it: "IT", code: "Code" }[sid] || "the subject") : "Study", function () { KOS.show("subject", sid || (store.state.ui.subject || "compsci")); }];
    }
    if (t === "code-tasks") return ["Today's Daily 20", function () { KOS.show("subject", "code"); }];
    if (t === "code-retrievals") return ["Retrieval", function () { KOS.show("code", { page: "retrieval" }); }];
    if (t === "code-capstone") return ["See capstones", function () { KOS.show("code", { page: "map" }); }];
    if (t === "money-save") return ["Open pot", function () { KOS.show("money", "pots"); }];
    if (t === "money-spend-under") return g.links && g.links.category === "collection" ? ["Wishlist", function () { KOS.show("wishlist"); }] : ["Budgets", function () { KOS.show("money", "budgets"); }];
    if (/^money-/.test(t)) return ["Money", function () { KOS.show("money"); }];
    if (t === "plan-ticked" || t === "carryovers-cleared") return ["The plan", function () { KOS.show("pacing"); }];
    if (t === "todos-done" || t === "habit-streak") return ["Habits", function () { KOS.show("tasks"); }];
    if (t === "no-overdue") return ["Assignments", function () { KOS.show("assignments"); }];
    if (t === "study-paper-score") return ["Exams & Papers", function () { KOS.show("tracker"); }];
    if (t === "custom-manual" && g._status === "active") return ["+1", function () { G.nudge(g.id, 1); announce(g.title + ", " + ((g.current || 0) + 1) + " of " + g.target); redraw(); }];
    if (domainOf(g) === "collection") return ["Collection", function () { KOS.show(g.module ? (g.module === "game" ? "game" : g.module) : "matrix"); }];
    return null;
  }
  /* a goal's visual: the strip for a repeating goal, squares for a small
     count, the category bar for a stay-under spend, else a bar */
  function strip(g, size) {
    var keys = Object.keys(g.outcomes || {}).sort().slice(-12), items = keys.map(function (k) {
      var o = g.outcomes[k];
      return { state: o.met ? "met" : "missed", label: (g.repeat === "week" ? "Week of " : "") + shortDate(k.length === 7 ? k + "-01" : k) + ", " + (o.met ? "met" : "missed") + ", " + word(g, o.value) };
    });
    if (g._period) items.push({ state: "open", fill: g._target ? Math.min(1, (g._current || 0) / g._target) : 0, label: "This " + (g.repeat === "week" ? "week" : "month") + ", open, " + word(g, g._current) });
    return U.periods(items, { size: size, label: "Every " + (g.repeat === "week" ? "week" : "month") });
  }
  function squares(n, filled, toneName) {
    var list = el("div", { class: "k-gl-squares", "data-tone": toneName || null, role: "img", "aria-label": filled + " of " + n });
    for (var i = 0; i < n; i++) list.appendChild(el("span", { class: "k-gl-sq", "data-state": i < filled ? "on" : null }));
    return list;
  }
  function visual(g) {
    if (g.repeat) return strip(g, "sm");
    if (g._unlinked) return null;
    if (g.type === "exam_recall" && g._current != null) {
      var rt = g._target || g.target;
      return U.ring({ p: rt ? g._current / rt : 0, tick: g._expected != null && rt ? Math.min(1, g._expected / rt) : null, size: 92, met: g._status === "completed",
        label: g._current + "% of " + rt + "%" + (g._expected != null ? "; the line is at " + Math.round(g._expected) + "%" : "") }, [
        el("span", { class: "k-mono k-gl-strong", text: g._current + "%" }), el("span", { class: "k-muted k-gl-tiny", text: "of " + rt })]);
    }
    if (g.type === "money-spend-under" || g.type === "spend-below") return U.catBar({ name: g.links && g.links.category ? (KOS.money.category(g.links.category) || {}).name : "Spending", tone: g.links && g.links.category ? (KOS.money.category(g.links.category) || {}).tone : "muted",
      spent: Math.round((g._current || 0) * 100), budget: Math.round((g._target || 0) * 100), foot: false });
    if (isMoney(g) || g._current == null) return null;
    var t = g._target || g.target;
    if (t <= 20 && t === Math.round(t) && g._unit !== "hours") return squares(t, Math.min(t, Math.floor(g._current || 0)), g._displayOnly ? "teal" : g._domain === "code" ? "code" : isExam(g) ? tone(g) || "green" : "green");
    var b = el("div", { class: "k-bar k-bar--6 k-gl-bar", "data-tone": tone(g) || null, role: "img", "aria-label": g._pct + "%" }, [el("i")]);
    b.style.setProperty("--p", Math.min(100, g._pct || 0) + "%");
    return b;
  }
  function band(g) {
    var host = el("div", { class: "k-gl-band" });
    var mark = markOf(g);
    host.appendChild(U.wash(mark === "C#" && g.type === "code-capstone" ? "4" : mark, tone(g), { mono: mark === "C#" }));
    if (g.type === "money-save" && g.links && g.links.pot && KOS.money) {
      KOS.money.getPic(g.links.pot, function (pic) { if (pic) { host.textContent = ""; host.appendChild(U.pictureSlot({ pic: pic, alt: "" })); } });
    } else if (g.linkedEntryId && KOS.mediadb) {
      KOS.mediadb.get(g.linkedEntryId, function (e, entry) {
        var src = entry && (entry.coverImage || entry.cover || entry.coverUrl);
        if (src) { host.textContent = ""; host.appendChild(U.pictureSlot({ pic: { src: src, crop: entry.coverCrop || null }, alt: "" })); }
      });
    }
    return host;
  }

  /* ================= 27i · the page ================= */
  KOS.views.goals = function (main, arg) {
    KOS.shell.tree("none");
    if (arg && arg.id != null) { detail(main, Number(arg.id)); return; }
    var tab = TABS.some(function (t) { return t[0] === arg; }) ? arg : "all";
    var tabs = U.tabs(TABS.map(function (t) {
      return { label: t[1], active: t[0] === tab, onSelect: function () { if (t[0] !== tab) KOS.show("goals", t[0]); } };
    }), { variant: "workspace", label: "Which goals", className: "k-seg--quiet k-gl-tabs" });
    tabs.setAttribute("data-phone-tabs", "");
    main.appendChild(U.pageHeader({ kicker: "標 · The intentions", title: "Goals", sub: "What you are aiming for, read from what you already record.",
      className: "k-gl-head", actions: [tabs, btn("＋ New goal", "k-btn--primary", function () { newGoal(); }, "goal.new")] }));
    var page = el("div", { class: "k-gl", "data-ui": "goal.page goal.overview", "data-tab": tab });
    main.appendChild(page);
    G.compute(function (err, rows) {
      rows = rows || [];
      if (!rows.length) { page.appendChild(firstGoal()); return; }
      if (tab === "done") { done(page, rows); return; }
      var open = rows.filter(function (g) { return !g.archived && g._status !== "completed" && g._status !== "failed"; });
      var weekEnd = addDays(G.periodOf({ repeat: "week" }, today()).from, 6);
      var monthEnd = G.monthEndISO();
      var inTab = open.filter(function (g) {
        if (tab === "all") return true;
        var end = g._period ? g._period.to : g.deadline;
        return end && end <= (tab === "week" ? weekEnd : monthEnd);
      });
      var shown = inTab.filter(function (g) { return !visit.domain || domainOf(g) === visit.domain; });
      var lead = pickHero(shown);
      if (lead) page.appendChild(hero(lead, open));
      var counts = {};
      inTab.forEach(function (g) { var d = domainOf(g); counts[d] = (counts[d] || 0) + 1; });
      page.appendChild(el("div", { class: "k-gl-filterrow" }, [domainFilter(counts, inTab.length),
        el("span", { class: "k-muted k-gl-small", text: "Sorted by what needs you first" })]));
      var rest = shown.filter(function (g) { return g !== lead; }).sort(order);
      var grid = el("div", { class: "k-gl-grid", "data-ui": "goal.grid" });
      if (!rest.length && !lead) grid.appendChild(U.emptyState({ compact: true, title: "No " + (visit.domain ? DOMAIN[visit.domain].label + " " : "") + "goals " + (tab === "week" ? "this week" : tab === "month" ? "this month" : "yet") }));
      rest.forEach(function (g) { grid.appendChild(goalCard(g)); });
      grid.appendChild(newGoalTile());
      page.appendChild(grid);
      var repeating = rows.filter(function (g) { return g.repeat && !g.archived && Object.keys(g.outcomes || {}).length; });
      var missed = rows.filter(function (g) { return g._status === "failed" && !g.archived; });
      if (repeating.length || missed.length) {
        page.appendChild(el("div", { class: "k-gl-grid k-gl-grid--foot" }, [
          repeating.length ? runCard(repeating) : null,
          missed.length ? missedCard(missed) : null].filter(Boolean)));
      }
      announce(shown.length + (shown.length === 1 ? " goal" : " goals"));
    }, { archived: true });
  };
  /* what needs you first: behind and ending first, then ending soonest */
  function rank(g) {
    var p = g._pace, dl = daysLeft(g);
    var r = p === "behind" || p === "over" ? 0 : g._displayOnly ? 4 : p === "early" || p === "on-track" || p === "under" ? 1 : p === "ahead" ? 2 : 3;
    return [r, dl == null ? 9999 : Math.max(-1, dl)];
  }
  function order(a, b) { var x = rank(a), y = rank(b); return x[0] - y[0] || x[1] - y[1]; }
  function pickHero(list) {
    var c = list.filter(function (g) { return !g._displayOnly && g._current != null; }).sort(order);
    return c[0] || null;
  }
  function domainFilter(counts, total) {
    var items = [["", "All", total]].concat(DOMAIN_ORDER.filter(function (d) { return counts[d]; }).map(function (d) { return [d, DOMAIN[d].label, counts[d]]; }));
    var list = el("div", { class: "k-gl-domains", role: "group", "aria-label": "Domain" }, items.map(function (it) {
      return el("button", { type: "button", class: "k-gl-domain", "data-ui": "goal.domain", "aria-pressed": visit.domain === it[0] ? "true" : "false",
        onclick: function () { visit.domain = it[0]; redraw(); } }, [it[1], el("span", { class: "k-mono k-gl-count", text: String(it[2]) })]);
    }));
    return list;
  }
  /* the hero: one goal, with a ring, a sentence, the action and the run */
  function hero(g, open) {
    var tgt = g._target || g.target, cur = g._current || 0;
    var expected = g._expected;
    var ring = U.ring({ p: tgt ? cur / tgt : 0, tick: expected != null && tgt ? Math.min(1, expected / tgt) : null, size: 164, met: g._status === "met",
      label: word(g, cur) + " of " + word(g, tgt) + (expected != null ? "; the line is at " + word(g, expected) : "") }, [
      el("span", { class: "k-gl-ring-fig", text: isMoney(g) ? word(g, cur) : g._unit === "hours" ? hm(cur) : String(Math.round(cur * 10) / 10) }),
      el("span", { class: "k-muted k-gl-small", text: "of " + (isMoney(g) ? word(g, tgt) : g._unit === "hours" ? hm(tgt) : tgt + (g._unit ? " " + g._unit : "")) })]);
    var dl = daysLeft(g);
    var when = g._period ? "This " + (g.repeat === "week" ? "week" : "month") + (dl === 0 ? " · ends tonight" : dl === 1 ? " · ends tomorrow night" : dl != null ? " · " + dl + " days left" : "")
      : dl != null ? (dl === 0 ? "Due tonight" : dl === 1 ? "Due tomorrow" : dl + " days left") : "No deadline";
    var act = actionFor(g);
    var mid = el("div", { class: "k-gl-hero-mid" }, [
      el("div", { class: "k-gl-inline" }, [kicker(when), U.paceChip(paceKind(g))].filter(Boolean)),
      el("h2", { class: "k-gl-hero-title" }, [el("button", { type: "button", class: "k-gl-titlelink", "data-ui": "goal.open", onclick: function () { KOS.show("goals", { id: g.id }); }, text: g.title })]),
      el("p", { class: "k-gl-hero-line", text: g._pace === "on-track" || g._pace === "ahead" ? "Keep this pace. " + nextStep(g) : nextStep(g) }),
      el("div", { class: "k-gl-actions" }, [act ? btn(act[0], "k-btn--primary", act[1], "goal.hero-action") : null,
        btn("Open goal", "k-btn--quiet", function () { KOS.show("goals", { id: g.id }); }, "goal.hero-open")].filter(Boolean)),
      expected != null ? el("p", { class: "k-gl-tickline" }, [el("span", { class: "k-gl-tickmark", "aria-hidden": "true" }),
        "The tick is where the straight line says you would be " + (g._period ? "tonight" : "today") + ": " + word(g, expected) + "."]) : null
    ].filter(Boolean));
    var thisWeek = { behind: 0, on: 0, met: 0 };
    open.forEach(function (x) { if (x._pace === "behind" || x._pace === "over") thisWeek.behind++; else if (x._status === "met") thisWeek.met++; else if (x._pace) thisWeek.on++; });
    var keys = Object.keys(g.outcomes || {}).sort(), last = keys.length ? g.outcomes[keys[keys.length - 1]] : null, met = keys.slice(-12).filter(function (k) { return g.outcomes[k].met; }).length;
    var run = el("div", { class: "k-gl-run", "data-ui": "goal.run" }, [
      el("div", { class: "k-gl-inline" }, [el("b", { class: "k-gl-runtitle", text: "Your run" }), el("span", { class: "k-muted k-gl-small", text: g.repeat ? (g.repeat === "week" ? "weeks" : "months") + ", oldest first" : "all your goals" })]),
      g.repeat ? strip(g, "lg") : null,
      g.repeat && keys.length ? el("p", { class: "k-soft k-gl-small" }, [met + " of the last " + Math.min(12, keys.length) + " " + (g.repeat === "week" ? "weeks" : "months") + " met." + (last ? " Last " + (g.repeat === "week" ? "week" : "month") + ": " : ""),
        last ? el("b", { text: word(g, last.value) }) : null, last ? "." : null].filter(Boolean))
        : g.repeat ? el("p", { class: "k-soft k-gl-small", text: "The first " + (g.repeat === "week" ? "week" : "month") + " ends " + dayLabel(g._period.to) + "." }) : null,
      el("div", { class: "k-gl-runcounts" }, [["behind", thisWeek.behind, "behind"], ["on", thisWeek.on, "on track"], ["met", thisWeek.met, "met"]].map(function (x) {
        return el("div", { "data-k": x[0] }, [el("b", { class: "k-mono", text: String(x[1]) }), el("span", { class: "k-muted", text: x[2] + " this week" })]);
      }))].filter(Boolean));
    return el("section", { class: "k-gl-hero", "data-ui": "goal.hero", "aria-label": "The goal that needs you first" }, [
      el("span", { class: "k-gl-hero-mark", lang: "ja", "aria-hidden": "true", text: "標" }), ring, mid, run]);
  }
  function goalCard(g) {
    var act = actionFor(g), cur = g._current, tgt = g._target || g.target;
    var big = isMoney(g) ? (g._direction === "under" ? U.amount(Math.round(Math.max(0, tgt - (cur || 0)) * 100), { size: "30" }) : U.amount(Math.round((cur || 0) * 100), { size: "30" }))
      : g.type === "code-capstone" && !cur ? el("span", { class: "k-gl-big", text: "Later" })
      : figure(g, cur);
    var unit = isMoney(g) ? (g._direction === "under" ? "left before the limit" : el("span", {}, ["of ", U.amount(Math.round(tgt * 100), { size: "13", w: "500" })]))
      : g.type === "code-capstone" && !cur ? "recommended after unit 9"
      : g._unit === "hours" ? "of " + hm(tgt) : "of " + tgt + (g._unit === "%" ? "%" : g._unit ? " " + g._unit : "");
    var node = el("article", { class: "k-gl-card", "data-ui": "goal.card", "data-status": g._status }, [
      el("div", { class: "k-gl-cardband" }, [band(g),
        el("div", { class: "k-gl-bandtop" }, [isExam(g) && examChip(g) ? examChip(g) : el("span", { class: "k-gl-pill" }, [pillMark(g), pillText(g)]),
          el("span", { class: "k-mn-spacer" }), (function () { var c = U.paceChip(paceKind(g)); return c ? el("span", { class: "k-gl-chipwrap" }, [c]) : null; })()].filter(Boolean))]),
      el("div", { class: "k-gl-cardbody" }, [
        el("h3", { class: "k-gl-cardtitle" }, [el("button", { type: "button", class: "k-gl-titlelink", "data-ui": "goal.open", onclick: function () { KOS.show("goals", { id: g.id }); }, text: g.title })]),
        el("div", { class: "k-gl-figrow" }, [big, typeof unit === "string" ? el("span", { class: "k-muted", text: unit }) : unit]),
        visual(g),
        g._unlinked ? el("span", { class: "k-chip", "data-tone": "muted", "data-ui": "goal.unlinked", text: "▣ Archives at its next judgement" })
          : g._noPace && g._status === "active" && g._meta && g.type === "exam_checklist" ? el("span", { class: "k-muted k-gl-small", text: g._meta }) : null,
        el("p", { class: "k-soft k-gl-small k-gl-next", text: nextStep(g) }),
        el("span", { class: "k-mn-spacer" }),
        el("div", { class: "k-gl-cardfoot" }, [el("span", { class: "k-muted k-gl-small k-gl-grow", text: whenText(g) }),
          act ? btn(act[0], "k-btn--sm", act[1], "goal.action") : null].filter(Boolean))].filter(Boolean))]);
    return node;
  }
  var TEMPL = [
    ["学", "10 hours of study a week", "Study · repeats weekly", { type: "study-hours", target: 10, repeat: "week", title: "10 hours of study a week" }],
    ["学", "Five topics to Green this month", "Study · pick the topics", { type: "topics-green", target: 5, title: "Five topics to Green this month", deadline: "month" }],
    ["円", "A no-spend weekend", "Money · Sat and Sun", { type: "money-no-spend", target: 2, title: "A no-spend weekend", weekend: true }],
    ["映", "Finish the series I'm on", "Collection · from what's in progress", { type: "finish-series", title: "Finish the series I'm on" }],
    ["貯", "Save for something", "Money · reads a pot", { type: "money-save", title: "Save for something" }]
  ];
  function newGoalTile() {
    return el("div", { class: "k-gl-newtile", "data-ui": "goal.new-tile" }, [
      el("span", { class: "k-tile", "aria-hidden": "true", text: "標" }),
      el("h3", { class: "k-gl-cardtitle", text: "Aim at something new" }),
      el("div", { class: "k-gl-tpllist" }, TEMPL.slice(0, 3).map(function (t) {
        return el("button", { type: "button", class: "k-gl-tplrow", "data-ui": "goal.template", onclick: function () { newGoal(t[3]); } }, [el("span", { class: "k-kanji k-muted", text: t[0] }), t[1]]);
      })),
      btn("＋ New goal", "k-btn--sm", function () { newGoal(); }, "goal.new-2")]);
  }
  function runCard(list) {
    return card([head("Every period, kept", "met ✓ and missed ✕, never deleted")].concat(list.map(function (g) {
      var keys = Object.keys(g.outcomes || {}).sort(), met = keys.slice(-12).filter(function (k) { return g.outcomes[k].met; }).length;
      var best = 0, runN = 0;
      keys.forEach(function (k) { runN = g.outcomes[k].met ? runN + 1 : 0; if (runN > best) best = runN; });
      return el("div", { class: "k-gl-runrow" }, [el("button", { type: "button", class: "k-gl-titlelink k-gl-strong k-ellipsis", text: g.title, onclick: function () { KOS.show("goals", { id: g.id }); } }),
        strip(g, "xl"), el("span", { class: "k-muted k-gl-small", text: met + " of " + Math.min(12, keys.length) + (best > 1 ? " · best run " + best : "") })]);
    })), "k-gl-runcard", "goal.periods-card");
  }
  function missedCard(list) {
    return card([head("Missed", "kept, never deleted")].concat(list.slice(0, 3).map(function (g) {
      return el("div", { class: "k-gl-missed" }, [
        el("div", { class: "k-gl-inline" }, [el("span", { class: "k-gl-strong k-gl-grow", text: g.title }), U.paceChip("missed")]),
        el("p", { class: "k-muted k-gl-small", text: (g.deadline ? MONTHS[parse(g.deadline).getMonth()] + " · " : "") + word(g, g._current) + " of " + word(g, g._target) + (g.deadline ? " by " + shortDate(g.deadline) : "") }),
        el("div", { class: "k-gl-actions" }, [
          btn("Restart for " + MONTHS[new Date().getMonth()], "k-btn--sm", function () { restart(g); }, "goal.restart"),
          btn("Archive", "k-btn--sm k-btn--quiet", function () { G.archive(g.id, true); announce("Archived · " + g.title); redraw(); }, "goal.archive")])]);
    })), "", "goal.missed-card");
  }
  function restart(g) {
    var patch = {};
    if (g.deadline) { var span = Math.max(1, between(g.startDate, g.deadline)); patch.deadline = addDays(today(), span); }
    G.restart(g.id, patch);
    announce(g.title + " restarted for " + MONTHS[new Date().getMonth()]);
    redraw();
  }
  /* Done: met, missed, archived — kept for history */
  function done(page, rows) {
    var met = rows.filter(function (g) { return g._status === "completed" && !g.archived; });
    var missed = rows.filter(function (g) { return g._status === "failed" && !g.archived; });
    var archived = rows.filter(function (g) { return g.archived; });
    function row(g, acts) {
      return el("div", { class: "k-gl-row", "data-ui": "goal.card", "data-status": g._status }, [
        el("span", { class: "k-tile", "data-tone": tone(g) || null, "aria-hidden": "true", text: markOf(g) }),
        el("div", { class: "k-gl-grow" }, [el("button", { type: "button", class: "k-gl-titlelink k-gl-strong", text: g.title, onclick: function () { KOS.show("goals", { id: g.id }); } }),
          el("div", { class: "k-muted k-gl-small", text: pillText(g) + (g.completedAt ? " · met " + dayLabel(iso(new Date(g.completedAt))) : g.deadline ? " · by " + dayLabel(g.deadline) : "") + " · " + word(g, g._current) + " of " + word(g, g._target) })]),
        U.paceChip(g.archived ? "archived" : g._status === "completed" ? "met" : "missed"),
        acts ? el("div", { class: "k-gl-actions" }, acts) : null].filter(Boolean));
    }
    var groups = [["Met", "calmly noted; nothing is paid for a goal", met, function () { return null; }],
      ["Missed", "", missed, function (g) { return [btn("Restart", "k-btn--sm", function () { restart(g); }, "goal.restart"), btn("Archive", "k-btn--sm k-btn--quiet", function () { G.archive(g.id, true); announce("Archived · " + g.title); redraw(); }, "goal.archive")]; }],
      ["Archived", "", archived, function (g) { return [btn("Restore", "k-btn--sm", function () { G.archive(g.id, false); announce("Restored · " + g.title); redraw(); }, "goal.restore")]; }]];
    var list = card(groups.filter(function (x) { return x[2].length; }).map(function (x) {
      return el("div", { class: "k-gl-group" }, [el("div", { class: "k-gl-grouphead" }, [el("span", { class: "k-gl-grouptitle", text: x[0] }), x[1] ? el("span", { class: "k-muted k-gl-small", text: x[1] }) : null].filter(Boolean))]
        .concat(x[2].map(function (g) { return row(g, x[3](g)); })));
    }), "k-gl-donecard", "goal.done");
    if (!met.length && !missed.length && !archived.length) list = U.emptyState({ mark: "標", title: "Nothing finished yet", body: "Met, missed and archived goals are kept here." });
    page.appendChild(el("div", { class: "k-mn-cols k-mn-cols--sm" }, [list,
      card([head("Kept for history"), el("p", { class: "k-soft k-gl-small", text: "A missed goal is marked missed and stays here with its final figure. Restart makes a new period from today with the same settings; Archive files it away. Neither deletes anything. Delete exists only inside the goal, behind a danger dialog." })])]));
  }
  /* 27l · a new learner: templates, not a blank form */
  function firstGoal() {
    return card([el("h2", { class: "k-card-title", text: "Pick a first goal" }),
      el("p", { class: "k-soft k-gl-small", text: "Each reads what you already record, so there is nothing to keep up by hand." }),
      templGrid(null, function (t) { newGoal(t[3]); }),
      el("div", { class: "k-gl-inline" }, [btn("Or start from a type…", "k-btn--quiet", function () { newGoal(); }, "goal.from-type"), el("span", { class: "k-mn-spacer" }),
        el("span", { class: "k-muted k-gl-small", text: "Templates are only a start; everything can be changed." })])], "k-gl-first", "goal.first");
  }
  function templGrid(selected, onPick) {
    return el("div", { class: "k-gl-tpls", role: "list" }, TEMPL.map(function (t, i) {
      return el("button", { type: "button", class: "k-gl-tpl", role: "listitem", "data-ui": "goal.template", "aria-pressed": selected === i ? "true" : "false", onclick: function () { onPick(t, i); } }, [
        el("span", { class: "k-tile", "aria-hidden": "true", text: t[0] }), el("b", { text: t[1] }), el("span", { class: "k-muted k-gl-small", text: t[2] })]);
    }));
  }

  /* ================= 27j · a goal opened ================= */
  function detail(main, id) {
    var g0 = G.get(id);
    if (!g0) {
      main.appendChild(U.pageHeader({ kicker: "標 · Goals", title: "That goal is not here", sub: "It may have been deleted on another device." }));
      main.appendChild(U.emptyState({ mark: "標", title: "Nothing to show", action: btn("All goals", "k-btn--primary", function () { KOS.show("goals"); }) }));
      return;
    }
    var page = el("div", { class: "k-gl k-gl-detail", "data-ui": "goal.detail" });
    var headHost = el("div");
    main.appendChild(el("nav", { class: "k-gl-crumbs", "aria-label": "Breadcrumb" }, [el("button", { type: "button", class: "k-link", text: "Goals", onclick: function () { KOS.show("goals"); } }),
      el("span", { class: "k-muted", "aria-hidden": "true", text: "›" }), el("span", { class: "k-soft", text: (DOMAIN[g0.domain] || DOMAIN.collection).label })]));
    main.appendChild(headHost);
    main.appendChild(page);
    G.compute(function (err, rows) {
      var g = (rows || []).filter(function (x) { return x.id === id; })[0];
      if (!g) return;
      var dl = daysLeft(g);
      var sub = g._period ? "This " + (g.repeat === "week" ? "week" : "month") + " runs " + dayLabel(g._period.from) + " – " + dayLabel(g._period.to) + (dl === 0 ? " · ends tonight" : dl === 1 ? " · ends tomorrow night" : "")
        : g.deadline ? "From " + dayLabel(g.startDate) + " to " + dayLabel(g.deadline) : "From " + dayLabel(g.startDate) + " · no deadline";
      var more = U.menu({ label: "⋯", className: "k-btn--quiet k-gl-more", items: [
        { label: "Restart", onSelect: function () { restart(g); } },
        { label: g.archived ? "Restore" : "Archive", onSelect: function () { G.archive(g.id, !g.archived); announce((g.archived ? "Restored · " : "Archived · ") + g.title); redraw(); } },
        { sep: true },
        { label: "Delete…", onSelect: function () {
          U.confirm({ title: "Delete this goal?", danger: true, confirm: "Delete",
            body: "“" + g.title + "” and its history of periods go. Archive keeps it instead. The activity it counted is not touched." }, function () {
            G.remove(g.id); announce("Goal deleted"); KOS.show("goals");
          });
        } }] });
      more.setAttribute("aria-label", "More for this goal");
      headHost.appendChild(U.pageHeader({ kicker: "標 · " + pillText(g).replace(" · weekly", " · repeats every week").replace(" · monthly", " · repeats every month"), title: g.title, sub: sub,
        className: "k-gl-head", actions: [U.paceChip(paceKind(g)), btn("Edit", "", function () { goalDialog(G.get(id)); }, "goal.edit"), more].filter(Boolean) }));
      var mainCol = el("div", { class: "k-mn-stack" }), side = el("div", { class: "k-mn-side" });
      page.appendChild(el("div", { class: "k-mn-cols k-mn-cols--sm" }, [mainCol, side]));
      /* the three figures and the pace chart */
      var tgt = g._target || g.target, cur = g._current;
      var figs = el("div", { class: "k-gl-figs" }, [
        fig(g._period ? "This " + (g.repeat === "week" ? "week" : "month") : "So far", word(g, cur), "of " + word(g, tgt) + (g._period ? " · " + (between(g._period.from, today()) + 1) + " of " + (between(g._period.from, g._period.to) + 1) + " days gone" : "")),
        g._expected != null ? fig("The line says", word(g, g._expected), (g._period ? "by tonight" : "by today") + (cur != null && cur < g._expected ? " · " + word(g, g._expected - cur) + " behind it" : cur != null ? " · " + word(g, cur - g._expected) + " ahead of it" : "")) : null,
        projection(g)].filter(Boolean));
      var chartHost = el("div", { class: "k-gl-chart", "data-ui": "goal.pace-chart" });
      mainCol.appendChild(card([figs, chartHost], "", "goal.pace-card"));
      G.series(G.get(id), function (s) { paceChart(chartHost, g, s); });
      if (g.repeat) mainCol.appendChild(historyCard(g));
      /* milestones, links, how it is counted */
      if (g.milestones && g.milestones.length) side.appendChild(card([head("Milestones")].concat(g.milestones.map(function (m) {
        var hit = (cur || 0) >= m;
        return el("div", { class: "k-card-row" }, [el("span", { class: hit ? "k-mn-ok" : "k-muted", "aria-hidden": "true", text: hit ? "✓" : "◇" }),
          el("span", { class: "k-gl-grow", text: word(g, m) }), el("span", { class: "k-muted k-gl-small", text: hit ? "reached" : word(g, m - (cur || 0)) + " to go" })]);
      })).concat([g.milestones.indexOf(tgt) === -1 ? el("div", { class: "k-card-row" }, [el("span", { class: "k-muted", text: "◇" }), el("span", { class: "k-gl-grow", text: word(g, tgt) }), el("span", { class: "k-muted k-gl-small", text: "the target" })]) : null]), "", "goal.milestones"));
      side.appendChild(linksCard(g));
      side.appendChild(card([head("How it is counted"), el("p", { class: "k-soft k-gl-small", text: countedText(g) })], "", "goal.counted"));
    }, { archived: true });
  }
  function fig(label, value, sub) {
    return el("div", { class: "k-gl-fig" }, [kicker(label), el("span", { class: "k-gl-big", "data-size": "24", text: value || "–" }), sub ? el("span", { class: "k-muted k-gl-small", text: sub }) : null].filter(Boolean));
  }
  function projection(g) {
    if (!g._period && g._projected) return fig("Projected", shortDate(g._projected), "at this pace · " + G.PROJECT_MIN_DAYS + "+ days of data");
    if (g._period && g._current != null && g._direction === "reach") {
      var gone = between(g._period.from, today()) + 1, len = between(g._period.from, g._period.to) + 1;
      if (gone < G.PROJECT_MIN_DAYS) return fig("Projected", "–", "A projection needs " + G.PROJECT_MIN_DAYS + " days of data");
      return fig("Projected", word(g, g._current / gone * len), "by the end at this " + (g.repeat === "week" ? "week" : "month") + "'s pace · " + gone + " days of data");
    }
    return null;
  }
  /* the pace chart: the straight line dashed, progress in the accent */
  function paceChart(host, g, s) {
    if (!s || !s.points.length) { host.appendChild(el("p", { class: "k-muted k-gl-small", text: g._period || g.deadline ? "This goal measures the present state, so it has no day-by-day chart." : "No deadline, so no line to draw." })); return; }
    var NS = "http://www.w3.org/2000/svg", W = 600, H = 220, L = 44, R = 20, T = 12, B = 30;
    var len = between(s.from, s.to) + 1, top = Math.max(s.target, s.points[s.points.length - 1][1]) * 1.08 || 1;
    var px = function (d) { return L + (d) * (W - L - R) / len; }, py = function (v) { return H - B - v * (H - B - T) / top; };
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.setAttribute("class", "k-gl-svg"); svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "So far " + word(g, g._current) + (g._expected != null ? "; the line is " + word(g, g._expected) : "") + ", target " + word(g, s.target));
    function add(tag, attrs, text) { var n = document.createElementNS(NS, tag); Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); }); if (text != null) n.textContent = text; svg.appendChild(n); return n; }
    [0, s.target / 2, s.target].forEach(function (v) {
      add("line", { x1: L, x2: W - R, y1: py(v), y2: py(v), class: "k-gl-gridline" });
      add("text", { x: L - 8, y: py(v) + 4, "text-anchor": "end", class: "k-gl-axis" }, g._unit === "hours" ? Math.round(v) + " h" : isMoney(g) ? "" : String(Math.round(v)));
    });
    var step = len > 14 ? Math.ceil(len / 7) : 1;
    for (var i = 0; i < len; i += step) {
      var dd = addDays(s.from, i);
      add("text", { x: (px(i) + px(i + 1)) / 2, y: H - 8, "text-anchor": "middle", class: "k-gl-axis" + (dd === today() ? " k-gl-axis--now" : "") }, len <= 7 ? DAY3[parse(dd).getDay()] : String(parse(dd).getDate()));
    }
    add("line", { x1: px(0), y1: py(0), x2: px(len), y2: py(s.target), class: "k-gl-line" });
    var pts = [[px(0), py(0)]].concat(s.points.map(function (p, idx) { return [px(idx + 1), py(p[1])]; }));
    add("polyline", { points: pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "), class: "k-gl-progress" });
    var lastP = pts[pts.length - 1];
    add("circle", { cx: lastP[0], cy: lastP[1], r: 5, class: "k-gl-dot" });
    (g.milestones || []).forEach(function (m) { var x = px(len * m / s.target), y = py(m); add("path", { d: "M" + x + " " + (y - 6) + " l5 6 l-5 6 l-5 -6z", class: "k-gl-ms" }); });
    host.appendChild(svg);
    host.appendChild(el("ul", { class: "k-legend k-gl-legend" }, [
      el("li", { class: "k-legend-item" }, [el("span", { class: "k-gl-key", "data-k": "progress" }), "So far"]),
      el("li", { class: "k-legend-item" }, [el("span", { class: "k-gl-key", "data-k": "line" }), "The straight line to " + word(g, s.target)]),
      (g.milestones || []).length ? el("li", { class: "k-legend-item", text: "◇ Milestone" }) : null].filter(Boolean)));
  }
  function historyCard(g) {
    var keys = Object.keys(g.outcomes || {}).sort().slice(-12);
    if (!keys.length) return card([head("Every " + (g.repeat === "week" ? "week" : "month") + " so far"), el("p", { class: "k-muted k-gl-small", text: "The first " + (g.repeat === "week" ? "week" : "month") + " ends " + dayLabel(g._period.to) + "." })], "", "goal.history");
    var top = Math.max.apply(null, keys.map(function (k) { return g.outcomes[k].value; }).concat([g._target || g.target, g._current || 0])) * 1.1;
    var met = keys.filter(function (k) { return g.outcomes[k].met; }).length;
    var best = 0, run = 0;
    keys.forEach(function (k) { run = g.outcomes[k].met ? run + 1 : 0; best = Math.max(best, run); });
    var bars = el("ol", { class: "k-gl-hist", "aria-label": "Every period" }, keys.map(function (k) {
      var o = g.outcomes[k], b = el("li", { class: "k-gl-histbar", "data-state": o.met ? "met" : "missed", tabindex: "0",
        "aria-label": (g.repeat === "week" ? "Week of " : "") + shortDate(k.length === 7 ? k + "-01" : k) + ", " + word(g, o.value) + ", " + (o.met ? "met" : "missed") }, [
        el("span", { class: "k-mono k-muted k-gl-tiny", text: g._unit === "hours" ? (Math.round(o.value * 10) / 10).toFixed(1) : String(Math.round(o.value)) }),
        el("i"), el("b", { text: o.met ? "✓" : "✕" }), el("span", { class: "k-muted k-gl-tiny", text: shortDate(k.length === 7 ? k + "-01" : k).split(" ")[0] })]);
      b.style.setProperty("--h", (o.value / top).toFixed(3));
      return b;
    }).concat([(function () {
      var b = el("li", { class: "k-gl-histbar", "data-state": "open", "aria-label": "This period so far, " + word(g, g._current) }, [
        el("span", { class: "k-mono k-gl-tiny", text: g._unit === "hours" ? (Math.round((g._current || 0) * 10) / 10).toFixed(1) : String(Math.round(g._current || 0)) }),
        el("i"), el("b", { text: "●" }), el("span", { class: "k-gl-tiny", text: "now" })]);
      b.style.setProperty("--h", ((g._current || 0) / top).toFixed(3));
      return b;
    })()]));
    bars.style.setProperty("--target", ((g._target || g.target) / top).toFixed(3));
    return card([head("Every " + (g.repeat === "week" ? "week" : "month") + " so far", met + " of " + keys.length + " met" + (best > 1 ? " · best run " + best : "") + " · the open one in crimson"), bars,
      el("p", { class: "k-muted k-gl-small", text: "Each finished period is saved as its outcome (met or missed, and the figure). Progress itself is never stored; it is read from what you record." })], "", "goal.history");
  }
  function linksCard(g) {
    var rows = [], links = g.links || {};
    function row(mark, title, sub, ok, onOpen, key) {
      rows.push(el("div", { class: "k-card-row k-gl-link", "data-state": ok ? null : "dead" }, [el("span", { class: "k-tile", "aria-hidden": "true", text: mark }),
        el("div", { class: "k-gl-grow" }, [el("div", { class: "k-gl-strong k-gl-linktitle", text: title }), el("div", { class: "k-muted k-gl-small", text: sub })]),
        ok ? (onOpen ? el("button", { type: "button", class: "k-link", text: "›", "aria-label": "Open " + title, onclick: onOpen }) : null)
          : btn("Remove link", "k-btn--sm k-btn--quiet", function () { var l = Object.assign({}, links); delete l[key]; G.update(g.id, { links: l }); announce("Link removed"); redraw(); }, "goal.unlink")].filter(Boolean)));
    }
    if (isExam(g)) {
      var xa = examOf(g);
      if (xa) row("試", xa.title, (KOS.exams.tier(xa.tier) || {}).label + (xa.date ? " · " + dayLabel(xa.date) : "") + " · the goal ends on its date" + (g.params && g.params.by ? " unless sooner (" + dayLabel(g.params.by) + ")" : ""), true, function () { KOS.show("exams", xa.id); });
      else if (g.params && g.params.examGone) rows.push(el("div", { class: "k-card-row k-gl-link", "data-state": "dead" }, [el("span", { class: "k-tile", "aria-hidden": "true", text: "⊘" }),
        el("div", { class: "k-gl-grow" }, [el("div", { class: "k-gl-strong k-gl-linktitle", text: g.params.examGone.title || "The exam" }), el("div", { class: "k-muted k-gl-small", text: "Exam removed · unlinked · nothing was lost" })]),
        btn("Link to an exam", "k-btn--sm", function () { linkDialog(g); }, "goal.relink")]));
    }
    if (links.subject && !isExam(g)) row("学", { compsci: "Computer Science", maths: "Maths", it: "IT", code: "Code" }[links.subject] || links.subject, "Counts sessions in this subject", true, function () { KOS.show("subject", links.subject); });
    (links.refs || []).slice(0, 6).forEach(function (k) {
      var i = k.indexOf(":"), lab = KOS.spec && KOS.spec.label ? KOS.spec.label(k.slice(0, i), k.slice(i + 1)) : k;
      row("学", lab || k, "Topic · from the topic picker", true, function () { KOS.show("ref", { subject: k.slice(0, i), ref: k.slice(i + 1) }); });
    });
    if (links.assignmentId != null) {
      var a = KOS.assignments && KOS.assignments.get ? KOS.assignments.get(links.assignmentId) : null;
      row("課", a ? a.title : "An assignment", a ? "Assignment" + (a.due ? " · due " + dayLabel(a.due) : "") : "Assignment · deleted · the goal still counts", !!a, a ? function () { KOS.show("assignments"); } : null, "assignmentId");
    }
    if (links.pot) {
      var p = KOS.money && KOS.money.pot(links.pot);
      row("貯", p ? p.name + " pot" : "A pot", p ? "Pot · the goal reads its balance" : "Pot · closed · the goal has nothing to read", !!p, p ? function () { KOS.show("money", "pots"); } : null, "pot");
    }
    if (links.category) {
      var c = KOS.money && KOS.money.category(links.category);
      row("円", c ? c.name : "A category", c ? "Money category · its spend this month" : "Category · gone", !!c, function () { KOS.show("money", "budgets"); }, "category");
    }
    if (g.linkedEntryId) row(markOf(g), g._meta || "A title", "Title · Collection", !/no longer/.test(g._meta || ""), function () { KOS.show(g.module || "matrix"); });
    if (!rows.length) rows.push(el("p", { class: "k-muted k-gl-small", text: "Nothing linked; it counts from its own rule." }));
    return card([head("Linked", "what it counts and what it is for")].concat(rows), "", "goal.links");
  }
  function countedText(g) {
    var d = domainOf(g);
    if (g._displayOnly) return "Read from the Governor and shown only. Reaching it records nothing and pays nothing.";
    if (isExam(g)) return ({
      exam_grade: "Read from the exam's own attempts: the result once logged (or the best timed paper), against the boundaries for a grade.",
      exam_recall: "Read from the readiness model: FSRS's recall across the exam's scope on the morning of the exam, mark-weighted. Met when it holds on the date.",
      exam_topics_green: "Read from the exam's resolved scope: leaves at Green, or ticked in Pacing or started.",
      exam_papers_done: "Read from the exam's own attempts: timed papers with a mark, since the goal began.",
      exam_checklist: "Read from the exam's checklist: what you ticked and what the app verified."
    })[g.type] + " Meeting it records one activity-only receipt and pays nothing.";
    if (d === "study" || d === "productivity") return "Read from sessions already logged and paid by Focus and study. Reading this goal pays nothing again, and meeting it records one activity-only receipt.";
    if (d === "money") return "Read from Money's entries and pots. A goal never moves money, and meeting it pays nothing.";
    if (d === "code") return "Read from Code's evidence: first passes and proven retrievals in the ledger, never a seen answer.";
    return "Read from the Collection as it stands. Nothing is written back to a vault entry.";
  }

  /* ================= 27k · a new goal (and editing one) ================= */
  function newGoal(preset) {
    if (preset) { goalDialog(null, preset); return; }
    var picked = null;
    var body = el("div", { class: "k-gl-new" });
    var ov;
    function next(seed) { ov.remove(); goalDialog(null, seed); }
    body.appendChild(el("div", { class: "k-field-label", text: "Start from one of these" }));
    body.appendChild(templGrid(null, function (t) { announce("Template chosen: " + t[1]); next(t[3]); }));
    body.appendChild(el("div", { class: "k-field-label", text: "Or choose a type" }));
    var groups = el("div", { class: "k-gl-types" });
    var examTypes = G.types({ domain: "study" }).filter(function (t) { return t.exam; });
    if (examTypes.length) {
      var anyExam = KOS.exams && KOS.exams.upcoming().some(function (a) { return a.tier !== "deadline"; });
      groups.appendChild(el("div", { class: "k-gl-typegroup", role: "group", "aria-label": "Exams", "data-ui": "goal.exam-types" }, [
        el("div", { class: "k-gl-typehead", text: "試 Exams" }),
        el("div", { class: "k-gl-typelist" }, examTypes.map(function (t) {
          return el("button", { type: "button", class: "k-gl-type", "data-ui": "goal.type", disabled: anyExam ? null : "", title: t.blurb || null,
            onclick: function () { next({ type: t.id }); }, text: t.label });
        }).concat(anyExam ? [] : [btn("Add an exam first", "k-btn--sm", function () { ov.remove(); KOS.show("exams", "timetable"); KOS.examEditor(null, {}, function () { KOS.rerender(); }); }, "goal.add-exam")]))]));
    }
    DOMAIN_ORDER.concat(["manual"]).forEach(function (d) {
      var ts = d === "manual" ? [G.typeDef("custom-manual")] : G.types({ domain: d }).filter(function (t) { return t.id !== "custom-manual" && !t.exam; });
      if (!ts.length) return;
      groups.appendChild(el("div", { class: "k-gl-typegroup", role: "group", "aria-label": d === "manual" ? "Manual" : DOMAIN[d].label }, [
        el("div", { class: "k-gl-typehead", text: d === "manual" ? "✎ Manual" : DOMAIN[d].k + " " + DOMAIN[d].label }),
        el("div", { class: "k-gl-typelist" }, ts.map(function (t) {
          return el("button", { type: "button", class: "k-gl-type", "data-ui": "goal.type", onclick: function () { next({ type: t.id }); },
            text: t.label + (t.displayOnly ? " · shown only" : "") });
        }))]));
    });
    body.appendChild(groups);
    ov = dialogBox("New goal", "標", [body], [el("span"), btn("Cancel", "", function () { ov.remove(); })], "goal.new-dialog", "k-gl-dialog k-msheet--full");
  }
  function dialogBox(title, mark, body, foot, hook, cls) {
    var overlay = el("div", { class: "k-dialog-overlay", "data-ui": "ui.dialog-overlay" });
    var t = el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: title });
    var box = el("div", { class: "k-dialog k-mn-dialog " + (cls || ""), "data-ui": "ui.dialog " + hook, role: "dialog" }, [
      el("div", { class: "k-dialog-head" }, [el("div", { class: "k-dialog-mark", lang: "ja", "aria-hidden": "true", text: mark }), el("div", { class: "k-mn-dialog-titles" }, [t]),
        el("button", { type: "button", class: "k-iconbtn", "data-ui": "ui.dialog-close", "aria-label": "Close", text: "✕", onclick: function () { overlay.remove(); } })]),
      el("div", { class: "k-mn-dialog-body" }, body),
      el("div", { class: "k-dialog-foot" }, foot)]);
    overlay.appendChild(box);
    overlay.close = function () { overlay.remove(); };
    U.openDialog(overlay, { labelledBy: t });
    return overlay;
  }
  /* the second step: what to aim at, by when, how often */
  function goalDialog(existing, seed) {
    seed = seed || {};
    var g = existing || {};
    var typeId = g.type || seed.type || "custom-manual";
    var def = G.typeDef(typeId);
    var now = today();
    var title = input("text", g.title || seed.title || def.label, { maxlength: "160", "aria-label": "Title" });
    var money = def.unit === "£" || /^money-(spend|income|save|subs)/.test(typeId) || typeId === "spend-below";
    var targetIn = money ? U.amountField({ value: g.target != null ? Math.round(g.target * 100) : seed.target != null ? Math.round(seed.target * 100) : null, label: "Target" })
      : null;
    var countIn = money ? null : input("number", String(g.target || seed.target || 1), { min: "0", step: def.unit === "hours" ? "0.5" : "1", class: "k-input k-gl-num", "aria-label": "Target" });
    var repeat = g.repeat || seed.repeat || "";
    var weekFrom = g.weekFrom || "monday";
    var start = input("date", g.startDate || now, { "aria-label": "Starts" });
    var monthEnd = G.monthEndISO();
    var weekendSat = addDays(now, (6 - parse(now).getDay() + 7) % 7);
    if (seed.weekend) start.value = weekendSat;
    var deadline = input("date", g.deadline || (seed.deadline === "month" ? monthEnd : seed.weekend ? addDays(weekendSat, 1) : ""), { "aria-label": "Deadline" });
    var milestones = (g.milestones || []).slice();
    var links = Object.assign({}, g.links || {});
    var err = el("p", { class: "k-field-error", role: "alert", hidden: "" });
    var hint = el("p", { class: "k-gl-hint k-gl-small" });
    var form = el("div", { class: "k-gl-form" });
    var picker = null, extra = {};
    /* an exam goal (29v): the exam, the aim, and an optional earlier "By" */
    var xs = { examId: links.examId || seed.examId || null, params: Object.assign({}, g.params || {}, seed.params || {}), titled: !!existing };
    if (def.exam && !xs.examId) { var first = examChoices(typeId, null)[0]; xs.examId = first ? first.id : null; }
    var byIn = input("date", xs.params.by || "", { "aria-label": "By" });
    if (def.exam && !existing && seed.target == null) countIn.value = String({ exam_grade: 70, exam_recall: 90, exam_topics_green: 10, exam_papers_done: 4, exam_checklist: 1 }[typeId] || 1);
    title.addEventListener("input", function () { xs.titled = true; });
    function autoTitle() {
      if (xs.titled || !def.exam) return;
      var a = KOS.exams.get(xs.examId), t = +countIn.value || 0;
      if (!a) return;
      title.value = typeId === "exam_grade" ? a.title + (xs.params.grade ? " at " + xs.params.grade : " ≥ " + t + "%")
        : typeId === "exam_recall" ? a.title + " projected recall ≥ " + t + "%"
        : typeId === "exam_topics_green" ? (xs.params.all ? "All of " : t + " topics ") + (xs.params.basis === "covered" ? "covered" : "Green") + " for " + a.title
        : typeId === "exam_papers_done" ? t + " marked papers before " + a.title : "Pre-exam checklist: " + a.title;
    }
    function drawExam() {
      var list = examChoices(typeId, xs.examId);
      if (!list.length) { form.appendChild(el("p", { class: "k-muted k-gl-small", text: "No exam this goal can follow is coming up. Add one in Exams first." })); return; }
      var a = KOS.exams.get(xs.examId) || list[0];
      xs.examId = a.id;
      var sel = select(list.map(function (x) { return [x.id, x.title + (x.date ? " · " + dayLabel(x.date) : "")]; }), a.id, { "aria-label": "Exam", "data-ui": "goal.exam" });
      sel.addEventListener("change", function () { xs.examId = sel.value; autoTitle(); draw(); });
      var row = [field("Exam", sel)];
      if (typeId === "exam_grade") {
        var gs = KOS.goalsExams.grades(a);
        if (xs.params.grade && gs.indexOf(xs.params.grade) === -1) delete xs.params.grade;
        form.appendChild(field("Measured from", seg([["result", "The result"], ["best", "Best timed paper"]], xs.params.basis === "best" ? "best" : "result",
          function (v) { xs.params.basis = v; draw(); }, "Measured from", "k-seg--fill")));
        if (gs.length) {
          var gsel = select([["", "A percentage"]].concat(gs.map(function (x) { return [x, "Grade " + x + " (about " + KOS.goalsExams.gradeCut(a, x) + "%)"]; })), xs.params.grade || "", { "aria-label": "Aim" });
          gsel.addEventListener("change", function () { if (gsel.value) xs.params.grade = gsel.value; else delete xs.params.grade; autoTitle(); draw(); });
          row.push(field("Aim at", gsel));
        }
      }
      if (typeId === "exam_topics_green") {
        form.appendChild(field("Counts a topic", seg([["green", "Green"], ["covered", "Covered in Pacing"]], xs.params.basis === "covered" ? "covered" : "green",
          function (v) { xs.params.basis = v; autoTitle(); draw(); }, "Counts a topic", "k-seg--fill")));
        var allBox = el("input", { type: "checkbox", class: "k-box", "aria-label": "All of the scope" });
        allBox.checked = !!xs.params.all;
        allBox.addEventListener("change", function () { xs.params.all = allBox.checked; autoTitle(); draw(); });
        form.appendChild(el("label", { class: "k-check" }, [allBox, el("span", { text: "All of the scope (" + KOS.exams.leaves(a).length + " leaves)" })]));
      }
      var needsTarget = typeId !== "exam_checklist" && !(typeId === "exam_grade" && xs.params.grade) && !(typeId === "exam_topics_green" && xs.params.all);
      if (needsTarget) row.push(field("At least", el("div", { class: "k-gl-stepper" }, [countIn, el("span", { class: "k-muted k-gl-small", text: def.unit === "%" ? "%" : def.unit })])));
      byIn.max = a.date || "";
      row.push(field("By · optional", byIn));
      form.appendChild(el("div", { class: "k-gl-tworow k-gl-examrow" }, row));
      form.appendChild(el("p", { class: "k-field-hint", text: "Ends on the exam's date (" + (a.date ? dayLabel(a.date) : "not set") + ") unless you pick an earlier one, and follows it if the exam moves." }));
    }
    function examLine() {
      var a = KOS.exams.get(xs.examId);
      hint.textContent = "";
      if (!a) return;
      var tmp = G.normalise({ type: typeId, target: +countIn.value || 1, links: { examId: a.id }, params: xs.params, startDate: now });
      def.measure(tmp, { from: now, to: byIn.value || a.date || now, today: now, stats: function (d) { d({}); } }, function (m) {
        if (!m || m.current == null) { hint.textContent = m && m.meta ? m.meta + "." : ""; return; }
        var t = m.target != null ? m.target : +countIn.value || 0, end = byIn.value || a.date;
        var text = "Now " + m.current + (def.unit === "%" ? "%" : " of " + t + " " + def.unit) + ".";
        if (typeId === "exam_recall" && end && t > m.current) {
          var days = Math.max(1, between(now, end)), nextWk = Math.round(m.current + (t - m.current) * Math.min(1, 7 / days));
          text += " On the straight line to " + t + "% by " + shortDate(end) + " it should read " + nextWk + "% next week.";
        } else if (typeId === "exam_grade" && xs.params.grade) text += " " + xs.params.grade + " needs about " + t + "% on this paper.";
        else if (typeId === "exam_papers_done" && end && t > m.current) text += " One about every " + Math.max(1, Math.round(between(now, end) / (t - m.current))) + " days gets you there.";
        hint.textContent = text;
      });
    }
    function draw() {
      form.textContent = "";
      form.appendChild(field("Title", title));
      if (def.exam) { drawExam(); autoTitle(); form.appendChild(hint); form.appendChild(err); examLine(); return; }
      /* the source: a subject, topics, a pot, a category, a capstone, a title */
      if (def.fields.subject) {
        extra.subject = select([["", "All subjects"]].concat((KOS.subjects ? KOS.subjects.ids() : ["compsci", "maths", "it", "code"]).map(function (s) { return [s, { compsci: "Computer Science", maths: "Maths", it: "IT", code: "Code" }[s] || s]; })), links.subject || "", { "aria-label": "Subject" });
        extra.subject.addEventListener("change", function () { links.subject = extra.subject.value || undefined; if (picker) picker.refresh(); });
        form.appendChild(field("Subject", extra.subject));
      }
      if (def.fields.refs && KOS.topicPicker) {
        picker = KOS.topicPicker({ value: links.refs || [], label: "Which topics", subject: function () { return links.subject || null; }, onChange: function (v) { links.refs = v; } });
        form.appendChild(el("div", {}, [picker.el, el("span", { class: "k-field-hint", text: "The shared topic picker; a paper or unit pick counts its leaves." })]));
      }
      if (def.fields.pot && KOS.money) {
        var ps = KOS.money.pots();
        extra.pot = select(ps.map(function (p) { return [p.id, p.name + (p.target ? " · target " + KOS.money.format(p.target) : "")]; }), links.pot || (ps[0] || {}).id, { "aria-label": "Pot" });
        extra.pot.addEventListener("change", function () { links.pot = extra.pot.value; });
        if (!links.pot && ps[0]) links.pot = ps[0].id;
        form.appendChild(ps.length ? field("From the pot", extra.pot, "The goal reads the pot; it never moves money.") : el("p", { class: "k-muted k-gl-small", text: "Make a pot in Money › Pots first; the goal reads it." }));
      }
      if (def.fields.category && KOS.money) {
        extra.category = select([["", typeId === "money-income" ? "All income" : "All spending"]].concat(KOS.money.categories({ kind: typeId === "money-income" ? "in" : "out" }).map(function (c) { return [c.id, c.name]; })), links.category || "", { "aria-label": "Category" });
        extra.category.addEventListener("change", function () { links.category = extra.category.value || undefined; });
        form.appendChild(field("Category", extra.category));
      }
      if (def.fields.capstone && window.KOS_CODE && KOS_CODE.CAPSTONES) {
        extra.capstone = select(Object.keys(KOS_CODE.CAPSTONES).map(function (k) { return [k, (KOS_CODE.CAPSTONES[k].title || k)]; }), links.capstone || "", { "aria-label": "Capstone" });
        extra.capstone.addEventListener("change", function () { links.capstone = extra.capstone.value; });
        if (!links.capstone) links.capstone = extra.capstone.value;
        form.appendChild(field("Capstone", extra.capstone));
      }
      if (def.fields.module) {
        extra.module = select(G.MODULES.map(function (m) { return [m.id, m.label]; }), g.module || "", { "aria-label": "Media" });
        form.appendChild(field("Media", extra.module));
      }
      if (def.fields.linked) {
        extra.linked = select([["", "Searching your vault…"]], g.linkedEntryId || "", { "aria-label": "Title" });
        form.appendChild(field("Title", extra.linked, "From what is in progress in your vault."));
        if (KOS.mediadb) KOS.mediadb.query({ status: "inProgress", sort: "title" }, function (e, rows) {
          extra.linked.textContent = "";
          (rows || []).slice(0, 60).forEach(function (r) { var o = el("option", { value: String(r.id), text: r.title }); if (String(r.id) === String(g.linkedEntryId)) o.selected = true; extra.linked.appendChild(o); });
          if (!(rows || []).length) extra.linked.appendChild(el("option", { value: "", text: "Nothing in progress" }));
        });
      }
      if (def.fields.filter) {
        extra.filterKind = select([["list", "Custom list"], ["tag", "Tag"], ["genre", "Genre"]], g.filterKind || "list", { "aria-label": "Filter" });
        extra.filterValue = input("text", g.filterValue || "", { "aria-label": "Value" });
        form.appendChild(el("div", { class: "k-mn-two" }, [field("Filter", extra.filterKind), field("Value", extra.filterValue)]));
      }
      if (typeId === "habit-streak") {
        var hs = (store.state.todo && store.state.todo.habits) || [];
        extra.habit = select(hs.map(function (h) { return [h.id, h.text]; }), (g.params || {}).habit || (hs[0] || {}).id, { "aria-label": "Habit" });
        form.appendChild(field("Habit", extra.habit));
      }
      /* how much */
      var target = money ? targetIn.node : el("div", { class: "k-gl-stepper" }, [
        el("button", { type: "button", class: "k-iconbtn", "aria-label": "Less", text: "−", onclick: function () { countIn.value = Math.max(0, (+countIn.value || 0) - (def.unit === "hours" ? 1 : 1)); line(); } }),
        countIn, el("button", { type: "button", class: "k-iconbtn", "aria-label": "More", text: "＋", onclick: function () { countIn.value = (+countIn.value || 0) + 1; line(); } }),
        el("span", { class: "k-muted k-gl-small", text: def.unit && def.unit !== "£" ? def.unit : "" })]);
      var row1 = [field(def.direction === "under" ? "Stay under" : "Target", target)];
      if (def.repeat) row1.push(field("Repeats", seg([["", "Once"], ["week", "Every week"], ["month", "Every month"]], repeat, function (v) { repeat = v; draw(); }, "Repeats", "k-seg--fill")));
      form.appendChild(el("div", { class: "k-gl-tworow" }, row1));
      if (repeat === "week") form.appendChild(field("The week runs", seg([["start", "From the day it starts · " + DAY3[parse(start.value || now).getDay()] + "–" + DAY3[(parse(start.value || now).getDay() + 6) % 7]], ["monday", "Monday to Sunday"]], weekFrom, function (v) { weekFrom = v; draw(); }, "The week runs", "k-seg--fill")));
      form.appendChild(el("div", { class: "k-mn-two" }, [field("Starts", start), repeat ? null : field("Deadline · optional", deadline)].filter(Boolean)));
      /* milestones */
      var msHost = el("div", { class: "k-gl-inline" });
      milestones.sort(function (a, b) { return a - b; }).forEach(function (m, i) {
        msHost.appendChild(el("span", { class: "k-chip", "data-tone": "muted" }, [String(m), el("button", { type: "button", class: "k-tp-x", "aria-label": "Remove milestone " + m, text: "✕", onclick: function () { milestones.splice(i, 1); draw(); } })]));
      });
      var msIn = input("number", "", { min: "0", class: "k-input k-gl-num", "aria-label": "Add a milestone", placeholder: "＋" });
      msIn.addEventListener("keydown", function (e) { if (e.key === "Enter" && +msIn.value > 0) { e.preventDefault(); milestones.push(+msIn.value); draw(); } });
      msHost.appendChild(msIn);
      msHost.appendChild(btn("Add", "k-btn--sm k-btn--quiet", function () { if (+msIn.value > 0) { milestones.push(+msIn.value); draw(); } }));
      if (def.direction === "reach" && !def.displayOnly) form.appendChild(field("Milestones · optional", msHost));
      form.appendChild(hint);
      form.appendChild(err);
      line();
    }
    function targetValue() { return money ? (targetIn.value() == null ? null : targetIn.value() / 100) : +countIn.value; }
    function line() {
      if (def.exam) { autoTitle(); examLine(); return; }
      var t = targetValue(), end = repeat ? null : deadline.value, s = start.value || now;
      hint.textContent = "";
      if (def.displayOnly) { hint.textContent = "Shown only. Reaching it records nothing and pays nothing."; return; }
      if (def.direction === "under") { hint.textContent = "A stay-under goal has no line: it is Under while under and Over once over."; return; }
      if (!t) return;
      var span = repeat === "week" ? 7 : repeat === "month" ? 30 : end ? between(s, end) + 1 : null;
      if (span && t) hint.textContent = "The line: " + (t >= span ? Math.round(t / span * 10) / 10 + " a day" : "one about every " + Math.round(span / t) + " days") + ". Pace shows once a day has passed.";
      else hint.textContent = "No deadline, so no pace: the figure is shown as it grows.";
    }
    if (countIn) countIn.addEventListener("input", line);
    deadline.addEventListener("change", line);
    byIn.addEventListener("change", line);
    start.addEventListener("change", function () { if (repeat === "week") draw(); else line(); });
    draw();
    function saveExam() {
      var a = KOS.exams.get(xs.examId);
      if (!a) { err.hidden = false; err.textContent = "✕ Choose the exam it follows"; return; }
      if (!title.value.trim()) { err.hidden = false; err.textContent = "✕ Give the goal a title"; title.focus(); return; }
      var params = Object.assign({}, xs.params);
      if (byIn.value && a.date && byIn.value < a.date) params.by = byIn.value; else delete params.by;
      if (typeId === "exam_grade" && !params.basis) params.basis = "result";
      if (typeId === "exam_topics_green" && !params.basis) params.basis = "green";
      var t = +countIn.value;
      if (typeId === "exam_grade" && params.grade) t = KOS.goalsExams.gradeCut(a, params.grade) || 1;
      if (typeId === "exam_topics_green" && params.all) t = KOS.exams.leaves(a).length || 1;
      if (typeId === "exam_checklist") t = KOS.exams.checklist(a).length || 1;
      if (!(t > 0)) { err.hidden = false; err.textContent = "✕ The target must be above 0"; return; }
      var l = Object.assign({}, links, { examId: a.id });
      if (a.subject) l.subject = a.subject;
      var fields = { title: title.value.trim(), type: typeId, target: t, links: l, params: params, deadline: params.by || a.date || null, milestones: [] };
      var saved = existing ? G.update(existing.id, fields) : G.add(fields);
      ov.remove();
      announce("Goal added: " + saved.title + (saved.deadline ? " by " + shortDate(saved.deadline) : ""));
      KOS.show("goals", { id: saved.id });
    }
    function save() {
      if (def.exam) { saveExam(); return; }
      var t = targetValue();
      if (!title.value.trim()) { err.hidden = false; err.textContent = "✕ Give the goal a title"; title.focus(); return; }
      if (!(t > 0) && !(def.direction === "under" && t === 0)) { err.hidden = false; err.textContent = "✕ The target must be above 0"; return; }
      if (!repeat && deadline.value && start.value && deadline.value < start.value) { err.hidden = false; err.textContent = "✕ The deadline is before the start"; return; }
      if (def.fields.pot && !links.pot) { err.hidden = false; err.textContent = "✕ Choose a pot"; return; }
      var fields = { title: title.value.trim(), type: typeId, target: t, repeat: repeat || null, weekFrom: repeat === "week" ? weekFrom : null,
        startDate: start.value || now, deadline: repeat ? null : (deadline.value || null), milestones: milestones, links: links };
      if (extra.module) fields.module = extra.module.value || null;
      if (extra.linked) fields.linkedEntryId = extra.linked.value ? Number(extra.linked.value) : null;
      if (extra.filterKind) { fields.filterKind = extra.filterKind.value; fields.filterValue = extra.filterValue.value; }
      if (extra.habit) fields.params = Object.assign({}, g.params || {}, { habit: extra.habit.value });
      if (def.linked && !fields.linkedEntryId) { err.hidden = false; err.textContent = "✕ Choose the title this goal follows"; return; }
      var saved = existing ? G.update(existing.id, fields) : G.add(fields);
      ov.remove();
      announce("Goal saved · " + saved.title);
      KOS.show("goals", { id: saved.id });
    }
    var ov = dialogBox(existing ? "Edit goal" : (seed.title || def.label), DOMAIN[def.domain] ? DOMAIN[def.domain].k.replace("C#", "碼") : "標", [form],
      [existing ? el("span") : btn("Back", "k-btn--quiet", function () { ov.remove(); newGoal(); }, "goal.back"),
        btn("Cancel", "", function () { ov.remove(); }), btn("Save goal", "k-btn--primary", save, "goal.save")], "goal.editor", "k-gl-dialog--form k-msheet--full");
  }
  /* the old entry point other pages and tests call */
  KOS.goalEditor = function (existing) { if (existing) goalDialog(existing); else newGoal(); };
  KOS.goalsUI = { newGoal: newGoal, goalDialog: goalDialog, paceKind: paceKind, word: word, hm: hm, actionFor: actionFor, nextStep: nextStep };
})();
