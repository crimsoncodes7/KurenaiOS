/* Kurenai OS — modules/pacecard.js
   Home's "Week's plan" card, at boot (1F): the Pacing page itself
   (js/modules/pacing.js) loads on first use in page-pacing. Reads only
   KOS.pacing's derivations, and a tick goes through KOS.pacing.setDone
   (invariants 82b, 84). */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var SUBJ = [
    { id: "compsci", name: "Computer Science", short: "CS" },
    { id: "maths", name: "Mathematics", short: "Maths" },
    { id: "it", name: "IT · Data Analytics", short: "IT" }
  ];
  var HUE = { compsci: "var(--cs)", maths: "var(--maths)", it: "var(--it)" };
  /* ============================================================
     THE HOME CARD — this week's plan, tickable in place
     What I owe this week (the week's own open rows plus what has carried
     in, marked behind), what I have ticked, and what class is doing. Reads
     the same derivations as the Pacing page; the ticks go through the same
     KOS.pacing.setDone. Returns null when the plan has nothing for the
     week, so Home stays quiet (invariant 53).
     ============================================================ */
  function homeCard() {
    if (!KOS.pacing || !KOS.pacing.weeks().length) return null;
    var d = KOS.pacing.dueThisWeek();
    if (!d.week) return null;
    var classRows = KOS.pacing.entriesFor(d.week.wb, null, "school");
    if (!d.rows.length && !d.carried.length && !d.done.length && !classRows.length) return null;
    /* Home's "Week's plan" (Graphite frame 7a): status, a segment per row,
       five rows that tick in place (invariant 82b), then what is left and
       what the class is doing */
    var card = el("section", { class: "k-card k-plan", "data-ui": "pace.home", "aria-label": "This week's plan" });
    function subj(id) { return (SUBJ.filter(function (x) { return x.id === id; })[0] || {}).short || ""; }
    function paint() {
      d = KOS.pacing.dueThisWeek();
      card.innerHTML = "";
      var total = d.rows.length + d.done.length;
      var behind = d.carried.length;
      card.appendChild(el("div", { class: "k-plan-head", "data-ui": "cal.countdown-head" }, [
        el("span", { class: "k-card-title", text: "Week's plan" }),
        el("span", { class: "k-plan-status", "data-state": behind ? "behind" : null,
          text: behind ? behind + " behind" : total ? "On track" : "Nothing planned" }),
        el("span", { class: "k-plan-count", text: (total ? d.done.length + " of " + total + " · " : "") + d.week.label }),
        total ? el("span", { class: "k-plan-segs", role: "img", "aria-label": d.done.length + " of " + total + " ticked" },
          d.done.concat(d.rows).map(function (e) { return el("span", { "data-state": e.done ? "done" : null }); })) : el("span", { class: "k-spacer" }),
        el("button", { type: "button", class: "k-link", text: "Pacing →", onclick: function () { KOS.show("pacing", { wb: d.week.wb }); } })
      ]));
      var list = el("div", { class: "k-plan-list" });
      function row(e, carry) {
        var tick = el("input", { type: "checkbox", "aria-label": "Tick off " + e.title,
          onchange: function () { KOS.pacing.setDone(e.id, tick.checked); paint(); } });
        tick.checked = !!e.done;
        var from = carry ? (KOS.pacing.weekAt(carry.fromWb) || {}).label || carry.fromWb : null;
        var r = el("div", { class: "k-plan-row", "data-ui": "pace.home-row", style: "--row-c: " + HUE[e.subject] }, [
          el("label", { class: "k-plan-tick", "data-ui": "pace.tick" }, [tick]),
          el("button", { type: "button", class: "k-plan-title", title: carry ? "Carried from " + from : e.title,
            onclick: function () {
              var first = e.refs && e.refs[0];
              if (first) KOS.show("ref", { subject: e.subject, ref: first });
              else KOS.show("pacing", { wb: e.wb });
            } }, [e.title]),
          el("span", { class: "k-plan-subj", text: subj(e.subject) }),
          el("span", { class: "k-chip", text: carry ? carry.weeksLate + (carry.weeksLate === 1 ? " week" : " weeks") + " behind" : "this week" })
        ]);
        if (carry) KOS.ui.state(r, "is-carried", true);
        if (e.done) KOS.ui.state(r, "is-done", true);
        return r;
      }
      /* everything behind leads, then the week's open rows up to five —
         Home is a front page; the full week lives on Pacing */
      var CAP = 5, shown = 0;
      d.carried.forEach(function (c) { if (shown < CAP) { list.appendChild(row(c.entry, c)); shown++; } });
      d.rows.forEach(function (e) { if (shown < CAP) { list.appendChild(row(e, null)); shown++; } });
      if (!shown) list.appendChild(el("p", { class: "k-plan-foot", text: "Nothing left to tick this week." }));
      card.appendChild(list);
      var more = Math.max(0, d.carried.length + d.rows.length - shown);
      var foot = [];
      if (more) foot.push(el("button", { type: "button", class: "k-plan-more", text: more + " more this week",
        onclick: function () { KOS.show("pacing", { wb: d.week.wb }); } }));
      if (classRows.length) {
        if (foot.length) foot.push(" · ");
        foot.push("In class: ");
        foot.push(el("span", { class: "k-soft", text: classRows.map(function (e) { return subj(e.subject) + " " + e.title; }).join(" · ") }));
      }
      if (foot.length) card.appendChild(el("div", { class: "k-plan-foot" }, foot));
    }
    paint();
    return card;
  }
  KOS.pacingHomeCard = homeCard;
})();
