/* Kurenai OS — modules/review.js
   Study's review desk. It composes the Due Today and Card Stats renderers
   under one quiet switcher in the page header; the original view ids
   remain as compatibility routes so old navigation actions and history
   still work.

   Graphite (frame 9a): Due today is an overview first — the queue as a
   hero with its subject split and the two ways in, the next seven days,
   the queue by topic, and beside it the personal deck, the backlog warning
   and today so far. Starting a review swaps the overview for the session
   (arg.run: "all" | "overdue" | "sid:ref"); the `due` route opens straight
   into the whole queue, which is what every "review now" button means. */
(function () {
  "use strict";
  var el = KOS.ui.el;

  function panelFor(arg, fallback) {
    var panel = arg && arg.tab;
    return panel === "stats" || panel === "due" ? panel : fallback;
  }

  function renderReview(main, arg, fallback) {
    var panel = panelFor(arg, fallback || "due");
    var copy = panel === "due"
      ? ["The queue", "Clear the cards that are ready now, then use the ledger to see how the schedule is holding up."]
      : ["The memory ledger", "Inspect review volume, scheduling health, and where the lapses live."];

    KOS.shell.tree("none");
    var tabs = KOS.workspaceTabs([
      ["Due today", "review", { tab: "due" }, "due"],
      ["Card stats", "review", { tab: "stats" }, "stats"]
    ], panel, "Review pages", "review-tabs");
    tabs.setAttribute("data-ui", (tabs.getAttribute("data-ui") || "") + " review.tabs");

    main.appendChild(KOS.ui.pageHeader({ kicker: copy[0], title: "Review", sub: copy[1], actions: [tabs] }));

    var body = el("section", { class: "k-review", "data-ui": "review.workspace", "aria-label": panel === "due" ? "Due today" : "Card stats" });
    main.appendChild(body);
    if (panel === "stats") KOS.review.renderStats(body, arg && arg.stats, { embedded: true });
    else KOS.review.renderDue(body, { embedded: true, run: arg && arg.run });
  }

  KOS.views.review = function (main, arg) { renderReview(main, arg, "due"); };

  /* Compatibility routes: existing launches from Home, the focus timer and
     the help guide keep their view id and browser-style history entry. */
  KOS.views.due = function (main) { renderReview(main, { tab: "due", run: "all" }, "due"); };
  KOS.views.cardstats = function (main, arg) {
    renderReview(main, { tab: "stats", stats: arg }, "stats");
  };
})();
