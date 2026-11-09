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
   - THE PAY: each entry's sync-reward price by the Governor's own rule
     (the same for every entry, recorded award or not); a streak-milestone
     bonus that rode on a phantom entry is genuine and is kept.

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
  /* [{row, partner}] — a Books row and the Anime row sharing its MAL id */
  function pairs(rows) {
    var animeMal = {};
    rows.forEach(function (r) { var m = r.externalIds && r.externalIds.malId; if (r.module === "anime" && m != null) animeMal[m] = r; });
    return rows.filter(function (r) {
      var m = r.externalIds && r.externalIds.malId;
      return r.module === "books" && m != null && animeMal[m];
    }).map(function (r) { return { row: r, partner: animeMal[r.externalIds.malId] }; });
  }
  function collided(rows) {
    return pairs(rows).map(function (x) {
      return { syncId: x.row.syncId, title: x.row.title, malId: x.row.externalIds.malId, anime: x.partner.title };
    });
  }
  /* THE JOURNAL'S TRACES on one collided Books row (this device's copy):
     - a progress or volumes step FROM NOTHING: a Books row's own facts are
       always numbers, so `from: null` only arises when the row had just
       been the anime (the daily "volumes null → 8");
     - a status move to the anime's status and straight back within a day
       (a flip that crossed midnight; same-day flips already cancelled).
     Readers ignore both since HR-31; this only tidies the history. */
  function traces(row, partner) {
    var j = Array.isArray(row.journal) ? row.journal : [], drop = {};
    j.forEach(function (ev, i) {
      if ((ev[1] === "volumes" || ev[1] === "progress") && ev[2] == null) drop[i] = true;
    });
    var st = [];
    j.forEach(function (ev, i) { if (ev[1] === "status" && !drop[i]) st.push(i); });
    for (var k = 0; k + 1 < st.length; k++) {
      var a = j[st[k]], b = j[st[k + 1]];
      if (a[3] === partner.status && b[2] === partner.status && b[3] === a[2] && b[0] - a[0] < 864e5 && row.status !== partner.status) {
        drop[st[k]] = true; drop[st[k + 1]] = true; k++;
      }
    }
    var keep = j.filter(function (ev, i) { return !drop[i]; });
    return { removed: j.length - keep.length, keep: keep };
  }
  function scrubFind(rows) {
    return pairs(rows).map(function (x) {
      var t = traces(x.row, x.partner);
      return { syncId: x.row.syncId, title: x.row.title, removed: t.removed, keep: t.keep, partner: { status: x.partner.status } };
    }).filter(function (x) { return x.removed > 0; });
  }
  /* the hotfix shipped on this day (sw kos-malfix-1): no phantom after it */
  var FIX_DATE = "2026-11-08";
  /* A PHANTOM is a sync reward from the BOOKS pull (alone, or inside an
     autosync batch that pulled Books), dated on or before the fix, naming
     only collided Books rows and every title it paid for. A batch that also
     pulled another module and names a title some OTHER row shares (your
     Death Note ANIME beside the manga) on a day that other row really moved
     (an activity event in its journal) cannot be told apart: it is
     AMBIGUOUS and kept. Anything else naming a collided title is MIXED and
     kept. Both are counted in the preview. */
  function classify(sessions, titles, otherTitles) {
    var phantom = [], mixed = [], ambiguous = [];
    (sessions || []).forEach(function (e) {
      var m = e && e.metrics;
      if (!e || e.type !== "media" || !m || m.action !== "sync-reward" || !Array.isArray(m.titles) || !m.titles.length) return;
      var hits = m.titles.filter(function (t) { return titles[t]; }).length;
      if (!hits) return;
      var fromBooks = m.module === "books" || (m.module === "integrations" && Array.isArray(m.modules) && m.modules.indexOf("books") >= 0);
      var whole = hits === m.titles.length && (m.entries == null || +m.entries === m.titles.length);
      if (!fromBooks || !whole || !(e.date <= FIX_DATE)) { mixed.push(e); return; }
      if (m.module === "integrations" && m.titles.some(function (t) { return otherTitles[t] && otherTitles[t][e.date]; })) { ambiguous.push(e); return; }
      phantom.push(e);
    });
    return { phantom: phantom, mixed: mixed, ambiguous: ambiguous };
  }
  function titleSets(rows) {
    var rowsHit = collided(rows), titles = {}, otherTitles = {}, hitIds = {};
    rowsHit.forEach(function (r) { titles[r.title] = true; hitIds[r.syncId] = true; });
    /* the days a same-named OTHER row really moved: {title: {date: true}} */
    rows.forEach(function (r) {
      if (hitIds[r.syncId] || !titles[r.title]) return;
      var days = otherTitles[r.title] = otherTitles[r.title] || {};
      (r.journal || []).forEach(function (ev) {
        if (KOS.mediadb.activeEvent(ev)) { var d = new Date(ev[0]); days[d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2)] = true; }
      });
    });
    return { rowsHit: rowsHit, titles: titles, otherTitles: otherTitles };
  }
  /* what the SYNC REWARD paid: its own price by the Governor's rule. Not
     the entry's whole recorded award — a streak-milestone bonus the
     Governor added to whichever session came first is genuine and stays
     (found on the live account: 18 entries, 222 gold). The recorded award
     is compared only to report that difference. */
  function tally(list) {
    var xp = 0, gold = 0, noAward = 0, milestoneGold = 0;
    list.forEach(function (e) {
      var p = price(e.metrics);
      xp += p.xp; gold += p.gold;
      if (!e.award) noAward++;
      else if (+e.award.gold > p.gold) milestoneGold += +e.award.gold - p.gold;
    });
    return { xp: xp, gold: gold, noAward: noAward, milestoneGold: milestoneGold };
  }

  function plan() {
    return allRows().then(function (rows) {
      var st = KOS.store.state, g = st.governor || {};
      var ts = titleSets(rows);
      var c = classify(st.sessions, ts.titles, ts.otherTitles);
      var t = tally(c.phantom), xp = t.xp, gold = t.gold;
      var byTitle = {}, first = null, last = null;
      c.phantom.forEach(function (e) {
        e.metrics.titles.forEach(function (x) { byTitle[x] = (byTitle[x] || 0) + 1; });
        if (!first || e.date < first) first = e.date;
        if (!last || e.date > last) last = e.date;
      });
      var dx = Math.min(xp, g.xp || 0), dg = Math.min(gold, g.gold || 0);
      var scrub = scrubFind(rows);
      var lv = function (n) { return KOS.governor && KOS.governor.levelInfo ? KOS.governor.levelInfo(n).level : null; };
      var summary = {
        rows: ts.rowsHit,
        entries: c.phantom.length, byTitle: byTitle, from: first, to: last,
        withoutRecordedAward: t.noAward,
        milestoneGoldKept: t.milestoneGold,
        mixedKept: c.mixed.length,
        ambiguousKept: c.ambiguous.length,
        /* shown with the approval; each device then tidies its own copy
           (the device repair below) — this device's figures */
        journalThisDevice: { rows: scrub.length, events: scrub.reduce(function (n, x) { return n + x.removed; }, 0) },
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
          /* from the LIVE ledger at this moment, not the plan's copy: on a
             device that has meanwhile pulled another device's clean-up the
             entries are already gone, and nothing is deducted twice */
          var live = classify(KOS.store.state.sessions, ts.titles, ts.otherTitles).phantom;
          if (!live.length) return { removed: 0, xp: 0, gold: 0 };
          var lt = tally(live), ids = {};
          live.forEach(function (e) { ids[e.id] = true; });
          KOS.store.state.sessions = KOS.store.state.sessions.filter(function (e) { return !ids[e.id]; });
          KOS.store.save();
          KOS.sessions.log({ type: "correction", metrics: {
            title: "Phantom sync rewards removed", repair: "di27", entries: live.length,
            xp: -lt.xp, gold: -lt.gold, note: "MAL ids shared by an anime and a manga (DI-27)" } });
          var last = KOS.store.state.sessions[KOS.store.state.sessions.length - 1];
          return { removed: live.length, xp: last && last.award ? last.award.xp : 0, gold: last && last.award ? last.award.gold : 0 };
        }
      };
    });
  }

  if (KOS.repairs) KOS.repairs.register("di27-phantom-sync", {
    title: "Take back the phantom sync rewards (DI-27)", consent: true, plan: plan
  });
  /* the journal scrub, on EVERY device (decision of 9 Nov 2026): a media
     row's journal unions on each cloud pull (invariant 99), so one device's
     scrub would be undone by another's copy. Each device scrubs its own
     at start-up before cloud sync starts (main.js), only after the clean-up
     above was APPROVED and RAN (its receipt syncs; a no-op receipt is not an
     approval), and again on any later start that finds traces a device
     still on the old journal sent back — it keeps no receipt (`repeat`). */
  function scrubPlan() {
    var rc = KOS.repairs && KOS.repairs.receipt("di27-phantom-sync");
    if (!rc || rc.noop) {
      return Promise.resolve({ needed: false, summary: { waiting: "the DI-27 clean-up's approval" }, items: [], apply: function () {} });
    }
    return allRows().then(function (rows) {
      var found = scrubFind(rows);
      return {
        needed: found.length > 0,
        summary: { rows: found.length, events: found.reduce(function (n, x) { return n + x.removed; }, 0) },
        items: found.map(function (x) { return { syncId: x.syncId, title: x.title, removed: x.removed }; }),
        apply: function () {
          /* the traces are found again on each row's journal AS IT IS NOW,
             inside the write, so an event a sync added during the
             checkpoint is kept */
          return found.reduce(function (p, x) {
            return p.then(function () {
              return new Promise(function (res, rej) {
                KOS.mediadb.replaceJournal(x.syncId, function (rec) { return traces(rec, x.partner).keep; }, function (e) { e ? rej(e) : res(); });
              });
            });
          }, Promise.resolve()).then(function () { return { rows: found.length }; });
        }
      };
    });
  }
  if (KOS.repairs) KOS.repairs.register("di27-journal-scrub", {
    title: "Tidy the DI-27 traces from this device's journals", scope: "device", repeat: true, plan: scrubPlan,
    ready: function () { var rc = KOS.repairs.receipt("di27-phantom-sync"); return !!(rc && !rc.noop); }
  });
  KOS.repairDi27 = { plan: plan, classify: classify, collided: collided, traces: traces, scrubPlan: scrubPlan };
})();
