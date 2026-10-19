/* Kurenai OS — modules/goals.js
   The Goals page under Collection's Planner (frame 11h) and its editor.

   The model is the Goals engine, core/goals.js (`KOS.goals`): the record,
   the registry of types, measuring, pace and periods. This file only
   draws. Until the Money and Goals designs (frames 27i–27k) arrive, the
   editor offers the Collection's types and the manual goal, as it always
   has; goals of other domains (made through the Assistant) still list
   and open here.

   GOVERNOR BOUNDARY: completion is recorded once in completionLedger and
   never creates a session or payout (invariant 5b). */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store, G = KOS.goals;
  var MODULES = G.MODULES;
  /* the editor's choices: the Collection's types, the manual goal last */
  var TYPES = G.types({ domain: "collection" }).filter(function (d) { return d.id !== "custom-manual"; })
    .concat([G.typeDef("custom-manual")]);
  var typeDef = G.typeDef, moduleLabel = G.moduleLabel, num = G.num;
  var todayISO = G.todayISO, monthEndISO = G.monthEndISO, normaliseGoal = G.normalise;
  var add = G.add, update = G.update, remove = G.remove, nudge = G.nudge, reopen = G.reopen, compute = G.compute;

  /* ---------------- modal editor ---------------- */
  function field(label, input, hook) {
    return el("label", { class: "k-field", "data-ui": "ui.field" + (hook ? " " + hook : "") }, [
      el("span", { class: "k-field-label", "data-ui": "ui.field-label", text: label }), input]);
  }
  function section(title, copy, kids) {
    return el("section", { class: "k-gl-form-sec", "data-ui": "goal.form-group" }, [
      el("div", { class: "k-gl-form-head", "data-ui": "goal.form-section" }, [
        el("b", { text: title }), copy ? el("span", { class: "k-muted", text: copy }) : null].filter(Boolean)),
      el("div", { class: "k-gl-form-grid" }, kids)
    ]);
  }
  function wide(node) { node.classList.add("k-medit-wide"); return node; }
  function goalEditor(existing, done) {
    var g = existing ? normaliseGoal(existing) : normaliseGoal({ type: "titles-completed", target: 5, startDate: todayISO() });
    var overlay = KOS.medview.modalOverlay();
    function input(type, value, extra) { return el("input", Object.assign({ type: type, class: "k-input", value: value }, extra || {})); }
    var titleIn = input("text", existing ? g.title : "", { maxlength: "160", placeholder: "Name this intention" });
    var descIn = el("textarea", { class: "k-input", rows: "3", maxlength: "700", placeholder: "What are you trying to change or finish?" }); descIn.value = g.description || "";
    var notesIn = el("textarea", { class: "k-input", rows: "4", maxlength: "2000", placeholder: "Private notes, rules, or context (optional)" }); notesIn.value = g.notes || "";
    /* a goal of another domain keeps its own type when edited here */
    var choices = TYPES.indexOf(typeDef(g.type)) === -1 ? TYPES.concat([typeDef(g.type)]) : TYPES;
    var typeSel = el("select", { class: "k-input" }, choices.map(function (d) { var o = el("option", { value: d.id, text: d.label }); if (g.type === d.id) o.selected = true; return o; }));
    var moduleSel = el("select", { class: "k-input" }, MODULES.map(function (m) { var o = el("option", { value: m.id, text: m.label }); if ((g.module || "") === m.id) o.selected = true; return o; }));
    var targetIn = input("number", String(g.target || 1), { min: "1", step: "1" });
    var currentIn = input("number", String(g.current || 0), { min: "0", step: "1" });
    var startIn = input("date", g.startDate || todayISO());
    var deadlineIn = input("date", g.deadline || "");
    var filterKindSel = el("select", { class: "k-input" }, [
      el("option", { value: "list", text: "Custom list" }), el("option", { value: "tag", text: "Tag" }), el("option", { value: "genre", text: "Genre" })
    ]); filterKindSel.value = g.filterKind || "list";
    var filterListId = "goal-filter-values-" + (g.id || "new") + "-" + Date.now();
    var filterValueIn = input("text", g.filterValue || "", { list: filterListId, placeholder: "Choose or type a value" });
    var filterDatalist = el("datalist", { id: filterListId });
    var linkedSearch = input("search", "", { placeholder: "Search the vault by title" });
    var linkedResults = el("select", { class: "k-input", "data-ui": "goal.link-results", "aria-label": "Linked title" }, [el("option", { value: "", text: "No title selected" })]);
    var linkedStatus = el("span", { class: "k-muted k-gl-note", "data-ui": "goal.link-status", text: "Search locally, then choose one result." });
    var searchBtn = el("button", { type: "button", class: "k-btn", text: "Find title", onclick: searchTitles });

    var typeField = field("Goal type", typeSel, "goal.type-field");
    var moduleField = field("Media category", moduleSel, "goal.module-field");
    var targetField = field("Target", targetIn, "goal.target-field");
    var currentField = field("Current value", currentIn, "goal.current-field");
    var filterWrap = wide(el("div", { class: "k-gl-pair", "data-ui": "goal.filter-wrap" }, [
      field("Filter", filterKindSel), field("Value", filterValueIn), filterDatalist
    ]));
    var linkWrap = wide(el("div", { class: "k-gl-pair", "data-ui": "goal.link-wrap" }, [
      field("Find a title", el("div", { class: "k-gl-search" }, [linkedSearch, searchBtn])),
      field("Linked title", linkedResults), linkedStatus
    ]));
    var scheduleCopy = wide(el("p", { class: "k-muted k-gl-note", "data-ui": "goal.date-note", text: "A deadline moves an unfinished goal to Failed / expired. Spending goals settle when their deadline passes." }));
    var body = el("div", { class: "k-dialog-body k-gl-editor-body", "data-ui": "ui.form goal.editor-body" }, [
      section("Identity", "Give the goal a clear outcome.", [wide(field("Title", titleIn)), wide(field("Description", descIn))]),
      section("Measure", "Automatic goals read local Collection data; manual goals expose their counter.", [typeField, moduleField, targetField, currentField, filterWrap, linkWrap]),
      section("Schedule", "Choose the window this intention belongs to.", [field("Start date", startIn), field("Deadline", deadlineIn), scheduleCopy]),
      section("Notes", "Private context that stays with the goal.", [wide(field("Notes", notesIn))])
    ]);

    function populateLinked(entry) {
      if (!entry) return;
      linkedResults.innerHTML = "";
      linkedResults.appendChild(el("option", { value: String(entry.id), text: entry.title + " · " + moduleLabel(entry.module) }));
      linkedResults.value = String(entry.id);
      linkedStatus.textContent = "Linked to “" + entry.title + "”.";
    }
    if (g.linkedEntryId) KOS.mediadb.get(g.linkedEntryId, function (err, entry) { if (entry && !err) populateLinked(entry); });
    function searchTitles() {
      var q = linkedSearch.value.trim();
      if (!q) { KOS.ui.toast("Enter part of a title first.", true); return; }
      searchBtn.disabled = true; linkedStatus.textContent = "Searching the local vault…";
      KOS.mediadb.query({ module: moduleSel.value || undefined, search: q, sort: "title" }, function (err, rows) {
        searchBtn.disabled = false; linkedResults.innerHTML = "";
        linkedResults.appendChild(el("option", { value: "", text: err ? "Could not search" : rows.length ? "Choose a result" : "No matching titles" }));
        (rows || []).slice(0, 30).forEach(function (entry) { linkedResults.appendChild(el("option", { value: String(entry.id), text: entry.title + " · " + moduleLabel(entry.module) })); });
        linkedStatus.textContent = err ? err.message : rows.length + " result" + (rows.length === 1 ? "" : "s") + (rows.length > 30 ? " · first 30 shown" : "") + ".";
      });
    }
    linkedSearch.addEventListener("keydown", function (ev) { if (ev.key === "Enter") { ev.preventDefault(); searchTitles(); } });
    linkedResults.addEventListener("change", function () { if (linkedResults.value) linkedStatus.textContent = "Title selected."; });

    function loadFilterValues() {
      var index = filterKindSel.value === "list" ? "customLists" : filterKindSel.value === "tag" ? "tags" : "genres";
      filterDatalist.innerHTML = "";
      KOS.mediadb.distinct(index, function (err, vals) {
        if (err) return;
        vals.forEach(function (v) { filterDatalist.appendChild(el("option", { value: v })); });
      });
    }
    filterKindSel.addEventListener("change", loadFilterValues);
    loadFilterValues();

    function syncType() {
      var d = typeDef(typeSel.value);
      moduleField.hidden = !d.module && !d.linked;
      targetField.hidden = d.linked;
      currentField.hidden = d.auto;
      filterWrap.hidden = !d.filter;
      linkWrap.hidden = !d.linked;
      targetField.querySelector('[data-ui~="ui.field-label"]').textContent = d.inverse ? "Spending cap" : "Target";
      targetIn.step = d.inverse ? "0.01" : "1";
      if (d.id === "spend-below" && !deadlineIn.value) deadlineIn.value = monthEndISO();
    }
    typeSel.addEventListener("change", syncType);
    syncType();

    function save() {
      var title = titleIn.value.trim(), d = typeDef(typeSel.value), target = num(targetIn.value, 1, 1);
      if (!title) { KOS.ui.toast("Give the goal a title first.", true); titleIn.focus(); return; }
      if (startIn.value && deadlineIn.value && startIn.value > deadlineIn.value) { KOS.ui.toast("The deadline must be on or after the start date.", true); return; }
      if (d.linked && !linkedResults.value) { KOS.ui.toast("Choose the title this goal should follow.", true); return; }
      if (d.filter && !filterValueIn.value.trim()) { KOS.ui.toast("Choose a list, tag, or genre to measure.", true); return; }
      if (d.inverse && !deadlineIn.value) { KOS.ui.toast("A spending goal needs a deadline so it can settle.", true); return; }
      var fields = {
        title: title, description: descIn.value.trim(), notes: notesIn.value.trim(), type: d.id,
        module: moduleSel.value || null, linkedEntryId: d.linked ? Number(linkedResults.value) : null,
        filterKind: d.filter ? filterKindSel.value : null, filterValue: d.filter ? filterValueIn.value.trim() : "",
        target: d.linked ? 1 : target, current: d.auto ? 0 : num(currentIn.value, 0, 0),
        startDate: startIn.value || todayISO(), deadline: deadlineIn.value || null,
        status: "active", completedAt: null, failedAt: null, failedManual: false
      };
      if (existing) update(existing.id, fields); else add(fields);
      overlay.close(); if (done) done();
    }

    /* Delete never shares a control group with Save (invariant 84) */
    var footer = el("div", { class: "k-dialog-foot", "data-ui": "goal.modal-foot" }, [
      existing ? el("button", { type: "button", class: "k-btn k-btn--danger", "data-ui": "goal.delete", text: "Delete goal", onclick: function () {
        KOS.ui.confirm({ title: "Delete this goal?", danger: true, confirm: "Delete", body: "“" + existing.title + "” will be removed. Any completed-activity receipt stays in the anti-farming ledger." }, function () {
          remove(existing.id); overlay.close(); if (done) done();
        });
      } }) : null,
      el("div", { class: "k-gl-actions", "data-ui": "goal.modal-actions" }, [
        el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: overlay.close }),
        el("button", { type: "button", class: "k-btn k-btn--primary", text: existing ? "Save changes" : "Create goal", onclick: save })
      ])
    ].filter(Boolean));
    KOS.medview.dialogBox(overlay, "goal.editor", existing ? "Edit goal" : "Create a goal", "Collection intention", body, footer, "k-gl-dialog");
    KOS.ui.openDialog(overlay, { label: existing ? "Edit Collection goal" : "Create Collection goal" });
    titleIn.focus();
  }
  KOS.goalEditor = goalEditor;

  /* ---------------- the view (Planner, frame 11h language) ---------------- */
  var TABS = [["active", "Active"], ["completed", "Completed"], ["failed", "Failed / expired"]];
  function deadlineChip(g) {
    if (!g.deadline) return null;
    var d = new Date(g.deadline + "T12:00:00"), days = Math.round((d - new Date(todayISO() + "T12:00:00")) / 86400000), text, tone = null;
    if (g._status === "completed") text = "Met " + new Date(g.completedAt || Date.now()).toLocaleDateString(undefined, { day: "numeric", month: "short" });
    else if (days < 0) { text = "Expired " + (-days) + "d ago"; tone = "danger"; }
    else if (days === 0) { text = "Due today"; tone = "soon"; }
    else if (days <= 14) { text = days + "d left"; tone = "soon"; }
    else text = "Due " + d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
    return el("span", { class: "k-mchip", "data-ui": "goal.deadline", "data-tone": tone, text: text });
  }
  function progressText(g) {
    if (g.type === "spend-below") return g._unit + g._current + " spent · cap " + g._unit + g._target;
    return g._current + " / " + g._target + (g._unit ? " " + g._unit : "");
  }
  function goalCard(g, rerender) {
    var d = typeDef(g.type);
    var bar = el("div", { class: "k-bar k-bar--6", "data-ui": "goal.bar", role: "img", "aria-label": g._pct + "% of the way" }, [el("i")]);
    bar.style.setProperty("--p", g._pct + "%");
    var actions = el("div", { class: "k-gl-card-actions", "data-ui": "goal.actions" });
    function act(text, onclick, hook) {
      return el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": hook || null, text: text, onclick: onclick });
    }
    if (g.kind === "manual" && g._status === "active") {
      actions.appendChild(el("div", { class: "k-gl-step", "data-ui": "goal.step", role: "group", "aria-label": "Adjust manual progress" }, [
        act("−1", function () { nudge(g.id, -1); rerender(); }),
        act("+1", function () { nudge(g.id, 1); rerender(); })
      ]));
      actions.appendChild(act("Mark complete", function () { update(g.id, { current: g.target }); rerender(); }));
    }
    if (g._status === "active") actions.appendChild(act("End goal", function () { update(g.id, { failedManual: true, failedAt: Date.now(), status: "failed" }); rerender(); }));
    else actions.appendChild(act("Reopen", function () { reopen(g.id); rerender(); }));
    actions.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "goal.edit", text: "Edit", onclick: function () { goalEditor(g, rerender); } }));
    return el("article", { class: "k-gl-card", "data-ui": "goal.card", "data-status": g._status }, [
      el("span", { class: "k-gl-signal", "aria-hidden": "true", text: d.icon }),
      el("div", { class: "k-gl-card-main" }, [
        el("div", { class: "k-gl-overline" }, [
          el("span", { class: "k-mchip", "data-tone": d.auto ? "auto" : "manual", text: d.auto ? "Automatic" : "Manual" }),
          el("span", { class: "k-gl-type", text: d.label }),
          deadlineChip(g)
        ].filter(Boolean)),
        el("h3", { class: "k-gl-title", text: g.title }),
        g.description ? el("p", { class: "k-gl-detail", text: g.description }) : null,
        g._meta ? el("div", { class: "k-gl-meta k-muted", text: g._meta }) : null,
        el("div", { class: "k-gl-progress" }, [
          el("b", { text: progressText(g) }), el("span", { class: "k-mono", text: g._pct + "%" })
        ]),
        bar
      ].filter(Boolean)),
      actions
    ]);
  }

  KOS.views.goals = function (main) {
    KOS.shell.tree("none");
    main.appendChild(KOS.ui.pageHeader({
      kicker: "標 · The intentions",
      title: "Collection Goals",
      sub: "Set an outcome once. Kurenai follows the Collection data it can measure and leaves the rest to you.",
      actions: [KOS.collectionWorkspaceTabs("planner", "goals")]
    }));
    /* read without creating (render purity); a tab change writes it */
    var media = store.state.media;
    var tab = media && ["active", "completed", "failed"].indexOf(media.goalsTab) !== -1 ? media.goalsTab : "active";
    var body = el("div", { class: "k-gl", "data-ui": "goal.workspace" }); main.appendChild(body);
    function rerender() { KOS.show("goals", undefined, { _nav: true }); }

    compute(function (err, list) {
      if (err) body.appendChild(KOS.ui.emptyState({ compact: true, body: "Goals could not read part of the Collection: " + err.message }));
      var groups = { active: [], completed: [], failed: [] };
      (list || []).forEach(function (g) { (groups[g._status] || groups.active).push(g); });
      var active = groups.active, avg = active.length ? Math.round(active.reduce(function (n, g) { return n + g._pct; }, 0) / active.length) : 0;
      var dueSoon = active.filter(function (g) { return g.deadline && g.deadline >= todayISO() && (new Date(g.deadline + "T12:00:00") - new Date(todayISO() + "T12:00:00")) / 86400000 <= 14; }).length;
      /* a zero figure is dropped (invariant 77) */
      var metrics = [[active.length, "Active"], [dueSoon, "Due soon"], [groups.completed.length, "Completed"], [groups.failed.length, "Failed / expired"]]
        .filter(function (m) { return m[0]; })
        .map(function (m) { return el("div", { class: "k-mx-fig", "data-ui": "goal.metric" }, [el("dt", { text: m[1] }), el("dd", {}, [el("b", { text: String(m[0]) })])]); });
      body.appendChild(el("section", { class: "k-gl-overview", "data-ui": "goal.overview" + (metrics.length ? "" : " goal.no-metrics"), "aria-label": "Goal summary" }, [
        el("span", { class: "k-gl-mark", lang: "ja", "aria-hidden": "true", text: "標" }),
        el("div", { class: "k-gl-lead" }, [
          el("b", { text: active.length ? active.length + " intention" + (active.length === 1 ? " in motion" : "s in motion") : "No active intention" }),
          el("span", { class: "k-muted", text: active.length ? "Average progress is " + avg + "% across the current campaign." : "Create one outcome and choose whether the vault or you will update it." })
        ]),
        metrics.length ? el("dl", { class: "k-gl-figs" }, metrics) : null
      ].filter(Boolean)));

      var tabs = KOS.medview.addHook(KOS.ui.tabs(TABS.map(function (t) {
        return { label: t[1], active: tab === t[0], count: groups[t[0]].length || null, hook: "ui.tab goal.tab",
          onSelect: function () {
            if (tab === t[0]) return;
            store.state.media = store.state.media || {};
            store.state.media.goalsTab = t[0]; store.save(); rerender();
          } };
      }), { variant: "card", label: "Goal status" }), "goal.tabs");
      body.appendChild(el("div", { class: "k-gl-bar", "data-ui": "goal.commandbar" }, [
        tabs,
        el("span", { class: "k-gl-integrity k-muted", "data-ui": "goal.integrity", text: "Activity pays once · goal completion never duplicates Governor rewards" }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "goal.new", text: "+ New goal", onclick: function () { goalEditor(null, rerender); } })
      ]));
      var shown = groups[tab];
      if (!shown.length) {
        body.appendChild(KOS.medview.addHook(KOS.ui.emptyState({
          compact: true,
          mark: tab === "completed" ? "✓" : tab === "failed" ? "◷" : "標",
          title: tab === "active" ? "Choose the next finish line" : "Nothing in this view",
          body: tab === "active" ? "No active goals. Create a measurable target or a manual intention."
            : tab === "completed" ? "Completed goals collect here with their final progress intact."
              : "No goals have failed or expired."
          /* the command bar's "New goal" is the one create control */
        }), "goal.empty"));
        return;
      }
      var grid = el("div", { class: "k-gl-grid", "data-ui": "goal.grid" });
      shown.sort(function (a, b) {
        if (tab === "active") return (a.deadline || "9999") < (b.deadline || "9999") ? -1 : b._pct - a._pct;
        return (b.completedAt || b.failedAt || 0) - (a.completedAt || a.failedAt || 0);
      });
      shown.forEach(function (g) { grid.appendChild(goalCard(g, rerender)); });
      body.appendChild(grid);
    });
  };
})();
