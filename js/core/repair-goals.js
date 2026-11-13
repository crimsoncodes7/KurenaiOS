/* Kurenai OS — js/core/repair-goals.js
   GO-02's clean-up: the Goal getter tiers earned by Collection goals that
   were "met" by the vault's whole history (quality W7; the user's decision
   of 13 November 2026: "take them back").

   Until GO-02 the Collection goal types read the vault as it stands, so a
   goal made today was completed on the spot — and each completion wrote an
   activity-only receipt in `goals.completionLedger`, which is what the Goal
   getter badge counts (1, 10, 50). This repair re-measures every receipt of
   those types by the corrected rule (the goal's own period, from the
   journal), and VOIDS the ones that do not hold: the receipt goes, the goal
   is active again (or failed, if its deadline passed, on the next compute),
   and Goal getter drops to the tier its remaining receipts reach.

   A receipt whose goal was deleted cannot be re-measured; every one of them
   was judged by the broken rule, so it is voided too (that was also the way
   to farm the badge: make a goal, have it met at once, delete it).

   This is the one recorded exception to invariant 162 (an earned tier is
   never taken back). It is an AUTOMATIC repair, run once per account after
   the first good sync, through KOS.repairs (a verified checkpoint first;
   the receipt in state.repairs, synced, so no device runs it twice). The
   lowered tier reaches the other devices by the three-way merge: only this
   side moved it, so the merge takes it (the monotonic rule applies only
   when both sides changed the same badge). */
(function () {
  "use strict";
  var KOS = window.KOS = window.KOS || {};
  var ID = "goal-getter-whole-vault";
  var TYPES = { "titles-completed": 1, "episodes-watched": 1, "chapters-read": 1, "volumes-read": 1, "filtered-completed": 1,
    "library-size": 1, "favourites": 1, "purchases": 1, "game-hours": 1, "routes-cleared": 1 };
  var BADGE = "goal-getter";

  function st() { return KOS.store.state; }
  function ledger() { var g = st().goals || {}; return g.completionLedger || {}; }
  function isoOf(ts) { var d = new Date(ts); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }

  /* a context the Collection measures accept: the vault's aggregate and
     the period's journal, for [from, to] */
  function ctxFor(from, to) {
    var a = from ? new Date(from + "T00:00:00").getTime() : 0, b = to ? new Date(to + "T23:59:59").getTime() : Date.now();
    var stats = null, period = null;
    return {
      today: KOS.srs.todayISO(), from: from, to: to,
      stats: function (done) {
        if (stats) { done(stats); return; }
        KOS.mediadb.stats(function (e, v) { stats = v || { total: 0, modules: {}, favourites: 0 }; done(stats); });
      },
      period: function (done) {
        if (period) { done(period); return; }
        KOS.mediadb.periodStats(a, b, function (e, v) { period = v || { modules: {}, completedIds: {} }; done(period); });
      }
    };
  }
  function measure(g) {
    var def = KOS.goals.typeDef(g.type);
    return new Promise(function (res) {
      try { def.measure(g, ctxFor(g.startDate, g.deadline || KOS.srs.todayISO()), function (m) { res(m && m.current != null ? +m.current : 0); }); }
      catch (e) { res(0); }
    });
  }
  /* the tier a count reaches, from the badge's own thresholds */
  function tierFor(n) {
    var d = KOS.achievements && KOS.achievements.def ? KOS.achievements.def(BADGE) : null;
    var ths = (d && d.tiers) || [1, 10, 50], t = 0;
    ths.forEach(function (x) { if (typeof x === "number" && n >= x) t++; });
    return t;
  }
  function countAfter(voidIds) {
    var L = ledger(), n = 0;
    Object.keys(L).forEach(function (id) { if (L[id] && L[id].payout !== "none" && voidIds.indexOf(id) === -1) n++; });
    return n;
  }

  function plan() {
    if (!KOS.goals || !KOS.mediadb || !KOS.mediadb.periodStats) return Promise.resolve({ needed: false, summary: { reason: "not loaded" }, items: [] });
    var L = ledger();
    var ids = Object.keys(L).filter(function (id) { return L[id] && TYPES[L[id].type] && L[id].payout !== "none"; });
    return Promise.all(ids.map(function (id) {
      var g = KOS.goals.get(id);
      if (!g) return Promise.resolve({ id: id, type: L[id].type, goal: null, why: "deleted", void: true });
      return measure(g).then(function (cur) {
        var target = Math.max(1, +g.target || 1);
        return { id: id, type: g.type, goal: g.title, current: cur, target: target, met: isoOf(L[id].recordedAt || 0), void: cur < target, why: cur < target ? "not met in its own period" : "held" };
      });
    })).then(function (rows) {
      var voids = rows.filter(function (r) { return r.void; });
      var voidIds = voids.map(function (r) { return r.id; });
      var earned = ((st().achievements || {}).earned || {})[BADGE];
      var had = earned ? earned.tier : 0, keep = tierFor(countAfter(voidIds));
      var needed = voids.length > 0 || had > keep;
      return {
        needed: needed,
        summary: { receipts: ids.length, voided: voids.length, goalGetterBefore: had, goalGetterAfter: Math.min(had, keep) },
        items: voids,
        apply: function () { return apply(voidIds, keep); }
      };
    });
  }

  function apply(voidIds, keep) {
    var L = ledger();
    voidIds.forEach(function (id) {
      delete L[id];
      var g = KOS.goals.get(id);
      if (g) { g.status = "active"; g.completedAt = null; g.completionRecordedAt = null; }
    });
    var A = st().achievements, e = A && A.earned && A.earned[BADGE];
    if (e && e.tier > keep) {
      if (!keep) delete A.earned[BADGE];
      else {
        e.tier = keep;
        Object.keys(e.t || {}).forEach(function (k) { if (+k > keep) delete e.t[k]; });
      }
      if (Array.isArray(A.showcase) && !A.earned[BADGE]) A.showcase = A.showcase.filter(function (x) { return x !== BADGE; });
    }
    KOS.store.save();
    return Promise.resolve({ voided: voidIds.length, goalGetter: keep });
  }

  if (KOS.repairs) KOS.repairs.register(ID, {
    title: "Take back Goal getter tiers from Collection goals met by the whole vault (GO-02)",
    consent: false, plan: plan,
    /* after the first good sync, so this device holds the account's goals */
    ready: function () { return !KOS.cloudsync || !KOS.cloudsync.settled || KOS.cloudsync.settled(); }
  });
  KOS.repairGoals = { ID: ID, plan: plan };
})();
