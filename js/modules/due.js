/* Kurenai OS — modules/due.js
   The global "Due Today" queue (FR-1.2): every card — curriculum and custom,
   across all three subjects — whose SM-2 due date has arrived, most-overdue
   first. Per-topic browsing stays on each topic's Flashcards tab; this view
   is the daily clearing house. */
(function () {
  "use strict";
  var el = KOS.ui.el;

  KOS.views.due = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    var due = KOS.srs.dueCards();
    var overdue = due.filter(function (c) { return c.overdue > 0; }).length;

    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", { text: "Due Today" }),
      el("p", { class: "sub", text: "The SM-2 schedule's verdict: these cards are ready for review right now. Cards enter the schedule the first time you rate them on a topic's Flashcards tab." })
    ]));

    /* summary strip */
    var bySubject = { compsci: 0, maths: 0, it: 0 };
    due.forEach(function (c) { if (bySubject[c.sid] !== undefined) bySubject[c.sid]++; });
    main.appendChild(el("div", { class: "stat-strip" }, [
      stat(due.length, "Cards due"),
      stat(overdue, "Overdue"),
      stat(bySubject.compsci, "Computer Science"),
      stat(bySubject.maths, "Mathematics"),
      stat(bySubject.it, "IT")
    ]));
    function stat(v, k) {
      return el("div", { class: "stat-card" }, [
        el("div", { class: "v", text: String(v) }), el("div", { class: "k", text: k })]);
    }

    if (!due.length) {
      main.appendChild(el("div", { class: "due-clear" }, [
        el("div", { class: "due-clear-glyph", text: "澄" }),
        el("h2", { text: "Queue clear" }),
        el("p", { class: "sub", text: "Nothing is due. Rate cards on any topic's Flashcards tab and the algorithm will schedule them back here at the right moment." })
      ]));
      return;
    }

    if (KOS.srs.dueCount() > KOS.governor.BACKLOG_LIMIT) {
      main.appendChild(el("div", { class: "gov-banner warn", html:
        "<b>Backlog pressure.</b> Over " + KOS.governor.BACKLOG_LIMIT +
        " cards are waiting — HP drains daily until this is brought down." }));
    }

    var holder = el("div", { class: "fc-wrap" });
    main.appendChild(holder);
    KOS.flashcards.session(holder, due, {
      type: "due-review",
      showTopic: true,
      onFinish: function () {
        /* re-enter the view so the counts refresh; more cards may remain
           if "Again" ratings re-dated some for today */
        setTimeout(function () { if (KOS.refreshHUD) KOS.refreshHUD(); }, 50);
      }
    });
  };
})();
