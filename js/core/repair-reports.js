/* Kurenai OS — js/core/repair-reports.js
   The one-off rebuild of saved reports after the DI-27 clean-up (quality
   W1, decision B1; findings HR-02, HR-31). A recorded exception to
   invariant 102 (a saved report is never recomputed): it runs ONCE, as a
   consent repair (KOS.repairs: a preview you approve, a verified
   checkpoint first, a receipt), on the device that ran the clean-up.

   SURGICAL, BECAUSE THE LEDGER FORGOT. The ledger keeps 2,000 entries and
   the phantom rewards pushed most of the real history out of it, so a
   saved report holds facts nothing can reproduce. Each item changes only
   where the bug reached it, by what the data proves, and only an item
   SAVED BEFORE THE CLEAN-UP RAN (one saved since already excludes the
   phantoms):

   - THE PAY, exactly: the removed entries are read back from the
     clean-up's verified checkpoint, picked by the ids in its audit record
     (date, kind and titles matched too) and priced by the Governor's
     sync-reward rule, as the clean-up did. Only entries that existed when
     the item was saved count.
       · a SNAPSHOT's balance (gov.xp, gold, level) loses the phantom pay
         earned before it was taken;
       · a REPORT's "earned" loses the phantom pay inside its period; its
         level line is re-read from the corrected boundary snapshot.
   - THE REST STREAK (gov.rest, a snapshot's streaks.rest): the phantoms
     were media entries, so they kept it alive. It is recounted from the
     checkpoint's ledger without them — only where that ledger proves it
     (a run that reaches the ledger's oldest day is left as saved).
   - THE COLLECTION (HR-31): a fresh section by the one definition of
     activity is taken ONLY when every title it drops is a collided DI-27
     title or a title whose row still exists and had no real activity in
     the period, and it adds none; saved titles keep their own name, cover
     and score. Otherwise only the collided titles are taken out (and the
     count, module and status tallies with them).
   - A REPORT FROZEN EMPTY (HR-02): saved with nothing in it, and a build
     now finds content → the fresh facts, its level from the corrected
     snapshot (or none).
   - THE NEXT REPORT'S COMPARISON (`prev`): re-derived from the corrected
     report before it, when it was taken from that report.
   Terms and years, and words Kurenai wrote, are left as they are and
   counted in the preview. Every original is kept in the media kv
   (`repair.originals.<id>`) before anything is written, because the full
   backup does not hold the reports store. A rebuilt item carries
   `fix.di27` and a higher `factsRev`/`rev`, which wins the cross-device
   merge (reportstore.js) — so every other device must run this version
   before it runs. */
(function () {
  "use strict";
  var KOS = window.KOS = window.KOS || {};
  var ID = "reports-rebuild-di27";

  function cbp(fn) { return new Promise(function (res, rej) { fn(function (e, v) { e ? rej(e) : res(v); }); }); }
  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function addDays(iso, n) { return KOS.report.addDays(iso, n); }
  function level(xp) { return KOS.governor.levelInfo(Math.max(0, xp)); }
  function isoOf(ts) { var d = new Date(ts); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

  /* the removed entries, exactly, and the checkpoint's ledger without them */
  function evidence() {
    var rc = KOS.repairs && KOS.repairs.receipt("di27-phantom-sync");
    if (!rc || rc.noop || !rc.checkpoint) return Promise.resolve({ waiting: "the DI-27 clean-up has not run" });
    return KOS.repairs.audit("di27-phantom-sync").then(function (audit) {
      if (!audit || !Array.isArray(audit.items) || !audit.items.length) return { waiting: "this device has no record of the clean-up: run it on the device that ran the clean-up" };
      return KOS.backup.verify(rc.checkpoint).then(function (ver) {
        if (!ver.ok) return { waiting: "the clean-up's checkpoint does not verify (" + ver.reason + ")" };
        return KOS.backup._raw.get(rc.checkpoint).then(function (rec) {
          var ledger = (JSON.parse(rec.text).state || {}).sessions || [], byId = {};
          ledger.forEach(function (e) { byId[e.id] = e; });
          var gone = {}, list = [], missing = 0;
          audit.items.forEach(function (it) {
            var e = byId[it.id];
            if (e && e.date === it.date && e.type === "media" && e.metrics && same(e.metrics.titles, it.titles)) { list.push(e); gone[e.id] = true; }
            else missing++;
          });
          if (missing) return { waiting: missing + " of the clean-up's " + audit.items.length + " entries do not match its checkpoint, so nothing can be priced exactly" };
          var mediaDays = {}, oldest = null;
          ledger.forEach(function (e) {
            if (!oldest || e.date < oldest) oldest = e.date;
            if (e.type === "media" && !gone[e.id]) mediaDays[e.date] = true;
          });
          return {
            cutoff: rc.at,
            titles: ((rc.summary && rc.summary.rows) || []).map(function (r) { return r.title; }),
            entries: list.map(function (e) { var pr = KOS.repairDi27.price(e.metrics); return { ts: e.ts, date: e.date, xp: pr.xp, gold: pr.gold }; }),
            mediaDays: mediaDays, oldest: oldest
          };
        });
      });
    });
  }
  function sumIn(entries, test) {
    var o = { xp: 0, gold: 0, n: 0 };
    entries.forEach(function (e) { if (test(e)) { o.xp += e.xp; o.gold += e.gold; o.n++; } });
    return o;
  }
  /* the rest streak at `end` without the phantoms, or null when the
     checkpoint's ledger cannot prove it (the run reaches its oldest day) */
  function restAt(ev, end) {
    var d = ev.mediaDays[end] ? end : addDays(end, -1), n = 0;
    while (ev.mediaDays[d] && n < 3660) { n++; d = addDays(d, -1); }
    return d < ev.oldest ? null : n;
  }
  function build(rep) {
    return new Promise(function (res) {
      /* `prev` on a saved report is the week before's TOTALS, while build
         takes facts: build without it */
      KOS.report.build({ period: rep.period, id: rep.id, start: rep.start, end: rep.end }, { rebuilt: !!rep.rebuilt }, res);
    });
  }
  function rows() { return cbp(function (cb) { KOS.mediadb.query({}, cb); }); }

  /* the Collection, by the rule above: {facts section, how} or null */
  function fixCollection(f0, fresh, ev, rowById, p) {
    var c0 = f0.collection;
    if (!c0) return null;
    var collided = {};
    ev.titles.forEach(function (t) { collided[t] = true; });
    var c1 = fresh.collection || null, savedT = c0.titles || [], freshT = (c1 && c1.titles) || [];
    var key = function (t) { return t.syncId || t.title; };
    var inFresh = {}, inSaved = {};
    freshT.forEach(function (t) { inFresh[key(t)] = t; });
    savedT.forEach(function (t) { inSaved[key(t)] = t; });
    var dropped = savedT.filter(function (t) { return !inFresh[key(t)]; });
    var added = freshT.filter(function (t) { return !inSaved[key(t)]; });
    if (!dropped.length && !added.length) return null;
    /* a dropped title is explained by the bug (a collided title) or by the
       activity rule (its row still exists and the saved report showed no
       progress for it: no range, no minutes — a score, a pause, an echo) */
    var explained = dropped.every(function (t) { return collided[t.title] || (t.syncId && rowById[t.syncId] && !t.range && !t.mins); });
    if (explained && !added.length) {
      var out = clone(c1) || null;
      if (out) {
        /* saved titles keep their own name, cover and score */
        out.titles.forEach(function (t) { var s = inSaved[key(t)]; if (s) { t.title = s.title; t.cover = s.cover; t.score = s.score; } });
        out.completed = out.titles.filter(function (t) { return t.status === "finished"; }).slice(0, 12)
          .map(function (t) { return { title: t.title, module: t.module, score: t.score || 0, cover: t.cover || null }; });
        out.topRated = out.titles.filter(function (t) { return t.score > 0; }).sort(function (a, b) { return b.score - a.score || (a.title < b.title ? -1 : 1); }).slice(0, 8)
          .map(function (t) { return { title: t.title, module: t.module, score: t.score, cover: t.cover || null }; });
        if (c0.monthTitles && c1.monthTitles) out.monthTitles = c1.monthTitles;
      }
      return { section: out, how: "fresh", removed: dropped.map(function (t) { return t.title; }) };
    }
    /* otherwise: only the collided titles come out */
    var take = savedT.filter(function (t) { return collided[t.title]; });
    if (!take.length) return { section: undefined, how: "untouched", removed: [] };
    var out2 = clone(c0);
    out2.titles = out2.titles.filter(function (t) { return !collided[t.title]; });
    out2.count = out2.titles.length;
    take.forEach(function (t) {
      if (out2.byModule && out2.byModule[t.module]) { out2.byModule[t.module]--; if (!out2.byModule[t.module]) delete out2.byModule[t.module]; }
      if (out2.status && out2.status[t.status]) { out2.status[t.status]--; if (!out2.status[t.status]) delete out2.status[t.status]; }
      if (out2.estMins && t.mins) out2.estMins = Math.max(0, out2.estMins - t.mins);
    });
    ["completed", "topRated"].forEach(function (k) { if (out2[k]) out2[k] = out2[k].filter(function (t) { return !collided[t.title]; }); });
    return { section: out2.count ? out2 : null, how: "patched", removed: take.map(function (t) { return t.title; }) };
  }

  function plan() {
    if (!KOS.reportStore || !KOS.reportStore.available() || !KOS.report) {
      return Promise.resolve({ needed: false, summary: { waiting: "no report store" }, items: [], apply: function () {} });
    }
    return evidence().then(function (ev) {
      if (ev.waiting) return { needed: false, summary: { waiting: ev.waiting }, items: [], apply: function () {} };
      var E = ev.entries;
      return Promise.all([cbp(function (cb) { KOS.reportStore.snapshots(cb); }), cbp(function (cb) { KOS.reportStore.list(null, cb); }), rows()]).then(function (got) {
        var snaps = got[0] || [], reps = got[1] || [], rowById = {};
        (got[2] || []).forEach(function (r) { if (r.syncId) rowById[r.syncId] = r; });
        /* the snapshots first: a report's level line reads them */
        var snapOut = [], snapById = {};
        snaps.forEach(function (s) {
          snapById[s.id] = s;
          if ((s.fix && s.fix.di27) || !(s.takenAt < ev.cutoff)) return;
          var n = clone(s), note = { snapshot: s.id };
          var d = sumIn(E, function (e) { return e.ts < s.takenAt; });
          if (s.gov && s.gov.xp != null && (d.xp || d.gold)) {
            n.gov.xp = Math.max(0, s.gov.xp - d.xp);
            n.gov.gold = Math.max(0, (s.gov.gold || 0) - d.gold);
            n.gov.level = level(n.gov.xp).level;
            note.xp = [s.gov.xp, n.gov.xp]; note.gold = [s.gov.gold, n.gov.gold]; note.level = [s.gov.level, n.gov.level];
          }
          var r = s.streaks && s.streaks.rest != null ? restAt(ev, isoOf(s.takenAt)) : null;
          if (r != null && r < s.streaks.rest) { n.streaks.rest = r; note.rest = [s.streaks.rest, r]; }
          if (!note.xp && !note.rest) return;
          n.rev = (s.rev || 0) + 1;
          n.fix = { di27: { xp: d.xp, gold: d.gold } };
          snapOut.push({ before: s, after: n, note: note });
          snapById[s.id] = n;
        });
        var repOut = [], skipped = { savedAfter: 0, termYear: 0, kurenaiWords: 0 }, byId = {};
        var sorted = reps.slice().sort(function (a, b) { return a.start < b.start ? -1 : a.start > b.start ? 1 : 0; });
        sorted.forEach(function (r) { byId[r.id] = { old: r.facts, now: r.facts }; });
        return sorted.reduce(function (chain, rep) {
          return chain.then(function () {
            if (rep.fix && rep.fix.di27) return;
            if (!(rep.savedAt < ev.cutoff)) { skipped.savedAfter++; return; }
            if (rep.period === "term" || rep.period === "year") { skipped.termYear++; return; }
            var f0 = rep.facts || {};
            return build(rep).then(function (fresh) {
              var notes = { id: rep.id, period: rep.period };
              var empty = !KOS.reportStore.hasContent(f0) && KOS.reportStore.hasContent(fresh);
              var f = empty ? clone(fresh) : clone(f0);
              if (empty) { notes.emptyRebuilt = true; if (f0.prev) f.prev = clone(f0.prev); else delete f.prev; }
              /* the pay earned in the period, as saved */
              var d = sumIn(E, function (e) { return e.date >= rep.start && e.date <= rep.end && e.ts < rep.savedAt; });
              if (!empty && f.gov && f.gov.xp != null && (d.xp || d.gold)) {
                notes.earned = { before: [f.gov.xp, f.gov.gold], after: [Math.max(0, f.gov.xp - d.xp), Math.max(0, f.gov.gold - d.gold)], phantomEntries: d.n };
                f.gov.xp = notes.earned.after[0]; f.gov.gold = notes.earned.after[1];
              }
              /* the level line, from the corrected closing snapshot (or none) */
              var s1 = snapById[addDays(rep.end, 1)], s0 = snapById[rep.start];
              if (f.gov && f.gov.level != null) {
                var lvBefore = f.gov.level;
                if (s1 && s1.gov && s1.gov.xp != null && (empty || (s1.fix && s1.fix.di27))) {
                  var li = level(s1.gov.xp);
                  f.gov.level = li.level;
                  f.gov.levelPct = Math.round(100 * li.into / li.need);
                  if (s0 && s0.gov && f.gov.level > s0.gov.level) f.gov.levelFrom = s0.gov.level; else delete f.gov.levelFrom;
                } else if (empty && !s1) { delete f.gov.level; delete f.gov.levelPct; delete f.gov.levelFrom; }
                if (lvBefore !== f.gov.level) notes.level = { before: lvBefore, after: f.gov.level == null ? null : f.gov.level };
              }
              /* the rest streak, where the checkpoint proves it */
              if (f.gov && f.gov.rest != null) {
                var rr = restAt(ev, rep.end);
                if (rr != null && rr < f.gov.rest) { notes.rest = { before: f.gov.rest, after: rr }; f.gov.rest = rr; }
              }
              /* the Collection */
              if (!empty) {
                var fc = fixCollection(f0, fresh, ev, rowById, rep);
                if (fc && fc.how !== "untouched") {
                  notes.collection = { how: fc.how, before: ((f0.collection || {}).titles || []).length, after: fc.section ? fc.section.titles.length : 0, removed: fc.removed };
                  if (fc.section) f.collection = fc.section; else delete f.collection;
                  if (fc.how === "fresh") { if (fresh.mediaPersona) f.mediaPersona = fresh.mediaPersona; else delete f.mediaPersona; }
                }
              }
              /* the comparison with the report before, if it was taken from it */
              if (f0.prev) {
                var prevRep = sorted.filter(function (r) { return r.period === rep.period && r.end === addDays(rep.start, -1); })[0];
                var pr = prevRep && byId[prevRep.id];
                if (pr && pr.now !== pr.old && same(f0.prev, KOS.report.totals(pr.old))) {
                  var np = KOS.report.totals(pr.now);
                  if (!same(np, f0.prev)) { f.prev = np; notes.prev = true; }
                }
              }
              if (!notes.emptyRebuilt && !notes.earned && !notes.level && !notes.rest && !notes.collection && !notes.prev) return;
              if (rep.words && rep.words.mode === "kurenai" && rep.words.headline) { skipped.kurenaiWords++; notes.kurenaiWords = true; }
              f.stories = KOS.report.storiesOf(f);
              byId[rep.id].now = f;
              var n = clone(rep);
              n.facts = f;
              n.factsRev = (rep.factsRev || 0) + 1;
              n.fix = { di27: { xp: d.xp, gold: d.gold } };
              repOut.push({ notes: notes, before: rep, after: n });
            });
          });
        }, Promise.resolve()).then(function () {
          var items = snapOut.map(function (x) { return x.note; }).concat(repOut.map(function (x) { return x.notes; }));
          var count = function (k) { return repOut.filter(function (x) { return x.notes[k]; }).length; };
          var summary = {
            phantomEntries: E.length, cutoff: ev.cutoff, ledgerFrom: ev.oldest,
            snapshots: snapOut.length, reports: repOut.length,
            earnings: count("earned"), levels: count("level"), rest: count("rest"), collection: count("collection"),
            collectionFresh: repOut.filter(function (x) { return x.notes.collection && x.notes.collection.how === "fresh"; }).length,
            collectionPatched: repOut.filter(function (x) { return x.notes.collection && x.notes.collection.how === "patched"; }).length,
            emptyRebuilt: count("emptyRebuilt"), prev: count("prev"),
            leftAlone: skipped
          };
          return {
            needed: snapOut.length + repOut.length > 0,
            summary: summary,
            items: items,
            apply: function () {
              /* the originals first: the full backup does not hold the reports store */
              var originals = { at: Date.now(), snapshots: snapOut.map(function (x) { return x.before; }), reports: repOut.map(function (x) { return x.before; }) };
              return new Promise(function (res, rej) { KOS.mediadb.setKV("repair.originals." + ID, originals, function (e) { e ? rej(e) : res(); }); }).then(function () {
                var all = snapOut.map(function (x) { return function () { return cbp(function (cb) { KOS.reportStore.putSnapshot(x.after, cb); }); }; })
                  .concat(repOut.map(function (x) { return function () { return cbp(function (cb) { KOS.reportStore.putReport(x.after, cb); }); }; }));
                return all.reduce(function (p, f) { return p.then(f); }, Promise.resolve());
              }).then(function () {
                if (KOS.reportStore.syncCloud) KOS.reportStore.syncCloud();
                return { snapshots: snapOut.length, reports: repOut.length };
              });
            }
          };
        });
      });
    });
  }

  if (KOS.repairs) KOS.repairs.register(ID, { title: "Rebuild the saved reports after the DI-27 clean-up", consent: true, plan: plan });
  KOS.repairReports = { plan: plan };
})();
