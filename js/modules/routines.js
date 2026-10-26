/* Kurenai OS — modules/routines.js
   The Routines page (roadmap 5.10, design turn 33, frames 33j–33n, 33r–33s),
   replacing Habits under Productivity: `#/routines[/routines|templates|
   history|settings]`, a routine's editor `#/routines/edit/<id|new>`.

   KOS.rtUI holds the parts the Daily Review, the player and Home share: the
   mark tile, the check, the subject bar, a routine's checklist, the habit
   ticks, the reward toast, the timeline row and the choice pills.

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
      var kept = r.kind === "habit" ? r.name + " kept" : r.name + " kept";
      KOS.ui.toast(kept + " · " + rewardText(res.award));
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
      el("span", { class: "k-rt-tl-time k-mono" }, [x.start || "—", x.end && !mark ? el("span", { class: "k-rt-tl-end", text: x.end }) : null]),
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
    var steps = (e && e.snap ? e.snap.map(function (x) { return { id: x[0], text: x[1], optional: !!x[2], minimum: !!x[3], checkMorning: !!x[4] }; }) : r.steps)
      .map(function (s) { var full = r.steps.filter(function (x) { return x.id === s.id; })[0]; return Object.assign({}, full || {}, s); })
      .filter(function (s) { return !s.checkMorning; });
    var ticked = (e && e.steps) || {};
    var req = steps.filter(function (s) { return !s.optional; });
    var n = req.filter(function (s) { return ticked[s.id]; }).length;
    var total = steps.reduce(function (m, s) { return m + (s.mins || 0); }, 0);
    var w = R().windowOn(r, day);
    var rows = el("div", { class: "k-rt-steps", "data-ui": "routine.steps" });
    steps.forEach(function (s) {
      var on = !!ticked[s.id];
      var row = el("div", { class: "k-rt-step", "data-ui": "routine.step" }, [
        check(on, (on ? "Untick " : "Tick ") + s.text, function () { tickStep(r, s.id, !on, { day: day }, opts.after); }),
        el("span", { class: "k-rt-step-t k-ellipsis", text: s.text }),
        s.optional ? muted("optional") : null,
        s.minimum ? el("span", { class: "k-rt-min", text: "◐ minimum" }) : null,
        s.link ? el("button", { type: "button", class: "k-link k-rt-small", "data-ui": "routine.step-link", text: "↗ " + linkLabel(s.link), onclick: function () { openLink(s.link, r, s); } }) : null,
        s.mins ? el("span", { class: "k-mono k-rt-step-m", text: s.mins + " min" }) : null
      ]);
      if (on) KOS.ui.state(row, "done", true);
      rows.appendChild(row);
    });
    var state = R().stateOn(r, day);
    return el("div", { class: "k-rt-list", "data-ui": "routine.checklist" }, [
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

  /* the day's habits as one-tap ticks (33j) and the one-line add */
  function habitTicks(opts) {
    opts = opts || {};
    var day = R().routineDay();
    var hs = R().all({ kind: "habit" });
    var kept = hs.filter(function (h) { var st = R().stateOn(h, day); return st === "done" || st === "min"; }).length;
    var due = hs.filter(function (h) { return R().scheduledOn(h, day); });
    var list = el("div", { class: "k-rt-habits", "data-ui": "routine.habits" });
    hs.forEach(function (h) {
      var st = R().stateOn(h, day), on = st === "done" || st === "min", s0 = h.steps[0];
      var streak = R().streak(h.id);
      var row = el("div", { class: "k-rt-habit", "data-ui": "routine.habit" }, [
        st === "rest" ? el("span", { class: "k-rt-check k-rt-check--rest", lang: "ja", "aria-label": h.name + ": rest day", text: "休" })
          : check(on, (on ? "Untick " : "Tick ") + h.name, function () { if (s0) tickStep(h, s0.id, !on, {}, opts.after); }, { hook: "routine.habit-tick", disabled: !R().scheduledOn(h, day) }),
        el("span", { class: "k-rt-habit-t k-ellipsis", text: h.name }),
        st === "rest" ? muted("休 rest day") : streak ? muted("炎 " + streak) : null
      ]);
      if (on) KOS.ui.state(row, "done", true);
      list.appendChild(row);
    });
    var input = el("input", { type: "text", class: "k-rt-add-in", placeholder: "Add a daily habit…", "aria-label": "New daily habit", "data-ui": "routine.habit-add",
      onkeydown: function (e) { if (e.key === "Enter") submit(); } });
    function submit() {
      var t = input.value.trim();
      if (!t) return;
      R().addHabit(t);
      KOS.a11y && KOS.a11y.announce("Added " + t);
      if (opts.after) opts.after(); else KOS.rerender();
    }
    return card([
      head("Daily habits", hs.length ? kept + " of " + due.length + " today · one tap each" : "a habit is a routine with one step"),
      hs.length ? list : el("p", { class: "k-muted k-rt-small", text: "Anything you want to keep daily. Ticking one pays the small trickle a habit always did." }),
      el("div", { class: "k-rt-add" }, [el("span", { "aria-hidden": "true", text: "＋" }), input, el("span", { class: "k-mono k-rt-small k-muted", "aria-hidden": "true", text: "⏎" })])
    ], "k-rt-habitcard", "routine.habit-card");
  }

  /* ================= the page ================= */
  var TABS = [["today", "Today"], ["routines", "Routines"], ["templates", "Templates"], ["history", "History"], ["settings", "Settings"]];

  KOS.views.routines = function (main, arg) {
    KOS.shell.tree("none");
    if (arg && arg.edit) { editor(main, arg.edit); return; }
    var tab = typeof arg === "string" && TABS.some(function (t) { return t[0] === arg; }) ? arg : "today";
    main.appendChild(KOS.ui.pageHeader({ kicker: "習 · Routines", title: "Routines",
      sub: "Ordered steps you do on certain days. A habit is a routine with one step.",
      actions: [
        el("button", { type: "button", class: "k-btn", "data-ui": "routine.templates", text: "Templates", onclick: function () { KOS.show("routines", "templates"); } }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "routine.new", text: "＋ New routine", onclick: function () { KOS.show("routines", { edit: "new" }); } })
      ] }));
    main.appendChild(KOS.ui.scroller(KOS.ui.tabs(TABS.map(function (t) {
      return { label: t[1], active: t[0] === tab, onSelect: function () { KOS.show("routines", t[0] === "today" ? undefined : t[0]); } };
    }), { label: "Routines" }), { keepRole: true }));
    var body = el("div", { class: "k-rt-page", "data-ui": "routine.page", "data-tab": tab });
    main.appendChild(body);
    if (tab === "today") today(body);
    else if (tab === "routines") routinesTab(body);
    else if (tab === "templates") templatesTab(body);
    else if (tab === "history") history(body);
    else settings(body);
  };
  KOS.views.tasks = KOS.views.routines;

  /* "Start with these?" (33n): offered on a first visit, never made unasked */
  function firstVisit() {
    var none = !R().all({ archived: true }).some(function (r) { return r.kind !== "habit"; });
    var ui = store.state.ui || {};
    return none && ui.routinesOffer !== "dismissed";
  }
  function offerCard() {
    var picks = { morning: true, evening: true, study: false };
    var rows = el("div", { class: "k-rt-offer-list" });
    var addBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "routine.offer-add" });
    function paint() {
      rows.innerHTML = "";
      ["morning", "evening", "study"].forEach(function (id) {
        var t = R().template(id);
        if (!t) return;
        rows.appendChild(el("div", { class: "k-rt-offer-row" }, [
          check(picks[id], (picks[id] ? "Leave out " : "Add ") + t.name, function () { picks[id] = !picks[id]; paint(); }, { hook: "routine.offer-pick" }),
          tile(t.mark, id === "study" ? null : id),
          el("span", { class: "k-rt-grow" }, [el("b", { text: t.name }), muted(t.steps.length + " steps · " + t.blurb)])
        ]));
      });
      var n = Object.keys(picks).filter(function (k) { return picks[k]; }).length;
      addBtn.textContent = n ? "Add " + (n === 1 ? "this one" : n === 2 ? "these two" : "these three") : "Pick one to add";
      addBtn.disabled = !n;
    }
    addBtn.onclick = function () {
      var made = Object.keys(picks).filter(function (k) { return picks[k]; }).map(function (k) { return R().fromTemplate(k, { remind: k !== "study" }); });
      KOS.ui.toast(made.map(function (r) { return r.name; }).join(" and ") + " added");
      KOS.rerender();
    };
    paint();
    return card([
      el("img", { class: "k-rt-spot", src: img("spot.fresh"), alt: "", loading: "lazy" }),
      el("div", { class: "k-rt-grow" }, [
        el("h2", { class: "k-rt-offer-t", text: "Start with these?" }),
        el("p", { class: "k-rt-lead", text: "Three routines that fit a school day. Pick any; each becomes yours to change. Nothing is made until you choose." }),
        rows,
        el("div", { class: "k-cluster" }, [addBtn,
          el("button", { type: "button", class: "k-btn", text: "Start from blank", onclick: function () { KOS.show("routines", { edit: "new" }); } }),
          el("button", { type: "button", class: "k-btn k-btn--quiet", "data-ui": "routine.offer-dismiss", text: "Not now", onclick: function () {
            store.state.ui.routinesOffer = "dismissed"; store.save(); KOS.rerender();
          } })])
      ])
    ], "k-rt-offercard k-rt-offer", "routine.offer");
  }

  /* ---------------- Today (33j) ---------------- */
  function reviewsCard() {
    var day = R().routineDay(), due = V().due();
    var rows = el("div", { class: "k-rt-rows" });
    var slots = V().SLOTS.map(function (s) { return { slot: s, time: V().slotTime(s, day), state: (V().day(day)[s] || {}).state || null }; });
    var mk = { morning: "朝", afternoon: "昼", evening: "夜" };
    slots.forEach(function (s) {
      var rec = V().day(day)[s.slot] || {};
      var right, sub;
      if (!s.time) { sub = V().easy(day) ? "off this week (Easy week)" : "off"; right = muted("–"); }
      else if (s.state === "done") { sub = "done at " + (rec.doneAt ? new Date(rec.doneAt).toTimeString().slice(0, 5) : s.time); right = el("span", { class: "k-rt-small k-rt-status", text: "✓ Done" }); }
      else if (s.state === "skipped") { sub = "skipped, and that's fine"; right = el("span", { class: "k-rt-small k-muted", text: "– skipped" }); }
      else if (s.state === "folded") { sub = "folded into the next review"; right = el("span", { class: "k-rt-small k-muted", text: "→ folded" }); }
      else if (due && due.slot === s.slot) {
        sub = "ready since " + s.time;
        right = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "review.open", text: "Open", onclick: function () { KOS.reviewSheet.open(s.slot); } });
      } else if (due && V().SLOTS.indexOf(s.slot) < V().SLOTS.indexOf(due.slot)) {
        sub = "folds into the " + due.slot + " review"; right = el("span", { class: "k-rt-small k-muted", text: "→ folds" });
      } else { sub = "at " + s.time; right = el("span", { class: "k-rt-small k-muted", text: "○ Later" }); }
      rows.appendChild(el("div", { class: "k-rt-row", "data-ui": "review.status" }, [tile(mk[s.slot], s.slot), el("div", { class: "k-rt-grow" }, [el("b", { text: V().LABEL[s.slot] }), muted(sub)]), right]));
    });
    var three = (V().day(day).morning || {}).three || [];
    var picks = three.map(function (ref) { var x = V().resolve(ref); return x ? Object.assign({ ref: ref }, x) : null; }).filter(Boolean);
    return card([
      head("Today's reviews", V().easy(day) ? "Easy week · until " + dayLabel(V().cfg().easyUntil, { weekday: "short", day: "numeric", month: "short" }) : "nothing here pays or counts"),
      rows,
      picks.length ? el("div", { class: "k-rt-three-mini" }, [el("div", { class: "k-rt-sec", text: "Today's three" })].concat(picks.map(function (p) {
        return el("div", { class: "k-rt-row k-rt-row--tight" }, [el("span", { class: "k-rt-mark", text: p.done ? "✓" : "○" }), el("span", { class: "k-rt-grow k-ellipsis", text: p.title }), muted(p.done ? "done" : "")]);
      }))) : null
    ], "k-rt-reviews", "review.status-card");
  }
  function dueNowCard() {
    var day = R().routineDay(), now = nowHm();
    var list = R().today().filter(function (x) { return x.kind !== "habit"; });
    var open = list.filter(function (x) { return x.window && x.window.from <= now && now < x.window.to && x.state !== "done" && x.state !== "min" && x.state !== "rest"; });
    var next = list.filter(function (x) { return x.window && x.window.from > now; }).sort(function (a, b) { return a.window.from < b.window.from ? -1 : 1; })[0];
    var r = open[0] ? R().get(open[0].id) : null;
    if (!r) {
      var any = list.filter(function (x) { return x.state !== "done" && x.state !== "min" && x.state !== "rest"; })[0];
      r = any ? R().get(any.id) : null;
    }
    if (!r) {
      return card([head("Due now"), KOS.ui.emptyState({ compact: true, mark: "済",
        body: next ? "Nothing due now. " + next.name + " at " + next.window.from + "." : list.length ? "Every routine for today is kept." : "No routine scheduled today." })], "k-rt-duenow", "routine.due-now");
    }
    return card([checklist(r, { day: day, note: next && next.id !== r.id ? "next: " + next.name + " at " + next.window.from : null })], "k-rt-duenow", "routine.due-now");
  }
  function today(body) {
    if (firstVisit()) body.appendChild(offerCard());
    body.appendChild(el("div", { class: "k-rt-today" }, [reviewsCard(), dueNowCard(), habitTicks()]));
  }

  /* ---------------- Routines (33k) ---------------- */
  function coverOf(r) { return img("cover." + (TEMPLATE_COVER[r.template] || COVER[r.kind] || "habit")); }
  function cellStrip(r) {
    var day = R().routineDay(), from = KOS.srs.addDays(day, -27);
    var cells = R().history(r.id, from, day).filter(function (x) { return x.state !== "off" && !(x.day === day && x.state === "open"); });
    return el("div", { class: "k-rt-strip", role: "img", "aria-label": cells.filter(function (c) { return c.state === "done" || c.state === "min"; }).length + " kept of " + cells.length + " scheduled days" },
      cells.map(function (c) { return el("span", { "data-state": c.state === "done" || c.state === "min" ? "kept" : c.state === "rest" ? "rest" : "not", title: dayLabel(c.day) + " · " + c.state }); }));
  }
  function share(r) {
    var day = R().routineDay(), s = R().summary(r.id, KOS.srs.addDays(day, -27), day);
    return s.scheduled ? Math.round(100 * s.kept / s.scheduled) : null;
  }
  function routineCard(r) {
    var pct = r.days === null ? null : share(r), streak = R().streak(r.id), best = R().best(r.id);
    var total = r.steps.reduce(function (m, s) { return m + (s.mins || 0); }, 0);
    var uses = r.days === null ? Object.keys((store.state.routines && store.state.routines.log) || {}).filter(function (k) { return k.indexOf(r.id + "|") === 0 && k.split("|")[1] >= KOS.srs.addDays(R().routineDay(), -30); }).length : 0;
    return el("article", { class: "k-card k-rt-card k-rt-rcard", "data-ui": "routine.card" }, [
      el("div", { class: "k-rt-cover" }, [el("img", { src: coverOf(r), alt: "", loading: "lazy" }), tile(markOf(r), toneOf(r))]),
      el("button", { type: "button", class: "k-rt-rcard-t", "data-ui": "routine.edit", text: r.name, onclick: function () { KOS.show("routines", { edit: r.id }); } }),
      muted(plural(r.steps.length, "step") + (total ? " · " + total + " min" : "") + " · " + schedText(r)),
      r.days === null ? el("div", { class: "k-rt-rcard-n" }, [el("span", { class: "k-rt-small", text: uses ? plural(uses, "time") + " this month" : "Not used yet" })])
        : el("div", { class: "k-rt-rcard-n" }, [el("b", { class: "k-rt-big", text: pct == null ? "—" : pct + "%" }), muted(pct == null ? "too early to call" : "kept · last 4 weeks")]),
      r.days === null ? null : cellStrip(r),
      el("div", { class: "k-cluster k-rt-rcard-f" }, [
        el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "routine.start", text: "▶ Start", onclick: function () { KOS.routinePlayer.open(r.id); } }),
        el("button", { type: "button", class: "k-btn k-btn--quiet k-btn--sm", text: "Edit", onclick: function () { KOS.show("routines", { edit: r.id }); } }),
        el("span", { class: "k-rt-fill" }),
        r.days !== null && (streak || best) ? muted("炎 " + streak + " · best " + best) : null
      ])
    ]);
  }
  var weekOffset = 0;
  function habitGrid() {
    var hs = R().all({ kind: "habit" });
    var today0 = R().routineDay();
    var p = today0.split("-"), dt = new Date(+p[0], +p[1] - 1, +p[2], 12);
    var mon = KOS.srs.addDays(today0, -((dt.getDay() + 6) % 7) + 7 * weekOffset);
    var days = [];
    for (var i = 0; i < 7; i++) days.push(KOS.srs.addDays(mon, i));
    var grid = el("div", { class: "k-rt-grid", role: "table", "aria-label": "Daily habits, week of " + dayLabel(mon, { day: "numeric", month: "short" }) }, [
      el("div", { class: "k-rt-grid-row k-rt-grid-head", role: "row" }, [el("span", { role: "columnheader" }, [el("span", { class: "sr-only", text: "Habit" })])]
        .concat(days.map(function (d) { var h = el("span", { role: "columnheader", class: "k-rt-grid-d", text: dayLabel(d) }); if (d === today0) KOS.ui.state(h, "today", true); return h; }))
        .concat([el("span", { role: "columnheader", class: "k-rt-grid-d", text: "Streak" })]))
    ]);
    hs.forEach(function (h) {
      grid.appendChild(el("div", { class: "k-rt-grid-row", role: "row", "data-ui": "routine.grid-row" }, [el("span", { role: "rowheader", class: "k-ellipsis k-rt-grid-name", text: h.name })]
        .concat(days.map(function (d) {
          var st = d > today0 ? "ahead" : R().stateOn(h, d);
          var on = st === "done" || st === "min";
          var cellState = on ? "kept" : st === "rest" ? "rest" : st === "ahead" ? "ahead" : d === today0 ? "today" : st === "off" ? "off" : "not";
          if (d === today0 && h.steps[0]) {
            return el("span", { role: "cell", class: "k-rt-grid-c" }, [el("button", { type: "button", class: "k-rt-cell", "data-state": cellState, "data-ui": "routine.grid-tick", "aria-pressed": String(on),
              "aria-label": h.name + ", today" + (on ? ", kept" : ""), text: on ? "✓" : st === "rest" ? "休" : "",
              onclick: function () { tickStep(h, h.steps[0].id, !on); } })]);
          }
          return el("span", { role: "cell", class: "k-rt-grid-c" }, [el("span", { class: "k-rt-cell", "data-state": cellState, "aria-label": dayLabel(d) + ": " + (on ? "kept" : st), text: on ? "✓" : st === "rest" ? "休" : "" })]);
        }))
        .concat([el("span", { role: "cell", class: "k-muted k-rt-small", text: R().streak(h.id) ? "炎 " + R().streak(h.id) : "" })])));
    });
    return card([
      head("Daily habits", hs.length ? "one-step routines" : "none yet",
        el("span", { class: "k-cluster k-rt-weeknav" }, [
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Previous week", text: "‹", onclick: function () { weekOffset--; KOS.rerender(); } }),
          el("span", { class: "k-rt-small", text: "w/c " + dayLabel(mon, { day: "numeric", month: "short" }) }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Next week", text: "›", disabled: weekOffset >= 0 ? true : null, onclick: function () { weekOffset++; KOS.rerender(); } })
        ])),
      hs.length ? grid : el("p", { class: "k-muted k-rt-small", text: "Add a habit and the week fills in here." }),
      habitAdd()
    ], "k-rt-gridcard", "routine.habit-grid");
  }
  function habitAdd() {
    var input = el("input", { type: "text", class: "k-rt-add-in", placeholder: "Add a daily habit…", "aria-label": "New daily habit", "data-ui": "routine.habit-add",
      onkeydown: function (e) { if (e.key === "Enter" && input.value.trim()) { R().addHabit(input.value.trim()); KOS.rerender(); } } });
    return el("div", { class: "k-rt-add" }, [el("span", { "aria-hidden": "true", text: "＋" }), input, el("span", { class: "k-mono k-rt-small k-muted", "aria-hidden": "true", text: "⏎" })]);
  }
  function routinesTab(body) {
    var rs = R().all().filter(function (r) { return r.kind !== "habit"; });
    if (firstVisit()) body.appendChild(offerCard());
    /* as many columns as cards, up to four, so no row ends in a gap */
    if (rs.length) body.appendChild(el("div", { class: "k-rt-cards", "data-ui": "routine.cards", style: "--n: " + Math.min(4, rs.length) }, rs.map(routineCard)));
    body.appendChild(habitGrid());
    var arch = R().all({ archived: true }).filter(function (r) { return r.archived; });
    if (arch.length) body.appendChild(card([head("Archived", plural(arch.length, "routine")), el("div", { class: "k-rt-rows" }, arch.map(function (r) {
      return el("div", { class: "k-rt-row" }, [tile(markOf(r), toneOf(r), true), el("span", { class: "k-rt-grow", text: r.name }),
        el("button", { type: "button", class: "k-btn k-btn--quiet k-btn--sm", text: "Restore", onclick: function () { R().archive(r.id, false); KOS.rerender(); } })]);
    }))]));
  }

  /* ---------------- Templates (33n) ---------------- */
  function templatesTab(body) {
    if (firstVisit()) body.appendChild(offerCard());
    var mine = {};
    R().all({ archived: true }).forEach(function (r) { if (r.template) mine[r.template] = r; });
    body.appendChild(el("div", { class: "k-rt-tpls", "data-ui": "routine.templates-grid" }, R().templates().map(function (t) {
      var used = mine[t.id];
      var total = t.steps.reduce(function (m, s) { return m + (s[1] || 0); }, 0);
      var prev = el("div", { class: "k-rt-tpl-steps", hidden: true }, t.steps.map(function (s) { return el("div", { class: "k-rt-small" }, ["· " + s[0], (s[2] || "").indexOf("o") !== -1 ? " (optional)" : ""]); }));
      return el("article", { class: "k-card k-rt-card k-rt-tpl", "data-ui": "routine.template" }, [
        el("div", { class: "k-rt-cover k-rt-cover--lg" }, [el("img", { src: img("cover." + (TEMPLATE_COVER[t.id] || COVER[t.kind] || "habit")), alt: "", loading: "lazy" }), tile(t.mark, t.kind === "morning" || t.kind === "evening" ? t.kind : null)]),
        el("div", { class: "k-rt-hd" }, [el("h3", { class: "k-rt-hd-t", text: t.name }), el("span", { class: "k-rt-fill" }), ["morning", "evening", "study"].indexOf(t.id) !== -1 ? muted("ships with the app") : null]),
        muted(plural(t.steps.length, "step") + (total ? " · " + total + " min" : "") + " · " + t.blurb),
        prev,
        el("div", { class: "k-cluster k-rt-rcard-f" }, [
          used ? el("button", { type: "button", class: "k-btn k-btn--sm", text: "✓ Yours · Open", onclick: function () { KOS.show("routines", { edit: used.id }); } })
            : el("button", { type: "button", class: "k-btn k-btn--primary k-btn--sm", "data-ui": "routine.use-template", text: "Use this", onclick: function () {
              var r = R().fromTemplate(t.id, { remind: !!t.window });
              KOS.ui.toast(r.name + " added");
              KOS.show("routines", { edit: r.id });
            } }),
          el("button", { type: "button", class: "k-btn k-btn--quiet k-btn--sm", "aria-expanded": "false", text: "Preview steps", onclick: function (e) {
            prev.hidden = !prev.hidden; e.currentTarget.setAttribute("aria-expanded", String(!prev.hidden));
          } })
        ])
      ]);
    })));
    body.appendChild(el("p", { class: "k-muted k-rt-small", text: "Use this makes your own copy to edit; the template never changes." }));
  }

  /* ---------------- History (33r) ---------------- */
  /* six states told apart by shape: kept filled, partial half, minimum a
     ring with a dot, rest hatched, not kept an outline, not scheduled a dot */
  var HSTATE = { done: "kept", min: "min", partial: "partial", rest: "rest", missed: "not", open: "not", off: "off" };
  function heat(id, from, to) {
    var r = R().get(id) || { id: id };
    var cells = R().history(id, from, to);
    return el("div", { class: "k-rt-heat", role: "img", "aria-label": cells.filter(function (c) { return c.state === "done" || c.state === "min"; }).length + " kept in 12 weeks" },
      cells.map(function (c) { return el("span", { "data-state": HSTATE[c.state] || "off", title: dayLabel(c.day, { weekday: "short", day: "numeric", month: "short" }) + " · " + (r.name || "") + " · " + c.state }); }));
  }
  function allHeat(rs, from, to) {
    var cells = [];
    for (var d = from; d <= to; d = KOS.srs.addDays(d, 1)) {
      var kept = 0, sched = 0, part = 0, rest = 0;
      rs.forEach(function (r) {
        var st = R().stateOn(r, d);
        if (st === "off") return;
        if (st === "rest") { rest++; return; }
        sched++;
        if (st === "done" || st === "min") kept++;
        else if (st === "partial") part++;
      });
      var s = !sched ? (rest ? "rest" : "off") : kept === sched ? "kept" : kept || part ? "partial" : "not";
      cells.push(el("span", { "data-state": s, title: dayLabel(d, { weekday: "short", day: "numeric", month: "short" }) + " · " + kept + " of " + sched }));
    }
    return el("div", { class: "k-rt-heat", role: "img", "aria-label": "All routines, last 12 weeks" }, cells);
  }
  function legend() {
    return el("div", { class: "k-rt-legend" }, [["kept", "kept"], ["partial", "partial"], ["min", "minimum"], ["rest", "rest day"], ["not", "not kept"], ["off", "not scheduled"]].map(function (x) {
      return el("span", { class: "k-rt-legend-i" }, [el("span", { class: "k-rt-heat-cell", "data-state": x[0] }), x[1]]);
    }));
  }
  function history(body) {
    var to = R().routineDay();
    var p = to.split("-"), dt = new Date(+p[0], +p[1] - 1, +p[2], 12);
    var from = KOS.srs.addDays(to, -((dt.getDay() + 6) % 7) - 7 * 11);
    var rs = R().all().filter(function (r) { return r.days !== null; });
    var rows = [];
    function pctOf(list) {
      var k = 0, s = 0;
      list.forEach(function (r) { var x = R().summary(r.id, from, to); k += x.kept; s += x.scheduled; });
      return s >= 14 ? Math.round(100 * k / s) + "%" : null;
    }
    function stats(list) {
      var rest = 0, minsSum = 0, minsN = 0, log = (store.state.routines && store.state.routines.log) || {};
      list.forEach(function (r) { var x = R().summary(r.id, from, to); rest += x.rest; });
      Object.keys(log).forEach(function (k) {
        var id = k.split("|")[0], d = k.split("|")[1];
        if (d < from || d > to || !list.some(function (r) { return r.id === id; })) return;
        if (log[k] && log[k].mins) { minsSum += log[k].mins; minsN++; }
      });
      var out = [];
      if (list.length === 1 && list[0].days !== null) { out.push(["炎 " + R().streak(list[0].id), "now"]); out.push([String(R().best(list[0].id)), "best run"]); }
      if (rest) out.push([String(rest), rest === 1 ? "rest day" : "rest days"]);
      if (minsN) out.push([Math.round(minsSum / minsN) + " min", "on average"]);
      return out;
    }
    if (rs.length > 1) rows.push(hmRow("全", null, "All routines", "every scheduled routine-day", allHeat(rs, from, to), pctOf(rs), stats(rs)));
    rs.filter(function (r) { return r.kind !== "habit"; }).forEach(function (r) { rows.push(hmRow(markOf(r), toneOf(r), r.name, schedText(r), heat(r.id, from, to), pctOf([r]), stats([r]))); });
    var hs = rs.filter(function (r) { return r.kind === "habit"; });
    if (hs.length) rows.push(hmRow("習", null, "Daily habits", plural(hs.length, "habit"), allHeat(hs, from, to), pctOf(hs), stats(hs)));
    body.appendChild(card([
      el("div", { class: "k-rt-hd" }, [el("h3", { class: "k-rt-hd-t", text: "Last 12 weeks" }), el("span", { class: "k-rt-hd-m", text: dayLabel(from, { day: "numeric", month: "short" }) + " → " + dayLabel(to, { day: "numeric", month: "short" }) }), el("span", { class: "k-rt-fill" }), legend()]),
      rows.length ? el("div", { class: "k-rt-hmrows" }, rows) : KOS.ui.emptyState({ compact: true, body: "Keep a routine for a few days and its pattern shows here." })
    ], "k-rt-historycard", "routine.history"));
    body.appendChild(el("div", { class: "k-rt-hist2" }, [habitGrid(), reviewsDone()]));
  }
  function hmRow(mark, tone, name, sub, heatEl, pct, extra) {
    return el("div", { class: "k-rt-hmrow" }, [
      el("div", { class: "k-rt-hmrow-n" }, [tile(mark, tone), el("div", {}, [el("b", { text: name }), muted(sub)])]),
      heatEl,
      el("div", { class: "k-rt-hmrow-p" }, [
        el("div", { class: "k-rt-hmstat" }, [el("b", { class: "k-rt-big", text: pct || "—" }), muted(pct ? "of scheduled days kept" : "too early to call")])
      ].concat((extra || []).map(function (x) { return el("div", { class: "k-rt-hmstat" }, [el("b", { class: "k-rt-mid", text: x[0] }), muted(x[1])]); })))
    ]);
  }
  function reviewsDone() {
    var to = R().routineDay(), days = (store.state.dayReview && store.state.dayReview.days) || {};
    var weeks = [];
    for (var w = 5; w >= 0; w--) {
      var end = KOS.srs.addDays(to, -7 * w), start = KOS.srs.addDays(end, -6), n = 0;
      Object.keys(days).forEach(function (d) {
        if (d < start || d > end) return;
        V().SLOTS.forEach(function (s) { if (days[d][s] && days[d][s].state === "done") n++; });
      });
      weeks.push({ end: end, n: n });
    }
    var max = Math.max(1, Math.max.apply(null, weeks.map(function (x) { return x.n; })));
    var total = weeks.reduce(function (m, x) { return m + x.n; }, 0);
    return card([
      head("Reviews done", "per week, counts only"),
      total ? el("div", { class: "k-rt-bars", role: "img", "aria-label": weeks.map(function (x) { return x.n + " in the week to " + dayLabel(x.end, { day: "numeric", month: "short" }); }).join(", ") },
        weeks.map(function (x) {
          return el("div", { class: "k-rt-bar" }, [el("span", { class: "k-mono k-rt-small", text: String(x.n) }), el("span", { class: "k-rt-bar-b", style: "--h: " + Math.round(100 * x.n / max) + "%" }), muted(dayLabel(x.end, { day: "numeric", month: "short" }))]);
        })) : el("p", { class: "k-muted k-rt-small", text: "No review done yet. They appear here as counts, with no streak." }),
      el("p", { class: "k-muted k-rt-small", text: "Of 21 a week. Folded reviews are neither done nor skipped. There is no review streak." })
    ], "k-rt-revdone", "routine.reviews-done");
  }

  /* ---------------- Settings (33s) ---------------- */
  function settings(body) {
    var c = V().cfg(), ui = store.state.ui || {};
    function setRow(t, s, ctl, hook) { return el("div", { class: "k-rt-set", "data-ui": hook || null }, [el("div", { class: "k-rt-grow" }, [el("div", { text: t }), s ? muted(s) : null]), ctl]); }
    function sw(on, fn, label) { var i = el("input", { type: "checkbox", role: "switch", class: "k-switch", "aria-label": label }); i.checked = !!on; i.addEventListener("change", function () { fn(i.checked); }); return i; }
    function timeIn(v, fn, label) {
      var i = el("input", { type: "time", class: "k-input k-mono k-rt-time", value: v, "aria-label": label, step: 300 });
      i.addEventListener("change", function () { if (/^\d{2}:\d{2}$/.test(i.value)) fn(i.value); });
      return i;
    }
    var mk = { morning: "朝", afternoon: "昼", evening: "夜" };
    var slots = el("div", { class: "k-rt-slots" }, [el("div", { class: "k-rt-slot k-rt-slot--h" }, [el("span"), el("span"), muted("Weekdays"), muted("Weekends"), muted("On")])]
      .concat(V().SLOTS.map(function (s) {
        var o = c.slots[s];
        function set(patch) { var sl = {}; sl[s] = Object.assign({}, o, patch); V().setConfig({ slots: sl }); KOS.rerender(); }
        return el("div", { class: "k-rt-slot", "data-ui": "review.slot-setting" }, [tile(mk[s], s), el("span", { text: s.charAt(0).toUpperCase() + s.slice(1) }),
          timeIn(o.weekday, function (v) { set({ weekday: v }); }, s + " review, weekdays"),
          timeIn(o.weekend, function (v) { set({ weekend: v }); }, s + " review, weekends"),
          sw(o.on, function (v) { set({ on: v }); }, s + " review on")]);
      })));
    var easyOn = !!V().cfg().easyUntil && V().easy();
    var col1 = el("div", { class: "k-rt-col" }, [
      card([head("The three reviews"), slots, el("p", { class: "k-muted k-rt-small", text: "School holidays use the weekend times (weeks with no lessons in Pacing)." })]),
      card([head("Behaviour"),
        setRow("Open the review by itself", "on the first app open in its slot; never over Focus, a dialog or the Exam Room", sw(c.autoOpen, function (v) { V().setConfig({ autoOpen: v }); }, "Open the review by itself")),
        setRow("The day starts at", "routines and reviews after midnight still count for the evening before",
          (function () { var i = el("input", { type: "time", class: "k-input k-mono k-rt-time", value: c.dayStart, "aria-label": "The day starts at" }); i.addEventListener("change", function () { V().setConfig({ dayStart: i.value }); KOS.rerender(); }); return i; })()),
        setRow("Ask before Focus (About to Study)", "on this device", sw(ui.focusPreflight !== false, function (v) { store.state.ui.focusPreflight = v; store.save(); }, "Ask before Focus")),
        setRow("Easy week", easyOn ? "only the Morning Review; routine reminders off; ends " + dayLabel(c.easyUntil, { weekday: "short", day: "numeric", month: "short" }) : "only the Morning Review and no routine reminders, for seven days",
          sw(easyOn, function (v) { V().setConfig({ easyUntil: v ? KOS.srs.addDays(R().routineDay(), 7) : null }); KOS.rerender(); }, "Easy week"), "review.easy")
      ])
    ]);
    var col2 = el("div", { class: "k-rt-col" }, [
      card([head("The words"),
        choice(["✦ Kurenai", "Template"], c.words === "kurenai" ? 0 : 1, function (i) { V().setConfig({ words: i ? "template" : "kurenai" }); KOS.rerender(); }, { label: "The words", hook: "review.words-choice" }),
        el("p", { class: "k-rt-small k-rt-text2", text: "Kurenai writes each review's greeting ahead, about three requests a day, so a notification can carry her line. The template always shows first and stays whenever she is unavailable." }),
        el("button", { type: "button", class: "k-link k-rt-small", "data-ui": "review.what-sent", text: "What is sent", onclick: whatIsSent }),
        setRow("Kurenai's portrait in the header", "decoration only", sw(c.portrait, function (v) { V().setConfig({ portrait: v }); }, "Kurenai's portrait"))
      ]),
      card([head("Notifications"),
        setRow("Review notices", "審 · muted like any kind in Notifications", sw(!KOS.notify.isMuted("review"), function (v) { KOS.notify.setMuted("review", !v); }, "Review notices")),
        setRow("Routine reminders", "習 · at a window's start, held when its review is near", sw(!KOS.notify.isMuted("routine"), function (v) { KOS.notify.setMuted("routine", !v); }, "Routine reminders")),
        setRow("Hold alerts after Good night", "tonight only, until the morning review", sw(ui.reviewGoodNightQuiet !== false, function (v) { store.state.ui.reviewGoodNightQuiet = v; store.save(); }, "Hold alerts after Good night"))
      ]),
      kitCard(c)
    ]);
    body.appendChild(el("div", { class: "k-rt-settings", "data-ui": "routine.settings" }, [col1, col2]));
  }
  /* each subject's kit, for tomorrow's bag (plan §17.1) */
  function kitCard(c) {
    var subs = (KOS.subjects ? KOS.subjects.ids("exam") : ["compsci", "maths", "it"]);
    var kit = c.kit || {};
    return card([head("Tomorrow's bag", "each subject's kit, set once"),
      el("div", { class: "k-rt-rows" }, subs.map(function (sid) {
        var i = el("input", { type: "text", class: "k-input k-rt-kit", value: (kit[sid] || []).join(", "), placeholder: "e.g. calculator, textbook", "aria-label": KOS.subjects.meta(sid).name + " kit" });
        i.addEventListener("change", function () {
          var k = Object.assign({}, V().cfg().kit || {});
          k[sid] = i.value.split(",").map(function (t) { return t.trim(); }).filter(Boolean);
          V().setConfig({ kit: k });
        });
        return el("div", { class: "k-rt-row" }, [bar(hue(sid)), el("span", { class: "k-rt-kit-n", text: KOS.subjects.meta(sid).short }), i]);
      })),
      el("p", { class: "k-muted k-rt-small", text: "Evening Prep's Pack bag step and the Evening Review list tomorrow's bag from the timetable, with anything due to hand in." })
    ], null, "routine.kit");
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

  /* ---------------- the editor (33m) ---------------- */
  function editor(main, id) {
    var isNew = id === "new";
    var cur = isNew ? null : R().get(id);
    if (!isNew && !cur) { main.appendChild(KOS.ui.emptyState({ title: "That routine has gone", body: "It may have been deleted on another device." })); return; }
    /* a draft per visit; saving writes through KOS.routines */
    var d = cur ? JSON.parse(JSON.stringify(cur)) : { name: "", kind: "custom", mark: "", steps: [{ text: "", mins: 0 }], days: [1, 2, 3, 4, 5], window: null, weekend: null, anchor: null, remind: false };
    d.steps.forEach(function (s, i) { if (!s.id) s.id = "n" + i + Math.random().toString(36).slice(2, 6); });
    main.appendChild(el("div", { class: "k-rt-crumb" }, [
      el("button", { type: "button", class: "k-link", text: "Routines ›", onclick: function () { KOS.show("routines", "routines"); } }),
      el("span", { text: isNew ? "New routine" : cur.name }),
      el("span", { class: "k-rt-fill" }),
      muted("Changes apply from the next day you start; past days keep their own steps")
    ]));
    var wrap = el("div", { class: "k-rt-editor", "data-ui": "routine.editor" });
    main.appendChild(wrap);
    var nameIn = el("input", { type: "text", class: "k-input k-rt-name", value: d.name, placeholder: "Name this routine", "aria-label": "Routine name", "data-ui": "routine.name" });
    var markIn = el("input", { type: "text", class: "k-input k-rt-markin", value: d.mark || "", maxlength: 2, "aria-label": "Mark (one character)", placeholder: "習" });
    var stepsBox = el("div", { class: "k-rt-esteps", "data-ui": "routine.editor-steps" });
    var totalBox = el("div", { class: "k-rt-total" });
    function paintTotal() {
      var t = d.steps.reduce(function (m, s) { return m + (+s.mins || 0); }, 0);
      totalBox.innerHTML = "";
      var w = d.window ? mins(d.window.to) - mins(d.window.from) : 0;
      totalBox.appendChild(el("div", { class: "k-rt-hd" }, [el("b", { text: t + " min" }), muted(w ? "of a " + w + " min window" : "in all"), el("span", { class: "k-rt-fill" }),
        w ? el("span", { class: "k-rt-small k-rt-text2", text: t <= w ? (w - t) + " min to spare" : (t - w) + " min over the window" }) : null]));
      if (w) totalBox.appendChild(el("div", { class: "k-rt-totalbar" }, [el("span", { style: "--p: " + Math.min(100, Math.round(100 * t / w)) + "%" })]));
      var m = d.steps.filter(function (s) { return s.minimum; })[0];
      if (m) totalBox.appendChild(muted("Minimum version: " + (m.text || "this step") + " alone"));
    }
    function paintSteps(focusId) {
      stepsBox.innerHTML = "";
      d.steps.forEach(function (s, i) {
        var t = el("input", { type: "text", class: "k-rt-step-in", value: s.text, placeholder: "Step " + (i + 1), "aria-label": "Step " + (i + 1) });
        t.addEventListener("input", function () { s.text = t.value; });
        var m = el("input", { type: "number", min: 0, max: 240, class: "k-input k-mono k-rt-step-mins", value: s.mins || 0, "aria-label": "Minutes for " + (s.text || "step " + (i + 1)) });
        m.addEventListener("input", function () { s.mins = Math.max(0, +m.value || 0); paintTotal(); });
        var opt = el("input", { type: "checkbox", role: "switch", class: "k-switch", "aria-label": "Optional" }); opt.checked = !!s.optional;
        opt.addEventListener("change", function () { s.optional = opt.checked; if (s.optional) s.minimum = false; paintSteps(); });
        var more = KOS.ui.menu({ label: "⋯", className: "k-btn--quiet k-btn--sm", hint: "More for this step", items: [
          { label: s.minimum ? "◐ Not the minimum" : "◐ Make this the minimum", onSelect: function () { d.steps.forEach(function (x) { x.minimum = false; }); s.minimum = !s.minimum && !s.optional ? true : false; paintSteps(); paintTotal(); } },
          { label: s.checkMorning ? "Ask tonight, as usual" : "Ask the next morning", onSelect: function () { s.checkMorning = !s.checkMorning; if (s.checkMorning) s.optional = true; paintSteps(); } },
          { label: "Link to today's timetable", onSelect: function () { s.link = { kind: "view", to: "today" }; paintSteps(); } },
          { label: "Link to Focus", onSelect: function () { s.link = { kind: "focus", to: "start" }; paintSteps(); } },
          { label: "Link to a web address…", onSelect: function () { var u = window.prompt("A web address (https://…)", s.link && s.link.kind === "url" ? s.link.to : "https://"); if (u && /^https:\/\//.test(u)) { s.link = { kind: "url", to: u }; paintSteps(); } } },
          s.link ? { label: "Remove the link", onSelect: function () { s.link = null; paintSteps(); } } : null,
          { label: "Delete this step", onSelect: function () { d.steps.splice(i, 1); if (!d.steps.length) d.steps.push({ id: "n" + Date.now(), text: "", mins: 0 }); paintSteps(); paintTotal(); } }
        ].filter(Boolean) });
        stepsBox.appendChild(el("div", { class: "k-rt-estep", "data-rid": s.id, "data-ui": "routine.editor-step" }, [
          el("button", { type: "button", class: "k-grip", "data-reorder": "", "data-ui": "routine.grip", "aria-label": "Move " + (s.text || "step " + (i + 1)), title: "Drag to move · Space lifts it", text: "⠿" }),
          el("div", { class: "k-rt-estep-t" }, [t,
            el("div", { class: "k-cluster k-rt-estep-tags" }, [s.minimum ? el("span", { class: "k-rt-min", text: "◐ minimum" }) : null, s.checkMorning ? muted("asked the next morning") : null, s.link ? el("span", { class: "k-rt-small k-rt-text2", text: "↗ " + linkLabel(s.link) }) : null].filter(Boolean))]),
          m, el("label", { class: "k-cluster k-rt-small k-rt-text2" }, [opt, "Optional"]), more
        ]));
        if (focusId === s.id) setTimeout(function () { t.focus(); }, 0);
      });
    }
    KOS.ui.reorder(stepsBox, { rows: "[data-rid]", label: function (row) { var s = d.steps.filter(function (x) { return x.id === row.getAttribute("data-rid"); })[0]; return s ? s.text || "step" : "step"; },
      onDrop: function (row, list, index) {
        var id2 = row.getAttribute("data-rid");
        var from = d.steps.findIndex(function (x) { return x.id === id2; });
        var s = d.steps.splice(from, 1)[0];
        d.steps.splice(index, 0, s);
        paintSteps();
      } });
    var addIn = el("input", { type: "text", class: "k-rt-add-in", placeholder: "Add a step…", "aria-label": "Add a step", "data-ui": "routine.add-step",
      onkeydown: function (e) {
        if (e.key !== "Enter" || !addIn.value.trim()) return;
        var parts = addIn.value.split(","), last = parts.length > 1 && /^\s*\d+\s*$/.test(parts[parts.length - 1]);
        var s = { id: "n" + Date.now().toString(36), text: (last ? parts.slice(0, -1).join(",") : addIn.value).trim(), mins: last ? +parts[parts.length - 1] : 0 };
        if (d.steps.length === 1 && !d.steps[0].text) d.steps = [];
        d.steps.push(s); addIn.value = ""; paintSteps(); paintTotal();
      } });
    paintSteps(isNew ? d.steps[0].id : null);
    paintTotal();

    var days = el("div", { class: "k-rt-days", role: "group", "aria-label": "Days" });
    function paintDays() {
      days.innerHTML = "";
      [1, 2, 3, 4, 5, 6, 0].forEach(function (x) {
        var on = d.days === null ? false : !d.days.length || d.days.indexOf(x) !== -1;
        days.appendChild(el("button", { type: "button", class: "k-rt-day", role: "checkbox", "aria-checked": String(on), "aria-label": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][x],
          text: "SMTWTFS".charAt(x), onclick: function () {
            var cur2 = d.days === null || !d.days.length ? [0, 1, 2, 3, 4, 5, 6] : d.days.slice();
            if (d.days === null) cur2 = [];
            var i = cur2.indexOf(x);
            if (i === -1) cur2.push(x); else cur2.splice(i, 1);
            d.days = cur2.length === 7 ? [] : cur2.length ? cur2.sort() : null;
            paintDays();
          } }));
      });
    }
    paintDays();
    var demand = el("input", { type: "checkbox", role: "switch", class: "k-switch", "aria-label": "No schedule (on demand)" }); demand.checked = d.days === null;
    demand.addEventListener("change", function () { d.days = demand.checked ? null : [1, 2, 3, 4, 5]; paintDays(); });
    var fromIn = el("input", { type: "time", class: "k-input k-mono", value: d.window ? d.window.from : "", "aria-label": "From" });
    var toIn = el("input", { type: "time", class: "k-input k-mono", value: d.window ? d.window.to : "", "aria-label": "Until" });
    function readWin() { d.window = fromIn.value && toIn.value && fromIn.value < toIn.value ? { from: fromIn.value, to: toIn.value } : null; paintTotal(); }
    fromIn.addEventListener("change", readWin); toIn.addEventListener("change", readWin);
    var wkOn = el("input", { type: "checkbox", role: "switch", class: "k-switch", "aria-label": "A different weekend schedule" }); wkOn.checked = !!(d.weekend && d.weekend.window);
    var wkFrom = el("input", { type: "time", class: "k-input k-mono", value: d.weekend && d.weekend.window ? d.weekend.window.from : "", "aria-label": "Weekend from" });
    var wkTo = el("input", { type: "time", class: "k-input k-mono", value: d.weekend && d.weekend.window ? d.weekend.window.to : "", "aria-label": "Weekend until" });
    var wkRow = el("div", { class: "k-rt-2col", hidden: wkOn.checked ? null : true }, [wkFrom, wkTo]);
    function readWk() { wkRow.hidden = !wkOn.checked; d.weekend = wkOn.checked && wkFrom.value && wkTo.value && wkFrom.value < wkTo.value ? { days: [0, 6], window: { from: wkFrom.value, to: wkTo.value } } : null; }
    [wkOn, wkFrom, wkTo].forEach(function (x) { x.addEventListener("change", readWk); });
    var anchorSel = el("select", { class: "k-input", "aria-label": "Review" }, [["", "None"], ["review:morning", "Morning review · shows inline"], ["review:evening", "Evening review · shows inline"], ["focus", "Before Focus (the pre-flight)"]].map(function (o) {
      var op = el("option", { value: o[0], text: o[1] }); if ((d.anchor || "") === o[0]) op.selected = true; return op;
    }));
    anchorSel.addEventListener("change", function () { d.anchor = anchorSel.value || null; });
    var remind = el("input", { type: "checkbox", role: "switch", class: "k-switch", "aria-label": "Remind me at the window's start" }); remind.checked = !!d.remind;
    remind.addEventListener("change", function () { d.remind = remind.checked; });
    function save() {
      d.name = nameIn.value.trim() || (d.steps[0] && d.steps[0].text) || "Routine";
      d.mark = markIn.value.trim();
      d.steps = d.steps.filter(function (s) { return String(s.text || "").trim(); });
      if (!d.steps.length) { KOS.ui.toast("A routine needs at least one step.", true); return; }
      var patch = { name: d.name, mark: d.mark, steps: d.steps, days: d.days, window: d.window, weekend: d.weekend, anchor: d.anchor, remind: d.remind };
      if (d.steps.length === 1 && d.kind === "custom" && isNew) patch.kind = "habit";
      var r = isNew ? R().add(Object.assign({ kind: d.kind }, patch)) : R().update(cur.id, patch);
      KOS.ui.toast("Saved. Applies from the next day you start it.");
      KOS.show("routines", r.kind === "habit" ? "routines" : "routines");
    }
    wrap.appendChild(card([
      el("div", { class: "k-rt-ehead" }, [markIn, nameIn]),
      el("div", { class: "k-rt-hd" }, [el("h3", { class: "k-rt-hd-t", text: "Steps" }), muted("drag ⠿ or Space then ↑↓ to reorder")]),
      stepsBox,
      el("div", { class: "k-rt-add" }, [el("span", { "aria-hidden": "true", text: "＋" }), addIn, muted("estimate after a comma: “Pack lunch, 4”")])
    ], "k-rt-ecard"));
    wrap.appendChild(el("div", { class: "k-rt-col" }, [
      card([head("Schedule"),
        el("div", { class: "k-rt-set" }, [el("div", { class: "k-rt-grow" }, [el("div", { text: "No schedule" }), muted("on demand, like About to Study: no streak")]), demand]),
        el("div", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Days" }), days]),
        el("div", { class: "k-rt-2col" }, [el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "From" }), fromIn]), el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Until" }), toIn])]),
        el("div", { class: "k-rt-set" }, [el("div", { class: "k-rt-grow" }, [el("div", { text: "A different weekend schedule" }), muted("Saturday and Sunday")]), wkOn]),
        wkRow,
        totalBox
      ]),
      card([head("Where it belongs"),
        el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Review" }), anchorSel]),
        el("div", { class: "k-rt-set" }, [el("div", { class: "k-rt-grow" }, [el("div", { text: "Remind me at the window's start" }), muted("held when its review opens within 15 min")]), remind]),
        el("div", { class: "k-cluster" }, [
          el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "routine.save", text: "Save", onclick: save }),
          el("button", { type: "button", class: "k-btn k-btn--quiet", text: "Cancel", onclick: function () { KOS.show("routines", "routines"); } })
        ])
      ]),
      /* Delete never shares a control group with Save (invariant 84's rule) */
      isNew ? null : card([head("Put it away"),
        el("div", { class: "k-cluster" }, [
          el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "routine.archive", text: "Archive", onclick: function () { R().archive(cur.id, true); KOS.show("routines", "routines"); } }),
          el("span", { class: "k-rt-fill" }),
          el("button", { type: "button", class: "k-btn k-btn--danger k-btn--sm", "data-ui": "routine.delete", text: "Delete…", onclick: function () {
            KOS.ui.confirm({ title: "Delete " + cur.name + "?", body: "Its past days stay in History; the routine itself goes.", danger: true, confirm: "Delete" }, function () { R().remove(cur.id); KOS.show("routines", "routines"); });
          } })
        ]),
        muted("Archive keeps it out of the way and can be undone; its history stays either way.")
      ])
    ]));
  }

  KOS.rtUI = { tile: tile, check: check, bar: bar, kind: kind, muted: muted, head: head, card: card, choice: choice, reward: reward, rewardText: rewardText,
    afterTick: afterTick, tickStep: tickStep, tlRow: tlRow, nowMark: nowMark, checklist: checklist, habitTicks: habitTicks, toneOf: toneOf, markOf: markOf,
    hue: hue, img: img, hmText: hmText, dayLabel: dayLabel, plural: plural, schedText: schedText, openLink: openLink, linkLabel: linkLabel, whatIsSent: whatIsSent };
})();
