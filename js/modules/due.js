/* Kurenai OS — modules/due.js
   The global "Due Today" queue (FR-1.2): every card — curriculum and custom,
   across all three subjects — whose SM-2 due date has arrived, most-overdue
   first. Per-topic browsing stays on each topic's Flashcards tab; this view
   is the daily clearing house. */
(function () {
  "use strict";
  var el = KOS.ui.el;

  KOS.review = KOS.review || {};
  KOS.review.renderDue = function (main, opts) {
    opts = opts || {};
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    var due = KOS.srs.dueCards();
    var overdue = due.filter(function (c) { return c.overdue > 0; }).length;

    if (!opts.embedded) {
      main.appendChild(el("div", { class: "dash-head" }, [
        el("div", { class: "dh-txt" }, [
          el("span", { class: "dh-kicker", text: "The queue" }),
          el("h1", { text: "Due Today" }),
          el("div", { class: "dh-sub" }, [
            el("span", { class: "board", text: "These cards are ready for review right now." })
          ])
        ])
      ]));
    }

    /* summary strip — the personal bucket (Build 3c: VN quotes etc.) counts
       alongside the three subjects, never inside them */
    var bySubject = { compsci: 0, maths: 0, it: 0, personal: 0 };
    due.forEach(function (c) { if (bySubject[c.sid] !== undefined) bySubject[c.sid]++; });
    /* Category 7 Phase B (audit REV-1/U-17): this strip showed six cards all
       reading 0 on a real account — five of the six carrying no information
       whatever. Due and Overdue always show, because "0 due" IS the answer
       to the question the page is asking. The four per-subject splits are
       suppressed at zero, so the strip only ever grows to explain a number
       that is actually there. Built through the shared stat tile. */
    var tiles = [
      KOS.ui.statTile({ label: "Cards due", value: due.length, emptyText: "None" }),
      KOS.ui.statTile({ label: "Overdue", value: overdue, emptyText: "None",
        tone: overdue ? "low" : null })
    ].concat([
      ["Computer Science", bySubject.compsci], ["Mathematics", bySubject.maths],
      ["IT", bySubject.it], ["Personal", bySubject.personal]
    ].map(function (s) {
      return KOS.ui.statTile({ label: s[0], value: s[1], suppressZero: true });
    })).filter(Boolean);
    main.appendChild(el("div", { class: "stat-strip" }, tiles));

    /* the personal deck's study surface lives one click away — new personal
       cards only enter the SM-2 schedule once first rated there */
    if (KOS.srs.personalRefs().length) {
      main.appendChild(el("div", { class: "lab-controls", style: "margin:4px 0 10px" }, [
        el("button", { class: "btn", text: "❝ Personal deck", title: "Cards with no curriculum subject — VN quotes and your own general cards", onclick: function () { KOS.show("personaldeck"); } })
      ]));
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

  /* ---------------- the Personal Deck (Build 3c) ----------------
     Cards in the reserved "personal" bucket — created from VN quotes (ref
     "vn") or by hand — with no curriculum subject forced onto them. The
     standard flashcards mount does everything (study + manage + metrics);
     this view just picks the sub-deck. */
  var REF_LABEL = { vn: "Visual novel quotes" };
  KOS.views.personaldeck = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "句 · The commonplace book" }),
        el("h1", { text: "Personal Deck" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "Cards without a curriculum home — kept quotes and anything you add here." })
        ])
      ])
    ]));

    var refs = KOS.srs.personalRefs();
    if (!refs.length) refs = [{ ref: "vn", count: 0 }];   // the manage tab can still create the first card

    var body = el("div", {});
    if (refs.length > 1) {
      var pills = el("div", { class: "study-tabs med-pills", role: "tablist" });
      refs.forEach(function (r, i) {
        var b = el("button", { class: "study-tab" + (i === 0 ? " active" : ""), role: "tab",
          onclick: function () {
            pills.querySelectorAll(".study-tab").forEach(function (x) { x.classList.remove("active"); });
            b.classList.add("active");
            mountRef(r.ref);
          } }, [(REF_LABEL[r.ref] || r.ref) + " (" + r.count + ")"]);
        pills.appendChild(b);
      });
      main.appendChild(pills);
    }
    main.appendChild(body);
    function mountRef(ref) {
      body.innerHTML = "";
      var inner = el("div", { class: "fc-wrap" });
      body.appendChild(inner);
      KOS.flashcards.mount(inner, KOS.srs.PERSONAL_SID, ref);
    }
    mountRef(refs[0].ref);

    main.appendChild(el("div", { class: "lab-controls", style: "margin-top:14px" }, [
      el("button", { class: "btn", text: "← Due Today", onclick: function () { KOS.show("due"); } }),
      el("button", { class: "btn", text: "選 Visual Novels", onclick: function () { KOS.show("vn"); } })
    ]));
  };
})();
