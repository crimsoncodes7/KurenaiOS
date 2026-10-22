/* Kurenai OS — core/ja.js (KOS.ja)
   The Japanese model (roadmap 5.5, docs/japanese-plan.md §8–§11; design turn 28).

   WHAT IS STORED (state.japanese, synced; every part a keyed map so the cloud merge folds two
   devices per key, invariant 33):
     facets[item|skill]   the facet's memory (KOS.jaSrs: s, d, ivl, due, last, reps, lapses, firstAt)
     lessons[id]          { pages: {i: ts}, startAt, doneAt, paidAt }   evidence only
     checkpoints[id]      { scores: {R, W, L, S}, at, passAt, paidAt }
     mined[id]            { text, reading, en, src: {kind, title}, at }  a line kept to study
     input[YYYY-MM-DD]    { read, listen, raw, jpSub }  minutes — tallies, never text
     settings             { furigana, dailyMin, speech }
   Per device (state.ui.japanese): view choices and drafts.

   WHAT IS DERIVED, never stored: grades (from the check, invariant 113), the day's plan (from the
   date and the facets), skill figures, the timeline (a range, never a promise), every desk figure.
   A render writes nothing.

   WHAT PAYS (award(), the one definition the Governor calls, type "ja"):
     a review session          +1 XP for each facet passed (Hard or better), at most 30 a day
     a lesson's first finish   15 XP, 2 gold, +3 HP — once
     a unit checkpoint passed  60 XP, 15 gold, +5 HP — once (every skill at 80% or more)
     a stage gate passed       150 XP, 40 gold, +10 HP — once
   A self-marked result (shadowing) moves no schedule and pays nothing. Immersion pays only
   through Focus (decision G). HP gates nothing (invariant 2).                                  */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;

  var SID = "ja";
  var REVIEW_XP = 1, REVIEW_CAP = 30;
  var LESSON_PAY = { xp: 15, gold: 2, hp: 3 }, CHECK_PAY = { xp: 60, gold: 15, hp: 5 }, GATE_PAY = { xp: 150, gold: 40, hp: 10 };
  var PASS = 0.8;
  // a first try inside this time grades Easy (ms)
  var TARGET = { R: 4000, L: 6000, W: 12000, S: 15000, H: 15000 };
  var FURIGANA = ["all", "unknown", "none"];

  function J() { return window.KOS_JA || { STAGES: [], LESSONS: {}, ITEMS: {}, CHECKPOINTS: {} }; }
  function T() { return KOS.jaSrs; }
  function today() { return KOS.srs.todayISO(); }

  /* ---------------- the gate ---------------- */
  function obj(v) { return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
  function settings(s) {
    s = obj(s);
    return {
      furigana: FURIGANA.indexOf(s.furigana) >= 0 ? s.furigana : "unknown",
      dailyMin: Math.min(120, Math.max(15, Math.round(+s.dailyMin) || 40)),
      speech: !!s.speech
    };
  }
  function normalise(j) {
    j = obj(j);
    return {
      v: 1,
      facets: obj(j.facets), lessons: obj(j.lessons), checkpoints: obj(j.checkpoints),
      mined: obj(j.mined), input: obj(j.input), settings: settings(j.settings)
    };
  }
  function S() {
    var st = store.state;
    if (!st.japanese || st.japanese.v !== 1 || !st.japanese.facets) st.japanese = normalise(st.japanese);
    return st.japanese;
  }
  /* a read never writes: callers that only look use peek() */
  function peek() { var j = store.state.japanese; return j && j.v === 1 && j.facets ? j : normalise(j); }
  function U() {
    var ui = store.state.ui;
    if (!ui.japanese || typeof ui.japanese !== "object") ui.japanese = {};
    return ui.japanese;
  }

  /* ---------------- the curriculum, read ---------------- */
  function item(key) { return J().ITEMS[key] || null; }
  function lesson(id) { return J().LESSONS[id] || null; }
  function lessons() {
    var out = [];
    (J().STAGES || []).forEach(function (st) { (st.units || []).forEach(function (u) { (u.lessons || []).forEach(function (id) { if (lesson(id)) out.push(lesson(id)); }); }); });
    return out;
  }
  var PRODUCE = null;
  function produces(key) {
    if (!PRODUCE) { PRODUCE = {}; Object.keys(J().LESSONS).forEach(function (id) { (J().LESSONS[id].produce || []).forEach(function (k) { PRODUCE[k] = 1; }); }); }
    return !!PRODUCE[key];
  }
  function opts(key) {
    return { produces: produces, deep: function () { return false; }, w: KOS.srs.weights(), retention: KOS.srs.retention(), seed: "ja:" + key + "|" + today() };
  }

  /* ---------------- learning and reviewing ---------------- */
  /* startLesson(id): the lesson's items get their first facets, due today; evidence only */
  function startLesson(id) {
    var l = lesson(id); if (!l) return [];
    var st = S(), before = Object.keys(st.facets).length, t = today();
    (l.items || []).forEach(function (k) { st.facets = T().introduce(st.facets, k, t, opts(k)); });
    var rec = st.lessons[id] = obj(st.lessons[id]);
    if (!rec.startAt) rec.startAt = Date.now();
    store.save();
    return Object.keys(st.facets).slice(before);
  }
  /* markPage(id, i): a page read (the page decides the dwell, as Code's) */
  function markPage(id, i) {
    var rec = S().lessons[id] = obj(S().lessons[id]);
    rec.pages = obj(rec.pages);
    if (!rec.pages[i]) { rec.pages[i] = Date.now(); store.save(); }
  }

  /* record(facetKey, result) → { grade, facet, unlocked } — one answer, scheduled. result is the
     validator's: { verdict, hints, ms, selfMarked }. A self-marked result moves nothing. */
  function record(k, result) {
    var st = S(), p = T().split(k), g = T().gradeOf(result, (item(p.item) && item(p.item).targetMs) || TARGET[p.skill]);
    if (g == null) return { grade: null, facet: st.facets[k] || null, unlocked: [] };
    var o = opts(k), before = st.facets[k] || {};
    var f = T().review(before, g, today(), o);
    st.facets[k] = f;
    var keys = Object.keys(st.facets).length;
    st.facets = T().unlock(st.facets, p.item, today(), o);
    if (KOS.reviewLog && KOS.reviewLog.available()) {
      KOS.reviewLog.add({ key: "ja:" + k, ts: Date.now(), day: today(), g: g, el: before.last ? T().days(before.last, today()) : 0,
        s0: before.reps ? before.s : null, d0: before.reps ? before.d : null, s1: f.s, d1: f.d, ivl: f.ivl, src: "ja" });
    }
    store.save();
    return { grade: g, facet: f, unlocked: Object.keys(st.facets).slice(keys) };
  }

  /* paidToday() → review XP already paid today, from today's ledger */
  function paidToday() {
    var t = today();
    return KOS.sessions.all().reduce(function (n, e) {
      return n + (e.date === t && e.type === "ja" && e.metrics && e.metrics.kind === "session" ? (e.metrics.paid || 0) : 0);
    }, 0);
  }
  /* finishSession(results) — ONE ledger entry for a session (invariant 5).
     results: [{ key, grade }] as record() returned them. → { passed, paid, capped } */
  function finishSession(results, o) {
    o = o || {};
    var graded = (results || []).filter(function (r) { return r && r.grade; });
    if (!graded.length) return { passed: 0, paid: 0, capped: false };
    var passed = graded.filter(function (r) { return r.grade > 1; }).length;
    var room = Math.max(0, REVIEW_CAP - paidToday()), paid = Math.min(room, passed * REVIEW_XP);
    var skills = {};
    graded.forEach(function (r) { var s = T().split(r.key).skill; skills[s] = (skills[s] || 0) + 1; });
    KOS.sessions.log({ type: "ja", subject: SID, ref: o.lesson || null,
      metrics: { kind: "session", n: graded.length, passed: passed, paid: paid, capped: paid < passed * REVIEW_XP, skills: skills, lesson: o.lesson || null } });
    return { passed: passed, paid: paid, capped: paid < passed * REVIEW_XP };
  }

  /* finishLesson(id): the lesson's learn session is done; pays once */
  function finishLesson(id) {
    var l = lesson(id); if (!l) return null;
    var rec = S().lessons[id] = obj(S().lessons[id]);
    if (!rec.doneAt) rec.doneAt = Date.now();
    if (rec.paidAt) { store.save(); return { paid: false, why: "already finished", at: rec.paidAt }; }
    rec.paidAt = Date.now();
    KOS.sessions.log({ type: "ja", subject: SID, ref: id, metrics: { kind: "lesson", id: id, first: true } });
    return { paid: true, pay: LESSON_PAY };
  }

  /* recordCheckpoint(id, scores) — scores { R, W, L, S } as fractions; passes at 80% in every skill
     the checkpoint tests; pays once; retaken freely */
  function recordCheckpoint(id, scores) {
    var cp = (J().CHECKPOINTS || {})[id]; if (!cp) return null;
    var rec = S().checkpoints[id] = obj(S().checkpoints[id]);
    var skills = cp.skills || ["R", "W", "L", "S"], sc = {};
    skills.forEach(function (s) { sc[s] = Math.max(0, Math.min(1, +(scores || {})[s] || 0)); });
    var pass = skills.every(function (s) { return sc[s] >= PASS; });
    rec.scores = sc; rec.at = Date.now();
    var out = { pass: pass, weak: skills.filter(function (s) { return sc[s] < PASS; }), paid: false };
    if (pass && !rec.passAt) rec.passAt = Date.now();
    if (pass && !rec.paidAt) {
      rec.paidAt = Date.now();
      KOS.sessions.log({ type: "ja", subject: SID, ref: id, metrics: { kind: cp.gate ? "gate" : "checkpoint", id: id, first: true } });
      out.paid = true; out.pay = cp.gate ? GATE_PAY : CHECK_PAY;
    } else store.save();
    return out;
  }

  /* award(metrics) — what a ledger entry pays (the Governor's one call) */
  function award(m) {
    m = m || {};
    if (m.kind === "session") return { xp: Math.max(0, Math.min(REVIEW_CAP, m.paid || 0)), gold: 0, hp: 0 };
    if (m.kind === "lesson" && m.first && lesson(m.id)) return Object.assign({}, LESSON_PAY);
    if (m.kind === "checkpoint" && m.first) return Object.assign({}, CHECK_PAY);
    if (m.kind === "gate" && m.first) return Object.assign({}, GATE_PAY);
    return { xp: 0, gold: 0, hp: 0 };
  }

  /* ---------------- mining and input ---------------- */
  function hash(s) { var x = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  /* mine(line) — keep a line to study; it becomes a reading facet (and listening with audio) */
  function mine(line) {
    var text = String((line && line.text) || "").trim(); if (!text) return null;
    var id = "m" + hash(text).toString(36), st = S();
    if (!st.mined[id]) {
      st.mined[id] = { text: text, reading: line.reading || null, en: line.en || null, src: obj(line.src), at: Date.now() };
      var k = "x:" + id;
      st.facets = T().introduce(st.facets, k, today(), opts(k));
      store.save();
    }
    return id;
  }
  /* addInput(kind, minutes, day) — read · listen · raw · jpSub; tallies only */
  function addInput(kind, mins, day) {
    if (["read", "listen", "raw", "jpSub"].indexOf(kind) < 0 || !(mins > 0)) return;
    var d = day || today(), rec = S().input[d] = obj(S().input[d]);
    rec[kind] = Math.round(((rec[kind] || 0) + mins) * 10) / 10;
    store.save();
  }
  function setSettings(patch) { var st = S(); st.settings = settings(Object.assign({}, st.settings, patch)); store.save(); return st.settings; }

  /* ---------------- derived reads (a render writes nothing) ---------------- */
  function due(t) { var j = peek(); return T().queue(j.facets, t || today(), KOS.srs.weights()); }

  /* nextLesson() → the first lesson not yet finished, in path order */
  function nextLesson() {
    var j = peek();
    return lessons().filter(function (l) { return !(j.lessons[l.id] && j.lessons[l.id].doneAt); })[0] || null;
  }

  /* planDay(t) → the day's four blocks (§2), computed, never stored. Input is never cut; when
     reviews run long, new material shrinks. */
  function planDay(t) {
    t = t || today();
    var j = peek(), daily = j.settings.dailyMin;
    var input = daily >= 40 ? 8 : 5, output = daily >= 40 ? 7 : 5;
    var b = T().newBudget(j.facets, t, { dailyMin: daily, inputMin: input, outputMin: output });
    var queue = T().queue(j.facets, t, KOS.srs.weights());
    var next = nextLesson(), newMin = next ? Math.max(0, Math.round(daily - input - output - b.reviewMin)) : 0;
    return {
      day: t, dailyMin: daily,
      reviews: { n: queue.length, min: Math.round(b.reviewMin) },
      learn: next ? { lesson: next.id, title: next.title, min: newMin, items: b.newItems, heavy: b.newItems < 6 } : null,
      input: { min: input }, output: { min: output },
      total: Math.round(b.reviewMin + (next ? newMin : 0) + input + output)
    };
  }

  /* skills() → per skill { started, stable }, plus kana and kanji read — derived once (26d) */
  function skills() {
    var j = peek(), sk = T().skills(j.facets), kana = 0, kanji = 0, words = { R: 0, L: 0, W: 0, S: 0 };
    Object.keys(j.facets).forEach(function (k) {
      var f = j.facets[k], p = T().split(k); if (!f.reps) return;
      if (p.kind === "k" && p.skill === "R" && f.s >= T().STABLE) kana++;
      if (p.kind === "j" && p.skill === "R" && f.s >= T().STABLE) kanji++;
      if (p.kind === "w" && f.s >= T().STABLE) words[p.skill]++;
    });
    return { skills: sk, kanaRead: kana, kanjiRead: kanji, words: words };
  }

  /* ---------------- the timeline (§10.2): a range, never a promise ---------------- */
  // the 92 basic kana: 46 hiragana and 46 katakana, without small or combined ones
  var BASIC = /^[あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン]$/;
  var MILESTONES = [
    { id: "kana", title: "Read all kana fluently", kana: 92 },
    { id: "reader1", title: "Graded reader Level 1", words: 300 },
    { id: "yotsuba", title: "Yotsuba&! with a dictionary", words: 1200 },
    { id: "jpsubs", title: "Slice-of-life anime with Japanese subtitles", words: 2500 },
    { id: "shounen", title: "Shounen manga (furigana)", words: 4000 },
    { id: "vn", title: "A visual novel with lookup", words: 4000 },
    { id: "raw", title: "Easy anime, raw", words: 5000 },
    { id: "ln", title: "A light novel", words: 8000 }
  ];
  /* timeline(t) → { calibrating, perWeek: {lo, mid, hi}, milestones: [{ id, title, need, have, done,
     from, to }] }. Rates are words met (R facets started) a week over the last four complete weeks;
     the range is the mean ± one standard deviation (at least ±15%). Under two weeks of history it
     says "calibrating" and projects nothing (invariant 117). */
  function timeline(t) {
    t = t || today();
    var j = peek(), firsts = [], kanaHeld = 0, first = null;
    Object.keys(j.facets).forEach(function (k) {
      var f = j.facets[k], p = T().split(k);
      if (!f.reps || p.skill !== "R") return;
      if (!first || f.firstAt < first) first = f.firstAt;
      if (p.kind === "w") firsts.push(f.firstAt);
      // a basic kana (not combined, not small) whose reading holds a week
      if (p.kind === "k" && BASIC.test(p.item.slice(2)) && f.s >= T().HOLD) kanaHeld++;
    });
    var span = first ? T().days(first, t) : 0, have = firsts.length;
    var weeks = [0, 0, 0, 0];
    firsts.forEach(function (d) { var ago = T().days(d, t); if (ago >= 0 && ago < 28) weeks[Math.floor(ago / 7)]++; });
    var full = Math.max(1, Math.min(4, Math.floor(span / 7)));
    var sample = weeks.slice(0, full), mean = sample.reduce(function (a, b) { return a + b; }, 0) / full;
    var sd = Math.sqrt(sample.reduce(function (a, b) { return a + (b - mean) * (b - mean); }, 0) / full);
    sd = Math.max(sd, mean * 0.15);
    var calibrating = span < 14 || mean <= 0;
    var lo = Math.max(0.1, mean - sd), hi = mean + sd;
    return {
      calibrating: calibrating, since: first, perWeek: calibrating ? null : { lo: Math.round(lo), mid: Math.round(mean), hi: Math.round(hi) },
      milestones: MILESTONES.map(function (m) {
        var need = m.words || m.kana, got = m.kana ? kanaHeld : have, done = got >= need;
        var out = { id: m.id, title: m.title, need: need, have: got, unit: m.kana ? "kana" : "words", done: done, from: null, to: null };
        if (!done && !calibrating && !m.kana) {
          out.from = T().addDays(t, Math.ceil((need - got) / hi * 7));
          out.to = T().addDays(t, Math.ceil((need - got) / lo * 7));
        }
        return out;
      })
    };
  }

  KOS.ja = {
    SID: SID, normalise: normalise, item: item, lesson: lesson, lessons: lessons, produces: produces,
    startLesson: startLesson, markPage: markPage, record: record, finishSession: finishSession, finishLesson: finishLesson,
    recordCheckpoint: recordCheckpoint, award: award, paidToday: paidToday,
    mine: mine, addInput: addInput, setSettings: setSettings,
    due: due, nextLesson: nextLesson, planDay: planDay, skills: skills, timeline: timeline,
    peek: peek, ui: U,
    PAY: { review: REVIEW_XP, reviewCap: REVIEW_CAP, lesson: LESSON_PAY, checkpoint: CHECK_PAY, gate: GATE_PAY }, PASS: PASS, MILESTONES: MILESTONES
  };
})();
