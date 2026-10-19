/* Kurenai OS — core/goals.js
   Goals (roadmap 5.4, phase 3): one engine for goals about every part of
   the app, not only the Collection.

   A goal TYPE is registered by the domain that owns its data
   (`KOS.goals.register(def)`), and its `measure` READS that single source
   (invariant 26d) — the session ledger, the topic bands, Money, Code's
   evidence, the media vault. Progress is never stored as a second record:
   `lastCurrent`/`progress` are a cache for search and the Assistant, and
   every surface asks `compute()`.

     def = { id, domain, label, icon, unit, direction: "reach" | "under",
             auto (false = a manual counter), repeat (true when the measure
             can be read over ANY past range, so a goal may repeat weekly or
             monthly and each ended period be judged), displayOnly (a
             Governor value: shown, never a claim of reward),
             fields: { module, filter, linked, subject, pot, category, … }
             (what the editor asks for), onCreate(goal) (a baseline taken
             when the goal is made), measure(goal, ctx, cb) → cb({current,
             target?, unit, meta}) }
     ctx = { from, to, today, stats(cb) (the vault's aggregate, read once
             per compute) }

   A REPEATING goal ("10 hours a week") is one record with `repeat`
   "week" | "month". The current period is measured live; each period that
   has ENDED is judged once and saved as its outcome
   (`outcomes["2026-10-12"] = {met, value, target, at}`), so a run of weeks
   met is read from them. Only the outcomes are stored.

   GOVERNOR BOUNDARY (invariant 5b): a goal completing records ONE
   idempotent `completionLedger[id]` receipt, `payout: "activity-only"`,
   and never logs a session or pays — the activity it measures already
   paid through its own entry. A Governor-value goal records
   `payout: "none"`: reading a value never pays for it.                   */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;
  var TYPES = [], BY_ID = {};
  var DOMAINS = ["study", "productivity", "money", "code", "collection", "governor"];
  var REPEATS = ["week", "month"];
  var MAX_OUTCOMES = 104;

  /* ---------------- dates ---------------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parseISO(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(s, n) { var d = parseISO(s); d.setDate(d.getDate() + n); return iso(d); }
  function daysBetween(a, b) { return Math.round((parseISO(b) - parseISO(a)) / 86400000); }
  function todayISO() { return iso(new Date()); }
  function cleanDate(v) { return /^\d{4}-\d{2}-\d{2}$/.test(String(v || "")) ? String(v) : null; }
  function monthEndISO() {
    var d = new Date(), end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return iso(end);
  }
  function weekStart(s) { var d = parseISO(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); }
  /* the period of a repeating goal holding `date`: {key, from, to}. A
     Money goal's month follows Money's month start (a payday month). */
  function periodOf(g, date) {
    if (g.repeat === "week") { var ws = weekStart(date); return { key: ws, from: ws, to: addDays(ws, 6) }; }
    if (g.domain === "money" && KOS.money) {
      var r = KOS.money.periodRange(KOS.money.periodKey(date));
      return { key: r.key, from: r.from, to: r.to };
    }
    var d = parseISO(date), first = new Date(d.getFullYear(), d.getMonth(), 1);
    return { key: iso(first).slice(0, 7), from: iso(first), to: iso(new Date(d.getFullYear(), d.getMonth() + 1, 0)) };
  }
  function nextPeriod(g, p) { return periodOf(g, addDays(p.to, 1)); }

  /* ---------------- the registry ---------------- */
  function register(def) {
    if (!def || !def.id || BY_ID[def.id]) return BY_ID[def && def.id] || null;
    var d = Object.assign({ domain: "collection", icon: "標", unit: "", direction: "reach", auto: true,
      repeat: false, displayOnly: false, fields: {} }, def);
    if (DOMAINS.indexOf(d.domain) === -1) d.domain = "collection";
    /* the flat flags the Planner's editor has always read */
    d.module = !!d.fields.module; d.linked = !!d.fields.linked; d.filter = !!d.fields.filter;
    d.inverse = d.direction === "under";
    TYPES.push(d);
    BY_ID[d.id] = d;
    return d;
  }
  function typeDef(id) { return BY_ID[id] || BY_ID["custom-manual"]; }
  function types(opts) {
    opts = opts || {};
    return TYPES.filter(function (d) { return !opts.domain || d.domain === opts.domain; }).slice();
  }

  /* ---------------- the record ---------------- */
  var MODULES = ["", "anime", "books", "vn", "game"];
  /* goals saved before the registry (v1 metrics) */
  var LEGACY = {
    "anime-completed": ["titles-completed", "anime"],
    "books-completed": ["titles-completed", "books"],
    "vn-completed": ["titles-completed", "vn"],
    "game-completed": ["titles-completed", "game"],
    "all-completed": ["titles-completed", ""],
    "anime-episodes": ["episodes-watched", "anime"],
    "books-volumes": ["volumes-read", "books"],
    "all-library": ["library-size", ""],
    "genre": ["filtered-completed", ""],
    "purchases": ["purchases", ""],
    "favourites": ["favourites", ""]
  };
  function num(v, fallback, min) {
    v = Number(v);
    return isFinite(v) ? Math.max(min == null ? 0 : min, Math.round(v * 100) / 100) : fallback;
  }
  function cleanLinks(raw) {
    raw = raw && typeof raw === "object" ? raw : {};
    var refs = Array.isArray(raw.refs) ? raw.refs : [];
    if (KOS.spec && KOS.spec.normaliseRefs) refs = KOS.spec.normaliseRefs(refs);
    var out = {};
    if (refs.length) out.refs = refs;
    if (raw.subject && KOS.subjects && KOS.subjects.ids().indexOf(raw.subject) !== -1) out.subject = raw.subject;
    if (raw.assignmentId != null && raw.assignmentId !== "") out.assignmentId = Number(raw.assignmentId);
    if (raw.eventId != null && raw.eventId !== "") out.eventId = Number(raw.eventId);
    if (raw.pot) out.pot = String(raw.pot).slice(0, 40);
    if (raw.category) out.category = String(raw.category).slice(0, 40);
    if (raw.capstone) out.capstone = String(raw.capstone).slice(0, 40);
    return out;
  }
  /* THE SCHEMA GATE for a goal (v3). Unknown type ids are KEPT as they are
     (a type registered by a module that loads later is not "unknown"), so
     a normalise can never turn a goal into a manual one. */
  function normalise(raw) {
    raw = raw || {};
    var legacy = LEGACY[raw.metric] || null;
    var type = raw.type || (raw.kind === "manual" ? "custom-manual" : legacy ? legacy[0] : raw.metric || "titles-completed");
    type = String(type).slice(0, 40);
    var def = BY_ID[type] || null;
    var auto = def ? def.auto : raw.kind !== "manual";
    var module = raw.module || (legacy && legacy[1]) || "";
    if (MODULES.indexOf(module) === -1) module = "";
    var filterKind = raw.filterKind || (raw.metric === "genre" ? "genre" : "");
    var filterValue = raw.filterValue || raw.genre || "";
    var description = String(raw.description != null ? raw.description : raw.detail || "").trim().slice(0, 700);
    var domain = DOMAINS.indexOf(raw.domain) !== -1 ? raw.domain : def ? def.domain : "collection";
    /* a type's own domain wins over a stale stored one; a manual goal
       keeps the domain it was filed under */
    if (def && type !== "custom-manual") domain = def.domain;
    var repeat = REPEATS.indexOf(raw.repeat) !== -1 && (!def || def.repeat) ? raw.repeat : null;
    var outcomes = {};
    if (repeat && raw.outcomes && typeof raw.outcomes === "object") {
      Object.keys(raw.outcomes).sort().slice(-MAX_OUTCOMES).forEach(function (k) {
        var o = raw.outcomes[k];
        if (o && typeof o === "object") outcomes[k] = { met: !!o.met, value: num(o.value, 0, 0), target: num(o.target, 1, 0), at: o.at || 0 };
      });
    }
    var target = num(raw.target, 1, def && def.direction === "under" ? 0 : 1);
    var milestones = (Array.isArray(raw.milestones) ? raw.milestones : []).map(Number)
      .filter(function (m, i, a) { return isFinite(m) && m > 0 && m < target && a.indexOf(m) === i; })
      .sort(function (a, b) { return a - b; }).slice(0, 8);
    var params = raw.params && typeof raw.params === "object" ? JSON.parse(JSON.stringify(raw.params)) : {};
    return {
      id: raw.id,
      title: String(raw.title || "Untitled goal").trim().slice(0, 160),
      description: description,
      detail: description,
      notes: String(raw.notes || "").trim().slice(0, 2000),
      type: type,
      domain: domain,
      kind: auto ? "auto" : "manual",
      metric: auto ? type : null,
      module: module || null,
      linkedEntryId: raw.linkedEntryId == null || raw.linkedEntryId === "" ? null : Number(raw.linkedEntryId),
      filterKind: ["genre", "tag", "list"].indexOf(filterKind) !== -1 ? filterKind : null,
      filterValue: String(filterValue || "").trim().slice(0, 100),
      genre: filterKind === "genre" ? String(filterValue || "").trim().slice(0, 100) : null,
      links: cleanLinks(raw.links),
      params: params,
      target: target,
      current: auto ? 0 : num(raw.current, 0, 0),
      milestones: milestones,
      repeat: repeat,
      outcomes: outcomes,
      startDate: cleanDate(raw.startDate) || (raw.createdAt ? iso(new Date(raw.createdAt)) : todayISO()),
      deadline: repeat ? null : cleanDate(raw.deadline),
      status: ["active", "completed", "failed"].indexOf(raw.status) !== -1 ? raw.status : "active",
      archived: !!raw.archived,
      progress: num(raw.progress, 0, 0),
      lastCurrent: num(raw.lastCurrent, auto ? 0 : raw.current || 0, 0),
      lastMeasuredAt: raw.lastMeasuredAt || null,
      createdAt: raw.createdAt || Date.now(),
      updatedAt: raw.updatedAt || raw.createdAt || Date.now(),
      completedAt: raw.completedAt || null,
      failedAt: raw.failedAt || null,
      failedManual: !!raw.failedManual,
      completionRecordedAt: raw.completionRecordedAt || null
    };
  }

  function data() {
    var s = store.state.goals = store.state.goals || { v: 3, nextId: 1, items: [], completionLedger: {} };
    if (!Array.isArray(s.items)) s.items = [];
    if (!s.nextId) s.nextId = 1;
    if (!s.completionLedger || typeof s.completionLedger !== "object") s.completionLedger = {};
    if (s.v !== 3) {
      /* v2 → v3: every goal gains its domain (from its type: the 14 vault
         types are "collection", and a manual goal made under Collection's
         Planner stays there), links, params, milestones and repeat. */
      s.items = s.items.map(normalise);
      s.v = 3;
      store.save();
    }
    return s;
  }
  function all() { return data().items; }
  function get(id) { return all().filter(function (g) { return g.id === Number(id); })[0] || null; }

  function add(fields) {
    var s = data(), base = Object.assign({}, fields || {});
    base.id = s.nextId++;
    base.createdAt = Date.now();
    base.updatedAt = base.createdAt;
    base.status = "active";
    var def = BY_ID[base.type];
    if (def && def.direction === "under" && !base.deadline && !base.repeat) base.deadline = monthEndISO();
    var g = normalise(base);
    if (def && def.onCreate) def.onCreate(g);
    s.items.push(g);
    store.save();
    return g;
  }
  function update(id, patch) {
    var s = data(), idx = s.items.findIndex(function (g) { return g.id === Number(id); });
    if (idx < 0) return null;
    patch = Object.assign({}, patch || {});
    if (patch.detail !== undefined && patch.description === undefined) patch.description = patch.detail;
    var prev = s.items[idx];
    var next = normalise(Object.assign({}, prev, patch, { id: prev.id, updatedAt: Date.now() }));
    next.completionRecordedAt = prev.completionRecordedAt || next.completionRecordedAt;
    /* the past is not rewritten: outcomes survive an edit of the target */
    if (next.repeat && next.repeat === prev.repeat) next.outcomes = Object.assign({}, prev.outcomes || {}, next.outcomes);
    if (next.type !== prev.type) { var def = BY_ID[next.type]; if (def && def.onCreate) def.onCreate(next); }
    s.items[idx] = next;
    store.save();
    return next;
  }
  function remove(id) {
    var s = data();
    s.items = s.items.filter(function (g) { return g.id !== Number(id); });
    store.save();
  }
  function nudge(id, delta) {
    var g = get(id);
    if (!g || g.kind !== "manual") return null;
    return update(g.id, { current: Math.max(0, (g.current || 0) + Number(delta || 0)) });
  }
  function reopen(id) {
    return update(id, { status: "active", completedAt: null, failedAt: null, failedManual: false });
  }
  function archive(id, on) { return update(id, { archived: on !== false }); }
  /* a missed or finished goal starts again from today, its history kept */
  function restart(id, patch) {
    var g = get(id);
    if (!g) return null;
    var ledger = data().completionLedger;
    if (ledger[g.id]) delete ledger[g.id];
    var def = BY_ID[g.type];
    var next = update(id, Object.assign({ status: "active", completedAt: null, failedAt: null, failedManual: false,
      completionRecordedAt: null, archived: false, startDate: todayISO(),
      current: g.kind === "manual" ? 0 : g.current }, patch || {}));
    if (def && def.onCreate) { def.onCreate(next); store.save(); }
    return next;
  }

  /* ---------------- judging ---------------- */
  function derive(g, def, measure, today) {
    if (g.failedManual) return "failed";
    if (g.status === "completed" && g.completedAt) return "completed";
    if (measure.current == null) return g.deadline && g.deadline < today ? "failed" : "active";
    if (def.direction === "under") {
      if (measure.current > measure.target) return "failed";
      if (g.deadline && g.deadline < today) return "completed";
      return "active";
    }
    if (measure.current >= measure.target) return "completed";
    if (g.deadline && g.deadline < today) return "failed";
    return "active";
  }
  /* the straight-line expectation: where a goal "should" be by today.
     "ahead" | "on-track" | "behind" | null (no claim: no end date, not
     started, nothing measured, or a value that is only displayed). An
     under-goal (spend below) is behind when it runs ahead of its line. */
  var PACE = { ahead: 1.15, onTrack: 0.9 };
  function pace(g, def, current, target, from, to, today) {
    if (def.displayOnly || current == null || !from || !to || today < from) return null;
    var total = daysBetween(from, to) + 1;
    if (total < 2) return null;
    var elapsed = Math.min(total, daysBetween(from, today) + 1);
    var expected = target * elapsed / total;
    if (def.direction === "under") {
      if (current > target) return "behind";
      return current > expected * (2 - PACE.onTrack) ? "behind" : "on-track";
    }
    if (current >= target) return "ahead";
    if (expected <= 0) return null;
    var ratio = current / expected;
    return ratio >= PACE.ahead ? "ahead" : ratio >= PACE.onTrack ? "on-track" : "behind";
  }
  /* a projected finish from the rate so far — only with three days of it
     and something done (invariant 76) */
  var PROJECT_MIN_DAYS = 3;
  function projected(def, current, target, from, today) {
    if (def.direction !== "reach" || def.displayOnly || !current || current >= target || !from) return null;
    var elapsed = daysBetween(from, today) + 1;
    if (elapsed < PROJECT_MIN_DAYS) return null;
    return addDays(today, Math.ceil((target - current) / (current / elapsed)));
  }

  function measureOne(g, def, ctx, cb) {
    if (!def.auto) { cb({ current: g.current || 0, target: g.target, unit: "steps", meta: "" }); return; }
    try {
      def.measure(g, ctx, function (m) {
        m = m || {};
        cb({ current: m.current == null ? null : Math.round(Number(m.current) * 100) / 100,
          target: m.target != null ? m.target : g.target, unit: m.unit || def.unit || "", meta: m.meta || "" });
      });
    } catch (e) {
      cb({ current: null, target: g.target, unit: def.unit || "", meta: "Could not be measured" });
    }
  }
  function ctxFor(base, from, to) { return Object.assign({}, base, { from: from, to: to }); }

  /* judge every ENDED period of a repeating goal that has no outcome yet,
     oldest first, never before the goal began and at most a year back */
  function closePeriods(g, def, base, today, cb) {
    var todo = [], p = periodOf(g, g.startDate), cur = periodOf(g, today), guard = 0;
    var oldest = addDays(today, -366);
    while (p.key !== cur.key && p.to < today && guard++ < 120) {
      if (!g.outcomes[p.key] && p.to >= oldest) todo.push(p);
      p = nextPeriod(g, p);
    }
    var dirty = false;
    (function next(i) {
      if (i >= todo.length) { cb(dirty); return; }
      var per = todo[i];
      measureOne(g, def, ctxFor(base, per.from, per.to), function (m) {
        if (m.current != null) {
          var met = def.direction === "under" ? m.current <= m.target : m.current >= m.target;
          g.outcomes[per.key] = { met: met, value: m.current, target: m.target, at: Date.now() };
          dirty = true;
        }
        next(i + 1);
      });
    })(0);
  }
  /* the run of periods met, newest first, ending at the last ended period */
  function runOf(g) {
    var keys = Object.keys(g.outcomes || {}).sort().reverse(), n = 0;
    for (var i = 0; i < keys.length; i++) { if (g.outcomes[keys[i]].met) n++; else break; }
    return n;
  }

  function compute(cb, opts) {
    opts = opts || {};
    var stats = null, statsWait = null;
    var base = {
      today: todayISO(),
      /* the vault's aggregate, read once however many goals ask */
      stats: function (done) {
        if (stats) { done(stats); return; }
        if (statsWait) { statsWait.push(done); return; }
        statsWait = [done];
        if (!KOS.mediadb) { stats = { total: 0, modules: {}, favourites: 0 }; statsWait.forEach(function (f) { f(stats); }); statsWait = null; return; }
        KOS.mediadb.stats(function (err, agg) {
          stats = agg || { total: 0, modules: {}, favourites: 0 };
          var w = statsWait; statsWait = null;
          w.forEach(function (f) { f(stats); });
        });
      }
    };
    var rows = all().filter(function (g) { return opts.archived !== false || !g.archived; });
    var out = new Array(rows.length), pending = rows.length, dirty = false, today = base.today;
    if (!pending) { cb(null, []); return; }
    rows.forEach(function (g, index) {
      var def = typeDef(g.type);
      var per = g.repeat ? periodOf(g, today) : null;
      var from = per ? per.from : g.startDate;
      var to = per ? per.to : (g.deadline || today);
      function finish(m) {
        var target = def.direction === "under" ? Math.max(0, Number(m.target) || 0) : Math.max(1, Number(m.target) || g.target || 1);
        var status = per ? "active" : derive(g, def, m, today);
        var cur = m.current == null ? 0 : m.current;
        var pct = def.direction === "under"
          ? (target ? Math.max(0, Math.min(100, Math.round(100 * (1 - cur / target)))) : (cur ? 0 : 100))
          : Math.max(0, Math.min(100, Math.round(100 * cur / target)));
        if (!per) {
          if (status === "completed" && !g.completedAt) {
            g.status = "completed"; g.completedAt = Date.now(); g.failedAt = null;
            if (!data().completionLedger[g.id]) {
              data().completionLedger[g.id] = { recordedAt: g.completedAt, type: g.type, payout: def.displayOnly ? "none" : "activity-only" };
            }
            g.completionRecordedAt = data().completionLedger[g.id].recordedAt;
            dirty = true;
          } else if (status === "failed" && g.status !== "failed") {
            g.status = "failed"; g.failedAt = g.failedAt || Date.now(); dirty = true;
          } else if (status === "active" && g.status !== "active") {
            g.status = "active"; g.completedAt = null; g.failedAt = null; dirty = true;
          }
        }
        if (m.current != null && (g.lastCurrent !== m.current || g.progress !== pct)) {
          g.lastCurrent = m.current; g.progress = pct; g.lastMeasuredAt = Date.now(); dirty = true;
        }
        var met = per && m.current != null && (def.direction === "under" ? m.current <= target : m.current >= target);
        var paceTo = per ? per.to : g.deadline;
        out[index] = Object.assign({}, g, {
          _current: m.current, _target: target, _unit: m.unit, _meta: m.meta,
          _status: per ? (met ? "met" : "active") : status, _pct: pct,
          _domain: def.domain, _direction: def.direction, _displayOnly: !!def.displayOnly,
          _period: per, _run: per ? runOf(g) : 0,
          _pace: status === "active" || per ? pace(g, def, m.current, target, from, paceTo, today) : null,
          _projected: per ? null : projected(def, m.current, target, from, today),
          _milestonesMet: (g.milestones || []).filter(function (x) { return (m.current || 0) >= x; }).length,
          _rewardSafe: !!data().completionLedger[g.id]
        });
        pending--;
        if (!pending) { if (dirty) store.save(); cb(null, out); }
      }
      function measureNow() { measureOne(g, def, ctxFor(base, from, to), finish); }
      if (per && def.repeat) closePeriods(g, def, base, today, function (d) { if (d) dirty = true; measureNow(); });
      else measureNow();
    });
  }

  function metricLabel(g) {
    var d = typeDef(g.type || (LEGACY[g.metric] || ["custom-manual"])[0]);
    if (g.type === "filtered-completed") return (g.filterKind || "filter") + ": " + (g.filterValue || "not set");
    if (g.module && d.fields.module && KOS.goals.moduleLabel) return d.label + " · " + KOS.goals.moduleLabel(g.module);
    return d.label;
  }

  /* ================= the built-in types =================
     The Collection's fourteen register from core/goals-collection.js.
     These read the session ledger, the topic bands, Money and Code. Each
     `measure` reads [ctx.from, ctx.to]; a "live" one (repeat: false) reads
     the present state, judged against a baseline taken at creation.     */
  function ledger(ctx, test) {
    var L = (store.state.sessions || []);
    return L.filter(function (e) { return e.date >= ctx.from && e.date <= ctx.to && test(e); });
  }
  function subjectOk(g, e) { return !g.links.subject || e.subject === g.links.subject; }
  function focusMins(e) { return e.type === "focus" ? (e.dur || 0) / 60 : 0; }
  function studyFocus(e) { return e.type === "focus" && e.subject && e.subject !== "media"; }
  function round1(n) { return Math.round(n * 10) / 10; }
  function greenCount(g) {
    if (!KOS.rag || !KOS.hub || !KOS.hub.LEAVES) return null;
    var keys = [];
    if (g.links.refs && g.links.refs.length && KOS.spec && KOS.spec.resolve) keys = KOS.spec.resolve(g.links.refs);
    else (KOS.subjects ? KOS.subjects.ids("exam") : ["compsci", "maths", "it"]).forEach(function (sid) {
      if (g.links.subject && sid !== g.links.subject) return;
      (KOS.hub.LEAVES[sid] || []).forEach(function (leaf) { keys.push(sid + ":" + leaf.ref); });
    });
    return keys.filter(function (k) {
      var i = k.indexOf(":"), r = KOS.rag.effective(k.slice(0, i), k.slice(i + 1));
      return r && r.band === "g";
    }).length;
  }

  register({ id: "custom-manual", domain: "collection", label: "Custom manual goal", icon: "標", auto: false, unit: "steps" });

  /* ---- Study ---- */
  register({ id: "study-hours", domain: "study", label: "Study for a number of hours", icon: "時", unit: "hours",
    repeat: true, fields: { subject: true },
    measure: function (g, ctx, cb) {
      var mins = ledger(ctx, function (e) { return studyFocus(e) && subjectOk(g, e); }).reduce(function (n, e) { return n + focusMins(e); }, 0);
      cb({ current: round1(mins / 60), unit: "hours" });
    } });
  register({ id: "cards-reviewed", domain: "study", label: "Review flashcards", icon: "札", unit: "cards",
    repeat: true, fields: { subject: true },
    measure: function (g, ctx, cb) {
      cb({ current: ledger(ctx, function (e) { return (e.type === "flashcards" || e.type === "due-review") && subjectOk(g, e); })
        .reduce(function (n, e) { return n + ((e.metrics && e.metrics.cards) || 0); }, 0), unit: "cards" });
    } });
  /* recall makes no claim under 50 reviews in the period (the Reports floor) */
  register({ id: "recall-rate", domain: "study", label: "Keep recall at or above a percentage", icon: "憶", unit: "%",
    repeat: true, fields: { subject: true },
    measure: function (g, ctx, cb) {
      var n = 0, again = 0;
      ledger(ctx, function (e) { return (e.type === "flashcards" || e.type === "due-review") && subjectOk(g, e); }).forEach(function (e) {
        n += (e.metrics && e.metrics.cards) || 0; again += (e.metrics && e.metrics.again) || 0;
      });
      if (n < 50) { cb({ current: null, unit: "%", meta: n ? n + " of 50 reviews needed to measure" : "Needs 50 reviews to measure" }); return; }
      cb({ current: Math.round(100 * (n - again) / n), unit: "%", meta: n + " reviews" });
    } });
  register({ id: "topics-green", domain: "study", label: "Move topics to Green", icon: "緑", unit: "topics",
    fields: { subject: true, refs: true },
    onCreate: function (g) { var n = greenCount(g); g.params.baseline = n == null ? 0 : n; },
    measure: function (g, ctx, cb) {
      var n = greenCount(g);
      cb({ current: n == null ? null : Math.max(0, n - (g.params.baseline || 0)), unit: "topics",
        meta: n == null ? "" : n + " green now" });
    } });

  /* ---- Productivity ---- */
  register({ id: "focus-hours", domain: "productivity", label: "Focus for a number of hours", icon: "焦", unit: "hours",
    repeat: true, fields: { subject: true },
    measure: function (g, ctx, cb) {
      cb({ current: round1(ledger(ctx, function (e) { return e.type === "focus" && subjectOk(g, e); })
        .reduce(function (n, e) { return n + focusMins(e); }, 0) / 60), unit: "hours" });
    } });
  /* a block is a full 10 minutes of focus (invariant 4a), whatever the mode */
  register({ id: "focus-blocks", domain: "productivity", label: "Focus blocks", icon: "塊", unit: "blocks",
    repeat: true, fields: { subject: true },
    measure: function (g, ctx, cb) {
      var secs = (KOS.governor && KOS.governor.FOCUS_BLOCK && KOS.governor.FOCUS_BLOCK.secs) || 600;
      cb({ current: ledger(ctx, function (e) { return e.type === "focus" && subjectOk(g, e); })
        .reduce(function (n, e) { return n + Math.floor((e.dur || 0) / secs); }, 0), unit: "blocks" });
    } });
  register({ id: "todos-done", domain: "productivity", label: "Tick off tasks, habits and reminders", icon: "済", unit: "ticks",
    repeat: true,
    measure: function (g, ctx, cb) { cb({ current: ledger(ctx, function (e) { return e.type === "todo"; }).length, unit: "ticks" }); } });
  register({ id: "plan-ticked", domain: "productivity", label: "Tick plan rows", icon: "計", unit: "rows",
    repeat: true,
    measure: function (g, ctx, cb) {
      var rows = (store.state.pacing && store.state.pacing.entries) || [];
      cb({ current: rows.filter(function (r) {
        if (!r.done || !r.doneAt) return false;
        var d = iso(new Date(r.doneAt));
        return d >= ctx.from && d <= ctx.to;
      }).length, unit: "rows" });
    } });

  /* ---- Money (reads KOS.money; nothing here writes it) ---- */
  function moneyTally(ctx, cb) {
    if (!KOS.money || !KOS.money.available()) { cb(null); return; }
    KOS.money.range(ctx.from, ctx.to, function (err, rows) { cb(err ? null : rows); });
  }
  register({ id: "money-spend-under", domain: "money", label: "Spend below an amount", icon: "◈", unit: "£",
    direction: "under", repeat: true, fields: { category: true },
    measure: function (g, ctx, cb) {
      moneyTally(ctx, function (rows) {
        if (!rows) { cb({ current: null }); return; }
        var t = KOS.money.tally(rows), c = g.links.category;
        var spent = c ? (t.byCat[c] ? t.byCat[c].net : 0) : t.outgoings;
        cb({ current: Math.max(0, spent) / 100, unit: KOS.money.data().currency });
      });
    } });
  register({ id: "money-income", domain: "money", label: "Earn at least an amount", icon: "収", unit: "£",
    repeat: true, fields: { category: true },
    measure: function (g, ctx, cb) {
      moneyTally(ctx, function (rows) {
        if (!rows) { cb({ current: null }); return; }
        var t = KOS.money.tally(rows), c = g.links.category;
        cb({ current: (c ? (t.byCat[c] ? t.byCat[c].income : 0) : t.income) / 100, unit: KOS.money.data().currency });
      });
    } });
  /* a day counts once it has ended or is today, and only if nothing went out */
  register({ id: "money-no-spend", domain: "money", label: "No-spend days", icon: "無", unit: "days",
    repeat: true,
    measure: function (g, ctx, cb) {
      moneyTally(ctx, function (rows) {
        if (!rows) { cb({ current: null }); return; }
        var spent = {};
        rows.forEach(function (t) { if (t.kind === "out") spent[t.date] = true; });
        var n = 0, end = ctx.to < ctx.today ? ctx.to : ctx.today;
        for (var d = ctx.from; d <= end; d = addDays(d, 1)) if (!spent[d]) n++;
        cb({ current: n, unit: "days" });
      });
    } });
  register({ id: "money-save", domain: "money", label: "Save into a pot", icon: "貯", unit: "£",
    fields: { pot: true },
    measure: function (g, ctx, cb) {
      if (!KOS.money || !g.links.pot) { cb({ current: null, meta: "No pot linked" }); return; }
      var p = KOS.money.pot(g.links.pot);
      if (!p) { cb({ current: null, meta: "The linked pot was removed" }); return; }
      KOS.money.potBalances(function (err, bal) {
        cb({ current: err ? null : (bal[p.id] || 0) / 100, target: g.target || (p.target ? p.target / 100 : 1),
          unit: KOS.money.data().currency, meta: p.name });
      });
    } });

  /* ---- Code (reads the ledger the Governor paid by; evidence only) ---- */
  function codeEntries(ctx, kind) {
    return ledger(ctx, function (e) { return e.type === "code" && e.metrics && e.metrics.kind === kind; });
  }
  register({ id: "code-tasks", domain: "code", label: "Pass Code tasks", icon: "碼", unit: "tasks",
    repeat: true,
    measure: function (g, ctx, cb) {
      cb({ current: codeEntries(ctx, "task").filter(function (e) { return !e.metrics.seen && !e.metrics.topup; }).length, unit: "tasks" });
    } });
  register({ id: "code-retrievals", domain: "code", label: "Prove retrievals", icon: "復", unit: "retrievals",
    repeat: true,
    measure: function (g, ctx, cb) {
      cb({ current: codeEntries(ctx, "retrieval").filter(function (e) { return e.metrics.grade && e.metrics.grade !== "again"; }).length, unit: "retrievals" });
    } });
  register({ id: "code-capstone", domain: "code", label: "Pass a capstone", icon: "冠", unit: "capstone",
    fields: { capstone: true },
    measure: function (g, ctx, cb) {
      var id = g.links.capstone, st = store.state.code && store.state.code.capstones;
      if (!id) { cb({ current: null, meta: "No capstone linked" }); return; }
      cb({ current: st && st[id] && st[id].passAt ? 1 : 0, target: 1, unit: "capstone" });
    } });

  /* ---- Governor: displayed, never a claim of reward ---- */
  register({ id: "gov-streak", domain: "governor", label: "Reach a study streak", icon: "連", unit: "days",
    displayOnly: true,
    measure: function (g, ctx, cb) { cb({ current: KOS.sessions ? KOS.sessions.streaks().all : null, unit: "days" }); } });
  register({ id: "gov-level", domain: "governor", label: "Reach a level", icon: "級", unit: "level",
    displayOnly: true,
    measure: function (g, ctx, cb) {
      var xp = (store.state.governor && store.state.governor.xp) || 0;
      cb({ current: KOS.governor ? KOS.governor.levelInfo(xp).level : null, unit: "level" });
    } });

  KOS.goals = {
    DOMAINS: DOMAINS.slice(), REPEATS: REPEATS.slice(),
    register: register, typeDef: typeDef,
    types: function (opts) { return types(opts); },
    metrics: function () { return TYPES.filter(function (d) { return d.auto; }).map(function (d) { return { id: d.id, label: d.label }; }); },
    all: all, get: get, add: add, update: update, remove: remove, nudge: nudge, reopen: reopen,
    archive: archive, restart: restart,
    compute: compute, normalise: normalise, metricLabel: metricLabel,
    periodOf: periodOf, pace: pace, projected: projected, runOf: runOf,
    todayISO: todayISO, monthEndISO: monthEndISO, num: num,
    PACE: PACE, PROJECT_MIN_DAYS: PROJECT_MIN_DAYS
  };
})();
