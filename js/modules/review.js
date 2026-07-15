/* Kurenai OS — modules/review.js
   Study's review desk. It composes the established Due Today and Card Stats
   renderers under one secondary tab bar; the original view ids remain as
   compatibility routes so old navigation actions and history still work. */
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
      ? ["The queue", "Due Today", "Clear the cards that are ready now, then use the ledger to see how the schedule is holding up."]
      : ["The memory ledger", "Card Statistics", "Inspect review volume, scheduling health, and where the lapses live."];

    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var tabs = KOS.workspaceTabs([
      ["Due Today", "review", { tab: "due" }, "due"],
      ["Card Stats", "review", { tab: "stats" }, "stats"]
    ], panel, "Review pages", "review-tabs workspace-header-tabs");

    main.appendChild(el("div", { class: "dash-head review-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: copy[0] }),
        el("h1", { text: "Review" }),
        el("div", { class: "dh-sub" }, [el("span", { class: "board", text: copy[2] })])
      ]),
      tabs
    ]));

    var body = el("section", { class: "review-workspace", "aria-label": copy[1] });
    main.appendChild(body);
    if (panel === "stats") KOS.review.renderStats(body, arg && arg.stats, { embedded: true });
    else KOS.review.renderDue(body, { embedded: true });
  }

  KOS.views.review = function (main, arg) { renderReview(main, arg, "due"); };

  /* Compatibility routes: existing launches from the home dashboard, focus
     timer and help guide keep their view id and browser-style history entry,
     while displaying the consolidated workspace. */
  KOS.views.due = function (main) { renderReview(main, { tab: "due" }, "due"); };
  KOS.views.cardstats = function (main, arg) {
    renderReview(main, { tab: "stats", stats: arg }, "stats");
  };
})();
