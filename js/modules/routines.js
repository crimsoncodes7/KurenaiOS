/* Kurenai OS — modules/routines.js
   The Routines page (roadmap 5.10, design turn 33, frames 33j–33n, 33r–33s),
   replacing Habits under Productivity: `#/routines[/routines|templates|
   history|settings]`, a routine's editor `#/routines/edit/<id|new>`.

   The parts it shares with the Daily Review, the player and Home are
   KOS.rtUI, in js/modules/rtkit.js at boot; this page loads on first use
   (page-routines, 1F).

   Every write goes through its owner (KOS.routines, KOS.dayReview); a
   render writes nothing (smoke56).                                         */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;
  var R = function () { return KOS.routines; };
  var V = function () { return KOS.dayReview; };
  var U = KOS.rtUI;
  var COVER = U.COVER, TEMPLATE_COVER = U.TEMPLATE_COVER, img = U.img, hue = U.hue, nowHm = U.nowHm, mins = U.mins, dayLabel = U.dayLabel, plural = U.plural, tile = U.tile, toneOf = U.toneOf, markOf = U.markOf, check = U.check, bar = U.bar, kind = U.kind, muted = U.muted, head = U.head, card = U.card, choice = U.choice, checklist = U.checklist, schedText = U.schedText, linkLabel = U.linkLabel, habitTicks = U.habitTicks, whatIsSent = U.whatIsSent;

  /* one habit's options, edited in place on a draft `d` (repeats, a time
     and its reminder, auto-tracking through KOS.routines.AUTO); read()
     gives the patch or {error} */
  var DAYN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function habitFields(d) {
    d.days = d.days || [];
    var mode = d.every ? "every" : !d.days.length ? "daily" : d.days.join() === "1,2,3,4,5" ? "weekdays" : d.days.join() === "0,6" ? "weekends" : "days";
    var when = el("div", { class: "k-rt-hab-when" });
    var MODES = [["daily", "Every day"], ["weekdays", "Weekdays"], ["weekends", "Weekends"], ["days", "Chosen days"], ["every", "Every few days"]];
    function paintWhen() {
      when.innerHTML = "";
      when.appendChild(choice(MODES.map(function (m) { return m[1]; }), MODES.findIndex(function (m) { return m[0] === mode; }), function (i) {
        mode = MODES[i][0];
        d.days = mode === "weekdays" ? [1, 2, 3, 4, 5] : mode === "weekends" ? [0, 6] : mode === "days" ? (d.days.length && d.days.length < 7 ? d.days : [1, 3, 5]) : [];
        if (mode === "every") d.every = d.every || 2; else d.every = null;
        paintWhen();
      }, { label: "Repeats", hook: "habit.repeat" }));
      if (mode === "days") {
        when.appendChild(el("div", { class: "k-rt-days", role: "group", "aria-label": "Days" }, [1, 2, 3, 4, 5, 6, 0].map(function (x) {
          var on = d.days.indexOf(x) !== -1;
          return el("button", { type: "button", class: "k-rt-day", role: "checkbox", "aria-checked": String(on), "aria-label": DAYN[x], text: "SMTWTFS".charAt(x), onclick: function () {
            var next = on ? d.days.filter(function (y) { return y !== x; }) : d.days.concat([x]);
            if (next.length) { d.days = next.sort(); paintWhen(); }
          } });
        })));
      }
      if (mode === "every") {
        d.from = d.from || R().routineDay();
        var n = el("input", { type: "number", class: "k-input k-mono k-rt-num", min: 2, max: 14, value: d.every, "aria-label": "Every how many days", "data-ui": "habit.every" });
        n.addEventListener("change", function () { d.every = Math.max(2, Math.min(14, Math.round(+n.value || 2))); n.value = d.every; });
        var from = el("input", { type: "date", class: "k-input k-mono", value: d.from, "aria-label": "Starting" });
        from.addEventListener("change", function () { if (from.value) d.from = from.value; });
        when.appendChild(el("div", { class: "k-cluster" }, [muted("Every"), n, muted("days, starting"), from]));
      }
    }
    paintWhen();
    /* once a day, or several times (2–6), each with its own time */
    var times = Array.isArray(d.times) && d.times.length >= 2 ? d.times.slice() : null;
    var timesBox = el("div", { class: "k-rt-hab-times" });
    function paintTimes() {
      timesBox.innerHTML = "";
      timesBox.appendChild(choice(["Once", "Several times"], times ? 1 : 0, function (i) {
        times = i ? (times || ["08:00", "20:00"]) : null;
        paintTimes(); paintMode();
      }, { label: "Times a day", hook: "habit.times-mode" }));
      if (!times) return;
      var row = el("div", { class: "k-cluster k-rt-hab-tlist" });
      times.forEach(function (t, i) {
        var tin = el("input", { type: "time", class: "k-input k-mono k-rt-time", value: t, "aria-label": "Time " + (i + 1), "data-ui": "habit.time" });
        tin.addEventListener("change", function () { if (tin.value) times[i] = tin.value; });
        row.appendChild(tin);
        if (times.length > 2) row.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "aria-label": "Remove time " + (i + 1), text: "✕", onclick: function () { times.splice(i, 1); paintTimes(); } }));
      });
      if (times.length < 6) row.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "habit.time-add", text: "＋ a time", onclick: function () {
        var last = times[times.length - 1] || "12:00", h = Math.min(23, +last.slice(0, 2) + 2);
        times.push((h < 10 ? "0" : "") + h + last.slice(2)); paintTimes();
      } }));
      timesBox.appendChild(row);
    }
    paintTimes();
    var w = d.window || {};
    var fromIn = el("input", { type: "time", class: "k-input k-mono k-rt-time", value: w.from || "", "aria-label": "From" });
    var toIn = el("input", { type: "time", class: "k-input k-mono k-rt-time", value: w.to || "", "aria-label": "Until" });
    var remind = el("input", { type: "checkbox", role: "switch", class: "k-switch", "aria-label": "Remind me when it starts" });
    remind.checked = !!d.remind;
    var A = R().AUTO;
    var autoBox = el("div", { class: "k-rt-hab-auto" });
    function paintAuto() {
      autoBox.innerHTML = "";
      var auto = d.auto;
      var src = el("select", { class: "k-select", "data-ui": "habit.auto-src", "aria-label": "Ticks itself when" },
        [el("option", { value: "", text: "No — I tick it" })].concat(Object.keys(A).map(function (k) { return el("option", { value: k, text: A[k].label }); })));
      src.value = auto ? auto.src : "";
      src.addEventListener("change", function () {
        d.auto = src.value ? { src: src.value, n: A[src.value].def, subject: auto && A[src.value].subject ? auto.subject : null } : null;
        paintAuto();
      });
      autoBox.appendChild(src);
      if (!auto) return;
      var def = A[auto.src];
      var n = el("input", { type: "number", class: "k-input k-mono k-rt-num", min: 1, max: 1000, value: auto.n, "aria-label": "How many " + def.unit, "data-ui": "habit.auto-n" });
      var now = muted("");
      function measure() { R().autoMeasure(auto, R().routineDay(), function (v) { now.textContent = v == null ? "" : "today so far: " + v + " " + def.unit; }); }
      n.addEventListener("input", function () { auto.n = Math.max(1, Math.round(+n.value || 1)); });
      var row = [muted("at least"), n, muted(def.unit)];
      if (def.subject) {
        var subj = el("select", { class: "k-select", "aria-label": "Subject", "data-ui": "habit.auto-subject" },
          [el("option", { value: "", text: "any subject" })].concat((KOS.subjects ? KOS.subjects.ids() : []).map(function (sid) { return el("option", { value: sid, text: "on " + KOS.subjects.meta(sid).name }); })));
        subj.value = auto.subject || "";
        subj.addEventListener("change", function () { auto.subject = subj.value || null; measure(); });
        row.push(subj);
      }
      autoBox.appendChild(el("div", { class: "k-cluster" }, row));
      autoBox.appendChild(now);
      measure();
    }
    paintAuto();
    function field(label, ctl, note) { return el("div", { class: "k-rt-hab-f" }, [el("div", { class: "k-rt-hab-l", text: label }), el("div", { class: "k-rt-hab-c" }, [ctl, note ? muted(note) : null])]); }
    var timeField = field("Time", el("div", { class: "k-cluster" }, [fromIn, muted("to"), toIn, el("label", { class: "k-cluster" }, [remind, muted("remind me")])]), "optional · a reminder at its start");
    var remind2 = el("input", { type: "checkbox", role: "switch", class: "k-switch", "aria-label": "Remind me at each time" });
    remind2.checked = !!d.remind;
    var remindField = field("Reminders", el("label", { class: "k-cluster" }, [remind2, muted("remind me at each time")]), "a reminder at each time not yet ticked");
    var autoField = field("Ticks itself", autoBox, "read from your own record, the way Goals read it; you can still tick it by hand");
    function paintMode() { timeField.hidden = !!times; autoField.hidden = !!times; remindField.hidden = !times; }
    paintMode();
    return {
      el: el("div", { class: "k-rt-hab" }, [
        field("Repeats", when),
        field("Times a day", timesBox, "taking medicine, say: a tick for each time; the day counts once they're all ticked"),
        timeField, remindField, autoField
      ]),
      read: function () {
        if (times) {
          var clean = times.filter(function (t, i) { return t && times.indexOf(t) === i; });
          if (clean.length < 2) return { error: "Several times a day needs two different times." };
          return { days: mode === "every" ? [] : d.days, every: mode === "every" ? d.every : null, from: mode === "every" ? d.from : null,
            window: null, remind: remind2.checked, auto: null, times: clean.sort() };
        }
        if ((fromIn.value || toIn.value) && !(fromIn.value && toIn.value && fromIn.value < toIn.value)) return { error: "The time needs a start before its end." };
        var win = fromIn.value && toIn.value ? { from: fromIn.value, to: toIn.value } : null;
        return { days: mode === "every" ? [] : d.days, every: mode === "every" ? d.every : null, from: mode === "every" ? d.from : null,
          window: win, remind: remind.checked && !!win, auto: d.auto || null, times: null };
      }
    };
  }
  function habitSummary(h) {
    return [schedText(h), h.times && h.times.length > 1 ? h.times.length + " times a day · " + h.times.join(", ") : null, h.auto ? "自 " + R().autoText(h.auto) : null,
      h.remind && h.times ? "reminds at each" : h.remind && h.window ? "reminds at " + h.window.from : null].filter(Boolean).join(" · ");
  }

  /* the Daily habits routine's editor (#/routines/edit/habits): fixed name
     and mark, a row per habit like a routine's steps, each opening its own
     options in place; nothing is written until Save */
  function habitsEditor(main) {
    var draft = R().all({ kind: "habit" }).map(function (h) {
      var d = JSON.parse(JSON.stringify(h)); d._key = h.id; return d;
    });
    var gone = [], openKey = null, fields = {};
    main.appendChild(el("div", { class: "k-rt-crumb" }, [
      el("button", { type: "button", class: "k-link", text: "Routines ›", onclick: function () { KOS.show("routines", "routines"); } }),
      el("span", { text: "Daily habits" }),
      el("span", { class: "k-rt-fill" }),
      muted("Each habit keeps its own streak; changes apply from the next day")
    ]));
    var wrap = el("div", { class: "k-rt-editor k-rt-editor--habits", "data-ui": "routine.editor routine.habits-editor" });
    main.appendChild(wrap);
    var list = el("div", { class: "k-rt-esteps", "data-ui": "routine.editor-steps" });
    function paint(focusKey) {
      list.innerHTML = "";
      fields = {};
      draft.forEach(function (d, i) {
        var t = el("input", { type: "text", class: "k-rt-step-in", value: d.name || "", placeholder: "Habit " + (i + 1), "aria-label": "Habit " + (i + 1), "data-ui": "habit.name" });
        t.addEventListener("input", function () { d.name = t.value; });
        var open = openKey === d._key;
        var f = open ? habitFields(d) : null;
        if (f) fields[d._key] = f;
        var more = KOS.ui.menu({ label: "⋯", className: "k-btn--quiet k-btn--sm", hint: "More for this habit", items: [
          d.id ? { label: "Archive (keeps its history)", onSelect: function () { d.archived = true; draft.splice(draft.indexOf(d), 1); gone.push({ id: d.id, archive: true }); paint(); } } : null,
          { label: "Delete this habit", onSelect: function () {
            if (!d.id) { draft.splice(draft.indexOf(d), 1); paint(); return; }
            KOS.ui.confirm({ title: "Delete “" + (d.name || "this habit") + "”?", body: "Its past days stay in Reports; Archive keeps it in History too. Nothing changes until you save.", danger: true, confirm: "Delete" },
              function () { draft.splice(draft.indexOf(d), 1); gone.push({ id: d.id }); paint(); });
          } }
        ].filter(Boolean) });
        var row = el("div", { class: "k-rt-estep k-rt-ehabit", "data-rid": d._key, "data-ui": "routine.editor-step habit.row" }, [
          el("button", { type: "button", class: "k-grip", "data-reorder": "", "aria-label": "Move " + (d.name || "habit " + (i + 1)), title: "Drag to move · Space lifts it", text: "⠿" }),
          el("div", { class: "k-rt-estep-t" }, [t, el("div", { class: "k-cluster k-rt-estep-tags" }, [muted(habitSummary(d))])]),
          el("button", { type: "button", class: "k-btn k-btn--sm" + (open ? "" : " k-btn--quiet"), "aria-expanded": String(open), "data-ui": "habit.options", text: open ? "Done" : "Options",
            onclick: function () { if (open) { var p0 = f.read(); if (p0.error) { KOS.ui.toast(p0.error, true); return; } Object.assign(d, p0); } openKey = open ? null : d._key; paint(); } }),
          more,
          f ? el("div", { class: "k-rt-ehabit-opts" }, [f.el]) : null
        ]);
        if (open) KOS.ui.state(row, "open", true);
        list.appendChild(row);
        if (focusKey === d._key) setTimeout(function () { t.focus(); }, 0);
      });
    }
    KOS.ui.reorder(list, { rows: "[data-rid]", label: function (row) { var d = draft.filter(function (x) { return x._key === row.getAttribute("data-rid"); })[0]; return d ? d.name || "habit" : "habit"; },
      onDrop: function (row, l, index) {
        var from = draft.findIndex(function (x) { return x._key === row.getAttribute("data-rid"); });
        var d = draft.splice(from, 1)[0];
        draft.splice(index, 0, d);
        paint();
      } });
    var addIn = el("input", { type: "text", class: "k-rt-add-in", placeholder: "Add a habit…", "aria-label": "Add a habit", "data-ui": "routine.habit-add",
      onkeydown: function (e) {
        if (e.key !== "Enter" || !addIn.value.trim()) return;
        var d = { _key: "n" + Date.now().toString(36), name: addIn.value.trim(), days: [], window: null, remind: false, auto: null };
        draft.push(d); addIn.value = ""; openKey = d._key; paint();
      } });
    paint();
    function save() {
      if (openKey && fields[openKey]) {
        var p0 = fields[openKey].read();
        if (p0.error) { KOS.ui.toast(p0.error, true); return; }
        Object.assign(draft.filter(function (x) { return x._key === openKey; })[0] || {}, p0);
      }
      gone.forEach(function (g) { if (g.archive) R().archive(g.id, true); else R().remove(g.id); });
      draft.forEach(function (d, i) {
        var nm = String(d.name || "").trim();
        if (!nm) { if (d.id) R().remove(d.id); return; }
        var patch = { name: nm, kind: "habit", days: d.days || [], every: d.every || null, from: d.from || null, window: d.window || null,
          remind: !!d.remind, auto: d.auto || null, times: d.times || null, order: 100 + i };
        if (d.id) { var cur = R().get(d.id), st0 = Object.assign({}, (cur && cur.steps[0]) || {}, { text: nm }); if (!d.times) delete st0.at; delete st0.optional; R().update(d.id, Object.assign(patch, { steps: [st0] })); }
        else R().add(Object.assign(patch, { steps: [{ text: nm }] }));
      });
      R().autoSync();
      KOS.ui.toast("Saved. Applies from the next day.");
      KOS.show("routines", "routines");
    }
    var day = R().routineDay(), hs = R().all({ kind: "habit" });
    var keptToday = hs.filter(function (h) { var st = R().stateOn(h, day); return st === "done" || st === "min"; }).length;
    var dueToday = hs.filter(function (h) { return R().scheduledOn(h, day); }).length;
    var autoN = hs.filter(function (h) { return h.auto; }).length;
    wrap.appendChild(card([
      el("div", { class: "k-rt-ehead" }, [tile("習"), el("div", {}, [el("h2", { class: "k-rt-hd-t k-rt-fixedname", text: "Daily habits" }), muted("a routine of its own, always there: each habit is one step with its own days")])]),
      el("div", { class: "k-rt-hd" }, [el("h3", { class: "k-rt-hd-t", text: "Habits" }), muted("drag ⠿ or Space then ↑↓ to reorder · Options for days, a time and ticking itself")]),
      list,
      el("div", { class: "k-rt-add" }, [el("span", { "aria-hidden": "true", text: "＋" }), addIn, muted("Enter adds it, then set its options")])
    ], "k-rt-ecard"));
    wrap.appendChild(el("div", { class: "k-rt-col" }, [
      card([head("Today"),
        el("div", { class: "k-rt-rcard-n" }, [el("b", { class: "k-rt-big", text: dueToday ? keptToday + " of " + dueToday : "—" }), muted(dueToday ? "kept so far" : "none due today")]),
        habitsStrip(hs),
        autoN ? muted(plural(autoN, "habit") + " tick themselves from your record") : null
      ].filter(Boolean)),
      card([head("How habits work"),
        el("p", { class: "k-rt-small k-rt-text2", text: "Tick a habit on Today, on Home or in the reviews. Each keeps its own streak and pays the small trickle once a day; a habit that ticks itself pays the same, once. The routine itself can't be renamed or removed — it's where every habit lives." }),
        el("div", { class: "k-cluster" }, [
          el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "routine.save", text: "Save", onclick: save }),
          el("button", { type: "button", class: "k-btn k-btn--quiet", text: "Cancel", onclick: function () { KOS.show("routines", "routines"); } })
        ])
      ])
    ]));
  }

  /* ================= the page ================= */
  var TABS = [["today", "Today"], ["routines", "Routines"], ["templates", "Templates"], ["history", "History"], ["settings", "Settings"]];

  KOS.views.routines = function (main, arg) {
    KOS.shell.tree("none");
    if (arg && arg.edit === "habits") { habitsEditor(main); return; }
    if (arg && arg.edit) { editor(main, arg.edit); return; }
    var tab = typeof arg === "string" && TABS.some(function (t) { return t[0] === arg; }) ? arg : "today";
    /* a notice's target (audit SH-30): Today, then the review it is about
       opened over it, or the routine it is about brought into view. The
       address then drops it, so a reload does not open it again. */
    var target = arg && typeof arg === "object" && (arg.review || arg.routine) ? arg : null;
    if (target) setTimeout(function () {
      if (KOS.router && KOS.router.replaceArg) KOS.router.replaceArg("routines", undefined);
      if (target.review && KOS.reviewSheet) { KOS.reviewSheet.open(String(target.review)); return; }
      var card = main.querySelector("[data-routine='" + String(target.routine).replace(/['\\]/g, "") + "']");
      if (!card) return;
      if (card.scrollIntoView) card.scrollIntoView({ block: "center" });
      var go = card.querySelector("[data-ui~='routine.start']");
      if (go) go.focus();
    }, 0);
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
    if (tab === "today") today(body, target && target.routine ? String(target.routine) : null);
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
  function dueNowCard(prefer) {
    var day = R().routineDay(), now = nowHm();
    var list = R().today().filter(function (x) { return x.kind !== "habit"; });
    var open = list.filter(function (x) { return x.window && x.window.from <= now && now < x.window.to && x.state !== "done" && x.state !== "min" && x.state !== "rest"; });
    var next = list.filter(function (x) { return x.window && x.window.from > now; }).sort(function (a, b) { return a.window.from < b.window.from ? -1 : 1; })[0];
    /* a routine notice's routine is the one shown (audit SH-30) */
    var r = prefer && list.some(function (x) { return x.id === prefer; }) ? R().get(prefer) : open[0] ? R().get(open[0].id) : null;
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
  function today(body, prefer) {
    if (firstVisit()) body.appendChild(offerCard());
    body.appendChild(el("div", { class: "k-rt-today" }, [reviewsCard(), dueNowCard(prefer), habitTicks()]));
  }

  /* ---------------- Routines (33k) ---------------- */
  function coverOf(r) { return img("cover." + (TEMPLATE_COVER[r.template] || COVER[r.kind] || "habit")); }
  function cellStrip(r) {
    var day = R().routineDay(), from = KOS.srs.addDays(day, -27);
    var cells = R().history(r.id, from, day).filter(function (x) { return x.state !== "off" && !(x.day === day && x.state === "open"); });
    return el("div", { class: "k-rt-strip", role: "img", "aria-label": cells.filter(function (c) { return c.state === "done" || c.state === "min"; }).length + " kept of " + cells.length + " scheduled days" },
      cells.map(function (c) { return el("span", { "data-state": c.state === "done" || c.state === "min" ? "kept" : c.state === "rest" ? "rest" : "not", title: dayLabel(c.day) + " · " + c.state }); }));
  }
  /* the Daily habits routine's 28 days: kept when every habit due that day
     was kept, partial when some were */
  function habitsDay(hs, d) {
    var kept = 0, sched = 0, part = 0, rest = 0;
    hs.forEach(function (h) {
      var st = R().stateOn(h, d);
      if (st === "off") return;
      if (st === "rest") { rest++; return; }
      sched++;
      if (st === "done" || st === "min") kept++; else if (st === "partial") part++;
    });
    return { kept: kept, sched: sched, state: !sched ? (rest ? "rest" : "off") : kept === sched ? "kept" : kept || part ? "partial" : "not" };
  }
  function habitsStrip(hs) {
    var day = R().routineDay(), cells = [];
    for (var d = KOS.srs.addDays(day, -27); d <= day; d = KOS.srs.addDays(d, 1)) {
      var x = habitsDay(hs, d);
      if (x.state === "off" || (d === day && x.state !== "kept")) continue;
      cells.push(el("span", { "data-state": x.state === "partial" ? "partial" : x.state, title: dayLabel(d) + " · " + x.kept + " of " + x.sched }));
    }
    return el("div", { class: "k-rt-strip", role: "img", "aria-label": "Daily habits, the last four weeks" }, cells);
  }
  /* the fixed routine every habit lives in, drawn like any routine card */
  function habitsCard() {
    var hs = R().all({ kind: "habit" }), day = R().routineDay();
    var k = 0, sc = 0;
    for (var d = KOS.srs.addDays(day, -27); d < day; d = KOS.srs.addDays(d, 1)) hs.forEach(function (h) {
      var st = R().stateOn(h, d);
      if (st === "off" || st === "rest") return;
      sc++; if (st === "done" || st === "min") k++;
    });
    var pct = sc >= 14 ? Math.round(100 * k / sc) : null, t = habitsDay(hs, day);
    var autoN = hs.filter(function (h) { return h.auto; }).length;
    function edit() { KOS.show("routines", { edit: "habits" }); }
    return el("article", { class: "k-card k-rt-card k-rt-rcard", "data-ui": "routine.card routine.habits-card" }, [
      el("div", { class: "k-rt-cover" }, [el("img", { src: img("cover.habit"), alt: "", loading: "lazy" }), tile("習")]),
      el("button", { type: "button", class: "k-rt-rcard-t", "data-ui": "routine.edit", text: "Daily habits", onclick: edit }),
      muted(hs.length ? plural(hs.length, "habit") + (autoN ? " · " + autoN + " tick themselves" : "") + " · each its own days" : "no habits yet"),
      el("div", { class: "k-rt-rcard-n" }, [el("b", { class: "k-rt-big", text: pct == null ? "—" : pct + "%" }), muted(pct == null ? "too early to call" : "kept · last 4 weeks")]),
      habitsStrip(hs),
      el("div", { class: "k-cluster k-rt-rcard-f" }, [
        el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "routine.habits-today", text: "▶ Today", onclick: function () { KOS.show("routines"); } }),
        el("button", { type: "button", class: "k-btn k-btn--quiet k-btn--sm", text: "Edit", onclick: edit }),
        el("span", { class: "k-rt-fill" }),
        t.sched ? muted(t.kept + " of " + t.sched + " today") : null
      ])
    ]);
  }
  function share(r) {
    var day = R().routineDay(), s = R().summary(r.id, KOS.srs.addDays(day, -27), day);
    return s.scheduled ? Math.round(100 * s.kept / s.scheduled) : null;
  }
  function routineCard(r) {
    var pct = r.days === null ? null : share(r), streak = R().streak(r.id), best = R().best(r.id);
    /* a step that runs another routine counts that routine's minutes (1C) */
    var total = r.steps.reduce(function (m, s) { var t = s.run ? R().get(s.run) : null; return m + (t && !t.archived ? t.steps.reduce(function (n, x) { return n + (x.optional ? 0 : x.mins || 0); }, 0) : s.mins || 0); }, 0);
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
        .concat([el("span", { role: "columnheader", class: "k-rt-grid-d", "aria-label": "Streak", text: "炎" })]))
    ]);
    hs.forEach(function (h) {
      grid.appendChild(el("div", { class: "k-rt-grid-row", role: "row", "data-ui": "routine.grid-row" }, [el("span", { role: "rowheader", class: "k-ellipsis k-rt-grid-name", text: h.name })]
        .concat(days.map(function (d) {
          var st = d > today0 ? "ahead" : R().stateOn(h, d);
          var on = st === "done" || st === "min";
          var cellState = on ? "kept" : st === "rest" ? "rest" : st === "ahead" ? "ahead" : d === today0 ? "today" : st === "off" ? "off" : "not";
          return el("span", { role: "cell", class: "k-rt-grid-c" }, [el("span", { class: "k-rt-cell", "data-state": cellState, "aria-label": dayLabel(d) + ": " + (on ? "kept" : st), text: on ? "✓" : st === "rest" ? "休" : "" })]);
        }))
        .concat([el("span", { role: "cell", class: "k-muted k-rt-small", text: R().streak(h.id) ? "炎 " + R().streak(h.id) : "" })])));
    });
    return card([
      head("Habits", hs.length ? "the week, as kept" : "none yet",
        el("span", { class: "k-cluster k-rt-weeknav" }, [
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Previous week", text: "‹", onclick: function () { weekOffset--; KOS.rerender(); } }),
          el("span", { class: "k-rt-small", text: "w/c " + dayLabel(mon, { day: "numeric", month: "short" }) }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Next week", text: "›", disabled: weekOffset >= 0 ? true : null, onclick: function () { weekOffset++; KOS.rerender(); } })
        ])),
      hs.length ? grid : el("p", { class: "k-muted k-rt-small", text: "Add a habit on Today and its week fills in here." })
    ], "k-rt-gridcard", "routine.habit-grid");
  }
  function routinesTab(body) {
    var rs = R().all().filter(function (r) { return r.kind !== "habit"; });
    if (firstVisit()) body.appendChild(offerCard());
    /* as many columns as cards, up to four, so no row ends in a gap */
    /* up to four columns; the last card widens to close its row */
    var cards = rs.map(routineCard).concat([habitsCard()]), nc = cards.length;
    var cols = nc <= 4 ? nc : nc % 4 === 0 || nc % 4 === 3 ? 4 : 3, rem = nc % cols;
    body.appendChild(el("div", { class: "k-rt-cards", "data-ui": "routine.cards", style: "--n: " + cols + (rem ? "; --last: " + (cols - rem + 1) : "") }, cards));
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
  var HLABEL = { done: "kept", min: "minimum", partial: "partial", rest: "rest day", missed: "not kept", open: "not kept", off: "not scheduled" };
  function heat(id, from, to) {
    var r = R().get(id) || { id: id };
    var cells = R().history(id, from, to);
    return el("div", { class: "k-rt-heat", role: "img", "aria-label": cells.filter(function (c) { return c.state === "done" || c.state === "min"; }).length + " kept in 12 weeks" },
      cells.map(function (c) {
        /* a day kept after its window closed says so (audit PR-35) */
        var en = (c.state === "done" || c.state === "min") && R().entry(id, c.day);
        return el("span", { "data-state": HSTATE[c.state] || "off", "data-late": en && en.late ? "" : null,
          title: dayLabel(c.day, { weekday: "short", day: "numeric", month: "short" }) + " · " + (r.name || "") + " · " + (HLABEL[c.state] || c.state) + (en && en.late ? ", late" : "") }); }));
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
    if (hs.length) rows.push(hmRow("習", null, "Habits", plural(hs.length, "habit"), allHeat(hs, from, to), pctOf(hs), stats(hs)));
    /* two to a line, each heatmap the width of its card, then the habits'
       week and the reviews in the same grid; an odd last one spans the
       line (no dead half) */
    body.appendChild(el("div", { class: "k-rt-hd k-rt-hist-hd", "data-ui": "routine.history" }, [el("h3", { class: "k-rt-hd-t", text: "Last 12 weeks" }), el("span", { class: "k-rt-hd-m", text: dayLabel(from, { day: "numeric", month: "short" }) + " → " + dayLabel(to, { day: "numeric", month: "short" }) }), el("span", { class: "k-rt-fill" }), legend()]));
    if (!rows.length) rows.push(card([KOS.ui.emptyState({ compact: true, body: "Keep a routine for a few days and its pattern shows here." })]));
    body.appendChild(el("div", { class: "k-rt-hmrows", "data-ui": "routine.history-grid" }, rows.concat([habitGrid(), reviewsDone()])));
  }
  function hmRow(mark, tone, name, sub, heatEl, pct, extra) {
    return el("section", { class: "k-card k-rt-card k-rt-hmrow", "data-ui": "routine.history-row" }, [
      el("div", { class: "k-rt-hmrow-n" }, [tile(mark, tone), el("div", { class: "k-rt-grow" }, [el("b", { text: name }), muted(sub)]),
        el("div", { class: "k-rt-hmstat k-rt-hmstat--pct" }, [el("b", { class: "k-rt-big", text: pct || "—" }), muted(pct ? "of scheduled days kept" : "too early to call")])]),
      el("div", { class: "k-rt-heatwrap" }, [
        el("div", { class: "k-rt-heat-days", "aria-hidden": "true" }, ["M", "T", "W", "T", "F", "S", "S"].map(function (t) { return el("span", { text: t }); })),
        heatEl]),
      extra && extra.length ? el("div", { class: "k-rt-hmrow-p" }, extra.map(function (x) { return el("div", { class: "k-rt-hmstat" }, [el("b", { class: "k-rt-mid", text: x[0] }), muted(x[1])]); })) : null
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
    /* a step that runs another routine (1C): its minutes are that routine's own */
    function stepMins(s) { var t = s.run ? R().get(s.run) : null; return t ? t.steps.reduce(function (m, x) { return m + (x.optional ? 0 : +x.mins || 0); }, 0) : +s.mins || 0; }
    function paintTotal() {
      var t = d.steps.reduce(function (m, s) { return m + stepMins(s); }, 0);
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
        if (s.run && R().get(s.run)) { stepsBox.appendChild(runRow(s, i)); return; }
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
    /* a step that runs another routine: its name and minutes come from that
       routine; it can be the minimum, optional, moved or deleted */
    function runRow(s, i) {
      var inner = R().get(s.run), n = inner.steps.length;
      s.text = inner.name;
      var opt = el("input", { type: "checkbox", role: "switch", class: "k-switch", "aria-label": "Optional" }); opt.checked = !!s.optional;
      opt.addEventListener("change", function () { s.optional = opt.checked; if (s.optional) s.minimum = false; paintSteps(); });
      var more = KOS.ui.menu({ label: "⋯", className: "k-btn--quiet k-btn--sm", hint: "More for this step", items: [
        { label: s.minimum ? "◐ Not the minimum" : "◐ Make this the minimum", onSelect: function () { d.steps.forEach(function (x) { x.minimum = false; }); s.minimum = !s.minimum && !s.optional ? true : false; paintSteps(); paintTotal(); } },
        { label: "Edit " + inner.name, onSelect: function () { KOS.show("routines", { edit: inner.id }); } },
        { label: "Delete this step", onSelect: function () { d.steps.splice(i, 1); if (!d.steps.length) d.steps.push({ id: "n" + Date.now(), text: "", mins: 0 }); paintSteps(); paintTotal(); } }
      ] });
      return el("div", { class: "k-rt-estep", "data-rid": s.id, "data-ui": "routine.editor-step routine.run-step" }, [
        el("button", { type: "button", class: "k-grip", "data-reorder": "", "data-ui": "routine.grip", "aria-label": "Move " + inner.name, title: "Drag to move · Space lifts it", text: "⠿" }),
        el("div", { class: "k-rt-estep-t" }, [el("b", { class: "k-rt-run-name", text: (inner.mark ? inner.mark + " " : "") + inner.name }),
          el("div", { class: "k-cluster k-rt-estep-tags" }, [el("span", { class: "k-rt-small k-rt-text2", text: "↻ runs this routine · " + n + (n === 1 ? " step" : " steps") }),
            s.minimum ? el("span", { class: "k-rt-min", text: "◐ minimum" }) : null].filter(Boolean))]),
        el("span", { class: "k-mono k-rt-step-m", "aria-label": stepMins(s) + " minutes", text: stepMins(s) + "′" }),
        el("label", { class: "k-cluster k-rt-small k-rt-text2" }, [opt, "Optional"]), more
      ]);
    }
    /* the routines this one may run: not itself, not archived, not one that
       already runs it (a loop), and not one it runs already */
    function runChoices() {
      var selfId = cur ? cur.id : null;
      return R().all().filter(function (x) {
        if (x.id === selfId) return false;
        if (selfId && R().runsOf(x.id)[selfId]) return false;
        return !d.steps.some(function (s) { return s.run === x.id; });
      });
    }
    var runBtnBox = el("span", { class: "k-rt-run-add", "data-ui": "routine.add-run" });
    function paintRunBtn() {
      runBtnBox.innerHTML = "";
      var list = runChoices();
      if (!list.length) return;
      runBtnBox.appendChild(KOS.ui.menu({ label: "↻ Run a routine…", className: "k-btn--quiet k-btn--sm", hint: "Add a step that runs one of your routines",
        items: list.map(function (x) {
          return { label: (x.mark ? x.mark + " " : "") + x.name + " · " + x.steps.length + (x.steps.length === 1 ? " step" : " steps"), onSelect: function () {
            if (d.steps.length === 1 && !d.steps[0].text) d.steps = [];
            d.steps.push({ id: "n" + Date.now().toString(36), text: x.name, mins: 0, run: x.id });
            paintSteps(); paintTotal(); paintRunBtn();
            KOS.a11y && KOS.a11y.announce(x.name + " added as a step");
          } };
        }) }));
    }
    paintRunBtn();
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
      /* a step whose routine was deleted or archived since is an ordinary step now */
      d.steps.forEach(function (s) { var t = s.run ? R().get(s.run) : null; if (s.run && (!t || t.archived)) delete s.run; });
      if (!d.steps.length) { KOS.ui.toast("A routine needs at least one step.", true); return; }
      /* PR-23: all optional could never be kept */
      var why = R().check(d.steps, cur ? cur.id : null);
      if (why) { KOS.ui.toast(why + ".", true); return; }
      var patch = { name: d.name, mark: d.mark, steps: d.steps, days: d.days, window: d.window, weekend: d.weekend, anchor: d.anchor, remind: d.remind };
      if (d.steps.length === 1 && d.kind === "custom" && isNew && !d.steps[0].run) patch.kind = "habit";
      var r = isNew ? R().add(Object.assign({ kind: d.kind }, patch)) : R().update(cur.id, patch);
      KOS.ui.toast("Saved. Applies from the next day you start it.");
      KOS.show("routines", r.kind === "habit" ? "routines" : "routines");
    }
    wrap.appendChild(card([
      el("div", { class: "k-rt-ehead" }, [markIn, nameIn]),
      el("div", { class: "k-rt-hd" }, [el("h3", { class: "k-rt-hd-t", text: "Steps" }), muted("drag ⠿ or Space then ↑↓ to reorder")]),
      stepsBox,
      el("div", { class: "k-rt-add" }, [el("span", { "aria-hidden": "true", text: "＋" }), addIn, muted("estimate after a comma: “Pack lunch, 4”"), runBtnBox])
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

})();
