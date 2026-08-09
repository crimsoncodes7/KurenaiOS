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

  /* the panel rendered on the home dashboard */
  function panel() {
    var wrap = el("div", { class: "todo-panel" });
    function render() {
      wrap.innerHTML = "";
      var autos = autoItems();
      /* Build 6.2: the panel is the GENERATED directive list only. Reminders
         are a managed store with their own page, so Home reports them
         read-only underneath rather than offering a second editing surface. */
      var doneN = autos.filter(function (a) { return isChecked(a.key); }).length;
      var totalN = autos.length;

      wrap.appendChild(el("div", { class: "todo-h" }, [
        el("b", { text: "Today's directives" }),
        el("span", { class: "todo-count", text: totalN ? doneN + " / " + totalN : "—" })
      ]));

      if (!totalN) wrap.appendChild(el("p", { class: "sub", text: "Nothing generated for today — no due cards, no near deadlines. Add a task below or take the win." }));

      var listEl = el("div", { class: "todo-list" });
      wrap.appendChild(listEl);
      autos.forEach(function (a) {
        listEl.appendChild(row(isChecked(a.key), a.label, function (val) {
          setChecked(a.key, val, a.label); render();
        }, a.go, null, "auto", a.reward));
      });
      if (totalN) wrap.appendChild(el("p", { class: "todo-foot", text:
        doneN >= totalN ? "◆ All sealed — the streak lives on." : "◆ Seal every directive to keep the streak alive." }));

      /* the read-only reminders digest — management lives on its own page */
      if (KOS.remindersSummaryCard) wrap.appendChild(KOS.remindersSummaryCard());
    }
    function row(done, label, onTick, onGo, onDel, kind, reward) {
      /* the tick sits beside its label rather than inside one, so it needs
         the directive's own text as its name — "checkbox, unchecked" told
         a screen-reader user nothing about which directive they were on */
      var cb = el("input", { type: "checkbox", class: "todo-tick",
        "aria-label": "Seal directive: " + label,
        onchange: function () { onTick(cb.checked); } });
      cb.checked = done;
      return el("div", { class: "todo-item " + kind + (done ? " done" : "") }, [
        cb,
        el("span", { class: "todo-label", text: label,
          onclick: onGo || function () {} , style: onGo ? "cursor:pointer" : "" }),
        reward ? el("span", { class: "todo-reward", text: reward }) : (kind === "auto" ? el("span", { class: "todo-tag", text: "auto" }) : null),
        onDel ? el("button", { class: "xbtn", text: "✕", "aria-label": "Delete task", onclick: onDel }) : null
      ]);
    }
    render();
    return wrap;
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

  KOS.views.tasks = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "習 · The daily grain" }),
        el("h1", { text: "Habits" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "The small things you do every day. Reminders have their own page." })
        ])
      ]),
      KOS.workspaceTabs([
        ["Reminders", "reminders", undefined, "reminders"],
        ["Habits", "tasks", undefined, "tasks"],
        ["Calendar", "calendar", undefined, "calendar"]
      ], "tasks", "Productivity pages", "rem-workspace-tabs")
    ]));

    var grid = el("div", { class: "tasks-grid one-col" });
    main.appendChild(grid);
    var habCol = el("section", { class: "tasks-col" });
    grid.appendChild(habCol);

    function renderHabits() {
      habCol.innerHTML = "";
      habCol.appendChild(el("h3", { class: "tasks-h" }, [
        el("span", { class: "tk", "aria-hidden": "true", text: "習" }), "Habits"
      ]));
      var hs = habits();
      var list = el("div", { class: "habit-list" });
      if (!hs.length) list.appendChild(el("p", { class: "sub", text: "A habit is anything you want to keep daily — ticking one pays the same small trickle as a to-do." }));
      var today = KOS.srs.todayISO();
      hs.forEach(function (h) {
        var streak = habitStreak(h);
        var week = [];
        for (var i = 6; i >= 0; i--) {
          var d = KOS.srs.addDays(today, -i);
          week.push({ on: !!h.days[d], today: i === 0 });
        }
        var doneToday = !!h.days[today];
        var tick = el("button", { class: "habit-tick" + (doneToday ? " on" : ""),
          "aria-label": doneToday ? "Undo today's tick" : "Tick off today",
          text: doneToday ? "✓" : "○",
          onclick: function () { tickHabit(h.id, !doneToday); renderHabits(); } });
        list.appendChild(el("div", { class: "habit-row" + (doneToday ? " kept" : "") }, [
          tick,
          el("div", { class: "habit-main" }, [
            el("span", { class: "habit-name", text: h.text }),
            el("span", { class: "week-dots" }, week.map(function (w) {
              return el("i", { class: (w.on ? "on" : "") + (w.today && !w.on ? " today" : "") });
            }))
          ]),
          el("span", { class: "habit-streak" + (streak ? " lit" : "") }, [
            el("b", { text: String(streak) }), streak === 1 ? " day" : " days"
          ]),
          el("button", { class: "mini-btn danger", text: "✕", "aria-label": "Delete habit", onclick: function () {
            KOS.ui.confirm({ title: "Delete habit?", body: "“" + h.text + "” and its streak history go with it.", danger: true, confirm: "Delete" }, function () {
              deleteHabit(h.id); renderHabits();
            });
          } })
        ]));
      });
      habCol.appendChild(list);
      var input = el("input", { type: "text", class: "todo-in", placeholder: "Add a daily habit…",
        "aria-label": "New daily habit",
        onkeydown: function (e) { if (e.key === "Enter") submit(); } });
      function submit() {
        if (!input.value.trim()) return;
        addHabit(input.value.trim());
        renderHabits();
      }
      habCol.appendChild(el("div", { class: "todo-add" }, [
        input, el("button", { class: "btn", text: "+ Add", onclick: submit })
      ]));
    }

    renderHabits();
  };

  KOS.todo = {
    autoItems: autoItems,
    /* Home's "what next" reads the same tick state the panel renders, so the
       front page can never offer a directive the list already shows sealed */
    isChecked: isChecked,
    addManual: addManual,
    toggleManual: toggleManual,
    deleteManual: deleteManual,
    habits: habits,
    addHabit: addHabit,
    tickHabit: tickHabit,
    habitStreak: habitStreak,
    addSub: addSub,
    tickSub: tickSub,
    panel: panel
  };
})();
