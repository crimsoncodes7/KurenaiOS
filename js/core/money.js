/* Kurenai OS — core/money.js
   Money (roadmap 5.4, phase 1): a personal budget beyond the Collection.

   Two homes, decision B:
     • the small, slow-changing part rides the synced state document,
       `state.money`: the base currency, the month start, categories,
       recurring rules (subscriptions are rules flagged `sub`) and pots.
       Every record has a random string id, so two devices never mint the
       same one and the cloud merge never has to re-key anything that a
       transaction in IndexedDB points at.
     • TRANSACTIONS, which grow for years, live in their own IndexedDB,
       `kurenai-os-money` (store `tx`, keyPath `syncId`, indexed by date),
       with a tombstone store for deletions (invariant 32). Replication to
       an owner-only `kos_money` table is phase 5; until then a transaction
       is on this device and in the full backup.

   Amounts are INTEGER minor units (`minor`, pence) everywhere inside, so a
   month of sums never drifts; `toMinor`/`format` are the only conversions.

   The Collection is one part of it. The Budget Planner keeps owning its
   purchases (`state.wishlist`); every archived purchase is MIRRORED here as
   a Collection transaction whose id is derived from the purchase
   (`wl:<item>:<purchasedAt>`), so every device derives the same rows, the
   mirror is redone before any read, and a reverted purchase disappears.
   The Collection category's budget IS the planner's monthly limit
   (`budgetFrom: "wishlist"`), never a copy of it.

   Recurring payments are computed from ONE rule (invariant 43): an
   occurrence is confirmed (a transaction with the derived id
   `r:<rule>:<date>`), skipped, or left — `marks[date]` records only the
   first two.

   ZERO Governor traffic and zero network traffic (invariant 5a): nothing
   here logs a session or makes a request.                               */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;
  var DB_NAME = "kurenai-os-money" + ((KOS.dataMode && KOS.dataMode.suffix) || ""), DB_VER = 1;
  var TX = "tx", DEL = "del";
  var db = null;

  /* ---------------- small pure helpers ---------------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function isISO(v) { return /^\d{4}-\d{2}-\d{2}$/.test(String(v || "")); }
  function parseISO(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(s, n) { var d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); }
  function daysBetween(a, b) { return Math.round((parseISO(b) - parseISO(a)) / 86400000); }
  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function today() { return iso(new Date()); }
  function rid(prefix) { return prefix + "-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }
  function str(v, max) { return String(v == null ? "" : v).trim().slice(0, max || 200); }
  function int(v, min, max, dflt) {
    v = Math.round(Number(v));
    if (!isFinite(v)) return dflt;
    return Math.max(min, Math.min(max, v));
  }
  /* a typed amount ("£12.50", "12,5", 12.5) to minor units; null if not a number */
  function toMinor(v) {
    if (typeof v === "number") return isFinite(v) ? Math.round(v * 100) : null;
    var s = String(v == null ? "" : v).replace(/[^\d.,\-−]/g, "").replace("−", "-");
    if (/,\d{1,2}$/.test(s) && s.indexOf(".") === -1) s = s.replace(",", ".");
    s = s.replace(/,/g, "");
    if (!s || s === "-" || isNaN(Number(s))) return null;
    return Math.round(Number(s) * 100);
  }
  function minorOf(v) { var m = Math.round(Number(v)); return isFinite(m) ? m : null; }

  /* ---------------- the state document's part ---------------- */
  var DEFAULT_CATEGORIES = [
    ["food", "Food", "out", "essentials", 35],
    ["transport", "Transport", "out", "essentials", 215],
    ["bills", "Bills", "out", "essentials", 260],
    ["health", "Health", "out", "essentials", 150],
    ["subscriptions", "Subscriptions", "out", "lifestyle", 290],
    ["social", "Social", "out", "lifestyle", 15],
    ["clothing", "Clothing", "out", "lifestyle", 330],
    ["gifts", "Gifts", "out", "lifestyle", 350],
    ["collection", "Collection", "out", "lifestyle", 70],
    ["education", "Education and exams", "out", "future", 190],
    ["other", "Other", "out", "other", null],
    ["job", "Job", "in", "income", 160],
    ["allowance", "Allowance", "in", "income", 120],
    ["gifts-in", "Gifts received", "in", "income", 340],
    ["grants", "Grants", "in", "income", 200],
    ["other-in", "Other income", "in", "income", null]
  ];
  var GROUPS = ["essentials", "lifestyle", "future", "other", "income"];
  var UNITS = ["day", "week", "month", "year"];

  function normaliseCategory(raw) {
    raw = raw || {};
    var id = str(raw.id, 40);
    if (!id) return null;
    var c = {
      id: id,
      name: str(raw.name, 60) || "Untitled",
      kind: raw.kind === "in" ? "in" : "out",
      group: GROUPS.indexOf(raw.group) !== -1 ? raw.group : (raw.kind === "in" ? "income" : "other"),
      budget: raw.budget == null || raw.budget === "" ? null : Math.max(0, minorOf(raw.budget) || 0),
      rollover: !!raw.rollover,
      hue: raw.hue == null || raw.hue === "" ? null : int(raw.hue, 0, 359, null),
      archived: !!raw.archived,
      order: int(raw.order, 0, 9999, 0),
      updatedAt: raw.updatedAt || 0
    };
    if (raw.budgetFrom === "wishlist") { c.budgetFrom = "wishlist"; c.budget = null; }
    if (c.kind === "in") { c.budget = null; c.rollover = false; }
    return c;
  }
  function normaliseRule(raw) {
    raw = raw || {};
    var id = str(raw.id, 40), start = isISO(raw.start) ? raw.start : null, minor = minorOf(raw.minor);
    if (!id || !start || minor == null || minor <= 0) return null;
    var every = raw.every || {};
    var unit = UNITS.indexOf(every.unit) !== -1 ? every.unit : "month";
    var marks = {};
    Object.keys(raw.marks || {}).forEach(function (d) {
      var m = raw.marks[d];
      if (!isISO(d) || !m || (m.s !== "done" && m.s !== "skip")) return;
      var o = { s: m.s, at: m.at || 0 };
      if (m.s === "done") { o.tx = str(m.tx, 80); o.minor = minorOf(m.minor); }
      marks[d] = o;
    });
    var prices = (Array.isArray(raw.prices) ? raw.prices : []).filter(function (p) {
      return p && isISO(p.from) && minorOf(p.minor) > 0;
    }).map(function (p) { return { from: p.from, minor: minorOf(p.minor) }; })
      .sort(function (a, b) { return a.from < b.from ? -1 : a.from > b.from ? 1 : 0; });
    var parsedStart = parseISO(start);
    return {
      id: id,
      name: str(raw.name, 80) || "Untitled",
      kind: raw.kind === "in" ? "in" : "out",
      cat: str(raw.cat, 40) || (raw.kind === "in" ? "other-in" : "other"),
      payee: str(raw.payee, 80),
      note: str(raw.note, 500),
      minor: minor,
      every: { n: int(every.n, 1, 365, 1), unit: unit },
      start: start,
      end: isISO(raw.end) && raw.end >= start ? raw.end : null,
      /* the day of the month a monthly or yearly rule falls on; 31 means the
         last day of a shorter month */
      dom: unit === "month" || unit === "year" ? int(raw.dom, 1, 31, parsedStart.getDate()) : null,
      sub: !!raw.sub,
      trialEnd: isISO(raw.trialEnd) ? raw.trialEnd : null,
      prices: prices,
      marks: marks,
      archived: !!raw.archived,
      updatedAt: raw.updatedAt || 0
    };
  }
  function normalisePot(raw) {
    raw = raw || {};
    var id = str(raw.id, 40);
    if (!id) return null;
    return {
      id: id,
      name: str(raw.name, 60) || "Untitled",
      target: raw.target == null || raw.target === "" ? null : Math.max(0, minorOf(raw.target) || 0),
      by: isISO(raw.by) ? raw.by : null,
      archived: !!raw.archived,
      order: int(raw.order, 0, 9999, 0),
      updatedAt: raw.updatedAt || 0
    };
  }
  function defaultCategories() {
    return DEFAULT_CATEGORIES.map(function (d, i) {
      var c = { id: d[0], name: d[1], kind: d[2], group: d[3], hue: d[4], order: i };
      if (d[0] === "collection") c.budgetFrom = "wishlist";
      return normaliseCategory(c);
    });
  }
  /* THE SCHEMA GATE for state.money. Idempotent: a second pass changes
     nothing. A missing default category (the Collection one above all,
     which the mirror writes into) is put back; a user's own are kept. */
  function normalise(m) {
    m = m && typeof m === "object" ? m : {};
    var w = store.state.wishlist;
    var out = {
      v: 1,
      currency: str(m.currency, 3) || (w && w.budget && w.budget.currency) || "£",
      monthStart: int(m.monthStart, 1, 28, 1),
      categories: [],
      rules: [],
      pots: []
    };
    var seen = {};
    (Array.isArray(m.categories) ? m.categories : []).forEach(function (raw) {
      var c = normaliseCategory(raw);
      if (c && !seen[c.id]) { seen[c.id] = true; out.categories.push(c); }
    });
    if (!Array.isArray(m.categories)) out.categories = defaultCategories();
    else defaultCategories().forEach(function (c) {
      if (c.id === "collection" && !seen.collection) out.categories.push(c);
    });
    var col = out.categories.filter(function (c) { return c.id === "collection"; })[0];
    if (col) { col.budgetFrom = "wishlist"; col.budget = null; col.kind = "out"; }
    seen = {};
    (Array.isArray(m.rules) ? m.rules : []).forEach(function (raw) {
      var r = normaliseRule(raw);
      if (r && !seen[r.id]) { seen[r.id] = true; out.rules.push(r); }
    });
    seen = {};
    (Array.isArray(m.pots) ? m.pots : []).forEach(function (raw) {
      var p = normalisePot(raw);
      if (p && !seen[p.id]) { seen[p.id] = true; out.pots.push(p); }
    });
    return out;
  }
  function data() {
    var s = store.state;
    if (!s.money || s.money.v !== 1) { s.money = normalise(s.money); store.save(); }
    return s.money;
  }
  function touch(rec) { rec.updatedAt = Date.now(); store.save(); return rec; }

  /* ---------------- categories ---------------- */
  function categories(opts) {
    opts = opts || {};
    return data().categories.filter(function (c) {
      return (opts.archived || !c.archived) && (!opts.kind || c.kind === opts.kind);
    }).slice().sort(function (a, b) { return a.order - b.order; });
  }
  function category(id) { return data().categories.filter(function (c) { return c.id === id; })[0] || null; }
  function addCategory(fields) {
    var m = data();
    var c = normaliseCategory(Object.assign({}, fields, { id: rid("c"), order: m.categories.length }));
    if (!c) return null;
    m.categories.push(c);
    return touch(c);
  }
  function updateCategory(id, patch) {
    var m = data(), i = m.categories.findIndex(function (c) { return c.id === id; });
    if (i < 0) return null;
    var next = normaliseCategory(Object.assign({}, m.categories[i], patch || {}, { id: id, budgetFrom: m.categories[i].budgetFrom }));
    m.categories[i] = next;
    return touch(next);
  }
  /* a category's monthly budget in minor units, or null when it has none.
     The Collection category reads the Budget Planner's monthly limit. */
  function budgetOf(c) {
    if (!c) return null;
    if (c.budgetFrom === "wishlist") {
      var w = store.state.wishlist, lim = w && w.budget ? Number(w.budget.monthlyLimit) || 0 : 0;
      return lim > 0 ? Math.round(lim * 100) : null;
    }
    return c.budget;
  }
  function setBudget(id, amount) {
    var c = category(id);
    if (!c) return null;
    var minor = amount == null || amount === "" ? null : toMinor(amount);
    if (c.budgetFrom === "wishlist") {
      KOS.wishlist && KOS.wishlist.setBudget({ monthlyLimit: minor == null ? 0 : minor / 100 });
      return c;
    }
    return updateCategory(id, { budget: minor });
  }

  /* ---------------- the month (with a payday start) ---------------- */
  /* The month a date belongs to, as "YYYY-MM": the month its period
     STARTS in. With monthStart 28, 3 November is in "2026-10". */
  function periodKey(dateISO, start) {
    start = start || data().monthStart;
    var d = parseISO(dateISO);
    if (d.getDate() < start) d = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1);
  }
  function periodRange(key, start) {
    start = start || data().monthStart;
    var y = +key.slice(0, 4), m = +key.slice(5, 7) - 1;
    var from = new Date(y, m, Math.min(start, daysInMonth(y, m)));
    var next = new Date(y, m + 1, 1);
    var to = new Date(next.getFullYear(), next.getMonth(), Math.min(start, daysInMonth(next.getFullYear(), next.getMonth())) - 1);
    return { key: key, from: iso(from), to: iso(to), days: Math.round((to - from) / 86400000) + 1 };
  }
  function shiftKey(key, n) {
    var d = new Date(+key.slice(0, 4), +key.slice(5, 7) - 1 + n, 1);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1);
  }

  /* ---------------- recurring rules ---------------- */
  function rules(opts) {
    opts = opts || {};
    return data().rules.filter(function (r) {
      return (opts.archived || !r.archived) && (opts.sub == null || r.sub === !!opts.sub);
    });
  }
  function rule(id) { return data().rules.filter(function (r) { return r.id === id; })[0] || null; }
  function addRule(fields) {
    var f = Object.assign({}, fields || {});
    if (f.amount != null && f.minor == null) f.minor = toMinor(f.amount);
    f.id = rid("r");
    if (!f.start) f.start = today();
    var r = normaliseRule(f);
    if (!r) return null;
    data().rules.push(r);
    return touch(r);
  }
  function updateRule(id, patch) {
    var m = data(), i = m.rules.findIndex(function (r) { return r.id === id; });
    if (i < 0) return null;
    var p = Object.assign({}, patch || {});
    if (p.amount != null && p.minor == null) p.minor = toMinor(p.amount);
    delete p.marks; delete p.prices;   // these move only through confirm/skip/setPrice
    var next = normaliseRule(Object.assign({}, m.rules[i], p, { id: id }));
    if (!next) return null;
    m.rules[i] = next;
    return touch(next);
  }
  function monthDate(y, m, dom) { return iso(new Date(y, m, Math.min(dom, daysInMonth(y, m)))); }
  /* every occurrence date of `r` in [from, to], computed from the rule alone */
  function occurrences(r, from, to) {
    var out = [], step, i, d, cap = 400;
    if (!r || to < r.start) return out;
    if (from < r.start) from = r.start;
    var end = r.end && r.end < to ? r.end : to;
    if (from > end) return out;
    if (r.every.unit === "day" || r.every.unit === "week") {
      step = r.every.n * (r.every.unit === "week" ? 7 : 1);
      i = Math.max(0, Math.ceil(daysBetween(r.start, from) / step));
      for (d = addDays(r.start, i * step); d <= end && out.length < cap; d = addDays(d, step)) out.push(d);
      return out;
    }
    var s = parseISO(r.start), months = r.every.n * (r.every.unit === "year" ? 12 : 1);
    var f = parseISO(from);
    var diff = (f.getFullYear() - s.getFullYear()) * 12 + (f.getMonth() - s.getMonth());
    i = Math.max(0, Math.floor(diff / months) - 1);
    for (; out.length < cap; i++) {
      var mm = s.getMonth() + i * months;
      d = monthDate(s.getFullYear() + Math.floor(mm / 12), ((mm % 12) + 12) % 12, r.dom);
      if (d > end) break;
      if (d >= from && d >= r.start) out.push(d);
    }
    return out;
  }
  /* the price in force on `date` (a price rise is recorded, not overwritten) */
  function amountOn(r, date) {
    var a = r.minor;
    if (r.prices.length) {
      a = null;
      r.prices.forEach(function (p) { if (p.from <= date) a = p.minor; });
      if (a == null) a = r.prices[0].minor;
    }
    return a;
  }
  function setPrice(id, amount, from) {
    var r = rule(id), minor = toMinor(amount);
    if (!r || minor == null || minor <= 0) return null;
    from = isISO(from) ? from : today();
    if (!r.prices.length) r.prices.push({ from: r.start, minor: r.minor });
    r.prices = r.prices.filter(function (p) { return p.from !== from; });
    r.prices.push({ from: from, minor: minor });
    r.prices.sort(function (a, b) { return a.from < b.from ? -1 : 1; });
    r.minor = amountOn(r, today());
    return touch(r);
  }
  /* the last price change, if any: {from, was, now} */
  function priceChange(r) {
    if (!r || r.prices.length < 2) return null;
    var a = r.prices[r.prices.length - 2], b = r.prices[r.prices.length - 1];
    return a.minor === b.minor ? null : { from: b.from, was: a.minor, now: b.minor };
  }
  /* "done" | "skip" | "due" (passed, not confirmed — left) | "upcoming" */
  function occurrenceState(r, date, now) {
    var m = r.marks[date];
    if (m) return m.s;
    return date <= (now || today()) ? "due" : "upcoming";
  }
  function ruleTxId(ruleId, date) { return "r:" + ruleId + ":" + date; }
  function confirm(id, date, opts, cb) {
    if (typeof opts === "function") { cb = opts; opts = {}; }
    opts = opts || {};
    var r = rule(id);
    if (!r || occurrences(r, date, date)[0] !== date) { cb && cb(new Error("Not an occurrence of this rule")); return; }
    var minor = opts.amount != null ? toMinor(opts.amount) : amountOn(r, date);
    if (minor == null || minor <= 0) { cb && cb(new Error("Amount must be more than zero")); return; }
    var tx = normaliseTx({ syncId: ruleTxId(id, date), date: date, minor: minor, kind: r.kind, cat: r.cat,
      payee: r.payee || r.name, note: r.note, src: "rule", rule: { id: id, date: date } });
    putTx(tx, function (err) {
      if (err) { cb && cb(err); return; }
      r.marks[date] = { s: "done", tx: tx.syncId, minor: minor, at: Date.now() };
      touch(r);
      cb && cb(null, tx);
    });
  }
  function skip(id, date, cb) {
    var r = rule(id);
    if (!r) { cb && cb(new Error("No such rule")); return; }
    var was = r.marks[date];
    r.marks[date] = { s: "skip", at: Date.now() };
    touch(r);
    if (was && was.s === "done") removeTx(was.tx, function (err) { cb && cb(err || null); });
    else cb && cb(null);
  }
  /* back to "left": the mark goes, and a confirmed occurrence's transaction with it */
  function unmark(id, date, cb) {
    var r = rule(id);
    if (!r || !r.marks[date]) { cb && cb(null); return; }
    var was = r.marks[date];
    delete r.marks[date];
    touch(r);
    if (was.s === "done") removeTx(was.tx, function (err) { cb && cb(err || null); });
    else cb && cb(null);
  }
  /* every occurrence in [from, to] across the active rules, oldest first */
  function upcoming(from, to, now) {
    var out = [];
    rules().forEach(function (r) {
      occurrences(r, from, to).forEach(function (d) {
        out.push({ rule: r.id, name: r.name, date: d, minor: amountOn(r, d), kind: r.kind, cat: r.cat,
          sub: r.sub, state: occurrenceState(r, d, now) });
      });
    });
    return out.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  }
  /* a rule's cost normalised to a month, in minor units */
  function perMonth(r) {
    var n = r.every.n, a = r.minor;
    switch (r.every.unit) {
      case "day": return Math.round(a * 365.25 / 12 / n);
      case "week": return Math.round(a * 52.1775 / 12 / n);
      case "year": return Math.round(a / 12 / n);
      default: return Math.round(a / n);
    }
  }
  function subscriptions() {
    var subs = rules({ sub: true });
    var total = subs.reduce(function (n, r) { return n + perMonth(r); }, 0);
    return { items: subs, perMonth: total, perYear: total * 12 };
  }

  /* ---------------- pots ---------------- */
  function pots(opts) {
    return data().pots.filter(function (p) { return (opts && opts.archived) || !p.archived; })
      .slice().sort(function (a, b) { return a.order - b.order; });
  }
  function pot(id) { return data().pots.filter(function (p) { return p.id === id; })[0] || null; }
  function addPot(fields) {
    var f = Object.assign({}, fields || {});
    if (f.targetAmount != null) f.target = toMinor(f.targetAmount);
    f.id = rid("p"); f.order = data().pots.length;
    var p = normalisePot(f);
    data().pots.push(p);
    return touch(p);
  }
  function updatePot(id, patch) {
    var m = data(), i = m.pots.findIndex(function (p) { return p.id === id; });
    if (i < 0) return null;
    var f = Object.assign({}, patch || {});
    if (f.targetAmount != null) f.target = toMinor(f.targetAmount);
    m.pots[i] = normalisePot(Object.assign({}, m.pots[i], f, { id: id }));
    return touch(m.pots[i]);
  }
  /* balances of every pot, derived from the transfer transactions */
  function potBalances(cb) {
    allTx(function (err, rows) {
      var out = {};
      pots({ archived: true }).forEach(function (p) { out[p.id] = 0; });
      (rows || []).forEach(function (t) {
        if (t.kind !== "transfer" || !t.pot) return;
        out[t.pot] = (out[t.pot] || 0) + (t.dir === "out" ? -t.minor : t.minor);
      });
      cb(err || null, out);
    });
  }
  /* what a pot needs set aside each month to reach its target by its date */
  function setAside(p, balance, now) {
    if (!p || !p.target || !p.by) return null;
    var left = p.target - (balance || 0);
    if (left <= 0) return 0;
    now = now || today();
    var a = parseISO(now), b = parseISO(p.by);
    var months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + (b.getDate() >= a.getDate() ? 1 : 0);
    return Math.ceil(left / Math.max(1, months));
  }

  /* ---------------- transactions (IndexedDB) ---------------- */
  var KINDS = ["out", "in", "refund", "transfer"];
  var SRCS = ["manual", "csv", "rule", "wishlist"];
  function normaliseTx(raw) {
    raw = raw || {};
    var minor = raw.minor != null ? minorOf(raw.minor) : toMinor(raw.amount);
    if (!isISO(raw.date) || minor == null || minor <= 0) return null;
    var kind = KINDS.indexOf(raw.kind) !== -1 ? raw.kind : "out";
    var t = {
      syncId: str(raw.syncId, 80) || rid("t"),
      date: raw.date,
      minor: minor,
      kind: kind,
      cat: kind === "transfer" ? null : (str(raw.cat, 40) || (kind === "in" ? "other-in" : "other")),
      splits: null,
      payee: str(raw.payee, 80),
      note: str(raw.note, 500),
      tags: (Array.isArray(raw.tags) ? raw.tags : []).map(function (x) { return str(x, 30); })
        .filter(function (x, i, a) { return x && a.indexOf(x) === i; }).slice(0, 12),
      pot: kind === "transfer" ? (str(raw.pot, 40) || null) : null,
      dir: kind === "transfer" ? (raw.dir === "out" ? "out" : "in") : null,
      rule: raw.rule && raw.rule.id && isISO(raw.rule.date) ? { id: str(raw.rule.id, 40), date: raw.rule.date } : null,
      src: SRCS.indexOf(raw.src) !== -1 ? raw.src : "manual",
      wl: raw.wl && raw.wl.id != null ? { id: raw.wl.id, module: str(raw.wl.module, 10) || null } : null,
      createdAt: raw.createdAt || Date.now(),
      updatedAt: raw.updatedAt || raw.createdAt || Date.now()
    };
    /* a split is kept only when its parts are positive and add up exactly */
    if (Array.isArray(raw.splits) && raw.splits.length > 1 && (kind === "out" || kind === "refund" || kind === "in")) {
      var parts = raw.splits.map(function (s) {
        return { cat: str(s && s.cat, 40), minor: s && s.minor != null ? minorOf(s.minor) : toMinor(s && s.amount) };
      }).filter(function (s) { return s.cat && s.minor > 0; });
      var sum = parts.reduce(function (n, s) { return n + s.minor; }, 0);
      if (parts.length > 1 && sum === minor) { t.splits = parts; t.cat = parts[0].cat; }
    }
    if (t.pot === null && kind === "transfer") return null;
    return t;
  }
  function available() { return !!window.indexedDB; }
  function open(cb) {
    if (!available()) { cb(new Error("IndexedDB unavailable")); return; }
    if (db) { cb(null, db); return; }
    var rq = window.indexedDB.open(DB_NAME, DB_VER);
    rq.onupgradeneeded = function (e) {
      var d = e.target.result;
      if (!d.objectStoreNames.contains(TX)) {
        var os = d.createObjectStore(TX, { keyPath: "syncId" });
        os.createIndex("date", "date", { unique: false });
        os.createIndex("src", "src", { unique: false });
      }
      if (!d.objectStoreNames.contains(DEL)) d.createObjectStore(DEL, { keyPath: "syncId" });
    };
    rq.onsuccess = function () {
      db = rq.result;
      db.onversionchange = function () { db.close(); db = null; };
      cb(null, db);
    };
    rq.onerror = function () { cb(rq.error); };
  }
  function txn(names, mode, fn) {
    open(function (err, d) {
      if (err) { fn(err); return; }
      try { fn(null, d.transaction(names, mode)); } catch (e) { fn(e); }
    });
  }
  function putRaw(rows, cb) {
    if (!rows.length) { cb && cb(null); return; }
    txn([TX, DEL], "readwrite", function (err, t) {
      if (err) { cb && cb(err); return; }
      rows.forEach(function (r) { t.objectStore(TX).put(r); t.objectStore(DEL).delete(r.syncId); });
      t.oncomplete = function () { cb && cb(null); };
      t.onerror = function () { cb && cb(t.error); };
    });
  }
  function putTx(tx, cb) { putRaw([tx], cb); }
  function getTx(syncId, cb) {
    txn([TX], "readonly", function (err, t) {
      if (err) { cb(err, null); return; }
      var rq = t.objectStore(TX).get(syncId);
      rq.onsuccess = function () { cb(null, rq.result || null); };
      rq.onerror = function () { cb(rq.error, null); };
    });
  }
  function deleteRaw(ids, tomb, cb) {
    if (!ids.length) { cb && cb(null); return; }
    txn([TX, DEL], "readwrite", function (err, t) {
      if (err) { cb && cb(err); return; }
      ids.forEach(function (id) {
        t.objectStore(TX).delete(id);
        if (tomb) t.objectStore(DEL).put({ syncId: id, at: Date.now() });
      });
      t.oncomplete = function () { cb && cb(null); };
      t.onerror = function () { cb && cb(t.error); };
    });
  }
  /* a deletion leaves a tombstone so replication can carry it (invariant 32);
     the wishlist mirror's own rows are derived on every device and need none */
  function removeTx(syncId, cb) { deleteRaw([syncId], !/^wl:/.test(syncId), cb); }
  function range(from, to, cb) {
    mirror(function () {
      txn([TX], "readonly", function (err, t) {
        if (err) { cb(err, []); return; }
        var rq = t.objectStore(TX).index("date").getAll(IDBKeyRange.bound(from, to));
        rq.onsuccess = function () { cb(null, rq.result || []); };
        rq.onerror = function () { cb(rq.error, []); };
      });
    });
  }
  function allTx(cb) { range("0000-01-01", "9999-12-31", cb); }

  function addTx(fields, cb) {
    var t = normaliseTx(Object.assign({}, fields, { syncId: null, src: fields && fields.src === "csv" ? "csv" : "manual",
      createdAt: Date.now(), updatedAt: Date.now() }));
    if (!t) { cb && cb(new Error("A transaction needs a date and an amount above zero")); return; }
    if (t.kind === "transfer" && !pot(t.pot)) { cb && cb(new Error("No such pot")); return; }
    putTx(t, function (err) { cb && cb(err || null, err ? null : t); });
  }
  /* the Budget Planner owns its mirrored purchases; edit them there */
  function updateTx(syncId, patch, cb) {
    getTx(syncId, function (err, cur) {
      if (err || !cur) { cb && cb(err || new Error("No such transaction")); return; }
      if (cur.src === "wishlist") { cb && cb(new Error("This purchase belongs to the Budget Planner")); return; }
      var next = normaliseTx(Object.assign({}, cur, patch || {}, { syncId: cur.syncId, src: cur.src, rule: cur.rule,
        createdAt: cur.createdAt, updatedAt: Date.now() }));
      if (!next) { cb && cb(new Error("A transaction needs a date and an amount above zero")); return; }
      putTx(next, function (e2) { cb && cb(e2 || null, e2 ? null : next); });
    });
  }
  function deleteTx(syncId, cb) {
    getTx(syncId, function (err, cur) {
      if (err || !cur) { cb && cb(err || null); return; }
      if (cur.src === "wishlist") { cb && cb(new Error("This purchase belongs to the Budget Planner")); return; }
      /* a confirmed occurrence goes back to "left" with its transaction */
      if (cur.rule) {
        var r = rule(cur.rule.id);
        if (r && r.marks[cur.rule.date]) { delete r.marks[cur.rule.date]; touch(r); }
      }
      removeTx(syncId, cb);
    });
  }
  /* one lazy batch (invariant 8): newest first, at most `limit` (60) rows
     older than the cursor `before` ({date, syncId}) that pass the filter */
  function list(opts, cb) {
    opts = opts || {};
    var limit = Math.min(opts.limit || 60, 200), out = [];
    var q = str(opts.search, 80).toLowerCase();
    function keep(t) {
      if (opts.kind && t.kind !== opts.kind) return false;
      if (opts.cat && t.cat !== opts.cat && !(t.splits || []).some(function (s) { return s.cat === opts.cat; })) return false;
      if (opts.tag && t.tags.indexOf(opts.tag) === -1) return false;
      if (q && (t.payee + " " + t.note + " " + t.tags.join(" ")).toLowerCase().indexOf(q) === -1) return false;
      return true;
    }
    mirror(function () {
      txn([TX], "readonly", function (err, t) {
        if (err) { cb(err, [], null); return; }
        var lo = opts.from || "0000-01-01", hi = opts.to || "9999-12-31";
        if (opts.before && opts.before.date < hi) hi = opts.before.date;
        /* "prev" walks the date index newest first and, inside one date,
           by descending syncId, so (date, syncId) is an exact cursor */
        var rq = t.objectStore(TX).index("date").openCursor(IDBKeyRange.bound(lo, hi), "prev");
        rq.onsuccess = function () {
          var c = rq.result;
          if (!c) { cb(null, out, null); return; }
          var v = c.value;
          if (opts.before && v.date === opts.before.date && v.syncId >= opts.before.syncId) { c.continue(); return; }
          if (keep(v)) out.push(v);
          if (out.length >= limit) { cb(null, out, { date: v.date, syncId: v.syncId }); return; }
          c.continue();
        };
        rq.onerror = function () { cb(rq.error, [], null); };
      });
    });
  }

  /* ---------------- the Budget Planner mirror ---------------- */
  var mirrorSig = null, mirrorWaiters = null;
  function wishlistRows() {
    var w = store.state.wishlist, rows = [];
    ((w && w.budget && w.budget.history) || []).forEach(function (bucket) {
      (bucket.items || []).forEach(function (it) {
        var minor = Math.round((Number(it.price) || 0) * 100);
        if (!(minor > 0) || !it.purchasedAt) return;
        var d = iso(new Date(it.purchasedAt));
        rows.push({ syncId: "wl:" + it.id + ":" + it.purchasedAt, date: d, minor: minor, kind: "out",
          cat: "collection", payee: str(it.title, 80), note: "", tags: [], splits: null, pot: null, dir: null,
          rule: null, src: "wishlist", wl: { id: it.id, module: it.module || null },
          createdAt: it.purchasedAt, updatedAt: it.purchasedAt });
      });
    });
    return rows;
  }
  /* bring the mirrored Collection rows in line with the planner's history.
     Cheap when nothing changed (a signature of the history); every read
     runs it first, so a cloud pull or a planner edit is never stale here. */
  function mirror(cb) {
    var rows = wishlistRows();
    var sig = JSON.stringify(rows.map(function (r) { return [r.syncId, r.minor, r.payee, r.wl.module]; }));
    if (sig === mirrorSig) { cb(null); return; }
    if (mirrorWaiters) { mirrorWaiters.push(cb); return; }
    mirrorWaiters = [cb];
    function done(err) {
      if (!err) mirrorSig = sig;
      var w = mirrorWaiters; mirrorWaiters = null;
      w.forEach(function (f) { f(err || null); });
    }
    txn([TX], "readonly", function (err, t) {
      if (err) { done(err); return; }
      var rq = t.objectStore(TX).index("src").getAll("wishlist");
      rq.onsuccess = function () {
        var want = {}, have = {};
        rows.forEach(function (r) { want[r.syncId] = r; });
        (rq.result || []).forEach(function (r) { have[r.syncId] = r; });
        var stale = Object.keys(have).filter(function (id) { return !want[id]; });
        var fresh = rows.filter(function (r) {
          var h = have[r.syncId];
          return !h || h.minor !== r.minor || h.payee !== r.payee || h.date !== r.date || (h.wl && h.wl.module) !== r.wl.module;
        });
        deleteRaw(stale, false, function (e1) {
          if (e1) { done(e1); return; }
          putRaw(fresh, done);
        });
      };
      rq.onerror = function () { done(rq.error); };
    });
  }

  /* ---------------- summaries ---------------- */
  function emptyCat() { return { out: 0, refund: 0, net: 0, income: 0, count: 0, modules: {} }; }
  function tally(rows) {
    var s = { income: 0, outgoings: 0, toPots: 0, fromPots: 0, byCat: {}, count: rows.length, days: 0, pots: {} };
    var days = {};
    rows.forEach(function (t) {
      days[t.date] = true;
      if (t.kind === "transfer") {
        if (t.dir === "out") s.fromPots += t.minor; else s.toPots += t.minor;
        s.pots[t.pot] = (s.pots[t.pot] || 0) + (t.dir === "out" ? -t.minor : t.minor);
        return;
      }
      var parts = t.splits || [{ cat: t.cat, minor: t.minor }];
      parts.forEach(function (p) {
        var c = s.byCat[p.cat] = s.byCat[p.cat] || emptyCat();
        c.count++;
        if (t.kind === "in") { c.income += p.minor; s.income += p.minor; return; }
        if (t.kind === "refund") { c.refund += p.minor; c.net -= p.minor; s.outgoings -= p.minor; }
        else { c.out += p.minor; c.net += p.minor; s.outgoings += p.minor; }
        if (t.wl && t.wl.module) c.modules[t.wl.module] = (c.modules[t.wl.module] || 0) + (t.kind === "refund" ? -p.minor : p.minor);
      });
    });
    s.days = Object.keys(days).length;
    return s;
  }
  /* one month's facts. Budgets and rollover per category; a rollover
     carries ONE month (last month's budget less its spend, which may be
     negative), never a chain. */
  function summary(key, cb) {
    var r = periodRange(key), prev = periodRange(shiftKey(key, -1));
    range(prev.from, r.to, function (err, rows) {
      if (err) { cb(err, null); return; }
      var cur = rows.filter(function (t) { return t.date >= r.from; });
      var before = rows.filter(function (t) { return t.date < r.from; });
      var s = tally(cur), p = tally(before);
      s.key = key; s.from = r.from; s.to = r.to; s.length = r.days;
      s.budgetTotal = null;
      categories({ archived: true }).forEach(function (c) {
        if (c.kind !== "out") return;
        var b = budgetOf(c), row = s.byCat[c.id];
        if (b == null && !row) return;
        row = s.byCat[c.id] = row || emptyCat();
        row.budget = b;
        row.rollover = 0;
        /* budgets are not versioned: last month is read against the
           category's budget as it stands */
        if (c.rollover && b != null) row.rollover = b - (p.byCat[c.id] ? p.byCat[c.id].net : 0);
        if (b != null) {
          row.left = b + row.rollover - row.net;
          row.over = row.left < 0;
          if (!c.archived) s.budgetTotal = (s.budgetTotal || 0) + b + row.rollover;
        }
      });
      cb(null, s);
    });
  }
  function yearSummary(firstKey, cb) {
    var keys = [], out = [];
    for (var i = 0; i < 12; i++) keys.push(shiftKey(firstKey, i));
    (function next(i) {
      if (i >= keys.length) { cb(null, out); return; }
      summary(keys[i], function (err, s) {
        if (err) { cb(err, out); return; }
        out.push(s); next(i + 1);
      });
    })(0);
  }
  /* The figures that make a claim about the rest of the month. Each is
     null when it has nothing to stand on (invariant 76): left and safe to
     spend need a budget; the month-end projection needs a week of the
     month gone and five days with spending in it. */
  var PROJECT_MIN_ELAPSED = 7, PROJECT_MIN_DAYS = 5;
  function insights(s, now) {
    now = now || today();
    var inMonth = now >= s.from && now <= s.to;
    var elapsed = inMonth ? daysBetween(s.from, now) + 1 : (now > s.to ? s.length : 0);
    var daysLeft = inMonth ? daysBetween(now, s.to) + 1 : 0;
    var bills = inMonth ? upcoming(addDays(now, 1), s.to, now).filter(function (o) {
      return o.kind === "out" && o.state === "upcoming";
    }).reduce(function (n, o) { return n + o.minor; }, 0) : 0;
    var left = s.budgetTotal == null ? null : s.budgetTotal - s.outgoings;
    var out = {
      elapsed: elapsed, daysLeft: daysLeft, billsAhead: bills,
      left: left,
      safeToday: left == null || !inMonth ? null : Math.max(0, Math.floor((left - bills) / daysLeft)),
      projection: null
    };
    if (inMonth && elapsed >= PROJECT_MIN_ELAPSED && s.days >= PROJECT_MIN_DAYS) {
      out.projection = Math.round(s.outgoings / elapsed * s.length);
    }
    return out;
  }

  /* ---------------- formatting ---------------- */
  /* one figure: "£1,234.56", a refund or a deficit "−£7.99". With the
     privacy toggle on (per device, `state.ui.moneyPrivate`) the digits are
     masked at the same width so nothing on the page moves. */
  function isPrivate() { return !!(store.state.ui && store.state.ui.moneyPrivate); }
  function setPrivate(on) { store.state.ui.moneyPrivate = !!on; store.save(); }
  function format(minor, opts) {
    opts = opts || {};
    var cur = data().currency, neg = minor < 0, a = Math.abs(Math.round(minor || 0));
    var whole = String(Math.floor(a / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var body = whole + (opts.whole && a % 100 === 0 ? "" : "." + pad(a % 100));
    if (opts.private != null ? opts.private : isPrivate()) body = body.replace(/\d/g, "•");
    var sign = neg ? "−" : (opts.sign && minor > 0 ? "+" : "");
    return /^[A-Z]{3}$/.test(cur) ? sign + body + " " + cur : sign + cur + body;
  }

  /* ---------------- CSV import (the engine; the pages are phase 2) ---------------- */
  function parseCSV(text) {
    text = String(text || "").replace(/^﻿/, "");
    var sample = text.split(/\r?\n/)[0] || "";
    var delim = (sample.match(/;/g) || []).length > (sample.match(/,/g) || []).length ? ";" : (sample.indexOf("\t") !== -1 && sample.indexOf(",") === -1 ? "\t" : ",");
    var rows = [], row = [], field = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) {
        if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
        else field += ch;
      } else if (ch === '"') q = true;
      else if (ch === delim) { row.push(field); field = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(field); field = "";
        if (row.some(function (x) { return x.trim(); })) rows.push(row);
        row = [];
      } else field += ch;
    }
    row.push(field);
    if (row.some(function (x) { return x.trim(); })) rows.push(row);
    return { delimiter: delim, header: rows[0] || [], rows: rows.slice(1) };
  }
  var GUESS = {
    date: /^(date|transaction date|posted|posting date|completed date|started date)$/i,
    amount: /^(amount|value|amount \(gbp\)|transaction amount)$/i,
    out: /^(paid out|money out|debit|withdrawals?|out)$/i,
    in: /^(paid in|money in|credit|deposits?|in)$/i,
    payee: /^(description|payee|merchant|name|counter party|details|reference)$/i,
    note: /^(notes?|memo|category)$/i
  };
  function guessMapping(header) {
    var m = {};
    header.forEach(function (h, i) {
      Object.keys(GUESS).forEach(function (k) { if (m[k] == null && GUESS[k].test(String(h).trim())) m[k] = i; });
    });
    return m;
  }
  /* "dmy" (31/10/2026, the UK default), "mdy" or "iso" */
  function parseDate(s, fmt) {
    s = String(s || "").trim();
    var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) return iso(new Date(+m[1], +m[2] - 1, +m[3]));
    m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})/);
    if (!m) return null;
    var y = +m[3] < 100 ? 2000 + +m[3] : +m[3];
    var d = fmt === "mdy" ? +m[2] : +m[1], mo = fmt === "mdy" ? +m[1] : +m[2];
    if (mo < 1 || mo > 12 || d < 1 || d > daysInMonth(y, mo - 1)) return null;
    return iso(new Date(y, mo - 1, d));
  }
  /* rows → transactions with no side effect. A signed `amount` column is
     an outgoing when negative unless `sign: "positive-out"`; separate in
     and out columns are read as such. Each candidate is checked against
     what is stored: the same date, amount and payee is a duplicate. */
  function previewCSV(parsed, mapping, opts, cb) {
    opts = opts || {};
    var out = { rows: [], errors: [], duplicates: 0 };
    parsed.rows.forEach(function (r, i) {
      var date = parseDate(r[mapping.date], opts.dateFormat || "dmy");
      var minor = null, kind = "out";
      if (mapping.amount != null) {
        minor = toMinor(r[mapping.amount]);
        if (minor != null) {
          var negOut = opts.sign !== "positive-out";
          kind = (minor < 0) === negOut ? "out" : "in";
          minor = Math.abs(minor);
        }
      } else {
        var o = mapping.out != null ? toMinor(r[mapping.out]) : null, n = mapping.in != null ? toMinor(r[mapping.in]) : null;
        if (o) { minor = Math.abs(o); kind = "out"; } else if (n) { minor = Math.abs(n); kind = "in"; }
      }
      if (!date || !minor) { out.errors.push({ line: i + 2, reason: !date ? "No date I can read" : "No amount" }); return; }
      out.rows.push({ line: i + 2, date: date, minor: minor, kind: kind,
        cat: kind === "in" ? (opts.inCat || "other-in") : (opts.outCat || "other"),
        payee: str(r[mapping.payee], 80), note: mapping.note != null ? str(r[mapping.note], 500) : "", duplicate: false });
    });
    if (!out.rows.length) { cb(null, out); return; }
    var dates = out.rows.map(function (x) { return x.date; }).sort();
    range(dates[0], dates[dates.length - 1], function (err, have) {
      var keys = {};
      (have || []).forEach(function (t) { keys[t.date + "|" + t.minor + "|" + t.payee.toLowerCase()] = true; });
      out.rows.forEach(function (x) {
        var k = x.date + "|" + x.minor + "|" + x.payee.toLowerCase();
        if (keys[k]) { x.duplicate = true; out.duplicates++; }
        keys[k] = true;   // a repeat inside the same file is a duplicate too
      });
      cb(err || null, out);
    });
  }
  function importRows(rows, opts, cb) {
    opts = opts || {};
    var take = rows.filter(function (x) { return opts.includeDuplicates || !x.duplicate; });
    var txs = take.map(function (x) {
      return normaliseTx({ date: x.date, minor: x.minor, kind: x.kind, cat: x.cat, payee: x.payee, note: x.note,
        tags: opts.tag ? [opts.tag] : [], src: "csv" });
    }).filter(Boolean);
    putRaw(txs, function (err) { cb && cb(err || null, { added: err ? 0 : txs.length, skipped: rows.length - txs.length }); });
  }
  function csvCell(v) { v = String(v == null ? "" : v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function exportCSV(from, to, cb) {
    range(from || "0000-01-01", to || "9999-12-31", function (err, rows) {
      if (err) { cb(err); return; }
      var names = {};
      data().categories.forEach(function (c) { names[c.id] = c.name; });
      var potNames = {};
      data().pots.forEach(function (p) { potNames[p.id] = p.name; });
      var lines = [["Date", "Type", "Amount", "Category", "Payee", "Note", "Tags", "Pot"].join(",")];
      rows.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; }).forEach(function (t) {
        (t.splits || [{ cat: t.cat, minor: t.minor }]).forEach(function (p) {
          lines.push([t.date, t.kind, (p.minor / 100).toFixed(2), names[p.cat] || p.cat || "", t.payee, t.note,
            t.tags.join(" "), t.pot ? potNames[t.pot] || "" : ""].map(csvCell).join(","));
        });
      });
      cb(null, lines.join("\n") + "\n");
    });
  }

  /* ---------------- backup (store.snapshotFull / importFull) ---------------- */
  /* Everything typed here; the mirrored purchases are derived from the
     planner's history, which the state document already carries. */
  function exportAll(cb) {
    txn([TX, DEL], "readonly", function (err, t) {
      if (err) { cb(err); return; }
      var out = { tx: [], del: [] };
      var a = t.objectStore(TX).getAll(), b = t.objectStore(DEL).getAll();
      t.oncomplete = function () {
        out.tx = (a.result || []).filter(function (r) { return r.src !== "wishlist"; });
        out.del = b.result || [];
        cb(null, out);
      };
      t.onerror = function () { cb(t.error); };
    });
  }
  function importAll(dump, cb) {
    var rows = ((dump && dump.tx) || []).map(normaliseTx).filter(function (r) { return r && r.src !== "wishlist"; });
    var dels = ((dump && dump.del) || []).filter(function (d) { return d && d.syncId; });
    txn([TX, DEL], "readwrite", function (err, t) {
      if (err) { cb(err); return; }
      t.objectStore(TX).clear(); t.objectStore(DEL).clear();
      rows.forEach(function (r) { t.objectStore(TX).put(r); });
      dels.forEach(function (d) { t.objectStore(DEL).put({ syncId: String(d.syncId), at: d.at || 0 }); });
      t.oncomplete = function () { mirrorSig = null; cb(null, { tx: rows.length }); };
      t.onerror = function () { cb(t.error); };
    });
  }

  /* open (and on first run create) the database at load, so the first
     read or backup does not also pay for the upgrade */
  if (available()) open(function () {});

  KOS.money = {
    /* state document */
    normalise: normalise, data: data, normaliseCategory: normaliseCategory, normaliseRule: normaliseRule,
    normalisePot: normalisePot, normaliseTx: normaliseTx,
    categories: categories, category: category, addCategory: addCategory, updateCategory: updateCategory,
    budgetOf: budgetOf, setBudget: setBudget,
    setMonthStart: function (d) { data().monthStart = int(d, 1, 28, 1); store.save(); return data().monthStart; },
    periodKey: periodKey, periodRange: periodRange, shiftKey: shiftKey,
    rules: rules, rule: rule, addRule: addRule, updateRule: updateRule, occurrences: occurrences,
    amountOn: amountOn, setPrice: setPrice, priceChange: priceChange, occurrenceState: occurrenceState,
    confirm: confirm, skip: skip, unmark: unmark, upcoming: upcoming, perMonth: perMonth,
    subscriptions: subscriptions,
    pots: pots, pot: pot, addPot: addPot, updatePot: updatePot, potBalances: potBalances, setAside: setAside,
    /* transactions */
    available: available, addTx: addTx, updateTx: updateTx, deleteTx: deleteTx, getTx: getTx,
    list: list, range: range, mirror: mirror,
    summary: summary, yearSummary: yearSummary, insights: insights, tally: tally,
    /* formatting, CSV, backup */
    toMinor: toMinor, format: format, isPrivate: isPrivate, setPrivate: setPrivate,
    csv: { parse: parseCSV, guess: guessMapping, parseDate: parseDate, preview: previewCSV, import: importRows, export: exportCSV },
    exportAll: exportAll, importAll: importAll,
    PROJECT_MIN_ELAPSED: PROJECT_MIN_ELAPSED, PROJECT_MIN_DAYS: PROJECT_MIN_DAYS
  };
})();
