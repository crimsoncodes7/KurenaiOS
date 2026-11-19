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
  var DB_NAME = "kurenai-os-money" + ((KOS.dataMode && KOS.dataMode.suffix) || ""), DB_VER = 2;
  /* tx: transactions · del: their tombstones · pics: a pot's picture, the
     user's own (source + {x,y,zoom}, KOS.imageCrop), on this device only —
     never fetched, never in the state document */
  var TX = "tx", DEL = "del", PICS = "pics";
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
    ["food", "Food", "out", "essentials", "sage"],
    ["transport", "Transport", "out", "essentials", "sky"],
    ["bills", "Bills", "out", "essentials", "brass"],
    ["health", "Health", "out", "essentials", "clay"],
    ["subscriptions", "Subscriptions", "out", "lifestyle", "iris"],
    ["social", "Social", "out", "lifestyle", "plum"],
    ["clothing", "Clothing", "out", "lifestyle", "clay"],
    ["gifts", "Gifts", "out", "lifestyle", "plum"],
    ["collection", "Collection", "out", "lifestyle", "collection"],
    ["education", "Education and exams", "out", "future", "slate"],
    ["other", "Other", "out", "other", "muted"],
    ["job", "Job", "in", "income", "green"],
    ["allowance", "Allowance", "in", "income", "green"],
    ["gifts-in", "Gifts received", "in", "income", "green"],
    ["grants", "Grants", "in", "income", "green"],
    ["other-in", "Other income", "in", "income", "green"]
  ];
  var GROUPS = ["essentials", "lifestyle", "future", "other", "income"];
  /* a category's colour is a NAME, mapped to the calendar's hue tokens in
     css/components.css ([data-cat-tone]): sage, sky, iris, slate, plum,
     jade, brass, clay, the Collection's own hue, green for income, or muted.
     Savings (pot transfers) is jade. No colour is stored. */
  var TONES = ["sage", "sky", "iris", "slate", "plum", "jade", "brass", "clay", "collection", "green", "muted"];
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
      tone: TONES.indexOf(raw.tone) !== -1 ? raw.tone : (raw.kind === "in" ? "green" : "muted"),
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
      if (m.s === "done") { o.tx = str(m.tx, 80); o.minor = minorOf(m.minor); if (m.changed) o.changed = true; }
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
      /* out (a payment), in (income) or transfer (a set-aside into a pot) */
      kind: raw.kind === "in" ? "in" : raw.kind === "transfer" && raw.pot ? "transfer" : "out",
      cat: raw.kind === "transfer" && raw.pot ? null : (str(raw.cat, 40) || (raw.kind === "in" ? "other-in" : "other")),
      pot: raw.kind === "transfer" && raw.pot ? str(raw.pot, 40) : null,
      payee: str(raw.payee, 80),
      note: str(raw.note, 500),
      minor: minor,
      every: { n: int(every.n, 1, 365, 1), unit: unit },
      start: start,
      end: isISO(raw.end) && raw.end >= start ? raw.end : null,
      /* "ends after N times" — the Nth occurrence is the last */
      count: raw.count == null || raw.count === "" ? null : int(raw.count, 1, 999, null),
      /* the day of the month a monthly or yearly rule falls on; 31 means the
         last day of a shorter month */
      dom: unit === "month" || unit === "year" ? int(raw.dom, 1, 31, parsedStart.getDate()) : null,
      sub: !!raw.sub,
      trialEnd: isISO(raw.trialEnd) ? raw.trialEnd : null,
      /* "Remind me" made a real reminder in Reminders (one canonical store,
         invariant 27); the rule keeps only its id, a link by reference */
      remind: raw.remind == null || raw.remind === "" ? null : int(raw.remind, 1, 1e9, null),
      prices: prices,
      marks: marks,
      /* what a BANK calls this payment (MG-07): payee keys learned when a
         statement's row was matched to an occurrence by its amount alone */
      aliases: (Array.isArray(raw.aliases) ? raw.aliases : []).map(payeeKey)
        .filter(function (a, i, all) { return a && all.indexOf(a) === i; }).slice(0, 12),
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
      /* the user's own line: "For uni. The old one can't run Rider." */
      why: str(raw.why, 140),
      /* the pot that leads Pots as its hero, chosen in ⋯; else the one
         nearest its date with a target */
      pinned: !!raw.pinned,
      archived: !!raw.archived,
      order: int(raw.order, 0, 9999, 0),
      updatedAt: raw.updatedAt || 0
    };
  }
  /* an import that happened (MG-05): what "Undo" and "Replace" act on. Its
     id is the batch id its transactions carry. The closing balance is the
     statement's own (the bank's last figure), one number per import: no
     balance is ever kept on a transaction. */
  function normaliseImport(raw) {
    raw = raw || {};
    var id = str(raw.id, 40);
    if (!id) return null;
    var c = raw.closing, cm = c ? minorOf(c.minor) : null;
    return {
      id: id,
      file: str(raw.file, 120),
      format: str(raw.format, 20) || "csv",
      from: isISO(raw.from) ? raw.from : null,
      to: isISO(raw.to) ? raw.to : null,
      n: int(raw.n, 0, 1000000, 0),
      at: raw.at || 0,
      stmt: str(raw.stmt, 40) || null,
      closing: c && cm != null && isISO(c.date) ? (typeof c.ok === "boolean" ? { minor: cm, date: c.date, ok: c.ok } : { minor: cm, date: c.date }) : null,
      replaced: str(raw.replaced, 40) || null,
      updatedAt: raw.updatedAt || raw.at || 0
    };
  }
  /* a payee's key: what two spellings of one merchant share */
  function payeeKey(name) { return String(name == null ? "" : name).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 60); }
  var MAX_IMPORTS = 200, MAX_PAYEES = 400;
  function defaultCategories() {
    return DEFAULT_CATEGORIES.map(function (d, i) {
      var c = { id: d[0], name: d[1], kind: d[2], group: d[3], tone: d[4], order: i };
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
      pots: [],
      imports: [],
      payees: {}
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
    seen = {};
    (Array.isArray(m.imports) ? m.imports : []).forEach(function (raw) {
      var r = normaliseImport(raw);
      if (r && !seen[r.id]) { seen[r.id] = true; out.imports.push(r); }
    });
    out.imports.sort(function (a, b) { return a.at - b.at; });
    if (out.imports.length > MAX_IMPORTS) out.imports = out.imports.slice(-MAX_IMPORTS);
    /* learned payee rules (MG-08): a keyed map, so two devices merge per payee */
    var pk = m.payees && typeof m.payees === "object" ? m.payees : {};
    Object.keys(pk).map(function (k) {
      var v = pk[k] || {}, key = payeeKey(k);
      return key && str(v.cat, 40) ? { key: key, name: str(v.name, 80) || k, cat: str(v.cat, 40), at: v.at || 0 } : null;
    }).filter(Boolean).sort(function (a, b) { return b.at - a.at; }).slice(0, MAX_PAYEES).forEach(function (v) {
      if (!out.payees[v.key]) out.payees[v.key] = { name: v.name, cat: v.cat, at: v.at };
    });
    return out;
  }
  function data() {
    var s = store.state;
    if (!s.money || s.money.v !== 1) { s.money = normalise(s.money); store.save(); }
    return s.money;
  }
  function touch(rec) { rec.updatedAt = Date.now(); store.save(); return rec; }
  /* a document saved before imports and payee rules reads as having none;
     the fields are made by the first WRITE, never by a read */
  function importList() { var m = data(); return Array.isArray(m.imports) ? m.imports : []; }
  function payeeMap() { var m = data(); return m.payees && typeof m.payees === "object" ? m.payees : {}; }

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
  /* a rule removed; its confirmed transactions stay (they happened) */
  function removeRule(id) {
    var m = data(), before = m.rules.length;
    m.rules = m.rules.filter(function (r) { return r.id !== id; });
    if (m.rules.length !== before) store.save();
    return m.rules.length !== before;
  }
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
  /* "after N times": the date of the Nth occurrence, found once from the
     rule itself (the count is at most 999) */
  function countEnd(r) {
    if (!r.count) return null;
    var open = Object.assign({}, r, { count: null, end: null }), d = r.start, got = [];
    while (got.length < r.count) {
      var more = occurrences(open, d, addDays(d, 3700));
      if (!more.length) break;
      got = got.concat(more);
      d = addDays(more[more.length - 1], 1);
    }
    return got.length >= r.count ? got[r.count - 1] : null;
  }
  /* every occurrence date of `r` in [from, to], computed from the rule alone */
  function occurrences(r, from, to) {
    var out = [], step, i, d, cap = 400;
    if (!r || to < r.start) return out;
    if (from < r.start) from = r.start;
    var end = r.end && r.end < to ? r.end : to;
    var ce = r.count ? countEnd(r) : null;
    if (ce && ce < end) end = ce;
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
    /* the entry may land on another day than the occurrence (a late pay
       marked received, "Move the date"); its id stays the occurrence's */
    var tx = normaliseTx({ syncId: ruleTxId(id, date), date: isISO(opts.date) ? opts.date : date, minor: minor, kind: r.kind, cat: r.cat,
      pot: r.pot, dir: "in", payee: r.payee || r.name, note: r.note, src: "rule", rule: { id: id, date: date } });
    if (!tx) { cb && cb(new Error("This rule's pot no longer exists")); return; }
    function write() {
      putTx(tx, function (err) {
        if (err) { cb && cb(err); return; }
        r.marks[date] = { s: "done", tx: tx.syncId, minor: minor, at: Date.now() };
        if (minor !== amountOn(r, date)) r.marks[date].changed = true;
        touch(r);
        cb && cb(null, tx);
      });
    }
    /* an occurrence a statement already paid (MG-07) is the BANK's entry:
       confirming it again would write over that entry, or add a second */
    var was = r.marks[date];
    if (!was || was.s !== "done" || !was.tx) { write(); return; }
    getTx(was.tx, function (e0, had) {
      if (had && had.src === "csv") { cb && cb(new Error("This one is already counted from your statement")); return; }
      write();
    });
  }
  function skip(id, date, cb) {
    var r = rule(id);
    if (!r) { cb && cb(new Error("No such rule")); return; }
    var was = r.marks[date];
    r.marks[date] = { s: "skip", at: Date.now() };
    touch(r);
    if (was && was.s === "done") releaseTx(was.tx, cb);
    else cb && cb(null);
  }
  /* an occurrence gives up its transaction. One made by Confirm goes with
     it. A BANK's row (an imported entry that was matched to the occurrence,
     MG-07) is real money: it stays, unlinked, under an id of its own, so a
     later Confirm can never be written over it. */
  function releaseTx(syncId, cb) {
    getTx(syncId, function (err, t) {
      if (err || !t || t.src !== "csv") { removeTx(syncId, function (e2) { cb && cb(e2 || null); }); return; }
      var own = !!(t.rule && t.syncId === ruleTxId(t.rule.id, t.rule.date));
      var free = normaliseTx(Object.assign({}, t, { syncId: own ? null : t.syncId, rule: null, updatedAt: Date.now(),
        payee: t.bank && t.bank.text ? merchantOf(t.bank.text, t.bank.type).name || t.payee : t.payee }));
      putRaw([free], function (e2) {
        if (e2 || !own) { if (!e2) soonSync(); cb && cb(e2 || null); return; }
        deleteRaw([t.syncId], true, function (e3) { if (!e3) soonSync(); cb && cb(e3 || null); });
      });
    });
  }
  /* back to "left": the mark goes, and a confirmed occurrence's transaction with it */
  function unmark(id, date, cb) {
    var r = rule(id);
    if (!r || !r.marks[date]) { cb && cb(null); return; }
    var was = r.marks[date];
    delete r.marks[date];
    touch(r);
    if (was.s === "done") releaseTx(was.tx, cb);
    else cb && cb(null);
  }
  /* every occurrence in [from, to] across the active rules, oldest first */
  function upcoming(from, to, now) {
    var out = [];
    rules().forEach(function (r) {
      occurrences(r, from, to).forEach(function (d) {
        var m = r.marks[d];
        out.push({ rule: r.id, name: r.name, date: d, minor: m && m.s === "done" && m.minor ? m.minor : amountOn(r, d),
          kind: r.kind, cat: r.cat, pot: r.pot, sub: r.sub, trial: !!(r.trialEnd && d <= r.trialEnd),
          changed: !!(m && m.changed), state: occurrenceState(r, d, now) });
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
  /* the real yearly cost: twelve monthly payments, or one yearly one */
  function perYear(r) {
    var n = r.every.n, a = r.minor;
    switch (r.every.unit) {
      case "day": return Math.round(a * 365.25 / n);
      case "week": return Math.round(a * 52.1775 / n);
      case "year": return Math.round(a / n);
      default: return Math.round(a * 12 / n);
    }
  }
  /* a free trial still running: listed, not yet counted */
  function inTrial(r, now) { return !!(r.trialEnd && r.trialEnd >= (now || today())); }
  function subscriptions(now) {
    var subs = rules({ sub: true }), paid = subs.filter(function (r) { return !inTrial(r, now); });
    return { items: subs, paid: paid, trials: subs.filter(function (r) { return inTrial(r, now); }),
      perMonth: paid.reduce(function (n, r) { return n + perMonth(r); }, 0),
      perYear: paid.reduce(function (n, r) { return n + perYear(r); }, 0) };
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
      /* one CSV import shares a batch id, so "Undo this import" removes
         exactly those entries */
      batch: str(raw.batch, 40) || null,
      /* an imported row's identity (MG-01, plan §A3): the tuple key, its
         occurrence ordinal within the statement, the bank's id when the
         export has one, and the statement's fingerprint; with the source
         row itself, so a later import can be checked against it */
      imp: raw.imp && raw.imp.k ? { k: str(raw.imp.k, 400), occ: Math.max(1, +raw.imp.occ || 1),
        fitid: str(raw.imp.fitid, 80) || null, stmt: str(raw.imp.stmt, 40) || null } : null,
      raw: Array.isArray(raw.raw) ? raw.raw.slice(0, 16).map(function (c) { return String(c == null ? "" : c).slice(0, 160); }) : null,
      /* the bank's own words and its Type for an imported row (MG-08): the
         payee is the merchant made from them, and this is what it was */
      bank: raw.bank && (raw.bank.text || raw.bank.type) ? { text: str(raw.bank.text, 240), type: str(raw.bank.type, 12) } : null,
      /* an entry that was here BEFORE an import and took that import's
         identity (a confirmed occurrence the statement also listed): the
         batch that gave it, so undoing that import takes it off again */
      adopt: str(raw.adopt, 40) || null,
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
      if (!d.objectStoreNames.contains(PICS)) d.createObjectStore(PICS, { keyPath: "id" });
    };
    rq.onsuccess = function () {
      db = rq.result;
      db.onversionchange = function () { db.close(); db = null; };
      cb(null, db);
    };
    rq.onerror = function () { cb(rq.error); };
  }
  var gen = 0;   /* W8 (AX-25): write transactions begun, as in mediadb */
  function txn(names, mode, fn) {
    if (mode === "readwrite") gen++;
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
  function putTx(tx, cb) { putRaw([tx], function (err) { if (!err) soonSync(); cb && cb(err); }); }
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
  function removeTx(syncId, cb) {
    deleteRaw([syncId], !/^wl:/.test(syncId), function (err) { if (!err) soonSync(); cb && cb(err); });
  }
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
    /* the Badge Wall re-reads this domain shortly after (roadmap 5.16) */
    if (KOS.achievements) KOS.achievements.touch("money");
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
  /* the totals of everything list(opts) would page through, read from
     the index without building a row (audit MG-19: "This view" summed only
     the rows loaded so far): {count, inn, out, pots}, the transactions
     page's own arithmetic — a refund lowers Out, a move to a pot is Out
     and counted apart. */
  function listTotals(opts, cb) {
    opts = opts || {};
    var keep = listFilter(opts), r = { count: 0, inn: 0, out: 0, pots: 0 };
    mirror(function () {
      txn([TX], "readonly", function (err, t) {
        if (err) { cb(err, r); return; }
        var rq = t.objectStore(TX).index("date").openCursor(IDBKeyRange.bound(opts.from || "0000-01-01", opts.to || "9999-12-31"));
        rq.onsuccess = function () {
          var c = rq.result;
          if (!c) { cb(null, r); return; }
          var x = c.value;
          if (keep(x)) {
            r.count++;
            if (x.kind === "in") r.inn += x.minor;
            else if (x.kind === "refund") r.out -= x.minor;
            else if (x.kind === "transfer") { var d = x.dir === "out" ? -x.minor : x.minor; r.pots += d; r.out += d; }
            else r.out += x.minor;
          }
          c.continue();
        };
        rq.onerror = function () { cb(rq.error, r); };
      });
    });
  }
  function listFilter(opts) {
    var q = str(opts.search, 80).toLowerCase();
    return function keep(t) {
      if (opts.kind && t.kind !== opts.kind) return false;
      if (opts.cat && t.cat !== opts.cat && !(t.splits || []).some(function (s) { return s.cat === opts.cat; })) return false;
      if (opts.tag && t.tags.indexOf(opts.tag) === -1) return false;
      if (opts.batch && t.batch !== opts.batch) return false;
      if (opts.src && t.src !== opts.src) return false;
      if (q && (t.payee + " " + t.note + " " + t.tags.join(" ") + " " + (t.bank ? t.bank.text : "")).toLowerCase().indexOf(q) === -1) return false;
      return true;
    };
  }
  function list(opts, cb) {
    opts = opts || {};
    var limit = Math.min(opts.limit || 60, 200), out = [];
    var keep = listFilter(opts);
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

  /* ---------------- a pot's picture ---------------- */
  function getPic(id, cb) {
    txn([PICS], "readonly", function (err, t) {
      if (err) { cb(null); return; }
      var rq = t.objectStore(PICS).get(id);
      rq.onsuccess = function () { cb(rq.result || null); };
      rq.onerror = function () { cb(null); };
    });
  }
  function setPic(id, pic, cb) {
    txn([PICS], "readwrite", function (err, t) {
      if (err) { cb && cb(err); return; }
      if (pic && pic.src) t.objectStore(PICS).put({ id: id, src: String(pic.src), crop: pic.crop || null });
      else t.objectStore(PICS).delete(id);
      t.oncomplete = function () { cb && cb(null); };
      t.onerror = function () { cb && cb(t.error); };
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
    var dk = Object.keys(days).sort();
    s.first = dk[0] || null; s.last = dk[dk.length - 1] || null;
    /* spend per day and its biggest category (the Overview's day chart) */
    s.spendDays = {};
    var dayCat = {};
    rows.forEach(function (t) {
      if (t.kind !== "out" && t.kind !== "refund") return;
      var sign = t.kind === "refund" ? -1 : 1;
      var d = s.spendDays[t.date] = s.spendDays[t.date] || { minor: 0, top: null };
      d.minor += sign * t.minor;
      var dc = dayCat[t.date] = dayCat[t.date] || {};
      (t.splits || [{ cat: t.cat, minor: t.minor }]).forEach(function (p) { dc[p.cat] = (dc[p.cat] || 0) + sign * p.minor; });
    });
    Object.keys(dayCat).forEach(function (d) {
      var best = null;
      Object.keys(dayCat[d]).forEach(function (c) { if (best == null || dayCat[d][c] > dayCat[d][best]) best = c; });
      s.spendDays[d].top = best;
    });
    return s;
  }
  /* THE DAYS MONEY CAN SPEAK FOR (MG-30, GO-18; invariant 76): within
     [from, to], from the first to the last day that has an entry or that
     an import's statement covers. A day outside it has no evidence — an
     empty day is not a no-spend day, and a period with no record at all
     is not a period kept under budget. `seen` is the rows of the range
     or a tally ({first, last}). Pure; null when there is no evidence. */
  function evidence(from, to, seen) {
    var lo = null, hi = null;
    function take(a, b) {
      if (!a || !b) return;
      if (a < from) a = from;
      if (b > to) b = to;
      if (a > b) return;
      if (lo == null || a < lo) lo = a;
      if (hi == null || b > hi) hi = b;
    }
    if (Array.isArray(seen)) seen.forEach(function (t) { if (t && t.date) take(t.date, t.date); });
    else if (seen) take(seen.first, seen.last);
    importList().forEach(function (r) { take(r.from, r.to); });
    return lo ? { from: lo, to: hi } : null;
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
          /* an overspend rolls as a smaller budget, never below zero */
          row.effective = Math.max(0, b + row.rollover);
          row.left = row.effective - row.net;
          row.over = row.left < 0;
          if (!c.archived) s.budgetTotal = (s.budgetTotal || 0) + row.effective;
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
  /* The month as the Overview tells it (design 27b):
       planned income = received + expected (income rules still to land
                        this month; a late one still counts, and says so)
       outgoings      = spent + moved to pots (a transfer is never spend,
                        but it has left what there is to spend)
       left to spend  = planned income − outgoings
       safe today     = (left − bills and set-asides still to come) ÷ the
                        days left, today included
       projection     = spent ÷ days gone × the month's length
     Safe today and the projection need SEVEN days with entries in the
     month (invariant 76); before that they are null and the page says so. */
  var LOW_DATA_DAYS = 7;
  function insights(s, now) {
    now = now || today();
    var inMonth = now >= s.from && now <= s.to;
    var elapsed = inMonth ? daysBetween(s.from, now) + 1 : (now > s.to ? s.length : 0);
    var daysLeft = inMonth ? daysBetween(now, s.to) + 1 : 0;
    var occ = upcoming(s.from, s.to, now).filter(function (o) { return o.state !== "done" && o.state !== "skip"; });
    var expected = occ.filter(function (o) { return o.kind === "in"; });
    var late = expected.filter(function (o) { return o.date < now; }).map(function (o) {
      return Object.assign({ daysLate: daysBetween(o.date, now) }, o);
    });
    var ahead = occ.filter(function (o) { return o.kind !== "in" && o.date >= now && !o.trial; });
    var sum = function (a) { return a.reduce(function (n, o) { return n + o.minor; }, 0); };
    var toPots = s.toPots - s.fromPots;
    var planned = s.income + sum(expected);
    var outAll = s.outgoings + toPots;
    var enough = s.days >= LOW_DATA_DAYS;
    var left = planned || outAll ? planned - outAll : null;
    return {
      elapsed: elapsed, daysLeft: daysLeft, enough: enough, dataDays: s.days,
      received: s.income, expected: sum(expected), expectedList: expected, late: late,
      planned: planned, spent: s.outgoings, toPots: toPots, outgoings: outAll,
      left: left, ahead: sum(ahead), aheadList: ahead,
      safeToday: inMonth && enough && left != null ? Math.max(0, Math.floor((left - sum(ahead)) / daysLeft)) : null,
      projection: inMonth && enough ? Math.round(s.outgoings / elapsed * s.length) : null
    };
  }
  /* the facts for any stretch of days — Month and year compares a month
     with the SAME number of days of the month before (design 27g) */
  function rangeSummary(from, to, cb) {
    range(from, to, function (err, rows) {
      if (err) { cb(err, null); return; }
      var t = tally(rows);
      t.from = from; t.to = to;
      cb(null, t);
    });
  }

  /* ---------------- formatting ---------------- */
  /* one figure: "£1,234.56", a refund or a deficit "−£7.99" (U+2212).
     Hide amounts (per device, `state.ui.moneyHidden`) is drawn by the
     page — KOS.ui.amount keeps the exact text under a mask so nothing
     moves; `format(…, {private: true})` is for plain text that must not
     carry the figure. */
  function isHidden() { return !!(store.state.ui && store.state.ui.moneyHidden); }
  function setHidden(on) { store.state.ui.moneyHidden = !!on; store.save(); }
  function format(minor, opts) {
    opts = opts || {};
    var cur = String(opts.currency || data().currency).trim() || "£", neg = minor < 0, a = Math.abs(Math.round(minor || 0));
    var whole = String(Math.floor(a / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var body = whole + (opts.whole && a % 100 === 0 ? "" : "." + pad(a % 100));
    if (opts.private) body = body.replace(/\d/g, "•");
    var sign = neg ? "−" : (opts.sign && minor > 0 ? "+" : "");
    return /^[A-Z]{3}$/.test(cur) ? sign + body + " " + cur : sign + cur + body;
  }

  /* An amount as plain text that obeys Hide amounts: every figure masked
     ("£••.••") while it is on, so a sentence keeps its shape (audit CL-10:
     the Wishlist, Mangaka and the shelves printed money with it on). */
  function formatShown(minor, opts) {
    var o = {}; opts = opts || {};
    Object.keys(opts).forEach(function (k) { o[k] = opts[k]; });
    if (isHidden()) o.private = true;
    return format(minor, o);
  }

  /* ---------------- import (the engine; W4: MG-02…MG-08, MG-24) ----------------
     Reading the file — its format, header, delimiter and the bank's words —
     is KOS.moneyImport (js/core/moneyimport.js, pure). Here: what a row IS
     against what is stored, what it pays, and what an import leaves behind. */
  var MI = KOS.moneyImport;
  function merchantOf(text, type) { return MI.merchant(text, type); }
  /* ---- learned payee rules (MG-08): FUTURE imports only, never a stored entry ---- */
  function payeeRule(name) { var k = payeeKey(name); return (k && payeeMap()[k]) || null; }
  function payees() {
    var map = payeeMap();
    return Object.keys(map).map(function (k) { return { key: k, name: map[k].name, cat: map[k].cat, at: map[k].at }; })
      .sort(function (a, b) { return b.at - a.at; });
  }
  function learnPayee(name, cat) {
    var k = payeeKey(name), m = data();
    if (!k || !category(cat)) return null;
    if (!m.payees || typeof m.payees !== "object") m.payees = {};
    m.payees[k] = { name: str(name, 80), cat: cat, at: Date.now() };
    var keys = Object.keys(m.payees);
    if (keys.length > MAX_PAYEES) {
      keys.sort(function (a, b) { return m.payees[a].at - m.payees[b].at; }).slice(0, keys.length - MAX_PAYEES)
        .forEach(function (x) { delete m.payees[x]; });
    }
    store.save();
    return m.payees[k];
  }
  function forgetPayee(name) {
    var k = payeeKey(name), m = data();
    if (!m.payees || !m.payees[k]) return false;
    delete m.payees[k];
    store.save();
    return true;
  }
  /* THE IMPORT IDENTITY (MG-01, MG-23; plan §A3). A row is known by
     what the BANK wrote, never by how it was mapped: its date, amount and
     kind plus every other cell of the source row, normalised and sorted (so
     a different payee column, or the same export with its columns
     reordered, is the same row). Identical rows inside one statement are
     told apart by their occurrence ordinal (`occ`: the 1st, 2nd … of that
     tuple), so two genuine same-day payments of the same amount both
     import, and a re-import flags exactly as many as are stored — only the
     surplus is new. A bank id column (FITID, "Transaction ID") wins when
     present; a balance column is part of the row and tells repeats apart
     on its own. Rows imported before this rule carry no `imp` and are
     matched by date, amount and payee, each stored row used up once. */
  function normCell(v) { return String(v == null ? "" : v).toLowerCase().replace(/\s+/g, " ").trim(); }
  function fnv(text, seed) {
    var h = seed || 0x811c9dc5;
    for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ("0000000" + h.toString(16)).slice(-8);
  }
  /* the stored identity is a fixed-length hash of the key (a long row is
     never cut short, so it always matches itself) */
  function idHash(key) { return "h:" + fnv(key) + fnv(key, 0x01000193); }
  /* what the source row keeps: never an account number, a sort code, a card
     number or the running balance (invariant 5a: logistics, not banking) */
  var PRIVATE_COL = /account|sort ?code|iban|card ?(no|number)|balance/i;
  function rowKey(r, mapping, date, minor, kind, also) {
    var skip = {};
    ["date", "amount", "out", "in", "fitid"].concat(also || []).forEach(function (k) { if (mapping[k] != null) skip[mapping[k]] = true; });
    var rest = r.map(function (c, i) { return skip[i] ? null : normCell(c); }).filter(function (c) { return c; }).sort();
    return date + "|" + minor + "|" + kind + "|" + rest.join("␟");
  }
  function catFits(id, kind) {
    var c = id ? category(id) : null;
    return !!(c && !c.archived && c.kind === (kind === "in" ? "in" : "out"));
  }
  function byName(list, name) {
    var n = String(name || "").trim().toLowerCase();
    return n ? list.filter(function (x) { return x.name.toLowerCase() === n; })[0] || null : null;
  }
  /* THE APP'S OWN EXPORT (MG-24), read back without loss: the kind from
     Type, an unsigned amount, the category and the pot by NAME, and the
     lines of one split found again by their Entry. A name this device does
     not have is carried on the row (`catName`, `potName`) and made at
     import; the preview lists them (`creates`). */
  function ownRows(parsed, out) {
    var mp = MI.guess(parsed.header), lines = parsed.lines || [], groups = {}, order = [];
    var creates = { cats: {}, pots: {} };
    function catOf(name, kind) {
      var k = kind === "in" ? "in" : "out", hit = byName(data().categories.filter(function (c) { return c.kind === k; }), name);
      if (hit) return { cat: hit.id };
      if (!String(name || "").trim()) return { cat: k === "in" ? "other-in" : "other" };
      creates.cats[k + "|" + name.trim().toLowerCase()] = { name: name.trim(), kind: k };
      return { cat: null, catName: name.trim() };
    }
    parsed.rows.forEach(function (r, i) {
      var line = lines[i] != null ? lines[i] : i + 2;
      var date = MI.parseDate(r[mp.date], "dmy"), minor = MI.amount(r[mp.amount]);
      var kind = String(r[mp.type] || "").trim().toLowerCase();
      if (KINDS.indexOf(kind) === -1) kind = "out";
      if (!date || !minor) { out.errors.push({ line: line, reason: !date ? "No date I can read" : "No amount" }); return; }
      minor = Math.abs(minor);
      var x = { line: line, date: date, minor: minor, kind: kind, payee: str(r[mp.payee], 80), note: mp.note != null ? str(r[mp.note], 500) : "",
        tags: mp.tags != null ? String(r[mp.tags] || "").split(/\s+/).filter(Boolean) : [], duplicate: false, bank: null, catFrom: "file", own: true,
        raw: r.slice(0, 16), key: rowKey(r, mp, date, minor, kind, ["entry"]) };
      if (kind === "transfer") {
        var pn = mp.pot != null ? String(r[mp.pot] || "").trim() : "", ph = byName(data().pots, pn);
        if (!pn) { out.errors.push({ line: line, reason: "A transfer that names no pot" }); return; }
        x.cat = null; x.pot = ph ? ph.id : null; x.dir = mp.potdir != null && String(r[mp.potdir]).trim().toLowerCase() === "out" ? "out" : "in";
        if (!ph) { x.potName = pn; creates.pots[pn.toLowerCase()] = { name: pn }; }
      } else {
        var c = catOf(mp.category != null ? r[mp.category] : "", kind);
        x.cat = c.cat; if (c.catName) x.catName = c.catName;
      }
      /* the lines of one split share an Entry, a date, a kind and a payee */
      var e = mp.entry != null ? String(r[mp.entry] || "").trim() : "", g = e ? groups[e] : null;
      if (g && kind !== "transfer" && g.date === date && g.kind === kind && g.payee === x.payee) {
        if (!g.splits) g.splits = [{ cat: g.cat, catName: g.catName || null, minor: g.minor }];
        g.splits.push({ cat: x.cat, catName: x.catName || null, minor: minor });
        g.minor += minor;
        return;
      }
      if (e) groups[e] = x;
      order.push(x);
    });
    out.creates = { cats: Object.keys(creates.cats).map(function (k) { return creates.cats[k]; }),
      pots: Object.keys(creates.pots).map(function (k) { return creates.pots[k]; }) };
    return order;
  }
  /* rows → transactions with no side effect. A signed `amount` column is
     an outgoing when negative unless `sign: "positive-out"`; separate in
     and out columns are read as such; an amount column with no minus
     anywhere takes its direction from the bank's Type (DEB, DD, FPI …).
     Each candidate is checked against what is STORED (never against the
     file itself): see the identity above. A mapping with no date or no
     amount is never an error: `needs` names what to choose (MG-02). */
  function previewCSV(parsed, mapping, opts, cb) {
    opts = opts || {}; mapping = mapping || {}; parsed = parsed || {};
    var rowsIn = parsed.rows || [], header = parsed.header || [], lines = parsed.lines || [];
    var own = parsed.format === "kurenai";
    var out = { rows: [], errors: [], duplicates: 0, statement: null, seenStatement: false, needs: [],
      format: parsed.format || "csv", label: parsed.label || "CSV", skipped: parsed.skipped || { before: 0, after: 0, text: [] },
      direction: "sign", reconcile: null, closing: null, overlaps: [], creates: { cats: [], pots: [] } };
    (parsed.issues || []).forEach(function (x) {
      out.errors.push({ line: x.line, reason: "Has " + x.cells + " cells where the header has " + x.expected, cells: x.cells, expected: x.expected });
    });
    if (!own) {
      if (mapping.date == null) out.needs.push("date");
      if (mapping.amount == null && mapping.out == null && mapping.in == null) out.needs.push("amount");
      if (out.needs.length) { cb(null, out); return; }
    }
    var cand, bals = [];
    if (own) cand = ownRows(parsed, out);
    else {
      var fmt = opts.dateFormat || parsed.dateFormat || "dmy", rejoined = {};
      (parsed.rejoined || []).forEach(function (l) { rejoined[l] = true; });
      var byType = mapping.amount != null && mapping.type != null &&
        !rowsIn.some(function (r) { var a = MI.amount(r[mapping.amount]); return a != null && a < 0; }) &&
        rowsIn.some(function (r) { return MI.direction(r[mapping.type]); });
      out.direction = mapping.amount == null ? "columns" : byType ? "type" : "sign";
      var learned = payeeMap();
      cand = [];
      rowsIn.forEach(function (r, i) {
        var line = lines[i] != null ? lines[i] : i + 2;
        var date = MI.parseDate(r[mapping.date], fmt === "iso" ? "dmy" : fmt);
        var minor = null, kind = "out", type = mapping.type != null ? str(r[mapping.type], 12) : "";
        if (mapping.amount != null) {
          minor = MI.amount(r[mapping.amount]);
          if (minor != null) {
            var negOut = opts.sign !== "positive-out", dir = byType ? MI.direction(type) : null;
            kind = dir || ((minor < 0) === negOut ? "out" : "in");
            minor = Math.abs(minor);
          }
        } else {
          var o = mapping.out != null ? MI.amount(r[mapping.out]) : null, n = mapping.in != null ? MI.amount(r[mapping.in]) : null;
          if (o) { minor = Math.abs(o); kind = "out"; } else if (n) { minor = Math.abs(n); kind = "in"; }
        }
        if (!date || !minor) { out.errors.push({ line: line, reason: !date ? "No date I can read" : "No amount" }); return; }
        var fitid = mapping.fitid != null ? str(r[mapping.fitid], 80) : "";
        var memo = mapping.note != null ? str(r[mapping.note], 500) : "";
        /* OFX cuts a long name at 32 characters and carries on in the memo */
        var ofx = parsed.format === "ofx";
        var text = (str(r[mapping.payee], 240) + (ofx && memo ? " " + memo : "")).trim().slice(0, 240);
        var mer = merchantOf(text, type), rule = mer.name ? learned[payeeKey(mer.name)] : null;
        var x = { line: line, date: date, minor: minor, kind: kind, duplicate: false,
          payee: ((rule && rule.name) || mer.name || text).slice(0, 80), note: ofx ? "" : memo,
          bank: text || type ? { text: text, type: type } : null, tags: [],
          fitid: fitid || null,
          /* a bank id is trusted only WITH its date and amount: some exports
             number their rows, or restart ids each day */
          key: fitid ? date + "|" + minor + "|" + kind + "|fitid:" + fitid : rowKey(r, mapping, date, minor, kind),
          raw: r.slice(0, 16).map(function (c, ci) { return PRIVATE_COL.test(String(header[ci] || "")) ? "" : c; }) };
        if (rule && catFits(rule.cat, kind)) { x.cat = rule.cat; x.catFrom = "learned"; }
        else if (mer.cat && catFits(mer.cat, kind)) { x.cat = mer.cat; x.catFrom = "table"; }
        else { x.cat = kind === "in" ? (opts.inCat || "other-in") : (opts.outCat || "other"); x.catFrom = "default"; }
        if (rejoined[line]) x.rejoined = true;
        if (mapping.balance != null) bals.push({ signed: kind === "in" ? minor : -minor, bal: MI.amount(r[mapping.balance]), date: date });
        cand.push(x);
      });
    }
    var occ = {};
    cand.forEach(function (x) {
      var k = idHash(x.key);
      occ[k] = (occ[k] || 0) + 1;
      x.imp = { k: k, occ: occ[k], fitid: x.fitid || null };
      delete x.key; delete x.fitid;
      out.rows.push(x);
    });
    if (!own && mapping.balance != null) {
      var chk = MI.balanceCheck(bals);
      if (chk) out.reconcile = { ok: chk.ok, order: chk.order, closing: chk.closing, breaks: chk.breaks.map(function (i) { return out.rows[i].line; }) };
    } else if (parsed.closing) out.reconcile = { ok: null, order: null, closing: parsed.closing, breaks: [] };
    out.closing = out.reconcile ? out.reconcile.closing : null;
    if (!out.rows.length) { cb(null, out); return; }
    /* the statement's fingerprint: its rows' identities, order-free */
    out.statement = fnv(out.rows.map(function (x) { return x.imp.k + "#" + x.imp.occ; }).sort().join("\n"));
    out.rows.forEach(function (x) { x.imp.stmt = out.statement; });
    var dates = out.rows.map(function (x) { return x.date; }).sort();
    out.from = dates[0]; out.to = dates[dates.length - 1];
    out.overlaps = importList().filter(function (r) { return r.stmt !== out.statement && r.from && r.to && r.from <= out.to && r.to >= out.from; });
    range(dates[0], dates[dates.length - 1], function (err, have) {
      var stored = {}, legacy = {}, alike = {};
      /* the same payment through ANOTHER export (the month as CSV, then as
         OFX): the bank's words differ, so the identity does not know it.
         Its day, amount, direction and merchant do. Counted like the
         identity: only as many as are stored, less those the identity
         already claimed, look like ones you have. Two rows that BOTH
         carry the bank's own id are never compared this way: their ids
         already say they are two payments. */
      function alikeKey(date, minor, kind, name) { return date + "|" + minor + "|" + kind + "|" + payeeKey(name); }
      (have || []).forEach(function (t) {
        if (t.src === "csv" && t.bank && t.bank.text) {
          var ak = alikeKey(t.date, t.minor, t.rule ? (t.kind === "in" ? "in" : "out") : t.kind, merchantOf(t.bank.text, t.bank.type).name);
          (alike[ak] = alike[ak] || []).push(!!(t.imp && t.imp.fitid));
        }
        if (t.imp && t.imp.k) {
          stored[t.imp.k] = (stored[t.imp.k] || 0) + 1;
          if (t.imp.stmt === out.statement) out.seenStatement = true;
        } else {
          var lk = t.date + "|" + t.minor + "|" + String(t.payee || "").toLowerCase();
          legacy[lk] = (legacy[lk] || 0) + 1;
        }
      });
      out.rows.forEach(function (x) {
        var dup = x.imp.occ <= (stored[x.imp.k] || 0);
        if (!dup) {
          /* an entry from before the identity: by the bank's words, or by the merchant made from them */
          var keys = [x.bank && x.bank.text ? x.bank.text : null, x.payee].filter(function (v, i, a) { return v != null && a.indexOf(v) === i; });
          for (var i = 0; i < keys.length && !dup; i++) {
            var lk = x.date + "|" + x.minor + "|" + keys[i].toLowerCase();
            if (legacy[lk]) { legacy[lk]--; dup = true; }
          }
        }
        var ak = !x.own && x.bank && x.bank.text ? alikeKey(x.date, x.minor, x.kind, merchantOf(x.bank.text, x.bank.type).name) : null;
        if (dup) {
          /* the identity's own match is used up: it is one of the same kind (with an id, or without) */
          var at = ak && alike[ak] ? alike[ak].indexOf(!!x.imp.fitid) : -1;
          if (at !== -1) alike[ak].splice(at, 1);
          x.duplicate = true; out.duplicates++;
        } else if (ak) x.alike = ak;
      });
      out.rows.forEach(function (x) {
        var ak = x.alike, list = ak ? alike[ak] : null;
        delete x.alike;
        if (!list || !list.length) return;
        var at = x.imp.fitid ? list.indexOf(false) : 0;
        if (at === -1) return;
        list.splice(at, 1);
        x.duplicate = true; x.dupOf = "similar"; out.duplicates++;
      });
      matchRules(out);
      cb(err || null, out);
    });
  }
  /* THE STATEMENT MEETS THE RECURRING RULES (MG-07). A bank row that pays
     an occurrence IS that occurrence: same direction, the occurrence's
     exact amount, dated within three days of it. By NAME when the rule's
     payee, name or a learned alias is among the bank's words; by AMOUNT
     alone only when that occurrence is the row's one candidate and the row
     the occurrence's one. Each occurrence takes one row. An occurrence
     already confirmed makes the row a duplicate: that payment is in the
     books. A skipped occurrence is never matched. */
  var MATCH_DAYS = 3;
  function nameHit(r, x) {
    var keys = [payeeKey(r.payee), payeeKey(r.name)].concat(r.aliases || []).filter(function (k) { return k && k.length >= 3; });
    var hay = [" " + payeeKey(x.bank ? x.bank.text : "") + " ", " " + payeeKey(x.payee) + " "];
    return keys.some(function (k) { return hay[0].indexOf(" " + k + " ") !== -1 || hay[1].indexOf(" " + k + " ") !== -1; });
  }
  function matchRules(out) {
    var active = rules().filter(function (r) { return r.kind === "out" || r.kind === "in"; });
    if (!active.length) return;
    var cands = [], perRow = {}, perOcc = {};
    out.rows.forEach(function (x, xi) {
      if (x.duplicate || x.own || (x.kind !== "out" && x.kind !== "in")) return;
      active.forEach(function (r) {
        if (r.kind !== x.kind) return;
        occurrences(r, addDays(x.date, -MATCH_DAYS), addDays(x.date, MATCH_DAYS)).forEach(function (d) {
          var m = r.marks[d];
          if (m && m.s === "skip") return;
          var done = !!(m && m.s === "done");
          if ((done && m.minor ? m.minor : amountOn(r, d)) !== x.minor) return;
          var key = r.id + "|" + d;
          cands.push({ xi: xi, key: key, rule: r, date: d, named: nameHit(r, x), dist: Math.abs(daysBetween(d, x.date)), done: done, tx: done ? m.tx : null });
          perRow[xi] = (perRow[xi] || 0) + 1; perOcc[key] = (perOcc[key] || 0) + 1;
        });
      });
    });
    var rowTaken = {}, occTaken = {};
    cands.sort(function (a, b) { return (b.named - a.named) || (a.dist - b.dist) || (a.xi - b.xi); }).forEach(function (c) {
      if (rowTaken[c.xi] || occTaken[c.key]) return;
      if (!c.named && (perRow[c.xi] !== 1 || perOcc[c.key] !== 1)) return;
      rowTaken[c.xi] = occTaken[c.key] = true;
      var x = out.rows[c.xi];
      x.match = { rule: c.rule.id, date: c.date, name: c.rule.name, strength: c.named ? "name" : "amount", state: c.done ? "done" : "open", tx: c.tx };
      if (c.done) { x.duplicate = true; x.dupOf = "rule"; out.duplicates++; }
    });
  }
  /* read-modify-write a set of stored transactions in ONE IndexedDB transaction */
  function patchTx(ids, fn, cb) {
    if (!ids.length) { cb && cb(null, 0); return; }
    txn([TX], "readwrite", function (err, t) {
      if (err) { cb && cb(err, 0); return; }
      var os = t.objectStore(TX), n = 0;
      ids.forEach(function (id) {
        var rq = os.get(id);
        rq.onsuccess = function () {
          var next = rq.result ? fn(rq.result) : null;
          if (next) { os.put(next); n++; }
        };
      });
      t.oncomplete = function () { cb && cb(null, n); };
      t.onerror = function () { cb && cb(t.error, 0); };
    });
  }
  var BANK_REPEATS = { dd: 1, so: 1, directdebit: 1, repeatpmt: 1 };
  /* `rows` are the preview's, as the page left them: `duplicate` false is
     taken; a `match` the reader turned down is simply absent. In order:
     the categories and pots the taken rows name are made; a row that pays
     an open occurrence is written UNDER THE OCCURRENCE'S OWN ID (so a
     Confirm on another device is the same record, never a second one) and
     marks it done; a row left out because its occurrence was already
     confirmed gives that entry its identity (adopted: nothing the reader
     sees changes); the import is recorded; and only then is the import it
     replaces undone. A failed write leaves everything as it was. */
  function importRows(rows, opts, cb) {
    opts = opts || {};
    var take = rows.filter(function (x) { return opts.includeDuplicates || !x.duplicate; });
    var left = rows.filter(function (x) { return !(opts.includeDuplicates || !x.duplicate); });
    var batch = rid("b"), m = data(), created = { cats: 0, pots: 0 }, madeCat = {}, madePot = {};
    function catId(name, kind) {
      var k = kind === "in" ? "in" : "out", key = k + "|" + String(name).toLowerCase();
      if (madeCat[key]) return madeCat[key];
      var hit = byName(m.categories.filter(function (c) { return c.kind === k; }), name);
      if (!hit) { hit = addCategory({ name: name, kind: k, group: k === "in" ? "income" : "other" }); created.cats++; }
      return (madeCat[key] = hit.id);
    }
    function potId(name) {
      var key = String(name).toLowerCase();
      if (madePot[key]) return madePot[key];
      var hit = byName(m.pots, name);
      if (!hit) { hit = addPot({ name: name }); created.pots++; }
      return (madePot[key] = hit.id);
    }
    var txs = [], marks = [], suggest = {};
    take.forEach(function (x) {
      var f = { date: x.date, minor: x.minor, kind: x.kind, cat: x.cat, payee: x.payee, note: x.note,
        tags: (x.tags || []).concat(opts.tag ? [opts.tag] : []), src: "csv", batch: batch, imp: x.imp, raw: x.raw, bank: x.bank };
      if (!f.cat && x.catName) f.cat = catId(x.catName, x.kind);
      if (x.splits) f.splits = x.splits.map(function (p) { return { cat: p.cat || catId(p.catName, x.kind), minor: p.minor }; });
      if (x.kind === "transfer") { f.pot = x.pot || (x.potName ? potId(x.potName) : null); f.dir = x.dir; }
      var mt = x.match, r = mt && mt.state === "open" ? rule(mt.rule) : null;
      if (r) {
        var mk = r.marks[mt.date];
        if (mk && mk.s === "done") return;   // confirmed since the preview: already in the books
        if (!mk) {
          f.syncId = ruleTxId(r.id, mt.date); f.kind = r.kind; f.cat = r.cat; f.payee = r.payee || r.name; f.rule = { id: r.id, date: mt.date };
          marks.push({ rule: r, date: mt.date, tx: f.syncId, minor: x.minor, alias: mt.strength === "amount" ? payeeKey(x.payee) : "" });
        }
      } else if (x.kind === "out" && x.bank && BANK_REPEATS[String(x.bank.type).toLowerCase()]) {
        var sk = payeeKey(x.payee) + "|" + x.minor;
        if (!suggest[sk]) suggest[sk] = { name: x.payee, minor: x.minor, cat: x.cat, type: x.bank.type, date: x.date, kind: "out" };
      }
      var t = normaliseTx(f);
      if (t) txs.push(t);
    });
    var adopt = left.filter(function (x) { return x.match && x.match.state === "done" && x.match.tx; });
    putRaw(txs, function (err) {
      if (err) { cb && cb(err, { added: 0, skipped: rows.length, batch: batch }); return; }
      marks.forEach(function (k) {
        k.rule.marks[k.date] = { s: "done", tx: k.tx, minor: k.minor, at: Date.now() };
        if (k.alias && (k.rule.aliases || []).indexOf(k.alias) === -1) k.rule.aliases = (k.rule.aliases || []).concat([k.alias]).slice(-12);
        k.rule.updatedAt = Date.now();
      });
      if (txs.length) {
        var dates = txs.map(function (t) { return t.date; }).sort();
        if (!Array.isArray(m.imports)) m.imports = [];
        m.imports.push(normaliseImport({ id: batch, file: opts.file, format: opts.format, from: dates[0], to: dates[dates.length - 1],
          n: txs.length, at: Date.now(), stmt: take[0] && take[0].imp ? take[0].imp.stmt : null, closing: opts.closing || null,
          replaced: opts.replaces || null }));
        if (m.imports.length > MAX_IMPORTS) m.imports = m.imports.slice(-MAX_IMPORTS);
      }
      if (marks.length || txs.length) store.save();
      patchTx(adopt.map(function (x) { return x.match.tx; }), function (t) {
        if (t.imp && t.imp.k) return null;   // it has an identity already
        var x = adopt.filter(function (a) { return a.match.tx === t.syncId; })[0];
        return normaliseTx(Object.assign({}, t, { imp: x.imp, raw: x.raw, bank: x.bank, adopt: batch, updatedAt: Date.now() }));
      }, function (e2, adopted) {
        var result = { added: txs.length, skipped: rows.length - txs.length, batch: batch, linked: marks.length, adopted: adopted || 0,
          created: created, suggest: Object.keys(suggest).map(function (k) { return suggest[k]; }) };
        function done() { soonSync(); if (KOS.achievements) KOS.achievements.touch("money"); cb && cb(null, result); }
        if (opts.replaces && txs.length) undoBatch(opts.replaces, function () { done(); });
        else done();
      });
    });
  }
  /* ---- what an import left behind (MG-05) ---- */
  function imports() { return importList().slice().sort(function (a, b) { return b.at - a.at; }); }
  /* how many of each import's entries are still stored: {batch: n} */
  function importCounts(cb) {
    allTx(function (err, rows) {
      var n = {};
      (rows || []).forEach(function (t) { if (t.batch) n[t.batch] = (n[t.batch] || 0) + 1; });
      cb(err || null, n);
    });
  }
  /* remove exactly one import: its entries (tombstoned like any deletion),
     the occurrences those entries had marked done (open again), what it
     gave an entry that was here before it, and its record */
  function undoBatch(batch, cb) {
    allTx(function (err, rows) {
      if (err) { cb && cb(err); return; }
      var mine = rows.filter(function (t) { return t.batch === batch; });
      var adopted = rows.filter(function (t) { return t.adopt === batch && t.batch !== batch; });
      var m = data(), dirty = false;
      mine.forEach(function (t) {
        var r = t.rule ? rule(t.rule.id) : null, mk = r ? r.marks[t.rule.date] : null;
        if (mk && mk.s === "done" && mk.tx === t.syncId) { delete r.marks[t.rule.date]; r.updatedAt = Date.now(); dirty = true; }
      });
      if (Array.isArray(m.imports) && m.imports.some(function (r) { return r.id === batch; })) {
        m.imports = m.imports.filter(function (r) { return r.id !== batch; });
        dirty = true;
      }
      if (dirty) store.save();
      deleteRaw(mine.map(function (t) { return t.syncId; }), true, function (e2) {
        if (e2) { cb && cb(e2); return; }
        putRaw(adopted.map(function (t) {
          return normaliseTx(Object.assign({}, t, { imp: null, raw: null, bank: null, adopt: null, updatedAt: Date.now() }));
        }).filter(Boolean), function (e3) { soonSync(); cb && cb(e3 || null, mine.length); });
      });
    });
  }
  /* ---- Confirm meets the bank (MG-07, the other way round) ---- */
  /* the stored bank entries that could BE this occurrence */
  function bankMatches(ruleId, date, cb) {
    var r = rule(ruleId);
    if (!r || (r.kind !== "out" && r.kind !== "in") || occurrences(r, date, date)[0] !== date) { cb(null, []); return; }
    var want = amountOn(r, date);
    range(addDays(date, -MATCH_DAYS), addDays(date, MATCH_DAYS), function (err, rows) {
      cb(err || null, (rows || []).filter(function (t) { return t.src === "csv" && !t.rule && t.kind === r.kind && t.minor === want; })
        .sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; }));
    });
  }
  /* the occurrence IS that bank entry: no new transaction */
  function confirmWith(ruleId, date, syncId, cb) {
    var r = rule(ruleId);
    if (!r || occurrences(r, date, date)[0] !== date) { cb && cb(new Error("Not an occurrence of this rule")); return; }
    if (r.marks[date] && r.marks[date].s === "done") { cb && cb(new Error("This one is already confirmed")); return; }
    getTx(syncId, function (err, t) {
      if (err || !t) { cb && cb(err || new Error("No such transaction")); return; }
      if (t.src !== "csv" || t.rule || t.kind !== r.kind) { cb && cb(new Error("That entry cannot stand for this payment")); return; }
      var next = normaliseTx(Object.assign({}, t, { rule: { id: r.id, date: date }, updatedAt: Date.now(),
        cat: t.cat === "other" || t.cat === "other-in" ? r.cat : t.cat }));
      putTx(next, function (e2) {
        if (e2) { cb && cb(e2); return; }
        r.marks[date] = { s: "done", tx: next.syncId, minor: next.minor, at: Date.now() };
        if (next.minor !== amountOn(r, date)) r.marks[date].changed = true;
        var alias = payeeKey(next.bank && next.bank.text ? merchantOf(next.bank.text, next.bank.type).name : next.payee);
        if (alias && (r.aliases || []).indexOf(alias) === -1) r.aliases = (r.aliases || []).concat([alias]).slice(-12);
        touch(r);
        cb && cb(null, next);
      });
    });
  }
  function csvCell(v) { v = String(v == null ? "" : v); return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  /* the app's own file (MG-24): what `ownRows` reads back without loss.
     "Pot direction" is a transfer's way (into the pot, or out of it) and
     "Entry" numbers the transactions, so the lines of one split share one. */
  function exportCSV(from, to, cb) {
    range(from || "0000-01-01", to || "9999-12-31", function (err, rows) {
      if (err) { cb(err); return; }
      var names = {};
      data().categories.forEach(function (c) { names[c.id] = c.name; });
      var potNames = {};
      data().pots.forEach(function (p) { potNames[p.id] = p.name; });
      var lines = [MI.KURENAI_HEADER.join(",")];
      rows.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; }).forEach(function (t, n) {
        (t.splits || [{ cat: t.cat, minor: t.minor }]).forEach(function (p) {
          lines.push([t.date, t.kind, (p.minor / 100).toFixed(2), names[p.cat] || p.cat || "", t.payee, t.note,
            t.tags.join(" "), t.pot ? potNames[t.pot] || "" : "", t.kind === "transfer" ? t.dir || "in" : "", n + 1].map(csvCell).join(","));
        });
      });
      cb(null, lines.join("\n") + "\n");
    });
  }

  /* ---------------- backup (store.snapshotFull / importFull) ---------------- */
  /* Everything typed here; the mirrored purchases are derived from the
     planner's history, which the state document already carries. */
  function exportAll(cb) {
    txn([TX, DEL, PICS], "readonly", function (err, t) {
      if (err) { cb(err); return; }
      var out = { tx: [], del: [], pics: [] };
      var a = t.objectStore(TX).getAll(), b = t.objectStore(DEL).getAll(), c = t.objectStore(PICS).getAll();
      t.oncomplete = function () {
        out.tx = (a.result || []).filter(function (r) { return r.src !== "wishlist"; });
        out.del = b.result || [];
        /* AA-13: a pot's own picture rides the backup too */
        out.pics = (c.result || []).filter(function (p) { return p && p.id != null && typeof p.src === "string"; });
        cb(null, out);
      };
      t.onerror = function () { cb(t.error); };
    });
  }
  function importAll(dump, cb) {
    var rows = ((dump && dump.tx) || []).map(normaliseTx).filter(function (r) { return r && r.src !== "wishlist"; });
    var dels = ((dump && dump.del) || []).filter(function (d) { return d && d.syncId; });
    var pics = Array.isArray(dump && dump.pics) ? dump.pics.filter(function (p) { return p && p.id != null && typeof p.src === "string"; }) : null;
    txn([TX, DEL, PICS], "readwrite", function (err, t) {
      if (err) { cb(err); return; }
      t.objectStore(TX).clear(); t.objectStore(DEL).clear();
      rows.forEach(function (r) { t.objectStore(TX).put(r); });
      dels.forEach(function (d) { t.objectStore(DEL).put({ syncId: String(d.syncId), at: d.at || 0 }); });
      /* a backup from before pictures rode it leaves the pictures here as they are */
      if (pics) { t.objectStore(PICS).clear(); pics.forEach(function (p) { t.objectStore(PICS).put({ id: p.id, src: p.src, crop: p.crop || null }); }); }
      t.oncomplete = function () { mirrorSig = null; cb(null, { tx: rows.length }); };
      t.onerror = function () { cb(t.error); };
    });
  }

  /* ---------------- replication (phase 5): kos_money ----------------
     Local first (invariant 31): signed out, or in an Empty/Sample review
     namespace, nothing is sent. PUSH then PULL (invariant 33): every
     transaction or tombstone whose stamp (its own updatedAt, or "del")
     differs from what this device last pushed is upserted; then the rows
     changed on the server since the cursor are applied — this device's
     own echo (same stamp) is skipped, and a remote deletion deletes here
     without a new tombstone, so it is never sent back (invariant 32). No
     clock is compared between devices: the server's updated_at is only a
     cursor. The planner's mirrored purchases are never sent. */
  var cloudApi = null, syncing = false, syncTimer = null, syncStarted = false;
  var SYNC_PAGE = 200, PUSH_CHUNK = 100;
  function realCloud() {
    function c() { return KOS.cloud.client(); }
    function run(b, cb) {
      b.then(function (res) { res.error ? cb(new Error(res.error.message || "Money sync failed.")) : cb(null, res.data); })
        .catch(function (e) { cb(new Error((e && e.message) || "Money sync failed — network?")); });
    }
    return {
      since: function (stamp, offset, cb) {
        var q = c().from("kos_money").select("sync_id, deleted, stamp, data_json, updated_at");
        if (stamp) q = q.gt("updated_at", stamp);
        run(q.order("updated_at", { ascending: true }).range(offset, offset + SYNC_PAGE - 1), cb);
      },
      upsert: function (rows, cb) {
        run(c().from("kos_money").upsert(rows, { onConflict: "user_id,sync_id" }).select("sync_id, updated_at"), cb);
      }
    };
  }
  function cloud() { return cloudApi || realCloud(); }
  function canSync() {
    return !!(KOS.cloud && KOS.cloud.signedIn && KOS.cloud.signedIn() && KOS.mediadb && KOS.mediadb.available() &&
      available() && !(KOS.dataMode && KOS.dataMode.mode));
  }
  function readAll(cb) {
    txn([TX, DEL], "readonly", function (err, t) {
      if (err) { cb(err); return; }
      var a = t.objectStore(TX).getAll(), b = t.objectStore(DEL).getAll();
      t.oncomplete = function () { cb(null, a.result || [], b.result || []); };
      t.onerror = function () { cb(t.error); };
    });
  }
  function syncCloud(cb) {
    if (syncing || !canSync()) { cb && cb(null, { pushed: 0, pulled: 0, skipped: true }); return; }
    syncing = true;
    var uid = KOS.cloud.userId(), key = "money.sync." + uid, out = { pushed: 0, pulled: 0, deleted: 0 };
    function finish(err, meta) {
      KOS.mediadb.setKV(key, meta, function () { syncing = false; cb && cb(err || null, out); });
    }
    KOS.mediadb.getKV(key, function (e0, meta) {
      meta = meta && typeof meta === "object" ? meta : {};
      meta.pushed = meta.pushed || {};
      readAll(function (e1, rows, dels) {
        if (e1) { syncing = false; cb && cb(e1, out); return; }
        var up = [];
        rows.forEach(function (r) {
          if (r.src === "wishlist") return;
          var st = String(r.updatedAt || 0);
          if (meta.pushed[r.syncId] !== st) up.push({ user_id: uid, sync_id: r.syncId, deleted: false, stamp: st, data_json: r });
        });
        dels.forEach(function (d) {
          if (meta.pushed[d.syncId] !== "del") up.push({ user_id: uid, sync_id: d.syncId, deleted: true, stamp: "del", data_json: {} });
        });
        var j = 0;
        (function chunk() {
          if (j >= up.length) { pull(); return; }
          var slice = up.slice(j, j + PUSH_CHUNK);
          j += PUSH_CHUNK;
          cloud().upsert(slice, function (e2) {
            if (e2) { finish(e2, meta); return; }
            slice.forEach(function (r) { meta.pushed[r.sync_id] = r.stamp; });
            out.pushed += slice.length;
            chunk();
          });
        })();
      });
      function pull() {
        var offset = 0, maxTs = meta.cursor || null;
        (function page() {
          cloud().since(KOS.sideSync ? KOS.sideSync.since(meta.cursor) : meta.cursor || null, offset, function (e3, rows) {
            if (e3) { finish(e3, meta); return; }
            rows = rows || [];
            var puts = [], gone = [];
            rows.forEach(function (row) {
              if (!maxTs || row.updated_at > maxTs) maxTs = row.updated_at;
              if (meta.pushed[row.sync_id] === row.stamp) return;   // our own echo
              if (row.deleted) { gone.push(row.sync_id); meta.pushed[row.sync_id] = "del"; return; }
              var t = normaliseTx(row.data_json);
              if (!t || t.src === "wishlist" || t.syncId !== row.sync_id) return;
              puts.push(t);
              meta.pushed[t.syncId] = String(t.updatedAt || 0);
            });
            /* a remote deletion leaves no tombstone here (it is not ours to send) */
            deleteRaw(gone, false, function () {
              putRaw(puts, function () {
                out.pulled += puts.length; out.deleted += gone.length;
                /* a confirmed occurrence that another device deleted goes back to "left" */
                gone.forEach(function (id) {
                  var m = /^r:(.+):(\d{4}-\d{2}-\d{2})$/.exec(id), r = m && rule(m[1]);
                  if (r && r.marks[m[2]] && r.marks[m[2]].tx === id) { delete r.marks[m[2]]; touch(r); }
                });
                if (rows.length === SYNC_PAGE) { offset += SYNC_PAGE; page(); return; }
                meta.cursor = maxTs;
                finish(null, meta);
              });
            });
          });
        })();
      }
    });
  }
  /* DI-20: each run's outcome is recorded and shown on Account & Cloud Sync, and a pull that
     brought something names this store to the change bus (js/core/sidesync.js) */
  if (KOS.sideSync) syncCloud = KOS.sideSync.wrap({ id: "money", label: "Money", key: "db:money" }, syncCloud);
  /* a change worth sending soon (a transaction typed, confirmed, imported) */
  function soonSync() {
    if (!syncStarted) return;
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(function () { syncTimer = null; syncCloud(); }, 2000);
  }
  /* once after boot, then every 30 minutes (invariant 36c: a safety net) */
  function start() {
    if (syncStarted || !available()) return;
    syncStarted = true;
    setTimeout(function () { syncCloud(); tick(); }, 9000);
    setInterval(function () { syncCloud(); tick(); }, 30 * 60 * 1000);
  }

  /* ---------------- notices (the `money` notification kind) ----------------
     Pure, from the rules alone: a free trial ending tomorrow, a bill two
     days ahead, income a day late. Ids are natural (money:<rule>:<date>),
     so the ledger never repeats one (invariant 95). With Hide amounts on,
     a notice drops its figure rather than masking it. */
  var DAY3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function dayLabel(d) { var x = parseISO(d); return DAY3[x.getDay()] + " " + x.getDate() + " " + MON3[x.getMonth()]; }
  /* opts.hide: leave every amount out whatever Hide amounts says — the
     closed-app outlook never sends a figure (docs/server-runner-plan.md §3) */
  function notices(now, opts) {
    now = now || today();
    var out = [], hide = isHidden() || !!(opts && opts.hide), tomorrow = addDays(now, 1), inTwo = addDays(now, 2), yesterday = addDays(now, -1);
    rules().forEach(function (r) {
      if (r.trialEnd === tomorrow) {
        out.push({ id: "money:" + r.id + ":" + r.trialEnd, kind: "money", title: r.name + ": the free trial ends tomorrow. Cancel before " + dayLabel(r.trialEnd) + ".",
          body: "", view: "money", arg: "recurring" });
      }
      occurrences(r, yesterday, inTwo).forEach(function (d) {
        var st = occurrenceState(r, d, now), fig = hide ? "" : " · " + format(amountOn(r, d));
        if (st === "done" || st === "skip") return;
        if (r.kind !== "in" && d === inTwo && !(r.trialEnd && d <= r.trialEnd)) {
          out.push({ id: "money:" + r.id + ":" + d, kind: "money", view: "money", arg: "recurring", body: "",
            title: r.kind === "transfer" ? r.name + " set-aside on " + dayLabel(d) + fig
              : r.name + (r.sub ? " renews on " : " is due on ") + dayLabel(d) + fig });
        }
        if (r.kind === "in" && d === yesterday) {
          out.push({ id: "money:" + r.id + ":" + d + ":late", kind: "money", view: "money", arg: "overview", body: "Still expected; mark it received when it lands.",
            title: r.name + " has not arrived yet — expected " + dayLabel(d) + fig });
        }
      });
    });
    return out;
  }
  function tick(cb) {
    var sent = [];
    if (KOS.notify && KOS.notify.push) notices().forEach(function (n) { if (KOS.notify.push(n)) sent.push(n.id); });
    cb && cb(null, sent);
  }

  /* open (and on first run create) the database at load, so the first
     read or backup does not also pay for the upgrade; and pass the state
     document's part through its gate now, so no page's first render is
     the write that creates it (render purity, smoke56) */
  if (available()) open(function () {});
  data();

  KOS.money = {
    gen: function () { return gen; },
    /* state document */
    normalise: normalise, data: data, normaliseCategory: normaliseCategory, normaliseRule: normaliseRule,
    normalisePot: normalisePot, normaliseTx: normaliseTx,
    categories: categories, category: category, addCategory: addCategory, updateCategory: updateCategory,
    budgetOf: budgetOf, setBudget: setBudget,
    setCurrency: function (c) { data().currency = str(c, 3) || "£"; store.save(); return data().currency; },
    setMonthStart: function (d) { data().monthStart = int(d, 1, 28, 1); store.save(); return data().monthStart; },
    periodKey: periodKey, periodRange: periodRange, shiftKey: shiftKey,
    rules: rules, rule: rule, addRule: addRule, updateRule: updateRule, removeRule: removeRule, occurrences: occurrences,
    amountOn: amountOn, setPrice: setPrice, priceChange: priceChange, occurrenceState: occurrenceState, perYear: perYear, inTrial: inTrial,
    confirm: confirm, skip: skip, unmark: unmark, upcoming: upcoming, perMonth: perMonth,
    subscriptions: subscriptions,
    pots: pots, pot: pot, addPot: addPot, updatePot: updatePot, potBalances: potBalances, setAside: setAside,
    /* transactions */
    available: available, addTx: addTx, updateTx: updateTx, deleteTx: deleteTx, getTx: getTx,
    list: list, range: range, mirror: mirror,
    summary: summary, yearSummary: yearSummary, insights: insights, tally: tally, evidence: evidence,
    /* formatting, CSV, backup */
    listTotals: listTotals, toMinor: toMinor, format: format, formatShown: formatShown, isHidden: isHidden, setHidden: setHidden, rangeSummary: rangeSummary,
    getPic: getPic, setPic: setPic, undoBatch: undoBatch, LOW_DATA_DAYS: LOW_DATA_DAYS,
    csv: { parse: MI.read, guess: MI.guess, parseDate: MI.parseDate, decode: MI.decode, preview: previewCSV, import: importRows, export: exportCSV },
    imports: imports, importCounts: importCounts, normaliseImport: normaliseImport,
    payeeKey: payeeKey, payeeRule: payeeRule, learnPayee: learnPayee, forgetPayee: forgetPayee, payees: payees,
    bankMatches: bankMatches, confirmWith: confirmWith,
    exportAll: exportAll, importAll: importAll,
    syncCloud: syncCloud, start: start, _setCloudApi: function (api) { cloudApi = api; },
    notices: notices, tick: tick, TONES: TONES.slice()
  };
})();
