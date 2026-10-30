/* Kurenai OS — core/creatives.js (KOS.creatives)
   The Creatives model (roadmap 5.7 item 3, docs/creatives-plan.md revision 2; design turn 31).

   WHAT IS STORED (state.creatives, synced; every part a keyed map so the cloud merge folds two
   devices per key, invariant 33):
     lessons[id]      { pages: {i: ts}, startAt }               reading evidence only
     works[id]        a piece of work, small: { lesson, study, track, kind (text | image | link),
                      title, at, words, check: {pass, rows, note, at}, portfolio (ts | null),
                      madeFrom, unit (a project's work), ms (its milestone), critique: {worked, next,
                      at} when you chose "Keep with this rep" }. Its text or picture
                      is in IndexedDB (kurenai-os-creatives), never in the state document.
     projects[unit]   { ms: {i: ts}, startAt, doneAt }          a unit's project, milestone by milestone
     paid[key]        ts — "study:<lesson>.<s>", "drill:<type>:<day>", "project:<unit>": pay once
     firsts[key]      ts — the desk's Firsts, kept, never counted
   Per device (state.ui.creatives): the Daily Creative's days and minutes, the Exam Season pause,
   Momentum per drill type, the Writing Desk's open draft, view choices (README §State and data),
   and a critique's tip pinned to a study's next rep (tips["<lesson>.<study>"]).

   WHAT IS DERIVED, never stored: a lesson's four checks (notes read, its studies saved, its check
   passed, a theory card proven: invariant 154), the Daily Creative (from the date and the evidence),
   every desk figure. A render writes nothing.

   WHAT PAYS (award(), the one definition the Governor calls, type "creatives", invariant 154):
     a micro-study's first passed check   8 XP, 1 gold
     a drill batch                        6 XP, once a day per drill type
     a unit's project, every milestone    150 XP, 40 gold, +10 HP (like a stage-1 capstone)
   Volume, redoing, re-saving, promoting, starring and critiques pay nothing beyond Focus. Theory
   cards are ordinary flashcards (invariant 111), keyed "creatives:<lesson>:<i>", and pay as they do.
   HP gates nothing (invariant 2). There is no Creatives streak (plan §6).                         */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;
  var SID = "creatives";
  var STUDY_PAY = { xp: 8, gold: 1, hp: 0 }, DRILL_PAY = { xp: 6, gold: 0, hp: 0 }, PROJECT_PAY = { xp: 150, gold: 40, hp: 10 };
  var CHECKS = ["Read the notes", "Saved the studies", "Passed the check", "A theory card held"];

  function C() { return window.KOS_CR || { TRACKS: [], UNITS: {}, LESSONS: {} }; }
  function today() { return KOS.srs.todayISO(); }
  function obj(v) { return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
  function rid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  /* ---------------- the gate ---------------- */
  function normalise(c) {
    c = obj(c);
    var works = {};
    Object.keys(obj(c.works)).forEach(function (id) {
      var w = obj(c.works[id]);
      if (!w.at) return;
      works[id] = {
        lesson: w.lesson || null, study: w.study || null, unit: w.unit || null, ms: w.ms != null ? +w.ms : null,
        track: w.track || null, kind: ["text", "image", "link"].indexOf(w.kind) >= 0 ? w.kind : "text",
        title: String(w.title || "Untitled").slice(0, 120), at: +w.at, words: Math.max(0, +w.words || 0),
        check: w.check ? { pass: !!w.check.pass, rows: Array.isArray(w.check.rows) ? w.check.rows.map(Boolean) : [], note: String(w.check.note || "").slice(0, 400), at: +w.check.at || +w.at } : null,
        portfolio: w.portfolio ? +w.portfolio : null, madeFrom: w.madeFrom || null, url: w.kind === "link" ? String(w.url || "") : undefined,
        critique: w.critique && w.critique.worked ? { worked: String(w.critique.worked).slice(0, 600), next: String(w.critique.next || "").slice(0, 400), at: +w.critique.at || +w.at } : null
      };
      if (!works[id].critique) delete works[id].critique;
      if (works[id].url === undefined) delete works[id].url;
    });
    return { v: 1, lessons: obj(c.lessons), works: works, projects: obj(c.projects), paid: obj(c.paid), firsts: obj(c.firsts) };
  }
  function S() {
    var st = store.state;
    if (!st.creatives || st.creatives.v !== 1 || !st.creatives.works) st.creatives = normalise(st.creatives);
    return st.creatives;
  }
  /* a read never writes: callers that only look use peek() */
  function peek() { var c = store.state.creatives; return c && c.v === 1 && c.works ? c : normalise(c); }
  var DAYS = [false, false, false, false, false, false, false];
  function settings(s) {
    s = obj(s);
    var days = Array.isArray(s.days) && s.days.length === 7 ? s.days.map(Boolean) : [true, true, true, true, true, true, true];
    return { days: days.some(Boolean) ? days : DAYS.map(function () { return true; }), minutes: [10, 20, 30].indexOf(+s.minutes) >= 0 ? +s.minutes : 20,
      examPause: s.examPause !== false };
  }
  function U() {
    var ui = store.state.ui;
    if (!ui.creatives || typeof ui.creatives !== "object") ui.creatives = {};
    return ui.creatives;
  }
  function prefs() { return settings((store.state.ui.creatives || {}).settings); }
  function setPrefs(patch) { var u = U(); u.settings = settings(Object.assign({}, prefs(), patch)); store.save(); return u.settings; }

  /* ---------------- the curriculum, read ---------------- */
  function lesson(id) { return C().LESSONS[id] || null; }
  function unit(id) { return C().UNITS[id] || null; }
  function track(id) { return C().TRACKS.filter(function (t) { return t.id === id; })[0] || null; }
  function tracks() { return C().TRACKS; }
  function lessons(tid) {
    var out = [];
    C().TRACKS.forEach(function (t) {
      if (tid && t.id !== tid) return;
      t.units.forEach(function (uid) { (C().UNITS[uid].lessons || []).forEach(function (id) { out.push(lesson(id)); }); });
    });
    return out;
  }
  function trackOf(lid) { var l = lesson(lid), u = l && unit(l.unit); return u ? u.track : null; }
  function study(lid, sid) { var l = lesson(lid); return l ? (l.studies || []).filter(function (s) { return s.id === sid; })[0] || null : null; }
  function content(id) { return (window.KOS_CONTENT || {})[SID + ":" + id] || null; }
  function pagesOf(id) { var c = content(id); return c && c.pages ? c.pages : []; }

  /* ---------------- reading ---------------- */
  function markPage(id, i) {
    if (!lesson(id)) return;
    var rec = S().lessons[id] = obj(S().lessons[id]);
    rec.pages = obj(rec.pages);
    if (!rec.startAt) rec.startAt = Date.now();
    if (!rec.pages[i]) { rec.pages[i] = Date.now(); store.save(); syncChecks(id); }
  }

  /* ---------------- works: the Practice Log and the Portfolio ---------------- */
  function worksOf(f) {
    var c = peek();
    return Object.keys(c.works).map(function (id) { return Object.assign({ id: id }, c.works[id]); })
      .filter(function (w) { return !f || f(w); }).sort(function (a, b) { return b.at - a.at; });
  }
  function work(id) { var w = peek().works[id]; return w ? Object.assign({ id: id }, w) : null; }
  /* addWork(rec, payload, cb) — save a piece: the record syncs, the payload (text or a picture's
     data URL) stays on this device in kurenai-os-creatives (invariant 156) */
  function addWork(rec, payload, cb) {
    var id = rec.id || "w" + rid(), st = S();
    var l = rec.lesson ? lesson(rec.lesson) : null;
    st.works[id] = normalise({ works: { x: Object.assign({}, rec, { at: Date.now(), track: rec.track || (l ? trackOf(l.id) : null) }) } }).works.x;
    if (rec.lesson) { var lr = st.lessons[rec.lesson] = obj(st.lessons[rec.lesson]); if (!lr.startAt) lr.startAt = Date.now(); }
    first(st.works[id].track === "write" ? "words" : st.works[id].track === "art" ? "drawing" : "work");
    store.save();
    if (rec.lesson) syncChecks(rec.lesson);
    if (rec.unit != null && rec.ms != null) markMilestone(rec.unit, rec.ms);
    if (payload != null && files.available()) files.put(id, payload, function () { if (cb) cb(id); });
    else if (cb) cb(id);
    return id;
  }
  function editWork(id, patch) {
    var st = S(), w = st.works[id]; if (!w) return null;
    ["title", "madeFrom", "words"].forEach(function (k) { if (k in patch) w[k] = k === "words" ? Math.max(0, +patch[k] || 0) : patch[k]; });
    store.save();
    return work(id);
  }
  /* the Practice Log can be pruned freely; a deletion keeps nothing (records and the file) */
  function removeWork(id) {
    var st = S(), w = st.works[id]; if (!w) return;
    delete st.works[id];
    store.save();
    if (w.lesson) syncChecks(w.lesson);
    if (files.available()) files.del(id);
  }
  /* promotion is a separate, deliberate tap, never automatic (invariant 156) */
  function promote(id, on) {
    var w = S().works[id]; if (!w) return;
    w.portfolio = on ? Date.now() : null;
    if (on) first("promoted");
    store.save();
  }
  function portfolio() { return worksOf(function (w) { return !!w.portfolio; }).sort(function (a, b) { return b.portfolio - a.portfolio; }); }

  /* setCheck(id, {rows, note}) — the self-marked check against "Good for this unit" (31e). Every
     row "Yes, mostly" is a pass; "Not yet" is a normal answer. Only a pass ticks the lesson's
     check, and a study's FIRST pass pays (8 XP, 1 gold), once ever. */
  function setCheck(id, ans) {
    var st = S(), w = st.works[id]; if (!w) return null;
    var rows = (ans.rows || []).map(Boolean), pass = rows.length > 0 && rows.every(Boolean);
    w.check = { pass: pass, rows: rows, note: String(ans.note || "").slice(0, 400), at: Date.now() };
    store.save();
    var paid = null;
    if (pass && w.lesson && w.study) {
      var key = "study:" + w.lesson + "." + w.study;
      if (!st.paid[key]) {
        st.paid[key] = Date.now();
        store.save();
        paid = key;
        KOS.sessions.log({ type: SID, subject: SID, ref: w.lesson, refs: [SID + ":" + w.lesson], metrics: { kind: "study", key: key, first: true, work: id } });
      }
    }
    if (w.lesson) syncChecks(w.lesson);
    return { pass: pass, paid: paid };
  }
  /* a drill batch (Design's drills, Art's timed drills): 6 XP once a day per drill type */
  function logDrill(type, info) {
    var st = S(), key = "drill:" + type + ":" + today(), first = !st.paid[key];
    if (first) st.paid[key] = Date.now();
    store.save();
    KOS.sessions.log({ type: SID, subject: SID, ref: info && info.lesson || null, refs: info && info.lesson ? [SID + ":" + info.lesson] : undefined,
      metrics: { kind: "drill", drill: type, key: key, first: first, reps: info && info.reps || 0 } });
    return first;
  }

  /* ---------------- projects ---------------- */
  function project(uid) { var u = unit(uid); return u ? u.project : null; }
  function projectState(uid) {
    var p = project(uid), rec = obj(peek().projects[uid]);
    if (!p) return null;
    var ms = p.milestones.map(function (_, i) { return !!(rec.ms && rec.ms[i]); });
    var studiesDone = (unit(uid).lessons || []).every(function (lid) { return studiesSaved(lid); });
    return { project: p, ms: ms, done: ms.every(Boolean), n: ms.filter(Boolean).length, offered: studiesDone, startAt: rec.startAt || null, doneAt: rec.doneAt || null };
  }
  /* a milestone is reached by saving its work (addWork with unit + ms) or by hand; the project pays
     once, when every milestone is reached */
  function markMilestone(uid, i, off) {
    var p = project(uid); if (!p || i < 0 || i >= p.milestones.length) return null;
    var st = S(), rec = st.projects[uid] = obj(st.projects[uid]);
    rec.ms = obj(rec.ms);
    if (!rec.startAt) rec.startAt = Date.now();
    if (off) delete rec.ms[i]; else if (!rec.ms[i]) rec.ms[i] = Date.now();
    store.save();
    var ps = projectState(uid), key = "project:" + uid;
    if (ps.done && !rec.doneAt) { rec.doneAt = Date.now(); first("project"); store.save(); }
    if (ps.done && !st.paid[key]) {
      st.paid[key] = Date.now();
      store.save();
      KOS.sessions.log({ type: SID, subject: SID, ref: p.after || null, metrics: { kind: "project", unit: uid, key: key, first: true } });
    }
    return ps;
  }

  /* ---------------- evidence → the shared progress record (invariant 154) ---------------- */
  function studyWorks(lid, sid) { return worksOf(function (w) { return w.lesson === lid && w.study === sid; }); }
  function studiesSaved(lid) {
    var l = lesson(lid); if (!l || !(l.studies || []).length) return false;
    return l.studies.every(function (s) { return studyWorks(lid, s.id).length > 0; });
  }
  function studyPassed(lid, sid) { return studyWorks(lid, sid).some(function (w) { return w.check && w.check.pass; }); }
  function cardKeys(lid) { var c = content(lid); return c && c.flashcards ? c.flashcards.map(function (_, i) { return SID + ":" + lid + ":" + i; }) : []; }
  function cardHeld(lid) { return cardKeys(lid).some(function (k) { var m = KOS.srs.peek(k); return !!(m && m.reps > 0); }); }
  function evidence(lid) {
    var l = lesson(lid), rec = obj(peek().lessons[lid]), pages = pagesOf(lid);
    var read = Object.keys(obj(rec.pages)).filter(function (i) { return +i < pages.length; }).length;
    var studies = l ? l.studies || [] : [];
    var saved = studies.filter(function (s) { return studyWorks(lid, s.id).length; }).length;
    var passed = studies.filter(function (s) { return studyPassed(lid, s.id); }).length;
    var cards = cardKeys(lid), held = cards.filter(function (k) { var m = KOS.srs.peek(k); return !!(m && m.reps > 0); }).length;
    return { pages: pages.length, read: read, studies: studies.length, saved: saved, passed: passed, cards: cards.length, held: held,
      checks: [pages.length > 0 && read >= pages.length, studies.length > 0 && saved >= studies.length, studies.length > 0 && passed >= studies.length, held > 0] };
  }
  function done(lid) { return evidence(lid).checks.every(Boolean); }
  function syncChecks(lid) {
    if (!lesson(lid) || !store.setCheck) return;
    var ev = evidence(lid), p = store.peekProgress ? store.peekProgress(SID, lid) : null;
    var cur = p && p.check ? p.check : [false, false, false, false];
    ev.checks.forEach(function (on, i) { if (!!cur[i] !== on) store.setCheck(SID, lid, i, on); });
  }
  /* a theory card rated elsewhere (the flashcards engine) ticks its lesson's fourth check */
  function syncAll() { lessons().forEach(function (l) { if (l) syncChecks(l.id); }); }

  /* ---------------- firsts ---------------- */
  var FIRSTS = { work: "First study saved", words: "First words written", drawing: "First drawing saved", promoted: "First piece promoted", project: "First project finished", redo: "First redo" };
  function first(k) { var st = S(); if (FIRSTS[k] && !st.firsts[k]) st.firsts[k] = Date.now(); }
  function firsts() { var f = peek().firsts; return Object.keys(FIRSTS).filter(function (k) { return f[k]; }).map(function (k) { return { key: k, t: FIRSTS[k], at: f[k] }; }); }

  /* ---------------- derived reads (a render writes nothing) ---------------- */
  function started() { var c = peek(); return Object.keys(c.works).length > 0 || Object.keys(c.lessons).length > 0; }
  /* unitState(uid) → { state: done | current | ahead | outline, done, total, next } */
  function unitState(uid) {
    var u = unit(uid); if (!u) return { state: "outline", done: 0, total: 0, next: null };
    if (!u.lessons.length) return { state: "outline", done: 0, total: 0, next: null };
    var d = u.lessons.filter(done).length, next = u.lessons.filter(function (id) { return !done(id); })[0] || null;
    var cur = trackPlace(u.track);
    return { state: d === u.lessons.length ? "done" : cur && cur.unit === uid ? "current" : "ahead", done: d, total: u.lessons.length, next: next ? lesson(next) : null };
  }
  /* trackPlace(tid) → the unit and lesson you are on in a track: the first lesson touched and not
     done, else the first not done; null for a track never started */
  function trackPlace(tid) {
    var ls = lessons(tid), c = peek();
    if (!ls.some(function (l) { return c.lessons[l.id] || worksOf(function (w) { return w.lesson === l.id; }).length; })) return null;
    var cur = ls.filter(function (l) { return !done(l.id); })[0] || null;
    if (!cur) { var last = ls[ls.length - 1]; return { unit: last.unit, lesson: last.id, index: unit(last.unit).n - 1, finished: true }; }
    return { unit: cur.unit, lesson: cur.id, index: unit(cur.unit).n - 1, finished: false };
  }
  /* the next study in path order: the first study of an unfinished lesson with nothing saved (or
     not yet passed), in the track you are on */
  function nextStudy(tid) {
    var ls = lessons(tid);
    for (var i = 0; i < ls.length; i++) {
      var l = ls[i];
      for (var j = 0; j < (l.studies || []).length; j++) {
        var s = l.studies[j];
        if (!studyPassed(l.id, s.id)) return { lesson: l, study: s, saved: studyWorks(l.id, s.id).length > 0 };
      }
    }
    return null;
  }
  function currentTrack() {
    var u = store.state.ui.creatives || {};
    if (u.track && track(u.track) && lessons(u.track).length) return u.track;
    var withPlace = C().TRACKS.filter(function (t) { return trackPlace(t.id) && !trackPlace(t.id).finished; })[0];
    if (withPlace) return withPlace.id;
    var any = C().TRACKS.filter(function (t) { return lessons(t.id).length; })[0];
    return any ? any.id : "write";
  }
  function cardsDue() {
    var t = today(), n = 0;
    lessons().forEach(function (l) { cardKeys(l.id).forEach(function (k) { var m = KOS.srs.peek(k); if (m && m.due && m.due <= t && !m.leech) n++; }); });
    return n;
  }
  /* the Daily Creative (§5.1): computed from the date and the evidence, never stored, the same all
     day. One study (or a project milestone) and the due cards, sized to the minutes. It pauses in
     Exam Season (on by default) and appears only on the chosen days. */
  function planDay(day) {
    var d = day || today(), p = prefs(), dow = new Date(d + "T12:00:00").getDay();
    var season = KOS.exams && KOS.exams.season ? KOS.exams.season(d) : null;
    var due = Math.min(10, cardsDue()), cardMin = Math.max(due ? 2 : 0, Math.round(due * 0.75));
    var out = { day: d, minutes: p.minutes, cards: due, cardMin: cardMin, study: null, project: null, state: "today", season: season && season.on ? season : null };
    if (p.examPause && season && season.on) { out.state = "paused"; out.back = season.last ? season.last.date : null; return out; }
    if (!p.days[dow]) {
      out.state = "rest";
      for (var i = 1; i <= 7; i++) { if (p.days[(dow + i) % 7]) { out.nextDay = (dow + i) % 7; break; } }
      return out;
    }
    var tid = currentTrack(), ns = nextStudy(tid);
    if (ns) out.study = { lesson: ns.lesson.id, study: ns.study.id, t: ns.study.t, min: ns.study.min, saved: ns.saved, tool: ns.study.tool };
    else {
      var proj = C().TRACKS.reduce(function (a, t) { return a || t.units.map(projectState).filter(function (x) { return x && x.offered && !x.done; })[0]; }, null);
      if (proj) out.project = proj;
    }
    if (!out.study && !out.project && !due) out.state = "clear";
    out.total = cardMin + (out.study ? out.study.min : out.project ? 20 : 0);
    return out;
  }
  function weekMinutes() {
    var t = today(), from = KOS.srs.addDays(t, -6), m = 0;
    store.state.sessions.forEach(function (e) {
      if (e.date < from || e.date > t || e.type !== "focus") return;
      (KOS.sessions.parts ? KOS.sessions.parts(e) : [e]).forEach(function (p) { if (p.subject === SID) m += (p.secs || 0) / 60; });
    });
    return Math.round(m);
  }
  /* stats() → the desk's figures, derived once (invariant 26d) */
  function stats() {
    var ls = lessons(), c = peek(), units = [];
    C().TRACKS.forEach(function (t) { t.units.forEach(function (u) { if (C().UNITS[u].project && C().UNITS[u].lessons.length) units.push(u); }); });
    var all = worksOf();
    var redoDue = null;
    return {
      lessons: ls.length, done: ls.filter(function (l) { return done(l.id); }).length,
      checks: all.filter(function (w) { return w.check && w.check.pass; }).length,
      projects: units.length, projectsDone: units.filter(function (u) { var s = projectState(u); return s && s.done; }).length,
      due: cardsDue(), studies: all.length, portfolio: all.filter(function (w) { return w.portfolio; }).length,
      words: all.reduce(function (a, w) { return a + (w.words || 0); }, 0), week: weekMinutes(), redo: redoDue,
      paid: Object.keys(c.paid).length
    };
  }

  /* ---------------- a critique on request (31r, invariant 155) ----------------
     Kurenai critiques, never creates. critiqueRequest(wid, file) is pure: the exact request one
     press sends — the piece (a picture, or the text up to EXCERPT words), the study's brief, the
     unit and its ONE skill, the "Good for this unit" text and the instruction — and the dialog
     prints exactly its sections. The reply is two parts only (what worked, one thing to try); one
     that strays into a later skill or a professional comparison is refused (stray). A critique
     pays nothing, rates nothing and moves no check. */
  var EXCERPT = 600;
  var CRIT_SYSTEM = "You are Kurenai, a kind critic inside KurenaiOS, for a complete beginner learning a creative skill for fun. British English, plain prose, no markdown. You critique; you never rewrite, finish or produce any part of the piece. Reply with JSON only.";
  function critiqueOf(wid) {
    var w = work(wid); if (!w) return null;
    var L = w.lesson ? lesson(w.lesson) : null, s = L ? study(L.id, w.study) : null, u = L ? unit(L.unit) : null, t = u ? track(u.track) : null;
    if (!L || !s || !u || !t || !L.check) return null;
    return { w: w, L: L, s: s, u: u, t: t };
  }
  /* the first EXCERPT words, cut at a word with the piece's own line breaks kept */
  function excerpt(text) {
    var t = String(text || "").trim(), re = /\S+/g, m, n = 0, end = t.length;
    while ((m = re.exec(t))) { n++; if (n === EXCERPT) end = m.index + m[0].length; }
    return { text: n > EXCERPT ? t.slice(0, end) : t, cut: n > EXCERPT, words: n };
  }
  function critiqueRequest(wid, file) {
    var c = critiqueOf(wid); if (!c || !file || !(file.dataUrl || file.text)) return null;
    var L = c.L, unitName = c.t.name + " " + c.u.n;
    var later = (L.check.ignore || []).map(function (x) { return x[0] + " (" + x[1] + ")"; });
    var image = file.dataUrl ? String(file.dataUrl).replace(/^data:[^,]*,/, "") : null;
    var mime = file.dataUrl ? (String(file.dataUrl).match(/^data:([^;,]+)/) || [])[1] || "image/png" : null;
    var ex = image ? null : excerpt(file.text);
    var brief = c.s.t + (c.s.give ? " — given: " + c.s.give : "") + (c.s.vary ? "; your part: " + c.s.vary : "");
    var skill = L.check.skill.charAt(0).toLowerCase() + L.check.skill.slice(1);
    var instruction = "Judge only " + skill + " at this level. Ignore every later skill" + (later.length ? ": " + later.join(", ") : "") +
      ". Never compare with professional work. Say what worked against this unit's bar, then ONE thing to try on the next rep.";
    var sections = [
      { h: "The piece", text: image ? "Your picture, as saved" : "Your text, " + (ex.cut ? "the first " + EXCERPT + " of its " + ex.words + " words" : ex.words + (ex.words === 1 ? " word" : " words")) + " (its title is not sent)" },
      { h: "The brief", text: L.id + "·" + c.s.id + " " + brief },
      { h: "The unit", text: unitName + " · " + c.u.name + " · the one skill: " + L.check.skill },
      { h: "The bar", text: "“" + L.check.good + "”" },
      { h: "The instruction", text: instruction }
    ];
    var prompt = "UNIT: " + unitName + " (" + c.u.name + ")\nTHE ONE SKILL: " + L.check.skill + "\nGOOD FOR THIS UNIT: " + L.check.good +
      "\nTHE BRIEF: " + brief + "\n\n" + instruction +
      (image ? "\n\nThe picture is the learner's piece." : "\n\nTHE PIECE:\n" + ex.text) +
      "\n\nReturn {\"worked\": \"two or three sentences on what worked against this unit's bar\", \"next\": \"ONE thing to try on the next rep, one or two sentences\"}.";
    return { sections: sections, instruction: instruction, system: CRIT_SYSTEM, prompt: prompt, image: image, mime: mime, imageUrl: file.dataUrl || null,
      text: ex ? ex.text : null, notSent: "the piece's title, your other studies, your Practice Log, your Portfolio, your check and its note, and your name." };
  }
  var STRAY_STOP = /^(whether|about|their|which|later|units?|depth|looks?|point|view|story|things?|choosing|making|other)$/;
  /* stray(reply, lesson) — true when a reply reaches past this unit: it names a later skill from
     the lesson's "ignore" list (a word of it the unit's own bar does not use) or compares with
     professionals. Pure. */
  function stray(reply, lid) {
    var L = lesson(lid); if (!L || !L.check) return false;
    var text = String((reply && (reply.worked + " " + reply.next)) || reply || "").toLowerCase();
    if (/\bprofessional|\bthe pros\b|\bexpert/.test(text)) return true;
    var own = (L.check.skill + " " + L.check.good + " " + (L.skill || "")).toLowerCase();
    return (L.check.ignore || []).some(function (x) {
      return (String(x[0]).toLowerCase().match(/[a-z]{5,}/g) || []).some(function (wd) {
        if (STRAY_STOP.test(wd) || own.indexOf(wd.slice(0, 5)) >= 0) return false;
        return new RegExp("\\b" + wd.slice(0, Math.max(5, wd.length - 2))).test(text);
      });
    });
  }
  /* the reply: kept on the work only by "Keep with this rep"; pinned to the study's next rep only
     by "Try it on the next rep" (per device). Neither pays (invariant 154). */
  function keepCritique(wid, r) {
    var w = S().works[wid]; if (!w || !r || !r.worked) return null;
    w.critique = { worked: String(r.worked).slice(0, 600), next: String(r.next || "").slice(0, 400), at: Date.now() };
    store.save();
    return w.critique;
  }
  function pinTip(lid, sid, text) {
    var u = U(); u.tips = obj(u.tips);
    if (text) u.tips[lid + "." + sid] = { text: String(text).slice(0, 400), at: Date.now() }; else delete u.tips[lid + "." + sid];
    store.save();
  }
  function tip(lid, sid) { var t = obj((store.state.ui.creatives || {}).tips)[lid + "." + sid]; return t && t.text ? t : null; }

  /* ---------------- pay (the Governor's one definition, invariant 154) ---------------- */
  function award(m) {
    m = m || {};
    if (!m.first) return { xp: 0, gold: 0, hp: 0 };
    if (m.kind === "study") return Object.assign({}, STUDY_PAY);
    if (m.kind === "drill") return Object.assign({}, DRILL_PAY);
    if (m.kind === "project") return Object.assign({}, PROJECT_PAY);
    return { xp: 0, gold: 0, hp: 0 };
  }

  /* ---------------- the store for files (kurenai-os-creatives) ----------------
     One object store, "files", keyed by a work's id (or "doc:<id>" for a Writing Desk draft):
     { id, text | dataUrl, versions: [{at, text, words}], at }. Local first, in the full backup,
     never in the state document (invariant 156). */
  var DB_NAME = "kurenai-os-creatives", DB_VER = 1, dbp = null;
  var files = {
    available: function () { return !!window.indexedDB; },
    open: function (cb) {
      if (!files.available()) { cb(new Error("IndexedDB unavailable")); return; }
      if (dbp) { cb(null, dbp); return; }
      var rq = window.indexedDB.open(DB_NAME, DB_VER);
      rq.onupgradeneeded = function () { var db = rq.result; if (!db.objectStoreNames.contains("files")) db.createObjectStore("files", { keyPath: "id" }); };
      rq.onsuccess = function () { dbp = rq.result; cb(null, dbp); };
      rq.onerror = function () { cb(rq.error || new Error("open failed")); };
    },
    tx: function (mode, fn, cb) {
      files.open(function (err, db) {
        if (err) { if (cb) cb(err); return; }
        var t = db.transaction("files", mode), os = t.objectStore("files"), out = fn(os);
        t.oncomplete = function () { if (cb) cb(null, out && "result" in out ? out.result : undefined); };
        t.onerror = function () { if (cb) cb(t.error); };
      });
    },
    put: function (id, payload, cb) {
      var rec = Object.assign({ id: id, at: Date.now() }, typeof payload === "string" ? { text: payload } : payload);
      files.tx("readwrite", function (os) { os.put(rec); }, cb);
    },
    get: function (id, cb) { files.tx("readonly", function (os) { return os.get(id); }, function (err, r) { cb(err, r || null); }); },
    del: function (id, cb) { files.tx("readwrite", function (os) { os.delete(id); }, cb); },
    all: function (cb) { files.tx("readonly", function (os) { return os.getAll(); }, function (err, r) { cb(err, r || []); }); },
    exportAll: function (cb) { if (!files.available()) { cb(null, null); return; } files.all(function (err, rows) { cb(err, err ? null : { files: rows }); }); },
    importAll: function (dump, cb) {
      var rows = (dump && dump.files) || [];
      files.tx("readwrite", function (os) { os.clear(); rows.forEach(function (r) { if (r && r.id) os.put(r); }); }, function (err) { cb(err, { files: rows.length }); });
    }
  };

  /* opened once at load, so an export or a page reads it without waiting on the open */
  if (files.available()) files.open(function () {});

  KOS.creatives = {
    SID: SID, CHECKS: CHECKS, STUDY_PAY: STUDY_PAY, DRILL_PAY: DRILL_PAY, PROJECT_PAY: PROJECT_PAY,
    normalise: normalise, peek: peek, ui: U, prefs: prefs, setPrefs: setPrefs, settings: settings,
    lesson: lesson, unit: unit, track: track, tracks: tracks, lessons: lessons, trackOf: trackOf, study: study, content: content, pagesOf: pagesOf,
    markPage: markPage, works: worksOf, work: work, addWork: addWork, editWork: editWork, removeWork: removeWork,
    promote: promote, portfolio: portfolio, setCheck: setCheck, logDrill: logDrill, studyWorks: studyWorks, studyPassed: studyPassed,
    project: project, projectState: projectState, markMilestone: markMilestone,
    evidence: evidence, done: done, syncChecks: syncChecks, syncAll: syncAll, cardKeys: cardKeys, cardHeld: cardHeld,
    firsts: firsts, started: started, unitState: unitState, trackPlace: trackPlace, nextStudy: nextStudy, currentTrack: currentTrack,
    cardsDue: cardsDue, planDay: planDay, stats: stats, award: award, files: files,
    EXCERPT: EXCERPT, critiqueOf: critiqueOf, critiqueRequest: critiqueRequest, stray: stray, keepCritique: keepCritique, pinTip: pinTip, tip: tip, words: function (t) { return (String(t || "").match(/[A-Za-z0-9À-ɏ぀-ヿ一-鿿'’-]+/g) || []).length; }
  };
})();
