/* Kurenai OS — core/cloudmerge.js
   The three-way merge for the synced state document.

   WHY THIS EXISTS. kos_state is one JSON document per account, and for a
   long time it synced as one unit: whoever saved last replaced the whole
   thing. That is fine for a single device and wrong for two — every edit
   made on the other device since this one last pulled was silently
   outvoted, and the guard that stopped the worst of it (refuse the push,
   ask the user which copy to keep) turned an ordinary two-device day into
   a dialog. Real multi-device apps never ask; they reconcile.

   THE MODEL. merge(base, local, remote) where BASE is the last document
   both sides agreed on (the last one this device pushed or pulled), LOCAL
   is this device's current document and REMOTE is the cloud's. Each leaf
   is classified against base: changed on one side only → take that side;
   changed identically → same; changed differently → a rule decides:

   - RECORD ARRAYS (sessions, events, reminders, assignments, cards,
     planner rows …) merge BY ID: additions from both sides survive, a
     deletion on either side wins, and a record edited on both sides is
     merged field by field with the later `updatedAt` breaking ties.
     Because ids are per-device counters, two devices can mint the same id
     for different records; a collision is detected (same id, absent from
     base, clearly different origin) and the LOCAL record is re-keyed to a
     fresh id, with every reference to it rewritten, before the merge.
   - ADDITIVE COUNTERS (gold, XP, HP) merge as base + Δlocal + Δremote, so
     a session logged on each device pays once each and a purchase on one
     is never undone by earnings on the other.
   - SETS (owned cosmetics) union.
   - KEYED MAPS (progress, srs, …) merge per key, recursively.
   - Everything else is a leaf; a genuine same-leaf edit war goes to the
     local side (the edit the user is looking at), unless the enclosing
     record says the remote edit is newer.

   NO BASE (the first link of two devices that both hold data, or a
   device upgraded from the whole-document era with unsynced edits): every
   record is treated as added by both sides (union, de-duplicated by id
   and origin), counters take the larger value rather than the sum, and
   same-leaf conflicts go to the richer document (more sessions logged).

   This module is PURE: plain JSON in, plain JSON out, no store, no DOM,
   no network. cloudsync.js owns when it runs and what happens after.   */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  /* ---------------- the schema the merge knows about ---------------- */
  /* Record arrays keyed by `id` (or another field), the counter they mint
     from, and every place that counter's ids are referenced. `refs` are
     rewritten when a colliding local record is re-keyed. */
  var RECORDS = [
    { path: "sessions", id: "id", counter: null, sortBy: "ts", cap: 2000 },
    { path: "custom.cards", id: "id", counter: "custom.nextId",
      refs: [{ kind: "mapKey", path: "srs", fmt: function (id) { return "u" + id; } }] },
    { path: "custom.quizzes", id: "id", counter: "custom.nextId" },
    { path: "calendar.events", id: "id", counter: "calendar.nextId",
      refs: [{ kind: "notified", path: "calendar.notified" }] },
    { path: "assignments.items", id: "id", counter: "assignments.nextId",
      refs: [{ kind: "field", path: "calendar.events", field: "assignmentId" }] },
    { path: "reminders.items", id: "id", counter: "reminders.nextId" },
    { path: "reminders.lists", id: "id", counter: "reminders.nextId",
      refs: [{ kind: "field", path: "reminders.items", field: "listId" }] },
    { path: "tracker.entries", id: "id", counter: "tracker.nextId" },
    { path: "resources.items", id: "id", counter: "resources.nextId" },
    { path: "wishlist.items", id: "id", counter: "wishlist.nextId" },
    { path: "wishlist.budget.history", id: "month" },
    { path: "goals.items", id: "id", counter: "goals.nextId",
      refs: [{ kind: "mapKey", path: "goals.completionLedger", fmt: function (id) { return String(id); } }] },
    { path: "pacing.weeks", id: "wb" },
    { path: "pacing.entries", id: "id", counter: "pacing.nextId", prefix: "p" },
    { path: "todo.manual", id: "id", counter: "todo.nextId" },
    { path: "todo.habits", id: "id", counter: "todo.nextId" },
    { path: "oop.classes", id: "id", counter: "oop.nextId",
      refs: [{ kind: "field", path: "oop.links", field: "child" },
             { kind: "field", path: "oop.links", field: "parent" }] }
  ];
  var ADDITIVE = {
    "governor.hp": { min: 0, max: 100 },
    "governor.gold": { min: 0 },
    "governor.xp": { min: 0 }
  };
  var SETS = { "governor.owned": true };
  var MIN = { "created": true };

  var RECORD_BY_PATH = {};
  RECORDS.forEach(function (r) { RECORD_BY_PATH[r.path] = r; });
  var COUNTER_PATHS = {};
  RECORDS.forEach(function (r) { if (r.counter) COUNTER_PATHS[r.counter] = true; });

  /* ---------------- small utilities ---------------- */
  function isPlain(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
  function clone(v) { return v === undefined ? undefined : JSON.parse(JSON.stringify(v)); }
  function deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b || a === null || b === null) return false;
    if (typeof a !== "object") return a !== a && b !== b;   // NaN
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (var i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    var ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (var j = 0; j < ka.length; j++) {
      if (!Object.prototype.hasOwnProperty.call(b, ka[j])) return false;
      if (!deepEqual(a[ka[j]], b[ka[j]])) return false;
    }
    return true;
  }
  function pathGet(obj, path) {
    var cur = obj, parts = path.split(".");
    for (var i = 0; i < parts.length; i++) {
      if (!isPlain(cur)) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }
  function pathSet(obj, path, val) {
    var cur = obj, parts = path.split(".");
    for (var i = 0; i < parts.length - 1; i++) {
      if (!isPlain(cur[parts[i]])) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = val;
  }
  function isRecordArray(arr) {
    if (!Array.isArray(arr) || !arr.length) return false;
    var seen = {};
    for (var i = 0; i < arr.length; i++) {
      var r = arr[i];
      if (!isPlain(r) || r.id === undefined || r.id === null) return false;
      if (seen[String(r.id)]) return false;
      seen[String(r.id)] = true;
    }
    return true;
  }
  function allPrimitive(arr) {
    for (var i = 0; i < arr.length; i++) if (arr[i] !== null && typeof arr[i] === "object") return false;
    return true;
  }
  function numericId(id, prefix) {
    if (typeof id === "number") return isFinite(id) ? id : 0;
    var s = String(id);
    if (prefix && s.indexOf(prefix) === 0) s = s.slice(prefix.length);
    var n = parseInt(s, 10);
    return isFinite(n) ? n : 0;
  }
  function stamp(rec) {
    var n = rec && rec.updatedAt;
    return typeof n === "number" && isFinite(n) ? n : 0;
  }

  /* Two records carrying the same id, neither known to the base: the same
     record seen twice, or two different records that happened to mint the
     same counter value on two devices? A millisecond creation stamp
     settles it outright; otherwise a coarse date plus how much of the
     rest of the record agrees. */
  var PRECISE = ["ts", "created", "createdAt", "addedAt", "added"];
  var NAMES = ["title", "name", "q", "text", "topic"];
  function sameOrigin(a, b) {
    for (var i = 0; i < PRECISE.length; i++) {
      var f = PRECISE[i], x = a[f], y = b[f];
      if (typeof x === "number" && typeof y === "number" && x > 1e12 && y > 1e12) return x === y;
    }
    for (var j = 0; j < PRECISE.length; j++) {
      var g = PRECISE[j];
      if (a[g] != null && b[g] != null && a[g] !== b[g]) return false;
    }
    /* the same day and the same words: the same thing */
    for (var n = 0; n < NAMES.length; n++) {
      var nf = NAMES[n];
      if (a[nf] != null && b[nf] != null) return a[nf] === b[nf];
    }
    var keys = {}, same = 0, total = 0;
    Object.keys(a).concat(Object.keys(b)).forEach(function (k) { keys[k] = true; });
    Object.keys(keys).forEach(function (k) {
      if (k === "id" || k === "updatedAt") return;
      var x = a[k], y = b[k];
      if (x !== null && typeof x === "object") return;
      if (y !== null && typeof y === "object") return;
      total++;
      if (x === y) same++;
    });
    return total === 0 || same / total >= 0.6;
  }

  /* ---------------- collision re-keying ---------------- */
  function maxIdIn(arr, prefix) {
    var m = 0;
    (arr || []).forEach(function (r) {
      if (!isPlain(r)) return;
      m = Math.max(m, numericId(r.id, prefix));
      ["subtasks", "subs"].forEach(function (sub) {
        if (Array.isArray(r[sub])) r[sub].forEach(function (s) { if (isPlain(s)) m = Math.max(m, numericId(s.id, prefix)); });
      });
    });
    return m;
  }
  function rewriteRefs(doc, spec, oldId, newId) {
    (spec.refs || []).forEach(function (ref) {
      var target = pathGet(doc, ref.path);
      if (ref.kind === "field" && Array.isArray(target)) {
        target.forEach(function (r) { if (isPlain(r) && r[ref.field] === oldId) r[ref.field] = newId; });
      } else if (ref.kind === "mapKey" && isPlain(target)) {
        var from = ref.fmt(oldId), to = ref.fmt(newId);
        if (Object.prototype.hasOwnProperty.call(target, from)) {
          target[to] = target[from];
          delete target[from];
        }
      } else if (ref.kind === "notified" && isPlain(target)) {
        Object.keys(target).forEach(function (k) {
          var parts = k.split("|");
          if (parts.length >= 2 && parts[1] === String(oldId)) {
            parts[1] = String(newId);
            target[parts.join("|")] = target[k];
            delete target[k];
          }
        });
      }
    });
  }
  /* Give every colliding LOCAL record a fresh id before the merge sees it.
     Returns the number of records re-keyed. Mutates `local` only. */
  function rekeyCollisions(base, local, remote) {
    var renamed = 0;
    /* fresh ids come from the counter's whole family, so a counter shared
       by two arrays (reminder items and lists) never hands out a number
       either of them, or either side, already holds */
    var ceiling = {};
    function ceilingFor(spec) {
      var key = spec.counter || spec.path;
      if (ceiling[key] !== undefined) return ceiling[key];
      var m = 0;
      RECORDS.forEach(function (s) {
        if ((s.counter || s.path) !== key) return;
        [base, local, remote].forEach(function (doc) {
          m = Math.max(m, maxIdIn(pathGet(doc, s.path), s.prefix));
        });
      });
      if (spec.counter) {
        [base, local, remote].forEach(function (doc) {
          var n = pathGet(doc, spec.counter);
          if (typeof n === "number" && isFinite(n)) m = Math.max(m, n - 1);
        });
      }
      ceiling[key] = m;
      return m;
    }
    RECORDS.forEach(function (spec) {
      if (!spec.counter && spec.path !== "sessions") return;   // keyed by a natural key
      var L = pathGet(local, spec.path), R = pathGet(remote, spec.path), B = pathGet(base, spec.path);
      if (!Array.isArray(L) || !Array.isArray(R) || !L.length || !R.length) return;
      var inR = {}, inB = {};
      R.forEach(function (r) { if (isPlain(r)) inR[String(r[spec.id])] = r; });
      (B || []).forEach(function (r) { if (isPlain(r)) inB[String(r[spec.id])] = true; });
      L.forEach(function (rec) {
        if (!isPlain(rec)) return;
        var k = String(rec[spec.id]);
        if (!inR[k] || inB[k]) return;
        if (deepEqual(rec, inR[k]) || sameOrigin(rec, inR[k])) return;
        var next = ceilingFor(spec) + 1;
        ceiling[spec.counter || spec.path] = next;
        var oldId = rec[spec.id];
        var newId = spec.prefix ? spec.prefix + next : next;
        rec[spec.id] = newId;
        rewriteRefs(local, spec, oldId, newId);
        if (spec.counter) {
          var cur = pathGet(local, spec.counter);
          if (typeof cur !== "number" || cur <= next) pathSet(local, spec.counter, next + 1);
        }
        renamed++;
      });
    });
    return renamed;
  }

  /* ---------------- the record-array merge ---------------- */
  function mergeRecords(B, L, R, spec, ctx) {
    var idf = spec.id;
    var bIdx = {}, lIdx = {}, rIdx = {};
    (B || []).forEach(function (r) { if (isPlain(r)) bIdx[String(r[idf])] = r; });
    L.forEach(function (r) { if (isPlain(r)) lIdx[String(r[idf])] = r; });
    R.forEach(function (r) { if (isPlain(r)) rIdx[String(r[idf])] = r; });
    var out = [];
    L.forEach(function (l) {
      if (!isPlain(l)) { out.push(l); return; }
      var k = String(l[idf]);
      var r = rIdx[k], b = bIdx[k];
      if (r) {
        /* the same record on both sides: a later updatedAt names the side
           that wins a same-field edit war inside it */
        var sub = { preferRemote: ctx.preferRemote, stats: ctx.stats };
        var sl = stamp(l), sr = stamp(r);
        if (sl && sr && sl !== sr) sub.preferRemote = sr > sl;
        out.push(mergeValue(b, l, r, sub, null));
      } else if (b) {
        /* remote deleted it — a deletion wins over an edit */
        ctx.stats.deleted++;
      } else {
        out.push(l);                       // local addition
        ctx.stats.added++;
      }
    });
    R.forEach(function (r) {
      if (!isPlain(r)) return;
      var k = String(r[idf]);
      if (lIdx[k]) return;
      if (bIdx[k]) { ctx.stats.deleted++; return; }   // local deleted it
      out.push(r);                         // remote addition
      ctx.stats.added++;
    });
    if (spec.sortBy) {
      var f = spec.sortBy;
      out = out.map(function (r, i) { return [r, i]; })
        .sort(function (a, b) {
          var d = ((a[0] && a[0][f]) || 0) - ((b[0] && b[0][f]) || 0);
          return d || a[1] - b[1];
        })
        .map(function (p) { return p[0]; });
    }
    if (spec.cap && out.length > spec.cap) out.splice(0, out.length - spec.cap);
    return out;
  }

  /* ---------------- the generic three-way merge ---------------- */
  function mergeValue(b, l, r, ctx, path) {
    if (deepEqual(l, r)) return l;
    var hasBase = b !== undefined;
    if (hasBase && deepEqual(l, b)) return r;      // only remote moved
    if (hasBase && deepEqual(r, b)) return l;      // only local moved

    /* schema-aware paths first */
    if (path !== null) {
      if (ADDITIVE[path] && typeof l === "number" && typeof r === "number") {
        var rule = ADDITIVE[path];
        var v = (hasBase && typeof b === "number") ? b + (l - b) + (r - b) : Math.max(l, r);
        if (rule.min !== undefined) v = Math.max(rule.min, v);
        if (rule.max !== undefined) v = Math.min(rule.max, v);
        return v;
      }
      if (SETS[path] && Array.isArray(l) && Array.isArray(r)) {
        var bs = Array.isArray(b) ? b : [];
        var gone = {};
        bs.forEach(function (x) { if (l.indexOf(x) === -1 || r.indexOf(x) === -1) gone[String(x)] = true; });
        var outSet = [];
        l.concat(r).forEach(function (x) {
          if (gone[String(x)] || outSet.indexOf(x) !== -1) return;
          outSet.push(x);
        });
        return outSet;
      }
      if (MIN[path] && typeof l === "number" && typeof r === "number") return Math.min(l, r);
      if (COUNTER_PATHS[path] && typeof l === "number" && typeof r === "number") return Math.max(l, r);
      if (RECORD_BY_PATH[path] && Array.isArray(l) && Array.isArray(r)) {
        return mergeRecords(Array.isArray(b) ? b : null, l, r, RECORD_BY_PATH[path], ctx);
      }
    }

    if (isPlain(l) && isPlain(r)) {
      var bb = isPlain(b) ? b : null;
      var out = {}, keys = {};
      Object.keys(l).forEach(function (k) { keys[k] = true; });
      Object.keys(r).forEach(function (k) { keys[k] = true; });
      Object.keys(keys).forEach(function (k) {
        var inL = Object.prototype.hasOwnProperty.call(l, k);
        var inR = Object.prototype.hasOwnProperty.call(r, k);
        var inB = bb && Object.prototype.hasOwnProperty.call(bb, k);
        var sub = path === null ? null : (path === "" ? k : path + "." + k);
        if (inL && inR) out[k] = mergeValue(inB ? bb[k] : undefined, l[k], r[k], ctx, sub);
        else if (inL) { if (!inB) out[k] = l[k]; }          // added locally, or deleted remotely
        else if (!inB) out[k] = r[k];                        // added remotely, or deleted locally
      });
      return out;
    }
    if (Array.isArray(l) && Array.isArray(r)) {
      if (isRecordArray(l) && isRecordArray(r)) {
        return mergeRecords(Array.isArray(b) ? b : null, l, r, { id: "id" }, ctx);
      }
      if (l.length === r.length && allPrimitive(l) && allPrimitive(r)) {
        var bArr = Array.isArray(b) && b.length === l.length ? b : null;
        return l.map(function (x, i) { return mergeValue(bArr ? bArr[i] : undefined, x, r[i], ctx, null); });
      }
    }
    ctx.stats.conflicts++;
    return ctx.preferRemote ? r : l;
  }

  /* progress carries a status and a checklist that must agree — the
     merge can tick the fourth box from one device onto a status the other
     device still calls "started" */
  function reconcileProgress(doc) {
    var p = doc && doc.progress;
    if (!isPlain(p)) return;
    Object.keys(p).forEach(function (k) {
      var v = p[k];
      if (!isPlain(v) || !Array.isArray(v.check)) return;
      if (v.check.length && v.check.every(Boolean)) v.status = "done";
      else if ((!v.status || v.status === "none") && v.check.some(Boolean)) v.status = "started";
    });
  }

  /* merge(base, local, remote) → { doc, stats, rekeyed }
     `base` may be null (no common ancestor). Inputs are not mutated. */
  function merge(base, local, remote) {
    var B = isPlain(base) ? clone(base) : null;
    var L = clone(isPlain(local) ? local : {});
    var R = clone(isPlain(remote) ? remote : {});
    var stats = { added: 0, deleted: 0, conflicts: 0 };
    var rekeyed = rekeyCollisions(B, L, R);
    var preferRemote = false;
    if (!B) {
      var ls = Array.isArray(L.sessions) ? L.sessions.length : 0;
      var rs = Array.isArray(R.sessions) ? R.sessions.length : 0;
      preferRemote = rs > ls;
    }
    var ctx = { preferRemote: preferRemote, stats: stats };
    var doc = mergeValue(B === null ? undefined : B, L, R, ctx, "");
    reconcileProgress(doc);
    return { doc: doc, stats: stats, rekeyed: rekeyed };
  }

  KOS.cloudmerge = {
    merge: merge,
    deepEqual: deepEqual,
    /* exposed for tests */
    _sameOrigin: sameOrigin,
    _records: RECORDS
  };
})();
