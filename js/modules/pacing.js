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
  /* the shared label.cal-field form idiom the calendar and tracker use */
  function field(label, input, hint) {
    return el("label", { class: "cal-field" }, [
      el("span", { text: label }),
      input,
      hint ? el("small", { class: "sub pace-field-hint", text: hint }) : null
    ].filter(Boolean));
  }

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

    var search = el("input", { type: "search", class: "cal-in",
      placeholder: "Search the specification…", "aria-label": "Search specification points" });
    var list = el("div", { class: "pace-pick-list", role: "group",
      "aria-label": "Specification points for this row" });
    var count = el("p", { class: "sub pace-pick-count" });

    function leaves() {
      var sid = subjectOf();
      if (!sid || !KOS.hub || !KOS.hub.LEAVES || !KOS.hub.LEAVES[sid]) return [];
      return KOS.hub.LEAVES[sid];
    }
    function row(leaf, on) {
      var cb = el("input", { type: "checkbox", onchange: function () {
        var i = chosen.indexOf(leaf.ref);
        if (cb.checked && i === -1) chosen.push(leaf.ref);
        if (!cb.checked && i !== -1) chosen.splice(i, 1);
        render();
      } });
      cb.checked = !!on;
      return el("label", { class: "pace-pick-row" + (on ? " is-on" : "") }, [
        cb,
        el("span", { class: "pace-pick-id", text: leaf.ref }),
        el("span", { class: "pace-pick-t", text: leaf.title })
      ]);
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
      node: el("div", { class: "pace-pick" }, [search, list, count]),
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

    var overlay = el("div", { class: "modal-ov", onclick: function (ev) { if (ev.target === overlay) close(); } });
    function close() { overlay.remove(); }

    var sourceSel = el("select", { class: "status-sel", onchange: onShape }, [
      el("option", { value: "personal", text: "My plan" }),
      el("option", { value: "school", text: "In class" })
    ]);
    sourceSel.value = e.source || defaults.source || "personal";

    var subjSel = el("select", { class: "status-sel", onchange: function () { picker.refresh(); } },
      SUBJ.map(function (s) { return el("option", { value: s.id, text: s.name }); }));
    subjSel.value = e.subject || defaults.subject || "compsci";

    var weekSel = el("select", { class: "status-sel" }, KOS.pacing.weeks().map(function (w) {
      return el("option", { value: w.wb, text: w.label });
    }));
    weekSel.value = e.wb || defaults.wb || (KOS.pacing.weeks()[0] || {}).wb || "";

    var title = el("input", { type: "text", class: "cal-in", placeholder: "e.g. Graph traversal: depth-first & breadth-first" });
    title.value = e.title || "";

    var kindSel = el("select", { class: "status-sel" }, KINDS.map(function (k) {
      return el("option", { value: k, text: k });
    }));
    kindSel.value = e.kind || "Lessons";

    var area = el("input", { type: "text", class: "cal-in", placeholder: "e.g. 4.3 Algorithms / Pure / TA2" });
    area.value = e.area || "";
    var paper = el("input", { type: "text", class: "cal-in", placeholder: "e.g. Paper 1" });
    paper.value = e.paper || "";

    var detail = el("textarea", { class: "note-area", rows: 2,
      placeholder: "What the week actually covers…" });
    detail.value = e.detail || "";
    var note = el("textarea", { class: "note-area", rows: 3,
      "aria-label": "Your note for this plan row",
      placeholder: "What you actually want to do with this — a weak spot, a paper to sit, a resource…" });
    note.value = e.note || "";      /* the attribute is ignored; the property is not */

    var picker = refPicker(function () { return subjSel.value; }, e.refs || []);

    var kindField = field("Type", kindSel);
    var areaField = field("Area or strand", area);
    var paperField = field("Paper", paper);
    function onShape() {
      var school = sourceSel.value === "school";
      kindField.hidden = !school;
      areaField.hidden = school;
      paperField.hidden = school;
    }
    onShape();

    /* the read-only half: only worth drawing for a row that already exists
       and already links somewhere */
    var linked = null;
    if (!creating && e.refs && e.refs.length) {
      var cov = KOS.pacing.coverage(e);
      linked = el("div", {}, [
        el("h3", { class: "pace-dlg-h", text: "Linked topic pages" }),
        el("div", { class: "pace-dlg-refs" }, KOS.pacing.leavesOf(e).map(function (l) {
          var p = KOS.store.peekProgress(e.subject, l.ref);
          var status = !p || p.status === "none" ? "Not started"
            : p.status === "done" ? "Completed"
            : p.status === "paused" ? "Paused" : "Started";
          var ticks = p ? (p.check || []).filter(Boolean).length : 0;
          return el("button", { type: "button", class: "pace-dlg-ref",
            onclick: function () { close(); KOS.show("ref", { subject: e.subject, ref: l.ref }); } }, [
            el("span", { class: "pace-dlg-ref-id", text: l.ref }),
            el("span", { class: "pace-dlg-ref-t" }, [
              el("b", { text: l.title }),
              el("span", { class: "sub", text: status + " · " + ticks + " of 4 checks" })
            ]),
            el("span", { class: "pace-dlg-ref-go", "aria-hidden": "true", text: "→" })
          ]);
        })),
        el("p", { class: "sub pace-dlg-cov", text:
          cov.done + " of " + cov.refs + " marked complete · " + cov.checks + " of "
          + cov.maxChecks + " checks ticked, from the study record." })
      ]);
    } else if (!creating) {
      linked = el("div", {}, [
        el("h3", { class: "pace-dlg-h", text: "Linked topic pages" }),
        KOS.ui.emptyState({
          compact: true,
          className: "pace-nolink",
          mark: "空",
          title: "No specification point matches this row",
          body: "It was checked against all three published specifications and none of them "
            + "names this as its own topic, so nothing is linked rather than something near enough. "
            + "Link one below if you disagree."
        })
      ]);
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
        refs: picker.value()
      };
      var saved = creating ? KOS.pacing.addEntry(data) : KOS.pacing.updateEntry(e.id, data);
      if (!saved) { KOS.ui.toast("That could not be saved — check the week and subject.", true); return; }
      KOS.ui.toast(creating ? "Row added to the plan." : "Row updated.");
      close();
      onSaved && onSaved(saved);
    }

    overlay.appendChild(el("div", { class: "modal pace-dlg" }, [
      el("div", { class: "modal-h" }, [
        el("b", { text: creating ? "Add a plan row" : e.title }),
        el("button", { class: "btn", text: "✕ Close", style: "margin-left:auto", onclick: close })
      ]),
      creating ? null : el("div", { class: "pace-dlg-meta" }, [
        el("span", { class: "pace-chip pace-chip-subj", "data-subject": e.subject, text: NAME[e.subject] || e.subject }),
        el("span", { class: "pace-chip", text: (KOS.pacing.weekAt(e.wb) || {}).label || e.wb }),
        el("span", { class: "pace-chip", text: e.source === "school" ? "In class" : "My plan" })
      ]),
      el("div", { class: "cal-form pace-dlg-form" }, [
        field("Register", sourceSel),
        field("Subject", subjSel),
        field("Week", weekSel),
        kindField, areaField, paperField
      ]),
      field("Title", title),
      field("Detail", detail),
      linked,
      el("h3", { class: "pace-dlg-h", text: creating ? "Specification points" : "Change the links" }),
      picker.node,
      el("h3", { class: "pace-dlg-h", text: "Your note" }),
      note,
      el("div", { class: "lab-controls pace-dlg-actions" }, [
        el("button", { class: "btn primary", text: creating ? "Add row" : "Save changes", onclick: save })
      ]),
      /* Delete is deliberately not in the same control group as Save */
      creating ? null : el("div", { class: "pace-dlg-danger" }, [
        el("button", { class: "btn danger", text: "Delete this row", onclick: function () {
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
        } })
      ])
    ].filter(Boolean)));
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
    var overlay = el("div", { class: "modal-ov", onclick: function (ev) { if (ev.target === overlay) close(); } });
    function close() { overlay.remove(); }

    var wb = el("input", { type: "date", class: "cal-in", "aria-label": "Week beginning" });
    wb.value = w.wb || "";
    var label = el("input", { type: "text", class: "cal-in", placeholder: "e.g. w/c 7 Sept" });
    label.value = w.label || "";
    var schoolWk = el("input", { type: "number", min: 1, class: "cal-in fx-num", placeholder: "—" });
    if (w.schoolWk != null) schoolWk.value = String(w.schoolWk);
    var personalWk = el("input", { type: "number", min: 1, class: "cal-in fx-num", placeholder: "—" });
    if (w.personalWk != null) personalWk.value = String(w.personalWk);
    var note = el("textarea", { class: "note-area", rows: 3, "aria-label": "Note for this week",
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

    overlay.appendChild(el("div", { class: "modal pace-dlg" }, [
      el("div", { class: "modal-h" }, [
        el("b", { text: creating ? "Add a week" : "Edit " + (w.label || w.wb) }),
        el("button", { class: "btn", text: "✕ Close", style: "margin-left:auto", onclick: close })
      ]),
      el("div", { class: "cal-form pace-dlg-form" }, [
        field("Week beginning", wb, creating ? null : "Moving this date moves its " + rows + " row" + (rows === 1 ? "" : "s") + " with it."),
        field("Label", label),
        field("School week", schoolWk),
        field("My week", personalWk)
      ]),
      field("Note", note),
      el("div", { class: "lab-controls pace-dlg-actions" }, [
        el("button", { class: "btn primary", text: creating ? "Add week" : "Save changes", onclick: save })
      ]),
      creating ? null : el("div", { class: "pace-dlg-danger" }, [
        el("button", { class: "btn danger", text: "Delete this week", onclick: function () {
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
        } })
      ])
    ].filter(Boolean)));
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
  var LINK_TONE = {
    ahead: "var(--good)",        /* my plan reached it first  */
    same: "var(--accent)",       /* the same week             */
    behind: "var(--warning)"     /* class reached it first    */
  };
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

  function braidSvg(model, todayWb, onPickWeek) {
    var S = KOS.charts.svgNode;
    var ws = model.weeks;
    var W = PAD_L + ws.length * COL + 26;
    function svgTag(w, h, cls) {
      var n = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      n.setAttribute("viewBox", "0 0 " + w + " " + h);
      n.setAttribute("width", String(w));
      n.setAttribute("height", String(h));
      n.setAttribute("class", cls);
      return n;
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

    var svg = svgTag(W, H, "pace-braid-svg");
    svg.setAttribute("role", "img");

    /* The lane names live in their OWN, non-scrolling svg. Inside the
       scrolling body they slid out of view the moment you looked at
       November, and a branch graph whose lanes are unlabelled is three
       anonymous tangles. Both svgs are laid out from the same `laid`
       table, so the rows cannot drift apart. */
    var keys = svgTag(PAD_K, H, "pace-braid-keys");
    keys.setAttribute("aria-hidden", "true");

    /* Column click-targets go in FIRST, behind everything. On top they were
       a transparent sheet over the whole diagram that swallowed every
       branch's <title>, so the tooltips that name the spec points never
       appeared. Behind, a click on empty canvas still reaches them and a
       click on a mark still belongs to the mark. This is a convenience
       either way — the merges list below is the real keyboard and
       screen-reader route through the same edges. */
    if (onPickWeek) {
      ws.forEach(function (w) {
        var hit = S("rect", { x: PAD_L + idx[w.wb] * COL, y: 0, width: COL, height: H, rx: 6 });
        hit.style.fill = "transparent";
        hit.setAttribute("class", "pace-braid-hit");
        hit.addEventListener("click", function () { onPickWeek(w); });
        hit.appendChild(S("title", { text: "Open " + w.label }));
        svg.appendChild(hit);
      });
    }

    /* --- the week axis, labelled: a diagram without one is decoration --- */
    ws.forEach(function (w) {
      var isNow = todayWb === w.wb;
      var t = S("text", { x: x(w.wb), y: 17, "text-anchor": "middle", "font-size": "11",
        "font-weight": isNow ? "700" : "500", text: weekTag(w, "school") });
      t.style.fill = isNow ? "var(--accent)" : "var(--text2)";
      svg.appendChild(t);
      var d = S("text", { x: x(w.wb), y: 31, "text-anchor": "middle", "font-size": "11",
        text: shortDate(w.wb) });
      d.style.fill = "var(--muted)";
      svg.appendChild(d);
      if (isNow) {
        var rule = S("line", { x1: x(w.wb), y1: 36, x2: x(w.wb), y2: H - PAD_B });
        rule.style.stroke = "var(--accent)";
        rule.style.strokeWidth = "1";
        rule.style.strokeDasharray = "3 4";
        rule.style.opacity = ".5";
        svg.appendChild(rule);
      }
    });

    laid.forEach(function (L, li) {
      var lane = L.lane;
      var hue = HUE[lane.subject];
      var meta = SUBJ.filter(function (s) { return s.id === lane.subject; })[0];

      [[svg, W, 10], [keys, PAD_K, 0]].forEach(function (pair) {
        var band = S("rect", { x: 0, y: L.y0 - 4, width: pair[1], height: L.height - 10, rx: pair[2] });
        band.style.fill = "var(--well)";
        band.style.opacity = li % 2 ? ".5" : ".26";
        pair[0].appendChild(band);
      });

      var name = S("text", { x: 12, y: L.ySpine - 14, "font-size": "11", "font-weight": "700", text: meta.name });
      name.style.fill = "var(--text)";
      keys.appendChild(name);
      var rule = S("rect", { x: 0, y: L.ySpine - 24, width: 3, height: 16, rx: 1.5 });
      rule.style.fill = hue;
      keys.appendChild(rule);

      /* the spine: the room's clock, one unbroken line */
      var spine = S("line", { x1: 0, y1: L.ySpine, x2: W - 14, y2: L.ySpine });
      spine.style.stroke = hue;
      spine.style.strokeWidth = "2";
      spine.style.opacity = ".55";
      svg.appendChild(spine);
      var spineLab = S("text", { x: 12, y: L.ySpine + 4, "font-size": "11", text: "In class" });
      spineLab.style.fill = "var(--muted)";
      keys.appendChild(spineLab);
      var spineStub = S("line", { x1: PAD_K - 22, y1: L.ySpine, x2: PAD_K, y2: L.ySpine });
      spineStub.style.stroke = hue;
      spineStub.style.strokeWidth = "2";
      spineStub.style.opacity = ".55";
      keys.appendChild(spineStub);

      /* my own row: ticks, not a second spine — my plan is discrete work,
         not a timetable that runs whether I show up or not */
      var mineLab = S("text", { x: 12, y: L.yMine + 4, "font-size": "11", text: "My plan" });
      mineLab.style.fill = "var(--muted)";
      keys.appendChild(mineLab);
      var mineStub = S("line", { x1: PAD_K - 22, y1: L.yMine, x2: PAD_K, y2: L.yMine });
      mineStub.style.stroke = "var(--line)";
      mineStub.style.strokeWidth = "1";
      mineStub.style.strokeDasharray = "2 5";
      keys.appendChild(mineStub);
      var mineRule = S("line", { x1: 0, y1: L.yMine, x2: W - 14, y2: L.yMine });
      mineRule.style.stroke = "var(--line)";
      mineRule.style.strokeWidth = "1";
      mineRule.style.strokeDasharray = "2 5";
      svg.appendChild(mineRule);

      /* --- branches, drawn under the nodes --- */
      L.branches.forEach(function (b) {
        var link = b.link;
        var yb = L.yMine + DEPTH_0 + b.depth * DEPTH_H;
        var node;
        if (link.lead === 0) {
          /* a stub: the same column, so there is nothing to route around */
          node = S("path", { d: "M" + b.xm + "," + L.yMine + " L" + b.xm + "," + L.ySpine });
        } else {
          var fromY = link.lead > 0 ? L.yMine : L.ySpine;
          var toY = link.lead > 0 ? L.ySpine : L.yMine;
          var xL = Math.min(b.xm, b.xc), xR = Math.max(b.xm, b.xc);
          var yL = (xL === b.xm) === (link.lead > 0) ? fromY : toY;
          var yR = yL === fromY ? toY : fromY;
          var r = Math.min(CORNER, Math.max(2, (xR - xL) / 2 - 1));
          node = S("path", { d:
            "M" + xL + "," + yL +
            " L" + xL + "," + (yb - r) +
            " Q" + xL + "," + yb + " " + (xL + r) + "," + yb +
            " L" + (xR - r) + "," + yb +
            " Q" + xR + "," + yb + " " + xR + "," + (yb - r) +
            " L" + xR + "," + yR });
        }
        node.style.fill = "none";
        node.style.stroke = LINK_TONE[b.tone];
        node.style.strokeWidth = String(Math.min(3, 1.3 + link.refs.length * 0.45));
        node.style.strokeLinecap = "round";
        node.style.opacity = ".85";
        node.setAttribute("class", "pace-braid-link tone-" + b.tone);
        node.appendChild(S("title", { text:
          link.refs.length + " spec point" + (link.refs.length === 1 ? "" : "s") + " · my plan "
          + (link.lead > 0 ? Math.abs(link.lead) + " week" + (Math.abs(link.lead) === 1 ? "" : "s") + " before class"
            : link.lead < 0 ? Math.abs(link.lead) + " week" + (Math.abs(link.lead) === 1 ? "" : "s") + " after class"
            : "the same week as class")
          + " — " + link.refs.map(function (r) { return r.ref; }).join(", ") }));
        svg.appendChild(node);

        /* where the branch RESOLVES: a merge into the spine, or my row
           finally picking up what class already taught */
        var tipX = link.lead > 0 ? b.xc : b.xm;
        var tipY = link.lead > 0 ? L.ySpine : L.yMine;
        if (link.lead !== 0) {
          var tip = S("path", { d: link.lead > 0
            ? "M" + (tipX - 4) + "," + (tipY + 7) + " L" + tipX + "," + (tipY + 1) + " L" + (tipX + 4) + "," + (tipY + 7) + " Z"
            : "M" + (tipX - 4) + "," + (tipY - 7) + " L" + tipX + "," + (tipY - 1) + " L" + (tipX + 4) + "," + (tipY - 7) + " Z" });
          tip.style.fill = LINK_TONE[b.tone];
          tip.style.opacity = ".85";
          svg.appendChild(tip);
        }
      });

      /* --- unplanned class points: an open tick, never a silent gap --- */
      var byWb = {};
      lane.unplanned.forEach(function (u) { (byWb[u.wb] = byWb[u.wb] || []).push(u); });
      Object.keys(byWb).forEach(function (wb) {
        var m = S("text", { x: x(wb), y: L.ySpine - 12, "text-anchor": "middle", "font-size": "11",
          "font-weight": "600", text: "△" + byWb[wb].length });
        m.style.fill = "var(--danger)";
        m.appendChild(S("title", { text: byWb[wb].length + " spec point"
          + (byWb[wb].length === 1 ? "" : "s") + " class teaches that your plan does not schedule" }));
        svg.appendChild(m);
      });

      /* --- the nodes: solid on the spine, ringed on my row --- */
      Object.keys(lane.classAt).forEach(function (wb) {
        var n = lane.classAt[wb];
        var c = S("circle", { cx: x(wb), cy: L.ySpine, r: String(Math.min(8, 4.5 + n * 1.1)) });
        c.style.fill = hue;
        c.style.stroke = "var(--bg1)";
        c.style.strokeWidth = "2";
        c.setAttribute("class", "pace-braid-node");
        c.appendChild(S("title", { text: meta.name + " · In class · "
          + (KOS.pacing.weekAt(wb) || {}).label + " · " + n + " row" + (n === 1 ? "" : "s") }));
        svg.appendChild(c);
      });
      Object.keys(lane.mineAt).forEach(function (wb) {
        var n = lane.mineAt[wb];
        var c = S("circle", { cx: x(wb), cy: L.yMine, r: String(Math.min(7.5, 4 + n * 0.7)) });
        c.style.fill = "var(--bg1)";
        c.style.stroke = hue;
        c.style.strokeWidth = "2";
        c.setAttribute("class", "pace-braid-node");
        c.appendChild(S("title", { text: meta.name + " · My plan · "
          + (KOS.pacing.weekAt(wb) || {}).label + " · " + n + " row" + (n === 1 ? "" : "s") }));
        svg.appendChild(c);
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
  KOS.views.pacing = function (main, arg) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

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
    ], tab, "Pacing views", "pace-tabs profile-workspace-tabs");

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
        action: el("button", { class: "btn primary", text: "+ Add a week",
          onclick: function () { weekDialog(null, function () { KOS.rerender(); }); } })
      }));
      return;
    }

    var body = el("div", { class: "pace-body" });
    if (tab === "braid") { main.appendChild(body); renderBraid(); return; }

    var ribbonHolder = el("div", {});
    main.appendChild(ribbonHolder);
    main.appendChild(body);

    /* ---------------- the term ribbon ---------------- */
    function buildRibbon() {
      ribbonHolder.innerHTML = "";
      var peak = Math.max(1, KOS.pacing.maxLoad());
      var track = el("div", { class: "pace-ribbon" });
      weeks.forEach(function (w) {
        var l = KOS.pacing.load(w.wb);
        var brk = KOS.pacing.isBreak(w);
        var mock = KOS.pacing.isMock(w);
        var now = todayWeek && todayWeek.wb === w.wb;
        var bars = el("span", { class: "pace-wk-bars", "aria-hidden": "true" },
          SUBJ.map(function (s) {
            var h = Math.round(100 * (l[s.id] || 0) / peak);
            return el("span", { class: "pace-wk-bar" + (l[s.id] ? "" : " is-zero"),
              style: "height:" + Math.max(l[s.id] ? 12 : 3, h) + "%;background:" + HUE[s.id] });
          }));
        var label = "Week beginning " + longDate(w.wb)
          + (w.schoolWk ? " — school week " + w.schoolWk : "")
          + (w.personalWk ? ", my week " + w.personalWk : "")
          + " — " + l.total + " topic" + (l.total === 1 ? "" : "s") + " planned"
          + (brk ? ", half term" : "") + (mock ? ", mock week" : "")
          + (now ? ", the week we are in" : "");
        var btn = el("button", { type: "button",
          class: "pace-wk" + (selected && selected.wb === w.wb ? " active" : "")
            + (brk ? " is-break" : "") + (mock ? " is-mock" : "") + (now ? " is-now" : ""),
          "aria-label": label,
          onclick: function () { KOS.show("pacing", { wb: w.wb }); } }, [
          el("span", { class: "pace-wk-n", "aria-hidden": "true", text: brk ? "—" : weekTag(w) }),
          bars,
          el("span", { class: "pace-wk-d", "aria-hidden": "true", text: shortDate(w.wb) })
        ]);
        if (selected && selected.wb === w.wb) btn.setAttribute("aria-current", "true");
        track.appendChild(btn);
      });
      var add = el("button", { type: "button", class: "pace-wk pace-wk-add",
        "aria-label": "Add a week to the plan",
        onclick: function () { weekDialog(null, function (w) { KOS.show("pacing", { wb: w.wb }); }); } }, [
        el("span", { class: "pace-wk-n", "aria-hidden": "true", text: "+" }),
        el("span", { class: "pace-wk-d", "aria-hidden": "true", text: "Week" })
      ]);
      track.appendChild(add);
      ribbonHolder.appendChild(KOS.ui.scroller(track, {
        className: "pace-ribbon-wrap",
        label: "The term, week by week",
        prevLabel: "Earlier weeks", nextLabel: "Later weeks"
      }));
    }

    /* ---------------- one subject column ---------------- */
    function subjectColumn(sid) {
      var meta = SUBJ.filter(function (s) { return s.id === sid; })[0];
      var classRows = KOS.pacing.entriesFor(selected.wb, sid, "school");
      var myRows = KOS.pacing.entriesFor(selected.wb, sid, "personal");
      var a = KOS.pacing.alignment(selected.wb, sid);
      var line = KOS.pacing.alignmentLine(a);

      var col = el("section", { class: "pace-col", "data-subject": sid,
        style: "--pace-hue:" + HUE[sid], "aria-label": meta.name });

      col.appendChild(el("h3", { class: "pace-col-h" }, [
        el("span", { class: "pace-col-rule", "aria-hidden": "true" }),
        el("span", { class: "pace-col-name", text: meta.name })
      ]));

      function addBtn(source) {
        return el("button", { type: "button", class: "pace-add",
          "aria-label": "Add a " + (source === "school" ? "class" : "plan") + " row for "
            + meta.name + ", " + selected.label,
          onclick: function () {
            entryDialog(null, { wb: selected.wb, subject: sid, source: source },
              function () { redraw(); });
          } }, [el("span", { "aria-hidden": "true", text: "+ Add" })]);
      }

      /* register 1 — the room */
      var classBox = el("div", { class: "pace-reg pace-reg-class" }, [
        el("div", { class: "pace-reg-head" }, [
          el("p", { class: "pace-reg-k", text: "In class" }), addBtn("school")
        ])
      ]);
      if (!classRows.length) {
        classBox.appendChild(el("p", { class: "sub pace-reg-none", text: "Nothing scheduled." }));
      } else {
        classRows.forEach(function (e) {
          classBox.appendChild(el("button", { type: "button",
            class: "pace-class" + (e.kind === "Mock" ? " is-mock" : "")
              + (e.kind === "Assessment" ? " is-assess" : ""),
            onclick: function () { entryDialog(e, null, redraw); } }, [
            el("span", { class: "pace-class-mark", "aria-hidden": "true",
              text: KIND_MARK[e.kind] || "授" }),
            el("span", { class: "pace-class-t" }, [
              el("b", { text: e.title }),
              el("span", { class: "sub", text: e.kind })
            ])
          ]));
        });
      }
      col.appendChild(classBox);

      /* the join between the two registers: the only thing here that is
         neither plan — it is the comparison, and it is stated only when
         the linked spec refs actually support it */
      if (line) {
        col.appendChild(el("div", { class: "pace-align" }, [
          el("p", { class: "pace-align-line", text: line }),
          el("div", { class: "pace-align-tags" }, [
            a.ahead ? el("span", { class: "pace-tag tone-ahead", text: a.ahead + " covered" }) : null,
            a.aligned ? el("span", { class: "pace-tag tone-aligned", text: a.aligned + " this week" }) : null,
            a.behind ? el("span", { class: "pace-tag tone-behind", text: a.behind + " later" }) : null,
            a.unplanned ? el("span", { class: "pace-tag tone-unplanned", text: a.unplanned + " unplanned" }) : null
          ].filter(Boolean))
        ]));
      } else {
        col.appendChild(el("p", { class: "sub pace-align-quiet", text:
          classRows.length
            ? "Class is on work with no single spec point this week — nothing to compare."
            : "No class content to compare against." }));
      }

      /* register 2 — my own curriculum */
      var mineBox = el("div", { class: "pace-reg pace-reg-mine" }, [
        el("div", { class: "pace-reg-head" }, [
          el("p", { class: "pace-reg-k", text: "My plan" }), addBtn("personal")
        ])
      ]);
      if (!myRows.length) {
        mineBox.appendChild(el("p", { class: "sub pace-reg-none", text:
          KOS.pacing.isBreak(selected) ? "Half term — nothing scheduled." : "Nothing scheduled." }));
      } else {
        myRows.forEach(function (e) {
          var cov = KOS.pacing.coverage(e);
          var tone = topicTone(cov);
          mineBox.appendChild(el("button", { type: "button", class: "pace-topic tone-" + tone,
            "aria-label": e.title + " — " + TONE_WORD[tone],
            onclick: function () { entryDialog(e, null, redraw); } }, [
            el("span", { class: "pace-topic-dot", "aria-hidden": "true", text: TONE_GLYPH[tone] }),
            el("span", { class: "pace-topic-t" }, [
              el("b", { text: e.title }),
              el("span", { class: "sub", text: [e.area, e.paper].filter(Boolean).join(" · ") })
            ]),
            el("span", { class: "pace-topic-n", "aria-hidden": "true",
              text: cov.refs ? cov.done + "/" + cov.refs : "—" }),
            e.note ? el("span", { class: "pace-topic-note", "aria-hidden": "true", text: "✎" }) : null
          ].filter(Boolean)));
        });
      }
      col.appendChild(mineBox);
      return col;
    }

    /* ---------------- the week ---------------- */
    function buildWeek() {
      body.innerHTML = "";
      if (!selected) return;

      /* The week in numbers, as a sub-line rather than a row of card-sized
         boxes carrying one figure each. Zero-only SUPPORTING facts are
         dropped (invariant 77); the primary count stays even at zero,
         because "nothing planned" is the answer to the question. */
      var load = KOS.pacing.load(selected.wb);
      var classPoints = 0, reached = 0;
      SUBJ.forEach(function (s) {
        var a = KOS.pacing.alignment(selected.wb, s.id);
        classPoints += a.classRefs.length;
        reached += a.ahead + a.aligned;
      });

      body.appendChild(KOS.ui.sectionHeader({
        className: "pace-week-header",
        title: selected.label,
        sub: [
          selected.schoolWk ? "School week " + selected.schoolWk : null,
          selected.personalWk ? "My week " + selected.personalWk : null,
          KOS.pacing.isBreak(selected) ? "Half term" : null,
          load.total + " topic" + (load.total === 1 ? "" : "s") + " planned",
          classPoints ? classPoints + " spec point" + (classPoints === 1 ? "" : "s") + " in class" : null,
          reached ? reached + " my plan has reached" : null
        ].filter(Boolean).join(" · "),
        actions: [
          el("button", { class: "btn", text: "+ Add row",
            onclick: function () {
              entryDialog(null, { wb: selected.wb, subject: "compsci", source: "personal" }, redraw);
            } }),
          todayWeek && todayWeek.wb !== selected.wb
            ? el("button", { class: "btn", text: "This week",
              onclick: function () { KOS.show("pacing", { wb: todayWeek.wb }); } })
            : null,
          el("button", { class: "btn", text: "Edit week",
            onclick: function () {
              weekDialog(selected, function (w) {
                if (!w) { KOS.show("pacing", { wb: (KOS.pacing.currentWeek() || {}).wb }); return; }
                if (w.wb !== selected.wb) { KOS.show("pacing", { wb: w.wb }); return; }
                redraw();
              });
            } })
        ].filter(Boolean)
      }));

      if (selected.note) {
        body.appendChild(el("p", { class: "pace-week-note", text: selected.note }));
      }

      body.appendChild(el("div", { class: "pace-grid" },
        SUBJ.map(function (s) { return subjectColumn(s.id); })));
    }

    /* ---------------- the braid ---------------- */
    function renderBraid() {
      body.innerHTML = "";
      var model = KOS.pacing.braid();
      var linked = model.lanes.reduce(function (a, l) { return a + l.links.length; }, 0);

      /* No explanatory header: the legend below names every mark, and the
         long version lives in Help & Guide. A page should not re-teach
         itself every time it is opened. */
      if (!linked) {
        body.appendChild(KOS.ui.emptyState({
          mark: "枝",
          title: "Nothing to braid yet",
          body: "An arc is drawn only where a class row and one of my rows link to the SAME "
            + "specification point. Link some rows to spec points and the branches appear.",
          action: el("button", { class: "btn primary", text: "Open this week",
            onclick: function () { KOS.show("pacing", { wb: (todayWeek || weeks[0]).wb }); } })
        }));
        return;
      }

      body.appendChild(el("div", { class: "pace-legend" }, [
        el("span", { class: "pace-legend-k tone-ahead", text: "I reached it first" }),
        el("span", { class: "pace-legend-k tone-aligned", text: "Same week" }),
        el("span", { class: "pace-legend-k tone-behind", text: "Class reached it first" }),
        el("span", { class: "pace-legend-k tone-unplanned", text: "△ Class only — not in my plan" })
      ]));

      var parts = braidSvg(model, todayWeek && todayWeek.wb, function (w) {
        KOS.show("pacing", { wb: w.wb });
      });
      var frame = el("div", { class: "pace-braid" }, [parts.body]);
      body.appendChild(el("div", { class: "pace-braid-frame" }, [
        el("div", { class: "pace-braid-keycol" }, [parts.keys]),
        KOS.ui.scroller(frame, {
          className: "pace-braid-wrap",
          label: "Branch diagram of the term",
          prevLabel: "Earlier weeks", nextLabel: "Later weeks"
        })
      ]));

      /* The list is not a caption. It is the keyboard and screen-reader
         route through the same edges, and the only one that can carry the
         spec-point names the arcs only have room to encode as thickness. */
      body.appendChild(KOS.ui.sectionHeader({
        className: "pace-merge-header",
        title: "Every merge, in words",
        sub: linked + " arc" + (linked === 1 ? "" : "s") + " across the term."
      }));

      model.lanes.forEach(function (lane) {
        if (!lane.links.length && !lane.unplanned.length) return;
        var meta = SUBJ.filter(function (s) { return s.id === lane.subject; })[0];
        var box = el("section", { class: "pace-merge-lane", "data-subject": lane.subject,
          style: "--pace-hue:" + HUE[lane.subject], "aria-label": meta.name + " merges" }, [
          el("h3", { class: "pace-col-h" }, [
            el("span", { class: "pace-col-rule", "aria-hidden": "true" }),
            el("span", { class: "pace-col-name", text: meta.name })
          ])
        ]);
        lane.links.slice().sort(function (p, q) { return p.toWb < q.toWb ? -1 : 1; }).forEach(function (link) {
          var tone = toneOf(link.lead);
          var from = KOS.pacing.weekAt(link.fromWb) || {}, to = KOS.pacing.weekAt(link.toWb) || {};
          var when = link.lead > 0
            ? Math.abs(link.lead) + " week" + (Math.abs(link.lead) === 1 ? "" : "s") + " before class"
            : link.lead < 0
              ? Math.abs(link.lead) + " week" + (Math.abs(link.lead) === 1 ? "" : "s") + " after class"
              : "the same week as class";
          box.appendChild(el("button", { type: "button", class: "pace-merge tone-" + tone,
            "aria-label": link.refs.length + " spec point" + (link.refs.length === 1 ? "" : "s")
              + ", my plan " + (from.label || link.fromWb) + ", class " + (to.label || link.toWb)
              + ", " + when + ". Opens the class week.",
            onclick: function () { KOS.show("pacing", { wb: link.toWb }); } }, [
            el("span", { class: "pace-merge-arc", "aria-hidden": "true",
              text: link.lead > 0 ? "↗" : link.lead < 0 ? "↘" : "→" }),
            el("span", { class: "pace-merge-t" }, [
              el("b", { text: link.refs.map(function (r) { return r.title; }).join(" · ") }),
              el("span", { class: "sub", text: "mine " + weekTag(from, "personal")
                + " → class " + weekTag(to, "school")
                + " · " + when + " · " + link.refs.map(function (r) { return r.ref; }).join(", ") })
            ])
          ]));
        });
        if (lane.unplanned.length) {
          var byRef = {};
          lane.unplanned.forEach(function (u) { byRef[u.ref] = u; });
          var list = Object.keys(byRef).map(function (r) { return byRef[r]; });
          box.appendChild(el("p", { class: "sub pace-merge-open", text:
            list.length + " spec point" + (list.length === 1 ? "" : "s")
            + " class teaches that my plan never schedules: "
            + list.map(function (u) { return u.title + " (" + u.ref + ")"; }).join("; ") + "." }));
        }
        body.appendChild(box);
      });
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
