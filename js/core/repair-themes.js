/* Kurenai OS — js/core/repair-themes.js
   The theme cull's refund (quality W5, SC-22; the user's decision of 16
   November 2026: "get rid of every existing theme, refund the coins for
   the purchased ones, once").

   Every shop theme was a recolour of Graphite, so all 27 left the
   catalogue (css/themes.css keeps Atelier Dusk and Atelier Dawn, the two
   free ones). This repair gives back what each owned one cost, ONCE:

   - the plan reads the data: owned ids in RETIRED that have no refund
     recorded in `governor.refunds` (a keyed map, so two devices' records
     merge per key) — so it is idempotent without its receipt;
   - the gold goes back through ONE ledger entry, a `correction` marked
     `refund` (invariant 1: balances move only through the ledger; it is no
     activity, study or "earned", like every correction);
   - an owned id stays in `governor.owned` (owned cosmetics union in the
     cloud merge, so a removal would come back from another device); the
     retired theme simply is not in the catalogue any more, and a worn one
     falls back to the default (`effectiveTheme`'s unknown-theme rule).

   AUTOMATIC, once per account after the first good sync, through
   KOS.repairs (a verified checkpoint first; the receipt in state.repairs,
   synced, so no device runs it twice). */
(function () {
  "use strict";
  var KOS = window.KOS = window.KOS || {};
  var ID = "theme-refund";
  /* what each retired theme cost (the catalogue as it was at kos-integrity-9) */
  var RETIRED = {
    "theme-spectral-rose": 140, "theme-verdigris-duel": 140, "theme-sakura-skyline": 140,
    "theme-starfall-serenade": 140, "theme-feathered-dusk": 140, "theme-rosewater-abyss": 140,
    "theme-clinic-noir": 140, "theme-azure-corset-noir": 140, "theme-shattered-bloom": 140,
    "theme-scarlet-garden-night": 140, "theme-midnight-lilies": 140, "theme-gothic-camellia": 140,
    "theme-rain-cafe": 140, "theme-porcelain-sky-night": 140, "theme-crimson-moth": 140,
    "theme-celestial-duality": 140, "theme-jade-camellia": 140, "theme-ember-wraith": 140,
    "theme-solar-manuscript": 140, "theme-violet-requiem": 140, "theme-rosarium": 140,
    "theme-lycoris-radiata": 140, "theme-azure-butterfly": 140,
    "theme-washi-morning": 1500, "theme-lantern-hall": 1500, "theme-first-snow": 1500, "theme-moss-garden": 1500
  };

  function G() { return KOS.store.state.governor; }
  function due() {
    var g = G(), done = g.refunds || {};
    return (g.owned || []).filter(function (id, i, a) { return RETIRED[id] && !done[id] && a.indexOf(id) === i; });
  }

  function plan() {
    var ids = due();
    var gold = ids.reduce(function (s, id) { return s + RETIRED[id]; }, 0);
    return Promise.resolve({
      needed: ids.length > 0,
      summary: { themes: ids.length, gold: gold },
      items: ids.map(function (id) { return { id: id, gold: RETIRED[id] }; }),
      apply: function () { return apply(ids, gold); }
    });
  }

  function apply(ids, gold) {
    if (!ids.length) return Promise.resolve({ refunded: 0 });
    var g = G(), day = new Date().toISOString().slice(0, 10);
    g.refunds = g.refunds || {};
    ids.forEach(function (id) { g.refunds[id] = { gold: RETIRED[id], at: day }; });
    KOS.sessions.log({ type: "correction", metrics: {
      refund: true, gold: gold, xp: 0, hp: 0,
      title: ids.length === 1 ? "Theme refunded" : ids.length + " themes refunded",
      note: "The recolour themes were retired", themes: ids.slice()
    } });
    if (KOS.governor && KOS.governor.applyCosmetics) KOS.governor.applyCosmetics();
    if (KOS.ui && KOS.ui.toast) KOS.ui.toast("The old themes were retired · " + gold + " gold refunded");
    return Promise.resolve({ refunded: ids.length, gold: gold });
  }

  if (KOS.repairs) KOS.repairs.register(ID, {
    title: "Refund the retired recolour themes (W5, SC-22)",
    consent: false, plan: plan,
    /* after the first good sync, so this device holds the account's purchases */
    ready: function () { return due().length > 0 && (!KOS.cloudsync || !KOS.cloudsync.settled || KOS.cloudsync.settled()); }
  });
  KOS.repairThemes = { ID: ID, RETIRED: RETIRED, plan: plan, due: due };
})();
