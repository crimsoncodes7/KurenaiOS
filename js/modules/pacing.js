/* Kurenai OS — modules/pacing.js
   Pacing: the integrated weekly timeline, in two readings.

   THE QUESTION THIS PAGE EXISTS FOR
   Three plans used to be three separate lists: what school teaches this
   week, what my own Maths/CS curriculum schedules this week, and where IT
   F201 has got to. Read separately they answer "what is happening"; read
   together they answer the one that matters — "am I ahead of the room, or
   behind it, and on exactly which spec points?" Both tabs are built around
   making that comparison, not around listing three things again.

   WEEK is the working surface: a term ribbon, then one week as three
   subject columns, each running class → alignment → my plan.

   BRAID is the same evidence as topology. Each subject is two threads —
   the room's and mine — and every spec point they share is an edge between
   the week I reach it and the week class teaches it. That is what a branch
   IS: my plan forks off, runs its own line, and merges back when class
   arrives at the same point. Nothing is invented for the picture; an edge
   exists only where a linked leaf ref is shared, so a plan with no links
   draws no arcs and says so.

   THE PLAN IS EDITABLE
   Notion was the source once and is not the source any more, so weeks and
   rows are fully creatable, editable and removable here. Deletes go through
   KOS.ui.confirm (danger: Cancel takes focus, Enter does not confirm) and
   Delete never sits next to Save.

   WHAT IT WILL NOT DO
   No session is logged, no XP/HP/gold moves, no study progress is written.
   Pacing reads the canonical study record to say what is already covered
   and links out to the topic page to change it; the Governor never hears
   from this file (invariants 1–3, and 5a's precedent for a logistics page).
   Opening a topic is one KOS.show away — the plan row is a signpost, not a
   second place to record mastery. */
(function () {
  "use strict";
  var el = KOS.ui.el;

  var SUBJ = [
    { id: "compsci", name: "Computer Science", short: "CS" },
    { id: "maths", name: "Mathematics", short: "Maths" },
    { id: "it", name: "IT · Data Analytics", short: "IT" }
  ];
  var HUE = { compsci: "var(--c-compsci)", maths: "var(--c-maths)", it: "var(--c-it)" };
  var NAME = {};
  SUBJ.forEach(function (s) { NAME[s.id] = s.name; });

  /* the school row's own vocabulary, kept as the scheme of work writes it */
  var KINDS = ["Lessons", "Assessment", "NEA Milestone", "Mock", "Revision"];
  var KIND_MARK = {
    "Lessons": "授", "Assessment": "試", "NEA Milestone": "課",
    "Mock": "模", "Revision": "復"
  };

  function shortDate(wb) {
    /* "2026-09-07" → "7 Sep". Built by hand rather than through toLocale so
       the ribbon reads identically in every locale the app is opened in. */
    var M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var p = String(wb || "").split("-");
    if (p.length !== 3) return String(wb || "");
    return String(parseInt(p[2], 10)) + " " + (M[parseInt(p[1], 10) - 1] || "");
  }
  function longDate(wb) {
    var M = ["January", "February", "March", "April", "May", "June", "July",
      "August", "September", "October", "November", "December"];
    var p = String(wb || "").split("-");
    if (p.length !== 3) return String(wb || "");
    return String(parseInt(p[2], 10)) + " " + (M[parseInt(p[1], 10) - 1] || "");
  }
  /* A week carries TWO numbers and they differ by one, so a tag that does
     not say which register it belongs to is a bug waiting to be read as
     the other one. `source` picks the right column; with none given the
     school number is the spine the term actually runs on. */
  function weekTag(w, source) {
    if (!w) return "";
    var n = source === "personal" ? w.personalWk
      : source === "school" ? w.schoolWk
      : (w.schoolWk || w.personalWk);
    return n ? "W" + n : "—";
  }
  /* the shared form idiom the calendar and tracker use: a label whose
     first span names the control */
  function field(label, input, hint) {
    return el("label", { class: "k-field", "data-ui": "cal.field ui.field" }, [
      el("span", { class: "k-field-label", text: label }),
      input,
      hint ? el("small", { class: "k-field-hint", text: hint }) : null
    ].filter(Boolean));
  }
  function input(type, attrs) { return el("input", Object.assign({ type: type, class: "k-input", "data-ui": "ui.input" }, attrs || {})); }
  function select(options, onchange) {
    return el("select", { class: "k-input", onchange: onchange || null }, options.map(function (o) {
      return el("option", { value: o[0], text: o[1] });
    }));
  }
  /* one dialog shell for both editors: head, body, the save row, and the
     danger row apart from it (invariant 84) */
  function dialogShell(title, body, actions, danger) {
    var overlay = el("div", { class: "k-dialog-overlay" });
    overlay.close = function () { overlay.remove(); };
    overlay.appendChild(el("div", { class: "k-dialog k-pace-dlg", "data-ui": "ui.dialog pace.dlg" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
        el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: title }),
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "✕", "aria-label": "Close", onclick: function () { overlay.close(); } })
      ]),
      el("div", { class: "k-dialog-body k-pace-dlg-body" }, body.filter(Boolean)),
      el("div", { class: "k-dialog-foot", "data-ui": "pace.dlg-actions" }, actions.filter(Boolean)),
      danger ? el("div", { class: "k-pace-dlg-danger", "data-ui": "pace.dlg-danger" }, [danger]) : null
    ].filter(Boolean)));
    return overlay;
  }
  function dlgHead(text) { return el("h3", { class: "k-kicker k-pace-dlg-h", text: text }); }

  /* the row's state, entirely derived from the canonical study record */
  function topicTone(cov) {
    if (!cov.refs) return "none";
    if (cov.done === cov.refs) return "done";
    if (cov.done || cov.started || cov.checks) return "part";
    return "open";
  }
  var TONE_GLYPH = { done: "●", part: "◐", open: "○", none: "—" };
  var TONE_WORD = { done: "complete", part: "in progress", open: "not started",
    none: "no linked spec point" };

  /* ============================================================
     THE SPEC-POINT PICKER

     355 leaves exist. Rendering them all "to make filtering easy" is the
     documented failure mode, so this shows what is CHOSEN plus what the
     current search matches, capped — and says out loud how many it did not
     draw rather than pretending the list is complete.
     ============================================================ */
  function refPicker(subjectOf, initial) {
    var chosen = (initial || []).slice();
    var CAP = 40;

    var search = input("search", { placeholder: "Search the specification…", "aria-label": "Search specification points" });
    var list = el("div", { class: "k-pace-pick-list", role: "group",
      "aria-label": "Specification points for this row" });
    var count = el("p", { class: "k-field-hint", "data-ui": "pace.pick-count" });

    function leaves() {
      var sid = subjectOf();
      if (!sid || !KOS.hub || !KOS.hub.LEAVES || !KOS.hub.LEAVES[sid]) return [];
      return KOS.hub.LEAVES[sid];
    }
    function row(leaf, on) {
      var cb = el("input", { type: "checkbox", class: "k-box", onchange: function () {
        var i = chosen.indexOf(leaf.ref);
        if (cb.checked && i === -1) chosen.push(leaf.ref);
        if (!cb.checked && i !== -1) chosen.splice(i, 1);
        render();
      } });
      cb.checked = !!on;
      var r = el("label", { class: "k-pace-pick-row", "data-ui": "pace.pick-row" }, [
        cb,
        el("span", { class: "k-mono k-pace-pick-id", text: leaf.ref }),
        el("span", { class: "k-pace-pick-t", text: leaf.title })
      ]);
      if (on) KOS.ui.state(r, "is-on", true);
      return r;
    }
    function render() {
      var all = leaves();
      var byRef = {};
      all.forEach(function (l) { byRef[l.ref] = l; });
      /* a ref chosen under a subject that has since changed is dropped, so
         the row can never claim a leaf its subject does not have */
      chosen = chosen.filter(function (r) { return byRef[r]; });

      list.innerHTML = "";
      chosen.forEach(function (r) { list.appendChild(row(byRef[r], true)); });

      var q = search.value.trim().toLowerCase();
      var pool = all.filter(function (l) { return chosen.indexOf(l.ref) === -1; });
      var hits = q
        ? pool.filter(function (l) {
          return l.ref.toLowerCase().indexOf(q) !== -1 || l.title.toLowerCase().indexOf(q) !== -1;
        })
        : pool;
      hits.slice(0, CAP).forEach(function (l) { list.appendChild(row(l, false)); });

      if (!all.length) count.textContent = "Choose a subject first.";
      else if (!hits.length) count.textContent = chosen.length
        ? "Nothing else matches — " + chosen.length + " chosen."
        : "Nothing matches “" + search.value.trim() + "”.";
      else if (hits.length > CAP) count.textContent = chosen.length + " chosen · showing "
        + CAP + " of " + hits.length + " matches — narrow the search to see the rest.";
      else count.textContent = chosen.length + " chosen · " + hits.length + " match"
        + (hits.length === 1 ? "" : "es") + ".";
    }
    search.addEventListener("input", KOS.ui.debounce(render, 140));
    render();

    return {
      node: el("div", { class: "k-pace-pick", "data-ui": "pace.picker" }, [search, list, count]),
      refresh: render,
      value: function () { return chosen.slice(); }
    };
  }

  /* ============================================================
     THE ROW EDITOR
     One dialog creates and edits, because they are the same form. It also
     carries the read-only half a plan row is FOR — the linked topic pages
     and what the study record already says about them.
     ============================================================ */
  function entryDialog(existing, defaults, onSaved) {
    defaults = defaults || {};
    var creating = !existing;
    var e = existing || {};
    var overlay;
    function close() { overlay.close(); }

    var sourceSel = select([["personal", "My plan"], ["school", "In class"]], onShape);
    sourceSel.value = e.source || defaults.source || "personal";

    var subjSel = select(SUBJ.map(function (s) { return [s.id, s.name]; }), function () { picker.refresh(); });
    subjSel.value = e.subject || defaults.subject || "compsci";

    var weekSel = select(KOS.pacing.weeks().map(function (w) { return [w.wb, w.label]; }));
    weekSel.value = e.wb || defaults.wb || (KOS.pacing.weeks()[0] || {}).wb || "";

    var title = input("text", { placeholder: "e.g. Graph traversal: depth-first & breadth-first" });
    title.value = e.title || "";

    var kindSel = select(KINDS.map(function (k) { return [k, k]; }));
    kindSel.value = e.kind || "Lessons";

    var area = input("text", { placeholder: "e.g. 4.3 Algorithms / Pure / TA2" });
    area.value = e.area || "";
    var paper = input("text", { placeholder: "e.g. Paper 1" });
    paper.value = e.paper || "";

    var detail = el("textarea", { class: "k-input", rows: 2, placeholder: "What the week actually covers…" });
    detail.value = e.detail || "";
    var note = el("textarea", { class: "k-input", rows: 3,
      "aria-label": "Your note for this plan row",
      placeholder: "What you actually want to do with this — a weak spot, a paper to sit, a resource…" });
    note.value = e.note || "";      /* the attribute is ignored; the property is not */

    var picker = refPicker(function () { return subjSel.value; }, e.refs || []);

    /* the tick and the reminder handoff — MY rows only. The tick is the
       plan's own bookkeeping (KOS.pacing.setDone); the reminder is a real
       reminder in the Reminders store, due the Sunday the week ends, that
       carries the row's title — one canonical record, linked by text, never
       a second copy of the plan (invariant 27). */
    var doneBox = el("input", { type: "checkbox", class: "k-box" });
    doneBox.checked = !!e.done;
    var doneField = field("Ticked off", el("span", { class: "k-check", "data-ui": "pace.dlg-done" }, [doneBox, el("span", { text: "I did this" })]),
      creating ? null : (e.done && e.doneAt ? "ticked " + new Date(e.doneAt).toLocaleDateString() : "an unticked row carries over once its week has ended"));
    var remindBtn = creating ? null : el("button", { type: "button", class: "k-btn", text: "🔔 Remind me by the week's end",
      onclick: function () {
        if (!KOS.reminders) return;
        var r = KOS.reminders.add({ title: "Plan: " + e.title, due: KOS.pacing.weekEnd(e.wb), dueTime: "18:00",
          tags: ["pacing", e.subject], alerts: [1440],
          notes: "From the weekly plan — " + ((KOS.pacing.weekAt(e.wb) || {}).label || e.wb) + " · Pacing #" + e.id });
        KOS.ui.toast(r ? "Reminder set for " + KOS.pacing.weekEnd(e.wb) + "." : "Could not add the reminder.", !r);
      } });

    var kindField = field("Type", kindSel);
    var areaField = field("Area or strand", area);
    var paperField = field("Paper", paper);
    function onShape() {
      var school = sourceSel.value === "school";
      kindField.hidden = !school;
      areaField.hidden = school;
      paperField.hidden = school;
      doneField.hidden = school;
      if (remindBtn) remindBtn.hidden = school;
    }

    /* the read-only half: only worth drawing for a row that already exists
       and already links somewhere */
    var linked = null;
    if (!creating && e.refs && e.refs.length) {
      var cov = KOS.pacing.coverage(e);
      linked = el("section", { class: "k-pace-dlg-sec" }, [
        dlgHead("Linked topic pages"),
        el("div", { class: "k-pace-dlg-refs", "data-ui": "pace.dlg-refs" }, KOS.pacing.leavesOf(e).map(function (l) {
          var p = KOS.store.peekProgress(e.subject, l.ref);
          var status = !p || p.status === "none" ? "Not started"
            : p.status === "done" ? "Completed"
            : p.status === "paused" ? "Paused" : "Started";
          var ticks = p ? (p.check || []).filter(Boolean).length : 0;
          return el("button", { type: "button", class: "k-pace-dlg-ref", "data-ui": "pace.dlg-ref",
            onclick: function () { close(); KOS.show("ref", { subject: e.subject, ref: l.ref }); } }, [
            el("span", { class: "k-mono k-pace-pick-id", text: l.ref }),
            el("span", { class: "k-pace-dlg-ref-t" }, [
              el("b", { text: l.title }),
              el("span", { class: "k-muted", text: status + " · " + ticks + " of 4 checks" })
            ]),
            el("span", { class: "k-muted", "aria-hidden": "true", text: "→" })
          ]);
        })),
        el("p", { class: "k-field-hint", text:
          cov.done + " of " + cov.refs + " marked complete · " + cov.checks + " of "
          + cov.maxChecks + " checks ticked, from the study record." })
      ]);
    } else if (!creating) {
      var none = KOS.ui.emptyState({
        compact: true,
        mark: "空",
        title: "No specification point matches this row",
        body: "It was checked against all three published specifications and none of them "
          + "names this as its own topic, so nothing is linked rather than something near enough. "
          + "Link one below if you disagree."
      });
      none.setAttribute("data-ui", none.getAttribute("data-ui") + " pace.nolink");
      linked = el("section", { class: "k-pace-dlg-sec" }, [dlgHead("Linked topic pages"), none]);
    }

    function save() {
      if (!title.value.trim()) { KOS.ui.toast("Give the row a title.", true); title.focus(); return; }
      var data = {
        source: sourceSel.value,
        subject: subjSel.value,
        wb: weekSel.value,
        title: title.value.trim(),
        kind: sourceSel.value === "school" ? kindSel.value : "",
        area: sourceSel.value === "school" ? "" : area.value.trim(),
        paper: sourceSel.value === "school" ? "" : paper.value.trim(),
        detail: detail.value.trim(),
        note: note.value,
        refs: picker.value(),
        done: sourceSel.value === "personal" && doneBox.checked,
        doneAt: sourceSel.value === "personal" && doneBox.checked ? (e.done && e.doneAt ? e.doneAt : Date.now()) : null
      };
      var saved = creating ? KOS.pacing.addEntry(data) : KOS.pacing.updateEntry(e.id, data);
      if (!saved) { KOS.ui.toast("That could not be saved — check the week and subject.", true); return; }
      KOS.ui.toast(creating ? "Row added to the plan." : "Row updated.");
      close();
      onSaved && onSaved(saved);
    }

    var metaChips = creating ? null : el("div", { class: "k-cluster" }, [
      (function () { var c = el("span", { class: "k-chip", text: NAME[e.subject] || e.subject }); c.style.setProperty("--chip-c", HUE[e.subject] || "var(--text-2)"); return c; })(),
      el("span", { class: "k-chip", text: (KOS.pacing.weekAt(e.wb) || {}).label || e.wb }),
      el("span", { class: "k-chip", text: e.source === "school" ? "In class" : "My plan" })
    ]);

    overlay = dialogShell(creating ? "Add a plan row" : e.title, [
      metaChips,
      el("div", { class: "k-pace-fgrid" }, [
        field("Register", sourceSel), field("Subject", subjSel), field("Week", weekSel),
        kindField, areaField, paperField
      ]),
      field("Title", title),
      field("Detail", detail),
      doneField,
      linked,
      el("section", { class: "k-pace-dlg-sec" }, [dlgHead(creating ? "Specification points" : "Change the links"), picker.node]),
      el("section", { class: "k-pace-dlg-sec" }, [dlgHead("Your note"), note])
    ], [
      remindBtn,
      el("button", { type: "button", class: "k-btn k-btn--primary k-spacer", "data-intent": "primary", text: creating ? "Add row" : "Save changes", onclick: save })
    ],
    /* Delete is deliberately not in the same control group as Save */
    creating ? null : el("button", { type: "button", class: "k-btn k-btn--danger k-btn--sm", "data-intent": "danger", text: "Delete this row", onclick: function () {
      KOS.ui.confirm({
        title: "Delete this plan row?",
        body: "“" + e.title + "” will be removed from " + ((KOS.pacing.weekAt(e.wb) || {}).label || e.wb)
          + ". Your study progress on the topics it links to is not touched.",
        danger: true, confirm: "Delete row"
      }, function () {
        KOS.pacing.removeEntry(e.id);
        KOS.ui.toast("Row deleted.");
        close();
        onSaved && onSaved(null);
      });
    } }));
    onShape();
    KOS.ui.openDialog(overlay);
    if (creating) title.focus();
  }

  /* ============================================================
     THE WEEK EDITOR
     Same one-dialog-two-jobs shape. The week beginning is the key every row
     addresses, so moving it re-points those rows in the same write — that
     is why this goes through KOS.pacing.updateWeek rather than the field.
     ============================================================ */
  function weekDialog(existing, onSaved) {
    var creating = !existing;
    var w = existing || {};
    var overlay;
    function close() { overlay.close(); }

    var wb = input("date", { "aria-label": "Week beginning" });
    wb.value = w.wb || "";
    var label = input("text", { placeholder: "e.g. w/c 7 Sept" });
    label.value = w.label || "";
    var schoolWk = input("number", { min: 1, placeholder: "—" });
    if (w.schoolWk != null) schoolWk.value = String(w.schoolWk);
    var personalWk = input("number", { min: 1, placeholder: "—" });
    if (w.personalWk != null) personalWk.value = String(w.personalWk);
    var note = el("textarea", { class: "k-input", rows: 3, "aria-label": "Note for this week",
      placeholder: "What this week is really for…" });
    note.value = w.note || "";

    var rows = creating ? 0 : KOS.pacing.entriesFor(w.wb).length;

    function save() {
      var data = {
        wb: wb.value,
        label: label.value.trim() || ("w/c " + shortDate(wb.value)),
        schoolWk: schoolWk.value === "" ? null : parseInt(schoolWk.value, 10),
        personalWk: personalWk.value === "" ? null : parseInt(personalWk.value, 10),
        note: note.value
      };
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.wb)) { KOS.ui.toast("Give the week a beginning date.", true); wb.focus(); return; }
      var saved = creating ? KOS.pacing.addWeek(data) : KOS.pacing.updateWeek(w.wb, data);
      if (!saved) {
        KOS.ui.toast(creating ? "A week already begins on that date." : "That date is taken by another week.", true);
        return;
      }
      KOS.ui.toast(creating ? "Week added." : "Week updated.");
      close();
      onSaved && onSaved(saved);
    }

    overlay = dialogShell(creating ? "Add a week" : "Edit " + (w.label || w.wb), [
      el("div", { class: "k-pace-fgrid" }, [
        field("Week beginning", wb, creating ? null : "Moving this date moves its " + rows + " row" + (rows === 1 ? "" : "s") + " with it."),
        field("Label", label),
        field("School week", schoolWk),
        field("My week", personalWk)
      ]),
      field("Note", note)
    ], [
      el("button", { type: "button", class: "k-btn k-btn--primary k-spacer", "data-intent": "primary", text: creating ? "Add week" : "Save changes", onclick: save })
    ], creating ? null : el("button", { type: "button", class: "k-btn k-btn--danger k-btn--sm", "data-intent": "danger", text: "Delete this week", onclick: function () {
      KOS.ui.confirm({
        title: "Delete " + (w.label || w.wb) + "?",
        body: rows
          ? "This week holds " + rows + " plan row" + (rows === 1 ? "" : "s") + ". Deleting the week deletes "
            + (rows === 1 ? "it" : "them") + " too. Your study progress is not touched."
          : "This week holds no plan rows.",
        danger: true, confirm: rows ? "Delete week and " + rows + " row" + (rows === 1 ? "" : "s") : "Delete week"
      }, function () {
        var res = KOS.pacing.removeWeek(w.wb, { cascade: true });
        KOS.ui.toast(res.entries ? "Week and " + res.entries + " row" + (res.entries === 1 ? "" : "s") + " deleted." : "Week deleted.");
        close();
        onSaved && onSaved(null);
      });
    } }));
    KOS.ui.openDialog(overlay);
    (creating ? wb : label).focus();
  }

  /* ============================================================
     THE BRAID
     ============================================================ */
  /* ============================================================
     THE BRAID — a commit graph, not a chord diagram

     The first cut drew two parallel threads per subject and joined them
     with chords. It was honest and unreadable: every arc crossed the whole
     term and the result looked like tangled string rather than structure.

     This is the git-graph idiom instead, because the relationship really is
     that shape. The SPINE is the room's timeline, running left to right —
     the clock nobody controls. My own plan is the tick row beneath it. Each
     specification point the two SHARE is a BRANCH: it leaves one row, runs
     along a free depth, and rejoins the other.

       leaves my row, merges into the spine   → I got there first
       leaves the spine, ends on my row       → class got there first
       both in one column                     → a stub, same week

     Branches are packed into depths the way a commit graph packs lanes:
     the lowest depth whose last branch has already ended. That is what
     keeps 20-odd branches legible instead of stacked on one another.
     ============================================================ */
  var COL = 74, PAD_K = 116, PAD_L = 18, PAD_T = 42, PAD_B = 18;
  var SPINE_GAP = 28;        /* class spine → my tick row              */
  var DEPTH_0 = 22;          /* my tick row → the first branch depth   */
  var DEPTH_H = 15;          /* between branch depths                  */
  var LANE_PAD = 30;         /* below the deepest branch of a subject  */
  var CORNER = 7;
  function toneOf(lead) { return lead > 0 ? "ahead" : lead < 0 ? "behind" : "same"; }

  /* commit-graph lane packing: the lowest depth free at this branch's
     left edge. Returns the depth index, and grows the table as needed. */
  function packDepth(ends, left, right) {
    for (var d = 0; d < ends.length; d++) {
      if (ends[d] < left - 8) { ends[d] = right; return d; }
    }
    ends.push(right);
    return ends.length - 1;
  }

  /* Geometry is computed here; every paint is a class in the stylesheet,
     with the subject's hue riding --lane-hue on each lane's group. */
  function braidSvg(model, todayWb, onPickWeek) {
    var S = KOS.charts.svgNode;
    var ws = model.weeks;
    var W = PAD_L + ws.length * COL + 26;
    function svgTag(w, h, cls, hook) {
      var n = S("svg", { viewBox: "0 0 " + w + " " + h, width: String(w), height: String(h), "class": cls });
      n.setAttribute("data-ui", hook);
      return n;
    }
    function group(parent, hue) {
      var g = S("g", { "class": "k-braid-lane" });
      g.style.setProperty("--lane-hue", hue);
      parent.appendChild(g);
      return g;
    }

    var idx = {};
    ws.forEach(function (w, i) { idx[w.wb] = i; });
    function x(wb) { return PAD_L + idx[wb] * COL + COL / 2; }

    /* lay every lane out first so the canvas can be the exact height the
       packed branches need — a fixed lane height would either clip a busy
       subject or leave a quiet one floating in space */
    var laid = [], y = PAD_T;
    model.lanes.forEach(function (lane) {
      var ends = [];
      var branches = lane.links.map(function (link) {
        var xm = x(link.fromWb), xc = x(link.toWb);
        var left = Math.min(xm, xc), right = Math.max(xm, xc);
        return { link: link, xm: xm, xc: xc, left: left, right: right,
          tone: toneOf(link.lead), depth: 0 };
      }).sort(function (a, b) { return a.left - b.left || a.right - b.right; });
      branches.forEach(function (b) {
        b.depth = b.link.lead === 0 ? 0 : packDepth(ends, b.left, b.right);
      });
      var depths = Math.max(1, ends.length);
      var lane0 = y;
      var ySpine = y + 18;
      var yMine = ySpine + SPINE_GAP;
      var height = 18 + SPINE_GAP + DEPTH_0 + depths * DEPTH_H + LANE_PAD;
      laid.push({ lane: lane, branches: branches, y0: lane0, ySpine: ySpine,
        yMine: yMine, depths: depths, height: height });
      y += height;
    });
    var H = y + PAD_B;

    var svg = svgTag(W, H, "k-braid", "pace.braid-svg");
    svg.setAttribute("role", "img");

    /* The lane names live in their OWN, non-scrolling svg. Inside the
       scrolling body they slid out of view the moment you looked at
       November, and a branch graph whose lanes are unlabelled is three
       anonymous tangles. Both svgs are laid out from the same `laid`
       table, so the rows cannot drift apart. */
    var keys = svgTag(PAD_K, H, "k-braid k-braid-keys", "pace.braid-keys");
    keys.setAttribute("aria-hidden", "true");

    /* Column click-targets go in FIRST, behind everything, so a click on
       a mark still belongs to the mark and its <title> still shows. The
       merges list below is the real keyboard and screen-reader route. */
    if (onPickWeek) {
      ws.forEach(function (w) {
        var hit = S("rect", { x: PAD_L + idx[w.wb] * COL, y: 0, width: COL, height: H, rx: 6, "class": "k-braid-hit" });
        hit.addEventListener("click", function () { onPickWeek(w); });
        hit.appendChild(S("title", { text: "Open " + w.label }));
        svg.appendChild(hit);
      });
    }

    /* --- the week axis, labelled: a diagram without one is decoration --- */
    ws.forEach(function (w) {
      var isNow = todayWb === w.wb;
      svg.appendChild(S("text", { x: x(w.wb), y: 17, "text-anchor": "middle",
        "class": "k-braid-wk" + (isNow ? " k-braid-wk--now" : ""), text: weekTag(w, "school") }));
      svg.appendChild(S("text", { x: x(w.wb), y: 31, "text-anchor": "middle", "class": "k-braid-date", text: shortDate(w.wb) }));
      if (isNow) svg.appendChild(S("line", { x1: x(w.wb), y1: 36, x2: x(w.wb), y2: H - PAD_B, "class": "k-braid-now" }));
    });

    laid.forEach(function (L, li) {
      var lane = L.lane;
      var meta = SUBJ.filter(function (s) { return s.id === lane.subject; })[0];
      var g = group(svg, HUE[lane.subject]);
      var gk = group(keys, HUE[lane.subject]);

      [[g, W, 10], [gk, PAD_K, 0]].forEach(function (pair) {
        pair[0].appendChild(S("rect", { x: 0, y: L.y0 - 4, width: pair[1], height: L.height - 10, rx: pair[2],
          "class": "k-braid-band" + (li % 2 ? " k-braid-band--alt" : "") }));
      });

      gk.appendChild(S("text", { x: 12, y: L.ySpine - 14, "class": "k-braid-name", text: meta.name }));
      gk.appendChild(S("rect", { x: 0, y: L.ySpine - 24, width: 3, height: 16, rx: 1.5, "class": "k-braid-rule" }));

      /* the spine: the room's clock, one unbroken line */
      g.appendChild(S("line", { x1: 0, y1: L.ySpine, x2: W - 14, y2: L.ySpine, "class": "k-braid-spine" }));
      gk.appendChild(S("text", { x: 12, y: L.ySpine + 4, "class": "k-braid-lab", text: "In class" }));
      gk.appendChild(S("line", { x1: PAD_K - 22, y1: L.ySpine, x2: PAD_K, y2: L.ySpine, "class": "k-braid-spine" }));

      /* my own row: ticks, not a second spine — my plan is discrete work,
         not a timetable that runs whether I show up or not */
      gk.appendChild(S("text", { x: 12, y: L.yMine + 4, "class": "k-braid-lab", text: "My plan" }));
      gk.appendChild(S("line", { x1: PAD_K - 22, y1: L.yMine, x2: PAD_K, y2: L.yMine, "class": "k-braid-mine" }));
      g.appendChild(S("line", { x1: 0, y1: L.yMine, x2: W - 14, y2: L.yMine, "class": "k-braid-mine" }));

      /* --- branches, drawn under the nodes --- */
      L.branches.forEach(function (b) {
        var link = b.link;
        var yb = L.yMine + DEPTH_0 + b.depth * DEPTH_H;
        var d;
        if (link.lead === 0) {
          /* a stub: the same column, so there is nothing to route around */
          d = "M" + b.xm + "," + L.yMine + " L" + b.xm + "," + L.ySpine;
        } else {
          var fromY = link.lead > 0 ? L.yMine : L.ySpine;
          var toY = link.lead > 0 ? L.ySpine : L.yMine;
          var xL = Math.min(b.xm, b.xc), xR = Math.max(b.xm, b.xc);
          var yL = (xL === b.xm) === (link.lead > 0) ? fromY : toY;
          var yR = yL === fromY ? toY : fromY;
          var r = Math.min(CORNER, Math.max(2, (xR - xL) / 2 - 1));
          d = "M" + xL + "," + yL +
            " L" + xL + "," + (yb - r) +
            " Q" + xL + "," + yb + " " + (xL + r) + "," + yb +
            " L" + (xR - r) + "," + yb +
            " Q" + xR + "," + yb + " " + xR + "," + (yb - r) +
            " L" + xR + "," + yR;
        }
        var node = S("path", { d: d, "class": "k-braid-link", "data-tone": b.tone });
        node.style.setProperty("--w", String(Math.min(3, 1.3 + link.refs.length * 0.45)));
        node.appendChild(S("title", { text:
          link.refs.length + " spec point" + (link.refs.length === 1 ? "" : "s") + " · my plan "
          + (link.lead > 0 ? Math.abs(link.lead) + " week" + (Math.abs(link.lead) === 1 ? "" : "s") + " before class"
            : link.lead < 0 ? Math.abs(link.lead) + " week" + (Math.abs(link.lead) === 1 ? "" : "s") + " after class"
            : "the same week as class")
          + " — " + link.refs.map(function (r) { return r.ref; }).join(", ") }));
        g.appendChild(node);

        /* where the branch RESOLVES: a merge into the spine, or my row
           finally picking up what class already taught */
        var tipX = link.lead > 0 ? b.xc : b.xm;
        var tipY = link.lead > 0 ? L.ySpine : L.yMine;
        if (link.lead !== 0) {
          g.appendChild(S("path", { "class": "k-braid-tip", "data-tone": b.tone, d: link.lead > 0
            ? "M" + (tipX - 4) + "," + (tipY + 7) + " L" + tipX + "," + (tipY + 1) + " L" + (tipX + 4) + "," + (tipY + 7) + " Z"
            : "M" + (tipX - 4) + "," + (tipY - 7) + " L" + tipX + "," + (tipY - 1) + " L" + (tipX + 4) + "," + (tipY - 7) + " Z" }));
        }
      });

      /* --- unplanned class points: an open tick, never a silent gap --- */
      var byWb = {};
      lane.unplanned.forEach(function (u) { (byWb[u.wb] = byWb[u.wb] || []).push(u); });
      Object.keys(byWb).forEach(function (wb) {
        var m = S("text", { x: x(wb), y: L.ySpine - 12, "text-anchor": "middle", "class": "k-braid-open", text: "△" + byWb[wb].length });
        m.appendChild(S("title", { text: byWb[wb].length + " spec point"
          + (byWb[wb].length === 1 ? "" : "s") + " class teaches that your plan does not schedule" }));
        g.appendChild(m);
      });

      /* --- the nodes: solid on the spine, ringed on my row --- */
      Object.keys(lane.classAt).forEach(function (wb) {
        var n = lane.classAt[wb];
        var c = S("circle", { cx: x(wb), cy: L.ySpine, r: String(Math.min(8, 4.5 + n * 1.1)), "class": "k-braid-node" });
        c.appendChild(S("title", { text: meta.name + " · In class · "
          + (KOS.pacing.weekAt(wb) || {}).label + " · " + n + " row" + (n === 1 ? "" : "s") }));
        g.appendChild(c);
      });
      Object.keys(lane.mineAt).forEach(function (wb) {
        var n = lane.mineAt[wb];
        var c = S("circle", { cx: x(wb), cy: L.yMine, r: String(Math.min(7.5, 4 + n * 0.7)), "class": "k-braid-node k-braid-node--mine" });
        c.appendChild(S("title", { text: meta.name + " · My plan · "
          + (KOS.pacing.weekAt(wb) || {}).label + " · " + n + " row" + (n === 1 ? "" : "s") }));
        g.appendChild(c);
      });
    });

    /* the accessible name says what the picture claims, in one sentence */
    var totalLinks = model.lanes.reduce(function (a, l) { return a + l.links.length; }, 0);
    svg.setAttribute("aria-label",
      "Branch diagram of " + ws.length + " weeks across three subjects. Each subject has a class "
      + "spine, a row of my own planned weeks beneath it, and " + totalLinks
      + " branch" + (totalLinks === 1 ? "" : "es") + " — one for each specification point the two share. "
      + "The same information is listed as buttons below the diagram.");

    return { keys: keys, body: svg };
  }

  /* ============================================================
     THE VIEW
     ============================================================ */
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

  KOS.views.pacing = function (main, arg) {
    KOS.shell.tree("none");

    KOS.pacing.ensureSeeded();

    /* the legacy string argument is a week beginning; the object form adds
       the tab, so #/pacing/braid and #/pacing/2026-11-02 both resolve here */
    var want = typeof arg === "string" ? { wb: arg } : (arg || {});
    var tab = want.tab === "braid" ? "braid" : "week";

    var weeks = KOS.pacing.weeks();
    var todayWeek = KOS.pacing.currentWeek();
    var selected = (want.wb && KOS.pacing.weekAt(want.wb)) || todayWeek || weeks[0] || null;

    /* the switcher rides in the header's own action slot, where Planner and
       Sync put theirs — one place in the app where a page's two readings
       live, rather than a second strip under the title */
    var viewTabs = KOS.workspaceTabs([
      ["Week", "pacing", { wb: selected && selected.wb }, "week"],
      ["Braid", "pacing", { tab: "braid" }, "braid"]
    ], tab, "Pacing views", "k-pace-tabs");
    viewTabs.setAttribute("data-ui", (viewTabs.getAttribute("data-ui") || "") + " pace.tabs");

    main.appendChild(KOS.ui.pageHeader({
      kicker: "The integrated week",
      title: "Pacing",
      /* the offset rule lives in Help & Guide, not in a paragraph the page
         has to carry every time it is opened */
      sub: "School, my own curriculum and IT F201 on one timeline.",
      actions: [viewTabs]
    }));

    if (!weeks.length) {
      main.appendChild(KOS.ui.emptyState({
        mark: "暦",
        title: "The plan is empty",
        body: "The weekly plan ships with the build and is copied in on first run. "
          + "Add a week to start one by hand, or restore a backup.",
        action: el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "+ Add a week",
          onclick: function () { weekDialog(null, function () { KOS.rerender(); }); } })
      }));
      return;
    }

    var body = el("div", { class: "k-pace" });
    if (tab === "braid") { main.appendChild(body); renderBraid(); return; }

    var ribbonHolder = el("div", {});
    main.appendChild(ribbonHolder);
    main.appendChild(body);

    /* ---------------- the term ribbon ----------------
       Graphite (frame 10f): a tile per week, its plan rows as segments —
       ticked, carried past their week, or still to come */
    function buildRibbon() {
      ribbonHolder.innerHTML = "";
      var track = el("div", { class: "k-pace-ribbon" });
      weeks.forEach(function (w) {
        var l = KOS.pacing.load(w.wb);
        var brk = KOS.pacing.isBreak(w);
        var mock = KOS.pacing.isMock(w);
        var now = todayWeek && todayWeek.wb === w.wb;
        var behind = now && KOS.pacing.weekStatus(w.wb).carried;
        var past = todayWeek && w.wb < todayWeek.wb;
        var mine = KOS.pacing.entriesFor(w.wb, null, "personal");
        var label = "Week beginning " + longDate(w.wb)
          + (w.schoolWk ? " — school week " + w.schoolWk : "")
          + (w.personalWk ? ", my week " + w.personalWk : "")
          + " — " + l.total + " topic" + (l.total === 1 ? "" : "s") + " planned"
          + (brk ? ", half term" : "") + (mock ? ", mock week" : "")
          + (now ? ", the week we are in" : "")
          + (behind ? ", " + behind + " carried over" : "");
        var segs = el("span", { class: "k-pace-wk-segs", "aria-hidden": "true" }, mine.slice(0, 8).map(function (e) {
          var s = el("span", { class: "k-pace-wk-seg" });
          if (e.done) KOS.ui.state(s, "done", true);
          else if (past) KOS.ui.state(s, "missed", true);
          return s;
        }));
        var btn = el("button", { type: "button", class: "k-pace-wk", "data-ui": "pace.wk",
          "aria-label": label,
          onclick: function () { KOS.show("pacing", { wb: w.wb }); } }, [
          el("span", { class: "k-pace-wk-d k-mono", "aria-hidden": "true", text: brk ? "Half term" : "w/c " + shortDate(w.wb) }),
          brk ? null : el("span", { class: "k-pace-wk-n", "aria-hidden": "true", text: weekTag(w) + (mock ? " · mock" : "") }),
          brk ? null : segs
        ].filter(Boolean));
        if (selected && selected.wb === w.wb) btn.setAttribute("aria-current", "true");
        if (brk) KOS.ui.state(btn, "is-break", true);
        if (mock) KOS.ui.state(btn, "is-mock", true);
        if (now) KOS.ui.state(btn, "is-now", true);
        if (behind) KOS.ui.state(btn, "is-behind", true);
        track.appendChild(btn);
      });
      track.appendChild(el("button", { type: "button", class: "k-pace-wk k-pace-wk--add", "data-ui": "pace.wk pace.wk-add",
        "aria-label": "Add a week to the plan",
        onclick: function () { weekDialog(null, function (w) { KOS.show("pacing", { wb: w.wb }); }); } }, [
        el("span", { class: "k-pace-wk-d", "aria-hidden": "true", text: "+ Week" })
      ]));
      var wrap = KOS.ui.scroller(track, {
        className: "k-pace-ribbon-wrap",
        label: "The term, week by week",
        prevLabel: "Earlier weeks", nextLabel: "Later weeks"
      });
      wrap.setAttribute("data-ui", (wrap.getAttribute("data-ui") || "") + " pace.ribbon-wrap");
      ribbonHolder.appendChild(wrap);
    }

    /* ---------------- one subject column ---------------- */
    function kicker(text, hue) {
      var k = el("p", { class: "k-kicker k-pace-reg-k", text: text });
      if (hue) KOS.ui.state(k, "hued", true);
      return k;
    }
    function subjectColumn(sid) {
      var meta = SUBJ.filter(function (s) { return s.id === sid; })[0];
      var classRows = KOS.pacing.entriesFor(selected.wb, sid, "school");
      var myRows = KOS.pacing.entriesFor(selected.wb, sid, "personal");
      var carried = KOS.pacing.carriedInto(selected.wb, sid);
      var a = KOS.pacing.alignment(selected.wb, sid);
      var line = KOS.pacing.alignmentLine(a);
      var ticked = myRows.filter(function (e) { return e.done; }).length;

      var col = el("section", { class: "k-card k-pace-col", "data-ui": "pace.col", "data-subject": sid, "aria-label": meta.name });
      col.style.setProperty("--pace-hue", HUE[sid]);

      col.appendChild(el("h3", { class: "k-pace-col-h" }, [
        el("span", { class: "k-pace-col-dot", "aria-hidden": "true" }),
        el("span", { class: "k-pace-col-name", text: meta.name }),
        myRows.length ? el("span", { class: "k-pace-col-n k-mono", "aria-label": ticked + " of " + myRows.length + " ticked", text: ticked + " / " + myRows.length }) : null
      ].filter(Boolean)));

      function addBtn(source) {
        return el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "pace.add",
          "aria-label": "Add a " + (source === "school" ? "class" : "plan") + " row for "
            + meta.name + ", " + selected.label, text: "+",
          onclick: function () {
            entryDialog(null, { wb: selected.wb, subject: sid, source: source },
              function () { redraw(); });
          } });
      }

      /* register 1 — the room */
      var classBox = el("div", { class: "k-pace-reg", "data-ui": "pace.reg-class" }, [
        el("div", { class: "k-pace-reg-head" }, [kicker("In class", true), addBtn("school")])
      ]);
      if (!classRows.length) {
        classBox.appendChild(el("p", { class: "k-pace-none", text: "Nothing scheduled." }));
      } else {
        classRows.forEach(function (e) {
          /* the row is the week's heading; the lessons under it are the
             scheme of work's own list, one per line */
          var lessons = KOS.pacing.lessonsOf(e);
          var btn = el("button", { type: "button", class: "k-pace-row-btn", "data-ui": "pace.class",
            onclick: function () { entryDialog(e, null, redraw); } }, [
            el("span", { class: "k-pace-mark", "aria-hidden": "true", text: KIND_MARK[e.kind] || "授" }),
            el("span", { class: "k-pace-row-t" }, [
              el("b", { text: e.title }),
              el("span", { class: "k-pace-row-m", "data-ui": "part.sub", text: e.kind + (lessons.length > 1 ? " · " + lessons.length + " lessons" : "")
                + ((e.refs || []).length ? " · " + e.refs.join(" · ") : "") })
            ])
          ]);
          if (e.kind === "Mock") KOS.ui.state(btn, "is-mock", true);
          if (e.kind === "Assessment") KOS.ui.state(btn, "is-assess", true);
          var block = el("div", { class: "k-pace-block", "data-ui": "pace.class-block" }, [btn]);
          if (lessons.length) {
            block.appendChild(el("ol", { class: "k-pace-lessons", "data-ui": "pace.lessons", "aria-label": "Lessons this week" },
              lessons.map(function (l, i) {
                var li = el("li", { class: "k-pace-lesson", "data-ui": "pace.lesson" }, [
                  el("span", { class: "k-pace-lesson-n k-mono", "aria-hidden": "true", text: String(i + 1) }),
                  el("span", { text: l.text })
                ]);
                KOS.ui.state(li, "is-" + l.tone, true);
                return li;
              })));
          }
          classBox.appendChild(block);
        });
      }
      col.appendChild(classBox);

      /* the join between the two registers: stated only when the linked
         spec refs actually support it */
      if (line) {
        col.appendChild(el("div", { class: "k-pace-align" }, [
          el("p", { class: "k-pace-align-line", text: line }),
          el("div", { class: "k-cluster" }, [
            a.ahead ? el("span", { class: "k-chip", "data-tone": "teal", text: a.ahead + " covered" }) : null,
            a.aligned ? el("span", { class: "k-chip", "data-tone": "green", text: a.aligned + " this week" }) : null,
            a.behind ? el("span", { class: "k-chip", "data-tone": "amber", text: a.behind + " later" }) : null,
            a.unplanned ? el("span", { class: "k-chip", "data-tone": "crimson", text: a.unplanned + " unplanned" }) : null
          ].filter(Boolean))
        ]));
      } else {
        col.appendChild(el("p", { class: "k-pace-none", text:
          classRows.length
            ? "Class is on work with no single spec point this week — nothing to compare."
            : "No class content to compare against." }));
      }

      /* register 2 — my own curriculum. Every row is a tick (the plan's own
         bookkeeping) beside a button (the row, its dialog, its topic pages)
         — two controls side by side, never one inside the other. */
      var mineBox = el("div", { class: "k-pace-reg", "data-ui": "pace.reg-mine" }, [
        el("div", { class: "k-pace-reg-head" }, [kicker("My plan"), addBtn("personal")])
      ]);
      if (carried.length) {
        var band = el("div", { class: "k-pace-carried", "data-ui": "pace.carried", role: "group",
          "aria-label": carried.length + " carried over from earlier weeks" }, [
          el("p", { class: "k-pace-carried-k" }, [
            el("span", { text: "Carried over" }),
            el("span", { class: "k-chip", "data-tone": "amber", text: carried.length + " behind" })
          ])
        ]);
        carried.forEach(function (c) { band.appendChild(planRow(c.entry, c)); });
        mineBox.appendChild(band);
      }
      if (!myRows.length && !carried.length) {
        mineBox.appendChild(el("p", { class: "k-pace-none", text:
          KOS.pacing.isBreak(selected) ? "Half term — nothing scheduled." : "Nothing scheduled." }));
      } else {
        myRows.forEach(function (e) { mineBox.appendChild(planRow(e, null)); });
      }
      col.appendChild(mineBox);
      return col;
    }

    /* one row of MY plan; `carry` is set when it is showing in a later week
       than the one it was planned for */
    function planRow(e, carry) {
      var cov = KOS.pacing.coverage(e);
      var tone = e.done ? "ticked" : topicTone(cov);
      var tick = el("input", { type: "checkbox", class: "k-pace-tick-in", "aria-label": "Tick off " + e.title,
        onchange: function () {
          KOS.pacing.setDone(e.id, tick.checked);
          KOS.ui.toast(tick.checked ? "Ticked off." : "Unticked — it will carry over if the week ends.");
          redraw();
        } });
      tick.checked = !!e.done;
      var from = carry ? (KOS.pacing.weekAt(carry.fromWb) || {}).label || carry.fromWb : null;
      var sub = carry
        ? "from " + from + " · " + carry.weeksLate + (carry.weeksLate === 1 ? " week" : " weeks") + " behind"
        : [(e.refs || []).join(" · "), e.area, e.paper].filter(Boolean).join(" · ");
      var btn = el("button", { type: "button", class: "k-pace-row-btn", "data-ui": "pace.row",
        "aria-label": e.title + " — " + (e.done ? "ticked off" : TONE_WORD[tone]) + (carry ? ", carried over, " + carry.weeksLate + " weeks behind" : ""),
        onclick: function () { entryDialog(e, null, redraw); } }, [
        el("span", { class: "k-pace-row-t" }, [
          el("b", { text: e.title }),
          sub ? el("span", { class: "k-pace-row-m", "data-ui": "part.sub", text: sub }) : null
        ].filter(Boolean)),
        el("span", { class: "k-pace-cov k-mono", "aria-hidden": "true", title: TONE_WORD[tone === "ticked" ? "done" : tone],
          text: (cov.refs ? cov.done + "/" + cov.refs : "—") + " " + TONE_GLYPH[tone === "ticked" ? "done" : tone] }),
        e.note ? el("span", { class: "k-pace-row-m", "aria-hidden": "true", text: "✎" }) : null
      ].filter(Boolean));
      var row = el("div", { class: "k-pace-plan", "data-ui": "pace.plan-row" }, [
        el("label", { class: "k-pace-tick", "data-ui": "pace.tick", title: e.done ? "Ticked off" : "Tick off when done" }, [tick]),
        btn,
        carry ? el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "pace.move", title: "Move this row into " + selected.label,
          "aria-label": "Move " + e.title + " into " + selected.label, text: "→ here",
          onclick: function () {
            KOS.pacing.updateEntry(e.id, { wb: selected.wb });
            KOS.ui.toast("Moved into " + selected.label + ".");
            redraw();
          } }) : null
      ].filter(Boolean));
      if (e.done) KOS.ui.state(row, "is-done", true);
      if (carry) KOS.ui.state(row, "is-carried", true);
      return row;
    }

    /* ---------------- the week ---------------- */
    function buildWeek() {
      body.innerHTML = "";
      if (!selected) return;

      /* The week in numbers, as a sub-line. Zero-only SUPPORTING facts are
         dropped (invariant 77); the primary count stays even at zero,
         because "nothing planned" is the answer to the question. */
      var load = KOS.pacing.load(selected.wb);
      var ws = KOS.pacing.weekStatus(selected.wb);
      var classPoints = 0, reached = 0;
      SUBJ.forEach(function (s) {
        var a = KOS.pacing.alignment(selected.wb, s.id);
        classPoints += a.classRefs.length;
        reached += a.ahead + a.aligned;
      });
      var isNow = todayWeek && todayWeek.wb === selected.wb;

      var head = KOS.ui.sectionHeader({
        className: "k-pace-weekhead",
        title: selected.label,
        sub: [
          selected.schoolWk ? "School week " + selected.schoolWk : null,
          selected.personalWk ? "My week " + selected.personalWk : null,
          KOS.pacing.isBreak(selected) ? "Half term" : null,
          load.total + " topic" + (load.total === 1 ? "" : "s") + " planned",
          ws.carried ? ws.carried + " carried over" : null,
          classPoints ? classPoints + " spec point" + (classPoints === 1 ? "" : "s") + " in class" : null,
          reached ? reached + " my plan has reached" : null
        ].filter(Boolean).join(" · "),
        actions: [
          el("button", { type: "button", class: "k-btn k-btn--sm", text: "+ Add row",
            onclick: function () {
              entryDialog(null, { wb: selected.wb, subject: "compsci", source: "personal" }, redraw);
            } }),
          todayWeek && todayWeek.wb !== selected.wb
            ? el("button", { type: "button", class: "k-btn k-btn--sm", text: "This week",
              onclick: function () { KOS.show("pacing", { wb: todayWeek.wb }); } })
            : null,
          el("button", { type: "button", class: "k-btn k-btn--sm", text: "Edit week",
            onclick: function () {
              weekDialog(selected, function (w) {
                if (!w) { KOS.show("pacing", { wb: (KOS.pacing.currentWeek() || {}).wb }); return; }
                if (w.wb !== selected.wb) { KOS.show("pacing", { wb: w.wb }); return; }
                redraw();
              });
            } })
        ].filter(Boolean)
      });
      head.setAttribute("data-ui", head.getAttribute("data-ui") + " pace.week-header");

      /* the week as a hero: whose week it is, how much is ticked, what is behind */
      var segs = ws.planned ? el("span", { class: "k-pace-hero-segs", role: "img", "aria-label": ws.done + " of " + ws.planned + " ticked" },
        Array.apply(null, { length: Math.min(ws.planned, 24) }).map(function (_, i) {
          var s = el("span", { class: "k-pace-hero-seg" });
          if (i < ws.done) KOS.ui.state(s, "done", true);
          return s;
        })) : null;
      body.appendChild(el("section", { class: "k-pace-hero", "aria-label": selected.label }, [
        el("p", { class: "k-kicker", text: isNow ? "This week" : todayWeek && selected.wb < todayWeek.wb ? "An earlier week" : "A week ahead" }),
        head,
        el("div", { class: "k-pace-hero-side" }, [
          ws.planned ? el("span", { class: "k-pace-hero-count", text: ws.done + " of " + ws.planned + " ticked" }) : null,
          segs,
          ws.carried ? el("span", { class: "k-chip", "data-tone": "amber", text: ws.carried + " behind" }) : null
        ].filter(Boolean))
      ]));

      body.appendChild(el("div", { class: "k-pace-grid" },
        SUBJ.map(function (s) { return subjectColumn(s.id); })));

      /* what else is due inside the week (assignments, from their one
         store, linked by date) and the week's own note */
      var foot = [];
      if (KOS.assignments && KOS.assignments.all) {
        var end = KOS.pacing.weekEnd(selected.wb);
        var due = KOS.assignments.all().filter(function (x) {
          return x.due && x.due >= selected.wb && x.due <= end;
        }).sort(function (x, y) { return x.due < y.due ? -1 : 1; });
        if (due.length) {
          foot.push(el("section", { class: "k-card", "data-ui": "pace.reg-due", "aria-label": "Due this week" },
            [el("h3", { class: "k-card-title", text: "Due this week" })].concat(due.map(function (x) {
              var open = KOS.assignments.isOpen ? KOS.assignments.isOpen(x) : x.status !== "complete";
              var r = el("button", { type: "button", class: "k-pace-due", onclick: function () { KOS.show("assignments"); } }, [
                el("span", { class: "k-pace-due-bar", "aria-hidden": "true" }),
                el("span", { class: "k-pace-row-t" }, [
                  el("b", { text: x.title }),
                  el("span", { class: "k-pace-row-m", text: shortDate(x.due) + (x.subject ? " · " + (SUBJ.filter(function (s) { return s.id === x.subject; })[0] || {}).short : "") + (open ? "" : " · done") })
                ])
              ]);
              if (x.subject) r.style.setProperty("--pace-hue", HUE[x.subject]);
              if (!open) KOS.ui.state(r, "is-done", true);
              return r;
            }))));
        }
      }
      if (selected.note) {
        foot.push(el("section", { class: "k-card", "aria-label": "Note for this week" }, [
          el("h3", { class: "k-card-title", text: "Note for this week" }),
          el("p", { class: "k-pace-note", text: selected.note })
        ]));
      }
      if (foot.length) body.appendChild(el("div", { class: "k-pace-foot" }, foot));
    }

    /* ---------------- the braid ---------------- */
    function renderBraid() {
      body.innerHTML = "";
      var model = KOS.pacing.braid();
      var linked = model.lanes.reduce(function (a, l) { return a + l.links.length; }, 0);

      /* No explanatory header: the legend names every mark, and the long
         version lives in Help & Guide. */
      if (!linked) {
        body.appendChild(KOS.ui.emptyState({
          mark: "枝",
          title: "Nothing to braid yet",
          body: "An arc is drawn only where a class row and one of my rows link to the SAME "
            + "specification point. Link some rows to spec points and the branches appear.",
          action: el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Open this week",
            onclick: function () { KOS.show("pacing", { wb: (todayWeek || weeks[0]).wb }); } })
        }));
        return;
      }

      function key(tone, text) {
        return el("span", { class: "k-pace-key", "data-ui": "pace.legend-k", "data-tone": tone, text: text });
      }
      var parts = braidSvg(model, todayWeek && todayWeek.wb, function (w) {
        KOS.show("pacing", { wb: w.wb });
      });
      var scroll = KOS.ui.scroller(el("div", { class: "k-pace-braid" }, [parts.body]), {
        className: "k-pace-braid-wrap",
        label: "Branch diagram of the term",
        prevLabel: "Earlier weeks", nextLabel: "Later weeks"
      });
      scroll.setAttribute("data-ui", (scroll.getAttribute("data-ui") || "") + " pace.braid-wrap");
      body.appendChild(el("section", { class: "k-card k-pace-braid-card", "aria-label": "Branch diagram" }, [
        el("div", { class: "k-card-head" }, [
          el("h2", { class: "k-card-title", text: "Branch diagram of the term" }),
          el("div", { class: "k-pace-legend" }, [
            key("ahead", "I reached it first"),
            key("same", "Same week"),
            key("behind", "Class reached it first"),
            key("open", "△ Class only — not in my plan")
          ])
        ]),
        el("div", { class: "k-pace-braid-frame" }, [el("div", { class: "k-pace-braid-keycol" }, [parts.keys]), scroll])
      ]));

      /* The list is not a caption. It is the keyboard and screen-reader
         route through the same edges, and the only one that can carry the
         spec-point names the arcs only have room to encode as thickness. */
      var list = el("section", { class: "k-card k-pace-merges", "aria-label": "Every merge, in words" }, [
        el("div", { class: "k-card-head" }, [
          el("h2", { class: "k-card-title", text: "Every merge, in words" }),
          el("span", { class: "k-card-meta", text: linked + " arc" + (linked === 1 ? "" : "s") + " across the term" })
        ])
      ]);
      model.lanes.forEach(function (lane) {
        if (!lane.links.length && !lane.unplanned.length) return;
        var meta = SUBJ.filter(function (s) { return s.id === lane.subject; })[0];
        var box = el("div", { class: "k-pace-merge-lane", "data-subject": lane.subject, role: "group", "aria-label": meta.name + " merges" }, [
          el("h3", { class: "k-pace-col-h" }, [
            el("span", { class: "k-pace-col-dot", "aria-hidden": "true" }),
            el("span", { class: "k-pace-col-name", text: meta.name })
          ])
        ]);
        box.style.setProperty("--pace-hue", HUE[lane.subject]);
        lane.links.slice().sort(function (p, q) { return p.toWb < q.toWb ? -1 : 1; }).forEach(function (link) {
          var tone = toneOf(link.lead);
          var from = KOS.pacing.weekAt(link.fromWb) || {}, to = KOS.pacing.weekAt(link.toWb) || {};
          var when = link.lead > 0
            ? Math.abs(link.lead) + " week" + (Math.abs(link.lead) === 1 ? "" : "s") + " before class"
            : link.lead < 0
              ? Math.abs(link.lead) + " week" + (Math.abs(link.lead) === 1 ? "" : "s") + " after class"
              : "the same week as class";
          box.appendChild(el("button", { type: "button", class: "k-pace-merge", "data-ui": "pace.merge", "data-tone": tone,
            "aria-label": link.refs.length + " spec point" + (link.refs.length === 1 ? "" : "s")
              + ", my plan " + (from.label || link.fromWb) + ", class " + (to.label || link.toWb)
              + ", " + when + ". Opens the class week.",
            onclick: function () { KOS.show("pacing", { wb: link.toWb }); } }, [
            el("span", { class: "k-mono k-pace-merge-ref", text: link.refs.map(function (r) { return r.ref; }).join(", ") }),
            el("span", { class: "k-pace-row-t" }, [
              el("b", { text: link.refs.map(function (r) { return r.title; }).join(" · ") }),
              el("span", { class: "k-pace-row-m", "data-ui": "part.sub", text: "mine " + weekTag(from, "personal")
                + " → class " + weekTag(to, "school") + " · " + when })
            ]),
            el("span", { class: "k-chip k-pace-merge-tone", "data-tone": tone === "ahead" ? "teal" : tone === "same" ? "green" : "amber",
              text: tone === "ahead" ? "I reached it first" : tone === "same" ? "Same week" : "Class reached it first" }),
            el("span", { class: "k-muted", "aria-hidden": "true", text: "Open →" })
          ]));
        });
        if (lane.unplanned.length) {
          var byRef = {};
          lane.unplanned.forEach(function (u) { byRef[u.ref] = u; });
          var open = Object.keys(byRef).map(function (r) { return byRef[r]; });
          box.appendChild(el("p", { class: "k-pace-none", text:
            open.length + " spec point" + (open.length === 1 ? "" : "s")
            + " class teaches that my plan never schedules: "
            + open.map(function (u) { return u.title + " (" + u.ref + ")"; }).join("; ") + "." }));
        }
        list.appendChild(box);
      });
      body.appendChild(list);
    }

    /* A week or tab change is a NAVIGATION (KOS.show above), so this only
       redraws after an in-place edit. It must not touch the URL, history or
       focus, which is exactly why it is not KOS.show. */
    function redraw() {
      selected = KOS.pacing.weekAt(selected.wb) || KOS.pacing.currentWeek();
      weeks = KOS.pacing.weeks();
      if (!selected) { KOS.rerender(); return; }
      buildRibbon();
      buildWeek();
    }

    buildRibbon();
    buildWeek();
  };
})();
