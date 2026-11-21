/* Kurenai OS — modules/reportcard.js
   Home's report card (1F): the latest report's headline, three facts and its
   chart, "Read the report". Split out of reports.js so the Reports pages can
   load on first use (page-reports) while Home keeps its card at boot. Reads
   the saved reports through KOS.reportStore and their words through
   KOS.reportWords; opens a report through its route. Pure presentation:
   nothing here writes (invariant 102a). */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var el = KOS.ui.el, W = KOS.reportWords;
  var SUBJ_HUE = Object.assign(KOS.subjects && KOS.subjects.map ? KOS.subjects.map("hue") : {}, { compsci: "var(--cs)", maths: "var(--maths)", it: "var(--it)" });
  var SUBJECTS = KOS.subjects && KOS.subjects.ids ? KOS.subjects.ids() : ["compsci", "maths", "it"];
  var DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTH_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var SEAL = { week: "週", month: "月", term: "期", year: "年" };
  function parse(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function dm(s) { var d = parse(s); return d.getDate() + " " + MONTHS[d.getMonth()]; }
  function range(start, end, year) {
    var a = parse(start), b = parse(end);
    var y = year ? " " + b.getFullYear() : "";
    return a.getMonth() === b.getMonth()
      ? a.getDate() + " – " + b.getDate() + " " + MONTHS[b.getMonth()] + y
      : dm(start) + " – " + dm(end) + y;
  }
  function weekOf(rep) {
    if (rep.period === "month") { var d = parse(rep.start); return MONTH_LONG[d.getMonth()] + " " + d.getFullYear(); }
    if (rep.period === "term") return (rep.facts && rep.facts.label) || "Term from " + dm(rep.start);
    if (rep.period === "year") return (rep.facts && rep.facts.label) || parse(rep.start).getFullYear() + "–" + String(parse(rep.start).getFullYear() + 1).slice(2);
    return "Week of " + dm(rep.start);
  }
  function mono(text, cls) { return el("span", { class: "k-mono" + (cls ? " " + cls : ""), text: text }); }
  function open(rep) { KOS.show("reports", { period: rep.period, start: rep.start, section: null }); }

  /* ================= the Home card (24h) =================
     The newest report, in Home's middle column between Study hours and the
     week's plan: its headline, three facts and the week's chart, and
     "Read the report". "New" until it has been read — and it stays the
     full card after reading (review: a one-line row left the column
     empty). Two or more unread from one morning list the others under it.
     Filled after the store answers; with no report at all the slot stays
     hidden and the plan takes the column. Reading is a click, never a
     render: "Read the report" (and the bell) mark the notification read. */
  function homeCard() {
    var slot = el("section", { class: "k-card k-rp-home", "data-ui": "reports.home-card", "aria-label": "Your latest report", hidden: "" });
    if (!KOS.reportStore || !KOS.reportStore.available()) return slot;
    KOS.reportStore.list(null, function (err, all) {
      if (err || !all || !all.length) return;
      var ORDER = { week: 0, month: 1, term: 2, year: 3 };
      function isRead(r) { return !!(KOS.notify && KOS.notify.isRead && KOS.notify.isRead({ id: "reports:" + r.id })); }
      /* the newest of each period, saved in the last 7 days */
      var fresh = [];
      ["week", "month", "term", "year"].forEach(function (pd) {
        var r = all.filter(function (x) { return x.period === pd; })[0];
        if (r && Date.now() - r.savedAt <= 7 * 864e5) fresh.push(r);
      });
      var unread = fresh.filter(function (r) { return !isRead(r); }).sort(function (a, b) { return ORDER[a.period] - ORDER[b.period]; });
      var weeks = all.filter(function (x) { return x.period === "week"; });
      var rep = unread[0] || weeks[0] || all[0];
      var others = unread.filter(function (r) { return r !== rep; });
      var nid = "reports:" + rep.id, isNew = !isRead(rep);
      var w = W.current(rep), f = rep.facts, s = f.study;
      function read(r) { return function () { if (KOS.notify && KOS.notify.markRead) KOS.notify.markRead("reports:" + r.id); open(r); }; }
      slot.removeAttribute("hidden");
      KOS.ui.state(slot, "new", isNew);
      var facts = [[W.hm(s.mins), "studied"]];
      if (s.recall != null) facts.push([s.recall + "%", "recall"]);
      else if (s.reviews) facts.push([W.num(s.reviews), "reviews"]);
      if (f.gov.streak) facts.push([W.plural(f.gov.streak, "day"), "streak"]);
      else if (f.collection && f.collection.count) facts.push([W.num(f.collection.count), "titles"]);
      slot.appendChild(el("div", { class: "k-rp-home-top" }, [
        el("span", { class: "k-kicker", text: rep.period === "week" ? "Week in review · " + range(rep.start, rep.end) : weekOf(rep) + " in review" }),
        isNew ? el("span", { class: "k-rp-new", text: others.length ? (others.length + 1) + " new" : "New" }) : null
      ].filter(Boolean)));
      slot.appendChild(el("h2", { class: "k-rp-home-h", text: w.headline }));
      slot.appendChild(el("dl", { class: "k-rp-home-facts" }, facts.slice(0, 3).map(function (x) {
        return el("div", {}, [el("dd", { class: "k-mono", text: x[0] }), el("dt", { text: x[1] })]);
      })));
      slot.appendChild(homeChart(rep));
      if (others.length) {
        slot.appendChild(el("ul", { class: "k-rp-home-multi" }, others.map(function (r) {
          return el("li", {}, [el("button", { type: "button", class: "k-rp-home-row", "data-ui": "reports.home-open", onclick: read(r) }, [
            el("span", { class: "k-rp-home-seal", lang: "ja", "aria-hidden": "true", text: SEAL[r.period] }),
            el("span", { class: "k-rp-home-row-t" }, [mono(weekOf(r)), el("span", { text: W.current(r).headline })]),
            el("span", { class: "k-rp-chev", "aria-hidden": "true" }, [KOS.ui.icon("chev-right")])])]);
        })));
      }
      slot.appendChild(el("button", { type: "button", class: "k-rp-home-go", "data-ui": "reports.home-open", onclick: read(rep) }, [
        el("span", { text: "Read the report" }),
        el("span", { class: "k-rp-home-arrow", "aria-hidden": "true" }, [KOS.ui.icon("arrow-right")])
      ]));
    });
    return slot;
  }
  /* the card's chart: the week's days (or the period's own chart),
     stacked by subject, filling whatever height the row gives it */
  function homeChart(rep) {
    var s = rep.facts.study;
    var vals = rep.period === "week" ? s.dayMins : (rep.facts.strip ? rep.facts.strip.map(function (c) { return c.f ? c.f.mins : 0; }) : s.dayMins);
    var parts = rep.period === "week" || !rep.facts.strip ? (s.daySubj || []) : rep.facts.strip.map(function (c) { return c.f ? c.f.bySubject || {} : {}; });
    var labels = rep.period === "week" ? DOW.map(function (d) { return d.charAt(0); }) : null;
    var max = Math.max.apply(null, vals.concat([1]));
    return el("ol", { class: "k-rp-home-chart", role: "img", style: "--n: " + vals.length,
      "aria-label": "Study by " + (rep.period === "week" ? "day" : rep.period === "month" ? "day" : rep.period === "year" ? "month" : "week") + ": " + W.hm(s.mins) + " in all" },
      vals.map(function (tot, i) {
        var p = parts[i] || {};
        return el("li", {}, [
          el("span", { class: "k-rp-home-track" }, [el("span", { class: "k-rp-home-col", style: "--h: " + (100 * (tot || 0) / max).toFixed(1) + "%" }, SUBJECTS.filter(function (k) { return p[k]; }).map(function (k) {
            return el("span", { style: "--c: " + SUBJ_HUE[k] + "; --f: " + (p[k] / (tot || 1)).toFixed(3) });
          }).concat(SUBJECTS.some(function (k) { return p[k]; }) || !tot ? [] : [el("span", { style: "--c: var(--teal); --f: 1" })]))]),
          labels ? el("span", { class: "k-rp-home-x", text: labels[i] }) : null
        ].filter(Boolean));
      }));
  }
  KOS.reportsHomeCard = homeCard;
})();
