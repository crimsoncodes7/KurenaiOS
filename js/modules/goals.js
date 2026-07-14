/* Kurenai OS — modules/goals.js
   Build 3k — Collection Matrix Goals.

   Personal collecting / reading / watching goals. Two kinds:
     · manual — you set a target and nudge the counter yourself.
     · auto   — the target is measured against the vault + wishlist you
                already keep locally (titles completed, volumes owned, a
                genre count, purchases made, favourites enshrined, …). The
                value is COMPUTED on view from KOS.mediadb.stats — nothing
                is polled and nothing is stored twice.

   GOVERNOR BOUNDARY (deliberate, same rule as the Budget Planner): this
   module NEVER calls KOS.sessions.log / KOS.media.logActivity / the
   governor, and emits ZERO network. Hitting a goal is its own reward —
   it must not feed the XP/gold/HP/streak loop.

   Storage: KOS.store.state.goals (localStorage) — rides the standard
   backup because exportFull serialises the whole state object.            */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  /* ---------------- auto metrics ----------------
     Each maps a friendly label to a reader over the aggregate that
     KOS.mediadb.stats already produces (plus the local wishlist). `genre`
     is the one metric that needs an extra parameter. */
  var METRICS = [
    { id: "anime-completed", label: "Anime completed" },
    { id: "books-completed", label: "Books completed" },
    { id: "vn-completed", label: "Visual novels completed" },
    { id: "game-completed", label: "Games completed" },
    { id: "all-completed", label: "Titles completed (all media)" },
    { id: "anime-episodes", label: "Anime episodes logged" },
    { id: "books-volumes", label: "Physical volumes owned" },
    { id: "all-library", label: "Library size (all entries)" },
    { id: "genre", label: "Titles in a genre…", needsGenre: true },
    { id: "purchases", label: "Purchases made (Budget Planner)" },
    { id: "favourites", label: "Favourites enshrined" }
  ];
  function metricDef(id) { for (var i = 0; i < METRICS.length; i++) if (METRICS[i].id === id) return METRICS[i]; return null; }
  function metricLabel(g) {
    var d = metricDef(g.metric);
    if (!d) return "Custom";
    if (g.metric === "genre") return "“" + (g.genre || "?") + "” titles";
    return d.label;
  }

  function purchasedCount() {
    var w = store.state.wishlist;
    if (!w || !Array.isArray(w.items)) return 0;
    return w.items.filter(function (it) { return it.status === "purchased"; }).length;
  }
  function metricValue(g, agg) {
    var mod = function (m) { return (agg.modules && agg.modules[m]) || {}; };
    switch (g.metric) {
      case "anime-completed": return mod("anime").completed || 0;
      case "books-completed": return mod("books").completed || 0;
      case "vn-completed": return mod("vn").completed || 0;
      case "game-completed": return mod("game").completed || 0;
      case "all-completed":
        return ["anime", "books", "vn", "game"].reduce(function (n, m) { return n + (mod(m).completed || 0); }, 0);
      case "anime-episodes": return mod("anime").episodes || 0;
      case "books-volumes": return mod("books").volumesOwned || 0;
      case "all-library": return agg.total || 0;
      case "genre": return (agg.genres && agg.genres[g.genre]) || 0;
      case "purchases": return purchasedCount();
      case "favourites": return agg.favourites || 0;
      default: return 0;
    }
  }

  /* ---------------- data layer (pure — no governor, ever) ---------------- */
  function data() {
    var s = store.state.goals = store.state.goals || { nextId: 1, items: [] };
    if (!Array.isArray(s.items)) s.items = [];
    if (!s.nextId) s.nextId = 1;
    return s;
  }
  function all() { return data().items; }
  function get(id) { return all().filter(function (g) { return g.id === id; })[0] || null; }

  function add(fields) {
    var s = data();
    var g = {
      id: s.nextId++,
      title: fields.title || "Untitled goal",
      detail: fields.detail || "",
      deadline: fields.deadline || null,
      kind: fields.kind === "auto" ? "auto" : "manual",
      metric: fields.kind === "auto" ? (fields.metric || "all-completed") : null,
      genre: fields.kind === "auto" && fields.metric === "genre" ? (fields.genre || "") : null,
      target: Math.max(1, parseInt(fields.target, 10) || 1),
      current: fields.kind === "auto" ? 0 : Math.max(0, parseInt(fields.current, 10) || 0),
      status: "active",
      createdAt: Date.now(),
      completedAt: null,
      failedAt: null
    };
    s.items.push(g);
    store.save();
    return g;
  }
  function update(id, patch) {
    var g = get(id);
    if (!g) return;
    Object.keys(patch).forEach(function (k) { g[k] = patch[k]; });
    store.save();
  }
  function remove(id) {
    var s = data();
    s.items = s.items.filter(function (g) { return g.id !== id; });
    store.save();
  }
  function nudge(id, delta) {
    var g = get(id);
    if (!g || g.kind !== "manual") return;
    g.current = Math.max(0, (g.current || 0) + delta);
    store.save();
  }

  /* Derive the live status of one goal against a measured current value.
     completed/failed timestamps are persisted the first time they trip so
     the Completed / Failed lists can show when it happened. Manual "give
     up" (failedManual) and reopen are respected. */
  function derive(g, current, todayISO) {
    if (g.failedManual) return "failed";
    if (current >= g.target) return "completed";
    if (g.status === "completed" && g.completedAt) return "completed";   // sticky once earned
    if (g.deadline && g.deadline < todayISO) return "failed";
    return "active";
  }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  /* Read the vault once, return each goal enriched with {_current,_status,
     _pct} and persist any newly-earned completed/failed stamp. */
  function compute(cb) {
    KOS.mediadb.stats(function (err, agg) {
      agg = agg || { total: 0, modules: {}, genres: {}, favourites: 0 };
      var ti = todayISO(), dirty = false;
      var out = all().map(function (g) {
        var cur = g.kind === "auto" ? metricValue(g, agg) : (g.current || 0);
        var st = derive(g, cur, ti);
        if (st === "completed" && !g.completedAt) { g.status = "completed"; g.completedAt = Date.now(); dirty = true; }
        else if (st === "failed" && g.status !== "failed") { g.status = "failed"; if (!g.failedAt) g.failedAt = Date.now(); dirty = true; }
        else if (st === "active" && g.status !== "active") { g.status = "active"; g.completedAt = null; g.failedAt = null; dirty = true; }
        return Object.assign({}, g, { _current: cur, _status: st, _pct: Math.min(100, Math.round(100 * cur / g.target)) });
      });
      if (dirty) store.save();
      cb(null, out);
    });
  }

  KOS.goals = {
    all: all, get: get, add: add, update: update, remove: remove, nudge: nudge,
    compute: compute, metrics: function () { return METRICS.slice(); },
    metricLabel: metricLabel
  };

  /* ---------------- editor modal ---------------- */
  function goalEditor(existing, done) {
    var g = existing || { kind: "manual", target: 1 };
    var overlay = KOS.medview.modalOverlay();

    var titleIn = el("input", { type: "text", class: "todo-in", placeholder: "Goal title — e.g. “Finish 12 visual novels this year”", value: g.title || "" });
    var detailIn = el("textarea", { class: "todo-in wl-notes-full", rows: "2", placeholder: "Why it matters, notes, anything (optional)…" }, [g.detail || ""]);
    var deadlineIn = el("input", { type: "date", class: "todo-in", value: g.deadline || "" });
    var targetIn = el("input", { type: "number", class: "todo-in", min: "1", step: "1", value: String(g.target || 1) });
    var currentIn = el("input", { type: "number", class: "todo-in", min: "0", step: "1", value: String(g.current || 0) });

    var metricSel = el("select", { class: "todo-in" }, METRICS.map(function (m) {
      var o = el("option", { value: m.id, text: m.label });
      if (g.metric === m.id) o.selected = true;
      return o;
    }));
    var genreIn = el("input", { type: "text", class: "todo-in", placeholder: "Genre / tag (e.g. Romance)", value: g.genre || "" });

    var kindManual = el("input", { type: "radio", name: "goal-kind" }); kindManual.checked = g.kind !== "auto";
    var kindAuto = el("input", { type: "radio", name: "goal-kind" }); kindAuto.checked = g.kind === "auto";

    var autoWrap = el("div", { class: "goal-auto-wrap" }, [
      el("label", { class: "med-field" }, [el("span", { class: "k", text: "Measure" }), metricSel]),
      el("label", { class: "med-field goal-genre-field" }, [el("span", { class: "k", text: "Genre" }), genreIn])
    ]);
    var manualWrap = el("label", { class: "med-field" }, [el("span", { class: "k", text: "Starting count" }), currentIn]);

    function syncKind() {
      var auto = kindAuto.checked;
      autoWrap.style.display = auto ? "" : "none";
      manualWrap.style.display = auto ? "none" : "";
      autoWrap.querySelector(".goal-genre-field").style.display = (auto && metricSel.value === "genre") ? "" : "none";
    }
    kindManual.addEventListener("change", syncKind);
    kindAuto.addEventListener("change", syncKind);
    metricSel.addEventListener("change", syncKind);

    var form = el("div", { class: "med-form goal-form" }, [
      el("label", { class: "med-field" }, [el("span", { class: "k", text: "Title" }), titleIn]),
      el("label", { class: "med-field" }, [el("span", { class: "k", text: "Details" }), detailIn]),
      el("div", { class: "goal-kind-pick" }, [
        el("label", { class: "med-impmode-opt" }, [kindManual, " Track it myself"]),
        el("label", { class: "med-impmode-opt" }, [kindAuto, " Track automatically"])
      ]),
      el("div", { class: "med-form-row" }, [
        el("label", { class: "med-field" }, [el("span", { class: "k", text: "Target" }), targetIn]),
        el("label", { class: "med-field" }, [el("span", { class: "k", text: "Deadline (optional)" }), deadlineIn])
      ]),
      autoWrap,
      manualWrap
    ]);

    overlay.appendChild(el("div", { class: "modal goal-modal" }, [
      el("div", { class: "modal-h" }, [
        el("b", { text: existing ? "Edit goal" : "New goal" }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", onclick: overlay.close })
      ]),
      form,
      el("div", { class: "lab-controls", style: "margin-top:12px" }, [
        el("button", { class: "btn primary", text: existing ? "Save goal" : "Create goal", onclick: function () {
          var title = titleIn.value.trim();
          if (!title) { KOS.ui.toast("Give the goal a title first.", true); return; }
          var fields = {
            title: title, detail: detailIn.value.trim(),
            deadline: deadlineIn.value || null,
            kind: kindAuto.checked ? "auto" : "manual",
            metric: metricSel.value, genre: genreIn.value.trim(),
            target: targetIn.value, current: currentIn.value
          };
          if (existing) {
            update(existing.id, {
              title: fields.title, detail: fields.detail, deadline: fields.deadline,
              kind: fields.kind,
              metric: fields.kind === "auto" ? fields.metric : null,
              genre: fields.kind === "auto" && fields.metric === "genre" ? fields.genre : null,
              target: Math.max(1, parseInt(fields.target, 10) || 1),
              current: fields.kind === "auto" ? (existing.current || 0) : Math.max(0, parseInt(fields.current, 10) || 0),
              failedManual: false
            });
          } else add(fields);
          overlay.close();
          done && done();
        } }),
        existing ? el("button", { class: "btn danger", text: "Delete", onclick: function () {
          KOS.ui.confirm({ title: "Delete this goal?", danger: true, confirm: "Delete", body: "“" + (existing.title || "") + "” will be removed. This can't be undone." }, function () {
            remove(existing.id); overlay.close(); done && done();
          });
        } }) : null
      ].filter(Boolean))
    ]));
    document.body.appendChild(overlay);
    syncKind();
  }
  KOS.goalEditor = goalEditor;

  /* ---------------- view ---------------- */
  function deadlineChip(g) {
    if (!g.deadline) return null;
    var today = todayISO();
    var d = new Date(g.deadline + "T00:00:00");
    var days = Math.round((d - new Date(today + "T00:00:00")) / 86400000);
    var txt, cls = "";
    if (g._status === "completed") { txt = "met " + (g.completedAt ? new Date(g.completedAt).toLocaleDateString() : ""); }
    else if (days < 0) { txt = "overdue " + (-days) + "d"; cls = " overdue"; }
    else if (days === 0) { txt = "due today"; cls = " soon"; }
    else if (days <= 14) { txt = days + "d left"; cls = " soon"; }
    else { txt = "by " + d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); }
    return el("span", { class: "goal-deadline" + cls, text: "◷ " + txt });
  }

  function goalCard(g, rerender) {
    var pct = g._pct || 0;
    var body = [];
    body.push(el("div", { class: "goal-top" }, [
      el("span", { class: "goal-kind-chip " + (g.kind === "auto" ? "is-auto" : "is-manual"), text: g.kind === "auto" ? "⟳ Auto" : "✎ Manual" }),
      g.kind === "auto" ? el("span", { class: "goal-metric", text: metricLabel(g) }) : null,
      el("span", { style: "flex:1" }),
      deadlineChip(g)
    ].filter(Boolean)));

    body.push(el("h3", { class: "goal-title", text: g.title }));
    if (g.detail) body.push(el("p", { class: "goal-detail", text: g.detail }));

    var bar = el("div", { class: "goal-bar" }, [el("span", { class: "goal-bar-fill", style: "width:" + pct + "%" })]);
    if (g._status === "completed") bar.classList.add("done");
    else if (g._status === "failed") bar.classList.add("failed");
    body.push(el("div", { class: "goal-prog" }, [
      bar,
      el("span", { class: "goal-count", text: (g._current || 0) + " / " + g.target })
    ]));

    var actions = [];
    if (g.kind === "manual" && g._status === "active") {
      actions.push(el("div", { class: "goal-step" }, [
        el("button", { class: "mini-btn", text: "−", onclick: function () { nudge(g.id, -1); rerender(); } }),
        el("button", { class: "mini-btn", text: "+1", onclick: function () { nudge(g.id, 1); rerender(); } })
      ]));
    }
    actions.push(el("span", { style: "flex:1" }));
    if (g._status === "failed" || (g._status === "completed" && g.completedAt)) {
      actions.push(el("button", { class: "mini-btn", text: "↺ Reopen", onclick: function () {
        update(g.id, { status: "active", completedAt: null, failedAt: null, failedManual: false }); rerender();
      } }));
    }
    if (g._status === "active" && g.kind === "manual") {
      actions.push(el("button", { class: "mini-btn", text: "✓ Done", onclick: function () { update(g.id, { current: g.target }); rerender(); } }));
      actions.push(el("button", { class: "mini-btn", text: "✕ Give up", onclick: function () { update(g.id, { failedManual: true, failedAt: Date.now(), status: "failed" }); rerender(); } }));
    }
    actions.push(el("button", { class: "mini-btn", text: "Edit", onclick: function () { goalEditor(g, rerender); } }));
    body.push(el("div", { class: "goal-actions" }, actions));

    return el("div", { class: "colcard goal-card " + g._status }, body);
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
        el("h1", { text: "Goals" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "What you're reaching for across the collection — tracked by hand, or measured against the vault on its own." })
        ])
      ]),
      workspaceTabs
    ]));

    var pref = (store.state.media = store.state.media || {});
    pref.goalsTab = pref.goalsTab || "active";

    var body = el("div", {});
    main.appendChild(body);

    function rerender() { KOS.show("goals", undefined, { _nav: true }); }

    compute(function (err, list) {
      var groups = { active: [], completed: [], failed: [] };
      list.forEach(function (g) { (groups[g._status] || groups.active).push(g); });

      var tabs = el("div", { class: "study-tabs goal-tabs", role: "tablist" });
      [["active", "Active"], ["completed", "Completed"], ["failed", "Failed"]].forEach(function (t) {
        tabs.appendChild(el("button", { class: "study-tab" + (pref.goalsTab === t[0] ? " active" : ""), role: "tab",
          onclick: function () { pref.goalsTab = t[0]; store.save(); rerender(); } }, [
            t[1], el("span", { class: "wl-tabcount", text: String(groups[t[0]].length) })
          ]));
      });
      body.appendChild(el("div", { class: "med-toolbar" }, [
        tabs,
        el("span", { style: "flex:1" }),
        el("button", { class: "btn primary", text: "+ New goal", onclick: function () { goalEditor(null, rerender); } })
      ]));

      var active = groups[pref.goalsTab] || [];
      if (!active.length) {
        var msg = pref.goalsTab === "active"
          ? "No active goals yet. Set one — a number to reach and, if you like, a date to reach it by."
          : pref.goalsTab === "completed" ? "Nothing completed yet. They'll gather here as you hit them."
          : "Nothing failed — keep it that way.";
        body.appendChild(el("div", { class: "colcard goal-empty" }, [
          el("p", { class: "sub", text: msg }),
          pref.goalsTab === "active" ? el("button", { class: "btn primary", text: "+ New goal", onclick: function () { goalEditor(null, rerender); } }) : null
        ].filter(Boolean)));
        return;
      }
      var grid = el("div", { class: "goal-grid" });
      active.forEach(function (g) { grid.appendChild(goalCard(g, rerender)); });
      body.appendChild(grid);
    });
  };
})();
