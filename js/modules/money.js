/* Kurenai OS — modules/money.js
   Money (roadmap 5.4, design turn 27: frames 27a–27h, 27l, 27q): the
   page under Productivity. Six views behind one header — Overview,
   Transactions, Budgets, Recurring, Pots, Month and year — then Hide
   amounts and ＋ Add entry.

   The model is core/money.js (KOS.money): this file only draws, and every
   write goes through it. Amounts are drawn with KOS.ui.amount (Hide amounts
   keeps each figure's width), spend against a budget with KOS.ui.catBar.
   ZERO Governor traffic (invariant 5a): nothing here logs or pays.

   A render writes nothing (smoke56): the views READ the store and draw;
   choices made on the page (the view, the month on screen, filters, the
   entry selected) are per visit, kept in this module, never stored —
   except Hide amounts, per device in state.ui.moneyHidden (27b). */
(function () {
  "use strict";
  var el = KOS.ui.el, U = KOS.ui, M = KOS.money, store = KOS.store;
  var amt = function (minor, o) { return U.amount(minor, o); };
  var VIEWS = [["overview", "Overview"], ["transactions", "Transactions"], ["budgets", "Budgets"],
    ["recurring", "Recurring"], ["pots", "Pots"], ["month", "Month and year"]];
  /* per visit: what the page is showing (never stored) */
  var visit = {
    budKey: null, monthMode: "month", monthKey: null, yearFirst: null,
    tx: { search: "", cat: "", range: "month", tag: "", kind: "" }, selected: null, ticked: {},
    recFilter: "all", ruleEdit: null, left: {}, chartDay: null
  };

  /* ---------------- small helpers ---------------- */
  var DAY3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parse(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2] || 1); }
  function today() { return iso(new Date()); }
  function addDays(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
  function between(a, b) { return Math.round((parse(b) - parse(a)) / 86400000); }
  function dayLabel(s) { var d = parse(s); return DAY3[d.getDay()] + " " + d.getDate() + " " + MON3[d.getMonth()]; }
  function shortDate(s) { var d = parse(s); return d.getDate() + " " + MON3[d.getMonth()]; }
  function longDate(s) { var d = parse(s); return DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()]; }
  function monthName(key) { return MONTHS[+key.slice(5, 7) - 1]; }
  function monthLabel(key) { return monthName(key) + " " + key.slice(0, 4); }
  function money(minor, o) { return M.format(minor, o); }
  /* a figure inside a sentence: dropped, not masked, while amounts are hidden */
  function said(minor, o) { return M.isHidden() ? "" : money(minor, o); }
  function cat(id) { return M.category(id) || { id: id, name: id || "Other", tone: "muted" }; }
  function announce(t) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(t); }
  function redraw() { KOS.rerender(); }
  function go(view) { KOS.show("money", view); }
  function btn(text, cls, onclick, hook, extra) {
    return el("button", Object.assign({ type: "button", class: "k-btn" + (cls ? " " + cls : ""), "data-ui": hook || null,
      text: text, onclick: onclick }, extra || {}));
  }
  function chip(text, tone, hook) { return el("span", { class: "k-chip", "data-tone": tone || null, "data-ui": hook || null, text: text }); }
  function kicker(text) { return el("div", { class: "k-kicker", text: text }); }
  function card(kids, cls, hook) { return el("section", { class: "k-card" + (cls ? " " + cls : ""), "data-ui": hook || null }, kids.filter(Boolean)); }
  function head(title, meta, link) {
    return el("div", { class: "k-card-head" }, [
      el("h2", { class: "k-card-title", text: title }),
      meta ? el("span", { class: "k-card-meta", text: meta }) : null,
      link ? el("button", { type: "button", class: "k-link", "data-ui": "money.card-link", text: link[0], onclick: link[1] }) : null
    ].filter(Boolean));
  }
  function tile(mark, tone) { return el("span", { class: "k-tile k-mn-tile", "data-cat-tone": tone || null, "aria-hidden": "true", text: mark }); }
  function dot(tone) { return el("span", { class: "k-mn-dot", "data-cat-tone": tone || "muted", "aria-hidden": "true" }); }
  function field(label, control, hint) {
    return el("label", { class: "k-field", "data-ui": "ui.field" }, [
      el("span", { class: "k-field-label", "data-ui": "ui.field-label", text: label }), control,
      hint ? el("span", { class: "k-field-hint", text: hint }) : null].filter(Boolean));
  }
  function input(type, value, attrs) {
    var n = el("input", Object.assign({ type: type, class: "k-input" }, attrs || {}));
    if (value != null) n.value = value;
    return n;
  }
  function select(options, value, attrs) {
    var s = el("select", Object.assign({ class: "k-input" }, attrs || {}), options.map(function (o) {
      var opt = el("option", { value: o[0], text: o[1] });
      if (String(o[0]) === String(value)) opt.selected = true;
      return opt;
    }));
    return s;
  }
  /* a pressed-pill switch over a choice (the quiet seg) */
  function seg(items, current, onPick, label, cls, edge) {
    return U.tabs(items.map(function (it) {
      return { label: it[1], count: it[2], active: it[0] === current, onSelect: function () { onPick(it[0]); } };
    }), { variant: "workspace", label: label, className: "k-seg--quiet" + (cls ? " " + cls : ""), edge: !!edge });
  }
  function catOptions(kind, opts) {
    opts = opts || {};
    return M.categories({ kind: kind }).map(function (c) { return [c.id, c.name]; })
      .concat(opts.withNone ? [] : []);
  }
  function dialogBox(title, mark, body, foot, opts) {
    opts = opts || {};
    var overlay = el("div", { class: "k-dialog-overlay", "data-ui": "ui.dialog-overlay" });
    var t = el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: title });
    var box = el("div", { class: "k-dialog k-mn-dialog" + (opts.cls ? " " + opts.cls : ""), "data-ui": "ui.dialog " + (opts.hook || "money.dialog"),
      role: "dialog", "data-intent": opts.danger ? "danger" : null }, [
      el("div", { class: "k-dialog-head" }, [
        el("div", { class: "k-dialog-mark", lang: "ja", "aria-hidden": "true", text: mark }),
        el("div", { class: "k-mn-dialog-titles" }, [t, opts.sub ? el("div", { class: "k-mn-dialog-sub", text: opts.sub }) : null].filter(Boolean)),
        el("button", { type: "button", class: "k-iconbtn", "data-ui": "ui.dialog-close", "aria-label": "Close", text: "✕", onclick: function () { overlay.close(); } })
      ]),
      el("div", { class: "k-mn-dialog-body" }, body.filter(Boolean)),
      foot ? el("div", { class: "k-dialog-foot", "data-ui": "money.dialog-foot" }, foot.filter(Boolean)) : null
    ].filter(Boolean));
    overlay.appendChild(box);
    overlay.close = function () { overlay.remove(); };
    U.openDialog(overlay, { labelledBy: t, initialFocus: opts.focus || null });
    return overlay;
  }

  /* ---------------- the header: the strip is the shell's; views, Hide, Add ---------------- */
  function header(view, sub) {
    var hide = M.isHidden();
    var privacy = btn(hide ? "◑ Amounts hidden" : "◐ Hide amounts", hide ? "k-mn-priv" : "", function () {
      M.setHidden(!M.isHidden());
      announce(M.isHidden() ? "Amounts hidden" : "Amounts shown");
      redraw();
    }, "money.privacy", { "aria-pressed": hide ? "true" : "false" });
    var tabs = U.tabs(VIEWS.map(function (v) {
      return { label: v[1], active: v[0] === view, onSelect: function () { if (v[0] !== view) go(v[0]); } };
    }), { variant: "workspace", label: "Money views", className: "k-seg--quiet k-mn-views", edge: true });
    tabs.setAttribute("data-phone-tabs", "");
    return U.pageHeader({
      kicker: "円 · The month",
      title: view === "overview" ? "Money" : (VIEWS.filter(function (v) { return v[0] === view; })[0] || [0, "Money"])[1],
      sub: sub,
      className: "k-mn-head",
      actions: [tabs, privacy, view === "budgets" || view === "pots" || view === "month" ? null
        : btn("＋ Add entry", "k-btn--primary k-mn-add", function () { entryEditor(null); }, "money.add")]
    });
  }

  KOS.views.money = function (main, arg) {
    KOS.shell.tree("none");
    var view = VIEWS.some(function (v) { return v[0] === arg; }) ? arg : "overview";
    var key = M.periodKey(today()), r = M.periodRange(key);
    var subs = {
      overview: monthName(key) + " so far · " + (between(r.from, today()) + 1) + " of " + r.days + " days",
      transactions: "Every entry, typed, imported or made by a rule",
      budgets: null, recurring: "Payments, income and set-asides made by a rule",
      pots: null, month: "What came in, what went out"
    };
    var page = el("div", { class: "k-mn", "data-ui": "money.page", "data-view": view });
    main.appendChild(header(view, subs[view]));
    main.appendChild(page);
    if (!M.available()) {
      page.appendChild(U.emptyState({ mark: "✕", title: "Money could not be read on this device",
        body: "Your entries are safe; reload to try again.", action: btn("Reload", "", function () { location.reload(); }) }));
      return;
    }
    RENDER[view](page);
    /* the phone's round add button (27q): the header's Add entry, above the tab bar */
    if (view === "overview" || view === "transactions" || view === "recurring") {
      page.appendChild(el("button", { type: "button", class: "k-mn-fab", "data-ui": "money.fab", "aria-label": "Add entry", text: "＋",
        onclick: function () { entryEditor(null); } }));
    }
  };

  /* ================= 27b · Overview ================= */
  function overview(page) {
    var now = today(), key = M.periodKey(now);
    M.summary(key, function (err, s) {
      if (err || !s) { failed(page); return; }
      var ins = M.insights(s, now);
      var empty = !s.count && !M.rules().length && !M.pots().length;
      if (empty) { page.appendChild(firstVisit()); return; }
      page.appendChild(hero(s, ins, now));
      if (ins.late.length) page.appendChild(lateCard(ins.late[0]));
      var nudge = s.count ? budgetNudge() : null;
      if (nudge) page.appendChild(nudge);
      var grid = el("div", { class: "k-mn-cols", "data-ui": "money.overview" });
      grid.appendChild(categoriesCard(s, ins));
      var side = el("div", { class: "k-mn-side" });
      side.appendChild(nextCard(now));
      var sc = subsCard();
      if (sc) side.appendChild(sc);
      side.appendChild(el("div", { class: "k-mn-slot", "data-ui": "money.pots-slot" }));
      grid.appendChild(side);
      page.appendChild(grid);
      potsSummary(side.lastChild);
    });
  }
  function failed(page) {
    page.appendChild(U.emptyState({ mark: "✕", title: "Money could not be read on this device",
      body: "Your entries are safe; reload to try again.", action: btn("Reload", "", function () { location.reload(); }) }));
  }
  /* 27l · first visit, redrawn as a whole page (frame 34a, built from the
     app's parts): the spot beside a three-step start, then what the
     Overview will show, ghosted and labelled a preview — no figure is
     drawn without its evidence (invariant 76) */
  function firstVisit() {
    var d = M.data(), ms = d.monthStart, payday = ms === 1 ? 28 : ms;
    var curSel = select([["£", "£ Pound"], ["€", "€ Euro"], ["$", "$ Dollar"], ["¥", "¥ Yen"]], d.currency, { "aria-label": "Currency", class: "k-input k-pill-select", "data-ui": "money.first-currency" });
    curSel.addEventListener("change", function () { M.setCurrency(curSel.value); announce("Amounts in " + curSel.value); });
    var startSeg = seg([["1", "The 1st"], ["pay", "Payday"]], ms === 1 ? "1" : "pay", function (v) {
      M.setMonthStart(v === "1" ? 1 : payday); announce(v === "1" ? "The month starts on the 1st" : "The month starts on payday, the " + payday + ordinal(payday)); redraw();
    }, "The month starts on", "k-seg--fill");
    function step(n, title, body, kids) {
      return el("li", { class: "k-mn-step", "data-ui": "money.first-step" }, [
        el("span", { class: "k-mn-step-n", "aria-hidden": "true", text: String(n) }),
        el("div", { class: "k-mn-step-b" }, [el("b", { text: title }), el("p", { class: "k-muted k-mn-small", text: body })].concat(kids || []))]);
    }
    var start = card([
      el("div", { class: "k-mn-first-hero" }, [
        el("img", { class: "k-mn-first-art", src: "assets/app/img/app.empty.money.webp", alt: "", loading: "lazy", "aria-hidden": "true" }),
        el("div", {}, [kicker("円 · First run"), el("h2", { class: "k-mn-first-title", text: "Nothing here yet" }),
          el("p", { class: "k-soft", text: "Money keeps what comes in and what goes out, typed by you or read from a CSV. It never moves gold or XP, and nothing leaves this device unless you sync." })])
      ]),
      el("ol", { class: "k-mn-steps" }, [
        step(1, "Your month", "Amounts in, and when the month starts — on the 1st, or on payday.", [el("div", { class: "k-mn-actions" }, [curSel, startSeg])]),
        step(2, "What comes in and goes out", "Type your first income or spend, or bring in a bank's CSV.", [el("div", { class: "k-mn-actions" }, [
          btn("Add your first income", "k-btn--primary", function () { entryEditor(null, { kind: "in" }); }, "money.first-income"),
          btn("Import a CSV", "", function () { importDialog(); }, "money.first-import")])]),
        step(3, "One budget", "Pick a category you want to watch and give it a monthly amount.", [el("div", { class: "k-mn-actions" }, [
          btn("Set a budget", "", function () { go("budgets"); }, "money.first-budget")])])
      ])
    ], "k-mn-first", "money.first");
    /* the preview: the Overview's three parts with no numbers in them */
    function ghost(title, body, kids) {
      return el("div", { class: "k-mn-ghost" }, [kicker(title)].concat(kids, [el("p", { class: "k-muted k-mn-small", text: body })]));
    }
    var bars = function (n) { return el("div", { class: "k-mn-ghost-bars", "aria-hidden": "true" }, Array.from({ length: n }, function (_, i) { return el("span", { style: "--h: " + [40, 70, 25, 90, 55, 30, 65, 45, 80, 20, 60, 35, 75, 50][i % 14] + "%" }); })); };
    var rows = el("div", { class: "k-mn-ghost-rows", "aria-hidden": "true" }, [72, 48, 30].map(function (w) { return el("span", { style: "--w: " + w + "%" }); }));
    var preview = card([head("What the Overview will show", "Preview"),
      el("div", { class: "k-mn-ghosts" }, [
        ghost("Left to spend", "What is left of the month's income once your spending is in, with each day's spend beneath it.", [bars(14)]),
        ghost("Safe to spend today", "A daily figure, after the bills and set-asides still to come. It appears after a week of entries.", [el("div", { class: "k-mn-ghost-fig", "aria-hidden": "true" })]),
        ghost("Categories", "Where the money went, each against its budget when it has one.", [rows])
      ])
    ], "k-mn-preview", "money.first-preview");
    return el("div", { class: "k-mn-firstrun" }, [start, preview]);
  }
  /* 34b · entries but no budget yet: one quiet card offering the third step */
  function budgetNudge() {
    var any = M.categories({ kind: "out" }).some(function (c) { return M.budgetOf(c) != null; });
    if (any) return null;
    return card([el("div", { class: "k-mn-nudge" }, [
      el("div", {}, [el("b", { text: "Set one budget" }), el("p", { class: "k-muted k-mn-small", text: "Pick the category you most want to watch. Its bar then reads against a monthly amount, and the month shows what is left." })]),
      btn("Set a budget", "", function () { go("budgets"); }, "money.nudge-budget")])], "", "money.budget-nudge");
  }
  /* the month's hero: what is left, safe today, and how the days went */
  function hero(s, ins, now) {
    var key = s.key;
    var chips = el("div", { class: "k-mn-chips" });
    var nextPay = ins.expectedList.filter(function (o) { return o.date >= now; })[0];
    if (ins.late.length) chips.appendChild(chip("◷ Late · " + ins.late[0].name + ", " + ins.late[0].daysLate + (ins.late[0].daysLate === 1 ? " day" : " days"), "amber"));
    else if (nextPay) chips.appendChild(chip("◷ Pay due " + dayLabel(nextPay.date) + " · in " + between(now, nextPay.date) + (between(now, nextPay.date) === 1 ? " day" : " days"), "amber"));
    var overs = Object.keys(s.byCat).filter(function (id) { return s.byCat[id].over; });
    if (overs.length === 1) chips.appendChild(chip("▲ " + cat(overs[0]).name + " over by " + (said(-s.byCat[overs[0]].left) || "its budget"), "danger"));
    else if (overs.length > 1) chips.appendChild(chip("▲ " + overs.length + " categories over budget", "danger"));
    var nospend = noSpendDays(s, now);
    if (nospend) chips.appendChild(chip("● " + nospend + (nospend === 1 ? " no-spend day" : " no-spend days"), "teal"));
    var main = el("div", { class: "k-mn-hero-main" }, [
      kicker("Left to spend · " + monthName(key)),
      el("div", { class: "k-mn-hero-fig" }, [
        el("button", { type: "button", class: "k-mn-figlink", "data-ui": "money.left", "aria-label": "Left to spend, open Budgets", onclick: function () { go("budgets"); } },
          [amt(ins.left == null ? 0 : ins.left, { size: "60" })]),
        ins.planned ? el("span", { class: "k-mn-hero-of" }, ["of ", amt(ins.planned, { size: "14", w: "500" }), " coming in this month"]) : null
      ].filter(Boolean)),
      chips.childNodes.length ? chips : null,
      dayChart(s, now),
      el("ul", { class: "k-legend k-mn-legend" }, [
        el("li", { class: "k-legend-item" }, [el("span", { class: "k-mn-key", "data-k": "bar" }), "Spent each day"]),
        el("li", { class: "k-legend-item" }, [el("span", { class: "k-mn-key", "data-k": "nospend" }), "No-spend day"]),
        el("li", { class: "k-legend-item" }, [el("span", { class: "k-mn-key", "data-k": "future" }), "Still to come"]),
        el("li", { class: "k-legend-item", text: "◷ trial ends · ● a bill · ＋ pay" })
      ])
    ].filter(Boolean));
    var safe = el("div", { class: "k-mn-hero-side", "data-ui": "money.safe" }, [
      kicker("Safe to spend today"),
      ins.safeToday != null
        ? el("div", { class: "k-mn-safe" }, [amt(ins.safeToday, { size: "46" })])
        : el("div", { class: "k-mn-lowdata", "data-ui": "money.lowdata" }, [
          el("p", { text: "Appears after a week of entries." }),
          el("span", { class: "k-muted", text: ins.dataDays + (ins.dataDays === 1 ? " day so far" : " days so far") })]),
      ins.safeToday != null ? el("div", { class: "k-mn-safe-sub", text: "a day, for the " + ins.daysLeft + (ins.daysLeft === 1 ? " day left" : " days left") }) : null,
      ins.safeToday != null && ins.ahead ? el("div", { class: "k-mn-safe-note" }, ["after ", amt(ins.ahead, { size: "12", w: "500" }), " of bills and set-asides still to come"]) : null,
      el("div", { class: "k-mn-spacer" }),
      heroRow("In", [ins.received ? el("span", {}, [amt(ins.received, { size: "12-5" }), " received"]) : null,
        ins.expected ? el("span", {}, [amt(ins.expected, { size: "12-5", w: "500", tone: "muted" }), ins.expectedList.length === 1 ? " expected on the " + parse(ins.expectedList[0].date).getDate() + ordinal(parse(ins.expectedList[0].date).getDate()) : " expected"]) : null]),
      heroRow("Out", [el("span", {}, [amt(ins.spent, { size: "12-5" }), " spent"]),
        ins.toPots ? el("span", {}, [amt(ins.toPots, { size: "12-5", w: "500", tone: "muted" }), " moved to pots, not spend"]) : null])
    ].filter(Boolean));
    return el("section", { class: "k-mn-hero", "data-ui": "money.hero", "aria-label": "This month" }, [
      el("span", { class: "k-mn-hero-mark", lang: "ja", "aria-hidden": "true", text: "円" }), main, safe]);
  }
  function ordinal(n) { return n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th"; }
  function heroRow(label, lines) {
    lines = lines.filter(Boolean);
    if (!lines.length) return null;
    return el("div", { class: "k-mn-hero-row" }, [el("span", { class: "k-mn-hero-row-k", text: label }), el("div", { class: "k-mn-hero-row-v" }, lines)]);
  }
  /* days so far with nothing spent — only once the month has entries */
  function noSpendDays(s, now) {
    var spent = s.spendDays || {}, n = 0;
    if (!s.days) return 0;
    for (var d = s.from; d <= now && d <= s.to; d = addDays(d, 1)) if (!spent[d] || spent[d].minor <= 0) n++;
    return n;
  }
  /* the day chart: a bar per day spent, a teal dot for a no-spend day, a
     dashed slot for each day to come with its trial, bill and pay marks.
     One focusable group: ← → move day by day, the tooltip is that day. */
  function dayChart(s, now) {
    var by = s.spendDays || {}, top = 0, marks = {};
    Object.keys(by).forEach(function (d) { if (by[d].minor > top) top = by[d].minor; });
    M.upcoming(addDays(now, 1), s.to, now).forEach(function (o) {
      if (o.state === "done" || o.state === "skip") return;
      marks[o.date] = marks[o.date] || (o.kind === "in" ? "pay" : o.trial ? "trial" : "bill");
    });
    M.rules({ sub: true }).forEach(function (r) { if (r.trialEnd && r.trialEnd > now && r.trialEnd <= s.to) marks[r.trialEnd] = "trial"; });
    var days = [], d = s.from, i = 0;
    for (; d <= s.to; d = addDays(d, 1), i++) days.push(d);
    var tip = el("div", { class: "k-mn-tip", "data-ui": "money.tip", role: "status", hidden: "" });
    var bars = el("div", { class: "k-mn-days", "aria-hidden": "true" });
    var labels = el("div", { class: "k-mn-days-x", "aria-hidden": "true" });
    var payDay = null;
    Object.keys(marks).forEach(function (k) { if (marks[k] === "pay" && !payDay) payDay = k; });
    days.forEach(function (day, idx) {
      var cell = el("span", { class: "k-mn-day", "data-day": day });
      if (day < now || day === now) {
        var v = by[day] ? by[day].minor : 0;
        if (v > 0) {
          var b = el("i", { class: "k-mn-day-bar", "data-state": day === now ? "today" : null });
          b.style.setProperty("--h", Math.max(6, Math.round(100 * v / (top || 1))) + "%");
          cell.appendChild(b);
        } else if (s.days) cell.appendChild(el("i", { class: "k-mn-day-dot", "data-state": day === now ? "today" : null }));
      } else {
        var mk = marks[day];
        if (mk) cell.appendChild(el("b", { class: "k-mn-day-mark", "data-k": mk, text: mk === "trial" ? "◷" : mk === "pay" ? "＋" : "●" }));
        cell.appendChild(el("i", { class: "k-mn-day-slot" }));
      }
      bars.appendChild(cell);
      var n = parse(day).getDate();
      var lab = day === now ? "Today" : day === payDay ? "Pay" : (n === 1 || n === 8 || n === 15 || day === s.to) ? String(n) : "";
      labels.appendChild(el("span", { "data-state": day === now ? "today" : null, text: lab }));
    });
    var pastDays = days.filter(function (x) { return x <= now; });
    var cur = Math.max(0, pastDays.length - 1);
    var group = el("div", { class: "k-mn-chart", "data-ui": "money.daychart", tabindex: "0", role: "group",
      "aria-label": "Spending day by day this month. Use the arrow keys to read each day." }, [bars, labels, tip]);
    function show(idx, speak) {
      cur = Math.max(0, Math.min(pastDays.length - 1, idx));
      var day = pastDays[cur], row = by[day];
      Array.prototype.forEach.call(bars.children, function (c) { U.state(c, "focus", c.getAttribute("data-day") === day); });
      tip.hidden = false;
      tip.style.setProperty("--x", ((cur + 0.5) / days.length * 100).toFixed(1) + "%");
      tip.textContent = "";
      tip.appendChild(el("b", { text: dayLabel(day) }));
      tip.appendChild(el("span", {}, row && row.minor > 0
        ? [amt(row.minor, { size: "12" }), row.top ? " · " + cat(row.top).name : ""]
        : ["Nothing spent"]));
      if (speak) announce(longDate(day) + ", " + (row && row.minor > 0 ? (M.isHidden() ? "spent" : money(row.minor)) + (row.top ? ", mostly " + cat(row.top).name : "") : "nothing spent") + ".");
    }
    group.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); show(cur + (e.key === "ArrowLeft" ? -1 : 1), true); }
      else if (e.key === "Home") { e.preventDefault(); show(0, true); }
      else if (e.key === "End") { e.preventDefault(); show(pastDays.length - 1, true); }
    });
    group.addEventListener("focus", function () { show(cur, false); });
    group.addEventListener("blur", function () { tip.hidden = true; Array.prototype.forEach.call(bars.children, function (c) { U.state(c, "focus", false); }); });
    bars.addEventListener("mousemove", function (e) {
      var t = e.target.closest && e.target.closest(".k-mn-day");
      if (!t) return;
      var i2 = pastDays.indexOf(t.getAttribute("data-day"));
      if (i2 !== -1) show(i2, false);
    });
    bars.addEventListener("mouseleave", function () { if (document.activeElement !== group) tip.hidden = true; });
    return group;
  }
  /* the late-not-missing state: pending (amber), never alarm red */
  function lateCard(o) {
    var r = M.rule(o.rule);
    return card([
      head("Income · on " + dayLabel(today()), "the " + o.name.toLowerCase() + " pay has not arrived yet"),
      el("div", { class: "k-card-row" }, [tile("入", "green"),
        el("div", { class: "k-mn-grow" }, [el("div", { class: "k-mn-strong", text: o.name }),
          el("div", { class: "k-muted k-mn-small", text: "Expected " + dayLabel(o.date) + " · " + o.daysLate + (o.daysLate === 1 ? " day" : " days") + " late, still expected" })]),
        chip("◷ Late", "amber"), amt(o.minor, { plus: true, tone: "muted", w: "500" })]),
      el("div", { class: "k-mn-actions" }, [
        btn("Mark received", "k-btn--sm", function () { confirmOcc(r, o.date, null, today()); }, "money.received"),
        btn("Received a different amount", "k-btn--sm", function () { amountDialog(r, o.date, today()); }, "money.received-other"),
        btn("Move the date", "k-btn--sm k-btn--quiet", function () { moveDialog(r, o.date); }, "money.move-date")])
    ], "k-mn-late", "money.late");
  }
  function categoriesCard(s, ins) {
    var rows = [], spentAll = 0, budAll = 0, overN = 0;
    M.categories({ kind: "out" }).forEach(function (c) {
      var r = s.byCat[c.id];
      if (!r || (r.budget == null && !r.net)) return;      // nothing yet: a supporting zero is not listed
      spentAll += Math.max(0, r.net);
      if (r.budget != null) budAll += r.effective != null ? r.effective : r.budget;
      if (r.over) overN++;
      var subBits = [];
      Object.keys(r.modules || {}).forEach(function (m) { if (r.modules[m]) subBits.push((KOS.wishlist && KOS.wishlist.MODULE_LABEL[m] || m) + " " + said(r.modules[m])); });
      var note = null;
      var next = M.upcoming(addDays(today(), 1), s.to, today()).filter(function (o) { return o.cat === c.id && o.state === "upcoming"; })[0];
      if (next) note = next.name + (M.isHidden() ? "" : " " + money(next.minor)) + " on the " + parse(next.date).getDate() + ordinal(parse(next.date).getDate());
      var bar = U.catBar({ name: c.name, tone: c.tone, spent: Math.max(0, r.net), budget: r.budget == null ? null : (r.effective != null ? r.effective : r.budget),
        sub: subBits.length ? subBits.join(" · ") : null, note: note,
        onSet: function () { go("budgets"); } });
      var openRow = el("button", { type: "button", class: "k-mn-catrow", "data-ui": "money.cat-row", "aria-label": c.name + ", open in Budgets",
        onclick: function () { visit.budKey = s.key; go("budgets"); } }, [bar]);
      rows.push(openRow);
    });
    var meta = rows.length ? (said(spentAll) ? said(spentAll) + " spent" + (budAll ? " of " + said(budAll) + " budgeted" : "") : "") + (overN ? " · " + overN + " over" : "") : "";
    var body = rows.length ? el("div", { class: "k-mn-catlist" }, rows)
      : U.emptyState({ compact: true, title: "Nothing spent in " + monthName(s.key) + " yet", body: "Categories appear here as you spend in them." });
    var projection = ins.projection != null
      ? el("div", { class: "k-mn-note", "data-ui": "money.projection" }, [el("span", { class: "k-muted", "aria-hidden": "true", text: "◷" }),
        el("span", { class: "k-mn-grow" }, ["At this pace you will spend about ", amt(Math.round(ins.projection / 100) * 100, { size: "13", whole: true }),
          " by " + shortDate(s.to) + (budAll ? ", against " : "."), budAll ? amt(budAll, { size: "13" }) : null, budAll ? " of budgets." : null].filter(Boolean)),
        el("span", { class: "k-muted k-mn-small", text: "from " + ins.elapsed + " days" })])
      : el("div", { class: "k-mn-note k-muted", "data-ui": "money.projection" }, [
        "A month-end projection needs " + M.LOW_DATA_DAYS + " days of entries · " + ins.dataDays + (ins.dataDays === 1 ? " day so far" : " days so far")]);
    return card([head("This month by category", meta, ["Budgets →", function () { go("budgets"); }]), body, rows.length ? projection : null], "k-mn-cats", "money.categories");
  }
  function nextCard(now) {
    var to = addDays(now, 14);
    var items = M.upcoming(now, to, now).filter(function (o) { return o.state !== "done" && o.state !== "skip" && !o.trial; });
    M.rules({ sub: true }).forEach(function (r) {
      if (r.trialEnd && r.trialEnd >= now && r.trialEnd <= to) items.push({ rule: r.id, name: r.name, date: r.trialEnd, trialEnd: true, kind: "out", minor: r.minor });
    });
    items.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    var rows = items.slice(0, 5).map(function (o) {
      var r = M.rule(o.rule) || {};
      var sub = o.trialEnd ? "Free trial ends · then " + said(o.minor) + " a month"
        : o.kind === "in" ? "Income · " + (o.date < now ? "late" : "expected")
        : o.kind === "transfer" ? "Set-aside · a transfer, not spend"
        : cat(o.cat).name + " · " + shortEvery(r);
      var change = r.prices ? M.priceChange(r) : null;
      if (change && !o.trialEnd && o.kind === "out") sub = cat(o.cat).name + " · up from " + said(change.was);
      return el("div", { class: "k-card-row k-mn-next" }, [
        el("span", { class: "k-mono k-mn-day-label", text: o.date === now ? "Today" : dayLabel(o.date).replace(/ [A-Z][a-z]{2}$/, function (m) { return parse(o.date).getMonth() === parse(now).getMonth() ? "" : m; }) }),
        el("div", { class: "k-mn-grow" }, [el("div", { class: "k-mn-strong k-ellipsis", text: o.trialEnd ? o.name : o.kind === "transfer" ? (M.pot(r.pot) ? M.pot(r.pot).name + " pot" : o.name) : o.name }),
          el("div", { class: "k-muted k-mn-small k-ellipsis", text: sub.replace(/ · $/, "") })]),
        o.trialEnd ? chip("◷ Cancel before " + shortDate(o.date), "amber")
          : amt(o.minor, { plus: o.kind === "in", tone: o.kind === "in" ? "in" : o.kind === "transfer" ? "transfer" : null, w: o.kind === "transfer" ? "500" : null })
      ]);
    });
    return card([head("Next 14 days", "to " + dayLabel(to), ["Recurring →", function () { go("recurring"); }]),
      rows.length ? el("div", {}, rows) : el("p", { class: "k-muted k-mn-small", text: "Nothing due in the next two weeks." })], "", "money.next");
  }
  function subsCard() {
    var subs = M.subscriptions();
    if (!subs.items.length) return null;
    var rise = subs.paid.map(function (r) { return { r: r, c: M.priceChange(r) }; }).filter(function (x) { return x.c && x.c.now > x.c.was; })[0];
    return card([head("Subscriptions", subs.paid.length + " active" + (subs.trials.length ? " · " + subs.trials.length + (subs.trials.length === 1 ? " trial" : " trials") : "")),
      el("div", { class: "k-mn-subs-fig" }, [amt(subs.perMonth, { size: "24" }), el("span", { class: "k-muted", text: "a month" })]),
      el("div", { class: "k-muted k-mn-small" }, [amt(subs.perYear, { size: "12-5", w: "500", tone: "muted" }), " a year",
        rise ? " · " + rise.r.name + " went up by " + (said(rise.c.now - rise.c.was) || "a little") + " in " + MONTHS[parse(rise.c.from).getMonth()] : ""])],
      "", "money.subs");
  }
  function potsSummary(slot) {
    var ps = M.pots();
    if (!ps.length) { slot.remove(); return; }
    M.potBalances(function (err, bal) {
      var total = 0;
      var rows = ps.map(function (p) {
        var b = (bal || {})[p.id] || 0;
        total += b;
        var line = p.by ? "by " + dayLabel(p.by) + " · " + Math.max(0, between(today(), p.by)) + " days" : "No date set";
        if (!b && p.target) line = (p.by ? "by " + dayLabel(p.by) + " · " : "") + "nothing yet";
        var pic = el("span", { class: "k-mn-potpic", "data-cat-tone": "jade" });
        M.getPic(p.id, function (pc) { if (pc) { pic.textContent = ""; pic.appendChild(KOS.imageCrop.image(pc.src, { alt: "" }, pc.crop)); } });
        return el("button", { type: "button", class: "k-card-row k-mn-potrow", "data-ui": "money.pot-row", onclick: function () { go("pots"); } }, [
          pic, el("div", { class: "k-mn-grow" }, [el("div", { class: "k-mn-strong", text: p.name }), el("div", { class: "k-muted k-mn-small", text: line })]),
          el("div", { class: "k-mn-right" }, [amt(b), p.target ? el("div", { class: "k-muted k-mn-tiny" }, ["of ", amt(p.target, { size: "11-5", w: "500" })]) : null].filter(Boolean))]);
      });
      slot.replaceWith(card([head("Pots", said(total) ? said(total) + " set aside" : null, ["Pots →", function () { go("pots"); }]), el("div", {}, rows)], "", "money.pots"));
    });
  }
  function shortEvery(r) {
    var n = r.every ? r.every.n : 1, u = r.every ? r.every.unit : "month";
    if (n === 1) return { day: "daily", week: "weekly", month: "monthly", year: "yearly" }[u];
    return "every " + n + " " + u + "s";
  }
  function everyLabel(r) {
    if (!r || !r.every) return "";
    var n = r.every.n, u = r.every.unit, d = parse(r.start);
    if (u === "week") return n === 1 ? "every week on " + DAYS[d.getDay()] : "every " + n + " weeks on " + DAYS[d.getDay()];
    if (u === "month") return (n === 1 ? "monthly" : "every " + n + " months") + " on the " + r.dom + ordinal(r.dom);
    if (u === "year") return n === 1 ? "yearly on " + d.getDate() + " " + MON3[d.getMonth()] : "every " + n + " years";
    return n === 1 ? "every day" : "every " + n + " days";
  }

  /* ================= 27c · Transactions ================= */
  var BADGE = { refund: ["↩ Refund", "teal"], transfer: ["⇄ Transfer", "muted"] };
  function txRange() {
    var now = today(), key = M.periodKey(now), r = M.periodRange(key);
    switch (visit.tx.range) {
      case "last": var pr = M.periodRange(M.shiftKey(key, -1)); return { from: pr.from, to: pr.to, label: shortDate(pr.from) + " – " + shortDate(pr.to) };
      case "three": return { from: M.periodRange(M.shiftKey(key, -2)).from, to: r.to, label: "The last 3 months" };
      case "year": return { from: now.slice(0, 4) + "-01-01", to: now.slice(0, 4) + "-12-31", label: now.slice(0, 4) };
      case "all": return { from: "0000-01-01", to: "9999-12-31", label: "Everything" };
      default: return { from: r.from, to: r.to, label: shortDate(r.from) + " – " + shortDate(r.to) };
    }
  }
  function transactions(page) {
    var f = visit.tx, rng = txRange();
    var search = input("search", f.search, { "data-ui": "money.tx-search", placeholder: "Search payee, note or #tag", "aria-label": "Search entries", class: "k-input k-mn-search" });
    var catSel = select([["", "Category: All"]].concat(M.categories({ archived: true }).map(function (c) { return [c.id, c.name]; })), f.cat,
      { "data-ui": "money.tx-cat", "aria-label": "Category", class: "k-input k-pill-select" });
    var rangeSel = select([["month", rng.label && f.range === "month" ? rng.label : "This month"], ["last", "Last month"], ["three", "The last 3 months"], ["year", "This year"], ["all", "Everything"]], f.range,
      { "data-ui": "money.tx-range", "aria-label": "Dates", class: "k-input k-pill-select" });
    var kinds = seg([["", "All"], ["in", "In"], ["out", "Out"]], f.kind, function (k) { f.kind = k; redraw(); }, "Entry kind", "k-mn-kinds");
    var debounced = U.debounce(function () { f.search = search.value; redrawList(); }, 400);
    search.addEventListener("input", debounced);
    catSel.addEventListener("change", function () { f.cat = catSel.value; redrawList(); });
    rangeSel.addEventListener("change", function () { f.range = rangeSel.value; redrawList(); });
    page.appendChild(el("div", { class: "k-mn-toolbar", "data-ui": "money.tx-toolbar" }, [search, catSel, rangeSel, kinds,
      el("span", { class: "k-mn-spacer" }),
      btn("Import CSV", "k-btn--sm", function () { importDialog(); }, "money.import"),
      btn("Export CSV", "k-btn--sm", function () { exportDialog(); }, "money.export")]));
    var listHost = el("div", { class: "k-mn-txlist-host" });
    var side = el("div", { class: "k-mn-side" });
    page.appendChild(el("div", { class: "k-mn-cols k-mn-cols--sm" }, [listHost, side]));
    function redrawList() { listHost.textContent = ""; side.textContent = ""; drawList(listHost, side); }
    redrawList();
  }
  function drawList(host, side) {
    var f = visit.tx, rng = txRange(), cursor = null, done = false, shown = [];
    var bulk = el("div", { class: "k-mn-bulk", "data-ui": "money.bulk", hidden: "" });
    var list = el("div", { class: "k-mn-tx", "data-ui": "money.tx-list", role: "list", "aria-label": "Entries" });
    var more = el("div", { class: "k-mn-more k-muted", "data-ui": "money.tx-more" });
    var holder = card([bulk, list, more], "k-mn-txcard", "money.tx-card");
    host.appendChild(holder);
    var groups = {};
    var q = f.search.trim(), tag = "";
    var m = q.match(/(^|\s)#([\w-]+)/);
    if (m) { tag = m[2]; q = q.replace(m[0], "").trim(); }
    var loading = false;
    function load() {
      if (done || loading) return;
      loading = true;
      M.list({ from: rng.from, to: rng.to, cat: f.cat || null, kind: f.kind === "out" ? null : f.kind || null, search: q, tag: tag || null, before: cursor, limit: 60 }, function (err, rows, next) {
        rows = (rows || []).filter(function (t) { return f.kind !== "out" || t.kind === "out" || t.kind === "transfer"; });
        rows.forEach(function (t) {
          shown.push(t);
          var g = groups[t.date];
          if (!g) {
            g = groups[t.date] = el("div", { class: "k-mn-txgroup", role: "presentation" }, [el("div", { class: "k-mn-txdate", text: dayLabel(t.date) })]);
            list.appendChild(g);
          }
          g.appendChild(txRow(t));
        });
        cursor = next; done = !next; loading = false;
        more.textContent = "";
        if (!shown.length) {
          list.appendChild(U.emptyState({ compact: true, mark: "円", title: f.search || f.cat || f.kind ? "Nothing matches these filters" : "No entries in this time",
            action: f.search || f.cat || f.kind ? btn("Clear filters", "k-btn--sm", function () { visit.tx = { search: "", cat: "", range: f.range, tag: "", kind: "" }; redraw(); }) : null }));
        } else {
          more.appendChild(document.createTextNode("Showing " + shown.length + (done ? "" : " · the next 60 load as you scroll")));
          if (!done) more.appendChild(btn("Load 60 more", "k-btn--sm k-btn--quiet", load, "money.tx-load"));
        }
        announce(shown.length + (shown.length === 1 ? " entry" : " entries"));
        drawSide();
      });
    }
    if (window.IntersectionObserver) {
      var io = new window.IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) load(); });
      io.observe(more);
    }
    function txRow(t) {
      var c = cat(t.cat), split = t.splits && t.splits.length > 1;
      var box = el("input", { type: "checkbox", class: "k-box", "data-ui": "money.tx-tick", "aria-label": "Select " + (t.payee || "entry") });
      box.checked = !!visit.ticked[t.syncId];
      box.addEventListener("change", function () {
        if (box.checked) visit.ticked[t.syncId] = t; else delete visit.ticked[t.syncId];
        U.state(row, "ticked", box.checked);
        drawBulk();
      });
      var tone = t.kind === "in" ? "in" : t.kind === "refund" ? "in" : t.kind === "transfer" ? "transfer" : null;
      var signed = t.kind === "out" || (t.kind === "transfer" && t.dir === "in") ? -t.minor : t.minor;
      var potName = t.pot && M.pot(t.pot) ? M.pot(t.pot).name : "a pot";
      var row = el("div", { class: "k-mn-txrow", "data-ui": "money.tx-row", role: "listitem", tabindex: "0", "data-id": t.syncId,
        "aria-label": (t.payee || (t.kind === "transfer" ? "Transfer" : "Entry")) + ", " + (M.isHidden() ? "" : money(signed, { sign: true }) + ", ") + dayLabel(t.date) }, [
        box,
        el("span", { class: "k-mn-txcat" }, [dot(split ? "muted" : t.kind === "transfer" ? "jade" : c.tone),
          el("span", { class: "k-ellipsis", text: split ? "Split · " + t.splits.length : t.kind === "transfer" ? "Transfer" : collName(t) || c.name })]),
        el("div", { class: "k-mn-txmain" }, [
          el("div", { class: "k-mn-txpayee" }, [el("span", { class: "k-ellipsis k-mn-strong", text: t.payee || (t.kind === "transfer" ? (t.dir === "out" ? potName + " → Main" : "Main → " + potName) : c.name) }),
            BADGE[t.kind] ? chip(BADGE[t.kind][0], BADGE[t.kind][1]) : null,
            t.src === "rule" ? el("span", { class: "k-muted", title: "Made by a recurring rule", text: "↻" }) : null,
            t.src === "wishlist" ? el("span", { class: "k-muted", lang: "ja", title: "From the Wishlist", text: "願" }) : null].filter(Boolean)),
          t.note || t.tags.length || t.kind === "transfer" ? el("div", { class: "k-mn-txnote k-ellipsis" }, [
            t.note || (t.kind === "transfer" ? "Not counted as spend" : ""),
            t.tags.map(function (x) { return " #" + x; }).join("")]) : null].filter(Boolean)),
        el("div", { class: "k-mn-txamt" }, [amt(signed, { plus: true, tone: tone, w: t.kind === "transfer" ? "500" : null })]),
        split ? el("div", { class: "k-mn-txsplit" }, t.splits.map(function (p) {
          return el("div", { class: "k-mn-txsplit-row" }, [dot(cat(p.cat).tone), el("span", { class: "k-mn-grow", text: cat(p.cat).name }), amt(-p.minor, { size: "12-5", w: "500" })]);
        })) : null
      ].filter(Boolean));
      if (visit.selected === t.syncId) U.state(row, "selected", true);
      if (box.checked) U.state(row, "ticked", true);
      function open() { visit.selected = t.syncId; Array.prototype.forEach.call(list.querySelectorAll(".k-mn-txrow"), function (n) { U.state(n, "selected", n === row); }); drawSide(); }
      row.addEventListener("click", function (e) { if (e.target === box) return; open(); });
      row.addEventListener("keydown", function (e) {
        var rows = Array.prototype.slice.call(list.querySelectorAll(".k-mn-txrow")), i = rows.indexOf(row);
        if (e.key === "ArrowDown" && rows[i + 1]) { e.preventDefault(); rows[i + 1].focus(); }
        else if (e.key === "ArrowUp" && rows[i - 1]) { e.preventDefault(); rows[i - 1].focus(); }
        else if (e.key === " ") { e.preventDefault(); box.checked = !box.checked; box.dispatchEvent(new Event("change")); }
        else if (e.key === "Enter") { e.preventDefault(); open(); }
        else if (e.key === "e" || e.key === "E") { e.preventDefault(); entryEditor(t); }
        else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); deleteEntry(t); }
      });
      return row;
    }
    function drawBulk() {
      var ids = Object.keys(visit.ticked);
      bulk.hidden = !ids.length;
      bulk.textContent = "";
      if (!ids.length) return;
      var total = ids.reduce(function (n, id) { var t = visit.ticked[id]; return n + (t.kind === "in" || t.kind === "refund" ? t.minor : -t.minor); }, 0);
      bulk.appendChild(el("span", { class: "k-mn-strong", text: ids.length + " selected" }));
      bulk.appendChild(amt(total, { size: "12-5", tone: "muted" }));
      var catBtn = U.menu({ label: "Set category", className: "k-btn--sm", items: M.categories({ kind: "out" }).map(function (c) {
        return { label: c.name, onSelect: function () { bulkSet({ cat: c.id }, "Moved " + ids.length + " entries to " + c.name); } };
      }) });
      catBtn.setAttribute("data-ui", catBtn.getAttribute("data-ui") + " money.bulk-cat");
      bulk.appendChild(catBtn);
      bulk.appendChild(btn("Add tag", "k-btn--sm", function () { tagDialog(function (tg) { bulkSet({ addTag: tg }, "Tagged " + ids.length + " entries #" + tg); }); }, "money.bulk-tag"));
      bulk.appendChild(btn("Export", "k-btn--sm", function () { exportRows(ids.map(function (id) { return visit.ticked[id]; })); }, "money.bulk-export"));
      bulk.appendChild(el("span", { class: "k-mn-spacer" }));
      bulk.appendChild(btn("Delete " + ids.length + "…", "k-btn--sm k-btn--danger", function () {
        U.confirm({ title: "Delete " + ids.length + " entries?", danger: true, confirm: "Delete",
          body: "They leave every total. A backup still has them." }, function () {
          var mine = ids.filter(function (id) { return visit.ticked[id].src !== "wishlist"; });
          (function next(i) {
            if (i >= mine.length) { visit.ticked = {}; announce("Deleted " + mine.length + " entries"); redraw(); return; }
            M.deleteTx(mine[i], function () { next(i + 1); });
          })(0);
        });
      }, "money.bulk-delete", { "data-intent": "danger" }));
      bulk.appendChild(btn("Clear", "k-btn--sm k-btn--quiet", function () { visit.ticked = {}; redraw(); }, "money.bulk-clear"));
      function bulkSet(patch, said2) {
        var mine = ids.filter(function (id) { return visit.ticked[id].src !== "wishlist" && visit.ticked[id].kind !== "transfer"; });
        (function next(i) {
          if (i >= mine.length) { visit.ticked = {}; announce(said2); redraw(); return; }
          var t = visit.ticked[mine[i]], p2 = {};
          if (patch.cat) { p2.cat = patch.cat; p2.splits = null; }
          if (patch.addTag) p2.tags = t.tags.concat([patch.addTag]);
          M.updateTx(t.syncId, p2, function () { next(i + 1); });
        })(0);
      }
    }
    function drawSide() {
      side.textContent = "";
      /* the side always shows an entry: the one picked, else the newest */
      var t = shown.filter(function (x) { return x.syncId === visit.selected; })[0] || shown[0];
      if (t) side.appendChild(selectedCard(t));
      var inn = 0, out = 0, pots = 0;
      shown.forEach(function (x) {
        if (x.kind === "in") inn += x.minor;
        else if (x.kind === "refund") out -= x.minor;
        else if (x.kind === "transfer") { pots += x.dir === "out" ? -x.minor : x.minor; out += x.dir === "out" ? -x.minor : x.minor; }
        else out += x.minor;
      });
      side.appendChild(card([head("This view", shown.length + (shown.length === 1 ? " entry" : " entries") + (done ? "" : " so far") + " · " + rng.label),
        inn ? el("div", { class: "k-card-row" }, [el("span", { class: "k-mn-grow k-soft", text: "In" }), amt(inn, { plus: true, tone: "in" })]) : null,
        el("div", { class: "k-card-row" }, [el("span", { class: "k-mn-grow k-soft", text: "Out" }), amt(-out)]),
        pots ? el("p", { class: "k-muted k-mn-small", text: "Out includes " + (said(pots) || "money") + " moved to pots, which no budget counts." }) : null], "", "money.tx-view"));
    }
    drawBulk();
    load();
  }
  function collName(t) {
    if (t.cat !== "collection" || !t.wl || !t.wl.module) return null;
    return "Collection › " + ((KOS.wishlist && KOS.wishlist.MODULE_LABEL[t.wl.module]) || t.wl.module);
  }
  function selectedCard(t) {
    var parts = t.splits && t.splits.length > 1 ? t.splits : null;
    var src = { manual: "typed by you", csv: "imported from a CSV", rule: "made by a recurring rule", wishlist: "from the Wishlist" }[t.src];
    var signed = t.kind === "out" || (t.kind === "transfer" && t.dir === "in") ? -t.minor : t.minor;
    return card([kicker("Selected"),
      el("div", { class: "k-mn-selhead" }, [el("span", { class: "k-mn-grow k-mn-selname", text: t.payee || (t.kind === "transfer" ? "Transfer" : cat(t.cat).name) }), amt(signed, { size: "20", plus: true, tone: t.kind === "in" || t.kind === "refund" ? "in" : null })]),
      el("div", { class: "k-muted k-mn-small", text: dayLabel(t.date) + " · " + src }),
      parts ? el("div", { class: "k-mn-selsplit" }, parts.map(function (p) {
        return el("div", { class: "k-card-row" }, [dot(cat(p.cat).tone), el("span", { class: "k-mn-grow", text: cat(p.cat).name }), amt(-p.minor, { w: "500" })]);
      }).concat([el("div", { class: "k-card-row" }, [el("span", { class: "k-mn-grow k-muted k-mn-small", text: "Split total" }), amt(-t.minor)])])) : null,
      t.note ? el("p", { class: "k-soft k-mn-small", text: t.note }) : null,
      t.tags.length ? el("div", { class: "k-mn-chips" }, t.tags.map(function (x) { return chip("#" + x, "muted"); })) : null,
      t.src === "wishlist"
        ? el("p", { class: "k-muted k-mn-small", text: "This purchase belongs to the Wishlist; change it there." })
        : el("div", { class: "k-mn-actions" }, [btn("Edit", "k-btn--sm", function () { entryEditor(t); }, "money.sel-edit"),
          t.src !== "rule" ? btn("Duplicate", "k-btn--sm", function () { entryEditor(Object.assign({}, t, { syncId: null, date: today() }), { duplicate: true }); }, "money.sel-dup") : null,
          el("span", { class: "k-mn-spacer" }),
          btn("Delete…", "k-btn--sm k-btn--quiet k-mn-del", function () { deleteEntry(t); }, "money.sel-delete")].filter(Boolean))
    ].filter(Boolean), "", "money.selected");
  }
  function deleteEntry(t) {
    if (t.src === "wishlist") { U.toast("This purchase belongs to the Wishlist; remove it there."); return; }
    var signed = money(t.kind === "in" || t.kind === "refund" ? t.minor : -t.minor);
    U.confirm({ title: "Delete this entry?", danger: true, confirm: "Delete", mark: "✕",
      body: (t.payee || "This entry") + ", " + signed + " on " + dayLabel(t.date) + "." + (t.splits ? " Each category goes back by its part." : "") +
        " This cannot be undone from here; a backup still has it." }, function () {
      M.deleteTx(t.syncId, function (err) {
        if (err) { U.toast(err.message, true); return; }
        if (visit.selected === t.syncId) visit.selected = null;
        delete visit.ticked[t.syncId];
        announce("Deleted · " + (t.payee || "the entry"));
        redraw();
      });
    });
  }
  function tagDialog(cb) {
    var inp = input("text", "", { placeholder: "groceries", "aria-label": "Tag", maxlength: "30" });
    var ov = dialogBox("Add a tag", "#", [field("Tag", inp)], [el("span"),
      btn("Cancel", "", function () { ov.close(); }),
      btn("Add tag", "k-btn--primary", function () {
        var v = inp.value.replace(/^#/, "").trim();
        if (!v) { inp.focus(); return; }
        ov.close(); cb(v);
      })], { focus: inp });
  }

  /* ---------------- the entry editor (a dialog; a sheet on the phone) ---------------- */
  function entryEditor(t, opts) {
    opts = opts || {};
    var existing = t && t.syncId ? t : null;
    var kind = (t && t.kind) || opts.kind || "out";
    if (kind === "refund") kind = "out";
    var isRefund = !!(t && t.kind === "refund");
    var body = el("div", { class: "k-mn-editor" });
    var amountF = U.amountField({ value: t ? t.minor : null, size: "lg", label: "Amount" });
    var dateIn = input("date", (t && t.date) || today(), { "aria-label": "Date" });
    var payeeIn = input("text", (t && t.payee) || "", { maxlength: "80", placeholder: kind === "in" ? "Where it came from" : "Who you paid" });
    var noteIn = input("text", (t && t.note) || "", { maxlength: "500" });
    var tagsIn = input("text", t ? t.tags.map(function (x) { return "#" + x; }).join(" ") : "", { placeholder: "#groceries", "aria-label": "Tags" });
    var refundBox = el("input", { type: "checkbox", class: "k-switch", "aria-label": "This is a refund" });
    refundBox.checked = isRefund;
    var lines = (t && t.splits && t.splits.length > 1 ? t.splits : [{ cat: (t && t.cat) || (kind === "in" ? "other-in" : "food"), minor: t ? t.minor : null }])
      .map(function (p) { return { cat: p.cat, minor: p.minor }; });
    var potFrom = t && t.kind === "transfer" && t.dir === "out" ? t.pot : "main";
    var potTo = t && t.kind === "transfer" && t.dir !== "out" ? t.pot : (M.pots()[0] ? M.pots()[0].id : "main");
    var status = el("div", { class: "k-mn-splitstate", "data-ui": "money.split-state" });
    var err = el("p", { class: "k-field-error", "data-ui": "money.save-error", role: "alert", hidden: "" });
    var catHost = el("div", { class: "k-mn-catlines" });
    var typeSeg;
    function drawType() {
      var s2 = seg([["out", "Out"], ["in", "In"], ["transfer", "Transfer"]], kind, function (k) { kind = k; draw(); }, "Entry type");
      if (typeSeg) typeSeg.replaceWith(s2); typeSeg = s2;
      return s2;
    }
    function drawCats() {
      catHost.textContent = "";
      if (kind === "transfer") {
        var opts2 = [["main", "Main"]].concat(M.pots().map(function (p) { return [p.id, p.name]; }));
        var fromSel = select(opts2, potFrom, { "aria-label": "From" }), toSel = select(opts2, potTo, { "aria-label": "To" });
        fromSel.addEventListener("change", function () { potFrom = fromSel.value; });
        toSel.addEventListener("change", function () { potTo = toSel.value; });
        catHost.appendChild(el("div", { class: "k-mn-fromto" }, [field("From", fromSel), el("span", { class: "k-muted", "aria-hidden": "true", text: "→" }), field("To", toSel)]));
        catHost.appendChild(el("p", { class: "k-muted k-mn-small", text: "A transfer moves money into or out of a pot. No budget counts it." }));
        return;
      }
      var many = lines.length > 1;
      var lab = el("div", { class: "k-mn-fieldhead" }, [el("span", { class: "k-field-label", text: many ? "Categories · split" : "Category" }),
        many ? el("button", { type: "button", class: "k-link", text: "Undo split", onclick: function () { lines = [{ cat: lines[0].cat, minor: null }]; drawCats(); } }) : null].filter(Boolean));
      catHost.appendChild(lab);
      lines.forEach(function (ln, i) {
        var sel = select(catOptions(kind === "in" ? "in" : "out"), ln.cat, { "aria-label": "Category " + (i + 1) });
        sel.addEventListener("change", function () { ln.cat = sel.value; });
        var row = el("div", { class: "k-mn-catline" + (many ? "" : " k-mn-catline--one") }, [sel]);
        if (many) {
          var af = U.amountField({ value: ln.minor, label: "Amount for line " + (i + 1), onInput: function (v) { ln.minor = v; drawStatus(); } });
          row.appendChild(af.node);
          row.appendChild(el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Remove this line", text: "✕",
            onclick: function () { lines.splice(i, 1); drawCats(); } }));
        }
        catHost.appendChild(row);
      });
      catHost.appendChild(el("div", { class: "k-mn-splitbar" }, [
        el("button", { type: "button", class: "k-link", "data-ui": "money.split-add", text: "＋ Add a line", onclick: function () {
          if (lines.length === 1) lines[0].minor = amountF.value();
          lines.push({ cat: kind === "in" ? "other-in" : "other", minor: null }); drawCats();
        } }), status]));
      if (kind === "out") catHost.appendChild(el("label", { class: "k-mn-switchrow" }, [refundBox, el("span", { text: "This is a refund (money back into the category)" })]));
      drawStatus();
    }
    function leftToAssign() {
      var total = amountF.value() || 0;
      return total - lines.reduce(function (n, l) { return n + (l.minor || 0); }, 0);
    }
    function drawStatus() {
      status.textContent = "";
      if (lines.length < 2) return;
      var left = leftToAssign();
      if (left === 0) status.appendChild(el("span", { class: "k-mn-ok", text: "✓ All assigned" }));
      else status.appendChild(el("span", { class: "k-mn-warn" }, [amt(Math.abs(left), { size: "12-5" }), left > 0 ? " left to assign" : " too much assigned"]));
    }
    amountF.input.addEventListener("input", drawStatus);
    function draw() {
      body.textContent = "";
      body.appendChild(el("div", { class: "k-mn-edtype" }, [drawType()]));
      body.appendChild(field("Amount", amountF.node, "Type pounds and pence; a minus is not needed for Out."));
      body.appendChild(el("div", { class: "k-mn-two" }, [field("Date", dateIn), kind === "transfer" ? null : field("Payee", payeeIn)].filter(Boolean)));
      body.appendChild(catHost);
      drawCats();
      body.appendChild(el("div", { class: "k-mn-two" }, [field("Note", noteIn), field("Tags", tagsIn)]));
      body.appendChild(err);
    }
    draw();
    function save() {
      if (!amountF.validate()) { amountF.input.focus(); return; }
      var minor = amountF.value();
      var tags = tagsIn.value.split(/[\s,]+/).map(function (x) { return x.replace(/^#/, ""); }).filter(Boolean);
      var rec = { date: dateIn.value || today(), minor: minor, payee: payeeIn.value, note: noteIn.value, tags: tags };
      if (kind === "transfer") {
        if (potFrom === potTo) { err.hidden = false; err.textContent = "✕ Choose two different places"; return; }
        if (potFrom !== "main" && potTo !== "main") {
          /* between pots: two moves, out of one and into the other */
          M.addTx(Object.assign({}, rec, { kind: "transfer", pot: potFrom, dir: "out" }), function (e1) {
            if (e1) { err.hidden = false; err.textContent = "✕ " + e1.message; return; }
            M.addTx(Object.assign({}, rec, { kind: "transfer", pot: potTo, dir: "in" }), function (e2) { finish(e2, "Moved"); });
          });
          return;
        }
        rec.kind = "transfer"; rec.pot = potTo !== "main" ? potTo : potFrom; rec.dir = potTo !== "main" ? "in" : "out";
      } else {
        rec.kind = kind === "out" && refundBox.checked ? "refund" : kind;
        if (lines.length > 1) {
          if (leftToAssign() !== 0) { err.hidden = false; err.textContent = "✕ The lines must add up to the amount before it can be saved"; return; }
          rec.splits = lines.map(function (l) { return { cat: l.cat, minor: l.minor }; });
          rec.cat = lines[0].cat;
        } else { rec.cat = lines[0].cat; rec.splits = null; }
      }
      if (existing) M.updateTx(existing.syncId, rec, function (e) { finish(e, "Saved"); });
      else M.addTx(rec, function (e) { finish(e, "Saved"); });
      function finish(e, word) {
        if (e) { err.hidden = false; err.textContent = "✕ " + e.message; return; }
        ov.close();
        announce(word + " · " + (rec.payee || (kind === "transfer" ? "the move" : "the entry")) + (M.isHidden() ? "" : ", " + money(minor)));
        redraw();
      }
    }
    var foot = [existing && existing.src !== "wishlist" ? btn("Delete…", "k-btn--quiet k-mn-del", function () { ov.close(); deleteEntry(existing); }, "money.ed-delete") : el("span"),
      btn("Cancel", "", function () { ov.close(); }, "money.ed-cancel"),
      btn("Save", "k-btn--primary", save, "money.ed-save")];
    var ov = dialogBox(existing ? "Edit entry" : opts.duplicate ? "Duplicate entry" : "New entry", "円", [body], foot,
      { hook: "money.editor", cls: "k-mn-editor-dialog k-msheet--full", focus: amountF.input });
  }

  /* ---------------- an occurrence: confirm, a different amount, a new date ---------------- */
  function confirmOcc(r, date, amount, onDate) {
    M.confirm(r.id, date, { amount: amount == null ? null : amount / 100, date: onDate || null }, function (err, tx) {
      if (err) { U.toast(err.message, true); return; }
      var c = r.kind === "in" ? "received" : r.kind === "transfer" ? "set aside" : "confirmed";
      announce(r.name + " " + c + (M.isHidden() ? "" : ", " + money(tx.minor)) + (r.kind === "out" ? ", added to " + cat(r.cat).name : ""));
      redraw();
    });
  }
  function amountDialog(r, date, onDate) {
    var af = U.amountField({ value: M.amountOn(r, date), size: "lg", label: "Amount" });
    var ov = dialogBox(r.kind === "in" ? "Received a different amount" : "Confirm a different amount", "円",
      [el("p", { class: "k-soft", text: r.name + " · " + dayLabel(date) }), field("Amount", af.node)],
      [el("span"), btn("Cancel", "", function () { ov.close(); }),
        btn("Confirm", "k-btn--primary", function () { if (!af.validate()) return; ov.close(); confirmOcc(r, date, af.value(), onDate); })],
      { focus: af.input });
  }
  function moveDialog(r, date) {
    var d = input("date", today(), { "aria-label": "The day it arrived" });
    var ov = dialogBox("Move the date", "暦", [el("p", { class: "k-soft", text: r.name + " was expected " + dayLabel(date) + ". When did it land?" }), field("Arrived on", d)],
      [el("span"), btn("Cancel", "", function () { ov.close(); }),
        btn("Mark received", "k-btn--primary", function () { ov.close(); confirmOcc(r, date, null, d.value || today()); })], { focus: d });
  }

  /* ================= 27h · CSV import and export ================= */
  function importDialog() {
    var step = 0, parsed = null, mapping = null, dateFmt = "dmy", sign = "signed", pv = null, includeDup = {}, result = null, fileName = "";
    var body = el("div", { class: "k-mn-import" });
    var foot = el("div", { class: "k-dialog-foot" });
    var ov = dialogBox("Import a CSV", "入", [body], null, { hook: "money.import-dialog", cls: "k-mn-import-dialog k-msheet--full" });
    ov.querySelector(".k-dialog").appendChild(foot);
    function steps() {
      return el("ol", { class: "k-mn-steps", "aria-label": "Import steps" }, ["Choose a file", "Columns", "Preview", "Done"].map(function (t, i) {
        return el("li", { class: "k-mn-step", "data-state": i < step ? "done" : i === step ? "on" : null, "aria-current": i === step ? "step" : null }, [
          el("span", { class: "k-mn-step-n", text: i < step ? "✓" : String(i + 1) }), t]);
      }));
    }
    function draw() {
      body.textContent = ""; foot.textContent = "";
      body.appendChild(steps());
      if (step === 0) {
        var file = el("input", { type: "file", accept: ".csv,text/csv,text/plain", class: "k-mn-file", "aria-label": "Choose a CSV file" });
        var drop = el("div", { class: "k-mn-drop", "data-ui": "money.drop" }, [
          el("span", { class: "k-mn-drop-mark", lang: "ja", "aria-hidden": "true", text: "入" }),
          el("p", { text: "Drop a CSV here, or" }),
          btn("Choose a file", "k-btn--primary", function () { file.click(); }, "money.choose-file"), file]);
        file.addEventListener("change", function () { if (file.files[0]) read(file.files[0]); });
        drop.addEventListener("dragover", function (e) { e.preventDefault(); U.state(drop, "over", true); });
        drop.addEventListener("dragleave", function () { U.state(drop, "over", false); });
        drop.addEventListener("drop", function (e) { e.preventDefault(); U.state(drop, "over", false); if (e.dataTransfer.files[0]) read(e.dataTransfer.files[0]); });
        body.appendChild(drop);
        body.appendChild(el("p", { class: "k-muted k-mn-small", text: "Read on this device only. Most banking apps can export a statement as CSV." }));
        foot.appendChild(el("span"));
        foot.appendChild(btn("Cancel", "", function () { ov.close(); }));
      } else if (step === 1 || step === 2) {
        body.appendChild(el("div", { class: "k-mn-import-grid" }, [mapCard(), previewCard()]));
        foot.appendChild(btn("Choose another file", "k-btn--quiet", function () { step = 0; draw(); }));
        foot.appendChild(btn("Back", "", function () { step = 0; draw(); }));
        var n = pv ? pv.rows.filter(function (r) { return !r.duplicate || includeDup[r.line]; }).length : 0;
        foot.appendChild(btn("Import " + n + (n === 1 ? " entry" : " entries"), "k-btn--primary", doImport, "money.import-go", n ? {} : { disabled: "" }));
      } else if (step === 3) {
        body.appendChild(el("div", { class: "k-mn-result" }, [
          el("h3", { class: "k-mn-result-h", text: result.added ? "Imported " + result.added + (result.added === 1 ? " entry" : " entries") : "Nothing was imported" }),
          el("div", { class: "k-card-row" }, [el("span", { class: "k-mn-grow", text: "Imported" }), el("b", { class: "k-mono", text: String(result.added) })]),
          result.dups ? el("div", { class: "k-card-row" }, [el("span", { class: "k-mn-grow", text: "Skipped as duplicates" }), el("span", { class: "k-mono", text: String(result.dups) })]) : null,
          result.bad ? el("div", { class: "k-card-row k-mn-bad" }, [el("span", { class: "k-mn-grow", text: "✕ Not imported · could not be read" }), el("span", { class: "k-mono", text: String(result.bad) })]) : null
        ].filter(Boolean)));
        foot.appendChild(btn("Undo this import", "k-btn--quiet", function () {
          M.undoBatch(result.batch, function (e, n2) { ov.close(); announce("Import undone · " + n2 + " entries removed"); redraw(); });
        }, "money.import-undo"));
        foot.appendChild(btn("See them in Transactions", "k-btn--primary", function () { ov.close(); visit.tx.range = "all"; go("transactions"); }));
      }
    }
    function fail(msg) {
      body.textContent = "";
      body.appendChild(steps());
      body.appendChild(el("div", { class: "k-mn-fail", role: "alert" }, [el("span", { class: "k-mn-fail-mark", "aria-hidden": "true", text: "✕" }),
        el("div", {}, [el("b", { text: "This file could not be read" }), el("p", { text: msg + " Nothing was imported." })])]));
      foot.textContent = "";
      foot.appendChild(el("span"));
      foot.appendChild(btn("Choose another file", "k-btn--primary", function () { step = 0; draw(); }));
      if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce("This file could not be read.", "assertive");
    }
    function read(f) {
      fileName = f.name;
      var rd = new FileReader();
      rd.onload = function () {
        parsed = M.csv.parse(String(rd.result || ""));
        if (!parsed.rows.length) { fail("That file has no rows."); return; }
        mapping = M.csv.guess(parsed.header);
        if (mapping.date == null || (mapping.amount == null && mapping.out == null && mapping.in == null)) {
          fail("It has no header row with a date and an amount."); return;
        }
        sign = mapping.amount != null ? "signed" : "columns";
        dateFmt = detectDates();
        step = 1; preview();
      };
      rd.onerror = function () { fail("The browser could not open it."); };
      rd.readAsText(f);
    }
    function detectDates() {
      var col = mapping.date, dmy = false, mdy = false;
      parsed.rows.forEach(function (r) {
        var m2 = String(r[col] || "").match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-]/);
        if (m2 && +m2[1] > 12) dmy = true;
        if (m2 && +m2[2] > 12) mdy = true;
      });
      return /^\d{4}-/.test(String(parsed.rows[0][col] || "")) ? "iso" : mdy && !dmy ? "mdy" : "dmy";
    }
    function preview() {
      var m3 = Object.assign({}, mapping);
      if (sign === "signed") { delete m3.in; delete m3.out; } else delete m3.amount;
      M.csv.preview(parsed, m3, { dateFormat: dateFmt === "iso" ? "dmy" : dateFmt }, function (err, out) {
        pv = out; step = 2;
        announce(parsed.rows.length + " rows read. " + out.duplicates + " look like duplicates, " + out.errors.length + " cannot be read.");
        draw();
      });
    }
    function mapCard() {
      var opts = [["", "Leave out"], ["date", "Date"], ["payee", "Payee"], ["amount", "Amount"], ["out", "Money out"], ["in", "Money in"], ["note", "Note"]];
      var rows = parsed.header.map(function (h, i) {
        var cur = "";
        Object.keys(mapping).forEach(function (k) { if (mapping[k] === i) cur = k; });
        var sel = select(opts, cur, { "aria-label": "Column " + h, class: "k-input k-mn-mapsel" });
        sel.addEventListener("change", function () {
          Object.keys(mapping).forEach(function (k) { if (mapping[k] === i) delete mapping[k]; });
          if (sel.value) mapping[sel.value] = i;
          preview();
        });
        return el("div", { class: "k-mn-map" }, [el("span", { class: "k-mono k-ellipsis", text: h }), el("span", { class: "k-muted k-ellipsis", text: parsed.rows[0][i] || "" }),
          el("span", { class: "k-muted", "aria-hidden": "true", text: "→" }), sel]);
      });
      var dateSeg = seg([["dmy", "DD/MM/YYYY"], ["mdy", "MM/DD/YYYY"], ["iso", "YYYY-MM-DD"]], dateFmt, function (v) { dateFmt = v; preview(); }, "Dates are written", "k-seg--fill");
      var signSeg = seg([["signed", "One column, a minus is out"], ["columns", "Separate In and Out columns"]], sign, function (v) { sign = v; preview(); }, "Money in and out", "k-seg--fill k-mn-wrapseg");
      return card([head("Columns", "matched from the header row"), el("div", {}, rows),
        field("Dates are written", dateSeg, dateFmt === "dmy" ? "Day first, as UK banks write it." : null),
        field("Money in and out", signSeg),
        el("p", { class: "k-muted k-mn-small", text: "Imported entries go to Other (or Other income); change them afterwards with Set category." })], "k-mn-mapcard");
    }
    function previewCard() {
      var rows = [];
      (pv ? pv.rows : []).slice(0, 80).forEach(function (r) {
        var st = r.duplicate ? chip("≈ Already have", "amber") : chip("＋ New", "teal");
        var extra = r.duplicate ? el("div", { class: "k-mn-pvx" }, [el("span", { class: "k-muted", text: "matches an entry on " + shortDate(r.date) }),
          seg([["skip", "Skip"], ["take", "Import anyway"]], includeDup[r.line] ? "take" : "skip", function (v) { includeDup[r.line] = v === "take"; draw(); }, "Duplicate " + r.line)]) : null;
        rows.push(el("div", { class: "k-mn-pv" }, [st, el("span", { class: "k-mono k-muted", text: shortDate(r.date) }),
          el("span", { class: "k-ellipsis", text: r.payee || "(no payee)" }), amt(r.kind === "in" ? r.minor : -r.minor, { size: "13", plus: true, tone: r.kind === "in" ? "in" : null }), extra].filter(Boolean)));
      });
      (pv ? pv.errors : []).forEach(function (e) {
        rows.push(el("div", { class: "k-mn-pv" }, [chip("✕ Cannot read", "danger"), el("span", { class: "k-mono k-muted", text: "row " + e.line }),
          el("span", { class: "k-mn-bad", text: "Row " + e.line + ": " + e.reason.toLowerCase() + ". It will be left out." }), el("span")]));
      });
      var newN = pv ? pv.rows.filter(function (r) { return !r.duplicate; }).length : 0;
      return card([head("Preview", (parsed.rows.length) + " rows · " + newN + " new" + (pv && pv.duplicates ? " · " + pv.duplicates + " look like ones you have" : "") + (pv && pv.errors.length ? " · " + pv.errors.length + " cannot be read" : "")),
        el("div", { class: "k-mn-pvlist" }, rows),
        el("p", { class: "k-muted k-mn-small", text: "Duplicates match on date, amount and payee." })], "k-mn-pvcard");
    }
    function doImport() {
      var take = pv.rows.map(function (r) { return Object.assign({}, r, { duplicate: r.duplicate && !includeDup[r.line] }); });
      M.csv.import(take, {}, function (err, out) {
        if (err) { fail(err.message + "."); return; }
        result = { added: out.added, dups: out.skipped, bad: pv.errors.length, batch: out.batch };
        step = 3; announce("Imported " + out.added + " entries."); draw(); KOS.rerender();
      });
    }
    draw();
  }
  function download(name, text) {
    var blob = new Blob([text], { type: "text/csv" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }
  function exportDialog() {
    var what = "view";
    var holder = el("div");
    function drawSeg() { holder.textContent = ""; holder.appendChild(seg([["view", "This view"], ["all", "All entries"], ["month", "This month"]], what, function (v) { what = v; drawSeg(); }, "What to export", "k-seg--fill")); }
    drawSeg();
    var ov = dialogBox("Export CSV", "出", [field("What", holder),
      el("p", { class: "k-muted k-mn-small", text: "Columns: date (YYYY-MM-DD), type, amount, category, payee, note, tags, pot; split lines as extra rows. The file is written on this device." })],
      [el("span"), btn("Cancel", "", function () { ov.close(); }),
        btn("Download CSV", "k-btn--primary", function () {
          var r = what === "all" ? { from: null, to: null } : what === "month" ? M.periodRange(M.periodKey(today())) : txRange();
          M.csv.export(r.from, r.to, function (err, text) {
            if (err) { U.toast(err.message, true); return; }
            download("kurenai-money-" + today() + ".csv", text);
            ov.close(); announce("CSV downloaded");
          });
        }, "money.export-go")]);
  }
  function exportRows(rows) {
    var lines = ["Date,Type,Amount,Category,Payee,Note,Tags"];
    rows.forEach(function (t) {
      lines.push([t.date, t.kind, (t.minor / 100).toFixed(2), cat(t.cat).name, t.payee, t.note, t.tags.join(" ")].map(function (v) {
        v = String(v == null ? "" : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      }).join(","));
    });
    download("kurenai-money-selection-" + today() + ".csv", lines.join("\n") + "\n");
  }

  /* ================= 27d · Budgets ================= */
  function budgets(page) {
    var key = visit.budKey || M.periodKey(today()), r = M.periodRange(key), ms = M.data().monthStart;
    var meta = el("span", { class: "k-muted k-mn-small" });
    var nav = el("div", { class: "k-mn-monthnav", "data-ui": "money.bud-nav" }, [
      el("button", { type: "button", class: "k-iconbtn", "aria-label": "Earlier month", text: "‹", onclick: function () { visit.budKey = M.shiftKey(key, -1); redraw(); announce(monthLabel(visit.budKey)); } }),
      el("span", { class: "k-mn-monthname", text: monthLabel(key) }),
      el("button", { type: "button", class: "k-iconbtn", "aria-label": "Later month", text: "›", onclick: function () { visit.budKey = M.shiftKey(key, 1); redraw(); announce(monthLabel(visit.budKey)); } }),
      meta, el("span", { class: "k-mn-spacer" }),
      btn("＋ Add category", "k-btn--sm", function () { categoryDialog(null); }, "money.cat-add"),
      btn("Edit budgets", "k-btn--sm", function () { budgetsDialog(); }, "money.bud-edit")]);
    page.appendChild(nav);
    var list = el("div", { class: "k-mn-budlist" });
    var side = el("div", { class: "k-mn-side" });
    page.appendChild(el("div", { class: "k-mn-cols k-mn-cols--sm" }, [card([list], "k-mn-budcard", "money.budgets"), side]));
    M.summary(key, function (err, s) {
      if (err || !s) { failed(page); return; }
      var spent = 0, bud = 0, over = 0, idle = [];
      M.categories({ kind: "out" }).forEach(function (c) {
        var row = s.byCat[c.id] || {};
        var b = row.budget != null ? (row.effective != null ? row.effective : row.budget) : M.budgetOf(c);
        /* no budget and nothing spent: a supporting zero, folded into one line */
        if (b == null && !(row.net > 0)) { idle.push(c); return; }
        if (b != null) { bud += b; spent += Math.max(0, row.net || 0); }
        if (row.over) over++;
        list.appendChild(budRow(c, row, b, key));
        if (c.id === "collection" && row.modules && Object.keys(row.modules).length) {
          list.appendChild(el("div", { class: "k-mn-budsub" }, Object.keys(row.modules).map(function (m) {
            return el("div", { class: "k-mn-budsub-row", "data-tone": m }, [el("span", { class: "k-mn-medot", "data-medium": m, "aria-hidden": "true" }),
              el("span", { class: "k-soft", text: (KOS.wishlist && KOS.wishlist.MODULE_LABEL[m]) || m }), el("span", { class: "k-mn-spacer" }), amt(row.modules[m], { size: "12-5", w: "500" })]);
          })));
        }
      });
      if (idle.length) list.appendChild(el("div", { class: "k-mn-idle", "data-ui": "money.bud-idle" }, [
        el("span", { class: "k-muted k-mn-small", text: "Not budgeted: " + idle.map(function (c) { return c.name; }).join(", ") }),
        el("button", { type: "button", class: "k-link", text: "Set a budget", onclick: budgetsDialog })]));
      var pots = s.toPots - s.fromPots;
      if (pots) list.appendChild(el("div", { class: "k-mn-savings" }, [dot("jade"), el("span", { class: "k-mn-grow" }, ["Savings · ", amt(pots, { size: "13" }), " moved to pots this month"]),
        el("button", { type: "button", class: "k-link", text: "a transfer, not a budget · Pots →", onclick: function () { go("pots"); } })]));
      if (!s.count) list.insertBefore(el("p", { class: "k-muted k-mn-small k-mn-quiet", text: "Nothing spent in " + monthName(key) + " yet." }), list.firstChild);
      meta.textContent = bud ? (said(spent) ? said(spent) + " spent of " + said(bud) : "") + (over ? " · " + over + " over" : "") + (said(bud - spent) && bud > spent ? " · " + said(bud - spent) + " left across budgets" : "") : "No budgets set yet";
    });
    /* the side: the month start, rollover, archived */
    var payday = ms === 1 ? 28 : ms;
    var startSeg = seg([["1", "The 1st"], ["pay", "Payday · the " + payday + ordinal(payday)]], ms === 1 ? "1" : "pay", function (v) {
      M.setMonthStart(v === "1" ? 1 : payday); visit.budKey = null; announce(v === "1" ? "The month starts on the 1st" : "The month starts on the " + payday + ordinal(payday)); redraw();
    }, "The month starts on", "k-seg--fill");
    var dayPick = select(Array.from({ length: 28 }, function (_, i) { return [String(i + 1), String(i + 1) + ordinal(i + 1)]; }), String(payday), { "aria-label": "Payday", class: "k-input k-pill-select" });
    dayPick.addEventListener("change", function () { if (M.data().monthStart !== 1) { M.setMonthStart(+dayPick.value); visit.budKey = null; redraw(); } });
    var pr = M.periodRange(M.periodKey(today(), payday), payday);
    side.appendChild(card([head("The month starts on"), startSeg,
      el("div", { class: "k-mn-inline" }, [el("span", { class: "k-muted k-mn-small", text: "Payday is the" }), dayPick]),
      el("p", { class: "k-muted k-mn-small", text: (ms === 1 ? "On payday" : "Now") + " the month runs " + shortDate(pr.from) + " – " + shortDate(pr.to) + ", with " + Math.max(0, between(today(), pr.to) + 1) + " days left. Budgets, rollover, “safe to spend” and Reports all follow the choice; your entries do not move." })], "", "money.month-start"));
    side.appendChild(card([head("Rollover"), el("p", { class: "k-soft k-mn-small", text: "A category with rollover carries what was left, or what was over, into the next month." }),
      el("p", { class: "k-muted k-mn-small", text: "Overspend rolls as a smaller budget, never below " + money(0) + "." })], "", "money.rollover"));
    var archived = M.categories({ archived: true }).filter(function (c) { return c.archived; });
    if (archived.length) side.appendChild(card([head("Archived", archived.length + (archived.length === 1 ? " category" : " categories"))].concat(archived.map(function (c) {
      return el("div", { class: "k-card-row" }, [dot(c.tone), el("span", { class: "k-mn-grow", text: c.name }),
        btn("Restore", "k-btn--sm", function () { M.updateCategory(c.id, { archived: false }); announce(c.name + " restored"); redraw(); }, "money.cat-restore")]);
    })).concat([el("p", { class: "k-muted k-mn-small", text: "Archiving hides a category from budgets and pickers. Nothing is deleted." })]), "", "money.archived"));
  }
  function budRow(c, row, b, key) {
    var holder = el("div", { class: "k-mn-budrow", "data-ui": "money.bud-row" });
    var rollNote = c.budgetFrom === "wishlist" ? "The Wishlist reads this budget"
      : c.rollover ? (row.rollover ? "↻ " + (said(row.budget) ? said(row.budget) + (row.rollover >= 0 ? " + " : " − ") + said(Math.abs(row.rollover)) : "") + (row.rollover >= 0 ? " rolled over" : " overspend rolled") + " from " + monthName(M.shiftKey(key, -1)) : "↻ Rollover on")
      : "No rollover";
    function show() {
      holder.textContent = "";
      holder.appendChild(U.catBar({ name: c.name, tone: c.tone, spent: Math.max(0, row.net || 0), budget: b,
        sub: c.id === "collection" ? "Books · Games · VN" : null, onSet: edit }));
      holder.appendChild(el("span", { class: "k-mn-roll k-muted", "data-state": c.rollover || c.budgetFrom === "wishlist" ? null : "off", text: rollNote }));
      var more = U.menu({ label: "⋯", className: "k-btn--quiet k-mn-more-btn", items: [
        { label: "Edit budget", onSelect: edit },
        { label: "Rename", onSelect: function () { categoryDialog(c); } },
        { label: "Colour", onSelect: function () { categoryDialog(c); } },
        c.budgetFrom === "wishlist" ? null : { label: c.rollover ? "Turn rollover off" : "Turn rollover on", onSelect: function () {
          M.updateCategory(c.id, { rollover: !c.rollover }); announce(c.name + (c.rollover ? " rollover off" : " rollover on")); redraw(); } },
        { label: "See entries", onSelect: function () { visit.tx.cat = c.id; go("transactions"); } },
        c.id === "collection" || c.id === "other" ? null : { sep: true },
        c.id === "collection" || c.id === "other" ? null : { label: "Archive…", onSelect: function () {
          U.confirm({ title: "Archive " + c.name + "?", confirm: "Archive", mark: "▣",
            body: c.name + " leaves this month's budgets and the category pickers. Its entries keep their category and still appear in Transactions and Reports. Restore it from Archived at any time." },
            function () { M.updateCategory(c.id, { archived: true }); announce(c.name + " archived"); redraw(); });
        } }
      ].filter(Boolean) });
      more.setAttribute("aria-label", "More for " + c.name);
      holder.appendChild(more);
    }
    function edit() {
      holder.textContent = "";
      var af = U.amountField({ value: M.budgetOf(c), label: c.name + " budget" });
      var roll = el("input", { type: "checkbox", class: "k-switch", "aria-label": "Roll over what's left" });
      roll.checked = !!c.rollover;
      function save() {
        var v = af.input.value.trim() === "" ? null : af.value();
        M.setBudget(c.id, v == null ? null : v / 100);
        if (c.budgetFrom !== "wishlist") M.updateCategory(c.id, { rollover: roll.checked });
        announce(c.name + " budget " + (v == null ? "cleared" : (M.isHidden() ? "" : money(v) + ", ") + "saved"));
        redraw();
      }
      af.input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); save(); } if (e.key === "Escape") { e.stopPropagation(); show(); } });
      holder.appendChild(el("div", { class: "k-mn-budedit", "data-ui": "money.bud-edit-row" }, [
        el("span", { class: "k-muted k-mn-small", text: c.name + " budget" }), af.node,
        c.budgetFrom === "wishlist" ? el("span", { class: "k-muted k-mn-small", text: "The Wishlist's monthly limit" })
          : el("label", { class: "k-mn-switchrow" }, [roll, el("span", { text: "Roll over what's left" })]),
        el("span", { class: "k-mn-spacer" }),
        btn("Cancel", "k-btn--sm k-btn--quiet", show), btn("Save", "k-btn--sm k-btn--primary", save, "money.bud-save")]));
      af.input.focus();
    }
    show();
    return holder;
  }
  function budgetsDialog() {
    var rows = M.categories({ kind: "out" }).map(function (c) {
      var af = U.amountField({ value: M.budgetOf(c), label: c.name + " budget" });
      return { c: c, af: af, node: el("div", { class: "k-mn-budall" }, [dot(c.tone), el("span", { class: "k-mn-grow", text: c.name }), af.node]) };
    });
    var ov = dialogBox("Edit budgets", "円", [el("p", { class: "k-muted k-mn-small", text: "Leave a box empty for no budget. The Collection's is the Wishlist's monthly limit." }),
      el("div", { class: "k-mn-budall-list" }, rows.map(function (r) { return r.node; }))],
      [el("span"), btn("Cancel", "", function () { ov.close(); }), btn("Save budgets", "k-btn--primary", function () {
        rows.forEach(function (r) { var v = r.af.input.value.trim() === "" ? null : r.af.value(); M.setBudget(r.c.id, v == null ? null : v / 100); });
        ov.close(); announce("Budgets saved"); redraw();
      }, "money.bud-save-all")]);
  }
  function categoryDialog(c) {
    var name = input("text", c ? c.name : "", { maxlength: "60", placeholder: "Driving lessons" });
    var tone = c ? c.tone : "sage";
    var toneHost = el("div", { class: "k-mn-tones", role: "radiogroup", "aria-label": "Colour" });
    function drawTones() {
      toneHost.textContent = "";
      M.TONES.filter(function (t) { return t !== "green" && t !== "collection"; }).forEach(function (t) {
        toneHost.appendChild(el("button", { type: "button", class: "k-mn-tone", role: "radio", "data-cat-tone": t, "aria-checked": t === tone ? "true" : "false",
          "aria-label": t, onclick: function () { tone = t; drawTones(); } }));
      });
    }
    drawTones();
    var kindSeg = c ? null : seg([["out", "Spending"], ["in", "Income"]], "out", function (v) { kind = v; }, "Kind");
    var kind = c ? c.kind : "out";
    var af = c && c.kind === "in" ? null : U.amountField({ value: c ? M.budgetOf(c) : null, label: "Monthly budget" });
    var ov = dialogBox(c ? "Edit " + c.name : "Add a category", "円", [field("Name", name), kindSeg ? field("Kind", kindSeg) : null, field("Colour", toneHost),
      af && !(c && c.budgetFrom === "wishlist") ? field("Monthly budget · optional", af.node) : null].filter(Boolean),
      [el("span"), btn("Cancel", "", function () { ov.close(); }), btn(c ? "Save" : "Add category", "k-btn--primary", function () {
        if (!name.value.trim()) { name.focus(); return; }
        var v = af && af.input.value.trim() !== "" ? af.value() : null;
        if (c) { M.updateCategory(c.id, { name: name.value, tone: tone }); if (af && c.budgetFrom !== "wishlist") M.setBudget(c.id, v == null ? null : v / 100); }
        else M.addCategory({ name: name.value, tone: tone, kind: kind, group: kind === "in" ? "income" : "other", budget: v });
        ov.close(); announce((c ? "Saved · " : "Added · ") + name.value.trim()); redraw();
      }, "money.cat-save")], { focus: name });
  }

  /* ================= 27e · Recurring and Subscriptions ================= */
  function recurring(page) {
    var now = today();
    var rs = M.rules();
    if (!rs.length && !visit.ruleEdit) {
      page.appendChild(U.emptyState({ mark: "↻", title: "No recurring payments yet",
        body: "A rule makes each occurrence for you to confirm or skip: a subscription, the bus pass, your pay.",
        action: el("div", { class: "k-mn-actions" }, [btn("Add a rule", "k-btn--primary", function () { visit.ruleEdit = "new"; redraw(); }, "money.rule-add")]) }));
      return;
    }
    var mainCol = el("div", { class: "k-mn-stack" });
    var side = el("div", { class: "k-mn-side" });
    page.appendChild(el("div", { class: "k-mn-cols" }, [mainCol, side]));
    /* due occurrences: passed or today, not confirmed or skipped, this month or last */
    var due = M.upcoming(addDays(now, -14), now, now).filter(function (o) { return o.state === "due" && !visit.left[o.rule + ":" + o.date] && !o.trial; });
    due.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    var seen = {};
    due.filter(function (o) { if (seen[o.rule]) return false; seen[o.rule] = true; return true; }).slice(0, 3).forEach(function (o) { mainCol.appendChild(dueCard(o, now)); });
    mainCol.appendChild(rulesCard(rs, now));
    side.appendChild(ruleEditor(visit.ruleEdit && visit.ruleEdit !== "new" ? M.rule(visit.ruleEdit) : null));
  }
  function dueCard(o, now) {
    var r = M.rule(o.rule), c = cat(r.cat);
    var occ = M.occurrences(r, addDays(o.date, -40), addDays(o.date, 40));
    var at = occ.indexOf(o.date), strip = occ.slice(Math.max(0, at - 3), at + 2);
    var stateWord = { done: "✓ Confirmed", skip: "— Skipped", due: "● Due", upcoming: "○ Upcoming" };
    var noteHost = el("div");
    var otherHost = el("div");
    var whenWord = o.date === now ? "Due today" : "Due · " + between(o.date, now) + (between(o.date, now) === 1 ? " day ago" : " days ago");
    var node = card([
      el("div", { class: "k-mn-duehead" }, [tile("↻", r.kind === "transfer" ? "jade" : c.tone), el("div", { class: "k-mn-grow" }, [kicker(whenWord),
        el("div", { class: "k-mn-duetitle" }, [r.name + " · ", amt(o.minor, { size: "18" })]),
        el("div", { class: "k-muted k-mn-small", text: cap(everyLabel(r)) + " · " + (r.kind === "transfer" ? (M.pot(r.pot) ? M.pot(r.pot).name + " pot" : "a pot") : r.kind === "in" ? "Income" : c.name) })])]),
      el("ol", { class: "k-mn-occ", "aria-label": "Occurrences" }, strip.map(function (d) {
        var st = M.occurrenceState(r, d, now), m = r.marks[d];
        return el("li", { class: "k-mn-occ-i", "data-state": d === o.date ? "current" : null }, [
          el("span", { class: "k-mono k-muted k-mn-tiny", text: dayLabel(d) }),
          chip(d === o.date ? (o.date === now ? "● Due today" : "● Due") : (st === "done" && m && m.changed ? "✓ Confirmed · changed" : stateWord[st]),
            st === "done" ? "green" : d === o.date ? "crimson" : "muted"),
          st === "skip" ? el("span", { class: "k-muted k-mn-tiny", text: "no entry" }) : amt(st === "done" && m && m.minor ? m.minor : M.amountOn(r, d), { size: "12-5", w: "500" })]);
      })),
      otherHost,
      el("div", { class: "k-mn-actions" }, [
        btn((r.kind === "in" ? "Received " : "Confirm ") + said(o.minor), "k-btn--primary", function () { confirmOcc(r, o.date, null); }, "money.occ-confirm"),
        btn(r.kind === "in" ? "Received a different amount" : "Confirm a different amount", "", function () {
          otherHost.textContent = "";
          var af = U.amountField({ value: o.minor, label: "Amount" });
          otherHost.appendChild(el("div", { class: "k-mn-inline" }, [af.node, btn("Confirm", "k-btn--sm k-btn--primary", function () { if (af.validate()) confirmOcc(r, o.date, af.value()); })]));
          af.input.focus();
        }, "money.occ-other"),
        btn("Skip this one", "", function () {
          M.skip(r.id, o.date, function () { announce("Skipped · " + r.name + ", " + shortDate(o.date)); redraw(); });
        }, "money.occ-skip"),
        btn("Leave it upcoming", "k-btn--quiet", function () { visit.left[r.id + ":" + o.date] = true; redraw(); }, "money.occ-leave")]),
      noteHost
    ], "k-mn-due", "money.due");
    if (r.kind === "out" && r.cat) {
      M.summary(M.periodKey(o.date), function (err, s) {
        var row = s && s.byCat[r.cat];
        if (row && row.budget != null && row.net + o.minor > (row.effective != null ? row.effective : row.budget)) {
          noteHost.appendChild(el("p", { class: "k-mn-warn k-mn-small" }, ["◷ Confirming takes " + c.name + " to ", amt(row.net + o.minor, { size: "12" }), " of ", amt(row.effective != null ? row.effective : row.budget, { size: "12" }), "."]));
        }
      });
    }
    return node;
  }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function rulesCard(rs, now) {
    var f = visit.recFilter;
    var counts = { all: rs.length, subs: rs.filter(function (r) { return r.sub; }).length, income: rs.filter(function (r) { return r.kind === "in"; }).length,
      aside: rs.filter(function (r) { return r.kind === "transfer"; }).length };
    var shown = rs.filter(function (r) { return f === "all" || (f === "subs" && r.sub) || (f === "income" && r.kind === "in") || (f === "aside" && r.kind === "transfer"); });
    var filt = seg([["all", "All rules", counts.all], ["subs", "Subscriptions", counts.subs], ["income", "Income", counts.income], ["aside", "Set-asides", counts.aside]]
      .filter(function (x) { return x[0] === "all" || x[2]; }), f, function (v) { visit.recFilter = v; redraw(); }, "Which rules", "k-mn-rulefilt", true);
    var rows = shown.map(function (r) {
      var next = M.occurrences(r, now, addDays(now, 800))[0];
      var trial = M.inTrial(r, now), change = M.priceChange(r);
      var sub = null, subTone = null;
      if (change && change.now > change.was && between(change.from, now) < 45) { sub = "▲ Up from " + (said(change.was) || "before") + " in " + MONTHS[parse(change.from).getMonth()] + (said((change.now - change.was) * 12) ? " · " + said((change.now - change.was) * (r.every.unit === "month" ? 12 : 1)) + " more a year" : ""); subTone = "amber"; }
      else if (r.every.unit === "year") sub = "A yearly cost, shown as " + (said(M.perMonth(r)) || "a share") + " a month";
      else { var last = Object.keys(r.marks).filter(function (d) { return r.marks[d].s === "done"; }).sort().pop(); if (last) sub = "Last confirmed " + shortDate(last); }
      var reminder = r.remind && KOS.reminders ? KOS.reminders.get(r.remind) : null;
      var trialBits = trial ? el("div", { class: "k-mn-inline" }, [
        reminder ? btn("✓ Reminder set · " + dayLabel(reminder.due) + (reminder.dueTime ? " " + reminder.dueTime : ""), "k-btn--sm", function () { KOS.show("reminders"); }, "money.reminder-open")
          : btn("Remind me", "k-btn--sm", function () { remindDialog(r); }, "money.remind"),
        reminder ? el("span", { class: "k-muted k-mn-small", text: "in Reminders" }) : null].filter(Boolean)) : null;
      return el("div", { class: "k-mn-rule", "data-ui": "money.rule-row", tabindex: "0", role: "button", "aria-label": "Edit " + r.name,
        "data-state": visit.ruleEdit === r.id ? "selected" : null,
        onclick: function (e) { if (e.target.closest("button")) return; visit.ruleEdit = r.id; redraw(); },
        onkeydown: function (e) { if (e.key === "Enter" && e.target === this) { visit.ruleEdit = r.id; redraw(); } } }, [
        el("div", { class: "k-mn-rule-name" }, [el("div", { class: "k-mn-inline" }, [el("span", { class: "k-mn-strong", text: r.name }),
          trial ? chip("◷ Cancel before " + shortDate(r.trialEnd), "amber") : null,
          r.kind === "in" ? chip("Income", "green") : r.kind === "transfer" ? chip("⇄ Set-aside", "muted") : null].filter(Boolean)),
          sub ? el("div", { class: "k-mn-small", "data-tone": subTone, text: sub }) : null, trialBits].filter(Boolean)),
        el("span", { class: "k-soft k-mn-small", text: trial ? "Free trial" : cap(everyLabel(r)) }),
        el("span", { class: "k-mono k-soft k-mn-small", text: trial ? dayLabel(r.trialEnd) : next ? dayLabel(next) + (next.slice(0, 4) !== now.slice(0, 4) ? " " + next.slice(0, 4) : "") : "Ended" }),
        el("div", { class: "k-mn-right" }, [trial ? el("span", { class: "k-muted k-mn-small" }, ["then ", amt(r.minor, { size: "12" })]) : amt(M.perMonth(r), { tone: r.kind === "in" ? "in" : null })]),
        el("div", { class: "k-mn-right" }, [trial ? null : amt(M.perYear(r), { w: "500", tone: "muted" })].filter(Boolean))]);
    });
    var subs = M.subscriptions(now);
    var total = f === "subs" ? el("div", { class: "k-mn-rule k-mn-rule--total" }, [el("span", { class: "k-mn-strong", text: "Total · " + subs.paid.length + " paid" + (subs.trials.length ? ", " + subs.trials.length + (subs.trials.length === 1 ? " trial" : " trials") : "") }),
      el("span"), el("span"), el("div", { class: "k-mn-right" }, [amt(subs.perMonth)]), el("div", { class: "k-mn-right" }, [amt(subs.perYear)])]) : null;
    return card([el("div", { class: "k-mn-rulehead" }, [el("h2", { class: "k-card-title", text: f === "subs" ? "Subscriptions" : f === "income" ? "Income" : f === "aside" ? "Set-asides" : "Rules" }),
      el("span", { class: "k-mn-spacer" }), filt, btn("＋ New rule", "k-btn--sm", function () { visit.ruleEdit = "new"; redraw(); }, "money.rule-new")]),
      el("div", { class: "k-mn-rule k-mn-rule--cols", "aria-hidden": "true" }, [el("span", { text: "Name" }), el("span", { text: "Repeats" }), el("span", { text: "Next" }),
        el("span", { class: "k-mn-right", text: "A month" }), el("span", { class: "k-mn-right", text: "A year" })]),
      el("div", { role: "list" }, rows), total].filter(Boolean), "k-mn-rules", "money.rules");
  }
  function remindDialog(r) {
    var when = input("date", r.trialEnd || today(), { "aria-label": "When" });
    var time = input("time", "09:00", { "aria-label": "Time" });
    var ov = dialogBox("Remind me", "祝", [el("p", { class: "k-soft k-mn-small", text: "Makes a real reminder in Reminders, named for the trial, so it rings and can be ticked there." }),
      el("div", { class: "k-mn-two" }, [field("On", when), field("At", time)])],
      [el("span"), btn("Cancel", "", function () { ov.close(); }), btn("Make the reminder", "k-btn--primary", function () {
        var rem = KOS.reminders.add({ title: r.name + ": cancel the free trial before " + dayLabel(r.trialEnd || when.value), due: when.value, dueTime: time.value || "09:00", tags: ["money"] });
        if (rem) M.updateRule(r.id, { remind: rem.id });
        ov.close(); announce("Reminder made · " + r.name + ", " + dayLabel(when.value) + " " + (time.value || "09:00")); redraw();
      }, "money.remind-go")], { focus: when });
  }
  /* the rule editor: one record, its occurrences computed */
  function ruleEditor(r) {
    var isNew = !r;
    var d = r || { name: "", minor: null, kind: "out", cat: "subscriptions", every: { n: 1, unit: "month" }, start: today(), end: null, count: null, sub: false, trialEnd: null, dom: parse(today()).getDate(), pot: null };
    var kind = d.kind, unit = d.every.unit, ends = d.count ? "count" : d.end ? "date" : "never";
    var name = input("text", d.name, { maxlength: "80", placeholder: "Bus pass", "aria-label": "Name" });
    var af = U.amountField({ value: d.minor, label: "Amount" });
    var nIn = input("number", String(d.every.n), { min: "1", max: "365", "aria-label": "Every how many", class: "k-input k-mn-num" });
    var domIn = input("number", String(d.dom || parse(d.start).getDate()), { min: "1", max: "31", "aria-label": "Day of the month", class: "k-input k-mn-num" });
    var startIn = input("date", d.start, { "aria-label": "Starts" });
    var endIn = input("date", d.end || "", { "aria-label": "End date" });
    var countIn = input("number", String(d.count || 6), { min: "1", max: "999", "aria-label": "How many times", class: "k-input k-mn-num" });
    var subBox = el("input", { type: "checkbox", class: "k-switch", "aria-label": "This is a subscription" });
    subBox.checked = !!d.sub;
    var trialIn = input("date", d.trialEnd || "", { "aria-label": "Free trial ends" });
    var catSel = select(catOptions("out"), d.cat, { "aria-label": "Category" });
    var inSel = select(catOptions("in"), d.kind === "in" ? d.cat : "job", { "aria-label": "Income category" });
    var potSel = select(M.pots().map(function (p) { return [p.id, p.name]; }), d.pot || (M.pots()[0] || {}).id, { "aria-label": "Pot" });
    var err = el("p", { class: "k-field-error", role: "alert", hidden: "" });
    var preview = el("div", { class: "k-mn-preview", "data-ui": "money.rule-preview" });
    var host = el("div", { class: "k-mn-ruleform" });
    function rec() {
      var start = startIn.value || today();
      if (unit === "week") {
        /* a weekly rule falls on its start's weekday */
      }
      return { name: name.value, minor: af.value(), kind: kind, cat: kind === "in" ? inSel.value : kind === "out" ? catSel.value : null, pot: kind === "transfer" ? potSel.value : null,
        every: { n: +nIn.value || 1, unit: unit }, start: start, end: ends === "date" ? endIn.value || null : null, count: ends === "count" ? +countIn.value || null : null,
        dom: unit === "month" || unit === "year" ? +domIn.value || null : null, sub: kind === "out" && subBox.checked, trialEnd: kind === "out" && subBox.checked ? trialIn.value || null : null };
    }
    function drawPreview() {
      preview.textContent = "";
      var x = rec();
      if (!x.minor) x.minor = 1;
      if (!(x.every.n >= 1)) { preview.appendChild(el("span", { class: "k-field-error", text: "✕ At least 1" })); return; }
      if (x.end && x.end < x.start) { preview.appendChild(el("span", { class: "k-field-error", text: "✕ The end is before the start" })); return; }
      var tmp = M.normaliseRule(Object.assign({ id: "preview" }, x));
      var next = tmp ? M.occurrences(tmp, today(), addDays(today(), 800)).slice(0, 4) : [];
      var dom = +domIn.value;
      preview.appendChild(el("span", {}, ["Next: ", el("span", { class: "k-mono", text: next.length ? next.map(dayLabel).join(" · ") : "none" })]));
      if ((unit === "month" || unit === "year") && dom > 28) preview.appendChild(el("span", { class: "k-muted k-mn-small", text: " In a shorter month, its last day." }));
    }
    function draw() {
      host.textContent = "";
      host.appendChild(field("This is", seg([["out", "A payment"], ["in", "Income"], ["transfer", "A set-aside"]], kind, function (v) { kind = v; draw(); }, "Kind", "k-seg--fill")));
      host.appendChild(el("div", { class: "k-mn-two k-mn-two--rule" }, [field("Name", name), field("Amount", af.node)]));
      if (kind === "out") host.appendChild(field("Category", catSel));
      if (kind === "in") host.appendChild(field("Category", inSel));
      if (kind === "transfer") host.appendChild(M.pots().length ? field("Into the pot", potSel) : el("p", { class: "k-muted k-mn-small", text: "Make a pot first, in Pots." }));
      host.appendChild(field("Repeats", el("div", { class: "k-mn-inline" }, [el("span", { class: "k-soft k-mn-small", text: "Every" }), nIn,
        seg([["day", "days"], ["week", "weeks"], ["month", "months"], ["year", "years"]], unit, function (v) { unit = v; draw(); }, "Unit")])));
      if (unit === "month" || unit === "year") host.appendChild(field("On day", el("div", { class: "k-mn-inline" }, [domIn, el("span", { class: "k-muted k-mn-small", text: "of the month · in a shorter month, its last day" })])));
      if (unit === "week") host.appendChild(el("p", { class: "k-muted k-mn-small", text: "It falls on the weekday it starts: " + DAYS[parse(startIn.value || today()).getDay()] + "." }));
      host.appendChild(field("Starts", startIn));
      host.appendChild(field("Ends", seg([["never", "Never"], ["date", "On a date"], ["count", "After N times"]], ends, function (v) { ends = v; draw(); }, "Ends", "k-seg--fill")));
      if (ends === "date") host.appendChild(field("End date", endIn));
      if (ends === "count") host.appendChild(field("How many times", countIn));
      if (kind === "out") {
        host.appendChild(el("label", { class: "k-mn-switchrow" }, [subBox, el("span", { class: "k-mn-grow", text: "This is a subscription" }), el("span", { class: "k-muted k-mn-small", text: "lists it in Subscriptions" })]));
        if (subBox.checked) host.appendChild(field("Free trial ends · optional", trialIn, "Until then it is listed, not counted."));
      }
      host.appendChild(preview);
      host.appendChild(err);
      drawPreview();
    }
    [nIn, domIn, startIn, endIn, countIn].forEach(function (n) { n.addEventListener("input", drawPreview); });
    subBox.addEventListener("change", draw);
    startIn.addEventListener("change", draw);
    draw();
    function save() {
      if (!name.value.trim()) { err.hidden = false; err.textContent = "✕ Give the rule a name"; name.focus(); return; }
      if (!af.validate()) return;
      var x = rec();
      if (x.end && x.end < x.start) { err.hidden = false; err.textContent = "✕ The end is before the start"; return; }
      if (kind === "transfer" && !x.pot) { err.hidden = false; err.textContent = "✕ Choose a pot"; return; }
      var saved = isNew ? M.addRule(x) : M.updateRule(r.id, x);
      if (!saved) { err.hidden = false; err.textContent = "✕ That rule could not be saved"; return; }
      visit.ruleEdit = saved.id;
      announce("Saved · " + saved.name);
      redraw();
    }
    return card([head(isNew ? "New rule" : "Edit rule", isNew ? null : r.name), host,
      el("div", { class: "k-mn-actions" }, [
        isNew ? null : btn("Delete rule…", "k-btn--sm k-btn--quiet k-mn-del", function () {
          U.confirm({ title: "Delete " + r.name + "?", danger: true, confirm: "Delete",
            body: "The rule stops making occurrences. Entries it already made stay, because they happened." }, function () {
            M.removeRule(r.id); visit.ruleEdit = null; announce("Rule deleted · " + r.name); redraw();
          });
        }, "money.rule-delete"),
        el("span", { class: "k-mn-spacer" }),
        btn("Cancel", "k-btn--sm", function () { visit.ruleEdit = null; redraw(); }),
        btn("Save rule", "k-btn--sm k-btn--primary", save, "money.rule-save")].filter(Boolean))], "k-mn-ruleeditor", "money.rule-editor");
  }

  /* ================= 27f · Pots ================= */
  function pots(page) {
    var ps = M.pots();
    M.potBalances(function (err, bal) {
      bal = bal || {};
      if (!ps.length) {
        page.appendChild(el("p", { class: "k-soft", text: "Pots hold money set aside for something: a laptop, exam fees, a holiday." }));
        page.appendChild(el("div", { class: "k-mn-potgrid" }, [newPotTile()]));
        return;
      }
      /* the hero: the pinned pot, else the one nearest its date with a target */
      var heroPot = ps.filter(function (p) { return p.pinned; })[0] ||
        ps.filter(function (p) { return p.target && p.by && (bal[p.id] || 0) < p.target; }).sort(function (a, b) { return a.by < b.by ? -1 : 1; })[0] || ps[0];
      page.appendChild(potHero(heroPot, bal[heroPot.id] || 0));
      var others = ps.filter(function (p) { return p !== heroPot; });
      page.appendChild(el("div", { class: "k-mn-potgrid" }, others.map(function (p) { return potCard(p, bal[p.id] || 0); }).concat([newPotTile()])));
      var movesHost = el("div");
      page.appendChild(el("div", { class: "k-mn-cols" }, [movesHost, moveForm(ps, bal)]));
      M.list({ kind: "transfer", limit: 8 }, function (e, rows) {
        movesHost.appendChild(card([head("Recent moves", "transfers, never spend", ["Transactions →", function () { visit.tx.kind = ""; go("transactions"); }]),
          (rows || []).length ? el("div", {}, rows.map(function (t) {
            var p = M.pot(t.pot);
            return el("div", { class: "k-card-row" }, [el("span", { class: "k-mono k-muted k-mn-small k-mn-day-label", text: shortDate(t.date) }), chip("⇄", "muted"),
              el("span", { class: "k-mn-grow k-ellipsis" }, [el("b", { class: "k-mn-strong", text: p ? p.name : "A pot" }), el("span", { class: "k-muted", text: " · " + (t.src === "rule" ? "Set-aside" : t.dir === "out" ? "Moved out" : "Top-up") })]),
              amt(t.dir === "out" ? -t.minor : t.minor, { plus: true, w: "500" })]);
          })) : el("p", { class: "k-muted k-mn-small", text: "No moves yet." })], "", "money.moves"));
      });
    });
  }
  function potPicture(p, cls, aspect) {
    var host = el("div", { class: cls });
    M.getPic(p.id, function (pic) {
      var slot = U.pictureSlot({ pic: pic, title: "Picture for " + p.name, aspect: aspect, label: pic || cls !== "k-mn-pothero-pic" ? null : "your picture · drop one here",
        save: function (v) { M.setPic(p.id, v, function () { announce(v ? "Picture saved" : "Picture removed"); redraw(); }); } });
      slot.setAttribute("data-cat-tone", "jade");
      host.appendChild(slot);
    });
    return host;
  }
  function potHero(p, bal) {
    var now = today(), left = p.target ? Math.max(0, p.target - bal) : null;
    var rule = M.rules().filter(function (r) { return r.kind === "transfer" && r.pot === p.id; })[0];
    var each = rule ? M.amountOn(rule, now) : (p.target && p.by ? M.setAside(p, bal, now) : null);
    var next = rule ? M.occurrences(rule, now, addDays(now, 400)).filter(function (d) { return M.occurrenceState(rule, d, now) !== "done"; })[0] : null;
    var goal = KOS.goals ? KOS.goals.all().filter(function (g) { return g.type === "money-save" && g.links && g.links.pot === p.id && !g.archived; })[0] : null;
    var days = p.by ? between(now, p.by) : null;
    var reached = p.target && bal >= p.target;
    var mid = el("div", { class: "k-mn-pothero-mid" }, [
      el("span", { class: "k-mn-saving", text: reached ? "✓ TARGET REACHED" : "◆ SAVING FOR" }),
      el("h2", { class: "k-mn-potname", text: p.name }),
      p.why ? el("p", { class: "k-mn-why", text: "“" + p.why + "”" }) : null,
      el("div", { class: "k-mn-pot-fig" }, [amt(bal, { size: "52" }), p.target ? el("span", { class: "k-soft" }, ["of ", amt(p.target, { size: "14", w: "500" })]) : null].filter(Boolean)),
      left ? el("p", { class: "k-soft" }, [amt(left, { size: "13-5" }), " to go", next && each ? el("span", {}, [" · the next ", amt(each, { size: "13-5", w: "500" }), " goes in on " + dayLabel(next)]) : null].filter(Boolean))
        : reached ? el("p", { class: "k-mn-ok", text: "Spend from it when you buy it, or close the pot." }) : null,
      days != null && !reached ? (days >= 0
        ? el("div", { class: "k-mn-count" }, [el("span", { class: "k-mn-count-n", text: String(days) }), el("span", { class: "k-soft", text: (days === 1 ? "day" : "days") + " · until " + longDate(p.by) + " " + p.by.slice(0, 4) })])
        : el("div", { class: "k-mn-count", "data-state": "late" }, [el("span", { class: "k-mn-count-n", text: "✕ " + (-days) }), el("span", { text: (-days === 1 ? "day" : "days") + " past the date" })])) : null,
      el("span", { class: "k-mn-spacer" }),
      el("div", { class: "k-mn-actions" }, [
        btn("Move in", "k-btn--primary", function () { moveDialog2(p, "in"); }, "money.pot-in"),
        btn("Move out", "", function () { moveDialog2(p, "out"); }, "money.pot-out"),
        btn("Edit", "k-btn--quiet", function () { potDialog(p); }, "money.pot-edit"),
        goal ? el("button", { type: "button", class: "k-mn-goalpill", "data-ui": "money.pot-goal", onclick: function () { KOS.show("goals", { id: goal.id }); } }, [
          el("span", { class: "k-kanji k-muted", "aria-hidden": "true", text: "標" }), goal.title]) : null].filter(Boolean))
    ].filter(Boolean));
    if (goal) KOS.goals.compute(function (e, rows) {
      var g = (rows || []).filter(function (x) { return x.id === goal.id; })[0];
      var pill = mid.querySelector('[data-ui~="money.pot-goal"]');
      if (g && pill && g._pace) pill.appendChild(U.paceChip(g._pace));
    }, { archived: false });
    return el("section", { class: "k-mn-pothero", "data-ui": "money.pot-hero", "aria-label": p.name }, [
      el("span", { class: "k-mn-pothero-mark", lang: "ja", "aria-hidden": "true", text: "貯" }),
      potPicture(p, "k-mn-pothero-pic", 240 / 300), mid, timeline(p, bal, rule)]);
  }
  function timeline(p, bal, rule) {
    var now = today(), nodes = [];
    var moves = [];
    var host = el("div", { class: "k-mn-plan", "data-ui": "money.plan" });
    M.range("0000-01-01", now, function (err, rows) {
      (rows || []).filter(function (t) { return t.kind === "transfer" && t.pot === p.id; }).forEach(function (t) {
        moves.push([t.date, t.src === "rule" ? "Set-aside" : t.dir === "out" ? "Moved out" : "Top-up", t.dir === "out" ? -t.minor : t.minor, "done"]);
      });
      moves.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
      if (moves.length) moves[0][1] = moves[0][1] === "Set-aside" ? "First set-aside" : moves[0][1];
      nodes = moves.slice(-4).map(function (m) { return { date: m[0], label: m[1], amount: m[2], k: "done" }; });
      nodes.push({ date: now, label: "In the pot", amount: bal, k: "now" });
      var run = bal, reach = null;
      if (rule && p.target) {
        M.occurrences(rule, addDays(now, 1), p.by || addDays(now, 730)).slice(0, 12).forEach(function (d) {
          if (run >= p.target) return;
          run += M.amountOn(rule, d);
          if (run >= p.target && !reach) { reach = d; nodes.push({ date: d, label: "Reaches the target", amount: run, k: "plan" }); }
          else nodes.push({ date: d, label: "Set-aside", amount: run, k: "plan" });
        });
      }
      if (p.by) nodes.push({ date: p.by, label: "The date", amount: null, k: "end" });
      var each = rule ? M.amountOn(rule, now) : null;
      host.appendChild(el("div", { class: "k-mn-plan-head" }, [el("span", { class: "k-mn-strong", text: "The plan" }),
        each ? el("span", { class: "k-muted k-mn-small" }, [amt(each, { size: "12", w: "500" }), " on the " + rule.dom + ordinal(rule.dom)]) : null].filter(Boolean)));
      host.appendChild(el("ol", { class: "k-mn-plan-list" }, nodes.map(function (n) {
        return el("li", { class: "k-mn-node", "data-k": n.k }, [el("span", { class: "k-mn-node-dot", "aria-hidden": "true" }),
          el("span", { class: "k-mono k-mn-node-date", text: n.k === "now" ? "Today" : shortDate(n.date) }),
          el("span", { class: "k-mn-node-label k-ellipsis", text: n.label }),
          n.amount == null ? el("span") : n.k === "plan" ? el("span", { class: "k-muted k-mn-small" }, ["→ ", amt(n.amount, { size: "11-5", w: "500", tone: "muted" })])
            : amt(n.amount, { size: "12-5", w: n.k === "now" ? null : "500", plus: n.k === "done" })]);
      })));
      var msg = !p.target ? "No target set." : !p.by ? "No date set, so no plan." : reach ? (reach <= p.by ? "At this rate it reaches " + (said(p.target) || "the target") + " on " + shortDate(reach) + (between(reach, p.by) >= 28 ? ", a month before the date." : ", before the date.") : "")
        : rule ? "The set-asides do not reach it by the date." : "Set aside " + (said(M.setAside(p, bal, now)) || "a little") + " a month to get there.";
      if (msg) host.appendChild(el("p", { class: "k-muted k-mn-small", text: msg }));
    });
    return host;
  }
  function potCard(p, bal) {
    var now = today(), days = p.by ? between(now, p.by) : null, reached = p.target && bal >= p.target;
    var rule = M.rules().filter(function (r) { return r.kind === "transfer" && r.pot === p.id; })[0];
    var each = p.target && p.by ? M.setAside(p, bal, now) : null;
    var more = U.menu({ label: "⋯", className: "k-btn--quiet k-mn-potmore", items: [
      { label: "Edit", onSelect: function () { potDialog(p); } },
      { label: "Lead with this pot", onSelect: function () { M.pots({ archived: true }).forEach(function (x) { if (x.pinned) M.updatePot(x.id, { pinned: false }); }); M.updatePot(p.id, { pinned: true }); redraw(); } },
      { sep: true },
      { label: "Close pot…", onSelect: function () { closePot(p, bal); } }] });
    more.setAttribute("aria-label", "More for " + p.name);
    return el("article", { class: "k-mn-potcard", "data-ui": "money.pot-card" }, [
      el("div", { class: "k-mn-potband" }, [potPicture(p, "k-mn-potband-pic", 300 / 124), more]),
      el("div", { class: "k-mn-potbody" }, [
        el("div", { class: "k-mn-inline" }, [el("h3", { class: "k-mn-potcard-name", text: p.name }), days != null && days >= 0 && !reached ? el("span", { class: "k-mono k-soft k-mn-small", text: days + (days === 1 ? " day" : " days") }) : null].filter(Boolean)),
        el("div", { class: "k-mn-pot-fig k-mn-pot-fig--sm" }, [amt(bal, { size: "28" }), p.target ? el("span", { class: "k-muted" }, ["of ", amt(p.target, { size: "13", w: "500", tone: "muted" })]) : null].filter(Boolean)),
        reached ? el("p", { class: "k-mn-ok k-mn-small", text: "✓ Target reached" }) : el("p", { class: "k-soft k-mn-small", text: p.by ? "by " + dayLabel(p.by) : "No date set" }),
        !reached && each ? el("p", { class: "k-muted k-mn-small" }, [amt(rule ? M.amountOn(rule, now) : each, { size: "12", w: "500" }), rule ? " a month · " : " a month would get there", rule ? el("span", {}, [amt(p.target - bal, { size: "12", w: "500" }), " to go"]) : null].filter(Boolean)) : null,
        !bal && !reached ? el("p", { class: "k-soft k-mn-small", text: "Nothing set aside yet." }) : null,
        el("span", { class: "k-mn-spacer" }),
        el("div", { class: "k-mn-actions" }, [
          !rule && each && !reached ? btn("Set aside " + said(each) + " a month", "k-btn--sm", function () {
            var r = M.addRule({ name: p.name + " set-aside", kind: "transfer", pot: p.id, amount: each / 100, start: addDays(now, 1), every: { n: 1, unit: "month" } });
            announce(r ? "Set-aside made · " + p.name : "That set-aside could not be made"); redraw();
          }, "money.pot-setaside") : null,
          btn("Move in", "k-btn--sm", function () { moveDialog2(p, "in"); }),
          bal && !(!rule && each && !reached) ? btn("Move out", "k-btn--sm k-btn--quiet", function () { moveDialog2(p, "out"); }) : null].filter(Boolean))].filter(Boolean))]);
  }
  function newPotTile() {
    return el("div", { class: "k-mn-newpot", "data-ui": "money.pot-new" }, [tile("貯", "jade"),
      el("h3", { class: "k-mn-strong", text: "Saving for something?" }),
      el("p", { class: "k-soft k-mn-small", text: "Give it a name, a picture and a date. Money works out the set-aside each month." }),
      btn("＋ New pot", "k-btn--sm", function () { potDialog(null); }, "money.pot-add")]);
  }
  function closePot(p, bal) {
    U.confirm({ title: "Close " + p.name + "?", confirm: "Close pot", mark: "貯",
      body: bal ? "It still holds " + money(bal) + ". Closing archives it; its moves stay in Transactions. Move the money out first if you want it back in the month." : "It is archived; its moves stay in Transactions." },
      function () { M.updatePot(p.id, { archived: true, pinned: false }); announce(p.name + " closed"); redraw(); });
  }
  function potDialog(p) {
    var name = input("text", p ? p.name : "", { maxlength: "60", placeholder: "Laptop" });
    var why = input("text", p ? p.why : "", { maxlength: "140", placeholder: "For uni. The old one can't run Rider." });
    var af = U.amountField({ value: p ? p.target : null, label: "Target" });
    var by = input("date", p && p.by ? p.by : "", { "aria-label": "By" });
    var ov = dialogBox(p ? "Edit " + p.name : "New pot", "貯", [field("Name", name), field("Why · optional", why, "Your own line, shown under the name."),
      el("div", { class: "k-mn-two" }, [field("Target · optional", af.node), field("By · optional", by)]),
      el("p", { class: "k-muted k-mn-small", text: "Add a picture from the pot itself. It stays on this device and is never fetched." })],
      [p ? btn("Close pot…", "k-btn--quiet", function () { ov.close(); M.potBalances(function (e, b) { closePot(p, (b || {})[p.id] || 0); }); }) : el("span"),
        btn("Cancel", "", function () { ov.close(); }),
        btn(p ? "Save" : "Make the pot", "k-btn--primary", function () {
          if (!name.value.trim()) { name.focus(); return; }
          var t = af.input.value.trim() === "" ? null : af.value();
          var rec = { name: name.value, why: why.value, target: t, by: by.value || null };
          if (p) M.updatePot(p.id, rec); else M.addPot(rec);
          ov.close(); announce((p ? "Saved · " : "Pot made · ") + name.value.trim()); redraw();
        }, "money.pot-save")], { focus: name });
  }
  function moveDialog2(p, dir) {
    M.potBalances(function (e, bal) { openMove(p ? p.id : null, dir, bal || {}); });
  }
  function moveForm(ps, bal) {
    var dir = "in", potId = ps[0] ? ps[0].id : null, other = ps[1] ? ps[1].id : null;
    var host = el("div");
    function draw() {
      host.textContent = "";
      var af = U.amountField({ label: "Amount" });
      var potSel = select(ps.map(function (p) { return [p.id, p.name]; }), potId, { "aria-label": dir === "out" ? "From" : "To" });
      var otherSel = select(ps.map(function (p) { return [p.id, p.name]; }), other, { "aria-label": "To" });
      var date = input("date", today(), { "aria-label": "Date" });
      var hint = el("span", { class: "k-field-hint" });
      potSel.addEventListener("change", function () { potId = potSel.value; });
      otherSel.addEventListener("change", function () { other = otherSel.value; });
      af.input.addEventListener("input", function () {
        var v = af.value() || 0, from = dir === "in" ? null : potId;
        hint.textContent = from && v > (bal[from] || 0) ? (M.pot(from) || {}).name + " has " + money(bal[from] || 0) : "";
      });
      host.appendChild(card([head("Move money", "a transfer, not spending"),
        seg([["in", "Into a pot"], ["out", "Out of a pot"], ["between", "Between pots"]], dir, function (v) { dir = v; draw(); }, "Direction", "k-seg--fill"),
        el("div", { class: "k-mn-fromto" }, dir === "in" ? [field("From", select([["main", "Main"]], "main", { disabled: "" })), el("span", { class: "k-muted", "aria-hidden": "true", text: "→" }), field("To", potSel)]
          : dir === "out" ? [field("From", potSel), el("span", { class: "k-muted", "aria-hidden": "true", text: "→" }), field("To", select([["main", "Main"]], "main", { disabled: "" }))]
          : [field("From", potSel), el("span", { class: "k-muted", "aria-hidden": "true", text: "→" }), field("To", otherSel)]),
        field("Amount", af.node), hint, field("Date", date),
        el("p", { class: "k-muted k-mn-small", text: "It shows in Transactions as ⇄ and in outgoings as “to pots”; no budget counts it and “safe to spend today” adjusts." }),
        el("div", { class: "k-mn-actions" }, [el("span", { class: "k-mn-spacer" }), btn("Move", "k-btn--sm k-btn--primary", function () {
          if (!af.validate()) return;
          var v = af.value();
          if (dir !== "in" && v > (bal[potId] || 0)) { hint.textContent = "✕ " + (M.pot(potId) || {}).name + " has " + money(bal[potId] || 0); return; }
          if (dir === "between" && potId === other) { hint.textContent = "✕ Choose two different pots"; return; }
          var first = { kind: "transfer", pot: potId, dir: dir === "in" ? "in" : "out", minor: v, date: date.value || today() };
          M.addTx(first, function (err) {
            if (err) { hint.textContent = "✕ That move did not save"; return; }
            function done() { M.potBalances(function (e2, b2) { var pn = M.pot(dir === "between" ? other : potId); announce("Moved " + said(v) + (dir === "out" ? " out of " : " into ") + (pn ? pn.name : "the pot") + ". " + (pn && pn.target ? said((b2 || {})[pn.id] || 0) + " of " + said(pn.target) + "." : "")); redraw(); }); }
            if (dir === "between") M.addTx({ kind: "transfer", pot: other, dir: "in", minor: v, date: date.value || today() }, done); else done();
          });
        }, "money.move-go")])], "", "money.move-form"));
    }
    if (!ps.length) return el("div");
    draw();
    return host;
  }
  function openMove(potId, dir, bal) {
    var p = M.pot(potId);
    var af = U.amountField({ label: "Amount", size: "lg" });
    var date = input("date", today(), { "aria-label": "Date" });
    var hint = el("p", { class: "k-field-error", role: "alert", hidden: "" });
    var ov = dialogBox(dir === "out" ? "Move out of " + p.name : "Move into " + p.name, "⇄", [field("Amount", af.node), field("Date", date), hint,
      el("p", { class: "k-muted k-mn-small", text: "A transfer, never spending." })],
      [el("span"), btn("Cancel", "", function () { ov.close(); }), btn("Move", "k-btn--primary", function () {
        if (!af.validate()) return;
        var v = af.value();
        if (dir === "out" && v > (bal[potId] || 0)) { hint.hidden = false; hint.textContent = "✕ " + p.name + " has " + money(bal[potId] || 0); return; }
        M.addTx({ kind: "transfer", pot: potId, dir: dir, minor: v, date: date.value || today() }, function (err) {
          if (err) { hint.hidden = false; hint.textContent = "✕ That move did not save"; return; }
          ov.close();
          M.potBalances(function (e, b) { announce("Moved " + said(v) + (dir === "out" ? " out of " : " into ") + p.name + "." + (p.target ? " " + said((b || {})[p.id] || 0) + " of " + said(p.target) + "." : "")); redraw(); });
        });
      }, "money.move-dialog-go")], { focus: af.input });
  }

  /* ================= 27g · Month and year ================= */
  function monthYear(page) {
    var mode = visit.monthMode, now = today();
    var key = visit.monthKey || M.periodKey(now);
    var first = visit.yearFirst || M.shiftKey(M.periodKey(now), -11);
    var label = mode === "month" ? monthLabel(key) : monthName(first).slice(0, 3) + " " + first.slice(0, 4) + " – " + monthName(M.shiftKey(first, 11)).slice(0, 3) + " " + M.shiftKey(first, 11).slice(0, 4);
    page.appendChild(el("div", { class: "k-mn-monthnav" }, [
      seg([["month", "Month"], ["year", "Year"]], mode, function (v) { visit.monthMode = v; redraw(); }, "Month or year"),
      el("button", { type: "button", class: "k-iconbtn", "aria-label": "Earlier", text: "‹", onclick: function () { if (mode === "month") visit.monthKey = M.shiftKey(key, -1); else visit.yearFirst = M.shiftKey(first, -12); redraw(); } }),
      el("span", { class: "k-mn-monthname", text: label }),
      el("button", { type: "button", class: "k-iconbtn", "aria-label": "Later", text: "›", onclick: function () { if (mode === "month") visit.monthKey = M.shiftKey(key, 1); else visit.yearFirst = M.shiftKey(first, 12); redraw(); } }),
      mode === "month" && key === M.periodKey(now) ? el("span", { class: "k-muted k-mn-small", text: "so far · " + (between(M.periodRange(key).from, now) + 1) + " of " + M.periodRange(key).days + " days" }) : null,
      el("span", { class: "k-mn-spacer" }),
      btn("Export CSV", "k-btn--sm", function () { exportDialog(); })].filter(Boolean)));
    if (mode === "month") monthView(page, key, now); else yearView(page, first, now);
  }
  /* the change, in words: never a bare 0 or +∞% */
  function change(a, b, prevName) {
    if (!a && !b) return "";
    if (!b) return "new this month";
    if (!a) return "none this month";
    if (a === b) return "same as " + prevName;
    var d = a - b;
    return (said(Math.abs(d)) || "a little") + (d > 0 ? " more" : " less");
  }
  function monthView(page, key, now) {
    var r = M.periodRange(key), prevKey = M.shiftKey(key, -1), pr = M.periodRange(prevKey);
    var upto = now >= r.from && now <= r.to ? now : r.to;
    var span = between(r.from, upto);
    var prevTo = addDays(pr.from, Math.min(span, pr.days - 1));
    M.rangeSummary(r.from, upto, function (e1, cur) {
      M.rangeSummary(pr.from, prevTo, function (e2, prev) {
        if (!cur) { failed(page); return; }
        var prevName = monthName(prevKey), partial = upto !== r.to;
        var ids = {};
        Object.keys(cur.byCat).concat(Object.keys(prev ? prev.byCat : {})).forEach(function (id) { ids[id] = true; });
        var rows = Object.keys(ids).filter(function (id) { var c = cat(id); return c.kind !== "in"; }).map(function (id) {
          var a = cur.byCat[id] ? cur.byCat[id].net : 0, b = prev && prev.byCat[id] ? prev.byCat[id].net : 0;
          var c = cat(id);
          return el("button", { type: "button", class: "k-mn-cmp", "data-ui": "money.cmp-row", onclick: function () { visit.tx.cat = id; visit.tx.range = key === M.periodKey(now) ? "month" : "all"; go("transactions"); } }, [
            el("span", { class: "k-mn-inline" }, [dot(c.tone), c.name]),
            el("span", { class: "k-mn-right" }, [a ? amt(a) : el("span", { class: "k-muted", text: "none" })]),
            el("span", { class: "k-mn-right" }, [b ? amt(b, { w: "500", tone: "muted" }) : el("span", { class: "k-muted", text: "none" })]),
            el("span", { class: "k-soft k-mn-small", text: change(a, b, prevName) })]);
        });
        var hasPrev = prev && prev.count;
        var table = card([head("By category", hasPrev ? "against " + prevName + (partial ? "’s first " + (span + 1) + " days, so the two are the same length" : "") : "Nothing to compare with yet"),
          el("div", { class: "k-mn-cmp k-mn-cmp--head", "aria-hidden": "true" }, [el("span"), el("span", { class: "k-mn-right", text: monthName(key) }),
            el("span", { class: "k-mn-right", text: hasPrev ? prevName.slice(0, 3) + (partial ? ", 1–" + (span + 1) : "") : "" }), el("span", { text: hasPrev ? "Change" : "" })]),
          rows.length ? el("div", {}, rows) : el("p", { class: "k-muted k-mn-small", text: "Nothing spent in " + monthName(key) + "." }),
          el("div", { class: "k-mn-cmp k-mn-cmp--total" }, [el("span", { text: "Spent" }), el("span", { class: "k-mn-right" }, [amt(cur.outgoings)]),
            el("span", { class: "k-mn-right" }, [hasPrev ? amt(prev.outgoings, { w: "500", tone: "muted" }) : el("span")]), el("span", { class: "k-soft k-mn-small", text: hasPrev ? change(cur.outgoings, prev.outgoings, prevName) : "" })])], "", "money.month-table");
        var ins = partial ? M.insights(Object.assign({}, cur, { from: r.from, to: r.to, length: r.days }), now) : null;
        var inFig = ins ? ins.planned : cur.income;
        var side = el("div", { class: "k-mn-side" }, [card([head(monthName(key) + (partial ? " so far" : "")),
          el("div", { class: "k-mn-figs" }, [fig("In", inFig, ins && ins.expected ? (said(ins.expected) || "some") + " still expected" : null), fig("Out", cur.outgoings + cur.toPots - cur.fromPots, cur.toPots ? (said(cur.toPots - cur.fromPots) || "some") + " of it to pots" : null)])], "", "money.month-side"),
          card([head("Never printed"), el("p", { class: "k-soft k-mn-small", text: "A category new this month reads “new this month”; one with nothing reads “none this month”; no change reads “same as " + prevName + "”. Never a bare 0 or +∞%." })])]);
        page.appendChild(el("div", { class: "k-mn-cols k-mn-cols--sm" }, [table, side]));
        announce(monthLabel(key) + (partial ? ", so far" : "") + ". Spent " + (said(cur.outgoings) || "") + (hasPrev ? ", " + change(cur.outgoings, prev.outgoings, prevName) + (partial ? " than " + prevName + "'s first " + (span + 1) + " days" : "") : "") + ".");
      });
    });
  }
  function fig(label, minor, sub) {
    return el("div", { class: "k-mn-fig" }, [kicker(label), amt(minor, { size: "22" }), sub ? el("div", { class: "k-muted k-mn-small", text: sub }) : null].filter(Boolean));
  }
  function yearView(page, first, now) {
    M.yearSummary(first, function (err, months) {
      if (err) { failed(page); return; }
      var top = 1, planner = M.data().migratedFrom || null;
      months.forEach(function (s) { if (s.outgoings > top) top = s.outgoings; });
      var any = months.filter(function (s) { return s.count; });
      var curKey = M.periodKey(now);
      var strip = el("div", { class: "k-mn-year", "data-ui": "money.year", role: "list", "aria-label": "Outgoings by month" }, months.map(function (s) {
        var collOnly = s.count && Object.keys(s.byCat).every(function (id) { return id === "collection" || !s.byCat[id].net; }) && !s.income;
        var st = s.key === curKey ? "now" : collOnly ? "coll" : s.count ? "full" : "none";
        var b = el("button", { type: "button", class: "k-mn-ymonth", "data-state": st, role: "listitem",
          "aria-label": monthLabel(s.key) + (s.count ? ", out " + (said(s.outgoings) || "") + (s.income ? ", in " + (said(s.income) || "") : "") : ", nothing recorded"),
          onclick: function () { visit.monthMode = "month"; visit.monthKey = s.key; redraw(); } }, [
          el("span", { class: "k-mono k-mn-yfig", text: s.outgoings ? (said(s.outgoings, { whole: true }) || "") : "·" }),
          el("span", { class: "k-mn-ybar" }),
          s.income ? el("span", { class: "k-mn-yin", "aria-hidden": "true" }) : null,
          el("span", { class: "k-mn-ylabel", text: monthName(s.key).slice(0, 3) })].filter(Boolean));
        b.style.setProperty("--hv", s.outgoings ? Math.max(0.03, s.outgoings / top).toFixed(3) : "0.01");
        return b;
      }));
      var empty = months.filter(function (s) { return !s.count; }).map(function (s) { return monthName(s.key); });
      page.appendChild(card([head("Outgoings by month", "income where it was recorded, as the dashed line"), any.length < 3 && any.length ? el("p", { class: "k-muted k-mn-small", text: "More months appear as they finish." }) : null, strip,
        el("ul", { class: "k-legend k-mn-legend" }, [
          el("li", { class: "k-legend-item" }, [el("span", { class: "k-mn-key", "data-k": "coll" }), "Collection only · from the Budget Planner"]),
          el("li", { class: "k-legend-item" }, [el("span", { class: "k-mn-key", "data-k": "full" }), "Everything"]),
          el("li", { class: "k-legend-item" }, [el("span", { class: "k-mn-key", "data-k": "in" }), "Income recorded"]),
          el("li", { class: "k-legend-item" }, [el("span", { class: "k-mn-key", "data-k": "now" }), monthName(curKey) + " so far"]),
          empty.length && empty.length < 12 ? el("li", { class: "k-legend-item k-mn-legend-end", text: empty.slice(0, 3).join(", ") + (empty.length > 3 ? " and " + (empty.length - 3) + " more" : "") + ": nothing recorded" }) : null].filter(Boolean))].filter(Boolean), "", "money.year-card"));
      var full = months.filter(function (s) { return s.count && s.key !== curKey; });
      var spentFull = full.reduce(function (n, s) { return n + s.outgoings; }, 0), inFull = full.reduce(function (n, s) { return n + s.income; }, 0);
      var aside = months.reduce(function (n, s) { return n + s.toPots - s.fromPots; }, 0);
      var coll = months.reduce(function (n, s) { return n + (s.byCat.collection ? s.byCat.collection.net : 0); }, 0);
      page.appendChild(el("div", { class: "k-mn-yfigs" }, [
        spentFull ? card([fig("Spent, finished months", spentFull, full.length + (full.length === 1 ? " month" : " months"))]) : null,
        inFull ? card([fig("In, finished months", inFull, "income recorded")]) : null,
        aside ? card([fig("Set aside", aside, M.pots().length + (M.pots().length === 1 ? " pot" : " pots"))]) : null,
        coll ? card([fig("Collection, 12 months", coll, "Books, Games and VN")]) : null].filter(Boolean)));
    });
  }

  var RENDER = { overview: overview, transactions: transactions, budgets: budgets, recurring: recurring, pots: pots, month: monthYear };
  /* other pages open these */
  KOS.moneyUI = { entryEditor: entryEditor, importDialog: importDialog };
})();
