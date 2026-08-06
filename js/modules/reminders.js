/* Kurenai OS — modules/reminders.js
   祝 Reminders — the dedicated page (Build 6.2).

   Three-column workspace: a sidebar of smart sections / lists / tags, the
   reminder list in the middle, and a side inspector on the right that owns
   every detail of the selected item (notes, sub-tasks, recurrence, alerts).
   Lists and Tags stay visibly separate in the sidebar because they ARE
   separate: a list contains, a tag labels.                                 */
(function () {
  "use strict";
  var el = KOS.ui.el, R = function () { return KOS.reminders; };

  /* view state survives re-renders within a visit; the section survives
     navigation through the store's ui branch so returning feels stable */
  function prefs() {
    var u = KOS.store.state.ui;
    u.reminders = u.reminders || { section: "all", sort: "due", listId: null, tag: null, priority: "" };
    return u.reminders;
  }

  function fmtDue(item) {
    if (!item.due) return null;
    var t = KOS.srs.todayISO();
    var d = item.due;
    var label;
    if (d === t) label = "Today";
    else if (d === KOS.srs.addDays(t, 1)) label = "Tomorrow";
    else if (d === KOS.srs.addDays(t, -1)) label = "Yesterday";
    else {
      var p = d.split("-");
      var dt = new Date(+p[0], +p[1] - 1, +p[2]);
      label = dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
        (p[0] !== String(new Date().getFullYear()) ? " " + p[0] : "");
    }
    return label + (item.dueTime ? " · " + item.dueTime : "");
  }
  function priorityMark(p) {
    var spec = R().PRIORITIES[p];
    return spec && spec.short ? spec.short : "";
  }

  KOS.views.reminders = function (main, arg) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var p = prefs();
    if (arg && arg.section) { p.section = arg.section; p.listId = null; p.tag = null; }

    var selectedId = null;

    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "祝 · The standing list" }),
        el("h1", { text: "Reminders" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "Everything you've promised yourself — scheduled, labelled and never farmed for XP." })
        ])
      ]),
      KOS.workspaceTabs([
        ["Reminders", "reminders", undefined, "reminders"],
        ["Habits", "tasks", undefined, "tasks"],
        ["Calendar", "calendar", undefined, "calendar"]
      ], "reminders", "Productivity pages", "rem-workspace-tabs")
    ]));

    var grid = el("div", { class: "rem-grid" });
    main.appendChild(grid);
    var side = el("nav", { class: "rem-side", "aria-label": "Sections, lists and tags" });
    var mid = el("section", { class: "rem-main" });
    var insp = el("aside", { class: "rem-insp", "aria-label": "Reminder detail" });
    grid.appendChild(side);
    grid.appendChild(mid);
    grid.appendChild(insp);

    /* ---------------- sidebar ---------------- */
    function renderSide() {
      side.innerHTML = "";
      var c = R().counts();

      var secWrap = el("div", { class: "rem-side-group" });
      secWrap.appendChild(el("h4", { text: "Smart sections" }));
      R().SECTIONS.forEach(function (s) {
        var on = p.section === s.id && p.listId == null && !p.tag;
        secWrap.appendChild(el("button", { class: "rem-side-item sec-" + s.id + (on ? " active" : ""),
          onclick: function () { p.section = s.id; p.listId = null; p.tag = null; KOS.store.save(); draw(); } }, [
          el("span", { class: "rsi-g", "aria-hidden": "true", text: s.glyph }),
          el("span", { class: "rsi-l", text: s.label }),
          el("span", { class: "rsi-n", text: String(c.sections[s.id] || 0) })
        ]));
      });
      side.appendChild(secWrap);

      /* LISTS — containers. One per reminder. */
      var listWrap = el("div", { class: "rem-side-group" });
      listWrap.appendChild(el("h4", {}, [
        el("span", { text: "Lists" }),
        el("button", { class: "mini-btn", text: "＋", title: "New list", "aria-label": "New list",
          onclick: function () { promptList(); } })
      ]));
      var ls = R().lists();
      if (!ls.length) listWrap.appendChild(el("p", { class: "sub rem-side-empty", text: "A list is a container — Uni, Home, Errands." }));
      ls.forEach(function (l) {
        listWrap.appendChild(el("button", { class: "rem-side-item" + (p.listId === l.id ? " active" : ""),
          onclick: function () { p.listId = l.id; p.tag = null; p.section = "all"; KOS.store.save(); draw(); } }, [
          el("span", { class: "rsi-dot", "aria-hidden": "true" }),
          el("span", { class: "rsi-l", text: l.name }),
          el("span", { class: "rsi-n", text: String(c.lists[l.id] || 0) }),
          el("span", { class: "rsi-ctl" }, [
            el("button", { class: "xbtn", text: "✎", title: "Rename list", "aria-label": "Rename list " + l.name,
              onclick: function (ev) { ev.stopPropagation(); promptList(l); } }),
            el("button", { class: "xbtn", text: "✕", title: "Delete list", "aria-label": "Delete list " + l.name,
              onclick: function (ev) {
                ev.stopPropagation();
                KOS.ui.confirm({ title: "Delete this list?", danger: true, confirm: "Delete",
                  body: "“" + l.name + "” goes; its reminders stay and simply lose their list." }, function () {
                  R().deleteList(l.id);
                  if (p.listId === l.id) p.listId = null;
                  draw();
                });
              } })
          ])
        ]));
      });
      side.appendChild(listWrap);

      /* TAGS — cross-list labels. Many per reminder. */
      var tagWrap = el("div", { class: "rem-side-group" });
      tagWrap.appendChild(el("h4", {}, [el("span", { text: "Tags" })]));
      var ts = R().tags();
      if (!ts.length) tagWrap.appendChild(el("p", { class: "sub rem-side-empty", text: "A tag crosses lists — #urgent, #admin, #revision." }));
      var chips = el("div", { class: "rem-tagcloud" });
      ts.forEach(function (t) {
        chips.appendChild(el("button", { class: "rem-tag" + (p.tag === t.tag ? " active" : ""),
          onclick: function () { p.tag = p.tag === t.tag ? null : t.tag; p.listId = null; KOS.store.save(); draw(); } },
          ["#" + t.tag, el("span", { class: "rt-n", text: String(c.tags[t.tag] || 0) })]));
      });
      tagWrap.appendChild(chips);
      side.appendChild(tagWrap);
    }

    function promptList(existing) {
      var overlay = KOS.medview.modalOverlay();
      var nameIn = el("input", { type: "text", class: "todo-in", value: existing ? existing.name : "",
        placeholder: "List name", onkeydown: function (e) { if (e.key === "Enter") save(); } });
      function save() {
        var v = nameIn.value.trim();
        if (!v) { KOS.ui.toast("A list needs a name.", true); return; }
        if (existing) R().renameList(existing.id, v); else R().addList(v);
        overlay.close(); draw();
      }
      overlay.appendChild(el("div", { class: "modal modal-sm" }, [
        el("div", { class: "modal-h" }, [el("b", { text: existing ? "Rename list" : "New list" }),
          el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", onclick: overlay.close })]),
        el("div", { class: "med-form" }, [KOS.medview.field("Name", nameIn)]),
        el("div", { class: "lab-controls med-modal-foot" }, [
          el("span", { style: "flex:1" }),
          el("button", { class: "btn", text: "Cancel", onclick: overlay.close }),
          el("button", { class: "btn primary", text: "Save", onclick: save })
        ])
      ]));
      document.body.appendChild(overlay);
      nameIn.focus();
    }

    /* ---------------- toolbar + list ---------------- */
    var searchIn = el("input", { type: "search", class: "todo-in rem-search", placeholder: "Search reminders, notes, tags…",
      "aria-label": "Search reminders" });
    var sortSel = el("select", { class: "status-sel", "aria-label": "Sort reminders" },
      R().SORTS.map(function (s) { return el("option", { value: s.v, text: s.label }); }));
    var prioSel = el("select", { class: "status-sel", "aria-label": "Filter by priority" },
      [el("option", { value: "", text: "Any priority" })].concat(
        R().PRIORITIES.slice(1).map(function (x) { return el("option", { value: String(x.v), text: x.label }); })));
    searchIn.addEventListener("input", KOS.ui.debounce(function () { renderList(); }, 200));
    sortSel.addEventListener("change", function () { p.sort = sortSel.value; KOS.store.save(); renderList(); });
    prioSel.addEventListener("change", function () { p.priority = prioSel.value; KOS.store.save(); renderList(); });

    var quickIn = el("input", { type: "text", class: "todo-in rem-quick-in",
      placeholder: "Add a reminder…  (⏎ to save)",
      onkeydown: function (e) { if (e.key === "Enter") quickAdd(); } });
    function quickAdd() {
      var v = quickIn.value.trim();
      if (!v) return;
      var patch = { title: v };
      /* adding while a list or a smart section is selected files it there —
         the obvious expectation, and it keeps the two concepts honest */
      if (p.listId != null) patch.listId = p.listId;
      if (p.tag) patch.tags = [p.tag];
      if (p.section === "today") patch.due = KOS.srs.todayISO();
      if (p.section === "upcoming") patch.due = KOS.srs.addDays(KOS.srs.todayISO(), 1);
      var made = R().add(patch);
      quickIn.value = "";
      if (made) { selectedId = made.id; draw(); }
    }

    var countLine = el("p", { class: "sub rem-count" });
    var listHolder = el("div", { class: "rem-items" });

    function heading() {
      if (p.listId != null) return R().listName(p.listId) || "List";
      if (p.tag) return "#" + p.tag;
      return R().section(p.section).label;
    }

    function renderMid() {
      mid.innerHTML = "";
      mid.appendChild(el("div", { class: "rem-main-h" }, [
        el("h2", { text: heading() }),
        el("div", { class: "rem-tools" }, [searchIn, prioSel, sortSel])
      ]));
      mid.appendChild(el("div", { class: "rem-quick" }, [
        quickIn, el("button", { class: "btn primary", text: "+ Add", onclick: quickAdd })
      ]));
      mid.appendChild(countLine);
      mid.appendChild(listHolder);
      renderList();
    }

    function renderList() {
      listHolder.innerHTML = "";
      var rows = R().query({
        section: p.section, listId: p.listId, tag: p.tag,
        priority: p.priority, search: searchIn.value, sort: p.sort
      });
      var filtered = !!(searchIn.value.trim() || p.priority);
      countLine.textContent = rows.length + (rows.length === 1 ? " reminder" : " reminders") +
        (filtered ? " (filtered)" : "");

      if (!rows.length) {
        listHolder.appendChild(KOS.medview.emptyState(
          filtered ? "Nothing matches this search or filter."
            : p.section === "completed" ? "Nothing completed yet."
            : p.section === "overdue" ? "Nothing overdue — the list is under control."
            : "Nothing here yet. Add a reminder above.",
          []));
        return;
      }
      rows.forEach(function (item) { listHolder.appendChild(row(item)); });
    }

    function row(item) {
      var overdue = R().isOverdue(item);
      var subs = item.subs || [];
      var doneSubs = subs.filter(function (s) { return s.done; }).length;
      var node = el("div", { class: "rem-row" + (item.done ? " done" : "") + (overdue ? " overdue" : "") +
        (selectedId === item.id ? " selected" : "") + " pr-" + item.priority,
        onclick: function () { selectedId = item.id; renderList(); renderInsp(); } });

      var cb = el("button", { class: "rem-check" + (item.done ? " on" : ""),
        "aria-label": item.done ? "Mark “" + item.title + "” not done" : "Complete “" + item.title + "”",
        text: item.done ? "✓" : "", onclick: function (ev) {
          ev.stopPropagation();
          R().complete(item.id, !item.done);
          draw();
        } });

      var meta = [];
      var dueTxt = fmtDue(item);
      if (dueTxt) meta.push(el("span", { class: "rem-chip due" + (overdue ? " overdue" : item.due === KOS.srs.todayISO() ? " today" : ""), text: dueTxt }));
      if (item.recur) meta.push(el("span", { class: "rem-chip recur", text: "⟳ " + (R().RECUR.find(function (r) { return r.v === item.recur; }) || {}).label }));
      if (item.listId != null && p.listId == null) {
        var ln = R().listName(item.listId);
        if (ln) meta.push(el("span", { class: "rem-chip list", text: ln }));
      }
      (item.tags || []).forEach(function (t) {
        if (p.tag === t) return;
        meta.push(el("span", { class: "rem-chip tag", text: "#" + t }));
      });
      if ((item.alerts || []).length) meta.push(el("span", { class: "rem-chip alert", text: "🔔 " + item.alerts.length }));
      if (subs.length) meta.push(el("span", { class: "rem-chip subs", text: doneSubs + "/" + subs.length }));
      if (item.notes) meta.push(el("span", { class: "rem-chip note", text: "note" }));

      node.appendChild(cb);
      node.appendChild(el("div", { class: "rem-row-body" }, [
        el("div", { class: "rem-row-top" }, [
          item.priority ? el("span", { class: "rem-prio", title: R().PRIORITIES[item.priority].label, text: priorityMark(item.priority) }) : null,
          el("span", { class: "rem-title", text: item.title })
        ].filter(Boolean)),
        meta.length ? el("div", { class: "rem-row-meta" }, meta) : null
      ].filter(Boolean)));
      node.appendChild(el("button", { class: "xbtn rem-del", text: "✕", "aria-label": "Delete “" + item.title + "”",
        onclick: function (ev) {
          ev.stopPropagation();
          KOS.ui.confirm({ title: "Delete this reminder?", body: "“" + item.title + "” and its sub-tasks.", danger: true, confirm: "Delete" },
            function () { R().remove(item.id); if (selectedId === item.id) selectedId = null; draw(); });
        } }));
      return node;
    }

    /* ---------------- the side inspector ---------------- */
    function renderInsp() {
      insp.innerHTML = "";
      var item = selectedId != null ? R().get(selectedId) : null;
      if (!item) {
        insp.appendChild(el("div", { class: "rem-insp-empty" }, [
          el("span", { class: "rie-g", "aria-hidden": "true", text: "祝" }),
          el("p", { class: "sub", text: "Select a reminder to edit its date, priority, list, tags, notes, sub-tasks, repeat and alerts." })
        ]));
        return;
      }

      function commit(patch) {
        R().update(item.id, patch);
        renderSide(); renderList(); renderInsp();
      }

      var titleIn = el("input", { type: "text", class: "todo-in rem-i-title", value: item.title });
      titleIn.addEventListener("change", function () {
        if (!titleIn.value.trim()) { titleIn.value = item.title; KOS.ui.toast("A reminder needs some text.", true); return; }
        commit({ title: titleIn.value });
      });

      var dateIn = el("input", { type: "date", class: "todo-in", value: item.due || "" });
      var timeIn = el("input", { type: "time", class: "todo-in", value: item.dueTime || "" });
      timeIn.disabled = !item.due;
      dateIn.addEventListener("change", function () { commit({ due: dateIn.value || null, dueTime: dateIn.value ? item.dueTime : null }); });
      timeIn.addEventListener("change", function () { commit({ dueTime: timeIn.value || null }); });

      var prio = el("select", { class: "status-sel" }, R().PRIORITIES.map(function (x) {
        return el("option", { value: String(x.v), text: x.label });
      }));
      prio.value = String(item.priority);
      prio.addEventListener("change", function () { commit({ priority: prio.value }); });

      var listSel = el("select", { class: "status-sel" }, [el("option", { value: "", text: "No list" })].concat(
        R().lists().map(function (l) { return el("option", { value: String(l.id), text: l.name }); })));
      listSel.value = item.listId != null ? String(item.listId) : "";
      listSel.addEventListener("change", function () { commit({ listId: listSel.value ? parseInt(listSel.value, 10) : null }); });

      var tagIn = el("input", { type: "text", class: "todo-in", value: (item.tags || []).join(", "),
        placeholder: "urgent, admin" });
      tagIn.addEventListener("change", function () { commit({ tags: tagIn.value.split(",") }); });

      var recurSel = el("select", { class: "status-sel" }, R().RECUR.map(function (r) {
        return el("option", { value: r.v, text: r.label });
      }));
      recurSel.value = item.recur || "";
      recurSel.disabled = !item.due;
      recurSel.addEventListener("change", function () { commit({ recur: recurSel.value || null }); });

      var notesIn = el("textarea", { class: "todo-in rem-i-notes", rows: "4", placeholder: "Notes…" });
      notesIn.value = item.notes || "";
      notesIn.addEventListener("change", function () { commit({ notes: notesIn.value }); });

      /* alerts — checkbox per offset, only meaningful once a date exists */
      var alertBox = el("div", { class: "rem-alerts" });
      R().ALERTS.forEach(function (a) {
        var on = (item.alerts || []).indexOf(a.v) !== -1;
        var b = el("button", { class: "rem-alert-chip" + (on ? " on" : ""), text: a.label,
          onclick: function () {
            var next = (item.alerts || []).slice();
            var i = next.indexOf(a.v);
            if (i === -1) next.push(a.v); else next.splice(i, 1);
            commit({ alerts: next });
          } });
        b.disabled = !item.due;
        alertBox.appendChild(b);
      });

      /* sub-tasks */
      var subWrap = el("div", { class: "rem-i-subs" });
      (item.subs || []).forEach(function (s) {
        subWrap.appendChild(el("div", { class: "rem-i-sub" + (s.done ? " done" : "") }, [
          el("button", { class: "rem-check sm" + (s.done ? " on" : ""), text: s.done ? "✓" : "",
            "aria-label": (s.done ? "Untick " : "Tick ") + s.text,
            onclick: function () { R().subToggle(item.id, s.id, !s.done); renderList(); renderInsp(); } }),
          el("span", { class: "rem-i-sub-t", text: s.text }),
          el("button", { class: "xbtn", text: "✕", "aria-label": "Delete sub-task",
            onclick: function () { R().subRemove(item.id, s.id); renderList(); renderInsp(); } })
        ]));
      });
      var subIn = el("input", { type: "text", class: "todo-in", placeholder: "Add a sub-task…",
        onkeydown: function (e) {
          if (e.key === "Enter" && subIn.value.trim()) { R().subAdd(item.id, subIn.value.trim()); renderList(); renderInsp(); }
        } });
      subWrap.appendChild(el("div", { class: "rem-i-sub-add" }, [subIn]));

      var rw = R().rewardState(item);
      var rewardNote = item.done ? null : el("p", { class: "sub rem-reward-note", text:
        rw.pays ? "Completing this pays the usual small trickle."
          : rw.reason === "daily-cap" ? "Today's reward cap is reached (" + R().REWARD_CAP + ") — completing still works, it just doesn't pay."
          : "Already paid for this one today — completing again doesn't pay." });

      insp.appendChild(el("div", { class: "rem-insp-head" }, [
        el("h3", { text: "Detail" }),
        el("button", { class: "mini-btn", text: "✕", "aria-label": "Close detail",
          onclick: function () { selectedId = null; renderList(); renderInsp(); } })
      ]));
      insp.appendChild(el("div", { class: "rem-insp-body" }, [
        KOS.medview.field("Reminder", titleIn),
        el("div", { class: "med-form-row" }, [
          KOS.medview.field("Due date", dateIn),
          KOS.medview.field("Time", timeIn)
        ]),
        el("div", { class: "med-form-row" }, [
          KOS.medview.field("Priority", prio),
          KOS.medview.field("List", listSel)
        ]),
        KOS.medview.field("Tags (comma separated)", tagIn),
        KOS.medview.field("Repeat", recurSel),
        el("div", { class: "rem-i-block" }, [
          el("h4", { text: "Alerts" }),
          item.due ? null : el("p", { class: "sub", text: "Give it a date first — an alert needs something to fire against." }),
          alertBox
        ].filter(Boolean)),
        KOS.medview.field("Notes", notesIn),
        el("div", { class: "rem-i-block" }, [el("h4", { text: "Sub-tasks" }), subWrap]),
        rewardNote,
        el("div", { class: "rem-i-foot" }, [
          el("button", { class: "btn", text: item.done ? "↺ Mark not done" : "✓ Complete",
            onclick: function () { R().complete(item.id, !item.done); draw(); } }),
          el("button", { class: "btn danger", text: "Delete", onclick: function () {
            KOS.ui.confirm({ title: "Delete this reminder?", body: "“" + item.title + "” and its sub-tasks.", danger: true, confirm: "Delete" },
              function () { R().remove(item.id); selectedId = null; draw(); });
          } })
        ])
      ].filter(Boolean)));
    }

    function draw() { renderSide(); renderMid(); renderInsp(); }
    draw();
  };

  /* ---------------- the read-only Home digest ----------------
     Deliberately has NO mutation path: Home reports, Reminders manages. */
  KOS.remindersSummaryCard = function () {
    var s = R().summary(3);
    var wrap = el("div", { class: "rem-sum" });
    wrap.appendChild(el("div", { class: "rem-sum-h" }, [
      el("b", { text: "Reminders" }),
      el("button", { class: "mini-btn", text: "Manage →", onclick: function () { KOS.show("reminders"); } })
    ]));
    wrap.appendChild(el("div", { class: "rem-sum-stats" }, [
      stat(s.overdue, "overdue", s.overdue ? "bad" : ""),
      stat(s.today, "due today", ""),
      stat(s.open, "open", "")
    ]));
    if (s.next.length) {
      var list = el("div", { class: "rem-sum-list" });
      s.next.forEach(function (i) {
        list.appendChild(el("div", { class: "rem-sum-row" + (R().isOverdue(i) ? " overdue" : "") }, [
          el("span", { class: "rsr-t", text: i.title }),
          el("span", { class: "rsr-d", text: fmtDue(i) || "" })
        ]));
      });
      wrap.appendChild(list);
    } else {
      wrap.appendChild(el("p", { class: "sub", text: s.open ? "Nothing dated — open the page to schedule." : "Nothing on the list." }));
    }
    function stat(v, k, cls) {
      return el("div", { class: "rem-sum-stat " + cls }, [
        el("b", { text: String(v) }), el("span", { text: k })
      ]);
    }
    return wrap;
  };

  /* ---------------- alert ticker ----------------
     In-app only, same honesty as the calendar's: fires while the app is open,
     never claims to be a background push. */
  function tick() {
    if (!KOS.reminders) return;
    KOS.reminders.checkAlerts().forEach(function (f) {
      var when = f.minutes === 0 ? "now" : KOS.reminders.alertLabel(f.minutes).replace(" before", " to go");
      KOS.ui.toast("🔔 " + f.item.title + " — " + when, f.minutes === 0);
    });
  }
  setTimeout(function () {
    tick();
    setInterval(tick, 60000);
  }, 6000);
})();
