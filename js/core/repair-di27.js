/* Kurenai OS — js/core/repair-di27.js
   The DI-27 clean-up (quality W1, decision B1): the phantom sync rewards.

   Until sw kos-malfix-1 (8 November 2026) bulkUpsert matched a MAL id
   across modules. MAL numbers anime and manga separately, so a manga row
   whose MAL id an anime on the list shared (MAL 21: the Death Note manga
   and One Piece) was flipped to the anime and back on every autosync, and
   each cycle paid a sync reward. This repair takes those rewards back.

   WHAT IT FINDS (from the data, never from an estimate):
   - THE COLLIDED ROWS: Books rows whose MAL id an Anime row also carries.
     (AniList and VNDB ids are unique across their media, so only MAL.)
   - THE PHANTOM ENTRIES: ledger entries `type: "media"`,
     `metrics.action: "sync-reward"`, every title they name one of those
     Books rows, and every title named (`entries` equals the titles listed,
     so nothing else was in the batch). An entry that ALSO names another
     title is MIXED: its pay cannot be split, so it is kept and counted.
   - THE PAY: the sum of their recorded `award`s (invariant 100); an entry
     with no award is priced by the Governor's own sync-reward rule.

   WHAT IT DOES (consent: it runs only with the preview you approved, after
   a verified checkpoint; KOS.repairs):
   - removes the phantom entries from the ledger;
   - logs ONE `correction` entry through KOS.sessions.log with the negative
     XP and gold, clamped so neither balance goes below 0 (invariant 1);
   - keeps every badge tier (invariant 162) and the achievements rollup.
   Idempotent: once the entries are gone the plan finds none.
   NOT here (needs its own decision): scrubbing the rows' journals, and the
   one-off Reports rebuild (HR-02, HR-31). */
(function () {
  "use strict";
  var KOS = window.KOS = window.KOS || {};

  function allRows() {
    return new Promise(function (res, rej) {
      if (!KOS.mediadb || !KOS.mediadb.available || !KOS.mediadb.available()) { res([]); return; }
      KOS.mediadb.query({}, function (err, rows) { err ? rej(err) : res(rows || []); });
    });
  }
  /* the Governor's sync-reward price (governor.js), for an entry with no award */
  function price(m) {
    var units = Math.min(m.units || 0, 50), adv = Math.min(m.advances || 0, 10);
    return { xp: Math.min(4 + units + 3 * adv, 60), gold: Math.min(1 + Math.floor(units / 4) + adv, 12) };
  }
  function collided(rows) {
    var animeMal = {};
    rows.forEach(function (r) { var m = r.externalIds && r.externalIds.malId; if (r.module === "anime" && m != null) animeMal[m] = r; });
    return rows.filter(function (r) {
      var m = r.externalIds && r.externalIds.malId;
      return r.module === "books" && m != null && animeMal[m];
    }).map(function (r) {
      var a = animeMal[r.externalIds.malId];
      return { syncId: r.syncId, title: r.title, malId: r.externalIds.malId, anime: a.title };
    });
  }
  function classify(sessions, titles) {
    var phantom = [], mixed = [];
    (sessions || []).forEach(function (e) {
      var m = e && e.metrics;
      if (!e || e.type !== "media" || !m || m.action !== "sync-reward" || !Array.isArray(m.titles) || !m.titles.length) return;
      var hits = m.titles.filter(function (t) { return titles[t]; }).length;
      if (!hits) return;
      if (hits === m.titles.length && (m.entries == null || +m.entries === m.titles.length)) phantom.push(e);
      else mixed.push(e);
    });
    return { phantom: phantom, mixed: mixed };
  }

  function plan() {
    return allRows().then(function (rows) {
      var st = KOS.store.state, g = st.governor || {};
      var rowsHit = collided(rows), titles = {};
      rowsHit.forEach(function (r) { titles[r.title] = true; });
      var c = classify(st.sessions, titles);
      var xp = 0, gold = 0, byTitle = {}, first = null, last = null, priced = 0;
      c.phantom.forEach(function (e) {
        var a = e.award && (e.award.xp != null || e.award.gold != null) ? e.award : (priced++, price(e.metrics));
        xp += +a.xp || 0; gold += +a.gold || 0;
        e.metrics.titles.forEach(function (t) { byTitle[t] = (byTitle[t] || 0) + 1; });
        if (!first || e.date < first) first = e.date;
        if (!last || e.date > last) last = e.date;
      });
      var dx = Math.min(xp, g.xp || 0), dg = Math.min(gold, g.gold || 0);
      var lv = function (n) { return KOS.governor && KOS.governor.levelInfo ? KOS.governor.levelInfo(n).level : null; };
      var summary = {
        rows: rowsHit,
        entries: c.phantom.length, byTitle: byTitle, from: first, to: last,
        pricedWithoutAward: priced,
        mixedKept: c.mixed.length,
        phantomXp: xp, phantomGold: gold,
        deductXp: dx, deductGold: dg, clamped: dx < xp || dg < gold,
        before: { xp: g.xp || 0, gold: g.gold || 0, level: lv(g.xp || 0), ledger: (st.sessions || []).length },
        after: { xp: (g.xp || 0) - dx, gold: (g.gold || 0) - dg, level: lv((g.xp || 0) - dx), ledger: (st.sessions || []).length - c.phantom.length + 1 }
      };
      return {
        needed: c.phantom.length > 0,
        summary: summary,
        items: c.phantom.map(function (e) { return { id: e.id, date: e.date, titles: e.metrics.titles, award: e.award || null }; }),
        apply: function () {
          var ids = {};
          c.phantom.forEach(function (e) { ids[e.id] = true; });
          st.sessions = st.sessions.filter(function (e) { return !ids[e.id]; });
          KOS.store.save();
          KOS.sessions.log({ type: "correction", metrics: {
            title: "Phantom sync rewards removed", repair: "di27", entries: c.phantom.length,
            xp: -xp, gold: -gold, note: "MAL ids shared by an anime and a manga (DI-27)" } });
          return { removed: c.phantom.length, xp: -dx, gold: -dg };
        }
      };
    });
  }

  if (KOS.repairs) KOS.repairs.register("di27-phantom-sync", {
    title: "Take back the phantom sync rewards (DI-27)", consent: true, plan: plan
  });
  KOS.repairDi27 = { plan: plan, classify: classify, collided: collided };
})();
