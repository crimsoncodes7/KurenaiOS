/* Kurenai OS — modules/reminders.js
   祝 Reminders — the dedicated page (Build 6.2).

   Three-column workspace: a sidebar of smart sections / lists / tags, the
   reminder list in the middle, and a side inspector on the right that owns
   every detail of the selected item (notes, sub-tasks, recurrence, alerts).
   Graphite (frame 10c) groups the list by when: Overdue, Today, Upcoming.
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

  /* a list's dot: its stored colour is a calendar hue name, else one is
     dealt from the calendar palette by id (invariant 46's hues) */
  var LIST_HUES = ["jade", "brass", "iris", "clay", "sage", "plum", "sky", "slate"];
  function listHue(l) {
    var name = l && LIST_HUES.indexOf(l.colour) !== -1 ? l.colour : LIST_HUES[((l && l.id) || 0) % LIST_HUES.length];
    return "var(--cal-" + name + ")";
  }
  var PRIO_TONE = { 1: "muted", 2: "amber", 3: "crimson" };

  KOS.views.reminders = function (main, arg) {
    KOS.shell.tree("none");
    var p = prefs();
    if (arg && arg.section) { p.section = arg.section; p.listId = null; p.tag = null; }

    /* Phase F: global search opens a specific reminder. The section is
       widened to "all" by the caller so a completed or undated reminder is
       still in the list it is about to be selected in. */
    var selectedId = arg && arg.id != null ? arg.id : null;

    /* No in-page copy of the section nav. Reminders, Habits and Calendar
       are already the Productivity strip directly above this header. */
    main.appendChild(KOS.ui.pageHeader({ kicker: "祝 · The standing list", title: "Reminders",
      sub: "Everything you've promised yourself: scheduled, labelled and never farmed for XP." }));

    /* Graphite (frame 10c): sections, lists and tags on the left, the list
       grouped by when, and the selected reminder's detail on the right */
    var grid = el("div", { class: "k-rem", "data-ui": "rem.layout" });
    main.appendChild(grid);
    var side = el("nav", { class: "k-rem-side", "data-ui": "rem.side", "aria-label": "Sections, lists and tags" });
    var mid = el("section", { class: "k-rem-main", "aria-label": "Reminders" });
    var insp = el("aside", { class: "k-rem-insp", "data-ui": "rem.insp", "aria-label": "Reminder detail" });
    grid.appendChild(side);
    grid.appendChild(mid);
    grid.appendChild(insp);

    /* ---------------- sidebar ---------------- */
    function sideItem(opts) {
      return el("button", { type: "button", class: "k-rem-item", "data-ui": "rem.side-item", "data-section": opts.section || null,
        "data-tone": opts.tone || null, "aria-current": opts.on ? "true" : null, onclick: opts.onclick }, [
        el("span", { class: "k-rem-glyph", "aria-hidden": "true", text: opts.glyph }),
        el("span", { class: "k-rem-item-l", text: opts.label }),
        el("span", { class: "k-rem-n k-mono", "data-ui": "rem.section-count", text: opts.count ? String(opts.count) : "" })
      ]);
    }
    function renderSide() {
      side.innerHTML = "";
      var c = R().counts();

      var secWrap = el("div", { class: "k-rem-group", "data-ui": "rem.side-group" }, [el("h3", { class: "k-kicker", text: "Smart sections" })]);
      R().SECTIONS.forEach(function (s) {
        var n = c.sections[s.id] || 0;
        secWrap.appendChild(sideItem({ section: s.id, glyph: s.glyph, label: s.label, count: n,
          tone: s.id === "overdue" && n ? "crimson" : null,
          on: p.section === s.id && p.listId == null && !p.tag,
          onclick: function () { p.section = s.id; p.listId = null; p.tag = null; KOS.store.save(); draw(); } }));
      });
      side.appendChild(secWrap);

      /* LISTS — containers. One per reminder. */
      var listWrap = el("div", { class: "k-rem-group", "data-ui": "rem.side-group" }, [
        el("h3", { class: "k-kicker k-rem-group-h" }, [
          el("span", { text: "Lists" }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "＋", title: "New list", "aria-label": "New list",
            onclick: function () { promptList(); } })
        ])
      ]);
      var ls = R().lists();
      if (!ls.length) listWrap.appendChild(el("p", { class: "k-rem-hint", text: "A list is a container — Uni, Home, Errands." }));
      ls.forEach(function (l) {
        /* the row is a container: selecting, renaming and deleting are three
           sibling buttons (a button inside a button is invalid) */
        var main0 = sideItem({ glyph: "", label: l.name, count: c.lists[l.id] || 0, on: p.listId === l.id,
          onclick: function () { p.listId = l.id; p.tag = null; p.section = "all"; KOS.store.save(); draw(); } });
        main0.style.setProperty("--list-hue", listHue(l));
        KOS.ui.state(main0, "list", true);
        listWrap.appendChild(el("div", { class: "k-rem-list-row" }, [
          main0,
          el("span", { class: "k-rem-list-ctl" }, [
            el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "✎", title: "Rename list", "aria-label": "Rename list " + l.name,
              onclick: function (ev) { ev.stopPropagation(); promptList(l); } }),
            el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "✕", title: "Delete list", "aria-label": "Delete list " + l.name,
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
      var tagWrap = el("div", { class: "k-rem-group", "data-ui": "rem.side-group" }, [el("h3", { class: "k-kicker", text: "Tags" })]);
      var ts = R().tags();
      if (!ts.length) tagWrap.appendChild(el("p", { class: "k-rem-hint", text: "A tag crosses lists — #urgent, #admin, #revision." }));
      var chips = el("div", { class: "k-cluster k-rem-tags" });
      ts.forEach(function (t) {
        chips.appendChild(el("button", { type: "button", class: "k-chip k-rem-tag", "data-ui": "rem.tag", "data-tone": "teal",
          "aria-pressed": String(p.tag === t.tag),
          onclick: function () { p.tag = p.tag === t.tag ? null : t.tag; p.listId = null; KOS.store.save(); draw(); } },
          ["#" + t.tag, el("span", { class: "k-mono", text: String(c.tags[t.tag] || 0) })]));
      });
      tagWrap.appendChild(chips);
      side.appendChild(tagWrap);
    }

    function promptList(existing) {
      var overlay = el("div", { class: "k-dialog-overlay" });
      overlay.close = function () { overlay.remove(); };
      var nameIn = el("input", { type: "text", class: "k-input", placeholder: "List name", "aria-label": "List name",
        onkeydown: function (e) { if (e.key === "Enter") save(); } });
      nameIn.value = existing ? existing.name : "";
      function save() {
        var v = nameIn.value.trim();
        if (!v) { KOS.ui.toast("A list needs a name.", true); return; }
        if (existing) R().renameList(existing.id, v); else R().addList(v);
        overlay.close(); draw();
      }
      overlay.appendChild(el("div", { class: "k-dialog", "data-ui": "ui.dialog" }, [
        el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
          el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: existing ? "Rename list" : "New list" }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Close", text: "✕", onclick: function () { overlay.close(); } })
        ]),
        el("div", { class: "k-dialog-body" }, [
          el("label", { class: "k-field", "data-ui": "ui.field" }, [el("span", { class: "k-field-label", text: "Name" }), nameIn])
        ]),
        el("div", { class: "k-dialog-foot" }, [
          el("button", { type: "button", class: "k-btn k-spacer", text: "Cancel", onclick: function () { overlay.close(); } }),
          el("button", { type: "button", class: "k-btn k-btn--primary", text: "Save", onclick: save })
        ])
      ]));
      KOS.ui.openDialog(overlay);
      nameIn.focus();
    }

    /* ---------------- quick add + tools + list ---------------- */
    var searchIn = el("input", { type: "search", class: "k-pill-select k-rem-search", placeholder: "Search reminders…",
      "aria-label": "Search reminders" });
    var sortSel = el("select", { class: "k-pill-select", "data-ui": "ui.status-select", "aria-label": "Sort reminders" },
      R().SORTS.map(function (s) { return el("option", { value: s.v, text: "Sort: " + s.label.toLowerCase() }); }));
    var prioSel = el("select", { class: "k-pill-select", "data-ui": "ui.status-select", "aria-label": "Filter by priority" },
      [el("option", { value: "", text: "Any priority" })].concat(
        R().PRIORITIES.slice(1).map(function (x) { return el("option", { value: String(x.v), text: x.label }); })));
    sortSel.value = p.sort || "due";
    prioSel.value = p.priority || "";
    searchIn.addEventListener("input", KOS.ui.debounce(function () { renderList(); }, 200));
    sortSel.addEventListener("change", function () { p.sort = sortSel.value; KOS.store.save(); renderList(); });
    prioSel.addEventListener("change", function () { p.priority = prioSel.value; KOS.store.save(); renderList(); });

    var quickIn = el("input", { type: "text", class: "k-rem-quick-in",
      placeholder: "Add a reminder…  (⏎ to save)",
      /* a placeholder is not a name: it disappears the moment there is
         text in the field, which is exactly when a name is needed */
      "aria-label": "New reminder",
      onkeydown: function (e) { if (e.key === "Enter") quickAdd(); } });
    var quickList = el("select", { class: "k-rem-quick-list k-mono", "aria-label": "File it in a list" });
    function fillQuickList() {
      quickList.innerHTML = "";
      quickList.appendChild(el("option", { value: "", text: "No list" }));
      R().lists().forEach(function (l) { quickList.appendChild(el("option", { value: String(l.id), text: l.name })); });
      quickList.value = p.listId != null ? String(p.listId) : "";
      quickList.hidden = !R().lists().length;
    }
    function quickAdd() {
      var v = quickIn.value.trim();
      if (!v) return;
      var patch = { title: v };
      /* adding while a list or a smart section is selected files it there —
         the obvious expectation, and it keeps the two concepts honest */
      if (quickList.value) patch.listId = parseInt(quickList.value, 10);
      else if (p.listId != null) patch.listId = p.listId;
      if (p.tag) patch.tags = [p.tag];
      if (p.section === "today") patch.due = KOS.srs.todayISO();
      if (p.section === "upcoming") patch.due = KOS.srs.addDays(KOS.srs.todayISO(), 1);
      var made = R().add(patch);
      quickIn.value = "";
      if (made) { selectedId = made.id; draw(); }
    }

    var listHolder = el("div", { class: "k-rem-items", "data-ui": "rem.items" });
    var countLine = el("p", { class: "k-rem-count", role: "status" });

    function heading() {
      if (p.listId != null) return R().listName(p.listId) || "List";
      if (p.tag) return "#" + p.tag;
      return R().section(p.section).label;
    }

    function renderMid() {
      mid.innerHTML = "";
      fillQuickList();
      mid.appendChild(el("h2", { class: "sr-only", text: heading() }));
      mid.appendChild(el("div", { class: "k-rem-quick" }, [
        el("button", { type: "button", class: "k-rem-quick-add", "data-ui": "rem.quick-add", "aria-label": "Add the reminder", text: "＋", onclick: quickAdd }),
        quickIn, quickList
      ]));
      mid.appendChild(el("div", { class: "k-cluster k-rem-tools", "data-ui": "rem.tools" }, [sortSel, prioSel, searchIn, countLine]));
      mid.appendChild(listHolder);
      renderList();
    }

    /* the list grouped by when, in date order; any other sort is one run */
    function groupOf(item) {
      var t = KOS.srs.todayISO();
      if (item.done) return "Completed";
      if (R().isOverdue(item)) return "Overdue";
      if (!item.due) return "No date";
      if (item.due === t) return "Today";
      return "Upcoming";
    }
    function renderList() {
      listHolder.innerHTML = "";
      var rows = R().query({
        section: p.section, listId: p.listId, tag: p.tag,
        priority: p.priority, search: searchIn.value, sort: p.sort
      });
      var filtered = !!(searchIn.value.trim() || p.priority);
      countLine.textContent = filtered ? rows.length + (rows.length === 1 ? " match" : " matches") : "";

      if (!rows.length) {
        listHolder.appendChild(KOS.ui.emptyState({ mark: "祝", compact: true,
          title: filtered ? "Nothing matches this search or filter."
            : p.section === "completed" ? "Nothing completed yet."
            : p.section === "overdue" ? "Nothing overdue — the list is under control."
            : "Nothing here yet. Add a reminder above." }));
        return;
      }
      var grouped = (p.sort || "due") === "due";
      var last = null;
      rows.forEach(function (item) {
        if (grouped) {
          var g = groupOf(item);
          if (g !== last) {
            listHolder.appendChild(el("h3", { class: "k-kicker k-rem-when", "data-tone": g === "Overdue" ? "crimson" : null, text: g }));
            last = g;
          }
        }
        listHolder.appendChild(row(item));
      });
    }

    function row(item) {
      var overdue = R().isOverdue(item);
      var subs = item.subs || [];
      var doneSubs = subs.filter(function (s) { return s.done; }).length;
      var node = el("div", { class: "k-rem-row", "data-ui": "rem.row",
        onclick: function (ev) {
          if (ev.target.closest("button")) return;
          select(item.id);
        } });
      if (item.done) KOS.ui.state(node, "done", true);
      if (overdue) KOS.ui.state(node, "overdue", true);
      if (selectedId === item.id) KOS.ui.state(node, "selected", true);

      var cb = el("button", { type: "button", class: "k-rem-check", "data-ui": "rem.check",
        "aria-pressed": String(!!item.done),
        "aria-label": item.done ? "Mark “" + item.title + "” not done" : "Complete “" + item.title + "”",
        text: item.done ? "✓" : "", onclick: function () {
          R().complete(item.id, !item.done);
          draw();
        } });
      if (item.priority === 3 && !item.done) KOS.ui.state(cb, "urgent", true);

      var meta = [];
      var dueTxt = fmtDue(item);
      if (dueTxt) meta.push(el("span", { class: "k-rem-due", "data-tone": overdue ? "crimson" : item.due === KOS.srs.todayISO() ? "amber" : null,
        text: overdue ? "Overdue · " + dueTxt : dueTxt }));
      if (item.recur) meta.push(el("span", { text: "⟳ " + (R().RECUR.find(function (r) { return r.v === item.recur; }) || {}).label }));
      if (item.listId != null && p.listId == null) {
        var ln = R().listName(item.listId);
        if (ln) meta.push(el("span", { text: ln }));
      }
      (item.tags || []).forEach(function (t) {
        if (p.tag === t) return;
        meta.push(el("span", { class: "k-rem-tagtext", text: "#" + t }));
      });
      if ((item.alerts || []).length) meta.push(el("span", { text: "🔔 " + item.alerts.length }));
      if (subs.length) meta.push(el("span", { class: "k-mono", text: doneSubs + "/" + subs.length }));
      if (item.notes) meta.push(el("span", { text: "note" }));

      var body = el("button", { type: "button", class: "k-rem-row-body", "data-ui": "rem.open",
        "aria-label": item.title + (dueTxt ? ", " + dueTxt : ""), "aria-expanded": String(selectedId === item.id),
        onclick: function () { select(item.id); } }, [
        el("span", { class: "k-rem-title", text: item.title }),
        meta.length ? el("span", { class: "k-rem-meta" }, meta.reduce(function (acc, m, i) {
          if (i) acc.push(el("span", { "aria-hidden": "true", text: "·" }));
          acc.push(m);
          return acc;
        }, [])) : null
      ].filter(Boolean));

      node.appendChild(cb);
      node.appendChild(body);
      if (item.priority) node.appendChild(el("span", { class: "k-chip", "data-tone": PRIO_TONE[item.priority] || null, text: R().PRIORITIES[item.priority].label }));
      node.appendChild(el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm k-rem-del", "data-ui": "rem.delete", text: "✕", "aria-label": "Delete “" + item.title + "”",
        onclick: function () {
          KOS.ui.confirm({ title: "Delete this reminder?", body: "“" + item.title + "” and its sub-tasks.", danger: true, confirm: "Delete" },
            function () { R().remove(item.id); if (selectedId === item.id) selectedId = null; draw(); });
        } }));
      return node;
    }
    function select(id) { selectedId = id; renderList(); renderInsp(); }

    /* ---------------- the detail panel ---------------- */
    function field(label, control, wide) {
      return el("label", { class: "k-field" + (wide ? " k-rem-wide" : ""), "data-ui": "ui.field" }, [el("span", { class: "k-field-label", text: label }), control]);
    }
    function renderInsp() {
      insp.innerHTML = "";
      var item = selectedId != null ? R().get(selectedId) : null;
      KOS.ui.state(insp, "empty", !item);
      if (!item) {
        insp.appendChild(KOS.ui.emptyState({ mark: "祝", compact: true,
          body: "Select a reminder to edit its date, priority, list, tags, notes, sub-tasks, repeat and alerts." }));
        return;
      }

      function commit(patch) {
        R().update(item.id, patch);
        renderSide(); renderList(); renderInsp();
      }

      var titleIn = el("textarea", { class: "k-rem-i-title", rows: "2", maxlength: "300",
        onkeydown: function (e) { if (e.key === "Enter") { e.preventDefault(); titleIn.blur(); } } });
      titleIn.value = item.title;
      titleIn.addEventListener("change", function () {
        if (!titleIn.value.trim()) { titleIn.value = item.title; KOS.ui.toast("A reminder needs some text.", true); return; }
        commit({ title: titleIn.value });
      });

      var dateIn = el("input", { type: "date", class: "k-input" });
      dateIn.value = item.due || "";
      var timeIn = el("input", { type: "time", class: "k-input" });
      timeIn.value = item.dueTime || "";
      timeIn.disabled = !item.due;
      dateIn.addEventListener("change", function () { commit({ due: dateIn.value || null, dueTime: dateIn.value ? item.dueTime : null }); });
      timeIn.addEventListener("change", function () { commit({ dueTime: timeIn.value || null }); });

      var prio = el("select", { class: "k-input" }, R().PRIORITIES.map(function (x) {
        return el("option", { value: String(x.v), text: x.label });
      }));
      prio.value = String(item.priority);
      prio.addEventListener("change", function () { commit({ priority: prio.value }); });

      var listSel = el("select", { class: "k-input" }, [el("option", { value: "", text: "No list" })].concat(
        R().lists().map(function (l) { return el("option", { value: String(l.id), text: l.name }); })));
      listSel.value = item.listId != null ? String(item.listId) : "";
      listSel.addEventListener("change", function () { commit({ listId: listSel.value ? parseInt(listSel.value, 10) : null }); });

      var tagIn = el("input", { type: "text", class: "k-input", placeholder: "urgent, admin" });
      tagIn.value = (item.tags || []).join(", ");
      tagIn.addEventListener("change", function () { commit({ tags: tagIn.value.split(",") }); });

      var recurSel = el("select", { class: "k-input" }, R().RECUR.map(function (r) {
        return el("option", { value: r.v, text: r.v ? r.label : "Does not repeat" });
      }));
      recurSel.value = item.recur || "";
      recurSel.disabled = !item.due;
      recurSel.addEventListener("change", function () { commit({ recur: recurSel.value || null }); });

      var notesIn = el("textarea", { class: "k-input", rows: "3", placeholder: "Notes…" });
      notesIn.value = item.notes || "";
      notesIn.addEventListener("change", function () { commit({ notes: notesIn.value }); });

      /* alerts — one toggle per offset, only meaningful once a date exists */
      var alertBox = el("div", { class: "k-cluster" });
      R().ALERTS.forEach(function (a) {
        var on = (item.alerts || []).indexOf(a.v) !== -1;
        var b = el("button", { type: "button", class: "k-qz-pill", "data-ui": "rem.alert", "aria-pressed": String(on), text: a.label,
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
      var subWrap = el("div", { class: "k-rem-subs" });
      (item.subs || []).forEach(function (s) {
        var sub = el("div", { class: "k-rem-sub" }, [
          el("button", { type: "button", class: "k-rem-box", "aria-pressed": String(!!s.done), text: s.done ? "✓" : "",
            "aria-label": (s.done ? "Untick " : "Tick ") + s.text,
            onclick: function () { R().subToggle(item.id, s.id, !s.done); renderList(); renderInsp(); } }),
          el("span", { class: "k-rem-sub-t", text: s.text }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "✕", "aria-label": "Delete sub-task",
            onclick: function () { R().subRemove(item.id, s.id); renderList(); renderInsp(); } })
        ]);
        if (s.done) KOS.ui.state(sub, "done", true);
        subWrap.appendChild(sub);
      });
      var subIn = el("input", { type: "text", class: "k-rem-sub-in", placeholder: "+ Add a sub-task…", "aria-label": "Add a sub-task",
        onkeydown: function (e) {
          if (e.key === "Enter" && subIn.value.trim()) { R().subAdd(item.id, subIn.value.trim()); renderList(); renderInsp(); }
        } });
      subWrap.appendChild(subIn);

      var rw = R().rewardState(item);
      var rewardNote = item.done ? null : el("p", { class: "k-rem-hint", text:
        rw.pays ? "Completing this pays the usual small trickle."
          : rw.reason === "daily-cap" ? "Today's reward cap is reached (" + R().REWARD_CAP + ") — completing still works, it just doesn't pay."
          : "Already paid for this one today — completing again doesn't pay." });

      var check = el("button", { type: "button", class: "k-rem-check", "data-ui": "rem.check", "aria-pressed": String(!!item.done),
        "aria-label": item.done ? "Mark “" + item.title + "” not done" : "Complete “" + item.title + "”", text: item.done ? "✓" : "",
        onclick: function () { R().complete(item.id, !item.done); draw(); } });
      if (item.priority === 3 && !item.done) KOS.ui.state(check, "urgent", true);

      insp.appendChild(el("div", { class: "k-rem-insp-head" }, [
        el("h2", { class: "k-kicker", text: "Reminder" }),
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "✕", "aria-label": "Close detail",
          onclick: function () { selectedId = null; renderList(); renderInsp(); } })
      ]));
      insp.appendChild(el("div", { class: "k-rem-insp-body", "data-ui": "rem.insp-body" }, [
        el("div", { class: "k-rem-i-top" }, [check,
          el("label", { class: "k-field", "data-ui": "ui.field" }, [el("span", { class: "sr-only", text: "Reminder" }), titleIn])]),
        el("div", { class: "k-rem-fields" }, [
          field("Due date", dateIn), field("Time", timeIn),
          field("List", listSel), field("Priority", prio),
          field("Repeat", recurSel, true)
        ]),
        el("section", { class: "k-rem-block", "data-ui": "rem.i-block" }, [
          el("h3", { class: "k-field-label", text: "Alerts" }),
          item.due ? null : el("p", { class: "k-rem-hint", text: "Give it a date first — an alert needs something to fire against." }),
          alertBox
        ].filter(Boolean)),
        field("Tags (comma separated)", tagIn),
        field("Notes", notesIn),
        el("section", { class: "k-rem-block", "data-ui": "rem.i-block" }, [el("h3", { class: "k-field-label", text: "Sub-tasks" }), subWrap]),
        rewardNote,
        el("div", { class: "k-cluster k-rem-i-foot" }, [
          el("button", { type: "button", class: "k-btn k-btn--sm", text: item.done ? "↺ Mark not done" : "✓ Complete",
            onclick: function () { R().complete(item.id, !item.done); draw(); } }),
          el("button", { type: "button", class: "k-btn k-btn--sm k-btn--danger", text: "Delete", onclick: function () {
            KOS.ui.confirm({ title: "Delete this reminder?", body: "“" + item.title + "” and its sub-tasks.", danger: true, confirm: "Delete" },
              function () { R().remove(item.id); selectedId = null; draw(); });
          } })
        ])
      ].filter(Boolean)));
    }

    function draw() { renderSide(); renderMid(); renderInsp(); }
    draw();
  };

  /* ---------------- alert ticker ----------------
     In-app only, same honesty as the calendar's: fires while the app is open,
     never claims to be a background push. */
  function tick() {
    if (!KOS.reminders) return;
    KOS.reminders.checkAlerts().forEach(function (f) {
      var when = f.minutes === 0 ? "now" : KOS.reminders.alertLabel(f.minutes).replace(" before", " to go");
      KOS.ui.toast("🔔 " + f.item.title + " — " + when, f.minutes === 0);
      if (KOS.notify) KOS.notify.push({ id: "rem:" + f.item.id + ":" + f.item.due + ":" + (f.item.dueTime || "") + ":" + f.minutes,
        kind: "reminder", title: f.item.title, body: "Reminder · due " + when, view: "reminders" });
    });
  }
  setTimeout(function () {
    tick();
    setInterval(tick, 60000);
  }, 6000);
})();
