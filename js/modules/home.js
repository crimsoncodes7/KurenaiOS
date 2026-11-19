/* Kurenai OS — modules/home.js
   Home (Graphite frame 1): the profile band, Up next and Focus, Today's three, the routines,
   the study, plan, goals and Collection cards. KOS.homeNextAction, KOS.homeFocusPlan,
   KOS.homeDailyGoalMins, KOS.rankName and KOS.spaceMark live here.
   Split out of hub.js (W8, the quality audit's AP-09); the shared
   derivations, the spine and the spec renderers stay in hub.js and
   reach this file through KOS.hub._. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store, H = KOS.hub._;
  var BYREF = H.BYREF, LEAVES = H.LEAVES, LESSONISH = H.LESSONISH, SUBJECTS = H.SUBJECTS, SUBJ_HUE = H.SUBJ_HUE, SUBJ_SHORT = H.SUBJ_SHORT,
    cardHead = H.cardHead, hideTree = H.hideTree, hm = H.hm, subjectStats = H.subjectStats;

  /* ---------- views ---------- */

  /* rank ladder shared by the home profile band and the Governor's Seat */
  var RANKS = [[1, "Novice"], [3, "Apprentice"], [5, "Scholar"], [8, "Adept"],
               [12, "Sage"], [16, "Archivist"], [20, "Grandmaster"]];
  function rankName(level) {
    var r = RANKS[0][1];
    RANKS.forEach(function (x) { if (level >= x[0]) r = x[1]; });
    return r;
  }
  KOS.rankName = rankName;

  function greeting() {
    var h = new Date().getHours();
    return h < 5 ? "Working late." : h < 12 ? "Good morning." : h < 18 ? "Good afternoon." : "Good evening.";
  }
  function todayLine() {
    return new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  }

  /* ---------- what the front page actually measures (Cat 7 Phase C) ----------
     Home led with `0% covered · 0/355 spec points · 0 mastered` for an account
     at Level 53 with 1,652 sessions and a 36-day streak (audit HOME-1/G-29).
     Every one of those figures was TRUE — all the progress records were
     `status:"none"` — and every one of them told the app's most active user
     they had done nothing, because they measure a checklist the user does not
     tick rather than the work the user actually does.

     These three measure the work. Coverage keeps its place on the subject
     cards, where it is a property of a subject rather than a headline. */
  function hoursThisWeek() {
    var cut = Date.now() - 7 * 864e5;
    var secs = KOS.sessions.all().reduce(function (a, s) {
      return s.ts < cut ? a : a + KOS.sessions.studySecs(s);   /* Focus time, as Reports and Goals (HR-05) */
    }, 0);
    return secs / 3600;
  }
  function sessionsThisWeek() {
    var cut = Date.now() - 7 * 864e5;
    return KOS.sessions.all().filter(function (s) {
      return s.type === "focus" && s.ts >= cut;
    }).length;
  }

  /* ---------- "what should I do next" ----------
     The one statement the front page leads with. It reads the surfaces that
     already exist — the focus machine, the review queue, the merged countdowns,
     the generated directives, the last topic — and picks the first that has
     something to say. It creates nothing and writes nothing; every branch
     hands off to a view that already owns the work. */
  function nextAction(opts) {
    opts = opts || {};
    /* 1 — a session is already running. Nothing outranks finishing it. */
    if (KOS.focus && KOS.focus.state && KOS.focus.state() !== "idle") {
      return { kicker: "In progress", label: "You have a focus session running",
        why: "Pick it back up where you left it.",
        cta: "◉ Return to the session", go: function () { KOS.show("focus"); }, live: true };
    }
    /* 2 — the review queue. Overdue recall is the most perishable thing here. */
    var due = opts.skipDue ? 0 : KOS.srs.dueCount();
    if (due) {
      return { kicker: "Due today", label: KOS.ui.num(due) + " card" + (due === 1 ? "" : "s") + " ready for review",
        why: "Recall decays on a schedule — these cards have dipped to the recall you aim for.",
        cta: "Start reviewing →", go: function () { KOS.show("due"); } };
    }
    /* 3 — anything dated and close. countdowns() is the merged read over the
       calendar and the assignment tracker, so this cannot disagree with the
       Countdowns panel further down the page. */
    var soon = (KOS.calendar.countdowns ? KOS.calendar.countdowns(null, 1) : [])[0];
    if (soon && soon.days <= 7) {
      return { kicker: soon.days === 0 ? "Today" : soon.days === 1 ? "Tomorrow" : "In " + soon.days + " days",
        label: soon.title, why: soon.meta,
        cta: soon.kind === "pacing" ? "Open the week →" : "Open the calendar →",
        go: function () { if (soon.kind === "pacing") KOS.show("pacing", { wb: soon.entry.wb }); else KOS.show("calendar"); } };
    }
    /* 3b — the weekly plan is behind: unticked rows carried in from earlier
       weeks. Read from the plan; ticking them off happens on the card below
       or on the Pacing page. */
    if (KOS.pacing && KOS.pacing.dueThisWeek) {
      var owe = KOS.pacing.dueThisWeek();
      if (owe.carried.length) {
        return { kicker: "Behind on the plan", label: owe.carried.length + " topic" + (owe.carried.length === 1 ? "" : "s") + " carried over from earlier weeks",
          why: owe.carried.slice(0, 3).map(function (c) { return c.entry.title; }).join(" · "),
          cta: "Open the week →", go: function () { KOS.show("pacing", { wb: owe.week.wb }); } };
      }
    }
    /* 4 — the first directive still unsealed */
    var open = (KOS.todo.autoItems() || []).filter(function (a) { return !a.done; })[0];
    if (open) {
      return { kicker: "Today's directives", label: open.label,
        why: "First of today's generated list.", cta: "Go →", go: open.go };
    }
    /* 5 — carry on where the reading stopped */
    for (var i = 0; i < SUBJECTS.length; i++) {
      var sid = SUBJECTS[i], last = store.state.ui.lastRef[sid];
      if (last && BYREF[sid][last]) {
        return { kicker: "Where you left off", label: last + " " + BYREF[sid][last].title,
          why: KOS_DATA[sid].name, cta: "Continue →", subject: sid, ref: last,
          go: (function (s, r) { return function () { KOS.show("ref", { subject: s, ref: r }); }; })(sid, last) };
      }
    }
    /* 6 — a genuinely clear board */
    return { kicker: "Clear", label: "Nothing is waiting",
      why: "No cards due, no deadlines inside a week, every directive sealed.",
      cta: "◉ Begin a focus session", go: function () { KOS.show("focus"); } };
  }
  KOS.homeNextAction = nextAction;

  /* ---------- the Focus card's own ladder ----------
     What a focus session should be spent on, which is a narrower question
     than nextAction(): never the review queue (the card's Review side owns
     that) and never an in-class item — a lesson is sat in class, not at
     the desk (review after part 2). Each rung says what the Goal row means
     for it.
       1  a study block from the calendar, from 30 minutes before it starts
          until it ends — it is the plan you made for this hour, so it
          leads even in an exam week; the goal is the block's length;
       2  an exam inside its lead time (calendar EXAM_LEVELS: a real exam 7
          days, a mock 5, an end-of-topic test 3, a retrieval test 1) —
          more important kinds first, then nearer; the goal is that kind's
          daily revision time;
       3  an open assignment due within 7 days (or overdue), nearest first;
          the goal is what its estimate has left;
       4  the next exam of any kind within six weeks; a 2-hour goal;
       5  the personal plan's carried rows, then where the reading stopped,
          then a clear board — each with the 2-hour daily goal. */
  var FOCUS_LEAD_MIN = 30, FOCUS_GOAL_MIN = 120;
  /* the daily goal follows a repeating "Study for a number of hours" goal
     when there is one (21 hours a week → 3 hours a day; a month's goal by
     that month's days), to one decimal place of an hour; a goal for the
     whole of study wins, else the subjects' goals add up. None: 2 hours. */
  function dailyGoalMins() {
    var gs = KOS.goals ? KOS.goals.all().filter(function (g) {
      return g.type === "study-hours" && !g.archived && g.status === "active" && (g.repeat === "week" || g.repeat === "month") && g.target > 0;
    }) : [];
    if (!gs.length) return FOCUS_GOAL_MIN;
    var whole = gs.filter(function (g) { return !g.links || !g.links.subject; });
    var now = new Date(), monthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    var perDay = (whole.length ? whole.slice(0, 1) : gs).reduce(function (n, g) { return n + g.target / (g.repeat === "week" ? 7 : monthDays); }, 0);
    return Math.max(6, Math.round(Math.round(perDay * 10) / 10 * 60));
  }
  KOS.homeDailyGoalMins = dailyGoalMins;
  function hmMins(t) { var p = String(t || "").split(":"); return +p[0] * 60 + +p[1]; }
  function minsText(m) {
    m = Math.max(0, Math.round(m));
    return m < 60 ? m + " min" : Math.floor(m / 60) + "h" + (m % 60 ? " " + (m % 60) + "m" : "");
  }
  function focusPlan(now) {
    now = now || new Date();
    var today = KOS.srs.todayISO();
    var nowM = now.getHours() * 60 + now.getMinutes();
    var doneToday = Math.round(hoursOn(today) * 60);
    function dailyGoal(mins) {
      return { k: "Goal", v: minsText(Math.min(doneToday, mins)) + " of " + minsText(mins) + " today", bar: Math.round(100 * doneToday / mins) };
    }
    function refsOfEv(ev) { return KOS.calendar.refsOf ? KOS.calendar.refsOf(ev) : []; }

    /* 1 — a study block about to start, or running */
    var blocks = (KOS.calendar.eventsOn ? KOS.calendar.eventsOn(today) : []).filter(function (e) {
      if (e.type !== "study" || !e.time) return false;
      var st = hmMins(e.time);
      var en = e.endTime ? hmMins(e.endTime) : st + (e.durationMins || 60);
      return nowM >= st - FOCUS_LEAD_MIN && nowM < en;
    });
    if (blocks.length) {
      var b = blocks[0], st = hmMins(b.time);
      var len = b.endTime ? hmMins(b.endTime) - st : (b.durationMins || 60);
      var left = Math.min(len, (b.endTime ? hmMins(b.endTime) : st + len) - Math.max(nowM, st));
      var asg = b.assignmentId != null && KOS.assignments ? KOS.assignments.get(b.assignmentId) : null;
      return { kind: "block", kicker: nowM < st ? "Study block · starts in " + (st - nowM) + " min" : "Study block · now",
        label: b.title, why: b.time + (b.endTime ? "–" + b.endTime : "") + (asg ? " · for " + asg.title : "") + (b.subject ? " · " + SUBJ_SHORT[b.subject] : ""),
        subject: b.subject || (asg && asg.subject) || null, ref: b.ref || null, refs: refsOfEv(b),
        assignmentId: asg ? asg.id : null, mins: Math.max(5, Math.min(180, left)), fixed: true,
        goal: { k: "Block", v: minsText(len) + (nowM >= st && left < len ? " · " + minsText(left) + " left" : "") },
        go: function () { KOS.show("calendar"); } };
    }

    /* 2 — an exam inside its lead time */
    /* HR-24: not an exam already sat today */
    var exams = (KOS.calendar.deadlines ? KOS.calendar.deadlines() : []).filter(function (d) {
      return d.ev.type === "exam" && !(KOS.todo && KOS.todo.examSat ? KOS.todo.examSat(d, now) : false);
    });
    var LV = KOS.calendar.EXAM_LEVELS || [];
    function lvOf(ev) { return KOS.calendar.examLevel ? KOS.calendar.examLevel(ev) : { v: "exam", short: "Exam", leadDays: 7, goalMins: 120 }; }
    function rank(ev) { var v = lvOf(ev).v; for (var i = 0; i < LV.length; i++) if (LV[i].v === v) return i; return 0; }
    /* the time today that was FOR this exam: a session started from its
       card (the objective names it) or one whose topics meet the exam's
       linked topics. A bare timer, or another subject, is not revision for
       it (review: the goal counted every minute of the day) */
    /* minutes today FOR these topics: a session whose objective is `label`
       (one started from this card), or, by stretch, a switched session's
       time on these topics only */
    function topicMins(refs, label) {
      var leaves = refs && refs.length ? KOS.spec.resolve(refs) : [];
      return Math.round(KOS.sessions.all().reduce(function (sum, x) {
        if (x.date !== today || x.type === "media" || x.type === "todo" || !x.dur) return sum;
        if (label && x.metrics && x.metrics.objective === label) return sum + x.dur;
        if (!leaves.length) return sum;
        return sum + KOS.sessions.parts(x).reduce(function (n, p) {
          var mine = KOS.spec.resolve(p.refs);
          return mine.some(function (k) { return leaves.indexOf(k) !== -1; }) ? n + p.secs : n;
        }, 0);
      }, 0) / 60);
    }
    function examMins(ev) {
      /* ONE definition with the Daily goal's directive (UR-30): the two
         read the same minutes, so the card and the goal never disagree */
      if (KOS.todo && KOS.todo.minsFor) return KOS.todo.minsFor(ev, today);
      return topicMins(refsOfEv(ev), "Revise for " + ev.title);
    }
    function examPlan(d, goalMins) {
      var lv = lvOf(d.ev), done = examMins(d.ev);
      return { kind: "exam", kicker: lv.short + " " + (d.days === 0 ? "today" : d.days === 1 ? "tomorrow" : "in " + d.days + " days"),
        label: "Revise for " + d.ev.title,
        why: [d.ev.paper, d.ev.subject ? SUBJ_SHORT[d.ev.subject] : null, d.ev.time ? d.date === today ? "at " + d.ev.time : null : null].filter(Boolean).join(" · ") || lv.label,
        subject: d.ev.subject || null, ref: d.ev.ref || null, refs: refsOfEv(d.ev), eventId: d.ev.id,
        goal: { k: "Goal", v: minsText(Math.min(done, goalMins)) + " of " + minsText(goalMins) + " for this exam today", bar: Math.round(100 * done / goalMins) },
        go: function () { if (d.ev.assessmentId) KOS.show("exams", d.ev.assessmentId); else KOS.show("calendar"); } };
    }
    var hot = exams.filter(function (d) { return d.days <= lvOf(d.ev).leadDays; })
      .sort(function (a, b2) { return rank(a.ev) - rank(b2.ev) || a.days - b2.days; });
    if (hot.length) return examPlan(hot[0], lvOf(hot[0].ev).goalMins);

    /* 2b — the Exams hub's two rungs (roadmap 5.8, 29w): a deadline at
       risk (a milestone gone overdue), then an assessment whose start-by
       is today. Both read KOS.exams; neither writes. */
    if (KOS.exams) {
      var EX = KOS.exams;
      var risky = EX.upcoming(today).filter(function (x) { return x.tier === "deadline" && (x.milestones || []).some(function (m) { return !m.done && m.date && m.date < today; }); })[0];
      if (risky) {
        var om = risky.milestones.filter(function (m) { return !m.done && m.date && m.date < today; })[0];
        var nm = risky.milestones.filter(function (m) { return !m.done && m.date && m.date >= today; })[0];
        var late = KOS.srs.daysBetween(om.date, today);
        return { kind: "deadline", kicker: "Deadline at risk", label: risky.title,
          why: [risky.subject ? SUBJ_SHORT[risky.subject] : null, "due " + risky.date].filter(Boolean).join(" · "),
          subject: risky.subject || null, ref: null, refs: [], mins: 50,
          goal: { k: "Overdue", v: om.text + " · " + late + (late === 1 ? " day" : " days") + (nm ? " · next: " + nm.text : "") },
          go: function () { KOS.show("exams", risky.id); } };
      }
      var sbToday = EX.upcoming(today).filter(function (x) { var st = EX.startState(x); return st && st.state === "today"; })[0];
      if (sbToday) {
        var sbs = EX.startBy(sbToday), lsb = EX.leaves(sbToday), lead = KOS.spec.firstLeaf(lsb);
        return { kind: "startby", kicker: "Start today · advisory", label: sbToday.title,
          why: [sbToday.subject ? SUBJ_SHORT[sbToday.subject] : null, EX.daysTo(sbToday) + " days to go"].filter(Boolean).join(" · "),
          subject: sbToday.subject || (lead && lead.subject) || null, ref: lead ? lead.ref : null, refs: lsb.slice(0, 30), mins: 25,
          goal: { k: "Plan", v: sbs && !sbs.override ? sbs.why : "your own start-by date" },
          go: function () { KOS.show("exams", sbToday.id); } };
      }
    }

    /* 3 — an assignment due within a week, or overdue */
    var A = KOS.assignments;
    var asgs = A ? A.all().filter(function (a) {
      if (!A.isOpen(a) || !a.due) return false;
      return A.isOverdue(a) || A.daysLeft(a) <= 7;
    }).sort(function (a, b2) {
      var oa = A.isOverdue(a) ? 0 : 1, ob = A.isOverdue(b2) ? 0 : 1;
      return oa - ob || (a.due + (a.dueTime || "")).localeCompare(b2.due + (b2.dueTime || "")) || b2.priority - a.priority;
    }) : [];
    if (asgs.length) {
      var a = asgs[0], dl = A.daysLeft(a), est = a.estimateMins || 0, spent = a.actualMins || 0;
      var refs = A.refsOf ? A.refsOf(a) : (a.refs || []);
      var first = KOS.spec.firstLeaf(refs);
      return { kind: "assignment",
        kicker: A.isOverdue(a) ? "Overdue" : dl === 0 ? "Due today" : dl === 1 ? "Due tomorrow" : "Due in " + dl + " days",
        label: a.title, why: "Assignment" + (a.subject ? " · " + SUBJ_SHORT[a.subject] : "") + (a.progress ? " · " + a.progress + "% done" : ""),
        subject: a.subject || (first && first.subject) || null, ref: first ? first.ref : null, refs: refs, assignmentId: a.id,
        goal: est ? { k: "Left", v: (spent >= est ? "Over the " + minsText(est) + " estimate" : "About " + minsText(est - spent) + " of " + minsText(est)), bar: Math.round(100 * spent / est) }
          : { k: "Left", v: "No estimate yet" + (spent ? " · " + minsText(spent) + " spent" : "") },
        go: function () { if (KOS.assignmentDetail) KOS.assignmentDetail(a.id, function () { KOS.show("home", undefined, { _nav: true }); }); else KOS.show("assignments"); } };
    }

    /* 3b — the study spaces' dailies not done today (design turn 40a):
       Code's Daily 20, Japanese's reviews then its next lesson, Mind's
       Daily 15, the Daily Creative; only spaces that have been started.
       Each runs its own session, so the card opens the space, not Focus. */
    var spaces = KOS.today && KOS.today.spaces ? KOS.today.spaces() : [];
    var open = spaces.filter(function (s) { return !s.done && s.go; });
    if (open.length) {
      var sp = open[0];
      return { kind: "space", space: sp.sid, mark: sp.mark, hue: sp.hue, kicker: "Up next · " + sp.daily,
        label: sp.title, why: sp.why, subject: sp.sid, ref: null, refs: [], own: true,
        goal: sp.mins ? { k: "Session", v: minsText(sp.mins) + " · its own" } : null,
        then: open.slice(1).map(function (s) { return { mark: s.mark, hue: s.hue, text: s.short, sid: s.sid }; }),
        cta: "Open the " + sp.daily + " →", go: sp.go };
    }

    /* 4 — the next exam of any kind, further out */
    var later = exams.filter(function (d) { return d.days <= 42; })[0];
    if (later) return examPlan(later, dailyGoalMins());

    /* 5 — the personal plan, the reading, or a clear board */
    var rest = null;
    if (KOS.pacing && KOS.pacing.dueThisWeek) {
      var owe = KOS.pacing.dueThisWeek();
      if (owe.carried.length) {
        var c0 = owe.carried[0].entry, l0 = (c0.refs || [])[0];
        rest = { kicker: "Behind on the plan", label: c0.title,
          why: owe.carried.length > 1 ? "and " + (owe.carried.length - 1) + " more carried over from earlier weeks" : "carried over from an earlier week",
          subject: c0.subject, ref: l0 || null, refs: (c0.refs || []).map(function (r) { return c0.subject + ":" + r; }),
          go: function () { KOS.show("pacing", { wb: owe.week.wb }); } };
      }
    }
    var keep = store.state.ui.lastRef || {};
    for (var i = 0; i < SUBJECTS.length && !rest; i++) {
      var sid = SUBJECTS[i], last = keep[sid];
      if (last && BYREF[sid][last]) rest = { kicker: "Where you left off", label: last + " " + BYREF[sid][last].title, why: KOS_DATA[sid].name,
        subject: sid, ref: last, go: (function (s2, r2) { return function () { KOS.show("ref", { subject: s2, ref: r2 }); }; })(sid, last) };
    }
    /* the user, 19 Nov 2026: a plan row or a topic is measured by the time
       spent ON IT today (a session started from this card, or a stretch on
       its topics), never the day's total — a CS session filled the bar under
       "Quadratics". Only the clear board keeps the daily goal. */
    if (rest) {
      var on = topicMins(rest.refs && rest.refs.length ? rest.refs : rest.subject && rest.ref ? [rest.subject + ":" + rest.ref] : [], rest.label);
      return Object.assign({ kind: "general" }, rest, { goal: on > 0 ? { k: "Today", v: minsText(on) + " on this" } : null });
    }
    rest = { kicker: "Clear", label: "Nothing is waiting", why: "No study block, exam or assignment inside a week.", go: function () { KOS.show("focus"); } };
    return Object.assign({ kind: "general" }, rest, { goal: dailyGoal(dailyGoalMins()) });
  }
  KOS.homeFocusPlan = focusPlan;

  /* ---------- Home (Graphite frame 7a/7b) ----------
     Reads only: every figure comes from a service that already owns it
     (sessions, SRS, the directive list, habits, reminders, the calendar,
     countdowns, the weekly plan, RAG, the media vault). The page writes
     nothing on render; the controls hand off to the view that owns the
     work, or tick through the owner's own API (a directive, a plan row). */
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var homeMode = null;        /* the Up next switch, per page visit (UI-only state) */

  function isoOf(d) {
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function shortDay(iso) {
    var d = new Date(iso + "T12:00:00");
    return DOW[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()];
  }
  function hoursOn(iso) {
    return KOS.sessions.all().reduce(function (a, s) {
      return s.date === iso ? a + KOS.sessions.studySecs(s) : a;
    }, 0) / 3600;
  }
  /* Study hours is study (the user, 19 Nov 2026): Focus time on a subject
     or a study space only, never time linked to nothing */
  var IS_SUBJECT = {};
  SUBJECTS.forEach(function (sid) { IS_SUBJECT[sid] = true; });
  function subjectSecs(s) {
    if (!KOS.sessions.studySecs(s)) return 0;
    return KOS.sessions.parts(s).reduce(function (a, p) { return p.subject && IS_SUBJECT[p.subject] ? a + p.secs : a; }, 0);
  }
  function subjectHoursOn(iso) {
    return KOS.sessions.all().reduce(function (a, s) { return s.date === iso ? a + subjectSecs(s) : a; }, 0) / 3600;
  }
  function fmtH(h) { return h >= 10 ? String(Math.round(h)) : String(Math.round(h * 10) / 10); }
  /* a study space's mark in its hue (碼 語 心 創), beside its daily */
  function spaceMark(mark, hue) {
    return el("span", { class: "k-tile k-space-mark", lang: "ja", "aria-hidden": "true", style: "--tile-c: " + (hue || "var(--muted)"), text: mark });
  }
  KOS.spaceMark = spaceMark;
  function cardRow(k, v, bar) {
    return el("div", { class: "k-card-row" }, [
      el("span", { class: "k-kv-k", text: k }),
      el("span", { class: "k-kv-v", text: v }),
      bar == null ? null : el("span", { class: "k-bar k-kv-bar", style: "--p: " + Math.max(0, Math.min(100, bar)) + "%" }, [el("i")])
    ].filter(Boolean));
  }

  /* Today's three, read from the Morning Review (roadmap 5.10) */
  function homeThree() {
    var V = KOS.dayReview;
    if (!V || !V.enabled()) return [];
    var day = KOS.routines.routineDay();
    var m = V.day(day).morning || {}, first = V.firstFor(day);
    return (m.three || []).map(function (ref) {
      var x = V.resolve(ref);
      if (!x) return null;
      var out = Object.assign({ ref: ref }, x);
      if (first && first.kind === ref.kind && String(first.id) === String(ref.id)) out.action = first.action;
      return out;
    }).filter(Boolean);
  }
  /* ticked through the owner, with Undo; a topic opens instead */
  function tickThree(p) {
    var id = p.ref.id, undo = null;
    if (p.ref.kind === "reminder") {
      /* completing: Undo restores it exactly (a repeating one's date) and
         takes the pay back (HR-21, PR-27) */
      if (!p.done && KOS.reminders.completeUndoable) { var rr = KOS.reminders.completeUndoable(id); undo = function () { if (rr) rr.undo(); }; }
      else { KOS.reminders.complete(id, !p.done); undo = function () { KOS.reminders.complete(id, !!p.done); }; }
    }
    else if (p.ref.kind === "assignment") {
      var a = KOS.assignments.get(id), was = a ? a.status : null;
      if (!a) return;
      KOS.assignments.setStatus(id, p.done ? "inProgress" : "complete");
      undo = function () { KOS.assignments.setStatus(id, was); };
    } else if (p.ref.kind === "plan") { KOS.pacing.setDone(id, !p.done); undo = function () { KOS.pacing.setDone(id, !!p.done); }; }
    else if (p.ref.kind === "topic") { var i = String(id).indexOf(":"); KOS.show("ref", { subject: id.slice(0, i), ref: id.slice(i + 1) }); return; }
    /* a space's daily is done in its space, never ticked here (40a) */
    else if (p.ref.kind === "space") { var sp = KOS.today && KOS.today.space(String(id)); if (sp && sp.go) sp.go(); else KOS.show(String(id) === "ja" ? "japanese" : String(id)); return; }
    else return;
    KOS.ui.toast(p.title + (p.done ? " · reopened" : " · done"), false, { label: "Undo", run: function () { undo(); KOS.rerender(); } });
    KOS.rerender();
  }
  function homeRoutines(today) {
    var card = el("section", { class: "k-card", "data-ui": "home.routines", "aria-label": "Routines" });
    var Rt = KOS.routines;
    if (!Rt || !Rt.enabled()) {
      card.appendChild(cardHead("Routines", null, "Routines →", function () { KOS.show("routines"); }));
      card.appendChild(KOS.ui.emptyState({ compact: true, body: "No routines yet." }));
      return card;
    }
    var day = Rt.routineDay(), now = new Date(), hm = (now.getHours() < 10 ? "0" : "") + now.getHours() + ":" + (now.getMinutes() < 10 ? "0" : "") + now.getMinutes();
    var list = Rt.today();
    var routines = list.filter(function (x) { return x.kind !== "habit"; });
    var dueNow = routines.filter(function (x) { return x.window && x.window.from <= hm && hm < x.window.to && x.state !== "done" && x.state !== "min" && x.state !== "rest"; })[0];
    var nextR = routines.filter(function (x) { return x.window && x.window.from > hm && x.state !== "done"; }).sort(function (a, b) { return a.window.from < b.window.from ? -1 : 1; })[0];
    var habits = Rt.all({ kind: "habit" }).filter(function (h) { return Rt.scheduledOn(h, day); });
    var kept = habits.filter(function (h) { var st = Rt.stateOn(h, day); return st === "done" || st === "min"; }).length;
    card.appendChild(cardHead("Routines", dueNow ? dueNow.name + " due now" : habits.length ? kept + " of " + habits.length + " habits today" : null,
      "All routines →", function () { KOS.show("routines"); }));
    if (dueNow) {
      var r = Rt.get(dueNow.id);
      card.appendChild(el("div", { class: "k-home-rt-now", "data-ui": "home.routine-now" }, [
        KOS.rtUI.tile(KOS.rtUI.markOf(r), KOS.rtUI.toneOf(r)),
        el("div", { class: "k-home-rt-t" }, [el("b", { text: dueNow.name + " · " + dueNow.n + " of " + dueNow.of }),
          el("span", { class: "k-rt-progress", "aria-hidden": "true" }, dueNow.steps.filter(function (s) { return !s.optional; }).map(function (s) { var p = el("span"); if (s.done) KOS.ui.state(p, "on", true); return p; }))]),
        el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "home.routine-start", text: "▶ Start", onclick: function () { KOS.routinePlayer.open(r.id); } })
      ]));
    }
    if (!habits.length && !dueNow) {
      card.appendChild(KOS.ui.emptyState({ compact: true, body: nextR ? "Nothing due now. " + nextR.name + " at " + nextR.window.from + "." : routines.length ? "Every routine for today is kept." : "No routines yet — a habit is a routine with one step." }));
    }
    var rgrid = el("div", { class: "k-routines" });
    var weekStart = (function () { var d = new Date(today + "T12:00:00"); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; })();
    /* an even count, so the two-column grid never ends in a gap */
    var nH = Math.min(habits.length, dueNow ? 2 : 4);
    if (nH > 1 && nH % 2) nH--;
    habits.slice(0, nH).forEach(function (h) {
      var st = Rt.stateOn(h, day), on = st === "done" || st === "min";
      var weekKept = 0;
      for (var i = 0; i < 7; i++) { var d = new Date(weekStart); d.setDate(weekStart.getDate() + i); var iso = isoOf(d); if (iso <= today) { var s2 = Rt.stateOn(h, iso); if (s2 === "done" || s2 === "min") weekKept++; } }
      /* a habit several times a day ticks its next time (roadmap 5.10) */
      var he = Rt.entry(h.id, day), hs0 = h.times ? Rt.stepsFor(h, he) : null;
      var nextT = hs0 ? hs0.filter(function (x) { return !(he && he.steps && he.steps[x.id]); })[0] : null;
      var doneN = hs0 ? hs0.length - hs0.filter(function (x) { return !(he && he.steps && he.steps[x.id]); }).length : 0;
      var row = el("button", { type: "button", class: "k-check-row", "data-ui": "home.routine-tick", "aria-pressed": String(on),
        "aria-label": hs0 ? (nextT ? "Tick " + h.name + " at " + nextT.at : "Untick " + h.name + " at " + hs0[hs0.length - 1].at) : (on ? "Untick " : "Tick ") + h.name + " for today",
        onclick: function () {
          if (hs0) { if (nextT) KOS.rtUI.tickStep(h, nextT.id, true); else KOS.rtUI.tickStep(h, hs0[hs0.length - 1].id, false); return; }
          if (h.steps[0]) KOS.rtUI.tickStep(h, h.steps[0].id, !on);
        } }, [
        el("span", { class: "k-dotcheck", "aria-hidden": "true", text: on ? "✓" : st === "rest" ? "休" : hs0 && doneN ? doneN + "/" + hs0.length : "" }),
        el("span", { class: "k-check-row-text", text: h.name + (nextT ? " · " + nextT.at : "") }),
        el("span", { class: "k-check-row-meta", text: weekKept + " of 7" + (on ? " this week" : "") })
      ]);
      if (on) KOS.ui.state(row, "done", true);
      rgrid.appendChild(row);
    });
    if (rgrid.children.length) card.appendChild(rgrid);
    /* the next review, or the one waiting */
    var V = KOS.dayReview;
    if (V && V.enabled()) {
      var due = V.due(), mk = { morning: "朝", afternoon: "昼", evening: "夜" };
      var nextSlot = due ? due.slot : V.SLOTS.filter(function (sl) { var t = V.slotTime(sl, day); return t && t > hm; })[0];
      if (nextSlot) {
        var line = el("button", { type: "button", class: "k-home-rt-review", "data-ui": "home.review-line",
          onclick: function () { if (due) KOS.reviewSheet.open(due.slot); else KOS.show("routines"); } }, [
          el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: mk[nextSlot] }),
          el("span", { class: "k-check-row-text", text: V.LABEL[nextSlot] + (due ? " · ready" : " · at " + V.slotTime(nextSlot, day)) }),
          el("span", { class: "k-check-row-meta", text: due ? "Open ›" : "" })
        ]);
        card.appendChild(line);
      }
    }
    return card;
  }

  var lastCollAgg = null;      /* HR-30: the Collection desk's last figures, this page load */
  KOS.views.home = function (main) {
    hideTree();
    var stks = KOS.sessions.streaks();
    var g = store.state.governor;
    var li = KOS.governor.levelInfo(g.xp);
    var hpS = KOS.governor.hpState();
    var hpInfo = KOS.governor.hpStateInfo();
    var prof = KOS.governor.profile();
    var today = KOS.srs.todayISO();
    /* each space's review queue (40a), opened there; Creatives' cards
       leave the Flashcards row for their own */
    var spaceRev = (KOS.today && KOS.today.spaces ? KOS.today.spaces() : []).filter(function (s) { return s.review && s.review.n > 0; });
    var crRow = spaceRev.some(function (s) { return s.sid === "creatives"; });
    var dueCards = KOS.srs.dueCards().filter(function (c) { return !crRow || c.sid !== "creatives"; });
    var dueN = dueCards.length;
    var revAll = dueN + spaceRev.reduce(function (n, s) { return n + s.review.n; }, 0);

    /* ================= the hero ================= */
    var band = el("section", { class: "k-home-hero", "data-ui": "home.hero home.id", "data-hp": hpS, "aria-label": "Today" });
    /* the banner is the user's; the scrim keeps the text legible whatever
       the artwork (audit HOME-2) */
    /* the user's own banner keeps showing (roadmap 5.14); otherwise the
       season's painting (34k). Critical HP owns the slot: no picture. */
    if (KOS.governor.customBannerSrc && KOS.governor.customBannerSrc()) KOS.governor.applyBanner(band, { scrim: "hero" });
    else if (hpS !== "critical" && KOS.art) {
      KOS.art.layer(band, "home", { eager: true });
      /* the slot's chip (34k): on hover and keyboard focus, last in the focus order */
      if (KOS.artSlot && KOS.art.on()) {
        var hc = KOS.art.cfg("home"), hs = KOS.art.season();
        band.appendChild(el("button", { type: "button", class: "k-art-chip", "data-ui": "art.chip",
          "aria-label": "Home's picture: change or rotate",
          onclick: function () { KOS.artSlot.open("home", function () { KOS.rerender(); }); } }, [
          "◐ ", hc && hc.mode === "own" ? "Your picture" : hs.charAt(0).toUpperCase() + hs.slice(1),
          el("span", { class: "k-muted", text: " · " + (!hc || (hc.mode === "rotate" && (hc.period || "season") === "season") ? "by season" : hc.mode === "one" ? "one picture" : hc.mode) + " ▾" })]));
      }
    }
    var ring = el("span", { class: "k-home-ring", "data-hp": hpS, style: "--hp: " + Math.max(0, Math.min(100, g.hp)) + "%" },
      [KOS.governor.avatarNode(94)]);
    /* a painted frame's reach is kept inside the hero, clear of the greeting (SC-08) */
    var hb = KOS.governor.frameBleed ? KOS.governor.frameBleed(94, 9) : 0;
    if (hb) ring.style.setProperty("--fbleed", hb + "px");
    var greet = el("h1", { class: "k-home-greet" }, hpS === "critical" ? [] : [greeting() + " "]);
    /* Critical (7a·crit): the headline says what the right-hand block is for */
    if (hpS === "critical") {
      greet.appendChild(el("span", { class: "k-home-crit", text: "Critical mode." }));
      greet.appendChild(document.createTextNode(" Three wins bring you back."));
    } else if (stks.all) {
      greet.appendChild(el("span", { class: "k-home-streak", "data-ui": "home.streak", text: stks.all + "-day streak" }));
      greet.appendChild(document.createTextNode(", keep it going."));
    } else {
      greet.appendChild(document.createTextNode("Study today to start a streak."));
    }
    var heroTxt = el("div", { class: "k-home-hero-txt" }, [
      el("div", { class: "k-kicker", text: todayLine() + (hpS === "critical" ? " · " + greeting().replace(/\.$/, "") : "") }),
      greet,
      prof.status ? el("button", { type: "button", class: "k-home-quote", "data-ui": "home.status",
        title: "Edit your status",
        onclick: function () { KOS.governor.editProfileText(function (err, r) { if (!(r && r.cancelled)) KOS.rerender(); }); } },
        ["“" + prof.status + "”"]) : null,
      el("div", { class: "k-home-level" }, [
        el("b", { text: "Level " + li.level + " · " + prof.rank }),
        el("span", { class: "k-bar", role: "img", "aria-label": li.into + " of " + li.need + " XP to level " + (li.level + 1),
          style: "--p: " + Math.round(100 * li.into / li.need) + "%" }, [el("i")]),
        el("span", { class: "k-mono k-muted", text: (li.need - li.into) + " XP to " + (li.level + 1) }),
        el("span", { class: "k-muted k-home-dot", "aria-hidden": "true", text: "·" }),
        el("span", { class: "k-home-hp", "data-hp": hpS, text: "HP " + g.hp + " / 100 · " + hpInfo.label })
      ])
    ].filter(Boolean));

    /* the daily goal is today's directive list (KOS.todo); in Critical the
       same slot shows the recovery wins instead (invariant 2: nothing locks) */
    var goal = el("div", { class: "k-home-goal", "data-ui": "habit.panel" });
    if (hpS === "critical" && KOS.governor.recoveryTasks) {
      var tasks = KOS.governor.recoveryTasks();
      goal.appendChild(el("div", { class: "k-home-goal-head" }, [
        el("span", { class: "k-kicker", text: "Recovery" }),
        el("span", { class: "k-mono", text: tasks.filter(function (t) { return t.cur >= t.target; }).length + " / " + tasks.length })
      ]));
      tasks.forEach(function (t) {
        var done = t.cur >= t.target;
        goal.appendChild(el("button", { type: "button", class: "k-goal-item", "data-ui": "home.recovery-win", "aria-pressed": String(done),
          onclick: t.go }, [
          el("span", { class: "k-goal-mark", "aria-hidden": "true", text: done ? "✓" : "" }),
          el("span", { class: "k-goal-text", text: t.label + (t.target > 1 && t.cur && !done ? " · " + t.cur + "/" + t.target : "") })
        ]));
      });
      goal.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary",
        text: "Open Recovery →", onclick: function () { KOS.show("governor"); } }));
    } else if (homeThree().length) {
      /* roadmap 5.10 (frame 33t): Today's three from the Morning Review, in
         place of the daily goal, with the first one's Start */
      var picks = homeThree();
      goal.appendChild(el("div", { class: "k-home-goal-head" }, [
        el("span", { class: "k-kicker", text: "Today's three" }),
        el("span", { class: "k-mono", text: picks.filter(function (p) { return p.done; }).length + " / " + picks.length })
      ]));
      picks.forEach(function (p) {
        var tickable = ["reminder", "assignment", "plan"].indexOf(p.ref.kind) !== -1;
        var row = el("button", { type: "button", class: "k-goal-item", "data-ui": "habit.tick home.three", "aria-pressed": String(!!p.done),
          "aria-label": tickable ? (p.done ? "Reopen: " : "Done: ") + p.title : "Open " + p.title,
          onclick: function () { tickThree(p); } }, [
          el("span", { class: "k-goal-mark", "aria-hidden": "true", text: p.done ? "✓" : "" }),
          p.mark && !p.done ? spaceMark(p.mark, p.hue) : null,
          el("span", { class: "k-goal-text", text: p.title })
        ].filter(Boolean));
        if (p.done) KOS.ui.state(row, "done", true);
        goal.appendChild(row);
      });
      var firstOpen = picks.filter(function (p) { return !p.done; })[0];
      goal.appendChild(el("div", { class: "k-cluster k-home-goal-go" }, [
        /* a long title ends in … inside the card (it ran off the Home card's
           edge on the iPad); the whole title is its tooltip */
        el("button", { type: "button", class: "k-btn k-btn--primary k-fit-btn", "data-intent": "primary", "data-ui": "home.three-start",
          title: firstOpen ? "Start: " + firstOpen.title : null, onclick: function () {
            if (!firstOpen) { KOS.show("focus"); return; }
            /* a space's daily runs its own session: Start opens it */
            if (firstOpen.ref.kind === "space") { tickThree(firstOpen); return; }
            var ctx = { title: firstOpen.title, subject: firstOpen.subject, objective: firstOpen.action || "" };
            if (firstOpen.ref.kind === "assignment") ctx.assignmentId = firstOpen.ref.id;
            if (firstOpen.ref.kind === "topic") ctx.refs = [firstOpen.ref.id];
            if (KOS.routinePlayer) KOS.routinePlayer.preflight(ctx); else KOS.show("focus");
          } }, [el("span", { class: "k-ellipsis", text: firstOpen ? "▶ Start: " + firstOpen.title : "Start focus →" })]),
        el("button", { type: "button", class: "k-btn k-btn--quiet k-btn--sm", "data-ui": "home.three-edit", text: "Edit", onclick: function () { if (KOS.reviewSheet) KOS.reviewSheet.open("morning", { step: 3 }); } })
      ]));
    } else {
      var autos = (KOS.todo.autoItems() || []);
      var shown = autos.slice(0, 3);
      goal.appendChild(el("div", { class: "k-home-goal-head" }, [
        el("span", { class: "k-kicker", text: "Daily goal" }),
        autos.length ? el("span", { class: "k-mono", text: autos.filter(function (a) { return a.done; }).length + " / " + autos.length }) : null
      ].filter(Boolean)));
      if (!shown.length) goal.appendChild(el("p", { class: "k-home-goal-note", text: KOS.welcome && KOS.welcome.firstSteps() ? "Fills in once you have subjects." : "Nothing generated today — no due cards or near deadlines." }));
      /* HR-18 (decision B2): a directive is sealed by its evidence only and
         pays nothing; the row opens the work, it is not a tick */
      shown.forEach(function (a) {
        var on = !!a.done;
        var row = el("button", { type: "button", class: "k-goal-item", "data-ui": "habit.tick home.directive",
          "aria-label": (on ? "Done: " : "Open: ") + a.label,
          onclick: function () { if (a.go) a.go(); } }, [
          el("span", { class: "k-goal-mark", "aria-hidden": "true", text: on ? "✓" : "" }),
          el("span", { class: "k-goal-text", text: a.label })
        ]);
        if (on) KOS.ui.state(row, "done", true);
        goal.appendChild(row);
      });
      goal.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary",
        text: "Start focus →", onclick: function () { KOS.show("focus"); } }));
    }
    band.appendChild(el("div", { class: "k-home-hero-body" }, [ring, heroTxt, goal]));
    main.appendChild(band);

    /* ================= Routines · Reminders ================= */
    /* roadmap 5.10 (frame 33t): the routine due now with its progress and
       Start, the day's habits as one-tap ticks, and the next review. A pure
       read; every tick goes through KOS.routines (smoke56 render purity). */
    var routines = homeRoutines(today);
    var weekStart = (function () { var d = new Date(today + "T12:00:00"); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; })();
    var weekIsos = []; for (var wi = 0; wi < 7; wi++) { var wd = new Date(weekStart); wd.setDate(weekStart.getDate() + wi); weekIsos.push(isoOf(wd)); }
    /* Reminders: a read-only digest (Build 6.2) — management is its own page */
    var remOpen = ((store.state.reminders && store.state.reminders.items) || []).filter(function (r) { return !r.done; })
      .sort(function (a, b) { return (a.due || "9999") < (b.due || "9999") ? -1 : (a.due || "9999") > (b.due || "9999") ? 1 : 0; });
    var remLate = remOpen.filter(function (r) { return r.due && r.due < today; }).length;
    var reminders = el("section", { class: "k-card", "data-ui": "rem.sum", "aria-label": "Reminders" }, [
      cardHead("Reminders", remOpen.length ? Math.min(2, remOpen.length) + " of " + remOpen.length + (remLate ? " · " + remLate + " overdue" : "") : null,
        "All →", function () { KOS.show("reminders"); })
    ]);
    if (!remOpen.length) {
      reminders.appendChild(KOS.ui.emptyState({ compact: true, body: "Nothing on the list." }));
    } else {
      remOpen.slice(0, 2).forEach(function (r) {
        var when = !r.due ? "" : r.due === today ? "Today" : r.due === KOS.srs.addDays(today, 1) ? "Tomorrow" : r.due < today ? shortDay(r.due) : shortDay(r.due);
        var row = el("button", { type: "button", class: "k-check-row", "data-ui": "home.reminder-tick", "aria-pressed": "false",
          "aria-label": "Complete " + r.title,
          onclick: function () { if (KOS.reminderTick) KOS.reminderTick(r.id, true); else { KOS.reminders.complete(r.id, true); KOS.rerender(); } } }, [
          el("span", { class: "k-boxcheck", "aria-hidden": "true" }),
          el("span", { class: "k-check-row-text", text: r.title }),
          when ? el("span", { class: "k-check-row-meta k-mono", text: when + (r.dueTime ? " " + r.dueTime : "") }) : null
        ].filter(Boolean));
        if (r.due && r.due < today) KOS.ui.state(row, "late", true);
        else if (r.due === today) KOS.ui.state(row, "soon", true);
        reminders.appendChild(row);
      });
    }
    /* design turn 41c: after Start fresh, while the device holds nothing of
       yours, three first steps stand where Routines and Reminders go later */
    var fresh = !!(KOS.welcome && KOS.welcome.firstSteps());
    if (fresh) {
      var STEPS = [
        ["学", "var(--cs)", "Pick your subjects", "CS · Maths · IT · Code · Japanese · Mind · Creatives", "Open Study", function () { KOS.show("subject"); }],
        ["蒐", "var(--amber)", "Import your Collection", "AniList · VNDB · Steam", "Connect", function () { KOS.show("mediasync"); }],
        ["暦", "var(--teal)", "Connect a calendar", "Google Calendar · or add a lesson", "Connect", function () { KOS.show("connections"); }]
      ];
      main.appendChild(el("div", { class: "k-home-steps", "data-ui": "home.first-steps" }, STEPS.map(function (st, i) {
        return el("section", { class: "k-card k-home-step", "data-ui": "home.first-step", "aria-label": "Step " + (i + 1) + ": " + st[2] }, [
          el("span", { class: "k-tile", lang: "ja", "aria-hidden": "true", style: "--tile-c: " + st[1], text: st[0] }),
          el("div", { class: "k-home-step-t" }, [
            el("span", { class: "k-kicker", text: "Step " + (i + 1) }),
            el("b", { text: st[2] }),
            el("span", { class: "k-muted", text: st[3] })
          ]),
          el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "home.first-step-go", text: st[4], onclick: st[5] })
        ]);
      })));
    } else main.appendChild(el("div", { class: "k-home-pair-top" }, [routines, reminders]));

    /* ================= Up next · Today/Upcoming · Study hours · plan ================= */
    var mid = el("div", { class: "k-home-mid" });
    var next = nextAction();
    var running = !!next.live;
    var mode = running ? "focus" : (homeMode || (revAll ? "review" : "focus"));
    var upnext = el("section", { class: "k-card k-upnext", "data-ui": "home.next", "aria-label": "What to do next" });
    if (running) KOS.ui.state(upnext, "live", true);
    function paintUpNext() {
      upnext.innerHTML = "";
      var n = mode === "review" ? null : (running ? next : focusPlan());
      var sw = KOS.ui.tabs([
        { label: "Focus", active: mode === "focus", onSelect: function () { homeMode = mode = "focus"; paintUpNext(); } },
        { label: revAll ? "Review " + KOS.ui.num(revAll) : "Review", active: mode === "review", onSelect: function () { homeMode = mode = "review"; paintUpNext(); } }
      ], { variant: "workspace", label: "Up next" });
      upnext.appendChild(el("div", { class: "k-upnext-head" }, [
        el("span", { class: "k-kicker", "data-ui": "home.next-kicker", text: mode === "review" ? "Due today" : n.kicker }),
        running ? null : sw
      ].filter(Boolean)));
      var go, cta;
      if (mode === "review") {
        var oldest = dueCards.length ? dueCards[0].overdue : 0;
        upnext.appendChild(el("h2", { class: "k-upnext-title", "data-ui": "home.next-label",
          text: spaceRev.length ? "Review " + KOS.ui.num(revAll) + " due"
            : dueN ? "Review " + KOS.ui.num(dueN) + " due card" + (dueN === 1 ? "" : "s")
            : KOS.welcome && KOS.welcome.firstSteps() ? "Nothing to review yet" : "Nothing due to review" }));
        /* topic memory: the due topic you would recall least today */
        var weakest = null, seenTopic = {};
        dueCards.forEach(function (c) {
          var tk = c.sid + ":" + c.ref;
          if (seenTopic[tk] || !KOS.hub.BYREF[c.sid]) return;
          seenTopic[tk] = true;
          var tm = KOS.srs.topicMemory(c.sid, c.ref);
          if (tm.recall != null && tm.rated >= 3 && (!weakest || tm.recall < weakest.r)) weakest = { r: tm.recall, ref: c.ref, sid: c.sid };
        });
        var weakTxt = weakest && weakest.r < 0.85 ? " · " + weakest.ref + " " + ((KOS.hub.BYREF[weakest.sid][weakest.ref] || {}).title || "") + " is down to " + Math.round(100 * weakest.r) + "% recall" : "";
        upnext.appendChild(el("p", { class: "k-upnext-why", "data-ui": "home.next-why",
          text: revAll ? "About " + Math.max(1, Math.round(revAll * 0.5)) + " minute" + (revAll > 2 ? "s" : "") + (oldest ? " · oldest is " + oldest + " day" + (oldest === 1 ? "" : "s") + " overdue" : " · all due today") + weakTxt
            : KOS.welcome && KOS.welcome.firstSteps() ? "Cards arrive with your subjects." : "The queue is clear — nothing is scheduled for today." }));
        /* one row a queue, each opening its own review (40a): the flashcards
           (Due today), then each space's; a row says its count, not a bar */
        var rows = [];
        if (dueN) {
          var refsSeen = {}, names = [];
          dueCards.forEach(function (c) {
            var sid = String(c.key).split(":")[0], r = String(c.key).split(":")[1];
            if (names.length >= 2 || refsSeen[sid + ":" + r] || !BYREF[sid]) return;
            refsSeen[sid + ":" + r] = true;
            names.push(BYREF[sid][r] ? r + " " + BYREF[sid][r].title : r);
          });
          rows.push({ mark: "学", hue: "var(--crimson)", label: "Flashcards", sub: names.join(", "), n: dueN, go: function () { KOS.show("due"); }, sid: "cards" });
        }
        spaceRev.forEach(function (s) { rows.push({ mark: s.mark, hue: s.hue, label: s.review.label, sub: s.review.sub, n: s.review.n, go: s.review.go, sid: s.sid }); });
        if (rows.length) {
          var list = el("div", { class: "k-home-revlist", "data-ui": "home.review-split" });
          rows.forEach(function (r) {
            list.appendChild(el("button", { type: "button", class: "k-home-rev", "data-ui": "home.review-row", "data-sid": r.sid,
              "aria-label": r.label + ": " + r.n + " due" + (r.sub ? " · " + r.sub : ""), onclick: r.go }, [
              spaceMark(r.mark, r.hue),
              el("span", { class: "k-home-rev-t" }, [el("b", { text: r.label }), r.sub ? el("span", { class: "k-home-rev-sub", text: r.sub }) : null].filter(Boolean)),
              el("span", { class: "k-home-rev-n k-mono", text: KOS.ui.num(r.n) }),
              el("span", { class: "k-home-rev-go", "aria-hidden": "true", text: "›" })
            ]));
          });
          upnext.appendChild(list);
        }
        var firstRow = rows[0];
        cta = firstRow && rows.length > 1 ? "Start with " + (firstRow.sid === "cards" ? "flashcards" : firstRow.label) + " →" : "Start reviewing →";
        go = firstRow ? firstRow.go : function () { KOS.show("due"); };
      } else {
        upnext.appendChild(el("h2", { class: "k-upnext-title", "data-ui": "home.next-label" }, [
          n.mark ? spaceMark(n.mark, n.hue) : null,
          running || !n.go ? n.label : el("button", { type: "button", class: "k-upnext-open", "data-ui": "home.next-open",
            title: (n.cta || "Open").replace(/[→◉]/g, "").trim(), onclick: n.go }, [n.label])
        ].filter(Boolean)));
        /* Critical: a finished focus session of 25+ minutes is one of the
           three recovery wins, so the card says so (7a·crit) */
        var winPending = hpS === "critical" && !running && KOS.governor.recoveryTasks && KOS.governor.recoveryTasks()[0].cur < 1;
        var why = [n.why, winPending ? "counts as a recovery win" : null].filter(Boolean).join(" · ");
        if (why) upnext.appendChild(el("p", { class: "k-upnext-why", "data-ui": "home.next-why", text: why }));
        if (!running) {
          /* a calendar block's own length is a fact of the block; any other
             length is chosen on the Focus page, which owns the set-up */
          if (n.fixed) upnext.appendChild(cardRow("Session", minsText(n.mins) + " · the block"));
          if (n.goal) upnext.appendChild(cardRow(n.goal.k, n.goal.v, n.goal.bar == null ? null : n.goal.bar));
          /* the other spaces' dailies still open today, after this one (40a) */
          if (n.then && n.then.length) upnext.appendChild(el("div", { class: "k-card-row", "data-ui": "home.next-then" }, [
            el("span", { class: "k-kv-k", text: "Then" }),
            el("span", { class: "k-kv-v k-home-then" }, n.then.map(function (t) {
              return el("span", { class: "k-home-then-i", "data-sid": t.sid }, [spaceMark(t.mark, t.hue), el("span", { text: t.text })]);
            }))
          ]));
        }
        /* the Focus side starts the session it just configured; the
           recommendation stays one press away on its title (review A: the
           button used to hand off to Pacing instead of starting anything) */
        if (running || n.own) { cta = n.cta; go = n.go; }
        else {
          cta = "Set up focus →";
          /* the Focus page owns a session's set-up (14 November 2026): this
             opens it filled in with the recommendation, and starts nothing */
          go = function () {
            var pre = { objective: n.label || "" };
            if (n.subject) pre.subject = n.subject;
            var refs = (n.refs && n.refs.length ? n.refs : n.subject && n.ref ? [n.subject + ":" + n.ref] : []);
            /* a Focus session links ONE subject (invariant 4a) */
            if (n.subject) refs = refs.filter(function (k) { return k.indexOf(n.subject + ":") === 0; });
            if (refs.length) pre.refs = refs;
            if (n.assignmentId != null) pre.assignmentId = n.assignmentId;
            /* HR-29: the exam by id */
            if (n.kind === "exam" && n.eventId != null) pre.eventId = n.eventId;
            if (n.fixed && n.mins > 0) pre.mins = n.mins;
            KOS.show("focus", pre);
          };
        }
      }
      var foot = el("div", { class: "k-upnext-foot" });
      foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "home.next-go",
        "data-intent": "primary", text: cta, onclick: go }));
      upnext.appendChild(foot);
    }
    paintUpNext();
    mid.appendChild(upnext);

    /* Today and Upcoming — one row; a pair with nothing in it collapses to
       one quiet line, and a lone populated card takes the full width */
    var todayItems = [];
    /* a timed event leaves the card once it is over: its end time, else its
       start plus its length, else its start (all-day events stay the day) */
    var nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    (KOS.calendar.eventsOn ? KOS.calendar.eventsOn(today) : []).filter(function (e) {
      if (!e.time) return true;
      var end = e.endTime ? hmMins(e.endTime) : hmMins(e.time) + (e.durationMins || 0);
      if (e.endTime && end < hmMins(e.time)) return true;   /* runs past midnight */
      return end > nowMin;
    }).forEach(function (e) {
      todayItems.push({ title: e.title, sub: (e.type ? e.type.charAt(0).toUpperCase() + e.type.slice(1) : "") + (e.subject ? " · " + SUBJ_SHORT[e.subject] : "") + (e.ref ? " · " + e.ref : ""),
        hue: SUBJ_HUE[e.subject] || "var(--muted)", when: e.time ? (e.time >= "18:00" ? "Tonight" : e.time) : "Today",
        now: e.type === "exam" || e.type === "deadline", go: function () { KOS.show("calendar"); } });
    });
    (KOS.assignments && KOS.assignments.forDate ? KOS.assignments.forDate(today) : []).forEach(function (a) {
      var as = a.assignment || a;
      todayItems.push({ title: as.title, sub: "Assignment" + (as.subject ? " · " + SUBJ_SHORT[as.subject] : ""),
        hue: SUBJ_HUE[as.subject] || "var(--muted)", when: as.dueTime || "Today", now: true,
        go: function () { openAssignment(as.id); } });
    });
    /* the class lessons on today's timetable, one row each — the plan's
       lessons dated by the class timetable (KOS.pacing.lessonPlan). Only
       the Today card lists single lessons; Upcoming keeps the milestones. */
    /* one row per class row: its title leads (the scheme of work's lesson
       text is the detail beneath), and a ticked day reads "Done", never
       "Sat", which read as Saturday (review) */
    var byRow = [];
    (KOS.pacing && KOS.pacing.lessonsOn ? KOS.pacing.lessonsOn(today) : []).forEach(function (x) {
      var g = byRow.filter(function (r) { return r.entry === x.entry; })[0];
      if (!g) byRow.push(g = { entry: x.entry, lessons: [], done: true, flag: false });
      if (!x.lesson.whole && x.lesson.text !== x.entry.title) g.lessons.push(x.lesson.text);
      if (!x.sat) g.done = false;
      if (x.lesson.tone !== "lesson") g.flag = true;
    });
    byRow.forEach(function (g) {
      var e = g.entry;
      todayItems.push({ title: e.title, sub: ["In class", SUBJ_SHORT[e.subject]].concat(g.lessons.length ? [g.lessons.join("; ")] : []).join(" · "),
        hue: SUBJ_HUE[e.subject] || "var(--muted)", when: g.done ? "Done" : "In class", now: !g.done && g.flag,
        done: g.done, ui: "home.lesson", go: function () { KOS.show("pacing", { wb: e.wb }); } });
    });
    /* an assignment row opens the one Assignment dialog in place, as the
       tracker's own rows do; closing it redraws Home */
    function openAssignment(id) {
      if (KOS.assignmentDetail) KOS.assignmentDetail(id, function () { KOS.show("home", undefined, { _nav: true }); });
      else KOS.show("assignments");
    }
    var counts = KOS.calendar.countdowns ? KOS.calendar.countdowns(null, 5) : [];
    var urgent = (KOS.assignments && KOS.assignments.urgent ? KOS.assignments.urgent() : []).filter(function (a) { return KOS.assignments.isOverdue(a); });
    /* 27m: Goals are the Upcoming card's second view (Upcoming | Goals, like
       the Focus card's Focus | Review), per device in state.ui.homeUpcoming */
    var liveGoals = KOS.goals ? KOS.goals.all().filter(function (g) { return !g.archived && g.status === "active"; }) : [];
    var upMode = liveGoals.length && KOS.store.state.ui.homeUpcoming === "goals" ? "goals" : "upcoming";
    /* Money's one row in Upcoming (40a, HR-04): its notice, else its next
       bill, then left this month; masked by Hide amounts (invariant 53a) */
    var moneyNote = null, mDay = null;
    if (KOS.money && KOS.today && !(KOS.notify && KOS.notify.isMuted && KOS.notify.isMuted("money"))) {
      mDay = KOS.today.money(today);
      moneyNote = mDay && (mDay.notices[0] || (mDay.next && { title: mDay.next.name + " · " + shortDay(mDay.next.date) + " · " + KOS.money.formatShown(mDay.next.minor), view: "money", arg: "recurring", line: true })) || null;
    }
    var hasToday = todayItems.length > 0, hasUp = counts.length > 0 || urgent.length > 0 || liveGoals.length > 0 || !!moneyNote;
    /* the Today card is always there (review B), saying so when the day is
       empty; Upcoming joins it only with something in it, and the Today
       card then takes the row */
    var pair = el("div", { class: "k-home-pair", "data-ui": "home.today" });
    if (!hasUp) KOS.ui.state(pair, "one-up", true);
    var tcard = el("section", { class: "k-card", "data-ui": "home.today-card", "aria-label": "Today" }, [
      cardHead("Today", null, "Calendar →", function () { KOS.show("calendar"); })
    ]);
    if (!hasToday) {
      tcard.appendChild(KOS.ui.emptyState({ compact: true, mark: "澄", title: "Nothing on today",
        body: hasUp ? "No lessons, events or assignments due today." : "No lessons or events today, no countdowns, no assignments due. Add a deadline or start a session." }));
    }
    todayItems.slice(0, 3).forEach(function (t) {
      tcard.appendChild(el("button", { type: "button", class: "k-day-row", "data-ui": t.ui || null, "data-state": t.done ? "done" : null, onclick: t.go }, [
        el("span", { class: "k-day-bar", style: "--row-c: " + t.hue, "aria-hidden": "true" }),
        el("span", { class: "k-day-txt" }, [
          el("span", { class: "k-day-title", text: t.title }),
          t.sub ? el("span", { class: "k-day-sub", text: t.sub }) : null
        ].filter(Boolean)),
        el("span", { class: "k-day-when", "data-state": t.now ? "now" : null, text: t.when })
      ]));
    });
    pair.appendChild(tcard);
    function upSwitch() {
      if (!liveGoals.length) return null;
      var sw = KOS.ui.tabs([["upcoming", "Upcoming"], ["goals", "Goals"]].map(function (x) {
        return { label: x[1], active: upMode === x[0], onSelect: function () {
          if (upMode === x[0]) return;
          KOS.store.state.ui.homeUpcoming = x[0]; KOS.store.save();
          if (KOS.a11y) KOS.a11y.announce(x[0] === "goals" ? "Goals" : "Upcoming");
          KOS.rerender();
        } };
      }), { variant: "workspace", label: "Upcoming or goals", className: "k-seg--quiet k-home-upswitch" });
      return sw;
    }
    if (hasUp && upMode === "goals") {
      var gcard = el("section", { class: "k-card k-home-goals", "data-ui": "home.goals", "aria-label": "Goals" }, [
        el("div", { class: "k-card-head" }, [el("h2", { class: "k-card-title", text: "Goals" }), el("span", { class: "k-card-meta", "data-ui": "home.goals-meta" }), upSwitch()])]);
      var gl = el("div", { class: "k-home-goal-list" });
      gcard.appendChild(gl);
      gcard.appendChild(el("button", { type: "button", class: "k-link k-home-goals-all", "data-ui": "home.goals-all", text: "All goals →", onclick: function () { KOS.show("goals"); } }));
      KOS.goals.compute(function (err, rows) {
        var open = (rows || []).filter(function (g) { return !g.archived && (g._status === "active") && !g._displayOnly; });
        open.sort(function (a, b) { var ra = (a._pace === "behind" || a._pace === "over") ? 0 : 1, rb = (b._pace === "behind" || b._pace === "over") ? 0 : 1;
          var ea = a._period ? a._period.to : a.deadline || "9999-99-99", eb = b._period ? b._period.to : b.deadline || "9999-99-99";
          return ra - rb || (ea < eb ? -1 : ea > eb ? 1 : 0); });
        var behind = open.filter(function (g) { return g._pace === "behind" || g._pace === "over"; }).length;
        var meta = gcard.querySelector('[data-ui~="home.goals-meta"]');
        if (meta) meta.textContent = behind ? behind + " behind" : open.length ? "nothing behind" : "";
        if (!open.length) { gl.appendChild(KOS.ui.emptyState({ compact: true, mark: "標", title: "Nothing needs you this week" })); return; }
        open.slice(0, 3).forEach(function (g) {
          var end = g._period ? g._period.to : g.deadline;
          var left = end ? Math.max(0, Math.round((new Date(end + "T12:00:00") - new Date(today + "T12:00:00")) / 86400000)) : null;
          var ring = el("span", { class: "k-home-goalnum", "data-ui": "home.goal-num", "aria-hidden": "true" }, [el("span", { text: left == null ? "–" : String(left) })]);
          ring.style.setProperty("--p", Math.min(100, g._pct || 0) + "%");
          var chipKind = KOS.goalsUI ? KOS.goalsUI.paceKind(g) : g._pace;
          var w = KOS.goalsUI ? KOS.goalsUI.word : function (x, v) { return String(v); };
          gl.appendChild(el("button", { type: "button", class: "k-day-row", "data-ui": "home.goal-row", onclick: function () { KOS.show("goals", { id: g.id }); } }, [
            ring,
            el("span", { class: "k-day-txt" }, [el("span", { class: "k-day-title", text: g.title }),
              el("span", { class: "k-home-goal-sub" }, [chipKind ? KOS.ui.paceChip(chipKind) : null,
                el("span", { class: "k-day-sub", text: w(g, g._current) + " of " + w(g, g._target) + (left === 0 ? " · ends tonight" : end ? " · by " + end.slice(8, 10).replace(/^0/, "") + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][+end.slice(5, 7) - 1] : "") })].filter(Boolean))])]));
        });
      }, { archived: false });
      pair.appendChild(gcard);
    }
    if (hasUp && upMode === "upcoming") {
      var ucard = el("section", { class: "k-card", "data-ui": "cal.countdowns", "aria-label": "Upcoming" }, [
        liveGoals.length
          ? el("div", { class: "k-card-head" }, [el("h2", { class: "k-card-title", text: "Upcoming" }), el("span", { class: "k-card-meta", text: urgent.length ? urgent.length + " overdue" : "nothing overdue" }), upSwitch()])
          : cardHead("Upcoming", urgent.length ? urgent.length + " overdue" : "nothing overdue", "Tracker →", function () { KOS.show("assignments"); })
      ]);
      if (urgent.length) KOS.ui.state(ucard, "overdue", true);
      urgent.slice(0, 2).forEach(function (a) {
        var late = -KOS.assignments.daysLeft(a);
        ucard.appendChild(el("button", { type: "button", class: "k-day-row", "data-ui": "asg.urgent cal.countdown-item",
          onclick: function () { openAssignment(a.id); } }, [
          el("span", { class: "k-days-dot", "data-state": "late", text: String(late) }),
          el("span", { class: "k-day-txt" }, [
            el("span", { class: "k-day-title", text: a.title }),
            el("span", { class: "k-day-sub", text: late + " day" + (late === 1 ? "" : "s") + " overdue" + (a.subject ? " · " + a.subject : "") })
          ])
        ]));
      });
      counts.slice(0, Math.max(0, 3 - Math.min(2, urgent.length))).forEach(function (c) {
        ucard.appendChild(el("button", { type: "button", class: "k-day-row", "data-ui": "cal.countdown-item" + (c.kind === "assignment" ? " asg.urgent" : ""),
          onclick: function () { KOS.calendar.openCountdown(c, function () { KOS.show("home", undefined, { _nav: true }); }); } }, [
          el("span", { class: "k-days-dot", "data-state": c.days === 0 ? "now" : null, text: String(c.days) }),
          el("span", { class: "k-day-txt" }, [
            el("span", { class: "k-day-title", text: c.title }),
            el("span", { class: "k-day-sub", text: (c.days === 0 ? "today" : "in " + c.days + " day" + (c.days === 1 ? "" : "s")) + " · " + c.meta })
          ])
        ]));
      });
      var mSub = el("span", { class: "k-day-sub", "data-ui": "home.money-sub", text: moneyNote && moneyNote.line ? "Money · next bill" : "Money" });
      if (moneyNote) KOS.today.moneyMonth(today, function (m) {
        if (m && m.left != null) mSub.textContent += " · " + KOS.money.formatShown(m.left) + " left this month";
      });
      if (moneyNote) ucard.appendChild(el("button", { type: "button", class: "k-day-row", "data-ui": moneyNote.line ? "home.money-line" : "home.money-note",
        onclick: function () { KOS.show(moneyNote.view || "money", moneyNote.arg); } }, [
        spaceMark("円", "var(--amber)"),
        el("span", { class: "k-day-txt" }, [
          el("span", { class: "k-day-title", text: moneyNote.title }),
          mSub
        ]),
        el("span", { class: "k-home-rev-go", "aria-hidden": "true", text: "›" })
      ]));
      /* with the Goals switch in the head, the way to the tracker moves to
         the foot, as "All goals →" does on the other side */
      if (liveGoals.length) ucard.appendChild(el("button", { type: "button", class: "k-link k-home-goals-all", text: "Tracker →", onclick: function () { KOS.show("assignments"); } }));
      pair.appendChild(ucard);
    }
    mid.appendChild(pair);

    /* Study hours — this week, Monday to Sunday */
    var days = weekIsos.map(function (iso) { return { iso: iso, h: subjectHoursOn(iso) }; });
    var weekH = days.reduce(function (a, d) { return a + d.h; }, 0);
    /* the comparison is like for like: this week so far against the SAME
       days of last week (Monday to today's weekday). Against the whole of
       last week, a Thursday always read as a loss — and the bare figure
       never said what it was compared with. */
    var lastWeekH = 0, daysIn = weekIsos.filter(function (iso) { return iso <= today; }).length;
    for (var lw = 0; lw < daysIn; lw++) { var ld = new Date(weekStart); ld.setDate(weekStart.getDate() - 7 + lw); lastWeekH += subjectHoursOn(isoOf(ld)); }
    var weekSess = KOS.sessions.all().filter(function (s) { return subjectSecs(s) > 0 && weekIsos.indexOf(s.date) !== -1; }).length;   /* Focus sessions on a subject, as the hours (HR-05) */
    var goalH = dailyGoalMins() / 60, goalT = fmtH(goalH) + "h";
    var peak = Math.max(goalH, days.reduce(function (a, d) { return Math.max(a, d.h); }, 0));
    /* every bar and the goal line are measured in ONE track per column
       (a bar is h% of it, the goal 2/peak of it), and the goal's label has
       its own column at the end, clear of the bars (after release: the
       label sat on Sunday's bar and the line missed the bars' scale) */
    var goalPct = Math.round(100 * goalH / peak);
    var chart = el("div", { class: "k-hours-chart", "data-ui": "home.week", role: "img",
      "aria-label": "Study hours this week: " + days.filter(function (d) { return d.iso <= today; }).map(function (d) { return shortDay(d.iso) + " " + fmtH(d.h) + "h"; }).join(", ") + ". Goal " + fmtH(goalH) + " hour" + (goalH === 1 ? "" : "s") + " a day." },
      days.map(function (d, i) {
        var future = d.iso > today, isToday = d.iso === today;
        var pct = Math.round(100 * d.h / peak);
        var track = el("div", { class: "k-hours-track" }, [
          el("div", { class: "k-hours-bar", style: future ? null : "--h: " + pct + "%" }),
          future || !d.h ? null : el("span", { class: "k-hours-v", style: "--h: " + pct + "%", text: fmtH(d.h) }),
          el("span", { class: "k-hours-goal", style: "--goal-y: " + goalPct + "%", "aria-hidden": "true" })
        ].filter(Boolean));
        return el("div", { class: "k-hours-day", "data-ui": "home.week-day", title: d.iso, "data-state": future ? "future" : isToday ? "today" : null }, [
          track,
          el("span", { class: "k-hours-l", text: "MTWTFSS".charAt(i) })
        ]);
      }).concat([
        el("div", { class: "k-hours-day k-hours-goalcol", "aria-hidden": "true" }, [
          el("div", { class: "k-hours-track" }, [el("span", { class: "k-hours-goal-l", style: "--goal-y: " + goalPct + "%", text: "goal " + goalT })]),
          el("span", { class: "k-hours-l", text: "\u00a0" })
        ])
      ]));
    /* HR-23: every subject and study space, from the sessions the total counts */
    var bySubj = {}, splitKeys = SUBJECTS.slice();
    splitKeys.forEach(function (k) { bySubj[k] = 0; });
    KOS.sessions.all().forEach(function (s) {
      if (!subjectSecs(s) || weekIsos.indexOf(s.date) === -1) return;
      KOS.sessions.parts(s).forEach(function (p) { if (p.subject && bySubj[p.subject] != null) bySubj[p.subject] += p.secs / 3600; });
    });
    var splitHue = function (k) { return SUBJ_HUE[k]; };
    var splitName = function (k) { return SUBJ_SHORT[k]; };
    var learnt = 0;
    Object.keys(store.state.srs || {}).forEach(function (k) { var m = store.state.srs[k]; if (m && m.reps > 0) learnt++; });
    var delta = weekH - lastWeekH;
    function fact(v, label, cap, onclick) {
      return el(onclick ? "button" : "div", { class: "k-hours-fact", "data-ui": "home.fact", type: onclick ? "button" : null,
        "aria-label": onclick ? v + " " + cap.split(" · ")[0].toLowerCase() + " " + label : null, onclick: onclick || null }, [
        el("span", { class: "k-hours-fact-top" }, [
          el("span", { class: "k-hours-fact-v", "data-ui": "part.value", text: v }),
          el("span", { class: "k-hours-fact-u", "data-ui": "part.label", text: label })
        ]),
        el("span", { class: "k-hours-fact-c", "data-ui": "part.caption", text: cap })
      ]);
    }
    var hours = el("section", { class: "k-card k-hours", "aria-label": "Study hours" }, [
      cardHead("Study hours", null, "Weekly reports ›", function () { KOS.show("reports"); }),
      el("div", { class: "k-hours-big" }, [
        el("span", { class: "k-hours-n", text: fmtH(weekH) }),
        el("span", { class: "k-hours-u", text: "hours" + (weekSess ? " · " + weekSess + " session" + (weekSess === 1 ? "" : "s") : " · no sessions yet") }),
        lastWeekH || weekH ? el("span", { class: "k-hours-d", "data-ui": "home.week-delta", "data-state": delta < 0 ? "down" : null,
          title: fmtH(lastWeekH) + "h by this point last week",
          text: (delta >= 0 ? "+" : "−") + fmtH(Math.abs(delta)) + "h vs last week" }) : null
      ].filter(Boolean)),
      chart,
      el("div", { class: "k-hours-facts", "data-ui": "home.facts", "aria-label": "This week" }, [
        fact(String(stks.all), stks.all === 1 ? "day" : "days", stks.best ? "Streak · best " + stks.best : "Streak · study today to start one", null),
        fact(KOS.ui.num(dueN), "due", "Cards · " + KOS.ui.num(learnt) + " learnt", function () { KOS.show("due"); })
      ]),
      weekH ? el("div", {}, [
        el("div", { class: "k-split-bar", "aria-hidden": "true" }, splitKeys.filter(function (sid) { return bySubj[sid] > 0; }).map(function (sid) {
          return el("span", { style: "--f: " + bySubj[sid].toFixed(2) + "; --c: " + splitHue(sid) });
        })),
        el("div", { class: "k-split-legend", "data-ui": "home.split-legend" }, splitKeys.filter(function (sid) { return bySubj[sid] > 0; }).map(function (sid) {
          return el("span", { style: "--c: " + splitHue(sid), "data-sid": sid }, [el("b", { text: splitName(sid) }), fmtH(bySubj[sid]) + "h"]);
        }))
      ]) : null
    ].filter(Boolean));
    mid.appendChild(hours);
    /* the latest report (24h) sits between Study hours and the plan, in
       the column under Today; with none saved yet the plan takes it */
    if (KOS.reportsHomeCard) mid.appendChild(KOS.reportsHomeCard());

    /* the week's plan, tickable in place (invariant 82b) */
    var planCard = KOS.pacingHomeCard ? KOS.pacingHomeCard() : null;
    if (planCard) mid.appendChild(planCard);
    main.appendChild(mid);

    /* ================= Continue: the four desks ================= */
    var cont = el("section", { "aria-labelledby": "k-home-continue" }, [
      el("div", { class: "k-continue-head" }, [
        el("h2", { id: "k-home-continue", text: "Continue" }),
        el("button", { type: "button", class: "k-link", text: "Study →", onclick: function () { KOS.show("subject", store.state.ui.subject || "compsci"); } })
      ])
    ]);
    var desks = el("div", { class: "k-desks" });
    /* HR-01: the desks you are working at come first. In the fixed subject
       order, with Code and Japanese started, Mind and Creatives were the 6th
       and 7th columns of a row showing four, scrolled out of sight with no
       sign they were there. Most recently studied first (any session or
       stretch in that subject), the rest in the usual order after. */
    var lastAt = {};
    KOS.sessions.all().forEach(function (e) {
      if (!e || e.type === "media" || e.type === "correction" || e.type === "todo") return;
      var subs = [e.subject];
      if (KOS.sessions.parts) KOS.sessions.parts(e).forEach(function (p) { subs.push(p.subject); });
      subs.forEach(function (s) { if (s && (!lastAt[s] || e.ts > lastAt[s])) lastAt[s] = e.ts; });
    });
    /* Code joins Home's desks once it has been started (roadmap 5.3) */
    SUBJECTS.filter(function (sid) {
      if (sid === "ja") return !!(KOS.ja && KOS.ja.started());
      if (sid === "creatives") return !!(KOS.creatives && KOS.creatives.started());
      if (sid === "mind") return !!(KOS.mind && KOS.mind.started());
      return sid !== "code" || (KOS.code && !KOS.code.firstVisit());
    }).sort(function (a, b) {
      return (lastAt[b] || 0) - (lastAt[a] || 0) || SUBJECTS.indexOf(a) - SUBJECTS.indexOf(b);
    }).forEach(function (sid) {
      var d = KOS_DATA[sid], st = subjectStats(sid);
      var last = store.state.ui.lastRef[sid];
      var lastLeaf = last && BYREF[sid][last] ? BYREF[sid][last] : null;
      var weak = (KOS.rag.worst(sid, 1) || [])[0];
      var target = lastLeaf ? { ref: last, title: lastLeaf.title } : (LEAVES[sid][0] ? { ref: LEAVES[sid][0].ref, title: LEAVES[sid][0].title } : null);
      desks.appendChild(el("article", { class: "k-desk", "data-ui": "home.desk", "data-sid": sid, style: "--desk-c: " + SUBJ_HUE[sid] }, [
        el("div", { class: "k-desk-top", "data-ui": "study.subject-card-top" }, [
          el("div", { class: "k-desk-name" }, [
            el("h3", {}, [el("button", { type: "button", class: "k-desk-open", "data-ui": "home.desk-open", text: d.name,
              onclick: function () { KOS.show("subject", sid); } })]),
            el("div", { class: "k-desk-board" }, [
              el("span", { class: "k-desk-meta", text: d.board }),
              stks[sid] ? el("span", { class: "k-chip", "data-ui": "home.streak", title: stks[sid] + "-day study streak in this subject", text: "炎 " + stks[sid] }) : null
            ].filter(Boolean))
          ]),
          el("span", { class: "k-desk-ring", "data-ui": "home.ring", role: "img", "aria-label": st.pct + "% complete", style: "--p: " + st.pct + "%" },
            [el("span", { text: st.pct + "%" })])
        ]),
        el("div", { class: "k-bar", "data-ui": "media.bar", title: st.done + " of " + st.total + " spec points completed",
          style: "--p: " + Math.max(st.pct, st.done ? 1 : 0) + "%" }, [el("i", { "data-ui": "media.bar-fill" })]),
        el("div", { class: "k-desk-row" }, [el("span", { class: "k-desk-row-k", text: LESSONISH[sid] ? "Lessons" : "Topics" }), el("span", { class: "k-desk-row-v", text: st.done + " / " + st.total })]),
        el("div", { class: "k-desk-row" }, [el("span", { class: "k-desk-row-k", text: "Weakest" }),
          weak ? el("button", { type: "button", class: "k-desk-row-v", "data-ui": "rag.item", text: weak.ref + " " + weak.title,
            onclick: function () { KOS.show("ref", { subject: sid, ref: weak.ref }); } })
            : el("span", { class: "k-desk-row-v k-muted", text: "Nothing flagged" })]),
        target ? el("div", { class: "k-desk-foot" }, [
          el("div", { class: "k-desk-foot-txt" }, [
            el("div", { class: "k-desk-foot-k", text: lastLeaf ? "Continue" : "Start" }),
            el("div", { class: "k-desk-foot-v", text: target.ref + " " + target.title })
          ]),
          el("button", { type: "button", class: "k-desk-go", "aria-label": (lastLeaf ? "Continue " : "Start ") + target.ref + " " + target.title,
            text: "→", onclick: function () { KOS.show("ref", { subject: sid, ref: target.ref }); } })
        ]) : null
      ].filter(Boolean)));
    });

    /* the Collection desk: the same component. Its figures come from a
       FULL-TABLE scan (mediadb.stats), so it fills in once the card is on
       screen rather than on Home's render pass (invariant 8) */
    var medMeta = el("span", { class: "k-desk-meta", "data-ui": "part.meta", text: "Anime · books · visual novels · games" });
    var medRing = el("span", { class: "k-desk-ring", "data-ui": "home.ring", role: "img", "aria-label": "Library completion", style: "--p: 0%" }, [el("span", { text: "—" })]);
    var medBar = el("div", { class: "k-bar", "data-ui": "media.bar", style: "--p: 0%" }, [el("i", { "data-ui": "media.bar-fill" })]);
    var medRows = el("div", {});
    var medFoot = el("div", {});
    var medCard = el("article", { class: "k-desk", "data-ui": "home.desk home.collection-desk", style: "--desk-c: var(--collection-hue)" }, [
      el("div", { class: "k-desk-top", "data-ui": "study.subject-card-top" }, [
        el("div", { class: "k-desk-name" }, [
          el("h3", {}, [el("button", { type: "button", class: "k-desk-open", "data-ui": "home.desk-open", "aria-label": "Collection",
            onclick: function () { KOS.show("matrix"); } }, [el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "蒐" }), "Collection"])]),
          el("div", { class: "k-desk-board" }, [
            medMeta,
            stks.rest ? el("span", { class: "k-chip", "data-ui": "home.streak", title: stks.rest + "-day rest streak", text: "休 " + stks.rest }) : null
          ].filter(Boolean))
        ]),
        medRing
      ]),
      medBar, medRows, medFoot
    ]);
    /* the airing episodes the notification centre already remembers
       (invariant 96) — memory of the schedule, never written to the vault */
    var airing = Object.keys((store.state.notify && store.state.notify.airing) || {}).map(function (k) { return store.state.notify.airing[k]; })
      .filter(function (a) { return a && a.at * 1000 > Date.now(); }).sort(function (a, b) { return a.at - b.at; }).slice(0, 2);
    airing.forEach(function (a) {
      medRows.appendChild(el("div", { class: "k-desk-row" }, [
        el("span", { class: "k-desk-cover", "aria-hidden": "true" }, [a.cover ? el("img", { src: a.cover, alt: "", loading: "lazy" }) : null].filter(Boolean)),
        el("span", { class: "k-desk-row-v k-desk-row-v--start", text: a.title + " · Ep " + a.ep }),
        el("span", { class: "k-desk-when", text: DOW[new Date(a.at * 1000).getDay()] + " " + hm(a.at * 1000) })
      ]));
    });
    desks.appendChild(medCard);
    /* a declared scroller (invariant 50): four across on a desk, a swipe
       row of cards on a phone (15b) — declared on the row itself, which
       keeps Home inside its wrapper-depth budget (smoke55) */
    desks.setAttribute("data-scroller", "true");
    desks.setAttribute("role", "group");
    desks.setAttribute("aria-label", "Continue");
    cont.appendChild(desks);
    main.appendChild(cont);

    /* HR-30: the last figures this page load read are drawn at once (a
       redraw no longer shrinks the page while the scan runs, which moved a
       reader at the bottom up 43px); the fresh scan then replaces them */
    function fillCollectionCard() {
      if (!KOS.mediadb || !KOS.mediadb.stats) return;
      KOS.mediadb.stats(function (err, agg) {
        if (err || !agg || !medCard.isConnected) return;
        lastCollAgg = agg;
        applyColl(agg);
      });
    }
    if (lastCollAgg) applyColl(lastCollAgg);
    function applyColl(agg) {
        [].slice.call(medRows.querySelectorAll("[data-ui~='home.coll-stat']")).forEach(function (n) { n.remove(); });
        medFoot.innerHTML = "";
        var done = 0, going = 0;
        Object.keys(agg.modules).forEach(function (m) {
          done += agg.modules[m].completed || 0;
          going += agg.modules[m].inProgress || 0;
        });
        var pctDone = agg.total ? Math.round(100 * done / agg.total) : 0;
        medMeta.textContent = KOS.ui.num(done) + " / " + KOS.ui.num(agg.total);
        medRing.style.setProperty("--p", pctDone + "%");
        medRing.firstChild.textContent = pctDone + "%";
        medRing.setAttribute("aria-label", pctDone + "% of the library completed");
        medBar.style.setProperty("--p", pctDone + "%");
        var best = null;
        Object.keys(agg.modules).forEach(function (m) {
          if (!best || agg.modules[m].inProgress > agg.modules[best].inProgress) best = m;
        });
        if (!airing.length) {
          ["anime", "books"].forEach(function (m) {
            if (!agg.modules[m]) return;
            medRows.appendChild(el("div", { class: "k-desk-row", "data-ui": "home.coll-stat" }, [
              el("span", { class: "k-desk-row-k", text: m === "anime" ? "Anime" : "Books" }),
              el("span", { class: "k-desk-row-v", text: (agg.modules[m].inProgress || 0) + " in progress" })
            ]));
          });
        }
        if (best && agg.modules[best].inProgress) {
          var NAMES = { anime: "Anime", books: "Books", vn: "Visual Novels", game: "Games" };
          var VERB = { anime: "watching", books: "reading", vn: "reading", game: "playing" };
          medFoot.appendChild(el("div", { class: "k-desk-foot" }, [
            el("div", { class: "k-desk-foot-txt" }, [
              el("div", { class: "k-desk-foot-k", text: "Continue " + VERB[best] }),
              el("div", { class: "k-desk-foot-v", text: NAMES[best] + " · " + agg.modules[best].inProgress + " in progress" })
            ]),
            el("button", { type: "button", class: "k-desk-go", "aria-label": "Open " + NAMES[best], text: "→",
              onclick: function () { KOS.show(best); } })
          ]));
        }
    }
    if (typeof window.IntersectionObserver === "function") {
      var medObs = new window.IntersectionObserver(function (entries) {
        if (!entries.some(function (e) { return e.isIntersecting; })) return;
        medObs.disconnect();
        fillCollectionCard();
      /* a generous margin: the point is to get the scan OFF the render pass,
         not to make the reader scroll for a figure that is one row below the
         fold on most desktops */
      }, { root: document.getElementById("stage"), rootMargin: "900px" });
      medObs.observe(medCard);
    }
  };
})();
