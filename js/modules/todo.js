/* Kurenai OS — modules/todo.js
   Auto-generated daily to-do (FR-4.1), rule-based, regenerated every day:
     1. cards due today from the SM-2 queue
     2. exams/deadlines/study blocks from the calendar in the next few days
     3. the user's own manual tasks (persist independently)
   Ticks feed XP/HP through the session log like every other governor action.
   Auto-item tick state is per-day (keyed date|autoKey); manual tasks keep a
   durable done flag.                                                        */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  function T() { return store.state.todo; }

  /* the generated list for today — pure derivation, no storage */
  function autoItems() {
    var out = [];
    var today = KOS.srs.todayISO();

    /* 1 — SM-2 due queue */
    var due = KOS.srs.dueCards();
    if (due.length) {
      var overdue = due.filter(function (c) { return c.overdue > 0; }).length;
      out.push({
        key: "due", label: "Clear " + due.length + " due flashcard" + (due.length === 1 ? "" : "s") +
          (overdue ? " (" + overdue + " overdue)" : ""),
        reward: "+20 XP", go: function () { KOS.show("due"); }
      });
    }

    /* 2 — upcoming exams/deadlines (priority: nearest first), today's study blocks */
    KOS.calendar.deadlines().filter(function (d) { return d.days <= 5; }).slice(0, 4).forEach(function (d) {
      out.push({
        key: "ev" + d.ev.id,
        label: (d.ev.type === "exam" ? "Revise for: " : "Prepare: ") + d.ev.title +
          " — " + (d.days === 0 ? "today" : d.days + "d away"),
        reward: "+5 XP", go: function () { KOS.show("calendar"); }
      });
    });
    KOS.calendar.eventsOn(today).filter(function (e) { return e.type === "study" || e.type === "lesson"; })
      .forEach(function (e) {
        out.push({
          key: "blk" + e.id,
          label: (e.time ? e.time + " · " : "") + e.title,
          reward: "+5 XP",
          go: e.subject && e.ref ? function () { KOS.show("ref", { subject: e.subject, ref: e.ref }); }
            : function () { KOS.show("calendar"); }
        });
      });
    return out;
  }

  function isChecked(key) {
    return !!T().autoChecked[KOS.srs.todayISO() + "|" + key];
  }
  function setChecked(key, val, label) {
    var t = T(), today = KOS.srs.todayISO();
    /* prune yesterday's tick state while we're here — the list regenerates daily */
    Object.keys(t.autoChecked).forEach(function (k) {
      if (k.split("|")[0] !== today) delete t.autoChecked[k];
    });
    if (val) {
      t.autoChecked[today + "|" + key] = true;
      KOS.sessions.log({ type: "todo", metrics: { item: label } });   // XP/HP via governor
    } else {
      delete t.autoChecked[today + "|" + key];
      store.save();
    }
  }

  /* manual tasks — CRUD, persist independently of the generated list.
     opts (Apple-Reminders style): { date, category } — both optional. */
  function addManual(text, opts) {
    opts = opts || {};
    var t = T();
    t.manual.push({ id: t.nextId++, text: text, done: false, created: KOS.srs.todayISO(),
      date: opts.date || null, category: opts.category || null });
    store.save();
  }
  function updateManual(id, patch) {
    var m = T().manual.find(function (x) { return x.id === id; });
    if (!m) return;
    Object.keys(patch).forEach(function (k) { m[k] = patch[k]; });
    store.save();
  }
  /* every distinct category the user has used — powers the picker */
  function categories() {
    var seen = {};
    T().manual.forEach(function (m) { if (m.category) seen[m.category] = true; });
    return Object.keys(seen);
  }
  function toggleManual(id, val, label) {
    var m = T().manual.find(function (x) { return x.id === id; });
    if (!m) return;
    m.done = val;
    if (val) KOS.sessions.log({ type: "todo", metrics: { item: label } });
    else store.save();
  }
  function deleteManual(id) {
    var t = T();
    var i = t.manual.findIndex(function (x) { return x.id === id; });
    if (i !== -1) { t.manual.splice(i, 1); store.save(); }
  }

  /* ================= Tasks & Habits (the full page) =================
     Reminders with checkable sub-tasks, plus daily habit trackers.
     Rewards flow ONLY through the existing sessions.log "todo" path —
     the same sanctioned trickle every tick has always used. */
  function habits() {
    var t = T();
    t.habits = t.habits || [];
    return t.habits;
  }
  function addHabit(text) {
    var t = T();
    t.habits = t.habits || [];
    t.habits.push({ id: t.nextId++, text: text, days: {}, created: KOS.srs.todayISO() });
    store.save();
  }
  function deleteHabit(id) {
    var hs = habits();
    var i = hs.findIndex(function (h) { return h.id === id; });
    if (i !== -1) { hs.splice(i, 1); store.save(); }
  }
  function tickHabit(id, val) {
    var h = habits().find(function (x) { return x.id === id; });
    if (!h) return;
    var today = KOS.srs.todayISO();
    if (val) {
      h.days[today] = true;
      KOS.sessions.log({ type: "todo", metrics: { item: "Habit kept: " + h.text } });
    } else {
      delete h.days[today];
      store.save();
    }
  }
  function habitStreak(h) {
    var d = KOS.srs.todayISO(), n = 0;
    if (!h.days[d]) d = KOS.srs.addDays(d, -1);   // an unticked today doesn't break it yet
    while (h.days[d]) { n++; d = KOS.srs.addDays(d, -1); }
    return n;
  }

  /* sub-tasks on manual reminders (lazily added to existing items) */
  function addSub(item, text) {
    var t = T();
    item.subs = item.subs || [];
    item.subs.push({ id: t.nextId++, text: text, done: false });
    store.save();
  }
  function tickSub(item, subId, val) {
    var s = (item.subs || []).find(function (x) { return x.id === subId; });
    if (!s) return;
    s.done = val;
    if (val) KOS.sessions.log({ type: "todo", metrics: { item: s.text } });
    else store.save();
  }
  function deleteSub(item, subId) {
    var i = (item.subs || []).findIndex(function (x) { return x.id === subId; });
    if (i !== -1) { item.subs.splice(i, 1); store.save(); }
  }

  /* the longest run of kept days a habit has ever had */
  function habitBest(h) {
    var keys = Object.keys(h.days || {}).filter(function (k) { return h.days[k]; }).sort();
    var best = 0, run = 0, prev = null;
    keys.forEach(function (d) {
      run = prev && KOS.srs.addDays(prev, 1) === d ? run + 1 : 1;
      if (run > best) best = run;
      prev = d;
    });
    return best;
  }
  /* Monday of the week holding iso */
  function mondayOf(iso) {
    var p = iso.split("-"), dt = new Date(+p[0], +p[1] - 1, +p[2]);
    return KOS.srs.addDays(iso, -((dt.getDay() + 6) % 7));
  }
  function dayLabel(iso, opts) {
    var p = iso.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-GB", opts);
  }

  /* Graphite (frame 10d): the week as a grid — one row per habit, the
     seven days, the streak — beside today's directives and twelve weeks
     of keeping. Reads only: a render never creates the habits array. */
  KOS.views.tasks = function (main) {
    KOS.shell.tree("none");
    /* No in-page copy of the section nav. Reminders, Habits and Calendar
       are already the Productivity strip directly above this header. */
    main.appendChild(KOS.ui.pageHeader({ kicker: "習 · The daily grain", title: "Habits",
      sub: "The small things you do every day. Reminders have their own page." }));

    var weekOffset = 0;
    var grid = el("div", { class: "k-hb" });
    main.appendChild(grid);
    var card = el("section", { class: "k-card k-hb-card", "data-ui": "habit.list", "aria-label": "Daily habits" });
    var side = el("div", { class: "k-hb-side" });
    grid.appendChild(card);
    grid.appendChild(side);

    function list() { return (T() && T().habits) || []; }

    function renderHabits() {
      card.innerHTML = "";
      var hs = list();
      var today = KOS.srs.todayISO();
      var start = KOS.srs.addDays(mondayOf(today), -7 * weekOffset);
      var days = [];
      for (var i = 0; i < 7; i++) days.push(KOS.srs.addDays(start, i));
      var keptToday = hs.filter(function (h) { return h.days[today]; }).length;

      card.appendChild(el("div", { class: "k-hb-head" }, [
        el("h2", { class: "k-card-title", text: "Daily habits" }),
        hs.length ? el("span", { class: "k-chip", "data-tone": "teal", text: keptToday + " of " + hs.length + " today" }) : null,
        el("span", { class: "k-hb-weeknav" }, [
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "habit.week-prev", "aria-label": "Previous week", text: "‹",
            onclick: function () { weekOffset++; renderHabits(); } }),
          el("span", { class: "k-hb-week", role: "status", text: "w/c " + dayLabel(start, { day: "numeric", month: "short" }) }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "habit.week-next", "aria-label": "Next week", text: "›",
            disabled: weekOffset === 0 ? "" : null, onclick: function () { weekOffset = Math.max(0, weekOffset - 1); renderHabits(); } })
        ])
      ].filter(Boolean)));

      var table = el("div", { class: "k-hb-table", role: "table", "aria-label": "Habits this week" });
      table.appendChild(el("div", { class: "k-hb-row k-hb-cols", role: "row" }, [
        el("span", { class: "k-kicker k-hb-name-h", role: "columnheader", text: "Habit" }),
        el("span", { class: "k-hb-days", role: "columnheader", "aria-label": "Days" }, days.map(function (d) {
          var day = el("span", { class: "k-hb-dayh" }, [
            el("span", { class: "k-hb-dow", text: dayLabel(d, { weekday: "short" }) }),
            el("span", { class: "k-mono", text: String(+d.slice(8)) })
          ]);
          if (d === today) KOS.ui.state(day, "today", true);
          return day;
        })),
        el("span", { class: "k-kicker", role: "columnheader", text: "Streak" }),
        el("span", { role: "columnheader", "aria-label": "Actions" })
      ]));

      hs.forEach(function (h) {
        var streak = habitStreak(h), best = habitBest(h);
        var doneToday = !!h.days[today];
        var tick = el("button", { type: "button", class: "k-hb-tick", "data-ui": "habit.tick", "aria-pressed": String(doneToday),
          "aria-label": doneToday ? "Undo today's tick for " + h.text : "Tick off " + h.text + " today",
          text: doneToday ? "✓" : "",
          onclick: function () { tickHabit(h.id, !doneToday); renderHabits(); renderHeat(); } });
        var kept = days.filter(function (d) { return h.days[d]; }).length;
        var cells = el("span", { class: "k-hb-days", "data-ui": "habit.week-dots", role: "img",
          "aria-label": kept + " of 7 days kept this week" }, days.map(function (d) {
          var c = el("span", { class: "k-hb-cell" });
          if (h.days[d]) KOS.ui.state(c, "on", true);
          if (d === today) KOS.ui.state(c, "today", true);
          if (d > today) KOS.ui.state(c, "future", true);
          return c;
        }));
        var del = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm k-hb-del", "data-ui": "habit.delete", text: "✕",
          "aria-label": "Delete habit", title: "Delete “" + h.text + "”", onclick: function () {
            KOS.ui.confirm({ title: "Delete habit?", body: "“" + h.text + "” and its streak history go with it.", danger: true, confirm: "Delete" }, function () {
              deleteHabit(h.id); renderHabits(); renderHeat();
            });
          } });
        table.appendChild(el("div", { class: "k-hb-row", "data-ui": "habit.row", role: "row" }, [
          el("span", { class: "k-hb-name", role: "cell" }, [tick, el("span", { class: "k-ellipsis", text: h.text })]),
          el("span", { role: "cell" }, [cells]),
          el("span", { class: "k-hb-streak", role: "cell" }, streak
            ? [el("b", { text: "炎 " + streak }), best > streak ? el("span", { text: " · best " + best }) : null].filter(Boolean)
            : [el("span", { text: best ? "best " + best : "—" })]),
          el("span", { role: "cell" }, [del])
        ]));
      });
      card.appendChild(table);
      if (!hs.length) card.appendChild(el("p", { class: "k-hb-hint", text: "A habit is anything you want to keep daily — ticking one pays the same small trickle as a to-do." }));

      var input = el("input", { type: "text", class: "k-hb-add-in", placeholder: "Add a daily habit…",
        "aria-label": "New daily habit",
        onkeydown: function (e) { if (e.key === "Enter") submit(); } });
      function submit() {
        if (!input.value.trim()) return;
        addHabit(input.value.trim());
        renderHabits(); renderHeat();
        var again = card.querySelector(".k-hb-add-in");
        if (again) again.focus();
      }
      card.appendChild(el("div", { class: "k-hb-add" }, [
        el("button", { type: "button", class: "k-hb-add-go", "data-ui": "habit.add", "aria-label": "Add the habit", text: "＋", onclick: submit }),
        input
      ]));
    }

    /* today's directives — the generated list, sealed here as on Home */
    var dirCard = el("section", { class: "k-card", "data-ui": "habit.directives", "aria-label": "Today's directives" });
    function renderDirectives() {
      dirCard.innerHTML = "";
      var autos = autoItems();
      dirCard.appendChild(el("div", { class: "k-card-head" }, [
        el("h2", { class: "k-card-title", text: "Today's directives" }),
        el("span", { class: "k-card-meta", text: "from exams & deadlines" })
      ]));
      if (!autos.length) {
        dirCard.appendChild(el("p", { class: "k-hb-hint", text: "Nothing generated for today — no due cards, no near deadlines." }));
        return;
      }
      autos.forEach(function (a) {
        var done = isChecked(a.key);
        var row = el("div", { class: "k-hb-dir" }, [
          el("button", { type: "button", class: "k-hb-dir-tick", "data-ui": "habit.seal", "aria-pressed": String(done),
            "aria-label": (done ? "Unseal directive: " : "Seal directive: ") + a.label, text: done ? "✓" : "",
            onclick: function () { setChecked(a.key, !done, a.label); renderDirectives(); } }),
          el("button", { type: "button", class: "k-hb-dir-go k-ellipsis", text: a.label, onclick: a.go }),
          el("span", { class: "k-mono k-hb-reward", text: a.reward })
        ]);
        if (done) KOS.ui.state(row, "done", true);
        dirCard.appendChild(row);
      });
    }

    /* twelve weeks of keeping: each day's share of habits kept */
    var heatCard = el("section", { class: "k-card", "data-ui": "habit.heat", "aria-label": "Last 12 weeks" });
    function renderHeat() {
      heatCard.innerHTML = "";
      heatCard.appendChild(el("h2", { class: "k-card-title", text: "Last 12 weeks" }));
      var hs = list();
      if (!hs.length) { heatCard.appendChild(el("p", { class: "k-hb-hint", text: "Keep a habit for a few days and the pattern shows here." })); return; }
      var today = KOS.srs.todayISO();
      var first = KOS.srs.addDays(mondayOf(today), -7 * 11);
      var cells = [], keptDays = 0;
      for (var i = 0; i < 84; i++) {
        var d = KOS.srs.addDays(first, i);
        var c = el("span", { class: "k-hb-heat-cell" });
        if (d > today) KOS.ui.state(c, "future", true);
        else {
          var n = hs.filter(function (h) { return h.days[d]; }).length;
          if (n) keptDays++;
          c.style.setProperty("--lvl", Math.round(100 * n / hs.length) + "%");
          c.title = dayLabel(d, { weekday: "short", day: "numeric", month: "short" }) + " · " + n + " of " + hs.length;
        }
        cells.push(c);
      }
      heatCard.appendChild(el("div", { class: "k-hb-heat", role: "img",
        "aria-label": "Habits kept on " + keptDays + " of the last 84 days" }, cells));
    }

    side.appendChild(dirCard);
    side.appendChild(heatCard);
    renderHabits();
    renderDirectives();
    renderHeat();
  };

  KOS.todo = {
    autoItems: autoItems,
    /* Home's "what next" reads the same tick state the panel renders, so the
       front page can never offer a directive the list already shows sealed */
    isChecked: isChecked,
    /* seal or unseal a directive (Home's daily goal): the same path the
       panel's checkbox takes, so the reward flows through sessions.log */
    setChecked: setChecked,
    addManual: addManual,
    toggleManual: toggleManual,
    deleteManual: deleteManual,
    habits: habits,
    addHabit: addHabit,
    tickHabit: tickHabit,
    habitStreak: habitStreak,
    addSub: addSub,
    tickSub: tickSub,
    habitBest: habitBest
  };
})();
