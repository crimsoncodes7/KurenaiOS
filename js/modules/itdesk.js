/* Kurenai OS — modules/itdesk.js
   The IT subject desk's two blocks (frames 18a–18c): the qualification
   aggregate, then the units table.

   Presentation only. The marks live in KOS.itUnits (state.itUnits) and
   every figure — unit grade, the total, the pace so far, marks needed,
   how close a final result was — is derived in hub.js (KOS.hub.it,
   invariants 26d and 26f) from those marks and js/data/it-grades.js. The
   boundaries are the specification's (p. 91): a unit is graded D 48 /
   M 36 / P 24 out of 60 UMS and has no Distinction*; H119 is 270 / 240 /
   180 / 120 out of 300. A mark typed into a row previews what it would do
   (hub.it's `preview`) and is written only on Save; entering a result
   records nothing in the Governor (invariant 26f). */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var SHORT = { "Distinction*": "D*", Distinction: "D", Merit: "M", Pass: "P" };
  var TONE = { "Distinction*": "gold", Distinction: "it", Merit: "teal", Pass: "muted" };

  function T() { return window.KOS_IT_GRADES || { units: {}, qualifications: {}, unitBoundaries: [], grades: [] }; }
  function H() { return KOS.hub.it; }
  function list(codes) {
    return codes.length > 1 ? codes.slice(0, -1).join(", ") + " and " + codes[codes.length - 1] : codes[0] || "";
  }
  function gradeChip(g, hook) {
    return el("span", { class: "k-chip k-it-grade", "data-grade": TONE[g] || "muted", "data-ui": hook || null, text: g || "Below Pass" });
  }
  function gradeCell(g, has) {
    return el("span", { role: "cell", class: "k-it-gcell", "data-ui": "it.row-grade" }, [has ? gradeChip(g) : "—"]);
  }
  function shortDate(iso) {
    if (!iso) return "";
    var p = iso.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  }
  function pctOf(v, max) { return max ? Math.max(0, Math.min(100, 100 * v / max)) : 0; }

  /* a bar out of `max` with a tick at each boundary; `fill` is banked, `run`
     (optional) a dashed stretch on to a target */
  function boundaryBar(fill, max, bounds, opts) {
    opts = opts || {};
    var bar = el("span", { class: "k-it-bar" + (opts.big ? " k-it-bar--big" : ""), "aria-hidden": "true" });
    bar.style.setProperty("--fill", pctOf(fill || 0, max).toFixed(1) + "%");
    if (opts.run != null && opts.run > (fill || 0)) {
      var run = el("span", { class: "k-it-run" });
      run.style.setProperty("--run", pctOf(opts.run, max).toFixed(1) + "%");
      bar.appendChild(run);
    }
    if (fill == null) bar.setAttribute("data-state", "empty");
    bounds.forEach(function (b) {
      var t = el("span", { class: "k-it-tick", "data-grade": TONE[b.grade] || "muted" });
      t.style.setProperty("--at", pctOf(b.ums, max).toFixed(1) + "%");
      bar.appendChild(t);
      if (opts.labels) {
        var l = el("span", { class: "k-it-tick-l k-mono", "data-grade": TONE[b.grade] || "muted" }, [el("b", { text: SHORT[b.grade] || b.grade }), el("span", { text: String(b.ums) })]);
        l.style.setProperty("--at", pctOf(b.ums, max).toFixed(1) + "%");
        bar.appendChild(l);
      }
    });
    return bar;
  }

  function render(main) {
    if (!KOS.itUnits || !H()) return;
    var editing = null;          // {code, mode: "raw"|"ums", value}
    var aggHost = el("section", { class: "k-card k-it-agg", "data-ui": "it.agg", "aria-label": "Qualification" });
    var unitsHost = el("section", { class: "k-card k-it-units", "data-ui": "it.units", "aria-labelledby": "k-it-units-h" });
    main.appendChild(aggHost);
    main.appendChild(unitsHost);
    var showNotTaken = false;

    function preview() {
      if (!editing || editing.value === "" || editing.value == null) return null;
      var o = {}; o[editing.code] = editing.mode === "ums" ? { ums: +editing.value } : { raw: +editing.value };
      return o;
    }

    /* ---------------- the aggregate (frames 18a, 18c) ---------------- */
    function paintAgg() {
      aggHost.innerHTML = "";
      var pv = preview();
      var agg = H().aggregate(null, pv);
      if (!agg) return;
      var target = KOS.itUnits.target();
      var need = H().needed(target, null, pv);
      var close = !pv && agg.complete ? H().close() : null;
      var done = agg.units.length - agg.remaining.length;
      var kicker = (pv ? "Preview" : agg.complete ? "Final" : "So far") + " · " + done + " of " + agg.units.length + " units";
      var grade = agg.complete ? agg.grade : agg.soFar;
      var rows = H().units(pv).filter(function (r) { return agg.units.indexOf(r.code) !== -1 && r.ums != null; });
      var byYear = {};
      rows.forEach(function (r) { var y = r.year ? "Y" + r.year : "—"; byYear[y] = (byYear[y] || 0) + r.ums; });
      var sub = pv ? "with " + editing.code + " at " + editing.value + (editing.mode === "ums" ? " UMS" : "") + " · not saved yet"
        : agg.complete ? Object.keys(byYear).sort().map(function (y) { return y + " " + byYear[y]; }).join(" · ")
        : rows.map(function (r) { return r.code; }).join(" + ");
      var left = el("div", { class: "k-it-agg-l" }, [
        el("span", { class: "k-kicker", text: kicker }),
        el("span", { class: "k-it-total" }, [
          el("b", { class: "k-mono", "data-ui": "it.total", text: (agg.estimated ? "≈" : "") + agg.banked }),
          el("span", { class: "k-mono k-muted", text: "/ " + (agg.complete ? agg.max : agg.bankedMax) })
        ]),
        grade ? gradeChip(grade, "it.agg-grade") : null,
        sub ? el("span", { class: "k-it-sub", text: sub }) : null
      ].filter(Boolean));
      if (agg.estimated) left.title = "A mark entered as raw is converted on the straight line, so the total is an estimate until the UMS is in.";
      var run = need && !need.secured && need.achievable ? need.threshold : null;
      var mid = el("div", { class: "k-it-agg-m" }, [
        boundaryBar(agg.banked, agg.max, agg.boundaries, { big: true, labels: true, run: run }),
        el("span", { class: "k-it-cap", text: "Qualification boundaries · out of " + agg.max + " across the " + agg.units.length + " units" + (agg.provisional ? " (provisional)" : "") })
      ]);
      var right = el("div", { class: "k-it-agg-r" });
      if (close) {
        right.appendChild(el("span", { class: "k-it-r-h", text: "How close" }));
        right.appendChild(el("p", { class: "k-it-need", "data-ui": "it.close" }, [
          close.grade + " by ", el("b", { text: String(close.over) }), " mark" + (close.over === 1 ? "" : "s") + ".",
          close.next ? " " + close.next.grade + " was " : null,
          close.next ? el("b", { class: "k-it-gold", text: String(close.next.gap) }) : null,
          close.next ? " marks away." : null
        ].filter(Boolean)));
        if (close.best && close.lowest) right.appendChild(el("p", { class: "k-it-note", text: "The best unit was " + close.best.code + " (" + close.best.ums + ", " + (SHORT[close.best.grade] || "below P") + ") and the lowest " + close.lowest.code + " (" + close.lowest.ums + ", " + (SHORT[close.lowest.grade] || "below P") + ")." }));
      } else {
        var seg = el("div", { class: "k-seg k-seg--quiet k-seg--grid k-it-target", role: "group", "aria-label": "Target grade", "data-ui": "it.target" });
        seg.style.setProperty("--seg-grid-min", "var(--it-target-min)");
        T().grades.slice().reverse().forEach(function (g) {
          var on = g === target;
          var b = el("button", { type: "button", class: "k-seg-item", "aria-pressed": String(on), "data-value": g, text: g === "Distinction*" ? "D*" : g,
            "aria-label": g, onclick: function () { KOS.itUnits.setTarget(g); paintAgg(); } });
          KOS.ui.state(b, "active", on);
          seg.appendChild(b);
        });
        right.appendChild(el("span", { class: "k-it-r-h", text: "Target grade" }));
        right.appendChild(seg);
        if (need) right.appendChild(needLine(need));
      }
      aggHost.appendChild(left);
      aggHost.appendChild(mid);
      aggHost.appendChild(right);
    }
    function needLine(n) {
      var box = el("div", { class: "k-it-needbox", "data-ui": "it.need" });
      if (n.secured) {
        box.appendChild(el("p", { class: "k-it-need" }, [el("b", { class: "k-it-it", text: n.target }), " is secured: the marks banked already reach " + n.threshold + "."]));
        return box;
      }
      if (!n.achievable) {
        box.appendChild(el("p", { class: "k-it-need" }, ["Even full marks on " + list(n.remaining) + " leave ", el("b", { class: "k-it-it", text: n.target }), " " + (n.need - n.remainingMax) + " short."]));
        return box;
      }
      box.appendChild(el("p", { class: "k-it-need" }, [
        "To reach ", el("b", { class: "k-it-it", text: n.target }), " you need ", el("b", { text: n.need + " more marks" }),
        " across " + list(n.remaining) + ", about ", el("b", { text: String(n.perUnit) }), " of 60 on each."
      ]));
      /* a warning when that share asks for top marks: past the unit
         Distinction line, every remaining unit needs a Distinction */
      var ud = (T().unitBoundaries.filter(function (b) { return b.grade === "Distinction"; })[0] || {}).ums;
      if (ud && n.perUnit > ud) {
        box.appendChild(el("p", { class: "k-it-warn", text: n.perUnit + " / 60 is above the unit Distinction line (" + ud + "), so every unit left needs a high Distinction." }));
      } else if (n.perUnit >= 54) {
        box.appendChild(el("p", { class: "k-it-warn", text: n.perUnit + " / 60 a unit: only just in reach." }));
      }
      var raw = n.perPaper.filter(function (p) { return p.rawMax !== 60; });
      if (raw.length) box.appendChild(el("p", { class: "k-it-note", text: "On the NEA units that is about " + raw[0].raw + " of " + raw[0].rawMax + " criteria." }));
      return box;
    }

    /* ---------------- the units table (frames 18a, 18b) ---------------- */
    function paintUnits() {
      unitsHost.innerHTML = "";
      var all = KOS.itUnits.all();
      var notTaken = all.filter(function (u) { return u.status === "not-taken"; });
      var head = el("div", { class: "k-it-units-head" }, [
        el("h2", { id: "k-it-units-h", class: "k-card-title", text: "IT units" }),
        el("span", { class: "k-sectionhead-sub", text: "graded on the total of the units taken" })
      ]);
      if (notTaken.length) {
        var sw = el("input", { type: "checkbox", role: "switch", class: "k-switch", "data-ui": "it.show-not-taken", "aria-label": "Show units not taken" });
        sw.checked = showNotTaken;
        sw.addEventListener("change", function () { showNotTaken = sw.checked; paintUnits(); });
        head.appendChild(el("label", { class: "k-it-nt" }, [sw, el("span", { text: "Show units not taken (" + notTaken.length + ")" })]));
      }
      unitsHost.appendChild(head);
      unitsHost.appendChild(el("p", { class: "k-it-legend", "data-ui": "it.legend" }, [el("span", { class: "k-muted", text: "Unit boundaries · out of 60 UMS" })].concat(
        T().unitBoundaries.slice().reverse().map(function (b) {
          return el("span", { class: "k-it-key", "data-grade": TONE[b.grade] }, [el("b", { text: b.grade }), " " + b.ums]);
        }))));
      var pv = preview();
      var rows = H().units(pv);
      var table = el("div", { class: "k-it-table", role: "table", "aria-label": "IT units" }, [
        el("div", { class: "k-it-tr k-it-th", role: "row" }, ["Unit", "Year", "Status", "Mark", "Grade", "Against the boundaries"].map(function (h) {
          return el("span", { role: "columnheader", text: h });
        }))
      ]);
      rows.forEach(function (r) { table.appendChild(unitRow(r)); });
      if (showNotTaken) notTaken.forEach(function (u) {
        var node = KOS.spec.node("it", u.code);
        table.appendChild(el("div", { class: "k-it-tr", role: "row", "data-state": "not-taken" }, [
          el("span", { role: "cell", class: "k-it-name" }, [el("b", { class: "k-mono", text: u.code }), " " + (node ? node.title : "")]),
          el("span", { role: "cell", text: u.year ? "Y" + u.year : "—" }),
          el("span", { role: "cell", class: "k-muted", text: "Not taken" }),
          el("span", { role: "cell", text: "—" }), el("span", { role: "cell", text: "—" }), el("span", { role: "cell" })
        ]));
      });
      unitsHost.appendChild(table);
    }
    function statusText(r) {
      if (editing && editing.code === r.code) return "Result · entering now";
      if (r.status === "done") return "Done";
      var when = r.date ? (r.kind === "nea" ? "NEA from " : "exam ") + shortDate(r.date) : "date not set";
      return "Sitting · " + when;
    }
    function unitRow(r) {
      var isEdit = editing && editing.code === r.code;
      var row = el("div", { class: "k-it-tr", role: "row", "data-ui": "it.row", "data-code": r.code });
      if (isEdit) KOS.ui.state(row, "editing", true);
      var markCell;
      if (isEdit) {
        var max = editing.mode === "ums" ? r.umsMax : r.rawMax;
        var inp = el("input", { type: "number", inputmode: "numeric", min: "0", max: String(max), class: "k-input k-it-mark-in k-mono", "data-ui": "it.mark-in",
          "aria-label": r.code + " " + (editing.mode === "ums" ? "UMS" : r.kind === "nea" ? "criteria achieved" : "raw mark") + " out of " + max });
        inp.value = editing.value == null ? "" : String(editing.value);
        inp.addEventListener("input", function () {
          var v = inp.value === "" ? "" : Math.round(Number(inp.value));
          editing.value = v === "" || !isFinite(v) || v < 0 || v > max ? "" : v;
          KOS.ui.state(inp, "bad", inp.value !== "" && editing.value === "");
          paintAgg();
          /* the row's grade and bar follow the number */
          var fresh = H().units(preview()).filter(function (x) { return x.code === r.code; })[0];
          var g = row.querySelector("[data-ui~='it.row-grade']");
          if (g) g.replaceWith(gradeCell(fresh && fresh.grade, !!(fresh && fresh.ums != null)));
          var bar = row.querySelector(".k-it-bar");
          if (bar) bar.replaceWith(boundaryBar(fresh ? fresh.ums : null, 60, T().unitBoundaries));
        });
        inp.addEventListener("keydown", function (e) {
          if (e.key === "Enter") { e.preventDefault(); save(r); }
          else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); cancel(); }
        });
        /* raw (criteria on an NEA) or the UMS off a results slip — one
           quiet switch, the stored UMS wins when there is one */
        var other = editing.mode === "ums" ? (r.kind === "nea" ? "enter criteria" : "enter raw") : "enter UMS";
        var modes = el("button", { type: "button", class: "k-link k-it-mode", "data-ui": "it.mode", "aria-label": other.replace("enter", "Enter the mark as"), text: other,
          onclick: function () { editing.mode = editing.mode === "ums" ? "raw" : "ums"; editing.value = ""; paintAll(); focusInput(); } });
        markCell = el("span", { role: "cell", class: "k-it-mark k-it-mark--edit" }, [inp, el("span", { class: "k-mono k-muted", text: "/ " + max }), modes]);
      } else if (r.ums != null) {
        markCell = el("span", { role: "cell", class: "k-it-mark" }, [
          el("button", { type: "button", class: "k-it-markbtn", "data-ui": "it.edit", "aria-label": "Change the " + r.code + " mark", title: r.estimated ? "Estimated from " + r.raw + " / " + r.rawMax + (r.kind === "nea" ? " criteria" : " raw") : null,
            onclick: function () { begin(r); } }, [el("b", { class: "k-mono", text: (r.estimated ? "≈" : "") + r.ums }), el("span", { class: "k-mono k-muted", text: "/ " + r.umsMax })])
        ]);
      } else {
        markCell = el("span", { role: "cell", class: "k-it-mark" }, [
          el("button", { type: "button", class: "k-link k-it-enter", "data-ui": "it.enter", text: "+ Enter mark", onclick: function () { begin(r); } })
        ]);
      }
      row.appendChild(el("span", { role: "cell", class: "k-it-name" }, [el("b", { class: "k-mono", text: r.code }), " " + r.title]));
      row.appendChild(el("span", { role: "cell", class: "k-it-year", text: r.year ? "Y" + r.year : "—" }));
      row.appendChild(el("span", { role: "cell", class: "k-it-status", "data-state": r.status === "sitting" && !r.date ? "quiet" : null, text: statusText(r) }));
      row.appendChild(markCell);
      row.appendChild(gradeCell(r.grade, r.ums != null));
      var barCell = el("span", { role: "cell", class: "k-it-barcell" }, [boundaryBar(r.ums, r.umsMax, T().unitBoundaries)]);
      if (isEdit) {
        barCell.appendChild(el("button", { type: "button", class: "k-btn k-btn--quiet k-btn--sm", "data-ui": "it.cancel", text: "Esc", "aria-label": "Cancel", onclick: cancel }));
        barCell.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary k-btn--sm", "data-ui": "it.save", text: "✓ Save", onclick: function () { save(r); } }));
      }
      row.appendChild(barCell);
      return row;
    }
    function begin(r) {
      var u = KOS.itUnits.get(r.code);
      editing = { code: r.code, mode: u.ums != null ? "ums" : "raw", value: u.ums != null ? u.ums : u.raw != null ? u.raw : "" };
      paintAll();
      focusInput();
    }
    function focusInput() {
      var i = unitsHost.querySelector("[data-ui~='it.mark-in']");
      if (i) { i.focus(); if (i.select) i.select(); }
    }
    function cancel() { editing = null; paintAll(); }
    function save(r) {
      if (!editing || editing.value === "" || editing.value == null) {
        /* an emptied mark on a unit that had one clears the result */
        if (editing && KOS.itUnits.get(r.code).status === "done") KOS.itUnits.clearResult(r.code);
        editing = null; paintAll(); return;
      }
      var patch = editing.mode === "ums" ? { ums: editing.value, raw: null } : { raw: editing.value, ums: null };
      patch.status = "done";
      KOS.itUnits.setUnit(r.code, patch);
      KOS.ui.toast(r.code + " saved — " + (editing.mode === "ums" ? editing.value + " UMS" : editing.value + " / " + r.rawMax) + ".");
      editing = null;
      paintAll();
    }
    function paintAll() { paintAgg(); paintUnits(); }
    paintAll();
  }

  KOS.itDesk = { render: render };
})();
