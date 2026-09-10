/* Kurenai OS — core/pacing.js
   The integrated weekly plan: the schema gate, the one-time seed, and every
   derivation the Pacing view reads.

   WHAT THIS OWNS, AND WHAT IT DELIBERATELY DOES NOT

   It owns ONE thing: the plan. Which week the school scheme of work covers
   what, which week my own curriculum covers what, and which generated
   specification leaves each of those rows points at. That plan arrived once
   from four Notion databases (js/data/pacing.js is the seed) and now lives
   in state.pacing — so it rides localStorage, the standard full backup and
   the cloud state document like every other domain, with no parallel store.

   It owns NO progress, NO mastery and NO reward. A plan row's coverage is
   READ from the canonical study record (KOS.store.peekProgress) through the
   leaves the row is linked to; nothing here writes progress, and nothing
   here calls KOS.sessions.log. Pacing is logistics in the same sense the
   Budget Planner is (invariant 5a): it tells you what the week holds, it
   does not pay you for it. A second status field next to the four canonical
   checks is exactly the drift invariant 27 exists to stop, so there is not
   one — the only per-row state pacing stores is the row's own note.

   ALIGNMENT is the claim this module exists to make, and the reason the
   three Notion databases had to become one store: for a given week and
   subject, are the spec points class is teaching ones my own plan has
   already been through, is about to reach, or has not scheduled at all?
   That is answered by set arithmetic over linked leaf refs and nothing
   else — where a row carries no refs it is counted as evidence-free and
   excluded, never guessed at (invariants 76/77). */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var SCHEMA = 1;
  var SUBJECTS = ["compsci", "maths", "it"];
  var SOURCES = ["school", "personal"];

  function P() {
    var s = KOS.store.state.pacing;
    if (!s || typeof s !== "object") {
      s = KOS.store.state.pacing = { v: SCHEMA, seeded: false, importedOn: null, nextId: 1,
        offset: { schoolMinusPersonal: 1 }, weeks: [], entries: [] };
    }
    if (!Array.isArray(s.weeks)) s.weeks = [];
    if (!Array.isArray(s.entries)) s.entries = [];
    if (!s.offset || typeof s.offset !== "object") s.offset = { schoolMinusPersonal: 1 };
    if (!isFinite(s.nextId) || s.nextId < 1) s.nextId = nextFreeId(s);
    return s;
  }

  /* ids are "p<n>" so the seed and anything added later share one namespace
     and a restored backup can never collide with a row created since */
  function nextFreeId(s) {
    var max = 0;
    (s.entries || []).forEach(function (e) {
      var m = /^p(\d+)$/.exec(String(e && e.id));
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return max + 1;
  }

  function str(v) { return v == null ? "" : String(v); }
  function intOrNull(v) {
    var n = parseInt(v, 10);
    return isFinite(n) ? n : null;
  }

  /* ---------------- the schema gates ----------------
     Two records, two normalisers, in the house idiom: a stored record is
     built field by field from what is known, so an unrecognised key in an
     old save or a hand-edited backup can never ride back into the app. */
  function normaliseWeek(w) {
    w = w || {};
    return {
      wb: str(w.wb).trim(),
      label: str(w.label).trim() || str(w.wb).trim(),
      schoolWk: intOrNull(w.schoolWk),
      personalWk: intOrNull(w.personalWk),
      note: str(w.note)
    };
  }
  function normalise(e) {
    e = e || {};
    var subject = SUBJECTS.indexOf(e.subject) !== -1 ? e.subject : null;
    return {
      id: str(e.id),
      source: SOURCES.indexOf(e.source) !== -1 ? e.source : "personal",
      subject: subject,
      wk: intOrNull(e.wk),
      wb: str(e.wb),
      /* trimmed at the gate, so " " can never pass a required-title check
         and no row is stored under a name that renders as nothing */
      kind: str(e.kind).trim(),
      area: str(e.area).trim(),
      paper: str(e.paper).trim(),
      title: str(e.title).trim(),
      detail: str(e.detail).trim(),
      /* a ref only survives if the generated specification really has that
         leaf — a plan that points at a topic page which does not exist is
         worse than a plan that admits it has no link. When the leaf index
         is not loaded yet the refs are kept as-is: an unavailable index is
         not evidence that a ref is wrong, and silently emptying the plan
         would be the worse failure. */
      refs: (Array.isArray(e.refs) ? e.refs : []).map(str)
        .filter(function (r) { return r && (!indexReady(subject) || leafOf(subject, r)); }),
      note: str(e.note)
    };
  }

  /* ---------------- the one-time seed ----------------
     js/data/pacing.js is a SEED, not a live source. It is copied in once;
     from then on state.pacing is authoritative and re-running this is a
     no-op, so a user's edits (and a cloud pull carrying them) are never
     overwritten by the file that shipped with the build. */
  function ensureSeeded() {
    var s = P();
    if (s.seeded) return false;
    var seed = window.KOS_PACING;
    if (!seed || !Array.isArray(seed.weeks) || !Array.isArray(seed.entries)) return false;
    s.v = SCHEMA;
    s.seeded = true;
    s.importedOn = str(seed.importedOn);
    s.offset = { schoolMinusPersonal: intOrNull(seed.offset && seed.offset.schoolMinusPersonal) || 1 };
    s.weeks = seed.weeks.map(normaliseWeek).filter(function (w) { return w.wb; });
    s.entries = seed.entries.map(normalise).filter(function (e) { return e.id && e.wb && e.subject; });
    s.nextId = nextFreeId(s);
    KOS.store.save();
    return true;
  }

  /* ---------------- writes: the plan is editable ----------------
     Notion was the source once; it is not the source any more, so every
     row and every week has to be creatable, editable and removable HERE or
     the app is not really the source of truth it claims to be.

     Two rules hold across all of them. A row always belongs to a week that
     exists — an entry pointing at a week beginning nothing has is refused,
     not silently orphaned. And a row's `wk` number is DERIVED from that
     week on every write (school rows take the school number, personal rows
     the personal one), never carried independently, so the offset can be
     corrected in one place and the rows follow. */
  function weekNumberFor(week, source) {
    if (!week) return null;
    return source === "school" ? week.schoolWk : week.personalWk;
  }

  function addEntry(data) {
    var s = P();
    data = data || {};
    var week = weekAt(str(data.wb));
    if (!week) return null;
    var e = normalise(data);
    if (!e.subject || !e.title) return null;
    e.id = "p" + (s.nextId++);
    e.wk = weekNumberFor(week, e.source);
    s.entries.push(e);
    KOS.store.save();
    return e;
  }

  function updateEntry(id, patch) {
    var e = entryById(id);
    if (!e || !patch) return null;
    var merged = normalise(Object.assign({}, e, patch, { id: e.id }));
    var week = weekAt(merged.wb);
    if (!week) return null;
    if (!merged.subject || !merged.title) return null;
    merged.wk = weekNumberFor(week, merged.source);
    Object.keys(merged).forEach(function (k) { e[k] = merged[k]; });
    KOS.store.save();
    return e;
  }

  function removeEntry(id) {
    var s = P();
    var i = s.entries.findIndex(function (e) { return e.id === id; });
    if (i === -1) return false;
    s.entries.splice(i, 1);
    KOS.store.save();
    return true;
  }

  function addWeek(data) {
    var s = P();
    var w = normaliseWeek(data);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(w.wb)) return null;
    if (weekAt(w.wb)) return null;                 /* the week beginning IS the key */
    s.weeks.push(w);
    KOS.store.save();
    return w;
  }

  /* Moving a week to a different beginning re-points its rows in the same
     write — a half-applied move would leave rows addressing a week that no
     longer exists, which is the one state the reads above cannot render. */
  function updateWeek(wb, patch) {
    var w = weekAt(wb);
    if (!w || !patch) return null;
    var next = normaliseWeek(Object.assign({}, w, patch));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(next.wb)) return null;
    if (next.wb !== w.wb && weekAt(next.wb)) return null;
    var moved = next.wb !== w.wb, from = w.wb;
    Object.keys(next).forEach(function (k) { w[k] = next[k]; });
    P().entries.forEach(function (e) {
      if (moved && e.wb === from) e.wb = w.wb;
      if (e.wb === w.wb) e.wk = weekNumberFor(w, e.source);
    });
    KOS.store.save();
    return w;
  }

  /* Refuses by default rather than quietly taking the rows with it: the
     caller has to say it meant to, and the UI says how many it would take. */
  function removeWeek(wb, opts) {
    var s = P();
    var i = s.weeks.findIndex(function (w) { return w.wb === wb; });
    if (i === -1) return { removed: false, entries: 0 };
    var rows = entriesFor(wb);
    if (rows.length && !(opts && opts.cascade)) return { removed: false, entries: rows.length };
    s.weeks.splice(i, 1);
    s.entries = s.entries.filter(function (e) { return e.wb !== wb; });
    KOS.store.save();
    return { removed: true, entries: rows.length };
  }

  /* ---------------- reads ---------------- */
  function weeks() {
    return P().weeks.slice().sort(function (a, b) { return a.wb < b.wb ? -1 : a.wb > b.wb ? 1 : 0; });
  }
  function weekAt(wb) {
    return P().weeks.filter(function (w) { return w.wb === wb; })[0] || null;
  }
  function entries() { return P().entries; }
  function entryById(id) {
    return P().entries.filter(function (e) { return e.id === id; })[0] || null;
  }
  function entriesFor(wb, subject, source) {
    return P().entries.filter(function (e) {
      return e.wb === wb
        && (!subject || e.subject === subject)
        && (!source || e.source === source);
    });
  }

  /* the week a date falls in: the last week beginning on or before it, and
     the first week for any date before the plan starts. Returns null only
     when there is no plan at all. */
  function weekFor(dateISO) {
    var ws = weeks();
    if (!ws.length) return null;
    var found = null;
    ws.forEach(function (w) { if (w.wb <= dateISO) found = w; });
    return found || ws[0];
  }
  function currentWeek() {
    return weekFor(KOS.srs ? KOS.srs.todayISO() : new Date().toISOString().slice(0, 10));
  }
  function indexOfWb(wb) {
    var ws = weeks();
    for (var i = 0; i < ws.length; i++) if (ws[i].wb === wb) return i;
    return -1;
  }

  /* Derived, never stored: a week with no school and no personal number is
     the school holiday the hub recorded that way, and a mock week is a week
     that actually contains a mock — so neither can drift from the rows. */
  function isBreak(w) { return !!w && w.schoolWk == null && w.personalWk == null; }
  function isMock(w) {
    return !!w && entriesFor(w.wb, null, "school").some(function (e) { return e.kind === "Mock"; });
  }

  /* ---------------- the specification seam ----------------
     hub.js owns the flattened leaf index. Pacing only ever READS it, and
     tolerates its absence (core loads before modules, and the smoke suites
     load pieces on their own). */
  function indexReady(subject) {
    return !!(subject && KOS.hub && KOS.hub.BYREF && KOS.hub.BYREF[subject]);
  }
  function leafOf(subject, ref) {
    if (!ref || !indexReady(subject)) return null;
    return KOS.hub.BYREF[subject][ref] || null;
  }
  function leavesOf(entry) {
    if (!entry) return [];
    return entry.refs.map(function (r) {
      var leaf = leafOf(entry.subject, r);
      return leaf ? { ref: r, title: leaf.title, leaf: leaf } : { ref: r, title: r, leaf: null };
    });
  }

  /* Coverage is a COUNT OF CANONICAL RECORDS, not a second statistic.
     `done` is how many of the linked leaves the study record already marks
     complete and `checks` is how many of their four checks are ticked —
     both read straight off KOS.store.peekProgress, so this surface cannot
     disagree with the topic page it links to. */
  function coverage(entry) {
    var out = { refs: 0, done: 0, started: 0, checks: 0, maxChecks: 0 };
    if (!entry) return out;
    entry.refs.forEach(function (ref) {
      out.refs++;
      out.maxChecks += 4;
      var p = KOS.store.peekProgress(entry.subject, ref);
      if (!p) return;
      if (p.status === "done") out.done++;
      else if (p.status && p.status !== "none") out.started++;
      (p.check || []).forEach(function (c) { if (c) out.checks++; });
    });
    return out;
  }

  /* ---------------- ALIGNMENT ----------------
     For one week and one subject: take the spec points class is teaching,
     and ask when my own plan reaches each of them.

       lead > 0   my plan covered it that many weeks EARLIER  (ahead)
       lead === 0 same week                                   (aligned)
       lead < 0   my plan reaches it that many weeks LATER    (behind)
       unplanned  it is not in my personal curriculum at all

     Every one of those is an assertion about linked leaf refs. A class row
     with no refs (an NEA supervision week, a mock) contributes nothing, and
     a week whose class rows carry no refs at all returns evidence:false so
     the view can say so instead of drawing an empty verdict. */
  function alignment(wb, subject) {
    var out = { evidence: false, classRefs: [], ahead: 0, aligned: 0, behind: 0,
      unplanned: 0, items: [], maxLead: 0 };
    var here = indexOfWb(wb);
    if (here === -1) return out;

    var seen = {};
    entriesFor(wb, subject, "school").forEach(function (e) {
      e.refs.forEach(function (r) { seen[r] = true; });
    });
    out.classRefs = Object.keys(seen);
    if (!out.classRefs.length) return out;
    out.evidence = true;

    out.classRefs.forEach(function (ref) {
      /* the EARLIEST personal week that covers this point — first contact
         is what decides whether class is revisiting or introducing it */
      var best = null, bestIdx = Infinity;
      P().entries.forEach(function (e) {
        if (e.source !== "personal" || e.subject !== subject) return;
        if (e.refs.indexOf(ref) === -1) return;
        var i = indexOfWb(e.wb);
        if (i !== -1 && i < bestIdx) { bestIdx = i; best = e; }
      });
      var leaf = leafOf(subject, ref);
      var item = { ref: ref, title: leaf ? leaf.title : ref, entry: best,
        lead: best ? here - bestIdx : null };
      if (!best) { out.unplanned++; }
      else if (item.lead > 0) { out.ahead++; out.maxLead = Math.max(out.maxLead, item.lead); }
      else if (item.lead === 0) { out.aligned++; }
      else { out.behind++; }
      out.items.push(item);
    });
    return out;
  }

  /* the honest one-liner the view prints under a subject column. Returns
     null when there is nothing to claim — no sentence is better than a
     sentence built out of no evidence. */
  function alignmentLine(a) {
    if (!a || !a.evidence) return null;
    var n = a.classRefs.length;
    if (a.unplanned === n) {
      return "Class is on " + n + " spec point" + (n === 1 ? "" : "s") +
        " your own plan does not schedule.";
    }
    var parts = [];
    if (a.ahead) parts.push(a.ahead + " already covered" + (a.maxLead ? ", up to " + a.maxLead + " week" + (a.maxLead === 1 ? "" : "s") + " ago" : ""));
    if (a.aligned) parts.push(a.aligned + " landing this same week");
    if (a.behind) parts.push(a.behind + " still ahead of you");
    if (a.unplanned) parts.push(a.unplanned + " not in your plan");
    return "Of " + n + " spec point" + (n === 1 ? "" : "s") + " in class: " + parts.join(", ") + ".";
  }

  /* ---------------- THE BRAID ----------------
     The same alignment evidence, but as topology instead of a sentence.

     Each subject is two threads running through the term — what class does,
     and what I do — and every spec point they SHARE is an edge between the
     week my plan reaches it and the week class teaches it. Read as a graph
     that is what a branch is: my plan forks off early, runs its own line,
     and merges back when class arrives at the same point. An edge pointing
     backwards (class first) is the same relationship the other way round.

     Nothing here is new evidence. It is alignment() over every week at
     once, grouped so that one edge can carry several spec points, and it
     is empty — not decorative — when the plan carries no links. */
  function braid() {
    var ws = weeks();
    var out = { weeks: ws, lanes: [] };
    SUBJECTS.forEach(function (sid) {
      var lane = { subject: sid, classAt: {}, mineAt: {}, links: [], unplanned: [], linkedRefs: 0 };
      ws.forEach(function (w) {
        var c = entriesFor(w.wb, sid, "school");
        var m = entriesFor(w.wb, sid, "personal");
        if (c.length) lane.classAt[w.wb] = c.length;
        if (m.length) lane.mineAt[w.wb] = m.length;

        var a = alignment(w.wb, sid);
        if (!a.evidence) return;
        var grouped = {};
        a.items.forEach(function (i) {
          if (!i.entry) {
            lane.unplanned.push({ wb: w.wb, ref: i.ref, title: i.title });
            return;
          }
          lane.linkedRefs++;
          var key = i.entry.wb + "→" + w.wb;
          if (!grouped[key]) {
            grouped[key] = { fromWb: i.entry.wb, toWb: w.wb, lead: i.lead, refs: [] };
          }
          grouped[key].refs.push({ ref: i.ref, title: i.title, entry: i.entry });
        });
        Object.keys(grouped).forEach(function (k) { lane.links.push(grouped[k]); });
      });
      out.lanes.push(lane);
    });
    return out;
  }

  /* per-week load, for the term ribbon. A count of planned rows — a fact
     the cell can be labelled with, not a score. */
  function load(wb) {
    var out = { total: 0, compsci: 0, maths: 0, it: 0, school: 0 };
    entriesFor(wb).forEach(function (e) {
      if (e.source === "school") { out.school++; return; }
      out.total++;
      out[e.subject]++;
    });
    return out;
  }
  function maxLoad() {
    var m = 0;
    weeks().forEach(function (w) { m = Math.max(m, load(w.wb).total); });
    return m;
  }

  /* ---------------- the only writes ----------------
     A note on a week, a note on a row. Both go through save(); neither
     touches the Governor, the session log or the study record. */
  function setWeekNote(wb, text) {
    var w = weekAt(wb);
    if (!w) return null;
    w.note = str(text);
    KOS.store.save();
    return w;
  }
  function setEntryNote(id, text) {
    var e = entryById(id);
    if (!e) return null;
    e.note = str(text);
    KOS.store.save();
    return e;
  }

  KOS.pacing = {
    SCHEMA: SCHEMA,
    SUBJECTS: SUBJECTS,
    normalise: normalise,
    normaliseWeek: normaliseWeek,
    ensureSeeded: ensureSeeded,
    state: P,
    weeks: weeks,
    weekAt: weekAt,
    weekFor: weekFor,
    currentWeek: currentWeek,
    indexOfWb: indexOfWb,
    isBreak: isBreak,
    isMock: isMock,
    entries: entries,
    entryById: entryById,
    entriesFor: entriesFor,
    leafOf: leafOf,
    leavesOf: leavesOf,
    coverage: coverage,
    alignment: alignment,
    alignmentLine: alignmentLine,
    braid: braid,
    load: load,
    maxLoad: maxLoad,
    setWeekNote: setWeekNote,
    setEntryNote: setEntryNote,
    addEntry: addEntry,
    updateEntry: updateEntry,
    removeEntry: removeEntry,
    addWeek: addWeek,
    updateWeek: updateWeek,
    removeWeek: removeWeek
  };
})();
