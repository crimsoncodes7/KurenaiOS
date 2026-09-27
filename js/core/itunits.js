/* Kurenai OS — core/itunits.js
   IT units: the marks, statuses and series of the OCR IT units being
   taken (roadmap 1.2). ONE store, `state.itUnits`, behind ONE normaliser.

   Shape:
     { v: 1, seeded: bool,
       target: "Distinction*" | … ,        // the grade the desk plans for
       year1: { qualification: "H019", grade: "Distinction" } | null,
       units: { F200: { status, raw, ums, series, year, date, updatedAt }, … } }

   status is `done` (a result is in), `sitting` (still to sit) or
   `not-taken` (drops out of every figure — invariant 77 — kept only as
   an escape hatch; F203 and F205 are gone from the app altogether). A
   result is RAW, UMS or both: `ums` wins when present, and the hub derives
   UMS from raw by the unit's scale in js/data/it-grades.js otherwise.
   Entering a mark on a `sitting` unit makes it `done`.

   Every statistic (unit grade, aggregate, marks needed) is derived in
   hub.js (invariant 26d) from this store and the grade table; nothing here
   computes a grade. `units` is a keyed map, so the cloud merge folds two
   devices' edits per unit and per field. Zero Governor traffic.          */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;
  var STATUSES = ["done", "sitting", "not-taken"];

  /* the one-time seed: the student's record on 27 September 2026 */
  var SEED = {
    target: "Distinction*",
    year1: { qualification: "H019", grade: "Distinction" },
    units: {
      F200: { status: "done", raw: 51, year: 1 },
      F202: { status: "done", ums: 54, year: 1 },
      F201: { status: "sitting", year: 2 },
      F204: { status: "sitting", year: 2 },
      F206: { status: "sitting", year: 2 }
    }
  };

  function table() { return window.KOS_IT_GRADES || { grades: [], units: {}, qualifications: {} }; }
  function codes() { return Object.keys(table().units); }
  function has(o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); }
  function isDate(s) { return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s); }
  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }

  /* a score on a 0..max scale, or null. Half marks are not a thing on
     either scale, so a value is rounded to a whole mark. */
  function score(v, max) {
    if (v === null || v === undefined || v === "") return null;
    var n = Number(v);
    if (!isFinite(n)) return null;
    n = Math.round(n);
    return n < 0 || n > max ? null : n;
  }

  /* ---------------- the single schema gate ---------------- */
  function normaliseUnit(code, patch, base) {
    var spec = table().units[code];
    if (!spec) return null;
    patch = patch || {};
    var b = base || {};
    function pick(k, d) { return has(patch, k) ? patch[k] : (has(b, k) ? b[k] : d); }
    var status = pick("status", "sitting");
    if (STATUSES.indexOf(status) === -1) status = "sitting";
    var raw = score(pick("raw", null), spec.rawMax);
    var ums = score(pick("ums", null), spec.umsMax);
    /* a result has arrived: the unit is sat, whatever the form said */
    if (status === "sitting" && (raw !== null || ums !== null)) status = "done";
    var year = pick("year", null);
    year = year === 1 || year === 2 ? year : null;
    var date = pick("date", null);
    return {
      status: status,
      raw: raw,
      ums: ums,
      series: String(pick("series", "") || "").trim().slice(0, 30),
      year: year,
      date: isDate(date) ? date : null,
      updatedAt: patch === b ? (b.updatedAt || 0) : Date.now()
    };
  }
  function normaliseGrade(g) {
    return table().grades.indexOf(g) !== -1 ? g : null;
  }
  /* the whole branch — for a pull or a restore that may carry anything */
  function normalise(root) {
    root = root && typeof root === "object" ? root : {};
    var out = {
      v: 1,
      seeded: !!root.seeded,
      target: normaliseGrade(root.target) || "Distinction*",
      year1: root.year1 && typeof root.year1 === "object"
        ? { qualification: String(root.year1.qualification || "H019"), grade: normaliseGrade(root.year1.grade) }
        : null,
      units: {}
    };
    var units = root.units && typeof root.units === "object" ? root.units : {};
    Object.keys(units).forEach(function (code) {
      var u = normaliseUnit(code, units[code], units[code]);
      if (u) out.units[code] = u;
    });
    return out;
  }

  /* ---------------- reads (never write) ---------------- */
  function root() { return store.state.itUnits || null; }
  /* one unit as stored, or its default: a unit the table lists but the
     store has not seen is still to sit */
  function get(code) {
    if (!table().units[code]) return null;
    var r = root(), u = (r && r.units && r.units[code]) || {};
    var n = normaliseUnit(code, u, u);
    return Object.assign({ code: code }, n);
  }
  /* every unit in table order, not-taken included (the hub filters) */
  function all() { return codes().map(get); }
  function target() { var r = root(); return (r && normaliseGrade(r.target)) || "Distinction*"; }
  function year1() { var r = root(); return r && r.year1 ? clone(r.year1) : null; }

  /* ---------------- writes ---------------- */
  function branch() {
    if (!store.state.itUnits || typeof store.state.itUnits !== "object") {
      store.state.itUnits = normalise({});
    }
    var r = store.state.itUnits;
    if (!r.units || typeof r.units !== "object") r.units = {};
    return r;
  }
  function setUnit(code, patch) {
    if (!table().units[code]) return null;
    var r = branch();
    var next = normaliseUnit(code, patch || {}, r.units[code] || {});
    r.units[code] = next;
    store.save();
    return get(code);
  }
  /* a result that turns out wrong is cleared, not left behind: the unit is
     back to being sat, with its series and date kept */
  function clearResult(code) {
    return setUnit(code, { raw: null, ums: null, status: "sitting" });
  }
  function setTarget(grade) {
    if (!normaliseGrade(grade)) return null;
    branch().target = grade;
    store.save();
    return grade;
  }
  function setYear1(grade, qualification) {
    var g = normaliseGrade(grade);
    if (!g) return null;
    branch().year1 = { qualification: String(qualification || "H019"), grade: g };
    store.save();
    return year1();
  }

  /* The one-time seed (boot). A no-op once `seeded` is set, so a user's
     edit, or a cloud pull carrying one, is never overwritten. */
  function ensureSeeded() {
    var r = store.state.itUnits;
    if (r && r.seeded) return false;
    var seeded = normalise(Object.assign({}, SEED, { seeded: true }));
    /* anything already stored (a partial branch from a pull) wins */
    if (r && r.units) Object.keys(r.units).forEach(function (c) {
      var u = normaliseUnit(c, r.units[c], r.units[c]);
      if (u) seeded.units[c] = u;
    });
    store.state.itUnits = seeded;
    store.save();
    return true;
  }

  /* F203 and F205 left the specification (roadmap 1.2). The study state
     keyed to a unit that no longer exists is removed at boot, so no count,
     queue or backup carries it: progress, SM-2 schedules, quiz and card
     tallies, curriculum forks, custom cards and quiz items, and a remembered
     "last topic". The session ledger is history and is left as it is.
     Idempotent; writes only when it finds something. */
  function pruneDropped() {
    if (!KOS.spec) return 0;
    var live = {};
    KOS.spec.units("it").forEach(function (u) { live[u.ref] = true; });
    function dead(ref) {
      var m = /^(F\d{3})(\.|$)/.exec(String(ref || ""));
      return !!m && !live[m[1]];
    }
    function deadKey(k) {
      var s = String(k);
      if (s.indexOf("it:") !== 0) return false;
      return dead(s.slice(3));
    }
    var st = store.state, n = 0;
    function dropKeys(obj) {
      if (!obj || typeof obj !== "object") return;
      Object.keys(obj).forEach(function (k) { if (deadKey(k)) { delete obj[k]; n++; } });
    }
    dropKeys(st.progress);
    dropKeys(st.srs);
    if (st.study) { dropKeys(st.study.quiz); dropKeys(st.study.fc); }
    if (st.edits) dropKeys(st.edits.topics);
    ["cards", "quizzes"].forEach(function (k) {
      var list = st.custom && st.custom[k];
      if (!Array.isArray(list)) return;
      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i] && list[i].sid === "it" && dead(list[i].ref)) { list.splice(i, 1); n++; }
      }
    });
    if (st.ui && st.ui.lastRef && dead(st.ui.lastRef.it)) { delete st.ui.lastRef.it; n++; }
    if (n) store.save();
    return n;
  }

  KOS.itUnits = {
    STATUSES: STATUSES.slice(),
    SEED: clone(SEED),
    normalise: normalise,
    normaliseUnit: normaliseUnit,
    get: get,
    all: all,
    target: target,
    year1: year1,
    setUnit: setUnit,
    clearResult: clearResult,
    setTarget: setTarget,
    setYear1: setYear1,
    ensureSeeded: ensureSeeded,
    pruneDropped: pruneDropped
  };
})();
