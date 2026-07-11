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
        go: function () { KOS.show("due"); }
      });
    }

    /* 2 — upcoming exams/deadlines (priority: nearest first), today's study blocks */
    KOS.calendar.deadlines().filter(function (d) { return d.days <= 5; }).slice(0, 4).forEach(function (d) {
      out.push({
        key: "ev" + d.ev.id,
        label: (d.ev.type === "exam" ? "Revise for: " : "Prepare: ") + d.ev.title +
          " — " + (d.days === 0 ? "today" : d.days + "d away"),
        go: function () { KOS.show("calendar"); }
      });
    });
    KOS.calendar.eventsOn(today).filter(function (e) { return e.type === "study" || e.type === "lesson"; })
      .forEach(function (e) {
        out.push({
          key: "blk" + e.id,
          label: (e.time ? e.time + " · " : "") + e.title,
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

  /* manual tasks — CRUD, persist independently of the generated list */
  function addManual(text) {
    var t = T();
    t.manual.push({ id: t.nextId++, text: text, done: false, created: KOS.srs.todayISO() });
    store.save();
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
      var manual = T().manual;
      var doneN = autos.filter(function (a) { return isChecked(a.key); }).length +
        manual.filter(function (m) { return m.done; }).length;
      var totalN = autos.length + manual.length;

      wrap.appendChild(el("div", { class: "todo-h" }, [
        el("b", { text: "Today's directives" }),
        el("span", { class: "todo-count", text: totalN ? doneN + " / " + totalN : "—" })
      ]));

      if (!totalN) wrap.appendChild(el("p", { class: "sub", text: "Nothing generated for today — no due cards, no near deadlines. Add a task below or take the win." }));

      autos.forEach(function (a) {
        wrap.appendChild(row(isChecked(a.key), a.label, function (val) {
          setChecked(a.key, val, a.label); render();
        }, a.go, null, "auto"));
      });
      manual.forEach(function (m) {
        wrap.appendChild(row(m.done, m.text, function (val) {
          toggleManual(m.id, val, m.text); render();
        }, null, function () { deleteManual(m.id); render(); }, "manual"));
      });

      var input = el("input", { type: "text", class: "todo-in", placeholder: "Add your own task…",
        onkeydown: function (e) { if (e.key === "Enter") submit(); } });
      function submit() {
        if (!input.value.trim()) return;
        addManual(input.value.trim());
        render();
      }
      wrap.appendChild(el("div", { class: "todo-add" }, [
        input,
        el("button", { class: "btn", text: "+ Add", onclick: submit })
      ]));
    }
    function row(done, label, onTick, onGo, onDel, kind) {
      var cb = el("input", { type: "checkbox", onchange: function () { onTick(cb.checked); } });
      cb.checked = done;
      return el("div", { class: "todo-item " + kind + (done ? " done" : "") }, [
        el("label", { class: "todo-tick" }, [cb]),
        el("span", { class: "todo-label", text: label,
          onclick: onGo || function () {} , style: onGo ? "cursor:pointer" : "" }),
        kind === "auto" ? el("span", { class: "todo-tag", text: "auto" }) : null,
        onDel ? el("button", { class: "mini-btn danger", text: "✕", "aria-label": "Delete task", onclick: onDel }) : null
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
        el("span", { class: "dh-kicker", text: "The day's shape" }),
        el("h1", { text: "Tasks & Habits" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "Reminders with sub-tasks, and the small things you do every day." })
        ])
      ])
    ]));

    var grid = el("div", { class: "tasks-grid" });
    main.appendChild(grid);
    var remCol = el("section", { class: "tasks-col" });
    var habCol = el("section", { class: "tasks-col" });
    grid.appendChild(remCol);
    grid.appendChild(habCol);

    function renderReminders() {
      remCol.innerHTML = "";
      remCol.appendChild(el("h3", { class: "tasks-h" }, [
        el("span", { class: "tk", "aria-hidden": "true", text: "筆" }), "Reminders"
      ]));
      var list = el("div", { class: "rem-list" });
      var manual = T().manual;
      if (!manual.length) list.appendChild(el("p", { class: "sub", text: "Nothing on the list. Anything you add here also shows on the Overview." }));
      manual.forEach(function (m) {
        var subs = m.subs || [];
        var doneSubs = subs.filter(function (s) { return s.done; }).length;
        var row = el("div", { class: "rem-item" + (m.done ? " done" : "") });
        var cb = el("input", { type: "checkbox", class: "todo-tick", onchange: function () {
          toggleManual(m.id, cb.checked, m.text); renderReminders();
        } });
        cb.checked = m.done;
        var openSubs = row.dataset.open === "1";
        row.appendChild(el("div", { class: "rem-main" }, [
          cb,
          el("span", { class: "todo-label", text: m.text }),
          subs.length ? el("span", { class: "rem-subcount", text: doneSubs + "/" + subs.length }) : null,
          el("button", { class: "mini-btn", text: "＋ sub-task", onclick: function () {
            var box = row.querySelector(".rem-subs");
            box.style.display = "";
            box.querySelector("input").focus();
          } }),
          el("button", { class: "mini-btn danger", text: "✕", "aria-label": "Delete", onclick: function () {
            deleteManual(m.id); renderReminders();
          } })
        ]));
        var subBox = el("div", { class: "rem-subs", style: subs.length ? "" : "display:none" });
        subs.forEach(function (s) {
          var scb = el("input", { type: "checkbox", class: "todo-tick", onchange: function () {
            tickSub(m, s.id, scb.checked); renderReminders();
          } });
          scb.checked = s.done;
          subBox.appendChild(el("div", { class: "rem-sub" + (s.done ? " done" : "") }, [
            scb,
            el("span", { class: "todo-label", text: s.text }),
            el("button", { class: "xbtn", text: "✕", "aria-label": "Delete sub-task", onclick: function () {
              deleteSub(m, s.id); renderReminders();
            } })
          ]));
        });
        var subIn = el("input", { type: "text", class: "todo-in", placeholder: "Add a sub-task…",
          onkeydown: function (e) {
            if (e.key === "Enter" && subIn.value.trim()) { addSub(m, subIn.value.trim()); renderReminders(); }
          } });
        subBox.appendChild(el("div", { class: "rem-sub-add" }, [subIn]));
        row.appendChild(subBox);
        list.appendChild(row);
      });
      remCol.appendChild(list);
      var input = el("input", { type: "text", class: "todo-in", placeholder: "Add a reminder…",
        onkeydown: function (e) { if (e.key === "Enter") submit(); } });
      function submit() {
        if (!input.value.trim()) return;
        addManual(input.value.trim());
        renderReminders();
      }
      remCol.appendChild(el("div", { class: "todo-add" }, [
        input, el("button", { class: "btn", text: "+ Add", onclick: submit })
      ]));
    }

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
            if (confirm("Delete the habit “" + h.text + "”? Its history goes with it.")) {
              deleteHabit(h.id); renderHabits();
            }
          } })
        ]));
      });
      habCol.appendChild(list);
      var input = el("input", { type: "text", class: "todo-in", placeholder: "Add a daily habit…",
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

    renderReminders();
    renderHabits();
  };

  KOS.todo = {
    autoItems: autoItems,
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
