/* Kurenai OS — modules/goals.js
   Collection Goals v2: a local intention layer over the media vault.

   Automatic goals READ the existing vault, custom lists and Budget Planner.
   They never duplicate media state, call a provider, or mutate a vault entry.

   GOVERNOR BOUNDARY: Collection activity already pays through its canonical
   media session. Goal completion is recorded once in completionLedger but
   never creates a second session or payout. This is the anti-farming rule. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;
  var MODULES = [
    { id: "", label: "All media" },
    { id: "anime", label: "Anime" },
    { id: "books", label: "Books" },
    { id: "vn", label: "Visual novels" },
    { id: "game", label: "Games" }
  ];
  var TYPES = [
    { id: "titles-completed", label: "Complete a number of titles", icon: "✓", auto: true, module: true },
    { id: "episodes-watched", label: "Watch episodes", icon: "映", auto: true },
    { id: "chapters-read", label: "Read chapters", icon: "頁", auto: true },
    { id: "volumes-read", label: "Read volumes", icon: "冊", auto: true },
    { id: "specific-title", label: "Complete a specific title", icon: "◎", auto: true, linked: true },
    { id: "finish-series", label: "Finish a series", icon: "終", auto: true, linked: true },
    { id: "filtered-completed", label: "Complete titles from a list, tag, or genre", icon: "篩", auto: true, module: true, filter: true },
    { id: "spend-below", label: "Spend below a set amount", icon: "◈", auto: true, inverse: true },
    { id: "library-size", label: "Grow the collection", icon: "蔵", auto: true, module: true },
    { id: "favourites", label: "Enshrine favourites", icon: "祠", auto: true },
    { id: "purchases", label: "Complete purchases", icon: "包", auto: true },
    { id: "game-hours", label: "Play a number of hours", icon: "時", auto: true },
    { id: "routes-cleared", label: "Clear visual-novel routes", icon: "路", auto: true },
    { id: "custom-manual", label: "Custom manual goal", icon: "標", auto: false }
  ];
  var LEGACY = {
    "anime-completed": ["titles-completed", "anime"],
    "books-completed": ["titles-completed", "books"],
    "vn-completed": ["titles-completed", "vn"],
    "game-completed": ["titles-completed", "game"],
    "all-completed": ["titles-completed", ""],
    "anime-episodes": ["episodes-watched", "anime"],
    "books-volumes": ["volumes-read", "books"],
    "all-library": ["library-size", ""],
    "genre": ["filtered-completed", ""],
    "purchases": ["purchases", ""],
    "favourites": ["favourites", ""]
  };

  function typeDef(id) {
    for (var i = 0; i < TYPES.length; i++) if (TYPES[i].id === id) return TYPES[i];
    return TYPES[TYPES.length - 1];
  }
  function moduleLabel(id) {
    for (var i = 0; i < MODULES.length; i++) if (MODULES[i].id === (id || "")) return MODULES[i].label;
    return "All media";
  }
  function cleanDate(v) { return /^\d{4}-\d{2}-\d{2}$/.test(String(v || "")) ? String(v) : null; }
  function num(v, fallback, min) {
    v = Number(v);
    return isFinite(v) ? Math.max(min == null ? 0 : min, Math.round(v * 100) / 100) : fallback;
  }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function monthEndISO() {
    var d = new Date(), end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return end.getFullYear() + "-" + String(end.getMonth() + 1).padStart(2, "0") + "-" + String(end.getDate()).padStart(2, "0");
  }

  function normaliseGoal(raw) {
    raw = raw || {};
    var legacy = LEGACY[raw.metric] || null;
    var metricIsType = TYPES.some(function (d) { return d.id === raw.metric; });
    var type = raw.type || (raw.kind === "manual" ? "custom-manual" : legacy ? legacy[0] : metricIsType ? raw.metric : "titles-completed");
    if (!typeDef(type) || !TYPES.some(function (d) { return d.id === type; })) type = "custom-manual";
    var def = typeDef(type);
    var module = raw.module || (legacy && legacy[1]) || "";
    if (!MODULES.some(function (m) { return m.id === module; })) module = "";
    var filterKind = raw.filterKind || (raw.metric === "genre" ? "genre" : "");
    var filterValue = raw.filterValue || raw.genre || "";
    return {
      id: raw.id,
      title: String(raw.title || "Untitled goal").trim().slice(0, 160),
      description: String(raw.description != null ? raw.description : raw.detail || "").trim().slice(0, 700),
      detail: String(raw.description != null ? raw.description : raw.detail || "").trim().slice(0, 700),
      notes: String(raw.notes || "").trim().slice(0, 2000),
      type: type,
      kind: def.auto ? "auto" : "manual",
      metric: def.auto ? type : null,
      module: module || null,
      linkedEntryId: raw.linkedEntryId == null || raw.linkedEntryId === "" ? null : Number(raw.linkedEntryId),
      filterKind: ["genre", "tag", "list"].indexOf(filterKind) !== -1 ? filterKind : null,
      filterValue: String(filterValue || "").trim().slice(0, 100),
      genre: filterKind === "genre" ? String(filterValue || "").trim().slice(0, 100) : null,
      target: num(raw.target, 1, 1),
      current: def.auto ? 0 : num(raw.current, 0, 0),
      startDate: cleanDate(raw.startDate) || (raw.createdAt ? new Date(raw.createdAt).toISOString().slice(0, 10) : todayISO()),
      deadline: cleanDate(raw.deadline),
      status: ["active", "completed", "failed"].indexOf(raw.status) !== -1 ? raw.status : "active",
      progress: num(raw.progress, 0, 0),
      lastCurrent: num(raw.lastCurrent, def.auto ? 0 : raw.current || 0, 0),
      lastMeasuredAt: raw.lastMeasuredAt || null,
      createdAt: raw.createdAt || Date.now(),
      updatedAt: raw.updatedAt || raw.createdAt || Date.now(),
      completedAt: raw.completedAt || null,
      failedAt: raw.failedAt || null,
      failedManual: !!raw.failedManual,
      completionRecordedAt: raw.completionRecordedAt || null
    };
  }

  function data() {
    var s = store.state.goals = store.state.goals || { v: 2, nextId: 1, items: [], completionLedger: {} };
    if (!Array.isArray(s.items)) s.items = [];
    if (!s.nextId) s.nextId = 1;
    if (!s.completionLedger || typeof s.completionLedger !== "object") s.completionLedger = {};
    if (s.v !== 2) {
      s.items = s.items.map(normaliseGoal);
      s.v = 2;
      store.save();
    }
    return s;
  }
  function all() { return data().items; }
  function get(id) { return all().filter(function (g) { return g.id === Number(id); })[0] || null; }

  function add(fields) {
    var s = data(), base = Object.assign({}, fields || {});
    base.id = s.nextId++;
    base.createdAt = Date.now();
    base.updatedAt = base.createdAt;
    base.status = "active";
    if ((base.type === "spend-below" || base.metric === "spend-below") && !base.deadline) base.deadline = monthEndISO();
    var g = normaliseGoal(base);
    s.items.push(g);
    store.save();
    return g;
  }
  function update(id, patch) {
    var s = data(), idx = s.items.findIndex(function (g) { return g.id === Number(id); });
    if (idx < 0) return null;
    patch = Object.assign({}, patch || {});
    if (patch.detail !== undefined && patch.description === undefined) patch.description = patch.detail;
    var next = normaliseGoal(Object.assign({}, s.items[idx], patch, { id: s.items[idx].id, updatedAt: Date.now() }));
    next.completionRecordedAt = s.items[idx].completionRecordedAt || next.completionRecordedAt;
    s.items[idx] = next;
    store.save();
    return next;
  }
  function remove(id) {
    var s = data();
    s.items = s.items.filter(function (g) { return g.id !== Number(id); });
    store.save();
  }
  function nudge(id, delta) {
    var g = get(id);
    if (!g || g.kind !== "manual") return null;
    return update(g.id, { current: Math.max(0, (g.current || 0) + Number(delta || 0)) });
  }
  function reopen(id) {
    return update(id, { status: "active", completedAt: null, failedAt: null, failedManual: false });
  }

  function purchasedItems() {
    var w = store.state.wishlist;
    return w && Array.isArray(w.items) ? w.items.filter(function (it) { return it.status === "purchased"; }) : [];
  }
  function spendInRange(g) {
    var start = g.startDate ? new Date(g.startDate + "T00:00:00").getTime() : -Infinity;
    var end = g.deadline ? new Date(g.deadline + "T23:59:59").getTime() : Infinity;
    return purchasedItems().reduce(function (sum, it) {
      var ts = it.purchasedAt || 0;
      return ts >= start && ts <= end ? sum + (Number(it.price) || 0) : sum;
    }, 0);
  }
  function filterQuery(g) {
    var q = { status: "completed", sort: "title" };
    if (g.module) q.module = g.module;
    if (g.filterKind === "genre") q.genre = g.filterValue;
    if (g.filterKind === "tag") q.tag = g.filterValue;
    if (g.filterKind === "list") q.customList = g.filterValue;
    return q;
  }
  function measureGoal(g, agg, cb) {
    var mods = agg.modules || {}, m = function (id) { return mods[id] || {}; };
    var result = { current: 0, target: g.target, unit: "", meta: "" };
    switch (g.type) {
      case "titles-completed":
        result.current = g.module ? (m(g.module).completed || 0) : ["anime", "books", "vn", "game"].reduce(function (n, id) { return n + (m(id).completed || 0); }, 0);
        result.unit = "titles"; result.meta = moduleLabel(g.module); cb(result); return;
      case "episodes-watched": result.current = m("anime").episodes || 0; result.unit = "episodes"; cb(result); return;
      case "chapters-read": result.current = m("books").episodes || 0; result.unit = "chapters"; cb(result); return;
      case "volumes-read": result.current = m("books").volumesRead || 0; result.unit = "volumes"; cb(result); return;
      case "library-size": result.current = g.module ? (m(g.module).total || 0) : agg.total || 0; result.unit = "titles"; result.meta = moduleLabel(g.module); cb(result); return;
      case "favourites": result.current = agg.favourites || 0; result.unit = "enshrined"; cb(result); return;
      case "purchases": result.current = purchasedItems().length; result.unit = "purchases"; cb(result); return;
      case "game-hours": result.current = m("game").episodes || 0; result.unit = "hours"; cb(result); return;
      case "routes-cleared": result.current = m("vn").episodes || 0; result.unit = "routes"; cb(result); return;
      case "spend-below":
        result.current = Math.round(spendInRange(g) * 100) / 100;
        result.unit = (store.state.wishlist && store.state.wishlist.budget && store.state.wishlist.budget.currency) || "£";
        result.meta = result.unit + Math.max(0, g.target - result.current).toFixed(2).replace(/\.00$/, "") + " remaining";
        cb(result); return;
      case "filtered-completed":
        KOS.mediadb.query(filterQuery(g), function (err, rows) {
          result.current = err ? 0 : rows.length;
          result.unit = "titles";
          result.meta = (g.filterKind ? g.filterKind + ": " : "") + (g.filterValue || "Any") + (g.module ? " · " + moduleLabel(g.module) : "");
          cb(result);
        }); return;
      case "specific-title":
      case "finish-series":
        if (!g.linkedEntryId) { result.meta = "No title linked"; cb(result); return; }
        KOS.mediadb.get(g.linkedEntryId, function (err, entry) {
          if (!entry || err) { result.meta = "Linked title is no longer in the vault"; cb(result); return; }
          result.meta = entry.title;
          if (g.type === "specific-title") {
            result.current = entry.status === "completed" ? 1 : 0; result.target = 1; result.unit = "title";
          } else if (entry.progress && entry.progress.total) {
            result.current = entry.progress.current || 0; result.target = entry.progress.total;
            result.unit = entry.progress.unit || (entry.module === "anime" ? "episodes" : entry.module === "books" ? "chapters" : "steps");
            if (entry.status === "completed") result.current = result.target;
          } else {
            result.current = entry.status === "completed" ? 1 : 0; result.target = 1; result.unit = "series";
          }
          cb(result);
        }); return;
      default:
        result.current = g.current || 0; result.unit = "steps"; cb(result);
    }
  }

  function derive(g, measure, today) {
    if (g.failedManual) return "failed";
    if (g.status === "completed" && g.completedAt) return "completed";
    if (g.type === "spend-below") {
      if (measure.current > measure.target) return "failed";
      if (g.deadline && g.deadline < today) return "completed";
      return "active";
    }
    if (measure.current >= measure.target) return "completed";
    if (g.deadline && g.deadline < today) return "failed";
    return "active";
  }
  function compute(cb) {
    KOS.mediadb.stats(function (err, agg) {
      agg = agg || { total: 0, modules: {}, favourites: 0 };
      var rows = all(), out = new Array(rows.length), pending = rows.length, dirty = false, today = todayISO();
      if (!pending) { cb(null, []); return; }
      rows.forEach(function (g, index) {
        measureGoal(g, agg, function (measurement) {
          var target = Math.max(1, Number(measurement.target) || g.target || 1);
          var status = derive(g, measurement, today);
          var pct = g.type === "spend-below"
            ? Math.max(0, Math.min(100, Math.round(100 * (1 - measurement.current / target))))
            : Math.max(0, Math.min(100, Math.round(100 * measurement.current / target)));
          if (status === "completed" && !g.completedAt) {
            g.status = "completed"; g.completedAt = Date.now(); g.failedAt = null;
            if (!data().completionLedger[g.id]) {
              data().completionLedger[g.id] = { recordedAt: g.completedAt, type: g.type, payout: "activity-only" };
            }
            g.completionRecordedAt = data().completionLedger[g.id].recordedAt;
            dirty = true;
          } else if (status === "failed" && g.status !== "failed") {
            g.status = "failed"; g.failedAt = g.failedAt || Date.now(); dirty = true;
          } else if (status === "active" && g.status !== "active") {
            g.status = "active"; g.completedAt = null; g.failedAt = null; dirty = true;
          }
          if (g.lastCurrent !== measurement.current || g.progress !== pct) {
            g.lastCurrent = measurement.current; g.progress = pct; g.lastMeasuredAt = Date.now(); dirty = true;
          }
          out[index] = Object.assign({}, g, {
            _current: measurement.current, _target: target, _unit: measurement.unit,
            _meta: measurement.meta, _status: status, _pct: pct,
            _rewardSafe: !!data().completionLedger[g.id]
          });
          pending--;
          if (!pending) { if (dirty) store.save(); cb(err || null, out); }
        });
      });
    });
  }

  function metricLabel(g) {
    var d = typeDef(g.type || (LEGACY[g.metric] || ["custom-manual"])[0]);
    if (g.type === "filtered-completed") return (g.filterKind || "filter") + ": " + (g.filterValue || "not set");
    if (g.module && d.module) return d.label + " · " + moduleLabel(g.module);
    return d.label;
  }
  KOS.goals = {
    all: all, get: get, add: add, update: update, remove: remove, nudge: nudge, reopen: reopen,
    compute: compute, types: function () { return TYPES.slice(); },
    metrics: function () { return TYPES.filter(function (d) { return d.auto; }).map(function (d) { return { id: d.id, label: d.label }; }); },
    metricLabel: metricLabel, normalise: normaliseGoal
  };

  /* ---------------- modal editor ---------------- */
  function field(label, input, cls) {
    return el("label", { class: "med-field" + (cls ? " " + cls : "") }, [el("span", { class: "k", text: label }), input]);
  }
  function section(title, copy, kids) {
    return el("section", { class: "goal-form-section" }, [
      el("div", { class: "goal-form-section-head" }, [el("b", { text: title }), copy ? el("span", { text: copy }) : null].filter(Boolean)),
      el("div", { class: "goal-form-grid" }, kids)
    ]);
  }
  function goalEditor(existing, done) {
    var g = existing ? normaliseGoal(existing) : normaliseGoal({ type: "titles-completed", target: 5, startDate: todayISO() });
    var overlay = KOS.medview.modalOverlay();
    var titleIn = el("input", { type: "text", class: "todo-in", maxlength: "160", value: existing ? g.title : "", placeholder: "Name this intention" });
    var descIn = el("textarea", { class: "todo-in", rows: "3", maxlength: "700", placeholder: "What are you trying to change or finish?" }); descIn.value = g.description || "";
    var notesIn = el("textarea", { class: "todo-in", rows: "4", maxlength: "2000", placeholder: "Private notes, rules, or context (optional)" }); notesIn.value = g.notes || "";
    var typeSel = el("select", { class: "todo-in" }, TYPES.map(function (d) { var o = el("option", { value: d.id, text: d.label }); if (g.type === d.id) o.selected = true; return o; }));
    var moduleSel = el("select", { class: "todo-in" }, MODULES.map(function (m) { var o = el("option", { value: m.id, text: m.label }); if ((g.module || "") === m.id) o.selected = true; return o; }));
    var targetIn = el("input", { type: "number", class: "todo-in", min: "1", step: "1", value: String(g.target || 1) });
    var currentIn = el("input", { type: "number", class: "todo-in", min: "0", step: "1", value: String(g.current || 0) });
    var startIn = el("input", { type: "date", class: "todo-in", value: g.startDate || todayISO() });
    var deadlineIn = el("input", { type: "date", class: "todo-in", value: g.deadline || "" });
    var filterKindSel = el("select", { class: "todo-in" }, [
      el("option", { value: "list", text: "Custom list" }), el("option", { value: "tag", text: "Tag" }), el("option", { value: "genre", text: "Genre" })
    ]); filterKindSel.value = g.filterKind || "list";
    var filterListId = "goal-filter-values-" + (g.id || "new") + "-" + Date.now();
    var filterValueIn = el("input", { type: "text", class: "todo-in", list: filterListId, value: g.filterValue || "", placeholder: "Choose or type a value" });
    var filterDatalist = el("datalist", { id: filterListId });
    var linkedSearch = el("input", { type: "search", class: "todo-in", placeholder: "Search the vault by title" });
    var linkedResults = el("select", { class: "todo-in goal-link-results", "aria-label": "Linked title" }, [el("option", { value: "", text: "No title selected" })]);
    var linkedStatus = el("span", { class: "sub goal-link-status", text: "Search locally, then choose one result." });
    var searchBtn = el("button", { type: "button", class: "btn", text: "Find title", onclick: searchTitles });

    var typeField = field("Goal type", typeSel, "goal-type-field");
    var moduleField = field("Media category", moduleSel, "goal-module-field");
    var targetField = field("Target", targetIn, "goal-target-field");
    var currentField = field("Current value", currentIn, "goal-current-field");
    var filterWrap = el("div", { class: "goal-filter-wrap goal-span-2" }, [
      field("Filter", filterKindSel), field("Value", filterValueIn), filterDatalist
    ]);
    var linkWrap = el("div", { class: "goal-link-wrap goal-span-2" }, [
      field("Find a title", el("div", { class: "goal-link-search" }, [linkedSearch, searchBtn])),
      field("Linked title", linkedResults), linkedStatus
    ]);
    var scheduleCopy = el("p", { class: "goal-date-note", text: "A deadline moves an unfinished goal to Failed / expired. Spending goals settle when their deadline passes." });
    var body = el("div", { class: "goal-editor-body" }, [
      section("Identity", "Give the goal a clear outcome.", [field("Title", titleIn, "goal-span-2"), field("Description", descIn, "goal-span-2")]),
      section("Measure", "Automatic goals read local Collection data; manual goals expose their counter.", [typeField, moduleField, targetField, currentField, filterWrap, linkWrap]),
      section("Schedule", "Choose the window this intention belongs to.", [field("Start date", startIn), field("Deadline", deadlineIn), scheduleCopy]),
      section("Notes", "Private context that stays with the goal.", [field("Notes", notesIn, "goal-span-2")])
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
      targetField.querySelector(".k").textContent = d.inverse ? "Spending cap" : "Target";
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

    var footer = el("div", { class: "goal-modal-foot" }, [
      existing ? el("button", { class: "btn danger goal-modal-delete", text: "Delete goal", onclick: function () {
        KOS.ui.confirm({ title: "Delete this goal?", danger: true, confirm: "Delete", body: "“" + existing.title + "” will be removed. Any completed-activity receipt stays in the anti-farming ledger." }, function () {
          remove(existing.id); overlay.close(); if (done) done();
        });
      } }) : el("span"),
      el("div", { class: "goal-modal-actions" }, [
        el("button", { class: "btn", text: "Cancel", onclick: overlay.close }),
        el("button", { class: "btn primary", text: existing ? "Save changes" : "Create goal", onclick: save })
      ])
    ]);
    overlay.appendChild(el("div", { class: "modal goal-modal goal-modal-v2", role: "dialog", "aria-modal": "true", "aria-label": existing ? "Edit Collection goal" : "Create Collection goal" }, [
      el("div", { class: "modal-h goal-modal-head" }, [
        el("div", {}, [el("span", { class: "goal-modal-kicker", text: "Collection intention" }), el("b", { text: existing ? "Edit goal" : "Create a goal" })]),
        el("button", { class: "mini-btn", text: "✕", "aria-label": "Close goal editor", onclick: overlay.close })
      ]),
      body, footer
    ]));
    KOS.ui.openDialog(overlay);
    titleIn.focus();
  }
  KOS.goalEditor = goalEditor;

  /* ---------------- view ---------------- */
  function deadlineChip(g) {
    if (!g.deadline) return null;
    var d = new Date(g.deadline + "T12:00:00"), days = Math.round((d - new Date(todayISO() + "T12:00:00")) / 86400000), text, cls = "";
    if (g._status === "completed") text = "Met " + new Date(g.completedAt || Date.now()).toLocaleDateString(undefined, { day: "numeric", month: "short" });
    else if (days < 0) { text = "Expired " + (-days) + "d ago"; cls = " overdue"; }
    else if (days === 0) { text = "Due today"; cls = " soon"; }
    else if (days <= 14) { text = days + "d left"; cls = " soon"; }
    else text = "Due " + d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
    return el("span", { class: "goal-deadline" + cls, text: text });
  }
  function progressText(g) {
    if (g.type === "spend-below") return g._unit + g._current + " spent · cap " + g._unit + g._target;
    return g._current + " / " + g._target + (g._unit ? " " + g._unit : "");
  }
  function goalCard(g, rerender) {
    var d = typeDef(g.type), card = el("article", { class: "goal-card-v2 " + g._status });
    card.appendChild(el("div", { class: "goal-card-signal", "aria-hidden": "true", text: d.icon }));
    card.appendChild(el("div", { class: "goal-card-main" }, [
      el("div", { class: "goal-card-overline" }, [
        el("span", { class: "goal-kind-chip " + (d.auto ? "is-auto" : "is-manual"), text: d.auto ? "Automatic" : "Manual" }),
        el("span", { class: "goal-type-label", text: d.label }),
        deadlineChip(g)
      ].filter(Boolean)),
      el("h3", { class: "goal-title", text: g.title }),
      g.description ? el("p", { class: "goal-detail", text: g.description }) : null,
      g._meta ? el("div", { class: "goal-link-meta", text: g._meta }) : null,
      el("div", { class: "goal-progress-head" }, [
        el("b", { text: progressText(g) }), el("span", { text: g._pct + "%" })
      ]),
      el("div", { class: "goal-bar " + (g._status === "completed" ? "done" : g._status === "failed" ? "failed" : "") }, [
        el("span", { class: "goal-bar-fill", style: "width:" + g._pct + "%" })
      ])
    ].filter(Boolean)));
    var actions = el("div", { class: "goal-actions" });
    if (g.kind === "manual" && g._status === "active") {
      actions.appendChild(el("div", { class: "goal-step", role: "group", "aria-label": "Adjust manual progress" }, [
        el("button", { class: "mini-btn", text: "−1", onclick: function () { nudge(g.id, -1); rerender(); } }),
        el("button", { class: "mini-btn", text: "+1", onclick: function () { nudge(g.id, 1); rerender(); } })
      ]));
      actions.appendChild(el("button", { class: "mini-btn", text: "Mark complete", onclick: function () { update(g.id, { current: g.target }); rerender(); } }));
    }
    if (g._status === "active") actions.appendChild(el("button", { class: "mini-btn", text: "End goal", onclick: function () { update(g.id, { failedManual: true, failedAt: Date.now(), status: "failed" }); rerender(); } }));
    else actions.appendChild(el("button", { class: "mini-btn", text: "Reopen", onclick: function () { reopen(g.id); rerender(); } }));
    actions.appendChild(el("button", { class: "mini-btn goal-edit", text: "Edit", onclick: function () { goalEditor(g, rerender); } }));
    card.appendChild(actions);
    return card;
  }

  KOS.views.goals = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    main.appendChild(KOS.collectionCrumbs("Planner", "Goals"));
    var workspaceTabs = KOS.collectionWorkspaceTabs("planner", "goals");
    workspaceTabs.classList.add("profile-workspace-tabs");
    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "標 · The intentions" }),
        el("h1", { text: "Collection Goals" }),
        el("div", { class: "dh-sub" }, [el("span", { class: "board", text: "Set an outcome once. Kurenai follows the local Collection data that can be measured and leaves the rest in your hands." })])
      ]), workspaceTabs
    ]));
    var pref = store.state.media = store.state.media || {};
    pref.goalsTab = ["active", "completed", "failed"].indexOf(pref.goalsTab) !== -1 ? pref.goalsTab : "active";
    var body = el("div", { class: "goals-workspace" }); main.appendChild(body);
    function rerender() { KOS.show("goals", undefined, { _nav: true }); }

    compute(function (err, list) {
      if (err) body.appendChild(el("div", { class: "gov-banner bad", text: "Goals could not read part of the Collection: " + err.message }));
      var groups = { active: [], completed: [], failed: [] };
      (list || []).forEach(function (g) { (groups[g._status] || groups.active).push(g); });
      var active = groups.active, avg = active.length ? Math.round(active.reduce(function (n, g) { return n + g._pct; }, 0) / active.length) : 0;
      var dueSoon = active.filter(function (g) { return g.deadline && g.deadline >= todayISO() && (new Date(g.deadline + "T12:00:00") - new Date(todayISO() + "T12:00:00")) / 86400000 <= 14; }).length;
      var summaryMetrics = [];
      if (active.length) summaryMetrics.push(summaryMetric(active.length, "Active"));
      if (dueSoon) summaryMetrics.push(summaryMetric(dueSoon, "Due soon"));
      if (groups.completed.length) summaryMetrics.push(summaryMetric(groups.completed.length, "Completed"));
      if (groups.failed.length) summaryMetrics.push(summaryMetric(groups.failed.length, "Failed / expired"));
      body.appendChild(el("section", { class: "goal-overview" + (summaryMetrics.length ? "" : " no-metrics"), "aria-label": "Goal summary" }, [
        el("div", { class: "goal-overview-lead" }, [
          el("span", { class: "goal-overview-mark", "aria-hidden": "true", text: "標" }),
          el("div", {}, [el("b", { text: active.length ? active.length + " intention" + (active.length === 1 ? " in motion" : "s in motion") : "No active intention" }),
            el("span", { text: active.length ? "Average progress is " + avg + "% across the current campaign." : "Create one outcome and choose whether the vault or you will update it." })])
        ]),
        summaryMetrics.length ? el("div", { class: "goal-summary-metrics", style: "--goal-metric-count:" + summaryMetrics.length }, summaryMetrics) : null
      ].filter(Boolean)));
      function summaryMetric(value, label) { return el("span", { class: "goal-summary-metric" }, [el("b", { text: String(value) }), el("small", { text: label })]); }

      var tabs = el("div", { class: "study-tabs goal-tabs", role: "tablist", "aria-label": "Goal status" });
      [["active", "Active"], ["completed", "Completed"], ["failed", "Failed / expired"]].forEach(function (t) {
        tabs.appendChild(el("button", { class: "study-tab" + (pref.goalsTab === t[0] ? " active" : ""), role: "tab", "aria-selected": pref.goalsTab === t[0] ? "true" : "false",
          onclick: function () { pref.goalsTab = t[0]; store.save(); rerender(); } }, [t[1], el("span", { class: "wl-tabcount", text: String(groups[t[0]].length) })]));
      });
      body.appendChild(el("div", { class: "goal-commandbar" }, [
        tabs,
        el("span", { class: "goal-integrity", text: "Activity pays once · goal completion never duplicates Governor rewards" }),
        el("button", { class: "btn primary", text: "+ New goal", onclick: function () { goalEditor(null, rerender); } })
      ]));
      var shown = groups[pref.goalsTab];
      if (!shown.length) {
        var copy = pref.goalsTab === "active" ? "No active goals. Create a measurable target or a manual intention."
          : pref.goalsTab === "completed" ? "Completed goals will collect here with their final progress intact."
            : "No goals have failed or expired.";
        body.appendChild(KOS.ui.emptyState({
          compact: true,
          className: "goal-empty-v2",
          mark: pref.goalsTab === "completed" ? "✓" : pref.goalsTab === "failed" ? "◷" : "標",
          title: pref.goalsTab === "active" ? "Choose the next finish line" : "Nothing in this view",
          body: copy,
          action: pref.goalsTab === "active" ? el("button", { class: "btn", text: "Create a goal", onclick: function () { goalEditor(null, rerender); } }) : null
        }));
        return;
      }
      var grid = el("div", { class: "goal-grid-v2" });
      shown.sort(function (a, b) {
        if (pref.goalsTab === "active") return (a.deadline || "9999") < (b.deadline || "9999") ? -1 : b._pct - a._pct;
        return (b.completedAt || b.failedAt || 0) - (a.completedAt || a.failedAt || 0);
      });
      shown.forEach(function (g) { grid.appendChild(goalCard(g, rerender)); });
      body.appendChild(grid);
    });
  };
})();
