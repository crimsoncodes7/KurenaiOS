/* Kurenai OS — modules/examviews.js
   Two of the Exams hub's pages (roadmap 5.8, phase 3), drawn to design
   turn 29:
     Planner (29l)    the week's guide across every exam, with Send to
                      Pacing as its one write (#/exams/plan)
     Results (29ab)   one calm page per summer series
   Readiness (29g) and Season (29m) retired with the rework (design 45):
   readiness lives on as each exam's Today strip and step reasons.
   The shared pieces are KOS.examUI (modules/exams.js). Pages only read;
   Send, a rapid-recall rating, a results-day grade and the Quiet switch
   are clicks (invariant 129).                                            */
(function () {
  "use strict";
  var el = KOS.ui.el;
  function E() { return KOS.exams; }
  function U() { return KOS.examUI; }
  function today() { return KOS.srs.todayISO(); }

  /* ---------------- the Planner (29l) ---------------- */
  var planWeek = null, sentFlash = null;
  function planner(main) {
    var u = U(), P = KOS.examPlan;
    var wb = planWeek || P.mondayOf(today());
    var nowWb = P.mondayOf(today()), past = wb < nowWb;
    var nav = el("div", { class: "k-ex-weeknav", "data-ui": "exams.weeknav" }, [
      u.btn("‹", "quiet sm", function () { planWeek = KOS.srs.addDays(wb, -7); KOS.rerender(); }, { "aria-label": "Previous week" }),
      el("b", { text: "Week of " + u.pretty(wb) }),
      u.btn("›", "quiet sm", function () { planWeek = KOS.srs.addDays(wb, 7); KOS.rerender(); }, { "aria-label": "Next week" })]);
    u.head(main, "plan", { right: nav });
    var wrap = el("div", { class: "k-ex-page", "data-ui": "exams.planner" });
    main.appendChild(wrap);
    var p = P.plan(wb);
    var sent = P.sentState(wb);
    if (past) {
      wrap.appendChild(u.card([u.chead("Week of " + u.pretty(wb), "history"), u.quiet(sent ? "Sent " + (sent.at ? u.pretty(new Date(sent.at).toISOString().slice(0, 10)) : "") + " · " + sent.done + " of " + sent.n + " done." : "Nothing was sent to Pacing that week.", "Past weeks are read-only; this week is worked out afresh from today's readiness.")], "", "exams.pastweek"));
      return;
    }
    if (p.empty === "nothing") { wrap.appendChild(KOS.ui.emptyState({ compact: true, mark: "送", title: "Nothing to plan for this week", body: "No assessment with a readiness model starts within three weeks. Reviews only: 30 minutes a day." })); return; }
    var left = el("div", { class: "k-ex-col" }), side = el("div", { class: "k-ex-side" });
    /* hours: the only input */
    var hrs = el("input", { type: "number", class: "k-input k-ex-hours", min: 0, max: 60, step: 0.5, value: String(p.hours.hours), "aria-label": "Hours available this week", "data-ui": "exams.hours" });
    hrs.addEventListener("change", function () {
      var v = Math.max(0, Math.min(60, Number(hrs.value) || 0));
      E().setPrefs({ weeklyHours: v });
      var np = P.plan(wb);
      u.announce(v + " hours: " + np.groups.map(function (g) { return g.a.title + " " + u.mins(g.mins); }).join(", ") + ".");
      KOS.rerender();
    });
    var hcard = u.card([el("div", { class: "k-ex-hoursrow" }, [el("div", {}, [u.eyebrow("Hours available"), el("div", { class: "k-ex-inline" }, [hrs, u.muted(p.hours.avgMins ? "your last 4 weeks averaged " + u.mins(p.hours.avgMins) : p.hours.from === "default" ? "a starting guess until your sessions say otherwise" : "")])]),
      el("span", { class: "k-ex-grow" }), el("p", { class: "k-ex-small k-ex-hourswhy", text: p.total ? "Split by nearness, risk and marks at stake." + (p.groups[0] && p.groups[0].risk ? " " + p.groups[0].a.title + " is At risk, so it gets the most." : "") : "" })])], "", "exams.hourscard");
    if (!p.total) { hcard.appendChild(u.quiet("Add some hours to get a plan.", "")); left.appendChild(hcard); }
    else {
      hcard.appendChild(allocBar(p));
      left.appendChild(hcard);
      p.groups.forEach(function (g) { left.appendChild(groupCard(g)); });
    }
    left.lastChild.classList.add("k-ex-fill");
    /* side: the one action */
    var items = P.sendList(p);
    var sendBtn = u.btn(sent ? "Send again (replaces)" : "Send this week's priorities to Pacing", "primary", function () { sendDialog(wb, items); }, { "data-ui": "exams.send", disabled: items.length ? null : "" });
    if (sentFlash && sentFlash.wb === wb && Date.now() - sentFlash.at < 8000) {
      sendBtn = u.btn("Sent · " + u.plural(sentFlash.n, "item") + " · Undo", "", function () { var n = P.undo(wb); sentFlash = null; KOS.ui.toast("Removed " + u.plural(n, "row") + " from Pacing."); KOS.rerender(); }, { "data-ui": "exams.undo" });
    }
    side.appendChild(u.card([u.eyebrow("This week"), el("div", { class: "k-ex-bigfig-row" }, [el("span", { class: "k-ex-fig k-ex-fig--40", text: String(p.sessions) }), u.muted("sessions of 25 min")]),
      u.muted([p.groups.some(function (g) { return g.paper && !g.paper.outside; }) ? "+ one timed paper" : null, p.reviews ? u.mins(p.reviews.mins) + " of reviews" : null].filter(Boolean).join(" · ")),
      el("div", { class: "k-ex-sendbox" }, [sendBtn, u.muted(sent && !sentFlash ? "Sent: " + sent.done + " of " + sent.n + " done. Sending again replaces this planner's own rows." : "Read-only until you send it. Never writes the Calendar.", "k-ex-center")])], "", "exams.thisweek"));
    if (p.cram) side.appendChild(u.card([u.chead("Cram deck", "for the next test"), el("div", { class: "k-ex-bigfig-row" }, [el("span", { class: "k-ex-fig k-ex-fig--26", text: String(p.cram.cards) }), u.muted("cards · " + p.cram.a.title + " · " + u.pretty(p.cram.a.date))]),
      el("div", { class: "k-ex-actions" }, [u.btn("Cram the deck", "sm", function () { u.cramScope(p.cram.a); })])], "", "exams.cram"));
    var nx = P.plan(KOS.srs.addDays(wb, 7));
    side.appendChild(u.card([u.chead("Next week", "a preview"), el("p", { class: "k-ex-body", text: nx.groups.length ? nx.groups.map(function (g) { return g.a.title + " " + u.mins(g.mins); }).join(" · ") + "." + (p.groups.filter(function (g) { return !nx.groups.some(function (n) { return n.a.id === g.a.id; }); }).map(function (g) { return " " + g.a.title + " leaves the plan."; }).join("")) : "Nothing planned yet: no start-by date falls within three weeks of it." })], "", "exams.nextweek"));
    side.appendChild(u.card([u.chead("Why this split", "tier × gap ÷ weeks left")].concat(p.groups.map(function (g) {
      var rk = g.band && g.band.band === "risk";
      return el("div", { class: "k-ex-whyrow" }, [el("div", { class: "k-ex-grow" }, [el("div", { class: "k-ex-strong k-ex-ell", text: g.a.title }),
        el("span", { class: "k-ex-small", "data-tone": rk ? "danger" : null, text: u.plural(E().daysTo(g.a), "day") + " · " + (rk ? "▲ At risk" : g.band ? u.BAND[g.band.band][0].slice(2) : "no band") })]),
        el("span", { class: "k-mono", text: Math.round(100 * g.share) + "%" })]);
    })).concat([el("div", { class: "k-ex-grow" }), el("p", { class: "k-ex-foot", text: "At most 40% of an assessment's time goes to one leaf, and overdue reviews in scope always get a slot." })]), "k-ex-fill", "exams.why-split"));
    wrap.appendChild(el("div", { class: "k-ex-grid2" }, [left, side]));
  }
  function allocBar(p) {
    var u = U(), segs = p.groups.map(function (g) { return { t: g.a.title, m: g.mins, c: u.hueOf(g.a), real: g.a.tier === "real_exam" }; });
    if (p.reviews) segs.push({ t: "Reviews", m: p.reviews.mins, c: "var(--text-2)" });
    return el("div", { class: "k-ex-alloc", "data-ui": "exams.alloc" }, [
      el("div", { class: "k-ex-allocbar", role: "img", "aria-label": segs.map(function (s) { return s.t + " " + u.mins(s.m); }).join(", ") }, segs.map(function (s) {
        var x = el("span", { "data-real": s.real ? "" : null }); x.style.setProperty("--g", String(s.m)); x.style.setProperty("--s", s.c); return x;
      })),
      el("div", { class: "k-ex-alloclegend", style: "--n: " + Math.min(4, segs.length) }, segs.map(function (s) {
        return el("div", {}, [el("span", { class: "k-ex-inline k-ex-small" }, [el("i", { class: "k-ex-dot", style: "--s: " + s.c }), el("span", { class: "k-ex-ell", text: s.t })]), el("b", { class: "k-mono", text: u.mins(s.m) })]);
      }))]);
  }
  function groupCard(g) {
    var u = U();
    var c = u.card([el("div", { class: "k-ex-ghead", style: "--s: " + u.hueOf(g.a) }, [el("span", { class: "k-ex-vbar", "aria-hidden": "true" }),
      el("button", { type: "button", class: "k-ex-ctitle k-ex-titlelink", text: g.a.title, onclick: function () { KOS.show("exams", g.a.id); } }), u.tierChip(g.a.tier, true),
      el("span", { class: "k-ex-grow" }), el("span", { class: "k-mono", text: u.mins(g.mins) })])], "", "exams.pgroup");
    g.rows.forEach(function (r) {
      c.appendChild(el("div", { class: "k-ex-prow" }, [el("div", { class: "k-ex-grow" }, [el("div", { class: "k-ex-strong k-ex-ell" }, [r.learn ? el("span", { class: "k-chip", "data-tone": "muted", text: "learn first" }) : null, el("span", { text: " " + r.title })].filter(Boolean)), u.muted(r.why)]),
        r.sessions ? el("span", { class: "k-ex-blocks", "aria-label": u.plural(r.sessions, "session") }, Array.apply(null, { length: r.sessions }).map(function () { return el("i"); })) : el("span"),
        el("span", { class: "k-mono k-ex-small", text: u.mins(r.mins) })]));
    });
    if (g.paper) c.appendChild(el("div", { class: "k-ex-prow" }, [el("div", { class: "k-ex-grow" }, [el("div", { class: "k-ex-strong k-ex-ell", text: "紙 " + g.paper.title }),
      u.muted(g.paper.outside ? "The week's practice paper · beyond this week's hours for it, so it is a suggestion" : "The week's practice paper · " + g.paper.done + " of " + g.paper.of + " sittings done")]), el("span"), el("span", { class: "k-mono k-ex-small", text: u.mins(g.paper.mins) })]));
    if (!g.rows.length && !g.paper) c.appendChild(u.quiet("No topic stands out yet.", "Add marks by question or rate topics, and this fills in."));
    return c;
  }
  function sendDialog(wb, items) {
    var u = U(), overlay = el("div", { class: "k-dialog-overlay" });
    function close() { overlay.remove(); }
    overlay.close = close;
    var picks = items.map(function () { return true; });
    var go = u.btn("Send " + u.plural(items.length, "item"), "primary", function () {
      var chosen = items.filter(function (_, i) { return picks[i]; });
      var res = KOS.examPlan.send(wb, chosen);
      close();
      if (!res.ok) { KOS.ui.toast(res.why, true); return; }
      sentFlash = { wb: wb, n: res.ids.length, at: Date.now() };
      u.announce(u.plural(res.ids.length, "priority", "priorities") + " sent to Pacing.");
      KOS.rerender();
      var again = KOS.view.redrawIfStill();
      setTimeout(function () { if (sentFlash && Date.now() - sentFlash.at >= 8000) again(); }, 8100);
    }, { "data-ui": "exams.send-go" });
    var list = el("div", { class: "k-ex-sendlist" }, items.map(function (it, i) {
      var box = el("input", { type: "checkbox", class: "k-box", "aria-label": it.title, onchange: function () { picks[i] = box.checked; var n = picks.filter(Boolean).length; go.textContent = "Send " + u.plural(n, "item"); go.disabled = !n; } });
      box.checked = true;
      return el("label", { class: "k-ex-checkrow" }, [box, el("span", { class: "k-ex-grow", text: it.title }), u.muted(it.label)]);
    }));
    overlay.appendChild(el("div", { class: "k-dialog k-ex-dialog", "data-size": "sm", "data-ui": "ui.dialog exams.send-dialog" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "送" }), el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Send this week's priorities?" })]),
      el("div", { class: "k-dialog-body k-ex-dbody" }, [el("p", { text: "Adds exactly this. Nothing else changes, and nothing goes on the Calendar." }),
        el("div", { class: "k-ex-minihead", text: "To Pacing · week of " + u.pretty(wb, { dow: false }) + ", as personal rows" }), list,
        el("p", { class: "k-ex-small k-ex-muted", text: "They are ordinary personal Pacing rows tagged exam: edit or remove them in Pacing; Undo removes them all. Sending again replaces this planner's unticked rows for the week." })]),
      el("div", { class: "k-dialog-foot" }, [u.btn("Cancel", "", close), el("span", { class: "k-spacer" }), go])
    ]));
    KOS.ui.openDialog(overlay);
    var first = list.querySelector("input");
    if (first) first.focus();
  }

  /* ---------------- Results day (29ab) ---------------- */
  function results(main, series) {
    var u = U(), X = E();
    var reals = X.all().filter(function (a) { return a.tier === "real_exam" && a.date && a.date < today(); });
    var seriesList = [];
    reals.forEach(function (a) { var s = X.seriesOf(a); if (s && seriesList.indexOf(s) === -1) seriesList.push(s); });
    seriesList.sort().reverse();
    var cur = series && seriesList.indexOf(series) !== -1 ? series : seriesList[0];
    /* the rework (45a): Results is a tab of All exams, under its one tab row */
    u.head(main, "results");
    main.appendChild(KOS.ui.sectionHeader ? KOS.ui.sectionHeader({ title: cur ? (cur.slice(5) === "06" ? "Summer " + cur.slice(0, 4) : u.MONTHS[+cur.slice(5) - 1] + " " + cur.slice(0, 4)) + " results" : "Results",
      sub: "One page for the series: the grade, what was predicted, and one line on why" }) : el("h2", { text: "Results" }));
    var wrap = el("div", { class: "k-ex-page", "data-ui": "exams.results" });
    main.appendChild(wrap);
    if (!cur) { wrap.appendChild(KOS.ui.emptyState({ compact: true, mark: "試", title: "No series has been sat yet", body: "This page fills in after your real exams." })); return; }
    var mine = reals.filter(function (a) { return X.seriesOf(a) === cur; });
    var subs = {};
    mine.forEach(function (a) { var s = a.subject || "other"; (subs[s] = subs[s] || []).push(a); });
    var got = X.subjectResults(cur);
    var gc = u.card([u.chead("The grades", "against what the hub predicted before each paper")], "k-ex-flexcard", "exams.grades");
    ["maths", "compsci", "it"].filter(function (s) { return subs[s]; }).forEach(function (sid) {
      var list = subs[sid] || [];
      var preds = list.map(function (a) { return a.predictedAtExam; }).filter(Boolean);
      var G = KOS.examStats.GRADES;
      var lo = preds.length ? preds.reduce(function (m, p) { return G.indexOf(p.lo) > G.indexOf(m) ? p.lo : m; }, preds[0].lo) : null;
      var hi = preds.length ? preds.reduce(function (m, p) { return G.indexOf(p.hi) < G.indexOf(m) ? p.hi : m; }, preds[0].hi) : null;
      var res = got[sid];
      var papers = list.map(function (a) { return a.paper || a.title; }).filter(Boolean);
      var marksLine = list.filter(function (a) { return a.result && a.result.marks != null; }).map(function (a) { return (a.paper || a.title) + " " + a.result.marks; }).join(", ");
      var note = !res ? "Not entered." : lo ? (G.indexOf(res.grade) < G.indexOf(hi) ? "Above the range." : G.indexOf(res.grade) > G.indexOf(lo) ? "Below the range; a result, not a status." : "Inside the range.") + (marksLine ? " " + marksLine + "." : "") : marksLine ? marksLine + "." : "";
      var gradeSel = el("select", { class: "k-pill-select", "aria-label": "Grade for " + u.SUBJ[sid], "data-ui": "exams.grade-in", onchange: function () {
        X.setSubjectResult(cur, sid, gradeSel.value ? { grade: gradeSel.value } : null);
        u.announce(u.SUBJ[sid] + " " + (gradeSel.value || "cleared") + " logged." + (lo ? " Predicted " + lo + (hi !== lo ? " to " + hi : "") + "." : ""));
        KOS.rerender();
      } }, [el("option", { value: "", text: res ? "Clear" : "Log the grade" })].concat((sid === "it" ? ["D*", "D", "M", "P", "U"] : ["A*", "A", "B", "C", "D", "E", "U"]).map(function (g) { return el("option", { value: g, text: g }); })));
      gradeSel.value = res ? res.grade : "";
      gc.appendChild(el("div", { class: "k-ex-resrow", style: "--s: " + u.HUE[sid] }, [el("span", { class: "k-ex-vbar", "aria-hidden": "true" }),
        el("div", { class: "k-ex-grow" }, [el("div", { class: "k-ex-strong", text: u.SUBJ[sid] }), u.muted(papers.length ? u.plural(papers.length, "paper") : "")]),
        el("div", {}, [u.muted("predicted"), el("div", { class: "k-mono", text: lo ? lo + (hi !== lo ? "–" + hi : "") : "—" })]),
        res ? el("span", { class: "k-ex-fig k-ex-fig--34", text: res.grade }) : el("span"),
        el("div", { class: "k-ex-grow" }, [el("span", { class: "k-ex-small", text: note }), gradeSel])]));
    });
    var cal = KOS.examStats.calibration((KOS.tracker ? KOS.tracker.all() : []).map(function (e) { return { predicted: e.predicted, marks: e.marks, max: e.max, subject: e.subject }; }));
    gc.appendChild(el("div", { class: "k-ex-grow" }));
    gc.appendChild(el("div", { class: "k-ex-calline" }, [el("b", { text: "Calibration" }), el("span", { class: "k-ex-grow", text: cal.thin ? "Five predictions give a calibration line · " + cal.have + " so far." : "On your papers you " + (cal.gap > 1 ? "over-predict by about " + cal.gap + "%" : cal.gap < -1 ? "under-predict by about " + (-cal.gap) + "%" : "predict within a point") + "." }),
      u.linkBtn("Analytics →", function () { KOS.show("exams", { tab: "practice", sub: "analytics" }); })]));
    var side = el("div", { class: "k-ex-side" });
    /* IT: each unit's UMS from the slip and the aggregate, both from
       KOS.hub.it (invariant 26f) */
    var H = KOS.hub && KOS.hub.it ? KOS.hub.it : null;
    var rows = H ? H.units() : [], agg = H ? H.aggregate() : null;
    if (rows.length) {
      var c = u.card([u.chead("IT units · UMS", "from your results slip, else converted")], "k-ex-fill", "exams.itunits");
      rows.forEach(function (x) {
        c.appendChild(el("div", { class: "k-ex-unitum" }, [el("span", { class: "k-mono k-ex-muted", text: x.code }), el("span", { class: "k-ex-ell", text: x.title || "" }),
          el("span", { class: "k-mono", title: x.estimated ? "converted from the raw mark, an estimate" : null, text: x.ums != null ? x.ums + " / " + x.umsMax + (x.estimated ? " ≈" : "") : x.status === "sitting" ? "to sit" : "—" }),
          el("b", { text: x.grade || "" })]));
      });
      if (agg) {
        c.appendChild(el("div", { class: "k-ex-grow" }));
        c.appendChild(el("div", { class: "k-ex-aggrow" }, [el("b", { class: "k-ex-grow", text: "Aggregate · " + agg.name }), el("span", { class: "k-mono", text: agg.banked + " / " + agg.max }),
          agg.grade ? el("span", { class: "k-chip", "data-tone": "green", text: agg.grade }) : agg.soFar ? el("span", { class: "k-chip", "data-tone": "muted", text: agg.soFar + " so far" }) : null].filter(Boolean)));
        c.appendChild(u.muted("From the IT desk" + (agg.estimated ? "; a unit without a slip UMS is converted, an estimate" : "") + (agg.provisional ? "; boundaries provisional" : "") + ".", "k-ex-block"));
      }
      side.appendChild(c);
    } else side.appendChild(u.card([u.chead("IT units", ""), u.quiet("Unit marks live on the IT desk.", "")], "k-ex-fill"));
    wrap.appendChild(el("div", { class: "k-ex-grid2", "data-side": "wide" }, [gc, side]));
  }

  KOS.examViews = { planner: planner, results: results };
})();
