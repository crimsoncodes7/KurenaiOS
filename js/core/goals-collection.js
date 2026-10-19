/* Kurenai OS — core/goals-collection.js
   The Collection's goal types, registered with the Goals engine
   (core/goals.js). These are the fourteen types Collection Goals v2 had,
   moved here unchanged, so no existing goal reads differently.

   They READ the local vault, its custom lists and the Budget Planner, and
   never duplicate media state, call a provider or change a vault entry.
   They measure the vault as it stands (not a date range), so none of them
   repeats.                                                                */
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

  reg("titles-completed", "Complete a number of titles", "✓", { module: true }, function (g, ctx, cb) {
    mods(ctx, function (agg, m) {
      cb({ current: g.module ? (m(g.module).completed || 0) : ["anime", "books", "vn", "game"].reduce(function (n, id) { return n + (m(id).completed || 0); }, 0),
        unit: "titles", meta: moduleLabel(g.module) });
    });
  });
  reg("episodes-watched", "Watch episodes", "映", {}, function (g, ctx, cb) { mods(ctx, function (a, m) { cb({ current: m("anime").episodes || 0, unit: "episodes" }); }); });
  reg("chapters-read", "Read chapters", "頁", {}, function (g, ctx, cb) { mods(ctx, function (a, m) { cb({ current: m("books").episodes || 0, unit: "chapters" }); }); });
  reg("volumes-read", "Read volumes", "冊", {}, function (g, ctx, cb) { mods(ctx, function (a, m) { cb({ current: m("books").volumesRead || 0, unit: "volumes" }); }); });
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
    KOS.mediadb.query(filterQuery(g), function (err, rows) {
      cb({ current: err ? 0 : rows.length, unit: "titles",
        meta: (g.filterKind ? g.filterKind + ": " : "") + (g.filterValue || "Any") + (g.module ? " · " + moduleLabel(g.module) : "") });
    });
  });
  reg("spend-below", "Spend below a set amount", "◈", {}, function (g, ctx, cb) {
    var cur = Math.round(spendInRange(g) * 100) / 100;
    var unit = (store.state.wishlist && store.state.wishlist.budget && store.state.wishlist.budget.currency) || "£";
    cb({ current: cur, unit: unit, meta: unit + Math.max(0, g.target - cur).toFixed(2).replace(/\.00$/, "") + " remaining" });
  }, { direction: "under" });
  reg("library-size", "Grow the collection", "蔵", { module: true }, function (g, ctx, cb) {
    mods(ctx, function (agg, m) { cb({ current: g.module ? (m(g.module).total || 0) : agg.total || 0, unit: "titles", meta: moduleLabel(g.module) }); });
  });
  reg("favourites", "Enshrine favourites", "祠", {}, function (g, ctx, cb) { ctx.stats(function (agg) { cb({ current: agg.favourites || 0, unit: "enshrined" }); }); });
  reg("purchases", "Complete purchases", "包", {}, function (g, ctx, cb) { cb({ current: purchasedItems().length, unit: "purchases" }); });
  reg("game-hours", "Play a number of hours", "時", {}, function (g, ctx, cb) { mods(ctx, function (a, m) { cb({ current: m("game").episodes || 0, unit: "hours" }); }); });
  reg("routes-cleared", "Clear visual-novel routes", "路", {}, function (g, ctx, cb) { mods(ctx, function (a, m) { cb({ current: m("vn").episodes || 0, unit: "routes" }); }); });

  G.MODULES = MODULES;
  G.moduleLabel = moduleLabel;

  /* every type is registered: migrate a stored v2 record now, at boot, so
     no page's first render is the write (render purity, smoke56) */
  G.all();
})();
