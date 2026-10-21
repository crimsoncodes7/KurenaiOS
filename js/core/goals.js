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
             fields: { module, filter, linked, subject, pot, category, exam,
             … } (what the editor asks for), onCreate(goal) (a baseline taken
             when the goal is made), measure(goal, ctx, cb) → cb({current,
             target?, unit, meta}),
             deadlineOf(goal) (a deadline READ from its source: an exam
             goal's follows its exam), judge(goal, m, today) (a status rule
             of its own), fromBase (the straight line starts at the
             baseline taken at creation, `params.baseline`), noPace }
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
    if (g.repeat === "week") {
      /* "The week runs" (27k): Monday to Sunday, or from the weekday the
         goal started (a goal begun on a Wednesday runs Wed–Tue) */
      var ws = weekStart(date);
      if (g.weekFrom === "start" && g.startDate) {
        var off = ((parseISO(g.startDate).getDay() + 6) % 7);
        ws = addDays(ws, off);
        if (ws > date) ws = addDays(ws, -7);
      }
      return { key: ws, from: ws, to: addDays(ws, 6) };
    }
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
    /* an assessment of the Exams hub (invariant 128): a random string id */
    if (raw.examId && /^[a-z0-9]{1,24}$/.test(String(raw.examId))) out.examId = String(raw.examId);
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
      weekFrom: repeat === "week" && raw.weekFrom === "start" ? "start" : null,
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
    if (unlinked(g)) return "active";
    if (def.judge) return def.judge(g, measure, today);
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
  /* the pace chip (design primitive): expected = target × elapsed ÷ length,
     elapsed counting today. "ahead" at or above expected + 10% of the
     target, "behind" below expected − 5%, else "on-track"; "early" before
     15% of the period has gone (or on its first day). A stay-under goal has
     no line — purchases are lumpy — so it is "under" or "over". null makes
     no claim: no deadline, not started, nothing measured, or a value that
     is only displayed. */
  var PACE = { ahead: 0.10, behind: 0.05, early: 0.15 };
  /* `base` (a fromBase type): the line runs from the figure at creation,
     not from zero — recall that starts at 79% is not "ahead" of a line
     from 0 to 85% */
  function expectedOf(target, from, to, today, base) {
    var total = daysBetween(from, to) + 1, b = base || 0;
    var elapsed = Math.max(0, Math.min(total, daysBetween(from, today) + 1));
    return { total: total, elapsed: elapsed, value: b + (target - b) * elapsed / total, frac: elapsed / total };
  }
  function baseOf(g, def) {
    return def.fromBase && g.params && isFinite(g.params.baseline) ? Number(g.params.baseline) : 0;
  }
  function pace(g, def, current, target, from, to, today) {
    if (def.displayOnly || def.noPace || unlinked(g) || current == null || !from || !to || today < from) return null;
    if (def.direction === "under") return current > target ? "over" : "under";
    var base = baseOf(g, def), span = Math.max(target - base, 0);
    var e = expectedOf(target, from, to, today, base);
    if (e.total < 2) return null;
    if (current >= target) return "ahead";
    if (e.elapsed <= 1 || e.frac < PACE.early) return "early";
    if (current >= e.value + Math.max(PACE.ahead * span, def.fromBase ? 1 : 0)) return "ahead";
    if (current < e.value - Math.max(PACE.behind * span, def.fromBase ? 1 : 0)) return "behind";
    return "on-track";
  }
  /* a projected finish from the rate so far — only with three days of it
     and something done (invariant 76) */
  var PROJECT_MIN_DAYS = 3;
  function projected(def, current, target, from, today, base) {
    if (def.direction !== "reach" || def.displayOnly || def.noPace || !current || current >= target || !from) return null;
    var elapsed = daysBetween(from, today) + 1, gained = current - (base || 0);
    if (elapsed < PROJECT_MIN_DAYS || gained <= 0) return null;
    return addDays(today, Math.ceil((target - current) / (gained / elapsed)));
  }

  /* an exam goal whose exam was deleted (invariant 128): kept, measured
     as nothing, no pace and no notices, archived at its next judgement */
  function unlinked(g) { return !!(g && g.params && g.params.examGone && !(g.links && g.links.examId)); }
  function measureOne(g, def, ctx, cb) {
    if (unlinked(g)) { cb({ current: null, target: g.target, unit: def.unit || "", meta: "Exam removed · unlinked" }); return; }
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
      /* a deadline read from its source (an exam goal follows its exam) */
      var dl = !per && def.deadlineOf && !unlinked(g) ? (def.deadlineOf(g) || g.deadline) : g.deadline;
      var gv = dl === g.deadline ? g : Object.assign({}, g, { deadline: dl });
      var from = per ? per.from : g.startDate;
      var to = per ? per.to : (dl || today);
      function finish(m) {
        var target = def.direction === "under" ? Math.max(0, Number(m.target) || 0) : Math.max(1, Number(m.target) || g.target || 1);
        var status = per ? "active" : derive(gv, def, m, today);
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
        var paceTo = per ? per.to : dl;
        var base = baseOf(g, def);
        out[index] = Object.assign({}, g, { deadline: per ? g.deadline : dl,
          _current: m.current, _target: target, _unit: m.unit, _meta: m.meta,
          _status: per ? (met ? "met" : "active") : status, _pct: pct,
          _domain: def.domain, _direction: def.direction, _displayOnly: !!def.displayOnly,
          _period: per, _run: per ? runOf(g) : 0,
          _pace: status === "active" || per ? pace(g, def, m.current, target, from, paceTo, today) : null,
          _expected: paceTo && def.direction === "reach" && !def.displayOnly && !def.noPace && !unlinked(g) && today >= from ? Math.round(expectedOf(target, from, paceTo, today, base).value * 100) / 100 : null,
          _from: from, _to: paceTo || null, _base: def.fromBase ? base : null,
          _exam: !!def.exam, _unlinked: unlinked(g), _noPace: !!def.noPace,
          _projected: per ? null : projected(def, m.current, target, from, today, base),
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

  /* the pace chart's data (27j): the figure at the end of each day of the
     current period (or from the start to the deadline), read over [from,
     day] — only for types that can be read over any range. Days to come
     are left out; the chart draws the line to the end. */
  function series(g, cb) {
    var def = typeDef(g.type), today = todayISO();
    if (!def.repeat || !def.measure) { cb(null); return; }
    var per = g.repeat ? periodOf(g, today) : null;
    var from = per ? per.from : g.startDate, to = per ? per.to : g.deadline;
    if (!from || !to || from > today) { cb(null); return; }
    var days = [], d = from;
    for (var guard = 0; d <= to && d <= today && guard < 400; guard++, d = addDays(d, 1)) days.push(d);
    var base = { today: today, stats: function (done) { done({ total: 0, modules: {}, favourites: 0 }); } };
    var out = [];
    (function next(i) {
      if (i >= days.length) { cb({ from: from, to: to, points: out, target: g.target }); return; }
      measureOne(g, def, ctxFor(base, from, days[i]), function (m) { out.push([days[i], m.current == null ? 0 : m.current]); next(i + 1); });
    })(0);
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
  /* a Focus entry's seconds for the goal's subject, read by stretch (a
     switched session splits its time, sessions.js parts); `linked` keeps
     only time that was for a subject at all */
  function focusSecs(g, e, linked) {
    if (e.type !== "focus") return 0;
    return KOS.sessions.parts(e).reduce(function (n, p) {
      if (linked && (!p.subject || p.subject === "media")) return n;
      return !g.links.subject || p.subject === g.links.subject ? n + p.secs : n;
    }, 0);
  }
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
      var mins = ledger(ctx, function (e) { return e.type === "focus"; }).reduce(function (n, e) { return n + focusSecs(g, e, true) / 60; }, 0);
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
      cb({ current: round1(ledger(ctx, function (e) { return e.type === "focus"; })
        .reduce(function (n, e) { return n + focusSecs(g, e, false) / 60; }, 0) / 60), unit: "hours" });
    } });
  /* a block is a full 10 minutes of focus (invariant 4a), whatever the mode */
  register({ id: "focus-blocks", domain: "productivity", label: "Focus blocks", icon: "塊", unit: "blocks",
    repeat: true, fields: { subject: true },
    measure: function (g, ctx, cb) {
      var secs = (KOS.governor && KOS.governor.FOCUS_BLOCK && KOS.governor.FOCUS_BLOCK.secs) || 600;
      cb({ current: ledger(ctx, function (e) { return e.type === "focus"; })
        .reduce(function (n, e) { return n + Math.floor(focusSecs(g, e, false) / secs); }, 0), unit: "blocks" });
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

  /* ---- the rest of 27k's picker ---- */
  /* the best mark in the period, as a percentage (Exams & Papers) */
  register({ id: "study-paper-score", domain: "study", label: "A mock or paper score", icon: "試", unit: "%",
    fields: { subject: true },
    measure: function (g, ctx, cb) {
      var rows = KOS.tracker && KOS.tracker.all ? KOS.tracker.all() : [];
      var best = null;
      rows.forEach(function (e) {
        if (e.date < ctx.from || e.date > ctx.to || (g.links.subject && e.subject !== g.links.subject)) return;
        var p2 = KOS.tracker.pct ? KOS.tracker.pct(e) : null;
        if (p2 != null && (best == null || p2 > best)) best = p2;
      });
      cb({ current: best, unit: "%", meta: best == null ? "No paper marked in this time yet" : "" });
    } });
  /* every leaf of the picked unit at Completed (the topic's own status) */
  register({ id: "study-finish-unit", domain: "study", label: "Finish a unit", icon: "単", unit: "topics",
    fields: { refs: true },
    measure: function (g, ctx, cb) {
      var keys = g.links.refs && KOS.spec && KOS.spec.resolve ? KOS.spec.resolve(g.links.refs) : [];
      if (!keys.length) { cb({ current: null, meta: "Pick the unit with the topic picker" }); return; }
      var done = keys.filter(function (k) {
        var i = k.indexOf(":"), pr = store.peekProgress(k.slice(0, i), k.slice(i + 1));
        return pr && pr.status === "done";
      }).length;
      cb({ current: done, target: keys.length, unit: "topics" });
    } });
  register({ id: "habit-streak", domain: "productivity", label: "A habit's streak", icon: "習", unit: "days",
    measure: function (g, ctx, cb) {
      var hs = (store.state.todo && store.state.todo.habits) || [];
      var h = hs.filter(function (x) { return String(x.id) === String(g.params.habit); })[0] || null;
      if (!h) { cb({ current: null, meta: g.params.habit ? "The linked habit was removed" : "No habit linked" }); return; }
      var d = todayISO(), n = 0;
      if (!h.days[d]) d = addDays(d, -1);
      while (h.days && h.days[d]) { n++; d = addDays(d, -1); }
      cb({ current: n, unit: "days", meta: h.text });
    } });
  register({ id: "no-overdue", domain: "productivity", label: "No overdue assignment", icon: "課", unit: "overdue",
    direction: "under",
    measure: function (g, ctx, cb) {
      var c = KOS.assignments && KOS.assignments.counts ? KOS.assignments.counts() : null;
      cb({ current: c ? c.overdue : null, target: 0, unit: "overdue" });
    } });
  register({ id: "carryovers-cleared", domain: "productivity", label: "Carry-overs cleared", icon: "越", unit: "carried",
    direction: "under",
    measure: function (g, ctx, cb) {
      var w = KOS.pacing && KOS.pacing.dueThisWeek ? KOS.pacing.dueThisWeek() : null;
      cb({ current: w ? w.carried.length : null, target: 0, unit: "carried" });
    } });

  /* ---- Money (reads KOS.money; nothing here writes it) ---- */
  register({ id: "money-subs-under", domain: "money", label: "Subscriptions below an amount", icon: "↻", unit: "£",
    direction: "under",
    measure: function (g, ctx, cb) {
      if (!KOS.money) { cb({ current: null }); return; }
      cb({ current: KOS.money.subscriptions().perMonth / 100, unit: KOS.money.data().currency, meta: "a month" });
    } });
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

  /* ================= notices (the `goal` notification kind) =================
     What a goal has to say, from a compute()'s rows — pure, so the ticker
     and the tests read the same list. One notice per event, keyed so the
     ledger never repeats it (invariant 95):
       goal:<id>:end:<period>   a period ends tomorrow, not yet met
       goal:<id>:due:<date>     a deadline tomorrow, not yet reached
       goal:<id>:done           reached (calm; it promises nothing)
       goal:<id>:missed         a deadline passed short of it
     A display-only (Governor) goal says nothing; an archived one neither. */
  function fmt(n) { return n == null ? "–" : String(Math.round(n * 10) / 10); }
  function amount(r) {
    var unit = r._unit || "";
    if (unit === "hours" && r._current != null) {
      var mins = Math.round(r._current * 60), t = Math.round(r._target * 60);
      var hm = function (m) { return Math.floor(m / 60) + " h" + (m % 60 ? " " + (m % 60) + " m" : ""); };
      return hm(mins) + " of " + hm(t);
    }
    if (/^[£$€¥]$|^[A-Z]{3}$/.test(unit)) return unit + fmt(r._current) + " of " + unit + fmt(r._target);
    return fmt(r._current) + " of " + fmt(r._target) + (unit ? " " + unit : "");
  }
  function notices(rows, today) {
    var out = [], tomorrow = addDays(today, 1);
    (rows || []).forEach(function (r) {
      if (r.archived || r._displayOnly || r._unlinked) return;
      var link = { view: "goals", arg: null };
      if (r._period) {
        if (r._period.to === tomorrow && r._status !== "met") {
          out.push(Object.assign({ id: "goal:" + r.id + ":end:" + r._period.key, kind: "goal",
            title: (r.repeat === "week" ? "This week's" : "This month's") + " goal ends tomorrow — " + r.title,
            body: amount(r) }, link));
        }
        return;
      }
      if (r._status === "completed") {
        out.push(Object.assign({ id: "goal:" + r.id + ":done", kind: "goal", title: "Goal reached — " + r.title, body: amount(r) }, link));
      } else if (r._status === "failed" && !r.failedManual && r.deadline && r.deadline < today) {
        out.push(Object.assign({ id: "goal:" + r.id + ":missed", kind: "goal", title: "Goal missed — " + r.title,
          body: amount(r) + ". It stays in your history; restart it when you are ready." }, link));
      } else if (r._status === "active" && r.deadline === tomorrow) {
        out.push(Object.assign({ id: "goal:" + r.id + ":due:" + r.deadline, kind: "goal",
          title: "Goal due tomorrow — " + r.title, body: amount(r) }, link));
      }
    });
    return out;
  }
  /* a goal completed or missed long ago is not news: the ledger keeps 45
     days, so only what happened in the last two days is announced */
  var NEWS_MS = 2 * 86400000;

  /* ---------------- goals linked to an exam (invariant 128) ----------------
     Deleting an exam UNLINKS its goals and never deletes one: the goal is
     kept as it was, marked "Exam removed · unlinked" (`params.examGone`),
     measured as nothing, and moved to Archived at its next judgement —
     the first tick on a later day. Linking it to another exam picks it up
     again with nothing lost. */
  function byExam(examId) {
    return all().filter(function (g) { return g.links && g.links.examId === String(examId); });
  }
  function unlinkExam(examId, title) {
    var list = byExam(examId);
    list.forEach(function (g) {
      var l = Object.assign({}, g.links); delete l.examId;
      update(g.id, { links: l, params: Object.assign({}, g.params, { examGone: { title: String(title || "").slice(0, 160), at: todayISO() } }) });
    });
    return list.length;
  }
  function linkExam(id, examId) {
    var g = get(id), a = KOS.exams && KOS.exams.get(examId);
    if (!g || !a) return null;
    var p = Object.assign({}, g.params); delete p.examGone;
    var l = Object.assign({}, g.links, { examId: a.id });
    if (a.subject) l.subject = a.subject;
    return update(g.id, { links: l, params: p, archived: false, deadline: a.date || g.deadline });
  }
  function judgeUnlinked(today) {
    var n = 0;
    all().forEach(function (g) {
      if (unlinked(g) && !g.archived && g.params.examGone.at < today) { update(g.id, { archived: true }); n++; }
    });
    return n;
  }
  function tick(cb) {
    judgeUnlinked(todayISO());
    if (!KOS.notify || !KOS.notify.push) { cb && cb(null, []); return; }
    compute(function (err, rows) {
      var now = Date.now(), sent = [];
      notices(rows, todayISO()).forEach(function (n) {
        var r = (rows || []).filter(function (x) { return "goal:" + x.id === n.id.split(":").slice(0, 2).join(":"); })[0];
        var at = /:done$/.test(n.id) ? r && r.completedAt : /:missed$/.test(n.id) ? r && r.failedAt : now;
        if (!at || now - at > NEWS_MS) return;
        if (KOS.notify.push(n)) sent.push(n.id);
      });
      cb && cb(err || null, sent);
    }, { archived: false });
  }
  var started = false;
  function start() {
    if (started) return;
    started = true;
    setTimeout(function () { tick(); }, 12000);
    setInterval(function () { tick(); }, 30 * 60 * 1000);
  }

  KOS.goals = {
    DOMAINS: DOMAINS.slice(), REPEATS: REPEATS.slice(),
    notices: notices, tick: tick, start: start, amount: amount,
    register: register, typeDef: typeDef,
    types: function (opts) { return types(opts); },
    metrics: function () { return TYPES.filter(function (d) { return d.auto; }).map(function (d) { return { id: d.id, label: d.label }; }); },
    all: all, get: get, add: add, update: update, remove: remove, nudge: nudge, reopen: reopen,
    archive: archive, restart: restart,
    byExam: byExam, unlinkExam: unlinkExam, linkExam: linkExam, judgeUnlinked: judgeUnlinked, unlinked: unlinked,
    compute: compute, normalise: normalise, metricLabel: metricLabel,
    periodOf: periodOf, pace: pace, expectedOf: expectedOf, series: series, projected: projected, runOf: runOf,
    todayISO: todayISO, monthEndISO: monthEndISO, num: num,
    PACE: PACE, PROJECT_MIN_DAYS: PROJECT_MIN_DAYS
  };
})();
