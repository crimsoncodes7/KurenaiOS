/* Kurenai OS — core/sidesync.js
   The stores that replicate beside the state document — Money's
   transactions, the review log, Mind's Journal, saved Reports and
   handwriting — each run their own push-and-pull (`syncCloud`). Three
   things they all need live here (quality W1, DI-20 and DI-11; W2's bus):

   1. WHAT HAPPENED IS SHOWN. A replicator that failed used to fail
      silently, every thirty minutes, for ever. wrap() records each run's
      outcome per store — the last success, the last error and its words —
      per device (media kv `sidesync.status`), and Account & Cloud Sync
      lists them. A run that did not happen (signed out, busy, offline) is
      not an outcome.
   2. A PULL OVERLAPS. Every pull asked for rows `updated_at > cursor`, and
      the server stamps a row when its transaction commits, not when it
      began: a row committed late, behind a cursor that had already passed
      it, was skipped for ever. since(cursor) asks from two minutes before
      the cursor instead; every replicator already ignores a row it holds.
   3. A PULL THAT BROUGHT SOMETHING SAYS SO to the change bus
      (js/core/redraw.js, invariant 164) under its store's key, so a page
      that shows it is redrawn, or offered Refresh — and no other page is. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var KEY = "sidesync.status", OVERLAP_MS = 2 * 60 * 1000;
  var defs = [], status = {}, loaded = false, loading = false, waiting = [];

  function uid() { try { return (KOS.cloud && KOS.cloud.userId && KOS.cloud.userId()) || null; } catch (e) { return null; } }
  function kv() { return KOS.mediadb && KOS.mediadb.available && KOS.mediadb.available() ? KOS.mediadb : null; }
  function ready(cb) {
    if (loaded) { if (cb) cb(); return; }
    if (cb) waiting.push(cb);
    if (loading) return;
    loading = true;
    function done(stored) {
      /* what this page load recorded wins over the stored copy */
      if (stored && typeof stored === "object" && stored.uid === uid() && stored.by) {
        Object.keys(stored.by).forEach(function (id) { if (!status[id]) status[id] = stored.by[id]; });
      }
      loaded = true; loading = false;
      waiting.splice(0).forEach(function (fn) { try { fn(); } catch (e) { /* a listener */ } });
    }
    if (!kv()) { done(null); return; }
    kv().getKV(KEY, function (err, v) { done(err ? null : v); });
  }
  function persist() {
    if (kv()) kv().setKV(KEY, { uid: uid(), by: status }, function () {});
  }
  function record(id, err, out) {
    var s = status[id] = status[id] || {};
    s.at = Date.now();
    if (err) s.err = { at: s.at, msg: String((err && err.message) || err || "It failed.").slice(0, 200) };
    else { s.ok = s.at; s.err = null; s.pulled = (out && out.pulled) || 0; s.pushed = (out && out.pushed) || 0; }
    ready(persist);
    try { window.dispatchEvent(new window.CustomEvent("kos-sidesync", { detail: { id: id } })); } catch (e) { /* old engine */ }
  }

  /* wrap({id, label, key}, syncCloud) → a syncCloud that records its
     outcome and names its store to the change bus when a pull brought
     something. Same signature: (cb(err, out)). */
  function wrap(def, fn) {
    function run(cb) {
      fn(function (err, out) {
        if (!(out && out.skipped)) {
          record(def.id, err, out);
          if (!err && out && (out.pulled || out.deleted) && KOS.changes) {
            try { KOS.changes.note([def.key], { source: "device" }); } catch (e) { /* a redraw is not data */ }
          }
        }
        if (cb) cb(err, out);
      });
    }
    defs.push({ id: def.id, label: def.label, key: def.key, run: run });
    return run;
  }

  /* the cursor to ask from: two minutes before the last one seen */
  function since(cursor) {
    if (!cursor) return null;
    var t = Date.parse(cursor);
    return isFinite(t) ? new Date(t - OVERLAP_MS).toISOString() : cursor;
  }

  KOS.sideSync = {
    wrap: wrap,
    since: since,
    ready: ready,
    /* [{id, label, key, at, ok, err: {at, msg} | null, pulled, pushed}], in the order registered */
    status: function () {
      return defs.map(function (d) { return Object.assign({ id: d.id, label: d.label, key: d.key }, status[d.id] || {}); });
    },
    failing: function () { return defs.filter(function (d) { return status[d.id] && status[d.id].err; }).map(function (d) { return d.id; }); },
    /* run every replicator now, one after another (Sync now) */
    syncAll: function (cb) {
      var i = 0;
      (function next() {
        if (i >= defs.length) { if (cb) cb(); return; }
        var d = defs[i++];
        try { d.run(function () { next(); }); } catch (e) { record(d.id, e, null); next(); }
      })();
    },
    OVERLAP_MS: OVERLAP_MS
  };
})();
