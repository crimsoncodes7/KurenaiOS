/* Kurenai OS — core/goals-collection.js
   The Collection's goal types, registered with the Goals engine
   (core/goals.js). These are the fourteen types Collection Goals v2 had,
   moved here unchanged, so no existing goal reads differently.

   They READ the local vault, its custom lists and the Budget Planner, and
   never duplicate media state, call a provider or change a vault entry.
   GO-02: they measure the GOAL'S OWN PERIOD (its start to its deadline, or
   a repeating goal's week or month) from each title's activity journal
   (invariant 99) — they used to read the vault as it stands, so "complete
   ten titles" made today was met at once by 222 old completions and paid
   Goal getter. Titles added count by createdAt, purchases by purchasedAt;
   favourites, which the journal does not record, from a baseline taken
   when the goal is made.                                                  */
(function () {
  "use strict";
  var store = KOS.store, G = KOS.goals;
  var MODULES = [
    { id: "", label: "All media" },
    { id: "anime", label: "Anime" },
    { id: "books", label: "Books" },
    { id: "vn", label: "Visual novels" },
    { id: "game", label: "Games" }
  ];
  function moduleLabel(id) {
    for (var i = 0; i < MODULES.length; i++) if (MODULES[i].id === (id || "")) return MODULES[i].label;
    return "All media";
  }
  function mods(ctx, fn) { ctx.stats(function (agg) { var m = agg.modules || {}; fn(agg, function (id) { return m[id] || {}; }); }); }
  /* the period's events: fn(p, m) with m(module) → that module's counts */
  var ALL = ["anime", "books", "vn", "game"];
  function inPeriod(ctx, fn) {
    ctx.period(function (p) { var mm = p.modules || {}; fn(p, function (id) { return mm[id] || {}; }); });
  }
  function sum(m, mod, key) { return mod ? (m(mod)[key] || 0) : ALL.reduce(function (n, id) { return n + (m(id)[key] || 0); }, 0); }
  function rangeTs(ctx) {
    return [ctx.from ? new Date(ctx.from + "T00:00:00").getTime() : -Infinity, ctx.to ? new Date(ctx.to + "T23:59:59").getTime() : Infinity];
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
  function reg(id, label, icon, fields, measure, extra) {
    G.register(Object.assign({ id: id, domain: "collection", label: label, icon: icon, fields: fields || {}, measure: measure }, extra || {}));
  }

  var REPEAT = { repeat: true };
  reg("titles-completed", "Complete a number of titles", "✓", { module: true }, function (g, ctx, cb) {
    inPeriod(ctx, function (p, m) { cb({ current: sum(m, g.module, "completed"), unit: "titles", meta: moduleLabel(g.module) }); });
  }, REPEAT);
  reg("episodes-watched", "Watch episodes", "映", {}, function (g, ctx, cb) { inPeriod(ctx, function (p, m) { cb({ current: m("anime").progress || 0, unit: "episodes" }); }); }, REPEAT);
  reg("chapters-read", "Read chapters", "頁", {}, function (g, ctx, cb) { inPeriod(ctx, function (p, m) { cb({ current: (m("books").progress || 0) + (m("books").chapter || 0), unit: "chapters" }); }); }, REPEAT);
  reg("volumes-read", "Read volumes", "冊", {}, function (g, ctx, cb) { inPeriod(ctx, function (p, m) { cb({ current: m("books").volumes || 0, unit: "volumes" }); }); }, REPEAT);
  function linked(g, ctx, cb) {
    if (!g.linkedEntryId) { cb({ current: 0, unit: "title", meta: "No title linked" }); return; }
    KOS.mediadb.get(g.linkedEntryId, function (err, entry) {
      var r = { current: 0, target: g.target, unit: "", meta: "" };
      if (!entry || err) { r.meta = "Linked title is no longer in the vault"; cb(r); return; }
      r.meta = entry.title;
      if (g.type === "specific-title") {
        r.current = entry.status === "completed" ? 1 : 0; r.target = 1; r.unit = "title";
      } else if (entry.progress && entry.progress.total) {
        r.current = entry.progress.current || 0; r.target = entry.progress.total;
        r.unit = entry.progress.unit || (entry.module === "anime" ? "episodes" : entry.module === "books" ? "chapters" : "steps");
        if (entry.status === "completed") r.current = r.target;
      } else {
        r.current = entry.status === "completed" ? 1 : 0; r.target = 1; r.unit = "series";
      }
      cb(r);
    });
  }
  reg("specific-title", "Complete a specific title", "◎", { linked: true }, linked);
  reg("finish-series", "Finish a series", "終", { linked: true }, linked);
  reg("filtered-completed", "Complete titles from a list, tag, or genre", "篩", { module: true, filter: true }, function (g, ctx, cb) {
    inPeriod(ctx, function (p) {
      KOS.mediadb.query(filterQuery(g), function (err, rows) {
        cb({ current: err ? 0 : rows.filter(function (r) { return p.completedIds[r.syncId]; }).length, unit: "titles",
          meta: (g.filterKind ? g.filterKind + ": " : "") + (g.filterValue || "Any") + (g.module ? " · " + moduleLabel(g.module) : "") });
      });
    });
  }, REPEAT);
  reg("spend-below", "Spend below a set amount", "◈", {}, function (g, ctx, cb) {
    var cur = Math.round(spendInRange(g) * 100) / 100;
    var unit = (store.state.wishlist && store.state.wishlist.budget && store.state.wishlist.budget.currency) || "£";
    cb({ current: cur, unit: unit, meta: unit + Math.max(0, g.target - cur).toFixed(2).replace(/\.00$/, "") + " remaining" });
  }, { direction: "under" });
  reg("library-size", "Grow the collection", "蔵", { module: true }, function (g, ctx, cb) {
    inPeriod(ctx, function (p, m) { cb({ current: sum(m, g.module, "added"), unit: "titles", meta: "added · " + moduleLabel(g.module) }); });
  }, REPEAT);
  /* the journal does not record favourites: counted from the number held
     when the goal was made (params.favBase, taken by onCreate) */
  reg("favourites", "Enshrine favourites", "祠", {}, function (g, ctx, cb) {
    ctx.stats(function (agg) {
      var base = g.params && typeof g.params.favBase === "number" ? g.params.favBase : null;
      if (base == null) { cb({ current: 0, unit: "enshrined", meta: "Counting from now" }); return; }
      cb({ current: Math.max(0, (agg.favourites || 0) - base), unit: "enshrined" });
    });
  }, { onCreate: function (g) {
    g.params = g.params || {};
    if (typeof g.params.favBase === "number" || !KOS.mediadb || !KOS.mediadb.stats) return;
    KOS.mediadb.stats(function (err, agg) {
      if (err || !agg) return;
      var cur = G.get ? G.get(g.id) : null, t = cur || g;
      t.params = t.params || {};
      if (typeof t.params.favBase !== "number") { t.params.favBase = agg.favourites || 0; store.save(); }
    });
  } });
  reg("purchases", "Complete purchases", "包", {}, function (g, ctx, cb) {
    var r = rangeTs(ctx);
    cb({ current: purchasedItems().filter(function (it) { var ts = it.purchasedAt || 0; return ts >= r[0] && ts <= r[1]; }).length, unit: "purchases" });
  }, REPEAT);
  reg("game-hours", "Play a number of hours", "時", {}, function (g, ctx, cb) { inPeriod(ctx, function (p, m) { cb({ current: m("game").hours || 0, unit: "hours" }); }); }, REPEAT);
  reg("routes-cleared", "Clear visual-novel routes", "路", {}, function (g, ctx, cb) { inPeriod(ctx, function (p, m) { cb({ current: m("vn").route || 0, unit: "routes" }); }); }, REPEAT);

  G.MODULES = MODULES;
  G.moduleLabel = moduleLabel;

  /* every type is registered: migrate a stored v2 record now, at boot, so
     no page's first render is the write (render purity, smoke56) */
  G.all();
})();
