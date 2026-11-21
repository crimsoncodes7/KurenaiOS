/* Kurenai OS — modules/rtkit.js
   KOS.rtUI, the parts the Daily Review, the player, Home and the Routines
   page share (at boot; 1F moved the Routines page itself, js/modules/
   routines.js, to page-routines): the mark tile, the check, the subject
   bar, a routine's checklist, the habit ticks, the reward toast, the
   timeline row, the choice pills and What is sent.

   Every write goes through its owner (KOS.routines, KOS.dayReview); a
   render writes nothing (smoke56).                                         */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;
  var R = function () { return KOS.routines; };
  var V = function () { return KOS.dayReview; };

  /* ================= shared parts (KOS.rtUI) ================= */
  var TINT = { morning: "morning", afternoon: "afternoon", evening: "evening", night: "night" };
  var COVER = { morning: "morning", evening: "evening", study: "study", habit: "habit", custom: "habit" };
  var TEMPLATE_COVER = { sunday: "sunday", exam: "exam", afterschool: "habit" };
  function img(id) { return "assets/routines/img/routines." + id + ".webp"; }
  function hue(sid) { var m = sid && KOS.subjects ? KOS.subjects.meta(sid) : null; return m ? m.hue : "var(--muted)"; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function nowHm() { var d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function mins(hm) { var p = String(hm).split(":"); return +p[0] * 60 + +p[1]; }
  function hmText(m) { m = Math.round(m || 0); var h = Math.floor(m / 60), r = m % 60; return h ? h + " h" + (r ? " " + pad(r) : "") : r + " min"; }
  function dayLabel(iso, opts) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2], 12).toLocaleDateString("en-GB", opts || { weekday: "short", day: "numeric" }); }
  function plural(n, w, ws) { return n + " " + (n === 1 ? w : ws || w + "s"); }

  function tile(mark, tone, small) {
    return el("span", { class: "k-rt-tile" + (small ? " k-rt-tile--sm" : ""), "data-tone": tone || null, lang: "ja", "aria-hidden": "true", text: mark || "習" });
  }
  function toneOf(r) {
    if (!r) return null;
    if (r.anchor === "review:morning" || r.kind === "morning") return "morning";
    if (r.anchor === "review:evening" || r.kind === "evening") return "evening";
    return null;
  }
  function markOf(r) { return (r && r.mark) || (r && r.kind === "habit" ? "習" : "習"); }
  /* a check that is a real control: role checkbox, ✓ never colour alone */
  function check(on, label, onclick, opts) {
    opts = opts || {};
    var b = el("button", { type: "button", class: "k-rt-check" + (opts.round ? " k-rt-check--round" : ""), role: "checkbox",
      "aria-checked": on === "half" ? "mixed" : String(!!on), "aria-label": label, "data-ui": opts.hook || "routine.check",
      disabled: opts.disabled ? true : null, text: on === true ? "✓" : "", onclick: onclick || null });
    if (on === "half") KOS.ui.state(b, "half", true);
    return b;
  }
  function bar(c) { return el("span", { class: "k-rt-sub", "aria-hidden": "true", style: "--c: " + (c || "var(--muted)") }); }
  function kind(t) { return el("span", { class: "k-rt-kind", text: t }); }
  function muted(t) { return el("span", { class: "k-muted k-rt-small", text: t }); }
  function head(title, meta, right) {
    return el("div", { class: "k-rt-hd" }, [el("h3", { class: "k-rt-hd-t", text: title }), meta ? el("span", { class: "k-rt-hd-m k-ellipsis", text: meta }) : null, el("span", { class: "k-rt-fill" }), right || null]);
  }
  function card(children, cls, hook) { return el("section", { class: "k-card k-rt-card" + (cls ? " " + cls : ""), "data-ui": hook || null }, children); }
  /* radio pills: opts [label], active index, onPick(i) */
  function choice(labels, active, onPick, opts) {
    opts = opts || {};
    return el("div", { class: "k-rt-choice" + (opts.big ? " k-rt-choice--big" : ""), role: "radiogroup", "aria-label": opts.label || null },
      labels.map(function (t, i) {
        return el("button", { type: "button", class: "k-rt-pill", role: "radio", "aria-checked": String(i === active), "data-ui": opts.hook || "routine.pill",
          text: (i === active ? "● " : "") + t, onclick: function () { if (onPick) onPick(i); } });
      }));
  }
  function rewardText(a) {
    if (!a) return "";
    return a.xp || a.gold || a.hp ? "+" + a.xp + " XP · " + a.gold + " gold · +" + a.hp + " HP" : "No reward · past today's " + R().CAP;
  }
  function reward(a) { return el("span", { class: "k-rt-reward", "data-state": a && (a.xp || a.gold || a.hp) ? null : "none", text: rewardText(a) }); }
  /* the result of a tick, said once (invariant 143): the routine's chip in a toast */
  function afterTick(r, res) {
    if (!res || !res.ok) { if (res && res.why) KOS.ui.toast(res.why, true); return; }
    if (res.award) {
      /* HR-21: Undo puts the day back as it was and takes the pay back
         through one correction entry */
      var u = res.undo;
      KOS.ui.toast(r.name + " kept · " + rewardText(res.award), false, u ? { label: "Undo", run: function () {
        R().undoTick(u);
        KOS.ui.toast(r.name + " · undone");
        KOS.rerender();
      } } : null);
    }
  }
  /* one routine step ticked (the same log the player writes) */
  function tickStep(r, stepId, on, opts, after) {
    var res = R().tick(r.id, stepId, on, opts || {});
    afterTick(r, res);
    if (after) after(res); else KOS.rerender();
    return res;
  }

  /* a timeline row: time, a mark by shape (lesson ●, study ■, event ○, a
     routine or review dashed), the title and its kind */
  function tlRow(x, opts) {
    opts = opts || {};
    var mark = x.kind === "routine" || x.kind === "review";
    return el("div", { class: "k-rt-tl", "data-kind": x.kind, "data-ui": "review.tl-row" }, [
      /* an untimed row (a lesson with no class time) leaves the time
         column empty rather than printing a bare dash (audit PR-20) */
      el("span", { class: "k-rt-tl-time k-mono" }, [x.start || "", x.start && x.end && !mark ? el("span", { class: "k-rt-tl-end", text: x.end }) : null]),
      el("span", { class: "k-rt-tl-rail", "aria-hidden": "true" }, [el("span", { class: "k-rt-tl-mark", "data-kind": x.kind, style: "--c: " + hue(x.subject) })]),
      el("span", { class: "k-rt-tl-body" }, [
        el("span", { class: "k-rt-tl-title" }, [el("span", { class: "k-ellipsis", text: x.title }),
          opts.kinds === false ? null : kind(x.kind === "study" ? "study block" : x.kind === "plan" ? "lesson" : x.kind),
          x.done ? el("span", { class: "k-muted k-rt-small", text: "✓" }) : null]),
        x.sub || x.room ? el("span", { class: "k-muted k-rt-small k-ellipsis", text: x.sub || x.room }) : null
      ])
    ]);
  }
  function nowMark(t) {
    return el("div", { class: "k-rt-now", "aria-label": "Now, " + t }, [el("span", { class: "k-mono k-rt-now-t", text: t }), el("span", { class: "k-rt-now-dot" }), el("span", { class: "k-rt-now-line" })]);
  }

  /* a routine's checklist (frames 33a, 33g, 33j): the progress strip, each
     step a checkbox, a step's link, Start routine; opts.day for last night */
  function checklist(r, opts) {
    opts = opts || {};
    var day = opts.day || R().routineDay();
    var e = R().entry(r.id, day);
    var steps = R().stepsFor(r, e)
      .map(function (s) { var full = r.steps.filter(function (x) { return x.id === s.id; })[0]; return Object.assign({}, full || {}, s); })
      .filter(function (s) { return !s.checkMorning; });
    var ticked = (e && e.steps) || {};
    var req = steps.filter(function (s) { return !s.optional; });
    var n = req.filter(function (s) { return ticked[s.id]; }).length;
    /* a step that runs another routine (1C): named and timed by that routine,
       with how far it has got today; ticking it ticks that routine */
    function innerOf(s) { var t = s.run ? R().get(s.run) : null; return t && !t.archived ? t : null; }
    function minsOf(s) { var t = innerOf(s); return t ? t.steps.reduce(function (m, x) { return m + (x.optional ? 0 : x.mins || 0); }, 0) : s.mins || 0; }
    var total = steps.reduce(function (m, s) { return m + minsOf(s); }, 0);
    var w = R().windowOn(r, day);
    var rows = el("div", { class: "k-rt-steps", "data-ui": "routine.steps" });
    steps.forEach(function (s) {
      var on = !!ticked[s.id], inner = innerOf(s), name = inner ? inner.name : s.text;
      var iv = inner ? R().verdict(inner, R().entry(inner.id, day)) : null;
      var row = el("div", { class: "k-rt-step", "data-ui": "routine.step" + (inner ? " routine.run-step" : "") }, [
        check(on, (on ? "Untick " : "Tick ") + name + (inner ? ", all its steps" : ""), function () { tickStep(r, s.id, !on, { day: day }, opts.after); }),
        el("span", { class: "k-rt-step-t k-ellipsis", text: name }),
        inner ? el("span", { class: "k-rt-small k-rt-text2", "data-ui": "routine.run-progress", text: "↻ " + iv.n + " of " + iv.of }) : null,
        s.optional ? muted("optional") : null,
        s.minimum ? el("span", { class: "k-rt-min", text: "◐ minimum" }) : null,
        s.link ? el("button", { type: "button", class: "k-link k-rt-small", "data-ui": "routine.step-link", text: "↗ " + linkLabel(s.link), onclick: function () { openLink(s.link, r, s); } }) : null,
        minsOf(s) ? el("span", { class: "k-mono k-rt-step-m", text: minsOf(s) + " min" }) : null
      ]);
      if (on) KOS.ui.state(row, "done", true);
      rows.appendChild(row);
    });
    var state = R().stateOn(r, day);
    return el("div", { class: "k-rt-list", "data-ui": "routine.checklist", "data-routine": String(r.id) }, [
      opts.head === false ? null : el("div", { class: "k-rt-list-h" }, [
        tile(markOf(r), toneOf(r)),
        el("div", { class: "k-rt-list-ht" }, [el("b", { text: r.name }), muted([schedText(r), total ? "about " + total + " min" : null].filter(Boolean).join(" · "))]),
        w && opts.leave !== false && r.anchor === "review:morning" ? el("div", { class: "k-rt-leave" }, [el("b", { class: "k-mono", text: "Leave by " + w.to }), muted(leaveText(w.to))]) : null,
        opts.start === false ? null : el("button", { type: "button", class: "k-btn k-btn--primary k-btn--sm", "data-ui": "routine.start", text: "▶ Start", onclick: function () { if (KOS.routinePlayer) KOS.routinePlayer.open(r.id, { day: day }); } })
      ]),
      el("div", { class: "k-rt-progress", role: "img", "aria-label": n + " of " + req.length + " required steps" },
        steps.map(function (s) { var p = el("span"); if (ticked[s.id]) KOS.ui.state(p, "on", true); return p; })),
      rows,
      opts.foot === false ? null : el("div", { class: "k-rt-list-f" }, [
        state === "rest" ? muted("休 a planned rest day") : null,
        opts.rest !== false && state !== "rest" && state !== "done" && R().scheduledOn(r, day) && day === R().routineDay()
          ? el("button", { type: "button", class: "k-btn k-btn--quiet k-btn--sm", "data-ui": "routine.rest", text: "Plan a rest day", onclick: function () {
            var res = R().setRest(r.id, true);
            KOS.ui.toast(res.ok ? r.name + " · rest day planned" : res.why, !res.ok);
            if (opts.after) opts.after(); else KOS.rerender();
          } }) : null,
        el("span", { class: "k-rt-fill" }),
        muted(n + " of " + req.length + (opts.note ? " · " + opts.note : ""))
      ])
    ]);
  }
  function leaveText(to) {
    var d = mins(to) - mins(nowHm());
    return d > 0 && d < 240 ? d + " min from now" : "";
  }
  function schedText(r) {
    if (r.days === null) return "no schedule";
    if (r.every) return "every " + r.every + " days" + (r.window ? " · " + r.window.from + "–" + r.window.to : "");
    var d = r.days || [];
    var days = !d.length ? "every day" : d.join() === "1,2,3,4,5" ? "weekdays" : d.join() === "0,6" ? "weekends"
      : d.map(function (x) { return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][x]; }).join(", ");
    return days + (r.window ? " · " + r.window.from + "–" + r.window.to : "");
  }
  function linkLabel(l) {
    if (l.kind === "focus") return "Focus";
    if (l.kind === "review") return "the " + l.to + " review";
    if (l.kind === "url") return "link";
    return { today: "today's timetable", tomorrow: "tomorrow's timetable", books: "Books", pacing: "the plan", reminders: "Reminders", exams: "Exams" }[l.to] || l.to;
  }
  /* a step's link (frame 33p): a timetable sheet, a view, Focus, a review, a URL */
  function openLink(l, r, s) {
    if (l.kind === "url") { window.open(l.to, "_blank", "noopener"); return; }
    if (l.kind === "focus") { if (KOS.routinePlayer) KOS.routinePlayer.preflight({}); return; }
    if (l.kind === "review") { if (KOS.reviewSheet) KOS.reviewSheet.open(l.to); return; }
    if (l.to === "today" || l.to === "tomorrow") { if (KOS.routinePlayer) KOS.routinePlayer.daySheet(l.to === "tomorrow" ? 1 : 0, r, s); return; }
    var view = { books: "books", pacing: "pacing", reminders: "reminders", exams: "exams" }[l.to] || l.to;
    if (KOS.views[view]) KOS.show(view);
  }

  /* the day's habits as one-tap ticks (33j). Ticking is all Today does:
     the habits are set up in the Daily habits routine's own editor */
  function habitTicks(opts) {
    opts = opts || {};
    var day = R().routineDay();
    var hs = R().all({ kind: "habit" });
    var due = hs.filter(function (h) { return R().scheduledOn(h, day); });
    var kept = due.filter(function (h) { var st = R().stateOn(h, day); return st === "done" || st === "min"; }).length;
    var list = el("div", { class: "k-rt-habits", "data-ui": "routine.habits" });
    /* today's habits first, then the rest of the week's, quieter */
    due.concat(hs.filter(function (h) { return due.indexOf(h) === -1; })).forEach(function (h) {
      var st = R().stateOn(h, day), on = st === "done" || st === "min", s0 = h.steps[0], today0 = R().scheduledOn(h, day);
      var streak = R().streak(h.id), e = R().entry(h.id, day);
      var sub = !today0 ? "not today · " + schedText(h) : h.auto ? (on && e && e.auto ? "自 ticked itself · " : "自 ") + R().autoText(h.auto) : h.window ? h.window.from + "–" + h.window.to : "";
      var subEl = sub ? muted(sub) : null;
      if (h.auto && today0 && !on && subEl) R().autoMeasure(h.auto, day, function (v) { if (v != null) subEl.textContent = "自 " + Math.min(v, h.auto.n) + " of " + R().autoText(h.auto); });
      /* several times a day: a tick per time, the day kept with the last */
      var times = h.times && today0 && st !== "rest" ? el("span", { class: "k-rt-times", role: "group", "aria-label": h.name + ", today's times" }, R().stepsFor(h, e).map(function (sx) {
        var done = !!(e && e.steps && e.steps[sx.id]);
        return el("button", { type: "button", class: "k-rt-time-tick", role: "checkbox", "aria-checked": String(done), "data-ui": "routine.habit-time",
          "aria-label": (done ? "Untick " : "Tick ") + h.name + " at " + (sx.at || ""), text: (done ? "✓ " : "") + (sx.at || ""), onclick: function () { tickStep(h, sx.id, !done, {}, opts.after); } });
      })) : null;
      if (h.times && today0) subEl = muted((e && e.steps ? Object.keys(e.steps).length : 0) + " of " + h.times.length + " today");
      var row = el("div", { class: "k-rt-habit", "data-ui": "routine.habit" }, [
        st === "rest" ? el("span", { class: "k-rt-check k-rt-check--rest", lang: "ja", "aria-label": h.name + ": rest day", text: "休" })
          : check(h.times && !on && e && e.steps && Object.keys(e.steps).length ? "half" : on, (on ? "Untick " : "Tick ") + h.name, function () {
            if (h.times) { var nx = R().stepsFor(h, e).filter(function (sx) { return !(e && e.steps && e.steps[sx.id]); })[0]; if (nx) tickStep(h, nx.id, true, {}, opts.after); else if (s0) tickStep(h, R().stepsFor(h, e).slice(-1)[0].id, false, {}, opts.after); return; }
            if (s0) tickStep(h, s0.id, !on, {}, opts.after);
          }, { hook: "routine.habit-tick", disabled: !today0 }),
        el("span", { class: "k-rt-habit-t" }, [el("span", { class: "k-ellipsis", text: h.name }), subEl, times].filter(Boolean)),
        st === "rest" ? muted("休 rest day") : streak ? muted("炎 " + streak) : null
      ]);
      if (on) KOS.ui.state(row, "done", true);
      if (!today0) KOS.ui.state(row, "off", true);
      list.appendChild(row);
    });
    return card([
      head("Daily habits", hs.length ? kept + " of " + due.length + " today" : "a habit is a routine with one step",
        el("button", { type: "button", class: "k-link k-rt-small", "data-ui": "routine.habits-edit", text: hs.length ? "Edit ›" : "Add habits ›", onclick: function () { KOS.show("routines", { edit: "habits" }); } })),
      hs.length ? list : el("p", { class: "k-muted k-rt-small", text: "Anything you want to keep up. One can tick itself from what you already do — 30 minutes on CS, twenty cards, a plan row." })
    ], "k-rt-habitcard", "routine.habit-card");
  }

  function whatIsSent() {
    var d = V().due() || { slot: "morning" };
    var c = V().content(d.slot);
    var pre = el("pre", { class: "k-rt-pre", text: JSON.stringify(V().payload(d.slot, c), null, 2) });
    var t = el("h2", { class: "k-dialog-title", text: "What is sent · " + V().LABEL[d.slot] });
    var overlay = el("div", { class: "k-dialog-overlay" }, [el("div", { class: "k-dialog k-rt-sent", "data-ui": "review.what-sent-dialog" }, [
      el("div", { class: "k-dialog-head" }, [t]),
      el("div", { class: "k-dialog-body" }, [pre, el("p", { class: "k-muted k-rt-small", text: "Never sent: notes, card text, the evening note, mood, energy, money, chat history." })]),
      el("div", { class: "k-dialog-foot" }, [el("button", { type: "button", class: "k-btn k-btn--primary", text: "Close", onclick: function () { overlay.remove(); } })])
    ])]);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.remove(); });
    KOS.ui.openDialog(overlay, { labelledBy: t });
  }

  KOS.rtUI = { tile: tile, check: check, bar: bar, kind: kind, muted: muted, head: head, card: card, choice: choice, reward: reward, rewardText: rewardText,
    afterTick: afterTick, tickStep: tickStep, tlRow: tlRow, nowMark: nowMark, checklist: checklist, habitTicks: habitTicks, toneOf: toneOf, markOf: markOf,
    hue: hue, img: img, hmText: hmText, dayLabel: dayLabel, plural: plural, schedText: schedText, openLink: openLink, linkLabel: linkLabel, whatIsSent: whatIsSent,
    COVER: COVER, TEMPLATE_COVER: TEMPLATE_COVER, nowHm: nowHm, mins: mins };
})();
