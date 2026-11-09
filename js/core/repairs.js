/* Kurenai OS — js/core/repairs.js
   One-off repairs and data migrations, run safely (quality programme W1;
   the execution safeguards of 8 November 2026).

   A repair is registered by the domain that owns the data:

     KOS.repairs.register(id, {
       title,                       // what it fixes, in a few words
       consent: true|false,         // true: runs only with an approved preview
       repeat: true,                // (device) no receipt: runs whenever its data needs it
       scope: "account"|"device",   // where the receipt lives (default account:
                                    // state.repairs, synced; device: media kv
                                    // `repair.done.<id>`, for a fix to a
                                    // per-device store that every device makes)
       plan: () => Promise<{        // a DRY RUN: reads, writes nothing
         needed: bool,              // false once the data is already right
         summary: {...},            // the reconciliation (before, after, totals)
         items: [...],              // the exact records it will change
         apply: () => Promise<any>  // the change itself
       }>
     })

     KOS.repairs.preview(id) → Promise<{id, title, needed, summary, items, hash}>
     KOS.repairs.run(id, {approved: hash}) → Promise<{ok, already?, noop?, reason?, checkpoint?, summary?}>
     KOS.repairs.runAuto()   → the registered repairs without consent, once each
     KOS.repairs.audit(id)   → Promise<the audit record> (media kv `repair.audit.<id>`)

   THE RULES (each is a safeguard the user set):
   - A VERIFIED BACKUP FIRST. `apply` runs only inside
     `KOS.backup.withCheckpoint`; no verified checkpoint, no change.
   - DRY RUN, THEN THE SAME CHANGE. A consent repair runs only when its
     plan, made again at run time, hashes to the preview the user approved:
     if the data moved in between, it refuses and says so.
   - IDEMPOTENT. A plan computes what is wrong from the DATA (not from a
     flag), so running twice changes nothing; on top of that the receipt in
     `state.repairs[id]` (synced, so another device never runs it again)
     makes a second run a no-op. After `apply` the plan is made again and
     must say `needed: false`, or the run reports that it did not settle.
   - AN AUDIT RECORD. What was planned, the checkpoint it ran after, and
     the result are kept in the media kv on this device.
   Nothing here touches the Governor or the network itself; a repair's own
   `apply` goes through the owners (a ledger correction through
   `KOS.sessions.log`, invariant 1). */
(function () {
  "use strict";
  var KOS = window.KOS = window.KOS || {};
  var defs = {}, order = [], applying = 0;

  function register(id, def) {
    if (!id || !def || typeof def.plan !== "function") throw new Error("A repair needs an id and a plan.");
    if (!defs[id]) order.push(id);
    defs[id] = def;
  }
  function receipts() {
    var st = KOS.store && KOS.store.state;
    if (!st) return {};
    if (!st.repairs || typeof st.repairs !== "object" || Array.isArray(st.repairs)) st.repairs = {};
    return st.repairs;
  }
  /* the receipt: synced for an account repair, this device's for a device one */
  function getReceipt(id) {
    var d = defs[id];
    if (d && d.scope === "device") return kv("repair.done." + id);
    return Promise.resolve(receipts()[id] || null);
  }
  function setReceipt(id, rec) {
    var d = defs[id];
    if (d && d.repeat) return Promise.resolve(rec);   /* runs whenever its data needs it */
    if (d && d.scope === "device") return kv("repair.done." + id, rec);
    receipts()[id] = rec;
    if (KOS.store.save) KOS.store.save();
    return Promise.resolve(rec);
  }
  function kv(key, value) {
    return new Promise(function (res) {
      if (!KOS.mediadb) { res(null); return; }
      if (value !== undefined) KOS.mediadb.setKV(key, value, function () { res(value); });
      else KOS.mediadb.getKV(key, function (err, v) { res(err ? null : v); });
    });
  }
  function hashOf(plan) {
    var B = KOS.backup;
    return B.sha256(B.canon({ needed: !!plan.needed, summary: plan.summary || null, items: plan.items || [] }));
  }
  function plain(id, plan, hash) {
    var d = defs[id];
    return { id: id, title: d.title || id, consent: !!d.consent, needed: !!plan.needed,
      summary: plan.summary || null, items: plan.items || [], hash: hash };
  }

  function preview(id) {
    var d = defs[id];
    if (!d) return Promise.reject(new Error("No repair " + id));
    return Promise.resolve(d.plan()).then(function (plan) {
      return hashOf(plan).then(function (h) { return plain(id, plan, h); });
    });
  }

  function run(id, opts) {
    opts = opts || {};
    var d = defs[id];
    if (!d) return Promise.reject(new Error("No repair " + id));
    return getReceipt(id).then(function (have) {
      if (have) return { ok: true, already: true, receipt: have };
      return Promise.resolve(d.plan()).then(function (planned) {
        return hashOf(planned).then(function (hash) { return execute(d, id, opts, planned, hash); });
      });
    });
  }
  function execute(d, id, opts, planned, hash) {
    if (!planned.needed) {
      /* nothing to do: an internal account repair records it; a device
         repair, or a CONSENT repair (a no-op is not an approval), records
         nothing */
      if (d.scope === "device" || d.consent) return { ok: true, noop: true };
      return setReceipt(id, { at: Date.now(), hash: hash, noop: true }).then(function () { return { ok: true, noop: true }; });
    }
    if (d.consent && opts.approved !== hash) {
      return { ok: false, reason: opts.approved
        ? "The data changed since the preview you approved, so nothing was changed. Preview it again."
        : "This repair needs your approval of its preview first." };
    }
    if (!KOS.backup || !KOS.backup.withCheckpoint) return { ok: false, reason: "The backup is not available, so nothing was changed." };
    applying++;
    return KOS.backup.withCheckpoint("repair:" + id, function () {
      return Promise.resolve(planned.apply());
    }).then(function (r) { applying--; return r; }, function (e) { applying--; throw e; }).then(function (r) {
      var audit = { id: id, title: d.title || id, at: Date.now(), hash: hash, summary: planned.summary || null,
        items: planned.items || [], checkpoint: r.checkpoint || null, ok: !!r.ok, reason: r.reason || null,
        value: r.ok ? (r.value === undefined ? null : r.value) : null };
      if (!r.ok) return kv("repair.audit." + id, audit).then(function () { return { ok: false, reason: r.reason, checkpoint: r.checkpoint }; });
      return Promise.resolve(d.plan()).then(function (after) {
        audit.settled = !after.needed;
        audit.after = after.summary || null;
        return kv("repair.audit." + id, audit).then(function () {
          if (after.needed) return { ok: false, reason: "The repair ran but the data still needs it; it was left unrecorded.", checkpoint: r.checkpoint, summary: planned.summary };
          return setReceipt(id, { at: audit.at, hash: hash, checkpoint: r.checkpoint && r.checkpoint.id, summary: planned.summary || null }).then(function () {
            return { ok: true, checkpoint: r.checkpoint, summary: planned.summary, after: after.summary || null, value: audit.value };
          });
        });
      });
    });
  }

  /* the repairs that need no consent (an internal fix with nothing to
     decide), once each, in the order registered; never two at once */
  var autoRun = null;
  function runAuto() {
    if (autoRun) return autoRun;
    autoRun = order.filter(function (id) { return !defs[id].consent; }).reduce(function (p, id) {
      return p.then(function (out) {
        return run(id).catch(function (e) { return { ok: false, reason: (e && e.message) || String(e) }; })
          .then(function (r) { out[id] = r; return out; });
      });
    }, Promise.resolve({})).then(function (out) { autoRun = null; return out; });
    return autoRun;
  }

  KOS.repairs = {
    register: register, preview: preview, run: run, runAuto: runAuto,
    applying: function () { return applying > 0; },
    list: function () { return order.map(function (id) { return { id: id, title: defs[id].title || id, consent: !!defs[id].consent, scope: defs[id].scope || "account" }; }); },
    receipt: function (id) { return defs[id] && defs[id].scope === "device" ? null : receipts()[id] || null; },
    receiptOf: getReceipt,
    audit: function (id) { return kv("repair.audit." + id); }
  };
})();
