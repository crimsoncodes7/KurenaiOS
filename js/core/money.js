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
    putTx(tx, function (err) {
      if (err) { cb && cb(err); return; }
      r.marks[date] = { s: "done", tx: tx.syncId, minor: minor, at: Date.now() };
      if (minor !== amountOn(r, date)) r.marks[date].changed = true;
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
    var cur = data().currency, neg = minor < 0, a = Math.abs(Math.round(minor || 0));
    var whole = String(Math.floor(a / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var body = whole + (opts.whole && a % 100 === 0 ? "" : "." + pad(a % 100));
    if (opts.private) body = body.replace(/\d/g, "•");
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
    var batch = rid("b");
    var txs = take.map(function (x) {
      return normaliseTx({ date: x.date, minor: x.minor, kind: x.kind, cat: x.cat, payee: x.payee, note: x.note,
        tags: opts.tag ? [opts.tag] : [], src: "csv", batch: batch });
    }).filter(Boolean);
    putRaw(txs, function (err) {
      if (!err) soonSync();
      cb && cb(err || null, { added: err ? 0 : txs.length, skipped: rows.length - txs.length, batch: batch });
    });
  }
  /* remove exactly one import's entries (tombstoned like any deletion) */
  function undoBatch(batch, cb) {
    allTx(function (err, rows) {
      if (err) { cb && cb(err); return; }
      var ids = rows.filter(function (t) { return t.batch === batch; }).map(function (t) { return t.syncId; });
      deleteRaw(ids, true, function (e2) { if (!e2) soonSync(); cb && cb(e2 || null, ids.length); });
    });
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
          cloud().since(meta.cursor || null, offset, function (e3, rows) {
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
    /* state document */
    normalise: normalise, data: data, normaliseCategory: normaliseCategory, normaliseRule: normaliseRule,
    normalisePot: normalisePot, normaliseTx: normaliseTx,
    categories: categories, category: category, addCategory: addCategory, updateCategory: updateCategory,
    budgetOf: budgetOf, setBudget: setBudget,
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
    summary: summary, yearSummary: yearSummary, insights: insights, tally: tally,
    /* formatting, CSV, backup */
    toMinor: toMinor, format: format, isHidden: isHidden, setHidden: setHidden, rangeSummary: rangeSummary,
    getPic: getPic, setPic: setPic, undoBatch: undoBatch, LOW_DATA_DAYS: LOW_DATA_DAYS,
    csv: { parse: parseCSV, guess: guessMapping, parseDate: parseDate, preview: previewCSV, import: importRows, export: exportCSV },
    exportAll: exportAll, importAll: importAll,
    syncCloud: syncCloud, start: start, _setCloudApi: function (api) { cloudApi = api; },
    notices: notices, tick: tick, TONES: TONES.slice()
  };
})();
