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

  KOS.todo = {
    autoItems: autoItems,
    addManual: addManual,
    toggleManual: toggleManual,
    deleteManual: deleteManual,
    panel: panel
  };
})();
